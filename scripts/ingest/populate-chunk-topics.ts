/**
 * Populate chunk_topics join table from enriched topics.
 *
 * After enrich.ts populates book_chunks.topics[], this script maps
 * those topic labels to teaching_topics rows via embedding similarity,
 * populating the chunk_topics join table that powers theme pages.
 *
 * Two matching strategies:
 *   1. Exact/fuzzy text match — topic label matches teaching_topics.name
 *   2. Embedding similarity — topic label embedding vs description_embedding
 *
 * Usage:
 *   npx tsx scripts/ingest/populate-chunk-topics.ts [--book <slug>] [--dry-run] [--threshold 0.6]
 *
 * Requires: NEON_DATABASE_URL_DIRECT, VOYAGE_API_KEY (for embedding fallback)
 */

import pg from "pg";

// ── Configuration ────────────────────────────────────────────────

const SIMILARITY_THRESHOLD = 0.55; // Minimum cosine similarity for auto-tagging
const MAX_THEMES_PER_CHUNK = 3; // Cap themes per chunk to avoid noise
const VOYAGE_API_URL = "https://api.voyageai.com/v1/embeddings";
const EMBEDDING_MODEL = "voyage-4-large";

// ── Types ────────────────────────────────────────────────────────

interface ThemeRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  description_embedding: number[] | null;
}

interface ChunkTopicRow {
  chunk_id: string;
  topics: string[];
  book_slug: string;
}

// ── Embedding Helper ─────────────────────────────────────────────

