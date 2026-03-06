---
ftr: 102
title: Contentful as Editorial CMS
state: approved
domain: foundation
arc: 1+
governed-by: [PRI-10, PRI-12]
---

# FTR-102: Contentful as Editorial CMS

## Rationale

### Context

The portal needs a content management system for editorial workflows (theme curation, daily passages, event calendars, book metadata). SRF uses Contentful as their standard CMS. The question: when should Contentful enter the architecture?

### Decision

Adopt **Contentful as the editorial source of truth from Arc 1**. Book text is imported to Contentful during ingestion and synced to Neon for search indexing. Contentful is where editors work; Neon is where search works.

### Content Model

```
Book → Chapter → Section → TextBlock
```

Each level is a Contentful entry type. TextBlocks contain the actual paragraph text as Rich Text. Locales: `en-US` (default), plus target languages as added.

### Rationale

- SRF organizational standard — their team has Contentful expertise
- Rich Text AST provides structured content without HTML parsing
- Localization is native — each entry can have content per locale
- Webhook-driven sync to Neon means editorial changes propagate automatically
- Contentful Delivery API for book reader pages (SSG at build time)
- Content Preview API for editorial review before publish

### Sync Architecture

```
Contentful (editorial source) → Webhook → Sync Service → Chunk + Embed → Neon (search index)
```

- Milestone 1a: Batch sync (one-time import script)
- Milestone 1c+: Webhook-driven sync (event-driven, real-time)

### Consequences

- Contentful is a Tier 2 dependency (replaceable without touching Tier 1 — PostgreSQL, SQL, HTML)
- Two content stores: Contentful (editorial truth) and Neon (search index). Accept this complexity for the separation of concerns.
- `contentful_id` column in `book_chunks` links search results back to Contentful entries for "read in context" deep links
- If Contentful is replaced in the future, the Neon search index is unaffected — only the sync service and book reader data source change
