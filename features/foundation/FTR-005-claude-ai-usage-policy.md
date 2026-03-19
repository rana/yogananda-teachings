---
ftr: 5
title: "Claude AI Usage Policy — Permitted Roles, Prohibited Uses, and Expansion Roadmap"
summary: "Librarian model for Claude: finding, classifying, and drafting roles with hard theological prohibitions"
state: approved-foundational
domain: foundation
governed-by: [PRI-01, PRI-04]
depends-on: [FTR-001]
---

# FTR-005: Claude AI Usage Policy

## Rationale

**Date:** 2026-02-18

### Context

Claude API is used throughout the portal in carefully constrained roles. The governing metaphor — "the AI is a librarian, not an oracle" (FTR-001) — is well-established, but the specific permitted uses, hard prohibitions, and future expansion opportunities were scattered across FTR-001, FTR-105, FTR-154, FTR-135, and FTR-121 with no single authoritative reference. This created two risks:

1. **Scope creep:** An engineer might add a chatbot or synthesis feature because "Claude can do it" without understanding the theological constraints.
2. **Scope fear:** An engineer might avoid a valuable Claude use case because the boundaries weren't clear.

This ADR consolidates the Claude AI policy into a single reference and establishes the roadmap for high-value expansions that stay within the librarian model.

### The Librarian Model

Claude's role in the portal follows one principle: **Claude helps seekers find the verbatim published words of Yogananda and all SRF-published authors. Claude never speaks for any of them.** (FTR-001: scope extends to all author tiers.)

Every permitted use falls into one of three categories:

| Category | What Claude Does | Output Format | Human Review Required? |
|----------|-----------------|---------------|----------------------|
| **Finding** | Locates the right passages for a seeker's need | JSON (IDs, terms, scores) | No — output is search infrastructure, not content |
| **Classifying** | Categorizes passages by theme, intent, accessibility, tone | JSON (labels, scores) | Yes — classification affects what users see |
| **Drafting** | Generates non-sacred text (UI strings, captions, alt text) | Draft text files | Yes — mandatory human review before publication |

### Hard Prohibitions (Theological, Non-Negotiable)

These prohibitions are absolute and permanent. No milestone, feature, or stakeholder request overrides them.

Claude **never**:

1. **Generates text that could be mistaken for any SRF-published author's words.** Not even summaries, not even "in the style of." The portal displays only verbatim published text across all author tiers (FTR-001).
2. **Paraphrases, summarizes, or synthesizes across passages.** A seeker reads the author's actual sentences, not Claude's interpretation of them.
3. **Translates any SRF-published author's text.** Only official SRF/YSS human translations are served. Machine translation of sacred text is never acceptable for any author tier — "inviolable constraint, not a cost optimization" (FTR-135, FTR-001).
4. **Interprets meditation techniques or spiritual practices.** Kriya Yoga technique instructions and SRF Lesson content are permanently out of scope. Claude must not explain, summarize, or advise on spiritual techniques. Note: Yogananda's *published descriptions* of Kriya Yoga (e.g., Autobiography Ch. 26) are part of the corpus and surfaced normally as search results and theme page content — these are public descriptions, not technique instruction. Claude may find and rank these passages but must not interpret them as practice guidance. (FTR-055)
5. **Acts as a conversational agent or chatbot.** No dialogue, no follow-up questions, no "let me help you explore that further." The seeker interacts with the search bar, not with Claude.
6. **Answers questions directly.** Claude finds passages that answer questions. It does not formulate answers itself.
7. **Profiles or personalizes based on user behavior.** DELTA Agency principle — the AI facilitates access, it does not shape the experience based on behavioral data.
8. **Generates voice, image, or video that represents or could be mistaken for Yogananda or the lineage gurus.** No voice cloning, no synthetic portraits, no AI-animated photographs, no deepfake video. AI-generated descriptions *about* sacred media (alt text, captions) are permitted under Category: Drafting with mandatory human review. See FTR-008 for the full three-tier media integrity policy.

### Currently Permitted Uses

