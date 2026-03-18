# Enrichment Pipeline Guide

Operational reference for the FTR-026 unified enrichment pipeline. Audience: AI operator (Claude in future sessions), human operator, visual operations surface.

## What It Does

A single Claude pass per chunk produces all metadata fields that power search ranking, theme pages, daily wisdom curation, practice bridge detection, non-topical search, and the reading surface CSS. This is the keystone between raw ingestion (text in Neon) and a fully functional site.

## Prerequisites

- Book ingested into Neon (`scripts/ingest/sync-contentful-to-neon.ts` complete)
- AWS credentials with Bedrock access (Claude Sonnet or Opus)
- `NEON_DATABASE_URL_DIRECT` in `.env.local`

## Pipeline Stages

```
sync-contentful-to-neon.ts   (chunks + embeddings in Neon)
         |
         v
    enrich.ts                (FTR-026: all metadata fields)
         |
         v
populate-chunk-topics.ts     (wire topics to teaching_topics)
         |
         v
    [optional: generate-suggestion-dictionary.ts]
```

## Scripts

### `scripts/ingest/enrich.ts`

Single Claude pass per chunk producing: summary, topics, entities, domain, experiential_depth, emotional_quality, voice_register, accessibility_level, semantic_density, passage_role, practice_bridge, rasa, rasa_confidence, cross_references.

```bash
# Enrich one book (skip already-enriched chunks)
npx tsx scripts/ingest/enrich.ts --book autobiography-of-a-yogi

# Enrich all books
npx tsx scripts/ingest/enrich.ts --all

# Force re-enrich (overwrite existing enrichment)
npx tsx scripts/ingest/enrich.ts --book autobiography-of-a-yogi --force

# Use Opus instead of Sonnet (higher quality, ~5x cost)
npx tsx scripts/ingest/enrich.ts --book autobiography-of-a-yogi --opus

# Dry run (no DB writes, prints enrichment output)
npx tsx scripts/ingest/enrich.ts --book autobiography-of-a-yogi --dry-run --limit 10

# Control concurrency (default 5)
npx tsx scripts/ingest/enrich.ts --all --concurrency 10
```

**Cost estimates (Sonnet):** ~$3-4 per 1,000 chunks. Full corpus (2,700 chunks): ~$8-10.
**Cost estimates (Opus):** ~$30-40 per 1,000 chunks. Full corpus: ~$80-100.
**Timing:** ~2s per chunk at concurrency 5. Full corpus: ~18 minutes.

**When to re-enrich:**
- After improving the enrichment prompt
- After a model upgrade (filter: `WHERE enrichment_model != '<new_model>'`)
- After ingesting a new book (automatic — only un-enriched chunks are processed)

### `scripts/ingest/populate-chunk-topics.ts`

Maps enriched `book_chunks.topics[]` to `teaching_topics` rows, populating the `chunk_topics` join table that powers theme pages ("Doors of Entry").

Two matching strategies:
1. Exact/fuzzy text match (topic label matches teaching_topics.name)
2. Embedding similarity (topic label embedding vs description_embedding)

```bash
# Populate chunk_topics for one book
npx tsx scripts/ingest/populate-chunk-topics.ts --book autobiography-of-a-yogi

# Populate for all books
npx tsx scripts/ingest/populate-chunk-topics.ts

# Adjust similarity threshold (default 0.55)
npx tsx scripts/ingest/populate-chunk-topics.ts --threshold 0.5

# Dry run
npx tsx scripts/ingest/populate-chunk-topics.ts --dry-run
```

**Requires:** `VOYAGE_API_KEY` for embedding-based matching (falls back to name-only matching without it).

**Prerequisite:** `teaching_topics.description_embedding` must be populated. If embeddings are NULL, the similarity strategy is skipped and only exact name/slug matches work. To seed embeddings, embed each topic's description text via Voyage API and UPDATE the `description_embedding` column. This was done manually on 2026-03-17 for the initial 6 topics.

## Fields Populated

