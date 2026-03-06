---
ftr: 71
title: Epistemic Data Boundary — Three-Phase Pipeline
state: approved
domain: editorial
arc: 1+
governed-by: [PRI-03, PRI-10]
---

# FTR-071: Epistemic Data Boundary

## Rationale

The content pipeline separates into three phases based on the **epistemic nature** of the data — what kind of knowledge each datum represents. This boundary determines where data lives, who can modify it, and how it flows.

### The Principle

**Contentful holds what the content IS.** Editorial fact. Observable, deterministic, human-verifiable.

**Neon holds what we THINK ABOUT the content.** Computational judgment. AI-inferred, model-dependent, algorithmically derived.

This is not a performance optimization or an implementation convenience. It is an epistemological claim: editorial truth and computational inference have different natures and belong in different systems.

### Three Phases

```
Phase 1: CAPTURE (local, one-time)
  Screen captures → extracted pages → assembled chapters
  Produces local JSON. Expensive (Claude Vision). Checkpointed.

Phase 2: EDITORIAL (Contentful — source of truth, FTR-102)
  Assembled chapters → Contentful entries
  What flows: structure, text, formatting, contentType,
              epigraphs, epigraph attributions, photos, captions
  What does NOT flow: rasa, embeddings, chunks, search indices

Phase 3: ENRICHMENT (Neon — derived cache + AI enrichment)
  3a. Sync editorial facts from Contentful → Neon (sync-contentful-to-neon.ts)
  3b. Chunk text by natural boundaries (FTR-023)
  3c. Generate embeddings (Voyage AI, voyage-3-large)
  3d. Classify rasa per chapter (Claude Opus)
  3e. Future: themes, cross-references, related passages,
      knowledge graph, concept clusters
```

Steps 3b–3e are all AI/computational enrichments. They can be re-run independently without touching Contentful. They can be upgraded as models improve. They compose additively — each enrichment layer is independent.

### Data Classification

| Data | Nature | System | Rationale |
|------|--------|--------|-----------|
| Text content | Editorial fact | Contentful | What Yogananda wrote — observable, deterministic |
| contentType (prose/verse/epigraph/caption/dialogue) | Structural fact | Contentful | Visible in the formatting — human-verifiable |
| Epigraph, attribution | Published text | Contentful | Part of the physical book |
| Photos, captions, alt text | Published content | Contentful | Editorial assets |
| Chapter structure, sort order | Structural fact | Contentful | Observable from the book |
| **Rasa** | **AI aesthetic judgment** | **Neon** | Claude Opus classifies the experiential quality. A different model might classify differently. |
| Embeddings | Mathematical representation | Neon | Model-dependent vector encoding |
| Chunk boundaries | Algorithmic segmentation | Neon | FTR-023 algorithm output |
| Search indices | Computational artifact | Neon | BM25/vector indices |
| Slug generation | Algorithmic derivation | Neon | Generated from content text |
| Themes, cross-references | AI-derived relationships | Neon | Future enrichment layers |

### The Rasa Decision

Rasa deserves explicit attention because it sits at a boundary. One could argue rasa is "about the content" and belongs in Contentful. The decision to place it in Neon rests on three observations:

1. **Rasa is model-dependent.** The classification was performed by Claude Opus analyzing chapter text. A different model, a different prompt, or a human curator might classify differently. It is a judgment, not a fact.

2. **Rasa changes with the model.** When classification quality improves (better models, refined prompts), reclassification should update one system (Neon), not two.

3. **The Contentful content type has a rasa field.** It exists but is not populated by the pipeline. If editorial oversight is ever needed (a human curator overriding the AI classification), it can happen through a future editorial tool that writes to Neon. The tool does not need to be Contentful.

### Pipeline Commands

```bash
# Phase 2: Editorial (Contentful)
npx tsx scripts/ingest/import-contentful.ts --book <slug>

# Phase 3a: Sync editorial facts to Neon
npx tsx scripts/ingest/sync-contentful-to-neon.ts --book <slug> --replace --skip-embeddings

# Phase 3d: AI enrichment — rasa classification
npx tsx scripts/book-ingest/src/classify-rasa.ts --book <slug>

# Phase 3c: Embeddings (can run after or before rasa)
# Voyage API via sync script without --skip-embeddings, or backfill separately
```

Phases 3a–3e are independent and composable. The only ordering constraint is that 3a (sync) must run before 3b–3e (enrichments need the base data in Neon).

### Governing Decisions

- **FTR-102** — Contentful as editorial source of truth
- **FTR-023** — Chunking strategy
- **FTR-022** — Book ingestion pipeline (updated to reference this document)
- **PRI-03** — Aucitya (propriety) — each datum in its proper place

### Design System Connection

The epistemic boundary aligns with the design system's three-layer architecture:

| Design Layer | Pipeline Phase | Nature |
|-------------|---------------|--------|
| Foundations (tokens) | — | Quantifiable visual values |
| Semantics (language rules) | Phase 2 editorial metadata informs rendering | Register, voice, rasa modulation |
| Patterns (compositions) | Phase 3 enrichments enable discovery | Search, cross-references, themes |

Rasa lives at the boundary between semantics and patterns — it is a semantic concept (experiential quality) that is computationally derived (AI classification). The epistemic boundary resolves this: the **concept** lives in the design system (semantics/emotional-registers.language.json), the **classification** lives in Neon.
