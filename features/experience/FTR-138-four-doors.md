---
ftr: 138
title: "Four Doors — Recognition-Based Emotional Entry"
summary: "Four emotional entry points for seekers arriving with a state rather than a query"
state: proposed
domain: experience
governed-by: [PRI-03, PRI-04, PRI-07]
depends-on: [FTR-028, FTR-039, FTR-040]
---

# FTR-138: Four Doors

## Rationale

**Type:** Feature
**Governing Refs:** FTR-028 (Vocabulary Bridge), FTR-039 (Recognition-First IA)
**Target:** Milestone 2a (requires Vocabulary Bridge Layers 1+3, visual identity system)
**Dependencies:** Vocabulary Bridge (FTR-028) for semantic depth — without the bridge, the doors are cosmetic labels over generic search. FTR-040 (Frontend Design) for visual system.
**Scheduling Notes:** Four recognition-based entry points for seekers arriving with an emotional state rather than a query: "I am searching" (curiosity, wonder), "I am struggling" (fear, grief, loss), "I want to understand" (the student, the scholar), "I want to practice" (ready to move from reading to doing). Not the primary homepage architecture — one lens among several in the multi-lens homepage (FTR-139). Lives in secondary navigation.

**Why four?** Four can be held in working memory. Four covers the actual range without over-specifying. The existing six themes (Peace, Courage, Healing, Joy, Purpose, Love) are beautiful but assume the seeker already maps themselves to tradition vocabulary. "I am struggling" requires no such self-knowledge. The four doors are recognitions; the six themes become their children via the vocabulary bridge.

**Inside each door:** Not immediate retrieval. The vocabulary bridge activates. "I am struggling" opens to a gentle second level of recognition ("You might be feeling... Loss and grief / Fear and anxiety / Loneliness / Doubt and confusion"). These are not filters — they are recognitions. The bridge maps each sub-state to corpus territory with retrieval intent (meet_first, console) and avoid-territory (no discipline passages for someone grieving).

**"I want to practice" — the Practice Bridge door.** The most delicate. Explicitly not about reading. Acknowledges the seeker's readiness to move. Leads to Yogananda's own published words about meditation and the path, followed by the quiet signpost to SRF Lessons and local centers. PRI-04 (Signpost, Not Destination) becomes architecture.

**Origin:** External design review (Claude Web conversation, 2026-03-01)

**Current state (2026-03-04):** A lightweight "seeking paths" implementation exists on the homepage — four italic whispered links ("for when the world is too much", etc.) completing the phrase "These teachings are here..." Format and CSS are solid (italic serif, hover-reveal gold border). Copy needs human voice — three AI iterations approached but didn't land. Deferred: the copy requires the Vocabulary Bridge (FTR-028) to be genuinely recognition-based rather than cosmetic self-help language. Without the bridge, the doors are labels over generic search queries.


### Discovery Research Integration (March 2026)

Research on the "wise librarian" effect and content-only recommendation (deep-research-gemini-discovery-without-surveillance.md) identifies two patterns for the Four Doors:

**Gift Framing, Not Search Results.** When a seeker enters through "I am struggling," do not return a paginated list of passages tagged with "struggle." Return *one* highly relevant, consoling passage selected dynamically via MMR (Maximal Marginal Relevance) from a predefined pool to ensure variety across visits. Frame it with an empathetic editorial note: "You might begin here..." The productive friction of "Show me another" creates intimate, conversational pacing — scrolling a dense list invites comparison and paradox-of-choice fatigue; a singular offering invites reception and contemplation. This aligns with PRI-04 (Signpost, Not Destination): a curated singular offering acts as a signpost pointing toward practice, not a destination that creates dependence on the portal.

**Appeal-Factor Querying.** Power the Four Doors using the enrichment metadata mapped to library science "appeal factors" rather than keyword or topic indexes. "I am struggling" → query by emotional quality (Mood: consoling, comforting) and depth signature (Complexity: accessible, not bottomless). "I want to understand" → query by voice register (Style: philosophical, analytical) and depth (Complexity: deep). This maps the librarian's nuanced interview process to a single-click interaction.

## Notes

Migrated from FTR-138 per FTR-084.
