---
ftr: 20
title: Hybrid Search (Vector + Full-Text)
summary: "Vector similarity plus BM25 full-text merged via Reciprocal Rank Fusion in a single Postgres query"
state: implemented
domain: search
governed-by: [PRI-01, PRI-03]
depends-on: [FTR-025]
---

# FTR-020: Hybrid Search

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

The search pipeline has evolved through three milestone tiers. Milestones 1a–2a use a two-path retrieval core (vector + BM25). Milestone 2b+ adds HyDE and Cohere Rerank. Milestone 3b+ adds a third retrieval path via Postgres-native graph traversal (FTR-034).

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
 - Embed the original query using Voyage voyage-4-large (FTR-024)
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

 ADAPTIVE HYBRID FUSION:
 - Merge results from all active paths (A+B in Milestones 1a–3a; A+B+C in Milestone 3b+)
 - Convex Combination (CC) replaces Reciprocal Rank Fusion (RRF).
   CC uses normalized scores, not ranks — a passage scored 0.99 by dense
   retrieval is meaningfully distinguished from one scored 0.51.
   (Bruch et al. 2022, arXiv:2210.11934: CC achieves NDCG@1000 of 0.454
   vs. 0.425 for RRF on MS MARCO when any labeled data is available.)
 - Two-path fusion: final_score = α × dense_score + (1 - α) × bm25_score
   *[Parameter — default: α=0.5, tune with golden set queries per FTR-037]*
 - Three-path fusion (M3b+): final_score = α × dense + β × bm25 + γ × graph
   where α + β + γ = 1, tuned per-register (see table below)
 - Register-driven adaptive weights: the Vocabulary Bridge (FTR-028)
   classifies query register at query time. Fusion weights shift accordingly:

   | Register     | Dense | BM25 | Graph | Rationale |
   |--------------|-------|------|-------|-----------|
   | Philosophical| 0.35  | 0.35 | 0.30  | Balanced — needs both exact terms and concepts |
   | Distressed   | 0.70  | 0.15 | 0.15  | Emotional queries need semantic understanding |
   | Devotional   | 0.60  | 0.15 | 0.25  | Emotional resonance + graph cross-tradition |
   | Referential  | 0.15  | 0.65 | 0.20  | Exact citations need BM25 |
   | Default      | 0.50  | 0.50 | 0.00  | No register detected, balanced two-path |

   *[All weights are Parameters per FTR-012 — tune with golden set]*
 - Deduplicate, producing top 50 candidates (expanded from 20 for reranker)
 │
 ▼
7. RERANKING (Voyage Rerank, standard from M3a, FTR-027)
 Cross-encoder reranker sees query + passage together.
 Multilingual native. Replaces Claude Haiku passage ranking for precision.
 Selects and ranks top 5 from 50 candidates.
 Vendor-consolidated with Voyage embedding pipeline (FTR-024).

 Milestones 1a–2b fallback: Claude Haiku passage ranking (FTR-105).
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

| Milestone | Retrieval Paths | Fusion | Reranker | Enhancements |
|-----------|----------------|--------|----------|-------------|
| 1a–2b | Vector (pgvector) + BM25 (pg_search) | Convex Combination (α=0.5) | Claude Haiku passage ranking | Basic query expansion, terminology bridge |
| 3a | Vector + BM25 | CC with register-adaptive α | Voyage Rerank | Enrichment-augmented embeddings (FTR-024), HyDE |
| 3b+ | Vector + BM25 + Graph (Postgres) | CC three-path register-adaptive | Voyage Rerank | Three-path fusion, entity-aware retrieval |

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

### Claude System Prompts (Draft — Refine During Implementation)

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
| **Full** | All services healthy | Query expansion + HyDE (M3a+) + multi-path retrieval + Voyage Rerank (M3a+) | — | Best results: conceptual queries understood, top 5 precisely ranked |
| **No rerank** | Voyage Rerank unavailable | Query expansion, HyDE, adaptive CC fusion | Cross-encoder reranking | Top 5 from CC fusion scores; slightly less precise ordering |
| **No HyDE** | HyDE generation fails | Query expansion, adaptive CC fusion, Voyage Rerank | Hypothetical document embedding | Marginal loss on literary/metaphorical queries |
| **No expansion** | Claude query expansion fails | Raw query → hybrid search (vector + BM25) | Conceptual query broadening | Keyword-dependent; "How do I find peace?" works less well than "peace" |
| **Database only** | All AI services fail | Pure hybrid search (pgvector + pg_search BM25) | All AI enhancement | Still returns relevant verbatim passages via vector similarity + BM25 |

