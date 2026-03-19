---
ftr: 29
title: "Search Suggestions — Corpus-Derived Autosuggestion"
summary: "Six-tier corpus-derived suggestion hierarchy with pre-computed static JSON and progressive infrastructure"
state: implemented
domain: search
governed-by: [PRI-01, PRI-03, PRI-05, PRI-08, PRI-09]
depends-on: [FTR-026, FTR-028, FTR-033, FTR-021]
---

# FTR-029: Search Suggestions

## Rationale

### Why Suggestions Matter for This Corpus

Google's autocomplete draws intelligence from billions of queries. The suggestion quality comes from aggregate behavior — it reflects what other people searched for. This makes Google's suggestions popular, social, and generic.

This portal operates under fundamentally different constraints and advantages:

1. **Bounded, known corpus.** Every term in every book is known at ingestion time. Every suggestion can *guarantee* results exist — a property Google cannot offer.

2. **DELTA compliance (PRI-09, FTR-082).** No user identification, no session tracking, no behavioral profiling. Behavior-derived suggestions are architecturally impossible. Even aggregate query-based suggestions face the FTR-032 minimum threshold problem — sparse data for months after launch.

3. **Calm Technology (PRI-08).** "Trending searches" and "popular queries" create social-media-like engagement patterns. Suggestions should reduce friction, not drive browsing behavior.

4. **Librarian identity (PRI-01, FTR-077).** A librarian helps you formulate your question and knows the collection. Suggestions extend this metaphor — showing the seeker what terrain the teachings cover before they've finished asking.

5. **Vocabulary gap.** The deepest advantage. Seekers arrive with modern vocabulary ("anxiety," "mindfulness," "depression"). Yogananda wrote with different words ("restlessness of mind," "one-pointed attention," "delusion"). The Vocabulary Bridge (FTR-028) already maps between these at query time. Suggestions can surface this mapping *before submission* — teaching the seeker the library's language in real time.

### Decision

**Suggestion intelligence is corpus-derived, not behavior-derived.** All suggestion sources are extracted from the content itself — enrichment metadata, entity registries, Sanskrit term tables, and curated editorial content. This ensures DELTA compliance by construction, guarantees every suggestion leads to results, and aligns with the librarian identity.

The suggestion system has three layers:

- **Six-tier suggestion hierarchy** — what to suggest, ranked by intent precision
- **Pre-computation pipeline** — how enrichment data becomes suggestions
- **Three-tier progressive infrastructure** — how suggestions reach the seeker fast

### Known Limitations of Corpus-Derived Suggestions

Naming these is a design commitment, not a confession. Each limitation is the cost of a principle worth keeping.

1. **The system cannot algorithmically learn from seeker behavior which suggestions are most useful.** PRI-09 prohibits curation intelligence from behavioral patterns, even anonymized or aggregated. Suggestion ranking is and will remain corpus-derived. This is a ceiling by design.

2. **Suggestion quality is bounded by enrichment quality and editorial judgment.** If the enrichment pipeline (FTR-026) produces noisy topics, the suggestion dictionary inherits that noise. The pipeline cannot correct upstream quality — only audit it and flag problems.

3. **The weight formula is a hypothesis.** Corpus frequency rewards terms that appear often, not terms that are useful. "Chapter 1" appears in every book. "Nirvikalpa samadhi" appears in 0.5% of chunks but may be precisely what an advanced seeker wants. The golden evaluation set (see § Suggestion Quality Evaluation) validates the hypothesis; editorial overrides correct where it fails.

4. **Scoped queries assume linguistic templates.** "Yogananda on meditation" is idiomatic English but the pattern doesn't translate by word substitution — Hindi syntax, word order, and relational particles differ fundamentally. Each language needs authored templates, not translations.

5. **No register awareness in suggestions.** The same dropdown appears to a seeker typing "death" in philosophical curiosity and one typing "death" in fresh grief. The Vocabulary Bridge (FTR-028) carries register information, but the suggestion system does not modulate by emotional register. This is a deliberate scope boundary: register detection before query submission would require either behavioral signals (DELTA-violating) or explicit seeker input (interaction overhead). The bridge hint provides vocabulary guidance; the search pipeline provides register-appropriate results *after* submission.

### Alternatives Considered

1. **Aggregate query-based suggestions ("popular searches").** Rejected: DELTA non-compliant without careful anonymization. Sparse data for months. Creates social-proof dynamics. Even with FTR-032-style thresholds, useful suggestions require significant traffic volume.

2. **Claude-powered real-time suggestion generation.** Rejected: LLM call per keystroke (or debounced batch) adds latency, cost, and complexity. The corpus is bounded — pre-computed suggestions are faster, cheaper, and more reliable.

3. **No suggestions.** Considered: intent classification + terminology bridge already handle "seeker doesn't know the right words" after submission. But pre-submission suggestions reduce typing friction, show what the corpus contains, and extend the librarian metaphor. The bounded corpus makes guaranteed-result suggestions uniquely valuable.

4. **Third-party search-as-a-service (Algolia, Typesense).** Rejected: vendor dependency for a feature achievable with PostgreSQL pg_trgm and edge caching. Violates single-database principle (FTR-104). Over-engineered for a bounded corpus.

