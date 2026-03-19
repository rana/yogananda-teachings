---
ftr: 173
title: "Comparative Analysis Engine"
summary: "A/B comparison of models, workflows, and prompts with Opus quality rating"
state: proposed
domain: operations
governed-by: [PRI-12]
depends-on: [FTR-168, FTR-170, FTR-174]
re-evaluate-at: STG-013
---

# FTR-173: Comparative Analysis Engine

## Rationale

Empirical data beats intuition. The platform should systematically compare: same prompt with different models, same goal with different workflow orchestrations, and different prompts for the same outcome. Opus rates all outputs. Over time, the organization builds institutional knowledge about what works.

**Phased approach:** Quality data accumulates organically first — different experiments naturally use different models, workflows, and prompts. After 50+ experiments, real comparison data exists without intentional duplication. Deliberate A/B infrastructure (experiment cloning, variant tracking, side-by-side comparison UI) deferred until organic data reveals the need. The Meta-Reviewer scoring every experiment and the self-improvement loop are the load-bearing pieces at launch.

**Motivating use case for deliberate comparison:** When local/open-source models (Ollama, etc.) enter the mix alongside Bedrock and direct API, cost-quality tradeoffs become genuinely interesting and empirical data replaces intuition. This is where formal A/B comparison earns its place.

## Specification

### Model Comparison

Run the same experiment with different model assignments per stage. Opus Meta-Reviewer rates each output on quality dimensions (correctness, completeness, design quality, accessibility, performance).

Example output:
```
Run A: Engineer=Sonnet, Review=Opus     → Cost: $4.20, Quality: 8.2/10
Run B: Engineer=Opus, Review=Opus       → Cost: $18.50, Quality: 9.1/10
Run C: Engineer=Haiku, Review=Sonnet    → Cost: $0.85, Quality: 5.7/10
```

### Workflow Comparison

Same goal, different orchestration:
- Sequential narrow agents vs. parallel agent teams vs. single broad agent
- Compare: time to completion, cost, quality, coherence, test coverage

### Prompt Comparison

Different prompts for the same outcome:
- Detailed user stories vs. high-level vision vs. reference-based ("make it better")
- Compare: output quality, adherence to intent, creative latitude

### Model Routing and Cascading via Gateway Layer

Enterprise AI deployments average 340% cost overruns. Model routing/cascading achieves 40-85% savings by directing each request to the cheapest model that meets quality thresholds.

The gateway layer (FTR-174) provides the infrastructure. This FTR consumes its metrics:
- Per-task quality scores by model (from experiment history)
- Latency and token usage by model (from gateway telemetry)
- Cost-per-quality-point ratios (computed from both)

**Routing rules:** Start with cheapest model. If quality score falls below threshold for that task type, cascade to next model tier. Track which task types need which model tiers — this data becomes the organization's empirical model selection guide.

### Cheapest Effective Model

Systematically find the least expensive model that meets quality thresholds per task type. Track cost-per-quality-point across experiments. Surface the efficient frontier.

### Opus Meta-Reviewer Specification

The Meta-Reviewer rates experiment outputs on 6 dimensions:

| Dimension | Weight | What It Measures |
|-----------|--------|-----------------|
| Correctness | 0.25 | Does the output work? Tests pass, no errors, functional completeness |
| Completeness | 0.15 | Does it cover all requirements from the prompt? |
| Design Quality | 0.20 | Visual coherence, design system compliance, typography, layout |
| Accessibility | 0.15 | WCAG 2.1 AA, keyboard nav, screen reader, color contrast |
| Performance | 0.15 | Bundle size, FCP, LCP, 2G viability |
| Mission Alignment | 0.10 | PRI compliance, calm technology, content fidelity |

Output: per-dimension scores (0-10), weighted total, qualitative summary, specific improvement suggestions.

**Calibration:** The Meta-Reviewer is calibrated against a set of 5-10 manually-rated experiments (the "golden set"). If the Meta-Reviewer's scores deviate from human ratings by > 1.5 points on average, the Meta-Reviewer prompt needs revision.

### AI Self-Improvement Loop (Absorbed from FTR-174)

Experiment outcomes feed back into platform defaults. This is the mechanism by which the platform gets better over time.

**What feeds back:**
- Prompt effectiveness analysis → update template library defaults
- Workflow efficiency analysis → reorder default pipeline stages
- Role contribution analysis → adjust default model assignments per role
- Gate effectiveness → reorder validation gates, adjust veto authority
- Quality trend analysis → surface the efficient frontier

**Feedback cadence:** Monthly. An Opus-level analysis agent reviews all completed experiments from the past month, produces a "Platform Improvement Report" with specific recommendations. IT lead reviews and approves changes before they take effect. No automatic default changes — human judgment required.

