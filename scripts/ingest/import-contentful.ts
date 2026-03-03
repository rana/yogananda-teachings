/**
 * Contentful import: book.json → Contentful Management API (DES-005 Step 3.5)
 *
 * Creates Book → Chapter → Section → TextBlock entries in Contentful,
 * one TextBlock per paragraph. Outputs a mapping file linking Contentful
 * entry IDs to paragraph sequence numbers for use by ingest.ts.
 *
 * Usage:
 *   npx tsx scripts/ingest/import-contentful.ts --book <slug> [--dry-run] [--resume-from-chapter <N>]
 *
 * Requires: CONTENTFUL_SPACE_ID, CONTENTFUL_MANAGEMENT_TOKEN
 *
 * Governing refs: ADR-010, DES-004, DES-005
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import contentful from "contentful-management";

// ── Configuration (ADR-123) ──────────────────────────────────────

const CONTENTFUL_ENVIRONMENT = "master";
const API_DELAY_MS = 150; // Contentful rate limit: 7 req/s. 150ms ≈ 6.7/s

// Book metadata not in book.json (shared with ingest.ts)
const BOOK_EXTRAS: Record<
  string,
  { publicationYear: number; bookstoreUrl: string }
> = {
  "autobiography-of-a-yogi": {
    publicationYear: 1946,
    bookstoreUrl:
      "https://bookstore.yogananda-srf.org/autobiography-of-a-yogi",
  },
  "autobiografia-de-un-yogui": {
    publicationYear: 1946,
    bookstoreUrl:
      "https://bookstore.yogananda-srf.org/autobiografia-de-un-yogui-autobiography-of-a-yogi-spanish",
  },
};

// ── Types ────────────────────────────────────────────────────────

interface BookJson {
  book: {
    title: string;
    author: string;
    publisher: string;
    asin: string;
    language: string;
    authorTier?: string;
    totalPages: number;
    totalChapters: number;
  };
  structure: {
    frontMatter: { pageRange: [number, number]; sections: string[] };
    chapters: {
      number: number;
      title: string;
      slug: string;
      pageRange: [number, number];
      dataFile: string;
    }[];
  };
}

interface Paragraph {
  text: string;
  pageNumber: number;
  formatting: { start: number; end: number; style: string }[];
  sequenceInChapter: number;
}

interface ChapterJson {
  chapterNumber: number;
  title: string;
  slug: string;
  pageRange: { start: number; end: number } | [number, number];
  sections: { heading: string | null; paragraphs: Paragraph[] }[];
  footnotes: Record<string, string>;
  metadata: Record<string, unknown>;
}

interface ContentfulMap {
  book: { slug: string; contentfulId: string };
  chapters: ChapterMapping[];
}

interface ChapterMapping {
  chapterNumber: number;
  contentfulId: string;
  sectionContentfulId: string;
  textBlocks: {
    sequenceInChapter: number;
    pageNumber: number;
    contentfulId: string;
  }[];
}

// ── Rich Text AST Conversion ─────────────────────────────────────

interface RichTextMark {
  type: string;
}

interface RichTextTextNode {
  nodeType: "text";
  value: string;
  marks: RichTextMark[];
  data: Record<string, never>;
}

interface RichTextParagraphNode {
  nodeType: "paragraph";
  data: Record<string, never>;
  content: RichTextTextNode[];
}

interface RichTextDocument {
  nodeType: "document";
  data: Record<string, never>;
  content: RichTextParagraphNode[];
}

/** Map extraction pipeline styles to Contentful Rich Text marks */
function styleToMarks(style: string): RichTextMark[] {
  switch (style) {
    case "italic":
      return [{ type: "italic" }];
    case "bold":
      return [{ type: "bold" }];
    case "bold-italic":
      return [{ type: "bold" }, { type: "italic" }];
    case "superscript":
      return [{ type: "superscript" }];
    case "underline":
      return [{ type: "underline" }];
    default:
      // small-caps, quote, reciprocity, empty string — no Rich Text equivalent
      return [];
  }
}