5. **ElastiCache Redis.** Rejected: VPC networking with Vercel adds 5-15ms that erases its speed advantage. Operational overhead (subnets, security groups, failover) disproportionate for a ~6K-row dictionary. Vercel KV (Upstash Redis) provides sorted-set semantics with zero ops and global distribution if Tier A+B prove insufficient.


## Specification

### The Experience

The suggestion system is a librarian who, when approached, gently surfaces what the library contains.

**Scene 1: Focus (zero-state).** The seeker clicks the search bar. Before typing, curated entry points appear — theme chips ("Peace", "Courage", "Grief & Loss") and question prompts ("How do I overcome fear?"). Served from `_zero.json` at the CDN edge (<10ms). Screen reader announces: "Search. What are you seeking? 8 suggestions available."

**Scene 2: Typing (prefix match).** The seeker types "med". After the adaptive debounce, the browser fetches `/suggestions/en/me.json` from the CDN (<10ms), filters client-side to entries matching "med", ranks by weight, and renders the dropdown with type indicators:

```
  meditation                              topic
  Yogananda on meditation                 scoped
  meditation techniques                   topic
  An Experience in Cosmic Consciousness   chapter
```

No database queried. No function invoked. No API call made.

**Scene 3: Scoped query.** The seeker types "Yogananda on". Multi-word prefix matching activates — suggestions where the typed text matches the *start* of the suggestion rank highest:

```
  Yogananda on meditation                 scoped
  Yogananda on the nature of God          scoped
  Yogananda on fear                       scoped
  Yogananda on divine love                scoped
```

Each scoped query is pre-computed from entity-topic co-occurrence in the enrichment data. Every one is guaranteed to return rich results because the co-occurrence *proves* the content exists.

**Scene 4: Sanskrit terms.** The seeker types "samad". The prefix file loads:

```
  Samadhi  (samaadhi)  superconscious state       sanskrit
  An Experience in Cosmic Consciousness            chapter
  Yogananda on samadhi                             scoped
```

The Sanskrit term carries its SRF definition inline and its transliterated form. A Hindi seeker typing Devanagari sees the same term in native script with the Hindi definition.

**Scene 5: The bridge moment.** The seeker types "mindful". Prefix match finds nothing — Yogananda doesn't use "mindfulness." The bridge file activates:

```
  mindfulness                                      bridge
    Yogananda's terms: concentration,
    one-pointed attention, interiorization
```

The system translates the seeker's vocabulary into the library's vocabulary *before submission*. When the seeker submits, the search results page continues: "Showing results for 'concentration' and 'one-pointed attention' (Yogananda's terms for mindfulness)."

**Scene 6: Fuzzy recovery.** The seeker types "meditatoin" (typo). Prefix match finds nothing. The system silently fires an async pg_trgm request. Within 40-80ms, fuzzy results merge into the dropdown — "meditation" appears. No "did you mean?" prompt. Quiet correction.

**Scene 7: Selection and handoff.** The seeker selects a suggestion. The URL reflects their original selection: `/search?q=meditation`. Intent classification (FTR-005 E1, a separate system) determines routing — theme page, search results, or Practice Bridge. The suggestion system's job is done: it reduced friction, taught vocabulary, and delivered the seeker to the right doorway.

**Scene 8: Mobile.** On viewports <768px, the dropdown shows a maximum of 5 suggestions (vs. 8 on desktop) to avoid the virtual keyboard competing with results. Touch targets are 44x44px minimum (PRI-07, FTR-003). Zero-state chips use horizontal scroll rather than wrapping.

---

### Six-Tier Suggestion Hierarchy

Suggestions are ranked by intent precision — how closely the suggestion matches what the seeker is looking for. Higher tiers encode more precise intent.

| Tier | Type | Source | Example | Weight Basis |
|------|------|--------|---------|--------------|
| 1 | **Scoped queries** | Entity-topic co-occurrence from enrichment (FTR-026) | "Yogananda on the nature of God" | Co-occurrence count across chunks |
| 2 | **Named entities** | Entity registry (FTR-033) | "Lahiri Mahasaya", "Kriya Yoga" | Centrality score + corpus frequency |
| 3 | **Domain concept phrases** | `topics` column from enrichment (FTR-026) | "cosmic consciousness", "divine love" | Corpus frequency (chunk count) |
| 4 | **Sanskrit terms with definitions** | `sanskrit_terms` table (FTR-033) | "Samadhi — superconscious state" | Weight column + corpus frequency |
| 5 | **Editorially promoted queries** | FTR-032 query log, editorial review | (grows through editorial curation) | Editorial boost after review |
| 6 | **Curated terms + questions** | Editorial, `/lib/data/curated-queries.json` | "How do I overcome fear?" | Editorial boost |

**Tier 1: Scoped Queries** are the highest-value suggestion type for a teacher-centered corpus. The pattern "Yogananda on [concept]" encodes the most precise intent and guarantees high-relevance results. Generated by crossing entities with topics that co-occur in the same chunks. A scoped query exists only when the co-occurrence is real — no hallucinated suggestions.

