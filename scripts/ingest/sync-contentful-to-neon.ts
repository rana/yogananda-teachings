/**
 * Contentful → Neon sync: the canonical data flow (FTR-102)
 *
 * Reads published content from Contentful (source of truth) and
 * writes to Neon (derived, searchable, embedding-enriched cache).
 *
 * This is the pipeline's canonical direction. The local JSON
 * intermediary and direct-to-Neon ingestion exist for bootstrapping
 * and development; production flow is always Contentful → Neon.
 *
 * What it does:
 *   1. Fetches Book → Chapter → Section → TextBlock from Contentful CDA
 *   2. Reconstructs paragraph structure with content types and formatting
 *   3. Applies FTR-023 chunking (100-500 tokens, content-type-aware)
 *   4. Generates slugs (mirrors generate_content_slug PG function)
 *   5. Inserts into Neon with contentful_id links back to Contentful
 *
 * Usage:
 *   npx tsx scripts/ingest/sync-contentful-to-neon.ts --book <slug> [--replace] [--skip-embeddings] [--dry-run]
 *
 * Requires: CONTENTFUL_SPACE_ID, CONTENTFUL_ACCESS_TOKEN, NEON_DATABASE_URL_DIRECT
 *           VOYAGE_API_KEY (optional with --skip-embeddings)
 *
 * Governing: FTR-102 (Contentful as editorial source of truth)
 *            FTR-023 (chunking strategy)
 *            FTR-022 (book ingestion pipeline)
 */

import * as contentful from "contentful";
import pg_module from "pg";
const { Client } = pg_module;

// ── Configuration ────────────────────────────────────────────────

const CONTENTFUL_ENVIRONMENT = "master";
const CHUNK_MIN_TOKENS = 100;
const CHUNK_MAX_TOKENS = 500;
const EMBEDDING_MODEL = "voyage-4-large";
const EMBEDDING_DIMENSIONS = 1024;
const VOYAGE_BATCH_SIZE = 16;
const VOYAGE_API_URL = "https://api.voyageai.com/v1/embeddings";
const CONTENTFUL_PAGE_SIZE = 500; // Max entries per CDA request

// Chapter title patterns to skip
const CHAPTER_TITLE_PATTERNS = [
  /^CHAPTER\s+\d+$/i,
  /^CAPÍTULO\s+\d+$/i,
];

// ── Types ────────────────────────────────────────────────────────

interface ContentfulBook {
  title: string;
  author: string;
  authorTier: string;
  publicationYear: number;
  isbn: string;
  language: string;
  slug: string;
  bookstoreUrl: string;
}

interface ContentfulChapter {
  contentfulId: string;
  title: string;
  chapterNumber: number;
  sortOrder: number;
  epigraph?: string;
  epigraphAttribution?: string;
  // Rasa lives in Neon only (AI-derived, classify-rasa.ts)
}

interface ContentfulSection {
  contentfulId: string;
  chapterContentfulId: string;
  heading: string;
  sortOrder: number;
}

interface ContentfulTextBlock {
  contentfulId: string;
  sectionContentfulId: string;
  internalTitle: string;
  content: RichTextDocument;
  pageNumber: number;
  sortOrder: number;
  contentType: string;
  metadata?: { footnotes?: { marker: string; text: string }[] };
}

// Contentful Rich Text types
interface RichTextDocument {
  nodeType: "document";
  content: RichTextNode[];
}

type RichTextNode = RichTextParagraph | RichTextText | RichTextHeading;

interface RichTextParagraph {
  nodeType: "paragraph";
  content: RichTextInline[];
}

interface RichTextHeading {
  nodeType: string; // heading-1 through heading-6
  content: RichTextInline[];
}

interface RichTextText {
  nodeType: "text";
  value: string;
  marks: { type: string }[];
}

type RichTextInline = RichTextText;

// Internal working types
interface FormattingSpan {
  start: number;
  end: number;
  style: string;
}

