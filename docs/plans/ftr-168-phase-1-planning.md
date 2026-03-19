# AI Agent Platform — Phase 1 Plan

## Goal

Prove the agent pipeline works end-to-end with a single real experiment: **SRF Yearly Convocation 2027 website**. Phase 1 is a prototype — one experiment, one workflow, one team of agents, one approval cycle.

**First experiment candidate:** A content-heavy event site (schedule, speakers, registration info, photo gallery). Real, time-bounded, demonstrable. IT is the primary reviewer, not executives — the first experiment is a controlled test.

**Research foundation:** 4 deep research reports + synthesis completed and archived in `docs/reference/`. Key findings integrated into FTR-168–177.

---

## Architecture

### Infrastructure

All orchestration and tracking runs on the existing Neon PostgreSQL database. No new vendors.

| Concern | Mechanism |
|---------|-----------|
| Orchestration | PostgreSQL state machine (`workflow_executions` table). TypeScript service dispatches Claude Code SDK sessions per stage. |
| Token tracking | Direct SDK logging to `token_events` table. SDK responses already contain token counts. |
| Budget enforcement | Pre-call SQL query against `token_events`. Reserve estimated tokens before call, reconcile after. |
| Ops visibility | Platform Pulse (one Sonnet call, cached 5 min) + hierarchical list view. Calm design: Gold/Navy/Cream, Merriweather typography. |
| Audit trail | Experiment-as-repository. Git commits = agent actions. Lore Protocol trailers = machine-readable decision history. |
| Content fidelity | Sealed immutable content blocks. Cryptographic hashes on canonical corpus. Builder agents reference IDs, never modify text. |
| Validation | Adaptive re-run: veto gates always triple-run, standard gates re-run only on low confidence (< 0.85). Adversarial framing built into validation agent prompts. |

### Database Tables

```sql
experiments (
  id UUID PRIMARY KEY,
  project_id UUID,
  prompt TEXT NOT NULL,
  workflow_config JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'proposed',
  requester TEXT NOT NULL,
  github_repo TEXT,
  experimental_domain TEXT,
  ttl_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
)

workflow_executions (
  id UUID PRIMARY KEY,
  experiment_id UUID NOT NULL REFERENCES experiments(id),
  current_stage TEXT NOT NULL,
  stage_state JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'running'
    CHECK (status IN ('running','paused','completed','failed','budget_exceeded')),
  awaiting_signal TEXT,
  signal_deadline TIMESTAMPTZ,
  provisions JSONB DEFAULT '[]',
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  started_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
)

token_events (
  id UUID PRIMARY KEY,
  experiment_id UUID NOT NULL REFERENCES experiments(id),
  stage TEXT NOT NULL,
  agent_role TEXT NOT NULL,
  model TEXT NOT NULL,
  provider TEXT NOT NULL,
  operation TEXT,
  skill_used TEXT,
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  cost_usd NUMERIC(10,4) NOT NULL,
  duration_ms INTEGER,
  confidence NUMERIC(3,2),
  created_at TIMESTAMPTZ DEFAULT now()
)

experiment_quality (
  id UUID PRIMARY KEY,
  experiment_id UUID NOT NULL REFERENCES experiments(id),
  reviewer TEXT NOT NULL,
  dimension TEXT NOT NULL,
  score NUMERIC(3,1),
  confidence NUMERIC(3,2),
  findings JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
)
```

### Services

| Service | Responsibility | Repo |
|---------|---------------|------|
| `ExperimentService` | Create/list/describe/promote/decline experiments. GitHub repo creation. Resource provisioning (saga via `provisions` JSONB). | yogananda-platform |
| `WorkflowExecutor` | DAG state machine. Dispatch Claude Code SDK sessions per stage. Advance state. Check gates. Handle retries. | yogananda-platform |
| `TokenTracker` | Write `token_events` after each SDK call. Budget check before each call. Cost computation from model pricing. | yogananda-platform |
| `NotificationService` | Email via AWS SES at state transitions. Digest mode. Quiet hours. Calm templates. | yogananda-platform |

