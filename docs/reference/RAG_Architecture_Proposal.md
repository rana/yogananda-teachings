# SRF Spiritual Library -- Architecture, Design, and Vision

**For Claude Code: AI Architect and AI Implementer**
**Status: Greenfield Design -- Ready for Implementation**
**AWS Native | Neon Postgres | Neptune Analytics | Voyage Embeddings**

> **Merge review: 2026-02-23.** This document was created externally (Claude Web) as a comprehensive RAG architecture proposal. After review, its ideas were merged into the project's living documents (DECISIONS.md FTR-025 through FTR-009, DESIGN.md FTR-034 through FTR-070, ROADMAP.md phase updates, CONTEXT.md). This file remains as background research in `docs/reference/`.
>
> **What was adopted:** pg_search/ParadeDB BM25 (FTR-025), unified enrichment pipeline (FTR-026), entity registry + Sanskrit normalization (FTR-033), Neptune Analytics as graph layer (FTR-034), Voyage voyage-3-large embeddings (FTR-024), HyDE + Cohere Rerank + three-path retrieval (FTR-027), Redis suggestion cache architecture (FTR-029), DELTA-relaxed authenticated experience (FTR-009). Knowledge graph ontology (FTR-034), concept/word graph (FTR-034), 14 features accepted or deferred with phase assignments (FTR-070).
>
> **What was omitted:** Feature 10 (Healing Architecture) — omitted for theological/legal risk. Feature 11 (Inter-Tradition Bridge beyond corpus) — scope constrained to Yogananda's own explicit mappings. See annotations on those features below. API Gateway + Lambda architecture — project uses Next.js on Vercel, not API Gateway + Lambda. `user_profiles.profile_embedding` — omitted per DELTA principles (no soft personalization). `suggestion_dictionary.click_through` — omitted per DELTA principles (no behavioral tracking).

---

## Why This Exists

The Self-Realization Fellowship library contains a finite, closed, irreplaceable corpus -- the written teaching of Paramahansa Yogananda, Sri Yukteswar Giri, Lahiri Mahasaya, and the lineage they represent. Yogananda said: *"When I am gone the teachings will be the guru... Through the teachings you will be in tune with me and the great gurus who sent me."*

This system is built to make that corpus fully, deeply, and intelligently accessible -- to practitioners, scholars, and sincere seekers -- through world-class retrieval technology. Every architectural decision is oriented toward a single standard: a user in genuine spiritual seeking, whether studying, contemplating, practicing, or simply arriving with a question they cannot fully articulate, should be able to express that seeking in their own words and arrive at a passage that speaks directly to their condition.

Sacred text is always displayed verbatim. AI serves retrieval, enrichment, curation, and navigation -- never synthesis or paraphrase of the teaching itself.

---

## The Corpus

### The Lineage

**Mahavatar Babaji** -- The deathless yogi. Nearly textless in the corpus -- present through the accounts of those he initiated. His knowledge graph node is purely transmission edges. The source of Kriya Yoga's revival.

**Lahiri Mahasaya (1828--1895)** -- The householder saint. Revived Kriya Yoga for the modern age. Teaching expressed through brief statements, paradox, and recorded accounts. The most grounded voice in the lineage.

**Sri Yukteswar Giri (1855--1936)** -- The intellectual architect of the lineage. Authored *The Holy Science*, systematically mapping Hindu cosmological cycles to Western scientific frameworks. Precise, rigorous, demanding. The most structurally disciplined voice.

**Paramahansa Yogananda (1893--1952)** -- The primary voice of the corpus. Poet, scientist, philosopher, mystic, humorist. Works span autobiography, scriptural commentary, discourse, lessons, poetry, prayer, and affirmation. The most dimensionally complete expression.

### Major Works

- *Autobiography of a Yogi* -- 25 years in composition
- *God Talks With Arjuna* -- monumental two-volume Bhagavad Gita commentary, 30 years
- *The Second Coming of Christ* -- nearly 1,700 pages of verse-by-verse Gospel commentary, 30 years
- *The SRF Lessons* -- thousands of pages of personal instruction, most comprehensive edition completed 2017
- *Scientific Healing Affirmations*
- *In the Sanctuary of the Soul*
- *Whispers from Eternity*, *Songs of the Soul*, *Cosmic Chants*
- *Metaphysical Meditations*
- *Man's Eternal Quest* and *The Divine Romance* (collected talks)
- *Sri Yukteswar: The Holy Science*

### Document Types

Each type requires distinct handling at ingestion:

| Type | Characteristics | Chunking Approach |
|------|----------------|-------------------|
| Autobiography | Narrative, continuous | Semantic paragraph |
| Scriptural commentary | Verse + interpretation pairs, interdependent | Verse-bound units |
| Discourse / Talk | Pedagogical arc, builds to conclusion | Section-aware |
| SRF Lesson | Structured pedagogy, fixed format | Format-aware |
| Poetry / Chant | Complete works, indivisible | Whole-poem chunks |
| Affirmation | Single-statement units | Individual affirmations |
| Prayer | Liturgical structure | Stanza or whole |

**Critical:** Do not apply a single chunking algorithm across all types. Read representative samples from each type before implementing the chunking pipeline. Print 50 chunks and read them as a human researcher would. If they feel fragmentary or orphaned from their context, the algorithm is wrong regardless of benchmarks.

---

# PART I: TECHNICAL ARCHITECTURE

---

## Design Principles

1. **One database** -- Neon Postgres is the single authoritative store for all content, relational data, embeddings, and BM25 indexes. Neptune Analytics adds the graph layer alongside. No fragmented multi-service architecture requiring reconciliation.

2. **Enrichment at index time** -- Claude generates structured enrichment (topics, entities, summaries, relationships) once, at ingestion. This enrichment feeds retrieval, suggestions, and graph construction simultaneously from a single pipeline.

3. **Verbatim text always** -- the system retrieves and displays. It never paraphrases, synthesizes, or rewrites the teaching.

4. **Evaluation first** -- a golden retrieval set and golden suggestion set are built before the system has users, not after. Every change is measured against them.

5. **Sequence by leverage** -- implement in the order that delivers the highest retrieval quality improvement per engineering hour. Don't over-engineer before failure modes are known.

---

## Core Technology Stack

```
NEON POSTGRES (primary data store)
+-- pgvector (HNSW)        -- dense vector retrieval
+-- pg_search / ParadeDB   -- BM25 full-text retrieval
+-- Relational schema      -- books, chapters, sections, chunks
+-- Enrichment metadata    -- topics, entities, domain, language

NEPTUNE ANALYTICS (graph store)
+-- Knowledge graph        -- entities and factual relationships
+-- Concept/word graph     -- semantic relationships between terms
+-- Voyage embeddings      -- stored on nodes for vector+graph queries
+-- Graph algorithms       -- PageRank, community detection, centrality

VOYAGE AI (embeddings)
+-- voyage-3-large         -- primary multilingual model (1024d, 26 languages)
+-- voyage-multilingual-2  -- benchmark alternative for CJK-heavy text

COHERE RERANK 3.5          -- multilingual precision reranking
CLAUDE (AWS Bedrock)       -- query expansion, HyDE, enrichment, intent classification
REDIS (ElastiCache)        -- embedding cache, suggestion prefix index
AWS LAMBDA + STEP FUNCTIONS -- orchestration
API GATEWAY                -- search endpoints
```

---

## Neon Postgres Schema

### Core Relational Tables

