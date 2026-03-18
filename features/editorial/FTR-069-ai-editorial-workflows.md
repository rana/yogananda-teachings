---
ftr: 69
title: AI-Assisted Editorial Workflows
summary: "Consolidated reference of 25+ AI-propose/human-approve workflows across the content pipeline"
state: approved-provisional
domain: editorial
governed-by: [PRI-01, PRI-12]
depends-on: [FTR-105, FTR-098]
---

# FTR-069: AI-Assisted Editorial Workflows

## Rationale

The portal uses AI (Claude via AWS Bedrock) throughout the content pipeline. This section consolidates all AI-human collaboration patterns into a single reference. The governing principle is consistent: **AI proposes, humans approve.** Automated intelligence improves efficiency; human judgment ensures fidelity.

**Corpus access pattern:** All AI workflows access the teaching corpus through MCP tools (FTR-098, FTR-083 Tier 2) rather than ad-hoc service layer calls. This provides a canonical, auditable interface — every AI proposal can be traced to the exact MCP queries that informed it. The MCP tools are thin wrappers around `/lib/services/` functions; the service layer is the source of truth. See FTR-083 § Internal MCP use cases by consumer for the tool-to-workflow mapping.

### Existing AI-Assisted Workflows (Designed in Individual ADRs)

| Task | AI Role | Human Role | Milestone | ADR |
|---|---|---|---|---|
| Theme tag classification | Proposes tags with confidence scores | Approves/rejects per passage | 3b | FTR-121 |
| Query expansion | Expands conceptual queries to search terms | Reviews spiritual-terms.json periodically | 1a | FTR-005 E2 |
| Ingestion QA | Flags probable OCR errors, formatting issues | Makes every correction decision | 1a | FTR-005 E4 |
| Tone classification | Classifies passage tone (consoling/joyful/challenging/contemplative/practical) | Spot-checks | 3b | FTR-005 E8 |
| Accessibility rating | Classifies passage depth (universal/accessible/deep) | Spot-checks | 3b | FTR-005 E3 |
| UI string translation | Drafts translations for all ~200–300 UI strings | Reviews every string before production | 2a (hi/es), 5b (remaining) | FTR-135 |
| Alt text generation | Generates reverential alt text for photographs | Reviews before publication | 2a | FTR-005 E7 |
| Social media captions | Generates caption text with citation | Reviews and edits before posting | 5a | FTR-154 |
| Relation type classification | Classifies cross-book relation types | Spot-checks | 3c | FTR-005 E6 |
| External reference extraction | Extracts Bible, Gita, Patanjali references from text | Three-state review (auto → reviewed → manual) | 3c | FTR-064 |
| `/guide` page drafts (need-based) | Drafts recommendation text for seeker need pathways | Reviews before publication | 3b | FTR-056 |
| `/guide` worldview pathways | Generates corpus-grounded guide sections for 12 worldview perspectives using seed queries, reverse bibliography, and vocabulary bridge | Theological review before publication | 3b+ | FTR-056, FTR-064 |
| `/guide` life-phase pathways | Generates guide sections for 9 life-phase perspectives using tone filters, accessibility levels, situation themes, and characteristic questions as generation anchors | Editorial + theological review | 3b+ | FTR-056 |
| `/guide` practice pathway | Drafts the "If You Feel Drawn to Practice" pathway framing text, selecting corpus passages about the primacy of practice and Kriya Yoga's public description | Theological review before publication | 3b | FTR-056, FTR-055 |
| Practice bridge candidate tagging | Proposes `practice_bridge: true` on passages where Yogananda explicitly invites the reader to practice | Human approval required for every tag | 3b+ | FTR-055 |
| Search intent classification | Routes queries to optimal experience (theme/reader/empathic/search/practice) | Implicit — classification rules are human-authored | 1 | FTR-005 E1 |
| Search quality evaluation | Automated judge assessing search result relevance in CI | Sets expected-passage test suite | 1 | FTR-005 E5 |
| Portal update drafting | Reads deployment metadata and git history, drafts seeker-facing release note in portal voice (FTR-054) | Reviews and edits before publication | 3b | FTR-092 |

