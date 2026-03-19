---
ftr: 33
title: Canonical Entity Registry and Sanskrit Normalization
summary: "Canonical entity resolution tables mapping aliases to normalized teachers, concepts, Sanskrit terms, and places"
state: implemented
domain: search
governed-by: [PRI-01, PRI-06]
---

# FTR-033: Canonical Entity Registry and Sanskrit Normalization

## Rationale

### Context

The SRF corpus contains a rich but bounded set of entities: teachers, divine names, techniques, Sanskrit terms, works, concepts, places, and experiential states. The same entity frequently appears under multiple surface forms -- "Master," "Guruji," "Swami Yogananda," and "Paramahansa Yogananda" all refer to the same person. Sanskrit terms appear in multiple transliterations: "samadhi," "Samaadhi," "samahdi."

Without canonical entity resolution, the enrichment pipeline produces inconsistent entity tags, the suggestion system surfaces duplicates, and the knowledge graph creates redundant nodes.

### Decision

Two first-class tables provide canonical entity resolution for the entire system:

**Entity Registry:**

```sql
CREATE TABLE entity_registry (
    id              UUID PRIMARY KEY DEFAULT uuidv7(),
    canonical_name  TEXT NOT NULL,
    entity_type     TEXT NOT NULL,  -- Teacher|DivineName|Work|Technique|SanskritTerm|Concept|Place|ExperientialState
    aliases         TEXT[],         -- all known surface forms
    language        CHAR(5),
    definition      TEXT,
    srf_definition  TEXT,           -- Yogananda's specific definition if distinct
    centrality_score REAL,          -- PageRank from graph batch (STG-007+)
    community_id   TEXT,            -- community detection cluster (STG-007+)
    bridge_score   REAL,            -- betweenness centrality (STG-007+)
    created_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE(canonical_name, entity_type)
);
```

**Sanskrit Normalization:**

```sql
CREATE TABLE sanskrit_terms (
    id              UUID PRIMARY KEY DEFAULT uuidv7(),
    canonical_form  TEXT NOT NULL,     -- "samadhi"
    display_form    TEXT NOT NULL,     -- "Samadhi"
    devanagari      TEXT,              -- devanagari script form
    iast_form       TEXT,              -- IAST transliteration
    common_variants TEXT[],            -- variant spellings
    srf_definition  TEXT,
    domain          TEXT,              -- philosophy|practice|state|quality
    depth_level     INT,               -- experiential state: 1-7
    weight          INT DEFAULT 100    -- suggestion ranking weight
);
```

**Construction sequence:**
1. **Before ingestion:** Claude generates an initial entity registry seed (~500 canonical entries). Human review closes gaps.
2. **During ingestion:** The enrichment pipeline validates all extracted entities against the registry.
3. **Per-book update:** Each new book may surface new entities. The registry grows but never shrinks.

### Rationale

- **Bounded, manageable vocabulary.** The SRF entity space is finite and knowable.
- **Alias resolution is critical for search quality.** A user searching "the Master" must find passages tagged with "Paramahansa Yogananda."
- **Sanskrit normalization respects seeker diversity.** Hindi speakers type Devanagari, Western students type rough transliterations, scholars type IAST. All should reach the same term.
- **The registry feeds the suggestion system.** Every entity becomes a high-value suggestion.

### Consequences

- Entity registry populated before first book ingestion
- All enrichment entity extraction resolves against the registry
- Suggestion dictionary draws entries from these tables
- Knowledge graph relationships reference entity registry entries via canonical ID

## Notes

- **Origin:** FTR-033