**Tier 2: Named Entities** surface the cast of the teachings — teachers, divine names, techniques, works, places, experiential states. Each entity carries aliases (FTR-033) so "the Master" and "Guruji" resolve to "Paramahansa Yogananda." Entities with definitions display them inline.

**Tier 3: Domain Concept Phrases** are the backbone of the suggestion vocabulary. Every chunk has been enriched with canonical `topics` by the enrichment pipeline (FTR-026). Distinct topics aggregated across all chunks, weighted by frequency, form the largest tier — likely 200-500 entries per language at single-book scale, growing with each book.

**Tier 4: Sanskrit Terms** carry multi-script rendering (canonical, Devanagari, IAST), common variant spellings, and SRF-specific definitions. The `latin_form` column enables transliterated input — a seeker typing "samadhi" in Roman script matches the Sanskrit entry.

**Tier 5: Editorially Promoted Queries** surface from the anonymized query log (FTR-032) but enter the suggestion pool only through editorial review — never automatically. The pipeline identifies candidate queries that cross a frequency threshold (minimum 5 identical queries from different calendar days, no user attribution) and presents them in the editorial review queue. An editor decides which candidates become suggestions. This respects PRI-09: curation intelligence remains corpus-derived and editorial; behavioral data informs the *editor's* judgment, not the *algorithm's* ranking. This tier is empty at launch and grows through editorial curation.

**Tier 6: Curated Terms and Questions** are editorially maintained. Two sub-types: high-value single terms ("meditation", "karma", "healing") and complete question forms ("How do I overcome fear?", "What is the purpose of life?"). Maintained in `/lib/data/curated-queries.json`, reviewed per FTR-135 editorial standards. The golden search evaluation set (FTR-037, ~58 English queries) seeds the curated questions.

---

### Enrichment Data Prerequisites

The pipeline's quality is bounded by the enrichment pipeline's quality (FTR-026). Before the pipeline runs, a Claude-powered audit (`scripts/audit-suggestion-sources.ts`) validates enrichment data for suggestion-readiness: topic canonicality, entity JSONB consistency against `entity_registry`, and cross-language alignment. The audit produces normalization maps and flagged-topic lists that the pipeline applies before insertion. Run before first pipeline execution and after each new book ingestion.

---

### Pre-Computation Pipeline

One script (`scripts/generate-suggestion-dictionary.ts`), run after book ingestion, idempotent. Transforms enrichment data into `suggestion_dictionary` rows and prefix-partitioned static JSON. All text inputs NFC-normalized per FTR-131.

#### Harvest Steps

| Step | Source | Output type | Key constraint |
|------|--------|-------------|----------------|
| 1. Harvest topics | `book_chunks.topics` | `topic` | Min `SUGGEST_MIN_TOPIC_FREQUENCY` (2) chunk occurrences |
| 2. Harvest entities | `entity_registry` | `entity` | Links via `entity_id`; corpus frequency from `entities` JSONB |
| 3. Harvest Sanskrit | `sanskrit_terms` | `sanskrit` | `display_text` includes definition; `latin_form` carries IAST |
| 4. Generate scoped queries | Entity-topic co-occurrence | `scoped` | Min `SUGGEST_MIN_COOCCURRENCE` (3); capped at `SUGGEST_MAX_SCOPED_PER_ENTITY` (20) per entity |
| 5. Chapter titles | `chapters` + `books` | `chapter` | `book_id` set; moderate weight |
| 6. Curated content | `/lib/data/curated-*.json` | `curated` | `editorial_boost = 1.0` |
| 7. Compute weights | All entries | — | `weight = (freq_normalized × 0.6) + (editorial_boost × 0.4)` |
| 8. Export static JSON | `suggestion_dictionary` | Prefix files | Suppressed entries excluded; bridge from `vocabulary_bridge` |
| 9. Validate | Generated data | Report | Spot-check results exist; no duplicates; size budget 2-15KB/file |

**Scoped query architecture (Step 4):** Crosses entities with co-occurring topics from `entities` JSONB (keys: `teachers`, `divine_names`, `techniques` per FTR-026). Per-language connective templates in `/lib/data/scoped-query-templates.json` — authored per language, not translated. Fallback: em-dash form `"{entity} -- {topic}"`.

**Weight formula (Step 7):** Purely corpus-derived + editorial. No behavioral coefficient (PRI-09). `corpus_frequency_normalized = corpus_frequency / max(corpus_frequency)` within each language. Per-suggestion editorial overrides from `data/suggestion-overrides.json` applied after the formula; `editorial_boost = -1.0` suppresses from display.

**Static JSON export (Step 8):** Two-character Latin prefix files (`me.json`, `yo.json`), plus `_zero.json` (chips + questions), `_bridge.json` (vocabulary bridge stems, empty with warning if table unseeded). Client lowercases + NFC normalizes before file lookup. Non-alphabetic prefixes go to `_misc.json`. Files are Vercel static assets — update on deploy.

**Pipeline properties:** Idempotent full rebuild (TRUNCATE + INSERT). Runs after book ingestion, entity registry updates, or curated content edits. Advisory lock if concurrent execution ever needed.

