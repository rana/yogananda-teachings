---
ftr: 24
title: "Embedding Model — Voyage voyage-4-large, Versioning, and Multilingual Quality"
summary: "Voyage voyage-4-large MoE embeddings at 1024 dimensions with asymmetric encoding and model versioning"
state: implemented
domain: search
governed-by: [PRI-05, PRI-06]
---

# FTR-024: Embedding Model

## Rationale

### FTR-024: Voyage voyage-4-large as Primary Embedding Model

#### Context

FTR-024 established embedding model versioning infrastructure. FTR-024 selected OpenAI `text-embedding-3-small` (1536 dimensions) as the initial embedding model, with planned benchmarking at Milestone 5b.

The RAG Architecture Proposal makes a compelling case for starting with a higher-quality model:
1. **Literary and spiritual text quality.** Yogananda's prose is rich in literary allusion, Sanskrit vocabulary, figurative language.
2. **Multilingual-first design.** Voyage embeds 26 languages in a unified space.
3. **Asymmetric encoding.** Voyage supports `input_type = 'document'` at index time and `input_type = 'query'` at search time.
4. **Migration cost is real.** Starting with the stronger model avoids a foreseeable migration.

#### Decision

Use Voyage `voyage-4-large` (MoE architecture, shared embedding space, Matryoshka dimension reduction, 32K token context) as the primary embedding model from the start.

**Key changes from previous design:**
- Vector dimension: 1536 -> 1024
- Asymmetric encoding: `input_type = 'document'` at ingestion, `input_type = 'query'` at search time
- Hosting: Voyage API by default

#### Consequences

- All `VECTOR(1536)` definitions change to `VECTOR(1024)`
- HNSW index parameters updated for 1024 dimensions
- Milestone 5b benchmarking scope: Voyage as baseline rather than OpenAI

### FTR-024: Embedding Model Versioning and Migration

#### Context

Over a 10-year lifespan, the embedding model will almost certainly be replaced 2-3 times. Without tracking which model generated each vector, a model swap becomes an all-or-nothing migration with potential downtime.

#### Decision

Add an `embedding_model` column to `book_chunks` that records which model generated the embedding vector. This enables incremental migration, mixed-model search, rollback, and audit.

```sql
ALTER TABLE book_chunks ADD COLUMN embedding_model TEXT NOT NULL DEFAULT 'voyage-4-large';
ALTER TABLE book_chunks ADD COLUMN embedding_dimension INTEGER NOT NULL DEFAULT 1024;
ALTER TABLE book_chunks ADD COLUMN embedded_at TIMESTAMPTZ NOT NULL DEFAULT now;
```

**Migration Workflow:**
1. Choose new model
2. Create Neon branch for testing
3. Re-embed a sample (100 chunks)
4. Run search quality test suite
5. Compare precision/recall vs. current model
6. If improved: re-embed all chunks in batches
7. If not improved: discard branch

### FTR-024: Multilingual Embedding Quality Strategy

#### Context

Three dimensions of embedding quality matter:
1. **Multilingual retrieval quality** -- 10 languages served.
2. **Domain specificity** -- literary/spiritual text.
3. **Cross-language alignment for sacred vocabulary** -- terms like "samadhi" across scripts.

#### Decision

1. Voyage voyage-4-large is the primary embedding model (FTR-024).
2. Milestone 5b benchmarks Voyage against multilingual alternatives (Cohere embed-v3, BGE-M3, multilingual-e5-large-instruct, Jina-embeddings-v3).
3. **Enrichment-augmented re-embedding (STG-006)** is the intermediate step between baseline and domain-adapted fine-tuning. See § Enrichment-Augmented Re-embedding below.
4. Domain-adapted embeddings remain a later-stage research effort. Fine-tuning on Yogananda's corpus could produce world-class retrieval quality.
5. The architecture already supports model evolution via FTR-024.

**Multilingual Embedding Requirement:** The embedding model must be multilingual. This is an explicit requirement. Voyage voyage-4-large uses MoE architecture with a shared embedding space across languages. Any future model migration must preserve this multilingual property.

