/**
 * Generate suggestion dictionary — FTR-029.
 *
 * Transforms enrichment data (topics, entities, Sanskrit terms, co-occurrences)
 * into the suggestion_dictionary table and prefix-partitioned static JSON files.
 *
 * Nine harvest steps:
 *   1. Harvest topics from book_chunks.topics
 *   2. Harvest entities from entity_registry
 *   3. Harvest Sanskrit terms from sanskrit_terms
 *   4. Generate scoped queries from entity-topic co-occurrence
 *   5. Harvest chapter titles
 *   6. Load curated content
 *   7. Compute weights
 *   8. Export to DB + static JSON
 *   9. Validate
 *
 * Idempotent: TRUNCATE + INSERT on each run.
 *
 * Usage:
 *   npx tsx scripts/generate-suggestion-dictionary.ts
 *
 * Requires: NEON_DATABASE_URL
 */

import pg from "pg";
import { writeFileSync, mkdirSync, rmSync, existsSync } from "fs";
import { join } from "path";

import {
  SUGGEST_MIN_TOPIC_FREQUENCY,
  SUGGEST_MIN_COOCCURRENCE,
  SUGGEST_MAX_SCOPED_PER_ENTITY,
  SUGGEST_WEIGHT_CORPUS,
  SUGGEST_WEIGHT_EDITORIAL,
} from "../lib/config";

import curatedQueries from "../lib/data/curated-queries.json";
import scopedTemplates from "../lib/data/scoped-query-templates.json";
import overridesData from "../lib/data/suggestion-overrides.json";

// ── Types ────────────────────────────────────────────

interface DictionaryEntry {
  suggestion: string;
  display_text: string | null;
  suggestion_type: "scoped" | "entity" | "topic" | "sanskrit" | "editorial" | "curated" | "chapter";
  language: string;
  script: string;
  latin_form: string | null;
  corpus_frequency: number;
  editorial_boost: number;
  weight: number;
  entity_id: string | null;
  book_id: string | null;
}

interface BridgeExport {
  stem: string;
  expression: string;
  yogananda_terms: string[];
  crisis_adjacent: boolean;
}

interface StaticSuggestion {
  text: string;
  display: string | null;
  type: string;
  weight: number;
}

type ScopedTemplates = Record<string, Record<string, string>>;
type CuratedData = Record<string, { chips: string[]; questions: string[] }>;
type OverrideEntry = { suggestion: string; language: string; editorial_boost: number };

// ── Topic Normalization ──────────────────────────────

function normalizeTopics(
  rawTopics: Array<{ topic: string; freq: number }>,
): Array<{ topic: string; freq: number }> {
  // NFC normalize + lowercase
  const normalized = rawTopics.map((t) => ({
    topic: t.topic.normalize("NFC").toLowerCase().trim(),
    freq: t.freq,
  }));

  // Build frequency map
  const freqMap = new Map<string, number>();
  for (const { topic, freq } of normalized) {
    freqMap.set(topic, (freqMap.get(topic) || 0) + freq);
  }

  // Collapse plurals: if "Xs" exists and "X" exists, merge into higher-freq form
  const toRemove = new Set<string>();
  for (const topic of freqMap.keys()) {
    if (topic.endsWith("s") && topic.length > 3) {
      const singular = topic.slice(0, -1);
      if (freqMap.has(singular)) {
        const pluralFreq = freqMap.get(topic)!;
        const singularFreq = freqMap.get(singular)!;
        // Keep the form with higher frequency, merge counts
        if (singularFreq >= pluralFreq) {
          freqMap.set(singular, singularFreq + pluralFreq);
          toRemove.add(topic);
        } else {
          freqMap.set(topic, singularFreq + pluralFreq);
          toRemove.add(singular);
        }
      }
    }
    // Also check "ies" -> "y" (e.g., "communities" -> "community")
    if (topic.endsWith("ies") && topic.length > 4) {
      const singular = topic.slice(0, -3) + "y";
      if (freqMap.has(singular)) {
        const pluralFreq = freqMap.get(topic)!;
        const singularFreq = freqMap.get(singular)!;
        if (singularFreq >= pluralFreq) {
          freqMap.set(singular, singularFreq + pluralFreq);
          toRemove.add(topic);
        } else {
          freqMap.set(topic, singularFreq + pluralFreq);
          toRemove.add(singular);
        }
      }
    }
  }

  for (const r of toRemove) {
    freqMap.delete(r);
  }

  return Array.from(freqMap.entries())
    .map(([topic, freq]) => ({ topic, freq }))
    .sort((a, b) => b.freq - a.freq);
}

