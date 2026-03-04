## ADR-085: Book Ingestion Pipeline

The content pipeline transforms a published book from its digital reading format (Kindle Cloud Reader) into structured, design-system-aware data in Contentful and Neon. Every semantic concept in the design language — register, rasa, content type, section boundaries — must be present in the ingested data for the reading surface to render correctly.

### Pipeline Architecture

```
Kindle Cloud Reader
       │
       ▼  (1) capture.ts — Playwright
  Page Screenshots + Text
       │
       ▼  (2) extract.ts — Claude Vision API
  Per-Page JSON Extractions
       │
       ▼  (3) assemble.ts — Chapter Assembly
  Chapter JSON + Book Manifest
       │
       ▼  (4) import-contentful.ts — Contentful Management API
  Contentful (editorial source of truth)
       │
       ├──▶ (5) classify-rasa.ts — Claude API
       │         Rasa classification per chapter → Neon
       │
       └──▶ (6) sync-contentful-to-neon.ts — Contentful CDA → Neon PostgreSQL
              Neon (derived searchable cache)
```

The canonical data flow is **Contentful → Neon** (ADR-010). Stage 6 (`sync-contentful-to-neon.ts`) reads from the Contentful Content Delivery API and writes to Neon, honoring the canonical direction. The local JSON intermediary exists because extraction is expensive (Claude Vision API calls per page) and must be checkpointed. Contentful is the editorial source of truth; Neon is the derived, searchable, embedding-enriched cache.

**Development shortcut:** `ingest.ts` can write directly from local JSON to Neon (bypassing Contentful). Use for development iteration only; production flow always goes through Contentful.

### Stage 1: Capture (`scripts/book-ingest/src/capture.ts`)

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| **Tool** | Playwright (Chromium) | Kindle Cloud Reader is a web app; Playwright automates page navigation and screenshot capture |
| **Output** | `data/book-ingest/{slug}/screenshots/page-{NNN}.png` | Full-page screenshots at native resolution |
| **Page navigation** | Automated forward pagination with stabilization delay | Kindle re-renders on each page turn; wait for text to settle |
| **Authentication** | Manual login, then automated capture | Amazon SSO cannot be automated safely |

**Photograph capture:** Screenshots include all visual content on the page — text, photographs, ornaments. Photographs are captured as part of the page screenshot, not individually. See ADR-085 §Photo Extraction for the cropping pipeline.

### Stage 2: Extract (`scripts/book-ingest/src/extract.ts`)

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| **Model** | Claude (Opus or Sonnet with vision) | Best-in-class document understanding for mixed text/image pages |
| **Input** | Page screenshot (PNG) | Vision model reads the rendered page as a human would |
| **Output** | `data/book-ingest/{slug}/extracted/page-{NNN}.json` | Structured JSON per page |
| **Schema** | `PageExtraction` type — content blocks, images, metadata, validation | Closed vocabulary of block types maps to design system content types |

**Content block types extracted:**

| Block Type | Design System Content Type | CSS Class |
|-----------|--------------------------|-----------|
| `paragraph` | `prose` | (default `<p>`) |
| `verse` | `verse` | `.reader-verse` |
| `epigraph` | `epigraph` | `.reader-epigraph` |
| `caption` | `caption` | `.book-caption` |
| `dialogue` | `dialogue` | `.reader-dialogue` |
| `heading` / `subheading` | (section boundary) | Section heading |
| `decorative` | (scene break) | `.reader-scene-break` |
| `footnote` | (footnote) | `.footnote-ref` |
| `running-header` / `page-number` | (skipped) | — |

**Per-page metadata:** Sanskrit terms, named entities, confidence score, human review flag, rasa (per-page — aggregated to chapter level in Stage 5).

### Stage 3: Assemble (`scripts/book-ingest/src/assemble.ts`)

Combines per-page extractions into chapter-level files. Key operations:

| Operation | Description |
|-----------|-------------|
| **Page continuation** | Paragraphs split across page boundaries are merged (hyphen-aware) |
| **Section grouping** | Decorative elements (`———•———`, `———❀———`) create section boundaries via incrementing `sectionIndex` |
| **Epigraph extraction** | Content blocks before the first body paragraph are extracted as chapter-level epigraphs |
| **Heading boundaries** | `heading` / `subheading` blocks create new sections with headings |
| **Content type preservation** | Block types flow through as `contentType` on each paragraph |
| **Formatting spans** | Character-level italic/bold/superscript preserved with adjusted offsets after page-boundary merges |

**Output:** `data/book-ingest/{slug}/chapters/{NN}-{chapter-slug}.json` + `book.json` manifest.

### Stage 4: Import to Contentful (`scripts/ingest/import-contentful.ts`)

Creates Contentful entries matching the editorial data model:

| Contentful Type | Source | Key Fields |
|----------------|--------|------------|
| **Book** | `book.json` manifest | title, author, language, pageCount |
| **Chapter** | Chapter JSON | number, title, epigraph, epigraphAttribution |
| **Section** | Assembly sections | heading (nullable), sortOrder within chapter |
| **TextBlock** | Assembly paragraphs | text, contentType, formatting, pageNumber, sortOrder |

**One Section per assembly section** (not one per chapter). Scene breaks in the physical book become Section boundaries in Contentful. This preserves the book's interior rhythm.

### Stage 5: Rasa Classification (`scripts/book-ingest/src/classify-rasa.ts`)

Classifies the prevailing aesthetic flavor (rasa) per chapter using Claude API.