### Additional AI-Assisted Workflows

These workflows extend the existing pattern to additional editorial tasks. Each follows the same "AI proposes, humans approve" principle.

#### UI Copy Generation (Top-N Choices)

For every new UI string (error messages, empty states, ARIA labels, loading text, confirmation dialogs), Claude generates 3 ranked options following the portal editorial voice guide (FTR-054). The default is the top-ranked choice. Human editor can accept, select an alternative, or edit.

```
┌──────────────────────────────────────────────────────────────┐
│ New String: search.empty_state                               │
│ Context: Shown when search returns no results                │
│ Tone: Warm, honest, not apologetic (FTR-054)                 │
│                                                              │
│ ● Option 1 (recommended):                                    │
│   "The teachings don't have a direct answer for that —       │
│    but exploring related themes may help."                    │
│                                                              │
│ ○ Option 2:                                                  │
│   "We didn't find teachings matching your search. Try        │
│    different words, or explore a theme below."               │
│                                                              │
│ ○ Option 3:                                                  │
│   "No passages found for this search. The teachings may      │
│    address this differently — try a related theme."          │
│                                                              │
│ [Accept Selected]  [Edit]  [Regenerate]                      │
└──────────────────────────────────────────────────────────────┘
```

**Milestone:** 2a (when UI strings are first externalized to `messages/en.json`). The AI draft workflow becomes part of the locale file creation process for every subsequent milestone. Consistent with FTR-054 editorial voice guide and FTR-135 translation workflow.

**Service file:** `/lib/services/copy.ts` — UI copy generation, option ranking, editorial voice prompt construction.

#### Daily Passage Pre-Curation

Claude reviews the next 14 days of daily passages and suggests adjustments:
- Calendar alignment: "March 7 is Mahasamadhi — the current random selection doesn't match. Here are 3 alternatives."
- Tonal variety: "The last 5 days are all contemplative — here's a joyful alternative for day 6."
- Content appropriateness: "This passage references meditation technique and may be too specialized for the homepage — flagged for review."
- Circadian fit: late-night passages should lean consoling, not challenging .

Human editor reviews Claude's suggestions alongside the current 14-day schedule, accepts/adjusts/ignores. This runs as a weekly scheduled task surfaced in the editorial home screen.

**Milestone:** 3b (alongside daily passage curation workflow).

#### Calendar-Aware Content Suggestions

When a calendar event approaches (within 30 days), Claude scans the corpus for thematically related passages and suggests passage-event associations. For example, approaching Christmas meditation: Claude identifies passages about Christ, the Nativity, and universal spirituality from across the library. Human curator reviews, selects, and links.

**Milestone:** 3b (alongside calendar event management, M3b-8).

#### Community Collection Pre-Review

Before staff sees a community collection submission, Claude provides a preliminary assessment:

- Citation completeness: "All 12 passages have valid book/chapter/page citations ✓"
- Cross-corpus coverage: "Passages span 4 books ✓"
- Content integrity: "Personal notes are present and visually distinct from Yogananda's text ✓"
- Theological coherence flag: "Passage #7 appears to be about meditation technique, but the collection is themed 'Friendship.' Recommend staff verify."
- Decontextualization risk: "Passage #3 is about death and may read differently outside its chapter context — suggest staff check."

This does **not** auto-approve or auto-reject. It reduces the reviewer's cognitive load by pre-screening for common issues, allowing the human reviewer to focus on theological judgment.

**Milestone:** 7b (alongside community collection gallery).

#### Curation Brief Drafting

Staff describes a high-level need ("We need a collection about courage for autumn"), and Claude drafts a structured curation brief:

- Suggested title
- Description with editorial guidance
- Recommended source books (based on theme tag density)
- 3–5 seed passages as starting points

Staff edits and publishes the brief. VLD members see a well-structured assignment with concrete guidance, reducing the ambiguity that makes volunteer work difficult.

