---
ftr: 39
title: Recognition-First Information Architecture
summary: "Portal offers before it asks via multi-lens homepage with Today's Wisdom, Four Doors, and Wanderer's Path"
state: approved-provisional
domain: search
governed-by: [PRI-03, PRI-08]
---

# FTR-039: Recognition-First Information Architecture

## Rationale

### Context

The current portal design leads with a search box: "What are you seeking?" This assumes the seeker arrives with language -- a query they can articulate. But the seeker who most needs this portal is least able to articulate their need. A person at 2 AM who can't sleep because of anxiety doesn't know to search for "overcoming fear" or "restlessness of mind."

The portal's homepage is the first moment of contact. Whether it asks or offers in that moment is a fundamental architectural decision -- not a UI choice.

### Decision

Adopt a **recognition-first** information architecture: the portal offers something before it asks anything. The homepage leads with Today's Wisdom (the portal speaks first), followed by multiple entry lenses that serve different personas without hierarchy.

**The principle:** Recognition before query. The portal offers before it asks.

**The implementation (STG-004):** A multi-lens homepage with five concurrent entry modes:

1. **Today's Wisdom** (hero position) -- The portal's gift before any interaction.
2. **"What did Yogananda say about...?"** -- The primary search invitation, reframed to set correct expectations.
3. **The Wanderer's Path** -- "Take me somewhere." Random passage selection using depth signatures.
4. **Tradition/Question entry** -- "I come from..." or "A question I'm holding."
5. **The Four Doors** -- "I am searching / I am struggling / I want to understand / I want to practice."

**The search box remains** -- always visible, never primary.

### What This Changes from the Current Design

- **FTR-040 (Opening Moment):** Shifts from search-box-primary to Today's Wisdom hero + multi-lens entry.
- **Thematic navigation:** The six curated themes become children of the Four Doors' vocabulary bridge mappings.
- **Homepage structure:** FTR-040 (Frontend Design) gains the multi-lens entry specification.

### STG-003 Embodiment

At 1c, the recognition-first principle manifests minimally:
- Today's Wisdom hero
- Search prompt: "What did Yogananda say about...?"
- "Show me another" for Today's Wisdom rotation
- Minimal secondary nav: `Books | About`
- Practice Bridge: single quiet line linking to SRF Lessons information

### Consequences

- FTR-040 updated to reference this and describe the recognition-first principle
- Deliverable STG-003-5 search prompt changes from "What are you seeking?" to "What did Yogananda say about...?"
- The Vocabulary Bridge (FTR-028) is a prerequisite for meaningful recognition-based entry
- FTR-138, FTR-139, FTR-140 capture the STG-004+ implementation details

**Governs:** FTR-040, FTR-040, FTR-040, FTR-138, FTR-139, FTR-140

## Notes

- **Origin:** FTR-039