async function getEmbeddings(
  texts: string[],
  apiKey: string,
): Promise<number[][]> {
  const response = await fetch(VOYAGE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: texts,
      input_type: "query",
    }),
  });

  if (!response.ok) {
    throw new Error(`Voyage API error: ${response.status}`);
  }

  const data = (await response.json()) as {
    data: { embedding: number[] }[];
  };
  return data.data.map((d) => d.embedding);
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ── Main ─────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");

  const bookIdx = args.indexOf("--book");
  const bookSlug = bookIdx >= 0 ? args[bookIdx + 1] : null;

  const thresholdIdx = args.indexOf("--threshold");
  const threshold =
    thresholdIdx >= 0
      ? parseFloat(args[thresholdIdx + 1])
      : SIMILARITY_THRESHOLD;

  const dbUrl = process.env.NEON_DATABASE_URL_DIRECT;
  const voyageKey = process.env.VOYAGE_API_KEY;

  if (!dbUrl) {
    console.error("NEON_DATABASE_URL_DIRECT not set.");
    process.exit(1);
  }

  const client = new pg.Client({ connectionString: dbUrl });
  await client.connect();

  console.log(`\nPopulate chunk_topics from enriched topics`);
  console.log(`Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);
  console.log(`Similarity threshold: ${threshold}`);
  if (bookSlug) console.log(`Book: ${bookSlug}`);
  console.log();

  // 1. Load all teaching_topics
  const { rows: themes } = await client.query<ThemeRow>(
    `SELECT id, name, slug, description, description_embedding::text
     FROM teaching_topics ORDER BY sort_order`,
  );
  console.log(`Teaching topics: ${themes.length}`);

  // Parse embeddings from text representation
  const themesWithEmbeddings = themes.map((t) => ({
    ...t,
    description_embedding: t.description_embedding
      ? JSON.parse(
          (t.description_embedding as unknown as string).replace(
            /^\[|\]$/g,
            (m) => m,
          ),
        )
      : null,
  }));

  // Build name-based lookup (lowercase)
  const nameMap = new Map<string, ThemeRow>();
  for (const theme of themes) {
    nameMap.set(theme.name.toLowerCase(), theme);
    nameMap.set(theme.slug.toLowerCase(), theme);
  }

  // 2. Get enriched chunks with topics
  const bookFilter = bookSlug
    ? `AND b.slug = $1`
    : "";
  const params = bookSlug ? [bookSlug] : [];

  const { rows: chunks } = await client.query<ChunkTopicRow>(
    `SELECT bc.id AS chunk_id, bc.topics, b.slug AS book_slug
     FROM book_chunks bc
     JOIN books b ON b.id = bc.book_id
     WHERE bc.topics IS NOT NULL
       AND array_length(bc.topics, 1) > 0
       AND bc.enriched_at IS NOT NULL
       ${bookFilter}
     ORDER BY bc.book_id, bc.id`,
    params,
  );
  console.log(`Enriched chunks with topics: ${chunks.length}`);

  // 3. Get existing chunk_topics to avoid duplicates
  const { rows: existingRows } = await client.query(
    `SELECT chunk_id, theme_id FROM chunk_topics`,
  );
  const existingSet = new Set(
    existingRows.map(
      (r: { chunk_id: string; theme_id: string }) =>
        `${r.chunk_id}:${r.theme_id}`,
    ),
  );
  console.log(`Existing chunk_topics: ${existingSet.size}`);

  // 4. Collect all unique topic labels that need embedding
  const allTopicLabels = new Set<string>();
  for (const chunk of chunks) {
    for (const topic of chunk.topics) {
      if (!nameMap.has(topic.toLowerCase())) {
        allTopicLabels.add(topic.toLowerCase());
      }
    }
  }

  // 5. Embed unique topic labels for similarity matching
  const topicEmbeddings = new Map<string, number[]>();
  if (allTopicLabels.size > 0 && voyageKey) {
    console.log(
      `\nEmbedding ${allTopicLabels.size} unique topic labels for similarity matching...`,
    );
    const labels = Array.from(allTopicLabels);
    const batchSize = 32;
    for (let i = 0; i < labels.length; i += batchSize) {
      const batch = labels.slice(i, i + batchSize);
      const embeddings = await getEmbeddings(batch, voyageKey);
      for (let j = 0; j < batch.length; j++) {
        topicEmbeddings.set(batch[j], embeddings[j]);
      }
    }
    console.log(`Embedded ${topicEmbeddings.size} topic labels.`);
  } else if (allTopicLabels.size > 0 && !voyageKey) {
    console.log(
      `\nWARNING: VOYAGE_API_KEY not set. Skipping embedding-based matching.`,
    );
    console.log(
      `${allTopicLabels.size} topic labels won't match via similarity.`,
    );
  }

  // 6. Match and insert
  let inserted = 0;
  let skippedExisting = 0;
  let noMatch = 0;

  for (const chunk of chunks) {
    let matchesForChunk = 0;

    for (const topic of chunk.topics) {
      if (matchesForChunk >= MAX_THEMES_PER_CHUNK) break;

      // Strategy 1: exact name/slug match
      const exactMatch = nameMap.get(topic.toLowerCase());
      if (exactMatch) {
        const key = `${chunk.chunk_id}:${exactMatch.id}`;
        if (existingSet.has(key)) {
          skippedExisting++;
          continue;
        }

        if (!dryRun) {
          await client.query(
            `INSERT INTO chunk_topics (chunk_id, theme_id, relevance, tagged_by, similarity)
             VALUES ($1, $2, 1.0, 'enrichment', 1.0)
             ON CONFLICT (chunk_id, theme_id) DO NOTHING`,
            [chunk.chunk_id, exactMatch.id],
          );
        }
        existingSet.add(key);
        inserted++;
        matchesForChunk++;
        continue;
      }

      // Strategy 2: embedding similarity
      const topicEmb = topicEmbeddings.get(topic.toLowerCase());
      if (!topicEmb) {
        noMatch++;
        continue;
      }

      let bestTheme: ThemeRow | null = null;
      let bestSim = 0;

      for (const theme of themesWithEmbeddings) {
        if (!theme.description_embedding) continue;
        const sim = cosineSimilarity(topicEmb, theme.description_embedding);
        if (sim > bestSim && sim >= threshold) {
          bestSim = sim;
          bestTheme = theme;
        }
      }

      if (bestTheme) {
        const key = `${chunk.chunk_id}:${bestTheme.id}`;
        if (existingSet.has(key)) {
          skippedExisting++;
          continue;
        }

        if (!dryRun) {
          await client.query(
            `INSERT INTO chunk_topics (chunk_id, theme_id, relevance, tagged_by, similarity)
             VALUES ($1, $2, $3, 'enrichment', $3)
             ON CONFLICT (chunk_id, theme_id) DO NOTHING`,
            [chunk.chunk_id, bestTheme.id, bestSim],
          );
        }
        existingSet.add(key);
        inserted++;
        matchesForChunk++;
      } else {
        noMatch++;
      }
    }
  }

  console.log(`\n--- Results ---`);
  console.log(`Inserted:         ${inserted}`);
  console.log(`Already existed:  ${skippedExisting}`);
  console.log(`No theme match:   ${noMatch}`);

  // Update ingestion status
  if (!dryRun && inserted > 0) {
    if (bookSlug) {
      await client.query(
        `UPDATE books SET ingestion_status = ingestion_status || '{"chunk_topics": "complete"}'::jsonb WHERE slug = $1`,
        [bookSlug],
      );
    } else {
      await client.query(
        `UPDATE books SET ingestion_status = ingestion_status || '{"chunk_topics": "complete"}'::jsonb`,
      );
    }
  }

  await client.end();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
