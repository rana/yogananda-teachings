-- migrate:up

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS vector;              -- pgvector (dense vector search)
-- pg_search (ParadeDB BM25) not yet available on PG18 on Neon.
-- Using native tsvector + GIN as full-text search layer until pg_search supports PG18.
-- When pg_search is available: CREATE EXTENSION IF NOT EXISTS pg_search;
-- and replace the tsvector approach with BM25 indexes. (ADR-114)
CREATE EXTENSION IF NOT EXISTS pg_trgm;             -- trigram similarity (fuzzy matching, suggestion fallback)
CREATE EXTENSION IF NOT EXISTS unaccent;            -- diacritics-insensitive search (ADR-080)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;  -- query performance monitoring (ADR-124)

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION (ADR-107)
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- BOOKS
-- ============================================================
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  title TEXT NOT NULL,
  subtitle TEXT,
  author TEXT NOT NULL,
  publication_year INTEGER,
  language TEXT NOT NULL DEFAULT 'en',
  isbn TEXT,
  source_url TEXT,
  contentful_id TEXT,
  cover_image_url TEXT,
  bookstore_url TEXT,
  edition TEXT,
  edition_year INTEGER,
  canonical_book_id UUID REFERENCES books(id),
  content_format TEXT NOT NULL DEFAULT 'prose'
    CHECK (content_format IN ('prose', 'chant', 'poetry')),
  author_tier TEXT NOT NULL
    CHECK (author_tier IN ('guru', 'president', 'monastic')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- CHAPTERS
-- ============================================================
CREATE TABLE chapters (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  title TEXT,
  contentful_id TEXT,
  sort_order INTEGER NOT NULL,
  content_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chapters_book ON chapters(book_id, sort_order);
CREATE INDEX idx_chapters_updated ON chapters(updated_at, id);

CREATE TRIGGER chapters_updated_at
  BEFORE UPDATE ON chapters
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- BOOK CHUNKS (the core search table)
-- ============================================================
CREATE TABLE book_chunks (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,

  -- The actual text (verbatim from the book)
  content TEXT NOT NULL,

  -- Location metadata
  page_number INTEGER,
  section_heading TEXT,
  paragraph_index INTEGER,

  -- Search infrastructure
  embedding VECTOR(1024),
  embedding_model TEXT NOT NULL DEFAULT 'voyage-4-large',
  embedding_dimension INTEGER NOT NULL DEFAULT 1024,
  embedded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  script TEXT,
  language_confidence REAL,

  -- Native full-text search (tsvector fallback for pg_search BM25)
  -- When pg_search supports PG18, this column and trigger can be dropped
  -- in favor of a BM25 index on (content, summary, topics). (ADR-114)
  search_vector tsvector,

  -- Contentful linkage
  contentful_id TEXT,

  -- Chunk context
  prev_chunk_id UUID,
  next_chunk_id UUID,

  -- Cross-language alignment (Milestone 5b)
  canonical_chunk_id UUID REFERENCES book_chunks(id),

  -- Unified enrichment output (ADR-115)
  summary TEXT,
  summary_en TEXT,
  topics TEXT[],
  entities JSONB,
  domain TEXT,
  experiential_depth SMALLINT,
  emotional_quality TEXT[],
  voice_register TEXT,
  cross_references JSONB,
  semantic_density TEXT,

  -- Metadata
  language TEXT NOT NULL DEFAULT 'en',
  accessibility_level SMALLINT,
  centrality_score REAL,
  community_id TEXT,
  metadata JSONB DEFAULT '{}',
  content_hash TEXT GENERATED ALWAYS AS (encode(sha256(content::bytea), 'hex')) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Vector similarity search (HNSW for fast approximate nearest neighbor)
CREATE INDEX idx_chunks_embedding ON book_chunks
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Native full-text search GIN index (tsvector fallback for pg_search BM25)
CREATE INDEX idx_chunks_search_vector ON book_chunks USING GIN (search_vector);

-- Trigram index for fuzzy/partial matching (suggestion fallback, ADR-120)
CREATE INDEX idx_chunks_trgm ON book_chunks USING GIN (content gin_trgm_ops);

-- Enrichment metadata indexes
CREATE INDEX idx_chunks_domain ON book_chunks(domain);
CREATE INDEX idx_chunks_depth ON book_chunks(experiential_depth);
CREATE INDEX idx_chunks_topics ON book_chunks USING GIN(topics);
CREATE INDEX idx_chunks_quality ON book_chunks USING GIN(emotional_quality);

-- Lookup by book
CREATE INDEX idx_chunks_book ON book_chunks(book_id, chapter_id, paragraph_index);

-- Lookup by Contentful ID
CREATE INDEX idx_chunks_contentful ON book_chunks(contentful_id) WHERE contentful_id IS NOT NULL;

-- Language-filtered search
CREATE INDEX idx_chunks_language ON book_chunks(language);

-- Timestamp-filtered pagination (ADR-107)
CREATE INDEX idx_chunks_updated ON book_chunks(updated_at, id);

-- Content hash index for stable deep link resolution (ADR-022)
CREATE INDEX idx_chunks_content_hash ON book_chunks(content_hash);

-- Auto-update search_vector from content + summary + topics
CREATE OR REPLACE FUNCTION book_chunks_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', coalesce(NEW.content, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.summary, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(array_to_string(NEW.topics, ' '), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER book_chunks_search_vector_trigger
  BEFORE INSERT OR UPDATE OF content, summary, topics ON book_chunks
  FOR EACH ROW EXECUTE FUNCTION book_chunks_search_vector_update();

CREATE TRIGGER book_chunks_updated_at
  BEFORE UPDATE ON book_chunks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- BOOK CHUNKS ARCHIVE (edition transitions — ADR-034)
-- ============================================================
CREATE TABLE book_chunks_archive (
  id UUID PRIMARY KEY,
  book_id UUID NOT NULL REFERENCES books(id),
  chapter_id UUID REFERENCES chapters(id),
  content TEXT NOT NULL,
  page_number INTEGER,
  section_heading TEXT,
  paragraph_index INTEGER,
  embedding VECTOR(1024),
  embedding_model TEXT NOT NULL,
  content_hash TEXT,
  author_tier TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  edition TEXT,
  archived_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  original_created_at TIMESTAMPTZ NOT NULL,
  original_updated_at TIMESTAMPTZ
);

-- ============================================================
-- LIFE THEMES (curated thematic entry points)
-- ============================================================
CREATE TABLE teaching_topics (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'quality',
  description TEXT,
  description_embedding VECTOR(1024),
  header_quote TEXT,
  header_citation TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_teaching_topics_category ON teaching_topics(category);

CREATE TRIGGER teaching_topics_updated_at
  BEFORE UPDATE ON teaching_topics
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- LIFE THEME TRANSLATIONS
-- ============================================================
CREATE TABLE topic_translations (
  theme_id UUID NOT NULL REFERENCES teaching_topics(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  name TEXT NOT NULL,
  header_quote TEXT,
  header_citation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (theme_id, language)
);

-- ============================================================
-- CHUNK-THEME JOIN (many-to-many)
-- ============================================================
CREATE TABLE chunk_topics (
  chunk_id UUID NOT NULL REFERENCES book_chunks(id) ON DELETE CASCADE,
  theme_id UUID NOT NULL REFERENCES teaching_topics(id) ON DELETE CASCADE,
  relevance FLOAT DEFAULT 1.0,
  tagged_by TEXT NOT NULL DEFAULT 'manual',
  similarity FLOAT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (chunk_id, theme_id)
);

CREATE INDEX idx_chunk_topics_theme ON chunk_topics(theme_id);
CREATE INDEX idx_chunk_topics_pending ON chunk_topics(tagged_by) WHERE tagged_by = 'auto';

-- ============================================================
-- DAILY PASSAGES (curated pool for "Today's Wisdom")
-- ============================================================
CREATE TABLE daily_passages (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  chunk_id UUID NOT NULL REFERENCES book_chunks(id) ON DELETE CASCADE,
  season_affinity TEXT[],
  tone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_daily_passages_active ON daily_passages(is_active) WHERE is_active = true;

CREATE TRIGGER daily_passages_updated_at
  BEFORE UPDATE ON daily_passages
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- AFFIRMATIONS (curated pool for "The Quiet Corner")
-- ============================================================
CREATE TABLE affirmations (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  content TEXT NOT NULL,
  book_title TEXT NOT NULL,
  page_number INTEGER,
  section_heading TEXT,
  chunk_id UUID REFERENCES book_chunks(id) ON DELETE SET NULL,
  language TEXT NOT NULL DEFAULT 'en',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_affirmations_active ON affirmations(is_active) WHERE is_active = true;

CREATE TRIGGER affirmations_updated_at
  BEFORE UPDATE ON affirmations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- SEARCH QUERY LOG (anonymized — ADR-053)
-- ============================================================
CREATE TABLE search_queries (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  query_text TEXT NOT NULL,
  query_expanded TEXT[],
  results_count INTEGER,
  search_mode TEXT,
  language TEXT DEFAULT 'en',
  duration_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_queries_time ON search_queries(created_at DESC);

-- ============================================================
-- SEARCH THEME AGGREGATES (anonymized trend data — ADR-053)
-- ============================================================
CREATE TABLE search_theme_aggregates (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  theme TEXT NOT NULL,
  country TEXT,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  query_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_search_themes_period ON search_theme_aggregates(period_start, theme);

-- ============================================================
-- CHAPTER STUDY NOTES (reader annotations — Milestone 7a+)
-- ============================================================
CREATE TABLE chapter_study_notes (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  note_type TEXT NOT NULL DEFAULT 'key_theme',
  content TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_study_notes_chapter ON chapter_study_notes(chapter_id, note_type);

CREATE TRIGGER chapter_study_notes_updated_at
  BEFORE UPDATE ON chapter_study_notes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- CHUNK RELATIONS (pre-computed semantic similarity — ADR-050)
-- ============================================================
CREATE TABLE chunk_relations (
  source_chunk_id UUID NOT NULL REFERENCES book_chunks(id) ON DELETE CASCADE,
  target_chunk_id UUID NOT NULL REFERENCES book_chunks(id) ON DELETE CASCADE,
  similarity FLOAT NOT NULL,
  rank INTEGER NOT NULL,
  relation_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (source_chunk_id, target_chunk_id)
);

CREATE INDEX idx_chunk_relations_source ON chunk_relations(source_chunk_id, rank);
CREATE INDEX idx_chunk_relations_target ON chunk_relations(target_chunk_id);

-- ============================================================
-- CHUNK REFERENCES (editorial cross-references)
-- ============================================================
CREATE TABLE chunk_references (
  source_chunk_id UUID NOT NULL REFERENCES book_chunks(id) ON DELETE CASCADE,
  target_chunk_id UUID NOT NULL REFERENCES book_chunks(id) ON DELETE CASCADE,
  reference_type TEXT NOT NULL DEFAULT 'mention',
  note TEXT,
  created_by TEXT NOT NULL DEFAULT 'editorial',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (source_chunk_id, target_chunk_id)
);

CREATE INDEX idx_chunk_references_source ON chunk_references(source_chunk_id);
CREATE INDEX idx_chunk_references_target ON chunk_references(target_chunk_id);

-- ============================================================
-- ENTITY REGISTRY (canonical entity resolution — ADR-116)
-- ============================================================
CREATE TABLE entity_registry (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  canonical_name TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  aliases TEXT[],
  language CHAR(5),
  definition TEXT,
  srf_definition TEXT,
  centrality_score REAL,
  community_id TEXT,
  bridge_score REAL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(canonical_name, entity_type)
);

CREATE INDEX entity_aliases_idx ON entity_registry USING gin(aliases);

-- ============================================================
-- SANSKRIT NORMALIZATION (ADR-116, ADR-080)
-- ============================================================
CREATE TABLE sanskrit_terms (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  canonical_form TEXT NOT NULL,
  display_form TEXT NOT NULL,
  devanagari TEXT,
  iast_form TEXT,
  common_variants TEXT[],
  srf_definition TEXT,
  domain TEXT,
  depth_level INT,
  weight INT DEFAULT 100
);

-- ============================================================
-- SUGGESTION DICTIONARY (ADR-049, ADR-120)
-- ============================================================
CREATE TABLE suggestion_dictionary (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  suggestion TEXT NOT NULL,
  display_text TEXT,
  suggestion_type TEXT NOT NULL,
  language CHAR(5) NOT NULL,
  script TEXT NOT NULL,
  latin_form TEXT,
  corpus_frequency INT DEFAULT 0,
  query_frequency INT DEFAULT 0,
  editorial_boost REAL DEFAULT 0,
  weight REAL DEFAULT 0,
  entity_id UUID REFERENCES entity_registry(id),
  book_id UUID REFERENCES books(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX suggestion_trgm_idx ON suggestion_dictionary USING gin(suggestion gin_trgm_ops);
CREATE INDEX suggestion_language_idx ON suggestion_dictionary(language, suggestion);
CREATE INDEX suggestion_weight_idx ON suggestion_dictionary(language, weight DESC);

-- ============================================================
-- EXTRACTED RELATIONSHIPS (graph intelligence — ADR-115, ADR-117)
-- ============================================================
CREATE TABLE extracted_relationships (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  chunk_id UUID REFERENCES book_chunks(id),
  subject_entity TEXT,
  relationship TEXT,
  object_entity TEXT,
  confidence REAL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- VOCABULARY BRIDGE (DES-059)
-- ============================================================
CREATE TABLE vocabulary_bridge (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  layer TEXT NOT NULL CHECK (layer IN (
    'state_mapping', 'vocabulary_expansion',
    'register_bridge', 'tradition_bridge'
  )),
  language TEXT NOT NULL DEFAULT 'en',
  expression TEXT NOT NULL,
  register TEXT,
  primary_territory TEXT[],
  secondary_territory TEXT[],
  avoid_territory TEXT[],
  retrieval_intent TEXT CHECK (retrieval_intent IN (
    'meet_first', 'console', 'orient', 'invite'
  )),
  yogananda_vocabulary TEXT[],
  query_expansion TEXT[],
  index_enrichment TEXT[],
  seed_passage_ids UUID[],
  crisis_adjacent BOOLEAN DEFAULT false,
  source_passages UUID[],
  confidence REAL,
  derivation_note TEXT,
  generated_by TEXT NOT NULL DEFAULT 'opus',
  reviewed_by TEXT,
  status TEXT DEFAULT 'active'
    CHECK (status IN ('draft', 'active', 'reviewed', 'archived')),
  editorial_notes TEXT,
  cultural_context TEXT,
  tradition TEXT,
  last_evaluated DATE,
  zero_result_trigger BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_bridge_layer_language ON vocabulary_bridge(layer, language);
CREATE INDEX idx_bridge_expression ON vocabulary_bridge(expression);
CREATE INDEX idx_bridge_crisis ON vocabulary_bridge(crisis_adjacent) WHERE crisis_adjacent = true;

-- ============================================================
-- BRIDGE SEED PASSAGES (DES-059)
-- ============================================================
CREATE TABLE bridge_seed_passages (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  bridge_id UUID NOT NULL REFERENCES vocabulary_bridge(id),
  chunk_id UUID NOT NULL REFERENCES book_chunks(id),
  selection_note TEXT,
  position INTEGER,
  selected_by TEXT NOT NULL DEFAULT 'opus',
  selected_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- BRIDGE GAPS (DES-059)
-- ============================================================
CREATE TABLE bridge_gaps (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  query TEXT NOT NULL,
  language TEXT NOT NULL,
  result_count INTEGER NOT NULL,
  query_date DATE NOT NULL,
  reviewed BOOLEAN DEFAULT false,
  resulted_in_bridge_id UUID REFERENCES vocabulary_bridge(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_bridge_gaps_unreviewed ON bridge_gaps(reviewed, query_date) WHERE reviewed = false;

-- ============================================================
-- USER PROFILES (opt-in authenticated experience — ADR-121)
-- ============================================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  auth0_id TEXT UNIQUE NOT NULL,
  preferred_language CHAR(5),
  tradition_background TEXT,
  practice_level TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INITIAL THEME DATA (six spiritual quality themes)
-- ============================================================
INSERT INTO teaching_topics (name, slug, category, sort_order, description) VALUES
  ('Peace', 'peace', 'quality', 1, 'Inner peace, calmness, stillness of mind, overcoming restlessness and anxiety, mental tranquility, equanimity in the face of difficulty'),
  ('Courage', 'courage', 'quality', 2, 'Overcoming fear, bravery, inner strength, perseverance through difficulty, spiritual fortitude, willpower'),
  ('Healing', 'healing', 'quality', 3, 'Physical healing, emotional healing, recovery from suffering, divine healing power, overcoming illness, spiritual wholeness'),
  ('Joy', 'joy', 'quality', 4, 'Divine joy, bliss, happiness, cheerfulness, overcoming sadness and depression, finding joy within, ever-new joy'),
  ('Purpose', 'purpose', 'quality', 5, 'Life purpose, meaning, dharma, vocation, finding direction, why am I here, fulfilling divine plan'),
  ('Love', 'love', 'quality', 6, 'Divine love, unconditional love, devotion, human love, expanding the heart, love for God, love for all beings');

-- migrate:down

DROP TABLE IF EXISTS bridge_gaps;
DROP TABLE IF EXISTS bridge_seed_passages;
DROP TABLE IF EXISTS vocabulary_bridge;
DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS extracted_relationships;
DROP TABLE IF EXISTS suggestion_dictionary;
DROP TABLE IF EXISTS sanskrit_terms;
DROP TABLE IF EXISTS entity_registry;
DROP TABLE IF EXISTS chunk_references;
DROP TABLE IF EXISTS chunk_relations;
DROP TABLE IF EXISTS chapter_study_notes;
DROP TABLE IF EXISTS search_theme_aggregates;
DROP TABLE IF EXISTS search_queries;
DROP TABLE IF EXISTS affirmations;
DROP TABLE IF EXISTS daily_passages;
DROP TABLE IF EXISTS chunk_topics;
DROP TABLE IF EXISTS topic_translations;
DROP TABLE IF EXISTS teaching_topics;
DROP TABLE IF EXISTS book_chunks_archive;
DROP TABLE IF EXISTS book_chunks;
DROP TABLE IF EXISTS chapters;
DROP TABLE IF EXISTS books;
DROP FUNCTION IF EXISTS book_chunks_search_vector_update();
DROP FUNCTION IF EXISTS set_updated_at();
DROP EXTENSION IF EXISTS pg_stat_statements;
DROP EXTENSION IF EXISTS unaccent;
DROP EXTENSION IF EXISTS pg_trgm;
DROP EXTENSION IF EXISTS vector;
