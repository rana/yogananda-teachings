# FTR-020: Hybrid Search (Vector + Full-Text)

**State:** Approved
**Domain:** search
**Arc:** 1a+
**Governed by:** PRI-01, PRI-03

## Rationale

### Context

Two search paradigms exist:

| Approach | Strengths | Weaknesses |
|----------|-----------|------------|
| **Vector-only** | Finds semantically similar passages even without keyword overlap | Misses exact phrases; less precise for specific terms |
| **Full-text-only** | Precise keyword matching; fast; no embedding cost | Misses conceptual/semantic matches; requires exact terms |
| **Hybrid (RRF)** | Best of both; catches conceptual AND exact-phrase queries | More complex query logic |

### Decision

Use **hybrid search** with Reciprocal Rank Fusion (RRF) to merge vector similarity and full-text search results in a single Postgres query.

### Rationale

- A seeker searching "divine mother" wants exact keyword matches (FTS)
- A seeker searching "how to find inner peace" wants conceptual matches (vector)
- RRF is a proven, simple merging algorithm that requires no ML training
- Both search types run natively in Postgres — no external services

### Consequences

- Each chunk needs both an embedding vector AND a pg_search BM25 index (FTR-025)
- The hybrid_search SQL function uses `paradedb.score(id)` and `@@@` operator for BM25, fused with vector results via RRF
- Weights between FTS and vector can be tuned based on query characteristics

## Specification

### Core Principle

The AI is a **librarian**, not an **oracle**. It finds Yogananda's words — it never speaks for him. All results shown to users are verbatim quotes from published works with precise citations.

### FTR-077: Brand Identity

"The Librarian" is the portal's external brand identity for its AI search capability. In a world where every AI product synthesizes content, the portal's refusal to generate is a radical differentiator. The About page explains: *"This is not an AI that speaks for Yogananda. It is a librarian that finds his words for you. Every passage you see is exactly as he wrote it."* The `llms.txt` file includes this framing. Search results may include a subtle footer: *"Every passage shown is Yogananda's own words."*

### Search Flow

The search pipeline has evolved through three arc tiers. Milestones 1a–2a use a two-path retrieval core (vector + BM25). Milestone 2b+ adds HyDE and Cohere Rerank. Milestone 3b+ adds a third retrieval path via Postgres-native graph traversal (FTR-034).

```
1. USER QUERY
 "How do I overcome fear?"
 │
 ▼
2. LANGUAGE DETECTION (fastText — per-query, < 1ms)
 Detect query language → route to language-appropriate indexes.
 Short queries (< 3 words) use session language or Accept-Language header as tiebreaker.
 │
 ▼
3. INTENT CLASSIFICATION (Claude Haiku via Bedrock — lightweight, FTR-105)
 Classify intent: topical / specific / emotional / definitional / situational / browsing / search.
 Route non-search intents to theme pages, reader, or daily passage.
 Falls back to standard search if uncertain.
 │
 ▼
4. QUERY EXPANSION (Claude Haiku via Bedrock — optional, for complex queries)
 a) Terminology Bridge (FTR-005 E2):
    Map cross-tradition and modern terms to Yogananda's vocabulary
    "mindfulness" → "concentration", "one-pointed attention"

 b) Claude expands the query into semantic search terms:
    ["fear", "courage", "anxiety", "fearlessness", "divine protection",
     "dread", "worry", "soul immortal", "overcome terror"]

    Strict instructions:
    - Output ONLY a JSON array of search terms
    - Do not answer the question
    - Do not generate any teaching content
 │
 ▼
5. HyDE — HYPOTHETICAL DOCUMENT EMBEDDING (Milestone 2b+, FTR-027)
 Claude generates a hypothetical passage that would answer the query,
 written in Yogananda's register. This generated passage is an
 intermediate embedding artifact only — it is never stored, displayed,
 or accessible to seekers. It improves retrieval quality without
 generating any user-facing content. FTR-001 is not violated.
 The passage is embedded and searched in document-space (asymmetric:
 query-type embedding for original query, document-type embedding
 for HyDE passage — per Voyage FTR-024).
 High lift on literary/spiritual corpora where seeker vocabulary
 diverges from corpus vocabulary.
 │
 ▼
6. MULTI-PATH PARALLEL RETRIEVAL (Neon PostgreSQL, Milestone 3b+ adds PATH C)

 PATH A — Dense Vector (pgvector, HNSW):
 - Embed the original query using Voyage voyage-3-large (FTR-024)
 - Find top 20 chunks by cosine similarity
 - If HyDE active: also search with HyDE embedding, merge via RRF

 PATH B — BM25 Keyword (pg_search/ParadeDB, FTR-025):
 - Search expanded terms against the BM25 index (ICU tokenizer)
 - BM25 scoring produces better relevance ranking than tsvector ts_rank
 - Find top 20 chunks by keyword relevance

 PATH C — Graph-Augmented Retrieval (Postgres, Milestone 3b+, FTR-034):
 - Identify entities/concepts in query via entity registry (FTR-033)
 - SQL traversal across extracted_relationships and concept_relations
 - Return top 20 chunks reachable within 2–3 hops
 - pgvector similarity applied to graph-retrieved candidates
 - Multi-step queries composed in /lib/services/graph.ts

 RECIPROCAL RANK FUSION (RRF):
 - Merge results from all active paths (A+B in Milestones 1a–3a; A+B+C in Milestone 3b+)
 - score = Σ 1/(k + rank_in_path) across all paths, k=60 *[Parameter — default: 60, evaluate: M1a-8 golden set at k=40/60/80]*
 - Deduplicate, producing top 20 candidates
 │
 ▼
7. RERANKING (Cohere Rerank 3.5, Milestone 2b+, FTR-027)
 Cross-encoder reranker sees query + passage together.
 Multilingual native. Replaces Claude Haiku passage ranking for precision.
 Selects and ranks top 5 from 20 candidates.

 Milestones 1a–2a fallback: Claude Haiku passage ranking (FTR-105).
 │
 ▼
8. CONTEXT EXPANSION
 For each top-5 result, fetch surrounding chunks for
 "read in context" display. Attach enrichment metadata:
 book, chapter, page, experiential depth, voice register.
 │
 ▼
9. RESULT PRESENTATION
 Display ranked passages as verbatim quotes:

 ┌──────────────────────────────────────────────┐
 │ "The soul is ever free; it is deathless, │
 │ birthless, ever-existing..." │
 │ │
 │ — Autobiography of a Yogi, Chapter 26 │
 │ Page 312 │
 │ [Read in context →] │
 └──────────────────────────────────────────────┘

 Each result includes:
 - The verbatim passage text (highlighted relevant portion)
 - Book title, chapter, page number
 - A deep link to the book reader positioned at that passage
 - Related teachings (Milestone 3a+, FTR-030) grouped by relationship type
```