**Milestone:** 7b (alongside VLD curation pipeline).

#### Feedback Categorization

Seeker feedback (FTR-061) arrives as free text. Claude categorizes it before it enters the review queue:

| Category | Priority | Routing |
|---|---|---|
| Citation error | High | QA queue |
| Text error (OCR, formatting) | High | QA queue |
| Feature suggestion | Normal | Feature request log |
| Search quality complaint | Normal | Search quality review |
| Praise / gratitude | Low | Archive (morale visibility in editorial home) |
| Off-topic / spam | Low | Flag for dismissal |
| Crisis language | Immediate | Alert per FTR-051 protocol |

Human sees pre-categorized feedback with Claude's reasoning, adjusts categories as needed. The categorization itself is never shown to the seeker — it's an internal routing aid.

**Milestone:** 3b (alongside seeker feedback mechanism, M3b-9).

#### Ingestion Changelog Generation

After a new book is ingested, Claude generates a human-readable summary:

- "942 passages extracted across 48 chapters"
- "12 OCR flags awaiting review"
- "17 new glossary terms identified"
- "Top 5 themes: Meditation (142 passages), Self-Realization (89), Divine Love (76), Devotion (63), Yoga (51)"
- "Estimated review time: 2–3 hours for QA flags"

Staff gets a concise summary without querying the database. Displayed in the admin portal's pipeline dashboard.

**Milestone:** 3a (alongside book ingestion workflow improvements).

#### Worldview Guide Pathway Generation (Corpus-Grounded)

Claude generates draft `/guide` pathway sections for each worldview perspective, grounded entirely in the SRF corpus. This is the most editorially sensitive AI-assisted workflow — it determines how seekers from different traditions encounter the teachings — and requires theological review, not just editorial review.

**Trigger:** On-demand from admin portal ("Generate guide pathways"), or after a new book ingestion introduces significant new cross-tradition content (e.g., *The Second Coming of Christ* creates the Christian pathway; *Wine of the Mystic* creates the Sufi/poetry pathway).

**Generation pipeline:**

1. Admin selects a perspective from the worldview catalog (see FTR-056 § Worldview Pathway Catalog)
2. Claude Opus (batch tier, FTR-105) receives:
   - A perspective-specific prompt template (see below)
   - Corpus search results for that perspective's seed queries (via Neon, same queries as SRF Corpus MCP)
   - Reverse bibliography entries matching that perspective's tradition (FTR-064)
   - Vocabulary bridge entries for that perspective's categories from `spiritual-terms.json`
   - Current theme taxonomy with passage counts
3. Claude outputs structured JSON:
   - Title and framing paragraph (navigational, never paraphrasing Yogananda — FTR-001)
   - 2–3 recommended resources per pathway (book, theme, reading thread, reference index, Quiet Corner)
   - Framing text for each recommendation
   - Bridge vocabulary highlights (3–5 terms mapping the perspective's vocabulary to Yogananda's)
   - 3–5 representative passage IDs selected from search results
   - For each recommendation slot: top-3 alternatives with reasoning, so the reviewer chooses
4. Output enters editorial review queue as `tagged_by = 'auto'`
5. Theological reviewer sees:
   - The generated pathway with all passages displayed inline
   - Claude's reasoning for each selection ("Selected because this passage directly addresses Christ Consciousness using language accessible to Christian readers")
   - Alternative options per slot
   - Accept / edit / reject controls
6. On approval (`tagged_by = 'reviewed'`), content is committed to `messages/{locale}.json` and deployed via normal release process

**Prompt template structure** (one per perspective, versioned in `/lib/data/guide-prompts/`):