// ── Entity Alias Resolution ──────────────────────────

interface EntityInfo {
  id: string;
  canonical_name: string;
  entity_type: string;
  aliases: string[];
  definition: string;
}

function buildAliasMap(entities: EntityInfo[]): Map<string, EntityInfo> {
  const map = new Map<string, EntityInfo>();
  for (const entity of entities) {
    // Map canonical name and all aliases (lowercased) to the entity
    map.set(entity.canonical_name.toLowerCase(), entity);
    for (const alias of entity.aliases) {
      map.set(alias.toLowerCase(), entity);
    }
  }
  return map;
}

// ── Bridge Stem Computation ──────────────────────────

function computeStem(expression: string): string {
  const lower = expression.toLowerCase();
  // Trim common suffixes to create prefix-matchable stems
  const suffixes = ["fulness", "ness", "ment", "tion", "sion", "ing", "ity", "ous", "ive", "ly", "es", "ed", "s"];
  for (const suffix of suffixes) {
    if (lower.endsWith(suffix) && lower.length - suffix.length >= 3) {
      return lower.slice(0, -suffix.length);
    }
  }
  return lower;
}

// ── Step 1: Harvest Topics ───────────────────────────

async function harvestTopics(pool: pg.Pool, language: string): Promise<DictionaryEntry[]> {
  const { rows } = await pool.query(
    `SELECT unnest(topics) AS topic, COUNT(*) AS freq
     FROM book_chunks
     WHERE language = $1 AND topics IS NOT NULL AND array_length(topics, 1) > 0
     GROUP BY 1
     HAVING COUNT(*) >= $2`,
    [language, SUGGEST_MIN_TOPIC_FREQUENCY],
  );

  const normalized = normalizeTopics(rows.map((r) => ({ topic: r.topic, freq: Number(r.freq) })));

  return normalized.map((t) => ({
    suggestion: t.topic,
    display_text: null,
    suggestion_type: "topic" as const,
    language,
    script: "latn",
    latin_form: null,
    corpus_frequency: t.freq,
    editorial_boost: 0,
    weight: 0,
    entity_id: null,
    book_id: null,
  }));
}

// ── Step 2: Harvest Entities ─────────────────────────

async function harvestEntities(pool: pg.Pool, language: string): Promise<DictionaryEntry[]> {
  const { rows: entityRows } = await pool.query(
    `SELECT id, canonical_name, entity_type, aliases, definition
     FROM entity_registry`,
  );

  const entities: EntityInfo[] = entityRows.map((r) => ({
    id: r.id,
    canonical_name: r.canonical_name,
    entity_type: r.entity_type,
    aliases: r.aliases || [],
    definition: r.definition || "",
  }));

  const aliasMap = buildAliasMap(entities);

  // Count corpus frequency: how often each canonical entity appears in book_chunks JSONB
  const entityKeys = ["teachers", "divine_names", "techniques", "concepts", "works", "places"];
  const freqMap = new Map<string, number>();

  for (const key of entityKeys) {
    const { rows } = await pool.query(
      `SELECT mention, COUNT(*) AS freq
       FROM (
         SELECT jsonb_array_elements_text(entities->'${key}') AS mention
         FROM book_chunks
         WHERE language = $1
           AND entities->'${key}' IS NOT NULL
           AND jsonb_array_length(entities->'${key}') > 0
       ) t
       GROUP BY mention`,
      [language],
    );
    for (const row of rows) {
      const resolved = aliasMap.get(row.mention.toLowerCase());
      if (resolved) {
        const current = freqMap.get(resolved.id) || 0;
        freqMap.set(resolved.id, current + Number(row.freq));
      }
    }
  }

  return entities.map((entity) => ({
    suggestion: entity.canonical_name,
    display_text: entity.definition ? `${entity.canonical_name} \u2014 ${entity.definition}` : null,
    suggestion_type: "entity" as const,
    language,
    script: "latn",
    latin_form: null,
    corpus_frequency: freqMap.get(entity.id) || 0,
    editorial_boost: 0,
    weight: 0,
    entity_id: entity.id,
    book_id: null,
  }));
}