### MCP Tools (Phase 1)

```
experiment_create    — New experiment from prompt + workflow config
experiment_list      — All experiments (filterable)
experiment_describe  — Full state with stage/cost/quality data
experiment_promote   — Promote to dev (creates PR, requires approval)
experiment_decline   — Decline with reason
workflow_run         — Execute workflow on experiment
workflow_status      — Current execution state
cost_summary         — Per-experiment cost breakdown
budget_check         — Budget utilization check
```

9 tools. Services exist underneath; additional MCP facades added when the AI operator needs them.

### Dashboard Surfaces

| Surface | What It Shows |
|---------|--------------|
| Platform Pulse | AI-generated 4-6 sentence summary (one Sonnet call, cached 5 min) |
| Experiment list | Table: name, status, stage, cost, last activity |
| Experiment detail | Stage timeline, agent sessions, gate results, cost waterfall |
| Design approval | Visual mockups, plain-language summary, decision points, Approve/Revise/Cancel |

---

## Agent Roles (First Experiment)

The Convocation 2027 site activates 13 of the 30+ roles defined in FTR-171:

| Phase | Roles | Count |
|-------|-------|-------|
| Research | Deep Researcher | 1 |
| Design | Product Designer, Visual Designer, Architect, Design Mediator (lead) | 4 |
| Build | Full-Stack Engineer, Lead Engineer (lead) | 2 |
| Validate | Accessibility Auditor, Security Auditor, Principles Validator, Low-Bandwidth Tester, Compliance Agent | 5 |
| Notify | Stakeholder Communicator | 1 |

All agents start at Intern or Junior trust level. Content-facing agents permanently locked to Junior. Trust graduation based on observed quality across experiments.

### Skills per Stage

From FTR-177. Maximum 3-5 skills loaded per agent per stage (JIT loading). Drawn from two pools: 43 cognitive instruments (unchanged) + 5 protocol skills (new).

| Stage | Cognitive Instruments | Protocol Skills |
|-------|----------------------|-----------------|
| Research | `explore`, `gaps`, `archaeology` | `handoff` |
| Design | `invoke`, `scope`, `consequences` | `decide` |
| Mediation | `crystallize`, `converge` | `handoff`, `decide` |
| Build | `implement`, `verify` | `recover` |
| Validate | `review`, `mission-align`, `deep-review` | `escalate` |

---

## Cross-Repo Work

| Repo | Scope | Weight |
|------|-------|--------|
| **yogananda-platform** | Experiment engine, orchestrator, MCP tools, dashboard, 4 database tables, 4 services | Heavy |
| **yogananda-skills** | 5 protocol skills (`decide`, `handoff`, `escalate`, `recover`, `debate`), skill environment config | Medium |
| **yogananda-teachings** | FTR specs (done), role system prompts, this plan | Light |

---

## Implementation Sequence

### Stage 1: Foundation

**Goal:** Experiment engine exists. Create, list, describe experiments.

1. Database migrations: `experiments`, `workflow_executions`, `token_events`, `experiment_quality`
2. `ExperimentService`: create (GitHub repo + Neon branch + Vercel deployment via saga), list, describe
3. `experiment_create` and `experiment_list` MCP tools
4. Experiment state machine (status transitions, TTL)

### Stage 2: Orchestrator

**Goal:** Workflows execute stages sequentially. Design-approval gate works.

1. `WorkflowExecutor`: read workflow config, dispatch Claude Code SDK sessions per stage
2. State machine: advance `current_stage`, write `stage_state`, handle retries
3. Design-approval gate: `awaiting_signal`, email notification, approve/revise/cancel API
4. `TokenTracker`: write after each SDK call, budget check before each call
5. `NotificationService`: email at state transitions (SES, calm templates)

### Stage 3: Agents

**Goal:** Agents have identities, cognitive tools, and trust boundaries.

