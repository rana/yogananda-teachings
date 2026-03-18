---
ftr: 132
title: URL Strategy
summary: "Content-hash deep links for stable passage URLs that survive re-ingestion"
state: implemented
domain: experience
governed-by: [PRI-10]
---

# FTR-132: URL Strategy

## Rationale

### FTR-132: Content-Addressable Passage Deep Links

### Context

The current deep linking scheme uses `chapter + paragraph_index` to link to specific passages (e.g., `/books/autobiography/14#p7` for chapter 14, paragraph 7). This has a fragility problem: if a book is re-ingested with different chunking (corrected OCR, revised paragraph boundaries, different chunk sizes), the `paragraph_index` values may shift, breaking all previously shared links.

Shared passage links are permanent artifacts. A seeker shares a link to a Yogananda quote with a friend. That link appears in emails, WhatsApp messages, social media posts, browser bookmarks, and physical printouts (QR codes on passage PDFs). If a re-ingestion breaks the link, the seeker's friend arrives at the wrong passage — or worse, a 404. This violates the 10-year architecture principle (FTR-004).

### Decision

Add a **content hash** column to `book_chunks` that provides a stable, content-addressable identifier for each passage. Deep links use this hash as a fallback when `paragraph_index` no longer matches.

#### Schema addition

```sql
ALTER TABLE book_chunks ADD COLUMN content_hash TEXT GENERATED ALWAYS AS (
 encode(sha256(encode(left(content, 200), 'utf8')), 'hex')
) STORED;

CREATE INDEX idx_chunks_content_hash ON book_chunks(content_hash);
```

The hash is computed from the first 200 characters of the passage content. This is enough to uniquely identify a passage within a book (duplicate openings across chapters are astronomically rare in Yogananda's prose), while remaining stable across minor edits (trailing whitespace, typographic normalization).

#### Deep link resolution

```
1. Try exact match: book_slug + chapter_number + paragraph_index
2. If paragraph content doesn't match the OG-embedded content_hash:
 a. Search same chapter for matching content_hash
 b. Search same book for matching content_hash
3. If found: redirect to correct location (301)
4. If not found: show the chapter with a gentle message:
 "This passage may have moved. Here is the chapter it was in."
```

#### Share URL format

Current: `/books/autobiography/14#p7`
Enhanced: `/books/autobiography/14#p7?h=a3f2c8` (first 6 chars of content_hash)

The `h` parameter is used only for resolution fallback when the paragraph_index doesn't match. Normal navigation ignores it.

### Rationale

- **Link permanence.** Shared links survive re-ingestion, re-chunking, and content corrections. A 10-year-old shared URL still works.
- **Graceful degradation.** If the hash can't be resolved (passage genuinely removed), the seeker sees the chapter rather than an error. Content Availability Honesty principle.
- **Zero cost in the happy path.** When paragraph_index matches (99% of cases), the hash is never consulted. The resolution chain adds latency only when content has actually changed.
- **Minimal schema impact.** One generated column, one index. No migration complexity.

### Consequences

- `content_hash` column added to `book_chunks` table in the initial migration
- Share URLs include the `h` parameter (short hash suffix)
- OG meta tags embed the content_hash for later verification
- Re-ingestion scripts log when paragraph_index shifts occur, enabling link audit
- **Extends FTR-004** (10-year architecture) and **FTR-048** (passage sharing)


### FTR-132: Human-Readable URL Strategy — Slugs Over UUIDs

### Context

Frontend URLs used UUIDs (UUIDv7) as identifiers: `/books/019cb0d1-24d8-74ce-8a62-76aede429162/3`, `/passage/019cb0d1-5778-77c7-b914-be0c62f6c08f`. These are machine-optimal but hostile to humans — hard to read, impossible to remember, painful to copy-paste or communicate verbally, and they reveal implementation details. For a portal presenting Yogananda's teachings, URLs should be as considered as the typography.

The portal's URLs are shared in WhatsApp messages, email, social media, and potentially QR codes on physical materials. A URL like `/en/passage/season-failure-best-time-sowing` communicates the content's essence before the page loads — it's a preview, an invitation, a first taste of the teaching.

### Decision

**Two-tier URL strategy:** human-readable slugs for frontend routes, UUIDs for API routes.

#### Book URLs

Books use editorial slugs derived from the title: `/books/autobiography-of-a-yogi/3`. Schema: `books.slug TEXT NOT NULL`, with `UNIQUE INDEX ON (slug, language)` for language-scoped uniqueness.

#### Passage URLs

Passages (book chunks) use content-derived slugs: `/passage/season-failure-best-time-sowing`. Generated algorithmically from the first 5 significant words of the passage content, with stop-word removal (English + Spanish) and accent normalization via `unaccent()`.

Schema: `book_chunks.slug TEXT NOT NULL`, with `UNIQUE INDEX ON (slug, language)`. A PL/pgSQL function `generate_content_slug()` produces the base slug; collisions within the same language are resolved with `-2`, `-3` suffixes. For 2,681 chunks across 2 languages, collision rate was 0% (English) and 0.5% (Spanish, 6 collisions).

Example slugs:
- `season-failure-best-time-sowing` — evocative, memorable
- `hard-pierce-veil-divine-various` — captures the verse's tone
- `dueno-cuerpo-mente-kriya-yogui` — Spanish with accent normalization
- `received-graciously-home-lahiri-family` — includes proper nouns naturally

#### API URLs

API routes (`/api/v1/`) continue using UUIDs. These are machine interfaces where stability and unambiguity matter more than readability.

#### Backward Compatibility

Both `resolveBook()` and `resolvePassage()` accept either a slug or UUID: `WHERE slug = $1 OR id::text = $1 LIMIT 1`. Old bookmarks, shared links, and external references using UUIDs continue to resolve correctly. localStorage bookmarks use optional `bookSlug`/`passageSlug` fields with fallback to UUID for legacy entries.

### Alternatives Considered

1. **Keep UUIDs.** Simplest but worst human experience. Rejected.
2. **Short base62 codes** (e.g., `/p/3Kx9mQ`). Compact but opaque — worse than UUIDs for communicating content. Rejected.
3. **Chapter + position** (e.g., `/passage/autobiography/12/7`). Fragile under re-ingestion — FTR-132 exists precisely because positional identifiers shift. Rejected.
4. **Scholarly citation codes** (e.g., `/p/AY-12-98`). Machine-readable but requires decoding; doesn't convey the passage's spirit. Rejected.
5. **Content hash prefixes** (e.g., `/p/a7f3e2`). Stable but meaningless. Rejected.

### Consequences

- All frontend URLs are now human-readable and shareable
- Slug generation happens at ingestion time (new books) and via migration (existing data)
- The `generate_content_slug()` function must be called during future book ingestion
- Passage slugs are language-scoped — the same content in different languages gets different slugs
- New config constant not needed: slug generation is a database function, not a tunable parameter

**Governs:** `migrations/005_book_slugs.sql`, `migrations/006_passage_slugs.sql`, `lib/services/books.ts` (`resolveBook`, `resolvePassage`)

## Notes

Merged from FTR-132 and FTR-132 (related ADRs) per FTR-084.