// ── Step 3: Harvest Sanskrit Terms ───────────────────

async function harvestSanskrit(pool: pg.Pool): Promise<DictionaryEntry[]> {
  const { rows } = await pool.query(
    `SELECT canonical_form, display_form, devanagari, iast_form, srf_definition, weight
     FROM sanskrit_terms`,
  );

  return rows.map((r) => ({
    suggestion: r.canonical_form,
    display_text: r.srf_definition ? `${r.display_form} \u2014 ${r.srf_definition}` : r.display_form,
    suggestion_type: "sanskrit" as const,
    language: "en",
    script: "latn",
    latin_form: r.iast_form,
    corpus_frequency: r.weight || 0,
    editorial_boost: 0,
    weight: 0,
    entity_id: null,
    book_id: null,
  }));
}

// ── Step 4: Generate Scoped Queries ──────────────────

async function generateScopedQueries(
  pool: pg.Pool,
  language: string,
  aliasMap: Map<string, EntityInfo>,
): Promise<DictionaryEntry[]> {
  const templates = (scopedTemplates as ScopedTemplates)[language] || (scopedTemplates as ScopedTemplates).en;

  // Find entity-topic co-occurrences from teacher mentions
  const { rows } = await pool.query(
    `SELECT mention, topic, cooccurrence FROM (
       SELECT
         jsonb_array_elements_text(bc.entities->'teachers') AS mention,
         unnest(bc.topics) AS topic,
         COUNT(*) AS cooccurrence
       FROM book_chunks bc
       WHERE bc.language = $1
         AND bc.entities->'teachers' IS NOT NULL
         AND jsonb_array_length(bc.entities->'teachers') > 0
         AND bc.topics IS NOT NULL
       GROUP BY 1, 2
       HAVING COUNT(*) >= $2
     ) t
     ORDER BY cooccurrence DESC`,
    [language, SUGGEST_MIN_COOCCURRENCE],
  );

  // Group by resolved entity, take top N per entity
  const entityTopics = new Map<string, Array<{ topic: string; cooccurrence: number }>>();

  for (const row of rows) {
    if (!row.mention || !row.topic) continue;
    const resolved = aliasMap.get(row.mention.toLowerCase());
    if (!resolved) continue;
    // Only teachers and techniques get scoped queries
    if (resolved.entity_type !== "teacher" && resolved.entity_type !== "technique") continue;

    const key = resolved.id;
    if (!entityTopics.has(key)) entityTopics.set(key, []);
    const list = entityTopics.get(key)!;

    // Deduplicate normalized topics
    const normalizedTopic = row.topic.toLowerCase().normalize("NFC").trim();
    if (list.some((t) => t.topic === normalizedTopic)) {
      const existing = list.find((t) => t.topic === normalizedTopic)!;
      existing.cooccurrence += Number(row.cooccurrence);
      continue;
    }

    list.push({ topic: normalizedTopic, cooccurrence: Number(row.cooccurrence) });
  }

  const entries: DictionaryEntry[] = [];

  for (const [entityId, topics] of entityTopics) {
    const entity = Array.from(aliasMap.values()).find((e) => e.id === entityId);
    if (!entity) continue;

    const template = entity.entity_type === "technique" ? templates.technique : templates.teacher;
    const topN = topics.sort((a, b) => b.cooccurrence - a.cooccurrence).slice(0, SUGGEST_MAX_SCOPED_PER_ENTITY);

    for (const { topic, cooccurrence } of topN) {
      const suggestion = template
        .replace("{entity}", entity.canonical_name)
        .replace("{topic}", topic);

      entries.push({
        suggestion,
        display_text: null,
        suggestion_type: "scoped",
        language,
        script: "latn",
        latin_form: null,
        corpus_frequency: cooccurrence,
        editorial_boost: 0,
        weight: 0,
        entity_id: entity.id,
        book_id: null,
      });
    }
  }

  return entries;
}

