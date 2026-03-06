# Proposal: YAML Frontmatter for FTR Files

**Status:** Draft
**Scope:** All 162 active FTR files across 5 domains
**Type:** Corpus infrastructure migration (one-time batch, then convention going forward)

---

## Movement I: Why This, Why Now

### The friction

Every tool that touches FTR files — spec-survey, ftr-curate, ftr-stale, verify, proposal-merge, doc-maintainer — starts by parsing unstructured markdown to extract metadata. The metadata exists in three inconsistent formats across 162 files:

| Format | Count | Example |
|--------|-------|---------|
| Plain bold | 92 | `**State:** Approved` |
| Bulleted bold | 41 | `- **State:** Approved` |
| Blockquoted bold | 29 | `> **State:** Approved` |

Parsing requires three regex patterns, and edge cases still break: FTR-040's "Governed by" self-references, FTR-142's merged absorption notes, FTR-098's nested scheduling metadata. Every new skill that reads FTRs re-derives this parsing logic.

### The cost

- **AI operability:** Each tool invocation spends tokens parsing FEATURES.md to build an index that could be embedded in each file. ftr-stale needs state + domain + dependencies to triage. Currently it must read FEATURES.md first, then correlate. With frontmatter, it can read any FTR file independently.
- **Consistency:** Three format variants create ambiguity. New FTRs copy whichever template the author last saw.
- **Always-Load designation:** Currently a table in FEATURES.md, not discoverable from the FTR file itself. Tools must cross-reference two files to determine this.
- **Cross-references:** `Governed by`, `Depends on`, and `Replaces` exist as free-text bold lines. Not machine-parseable as identifier lists.

### Who feels this

AI agents doing corpus operations. Every skill in the ftr-curate / ftr-stale / spec-survey / verify chain. The doc-maintainer agent. And any future tool that reads FTRs — the format tax compounds.

### Governing decisions

- FTR-084 (Documentation Architecture) governs document conventions
- FTR-080 (Engineering Standards) establishes project template patterns
- FTR-059 (Machine-Readable Content) — the principle that content should be machine-parseable applies to the spec corpus itself

---

## Movement II: The Core Move

**Add YAML frontmatter to every FTR file. Remove the redundant bold-text metadata lines.**

### Anatomy

Before:
```markdown
# FTR-034: Knowledge Graph — Structured Spiritual Ontology

**State:** Approved
**Domain:** search
**Arc:** 3b+
**Governed by:** PRI-03, PRI-10

## Rationale
```

After:
```markdown
---
ftr: 34
title: Knowledge Graph — Structured Spiritual Ontology
state: approved
domain: search
arc: 3b+
governed-by: [PRI-03, PRI-10]
always-load: false
---

# FTR-034: Knowledge Graph

## Rationale
```

### Field inventory

| Field | Type | Required | Source | Notes |
|-------|------|----------|--------|-------|
| `ftr` | integer | yes | FTR number (no padding) | The canonical identifier |
| `title` | string | yes | From `# FTR-NNN:` heading | Short title without the FTR prefix |
| `state` | enum | yes | Current `**State:**` line | Lowercase: `proposed`, `approved`, `approved-foundational`, `approved-provisional`, `implemented`, `deferred`, `archived`, `absorbed` |
| `domain` | enum | yes | Current `**Domain:**` line | `foundation`, `search`, `experience`, `editorial`, `operations` |
| `arc` | string | yes | Current `**Arc:**` line | Free-form: `1+`, `2`, `3b+`, etc. |
| `governed-by` | list | no | Current `**Governed by:**` line | List of PRI-NN or FTR-NNN identifiers |
| `replaces` | list | no | Current `**Replaces:**` line | List of FTR-NNN identifiers |
| `depends-on` | list | no | Extracted from Rationale cross-refs | Only explicit dependencies, not all mentions |
| `always-load` | boolean | no | FEATURES.md "Always-Load" table | Default: false. 11 FTRs are true. |
| `absorbed-into` | integer | no | For Absorbed state only | The FTR number this was merged into |
| `re-evaluate-at` | string | no | Current `**Re-evaluate At:**` lines | Free-form: milestone or trigger description |
| `suspended` | date | no | Current `**Suspended:**` lines | ISO date when deferred |