**Implementation:** `/lib/services/search.ts` wraps each external service call in a try-catch with a 5-second timeout. Failure at any level falls through to the next. Sentry captures each degradation event (`search.degradation` with `level` and `service` tags) for monitoring. The search API response includes a `searchMode` field (`"full"`, `"no_rerank"`, `"no_hyde"`, `"no_expansion"`, `"database_only"`) for observability — not exposed in the seeker-facing UI.

### FTR-024: Embedding Model Migration Procedure

When the embedding model changes (e.g., from `voyage-4-large` to a successor, or to a per-language model for Milestone 5b), re-embedding the full corpus is required. The `embedding_model`, `embedding_dimension`, and `embedded_at` columns on `book_chunks` enable safe, auditable migration.

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

 Estimated cost: Voyage voyage-4-large ~$0.06 per 1M tokens
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

**Cost estimate for full corpus re-embedding:** < $15 for Voyage voyage-4-large at 50K chunks (~25M tokens). The operational cost is primarily developer time for validation, not API spend. At significant volume, evaluate AWS Marketplace SageMaker model packages for Voyage to reduce per-call costs.

**Multilingual embedding quality (FTR-024, FTR-024).** Voyage voyage-4-large is multilingual-first by design: MoE architecture, shared embedding space, Matryoshka dimension reduction, 32K token context window. For European languages (es, de, fr, it, pt) and major Asian languages (ja, zh, ko, hi), this provides strong baseline retrieval. For CJK-heavy corpora, benchmark Voyage `voyage-multilingual-2` as an alternative — it may excel on languages with fundamentally different morphology. Milestone 5b includes formal benchmarking with actual translated passages across Voyage voyage-4-large, Cohere embed-v3, and BGE-M3.

**Domain-adapted embeddings (FTR-024, later-stage research).** The highest-ceiling path to world-class retrieval: fine-tune a multilingual base model on Yogananda's published corpus across languages. A domain-adapted model would understand spiritual vocabulary, metaphorical patterns, and cross-tradition concepts at a depth no general model matches. Prerequisites: multilingual corpus (Milestone 5b ingestion) and per-language evaluation suites (Milestone 5b). The same migration procedure above applies — the architecture imposes no constraints on model provenance.

### Search Suggestions (FTR-029)

The search architecture above handles what happens *after* a query is submitted. **FTR-029** specifies everything that happens *as the seeker types* — corpus-derived autosuggestion that reduces friction, teaches the library's vocabulary, and extends the librarian metaphor.

**Summary:** Six-tier suggestion hierarchy (scoped queries, entities, topics, Sanskrit terms, learned queries, curated content) harvested from enrichment data by a pre-computation pipeline. Three-tier progressive infrastructure (static JSON at CDN edge <10ms, pg_trgm fuzzy fallback 40-80ms, Vercel KV if needed). Bridge-powered suggestions surface the gap between seeker vocabulary and Yogananda's language before submission. DELTA-compliant by construction — no behavioral data in the pipeline.

See FTR-029 for the complete specification: experience walkthrough, six-tier hierarchy, pre-computation pipeline, suggestion dictionary schema, infrastructure tiers, API specification, client architecture, multi-word matching, display design, accessibility, multilingual strategy, and implementation state.

## Notes

- **Origin:** FTR-020
- **March 2026 revision (fusion strategy):** RRF replaced with Convex Combination based on convergent findings from two independent deep research reports (Gemini and Claude, March 2026). Both reports confirm CC consistently outperforms RRF when labeled data exists — the portal's 66 golden queries provide this data. Register-driven adaptive fusion weights leverage FTR-028's query-time register classification. Cohere Rerank replaced with Voyage Rerank for vendor consolidation with embedding pipeline (FTR-024). Candidate pool expanded from top-20 to top-50 for the cross-encoder reranker. See `docs/reference/gemini-deep-research-modern-search-report.md` and `docs/reference/claude-deep-research-modern-search-report.md`.