#### Rationale

- **Quality is the differentiator.** At < $10 for the full multilingual corpus, select for quality, not cost.
- **Enrichment-augmented re-embedding is the highest-ROI intermediate step.** The portal already has 14 metadata fields per chunk (FTR-026). Prepending this metadata to passage text before embedding makes rasa, depth, register, and domain directly searchable via cosine similarity — no new infrastructure, no model change, just re-embedding with richer input.
- **Domain adaptation is the highest-ceiling option.** A model fine-tuned on Yogananda's corpus would compete on the only domain that matters.
- **The architecture is already ready.** FTR-024's model versioning provides complete infrastructure for model evolution.

#### Consequences

- Primary model is Voyage voyage-4-large (1024 dimensions)
- STG-006: enrichment-augmented re-embedding (same model, richer input)
- Milestone 5b benchmarks as baseline
- Domain-adapted embeddings remain a documented research track

### FTR-024: Enrichment-Augmented Re-embedding

#### Context

Anthropic's Contextual Retrieval paper (September 2024) demonstrated 35-67% reduction in retrieval failure rates when prepending document context to chunks before embedding. A January 2025 study on SEC 10-K filings (arXiv:2601.11863) confirmed that structured metadata prefix embedding consistently outperforms plain-text baselines for structurally repetitive documents — directly analogous to sacred texts with shared vocabulary.

The portal's unified enrichment pipeline (FTR-026) already produces 14 metadata fields per chunk. These fields currently participate only in post-retrieval filtering and ranking. Embedding them alongside the passage text makes them participate in the retrieval itself.

#### Decision

At STG-006, re-embed all chunks with an enrichment metadata prefix in natural language format:

```
"This passage is from {book_title}, Chapter {chapter_number}: {chapter_title}.
Domain: {domain}. Voice: {voice_register}. Rasa: {rasa} ({rasa_english}).
Experiential depth: {experiential_depth}/7. Emotional quality: {emotional_quality}.
Topics: {topics}. {passage_text}"
```

**Two embedding facets per chunk (STG-006 stretch / 3b):**
- **Topical facet:** Emphasizes tradition, source, topic, entities — optimized for topical/referential queries
- **Experiential facet:** Emphasizes rasa, depth, register, emotional quality — optimized for emotional/devotional queries

Query routing: the intent classifier (FTR-020 step 3) and Vocabulary Bridge register detection (FTR-028) determine which facet to search. Both facets searched for unclassified queries with CC fusion.

#### Cost

| Operation | Cost | Notes |
|-----------|------|-------|
| LLM prefix generation (50K chunks) | ~$50 | Claude Haiku with prompt caching |
| Re-embedding (50K chunks, Voyage) | ~$4 | $0.12/MTok, ~33M tokens |
| **Total one-time** | **~$54** | Same model, same dimensions, same indexes |
| Multi-faceted (2x embeddings) | +$4 | Additional Voyage embedding pass |

#### Validation

Use the existing golden set (FTR-037) plus multi-dimensional evaluation extensions to compare:
1. Baseline: current plain-text embeddings
2. Treatment A: enrichment-augmented single embedding
3. Treatment B: enrichment-augmented dual-facet embeddings

Run on Neon branch per the migration procedure. Promote only if treatment matches or exceeds baseline on topical queries AND improves emotional/metaphorical queries.

#### Research Basis

Convergent finding from both Gemini and Claude deep research reports (March 2026). Both identify enrichment-augmented embedding as the single highest-ROI upgrade for the portal's search architecture. See `docs/reference/deep-research-gemini-modern-search.md` and `docs/reference/deep-research-claude-modern-search.md`.

## Notes

- **Origin:** FTR-024 + FTR-024 + FTR-024 (merged: three related ADRs covering the same embedding infrastructure)
- **March 2026 revision:** Added enrichment-augmented re-embedding as intermediate step between baseline Voyage and domain-adapted fine-tuning. Added multi-faceted embedding specification. Based on convergent deep research findings.
