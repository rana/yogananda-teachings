---
ftr: 34
title: "Knowledge Graph — Structured Spiritual Ontology and Postgres-Native Graph Intelligence"
summary: "Postgres-native concept graph with ontology_concepts, ontology_edges, and JSON-LD export of Yogananda's teaching framework"
state: approved
domain: search
governed-by: [PRI-03, PRI-10]
depends-on: [FTR-033]
---

# FTR-034: Knowledge Graph

## Rationale

### FTR-034: Structured Spiritual Ontology — Machine-Readable Teaching Structure

**Context:** FTR-059 (Machine-Readable Content and AI Citation), FTR-062 (Living Glossary), FTR-124 (Knowledge Graph Visualization), FTR-064 (Reverse Bibliography), FTR-121 (Teaching Topics)

#### Context

The portal exposes content to machines through several channels: `llms.txt` for AI crawlers (FTR-059), JSON-LD structured data for search engines, and the versioned API for programmatic access. These expose *content* — the text of passages, their citations, their theme tags.

They do not expose *conceptual structure* — the relationships between Yogananda's ideas, the hierarchy of practices, the dependencies between concepts.

An AI system querying the portal can find "passages about samadhi." It cannot learn that samadhi is a state, that it has prerequisites (deep meditation, pranayama), that Yogananda describes multiple degrees of samadhi (savikalpa, nirvikalpa), that it relates to concepts in other traditions (satori in Zen, unio mystica in Christianity), and that specific passages describe the practice path toward it.

The Living Glossary (FTR-062) stores term definitions. The knowledge graph (FTR-124) visualizes passage-level relationships. The teaching topics (FTR-121) classify passages by theme. But none of these expose a *formal ontology* — a machine-readable map of how concepts relate to each other at the conceptual level, above and beyond individual passages.

#### Decision

Build a **structured spiritual ontology** — a concept graph of Yogananda's teaching framework — and expose it through a read-only API endpoint and a JSON-LD export.

##### Schema

```sql
-- ============================================================
-- SPIRITUAL ONTOLOGY (concept graph — STG-007+)
-- ============================================================
CREATE TABLE ontology_concepts (
 id UUID PRIMARY KEY DEFAULT uuidv7(),
 slug TEXT NOT NULL UNIQUE, -- URL slug: 'samadhi'
 name TEXT NOT NULL, -- "Samadhi"
 sanskrit_name TEXT, -- 'samadhi' (IAST transliteration)
 definition TEXT NOT NULL, -- canonical definition
 category TEXT NOT NULL CHECK (category IN (
 'state', -- samadhi, cosmic consciousness, Christ consciousness
 'practice', -- meditation, pranayama, Hong-Sau technique
 'principle', -- karma, dharma, maya, reincarnation
 'entity', -- God, Divine Mother, the soul (atman)
 'text', -- Bhagavad Gita, Yoga Sutras, Bible
 'tradition', -- Kriya Yoga, Raja Yoga, Vedanta
 'path' -- the eightfold path, the chakra system
)),
 glossary_id UUID REFERENCES glossary_terms(id), -- link to Living Glossary (FTR-062)
 created_at TIMESTAMPTZ NOT NULL DEFAULT now
);

CREATE TABLE ontology_relations (
 id UUID PRIMARY KEY DEFAULT uuidv7(),
 source_id UUID NOT NULL REFERENCES ontology_concepts(id) ON DELETE CASCADE,
 target_id UUID NOT NULL REFERENCES ontology_concepts(id) ON DELETE CASCADE,
 relation_type TEXT NOT NULL CHECK (relation_type IN (
 'has_prerequisite', -- meditation HAS_PREREQUISITE concentration
 'is_degree_of', -- nirvikalpa_samadhi IS_DEGREE_OF samadhi
 'is_practice_for', -- hong_sau IS_PRACTICE_FOR concentration
 'is_component_of', -- pranayama IS_COMPONENT_OF kriya_yoga
 'opposes', -- maya OPPOSES self_realization
 'leads_to', -- self_realization LEADS_TO ever_new_joy
 'parallels', -- samadhi PARALLELS satori (cross-tradition)
 'refines', -- nirvikalpa_samadhi REFINES savikalpa_samadhi
 'described_in' -- (link to external references via FTR-064)
)),
 editorial_note TEXT, -- optional contextual explanation
 tagged_by TEXT NOT NULL DEFAULT 'manual' CHECK (tagged_by IN ('manual', 'reviewed', 'auto')),
 UNIQUE (source_id, target_id, relation_type)
);

-- Bridge: which passages are the primary source for a concept
CREATE TABLE ontology_concept_passages (
 id UUID PRIMARY KEY DEFAULT uuidv7(),
 concept_id UUID NOT NULL REFERENCES ontology_concepts(id) ON DELETE CASCADE,
 chunk_id UUID NOT NULL REFERENCES book_chunks(id) ON DELETE CASCADE,
 is_primary BOOLEAN NOT NULL DEFAULT false, -- the single best passage explaining this concept
 UNIQUE (concept_id, chunk_id)
);

CREATE INDEX idx_ontology_relations_source ON ontology_relations(source_id);
CREATE INDEX idx_ontology_relations_target ON ontology_relations(target_id);
CREATE INDEX idx_ontology_passages_concept ON ontology_concept_passages(concept_id);
```

