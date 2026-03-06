# FTR-090: Content Versioning

> **State:** Approved
> **Domain:** operations
> **Arc:** 1+
> **Governed by:** PRI-01, PRI-02, PRI-10
> **Replaces:** FTR-090

## Rationale

**Status:** Accepted | **Date:** 2026-02-22

**Relates to:** FTR-132, FTR-021, FTR-123, FTR-024, FTR-135, FTR-021, FTR-068

### Context

The portal manages content that changes over time in several distinct ways:

1. **Book editions.** SRF periodically publishes revised editions. The 13th edition of *Autobiography of a Yogi* (1998) differs from the 1946 first edition in pagination, paragraph structure, and minor editorial corrections. FTR-021 established edition-aware modeling; FTR-132 established content-hash deep links. But neither addresses the *lifecycle*: when a new edition arrives, what happens to the old one?

2. **Translation updates.** SRF/YSS may update official translations — correcting a passage, improving fluency, or aligning with a new English edition. FTR-135 governs the translation workflow. But when a Spanish translation is updated, what happens to the prior version? Is it replaced or archived?

3. **Magazine content.** Back-issue articles are generally immutable. But SRF might request corrections (typos, factual errors in biographical articles) or re-categorize content. FTR-075 doesn't address post-publication changes.

4. **Embedding model migration.** FTR-024 specifies that chunks carry an `embedding_model` field, enabling parallel models during migration. But the versioning of the embeddings themselves (before and after migration) lacks a lifecycle policy.

5. **AI-classified metadata.** Theme tags, tone classifications, accessibility levels — all AI-proposed, human-reviewed. If the AI model improves (or the prompt changes), should existing classifications be re-evaluated? FTR-072 addresses the maturity model but not the re-evaluation lifecycle.

Without a unified versioning strategy, the portal risks data loss (old editions overwritten), broken links (shared URLs pointing to removed content), and silent inconsistency (some translations updated, others stale).

### Decision

#### 1. Editions: archive, never delete

When a new edition of a book is ingested:
- The new edition's book record is created with a new `id`, linking to the same `canonical_book_id` as the prior edition.
- The prior edition's `is_current_edition` flag is set to `false`. Its chunks, embeddings, and relations remain in the database.
- The prior edition is no longer surfaced in search results, theme pages, or daily passage selection. It is not indexed for new queries.
- Deep links to prior-edition passages continue to resolve via content-hash fallback (FTR-132). The resolution chain: exact chunk ID → content-hash match in current edition → content-hash match in archived edition → graceful "passage may have moved" fallback.
- The `/books/{slug}` page shows the current edition. A "Previous editions" note (if applicable) links to an edition history page showing which edition the seeker is reading. This is informational, not navigational — seekers don't browse old editions.
- The prior edition's PDF (if generated) is removed from active distribution but retained in S3 archive.

**Never delete a chunk that has ever been shared.** Shared links, email quotes, WhatsApp messages, and bookmarks all reference chunk IDs. Deleting chunks breaks trust.

#### 2. Translation updates: version, don't replace

When a translation is updated:
- A new `book` record is created for the updated translation, with a new `id` and the same `canonical_book_id`.
- The prior translation version follows the same archive-not-delete pattern as editions.
- `canonical_chunk_id` alignment is re-computed for the new translation.
- If the translation is a minor correction (typo fix, punctuation), the prior translation may be updated in place *only if* no chunks have been shared via external links. If any chunks have been shared, the archive-not-delete pattern applies.
- Translation `version` is tracked: `edition_year` + `translation_revision` (e.g., "2024 Spanish, revision 2").

#### 3. Magazine content: immutable with errata

Published magazine articles are treated as immutable historical documents.
- **Typo corrections:** Applied in place (no versioning for trivial errors). The `updated_at` timestamp reflects the change. No shared-link concern for character-level typos.
- **Substantive corrections** (factual errors, misattributions): An `errata` note is appended to the article metadata, visible on the article page. The original text is not altered — the erratum is additive. Example: *"Note: The original article attributed this statement to Brother Anandamoy. It was spoken by Brother Premamoy. Corrected 2026-09-15."*
- **Re-categorization** (e.g., changing `author_type`): Metadata change only, applied directly. No content versioning needed.

#### 4. Embedding model migration: parallel, then converge

Per FTR-024, embedding migration follows a parallel-run strategy:
- New embeddings are computed alongside old embeddings. Both stored, distinguished by `embedding_model` column.
- Search queries run against both embedding sets during the migration window. Results are merged and ranked.
- Once search quality evaluation confirms the new model meets or exceeds the old (per-language, per FTR-024), the old embeddings are marked `deprecated`.
- Deprecated embeddings are retained for 90 days (matching the PITR window), then deleted. The `embedding_model` column value is preserved on chunks as a historical record.

#### 5. AI-classified metadata: re-evaluation cadence

When a significant AI model upgrade or prompt revision occurs:
- Existing classifications are *not* automatically re-evaluated. The current classifications were human-reviewed and represent editorial decisions.
- A re-evaluation *may* be triggered by the portal coordinator if: (a) the new model is substantially better (demonstrated on a test set), (b) the editorial team has capacity, and (c) the re-evaluated classifications go through the same review pipeline as initial classifications (same maturity stage per FTR-072).
- Re-evaluation is opt-in, per-workflow, per-language. It is never mandatory.

### Alternatives Considered

1. **Replace editions in place.** Simpler but breaks shared links and loses the audit trail. Unacceptable for a 10-year platform where passages have been quoted in emails, printed, and shared.

2. **Expose all editions equally in search.** Would clutter results with near-duplicate passages from different editions. The deduplication rule (FTR-089) shows the current edition; the archive exists for link resolution, not discovery.

3. **Version magazine articles like editions.** Excessive for content that changes rarely and minimally. The errata pattern is simpler and more honest.

4. **Auto-re-evaluate all AI classifications on model change.** Would overwhelm the editorial team and disrespect prior human review decisions. Classifications represent editorial judgment, not just AI output.

### Consequences

- The `books` table's `is_current_edition` flag becomes the governing field for search indexing and content surfacing.
- Deep link resolution (FTR-132) now has a defined fallback chain that includes archived editions.
- Translation updates create new book records, not in-place modifications — consistent with the edition model.
- Magazine articles gain an `errata` metadata field (nullable JSON array) in the schema.
- Embedding migration has a defined lifecycle: parallel → converge → deprecate → delete (90 days).
- AI re-evaluation is explicitly opt-in — preventing scope creep when models improve.
- DESIGN.md § FTR-068 (Content Lifecycle Management) should reference this ADR for versioning policy.

## Notes

**Provenance:** FTR-090 → FTR-090
