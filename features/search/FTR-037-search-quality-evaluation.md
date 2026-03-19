---
ftr: 37
title: Search Quality Evaluation Harness
summary: "Golden set evaluation with Recall@K, MRR, and NDCG metrics gating milestone acceptance in CI"
state: implemented
domain: search
governed-by: [PRI-01, PRI-03]
depends-on: [FTR-020]
---

# FTR-037: Search Quality Evaluation Harness

## Rationale

**Status: Implemented** — see `scripts/eval/`, `data/eval/`

**Governed by:** FTR-005 E5, STG-001-8, STG-002-2

The search quality evaluation harness is the acceptance gate for STG-001. It validates that hybrid search returns relevant passages for representative queries before the portal is deployed. This section specifies the golden set format, query design protocol, evaluation methodology, metrics, automation, and CI integration.

### Golden Set Data Format

Golden set files live in `/data/eval/` as JSON:

```
/data/eval/golden-set-en.json   — English (~58 queries)
/data/eval/golden-set-hi.json   — Hindi (~15 queries, STG-002)
/data/eval/golden-set-es.json   — Spanish (~15 queries, STG-002)
```

Each file is an array of query specifications:

```json
{
  "id": "en-direct-001",
  "query": "What did Yogananda say about divine mother?",
  "language": "en",
  "category": "direct",
  "expected_passages": [
    {
      "book_slug": "autobiography-of-a-yogi",
      "chapter_number": 12,
      "passage_substring": "a unique substring from the expected passage",
      "relevance": "high"
    }
  ],
  "expected_routing": "search",
  "notes": "Tests basic keyword+semantic overlap"
}
```

**Field semantics:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | `{lang}-{category}-{NNN}`. Stable identifier, never reused. |
| `query` | string | The seeker's search input, written in the target language. |
| `language` | string | ISO 639-1 code (`en`, `hi`, `es`). |
| `category` | enum | One of: `direct`, `conceptual`, `emotional`, `metaphorical`, `technique_boundary`, `dark_night`, `adversarial`. |
| `expected_passages` | array | 1–3 passages that a good search should surface. Empty for adversarial queries expecting no results. |
| `expected_passages[].relevance` | enum | `high` (directly answers) or `partial` (topically related, acceptable in top 5). |
| `expected_passages[].passage_substring` | string | A 10–40 word substring from the expected passage. Matched against `book_chunks.content` via `LIKE '%substring%'` to resolve to chunk IDs at evaluation time. Avoids brittle chunk ID coupling — survives re-chunking. |
| `expected_routing` | enum | `search` (normal results expected), `practice_bridge` (must route to Practice Bridge), `no_results` (off-topic, should return empty or very low relevance). |
| `notes` | string | Why this query is in the set. What it tests. |

### Query Design Protocol

**Sequencing:** Golden set queries are drafted *after* STG-001-4 (English ingestion complete) and *before* STG-001-8 evaluation runs. Claude reads the ingested corpus to write queries that test real content.

**Process per category:**

1. **Claude reads 5–8 chapters** of the ingested Autobiography, sampling from early, middle, and late chapters for coverage.
2. **Claude generates candidate queries** per category with expected passages, citing specific chapter/passage.
3. **Each query includes the `passage_substring`** — a verbatim excerpt from the corpus that the search should surface.
4. **Category balance reviewed** — ensure all major themes (meditation, fear, love, God-realization, guru, death, healing, self-discipline) are represented across the set. No single theme dominates.

### Six Difficulty Categories

| Category | Count (en) | Baseline | What It Tests |
|----------|-----------|----------|---------------|
| **Direct** | ~10 | ~95% | Queries with vocabulary that appears verbatim in the corpus. "What did Yogananda say about Babaji?" |
| **Conceptual** | ~12 | ~85% | Abstract concepts where the corpus uses related but different terminology. "How to find inner peace" when Yogananda writes about "calmness" and "tranquility." |
| **Emotional** | ~12 | ~70% | Seeker-vocabulary queries expressing emotional states. "I feel lost and purposeless" — must bridge from modern emotional language to Yogananda's spiritual vocabulary. |
| **Metaphorical** | ~8 | ~65% | Queries referencing Yogananda's metaphors and literary devices. "The soul like a wave in the ocean." Tests whether semantic search navigates figurative language. |
| **Technique-boundary** | ~8 | 100% | Queries about meditation techniques, Kriya Yoga specifics, or spiritual practices. Must route to Practice Bridge (FTR-055), never return technique instructions. `expected_routing: "practice_bridge"`. |
| **Dark Night** | ~8 | ~60% | Fragmentary, pre-linguistic, distressed queries: "I can't stop crying," "nothing matters anymore," "why am I here," "I feel empty inside." Evaluated not by standard Recall@3 but by whether the retrieved passage *meets the seeker where they are* — Opus judges retrieval intent match (does the passage console rather than instruct? does it acknowledge rather than advise?). Tests the Vocabulary Bridge's Layer 1 state mappings and retrieval intent routing (FTR-028). `expected_routing: "search"` with `retrieval_intent: "meet_first"` or `"console"`. Crisis-adjacent queries in this category must also trigger the safety interstitial (FTR-051). |
| **Adversarial** | ~8 | N/A | Off-topic ("What is the weather in LA?"), misspelled ("Yoganada meditashun"), multi-intent ("Tell me about fear and also what's the best restaurant"), prompt-injection attempts. `expected_routing: "no_results"` or graceful degradation. No relevance score — pass/fail on routing correctness. |

