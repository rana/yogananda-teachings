---
ftr: 35
title: "Knowledge Graph Cross-Media Evolution — All Content Types as Graph Nodes"
summary: "Extensible graph schema evolving to include magazine articles, video, audio, and sacred places as nodes"
state: approved-provisional
domain: search
governed-by: [PRI-03, PRI-10]
depends-on: [FTR-034, FTR-124]
---

# FTR-035: Knowledge Graph Cross-Media Evolution

## Rationale

### Context

FTR-124 designed the Knowledge Graph at `/explore` when the portal had only book content. Since then, multiple content types were added: magazine articles (STG-020+), video transcripts (future stages), audio recordings (future stages), images/photographs (future stages), ontology concepts (STG-020+), sacred places (future stages), community collections (STG-024).

The Unified Content Hub solves the data layer -- `content_items` + `content_relations` unify all media. But the visualization layer was never updated to consume this unified fabric.

### Decision

**1. The Knowledge Graph evolves through phases, matching the content it visualizes.**

FTR-124's STG-009 delivery becomes the graph's *first version*, not its final form.

**2. The pre-computed graph JSON uses an extensible schema from day one.**

```jsonc
{
 "generated_at": "2027-03-15T02:00:00Z",
 "schema_version": 2,
 "node_types": ["book", "passage", "theme", "person", "reference", "place"],
 "edge_types": ["similarity", "contains", "theme_tag", "references", "mentions_person"],
 "nodes": [...],
 "edges": [...]
}
```

**3. The graph supports filtering and focus modes.**

| Mode | Default? | What's visible |
|------|----------|----------------|
| **Book map** | Yes (STG-009) | Books, passages, themes, people, references |
| **Concept map** | STG-020+ | Ontology concepts, relations, linked passages |
| **All media** | Future stages | Everything -- full cross-media fabric |
| **Single book** | Any stage | One book's passages, themes, connections |
| **Single theme** | Any stage | One theme's passages across all media |

**4. Editorial threads and community collections appear as highlighted paths.**

**5. The graph is the portal's universal navigation layer.** Every node is clickable.

### Phased Node/Edge Evolution

| Stage | New Node Types | Approximate Scale |
|-----------|---------------|-------------------|
| **STG-020** | book, passage, theme, person, reference | ~5,000-10,000 nodes |
| **STG-020** | magazine_issue, magazine_chunk, ontology_concept | ~12,000-18,000 nodes |
| **STG-023** | video, video_chunk, place | ~20,000-35,000 nodes |
| **STG-024** | audio_recording, audio_segment, image | ~30,000-50,000 nodes |

### Governance: Content-Type Integration Checklist

Every future ADR that introduces a new content type must address:
1. **Graph node type:** What shape, color, size, and click target?
2. **Graph edge types:** What relationships with existing nodes?
3. **Graph JSON schema:** What `node_type` and `edge_type` values are added?
4. **Lambda update:** What data source does the nightly regeneration query?
5. **Stage timing:** When does this content type enter the graph?

### Consequences

- FTR-124 remains valid as the STG-009 baseline; this extends it through STG-024
- Nightly graph Lambda regeneration script updated with each content stage
- Graph JSON schema is versioned
- The Knowledge Graph becomes a flagship portal feature

