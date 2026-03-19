---
ftr: 87
title: API Route Rationalization
summary: "Five targeted fixes for consistent identifiers, namespaces, and CRUD across all API routes"
state: implemented
domain: operations
governed-by: [PRI-11]
depends-on: [FTR-015]
---

# FTR-087: API Route Rationalization

## Rationale

### FTR-087: Cross-API Route Rationalization — Consistent Identifiers, Consolidated Namespaces, Complete CRUD

**Status:** Accepted
**Date:** 2026-02-22
**Deciders:** Architecture team
**Context:** FTR-133 (PDF routes), FTR-030 (chunk relations), FTR-142 (video integration), FTR-142 (audio), FTR-155 (magazine API rationalization)

#### Context

A cross-API review after FTR-155 (magazine rationalization) revealed five inconsistencies that accumulated as different content types were designed in separate ADRs:

1. **Chapter sub-resources split across two URL namespaces.** Chapter content lives at `/api/v1/books/[slug]/chapters/[number]`, but thread and relations endpoints broke out to a top-level `/api/v1/chapters/[slug]/[number]/`. Same resource, two URL patterns.

2. **Video endpoints use `{id}` while every other resource uses `{slug}`.** The `videos` table has `slug TEXT NOT NULL UNIQUE`, but FTR-133 and FTR-142 defined transcript endpoints as `/api/v1/videos/{id}/transcript`. Audio uses `{slug}` for the identical pattern.

3. **The legacy design document referenced a rejected PDF namespace.** A former sharing section (DES-018, since deleted) used `/api/v1/pdf/passage/{chunk-id}`, `/api/v1/pdf/chapter/{book-slug}/{chapter}`, `/api/v1/pdf/book/{book-slug}` — a parallel namespace that FTR-133 explicitly rejected under "Why Not `/api/v1/pdf/books/{slug}`".

4. **Audio and video lack single-resource detail endpoints.** Every other content type (books, images, people, glossary, ontology, places, magazine issues/articles) has a `GET /resource/{slug}` detail endpoint. Audio and video only had list + transcript sub-resources.

5. **Books lack a single-resource detail endpoint.** `GET /api/v1/books` (list) and `GET /api/v1/books/[slug]/chapters/[number]` (chapter content) exist, but no `GET /api/v1/books/{slug}` for book metadata with chapter index. The book landing page (`/books/[slug]`) needs this data.

#### Decision

Apply five targeted fixes to bring the entire API surface into consistency.

**1. Consolidate chapter sub-resources under `/books/[slug]/chapters/[number]/`.**

```
GET /api/v1/books/[slug]/chapters/[number]            — chapter content
GET /api/v1/books/[slug]/chapters/[number]/pdf         — chapter PDF
GET /api/v1/books/[slug]/chapters/[number]/thread      — reading thread
GET /api/v1/books/[slug]/chapters/[number]/relations   — batch relation prefetch
```

The top-level `/api/v1/chapters/` namespace is eliminated. Chapters are subordinate to books — they're not independently addressable. A developer who discovers `/books/autobiography/chapters/3` can append `/thread` or `/relations` without learning a second URL pattern.

**2. Video endpoints use `{slug}`, not `{id}`.**

```
GET /api/v1/videos/{slug}                  — video detail (NEW)
GET /api/v1/videos/{slug}/transcript       — transcript JSON
GET /api/v1/videos/{slug}/transcript/pdf   — transcript PDF
```

Matches audio (`/api/v1/audio/{slug}/transcript`) and every other resource in the API. The `videos` table already has `slug TEXT NOT NULL UNIQUE`.

**3. Legacy PDF references corrected to match FTR-133.**

The sharing section's `/api/v1/pdf/passage/{chunk-id}` references are replaced with resource-anchored routes per FTR-133's established pattern. Single-passage PDFs use `POST /api/v1/exports/pdf` with a single-item body.

**4. Audio and video gain detail endpoints.**

```
GET /api/v1/audio/{slug}    — recording metadata (speaker, duration, type, etc.)
GET /api/v1/videos/{slug}   — video metadata (platform, speakers, duration, etc.)
```

Both schemas have rich metadata that the frontend detail pages need. These follow the same pattern as `GET /api/v1/images/{slug}`, `GET /api/v1/people/[slug]`, etc.

**5. Books gain a detail endpoint.**

