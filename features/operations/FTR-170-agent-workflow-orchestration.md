---
ftr: 170
title: "Agent Workflow Orchestration Engine"
summary: "DAG-based workflow engine using Claude Code SDK as universal substrate for all stages"
state: proposed
domain: operations
governed-by: [PRI-12, PRI-10]
depends-on: [FTR-168, FTR-169]
re-evaluate-at: M3d boundary
---

# FTR-170: Agent Workflow Orchestration Engine

## Rationale

Agent workflows are directed acyclic graphs (DAGs) of stages. Each stage runs one or more agents. Stages can fan out (parallel) and fan in (merge). The platform provides templates; staff can modify or create new ones.

The key insight: Claude Code SDK is the natural substrate for **every** stage, not just build. Each stage is fundamentally an AI agent reading context, reasoning, and producing artifacts. This simplifies the orchestrator to: spawn session, pass role + skills + context, collect artifacts, check gates, advance.

## Specification

### DAG Pipeline

```
TRIGGER → RESEARCH → DESIGN → MEDIATION → BUILD → VALIDATE → DEPLOY → NOTIFY
```

Each stage configurable: enabled/disabled, agent roles, model selection, fan pattern (sequential, parallel, merge), validation gates.

### Claude Code as Universal Substrate

Every stage runs as a Claude Code SDK session with:
- Role-specific system prompt (from agent role registry, FTR-171)
- Skill set (from skill-environments.json)
- MCP server access (Platform MCP, Neon MCP, etc.)
- File system access to the experiment repo

Model selection per stage: Opus for research/design/mediation, Sonnet for build/validate, Haiku for deploy/notify. Staff can override any.

### Configuration Format

JSONC (not YAML). Primary reader/writer is an AI agent — LLMs produce valid JSON more reliably than any other structured format. YAML indentation is the #1 source of AI-generated config errors. Zod schemas validate at parse time.

### Workflow Templates

Stored in platform, selectable from ops dashboard. Staff can fork existing templates, create custom ones. Templates are organizational assets.

### New MCP Tools

```
workflow_list, workflow_describe, workflow_run, workflow_status
```

### Mandatory Design-Approval Gate

A human checkpoint is required after the Design stage, before Build begins. This is the most fundamental protection: if staff can't specify what they want (or the design agents misinterpret the prompt), the pipeline burns compute building the wrong thing. The gate shows: design summary, wireframes, architecture decisions, estimated build cost. Staff approves, revises, or cancels.

### Durable Execution Layer

Every other FTR in this set assumes durable execution works. FTR-169's transactional resource creation needs compensating transactions on failure. FTR-172's triple-run voting needs 27 LLM calls to complete reliably. FTR-174's budget circuit breakers need to pause and resume experiments. Stage timeouts, fan-out failure policies, the 72-hour design-approval gate — all require reliable workflow state that survives crashes. This is the foundation they all stand on.

**Why durable execution is non-optional (not just "nice to have"):**

Without it, a crash mid-Build means: $2-10 in tokens wasted, experiment in inconsistent state (some resources provisioned, others not), no way to resume — must restart from scratch. At 10+ experiments/month with a 5% crash rate, that's $10-50/month in wasted compute plus manual cleanup. The durable execution layer's cost pays for itself immediately through crash recovery alone.

**PostgreSQL-native orchestration (not a new vendor).** The platform already runs Neon PostgreSQL. A state-machine table in the existing database replaces the need for Temporal Cloud, Inngest, or any external orchestration vendor. Claude Code SDK executes within each stage ("run this AI agent with these tools"). The orchestrator is a TypeScript service that reads the state machine and dispatches Claude Code sessions.

**Core table: `workflow_executions`**

```sql
CREATE TABLE workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES experiments(id),
  current_stage TEXT NOT NULL,
  stage_state JSONB DEFAULT '{}',       -- checkpoint data per stage
  status TEXT NOT NULL DEFAULT 'running' -- running, paused, completed, failed, budget_exceeded
    CHECK (status IN ('running', 'paused', 'completed', 'failed', 'budget_exceeded')),
  awaiting_signal TEXT,                  -- 'design_approval', 'budget_increase', null
  signal_deadline TIMESTAMPTZ,           -- e.g. 72 hours from design completion
  provisions JSONB DEFAULT '[]',         -- saga: resources created (for compensating cleanup)
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  started_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_workflow_status ON workflow_executions(status) WHERE status IN ('running', 'paused');
CREATE INDEX idx_workflow_signal ON workflow_executions(awaiting_signal) WHERE awaiting_signal IS NOT NULL;
```

