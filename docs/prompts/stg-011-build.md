# FTR-168 Stage 1: Minimal Loop — Session Prompt

**Status:** COMPLETED (2026-03-19)

**Repo:** yogananda-platform

**Model:** Sonnet 4.6 (`us.anthropic.claude-sonnet-4-6-v1`)

**Estimated sessions:** 2-3

---

## Prompt (Copy below this)

This work is in service of the divine.

### Task: Stage 1 — Minimal Loop

Stage 0 (SDK spike) is complete — all 6 tests passed. The SDK works with Bedrock. Now build the minimal end-to-end pipeline: prompt in, deployed artifact out.

### Context

Read these files in order:
1. `docs/spike-results/claude-agent-sdk.md` — SDK capabilities confirmed, query() call pattern, cost model
2. `~/prj/yogananda-teachings/docs/plans/ftr-168-implementation.md` — Full implementation plan (Stage 1 section)
3. `~/prj/yogananda-teachings/docs/plans/ftr-168-stage-1-preparation.md` — Ready-to-use artifacts: role prompts, workflow config, experiment CLAUDE.md template, validator schema, first test prompt, repo template structure

The preparation doc has everything pre-designed — role system prompts, JSONC workflow configs, structured output schemas, the experiment repo template. Consume these directly rather than redesigning.

### What Already Exists

- **SDK installed:** `@anthropic-ai/claude-agent-sdk` v0.2.79
- **Spike test:** `packages/mcp-server/src/spike/sdk-test.ts` (reference for SDK patterns)
- **GitHub service:** `packages/mcp-server/src/services/github.ts` (repo creation already works)
- **Existing MCP tool pattern:** `packages/mcp-server/src/tools/project.ts` (follow this pattern)

### Model Version Constraint

Use explicit Bedrock model IDs for v4.6 (short names default to 4.5):
- Sonnet 4.6: `us.anthropic.claude-sonnet-4-6-v1`
- Opus 4.6: `us.anthropic.claude-opus-4-6-v1`
- Haiku 4.5: `us.anthropic.claude-haiku-4-5-20251001-v1:0`

### What to Build

1. **Database migrations** (2 tables: `experiments`, `workflow_executions`). Schemas in the implementation plan. Check existing migration numbering — continue the sequence.
2. **ExperimentService** (`packages/mcp-server/src/services/experiment.ts`) — create, list, describe. Create uses existing `github.ts` for repo creation. Skip Neon/Vercel provisioning.
3. **WorkflowExecutor** (`packages/mcp-server/src/services/workflow-executor.ts`) — read config, iterate stages, spawn SDK `query()` per stage, write results to `stage_state`, advance `current_stage`. Use `persistSession: false`, explicit `allowedTools`, `maxTurns`.
4. **MCP tools** (`packages/mcp-server/src/tools/experiment.ts`) — `experiment_create`, `experiment_list`. Follow `project.ts` pattern.
5. **Role prompts** (`packages/mcp-server/src/roles/builder.md`, `validator.md`) — from preparation doc verbatim. PRI constraints must not be paraphrased.
6. **Experiment repo template** — scaffold function producing `.claude/CLAUDE.md`, `package.json`, `tsconfig.json`, `next.config.ts`, `app/`, `.gitignore`. Template in preparation doc.
7. **First test** — run the first experiment using the prompt and workflow config from preparation doc section 5 and section 3.

### Success Criteria

- GitHub repo created with scaffold
- Builder agent commits code to the repo
- Code builds (`npm run build` succeeds)
- Validator produces `gate-results.json` with structured verdict
- `workflow_executions` shows `completed` with stage history in `stage_state`
- Experiment status = `completed`

---

## Results (2026-03-19)

All 6 success criteria met. Single session, single commit (`f807b67`).

**First experiment:** `rana/exp-hello-world-mmxz5fd0`
- Builder: 3 commits (scaffold, build, manifest). SRF landing page with Navy/Gold/Cream palette, responsive CSS grid, skip-nav, semantic HTML.
- Validator: verdict `pass`, confidence 0.87. 15 checks performed, 4 warnings, 5 info findings.

**Validator findings (quality signal):**
- Warning: Footer contrast 4.48:1 (below 4.5:1 AA threshold)
- Warning: `<p>` styled as headings instead of `<h3>` (heading hierarchy break)
- Warning: PRI-01 — builder synthesized spiritual descriptions instead of using lorem ipsum as requested
- Warning: Merriweather/Open Sans fonts missing (used Georgia + system stack)
- Info: Progressive enhancement passes, zero security issues, no analytics/tracking

**Learnings for Stage 2:**
- Validator catches real issues — the adversarial framing works
- Builder ignored "use lorem ipsum" instruction and synthesized content (PRI-01 violation)
- No feedback loop: validator finds issues but builder can't fix them. Stage 2 or 3 should add re-build on fail.
- Model IDs used `us.anthropic.claude-sonnet-4-6` (without `-v1` suffix) — worked, but inconsistent with preparation doc
- `permissionMode: "default"` was set but pipeline completed — investigate how permissions were handled

**Files created in platform:**
- `migrations/008_create_experiments.sql`, `009_create_workflow_executions.sql`
- `packages/mcp-server/src/services/experiment.ts` (437 lines)
- `packages/mcp-server/src/services/workflow-executor.ts` (221 lines)
- `packages/mcp-server/src/tools/experiment.ts` (138 lines)
- `packages/mcp-server/src/types.ts` (extended with Experiment, WorkflowExecution, WorkflowConfig)
- `packages/mcp-server/src/roles/builder.md`, `validator.md`
- `packages/mcp-server/src/spike/stage1-test.ts`