```
You are generating a guide pathway for the SRF teachings portal.

PERSPECTIVE: {perspective_name}
DESCRIPTION: {perspective_description}

You have access to:
- CORPUS_RESULTS: Passages matching these queries: {seed_queries}
- REFERENCES: External sources Yogananda references from this tradition: {reference_data}
- BRIDGE_TERMS: Vocabulary mappings for this perspective: {bridge_entries}
- THEMES: Relevant theme pages with passage counts: {theme_data}
- BOOKS: Available books with descriptions: {book_data}

Generate a guide pathway section following these rules:
1. The title uses "If you..." phrasing: warm, inviting, never presumptuous
2. The framing paragraph (2-3 sentences) is navigational — it tells the seeker WHERE to go, not WHAT to think
3. Never paraphrase or summarize Yogananda's words — only point to where they live
4. Select 2-3 recommendations (a book, a theme, a reference index, a reading thread, the Quiet Corner)
5. For each recommendation, write one sentence of editorial framing
6. Identify 3-5 bridge terms that map this perspective's vocabulary to Yogananda's
7. Select 3-5 representative passages that would resonate with this perspective
8. For each recommendation slot, provide your top choice and 2 alternatives with brief reasoning

Output format: {json_schema}
```

**Development-time iteration:** During development, the SRF Corpus MCP server (FTR-083, FTR-083) lets Claude Code test pathway generation interactively — "generate a guide pathway for Buddhist meditators" — and refine prompts until quality is high. The polished prompt templates are then deployed for the admin portal batch workflow.

**Life-phase pathway generation:** Uses the same pipeline with a different prompt template structure. Instead of tradition-specific seed queries and vocabulary bridges, life-phase prompts use:
- The characteristic question as the generation anchor ("Is this all there is?")
- Tone filters (`consoling`, `practical`, `contemplative`, etc.) to select passages matching the season's emotional register
- Accessibility level constraints (level 1 for youth pathways, level 2–3 for elder/approaching-end pathways)
- Situation theme associations as content sources (the Parenting theme feeds the Raising a Family pathway)
- Autobiography chapter mapping — which chapters in Yogananda's own life story speak to this season

Life-phase prompts are stored alongside worldview prompts in `/lib/data/guide-prompts/` with a `life-phase/` subdirectory.

**Regeneration after corpus growth:** When a new book is ingested (Milestone 3a+), the admin portal flags which worldview and life-phase pathways may benefit from regeneration based on the new book's theme density and reference profile. E.g., ingesting *The Second Coming of Christ* triggers a regeneration flag for the Christian contemplative pathway; ingesting *Scientific Healing Affirmations* triggers a flag for the Facing Illness life-phase pathway. Staff decides whether to regenerate, and regenerated drafts go through the same review pipeline.

**Milestone:** 3b+ (requires theme system, reverse bibliography, vocabulary bridge, editorial review infrastructure). Initial pathways generated for English; Milestone 5b adds per-locale cultural adaptation of each pathway.

**Service file:** `/lib/services/guide-generation.ts` — prompt template loading, corpus query orchestration, structured output parsing, admin portal integration.

#### Impact Report Drafting

For the annual "What Is Humanity Seeking?" report (Milestone 7b), Claude drafts narrative text from aggregated data:

- "In 2027, seekers from 142 countries searched the portal. The most common theme was 'peace' — reflecting a world seeking inner stillness."
- "Grief-related searches peaked in November, suggesting a seasonal pattern of reflection around holidays and year's end."
- "The fastest-growing theme was 'meditation' — up 40% from Q1 to Q4 — suggesting rising interest in practice, not just reading."

Human curator edits the draft into the final report. The data is real; the narrative framing is AI-drafted, human-approved.

**Milestone:** 7b (alongside annual report).

### AI Tone in the Admin Portal

The AI's voice in staff-facing interfaces should match the portal's contemplative character. Not performative enthusiasm ("AI has completed 23 tasks!") but quiet assistance:

- "Here are today's suggestions for your review."
- "This passage was flagged because the OCR confidence was low for the Sanskrit text."
- "Claude's recommendation: approve. Confidence: high. Reasoning: strong thematic alignment with 'Peace' across 3 similar passages already tagged."

The admin portal's AI-generated text follows the same editorial voice guide (FTR-054) as seeker-facing copy — warm, honest, not mechanical.

### Workflow Maturity Model (FTR-072)