**Milestone progression of the search pipeline:**

| Milestone | Retrieval Paths | Reranker | Enhancements |
|-----------|----------------|----------|-------------|
| 1a–2a | Vector (pgvector) + BM25 (pg_search) | Claude Haiku passage ranking | Basic query expansion, terminology bridge |
| 2b–3a | Vector + BM25 | Cohere Rerank 3.5 | HyDE, improved query expansion |
| 3b+ | Vector + BM25 + Graph (Postgres) | Cohere Rerank 3.5 | Three-path RRF, entity-aware retrieval |

### Search Intent Classification (FTR-005 E1)

Before query expansion, a lightweight Claude call classifies the seeker's intent:

```
User types: "I'm scared"
 │
 ▼
INTENT CLASSIFICATION (Claude Haiku via Bedrock — lightweight, ~$0.0005/query, FTR-105)
 Claude classifies the query:
 { "intent": "emotional", "route": "theme", "theme_slug": "courage" }

 Intent types:
 topical → redirect to /themes/[slug] if theme exists
 specific → redirect to reader (/books/[slug]/[chapter])
 emotional → empathic entry: theme-filtered search with compassionate framing
 definitional → search with boost for passages where Yogananda defines the term
 situational → search with situation-theme boost
 browsing → route to Today's Wisdom / random passage
 search → standard hybrid search (default fallback)

 Returns JSON only. Falls back to standard search if uncertain.
```

### Spiritual Terminology Bridge (FTR-005 E2)

The query expansion system prompt includes a tradition-aware vocabulary mapping maintained at `/lib/data/spiritual-terms.json`:

```
Seeker searches: "mindfulness meditation anxiety"
 │
 ▼
TERMINOLOGY BRIDGE (integrated into query expansion prompt)
 Maps cross-tradition and modern terms to Yogananda's vocabulary:
 "mindfulness" → "concentration", "one-pointed attention", "interiorization"
 "anxiety" → "restlessness", "mental disturbance", "nervous agitation"
 "meditation" → "meditation" (direct match — also expands to "stillness", "going within")

 Expanded query:
 ["mindfulness", "concentration", "one-pointed attention", "interiorization",
 "anxiety", "restlessness", "mental disturbance", "meditation", "stillness",
 "going within", "calm", "peace of mind"]
```

The Vocabulary Bridge (FTR-028, FTR-028) is a five-layer PostgreSQL-backed semantic model that bridges the vocabulary gap between seekers who have never read Yogananda and the specific language of his published works. It replaces the original flat JSON approach with register awareness, retrieval intent routing, and language-specific cultural grounding.

The bridge deepens with each book ingested. Each book ingestion triggers Opus extraction across three categories (modern-to-Yogananda mappings, Sanskrit inline definitions, cross-tradition terms), diffed against existing entries and merged with source provenance. See FTR-028 § Per-Book Evolution Lifecycle and FTR-028 for the complete specification, data model, and query-time flow.

