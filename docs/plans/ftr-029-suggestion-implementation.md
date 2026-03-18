# FTR-029: Full Autosuggestion Implementation

## Context

FTR-029 specifies a six-tier corpus-derived autosuggestion system. The architectural skeleton exists — SearchCombobox component (231 lines, full ARIA), Tier B API endpoint, suggestion_dictionary schema, config constants — but the pipeline that transforms enrichment data into living suggestions is missing. Today a seeker sees 49 chapter titles and 15 hardcoded chips. After this work: ~500 weighted suggestions per language across 6 tiers, vocabulary bridge hints, Sanskrit definitions, scoped queries, and prefix-partitioned static JSON at CDN edge.

The vocabulary_bridge table is also empty. We seed it as part of this work to deliver the complete bridge experience (Scene 5: "mindfulness" → "concentration, one-pointed attention").

## Data Landscape (from reconnaissance)

- **Topics:** 2,151 distinct English (6,319 instances), 2,390 Spanish. 65% appear once (noise), ~430 appear 2+ times (signal)
- **Near-duplicates:** "spiritual discipline"(32)/"spiritual disciplines"(1), "divine vision"(20)/"divine visions"(7) — need normalization
- **Entity registry:** 20 canonical entries with aliases. JSONB has >200 free-text teacher names needing resolution
- **Sanskrit terms:** 12 terms with Devanagari, IAST, SRF definitions — ready
- **Entity co-occurrence:** Yogananda×86 topics, Sri Yukteswar×78, Lahiri Mahasaya×79 — rich scoped query potential
- **Vocabulary bridge:** 0 rows — needs seeding
- **suggestion_dictionary:** 0 rows — needs population
- **Corpus vocabulary:** 23,642 unique words

---

## Phase 1: Foundation (Parallel — No Dependencies)

### 1a. Schema Alignment Migration (`migrations/010_suggestion_schema_alignment.sql`)

Add four missing constraints to `suggestion_dictionary`:

```sql
-- migrate:up
ALTER TABLE suggestion_dictionary ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE suggestion_dictionary ADD CONSTRAINT suggestion_dictionary_unique UNIQUE (suggestion, language);
CREATE INDEX IF NOT EXISTS suggestion_latin_trgm_idx ON suggestion_dictionary USING gin(latin_form gin_trgm_ops);
ALTER TABLE suggestion_dictionary ADD CONSTRAINT suggestion_dictionary_type_check
  CHECK (suggestion_type IN ('scoped','entity','topic','sanskrit','editorial','curated','chapter'));

-- migrate:down (reverse order)
```

Run via Neon MCP `prepare_database_migration` / `complete_database_migration`.

### 1b. Named Constants (`lib/config.ts` — after line 148)

Add 6 pipeline constants:

| Constant | Value | Rationale |
|----------|-------|-----------|
| `SUGGEST_MIN_TOPIC_FREQUENCY` | 2 | Filter single-occurrence noise |
| `SUGGEST_MIN_COOCCURRENCE` | 3 | Minimum entity-topic co-occurrence for scoped queries |
| `SUGGEST_MAX_SCOPED_PER_ENTITY` | 20 | Cap cross-product explosion |
| `SUGGEST_CACHE_MAX_AGE` | 300 | 5-min API cache (suggestions change only on deploy) |
| `SUGGEST_WEIGHT_CORPUS` | 0.6 | Corpus frequency coefficient |
| `SUGGEST_WEIGHT_EDITORIAL` | 0.4 | Editorial boost coefficient |

### 1c. Curated Data Files

**`lib/data/curated-queries.json`** — Per-language chips + questions (zero-state content):
- EN: 8 chips (Peace, Courage, Healing, Joy, Meditation, Divine Love, Self-Realization, Grief & Loss) + 6 questions
- ES: 7 chips + 3 questions (authored, not translated)

**`lib/data/scoped-query-templates.json`** — Per-language connective templates:
- EN: teacher="{entity} on {topic}", technique="{topic} in {entity}", fallback="{entity} — {topic}"
- ES: teacher="{entity} sobre {topic}", etc.

**`lib/data/suggestion-overrides.json`** — Initial suppressions (generic chapter numbers, etc.)

