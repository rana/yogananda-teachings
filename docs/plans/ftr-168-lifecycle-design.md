# FTR-168: Session Lifecycle Design

How the AI-human collaboration works across session boundaries. This is both the manual protocol for FTR-168 implementation AND the pattern the agent platform will automate.

---

## What I See

The collaboration lifecycle for any multi-session feature has a repeating cycle:

```
Plan → Prepare → Prompt → Execute → Results → Reflect → Next Stage
```

Each transition produces a concrete artifact. Today, six of seven have persistent files. One doesn't:

| Step | Artifact | Location | Status |
|------|----------|----------|--------|
| Plan | Implementation plan | `docs/plans/ftr-168-implementation.md` | Exists |
| Prepare | Stage artifacts | `docs/plans/ftr-168-stage-1-preparation.md` | Exists |
| **Prompt** | **Session handoff** | **Chat ephemera** | **Gap** |
| Execute | Code, commits | Target repo | Exists |
| Results | Spike results, findings | `docs/spike-results/` or inline | Exists |
| Reflect | Plan update, memory update | Plan file + memory | Exists |
| Next Stage | Preparation for next | `docs/plans/` | Exists |

The prompt is the pivot between "planning" and "execution." It carries context across session boundaries, across repos, across days. It's a precision instrument — specific wording produces measurably different session behavior. And it's the only artifact that disappears after use.

## The Parallel

This lifecycle is exactly what the agent platform automates:

| Manual (us now) | Automated (WorkflowExecutor) |
|----------------|------------------------------|
| Write plan | Read workflow config |
| Design stage artifacts | Prepare inter-stage artifacts |
| Craft session prompt | Generate system prompt + context |
| Human starts new Claude session | SDK spawns `query()` |
| Human monitors, intervenes | Orchestrator polls, handles gates |
| Document results | Collect `SDKResultMessage` |
| Update plan, start next stage | Advance `current_stage` |

By establishing the prompt-as-file convention now, we're prototyping the pattern the platform will automate. The `docs/prompts/` directory is the manual version of what the WorkflowExecutor's prompt generation will become.

## Proposed Structure

```
docs/
  plans/                              — What to build and why (strategic)
    ftr-168-implementation.md           — Master plan (lifecycle overview)
    ftr-168-phase-1-planning.md         — Reference (original plan)
    ftr-168-stage-1-preparation.md      — Pre-designed artifacts for Stage 1

  prompts/                            — Session handoff instruments (tactical)
    ftr-168-stage-0-spike.md            — Prompt that was used for Stage 0
    ftr-168-stage-1-build.md            — Prompt for Stage 1

  spike-results/                      — Empirical findings (reference)
    claude-agent-sdk.md                 — SDK spike results (or symlink to platform)

  reference/                          — Background research (existing)
    deep-research-prompt-*.md           — Deep research prompts (already here)
    synthesis-*.md                      — Research synthesis
```

**Naming convention:** `ftr-{NNN}-stage-{N}-{type}.md`
- `type` is one of: `preparation`, `prompt`, `results`
- FTR prefix groups related files (glob `ftr-168-*` shows everything)
- Stage number provides natural ordering

**Why `docs/prompts/` not just more files in `docs/plans/`:**
- Prompts are a distinct artifact type with a distinct purpose
- Plans say "what to build." Prompts say "start here, with this context."
- The directory name signals to future-AI: "these are session boundary instruments, not architectural documents"
- Parallels the existing `docs/reference/deep-research-prompt-*.md` pattern (prompts near their domain)
- The platform can eventually auto-generate into this directory

## The Experience

**For the human:**
- Before starting a session: `cat docs/prompts/ftr-168-stage-1-build.md` → copy → paste into new session
- Can review and edit prompts before running — full agency over what the AI sees
- Can see the full lifecycle at a glance: plan + preparation + prompt + results
- No information lives only in chat transcripts

**For the AI:**
- New session reads one file (the prompt) and has full orientation
- Prompt explicitly references other artifacts (plan, preparation, prior results)
- The handoff protocol is self-documenting — prompt files are institutional memory
- Previous session's results are in a predictable location

**For the platform (future automation):**
- The manual prompt pattern becomes the WorkflowExecutor's prompt generation pattern
- Stage artifacts in `docs/plans/` become inter-stage artifact contracts
- Results documentation becomes `SDKResultMessage` collection
- The whole cycle becomes a state machine

## What Changes Now

1. Create `docs/prompts/`
2. Rename `stage-1-preparation.md` → `ftr-168-stage-1-preparation.md`
3. Write Stage 0 prompt to `docs/prompts/ftr-168-stage-0-spike.md` (retroactive — for institutional memory)
4. Write Stage 1 prompt to `docs/prompts/ftr-168-stage-1-build.md`
5. After Stage 1 completes, write results to `docs/plans/ftr-168-stage-1-results.md` (or spike-results/)