// ── Step 5: Chapter Titles ───────────────────────────

async function harvestChapters(pool: pg.Pool, language: string): Promise<DictionaryEntry[]> {
  const { rows } = await pool.query(
    `SELECT c.title, b.id AS book_id
     FROM chapters c
     JOIN books b ON b.id = c.book_id
     WHERE b.language = $1
     ORDER BY c.sort_order`,
    [language],
  );

  return rows.map((r) => ({
    suggestion: r.title,
    display_text: null,
    suggestion_type: "chapter" as const,
    language,
    script: "latn",
    latin_form: null,
    corpus_frequency: 1,
    editorial_boost: 0,
    weight: 0,
    entity_id: null,
    book_id: r.book_id,
  }));
}

// ── Step 6: Curated Content ──────────────────────────

function harvestCurated(language: string): DictionaryEntry[] {
  const curated = (curatedQueries as CuratedData)[language] || (curatedQueries as CuratedData).en;
  const entries: DictionaryEntry[] = [];

  for (const chip of curated.chips) {
    entries.push({
      suggestion: chip,
      display_text: null,
      suggestion_type: "curated",
      language,
      script: "latn",
      latin_form: null,
      corpus_frequency: 0,
      editorial_boost: 1.0,
      weight: 0,
      entity_id: null,
      book_id: null,
    });
  }

  for (const question of curated.questions) {
    entries.push({
      suggestion: question,
      display_text: null,
      suggestion_type: "curated",
      language,
      script: "latn",
      latin_form: null,
      corpus_frequency: 0,
      editorial_boost: 1.0,
      weight: 0,
      entity_id: null,
      book_id: null,
    });
  }

  return entries;
}

// ── Step 7: Compute Weights ──────────────────────────

function computeWeights(entries: DictionaryEntry[], language: string): DictionaryEntry[] {
  const maxFreq = Math.max(...entries.map((e) => e.corpus_frequency), 1);
  const overrides = (overridesData.overrides as OverrideEntry[]) || [];

  return entries.map((entry) => {
    // Apply editorial overrides
    const override = overrides.find(
      (o) => o.suggestion.toLowerCase() === entry.suggestion.toLowerCase() && o.language === language,
    );
    if (override) {
      entry.editorial_boost = override.editorial_boost;
    }

    const freqNormalized = entry.corpus_frequency / maxFreq;
    entry.weight = freqNormalized * SUGGEST_WEIGHT_CORPUS + entry.editorial_boost * SUGGEST_WEIGHT_EDITORIAL;
    return entry;
  });
}

// ── Step 8: Export to DB + Static JSON ───────────────

async function exportToDatabase(pool: pg.Pool, entries: DictionaryEntry[]): Promise<void> {
  await pool.query("TRUNCATE suggestion_dictionary");

  // Deduplicate by (suggestion, language) — keep highest weight
  const seen = new Map<string, DictionaryEntry>();
  for (const entry of entries) {
    const key = `${entry.suggestion.toLowerCase()}|${entry.language}`;
    const existing = seen.get(key);
    if (!existing || entry.weight > existing.weight) {
      seen.set(key, entry);
    }
  }
  const deduped = Array.from(seen.values());

  // Bulk insert in batches of 100
  const batchSize = 100;
  for (let i = 0; i < deduped.length; i += batchSize) {
    const batch = deduped.slice(i, i + batchSize);
    const values: unknown[] = [];
    const placeholders: string[] = [];

    for (let j = 0; j < batch.length; j++) {
      const e = batch[j];
      const offset = j * 11;
      placeholders.push(
        `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10}, $${offset + 11})`,
      );
      values.push(
        e.suggestion, e.display_text, e.suggestion_type, e.language, e.script,
        e.latin_form, e.corpus_frequency, e.editorial_boost, e.weight,
        e.entity_id, e.book_id,
      );
    }

    await pool.query(
      `INSERT INTO suggestion_dictionary
        (suggestion, display_text, suggestion_type, language, script,
         latin_form, corpus_frequency, editorial_boost, weight,
         entity_id, book_id)
       VALUES ${placeholders.join(", ")}
       ON CONFLICT (suggestion, language) DO UPDATE SET
         display_text = EXCLUDED.display_text,
         suggestion_type = EXCLUDED.suggestion_type,
         weight = EXCLUDED.weight,
         corpus_frequency = EXCLUDED.corpus_frequency,
         editorial_boost = EXCLUDED.editorial_boost,
         updated_at = now()`,
      values,
    );
  }

  console.log(`  DB: ${deduped.length} entries inserted.`);
}