```
GET /api/v1/books/{slug}    — book metadata + chapter index
```

Returns title, author, description, cover image, publication year, bookstore URL, available languages, and chapter list (number + title). Serves the book landing page (`/books/[slug]`). Eliminates the tentative note about "a new endpoint or `?include=chapters`" in the book landing page design.

#### Not Changed

- **`/api/v1/videos/latest` and `/api/v1/videos/catalog`** remain as-is. These are STG-005 YouTube-proxy convenience endpoints. When videos become database-backed in future stages, the main `GET /api/v1/videos` endpoint with query parameters supersedes them. Premature to rationalize a transitional design.

- **Nested routes where nesting is correct.** `/books/[slug]/chapters/[number]`, `/themes/[slug]/passages`, `/people/[slug]/passages`, `/images/{slug}/related` — these nest a subordinate or relationship resource under its parent. The nesting is appropriate and stays.

#### Consequences

- The top-level `/api/v1/chapters/` namespace no longer exists — all chapter sub-resources live under `/api/v1/books/[slug]/chapters/[number]/`
- All video endpoints use `{slug}`, consistent with every other resource
- PDF routes consolidated under FTR-133-compliant resource-anchored pattern (former DES-018 sharing section deleted)
- Three new detail endpoints: `GET /api/v1/books/{slug}`, `GET /api/v1/audio/{slug}`, `GET /api/v1/videos/{slug}`
- Cache table gains entries for all new detail endpoints
- Service layer gains `getBook(slug)`, `getRecording(slug)`, `getVideo(slug)` functions
- ROADMAP.md STG-008 deliverable updated to use consolidated chapter URLs

---

### FTR-087: Timestamp Filtering on List Endpoints — Incremental Sync for Automation Consumers

**Status:** Accepted
**Date:** 2026-02-22
**Deciders:** Architecture team
**Context:** FTR-015 (API-first), FTR-086 (outbound webhooks), FTR-059 (machine readability), FTR-097 (rate limiting)

#### Context

Outbound webhooks (FTR-086) solve the "push" problem — subscribers learn about new content immediately. But webhooks are not perfectly reliable. A subscriber might miss events during downtime, a Zapier workflow might be paused and resumed, or a new consumer might need to backfill historical changes. The standard REST solution is timestamp-based filtering: "give me everything that changed since my last sync."

Current list endpoints (`/api/v1/books`, `/api/v1/themes`, `/api/v1/passages`, etc.) return full collections with cursor-based pagination but no way to filter by recency. A Zapier polling trigger that wants "new books since yesterday" must fetch the entire book list and compare against its internal state. This is wasteful for the consumer and the portal's rate limits.

#### Decision

Add `updated_since` and `created_since` query parameters to all list endpoints that return content collections. These parameters accept ISO 8601 timestamps and filter results to items modified or created after the specified time.

#### Parameter Specification

```
GET /api/v1/books?updated_since=2026-03-01T00:00:00Z
GET /api/v1/themes?created_since=2026-03-15T12:00:00Z
GET /api/v1/audio?updated_since=2026-02-28T00:00:00Z&language=hi
```

| Parameter | Type | Behavior |
|-----------|------|----------|
| `updated_since` | ISO 8601 timestamp | Returns items where `updated_at > :timestamp` (includes both newly created and modified items) |
| `created_since` | ISO 8601 timestamp | Returns items where `created_at > :timestamp` (only newly created items, excludes updates to existing items) |

Both parameters:
- Are optional — omitting them returns the full collection (existing behavior unchanged)
- Compose with existing parameters (`language`, `book_id`, `category`, cursor pagination)
- Use strict greater-than (`>`) comparison, not greater-than-or-equal, to avoid re-fetching the boundary item
- Return results ordered by the filtered timestamp ascending (oldest first), which is the natural order for incremental sync

If both `updated_since` and `created_since` are provided, the API returns a 400 error — they represent different sync strategies and combining them is ambiguous.

#### Affected Endpoints

