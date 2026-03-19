---
ftr: 164
title: Book Ingestion Operations
summary: "Complete operational specification for the book ingestion pipeline with scripts, artifacts, and playbook"
state: approved
domain: operations
governed-by: [PRI-01, PRI-06, PRI-12]
depends-on: [FTR-022]
---

# FTR-164: Book Ingestion Operations

## Rationale

FTR-022 (Content Ingestion Pipeline) defines the architectural rationale and stage design for transforming published books into searchable, design-system-aware data. This companion FTR is the **operational specification**: a complete inventory of every script, function, data artifact, external dependency, and execution sequence needed to run the pipeline.

Three audiences require this document:

1. **AI operator** (Claude in future sessions) — loads one file and knows every stage, script, and artifact. Knows what to update, insert, or remove when ingesting a new book or modifying the pipeline.
2. **Human operator** (future team member, SRF staff) — follows the Execution Playbook without reading 21 TypeScript source files.
3. **Visual operations surface** (future dashboard) — consumes the Pipeline Map as a machine-parseable stage graph with inputs, outputs, dependencies, and status.

The pipeline currently exists as tribal knowledge distributed across `scripts/book-ingest/src/` (13 files, capture through assembly) and `scripts/ingest/` (8 files, Contentful and Neon loading). This FTR consolidates that knowledge into a single operational reference.

### Relationship to FTR-022

FTR-022 = **what** and **why** (architectural decisions, stage design, content model).
FTR-164 = **how** and **with what** (scripts, artifacts, execution sequence, dependencies).

FTR-022 remains the governing document. When the pipeline's architecture changes, update FTR-022 first, then reflect operational changes here.

### Extraction Paths

Three paths feed the pipeline, converging at the Contentful import step (per FTR-022):

| Path | Source | Status | Quality |
|------|--------|--------|---------|
| **Ebook extraction** | Amazon Cloud Reader via Playwright + Claude Vision | Implemented (Stages 1-6b) | High |
| **PDF extraction** | spiritmaji.com PDF via `marker` | Not implemented | Medium |
| **SRF digital text** | SRF-provided source files | Future (pre-launch) | Authoritative |

This FTR documents the ebook extraction path in full. PDF and SRF-source paths share Stages 7+ (Contentful import onward).

## Specification

### Pipeline Map (DAG)

```
                    STAGE 0: Configuration
                         |
                         v
                    STAGE 1: TOC Collection
                         |
                         v
                    STAGE 2: Page Capture
                         |
                    [reflowable?]
                    /           \
                 yes             no
                  |               |
            STAGE 2b:             |
            Post-Process          |
                  \              /
                   v            v
                    STAGE 3: Text Extraction
                         |
                         v
                    STAGE 4: Assembly
                        / \
                       /   \
                      v     v
               STAGE 5:   STAGE 6: Photo Capture
               Validate        |
                  |       STAGE 6b: Photo Cropping
               STAGE 5b:
               QA Report
                      \       /
                       \     /
                        v   v
                    STAGE 7: Contentful Schema Migration
                         |
                    STAGE 8: Contentful Import
                         |
                    STAGE 9: Neon Sync
                         |
                    STAGE 10: Unified Enrichment (FTR-026)
                        / \
                       /   \
                      v     v
               STAGE 11:  STAGE 12: Compute Relations
               Rasa Class.    |
                         STAGE 13: Generate Labels
                              |
                         STAGE 14: Populate Chunk Topics
                              |
                         [if needed]
                              v
                         STAGE 15: Backfill Embeddings
                              |
                              v
                         STAGE 16: Rebuild Suggestion Dictionary (FTR-029)
```

**Parallelism:** Stages 6/6b (photo capture/crop) can run concurrently with Stages 5/5b (validation). Stage 11 (rasa) and Stage 12 (relations) can run concurrently after Stage 10. Stage 10 (enrichment) must complete before Stage 14 (chunk topics) since it requires enriched `topics[]`.

### Script Inventory

#### `scripts/book-ingest/src/` — Capture Through Assembly