function exportStaticJSON(
  entries: DictionaryEntry[],
  bridgeEntries: BridgeExport[],
  language: string,
): void {
  const outDir = join(process.cwd(), "public", "data", "suggestions", language);

  // Clean and recreate directory
  if (existsSync(outDir)) rmSync(outDir, { recursive: true });
  mkdirSync(outDir, { recursive: true });

  // Filter suppressed entries
  const visible = entries.filter((e) => e.editorial_boost > -1.0);

  // _zero.json — chips + questions from curated
  const curated = (curatedQueries as CuratedData)[language] || (curatedQueries as CuratedData).en;
  writeFileSync(
    join(outDir, "_zero.json"),
    JSON.stringify({ chips: curated.chips, questions: curated.questions }, null, 2),
  );

  // _bridge.json
  writeFileSync(join(outDir, "_bridge.json"), JSON.stringify(bridgeEntries, null, 2));

  // Partition by two-char prefix
  const prefixMap = new Map<string, StaticSuggestion[]>();

  for (const entry of visible) {
    const lower = entry.suggestion.toLowerCase().normalize("NFC");
    const isAlpha = /^[a-z]/.test(lower);
    const prefix = isAlpha ? lower.slice(0, 2).padEnd(2, "_") : "_misc";
    const key = prefix.length >= 2 ? prefix.slice(0, 2) : "_misc";

    if (!prefixMap.has(key)) prefixMap.set(key, []);
    prefixMap.get(key)!.push({
      text: entry.suggestion,
      display: entry.display_text,
      type: entry.suggestion_type,
      weight: Math.round(entry.weight * 1000) / 1000,
    });
  }

  // Write prefix files, sorted by weight descending
  let totalFiles = 0;
  let maxFileSize = 0;

  for (const [prefix, suggestions] of prefixMap) {
    suggestions.sort((a, b) => b.weight - a.weight);
    // Cap at 100 entries per file to stay within 15KB target
    const capped = suggestions.slice(0, 100);
    const content = JSON.stringify(capped);
    const filePath = join(outDir, `${prefix}.json`);
    writeFileSync(filePath, content);
    totalFiles++;
    if (content.length > maxFileSize) maxFileSize = content.length;
  }

  console.log(`  JSON: ${totalFiles} prefix files, _zero.json, _bridge.json. Max file: ${(maxFileSize / 1024).toFixed(1)}KB`);
}

// ── Step 9: Validate ─────────────────────────────────

async function validate(pool: pg.Pool, language: string): Promise<void> {
  const { rows: countRows } = await pool.query(
    "SELECT COUNT(*) AS total FROM suggestion_dictionary WHERE language = $1",
    [language],
  );
  const total = Number(countRows[0].total);

  const { rows: typeRows } = await pool.query(
    `SELECT suggestion_type, COUNT(*) AS cnt
     FROM suggestion_dictionary WHERE language = $1
     GROUP BY suggestion_type ORDER BY cnt DESC`,
    [language],
  );

  console.log(`  Validation (${language}): ${total} total entries`);
  for (const r of typeRows) {
    console.log(`    ${r.suggestion_type}: ${r.cnt}`);
  }

  // Spot-check: top 3 by weight
  const { rows: topRows } = await pool.query(
    `SELECT suggestion, suggestion_type, weight
     FROM suggestion_dictionary WHERE language = $1
     ORDER BY weight DESC LIMIT 5`,
    [language],
  );
  console.log(`  Top 5 by weight:`);
  for (const r of topRows) {
    console.log(`    [${r.weight.toFixed(3)}] ${r.suggestion} (${r.suggestion_type})`);
  }
}

