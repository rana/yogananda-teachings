Database operations assistant. Schema-aware guide for the portal's Neon PostgreSQL database.

$ARGUMENTS

## Connection

- **Neon Project:** `delicate-butterfly-11871129` (us-east-1, Scale tier)
- **Primary interface:** Neon MCP tools (`run_sql`, `prepare_database_migration`, `complete_database_migration`)
- **Migrations:** dbmate, numbered SQL files in `/migrations/`

## Schema (from migrations/001_initial_schema.sql)

### Core Tables
| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `books` | Book catalog | id, title, author, language, content_format, author_tier, cover_image_url, canonical_book_id |
| `chapters` | Chapter index | book_id, chapter_number, title, sort_order |
| `book_chunks` | Text passages + embeddings | book_id, chapter_id, content, embedding(1024), page_number, section_heading, contentful_id, language |
| `chunk_relations` | Pre-computed similarity | source_chunk_id, target_chunk_id, similarity, rank, relation_type |
| `chunk_references` | Editorial cross-refs | source_chunk_id, target_chunk_id, reference_type, note |

### Content Tables
| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `teaching_topics` | Theme taxonomy | name, slug, category, description, description_embedding |
| `topic_translations` | Theme i18n | theme_id, language, name |
| `chunk_topics` | Chunk↔theme join | chunk_id, theme_id, tagged_by (manual/auto/reviewed), similarity |
| `daily_passages` | Today's Wisdom pool | chunk_id, season_affinity[], tone, is_active |
| `affirmations` | Quiet Corner pool | content, book_title, chunk_id, language |

### Search & Discovery
| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `suggestion_dictionary` | Autosuggestion index | suggestion, suggestion_type, language, corpus_frequency, weight |
| `entity_registry` | Named entities | canonical_name, entity_type, aliases[], centrality_score |
| `sanskrit_terms` | Sanskrit normalization | canonical_form, display_form, devanagari, common_variants[] |
| `vocabulary_bridge` | Modern→Yogananda term mapping | layer, expression, yogananda_vocabulary[], query_expansion[] |

### Analytics (DELTA-compliant)
| Table | Purpose |
|-------|---------|
| `search_queries` | Anonymized query log (no user IDs) |
| `search_theme_aggregates` | Aggregated search themes by period |

### Extensions
`vector` (pgvector), `pg_trgm` (fuzzy matching), `unaccent` (diacritics), `pg_stat_statements` (query perf)

## Operations

Parse `$ARGUMENTS` to determine the operation:

### "status" or "health" — Corpus diagnostic
```sql
-- Books and chunk counts
SELECT b.title, b.language, COUNT(DISTINCT ch.id) as chapters,
  COUNT(c.id) as chunks, COUNT(c.embedding) as embedded,
  ROUND(COUNT(c.embedding)::numeric / NULLIF(COUNT(c.id), 0) * 100, 1) as embed_pct
FROM books b
LEFT JOIN chapters ch ON ch.book_id = b.id
LEFT JOIN book_chunks c ON c.chapter_id = ch.id
GROUP BY b.title, b.language ORDER BY b.title;

-- Relation summary
SELECT relation_type, COUNT(*), ROUND(AVG(similarity)::numeric, 3) as avg_sim
FROM chunk_relations GROUP BY relation_type ORDER BY count DESC;

-- Entity and term counts
SELECT 'entities' as type, COUNT(*) FROM entity_registry
UNION ALL SELECT 'sanskrit_terms', COUNT(*) FROM sanskrit_terms
UNION ALL SELECT 'suggestions', COUNT(*) FROM suggestion_dictionary
UNION ALL SELECT 'bridge_entries', COUNT(*) FROM vocabulary_bridge
UNION ALL SELECT 'teaching_topics', COUNT(*) FROM teaching_topics;
```

### "migrate [description]" — Create a new migration
1. List existing migrations: `ls migrations/`
2. Determine next number (increment by 1)
3. Create file: `migrations/NNN_description.sql` with `-- migrate:up` and `-- migrate:down` sections
4. Use Neon MCP `prepare_database_migration` to preview on a branch
5. After verification: `complete_database_migration` to apply

### "query [natural language]" — Translate to SQL
Translate the natural language request to SQL using the schema above. Execute via Neon MCP `run_sql`. Show results formatted as a table.

### "perf" — Query performance
```sql
SELECT query, calls, mean_exec_time::numeric(10,2) as avg_ms,
  total_exec_time::numeric(10,2) as total_ms
FROM pg_stat_statements
ORDER BY mean_exec_time DESC LIMIT 15;
```

### No argument — Show overview
Display the schema summary tables above, then ask what operation to perform.

## Migration Conventions

- Sequential numbering: `001_`, `002_`, etc.
- Always include both `-- migrate:up` and `-- migrate:down`
- Use `uuidv7()` for primary keys (time-ordered UUIDs)
- Every content table needs `language TEXT NOT NULL DEFAULT 'en'` (PRI-06)
- Every mutable table needs `updated_at` with trigger (use `set_updated_at()`)
- Use `CHECK` constraints for enum-like columns
- Index columns used in WHERE clauses and JOINs

## Named Constants (lib/config.ts)

Search/chunking/embedding parameters live in `lib/config.ts` per FTR-012. When a migration adds columns that relate to configurable behavior, add the corresponding constant to config.ts with value, rationale, and evaluation trigger.
