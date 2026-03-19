---
ftr: 174
title: "Glass Box Operations and Cost Tracking"
summary: "Transparent AI operations with gateway layer, granular cost attribution, and budget enforcement"
state: proposed
domain: operations
governed-by: [PRI-03, PRI-07, PRI-08, PRI-09, PRI-12]
depends-on: [FTR-168, FTR-169]
re-evaluate-at: M3d boundary
---

# FTR-174: Glass Box Operations and Cost Tracking

## Rationale

Every operation in the platform must be visible, explainable, and auditable — a glass box, not a black box. Four audiences: human oversight (accountability), learning (improvement), cost awareness (stewardship of philanthropic funding), and AI continual learning (evolution).

AWS Bedrock native cost tracking is insufficient — aggregated by model and region only, no per-experiment/stage/agent attribution without custom work. Enterprise AI deployments average 340% cost overruns. A gateway layer between orchestrator and all LLM APIs is non-optional infrastructure.

## Specification

### Token Tracking Layer (Direct SDK Logging)

The Claude Code SDK already reports `input_tokens` and `output_tokens` in every response. The orchestrator writes these directly to a `token_events` table in the existing Neon database. No gateway proxy, no new vendor, no added latency.

```sql
CREATE TABLE token_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES experiments(id),
  stage TEXT NOT NULL,
  agent_role TEXT NOT NULL,
  model TEXT NOT NULL,
  provider TEXT NOT NULL,
  operation TEXT,                       -- 'implement-component', 'validate-accessibility', etc.
  skill_used TEXT,                      -- 'implement', 'review', etc.
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  cost_usd NUMERIC(10,4) NOT NULL,     -- computed from model pricing at write time
  duration_ms INTEGER,
  confidence NUMERIC(3,2),             -- agent-reported confidence (0.00-1.00)
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_token_events_experiment ON token_events(experiment_id);
CREATE INDEX idx_token_events_stage ON token_events(experiment_id, stage);
```

**What direct logging provides:**
- Per-experiment, per-stage, per-agent token attribution (same granularity as a gateway — from the same SDK response data)
- Budget enforcement via pre-call query: `SELECT SUM(cost_usd) FROM token_events WHERE experiment_id = $1`
- Request/response logging for audit trail (agent session transcripts in experiment repo, FTR-169)
- Model selection by the orchestrator per stage (FTR-170) — no proxy needed for routing

**What it does NOT provide (deferred to gateway if needed at scale):**
- Multi-provider unified interface (relevant when Bedrock + direct Anthropic + Gemini + Ollama run concurrently)
- Centralized rate limiting across concurrent experiments (relevant at 100+ experiments/month)
- Real-time request interception for budget enforcement (pre-call query has a small race window; acceptable at project scale)

**When to reconsider:** If the platform grows to 100+ concurrent LLM calls, or if multi-provider routing becomes complex (3+ providers with failover), evaluate LiteLLM (open-source, self-hosted) or Portkey (managed). The `token_events` table remains the attribution store regardless — a gateway would write to the same table.

### Granular Token Tracking

Every AI operation records a row in `token_events` (written by the orchestrator after each Claude Code SDK call):

```jsonc
{
  "experiment_id": "exp_abc123",
  "stage": "build",
  "agent_role": "frontend-engineer",
  "model": "claude-sonnet-4-6",
  "provider": "aws-bedrock",
  "operation": "implement-component",
  "input_tokens": 45230,
  "output_tokens": 12840,
  "cost_usd": 0.0847,
  "duration_ms": 18500,
  "skill_used": "implement",
  "confidence": 0.85
}
```

**Authoritative source for billing:** SDK-reported token counts are authoritative for internal attribution and budget enforcement. Bedrock billing is authoritative for actual charges. Monthly reconciliation flags discrepancies > 5%.

### Cost Questions Answered

