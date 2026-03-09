---
ftr: 22
title: Content Ingestion Pipeline
state: approved
domain: search
arc: 1a+
governed-by: [PRI-01, PRI-06, PRI-12]
---

# FTR-022: Content Ingestion Pipeline

## Rationale

*Conforms to FTR-018 (Unified Content Pipeline Pattern). This is the first pipeline implemented; FTR-018's seven-stage pattern was derived from this design. Future content types (video transcripts, magazine articles, audio) should follow the same stages.*

### Arc 1 Pipeline (Source -> Contentful -> Neon)

Contentful is the editorial source of truth from Arc 1 (FTR-102). The ingestion pipeline imports processed text into Contentful, then syncs to Neon for search indexing. Pre-launch, SRF will provide authoritative digital text that replaces any development-phase extraction.

Three extraction paths feed the pipeline, converging at the Contentful import step:

| Path | Source | Tool | Quality | When |
|------|--------|------|---------|------|
| **Ebook extraction** | Amazon Cloud Reader (purchased ebook) | Playwright capture + Claude Vision OCR | High (born-digital renders, clean diacritics) | Arc 1 development |
| **PDF extraction** | spiritmaji.com PDF | `marker` (open-source Python) | Medium (scan-dependent OCR) | Fallback |
| **SRF digital text** | SRF-provided source files | Direct import | Authoritative | Pre-launch replacement |

The ebook extraction pipeline (`scripts/book-ingest/`) uses Playwright to capture page renders from Amazon Cloud Reader and Claude Vision to OCR structured text from the born-digital images. This produces significantly cleaner output than PDF OCR, particularly for Sanskrit diacritics (IAST).

All paths converge at Step 3.5 (Contentful import). The extraction tooling remains valuable for validation even after SRF provides authoritative text.

```
Step 1: Acquire source text
 - Path A: Ebook -- Playwright capture from Amazon Cloud Reader
     + Claude Vision OCR (scripts/book-ingest/)
 - Path B: PDF -- Download from spiritmaji.com, convert via
     `marker` (open-source, Python) or manual extraction
 - Path C: SRF digital text (pre-launch) -- goes directly
     to Step 3.5 (Contentful import)

Step 2: Convert to structured Markdown
Step 2.5: Unicode NFC Normalization (FTR-131)
Step 3: Autonomous QA (Claude validates)
Step 3.5: Import into Contentful (FTR-102)
Step 4: Chunk by Natural Boundaries
Step 5: Language Detection (per-chunk, fastText)
Step 6: Entity Resolution (FTR-033)
Step 7: Unified Enrichment (single Claude pass per chunk, FTR-026)
Step 8: Generate Embeddings
Step 9: Insert into Neon (sync from Contentful)
Step 10: Compute Chunk Relations (FTR-030)
Step 11: Rebuild Suggestion Dictionary (FTR-029)
  - Harvest topics, entities, Sanskrit terms from enriched chunks
  - Generate scoped queries from entity-topic co-occurrence
  - Compute weights, export to suggestion_dictionary table
  - Export partitioned static JSON to public/data/suggestions/
  - Script: scripts/generate-suggestion-dictionary.ts (idempotent full rebuild)
Step 12: Graph Metrics (Milestone 3b+, FTR-034)
```

### Webhook Sync Pipeline (Contentful -> Neon, Milestone 1c+)

```
Step 1: Content editors enter/import book text into Contentful
Step 2: On publish, Contentful webhook fires
Step 3: Sync service receives webhook
Step 4: Update chunk relations (incremental)
Step 5: Rebuild suggestion dictionary (FTR-029 -- full rebuild, idempotent)
Step 6: Graph updates (Milestone 3b+, FTR-034)
Step 7: Search index, relations, suggestions, and graph
 are always in sync with editorial source
```

## Specification

### Book Ingestion Pipeline Architecture

The content pipeline transforms a published book from its digital reading format (Kindle Cloud Reader) into structured, design-system-aware data in Contentful and Neon. Every semantic concept in the design language -- register, rasa, content type, section boundaries -- must be present in the ingested data for the reading surface to render correctly.