The "AI proposes, humans approve" principle is the permanent default. But over a decade, as the corpus grows and editorial demands multiply, some workflows earn graduated trust through consistent accuracy. FTR-072 establishes a three-stage maturity model:

| Stage | Human Involvement | Graduation Criteria |
|---|---|---|
| **Full Review** | Approves every item | Default — no criteria needed |
| **Spot-Check** | Reviews 10–20% sample + flagged items | ≥ 500 items, ≥ 95% approval rate, ≥ 3 months, theological sign-off |
| **Exception-Only** | Reviews only AI-abstained or low-confidence items | ≥ 2,000 items at Spot-Check, ≥ 98% approval, ≥ 6 months, coordinator sign-off |

**Permanently Full Review workflows:** Worldview pathway generation, life-phase pathway generation, community collection approval, crisis language detection. These never graduate — the theological judgment required is irreducible.

Stage transitions are per-workflow, per-language, governed, auditable, and reversible. Any theological error or sustained override pattern (> 15% in 30 days) triggers automatic regression. See FTR-072 for full governance specification.

### Feedback Loop Protocol (FTR-072)

AI proposals improve over time through systematic feedback, not model fine-tuning:

**Override tracking.** Every reviewer action (approve, reject, edit, select alternative) is logged in `ai_review_log` with the workflow type, AI proposal, reviewer decision, and optional rationale. This table is internal — never exposed to seekers, never used for analytics.

**Prompt refinement cadence.** Quarterly, the portal coordinator reviews override patterns:
- Workflows with > 10% override rate → prompt revision required
- Consistent override patterns (e.g., "always rejects 'Joy' for passages about sacrifice") → pattern added as negative example in the prompt
- Refined prompts are versioned; previous versions archived in `/lib/data/prompt-archive/`

**Confidence calibration.** AI confidence scores are compared against actual approval rates quarterly. If the AI is consistently confident about rejected proposals, the routing threshold is raised. If consistently uncertain about approved proposals, the threshold is lowered.

**Service file:** `/lib/services/ai-review.ts` — override logging, quarterly report generation, confidence calibration queries.

### AI Observes — Passive Intelligence Pattern

"AI proposes, humans approve" is an active pattern — the AI generates, the human reviews. The portal also needs a complementary passive pattern: **"AI observes, humans are informed."** These are not proposals requiring approval. They are ambient awareness surfaced in the editorial home screen as low-priority informational items.

| Observation Type | Example | Cadence |
|---|---|---|
| **Theme diversity drift** | "The theme 'Peace' is now 60% dominated by passages from one book. Diversity has decreased since Milestone 3c." | Weekly |
| **Classification staleness** | "142 theme tags were classified > 18 months ago with prompt version 1.2. Current prompt is 2.1. Reclassification may improve accuracy." | Monthly |
| **Coverage gaps** | "No passages in the corpus address 'Forgiveness' from a practical perspective — only contemplative. This affects the Facing Guilt life-phase pathway." | After each book ingestion |
| **Cross-workflow inconsistency** | "Passage #247 is tagged 'joyful' by tone classification but selected for the Grief & Loss guide pathway." | Nightly batch |
| **Engagement signal anomalies** | "The 'Healing' theme page shows 3× higher passage-resonance signals than any other theme. The theme may benefit from subdivision." | Monthly |

Observations are **never actionable recommendations** — they state a condition. The editorial team decides whether the condition matters. Many observations will be dismissed. The AI doesn't need to know which.

**Milestone:** 3b (alongside editorial home screen, which becomes the natural surface for observations).

**Service file:** `/lib/services/ai-observations.ts` — observation generation, staleness detection, diversity metrics, consistency checks.

### AI Abstains — Confidence-Aware Routing

Sometimes the right AI behavior is to decline. A low-confidence proposal can be worse than no proposal, because it anchors the reviewer's judgment rather than allowing them to form their own assessment of the content.

**Abstention triggers:**
- Passage in a script the model cannot reliably process (Devanāgarī-heavy content for tone classification)
- Fewer than 3 corpus passages available for a pathway generation slot
- Confidence score below a per-workflow floor (calibrated during Full Review stage)
- Content outside the model's observed distribution (e.g., chant-prose hybrid in a theme classifier trained on prose)

