# FTR-024: Embedding Model -- Voyage voyage-3-large, Versioning, and Multilingual Quality

**State:** Approved
**Domain:** search
**Arc:** 1a+
**Governed by:** PRI-05, PRI-06

## Rationale

### FTR-024: Voyage voyage-3-large as Primary Embedding Model

#### Context

FTR-024 established embedding model versioning infrastructure. FTR-024 selected OpenAI `text-embedding-3-small` (1536 dimensions) as the Arc 1 embedding model, with planned benchmarking at Milestone 5b.

The RAG Architecture Proposal makes a compelling case for starting with a higher-quality model:
1. **Literary and spiritual text quality.** Yogananda's prose is rich in literary allusion, Sanskrit vocabulary, figurative language.
2. **Multilingual-first design.** Voyage embeds 26 languages in a unified space.
3. **Asymmetric encoding.** Voyage supports `input_type = 'document'` at index time and `input_type = 'query'` at search time.
4. **Migration cost is real.** Starting with the stronger model avoids a foreseeable migration.

#### Decision

Use Voyage `voyage-3-large` (1024 dimensions, 26 languages, 32K token input) as the primary embedding model from Arc 1.

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
ALTER TABLE book_chunks ADD COLUMN embedding_model TEXT NOT NULL DEFAULT 'voyage-3-large';
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

1. Voyage voyage-3-large is the Arc 1 embedding model (FTR-024).
2. Milestone 5b benchmarks Voyage against multilingual alternatives (Cohere embed-v3, BGE-M3, multilingual-e5-large-instruct, Jina-embeddings-v3).
3. Domain-adapted embeddings remain a later-stage research effort. Fine-tuning on Yogananda's corpus could produce world-class retrieval quality.
4. The architecture already supports model evolution via FTR-024.

**Multilingual Embedding Requirement:** The embedding model must be multilingual. This is an explicit requirement. Voyage voyage-3-large embeds 26 languages in a unified vector space as a design goal. Any future model migration must preserve this multilingual property.

#### Rationale

- **Quality is the differentiator.** At < $10 for the full multilingual corpus, select for quality, not cost.
- **Domain adaptation is the highest-ceiling option.** A model fine-tuned on Yogananda's corpus would compete on the only domain that matters.
- **The architecture is already ready.** FTR-024's model versioning provides complete infrastructure for model evolution.

#### Consequences

- Arc 1 proceeds with Voyage voyage-3-large (1024 dimensions)
- Milestone 5b benchmarks as baseline
- Domain-adapted embeddings remain a documented research track

## Notes

- **Origin:** FTR-024 + FTR-024 + FTR-024 (merged: three related ADRs covering the same embedding infrastructure)
