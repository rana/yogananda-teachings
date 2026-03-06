---
ftr: 31
title: "Passage Resonance Signals -- Content Intelligence Without Surveillance"
state: approved
domain: search
arc: 2a+
governed-by: [PRI-08, PRI-09]
---

# FTR-031: Passage Resonance Signals

## Rationale

### Context

The portal tracks search queries (anonymized) and search themes (aggregated) per FTR-032. But it has no signal for which *passages* resonate with seekers. Which quotes are shared most? Which cross-book connections are traversed most? This is content intelligence -- understanding which teachings serve seekers best -- not user tracking.

### Decision

Collect anonymous, aggregated, passage-level resonance signals for editorial use. Strictly content-level, never user-level.

**Signals collected:**

| Signal | Source | Storage |
|--------|--------|---------|
| Share count | Increment when share link/image/PDF generated | `book_chunks.share_count` (integer) |
| Dwell count | Increment when dwell mode activated | `book_chunks.dwell_count` (integer) |
| Relation traversal | Increment when a chunk_relation link is followed | `chunk_relations.traversal_count` (integer) |
| "Show me another" skip | Increment when Today's Wisdom "Show me another" is clicked | `daily_passages.skip_count` (integer) |

**Constraints:**
- Counters are simple integers. No timestamps, no session correlation, no user identification.
- Counters are increment-only (no decrement, no reset). Monotonic.
- Not exposed to seekers. Never displayed publicly.
- Accessible only in the editorial review portal for curation intelligence.
- Rate-limited: one increment per signal type per client IP per hour.

### Scheduling

- Instrumentation: Milestone 2a
- Editorial dashboard: Milestone 3b

### Consequences

- Four new integer columns on existing tables (no new tables)
- Rate-limiting logic added to share, dwell, and relation API handlers
- Editorial review portal gains a "Resonance" view

## Notes

- **Origin:** FTR-031