### Claude System Prompts (Draft — Refine During Arc 1)

These are the initial system prompts for the three Claude API calls in the search pipeline. All prompts enforce the "librarian, not oracle" constraint: Claude processes queries and selects passages but never generates teaching content.

#### Query Expansion Prompt

```
You are a search query expansion assistant for a library of Paramahansa Yogananda's published books.

Given a seeker's query, generate a JSON array of 8-15 semantically related search terms that would help find relevant passages in Yogananda's writings. Include:
- Direct synonyms and related concepts
- Yogananda's specific vocabulary (e.g., "Self-realization", "cosmic consciousness", "Kriya Yoga")
- Cross-tradition equivalents (e.g., "mindfulness" → "concentration", "one-pointed attention")
- Emotional resonances (e.g., "scared" → "fear", "courage", "divine protection")

RULES:
- Output ONLY a valid JSON array of strings. No explanation, no prose.
- Do NOT answer the seeker's question.
- Do NOT generate any teaching content or quotes.
- Do NOT paraphrase Yogananda's words.
- If the query is already a specific term (e.g., "samadhi"), return a small array of closely related terms.

Spiritual terminology mappings are provided below for reference:
{terminology_bridge_json}

Query: "{user_query}"
```

#### Intent Classification Prompt

```
You classify spiritual search queries for a library of Paramahansa Yogananda's published books.

Given a seeker's query, classify its intent and return a JSON object.

Intent types:
- "topical": Seeker wants information on a theme (route to theme page if exists)
- "specific": Seeker wants a specific passage, chapter, or book
- "emotional": Seeker is expressing a feeling or seeking comfort
- "definitional": Seeker wants Yogananda's definition of a concept
- "situational": Seeker describes a life situation
- "browsing": Seeker wants to explore without a specific target
- "search": General search (default fallback)

RULES:
- Output ONLY a valid JSON object: {"intent": "...", "route": "...", "theme_slug": "..."}
- "route" is one of: "theme", "reader", "search", "daily"
- "theme_slug" is only present when route is "theme" and a matching theme exists
- If uncertain, default to {"intent": "search", "route": "search"}
- Do NOT answer the query. Do NOT generate any content.

Available theme slugs: {theme_slugs_json}

Query: "{user_query}"
```

#### Passage Ranking Prompt

```
You are a passage relevance judge for a library of Paramahansa Yogananda's published books.

Given a seeker's query and a list of candidate passages (each with an ID), select and rank the 5 most relevant passages.

Relevance criteria:
- The passage directly addresses the seeker's question or emotional state
- The passage contains Yogananda's most authoritative teaching on the topic
- Prefer passages that are complete thoughts (not fragment mid-sentence)
- Prefer passages that would be meaningful to a seeker reading them in isolation

RULES:
- Output ONLY a valid JSON array of passage IDs in ranked order (most relevant first).
- Return at most 5 IDs. Return fewer if fewer are relevant.
- If NO passages are relevant to the query, return an empty array: []
- Do NOT modify, summarize, or paraphrase any passage text.
- Do NOT generate any teaching content.
- Judge based on the passage text provided — do not infer or assume content.

Query: "{user_query}"

Candidate passages:
{passages_json}
```

*These prompts are starting points. Milestone 1a empirical testing (M1a-8, search quality evaluation — English only) will refine wording, few-shot examples, and temperature settings. All prompts are maintained in `/lib/prompts/` as version-controlled TypeScript template literals.*

### Search Without AI (Fallback / Simple Queries)

For straightforward keyword queries, the system can operate without any LLM calls:

```
User types: "divine mother"
 → Full-text search only (no query expansion needed)
 → Results ranked by pg_search BM25 score (FTR-025)
 → No Claude API call required
 → Fast, free, reliable
```

The LLM is invoked only when the query is conceptual/semantic and benefits from expansion or re-ranking. This keeps costs low and latency minimal for simple searches.

### Claude API Graceful Degradation

When Claude (via AWS Bedrock, FTR-105) is unavailable (timeout, error, rate limit, or monthly budget cap), search degrades gracefully through four levels. No seeker ever sees an error — quality decreases silently.

| Level | Trigger | What Works | What Doesn't | User Impact |
|-------|---------|-----------|--------------|-------------|
| **Full** | All services healthy | Query expansion + HyDE (Milestone 2b+) + multi-path retrieval + Cohere Rerank (Milestone 2b+) | — | Best results: conceptual queries understood, top 5 precisely ranked |
| **No rerank** | Cohere Rerank unavailable | Query expansion, HyDE, multi-path RRF | Cross-encoder reranking | Top 5 from RRF scores; slightly less precise ordering |
| **No HyDE** | HyDE generation fails | Query expansion, multi-path RRF, Cohere Rerank | Hypothetical document embedding | Marginal loss on literary/metaphorical queries |
| **No expansion** | Claude query expansion fails | Raw query → hybrid search (vector + BM25) | Conceptual query broadening | Keyword-dependent; "How do I find peace?" works less well than "peace" |
| **Database only** | All AI services fail | Pure hybrid search (pgvector + pg_search BM25) | All AI enhancement | Still returns relevant verbatim passages via vector similarity + BM25 |

