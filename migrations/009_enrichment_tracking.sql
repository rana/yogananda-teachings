-- migrate:up

-- ============================================================
-- ENRICHMENT TRACKING — The Missing Keystone
-- ============================================================
--
-- FTR-026 specifies a unified enrichment pipeline producing
-- summary, topics, entities, domain, depth, tone, and all
-- metadata in a single Claude pass per chunk. The columns exist
-- (001_initial_schema.sql) but nothing populates them.
--
-- This migration adds the tracking and operational columns that
-- make enrichment re-runnable, auditable, and pipeline-aware:
--
--   enrichment_model  → which model enriched this chunk
--   enriched_at       → when enrichment last ran
--   passage_role      → rhetorical function within chapter (FTR-026)
--   practice_bridge   → instructional passage detection (FTR-055)
--   ingestion_status  → per-book pipeline completion tracking
--
-- All changes are additive. No existing data modified.
-- ============================================================


-- ── book_chunks: enrichment tracking ────────────────────────────

-- Which model produced this chunk's enrichment data.
-- Essential for knowing when to re-enrich (model upgrade, prompt change).
ALTER TABLE book_chunks ADD COLUMN IF NOT EXISTS enrichment_model TEXT;

-- When enrichment last ran on this chunk.
ALTER TABLE book_chunks ADD COLUMN IF NOT EXISTS enriched_at TIMESTAMPTZ;

-- Rhetorical function within the chapter (FTR-026).
-- Inferred from content + chapter title + sequential position.
ALTER TABLE book_chunks ADD COLUMN IF NOT EXISTS passage_role TEXT
  CHECK (passage_role IS NULL OR passage_role IN (
    'opening', 'exposition', 'narrative', 'turning_point',
    'deepening', 'illustration', 'culmination', 'resolution',
    'transition', 'aside'
  ));

-- Practice Bridge candidate flag (FTR-055).
-- True when passage contains instructional language inviting
-- the reader to practice ("meditate," "visualize," "concentrate").
ALTER TABLE book_chunks ADD COLUMN IF NOT EXISTS practice_bridge BOOLEAN;


-- ── books: pipeline completion tracking ─────────────────────────

-- Per-book ingestion status. Each pipeline stage writes its
-- completion. Enables /ingest status and "content is being
-- prepared" UI states.
--
-- Example: {"capture": "complete", "extract": "complete",
--           "assemble": "complete", "contentful": "complete",
--           "neon": "complete", "enrich": "complete",
--           "relations": "complete", "rasa": "complete",
--           "suggestions": "pending"}
ALTER TABLE books ADD COLUMN IF NOT EXISTS ingestion_status JSONB DEFAULT '{}';


-- ── Indexes ─────────────────────────────────────────────────────

-- Find un-enriched chunks (the primary enrichment query)
CREATE INDEX IF NOT EXISTS idx_chunks_unenriched
  ON book_chunks(book_id, id)
  WHERE enriched_at IS NULL;

-- Filter by passage role (non-topical search: "show me turning points")
CREATE INDEX IF NOT EXISTS idx_chunks_passage_role
  ON book_chunks(passage_role)
  WHERE passage_role IS NOT NULL;

-- Practice bridge candidates for FTR-055 routing
CREATE INDEX IF NOT EXISTS idx_chunks_practice_bridge
  ON book_chunks(practice_bridge)
  WHERE practice_bridge = true;


-- migrate:down

DROP INDEX IF EXISTS idx_chunks_practice_bridge;
DROP INDEX IF EXISTS idx_chunks_passage_role;
DROP INDEX IF EXISTS idx_chunks_unenriched;

ALTER TABLE books DROP COLUMN IF EXISTS ingestion_status;
ALTER TABLE book_chunks DROP COLUMN IF EXISTS practice_bridge;
ALTER TABLE book_chunks DROP COLUMN IF EXISTS passage_role;
ALTER TABLE book_chunks DROP COLUMN IF EXISTS enriched_at;
ALTER TABLE book_chunks DROP COLUMN IF EXISTS enrichment_model;