```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_search;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ---------------------------------------------
-- BOOKS
-- ---------------------------------------------
CREATE TABLE books (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title               TEXT NOT NULL,
    author              TEXT NOT NULL,           -- canonical teacher name
    published           DATE,
    document_type       TEXT NOT NULL,           -- autobiography|commentary|discourse|lesson|poetry|affirmation|prayer
    primary_language    CHAR(5) NOT NULL,        -- BCP 47
    languages           TEXT[],                  -- all languages present
    genre               TEXT[],
    scripture_basis     TEXT,                    -- if commentary: Gita|Gospel|etc.
    composition_period  TEXT,                    -- e.g. '1932-1952'
    neptune_node_id     TEXT,
    metadata            JSONB,
    created_at          TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------
-- CHAPTERS
-- ---------------------------------------------
CREATE TABLE chapters (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id         UUID NOT NULL REFERENCES books(id),
    number          INT,
    title           TEXT,
    position        INT,
    scripture_ref   TEXT     -- for commentaries: "John 11:25" or "Gita 2:47"
);

-- ---------------------------------------------
-- SECTIONS (parent chunks -- context units)
-- ---------------------------------------------
CREATE TABLE sections (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id      UUID NOT NULL REFERENCES chapters(id),
    book_id         UUID NOT NULL REFERENCES books(id),
    content         TEXT NOT NULL,
    embedding       VECTOR(1024),
    position        INT,
    token_count     INT,
    neptune_node_id TEXT
);

-- ---------------------------------------------
-- CHUNKS (primary retrieval unit)
-- ---------------------------------------------
CREATE TABLE chunks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id      UUID REFERENCES sections(id),       -- parent for context expansion
    chapter_id      UUID REFERENCES chapters(id),
    book_id         UUID NOT NULL REFERENCES books(id),

    content         TEXT NOT NULL,
    embedding       VECTOR(1024),                       -- Voyage voyage-3-large

    -- Language
    language        CHAR(5) NOT NULL,
    script          TEXT NOT NULL,                      -- latin|cjk|arabic|cyrillic|devanagari
    language_confidence REAL,

    -- Claude-generated enrichment (in original language)
    summary         TEXT,                               -- "This passage is primarily about..."
    summary_en      TEXT,                               -- English translation (async, for cross-lingual UI)
    topics          TEXT[],                             -- ['samadhi', 'cosmic consciousness', 'divine love']
    entities        JSONB,                              -- typed entity extraction (see below)
    domain          TEXT,                               -- philosophy|narrative|technique|devotional|poetry
    experiential_depth INT,                             -- 1-7 scale: ordinary->cosmic consciousness
    emotional_quality  TEXT[],                          -- consoling|inspiring|instructional|devotional|demanding|celebratory

    -- Cross-references (latent knowledge graph edges, captured now)
    cross_references JSONB,                             -- explicit refs to other works, teachers, scriptures

    -- Voice signature
    voice_register  TEXT,                               -- intimate|cosmic|instructional|devotional|philosophical|humorous

    -- Sequence (enables graph traversal for context)
    position        INT,
    token_count     INT,

    -- Graph linkage
    neptune_node_id TEXT,

    created_at      TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------
-- ENTITY REGISTRY (canonical resolution)
-- ---------------------------------------------
CREATE TABLE entity_registry (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_name  TEXT NOT NULL,
    entity_type     TEXT NOT NULL,           -- Teacher|DivineName|Work|Technique|SanskritTerm|Concept|Place|State
    aliases         TEXT[],                  -- all known surface forms, including SRF-specific names
    neptune_node_id TEXT,
    language        CHAR(5),
    definition      TEXT,
    srf_definition  TEXT,                    -- Yogananda's specific definition if distinct
    UNIQUE(canonical_name, entity_type)
);

-- ---------------------------------------------
-- SANSKRIT NORMALIZATION
-- ---------------------------------------------
CREATE TABLE sanskrit_terms (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_form  TEXT NOT NULL,           -- "samadhi"
    display_form    TEXT NOT NULL,           -- "Samadhi"
    devanagari      TEXT,                    -- "समाधि"
    iast_form       TEXT,                    -- "samādhi"
    common_variants TEXT[],                  -- ["Samaadhi", "samahdi"]
    srf_definition  TEXT,
    domain          TEXT,                    -- philosophy|practice|state|quality
    depth_level     INT,                     -- if an experiential state: 1-7
    weight          INT DEFAULT 100
);

-- ---------------------------------------------
-- SUGGESTION DICTIONARY
-- ---------------------------------------------
-- **Project note:** `click_through` column omitted from project schema per DELTA principles (FTR-082).
-- Weight formula uses corpus_frequency and query_frequency only. No per-user click tracking.
CREATE TABLE suggestion_dictionary (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    suggestion          TEXT NOT NULL,
    display_text        TEXT,
    suggestion_type     TEXT NOT NULL,       -- entity|topic|title|author|sanskrit|learned_query|scoped_query
    language            CHAR(5) NOT NULL,
    script              TEXT NOT NULL,
    latin_form          TEXT,                -- transliteration for non-latin terms
    corpus_frequency    INT DEFAULT 0,
    query_frequency     INT DEFAULT 0,
    click_through       INT DEFAULT 0,
    weight              REAL GENERATED ALWAYS AS (
        (corpus_frequency * 0.3) +
        (query_frequency  * 0.5) +
        (click_through    * 1.0)
    ) STORED,
    entity_id           UUID,
    book_id             UUID REFERENCES books(id),
    updated_at          TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------
-- QUERY LOG (build from day one)
-- ---------------------------------------------
CREATE TABLE query_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_text      TEXT NOT NULL,
    language        CHAR(5),
    intent_class    TEXT,                    -- studying|contemplating|practicing|seeking|researching
    result_count    INT,
    had_engagement  BOOLEAN DEFAULT FALSE,
    session_id      UUID,
    user_profile_id UUID,
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------
-- USER PROFILES (optional, privacy-respecting)
-- ---------------------------------------------
-- **Project note:** `profile_embedding` column omitted from project schema per DELTA principles (FTR-082, FTR-009).
-- No soft personalization or behavioral profiling. Authenticated profiles store only explicit user preferences
-- (language, bookmarks, reading progress). See DESIGN.md § FTR-021 for the adopted user_profiles schema.
CREATE TABLE user_profiles (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tradition_background TEXT,
    practice_level      TEXT,
    preferred_language  CHAR(5),
    profile_embedding   VECTOR(1024),        -- embedded from profile text for soft personalization
    created_at          TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------
-- RELATIONSHIP EXTRACTION LOG (audit trail)
-- ---------------------------------------------
CREATE TABLE extracted_relationships (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chunk_id        UUID REFERENCES chunks(id),
    subject_entity  TEXT,
    relationship    TEXT,
    object_entity   TEXT,
    confidence      REAL,
    loaded_to_graph BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT now()
);
```

### Indexes

```sql
-- Dense vector retrieval (HNSW)
CREATE INDEX chunks_embedding_hnsw ON chunks
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

CREATE INDEX sections_embedding_hnsw ON sections
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- BM25 indexes (pg_search)
-- Primary: ICU tokenizer -- covers ~90% of languages
CREATE INDEX chunks_bm25_icu ON chunks
    USING bm25 (id, content, summary, topics)
    WITH (
        key_field = 'id',
        text_fields = '{
            "content":  {"tokenizer": {"type": "icu"}, "record": "position"},
            "summary":  {"tokenizer": {"type": "icu"}},
            "topics":   {"tokenizer": {"type": "icu"}}
        }'
    );

-- Chinese: Jieba dictionary-based segmentation
CREATE INDEX chunks_bm25_zh ON chunks
    USING bm25 (id, content)
    WITH (
        key_field = 'id',
        text_fields = '{"content": {"tokenizer": {"type": "jieba"}}}'
    )
    WHERE script = 'cjk' AND language LIKE 'zh%';

-- Japanese: Lindera
CREATE INDEX chunks_bm25_ja ON chunks
    USING bm25 (id, content)
    WITH (
        key_field = 'id',
        text_fields = '{"content": {"tokenizer": {"type": "lindera"}}}'
    )
    WHERE script = 'cjk' AND language = 'ja';

-- Metadata indexes
CREATE INDEX chunks_language_idx     ON chunks(language);
CREATE INDEX chunks_script_idx       ON chunks(script);
CREATE INDEX chunks_book_id_idx      ON chunks(book_id);
CREATE INDEX chunks_domain_idx       ON chunks(domain);
CREATE INDEX chunks_depth_idx        ON chunks(experiential_depth);
CREATE INDEX chunks_topics_idx       ON chunks USING gin(topics);
CREATE INDEX chunks_quality_idx      ON chunks USING gin(emotional_quality);

-- Suggestion indexes
CREATE INDEX suggestion_trgm_idx     ON suggestion_dictionary
    USING gin(suggestion gin_trgm_ops);
CREATE INDEX suggestion_language_idx ON suggestion_dictionary(language, suggestion);
CREATE INDEX suggestion_weight_idx   ON suggestion_dictionary(language, weight DESC);

-- Entity registry
CREATE INDEX entity_aliases_idx      ON entity_registry USING gin(aliases);
```

---

## Embedding Strategy

### Model: Voyage `voyage-3-large`

- 1024 dimensions
- 26 languages, multilingual embedding space
- Up to 32K token input -- enables embedding whole passages and sections
- Unified cross-lingual space: a French query retrieves French text without routing logic
- Asymmetric encoding: use `input_type = 'document'` at index time, `input_type = 'query'` at query time

**Alternative benchmark:** `voyage-multilingual-2` for CJK-heavy corpora. Test both against actual corpus before committing.

