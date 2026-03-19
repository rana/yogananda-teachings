---
ftr: 177
title: "Autonomous Skill Ecosystem"
summary: "The Instrument Principle: skills unchanged, agent protocol skills as new species, trust via role prompts"
state: proposed
domain: foundation
governed-by: [PRI-12]
depends-on: [FTR-168, FTR-171]
re-evaluate-at: STG-013
---

# FTR-177: Autonomous Skill Ecosystem

## Rationale

The 43 yogananda-skills are cognitive instruments — precision-tuned prompt language that activates specific modes of thinking. `invoke` works through what it *doesn't* say; the negative space creates room for the highest register of cognition. `archaeology` builds momentum across 12 layers where each prepares the ground for the next. `crystallize` applies the editorial knife with a specific weight and angle.

The original design for this FTR proposed modifying 6 skills and creating 10 new ones to serve autonomous agents. That was the wrong cut. Reading each skill carefully reveals: **none of them hard-block on human input.** `invoke` has no "present to user" instruction. `archaeology` without `--dialogue` runs all layers and delivers. `converge` emits STABLE/CONTINUE/STUCK as machine-parseable directives. `land` triages actions into clear/judgment/human categories — an autonomous agent handles the "human calls" category through different behavior, not through a different skill.

The gap isn't in the skills. It's in five cognitive capabilities that humans provide naturally but agents lack entirely: structured decision-making, context packaging for handoff, boundary detection for escalation, error recovery reasoning, and multi-perspective debate.

Skills are instruments. Agents are performers. You don't put a MIDI interface on a Stradivarius. You write new compositions and let the performer adapt.

## Specification

### The Instrument Principle

**All 43 existing skills are unchanged.** No `--structured` flags. No `--autonomous` modes. No `--authority` toggles. The skills are a completed cognitive toolkit for human-AI collaboration. They are precision instruments — specific wording produces measurably different cognitive behavior. Autonomous agents use them exactly as they are.

**Evidence from reading the actual skills:**

| Skill | Why It Already Works for Agents |
|-------|-------------------------------|
| `invoke` | Pure cognitive activation. No instructions to "present to user" or "wait for input." Output is rich prose — the agent writes artifacts from it. |
| `crystallize` | Closing questions ("What am I not asking?") are invitations, not blocking gates. An agent answers them or moves on. |
| `archaeology` | Without `--dialogue`, runs all 12 layers and delivers the complete excavation. `--layers F2,F9,F11` enables selective composition for agents that need specific cognitive moves. |
| `converge` | Emits exactly one directive: STABLE, CONTINUE, REDIRECT, or STUCK. Machine-parseable by design. STUCK says "wait for user input" — the agent's role prompt (not the skill) determines what happens next. |
| `land` | Triages into clear calls, judgment calls, and human calls. For clear and judgment calls, it acts. For human calls, it presents and waits. An autonomous agent uses `decide` (agent protocol skill) for judgment calls and `escalate` for human calls. The skill doesn't change; the agent's behavior around it changes. |
| `propose` | Accepts prose input and produces structured proposals. An agent provides structured requirements as prose; the output is naturally structured. |

**The performer adapts, not the instrument.** An agent invoking `invoke` gets the same rich, register-driven cognitive activation a human gets. The agent then writes its required artifacts (unified-spec.md, architecture.json) *informed by* invoke's output. The invoke output itself is preserved in the session transcript (`.experiment/sessions/`) — rich context for audit, for human review, for the glass box (FTR-174).

### Two Skill Pools

Skills for autonomous agents come from two sources:

| Pool | What It Contains | Where It Lives | Count |
|------|-----------------|----------------|-------|
| **Cognitive Instruments** | The 43 human-directed skills. Unchanged. | `yogananda-skills` repo | 43 |
| **Agent Protocol Skills** | Genuinely new capabilities that don't exist in human-directed work. | `yogananda-platform` repo (`packages/agent-orchestrator/skills/`) | 5 |

The pools are complementary. An agent's JIT skill budget (3-5 per stage) draws from both: 2-3 cognitive instruments + 1-2 protocol skills.

The separation is deliberate:
- `yogananda-skills` is the cognitive toolkit domain — instruments for human-AI collaboration. Its conventions (read project docs, closing questions, design autonomy) serve that purpose. It doesn't change.
- `yogananda-platform` is the autonomous platform domain — infrastructure for AI-directed AI. Agent protocol skills have different output contracts (structured JSON with confidence), different testing strategies (evaluated in pipeline context, not interactive context), and different evolution cadence.

### Agent Protocol Skills (5)

Five capabilities that humans provide naturally but agents lack without explicit cognitive structure. Each produces structured JSON with a `confidence` field (0.0–1.0).

