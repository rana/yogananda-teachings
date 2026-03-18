---
ftr: 152
title: Human Review Gate
summary: "Inventory of nine governance gates SRF can activate for AI-proposed content before production"
state: proposed
domain: operations
governed-by: [PRI-01, PRI-12]
depends-on: [FTR-005, FTR-121, FTR-060]
---

# FTR-152: Human Review Gate

## Proposal

**Status:** Proposed
**Type:** Policy
**Governing Refs:** FTR-005 (Claude Permitted Uses), FTR-121 (Theme Tags), FTR-135 (Translation Honesty), FTR-154 (Social Media), FTR-060 (Editorial Portal)
**Dependencies:** None architectural — infrastructure already exists (`tagged_by` three-state model, `is_published` boolean).
**Scheduling Notes:** The portal architecture provides human review gates at every content workflow touchpoint. These are governance tools SRF can activate for production — not mandatory constraints. For the internal demo, the portal operates with autonomous AI release. This proposal captures the full inventory for SRF's consideration.

**Review gate inventory (Milestone 2a+ unless noted):**

1. **Theme tags** — `tagged_by` model (`auto`/`manual`/`reviewed`). Gate: filter to `manual`/`reviewed` only. Without gate: serve `auto` tags. (FTR-121)
2. **UI translations** — Claude drafts, human reviews. Gate: require fluent SRF-aware reviewer sign-off. Without gate: ship Claude drafts directly. (FTR-135)
3. **Social media** — Quote images and captions generated. Gate: human reviews and posts. Without gate: auto-post with editorial templates. (FTR-154)
4. **Daily passage selection** — Enrichment pipeline selects. Gate: human curator approves each day's passage. Without gate: algorithmic selection serves directly. (Milestone 2b)
5. **Audio transcription** — Speech-to-text generates. Gate: human verifies transcript. Without gate: serve with confidence scores. (Future milestones)
6. **Practice Bridge tags** — Claude classifies technique-adjacent passages. Gate: human reviews tags before routing. Without gate: serve auto-classified routes. (FTR-055)
7. **Calendar content** — Events and observances. Gate: human verifies dates and descriptions. Without gate: serve from editorial CMS directly. (Milestone 4a+)
8. **Ingestion QA** — Claude flags OCR errors. Gate: human makes every correction decision. Without gate: auto-correct high-confidence errors, flag low-confidence for batch review. (FTR-005 E4)
9. **`is_published` boolean** — Schema-level gate. Gate: content defaults to unpublished, requires explicit approval. Without gate: change default to `true`, content goes live on ingestion. (Schema)

**Recommendation:** The `tagged_by` model and `is_published` boolean are useful infrastructure regardless of governance decision — they enable filtering, auditing, and rollback even without mandatory gates. SRF should review this inventory and decide which gates to activate for production based on their risk tolerance and editorial capacity.

**Re-evaluate At:** Pre-production (before public launch)
**Decision Required From:** SRF leadership (editorial governance policy)
**Origin:** Principle analysis — reframing human review from mandatory constraint to available governance (2026-02-28)

## Notes

**Provenance:** FTR-152 → FTR-152