**Total English:** ~66 queries (~58 original + ~8 Dark Night). Spanish (~15 queries) uses the same seven categories but weighted toward Direct and Conceptual given smaller corpus coverage in STG-002. Hindi queries (~15) added when Hindi activates in Milestone 5b.

### Evaluation Metrics

**Primary gate metric — Recall@3 per category:**

For each query, does at least one `expected_passages[].relevance == "high"` passage appear in the top 3 results? Binary per query. Aggregated as percentage per category and overall.

- **Overall threshold:** >= 80% (gates STG-001 completion)
- **Per-category thresholds:** baselines in table above. Used for diagnostic prioritization, not hard gates (except Technique-boundary at 100%).

**Secondary diagnostic metric — MRR@10 (Mean Reciprocal Rank):**

`1/rank` of the first relevant result, averaged across queries. Reveals ranking quality — a system that returns the right passage at position 8 passes Recall@3 poorly but may need only minor tuning. Reported per category. Not a gate metric.

**Adversarial accuracy:**

Percentage of adversarial queries that route correctly (`practice_bridge` or `no_results`). Reported separately. Target: 100%.

### Evaluation Judge (Claude-Automated)

The evaluation script calls Claude (Haiku via Bedrock) as the relevance judge. For each query:

1. Run the query against `/api/v1/search`.
2. Collect top 10 results.
3. For each expected passage, check if the `passage_substring` appears in any of the top 10 result chunks (string match). If found, record its rank.
4. For results that don't match expected passages by substring, send to Claude with the prompt:

```
You are evaluating search results for a spiritual teachings portal.

Query: "{query}"
Expected passage (substring): "{passage_substring}"
Search result #{rank}: "{result_content}"

Is this search result relevant to the query? Consider:
- Does it address the same topic or spiritual concept?
- Would a seeker find this helpful for their query?

Respond with ONLY one of: HIGH, PARTIAL, NOT_RELEVANT
```

5. For technique-boundary queries, verify the response includes a Practice Bridge indicator (API response field `practice_bridge: true`).
6. For adversarial queries, verify no results exceed a relevance threshold or that the routing is correct.

**Why substring matching + Claude fallback:** Substring matching is deterministic and fast — it handles the common case where the expected passage is returned. Claude judging handles the case where a *different but equally relevant* passage is returned (which is success, not failure). This avoids false negatives from rigid matching.

### Evaluation Script

```
/scripts/eval/search-quality.ts
```

**Interface:**

```bash
pnpm eval:search                    # Run English golden set
pnpm eval:search --lang hi          # Run Hindi golden set
pnpm eval:search --lang es          # Run Spanish golden set
pnpm eval:search --lang all         # Run all languages
pnpm eval:search --category emotional  # Run single category
pnpm eval:search --verbose          # Print per-query details
```

**Output:** JSON report to `/data/eval/results/eval-{lang}-{timestamp}.json`:

```json
{
  "timestamp": "2026-03-15T10:30:00Z",
  "language": "en",
  "total_queries": 58,
  "overall_recall_at_3": 0.84,
  "overall_mrr_at_10": 0.71,
  "categories": {
    "direct": { "count": 10, "recall_at_3": 0.90, "mrr_at_10": 0.85 },
    "conceptual": { "count": 12, "recall_at_3": 0.83, "mrr_at_10": 0.68 },
    "emotional": { "count": 12, "recall_at_3": 0.75, "mrr_at_10": 0.62 },
    "metaphorical": { "count": 8, "recall_at_3": 0.75, "mrr_at_10": 0.58 },
    "technique_boundary": { "count": 8, "routing_accuracy": 1.0 },
    "adversarial": { "count": 8, "routing_accuracy": 1.0 }
  },
  "failures": [
    {
      "id": "en-emotional-003",
      "query": "I feel afraid to die",
      "expected_passage": "...",
      "best_match_rank": null,
      "top_3_results": ["...", "...", "..."]
    }
  ],
  "gate_passed": true
}
```

**Failure report** is the actionable output — it shows exactly which queries failed and what was returned instead, enabling targeted tuning per the contingency plan in ROADMAP.md.

### CI Integration

A GitHub Action runs the evaluation on PRs that touch search-affecting paths:

**Trigger paths:** `/lib/services/search/`, `/lib/prompts/`, `/lib/config.ts` (search-related constants), `/migrations/` (schema changes affecting `book_chunks` or indexes), `/data/eval/golden-set-*.json`.