**Reviewer experience:** When the AI abstains, the queue item is marked `ai_abstained = true` with a brief explanation ("Insufficient corpus coverage for Sufi poetry pathway — only 2 relevant passages found"). The reviewer sees the raw content with no AI pre-classification. The abstention reason provides context without anchoring.

**Abstention rates** are tracked per workflow as a health metric. Rising abstention in a workflow signals either corpus gaps or prompt degradation — both worth investigating.

**Milestone:** 1a (abstention capability ships with the first AI-assisted workflow; confidence floors are calibrated during Full Review operation).

### Workflow Dependency Graph

FTR-069 workflows have implicit dependencies. When an upstream workflow's output changes, downstream consumers may need re-evaluation.

```
                    ┌──────────────┐
                    │ Ingestion QA │
                    └──────┬───────┘
                           │ text corrections invalidate downstream
                           ▼
              ┌────────────────────────┐
              │ Theme Tag Classification│──────────────┐
              └────────────┬───────────┘              │
                           │                          │
              ┌────────────▼───────────┐   ┌──────────▼──────────────┐
              │ Tone Classification    │   │ Worldview Pathway Gen.  │
              └────────────┬───────────┘   └──────────▲──────────────┘
                           │                          │
              ┌────────────▼───────────┐   ┌──────────┴──────────────┐
              │ Daily Passage Curation │   │ External Ref Extraction │
              └────────────────────────┘   └─────────────────────────┘

              ┌────────────────────────┐   ┌─────────────────────────┐
              │ Feedback Categorization│──►│ Content Correction      │
              └────────────────────────┘   │ (FTR-068)               │
                                           └─────────────────────────┘
```

**Staleness signaling:** When an upstream workflow's output changes (OCR correction alters passage text, a theme tag is reclassified), downstream workflows that consumed the old output are flagged in the editorial queue: "This passage's theme tags changed since it was included in the Christmas pathway. Review recommended." This is not automatic re-execution — it is a staleness signal that the editor can act on or dismiss.

**Milestone:** 3b (staleness signaling requires the editorial queue infrastructure).

### Unified Prompt Versioning

FTR-069 § Worldview Guide Pathway Generation specifies versioned prompt templates in `/lib/data/guide-prompts/`. All other AI-assisted workflows also depend on system prompts that will evolve over time — but only the worldview pathway has explicit versioning.

**All AI-assisted workflow prompts** are versioned under a unified directory structure:

```
/lib/data/ai-prompts/
  theme-classification/
    v1.0.md          ← initial prompt
    v1.1.md          ← quarterly refinement (2027-Q2)
    CHANGELOG.md     ← override patterns that motivated each revision
  tone-classification/
    v1.0.md
  query-expansion/
    v1.0.md
  guide-prompts/
    worldview/
      christian-contemplative.md
      buddhist-meditator.md
      ...
    life-phase/
      young-seeker.md
      ...
  feedback-categorization/
    v1.0.md
  ingestion-qa/
    v1.0.md
  ...
```

Each prompt file includes:
- The system prompt text
- The input schema (what data the prompt receives)
- The output schema (what structure the prompt produces)
- Version date and author
- Override patterns from the previous version that motivated the revision (from `ai_review_log` quarterly analysis)

**Why this matters for a 10-year project:** When the theological reviewer who spent 3 years refining worldview prompts moves to a different role, the prompt files preserve *what* was refined. The `CHANGELOG.md` files preserve *why* — which override patterns, which edge cases, which editorial judgments shaped the current prompt. This is institutional memory that survives staff turnover.

The existing `/lib/data/guide-prompts/` directory is subsumed into the unified structure. The `/lib/data/spiritual-terms.json` vocabulary bridge remains a separate file consumed by multiple prompts.

**Milestone:** 1a (directory structure created at repo setup; initial prompts for search intent classification and ingestion QA are the first entries).
