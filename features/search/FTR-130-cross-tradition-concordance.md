---
ftr: 130
title: Cross-Tradition Concordance as Primary Search Lens
state: proposed
domain: search
arc: 3c+
governed-by: [FTR-028, FTR-039, FTR-030]
---

# FTR-130: Cross-Tradition Concordance as Primary Search Lens

## Rationale

**Dependencies:** Theme taxonomy, Vocabulary Bridge cross-tradition synonym pairs, Scripture-in-Dialogue (M3c-5)

Yogananda's core vision: demonstrating the underlying unity of Christ's and Krishna's teachings. This is not a secondary feature — it is central to his literary output. *The Second Coming of Christ* and *God Talks With Arjuna* are full-length treatments of this concordance. The *Autobiography* weaves Bible<->Gita parallels throughout.

**Search lenses this enables:**
- "How did Christ and Krishna agree on...?" — surfaces passages where Yogananda himself draws the parallel
- "I don't understand Christianity/Hinduism/spirituality..." — routes to Yogananda's explanation of that tradition
- Cross-tradition vocabulary: salvation/moksha, Holy Ghost/AUM, baptism/initiation, Christ Consciousness/Kutastha Chaitanya

**Architectural touchpoints:** FTR-028 (Vocabulary Bridge) handles cross-tradition synonym pairs. FTR-039 (Recognition-First IA) includes "tradition entry" as a homepage lens. Scripture-in-Dialogue (M3c-5) handles structured verse-level Gita<->Gospel linking. Theme taxonomy should elevate "Christ-Krishna concordance" as a first-class theme.

**Constraint (PRI-01):** The portal surfaces Yogananda's own concordances — it never synthesizes new ones. Every result traces back to a specific passage where he draws the parallel.

**Re-evaluate At:** M1a-8 (search quality evaluation — test cross-tradition queries), Milestone 3c planning
**Decision Required From:** Architecture + search quality evaluation

## Notes

- **Origin:** FTR-130