**Behavior:**
- Runs `pnpm eval:search --lang en` against a Neon branch (same branch isolation pattern as integration tests — FTR-081).
- Posts a summary comment on the PR: overall Recall@3, per-category breakdown, any regressions from the previous run.
- **Fails the PR** if overall Recall@3 drops below 80% or Technique-boundary routing accuracy drops below 100%.
- Stores the result JSON as a CI artifact for historical comparison.

### Multi-Dimensional Relevance Evaluation (STG-006+)

Standard Recall@3 and MRR@10 measure topical relevance — "did we find a passage about the right subject?" But the portal aspires to multi-dimensional relevance: the right passage for this topic AND this emotional register AND this depth level AND this seeker state.

**Additional evaluation dimensions (STG-006+):**

| Dimension | Metric | Judge | Description |
|-----------|--------|-------|-------------|
| Rasa-match | Rasa alignment score (0-1) | Claude Opus | Does the returned passage's rasa match what the query implies? A grief query should return karuna passages. |
| Depth-match | Depth alignment score (0-1) | Claude Opus | Is the passage at the right experiential depth for the query? A beginner query shouldn't return depth-7 nirvikalpa descriptions. |
| Register-match | Register alignment score (0-1) | Claude Opus | Does the passage's voice register match the query's register? A distressed query needs consoling, not philosophical. |
| Retrieval intent match | Binary | Deterministic | Does the result set honor the Vocabulary Bridge's retrieval intent? `meet_first` queries should return acknowledging passages before instructional ones. |

**Evaluation methodology:**

- **ARES-style LLM judges** (Stanford, Saad-Falcon et al., 2023): Generate tailored Claude judges for each dimension. Fine-tune lightweight DeBERTa judges calibrated against ~150 expert annotations for cost-efficient CI runs. Provides confidence intervals via Prediction-Powered Inference.
- **RPP (Recall-Paired Preference)** (Google Research, 2022): For A/B system comparison without behavioral data. Simulates user subpopulations per query and compares ranked lists directly — compatible with DELTA constraints (FTR-085).
- **Expert evaluation panels:** Periodic comparative judgment (system A vs. B outputs, blinded) for emotional/devotional query categories where automated metrics are least reliable.

**Golden set extension for multi-dimensional evaluation:**

Each query in the golden set gains optional annotations:

```json
{
  "id": "en-emotional-003",
  "query": "I feel afraid to die",
  "expected_rasa": "karuna",
  "expected_depth_max": 4,
  "expected_register": "consoling",
  "expected_retrieval_intent": "meet_first"
}
```

Not all queries require all dimensions — Direct and Referential queries are adequately evaluated by topical Recall@3. The multi-dimensional annotations apply primarily to Emotional, Dark Night, and Devotional query categories.

**Research basis:** Both Gemini and Claude deep research reports (March 2026) identify single-dimension topical relevance as insufficient for sacred text retrieval. Saracevic's five-dimensional relevance framework (algorithmic, topical, cognitive, situational, affective) and the portal's own enrichment metadata provide the substrate for richer evaluation.

### Parameter Evaluation

The golden set is the evaluation instrument for tuning parameters governed by FTR-012:

| Parameter | Values to Test | Deliverable |
|-----------|---------------|-------------|
| CC fusion α (2-path) | 0.3, 0.5, 0.7 | STG-006 |
| CC fusion weights (3-path) | Per-register table from FTR-020 | STG-007 |
| Chunk size (token count) | 200, 300, 500 | STG-001-8 (contingency) |
| Embedding model | Voyage voyage-4-large (default), Cohere embed-v3, BGE-M3 | STG-001-8 (contingency) |
| Enrichment-augmented vs. plain embedding | A/B on Neon branch | STG-006 |
| Reranker candidate pool size | 20, 50, 100 | STG-006 |

Each parameter evaluation uses the same golden set and produces a comparable results JSON. The per-category breakdowns reveal *where* a parameter change helps or hurts — e.g., a larger chunk size might improve Emotional queries (more context) but hurt Direct queries (diluted keyword signal).

### Golden Set Versioning

The golden set grows as the corpus grows:

| Milestone | Corpus | Golden Set |
|-----------|--------|------------|
| 1a | English Autobiography | ~58 en queries |
| 1b | + Hindi, Spanish Autobiography | + ~15 hi, ~15 es queries |
| 3a | + 7 additional English books | Re-evaluate existing en queries + ~20 new cross-book queries |
| 3c | + related content graph | ~50 relation-quality queries (DES separate — STG-008-5) |

Old queries are **never removed** — they serve as regression tests. New queries are appended. The `id` field ensures stability across versions.

## Notes

- **Origin:** FTR-037 (Search Quality Evaluation Harness)
- **March 2026 revision:** Added multi-dimensional relevance evaluation (rasa-match, depth-match, register-match, retrieval intent match). Added ARES-style LLM judges, RPP for system comparison, and expert evaluation panels. Updated parameter evaluation table for CC fusion and enrichment-augmented embeddings. Based on convergent deep research findings. See `docs/reference/deep-research-gemini-modern-search.md` and `docs/reference/deep-research-claude-modern-search.md`.