### 1d. Vocabulary Bridge Seed (`scripts/seed-vocabulary-bridge.ts`)

~35 modern-to-Yogananda term mappings, `layer='vocabulary_expansion'`:

| Expression | Yogananda's Vocabulary | Crisis? |
|-----------|----------------------|---------|
| mindfulness | concentration, one-pointed attention, interiorization | no |
| anxiety | restlessness of mind, mental unrest | no |
| depression | melancholy, delusion, spiritual darkness | yes |
| stress | tension, mental disturbance, restlessness | no |
| enlightenment | Self-realization, God-realization, cosmic consciousness | no |
| breathwork | pranayama, life force control | no |
| manifesting | divine law, creative visualization | no |
| purpose | dharma, divine plan, life's meaning | no |
| death | transition, afterlife, astral world | yes |
| suffering | maya, delusion, karma | no |
| loneliness | solitude, aloneness with God | no |
| ego | false self, ahamkara | no |
| surrender | divine surrender, submission to God | no |
| intuition | soul guidance, inner voice, divine guidance | no |
| ...+20 more | | |

Follows pattern of existing `scripts/seed-entities.ts`. INSERT with ON CONFLICT DO NOTHING.

---

## Phase 2: Pipeline (`scripts/generate-suggestion-dictionary.ts`)

**Replaces** `scripts/generate-suggestions.ts`. Single idempotent script. 9 harvest steps per FTR-029.

### Step 1: Harvest Topics
```sql
SELECT unnest(topics) AS topic, COUNT(*) AS freq
FROM book_chunks WHERE language = $1 AND topics IS NOT NULL
GROUP BY 1 HAVING COUNT(*) >= $SUGGEST_MIN_TOPIC_FREQUENCY
```
**Normalization pass:** NFC normalize -> lowercase -> collapse plurals (if singular exists with higher freq, merge) -> merge "X"/"Xs" variants. Keep semantically distinct pairs (e.g., "consciousness" != "cosmic consciousness"). Expected: ~430 EN topics after filtering.

### Step 2: Harvest Entities
Query `entity_registry`. Build reverse alias map from `aliases[]`. Count corpus frequency by scanning `book_chunks.entities` JSONB (resolve free-text mentions -> canonical names). Link via `entity_id`. Expected: 20 entities.

### Step 3: Harvest Sanskrit Terms
Query `sanskrit_terms`. `display_text = "{display_form} -- {srf_definition}"`. `latin_form = iast_form`. Expected: 12 terms.

### Step 4: Generate Scoped Queries
Cross entities (types: teacher, technique) with co-occurring topics from JSONB. Entity alias resolution via reverse map. Filter: co-occurrence >= `SUGGEST_MIN_COOCCURRENCE`. Cap: `SUGGEST_MAX_SCOPED_PER_ENTITY`. Apply templates from `scoped-query-templates.json`. Skip places and divine_names. Expected: ~100-150 scoped queries.

### Step 5: Chapter Titles
Query `chapters JOIN books`. Set `book_id`. Expected: 98 chapters.

### Step 6: Curated Content
Read `curated-queries.json`. Type = 'curated', editorial_boost = 1.0. Expected: ~14 entries.

### Step 7: Compute Weights
```
freq_normalized = corpus_frequency / max(corpus_frequency)
weight = (freq_normalized * 0.6) + (editorial_boost * 0.4)
```
Apply overrides from `suggestion-overrides.json` (editorial_boost = -1.0 suppresses).

### Step 8: Export Static JSON
- TRUNCATE + bulk INSERT into `suggestion_dictionary`
- Generate prefix-partitioned files in `public/data/suggestions/{lang}/`:
  - `_zero.json` -- `{ chips: [...], questions: [...] }`
  - `_bridge.json` -- `[{ stem, expression, yogananda_terms, crisis_adjacent }]`
  - `{xx}.json` -- two-char prefix files: `[{ text, display, type, weight }]`
  - `_misc.json` -- non-alpha prefixes
- Bridge stems: trim suffixes (ness, ing, tion, ment, ly, s, es, ed) for prefix-matchable forms
- Remove old flat files (`en.json`, `es.json`)

### Step 9: Validate
- Report: total entries per language, file count, size range
- Spot-check: 5 random prefixes -> verify suggestion_dictionary has matching rows
- Flag files >15KB

