---
ftr: 129
title: "Semantic Cartography — Meaningful Spatial Navigation"
summary: "Opus-assigned semantic coordinates on meaningful axes rendering teachings as a navigable spatial map"
state: proposed
domain: search
governed-by: [PRI-03, PRI-05]
depends-on: [FTR-128, FTR-124]
---

# FTR-129: Semantic Cartography

## Rationale

**Target:** STG-009 (alongside knowledge graph visualization) or earlier if static rendering proves viable
**Dependencies:** FTR-128 (structural enrichment provides semantic understanding for coordinate assignment). Minimal frontend: static SVG at CDN edge works on 2G mobile.

**The gap.** The Passage Constellation (FTR-124, future milestones) uses UMAP/t-SNE to project embeddings into 2D/3D space. This is a mathematical projection — it captures embedding similarity but the axes have no semantic meaning. A seeker navigating the constellation sees clusters but can't reason about *why* passages are near each other without reading them.

Semantic Cartography inverts this: Opus assigns coordinates on axes that carry meaning. The resulting map is a navigable territory seekers can reason about spatially — like a library's floor plan where the organization itself communicates.

**Proposed axes (require validation through prototype):**

| Axis | Low end | High end |
|------|---------|----------|
| Horizontal | Inner practice / contemplative | Outer life / applied |
| Vertical | Personal / experiential | Universal / doctrinal |
| Size | Introductory / accessible | Advanced / presupposes practice |
| Hue | Devotional — Intellectual — Experiential — Narrative |

These axes map to seeker intent: someone seeking personal comfort navigates to a different region than someone seeking philosophical understanding. The map's organization matches how seekers approach the teachings, not how embeddings cluster mathematically.

**How coordinates are assigned:**
- **Chapter-level:** During structural enrichment (FTR-128), Opus assigns semantic coordinates as part of the chapter perspective artifact. One output, no separate pipeline.
- **Passage-level:** Derived from chapter coordinates + chunk enrichment fields (`domain`, `voice_register`, `experiential_depth`, `passage_role`). Computed, not a separate Opus call — leverages existing metadata.

**Design constraint: invisible cartographer.** Same principle as FTR-128. Seekers see a beautiful map of the teachings. They explore territory. The cartographer who positioned everything is invisible — like a library's shelf organization, the arrangement *is* the experience. No "Opus positioned this chapter here because..." attribution.

**Progressive enhancement rendering:**
1. **Baseline (static SVG at CDN edge).** Pre-rendered 2D map of chapters/books. Works on 2G mobile. No JavaScript required. Navigation via standard `<a>` elements linking to chapter pages. Accessible: each point has an `<title>` element with chapter name and position description for screen readers.
2. **Enhanced (client-side JS).** Zoom, pan, hover details with passage previews, smooth transitions between book-level and chapter-level views. Loads on capable devices.
3. **Full (future milestones).** Interactive exploration with passage-level drill-down when knowledge graph visualization infrastructure exists. Integrates with the Passage Constellation — semantic cartography provides the meaningful axes, embedding projection provides the passage-level detail.

**Minimum viable version:** A single 2D scatter of 49 chapters from Autobiography of a Yogi, positioned by Opus on the practice/life and personal/universal axes, rendered as static SVG. Chapter names as labels. Tap/click navigates to the chapter reading page. Testable, shippable, mobile-friendly, accessible. Can be generated from the FTR-128 prototype output.

**Relationship to FTR-124 (Knowledge Graph Visualization):** The Passage Constellation uses mathematical projection (UMAP/t-SNE) — valuable for showing embedding clusters but semantically opaque. Semantic Cartography uses curated coordinates — semantically transparent but coarser. They complement: cartography provides the meaningful overview map; constellation provides the detail view. Both could coexist at `/explore` as different zoom levels.

**Re-evaluate At:** After FTR-128 prototype (semantic coordinates are a natural byproduct of chapter perspective generation)
**Decision Required From:** Architecture + UX review (axis selection, visual design, progressive enhancement thresholds)
**Origin:** Graph navigation exploration — spatial representation of Opus structural understanding (2026-02-28)

## Notes

- **Origin:** FTR-129