**`decide` — Rubric-Based Autonomous Decision**

Agents without a decision framework oscillate or pick arbitrarily. `decide` provides the cognitive structure: given a question, options, and a weighted rubric, it evaluates and chooses.

```jsonc
// Input
{
  "question": "Calendar widget or static schedule for the convocation site?",
  "options": ["calendar-widget", "static-schedule"],
  "rubric": [
    { "criterion": "bundle_size_impact", "weight": 0.3, "threshold": "< 20KB" },
    { "criterion": "2g_performance", "weight": 0.3, "threshold": "FCP < 2s" },
    { "criterion": "user_comprehension", "weight": 0.2, "threshold": "no instruction needed" },
    { "criterion": "maintenance_burden", "weight": 0.2, "threshold": "no external dependency" }
  ]
}

// Output
{
  "decision": "static-schedule",
  "score": { "static-schedule": 0.87, "calendar-widget": 0.43 },
  "reasoning": "Static schedule wins on bundle (0KB vs ~45KB), 2G performance (no JS required), and maintenance (zero dependencies). Calendar widget adds timezone handling but the convocation is a single-venue, single-timezone event.",
  "confidence": 0.92,
  "dissent_notes": "If multi-timezone attendees are significant, revisit."
}
```

Ties produce `{decision: null, tie: true, options_tied: [...], suggested_tiebreaker}` and escalate. Never picks arbitrarily.

**`handoff` — Context Packaging for Downstream Agents**

Humans carry context naturally across conversations. Agents lose it at session boundaries. `handoff` structures what the next agent needs: what was decided, what's still open, what the dependencies are, and where the ambiguity lives.

```jsonc
// Output
{
  "summary": "Design phase complete. Unified spec covers 5 pages, SRF design system, no auth required.",
  "decisions": ["static-schedule over calendar", "SSR-only, no client JS for content pages"],
  "dependencies": ["yogananda-design tokens", "Neon branch for event data"],
  "ambiguities": ["Photo gallery: source images not yet provided by staff"],
  "confidence": 0.85
}
```

**`escalate` — Meta-Cognitive Boundary Detection**

Knowing when to stop and ask for help is a meta-cognitive capability agents lack by default. They either never escalate (overconfident) or always escalate (overcautious). `escalate` provides the boundary: given a decision point, confidence level, and impact assessment, it determines whether the agent should proceed or request human input.

Escalation has a timeout. After N hours with no human response (configurable, respects quiet hours per FTR-176), the experiment pauses with notification. Never hangs indefinitely.

**`recover` — Structured Error Diagnosis**

When something goes wrong, agents retry blindly or give up. `recover` provides structured recovery thinking: diagnose the error, generate recovery options with confidence and side effects, and track attempt count. After the hard cap (3-5 cycles, per FTR-172), it stops suggesting fixes and returns `{strategy: "escalate_to_human"}`. This breaks the fix-fix spiral (OWASP ASI08).

**`debate` — Multi-Perspective Argument Generation**

`steelman` defends the current approach. `inversion` flips assumptions. Neither generates arbitrary perspectives. `debate` takes a proposition and N perspectives (e.g., "argue from the user's perspective, the security team's perspective, and the cost perspective") and generates structured arguments from each, with impact scores and counter-arguments, then synthesizes.

Used by the Design Mediator to resolve conflicts between parallel design outputs — generate the strongest case for each design before choosing.

### Trust-Level Role Prompts (Replaces Authority Parameter)

The original design proposed an `authority` parameter that modifies how skills behave. The cleaner design: trust level shapes the agent's **role prompt** (FTR-171), which shapes how the agent **uses** skills. The skills don't change; the performer's instructions change.

The orchestrator fills autonomy instructions into the role prompt based on the agent's trust level (FTR-168 Trust Graduation Framework):

| Trust Level | Role Prompt Autonomy Instructions |
|-------------|----------------------------------|
| **Intern** | "Always produce proposals. Never take direct action. When `land` surfaces judgment calls, use `escalate` for all of them. When `converge` emits STUCK, pause and notify." |
| **Junior** | "Produce proposals for content-facing decisions. Use `decide` for technical decisions within your rubric. When `land` surfaces human calls, use `escalate`." |
| **Senior** | "Use `decide` for all decisions within your rubric. Use `escalate` only when confidence < 0.7 or when the decision affects PRI compliance. When `converge` emits STUCK, attempt one recovery via `recover`, then escalate." |
| **Principal** | "Use `decide` for all decisions. Log reasoning for audit. Escalate only for cross-experiment scope changes." |

Content-facing agents (FTR-168 definition: write-path to content rendering) are permanently Intern/Junior regardless of track record. Their role prompts always include: "Never place, modify, or remove sealed content blocks without human approval in the queue."

