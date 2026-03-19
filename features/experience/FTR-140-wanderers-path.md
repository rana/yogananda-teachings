---
ftr: 140
title: "The Wanderer's Path — Depth-Weighted Passage Discovery"
summary: "Serendipitous depth-weighted passage offering with localStorage non-repetition memory"
state: proposed
domain: experience
governed-by: [PRI-08, PRI-09]
depends-on: [FTR-039]
---

# FTR-140: The Wanderer's Path

## Rationale

**Type:** Feature
**Governing Refs:** FTR-039 (Recognition-First IA), FTR-002 (DELTA)
**Target:** Milestone 2b (requires passage depth signatures from enrichment pipeline)
**Dependencies:** Passage depth signatures (Opus-generated classification of each passage as bottomless/informational/catalytic/consoling). localStorage for seen-passage non-repetition.
**Scheduling Notes:** "Take me somewhere." A single quiet offering. The portal selects a passage using depth signatures — weighted toward bottomless passages, avoiding repetition — and presents it with full context. No parameters, no category, no state required.

This is a practice many devotees already have: opening a beloved book to a random page. The portal embodies it digitally. Selection feels serendipitous; it is actually weighted by depth signatures and bridge wisdom.

**The Personal Corpus:** Browser-local memory of which passages have been seen (list of chunk IDs in localStorage). The Wanderer's Path never returns to the same place twice. Today's Wisdom can optionally use the same mechanism — your Today's Wisdom, which has never shown you this passage before. The corpus has thousands of passages; a devotee could use this daily for years without repeating. DELTA-compliant: nothing stored on a server, no account, no tracking.

**Relationship to Today's Wisdom:** Today's Wisdom is the communal version (same passage for everyone on a given day). The Wanderer's Path is the personal version (each invocation goes somewhere new). They are related but distinct.

**Origin:** External design review (Claude Web conversation, 2026-03-01)


### Discovery Research Integration (March 2026)

Research from content-only recommendation and anonymous collective signals (deep-research-gemini-discovery-without-surveillance.md) identifies two patterns for the Wanderer's Path:

**Circadian Context Routing.** Weight passage selection by time of day using the seeker's local time (client-side, no server tracking). Surface introspective, consoling passages in the evening; catalytic, purpose-driven passages in the morning. This creates a recommendation that shifts organically with the seeker's environment — feeling highly contextualized without tracking identity. Combined with the existing depth-weighting and localStorage non-repetition, this produces a serendipity engine that feels personally curated. Circadian weighting uses the same time bands as FTR-146 (Circadian Modifier): dawn, day, dusk, night.

**Productive Friction.** The Reflective Agency Framework (AAAI 2026) demonstrates that deliberate effort in discovery increases the perceived value of the finding and roots the experience in the seeker's own agency. Before generating a passage, require a moment of intention — a press-and-hold gesture (3 seconds), a breath-paced reveal, or a deliberate "I'm ready" action. This is not UX friction — it is contemplative preparation. The effort of seeking correlates with the reception of the teaching. This aligns with PRI-08 (Calm Technology): the portal waits; it does not auto-deliver. The seeker makes a deliberate act of seeking.

## Notes

Migrated from FTR-140 per FTR-084.
