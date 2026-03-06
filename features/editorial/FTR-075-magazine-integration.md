---
ftr: 75
title: Magazine Integration — Self-Realization Magazine as First-Class Content
state: approved
domain: editorial
arc: "4"
governed-by: [PRI-01, PRI-02]
---

# FTR-075: Magazine Integration

## Rationale

### Context

Self-Realization Magazine, published by SRF since 1925, contains: (1) articles by Paramahansa Yogananda — published teachings with the same sacred text status as his books, (2) articles by SRF monastics — authorized commentary and contemporary guidance, (3) devotee experiences, and (4) organizational news. The magazine represents a significant body of Yogananda's published writings not found in his books.

Additionally, the portal's "What Is Humanity Seeking?" data is an ideal candidate for a recurring magazine feature, creating a symbiotic relationship between the portal and the magazine.

### Decision

Integrate Self-Realization Magazine as a primary content type with differentiated treatment by content category:

| Category | Search Index | Theme Tags | Daily Pool | Reader Treatment |
|----------|-------------|------------|------------|-----------------|
| Yogananda's articles | Full (same as books) | Yes | Yes | Full reader with gold quote marks |
| Monastic articles | Filtered (opt-in via `author_tier` param including `monastic`) | Yes | No | Reader with author byline |
| Devotee experiences | No | No | No | Browsable, not searchable |
| News/editorial | No | No | No | Browsable, archival |

**Core principle:** Yogananda's magazine articles are published teachings — they enter the same chunk/search/theme pipeline as book passages. A seeker searching "how to overcome fear" finds the relevant magazine article alongside book passages, ranked by relevance. The citation adapts: *— Self-Realization Magazine, Vol. 97 No. 2, p. 14*.

### Schema

```sql
CREATE TABLE magazine_issues (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  slug TEXT NOT NULL UNIQUE,        -- e.g., '2025-spring', '1925-winter'
  volume INTEGER NOT NULL,
  issue_number INTEGER NOT NULL,
  season TEXT CHECK (season IN ('spring', 'summer', 'fall', 'winter')),
  publication_date DATE NOT NULL,
  title TEXT NOT NULL,
  cover_image_url TEXT,
  editorial_note TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  access_level TEXT NOT NULL DEFAULT 'public'
    CHECK (access_level IN ('public', 'subscriber')),
  created_at TIMESTAMPTZ DEFAULT now,
  updated_at TIMESTAMPTZ DEFAULT now,
  UNIQUE(volume, issue_number)
);

CREATE TABLE magazine_articles (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  issue_id UUID NOT NULL REFERENCES magazine_issues(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,          -- globally unique (FTR-155)
  author_name TEXT NOT NULL,
  author_type TEXT NOT NULL
    CHECK (author_type IN ('yogananda', 'monastic', 'devotee', 'editorial')),
  author_tier TEXT GENERATED ALWAYS AS (
    CASE author_type
      WHEN 'yogananda' THEN 'guru'
      WHEN 'monastic' THEN 'monastic'
      ELSE NULL
    END
  ) STORED,                              -- unified with books.author_tier for cross-source search
  position INTEGER NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  access_level TEXT NOT NULL DEFAULT 'public'
    CHECK (access_level IN ('public', 'subscriber')),
  created_at TIMESTAMPTZ DEFAULT now,
  updated_at TIMESTAMPTZ DEFAULT now
);

CREATE TABLE magazine_chunks (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  article_id UUID NOT NULL REFERENCES magazine_articles(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  page_number INTEGER,
  embedding VECTOR(1024),
  embedding_model TEXT NOT NULL DEFAULT 'voyage-3-large',
  embedding_dimension INTEGER NOT NULL DEFAULT 1024,
  embedded_at TIMESTAMPTZ DEFAULT now,
  content_hash TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now,
  UNIQUE(article_id, chunk_index)
);

CREATE INDEX idx_magazine_chunks_embedding ON magazine_chunks
  USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
-- BM25 index via pg_search (FTR-025) replaces tsvector; created by pg_search CREATE INDEX
CREATE INDEX idx_magazine_chunks_language ON magazine_chunks(language);
```

### Navigation

```
Search · Books · Videos · Magazine · Quiet · About
```

"Magazine" added to primary navigation between "Videos" and "Quiet".

### UI Pages

- `/magazine` — Landing page: latest issue (cover + table of contents), browse by year, "Yogananda's Magazine Writings" index
- `/magazine/{issue-slug}` — Single issue: cover, editorial note, article list with author types (e.g., `/magazine/2025-spring`)
- `/magazine/{issue-slug}/{article-slug}` — Article reader: same reader component as books, with author byline and issue citation

### API Endpoints

```
GET /api/v1/magazine/issues              → Paginated issue list
GET /api/v1/magazine/issues/{slug}       → Single issue (metadata + article summaries)
GET /api/v1/magazine/issues/{slug}/pdf   → Issue PDF (pre-rendered)
GET /api/v1/magazine/articles            → Paginated article list (filterable by issue_id, author_type, language)
GET /api/v1/magazine/articles/{slug}     → Single article with chunks
GET /api/v1/magazine/articles/{slug}/pdf → Article PDF
```

See FTR-155 for rationale on flat articles list vs. nested sub-collection route.

### Search Integration

The `hybrid_search` function extends to query `magazine_chunks` alongside `book_chunks`, filtering uniformly on `author_tier` across both sources (generated column on `magazine_articles` maps `author_type` to tier). Default `author_tier=guru,president` — Yogananda's words are always primary. Specify `author_tier=guru,president,monastic` to include monastic articles.

### Magazine ↔ "What Is Humanity Seeking?" Symbiosis

The public `/seeking` dashboard links to published magazine features: "Read the full analysis in Self-Realization Magazine →". The magazine publishes a curated narrative drawn from the portal's aggregated search data. Each amplifies the other.

### Scheduling

- Schema and ingestion pipeline: Arc 4 (alongside chapter/book PDF infrastructure)
- Magazine browsing UI: Arc 4
- Search integration (Yogananda's articles): Arc 4
- Magazine ↔ "What Is Humanity Seeking?" symbiosis: Arc 4

### Consequences

- Three new tables: `magazine_issues`, `magazine_articles`, `magazine_chunks`
- `magazine_chunks` participates in `chunk_relations` (or `content_relations` post-Arc 6) graph
- `hybrid_search` extended to include magazine chunks
- Navigation updated: "Magazine" added between "Videos" and "Quiet"
- Magazine ingestion pipeline mirrors book ingestion (PDF → chunk → embed → QA)
- Content availability: depends on SRF providing digital magazine archives
- Access level support: some issues may be subscriber-only (`access_level = 'subscriber'`), gated via Auth0 in Milestone 7a+
- **Extends FTR-120** (content scope) to include magazine content
- **Extends FTR-015** (API-first) with magazine endpoints
