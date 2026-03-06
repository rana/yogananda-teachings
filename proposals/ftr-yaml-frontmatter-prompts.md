# FTR YAML Frontmatter Migration — Execution Prompts

**Companion to:** `proposals/ftr-yaml-frontmatter-migration.md`
**Prompts:** 2 (Convert, then Verify + Finalize)
**Estimated:** ~15 min total

---

## Prompt 1: Convert All FTR Files

```
Read proposals/ftr-yaml-frontmatter-migration.md, then convert all 162 FTR files to YAML frontmatter format.

START with these 5 files as calibration (read each, convert, verify first 15 lines look right before continuing):
- features/foundation/FTR-001-verbatim-fidelity.md (plain bold, foundational state)
- features/experience/FTR-040-frontend-design.md (bulleted bold, self-referencing governed-by)
- features/operations/FTR-080-engineering-standards.md (blockquoted bold, Replaces field)
- features/foundation/FTR-114-neon-auth.md (proposed state, minimal metadata)
- features/experience/FTR-142-cross-media-intelligence.md (deferred, suspension + reactivation metadata)

Then convert all remaining FTR files. Use parallel agents grouped by domain directory (foundation, search, experience, editorial, operations).

FIELD RULES:

- ftr: integer, no zero-padding (34 not 034)
- title: full title from the # heading, including subtitle
- state: lowercase. Normalize per proposal table. Keep "deferred" as "deferred". Keep "declined" as "declined". No state-semantic changes — this is a format migration only.
- domain: from bold-text metadata
- arc: string, from bold-text metadata
- governed-by: list of PRI-NN / FTR-NNN identifiers. Drop self-references (FTR-040 referencing itself, FTR-142 referencing itself). If only self-references exist, omit the field.
- replaces: list, if present
- always-load: ONLY write this field on the 11 files where it's true: FTR-004, 007, 013, 014, 015, 016, 017, 018, 019, 081, 082. Omit the field on all other files.
- absorbed-into: integer, only for state: absorbed
- depends-on: only when explicit dependency language exists ("depends on", "requires", "blocked by"). When uncertain, omit.
- re-evaluate-at: string, only if present
- suspended: ISO date, only if present

Omit optional fields entirely when not applicable — don't write empty lists or false values.

FORMAT RULES:

- Remove bold-text metadata lines from the header area (all 3 variants: plain, bulleted, blockquoted)
- Simplify # heading: drop subtitle after em-dash if present. "FTR-034: Knowledge Graph" not "FTR-034: Knowledge Graph — Structured Spiritual Ontology"
- One blank line between closing --- and the # heading
- Keep body-only metadata (Suspended, Reactivation trigger, Decision required from, Scheduling Notes) as bold-text in the body — narrative, not structured
- Do NOT modify body content (Rationale, Specification, Notes sections)

After completion, report: total files converted, any files with ambiguous metadata that required judgment.
```

---

## Prompt 2: Verify + Finalize

```
Read proposals/ftr-yaml-frontmatter-migration.md for reference.

The FTR YAML frontmatter batch conversion is complete. Run verification checks, then finalize.

VERIFICATION:

1. Count FTR files with YAML frontmatter (--- on line 1): expect 162
2. Parse each file's frontmatter — confirm all required fields present: ftr, title, state, domain, arc
3. Grep for orphaned bold-text metadata in the first 10 lines of all FTR files: "**State:**", "**Domain:**", "**Arc:**", "**Governed by:**" in any format (plain, bulleted, blockquoted). Expect zero matches.
4. Count always-load: true across all FTR files: expect exactly 11
5. Tally state values and compare against FEATURES.md domain index tables
6. Check FTR-076 (if file exists): should have state: absorbed, absorbed-into: 135

Fix any discrepancies found.

FINALIZE:

1. In features/FEATURES.md, add this note to the "Always-Load FTRs" section header area:
   > **Source of truth for always-load is now the `always-load: true` field in each FTR's YAML frontmatter.** This table is maintained for human navigation.

2. In features/MIGRATION.md, add a dated note about the YAML frontmatter migration.

3. Stage and commit: "Add YAML frontmatter to all FTR files; standardize metadata format"
```

---

## Design Notes

| Decision | Rationale |
|----------|-----------|
| Calibration 5, then batch | Catches format misinterpretation before it propagates. No human gate needed — the agent self-checks. |
| Parallel agents by domain | 5 independent directories, no cross-file dependencies during conversion. ~5x faster than sequential. |
| Omit-when-absent convention | `always-load: true` on 11 files vs `always-load: false` on 151. Signal is in presence, not value. Cleaner YAML. |
| Separate verify prompt | Verification needs the full corpus converted. Fresh context window avoids pressure from 162-file edit session. |
| State semantics unchanged | The proposal's correction (line 108-110) says don't collapse state values. `declined` stays `declined`, `deferred` stays `deferred`. Format migration only. |
| Commit in Prompt 2 | Verification gates the commit within the same prompt. No behavioral changes — low-risk single commit. |
