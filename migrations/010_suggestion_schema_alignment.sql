-- migrate:up
-- FTR-029: Align suggestion_dictionary schema with specification.
-- Adds: created_at column, UNIQUE constraint, latin_form trgm index, suggestion_type CHECK.

ALTER TABLE suggestion_dictionary
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE suggestion_dictionary
  ADD CONSTRAINT suggestion_dictionary_suggestion_language_unique
  UNIQUE (suggestion, language);

CREATE INDEX IF NOT EXISTS suggestion_latin_trgm_idx
  ON suggestion_dictionary USING gin(latin_form gin_trgm_ops);

ALTER TABLE suggestion_dictionary
  ADD CONSTRAINT suggestion_dictionary_type_check
  CHECK (suggestion_type IN (
    'scoped', 'entity', 'topic', 'sanskrit',
    'editorial', 'curated', 'chapter'
  ));

-- migrate:down
ALTER TABLE suggestion_dictionary DROP CONSTRAINT IF EXISTS suggestion_dictionary_type_check;
DROP INDEX IF EXISTS suggestion_latin_trgm_idx;
ALTER TABLE suggestion_dictionary DROP CONSTRAINT IF EXISTS suggestion_dictionary_suggestion_language_unique;
ALTER TABLE suggestion_dictionary DROP COLUMN IF EXISTS created_at;