interface ReconstructedParagraph {
  text: string;
  formatting: FormattingSpan[];
  pageNumber: number;
  sequenceInChapter: number;
  contentType: string;
  sectionIndex: number;
}

interface Chunk {
  content: string;
  formatting: FormattingSpan[];
  pageNumber: number;
  sectionHeading: string | null;
  paragraphIndex: number;
  tokenEstimate: number;
  contentType: string;
  sectionIndex: number;
  sortOrder: number;
  contentfulTextBlockId: string | null;
}

// ── Rich Text → Plain Text + Formatting ──────────────────────────

function richTextToPlainWithFormatting(doc: RichTextDocument): {
  text: string;
  formatting: FormattingSpan[];
} {
  const parts: string[] = [];
  const formatting: FormattingSpan[] = [];
  let offset = 0;

  for (const node of doc.content) {
    if (node.nodeType === "paragraph" || node.nodeType.startsWith("heading")) {
      if (offset > 0) {
        // Paragraph separator (not needed for first paragraph)
        // Single RichText paragraph = single TextBlock, so no separator needed
      }

      const paragraphNode = node as RichTextParagraph;
      for (const inline of paragraphNode.content) {
        if (inline.nodeType === "text") {
          const text = inline.value;
          if (inline.marks && inline.marks.length > 0) {
            for (const mark of inline.marks) {
              formatting.push({
                start: offset,
                end: offset + text.length,
                style: mark.type,
              });
            }
          }
          parts.push(text);
          offset += text.length;
        }
      }
    }
  }

  return { text: parts.join(""), formatting };
}

// ── Slug generation (mirrors ingest.ts / PG function) ────────────

const STOP_WORDS = new Set([
  "a","an","the","of","in","to","and","is","it","for","that","this","was",
  "with","but","or","as","by","from","at","on","be","are","were","been",
  "which","who","he","she","they","we","you","my","your","his","her","its",
  "our","their","not","no","do","will","would","could","i","so","if","me",
  "all","had","one","when","there","what","about","up","out","them","then",
  "more","very","can","just","only","now","like","other","into","some",
  "el","la","los","las","un","una","de","del","en","y","que","es","por",
  "con","se","su","al","lo","como","para","no","pero","mas","fue","era",
  "yo","me","mi","tu","nos","le","les","si","ya","muy","tan",
]);

function generateContentSlug(content: string): string {
  const cleaned = content
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, "");
  const words = cleaned.split(/\s+/).filter(Boolean);
  const significant = words.filter((w) => !STOP_WORDS.has(w) && w.length > 1);
  if (significant.length >= 2) return significant.slice(0, 5).join("-");
  return words.filter((w) => w.length > 1).slice(0, 5).join("-");
}

class SlugTracker {
  private seen = new Map<string, number>();
  resolve(content: string, language: string): string {
    const base = generateContentSlug(content);
    const key = `${language}:${base}`;
    const count = (this.seen.get(key) || 0) + 1;
    this.seen.set(key, count);
    return count === 1 ? base : `${base}-${count}`;
  }
}

// ── Token estimation and chunking (FTR-023) ──────────────────────

function estimateTokens(text: string): number {
  return Math.ceil(text.split(/\s+/).filter(Boolean).length * 1.33);
}

