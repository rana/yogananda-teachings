# AI Agent Platform — Implementation Plan

Resequenced 4-stage approach. Validates SDK assumption first, builds incrementally from working foundation.

**Supersedes:** `docs/plans/ftr-168-phase-1-planning.md` (kept for reference — database schemas, service designs, architectural decisions).

**Governing FTRs:** FTR-168 (umbrella), FTR-169 (lifecycle), FTR-170 (orchestration), FTR-171 (roles), FTR-172 (validation), FTR-174 (operations/cost).

**Architectural decisions (final):** PostgreSQL-native orchestration, direct SDK token logging, adaptive validation, JSONC workflow config, experiment-as-repository with Lore Protocol.

---

## Context

The original Phase 1 plan designed 6 stages assuming the Claude Agent SDK was understood. SDK research (2026-03-19) resolved all major unknowns — the SDK is far more capable than assumed. This plan resequences to validate Bedrock integration first, then build incrementally.

**Disposition of existing plan:** `docs/plans/ftr-168-phase-1-planning.md` remains as architectural reference.

---

## SDK Research + Spike Results (2026-03-19)

**Package:** `@anthropic-ai/claude-agent-sdk` v0.2.79 (TypeScript). Published by Anthropic. 60.1 MB. Zero dependencies.

**API surface:** `query()` async generator yields `SDKMessage` events. Configuration via `Options` object.

**Spike results:** All 6 tests passed. Full results: `yogananda-platform/docs/spike-results/claude-agent-sdk.md`. Total cost: ~$0.16.

**Critical capabilities confirmed (documentation + spike):**

| Capability | SDK Support | How |
|-----------|------------|-----|
| Bedrock routing | YES (spike confirmed) | `CLAUDE_CODE_USE_BEDROCK=1` env var + AWS credentials |
| Model selection | YES (spike confirmed) | `model` option accepts short names AND full Bedrock IDs |
| System prompt | YES (spike confirmed) | `systemPrompt` option (custom string or Claude Code preset with `append`) |
| Working directory | YES (spike confirmed) | `cwd` option (defaults to `process.cwd()`) |
| Token/cost reporting | YES (spike confirmed) | `SDKResultMessage.total_cost_usd`, `.usage`, `.modelUsage` (per-model breakdown) |
| Budget enforcement | YES (spike confirmed) | `maxBudgetUsd` option — built-in, no custom implementation needed |
| Subagent isolation | YES (spike confirmed) | Parent + subagent on separate models with independent token tracking |
| MCP servers | YES (docs) | `mcpServers` option — stdio, SSE, HTTP, or in-process SDK servers |
| Max turns | YES (docs) | `maxTurns` option — prevents runaway agents |
| Multi-turn sessions | YES (docs) | `resume` with session IDs, `forkSession` for branching |
| Permissions | YES (docs) | `allowedTools`, `disallowedTools`, `permissionMode`, custom `canUseTool` callback |
| Hooks | YES (docs) | Full lifecycle: PreToolUse, PostToolUse, SessionStart, SessionEnd, Stop, SubagentStart/Stop |
| Structured output | YES (docs) | `outputFormat: { type: 'json_schema', schema }` for typed agent results |

**Model version constraint:** Short names (`"sonnet"`, `"haiku"`) map to 4.5 variants, not 4.6. Use explicit Bedrock model IDs for latest models:

| Model | Bedrock ID | Use |
|-------|-----------|-----|
| Sonnet 4.6 | `us.anthropic.claude-sonnet-4-6-v1` | Build, Validate, general |
| Opus 4.6 | `us.anthropic.claude-opus-4-6-v1` | Design, Research, Principles Validator |
| Haiku 4.5 | `us.anthropic.claude-haiku-4-5-20251001-v1:0` | Cheap tasks (Cost Analyst, Compliance) |

**Spike surprises:**
- Cache creation overhead: ~5K tokens ($0.02) per new session for SDK system prompt. Amortize via session `resume`.
- SDK spawns a subprocess (not library call) — env vars and filesystem inherited from parent.
- `persistSession: false` required for ephemeral pipelines (default saves to `~/.claude/projects/`).
- Zod v4 peer dep warning (SDK bundles own zod/v4, no runtime issue with our zod v3).

**Key implications:**
- SDK built-in budget enforcement eliminates custom pre-call checks in TokenTracker. TokenTracker simplifies to event recording for reporting.
- Subagent definitions with per-agent model/tools/prompts mean orchestrator doesn't need separate processes per stage.
- `allowedTools` + explicit tool lists = controlled autonomy. Best pattern for agent pipelines (not `bypassPermissions`).

