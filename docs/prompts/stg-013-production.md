# FTR-168 Stage 3: Production Readiness — Session Prompt

**Status:** READY. Next action for yogananda-platform.

**Repo:** yogananda-platform

**Model:** Sonnet 4.6 (`us.anthropic.claude-sonnet-4-6-v1`)

**Estimated sessions:** 3-4

---

## Prompt (Copy below this)

This work is in service of the divine.

### Task: STG-013 — Production Readiness

Stage 2 (Real Pipeline) is complete — the full multi-stage pipeline runs end-to-end with human approval gates, token tracking, and inter-stage artifact validation. Now harden the platform for its first real-world test: Convocation 2027.

### Context

Read these files in order:
1. `~/prj/yogananda-teachings/docs/plans/ftr-168-implementation.md` — Full implementation plan (Stage 3 section)
2. `~/prj/yogananda-teachings/docs/prompts/stg-012-pipeline.md` — Stage 2 results section has learnings that inform this stage
3. `packages/mcp-server/src/services/workflow-executor.ts` — Current executor
4. `packages/mcp-server/src/services/experiment.ts` — Current experiment service
5. `packages/mcp-server/src/services/token-tracker.ts` — Current token tracker

### What Already Exists (from Stages 1-2)

- **3 tables:** `experiments`, `workflow_executions`, `token_events` (migrations 008–010)
- **ExperimentService:** create (with GitHub scaffold), list, describe, signal handling
- **WorkflowExecutor:** full pipeline (Research → Design → Approval Gate → Build → Validate), re-build on validation failure, inter-stage artifact validation, SDK `query()` per stage
- **TokenTracker:** per-stage event recording, experiment cost summary, project cost summary
- **7 MCP tools:** `experiment_create`, `experiment_list`, `experiment_describe`, `workflow_run`, `workflow_status`, `design_approve`, `cost_summary`
- **5 roles:** builder, validator, researcher, designer, lead-engineer (in `packages/mcp-server/src/roles/`)
- **Types:** Experiment, WorkflowExecution, WorkflowConfig, StageResult, TokenEvent
- **Experiments:** `rana/exp-hello-world-mmxz5fd0` (Stage 1), meditation timer (Stage 2)

### Stage 2 Learnings (address these)

Capture learnings from the Stage 2 test here once available. Areas to evaluate:
- Did the approval gate work reliably? Any signal timing issues?
- Did token tracking match Bedrock billing? What was the cost delta?
- Did the researcher role produce useful synthesis? What was missing?
- Did the designer role produce viable specs? Were artifacts sufficient for the builder?
- Did validation catch genuine issues? Were re-builds effective?
- What was the total experiment cost? Is Batch API optimization worth pursuing?

### Model Version Constraint

Use explicit Bedrock model IDs for v4.6:
- Sonnet 4.6: `us.anthropic.claude-sonnet-4-6-v1`
- Opus 4.6: `us.anthropic.claude-opus-4-6-v1`
- Haiku 4.5: `us.anthropic.claude-haiku-4-5-20251001-v1:0`

### What to Build

#### 1. Database additions

New migration(s) continuing the sequence:

```sql
-- experiment_quality
CREATE TABLE experiment_quality (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES experiments(id),
  dimension TEXT NOT NULL,
  score NUMERIC(3,2) NOT NULL CHECK (score >= 0 AND score <= 1),
  evidence TEXT,
  reviewer_role TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_experiment_quality_experiment ON experiment_quality(experiment_id);
```

#### 2. Validation framework (FTR-172)

New `packages/mcp-server/src/services/validation.ts`:
- **Gate runner:** Executes validation gates with configurable pass criteria
- **Three-valued semantics:** pass / fail / inconclusive (not binary)
- **Adaptive re-run:** Veto gates always triple-run; standard gates re-run only on confidence < 0.85. ~40% cost reduction vs triple-run-all.
- **Result aggregation:** Majority vote across runs, with inconclusive counting as neither pass nor fail

#### 3. NotificationService (FTR-174)

New `packages/mcp-server/src/services/notifications.ts`:
- AWS SES integration for key state transitions
- Calm templates (PRI-08): no urgency, no gamification, no engagement tricks
- Key events: experiment created, approval gate reached, pipeline completed, pipeline failed, budget exceeded
- Quiet hours: no notifications between 10 PM and 7 AM local time

#### 4. New roles (+5)

In `packages/mcp-server/src/roles/`:
- `accessibility-auditor.md` — WCAG 2.1 AA audit. Keyboard, screen reader, contrast, touch targets. Uses Haiku for cost.
- `security-auditor.md` — OWASP top 10, dependency audit, secrets exposure. Uses Haiku.
- `principles-validator.md` — Checks experiment against PRI-01 through PRI-12. Uses Opus for interpretive judgment.
- `low-bandwidth-tester.md` — Tests on simulated 2G/3G. Bundle size, FCP, progressive enhancement. Uses Haiku.
- `stakeholder-communicator.md` — Generates non-technical summary of experiment results. Uses Sonnet.

#### 5. Dashboard — Platform Pulse

Minimal operational dashboard (can be a simple Next.js app or static page):
- Experiment list with status badges
- Experiment detail view: stage history, cost breakdown, quality scores
- Design approval UI: view design artifacts, approve/reject with comments
- Platform Pulse: active experiments, total cost this month, recent completions

#### 6. FTR-175 Deep Research upgrade

Upgrade the researcher role from single-agent to dual-platform:
- Gemini API automated research (programmatic, broad)
- Claude Deep Research manual prompt (deep, interpretive)
- Synthesis step merging both into `research-synthesis.md`

#### 7. Convocation 2027 test

Run a real experiment for Convocation 2027. IT is primary reviewer, not executives.

**Success criteria:**
1. Pipeline completes: prompt → deployed site at experimental URL
2. Design-approval gate produces meaningful feedback from IT reviewer
3. Cost tracking within 5% of Bedrock billing
4. Validation catches genuine issues
5. Non-technical IT reviewer understands Platform Pulse

### Suggested Session Breakdown

**Session 1:** Database + Validation framework + NotificationService
**Session 2:** 5 new roles + validation integration into WorkflowExecutor
**Session 3:** Dashboard (Platform Pulse) + FTR-175 deep research upgrade
**Session 4:** Convocation 2027 experiment end-to-end

### Governing FTRs

- FTR-168 (umbrella), FTR-169 (lifecycle), FTR-170 (orchestration)
- FTR-171 (roles), FTR-172 (validation), FTR-174 (operations/cost)
- FTR-175 (deep research)
