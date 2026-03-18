---
ftr: 68
title: Content Lifecycle Management
summary: "Human workflows and operational procedures for book ingestion, theme curation, and content maintenance"
state: approved-provisional
domain: editorial
governed-by: [PRI-01, PRI-02, PRI-12]
depends-on: [FTR-022, FTR-060]
---

# FTR-068: Content Lifecycle Management

## Rationale

The portal's content — book text, theme tags, translations, editorial threads, community collections — moves through a lifecycle from creation to publication to maintenance. This section specifies the human workflows and operational procedures that complement the technical architecture.

### Book Ingestion Workflow

**Milestone 1a:** book.json (from `scripts/book-ingest/`) → Contentful import script → Contentful (via Management API) → batch sync → chunk → embed → Neon.
**Milestone 1c+:** Contentful authoring → webhook sync → Neon. Same QA and review steps apply.

#### Pre-Ingestion Planning

Before running the pipeline, the book ingestion operator completes a planning checklist:

1. **Edition confirmation:** Which edition? Page-number reference? (FTR-021)
2. **Structure assessment:** Narrative, collected talks, verse-commentary, chants, or poetry? (FTR-023, FTR-142)
3. **Chunking strategy selection:** Standard paragraph-based, verse-aware, or chant whole-unit?
4. **Special handling:** Devanāgarī content? IAST diacritics? Epigraphs? Poetry blocks? (FTR-131, FTR-023)
5. **Source quality:** PDF scan quality, OCR confidence expectation, known problem areas.

The admin portal surfaces this as a structured form (Milestone 3b+). For Milestones 1a–2b, the checklist lives in the book's ingestion script configuration.

#### Pipeline Dashboard

After automated processing but before human QA, the operator sees a pipeline summary:

- Chunks generated: count, size distribution (histogram against 100–500 token target range)
- QA flags: count by type (OCR suspect, formatting, truncated, Sanskrit diacritics)
- Chapter status: per-chapter pass/flag count
- Glossary terms: newly identified terms for the Living Glossary
- Theme coverage: top 5 themes represented in the new content

**Service file:** `/lib/services/ingestion.ts` — pipeline status queries, per-book and per-chapter summaries.

#### Staged Publication

New book content is reviewable in a "preview" state before going live:

- **Milestone 1a:** `books.is_published` and `chapters.is_published` boolean flags. Unpublished content is visible in the admin portal ("preview as seeker") but excluded from public search and reader routes.
- **Milestone 1c+:** Contentful draft/published workflow provides this natively. The webhook sync only processes published entries. The Neon `is_published` flags remain as a cache of Contentful state.

The operator publishes chapter-by-chapter or the whole book at once. Publication triggers chunk relation computation for the new content.

#### Post-Ingestion Verification

After publication, a mini quality check:

1. Run 5–10 representative queries that should return passages from the new book
2. Verify cross-book relations are meaningful (spot-check 3–5 passages)
3. Confirm theme tags were generated and are in the review queue
4. Verify glossary terms were extracted and added to the suggestion index

This can be partially automated as a post-publication Lambda step that reports results to the admin portal.

### Content Correction Workflow

Errors will be found — by staff, by seekers (via feedback, FTR-061), or during re-reading.

#### Citation Error Fast Path

1. Seeker or staff reports incorrect page number, chapter, or book attribution
2. Report enters the QA queue at high priority (citation errors affect the portal's fidelity guarantee)
3. Reviewer verifies against physical book
4. Correction applied in Contentful (syncs to Neon via webhook)
5. Content hash updates. Chunk relations unaffected (text unchanged). Shared links remain stable.

#### Text Correction Path

1. OCR error or transcription mistake discovered
2. Staff corrects the text in the admin portal or Contentful
3. Embedding re-generated for the affected chunk (automated on save)
4. Chunk relations recomputed for that chunk (automated, incremental)
5. Theme tags for the chunk are re-evaluated (enter review queue if the correction changed meaning)

The admin portal presents this as a single "correct and reprocess" action, not a multi-step manual process.

**Service file:** `/lib/services/corrections.ts` — correction application, cascading reprocess triggers, correction audit log.

#### Chunk Boundary Revision

Rarely, a chunk boundary splits a thought badly. The operator may need to split or merge chunks.

This is a high-consequence operation affecting embeddings, relations, theme tags, bookmarks, and shared links. The admin portal requires:

1. Preview of the proposed boundary change with before/after views
2. Impact assessment: "This will affect 3 theme tags, 12 chunk relations, and 0 shared links"
3. Explicit confirmation before execution
4. Automatic cascade: re-embed, re-relate, re-queue affected theme tags for review
5. Content-hash resolution chain (FTR-132) ensures shared links degrade gracefully

### Content Retirement and Edition Updates

When SRF publishes a new edition of a book, the portal's text may become outdated. FTR-021 handles the technical architecture (edition tracking, archival). The human workflow:

1. **Decision:** SRF determines that a new edition should replace the portal's current text. This is a stakeholder decision, not a technical one.
2. **Planning:** Book ingestion operator assesses the scope: How different is the new edition? Page numbers only, or text changes? Full re-ingestion or targeted corrections?
3. **Execution:** Old edition archived (not deleted). New edition ingested through the standard pipeline. Chunk relations recomputed. Theme tags re-evaluated.
4. **Verification:** Shared links tested against the content-hash resolution chain. Bookmarks checked for graceful degradation. Search quality verified.
5. **Communication:** If shared links to specific passages changed, the portal's "passage may have moved" fallback (FTR-132) activates. No seeker-facing announcement needed — the resolution chain handles it silently.

### Operational Playbook

By year 3, the people operating the portal may be different from those who built it. The architectural documentation (this file, DECISIONS.md) captures *why* decisions were made. The **operational playbook** captures *how to do the work:*

- How to add a new book (pre-ingestion checklist through post-publication verification)
- How to handle a translation batch (reviewer onboarding, glossary setup, batch review, approval)
- How to review community collections (evaluation criteria, feedback templates, featured promotion)
- How to respond to a citation error (verification, correction, cascade)
- How to create a curation brief for VLD members (brief structure, editorial guidance, deadline setting)
- How to onboard a new staff member to the admin portal
- How to run the quarterly backup restore drill

**Location:** `/docs/operational/playbook.md` — created during Milestone 3b when the editorial review portal ships. Updated as new workflows are added in subsequent milestones. Referenced from the admin portal's help section.
