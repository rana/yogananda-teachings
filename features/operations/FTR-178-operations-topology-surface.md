---
ftr: 178
title: "Operations Topology Surface — Interactive Architecture Intelligence"
summary: "Zoomable interactive graph of platform topology with real-time metrics, FTR traceability, AI sessions, and operational intelligence"
state: declined
domain: operations
governed-by: [PRI-03, PRI-05, PRI-07, PRI-08, PRI-09, PRI-12]
depends-on: [FTR-168, FTR-169, FTR-170, FTR-174]
re-evaluate-at: M3d boundary
---

# FTR-178: Operations Topology Surface — Interactive Architecture Intelligence

## Status: Declined (2026-03-18)

**Declined after crucible analysis.** The load-bearing pieces of this FTR — Platform Pulse, hierarchical list view, calm design language, vendor cost roll-up, degraded mode, FTR traceability as metadata — were absorbed into FTR-174 (Glass Box Operations and Cost Tracking). The interactive topology graph was determined to serve 1-3 IT users while Platform Pulse + list view serves all audiences. The graph remains a future enhancement option if demand emerges, but is not load-bearing infrastructure.

This file is preserved as architectural reference. The vision document (`docs/plans/ftr-168-ai-agent-platform.md`) contains the full original thinking.

## Rationale

The platform generates rich operational data across every layer: Temporal workflows, Claude Code sessions, validation gates, cost attribution, observability signals. Today this data is siloed — Temporal UI shows workflow state, Sentry shows errors, New Relic shows performance, the gateway shows cost. No single surface shows the whole system as a living topology.

The operations topology surface is an interactive, zoomable graph that makes the entire platform visible as a connected architecture — from the organizational roll-up down to individual component nodes. Every node carries real-time metrics, FTR associations, cost attribution, and health signals. Every edge shows data flow and dependency.

Two audiences share one topology:

**Human oversight.** Staff and IT see the platform as a living map. They can trace an experiment from prompt to deployed site, see where cost accumulates, understand which services depend on which, and identify bottlenecks without reading logs. This is the glass box (FTR-174) made spatial — not dashboards of numbers, but a navigable architecture.

**AI operational intelligence.** The same topology is available via MCP tools. An AI operator agent can query the graph, identify cost anomalies, suggest model substitutions, detect underutilized services, and propose efficiency measures. The topology is the shared mental model that enables both human and AI to reason about the platform.

## Specification

### Design Language — Calm Operations

The ops surface for a spiritual organization cannot look like a Datadog dashboard. The topology honors PRI-08 (calm technology) and PRI-03 (honoring the spirit) even in the infrastructure layer.

**Visual vocabulary:**
- SRF Gold (`#dcbd23`) for healthy nodes. Navy (`#1a2744`) for nodes needing attention. Warm Cream (`#FAF8F5`) backgrounds. No alarm red. No urgency animations.
- Active nodes show a subtle Gold border — static, not animated. **Breath animation is opt-in** ("Show activity" toggle), not default. Multiple nodes pulsing simultaneously creates visual noise that contradicts calm technology. When `prefers-reduced-motion` is active, animation is completely absent — not reduced, absent.
- Cost flows rendered as translucent warm streams between nodes — heavier spend is wider, not louder. The visual metaphor is water, not fire.
- Transitions between zoom levels are smooth and continuous — the graph unfolds rather than jumps. Spatial continuity preserves cognitive context.
- Typography: the same Merriweather + Open Sans hierarchy as the teachings portal. The ops surface is part of the same family, not a different product.
- Compliance heat map uses both color AND text labels/patterns — Gold + "OK" label, Navy + "Attention" label, dimmed + "N/A" label. Color alone is insufficient for color-blind users.

A monastic administrator looking at this surface should feel the same quality of attention they feel using the teachings portal. The technology disappears and the information shines. This is not decoration — it is the direct application of "restraint as excellence" (PRI-03) to operational visibility.

### Platform Pulse — The Front Door

The graph is not the front door. The front door is a calm, plain-language summary.

When staff open `yogananda.tech/ops/topology`, they see **Platform Pulse** — a 4-6 sentence AI-generated summary of platform state:

> "3 experiments active, all within budget. The Convocation 2027 build is 78% complete ($2.41 spent). No service alerts. Last gate failure was 4 days ago (accessibility advisory on the Retreat Landing page, since resolved). This month: 18 experiments, $127.40 total, 12 approved."

Below the Pulse: a list of active experiments with status bars and running costs. Below that: the graph (collapsed by default, expandable via "Show topology" toggle or any deeper query).

**Three audience paths from the front door:**

| Audience | Path | What They See |
|----------|------|---------------|
| Executive / philanthropist | Platform Pulse + monthly card | 30-second summary: cost, experiment count, budget health, quality trend. Done. |
| Staff / monastic | Pulse + experiment list | Status of their experiments, narrative on click. Graph only if they want to explore. |
| IT | Pulse + graph | Quick health check, then dive into the topology for diagnostics. |

**Zero-state (before any experiments exist):** The Pulse shows: "Platform ready. No experiments yet. [Start your first experiment →]" The graph shows service nodes only (Neon, Vercel, Bedrock, Temporal) as a static infrastructure diagram — the platform's skeleton, waiting to come alive. Pre-populated example queries in the natural language bar: "Try: 'Show platform health'" / "'What services are available?'"

