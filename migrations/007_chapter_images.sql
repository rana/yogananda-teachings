-- migrate:up
-- Book photographs with captions — PRI-01 verbatim fidelity, PRI-07 accessibility.
-- Array of {pageNumber, imagePath, alt, caption, width, height}
-- Follows the footnotes pattern (migration 003).
ALTER TABLE chapters ADD COLUMN images JSONB NOT NULL DEFAULT '[]';

-- migrate:down
ALTER TABLE chapters DROP COLUMN IF EXISTS images;