---

## Stage 0: SDK Spike — COMPLETE

**Completed:** 2026-03-19. All 6 tests passed. Cost: ~$0.16.

**Results:** `yogananda-platform/docs/spike-results/claude-agent-sdk.md`

| Test | Result |
|------|--------|
| Bedrock spawn | PASS |
| Model selection (short names) | PASS — maps to Bedrock IDs automatically |
| System prompt | PASS — exact output matched |
| File operations | PASS — Read tool in specified cwd |
| Token reporting | PASS — total_cost_usd + per-model modelUsage |
| Budget cap | PASS — maxBudgetUsd respected |
| Subagent (haiku) | PASS — independent model + token tracking |

**Action item from spike:** Use explicit Bedrock model IDs (`us.anthropic.claude-sonnet-4-6-v1`) instead of short names (`"sonnet"`) to get v4.6 models. Short names default to 4.5.

---

## Stage 1: Minimal Loop

**Goal:** Prompt in, artifact out. Simplest possible end-to-end. 2-3 sessions.

**Repo:** yogananda-platform (95% of work)

### Database (2 tables)

```sql
-- experiments
CREATE TABLE experiments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt TEXT NOT NULL,
  workflow_config JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'proposed'
    CHECK (status IN ('proposed','provisioning','running','paused',
                      'completed','failed','declined')),
  requester TEXT NOT NULL DEFAULT 'claude',
  github_repo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- workflow_executions
CREATE TABLE workflow_executions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  experiment_id UUID NOT NULL REFERENCES experiments(id),
  current_stage TEXT NOT NULL,
  stage_state JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'running'
    CHECK (status IN ('running','paused','completed','failed','budget_exceeded')),
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Deferred columns: `awaiting_signal`, `signal_deadline`, `provisions`, `experimental_domain`, `ttl_expires_at` (Stage 2).

### Services

- **`experiment.ts`** — create (INSERT + GitHub repo via existing github.ts), list, describe. Skip Neon/Vercel provisioning.
- **`workflow-executor.ts`** — read config, iterate 2 stages (Build -> Validate), spawn SDK sessions per stage, write results to `stage_state`, advance `current_stage`.

### MCP Tools (2)

New `packages/mcp-server/src/tools/experiment.ts` following existing `project.ts` pattern.

- `experiment_create` — prompt + optional workflow -> experiment ID + repo URL
- `experiment_list` — filterable list

### Roles (2)

Store in `packages/mcp-server/src/roles/*.md`:

- **builder.md** — Full-stack engineer. Writes code, commits frequently, follows AGENTS.md if present.
- **validator.md** — Reviewer. Runs build/test, produces structured JSON verdict: `{ pass, confidence, findings[] }`.

### First Test

**Prompt:** "Create a static HTML page that says Hello World with a Next.js app structure."

**Flow:** experiment_create -> GitHub repo created -> WorkflowExecutor runs Build -> Validate -> experiment status = completed.

**Success criteria:** Repo has agent commits, code builds, validator produces verdict, workflow_executions shows completed with stage history.

---

## Stage 2: Real Pipeline

**Goal:** Full stage pipeline with human approval gate. 3-4 sessions.

**Repo:** yogananda-platform

### Database Additions

- Add to `workflow_executions`: `awaiting_signal TEXT`, `signal_deadline TIMESTAMPTZ`, `provisions JSONB DEFAULT '[]'`
- Add to `experiments`: `experimental_domain TEXT`, `ttl_expires_at TIMESTAMPTZ`
- New table: `token_events` (per original plan schema)

### Service Additions

- **Extend WorkflowExecutor:** Full pipeline (Research -> Design -> Approval Gate -> Build -> Validate -> Deploy -> Notify). Signal handling. Fan-out for Design stage.
- **`token-tracker.ts`** — record per-call, budget check before each call, model pricing in config.ts.

### MCP Tools (+5)

`experiment_describe`, `workflow_run`, `workflow_status`, `design_approve`, `cost_summary`

### Roles (+3)

- **researcher.md** — Deep research, synthesis. Produces `research-synthesis.md`.
- **designer.md** — Product/visual design. Produces `unified-spec.md`, `architecture.json`.
- **lead-engineer.md** — Design mediator. Generates AGENTS.md for experiment repo.

### Inter-Stage Artifacts

Orchestrator validates artifact existence before advancing:
- Research -> `research-synthesis.md`
- Design -> `unified-spec.md`, `architecture.json`
- Build -> source code + `build-manifest.json`
- Validate -> `gate-results.json`

### Second Test

A real but low-stakes site — no external deadline. Something that exercises all stages. Candidates: informational page, event countdown, meditation timer landing page.

**Success criteria:** Full pipeline executes with human approval gate, token tracking is accurate (compare to billing), at least one genuine validation finding, AGENTS.md generated and consumed.

**Post-Stage 2 evaluation:** With real token data from the pipeline, evaluate Batch API cost optimization for non-interactive stages (validation, scoring). See FTR-174 § Batch API Cost Optimization. Estimated ~20% overall cost reduction.

---

## Stage 3: Production Readiness

**Goal:** Convocation 2027 as first real experiment. 3-4 sessions.

**Repo:** yogananda-platform (heavy), yogananda-skills (if needed), yogananda-teachings (FTR state updates)

### Additions

- `experiment_quality` table
- Validation framework: gate runner, three-valued semantics (pass/fail/inconclusive), adaptive re-run (FTR-172)
- NotificationService: AWS SES, calm templates, key state transitions
- Dashboard: experiment list, detail view, design approval UI, Platform Pulse
- Remaining roles: accessibility-auditor, security-auditor, principles-validator, low-bandwidth-tester, stakeholder-communicator
- Sealed content blocks (if Convocation references teachings)
- Protocol skills in yogananda-skills — **only if Stage 2 revealed the need**

### Convocation 2027

IT is primary reviewer, not executives. Controlled test.

**Success criteria (from original plan):**
1. Pipeline completes: prompt -> deployed site at experimental URL
2. Design-approval gate produces meaningful feedback
3. Cost tracking within 5% of billing
4. Validation catches genuine issues
5. Non-technical reviewers understand Platform Pulse

---

## Cross-Repo Summary

| Repo | Stage 0 | Stage 1 | Stage 2 | Stage 3 |
|------|---------|---------|---------|---------|
| **yogananda-platform** | SDK install + spike | 2 tables, 2 services, 2 MCP tools, 2 roles | 3 additions (signal cols, token_events), TokenTracker, 5 MCP tools, 3 roles | 1 table, validation framework, notifications, dashboard, 5 roles |
| **yogananda-skills** | -- | -- | -- | Protocol skills (only if needed) |
| **yogananda-teachings** | -- | -- | -- | FTR state updates |

---

## Resolved Questions (from SDK Research)

1. **SDK package:** `@anthropic-ai/claude-agent-sdk` v0.2.79. TypeScript. Zero deps. 60 MB.
2. **Bedrock routing:** `CLAUDE_CODE_USE_BEDROCK=1` env var + AWS credentials. No special adapter needed.
3. **Model selection:** `model` option per query. Subagents accept `"sonnet" | "opus" | "haiku" | "inherit"`.
4. **Session statefulness:** Multi-turn via `resume` with session IDs. `forkSession` for branching.
5. **System prompt:** `systemPrompt` option — custom string or Claude Code preset with `append`.
6. **Token reporting:** `SDKResultMessage.total_cost_usd`, `.usage`, `.modelUsage` per-model breakdown.
7. **Budget enforcement:** `maxBudgetUsd` built into SDK — no custom pre-call checks needed.
8. **Subagents:** Built-in `agents` option with per-agent model, tools, prompts, MCP, skills, maxTurns.

## Remaining Open Questions

1. **Experiment repo template.** Minimal scaffold: package.json, tsconfig, .claude/CLAUDE.md. Next.js by default, configurable per workflow.
2. **GitHub repo naming.** Convention: `rana/exp-{slug}` or `rana/yogananda-exp-{slug}`?
3. **Concurrent session limits.** Bedrock rate limits per inference profile determine queue vs parallel.
4. **Migration numbering.** Current highest migration number in yogananda-platform needs verification.
5. **Experiment cleanup.** Test repos from Stage 1 need deletion strategy — manual initially, TTL Lambda later.
6. **Bedrock model identifiers.** SDK accepts `"sonnet"`, `"opus"`, `"haiku"` — does Bedrock routing map these to the correct inference profiles automatically, or do we need full model IDs?

---

## Verification

Each stage has a concrete test:

- **Stage 0:** Run `sdk-test.ts`, observe structured output with session creation + token counts
- **Stage 1:** `experiment_create` -> repo exists -> `workflow_run` -> builder commits code -> validator produces verdict -> status = completed
- **Stage 2:** Full pipeline with approval gate pause -> human approves -> build + validate complete -> token_events match billing
- **Stage 3:** Convocation 2027 end-to-end with all success criteria

---

## First Action

**Stage 0 in yogananda-platform.** Discover the SDK, install it, run the spike. Everything else depends on the results.