**Platform concepts mapped to PostgreSQL patterns:**

| Platform Concept | PostgreSQL Pattern | How It Works |
|-----------------|-------------------|-------------|
| **Experiment pipeline** | Row in `workflow_executions` | One row per experiment. `current_stage` + `stage_state` JSONB = full checkpoint. Survives crashes by definition (it's a database row). |
| **Stage (Research, Build, etc.)** | State machine transition | Orchestrator reads `current_stage`, dispatches Claude Code SDK session, writes result to `stage_state`, advances `current_stage`. On failure, increments `retry_count`; if < `max_retries`, retries with backoff. |
| **Fan-out (3 parallel design agents)** | `Promise.allSettled()` | Orchestrator spawns 3 parallel Claude Code sessions. Collects results. Resolution policy (require_all, require_majority, require_any) applied in TypeScript. Stage result written to `stage_state` atomically. |
| **Design-approval gate** | `awaiting_signal` + `signal_deadline` | Orchestrator sets `awaiting_signal = 'design_approval'`, `signal_deadline = now() + 72h`. Sends email. A scheduled Lambda checks for expired deadlines and transitions to `design_awaiting_review`. Staff approval clears the signal via API. |
| **Stage timeout** | Application-level timeout | `Promise.race([stageExecution, timeout(stageConfig.timeout)])`. On timeout, stage enters `timed_out` in `stage_state`. Orchestrator applies retry or escalation policy. |
| **TTL / garbage collection** | Scheduled Lambda | Lambda runs daily, queries experiments past TTL (30 days). Triggers cleanup: delete Neon branch, archive repo, clear DNS. Reads `provisions` JSONB for resource inventory. |
| **Budget circuit breaker** | Status transition | Gateway (FTR-174) detects budget exceeded → updates `status = 'budget_exceeded'`. Orchestrator checks status before dispatching any stage. Staff increases budget → API sets `status = 'running'`. |
| **Transactional resource creation** | `provisions` JSONB (saga) | `experiment_create` provisions resources sequentially: GitHub repo → Neon branch → Vercel deployment. Each successful provision appended to `provisions` array. If any step fails, iterate `provisions` in reverse order and delete each. Reliable cleanup from the resource inventory. |
| **Escalation timeout** | `awaiting_signal` + `signal_deadline` | Same pattern as design-approval. `escalate` (FTR-177) sets `awaiting_signal = 'human_decision'`. Scheduled Lambda checks deadlines. |
| **Crash recovery** | Orchestrator restart | On startup, orchestrator queries `WHERE status = 'running'`. For each, reads `current_stage` + `stage_state` and resumes. Work already committed to git (Build agents checkpoint via commits) is preserved. |
| **Experiment state** | Direct SQL query | Ops dashboard queries `workflow_executions` directly. No separate state API needed. The database IS the state. |

**Why PostgreSQL-native (not Temporal or Inngest):**

| Dimension | PostgreSQL-native | Temporal Cloud |
|-----------|------------------|----------------|
| **New vendor** | None — uses existing Neon | Yes — new vendor, new billing, new SLA dependency |
| **Cost at project scale** | $0 incremental (existing database) | ~$100/month minimum ($25 retention + actions) for < $1 of actual work |
| **Operational complexity** | Zero new infrastructure | Temporal Cloud dashboard, SDK, worker deployment |
| **State visibility** | SQL queries — already understood by the team | Temporal UI + Query API — new tooling to learn |
| **Fan-out** | `Promise.allSettled()` — standard TypeScript | Child Workflows — Temporal-specific abstraction |
| **Human approval** | DB flag + email notification — trivial | Signals + Timers — powerful but over-engineered for this scale |
| **Saga cleanup** | JSONB provisions list + reverse iteration | Native compensating Activities — elegant but not needed at this scale |
| **PRI-10 (10-year horizon)** | PostgreSQL is the most durable technology in the stack | Temporal SDK locks orchestration to a vendor API |
| **Scale threshold** | Comfortable to ~50 experiments/month | Justified at 100+ experiments/month with complex fan-out |

**When to reconsider.** If experiment volume exceeds 50/month, or if fan-out patterns become deeply nested (fan-out within fan-out), or if the scheduled-Lambda pattern for deadline checking proves unreliable — re-evaluate Temporal. The Activity boundary is preserved: each stage is a Claude Code SDK session regardless of whether a PostgreSQL row or a Temporal Workflow dispatches it. Migration path is clean because the business logic (agent sessions) is decoupled from the orchestration mechanism.

### MCP Fallbacks (10-Year Architecture)

MCP is the primary tool protocol but has longevity concerns (Gemini Prompt 2: lacks IDL, ignores 40 years of RPC best practices). Design for MCP as primary but maintain REST/GraphQL fallbacks at every boundary. Never couple business logic to MCP-specific APIs. Standard protocols (REST, OAuth, SQL, HTTP) at every integration point per PRI-10.

### Inter-Stage Data Contracts

Agents communicate via artifact files in the experiment repo, not direct messaging. But "artifact files" must have defined schemas — otherwise the Build stage doesn't know what the Design stage produced.

**Required artifacts per stage:**

| Stage | Produces | Format | Consumed By |
|-------|----------|--------|-------------|
| Research | `research-synthesis.md`, `research-gaps.json` | Markdown + structured JSON | Design |
| Design | `unified-spec.md`, `architecture.json`, `component-inventory.json` | Markdown + structured JSON | Build, Validate |
| Mediation | `unified-spec.md` (merged), `conflict-resolutions.json` | Markdown + structured JSON | Build |
| Build | Source code + `build-manifest.json` (files created, tests added, dependencies) | Code + JSON | Validate |
| Validate | `gate-results.json` (per-gate verdict, confidence, findings) | Structured JSON | Deploy decision |
| Deploy | `deployment-record.json` (URLs, env config, health check results) | Structured JSON | Notify |

**`build-manifest.json` example:**
```jsonc
{
  "files_created": ["app/schedule/page.tsx", "app/schedule/schedule.test.tsx"],
  "files_modified": ["app/layout.tsx"],
  "dependencies_added": [],
  "tests_added": 4,
  "bundle_impact_estimate_kb": 12,
  "agent": "frontend-engineer",
  "confidence": 0.85
}
```

**Schema validation:** The orchestrator validates each stage's output against the expected schema before advancing to the next stage. Missing required artifacts or invalid schemas trigger a stage retry (up to 3), then human escalation.

### Stage Timeouts

Every stage has a maximum duration. Without timeouts, a Build agent could run indefinitely consuming tokens.

| Stage | Default Timeout | Rationale |
|-------|----------------|-----------|
| Research | 30 min | Deep research API calls can be slow |
| Design | 20 min | Creative work, parallel agents |
| Mediation | 10 min | Single-agent synthesis |
| Build | 60 min | Most token-intensive stage |
| Validate | 30 min | Triple-run voting multiplies time |
| Deploy | 10 min | Mechanical, should be fast |
| Notify | 5 min | Template-driven |

Timeouts are configurable per workflow template. When a timeout triggers: stage enters `timed_out` state, durable execution layer checkpoints what exists, experiment notification sent. Staff can extend the timeout and retry, or decline.

### Partial Fan-Out Failure

Design stage fans out to 3 parallel agents (Product Designer, Visual Designer, Architect). Two complete, one fails.

**Resolution policy (configurable per stage):**
- `require_all` (default for Design): All agents must complete. If any fails, retry the failed agent up to 3 times. If still failing, enter `partial_failure` state with human escalation.
- `require_majority`: Proceed if > 50% of agents complete. Mediation stage works with available outputs. Missing perspectives noted in the unified spec.
- `require_any`: Proceed if at least one agent completes. Useful for adversarial stages where partial coverage is better than none.

### Workflow Template Versioning

When a workflow template is updated while an experiment is running:
- Running experiments complete using the template version at creation time
- Template version is recorded in the experiment registry
- `workflow_describe` shows both current and experiment-specific versions

### Orchestrator Architecture

TypeScript orchestrator service on AWS Lambda/ECS. State machine in Neon PostgreSQL (`workflow_executions` table). Each stage dispatched as a Claude Code SDK session. Agents communicate via artifact files in the experiment repo (with validated schemas). Scheduled Lambda for deadline checks and TTL cleanup.

## Edge Cases

- **Context window exhaustion mid-stage.** A Claude Code SDK session hits the context limit during a complex Build stage. The durable execution layer can restart the Activity, but the agent loses all in-session reasoning. Resolution: Build agents checkpoint via git commits frequently (every meaningful unit of work). On context exhaustion, a new session starts with the AGENTS.md + build-manifest.json + git log of recent commits as context. Work already committed is preserved.
- **Design-approval gate with no human available.** Staff clicks "Run" on Friday evening. Research and Design complete by Saturday morning. The design-approval gate waits for human review. If no one reviews by Monday, the experiment has consumed 2 days of TTL doing nothing. Resolution: the design-approval gate sends an email immediately and a reminder at 24 hours. After 72 hours with no response, the experiment enters `design_awaiting_review` state and stops consuming resources.
- **Circular artifact dependency.** A misconfigured workflow template creates a cycle (Build reads Validate output, Validate reads Build output). The orchestrator must validate the DAG is acyclic at workflow creation time. Reject cyclic configurations with a clear error.
- **Model unavailability for specific stage.** An experiment's Build stage requires Sonnet, but Bedrock is throttling Sonnet. The gateway layer (FTR-174) handles model fallback (e.g., route to direct Anthropic API). If no provider is available, the orchestrator retries with exponential backoff (up to `max_retries`), then escalates.

## Error Cases

- **Stage produces valid JSON but wrong content.** The Design stage produces a `unified-spec.md` that passes schema validation but describes a completely different application than what was requested. Schema validation catches structural errors, not semantic errors. This is why the mandatory design-approval gate exists — a human catches semantic drift. For Build and later stages, the Validate stage's Principles Validator and Architecture Reviewer catch semantic drift.
- **Orchestrator crashes mid-stage-transition.** The orchestrator completes a stage but crashes before advancing `current_stage`. On restart, it re-reads the row: `current_stage` still points to the completed stage, `stage_state` has the results. The orchestrator detects completion in `stage_state` and advances. No split-brain possible — PostgreSQL is the single source of truth for both execution state and stage results.
- **Build stage creates files outside the experiment repo.** An agent with file system access writes to a directory outside its sandbox. Resolution: Claude Code SDK sessions are scoped to the experiment repo directory. File system access is chrooted (or equivalent sandboxing). Attempts to write outside the sandbox are blocked and logged.
- **Notify stage fails after deployment.** The experiment is deployed and live, but the email notification fails. The staff member doesn't know their experiment is ready. Resolution: Notify is best-effort with retry. Deploy success is recorded in the experiment registry regardless of notification status. Staff can check the ops dashboard.

## Notes

Full detail: `docs/plans/ftr-168-ai-agent-platform.md` sections 2, 12, 17, 24.

Configuration format analysis (YAML vs JSONC vs TOML vs TypeScript vs KDL vs CUE) in plan section 17. JSONC recommended for AI-native platform.

Visual pipeline builder (DAG editor on ops dashboard) is a Phase 3+ enhancement. Initial version uses JSONC config files.

**Research-informed additions (2026-03-18):** Durable execution layer (both Prompt 1 reports cite Temporal; Anthropic's own integration validates the pattern). Mandatory design-approval gate (Gemini Prompt 1 identifies this as the most dangerous assumption). MCP fallbacks (Gemini Prompt 2 raises longevity concerns — 85% 10-year survival per Claude, but lacks IDL per Gemini). LangChain/LangGraph not recommended — abstraction bloat conflicts with Claude Code SDK as execution substrate.

**Revised durable execution (2026-03-18):** Temporal Cloud replaced with PostgreSQL-native orchestration after crucible analysis. At project scale (< 50 experiments/month), Temporal's $100/month minimum buys ~$0.10 of actual work — a 1000:1 cost-to-value ratio. PostgreSQL state machine in existing Neon database provides zero-incremental-cost orchestration with identical crash recovery semantics. Temporal remains the documented scale threshold option (100+ experiments/month). The Activity boundary (each stage = Claude Code SDK session) is preserved regardless of dispatch mechanism.
