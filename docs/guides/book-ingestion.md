# Book Ingestion Pipeline

Procedural guide for ingesting a new book into the portal. Covers Kindle capture, extraction, post-processing, and known pitfalls.

**Pipeline scripts:** `scripts/book-ingest/src/` (capture, extract, assemble, validate, post-process-screens)
**Book configs:** `scripts/book-ingest/src/config.ts`
**Data directory:** `data/book-ingest/{book-slug}/`
**Pipeline stages:** capture → (post-process if reflowable) → extract → validate → assemble

See also: FTR-018 (Unified Content Pipeline), FTR-022 (Content Ingestion), FTR-164 (Book Ingestion Operations).

---

## Two Kindle Capture Modes

### Fixed-Layout (e.g., Spanish edition)
- 1 screen = 1 physical page (simple case)
- Footer shows "Page N of M" — reliable page tracking
- `capture.ts` footer-based mode works directly
- Spanish example: 811 pages, 811 screens

### Reflowable (e.g., English edition)
- 1 physical page = 1–3 screens (variable, avg ~1.7)
- Viewport affects screens-per-page ratio
- Used viewport 768x936 → native 1232x1572 images
- Footer tracks physical page numbers, but many screens share one page number
- All front matter (Title through Introduction) maps to "Page 1 of 558" — 36+ screens
- Total: 558 physical pages → 955 screen captures

## Reflowable Capture Workflow

1. **Manual setup:** Open book in MCP Playwright browser at read.amazon.com
2. **Navigate to start:** TOC → Title Page (or first content)
3. **Capture screens:** Use `page.getByRole('button', { name: 'Next page' }).click({ force: true })` to advance
4. **Collect metadata:** Footer text (screen→page mapping) — MUST be in same `browser_run_code` call as navigation
5. **Post-process:** `post-process-screens.ts` renames screen-NNNN → page-NNN, remaps TOC, updates capture-meta.json
6. **Extract:** Standard pipeline (`extract.ts`) works unchanged on renamed files

## Critical Navigation Lessons

These were learned through painful trial and error. Do not skip.

- **NEVER click content area (400,400)** — hits hyperlinks in book text, causes unpredictable jumps
- **NEVER click margins (x=10)** — doesn't transfer keyboard focus for PageDown
- **USE "Next page" button** — `page.getByRole('button', { name: 'Next page' }).click({ force: true })` is the only reliable method
- **End-of-book detection:** Use image src comparison, NOT footer text comparison (front matter repeats "Page 1" across 36+ screens)
- **Metadata collection alignment:** Navigation + metadata collection MUST be in the same `browser_run_code` call — separate calls lose position

## Post-Processing (post-process-screens.ts)

Only needed for reflowable books (where screens != pages).

- Reads `screen-metadata.json` (screen→footer mapping, collected during capture)
- For screens beyond metadata coverage: interpolates page numbers using anchor points from capture batch summaries
- Renames `screen-NNNN.png` → `page-NNN.png` (3-digit padding to match `padPage()`)
- Remaps TOC page numbers from physical-page to screen-number space
- Updates `capture-meta.json`: totalPages, captureMode='reflowable-screens', originalTotalPages preserved
- Backs up original as `capture-meta-original.json`

## File Naming Convention

- `padPage()` in `utils.ts` uses `.padStart(3, '0')` → 3-digit padding (`page-001.png` through `page-955.png`)
- ALL pipeline scripts use `padPage()` — file naming MUST match
- A previous 4-digit naming bug required batch rename fix — do not change the padding width

## Extraction

- **Model:** claude-sonnet-4-20250514 via AWS Bedrock
- **Concurrency 5:** ~23 pages/minute (~2.6 sec/page effective)
- **955 pages:** ~40 minutes
- **JSON repair:** Claude sometimes outputs unescaped quotes in text values (especially for book titles with quotes). `extract.ts` has multi-pass repair: smart quote replacement, interior quote escaping, trailing comma removal. Occasional "JSON required repair" warnings are normal, not errors.

## Known Book Editions

| Book | Language | ASIN | Layout | Notes |
|------|----------|------|--------|-------|
| Autobiography of a Yogi | en | B00JW44IAI | Reflowable | SRF edition. DO NOT confuse with other editions. |
| Autobiografia de un yogui | es | B07G5KL5RL | Fixed-layout | SRF edition. NOT "Editorial Recien Traducido" B0FDKZ2FLN (48 chapters). |
| Autobiography of a Yogi | hi | TBD | TBD | YSS authorization needed (FTR-119). Title: एक योगी की आत्मकथा |

## Adding a New Book

1. Add a `BookConfig` entry in `scripts/book-ingest/src/config.ts`
2. Purchase the Kindle edition (verify SRF/YSS publisher)
3. Capture via Playwright (fixed-layout or reflowable workflow above)
4. Post-process if reflowable
5. Extract with `extract.ts`
6. Validate with `validate.ts`
7. Assemble with `assemble.ts`
8. Ingest to Contentful and Neon via `ingest.ts` / `sync-contentful-to-neon.ts`
9. Generate embeddings via `backfill-embeddings.ts`

For Hindi: pipeline supports Devanagari via `LANGUAGE_GUIDANCE` in `extract.ts`. `config.ts` needs a new BookConfig entry.