**Per-experiment:** "How much did this cost?" → total with per-agent, per-stage, per-model breakdown
**Per-project:** "How much this month?" → aggregate with averages and trend
**Cross-organization:** "Where is our spend across all IT services?" → unified dashboard covering Bedrock, Voyage AI, Neon, Vercel, Contentful, Sentry, New Relic

### Cost Controls

| Control | Mechanism | What Happens at Limit |
|---------|-----------|----------------------|
| Per-experiment budget | Token budget set at experiment creation | Gateway rejects requests. Experiment paused with notification to requester. |
| Per-stage budget | Percentage of experiment budget allocated per stage | Stage halted. Orchestrator skips to next stage or pauses for human decision. |
| Per-project monthly budget | Configurable in project config | Alerts at 80%. Hard stop at 100%. All project experiments paused. |
| Organization monthly budget | Platform-level across all projects | Executive notification at threshold. New experiments blocked; running experiments complete. |
| Model cost optimizer | Post-experiment analysis | Estimate cost with alternative model mix. Suggest cheaper options that meet quality bar. |
| Cost-per-quality ratio | Tracked across experiments | Surface the efficient frontier. Flag experiments that are cost outliers for their quality score. |

**Budget circuit breaker vs. durable execution conflict.** When a budget limit kills an experiment mid-stage, the durable execution layer (FTR-170) wants to resume but can't. Resolution: the experiment enters a `budget_exceeded` state (not `failed`). Staff can increase the budget and resume, or decline the experiment. The durable execution layer checkpoints the state so no work is lost.

### Calm Design Language for Operations

The ops surface for a spiritual organization cannot look like a Datadog dashboard. PRI-03 (honoring the spirit) and PRI-08 (calm technology) apply to infrastructure visibility.

- SRF Gold (`#dcbd23`) for healthy state. Navy (`#1a2744`) for attention needed. Warm Cream (`#FAF8F5`) backgrounds. No alarm red. No urgency animations.
- Typography: Merriweather + Open Sans — the same family as the teachings portal.
- Health indicators use both color AND text labels ("OK" / "Attention" / "N/A") for color-blind accessibility.
- A monastic administrator should feel the same quality of attention they feel using the teachings portal. Restraint as excellence (PRI-03) applied to operational visibility.

### Glass Box Surfaces

**Platform Pulse — The Front Door.** When staff open `yogananda.tech/ops`, they see a calm, AI-generated 4-6 sentence summary of platform state:

> "3 experiments active, all within budget. The Convocation 2027 build is 78% complete ($2.41 spent). No service alerts. Last gate failure was 4 days ago. This month: 18 experiments, $127.40 total, 12 approved."

One Sonnet call on page load. Cached 5 minutes. Three audience paths from the Pulse:

| Audience | Path | What They See |
|----------|------|---------------|
| Executive / philanthropist | Pulse + monthly cost card | 30-second summary: cost, experiment count, budget health. Done. |
| Staff / monastic | Pulse + experiment list | Status of their experiments. Click any for detail. |
| IT | Pulse + full dashboard | Health check, then drill into any experiment or service. |

**Zero-state (before experiments exist):** "Platform ready. No experiments yet. [Start your first experiment →]" Service health indicators show infrastructure status.

**First-visit onboarding:** A 60-second walkthrough (dismissible, never repeated) that explains: the Pulse (your summary), the experiment list (your projects), and the detail view (the deep view).

**Hierarchical List View — The Primary Ops Surface.** The ops surface is a navigable hierarchy, not a graph. Progressive enhancement: HTML table is the foundation.

- **Organization level:** Table of projects — name, active experiments, monthly cost, health indicator
- **Project level:** Table of experiments — name, status, current stage, cost, quality score, last activity
- **Experiment level:** Ordered list of stages — status, duration, cost, agent count, gate results
- **Stage level:** List of agent sessions — role, model, skills, tokens, confidence, artifacts

