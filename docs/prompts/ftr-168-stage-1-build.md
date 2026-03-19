# FTR-168 Stage 1: Minimal Loop — Session Prompt

**Status:** READY. Next action for yogananda-platform.

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