**Feedback loop safety:** The self-improvement loop can lock in suboptimal choices if not periodically challenged. Every quarter, run a "challenge experiment" — deliberately override the learned defaults with alternatives (different model mix, different workflow, different template). Compare quality. This prevents the system from optimizing into a local minimum.

### Storage

All comparisons stored in experiment repos and aggregated in platform Neon DB. Queryable via MCP tools and ops dashboard.

**Storage schema (platform Neon DB):**

```sql
-- Experiment quality scores
experiment_quality (
  experiment_id UUID,
  variant_label TEXT,       -- 'baseline', 'variant-a', etc.
  reviewer TEXT,            -- 'opus-meta-reviewer' or human reviewer ID
  dimension TEXT,           -- 'correctness', 'design_quality', etc.
  score DECIMAL(3,1),       -- 0.0 to 10.0
  confidence DECIMAL(3,2),  -- 0.00 to 1.00
  findings JSONB,
  created_at TIMESTAMPTZ
)

-- Comparison records
experiment_comparisons (
  comparison_id UUID,
  baseline_experiment_id UUID,
  variant_experiment_ids UUID[],
  comparison_type TEXT,     -- 'model', 'workflow', 'prompt'
  summary TEXT,
  winner_experiment_id UUID,
  cost_savings_pct DECIMAL(5,2),
  created_at TIMESTAMPTZ
)
```

## Edge Cases

- **Statistical validity with N=1.** A single experiment per variant produces anecdotal comparison. LLM non-determinism means the same configuration produces different results. Resolution: for meaningful comparison, run each variant 3 times minimum. Report confidence intervals, not point estimates. Label N=1 comparisons as "directional" not "conclusive."
- **Opus as sole judge bias.** The Meta-Reviewer (Opus) may rate its own output higher than Sonnet's. Resolution: calibrate against human ratings (golden set). If Opus shows systematic bias (always rates Opus-built output higher), add a bias-correction factor. Periodically substitute a human reviewer to check calibration.
- **Comparison across time.** Model capabilities change with updates. A comparison from January is obsolete by March if models were updated. Resolution: tag comparisons with model version IDs (not just model names). Comparisons are valid only within the same model version. After a model update, re-run the golden set comparison to establish new baselines.
- **Comparison cost multiplication.** Running the same experiment 3-4 times with different models multiplies cost 3-4x. A $4 experiment becomes $12-16 in comparison mode. Resolution: comparison is opt-in (not default). The `cost_forecast` tool (FTR-174) shows estimated comparison cost before execution. Budget must explicitly account for comparison runs.

## Error Cases

- **Meta-Reviewer produces inconsistent scores.** Same experiment rated 8.2 on Monday and 6.5 on Tuesday. LLM non-determinism in evaluation. Resolution: run the Meta-Reviewer 3 times (same triple-run pattern as gates) and report mean + standard deviation. High variance (SD > 1.5) triggers human review.
- **Self-improvement loop recommends harmful change.** "Use Haiku for Build stage to save 80%" — but Haiku produces code that fails security gates 60% of the time. Resolution: improvement recommendations are proposals, not auto-applied. IT lead reviews. Every recommendation includes the quality impact alongside the cost impact.
- **Golden set becomes stale.** The 5-10 manually-rated experiments used for calibration were rated 6 months ago. Staff quality expectations may have shifted. Resolution: refresh the golden set quarterly. Re-rate with current standards. Track calibration drift over time.
- **Comparison with incomparable variants.** Comparing "Full Autonomous Build" workflow with "Proof of Concept" workflow. Different scopes produce different quality levels — the comparison is meaningless. Resolution: comparison engine validates that variants share the same prompt and workflow template (differing only in model/role/parameter assignments). Block incompatible comparisons.

## Notes

Full detail: `docs/plans/ftr-168-ai-agent-platform.md` section 7.

**Research-informed additions (2026-03-18):** Model routing/cascading (both Prompt 1 reports cite 340% cost overruns and 40-85% savings). AI self-improvement loop absorbed from FTR-174 — the comparative analysis engine produces the quality data that drives platform improvement. Quality data informs model selection decisions by the orchestrator.

**Revised approach (2026-03-18):** Organic quality data first, deliberate A/B deferred. The Meta-Reviewer scoring every experiment and the monthly self-improvement loop are the Phase 1 load-bearing pieces. Formal comparison infrastructure (experiment_clone for comparison, variant tracking, side-by-side UI) deferred until local/open-source model integration (Ollama) creates genuine model selection complexity. At that point, empirical cost-quality data across providers (Bedrock vs. direct API vs. local) becomes the motivating use case.