Full keyboard navigation (Tab between rows, Enter to expand). ARIA live regions for status changes. Search, filter, sort on every column. Screen reader users get a first-class experience. Mobile renders as a responsive list with expandable rows.

**Experiment Detail View:**
- Timeline with timestamps and costs per stage
- Expandable agent session transcripts (what each agent read, decided, produced)
- Decision log with rationale (from Lore protocol commits, FTR-169)
- Gate-by-gate validation results (from FTR-172)
- Cost waterfall by agent/model/stage
- Human feedback and how agents addressed it

**Institutional Learning Feed:**
- Weekly digest: "This week's experiments taught us..."
- Pattern detection: "Experiments with deep research phase produce 23% higher quality scores"
- Anti-pattern alerts: "3 experiments this month exceeded budget due to Opus in build phase"
- Role effectiveness: "Production Engineer agent caught 7 instrumentation gaps across 5 experiments"
- All findings labeled as correlational, not causal. Human judgment required before changing defaults.

### FTR Traceability as Metadata

Every experiment, stage, and component carries `ftr_refs` — the FTR(s) that govern it. This is a metadata column, not a separate topology.

- **Component → Specification:** Click any experiment or component to see which FTR specified it and which PRIs constrain it.
- **Specification → Components:** Filter the list view by FTR or PRI. "Show me everything governed by PRI-01" filters to content-facing components with their compliance status.
- **Compliance filter:** Select a PRI from a dropdown. The list recolors: Gold for compliant, Navy for attention needed, dimmed for not applicable.

Implementation: `ftr_refs INTEGER[]` on experiment, stage, and component records. The list view supports filtering by FTR reference. No separate graph database needed.

### Full Vendor Cost Roll-Up

The organization-level cost view shows all IT costs, not just LLM tokens:

| Service | Cost Source | Attribution |
|---------|-----------|------------|
| AWS Bedrock (Claude) | Gateway token tracking | Per-experiment, per-agent, per-model |
| AWS Bedrock (Voyage AI) | Bedrock billing API | Per-embedding batch |
| AWS Lambda | CloudWatch / Cost Explorer API | Per-invocation |
| AWS SES | SES billing | Per-notification |
| AWS Secrets Manager | Fixed monthly | Platform infrastructure |
| Neon PostgreSQL | Neon billing API | Per-project (Scale tier) |
| Vercel | Vercel billing API | Per-project (Pro tier) |
| Contentful | Fixed monthly | Community tier |
| Sentry | Fixed monthly | Per-event overage if applicable |
| New Relic | Fixed monthly | Per-host/per-event |
| Auth0 | Fixed monthly | Per-MAU when active (M7a+) |
| GitHub | Free tier | No cost attribution needed |

One surface that answers "Where is every dollar going?" Variable-cost services show usage-based cost. Fixed-cost services show flat-rate entries.

### Degraded Mode

The ops surfaces depend on multiple data sources (Neon, Sentry, New Relic, Vercel). When sources are unavailable:

- **Single source unavailable:** Item-level stale indicators with "last updated" timestamp. Dashboard fully functional.
- **Multiple sources unavailable:** Banner: "Showing data from [timestamp] — sources unavailable: [list]." Platform Pulse includes data completeness caveat.
- **Neon unavailable (primary database):** Static cached snapshot of last-known state. Banner: "Live data unavailable."
- **Bedrock unavailable (AI operator):** Platform Pulse disabled. List view and cost data still render from database. Direct-manipulation filters active.

The ops dashboard is never the sole diagnostic tool. Each underlying service (Sentry, New Relic, Neon) remains independently accessible. The dashboard is an enhancement layer — progressive enhancement applied to the ops surface.

### Integration with Platform Cost Tracking

Extend existing platform `cost_snapshots` table with `experiment_id`, `agent_role`, and `model` dimensions. Extend `budget_check` MCP tool to accept experiment scope. Add `cost_forecast` tool: estimate cost before running (based on historical data for similar workflow templates).

