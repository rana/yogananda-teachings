# FTR-168 Stage 2: Real Pipeline — Session Prompt

**Status:** READY. Next action for yogananda-platform.

**Repo:** yogananda-platform

**Model:** Sonnet 4.6 (`us.anthropic.claude-sonnet-4-6-v1`)

**Estimated sessions:** 3-4

---

## Prompt (Copy below this)

This work is in service of the divine.

### Task: Stage 2 — Real Pipeline

Stage 1 (Minimal Loop) is complete — the first experiment ran end-to-end. Now extend the pipeline to a full multi-stage workflow with human approval gate, token tracking, and inter-stage artifact validation.

### Context

Read these files in order:
1. `~/prj/yogananda-teachings/docs/plans/ftr-168-implementation.md` — Full implementation plan (Stage 2 section)
2. `~/prj/yogananda-teachings/docs/plans/ftr-168-stage-1-preparation.md` — Section 3 has the full-pipeline workflow config schema
3. `~/prj/yogananda-teachings/docs/prompts/ftr-168-stage-1-build.md` — Stage 1 results section has learnings that inform this stage
4. `packages/mcp-server/src/services/workflow-executor.ts` — Current executor (extend this)
5. `packages/mcp-server/src/services/experiment.ts` — Current experiment service (extend this)

### What Already Exists (from Stage 1)

- **2 tables:** `experiments`, `workflow_executions` (migrations 008, 009)
- **ExperimentService:** create (with GitHub scaffold), list, describe
- **WorkflowExecutor:** sequential stage execution, SDK `query()` per stage, `stage_state` recording
- **2 MCP tools:** `experiment_create`, `experiment_list`
- **2 roles:** builder, validator (in `packages/mcp-server/src/roles/`)
- **Types:** Experiment, WorkflowExecution, WorkflowConfig, StageResult
- **First experiment:** `rana/exp-hello-world-mmxz5fd0` (completed, validator found real issues)

### Stage 1 Learnings (address these)

- Validator found 4 real issues but builder couldn't fix them — need re-build on validation failure
- Builder ignored "use lorem ipsum" and synthesized spiritual content — PRI-01 risk in prompts
- `permissionMode: "default"` didn't block pipeline — verify this is reliable or switch to explicit tool permissions
- Model IDs used `us.anthropic.claude-sonnet-4-6` (missing `-v1`). Use `us.anthropic.claude-sonnet-4-6-v1` consistently.

### Model Version Constraint

Use explicit Bedrock model IDs for v4.6:
- Sonnet 4.6: `us.anthropic.claude-sonnet-4-6-v1`
- Opus 4.6: `us.anthropic.claude-opus-4-6-v1`
- Haiku 4.5: `us.anthropic.claude-haiku-4-5-20251001-v1:0`

### What to Build

#### 1. Database additions

New migration(s) continuing the sequence after 009:

```sql
-- Add to workflow_executions
ALTER TABLE workflow_executions
  ADD COLUMN awaiting_signal TEXT,
  ADD COLUMN signal_deadline TIMESTAMPTZ;

-- Add to experiments
ALTER TABLE experiments
  ADD COLUMN experimental_domain TEXT,
  ADD COLUMN ttl_expires_at TIMESTAMPTZ;

-- New table: token_events
CREATE TABLE token_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES experiments(id),
  stage TEXT NOT NULL,
  agent_role TEXT NOT NULL,
  model TEXT NOT NULL,
  provider TEXT NOT NULL,
  operation TEXT,
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  cost_usd NUMERIC(10,4) NOT NULL,
  duration_ms INTEGER,
  confidence NUMERIC(3,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_token_events_experiment ON token_events(experiment_id);
CREATE INDEX idx_token_events_stage ON token_events(experiment_id, stage);
```

#### 2. Extend WorkflowExecutor

- **Full pipeline stages:** Research → Design → Approval Gate → Build → Validate
- **Signal handling:** When a stage has `gate: true`, set `awaiting_signal` on the workflow execution and pause. Resume when signal received (human calls `design_approve`).
- **Inter-stage artifact validation:** Before advancing to next stage, verify `requiredArtifacts` exist in the repo. Fail the stage if artifacts are missing.
- **Re-build on validation failure:** If validator returns `fail`, re-run the builder with the validator's findings as additional context. Max 1 retry.
- **Token event recording:** After each SDK `query()` completes, write a row to `token_events` with the stage, role, model, tokens, cost from `SDKResultMessage`.

#### 3. TokenTracker service

New `packages/mcp-server/src/services/token-tracker.ts`:
- `recordEvent(experimentId, stage, role, model, sdkResult)` — write to `token_events`
- `getExperimentCost(experimentId)` — total cost with per-stage/per-model breakdown
- `getProjectCost(dateRange?)` — aggregate across experiments

#### 4. New MCP tools (+5)

In `packages/mcp-server/src/tools/experiment.ts` (extend existing):
- `experiment_describe` — full detail: experiment + workflow execution + stage history + cost breakdown
- `workflow_run` — trigger workflow on an existing experiment (separate from create)
- `workflow_status` — current stage, awaiting signal?, cost so far
- `design_approve` — send approval signal to resume a paused workflow
- `cost_summary` — per-experiment or per-project cost breakdown

#### 5. New role prompts (+3)

In `packages/mcp-server/src/roles/`:
- `researcher.md` — Deep research, synthesis. Uses Opus. Produces `research-synthesis.md`. Tools: Read, Bash, Glob, Grep, WebSearch, WebFetch.
- `designer.md` — Product/visual design. Uses Opus. Produces `unified-spec.md`, `architecture.json`. Tools: Read, Write, Bash, Glob, Grep.
- `lead-engineer.md` — Design mediator. Generates AGENTS.md for experiment repo. Uses Opus. Tools: Read, Write, Bash, Glob, Grep.

Write role prompts that encode PRI constraints (PRI-01, PRI-05, PRI-07, PRI-08, PRI-09) and artifact contracts. Follow the pattern established by builder.md and validator.md.

#### 6. Second test

After building all the above, run a real experiment through the full pipeline. Candidate prompt:

```
Create a meditation timer landing page for Self-Realization Fellowship. The page should have:
1. A hero section explaining SRF meditation practices (use placeholder text — NOT real spiritual content)
2. A timer interface that counts up from 0 (no sound, no notifications — PRI-08)
3. A "Techniques" section linking to srf.org/meditation (external link, not generated content)
4. Responsive design with SRF brand colors
5. Accessible: keyboard-operable timer, screen reader announcements for timer state

This is a Next.js 15 app. The timer is the only Client Component — everything else is Server Components.
```

### Success Criteria

- Full pipeline executes: Research → Design → Gate pause → Human approves → Build → Validate
- Human approval gate pauses the workflow and resumes on signal
- Token tracking records per-stage costs in `token_events`
- At least one genuine validation finding
- AGENTS.md generated by lead-engineer and consumed by builder
- Inter-stage artifacts validated before advancing
- `cost_summary` returns accurate breakdown matching `token_events` data
