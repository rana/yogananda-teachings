---
ftr: 168
title: "AI Agent Platform — Vision"
summary: "Strategic vision for autonomous AI agent platform empowering SRF staff to create applications"
state: proposed
domain: foundation
governed-by: [PRI-01, PRI-05, PRI-08, PRI-09, PRI-12]
depends-on: [FTR-093, FTR-099, FTR-083]
re-evaluate-at: M3d boundary
---

# FTR-168: AI Agent Platform — Vision

## Rationale

SRF IT needs to empower staff, monastics, and YSS partners to create digital applications autonomously — from a Yearly Convocation website to proof-of-concepts to full products. The vision: an operations portal where a staff member enters a prompt and a team of AI agents builds an entire end-to-end distributed application, with email delivery of results.

Three existing repos form the foundation: yogananda-teachings (portal + 43 skills + 164 FTRs), yogananda-platform (27 MCP tools, environment engine, review overlay, cost tracking), and yogananda-design (design tokens, semantic language, pattern library).

This is the umbrella FTR. It captures the staff experience (north star), governs the sub-FTRs (FTR-169–177), and establishes the principle constraints, governance model, and constraint durability mechanisms that apply across all components.

**Principle constraints:**
- PRI-01: Agent-built sites displaying teachings must maintain verbatim fidelity. AI generates UI/code, never content. Spiritual passages are sealed immutable data blocks that builder agents place but cannot modify.
- PRI-05: Every agent-built application must pass low-bandwidth validation (Rural 2G Tester agent).
- PRI-08: Notifications are calm — digest mode by default, no urgency theater, quiet hours respected.
- PRI-09: Observability is DELTA-compliant — Sentry/New Relic track what happened, never who.
- PRI-12: The platform is AI-native — MCP tools are the primary interface, Claude Code is the universal substrate.

**Human oversight (research-informed):**

- **Mandatory human checkpoint after Design, before Build.** Both deep research reports identify this as the most dangerous assumption gap: non-technical staff providing a prompt sufficient for a complete application without intervening oversight. If staff can't specify what they want, the pipeline burns compute building the wrong thing.
- **Sampled independent technical audit.** Not every experiment — but a random sample of promoted experiments reviewed by technical humans (not just staff approval). Prevents automation bias (documented across 35 peer-reviewed studies: rubber-stamp approval is statistically predicted, not hypothetical).
- **Trust Graduation Framework.** Agent autonomy levels: Intern (read-only), Junior (propose-to-queue), Senior (direct action with logging), Principal (direct action). Content-facing agents permanently locked to Junior — human approves all content placement. Builder agents graduate based on track record. Framework prevents gradual erosion of constraints over time.
- **AI-burnout paradox awareness.** Supervising AI output may be MORE cognitively exhausting than building manually (Gemini Prompt 2). Platform could overwhelm contemplative users. Mitigation: promptframes, visual diffs, calm review interfaces — empirical testing with actual SRF staff required before scaling.

## Specification

### The Staff Experience (North Star)

A staff member opens `yogananda.tech/ops`, clicks "New Experiment," and:

1. Selects a pre-populated prompt template (or writes their own)
2. Selects a workflow template (toggleable stages, configurable agents)
3. Chooses model options (cost-optimized default, all-Opus premium)
4. Clicks Run — platform creates repo, environment, executes agent pipeline, sends email
5. Reviews result at experimental URL using review overlay
6. Promotes to dev (manual approval required) or declines (preserved as record)

### Constitutional Compliance Scoring (Absorbed from FTR-174)

No standard monitoring tools exist for spiritual fidelity drift. The platform needs "constitutional compliance scoring" — drift detection for **values** (verbatim fidelity, calm technology, DELTA privacy), not just **accuracy**.

**What this monitors:**
- Are agent-built sites gradually drifting from PRI-01 verbatim fidelity? (subtle paraphrasing creeping in)
- Are notifications becoming less calm over time? (urgency theater drift)
- Are DELTA boundaries being eroded? (tracking creep)
- Are design system tokens being overridden? (visual identity drift)

**Implementation:** Periodic Opus-level review of a random sample of promoted experiments against the full PRI-01-12 constraint set. Scores tracked over time. Regression alerts if scores decline.

### Policy-as-Code for Constraint Durability (Absorbed from FTR-174)

Governance rules encoded in platform infrastructure, not policy documents. Rules in code survive leadership transitions. Rules in documents drift.

- PRI-01 enforcement: sealed immutable content blocks (FTR-172) — architectural, not policy
- PRI-08 enforcement: notification rate limits in platform config — mechanical, not cultural
- PRI-09 enforcement: DELTA compliance checks in CI gates (FTR-172) — automated, not manual review
- Content-facing agent trust level: permanently locked to Junior in platform config — structural, not discretionary
- Trust Graduation thresholds: encoded in platform config with change audit trail — not adjustable without executive approval

### Content-Facing Agent Definition

"Content-facing agents" are those with write access to the experiment's content rendering — builder agents that place sealed content blocks and any agent that determines which passages appear on a page. These agents are permanently locked to Junior trust level (`authority=human`), regardless of track record.

Agents that **read** content for audit purposes (Content Integrity Auditor, Principles Validator) are **not** content-facing — they validate but never modify what appears. Validation agents operate at whatever trust level they've earned.

The distinction is write-path vs. read-path: if an agent can influence which teachings a seeker sees, it's content-facing.

### Trust Graduation Governance

The Trust Graduation Framework defines autonomy levels, but who decides when an agent graduates?

