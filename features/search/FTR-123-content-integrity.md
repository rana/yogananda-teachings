# FTR-123: Content Integrity Verification

**State:** Approved
**Domain:** search
**Arc:** 1a+
**Governed by:** PRI-01, PRI-02

## Rationale

**Context:** FTR-132 (content-addressable deep links), FTR-001 (direct quotes only)

### Context

The portal's core promise is sacred text fidelity: every displayed passage is verbatim from SRF-published works across all author tiers (FTR-001). But there is no mechanism to *verify* this — to prove that the portal's text hasn't drifted from SRF's source publications. Content-addressable deep links (FTR-132) use content hashes for URL stability, but they don't solve provenance.

### Decision

Implement per-chapter content integrity hashes that enable verification of the portal's text against SRF's master publications.

**Approach:**
- At ingestion time, compute a SHA-256 hash of each chapter's concatenated, normalized text (whitespace-normalized, Unicode NFC)
- Store the hash in `chapters.content_hash TEXT NOT NULL`
- Expose hashes via API: `GET /api/v1/books/{slug}/integrity` returns a JSON array of `{ chapter_number, chapter_title, content_hash }` for all chapters
- SRF can independently compute the same hashes from their master text files and compare

**Verification page (`/integrity`):**
- Simple public page listing all books and their chapter hashes
- "How to verify" instructions for computing hashes from physical books
- Statement: "Every word on this portal is verified against SRF's published editions."

**Hash computation is deterministic:**

```typescript
function chapterHash(chunks: string[]): string {
 const normalized = chunks
 .map(c => c.normalize('NFC').replace(/\s+/g, ' ').trim)
 .join('\n');
 return sha256(normalized);
}
```

### Scheduling

Arc 1 (computed during ingestion, stored in schema). The `/integrity` page is Milestone 2a.

### Consequences

- `chapters.content_hash` column added to schema
- Ingestion pipeline computes hashes automatically
- `/integrity` page and API endpoint added
- Hash recomputation on any content update (catches drift)
- **Extends FTR-132** from URL stability to content provenance

## Notes

- **Origin:** FTR-123