### State normalization

| Current state text | Frontmatter value |
|-------------------|-------------------|
| Approved | `approved` |
| Approved (Foundational) | `approved-foundational` |
| Approved (Provisional) | `approved-provisional` |
| Proposed | `proposed` |
| Proposed (Validated) | `proposed` |
| Implemented | `implemented` |
| Deferred | `deferred` |
| Declined | `archived` |
| Absorbed | `absorbed` |

Per user direction: Deferred and Declined collapse into `deferred` for now. The `archived` terminal state will be introduced separately when the lifecycle is formalized. Absorbed remains distinct — it's a redirect, not a terminal state.

**Correction:** Keep Deferred as `deferred` for this migration. The Deferred→Archived collapse is a separate lifecycle decision that should be made intentionally, not bundled into a format migration. This proposal only changes the *format* of metadata, not the *semantics* of states.

### What about the `# FTR-NNN:` heading?

Keep it. The heading serves human navigation and renders well in GitHub/editors. The title in frontmatter serves machine parsing. Slight redundancy, high ergonomic value.

Simplify the heading: drop the subtitle. `# FTR-034: Knowledge Graph` rather than `# FTR-034: Knowledge Graph — Structured Spiritual Ontology and Postgres-Native Graph Intelligence`. The full title lives in frontmatter.

### Alternatives considered

**Keep bold-text, just standardize format.** Solves the 3-variant problem but not the machine-parseability problem. Tools still need regex. Rejected.

**Frontmatter only, remove headings entirely.** Breaks human reading and GitHub rendering. Rejected.

**JSON frontmatter instead of YAML.** YAML is the convention for markdown frontmatter (Hugo, Jekyll, Obsidian, mdx). No reason to diverge. Rejected.

---

## Movement III: Displacement and Integration

### What changes

1. **162 FTR files** — add YAML frontmatter block, remove bold-text metadata lines, simplify heading
2. **FEATURES.md** — the "Always-Load FTRs" table becomes informational (the source of truth moves to `always-load: true` in each file). The main index table and domain tables remain unchanged — they serve as navigation.
3. **MIGRATION.md** — add a note about the format change

### What stays unchanged

- **FEATURES.md index tables** — still the navigation hub. FTR numbers, titles, states, and links remain.
- **FTR body content** — Rationale, Specification, Notes sections untouched
- **Cross-references in body text** — `FTR-NNN` references within prose remain as-is
- **DES-NNN subsections** — within parent FTRs, unchanged
- **File names** — `FTR-NNN-slug.md` naming convention unchanged

### Judgment rules for ambiguous cases

1. **`depends-on` extraction:** Only include identifiers that appear in explicit dependency statements ("depends on FTR-NNN", "requires FTR-NNN", "blocked by FTR-NNN"). Do NOT include every FTR mentioned in the Rationale — those are context, not dependencies. When uncertain, omit. Dependencies can be added incrementally.

2. **`governed-by` with self-references:** FTR-040 currently says "Governed by: FTR-040, FTR-040, ...". Replace with the actual governing principles/FTRs. If no external governance, omit the field.

3. **FTRs with extra metadata fields** (Scheduling Notes, Reactivation trigger, Decision Required From): These remain as bold-text lines in the body — they're narrative, not structured metadata. Only the universal fields (state, domain, arc, governed-by) move to frontmatter.

4. **FTR-076 (Absorbed):** Already marked `Absorbed` in FEATURES.md. Add `state: absorbed` and `absorbed-into: 135` in frontmatter.

---

## Movement IV: Execution

### Single-session batch migration

This is a scripted operation, not a multi-session effort. One commit.

