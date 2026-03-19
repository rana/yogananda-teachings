---
ftr: 84
title: Documentation Architecture
summary: "Governance-plus-design documentation system serving AI, human, and stakeholder audiences"
state: implemented
domain: operations
governed-by: [PRI-12]
---

# FTR-084: Documentation Architecture

## Rationale

- **Status:** Accepted
- **Date:** 2026-02-20
- **Superseded:** The specification below describes the pre-migration documentation architecture (DESIGN.md, DECISIONS-\*.md, PROPOSALS.md). The FTR migration (2026-03-05, described in Notes § below) replaced it with the unified FTR system: one file per feature in `features/{domain}/FTR-NNN-{slug}.md`, indexed by `features/FEATURES.md`. The rationale and conventions remain valid context for understanding the system's evolution.

### Context

The project's documentation system is itself an architectural decision. The pre-code design phase produced nearly 1MB of structured documentation across five files. As the project transitions to implementation, the documentation system must serve three audiences: AI collaborators (primary, token-constrained), human developers (current and future), and non-technical stakeholders (SRF, the philanthropist's foundation).

Key tensions:
- **Completeness vs. navigability.** Thorough documentation ensures correct decisions; large documents are expensive to load into AI context windows.
- **Single source of truth vs. contextual relevance.** Centralizing information prevents drift; distributing it keeps related concerns together.
- **Design-phase authority vs. code-phase authority.** Documentation is the sole authority before code exists; after implementation, code and documentation must coexist without contradiction.
- **Maturity honesty.** In a pre-code project, all ADRs carry `Status: Accepted`, but a foundational principle (FTR-001) and a speculative Milestone 7b feature (FTR-143) are not equally "decided." The documentation system must honestly reflect the maturity of each record without discarding the thorough thinking that produced it.

### Decision

Maintain a governance-plus-design architecture with root governance documents, individual design specifications organized by domain, a routing document (CLAUDE.md), defined conventions for the documentation-to-code transition, and a three-tier maturity model for intellectual work:

| Document | Role | Primary Audience |
|----------|------|-----------------|
| CLAUDE.md | AI routing, compressed principles, maintenance protocol | AI collaborators |
| PRINCIPLES.md | Immutable commitments with expanded rationale | All audiences |
| CONTEXT.md | Project background, open questions, stakeholder context | All audiences |
| DESIGN.md | Cross-cutting architecture index, API, observability, testing, personas | Developers, AI |
| `design/search/` | Search, data model, ingestion, chunking, MCP, infrastructure | Developers, AI |
| `design/experience/` | Frontend, accessibility, video, events, places | Developers, AI |
| `design/editorial/` | Staff tools, content intelligence, editorial workflows | Developers, AI |
| DECISIONS.md | ADR navigational index with group summaries | Developers, AI |
| DECISIONS-core.md | ADR bodies: Foundational, Architecture, Content, Search | Developers, AI |
| DECISIONS-experience.md | ADR bodies: Cross-Media, Seeker Experience, Internationalization | Developers, AI |
| DECISIONS-operations.md | ADR bodies: Staff, Brand, Operations, Governance | Developers, AI |
| PROPOSALS.md | Proposal registry: PRO-NNN identifiers, graduation protocol, scheduling lifecycle | All audiences |
| ROADMAP.md | Phased delivery plan with deliverables and success criteria | All audiences |

**Three-tier maturity model:**

| Tier | Home | Identifier | Maturity |
|------|------|-----------|----------|
| Proposals | FTR files with state `proposed` | FTR-NNN | Curated, thoughtful. Awaiting validation, scheduling, or adoption. |
| Decisions & Design | FTR files with state `approved` or `implemented` | FTR-NNN | Validated through implementation or foundational principle. |

**ADR maturity classification:**

ADRs carry a maturity marker in their Status field reflecting honest confidence level:

| Maturity | Meaning | Status Field |
|----------|---------|-------------|
| Foundational | Defines project identity. Change requires full deliberation. | `Accepted (Foundational)` |
| Active | Governing current or imminent implementation. | `Accepted` |
| Provisional | Thorough architectural direction for future milestones. May be revised, suspended, or omitted as the project evolves. | `Accepted (Provisional — Milestone N+)` |
| Suspended | Was active or provisional, moved to unscheduled. Reasoning preserved in ADR body; scheduling lifecycle in PROPOSALS.md. | `Suspended → PRO-NNN` |
| Implemented | Validated through code. Code is authoritative; ADR retains rationale. | `Implemented — see [code path]` |

**Conventions:**

1. **CLAUDE.md as routing document.** The single most important file for AI collaboration. Establishes reading order, constraints, and maintenance protocol in ~90 lines — small enough to always fit in context.
2. **CONTEXT.md as open question registry.** All open questions (technical and stakeholder) are tracked here. Other documents cross-reference but do not duplicate the full question.
3. **DESIGN.md Table of Contents with milestone-relevance markers.** Enables AI sessions to navigate to relevant sections without sequential scanning of 5,000+ lines.
4. **ROADMAP.md Table of Contents.** Milestone-level navigation for quick orientation.
5. **DECISIONS.md Index by Concern.** ADRs grouped by domain (already established at FTR-101).
6. **Implemented-section annotations.** When a DESIGN.md section is fully implemented, annotate: `**Status: Implemented** — see [code path]`. Code becomes the source of truth; DESIGN.md retains architectural rationale.
7. **Expanded maintenance table in CLAUDE.md.** Covers open question lifecycle, cross-cutting concern changes, content type additions, and the documentation-to-code transition.
8. **PROPOSALS.md as proposal registry.** PRO-NNN identifiers are permanent — never renamed or reassigned. Proposals graduate to ADR/DES/milestone deliverables through the graduation protocol. ADRs may be suspended to PRO-NNN entries. Both directions preserve full cross-references.

### Rationale

- The routing document (CLAUDE.md) is the single most impactful file for AI collaboration cost. A well-structured 90-line file saves thousands of tokens per session by directing attention to the right document and section.
- Milestone-relevance markers in the DESIGN.md TOC allow AI sessions to skip irrelevant sections (e.g., Milestone 5b multilingual details during STG-001 work), reducing token consumption without losing information.
- The documentation-to-code transition protocol prevents the "two sources of truth" problem that invariably emerges when design documents survive into an implemented codebase.
- Centralizing open questions in CONTEXT.md prevents them from being forgotten in document interiors — a real risk at 967KB of total documentation.
- Making the documentation system itself an ADR ensures future contributors understand why the system is structured this way, and can evolve it deliberately rather than through drift.
- PROPOSALS.md gives curated proposals first-class citizenship without overcommitting them as "decisions." PRO-NNN identifiers provide stable cross-references throughout the evaluation lifecycle. The three-tier maturity model (explorations → proposals → decisions) honestly reflects confidence levels without discarding the thorough thinking at any tier.
- ADR maturity classification acknowledges that a foundational principle and a speculative Milestone 7b feature are not equally "decided," even though both received thorough analysis. Provisional ADRs represent real architectural thinking — they are not dismissed, but they are honestly distinguished from implementation-tested decisions.

### Consequences

- DESIGN.md and ROADMAP.md now carry navigable Tables of Contents
- DESIGN.md inline open questions are converted to cross-references to CONTEXT.md
- CLAUDE.md maintenance table is expanded to cover proposal lifecycle
- CLAUDE.md gains a "Documentation–Code Transition" section
- PROPOSALS.md carries the graduation protocol (moved from ROADMAP.md § Unscheduled Features)
- ROADMAP.md § Unscheduled Features retains a compact summary table of Validated and Deferred items referencing PRO-NNN
- Future documentation changes should follow the conventions established here
- This ADR should be revised if the documentation system undergoes further restructuring

## Notes

**Provenance:** FTR-084 → FTR-084

### STG-NNN: Stage Identifiers (2026-03-19)

The identifier triptych is now complete:

| Type | Role | Registry | Digit Width |
|------|------|----------|-------------|
| PRI-NN | Principles (WHY) | PRINCIPLES.md | 2 digits (stable, ≤12) |
| FTR-NNN | Features (WHAT) | FEATURES.md | 3 digits (growing) |
| STG-NNN | Stages (WHERE/WHEN) | ROADMAP.md | 3 digits (activating/completing) |

**STG-NNN** replaces the ad-hoc M-notation (`STG-001`, `STG-009 boundary`, `Milestone 7a+`) with a formal identifier type. Format: `STG-NNN` (three-digit zero-padded). Deliverables: `STG-NNN-DD`. Track-grouped numbering: Portal STG-001–009, Platform STG-010–019, Future STG-020+. Full mapping in ROADMAP.md.

**PRI-NN remains PRI-NN.** The two-digit asymmetry is meaningful — principles are a small, stable, finished set. The visual difference between `PRI-01` and `FTR-023` immediately communicates type.

**Design decisions:**
- STG-NNN does not need its own FTR — it is a governance convention, documented here in the documentation architecture FTR.
- PRI-NN does not need an FTR either — principles are the project's constitution, governing FTRs rather than governed by them.
- ROADMAP.md becomes the STG registry (parallel to FEATURES.md as FTR index, PRINCIPLES.md as PRI registry).
- `re-evaluate-at` fields in FTR frontmatter now use `STG-NNN` instead of milestone notation.

### FTR-084: Unified Identifier System — FTR Replaces ADR + DES + PRO

FTR-084 (Unified Identifier System — FTR Replaces ADR + DES + PRO) proposes evolving this documentation architecture into a unified FTR system. The full proposal is reproduced below as the genesis document for the FTR migration.

### FTR-084: Unified Identifier System — FTR Replaces ADR + DES + PRO

**Status:** Proposed
**Type:** Governance (Documentation Architecture)
**Governing Refs:** FTR-084 (Documentation Architecture), PRI-12 (AI-Native Development), PRI-08 (Calm Technology)
**Origin:** Principal-directed design exploration 2026-03-05
**Decision required from:** Human principal (governance change to institutional memory)

#### Problem Statement

The project uses three identifier types — ADR (Architecture Decision Records), DES (Design Sections), and PRO (Proposals) — inherited from a conventional multi-role team model where architects decide, designers specify, and developers implement. PRI-12 collapsed these roles: the AI is architect, designer, implementer, and operator. The human principal directs strategy, stakeholder decisions, and editorial judgment.

The three-type system creates measurable friction:

1. **Dual-homing.** Some ADRs have content in both DECISIONS-*.md body files AND design/ specification files (e.g., FTR-023 lives in DECISIONS-core.md AND design/search/FTR-023-chunking-strategy-specification.md). CLAUDE.md explicitly mandates "titles must match between locations" — synchronization debt by design.

2. **Cross-referencing overhead.** A single concept like chunking spans FTR-023 (decision) + FTR-021 (data model it shapes) + comments in code. PRO entries reference governing ADRs and DES sections. The graph is many-to-many.

3. **Cognitive load.** CLAUDE.md devotes ~150 lines to explaining three identifier systems, dual-homing rules, body file routing, and PRO graduation protocol. This is institutional overhead, not institutional memory.

4. **File sprawl.** 4 DECISIONS files (index + 3 body) + DESIGN.md (index + cross-cutting sections) + PROPOSALS.md + 33 design files + bodies spread across body files = documentation architecture that requires a map to navigate.

5. **Role-document mismatch.** The human principal thinks in features and status: "What are we building? Why? What's the status?" They don't think in document types. The AI holds all roles simultaneously — it doesn't need role-specific containers.

**Current scale:** 127 unique ADR identifiers (FTR-001 through FTR-132, with gaps), 56 unique DES identifiers (FTR-013 through FTR-041, with gaps), 49 unique PRO identifiers (FTR-098 through FTR-160) = **232 total identifiers across 3 namespaces.** 87 markdown files + 73 code files in yogananda-teachings, plus 11 in yogananda-platform, 4 in yogananda-design, 9 in yogananda-skills.

#### 1. Unified Identifier: FTR-NNN

