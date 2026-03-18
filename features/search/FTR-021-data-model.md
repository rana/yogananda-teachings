---
ftr: 21
title: Data Model
summary: "Core database schema for books, chapters, chunks, embeddings, editions, and multilingual content"
state: implemented
domain: search
governed-by: [PRI-06, PRI-10]
---

# FTR-021: Data Model

## Rationale

### Context

Yogananda's books have been published in multiple editions over decades. Page numbers, chapter organization, and even paragraph boundaries can differ between editions. If SRF publishes a revised edition of *Where There Is Light* with corrected page numbers or reorganized content, every citation in the portal referencing the previous edition becomes inaccurate.

The current data model does not track edition. The `books` table has `publication_year` but no edition identifier. A re-ingestion of a revised edition would overwrite the previous data, potentially breaking:
- Shared passage links (if paragraph boundaries shifted — mitigated by FTR-132)
- Cached OG images with old page numbers
- External citations referencing portal page numbers
- Email archives with old citations

### Decision

Add `edition` and `edition_year` columns to the `books` table. Track which edition the portal serves.

#### Schema addition

```sql
ALTER TABLE books ADD COLUMN edition TEXT; -- e.g., "13th Edition", "Revised 2024"
ALTER TABLE books ADD COLUMN edition_year INTEGER; -- year of this specific edition
```

#### Content policy

- The portal serves **one edition per language per book** at any time. There is no multi-edition viewer.
- When a new edition is ingested, the old edition's data is archived (not deleted) in a `book_chunks_archive` table, preserving historical citations.
- Shared links to the old edition resolve via content-hash fallback (FTR-132). If the passage exists in the new edition (even at a different location), the link still works.
- The book landing page displays the served edition: *"Autobiography of a Yogi — 13th Edition (1998)"*.

#### Transition workflow

1. Ingest new edition to a Neon branch (not production)
2. Run content-hash comparison: identify passages that moved, changed, or were added/removed
3. Human review of all changes
4. Apply to production, archiving old edition data
5. Regenerate chunk relations for affected passages
6. Log all paragraph_index shifts for link audit

### Rationale

- **Citation accuracy over time.** The 10-year architecture horizon (FTR-004) means the portal will almost certainly serve updated editions. Tracking editions now costs two columns and prevents citation confusion later.
- **Transparent sourcing.** Displaying the edition on book pages tells seekers exactly which text they're reading. This is Sacred Text Fidelity in practice.
- **Archive for auditability.** If a theological question arises about a specific passage rendering, the archive preserves what was served and when.

### Consequences

- `edition` and `edition_year` columns added to `books` table in Milestone 1a migration
- `book_chunks_archive` table created (can be empty until an actual re-ingestion occurs)
- Book landing pages display edition information
- Re-ingestion workflow documented in the operational playbook
- **Extends FTR-004** (10-year architecture) and **FTR-132** (content-addressable links)

## Specification

### Neon PostgreSQL Schema

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;              -- pgvector (dense vector search)
CREATE EXTENSION IF NOT EXISTS pg_search;           -- ParadeDB BM25 full-text search (FTR-025)
CREATE EXTENSION IF NOT EXISTS pg_trgm;             -- trigram similarity (fuzzy matching, suggestion fallback)
CREATE EXTENSION IF NOT EXISTS unaccent;            -- diacritics-insensitive search (FTR-131)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;  -- query performance monitoring (FTR-094)