**Hosting:** Voyage API by default. At significant volume, evaluate AWS Marketplace SageMaker model packages for Voyage -- keeps all inference AWS-native.

### Why Not OpenAI `text-embedding-3-small`

The small model is a reasonable baseline but leaves substantial quality on the table for literary/spiritual text:
- Optimized for breadth across all domains, not depth in any
- Literary allusion, Sanskrit vocabulary, and figurative language underperform
- `text-embedding-3-large` is meaningfully better; Voyage is better still
- Migration path: re-embed entire corpus when upgrading. A bounded book corpus re-embeds in hours. Don't let migration friction prevent the upgrade.

---

## Full-Text Search: pg_search / ParadeDB BM25

pg_search is confirmed available on Neon (AWS regions). It provides Elasticsearch-quality BM25 entirely within Postgres -- no separate service, full SQL JOIN capability, ACID compliant.

### Why Hybrid Search (BM25 + Vector) Matters

Vector search captures semantic similarity but loses fine-grained token relationships through compression. BM25 captures exact keyword and phrase overlap -- critical for:
- Proper nouns: teacher names, work titles, character names
- Sanskrit terms where spelling is precise
- Exact phrases users remember ("door of my heart," specific quotes)
- Short queries where semantic expansion would dilute precision

BM25 finds what semantic search misses; vector search finds what BM25 misses. Together they produce higher recall than either alone.

### Hybrid Query: Reciprocal Rank Fusion

```sql
WITH vector_results AS (
    SELECT id, content, book_id, section_id,
           1 - (embedding <=> $query_embedding) AS score,
           ROW_NUMBER() OVER (ORDER BY embedding <=> $query_embedding) AS rank
    FROM chunks
    WHERE book_id = ANY($book_filter)
      AND language = ANY($language_filter)      -- optional
      AND domain = ANY($domain_filter)          -- optional
      AND experiential_depth >= $min_depth      -- optional
    ORDER BY embedding <=> $query_embedding
    LIMIT 50
),
keyword_results AS (
    SELECT id, content, book_id, section_id,
           paradedb.score(id) AS score,
           ROW_NUMBER() OVER (
               ORDER BY paradedb.score(id) DESC
           ) AS rank
    FROM chunks
    WHERE id @@@ paradedb.match('content', $expanded_query_terms)
      AND book_id = ANY($book_filter)
    LIMIT 50
),
rrf AS (
    SELECT
        COALESCE(v.id, k.id) AS id,
        COALESCE(v.content, k.content) AS content,
        COALESCE(v.book_id, k.book_id) AS book_id,
        COALESCE(v.section_id, k.section_id) AS section_id,
        (COALESCE(1.0 / (60 + v.rank), 0) +
         COALESCE(1.0 / (60 + k.rank), 0)) AS rrf_score
    FROM vector_results v
    FULL OUTER JOIN keyword_results k ON v.id = k.id
)
SELECT id, content, book_id, section_id, rrf_score
FROM rrf
ORDER BY rrf_score DESC
LIMIT 50;
```

---

## The Enrichment Prompt

**This is the most consequential engineering in the entire system.** Everything downstream is only as good as what Claude generates at index time. The enrichment prompt requires its own design session -- test against 20--30 actual passages covering all document types before implementing the ingestion pipeline.

The enrichment output schema:

```json
{
  "summary": "This passage is primarily about...",
  "topics": ["samadhi", "cosmic consciousness", "divine love"],
  "entities": {
    "teachers": ["Paramahansa Yogananda", "Sri Yukteswar"],
    "divine_names": ["Divine Mother", "Christ"],
    "techniques": ["Kriya Yoga", "Hong-Sau"],
    "sanskrit_terms": ["samadhi", "prana"],
    "works": ["Autobiography of a Yogi"],
    "concepts": ["self-realization", "cosmic consciousness"],
    "places": ["Encinitas"],
    "christian_parallels": ["resurrection", "Holy Ghost"],
    "experiential_states": ["nirvikalpa samadhi"]
  },
  "domain": "philosophy",
  "experiential_depth": 6,
  "emotional_quality": ["inspiring", "philosophically demanding"],
  "voice_register": "cosmic",
  "cross_references": [
    {"type": "scripture", "ref": "John 14:6", "explicit": true},
    {"type": "work", "ref": "The Holy Science", "explicit": false}
  ],
  "relationships": [
    {
      "subject": "Paramahansa Yogananda",
      "relationship": "INTERPRETS",
      "object": "resurrection",
      "as": "spiritual rebirth through Kriya practice"
    }
  ]
}
```

Prompt guidelines:
- Run in the chunk's detected language
- Use canonical entity names from the entity registry
- Flag ambiguous entities for human review
- Store output directly as structured Postgres columns, not raw JSON

---

## Ingestion Pipeline

```
Raw Book Text
    |
    v
[1. STRUCTURAL PARSE]
    Identify document type (autobiography|commentary|discourse|lesson|poetry|affirmation)
    Extract structural hierarchy: book -> chapter -> section -> paragraph
    Preserve: scripture verse markers, footnotes, section headers
    Detect and separate: front matter, indices, appendices
    |
    v
[2. DOCUMENT-TYPE-AWARE CHUNKING]
    Narrative:          Semantic paragraphs, 200-400 tokens
                        10-15% sliding overlap at paragraph boundaries
                        Never split mid-sentence
    Commentary:         Verse + interpretation as atomic unit
                        Scripture reference preserved as metadata
    Discourse/Lesson:   Section-aware; preserve pedagogical arc
    Poetry/Prayer:      Whole works as single chunks; never split
    Affirmation:        Individual affirmations as atomic units

    Parent chunks (sections): 1000-1500 tokens
    Child chunks linked to parent by section_id FK
    |
    v
[3. LANGUAGE DETECTION]
    Tool: fastText language identification (170+ languages, fast, accurate)
    Store: language (BCP 47), script, confidence score
    Mixed-language passages: dominant language + flag
    |
    v
[4. ENTITY RESOLUTION]
    Surface forms -> canonical IDs via entity_registry
    "Master" = "Guruji" = "Swami Yogananda" = "Paramahansa Yogananda"
    "Divine Mother" != "mother" (person)
    Build registry before processing corpus -- bounded, manageable
    Claude Code task: generate initial registry from domain knowledge
    |
    v
[5. EMBEDDING]
    Voyage voyage-3-large
    input_type = 'document'
    Store 1024d vector on chunks table and sections table
    |
    v
[6. CLAUDE ENRICHMENT]
    Run enrichment prompt per chunk
    Validate entity names against entity_registry
    Store structured output to Postgres columns
    Log extracted relationships to extracted_relationships table
    Flag confidence < 0.7 for human review queue
    |
    v
[7. BM25 INDEXING]
    Chunks enter pg_search indexes automatically
    Partial indexes route by script: ICU (primary), Jieba (zh), Lindera (ja)
    |
    v
[8. GRAPH LOAD -> Neptune Analytics]
    Entities -> nodes (upsert by canonical ID)
    Relationships -> edges (from extracted_relationships)
    Voyage embeddings -> attached to Chunk nodes
    Chunk NEXT/PREV sequential chain -> graph edges
    |
    v
[9. SUGGESTION DICTIONARY UPDATE]
    Entities and topics -> suggestion_dictionary rows
    Redis prefix index rebuilt from dictionary
    Nightly job incorporates query_log signal
```

---

## Query Pipeline: Full Retrieval