**Implementation:** `/lib/services/search.ts` wraps each external service call in a try-catch with a 5-second timeout. Failure at any level falls through to the next. Sentry captures each degradation event (`search.degradation` with `level` and `service` tags) for monitoring. The search API response includes a `searchMode` field (`"full"`, `"no_rerank"`, `"no_hyde"`, `"no_expansion"`, `"database_only"`) for observability — not exposed in the seeker-facing UI.

### FTR-024: Embedding Model Migration Procedure

When the embedding model changes (e.g., from `voyage-3-large` to a successor, or to a per-language model for Milestone 5b), re-embedding the full corpus is required. The `embedding_model`, `embedding_dimension`, and `embedded_at` columns on `book_chunks` enable safe, auditable migration.

**Procedure:**

```
1. CREATE NEON BRANCH
 Branch from production. All re-embedding work happens on the branch.
 Production search continues uninterrupted.

2. RE-EMBED ALL CHUNKS (on branch)
 Lambda batch job (FTR-107, FTR-105 batch tier):
 - Read all chunks where embedding_model != new_model
 - Generate new embeddings in batches of 100
 - Use Voyage asymmetric encoding: document input type for chunks
 - UPDATE embedding, embedding_model, embedding_dimension, embedded_at
 - Log progress to CloudWatch

 Estimated cost: Voyage voyage-3-large ~$0.06 per 1M tokens
 Estimated time: ~50K chunks ≈ 15-30 minutes at API rate limits

3. REBUILD HNSW INDEX (on branch)
 DROP INDEX idx_chunks_embedding;
 CREATE INDEX idx_chunks_embedding ON book_chunks
 USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
 -- If dimension changed, ALTER TABLE first:
 -- ALTER TABLE book_chunks ALTER COLUMN embedding TYPE VECTOR(new_dim);

4. RECOMPUTE CHUNK RELATIONS (on branch)
 Re-run the chunk_relations batch job (FTR-030).
 New embeddings produce different similarity scores.

5. VALIDATE (on branch)
 Run the search quality evaluation test suite (M1a-8).
 Compare results against production baseline.
 Threshold: new model must match or exceed current ≥ 80% pass rate.

6. PROMOTE
 If validation passes: merge branch to production via Neon.
 If validation fails: delete branch, keep current model.

7. UPDATE CONFIG
 Update /lib/config.ts EMBEDDING_MODEL and EMBEDDING_DIMENSIONS.
 Update default values in schema for new chunks.
```

**Cost estimate for full corpus re-embedding:** < $15 for Voyage voyage-3-large at 50K chunks (~25M tokens). The operational cost is primarily developer time for validation, not API spend. At significant volume, evaluate AWS Marketplace SageMaker model packages for Voyage to reduce per-call costs.

**Multilingual embedding quality (FTR-024, FTR-024).** Voyage voyage-3-large is multilingual-first by design: 1024 dimensions, 26 languages, unified cross-lingual embedding space, 32K token input window. For European languages (es, de, fr, it, pt) and major Asian languages (ja, zh, ko, hi), this provides strong baseline retrieval. For CJK-heavy corpora, benchmark Voyage `voyage-multilingual-2` as an alternative — it may excel on languages with fundamentally different morphology. Milestone 5b includes formal benchmarking with actual translated passages across Voyage voyage-3-large, Cohere embed-v3, and BGE-M3.

**Domain-adapted embeddings (FTR-024, later-stage research).** The highest-ceiling path to world-class retrieval: fine-tune a multilingual base model on Yogananda's published corpus across languages. A domain-adapted model would understand spiritual vocabulary, metaphorical patterns, and cross-tradition concepts at a depth no general model matches. Prerequisites: multilingual corpus (Milestone 5b ingestion) and per-language evaluation suites (Milestone 5b). The same migration procedure above applies — the architecture imposes no constraints on model provenance.

### FTR-029: Search Suggestions — Corpus-Derived, Not Behavior-Derived

The search architecture above handles what happens *after* a query is submitted. This section covers what happens *as the seeker types* — autocomplete suggestions that reduce friction, show what the corpus contains, and extend the librarian metaphor. A librarian who, when you approach the desk, gently surfaces what the library contains.

**Core principle:** Suggestion intelligence is corpus-derived, not behavior-derived. All suggestions are extracted from the content itself, not from user query patterns. This ensures DELTA compliance (FTR-082), guarantees every suggestion leads to results, and aligns with the Calm Technology principle — suggestions show what's available, not what's popular.

#### Seeker Experience

