---
ftr: 128
title: "Structural Enrichment Tier — Whole-Context AI Understanding for Navigation"
state: proposed
domain: search
arc: 3b+
governed-by: [FTR-026, FTR-034, FTR-105, FTR-028, FTR-039]
---

# FTR-128: Structural Enrichment Tier

## Rationale

**Target:** Milestone 3b (alongside graph intelligence activation)
**Dependencies:** Assembled book text (available for AoY en/es). Opus batch access (Bedrock). Chunk enrichment pipeline operational (Milestone 1c).

**The gap.** The enrichment pipeline (FTR-026) analyzes chunks independently — each ~500-word passage is enriched in isolation. The knowledge graph (FTR-034, FTR-034) builds bottom-up from these chunk-level entities and relationships. But structural understanding at chapter, book, and author scale is absent. No artifact captures what Opus sees when it reads an entire chapter as a coherent arc, an entire book as an argument structure, or an author's complete output as a distinctive voice.

This missing tier is the difference between a library that catalogs individual pages and one that understands how books work.

**Design constraint: invisible but load-bearing.** Structural enrichment artifacts are internal metadata powering navigation, presentation, and aggregation. They are never displayed as AI-authored content. Seekers experience curated organization; the curation logic is invisible. This parallels the existing chunk-level enrichment pattern — Opus assigns depth levels, topic tags, and entity labels that power search ranking without seekers seeing the classification. The librarian is invisible; the library is the experience.

This constraint resolves the PRI-01 boundary cleanly: structural readings are navigation metadata (same category as topic tags and depth levels), not generated content. No stakeholder ambiguity.

**What this enables (all invisible to seekers):**
- **Chapter resonance navigation** — "Chapters with similar arc" powered by structural similarity, not just topic overlap
- **Richer Wanderer's Path** (FTR-140) — emotional trajectory and structural type inform passage selection beyond topic and depth
- **Journey mode** — "Walk through how Yogananda builds the case for [concept]" ordered by the book's argument architecture, not chapter sequence
- **Author-informed grouping** — passages clustered by voice characteristics (metaphor patterns, emotional register), not just `WHERE author_id = ?`
- **Semantic positioning** (FTR-129) — chapter coordinates on meaningful axes for spatial navigation

**Three enrichment scales:**

