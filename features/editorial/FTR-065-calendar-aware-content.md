# FTR-065: Calendar-Aware Content Surfacing

**State:** Approved (Provisional)
**Domain:** editorial
**Arc:** 3b+

## Rationale

The `daily_passages` pool already supports optional seasonal weighting. Calendar-aware surfacing extends this with explicit date-to-passage associations, connecting the portal's daily experience to moments that carry spiritual significance.

### Calendar Events

| Category | Examples | Passage Source |
|----------|----------|---------------|
| **Yogananda's life** | Birth anniversary (Jan 5), Mahasamadhi (Mar 7), Arrival in America (Sep 19) | Editorially curated passages about each event |
| **Indian festivals** | Makar Sankranti, Diwali, Janmashtami, Navaratri, Durga Puja | Passages on light/darkness, divine love, Krishna, Divine Mother |
| **Christian (Western)** | Christmas (Dec 25), Easter (Western date) | Yogananda wrote extensively about Christ — rich corpus |
| **Christian (Orthodox)** | Christmas (Jan 7), Easter (Orthodox date) | Same corpus, different calendar dates |
| **Buddhist** | Vesak, Dharma Day | Passages on meditation, consciousness, non-attachment |
| **Interfaith / contemplative** | Jewish High Holy Days (if Yogananda references), Sufi observances | Passages where Yogananda engages with other traditions |
| **Universal observances** | International Day of Peace, World Meditation Day | Passages on peace, meditation |

**Taxonomy note:** The previous four-category scheme (`yogananda_life`, `hindu`, `christian`, `universal`) was reductive — "Hindu" collapsed dozens of distinct traditions (Shaivism, Vaishnavism, Shakta) and excluded observances from traditions the worldview pathways (FTR-056) explicitly address. The expanded taxonomy uses `indian_festival` (acknowledging the cultural rather than sectarian framing), distinguishes Western and Orthodox Christian dates, and adds `buddhist` and `interfaith` categories. Whether to include Buddhist, Jewish, or Islamic observances is an editorial scope question for SRF — see CONTEXT.md § Open Questions (Stakeholder).

### Schema

```sql
-- ============================================================
-- CALENDAR EVENTS (date-to-passage associations — Milestone 3b+)
-- ============================================================
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  name TEXT NOT NULL,               -- "Mahasamadhi Anniversary"
  description TEXT,                 -- brief context
  month INTEGER NOT NULL,           -- 1–12
  day INTEGER NOT NULL,             -- 1–31
  category TEXT NOT NULL,           -- 'yogananda_life', 'indian_festival', 'christian_western', 'christian_orthodox', 'buddhist', 'interfaith', 'universal'
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now
);

CREATE TABLE calendar_event_passages (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  event_id UUID NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,
  chunk_id UUID NOT NULL REFERENCES book_chunks(id) ON DELETE CASCADE,
  position INTEGER,                 -- optional ordering
  UNIQUE (event_id, chunk_id)
);
```

### Integration

When today matches a calendar event, the homepage "Today's Wisdom" draws from the calendar pool instead of (or in addition to) the general daily pool. The calendar event name appears as a subtle subtitle below the passage: *"On this day in 1920, Yogananda arrived in Boston."*

This aligns with "Signpost, not destination" — the portal meets seekers where they already are (their calendar, their holidays) and connects them to Yogananda's perspective on those moments.
