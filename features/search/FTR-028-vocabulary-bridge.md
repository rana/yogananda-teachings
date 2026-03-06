---
ftr: 28
title: "Vocabulary Bridge -- Semantic Infrastructure for State-Aware Retrieval"
state: approved
domain: search
arc: 1a+
governed-by: [PRI-03, PRI-05, PRI-06]
---

# FTR-028: Vocabulary Bridge

## Rationale

### Context

The original terminology bridge (FTR-005 E2) mapped modern vocabulary to Yogananda's terms via a flat JSON file. This handled one dimension: vocabulary distance ("anxiety" -> "fear," "restlessness of mind"). But seekers arrive with emotional states, not vocabulary -- "I can't stop crying" is not a vocabulary lookup, it's a state of being that needs to be mapped to corpus territory with register awareness, retrieval intent, and careful avoidance of passages that would miss the seeker.

The vocabulary gap has five dimensions, not one:
1. **State -> corpus territory.**
2. **Modern -> Yogananda vocabulary.**
3. **Register awareness.** "Death" asked philosophically needs different passages than "death" asked in grief.
4. **Cross-tradition vocabulary.**
5. **Language-specific states.**

### Decision

Replace the flat `spiritual-terms.json` with a **five-layer Vocabulary Bridge** -- a structured PostgreSQL-backed semantic model.

The Bridge operates at two points:
- **Index time:** Enrichment vocabulary and corpus territory tags written during enrichment. Zero query-time cost.
- **Query time:** Bridge lookup expands queries, routes retrieval intent, boosts seed passages. 3-8ms overhead.

**The Five Layers:**

**Layer 1: State Mappings** (Milestone 1a) -- Human states mapped to corpus territory with retrieval intent.

**Layer 2: Vocabulary Expansions** (Milestone 1a) -- Modern/secular terms mapped to Yogananda's vocabulary.

**Layer 3: Register Bridges** (Milestone 1c) -- Same concept at different emotional registers requires different passages.

**Layer 4: Cross-Tradition Vocabulary** (Milestone 3b+) -- Terms from other traditions mapped to Yogananda's frame.

**Layer 5: Language-Specific State Mappings** (Milestone 1b for Spanish) -- Each language receives a separate bridge artifact authored fresh by Opus.

**Retrieval Intent:** Bridge entries carry a `retrieval_intent` that shapes presentation:
- `meet_first` -- acknowledge the state before pointing elsewhere
- `console` -- offer comfort, not instruction
- `orient` -- help the seeker understand
- `invite` -- open a door without pushing

### Rationale

- **State mappings cannot be represented by a flat synonym map.**
- **Register awareness prevents wrong-register passages reaching distressed seekers.**
- **Per-language bridges are culturally distinct, not translations.**

### Consequences

- New tables: `vocabulary_bridge`, `bridge_seed_passages`, `bridge_gaps`
- The flat `spiritual-terms.json` is replaced
- The enrichment pipeline gains bridge-related output fields
- FTR-037 evaluation gains a "Dark Night" query category

## Specification

### The Five Layers

**Layer 1: State Mappings**

```typescript
interface StateMapping {
  expression: string           // "I can't stop crying"
  register: Register           // 'fragmentary' | 'distress' | 'inquiry' | 'practice' | 'wonder'
  language: string
  corpus_territory: {
    primary: string[]          // ["grief", "loss", "divine_love"]
    secondary: string[]
    avoid: string[]            // wrong register for this state
  }
  yogananda_vocabulary: string[]
  retrieval_intent: RetrievalIntent
  seed_passages: string[]     // chunk_ids, Opus-selected
  crisis_adjacent: boolean
  editorial_notes: string
}
```

**Layer 2: Vocabulary Expansions**

```typescript
interface VocabularyExpansion {
  modern_term: string            // "anxiety"
  yogananda_terms: string[]      // ["fear", "restlessness of mind", "mental agitation"]
  excluded_terms: string[]
  semantic_note: string
  query_expansion: string[]
  index_enrichment: string[]
  sources: string[]
}
```

