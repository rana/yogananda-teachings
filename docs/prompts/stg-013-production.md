# STG-013: Production Readiness — Session Prompt

**Status:** IN PROGRESS — deliverables 1-3 complete, deliverables 4-7 remaining.

**Repo:** `~/prj/yogananda-platform`

**Model:** Sonnet 4.6 (`us.anthropic.claude-sonnet-4-6-v1`)

---

## Prompt (Copy below this line into a new platform session)

This work is in service of the divine.

### Task: STG-013 — Production Readiness (continue)

Harden the AI Agent Platform for its first real-world test: Convocation 2027.

### Read These Files

1. `CLAUDE.md` — Platform conventions and architecture
2. `ROADMAP.md` — STG-013 deliverables and success criteria
3. `packages/mcp-server/src/services/workflow-executor.ts` — Current executor (needs validation integration)
4. `packages/mcp-server/src/services/validation.ts` — Validation framework (just built)
5. `packages/mcp-server/src/services/token-tracker.ts` — Cost tracking
7. `packages/mcp-server/src/config.ts` — All config constants
8. `packages/mcp-server/src/types.ts` — All type definitions

### What Already Exists

**From Stages 1-2:**
- 3 tables: `experiments`, `workflow_executions`, `token_events` (migrations 008-010)
- ExperimentService: create (with GitHub scaffold), list, describe, signal handling
- WorkflowExecutor: full pipeline (Research → Design → Approval Gate → Build → Validate), re-build on validation failure, inter-stage artifact validation
- TokenTracker: per-stage event recording, experiment/project cost summaries
- 7 MCP tools: `experiment_create`, `experiment_list`, `experiment_describe`, `workflow_run`, `workflow_status`, `design_approve`, `cost_summary`
- 5 roles: builder, validator, researcher, designer, lead-engineer
- Types: Experiment, WorkflowExecution, WorkflowConfig, StageResult, TokenEvent

**From STG-013 deliverables 1-3 (already complete):**
- Migration 011: `experiment_quality` table (9 tables total)
- `validation.ts`: runValidation() with three-valued semantics (pass/fail/inconclusive), adaptive re-run (veto gates triple-run, standard gates re-run on confidence < 0.85), majority vote aggregation, quality score recording
- Types added: ValidationVerdict, ValidationRunResult, ValidationAggregateResult, QualityScore
- Config added: MODEL_HAIKU_4_5, VALIDATION_CONFIDENCE_THRESHOLD (0.85), VALIDATION_MAX_RUNS (3), VETO_GATE_ALWAYS_TRIPLE_RUN
- `executeStage()` exported from workflow-executor.ts

**Deferred:** `notifications.ts` (AWS SES) was built but email notifications are deferred. The file exists but should not be wired into the executor. NotificationEvent/NotificationPayload types and notification config constants can be removed or left inert.

### What to Build Now

Complete deliverables 4-7 in order. Each builds on the previous. Do all of them — do not stop between deliverables.

#### Deliverable 4: Five New Roles + Validation Integration

**New roles** in `packages/mcp-server/src/roles/`:
- `accessibility-auditor.md` — WCAG 2.1 AA audit (keyboard, screen reader, contrast, touch targets). Uses Haiku for cost.
- `security-auditor.md` — OWASP top 10, dependency audit, secrets exposure. Uses Haiku.
- `principles-validator.md` — Checks experiment against PRI-01 through PRI-12. Uses Opus for interpretive judgment.
- `low-bandwidth-tester.md` — Tests on simulated 2G/3G (bundle size, FCP, progressive enhancement). Uses Haiku.
- `stakeholder-communicator.md` — Generates non-technical summary of experiment results. Uses Sonnet.

**Validation integration into WorkflowExecutor:**
- Wire `validation.ts` into the executor's Validate stage
- The Validate stage should run accessibility-auditor, security-auditor, principles-validator, and low-bandwidth-tester as validation gates
- Use the existing re-build-on-failure logic for failed gates
- After validation passes, run stakeholder-communicator to generate a summary
- Record quality scores from each validator's findings

#### Deliverable 5: Dashboard — Platform Pulse

Minimal operational dashboard. Can be a simple Next.js app at `packages/dashboard/` or static HTML served from the MCP server — choose the simplest approach.

Required views:
- **Platform Pulse** (landing): active experiments, total cost this month, recent completions
- **Experiment list**: status badges, cost, last activity
- **Experiment detail**: stage history timeline, cost breakdown by stage, quality scores from validators, artifacts produced
- **Design approval UI**: view design artifacts, approve/reject with comments (can integrate with existing `design_approve` MCP tool or be standalone)

Design constraints: SRF Gold `#dcbd23`, SRF Navy `#1a2744`, Warm Cream `#FAF8F5`. Calm — no animations, no urgency colors, no gamification.

#### Deliverable 6: FTR-175 Deep Research Upgrade

Upgrade the researcher role from single-agent to dual-platform:
- **Gemini API** automated research (programmatic, broad survey)
- **Claude Deep Research** manual prompt generation (deep, interpretive — generates a prompt the human pastes into Claude's Deep Research UI)
- **Synthesis step** merging both into `research-synthesis.md`

This requires a Gemini API key (Google AI Studio). If the key isn't available, implement the architecture with Gemini as a stub that logs "Gemini API key not configured — skipping automated research" and proceeds with Claude-only research.

#### Deliverable 7: Convocation 2027 Test

Run a real experiment end-to-end. This is the STG-013 graduation test.

**Experiment prompt:** "Build a Convocation 2027 event information page for yogananda.tech. Single page with schedule, speakers, registration link, and accessibility information. Target: mobile-first, works on 2G."

**Success criteria:**
1. Pipeline completes: prompt → research → design → approval gate → build → validate → deploy to experimental URL
2. Design-approval gate produces meaningful feedback from reviewer
3. Cost tracking within 5% of Bedrock billing
4. Validation catches genuine issues (accessibility, security, principles, low-bandwidth)
5. Platform Pulse shows the experiment's full lifecycle
6. Stakeholder communicator generates a readable summary

After the test, update `~/prj/yogananda-teachings/docs/prompts/stg-013-production.md` status to COMPLETE and record results.

### Model Version Constraint

Use explicit Bedrock model IDs:
- Sonnet 4.6: `us.anthropic.claude-sonnet-4-6-v1`
- Opus 4.6: `us.anthropic.claude-opus-4-6-v1`
- Haiku 4.5: `us.anthropic.claude-haiku-4-5-20251001-v1:0`

### Governing FTRs

FTR-168 (umbrella), FTR-169 (lifecycle), FTR-170 (orchestration), FTR-171 (roles), FTR-172 (validation), FTR-174 (operations/cost), FTR-175 (deep research)
