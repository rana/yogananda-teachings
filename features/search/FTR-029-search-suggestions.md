---
ftr: 29
title: "Search Suggestions — Corpus-Derived, Not Behavior-Derived"
state: approved
domain: search
arc: 1a+
governed-by: [PRI-05, PRI-08, PRI-09]
---

# FTR-029: Search Suggestions

## Rationale

### FTR-029: Search Suggestions — Corpus-Derived, Not Behavior-Derived

#### Context

The portal's search architecture (FTR-020, FTR-105, FTR-005) is comprehensive: hybrid search, query expansion, intent classification, spiritual terminology bridge, passage ranking. But one common search UX pattern is absent: autocomplete suggestions as the seeker types.

Google-style autocomplete is powered by billions of user queries — the suggestion intelligence comes from aggregate behavior. This portal operates under fundamentally different constraints:

1. **DELTA compliance (FTR-082).** No user identification, no session tracking, no behavioral profiling. Personalized suggestions are architecturally impossible. Aggregate query-based suggestions face the FTR-032 minimum threshold problem — sparse data for months/years after launch.

2. **Bounded, known corpus.** The portal contains a finite set of Yogananda's published works. Unlike web search, every term in the corpus is known in advance. This means every suggestion can *guarantee* results exist — a property Google cannot offer.

3. **Calm Technology.** "Trending searches" and "popular queries" create social-media-like engagement patterns. Suggestions should reduce friction (calm), not drive browsing behavior.

4. **Librarian identity (FTR-001, FTR-077).** A librarian helps you formulate your question and knows the collection. Suggestions are a natural extension of the librarian metaphor — showing the seeker what terrain the teachings cover.

5. **Existing vocabulary bridge.** The Vocabulary Bridge (FTR-028) already maps seeker vocabulary to Yogananda's vocabulary. This infrastructure can power a unique suggestion type: surfacing the gap between what a seeker types and how Yogananda expressed the same concept.

#### Decision

1. **Suggestion intelligence is corpus-derived, not behavior-derived.** All suggestion sources are extracted from the content itself, not from user query patterns. This ensures DELTA compliance, guarantees every suggestion leads to results, and aligns with the librarian identity.