```
User Query (any language, any intent)
    |
    v
[1. LANGUAGE DETECTION] ~1ms
    fastText inference on query text
    Script classification: latin|cjk|arabic|cyrillic
    Fall back to user session language if ambiguous
    |
    v
[2. INTENT CLASSIFICATION] ~50ms -- Claude
    studying      -> precision-weighted, author/text scoping welcome
    contemplating -> recall-weighted, devotional domain preferred
    practicing    -> technique domain weighted, instructional quality preferred
    seeking       -> generous expansion, experiential_depth prioritized
    researching   -> breadth preferred, cross-reference valuable
    |
    v
[3. QUERY EXPANSION] ~100ms -- Claude, in source language
    Generate 4-5 variant queries
    Expand with synonyms, related concepts, Sanskrit/English alternatives
    Respect detected language -- all expansions in source language
    |
    v
[4. HyDE -- Hypothetical Document Embedding] ~100ms parallel
    Claude generates a hypothetical passage that would answer the query
    Embed the hypothesis -> searches in document-space, not query-space
    High lift on literary and spiritual corpora
    |
    v
[5. WORD GRAPH EXPANSION] ~5ms -- Neptune
    Query terms -> concept graph traversal
    Synonyms, cross-tradition equivalents, progression terms
    Results inject additional BM25 search terms
    Cross-lingual equivalents available if user opts in
    |
    v
[6. PARALLEL RETRIEVAL -- three simultaneous paths]

    PATH A: Dense Vector (Neon pgvector)
    - HNSW search with query + HyDE embeddings
    - Pre-filter: book_id, language, domain, experiential_depth
    - Returns top 30-40

    PATH B: BM25 Keyword (Neon pg_search)
    - ICU/Jieba/Lindera index by script
    - Word-graph-expanded query terms
    - Optional language filter
    - Returns top 30-40

    PATH C: GraphRAG (Neptune Analytics)
    - Entity-aware traversal + vector similarity in single openCypher query
    - Traverses concept neighborhoods, lineage relationships,
       cross-tradition bridges, experiential state graph
    - Fetches NEXT/PREV context chunks via graph edges
    - Returns results PATH A and B cannot find
    |
    v
[7. RECIPROCAL RANK FUSION]
    Merge all paths (~80-120 candidates after dedup)
    RRF score: sum 1/(k + rank_i) across all result lists
    |
    v
[8. COHERE RERANK 3.5]
    Cross-encoder: sees query + passage together
    Multilingual native -- no language routing needed
    Top 10 returned with true relevance scores
    |
    v
[9. CONTEXT EXPANSION]
    For each result: fetch parent section (JOIN to sections table)
    Or: traverse NEXT/PREV graph edges (already in PATH C result)
    Surrounding context shown with retrieved chunk highlighted
    |
    v
[10. DISPLAY]
    Verbatim passage text, never modified
    Source attribution: book, chapter, author
    Relationship category if from PATH C (why this is related)
```

---

## Knowledge Graph: Neptune Analytics

### Why Neptune Analytics

Neptune Analytics persists Voyage embeddings on nodes and provides vector algorithms callable from openCypher -- meaning a single query can traverse relationships AND retrieve semantically similar content simultaneously. This unification is the core capability that justifies the graph layer. Graph traversal finds passages that pure vector search cannot find: a chunk that never mentions a search term explicitly but is two concept-hops away from the query's conceptual neighborhood.

### Ontology

```
NODE TYPES

(:Teacher)
  name, canonical_name, birth_name
  years_active, lineage_position (1=Babaji, 2=Lahiri, 3=Yukteswar, 4=Yogananda)
  tradition, nationality, physical_presence: boolean
  embedding: VECTOR  <- Voyage embedding of biographical summary

(:DivineName)
  name, tradition
  srf_interpretation      <- Yogananda's specific framing
  associated_aspects: []

(:Work)
  title, year, document_type
  composition_span, language, primary_audience
  scripture_basis         <- for commentaries
  embedding: VECTOR       <- work-level summary embedding

(:Technique)
  name, type: [meditation|pranayama|energization|japa|visualization]
  level: [preparatory|intermediate|advanced|initiatory]
  prerequisite_technique

(:SanskritTerm)
  canonical_form, display_form
  iast_form, devanagari
  definition, srf_definition
  domain: [philosophy|practice|state|quality]

(:Concept)
  term, language
  definition, srf_interpretation
  experiential_quality: [devotional|intellectual|practical|contemplative]
  christian_equivalent    <- Yogananda's explicit mapping where present
  embedding: VECTOR

(:Scripture)
  name, tradition
  book, chapter, verse    <- for verse-level granularity
  srf_significance        <- how central to the teaching

(:ExperientialState)
  name, depth_level: 1-7
  <- 1: ordinary waking, 2: relaxed concentration, 3: pratyahara
  <- 4: dharana, 5: dhyana, 6: samadhi, 7: nirvikalpa/cosmic consciousness
  description
  phenomenological_qualities: []
  approach_technique

(:Place)
  name, country
  spiritual_significance
  associated_ashram: boolean

(:Chunk)
  id                      <- FK to Neon chunks.id
  content_preview         <- first 200 chars for graph queries
  position, language
  domain, experiential_depth
  embedding: VECTOR       <- Voyage embedding stored on node
```

```
EDGE TYPES (with properties)

LINEAGE
(:Teacher)-[:TRANSMITTED_TO {year, location, method}]->(:Teacher)
(:Teacher)-[:RECEIVED_FROM]->(:Teacher)

AUTHORSHIP
(:Teacher)-[:AUTHORED {year_completed}]->(:Work)
(:Work)-[:CONTAINS]->(:Chunk)
(:Chunk)-[:NEXT]->(:Chunk)     <- sequential chain -- enables context expansion
(:Chunk)-[:PREV]->(:Chunk)

TEACHING
(:Teacher)-[:TEACHES]->(:Technique)
(:Teacher)-[:DEFINES {source_work}]->(:Concept|:SanskritTerm)
(:Teacher)-[:INTERPRETS {interpretation_type}]->(:Scripture)
(:Teacher)-[:REFERENCES {frequency}]->(:Teacher|:Scripture|:DivineName)
(:Teacher)-[:EMBODIES]->(:ExperientialState)

CONTENT RELATIONSHIPS
(:Chunk)-[:MENTIONS {confidence}]->(:Teacher|:Concept|:SanskritTerm|:Technique|:DivineName)
(:Chunk)-[:DESCRIBES_STATE]->(:ExperientialState)
(:Chunk)-[:INSTRUCTS_TECHNIQUE]->(:Technique)
(:Chunk)-[:CROSS_REFERENCES {explicit: boolean}]->(:Work|:Scripture)
(:Chunk)-[:AUTHORED_BY]->(:Teacher)

CONCEPT RELATIONSHIPS
(:Concept)-[:PARALLELS {tradition_a, tradition_b}]->(:Concept)
(:SanskritTerm)-[:TRANSLATES_TO]->(:Concept)
(:Concept)-[:DEEPENS_INTO]->(:ExperientialState)

CROSS-TRADITION
(:Work)-[:INTERPRETS]->(:Scripture)
(:Work)-[:REFERENCES {count}]->(:Work|:Teacher|:Scripture|:Concept)
(:Work)-[:DEMONSTRATES_UNITY_OF {traditions}]->(:Work)
```

### Neptune Analytics Algorithms (Run Nightly)

```
PageRank on knowledge graph
-> Which concepts and entities are most referenced?
-> Results stored as centrality_score on nodes
-> Inform suggestion weights and retrieval confidence

Community Detection
-> Which concept clusters naturally co-occur?
-> Expected: meditation/states, devotion/love, philosophy/maya,
            technique/practice, Christian-parallels, Hindu-philosophy
-> Results stored as community_id on nodes
-> "Find more from this conceptual neighborhood" queries

Betweenness Centrality
-> Which concepts bridge otherwise separate clusters?
-> High betweenness = cross-tradition bridge terms
-> Most important for cross-tradition retrieval
-> Surface first in suggestions

Node Similarity
-> Which teachers cluster by relationship patterns?
-> Informs lineage-scoped retrieval weighting
```

### GraphRAG Query Example

```cypher
-- "What does Yogananda say about devotion and meditation?"
-- Entity extraction found: Yogananda (Teacher), devotion (Concept), meditation (Concept|Technique)

MATCH (t:Teacher {canonical_name: 'Paramahansa Yogananda'})

-- Path 1: Author's works -> chunks, vector similarity
MATCH (t)-[:AUTHORED]->(w:Work)-[:CONTAINS]->(c:Chunk)
CALL neptune.algo.vector_search(c.embedding, $queryEmbedding, {topK: 20})
YIELD chunk AS similar_chunk, score

-- Path 2: Concept neighborhood traversal
MATCH (devotion:Concept {term: 'devotion'})
MATCH (devotion)-[:CO_OCCURS_WITH|PARALLELS|PROGRESSION_TO*1..2]->(related:Concept)
MATCH (related_chunk:Chunk)-[:MENTIONS]->(related)
WHERE (related_chunk)<-[:CONTAINS]-(:Work)<-[:AUTHORED]-(t)

-- Path 3: Context via sequential chain
OPTIONAL MATCH (similar_chunk)-[:NEXT*1..2]->(next_chunk:Chunk)
OPTIONAL MATCH (prev_chunk:Chunk)-[:NEXT*1..2]->(similar_chunk)

RETURN DISTINCT
    similar_chunk,
    related_chunk,
    next_chunk,
    prev_chunk,
    score
ORDER BY score DESC
```

---

## Word/Concept Graph

### Purpose

The concept graph is the domain ontology -- SRF's specific meaning topology. It encodes:
- How terms relate semantically (synonyms, broader/narrower)
- Yogananda's explicit cross-tradition mappings (the most strategically valuable content)
- The progression from ordinary terms to deeper experiential states
- Co-occurrence patterns computed statistically from the corpus