### New MCP Tools

```
cost_track          — Record token usage event (called by orchestrator after each SDK call)
cost_summary        — Per-experiment or per-project cost breakdown
cost_forecast       — Estimate experiment cost before execution
budget_check        — Current budget utilization (extended with experiment scope)
budget_adjust       — Increase/decrease experiment budget (requires authorization)
```

## Edge Cases

- **Multi-provider token counting discrepancy.** Anthropic, Google, and open-source models count tokens differently (different tokenizers). The orchestrator must normalize to a common unit for cost comparison. Use provider-reported token counts for billing accuracy; use orchestrator-estimated counts for cross-provider comparison.
- **Cost attribution for shared resources.** A Neon database branch serves multiple stages. The branch cost should be attributed to the experiment, but not to any single stage. Add an "infrastructure" cost category alongside per-stage LLM costs.
- **Historical cost data invalidation.** Model pricing changes. Historical cost data computed at old prices becomes inaccurate for trend analysis. Store raw token counts alongside computed costs — recompute historical costs at current prices for accurate trending.

## Error Cases

- **Budget enforcement race condition.** Two parallel agents in the same experiment both check budget simultaneously (both under limit) and proceed. Combined spend exceeds budget. At project scale (< 5 concurrent agents per experiment), the overspend window is small — one extra LLM call beyond budget. Mitigation: budget check reserves estimated tokens before the call (based on historical average for that stage/role). If the reservation would exceed budget, the call is blocked. Reservation released and replaced with actual usage after the call completes. At scale, use `SELECT ... FOR UPDATE` for atomic budget decrement.
- **Cost forecast wildly inaccurate.** A "Content Site" workflow historically costs $3, but this particular content site has 10x more pages. The forecast is based on template averages, not input complexity. Mitigation: cost forecast shows confidence interval, not point estimate. Alert when running cost exceeds forecast by > 2x.
- **Institutional learning feed produces misleading patterns.** "Experiments with deep research produce 23% higher quality" — but this correlation may be confounded (complex experiments are more likely to use research AND produce higher quality). The feed must label findings as correlational, not causal. Human judgment required before changing defaults.

## Notes

Full detail: `docs/plans/ai-agent-platform.md` sections 20, 21.

MCP is the data layer for all visualization — human dashboard and AI operator see the same data through different interfaces. This is PRI-12 in practice: AI-native operations with human visibility.

Observability is the weakest link in agent systems: automated failure attribution is only 53.5% accurate (ICML 2025). Agents produce confident wrong answers with 200 OK. The glass box must evaluate output quality, not just execution success.

**Relocated from this FTR (2026-03-18):**
- Constitutional compliance scoring and policy-as-code → FTR-168 (umbrella governance, where principle-level constraints belong)
- AI self-improvement loop → FTR-173 (comparative analysis engine, which produces the quality data that drives improvement)

**Research basis (2026-03-18):** Gateway layer as non-optional (both Prompt 1 reports — 340% cost overruns). Budget enforcement patterns (Claude Prompt 1 — circuit breakers). Observability weakness (ICML 2025 — 53.5% failure attribution accuracy).

**Revised token tracking (2026-03-18):** LLM gateway (LiteLLM/Portkey) replaced with direct SDK logging after crucible analysis. Same simplification pattern as Temporal → PostgreSQL (FTR-170): the Claude Code SDK already reports token usage in every response. Writing to a `token_events` table provides identical attribution granularity without a proxy layer, added latency, or new vendor. Gateway remains the documented scale threshold option (100+ concurrent calls, 3+ providers with failover).

**Absorbed from FTR-178 (2026-03-18):** Calm Design Language, Platform Pulse (front door), Hierarchical List View (primary ops surface), FTR Traceability as Metadata, Full Vendor Cost Roll-Up, Degraded Mode specification. FTR-178 declined — topology graph deferred as non-load-bearing.