2. **Six-tier suggestion hierarchy** (priority order, highest intent first):

 | Tier | Type | Source | Example |
 |------|------|--------|---------|
 | 1 | **Scoped queries** | Entity co-occurrence from enrichment (FTR-026) | "Yogananda on the nature of God" |
 | 2 | **Named entities** | Entity registry (FTR-033) | "Autobiography of a Yogi", "Lahiri Mahasaya", "Kriya Yoga" |
 | 3 | **Domain concept phrases** | Topic and summary mining from enrichment | "cosmic consciousness", "divine love" |
 | 4 | **Sanskrit terms with definitions** | `sanskrit_terms` table (FTR-033) | "Samadhi — superconscious state" |
 | 5 | **Learned queries from logs** | Anonymized query log (DELTA-compliant, FTR-032) | (grows over time) |
 | 6 | **High-value single terms** | Hand-curated, ~200–300 terms | "meditation", "karma" |

 The "Yogananda on X" scoped query pattern (Tier 1) is the highest-value suggestion type for a teacher-centered corpus. It encodes the most precise intent and guarantees high-relevance results.

 The three original suggestion types map into this hierarchy: **term completion** spans Tiers 2, 3, and 6; **query suggestion** spans Tiers 1 and 5; **bridge-powered suggestion** is integrated into Tiers 3 and 4 (Sanskrit terms with definitions, bridged concepts with Yogananda's vocabulary).

 Implementation: Three-tier progressive architecture (FTR-029). Tier A: static JSON prefix files at CDN edge (< 10ms). Tier B: pg_trgm fuzzy fallback for misspellings and transliteration (40–80ms). Tier C: Vercel KV (Upstash Redis) with sorted sets if Tier A+B latency is insufficient (< 5ms, activated by concrete migration triggers).

3. **New API endpoint: `GET /api/v1/search/suggest`.** Accepts `q` (partial query), `language`, and `limit` parameters. Returns typed suggestions with category metadata (term/query/bridge). No Claude API call — pure database/cache lookup for speed.

4. **Zero-state experience is editorially curated.** When the search bar is focused but empty, display curated entry points (theme names, "Seeking..." prompts). This is an editorial statement — governance follows the same human-review principle as all user-facing content.

5. **Milestone progression:** Basic prefix matching in Arc 1 — bilingual (en/es) from day one. Bridge-powered suggestions and curated queries added incrementally. Hindi Devanagari native-script prefix files and per-language suggestion indices for remaining 8 languages in Milestone 5b. Optional personal "recent searches" (client-side only, no server storage) in Milestone 7a.

#### Alternatives Considered

1. **Aggregate query-based suggestions ("popular searches").** Rejected: DELTA non-compliant without careful anonymization. Sparse data for months after launch. Creates social-proof dynamics misaligned with Calm Technology. Even with FTR-032-style thresholds, the minimum viable data for useful suggestions requires significant traffic volume.

2. **Claude-powered suggestion generation.** Rejected: Adds latency (LLM call per keystroke or debounced batch), cost, and complexity. The corpus is bounded — pre-computed suggestions are faster, cheaper, and more reliable. The intent classification system (FTR-005 E1) already handles query understanding after submission.

3. **No suggestions at all.** Considered: The intent classification + terminology bridge already handle "seeker doesn't know the right words" after query submission. However, pre-submission suggestions reduce typing friction, show seekers what the corpus contains, and extend the librarian metaphor. The bounded corpus makes guaranteed-result suggestions uniquely valuable.

4. **Third-party search-as-a-service (Algolia, Typesense).** Rejected: Adds vendor dependency for a feature achievable with PostgreSQL `pg_trgm` and edge caching. Violates single-database principle (FTR-104). Over-engineered for a bounded corpus.

#### Rationale

- **Bounded corpus is the advantage.** Web-scale autocomplete must handle infinite content and relies on query logs for signal. A sacred text library has finite, known content — every suggestion can guarantee results. This property is more valuable than trending queries.
- **Corpus-derived suggestions are always fresh.** When a new book is ingested, its vocabulary automatically enters the suggestion index. No cold-start problem, no minimum query volume needed.
- **Bridge-powered suggestions are unique.** No existing search product surfaces the gap between user vocabulary and corpus vocabulary as a suggestion. This extends the Vocabulary Bridge (FTR-028) from a backend query-expansion tool to a user-facing navigation aid.
- **DELTA compliance by construction.** No behavioral data enters the suggestion pipeline. Privacy is a design property, not a policy constraint.
- **Calm Technology alignment.** Suggestions show what's available — they don't optimize for engagement. No "trending," no social proof, no urgency signals.

#### Consequences

- New API endpoint (`/api/v1/search/suggest`) added to DESIGN.md § API Design
- New DESIGN.md subsection within the AI Librarian search architecture: "Search Suggestions — Corpus-Derived, Not Behavior-Derived"
- ROADMAP.md updated: Deliverable M1c-9 (basic prefix matching), M3a-9 (multi-book + bridge + curated), Milestone 5b (per-language indices)
- CONTEXT.md updated with new open questions: zero-state experience, transliteration support, editorial governance of curated suggestions, mobile keyboard interaction
- Suggestion index extraction becomes part of the book ingestion pipeline (extends FTR-028 per-book lifecycle)
- Accessibility requirement: ARIA combobox pattern for the suggestion dropdown (extends FTR-003)
- Per-language suggestion indices required for Milestone 5b (extends multilingual architecture)

### FTR-029: Three-Tier Suggestion Cache Architecture

#### Context

FTR-029 establishes corpus-derived suggestions with three types (term completion, query suggestion, bridge-powered). For a world-class search experience, suggestion latency should be invisible — ideally < 30ms perceived (network + render). The threshold for human-perceptible lag is ~50ms; above 100ms, autocomplete feels broken. Google achieves 20–40ms, Linear and Notion hit 15–35ms.

The suggestion dictionary is small — ~1,500 entries at Arc 1 (single book), ~6,300 at full corpus (25 books x 200 terms + entities + curated queries + Sanskrit + concepts). For a dictionary this size, the infrastructure choice should be the *simplest thing that achieves invisible latency*, not the most powerful.

ElastiCache Redis was initially considered but rejected: it requires VPC networking with Vercel (adding 5–15ms that erases its speed advantage), carries significant operational overhead (subnets, security groups, parameter groups, failover), has a high cost floor (~$50–80/mo minimum for production multi-AZ), and is single-region by default. For a 6K-row suggestion dictionary, this is over-engineering.

#### Decision

**Three-tier progressive architecture** — each tier is a complete solution; the next tier activates only when the previous one's limits are reached.

**Six-tier suggestion hierarchy** (priority order, unchanged):

| Tier | Type | Source | Example |
|------|------|--------|---------|
| 1 | Scoped queries | Entity co-occurrence from enrichment | "Yogananda on the nature of God" |
| 2 | Named entities | Entity registry (FTR-033) | "Autobiography of a Yogi", "Lahiri Mahasaya" |
| 3 | Domain concept phrases | Topic and summary mining from enrichment | "cosmic consciousness", "divine love" |
| 4 | Sanskrit terms with definitions | `sanskrit_terms` table (FTR-033) | "Samadhi — superconscious state" |
| 5 | Learned queries from logs | Anonymized query log (DELTA-compliant) | (grows over time from FTR-032 signal) |
| 6 | High-value single terms | Hand-curated, ~200–300 terms | "meditation", "karma" |

##### Tier A: Static JSON at the CDN Edge (Milestone 1a+)

Pre-computed suggestion files partitioned by two-character prefix, served as static assets from Vercel's CDN:

```
/public/suggestions/en/_zero.json    — zero-state suggestions (theme chips, curated questions)
/public/suggestions/en/me.json       — all suggestions starting with "me"
/public/suggestions/en/yo.json       — all suggestions starting with "yo"
/public/suggestions/en/_bridge.json  — terminology bridge mappings
```

- **Latency: < 10ms globally** (CDN cache hit, no function invocation, no origin roundtrip)
- **Cost: $0** (static assets on Vercel's CDN)
- **Cold start: none**
- **Build step:** Ingestion pipeline exports `suggestion_dictionary` -> partitioned JSON. Rebuilds on deploy or content change.
- **Client-side filtering:** Browser fetches the prefix file (~2–8KB) and filters/ranks locally against the full typed prefix.
- **Bridge hints:** Included in `_bridge.json`, matched client-side.
- **Global-First:** The CDN edge node is nearby for seekers in rural Bihar and Los Angeles alike (Principle #4).

**Why this works for the portal's scale:** At full corpus (~6,300 entries), each two-character prefix file is 2–8KB. The entire English suggestion set is ~150KB. This is smaller than a single hero image. The browser caches prefix files after first fetch — subsequent keystrokes with the same two-character prefix are instant (0ms network).

##### Tier B: pg_trgm Fuzzy Fallback (Milestone 1c+, always-on)

When client-side prefix filtering returns fewer than 3 results (misspelling, mid-word match, novel prefix), the frontend fires an async request to the fuzzy fallback endpoint:

```sql
SELECT suggestion, display_text, weight, suggestion_type, latin_form
FROM suggestion_dictionary
WHERE (similarity(suggestion, $partial_query) > 0.3
       OR similarity(latin_form, $partial_query) > 0.3)
  AND language = $detected_language
ORDER BY weight DESC,
         GREATEST(similarity(suggestion, $partial_query),
                  COALESCE(similarity(latin_form, $partial_query), 0)) DESC
LIMIT 10;
```

- **Latency: 40–80ms** (Neon roundtrip)
- **Purpose:** Fuzzy matching catches misspellings that prefix matching misses. Also handles transliterated input via `latin_form` matching — a Hindi seeker typing Romanized "samadhi" matches against both `suggestion` and `latin_form` columns.
- **Async merge:** Fuzzy results merge into the dropdown when they arrive. The seeker sees prefix results instantly, then fuzzy results appear if needed.
- **Edge caching:** Fuzzy responses carry `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400` — identical misspellings served from edge on repeat.

##### Tier C: Vercel KV (Milestone 2b+, if needed)

If Tier A + B latency is insufficient, Vercel KV (built on Upstash Redis) provides sub-10ms server-side prefix search with zero operational overhead:

- Language-namespaced sorted sets: `suggestions:{language}` -> `(suggestion, weight)`
- Prefix lookup: `ZRANGEBYLEX suggestions:en "[Yog" "[Yog\xff"` returns in < 5ms
- Dictionary built offline from corpus enrichment pipeline
- Sanskrit variants loaded from `sanskrit_terms.common_variants` — all variant forms point to the canonical suggestion
- Nightly refresh incorporates query log signal (Tier 5)
- **Cost: ~$20/mo at 1M requests** (Upstash pay-per-use via Vercel integration)
- **Global distribution:** Upstash global replication, no VPC required
- **No infrastructure complexity:** Provisioned via Vercel dashboard or `vercel env`

**Concrete migration trigger:** Activate Tier C when any of these thresholds are sustained for 7 days:
- Suggestion p95 latency exceeds 30ms (measuring CDN miss + client filter time)
- Suggestion dictionary exceeds 50K entries per language (prefix files exceed 15KB each)
- Tier 5 learned queries update more frequently than daily (real-time freshness needed)

**Frontend debounce:** Adaptive debounce rather than fixed interval:
- **First keystroke after focus:** Fire immediately (0ms). The zero-state -> first-results transition is the most important perceived-speed moment.
- **Subsequent keystrokes:** Fire after 100ms of inactivity (tunable, FTR-012). Reduces request volume ~60%.
- **On slow connections** (`navigator.connection.effectiveType === '2g'`): Extend debounce to 200ms to avoid wasting brief connectivity windows on intermediate prefixes.

#### Seeker Experience Walkthrough

The suggestion system extends the librarian metaphor — a guide who, when approached, gently surfaces what the library contains.

**Focus (zero-state).** Seeker clicks the search bar. Before typing, curated entry points appear: theme chips ("Peace", "Courage", "Grief & Loss") and question prompts ("How do I overcome fear?"). Served from `_zero.json` at the CDN edge (< 10ms). Screen reader announces: "Search. What are you seeking? 2 suggestions available."

**Typing (prefix match).** Seeker types "med" and pauses. After the debounce, the browser fetches `/suggestions/en/me.json` from the CDN (< 10ms), filters client-side to entries matching "med", ranks by weight, and renders the dropdown with category labels (theme, chapter, corpus). No database queried, no function invoked, no API call made.

**Bridge moment (the differentiator).** Seeker types "mindful". The client matches against `_bridge.json` and displays: "mindfulness (corpus)" with a bridge hint — "Yogananda's terms: concentration, one-pointed attention, interiorization." The system translates the seeker's vocabulary into the library's vocabulary *before submission*. No other search product does this.

**Curated questions.** Seeker types "How do I". Curated question suggestions appear — editorially written questions the librarian knows the library can answer well. Each is maintained in `/lib/data/curated-queries.json`, reviewed by SRF-aware editors (FTR-135).

**Fuzzy recovery.** Seeker types "meditatoin" (typo). Prefix match finds nothing. The system silently fires an async pg_trgm request. Within 40–80ms, fuzzy results merge into the dropdown — "meditation" appears. No "did you mean?" prompt. Quiet correction.

**Selection and handoff.** Seeker selects "meditation" (click or Enter). Intent classification (FTR-005 E1, a separate system) determines routing — theme page, search results, or Practice Bridge. The suggestion system's job is done: it reduced friction, taught the seeker the library's vocabulary, and delivered them to the right doorway. The URL reflects the seeker's original selection: `/search?q=meditation`. For bridge-expanded queries, the URL preserves the original term, not the expansion.

**Mobile experience.** On viewports < 768px, the suggestion dropdown shows a maximum of 5 suggestions (vs. 7 on desktop) to avoid the virtual keyboard competing with results. Touch targets are 44x44px minimum (FTR-003). Zero-state chips use horizontal scroll rather than wrapping.

#### Rationale

- **Invisible latency through progressive infrastructure.** Static JSON at the CDN edge achieves < 10ms globally for the common case. pg_trgm provides fuzzy recovery. Vercel KV is available as a graduation path if scale demands it. Each tier is a complete, working solution.
- **Simplest infrastructure that works.** The suggestion dictionary is small (~6K entries at full corpus). Static files at the edge are simpler, cheaper, faster, and more globally distributed than any server-side solution. Start simple; graduate when evidence demands it.
- **ElastiCache rejected.** VPC networking with Vercel adds latency that erases ElastiCache's speed advantage. Operational overhead (subnets, security groups, monitoring, failover, patching) is disproportionate for a 6K-row dictionary. Single-region by default, expensive at minimum viable configuration. Vercel KV (Upstash Redis) provides the same sorted-set semantics with zero ops and global distribution.
- **pg_trgm remains essential.** Fuzzy matching catches misspellings that prefix matching misses. The `latin_form` column enables transliterated input for Indic languages. The two systems (prefix + fuzzy) are complementary.
- **Adaptive debounce respects global equity.** Fixed debounce penalizes seekers on slow connections. Firing immediately on first keystroke makes the zero-state -> first-results transition feel instant. Extending debounce on 2G connections avoids wasting brief connectivity windows.
- **Bridge hints in search results, not just suggestions.** When a bridge-expanded query produces search results, the results page shows: "Showing results for 'concentration' and 'one-pointed attention' (Yogananda's terms for mindfulness)." The bridge hint's pedagogical work continues past the suggestion phase.

#### Consequences

- New `suggestion_dictionary` table in FTR-021 (Data Model): `suggestion`, `display_text`, `suggestion_type`, `language`, `script`, `latin_form`, `corpus_frequency`, `query_frequency`, `editorial_boost`, `weight`, `entity_id`, `book_id`
- Weight coefficients (`corpus_frequency * 0.3 + query_frequency * 0.5 + editorial_boost * 0.2`) implemented as named constants in `/lib/config.ts` (FTR-012), not as a generated column — allows tuning without migration
- FTR-029 updated with six-tier hierarchy
- Build step in ingestion pipeline: export `suggestion_dictionary` -> partitioned static JSON files per language
- Milestone 1a: English static JSON suggestion files + client-side prefix filtering
- Milestone 1b: Spanish static JSON suggestion files (bilingual). `latin_form` populated during Spanish ingestion. Hindi Devanagari prefix files added in Milestone 5b.
- Milestone 1c: pg_trgm fuzzy fallback endpoint (`/api/v1/search/suggest`) — queries both `suggestion` and `latin_form` columns for transliteration
- Milestone 2b+: Vercel KV activated if migration trigger thresholds are sustained
- Milestone 5b: Per-language suggestion indices for remaining 7 languages; CJK/Thai tokenization strategies
- No ElastiCache infrastructure — Vercel KV provisioned via Vercel integration when needed
- The suggestion pipeline becomes part of the ingestion pipeline — each new book updates the dictionary and triggers a static JSON rebuild

## Notes

- **Origin:** FTR-029 (Rationale) + FTR-029 (Rationale)
- **Merge:** Two related ADRs covering the same suggestion infrastructure — FTR-029 establishes the design, FTR-029 specifies the cache architecture