**First-visit onboarding:** A 60-second interactive walkthrough (dismissible, never repeated) that explains: the Pulse (your summary), the experiment list (your projects), and the graph (the deep view). Points out the natural language bar: "Ask any question about the platform in plain English."

### Parallel List View — Accessibility First

The graph is an enhancement, not the foundation. A parallel list/table view presents the same information as structured, navigable lists. This is not a degraded fallback — it is the **primary experience** for screen reader users and the **preferred experience** on mobile.

**List view hierarchy:**
- **Organization level:** Table of projects with columns: name, active experiments, monthly cost, health indicator
- **Project level:** Table of experiments with columns: name, status, current stage, cost, quality score, last activity
- **Experiment level:** Ordered list of stages with: status, duration, cost, agent count, gate results
- **Stage level:** List of agent sessions with: role, model, skills, tokens, confidence, artifacts

Every piece of information available in the graph is available in the list. The list supports: keyboard navigation (Tab between rows, Enter to expand), screen reader announcements (ARIA live regions for status changes), search/filter/sort on every column.

**View toggle:** A persistent toggle at the top — "Graph | List" — remembers the user's preference. Default is List on mobile, Graph on desktop. Either view supports the natural language interface — queries highlight rows in List view just as they highlight nodes in Graph view.

Causal tracing in list view renders as a sequential narrative (from `topology_narrate`) rather than a visual path. Time travel in list view shows a before/after table rather than an animated graph morphing. Every graph-centric capability has a list-view equivalent.

### The Graph Metaphor

Everything in the platform is a node. Every relationship is an edge. The topology is a directed graph with typed nodes and typed edges, rendered as an interactive visualization and queryable via MCP.

Node types: `organization`, `project`, `experiment`, `workflow`, `stage`, `agent-session`, `service`, `component`, `database`, `api-endpoint`, `validation-gate`.

Edge types: `contains`, `depends-on`, `data-flow`, `cost-attribution`, `governed-by`, `calls`, `produces`, `consumes`.

### Zoom Levels

The graph supports continuous zoom with five semantic levels. Each level shows progressively more detail while maintaining parent context.

**Level 1 — Organization.** The whole platform. Nodes: projects, shared services (Neon, Vercel, Bedrock, Sentry, New Relic, Temporal). Metrics: total monthly cost, active experiments, aggregate health. Roll-up of everything below.

**Level 2 — Project.** A single project (e.g., yogananda-teachings, convocation-2027). Nodes: experiments (active, completed, declined), project-level services (database branch, Vercel deployment, GitHub repo). Metrics: project cost this month, experiment count, quality trend.

**Level 3 — Experiment.** A single experiment's workflow. Nodes: DAG stages (Research, Design, Build, Validate, Deploy, Notify), with fan-out visible as parallel branches. Edges show stage sequence and data flow (artifact handoffs). Metrics: per-stage cost, per-stage duration, current stage highlighted, gate pass/fail indicators.

**Level 4 — Stage.** A single workflow stage. Nodes: agent sessions within the stage (e.g., 3 parallel Design agents). Each agent node shows: role, model, skill set, token usage, confidence score, output artifacts. Edges show artifact production and consumption. For the Validate stage, gate nodes show pass/fail/warning with detail on hover.

**Level 5 — Component.** The deployed application's architecture. Nodes: pages, API routes, database tables, external service calls. Edges show data flow (which page calls which API route, which route queries which table). Metrics: per-component Sentry error count, New Relic latency, Lighthouse scores. This level is generated from build-manifest.json and observability data.

### Time Travel — The Temporal Dimension

The topology is spatial (zoom in/out of structure) and temporal (scrub forward/backward through time). A timeline slider at the bottom of the surface lets the viewer move to any point in history:

- **Watch an experiment unfold.** Scrub from experiment creation through each stage. Nodes appear as stages begin. Cost accumulates visibly. Gate results appear as the Validate stage completes. The experiment comes alive as a story, not a snapshot.
- **Reconstruct historical state.** "What did our platform look like last Tuesday?" The graph morphs — experiments that existed then reappear, metrics show their values at that time, services show their state. Institutional memory made navigable.
- **Compare epochs.** "Show March vs. June." The topology renders a diff — new services highlighted, removed experiments dimmed, cost changes annotated. Organizational evolution becomes visible.

Implementation: topology_nodes and topology_edges carry `created_at` and (for completed/deleted nodes) `archived_at`. The metrics table is naturally temporal. The time slider issues a query with a `as_of` timestamp; the API returns the graph state at that point. Completed experiments are never deleted — they transition to `archived` state and remain queryable.

Playback mode: for a single experiment, the timeline auto-advances through stage transitions with pauses at decision points. Like watching a time-lapse of a building being constructed. Staff can pause, rewind, and explore any moment.

### Narrative Generation

Metrics are numbers. Staff are monastics, not SREs. The topology should tell stories.

Click any experiment node and select "Tell me the story." The AI operator agent reads the full experiment graph — stages, agent sessions, decisions, costs, gates — and generates a plain-language narrative:

> "This experiment started at 9:03am when Sister Meera submitted the Convocation 2027 prompt. Research completed in 12 minutes — the dual-platform synthesis identified 3 gaps in event website accessibility for low-bandwidth users. Design fanned out to 3 agents; the Visual Designer took longest, generating 4 iterations of the component library before the Mediator resolved 2 conflicts between Product Design and Visual Design around the photo gallery layout. Build completed on the second attempt — the first hit a context window limit at the 47-minute mark, but the checkpoint saved all committed work and the second session resumed cleanly. All 9 validation gates passed. The Low-Bandwidth Tester flagged one advisory: hero images could be further optimized for Tier 3 devices. Deployed at 9:47am. Total cost: $4.20 across 8 agent sessions."

Narratives are generated on demand, not pre-computed. They adapt to the viewer's role — IT sees technical detail, staff sees outcomes, executives see cost and strategic alignment.

**Narrative confidence and data provenance.** Every narrative carries a data completeness score — the percentage of data sources that were available and fresh when the narrative was generated. Sources that contributed are listed; sources that failed or returned stale data are listed with staleness duration. When data is incomplete, the narrative text itself contains hedging: "Build appears to have completed (Temporal reports success; gateway data unavailable for independent confirmation)." Narratives generated from degraded data display with a Navy border (not Gold), visually distinct from full-confidence narratives. The narrative never presents partial-data interpretations with the same confidence as full-data facts.

**Causal claims in narratives.** The narrative may assert causal relationships ("the Build failed because the Design chose X"). These claims are derived from causal edges in the graph (see Causal Tracing below), not inferred by the LLM. If no causal edge exists for a relationship, the narrative says "after" (temporal), not "because" (causal). This is the operational equivalent of PRI-01's verbatim fidelity — the narrative reports what the data says, it does not interpret beyond it.

**Narrative caching.** Narratives for archived experiments are cached after first generation — the underlying data will not change. Active experiment narratives are always generated fresh. Proactive intelligence narratives use Sonnet (not Opus) — operational prose, not interpretive analysis. This bounds the narrative generation cost (see Topology Cost Budget below).

Narratives are also available via MCP (`topology_narrate`) for AI consumers — an operator agent can request a narrative to include in a stakeholder email or weekly digest.

### Causal Tracing

Not just "what depends on what" but "why did this happen?"

Every node in the topology carries forward references (what it produced) and backward references (what informed it). Causal tracing follows these chains:

- **From symptom to cause.** Click a Sentry error on a deployed component. The topology traces: error in `schedule/page.tsx` → built by frontend-engineer agent in Build stage → implemented from `unified-spec.md` section 4.2 → that section was the Mediator's resolution of a conflict between Product Design (who wanted a list view) and Visual Design (who wanted a card grid) → the Mediator chose cards based on Research finding about mobile usability. The full causal chain, navigable.
- **From decision to consequence.** Click a Design decision. The topology traces forward: decision → which Build artifacts it shaped → which Validate gates tested it → which components in production implement it → their current health metrics. "What happened because of this choice?"
- **From cost to reason.** Click a cost anomaly. The topology traces: expensive Build stage → agent session used Opus instead of Sonnet → role prompt specified Opus because the workflow template was "Full Autonomous Build" with premium model selection → staff chose premium because this was the Convocation site (high-stakes). The cost is explained, not just measured.

Implementation: causal edges are a subtype of data-flow edges, enriched with `causal_context` in the edge properties. The orchestrator writes these as stages hand off artifacts. The `topology_trace` MCP tool follows causal chains in either direction.