### Why the Cross-Tradition Edges Are the Most Important Asset

Yogananda's explicit project was demonstrating the underlying unity of genuine spiritual traditions. He systematically mapped Hindu concepts to Christian ones. These mappings are encoded in his texts. Extracting them as graph edges means retrieval automatically bridges traditions: a user searching "Second Coming" finds passages about cosmic consciousness. A user searching "samadhi" finds passages framed in Christian vocabulary. This is Yogananda's central intellectual contribution made computationally navigable.

### Concept Graph Schema (Neptune)

```
(:Term)
  text, language, script
  type: [sanskrit|english_concept|phrase|divine_name|technique_name]
  srf_canonical: boolean
  corpus_frequency: int
  centrality_score: float      <- from PageRank
  community_id: int            <- from community detection
  embedding: VECTOR

EDGES

[:SYNONYM_OF {confidence, source}]
[:BROADER_THAN]                     -- "meditation" BROADER_THAN "Hong-Sau"
[:NARROWER_THAN]                    -- inverse
[:CROSS_TRADITION_EQUIVALENT {tradition_a, tradition_b, confidence, source_work}]
  -- "resurrection" <-> "spiritual rebirth"
  -- "Holy Ghost"   <-> "AUM vibration"
  -- "Kingdom of Heaven" <-> "cosmic consciousness"
  -- "Sufi fana"    <-> "nirvikalpa samadhi"
[:SRF_INTERPRETS_AS {source_work, confidence}]
  -- Yogananda's specific cross-tradition mappings
[:TRANSLITERATION_OF]
  -- "samadhi" <-> "समाधि"
  -- "AUM" <-> "OM" <-> "ॐ"
[:CO_OCCURS_WITH {weight, co_occurrence_count}]
  -- built statistically from corpus
[:PROGRESSION_TO {depth_delta}]
  -- "concentration" -> "meditation" -> "samadhi" -> "cosmic consciousness"
  -- directional, carries depth metadata
[:PRACTICE_LEADS_TO]
  -- "Hong-Sau" -> "concentration"
  -- "Kriya Yoga" -> "samadhi"
```

### Concept Graph Construction

1. **Canonical vocabulary seed** -- built before touching the corpus. SRF-specific terminology, teacher names, Sanskrit terms, technique names, work titles. Claude Code generates initial seed from domain knowledge; human review closes gaps.

2. **Cross-tradition extraction** -- Claude identifies and extracts explicit equivalence statements from Yogananda's commentaries. The Gita and Gospel commentaries are the richest source. Each extracted mapping becomes a `CROSS_TRADITION_EQUIVALENT` edge.

3. **Progression chains** -- curated with Claude assistance. The depth progression (concentration -> meditation -> contemplation -> samadhi -> cosmic consciousness) is the backbone of the technique-to-state subgraph.

4. **Co-occurrence edges** -- built statistically at index time. Chunk-level topic co-occurrence. Threshold: minimum co-occurrence count to filter noise.

### Word Graph Query for Query Expansion

```cypher
-- Given query term "devotion"
-- Expand for BM25 search

MATCH (t:Term {text: $query_term, language: $language})
MATCH (t)-[:SYNONYM_OF|BROADER_THAN|CO_OCCURS_WITH*1..2]->(related:Term)
MATCH (t)-[:CROSS_TRADITION_EQUIVALENT]->(parallel:Term)
MATCH (t)-[:TRANSLITERATION_OF]->(variant:Term)

RETURN DISTINCT
    related.text AS expansion_term,
    parallel.text AS cross_tradition_term,
    variant.text AS variant_form,
    related.corpus_frequency AS frequency
ORDER BY frequency DESC
LIMIT 20
```

---

## Search Suggestion Architecture

### The Core Design Principle

Suggestions do not search the corpus on every keystroke -- they search a precomputed dictionary derived from the corpus. The dictionary is built offline; Redis provides sub-millisecond prefix lookup. The corpus enrichment pipeline produces the raw material.

Latency requirements: < 50ms ideal, < 100ms hard ceiling, on every keystroke.

### Suggestion Vocabulary for SRF Corpus

**Not** every word from every book -- raw word extraction produces noise. Instead, three distinct extraction passes:

**Pass 1: Canonical Vocabulary Seed (before ingestion)**
Manually curated with Claude Code assistance. SRF-specific proper nouns, works, Sanskrit terms, techniques, concepts. Bounded (~500 canonical entries), high confidence, covers the highest-value suggestion candidates immediately.

**Pass 2: Entity Extraction from Enrichment**
Claude-generated entity JSONB at index time provides typed, normalized entities. All entities feed the suggestion dictionary by type.

**Pass 3: Phrase Mining from Summaries**
NLP over Claude-generated summaries extracts noun phrases and concept phrases -- not individual words. The "X on Y" pattern ("Yogananda on meditation," "Yogananda on divine love") is a particularly high-value pattern for a teacher-centered corpus.

### Suggestion Tiers (Priority Order)

```
Tier 1: Scoped queries -- "Yogananda on the nature of God"
  Highest intent, highest precision. Built from entity co-occurrence.

Tier 2: Named entities -- "Autobiography of a Yogi," "Lahiri Mahasaya," "Kriya Yoga"
  Precise, finite, always relevant. From canonical vocabulary seed.

Tier 3: Domain concept phrases -- "cosmic consciousness," "divine love"
  Multi-word, semantically rich. From topic and summary mining.

Tier 4: Sanskrit terms with definitions -- "Samadhi -- superconscious state"
  Shown with inline definition. Educates while suggesting.

Tier 5: Learned queries from logs
  User-validated. Grows over time. Eventually becomes the best signal.

Tier 6: Single high-value domain terms
  ~200-300 terms. Hand-curated or tightly filtered. Not raw vocabulary.
```

### Redis Prefix Index

```python
# At dictionary build time:
# "Yogananda on meditation" generates prefix entries:
# y, yo, yog, yoga, yogananda, yogananda , yogananda o, ...
# Each entry: (prefix, language) -> [(suggestion, weight, type)]

# Namespaced by language:
redis.zadd(f"suggestions:{language}", {suggestion: weight})

# At query time:
# ZRANGEBYLEX suggestions:en "[Yog" "[Yog\xff"
# Returns in < 1ms regardless of dictionary size
```

### Fallback: pg_trgm Fuzzy Matching

When Redis prefix returns < 3 results (misspelling, mid-word prefix):

```sql
SELECT suggestion, weight, suggestion_type
FROM suggestion_dictionary
WHERE similarity(suggestion, $partial_query) > 0.3
  AND language = $detected_language
ORDER BY weight DESC,
         similarity(suggestion, $partial_query) DESC
LIMIT 10;
```

Response time: 5--20ms. Acceptable as fallback.

### Sanskrit Special Handling

Users type transliterations imprecisely. "sama," "samdhi," "smadhi" -- all should reach "Samadhi." The `sanskrit_terms` table holds all variant forms. All variants are loaded into Redis prefix entries. Fuzzy matching catches remaining misspellings. Display includes inline definition.

### Multilingual Suggestion Routing

```python
def get_suggestions(partial: str, session_language: str) -> dict:
    script = detect_script(partial)   # instant: character range lookup
    language = detect_language(partial) or session_language

    # Redis lookup
    redis_key = f"suggestions:{language}"
    results = redis.zrangebylex(redis_key, f"[{partial}", f"[{partial}\xff")

    # Fallback if needed
    if len(results) < 3:
        results += postgres_trgm_fallback(partial, language)

    # Categorize by type
    return {
        "entities":      [r for r in results if r.type in ('teacher','work','character')],
        "techniques":    [r for r in results if r.type == 'technique'],
        "concepts":      [r for r in results if r.type in ('concept','sanskrit')],
        "learned":       [r for r in results if r.type == 'learned_query'],
    }
```

### Frontend: Debounce Required

Fire suggestion requests after 80--120ms of keystroke inactivity. Without debounce, overlapping requests return out of order. Debounce reduces request volume ~60% and is imperceptible to users.

---

## Multilingual Architecture

### Language Detection

Tool: **fastText language identification** -- 170+ languages, sub-10ms, highly accurate on short text. Superior to `langdetect` for partial queries.

Applied at:
- Ingestion: per chunk, stored as `language` + `script` + `language_confidence`
- Query time: per query, drives BM25 index routing and query expansion language

### Multilingual Query Expansion