| Script | Purpose | CLI | Env Vars | External APIs | Idempotent |
|--------|---------|-----|----------|---------------|------------|
| `config.ts` | Book configs, pipeline settings, path helpers | (library) | — | — | — |
| `types.ts` | All pipeline type definitions | (library) | — | — | — |
| `utils.ts` | Shared utilities (hash, JSON, slug, logging) | (library) | — | — | — |
| `collect-toc.ts` | Collect TOC entries with page numbers | `--book <slug> [--cdp-url] [--nav-delay]` | — | Amazon Cloud Reader (CDP) | No (refuses if capture-meta.json exists) |
| `capture.ts` | Capture all pages as PNG screenshots | `--book <slug> [--resume-from N] [--cdp-url]` | — | Amazon Cloud Reader (CDP) | Yes (skips captured pages) |
| `post-process-screens.ts` | Remap reflowable screens to page numbers | `--book <slug>` | — | — | No (renames files) |
| `extract.ts` | Claude Vision OCR to structured JSON | `--book <slug> [--resume-from N] [--concurrency N]` | AWS creds or ANTHROPIC_API_KEY | AWS Bedrock (Claude Sonnet) | Yes (skips extracted pages) |
| `assemble.ts` | Combine pages into chapters + book manifest | `--book <slug>` | — | — | Yes (overwrites) |
| `validate.ts` | Four-layer validation (capture, extraction, assembly, structure) | `--book <slug>` | — | — | Yes |
| `qa-report.ts` | HTML side-by-side review for human QA | `--book <slug> [--all]` | — | — | Yes |
| `capture-photos.ts` | Canvas-native photo extraction at full resolution | `--book <slug> [--cdp-url]` | — | Amazon Cloud Reader (CDP) | Yes (skips captured pages) |
| `crop-photos.ts` | AI crop detection + ImageMagick cropping | `--book <slug> [--dry-run] [--page N]` | ANTHROPIC_API_KEY | Anthropic API (Haiku), ImageMagick | Yes |
| `audit-boundaries.ts` | Cross-reference TOC vs extraction chapter anchors | `--book <slug> [--fix]` | — | — | Yes (--fix backs up before modifying) |
| `classify-rasa.ts` | Aesthetic flavor classification per chapter | `--book <slug> [--dry-run] [--chapter N]` | AWS creds, NEON_DATABASE_URL_DIRECT | AWS Bedrock (Claude Opus) | Yes (overwrites) |

#### `scripts/ingest/` — Contentful and Neon Loading

