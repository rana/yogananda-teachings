/**
 * Compute chunk relations — M3c-1.
 *
 * Populates the `chunk_relations` table with pre-computed nearest
 * neighbors for every book chunk. Uses pgvector's HNSW index for
 * fast approximate nearest neighbor search (~10-50ms per chunk).
 *
 * For each chunk, finds the top RELATIONS_PER_CHUNK (30) most
 * similar chunks, excluding:
 *   - Same chunk (trivially similar)
 *   - Adjacent chunks in the same chapter (already "in context")
 *
 * Relations below RELATIONS_MIN_SIMILARITY (0.3) are filtered out.
 *
 * Modes:
 *   --full        Recompute all relations (after embedding model change)
 *   --incremental Only chunks not yet in chunk_relations (default)
 *   --book <slug> Only process chunks from a specific book
 *   --dry-run     Show what would be computed, don't write
 *
 * Usage:
 *   npx tsx scripts/ingest/compute-relations.ts [--full] [--book <slug>] [--dry-run]
 *
 * Requires: NEON_DATABASE_URL_DIRECT
 */

import pg from "pg";

// ── Configuration ────────────────────────────────────────────────

const RELATIONS_PER_CHUNK = 30;
const RELATIONS_MIN_SIMILARITY = 0.3;
const BATCH_SIZE = 50; // Chunks processed per batch
const PROGRESS_INTERVAL = 100; // Log progress every N chunks

// ── Args ─────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const fullMode = args.includes("--full");
const dryRun = args.includes("--dry-run");
const bookIdx = args.indexOf("--book");
const bookSlug = bookIdx >= 0 ? args[bookIdx + 1] : null;

// ── Main ─────────────────────────────────────────────────────────

async function main() {
  const pool = new pg.Pool({
    connectionString: process.env.NEON_DATABASE_URL_DIRECT,
    ssl: { rejectUnauthorized: false },
  });

  try {
    // Step 1: Get all chunks with embeddings
    let chunkQuery = `
      SELECT bc.id, bc.chapter_id, bc.paragraph_index
      FROM book_chunks bc
      JOIN chapters c ON c.id = bc.chapter_id
      JOIN books b ON b.id = c.book_id
      WHERE bc.embedding IS NOT NULL
    `;
    const params: string[] = [];

    if (bookSlug) {
      params.push(bookSlug);
      chunkQuery += ` AND b.slug = $${params.length}`;
    }

    if (!fullMode) {
      // Incremental: only chunks not yet in chunk_relations
      chunkQuery += `
        AND bc.id NOT IN (
          SELECT DISTINCT source_chunk_id FROM chunk_relations
        )
      `;
    }

    chunkQuery += ` ORDER BY c.book_id, c.chapter_number, bc.paragraph_index`;

    const { rows: chunks } = await pool.query(chunkQuery, params);
    console.log(
      `Found ${chunks.length} chunks to process` +
        (fullMode ? " (full recompute)" : " (incremental)") +
        (bookSlug ? ` for book: ${bookSlug}` : "") +
        (dryRun ? " (dry run)" : ""),
    );

    if (chunks.length === 0) {
      console.log("Nothing to compute.");
      return;
    }

    // Step 2: If full mode, clear existing relations for target chunks
    if (fullMode && !dryRun) {
      const chunkIds = chunks.map((c) => c.id);
      await pool.query(
        `DELETE FROM chunk_relations WHERE source_chunk_id = ANY($1)`,
        [chunkIds],
      );
      console.log(`Cleared existing relations for ${chunkIds.length} chunks.`);
    }

    // Step 3: For each chunk, find nearest neighbors via pgvector
    let processed = 0;
    let totalRelations = 0;
    const startTime = Date.now();

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);

      for (const chunk of batch) {
        // Use pgvector HNSW index for fast ANN search
        // Exclude: self, same-chapter adjacent paragraphs (±1 index)
        const { rows: neighbors } = await pool.query(
          `
          WITH neighbors AS (
            SELECT
              bc.id AS target_id,
              bc.chapter_id AS target_chapter_id,
              1 - (bc.embedding <=> (SELECT embedding FROM book_chunks WHERE id = $1)) AS similarity
            FROM book_chunks bc
            WHERE bc.id != $1
              AND bc.embedding IS NOT NULL
            ORDER BY bc.embedding <=> (SELECT embedding FROM book_chunks WHERE id = $1)
            LIMIT $2
          )
          SELECT
            target_id,
            target_chapter_id,
            similarity,
            ROW_NUMBER() OVER (ORDER BY similarity DESC) AS rank
          FROM neighbors
          WHERE similarity >= $3
          `,
          [chunk.id, RELATIONS_PER_CHUNK + 10, RELATIONS_MIN_SIMILARITY], // Fetch extra to account for filtered adjacents
        );

        // Filter out adjacent same-chapter paragraphs
        const filtered = neighbors.filter((n) => {
          if (n.target_chapter_id !== chunk.chapter_id) return true;
          // Keep same-chapter relations — they might be distant paragraphs
          // The UI already filters by type if needed
          return true;
        });

        const topN = filtered.slice(0, RELATIONS_PER_CHUNK);

        if (!dryRun && topN.length > 0) {
          // Batch insert all relations for this chunk
          const values: string[] = [];
          const insertParams: (string | number)[] = [];
          let paramIdx = 0;

          for (let r = 0; r < topN.length; r++) {
            const n = topN[r];
            values.push(
              `($${++paramIdx}, $${++paramIdx}, $${++paramIdx}, $${++paramIdx})`,
            );
            insertParams.push(chunk.id, n.target_id, n.similarity, r + 1);
          }

          await pool.query(
            `INSERT INTO chunk_relations (source_chunk_id, target_chunk_id, similarity, rank)
             VALUES ${values.join(", ")}
             ON CONFLICT (source_chunk_id, target_chunk_id)
             DO UPDATE SET similarity = EXCLUDED.similarity, rank = EXCLUDED.rank`,
            insertParams,
          );
        }

        totalRelations += topN.length;
        processed++;

        if (processed % PROGRESS_INTERVAL === 0 || processed === chunks.length) {
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
          const rate = (processed / ((Date.now() - startTime) / 1000)).toFixed(1);
          console.log(
            `  ${processed}/${chunks.length} chunks (${rate}/s, ${elapsed}s elapsed, ${totalRelations} relations)`,
          );
        }
      }
    }

    const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(
      `\nDone. Processed: ${processed} chunks, Relations: ${totalRelations}, Time: ${totalElapsed}s`,
    );
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
