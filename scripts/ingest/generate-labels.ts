/**
 * Generate contextual labels for top chunk relations — M3c-4.
 *
 * Uses Claude Opus via AWS Bedrock to create brief, evocative labels
 * for the top-ranked relations. These labels are the soul of the
 * Related Teachings side panel — they tell the reader *why* two
 * passages are connected, not just *that* they are.
 *
 * Usage:
 *   npx tsx scripts/ingest/generate-labels.ts [--dry-run] [--limit N] [--batch-size N]
 *
 * Requires: AWS_REGION, NEON_DATABASE_URL_DIRECT
 */

import pg from "pg";

// ── Configuration ────────────────────────────────────────────────

// COG-3 Batch → Opus (DES-062: evocative labels require weighing connection quality)
const BEDROCK_MODEL = "us.anthropic.claude-opus-4-6-v1";
const BEDROCK_REGION = "us-east-1";
const MAX_TOKENS = 60;
const BATCH_SIZE = 10; // Concurrent Bedrock calls per batch
const BATCH_DELAY_MS = 500; // Delay between batches

// ── Args ─────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const limitIdx = args.indexOf("--limit");
const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : 0;
const batchSizeIdx = args.indexOf("--batch-size");
const batchSize = batchSizeIdx >= 0 ? parseInt(args[batchSizeIdx + 1], 10) : BATCH_SIZE;

// ── Bedrock Client ───────────────────────────────────────────────

async function callBedrock(sourceText: string, targetText: string): Promise<string | null> {
  const { BedrockRuntimeClient, InvokeModelCommand } = await import(
    "@aws-sdk/client-bedrock-runtime"
  );
  const client = new BedrockRuntimeClient({ region: BEDROCK_REGION });

  const prompt = `You are labeling a connection between two passages from Paramahansa Yogananda's writings for a reading companion sidebar.

Source passage (what the reader is currently reading):
"${sourceText.slice(0, 300)}"

Connected passage (from a different chapter):
"${targetText.slice(0, 300)}"

Write a brief, evocative label (8-15 words) that describes WHY these passages connect thematically. The label should:
- Start with a verb or gerund (e.g., "Echoes...", "Returns to...", "The same light...")
- Honor the spirit of the teachings
- Be specific to the actual content, not generic
- Never mention similarity scores or algorithms

Return ONLY the label text, nothing else.`;

  const body = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: MAX_TOKENS,
    messages: [{ role: "user", content: prompt }],
  });

  const command = new InvokeModelCommand({
    modelId: BEDROCK_MODEL,
    body: new TextEncoder().encode(body),
    contentType: "application/json",
    accept: "application/json",
  });

  const response = await client.send(command);
  const result = JSON.parse(new TextDecoder().decode(response.body));

  if (result.content?.[0]?.text) {
    const label = result.content[0].text.trim().replace(/^["']|["']$/g, "");
    return label.length > 5 ? label : null;
  }
  return null;
}

// ── Main ─────────────────────────────────────────────────────────

async function main() {
  const pool = new pg.Pool({
    connectionString: process.env.NEON_DATABASE_URL_DIRECT,
    ssl: { rejectUnauthorized: false },
  });

  try {
    // Get rank-1 cross-chapter relations needing labels
    const { rows } = await pool.query(`
      SELECT
        cr.source_chunk_id,
        cr.target_chunk_id,
        LEFT(s.content, 300) as source_text,
        LEFT(t.content, 300) as target_text,
        sc.chapter_number as src_ch,
        tc.chapter_number as tgt_ch,
        ROUND(cr.similarity::numeric, 3) as sim
      FROM chunk_relations cr
      JOIN book_chunks s ON s.id = cr.source_chunk_id
      JOIN book_chunks t ON t.id = cr.target_chunk_id
      JOIN chapters sc ON sc.id = s.chapter_id
      JOIN chapters tc ON tc.id = t.chapter_id
      WHERE cr.rank <= 2
        AND COALESCE(cr.relation_type, '') NOT IN ('translation', 'same_chapter')
        AND cr.relation_label IS NULL
      ORDER BY cr.similarity DESC
      ${limit > 0 ? `LIMIT ${limit}` : ""}
    `);

    console.log(`Found ${rows.length} relations needing labels${dryRun ? " (dry run)" : ""}`);

    let generated = 0;
    let failed = 0;

    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      console.log(`\nBatch ${Math.floor(i / batchSize) + 1}/${Math.ceil(rows.length / batchSize)} (${batch.length} relations)`);

      const results = await Promise.allSettled(
        batch.map(async (row) => {
          const label = await callBedrock(row.source_text, row.target_text);

          if (dryRun) {
            console.log(`  Ch.${row.src_ch} → Ch.${row.tgt_ch} (${row.sim}): ${label || "(no label)"}`);
            return;
          }

          if (label) {
            await pool.query(
              `UPDATE chunk_relations
               SET relation_label = $1, tagged_by = 'opus-4.6'
               WHERE source_chunk_id = $2 AND target_chunk_id = $3`,
              [label, row.source_chunk_id, row.target_chunk_id],
            );
            console.log(`  Ch.${row.src_ch} → Ch.${row.tgt_ch}: ${label}`);
          } else {
            console.log(`  Ch.${row.src_ch} → Ch.${row.tgt_ch}: (no label generated)`);
          }
          return label;
        }),
      );

      for (const r of results) {
        if (r.status === "fulfilled" && r.value) generated++;
        else if (r.status === "rejected") {
          failed++;
          console.error(`  Error: ${(r.reason as Error).message}`);
        }
      }

      // Rate limit between batches
      if (i + batchSize < rows.length) {
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
      }
    }

    console.log(`\nDone. Generated: ${generated}, Failed: ${failed}, Total: ${rows.length}`);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
