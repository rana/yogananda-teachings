---
ftr: 140
title: "The Wanderer's Path — Depth-Weighted Passage Discovery"
state: proposed
domain: experience
arc: "2"
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

**Origin:** External design review (docs/reference/Claude-Teachings-Portal-Suggestions.md, 2026-03-01)


## Notes

Migrated from FTR-140 per FTR-084.
