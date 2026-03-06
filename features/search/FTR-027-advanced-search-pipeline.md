---
ftr: 27
title: "Advanced Search Pipeline -- Pure Hybrid Primary, AI-Enhanced Optional"
state: approved
domain: search
arc: 1a+
governed-by: [PRI-05, PRI-03]
---

# FTR-027: Advanced Search Pipeline

## Rationale

### Context

The search pipeline uses a two-path hybrid search: pgvector dense vector + full-text keyword, merged via Reciprocal Rank Fusion. This pure hybrid approach -- with no external AI services in the search path -- is the **primary search mode** for all arcs.

The design invests in index-time enrichment (FTR-026 unified enrichment, FTR-028 Vocabulary Bridge, FTR-033 entity resolution) so that the vocabulary gap between seeker language and Yogananda's language is bridged *in the index*, not at query time.

Three well-established retrieval enhancements remain available as **optional upgrades**, activated only if Milestone 1a's search quality evaluation demonstrates they are needed:

1. **HyDE (Hypothetical Document Embedding).** Instead of embedding the user's query, an LLM generates a hypothetical passage that would answer the query, and *that passage* is embedded.

2. **Cross-encoder reranking.** A purpose-built cross-encoder sees query + passage together and produces a true relevance score.

3. **Graph-augmented retrieval.** With the knowledge graph (FTR-034) active in Milestone 3b+, a third retrieval path becomes available: entity-aware graph traversal combined with vector similarity.

### Decision

**Pure hybrid search is the primary mode.** No external AI services in the search hot path. Search latency is dominated by database query time (~50-200ms) plus network RTT.

**Three optional enhancements, activated conditionally:**

**Milestone 2b (if warranted by 1a evaluation): HyDE**
- For complex or experiential queries, an LLM generates a hypothetical passage (~100-200 tokens)
- The hypothesis is embedded and used as an additional vector search input
- Bypass for simple keyword queries

**Milestone 2b (if warranted by 1a evaluation): Cross-Encoder Reranking**
- After RRF fusion produces ~50 candidates, a cross-encoder sees query + passage pairs
- Options: Cohere Rerank 3.5, BGE-reranker-v2, or another cross-encoder

**Milestone 3b+: Three-Path Parallel Retrieval**
- **PATH A:** Dense vector (pgvector HNSW) -- semantic similarity
- **PATH B:** BM25 keyword (pg_search) -- exact term and phrase matching
- **PATH C:** Graph-augmented retrieval (Postgres, FTR-034)

```
Primary mode (all arcs):     PATH A + PATH B -> RRF -> top 5
Enhanced mode (M2b+, if warranted): PATH A + PATH B + HyDE -> RRF -> cross-encoder rerank
Full mode (M4+, if warranted):      PATH A + PATH B + PATH C + HyDE -> RRF -> cross-encoder rerank
```

**Activation gate:** The Milestone 1a search quality evaluation (>= 80% Recall@3) determines whether the primary mode is sufficient.

### Rationale

- **Pure hybrid is fast and globally equitable.** Without AI services in the hot path, search completes in ~200-400ms from anywhere on Earth.
- **Index-time enrichment bridges the vocabulary gap.** The Vocabulary Bridge, unified enrichment, and entity resolution map modern vocabulary to Yogananda's language at ingestion time.
- **No external AI in the hot path simplifies operations.** Fewer failure modes, trivially cacheable results, zero per-query AI cost.

### Consequences

- Search latency budget: primary mode ~200ms; enhanced mode ~350ms; full mode ~400ms
- No Cohere API key required for primary mode
- The golden retrieval set (Milestone 1a) serves as the activation gate for AI enhancements
- Cost per query: primary mode ~$0; enhanced mode ~$0.0015

## Notes

- **Origin:** FTR-027
