---
ftr: 23
title: Chunking Strategy Specification
summary: "Document-type-aware paragraph chunking with 100-500 token range and special handling for poetry and dialogue"
state: implemented
domain: search
governed-by: [PRI-01, PRI-03]
---

# FTR-023: Chunking Strategy Specification

## Rationale

### Context

DESIGN.md specifies chunk relations, storage, embedding, and search in detail. But no document formally defines the chunking algorithm -- the single most important factor in search retrieval quality. A bad chunking strategy produces orphaned fragments (too small) or imprecise retrieval (too large). Yogananda's prose style varies dramatically: terse aphorisms in *Sayings*, flowing narrative in *Autobiography*, verse-by-verse commentary in *The Second Coming of Christ*.

### Decision

Document the chunking strategy as a formal specification. The strategy is document-type-aware.

**Per-Document-Type Chunking:**

| Document Type | Characteristics | Chunking Approach |
|---------------|----------------|-------------------|
| Autobiography / narrative | Continuous prose, idea-per-paragraph | Semantic paragraph, 200-400 tokens, no overlap |
| Scriptural commentary | Verse + interpretation pairs | Verse-bound atomic units |
| Discourse / collected talk | Pedagogical arc | Section-aware, preserve teaching flow |
| Poetry / chant / prayer | Complete works, indivisible | Whole-poem chunks, never split |
| Affirmation | Single-statement units | Individual affirmations as atomic units |

**Default Chunking (STG-001 through STG-008):**
- **Unit:** Paragraph
- **Token range:** 100-500 tokens (target: 200-300)
- **Minimum:** 100 tokens (below this, merge with next paragraph)
- **Maximum:** 500 tokens (split at sentence boundaries)
- **Overlap:** None

**Special handling:** Epigraphs/poetry (single chunk), lists (single chunk), dialogue (single chunk, split at speaker changes if >500 tokens), aphorisms (one chunk per saying), headers (prepended to first paragraph).

### Rationale

- **Paragraph as natural unit.** Yogananda's prose is well-structured with clear paragraph breaks.
- **No overlap avoids duplicate noise.** With paragraph-based chunking, boundaries are meaningful.
- **Token range is empirical.** 200-300 target balances specificity with context.

### Consequences

- STG-001 ingestion script implements default chunking per this specification
- STG-009 verse-aware chunking implements the verse-commentary pair strategy
- STG-021 per-language chunk size validation uses this specification as baseline

## Specification

The chunking algorithm is the single most important factor in search retrieval quality. Yogananda's prose style varies dramatically across books, requiring a nuanced strategy.

### Default Chunking (Stages 1a-3c: narrative, collected talks, short works)

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| **Unit** | Paragraph (typographic paragraph breaks in source text) | Yogananda's paragraphs correspond to idea boundaries |
| **Token range** | 100-500 tokens (target: 200-300) | Balances specificity with context |
| **Minimum** | 100 tokens -- paragraphs below this are merged with the following paragraph | Prevents orphaned fragments |
| **Maximum** | 500 tokens -- split at sentence boundaries, keeping both halves above 100 tokens | Prevents imprecise retrieval |
| **Overlap** | None | Paragraph boundaries are natural semantic boundaries; overlap introduces duplicate search results |

**Metadata preserved per chunk:** `book_id`, `chapter_id`, `paragraph_index`, `page_number`, `language`.

### Special Handling

| Content Type | Strategy | Rationale |
|-------------|----------|-----------|
| **Epigraphs and poetry** | Single chunk regardless of length | Splitting a poem mid-stanza destroys meaning |
| **Lists and enumerations** | Single chunk | Yogananda's numbered instructions are semantically atomic |
| **Dialogue and quoted speech** | Single chunk for continuous exchanges; split at speaker changes if >500 tokens | Preserves conversational flow |
| **Aphorisms** | One chunk per standalone saying/affirmation regardless of length | These books are already atomically organized |
| **Chapter titles and section headers** | Not chunked separately -- prepended to first paragraph | Headers are context, not content |

### Verse-Aware Chunking (STG-009)

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| **Unit** | Verse-commentary pair | Maintains the interpretive relationship |
| **Long commentaries** | Split at paragraph boundaries within commentary; each sub-chunk retains verse text as prefix | Verse context travels with every fragment |
| **Cross-reference** | Verse reference stored as structured metadata | Enables side-by-side commentary view |

### Per-Language Validation (STG-021)

English-calibrated chunk sizes (200-300 tokens) may produce different semantic density across scripts. Validate retrieval quality per language before committing to chunk sizes.

### Semantic Density Classification

| Score | Label | Description | Example |
|-------|-------|-------------|---------|
| `high` | Aphoristic | Maximum meaning per token | *"The soul is ever free; it is deathless, birthless..."* |
| `medium` | Expository | Standard teaching prose | *"When you practice meditation regularly, the mind..."* |
| `low` | Narrative | Story, transition, biographical detail | *"We arrived at the station in the early morning..."* |

**Where density is used:** Today's Wisdom, Quiet Corner, "The Essential Yogananda", Self-Revealing Navigation, search result ranking tiebreaker.

### Corpus Stylometric Fingerprint (FTR-123 extension)

A stylometric fingerprint adds a deeper layer of content integrity: not just "this text hasn't been changed" but "this text is consistent with Yogananda's writing."

**Dimensions captured:** Sentence length distribution, vocabulary frequency, metaphor recurrence, rhetorical mode ratio, passage structure.

**Stage:** STG-009+ (requires substantial corpus ingestion).

## Notes

- **Origin:** FTR-023 (dual-homed: DECISIONS-core.md rationale + design/search/FTR-023-chunking-strategy-specification.md)