Claude expands queries in the source language. Critical: if user queries in French and expansion produces English terms, BM25 fails on French text. Semantic/vector search remains cross-lingual; BM25 is language-specific.

```python
prompt = f"""
You are a multilingual search assistant. The user is searching in {detected_language}.
Generate 4 semantically related search queries.
ALL generated queries must be in {detected_language} -- do not translate.
Query: {query}
Return as JSON array of strings.
"""
```

**Cross-lingual mode (user opt-in):** Generate HyDE hypothesis in source language, rely on vector search (language-agnostic), skip BM25 leg. Finds semantically equivalent passages across all languages in the corpus.

### Cross-Lingual Retrieval Capability

Because Voyage `voyage-3-large` operates in a unified multilingual embedding space, a French query naturally retrieves French passages, and a user opting into cross-lingual search retrieves relevant passages regardless of the language they were written in -- without any translation step. This is a structural property of the embedding model, not a feature requiring separate implementation.

---

## AWS Infrastructure

> **Project divergence.** The portal uses **Next.js on Vercel** (not API Gateway + Lambda) for all API endpoints — search, suggestions, graph exploration. Vercel Edge Functions and Route Handlers replace the Lambda + API Gateway + Step Functions compute layer described below. Storage (Neon, S3), graph (Neptune Analytics), search services (Voyage, Cohere Rerank), cache (Redis/ElastiCache), and AI (Claude via Bedrock) align with the project architecture. See DESIGN.md § FTR-014 for the actual deployment diagram.

```
STORAGE
+-- S3                      -- raw books, processed chunks as JSON, pipeline artifacts
+-- Neon Postgres           -- primary database (managed, branches for dev/test)

COMPUTE
+-- Lambda                  -- search endpoints, suggestion endpoints, enrichment triggers
+-- Step Functions          -- complex ingestion pipeline orchestration
+-- SageMaker (optional)    -- Voyage self-hosted at high volume

GRAPH
+-- Neptune Analytics       -- knowledge graph + concept graph + vector algorithms

SEARCH SERVICES
+-- Voyage API              -- embeddings (or SageMaker at scale)
+-- Cohere Rerank API       -- reranking

CACHE
+-- ElastiCache (Redis)     -- embedding cache, suggestion prefix index, Related Teachings cache

API
+-- API Gateway             -- search, suggestions, graph exploration endpoints

AI
+-- Claude (Bedrock)        -- query expansion, HyDE, enrichment, intent classification
```

**No OpenSearch. No Pinecone. No Weaviate. No additional vector database.** Neon Postgres handles dense retrieval, keyword retrieval, and all relational data. Neptune Analytics handles graph traversal and graph-native vector search. Two data systems, cleanly separated by concern.

---

## Implementation Sequence

### Pre-Implementation (Before Claude Code Writes Code)

1. **Corpus structural audit** -- human judgment. Read representative samples from each document type. Define chunking strategy per type. This determines whether chunk boundaries preserve meaning.

2. **Enrichment prompt design sprint** -- write the Claude enrichment prompt. Test against 30 real passages spanning all document types and subjects. Evaluate outputs critically. Is entity extraction catching SRF-specific distinctions? Is "Divine Mother" typed correctly? Iterate until outputs are genuinely accurate. Document final prompt as a spec.

3. **Write 300 suggestions by hand** -- what should a user typing "yo," "kr," "sam," "div," "medi" see? This becomes the golden evaluation set and north star for suggestion quality.

4. **Define query intent taxonomy** -- name the intent categories for these users. Write 5 example queries per category. Define how retrieval should differ. This becomes the spec for intent classification.

5. **Build entity registry** -- canonical names, aliases, types for all major entities. Claude Code generates initial version from domain knowledge. Human review closes gaps. Build before ingestion begins.

### Phase 1: Retrieval Foundation (Weeks 1-3)

Chunking pipeline (per document type) -> Voyage embeddings -> pgvector HNSW -> pg_search BM25 with ICU -> RRF fusion -> Cohere reranking -> context expansion -> query logging.

Ship it. Get users. Learn what breaks.

### Phase 2: Intelligence Layer (Weeks 4-8)

HyDE, intent classification, metadata pre-filtering, Redis suggestion system, Sanskrit normalization, word graph co-occurrence edges, Claude enrichment with full entity/relationship extraction.

### Phase 3: Knowledge Graph (Weeks 9-14)

Neptune Analytics setup -> teacher/work/chunk nodes -> lineage edges -> authorship edges -> NEXT/PREV sequential chains -> concept mentions on chunks -> Voyage embeddings on nodes -> PATH C active in query pipeline -> GraphRAG live.

### Phase 4: Concept/Word Graph (Weeks 15-20)

Cross-tradition equivalence extraction from commentaries -> progression chains -> full word graph -> query expansion via graph traversal -> Neptune Analytics algorithms (PageRank, community detection, centrality) -> results feeding suggestion weights.

### Ongoing

Query log analysis -> learned suggestions -> weight tuning -> evaluation harness runs on every deploy -> graph algorithm refresh nightly.

---

## Evaluation Infrastructure

### Golden Retrieval Set

50 queries with known-good results. Covers all intent classes, multiple languages, Sanskrit terms, proper nouns, conceptual queries, and cross-tradition queries. Metrics: Recall@10, MRR, NDCG. Run automatically on every change.

### Golden Suggestion Set

The 300-suggestion list from the pre-implementation step. For each prefix, expected top-3 and terms that must not appear. Run automatically.

### Query Log Analysis

Weekly review of:
- Queries with zero or low-engagement results (failure modes)
- Queries with high engagement (what works)
- New query patterns not covered by suggestions
- Language distribution

---

# PART II: PROPOSED FEATURES AND USE CASES

*Note: All features display verbatim text from the corpus. AI serves retrieval, enrichment, curation, navigation, and classification -- never synthesis or paraphrase of the teaching itself.*

---

## Feature 1: Related Teachings Side Panel

When a user reads any paragraph, a side panel displays passages from the entire corpus that are meaningfully related -- surfaced by graph traversal, not just embedding similarity.

### Why This Is Different From Search

A user did not formulate a query. They encountered a passage in reading. The system responds to the passage itself -- not to what the user typed, but to what they are reading. This is passive discovery: the corpus reaching toward the reader.

### What Powers It

A single Neptune openCypher query combining multiple traversal paths, pre-computed at index time and cached in Redis:

- **PATH 1:** Vector similarity -- semantically similar passages from anywhere in the corpus
- **PATH 2:** Concept neighborhood -- passages mentioning related concepts (via CO_OCCURS_WITH, PARALLELS, PROGRESSION_TO edges)
- **PATH 3:** Same experiential state -- different teachers or works describing the same depth of consciousness
- **PATH 4:** Cross-tradition parallels -- if passage is Hindu-framed, surfaces Christian-framed equivalents; and vice versa

### Side Panel Display

Related passages are displayed in categories based on the traversal path that found them:

```
RELATED TEACHINGS
-------------------------------------
> Same Concept                    [3]
  Passages about samadhi from
  different works

> Deeper in This Theme            [2]
  What this state progresses toward

> Another Teacher's Expression    [2]
  Sri Yukteswar on the same subject

> Parallel Tradition              [2]
  Christian mystical equivalent

> Technique for This State        [1]
  Practice instruction toward
  this experiential depth
-------------------------------------
```

The relationship type is information, not just retrieval. The user sees not just that a passage is related but how -- an educational and contemplative value beyond search.

### Implementation

Lambda function triggered on paragraph load. Neptune query executes, results cached in Redis keyed by chunk ID with appropriate TTL. Pre-compute cache for all chunks at index time -- when a user opens a paragraph, the side panel is instant. Cold response ~80ms, cached ~5ms.

---

## Feature 2: Knowledge Graph Exploration UI

A dedicated page for interactive visual exploration of the knowledge graph -- entities, their relationships, the lineage of transmission, and the network of cross-references across the entire corpus.

### Technology: react-force-graph-3d (WebGL via Three.js)

D3 force graphs are CPU-bound JavaScript and struggle above ~2,000 nodes. The SRF knowledge graph will exceed this. `react-force-graph-3d` renders on the GPU and handles hundreds of thousands of nodes at interactive framerates.

Two view modes:
- **3D Force Graph** -- immersive spatial exploration; concepts as stars in a constellation
- **2D D3 View** -- analytical clarity; toggle for users who prefer flat layout

Never load the full graph. Always load ego networks -- center node plus N hops. Full graph is for algorithms, not human eyes.

### Special Visualization: Lineage View