-- ============================================================
-- BOOKS
-- ============================================================
CREATE TABLE books (
 id UUID PRIMARY KEY DEFAULT uuidv7(),
 title TEXT NOT NULL,
 subtitle TEXT,
 author TEXT NOT NULL, -- No default; author must be explicit for multi-author corpus (FTR-001)
 publication_year INTEGER,
 language TEXT NOT NULL DEFAULT 'en',
 isbn TEXT,
 source_url TEXT, -- PDF URL for initial ingestion
 contentful_id TEXT, -- Contentful entry ID (production)
 cover_image_url TEXT,
 bookstore_url TEXT, -- SRF Bookstore URL for "Find this book" link.
 -- Points to SRF Bookstore for all books. If per-language bookstore
 -- routing is needed at Milestone 5b (YSS for Hindi/Bengali), add a
 -- simple lookup table — zero schema changes required now.
 edition TEXT, -- e.g., "13th Edition", "Revised 2024" (FTR-021)
 edition_year INTEGER, -- year of this specific edition (FTR-021)
 canonical_book_id UUID REFERENCES books(id), -- links translations to the original (English) edition;
 -- NULL for originals. Enables "Available in 6 languages"
 -- on books page and cross-language navigation.
 content_format TEXT NOT NULL DEFAULT 'prose' -- 'prose' (default), 'chant', 'poetry' (FTR-142).
 CHECK (content_format IN ('prose', 'chant', 'poetry')),
 -- Controls reader rendering: prose = continuous scroll,
 -- chant/poetry = whole-unit pages with chant-to-chant nav.
 -- Chant format enables inline media panel for
 -- performance_of relations (deterministic audio/video links).
 author_tier TEXT NOT NULL  -- FTR-001: Author role hierarchy (denormalized from author). No DEFAULT — force explicit on insert.
 CHECK (author_tier IN ('guru', 'president', 'monastic')),
 -- 'guru': Lineage gurus (Yogananda, Sri Yukteswar). Full search/theme/daily pool/social media.
 -- 'president': SRF Presidents / spiritual heads (Daya Mata, Mrinalini Mata, Rajarsi).
 --   Searchable by default, themeable. Not in daily pool or social media pool.
 -- 'monastic': Monastic speakers. Opt-in search (author_tier param includes 'monastic'). Not in daily/social pool.
 -- Tiers describe author role, not value. All tiers: verbatim fidelity + no machine translation.
 -- Tier assignments confirmed by stakeholder 2026-02-25 — see FTR-001.
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
 content_hash TEXT, -- SHA-256 of chapter content, computed at ingestion (FTR-123)
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
 embedding VECTOR(1024), -- Voyage voyage-4-large embedding vector (FTR-024)
 embedding_model TEXT NOT NULL DEFAULT 'voyage-4-large', -- which model generated this vector (FTR-024)
 embedding_dimension INTEGER NOT NULL DEFAULT 1024, -- vector dimensions for this chunk
 embedded_at TIMESTAMPTZ NOT NULL DEFAULT now(), -- when this chunk was last embedded
 script TEXT, -- latin|cjk|arabic|cyrillic|devanagari — routes BM25 index (FTR-025)
 language_confidence REAL, -- fastText detection confidence

 -- Contentful linkage (production)
 contentful_id TEXT, -- Contentful entry ID of source block

 -- Chunk context (for overlap / windowing)
 prev_chunk_id UUID, -- previous chunk for context continuity
 next_chunk_id UUID, -- next chunk for "read more"

 -- Cross-language alignment (Milestone 5b)
 canonical_chunk_id UUID REFERENCES book_chunks(id), -- links translated chunk to its English original;
 -- NULL for originals. Enables "Read this in Spanish →".

 -- Unified enrichment output (FTR-026)
 summary TEXT, -- "This passage is primarily about..." — in chunk's detected language
 summary_en TEXT, -- English translation for cross-lingual UI (async, non-English only)
 topics TEXT[], -- canonical topic labels for thematic indexing
 entities JSONB, -- typed entity extraction, validated against entity_registry (FTR-033)
 domain TEXT, -- philosophy|narrative|technique|devotional|poetry
 experiential_depth SMALLINT, -- 1-7: ordinary waking → nirvikalpa samadhi (FTR-026)
 emotional_quality TEXT[], -- consoling|inspiring|instructional|devotional|demanding|celebratory
 voice_register TEXT, -- intimate|cosmic|instructional|devotional|philosophical|humorous
 cross_references JSONB, -- explicit refs to other works, teachers, scriptures
 semantic_density TEXT, -- high|medium|low (FTR-023)

 -- Metadata
 language TEXT NOT NULL DEFAULT 'en',
 accessibility_level SMALLINT, -- 1=universal, 2=accessible, 3=deep (FTR-005 E3)
 -- NULL until classified. Computed by Claude at ingestion, spot-checked by reviewer.
 -- Used for Today's Wisdom (prefer 1–2), theme pages (default 1–2, "Show deeper" shows all).
 centrality_score REAL,  -- PageRank from graph batch (Milestone 3b+, FTR-034)
 community_id TEXT,      -- community detection cluster (Milestone 3b+, FTR-034)
 metadata JSONB DEFAULT '{}',
 content_hash TEXT GENERATED ALWAYS AS (encode(sha256(content::bytea), 'hex')) STORED,
 -- Auto-computed from content for stable deep links (FTR-132).
 -- Shared URLs embed the first 6 chars as verification hash.
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Vector similarity search (HNSW for fast approximate nearest neighbor)
CREATE INDEX idx_chunks_embedding ON book_chunks
 USING hnsw (embedding vector_cosine_ops)
 WITH (m = 16, ef_construction = 64);

-- BM25 full-text search (pg_search / ParadeDB — FTR-025)
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

-- Trigram index for fuzzy/partial matching (suggestion fallback, FTR-029)
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

-- Timestamp-filtered pagination (FTR-087)
CREATE INDEX idx_chunks_updated ON book_chunks(updated_at, id);
CREATE INDEX idx_chapters_updated ON chapters(updated_at, id);

-- Content hash index for stable deep link resolution (FTR-132)
CREATE INDEX idx_chunks_content_hash ON book_chunks(content_hash);

-- ============================================================
-- BOOK CHUNKS ARCHIVE (edition transitions — FTR-021)
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
 embedding VECTOR(1024), -- matches current model dimension (FTR-024)
 embedding_model TEXT NOT NULL,
 content_hash TEXT,
 author_tier TEXT,  -- preserved from books.author_tier at archive time (FTR-001)
 language TEXT NOT NULL DEFAULT 'en',
 edition TEXT, -- edition this chunk belonged to
 archived_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 original_created_at TIMESTAMPTZ NOT NULL,
 original_updated_at TIMESTAMPTZ -- preserved from book_chunks.updated_at
);