Replace ADR, DES, and PRO with a single identifier type: **FTR** (Feature).

**Why FTR:**
- Unambiguous in grep (zero false positives for `FTR-\d{3}`)
- Maps to the natural conversational word "feature" — the human says "what's the chunking feature?" not "what's the chunking decision record?"
- Inclusive scope: a "feature" is a feature of the architecture — capabilities, conventions, constraints, and policies all qualify
- 3 characters, matching PRI (visual parity between the two identifier types)
- Phonetically functional: "FTR-forty-eight" or simply "feature forty-eight"

**What survives unchanged:** PRI-NN (Principles, 01–12). Principles are immutable commitments, not features. They stay in PRINCIPLES.md.

**AI readability analysis — FTR vs ADR.** ADR is an industry-standard pattern present in AI training data (Martin Fowler, adr-tools, engineering blogs). An AI seeing "ADR" activates a pre-trained mental model: immutable decision record, alternatives considered, "superseded by" chains. This is real semantic freight the identifier carries without project documentation. However, this project's ADRs diverge significantly from the industry pattern — they're mutable (no supersession chains), carry maturity markers, split across three body files, and dual-home with design files. An AI bringing standard ADR expectations is partially *misled* and must override pre-trained conventions with CLAUDE.md's definitions. The pre-trained model creates friction as often as it helps.

FTR has zero pre-trained association. An AI seeing FTR-048 without CLAUDE.md would have nothing to work with. But CLAUDE.md is always loaded (system prompt), and the AI already successfully works with DES and PRO — two identifiers that are entirely project-specific with zero pre-trained association. Two of the three current identifiers are already learned from scratch each session.

The semantic freight doesn't disappear — it moves from the identifier prefix to the section headers. `FTR-023` encoded "this is a decision" in the prefix; `FTR-048 → ## Rationale` encodes the same meaning in a section header that every AI understands deeply. The type information becomes more explicit and more granular. Net: one clearly-defined identifier with self-describing sections, learned from a ~10-line CLAUDE.md definition, replacing three identifiers (one with misleading pre-trained associations, two with none) requiring ~150 lines of conventions. The AI reader is equally effective on individual FTRs and more effective on the system as a whole.

#### 2. FTR Lifecycle States

```
proposed ──→ approved ──→ implemented
    │            │
    ├──→ declined │
    │            │
    └──→ deferred ←┘
            │
            └──→ proposed  (reactivated)
```

