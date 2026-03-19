---
ftr: 31
title: "Passage Resonance Signals — Content Intelligence Without Surveillance"
summary: "Anonymous monotonic counters for shares, dwells, traversals, and skips as editorial content intelligence"
state: implemented
domain: search
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
- **Editorial use:** Full counters accessible in the editorial review portal for curation intelligence.
- **Seeker-facing resonance (proposed):** Aggregated, highly anonymized resonance indicators may be displayed to seekers as faint visual signals — e.g., "1,200 seekers lingered here this week." This requires zero personal data collection (no IP addresses, no session IDs) and provides the comforting knowledge that one is participating in a living tradition. The display is a weekly-bucketed aggregate, batched and transmitted asynchronously to respect performance budgets. This creates an invisible global *satsang* — the awareness that others are reading the same passage validates spiritual intuition and mitigates the isolation of digital reading (deep-research-gemini-sacred-reading.md § 8). **Decision required:** whether seeker-facing display aligns with PRI-09 (DELTA) and SRF editorial preferences. If approved, counters are bucketed to weekly granularity and rounded to nearest 100 before display. If declined, counters remain editorial-only.
- Rate-limited: one increment per signal type per client IP per hour.

### Scheduling

- Instrumentation: Milestone 2a
- Editorial dashboard: Milestone 3b

### Consequences

- Four new integer columns on existing tables (no new tables)
- Rate-limiting logic added to share, dwell, and relation API handlers
- Editorial review portal gains a "Resonance" view

### Discovery Research Integration (March 2026)

Research on anonymous collective signals (deep-research-gemini-discovery-without-surveillance.md) identifies three refinements:

**Temporal decay.** Without decay, resonance counters create a rich-get-richer feedback loop — passages popular early accumulate visibility permanently. Apply a temporal decay factor: `effective_score = raw_count * decay_factor^(days_since_last_increment)`. This allows undiscovered passages to surface naturally as older passages' scores decay. The decay rate is a parameter per FTR-012.

**Signal weighting: resonance over popularity.** Weight dwell_count and traversal_count heavily; weight share_count lower. High dwell + subsequent traversal indicates contemplative engagement. High share count may indicate viral spread (popularity) without depth. The composite resonance score should optimize for contemplative depth, not viral reach.

**No resonance counters in Quiet Corner.** The Quiet Corner must remain a space of "Reflective Ambiguity" (Reflective Agency Framework, AAAI 2026). Displaying collective attention signals ("5,000 seekers lingered here") introduces social proof and subtle external awareness into an inherently private, contemplative space. Resonance signals are collected from Quiet Corner interactions but never displayed within it. This constraint applies regardless of the seeker-facing resonance display decision above — the Quiet Corner is exempt.

## Notes

- **Origin:** FTR-031
