---
ftr: 156
title: Dream a Feature
summary: "Claude Code skill orchestrating autonomous feature lifecycle from dream to preview deployment"
state: proposed
domain: operations
governed-by: [PRI-12]
depends-on: [FTR-110, FTR-094, FTR-095]
---

# FTR-156: Dream a Feature

## Proposal

**Status:** Proposed
**Type:** Feature
**Governing Refs:** FTR-110 (Multi-Environment — branch=environment), FTR-094 (Neon Platform — branching), FTR-098 (MCP Strategy), FTR-095 (Infrastructure), FTR-159 (Feature Lifecycle Portal — the human surface that consumes this engine's output)
**Target:** Milestone 2a (skill definition) — requires working portal to prototype against
**Dependencies:** Working portal (at least Milestone 1c deployed). Neon branch-per-PR operational. Vercel preview deploys active. FTR lifecycle in features/.

**The vision.** Someone — the human principal, an SRF stakeholder, a future team member — describes a feature they imagine. Claude orchestrates the full lifecycle: proposal creation, isolated environment, implementation, preview deployment, and impact assessment. If accepted, the feature merges. If not, the branch is cleaned up and the FTR entry records what was learned.

**Relationship to FTR-159:** FTR-156 is the autonomous development *engine* — it creates branches, implements features, and deploys previews. FTR-159 is the human *surface* — it presents the engineering leader with a morning brief, stakeholder feedback, decision journal, and "Show Me" walkthroughs. FTR-156 can function without FTR-159 (GitHub PRs + Vercel previews are sufficient). FTR-159 requires FTR-156 as the engine that populates the feature catalog.

This is not a platform. It is not Gemini AppSheet. It is a Claude Code skill that orchestrates tools that already exist.

**Named: "Dream a Feature."** The name invites non-technical participation. It says: you bring the vision, the system handles the engineering. This empowers everyone in the organization — a monastic editor can dream a feature just as readily as a developer.

**The `/dream` skill (`.claude/skills/dream/SKILL.md`):**

```
1. Parse the feature description (natural language)
2. Check if a related FTR already exists (search features/)
3. If no existing FTR: create FTR-NNN file in features/{domain}/
4. Create feature branch: git checkout -b dream/FTR-NNN-{slug}
5. Create Neon branch from dev: neonctl branches create --name dream/FTR-NNN
6. Implement the feature on the branch
7. Push branch → Vercel auto-deploys preview
8. Run smoke-test.sh against preview URL
9. Generate impact assessment (see below)
10. Present: preview URL + FTR reference + impact assessment
11. Await human decision: promote, iterate, or discard
```

**Impact assessment (generated, not authored):**

Every prototype includes an honest multi-dimensional assessment using the Feature Impact Analysis Framework (FTR-096). The human decides with full visibility — not just "does it work?" but "what does it cost, who does it serve, what could go wrong, and is it reversible?"

Example for a hypothetical "reading progress indicator" dream:

```
Dream: "Show readers how far they are in a chapter"
FTR: FTR-157 (auto-created)
Preview: https://dream-pro-040.vercel.app

Impact Assessment:
  Population:      ~820M (all seekers who read)
  Cost (dev):      ~2 hours
  Cost (infra):    $0 (localStorage only, no server)
  Cost (tokens):   $0 (no AI involvement)
  Cost (maintain): 1 new component, 1 test, 0 translations needed
  Risk (failure):  T1 cosmetic — if it breaks, reading still works
  Risk (go wrong): Could feel like a progress tracker (violates
                   Calm Technology). Mitigated: scroll position
                   indicator, not percentage or completion metric.
  Reversibility:   High — 1 component removal, no schema change
  Dependency:      None new
  Performance:     +0 KB (CSS only, no JS bundle impact)
  Accessibility:   Neutral (decorative, ARIA-hidden)
  Security:        No change
  Principles:      ✓ all 11 — no tracking, no gamification,
                   position awareness ≠ completion tracking
  Complexity:      Low — 1 CSS rule, 1 component, 0 abstractions
  Calm Technology: Visible only while reading, 2px subtle gold line,
                   disappears on pause — it waits, it does not push
  Maintenance:     Low half-life — CSS-only, unlikely to need updates
```

The assessment answers the question every stakeholder cares about: **"Is this worth it?"** — not in abstract terms, but in concrete population served, dollars spent, risk accepted, and principles honored.

**Prototype lifecycle:**

| State | TTL | Action |
|-------|-----|--------|
| Active preview | 14 days | Auto-delete Neon branch + Vercel preview after 14 days of inactivity |
| Promoted | — | Merged to main via standard PR flow; FTR state → approved |
| Discarded | — | Branch deleted, Neon branch deleted, FTR state updated with learnings |
| Iterated | Resets 14-day TTL | Human requests changes, Claude modifies on the same branch |

**Nightly cleanup:** `scripts/dream-cleanup.sh` deletes dream branches older than 14 days with no activity. Added to `neon-cleanup.yml` cron.

**Who can dream?** Anyone with access to Claude Code in this repository. The skill is in `.claude/skills/dream/SKILL.md` — available to all operators. The human principal retains promotion authority (only they merge PRs to main). Non-technical stakeholders can dream features; they see preview URLs, not code.

**Relationship to existing workflow:**
- This formalizes what already happens in Claude Code conversations, adding: Neon branch isolation, Vercel preview deployment, structured impact assessment, and FTR lifecycle integration.
- FTR-110 says branch=environment. Dream branches are disposable environments.
- FTR-094 Neon branching is instant and zero-cost. Each dream gets its own database state.

**What this is NOT:**
- Not a code generator that outputs unreviewed code to production
- Not a general-purpose app builder (domain-specific to this portal)
- Not autonomous — human decides promotion, not Claude
- Not expensive at scale — Neon branches are free (copy-on-write), Vercel previews are free (included in Pro tier)

**Re-evaluate At:** Milestone 1c (working portal provides a meaningful base for prototyping)
**Decision Required From:** Architecture (skill design), human principal (governance — who can dream?)

## Notes

**Provenance:** FTR-156 → FTR-156
