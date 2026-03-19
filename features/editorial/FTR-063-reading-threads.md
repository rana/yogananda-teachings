---
ftr: 63
title: "Editorial Reading Threads — Teachings in Conversation"
summary: "Curated multi-book passage sequences tracing spiritual themes as coherent progressions"
state: approved-provisional
domain: editorial
governed-by: [PRI-01, PRI-02, PRI-03]
depends-on: [FTR-030, FTR-055]
---

# FTR-063: Editorial Reading Threads

## Rationale

Curated reading paths that trace a single spiritual theme through multiple books as a coherent progression. These are not AI-generated content — they are editorially sequenced arrangements of existing passages, like a museum exhibit: same artworks, thoughtful arrangement.

### Concept

The `chunk_relations` table (FTR-030) connects passages by semantic similarity. Editorial threads add a curated layer: human-selected passages sequenced to flow from recognition → understanding → practice → transcendence.

**Example:** "Yogananda on Fear" — 8 passages from 4 books, editorially ordered to build a coherent contemplation.

**Example:** "The Path of Practice" (FTR-055) — a curated passage sequence tracing Yogananda's published arc from reading to practice: why meditate → what meditation is → what Kriya Yoga is → the lineage (Babaji, Lahiri Mahasaya, Sri Yukteswar, Yogananda) → the invitation to practice. All passages verbatim, all cited. The final entry signposts SRF's free Beginner's Meditation (`yogananda.org/a-beginners-meditation`) and the SRF Lessons (`yogananda.org/lessons`). This thread is the corpus-grounded version of what SRF's website provides through editorial copy — but here it is Yogananda's own voice making the invitation. Requires multi-book corpus (STG-008+).

The "Seeking..." entry points already hint at this. Threads make the connection explicit and browsable.

### Schema

```sql
-- ============================================================
-- EDITORIAL THREADS (curated multi-book reading paths — STG-008+)
-- ============================================================
CREATE TABLE editorial_threads (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  slug TEXT NOT NULL UNIQUE,        -- URL slug: 'yogananda-on-fear'
  title TEXT NOT NULL,              -- "Yogananda on Fear"
  description TEXT,                 -- Brief editorial introduction
  language TEXT NOT NULL DEFAULT 'en',
  is_published BOOLEAN NOT NULL DEFAULT false,  -- human review gate
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now
);

CREATE TABLE thread_passages (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  thread_id UUID NOT NULL REFERENCES editorial_threads(id) ON DELETE CASCADE,
  chunk_id UUID NOT NULL REFERENCES book_chunks(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,        -- ordering within the thread
  editorial_note TEXT,              -- optional editorial transition/context
  UNIQUE (thread_id, position)
);
```

### Route

`/threads` — Index of all published threads.
`/threads/[slug]` — A single thread: sequential passages with editorial transitions, each passage linking to "Read in context" in the full reader.

### Design

- Warm, unhurried layout — passages presented one at a time with generous whitespace
- Each passage shows full citation (book, chapter, page) and "Read in context →" link
- Optional editorial notes between passages provide transitions (never paraphrasing Yogananda — only "In this next passage, written twenty years later, Yogananda returns to..." style framing)
- The thread is a reading experience, not a list — designed for contemplation, not scanning

### Sequencing Principles (Discovery Research, March 2026)

Research from museum curation and liturgical design (deep-research-gemini-discovery-without-surveillance.md) identifies three patterns for sequencing passages into coherent journeys:

**The Palette Cleanser.** Museum curators insert neutral, accessible works between intense pieces to prevent cognitive fatigue. Reading threads must enforce the same discipline: no three consecutive passages should share the same depth signature or rasa. After two "catalytic" or "bottomless" passages, insert a grounding narrative passage — a breathing-centric text, a biographical moment, an accessible story — to reset the seeker's emotional and cognitive state before returning to depth. This is a structural constraint on thread construction, not a suggestion.

**Anthology Framing.** Literary anthology editors use inter-item framing notes as "connective tissue" that participates in the reading rhythm without altering the source texts. The editorial_note field in thread_passages should explicitly call out shifts in voice register or rasa: "Here, the text transitions from a cosmic, philosophical register to deeply personal devotion..." This guides the reader's cognitive framing before they encounter the next passage — the pattern of the museum audio guide, whispering context between artworks.

**The Liturgical Energy Curve.** Homiletic tradition structures readings in a deliberate arc: acknowledgment of the human condition → introduction of the spiritual principle → the climactic teaching → consolation and integration. Threads should follow this shape rather than maintaining uniform intensity or ordering purely by topic. The recognition → understanding → practice → transcendence progression already specified above aligns with this curve — the research confirms it as the optimal structure for emotional sequencing in sacred text contexts.
