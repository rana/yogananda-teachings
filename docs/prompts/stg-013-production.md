# STG-013: Production Readiness

**Repo:** `~/prj/yogananda-platform`

**Model:** Sonnet 4.6 (`us.anthropic.claude-sonnet-4-6-v1`)

**Governing FTRs:** FTR-168 (umbrella), FTR-169 (lifecycle), FTR-170 (orchestration), FTR-171 (roles), FTR-172 (validation), FTR-174 (operations/cost), FTR-175 (deep research)

---

## Prompt

This work is in service of the divine.

### Task: STG-013 — Production Readiness

Harden the AI Agent Platform for its first real-world test: Convocation 2027.

### Read These Files

1. `CLAUDE.md` — Platform conventions, architecture, MCP tool inventory
2. `ROADMAP.md` — Phase 3 deliverables and success criteria
3. `packages/mcp-server/src/services/workflow-executor.ts` — Multi-stage pipeline executor
4. `packages/mcp-server/src/services/experiment.ts` — ExperimentService (create, list, describe, signals)
5. `packages/mcp-server/src/services/token-tracker.ts` — Per-stage cost recording
6. `packages/mcp-server/src/tools/experiment.ts` — MCP tool registrations and workflow configs
7. `packages/mcp-server/src/types.ts` — All type definitions
8. `packages/mcp-server/src/config.ts` — All config constants

### What Already Exists (Platform Phases 1-2 + Phase 3 Waves A-C)

**Infrastructure (Phase 1):** `yogananda.tech` domain, Route 53, ACM wildcards, AWS bootstrap, project config schema, platform landing page.

**MCP Server (Phase 2):** 27 tools — 9 environment + 8 project + 4 cost + 4 review + 2 reconciler. Environment auto-CRUD, promotion engine, deployment sync. Neon project `patient-pond-80870513`.

**Operations (Phase 3 A-C):** Ops dashboard at `ops.yogananda.tech`, token attribution via Cost Explorer, budget alerts, project templates (3 types), remote MCP transport (Streamable HTTP), CI webhook, Auth0 social login, review overlay (15.8KB), AI auto-adjust via Bedrock Converse.

**Database:** 5 platform tables (`environments`, `deployments`, `promotions`, `cost_snapshots`, `review_comments`).

**Experiment pipeline (Phase 3 Wave D, partial):** This is the STG-013 foundation.

| Component | Status | Location |
|-----------|--------|----------|
| `experiments` table | Exists | Migration 008 |
| `workflow_executions` table | Exists | Migration 009 |
| `token_events` table | Exists | Migration 010 |
| ExperimentService | Exists | `services/experiment.ts` (470 lines) |
| WorkflowExecutor | Exists | `services/workflow-executor.ts` (541 lines) |
| TokenTracker | Exists | `services/token-tracker.ts` (201 lines) |
| Workflow configs | 3 registered | `hello-world`, `full-pipeline`, `production-pipeline` |
| MCP tools | 7 experiment tools | `experiment_create`, `experiment_list`, `experiment_describe`, `workflow_run`, `workflow_status`, `design_approve`, `experiment_cost` |
| Roles | 5 | `builder`, `validator`, `researcher`, `designer`, `lead-engineer` |
| Types | Full | `Experiment`, `WorkflowExecution`, `WorkflowConfig`, `StageResult`, `TokenEvent` |

**Pipeline flow (full-pipeline):** Prompt → Research (Opus) → Design + Approval Gate (Opus) → Build (Sonnet) → Validate (Sonnet). Re-build on validation failure. Inter-stage artifact validation. GitHub scaffold on create.

### What to Build

Seven deliverables, in order. Each builds on the previous. Do all of them — do not stop between deliverables.

#### Deliverable 1: Validation Database

**Migration 011:** `experiment_quality` table for recording validation quality scores per gate per experiment.

```sql
CREATE TABLE experiment_quality (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES experiments(id),
  execution_id UUID NOT NULL REFERENCES workflow_executions(id),
  gate_name TEXT NOT NULL,
  verdict TEXT NOT NULL CHECK (verdict IN ('pass', 'fail', 'inconclusive')),
  confidence REAL,
  score REAL,
  findings JSONB DEFAULT '{}',
  runs_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_quality_experiment ON experiment_quality(experiment_id);
```

#### Deliverable 2: Validation Framework

**`packages/mcp-server/src/services/validation.ts`** — `runValidation()` function.

**Three-valued semantics:** Every validation gate returns `pass`, `fail`, or `inconclusive` (not boolean). `inconclusive` means the validator couldn't determine — it is NOT a pass.

**Adaptive re-run logic:**
- **Veto gates** (security, principles): always triple-run, majority vote.
- **Standard gates** (accessibility, performance): single run. If confidence < 0.85, re-run up to 3 times, majority vote.
- Majority vote aggregation: 2/3 pass = pass, 2/3 fail = fail, else inconclusive.