The transmission chain (Babaji -> Lahiri -> Yukteswar -> Yogananda) is sacred and structured. Render as a top-down hierarchical tree with edges as flowing lines. Distinct from force-directed exploration -- switchable mode. Immediately recognizable and meaningful to SRF users.

### Special Visualization: Depth Progression

ExperientialState nodes form a vertical linear progression from ordinary consciousness to cosmic consciousness. Render with a vertical spatial axis: higher elevation = deeper state. Concepts and chunks cluster around the states they relate to. Users see at a glance which parts of the corpus address which depths of experience.

### Interaction Design

```
Node types visually distinct by color:
  gold      Teachers
  deep blue Works
  violet    Concepts
  saffron   Sanskrit Terms
  green     Techniques
  white     Divine Names
  teal      Experiential States

Node size = PageRank centrality

Edge types visually distinct:
  thick gold    TRANSMITTED_TO (lineage)
  blue          AUTHORED
  dashed violet CROSS_TRADITION_EQUIVALENT
  green arrow   PROGRESSION_TO (directional)
  gray thin     MENTIONS (low opacity)

Filter panel:
  Node type inclusion/exclusion
  Edge type inclusion/exclusion
  Minimum centrality threshold (slider)
  Community cluster selection
  Depth from center: 1 | 2 | 3 hops

Node click -> right panel:
  Entity card with description
  "Find passages about this" -> search
  "Related Teachings for this concept"
  "Expand +1 hop"

Edge hover -> tooltip:
  Relationship type and properties
  Source works for this relationship
  "Find passages describing this relationship"
```

---

## Feature 3: Word/Concept Graph Exploration UI

A dedicated page for exploring the semantic topology of the SRF vocabulary -- how terms relate, progress, and bridge across traditions.

### Technology: D3 (Primary), WebGL (Progressive Enhancement)

The word graph is denser and more probabilistic than the knowledge graph. D3 force simulation with aggressive collision detection and dynamic link strength mapped to edge weight is ideal for the casual, exploratory interactions this feature supports. WebGL as progressive enhancement if the dictionary grows very large.

### The Path-Finding Mode

The most profound interaction. Select two terms -- "devotion" and "samadhi." The graph highlights the shortest path between them:

```
devotion -> divine love -> concentration -> meditation -> samadhi
```

This path is itself a teaching. It answers a question -- "how does devotion lead to samadhi?" -- that no keyword or semantic search can answer. The graph traversal produces a response that is at once computational and spiritually meaningful.

### Interaction Design

```
Node size     = corpus frequency (mentions)
Node color:
  saffron     Sanskrit terms
  blue        English concepts
  white       Divine names
  green       Techniques
  teal        Experiential states

Edge thickness = relationship strength / weight

Edge color:
  gold        SYNONYM_OF
  violet      CROSS_TRADITION_EQUIVALENT  <- most revealing
  green       PROGRESSION_TO (directional, with arrows)
  gray        CO_OCCURS_WITH

Filter panel:
  Edge type inclusion/exclusion
  Co-occurrence weight threshold (slider)
  Language filter: English | Sanskrit | All
  Community/cluster selection

Term click -> right panel:
  Canonical form, devanagari if Sanskrit
  Definition + SRF definition
  Corpus frequency
  "Search this term" -> retrieval results
  "Find passages progressing from this"

Path-finding mode:
  Select origin term -> select destination term
  Graph highlights shortest path
  Path terms listed with relationship labels
```

---

## Feature 4: The Contemplative Companion

Not a search engine. A different mode of engaging with the corpus entirely.

A user arrives without a query. They bring a state -- grief, confusion, seeking, joy, a specific experience in meditation they cannot name. The interface invites: *Describe what you are experiencing.*

Free text. Not formatted as a search query. Whatever comes.

The system embeds the description, traverses the ExperientialState graph for proximity, identifies the closest described states, and surfaces a single verbatim passage that speaks most directly to the expressed condition. Not ten results -- one. Offered without interface noise.

A follow-up: *Would you like to stay here, go deeper, or find guidance?*
- Stay here: lateral traversal -- similar passages in the same state
- Go deeper: PROGRESSION_TO traversal -- passages describing deeper states
- Find guidance: technique instruction passages approaching this state

This is not search. The corpus responds to the person's present condition. A user who cannot articulate what they are looking for is met by the system precisely where they are.

### Implementation Notes

- Embed user's free-text description with Voyage (`input_type = 'query'`)
- Vector search against ExperientialState node embeddings in Neptune
- Then retrieve top chunks linked to matched states via DESCRIBES_STATE edges
- Rerank with Cohere against the original description
- Return top 1 for the primary display; hold top 10 for navigation

---

## Feature 5: The Scripture-in-Dialogue Engine

Yogananda spent thirty years producing two monumental commentaries -- the Bhagavad Gita verse-by-verse and the four Gospels verse-by-verse -- explicitly to demonstrate their underlying unity. This use case makes that lifework computationally navigable.

Given any verse from either scripture, the system surfaces:

1. Yogananda's full commentary on that verse (verbatim, from the corpus)
2. The corresponding verse and commentary from the other scripture (via CROSS_TRADITION_EQUIVALENT edges)
3. All teachings from other works that illuminate the connection between the two

A user reads Krishna's words on surrender in the Gita. The system simultaneously surfaces Yogananda's Gita commentary, his Gospel commentary on "thy will be done," and all additional teachings where these two are woven together.

The dialogue Yogananda built across thirty years becomes a live, navigable conversation.

### Knowledge Graph Requirements

- `:Scripture` nodes at verse-level granularity for Gita and Gospels
- `(:Work)-[:INTERPRETS {verse}]->(:Scripture)` edges at verse level
- `(:Chunk)-[:CROSS_REFERENCES {verse}]->(:Scripture)` from commentary chunks
- `(:Scripture)-[:CROSS_TRADITION_EQUIVALENT]->(:Scripture)` edges

---

## Feature 6: The Lineage Voice Comparator

Each teacher in the lineage expressed the same truth through a distinct personality, cultural context, and expressive register. Four voices. Never before placed in direct comparison.

At index time, Claude tags each chunk with a voice signature -- expressive quality distinct from the author field. A dedicated comparison view: given any concept, display how each teacher expressed it, in their own verbatim words, side by side.

Voice registers in the corpus:
- **Lahiri:** grounded, paradoxical, expressed through brief statements and action; sparse
- **Yukteswar:** structurally precise, scientifically rigorous, intellectually demanding
- **Yogananda:** vast, devotionally warm, metaphorically rich, simultaneously intimate and cosmic, humor as vehicle
- **Babaji:** present only through accounts -- a teaching expressed as pure presence and transmission

A student can find which lineage voice resonates most deeply with their own nature and follow that resonance deeper into the corpus.

### Implementation

- `voice_register` field on chunks (populated at enrichment time)
- `author_canonical` field linking to Teacher node in Neptune
- Comparison query: retrieve top 3 chunks per teacher on given concept
- Display: side-by-side columns, four voices, verbatim text, source attribution

---

## Feature 7: The Evolution of a Teaching

Yogananda's major works took decades. The corpus spans his entire American period: 1920 lectures to final writings in 1952. His understanding deepened over thirty years.

Track how Yogananda's expression of a specific concept evolved chronologically. Every chunk carries a date or date range. The knowledge graph has temporal properties on edges.

Display: a timeline visualization with a concept node at center, passages arranged chronologically around it. Tone and depth visually shift over time. The user sees a teacher's understanding maturing across a lifetime.

### Implementation

- `composition_year` on books and chunks
- Timeline rendered with D3 or a time-series visualization library
- Passages clickable to reveal full verbatim text

---

## Feature 8: Meditation State Recognition

A practitioner has an experience in meditation and cannot name it or find it -- they don't know which words to search for.

Interface: describe the experience in your own words. Any words. Any language.

The system embeds the description, traverses the ExperientialState graph, finds the state or states most closely matching, and surfaces Yogananda's verbatim descriptions of that state from multiple works. The return also shows the state's position in the depth progression -- where it sits on the path.

The practitioner is not searching for information. They are asking the corpus to help them understand and navigate their own inner life. The system becomes a cartographer of consciousness, using Yogananda's direct experiential accounts as the map.

### ExperientialState Nodes Required

Minimum state nodes (expandable):

1. Ordinary waking consciousness
2. Relaxed physical relaxation / tension release
3. Pratyahara -- interiorization of the senses
4. Dharana -- concentration
5. Dhyana -- meditation / absorbed concentration
6. Sabikalpa samadhi -- samadhi with form
7. Nirvikalpa samadhi / cosmic consciousness -- formless

Plus intermediate and transitional states described specifically in the corpus.

---