function chunkParagraphs(
  paragraphs: ReconstructedParagraph[],
  sectionHeading: string | null,
  sortOrderStart: number,
  textBlockIds: (string | null)[],
): Chunk[] {
  const chunks: Chunk[] = [];
  let buffer: ReconstructedParagraph[] = [];
  let bufferTextBlockIds: (string | null)[] = [];
  let bufferTokens = 0;
  let sortOrder = sortOrderStart;

  function flushBuffer() {
    if (buffer.length === 0) return;
    const parts: string[] = [];
    const mergedFormatting: FormattingSpan[] = [];
    let offset = 0;
    for (let i = 0; i < buffer.length; i++) {
      if (i > 0) offset += 2;
      parts.push(buffer[i].text);
      for (const span of buffer[i].formatting) {
        mergedFormatting.push({
          start: span.start + offset,
          end: span.end + offset,
          style: span.style,
        });
      }
      offset += buffer[i].text.length;
    }
    const content = parts.join("\n\n");
    sortOrder++;
    chunks.push({
      content,
      formatting: mergedFormatting,
      pageNumber: buffer[0].pageNumber,
      sectionHeading,
      paragraphIndex: buffer[0].sequenceInChapter,
      tokenEstimate: estimateTokens(content),
      contentType: buffer[0].contentType || "prose",
      sectionIndex: buffer[0].sectionIndex,
      sortOrder,
      contentfulTextBlockId: bufferTextBlockIds[0] || null,
    });
    buffer = [];
    bufferTextBlockIds = [];
    bufferTokens = 0;
  }

  for (let i = 0; i < paragraphs.length; i++) {
    const para = paragraphs[i];
    const text = para.text.trim();
    if (!text) continue;
    if (CHAPTER_TITLE_PATTERNS.some((p) => p.test(text))) continue;

    const paraContentType = para.contentType || "prose";
    const paraSectionIndex = para.sectionIndex;
    const tokens = estimateTokens(text);

    const bufferContentType =
      buffer.length > 0 ? buffer[0].contentType || "prose" : paraContentType;
    const bufferSectionIndex =
      buffer.length > 0 ? buffer[0].sectionIndex : paraSectionIndex;

    const typeBoundary =
      buffer.length > 0 && paraContentType !== bufferContentType;
    const sectionBoundary =
      buffer.length > 0 && paraSectionIndex !== bufferSectionIndex;
    const nonProseType = paraContentType !== "prose";

    if (
      typeBoundary ||
      sectionBoundary ||
      (nonProseType && buffer.length > 0)
    ) {
      flushBuffer();
    }

    if (bufferTokens > 0 && bufferTokens + tokens > CHUNK_MAX_TOKENS) {
      flushBuffer();
    }

    buffer.push(para);
    bufferTextBlockIds.push(textBlockIds[i] || null);
    bufferTokens += tokens;

    if (nonProseType) {
      flushBuffer();
      continue;
    }

    if (bufferTokens >= CHUNK_MIN_TOKENS) {
      flushBuffer();
    }
  }

  flushBuffer();
  return chunks;
}

// ── Embeddings ───────────────────────────────────────────────────