/** Convert a paragraph with formatting annotations to Contentful Rich Text AST */
function paragraphToRichText(paragraph: Paragraph): RichTextDocument {
  const text = paragraph.text;
  const formatting = paragraph.formatting
    .filter((f) => f.style && styleToMarks(f.style).length > 0)
    .sort((a, b) => a.start - b.start);

  const textNodes: RichTextTextNode[] = [];

  if (formatting.length === 0) {
    // No applicable formatting — single text node
    textNodes.push({
      nodeType: "text",
      value: text,
      marks: [],
      data: {},
    });
  } else {
    // Split text at formatting boundaries
    let cursor = 0;

    for (const fmt of formatting) {
      const start = Math.max(fmt.start, 0);
      const end = Math.min(fmt.end, text.length);

      // Text before this formatting range
      if (cursor < start) {
        textNodes.push({
          nodeType: "text",
          value: text.slice(cursor, start),
          marks: [],
          data: {},
        });
      }

      // Formatted text
      if (start < end) {
        textNodes.push({
          nodeType: "text",
          value: text.slice(start, end),
          marks: styleToMarks(fmt.style),
          data: {},
        });
      }

      cursor = end;
    }

    // Remaining text after last formatting
    if (cursor < text.length) {
      textNodes.push({
        nodeType: "text",
        value: text.slice(cursor),
        marks: [],
        data: {},
      });
    }
  }

  // Filter out empty text nodes
  const filteredNodes = textNodes.filter((n) => n.value.length > 0);

  return {
    nodeType: "document",
    data: {},
    content: [
      {
        nodeType: "paragraph",
        data: {},
        content:
          filteredNodes.length > 0
            ? filteredNodes
            : [{ nodeType: "text", value: " ", marks: [], data: {} }],
      },
    ],
  };
}

// ── Helpers ───────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function makeLink(entryId: string) {
  return { sys: { type: "Link" as const, linkType: "Entry" as const, id: entryId } };
}

/** Resolve the locale code for a book language from the Contentful space */
function resolveLocale(
  locales: { code: string; default: boolean }[],
  bookLanguage: string,
): string {
  // Exact match first (e.g., "en" → "en")
  const exact = locales.find((l) => l.code === bookLanguage);
  if (exact) return exact.code;

  // Prefix match (e.g., "en" → "en-US")
  const prefix = locales.find((l) => l.code.startsWith(bookLanguage + "-"));
  if (prefix) return prefix.code;

  // For non-default locale, try finding it
  const match = locales.find(
    (l) => l.code.toLowerCase().startsWith(bookLanguage.toLowerCase()),
  );
  if (match) return match.code;

  throw new Error(
    `No locale matching '${bookLanguage}' found. Available: ${locales.map((l) => l.code).join(", ")}`,
  );
}

