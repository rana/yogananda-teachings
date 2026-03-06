---
ftr: 44
title: Responsive Design
state: approved
domain: experience
arc: "2"
---

# FTR-044: Responsive Design

## Rationale


The portal's breakpoints (FTR-040) define four viewport tiers. This section consolidates the responsive behavior of every major component into a single reference, ensuring consistent layout decisions across the codebase. It also addresses interaction modality, orientation, and print — dimensions that viewport width alone does not capture.

### Breakpoint Behavior Matrix

| Component | Mobile (≤639px) | Tablet (640–1023px) | Desktop (≥1024px) | Wide (≥1280px) |
|-----------|----------------|--------------------|--------------------|----------------|
| **Navigation** | Hamburger menu | Hamburger menu (≤768px) or condensed horizontal nav (>768px) | Full horizontal nav | Full horizontal nav |
| **Search results** | Full-width stacked cards | Full-width stacked cards, wider citation line | Two-column card grid or single-column with side metadata | Two-column with side metadata |
| **Book reader** | Single column, full-width text | Single column with wider margins; landscape: consider two-column (see Orientation below) | Single column with generous margins, Related Teachings side panel visible | Reader centered at `--bp-max-content`, side panel always visible |
| **Quiet Corner** | Centered vertical layout, affirmation fills viewport | Centered with more breathing room; timer controls inline | Horizontal layout option: affirmation left, timer right | Same as desktop, max-width constrained |
| **Today's Wisdom** | Stacked: passage card, then theme chips below | Passage card with theme chips inline | Passage card with theme chips and "Show me another" inline | Same as desktop |
| **Theme pages** | Single-column passage list | Two-column passage card grid | Two-column grid with theme description sidebar | Three-column grid at `--bp-wide` |
| **Knowledge Graph** | 2-hop subgraph, max ~500 nodes, touch-optimized (FTR-035) | Full graph with cluster-first loading | Full graph, hover tooltips | Full graph at native resolution |
| **Presentation mode** | Text 24px+, full viewport, swipe navigation | Text 28px+, full viewport | Text 32px+, arrow-key navigation | Text 36px+, centered reading column |

### Interaction Modality Detection

Viewport width is an unreliable proxy for interaction capability. A tablet with a keyboard case behaves like a desktop; a touchscreen laptop behaves like a tablet. The portal uses CSS media features for interaction-dependent behavior:

```css
/* Hover-dependent interactions (dwell icon reveal, tooltip previews) */
@media (hover: hover) and (pointer: fine) {
  /* Desktop-class: show hover affordances */
}

/* Touch-primary interactions (long-press dwell, native share) */
@media (hover: none) and (pointer: coarse) {
  /* Touch-class: show touch affordances, enlarge tap targets */
}

/* Hybrid devices (touchscreen laptops) — favor touch affordances */
@media (hover: hover) and (pointer: coarse) {
  /* Show both hover and touch affordances */
}
```

**Component implications:**
- **Dwell mode:** Hover-icon trigger for `(hover: hover) and (pointer: fine)`. Long-press for `(pointer: coarse)`. Both available on hybrid devices. (Extends FTR-040)
- **Share menu:** `navigator.share` (native sheet) for `(pointer: coarse)`. Custom share menu for `(pointer: fine)`. (Extends FTR-048)
- **Glossary terms:** Hover tooltip for `(hover: hover)`. Tap-to-reveal for `(hover: none)`. (Extends FTR-062)
- **Touch targets:** 44×44px minimum always. 48px minimum on `(pointer: coarse)` for key navigation and form inputs. (FTR-003, FTR-006 §2)

### Orientation Handling

The portal does not lock orientation. Layout adapts:

| Context | Portrait | Landscape |
|---------|----------|-----------|
| **Phone reader** | Single column, full width | Single column with wider margins. Text line length capped at `--bp-max-content` equivalent (prevents excessively long lines). |
| **Tablet reader** | Single column with generous margins | Two-column option: chapter text left, Related Teachings / footnotes right. Opt-in via reader settings (stored in `localStorage`). |
| **Presentation mode** | Vertical: passage centered | Landscape preferred for group reading. Text fills viewport width with proportionally larger font. |
| **Quiet Corner** | Vertical: affirmation above timer | Horizontal: affirmation left, timer right. More spacious for meditation posture with device propped landscape. |
| **Knowledge Graph** | Taller viewport, more vertical spread | Wider viewport, more horizontal spread. Graph physics adapts. |