| Transition | Authority | Data Required |
|------------|-----------|---------------|
| Intern → Junior | IT lead | Agent can read and produce structured output without errors for 5+ experiments |
| Junior → Senior | IT lead + quality score | Quality score above threshold across 10+ experiments, zero PRI violations |
| Senior → Principal | Executive approval | 25+ experiments, zero security/content violations, cost within budget 95% of time |
| Any → Intern (demotion) | Automatic | Any PRI-01 violation or security gate failure triggers immediate demotion |
| Content-facing agents | Permanent Junior | Not eligible for graduation. Encoded in platform config, not policy. |

### Sub-FTR Map

| FTR | Title | Domain | Focus |
|-----|-------|--------|-------|
| FTR-169 | Experiment Lifecycle | operations | State machine, audit trail, resource isolation |
| FTR-170 | Agent Workflow Orchestration | operations | DAG engine, durable execution, inter-stage contracts |
| FTR-171 | Agent Role Registry | foundation | Hierarchical teams, role definitions, AGENTS.md |
| FTR-172 | AI Validation Gates | operations | Three-valued gates, sealed content, observability |
| FTR-173 | Comparative Analysis Engine | operations | Model/workflow/prompt A/B, self-improvement loop |
| FTR-174 | Glass Box Operations and Cost Tracking | operations | Gateway layer, token tracking, budget enforcement |
| FTR-175 | Deep Research Integration | operations | Dual-platform research, prompt design, synthesis |
| FTR-176 | Staff Empowerment and Onboarding | experience | AI-burnout mitigation, notifications, onboarding |
| FTR-177 | Autonomous Skill Ecosystem | foundation | Authority parameter, JIT loading, new skills |

### Workflow Templates (Pre-populated)

| Template | Stages | Use Case |
|----------|--------|----------|
| Full Autonomous Build | All | New standalone site (Convocation, retreat, campaign) |
| Feature Addition | Research, Build, Validate, Deploy | Add feature to existing project |
| Research Only | Research, Notify | Deep research report with synthesis |
| Design Exploration | Research, Design, Notify | Visual concepts without implementation |
| Proof of Concept | Design, Build, Deploy, Notify | Quick prototype |
| CI Validation | Validate only | Run AI validation battery on existing branch |
| Content Site | Research, Build, Deploy, Notify | Content-heavy site from materials |

## Edge Cases

- **Sub-FTR conflict.** FTR-172 says "security gate has absolute veto" and FTR-170 says "mandatory design-approval gate before Build." If a human approves a design that the security gate later vetoes during Build, the human approved something that can't be built securely. Resolution: the design-approval gate should include a preliminary security scan (lightweight, not the full triple-run) to catch obvious violations before Build invests tokens.
- **Trust Graduation data sparsity.** An agent role used only 3 times can't meet the "10+ experiments" threshold for Junior → Senior promotion. Infrequently-used roles remain at low trust indefinitely. This is acceptable — infrequent use means low risk from manual oversight, and low trust is the safe default.
- **Constitutional compliance scoring detects drift but can't explain it.** The scoring system reports "PRI-01 compliance dropped from 9.2 to 7.8 this month" but can't identify which experiments caused the drift or why. The scoring must link each score to specific experiments and specific findings, enabling root-cause investigation.
- **Cross-repo coordination.** Changes to yogananda-skills (FTR-177) affect agent behavior in yogananda-platform experiments. A skill update that changes output format could break downstream agents. Skill versions must be pinned per-experiment (like dependency versions), not floating.

## Error Cases

- **Design approved, Build fails repeatedly.** The design was conceptually sound but architecturally infeasible (e.g., requires a cloud service not in the approved stack, or demands real-time features incompatible with SSR). No "return to Design with Build's failure context" loop is defined. Resolution: after 3 failed Build iterations, the experiment returns to `designing` state with Build's error context injected into the Design agents' prompts. Human re-approval required before second Build attempt.
- **Policy-as-code constraint bypassed by new code path.** A PRI-09 DELTA constraint is enforced in CI gates, but an agent-built site introduces a new analytics library that the gate doesn't know to check. Policy-as-code must be expressed as deny-by-default (block unknown analytics libraries), not allow-by-default (only check known violations).
- **Governance rule change with running experiments.** An executive changes the Trust Graduation threshold while experiments are running. Running experiments should complete under the rules they started with. New rules apply to new experiments only. Version governance rules like role definitions.
- **First experiment fails spectacularly.** The Convocation 2027 site (first experiment candidate) produces a site that violates multiple PRIs. This poisons stakeholder confidence in the entire platform. Mitigation: the first experiment should be a controlled, well-scoped test (not a high-stakes deliverable) with IT as the primary reviewer, not executive stakeholders.

## Notes

Full architectural vision: `docs/plans/ai-agent-platform.md` (27 sections).

**Deep research completed (2026-03-18).** 4 reports (Claude + Gemini × 2 prompts), synthesis in `docs/reference/synthesis-ai-agent-platform-2026.md`. Key findings integrated into FTR-168–176. No precedent exists for the full vision — the four-way combination (multi-agent + autonomous building + verbatim fidelity + delivery pipeline) is genuinely unprecedented. Closest halves: Sefaria (sacred text AI with fidelity constraints) + Tithe.ly (autonomous church app building).

**Dependencies on sibling repos:**
- yogananda-platform: Experiment engine, MCP tools, dashboard extensions
- yogananda-skills: New skills (decide, handoff, escalate), authority parameter, skill environments
- yogananda-design: Design tokens for all agent-built sites

**First experiment candidate:** SRF Yearly Convocation 2027 website — real, time-bounded, demonstrable.