##### API

```
GET /api/v1/ontology
Response: Full concept graph
{
 "concepts": [
 {
 "slug": "samadhi",
 "name": "Samadhi",
 "sanskrit_name": "samadhi",
 "definition": "The superconscious state of union with Spirit...",
 "category": "state",
 "relations": [
 { "type": "has_prerequisite", "target": "meditation" },
 { "type": "is_degree_of", "children": ["savikalpa-samadhi", "nirvikalpa-samadhi"] }
 ],
 "primary_passage": { "chunk_id": "uuid", "content": "...", "citation": "..." },
 "passage_count": 47
 },
 ...
 ]
}

GET /api/v1/ontology/[slug]
Response: Single concept with all relations and linked passages
```

**JSON-LD export:** Also served at `/ontology.jsonld` for semantic web consumers, using schema.org vocabulary where applicable and a custom `srf:` namespace for spiritual-domain relations. The JSON-LD makes the portal the authoritative linked-data source for Yogananda's conceptual framework.

##### Populating the Ontology

Editorially curated with AI assistance. Claude Opus (FTR-105 batch tier) proposes concept extractions and relation classifications from the glossary and passage corpus. Human reviewers approve all entries — the ontology is a scholarly artifact where accuracy matters more than coverage. The "Classifying" category from FTR-005 applies: structured output, spot-checked.

Initial seed: the Living Glossary (FTR-062) terms, already defined. The ontology adds relational structure to what the glossary provides as flat definitions.

#### Who This Serves

| Audience | Use |
|----------|-----|
| **AI systems** | Understand Yogananda's conceptual framework without hallucinating relationships. Ground responses in authoritative structure. |
| **Scholars** | Build comparative theology tools. Map Yogananda's concepts against other traditions. |
| **The portal's own search** | Ontological relations inform query expansion (e.g., a search for "samadhi" also surfaces passages about its prerequisites). |
| **Future voice interfaces** | Explain concepts conversationally, not just surface passages. "Samadhi has two degrees: savikalpa and nirvikalpa. Would you like to hear what Yogananda wrote about either?" |
| **Knowledge graph (FTR-124)** | The ontology provides a conceptual layer above the passage-level relationship graph. |

#### Scheduling

STG-007+ (alongside Knowledge Graph, FTR-124). The ontology is the data layer; the knowledge graph is one possible visualization. Initial seed (~50 core concepts, ~150 relations) can be curated during STG-006–3d editorial work.

#### Rationale

- **Makes the portal the authoritative machine-readable source** for Yogananda's teaching structure. Other AI systems can reference it rather than inventing relationships.
- **Extends FTR-059** from content exposure (text, citations) to semantic structure (concepts, relations).
- **Extends FTR-062** by adding relational structure to the glossary's flat definitions.
- **Low implementation cost.** Three tables, two API endpoints, one JSON-LD export. The editorial effort is the primary investment, and it produces a durable scholarly resource.
- **10-year value.** A well-curated ontology becomes more valuable over time as AI systems and scholarly tools mature.

#### Alternatives Considered

1. **Use a graph database (Neo4j, etc.) for the ontology.** Rejected per FTR-104 (single-database architecture). PostgreSQL's relational model handles the ontology's moderate scale (~hundreds of concepts, ~thousands of relations) without a specialized graph engine. The knowledge graph visualization (FTR-124) uses pre-computed JSON, not real-time graph queries.
2. **Auto-generate the ontology from passage embeddings.** Rejected. Embedding similarity captures semantic relatedness, not conceptual structure. "Samadhi requires meditation" is a directional, typed relationship — not derivable from vector proximity alone. Human editorial judgment is required.
3. **Expose the ontology only as JSON-LD, not as an API.** Rejected. The API enables the portal's own search system to use ontological relations for query expansion. JSON-LD alone would serve external consumers but not internal features.