The suggestion system's job is to reduce friction, teach the seeker the library's vocabulary, and deliver them to the right doorway. Everything below — infrastructure, APIs, schemas — serves this experience.

**Scene 1: Focus (zero-state).** The seeker clicks the search bar. Before they type, curated entry points appear — theme chips ("Peace", "Courage", "Grief & Loss") and question prompts ("How do I overcome fear?", "What is the purpose of life?"). This is a librarian gently offering: "Here are some things people come here looking for." Served from `_zero.json` at the CDN edge (< 10ms). Screen reader announces: "Search. What are you seeking? 2 suggestions available."

**Scene 2: Typing (prefix match).** The seeker types "med" and pauses. After the adaptive debounce, the browser fetches `/suggestions/en/me.json` from the CDN (< 10ms), filters client-side to entries matching "med", ranks by weight, and renders the dropdown with category labels (theme, chapter, corpus). No database queried, no function invoked, no API call made. Arrow keys navigate, `Enter` selects, `Escape` dismisses. Screen reader announces each suggestion as arrow keys navigate.

**Scene 3: The bridge moment (the differentiator).** The seeker types "mindful". The client matches against `_bridge.json` and displays: "mindfulness (corpus)" with a bridge hint — "Yogananda's terms: concentration, one-pointed attention, interiorization." The system translates the seeker's modern vocabulary into the library's vocabulary *before submission*. No other search product surfaces the gap between user vocabulary and corpus vocabulary as a real-time suggestion. When the seeker submits this query, the search results page continues the pedagogical work: "Showing results for 'concentration' and 'one-pointed attention' (Yogananda's terms for mindfulness)."

**Scene 4: Curated questions.** The seeker types "How do I". Curated question suggestions appear — editorially written questions the librarian knows the library can answer well. Maintained in `/lib/data/curated-queries.json`, reviewed by SRF-aware editors (FTR-135).

**Scene 5: Fuzzy recovery.** The seeker types "meditatoin" (typo). Prefix match finds nothing. The system silently fires an async pg_trgm request. Within 40–80ms, fuzzy results merge into the dropdown — "meditation" appears. No "did you mean?" prompt. Quiet correction.

**Scene 6: Selection and handoff.** The seeker selects "meditation" (click or Enter). Intent classification (FTR-005 E1, a separate system) determines routing — theme page, search results, or Practice Bridge. The URL reflects the seeker's original selection: `/search?q=meditation`. For bridge-expanded queries, the URL preserves the original term, not the expansion — the bridge expansion is a search-time enhancement, not a URL-visible rewrite. The suggestion system's job is done.

**Scene 7: Mobile.** On viewports < 768px, the dropdown shows a maximum of 5 suggestions (vs. 7 on desktop) to avoid the virtual keyboard competing with results. Touch targets are 44×44px minimum (FTR-003). Zero-state chips use horizontal scroll rather than wrapping.

#### Suggestion Types

Three distinct suggestion types, each with different sources and behavior:

```
Seeker types: "med"
 │
 ▼
TERM COMPLETION (static JSON at CDN edge — < 10ms)
 Client-side prefix match against suggestion file:
 ┌─────────────────────────────────────────────────┐
 │ 🔤 meditation (theme)                           │
 │ 📖 Meditations on God (chapter)                 │
 │ 📖 Meditation Promises Richest Results (chapter) │
 │ 🔤 medical intuition (corpus)                   │
 └─────────────────────────────────────────────────┘

Seeker types: "How do I"
 │
 ▼
QUERY SUGGESTION (curated, editorially maintained)
 Match against curated question templates:
 ┌─────────────────────────────────────────────────┐
 │ ❓ How do I overcome fear? (curated)             │
 │ ❓ How do I meditate? (curated)                  │
 │ ❓ How do I find peace? (curated)                │
 └─────────────────────────────────────────────────┘

Seeker types: "mindful"
 │
 ▼
BRIDGE-POWERED SUGGESTION (spiritual-terms.json)
 Terminology bridge detects a mapping:
 ┌─────────────────────────────────────────────────┐
 │ 🔤 mindfulness (corpus)                         │
 │ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈  │
 │ Yogananda's terms: concentration,               │
 │ one-pointed attention, interiorization           │
 └─────────────────────────────────────────────────┘
```

**1. Term completion.** Client-side prefix matching against pre-computed, CDN-served suggestion files partitioned by two-character prefix. Sources: distinctive terms extracted from corpus chunks during ingestion, theme names (`teaching_topics.name`), book titles, chapter titles, and `spiritual-terms.json` canonical entries. Implementation: static JSON files at Vercel CDN edge (Tier A, FTR-029) with pg_trgm async fuzzy fallback (Tier B). Latency target: < 10ms for prefix match (CDN hit + client filter), < 80ms for fuzzy fallback.

