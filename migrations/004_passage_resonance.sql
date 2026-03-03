-- migrate:up

-- ============================================================
-- PASSAGE RESONANCE — M3a-7 (ADR-052)
--
-- Anonymous, aggregated counters: share, dwell, relation traversal,
-- and daily passage skip. Simple integers, no timestamps, no session
-- correlation. DELTA-compliant (PRI-09).
--
-- Separate table from book_chunks — analytics data does not
-- cohabitate with content data.
-- ============================================================

CREATE TABLE passage_resonance (
  chunk_id UUID NOT NULL REFERENCES book_chunks(id) ON DELETE CASCADE,
  share_count INTEGER NOT NULL DEFAULT 0,
  dwell_count INTEGER NOT NULL DEFAULT 0,
  traversal_count INTEGER NOT NULL DEFAULT 0,
  skip_count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (chunk_id)
);

-- Index for editorial "top resonating" view (M3a-7).
-- Covers the most common editorial query: which passages resonate most?
CREATE INDEX idx_passage_resonance_total
  ON passage_resonance ((share_count + dwell_count + traversal_count));

-- migrate:down

DROP TABLE IF EXISTS passage_resonance;
