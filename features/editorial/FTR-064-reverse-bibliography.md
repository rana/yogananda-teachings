---
ftr: 64
title: "Reverse Bibliography — What Yogananda Read"
state: approved-provisional
domain: editorial
arc: 3c+
---

# FTR-064: Reverse Bibliography

## Rationale

Yogananda frequently references the Bhagavad Gita, the Bible, Kabir, Mirabai, Rumi, Tagore, and scientific figures throughout his published works. A Claude "Classifying" pass extracts these external references and builds a reverse bibliography: a factual, read-only index of every external source Yogananda engages with.

### Implementation

At ingestion time (or as a batch pass over existing chunks), Claude Opus (FTR-105 batch tier) scans each chunk and extracts external references:

```
Claude input: chunk text
Claude output (JSON): [
  {"source": "Bhagavad Gita", "type": "scripture", "nature": "quote"},
  {"source": "Albert Einstein", "type": "person", "nature": "reference"}
]
```

This is a "Classifying" category use — JSON output, no prose. Spot-checked by reviewer.

### Schema

```sql
-- ============================================================
-- EXTERNAL REFERENCES (reverse bibliography — Milestone 3c+)
-- ============================================================
CREATE TABLE external_references (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  name TEXT NOT NULL,               -- "Bhagavad Gita", "Albert Einstein"
  slug TEXT NOT NULL UNIQUE,        -- URL slug: 'bhagavad-gita'
  type TEXT NOT NULL,               -- 'scripture', 'person', 'text', 'tradition'
  description TEXT,                 -- editorial description
  reference_count INTEGER NOT NULL DEFAULT 0,  -- denormalized count
  created_at TIMESTAMPTZ NOT NULL DEFAULT now
);

CREATE TABLE chunk_external_references (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  chunk_id UUID NOT NULL REFERENCES book_chunks(id) ON DELETE CASCADE,
  reference_id UUID NOT NULL REFERENCES external_references(id) ON DELETE CASCADE,
  nature TEXT NOT NULL DEFAULT 'reference',  -- 'quote', 'reference', 'discussion', 'allusion'
  tagged_by TEXT NOT NULL DEFAULT 'auto',    -- 'auto', 'reviewed', 'manual'
  UNIQUE (chunk_id, reference_id)
);
```

### Route

`/references` — Index of all external sources Yogananda references, with passage counts.
`/references/[slug]` — All passages where Yogananda engages with that source.

**Example:** `/references/bhagavad-gita` — "Yogananda quotes the Bhagavad Gita 47 times across 6 books" with every passage displayed.

### Who This Serves

Scholars, interfaith seekers, and devotees who want to understand Yogananda's intellectual and spiritual lineage. It's data already in the text — surfaced, not generated.

**"Yogananda in Conversation" — the interfaith dimension.** The reverse bibliography is framed as a scholarly index, but it is also the portal's most natural interfaith bridge. Yogananda engaged with the Bible and the Bhagavad Gita, with Christ and Krishna, with Kabir and Rumi, with Einstein and Luther Burbank. The totality of these references forms a map of one tradition's deep engagement with many others — grounded entirely in verbatim text, not in editorial interpretation. For a Christian seeker, `/references/bible` answers "How does Yogananda engage with my scripture?" For a Sufi-inclined visitor, `/references/omar-khayyam` or `/references/kabir` does the same. For an agnostic, the full reference index shows the breadth of Yogananda's intellectual world. The reverse bibliography can carry a secondary editorial framing — "Yogananda in Conversation" — surfacing this cross-tradition engagement as a navigational pathway alongside its scholarly function. The data is identical; the framing acknowledges that these references serve worldview navigation, not just academic cataloging. See also FTR-056 § Worldview adaptation and CONTEXT.md § Open Questions (Stakeholder: worldview-sensitive `/guide` pathways).