// ── Main ─────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");

  // Parse --book <slug>
  const bookIdx = args.indexOf("--book");
  if (bookIdx === -1 || !args[bookIdx + 1]) {
    console.error(
      "Usage: npx tsx scripts/ingest/import-contentful.ts --book <slug> [--dry-run] [--resume-from-chapter <N>]",
    );
    process.exit(1);
  }
  const bookSlug = args[bookIdx + 1];

  // Parse --resume-from-chapter <N>
  const resumeIdx = args.indexOf("--resume-from-chapter");
  const resumeFromChapter = resumeIdx !== -1 ? parseInt(args[resumeIdx + 1]) : 0;

  const dataDir = join(import.meta.dirname, `../../data/book-ingest/${bookSlug}`);
  const extras = BOOK_EXTRAS[bookSlug];
  if (!extras) {
    console.error(`Unknown book slug: ${bookSlug}`);
    process.exit(1);
  }

  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const managementToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
  if (!spaceId || !managementToken) {
    console.error("CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN must be set.");
    process.exit(1);
  }

  // Read book metadata
  const bookJson: BookJson = JSON.parse(
    readFileSync(join(dataDir, "book.json"), "utf-8"),
  );
  const { book, structure } = bookJson;

  console.log(`\nContentful Import: ${book.title} by ${book.author}`);
  console.log(`  Language: ${book.language}`);
  console.log(`  Chapters: ${book.totalChapters}`);
  console.log(`  Dry run: ${dryRun}`);
  if (resumeFromChapter > 0) {
    console.log(`  Resuming from chapter: ${resumeFromChapter}`);
  }

  if (dryRun) {
    // Count entries that would be created
    let totalTextBlocks = 0;
    for (const chInfo of structure.chapters) {
      const chData: ChapterJson = JSON.parse(
        readFileSync(join(dataDir, chInfo.dataFile), "utf-8"),
      );
      for (const section of chData.sections) {
        totalTextBlocks += section.paragraphs.length;
      }
    }
    console.log(`\nWould create:`);
    console.log(`  1 Book entry`);
    console.log(`  ${structure.chapters.length} Chapter entries`);
    console.log(`  ${structure.chapters.length} Section entries`);
    console.log(`  ${totalTextBlocks} TextBlock entries`);
    console.log(`  Total: ${1 + structure.chapters.length * 2 + totalTextBlocks} entries`);
    console.log(
      `  Estimated time: ${Math.ceil((1 + structure.chapters.length * 2 + totalTextBlocks) * API_DELAY_MS / 60000)} minutes`,
    );
    return;
  }

  // Connect to Contentful
  const client = contentful.createClient({ accessToken: managementToken });
  const space = await client.getSpace(spaceId);
  const environment = await space.getEnvironment(CONTENTFUL_ENVIRONMENT);

  // Detect locale
  const localesResponse = await environment.getLocales();
  const locales = localesResponse.items.map((l) => ({
    code: l.code,
    default: l.default,
  }));
  const locale = resolveLocale(locales, book.language);
  console.log(`  Contentful locale: ${locale}`);
  console.log(`  Available locales: ${locales.map((l) => l.code).join(", ")}\n`);

  // Load or initialize mapping
  const mapPath = join(dataDir, "contentful-map.json");
  let contentfulMap: ContentfulMap;
  if (resumeFromChapter > 0 && existsSync(mapPath)) {
    contentfulMap = JSON.parse(readFileSync(mapPath, "utf-8"));
    console.log(`  Loaded existing mapping with ${contentfulMap.chapters.length} chapters.\n`);
  } else {
    contentfulMap = {
      book: { slug: bookSlug, contentfulId: "" },
      chapters: [],
    };
  }

  // Track all entry IDs for batch publish
  const allEntryIds: string[] = [];
  let totalCreated = 0;

  // Content model uses parent references (child → parent links):
  //   Book ← Chapter.book ← Section.chapter ← TextBlock.section
  // Creation order: top-down (Book → Chapter → Section → TextBlocks)

  // 1. Create Book entry first (parent of everything)
  let bookEntryId = contentfulMap.book.contentfulId;
  if (!bookEntryId) {
    console.log(`Creating Book entry...`);
    const bookEntry = await environment.createEntry("book", {
      fields: {
        title: { [locale]: book.title },
        author: { [locale]: book.author },
        authorTier: { [locale]: book.authorTier || "guru" },
        publicationYear: { [locale]: extras.publicationYear },
        isbn: { [locale]: book.asin },
        language: { [locale]: book.language },
        slug: { [locale]: bookSlug },
        bookstoreUrl: { [locale]: extras.bookstoreUrl },
      },
    });
    bookEntryId = bookEntry.sys.id;
    allEntryIds.push(bookEntryId);
    contentfulMap.book.contentfulId = bookEntryId;
    writeFileSync(mapPath, JSON.stringify(contentfulMap, null, 2));
    totalCreated++;
    console.log(`  Book entry: ${bookEntryId}`);
    await delay(API_DELAY_MS);
  } else {
    console.log(`Book entry already exists: ${bookEntryId}`);
    allEntryIds.push(bookEntryId);
  }

  // 2. Process each chapter top-down
  for (const chInfo of structure.chapters) {
    if (chInfo.number < resumeFromChapter) {
      // Skip already-imported chapters — collect their IDs for publish
      const existing = contentfulMap.chapters.find(
        (c) => c.chapterNumber === chInfo.number,
      );
      if (existing) {
        allEntryIds.push(existing.contentfulId);
        allEntryIds.push(existing.sectionContentfulId);
        for (const tb of existing.textBlocks) {
          allEntryIds.push(tb.contentfulId);
        }
      }
      continue;
    }

    const chData: ChapterJson = JSON.parse(
      readFileSync(join(dataDir, chInfo.dataFile), "utf-8"),
    );

    console.log(`Chapter ${chInfo.number}: ${chInfo.title}`);

    // 2a. Create Chapter entry (with book parent link)
    const chapterEntry = await environment.createEntry("chapter", {
      fields: {
        title: { [locale]: chInfo.title },
        chapterNumber: { [locale]: chInfo.number },
        book: { [locale]: makeLink(bookEntryId) },
        sortOrder: { [locale]: chInfo.number },
      },
    });
    allEntryIds.push(chapterEntry.sys.id);
    totalCreated++;
    await delay(API_DELAY_MS);

    // 2b. Create Section entry (with chapter parent link)
    const sectionEntry = await environment.createEntry("section", {
      fields: {
        heading: {
          [locale]: chData.sections[0]?.heading || `Chapter ${chInfo.number}`,
        },
        chapter: { [locale]: makeLink(chapterEntry.sys.id) },
        sortOrder: { [locale]: 1 },
      },
    });
    allEntryIds.push(sectionEntry.sys.id);
    totalCreated++;
    await delay(API_DELAY_MS);

    // 2c. Create TextBlock entries (with section parent link)
    const textBlockMappings: ChapterMapping["textBlocks"] = [];

    for (const section of chData.sections) {
      for (const para of section.paragraphs) {
        const richText = paragraphToRichText(para);

        // Build footnote metadata
        const footnoteMetadata: { marker: string; text: string }[] = [];
        if (chData.footnotes) {
          for (const fmt of para.formatting) {
            if (fmt.style === "superscript") {
              const marker = para.text.slice(fmt.start, fmt.end);
              if (chData.footnotes[marker]) {
                footnoteMetadata.push({
                  marker,
                  text: chData.footnotes[marker],
                });
              }
            }
          }
        }

        // Truncate for internalTitle (Contentful UI label)
        const plainSnippet = para.text.slice(0, 60).replace(/\n/g, " ");
        const internalTitle = `Ch${chInfo.number} P${para.sequenceInChapter}: ${plainSnippet}`;

        const fields: Record<string, Record<string, unknown>> = {
          internalTitle: { [locale]: internalTitle },
          content: { [locale]: richText },
          section: { [locale]: makeLink(sectionEntry.sys.id) },
          pageNumber: { [locale]: para.pageNumber },
          sortOrder: { [locale]: para.sequenceInChapter },
        };

        if (footnoteMetadata.length > 0) {
          fields.metadata = { [locale]: { footnotes: footnoteMetadata } };
        }

        const entry = await environment.createEntry("textBlock", { fields });
        textBlockMappings.push({
          sequenceInChapter: para.sequenceInChapter,
          pageNumber: para.pageNumber,
          contentfulId: entry.sys.id,
        });
        allEntryIds.push(entry.sys.id);
        totalCreated++;

        await delay(API_DELAY_MS);
      }
    }

    // Save chapter mapping incrementally
    contentfulMap.chapters.push({
      chapterNumber: chInfo.number,
      contentfulId: chapterEntry.sys.id,
      sectionContentfulId: sectionEntry.sys.id,
      textBlocks: textBlockMappings,
    });
    writeFileSync(mapPath, JSON.stringify(contentfulMap, null, 2));

    console.log(
      `  → 1 Chapter + 1 Section + ${textBlockMappings.length} TextBlocks (total: ${totalCreated})`,
    );
  }

  // 3. Publish all entries
  console.log(`\nPublishing ${allEntryIds.length} entries...`);
  let published = 0;
  let publishErrors = 0;

  for (const entryId of allEntryIds) {
    try {
      const entry = await environment.getEntry(entryId);
      await entry.publish();
      published++;

      if (published % 100 === 0) {
        console.log(`  Published ${published}/${allEntryIds.length}`);
      }
    } catch (err) {
      publishErrors++;
      const message = err instanceof Error ? err.message : String(err);
      console.error(`  Failed to publish ${entryId}: ${message}`);
    }

    await delay(API_DELAY_MS);
  }

  console.log(`\nDone.`);
  console.log(`  Created: ${totalCreated} entries`);
  console.log(`  Published: ${published}/${allEntryIds.length}`);
  if (publishErrors > 0) {
    console.log(`  Publish errors: ${publishErrors}`);
  }
  console.log(`  Mapping file: ${mapPath}`);
}

main().catch((err) => {
  console.error("Contentful import failed:", err);
  process.exit(1);
});