This design means:
- Zero changes to yogananda-skills
- Zero new parameters or flags
- Trust level is implemented where it belongs — in the agent's identity (role prompt), not in the agent's tools (skills)

### JIT Skill Loading

Context rot is real: every model gets worse as input length increases (Chroma Research). Doubling task duration quadruples failure rate (Cognition/Devin). 43 skills pre-loaded = 13K-22K tokens consumed before the agent does anything.

**Constraint:** Maximum 3-5 skills loaded per agent per stage. Drawn from both pools.

**Default skill sets by stage type:**

| Stage | Cognitive Instruments | Protocol Skills | Total |
|-------|----------------------|-----------------|-------|
| Research | `explore`, `gaps`, `archaeology` | `handoff` | 4 |
| Design | `invoke`, `scope`, `consequences` | `decide` | 4 |
| Mediation | `crystallize`, `converge` | `handoff`, `decide` | 4 |
| Build | `implement`, `verify` | `recover` | 3 |
| Validate | `review`, `mission-align`, `deep-review` | `escalate` | 4 |
| Adversarial | `threat-model`, `inversion`, `gaps` | — | 3 |

**Progressive disclosure:** Agents request additional skills mid-stage if needed, but start lean. The orchestrator (FTR-170) logs which skills each agent actually used — over time, this data refines the defaults (FTR-173 self-improvement loop).

**Compose chains and JIT budget:** `/compose gaps, crystallize, review` requires 3 skills loaded simultaneously. Compose chains count as a single skill load (their union of tokens). A chain of 4+ skills that exceeds the per-skill token budget is still within the compose budget — compose chains run sequentially, so only one skill's prompt is active at a time.

### Orchestrator Mechanical Concerns

Three capabilities that the original FTR-177 designed as skills are actually mechanical orchestrator functions — infrastructure, not cognition:

| Concern | Why It's Not a Skill | Orchestrator Implementation |
|---------|---------------------|----------------------------|
| **Convergence detection** | Measuring whether artifacts changed between iterations is a diff operation, not a cognitive one | Orchestrator diffs current artifacts against previous iteration. If delta is below threshold (token count, finding count, or a lightweight Haiku classification: "meaningful differences? yes/no"), iteration stops. |
| **Checkpointing** | Snapshotting state before a risky operation is `git commit` — mechanical | Orchestrator commits to git with a checkpoint tag. Rollback is `git reset --hard {SHA}`. The repo IS the state. |
| **Structured output validation** | Checking whether an agent produced the required artifacts in the right format is schema validation | Orchestrator validates each stage's output against the inter-stage data contracts (FTR-170). Missing or malformed artifacts trigger stage retry, then human escalation. |

### Skill Environment Configuration

Updated environment in `config/skill-environments.json`:

```jsonc
{
  "experiment-agent": {
    "description": "Skills for autonomous experiment execution",
    "default_calibration": {
      "directness": 10,
      "resolution": "high",
      "speculation": "bounded"
    },
    "stage_skills": {
      "research":    ["explore", "gaps", "archaeology", "handoff"],
      "design":      ["invoke", "scope", "consequences", "decide"],
      "mediate":     ["crystallize", "converge", "handoff", "decide"],
      "build":       ["implement", "verify", "recover"],
      "validate":    ["review", "mission-align", "deep-review", "escalate"],
      "adversarial": ["threat-model", "inversion", "gaps"]
    },
    "available_on_request": [
      "debate", "escalate", "recover", "decide", "handoff",
      "steelman", "drift-detect", "supply-chain-audit",
      "hardening-audit", "ops-review", "incident-ready",
      "land", "crystallize", "deep-review"
    ]
  }
}
```

Note: no `authority` key. Trust level is expressed in role prompts (FTR-171), not skill configuration.

### Skill Composability in Autonomous Context

`/compose` works as-is within a single agent session. `/compose gaps, crystallize, review` chains three cognitive instruments — the output of each feeds the next. This is the primary composition mechanism.

Cross-agent composition (Agent A's output feeds Agent B's skill chain) is handled by `handoff` + the orchestrator + inter-stage artifacts (FTR-170). `handoff` packages what matters; the orchestrator delivers it to the next session; the inter-stage contract validates it. `/compose` doesn't cross session boundaries.

The orchestrator can define compose chains in workflow config, executing them within a single Claude Code SDK session per stage.

## Edge Cases