-- ============================================================
-- FULL-TEXT SEARCH NOTE (FTR-025)
-- ============================================================
-- pg_search / ParadeDB BM25 replaces tsvector for all full-text search.
-- The BM25 index (chunks_bm25_icu above) handles tokenization, stemming,
-- and relevance ranking internally. No tsvector column or trigger needed.
-- ICU tokenizer handles diacritics (ā→a, ṇ→n, ś→s, etc.) and most
-- languages. CJK-specific indexes (Jieba, Lindera) added in Milestone 5b.
-- The unaccent extension is still loaded for pg_trgm fuzzy matching.
```

> **Terminology note:** The database table `teaching_topics` is exposed as `themes` in the API (`/api/v1/themes`) and displayed as "Doors of Entry" in the seeker-facing UI. The related junction table `chunk_topics` links passages to themes. These terms all refer to the same concept: curated thematic groupings of Yogananda's teachings (e.g., Peace, Courage, Healing). See FTR-121 and FTR-121.

The full schema continues with teaching_topics, topic_translations, chunk_topics, daily_passages, affirmations, search_queries, search_theme_aggregates, chapter_study_notes, chunk_relations, chunk_references, entity_registry, sanskrit_terms, suggestion_dictionary, extracted_relationships, and user_profiles tables. See the complete schema in `design/search/FTR-021-data-model.md`.

### Contentful Content Model (Milestone 1a+)

Created in Milestone 1a as part of Contentful space setup. The content model is the editorial source of truth from the first milestone (FTR-102).

```
Content Type: Book
├── title (Short Text, required, localized)
├── subtitle (Short Text, localized)
├── author (Short Text, default: "Paramahansa Yogananda")
├── authorTier (Short Text, required, validation: guru|president|monastic) — FTR-001
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
 ├── Chunk by paragraph boundaries (FTR-023)
 ├── Unified enrichment pass (Claude, FTR-026)
 ├── Generate embedding via Voyage voyage-4-large (FTR-024)
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

## Notes

- **Origin:** FTR-021 (Edition-Aware Content Model) + FTR-021 (Data Model)
- **Merge:** FTR-021 rationale merged with FTR-021 specification
- Schema revised 2026-02-26 after deep review
