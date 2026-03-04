-- migrate:up

-- ============================================================
-- CONTENT STRUCTURE — The Ontological Bridge
-- ============================================================
--
-- The extraction pipeline (Claude Vision) classifies every content
-- block: verse, epigraph, heading, paragraph, caption. But this
-- knowledge was lost during assembly (all types flattened to
-- paragraphs) and ingestion (paragraphs merged by token count).
--
-- This migration adds the columns the design system needs to
-- render content with full typographic fidelity:
--
--   content_type  → CSS class: .reader-verse, .reader-epigraph
--   section_index → scene break detection (.reader-scene-break)
--   sort_order    → reliable paragraph sequencing within chapter
--   voice_register → already exists; add CHECK constraint
--   rasa          → aesthetic flavor for optional CSS treatment
--
-- The vocabulary is closed — the same word flows from:
--   design token JSON → SQL column → HTML data attribute → CSS selector
--
-- All changes are additive. Existing rows get sensible defaults.
-- The re-ingest pipeline will populate accurate values.
-- ============================================================


-- ── book_chunks: content_type ─────────────────────────────────
-- What kind of content this passage is. Determines visual treatment.
-- The extraction pipeline already knows this; we just need to carry it through.

ALTER TABLE book_chunks ADD COLUMN IF NOT EXISTS content_type TEXT NOT NULL DEFAULT 'prose'
  CHECK (content_type IN ('prose', 'verse', 'epigraph', 'dialogue', 'caption'));


-- ── book_chunks: section_index ────────────────────────────────
-- Groups passages into scenes within a chapter. A change in
-- section_index between consecutive passages renders a scene break
-- (the swelled gold rule from css/typography/features.css).

ALTER TABLE book_chunks ADD COLUMN IF NOT EXISTS section_index INTEGER NOT NULL DEFAULT 0;


-- ── book_chunks: sort_order ───────────────────────────────────
-- Clean sequential ordering within a chapter. paragraph_index has
-- gaps from the token-count chunking. sort_order is gapless.

ALTER TABLE book_chunks ADD COLUMN IF NOT EXISTS sort_order INTEGER;


-- ── book_chunks: voice_register constraint ────────────────────
-- voice_register already exists (001_initial_schema.sql) but has
-- no CHECK constraint and no default. Add the design system's
-- closed vocabulary. Leave nullable — AI enrichment populates this.

ALTER TABLE book_chunks ADD CONSTRAINT book_chunks_voice_register_check
  CHECK (voice_register IS NULL OR voice_register IN (
    'sacred', 'reverential', 'instructional', 'functional', 'ambient'
  ));


-- ── book_chunks: rasa (aesthetic flavor) ──────────────────────
-- The experiential dimension from the Indian aesthetic tradition.
-- Five rasas mapped in the design system (emotional-registers.language.json).
-- Populated by AI classification at ingest time or enrichment.

ALTER TABLE book_chunks ADD COLUMN IF NOT EXISTS rasa TEXT
  CHECK (rasa IS NULL OR rasa IN (
    'shanta', 'adbhuta', 'karuna', 'vira', 'bhakti'
  ));

ALTER TABLE book_chunks ADD COLUMN IF NOT EXISTS rasa_confidence REAL;

-- Editorial override: human curator can set rasa regardless of AI classification
ALTER TABLE book_chunks ADD COLUMN IF NOT EXISTS rasa_override TEXT
  CHECK (rasa_override IS NULL OR rasa_override IN (
    'shanta', 'adbhuta', 'karuna', 'vira', 'bhakti'
  ));


-- ── Indexes for content structure queries ─────────────────────

-- Chapter rendering: ordered passage retrieval by chapter
CREATE INDEX IF NOT EXISTS idx_chunks_chapter_sort
  ON book_chunks(chapter_id, sort_order)
  WHERE sort_order IS NOT NULL;

-- Section grouping: scene break detection within a chapter
CREATE INDEX IF NOT EXISTS idx_chunks_chapter_section
  ON book_chunks(chapter_id, section_index);

-- Content type filtering (e.g., find all verses in a book)
CREATE INDEX IF NOT EXISTS idx_chunks_content_type
  ON book_chunks(book_id, content_type)
  WHERE content_type != 'prose';


-- ── chapters: epigraph ────────────────────────────────────────
-- Many chapters in Autobiography of a Yogi open with an epigraph
-- (quoted passage, usually from scripture). The extraction pipeline
-- detects these but assembly discards them into the paragraph stream.

ALTER TABLE chapters ADD COLUMN IF NOT EXISTS epigraph TEXT;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS epigraph_attribution TEXT;


-- ── chapters: dominant rasa ───────────────────────────────────
-- The prevailing aesthetic flavor of the chapter as a whole.
-- Set by AI classification across all chapter passages.

ALTER TABLE chapters ADD COLUMN IF NOT EXISTS dominant_rasa TEXT
  CHECK (dominant_rasa IS NULL OR dominant_rasa IN (
    'shanta', 'adbhuta', 'karuna', 'vira', 'bhakti'
  ));


-- migrate:down

ALTER TABLE chapters DROP COLUMN IF EXISTS dominant_rasa;
ALTER TABLE chapters DROP COLUMN IF EXISTS epigraph_attribution;
ALTER TABLE chapters DROP COLUMN IF EXISTS epigraph;

DROP INDEX IF EXISTS idx_chunks_content_type;
DROP INDEX IF EXISTS idx_chunks_chapter_section;
DROP INDEX IF EXISTS idx_chunks_chapter_sort;

ALTER TABLE book_chunks DROP COLUMN IF EXISTS rasa_override;
ALTER TABLE book_chunks DROP COLUMN IF EXISTS rasa_confidence;
ALTER TABLE book_chunks DROP COLUMN IF EXISTS rasa;
ALTER TABLE book_chunks DROP CONSTRAINT IF EXISTS book_chunks_voice_register_check;
ALTER TABLE book_chunks DROP COLUMN IF EXISTS sort_order;
ALTER TABLE book_chunks DROP COLUMN IF EXISTS section_index;
ALTER TABLE book_chunks DROP COLUMN IF EXISTS content_type;
