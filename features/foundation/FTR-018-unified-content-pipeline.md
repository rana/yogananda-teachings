---
ftr: 18
title: Unified Content Pipeline Pattern
state: approved
domain: foundation
arc: 1+
governed-by: [PRI-01, PRI-02]
always-load: true
---

# FTR-018: Unified Content Pipeline Pattern

## Rationale

Content enters the portal through five media-type-specific pipelines: books (FTR-022), magazine articles (FTR-075), video transcripts (FTR-142), audio transcripts (FTR-142), and images (FTR-073). Each is specified independently, but all follow a shared seven-stage pattern. This section names the pattern explicitly, so that Arc 6+ implementations and future content types inherit the structure rather than re-inventing it.

### The Seven Stages

```
Source → Normalize → Chunk → Embed → QA → Index → Relate
```

| Stage | What Happens | Governing Decisions |
|---|---|---|
| **1. Source** | Raw content acquired: PDF scan, Contentful entry, YouTube caption, audio file, image file. Format varies by media type. | FTR-120 (book priority), FTR-075 (magazine), FTR-142 (video), FTR-142 (audio), FTR-073 (images) |
| **2. Normalize** | Convert to a uniform text representation. PDFs → structured text with page/paragraph boundaries. Captions → timestamped transcript. Audio → Whisper transcription. Images → editorial description text (images are not directly searchable). | FTR-022 (book normalization), FTR-142 (caption → transcript), FTR-142 (audio → Whisper) |
| **3. Chunk** | Segment normalized text into retrieval units. Books use paragraph-based chunking (FTR-023). Transcripts use speaker-turn or timestamp-window chunking. Image descriptions are single-chunk. | FTR-023 (chunking strategy) — book-specific but principles apply cross-media |
| **4. Embed** | Generate vector embeddings for each chunk. Same embedding model across all content types (FTR-024). `embedding_model` column tracks the model version. Multilingual benchmarking applies (FTR-024). | FTR-024, FTR-024 |
| **5. QA** | Mandatory human review gate. Every chunk's text, citation, and metadata are verified before the content reaches seekers. AI-assisted (Claude flags anomalies), human-approved. Review enters the unified review queue (FTR-067). | FTR-001 (verbatim fidelity), FTR-135 (human review mandatory), FTR-067 (review queue) |
| **6. Index** | Approved chunks enter the search index: BM25 index (pg_search) automatically updated on INSERT, vector embeddings available for similarity queries, content surfaced in browse pages and theme listings. | FTR-020 (hybrid search), FTR-025 (pg_search BM25), FTR-015 (API endpoints) |
| **7. Relate** | Pre-compute cross-content relationships: chunk-to-chunk similarity (FTR-030), theme membership (FTR-121), cross-media relations (FTR-142), Knowledge Graph edges (FTR-035). Relations are computed after indexing, not during — they're a derived layer. | FTR-030, FTR-142, FTR-035 |

### Media-Type Variations

The stages are shared; the implementations differ:

| Media Type | Source Format | Chunking Unit | Special QA | Relation Types |
|---|---|---|---|---|
| **Books** | Contentful Rich Text (imported from PDF or digital text) | Paragraph (FTR-023) | Page number verification, edition alignment | chunk_relations, theme_membership |
| **Magazine** | Contentful entry or PDF | Article section | Author attribution verification | chunk_relations, theme_membership, issue_membership |
| **Video** | YouTube caption / Whisper | Speaker turn + timestamp window | Timestamp accuracy, speaker diarization | chunk_relations, cross_media (video ↔ book) |
| **Audio** | Whisper transcription | Speaker turn + timestamp window | Sacred artifact flag for Yogananda's voice | chunk_relations, cross_media (audio ↔ book), performance_of (chant) |
| **Images** | Editorial description | Single chunk (description text) | Alt text review, sacred image guidelines (FTR-073) | depicts_person, depicts_place, related_passage |

### When to use this pattern

Any new content type entering the portal in future arcs (e.g., letters, unpublished manuscripts, study guides) should follow this seven-stage pattern. The implementation checklist for a new content type:

1. Define source format and normalization process
2. Choose chunking strategy (or declare single-chunk if the unit is atomic)
3. Verify embedding model handles the content type adequately (or benchmark alternatives per FTR-024)
4. Add a QA review queue type to FTR-067
5. Update the search index to include the new content type (FTR-015 API, FTR-020 hybrid search)
6. Define relation types and update the Knowledge Graph node/edge types (FTR-035)
7. Update this section's Media-Type Variations table

### Not a premature abstraction

Arcs 1–3 implement each pipeline independently — books, magazine, then video/audio/images. The unified content hub (FTR-142) arrives in Arc 6 as a deliberate migration. This section documents the *pattern* shared across independent implementations, not a shared codebase. If a shared `ContentPipeline` base class emerges naturally during Arc 6, it should be extracted from working code, not designed in advance.
