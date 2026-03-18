/**
 * Backfill embeddings for chunks that have embedding_model='pending'.
 *
 * Usage:
 *   npx tsx scripts/ingest/backfill-embeddings.ts
 *
 * Requires: NEON_DATABASE_URL_DIRECT, VOYAGE_API_KEY
 */

import pg from "pg";

const EMBEDDING_MODEL = "voyage-4-large";
const EMBEDDING_DIMENSIONS = 1024;
const VOYAGE_BATCH_SIZE = 16;
const VOYAGE_API_URL = "https://api.voyageai.com/v1/embeddings";

async function main() {
  const voyageKey = process.env.VOYAGE_API_KEY;
  const dbUrl = process.env.NEON_DATABASE_URL_DIRECT;

  if (!voyageKey) {
    console.error("VOYAGE_API_KEY not set.");
    process.exit(1);
  }
  if (!dbUrl) {
    console.error("NEON_DATABASE_URL_DIRECT not set.");
    process.exit(1);
  }

  const client = new pg.Client({ connectionString: dbUrl });
  await client.connect();

  // Get chunks needing embeddings
  const result = await client.query(
    `SELECT id, content FROM book_chunks
     WHERE embedding IS NULL
     ORDER BY created_at, id`,
  );

  const chunks = result.rows;
  console.log(`Found ${chunks.length} chunks needing embeddings.`);

  if (chunks.length === 0) {
    console.log("Nothing to do.");
    await client.end();
    return;
  }

  let totalTokens = 0;
  let processed = 0;

  for (let i = 0; i < chunks.length; i += VOYAGE_BATCH_SIZE) {
    const batch = chunks.slice(i, i + VOYAGE_BATCH_SIZE);
    const batchNum = Math.floor(i / VOYAGE_BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(chunks.length / VOYAGE_BATCH_SIZE);

    process.stdout.write(
      `Batch ${batchNum}/${totalBatches} (${batch.length} chunks)...`,
    );

    // Retry with backoff on 429 (rate limit)
    let response: Response | null = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      response = await fetch(VOYAGE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${voyageKey}`,
        },
        body: JSON.stringify({
          model: EMBEDDING_MODEL,
          input: batch.map((c) => c.content),
          input_type: "document",
        }),
      });

      if (response.status === 429) {
        const wait = Math.pow(2, attempt) * 21_000; // 21s, 42s, 84s...
        process.stdout.write(` rate limited, waiting ${wait / 1000}s...`);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }
      break;
    }

    if (!response || !response.ok) {
      const error = response ? await response.text() : "no response";
      throw new Error(`Voyage API error ${response?.status}: ${error}`);
    }

    const data = (await response.json()) as {
      data: { embedding: number[] }[];
      usage: { total_tokens: number };
    };

    totalTokens += data.usage.total_tokens;

    // Update each chunk with its embedding
    for (let j = 0; j < batch.length; j++) {
      const embedding = `[${data.data[j].embedding.join(",")}]`;
      await client.query(
        `UPDATE book_chunks
         SET embedding = $1, embedding_model = $2, embedding_dimension = $3, embedded_at = now()
         WHERE id = $4`,
        [embedding, EMBEDDING_MODEL, EMBEDDING_DIMENSIONS, batch[j].id],
      );
      processed++;
    }

    console.log(` done (${data.usage.total_tokens} tokens)`);

    // Rate limit: free tier is 3 RPM — wait 21s between batches
    if (i + VOYAGE_BATCH_SIZE < chunks.length) {
      await new Promise((r) => setTimeout(r, 21_000));
    }
  }

  // Verify
  const verifyResult = await client.query(
    "SELECT COUNT(*) as count FROM book_chunks WHERE embedding IS NOT NULL",
  );

  console.log(`\nDone. Processed: ${processed}, Total API tokens: ${totalTokens}`);
  console.log(`Chunks with embeddings: ${verifyResult.rows[0].count}`);

  await client.end();
}

main().catch((err) => {
  console.error("Embedding backfill failed:", err);
  process.exit(1);
});
