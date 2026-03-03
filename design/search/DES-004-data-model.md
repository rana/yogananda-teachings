## DES-004: Data Model

### Neon PostgreSQL Schema

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;              -- pgvector (dense vector search)
CREATE EXTENSION IF NOT EXISTS pg_search;           -- ParadeDB BM25 full-text search (ADR-114)
CREATE EXTENSION IF NOT EXISTS pg_trgm;             -- trigram similarity (fuzzy matching, suggestion fallback)
CREATE EXTENSION IF NOT EXISTS unaccent;            -- diacritics-insensitive search (ADR-080)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;  -- query performance monitoring (ADR-124)

-- ============================================================
-- BOOKS
-- ============================================================
CREATE TABLE books (
 id UUID PRIMARY KEY DEFAULT uuidv7(),
 title TEXT NOT NULL,
 subtitle TEXT,
 author TEXT NOT NULL, -- No default; author must be explicit for multi-author corpus (PRO-014)
 publication_year INTEGER,
 language TEXT NOT NULL DEFAULT 'en',
 isbn TEXT,
 source_url TEXT, -- PDF URL for Arc 1 ingestion
 contentful_id TEXT, -- Contentful entry ID (production)
 cover_image_url TEXT,
 bookstore_url TEXT, -- SRF Bookstore URL for "Find this book" link.
 -- Points to SRF Bookstore for all books. If per-language bookstore
 -- routing is needed at Milestone 5b (YSS for Hindi/Bengali), add a
 -- simple lookup table — zero schema changes required now.
 edition TEXT, -- e.g., "13th Edition", "Revised 2024" (ADR-034)
 edition_year INTEGER, -- year of this specific edition (ADR-034)
 canonical_book_id UUID REFERENCES books(id), -- links translations to the original (English) edition;
 -- NULL for originals. Enables "Available in 6 languages"
 -- on books page and cross-language navigation.
 content_format TEXT NOT NULL DEFAULT 'prose' -- 'prose' (default), 'chant', 'poetry' (ADR-059).
 CHECK (content_format IN ('prose', 'chant', 'poetry')),
 -- Controls reader rendering: prose = continuous scroll,
 -- chant/poetry = whole-unit pages with chant-to-chant nav.
 -- Chant format enables inline media panel for
 -- performance_of relations (deterministic audio/video links).
 author_tier TEXT NOT NULL  -- PRO-014: Author role hierarchy (denormalized from author). No DEFAULT — force explicit on insert.
 CHECK (author_tier IN ('guru', 'president', 'monastic')),
 -- 'guru': Lineage gurus (Yogananda, Sri Yukteswar). Full search/theme/daily pool/social media.
 -- 'president': SRF Presidents / spiritual heads (Daya Mata, Mrinalini Mata, Rajarsi).
 --   Searchable by default, themeable. Not in daily pool or social media pool.
 -- 'monastic': Monastic speakers. Opt-in search (author_tier param includes 'monastic'). Not in daily/social pool.
 -- Tiers describe author role, not value. All tiers: verbatim fidelity + no machine translation.
 -- Tier assignments confirmed by stakeholder 2026-02-25 — see PRO-014.
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- CHAPTERS
-- ============================================================
CREATE TABLE chapters (
 id UUID PRIMARY KEY DEFAULT uuidv7(),
 book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
 chapter_number INTEGER NOT NULL,
 title TEXT,
 contentful_id TEXT, -- Contentful entry ID (production)
 sort_order INTEGER NOT NULL,
 footnotes JSONB NOT NULL DEFAULT '[]', -- Array of {marker, text, pageNumber}. 530 across both books (248 en, 282 es).
 -- Rendered by <ChapterNotes> at end of chapter. Bidirectional anchor links (PRI-01).
 content_hash TEXT, -- SHA-256 of chapter content, computed at ingestion (ADR-039)
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chapters_book ON chapters(book_id, sort_order);

-- ============================================================
-- BOOK CHUNKS (the core search table)
-- ============================================================
CREATE TABLE book_chunks (
 id UUID PRIMARY KEY DEFAULT uuidv7(),
 book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
 chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,

 -- The actual text (verbatim from the book)
 content TEXT NOT NULL,
 formatting JSONB NOT NULL DEFAULT '[]', -- Array of {start, end, style}. Styles: italic|bold|bold-italic|small-caps|superscript.
 -- Offsets relative to content string (adjusted for merged paragraphs). ~3,919 spans across both books.
 -- Rendered by <RichText> in chapter reader (PRI-01 verbatim fidelity).

 -- Location metadata
 page_number INTEGER,
 section_heading TEXT,
 paragraph_index INTEGER, -- position within chapter

 -- Search infrastructure
 embedding VECTOR(1024), -- Voyage voyage-3-large embedding vector (ADR-118)
 embedding_model TEXT NOT NULL DEFAULT 'voyage-3-large', -- which model generated this vector (ADR-046)
 embedding_dimension INTEGER NOT NULL DEFAULT 1024, -- vector dimensions for this chunk
 embedded_at TIMESTAMPTZ NOT NULL DEFAULT now(), -- when this chunk was last embedded
 script TEXT, -- latin|cjk|arabic|cyrillic|devanagari — routes BM25 index (ADR-114)
 language_confidence REAL, -- fastText detection confidence

 -- Contentful linkage (production)
 contentful_id TEXT, -- Contentful entry ID of source block

 -- Chunk context (for overlap / windowing)
 prev_chunk_id UUID, -- previous chunk for context continuity
 next_chunk_id UUID, -- next chunk for "read more"

 -- Cross-language alignment (Milestone 5b)
 canonical_chunk_id UUID REFERENCES book_chunks(id), -- links translated chunk to its English original;
 -- NULL for originals. Enables "Read this in Spanish →".

 -- Unified enrichment output (ADR-115)
 summary TEXT, -- "This passage is primarily about..." — in chunk's detected language
 summary_en TEXT, -- English translation for cross-lingual UI (async, non-English only)
 topics TEXT[], -- canonical topic labels for thematic indexing
 entities JSONB, -- typed entity extraction, validated against entity_registry (ADR-116)
 domain TEXT, -- philosophy|narrative|technique|devotional|poetry
 experiential_depth SMALLINT, -- 1-7: ordinary waking → nirvikalpa samadhi (ADR-115)
 emotional_quality TEXT[], -- consoling|inspiring|instructional|devotional|demanding|celebratory
 voice_register TEXT, -- intimate|cosmic|instructional|devotional|philosophical|humorous
 cross_references JSONB, -- explicit refs to other works, teachers, scriptures
 semantic_density TEXT, -- high|medium|low (ADR-048)

 -- Metadata
 language TEXT NOT NULL DEFAULT 'en',
 accessibility_level SMALLINT, -- 1=universal, 2=accessible, 3=deep (ADR-005 E3)
 -- NULL until classified. Computed by Claude at ingestion, spot-checked by reviewer.
 -- Used for Today's Wisdom (prefer 1–2), theme pages (default 1–2, "Show deeper" shows all).
 centrality_score REAL,  -- PageRank from graph batch (Milestone 3b+, ADR-117)
 community_id TEXT,      -- community detection cluster (Milestone 3b+, ADR-117)
 metadata JSONB DEFAULT '{}',
 content_hash TEXT GENERATED ALWAYS AS (encode(sha256(content::bytea), 'hex')) STORED,
 -- Auto-computed from content for stable deep links (ADR-022).
 -- Shared URLs embed the first 6 chars as verification hash.
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Vector similarity search (HNSW for fast approximate nearest neighbor)
CREATE INDEX idx_chunks_embedding ON book_chunks
 USING hnsw (embedding vector_cosine_ops)
 WITH (m = 16, ef_construction = 64);

-- BM25 full-text search (pg_search / ParadeDB — ADR-114)
-- Primary: ICU tokenizer covers ~90% of languages
CREATE INDEX chunks_bm25_icu ON book_chunks
 USING bm25 (id, content, summary, topics)
 WITH (
  key_field = 'id',
  text_fields = '{
   "content": {"tokenizer": {"type": "icu"}, "record": "position"},
   "summary": {"tokenizer": {"type": "icu"}},
   "topics":  {"tokenizer": {"type": "icu"}}
  }'
 );

-- Milestone 5b: Chinese (Jieba) and Japanese (Lindera) partial indexes
-- CREATE INDEX chunks_bm25_zh ON book_chunks USING bm25 (id, content)
--  WITH (key_field = 'id', text_fields = '{"content": {"tokenizer": {"type": "jieba"}}}')
--  WHERE script = 'cjk' AND language LIKE 'zh%';
-- CREATE INDEX chunks_bm25_ja ON book_chunks USING bm25 (id, content)
--  WITH (key_field = 'id', text_fields = '{"content": {"tokenizer": {"type": "lindera"}}}')
--  WHERE script = 'cjk' AND language = 'ja';

-- Trigram index for fuzzy/partial matching (suggestion fallback, ADR-120)
CREATE INDEX idx_chunks_trgm ON book_chunks USING GIN (content gin_trgm_ops);

-- Enrichment metadata indexes
CREATE INDEX idx_chunks_domain ON book_chunks(domain);
CREATE INDEX idx_chunks_depth ON book_chunks(experiential_depth);
CREATE INDEX idx_chunks_topics ON book_chunks USING GIN(topics);
CREATE INDEX idx_chunks_quality ON book_chunks USING GIN(emotional_quality);

-- Lookup by book
CREATE INDEX idx_chunks_book ON book_chunks(book_id, chapter_id, paragraph_index);

-- Lookup by Contentful ID (for webhook-driven updates)
CREATE INDEX idx_chunks_contentful ON book_chunks(contentful_id) WHERE contentful_id IS NOT NULL;

-- Language-filtered search (critical for multilingual — ensures search
-- stays within the user's locale unless cross-language is requested)
CREATE INDEX idx_chunks_language ON book_chunks(language);

-- Timestamp-filtered pagination (ADR-107)
CREATE INDEX idx_chunks_updated ON book_chunks(updated_at, id);
CREATE INDEX idx_chapters_updated ON chapters(updated_at, id);

-- Content hash index for stable deep link resolution (ADR-022)
CREATE INDEX idx_chunks_content_hash ON book_chunks(content_hash);

-- ============================================================
-- BOOK CHUNKS ARCHIVE (edition transitions — ADR-034)
-- ============================================================
-- When SRF publishes a revised edition, old edition data is archived here
-- (not deleted) to preserve historical citations and audit trail.
CREATE TABLE book_chunks_archive (
 id UUID PRIMARY KEY,
 book_id UUID NOT NULL REFERENCES books(id),
 chapter_id UUID REFERENCES chapters(id),
 content TEXT NOT NULL,
 page_number INTEGER,
 section_heading TEXT,
 paragraph_index INTEGER,
 embedding VECTOR(1024), -- matches current model dimension (ADR-118)
 embedding_model TEXT NOT NULL,
 content_hash TEXT,
 author_tier TEXT,  -- preserved from books.author_tier at archive time (PRO-014)
 language TEXT NOT NULL DEFAULT 'en',
 edition TEXT, -- edition this chunk belonged to
 archived_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 original_created_at TIMESTAMPTZ NOT NULL,
 original_updated_at TIMESTAMPTZ -- preserved from book_chunks.updated_at
);

-- ============================================================
-- FULL-TEXT SEARCH NOTE (ADR-114)
-- ============================================================
-- pg_search / ParadeDB BM25 replaces tsvector for all full-text search.
-- The BM25 index (chunks_bm25_icu above) handles tokenization, stemming,
-- and relevance ranking internally. No tsvector column or trigger needed.
-- ICU tokenizer handles diacritics (ā→a, ṇ→n, ś→s, etc.) and most
-- languages. CJK-specific indexes (Jieba, Lindera) added in Milestone 5b.
-- The unaccent extension is still loaded for pg_trgm fuzzy matching.
```

> **Terminology note:** The database table `teaching_topics` is exposed as `themes` in the API (`/api/v1/themes`) and displayed as "Doors of Entry" in the seeker-facing UI. The related junction table `chunk_topics` links passages to themes. These terms all refer to the same concept: curated thematic groupings of Yogananda's teachings (e.g., Peace, Courage, Healing). See ADR-031 and ADR-032.

```sql
-- ============================================================
-- LIFE THEMES (curated thematic entry points)
-- ============================================================
-- Multi-category theme taxonomy (ADR-032, ADR-033):
-- 'quality' — spiritual/emotional states: Peace, Courage, Healing, Joy, Purpose, Love
-- Displayed as "Doors of Entry" on the homepage (6 cards).
-- 'situation' — life circumstances: Relationships, Parenting, Loss & Grief, Work, etc.
-- 'person' — spiritual figures Yogananda discusses: Christ, Krishna, Lahiri Mahasaya, etc.
-- 'principle' — yogic ethical principles: Ahimsa, Satya, Brahmacharya, Tapas, etc. (Yama/Niyama)
-- 'scripture' — scriptural frameworks Yogananda interprets: Yoga Sutras, Bhagavad Gita, Bible
-- 'practice' — spiritual practices: Meditation, Concentration, Pranayama, Affirmation
-- 'yoga_path' — yoga paths: Kriya, Raja, Bhakti, Karma, Jnana, Hatha, Mantra, Laya
-- Non-quality categories accessible from "Explore" pages and Books.
-- Not shown on the homepage grid to preserve the calm six-door design.
CREATE TABLE teaching_topics (
 id UUID PRIMARY KEY DEFAULT uuidv7(),
 name TEXT NOT NULL UNIQUE, -- English display name: "Peace", "Courage", "Relationships", etc.
 slug TEXT NOT NULL UNIQUE, -- URL slug: "peace", "relationships", etc. (always English for URL stability)
 category TEXT NOT NULL DEFAULT 'quality', -- 'quality', 'situation', 'person', 'principle',
 -- 'scripture', 'practice', 'yoga_path' (ADR-032, ADR-033)
 description TEXT, -- brief editorial description used for auto-tagging and internal reference
 description_embedding VECTOR(1024), -- embedding of `description` for auto-tagging (same model as book_chunks, ADR-118)
 header_quote TEXT, -- a Yogananda quote encapsulating this theme (displayed on theme page)
 header_citation TEXT, -- citation for the header quote
 sort_order INTEGER NOT NULL DEFAULT 0, -- display order within category
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_teaching_topics_category ON teaching_topics(category);

-- ============================================================
-- LIFE THEME TRANSLATIONS (localized theme names and header quotes)
-- ============================================================
-- Slugs stay in English for URL stability (/es/themes/peace, not /es/temas/paz).
-- Display names and header quotes are localized per language.
-- Milestone 2a: table created (empty). Milestone 5b: populated via AI-assisted workflow (ADR-078).

CREATE TABLE topic_translations (
 theme_id UUID NOT NULL REFERENCES teaching_topics(id) ON DELETE CASCADE,
 language TEXT NOT NULL, -- locale code: 'es', 'de', 'fr', etc.
 name TEXT NOT NULL, -- localized display name: "Paz", "Mut", "Paix"
 header_quote TEXT, -- localized header quote (from official translation)
 header_citation TEXT, -- localized citation
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 PRIMARY KEY (theme_id, language)
);

-- ============================================================
-- CHUNK-THEME JOIN (many-to-many: passages belong to themes)
-- ============================================================
-- tagged_by values (three-state provenance):
-- 'manual' — human placed this tag directly (editorial curation)
-- 'auto' — machine proposed via embedding similarity, not yet reviewed
-- 'reviewed' — machine proposed, human approved (distinguishes "human created" from "human verified")
-- Only 'manual' and 'reviewed' tags are served to users. 'auto' tags are candidates awaiting review.
CREATE TABLE chunk_topics (
 chunk_id UUID NOT NULL REFERENCES book_chunks(id) ON DELETE CASCADE,
 theme_id UUID NOT NULL REFERENCES teaching_topics(id) ON DELETE CASCADE,
 relevance FLOAT DEFAULT 1.0, -- editorial relevance weight (1.0 = normal, higher = more relevant)
 tagged_by TEXT NOT NULL DEFAULT 'manual', -- 'manual', 'auto', or 'reviewed'
 similarity FLOAT, -- cosine similarity score when tagged_by = 'auto' or 'reviewed' (NULL for manual)
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 PRIMARY KEY (chunk_id, theme_id)
);

CREATE INDEX idx_chunk_topics_theme ON chunk_topics(theme_id);
CREATE INDEX idx_chunk_topics_pending ON chunk_topics(tagged_by) WHERE tagged_by = 'auto'; -- fast lookup for review queue

-- ============================================================
-- DAILY PASSAGES (curated pool for "Today's Wisdom")
-- ============================================================
CREATE TABLE daily_passages (
 id UUID PRIMARY KEY DEFAULT uuidv7(),
 chunk_id UUID NOT NULL REFERENCES book_chunks(id) ON DELETE CASCADE,
 season_affinity TEXT[], -- optional: ['winter', 'renewal'] for seasonal weighting
 tone TEXT, -- 'consoling', 'joyful', 'challenging', 'contemplative', 'practical' (ADR-005 E8)
 -- Classified by Claude at curation time, spot-checked by reviewer.
 -- Selection algorithm ensures tonal variety across the week.
 is_active BOOLEAN NOT NULL DEFAULT true,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_daily_passages_active ON daily_passages(is_active) WHERE is_active = true;

-- ============================================================
-- AFFIRMATIONS (curated pool for "The Quiet Corner")
-- ============================================================
CREATE TABLE affirmations (
 id UUID PRIMARY KEY DEFAULT uuidv7(),
 content TEXT NOT NULL, -- the affirmation text (verbatim from source)
 book_title TEXT NOT NULL, -- source book
 page_number INTEGER,
 section_heading TEXT,
 chunk_id UUID REFERENCES book_chunks(id) ON DELETE SET NULL, -- link to full chunk if applicable
 language TEXT NOT NULL DEFAULT 'en', -- required for Quiet Corner language filtering
 is_active BOOLEAN NOT NULL DEFAULT true,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_affirmations_active ON affirmations(is_active) WHERE is_active = true;

-- ============================================================
-- INITIAL THEME DATA
-- ============================================================
-- Arc 1: six spiritual quality themes (displayed as "Doors of Entry" on homepage)
INSERT INTO teaching_topics (name, slug, category, sort_order, description) VALUES
 ('Peace', 'peace', 'quality', 1, 'Inner peace, calmness, stillness of mind, overcoming restlessness and anxiety, mental tranquility, equanimity in the face of difficulty'),
 ('Courage', 'courage', 'quality', 2, 'Overcoming fear, bravery, inner strength, perseverance through difficulty, spiritual fortitude, willpower'),
 ('Healing', 'healing', 'quality', 3, 'Physical healing, emotional healing, recovery from suffering, divine healing power, overcoming illness, spiritual wholeness'),
 ('Joy', 'joy', 'quality', 4, 'Divine joy, bliss, happiness, cheerfulness, overcoming sadness and depression, finding joy within, ever-new joy'),
 ('Purpose', 'purpose', 'quality', 5, 'Life purpose, meaning, dharma, vocation, finding direction, why am I here, fulfilling divine plan'),
 ('Love', 'love', 'quality', 6, 'Divine love, unconditional love, devotion, human love, expanding the heart, love for God, love for all beings');

-- Milestone 3a+: life situation themes (accessible from "Browse all themes" page, not on homepage grid)
-- These are added as content is ingested and sufficient passages are confirmed.
-- Minimum threshold: ~20 reviewed passages before a situation theme page goes live.
-- INSERT INTO teaching_topics (name, slug, category, sort_order, description) VALUES
-- ('Relationships', 'relationships', 'situation', 1, 'Marriage, friendship, family bonds, human love, companionship, interpersonal harmony, forgiveness between people, how to treat others, divine friendship'),
-- ('Parenting', 'parenting', 'situation', 2, 'Raising children, parenthood, guiding young souls, family life, teaching children spiritual values, a parent''s duty'),
-- ('Loss & Grief', 'loss-and-grief', 'situation', 3, 'Death of a loved one, bereavement, grief, consolation, the soul''s continuity, life after death, eternal life'),
-- ('Work', 'work', 'situation', 4, 'Livelihood, career, right activity, duty, service, karma yoga, finding meaning in work, balancing material and spiritual life'),
-- ('Loneliness', 'loneliness', 'situation', 5, 'Isolation, feeling alone, finding the inner companion, solitude vs loneliness, divine companionship, belonging'),
-- ('Aging', 'aging', 'situation', 6, 'Growing older, the body and the soul, vitality, wisdom of age, preparing for the afterlife, eternal youth of the spirit');

-- Milestone 3c+: exploration themes — persons, principles, scriptures, practices (ADR-033)
-- Same tagging pipeline as quality/situation themes. No fixed minimum — editorial judgment decides when a topic has enough depth to publish.
-- INSERT INTO teaching_topics (name, slug, category, sort_order, description) VALUES
--
-- -- SPIRITUAL FIGURES (category = 'person')
-- ('Christ', 'christ', 'person', 1, 'Jesus Christ, Christ Consciousness, the Second Coming, the teachings of Jesus, Yogananda''s interpretation of Christianity, the Christ of the East and West'),
-- ('Krishna', 'krishna', 'person', 2, 'Lord Krishna, the Bhagavad Gita''s speaker, divine cowherd, avatar, cosmic consciousness personified, the universal guru'),
-- ('Lahiri Mahasaya', 'lahiri-mahasaya', 'person', 3, 'Lahiri Mahasaya, Yogananda''s param-guru, Kriya Yoga master, the householder yogi, revival of ancient yoga science'),
-- ('Sri Yukteswar', 'sri-yukteswar', 'person', 4, 'Sri Yukteswar, Yogananda''s guru, Jnanavatar, wisdom incarnation, astrology and scripture, guru-disciple relationship'),
-- ('Patanjali', 'patanjali', 'person', 5, 'Patanjali, author of the Yoga Sutras, father of yoga philosophy, eight limbs, systematic yoga science'),
-- ('Kabir', 'kabir', 'person', 6, 'Kabir, mystic poet, weaver saint, union of Hindu and Muslim devotion, direct experience of God'),
-- ('Divine Mother', 'divine-mother', 'person', 7, 'Divine Mother, God as Mother, cosmic feminine, Kali, unconditional love of God, Yogananda''s devotion to the Mother aspect'),
--
-- -- YOGIC PRINCIPLES (category = 'principle') — Yama/Niyama from Patanjali's Yoga Sutras
-- ('Ahimsa', 'ahimsa', 'principle', 1, 'Non-violence, non-injury, compassion for all beings, harmlessness in thought word and deed, the first yama'),
-- ('Satya', 'satya', 'principle', 2, 'Truthfulness, honesty, integrity, living in truth, speaking truth, the second yama'),
-- ('Asteya', 'asteya', 'principle', 3, 'Non-stealing, non-covetousness, contentment with what one has, the third yama'),
-- ('Brahmacharya', 'brahmacharya', 'principle', 4, 'Self-control, moderation, conservation of vital energy, chastity, the fourth yama'),
-- ('Aparigraha', 'aparigraha', 'principle', 5, 'Non-attachment, non-possessiveness, simplicity, freedom from greed, the fifth yama'),
-- ('Saucha', 'saucha', 'principle', 6, 'Cleanliness, purity of body and mind, internal and external purification, the first niyama'),
-- ('Santosha', 'santosha', 'principle', 7, 'Contentment, acceptance, inner satisfaction, the second niyama'),
-- ('Tapas', 'tapas', 'principle', 8, 'Self-discipline, austerity, spiritual fire, perseverance, the third niyama'),
-- ('Svadhyaya', 'svadhyaya', 'principle', 9, 'Self-study, scriptural study, introspection, the fourth niyama'),
-- ('Ishvara Pranidhana', 'ishvara-pranidhana', 'principle', 10, 'Surrender to God, devotion, offering actions to the divine, the fifth niyama'),
--
-- -- SACRED TEXTS (category = 'scripture')
-- ('Yoga Sutras', 'yoga-sutras', 'scripture', 1, 'Patanjali''s Yoga Sutras, eight limbs of yoga, systematic yoga philosophy, samadhi, pratyahara, dharana, dhyana'),
-- ('Bhagavad Gita', 'bhagavad-gita', 'scripture', 2, 'The Bhagavad Gita, Krishna and Arjuna, battlefield of life, karma yoga, bhakti yoga, jnana yoga, God Talks With Arjuna'),
-- ('Bible', 'bible', 'scripture', 3, 'The Holy Bible, Old and New Testament, Christ''s teachings, Yogananda''s interpretation of Christianity, the Second Coming'),
-- ('Rubaiyat', 'rubaiyat', 'scripture', 4, 'Rubaiyat of Omar Khayyam, Wine of the Mystic, Yogananda''s spiritual interpretation, Persian poetry, divine intoxication'),
--
-- -- SPIRITUAL PRACTICES (category = 'practice')
-- ('Meditation', 'meditation', 'practice', 1, 'Meditation technique, how to meditate, stillness, concentration, going within, interiorization, daily practice'),
-- ('Concentration', 'concentration', 'practice', 2, 'One-pointed attention, focus, mental power, will, dharana, training the mind'),
-- ('Pranayama', 'pranayama', 'practice', 3, 'Breath control, life force, prana, vital energy, breathing exercises, energy control'),
-- ('Affirmation', 'affirmation', 'practice', 4, 'Affirmations, positive thinking, mental healing, thought power, Scientific Healing Affirmations, will and affirmation'),
-- ('Devotion', 'devotion', 'practice', 5, 'Bhakti, love for God, prayer, chanting, divine love, heart-centered practice, surrender'),
--
-- -- YOGA PATHS (category = 'yoga_path')
-- ('Kriya Yoga', 'kriya-yoga', 'yoga_path', 1, 'Kriya Yoga, the royal technique, spinal magnetization, life force control, Babaji''s yoga, Lahiri Mahasaya''s science'),
-- ('Raja Yoga', 'raja-yoga', 'yoga_path', 2, 'Raja Yoga, the royal path, Patanjali''s eightfold path, meditation and mental control, astanga yoga'),
-- ('Bhakti Yoga', 'bhakti-yoga', 'yoga_path', 3, 'Bhakti Yoga, the path of devotion, love for God, divine love, chanting, prayer, emotional surrender'),
-- ('Karma Yoga', 'karma-yoga', 'yoga_path', 4, 'Karma Yoga, the path of action, selfless service, right activity, nishkama karma, duty without attachment'),
-- ('Jnana Yoga', 'jnana-yoga', 'yoga_path', 5, 'Jnana Yoga, the path of wisdom, discrimination, viveka, intellectual understanding, Vedantic inquiry'),
-- ('Hatha Yoga', 'hatha-yoga', 'yoga_path', 6, 'Hatha Yoga, physical postures, asana, body as temple, health, Energization Exercises, physical purification'),
-- ('Mantra Yoga', 'mantra-yoga', 'yoga_path', 7, 'Mantra Yoga, sacred sound, repetition of God''s name, chanting, japa, AUM, vibratory consciousness'),
-- ('Laya Yoga', 'laya-yoga', 'yoga_path', 8, 'Laya Yoga, absorption, dissolution of ego, merging in the Infinite, kundalini, subtle energy centers');

-- ============================================================
-- THEME TAGGING PIPELINE (ADR-032)
-- ============================================================
-- Semi-automated: embeddings propose, humans approve.
--
-- Adding a new theme:
-- 1. INSERT into teaching_topics with name, slug, category, description
-- 2. Embed the description → store in description_embedding
-- 3. Run cosine similarity: compare description_embedding against all book_chunks.embedding
-- 4. Chunks above threshold (e.g., 0.45) get INSERT into chunk_topics with tagged_by='auto'
-- 5. Optional: Claude Opus classifies ambiguous chunks near the threshold (ADR-014 batch tier — classifying, not generating)
-- 6. Human reviews candidate list, approves/rejects → tagged_by updated to 'reviewed' or row deleted
-- 7. Topic page goes live when an editor decides the tagged passages have sufficient depth (no fixed minimum)
--
-- Auto-tagging is cheap: pure vector math against existing embeddings. No re-ingestion.
-- Adding a new theme retroactively requires zero re-embedding — only a similarity scan + human review.
--
-- Multilingual: the multilingual embedding model places semantically equivalent text
-- in different languages close in vector space, so English theme descriptions produce
-- reasonable candidates for non-English chunks. Per-language descriptions improve accuracy
-- for languages with different spiritual vocabulary.

-- ============================================================
-- SEARCH QUERY LOG (anonymized, for understanding seeker needs)
-- ============================================================
CREATE TABLE search_queries (
 id UUID PRIMARY KEY DEFAULT uuidv7(),
 query_text TEXT NOT NULL,
 query_expanded TEXT[], -- expanded search terms (if AI was used)
 results_count INTEGER,
 search_mode TEXT, -- 'hybrid', 'fts_only', 'vector_only'
 language TEXT DEFAULT 'en',
 duration_ms INTEGER, -- search latency
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- No user identification stored. Queries are anonymized.
-- Time-series index for analytics.
CREATE INDEX idx_queries_time ON search_queries(created_at DESC);

-- No retention policy needed. At ~1,000 searches/day, the raw table
-- grows ~73 MB/year — trivially manageable for Neon over a 10-year horizon.
-- If retention ever becomes necessary, a simple aggregation can be added then.

-- ============================================================
-- SEARCH THEME AGGREGATES (anonymized trend data — ADR-053)
-- ============================================================
-- Nightly aggregation of search_queries into theme-level trends.
-- Powers the "What Is Humanity Seeking?" dashboard (Milestone 3d).
-- Created in initial schema; populated by Lambda aggregation job.
CREATE TABLE search_theme_aggregates (
 id UUID PRIMARY KEY DEFAULT uuidv7(),
 theme TEXT NOT NULL, -- classified theme (Peace, Healing, etc.)
 country TEXT, -- country-level geo (from Vercel headers)
 period_start DATE NOT NULL, -- aggregation period start
 period_end DATE NOT NULL, -- aggregation period end
 query_count INTEGER NOT NULL DEFAULT 0,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_search_themes_period ON search_theme_aggregates(period_start, theme);

-- ============================================================
-- CHAPTER STUDY NOTES (reader annotations — Arc 4)
-- ============================================================
-- Per-chapter study guide content: key themes, notable passages,
-- cross-book connections. Created in initial schema; populated
-- incrementally as study guide features are built (Arc 4).
CREATE TABLE chapter_study_notes (
 id UUID PRIMARY KEY DEFAULT uuidv7(),
 chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
 note_type TEXT NOT NULL DEFAULT 'key_theme', -- 'key_theme', 'notable_passage', 'cross_reference'
 content TEXT NOT NULL,
 sort_order INTEGER NOT NULL DEFAULT 0,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_study_notes_chapter ON chapter_study_notes(chapter_id, note_type);

-- ============================================================
-- CHUNK RELATIONS (pre-computed semantic similarity between passages)
-- ============================================================
-- Powers the "Related Teachings" side panel in the reader,
-- "Continue the Thread" end-of-chapter suggestions, and
-- graph traversal across the library. (ADR-050)
--
-- Pre-computed at ingestion time. For each chunk, store the
-- top 30 most similar chunks (excluding adjacent paragraphs
-- from the same chapter — those are already "in context").
--
-- Top 30 provides headroom for filtered queries (by book,
-- language, content type). If filtering yields < 3 results,
-- fall back to a real-time vector similarity query.

CREATE TABLE chunk_relations (
 source_chunk_id UUID NOT NULL REFERENCES book_chunks(id) ON DELETE CASCADE,
 target_chunk_id UUID NOT NULL REFERENCES book_chunks(id) ON DELETE CASCADE,
 similarity FLOAT NOT NULL,
 rank INTEGER NOT NULL, -- 1 = most similar, 2 = second, etc.
 relation_type TEXT, -- NULL (Milestones 1a–2b), classified in Milestone 3c (ADR-005 E6):
 -- 'same_topic' — both passages address the same theme
 -- 'develops_further'— target develops the source idea at greater length
 -- 'personal_story' — target is a personal illustration of the source teaching
 -- 'practical' — target is a practical application or affirmation
 -- 'performance_of' — target audio/video is a performance of source chant
 -- (deterministic editorial link, not vector-derived;
 -- similarity=1.0, rank orders multiple performances;
 -- ADR-059)
 -- Classified by Claude for top 10 cross-book relations per chunk. Spot-checked.
 -- performance_of relations are editorially curated, not AI-classified.
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 PRIMARY KEY (source_chunk_id, target_chunk_id)
);

-- Fast lookup: "what's related to what I'm reading?"
CREATE INDEX idx_chunk_relations_source ON chunk_relations(source_chunk_id, rank);

-- Reverse lookup: "what passages consider this chunk related?"
CREATE INDEX idx_chunk_relations_target ON chunk_relations(target_chunk_id);

-- ============================================================
-- CHUNK REFERENCES (editorial cross-references within text)
-- ============================================================
-- Human-curated cross-references for explicit mentions:
-- "As my guru Sri Yukteswar taught..." → link to that passage.
-- Supplements the automatic embedding-based relations above.

-- chunk_references table added in Milestone 3c (Related Teachings & Reader Intelligence)
CREATE TABLE chunk_references (
 source_chunk_id UUID NOT NULL REFERENCES book_chunks(id) ON DELETE CASCADE,
 target_chunk_id UUID NOT NULL REFERENCES book_chunks(id) ON DELETE CASCADE,
 reference_type TEXT NOT NULL DEFAULT 'mention', -- 'mention', 'quote', 'scripture', 'continuation'
 note TEXT, -- editorial note (e.g., "References Bhagavad Gita 2:47")
 created_by TEXT NOT NULL DEFAULT 'editorial', -- 'editorial' or 'auto'
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 PRIMARY KEY (source_chunk_id, target_chunk_id)
);

CREATE INDEX idx_chunk_references_source ON chunk_references(source_chunk_id);
CREATE INDEX idx_chunk_references_target ON chunk_references(target_chunk_id);

-- ============================================================
-- HYBRID SEARCH: RRF over pgvector + pg_search BM25 (ADR-044, ADR-114)
-- ============================================================
-- Combines dense vector similarity (pgvector) and BM25 keyword
-- relevance (pg_search/ParadeDB) using Reciprocal Rank Fusion.
-- Milestone 3b+ adds PATH C (graph-augmented retrieval via Postgres) as a third source
-- merged at the application layer before reranking (ADR-119).

-- Example hybrid query (implemented in /lib/services/search.ts):
--
-- WITH vector_results AS (
--   SELECT id, content, book_id,
--     1 - (embedding <=> $query_embedding) AS score,
--     ROW_NUMBER() OVER (ORDER BY embedding <=> $query_embedding) AS rank
--   FROM book_chunks
--   WHERE language = $language
--   ORDER BY embedding <=> $query_embedding
--   LIMIT 50
-- ),
-- keyword_results AS (
--   SELECT id, content, book_id,
--     paradedb.score(id) AS score,
--     ROW_NUMBER() OVER (ORDER BY paradedb.score(id) DESC) AS rank
--   FROM book_chunks
--   WHERE id @@@ paradedb.match('content', $expanded_query)
--     AND language = $language
--   LIMIT 50
-- ),
-- rrf AS (
--   SELECT
--     COALESCE(v.id, k.id) AS id,
--     (COALESCE(1.0 / (60 + v.rank), 0) +
--      COALESCE(1.0 / (60 + k.rank), 0)) AS rrf_score
--   FROM vector_results v
--   FULL OUTER JOIN keyword_results k ON v.id = k.id
-- )
-- SELECT id, rrf_score FROM rrf ORDER BY rrf_score DESC LIMIT $match_count;

-- Note: The English fallback strategy (ADR-075) is implemented at the
-- service layer, not in the SQL function. When search_language results
-- < 3, findPassages calls hybrid_search a second time with
-- search_language='en' and merges the results, marking English
-- passages with an [EN] tag. This keeps the SQL function clean and
-- the fallback policy in application code where it belongs.

-- ============================================================
-- ENTITY REGISTRY (canonical entity resolution — ADR-116)
-- ============================================================
-- Built before first book ingestion. All enrichment entity extraction
-- validates against this registry. Feeds suggestion system (ADR-049,
-- ADR-120 Tiers 2 and 4) and graph intelligence (ADR-117).
CREATE TABLE entity_registry (
 id              UUID PRIMARY KEY DEFAULT uuidv7(),
 canonical_name  TEXT NOT NULL,
 entity_type     TEXT NOT NULL,     -- Teacher|DivineName|Work|Technique|SanskritTerm|Concept|Place|ExperientialState
 aliases         TEXT[],            -- all known surface forms
 language        CHAR(5),
 definition      TEXT,
 srf_definition  TEXT,              -- Yogananda's specific definition if distinct
 centrality_score REAL,             -- PageRank from graph batch (Milestone 3b+, ADR-117)
 community_id   TEXT,               -- community detection cluster (Milestone 3b+, ADR-117)
 bridge_score   REAL,               -- betweenness centrality (Milestone 3b+, ADR-117)
 created_at      TIMESTAMPTZ DEFAULT now(),
 UNIQUE(canonical_name, entity_type)
);

CREATE INDEX entity_aliases_idx ON entity_registry USING gin(aliases);

-- ============================================================
-- SANSKRIT NORMALIZATION (ADR-116, extends ADR-080)
-- ============================================================
-- Handles transliteration variants: "samadhi" = "Samaadhi" = "samahdi".
-- All variant forms loaded into suggestion system for fuzzy matching.
CREATE TABLE sanskrit_terms (
 id              UUID PRIMARY KEY DEFAULT uuidv7(),
 canonical_form  TEXT NOT NULL,     -- "samadhi"
 display_form    TEXT NOT NULL,     -- "Samadhi"
 devanagari      TEXT,              -- "समाधि"
 iast_form       TEXT,              -- "samādhi"
 common_variants TEXT[],            -- ["Samaadhi", "samahdi"]
 srf_definition  TEXT,
 domain          TEXT,              -- philosophy|practice|state|quality
 depth_level     INT,               -- if experiential state: 1-7 (ADR-115)
 weight          INT DEFAULT 100    -- suggestion ranking weight
);

-- ============================================================
-- SUGGESTION DICTIONARY (ADR-049, ADR-120)
-- ============================================================
-- Pre-computed suggestion vocabulary derived from corpus enrichment.
-- Six-tier hierarchy. No click_through tracking (DELTA compliance).
CREATE TABLE suggestion_dictionary (
 id              UUID PRIMARY KEY DEFAULT uuidv7(),
 suggestion      TEXT NOT NULL,
 display_text    TEXT,              -- formatted display (e.g., "Samadhi — superconscious state")
 suggestion_type TEXT NOT NULL,     -- scoped_query|entity|concept|sanskrit|learned_query|term
 language        CHAR(5) NOT NULL,
 script          TEXT NOT NULL,     -- latin|cjk|arabic|cyrillic|devanagari
 latin_form      TEXT,              -- transliteration for non-latin terms
 corpus_frequency INT DEFAULT 0,
 query_frequency  INT DEFAULT 0,   -- from anonymized, aggregated query log (ADR-053).
                                    -- DELTA note: this is aggregated "what the world searches for"
                                    -- (cf. ADR-090), not individual behavioral profiling.
                                    -- Acceptable under DELTA because no per-user attribution exists.
 editorial_boost  REAL DEFAULT 0,  -- 0.0–1.0, set by editors for promoted suggestions
 weight          REAL DEFAULT 0,   -- computed at application level using named constants
                                    -- (SUGGESTION_WEIGHT_CORPUS, SUGGESTION_WEIGHT_QUERY,
                                    -- SUGGESTION_WEIGHT_EDITORIAL) from /lib/config.ts (ADR-123).
                                    -- Not a generated column — allows coefficient tuning without migration.
 entity_id       UUID REFERENCES entity_registry(id),
 book_id         UUID REFERENCES books(id),
 updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX suggestion_trgm_idx ON suggestion_dictionary USING gin(suggestion gin_trgm_ops);
CREATE INDEX suggestion_language_idx ON suggestion_dictionary(language, suggestion);
CREATE INDEX suggestion_weight_idx ON suggestion_dictionary(language, weight DESC);

-- ============================================================
-- EXTRACTED RELATIONSHIPS (graph intelligence — ADR-115, ADR-117)
-- ============================================================
-- Every relationship triple extracted by the enrichment pipeline.
-- Queried directly by graph-augmented retrieval (PATH C, Milestone 3b+).
-- Graph algorithm batch job reads from this table nightly.
CREATE TABLE extracted_relationships (
 id              UUID PRIMARY KEY DEFAULT uuidv7(),
 chunk_id        UUID REFERENCES book_chunks(id),
 subject_entity  TEXT,
 relationship    TEXT,              -- TEACHES|INTERPRETS|DESCRIBES_STATE|MENTIONS|etc.
 object_entity   TEXT,
 confidence      REAL,
 created_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- USER PROFILES (opt-in authenticated experience — ADR-121)
-- ============================================================
-- Account never required for core functionality. DELTA core
-- commitments preserved: no behavioral profiling, no gamification,
-- no engagement optimization. No profile_embedding column.
CREATE TABLE user_profiles (
 id                  UUID PRIMARY KEY DEFAULT uuidv7(),
 auth0_id            TEXT UNIQUE NOT NULL,
 preferred_language  CHAR(5),
 tradition_background TEXT,         -- optional, user-provided
 practice_level      TEXT,          -- optional, user-provided
 created_at          TIMESTAMPTZ DEFAULT now()
);
```

*Schema revised: 2026-02-26, deep review — fixed DEFAULT now() syntax across 7 tables, added missing columns (chapters.content_hash per ADR-039, updated_at per ADR-107 on chapters/book_chunks/teaching_topics/daily_passages/affirmations), resolved content_hash definition conflict (GENERATED ALWAYS AS per ADR-022), reordered tables (archive after chapters/book_chunks), added book_chunks_archive.author_tier per PRO-014, added search_theme_aggregates and chapter_study_notes table definitions per M1a-2, added composite (updated_at, id) indexes per ADR-107.*

### Contentful Content Model (Arc 1+)

Created in Milestone 1a as part of Contentful space setup. The content model is the editorial source of truth from the first milestone (ADR-010).

```
Content Type: Book
├── title (Short Text, required, localized)
├── subtitle (Short Text, localized)
├── author (Short Text, default: "Paramahansa Yogananda")
├── authorTier (Short Text, required, validation: guru|president|monastic) — PRO-014
├── publicationYear (Integer)
├── isbn (Short Text)
├── coverImage (Media, localized)
├── language (Short Text, default: "en")
├── chapters (References, many → Chapter)
└── slug (Short Text, unique, for URL generation)

Content Type: Chapter
├── title (Short Text, required, localized)
├── chapterNumber (Integer, required)
├── book (Reference → Book)
├── sections (References, many → Section)
└── sortOrder (Integer)

Content Type: Section
├── heading (Short Text, localized)
├── chapter (Reference → Chapter)
├── blocks (References, many → TextBlock)
└── sortOrder (Integer)

Content Type: TextBlock
├── content (Rich Text, required, localized)
│ └── stores text as JSON AST
│ preserves bold, italic, footnotes, verse numbers
├── section (Reference → Section)
├── pageNumber (Integer) — maps to physical book page
├── sortOrder (Integer)
└── metadata (JSON Object) — flexible field for verse refs, etc.
```

**Milestone 1a sync (batch script):**
```
Contentful import complete (all TextBlocks published)
 │
 ▼
Batch sync script (run locally or via CI)
 │
 ├── Fetch all TextBlocks from Contentful Delivery API
 ├── Extract plain text from Rich Text JSON AST
 ├── Chunk by paragraph boundaries (ADR-048)
 ├── Unified enrichment pass (Claude, ADR-115)
 ├── Generate embedding via Voyage voyage-3-large (ADR-118)
 ├── Upsert into Neon book_chunks table
 │ (matched by contentful_id)
 └── Log sync event
```

**Milestone 1c+ sync (webhook-driven):**
```
Contentful publish event
 │
 ▼
Webhook → Vercel Function
 │
 ├── Fetch updated TextBlock from Contentful API
 ├── Extract plain text from Rich Text JSON AST
 ├── Chunk, enrich, generate embedding
 ├── Upsert into Neon book_chunks table
 │ (matched by contentful_id)
 └── Log sync event
```

---