**Estimated dictionary size:** ~500 EN, ~500 ES per language.

---

## Phase 3: Service Layer (`lib/services/suggestions.ts`)

**Rewrite** to query `suggestion_dictionary` instead of `chapters`:

```typescript
export interface Suggestion {
  text: string;
  display: string | null;
  type: "scoped" | "entity" | "topic" | "sanskrit" | "editorial" | "curated" | "chapter";
  weight: number;
}

export async function getSuggestions(pool, prefix, language, limit): Promise<Suggestion[]>
```

Two-phase query:
1. ILIKE prefix on `suggestion` and `latin_form`, WHERE `editorial_boost > -1.0`, ORDER BY `weight DESC`
2. If sparse + prefix >= 3 chars: pg_trgm `similarity()` on both columns, blended score `weight*0.5 + sim*0.5`

### API Route (`app/api/v1/search/suggest/route.ts`)

Update response to include `display`, `type`, `weight`. Use `SUGGEST_CACHE_MAX_AGE`.

---

## Phase 4: Client Cutover (`app/components/SearchCombobox.tsx`)

### New Interfaces
```typescript
interface Suggestion {
  text: string;
  display: string | null;
  type: "scoped"|"entity"|"topic"|"sanskrit"|"editorial"|"curated"|"chapter";
  weight: number;
}

interface BridgeEntry {
  stem: string;
  expression: string;
  yogananda_terms: string[];
  crisis_adjacent: boolean;
}

interface ZeroState { chips: string[]; questions: string[]; }
```

### New Caching Strategy
Three module-scoped caches (replacing single `suggestionDataCache`):
- `zeroStateCache: Map<string, ZeroState>` -- loaded on focus
- `prefixCache: Map<string, Suggestion[]>` -- keyed by `{lang}/{prefix}`, loaded on typing
- `bridgeCache: Map<string, BridgeEntry[]>` -- loaded on first interaction

### Updated Load Logic
```
Focus (empty):  fetch /{lang}/_zero.json -> show chips + questions
2+ chars typed: compute prefix[0:2] -> fetch /{lang}/{prefix}.json -> client filter + rank
                also check bridgeCache for stem match
                if < FUZZY_THRESHOLD results -> async Tier B -> merge
```

### Multi-Word Scoring (new)
```typescript
matchScore: startMatch=1.0, wordBoundary=0.8, substring=0.5
finalScore = suggestion.weight * matchScore
```

### Bridge Matching (new)
```typescript
findBridgeMatch(prefix, bridges): match if prefix starts with bridge stem OR expression starts with prefix
```

### Updated Render
- **Type indicators:** Right-aligned muted label per suggestion (e.g., "topic", "chapter", "Sanskrit")
- **Bridge hint:** Two-line item -- expression on primary line, "Yogananda's terms: ..." on secondary line (italic, indented)
- **Sanskrit display:** Renders `display` field (includes "-- definition")
- **Accessibility:** Visually hidden type prefix in `role="option"` for screen readers. Bridge hint via `aria-describedby`.

### CSS Additions (`app/globals.css` -- after line 1424)
- `.combobox-suggestion` gets `display: flex; justify-content: space-between`
- `.combobox-suggestion-type` -- right-aligned, 0.75rem, muted
- `.combobox-suggestion--bridge` -- flex-wrap for two-line layout
- `.combobox-bridge-hint` -- indented, italic, secondary color
- `.combobox-suggestion--sanskrit` -- italic suggestion text

---

## Phase 5: Quality & Tests

### Golden Evaluation Set (`data/suggestion-eval/golden-suggestions.json`)
~40 prefixes with expected top-3 and required types:
- "med" -> meditation (topic), Yogananda on meditation (scoped)
- "samad" -> Samadhi -- superconscious state (sanskrit)
- "mindful" -> bridge match with concentration
- "Yog" -> Paramahansa Yogananda (entity), scoped queries
- Spanish prefixes: "med", "paz", "con"
- Edge cases: single char, numbers

### Eval Script (`scripts/eval-suggestions.ts`)
Load golden set -> load generated JSON -> compare -> report pass/fail. Threshold: >=80% prefix match, >=70% ranking accuracy.

