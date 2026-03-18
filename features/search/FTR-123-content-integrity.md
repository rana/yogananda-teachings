---
ftr: 123
title: Content Integrity Verification
summary: "Paste-to-verify tool and SHA-256 book hashes proving verbatim fidelity of every displayed passage"
state: implemented
domain: search
governed-by: [PRI-01, PRI-02, PRI-03, PRI-05, PRI-07, PRI-09]
---

# FTR-123: Content Integrity Verification

## Rationale

**Context:** FTR-132 (content-addressable deep links), FTR-001 (direct quotes only)

The portal's core promise is sacred text fidelity: every displayed passage is verbatim from SRF-published works across all author tiers (FTR-001). But there is no mechanism to *verify* this — to prove that the portal's text hasn't drifted from SRF's source publications. Content-addressable deep links (FTR-132) use content hashes for URL stability, but they don't solve provenance.

The current `/integrity` page (M2a) displays SHA-256 hashes in a monospace table with technical language. No one outside a developer can use or understand it. The hashes are computed live via `string_agg + sha256` at page render, not pre-stored as specified. The page treats integrity as a technical property, but verbatim fidelity is a *spiritual* commitment — the guru-disciple chain of faithful transmission. The page should communicate this in the tradition's own words, and provide a tool any seeker can use.

## Specification

### Page title

"Every Word, Exactly as Written" (replaces "Content Integrity")

### Layer 1: Sacred Mission Framing

Server Component, `register="contemplative"`. Explains why exactness matters using verified corpus quotes:

> "You are the one I have chosen to spread the message of Kriya Yoga in the West.... The scientific technique of God-realization will ultimately spread in all lands, and aid in harmonizing the nations through man's personal, transcendental perception of the Infinite Father." — Babaji to Yogananda, Ch. 37

> "You must do your part in spreading that message, and in writing that sacred life." — Sri Yukteswar to Yogananda, Ch. 32

Followed by a simple statement: this portal continues that chain of faithful transmission. Every word is exactly as published. Here's how you can verify that yourself.

### Layer 2: Paste-to-Verify Tool

Client Component (`IntegrityChecker`), `register="instructional"`. A textarea where any seeker pastes text to check against the corpus.

**Three result states:**

| State | Trigger | Response |
|-------|---------|----------|
| Exact match | Normalized text found verbatim (similarity >= 0.95) | Green confirmation + full attribution (author, book, chapter, page) + "Read in context" link |
| Close match | pg_trgm similarity >= 0.6 | "Here is what was actually written" — sequential layout (not side-by-side), differences gently highlighted with `<mark>`, top 3 matches with full attribution |
| No match | Below threshold | Warm guidance toward browsing and search. Never a dead end (PRI-02 § honest absence as invitation). |

**Implementation:**

- **Endpoint:** `POST /api/v1/integrity/check` — accepts `{ text: string }`, returns match result
- **Service:** `lib/services/integrity.ts` — `checkTextIntegrity(text, language?)` using pg_trgm similarity with vector fallback
- **Language detection:** fastText auto-detects language to route to correct corpus
- **DELTA constraint (PRI-09):** Pasted text is never logged. Request body excluded from structured logs.
- **Rate limited:** Per FTR-097 (15 req/min per IP), reuses `lib/services/rate-limit.ts`
- **Anti-extraction:** Returns only the matching chunk, never full chapters. The tool verifies; it doesn't serve as a content API.
- **Accessibility (PRI-07):** `aria-label` on textarea, `aria-live="polite"` results region, keyboard-accessible

**Config (`lib/config.ts`):**
- `INTEGRITY_SIMILARITY_THRESHOLD = 0.6` — minimum similarity for close match. Evaluate: after launch with real seeker queries.
- `INTEGRITY_MAX_INPUT_LENGTH = 2000` — max chars accepted. Prevents pg_trgm slowdown on large inputs.

### Layer 3: Technical Disclosure

Server Component, collapsed in `<details>`. "For developers and auditors" label. Contains:

- Per-chapter SHA-256 hash table (reads from pre-computed `chapters.content_hash`)
- Hash computation instructions so SRF can independently verify
- Statement of algorithm: SHA-256 of concatenated chunk content, NFC-normalized, ordered by paragraph_index

### Pre-computed hashes

**Migration:** `ALTER TABLE chapters ADD COLUMN content_hash TEXT` + backfill:

```sql
UPDATE chapters SET content_hash = sub.hash
FROM (
  SELECT c.id,
    encode(sha256(string_agg(bc.content, '' ORDER BY bc.paragraph_index)::bytea), 'hex') as hash
  FROM chapters c
  JOIN book_chunks bc ON bc.chapter_id = c.id
  GROUP BY c.id
) sub
WHERE chapters.id = sub.id;
```

Replaces live computation in both the page and the existing `GET /api/v1/books/{bookId}/integrity` endpoint.

**Hash computation is deterministic:**

```typescript
function chapterHash(chunks: string[]): string {
  const normalized = chunks
    .map(c => c.normalize('NFC').replace(/\s+/g, ' ').trim())
    .join('\n');
  return sha256(normalized);
}
```

### i18n

All copy rewritten for non-technical readers. ~25 keys per locale in `messages/{en,es}.json` under `integrity.*`. Sacred framing uses Spanish translation of Autobiography for `es` locale. Visual register: contemplative for Layer 1, instructional for Layer 2.

### Files

| File | Action |
|------|--------|
| `app/[locale]/integrity/page.tsx` | Rewrite (3 layers) |
| `lib/services/integrity.ts` | New (checkTextIntegrity service) |
| `app/api/v1/integrity/check/route.ts` | New (POST endpoint) |
| `app/components/IntegrityChecker.tsx` | New (client component) |
| `messages/en.json` | Replace `integrity.*` block |
| `messages/es.json` | Replace `integrity.*` block |
| `lib/config.ts` | Add INTEGRITY_* constants |
| `app/api/v1/books/[bookId]/integrity/route.ts` | Modify (read from content_hash) |
| Migration | Add `chapters.content_hash` + backfill |

### Execution sequence

1. Migration: add `chapters.content_hash`, backfill from existing data
2. `lib/services/integrity.ts` — service with unit tests
3. `POST /api/v1/integrity/check` endpoint + config constants
4. i18n strings (en + es)
5. Page rewrite + IntegrityChecker component + update existing integrity API

## Notes

- **Origin:** FTR-123
- **M2a implementation (partial):** Hash table page + API endpoint shipped. Hashes computed live at render instead of pre-stored. Technical language only.
- **Redesign rationale:** The current page serves developers but not seekers. The sacred framing and paste-to-verify tool make integrity verification accessible to the portal's actual audience while demoting (not removing) the technical details for auditors.
