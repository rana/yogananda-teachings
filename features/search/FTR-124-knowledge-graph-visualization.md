---
ftr: 124
title: Knowledge Graph Visualization
summary: "Interactive force-directed graph at /explore rendering books, passages, themes, and people as navigable nodes"
state: approved-provisional
domain: search
governed-by: [PRI-03, PRI-08]
depends-on: [FTR-034, FTR-030, FTR-121]
---

# FTR-124: Knowledge Graph Visualization

## Rationale

**Context:** FTR-030 (chunk relations), FTR-121 (theme taxonomy), FTR-064 (reverse bibliography), FTR-122 (exploration categories), FTR-074 (Spiritual Figures)

### Context

The portal's schema contains a complete semantic map of Yogananda's teachings: chunk relations (similarity), theme tags (quality, situation, person, principle, scripture, practice, yoga_path), reverse bibliography (external references), editorial cross-references, Spiritual Figures entities, and cross-language alignment. No such map exists for any major spiritual figure. This semantic structure is navigable through linear interfaces (search, theme pages, reader side panel) but has never been visualized as a whole.

### Decision

Build an interactive knowledge graph visualization at `/explore` that renders the portal's semantic structure as a navigable, visual map.

**Nodes:**
- Books (large, colored by book)
- Passages / chunks (small, clustered around their book)
- Themes (medium, connecting clusters)
- People (medium, from Spiritual Figures)
- Scriptures and external references

**Edges:**
- Chunk relations (similarity, with thickness proportional to similarity score)
- Theme memberships (chunk -> theme)
- External references (chunk -> scripture/person)
- Cross-book connections (strongest relations between books)

**Interaction:**
- Enter from any node: click a theme, person, or book to center and expand
- Zoom: mouse wheel / pinch. Pan: drag.
- Click a passage node to see its text, citation, and "Read in context ->" link
- Filter by: book, theme category, relation type
- Two views: full graph (all books, all themes) and focused view (single book's connections)

**Technology:** Client-side graph rendering via `d3-force` or `@react-three/fiber` (3D option for immersive exploration). Pre-computed graph data served as static JSON from S3 (regenerated nightly). No real-time graph queries — the visualization is a pre-baked artifact.

**Design:** Warm tones, `--portal-bg` background, `--srf-gold` edges, `--srf-navy` nodes. Not a clinical network diagram — a contemplative map of interconnected wisdom. Generous whitespace at the edges. Slow, deliberate animation (nodes drift gently, not bounce). `prefers-reduced-motion`: static layout, no animation.

### Scheduling

STG-009 (after chunk relations are computed across the full multi-book corpus in Stages 3c–3d). The graph needs multi-book density to be meaningful.

### Consequences

- New page at `/explore` (linked from Books and themes pages, not primary nav)
- Pre-computed graph JSON generated nightly by Lambda (extension of chunk relation computation)
- Client-side rendering adds ~50-80KB JS (loaded only on `/explore` — not in the global bundle)
- Graph data is a static artifact — no database queries during exploration
- **Extends FTR-030** (chunk relations) from a search/reader feature to a visual discovery tool

