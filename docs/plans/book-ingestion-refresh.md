# Book Ingestion Pipeline: Refresh & Harden

## Context

The book ingestion pipeline is mature and proven (2 books, 2 languages, ~2,900 chunks). A March 2026 audit revealed systematic gaps.

## Key Findings

### Chapter 46 Boundary Error (Root Cause)

English Autobiography is reflowable (~1.7 screens per 558 physical pages). Kindle Cloud Reader TOC positions are in screen-number space but don't exactly match where Claude Vision finds chapter headings. 23/49 English chapters had wrong TOC-vs-extraction page numbers. Chapter 46 was the most visible: it started mid-sentence ("go on; obliging lads fetched spades...") instead of the proper opening.

**Fix:** `audit-boundaries.ts --fix` corrects all TOC entries to match extraction anchors. Re-assembly + re-ingestion restores correct text.

**Spanish unaffected:** Fixed-layout format has 1:1 screen:page mapping, zero mismatches.

### Three-Layer Prevention

1. **Extraction anchors** — `extract.ts` detects `chapterNumber` per page
2. **Assembly gate** — `assemble.ts` cross-references TOC vs anchors, halts on mismatch
3. **Structural checks** — `validate.ts` Layer 4 catches lowercase starts, missing titles, word count outliers

### Golden Passages Expanded

3 per book -> 20 per book across 10 categories. Both EN and ES pass 20/20.

## Completed Work

| Task | Status | Commit |
|------|--------|--------|
| Create `audit-boundaries.ts` | Done | `9c6b4a5` |
| Add assembly-time boundary gate to `assemble.ts` | Done | `9c6b4a5` |
| Add Layer 4 structural checks to `validate.ts` | Done | `9c6b4a5` |
| Fix EN chapter boundaries (23/49 corrected) | Done | `9c6b4a5` |
| Re-assemble all EN chapters | Done | `9c6b4a5` |
| Re-ingest EN to Neon (1,700 chunks, all embeddings) | Done | Session 2 |
| Expand golden passages to 20 per book | Done | Session 2 |
| Update FTR-164 proposed -> approved | Done | Session 2 |
| Re-enrich all EN chunks | Done | Session 2 |
| Re-compute relations | Done | Session 2 |
| Rebuild suggestion dictionary | Done | Session 2 |

## Remaining Work

| Task | Priority | Notes |
|------|----------|-------|
| Provenance manifest (`generate-manifest.ts`) | Low | SHA-256 checksums per page |
| Fix imageHash in `capture.ts` | Low | Currently empty string |
| Extraction model tracking in `extract.ts` | Low | `extractionMeta` field |
| Screenshot recapture (both books) | Medium | Required for provenance |
| Wave 1 BookConfigs | Medium | Where There Is Light, Sayings, SHA |
| The Holy Science preparation | Medium | Sanskrit-dense, sutra format |

## Database State After Refresh

| Book | Language | Chunks | Embeddings | Status |
|------|----------|--------|------------|--------|
| Autobiography of a Yogi | en | 1,700 | 1,700 | Re-ingested with corrected boundaries |
| Autobiografia de un yogui | es | 1,188 | 1,188 | Unchanged (no boundary errors) |

## Key Scripts

- `scripts/book-ingest/src/audit-boundaries.ts` — Diagnose and fix chapter boundary mismatches
- `scripts/book-ingest/src/assemble.ts` — Now includes boundary verification gate
- `scripts/book-ingest/src/validate.ts` — Now includes Layer 4 structural checks
- `scripts/book-ingest/src/config.ts` — Golden passages expanded to 20 per book
- `scripts/ingest/ingest.ts` — Direct book.json -> Neon path (use `--replace` for re-ingestion)
