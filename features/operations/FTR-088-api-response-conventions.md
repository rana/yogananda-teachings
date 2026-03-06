# FTR-088: API Response Conventions

> **State:** Approved
> **Domain:** operations
> **Arc:** 1+
> **Governed by:** PRI-10, PRI-11
> **Replaces:** FTR-088

## Rationale

**Status:** Accepted | **Date:** 2026-02-22

**Relates to:** FTR-015, FTR-058, FTR-087, FTR-087, FTR-015

### Context

FTR-015 specifies individual API endpoints with inline response examples. As the endpoint count grew from Arc 1's initial set (~8 endpoints) through cross-media expansion (Arc 6: ~30+ endpoints), three categories of response convention accumulated implicitly without being declared:

1. **Field naming.** Some response examples used `snake_case` (matching PostgreSQL column names), others appeared to use `camelCase` (matching TypeScript conventions). The `hasMore` field in pagination sat alongside `book_title` and `results_count` — a silent inconsistency.

2. **Response envelopes.** List endpoints used inconsistent top-level keys: search returned `{ results: [...] }`, themes returned `{ themes: [...] }`, related returned `{ related: [...] }`. Pagination fields (`cursor`, `hasMore`) were mixed into the top level of some responses but absent from others. Sync metadata (FTR-087) added another top-level key. A mobile developer consuming three endpoints would learn three different shapes.

3. **Resource identifiers.** Books use slugs, chunks use UUIDs, chapters use numbers — each defensible individually, but the pattern was unstated. A developer couldn't predict whether a new endpoint would use slugs or UUIDs without reading the example.

Without explicit conventions, each new endpoint or milestone adds entropy. A 10-year API surface (FTR-004) requires declared standards, not emergent patterns.

### Decision

#### 1. Field naming: `snake_case`

All JSON response fields use `snake_case`. This aligns with PostgreSQL column naming (the source of truth for most response fields) and avoids ambiguity. The service layer (`/lib/services/`) uses TypeScript `camelCase` internally; the API route layer transforms at the boundary via a standard serialization utility.

**Rationale:** `camelCase` is conventional in JavaScript ecosystems, but `snake_case` eliminates the mental translation between database columns and API fields — important for a small team maintaining both layers. PostgreSQL is the 10-year commitment (FTR-004); JavaScript framework conventions may change.

#### 2. Response envelope: `data` / `pagination` / `meta`

Three response shapes, consistently applied:

**Paginated lists** (any endpoint returning a subset of a larger collection):
```json
{
  "data": [...],
  "pagination": { "cursor": "opaque_value", "has_more": true },
  "meta": { "total_count": 47 }
}
```

**Complete collections** (full set fits in one response):
```json
{
  "data": [...],
  "meta": { "total_count": 12 }
}
```

**Single resources** (no wrapper — the object *is* the response):
```json
{
  "id": "uuid",
  "title": "Autobiography of a Yogi",
  ...
}
```

Top-level context fields (e.g., `query` on search, `theme` on theme passages, `source_chunk_id` on related passages) remain at the top level alongside `data`. Sync metadata (FTR-087) nests under `meta.sync`. Endpoint-specific metadata (e.g., `source: "precomputed"` on related passages) nests under `meta`.

**Rationale:** The `data`/`pagination`/`meta` pattern is well-established (JSON:API, Stripe, many public APIs). It separates *what you asked for* (`data`) from *how to get more* (`pagination`) from *information about the response* (`meta`). Mobile developers can write a single pagination handler for all paginated endpoints.

#### 3. Resource identifiers: three types, declared

| Identifier Type | Used For | Why |
|---|---|---|
| **Slug** (kebab-case string) | Books, themes, people, places, glossary terms, audio, video, magazine articles | Human-readable, SEO-friendly, stable across editions. Theme slugs are English regardless of locale (FTR-058). |
| **UUID** | Chunks (passages), relations, internal entities | Stable across re-ingestion via content-hash fallback (FTR-132). Not human-readable by design — passages are addressed by their content, not their name. |
| **Number** (within parent) | Chapters within a book, paragraphs within a chapter | Natural ordering. Always nested under a parent slug: `/books/{slug}/chapters/{number}`. |

New endpoints must use the identifier type matching their resource category.

#### 4. Search is intentionally unpaginated

The search endpoint returns ranked results (default 5, max 20) with no `pagination` block. This is deliberate: the AI librarian returns the *best* answers, not a corpus to browse. Pagination would imply exhaustive result sets, contradicting the librarian model (FTR-001). Seekers wanting broader exploration use theme pages, the `/browse` index, or the Knowledge Graph.

#### 5. `exclude` parameter for refresh behavior

Endpoints supporting "show me another" (random single-item responses) accept an `exclude` query parameter — the ID of the item to omit. Prevents repeat-on-refresh without client-side deduplication. Applied to: `/api/v1/daily-passage`, `/api/v1/affirmations`.

### Alternatives Considered

1. **`camelCase` for JSON fields.** Conventional in JavaScript but creates a translation layer between PostgreSQL columns and API responses. For a small team with a single database, matching the database is simpler.

2. **Resource-specific top-level keys (`books`, `themes`, `related`).** More semantically descriptive but forces clients to know the key name per endpoint. `data` is generic and predictable.

3. **HAL or JSON:API full compliance.** These standards add hypermedia links (`_links`, `relationships`) that the portal doesn't need — the API is consumed by known clients, not discovered dynamically.

### Consequences

- FTR-015 response examples updated to use the `data`/`pagination`/`meta` envelope and `snake_case` fields.
- All future endpoint specifications must follow these conventions.
- Existing endpoint examples in DESIGN.md that predate this ADR have been retroactively updated.
- A `serializeResponse()` utility in `/lib/services/` handles `camelCase` → `snake_case` transformation at the API boundary.
- Mobile app developers can write generic pagination and error handling against a predictable response shape.

## Notes

**Provenance:** FTR-088 → FTR-088
