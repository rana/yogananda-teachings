/**
 * Book ingestion: book.json → Neon PostgreSQL
 *
 * Reads extracted book data, chunks paragraphs per ADR-048
 * (100-500 token target, merge short paragraphs), generates
 * embeddings via Voyage API, and inserts into Neon.
 *
 * Usage:
 *   npx tsx scripts/ingest/ingest.ts --book <slug> [--contentful-map <path>] [--skip-embeddings] [--dry-run]
 *
 * Examples:
 *   npx tsx scripts/ingest/ingest.ts --book autobiography-of-a-yogi
 *   npx tsx scripts/ingest/ingest.ts --book autobiography-of-a-yogi \
 *     --contentful-map data/book-ingest/autobiography-of-a-yogi/contentful-map.json
 *
 * Requires: NEON_DATABASE_URL_DIRECT, VOYAGE_API_KEY (optional with --skip-embeddings)
 */

import { readFileSync } from "fs";
import { join } from "path";
import pg from "pg";

// ── Configuration (ADR-123) ──────────────────────────────────────

const CHUNK_MIN_TOKENS = 100;
const CHUNK_MAX_TOKENS = 500;
const EMBEDDING_MODEL = "voyage-3-large";
const EMBEDDING_DIMENSIONS = 1024;
const VOYAGE_BATCH_SIZE = 16; // Voyage API batch limit
const VOYAGE_API_URL = "https://api.voyageai.com/v1/embeddings";

// Chapter title patterns to skip (repetitions at paragraph start)
const CHAPTER_TITLE_PATTERNS = [
  /^CHAPTER\s+\d+$/i, // English
  /^CAPÍTULO\s+\d+$/i, // Spanish
];

// Book metadata not in book.json
const BOOK_EXTRAS: Record<
  string,
  { publicationYear: number; bookstoreUrl: string }