| Script | Purpose | CLI | Env Vars | External APIs | Idempotent |
|--------|---------|-----|----------|---------------|------------|
| `migrate-contentful-schema.ts` | Ensure greenfield fields on content types | `[--dry-run]` | CONTENTFUL_SPACE_ID, CONTENTFUL_MANAGEMENT_TOKEN | Contentful Management API | Yes |
| `import-contentful.ts` | Create Book/Chapter/Section/TextBlock entries | `--book <slug> [--dry-run] [--resume-from-chapter N]` | CONTENTFUL_SPACE_ID, CONTENTFUL_MANAGEMENT_TOKEN | Contentful Management API | Partial (creates, doesn't update) |
| `sync-contentful-to-neon.ts` | Canonical Contentful-to-Neon sync with chunking + embeddings | `--book <slug> [--replace] [--skip-embeddings] [--dry-run]` | CONTENTFUL_SPACE_ID, CONTENTFUL_ACCESS_TOKEN, NEON_DATABASE_URL_DIRECT, VOYAGE_API_KEY | Contentful CDA, Voyage AI, Neon | Yes (with --replace) |
| `ingest.ts` | Direct book.json-to-Neon ingestion with chunking + embeddings | `--book <slug> [--contentful-map <path>] [--skip-embeddings] [--replace] [--dry-run]` | NEON_DATABASE_URL_DIRECT, VOYAGE_API_KEY | Voyage AI, Neon | Yes (with --replace) |
| `ingest-en.ts` | **Legacy.** English-specific direct ingestion. Superseded by `ingest.ts`. | `[--skip-embeddings] [--dry-run]` | NEON_DATABASE_URL_DIRECT, VOYAGE_API_KEY | Voyage AI, Neon | — |
| `compute-relations.ts` | Pre-compute nearest-neighbor chunk relations | `[--full] [--book <slug>] [--dry-run]` | NEON_DATABASE_URL_DIRECT | Neon (pgvector HNSW) | Yes |
| `generate-labels.ts` | Contextual labels for related teachings | `[--dry-run] [--limit N] [--batch-size N]` | AWS creds, NEON_DATABASE_URL_DIRECT | AWS Bedrock (Claude Opus) | Yes (skips labeled) |
| `enrich.ts` | FTR-026 unified enrichment (all metadata fields) | `--book <slug> [--all] [--force] [--opus] [--dry-run] [--limit N] [--concurrency N]` | AWS creds, NEON_DATABASE_URL_DIRECT | AWS Bedrock (Claude Sonnet/Opus) | Yes (skips enriched; --force re-enriches) |
| `populate-chunk-topics.ts` | Wire enriched topics to teaching_topics | `[--book <slug>] [--dry-run] [--threshold N]` | NEON_DATABASE_URL_DIRECT, VOYAGE_API_KEY | Voyage AI, Neon | Yes (ON CONFLICT DO NOTHING) |
| `backfill-embeddings.ts` | Fill chunks with NULL embeddings | (no args) | NEON_DATABASE_URL_DIRECT, VOYAGE_API_KEY | Voyage AI, Neon | Yes |

#### `scripts/` — Supporting Scripts

| Script | Purpose | Relevance |
|--------|---------|-----------|
| `seed-entities.ts` | Populate entity_registry and sanskrit_terms (FTR-033) | Run once per corpus, not per book |
| `generate-suggestion-dictionary.ts` | Rebuild suggestion_dictionary + static JSON (FTR-029) | Run after each book ingestion |
| `generate-suggestions.ts` | **Legacy.** Chapter-titles-only suggestion export. Superseded by `generate-suggestion-dictionary.ts`. | Retained for reference |
| `status.sh` | Infrastructure status check | Reports ingestion state |

### Data Artifacts Map

All per-book data lives under `data/book-ingest/{slug}/`:

```
data/book-ingest/{slug}/
|-- capture-meta.json            Stage 1 output: TOC + book metadata
|-- capture-meta-original.json   Stage 2b backup (reflowable books only)
|-- screen-metadata.json         Manual input for reflowable capture
|-- screen-page-mapping.json     Stage 2b output: screen-to-page mapping
|-- capture-log.json             Stage 2 output: per-page capture record
|-- book.json                    Stage 4 output: complete book manifest
|-- chapter-anchors.json          Audit output: extraction-detected chapter start pages
|-- capture-meta-pre-audit.json  Audit backup: original TOC before --fix
|-- rasa-classifications.json    Stage 10 output: per-chapter rasa + reasoning
|-- contentful-map.json          Stage 8 output: maps chapters to Contentful IDs
|-- pages/
|   +-- page-NNN.png             Stage 2 output: page screenshots (3-digit pad)
|-- extracted/
|   +-- page-NNN.json            Stage 3 output: per-page structured extraction
|-- chapters/
|   |-- 00-front-matter.json     Stage 4 output: front matter assembly
|   +-- NN-slug.json             Stage 4 output: per-chapter assembly
|-- assets/
|   |-- photo-pNNN.png           Stage 6 output: full-resolution photo screens
|   |-- photo-manifest.json      Stage 6 output: photo capture manifest
|   +-- cropped/
|       |-- photo-pNNN-cropped.png  Stage 6b output: cropped individual photos
|       +-- crop-manifest.json      Stage 6b output: crop regions + subjects
+-- qa/
    |-- validation-report.json   Stage 5 output: three-layer validation results
    |-- flagged-pages.json       Stage 5b output: pages needing human review
    +-- review.html              Stage 5b output: side-by-side QA report
```

### External Dependencies

| Service | Scripts Using It | Authentication | Rate/Limits | Cost Driver |
|---------|-----------------|----------------|-------------|-------------|
| Amazon Cloud Reader | collect-toc, capture, capture-photos | Manual browser login (cannot automate) | Navigation speed (~300ms/page) | Free (purchased ebook) |
| AWS Bedrock — Claude Sonnet | extract | AWS credential chain (profile or env) | Region-dependent | ~$0.003/page (image input) |
| AWS Bedrock — Claude Opus | classify-rasa, generate-labels | AWS credential chain | Region-dependent | ~$0.015/chapter (rasa), ~$0.01/label |
| Anthropic API — Claude Haiku | crop-photos | ANTHROPIC_API_KEY | Standard limits | ~$0.001/photo |
| Contentful Management API | import-contentful, migrate-schema | CONTENTFUL_MANAGEMENT_TOKEN | 7 req/s (150ms delay enforced) | Free tier |
| Contentful Delivery API | sync-contentful-to-neon | CONTENTFUL_ACCESS_TOKEN | 78 req/s | Free tier |
| Voyage AI | ingest, sync-contentful-to-neon, backfill-embeddings | VOYAGE_API_KEY | Batch 16 | ~$0.13/million tokens |
| Neon PostgreSQL | 6 scripts | NEON_DATABASE_URL_DIRECT | Connection-based | Scale tier |
| ImageMagick | crop-photos | System binary (`convert`) | N/A | Free |

### Design System Vocabulary Loop

The pipeline maintains a closed vocabulary loop from extraction through CSS rendering. Every content type classification made during extraction determines the visual treatment in the reading surface:

```
extract.ts       block.type = "verse"         (Stage 3)
assemble.ts      paragraph.contentType = "verse"  (Stage 4)
import-contentful TextBlock.contentType = "verse"  (Stage 8)
sync/ingest      book_chunks.content_type = "verse" (Stage 9)
books.ts service ChapterParagraph.contentType = "verse"
ChapterReader    <div data-content-type="verse">
features.css     [data-content-type="verse"] { ... }
```

Valid content types: `prose`, `verse`, `epigraph`, `dialogue`, `caption`.

### Approximate Runtime and Cost (per book)

| Stage | Duration | Cost | Notes |
|-------|----------|------|-------|
| 1: TOC Collection | ~5 min | Free | Manual browser required |
| 2: Page Capture | ~30 min (800 pages) | Free | ~2 pages/sec |
| 2b: Post-Process | ~1 min | Free | File rename + remap |
| 3: Extraction | ~40 min (800 pages @ concurrency 5) | ~$2.50 | ~23 pages/min |
| 4: Assembly | ~10 sec | Free | CPU only |
| 5/5b: Validation + QA | ~30 sec | Free | CPU only |
| 6: Photo Capture | ~10 min | Free | Manual browser required |
| 6b: Photo Cropping | ~5 min (30 photos) | ~$0.03 | Haiku vision |
| 8: Contentful Import | ~20 min | Free | Rate-limited at 7 req/s |
| 9: Neon Sync | ~10 min | ~$0.20 | Voyage embeddings |
| 10: Rasa Classification | ~5 min | ~$0.75 | 49 Opus calls |
| 11: Relations | ~5 min | Free | pgvector HNSW |
| 12: Labels | ~15 min | ~$10 | ~1000 Opus calls |
| 14: Suggestions | ~10 sec | Free | DB queries + JSON export |
| **Total** | **~2.5 hours** | **~$13.50** | Per language edition |

### Execution Playbook: Ingest a New Book

**Prerequisites:**
- Ebook purchased and accessible in Amazon Cloud Reader
- BookConfig entry added to `scripts/book-ingest/src/config.ts`
- Environment variables set (see External Dependencies)
- Chromium running with `--remote-debugging-port=9222`
- Book open in Cloud Reader tab

**Step-by-step:**

```
# 0. Add book configuration
#    Edit scripts/book-ingest/src/config.ts
#    Add BookConfig with: title, author, slug, asin, authorTier, language,
#    expectedChapters, goldenPassages

# 1. Collect TOC (manual browser required)
npx tsx scripts/book-ingest/src/collect-toc.ts --book <slug>
#    Verify: data/book-ingest/<slug>/capture-meta.json exists
#    Check: chapter count matches expectedChapters

# 2. Capture pages (manual browser required)
npx tsx scripts/book-ingest/src/capture.ts --book <slug>
#    For reflowable books, capture produces screen-NNNN.png files

# 2b. Post-process (reflowable only)
#    First: create screen-metadata.json from capture session notes
npx tsx scripts/book-ingest/src/post-process-screens.ts --book <slug>
#    Verify: pages/ now contains page-NNN.png files

# 3. Extract text (automated, ~40 min for 800 pages)
npx tsx scripts/book-ingest/src/extract.ts --book <slug> --concurrency 5
#    Resume on failure: --resume-from <page>

# 4. Assemble chapters
npx tsx scripts/book-ingest/src/assemble.ts --book <slug>
#    Verify: book.json manifest, chapters/*.json

# 5. Validate
npx tsx scripts/book-ingest/src/validate.ts --book <slug>
#    GATE: Review qa/validation-report.json
#    All golden passages must pass
#    No 'fail' results in capture or assembly layers

# 5b. Generate QA report
npx tsx scripts/book-ingest/src/qa-report.ts --book <slug>
#    GATE: Human reviews qa/review.html for flagged pages

# 6. Capture photos (manual browser required)
npx tsx scripts/book-ingest/src/capture-photos.ts --book <slug>

# 6b. Crop photos
npx tsx scripts/book-ingest/src/crop-photos.ts --book <slug>

# 7. Migrate Contentful schema (first book only, or when model changes)
npx tsx scripts/ingest/migrate-contentful-schema.ts

# 8. Import to Contentful
npx tsx scripts/ingest/import-contentful.ts --book <slug>
#    Resume on failure: --resume-from-chapter <N>
#    Output: contentful-map.json

# 9. Sync to Neon (canonical path: Contentful -> Neon)
npx tsx scripts/ingest/sync-contentful-to-neon.ts --book <slug>
#    Alternative (development): npx tsx scripts/ingest/ingest.ts --book <slug>

# 10. Classify rasa
npx tsx scripts/book-ingest/src/classify-rasa.ts --book <slug>
#    Verify: rasa-classifications.json, chapters.rasa column updated

# 11. Compute chunk relations
npx tsx scripts/ingest/compute-relations.ts --book <slug>

# 12. Generate relation labels
npx tsx scripts/ingest/generate-labels.ts

# 13. Backfill any missing embeddings (safety net)
npx tsx scripts/ingest/backfill-embeddings.ts

# 14. Rebuild suggestion dictionary (FTR-029)
npx tsx scripts/generate-suggestion-dictionary.ts
#    Harvests topics, entities, Sanskrit terms, scoped queries from enriched chunks
#    Populates suggestion_dictionary table, exports static JSON to public/data/suggestions/
#    Idempotent: full rebuild each run

# Verify: run search queries against the new book content
```

**Validation gates (marked GATE above):**
- After Stage 5: all golden passages found, no assembly failures
- After Stage 5b: human confirms no systematic extraction errors
- After Stage 9: search queries return expected results

### Adding a New Language

Adding language support for an existing book requires only:

1. Add `LANGUAGE_GUIDANCE` entry in `extract.ts` for the script/diacritics
2. Add `BookConfig` entry in `config.ts` with the language code
3. Add locale to Contentful (if not already present)
4. Run the full playbook above

No schema migrations, no API changes, no search rewrites (per PRI-06).

### Future: Webhook Sync Mode

Post-launch, content updates flow through Contentful webhooks (FTR-022 Webhook Sync Pipeline). The batch pipeline documented here remains the initial ingestion path; webhooks handle incremental editorial updates. The webhook pipeline is specified in FTR-022 and unimplemented as of STG-001.

### Chapter Boundary Verification Gate

Three-layer defense against chapter boundary errors (root cause: reflowable Kindle screen offsets).

**Layer 1: Extraction-time anchors.** `extract.ts` outputs `chapterNumber` and `chapterTitle` per page when Claude Vision detects a chapter heading. `audit-boundaries.ts` collects these into `chapter-anchors.json`.

**Layer 2: Assembly-time cross-reference.** `assemble.ts` cross-references TOC page numbers against extraction anchors before assembling. If any mismatch is found, assembly halts with an error directing the operator to run `audit-boundaries.ts --fix`.

**Layer 3: Post-assembly structural checks.** `validate.ts` Layer 4 checks:
- First paragraph of each chapter starts with a capital letter (catches mid-sentence boundaries)
- No chapter has a missing title
- Word counts within 3x of median (catches missing/extra pages)

**Recovery:** `npx tsx scripts/book-ingest/src/audit-boundaries.ts --book <slug> --fix` updates `capture-meta.json` TOC with extraction-detected page numbers, backs up the original, then re-run `assemble.ts`.

**Root cause of the Chapter 46 error (2026-03-18):** English Autobiography is reflowable (~1.7 screens per page). Kindle Cloud Reader TOC positions are in screen-number space but don't exactly match where Claude Vision finds chapter headings. 23/49 chapters had wrong TOC-vs-extraction page numbers. Fixed by the boundary verification gate. Spanish edition (fixed-layout, 1:1 screen:page) had zero mismatches.

### Golden Passage Standards

Each book requires 20 golden passages across 10 categories:

| Category | Count | What It Catches |
|----------|-------|-----------------|
| Chapter opening lines | 4 | Boundary errors |
| Verse/poetry | 2 | Line break preservation |
| Epigraph with attribution | 2 | Quote extraction |
| Dialogue with em-dashes | 2 | Speaker attribution |
| Photo captions | 2 | Caption accuracy |
| Dates/numbers | 2 | Numeric preservation |
| Footnote markers/distinctive prose | 2 | Marker-text pairing |
| Sanskrit/IAST terms | 1 | Diacritical stripping |
| Key teaching references | 1 | Content integrity |
| Author/lineage names | 2 | Name preservation |

Golden passages are validated during `validate.ts` Layer 3. All 20 must pass before assembly is considered valid.

**Important:** Golden passages must use text that appears in the paragraph stream (`sections[].paragraphs[].text`), not in footnote arrays or metadata fields.

### Re-Scan Protocol

When to re-scan an existing book:
1. **Pipeline code changes** affecting extraction or assembly (new extraction prompt, new assembly logic)
2. **Chapter boundary errors** discovered in production
3. **Golden passage failures** after code changes

Re-scan steps:
1. Recapture screenshots (requires Chromium + Cloud Reader)
2. Re-extract all pages: `extract.ts --book <slug>` (resumes from existing)
3. Audit boundaries: `audit-boundaries.ts --book <slug> --fix`
4. Re-assemble: `assemble.ts --book <slug>`
5. Validate: `validate.ts --book <slug>` (all 20 golden passages must pass)
6. Re-ingest to Neon: `ingest.ts --book <slug> --replace --contentful-map <path>`
7. Re-enrich: `enrich.ts --book <slug>` (new chunks have `enriched_at IS NULL`)
8. Re-compute relations: `compute-relations.ts --book <slug>`
9. Rebuild suggestions: `generate-suggestion-dictionary.ts`

### Screenshot Archival

Screenshots are gitignored (`*.png`). Archive to external storage after each capture session:
- Path: `/media/rana/GRACE/Book/book-ingest-screenshots-{date}/`
- Include: `pages/*.png`, `capture-log.json`, `capture-meta.json`
- Provenance: SHA-256 checksums in `chapter-anchors.json`

## Notes

- **Origin:** Operational companion to FTR-022 (Content Ingestion Pipeline). Created to make pipeline knowledge explicit for AI operators, human operators, and future visual operations surface.
- **FTR number range:** Operations overflow 151-159 exhausted. FTR-164 extends the operations range; update FEATURES.md index accordingly.
- **Legacy script:** `scripts/ingest/ingest-en.ts` is the original English-specific ingestion script, superseded by the generic `scripts/ingest/ingest.ts`. Retained for reference.
- **Entity registry:** `scripts/seed-entities.ts` populates entity_registry and sanskrit_terms (FTR-033). Run once per corpus expansion, not per book. Not part of the per-book pipeline.
- **`scripts/book-ingest/DESIGN.md`:** Historical design document from initial pipeline implementation (2026-02-25). Captured discovery decisions (why ebook over PDF, why not DOM scraping). Superseded by this FTR for operational reference; retained for archaeological context.

### Critical Navigation Lessons (Reflowable Kindle Capture)

Learned through painful trial and error. Do not skip.

- **NEVER click content area (400,400)** — hits hyperlinks in book text, causes unpredictable jumps
- **NEVER click margins (x=10)** — doesn't transfer keyboard focus for PageDown
- **USE "Next page" button** — `page.getByRole('button', { name: 'Next page' }).click({ force: true })` is the only reliable method
- **End-of-book detection:** Use image src comparison, NOT footer text comparison (front matter repeats "Page 1" across 36+ screens)
- **Metadata collection alignment:** Navigation + metadata collection MUST be in the same `browser_run_code` call — separate calls lose position

### Known Book Editions

| Book | Language | ASIN | Layout | Notes |
|------|----------|------|--------|-------|
| Autobiography of a Yogi | en | B00JW44IAI | Reflowable | SRF edition. DO NOT confuse with other editions. |
| Autobiografia de un yogui | es | B07G5KL5RL | Fixed-layout | SRF edition. NOT "Editorial Recien Traducido" B0FDKZ2FLN (48 chapters). |
| Autobiography of a Yogi | hi | TBD | TBD | YSS authorization needed (FTR-119). Title: एक योगी की आत्मकथा |