**Causal chain integrity.** Causal edges may be missing (orchestrator crash between stage completion and edge creation) or wrong (the orchestrator attributes a Build decision to a Design choice that wasn't actually determinative). The topology handles this:
- **Missing edges:** When a causal trace encounters a gap (no edge connecting two nodes that should be linked), it renders the gap explicitly: "Causal link missing between Design and Build — data unavailable." Never fabricates a connection.
- **Chain confidence:** Each hop in a causal chain carries the edge's confidence level. A 5-hop chain where one hop is uncertain is presented as uncertain overall: "Possible cause (3 of 5 links confirmed)."
- **Manual change gaps:** When a human made a manual change that isn't represented in the graph (e.g., edited code directly on the experiment branch), the causal chain shows the gap: "Manual change detected (git commit without agent session) — causal context unknown."

### FTR Traceability — Bidirectional Specification

Every node in the graph carries an `ftr` association — the FTR(s) that govern it. This is bidirectional:

**Node → Specification.** Click any node to see which FTR specified it, which PRIs constrain it, the FTR's current state. A staff member asks: "Why does this service exist?" The graph answers with a link to the governing FTR.

**Specification → Nodes.** Browse from the FTR side. Open FTR-003 (performance budgets) and see every component governed by it, colored by compliance status. "Is PRI-05 being honored?" becomes a visual query — the topology highlights every node with a global-first constraint, colored by current metrics against the PRI-05 thresholds. The specification becomes a lens through which to view the architecture.

**Compliance heat map.** Select a PRI from a dropdown. The entire topology recolors: Gold for compliant, Navy for attention needed, dimmed for not applicable. PRI-01 (verbatim fidelity): content-facing components light up. PRI-07 (accessibility): every page component shows its axe-core status. PRI-09 (DELTA): components with analytics integration show their compliance.

Implementation: build-manifest.json (FTR-170) includes `ftr_refs` per file/component. Services carry FTR tags in platform config. The `topology_ftr_map` MCP tool queries both directions. The compliance heat map is a client-side filter that recolors existing nodes.

### Real-Time Metrics Overlay

Each node carries a health indicator and key metrics, updated via WebSocket or SSE:

| Node Type | Metrics Shown | Source |
|-----------|--------------|--------|
| Experiment | Status, elapsed time, running cost, current stage | Temporal Query API |
| Stage | Duration, token count, agent count, gate status | Temporal Activity state + gateway |
| Agent session | Model, tokens used, confidence, skills invoked | Gateway + session log |
| Service (Neon) | Connection count, query latency P95, storage | Neon API |
| Service (Vercel) | Deploy status, edge latency, error rate | Vercel API |
| Service (Bedrock) | Request rate, throttle events, latency | Gateway metrics |
| Validation gate | Pass/fail/warning, finding count, confidence | Gate results JSON |
| Component (page) | Error count, LCP, CLS, traffic | New Relic + Sentry |
| API endpoint | Request rate, latency P95, error rate | New Relic |

Metrics degrade gracefully — if a source is unavailable, the node shows stale data with a timestamp, not an error.

### AI Session and Prompt Audit

Every agent session is a browsable node. Expanding it shows:

- The role prompt that configured the agent
- Skills loaded (from both pools per FTR-177)
- Trust level at execution time
- Full session transcript (collapsible, searchable)
- Artifacts produced (with diff view against previous stage's input)
- Decisions made (from Lore protocol commits per FTR-169)
- Token usage timeline (when did the session consume tokens — front-loaded or iterative?)

This serves audit: "Why did the Build agent make this architectural choice?" Trace from deployed component → build stage → agent session → specific reasoning in transcript.

### Cost Topology

Cost flows through the graph like water. Every node shows its own cost and its children's aggregate cost. The graph renders cost as visual weight — higher-cost nodes are visually larger or warmer-colored.

**Cost drill-down:** Organization ($385/month) → Project ($127.40) → Experiment ($4.20) → Stage ($1.82 research, $0.45 design, $1.12 build, $0.81 validate) → Agent session ($0.56 for frontend-engineer using Sonnet).

**Full vendor cost roll-up.** The topology's Level 1 (Organization) shows all IT costs, not just LLM tokens. Service nodes carry their own cost attribution:

| Service Node | Cost Source | Attribution |
|-------------|-----------|------------|
| AWS Bedrock (Claude) | Gateway token tracking (FTR-174) | Per-experiment, per-agent, per-model |
| AWS Bedrock (Voyage AI) | Bedrock billing API | Per-embedding batch |
| AWS Lambda | CloudWatch / Cost Explorer API | Per-invocation (enrichment, graph pipeline) |
| AWS SES | SES billing | Per-notification |
| AWS Secrets Manager | Fixed monthly | Platform infrastructure |
| Neon PostgreSQL | Neon billing API | Per-project (Scale tier) |
| Vercel | Vercel billing API | Per-project (Pro tier) |
| Contentful | Fixed monthly | Community tier |
| Temporal Cloud | Temporal billing API | Per-workflow execution |
| Sentry | Fixed monthly | Per-event overage if applicable |
| New Relic | Fixed monthly | Per-host/per-event |
| Auth0 | Fixed monthly | Per-MAU when active (M7a+) |
| GitHub | Free tier | No cost attribution needed |

Fixed-cost services (Contentful, Sentry, New Relic, Auth0, Secrets Manager) appear as flat-rate nodes. Variable-cost services (Bedrock, Lambda, SES, Neon, Vercel, Temporal) show actual usage-based cost. The organization-level roll-up is the unified IT spend dashboard — one surface that answers "Where is every dollar going?"

**Cost anomaly highlighting:** Nodes whose cost exceeds 2x the historical average for their type are visually flagged. The AI operator agent can explain why.

Data sources: FTR-174's gateway (LLM tokens), AWS Cost Explorer API (Lambda, SES, Secrets Manager), vendor billing APIs (Neon, Vercel, Temporal Cloud), fixed-cost records in platform config.

### Natural Language as Primary Interface

The graph is the answer surface. The question is human language.

A search/query bar at the top of the topology accepts natural language:

- **"Which experiments exceeded budget this month?"** — The topology highlights relevant experiment nodes, dims everything else, shows cost overflow on each.
- **"Why is the Convocation project expensive?"** — The graph zooms to the project, highlights cost-heavy stages, the AI operator narrates the explanation in a sidebar panel.
- **"Show me everything governed by PRI-01."** — The compliance heat map activates for PRI-01 across the entire topology.
- **"What happened between 2pm and 3pm yesterday?"** — The time slider moves to that window, the topology replays, changed nodes are highlighted.
- **"Compare the last two Proof of Concept experiments."** — Both experiment subgraphs render side by side with diff annotations (cost difference, quality difference, stage duration differences).

The AI operator agent translates natural language to topology queries (`topology_query`, `topology_trace`, `topology_ftr_map`), executes them, and renders the results as graph highlights + narrative sidebar. The staff member never writes a query — they ask a question and the topology answers.

**Query classification — mirror, not oracle.** The natural language interface classifies every query into three types:
- **Factual** (answerable from graph data): "What did this cost?" "Which experiments are active?" → Direct answer.
- **Analytical** (derivable from graph patterns): "Which template is most cost-effective?" → Answer with explicit caveat: "Based on 18 experiments, correlation not causation."
- **Advisory** (requires human judgment): "Should I use Opus or Sonnet?" "Will this experiment succeed?" → Redirect: "This question involves strategic judgment. Here is the relevant data: [factual summary]. The decision is yours."

The topology is a mirror (shows what is), not an oracle (tells what should be). Advisory queries are never answered with advisory prose — they are redirected to the human with supporting data. This preserves PRI-12's division: "The human principal directs strategy, stakeholder decisions, and editorial judgment."

**Direct-manipulation fallbacks.** If the AI operator agent is unavailable (Bedrock outage), the natural language bar is disabled. Direct-manipulation controls remain functional: filter by node type (dropdown), filter by status (toggle), filter by date range (picker), sort experiments (column headers in list view). Natural language is an accelerator, not a gatekeeper.

This is PRI-12 (AI-native operations) in its purest form: the human provides intent, the AI provides the operational intelligence, the topology provides the shared visual language.

### Collaborative Annotation

IT staff and approved reviewers can pin notes to any node:

- "This service is being evaluated for replacement — see FTR-004 § Tier 2"
- "Cost spike here was due to one-time dual-platform research phase, not recurring"
- "Known false positive on accessibility gate for SVG decorative images"
- "Sister Meera's first experiment — good candidate for onboarding case study"

Annotations carry author attribution and timestamps. They are the human layer on top of the machine-generated topology — institutional wisdom that no algorithm produces.

**Annotation lifecycle.** Annotations have a mandatory expiry (default 90 days, configurable at creation). Expired annotations enter a "stale" state — visible but visually dimmed, excluded from AI narrative generation unless explicitly refreshed. Annotations on archived experiments auto-collapse (visible on expand, not by default). An "active annotations" filter shows only annotations on non-archived nodes.

**Conflicting annotations.** When two annotations on the same node disagree, the AI operator agent never silently chooses between them. It surfaces the conflict: "Two annotations on this node disagree — [Author A] says X, [Author B] says Y." Conflicting annotations trigger a resolution notification to both authors.

Annotations are queryable: "Show me all annotated nodes" highlights them. The AI operator agent reads non-stale annotations as context when generating narratives or suggestions.

### AI Operational Intelligence

An AI operator agent has MCP access to the full topology graph. It provides:

**Reactive intelligence (on query):**
- "Why is this experiment expensive?" → Traces cost to specific agent sessions and model choices
- "What's the healthiest path to deploy?" → Evaluates gate results, error rates, performance scores
- "Show me all components governed by PRI-01" → FTR-traceability query across the graph

**Proactive intelligence (periodic analysis):**
- **Model optimization:** "The Build stage uses Opus but historical data shows Sonnet produces equivalent quality at 4x lower cost for this workflow template. Suggest downgrade."
- **Log filtering:** "Sentry is capturing 200 duplicate errors from the same root cause. Suggest grouping rule."
- **Latency opportunity:** "API route `/api/v1/search` P95 is 800ms. The Neon query accounts for 600ms. Index on `chunks.language` would reduce to ~200ms."
- **Underutilized services:** "The Competitive Analyst agent role has been used in 2 of 18 experiments. Either remove from default workflow or investigate why it's skipped."
- **Efficiency measures:** "Experiments using the 'Proof of Concept' template complete 3x faster at 50% cost with only 0.4-point quality reduction. Recommend as default for first-time staff."

Proactive insights are surfaced in the institutional learning feed (FTR-174) and on the topology surface as annotation badges on relevant nodes.

### New MCP Tools

```
topology_query       — Graph query: nodes by type, edges by relationship, metrics by node
topology_at          — Graph state at a specific timestamp (time travel)
topology_path        — Trace path between two nodes (e.g., experiment → component)
topology_trace       — Causal chain: follow cause → consequence or symptom → cause
topology_cost_tree   — Cost roll-up from any node to its descendants
topology_health      — Aggregate health score for any subtree
topology_anomalies   — Nodes with metrics outside historical norms
topology_ftr_map     — All nodes governed by a specific FTR or PRI (bidirectional)
topology_narrate     — Generate plain-language narrative for any subtree
topology_compare     — Side-by-side diff of two subtrees (experiments, epochs, templates)
topology_suggest     — AI operational intelligence: optimization suggestions for a subtree
topology_annotate    — Add/read/search human annotations on nodes
```

### Data Model

The topology is a property graph stored alongside platform data in Neon. Not a separate graph database — the scale (hundreds of nodes, not millions) doesn't warrant it. PostgreSQL with JSONB node/edge properties is sufficient.

```sql
-- Core topology tables
CREATE TABLE topology_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_type TEXT NOT NULL,        -- 'experiment', 'stage', 'service', etc.
  external_id TEXT,               -- Temporal workflow ID, Vercel deployment ID, etc.
  label TEXT NOT NULL,
  properties JSONB DEFAULT '{}',  -- Type-specific metadata
  ftr_refs INTEGER[],             -- Governing FTR numbers
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE topology_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES topology_nodes(id),
  target_id UUID REFERENCES topology_nodes(id),
  edge_type TEXT NOT NULL,        -- 'contains', 'depends-on', 'data-flow', etc.
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Real-time metrics (append-only, aggregated for display)
CREATE TABLE topology_metrics (
  node_id UUID REFERENCES topology_nodes(id),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_topology_metrics_node_time ON topology_metrics (node_id, recorded_at DESC);
```

Nodes are created by the orchestrator (FTR-170) as experiments progress. Service nodes are seeded from platform config. Component nodes are generated from build-manifest.json after the Build stage. Metrics flow from the gateway (FTR-174), Temporal, and observability APIs.

### Rendering Technology

**Graph view:** Client-side using a force-directed or hierarchical layout library. Candidates: D3.js (maximum control, proven at scale), Cytoscape.js (graph-native, good for property graphs), React Flow (React-native, good for DAG visualization).

Selection criteria: must support continuous zoom, semantic level-of-detail (show/hide nodes by zoom), real-time metric updates, click-to-expand, and ARIA-annotated SVG output.

**List view:** Standard React table/list components with full keyboard navigation, ARIA live regions for status changes, screen reader support. The list view is the accessible foundation; the graph view is the visual enhancement.

**Mobile view:** Narrative-first. Platform Pulse as the default mobile view. Experiment list with status indicators (expandable to show stages). Natural language bar (works well on mobile as primary interaction). Graph view available but explicitly labeled "Best on desktop" — not blocked, honestly positioned. Touch targets: 44×44px minimum per PRI-07.

**Progressive disclosure model:**
- **Default view:** Platform Pulse + experiment list. No visible controls beyond search/filter.
- **Power bar (collapsed by default):** Natural language query, time travel slider, compliance dropdown, view toggle (Graph | List). Expandable via a single "Tools" toggle.
- **Context menus (on node/row click):** Narrative, causal trace, annotations, FTR links. Shown per-item, not as global controls.
- **Phase gating:** Capabilities that don't exist yet simply don't appear in the UI. No "coming soon" placeholders.

The topology page lives at `yogananda.tech/ops/topology` — part of the ops dashboard, not a separate application.

### Degraded Mode Specification

The topology depends on 7 data sources (Temporal, Neon, Sentry, New Relic, Vercel, LLM Gateway, GitHub). The probability that all are simultaneously available is lower than the probability that any single source is available. The topology must handle degradation with the same rigor that FTR-172 applies to its three-valued gate semantics.

**Aggregate freshness indicator.** A persistent indicator shows: "5/7 sources live" with a freshness bar. When aggregate freshness drops below 70% (5 of 7 sources fresh within 60 seconds), the entire topology shifts to **degraded visual mode** — dimmed background, Navy banner: "Showing data from [timestamp] — sources unavailable: Sentry, New Relic." Never render a degraded topology with the same visual confidence as a healthy one.

**Degradation hierarchy:**
1. **Single source unavailable:** Node-level stale indicators. Topology fully functional.
2. **Multiple sources unavailable (3+ of 7):** Degraded mode banner. Narratives include data completeness caveat. AI suggestions suspended (insufficient data for reliable analysis).
3. **Neon unavailable (graph database itself):** Topology cannot render. Fall back to FTR-174's flat ops dashboard (experiment status table, cost summary). Banner: "Topology unavailable — showing basic status from [fallback source]."
4. **Bedrock unavailable (AI operator agent):** Natural language bar disabled. Direct-manipulation controls active. Narratives unavailable. Graph and list views still render from cached/stale data.

**The topology is never the sole diagnostic tool.** FTR-174's glass box surfaces (ops dashboard, experiment detail view, institutional learning feed) must remain independently functional without the topology. The topology is an enhancement layer over FTR-174's data surfaces, not a replacement. Progressive enhancement applied to the ops layer: HTML table is the foundation, topology graph is the enhancement.

### Access Control

The topology serves multiple audiences with different information needs and different appropriate visibility:

| Content | Who Can See | Why |
|---------|------------|-----|
| Platform Pulse, experiment status | All authenticated ops users | Basic operational awareness |
| Cost data (per-experiment) | Experiment requester, IT, executive | Cost is not sensitive per-experiment |
| Cost data (cross-project aggregate) | IT, executive | Organizational budget visibility |
| Agent session transcripts | IT only | Transcripts contain AI reasoning that may include rejected alternatives, internal architectural discussion |
| Annotations | All ops users (read), IT + approved reviewers (write) | Annotations are institutional context; writing requires accountability |
| AI operational suggestions | IT only | Suggestions may reference sensitive cost/performance data |
| Natural language (full) | IT | Unrestricted graph queries |
| Natural language (scoped) | Staff | Queries scoped to their own experiments |

Implementation: access control uses the platform's existing role model (FTR-168 Trust Graduation Framework adapted for human roles: staff, IT, executive). The topology API enforces scoping — a staff member's `topology_query` automatically filters to experiments they created or are reviewing. IT sees everything. Executive sees aggregate + cost.

### Ingestion Contracts

The topology is a presentation layer over data produced by FTR-169, FTR-170, FTR-172, and FTR-174. Each dependency FTR must emit topology events at defined lifecycle points. This is a formal interface, not an informal expectation.

**TopologyEventEmitter contract:**

| Source FTR | Event | Trigger | Topology Action |
|-----------|-------|---------|-----------------|
| FTR-170 | `stage_started` | Temporal Activity begins | Create stage node, `contains` edge from experiment |
| FTR-170 | `stage_completed` | Temporal Activity completes | Update stage node metrics, create `data-flow` edges for artifact handoffs |
| FTR-170 | `agent_session_started` | Claude Code SDK session begins | Create agent-session node with role, model, skills |
| FTR-170 | `agent_session_completed` | Session ends | Update node with token usage, confidence, artifacts |
| FTR-169 | `experiment_state_changed` | State machine transition | Update experiment node status, record transition in metrics |
| FTR-169 | `lore_commit` | Lore protocol commit | Create decision edge with causal_context |
| FTR-172 | `gate_evaluated` | Validation gate completes | Create gate node with verdict, findings, confidence |
| FTR-174 | `cost_recorded` | Gateway token event | Append to topology_metrics for the relevant agent-session node |
| FTR-174 | `budget_threshold` | Budget alert fires | Update experiment node properties with budget state |

Each event includes: `node_id` (or enough context to resolve it), `event_type`, `timestamp`, `properties` (JSONB). The topology service consumes these events and maintains graph consistency. If an event is lost (crash between source system and topology), the hourly reconciliation detects and repairs the gap.

### Topology Cost Budget

The topology's own operational cost must be visible, bounded, and justified.

**Cost drivers:**
- Narrative generation: ~$0.04/narrative at Sonnet pricing (20K tokens input, 1K output). At 10 narratives/day: ~$12/month.
- Proactive intelligence: weekly analysis across the full graph. ~$0.50/analysis at Sonnet. ~$2/month.
- Metric aggregation compute: minimal (PostgreSQL aggregation queries).
- WebSocket/SSE infrastructure: included in Vercel Pro tier.
- Storage: topology tables grow ~50MB/month at moderate scale. Negligible on Neon Scale tier.

**Estimated topology cost: $15-20/month** — approximately 5-7% of a $285/month platform. This is acceptable. If narrative generation shifts to Opus, cost rises to ~$100/month (35%) — not justified for operational prose. Sonnet is the default; Opus available as override for complex experiments.

**Self-reporting:** The topology reports its own cost as a visible node in the topology itself. The meta-transparency: the monitoring tool shows you what it costs to monitor.

### Metrics Retention Architecture

The `topology_metrics` table is append-only. Without retention management, it grows unboundedly.

**Two-tier retention:**
- **Raw metrics** (per-event granularity): retained 30 days. Used for real-time display and recent time travel.
- **Aggregated metrics** (1-minute averages): computed by a scheduled job, retained indefinitely. Used for time travel beyond 30 days and trend analysis.

Time travel within 30 days shows full granularity. Time travel beyond 30 days shows 1-minute aggregates — slightly less detailed but sufficient for historical exploration. The UI indicates the granularity level: "Showing 1-minute averages (detail available for last 30 days)."

**Storage growth estimate at 100 experiments/month:** ~40K raw metric rows/month (deleted after 30 days, so steady state ~40K rows), ~2K aggregate rows/month (growing indefinitely). After 3 years: ~72K aggregate rows. PostgreSQL handles this trivially. Composite index on `(node_id, recorded_at)` covers the hot path. Monitor at 500K total rows; evaluate quarterly partitioning if needed.

### DELTA Compliance (PRI-09)

The topology tracks what the *platform* does — experiments, agents, services, costs. It never tracks what *seekers* do. No user behavior data flows into the topology. Agent session transcripts record AI reasoning, not human interaction. The topology is an infrastructure map, not a user map.

**Staff activity in annotations.** Annotations carry author attribution — this is staff operational activity, not seeker behavior. DELTA's prohibition on "user identification, session tracking, behavioral profiling" applies to seekers using the teachings portal. Staff operating the platform are identified by role as a matter of accountability, not surveillance. This distinction must be explicit: DELTA protects seekers; operational accountability applies to staff. Annotations are audit artifacts, not behavioral profiles.

## Edge Cases

- **Stale metrics from unavailable source.** New Relic is down — component-level latency metrics go stale. The topology shows the last-known value with a "stale since" timestamp and visual dimming. Nodes don't disappear; they degrade.
- **Topology graph too large to render.** At 100+ experiments with full component graphs, the visualization could have thousands of nodes. Level-of-detail culling: at zoom levels 1-3, component-level nodes are hidden. They appear only when zoomed to level 4-5 within a specific experiment. Server-side aggregation sends only the visible subtree.
- **Conflicting FTR associations.** A component is governed by both FTR-003 (performance budgets) and FTR-007 (editorial proximity). Both are valid. The node shows all associations — FTR traceability is additive, not exclusive.
- **AI suggestion contradicts human preference.** The AI operator suggests downgrading from Opus to Sonnet for Build, but the staff member chose Opus intentionally for quality. Suggestions are advisory, never automatic. They appear as badges, not actions. Staff dismiss or accept.
- **Topology data drift from reality.** An experiment's Vercel deployment is manually deleted, but the topology still shows it as a node. The topology must reconcile with source systems periodically (hourly). Orphaned nodes are flagged for cleanup, not silently removed.
- **Narrative generation for incomplete experiments.** An experiment is mid-Build when staff requests a narrative. The narrative tells the story so far — "Research completed, Design resolved 2 conflicts, Build is currently 60% through with $1.12 spent" — and notes what's pending. The narrative is a living document for active experiments, a complete story for archived ones.
- **Causal chain crosses experiment boundaries.** A promoted experiment's component has a production error. The causal chain traces back to a Design decision — but the experiment is archived. The topology must traverse across active and archived experiments seamlessly. Archived experiments are dimmed but navigable.
- **Time travel to before the topology existed.** The topology service starts in Phase 3. Staff asks "Show me January" when the topology launched in March. The surface shows "No topology data before [launch date]" with a link to the git history for that period. Honest absence.
- **Natural language query is ambiguous.** "Show me the expensive ones." Expensive experiments? Expensive stages? Expensive agents? The AI operator asks a clarifying question in the sidebar: "Did you mean experiments that exceeded budget, or stages with above-average cost?" Two clickable options. Never guesses.

## Error Cases

- **Graph query returns inconsistent state.** The orchestrator created a stage node but the edge connecting it to the experiment is missing (crash between two writes). The topology query must handle orphaned nodes gracefully — show them with a warning indicator, don't crash the visualization.
- **Real-time metrics flood.** A Build stage with high token throughput sends hundreds of metric updates per second. The metrics table grows rapidly. Mitigation: client-side throttling (update display at most once per second), server-side aggregation (store 1-minute averages, not raw events), retention policy (raw metrics deleted after 30 days, aggregates kept indefinitely).
- **AI operational intelligence suggests harmful change.** The AI operator suggests removing a validation gate that "never catches anything" — but it's a security gate that's working correctly by not finding violations. Suggestions carry a risk category (cost, performance, quality, security). Security-category suggestions require IT lead approval, not staff dismissal.
- **Circular edge in topology.** A misconfigured data-flow edge creates a cycle (component A calls API B which queries table C which triggers webhook to component A). The topology renderer must handle cycles without infinite loops — detect and render cycles with a visual indicator, don't follow them recursively.

## Notes

Full context: `docs/plans/ftr-168-ai-agent-platform.md` sections 21 (Glass Box Surfaces), 5 (Platform Integration).

This FTR absorbs and replaces the "Operations Visualization (Phase 5 Aspiration)" section in FTR-174. FTR-174 remains the data layer (gateway, cost tracking, budget enforcement). FTR-178 is the presentation and intelligence layer — the surface through which both humans and AI reason about the platform.

**The topology is an architecture diagram that is alive.** A static diagram shows what the system was designed to be. The topology shows what the system *is* — right now, with real metrics, real costs, real health. And because of time travel, it shows what the system *was* — institutional memory you can navigate spatially.

**Eight capabilities that make this world-class:**
1. **Platform Pulse** — The front door is a calm summary, not a graph. 30-second orientation for any audience.
2. **Calm design language** — PRI-03/PRI-08 applied to infrastructure visibility. Gold for health, Navy for attention, stillness as default.
3. **Parallel list view** — Accessibility is not a fallback. Screen reader users get a first-class list; mobile users get narrative-first. The graph is an enhancement.
4. **Time travel** — Scrub through history. Watch experiments unfold. Compare epochs. The temporal dimension transforms monitoring into memory.
5. **Narrative generation with provenance** — Click any experiment, get a story with data completeness score. Staff who can't read metrics can read narratives. The topology speaks human — honestly.
6. **Causal tracing with integrity** — From any symptom, trace causes. From any decision, trace consequences. Missing links are shown as gaps, not fabricated. Chain confidence is explicit.
7. **Natural language as mirror, not oracle** — Ask questions, get factual answers. Advisory queries are redirected to the human with supporting data. Direct-manipulation fallbacks when AI is unavailable.
8. **Bidirectional FTR traceability** — Every component links to its spec. Every spec links to its components. The architecture is legible as both infrastructure and intention.

**Relationship to FTR-168–177:**
- FTR-169 (Experiment Lifecycle): experiment nodes, state transitions, Lore protocol decisions
- FTR-170 (Workflow Orchestration): DAG stages, fan-out visualization, Temporal workflow state
- FTR-171 (Agent Role Registry): agent session nodes with role, model, trust level, skills
- FTR-172 (Validation Gates): gate nodes with pass/fail/warning, finding counts, confidence
- FTR-173 (Comparative Analysis): comparative overlays, A/B experiment diff rendering
- FTR-174 (Glass Box Operations): cost data, budget state, gateway metrics — the data layer
- FTR-175 (Deep Research): research stage visualization, dual-platform synthesis nodes
- FTR-176 (Staff Empowerment): narrative generation serves the same audience; topology is the power-user complement to the simplified review interfaces
- FTR-177 (Skill Ecosystem): skill invocations visible in agent session detail; protocol skill outputs visible as structured artifacts

**Phase recommendation:**
- **Phase 3 (MVP):** Levels 1-3 (organization → project → experiment) with cost and status overlays. Static graph, no time travel. Basic click-to-expand.
- **Phase 4 (Intelligence):** Time travel. Narrative generation. Natural language interface. AI operational intelligence. Levels 4-5.
- **Phase 5 (Maturity):** Causal tracing. Comparative overlays. Collaborative annotation. Compliance heat maps. Full bidirectional FTR traceability. Sound design (optional ambient awareness).