**Step 1: Dry run on 5 representative FTRs (manual, ~10 min)**

Pick one from each format variant and one edge case:
- Plain bold: FTR-001 (Foundational, governed-by)
- Bulleted: FTR-040 (self-referencing governed-by, DES-NNN subsections)
- Blockquoted: FTR-080 (Replaces field)
- Proposed: FTR-114 (minimal metadata)
- Deferred: FTR-142 (suspension metadata, reactivation trigger)

Manually convert each. Verify the frontmatter parses correctly (`cat file | head -20`). Verify the body reads naturally without the removed metadata lines.

**Step 2: Batch conversion (scripted, ~5 min)**

For each FTR file:
1. Read the file
2. Extract: FTR number, title, state, domain, arc, governed-by, replaces (from whatever format variant)
3. Check FEATURES.md "Always-Load" table for this FTR number
4. Construct YAML frontmatter block
5. Remove the bold-text metadata lines (all three variants)
6. Simplify the `# FTR-NNN:` heading (drop subtitle after em-dash if present)
7. Insert frontmatter at top of file
8. Write the file

**Step 3: Verify (automated, ~2 min)**

- Count files with frontmatter: should be 162
- Parse each frontmatter block: all required fields present
- No orphaned bold-text metadata lines remaining
- `always-load: true` count: should be 11
- State distribution matches FEATURES.md index

**Step 4: Update FEATURES.md**

Add a note to the "Always-Load FTRs" section:
```markdown
> **Source of truth for always-load is now the `always-load: true` field in each FTR's YAML frontmatter.** This table is maintained for human navigation.
```

**Step 5: Commit**

Single commit: `Add YAML frontmatter to all FTR files; standardize metadata format`

### Completion criteria

- All 162 active FTR files have valid YAML frontmatter
- No bold-text metadata lines remain in the first 10 lines of any FTR
- Frontmatter state values match FEATURES.md index (automated check)
- 11 FTRs have `always-load: true`
- FTR-076 has `state: absorbed` and `absorbed-into: 135`

---

## Movement V: Trust

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Regex extraction misparses a format variant | Medium | Low (individual file fixable) | Dry run on 5 representatives first; automated verification pass |
| `depends-on` over-extraction (mentions ≠ dependencies) | Medium | Low (false positives are removable) | Conservative extraction: only explicit dependency language |
| Some rendering tool chokes on YAML frontmatter | Low | Low | GitHub renders it fine. Contentful doesn't read FTRs. VS Code renders it fine. |
| Merge conflicts with in-flight FTR edits | Low | Medium | Do this on a clean branch with no pending FTR work |

### Scope

- **Files affected:** 162 FTR files + FEATURES.md + MIGRATION.md = 164 files
- **Estimated diff size:** ~2,000 lines added (frontmatter), ~1,500 lines removed (bold metadata) = net +500 lines
- **Behavior changes:** None. This is a format migration. No tool behavior changes.

### Decision required from

You. This is a corpus formatting decision with no behavioral impact. The tools that benefit (ftr-curate, ftr-stale, spec-survey, verify) will work with or without frontmatter — frontmatter makes them faster and more reliable.

### What this enables

- **ftr-curate** can read any FTR independently without loading FEATURES.md first
- **ftr-stale** can triage state accuracy by reading frontmatter instead of parsing prose
- **spec-survey** Phase 1 becomes a frontmatter scan instead of header-regex matching
- **Any future tool** gets structured metadata for free
- **Convention going forward:** new FTRs use the frontmatter template. No more format drift.
- **`depends-on` graph:** once populated, enables dependency-aware operations (archive cascades, impact analysis)

---

## Execution Note

This proposal is designed for Claude to execute. To run it:

```
cd ~/prj/yogananda-teachings
# Read this proposal, then execute Steps 1-5
```

The batch conversion (Step 2) should use Read/Edit tools per-file, not a shell script — Claude can handle the format variant detection and edge cases (self-referencing governed-by, absorption metadata) more reliably than regex.