#### Estimated Dictionary Size

| Corpus State | Total per language |
|-------------|-------------------|
| 1 book (STG-001) | ~500 |
| 5 books (Phase 2) | ~1,500 |
| 25 books (full) | ~5,000 |

Well within Tier A (static JSON) capacity at all scales.

---

### Suggestion Quality Evaluation

Three quality mechanisms, none behavioral:

**1. Golden suggestion set** (`data/suggestion-eval/golden-suggestions.json`): ~40 representative prefixes with expected top-3 suggestions and ordering. Run after every pipeline rebuild via `scripts/eval-suggestions.ts`. Threshold: >= 80% prefix match, >= 70% ranking accuracy. This is design-intent fidelity testing, not behavioral evaluation.

**2. Claude quality audit** (`scripts/audit-suggestion-quality.ts`): Post-pipeline, Claude evaluates the dictionary for theological sensitivity (suppress inappropriate scoped queries), suggestion clarity, ranking reasonableness, and completeness. Output: `data/suggestion-audit/quality-report.json` with flagged entries and proposed editorial overrides. Claude acts as an expert surrogate — the closest DELTA-compliant equivalent to user feedback.

**3. DELTA-compliant diagnostics:** Two Amplitude events (no user ID, no session ID, day-level aggregation): `suggestion_dropdown_opened { language }` and `suggestion_selected { suggestion_type, language }`. These reveal which *suggestion types* are useful without tracking specific suggestions or individual behavior. Per-suggestion counts are prohibited — even without user IDs, per-suggestion timestamps could reconstruct micro-sessions.

**Editorial override mechanism:** `data/suggestion-overrides.json` enables per-suggestion boost/suppress. Pipeline applies overrides after computing corpus weights. `editorial_boost = 1.0` pins to top; `-1.0` suppresses from display. Maintained in git, reviewed per FTR-135. Claude proposes overrides via quality audit; human approves.

---

### Suggestion Dictionary Schema

The `suggestion_dictionary` table (migration 001 + alignment migration 009) stores the pre-computed suggestion index. Schema source of truth: the migration files. Key column semantics:

| Column | Purpose |
|--------|---------|
| `suggestion` | Searchable text matched against typed prefix. Always lowercase-comparable. UNIQUE with `language`. |
| `display_text` | Rich display form (e.g., "Samadhi — superconscious state"). NULL means display `suggestion` as-is. |
| `suggestion_type` | CHECK constraint: `scoped`, `entity`, `topic`, `sanskrit`, `editorial`, `curated`, `chapter`. Determines display treatment. |
| `latin_form` | Transliterated form for cross-script matching. Hindi seeker typing "samadhi" in Roman matches via this column. GIN trgm index. |
| `corpus_frequency` | Chunk count. Used in weight formula. |
| `query_frequency` | Diagnostic only (FTR-032). NOT used in ranking (PRI-09). |
| `editorial_boost` | -1.0 to 1.0. Set by editors or Claude audit. -1.0 suppresses from display. |
| `weight` | Composite score computed by pipeline. |
| `entity_id` | Links to `entity_registry`. Enables alias resolution. |
| `book_id` | For chapter titles. NULL for cross-book suggestions. Scoped queries: NULL (aggregate across books). |

Indexes: GIN trgm on `suggestion` and `latin_form` (Tier B fuzzy), composite `(language, weight DESC)` (ordered lookups).

---

### Three-Tier Progressive Infrastructure

Each tier is a complete solution. The next tier activates only when the previous one's limits are reached.

#### Tier A: Static JSON at CDN Edge

Prefix-partitioned suggestion files served as static assets from Vercel's CDN. Directory structure: `public/data/suggestions/{lang}/` with two-character prefix files (`me.json`, `yo.json`), plus `_zero.json` (chips + questions) and `_bridge.json` (vocabulary bridge stems). Each prefix file contains an array of `{ text, display, type, weight }` objects.

- Latency: <10ms globally (CDN cache hit, no function invocation)
- Cost: $0 (static assets)
- At full corpus (~5,000 entries/language), each prefix file is 2-15KB. The entire set is ~200KB — smaller than a hero image.
- Browser caches prefix files after first fetch — subsequent keystrokes with the same two-character prefix are instant (0ms).
- Bridge keys are prefix-matchable stems ("anxiet" not "anxiety") so multiple inflections match.

#### Tier B: pg_trgm Fuzzy Fallback

When client-side prefix filtering returns fewer than `SUGGEST_FUZZY_THRESHOLD` results, the frontend fires an async request to `/api/v1/search/suggest`. Queries `suggestion_dictionary` using `similarity()` on both `suggestion` and `latin_form` columns, ordered by weight then similarity. Latency: 40-80ms (Neon roundtrip). Async merge — seeker sees prefix results instantly; fuzzy results appear when ready.

**API:** `GET /api/v1/search/suggest?q={prefix}&language={lang}&limit={n}`. Response shape matches static JSON for client-side uniformity: `{ data: [{ text, display, type, weight }] }`. No Claude API call. No auth required. Cache-Control from `SUGGEST_CACHE_MAX_AGE` config constant.

