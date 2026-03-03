-- migrate:up

-- Human-readable URL slugs for books.
-- Replaces UUIDs in frontend URLs: /books/{slug}/{chapter}
-- API routes continue using UUIDs.

ALTER TABLE books ADD COLUMN slug TEXT;

-- Populate slugs for existing books
UPDATE books SET slug = 'autobiography-of-a-yogi' WHERE language = 'en' AND title ILIKE '%autobiography%';
UPDATE books SET slug = 'autobiografia-de-un-yogui' WHERE language = 'es' AND title ILIKE '%autobiograf%';

-- Make NOT NULL after population
ALTER TABLE books ALTER COLUMN slug SET NOT NULL;

-- Unique per language (allows same romanized slug in different languages if needed)
CREATE UNIQUE INDEX idx_books_slug_lang ON books(slug, language);

-- migrate:down

DROP INDEX IF EXISTS idx_books_slug_lang;
ALTER TABLE books DROP COLUMN IF EXISTS slug;
