/**
 * Unified Enrichment Pipeline — FTR-026.
 *
 * Single Claude pass per chunk producing all metadata fields:
 * summary, topics, entities, domain, experiential_depth,
 * emotional_quality, voice_register, semantic_density,
 * accessibility_level, passage_role, practice_bridge,
 * rasa, rasa_confidence, cross_references.
 *
 * This is the missing keystone. Every enrichment column exists
 * in the schema (migrations 001 + 008 + 009) but nothing
 * populates them. This script closes the gap.
 *
 * Usage:
 *   npx tsx scripts/ingest/enrich.ts --book autobiography-of-a-yogi
 *   npx tsx scripts/ingest/enrich.ts --all
 *   npx tsx scripts/ingest/enrich.ts --book autobiography-of-a-yogi --force
 *   npx tsx scripts/ingest/enrich.ts --book autobiography-of-a-yogi --opus
 *   npx tsx scripts/ingest/enrich.ts --book autobiography-of-a-yogi --dry-run --limit 5
 *
 * Requires: AWS credentials (Bedrock), NEON_DATABASE_URL_DIRECT
 */

import pg from "pg";

// ── Configuration ────────────────────────────────────────────────

// Model IDs from lib/config.ts (duplicated here for script independence)
const SONNET_MODEL = "us.anthropic.claude-sonnet-4-6";
const OPUS_MODEL = "us.anthropic.claude-opus-4-6-v1";
const BEDROCK_REGION = process.env.AWS_REGION || "us-west-2";
const MAX_TOKENS = 1200;
const CONCURRENCY = 5; // Concurrent Bedrock calls
const BATCH_DELAY_MS = 200; // Delay between batches

// Design system closed vocabularies (must match CHECK constraints)
const VALID_VOICE_REGISTERS = [
  "sacred",
  "reverential",
  "instructional",
  "functional",
  "ambient",
];
const VALID_RASAS = ["shanta", "adbhuta", "karuna", "vira", "bhakti"];
const VALID_DOMAINS = [
  "philosophy",
  "narrative",
  "technique",
  "devotional",
  "poetry",
];
const VALID_PASSAGE_ROLES = [
  "opening",
  "exposition",
  "narrative",
  "turning_point",
  "deepening",
  "illustration",
  "culmination",
  "resolution",
  "transition",
  "aside",
];
const VALID_EMOTIONAL_QUALITIES = [
  "consoling",
  "inspiring",
  "instructional",
  "devotional",
  "demanding",
  "celebratory",
];
const VALID_SEMANTIC_DENSITIES = ["high", "medium", "low"];

// ── Types ────────────────────────────────────────────────────────

interface EnrichmentOutput {
  summary: string;
  topics: string[];
  entities: Record<string, string[]>;
  domain: string;
  experiential_depth: number;
  emotional_quality: string[];
  voice_register: string;
  accessibility_level: number;
  semantic_density: string;
  passage_role: string;
  practice_bridge_candidate: boolean;
  rasa: string;
  rasa_confidence: number;
  cross_references: Array<{
    type: string;
    ref: string;
    explicit: boolean;
  }>;
}

interface ChunkRow {
  id: string;
  content: string;
  chapter_title: string;
  chapter_number: number;
  book_title: string;
  book_author: string;
  language: string;
  paragraph_index: number;
  content_type: string;
}

// ── Enrichment Prompt ────────────────────────────────────────────

