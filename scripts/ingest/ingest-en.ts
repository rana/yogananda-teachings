/**
 * English book ingestion: book.json → Neon PostgreSQL
 *
 * Reads extracted book data, chunks paragraphs per FTR-023
 * (100-500 token target, merge short paragraphs), generates
 * embeddings via Voyage API, and inserts into Neon.
 *
 * Usage:
 *   npx tsx scripts/ingest/ingest-en.ts [--skip-embeddings] [--dry-run]
 *
 * Requires: NEON_DATABASE_URL_DIRECT, VOYAGE_API_KEY (optional with --skip-embeddings)
 */

import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import pg from "pg";

// ── Configuration (FTR-012) ──────────────────────────────────────

const CHUNK_MIN_TOKENS = 100;
const CHUNK_MAX_TOKENS = 500;
const CHUNK_TARGET_TOKENS = 300;
const EMBEDDING_MODEL = "voyage-4-large";
const EMBEDDING_DIMENSIONS = 1024;
const VOYAGE_BATCH_SIZE = 16; // Voyage API batch limit
const VOYAGE_API_URL = "https://api.voyageai.com/v1/embeddings";

const DATA_DIR = join(
  import.meta.dirname,
  "../../data/book-ingest/autobiography-of-a-yogi",
);

// ── Types ────────────────────────────────────────────────────────

interface BookJson {
  book: {
    title: string;
    author: string;
    publisher: string;
    asin: string;
    language: string;
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
  pageRange: [number, number];
  sections: { heading: string | null; paragraphs: Paragraph[] }[];
  footnotes: Record<string, string>;
  metadata: Record<string, unknown>;
}

interface Chunk {
  content: string;
  pageNumber: number;
  sectionHeading: string | null;
  paragraphIndex: number;
  tokenEstimate: number;
}

// ── Helpers ──────────────────────────────────────────────────────

/** Rough token estimate: words × 1.33 (English average) */
function estimateTokens(text: string): number {
  return Math.ceil(text.split(/\s+/).filter(Boolean).length * 1.33);
}

/** Chunk paragraphs per FTR-023: merge short, split long */
function chunkParagraphs(
  paragraphs: Paragraph[],
  sectionHeading: string | null,
): Chunk[] {
  const chunks: Chunk[] = [];
  let buffer: Paragraph[] = [];
  let bufferTokens = 0;

  function flushBuffer() {
    if (buffer.length === 0) return;
    const content = buffer.map((p) => p.text).join("\n\n");
    chunks.push({
      content,
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

    // Skip chapter title repetitions (first paragraph is often just the chapter title)
    if (text.match(/^CHAPTER\s+\d+$/i)) continue;

    const tokens = estimateTokens(text);

    // If adding this paragraph would exceed max, flush first
    if (bufferTokens > 0 && bufferTokens + tokens > CHUNK_MAX_TOKENS) {
      flushBuffer();
    }

    buffer.push(para);
    bufferTokens += tokens;

    // If buffer has reached target range, flush
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
    readFileSync(join(DATA_DIR, "book.json"), "utf-8"),
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
    const chPath = join(DATA_DIR, chInfo.dataFile);
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
    const bookResult = await client.query(
      `INSERT INTO books (title, author, language, isbn, publication_year, author_tier, bookstore_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        book.title,
        book.author,
        book.language,
        book.asin,
        1946, // first publication year
        "guru",
        "https://bookstore.yogananda-srf.org/autobiography-of-a-yogi",
      ],
    );
    const bookId = bookResult.rows[0].id;
    console.log(`Book inserted: ${bookId}`);

    // Insert chapters and chunks
    let embeddingIdx = 0;
    let totalInserted = 0;

    for (const chData of allChunks) {
      // Insert chapter
      const chResult = await client.query(
        `INSERT INTO chapters (book_id, chapter_number, title, sort_order)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [bookId, chData.chapterNumber, chData.chapterTitle, chData.chapterNumber],
      );
      const chapterId = chResult.rows[0].id;

      // Insert chunks
      for (const chunk of chData.chunks) {
        const embedding =
          allEmbeddings && allEmbeddings[embeddingIdx]
            ? `[${allEmbeddings[embeddingIdx].join(",")}]`
            : null;

        await client.query(
          `INSERT INTO book_chunks (
            book_id, chapter_id, content, page_number, section_heading,
            paragraph_index, language, embedding, embedding_model, embedding_dimension
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
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
          ],
        );

        embeddingIdx++;
        totalInserted++;
      }
    }

    await client.query("COMMIT");
    console.log(`\nInserted ${totalInserted} chunks across ${allChunks.length} chapters.`);

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

    console.log(`\nVerification:`);
    console.log(`  Total chunks: ${countResult.rows[0].count}`);
    console.log(`  With search_vector: ${svResult.rows[0].count}`);
    console.log(`  With embedding: ${embResult.rows[0].count}`);
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