async function generateEmbeddings(
  texts: string[],
  apiKey: string,
): Promise<number[][]> {
  const embeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += VOYAGE_BATCH_SIZE) {
    const batch = texts.slice(i, i + VOYAGE_BATCH_SIZE);
    const batchNum = Math.floor(i / VOYAGE_BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(texts.length / VOYAGE_BATCH_SIZE);

    process.stdout.write(
      `  Embedding batch ${batchNum}/${totalBatches} (${batch.length} chunks)...`,
    );

    const response = await fetch(VOYAGE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: batch,
        input_type: "document",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Voyage API error ${response.status}: ${error}`);
    }

    const data = (await response.json()) as {
      data: { embedding: number[] }[];
      usage: { total_tokens: number };
    };
    for (const item of data.data) {
      embeddings.push(item.embedding);
    }

    console.log(` done (${data.usage.total_tokens} tokens)`);

    if (i + VOYAGE_BATCH_SIZE < texts.length) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  return embeddings;
}

// ── Contentful Fetch ─────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyEntry = contentful.Entry<any, any, string>;

async function fetchAllEntries(
  cdaClient: contentful.ContentfulClientApi<undefined>,
  contentType: string,
  query: Record<string, unknown> = {},
): Promise<AnyEntry[]> {
  const entries: AnyEntry[] = [];
  let skip = 0;

  while (true) {
    const response = await cdaClient.getEntries({
      content_type: contentType,
      limit: CONTENTFUL_PAGE_SIZE,
      skip,
      ...query,
    } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    entries.push(...(response.items as AnyEntry[]));

    if (entries.length >= response.total) break;
    skip += CONTENTFUL_PAGE_SIZE;
  }

  return entries;
}

// ── Main ─────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const replaceExisting = args.includes("--replace");
  const skipEmbeddings = args.includes("--skip-embeddings");

  const bookIdx = args.indexOf("--book");
  if (bookIdx === -1 || !args[bookIdx + 1]) {
    console.error(
      "Usage: npx tsx scripts/ingest/sync-contentful-to-neon.ts --book <slug> [--replace] [--skip-embeddings] [--dry-run]",
    );
    process.exit(1);
  }
  const bookSlug = args[bookIdx + 1];

  // Validate environment
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
  const dbUrl = process.env.NEON_DATABASE_URL_DIRECT;
  const voyageKey = process.env.VOYAGE_API_KEY;

  if (!spaceId || !accessToken) {
    console.error("CONTENTFUL_SPACE_ID and CONTENTFUL_ACCESS_TOKEN must be set.");
    process.exit(1);
  }
  if (!dbUrl) {
    console.error("NEON_DATABASE_URL_DIRECT must be set.");
    process.exit(1);
  }
  if (!skipEmbeddings && !voyageKey) {
    console.error(
      "VOYAGE_API_KEY not set. Use --skip-embeddings to sync without embeddings.",
    );
    process.exit(1);
  }

  // ── 1. Fetch from Contentful ──────────────────────────────────

  console.log(`\nContentful → Neon sync: "${bookSlug}"`);
  console.log(`  Contentful space: ${spaceId}`);
  console.log(`  Dry run: ${dryRun}`);

  const cdaClient = contentful.createClient({
    space: spaceId,
    accessToken,
    environment: CONTENTFUL_ENVIRONMENT,
  });

  // Fetch the book
  console.log(`\nFetching book from Contentful...`);
  const bookEntries = await fetchAllEntries(cdaClient, "book", {
    "fields.slug": bookSlug,
  });

  if (bookEntries.length === 0) {
    console.error(`Book not found in Contentful: slug="${bookSlug}"`);
    console.error("Run import-contentful.ts first to populate Contentful.");
    process.exit(1);
  }

  const bookEntry = bookEntries[0];
  const bookFields = bookEntry.fields as unknown as ContentfulBook;
  const bookContentfulId = bookEntry.sys.id;

  console.log(`  Book: "${bookFields.title}" by ${bookFields.author}`);
  console.log(`  Language: ${bookFields.language}`);
  console.log(`  Contentful ID: ${bookContentfulId}`);

  // Fetch chapters linked to this book
  console.log(`\nFetching chapters...`);
  const chapterEntries = await fetchAllEntries(cdaClient, "chapter", {
    "fields.book.sys.id": bookContentfulId,
    order: "fields.sortOrder",
  });
  console.log(`  Found ${chapterEntries.length} chapters`);

  // Fetch all sections linked to chapters of this book
  console.log(`Fetching sections...`);
  const chapterIds = chapterEntries.map((c) => c.sys.id);
  const allSections: AnyEntry[] = [];
  // Fetch in batches (Contentful limits 'sys.id[in]' to ~100 items)
  for (let i = 0; i < chapterIds.length; i += 50) {
    const batch = chapterIds.slice(i, i + 50);
    const sections = await fetchAllEntries(cdaClient, "section", {
      "fields.chapter.sys.id[in]": batch.join(","),
      order: "fields.sortOrder",
    });
    allSections.push(...sections);
  }
  console.log(`  Found ${allSections.length} sections`);

  // Fetch all text blocks linked to sections
  console.log(`Fetching text blocks...`);
  const sectionIds = allSections.map((s) => s.sys.id);
  const allTextBlocks: AnyEntry[] = [];
  for (let i = 0; i < sectionIds.length; i += 50) {
    const batch = sectionIds.slice(i, i + 50);
    const blocks = await fetchAllEntries(cdaClient, "textBlock", {
      "fields.section.sys.id[in]": batch.join(","),
      order: "fields.sortOrder",
    });
    allTextBlocks.push(...blocks);
  }
  console.log(`  Found ${allTextBlocks.length} text blocks`);

  // ── 2. Reconstruct chapter structure ───────────────────────────

  console.log(`\nReconstructing chapter structure...`);

  // Index sections by chapter
  const sectionsByChapter = new Map<string, typeof allSections>();
  for (const section of allSections) {
    const fields = section.fields as Record<string, unknown>;
    const chapterLink = fields.chapter as { sys: { id: string } };
    const chapterId = chapterLink.sys.id;
    if (!sectionsByChapter.has(chapterId)) {
      sectionsByChapter.set(chapterId, []);
    }
    sectionsByChapter.get(chapterId)!.push(section);
  }

  // Index text blocks by section
  const blocksBySection = new Map<string, typeof allTextBlocks>();
  for (const block of allTextBlocks) {
    const fields = block.fields as Record<string, unknown>;
    const sectionLink = fields.section as { sys: { id: string } };
    const sectionId = sectionLink.sys.id;
    if (!blocksBySection.has(sectionId)) {
      blocksBySection.set(sectionId, []);
    }
    blocksBySection.get(sectionId)!.push(block);
  }

  // Build chapter data for chunking
  interface ChapterData {
    chapterNumber: number;
    chapterTitle: string;
    contentfulId: string;
    epigraphText?: string;
    epigraphAttribution?: string;
    sections: {
      heading: string | null;
      sectionIndex: number;
      paragraphs: ReconstructedParagraph[];
      textBlockIds: (string | null)[];
    }[];
  }

  const chapters: ChapterData[] = [];
  let totalParagraphs = 0;

  for (const chapterEntry of chapterEntries) {
    const chFields = chapterEntry.fields as Record<string, unknown>;
    const chapterNumber = chFields.chapterNumber as number;
    const chapterTitle = chFields.title as string;

    const sections = sectionsByChapter.get(chapterEntry.sys.id) || [];
    // Sort sections by sortOrder
    sections.sort((a, b) => {
      const aOrder = (a.fields as Record<string, unknown>).sortOrder as number;
      const bOrder = (b.fields as Record<string, unknown>).sortOrder as number;
      return aOrder - bOrder;
    });

    const chapterSections: ChapterData["sections"] = [];
    let sequenceCounter = 0;

    for (let sIdx = 0; sIdx < sections.length; sIdx++) {
      const section = sections[sIdx];
      const sFields = section.fields as Record<string, unknown>;
      const heading = sFields.heading as string | null;

      const blocks = blocksBySection.get(section.sys.id) || [];
      // Sort by sortOrder
      blocks.sort((a, b) => {
        const aOrder = (a.fields as Record<string, unknown>)
          .sortOrder as number;
        const bOrder = (b.fields as Record<string, unknown>)
          .sortOrder as number;
        return aOrder - bOrder;
      });

      const paragraphs: ReconstructedParagraph[] = [];
      const textBlockIds: (string | null)[] = [];

      for (const block of blocks) {
        const bFields = block.fields as Record<string, unknown>;
        const richText = bFields.content as RichTextDocument;
        const contentType = (bFields.contentType as string) || "prose";
        const pageNumber = (bFields.pageNumber as number) || 0;

        const { text, formatting } = richTextToPlainWithFormatting(richText);

        sequenceCounter++;
        paragraphs.push({
          text,
          formatting,
          pageNumber,
          sequenceInChapter: sequenceCounter,
          contentType,
          sectionIndex: sIdx,
        });
        textBlockIds.push(block.sys.id);
        totalParagraphs++;
      }

      // Determine heading: use section heading unless it's auto-generated
      const sectionHeading =
        heading && !heading.startsWith(`Chapter ${chapterNumber} Section`)
          ? heading
          : null;

      chapterSections.push({
        heading: sectionHeading,
        sectionIndex: sIdx,
        paragraphs,
        textBlockIds,
      });
    }

    chapters.push({
      chapterNumber,
      chapterTitle,
      contentfulId: chapterEntry.sys.id,
      epigraphText: chFields.epigraph as string | undefined,
      epigraphAttribution: chFields.epigraphAttribution as string | undefined,
      // Rasa is AI-derived — not synced from Contentful.
      // Contentful = editorial fact; Neon = computational judgment.
      // Rasa populated separately by classify-rasa.ts.
      sections: chapterSections,
    });
  }

  // Sort chapters by number
  chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);

  console.log(
    `  Reconstructed ${chapters.length} chapters, ${totalParagraphs} paragraphs`,
  );

  // ── 3. Chunk paragraphs (FTR-023) ─────────────────────────────

  console.log(`\nChunking...`);

  const allChunkedChapters: {
    chapter: ChapterData;
    chunks: Chunk[];
  }[] = [];
  let totalChunks = 0;

  for (const chapter of chapters) {
    const chapterChunks: Chunk[] = [];
    let sortOrderCounter = 0;

    for (const section of chapter.sections) {
      const chunks = chunkParagraphs(
        section.paragraphs,
        section.heading,
        sortOrderCounter,
        section.textBlockIds,
      );
      chapterChunks.push(...chunks);
      if (chunks.length > 0) {
        sortOrderCounter = chunks[chunks.length - 1].sortOrder;
      }
    }

    allChunkedChapters.push({ chapter, chunks: chapterChunks });
    totalChunks += chapterChunks.length;

    const contentTypes = Array.from(new Set(chapterChunks.map((c) => c.contentType)));
    console.log(
      `  Ch ${chapter.chapterNumber}: ${chapter.chapterTitle} → ${chapterChunks.length} chunks (types: ${contentTypes.join(",")})`,
    );
  }

  console.log(`\nTotal chunks: ${totalChunks}`);

  // Token distribution
  const tokenCounts = allChunkedChapters.flatMap((c) =>
    c.chunks.map((ch) => ch.tokenEstimate),
  );
  tokenCounts.sort((a, b) => a - b);
  const median = tokenCounts[Math.floor(tokenCounts.length / 2)];
  const avg = tokenCounts.reduce((a, b) => a + b, 0) / tokenCounts.length;
  const belowMin = tokenCounts.filter((t) => t < CHUNK_MIN_TOKENS).length;
  console.log(
    `Token distribution: median=${median}, avg=${avg.toFixed(0)}, below-min=${belowMin}`,
  );

  if (dryRun) {
    console.log("\nDry run complete. No database changes made.");
    return;
  }

  // ── 4. Generate embeddings ─────────────────────────────────────

  let allEmbeddings: number[][] | null = null;
  if (!skipEmbeddings && voyageKey) {
    console.log(`\nGenerating embeddings for ${totalChunks} chunks...`);
    const allTexts = allChunkedChapters.flatMap((c) =>
      c.chunks.map((ch) => ch.content),
    );
    allEmbeddings = await generateEmbeddings(allTexts, voyageKey);
    console.log(`Embeddings generated: ${allEmbeddings.length}`);
  }

  // ── 5. Write to Neon ───────────────────────────────────────────

  const client = new Client({ connectionString: dbUrl });
  await client.connect();
  console.log("\nConnected to Neon.");

  try {
    await client.query("BEGIN");

    const slugTracker = new SlugTracker();

    // Handle --replace
    if (replaceExisting) {
      const existing = await client.query(
        "SELECT id FROM books WHERE slug = $1",
        [bookSlug],
      );
      if (existing.rows.length > 0) {
        const existingBookId = existing.rows[0].id;
        await client.query(
          "UPDATE books SET canonical_book_id = NULL WHERE canonical_book_id = $1",
          [existingBookId],
        );
        await client.query("DELETE FROM books WHERE id = $1", [
          existingBookId,
        ]);
        console.log(`Replaced existing book: ${existingBookId}`);
      }
    }

    // Insert book
    const bookResult = await client.query(
      `INSERT INTO books (title, slug, author, language, isbn, publication_year, author_tier, bookstore_url, contentful_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        bookFields.title,
        bookSlug,
        bookFields.author,
        bookFields.language,
        bookFields.isbn,
        bookFields.publicationYear,
        bookFields.authorTier || "guru",
        bookFields.bookstoreUrl,
        bookContentfulId,
      ],
    );
    const bookId = bookResult.rows[0].id;
    console.log(`Book inserted: ${bookId} (contentful: ${bookContentfulId})`);

    // Insert chapters and chunks
    let embeddingIdx = 0;
    let totalInserted = 0;

    for (const { chapter, chunks } of allChunkedChapters) {
      // Insert chapter
      const chResult = await client.query(
        `INSERT INTO chapters (book_id, chapter_number, title, sort_order, contentful_id, epigraph, epigraph_attribution)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [
          bookId,
          chapter.chapterNumber,
          chapter.chapterTitle,
          chapter.chapterNumber,
          chapter.contentfulId,
          chapter.epigraphText || null,
          chapter.epigraphAttribution || null,
        ],
      );
      const chapterId = chResult.rows[0].id;

      // Insert chunks
      for (const chunk of chunks) {
        const embedding =
          allEmbeddings && allEmbeddings[embeddingIdx]
            ? `[${allEmbeddings[embeddingIdx].join(",")}]`
            : null;

        const chunkSlug = slugTracker.resolve(
          chunk.content,
          bookFields.language,
        );

        await client.query(
          `INSERT INTO book_chunks (
            book_id, chapter_id, content, slug, formatting, page_number, section_heading,
            paragraph_index, language, embedding, embedding_model, embedding_dimension,
            contentful_id, content_type, section_index, sort_order
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
          [
            bookId,
            chapterId,
            chunk.content,
            chunkSlug,
            JSON.stringify(chunk.formatting),
            chunk.pageNumber,
            chunk.sectionHeading,
            chunk.paragraphIndex,
            bookFields.language,
            embedding,
            skipEmbeddings ? "pending" : EMBEDDING_MODEL,
            EMBEDDING_DIMENSIONS,
            chunk.contentfulTextBlockId,
            chunk.contentType,
            chunk.sectionIndex,
            chunk.sortOrder,
          ],
        );

        embeddingIdx++;
        totalInserted++;
      }
    }

    await client.query("COMMIT");
    console.log(
      `\nInserted ${totalInserted} chunks across ${allChunkedChapters.length} chapters.`,
    );

    // Set canonical_book_id if this is a translation
    if (bookFields.language !== "en") {
      const canonical = await client.query(
        `SELECT id FROM books WHERE language = 'en' AND title ILIKE '%autobiography%' LIMIT 1`,
      );
      if (canonical.rows.length > 0) {
        await client.query(
          `UPDATE books SET canonical_book_id = $1 WHERE id = $2`,
          [canonical.rows[0].id, bookId],
        );
        console.log(
          `Canonical link: ${bookId} → ${canonical.rows[0].id} (English edition)`,
        );
      }
    }

    // Verify
    const countResult = await client.query(
      "SELECT COUNT(*) as count FROM book_chunks WHERE book_id = $1",
      [bookId],
    );
    const typeResult = await client.query(
      "SELECT content_type, COUNT(*) as count FROM book_chunks WHERE book_id = $1 GROUP BY content_type ORDER BY count DESC",
      [bookId],
    );
    const cfResult = await client.query(
      "SELECT COUNT(*) as count FROM book_chunks WHERE book_id = $1 AND contentful_id IS NOT NULL",
      [bookId],
    );

    console.log(`\nVerification:`);
    console.log(`  Total chunks: ${countResult.rows[0].count}`);
    console.log(
      `  With contentful_id: ${cfResult.rows[0].count}`,
    );
    console.log(
      `  Content types: ${typeResult.rows.map((r: { content_type: string; count: string }) => `${r.content_type}=${r.count}`).join(", ")}`,
    );
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("Contentful → Neon sync failed:", err);
  process.exit(1);
});
