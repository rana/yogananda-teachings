# FTR-035: Knowledge Graph Cross-Media Evolution -- All Content Types as Graph Nodes

**State:** Approved (Provisional)
**Domain:** search
**Arc:** 4+
**Governed by:** PRI-03, PRI-10

## Rationale

### Context

FTR-124 designed the Knowledge Graph at `/explore` when the portal had only book content. Since then, multiple content types were added: magazine articles (Arc 4), video transcripts (Arc 6), audio recordings (Arc 6), images/photographs (Arc 6), ontology concepts (Arc 4+), sacred places (Arc 6), community collections (Milestone 7b).

The Unified Content Hub solves the data layer -- `content_items` + `content_relations` unify all media. But the visualization layer was never updated to consume this unified fabric.

### Decision

**1. The Knowledge Graph evolves through phases, matching the content it visualizes.**

FTR-124's Milestone 3d delivery becomes the graph's *first version*, not its final form.

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
| **Book map** | Yes (Milestone 3d) | Books, passages, themes, people, references |
| **Concept map** | Arc 4+ | Ontology concepts, relations, linked passages |
| **All media** | Arc 6+ | Everything -- full cross-media fabric |
| **Single book** | Any milestone | One book's passages, themes, connections |
| **Single theme** | Any milestone | One theme's passages across all media |

**4. Editorial threads and community collections appear as highlighted paths.**

**5. The graph is the portal's universal navigation layer.** Every node is clickable.

### Phased Node/Edge Evolution

| Milestone | New Node Types | Approximate Scale |
|-----------|---------------|-------------------|
| **Arc 4** | book, passage, theme, person, reference | ~5,000-10,000 nodes |
| **Milestone 5a** | magazine_issue, magazine_chunk, ontology_concept | ~12,000-18,000 nodes |
| **Milestone 7a** | video, video_chunk, place | ~20,000-35,000 nodes |
| **Milestone 7b** | audio_recording, audio_segment, image | ~30,000-50,000 nodes |

### Governance: Content-Type Integration Checklist

Every future ADR that introduces a new content type must address:
1. **Graph node type:** What shape, color, size, and click target?
2. **Graph edge types:** What relationships with existing nodes?
3. **Graph JSON schema:** What `node_type` and `edge_type` values are added?
4. **Lambda update:** What data source does the nightly regeneration query?
5. **Milestone timing:** When does this content type enter the graph?

### Consequences

- FTR-124 remains valid as the Milestone 3d baseline; this extends it through Milestone 7b
- Nightly graph Lambda regeneration script updated with each content milestone
- Graph JSON schema is versioned
- The Knowledge Graph becomes a flagship portal feature

## Notes

- **Origin:** FTR-035