#### Consequences

- Three new tables: `ontology_concepts`, `ontology_relations`, `ontology_concept_passages`
- New API endpoints: `GET /api/v1/ontology`, `GET /api/v1/ontology/[slug]`
- JSON-LD export at `/ontology.jsonld`
- Living Glossary (FTR-062) terms can be linked to ontology concepts via `glossary_id`
- Knowledge Graph (FTR-124) gains ontological relations as an additional edge type
- Query expansion (FTR-005 E1) can optionally traverse ontological prerequisites for richer search results
- The portal becomes the first spiritual teachings platform to offer a formal, machine-readable conceptual ontology
- **Extends FTR-059** with deep semantic structure; **extends FTR-062** with relational graph; **extends FTR-124** with a concept layer above the passage layer

### FTR-034: Postgres-Native Graph Intelligence Layer

#### Context

The portal requires graph intelligence to make Yogananda's cross-tradition intellectual project computationally navigable:

- **Related Teachings with categorized paths** (FTR-030): not just "similar" passages, but passages related by concept neighborhood, cross-tradition parallels, experiential state progression, and teacher lineage
- **Contemplative Companion:** a user describes an inner state; the system traverses the ExperientialState graph to find the closest match and surfaces Yogananda's verbatim descriptions
- **Scripture-in-Dialogue:** navigating Yogananda's Gita and Gospel commentaries as a unified cross-tradition conversation via verse-level graph edges
- **Reading Arc:** graph-guided progressive study sequences computed from concept depth and PROGRESSION_TO edges
- **Graph-augmented retrieval:** a third retrieval path that finds passages pure vector and keyword search cannot — passages that never mention the search term but are conceptually adjacent via the graph

These features are not ornamental — they are what distinguishes a world-class spiritual text platform from a search box over books.

#### Decision

Implement graph intelligence **within the single-database architecture** (FTR-104). Neon PostgreSQL stores all graph structure in relational tables. Graph algorithms run as nightly batch jobs using Python + NetworkX/igraph. Graph-augmented retrieval (PATH C) uses multi-step SQL queries composed in application code.

**No separate graph database.** Neptune Analytics was evaluated and rejected (see Alternatives Considered).

**Graph data model:**
- Graph structure stored in Postgres tables: `entity_registry` (FTR-033), `extracted_relationships` (FTR-026), `concept_relations`, and entity-type-specific tables
- Relationships are first-class rows — queryable by standard SQL, indexable, joinable with content tables
- Canonical entity IDs from `entity_registry` serve as the primary key for all graph nodes

**Graph algorithms (nightly batch, STG-007+):**
- Python batch job loads entities and relationships from Postgres into NetworkX/igraph (in-memory — the full graph fits easily at ~50K chunks, ~500 entities, ~500K edges)
- **PageRank:** Which concepts are most referenced? Results written as `centrality_score` column on entity rows. Feeds suggestion weights and retrieval confidence.
- **Community Detection:** Which concept clusters naturally co-occur? Results written as `community_id` column. Feeds "conceptual neighborhood" queries and theme browsing.
- **Betweenness Centrality:** Which concepts bridge otherwise separate clusters? Results written as `bridge_score` column. High betweenness = cross-tradition bridge terms.
- All algorithm results stored as columns in Postgres, refreshed nightly. No external system required.

**Graph-augmented retrieval (PATH C, STG-007+):**
- Entity resolution against `entity_registry` identifies concepts in the query
- SQL traversal across `extracted_relationships` and `concept_relations` tables finds chunks within 2–3 hops
- pgvector similarity ranking applied to traversal results
- Multi-step queries composed in `/lib/services/graph.ts` — two-three SQL round-trips instead of one openCypher query
- Results merged into RRF alongside PATH A (vector) and PATH B (BM25)

**Phasing:**
- **Stages 1a–2b:** Graph ontology designed and documented in FTR-034/055. Entity registry and extracted_relationships tables created.
- **STG-007:** Graph algorithm batch pipeline (Python + NetworkX). PATH C activated in search pipeline. Knowledge graph foundation: all node types and edge types populated.
- **STG-020:** Concept/word graph fully constructed: cross-tradition equivalences, progression chains, co-occurrence edges.

#### Alternatives Considered