### Test Updates
- **`lib/services/__tests__/suggestions.test.ts`** -- Rewrite: queries `suggestion_dictionary` (not `chapters`), tests both `suggestion` and `latin_form` matching, excludes suppressed entries, respects weight ordering
- **`app/components/__tests__/SearchCombobox.test.tsx`** -- Extend: prefix file fetching (mock URL routing), bridge hint rendering, type indicators, multi-word scoring, accessibility (visually hidden type prefix, aria-describedby)
- **`scripts/__tests__/generate-suggestion-dictionary.test.ts`** -- New: topic normalization, entity alias resolution, scoped query generation, weight computation, JSON export structure

### Cleanup
- Delete `public/data/suggestions/en.json`, `public/data/suggestions/es.json`
- Delete `scripts/generate-suggestions.ts`
- Update FTR-029 Implementation State section

---

## Implementation Order

```
Commit 1: Foundation (parallel)
  +-- 1a: Migration 010
  +-- 1b: Config constants
  +-- 1c: Curated data files
  +-- 1d: Vocabulary bridge seed script + run

Commit 2: Pipeline + Service
  +-- Pipeline script (generate-suggestion-dictionary.ts)
  +-- Service rewrite (suggestions.ts -> query suggestion_dictionary)
  +-- API route update

Commit 3: Client + CSS (atomic with pipeline output)
  +-- SearchCombobox refactor (prefix files, bridge, types)
  +-- CSS additions
  +-- Run pipeline to generate static JSON

Commit 4: Quality + Tests
  +-- Golden evaluation set
  +-- Eval script
  +-- Service tests rewrite
  +-- Component test extensions
  +-- Pipeline tests
  +-- Cleanup old files
```

Commits 2-3 must deploy together (component expects prefix format, pipeline generates it).

## Critical Files

| File | Action |
|------|--------|
| `migrations/010_suggestion_schema_alignment.sql` | Create |
| `lib/config.ts` | Edit (add 6 constants after line 148) |
| `lib/data/curated-queries.json` | Create |
| `lib/data/scoped-query-templates.json` | Create |
| `lib/data/suggestion-overrides.json` | Create |
| `scripts/seed-vocabulary-bridge.ts` | Create |
| `scripts/generate-suggestion-dictionary.ts` | Create (replaces generate-suggestions.ts) |
| `lib/services/suggestions.ts` | Rewrite (66 -> ~80 lines) |
| `app/api/v1/search/suggest/route.ts` | Edit (response shape + cache header) |
| `app/components/SearchCombobox.tsx` | Significant refactor (231 -> ~320 lines) |
| `app/globals.css` | Edit (add ~40 lines after line 1424) |
| `data/suggestion-eval/golden-suggestions.json` | Create |
| `scripts/eval-suggestions.ts` | Create |
| `lib/services/__tests__/suggestions.test.ts` | Rewrite |
| `app/components/__tests__/SearchCombobox.test.tsx` | Extend |
| `scripts/generate-suggestions.ts` | Delete |
| `public/data/suggestions/en.json` | Delete (replaced by en/ directory) |
| `public/data/suggestions/es.json` | Delete (replaced by es/ directory) |

## Verification

1. **Run migration** via Neon MCP -> verify constraints exist
2. **Run seed-vocabulary-bridge.ts** -> verify `SELECT COUNT(*) FROM vocabulary_bridge` ~ 35
3. **Run generate-suggestion-dictionary.ts** -> verify:
   - `SELECT COUNT(*) FROM suggestion_dictionary WHERE language = 'en'` ~ 500
   - `SELECT COUNT(*) FROM suggestion_dictionary WHERE language = 'es'` ~ 500
   - `public/data/suggestions/en/_zero.json` exists with chips + questions
   - `public/data/suggestions/en/me.json` contains "meditation" topic
   - `public/data/suggestions/en/_bridge.json` contains "mindful" stem
4. **Run eval-suggestions.ts** -> >=80% prefix match, >=70% ranking accuracy
5. **Run tests** -> `pnpm test` all passing
6. **Manual verification** -> `pnpm dev`, focus search bar, type "med", verify scoped queries appear with type indicators
7. **Accessibility** -> Tab into search, use arrow keys, verify screen reader announces type prefixes