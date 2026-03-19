---
ftr: 15
title: API-First Architecture for Platform Parity
summary: "Shared service layer in /lib/services/ with versioned REST endpoints under /api/v1/"
state: implemented
domain: foundation
governed-by: [PRI-10, PRI-11]
always-load: true
---

# FTR-015: API-First Architecture

## Rationale

- **Date:** 2026-02-17

### Context

The SRF already has a native mobile app (iOS/Android) with an eReader. While a dedicated teaching portal mobile app is not planned, the portal's API surface will likely be consumed by native apps eventually — either a standalone portal app, integration into the existing SRF app, or both.

Next.js encourages a pattern where business logic lives inside React Server Components. This is convenient for web development but creates a platform lock: Server Components are callable only by the Next.js rendering pipeline, not by a mobile app, a third-party integration, or a PWA Service Worker.

If business logic migrates into Server Components during Stages 1a–5b, extracting it later into a proper API layer is a significant refactoring effort. The cost of API-first discipline from day one is near zero; the cost of retrofitting is high.

### Decision

Adopt **API-first architecture** with a **shared service layer** from STG-001. Every user-facing feature must have both a callable service function and a REST API endpoint.

#### 1. Shared Service Layer

All business logic lives in `/lib/services/` as plain TypeScript functions:

```
/lib/services/
 search.ts → findPassages(query, language, options)
 daily-passage.ts → getDailyPassage(date, language)
 themes.ts → getThemes(language), getThemePassages(slug, language, limit)
 books.ts → getBooks(language), getChapter(bookSlug, chapterNumber, language)
 quiet.ts → getAffirmation(language)
```

**Server Components** call service functions directly (in-process, no HTTP overhead).
**API routes** call the same service functions and return JSON.
**Mobile apps** (future) call the API routes.

This is a code organization rule, not a technology choice. The rule: **never put business logic in a Server Component or a Route Handler that doesn't delegate to a service function.**

#### 2. API Versioning

All API routes use a versioned prefix from STG-001:

```
/api/v1/search
/api/v1/daily-passage
/api/v1/themes/[slug]/passages
/api/v1/books/[slug]/chapters/[number]
/api/v1/affirmations
/api/v1/og/[chunk-id]
/api/v1/email/subscribe
```

When the API evolves, `/api/v2/` coexists with `/api/v1/`. The web frontend always uses the latest version. Mobile apps pin to the version they were built against. Old versions are deprecated with notice, not removed without warning.

#### 3. Authentication: Public by Default

**All API routes are public through STG-023.** No authentication required. The portal's core mission is frictionless access to the teachings — adding "Sign in" contradicts this.

What auth would serve, and how it's handled without it:

| Need | Solution Without Auth |
|------|----------------------|
| Rate limiting | Vercel Firewall edge rate limiting |
| Bookmarks, reading position | `localStorage` (FTR-046) — private, no server |
| Email subscription | Token-based confirm/unsubscribe (no user accounts) |
| Admin dashboards | Retool has its own auth |
| Content protection | Not needed — the mission is free access |

**STG-023+ (if needed):** When optional accounts are introduced for cross-device sync, evaluate the lightest mechanism that serves the need (magic links, passkeys, or Auth0 if SSO with other SRF properties is required). Public search and reading remain unauthenticated regardless. Auth is additive middleware on specific protected endpoints — never a gate on reading or search.

#### 4. Cursor-Based Pagination

Every endpoint returning a list uses cursor-based pagination:

```json
{
 "results": [...],
 "cursor": "eyJpZCI6MTIzfQ",
 "hasMore": true
}
```

Not page-number pagination (`page=2&limit=10`), which is fragile when data changes between requests. Cursors are stable across inserts and deletes — essential for mobile infinite scroll and pull-to-refresh patterns.

#### 5. Cache-Control Headers

Explicit HTTP caching directives on every API response:

| Endpoint | Cache Strategy |
|----------|---------------|
| `/api/v1/daily-passage` | `max-age=3600` (1 hour — passage changes daily, but not every second) |
| `/api/v1/books/[slug]/chapters/[number]` | `max-age=86400, stale-while-revalidate=604800` (book text rarely changes) |
| `/api/v1/search` | `no-store` (query-dependent, not cacheable) |
| `/api/v1/themes/[slug]/passages` | `max-age=3600` (theme curation changes infrequently) |
| `/api/v1/affirmations` | `max-age=300` (5 min — affirmation rotates but isn't time-critical) |

Mobile apps get intelligent caching for free. The web frontend benefits from the same headers.

#### 6. Deep Link Readiness

Passage URLs (`/passage/[chunk-id]`) are already designed for universal link interception. When a native app is registered:

- **iOS:** `apple-app-site-association` file at domain root maps `/passage/*` to the app
- **Android:** `assetlinks.json` at `/.well-known/` maps the same

The URL structure is decided now. The association files are added when the app launches.

### Rationale

- **Zero marginal cost.** Service layer extraction, API versioning, and cache headers are conventions, not infrastructure. They cost minutes to implement in STG-001 and save weeks of refactoring later.
- **Multiple consumers are likely.** Even without a native app, the API may be consumed by: a PWA Service Worker (offline reading), the SRF mobile app team, a future admin dashboard, or third-party integrations (with SRF authorization).
- **SRF ecosystem alignment.** The existing SRF mobile app may want to incorporate portal search or daily passage features. A clean API makes this a simple integration rather than a rewrite.
- **Developer discipline is cheaper than developer heroics.** Establishing the pattern on day one (when the codebase is small) prevents the gradual drift that makes refactoring painful.

### Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| **Build API later when mobile is planned** | Simpler codebase initially; YAGNI argument | Extracting logic from Server Components is expensive; API shape is influenced by existing code rather than consumer needs |
| **GraphQL instead of REST** | Single flexible endpoint; mobile apps request exactly what they need | Over-engineering for this corpus size; steeper learning curve; REST is simpler for SRF's team |
| **tRPC** | Type-safe API layer shared between Next.js client and server | Couples API to TypeScript consumers; not usable by native mobile apps or external integrations |

### Consequences

- STG-001 API routes use `/api/v1/` prefix
- All features implemented via `/lib/services/` functions first, then exposed via Server Components and API routes
- API routes are public (no auth) through STG-023; auth middleware added only if/when STG-023 accounts are implemented
- List endpoints return cursor-based pagination
- Cache-Control headers on all API responses
- PWA readiness added to roadmap (STG-005)
- Stakeholder question: does the portal get its own mobile app, or do features integrate into the existing SRF app?

## Specification

All API routes use a versioned prefix (`/api/v1/`) from STG-001 per FTR-015. Language is passed as a query parameter on API routes (`?language=hi`), not as a path prefix — language is a property of content, not a namespace for operations (FTR-058). Frontend pages use locale path prefixes (`/hi/themes/peace`) for SEO and `hreflang` linking. This enables mobile apps pinned to older API versions to coexist with the evolving web frontend. List endpoints use cursor-based pagination for mobile compatibility.

### Design Rationale

The API surface exists to make the teachings findable by machines — mobile apps, messaging bots, MCP consumers, Zapier workflows, and future integrations we can't predict (FTR-015). Every design choice serves the 10-year horizon (FTR-004): versioning provides room to evolve without breaking consumers, cursor-based pagination handles data changes gracefully across editions and re-ingestion, and the shared service layer (`/lib/services/`) ensures that the API is never a second-class citizen behind Server Components. The language-as-parameter convention (FTR-058) was chosen because language is a *content filter*, not an operation namespace — the same endpoint returns the same shape regardless of language, and mobile apps pinned to `/api/v1/` never need to know about locale path conventions. The contemplative error messages (FTR-054) apply here because the API is not only consumed by code — seekers see error states in the UI, and those states should carry the same care as the rest of the portal.

### API Conventions

**Field naming: `snake_case`.** All JSON response fields use `snake_case`, matching PostgreSQL column naming and providing consistency across the API surface. Examples: `chunk_id`, `book_title`, `page_number`, `reader_url`, `has_more`, `total_count`. TypeScript interfaces in `/lib/services/` use `camelCase` internally; the API route layer transforms at the boundary.

**Resource identifiers.** Resources use the identifier type natural to their domain:
- **Books** use slugs (human-readable, SEO-friendly): `/api/v1/books/autobiography-of-a-yogi`
- **Chapters** use numbers within their book: `/api/v1/books/{slug}/chapters/26`
- **Passages** use UUIDs (stable across re-ingestion via content-hash fallback, FTR-132): `/api/v1/passages/{uuid}`
- **Themes** use English slugs (stable across locales, FTR-058): `/api/v1/themes/peace`
- **People, places, glossary terms** use slugs: `/api/v1/people/sri-yukteswar`, `/api/v1/glossary/samadhi`

**Response envelope.** List endpoints follow one of two patterns:

*Paginated lists* (theme passages, books with sync, editorial threads, magazine articles):
```json
{
  "data": [...],
  "pagination": { "cursor": "opaque_value", "has_more": true },
  "meta": { "total_count": 47 }
}
```
When timestamp filtering is active (FTR-087), responses include `sync` metadata in `meta`:
```json
{
  "meta": {
    "sync": {
      "filtered_by": "updated_since",
      "since": "2026-03-01T00:00:00Z",
      "result_count": 3,
      "latest_timestamp": "2026-03-14T09:22:11Z"
    }
  }
}
```

*Complete collections* (themes list, books list, glossary) where the full set fits in one response:
```json
{
  "data": [...],
  "meta": { "total_count": 12 }
}
```

*Single resource* endpoints return the resource object directly (no `data` wrapper):
```json
{
  "id": "uuid",
  "title": "Autobiography of a Yogi",
  "slug": "autobiography-of-a-yogi",
  ...
}
```

**Search is intentionally unpaginated.** The search endpoint returns the best-ranked results (default 5, max 20) with no cursor or `has_more`. This is deliberate: the AI librarian returns the *most relevant* passages, not a paginated result set to browse. Pagination would imply browsing a corpus dump, which contradicts the librarian metaphor (FTR-001). If a seeker needs broader exploration, theme pages and the `/browse` index serve that purpose.

**`exclude` parameter.** Endpoints that support "show me another" behavior accept an `exclude` query parameter (a resource ID to omit from results). Used on `/api/v1/daily-passage` and `/api/v1/affirmations` for repeat-free refresh without client-side deduplication.

### Error Response Contract

All API endpoints return errors in a consistent JSON format:

```typescript
interface ErrorResponse {
 error: string; // Machine-readable code (e.g., "RATE_LIMITED", "NOT_FOUND", "INVALID_PARAMETER")
 message: string; // Human-readable description (compassionate tone per DELTA Love principle)
 request_id: string; // UUID for Sentry correlation and support debugging
}
```

| Status | Code | When |
|--------|------|------|
| 400 | `INVALID_PARAMETER` | Missing required parameter, invalid cursor, malformed query |
| 404 | `NOT_FOUND` | Book, chapter, chunk, theme, or place does not exist |
| 429 | `RATE_LIMITED` | Rate limit exceeded. Response includes `Retry-After` header (seconds) |
| 500 | `INTERNAL_ERROR` | Unexpected failure. Logged to Sentry with `request_id` |

Error messages use the same compassionate, clear language as the rest of the portal. Example: `"We couldn't find that passage. It may have been moved when a new edition was added."` — never terse HTTP-speak.

### `GET /api/v1/search`

```
Query params:
 q (required) — user's search query
 language (optional) — default 'en'
 book_id (optional) — restrict to a specific book
 author_tier (optional) — comma-separated: 'guru', 'president', 'monastic'.
   Default: 'guru,president'. Specify 'guru,president,monastic' to include all tiers. (FTR-001)
 limit (optional) — default 5, max 20
 mode (optional) — 'hybrid' (default), 'fts', 'vector'

Response (intentionally unpaginated — see § API Conventions):
{
 "query": "How do I overcome fear?",
 "data": [
 {
 "chunk_id": "uuid",
 "content": "The soul is ever free; it is deathless...",
 "author": "Paramahansa Yogananda",
 "book_title": "Autobiography of a Yogi",
 "chapter_title": "The Law of Miracles",
 "chapter_number": 26,
 "page_number": 312,
 "section_heading": null,
 "author_tier": "guru",
 "score": 0.87,
 "reader_url": "/books/autobiography-of-a-yogi/26#chunk-uuid"
 },
 ...
 ],
 "meta": { "total_count": 5 }
}
```

### `GET /api/v1/daily-passage`

```
Query params:
 language (optional) — default 'en'

Response:
{
 "chunk_id": "uuid",
 "content": "Have courage. Whatever you are going through will pass...",
 "author": "Paramahansa Yogananda",
 "book_title": "Where There Is Light",
 "chapter_title": "Courage",
 "page_number": 42,
 "author_tier": "guru",
 "reader_url": "/books/where-there-is-light/3#chunk-uuid"
}

Implementation:
 SELECT bc.id, bc.content, b.author, b.title, ch.title, bc.page_number, b.author_tier
 FROM daily_passages dp
 JOIN book_chunks bc ON bc.id = dp.chunk_id
 JOIN books b ON b.id = bc.book_id
 LEFT JOIN chapters ch ON ch.id = bc.chapter_id
 WHERE dp.is_active = true
 AND b.author_tier = 'guru' -- FTR-001: only guru tier in daily pool
 AND bc.language = :language -- filter to user's locale
 ORDER BY random()
 LIMIT 1;

 English fallback: if no results for user's language, re-query with
 language='en' and mark response with "fallback_language": "en".

 Optional seasonal weighting: if current month maps to a season,
 prefer passages with matching season_affinity (60/40 weighted random).
```

### `GET /api/v1/themes`

```
Query params:
 language (optional) — default 'en'. Returns localized theme names
 from topic_translations if available;
 falls back to English name if no translation exists.
 category (optional) — 'quality', 'situation', 'person', 'principle',
 'scripture', 'practice', 'yoga_path', or omit for all. (FTR-121, FTR-122)
 Homepage "Doors of Entry" uses category=quality.
 "Explore all themes" page omits this parameter.

Response (complete collection — see § API Conventions):
{
 "data": [
 {
 "id": "uuid",
 "name": "Paz",
 "slug": "peace",
 "category": "quality",
 "header_quote": "Sé tan sencillo como puedas; te asombrará...",
 "header_citation": "Autobiografía de un Yogui, Capítulo 12"
 },
 ...
 ],
 "meta": { "total_count": 12 }
}

Implementation:
 SELECT lt.id, lt.slug, lt.category, lt.sort_order,
 COALESCE(ltt.name, lt.name) AS name,
 COALESCE(ltt.header_quote, lt.header_quote) AS header_quote,
 COALESCE(ltt.header_citation, lt.header_citation) AS header_citation
 FROM teaching_topics lt
 LEFT JOIN topic_translations ltt
 ON ltt.theme_id = lt.id AND ltt.language = :language
 WHERE (:category IS NULL OR lt.category = :category)
 ORDER BY lt.category, lt.sort_order;
```

### `GET /api/v1/themes/{slug}`

Returns metadata for a single theme.

Response (single resource — see § API Conventions):

```json
{
  "id": "uuid",
  "name": "Peace",
  "slug": "peace",
  "description": "Yogananda's teachings on inner peace...",
  "category": "quality",
  "passage_count": 47,
  "language": "en",
  "created_at": "2026-03-01T00:00:00Z",
  "updated_at": "2026-03-15T12:00:00Z"
}
```

### `GET /api/v1/themes/[slug]/passages`

```
Query params:
 language (optional) — default 'en'. Filters passages to user's locale.
 If fewer than 5 results, supplements with English
 passages marked with fallback_language.
 limit (optional) — default 8, max 20
 cursor (optional) — opaque cursor from previous response
 shuffle (optional) — if true, returns a random selection (default for first request)

Response (paginated list — see § API Conventions):
{
 "theme": "Peace",
 "data": [
 {
 "chunk_id": "uuid",
 "content": "The verbatim passage text...",
 "book_title": "Man's Eternal Quest",
 "chapter_title": "How to Have Courage",
 "page_number": 187,
 "reader_url": "/books/mans-eternal-quest/12#chunk-uuid"
 },
 ...
 ],
 "pagination": { "cursor": "eyJpZCI6MTIzfQ", "has_more": true },
 "meta": { "total_count": 47 }
}

Implementation:
 Default (no cursor): randomly samples from theme-tagged chunks.
 With cursor: returns next page in stable order.
 "Show more" uses cursor from previous response.
 No user-specific personalization.
 Only serves tags with tagged_by IN ('manual', 'reviewed') — never 'auto'.
```

### `GET /api/v1/affirmations`

```
Query params:
 language (optional) — default 'en'
 exclude (optional) — affirmation ID to exclude (for "show me another")

Response:
{
 "affirmation_id": "uuid",
 "content": "I am submerged in eternal light...",
 "book_title": "Scientific Healing Affirmations",
 "page_number": 23,
 "section_heading": "Healing Affirmations"
}

Implementation:
 SELECT id, content, book_title, page_number, section_heading
 FROM affirmations
 WHERE is_active = true
 AND language = :language
 AND (:exclude IS NULL OR id != :exclude)
 ORDER BY random()
 LIMIT 1;

 Fallback: if no affirmations in user's language, return English.
```

### `GET /api/v1/books`

```
Query params:
 language (optional) — default 'en'. Returns books available in user's locale.
 STG-021: also returns an "also_available_in_english"
 section for untranslated works (per FTR-058).

Response (complete collection — see § API Conventions):
{
 "data": [
 {
 "id": "uuid",
 "title": "Autobiography of a Yogi",
 "subtitle": null,
 "author": "Paramahansa Yogananda",
 "publication_year": 1946,
 "cover_image_url": "...",
 "chapter_count": 48,
 "slug": "autobiography-of-a-yogi",
 "available_languages": ["en", "es", "de", "fr", "it", "pt", "ja", "th", "hi", "bn"]
 }
 ],
 "also_available_in_english": [...],
 "meta": { "total_count": 1 }
}

Implementation:
 Primary: SELECT ... FROM books WHERE language = :language
 Also available: SELECT ... FROM books b
 WHERE b.language = 'en'
 AND b.id NOT IN (
 SELECT canonical_book_id FROM books WHERE language = :language
 AND canonical_book_id IS NOT NULL
)
 available_languages: derived from books grouped by canonical_book_id
```

### `GET /api/v1/books/{slug}`

```
Response:
{
 "id": "uuid",
 "title": "Autobiography of a Yogi",
 "subtitle": null,
 "author": "Paramahansa Yogananda",
 "slug": "autobiography-of-a-yogi",
 "publication_year": 1946,
 "cover_image_url": "...",
 "description": "A spiritual classic...",
 "bookstore_url": "https://bookstore.yogananda.org/...",
 "available_languages": ["en", "es", "de", "fr", "it", "pt", "ja", "th", "hi", "bn"],
 "chapters": [
   { "number": 1, "title": "My Parents and Early Life" },
   { "number": 2, "title": "My Mother's Death and the Mystic Amulet" },
   ...
 ]
}

Cache-Control: max-age=86400, stale-while-revalidate=604800
```

### `GET /api/v1/books/[slug]/chapters/[number]`

```
Response:
{
 "book_title": "Autobiography of a Yogi",
 "chapter_number": 26,
 "chapter_title": "The Law of Miracles",
 "paragraphs": [
 {
 "chunk_id": "uuid",
 "content": "Full paragraph text...",
 "page_number": 310,
 "paragraph_index": 0
 },
 ...
 ],
 "prev_chapter": 25,
 "next_chapter": 27
}
```

### `GET /api/v1/passages/[passage-id]/related`

```
Query params:
 limit (optional) — default 3, max 20
 book_id (optional) — filter to a specific book
 language (optional) — filter to a specific language
 theme_id (optional) — filter to a specific teaching topic
 exclude_book_id (optional) — exclude a specific book (typically current book)

Response:
{
 "source_chunk_id": "uuid",
 "data": [
 {
 "chunk_id": "uuid",
 "content": "The verbatim passage text...",
 "book_title": "Man's Eternal Quest",
 "chapter_title": "How to Have Courage",
 "chapter_number": 12,
 "page_number": 201,
 "similarity": 0.89,
 "reader_url": "/books/mans-eternal-quest/12#chunk-uuid"
 },
 ...
 ],
 "meta": { "total_available": 27, "source": "precomputed" }
}

Implementation:
 1. Query chunk_relations WHERE source_chunk_id = :id
 ORDER BY rank, with optional JOINs for filtering
 2. If filtered results < limit, fall back to real-time
 vector similarity query with WHERE clauses
 3. Response includes "source" field indicating whether
 results are from precomputed table or realtime fallback

Cache-Control: max-age=86400, stale-while-revalidate=604800
 (relations are stable; only change when new content is ingested)
```

### `GET /api/v1/books/[slug]/chapters/[number]/thread`

```
Response:
{
 "book_title": "Autobiography of a Yogi",
 "chapter_number": 14,
 "chapter_title": "An Experience in Cosmic Consciousness",
 "data": [
 {
 "chunk_id": "uuid",
 "content": "The soul's nature is infinite bliss...",
 "book_title": "The Divine Romance",
 "chapter_title": "The Nature of the Soul",
 "page_number": 142,
 "max_similarity": 0.91,
 "reader_url": "/books/the-divine-romance/8#chunk-uuid"
 },
 ...
 ],
 "meta": { "themes": ["cosmic consciousness", "the soul", "meditation"] }
}

Implementation:
 1. Get all chunk_ids for the given chapter
 2. Query chunk_relations for all those source_chunk_ids
 3. Filter to other books only
 4. Aggregate by target_chunk_id, take MAX(similarity)
 5. Deduplicate, rank by max_similarity, take top 3
 6. Extract prominent themes from chunk_topics for intro text

Cache-Control: max-age=86400, stale-while-revalidate=604800
```

### Timestamp Filtering on List Endpoints (FTR-087)

All list endpoints that return content collections support optional `updated_since` and `created_since` query parameters for incremental sync. These enable automation consumers (Zapier, Lambda, partner integrations) to fetch only what changed since their last poll — reducing API calls by orders of magnitude for stable collections.

```
GET /api/v1/books?updated_since=2026-03-01T00:00:00Z
GET /api/v1/themes?created_since=2026-03-15T12:00:00Z&language=hi
GET /api/v1/audio?updated_since=2026-02-28T00:00:00Z
```

- `updated_since` — items where `updated_at > :timestamp` (new + modified)
- `created_since` — items where `created_at > :timestamp` (new only)
- Mutually exclusive — providing both returns 400
- Results ordered by filtered timestamp ascending (natural incremental sync order)

When active, responses include `sync` metadata within `meta` for the consumer's next call:

```json
{
  "data": [...],
  "pagination": { "cursor": "...", "has_more": true },
  "meta": {
    "sync": {
      "filtered_by": "updated_since",
      "since": "2026-03-01T00:00:00Z",
      "result_count": 3,
      "latest_timestamp": "2026-03-14T09:22:11Z"
    }
  }
}
```

See FTR-087 for the full endpoint coverage table, schema requirements (`updated_at` columns and triggers on all content tables), and phasing.
