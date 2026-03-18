---
ftr: 157
title: Living Golden Set
summary: "DELTA-compliant one-bit seeker feedback loop that automatically grows the search evaluation set"
state: proposed
domain: operations
governed-by: [PRI-01, PRI-09]
depends-on: [FTR-037, FTR-032]
---

# FTR-157: Living Golden Set

## Proposal

**Status:** Proposed
**Type:** Enhancement
**Governing Refs:** FTR-037 (Search Quality Evaluation), FTR-082 (Observability/DELTA), FTR-085 (Privacy), FTR-032 (Search Analytics)
**Target:** Milestone 2b (requires deployed search with real seekers)
**Dependencies:** Golden retrieval set operational (Milestone 1a). Search deployed (Milestone 1c). Real seekers using the portal.

**The gap.** FTR-037 specifies ~58 English and ~15 Spanish test queries crafted by Claude. This captures what Claude *predicts* seekers will ask. It cannot capture what seekers *actually* ask and fail to find. The golden set is a snapshot — it improves only when a developer manually adds queries. The search quality loop is open.

**Close the loop: one bit of seeker feedback, DELTA-compliant.**

After search results, a single quiet line: *"Did this help you find what you were looking for?"* Two responses: a subtle checkmark (yes) and a subtle X mark (no). Nothing else. No text field, no rating, no user identification, no session association.

What gets recorded:
```sql
-- DELTA-compliant search feedback (no user identification)
INSERT INTO search_feedback (query_text, language, helpful, created_at)
VALUES ('how do I find inner peace', 'en', false, now());
```

No user ID. No session ID. No IP. No behavioral profile. The query is already anonymized in `search_queries` (FTR-032); this adds one bit: helpful or not.

**How it feeds the golden set:**

Queries with repeated "not helpful" signals (e.g., 3+ negative signals on the same query text within 30 days) are automatically added to the golden set as regression candidates. A weekly batch job:
1. Extracts queries with ≥ 3 negative signals
2. De-duplicates against existing golden set entries
3. Generates candidate entries (query + expected relevant passages, determined by Claude reviewing the corpus)
4. Queues for human review before golden set inclusion

Over time, the golden set converges on what seekers *actually need*, not what Claude *predicted* they'd need. The search quality metric's denominator becomes grounded in reality.

**DELTA compliance analysis:**
- **Dignity:** No user identification. The feedback is about the query, not the person.
- **Embodiment:** Minimal interaction — two buttons, one click, optional. The portal doesn't demand evaluation.
- **Love:** The signal is used solely to improve search for future seekers. Not sold, not profiled, not correlated.
- **Transcendence:** The portal learns from aggregate patterns, not individual behavior.
- **Agency:** Feedback is optional. No prompt, no reminder, no "you haven't rated" nudge. Present once, quietly.

**Design constraint (Calm Technology):** The feedback line appears below all search results, not between them. It is text, not a modal. It does not animate, pulse, or demand attention. It is present, and it waits.

**Estimated value:** If 1% of searches receive feedback and 10% of negative-signal queries reveal genuine search gaps, the golden set could grow from ~73 queries to ~200+ queries within the first year — each one grounded in a real seeker's failed search.

**Re-evaluate At:** Milestone 1c (when search quality metrics from 1a/1b are available — if the golden set already covers 95% of real query patterns, this is unnecessary)
**Decision Required From:** Architecture + DELTA review (privacy analysis)

## Notes

**Provenance:** FTR-157 → FTR-157
