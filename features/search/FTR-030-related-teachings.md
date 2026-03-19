---
ftr: 30
title: "Related Teachings — Pre-Computed Chunk Relations and Graph Traversal"
summary: "Pre-computed top-30 same-language chunk relations powering side panel, thread continuation, and graph traversal"
state: implemented
domain: search
governed-by: [PRI-03, PRI-05]
depends-on: [FTR-024]
---

# FTR-030: Related Teachings

## Rationale

### Context

The current portal design is primarily reactive -- the seeker must search, click a theme, or visit the Quiet Corner. But the Findability Principle states: *"The teachings should find the seeker, not only the other way around."*

When a seeker reads a paragraph about cosmic consciousness in Autobiography of a Yogi, they may not know that Yogananda wrote about the same experience with different language in Man's Eternal Quest. The portal should surface these connections *proactively* during reading.

### Decision

Use **pre-computed chunk relations** stored in a `chunk_relations` table. For each paragraph (chunk), store the top 30 most semantically similar **same-language** chunks + top 10 most similar **English supplemental** chunks from the entire corpus, excluding adjacent paragraphs from the same chapter.

This powers three features:

1. **Related Teachings side panel** -- while reading, a right-side panel shows the top 3 related passages from other books
2. **"Continue the Thread"** -- at the end of every chapter, aggregates the most related cross-book passages
3. **Graph traversal** -- clicking a related passage navigates to that passage in its reader context

**Relationship categorization** (STG-007+):

| Category | Description | Source |
|----------|-------------|--------|
| **Same Concept** | Passages about the same topic from different works | Vector similarity + topic overlap |
| **Deeper in This Theme** | What this state or concept progresses toward | PROGRESSION_TO graph edges |
| **Another Teacher's Expression** | Same concept expressed by a different lineage teacher | Author-filtered similarity |
| **Parallel Tradition** | Cross-tradition equivalent | CROSS_TRADITION_EQUIVALENT graph edges |
| **Technique for This State** | Practice instruction toward the described experiential depth | Graph edges |

**Multilingual computation strategy:**
- **Top 30 same-language** relations: powers the default side panel
- **Top 10 English supplemental** relations: provides fallback for non-English languages
- Total: up to 40 rows per chunk

### Rationale

- **The Findability Principle demands proactive content surfacing.** Search is necessary but not sufficient.
- **Pre-computation eliminates read-time latency.** A database lookup in `chunk_relations` is sub-millisecond.
- **Paragraph-level is the right granularity.** Paragraphs are complete thoughts -- the natural unit of Yogananda's prose.
- **Per-language storage ensures full related teachings for every language.**
- **Incremental updates are efficient.** Adding a 3,000-chunk book requires ~150M cosine similarity comparisons -- minutes, not hours.

### Consequences

- A `chunk_relations` table and a `chunk_references` table added
- Two new API endpoints: `/api/v1/passages/[id]/related` and `/api/v1/books/[slug]/chapters/[number]/thread`
- The Book Reader component gains a Related Teachings side panel (desktop) and bottom sheet (mobile)

### Discovery Research Integration (March 2026)

Research from library science and content-only recommendation systems (deep-research-gemini-discovery-without-surveillance.md) identifies two patterns to adopt when surfacing related teachings:

**MMR Rescoring.** Apply Maximal Marginal Relevance when selecting which relations to display. The current top-3 selection by raw similarity risks presenting three passages that are similar to the source *and to each other* — five dense philosophical passages in a row. MMR penalizes candidates similar to already-selected items, ensuring diversity across depth signature, voice register, and rasa. Implementation: a `lib/services/mmr.ts` function takes candidate passages + already-displayed passages, returns diversity-maximized subset using existing embeddings.

**Appeal-Factor Indexing.** The portal's enrichment metadata maps directly to library science "appeal factors" that predict reader satisfaction without behavioral data: rasa → Mood, passage depth → Complexity, voice register → Style, topic → Theme. When ranking related teachings, query multiple dimensions simultaneously rather than relying on topical similarity alone. A passage that shares the same *rasa* and *depth signature* but uses different vocabulary creates the "illuminating juxtaposition" effect — more valuable than straightforward topical matching.

**Relationship label micro-copy.** Replace mechanical labels ("Related Passage") with semantic transition notes generated from relationship types. A PROGRESSION_TO edge renders as "Moving deeper into this practice..."; a CROSS_TRADITION_EQUIVALENT renders as "A parallel expression from another tradition...". This produces the "wise librarian" effect — the corpus's structural intelligence voiced as caring guidance.

## Notes

- **Origin:** FTR-030
