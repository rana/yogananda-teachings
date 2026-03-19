# Unified Review — 2026-03-05

> Post-migration review following PRO-050 (ADR/DES/PRO → FTR identifier migration). Covers alignment, coherence, and gaps across all project documents.

---

## Critical

### 1. [coherence] FTR-094 identifier collision — two different features
**Location:** FEATURES.md line 212 vs. ROADMAP.md Unscheduled Features line 587
**Finding:** FEATURES.md lists FTR-094 as "Neon Platform Governance" (state: Approved). ROADMAP.md Unscheduled Features lists FTR-094 as "Time Travel Queries for Production Debugging" (state: Proposed). These are two distinct features sharing one identifier. Time Travel was also adopted (per Resolved Questions in CONTEXT.md: "Time Travel queries accepted as STG-001 development tool"), making the "Proposed" state additionally wrong.
**Fix:** Time Travel Queries should either be (a) absorbed into FTR-094 as a subsection (if it's genuinely part of Neon governance) with state updated, or (b) assigned a new FTR number in the operations overflow range. Remove the stale ROADMAP.md Unscheduled entry either way.

### 2. [coherence] features/ directory (159 FTR files) is entirely untracked in git
**Location:** git status shows `?? features/`
**Finding:** The entire FTR file corpus — 159 files across 5 domains — exists only as untracked working directory files. One accidental `git clean -fd` or worktree deletion destroys the project's entire architectural documentation. FEATURES.md, MIGRATION.md, and all FTR files are at risk.
**Fix:** Stage and commit the `features/` directory. This is the highest-priority operational action — all other review findings are about content accuracy; this is about content survival.

### 3. [coherence] FTR-076 and FTR-135 are duplicate "AI-Assisted Translation Workflow"
**Location:** FEATURES.md lines 182 (editorial/FTR-076) and 144 (experience/FTR-135)
**Finding:** Two FTR files share identical titles ("AI-Assisted Translation Workflow"), both state Approved (Provisional), in different domains (editorial vs. experience). The migration should have merged these or differentiated them.
**Fix:** Determine if these are genuinely two perspectives (editorial process vs. experience architecture) — if so, rename to disambiguate (e.g., FTR-076 "AI-Assisted Translation — Editorial Workflow", FTR-135 "AI-Assisted Translation — Architecture"). If they're the same, merge and absorb one into the other's Notes section.

---

## Important

### 4. [coherence] "PRO" column header in ROADMAP.md Unscheduled Features tables
**Location:** ROADMAP.md lines 561, 568, 579 — three table headers
**Finding:** All three Unscheduled Features tables use "PRO" as the first column header, but the values are FTR-NNN identifiers. This is a leftover from the old PRO identifier system.
**Fix:** Rename column header from "PRO" to "FTR" in all three tables.

### 5. [coherence] ROADMAP.md execution order table doesn't match actual execution
**Location:** ROADMAP.md lines 28–41
**Finding:** The execution order table shows STG-005 (Refine) at position 7, after M5b (Languages) at position 6. In reality, STG-005 is complete and M5b hasn't started. The table was aspirational (breadth-first ideal) but actual execution didn't follow it. The table now misleads about both past and future sequence.
**Fix:** Add a note above the table: "This was the planned breadth-first execution order per FTR-011. Actual execution reordered STG-005 before M5b (STG-005 complete; language activation awaiting content sources)." Or update the table to reflect actual vs. planned.

### 6. [coherence] CONTEXT.md "governing ADRs" terminology with FTR identifiers
**Location:** CONTEXT.md line 181
**Finding:** Text reads "governing ADRs (FTR-024, FTR-105, FTR-027...)" — uses the old "ADRs" term with new FTR identifiers. Post-migration, these should be "governing FTRs".
**Fix:** Replace "governing ADRs" with "governing FTRs".

### 7. [coherence] ROADMAP.md STG-001 description still says "120+ ADRs"
**Location:** ROADMAP.md line 63
**Finding:** "The design is 120+ ADRs deep" — should now reference 159 FTR files post-migration.
**Fix:** Change to "The design is 159 FTR files deep" or simply "extensively specified in features/".

### 8. [gap] STG-004 has 2 outstanding deliverables (STG-004-16, STG-004-22) but Current State implies Arc 2 complete
**Location:** CONTEXT.md line 5 ("STG-005 complete"), ROADMAP.md STG-004 Progress ("22 of 24 deliverables complete")
**Finding:** CONTEXT.md says "STG-005 (Refine) complete" which reads as Arc 2 done. But STG-004-16 (EXIF/XMP image metadata) and STG-004-22 (Lambda + database backup infrastructure) remain incomplete. The STG-006 gate passes without these ("architecturally independent"), so this isn't blocking — but the status reporting is imprecise.
**Fix:** Add to CONTEXT.md Current State: "STG-004: 22/24 done; STG-004-16 (EXIF/XMP) and STG-004-22 (Lambda backup) deferred — not blocking STG-006." This makes the gap visible without implying it's a problem.

### 9. [alignment] Greenfield UX rebuild decision exists in memory but not in project docs
**Location:** Auto-memory `greenfield-plan.md`, not reflected in CONTEXT.md, ROADMAP.md, or any FTR
**Finding:** A significant architectural decision ("Rebuild UX layer greenfield, native to yogananda-design system") exists in session memory but has no FTR file, no ROADMAP deliverable, and no CONTEXT.md mention. If this is a real decision, it's the most consequential undocumented one in the project. If it's exploratory, the memory file overstates its status.
**Fix:** Either (a) create FTR-145 or similar for the design language system rebuild and update ROADMAP.md, or (b) demote the memory entry to "exploratory" status. FTR-145 exists as "Visual Design Language System — AI-First Design Tokens" (Proposed) in FEATURES.md — this may be the right vehicle, but its state needs to be reconciled with the memory's "decision" framing.

---

## Minor

### 10. [coherence] ROADMAP.md line 601 references "FTR-096" four times with different subtitles
**Location:** ROADMAP.md line 601
**Finding:** "*FTR-096 (Release Tagging), FTR-096 (Operational Health), FTR-096 (Document Integrity CI), FTR-096 (Design-Artifact Traceability)*" — these were four separate items that merged into one FTR. The note is correct but reads confusingly post-migration. It's historical narration that has served its purpose.
**Fix:** Simplify to: "*Multiple operational surface items consolidated into FTR-096.*" or remove entirely since the information is captured in FTR-096's Notes section.

### 11. [coherence] FEATURES.md "Subsection Identifiers" table is confusing
**Location:** FEATURES.md lines 250–268
**Finding:** The table lists FTR-040 seven times and FTR-056 three times as "Old ID" → "Parent FTR" mappings, but both columns show the same number. This was meaningful when the source was DES-007/DES-011/etc., but post-migration the table no longer conveys useful information (FTR-040 is a subsection of... FTR-040).
**Fix:** Either restore the old DES identifiers in the "Old ID" column for historical reference, or remove the table and add a note that these subsections live within their parent FTR files.

### 12. [gap] No FTR state is "Implemented" despite STG-001–STG-005 being complete
**Location:** FEATURES.md — all states are Approved/Proposed/Deferred, none Implemented
**Finding:** Per CLAUDE.md § Documentation–Code Transition: "When implemented: Set state to implemented in the FTR metadata." STG-001 through STG-005 are complete with working code, but no FTR files have transitioned to "Implemented" state. This means the loading guidance ("stop loading the file routinely") never triggers.
**Fix:** Identify FTR files whose specifications are fully implemented in code (e.g., FTR-020 Hybrid Search, FTR-023 Chunking, FTR-046 Lotus Bookmark, FTR-103 PWA) and update their state. This is a batch task best done with a checklist against STG-001–STG-005 deliverables.

### 13. [coherence] Memory file references stale design directory structure
**Location:** Auto-memory MEMORY.md § "Design File Structure"
**Finding:** Memory describes `design/search/`, `design/experience/`, `design/editorial/` directories with DES/ADR file listings. Git status shows all these files as deleted (part of the FTR migration). The memory section will mislead future sessions.
**Fix:** Update MEMORY.md to remove the "Design File Structure" section and replace with a note about the FTR structure in `features/`.

### 14. [coherence] Memory file "Identifier System" section uses old ADR/DES/PRO terminology
**Location:** Auto-memory MEMORY.md § "Identifier System"
**Finding:** "Five identifier types: PRI-NN, ADR-NNN, DES-NNN, PRO-NNN, M{arc}{milestone}-{N}" — should now reference two types: PRI-NN and FTR-NNN (plus M-notation for deliverables).
**Fix:** Update to reflect the post-migration identifier system: PRI-NN (principles), FTR-NNN (features), M-notation (deliverables).

---

## Summary

| Metric | Count |
|--------|-------|
| **Total findings** | 14 |
| **By severity** | Critical: 3, Important: 6, Minor: 5 |
| **By dimension** | Coherence: 10, Gap: 2, Alignment: 2 |

The dominant pattern is **post-migration coherence debt**: the FTR identifier migration (PRO-050) successfully restructured 159 features into a clean hierarchy, but residual references to old terminology (ADR, PRO, DES), stale table headers, and state tracking haven't caught up. The two most urgent actions are: (1) commit the untracked `features/` directory, and (2) resolve the FTR-094 identifier collision.

---

## Questions Worth Asking

- **What is the commit plan for features/?** The entire FTR corpus is untracked — is there a deliberate reason, or is this simply the next step after migration review?
- **Should FTR states be batch-updated to "Implemented" now, or at a dedicated arc boundary?** The state tracking gap affects loading guidance but not functionality.
- **Is the greenfield UX rebuild a decision or an exploration?** The answer determines whether it needs an FTR and ROADMAP integration, or just a memory annotation.
- **What am I not asking?** Whether the 159-file FTR structure is sustainable for AI context loading — 159 files is a lot of documents. The "load only what the task requires" guidance is essential, but has anyone evaluated whether the migration actually reduced or increased the context window cost per session?