| Field | Type | Source | Powers |
|-------|------|--------|--------|
| `summary` | TEXT | Claude | Search snippets, hover previews |
| `topics` | TEXT[] | Claude | Theme tagging, suggestion dictionary |
| `entities` | JSONB | Claude | Entity registry validation, knowledge graph |
| `domain` | TEXT | Claude | Domain filtering (philosophy/narrative/technique/devotional/poetry) |
| `experiential_depth` | INT 1-7 | Claude | Depth-based navigation, "show deeper" |
| `emotional_quality` | TEXT[] | Claude | Non-topical search ("consoling passages") |
| `voice_register` | TEXT | Claude | Reading surface CSS modulation |
| `accessibility_level` | INT 1-5 | Claude | Today's Wisdom curation (prefer 1-2) |
| `semantic_density` | TEXT | Claude | Daily wisdom, Quiet Corner selection |
| `passage_role` | TEXT | Claude | Structural navigation, "show turning points" |
| `practice_bridge` | BOOLEAN | Claude | FTR-055 technique query routing |
| `rasa` | TEXT | Claude | Per-chunk CSS aesthetic modulation |
| `rasa_confidence` | REAL | Claude | Override threshold for editorial review |
| `cross_references` | JSONB | Claude | Scripture/teacher cross-linking |
| `enrichment_model` | TEXT | Script | Re-enrichment targeting |
| `enriched_at` | TIMESTAMPTZ | Script | Pipeline completion tracking |

## Database Schema

Migration 009 (`migrations/009_enrichment_tracking.sql`) adds:
- `book_chunks.enrichment_model` — which model enriched this chunk
- `book_chunks.enriched_at` — when enrichment last ran
- `book_chunks.passage_role` — rhetorical function (CHECK constraint)
- `book_chunks.practice_bridge` — instructional passage flag
- `books.ingestion_status` — JSONB pipeline tracking

All other enrichment columns existed in migrations 001 and 008.

## Ingestion Status Tracking

Each pipeline stage writes to `books.ingestion_status`:

```json
{
  "capture": "complete",
  "extract": "complete",
  "assemble": "complete",
  "contentful": "complete",
  "neon": "complete",
  "enrich": "complete",
  "relations": "complete",
  "rasa": "complete",
  "chunk_topics": "complete",
  "suggestions": "pending"
}
```

Query: `SELECT title, language, ingestion_status FROM books;`

## Full Book Ingestion Sequence

After a book is in Neon (stages 1-9 per FTR-164):

```bash
# 1. Enrich all chunks
npx tsx scripts/ingest/enrich.ts --book <slug>

# 2. Classify chapter-level rasa
npx tsx scripts/book-ingest/src/classify-rasa.ts --book <slug>

# 3. Compute chunk relations
npx tsx scripts/ingest/compute-relations.ts  # (runs on all books)

# 4. Generate relation labels
npx tsx scripts/ingest/generate-labels.ts --limit 500

# 5. Populate theme tagging
npx tsx scripts/ingest/populate-chunk-topics.ts --book <slug>

# 6. Rebuild suggestion dictionary (when implemented)
# npx tsx scripts/generate-suggestion-dictionary.ts
```

## Closed Vocabularies (CHECK Constraints)

These values are enforced by database CHECK constraints. The enrichment prompt uses the same vocabulary. The design system CSS responds to these values via data attributes.

- **voice_register:** sacred, reverential, instructional, functional, ambient
- **rasa:** shanta, adbhuta, karuna, vira, bhakti
- **content_type:** prose, verse, epigraph, dialogue, caption
- **domain:** philosophy, narrative, technique, devotional, poetry (no CHECK — validated in script)
- **passage_role:** opening, exposition, narrative, turning_point, deepening, illustration, culmination, resolution, transition, aside
- **semantic_density:** high, medium, low (no CHECK — validated in script)
- **emotional_quality:** consoling, inspiring, instructional, devotional, demanding, celebratory (no CHECK — validated in script)

## Idempotency

- `enrich.ts` skips chunks where `enriched_at IS NOT NULL` (use `--force` to re-enrich)
- `populate-chunk-topics.ts` uses `ON CONFLICT DO NOTHING` for existing tags
- Both scripts are safe to re-run at any time
