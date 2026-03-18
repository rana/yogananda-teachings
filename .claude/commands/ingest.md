Book ingestion pipeline orchestrator. Guides through adding a new book to the portal.

$ARGUMENTS

## Pipeline Stages

The ingestion pipeline runs in strict order. Each stage must verify before the next begins.

### Stage 1: Source Preparation
- Source: Kindle ebook screenshots in `data/book-ingest/{slug}/screens/`
- Capture: `scripts/book-ingest/src/capture.ts` (requires ASIN)
- Output: numbered PNG screenshots, one per screen

### Stage 2: Text Extraction
- Script: `scripts/book-ingest/src/extract.ts`
- Model: claude-sonnet-4-20250514 via AWS Bedrock (`default` profile = bedrock-user)
- Output: `data/book-ingest/{slug}/extracted/` (one JSON per screen)
- Verify: spot-check 3–5 extracted files against screenshots

### Stage 3: Assembly
- Script: `scripts/book-ingest/src/assemble.ts`
- Merges extracted screens into chapter files
- Output: `data/book-ingest/{slug}/chapters/`
- Verify: chapter count matches book's table of contents

### Stage 4: Validation
- Script: `scripts/book-ingest/src/validate.ts`
- Checks: chapter continuity, word count ranges, encoding issues
- Fix any flagged errors before proceeding

### Stage 5: Contentful Import
- Script: `scripts/ingest/ingest.ts` (generic) or `scripts/ingest/ingest-en.ts` (English-specific)
- Content model: Book → Chapter → Section → TextBlock (parent references — child points to parent)
- Space ID: `92rnztznqygl`, Locales: `en-US` (default), `es`
- Rate limit: 150ms between API calls (CONTENTFUL_API_DELAY_MS in lib/config.ts)
- Verify: entry counts in Contentful match expected (books, chapters, sections, text blocks)
- Output: `data/book-ingest/{slug}/contentful-map.json` (entry ID mapping)

### Stage 6: Neon Sync
- Script: `scripts/ingest/sync-contentful-to-neon.ts`
- Creates rows in `books`, `chapters`, `book_chunks` tables
- Every chunk gets `contentful_id` for bidirectional linking
- Verify via Neon MCP:
```sql
SELECT b.title, b.language, COUNT(c.id) as chunks
FROM books b
JOIN chapters ch ON ch.book_id = b.id
JOIN book_chunks c ON c.chapter_id = ch.id
WHERE b.title ILIKE '%{book_title}%'
GROUP BY b.title, b.language;
```

### Stage 7: Embedding Generation
- Script: `scripts/ingest/backfill-embeddings.ts`
- Model: voyage-4-large (1024 dimensions)
- Verify 100% coverage:
```sql
SELECT COUNT(*) as total,
  COUNT(embedding) as embedded,
  COUNT(*) - COUNT(embedding) as missing
FROM book_chunks WHERE book_id = '{book_id}';
```

### Stage 8: Chunk Relations
- Script: `scripts/ingest/compute-relations.ts`
- Computes: same_chapter, translation (cross-language), golden_thread (semantic similarity)
- Verify:
```sql
SELECT relation_type, COUNT(*) FROM chunk_relations
WHERE source_chunk_id IN (SELECT id FROM book_chunks WHERE book_id = '{book_id}')
GROUP BY relation_type;
```

### Stage 9: Post-Ingestion Verification
Run all of these:
1. Corpus overview query (all books, chunk counts, embedding coverage)
2. Search test: 3 thematic queries that should surface the new book
3. Suggestion dictionary: verify new book's vocabulary appears in `suggestion_dictionary`
4. Update `BOOK_CATALOG_VERSION` in `lib/config.ts` (triggers nav "new books" indicator)

## Workflow

If `$ARGUMENTS` specifies a book slug or title:
1. Check for existing source data in `data/book-ingest/`
2. Check database for partially-ingested state
3. Determine which stage to resume from
4. Guide through remaining stages

If `$ARGUMENTS` is "status" or empty:
1. Query current corpus state via Neon MCP:
```sql
SELECT b.title, b.language, b.content_format, b.author_tier,
  COUNT(DISTINCT ch.id) as chapters, COUNT(c.id) as chunks,
  COUNT(c.embedding) as embedded
FROM books b
LEFT JOIN chapters ch ON ch.book_id = b.id
LEFT JOIN book_chunks c ON c.chapter_id = ch.id
GROUP BY b.id ORDER BY b.title;
```
2. Show FTR-120 priority (Wave 1: Where There Is Light, Sayings, Scientific Healing Affirmations)
3. Recommend next book to ingest

## Book Priority (FTR-120)

| Wave | Books | Complexity |
|------|-------|------------|
| 1 | Where There Is Light, Sayings of Paramahansa Yogananda, Scientific Healing Affirmations | Low — short, topically structured |
| 2 | Man's Eternal Quest, The Divine Romance | Moderate — collected talks |
| 3 | How You Can Talk With God, Metaphysical Meditations, Journey to Self-Realization | Low–Moderate |
| 4 | Wine of the Mystic, The Second Coming of Christ (2v), God Talks With Arjuna (2v) | High — verse-aware chunking |

## Error Recovery

- **Contentful rate limit (429):** Increase `CONTENTFUL_API_DELAY_MS` in lib/config.ts
- **Bedrock throttle:** Reduce concurrency in extract.ts, or wait and retry
- **Embedding failures:** Re-run backfill-embeddings.ts — it skips already-embedded chunks
- **Duplicate chunks:** Check `content_hash` column — schema enforces uniqueness via generated column