> = {
  "autobiography-of-a-yogi": {
    publicationYear: 1946,
    bookstoreUrl: "https://bookstore.yogananda-srf.org/autobiography-of-a-yogi",
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

interface FootnoteJson {
  marker: string;
  text: string;
  pageNumber: number;
}

interface ChapterJson {
  chapterNumber: number;
  title: string;
  slug: string;
  pageRange: [number, number];
  sections: { heading: string | null; paragraphs: Paragraph[] }[];
  footnotes: FootnoteJson[];
  metadata: Record<string, unknown>;
}

interface FormattingSpan {
  start: number;
  end: number;
  style: string;
}

interface Chunk {
  content: string;
  formatting: FormattingSpan[];
  pageNumber: number;
  sectionHeading: string | null;
  paragraphIndex: number;
  tokenEstimate: number;
}

/** Contentful mapping from import-contentful.ts (DES-005 Step 3.5) */
interface ContentfulMap {
  book: { slug: string; contentfulId: string };
  chapters: {
    chapterNumber: number;
    contentfulId: string;
    sectionContentfulId: string;
    textBlocks: {
      sequenceInChapter: number;
      pageNumber: number;
      contentfulId: string;
    }[];
  }[];
}

// ── Helpers ──────────────────────────────────────────────────────

/** Rough token estimate: words × 1.33 */
function estimateTokens(text: string): number {
  return Math.ceil(text.split(/\s+/).filter(Boolean).length * 1.33);
}

/** Chunk paragraphs per ADR-048: merge short, split long */
function chunkParagraphs(
  paragraphs: Paragraph[],
  sectionHeading: string | null,
): Chunk[] {
  const chunks: Chunk[] = [];
  let buffer: Paragraph[] = [];
  let bufferTokens = 0;

  function flushBuffer() {
    if (buffer.length === 0) return;
    // Merge text and adjust formatting span offsets for merged paragraphs
    const parts: string[] = [];
    const mergedFormatting: FormattingSpan[] = [];
    let offset = 0;
    for (let i = 0; i < buffer.length; i++) {
      if (i > 0) offset += 2; // "\n\n" separator
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
    chunks.push({
      content,
      formatting: mergedFormatting,
      pageNumber: buffer[0].pageNumber,
      sectionHeading,
      paragraphIndex: buffer[0].sequenceInChapter,
      tokenEstimate: estimateTokens(content),
    });
    buffer = [];
    bufferTokens = 0;
  }

  for (const para of paragraphs) {
    const text = para.text.trim();
    if (!text) continue;

    // Skip chapter title repetitions in any language
    if (CHAPTER_TITLE_PATTERNS.some((p) => p.test(text))) continue;

    const tokens = estimateTokens(text);

    // If adding this paragraph would exceed max, flush first
    if (bufferTokens > 0 && bufferTokens + tokens > CHUNK_MAX_TOKENS) {
      flushBuffer();
    }

    buffer.push(para);
    bufferTokens += tokens;

    // If buffer has reached min range, flush
    if (bufferTokens >= CHUNK_MIN_TOKENS) {
      flushBuffer();
    }
  }

  // Flush remaining
  flushBuffer();

  return chunks;
}

/** Generate embeddings via Voyage API in batches */
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

    // Rate limit: small delay between batches
    if (i + VOYAGE_BATCH_SIZE < texts.length) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  return embeddings;
}

// ── Main ─────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const skipEmbeddings = args.includes("--skip-embeddings");
  const dryRun = args.includes("--dry-run");

  // Parse --contentful-map <path>
  const mapIdx = args.indexOf("--contentful-map");
  let contentfulMap: ContentfulMap | null = null;
  if (mapIdx !== -1 && args[mapIdx + 1]) {
    contentfulMap = JSON.parse(readFileSync(args[mapIdx + 1], "utf-8"));
    console.log(
      `Contentful mapping loaded: ${contentfulMap!.chapters.length} chapters`,
    );
  }

  // Parse --book <slug>
  const bookIdx = args.indexOf("--book");
  if (bookIdx === -1 || !args[bookIdx + 1]) {
    console.error("Usage: npx tsx scripts/ingest/ingest.ts --book <slug>");
    console.error("  Available: autobiography-of-a-yogi, autobiografia-de-un-yogui");
    process.exit(1);
  }
  const bookSlug = args[bookIdx + 1];

  const dataDir = join(
    import.meta.dirname,
    `../../data/book-ingest/${bookSlug}`,
  );
  const extras = BOOK_EXTRAS[bookSlug];
  if (!extras) {
    console.error(`Unknown book slug: ${bookSlug}`);
    console.error(`  Available: ${Object.keys(BOOK_EXTRAS).join(", ")}`);
    process.exit(1);
  }

  const voyageKey = process.env.VOYAGE_API_KEY;
  if (!skipEmbeddings && !voyageKey) {
    console.error(
      "VOYAGE_API_KEY not set. Use --skip-embeddings to ingest without embeddings.",
    );
    process.exit(1);
  }

  const dbUrl = process.env.NEON_DATABASE_URL_DIRECT;
  if (!dbUrl) {
    console.error("NEON_DATABASE_URL_DIRECT not set.");
    process.exit(1);
  }

  // Read book metadata
  const bookJson: BookJson = JSON.parse(
    readFileSync(join(dataDir, "book.json"), "utf-8"),
  );
  const { book, structure } = bookJson;

  console.log(`\nIngesting: ${book.title} by ${book.author}`);
  console.log(`  Language: ${book.language}`);
  console.log(`  Chapters: ${book.totalChapters}`);
  console.log(`  Embeddings: ${skipEmbeddings ? "SKIPPED" : EMBEDDING_MODEL}`);
  console.log(`  Dry run: ${dryRun}\n`);

  // Read and chunk all chapters
  const allChunks: {
    chapterNumber: number;
    chapterTitle: string;
    chunks: Chunk[];
  }[] = [];
  let totalChunks = 0;

  for (const chInfo of structure.chapters) {
    const chPath = join(dataDir, chInfo.dataFile);
    const chData: ChapterJson = JSON.parse(readFileSync(chPath, "utf-8"));

    const chapterChunks: Chunk[] = [];
    for (const section of chData.sections) {
      const chunks = chunkParagraphs(section.paragraphs, section.heading);
      chapterChunks.push(...chunks);
    }

    allChunks.push({
      chapterNumber: chInfo.number,
      chapterTitle: chInfo.title,
      chunks: chapterChunks,
    });
    totalChunks += chapterChunks.length;

    console.log(
      `  Ch ${chInfo.number}: ${chInfo.title} → ${chapterChunks.length} chunks`,
    );
  }

  console.log(`\nTotal chunks: ${totalChunks}`);

  // Token distribution
  const tokenCounts = allChunks.flatMap((c) =>
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

  // Generate embeddings
  let allEmbeddings: number[][] | null = null;
  if (!skipEmbeddings && voyageKey) {
    console.log(`\nGenerating embeddings for ${totalChunks} chunks...`);
    const allTexts = allChunks.flatMap((c) => c.chunks.map((ch) => ch.content));
    allEmbeddings = await generateEmbeddings(allTexts, voyageKey);
    console.log(`Embeddings generated: ${allEmbeddings.length}`);
  }

  // Connect to Neon
  const client = new pg.Client({ connectionString: dbUrl });
  await client.connect();
  console.log("\nConnected to Neon.");

  try {
    await client.query("BEGIN");

    // Insert book
    const bookContentfulId = contentfulMap?.book.contentfulId || null;
    const bookResult = await client.query(
      `INSERT INTO books (title, author, language, isbn, publication_year, author_tier, bookstore_url, contentful_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        book.title,
        book.author,
        book.language,
        book.asin,
        extras.publicationYear,
        book.authorTier || "guru",
        extras.bookstoreUrl,
        bookContentfulId,
      ],
    );
    const bookId = bookResult.rows[0].id;
    console.log(`Book inserted: ${bookId}${bookContentfulId ? ` (contentful: ${bookContentfulId})` : ""}`);

    // Insert chapters and chunks
    let embeddingIdx = 0;
    let totalInserted = 0;

    for (const chData of allChunks) {
      // Look up Contentful mapping for this chapter
      const chapterMap = contentfulMap?.chapters.find(
        (c) => c.chapterNumber === chData.chapterNumber,
      );
      const chapterContentfulId = chapterMap?.contentfulId || null;

      // Insert chapter
      const chResult = await client.query(
        `INSERT INTO chapters (book_id, chapter_number, title, sort_order, contentful_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [bookId, chData.chapterNumber, chData.chapterTitle, chData.chapterNumber, chapterContentfulId],
      );
      const chapterId = chResult.rows[0].id;

      // Insert chunks
      for (const chunk of chData.chunks) {
        const embedding =
          allEmbeddings && allEmbeddings[embeddingIdx]
            ? `[${allEmbeddings[embeddingIdx].join(",")}]`
            : null;

        // Look up the TextBlock contentful_id for this chunk's first paragraph
        let chunkContentfulId: string | null = null;
        if (chapterMap) {
          const tb = chapterMap.textBlocks.find(
            (tb) => tb.sequenceInChapter === chunk.paragraphIndex,
          );
          if (tb) chunkContentfulId = tb.contentfulId;
        }

        await client.query(
          `INSERT INTO book_chunks (
            book_id, chapter_id, content, page_number, section_heading,
            paragraph_index, language, embedding, embedding_model, embedding_dimension,
            contentful_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            bookId,
            chapterId,
            chunk.content,
            chunk.pageNumber,
            chunk.sectionHeading,
            chunk.paragraphIndex,
            book.language,
            embedding,
            skipEmbeddings ? "pending" : EMBEDDING_MODEL,
            EMBEDDING_DIMENSIONS,
            chunkContentfulId,
          ],
        );

        embeddingIdx++;
        totalInserted++;
      }
    }

    await client.query("COMMIT");
    console.log(
      `\nInserted ${totalInserted} chunks across ${allChunks.length} chapters.`,
    );

    // Set canonical_book_id if this is a translation
    if (book.language !== "en") {
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
    const svResult = await client.query(
      "SELECT COUNT(*) as count FROM book_chunks WHERE book_id = $1 AND search_vector IS NOT NULL",
      [bookId],
    );
    const embResult = await client.query(
      "SELECT COUNT(*) as count FROM book_chunks WHERE book_id = $1 AND embedding IS NOT NULL",
      [bookId],
    );

    const cfResult = await client.query(
      "SELECT COUNT(*) as count FROM book_chunks WHERE book_id = $1 AND contentful_id IS NOT NULL",
      [bookId],
    );

    console.log(`\nVerification:`);
    console.log(`  Total chunks: ${countResult.rows[0].count}`);
    console.log(`  With search_vector: ${svResult.rows[0].count}`);
    console.log(`  With embedding: ${embResult.rows[0].count}`);
    console.log(`  With contentful_id: ${cfResult.rows[0].count}`);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("Ingestion failed:", err);
  process.exit(1);
});
