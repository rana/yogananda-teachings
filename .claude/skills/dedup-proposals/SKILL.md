---
name: dedup-proposals
description: Consolidate raw explorations from .elmer/proposals/ into curated FTR files (state: proposed). Without arguments, scans all explorations and reports variant clusters. With an FTR-NNN or filename, finds related explorations and synthesizes them.
argument-hint: "[optional FTR-NNN or exploration-filename.md]"
---

## Exploration Deduplication and Feature Curation

### Context

Raw explorations in `.elmer/proposals/` are unvetted AI ideation — not project documents. This skill consolidates them into curated FTR files with state `proposed` in `features/{domain}/`. See FTR-084 for the documentation architecture.

### Mode Selection

**No arguments** (`/dedup-proposals`): Triage mode — scan all explorations, report clusters, recommend FTR entries.

**With argument** (`/dedup-proposals <FTR-NNN>` or `/dedup-proposals <filename>`): Synthesis mode — find all related explorations of the named topic, merge them into one FTR file.

---

### Triage Mode (no arguments)

Read `features/FEATURES.md` to determine the current max FTR number per domain and existing entries.

Read all `.md` files in `.elmer/proposals/`. For each file, extract:
- The `elmer:archive` metadata block (topic, id, archetype, status)
- The first 200 words of the Summary section

Cluster explorations by topic similarity:
1. **Exact match:** Same `topic` field in elmer metadata
2. **Near match:** Topics sharing 3+ significant words (excluding stopwords)
3. **Content match:** Summaries with >40% semantic overlap

For each cluster, report:
- File names and sizes
- Overlap percentage (structural alignment of sections)
- Which file is more developed (word count, section completeness)
- Unique ideas in each file not present in the other(s)
- Contradictions between files (if any)
- Recommended FTR entry: title, domain, and which exploration to use as canonical base
- Cross-references to existing FTR identifiers mentioned in the explorations

For non-clustered explorations, report as standalone candidates for individual FTR files.

Classify each cluster/standalone by type:
- **Feature** — New capability (word graph, read-to-me mode, focused reader)
- **Theme** — Content theme for taxonomy integration (self-worth, vibration/AUM, extra-solar life)
- **Policy** — Governance, legal, or process change (copyright, AI automation)
- **Enhancement** — Improvement to existing feature (visual design, reader mode)
- **Retrospective** — Design review findings (cognitive load, resonance analysis) — these may not need FTR files; they inform design revisions

Present the full report. Offer three actions:
1. Auto-resolve all clusters and create FTR files
2. Resolve cluster-by-cluster with approval
3. Show side-by-side comparison for a specific cluster

---

### Synthesis Mode (with argument)

**Step 1: Find related explorations**

If argument is an FTR-NNN, find the file in `features/` and identify the topic and origin files.

If argument is a filename, read the named file from `.elmer/proposals/`. Extract its `topic` field from the `elmer:archive` metadata block.

Scan all other `.md` files in `.elmer/proposals/`:
- Check for exact topic match (same elmer topic string)
- Check for near topic match (3+ shared significant words in topic)
- Check for content overlap (>40% of referenced FTR identifiers are the same)

Report what was found:
```
Found N related exploration(s):
  → filename.md (topic match: exact|near|content, overlap: NN%)
```

If no related explorations found, report and proceed to create a standalone FTR file.

**Step 2: Structural alignment**

For each section present in any source file (Summary, Analysis, Proposed Changes, Open Questions, What's Not Being Asked), compare across all sources:

- **Shared ideas:** Present in 2+ sources (strengthened signal)
- **Unique to source A:** Ideas only in one exploration
- **Unique to source B:** Ideas only in the other
- **Contradictions:** Claims or recommendations that conflict

Present the alignment table to the user.

**Step 3: Synthesize and create FTR file**

On approval, produce:

1. **An FTR file in `features/{domain}/FTR-NNN-{slug}.md`** with:
   - Next available FTR number in the appropriate domain's overflow range
   - State: Proposed
   - Domain: determined by topic (search, experience, editorial, operations, or foundation)
   - FTR file anatomy: `# FTR-NNN: Title` → metadata → `## Rationale` → `## Specification` → `## Notes`
   - Notes section includes origin exploration filenames

2. **Update `features/FEATURES.md` index** with the new entry.

3. **Update ROADMAP.md § Unscheduled Features** — add a row to the "Proposed — Awaiting Evaluation" table with the FTR-NNN reference.

4. **Archive source explorations** — move superseded files to `.elmer/proposals/archived/` (create directory if needed). Add a synthesis note to the archived files:

```markdown
<!-- Consolidated into FTR-NNN on [date] -->
```

**Step 4: Report**

Report the synthesis: FTR-NNN assigned, word counts, unique ideas preserved, contradictions flagged, files archived.

---

### Quality Standards

- **Lossless on ideas, lossy on phrasing.** Every distinct insight from every source must appear in the FTR file or be noted as a cross-reference. Redundant prose is collapsed.
- **Parallax is signal.** When two explorations reach the same conclusion independently, that's stronger evidence than either alone. Mark it.
- **Don't resolve tensions.** If Source A says "defer Neptune" and Source B says "keep Neptune but simplify," present both. Synthesis combines perspectives — it doesn't make decisions.
- **Preserve the "What's Not Being Asked" sections fully.** These contain the highest-value insights and are the most likely to differ between explorations.
- **FTR files are scheduling-focused.** The FTR body captures: what is proposed, what it depends on, what other FTRs it relates to, and when to re-evaluate. It does not duplicate the full exploration analysis.

## Output Management

Present the structural alignment before writing anything. The user approves, edits, or rejects the synthesis plan before FTR files are created.

If multiple clusters need deduplication, segment into groups. Present each cluster's synthesis plan for approval. After each approved synthesis is executed, proceed immediately to present the next cluster. Continue until all clusters are processed. State the total count when complete.