- **Rich skill output vs. structured artifact requirements.** An agent uses `invoke` (rich prose) but the stage requires `architecture.json` (structured JSON). There's no `--structured` flag to bridge this. Resolution: the agent is the bridge. Its role prompt (FTR-171) specifies required artifacts. The agent uses `invoke` for creative exploration, then writes artifacts informed by that exploration. `invoke`'s rich output is preserved in the session transcript for audit; the structured artifact is the deliverable. The agent is a professional — it uses instruments and produces deliverables.
- **Confidence cascading across stages.** Agent A's `handoff` has confidence 0.6. Agent B makes a decision at confidence 0.8. The compound confidence is 0.48, below most thresholds, but neither agent knows the compound value. Resolution: the orchestrator tracks compound confidence across stages by reading confidence from inter-stage artifacts (`build-manifest.json` already has a confidence field). When compound confidence drops below threshold, the orchestrator triggers `escalate`.
- **Skill version interaction.** If `gaps` v2 produces findings in a different format than v1 and downstream agents expect v1, the pipeline breaks. Resolution: skill versions are locked per-experiment (like role versions per FTR-171 and workflow templates per FTR-170). Updates apply to new experiments only.
- **JIT loading and compose chains.** `/compose gaps, crystallize, review` loads 3 skills. With a protocol skill already loaded (e.g., `decide`), total is 4 — within the 3-5 budget. Chains of 5+ skills would exceed it. Resolution: compose chains run sequentially (only one skill prompt active at a time), so the token cost is the max of any single skill in the chain, not the sum. The JIT limit applies to simultaneously-active context, not to total skills invoked.
- **`archaeology --layers` for agents.** The `--layers` flag enables selective layer execution. An agent needing only Unconscious Patterns and Production Assessment runs `archaeology --layers F2,F11` — 2 of 12 layers, dramatically reducing tokens. This is the composition mechanism for archaeology's cognitive moves without fragmenting the skill.

## Error Cases

- **`decide` rubric produces a tie.** Two options score identically. The skill returns `{decision: null, tie: true, options_tied: [...], suggested_tiebreaker}` and the agent uses `escalate`. Never picks arbitrarily.
- **`escalate` with no human available.** Escalation during quiet hours or weekends. The experiment pauses with notification. After the configurable timeout (default 72 hours, matching FTR-170's design-approval gate timeout), the experiment enters `awaiting_human` state. Running experiments don't consume resources while waiting.
- **`recover` triggers fix-fix spiral.** Agent applies `recover`'s suggestion, problem gets worse, calls `recover` again. `recover` tracks attempt count in the stage context. After the hard cap (3-5 cycles per FTR-172), it refuses further suggestions: `{diagnosis: "iteration cap reached", recovery_options: [{strategy: "escalate_to_human"}]}`.
- **Agent ignores role prompt autonomy instructions.** An Intern-level agent uses `decide` instead of `escalate` for a judgment call, bypassing human oversight. Resolution: the orchestrator validates agent behavior against trust level. Intern agents' `decide` outputs are treated as proposals (queued for review), not as actions — the enforcement is in the orchestrator, not in the skill.

## Notes

Full detail: `docs/plans/ftr-168-ai-agent-platform.md` section 26.

Agent protocol skills live in `yogananda-platform` (`packages/agent-orchestrator/skills/`). Cognitive instruments live in `yogananda-skills`. Both repos are consumed by the orchestrator; both are locked per-experiment for version stability.

**The Instrument Principle emerged from reading the actual skills.** The original design assumed skills needed modification for autonomous agents. Reading `invoke`, `crystallize`, `archaeology`, `converge`, and `land` revealed that none hard-block on human input. The cognitive activation is the same regardless of who invokes it — human or agent. What changes is the performer's context (role prompt) and the performer's supporting tools (protocol skills), not the instrument.

**Relationship to FTR-171 (Agent Role Registry):** FTR-171 defines WHO (agent identities, team hierarchy). This FTR defines HOW (cognitive tools + protocol skills). The bridge between them is the role prompt: FTR-171 specifies the prompt; this FTR specifies the trust-level autonomy instructions that parameterize it.

**Open questions:**
- Can agents create new protocol skills during an experiment? Probably not — protocol skills need testing in pipeline context. But agents can *propose* new skills, queued for human review and testing before platform inclusion.
- The five protocol skills are a starting set. After 50+ experiments, usage data (FTR-173 self-improvement loop) may reveal that agents need additional protocol capabilities, or that some of the five are rarely used. Quarterly review.

**Research basis (2026-03-18):** JIT skill loading (Chroma Research context rot, Cognition/Devin failure rate doubling). Trust-level parameterization informed by Trust Graduation Framework (both Prompt 2 reports). The decision to NOT modify existing skills is informed by the AgentAssay finding that structured output requirements degrade creative task quality by 15-23% — the same finding that motivated structured output in the original design actually argues against it for cognitive skills.
