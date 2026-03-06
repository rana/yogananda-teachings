---
ftr: 127
title: "Passage Depth Signatures — Opus-Classified Contemplative Quality"
state: proposed
domain: search
arc: 1c+
governed-by: [FTR-105, FTR-026, FTR-028]
---

# FTR-127: Passage Depth Signatures

## Rationale

**Target:** Milestone 1c (as part of enrichment pipeline — M1c-13)
**Dependencies:** Opus batch enrichment pipeline. Full corpus extracted.

Not all passages are the same kind of thing. Some are luminous and bottomless — they reward the hundredth reading. Some are informational — they answer a question. Some are catalytic — they shift something when you're ready. Some are consoling — they meet suffering.

**Depth signature categories:**
- **Bottomless** — rewards endless return. Belongs in Today's Wisdom, Wanderer's Path.
- **Informational** — provides knowledge, answers a question. Belongs in search results, browse.
- **Catalytic** — shifts something in the reader when ready. Belongs in bridge seed passages for practice-oriented seekers.
- **Consoling** — meets suffering. Belongs in bridge seed passages for "I am struggling" entry.

**How Opus generates them:** Each passage is classified during the enrichment pipeline (FTR-026). Opus reads the passage in full chapter context and assigns one or more depth categories with confidence scores. This classification is written to the chunk's enrichment metadata.

**What depth signatures influence:**
- Today's Wisdom selection (bottomless passages preferred)
- Wanderer's Path weighting (FTR-140)
- Bridge seed passage curation — consoling passages for distress states, catalytic for practice states
- Related Teachings ordering — mix of depths, not all luminous

**Origin:** External design review (docs/reference/Claude-Teachings-Portal-Suggestions.md, 2026-03-01)

## Notes

- **Origin:** FTR-127
