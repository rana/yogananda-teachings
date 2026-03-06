---
ftr: 30
title: "Related Teachings -- Pre-Computed Chunk Relations and Graph Traversal"
state: approved
domain: search
arc: 1a+
governed-by: [PRI-03, PRI-05]
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

**Relationship categorization** (Milestone 3b+):

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

## Notes

- **Origin:** FTR-030