**2. Query suggestion.** Curated complete question forms seeded from the search quality evaluation golden set (~58 English queries, M1a-8 / FTR-037) and editorially expanded as the corpus grows. These are not derived from user query history — they are maintained in `/lib/data/curated-queries.json`, reviewed by SRF-aware editors (FTR-135), and versioned in git. Examples: "How do I overcome fear?", "What is the purpose of life?", "How do I meditate?" Editorial governance: Claude validates autonomously against all user-facing content standards.

**3. Bridge-powered suggestion.** When the prefix matches a key in `spiritual-terms.json`, the response includes a `bridge_hint` showing Yogananda's vocabulary for that concept. This is the differentiator — no other search product surfaces the gap between user vocabulary and corpus vocabulary as a real-time suggestion. The seeker learns that "mindfulness" maps to "concentration" and "one-pointed attention" *before* submitting the query, setting expectations for what the results will contain. Bridge hints continue into search results: when a bridge-expanded query produces results, the results page shows "Showing results for 'concentration' and 'one-pointed attention' (Yogananda's terms for mindfulness)."

#### Architecture: Three-Tier Progressive Infrastructure (FTR-029)

The suggestion dictionary is small (~1,500 entries at Arc 1, ~6,300 at full corpus). The infrastructure choice is the *simplest thing that achieves invisible latency*.

```
Keystroke → adaptive debounce →

If prefix.length < 2:
  Show zero-state (cached static JSON, _zero.json, < 10ms)

If prefix.length >= 2:
  Fetch /suggestions/{lang}/{prefix[0:2]}.json from CDN (< 10ms, cached)
  Client-side filter + rank against the prefix
  Display immediately
  ├→ Bridge match? Show terminology hint from _bridge.json
  ├→ ≥ 3 results: done
  └→ < 3 results: async pg_trgm fuzzy fallback (40-80ms), merge when ready

Select suggestion → intent classification (FTR-005 E1) → route
```

**Tier A: Static JSON at CDN edge (Milestone 1a+ English, Milestone 1b+ bilingual).** Pre-computed suggestion files — English from Milestone 1a, Spanish added in Milestone 1b:

```
/public/suggestions/en/_zero.json    — English zero-state (theme chips, curated questions)
/public/suggestions/en/me.json       — all English entries starting with "me"
/public/suggestions/en/_bridge.json  — terminology bridge mappings
/public/suggestions/hi/_zero.json    — Hindi zero-state (Devanāgarī theme chips) [Milestone 1b]
/public/suggestions/hi/स.json        — Devanāgarī native-script prefix (Unicode first-character) [Milestone 1b]
/public/suggestions/hi/sa.json       — Hindi entries for Romanized "sa" prefix (latin_form match) [Milestone 1b]
/public/suggestions/es/_zero.json    — Spanish zero-state [Milestone 1b]
/public/suggestions/es/me.json       — all Spanish entries starting with "me" [Milestone 1b]
```

< 10ms globally. $0 cost. No cold start. Rebuilds on deploy. Each prefix file is 2–8KB. Entire English set is ~150KB. Spanish set is smaller (single-book vocabulary). **Devanāgarī native-script prefix files** (Unicode first-character partitioning) added in Milestone 5b when Hindi activates.

**Tier B: pg_trgm fuzzy fallback (Milestone 1c+, always-on).** Async endpoint for misspellings and transliterated input. Queries both `suggestion` and `latin_form` columns — a Hindi seeker typing Romanized "samadhi" matches against `latin_form`. Latency: 40–80ms. Edge-cached: `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`.

**Tier C: Vercel KV (Milestone 2b+, if needed).** Upstash Redis via Vercel integration. Sub-10ms sorted-set prefix lookup. Activated when p95 > 30ms sustained, or dictionary > 50K entries, or learned queries need real-time freshness. ~$20/mo at 1M requests. Global replication, zero VPC, zero Terraform.

See FTR-029 for full tier specifications, migration triggers, and ElastiCache rejection rationale.

#### API Specification

**Fuzzy fallback endpoint** (Tier B — server-side, invoked async when client-side prefix returns < 3 results):

```
GET /api/v1/search/suggest?q=meditatoin&language=en&limit=7

Response:
{
 "suggestions": [
 { "text": "meditation", "type": "term", "category": "theme" },
 { "text": "Meditations on God", "type": "term", "category": "chapter" }
 ],
 "bridge_hint": null
}
```

**Static JSON file format** (Tier A — client-side, served from CDN):

```json
// /public/suggestions/en/me.json
{
 "suggestions": [
  { "text": "meditation", "type": "term", "category": "theme", "weight": 0.95 },
  { "text": "Meditations on God", "type": "term", "category": "chapter", "weight": 0.82 },
  { "text": "How do I meditate?", "type": "query", "category": "curated", "weight": 0.90 },
  { "text": "medical intuition", "type": "term", "category": "corpus", "weight": 0.40 }
 ]
}
```