1. **Chapter Perspective.** Opus reads an entire chapter in context. Produces: thematic arc (how the chapter moves), emotional trajectory (sequence of registers), turning points (pivots in the chapter's direction), metaphor patterns (recurring imagery), structural type (spiral, linear build, frame narrative, progressive revelation, etc.), and connections to other chapters in the same work. ~49 Opus calls per book.

2. **Book Perspective.** Opus reads chapter perspectives for an entire book — or the full book in a single context window for works that fit (~150K words). Produces: argument architecture (how the book builds its case), movement (the book's emotional/intellectual trajectory), structural pattern (the work's organizing principle), key chapters by role in the architecture, and the book's distinctive contribution (what this work does that no other does). ~1 Opus call per book.

3. **Author Voice Profile.** Opus reads across all works by an author. Produces: voice characteristics, metaphor preferences, emotional range, characteristic pedagogical moves, distinctive emphasis, and contrast dimensions with other authors. ~1 Opus call per author.

**Cross-structural artifact:**

4. **Chapter Resonances.** Structural parallels across chapters in different works — same arc pattern, same thematic movement, same emotional trajectory deployed for a different teaching. Generated during book perspective enrichment. These are "this chapter does the same structural work as that chapter" — a relationship invisible to passage-level similarity but load-bearing for navigation.

**Storage architecture:** Enrichment tables parallel to the knowledge graph, not graph nodes. The graph represents *what exists* (entities, passages, relationships). Structural enrichment represents *how to navigate* (arcs, trajectories, voices). Mixing them muddies both.

```sql
-- Chapter-level structural understanding
CREATE TABLE structural_chapters (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  chapter_id UUID NOT NULL REFERENCES book_chapters(id),
  work_id UUID NOT NULL REFERENCES works(id),
  language TEXT NOT NULL,
  thematic_arc TEXT NOT NULL,            -- Opus's structural reading of the chapter
  emotional_trajectory TEXT[] NOT NULL,  -- sequence of emotional registers
  turning_points JSONB NOT NULL,         -- [{chunk_id, description}]
  metaphor_patterns TEXT[],
  structural_type TEXT NOT NULL,         -- spiral, linear_build, frame_narrative, progressive_revelation, etc.
  semantic_coordinates JSONB,            -- for FTR-129 cartography
  enrichment_model TEXT NOT NULL,        -- model ID per FTR-012
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Book-level structural understanding
CREATE TABLE structural_works (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  work_id UUID NOT NULL REFERENCES works(id),
  language TEXT NOT NULL,
  architecture TEXT NOT NULL,            -- how the book builds its argument
  movement TEXT NOT NULL,                -- emotional/intellectual trajectory
  structural_pattern TEXT NOT NULL,      -- spiral, progressive_revelation, biographical_arc, etc.
  key_chapters JSONB NOT NULL,           -- [{chapter_id, role_in_architecture}]
  distinctive_contribution TEXT NOT NULL, -- what this book does that no other does
  enrichment_model TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Author voice profiles
CREATE TABLE structural_authors (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  author_id UUID NOT NULL REFERENCES persons(id),
  voice_characteristics TEXT NOT NULL,
  metaphor_preferences TEXT[],
  emotional_range TEXT NOT NULL,
  characteristic_moves TEXT[],           -- pedagogical patterns
  distinctive_emphasis TEXT NOT NULL,
  contrast_dimensions JSONB,             -- [{author_id, dimension, description}]
  enrichment_model TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cross-work structural parallels
CREATE TABLE chapter_resonances (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  source_chapter_id UUID NOT NULL REFERENCES book_chapters(id),
  target_chapter_id UUID NOT NULL REFERENCES book_chapters(id),
  resonance_type TEXT NOT NULL,          -- structural_parallel, thematic_echo, progressive_deepening
  description TEXT NOT NULL,
  confidence FLOAT NOT NULL,
  enrichment_model TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Relationship to existing proposals and architecture:**
- **FTR-127 (Passage Depth Signatures):** Chunk-level contemplative quality classification. Structural enrichment operates at chapter/book/author scale. Complementary, not overlapping. Chapter perspectives may calibrate depth signature assignment.
- **FTR-140 (Wanderer's Path):** Consumes structural enrichment to weight passage selection — emotional trajectory and book architecture make "surprise the seeker" richer than topic + depth alone.
- **FTR-126 (Word-Level Graph Navigation):** Vocabulary-level graph traversal. Structural enrichment provides the larger-scale context that vocabulary navigation operates within.
- **FTR-034 (Graph Intelligence):** Graph is bottom-up from chunks. Structural enrichment is top-down from whole works. They meet in the middle — graph edges connect entities, structural artifacts explain how those connections serve the book's architecture.
- **FTR-026 (Unified Enrichment):** The `passage_role` field (added to FTR-026) is the breadcrumb — each chunk self-reports its rhetorical function. Structural enrichment provides the chapter-level context that validates and enriches those per-chunk roles.

**Cost model:** One-time per book at ingestion. ~50 Opus calls per book (chapters + book-level). For the full corpus (~25 books): ~1,250 Opus calls total. At current Opus batch pricing, modest and comparable to the existing chunk enrichment pipeline cost.

**Validation step:** Prototype on Autobiography of a Yogi (English). Feed the full book (~164K words) to Opus in a single context window. Request all 49 chapter perspectives + 1 book perspective. Evaluate: (1) Do structural readings distinguish chapters in ways topic tags don't? (2) Can they power "chapters like this" recommendations? (3) Can they inform spatial positioning (FTR-129)? (4) When used to power navigation UX, does the result feel like "curated library" rather than "AI commentary"? Assembled text is available now — prototype can run before Milestone 3b.

**Re-evaluate At:** After prototype validation (can run anytime — assembled text available now)
**Decision Required From:** Architecture (prototype results determine scheduling)
**Origin:** Graph navigation exploration — invisible-librarian enrichment pattern at chapter/book/author scale (2026-02-28)

## Notes

- **Origin:** FTR-128
