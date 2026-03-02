## DES-005: Content Ingestion Pipeline

*Conforms to DES-053 (Unified Content Pipeline Pattern). This is the first pipeline implemented; DES-053's seven-stage pattern was derived from this design. Future content types (video transcripts, magazine articles, audio) should follow the same stages.*

### Arc 1 Pipeline (Source → Contentful → Neon)

Contentful is the editorial source of truth from Arc 1 (ADR-010). The ingestion pipeline imports processed text into Contentful, then syncs to Neon for search indexing. Pre-launch, SRF will provide authoritative digital text that replaces any development-phase extraction.

Three extraction paths feed the pipeline, converging at the Contentful import step:

| Path | Source | Tool | Quality | When |
|------|--------|------|---------|------|
| **Ebook extraction** | Amazon Cloud Reader (purchased ebook) | Playwright capture + Claude Vision OCR | High (born-digital renders, clean diacritics) | Arc 1 development |
| **PDF extraction** | spiritmaji.com PDF | `marker` (open-source Python) | Medium (scan-dependent OCR) | Fallback |
| **SRF digital text** | SRF-provided source files | Direct import | Authoritative | Pre-launch replacement |

The ebook extraction pipeline (`scripts/book-ingest/`) uses Playwright to capture page renders from Amazon Cloud Reader and Claude Vision to OCR structured text from the born-digital images. See `scripts/book-ingest/DESIGN.md` for the complete pipeline specification. This produces significantly cleaner output than PDF OCR, particularly for Sanskrit diacritics (IAST).

**Alternative: Amazon Cloud Reader Ingestion.** When the ebook edition is available, use the Reader ingestion pipeline (`/scripts/book-ingest/`). See `scripts/book-ingest/DESIGN.md`. Produces the same structured output, feeding into Contentful import.

All paths converge at Step 3.5 (Contentful import). The extraction tooling remains valuable for validation even after SRF provides authoritative text.

**Status: English Autobiography extracted.** The `scripts/book-ingest/` pipeline has completed extraction of the English *Autobiography of a Yogi* (522 pages, 49 chapters). Output is structured as per-chapter Markdown files with a `book.json` manifest. This replaces the PDF/marker extraction path for this book. Remaining work for Milestone 1a: Contentful import (Step 3.5), Neon sync + chunking + embedding (Steps 4-9).

