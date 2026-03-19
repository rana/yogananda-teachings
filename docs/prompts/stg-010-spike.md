# FTR-168 Stage 0: SDK Spike — Session Prompt

**Status:** COMPLETED (2026-03-19)

**Repo:** yogananda-platform

**Model:** Sonnet 4.6 (`us.anthropic.claude-sonnet-4-6-v1`)

**Estimated sessions:** 1

---

## Prompt (Copy below this)

This work is in service of the divine.

### Task: Stage 0 — SDK Spike

Validate that the Claude Agent SDK can spawn programmatic AI sessions through AWS Bedrock. The entire AI Agent Platform (FTR-168) depends on this assumption.

### Context

Read this file first:
1. `~/prj/yogananda-teachings/features/operations/FTR-168-ai-agent-platform.md` — What we're building and why

All AI calls route through AWS Bedrock. The environment has these variables set:
- `CLAUDE_CODE_USE_BEDROCK=1`
- `AWS_BEARER_TOKEN_BEDROCK` (set)
- `AMAZON_BEDROCK` (set)
- `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` (set)

### What to Do

1. Identify the correct SDK package (candidates: `@anthropic-ai/claude-code`, `claude_agent_sdk`, `@anthropic-ai/claude-agent-sdk`)
2. Install it in yogananda-platform
3. Create a spike test at `packages/mcp-server/src/spike/sdk-test.ts`
4. Run 6 tests (below), document results

### Tests (pass/fail)

| # | Test | What to Verify |
|---|------|---------------|
| 1 | Spawn session | Create a session via `query()`, get a response |
| 2 | Bedrock routing | Session uses AWS Bedrock, not direct Anthropic API |
| 3 | Model selection | Specify different models per session |
| 4 | System prompt | Inject a role prompt and verify it's followed |
| 5 | Token reporting | Response includes input/output token counts and cost |
| 6 | Budget cap | `maxBudgetUsd` is respected |

### Success Criteria

- Tests 1-3 pass (minimum viable)
- Test 6 pass (budget enforcement critical for agent pipelines)
- Results documented with actual API shape, surprises, and recommendations for Stage 1

### Output

Write results to `docs/spike-results/claude-agent-sdk.md`.

---

## Results (2026-03-19)

All 6 tests passed. Cost: ~$0.16. Key findings:

- Package: `@anthropic-ai/claude-agent-sdk` v0.2.79 (TypeScript, zero deps, 60 MB)
- Short model names (`"sonnet"`) map to v4.5 variants. Use explicit Bedrock IDs for v4.6.
- Cache creation overhead: ~5K tokens ($0.02) per new session for SDK system prompt
- SDK spawns a subprocess — env vars and filesystem inherited from parent
- `persistSession: false` required for ephemeral pipelines
- Built-in `maxBudgetUsd` eliminates need for custom budget enforcement
- Subagent definitions with per-agent model/tools/prompts work as documented

Full results: `yogananda-platform/docs/spike-results/claude-agent-sdk.md`