#### Tier C: Vercel KV (Conditional — Re-evaluate)

Originally specified as Vercel KV (Upstash Redis) for sub-10ms server-side prefix search. **Not activated.** Vercel KV was sunset December 2024 and migrated to Upstash Redis direct. Additionally, Edge Function bundle limits (2-4MB) preclude holding suggestion dictionaries at edge, and Edge Function P50 latency (106ms per OpenStatus.dev benchmarks) is 20-100x slower than cached static JSON. If server-side sub-10ms search is ever needed, evaluate Upstash Redis direct or a client-side solution (MiniSearch) instead. Re-evaluate at Phase 3 boundary — current Tier A + B architecture likely sufficient through full corpus scale (~50K entries/language).

---

### Client Architecture

`app/components/SearchCombobox.tsx` — `"use client"` ARIA combobox.

**Two-tier client flow:**

```
Keystroke → adaptive debounce →
  Empty input:  Load _zero.json → chips + questions
  2+ chars:     Load {prefix[0:2]}.json → client-side filter + rank
                Check _bridge.json for bridge match
                Display immediately
                If < SUGGEST_FUZZY_THRESHOLD results → async Tier B → merge
```

**Key behaviors:**
- **Adaptive debounce:** First keystroke after focus fires immediately (0ms). Subsequent: `SUGGEST_DEBOUNCE_MS` (100ms). On 2G: `SUGGEST_DEBOUNCE_SLOW_MS` (200ms).
- **Multi-word scoring:** Start match (1.0) > word-boundary match (0.8) > substring match (0.5). Score multiplied by pre-computed weight for final ranking.
- **Tier B failure:** Silent degradation — stays with Tier A results. 3s timeout. On 2G, Tier B not fired at all.
- **Module-scoped cache:** Static JSON loads once per language, persists across renders.
- **IME composition guard:** A strict `isComposing` boolean lock suppresses all suggestion fetches, dropdown rendering, and Tier B calls during IME composition. Set `true` on `compositionstart`, reset `false` on `compositionend`. On `compositionend`, immediately trigger suggestion logic using the committed text — this is the reliable trigger point, not the `input` event (Chrome/Safari fire `compositionend` *before* the final `input` event where `isComposing` is still `true`; Firefox differs; w3c/uievents#202 open). Accounts for browser quirks: Chrome omits the final `keyup` after `compositionend`; Safari emits a synthetic `keydown` with keyCode 229. **Android Gboard caveat:** Gboard uses Android IME APIs for all text entry including English — Chrome 65+ fires `compositionstart`/`compositionupdate` for standard Gboard input. Naive `isComposing` suppression would suppress suggestions for *all* typing on Android Chrome. Mitigation: Gboard ends composition on space, producing natural per-word suggestion updates. The guard must account for this — suppress during active composition but allow space-delimited updates. In React, use `event.nativeEvent.isComposing` (React synthetic events do not expose `isComposing`; React issue #13104 open). ARIA during composition: suppress `aria-live` updates, set `aria-busy="true"` on the listbox, do not update `aria-activedescendant` (arrow keys belong to the IME, not the suggestion list). Non-negotiable for non-Latin script input.
- **Voice input detection:** Primary method: input velocity heuristic — character delta > 5 in a single `input` event indicates speech-to-text or paste (physically impossible for human typing at >20 chars). Secondary: `event.inputType === 'insertFromDictation'` where available (Safari non-standard; not reliably cross-browser despite Input Events Level 2 spec). When voice input is detected, bypass adaptive debounce entirely — the query has arrived fully formed. Route the complete phrase to prefix match against the full suggestion set. This addresses the 40% rural voice input rate in India (Nielsen 2023) and 65% overall Indian voice search usage (IAMAI 2023).

**Suggestion display:** Lightweight type indicators, not section headers. Each `suggestion_type` has distinct visual treatment (see The Experience scenes above). Ordering: highest `weight × matchScore` first; type as tiebreaker (scoped > entity > topic > sanskrit > chapter > curated). Bridge suggestions always appear when matched. No explicit group headers.

---

### Accessibility

The suggestion dropdown implements the ARIA combobox pattern (WAI-ARIA 1.2):

- `role="combobox"` on the search input
- `role="listbox"` on the suggestion dropdown
- `role="option"` on each suggestion item
- `aria-activedescendant` tracks keyboard-selected suggestion
- Arrow keys navigate suggestions, `Enter` selects, `Escape` dismisses, `Tab` moves focus out
- Screen reader announces suggestion count on open ("8 suggestions available")
- Screen reader announces each suggestion as arrow keys navigate, including type metadata
- Bridge hints announced as supplementary text ("Yogananda's terms: concentration, one-pointed attention, interiorization")
- Sanskrit definitions announced as part of the option label
- Type indicators announced via visually hidden text prefixing the accessible name within the `role="option"` element (e.g., "Book: Autobiography of a Yogi", "Sanskrit term: Samadhi") — this is the most reliable cross-screen-reader pattern. Bridge hints and Sanskrit definitions use `aria-describedby` pointing to supplemental description elements as the primary mechanism. Progressive enhancement: `aria-description` (WAI-ARIA 1.3) on the `role="option"` node provides cleaner supplemental announcements but is only reliable in NVDA and iOS VoiceOver as of 2026 (JAWS and TalkBack support lags; `aria-details` is unreachable across screen readers per WebAIM May 2025 testing). The prefixed accessible name ensures all assistive technology announces type context regardless of `aria-description` support. Note: `role="group"` for suggestion type sections breaks VoiceOver (documented React Aria bug) — use flat `role="listbox"` with prefixed names instead.
- High contrast mode: suggestion types distinguished by prefix text, not color alone
- Touch targets: 44x44px minimum (PRI-07, FTR-003)
- Mobile: maximum `SUGGEST_MAX_MOBILE` (5) suggestions visible to accommodate virtual keyboard
- Desktop: maximum `SUGGEST_MAX_DESKTOP` (8) suggestions

---

### Multilingual Suggestions

#### Per-Language Indices

Each language with ingested content gets its own suggestion infrastructure:

- Extracted corpus vocabulary from language-specific chunks
- Static JSON prefix files in `/public/data/suggestions/{lang}/`
- Localized theme names from `topic_translations`
- Localized curated queries from `messages/{locale}.json`
- Language-specific pg_trgm fallback

#### Devanagari Native-Script Prefix Files

Latin two-character prefix partitioning (`me.json`, `yo.json`) doesn't serve a Hindi seeker typing Devanagari. Hindi gets **Unicode first-character prefix files**:

```
public/data/suggestions/hi/
  _zero.json
  _bridge.json
  sa.json         -- Romanized "sa" prefix (latin_form matches)
  [U+0938].json   -- Devanagari "sa" (native script)
  [U+092E].json   -- Devanagari "ma"
  ...
```

Single-character partitioning for Devanagari because consonant clusters make two-character partitioning impractical. Single-book Hindi vocabulary is small enough that first-character files stay within the 2-15KB target.

#### Transliteration via `latin_form`

Hindi/Bengali seekers often type Romanized input ("samadhi" not "samaadhi"). The `latin_form` column carries the transliterated form — populated during ingestion. The pg_trgm fuzzy fallback queries both `suggestion` and `latin_form`. For Tier A, `latin_form` entries appear in Latin prefix files so Romanized prefixes match.

#### CJK and Thai

CJK languages lack word boundaries. Thai script also lacks word boundaries and requires ICU segmentation. These require language-specific tokenization strategies — **open design question for STG-021**. Current approach: defer until actual CJK content is ingested, then evaluate n-gram-based prefix files vs. server-side tokenization.

#### Sparse-Language Handling

If a language has few books, its suggestion index will be thin. The system is honest: fewer suggestions, not padded with irrelevant terms. No fallback to English suggestions unprompted.

---

### Vocabulary Bridge Integration (FTR-028)

The Vocabulary Bridge and suggestion system interact at two points:

**1. Bridge file (`_bridge.json`):** Populated from `vocabulary_bridge` table (Layer 2: Vocabulary Expansions, column `layer = 'vocabulary_expansion'`). When the table is seeded, bridge entries are exported as prefix-matchable stems. Until the table is seeded, the pipeline generates an empty `_bridge.json` with a logged warning — bridge suggestions are unavailable but the system degrades gracefully (no bridge hints appear).

**2. Search result continuation:** When a bridge-activated suggestion is submitted, the search results page shows: "Showing results for 'concentration' and 'one-pointed attention' (Yogananda's terms for mindfulness)." The bridge hint's pedagogical work continues past the suggestion dropdown. This is implemented in the search results component, not in the suggestion system — the suggestion system passes the bridge context forward via query parameters or search service metadata.

**Bridge data flow:**
```
vocabulary_bridge table (FTR-028)
  -> pipeline extracts Layer 2 entries
  -> exports to _bridge.json (prefix-matchable stems)
  -> SearchCombobox loads on first interaction
  -> client-side stem matching against typed input
  -> bridge hint displayed in dropdown
  -> on submission, bridge context forwarded to search
```

---

### Interaction with Intent Classification

Suggestions and intent classification (FTR-005 E1) are complementary:

- **Suggestions** operate *before* submission (as-you-type, <10ms, no LLM)
- **Intent classification** operates *after* submission (routes the query, uses Claude Opus)

When a seeker selects a suggestion, intent classification still runs on the selected text. The suggestion narrows the query; intent classification routes it. A seeker who selects "meditation" gets routed to the meditation theme page. A seeker who selects "How do I meditate?" gets routed to search with appropriate expansion.

---

### Author Tier and Suggestions

Suggestions are **tier-agnostic by design**. All author tiers (guru, president, monastic, per FTR-001) contribute equally to the suggestion vocabulary. The suggestion system operates before submission and does not filter by author tier. When `author_tier` influences results, it acts as a sort parameter on the search API (FTR-015), not a filter on suggestions. A seeker typing "meditation" sees the same suggestions regardless of which tiers they search.

---

### Zero-State Experience

When the search bar receives focus with no input, curated entry points appear:

- **Theme chips** as horizontally scrollable buttons: "Peace", "Courage", "Grief & Loss", "Joy", "Meditation", "Divine Love", "Self-Realization"
- **Curated questions** as list items: "How do I overcome fear?", "What is the purpose of life?"

Zero-state content is editorially governed — it shapes which teachings seekers encounter first. Claude validates autonomously per FTR-135. The zero-state and typing-state are served from separate static files (`_zero.json` vs. prefix files), enabling independent caching and editorial update cycles.

**Per-language authoring:** Zero-state chips are independently authored per language, not translated. "Grief & Loss" may not be the right entry point for a Hindi seeker; the Hindi zero-state may lead with "dhyan" (meditation) or "shanti" (peace). Each `_zero.json` is a culturally appropriate invitation, consistent with FTR-028's per-language bridge principle.

---

### URL Behavior on Selection

When a seeker selects a suggestion, the URL reflects their *original* selection:

- Term "meditation" -> `/search?q=meditation`
- Curated question -> `/search?q=How+do+I+overcome+fear%3F`
- Bridge-activated "mindfulness" -> `/search?q=mindfulness` (bridge expansion is search-time, not URL-visible)
- Scoped query -> `/search?q=Yogananda+on+meditation`

URLs are shareable and bookmarkable. Intent classification runs server-side on the selected text regardless of how the seeker arrived.

---

### Named Constants (FTR-012)

All suggestion parameters live in `/lib/config.ts` under the `SUGGEST_*` and `SUGGESTION_*` prefixes. Groups: debouncing (3 constants), display limits (2), fuzzy fallback (2), weight coefficients (2, corpus + editorial only per PRI-09), and pipeline thresholds (4). Code is the source of truth.

---

### Stage Progression

| Stage | Capability | Infrastructure |
|-----------|-----------|----------------|
| 1a | English static JSON: chapter titles + zero-state chips (current state) | Tier A (CDN) |
| 1b | + Spanish static JSON | Tier A bilingual |
| 1c | + pg_trgm fuzzy fallback endpoint. + Pipeline populating suggestion_dictionary from enrichment data (topics, entities, Sanskrit terms, scoped queries). Golden suggestion set (~500 entries, 6 tiers). | Tier A + B |
| 2b | + Vercel KV if migration triggers met (skipped — triggers not met) | Tier A + B |
| 3a | + Multi-book vocabulary expansion. + Bridge-powered suggestions from vocabulary_bridge table. + Curated editorial questions expanded. | Same tiers, richer data |
| 5b | + Per-language indices for 8 remaining languages. Devanagari native-script prefix files. CJK/Thai tokenization. | Per-language Tier A + B |
| 7a | + Personal "recent searches" (client-side localStorage, no server) | On-device only |

---

### Implementation State

**Functional layers:** Service (`lib/services/suggestions.ts` — queries `chapters` directly, not `suggestion_dictionary`), API route (`/api/v1/search/suggest`), component (`SearchCombobox.tsx` — full ARIA combobox), static data (`public/data/suggestions/{en,es}.json` — flat format, chapter titles + hardcoded chips), generator (`scripts/generate-suggestions.ts`), tests, config constants.

**Schema exists but empty:** `suggestion_dictionary` (migration 001), `vocabulary_bridge` (migration 002).

**Ready to harvest:** `book_chunks.topics` (2,681 chunks), `book_chunks.entities` JSONB (8 types), `entity_registry` (20 entities), `sanskrit_terms` (12 terms), `chapters.title` (98 chapters).

**The gap:** The enrichment data exists. The table exists. The component exists. The missing piece is the pipeline that connects them — `scripts/generate-suggestion-dictionary.ts` replacing the current `scripts/generate-suggestions.ts`. Schema alignment migration needed (migration 001 is missing `created_at`, UNIQUE constraint, `latin_form` trgm index, CHECK constraint). Format transition: single-deploy atomic cutover from flat files to prefix-partitioned directory structure.

---

### Resolved Design Questions

1. **Bridge data source before vocabulary_bridge is seeded.** Generate an empty `_bridge.json` and log a warning. The `spiritual-terms.json` flat file referenced in earlier drafts does not exist in the codebase and is not needed — the bridge capability activates naturally when FTR-028 seeds the `vocabulary_bridge` table. No fallback file, no phantom dependency.

2. **Scoped query localization.** Resolved: per-language templates in `/lib/data/scoped-query-templates.json` with em-dash fallback. See § Pre-Computation Pipeline, Step 4.

3. **Entity type filtering for scoped queries.** Resolved: teachers use "on", techniques use "and"/"in", skip scoped queries for places and divine names. See § Pre-Computation Pipeline, Step 4.

4. **Editorial governance of zero-state.** Resolved: same FTR-135 review process as all user-facing content. Claude proposes, human approves.

5. **Tier 5 / PRI-09 tension.** Resolved: Tier 5 renamed to "Editorially Promoted Queries." Behavioral query frequency informs editorial judgment, not algorithmic ranking. Weight formula is purely corpus-derived + editorial. See § Suggestion Quality Signals.

6. **Suggestion type naming.** `learned` renamed to `editorial` to match the Tier 5 rename. CHECK constraint added to schema spec.

7. **Format transition strategy.** Single-deploy atomic cutover — no dual-format support. Old flat files removed when pipeline ships. See § Implementation State.

8. **Scoped query scale.** Per-entity cap (`SUGGEST_MAX_SCOPED_PER_ENTITY = 20`) prevents cross-product explosion at full corpus. See § Pre-Computation Pipeline, Step 4.

9. **Prefix file normalization.** Client lowercases + NFC normalizes before file lookup. Non-alphabetic prefixes go to `_misc.json`. See § Pre-Computation Pipeline, Step 8.

10. **Suppressed entry handling.** Entries with `editorial_boost = -1.0` excluded from static JSON export. See § Pre-Computation Pipeline, Step 8.

### Open Questions

1. **Enrichment topic quality at scale.** The enrichment audit (§ Enrichment Data Prerequisites) handles the first book. As the corpus grows to 25 books, will topic vocabulary remain canonical or drift? May need periodic re-audit or a normalization layer in the enrichment prompt itself.

2. **Bridge hint continuation into search results.** When a bridge-activated suggestion is submitted, the search results page should show "Showing results for 'concentration' (Yogananda's terms for mindfulness)." The mechanism for passing bridge context from the suggestion component to the search results page is specified conceptually but not technically — query parameter? Search service metadata? Needs resolution during implementation.

3. **CJK/Thai suggestion tokenization.** Deferred to STG-021. No word boundaries means prefix-matching is fundamentally different. Evaluate n-gram prefix files vs. server-side tokenization when actual CJK content is ingested. **Partially resolved:** IME composition guard (§ Client Architecture) prevents suggestion dropdown collision with IME candidate windows for all non-Latin scripts. The tokenization/segmentation question for prefix matching in boundary-less scripts remains open.

4. **FTR-032 Tier 5 operational path.** FTR-032 specifies aggregate trend reporting ("What Is Humanity Seeking?") but not the Tier 5 editorial candidate pipeline. The mechanism — flagging queries that cross the `SUGGEST_LEARNED_QUERY_THRESHOLD` from different calendar days, presenting them in an editorial review queue — needs operational specification, either in FTR-032 or as a subsection here.

5. **Audit prompt engineering.** The two audit scripts (`audit-suggestion-sources.ts`, `audit-suggestion-quality.ts`) specify what Claude checks but not the prompt templates. These are implementation details, but prompt quality determines audit quality. Resolve during implementation; add prompts to a `prompts/` directory if they prove reusable.

6. **RTL language suggestion display.** Arabic and Urdu (Tier 3, STG-021) use RTL script. The dropdown's type indicators (right-aligned secondary text) reverse in RTL. The dropdown should inherit document direction (`dir` attribute) and type indicators should use logical positioning (`inline-end`). Design decision recorded; implementation deferred to STG-021.

7. ~~**Voice input and prefix matching.**~~ **Resolved.** Dictated input detected primarily via input velocity heuristic (>5 chars in single input event); `inputType === 'insertFromDictation'` as secondary signal where available (Safari non-standard, not cross-browser). See § Client Architecture. Voice input bypasses adaptive debounce and routes the complete phrase to prefix match against the full suggestion set. Semantic routing deferred to STG-007+ when the suggestion dictionary exceeds bridge coverage.

8. **Golden evaluation set maintenance.** When new books change the top-3 for established prefixes, who decides whether to update expectations or fix the pipeline? Protocol: pipeline failures are reviewed by the AI operator; expectation updates require editorial sign-off. Formalize during first pipeline run.

9. **Suggestion API rate limiting.** The `/api/v1/search/suggest` endpoint has no rate limiting. A sweeper could enumerate the dictionary via all two-char prefixes. Mitigation: Vercel's built-in DDoS protection covers volumetric attacks; for targeted enumeration, add `x-ratelimit` headers at STG-006 if monitoring shows abuse. The data is not sensitive (all suggestions are publicly visible in static JSON anyway).


## Notes

- **Origin:** Consolidated from FTR-020 suggestion sections and FTR-029 original. FTR-020 retains a cross-reference.
- **Design history:** Crucible stress-test, gap analysis (21 gaps), ghost audit (18 dependencies). Tier 5 corrected for PRI-09 compliance; weight formula revised to corpus + editorial only; register awareness acknowledged as scope boundary.
- **Adjacent FTRs:** FTR-026 (enrichment source data), FTR-028 (vocabulary bridge), FTR-033 (entity/Sanskrit sources), FTR-021 (schema), FTR-032 (query logging → Tier 5), FTR-037 (golden search set), FTR-082 (DELTA), FTR-135 (editorial review), FTR-131 (NFC normalization).
- **Cross-document actions at implementation time:** (1) Add Amplitude events to FTR-082 allowlist. (2) Add suggestion editorial review to FTR-135. (3) Add audit scripts to FTR-164 runtime/cost table. (4) Clarify FTR-032's Tier 5 candidate surfacing mechanism.