```
Step 1: Acquire source text
 └── Path A: Ebook — Playwright capture from Amazon Cloud Reader
     + Claude Vision OCR (scripts/book-ingest/)
 └── Path B: PDF — Download from spiritmaji.com, convert via
     `marker` (open-source, Python) or manual extraction
 └── Path C: SRF digital text (pre-launch) — goes directly
     to Step 3.5 (Contentful import)

Step 2: Convert to structured Markdown
 └── Ebook path: Claude Vision outputs structured Markdown
     with headings, paragraphs, page numbers preserved
 └── PDF path: `marker` or manual extraction + cleanup
 └── Output: chapters as separate .md files
 with headings, paragraphs preserved

Step 2.5: Unicode NFC Normalization (ADR-080)
 └── Apply Unicode NFC normalization to all extracted text
 └── IAST diacritical marks (ā, ṇ, ś, ṣ) have precomposed
 and decomposed representations — OCR output is
 unpredictable about which form it produces
 └── NFC ensures identical-looking strings are byte-identical
 └── Must run BEFORE any text comparison, deduplication,
 embedding, or indexing
 └── Also: detect Devanāgarī script blocks (/[\u0900-\u097F]/)
 in God Talks with Arjuna — flag for display preservation
 but exclude from embedding input

Step 3: Autonomous QA (Claude validates)
 └── Verify OCR accuracy
 └── Correct spiritual terminology
 └── Ensure chapter/page boundaries are correct
 └── Flag Sanskrit diacritics that may have been mangled
 by PDF extraction (ADR-005 E4, ADR-080)
 └── This step is NON-NEGOTIABLE for sacred texts

Step 3.5: Import into Contentful (ADR-010)
 └── Import reviewed text into Contentful via Management API
 └── Create Book → Chapter → Section → TextBlock entries
 └── Map chapter/page boundaries to content model structure
 └── Rich Text AST preserves formatting (bold, italic,
     footnotes, verse numbers, poetry line breaks)
 └── Each TextBlock carries pageNumber for citation
 └── Verify import: spot-check 10% of TextBlocks against
     source markdown for formatting fidelity
 └── Contentful is now the editorial source of truth —
     all subsequent corrections happen here

Step 4: Chunk by Natural Boundaries
 └── Split at paragraph level
 └── Each chunk = one coherent passage
 └── Retain: chapter number, page number, section heading
 └── Target chunk size: 200-500 tokens
 (large enough to be a meaningful quote,
 small enough for precise retrieval)
 └── Include 1-sentence overlap with adjacent chunks
 Overlap algorithm: Take the last sentence of the preceding
 chunk and prepend it to the current chunk. Sentence boundary
 detection: split on /(?<=[.!?])\s+(?=[A-Z""])/ with special
 handling for abbreviations (Mr., Dr., St.) and Sanskrit terms
 containing periods. If the preceding chunk has no clear
 sentence boundary (e.g., verse fragments), use no overlap.
 The overlap text is included in the embedding but marked in
 metadata (overlap_chars count) so it can be excluded from
 display when the chunk is shown as a standalone quote.

Step 5: Language Detection (per-chunk, fastText)
 └── Detect primary language of each chunk
 └── Detect script (Latin, Devanagari, CJK, etc.)
 └── Assign language_confidence score
 └── Arc 1: bilingual (en/es); column populated for all chunks

Step 6: Entity Resolution (ADR-116)
 └── Resolve names, places, Sanskrit terms against entity_registry
 └── Match aliases: "Master" = "Guruji" = "Paramahansa Yogananda"
 └── Sanskrit normalization: "samadhi" = "Samaadhi" = "samahdi"
 └── Unknown entities flagged for review (Claude validates autonomously)
 └── Entity registry must be seeded BEFORE first book ingestion

Step 7: Unified Enrichment (single Claude pass per chunk, ADR-115)
 └── Claude generates structured JSON output:
     summary, topics, entities (typed), domain classification,
     experiential_depth (1–7), emotional_quality, voice_register,
     cross_references, extracted_relationships
 └── Entities validated against entity_registry (Step 6)
 └── Confidence < 0.7 flagged for review (Claude validates autonomously)
 └── Enrichment output stored as structured Postgres columns
 └── Replaces separate classification passes (E3–E8)

Step 8: Generate Embeddings
 └── Voyage voyage-3-large (1024 dimensions, ADR-118)
 └── Asymmetric encoding: document input type for chunks
 └── Cost: ~$0.06 per 1M tokens
 └── Entire Autobiography of a Yogi: < $0.30

Step 9: Insert into Neon (sync from Contentful)
 └── Populate books, chapters, book_chunks tables
 └── Each book_chunk row carries contentful_id linking to
     the source TextBlock in Contentful
 └── BM25 index (pg_search) automatically updated on INSERT
 └── Verify: test searches return expected passages

Step 10: Compute Chunk Relations (ADR-050)
 └── For each new chunk, compute cosine similarity
 against all existing chunks
 └── Store top 30 most similar per chunk in chunk_relations
 └── Exclude adjacent paragraphs from same chapter
 (those are already "in context")
 └── Two modes:
 --full Recompute all relations (after embedding
 model migration per ADR-046)
 --incremental Compute only for new/updated chunks
 and update existing chunks' top-30
 if new chunks displace current entries
 └── Similarity is symmetric (A→B = B→A), so each pair
 computed once, both directions updated
 └── For Autobiography (~2,000 chunks): ~4M pairs, minutes
 └── For full corpus (~50K chunks): batched, still tractable

Step 11: Update Suggestion Dictionary (ADR-049, ADR-120)
 └── Extract distinctive terms from the book's chunks
 └── Add to suggestion_dictionary table with source attribution
 └── Sanskrit terms get inline definitions from sanskrit_terms table
 └── Suggestion index grows with each book — never shrinks

Step 12: Graph Metrics (Milestone 3b+, ADR-117 — nightly batch, not per-ingestion)
 └── Nightly Python + NetworkX job loads full graph from Postgres
 └── Runs PageRank, community detection, betweenness centrality
 └── Writes results to centrality_score, community_id, bridge_score columns
 └── extracted_relationships (Step 7) feed graph structure automatically
```

### Contentful Integration (Implementation)

| Component | File | Status |
|-----------|------|--------|
| Contentful client | `lib/contentful.ts` | Active development |
| Contentful import script | `scripts/ingest/import-contentful.ts` | Active development |
| Inbound webhook handler | `app/api/v1/webhooks/contentful/route.ts` | Active development |
| Ingestion orchestrator | `scripts/ingest/ingest.ts` | Active development |

### Webhook Sync Pipeline (Contentful → Neon, Milestone 1c+)

```
Step 1: Content editors enter/import book text into Contentful
 └── Using the Book → Chapter → Section → TextBlock model
 └── Rich Text fields preserve formatting
 └── Localized versions entered per locale

Step 2: On publish, Contentful webhook fires

Step 3: Sync service receives webhook
 └── Fetches the updated TextBlock
 └── Extracts plain text from Rich Text AST
 └── Language detection (fastText) + entity resolution (ADR-116)
 └── Unified enrichment pass (Claude, ADR-115)
 └── Generates embedding (Voyage voyage-3-large, ADR-118)
 └── Upserts into Neon (matched by contentful_id)

Step 4: Update chunk relations (incremental)
 └── Recompute relations for the updated chunk
 against all existing chunks (1 × N_total)
 └── Update other chunks' top-30 if the updated
 chunk now scores higher than their current #30

Step 5: Update suggestion dictionary
 └── Re-extract terms from updated chunk
 └── Merge into suggestion_dictionary

Step 6: Graph updates (Milestone 3b+, ADR-117)
 └── extracted_relationships updated in Postgres (Step 3)
 └── Nightly batch job recomputes graph metrics automatically

Step 7: Search index, relations, suggestions, and graph
 are always in sync with editorial source
```

---
