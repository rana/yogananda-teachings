---
name: proposal-merge
description: Graduate a proposed FTR into approved state, or create a new FTR from an exploration. Updates FEATURES.md, ROADMAP.md, and CONTEXT.md. Detects conflicts, presents full plan for approval before executing.
argument-hint: "<FTR-NNN or exploration filename>"
---

Read CONTEXT.md, features/FEATURES.md, and ROADMAP.md to ground in the project's current state. Note the highest existing FTR number per domain.

## Feature Merge

**Input:** An FTR-NNN identifier or a bare filename. If `$ARGUMENTS` is an FTR-NNN (e.g., `FTR-136`), find the file in `features/`. If it's a bare filename, resolve it under `.elmer/proposals/` and note that it should have been curated into an FTR file first via `/dedup-proposals` — offer to create one.

Read the FTR file fully. If the FTR has origin files in `.elmer/proposals/`, read those for the full analysis.

### Step 1: Decompose

Break the feature into discrete integration targets. For each proposed change, classify it:

| Classification | Target | Action |
|---|---|---|
| New feature | `features/{domain}/FTR-NNN-{slug}.md` + FEATURES.md | Create FTR file, add index row |
| Amendment to existing FTR | `features/{domain}/FTR-NNN-*.md` | Edit existing file |
| New arc/milestone deliverable | ROADMAP.md | Insert deliverable row in arc table |
| New open question | CONTEXT.md | Add to appropriate tier |
| Resolved open question | CONTEXT.md | Move from open to resolved |
| Schema change | FTR-021 (Data Model) | Amend specification section |
| New API surface | FTR-015 (API-First Architecture) | Amend specification section |

For each item, record:
- **Source:** Which FTR or exploration section it comes from
- **Target:** Exact file and section
- **Action:** Append / amend / insert
- **Identifier:** Next available FTR number in the appropriate domain's overflow range
- **Cross-references:** Which existing FTRs it should reference or be referenced by

### Step 2: Conflict Detection

Check for conflicts with existing content:
- Does an existing FTR already cover this decision? → Amend, don't duplicate
- Does a ROADMAP deliverable already exist for this? → Amend, don't duplicate
- Does the FTR reference identifiers that may have changed?

Flag all conflicts and stale references.

### Step 3: Present Decomposition

Present the full decomposition to the user as a structured list grouped by target. Include:
- Every edit with source, target, action, and identifier
- All detected conflicts with recommendations
- All cross-references that will be wired
- The FTR state transition that will be applied on completion

**Ask for approval before proceeding.** The user may approve, reject specific items, or edit the plan.

### Step 4: Execute

On approval, execute edits in this order:
1. FTR files — new files and amendments (identifiers must exist before cross-referencing)
2. FEATURES.md — add new FTR entries to index tables
3. ROADMAP.md — arc and deliverable changes
4. CONTEXT.md — open questions and state changes
5. Source FTR — update state to `approved` (or `implemented` if code exists)

For each edit:
- Use the project's existing formatting conventions (read surrounding content for style)
- Wire cross-references bidirectionally
- Follow FTR file anatomy: `# FTR-NNN: Title` → metadata → `## Rationale` → `## Specification` → `## Notes`

### Step 5: Post-Merge Validation

After all edits:
- Verify all new FTR files have required fields (State, Domain, Arc, Governed-by)
- Verify FEATURES.md index rows match actual files
- Verify all cross-references resolve to real FTR files
- Verify ROADMAP.md § Unscheduled Features summary table is updated if applicable
- Check that CONTEXT.md "Current State" paragraph still accurately describes the project
- Report what changed, how many FTRs were added/updated, and any items deferred

### Editorial Standards

- **Distill, don't paste.** Explorations contain analysis and rationale. FTR Rationale sections need: Context, Decision, Rationale, Consequences. Specification sections need: concrete spec. Strip exploration prose.
- **Preserve open questions.** These go to CONTEXT.md, not into FTR files.
- **Match existing voice.** Read adjacent FTR files. Match their tone, depth, and structure.
- **FTR state markers.** New FTRs from proposals should carry appropriate state (approved for current-arc work, approved (provisional) for future-arc work, proposed for unscheduled). See FTR-084 for the classification.

## Output Management

Segment edits into batches of up to 10 items, ordered by priority: high-priority items first (new FTRs, schema changes, arc deliverables), then lower-priority items (open questions, cross-reference wiring).

Present each batch for approval before executing. After each approved batch is executed, proceed immediately to present the next batch. Continue until all edits are processed. State the total count when complete.

Present the full decomposition before executing any batch. Do not execute without explicit approval.