```
Kindle Cloud Reader
       |
       v  (1) capture.ts -- Playwright
  Page Screenshots + Text
       |
       v  (2) extract.ts -- Claude Vision API
  Per-Page JSON Extractions
       |
       v  (3) assemble.ts -- Chapter Assembly
  Chapter JSON + Book Manifest
       |
       v  (4) import-contentful.ts -- Contentful Management API
  Contentful (editorial source of truth)
       |
       v  (5) sync-contentful-to-neon.ts -- Contentful CDA -> Neon PostgreSQL
              Neon (derived searchable cache)
                     |
                     v  (6) classify-rasa.ts -- Claude Opus API
              Neon chapters.rasa (AI enrichment -- FTR-071)
```

The canonical data flow is **Contentful -> Neon** (FTR-102). Contentful is the editorial source of truth; Neon is the derived, searchable, embedding-enriched cache.

### Stage 1: Capture (`scripts/book-ingest/src/capture.ts`)

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| **Tool** | Playwright (Chromium) | Kindle Cloud Reader is a web app |
| **Output** | `data/book-ingest/{slug}/screenshots/page-{NNN}.png` | Full-page screenshots |
| **Page navigation** | Automated forward pagination with stabilization delay | Kindle re-renders on each page turn |
| **Authentication** | Manual login, then automated capture | Amazon SSO cannot be automated safely |

### Stage 2: Extract (`scripts/book-ingest/src/extract.ts`)

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| **Model** | Claude (Opus or Sonnet with vision) | Best-in-class document understanding |
| **Input** | Page screenshot (PNG) | Vision model reads the rendered page |
| **Output** | `data/book-ingest/{slug}/extracted/page-{NNN}.json` | Structured JSON per page |

**Content block types extracted:** paragraph, verse, epigraph, caption, dialogue, heading/subheading, decorative, footnote, running-header/page-number.

### Stage 3: Assemble (`scripts/book-ingest/src/assemble.ts`)

Key operations: page continuation (hyphen-aware merge), section grouping, epigraph extraction, heading boundaries, content type preservation, formatting spans.

### Stage 4: Import to Contentful (`scripts/ingest/import-contentful.ts`)

Creates Contentful entries: Book, Chapter, Section, TextBlock. One Section per assembly section (not one per chapter). Scene breaks become Section boundaries.

### Stage 5: Sync to Neon (`scripts/ingest/sync-contentful-to-neon.ts`)

Chunking follows FTR-023: paragraph-based, 100-500 token range, content-type-aware. Embeddings via Voyage API (voyage-3-large, 1024 dimensions).

### Stage 6: Rasa Classification (`scripts/book-ingest/src/classify-rasa.ts`)

AI enrichment step (FTR-071 Phase 3d). Classifies the prevailing aesthetic flavor (rasa) per chapter using Claude Opus.

| Rasa | Aesthetic Quality | CSS Effect |
|------|------------------|------------|
| shanta | Peace, equanimity | Default -- no modulation |
| adbhuta | Wonder, cosmic vastness | `--rasa-whitespace-scale: 1.25` |
| karuna | Compassion, tenderness | `--rasa-whitespace-scale: 1.1` |
| vira | Courage, discipline | `--rasa-whitespace-scale: 0.95` |
| bhakti | Devotion, surrender | `--rasa-whitespace-scale: 1.15`, `line-height: 1.9` |

### Design System Vocabulary Loop

```
extract.ts          -> block.type = "verse"
assemble.ts         -> paragraph.contentType = "verse"
import-contentful.ts -> TextBlock.contentType = "verse"
ingest.ts           -> book_chunks.content_type = "verse"
books.ts            -> ChapterParagraph.contentType = "verse"
ChapterReader.tsx   -> <div class="reader-verse">
features.css        -> .reader-verse { text-align: center; font-style: italic; ... }
```

### Books Processed

| Book | Language | Pages | Chapters | Chunks | Photos | Rasa Classified |
|------|----------|-------|----------|--------|--------|----------------|
| Autobiography of a Yogi | en | 955 | 49 | 1707 | 70 (raw) | Yes |
| Autobiografia de un yogui | es | 815 | 49 | 1185 | 0 | Yes (mirrored) |

## Notes

- **Origin:** FTR-022 (Content Ingestion Pipeline) + FTR-022 design file (Book Ingestion Pipeline)
- **Merge:** FTR-022 pipeline stages as Rationale, FTR-022 book-specific pipeline as Specification
