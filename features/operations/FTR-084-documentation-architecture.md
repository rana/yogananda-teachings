---
ftr: 84
title: Documentation Architecture
summary: "Identifier triptych (PRI/FTR/STG), document hierarchy, FTR lifecycle, and conventions governing the project's institutional memory"
state: implemented
domain: operations
governed-by: [PRI-12]
---

# FTR-084: Documentation Architecture

## Rationale

The project's documentation is load-bearing infrastructure, not overhead. The AI is architect, designer, implementer, and operator (PRI-12). Documentation is institutional memory across context windows — what the AI doesn't load, it doesn't know. Every structural choice optimizes for three things: AI navigability, human clarity, and cross-session continuity.

### Why FTR (not ADR)

The project originally used three identifier types inherited from conventional multi-role teams: ADR (Architecture Decision Records), DES (Design Sections), PRO (Proposals). PRI-12 collapsed these roles — the AI holds all simultaneously and doesn't need role-specific containers.

The unified FTR identifier replaced all three. The choice of FTR over the industry-standard ADR was deliberate:

**ADR carries misleading pre-trained associations.** An LLM seeing "ADR" activates a mental model from training data (Martin Fowler, adr-tools, engineering blogs): immutable decision record, alternatives considered, "superseded by" chains. This project's records diverge significantly — they're mutable, carry lifecycle states, and merge rationale with specification. The pre-trained model creates friction as often as it helps, requiring override each session.

**FTR has zero pre-trained baggage.** An LLM seeing `FTR-048` without CLAUDE.md has nothing to work with — but CLAUDE.md is always loaded (system prompt), and a ~10-line definition teaches the convention completely. The semantic information moves from the prefix to self-describing section headers (`## Rationale`, `## Specification`) that every LLM understands deeply.

**Net effect:** One clearly-defined identifier learned from a short definition, replacing three identifiers (one with misleading associations, two with none) that required ~150 lines of conventions.

## Specification

### Document Hierarchy

| Document | Role | Primary Audience |
|----------|------|-----------------|
| CLAUDE.md | AI routing — compressed principles, reading order, maintenance protocol | AI collaborators |
| PRINCIPLES.md | 12 immutable commitments with expanded rationale | All audiences |
| CONTEXT.md | Project background, stakeholder context, open questions | All audiences |
| ROADMAP.md | Stage-based delivery plan, STG registry, deliverables, success criteria | All audiences |
| FEATURES.md | Single index of all FTR files across 5 domains | All audiences |
| `features/{domain}/` | Individual FTR files — one concept, one file | Developers, AI |

CLAUDE.md is the single most impactful file for AI collaboration cost. A well-structured routing document saves thousands of tokens per session by directing attention to the right file and section.

### Identifier Triptych

Three identifier types form a complete governance namespace:

| Type | Role | Registry | Format | Example |
|------|------|----------|--------|---------|
| PRI-NN | Principles (WHY) | PRINCIPLES.md | 2-digit zero-padded | PRI-01 |
| FTR-NNN | Features (WHAT) | FEATURES.md | 3-digit zero-padded | FTR-023 |
| STG-NNN | Stages (WHERE/WHEN) | ROADMAP.md | 3-digit zero-padded | STG-006 |

**PRI-NN remains two-digit.** The asymmetry is meaningful — principles are a small, stable, finished set (12). The visual difference between `PRI-01` and `FTR-023` immediately communicates type. Neither PRI nor STG needs its own FTR; PRI is the project's constitution (governing FTRs, not governed by them), and STG is a governance convention documented here.

### FTR Lifecycle

```
proposed --> approved --> implemented
    |            |
    +--> declined |
    |            |
    +--> deferred <-+
            |
            +--> proposed  (reactivated)
```

Five states: `proposed`, `approved`, `implemented`, `deferred`, `declined`. Maturity variants: `approved-foundational` (project-identity, full deliberation to change), `approved-provisional` (approved pending implementation experience).

### FTR File Anatomy

```yaml
---
ftr: 84                    # Bare integer
title: "Documentation Architecture"
summary: "..."             # 10-20 words for AI load/skip decisions
state: implemented         # Lifecycle state
domain: operations         # foundation | search | experience | editorial | operations
governed-by: [PRI-12]     # Principle refs — which PRIs constrain this feature
depends-on: [FTR-024]     # FTR refs — direct implementation prerequisites
always-load: true          # Only on ~11 cross-cutting FTRs
re-evaluate-at: STG-009   # Only on deferred/proposed files
---

# FTR-NNN: Title

## Rationale        <- the "why" (absorbs the old ADR function)
## Specification    <- the "how" (absorbs the old DES function)
## Notes            <- provenance, evolution (optional)
```

Every feature's rationale and specification live in one file. No dual-homing.

### Domain Structure

```
features/
  FEATURES.md              <- single index
  MIGRATION.md             <- old identifier mappings (archaeological reference)
  foundation/              <- FTR-001-019, overflow 100-119
  search/                  <- FTR-020-039, overflow 120-130, 165
  experience/              <- FTR-040-059, overflow 131-147, 160-163
  editorial/               <- FTR-060-079, overflow 148-150
  operations/              <- FTR-080-099, overflow 151-159, 164
```

FTR numbers are stable — never renumber. New FTRs append after the current max across all domains.

### STG-NNN Convention

Track-grouped numbering with gaps for growth:

| Track | Range | Examples |
|-------|-------|---------|
| Portal | STG-001–009 | STG-006 (Corpus), STG-007 (Editorial) |
| Platform | STG-010–019 | STG-012 (Real Pipeline), STG-013 (Production Readiness) |
| Future | STG-020+ | STG-020 (Service + Distribution), STG-021 (Languages) |

Deliverables within a stage use `STG-NNN-DD` (e.g., `STG-006-7`). In ROADMAP.md deliverable tables, the `#` column uses bare numbers; in cross-references from other files, use full form.

### Cross-Reference Conventions

- In prose, use bare identifiers: "See FTR-023", "per PRI-01", "ships in STG-006"
- No file paths in prose — identifiers are stable across restructuring
- Clickable links with file paths belong only in FEATURES.md index
- File naming (`FTR-NNN-{slug}.md`) makes identifiers discoverable via glob: `**/FTR-023*`

### Documentation-Code Transition

1. **Before code exists:** The FTR file is the source of truth. Follow it precisely.
2. **When implemented:** Set state to `implemented`. Code becomes source of truth for details; FTR retains architectural rationale.
3. **When implementation diverges:** Update the FTR to reflect actual decisions. FTR files are living documents; git history is the audit trail.

## Notes

**Provenance:** Originally accepted 2026-02-20 as an ADR governing the pre-migration documentation system (DESIGN.md, DECISIONS-*.md, PROPOSALS.md). The FTR migration (2026-03-05) unified ADR/DES/PRO into the single FTR identifier system. STG-NNN added 2026-03-19, completing the identifier triptych. See `features/MIGRATION.md` for the complete old-to-new identifier mapping.
