---
ftr: 26
title: "Unified Enrichment Pipeline — Single Index-Time Pass per Chunk"
summary: "Single Claude prompt per chunk producing topics, entities, domain, depth, tone, and all metadata in one pass"
state: implemented
re-evaluate-at: M3b
domain: search
governed-by: [PRI-01, PRI-03, PRI-12]
depends-on: [FTR-005, FTR-105]
---

# FTR-026: Unified Enrichment Pipeline

## Rationale

### Context

FTR-005 defines eight permitted Claude use cases (E1-E8). Some operate at query time (E1: intent classification, E2: terminology bridge), but several operate at index time on each chunk: E3 (accessibility rating), E4 (ingestion QA), E6 (chunk relation classification), E8 (tone classification). Additionally, the RAG Architecture Proposal identifies further index-time enrichments: topics, entities, domain classification, experiential depth, voice register, emotional quality, cross-references, and relationship extraction.

Running separate Claude calls per chunk for each enrichment type is wasteful and inconsistent -- a single prompt seeing the full chunk can produce more coherent, contextually informed outputs than six separate prompts each seeing the chunk in isolation.

### Decision

Consolidate all index-time Claude enrichment into a single prompt per chunk. The enrichment pipeline produces one structured JSON output containing all metadata fields:

```json
{
  "summary": "This passage describes Yogananda's experience of cosmic consciousness during meditation...",
  "topics": ["cosmic consciousness", "samadhi", "divine union"],
  "entities": {
    "teachers": ["Paramahansa Yogananda"],
    "divine_names": ["Divine Mother"],
    "techniques": ["Kriya Yoga"],
    "sanskrit_terms": ["samadhi", "nirvikalpa"],
    "works": [],
    "concepts": ["cosmic consciousness", "self-realization"],
    "places": ["Encinitas"],
    "experiential_states": ["nirvikalpa samadhi"]
  },
  "domain": "philosophy",
  "experiential_depth": 7,
  "emotional_quality": ["inspiring", "devotional"],
  "voice_register": "cosmic",
  "accessibility_level": 4,
  "semantic_density": "high",
  "cross_references": [
    {"type": "scripture", "ref": "Bhagavad Gita IV:35", "explicit": true}
  ],
  "passage_role": "culmination",
  "relationships": [
    {
      "subject": "Paramahansa Yogananda",
      "relationship": "DESCRIBES_STATE",
      "object": "nirvikalpa samadhi",
      "confidence": 0.95
    }
  ]
}
```

**Enrichment field definitions:**

| Field | Type | Description |
|-------|------|-------------|
| `summary` | TEXT | "This passage is primarily about..." -- in the chunk's detected language |
| `topics` | TEXT[] | Canonical topic labels for thematic indexing |
| `entities` | JSONB | Typed entity extraction, validated against entity registry (FTR-033) |
| `domain` | TEXT | philosophy / narrative / technique / devotional / poetry |
| `experiential_depth` | INT (1-7) | Level of consciousness described: 1=ordinary waking, 2=relaxed concentration, 3=pratyahara, 4=dharana, 5=dhyana, 6=sabikalpa samadhi, 7=nirvikalpa/cosmic consciousness |
| `emotional_quality` | TEXT[] | consoling / inspiring / instructional / devotional / demanding / celebratory |
| `voice_register` | TEXT | intimate / cosmic / instructional / devotional / philosophical / humorous |
| `accessibility_level` | INT (1-5) | Language/concept accessibility (from FTR-005 E3) |
| `semantic_density` | TEXT | high / medium / low (from FTR-023) |
| `passage_role` | TEXT | Rhetorical function within chapter: opening / exposition / narrative / turning_point / deepening / illustration / culmination / resolution / transition / aside. Inferred from content + chapter title + sequential position. Seeds structural enrichment (FTR-128). |
| `practice_bridge_candidate` | BOOLEAN | True when the passage contains instructional language inviting the reader to practice — "meditate," "visualize," "concentrate," "close your eyes," "practice this." Detects textual phase shifts where the author transitions from exposition to direct injunction (FTR-055). AI-proposed at ingestion; enters human review queue before publication. |
| `cross_references` | JSONB | Explicit references to other works, teachers, scriptures |
| `relationships` | JSONB[] | Extracted entity-relationship triples for graph construction |