function buildEnrichmentPrompt(chunk: ChunkRow): string {
  return `You are enriching a passage from "${chunk.book_title}" by ${chunk.book_author} for a sacred text search portal. This passage is from Chapter ${chunk.chapter_number}: "${chunk.chapter_title}" (paragraph ${chunk.paragraph_index}, content type: ${chunk.content_type}).

The passage (in ${chunk.language}):
"""
${chunk.content}
"""

Produce a single JSON object with ALL of the following fields. Be precise — these fields power search, navigation, curation, and the reading experience.

{
  "summary": "This passage is primarily about... (1-2 sentences, in the passage's language: ${chunk.language})",

  "topics": ["array of 2-5 canonical topic labels for thematic indexing — use lowercase, e.g., 'cosmic consciousness', 'guru-disciple relationship', 'meditation', 'divine mother'"],

  "entities": {
    "teachers": ["named spiritual teachers mentioned"],
    "divine_names": ["names of God/Divine mentioned"],
    "techniques": ["spiritual practices mentioned"],
    "sanskrit_terms": ["Sanskrit/Hindi terms used (IAST form)"],
    "works": ["books, scriptures, or texts referenced"],
    "concepts": ["philosophical/spiritual concepts"],
    "places": ["geographic locations mentioned"],
    "experiential_states": ["states of consciousness described"]
  },

  "domain": "ONE of: philosophy | narrative | technique | devotional | poetry",

  "experiential_depth": "INTEGER 1-7: 1=ordinary waking, 2=relaxed concentration, 3=pratyahara (sensory withdrawal), 4=dharana (focused concentration), 5=dhyana (meditation absorption), 6=savikalpa samadhi, 7=nirvikalpa samadhi/cosmic consciousness. Rate the DEEPEST state described or implied.",

  "emotional_quality": ["1-3 from: consoling, inspiring, instructional, devotional, demanding, celebratory"],

  "voice_register": "ONE of: sacred (profound spiritual truth) | reverential (devotional, honoring) | instructional (teaching, explaining) | functional (biographical, informational) | ambient (transitional, scene-setting)",

  "accessibility_level": "INTEGER 1-5: 1=universal (anyone can understand), 2=accessible (basic spiritual familiarity), 3=intermediate (some yogic concepts), 4=advanced (assumes meditation practice), 5=esoteric (deep philosophical/experiential)",

  "semantic_density": "ONE of: high (maximum meaning per word — aphorisms, revelations) | medium (standard teaching prose) | low (narrative, transition, biographical detail)",

  "passage_role": "ONE of: opening | exposition | narrative | turning_point | deepening | illustration | culmination | resolution | transition | aside — the rhetorical function of this passage within its chapter",

  "practice_bridge_candidate": "BOOLEAN — true if the passage contains instructional language inviting the reader to practice: 'meditate', 'visualize', 'concentrate', 'close your eyes', 'practice this', or similar direct injunctions to act",

  "rasa": "ONE of: shanta (peace/equanimity) | adbhuta (wonder/awe) | karuna (compassion/tenderness) | vira (courage/discipline) | bhakti (devotion/surrender) — the prevailing aesthetic flavor this passage evokes in the reader",

  "rasa_confidence": "FLOAT 0.0-1.0 — how clearly this passage evokes a single rasa",

  "cross_references": [{"type": "scripture|teacher|concept|event", "ref": "specific reference text", "explicit": true}]
}

Return ONLY the JSON object. No markdown, no explanation.`;
}

// ── Bedrock Client ───────────────────────────────────────────────

let bedrockClient: InstanceType<
  typeof import("@aws-sdk/client-bedrock-runtime").BedrockRuntimeClient
> | null = null;

async function getBedrockClient() {
  if (bedrockClient) return bedrockClient;
  const { BedrockRuntimeClient } = await import(
    "@aws-sdk/client-bedrock-runtime"
  );
  bedrockClient = new BedrockRuntimeClient({ region: BEDROCK_REGION });
  return bedrockClient;
}

async function callBedrock(
  prompt: string,
  model: string,
): Promise<string | null> {
  const { InvokeModelCommand } = await import(
    "@aws-sdk/client-bedrock-runtime"
  );
  const client = await getBedrockClient();

  const body = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: MAX_TOKENS,
    messages: [{ role: "user", content: prompt }],
  });

  const command = new InvokeModelCommand({
    modelId: model,
    body: new TextEncoder().encode(body),
    contentType: "application/json",
    accept: "application/json",
  });

  const response = await client.send(command);
  const result = JSON.parse(new TextDecoder().decode(response.body));

  if (result.content?.[0]?.text) {
    return result.content[0].text.trim();
  }
  return null;
}

// ── Parse & Validate ─────────────────────────────────────────────