Five states:
- **Proposed** — Idea documented, not yet committed to. (Absorbs PRO "Proposed"/"Validated" states)
- **Approved** — Committed to as architectural direction. (Absorbs ADR "Accepted" status)
- **Implemented** — Validated through code. (Absorbs ADR "Implemented" and DES "Status: Implemented")
- **Deferred** — Architecturally sound but not scheduled. (Absorbs PRO "Suspended"/"Deferred" and ADR "Provisional")
- **Declined** — Evaluated and rejected. (New — currently no explicit "rejected" state; decisions just don't get ADRs)

**Maturity markers (optional, from FTR-084):**
- `Approved (Foundational)` — Defines project identity, change requires full deliberation
- `Approved` — Standard active direction
- `Deferred (Milestone N+)` — Thorough direction for future milestones

#### 3. FTR File Anatomy

```markdown
# FTR-NNN: Title

**State:** Approved
**Domain:** search | experience | editorial | foundation | operations
**Milestone:** 1a
**Governs:** FTR-XXX, FTR-YYY (optional — for hub features)
**Governed by:** PRI-NN, FTR-ZZZ (optional)

## Rationale                           <- absorbs the ADR function
[Why this direction was chosen. Alternatives considered. Tradeoffs.]

## Specification                       <- absorbs the DES function
[How to build it. Data models, API shapes, algorithms, parameters.]

## Notes                               <- absorbs the PRO history function
[Origin, evolution, related explorations. Lightweight.]
```

**Section rules:**
- **Rationale** is always present (every feature has a "why")
- **Specification** is present when the feature has implementation detail
- **Notes** is optional — for provenance and evolution context
- A proposed FTR may have only Rationale. An implemented FTR has all sections.
- Cross-cutting conventions (like API pagination) may have only Rationale — the convention IS the specification.
- The file grows as the feature progresses through its lifecycle.

#### 4. File Structure

```
features/                              <- replaces design/ + DECISIONS body files + PROPOSALS.md bodies
├── FEATURES.md                        <- single index (replaces DECISIONS.md + DESIGN.md nav + PROPOSALS.md index)
├── foundation/                        <- cross-cutting constraints, infrastructure, conventions
│   ├── FTR-001-direct-quotes-only.md
│   ├── FTR-002-design-philosophy.md
│   └── ...
├── search/                            <- search, data model, ingestion, AI pipeline
│   ├── FTR-020-hybrid-search.md
│   ├── FTR-021-data-model.md
│   └── ...
├── experience/                        <- frontend, UX, pages, accessibility, i18n
│   ├── FTR-040-frontend-design.md
│   ├── FTR-041-accessibility.md
│   └── ...
├── editorial/                         <- staff tools, content intelligence, curation
│   ├── FTR-060-editorial-system.md
│   └── ...
└── operations/                        <- CI/CD, observability, testing, governance
    ├── FTR-080-testing-strategy.md
    └── ...
```

**Domain numbering ranges (guideline, not enforced):**
- foundation: FTR-001–019
- search: FTR-020–039
- experience: FTR-040–059
- editorial: FTR-060–079
- operations: FTR-080–099
- overflow/new: FTR-100+

This is a **starting allocation**, not a hard partition. New features append after the current max within their domain range. If a range fills, overflow into FTR-100+.

#### 5. FEATURES.md Index

Single table, replaces three separate indexes:

```markdown
# SRF Online Teachings Portal — Features

| FTR | Title | Domain | State | Milestone | Notes |
|-----|-------|--------|-------|-----------|-------|
| 001 | Direct Quotes Only | foundation | Approved (Foundational) | — | PRI-01 |
| 002 | Design Philosophy | foundation | Approved | — | |
| 020 | Hybrid Search | search | Implemented | 1a | |
| 040 | Frontend Design | experience | Approved | 2a | |
| 090 | SRF Corpus MCP | operations | Deferred (STG-007+) | — | ex-FTR-098 |
```

**Always-load features** (the cross-cutting sections currently always-loaded from DESIGN.md) are marked in the index. The implementing session determines which ~10-12 features carry this marker.

#### 6. Documents Replaced

| Current Document | Disposition |
|-----------------|-------------|
| DECISIONS.md | **Deleted.** Replaced by FEATURES.md index. |
| DECISIONS-core.md | **Deleted.** ADR bodies migrate into individual FTR files. |
| DECISIONS-experience.md | **Deleted.** ADR bodies migrate into individual FTR files. |
| DECISIONS-operations.md | **Deleted.** ADR bodies migrate into individual FTR files. |
| DESIGN.md | **Deleted.** Cross-cutting sections become FTR files in features/foundation/. Nav table replaced by FEATURES.md. |
| PROPOSALS.md | **Deleted.** PRO bodies migrate into individual FTR files (state: proposed/deferred/declined). |
| design/ directory | **Deleted.** All 33 files migrate into features/{domain}/ with new FTR filenames. |

**Documents preserved unchanged:**
- PRINCIPLES.md (PRI identifiers unchanged)
- CONTEXT.md (cross-references updated)
- ROADMAP.md (cross-references updated)
- CLAUDE.md (simplified — see § 8)
- README.md (cross-references updated)

#### 7. Numbering: Clean Start

New FTR numbers are assigned from 001. No attempt to preserve old ADR/DES/PRO numbers.

**Rationale:** The old numbers carry implicit associations with document types (FTR-023 "feels like" a decision). Clean numbering breaks that association and establishes FTR as the singular identity. The migration mapping (old → new) is recorded once in the migration commit message and in a `features/MIGRATION.md` reference file, then never consulted again.

**Assignment strategy:**
1. The implementing session creates a complete mapping table: every old identifier → its new FTR number
2. Numbers are assigned by domain, using the ranges in § 4 as starting allocation
3. Within each domain, features are ordered roughly by importance/chronology
4. Subsection identifiers (e.g., FTR-040 through FTR-040 within FTR-040) become subsections within their parent FTR — they do NOT get their own FTR numbers
5. The mapping table is reviewed by the human principal before execution

#### 8. CLAUDE.md Simplification

The ~150 lines of identifier conventions in CLAUDE.md § Identifier Conventions collapse to approximately:

```markdown
## Identifiers

**PRI-NN** — Principles (01–12). Immutable commitments. PRINCIPLES.md.

**FTR-NNN** — Features. One file per concept in `features/{domain}/`.
Five states: proposed → approved → implemented | deferred | declined.
Each FTR contains Rationale (why), Specification (how), and Notes (history)
as needed. FEATURES.md is the single index.
File naming: `FTR-NNN-{slug}.md`. Cross-reference by bare identifier: "See FTR-048."
Domain directories: foundation/, search/, experience/, editorial/, operations/.
```

The Document Maintenance table in CLAUDE.md is also simplified — rows about DECISIONS/DESIGN/PROPOSALS body files, dual-homing, and PRO graduation collapse into "Update the FTR file" and "Update FEATURES.md index."

#### 9. Merge Rules

When an old ADR and an old DES cover the same concept, they merge into one FTR:

| Pattern | Example | Result |
|---------|---------|--------|
| ADR has a dual-homed design file | FTR-023 + design/search/FTR-023-*.md | 1 FTR with Rationale + Specification |
| ADR governs a DES on the same concept | FTR-020 (hybrid search decision) + FTR-020 (search architecture) | Analyze overlap. If >70% shared concept: merge. If distinct: 2 FTRs. |
| PRO adopted → became ADR | FTR-001 → FTR-001 updates | 1 FTR. PRO history in Notes section. |
| PRO not adopted (proposed/deferred) | FTR-138 (Four Doors) | 1 FTR with state: proposed. |
| ADR suspended → became PRO | FTR-153 → FTR-153 | 1 FTR with state: deferred. |
| DES subsection inside parent DES | FTR-040–016 inside FTR-040 | Subsections within parent FTR. No standalone numbers. |
| Cross-cutting section in DESIGN.md | FTR-013, FTR-015, FTR-016, etc. | Individual FTR files in features/foundation/. |

**Judgment calls:** The implementing session will encounter ambiguous cases. The principle: **one concept, one FTR.** If two old identifiers are about the same architectural concept (even if one captures "why" and the other "how"), they merge. If they're genuinely different concepts that happen to be related, they stay separate and cross-reference.

#### 10. Code Comment Updates

73 code files reference ADR/DES/PRO identifiers, primarily in comments like:
```typescript
// FTR-001: Direct quotes only — no AI synthesis
// FTR-020: Search architecture
// See FTR-117 for copyright framework
```

These are updated mechanically using the mapping table. A sed/awk script processes the mapping. The implementing session generates the script from the mapping table and applies it in a single commit.

#### 11. Sibling Repository Updates

Four repositories reference teachings portal identifiers:

| Repository | Files | Update Strategy |
|------------|-------|-----------------|
| yogananda-teachings | 87 markdown + 73 code = 160 files | Primary migration (this proposal) |
| yogananda-platform | 11 files | Update cross-references using mapping table |
| yogananda-design | 4 files | Update cross-references using mapping table |
| yogananda-skills | 9 files | Update skills that reference ADR/DES/PRO identifiers + update skill workflows for FTR |

**Skills impact:**
- `proposal-merge` — Graduates PRO → ADR/DES. Replaced by simpler FTR state transitions.
- `dedup-proposals` — Consolidates explorations into PROs. Adapted to consolidate into FTR (state: proposed).
- `theme-integrate` — Creates ADR/DES entries. Adapted to create FTR entries.
- `garden` — Audits identifier systems. Simplified for single-namespace FTR.
- `coherence` — Cross-document consistency. Simplified for single-index FEATURES.md.
- `verify` — Post-implementation check against DES. Adapted for FTR Specification section.

#### 12. Migration Execution Plan

The migration is a **documentation refactor**, not a code refactor. No runtime behavior changes. The work is segmented into 6 prompts across 2–3 sessions, each producing a bounded, verifiable artifact. This segmentation is designed to stay within Claude's output token limits — no single prompt requires generating more than ~6,000 lines.

**The mapping table (`features/MIGRATION.md`) is the single coordination artifact.** Every subsequent prompt references it. If a session is interrupted, resume from the last completed prompt.

##### Prompt 1: Mapping Table (read-only, ~15KB output)

Read all identifier sources:
- DECISIONS-core.md, DECISIONS-experience.md, DECISIONS-operations.md (all ADR bodies)
- All files in `design/` (all DES bodies) and DESIGN.md cross-cutting sections
- PROPOSALS.md (all PRO bodies)

Produce the complete mapping table as `features/MIGRATION.md`:

| Old ID | FTR | Slug | Domain | State | Merge With | Source Files |

Apply rules from §7 (clean numbering), §9 (merge rules), §4 (domain ranges). Mark merge candidates explicitly. Flag ambiguous cases for human review. **Do NOT create any FTR files yet.**

Human principal reviews and approves the mapping table before proceeding.

##### Prompt 2: Foundation + Search FTR files (~35 files, ~5K lines)

Using `features/MIGRATION.md`, create FTR files for `foundation/` and `search/` domains:
1. Create `features/foundation/FTR-NNN-{slug}.md` and `features/search/FTR-NNN-{slug}.md`
2. Populate from source files per the Merge With column
3. Use FTR anatomy from §3 (State, Domain, Milestone, Rationale, Specification, Notes)
4. Report: files created with line counts

##### Prompt 3: Experience + Editorial FTR files (~40 files, ~6K lines)

Same rules as Prompt 2 for `experience/` and `editorial/` domains. Report files created with line counts.

**Prompts 2 and 3 are parallelizable** — they depend only on the mapping table, not each other.

##### Prompt 4: Operations + Overflow + FEATURES.md index (~20 files, ~3K lines)

Create FTR files for `operations/` domain and any overflow (FTR-100+). Then create `features/FEATURES.md` — the single index table covering ALL FTR files across all domains.

Report:
- Total FTR files created (all prompts)
- Total lines across all FTR files vs. total lines across all source documents
- Any mapping entries not yet created (and why)

##### Prompt 5: Cross-references + CLAUDE.md + Cleanup (~3K lines)

1. Generate and run a sed script replacing all old identifiers with FTR identifiers across all `.md`, `.ts`, and `.tsx` files, using `features/MIGRATION.md`
2. Rewrite CLAUDE.md: §Identifier Conventions (~10 lines per §8), §Document Maintenance, §Read These Files, §Domain-gated reading
3. Update CONTEXT.md and ROADMAP.md cross-references
4. Delete: DECISIONS.md, DECISIONS-core.md, DECISIONS-experience.md, DECISIONS-operations.md, DESIGN.md, PROPOSALS.md, and the `design/` directory
5. Grep for remaining ADR-/DES-/PRO- references outside MIGRATION.md — report findings
6. Verify FEATURES.md index matches actual files; verify all FTR files have required fields

##### Prompt 6: Sibling repos + Skills (~2K lines)

Using `features/MIGRATION.md`, update cross-references in:
- `~/prj/yogananda-platform/` (~11 files)
- `~/prj/yogananda-design/` (~4 files)
- `~/prj/yogananda-skills/` (~9 files)

Adapt skills for FTR system: `proposal-merge` → FTR state transitions, `dedup-proposals` → consolidate into FTR (state: proposed), `theme-integrate` → create FTR entries, `garden`/`coherence`/`verify` → single-namespace FTR. Do not commit — report all changes for human review.

##### Session Resumption

If a session is interrupted mid-migration:
1. Check which files exist: `ls features/*/FTR-*.md 2>/dev/null | wc -l` (target: 130–170)
2. Check if FEATURES.md index exists: `ls features/FEATURES.md`
3. Check if cross-references are updated: `grep -r "ADR-\|DES-\|PRO-" --include="*.md" --include="*.ts" --include="*.tsx" . | grep -v MIGRATION.md | grep -v node_modules | head -20`
4. Resume from the first incomplete prompt

#### 13. Notes for the Implementing Session

**Read this entire proposal (FTR-084) before starting.** It is self-contained.

**Merge judgment calls are the hard part.** When two old identifiers cover the same concept (one "why", one "how"), merge into one FTR. When they're genuinely different concepts that happen to be related, keep them separate and cross-reference. The principle: **one concept, one FTR.** Surface ambiguity to the human principal — don't resolve it silently.

**Content preservation is non-negotiable.** Every line of every ADR body, DES body, and PRO body must appear in an FTR file. The verification step (Prompt 4 report + Prompt 5 grep) catches gaps. If total FTR lines are significantly less than total source lines (~23,800), something was dropped.

**Always-loaded content.** DESIGN.md currently has ~1,395 lines of cross-cutting content that CLAUDE.md says to "always load." After migration, identify which 10–12 FTR files in `features/foundation/` carry this content. Mark them in FEATURES.md index (e.g., a `Load` column or `*` marker). The CLAUDE.md rewrite must tell future sessions which FTRs to always load.

**Git history trade-off.** `git log --follow` helps but isn't perfect for merged files. `features/MIGRATION.md` is the permanent mapping reference. This is acceptable — the new system's clarity outweighs the old system's git-blame continuity.

**Do not over-engineer the FTR files.** Migrate content faithfully. Do not rewrite, improve, or editorialize source material during migration. The migration is a structural refactor, not a content revision.

#### 14. Commit Strategy

Single atomic commit in the teachings repo, with coordinated commits in sibling repos:

1. `yogananda-teachings`: "Unify ADR/DES/PRO into FTR identifier system (FTR-084)"
2. `yogananda-platform`: "Update cross-references for FTR identifier migration"
3. `yogananda-design`: "Update cross-references for FTR identifier migration"
4. `yogananda-skills`: "Adapt skills for FTR identifier system"

#### 15. Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Stale references missed | Prompt 5 grep verification catches stragglers |
| Mapping errors (wrong FTR number) | Prompt 1 human review before execution |
| Lost content during merge | Prompt 4 line-count comparison; every FTR must account for ALL source content |
| Sibling repo desync | Coordinated commits, same mapping table |
| Output token overflow | 6 bounded prompts, each under ~6K lines of output |
| Session interruption | Mapping table persists on disk; resume protocol in §12 |
| Skill breakage | Skills updated in Prompt 6; tested post-commit |

#### 16. What This Enables

1. **Feature-level conversation.** "What's the status of FTR-023?" returns one file with everything — rationale, specification, state. No assembly required.

2. **State-driven views.** `grep "State: Proposed" features/` shows all proposed features. `grep "State: Implemented" features/search/` shows implemented search features. The index in FEATURES.md is the canonical view, but the files are self-describing.

3. **Simpler skills.** proposal-merge becomes "change FTR state from proposed to approved." theme-integrate creates one FTR file, not three artifacts. garden audits one namespace.

4. **Git-native lifecycle.** Each FTR file's git history IS the feature's history. No need for separate "Notes" about when things changed — `git log features/search/FTR-023-chunking.md` shows the full evolution.

5. **Calm documentation.** Two identifier types (PRI, FTR) instead of four (PRI, ADR, DES, PRO). The documentation system becomes as calm as the technology it describes.

#### Implementation Scope

- **Estimated FTR count:** 130–170 (after merges, before new features)
- **Files modified:** ~160 in teachings, ~24 across sibling repos
- **Files created:** ~140 FTR files + FEATURES.md + MIGRATION.md
- **Files deleted:** ~40 (DECISIONS*, DESIGN.md, PROPOSALS.md, design/ directory)
- **Prompts:** 6 (parallelizable: 2+3; sequential: 1→2/3→4→5→6)
- **Code behavior change:** None. Documentation-only refactor.