**Layer 3: Register Bridges**

```typescript
interface RegisterBridge {
  concept: string               // "death"
  registers: {
    [register: string]: {
      context: string
      corpus_region: string[]
      retrieval_intent: RetrievalIntent
      exemplar_query: string
    }
  }
}
```

**Layer 4: Cross-Tradition Vocabulary**

```typescript
interface TraditionBridge {
  tradition: string
  their_term: string
  yogananda_frame: string[]
  resonant_books: string[]
  bridge_note: string
}
```

**Layer 5: Language-Specific State Mappings** -- Not translations. Authored fresh per language.

### Schema

```sql
CREATE TABLE vocabulary_bridge (
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  layer                TEXT NOT NULL CHECK (layer IN (
                         'state_mapping', 'vocabulary_expansion',
                         'register_bridge', 'tradition_bridge'
                       )),
  language             TEXT NOT NULL DEFAULT 'en',
  expression           TEXT NOT NULL,
  register             TEXT,
  primary_territory    TEXT[],
  secondary_territory  TEXT[],
  avoid_territory      TEXT[],
  retrieval_intent     TEXT CHECK (retrieval_intent IN (
                         'meet_first', 'console', 'orient', 'invite'
                       )),
  yogananda_vocabulary TEXT[],
  query_expansion      TEXT[],
  index_enrichment     TEXT[],
  seed_passage_ids     UUID[],
  crisis_adjacent      BOOLEAN DEFAULT false,
  source_passages      UUID[],
  confidence           REAL,
  derivation_note      TEXT,
  generated_by         TEXT NOT NULL DEFAULT 'opus',
  reviewed_by          TEXT,
  status               TEXT DEFAULT 'active'
                       CHECK (status IN ('draft', 'active', 'reviewed', 'archived')),
  editorial_notes      TEXT,
  cultural_context     TEXT,
  tradition            TEXT,
  last_evaluated       DATE,
  zero_result_trigger  BOOLEAN DEFAULT false,
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE bridge_seed_passages (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  bridge_id       UUID NOT NULL REFERENCES vocabulary_bridge(id),
  chunk_id        UUID NOT NULL REFERENCES book_chunks(id),
  selection_note  TEXT,
  position        INTEGER,
  selected_by     TEXT NOT NULL DEFAULT 'opus',
  selected_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE bridge_gaps (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  query           TEXT NOT NULL,
  language        TEXT NOT NULL,
  result_count    INTEGER NOT NULL,
  query_date      DATE NOT NULL,
  reviewed        BOOLEAN DEFAULT false,
  resulted_in_bridge_id UUID REFERENCES vocabulary_bridge(id),
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

### Query-Time Flow

```
Seeker query: "I feel empty inside"

1. Language detection: 'en'
2. Bridge lookup (in-memory, microseconds):
   - Direct match: "empty" -> state_mapping (register: distress)
   - Vocabulary expansion: "empty" -> ["void", "spiritual emptiness",
                                       "restlessness of the soul"]
3. Query expansion:
   Before: "I feel empty inside"
   After (BM25): "I feel empty inside OR void OR restless soul OR longing for God"
4. Retrieval intent: 'meet_first' + 'console'
5. Ranking modifier: seed passages get +0.2 to final score
6. Result: passages that acknowledge the ache before pointing toward fullness
```

### Phasing

| Layer | Milestone | Notes |
|-------|-----------|-------|
| Layer 1 (State Mappings) | 1a | English only |
| Layer 2 (Vocabulary Expansions) | 1a | Subsumes `spiritual-terms.json` |
| Layer 5 (Spanish States) | 1b | Fresh Opus generation from Spanish Autobiography |
| Layer 3 (Register Bridges) | 1c | Enables meaningful Four Doors entry |
| Layer 4 (Tradition Bridges) | 3b+ | Needs multi-book corpus |

## Notes

- **Origin:** FTR-028 (Rationale) + FTR-028 (Specification)
- **Merge:** FTR-028 decision rationale merged with FTR-028 implementation specification