```json
// /public/suggestions/en/_bridge.json
{
 "bridges": {
  "mindful": {
   "seeker_term": "mindfulness",
   "yogananda_terms": ["concentration", "one-pointed attention", "interiorization"],
   "source_books": ["autobiography-of-a-yogi", "mans-eternal-quest"]
  }
 }
}
```

```json
// /public/suggestions/en/_zero.json
{
 "chips": ["Peace", "Courage", "Grief & Loss", "Joy", "Meditation"],
 "questions": [
  "How do I overcome fear?",
  "What is the purpose of life?"
 ]
}
```

No Claude API call in the suggestion path — pure static files and database lookup. Zero cost per suggestion request (Tier A), minimal cost per fuzzy fallback (Tier B).

#### Adaptive Debounce

Rather than a fixed interval, the debounce adapts to context:

- **First keystroke after focus:** Fire immediately (0ms). The zero-state → first-results transition is the most important perceived-speed moment.
- **Subsequent keystrokes:** Fire after `SUGGESTION_DEBOUNCE_MS` (default 100ms, FTR-012) of inactivity. Reduces request volume ~60%.
- **On slow connections** (`navigator.connection.effectiveType === '2g'`): Extend debounce to `SUGGESTION_DEBOUNCE_SLOW_MS` (default 200ms, FTR-012) to avoid wasting brief connectivity windows on intermediate prefixes.

#### Zero-State Experience

When the search bar receives focus but the seeker has typed nothing, display curated entry points rather than an empty dropdown:

- Theme names as suggestion chips ("Peace", "Courage", "Grief & Loss")
- One or two curated question prompts ("How do I overcome fear?", "What is the purpose of life?")
- The search placeholder remains "What are you seeking?" (M1a-6)

Zero-state content is editorially governed — it shapes which teachings seekers encounter first. Claude validates autonomously (FTR-135). Editorial governance of curated suggestions uses the same review process as theme tagging (resolve before Milestone 1c — see CONTEXT.md).

The zero-state and the typing-state are served from separate static files (`_zero.json` vs. prefix files), enabling independent caching and editorial update cycles.

#### Suggestion Index Construction

The suggestion index is built during book ingestion (extending the FTR-028 per-book lifecycle):

```
Book ingestion pipeline (new step after vocabulary extraction):
 5. SUGGESTION INDEX EXTRACTION
 From the book's chunks, extract:
 → Distinctive terms (nouns, proper nouns, spiritual vocabulary)
 → Chapter titles
 → Book-specific phrases
 Filter: remove stopwords, common English words, terms with < 2 occurrences
 Output: per-book vocabulary contribution to the suggestion index

 Merge into suggestion_dictionary table.
 Index grows with each book — never shrinks.

 6. STATIC JSON EXPORT
 Export suggestion_dictionary → partitioned JSON files per language.
 Two-character prefix partitioning (me.json, yo.json, ...).
 Separate _zero.json (editorial) and _bridge.json (spiritual-terms.json).
 Output: /public/suggestions/{language}/*.json
 Triggered on each ingestion and on editorial suggestion updates.
```

#### URL Mapping on Selection

When a seeker selects a suggestion, the URL reflects their *original* selection:

- Term suggestion "meditation" → `/search?q=meditation`
- Curated question "How do I meditate?" → `/search?q=How+do+I+meditate%3F`
- Bridge-activated "mindfulness" → `/search?q=mindfulness` (bridge expansion is search-time, not URL-visible)

URLs are shareable and bookmarkable. Intent classification still runs server-side on the selected text regardless of how the seeker arrived.

#### Multilingual Suggestions

**Bilingual from Arc 1 (en/es).** Suggestion indices are generated for all languages with ingested content. Arc 1 ingests the Autobiography in English (Milestone 1a), then Spanish (Milestone 1b, FTR-011 Tier 1) — both languages get full suggestion infrastructure by end of Milestone 1b. Per-language suggestion indices for Hindi and the remaining 7 languages activate in Milestone 5b.

Each language gets:
- Its own extracted corpus vocabulary (from language-specific chunks)
- Its own static JSON prefix files (`/public/suggestions/{lang}/*.json`)
- Localized theme names (from `topic_translations`)
- Localized curated queries (from `messages/{locale}.json`)
- Language-specific pg_trgm fallback

**Devanāgarī native-script prefix files.** Latin two-character prefix partitioning (`me.json`, `yo.json`) doesn't serve a Hindi seeker typing Devanāgarī. Hindi gets **Unicode first-character prefix files**: `स.json`, `य.json`, `म.json`, etc. The partitioning is identical to Latin — just first-character instead of two-character (Devanāgarī consonant clusters make two-character partitioning impractical). Single-book Hindi vocabulary is small enough that first-character files stay within the 2–8KB target.