// ── Main ─────────────────────────────────────────────

async function main() {
  const dbUrl = process.env.NEON_DATABASE_URL;
  if (!dbUrl) {
    console.error("NEON_DATABASE_URL not set.");
    process.exit(1);
  }

  const pool = new pg.Pool({ connectionString: dbUrl, max: 5 });

  // Get available languages
  const { rows: langRows } = await pool.query(
    "SELECT DISTINCT language FROM books ORDER BY language",
  );
  const languages: string[] = langRows.map((r) => r.language.trim());

  // Load entity registry once for alias resolution
  const { rows: entityRows } = await pool.query(
    "SELECT id, canonical_name, entity_type, aliases, definition FROM entity_registry",
  );
  const entities: EntityInfo[] = entityRows.map((r) => ({
    id: r.id,
    canonical_name: r.canonical_name,
    entity_type: r.entity_type,
    aliases: r.aliases || [],
    definition: r.definition || "",
  }));
  const aliasMap = buildAliasMap(entities);

  // Load bridge entries for export
  const { rows: bridgeRows } = await pool.query(
    `SELECT expression, yogananda_vocabulary, crisis_adjacent
     FROM vocabulary_bridge
     WHERE layer = 'vocabulary_expansion' AND status = 'active' AND language = 'en'`,
  );
  const bridgeEntries: BridgeExport[] = bridgeRows.map((r) => ({
    stem: computeStem(r.expression),
    expression: r.expression,
    yogananda_terms: r.yogananda_vocabulary || [],
    crisis_adjacent: r.crisis_adjacent || false,
  }));

  console.log(`Languages: ${languages.join(", ")}`);
  console.log(`Entities: ${entities.length}`);
  console.log(`Bridge entries: ${bridgeEntries.length}\n`);

  for (const language of languages) {
    console.log(`\n=== ${language.toUpperCase()} ===`);

    // Steps 1-6: Harvest
    console.log("Step 1: Harvest topics...");
    const topics = await harvestTopics(pool, language);
    console.log(`  ${topics.length} topics (after normalization, freq >= ${SUGGEST_MIN_TOPIC_FREQUENCY})`);

    console.log("Step 2: Harvest entities...");
    const entityEntries = await harvestEntities(pool, language);
    console.log(`  ${entityEntries.length} entities`);

    console.log("Step 3: Harvest Sanskrit terms...");
    const sanskrit = language === "en" ? await harvestSanskrit(pool) : [];
    console.log(`  ${sanskrit.length} Sanskrit terms`);

    console.log("Step 4: Generate scoped queries...");
    const scoped = await generateScopedQueries(pool, language, aliasMap);
    console.log(`  ${scoped.length} scoped queries`);

    console.log("Step 5: Harvest chapter titles...");
    const chapters = await harvestChapters(pool, language);
    console.log(`  ${chapters.length} chapters`);

    console.log("Step 6: Load curated content...");
    const curated = harvestCurated(language);
    console.log(`  ${curated.length} curated entries`);

    // Combine all
    const allEntries = [...topics, ...entityEntries, ...sanskrit, ...scoped, ...chapters, ...curated];
    console.log(`\nTotal raw entries: ${allEntries.length}`);

    // Step 7: Compute weights
    console.log("Step 7: Compute weights...");
    const weighted = computeWeights(allEntries, language);

    // Step 8: Export
    console.log("Step 8: Export...");
    await exportToDatabase(pool, weighted);
    exportStaticJSON(weighted, language === "en" ? bridgeEntries : [], language);

    // Step 9: Validate
    console.log("Step 9: Validate...");
    await validate(pool, language);
  }

  // Clean up old flat files
  const oldEn = join(process.cwd(), "public", "data", "suggestions", "en.json");
  const oldEs = join(process.cwd(), "public", "data", "suggestions", "es.json");
  if (existsSync(oldEn)) {
    rmSync(oldEn);
    console.log("\nRemoved old en.json");
  }
  if (existsSync(oldEs)) {
    rmSync(oldEs);
    console.log("Removed old es.json");
  }

  await pool.end();
  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