function parseEnrichment(raw: string): EnrichmentOutput | null {
  // Extract JSON from possible markdown wrapping
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[0]);

    // Validate and clamp to closed vocabularies
    const domain = VALID_DOMAINS.includes(parsed.domain)
      ? parsed.domain
      : "narrative";
    const voiceRegister = VALID_VOICE_REGISTERS.includes(
      parsed.voice_register,
    )
      ? parsed.voice_register
      : "functional";
    const rasa = VALID_RASAS.includes(parsed.rasa) ? parsed.rasa : "shanta";
    const passageRole = VALID_PASSAGE_ROLES.includes(parsed.passage_role)
      ? parsed.passage_role
      : "exposition";
    const semanticDensity = VALID_SEMANTIC_DENSITIES.includes(
      parsed.semantic_density,
    )
      ? parsed.semantic_density
      : "medium";
    const emotionalQuality = Array.isArray(parsed.emotional_quality)
      ? parsed.emotional_quality.filter((q: string) =>
          VALID_EMOTIONAL_QUALITIES.includes(q),
        )
      : [];

    return {
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
      topics: Array.isArray(parsed.topics)
        ? parsed.topics.filter((t: unknown) => typeof t === "string")
        : [],
      entities:
        typeof parsed.entities === "object" && parsed.entities !== null
          ? parsed.entities
          : {},
      domain,
      experiential_depth: Math.min(
        7,
        Math.max(1, parseInt(parsed.experiential_depth) || 1),
      ),
      emotional_quality: emotionalQuality,
      voice_register: voiceRegister,
      accessibility_level: Math.min(
        5,
        Math.max(1, parseInt(parsed.accessibility_level) || 2),
      ),
      semantic_density: semanticDensity,
      passage_role: passageRole,
      practice_bridge_candidate: !!parsed.practice_bridge_candidate,
      rasa,
      rasa_confidence: Math.min(
        1,
        Math.max(0, parseFloat(parsed.rasa_confidence) || 0.5),
      ),
      cross_references: Array.isArray(parsed.cross_references)
        ? parsed.cross_references
        : [],
    };
  } catch {
    return null;
  }
}

// ── Database Update ──────────────────────────────────────────────

async function updateChunk(
  client: pg.Client,
  chunkId: string,
  enrichment: EnrichmentOutput,
  model: string,
): Promise<void> {
  await client.query(
    `UPDATE book_chunks SET
      summary = $1,
      topics = $2,
      entities = $3,
      domain = $4,
      experiential_depth = $5,
      emotional_quality = $6,
      voice_register = $7,
      accessibility_level = $8,
      semantic_density = $9,
      passage_role = $10,
      practice_bridge = $11,
      rasa = $12,
      rasa_confidence = $13,
      cross_references = $14,
      enrichment_model = $15,
      enriched_at = now()
    WHERE id = $16`,
    [
      enrichment.summary,
      enrichment.topics,
      JSON.stringify(enrichment.entities),
      enrichment.domain,
      enrichment.experiential_depth,
      enrichment.emotional_quality,
      enrichment.voice_register,
      enrichment.accessibility_level,
      enrichment.semantic_density,
      enrichment.passage_role,
      enrichment.practice_bridge_candidate,
      enrichment.rasa,
      enrichment.rasa_confidence,
      JSON.stringify(enrichment.cross_references),
      model,
      chunkId,
    ],
  );
}

// ── Pipeline ─────────────────────────────────────────────────────

async function enrichChunk(
  chunk: ChunkRow,
  model: string,
): Promise<EnrichmentOutput | null> {
  const prompt = buildEnrichmentPrompt(chunk);
  const raw = await callBedrock(prompt, model);
  if (!raw) return null;
  return parseEnrichment(raw);
}

async function processBatch(
  chunks: ChunkRow[],
  model: string,
  client: pg.Client,
  dryRun: boolean,
  stats: { enriched: number; failed: number; skipped: number },
): Promise<void> {
  const results = await Promise.allSettled(
    chunks.map(async (chunk) => {
      const enrichment = await enrichChunk(chunk, model);
      if (!enrichment) {
        stats.failed++;
        console.error(`  FAIL: chunk ${chunk.id.slice(0, 8)} — no valid JSON`);
        return;
      }

      if (dryRun) {
        console.log(
          `  DRY: ${chunk.id.slice(0, 8)} → ${enrichment.domain} / ${enrichment.rasa} / depth=${enrichment.experiential_depth} / "${enrichment.summary.slice(0, 60)}..."`,
        );
      } else {
        await updateChunk(client, chunk.id, enrichment, model);
        console.log(
          `  OK:  ${chunk.id.slice(0, 8)} → ${enrichment.domain} / ${enrichment.rasa} / depth=${enrichment.experiential_depth}`,
        );
      }
      stats.enriched++;
    }),
  );

  // Log any unhandled rejections
  for (const result of results) {
    if (result.status === "rejected") {
      stats.failed++;
      console.error(`  ERROR: ${result.reason}`);
    }
  }
}