**Transliteration support via `latin_form`.** Hindi/Bengali seekers often type Romanized input (e.g., "samadhi" not "समाधि"). The `latin_form` column in `suggestion_dictionary` carries the transliterated form — populated during ingestion, not deferred. The pg_trgm fuzzy fallback queries both `suggestion` and `latin_form` columns. For static JSON (Tier A), `latin_form` entries are included as additional sort keys in Latin prefix files so Romanized prefixes match. A Hindi seeker typing "sam" hits the Latin `sa.json` file and sees "समाधि — अतिचेतन अवस्था" (Devanāgarī with inline definition).

**Remaining 7 languages (Milestone 5b).** Each new language follows the same pattern — suggestion extraction during ingestion, static JSON generation, transliteration where applicable.

**CJK and Thai (Milestone 5b).** CJK languages have no word boundaries, making prefix matching fundamentally different. Thai script also lacks word boundaries and requires ICU segmentation. These require language-specific tokenization strategies — an open design question for Milestone 5b.

**Sparse-language graceful handling:** If a language has few books, its suggestion index will be thin. When suggestions are sparse, the response should be honest (fewer suggestions, not padded with irrelevant terms) rather than falling back to English suggestions unprompted.

#### Accessibility

The suggestion dropdown implements the ARIA combobox pattern (WAI-ARIA 1.2):
- `role="combobox"` on the search input
- `role="listbox"` on the suggestion dropdown
- `role="option"` on each suggestion
- `aria-activedescendant` tracks keyboard-selected suggestion
- Arrow keys navigate suggestions, `Enter` selects, `Escape` dismisses
- Screen reader announces suggestion count on open ("7 suggestions available")
- Screen reader announces each suggestion as arrow keys navigate
- Bridge hints announced as supplementary text ("Yogananda's terms: concentration, one-pointed attention, interiorization")
- High contrast mode: suggestion categories distinguished by prefix text, not color alone
- Touch targets: 44×44px minimum (FTR-003)
- Mobile: maximum 5 suggestions visible to accommodate virtual keyboard

#### Milestone Progression

| Milestone | Suggestion Capability | Infrastructure |
|-----------|----------------------|----------------|
| 1a | English-only static JSON prefix files from single-book vocabulary + chapter titles + zero-state chips. | Tier A: CDN-served static JSON (English) |
| 1b | + Spanish static JSON prefix files. `latin_form` populated during ingestion. Hindi Devanāgarī prefix files added in Milestone 5b. | Tier A: CDN-served static JSON (bilingual) |
| 1c | + pg_trgm fuzzy fallback endpoint + golden suggestion set (300 entries, 6 tiers) | Tier A + B |
| 2b | + Vercel KV if migration trigger thresholds reached | Tier A + B + C (conditional) |
| 3a | + multi-book vocabulary + bridge-powered suggestions + curated queries | Expanded corpus, same tiers |
| 5b | + per-language suggestion indices for remaining 7 languages; CJK/Thai tokenization strategies | Per-language static JSON + pg_trgm (hi/es already live from Arc 1) |
| 7a | + optional personal "recent searches" (client-side `localStorage` only, no server storage) | On-device only |

#### Interaction with Intent Classification

Suggestions and intent classification (FTR-005 E1) are complementary, not redundant:
- **Suggestions** operate *before* query submission (as-you-type, < 10ms, no LLM)
- **Intent classification** operates *after* query submission (routes the final query, uses Claude Haiku)

When a seeker selects a suggestion, intent classification still runs on the selected text. The suggestion narrows the query; intent classification routes it. A seeker who selects "meditation" (term suggestion) gets routed to the meditation theme page by intent classification. A seeker who selects "How do I meditate?" (curated query) gets routed to search with appropriate expansion.

#### Weight Coefficients

Suggestion ranking uses three signals with configurable weights (FTR-012 named constants in `/lib/config.ts`):

```
SUGGESTION_WEIGHT_CORPUS = 0.3    — corpus frequency (how often the term appears)
SUGGESTION_WEIGHT_QUERY = 0.5     — query frequency (aggregated, DELTA-compliant)
SUGGESTION_WEIGHT_EDITORIAL = 0.2 — editorial boost (0.0–1.0, set by editors)
```

At launch, `query_frequency` is zero — the effective ranking is `corpus * 0.6 + editorial * 0.4` (renormalized). As query log data accumulates (Tier 5, FTR-032), the full formula activates. Coefficients are application-level constants, not database-generated columns, so they can be tuned without migration.

#### Author Tier and Suggestions

Suggestions are **tier-agnostic by design** — all author tiers (guru, president, monastic) contribute equally to the suggestion vocabulary. The suggestion system operates *before* query submission and does not filter by author tier. When `author_tier` influences results, it acts as a **sort parameter** on the search API (FTR-015), not a filter on suggestions. A seeker typing "meditation" sees the same suggestions regardless of which tiers they'll search. This matches the portal's design: suggestions narrow the query; the search API's `author_tier` parameter controls which tiers appear in results.