## Feature 9: The Cosmic Chants as Portal

Each of Yogananda's Cosmic Chants was understood not merely as music but as a specific vehicle for a specific quality of divine experience. Each chant approaches the Divine through a distinct devotional register.

When a practitioner selects a chant they practice, the system surfaces:
- All teachings in the corpus that deepen the inner dimension of that chant's devotional approach
- Passages describing the experiential state the chant is oriented toward
- Related chants approaching through similar devotional qualities

Extended: map the entire Cosmic Chants collection as a graph of devotional states. Some chants approach through longing, some through joy, some through surrender, some through devotion to a specific divine aspect. The chant graph is a map of devotional approach.

---

## Feature 10: The Healing Architecture

> **Omitted from project scope.** Creating a structured condition-to-practice graph (`:MentalState`→`:PhysicalRegion`, `:Practice`→`:Imbalance`) risks positioning the portal as making health claims, even with disclaimers. The liability and theological concerns outweigh the value. *Scientific Healing Affirmations* is fully searchable as a book — seekers can find healing affirmations through standard search. No structured healing graph will be built. The "spiritual teaching, not medical advice" disclaimer noted below is insufficient protection for a structured healing navigation system.

Yogananda wrote systematically on the relationship between spiritual states, mental attitudes, and physical condition -- most explicitly in *Scientific Healing Affirmations*. The corpus contains a detailed theory of the relationship between consciousness, life force, and physical experience with its own internal logic and substantial documentation.

A user seeking the teaching's perspective on a specific challenge can navigate this territory through a dedicated graph layer:

```
(:MentalState)-[:AFFECTS_PRANA_FLOW]->(:PhysicalRegion)
(:Attitude)-[:DEPLETES|CHARGES]->(:LifeForce)
(:Practice)-[:CORRECTS]->(:Imbalance)
```

Affirmations surface verbatim with their source context -- the full teaching surrounding the affirmation, not just the phrase.

*Note: This is spiritual teaching, not medical advice. Display and framing must be clear on this distinction.*

---

## Feature 11: The Inter-Tradition Bridge

> **Scope constrained.** The portal surfaces Yogananda's own explicit cross-tradition mappings — which are extensive (Christian mysticism, Vedanta, Gita yoga paths, and more). He made these mappings deliberately across many works. Extending mappings beyond what Yogananda wrote (e.g., Sufi "fana" ↔ nirvikalpa samadhi, Tibetan "rigpa" ↔ cosmic consciousness) would be theological interpretation, violating the "librarian, not oracle" principle (FTR-001). The concept/word graph (FTR-034) implements CROSS_TRADITION_EQUIVALENT edges but only for Yogananda's own explicit statements. If Yogananda wrote that a concept maps to another tradition, that mapping exists. If he did not, it does not — regardless of how obvious it seems.

Yogananda's explicit mission was demonstrating the underlying unity of all genuine spiritual traditions. The corpus contains explicit mappings between his teaching and Christian mysticism, Vedanta, and the Bhagavad Gita's yoga paths. The resonances extend further.

An extended graph layer maps world contemplative traditions to the SRF corpus vocabulary:

```
Sufi "fana"          <-> nirvikalpa samadhi
Tibetan "rigpa"      <-> cosmic consciousness
Jewish Ein Sof       <-> formless Brahman
Meister Eckhart      <-> SRF concepts of the soul's union with God
```

A practitioner from any genuine contemplative tradition types in their own vocabulary and arrives at Yogananda's teaching on the same interior territory. The system makes Yogananda's vision of unity operationally real.

---

## Feature 12: The Living Commentary

The great commentaries -- *God Talks With Arjuna* and *The Second Coming of Christ* -- are vast. No one reads 1,700 pages sequentially and retains the full architecture of references.

Make the commentaries hypertext: every reference Yogananda makes becomes a live link into the corpus.

- "Yogananda says this connects to Hong-Sau" -> link to technique teaching
- "He references Lahiri Mahasaya here" -> link to relevant Lahiri account
- "He returns to this point in the Gita commentary" -> parallel passage

The reader can follow the deep architecture of Yogananda's thought as he built it across two scriptures. Every internal cross-reference in the text becomes a navigable edge in the knowledge graph.

### Implementation

- `cross_references` JSONB field on chunks (populated at enrichment time)
- Knowledge graph `(:Chunk)-[:CROSS_REFERENCES]->(:Work|:Teacher|:Scripture)` edges
- UI renders inline reference cards with verbatim preview on hover
- Click expands full passage in reading panel

---

## Feature 13: Reading Arc -- Graph-Guided Progressive Study

A user selects a concept to understand deeply: "cosmic consciousness," "divine love," "the guru-disciple relationship."

The system generates a curated reading sequence -- ordered by the concept progression graph, not chronologically and not by table of contents. The sequence moves from accessible introductions through philosophical depth to technique instruction to direct experiential accounts, in the order the graph topology suggests the understanding deepens.

Output: a personal study program navigable as a series of reading sessions, each session surfacing verbatim passages in sequence.

This is the word graph's progression edges used as a curriculum generator. Not designed by a human editor -- computed from graph topology and depth metadata, then optionally refined.

---

## Feature 14: The Lineage as Passage Genealogy

When a user reads a passage, the side panel can show not just related teachings but the genealogy of the teaching -- the chain of transmission and reference that crystallized into this specific paragraph.

The knowledge graph has the edges. The UI: a vertical timeline of influence. The user sees not just what Yogananda wrote but the lineage of thought that produced this specific passage: which scripture was its source, which teacher in the lineage refined this understanding, which oral teaching preceded the written form.

---

## Feature 15: Semantic Drift Detection (Administrative Tool)

As books are added to the library over time, the concept graph evolves. Run Neptune's community detection algorithm monthly. Compare cluster structure to previous month.

Surface to corpus curators:
- Which concepts have moved significantly in the graph topology
- New cross-tradition equivalence edges that have formed
- Which terms have become highest-betweenness nodes (new bridges)
- Communities that have merged or split

The corpus becoming self-aware of its own semantic evolution. Changes in graph structure are themselves meaningful information about the teaching's documented development. A curatorial and administrative tool, not user-facing.

---

## Feature 16: Consciousness Cartography

The most ambitious visualization. Not a graph. Not a timeline. A spatial map of inner territory derived from the entire corpus.

Yogananda describes states of consciousness with extraordinary specificity -- sensory qualities, spatial qualities, temporal qualities, qualities of light, sound, feeling, selfhood. These descriptions constitute a detailed phenomenological cartography of contemplative states across thousands of passages.

Extract phenomenological qualities at index time. Cluster them. Render as a spatial landscape -- not graph nodes but a literal terrain:

- **Elevation** = experiential depth (deeper states are higher)
- **Color** = quality of experience (devotional warmth, intellectual clarity, formless dissolution)
- **Texture** = density of corpus coverage for that territory
- **Passages** = points of light within the landscape

A practitioner navigates the map and clicks a region -- "what is this quality of stillness?" -- and finds every passage in the corpus describing that specific experiential territory, verbatim.

**Technology:** WebGL (Three.js). ExperientialState nodes provide the terrain regions. Progression edges provide the paths between regions. Cross-tradition equivalence edges show where other traditions have mapped the same territory under different names.

A user who has never meditated sees a landscape and wonders where the path begins. A long-term practitioner sees where they are and what lies ahead. A scholar sees the full topology of what one teacher mapped of the inner life across thirty years of direct documentation.

---

## Architectural Summary

The system is a single unified design, not a collection of features built separately. The enrichment pipeline produces structured metadata that simultaneously serves: full-text retrieval, semantic retrieval, graph traversal, suggestion vocabulary, intent classification, voice comparison, state matching, cross-tradition bridging, and temporal analysis.

The knowledge graph and concept graph are not separate systems -- they are a single Neptune Analytics instance with two relationship vocabularies. The relational data in Neon Postgres and the graph data in Neptune are joined by canonical entity IDs.

Every use case above draws from the same pool of enriched, embedded, graph-linked content. Each new feature is an additional traversal pattern over infrastructure that already exists -- not a new integration requiring new data pipelines.

This is what makes the architecture world-class: not the sophistication of any individual component, but the coherence of the whole. One corpus, one enrichment pass, one graph, one embedding space -- navigable in every direction the tradition's depth warrants.

---

*End of Document*

**For Claude Code:** Begin with the pre-implementation checklist before writing any code. The enrichment prompt, chunking strategy by document type, entity registry, and 300-suggestion golden set must exist before the ingestion pipeline is built. These are not tasks to defer -- they determine the quality ceiling of everything built afterward.
