---
ftr: 25
title: pg_search / ParadeDB BM25 for Full-Text Search
summary: "BM25 full-text search via ParadeDB pg_search extension with ICU tokenizer replacing tsvector"
state: approved
domain: search
governed-by: [PRI-06, PRI-10]
depends-on: [FTR-020]
---

# FTR-025: pg_search / ParadeDB BM25 for Full-Text Search

## Rationale

### Context

FTR-020 establishes hybrid search (vector + full-text) as the retrieval strategy. The initial design assumed PostgreSQL's built-in `tsvector` for full-text search. While functional, `tsvector` has limitations for this corpus:

1. **Ranking quality.** `ts_rank` uses a simple frequency-based scoring model. BM25 (Best Matching 25) is the standard ranking algorithm in modern information retrieval, providing significantly better relevance ranking through term frequency saturation, document length normalization, and inverse document frequency weighting.

2. **Multilingual tokenization.** `tsvector` relies on PostgreSQL's built-in text search configurations, which handle Western European languages well but lack specialized tokenization for CJK scripts, Arabic, and other complex writing systems. The portal's multilingual-from-foundation principle (FTR-058) requires tokenization that works across all target languages.

3. **No phrase search.** `tsvector` doesn't support proximity-aware phrase matching. Seekers often remember exact phrases from Yogananda's works ("door of my heart," "ever-new joy"). BM25 with positional indexing enables phrase and proximity search.

pg_search (the ParadeDB extension) is available on Neon in AWS regions. It provides Elasticsearch-quality BM25 entirely within Postgres — no separate service, full SQL JOIN capability, ACID-compliant.

### Decision

Use pg_search / ParadeDB BM25 as the full-text search engine for the portal. This replaces `tsvector` for all full-text retrieval.

**Primary BM25 index:** ICU tokenizer, covering ~90% of target languages with a single index:

```sql
CREATE INDEX chunks_bm25_icu ON book_chunks
    USING bm25 (id, content, summary, topics)
    WITH (
        key_field = 'id',
        text_fields = '{
            "content": {"tokenizer": {"type": "icu"}, "record": "position"},
            "summary": {"tokenizer": {"type": "icu"}},
            "topics":  {"tokenizer": {"type": "icu"}}
        }'
    );
```

**Language-specific partial indexes** for scripts that require specialized segmentation:

```sql
-- Chinese: Jieba dictionary-based segmentation
CREATE INDEX chunks_bm25_zh ON book_chunks
    USING bm25 (id, content)
    WITH (
        key_field = 'id',
        text_fields = '{"content": {"tokenizer": {"type": "jieba"}}}'
    )
    WHERE script = 'cjk' AND language LIKE 'zh%';

-- Japanese: Lindera morphological analysis
CREATE INDEX chunks_bm25_ja ON book_chunks
    USING bm25 (id, content)
    WITH (
        key_field = 'id',
        text_fields = '{"content": {"tokenizer": {"type": "lindera"}}}'
    )
    WHERE script = 'cjk' AND language = 'ja';
```

**Hybrid search via Reciprocal Rank Fusion (RRF):** The BM25 results are merged with pgvector results using RRF in a single SQL query, consistent with FTR-020.

### Rationale

- **BM25 is the industry standard.** Every major search engine (Elasticsearch, Solr, Typesense) uses BM25. It handles term saturation (repeating a word doesn't inflate scores) and document length normalization (short aphorisms aren't penalized relative to long narrative passages).
- **Multilingual tokenization from day one.** ICU tokenization handles Latin, Cyrillic, Arabic, Devanagari, and most scripts. Jieba and Lindera handle the CJK scripts that require dictionary-based segmentation. No separate search service required.
- **Stays inside Postgres.** pg_search operates as a Postgres extension. All queries are standard SQL with `@@@` operator. JOINs, CTEs, and transactions work naturally. No data synchronization with an external service.
- **Phrase search enables "I remember the exact words" queries.** Positional indexing (`"record": "position"`) enables phrase and proximity queries — critical for a corpus where seekers often remember specific formulations.

### Consequences

- `tsvector` columns and indexes are not needed; pg_search BM25 indexes replace them entirely
- The `hybrid_search` SQL function uses `paradedb.score(id)` and `@@@` operator instead of `ts_rank` and `@@`
- STG-001 BM25 indexes use ICU tokenizer for English, Hindi (Devanagari), and Spanish; CJK-specific indexes added in Milestone 5b
- FTR-020 (Search Architecture) updated to reflect pg_search in the search flow
- A `script` column on `book_chunks` routes queries to the appropriate partial index at Milestone 5b

## Notes

- **Origin:** FTR-025
