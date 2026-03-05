/**
 * Contentful import: assembled chapters → Contentful Management API
 *
 * Creates Book → Chapter → Section → TextBlock entries in Contentful.
 * Each assembly section becomes a Contentful Section (scene breaks preserved).
 * Each paragraph becomes one TextBlock with its contentType.
 *
 * Greenfield data model (content structure vocabulary):
 *   Chapter   → epigraph, epigraphAttribution, rasa (new fields)
 *   Section   → one per assembly section (was: one per chapter)
 *   TextBlock → contentType (prose|verse|epigraph|dialogue|caption)
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

// ── Configuration ────────────────────────────────────────────────

const CONTENTFUL_ENVIRONMENT = "master";
const API_DELAY_MS = 150; // Contentful rate limit: 7 req/s → 150ms ≈ 6.7/s

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
  /** Content type from assembly — design system vocabulary */
  contentType?: string;
  /** Section index within chapter */
  sectionIndex?: number;
}

interface FootnoteJson {
  marker: string;
  text: string;
  pageNumber: number;
}

interface ChapterJson {
  chapterNumber: number;
  title: string;
  slug: string;
  pageRange: { start: number; end: number } | [number, number];
  sections: { heading: string | null; paragraphs: Paragraph[] }[];
  footnotes: FootnoteJson[] | Record<string, string>;
  epigraphText?: string;
  epigraphAttribution?: string;
  metadata: Record<string, unknown>;
}

interface ContentfulMap {
  book: { slug: string; contentfulId: string };
  chapters: ChapterMapping[];
}

interface SectionMapping {
  sectionIndex: number;
  heading: string | null;
  contentfulId: string;
}

interface ChapterMapping {
  chapterNumber: number;
  contentfulId: string;
  sections: SectionMapping[];
  textBlocks: {
    sequenceInChapter: number;
    pageNumber: number;
    contentfulId: string;
    contentType: string;
    sectionIndex: number;
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
    textNodes.push({
      nodeType: "text",
      value: text,
      marks: [],
      data: {},
    });
  } else {
    let cursor = 0;

    for (const fmt of formatting) {
      const start = Math.max(fmt.start, 0);
      const end = Math.min(fmt.end, text.length);

      if (cursor < start) {
        textNodes.push({
          nodeType: "text",
          value: text.slice(cursor, start),
          marks: [],
          data: {},
        });
      }

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

    if (cursor < text.length) {
      textNodes.push({
        nodeType: "text",
        value: text.slice(cursor),
        marks: [],
        data: {},
      });
    }
  }

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
  return {
    sys: { type: "Link" as const, linkType: "Entry" as const, id: entryId },
  };
}

/** Resolve the locale code for a book language from the Contentful space */
function resolveLocale(
  locales: { code: string; default: boolean }[],
  bookLanguage: string,
): string {
  const exact = locales.find((l) => l.code === bookLanguage);
  if (exact) return exact.code;

  const prefix = locales.find((l) =>
    l.code.startsWith(bookLanguage + "-"),
  );
  if (prefix) return prefix.code;

  const match = locales.find((l) =>
    l.code.toLowerCase().startsWith(bookLanguage.toLowerCase()),
  );
  if (match) return match.code;

  throw new Error(
    `No locale matching '${bookLanguage}' found. Available: ${locales.map((l) => l.code).join(", ")}`,
  );
}

/** Resolve footnotes: handle both array and object formats from assembly */
function resolveFootnote(
  footnotes: FootnoteJson[] | Record<string, string> | undefined,
  marker: string,
): string | null {
  if (!footnotes) return null;
  if (Array.isArray(footnotes)) {
    const fn = footnotes.find((f) => f.marker === marker);
    return fn?.text ?? null;
  }
  return footnotes[marker] ?? null;
}

// ── Main ─────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");

  const bookIdx = args.indexOf("--book");
  if (bookIdx === -1 || !args[bookIdx + 1]) {
    console.error(
      "Usage: npx tsx scripts/ingest/import-contentful.ts --book <slug> [--dry-run] [--resume-from-chapter <N>]",
    );
    process.exit(1);
  }
  const bookSlug = args[bookIdx + 1];

  const resumeIdx = args.indexOf("--resume-from-chapter");
  const resumeFromChapter =
    resumeIdx !== -1 ? parseInt(args[resumeIdx + 1]) : 0;