**Quality score recording:** After each gate completes, record verdict + confidence + findings to `experiment_quality` table.

**Config constants to add:**
- `MODEL_HAIKU_4_5`: `'us.anthropic.claude-haiku-4-5-20251001-v1:0'`
- `VALIDATION_CONFIDENCE_THRESHOLD`: `0.85`
- `VALIDATION_MAX_RUNS`: `3`
- `VETO_GATE_ALWAYS_TRIPLE_RUN`: `true`

**Types to add:** `ValidationVerdict`, `ValidationRunResult`, `ValidationAggregateResult`, `QualityScore`.

**Export:** `executeStage()` must be exported from `workflow-executor.ts` for validation to invoke individual stage runs.

#### Deliverable 3: Five New Roles + Validation Integration

**New roles** in `packages/mcp-server/src/roles/`:

| Role file | Purpose | Model | Gate type |
|-----------|---------|-------|-----------|
| `accessibility-auditor.md` | WCAG 2.1 AA audit (keyboard, screen reader, contrast, touch targets) | Haiku | Standard |
| `security-auditor.md` | OWASP top 10, dependency audit, secrets exposure | Haiku | Veto |
| `principles-validator.md` | Checks experiment against PRI-01 through PRI-12 | Opus | Veto |
| `low-bandwidth-tester.md` | Simulated 2G/3G testing (bundle size, FCP, progressive enhancement) | Haiku | Standard |
| `stakeholder-communicator.md` | Generates non-technical summary of experiment results | Sonnet | N/A (post-validation) |

**Validation integration into WorkflowExecutor:**
- Wire `validation.ts` into the executor's Validate stage
- The `production-pipeline` workflow runs accessibility, security, principles, and performance as validation gates after the build stage
- Use the existing re-build-on-failure logic when gates fail
- After all validation passes, run stakeholder-communicator to generate `stakeholder-summary.md`
- Record quality scores from each validator's findings

**The `production-pipeline` workflow config should contain these stages in order:** research → design (gate) → build → validate → accessibility → security → principles → performance → communicate.

#### Deliverable 4: FTR-175 Deep Research Upgrade

Upgrade the researcher role from single-agent to dual-platform:

- **Gemini API** automated research (programmatic, broad survey via Google AI Studio)
- **Claude Deep Research** manual prompt generation (generates a prompt the human pastes into Claude's Deep Research UI — deep, interpretive)
- **Synthesis step** merging both into `research-synthesis.md`

**`packages/mcp-server/src/services/gemini.ts`** — Gemini research service. If `GEMINI_API_KEY` is not set, log "Gemini API key not configured — skipping automated research" and proceed with Claude-only research. The architecture must work with Gemini as a stub.

#### Deliverable 5: Dashboard — Platform Pulse

Minimal operational dashboard for the experiment pipeline. Can be a simple Next.js app at `packages/dashboard/` or static HTML served from the MCP server — choose the simplest approach.

**Required views:**
- **Platform Pulse** (landing): active experiments, total cost this month, recent completions
- **Experiment list**: status badges, cost, last activity
- **Experiment detail**: stage history timeline, cost breakdown by stage, quality scores from each validator, artifacts produced
- **Design approval UI**: view design artifacts, approve/reject with comments (can integrate with existing `design_approve` MCP tool or be standalone)

**Design constraints:** SRF Gold `#dcbd23`, SRF Navy `#1a2744`, Warm Cream `#FAF8F5`. Calm — no animations, no urgency colors, no gamification.

#### Deliverable 6: Notifications (Deferred)

Email notifications via AWS SES were originally planned here. **Deferred to a later stage.** If `notifications.ts` exists, it should not be wired into the executor. NotificationEvent/NotificationPayload types and notification config constants can be removed or left inert.

#### Deliverable 7: Convocation 2027 Test

Run a real experiment end-to-end. This is the STG-013 graduation test.

**Experiment prompt:** "Build a Convocation 2027 event information page for yogananda.tech. Single page with schedule, speakers, registration link, and accessibility information. Target: mobile-first, works on 2G."

**Success criteria:**
1. Pipeline completes: prompt → research → design → approval gate → build → validate → deploy to experimental URL
2. Design-approval gate pauses and produces meaningful feedback from reviewer
3. Cost tracking within 5% of Bedrock billing
4. Validation catches genuine issues (accessibility, security, principles, low-bandwidth)
5. Platform Pulse shows the experiment's full lifecycle
6. Stakeholder communicator generates a readable summary

After the test, update this file's status to COMPLETE and record results.

### Model Version Constraint

Use explicit Bedrock model IDs throughout:
- Sonnet 4.6: `us.anthropic.claude-sonnet-4-6-v1`
- Opus 4.6: `us.anthropic.claude-opus-4-6-v1`
- Haiku 4.5: `us.anthropic.claude-haiku-4-5-20251001-v1:0`