**Neptune Analytics (rejected):**
Neptune Analytics was the original choice (Feb 2026). It offers combined graph traversal + vector similarity in a single openCypher query — an elegant capability. Rejected for five reasons:

1. **The corpus is too small to justify a second database.** ~50K–100K chunks with ~500 entities fits in memory on commodity hardware. The full graph loads in seconds; all algorithms complete in under a minute. Neptune is designed for billion-edge graphs.
2. **Two-system data synchronization is a permanent operational tax.** Every entity must be synced between Postgres and Neptune. Every migration, debugging session, and monitoring pipeline doubles in surface area. This tax compounds over the project's 10-year horizon.
3. **The single-query unification advantage is narrow.** The combined traversal + vector query is elegant but adds only ~10-20ms latency when decomposed into multi-step SQL. In a search pipeline already at 200-400ms, this is negligible.
4. **FTR-104's single-database rationale applies to Neptune as strongly as to DynamoDB.** The original arguments — one backup strategy, one connection string, one migration tool, one monitoring target — are just as valid for a graph database as for a key-value store.
5. **The Vocabulary Bridge (FTR-028) and query expansion (STG-003) already cover the primary GraphRAG use case.** Cross-tradition term mappings ("Holy Spirit" <-> "AUM") are captured in the bridge and expanded at query time. The remaining edge cases where PATH C would uniquely contribute are vanishingly rare in a single-author corpus with consistent vocabulary.