**Key constraints:**
- The enrichment prompt runs in the chunk's detected language
- Entity names are validated against the canonical entity registry (FTR-033)
- Confidence < 0.7 on any relationship flags it for human review queue
- Enrichment output is stored as structured Postgres columns, not raw JSON blobs
- Claude Opus is used for enrichment (batch tier, FTR-105) -- accuracy matters more than speed at index time

**Query-time operations remain separate:** E1 (intent classification) and E2 (terminology bridge) operate at query time and are not part of this pipeline.

### Rationale

- **One prompt is more coherent than six.** Claude seeing the full chunk once can produce internally consistent outputs -- the domain classification informs the emotional quality, the entity extraction informs the relationship extraction.
- **Cost reduction.** One Opus call per chunk instead of multiple Haiku calls. At ~50K chunks, the difference is significant.
- **The enrichment prompt is the most consequential engineering in the system.** Everything downstream -- search quality, suggestion vocabulary, graph construction, related teachings categorization -- depends on enrichment quality. A unified prompt with a single, carefully designed output schema is easier to test, iterate, and validate than six separate prompts.
- **Consistent with "AI proposes, humans approve."** The enrichment pipeline produces structured metadata. Confidence-flagged outputs enter the human review queue. Published content always passes through human verification.

### Consequences

- New enrichment columns added to `book_chunks`: `experiential_depth`, `voice_register`, `emotional_quality`, `cross_references`, `domain` (see FTR-021)
- The ingestion pipeline (FTR-022) is updated to include the unified enrichment step
- An `extracted_relationships` table logs all relationship triples for graph intelligence (FTR-034)
- The enrichment prompt itself requires a dedicated design sprint -- test against 20-30 actual passages spanning all document types before committing the pipeline (Milestone 1a pre-implementation checklist)
- FTR-005 E3, E4, E6, E8 are folded into this pipeline; E1, E2, E5, E7 remain as separate operations

## Notes

- **Origin:** FTR-026
- **Implemented (2026-03-18):** `scripts/ingest/enrich.ts` — single Claude Sonnet pass per chunk, all metadata fields. Migration 009 adds `enrichment_model`, `enriched_at`, `passage_role`, `practice_bridge` columns. `scripts/ingest/populate-chunk-topics.ts` wires enriched topics to `chunk_topics` join table. Default model: Sonnet 4.6 (`us.anthropic.claude-sonnet-4-6` via Bedrock inference profile); `--opus` flag for quality-critical runs (`us.anthropic.claude-opus-4-6-v1`). Re-runnable with `--force`. Region: us-west-2.
- **When to re-enrich:** After improving the enrichment prompt; after a model upgrade (filter: `WHERE enrichment_model != '<new_model>'`); after ingesting a new book (automatic — only un-enriched chunks are processed).
- **Closed vocabularies (CHECK constraints).** These values are enforced by database CHECK constraints. The enrichment prompt uses the same vocabulary. The design system CSS responds to these values via data attributes.
  - **voice_register:** sacred, reverential, instructional, functional, ambient
  - **rasa:** shanta, adbhuta, karuna, vira, bhakti
  - **content_type:** prose, verse, epigraph, dialogue, caption
  - **domain:** philosophy, narrative, technique, devotional, poetry (no CHECK — validated in script)
  - **passage_role:** opening, exposition, narrative, turning_point, deepening, illustration, culmination, resolution, transition, aside
  - **semantic_density:** high, medium, low (no CHECK — validated in script)
  - **emotional_quality:** consoling, inspiring, instructional, devotional, demanding, celebratory (no CHECK — validated in script)
- **First full enrichment run (2026-03-17):** English AoY: 1,528 chunks enriched (1,493 Sonnet 4, 35 Sonnet 4.6), zero failures. Spanish AoY: 1,188 chunks enriched (Sonnet 4.6), zero failures. Distributions — domain: narrative 73%, philosophy 23%; rasa: adbhuta 37%, shanta 34%; depth 6-7: 22% of passages. 21 practice bridge candidates detected (English). chunk_topics: 82 matches against 6 teaching_topics (taxonomy expansion needed, FTR-121).