| Rasa | Sanskrit | Aesthetic Quality | CSS Effect |
|------|----------|------------------|------------|
| śānta | शान्त | Peace, equanimity | Default — no modulation |
| adbhuta | अद्भुत | Wonder, cosmic vastness | `--rasa-whitespace-scale: 1.25` |
| karuṇā | करुणा | Compassion, tenderness | `--rasa-whitespace-scale: 1.1` |
| vīra | वीर | Courage, discipline | `--rasa-whitespace-scale: 0.95` |
| bhakti | भक्ति | Devotion, surrender | `--rasa-whitespace-scale: 1.15`, `line-height: 1.9` |

**Method:** Feed first ~2000 tokens of each chapter to Claude with the five rasa definitions. Classification stored on `chapters.rasa` in Neon and on Chapter entry in Contentful.

### Stage 6: Ingest to Neon (`scripts/ingest/ingest.ts`)

Reads assembled chapter JSON and writes to Neon PostgreSQL (migration 008 schema).

| Column | Source | Purpose |
|--------|--------|---------|
| `content` | Paragraph/chunk text | Search, display |
| `slug` | Generated from content (first 5 significant words) | URL-safe passage identifier |
| `formatting` | JSONB array of `{start, end, style}` spans | Rich text rendering |
| `content_type` | From extraction block type | CSS class selection |
| `section_index` | From assembly section grouping | Scene break rendering |
| `sort_order` | Sequential within chapter | Display ordering |
| `rasa` | From classification (Stage 5) | Per-chunk rasa (nullable) |

**Chunking** follows ADR-048: paragraph-based, 100–500 token range, content-type-aware (never merge across content type or section boundaries).

**Slug generation** uses a TypeScript implementation mirroring the PostgreSQL `generate_content_slug()` function with collision tracking (`-2`, `-3` suffixes for duplicate base slugs within the same language).

**Embeddings** via Voyage API (`voyage-3-large`, 1024 dimensions). Can be skipped with `--skip-embeddings` and backfilled later.

### Photo Extraction

Photographs in the captured page screenshots are not individually cropped. The raw captures include surrounding text. A separate photo pipeline is needed:

1. **Identify photo regions** from `photo-manifest.json` (generated during capture)
2. **Crop individual photographs** from page screenshots using bounding box detection
3. **Generate optimized variants** (WebP, responsive sizes) for the portal
4. **Upload to Contentful** as Asset entries linked from TextBlocks

**Current state:** English edition has 70 raw photo captures across 29 pages (32MB). Spanish edition has 0 captures. Photo manifest includes captions, descriptions, and `isPhotograph`/`isIllustration` flags.

### Idempotency

Both `ingest.ts` and `sync-contentful-to-neon.ts` support `--replace` for idempotent re-ingestion — deletes existing book data (respecting FK cascades) before inserting.

### Running the Pipeline

```bash
# Prerequisites: .env.local with NEON_DATABASE_URL_DIRECT, VOYAGE_API_KEY,
#   CONTENTFUL_SPACE_ID, CONTENTFUL_MANAGEMENT_TOKEN, CONTENTFUL_ACCESS_TOKEN

# 1. Capture (requires manual Kindle login first)
npx tsx scripts/book-ingest/src/capture.ts --book autobiography-of-a-yogi

# 2. Extract (expensive — ~$15-30 per book in Claude API costs)
npx tsx scripts/book-ingest/src/extract.ts --book autobiography-of-a-yogi

# 3. Assemble
npx tsx scripts/book-ingest/src/assemble.ts --book autobiography-of-a-yogi

# 4. Import to Contentful (source of truth)
npx tsx scripts/ingest/import-contentful.ts --book autobiography-of-a-yogi [--dry-run]

# 5. Classify rasa
npx tsx scripts/book-ingest/src/classify-rasa.ts --book autobiography-of-a-yogi

# 6. Sync Contentful → Neon (canonical flow — ADR-010)
npx tsx scripts/ingest/sync-contentful-to-neon.ts --book autobiography-of-a-yogi [--replace] [--skip-embeddings] [--dry-run]

# 6-alt. Direct ingest from local JSON (development shortcut — bypasses Contentful)
npx tsx scripts/ingest/ingest.ts --book autobiography-of-a-yogi [--replace] [--skip-embeddings] [--dry-run]
```

### Design System Vocabulary Loop

The closed vocabulary loop ensures semantic fidelity from extraction to rendering:

```
extract.ts          → block.type = "verse"
assemble.ts         → paragraph.contentType = "verse"
import-contentful.ts → TextBlock.contentType = "verse"
ingest.ts           → book_chunks.content_type = "verse"
books.ts            → ChapterParagraph.contentType = "verse"
ChapterReader.tsx   → <div class="reader-verse">
features.css        → .reader-verse { text-align: center; font-style: italic; ... }
```

Same closed loop for: prose, epigraph, caption, dialogue. Same for section boundaries (decorative → sectionIndex → scene break `<hr>`). Same for rasa (classify → chapters.rasa → data-rasa → CSS whitespace modulation).

### Governing Decisions

- **ADR-010** — Contentful as editorial source of truth
- **ADR-048** — Chunking strategy (token ranges, content-type-aware merging)
- **ADR-080** — Latin-only drop capitals (Devanagari shirorekha conflict)
- **Migration 008** — Content structure schema additions (content_type, section_index, sort_order, rasa, formatting)

### Books Processed

| Book | Language | Pages | Chapters | Chunks | Photos | Rasa Classified |
|------|----------|-------|----------|--------|--------|----------------|
| Autobiography of a Yogi | en | 955 | 49 | 1707 | 70 (raw) | Yes |
| Autobiografía de un yogui | es | 815 | 49 | 1185 | 0 | Yes (mirrored) |