| Endpoint | `updated_since` | `created_since` | Notes |
|----------|:---:|:---:|-------|
| `GET /api/v1/books` | Yes | Yes | |
| `GET /api/v1/books/[slug]/chapters` | Yes | Yes | |
| `GET /api/v1/themes` | Yes | Yes | |
| `GET /api/v1/themes/[slug]/passages` | Yes | Yes | |
| `GET /api/v1/audio` | Yes | Yes | |
| `GET /api/v1/videos` | Yes | Yes | |
| `GET /api/v1/images` | Yes | Yes | |
| `GET /api/v1/people` | Yes | Yes | |
| `GET /api/v1/ontology` | Yes | No | Ontology terms are rarely updated; `created_since` suffices via `updated_since` |
| `GET /api/v1/magazine/issues` | Yes | Yes | |
| `GET /api/v1/magazine/articles` | Yes | Yes | |
| `GET /api/v1/collections` | Yes | Yes | Community collections (FTR-143) |

Not affected:
- `GET /api/v1/search` — query-driven, not collection-based
- `GET /api/v1/daily-passage` — returns a single item, not a collection
- `GET /api/v1/affirmations` — returns a single affirmation
- `GET /api/v1/health` — operational, not content
- `GET /api/v1/graph/*` — pre-computed, served from CDN
- `GET /api/v1/search/suggest` — autocomplete, not a syncable collection

#### Schema Requirement

All content tables must have both `created_at` and `updated_at` columns with indexes. The existing schema already includes `created_at` on most tables. This ADR requires:

1. **`updated_at` column** on all content tables that don't already have it.
2. **Database trigger** to automatically set `updated_at = now()` on every UPDATE.
3. **Composite index** on `(updated_at, id)` for efficient cursor pagination with timestamp filtering.

```sql
-- Example trigger (applied to all content tables)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Composite index for timestamp-filtered pagination
CREATE INDEX idx_books_updated_at ON books(updated_at, id);
CREATE INDEX idx_book_chunks_updated_at ON book_chunks(updated_at, id);
CREATE INDEX idx_teaching_topics_updated_at ON teaching_topics(updated_at, id);
```

#### Response Metadata

When timestamp filtering is active, the response includes sync metadata:

```json
{
  "results": [...],
  "sync": {
    "filtered_by": "updated_since",
    "since": "2026-03-01T00:00:00Z",
    "result_count": 3,
    "latest_timestamp": "2026-03-14T09:22:11Z"
  },
  "pagination": {
    "next_cursor": "..."
  }
}
```

The `latest_timestamp` field tells the consumer what value to use for their next `updated_since` call — enabling reliable incremental sync without clock drift issues.

#### Zapier Integration Pattern

Zapier's polling trigger model works naturally with `created_since`:

1. Zapier stores the `latest_timestamp` from the previous poll
2. On each poll interval, Zapier calls `GET /api/v1/books?created_since={latest_timestamp}`
3. If results are returned, Zapier triggers the workflow and updates its stored timestamp
4. If no results, Zapier does nothing

This turns Zapier from "fetch everything and deduplicate" to "fetch only what's new" — reducing API calls by orders of magnitude for stable content collections.

#### Relationship to Webhooks (FTR-086)

Webhooks and timestamp filtering serve complementary purposes:

| Scenario | Best Tool |
|----------|-----------|
| Real-time notification when content changes | Webhooks (FTR-086) |
| Catching up after missed webhooks or downtime | `updated_since` filtering |
| Initial backfill when a new consumer connects | `created_since` filtering |
| Zapier polling trigger (no webhook support) | `created_since` filtering |
| Verifying webhook data against source of truth | `updated_since` filtering |

A robust integration uses both: webhooks for real-time events, timestamp filtering for reconciliation.

#### Delivery Schedule

| Stage | What Ships |
|-----------|-----------|
| **STG-001** | `updated_at` columns and triggers on all content tables in the initial schema migration. No API filtering yet. |
| **STG-004** | `updated_since` and `created_since` parameters on `GET /api/v1/books` and `GET /api/v1/books/[slug]/chapters`. |
| **STG-007** | Timestamp filtering on theme endpoints (`/api/v1/themes`, `/api/v1/themes/[slug]/passages`). |
| **STG-008+** | Timestamp filtering on all remaining list endpoints as they ship. |

#### Consequences

- STG-001 schema migration adds `updated_at` columns and triggers to all content tables
- All list endpoints gain optional `updated_since` and `created_since` parameters as they ship
- Response envelope gains `sync` metadata when timestamp filtering is active
- OpenAPI spec (FTR-059) documents the filtering parameters on each endpoint
- Zapier polling triggers become efficient from STG-004
- Combined with FTR-086, the portal supports both push (webhooks) and pull (timestamp filtering) sync strategies