### Print Stylesheet

Book content is the most likely print target — seekers in the Global South may print chapters at cybercafés, and study groups may print passages for discussion. Print stylesheets load only when `@media print` matches (zero cost during normal browsing, per FTR-006 §1).

```css
@media print {
  /* Typography */
  body { font-family: 'Merriweather', Georgia, serif; font-size: 12pt; line-height: 1.6; color: #000; }

  /* Layout: single column, no chrome */
  nav, footer, .share-menu, .dwell-icon, .search-bar,
  .related-teachings, .theme-chips { display: none; }

  /* Citations: always visible, never truncated */
  .citation { font-size: 10pt; font-style: italic; }

  /* Page headers/footers */
  @page { margin: 2cm; }
  @page :first { margin-top: 3cm; } /* extra top margin for chapter title */

  /* Attribution */
  .print-footer::after {
    content: "From teachings.yogananda.org — Paramahansa Yogananda's published teachings, freely available worldwide.";
    display: block; font-size: 9pt; margin-top: 2em; color: #595959;
  }

  /* URL display for links */
  a[href^="http"]::after { content: " (" attr(href) ")"; font-size: 9pt; }

  /* Page breaks: never inside a passage, always before chapter titles */
  .passage-card { break-inside: avoid; }
  h2 { break-before: page; }
}
```

### Tablet as First-Class Reading Surface

Tablets are arguably the ideal form factor for sustained book reading — larger than a phone, more portable than a laptop, usable in bed, in a garden, or at a study group. The portal treats tablet as a distinct experience tier, not an interpolation between mobile and desktop:

- **Reader margins** are wider than mobile (the text should not feel cramped) but narrower than desktop (no wasted whitespace on a 10" screen). Target: 48px margins at 768px width, scaling to 64px at 1023px.
- **Related Teachings** panel: bottom sheet on portrait tablet (matches mobile pattern). Side panel on landscape tablet (matches desktop pattern). The orientation transition is the natural breakpoint, not the viewport width.
- **Two-column reader in landscape** is an opt-in setting (reader settings popover), not a default. Some seekers prefer single-column regardless of viewport. Stored in `localStorage`.
- **Touch targets** remain 44×44px minimum (not enlarged to 48px like feature-phone pages) — tablet touch precision is closer to desktop than to a 4" phone screen.

### Automatic Low-Bandwidth Suggestion

FTR-006 §1 specifies a text-only mode toggle. FTR-044 extends this with an automatic suggestion:

When `navigator.connection.effectiveType` reports `'2g'` or `'slow-2g'`, the portal displays a one-time suggestion banner (not a modal): *"Your connection appears slow. Switch to text-only mode for a faster experience?"* with Accept / Dismiss. Dismissed preference stored in `sessionStorage` (resets per session, allowing re-suggestion if conditions change). The banner uses the portal's warm cream palette, not an alert style. Never forced — always a suggestion.

### Future Considerations

- **Foldable devices:** Samsung Galaxy Fold, Pixel Fold present a "phone when folded, tablet when open" form factor. The portal's responsive breakpoints handle this naturally (viewport width changes on fold/unfold), but the fold crease bisecting two-column layouts is a concern. Monitor CSS `env(fold-left)` / `env(fold-right)` proposals (CSS Viewport Segments specification). No action needed until foldable market share warrants testing.
- **Smart displays:** Google Nest Hub, Amazon Echo Show — natural surfaces for "Show me today's wisdom." The API-first architecture (FTR-015) and structured data (FTR-034 JSON-LD) enable this without portal-side changes. A smart display integration would be a new API consumer, not a new responsive breakpoint.
- **TV / casting:** Presentation mode (FTR-006 §5) is designed as a "digital lectern." A phone casting to a TV via Chromecast or AirPlay is the most natural home-satsang implementation. The 10-foot UI paradigm (large text, no hover, D-pad navigation) differs from all current breakpoints. If demand emerges, a `data-mode="cast"` CSS mode alongside `data-mode="present"` could serve this with minimal code.

---

### FTR-034, FTR-124, FTR-035: `/explore` — Knowledge Graph and Passage Constellation

Interactive visual map of the entire teaching corpus. Three visualization modes, evolving across milestones. The graph is the portal's universal navigation layer — every node is clickable, navigating to the corresponding page.

**Mode 1: Knowledge Graph** (FTR-124, FTR-035) — Node-edge visualization showing relationships between all content types: passages, themes, people, places, concepts, and every media format. Pre-computed graph JSON, client-side rendering. Evolves from book-only (Milestone 3d) to full cross-media (Arc 6+).

**Mode 2: Passage Constellation** — A 2D spatial exploration where passages are positioned by semantic similarity, derived from embedding vectors reduced to two dimensions (UMAP or t-SNE, pre-computed at build time).

**Mode 3: Concept Map** (FTR-034) — The ontology layer: spiritual concepts and their structural relationships (prerequisite, component, leads_to). Available from Arc 4+.

```
┌──────────────────────────────────────────────────────────────┐
│ │
│ Explore the Teachings │
│ │
│ [Graph] [Constellation] [Concepts] │
│ │
│ Filter: [Books] [Magazine] [Video] [Audio] [Images] │
│ Focus: [All] [Single book ▾] [Theme ▾] [Person ▾] │
│ │
│ 📖──────📖 │
│ / │ \ \ 🎥 │
│ ⬡ ⬡ ⬡ 📖───────│ │
│ / \ / \ │ \ │ │
│ 📖 📖 📖 📖 ◇───🔊 │
│ │ │ │ │ │
│ ◆ 👤──────📍────📷 │
│ │
│ 📖 Book passage ⬡ Theme ◆ Concept │
│ 🎥 Video clip 🔊 Audio 📷 Image │
│ 👤 Person 📍 Place ◇ Reference │
│ │
└──────────────────────────────────────────────────────────────┘
```

#### FTR-035: Knowledge Graph Node Types

| Node Type | Shape | Color | Size | Click Target | Milestone |
|-----------|-------|-------|------|-------------|-----------|
| Book | Rectangle | SRF Navy | Large (fixed) | `/books/[slug]` | 3d |
| Book passage | Circle | SRF Navy (30%) | Small (density-scaled) | `/books/[slug]/[ch]#p[n]` | 3d |
| Theme | Hexagon | SRF Gold | Medium (passage count) | `/themes/[slug]` | 3d |
| Person | Portrait circle | Warm Cream border | Medium (fixed) | `/people/[slug]` | 3d |
| Scripture/reference | Diamond | Earth tone | Medium (fixed) | `/references/[slug]` | 3d |
| Magazine issue | Rectangle | Warm accent | Medium (fixed) | `/magazine/[issue-slug]` | Arc 4 |
| Magazine chunk | Circle | Warm accent (30%) | Small | `/magazine/[issue-slug]/[article-slug]` | Arc 4 |
| Ontology concept | Rounded rectangle | SRF Gold (dark) | Medium (relation count) | `/ontology/[slug]` | Arc 4+ |
| Sacred place | Map pin | Earth green | Medium (fixed) | `/places/[slug]` | Arc 6 |
| Video | Play-button circle | Teal accent | Medium (fixed) | `/videos/[slug]` | Arc 6 |
| Video chunk | Circle | Teal (30%) | Small | `/videos/[slug]?t=[ms]` | Arc 6 |
| Audio recording | Waveform circle | Amber accent | Medium (fixed) | `/audio/[slug]` | Arc 6 |
| Audio segment | Circle | Amber (30%) | Small | `/audio/[slug]?t=[ms]` | Arc 6 |
| Image | Rounded square | Neutral | Small (thumbnail) | `/images/[slug]` | Arc 6 |

Yogananda's own voice recordings and photographs receive the sacred artifact treatment — a subtle golden ring distinguishing them from other audio/images (`is_yogananda_voice`, `is_yogananda_subject` flags).

#### FTR-035: Knowledge Graph Edge Types

| Edge | Source → Target | Width/Opacity | Milestone |
|------|----------------|---------------|-----------|
| Semantic similarity | Any content ↔ any content | Proportional to score | 3d (books), Arc 6 (cross-media) |
| Contains | Book/issue/video/recording → chunk/segment | Thin, fixed | 3d+ |
| Theme membership | Content → theme | Medium, fixed | 3d |
| References scripture | Passage → external reference | Medium, dashed | 3d |
| Mentions person | Passage → person | Medium, fixed | 3d |
| Succeeded by | Person → person | Golden, directional | 3d |
| Preceded by | Person → person | Golden, directional | 3d |
| Mentions place | Content → sacred place | Medium, fixed | Arc 6 |
| Depicted at | Image → sacred place | Medium, fixed | Arc 6 |
| Photographed | Image → person | Medium, fixed | Arc 6 |
| Ontological relation | Concept → concept | Labeled (prerequisite, component, etc.) | Arc 4+ |
| Primary source | Passage → ontology concept | Thin, dashed | Arc 4+ |
| Editorial thread | Content → content (sequence) | Golden, directional | 3d (books), Arc 6 (cross-media) |
| Community collection | Content → content (curated) | Silver, directional | 7b |

#### Graph View Modes and Filtering

| Mode | Default milestone | What's visible |
|------|-------------------|----------------|
| **Book map** | 3d (default) | Books, passages, themes, people, references |
| **Concept map** | Arc 4+ | Ontology concepts, relations, linked passages |
| **All media** | Arc 6+ (new default) | Everything — full cross-media fabric |
| **Single book** | Any | One book's passages, themes, connections |
| **Single theme** | Any | One theme's passages across all media |
| **Single person** | Any | One person's passages, images, videos, places |
| **Lineage** | 3d+ | Person nodes only, connected by guru/succession edges, vertical directed layout (FTR-074) |

Media type toggles: show/hide books, magazine, video, audio, images independently. The filter bar appears at the top of the graph view.

#### Graph Evolution by Milestone

| Milestone | Additions | Approximate Node Count |
|-----------|-----------|----------------------|
| **3d** | Books, passages, themes, people, references. Editorial thread paths. | ~5,000–10,000 |
| **Arc 4** | + Magazine issues/chunks, ontology concepts. Constellation mode. | ~12,000–18,000 |
| **Arc 6** | + Videos/chunks, sacred places. Content hub cross-media edges. + Audio recordings/segments, images. Sacred artifact styling. | ~20,000–50,000 |
| **7b** | + Community collection paths, editorial multi-media threads. | Same nodes, new paths |

#### Performance Strategy

| Scale | Rendering | Layout |
|-------|-----------|--------|
| < 10,000 nodes | d3-force with Canvas | Pre-computed positions in JSON (nightly Lambda, FTR-107) |
| 10,000–50,000 nodes | WebGL (deck.gl or custom) | Level-of-detail: clusters when zoomed out, nodes when zoomed in |
| Mobile / low-bandwidth | Subset graph: 2-hop neighborhood of current node, max ~500 nodes | Progressive loading: clusters first, expand on interaction |

The nightly Lambda pre-computes positions server-side. The client renders — no layout computation at runtime.

#### Pre-Computed Graph JSON Schema

```jsonc
{
 "generated_at": "2027-03-15T02:00:00Z",
 "schema_version": 2,
 "node_types": ["book", "passage", "theme", "person", "reference"],
 "edge_types": ["similarity", "contains", "theme_tag", "references", "mentions_person", "performance_of"],
 "nodes": [
 {
 "id": "uuid",
 "type": "passage",
 "media_type": "book",
 "label": "Chapter 12, ¶3",
 "parent_id": "book-uuid",
 "url": "/books/autobiography/12#p3",
 "x": 0.0, "y": 0.0
 }
 ],
 "edges": [
 { "source": "uuid-a", "target": "uuid-b", "type": "similarity", "weight": 0.87 }
 ],
 "paths": [
 { "id": "thread-uuid", "type": "editorial", "label": "Divine Friendship", "node_ids": ["a", "b", "c"] }
 ]
}
```

New content types extend `node_types` and `edge_types` arrays — the visualization code renders unknown types with sensible defaults. Schema version increments when structural changes occur.

#### Graph Data API

```
GET /api/v1/graph → Graph metadata (node/edge type counts, last generated)
GET /api/v1/graph/subgraph?node={id}&depth=2 → 2-hop neighborhood (for embeddable mini-graphs)
GET /api/v1/graph/cluster?theme={slug} → All nodes in a theme cluster
GET /api/v1/graph.json → Full pre-computed graph (S3-served, CDN-cached)
```

The subgraph endpoint powers embeddable mini-graphs in other pages: the reader's Related Teachings panel can show a small visual graph of the current passage's neighbors.

**Service file:** `/lib/services/graph.ts` — graph queries, subgraph extraction, cluster resolution.

#### Constellation Mode

- Each dot represents a content item. Color-coded by media type (book passages by book palette, video by teal, audio by amber, images by neutral)
- Dense clusters become visually apparent — 40 passages about "divine love" form a neighborhood
- Outlier passages sit in the sparse space between clusters — often the most interesting discoveries
- Hover reveals the first line + citation. Click navigates to the content page.
- Zoom, pan, pinch. Cluster labels appear when zoomed out (dominant theme tag).
- No lines, no arrows. Points of light on warm cream. Spatial layout reveals relationships that lists hide.

**Implementation:** UMAP dimensionality reduction from 1024-dim embeddings (FTR-024) to 2D. Pre-computed nightly. Static JSON (~500KB for ~10,000 items). Canvas or WebGL rendering.

**Milestone:** Arc 4+ (constellation). Milestone 3d delivers Knowledge Graph mode only.

Linked from Books and themes pages (not primary nav).

### FTR-034: `/ontology` — Spiritual Concept Map

A human-readable view of the structured spiritual ontology (FTR-034). Presents Yogananda's conceptual framework as a navigable map: states, practices, principles, and their relationships.

```
┌──────────────────────────────────────────────────────────────┐
│ │
│ Yogananda's Teaching Structure │
│ │
│ A map of how the teachings connect. │
│ │
│ Samadhi │
│ The superconscious state of union with Spirit. │
│ │
│ Requires: meditation → concentration → pranayama │
│ Degrees: savikalpa samadhi · nirvikalpa samadhi │
│ Parallels: satori (Zen) · unio mystica (Christian) │
│ Passages: 47 across 6 books │
│ │
│ "In the initial states of God-contact (savikalpa │
│ samadhi) the devotee's consciousness merges..." │
│ — Autobiography of a Yogi, Chapter 26, p. 312 │
│ │
└──────────────────────────────────────────────────────────────┘
```

**Milestone:** Arc 4+ (alongside ontology data model, FTR-034).

### FTR-143 ext: Personal Taxonomy in Study Workspace

The portal's themes (Peace, Courage, Healing) are universal. But seekers have *personal* names for their states. The Study Workspace (FTR-143) can accommodate this.

**Extension:** Within the Study Workspace, collections can be given seeker-defined names that aren't drawn from the portal's theme vocabulary. "The conversation I keep replaying." "What I need before sleep." "For Mom." The portal provides no vocabulary for these — the seeker's own words become the organizing principle.

- All client-side, all private, all deletable (consistent with FTR-143 localStorage pattern)
- The portal's taxonomy is canonical and editorial; the seeker's taxonomy is intimate and uncurated
- Personal collection names are never sent to the server, never appear in analytics, never inform the portal's theme system
- Milestone 7a server sync preserves personal names if the seeker opts in

This transforms the Study Workspace from a composition tool into a personal spiritual workspace — a private space for organizing the teachings around one's own life, not the portal's categories.

---

## Notes

Migrated from FTR-044 per FTR-084.