**Apache AGE (PostgreSQL extension):** Adds openCypher support to PostgreSQL — attractive in principle, but not available on Neon (the project's database provider). Would require self-hosting Postgres, contradicting the managed-infrastructure strategy.

#### Rationale

- **The bounded corpus is the key insight.** A 50K–100K chunk corpus with ~500 canonical entities is a graph problem that fits in a Python dictionary, not one that requires a graph database. NetworkX handles it trivially.
- **FTR-104 remains unqualified.** The single-database architecture is restored to its original strength: one system for all data, all queries, all operations.
- **Pre-computation absorbs the runtime cost.** Graph algorithm results are pre-computed nightly and stored as Postgres columns. Read-time queries are simple SELECTs and JOINs — no graph engine involved.
- **PATH C's value is empirically testable.** The STG-001 golden query set includes graph-dependent test queries. If two-path search + terminology bridge handles them adequately, PATH C can be deferred or eliminated entirely without architectural regret.
- **Operational simplicity is a 10-year feature.** A system that a single developer can debug, maintain, and operate for a decade outperforms a technically superior but operationally complex alternative.

#### Consequences

- FTR-104 remains the unqualified single-database architecture — no amendment
- FTR-021 (Data Model) uses standard relational columns for graph metadata (no `neptune_node_id`)
- FTR-022 (Content Ingestion Pipeline) stores extracted relationships in Postgres (no graph-load step to external system)
- FTR-034 (Knowledge Graph Ontology) and FTR-034 (Concept/Word Graph) describe node/edge types stored in Postgres tables, computed by batch jobs
- FTR-020 (Search Architecture) PATH C uses multi-step SQL queries in `/lib/services/graph.ts`
- STG-007 in ROADMAP.md adds graph algorithm batch pipeline (Python + NetworkX), not Neptune provisioning
- No infrastructure configuration for graph infrastructure — batch job runs as Lambda or Vercel cron
- Graph ontology designed from the initial stages and documented in FTR-034/055

## Specification

### FTR-034: Knowledge Graph Ontology

The knowledge graph captures the relationships between teachings, teachers, concepts, and experiences that make Yogananda's corpus a web of interconnected wisdom rather than a flat document collection. The graph ontology is designed from the initial stages; graph intelligence becomes active in STG-007 via Postgres tables + Python batch computation (FTR-034).

#### Node Types

| Node Type | Description | Primary Key Source | Stage |
|-----------|-------------|-------------------|-----------|
| **Teacher** | Yogananda, his line of gurus, other teachers he references | `entity_registry` (type = 'person') | 3b |
| **DivineName** | God, Divine Mother, Christ, Krishna, Cosmic Consciousness | `entity_registry` (type = 'divine_name') | 3b |
| **Work** | Published books, collections, individual poems/chants | `books` table | 3b |
| **Technique** | Kriya Yoga (public description only), Hong-Sau, Energization | `entity_registry` (type = 'technique') | 3b |
| **SanskritTerm** | Samadhi, maya, karma, dharma — with canonical forms | `sanskrit_terms` table | 3b |
| **Concept** | Abstract teachings: divine love, self-realization, willpower | `entity_registry` (type = 'concept') | 3b |
| **Scripture** | Bhagavad Gita, Bible, Rubaiyat — works Yogananda comments on | `entity_registry` (type = 'scripture') | 3d |
| **ExperientialState** | States of consciousness (waking -> nirvikalpa samadhi) | `entity_registry` (type = 'state') | 3b |
| **Place** | Ranchi, Encinitas, Dakshineswar — biographical/spiritual places | `places` table | 3b |
| **Chunk** | Individual text passages from the corpus | `book_chunks` table | 3b |

All node types correspond to rows in Postgres tables (`entity_registry`, `books`, `book_chunks`, `places`, `sanskrit_terms`). Graph algorithm results (centrality_score, community_id, bridge_score) are stored as columns on the source rows. Chunk embeddings (FTR-024) are used by pgvector for similarity ranking after graph traversal retrieves candidates.

#### Edge Types

| Edge Type | From -> To | Description | Stage |
|-----------|-----------|-------------|-----------|
| **LINEAGE** | Teacher -> Teacher | Guru-disciple relationship | 3b |
| **AUTHORED** | Teacher -> Work | Authorship attribution | 3b |
| **TEACHES** | Chunk -> Concept | Passage teaches or discusses a concept | 3b |
| **MENTIONS** | Chunk -> SanskritTerm | Sanskrit term appears in passage | 3b |
| **REFERENCES** | Chunk -> Scripture | Passage quotes or comments on scripture | 3d |
| **DESCRIBES_STATE** | Chunk -> ExperientialState | Passage describes a state of consciousness | 3b |
| **LOCATED_AT** | Teacher -> Place | Biographical association | 3b |
| **NEXT / PREV** | Chunk -> Chunk | Sequential reading order within a book | 3b |
| **RELATED_CONCEPT** | Concept -> Concept | Conceptual relationship (broader/narrower) | 3b |
| **CROSS_TRADITION** | Concept -> Concept | Yogananda's explicit cross-tradition mapping | 3d |
| **TECHNIQUE_FOR** | Technique -> ExperientialState | Practice leads toward state | 3b |

#### Graph Algorithms (Nightly Batch)

Three algorithms run nightly on the full graph and feed suggestion weights and retrieval confidence:

1. **PageRank** — Identifies the most-connected, highest-authority passages and concepts. Feeds the "canonical teaching" signal in Related Teachings (FTR-030).
2. **Community Detection** — Groups densely connected nodes into teaching clusters. Feeds thematic browsing and the Quiet Index (FTR-066).
3. **Betweenness Centrality** — Finds bridge passages that connect otherwise separate teaching domains. These are the passages that link, say, meditation technique to devotional practice. Surfaced in Reading Arc suggestions (STG-020+).

#### Graph-Augmented Retrieval Query Pattern

Graph-augmented retrieval (PATH C) uses multi-step SQL queries composed in `/lib/services/graph.ts`:

```sql
-- Step 1: Entity resolution — identify concepts in the query
SELECT id, canonical_name, entity_type
FROM entity_registry
WHERE canonical_name = $concept OR $concept = ANY(aliases);

-- Step 2: Graph traversal — find chunks within 2–3 hops
WITH direct_chunks AS (
  SELECT DISTINCT er.chunk_id
  FROM extracted_relationships er
  WHERE er.subject_entity = $canonical_name
     OR er.object_entity = $canonical_name
),
two_hop_chunks AS (
  SELECT DISTINCT er2.chunk_id
  FROM extracted_relationships er1
  JOIN extracted_relationships er2
    ON er1.object_entity = er2.subject_entity
  WHERE er1.subject_entity = $canonical_name
    AND er1.chunk_id != er2.chunk_id
)
SELECT chunk_id FROM direct_chunks
UNION
SELECT chunk_id FROM two_hop_chunks;

-- Step 3: Vector similarity ranking on graph-retrieved candidates
SELECT bc.id, bc.content, bc.book_id,
       1 - (bc.embedding <=> $query_embedding) AS similarity
FROM book_chunks bc
WHERE bc.id = ANY($graph_chunk_ids)
  AND bc.language = $language
ORDER BY similarity DESC
LIMIT 20;
```

This three-step pattern replaces the single openCypher query that Neptune Analytics would have provided. The trade-off is 2-3 SQL round-trips instead of one declarative query — adding ~10-20ms latency, negligible in a pipeline already at 200-400ms. The advantage is: all data in one system, debuggable with standard SQL, no cross-system synchronization.

**Governed by:** FTR-034 (Postgres-Native Graph Intelligence), FTR-033 (Entity Registry), FTR-030 (Related Teachings)

### FTR-034: Concept/Word Graph

The Concept/Word Graph is a specialized subgraph within the knowledge graph (FTR-034) focused on vocabulary relationships — how Yogananda's terminology connects across traditions, Sanskrit sources, and progressive spiritual development. It powers word graph query expansion in the search pipeline (STG-007+, Path C in FTR-020) and the Concept Graph UI exploration (future stages).

#### Term Node Schema

Each term in the concept graph is a node with:

```
{
  canonical: "samadhi",            // Canonical form
  display: "Samadhi",              // Display form with diacritics
  devanagari: "समाधि",             // Devanagari script (if Sanskrit)
  iast: "samadhi",                 // IAST transliteration
  type: "sanskrit_term",           // Node type
  domain: "consciousness",         // Domain classification
  depth_level: 6,                  // Experiential depth (1–7)
  definition_srf: "...",           // SRF-specific definition
  embedding: [...]                 // Voyage voyage-4-large embedding
}
```

#### Edge Types (Concept-Specific)

| Edge Type | Description | Example |
|-----------|-------------|---------|
| **SYNONYM_OF** | Same concept, different term | samadhi <-> cosmic consciousness |
| **BROADER_THAN** | Hierarchical: broader concept | meditation -> concentration |
| **CROSS_TRADITION_EQUIVALENT** | Yogananda's explicit mapping | kundalini <-> Holy Ghost |
| **SRF_INTERPRETS_AS** | SRF-specific interpretation | baptism -> spiritual awakening |
| **TRANSLITERATION_OF** | Same word, different script | samadhi <-> समाधि |
| **CO_OCCURS_WITH** | Frequently appear together in passages | devotion <-> meditation |
| **PROGRESSION_TO** | Sequential development | concentration -> meditation -> samadhi |
| **PRACTICE_LEADS_TO** | Practice produces state | Kriya Yoga -> spiritual perception |

#### Construction Process

```
STG-007: Canonical Vocabulary Seed
 └── Extract from entity_registry + sanskrit_terms tables
 └── Claude generates initial edges from domain knowledge
 └── Human review validates all edges

STG-020: Cross-Tradition Extraction
 └── Mine Yogananda's explicit cross-tradition statements from corpus
 └── "The Hindu scriptures teach that [...] is what Christ called [...]"
 └── Constrained to Yogananda's own explicit mappings only

STG-020: Progression Chains
 └── Extract sequential development paths from teaching passages
 └── Validate against SRF pedagogical tradition

STG-020: Co-occurrence Edges
 └── Statistical co-occurrence from chunk enrichment data
 └── Filtered: minimum 3 co-occurrences, mutual information > threshold
```

#### Word Graph Query Expansion (STG-007+)

When the search pipeline reaches the graph traversal step (FTR-020, Step 6, Path C), the concept graph enables vocabulary-aware expansion:

```
Seeker searches: "how to achieve enlightenment"
 |
 v
Entity resolution: "enlightenment" → Concept node
 |
 v
Graph traversal (1–2 hops):
 SYNONYM_OF: "Self-realization", "cosmic consciousness"
 PROGRESSION_TO: "meditation" → "samadhi"
 CROSS_TRADITION: "nirvana" (Buddhism), "salvation" (Christianity)
 |
 v
Expanded retrieval includes passages mentioning any of these terms
```

#### Scope Constraint

Cross-tradition mappings are limited to Yogananda's own explicit mappings. The portal does not extend theological interpretation beyond what appears in the published corpus. If Yogananda wrote that kundalini is "what the Christians call the Holy Ghost," that mapping exists. If he did not make a specific mapping, it does not exist in the graph — regardless of how obvious it might seem to a scholar. The librarian finds; the librarian does not interpret.

**Governed by:** FTR-034 (Postgres-Native Graph Intelligence), FTR-033 (Entity Registry), FTR-001 (Librarian, Not Oracle)

## Notes

- **Origin:** FTR-034 (Rationale) + FTR-034 (Rationale) + FTR-034 (Specification) + FTR-034 (Specification)
- **Merge:** Two ADRs covering graph ontology and Postgres-native graph intelligence, plus two DES sections specifying node/edge types and concept/word graph