// ── Main ─────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const force = args.includes("--force");
  const useOpus = args.includes("--opus");
  const enrichAll = args.includes("--all");

  const bookIdx = args.indexOf("--book");
  const bookSlug =
    bookIdx >= 0 ? args[bookIdx + 1] : enrichAll ? null : null;

  const limitIdx = args.indexOf("--limit");
  const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : 0;

  const concurrencyIdx = args.indexOf("--concurrency");
  const concurrency =
    concurrencyIdx >= 0
      ? parseInt(args[concurrencyIdx + 1], 10)
      : CONCURRENCY;

  if (!bookSlug && !enrichAll) {
    console.error(
      "Usage: npx tsx scripts/ingest/enrich.ts --book <slug> [--force] [--opus] [--dry-run] [--limit N]",
    );
    console.error(
      "       npx tsx scripts/ingest/enrich.ts --all [--force] [--opus] [--dry-run] [--limit N]",
    );
    process.exit(1);
  }

  const model = useOpus ? OPUS_MODEL : SONNET_MODEL;
  const modelName = useOpus ? "opus-4.6" : "sonnet-4.6";

  const dbUrl = process.env.NEON_DATABASE_URL_DIRECT;
  if (!dbUrl) {
    console.error("NEON_DATABASE_URL_DIRECT not set.");
    process.exit(1);
  }

  const client = new pg.Client({ connectionString: dbUrl });
  await client.connect();

  console.log(`\nFTR-026 Unified Enrichment Pipeline`);
  console.log(`Model: ${modelName} (${model})`);
  console.log(`Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);
  console.log(`Force re-enrich: ${force}`);
  if (limit) console.log(`Limit: ${limit} chunks`);
  console.log();

  // Build query
  const conditions: string[] = [];
  const params: (string | number)[] = [];
  let paramIdx = 0;

  if (bookSlug) {
    paramIdx++;
    conditions.push(`b.slug = $${paramIdx}`);
    params.push(bookSlug);
  }

  if (!force) {
    conditions.push(`bc.enriched_at IS NULL`);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const limitClause = limit > 0 ? `LIMIT ${limit}` : "";

  const query = `
    SELECT bc.id, bc.content, bc.language, bc.paragraph_index,
           bc.content_type,
           c.title AS chapter_title, c.chapter_number,
           b.title AS book_title, b.author AS book_author
    FROM book_chunks bc
    JOIN chapters c ON c.id = bc.chapter_id
    JOIN books b ON b.id = bc.book_id
    ${whereClause}
    ORDER BY b.id, c.sort_order, COALESCE(bc.sort_order, bc.paragraph_index)
    ${limitClause}
  `;

  const { rows: chunks } = await client.query(query, params);
  console.log(`Found ${chunks.length} chunks to enrich.\n`);

  if (chunks.length === 0) {
    console.log("Nothing to do.");
    await client.end();
    return;
  }

  // Estimate cost
  const avgInputTokens = 800; // prompt + passage
  const avgOutputTokens = 400; // JSON response
  const inputCostPerMTok = useOpus ? 15 : 3;
  const outputCostPerMTok = useOpus ? 75 : 15;
  const estInputCost =
    (chunks.length * avgInputTokens * inputCostPerMTok) / 1_000_000;
  const estOutputCost =
    (chunks.length * avgOutputTokens * outputCostPerMTok) / 1_000_000;
  console.log(
    `Estimated cost: ~$${(estInputCost + estOutputCost).toFixed(2)} (${chunks.length} chunks × ${modelName})\n`,
  );

  const stats = { enriched: 0, failed: 0, skipped: 0 };
  const startTime = Date.now();

  // Process in batches
  for (let i = 0; i < chunks.length; i += concurrency) {
    const batch = chunks.slice(i, i + concurrency);
    const batchNum = Math.floor(i / concurrency) + 1;
    const totalBatches = Math.ceil(chunks.length / concurrency);

    console.log(
      `Batch ${batchNum}/${totalBatches} (${batch.length} chunks):`,
    );

    await processBatch(batch, model, client, dryRun, stats);

    // Rate limiting between batches
    if (i + concurrency < chunks.length) {
      await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`\n--- Enrichment Complete ---`);
  console.log(`Enriched: ${stats.enriched}`);
  console.log(`Failed:   ${stats.failed}`);
  console.log(`Time:     ${elapsed}s`);
  console.log(`Model:    ${modelName}`);

  // Update ingestion_status on books
  if (!dryRun && stats.enriched > 0) {
    if (bookSlug) {
      await client.query(
        `UPDATE books SET ingestion_status = ingestion_status || '{"enrich": "complete"}'::jsonb WHERE slug = $1`,
        [bookSlug],
      );
    } else {
      await client.query(
        `UPDATE books SET ingestion_status = ingestion_status || '{"enrich": "complete"}'::jsonb`,
      );
    }
    console.log(`\nUpdated ingestion_status.enrich = "complete".`);
  }

  await client.end();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