  const dataDir = join(
    import.meta.dirname,
    `../../data/book-ingest/${bookSlug}`,
  );
  const extras = BOOK_EXTRAS[bookSlug];
  if (!extras) {
    console.error(`Unknown book slug: ${bookSlug}`);
    process.exit(1);
  }

  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const managementToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
  if (!spaceId || !managementToken) {
    console.error(
      "CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN must be set.",
    );
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

  // Rasa is AI-derived metadata — lives in Neon only (classify-rasa.ts).
  // Contentful holds editorial facts; Neon holds computational judgments.

  if (dryRun) {
    let totalTextBlocks = 0;
    let totalSections = 0;
    let chaptersWithEpigraph = 0;
    const contentTypes = new Map<string, number>();

    for (const chInfo of structure.chapters) {
      const chData: ChapterJson = JSON.parse(
        readFileSync(join(dataDir, chInfo.dataFile), "utf-8"),
      );
      totalSections += chData.sections.length;
      if (chData.epigraphText) chaptersWithEpigraph++;

      for (const section of chData.sections) {
        totalTextBlocks += section.paragraphs.length;
        for (const para of section.paragraphs) {
          const ct = para.contentType || "prose";
          contentTypes.set(ct, (contentTypes.get(ct) || 0) + 1);
        }
      }
    }

    console.log(`\nWould create:`);
    console.log(
      `  1 Book entry`,
    );
    console.log(
      `  ${structure.chapters.length} Chapter entries (${chaptersWithEpigraph} with epigraph)`,
    );
    console.log(`  ${totalSections} Section entries`);
    console.log(`  ${totalTextBlocks} TextBlock entries`);
    console.log(
      `  Content types: ${[...contentTypes.entries()].map(([k, v]) => `${k}=${v}`).join(", ")}`,
    );
    const totalEntries =
      1 + structure.chapters.length + totalSections + totalTextBlocks;
    console.log(`  Total: ${totalEntries} entries`);
    console.log(
      `  Estimated time: ${Math.ceil((totalEntries * API_DELAY_MS) / 60000)} minutes`,
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
  const defaultLocale =
    locales.find((l) => l.default)?.code || "en-US";
  console.log(`  Contentful locale: ${locale}`);
  console.log(`  Default locale: ${defaultLocale}`);
  console.log(
    `  Available locales: ${locales.map((l) => l.code).join(", ")}\n`,
  );

  // Contentful requires the default locale (en-US) for all required fields.
  // For localized text, we write to both the default locale and the target locale.
  // For non-localized fields (links, numbers), we write to the default locale only.
  const localized = <T>(value: T): Record<string, T> =>
    locale === defaultLocale
      ? { [defaultLocale]: value }
      : { [defaultLocale]: value, [locale]: value };
  const nonLocalized = <T>(value: T): Record<string, T> => ({
    [defaultLocale]: value,
  });

  // Load or initialize mapping
  const mapPath = join(dataDir, "contentful-map.json");
  let contentfulMap: ContentfulMap;
  if (resumeFromChapter > 0 && existsSync(mapPath)) {
    contentfulMap = JSON.parse(readFileSync(mapPath, "utf-8"));
    console.log(
      `  Loaded existing mapping with ${contentfulMap.chapters.length} chapters.\n`,
    );
  } else {
    contentfulMap = {
      book: { slug: bookSlug, contentfulId: "" },
      chapters: [],
    };
  }

  const allEntryIds: string[] = [];
  let totalCreated = 0;

  // 1. Create Book entry
  let bookEntryId = contentfulMap.book.contentfulId;
  if (!bookEntryId) {
    console.log(`Creating Book entry...`);
    const bookEntry = await environment.createEntry("book", {
      fields: {
        title: localized(book.title),
        author: localized(book.author),
        authorTier: nonLocalized(book.authorTier || "guru"),
        publicationYear: nonLocalized(extras.publicationYear),
        isbn: nonLocalized(book.asin),
        language: nonLocalized(book.language),
        slug: nonLocalized(bookSlug),
        bookstoreUrl: localized(extras.bookstoreUrl),
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

  // 2. Process each chapter
  for (const chInfo of structure.chapters) {
    if (chInfo.number < resumeFromChapter) {
      const existing = contentfulMap.chapters.find(
        (c) => c.chapterNumber === chInfo.number,
      );
      if (existing) {
        allEntryIds.push(existing.contentfulId);
        for (const sec of existing.sections) {
          allEntryIds.push(sec.contentfulId);
        }
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

    // 2a. Create Chapter entry (with epigraph if present)
    const chapterFields: Record<string, Record<string, unknown>> = {
      title: localized(chInfo.title),
      chapterNumber: nonLocalized(chInfo.number),
      book: nonLocalized(makeLink(bookEntryId)),
      sortOrder: nonLocalized(chInfo.number),
    };

    if (chData.epigraphText) {
      chapterFields.epigraph = localized(chData.epigraphText);
    }
    if (chData.epigraphAttribution) {
      chapterFields.epigraphAttribution = localized(
        chData.epigraphAttribution,
      );
    }

    // Rasa is AI-derived metadata — lives in Neon only (classify-rasa.ts).
    // Contentful = editorial fact; Neon = computational judgment.

    const chapterEntry = await environment.createEntry("chapter", {
      fields: chapterFields,
    });
    allEntryIds.push(chapterEntry.sys.id);
    totalCreated++;
    await delay(API_DELAY_MS);

    // 2b. Create Section entries — one per assembly section
    const sectionMappings: SectionMapping[] = [];
    const textBlockMappings: ChapterMapping["textBlocks"] = [];

    for (let sIdx = 0; sIdx < chData.sections.length; sIdx++) {
      const section = chData.sections[sIdx];

      const sectionEntry = await environment.createEntry("section", {
        fields: {
          heading: localized(
            section.heading ||
              `Chapter ${chInfo.number} Section ${sIdx + 1}`,
          ),
          chapter: nonLocalized(makeLink(chapterEntry.sys.id)),
          sortOrder: nonLocalized(sIdx + 1),
        },
      });
      allEntryIds.push(sectionEntry.sys.id);
      sectionMappings.push({
        sectionIndex: sIdx,
        heading: section.heading,
        contentfulId: sectionEntry.sys.id,
      });
      totalCreated++;
      await delay(API_DELAY_MS);

      // 2c. Create TextBlock entries within this section
      for (const para of section.paragraphs) {
        const richText = paragraphToRichText(para);
        const contentType = para.contentType || "prose";

        // Build footnote metadata
        const footnoteMetadata: { marker: string; text: string }[] = [];
        for (const fmt of para.formatting) {
          if (fmt.style === "superscript") {
            const marker = para.text.slice(fmt.start, fmt.end);
            const fnText = resolveFootnote(chData.footnotes, marker);
            if (fnText) {
              footnoteMetadata.push({ marker, text: fnText });
            }
          }
        }

        const plainSnippet = para.text.slice(0, 60).replace(/\n/g, " ");
        const internalTitle = `Ch${chInfo.number} P${para.sequenceInChapter}: ${plainSnippet}`;

        const fields: Record<string, Record<string, unknown>> = {
          internalTitle: localized(internalTitle),
          content: localized(richText),
          section: nonLocalized(makeLink(sectionEntry.sys.id)),
          pageNumber: nonLocalized(para.pageNumber),
          sortOrder: nonLocalized(para.sequenceInChapter),
          contentType: nonLocalized(contentType),
        };

        if (footnoteMetadata.length > 0) {
          fields.metadata = nonLocalized({ footnotes: footnoteMetadata });
        }

        const entry = await environment.createEntry("textBlock", { fields });
        textBlockMappings.push({
          sequenceInChapter: para.sequenceInChapter,
          pageNumber: para.pageNumber,
          contentfulId: entry.sys.id,
          contentType,
          sectionIndex: sIdx,
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
      sections: sectionMappings,
      textBlocks: textBlockMappings,
    });
    writeFileSync(mapPath, JSON.stringify(contentfulMap, null, 2));

    const contentTypes = new Set(
      textBlockMappings.map((tb) => tb.contentType),
    );
    console.log(
      `  → 1 Chapter + ${sectionMappings.length} Sections + ${textBlockMappings.length} TextBlocks (types: ${[...contentTypes].join(",")})`,
    );
    console.log(`  Total entries created: ${totalCreated}`);
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