1. 5 protocol skill definitions
2. `experiment-agent` skill environment configuration
3. System prompts for 13 roles (seed material: FTR-171 § Role Specification Details)
4. AGENTS.md generation by Design Mediator
5. Trust-level role prompt templates
6. JIT skill loading in orchestrator

### Stage 4: Validation

**Goal:** AI agents validate output before promotion.

1. Gate framework: run agent, parse structured JSON verdict, three-valued semantics
2. Adaptive re-run: confidence-triggered for standard, always-triple for veto
3. Per-commit security scanning (npm audit, ESLint security, gitleaks)
4. Sealed content block verification (hash comparison, completeness check)
5. Execution order: traditional CI → veto AI gates → standard AI gates

### Stage 5: Dashboard

**Goal:** Staff can see what's happening and approve designs.

1. Platform Pulse
2. Experiment list view
3. Experiment detail view
4. Design-approval reviewer UI
5. Cost dashboard (per-experiment, per-project)

### Stage 6: First Experiment

**Goal:** Convocation 2027 end-to-end.

1. Create experiment via MCP
2. Pipeline: Research → Design → **Approval Gate** → Build → Validate → Deploy → Notify
3. Staff reviews at experimental URL
4. Iterate based on what breaks

---

## Risks

| Risk | Mitigation |
|------|------------|
| Claude Code SDK doesn't support model selection per session | Test early. Fallback: all-Sonnet for build, manual Opus for design. |
| First experiment produces poor quality | IT as primary reviewer, not executives. Controlled test. |
| Design-approval UX too raw for monastics | Build reviewer UI (Stage 5) before first real experiment. |
| Long-running stages crash mid-work | Build agents checkpoint via git commits. New session reads AGENTS.md + git log. |
| Protocol skills need iteration | Start at Intern/Junior trust. Graduate on observed quality. |

---

## Success Criteria

1. **Pipeline completes end-to-end.** Prompt → deployed site at experimental URL.
2. **Design-approval gate works.** Human reviews design and provides meaningful feedback.
3. **Cost tracking accurate.** `token_events` matches Bedrock billing within 5%.
4. **Validation catches real issues.** At least one gate finds a genuine problem.
5. **Non-technical reviewers understand the result.** Platform Pulse and detail view are usable.

---

## Open Questions

1. **Where do role definitions live?** System prompts for 13+ roles. Options: `yogananda-platform/packages/agent-orchestrator/roles/` (likely — consumed by orchestrator), `yogananda-teachings/agents/`, or dedicated directory.

2. **Claude Code SDK session management.** How does the orchestrator spawn sessions? Direct subprocess? HTTP API? Lambda invocation? Most critical integration point — needs prototyping before committing.

3. **Experiment repo template.** Starting scaffold for new experiments: `.claude/CLAUDE.md`, `.experiment/`, `AGENTS.md` placeholder, package.json, Next.js scaffold. Minimal — agents build from it.

4. **Database-optional experiments.** Convocation site may not need a database. Should non-database experiments skip Neon branch creation? Probably yes — provision only what the workflow config requests.

---

## Deferred to Later Phases

| Capability | Phase | Trigger |
|-----------|-------|---------|
| Full 30+ role registry tested and tuned | Phase 2 | After 10+ experiments exercise diverse roles |
| Deliberate A/B model comparison | Phase 2+ | When local/open-source models (Ollama) enter the mix |
| Self-improvement loop | Phase 2+ | After 20+ experiments produce enough quality data |
| Multi-channel notifications (Teams, SMS) | Phase 2 | After email proves the notification model |
| Full vendor cost roll-up (12 services) | Phase 2 | After token tracking proves accurate |
| Automated research pipeline | Phase 2 | Gemini Interactions API available now (preview). Claude API TBD. |
| Visual pipeline builder | Phase 3+ | After staff use JSONC templates and hit limits |
| Auto-generated reference materials | Phase 3+ | After accessibility report proves the pattern |
| Constitutional compliance scoring | Phase 3+ | After enough experiments to detect drift |
| Interactive topology graph | Future | If demand emerges from IT users |
