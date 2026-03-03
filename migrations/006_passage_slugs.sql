-- migrate:up

-- Human-readable URL slugs for passages (book_chunks).
-- Replaces UUIDs in frontend URLs: /passage/{slug}
-- Content-derived: first 5 significant words, lowercased, hyphenated.
-- Language-scoped uniqueness (same slug allowed across en/es).

-- Helper function: generate a URL slug from passage content.
-- Uses unaccent for accent-safe ASCII slugs (works for en + es).
CREATE OR REPLACE FUNCTION generate_content_slug(content TEXT) RETURNS TEXT AS $$
DECLARE
  cleaned TEXT;
  words TEXT[];
  slug_words TEXT[];
  word TEXT;
  stop_words TEXT[] := ARRAY[
    -- English
    'a','an','the','of','in','to','and','is','it','for','that','this','was',
    'with','but','or','as','by','from','at','on','be','are','were','been',
    'which','who','he','she','they','we','you','my','your','his','her','its',
    'our','their','not','no','do','will','would','could','i','so','if','me',
    'all','had','one','when','there','what','about','up','out','them','then',
    'more','very','can','just','only','now','like','other','into','some',
    -- Spanish
    'el','la','los','las','un','una','de','del','en','y','que','es','por',
    'con','se','su','al','lo','como','para','no','pero','mas','fue','era',
    'yo','me','mi','tu','nos','le','les','si','ya','muy','tan'
  ];
BEGIN
  -- Normalize accents to ASCII, lowercase
  cleaned := lower(unaccent(content));
  -- Keep only letters and spaces
  cleaned := regexp_replace(cleaned, '[^a-z\s]', '', 'g');
  -- Split into words
  words := regexp_split_to_array(cleaned, '\s+');
  slug_words := ARRAY[]::TEXT[];

  FOREACH word IN ARRAY words LOOP
    IF word != '' AND NOT (word = ANY(stop_words)) AND length(word) > 1 THEN
      slug_words := slug_words || word;
    END IF;
    IF array_length(slug_words, 1) >= 5 THEN
      EXIT;
    END IF;
  END LOOP;

  -- Fallback: if fewer than 2 significant words, use first 5 words raw
  IF array_length(slug_words, 1) IS NULL OR array_length(slug_words, 1) < 2 THEN
    slug_words := ARRAY[]::TEXT[];
    FOREACH word IN ARRAY words LOOP
      IF word != '' AND length(word) > 1 THEN
        slug_words := slug_words || word;
      END IF;
      IF array_length(slug_words, 1) >= 5 THEN
        EXIT;
      END IF;
    END LOOP;
  END IF;

  RETURN array_to_string(slug_words, '-');
END;
$$ LANGUAGE plpgsql;

-- Add nullable slug column
ALTER TABLE book_chunks ADD COLUMN slug TEXT;

-- Populate slugs with collision resolution.
-- Duplicates within the same language get -2, -3 suffixes.
WITH base_slugs AS (
  SELECT
    id,
    language,
    generate_content_slug(content) AS base_slug,
    ROW_NUMBER() OVER (
      PARTITION BY language, generate_content_slug(content)
      ORDER BY book_id, chapter_id, paragraph_index NULLS LAST, created_at
    ) AS dup_num
  FROM book_chunks
)
UPDATE book_chunks bc
SET slug = CASE
  WHEN bs.dup_num = 1 THEN bs.base_slug
  ELSE bs.base_slug || '-' || bs.dup_num
END
FROM base_slugs bs
WHERE bc.id = bs.id;

-- Make NOT NULL after population
ALTER TABLE book_chunks ALTER COLUMN slug SET NOT NULL;

-- Unique per language (allows same romanized slug across en/es)
CREATE UNIQUE INDEX idx_chunks_slug_lang ON book_chunks(slug, language);

-- Fast slug lookup (the common frontend path)
CREATE INDEX idx_chunks_slug ON book_chunks(slug);

-- migrate:down

DROP INDEX IF EXISTS idx_chunks_slug;
DROP INDEX IF EXISTS idx_chunks_slug_lang;
ALTER TABLE book_chunks DROP COLUMN IF EXISTS slug;
DROP FUNCTION IF EXISTS generate_content_slug(TEXT);
