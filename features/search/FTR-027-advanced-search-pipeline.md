---
ftr: 27
title: "Advanced Search Pipeline — Pure Hybrid Primary, AI-Enhanced Optional"
summary: "Pure hybrid search as primary mode with optional HyDE, cross-encoder reranking, and graph-augmented retrieval"
state: implemented
domain: search
governed-by: [PRI-05, PRI-03]
depends-on: [FTR-020, FTR-034]
---

# FTR-027: Advanced Search Pipeline

## Rationale

### Context

The search pipeline uses a two-path hybrid search: pgvector dense vector + full-text keyword, merged via Reciprocal Rank Fusion. This pure hybrid approach -- with no external AI services in the search path -- is the **primary search mode** for all arcs.

The design invests in index-time enrichment (FTR-026 unified enrichment, FTR-028 Vocabulary Bridge, FTR-033 entity resolution) so that the vocabulary gap between seeker language and Yogananda's language is bridged *in the index*, not at query time.

Three well-established retrieval enhancements remain available as **optional upgrades**, activated only if STG-001's search quality evaluation demonstrates they are needed:

1. **HyDE (Hypothetical Document Embedding).** Instead of embedding the user's query, an LLM generates a hypothetical passage that would answer the query, and *that passage* is embedded.

2. **Cross-encoder reranking.** A purpose-built cross-encoder sees query + passage together and produces a true relevance score.

3. **Graph-augmented retrieval.** With the knowledge graph (FTR-034) active in STG-007+, a third retrieval path becomes available: entity-aware graph traversal combined with vector similarity.

### Decision

**Pure hybrid search is the primary mode.** No external AI services in the search hot path. Search latency is dominated by database query time (~50-200ms) plus network RTT.

**Two standard enhancements (STG-006), one conditional (STG-007+):**

**STG-006 (standard): Cross-Encoder Reranking**
- After Convex Combination fusion (FTR-020) produces top-50 candidates, a cross-encoder sees query + passage pairs
- **Voyage Rerank** — vendor-consolidated with the Voyage embedding pipeline (FTR-024). Use latest available model; current (March 2026): `rerank-2.5` at $0.05/MTok. Model ID tracked in `/lib/config.ts` per FTR-012. Estimated cost: ~$50-200/month at moderate query volume.
- Selects and ranks top 5 from 50 candidates
- Register-aware reranking: for queries classified as distressed/devotional, inject register context into the reranker input (e.g., `"[query register: devotional] Query: {query} Passage: {passage}"`)
- **Research basis:** Both Gemini and Claude deep research reports (March 2026) independently recommend cross-encoder reranking as standard, not optional. Cross-encoders deliver ~95% of LLM reranking accuracy at 10-50x lower cost.

**STG-006 (standard): HyDE**
- For complex or experiential queries, an LLM generates a hypothetical passage (~100-200 tokens)
- The hypothesis is embedded and used as an additional vector search input
- Bypass for simple keyword queries (referential register)

**STG-006 (standard): Enrichment-Augmented Embeddings**
- Re-embed all chunks with enrichment metadata prefix (FTR-024 § Enrichment-Augmented Re-embedding)
- Makes rasa, depth, register, and domain searchable via cosine similarity — not just post-retrieval filters
- One-time cost: ~$54 ($4 embedding + ~$50 LLM enrichment generation)

**STG-007+: Three-Path Parallel Retrieval**
- **PATH A:** Dense vector (pgvector HNSW) — semantic similarity (enrichment-augmented)
- **PATH B:** BM25 keyword (pg_search) — exact term and phrase matching
- **PATH C:** Graph-augmented retrieval (Postgres, FTR-034)

```
Primary mode (STG-001-2b):  PATH A + PATH B -> CC(α=0.5) -> top 5
Enhanced mode (STG-006):    PATH A + PATH B + HyDE -> CC(register-adaptive α) -> Voyage Rerank -> top 5
Full mode (STG-007+):       PATH A + PATH B + PATH C + HyDE -> CC(three-path, register-adaptive) -> Voyage Rerank -> top 5
```

**Activation history:** STG-001 evaluation (92% Recall@3) confirmed pure hybrid search exceeds the 80% gate. Enhanced and full modes add precision and multi-dimensional relevance, not baseline adequacy.

### Rationale

- **Pure hybrid is fast and globally equitable.** Without AI services in the hot path, search completes in ~200-400ms from anywhere on Earth. This remains true — reranking adds ~50-100ms but runs server-side after retrieval, within the latency budget.
- **Index-time enrichment bridges the vocabulary gap.** The Vocabulary Bridge, unified enrichment, and entity resolution map modern vocabulary to Yogananda's language at ingestion time. Enrichment-augmented embeddings (STG-006) push this further: the enrichment metadata itself becomes searchable via vector similarity.
- **Cross-encoder reranking is standard, not optional.** Both independent research reports (Gemini and Claude, March 2026) confirm: at 50K scale, the reranker is what makes results *feel curated*. The retriever sets the recall ceiling; the reranker determines ranking quality. Voyage Rerank consolidates with the embedding vendor.
- **No generative AI in the hot path.** HyDE generates intermediate artifacts only — never user-facing content. Reranking is scoring, not generation. PRI-01 is preserved.

### Consequences

- Search latency budget: primary mode ~200ms; enhanced mode ~350ms; full mode ~400ms
- Voyage API key required for enhanced mode (reranking + embedding — same key)
- The golden retrieval set (FTR-037) serves as the evaluation instrument for all pipeline changes
- Cost per query: primary mode ~$0; enhanced mode ~$0.002 (rerank $0.001 + HyDE $0.001)

## Notes

- **March 2026 revision:** Cross-encoder reranking elevated from "optional, if warranted by evaluation" to standard (STG-006). Cohere Rerank 3.5 replaced with Voyage Rerank for vendor consolidation. Enrichment-augmented embeddings added as standard STG-006 enhancement. Activation gate language replaced with evaluation history. Based on convergent findings from Gemini and Claude deep research reports. See `docs/reference/deep-research-gemini-modern-search.md` and `docs/reference/deep-research-claude-modern-search.md`.