| # | Use Case | Milestone | Category | ADR | Description |
|---|----------|-----------|----------|-----|-------------|
| C1 | Query expansion | 1a | Finding | FTR-105 | Expands conceptual queries into semantic search terms. Returns JSON array of terms only. Optional — bypassed for simple keyword queries. |
| C2 | Passage ranking | 1a | Finding | FTR-105 | Given user's question + 20 candidate passages, selects and ranks the 5 most relevant. Returns JSON array of passage IDs only. |
| C3 | Highlight boundaries | 1a | Finding | FTR-105 | Identifies which sentences within a chunk best answer the query. Returns character offsets. |
| C4 | Theme classification | 3b | Classifying | FTR-121 | Classifies ambiguous passages into teaching topics. Optional — supplements embedding similarity for borderline cases. Mandatory human review before tags are served. |
| C5 | UI translation drafting | 5b | Drafting | FTR-135 | Translates UI chrome and portal-authored content (NOT Yogananda's text). Draft files undergo mandatory human review by fluent, SRF-aware reviewers. |
| C6 | Social caption drafting | Milestone 4a | Drafting | FTR-154 | Generates suggested captions for daily quote images. Human reviews and posts — never auto-post. |

### Approved Expansion: High-Value Claude Uses

The following use cases have been evaluated against the librarian model and approved for inclusion in the roadmap. Each stays within the Finding/Classifying/Drafting categories and respects all prohibitions.

#### E1: Search Intent Classification (STG-001)

**Category:** Classifying | **Cost:** ~$0.002/query | **Human review:** No (search infrastructure)

Classify the seeker's query intent before search executes, routing to the optimal experience:

| Intent | Example | Response |
|--------|---------|----------|
| `topical` | "peace" | Redirect to `/themes/peace` if theme exists |
| `specific` | "Autobiography chapter 12" | Redirect to reader |
| `emotional` | "I'm scared", "my mother died" | Route to "Seeking..." empathic entry or theme-filtered search with compassionate framing |
| `definitional` | "what is samadhi" | Search with boost for passages where Yogananda *defines* the term |
| `situational` | "how to raise spiritual children" | Search with situation-theme boost |
| `browsing` | "show me something inspiring" | Route to Today's Wisdom / random passage |
| `practice_inquiry` | "how to practice Kriya Yoga", "learn meditation technique", "Kriya Yoga technique" | Route to Practice pathway (`/guide#practice`) or Kriya Yoga theme page. Display practice bridge note: formal instruction available through SRF. Never return raw passages that could be misread as technique instruction. (FTR-055) |

**Implementation:** Lightweight classification call before the main search pipeline. Returns a JSON intent label + optional routing hint. Falls back to standard hybrid search if classification is uncertain.

**Why this matters:** The difference between a good search engine and a world-class one is understanding *what kind of answer the person needs*. A seeker typing "I'm scared" at 2 AM needs a different experience than one typing "fear Yogananda quotes."

#### E2: Spiritual Terminology Bridge (STG-001)

**Category:** Finding | **Cost:** Included in query expansion | **Human review:** No

Enhance query expansion with tradition-aware vocabulary mapping. Seekers arrive with modern, clinical, or cross-tradition terms that don't appear in Yogananda's vocabulary:

| Seeker's Term | Yogananda's Vocabulary |
|---------------|----------------------|
| "mindfulness" | "concentration," "one-pointed attention," "interiorization" |
| "chakras" | "astral cerebrospinal centers," "spiritual eye" |
| "enlightenment" | "Self-realization," "cosmic consciousness," "God-union" |
| "anxiety" | "restlessness," "mental disturbance," "nervous agitation" |
| "therapy" | "self-healing," "mind cure," "affirmation" |
| "trauma" | "past suffering," "karmic burden," "mental wounds" |

**Implementation:** Extend the query expansion system prompt with a spiritual terminology mapping. Claude already does query expansion (C1) — this enriches it with Yogananda-specific vocabulary awareness. The mapping is maintained as a versioned JSON glossary at `/lib/data/spiritual-terms.json`, reviewed by SRF-aware editors.

**Per-book evolution (FTR-028):** The Vocabulary Bridge is a living glossary, not a static artifact. Each book ingestion triggers a vocabulary extraction step: Opus scans the new book's chunks across three extraction categories (modern-to-Yogananda mappings, Sanskrit inline definitions, cross-tradition terms) and proposes additions. The bridge carries source provenance — which book introduced which mapping — enabling source-aware query expansion. See FTR-028 § Per-Book Evolution Lifecycle.

**Why this matters:** The portal serves Earth's population. Most seekers worldwide have never read Yogananda. They arrive with the vocabulary of their own tradition, their therapist, or their Google search. If the portal can only find passages using Yogananda's exact terminology, it fails the people who need it most.

#### E3: Passage Accessibility Rating (STG-005)

**Category:** Classifying | **Cost:** ~$0.01/chunk (one-time at ingestion) | **Human review:** Spot-check (see FTR-072 for maturity stage definitions — starts at Full Review, graduates to Spot-Check per governed criteria)

Rate each passage during ingestion on a newcomer-friendliness scale:

| Level | Label | Description | Example |
|-------|-------|-------------|---------|
| 1 | `universal` | No spiritual background needed | "Have courage. Whatever you are going through will pass." |
| 2 | `accessible` | Assumes general spiritual interest | "The soul is ever free; it is deathless, birthless, ever-existing." |
| 3 | `deep` | Assumes familiarity with Yogananda's framework | "In sabikalpa samadhi the devotee has attained realization of his oneness with Spirit, but cannot maintain cosmic consciousness except in the immobile trance state." |

**Implementation:** Stored as a `accessibility_level` column on `book_chunks`. Computed once at ingestion time by Claude (batch classification of all chunks). Spot-checked by human reviewers. Used to:
- Default homepage "Today's Wisdom" to level 1–2 passages (welcoming newcomers)
- Default theme pages to level 1–2, with "Show deeper teachings" option
- Help search ranking: when relevance scores are tied, prefer more accessible passages

**Why this matters:** This serves newcomers without tracking user behavior (DELTA-compliant). A first-time visitor encountering a passage about sabikalpa samadhi may feel the portal isn't for them. A passage about courage speaks to everyone. The portal should welcome before it deepens.

#### E4: Ingestion QA Assistant (STG-001)

**Category:** Classifying | **Cost:** ~$0.05/book (one-time) | **Human review:** No — Claude validates autonomously

During ingestion QA, Claude pre-screens ingested text and flags:

- Probable OCR errors ("Ood" → likely "God," "mediiation" → "meditation")
- Inconsistent formatting (straight quotes mixed with smart quotes, inconsistent dashes)
- Truncated passages (chunk ends mid-sentence, suggesting a chunking boundary error)
- Sanskrit diacritics that may have been mangled by PDF extraction
- Passages that appear to be headers, footnotes, or page artifacts rather than body text

**Implementation:** Batch job that processes all chunks for a book and outputs a QA report (JSON) with flagged chunks and suggested corrections. Claude validates autonomously — applying corrections within confidence thresholds and flagging edge cases for human review only when confidence is low.

**Why this matters:** The entire portal rests on text quality. OCR errors in spiritual terminology (e.g., "Kriya" misread as "Krlya") silently degrade search retrieval. Catching these before publication protects the foundation everything else is built on.

#### E5: Search Quality Evaluation Judge (STG-001)

**Category:** Classifying | **Cost:** ~$0.10/evaluation run | **Human review:** No (CI infrastructure)

Automate the search quality evaluation (Deliverables STG-001-8 and STG-002-2) by using Claude as the evaluator. The evaluation uses a bilingual golden set of ~81 queries (~66 English, ~15 Spanish) across seven difficulty categories (Direct, Conceptual, Emotional, Metaphorical, Technique-boundary, Dark Night, Adversarial). The Dark Night category (~8 queries) tests fragmentary, distressed queries against the Vocabulary Bridge's state mappings and retrieval intent routing (FTR-028). Hindi queries (~15) added when Hindi activates in Milestone 5b. Full methodology, data format, metrics, and CI integration specified in FTR-037.

**Evaluation approach:** Substring matching resolves expected passages deterministically. For results not matching expected passages, Claude Opus judges relevance (HIGH / PARTIAL / NOT_RELEVANT). Opus is used as the evaluation judge (FTR-105) because judging whether a retrieved passage meets a seeker's emotional state requires the same reasoning depth as the enrichment itself. For Dark Night queries, Opus additionally judges retrieval intent match — does the passage console rather than instruct? Does it acknowledge rather than advise?

**Metrics:** Recall@3 per category (primary gate: ≥ 80% overall), MRR@10 (secondary diagnostic), adversarial routing accuracy (target: 100%).

**Implementation:** `/scripts/eval/search-quality.ts`. CI job runs on PRs touching search-affecting paths (`/lib/services/search/`, `/lib/prompts/`, `/lib/config.ts`, `/migrations/`, `/data/eval/`). Posts per-category summary on PR. Fails if Recall@3 drops below 80% or Technique-boundary routing drops below 100%. Golden set data in `/data/eval/golden-set-{lang}.json`.

**Why this matters:** As the corpus grows (STG-006 through Phase 3) and the search pipeline evolves, automated regression testing ensures quality doesn't silently degrade. Per-category breakdowns reveal *where* search needs improvement — enabling targeted tuning rather than blind iteration.

#### E6: Cross-Book Conceptual Threading (STG-008)

**Category:** Classifying | **Cost:** ~$0.50/book pair (one-time) | **Human review:** Spot-check (see FTR-072 for maturity stage definitions)

Enhance `chunk_relations` (FTR-030) with conceptual understanding. Vector similarity finds passages about the same *topic*, but Claude can distinguish:

| Relation Type | Example | What It Enables |
|---------------|---------|-----------------|
| `same_topic` | Two passages about courage | Standard related teaching (already handled by embeddings) |
| `develops_further` | Autobiography mentions self-control briefly; Man's Eternal Quest has a full chapter | "Yogananda explores this idea at greater length in..." |
| `personal_story` | A teaching principle + an autobiographical illustration of it | "Yogananda shares a personal experience of this in..." |
| `practical_application` | A philosophical passage + a concrete technique or affirmation | "For a practical approach to this teaching, see..." |

**Implementation:** During chunk relation computation (STG-008, Deliverable 5.1), for the top 10 most similar cross-book passages per chunk, Claude classifies the relation type. Stored as a `relation_type` column on `chunk_relations`. Used to diversify the "Continue the Thread" suggestions and add context labels in the side panel.

**Why this matters:** This is what a human librarian does that a search engine cannot. "If you liked this passage about courage, here's where he tells the story of his own test of courage" — that's a world-class reading experience. No physical book, no PDF, no ebook can do this.

#### E7: Photograph Alt Text (STG-004)

**Category:** Drafting | **Cost:** ~$0.01 total (one-time, <20 images) | **Human review:** Yes

Generate reverential, descriptive alt text for the portal's Yogananda photographs (About page, footer, book covers):

- Rich descriptions for screen readers (not just "Photo of Yogananda" but "Paramahansa Yogananda seated in lotus position, eyes gently closed in meditation, wearing an ochre robe, circa 1935")
- Tone: warm, respectful, consistent with the portal's devotional register
- One-time batch at build time, reviewed by SRF editors

**Why this matters:** Direct accessibility improvement for visually impaired seekers. A portal that claims accessibility as a foundational principle should describe its sacred images with the same care it gives to its text.

#### E8: Daily Passage Tone Classification (STG-005)

**Category:** Classifying | **Cost:** ~$0.01/chunk (one-time at ingestion) | **Human review:** Spot-check (see FTR-072 for maturity stage definitions)

Classify passages in the `daily_passages` pool by emotional tone:

| Tone | Description | Example Use |
|------|-------------|-------------|
| `consoling` | Comfort, reassurance, tenderness | Appropriate any day; especially valuable during difficult times |
| `joyful` | Celebration, bliss, divine joy | Lighter fare; good for variety |
| `challenging` | Direct, demanding, calls to action | Powerful but not ideal two days in a row |
| `contemplative` | Deep, meditative, philosophical | Rewards re-reading |
| `practical` | Concrete advice, technique-adjacent | Actionable |

**Implementation:** Stored as a `tone` column on `daily_passages`. The selection algorithm ensures tonal variety across the week (not three "challenging" passages in a row) without any user tracking. Pure editorial metadata.

**Cultural note on tone categories:** These five categories were developed from a Western emotional vocabulary. Milestone 5b editorial review should assess whether they resonate across cultures. Specific concerns:

- **"Challenging"** — In guru-disciple traditions, stern teaching is considered the *highest* compassion (*guru-krpa*), not a separate emotional register. Indian seekers may not experience "challenging" passages as distinct from "consoling" ones.
- **"Practical" vs. "contemplative"** — This is a Western split. In many Indian traditions, practice IS contemplation. The distinction may feel artificial to Hindu/Vedantic practitioners.
- **Circadian weighting and cultural context** — The 2 AM consolation assumption reflects a Western sleep-anxiety pattern. A seeker awake at 4 AM in India during brahmamuhurta is likely meditating, not in distress. The circadian UX uses locale-aware solar-position bands (see DESIGN.md § Circadian content choreography) to adapt time-band selection to cultural context.

Additional tone dimensions may be needed for Hindi, Bengali, and Japanese locales — or the existing five may require reinterpretation in locale-specific editorial guidelines. This is an editorial question, not a schema change (the `tone` column remains a string; adding new values requires no migration).

**Why this matters:** Small refinement that makes the daily experience feel curated rather than random. No personalization, no tracking — just editorial intelligence applied at content level.

### Output Format Constraints

All Claude interactions follow strict output format rules:

| Category | Permitted Output | Prohibited Output |
|----------|-----------------|-------------------|
| **Finding** (C1, C2, C3, E1, E2) | JSON arrays (terms, IDs, offsets, labels) | Prose, explanations, natural language |
| **Classifying** (C4, E3, E4, E5, E6, E8) | JSON objects (labels, scores, flags) | Prose, explanations, natural language |
| **Drafting** (C5, C6, E7) | Draft text for human review | Text published without review |

Claude is never given Yogananda's text as context for generation. When Claude ranks passages (C2) or classifies them (C4, E3, E6), it reads the text to understand it — but its output is always a label, a score, or an ID, never modified text.

### Cost Profile

| Milestone | Uses | Estimated Monthly Cost | Notes |
|-----------|------|----------------------|-------|
| 1a | C1, C2, C3, E1, E2, E4, E5 | ~$10–20 | Query expansion + ranking per search; QA and eval are one-time |
| 2b | E7 | ~$0.01 (one-time) | Alt text batch |
| 3b | C4, E3, E8 | ~$5–15 (one-time per book) + monthly search | Classification batches at ingestion |
| 3c | E6 | ~$5–10 (one-time per book pair) | Cross-book threading batch |
| Milestone 4a | C6 | ~$1/month | Daily caption |
| 5b | C5 | ~$1–5 (one-time per language) | UI translation drafts |

Total ongoing cost remains modest (~$15–25/month) because most Claude uses are one-time batch jobs at ingestion, not per-request runtime calls. The librarian model is inherently cost-efficient: constrained output formats minimize tokens.

### Graceful Degradation

Every Claude integration has a fallback path:

| Use | Fallback | Quality Impact |
|-----|----------|---------------|
| Query expansion (C1, E2) | Direct keyword search (no expansion) | Lower recall for conceptual queries |
| Passage ranking (C2) | RRF-ranked results (no Claude re-rank) | Slightly less precise ranking |
| Intent classification (E1) | All queries → standard hybrid search | Functional but less intelligent routing |
| Theme classification (C4) | Embedding similarity only (no Claude refinement) | More borderline misclassifications |
| Accessibility rating (E3) | No rating; all passages treated equally | Newcomers may encounter advanced passages |
| QA assistant (E4) | Manual review without pre-screening | Higher reviewer burden |
| Eval judge (E5) | Manual evaluation of benchmark queries | Doesn't scale; skipped in CI |
| Cross-book threading (E6) | Embedding similarity without relation types | "Related" without "how it's related" |
| Alt text (E7) | Generic alt text ("Photograph of Paramahansa Yogananda") | Functional but not rich |
| Tone classification (E8) | Random selection without tonal variety | Occasional tonal clustering |

The portal works without Claude. Claude makes it *world-class*.

### Alternatives Considered

| Approach | Description | Why Rejected |
|----------|-------------|-------------|
| **No AI policy document** | Continue with scattered ADR references | Risk of scope creep or scope fear; no single reference for new engineers |
| **Chatbot mode alongside librarian mode** | Offer a conversational AI experience for seekers who prefer it | Violates FTR-001; hallucination risk with sacred text; contradicts DELTA Agency; creates a "teacher" the portal explicitly refuses to be |
| **Open-ended Claude use** | Allow any use case that doesn't violate the hard prohibitions | Too permissive; "not explicitly forbidden" is not the same as "aligned with the mission." Every use case should be evaluated against the librarian model. |
| **No Claude expansion** | Keep only C1–C6; don't add E1–E8 | Misses genuinely valuable uses (intent classification, terminology bridge, accessibility rating) that serve seekers within existing theological constraints |

### Consequences

- FTR-001 (Direct Quotes Only) and FTR-105 (AWS Bedrock Claude with Model Tiering) remain the foundational references; this ADR consolidates and extends them
- The three-category model (Finding / Classifying / Drafting) provides a clear framework for evaluating future Claude use cases
- E1 (intent classification) and E2 (terminology bridge) are added to STG-001 deliverables — they directly improve search quality at launch
- E3 (accessibility rating) and E8 (tone classification) are added to STG-005 — they require multi-book content to be meaningful
- E4 (QA assistant) and E5 (eval judge) are added to STG-001 — they improve quality foundations
- E6 (cross-book threading) is added to STG-008 — it enhances the Related Teachings system
- E7 (alt text) is added to STG-004 — it's an accessibility deliverable
- The Vocabulary Bridge (FTR-028) is a living glossary that deepens with each book, backed by the `vocabulary_bridge` PostgreSQL table.
- Every new Claude use case proposed in future milestones should be evaluated against this ADR's three-category model and hard prohibitions
- **Extended ADRs:** FTR-001 (cross-reference to this policy), FTR-105 (cross-reference to expansion roadmap)
