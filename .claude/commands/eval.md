Search quality evaluation. A/B comparison protocol for search pipeline changes.

$ARGUMENTS

## Evaluation Framework (FTR-037)

### Golden Retrieval Set
Test queries with known-relevant passages. Each entry:
- **Query** — natural language search
- **Expected passages** — chunk IDs or content snippets that must appear
- **Relevance grade** — exact (verbatim match), highly_relevant (same topic, same teaching), relevant (related), tangential
- **Language** — en, es, or both

Golden set lives in test fixtures: `lib/services/__tests__/`

### Metrics
| Metric | Formula | Target |
|--------|---------|--------|
| **Recall@3** | relevant found in top 3 / total relevant | ≥ 92% (M1a baseline) |
| **Recall@5** | relevant found in top 5 / total relevant | ≥ 95% |
| **MRR** | mean of 1/rank of first relevant result | ≥ 0.7 |
| **Precision@5** | relevant in top 5 / 5 | ≥ 0.6 |
| **p50 latency** | median response time | < 300ms |
| **p95 latency** | 95th percentile | < 500ms |

### Test Infrastructure
- Search service: `lib/services/search.ts`
- HyDE service: `lib/services/hyde.ts` (feature-flagged)
- Rerank service: `lib/services/rerank.ts` (feature-flagged)
- Config: `lib/config.ts` (RRF_K, SEARCH_RESULTS_LIMIT, HYBRID_UPGRADE_THRESHOLD)
- Test files: `lib/services/__tests__/search.test.ts`, `hyde.test.ts`, `rerank.test.ts`

## Evaluation Targets

### M3a-11: HyDE Evaluation
**Question:** Does HyDE improve recall on literary/spiritual queries vs. standard vector search?
- **Baseline:** Standard query embedding (Voyage voyage-4-large)
- **Variant:** HyDE document-space embedding (Claude Haiku generates hypothetical passage → embed that)
- **Hypothesis:** HyDE helps abstract/contemplative queries ("finding peace in difficult times") but may hurt keyword-specific queries ("Chapter 12 cosmic consciousness")
- **Protocol:** Run both against golden set. Compare Recall@3, MRR. Measure latency overhead (HyDE adds ~200-400ms for LLM generation).
- **Decision:** Enable by default if Recall@3 improves ≥ 3% with p95 latency < 800ms total

### M3a-12: Cohere Rerank Evaluation
**Question:** Does cross-encoder reranking improve precision over RRF-only?
- **Baseline:** RRF fusion of FTS + vector results (K=60)
- **Variant:** RRF top-N → Cohere rerank-v3.5 → final top-10
- **Hypothesis:** Reranking improves precision for ambiguous queries but adds latency
- **Protocol:** Run both against golden set. Compare Precision@5, MRR. Measure latency overhead.
- **Decision:** Enable by default if Precision@5 improves ≥ 5% with p95 latency < 600ms total

## Workflow

Parse `$ARGUMENTS`:

### "hyde" — Evaluate HyDE
1. Read `lib/services/hyde.ts` and `lib/services/__tests__/hyde.test.ts`
2. Construct golden set queries (at least 12 — mix of keyword, conceptual, contemplative, multilingual)
3. Run each query through standard search and HyDE-enhanced search
4. Compute Recall@3, Recall@5, MRR, Precision@5 for both
5. Compute latency overhead
6. Present comparison table + recommendation

### "rerank" — Evaluate Cohere Rerank
1. Read `lib/services/rerank.ts` and `lib/services/__tests__/rerank.test.ts`
2. Construct golden set queries
3. Run each query through RRF-only and RRF+rerank
4. Compute metrics for both
5. Present comparison table + recommendation

### "baseline" — Current search performance
1. Run golden set queries through current search pipeline
2. Report all metrics
3. Identify weakest query categories (keyword, conceptual, multilingual)

### "[query text]" — Single query comparison
1. Run the query through all available pipelines (standard, HyDE, rerank, HyDE+rerank)
2. Show results side-by-side with ranking differences highlighted
3. Show latency for each pipeline

### "golden" — Manage golden set
1. Show current golden set entries
2. Suggest additions based on corpus growth (new books = new test queries needed)

### No argument — Show evaluation status
- Current search config (which features enabled/disabled)
- Last evaluation results (if recorded)
- Recommended next evaluation
