# SRF Online Teachings Portal — Architecture Decision Records (Core)

> **Scope.** This file contains ADRs from the **Foundational Constraints**, **Infrastructure & Platform**, **Application Architecture**, **Content & Data Model**, and **Search & AI** groups. These govern Arcs 1–3 and require close attention during implementation. For the navigational index and group summaries, see [DECISIONS.md](DECISIONS.md). For other ADR files, see the links in the index.
>
> **Living documents.** ADRs are mutable. Update them directly — add, revise, or replace content in place. Git history serves as the full audit trail.

## ADR-001: Direct Quotes Only — No AI Synthesis

- **Status:** Accepted (FIRM — foundational requirement)
- **Date:** 2026-02-17

### Context

The Intelligent Query Tool could operate in two modes:

1. **Synthesis mode:** AI reads retrieved passages and generates a natural-language answer in its own words, citing sources.
2. **Librarian mode:** AI finds and ranks the most relevant passages but the user reads only verbatim text from SRF-published authors.

### Decision

**Librarian mode only.** The AI's role is strictly limited to:
- Expanding user queries into semantic search terms
- Ranking retrieved passages by relevance
- Identifying highlight boundaries within long passages

The AI **never**:
- Generates text that could be mistaken for any SRF-published author's words
- Paraphrases, summarizes, or synthesizes across passages
- Interprets meditation techniques or spiritual practices
- Answers questions not addressable from the corpus

### Rationale

- **Sacred text fidelity:** The words of Yogananda and all SRF-published authors are considered transmitted teachings from realized masters and their direct successors (PRO-014). Even subtle paraphrasing can distort meaning. "God-consciousness" and "cosmic consciousness" are not interchangeable in this tradition.
- **Hallucination risk:** LLMs generate plausible but incorrect statements. In a spiritual context, a hallucinated teaching could be spiritually harmful.
- **Trust:** Users can verify every result against the source text. There is nothing to hallucinate because the AI generates no content.
- **Theological alignment:** The DELTA framework principle of Agency — the AI facilitates access to the teachings, it does not become a teacher.
- **Simplicity:** The Librarian model is architecturally simpler, cheaper (fewer LLM tokens), and more reliable than synthesis.

### Consequences

- **Chunking quality is paramount.** Each chunk must be a coherent, self-contained passage suitable for display as a standalone quote.
- **The "Read in context" link is critical.** Every search result must deep-link to the full chapter view, positioned at that passage.
- **The "no results" case must be handled gracefully.** When the corpus doesn't address a query, the system must say so honestly rather than stretching to find something.
- **The AI's output format is constrained.** Query expansion returns a JSON array of terms. Passage ranking returns a JSON array of IDs. No prose output.
- **Consolidated in ADR-005:** The full Claude AI Usage Policy — permitted roles, prohibited uses, output format constraints, and expansion roadmap — is maintained in ADR-005.
- **Multi-author scope (PRO-014).** The librarian model applies to all SRF-published authors across three author tiers: guru (Yogananda, Sri Yukteswar), president (Daya Mata, Mrinalini Mata, Rajarsi Janakananda), monastic (monastic speakers). All tiers receive verbatim fidelity. Tiers govern search inclusion, daily passage eligibility, and social media pool participation — not fidelity level. See PRO-014 for the confirmed hierarchy and per-tier feature behavior.

---

---

## ADR-002: Personalization with Restraint — DELTA-Aligned Feature Boundaries

- **Status:** Accepted
- **Date:** 2026-02-17

### Context

Modern web platforms use personalization extensively: behavioral recommendations, activity tracking, engagement metrics, push notifications. These techniques are designed to maximize time-on-site and retention — goals that directly conflict with the Calm Technology principles and DELTA framework governing this portal.

However, some personalization is genuinely helpful. A seeker who bookmarks a passage about courage should be able to find it again. A reader in Japan should see the portal in Japanese. The question is: where is the line?

### Decision

Classify personalization features into three tiers:

**Build (genuinely helpful):**

| Feature | Rationale | Milestone |
|---------|-----------|-----------|
| Language preference | Fundamental accessibility. Stored in cookie or account. | 5b |
| Font size / reading preferences | Accessibility. Local storage, no account needed. | 3b |
| Bookmarks ("My Passages") | Lets seekers curate a personal anthology of passages that moved them. | 3b (localStorage), 7a (server sync) |
| Reading position | Saves your place in a book. Basic reader functionality. | 7a |

**Build with caution:**

| Feature | The Concern | Constraint |
|---------|-------------|------------|
| Search history | Could feel like surveillance | Opt-in only. User can clear at any time. Never surfaced publicly. Deletable. |
| Theme preference for daily passage | If based on behavioral inference, this is algorithmic curation | Implement as explicit user choice ("I'd like more passages about Peace") — never inferred from behavior |

**Do not build:**

| Feature | Why Not |
|---------|---------|
| Reading streaks / activity tracking | Violates DELTA Transcendence principle. Reduces spiritual practice to metrics. |
| "You've read X books this month" | Gamification in disguise |
| "Recommended for you" (behavioral) | Netflix model. Violates DELTA Agency principle. Antithetical to Calm Technology. |
| Social features (public profiles, shared highlights) | The portal is a private sanctuary, not a social network |
| Push notifications | Antithetical to Calm Technology. The portal waits; it does not interrupt. |
| Engagement dashboards for users | Optimizes for screen time, which the DELTA Embodiment principle discourages |

### Rationale

- **DELTA Agency:** Users must retain full control. No algorithmic manipulation. Explicit choices only.
- **DELTA Embodiment:** The portal should encourage logging off and practicing — not maximizing session length.
- **DELTA Transcendence:** Spiritual depth is not quantifiable. No metrics, leaderboards, or streaks.
- **Calm Technology:** Technology should require the smallest possible amount of attention. Personalization that demands ongoing interaction (maintaining streaks, checking notifications) violates this.
- **Practical:** Every personalization feature requires user accounts, data storage, privacy policies, and GDPR compliance. Minimizing personalization reduces operational complexity.

### Consequences

- Milestone 7a (Optional User Accounts) remains the appropriate milestone for bookmark/reading-position features
- The "personalized daily passage" in Milestone 7a must use explicit theme preference, not behavioral inference
- The portal's anonymous experience (Arcs 1–5) must be excellent without any personalization — personalization enhances but never gates the core experience

---

---

## ADR-003: Accessibility Foundation

- **Status:** Accepted
- **Date:** 2026-02-17

### Context

The original roadmap placed accessibility late in the schedule ("Calm Technology Polish & Accessibility"). This is too late. Retrofitting accessibility is expensive and error-prone; building it in from day one is nearly free if the right structural choices are made at the start.

SRF's audience includes elderly devotees, seekers in developing countries on low-end devices, and visually impaired users. The Gemini research document specifically notes visually impaired devotees who described the SRF app's screen reader support as "transformative." Accessibility is not a feature — it is a theological imperative per SRF's mission to serve "all of humanity" and the DELTA framework's Dignity principle.

| Approach | Cost | Risk |
|----------|------|------|
| **Milestone 2a (build in)** | Low — semantic HTML, ARIA, keyboard nav are free if done from the start | None — this is best practice |
| **Late retrofit** | High — requires auditing and rewriting markup, fixing tab order, adding ARIA after the fact | Significant — inaccessible patterns get baked into components and propagated |

### Decision

Make **core accessibility** a **Milestone 2a** requirement from the start. Later arcs add the audit and polish milestone (professional WCAG audit, native TTS, advanced reading mode), not the "add accessibility" milestone.

**Milestone 2a accessibility requirements:**

| Category | Requirements |
|----------|-------------|
| **Structure** | Semantic HTML (`<article>`, `<nav>`, `<main>`, `<header>`, `<footer>`). ARIA landmark regions. Strict heading hierarchy (`h1` → `h2` → `h3`). Skip-to-content link. |
| **Vision** | All text meets WCAG AA contrast ratios (4.5:1 body, 3:1 large). Alt text on all images. Text reflows at 200% zoom. Font size control (A-/A+). Respect `prefers-contrast: more`. No color-only meaning. |
| **Motor** | Full keyboard navigation. Visible focus indicators. 44×44px minimum touch targets. No hover-only interactions. No time-limited interactions (Quiet Corner timer is optional). |
| **Hearing** | Quiet Corner chime has visual equivalent (gentle brightness change + text). Request corrected YouTube captions from SRF. |
| **Cognitive** | Consistent navigation. No autoplay. No flashing. Clear UI language. Respect `prefers-reduced-motion`. Predictable behavior. |
| **Performance** | < 100KB initial load. Lazy-loaded images. `font-display: swap`. Progressive enhancement. |
| **Reading** | Basic reading mode: font size adjustment, line spacing control, dark mode toggle for evening reading. |

**Later arcs (Accessibility Audit & Polish):**
- Professional WCAG 2.1 AA audit (automated + manual + real assistive technology users)
- Native TTS "Listen" button in the reader (Web Speech API)
- Advanced reading mode (sepia, custom fonts, reading ruler)
- Testing with VoiceOver, NVDA, JAWS, TalkBack
- Testing on low-end devices and slow networks
- Remediation of any audit findings

### Critical: Color Contrast Fix

The existing design tokens have contrast failures that must be corrected before any implementation:

| Combination | Current Ratio | Required | Fix |
|-------------|--------------|----------|-----|
| `--portal-text-muted` (#6B6B6B) on `--portal-bg` (#FAF8F5) | 4.1:1 | 4.5:1 | Darken to `#595959` (5.3:1) |
| `--portal-text-muted` (#6B6B6B) on `--portal-quote-bg` (#F9F6F1) | 3.9:1 | 4.5:1 | Same fix — `#595959` |
| `--srf-gold` (#DCBD23) as text on `--portal-bg` (#FAF8F5) | 2.4:1 | 3:1 (large) | Gold is for borders/accents only, never text on light backgrounds |

### Rationale

- **Theological:** SRF's mission is to serve all of humanity. "All" includes people with disabilities.
- **DELTA Dignity:** Treating users as inherently worthy means not excluding them through inaccessible design.
- **Practical:** Semantic HTML and keyboard navigation take no extra effort when done from the start. They take massive effort to retrofit.
- **Legal:** WCAG compliance is increasingly a legal requirement in the US (ADA), EU (European Accessibility Act), and other jurisdictions.
- **SRF precedent:** The SRF app already invested in screen reader support. The portal should meet or exceed that standard.

### Consequences

- Every component built in Arc 1 and Milestone 2a must pass basic accessibility checks (Lighthouse, axe DevTools)
- The design token `--portal-text-muted` must be corrected to `#595959` before implementation begins
- `--srf-gold` must never be used as text on light backgrounds
- Later accessibility arcs handle audit and polish (not build-from-scratch), plus TTS and professional audit

---

---

## ADR-004: Architecture Longevity — 10-Year Design Horizon

- **Status:** Accepted
- **Date:** 2026-02-17

### Context

The teaching portal serves Yogananda's published works — content that is timeless. The portal itself should be designed for a decade of service. This doesn't mean nothing changes; it means nothing needs to be thrown away and rebuilt from scratch. Every component should be replaceable incrementally.

This ADR documents the longevity analysis and the specific design choices that protect the portal's long-term viability.

### Decision

Design for **graceful evolution** over a 10-year horizon. The architecture prioritizes durable formats and replaceable components.

#### Durability Tiers

**Tier 1 — Effectively Permanent (10+ years, no migration expected):**

| Component | Why It Lasts |
|-----------|-------------|
| PostgreSQL (Neon) | 35+ years old. Industry standard. Growing adoption. |
| SQL migrations (dbmate) | Raw SQL. No framework dependency. A 2026 migration runs in 2036. |
| The data model (books, chapters, chunks, themes, places) | The content is Yogananda's published works. The schema models reality. |
| REST + JSON APIs | HTTP is the internet's substrate. 20+ years dominant. |
| HTML + CSS | The web platform is permanent. Semantic HTML from 2026 renders in 2036. |
| Terraform HCL | Since 2014. Massive enterprise adoption. OpenTofu fork as insurance. |
| ADRs (DECISIONS.md) | Markdown in Git. The most durable artifact in the project. |
| WCAG accessibility standards | 2.1 stable since 2018. 3.0 is backwards-compatible. |

**Tier 2 — Stable, May Need Version Upgrades (5-7 years):**

| Component | Risk | Mitigation |
|-----------|------|------------|
| pgvector | Extension is PostgreSQL-native. Strong momentum. | Standard float arrays. No proprietary format. |
| Embedding models | AI model landscape evolving rapidly. | `embedding_model` column tracks which model generated each vector. Incremental re-embedding. (ADR-046) |
| next-intl | Popular i18n library for Next.js. | Locale JSON files are framework-agnostic. The files survive even if the library changes. |

**Tier 3 — Expect Replacement in 5-10 Years:**

| Component | Risk | Mitigation |
|-----------|------|------------|
| Next.js | JS framework churn cycle: 5-7 years. | Shared service layer (ADR-011). Business logic in `/lib/services/` has zero framework dependency. UI rewrite against same APIs. |
| Vercel | Platform risk. Pricing changes. Acquisition. | Next.js deploys to any Node.js host. Vercel-specific features (ISR, Edge) have equivalents elsewhere. |
| Contentful | CMS market volatility. Pricing increases. | Content synced to Neon. Search index doesn't depend on Contentful availability. Swap CMS, rebuild webhook sync. |
| Auth0 | Acquired by Okta. Pricing trajectory. | Standard OAuth 2.0 / OIDC. Any identity provider implements the same protocols. |
| Claude API | Anthropic's product direction. AI market evolution. | Stateless usage (query expansion, passage ranking). Prompts in service layer. Swap to any LLM. |
| Amplitude | Analytics tool churn. | DELTA allowlist = ~5 events. Trivial to migrate to any analytics tool. |

#### The Five Longevity Guarantees

1. **All data in PostgreSQL.** Nothing lives exclusively in a SaaS tool. Contentful syncs *to* Neon. Amplitude receives *from* the app. If any SaaS tool disappears, the data is in PostgreSQL.

2. **Business logic is framework-agnostic.** `/lib/services/` is pure TypeScript. No Next.js imports. No Vercel imports. A framework migration rewrites the UI layer (~40% of code), not the business logic (~60%).

3. **Raw SQL migrations.** dbmate migrations are `.sql` files that don't depend on an ORM version, a TypeScript compiler version, or a framework version. They outlive everything else in the codebase.

4. **Standard protocols, not proprietary integrations.** OAuth 2.0 for auth. REST + JSON for APIs. SQL for data. HTTP for communication. `hreflang` for i18n. Every integration uses industry standards, not vendor-specific SDKs, at the boundary layer.

5. **Decisions are documented.** ADRs capture *why* every choice was made. When a future team evaluates replacing a component, they understand the original constraints and can make an informed decision rather than guessing.

#### Content Export Capability

The portal can export its entire content graph at any time via standard PostgreSQL tools:

```bash
# Full data export
pg_dump --format=custom --no-owner portal_db > portal_export.dump

# Restore to any PostgreSQL instance
pg_restore --no-owner -d new_portal_db portal_export.dump
```

This is inherent in using PostgreSQL — not a feature to build, but a capability to document and protect. The export includes all books, chapters, chunks, embeddings, themes, places, passage cross-references, and subscriber data.

### Rationale

- **The content is permanent.** Yogananda's published works don't change. A portal that makes them accessible should outlive any single technology trend.
- **SRF institutional continuity.** SRF has existed since 1920. The portal should be designed for an organization that thinks in decades, not quarters.
- **Total cost of ownership.** A 10-year architecture that evolves incrementally costs far less than a 5-year architecture that requires a ground-up rewrite.
- **The service layer is the key insight.** Most web applications that "don't last" failed because business logic was embedded in a framework that became obsolete. The shared service layer (ADR-011) is the single most important longevity decision — it separates what endures (logic) from what changes (presentation).

### Consequences

- All architectural decisions are evaluated against a 10-year horizon, not just immediate needs
- The shared service layer convention (ADR-011) is treated as the project's most important structural rule
- Component replacement is expected and planned for — it's maintenance, not failure
- The search quality test suite (deliverable M1a-8) serves as the acceptance gate for any AI model migration
- Future developers can replace any Tier 3 component without touching Tier 1 or Tier 2 components
- `pg_dump` export capability is documented as a deliberate architectural feature

---

---

## ADR-005: Claude AI Usage Policy — Permitted Roles, Prohibited Uses, and Expansion Roadmap

**Status:** Accepted | **Date:** 2026-02-18

### Context

Claude API is used throughout the portal in carefully constrained roles. The governing metaphor — "the AI is a librarian, not an oracle" (ADR-001) — is well-established, but the specific permitted uses, hard prohibitions, and future expansion opportunities were scattered across ADR-001, ADR-014, ADR-092, ADR-078, and ADR-032 with no single authoritative reference. This created two risks:

1. **Scope creep:** An engineer might add a chatbot or synthesis feature because "Claude can do it" without understanding the theological constraints.
2. **Scope fear:** An engineer might avoid a valuable Claude use case because the boundaries weren't clear.

This ADR consolidates the Claude AI policy into a single reference and establishes the roadmap for high-value expansions that stay within the librarian model.

### The Librarian Model

Claude's role in the portal follows one principle: **Claude helps seekers find the verbatim published words of Yogananda and all SRF-published authors. Claude never speaks for any of them.** (PRO-014: scope extends to all author tiers.)

Every permitted use falls into one of three categories:

| Category | What Claude Does | Output Format | Human Review Required? |
|----------|-----------------|---------------|----------------------|
| **Finding** | Locates the right passages for a seeker's need | JSON (IDs, terms, scores) | No — output is search infrastructure, not content |
| **Classifying** | Categorizes passages by theme, intent, accessibility, tone | JSON (labels, scores) | Yes — classification affects what users see |
| **Drafting** | Generates non-sacred text (UI strings, captions, alt text) | Draft text files | Yes — mandatory human review before publication |

### Hard Prohibitions (Theological, Non-Negotiable)

These prohibitions are absolute and permanent. No milestone, feature, or stakeholder request overrides them.

Claude **never**:

1. **Generates text that could be mistaken for any SRF-published author's words.** Not even summaries, not even "in the style of." The portal displays only verbatim published text across all author tiers (PRO-014).
2. **Paraphrases, summarizes, or synthesizes across passages.** A seeker reads the author's actual sentences, not Claude's interpretation of them.
3. **Translates any SRF-published author's text.** Only official SRF/YSS human translations are served. Machine translation of sacred text is never acceptable for any author tier — "inviolable constraint, not a cost optimization" (ADR-078, PRO-014).
4. **Interprets meditation techniques or spiritual practices.** Kriya Yoga technique instructions and SRF Lesson content are permanently out of scope. Claude must not explain, summarize, or advise on spiritual techniques. Note: Yogananda's *published descriptions* of Kriya Yoga (e.g., Autobiography Ch. 26) are part of the corpus and surfaced normally as search results and theme page content — these are public descriptions, not technique instruction. Claude may find and rank these passages but must not interpret them as practice guidance. (ADR-104)
5. **Acts as a conversational agent or chatbot.** No dialogue, no follow-up questions, no "let me help you explore that further." The seeker interacts with the search bar, not with Claude.
6. **Answers questions directly.** Claude finds passages that answer questions. It does not formulate answers itself.
7. **Profiles or personalizes based on user behavior.** DELTA Agency principle — the AI facilitates access, it does not shape the experience based on behavioral data.
8. **Generates voice, image, or video that represents or could be mistaken for Yogananda or the lineage gurus.** No voice cloning, no synthetic portraits, no AI-animated photographs, no deepfake video. AI-generated descriptions *about* sacred media (alt text, captions) are permitted under Category: Drafting with mandatory human review. See ADR-015 for the full three-tier media integrity policy.

### Currently Permitted Uses

| # | Use Case | Milestone | Category | ADR | Description |
|---|----------|-----------|----------|-----|-------------|
| C1 | Query expansion | 1a | Finding | ADR-014 | Expands conceptual queries into semantic search terms. Returns JSON array of terms only. Optional — bypassed for simple keyword queries. |
| C2 | Passage ranking | 1a | Finding | ADR-014 | Given user's question + 20 candidate passages, selects and ranks the 5 most relevant. Returns JSON array of passage IDs only. |
| C3 | Highlight boundaries | 1a | Finding | ADR-014 | Identifies which sentences within a chunk best answer the query. Returns character offsets. |
| C4 | Theme classification | 3b | Classifying | ADR-032 | Classifies ambiguous passages into teaching topics. Optional — supplements embedding similarity for borderline cases. Mandatory human review before tags are served. |
| C5 | UI translation drafting | 5b | Drafting | ADR-078 | Translates UI chrome and portal-authored content (NOT Yogananda's text). Draft files undergo mandatory human review by fluent, SRF-aware reviewers. |
| C6 | Social caption drafting | Arc 4 | Drafting | ADR-092 | Generates suggested captions for daily quote images. Human reviews and posts — never auto-post. |

### Approved Expansion: High-Value Claude Uses

The following use cases have been evaluated against the librarian model and approved for inclusion in the roadmap. Each stays within the Finding/Classifying/Drafting categories and respects all prohibitions.

#### E1: Search Intent Classification (Arc 1)

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
| `practice_inquiry` | "how to practice Kriya Yoga", "learn meditation technique", "Kriya Yoga technique" | Route to Practice pathway (`/guide#practice`) or Kriya Yoga theme page. Display practice bridge note: formal instruction available through SRF. Never return raw passages that could be misread as technique instruction. (ADR-104) |

**Implementation:** Lightweight classification call before the main search pipeline. Returns a JSON intent label + optional routing hint. Falls back to standard hybrid search if classification is uncertain.

**Why this matters:** The difference between a good search engine and a world-class one is understanding *what kind of answer the person needs*. A seeker typing "I'm scared" at 2 AM needs a different experience than one typing "fear Yogananda quotes."

#### E2: Spiritual Terminology Bridge (Arc 1)

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

**Per-book evolution (ADR-129):** The Vocabulary Bridge is a living glossary, not a static artifact. Each book ingestion triggers a vocabulary extraction step: Opus scans the new book's chunks across three extraction categories (modern-to-Yogananda mappings, Sanskrit inline definitions, cross-tradition terms) and proposes additions. The bridge carries source provenance — which book introduced which mapping — enabling source-aware query expansion. See ADR-129 § Per-Book Evolution Lifecycle.

**Why this matters:** The portal serves Earth's population. Most seekers worldwide have never read Yogananda. They arrive with the vocabulary of their own tradition, their therapist, or their Google search. If the portal can only find passages using Yogananda's exact terminology, it fails the people who need it most.

#### E3: Passage Accessibility Rating (Milestone 2b)

**Category:** Classifying | **Cost:** ~$0.01/chunk (one-time at ingestion) | **Human review:** Spot-check (see ADR-100 for maturity stage definitions — starts at Full Review, graduates to Spot-Check per governed criteria)

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

#### E4: Ingestion QA Assistant (Arc 1)

**Category:** Classifying | **Cost:** ~$0.05/book (one-time) | **Human review:** No — Claude validates autonomously

During ingestion QA, Claude pre-screens ingested text and flags:

- Probable OCR errors ("Ood" → likely "God," "mediiation" → "meditation")
- Inconsistent formatting (straight quotes mixed with smart quotes, inconsistent dashes)
- Truncated passages (chunk ends mid-sentence, suggesting a chunking boundary error)
- Sanskrit diacritics that may have been mangled by PDF extraction
- Passages that appear to be headers, footnotes, or page artifacts rather than body text

**Implementation:** Batch job that processes all chunks for a book and outputs a QA report (JSON) with flagged chunks and suggested corrections. Claude validates autonomously — applying corrections within confidence thresholds and flagging edge cases for human review only when confidence is low.

**Why this matters:** The entire portal rests on text quality. OCR errors in spiritual terminology (e.g., "Kriya" misread as "Krlya") silently degrade search retrieval. Catching these before publication protects the foundation everything else is built on.

#### E5: Search Quality Evaluation Judge (Arc 1)

**Category:** Classifying | **Cost:** ~$0.10/evaluation run | **Human review:** No (CI infrastructure)

Automate the search quality evaluation (Deliverables M1a-8 and M1b-2) by using Claude as the evaluator. The evaluation uses a bilingual golden set of ~81 queries (~66 English, ~15 Spanish) across seven difficulty categories (Direct, Conceptual, Emotional, Metaphorical, Technique-boundary, Dark Night, Adversarial). The Dark Night category (~8 queries) tests fragmentary, distressed queries against the Vocabulary Bridge's state mappings and retrieval intent routing (ADR-129). Hindi queries (~15) added when Hindi activates in Milestone 5b. Full methodology, data format, metrics, and CI integration specified in DES-058.

**Evaluation approach:** Substring matching resolves expected passages deterministically. For results not matching expected passages, Claude Opus judges relevance (HIGH / PARTIAL / NOT_RELEVANT). Opus is used as the evaluation judge (ADR-014) because judging whether a retrieved passage meets a seeker's emotional state requires the same reasoning depth as the enrichment itself. For Dark Night queries, Opus additionally judges retrieval intent match — does the passage console rather than instruct? Does it acknowledge rather than advise?

**Metrics:** Recall@3 per category (primary gate: ≥ 80% overall), MRR@10 (secondary diagnostic), adversarial routing accuracy (target: 100%).

**Implementation:** `/scripts/eval/search-quality.ts`. CI job runs on PRs touching search-affecting paths (`/lib/services/search/`, `/lib/prompts/`, `/lib/config.ts`, `/migrations/`, `/data/eval/`). Posts per-category summary on PR. Fails if Recall@3 drops below 80% or Technique-boundary routing drops below 100%. Golden set data in `/data/eval/golden-set-{lang}.json`.

**Why this matters:** As the corpus grows (Milestone 3a through Arc 3) and the search pipeline evolves, automated regression testing ensures quality doesn't silently degrade. Per-category breakdowns reveal *where* search needs improvement — enabling targeted tuning rather than blind iteration.

#### E6: Cross-Book Conceptual Threading (Milestone 3c)

**Category:** Classifying | **Cost:** ~$0.50/book pair (one-time) | **Human review:** Spot-check (see ADR-100 for maturity stage definitions)

Enhance `chunk_relations` (ADR-050) with conceptual understanding. Vector similarity finds passages about the same *topic*, but Claude can distinguish:

| Relation Type | Example | What It Enables |
|---------------|---------|-----------------|
| `same_topic` | Two passages about courage | Standard related teaching (already handled by embeddings) |
| `develops_further` | Autobiography mentions self-control briefly; Man's Eternal Quest has a full chapter | "Yogananda explores this idea at greater length in..." |
| `personal_story` | A teaching principle + an autobiographical illustration of it | "Yogananda shares a personal experience of this in..." |
| `practical_application` | A philosophical passage + a concrete technique or affirmation | "For a practical approach to this teaching, see..." |

**Implementation:** During chunk relation computation (Milestone 3c, Deliverable 5.1), for the top 10 most similar cross-book passages per chunk, Claude classifies the relation type. Stored as a `relation_type` column on `chunk_relations`. Used to diversify the "Continue the Thread" suggestions and add context labels in the side panel.

**Why this matters:** This is what a human librarian does that a search engine cannot. "If you liked this passage about courage, here's where he tells the story of his own test of courage" — that's a world-class reading experience. No physical book, no PDF, no ebook can do this.

#### E7: Photograph Alt Text (Milestone 2a)

**Category:** Drafting | **Cost:** ~$0.01 total (one-time, <20 images) | **Human review:** Yes

Generate reverential, descriptive alt text for the portal's Yogananda photographs (About page, footer, book covers):

- Rich descriptions for screen readers (not just "Photo of Yogananda" but "Paramahansa Yogananda seated in lotus position, eyes gently closed in meditation, wearing an ochre robe, circa 1935")
- Tone: warm, respectful, consistent with the portal's devotional register
- One-time batch at build time, reviewed by SRF editors

**Why this matters:** Direct accessibility improvement for visually impaired seekers. A portal that claims accessibility as a foundational principle should describe its sacred images with the same care it gives to its text.

#### E8: Daily Passage Tone Classification (Milestone 2b)

**Category:** Classifying | **Cost:** ~$0.01/chunk (one-time at ingestion) | **Human review:** Spot-check (see ADR-100 for maturity stage definitions)

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

- **"Challenging"** — In guru-disciple traditions, stern teaching is considered the *highest* compassion (*guru-kṛpā*), not a separate emotional register. Indian seekers may not experience "challenging" passages as distinct from "consoling" ones.
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
| Arc 4 | C6 | ~$1/month | Daily caption |
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
| **Chatbot mode alongside librarian mode** | Offer a conversational AI experience for seekers who prefer it | Violates ADR-001; hallucination risk with sacred text; contradicts DELTA Agency; creates a "teacher" the portal explicitly refuses to be |
| **Open-ended Claude use** | Allow any use case that doesn't violate the hard prohibitions | Too permissive; "not explicitly forbidden" is not the same as "aligned with the mission." Every use case should be evaluated against the librarian model. |
| **No Claude expansion** | Keep only C1–C6; don't add E1–E8 | Misses genuinely valuable uses (intent classification, terminology bridge, accessibility rating) that serve seekers within existing theological constraints |

### Consequences

- ADR-001 (Direct Quotes Only) and ADR-014 (AWS Bedrock Claude with Model Tiering) remain the foundational references; this ADR consolidates and extends them
- The three-category model (Finding / Classifying / Drafting) provides a clear framework for evaluating future Claude use cases
- E1 (intent classification) and E2 (terminology bridge) are added to Arc 1 deliverables — they directly improve search quality at launch
- E3 (accessibility rating) and E8 (tone classification) are added to Milestone 2b — they require multi-book content to be meaningful
- E4 (QA assistant) and E5 (eval judge) are added to Arc 1 — they improve quality foundations
- E6 (cross-book threading) is added to Milestone 3c — it enhances the Related Teachings system
- E7 (alt text) is added to Milestone 2a — it's an accessibility deliverable
- The Vocabulary Bridge (ADR-129) is a living glossary that deepens with each book, backed by the `vocabulary_bridge` PostgreSQL table.
- Every new Claude use case proposed in future milestones should be evaluated against this ADR's three-category model and hard prohibitions
- **Extended ADRs:** ADR-001 (cross-reference to this policy), ADR-014 (cross-reference to expansion roadmap)

---

---

## ADR-006: Global-First — Serving Earth's Underserved Seekers

**Status:** Accepted | **Date:** 2026-02-19

### Context

The portal's mission — making Yogananda's teachings "available freely throughout the world" — is not satisfied by building a fast website in English and translating it later. "The world" includes:

- A seeker in rural Bihar with a JioPhone on 2G, paying per megabyte
- An elderly devotee in São Paulo who shares a smartphone with her family
- A yoga practitioner in Lagos accessing the portal from a cybercafé
- A Bengali-speaking YSS member who has never used a website in their own language
- A visually impaired monk in Germany who navigates entirely by screen reader

ADR-003 established accessibility as a Milestone 2a foundation. ADR-075 established multilingual architecture. ADR-012 established the PWA for offline reading. This ADR addresses the gaps between those decisions — the practical realities of serving seekers who are not well-served by the default assumptions of Western web development.

### Decision

Adopt the following design constraints and features as explicit commitments, not aspirational goals:

#### 1. Data Cost Awareness

In Sub-Saharan Africa, South Asia, and Southeast Asia, mobile data is not unlimited. Seekers pay per megabyte. A page that loads fast on 3G may still be too expensive if it costs 500KB per visit.

**Commitments:**
- Homepage initial payload: **< 50KB** (HTML + critical CSS + inline JS). The current 100KB JS budget (ADR-003) is an upper bound for the full app shell; the homepage must be lighter.
- **Text-only mode toggle** in the site footer and in reader settings. When enabled: no images, no decorative elements, no web fonts (system serif stack), no OG preview generation. Stored in `localStorage`. This is not a degraded experience — it is a *considered* experience for seekers who cannot afford decorative bytes.
- **Aggressive caching headers.** Book content changes rarely. Chapters served with `Cache-Control: public, max-age=31536000, immutable` (1 year) and content-hashed URLs. Repeat visits and chapter-to-chapter navigation cost zero data after first load.
- Print stylesheets load only when `@media print` matches — zero cost during normal browsing.

#### 2. Device Spectrum

Not all seekers have smartphones. KaiOS (JioPhone, Nokia feature phones) runs a basic browser with limited JavaScript support.

**Commitments:**
- **Progressive enhancement is mandatory, not optional.** The reading experience (book text, chapter navigation, search form submission) must work with JavaScript disabled. Server-rendered HTML is the baseline. JavaScript enhances: "Show me another," infinite scroll, Quiet Corner timer, dwell mode.
- **Touch targets remain 44×44px minimum** (ADR-003), but form inputs and navigation links use **48px** minimum on pages likely accessed from feature phones (homepage, search results, book index).
- Feature phone compatibility is ensured through progressive enhancement (semantic HTML, no JS-required flows), not through dedicated CI testing. The progressive enhancement commitment covers KaiOS-class browsers by construction.

#### 3. Shared Devices

In many families globally, one phone serves 3–5 people. The portal must not assume a device belongs to a single person.

**Commitments:**
- **No user accounts until Milestone 7a+** — the portal works fully without sign-in, which is already the design. This is correct for shared devices.
- **Bookmarks (ADR-066) use `localStorage`** — they disappear if the browser data is cleared. This is acceptable for Milestone 2b. Milestone 7a+ (user accounts) can optionally sync bookmarks, but the local-first design is correct for shared devices where privacy between users matters.
- **No "Welcome back" or personalization.** The portal greets every visit the same way. No reading history displayed on the homepage. No "Continue where you left off" (which would expose one family member's reading to another).

#### 4. Intermittent Connectivity as the Norm

The PWA (ADR-012) is scheduled for Milestone 2b. Milestone 1c (first production deployment) establishes the baseline: cached static assets and an offline indicator. Seekers with unreliable connections get protection from the day the portal is reachable.

**Commitments:**
- **Milestone 1c: Service Worker for app shell.** The app shell (HTML, CSS, JS, fonts) is cached by a minimal Service Worker from the first production deployment. The portal loads instantly on repeat visits. Offline indicator banner from day one.
- **Milestone 2a: Extended caching.** Service Worker enhanced to cover all 2a pages and self-hosted fonts. Integration with text-only mode (skip font caching when text-only enabled).
- **Milestone 2b: Last-read chapter cached.** When a seeker reads a chapter, the chapter HTML is cached in the Service Worker. If connectivity drops, they can re-read that chapter. Not full offline support — just graceful handling of the most common offline scenario (re-reading what you just read).
- **Offline indicator.** When the Service Worker detects no connectivity, a subtle banner appears: *"You're reading offline. Search requires a connection."* Not an error state — a calm acknowledgment. Matches the portal's warm cream palette, not a red warning bar.

#### 5. Community and Group Reading

In India, Latin America, and many African communities, spiritual texts are read aloud in groups — satsang, study circles, family devotions. The portal's reader is designed for individual silent reading.

**Commitments:**
- **Presentation mode (Milestone 2b).** A "Present" button in the reader header. When activated: text enlarges to 24px+ (readable from 2–3 meters), all chrome hides (no header, no sidebar, no share icons), chapter navigation becomes swipe/arrow-key only, warm cream background fills the viewport. The device becomes a digital lectern. *(Pulled from Arc 4 to Milestone 2b — communal reading is the primary engagement mode in Indian, African, and Latin American cultures.)*
- **This is not a separate feature — it is a CSS mode.** The same reader component, the same content, the same accessibility. `data-mode="present"` on the reader container triggers the enlarged, chrome-free layout.

#### 6. Cultural Consultation for Entry Points

The "Seeking..." empathic entry points and theme doors are currently written from an English-language, Western-spiritual perspective. "What happens after death?" is a natural question in one culture but may be phrased as "Where does the soul go?" or "What is the cycle of birth?" in another.

**Commitments:**
- **Milestone 5b (multilingual launch) requires cultural consultation, not just translation.** For each language, SRF engages a native-speaking devotee (not a professional translator) to review the entry points and theme door labels for cultural resonance. The consultant answers: "Would a seeker in [country] phrase this question this way? What would feel more natural?"
- **The "Seeking..." prompts are editorial content, not UI chrome.** They live in Contentful (Arc 4+), not in `messages/{locale}.json`. Each locale has independently authored prompts, not translations of the English originals.
- **Query expansion (Claude API) handles the bridge.** Even if the entry point is culturally adapted, a seeker may still type their question in a culturally specific way. The Vocabulary Bridge (ADR-129) and Claude's query expansion handle the mapping from the seeker's phrasing to the passage corpus.

#### 7. Right-to-Left as a First-Class Layout

CSS logical properties (ADR-076) provide the technical foundation for RTL. But RTL is more than mirrored margins.

**Commitments:**
- **Milestone 5b RTL languages (Arabic, Urdu — if added later) require a native RTL reader to review every page.** Not just CSS mirroring, but visual hierarchy, reading flow, and icon directionality (e.g., a "next chapter" arrow points left in RTL).
- **The share menu, dwell icon, and reader navigation all use `inline-start`/`inline-end` positioning** — already specified in their respective ADRs. This commitment makes the RTL audit a verification exercise, not a redesign.
- **Bidirectional text.** Yogananda quotes in Arabic translation may contain Sanskrit terms (samadhi, pranayama) in Latin script. The portal must handle `dir="auto"` on passage elements to allow mixed-direction text within a single paragraph.

#### 8. Font Loading Strategy for Global Scripts

Web fonts improve typography but add data cost. The current design uses Google Fonts (Merriweather, Lora, Open Sans). Non-Latin scripts require additional font files that can be large (CJK: 2–5MB per weight).

**Commitments:**
- **`font-display: swap` on all web fonts.** Text renders immediately in the system font stack; web fonts swap in when loaded. No invisible text, no layout shift, no blank screen while fonts download.
- **Unicode-range subsetting for non-Latin scripts.** Google Fonts provides automatic subsetting. Only the glyphs needed for the current page are downloaded. A Hindi page does not download Latin glyphs; a Japanese page does not download Devanagari glyphs.
- **Text-only mode (commitment 1) uses system fonts exclusively.** No web font downloads at all. This is the maximum data-saving option.
- **Critical text (passage content, citations) uses the system serif stack as fallback** — not a sans-serif default. `font-family: Merriweather, 'Noto Serif', Georgia, 'Times New Roman', serif` ensures the reading experience is typographically appropriate even before web fonts load.

### Rationale

These commitments exist because the portal's mission is theological, not commercial. "Freely throughout the world" is not a marketing tagline — it is a directive from Yogananda himself (*Autobiography of a Yogi*, Chapter 35: "Whenever anyone, anywhere, shall utter with reverence the name of Babaji, that devotee will instantly attract the Guru's spiritual blessing"). The teachings are for everyone. "Everyone" includes people the Western web industry routinely ignores.

Every commitment above costs nothing or near-nothing at implementation time if incorporated from the start. Retrofitting any of them later is expensive. This is the same argument that justified ADR-003 (accessibility) and ADR-075 (multilingual architecture) — the cheapest time to build for the world is now.

### Consequences

- Homepage payload budget tightened from 100KB to 50KB (HTML + critical CSS + inline JS)
- Text-only mode deployed in Milestone 1c (footer toggle); integrated into reader settings and design system in Milestone 2a
- Minimal Service Worker deployed in Milestone 1c (app shell caching), enhanced in Milestone 2a (all pages + fonts), expanded in Milestone 2b (last-read chapter)
- Low-bandwidth detection banner deployed in Milestone 1c (2G/slow-2G suggestion); extended adaptation in Milestone 2b
- Presentation mode added to the reader in Milestone 2b *(pulled from Arc 4)*
- Cultural consultation budget required for Milestone 5b multilingual launch
- RTL design review by native reader required before any RTL language goes live
- `font-display: swap` and unicode-range subsetting are non-negotiable for all font loading
- **Extends ADR-003** (accessibility), **ADR-075** (multilingual), and **ADR-012** (PWA) with concrete global equity commitments

---

---

## ADR-007: Curation as Interpretation — The Fidelity Boundary and Editorial Proximity Standard

- **Status:** Accepted
- **Date:** 2026-02-21
- **Relates to:** ADR-001, ADR-092, ADR-032, ADR-005, DES-026, DES-028, ADR-083, ADR-049, ADR-071, ADR-086, DES-047, ADR-059

### Context

ADR-001 established the foundational constraint: the portal displays only the verbatim published words of SRF-published authors and never generates, paraphrases, or synthesizes content. This applies to all three author tiers (PRO-014: guru, president, monastic). The constraint is architecturally enforced (JSON-only AI output, human review gates, content integrity hashing) and has been consistently applied across all subsequent ADRs.

However, as the portal's feature surface has grown — editorial reading threads (DES-026), theme classification (ADR-032), daily passage selection, calendar-aware surfacing (DES-028), search suggestions with vocabulary bridging (ADR-049), community collections (ADR-086), the `/guide` page (DES-047), and chant metadata (ADR-059) — two gaps have emerged:

1. **Curation as interpretation.** Every act of selecting, ranking, grouping, or sequencing passages is an interpretive act, even when the passages themselves are verbatim. The design mitigates this per-feature but has never named the tension explicitly as an architectural principle. Without a named principle, each new feature re-invents its own fidelity boundary rather than inheriting a shared standard.

2. **Editorial proximity.** Multiple features place portal-authored prose (editorial notes, glossary definitions, search hints, crisis resources, social captions, magazine articles, chant instructions) within visual proximity of sacred text. Each feature's ADR specifies its own separation rules, but no unified standard governs the shared boundary between Yogananda's words and the portal's voice. This risks inconsistency as features accumulate.

### Decision

1. **Name the tension.** The portal formally recognizes that **curation is a form of interpretation** — selection, ranking, theming, and sequencing shape how seekers encounter the teachings, even when the text is unaltered. This is a permanent and productive tension, not a problem to eliminate. The discipline is to curate *honestly*: selecting without distorting, arranging without editorializing, surfacing without implying that the unsurfaced is less important.

2. **Establish curation mitigations as a named pattern.** All curatorial features must satisfy four conditions:
 - **Corpus-derived, not behavior-derived.** Curation algorithms draw from the text itself (embeddings, extracted vocabulary, editorial taxonomy), never from user engagement patterns.
 - **Human review at every gate.** No curatorial decision reaches seekers without human verification.
 - **Transparent framing.** The selection mechanism (a theme label, a date, a search query, a curator name) is visible to the seeker, not hidden behind an opaque algorithm.
 - **Context always available.** Every curated passage links to its full chapter context via "Read in context."

3. **Establish the Editorial Proximity Standard.** A cross-cutting section in DESIGN.md (§ Editorial Proximity Standard) defines unified visual and structural rules for how portal-authored prose (not from any SRF-published author) behaves when it appears near sacred text. The standard governs: visual typography (Merriweather for SRF-published author text across all author tiers, Open Sans for editorial/functional prose), structural separation (`<article>`/`<section>` boundaries), attribution requirements including full author name (PRO-014), accessibility announcements, and a maximum editorial-to-sacred-text content ratio.

### Alternatives Considered

1. **Continue per-feature fidelity rules.** Each ADR already specifies its own boundary mechanisms. This works but creates drift risk as the feature count grows. A maintainer adding a new feature in year 5 would need to survey a dozen ADRs to understand the pattern, rather than inheriting a single standard.

2. **Prohibit all non-Yogananda prose near sacred text.** This would eliminate the proximity problem entirely but would also eliminate editorial reading threads, glossary definitions, the `/guide` page, and crisis resources — features that serve seekers by providing context without altering content.

3. **Create a runtime content-type enforcement layer.** A technical system that tags every rendered element as "sacred" or "editorial" and enforces separation rules via CSS/HTML validation. Architecturally sound but premature for Arc 1 — the standard should be a design principle first and a technical enforcement later if drift is observed.

### Consequences

- New subsection "Curation as Interpretation: The Fidelity Boundary" added to CONTEXT.md § Theological and Ethical Constraints. This elevates an implicit understanding to an explicit design principle.
- New cross-cutting section "Editorial Proximity Standard" added to DESIGN.md, governing all features that place portal prose near sacred text. Component developers implementing any governed feature (search results, reading threads, glossary, daily email, social media, magazine, `/guide`, crisis resources, study workspace, chant reader, community collections) must follow the standard.
- Three new open questions added to CONTEXT.md: edition variance policy, spiritual terminology bridge governance, and fidelity re-validation cadence.
- Future ADRs introducing features that curate or frame sacred text must reference this ADR and specify which Editorial Proximity Standard rules apply.
- The CLAUDE.md maintenance table should include "editorial proximity" alongside multilingual, accessibility, and DELTA as a cross-cutting concern.

---

---

## ADR-015: Verbatim Media Fidelity — Cross-Modal Content Integrity

**Status:** Accepted (Foundational) | **Date:** 2026-02-25
**Context:** ADR-001 (direct quotes only), ADR-005 (Claude AI usage policy), ADR-042 (sacred image guidelines), ADR-057 (audio), ADR-058 (AI audio generation), Principles 1 and 2

### Context

Principles 1 and 2 — "Direct Quotes Only" and "Full Attribution Always" — establish that Yogananda's words must be transmitted verbatim, with full citation, and never generated, paraphrased, translated, or synthesized by AI. These principles were authored when "content" implicitly meant text. As the portal evolves into cross-media territory (Arc 6: video, audio, images), the same theological reasoning must govern all modalities.

If paraphrasing Yogananda's words is prohibited because even subtle changes distort the meaning of a realized master's teachings, then:

- **AI voice synthesis** reading his words imposes synthetic prosody, emphasis, and emotional register on sacred text — a form of paraphrasing in the vocal medium.
- **AI-generated images** of the gurus are synthetic representations of realized masters — objects of devotion fabricated by a machine.
- **AI-generated video** of the gurus constitutes deepfake territory — theologically impermissible regardless of intent.
- **AI voice cloning** of Yogananda's voice is the most extreme violation: manufacturing the Master's speech from patterns rather than preserving his actual recordings.

ADR-058 correctly permits AI audio generation for UI assets (singing bowl cues, ambient soundscapes), noting that "ADR-001's prohibition applies to Yogananda's words — it does not extend to interface audio." This ADR completes the framework by drawing the line on the sacred side.

### Decision

Establish a **three-tier media integrity policy** governing AI generation across all content modalities.

#### Tier 1: Sacred Source Material — NEVER AI-Generated

Media depicting or representing Yogananda or the lineage gurus (Mahavatar Babaji, Lahiri Mahasaya, Swami Sri Yukteswar) in any modality is never AI-generated, cloned, or synthetically produced. This is absolute and permanent.

| Prohibition | Scope |
|------------|-------|
| No AI-generated voice of the gurus | No voice cloning, no synthetic speech impersonating or imitating the gurus' voices. Yogananda's actual voice recordings (ADR-057, `is_yogananda_voice` flag) are sacred artifacts — preserved, never synthesized. |
| No AI-generated images of the gurus | No synthetic portraits, no AI-animated photographs, no AI "enhancement" that alters appearance. The 16 official photographs (ADR-042) are the canonical visual record. |
| No AI-generated video of the gurus | No deepfakes, no AI-animated photographs, no synthetic video of any kind depicting the gurus. |
| No AI "enhancement" that alters content | Standard restoration (denoising, stabilization, upscaling) that preserves the original signal is permitted — that is engineering. Generation that adds content not present in the original (colorization that invents colors, audio enhancement that fills gaps with synthetic speech, video interpolation that invents frames with guru content) is prohibited. The line: preservation yes, fabrication no. |

#### Tier 2: Sacred Text Transmission — Human Voices Only

The portal entrusts the vocal transmission of Yogananda's published words to human readers. When the portal provides audio of sacred text (book narration, passage reading, chant performance), that audio must be a human recording.

| Policy | Detail |
|--------|--------|
| Human narration for sacred text | Book readings, passage narration, and chant performances use SRF-approved human readers — monastics, approved lay readers, or professional narrators vetted by SRF. |
| No synthetic TTS for sacred text | The portal does not use text-to-speech engines (cloud or local) to generate audio of Yogananda's words. Synthetic voice trivializes sacred text by imposing machine prosody on a realized master's teachings. |
| User-controlled assistive technology always permitted | Browser screen readers (VoiceOver, NVDA, JAWS), OS-level text-to-speech, and other assistive technology are the user's devices, not the portal's content. The portal's responsibility is to serve accessible semantic HTML and ARIA-compliant markup (ADR-003, ADR-073). What the user's device does with that text is the user's choice and always permitted. |
| AI-generated *descriptions* of sacred media permitted | Alt text, captions, and metadata descriptions for guru photographs and audio recordings fall under ADR-005 Category: Drafting — non-sacred text subject to mandatory human review before publication. Describing a sacred image in words is not generating a sacred image. |

#### Tier 3: Portal Assets — AI Generation Permitted

Non-sacred portal assets follow existing policies. AI generation is one tool among several, evaluated on merit, with mandatory human review.

| Asset Type | Governing ADR | Policy |
|------------|--------------|--------|
| UI sound effects (chimes, cues) | ADR-058 | AI generation permitted. Human review mandatory. |
| Ambient audio (soundscapes, nature) | ADR-058 | AI generation permitted. Human review mandatory. |
| Decorative imagery (nature, patterns, atmosphere) | ADR-042 (non-guru images) | AI generation permitted for non-sacred subjects — landscapes, abstract patterns, nature imagery. Must not depict gurus or represent sacred content. Human review mandatory. |
| UI strings, captions, alt text | ADR-005 (Category: Drafting) | AI drafting permitted. Human review mandatory. |

### Third-Party Signaling

The portal's API metadata, `llms.txt`, and machine-readable content (ADR-081) should signal the prohibition. When third parties consume the corpus via MCP or API (ADR-101), the metadata should include a `media_integrity` field or equivalent indicating that AI voice synthesis, image generation, and video generation of sacred content are prohibited by the content provider's policy. This does not prevent third-party misuse but establishes SRF's position.

### Rationale

- **Theological consistency.** The same reverence that prohibits paraphrasing Yogananda's written words prohibits fabricating his voice, image, or likeness. The principle is modality-independent: sacred transmission must be authentic.
- **Preservation over fabrication.** The portal preserves what exists (voice recordings, photographs, historical video) with the highest fidelity. It does not fill gaps with synthetic substitutes.
- **Graduated policy.** The three-tier structure avoids both over-restriction (banning all AI audio when ADR-058 correctly permits UI sounds) and under-restriction (allowing synthetic guru voices because "it's just TTS"). Each tier has a clear theological rationale.
- **Assistive technology exemption.** Screen readers are the user's tool, not the portal's content. Conflating them with portal-generated TTS would harm accessibility — the opposite of the portal's mission (ADR-003, ADR-006).

### Consequences

- Principles 1 and 2 amended to be media-inclusive (PRINCIPLES.md, CLAUDE.md)
- ADR-005 gains prohibition #8 (cross-media sacred content generation)
- ADR-042 gains explicit AI image generation prohibition for guru imagery
- ADR-058 gains boundary statement cross-referencing this ADR
- PRO-003 (Spoken Teachings — Human Narration Program) updated: human narration as primary path; synthetic TTS not permitted for sacred text
- Future audio features (book narration, Cosmic Chants performance) must use human recordings
- Standard restoration of historical media remains permitted and encouraged
- `media_integrity` metadata field added to API responses when cross-media content types ship (Arc 6+)

---

---

## ADR-008: Next.js + Vercel for Frontend

- **Status:** Accepted
- **Date:** 2026-02-17

### Context

The SRF tech stack designates Next.js on Vercel as the standard frontend stack. The convocation site uses this. No alternative was seriously considered.

### Decision

Use **Next.js on Vercel** with **Tailwind CSS** for the frontend.

### Rationale

- SRF organizational standard
- SSG for book reader pages (fast, SEO-friendly, cacheable)
- API routes for search endpoints (serverless, no separate backend for Arc 1)
- ISR for content updates when Contentful is integrated
- Vercel edge caching for global performance

### Consequences

- Arc 1 can use Next.js API routes instead of AWS Lambda (simpler)
- Production may migrate search API routes to Lambda if needed for scale or separation

---

---

## ADR-009: Neon + pgvector for Vector Search

- **Status:** Accepted
- **Date:** 2026-02-17

### Context

The Intelligent Query Tool requires semantic (vector) search to find thematically relevant passages even when the user's wording differs from Yogananda's. Options evaluated:

| Option | Pros | Cons |
|--------|------|------|
| **Neon + pgvector** | Already in SRF stack; vector + FTS + relational in one DB; Scale tier provides 30-day PITR, protected branches, OTLP export; no vendor sprawl | Not a purpose-built vector DB; HNSW index tuning required |
| **Pinecone** | Purpose-built vector search; managed; fast | New vendor; no relational data; no FTS; cost at scale; sync complexity |
| **Weaviate / Qdrant** | Strong vector search; hybrid search built-in | New vendor; operational overhead if self-hosted; overkill for corpus size |
| **Supabase** | Postgres + pgvector + auth + storage all-in-one | SRF chose Neon, not Supabase; diverges from established stack |

### Decision

Use **Neon PostgreSQL with the pgvector extension** for both relational data and vector search. Combine with pg_search / ParadeDB BM25 (ADR-114) for hybrid retrieval.

### Rationale

- Neon is already in the SRF tech stack (established by the AE team)
- Avoids introducing a new vendor for a corpus of this size (~10-50K chunks)
- Hybrid search (vector + FTS) in a single SQL query is architecturally simple
- The Neon MCP server is available for development workflows
- pgvector's HNSW index performs well at this scale
- Single database eliminates synchronization problems between stores

### Consequences

- Must enable the `vector` extension in Neon
- Must choose an embedding model whose dimensions align with the vector column
- Performance at very large scale (millions of chunks, many languages) may eventually require a dedicated vector service — but that is far beyond Arc 1 scope

---

---

## ADR-010: Contentful as Editorial Source of Truth

- **Status:** Implemented — see `scripts/ingest/import-contentful.ts`, `app/api/v1/webhooks/contentful/route.ts`, `lib/contentful.ts`
- **Date:** 2026-02-17

### Context

Book text needs to live somewhere with editorial management: version control, review workflows, multi-language support, and a non-technical editing interface. The SRF tech stack designates Contentful as the standard headless CMS. The convocation site (convocation.yogananda.org) already proves this pattern works.

| Option | Pros | Cons |
|--------|------|------|
| **Contentful** | SRF standard; editorial workflow; locales; Rich Text AST is parseable for chunking; convocation site proves pattern | Cost at scale; not a search engine |
| **Neon only** | Simplest; no sync complexity; full control | No editorial UI (would need Retool); no version history; no localization workflow |
| **Sanity.io** | Excellent DX; real-time collaboration | Not in SRF stack; would diverge from organizational standard |
| **Strapi (self-hosted)** | Open-source; full control; no per-record pricing | Operational overhead; not in SRF stack; no edge CDN |

### Decision

Use **Contentful** as the editorial source of truth from Arc 1. Contentful is a hard requirement — the portal adopts it from the first arc, not as a later migration. Book text is imported into Contentful during ingestion and synced to Neon (via batch script in Milestone 1a, webhook-driven from Milestone 1c) for search indexing. The book reader serves content from Contentful; search queries Neon.

### Rationale

- Aligns with SRF's established technology standard
- Demonstrates the pattern for stakeholders (reusable across all SRF properties)
- Content editors work in a familiar, managed environment
- Multi-language support via Contentful locales
- Separation of concerns: Contentful for authoring, Neon for searching
- Adopting from Arc 1 avoids a costly later migration of 15+ books and all editorial workflows
- Capacity sufficient for single-book Arc 1; evaluate tier needs at Milestone 3a (multi-book)

### Consequences

- Milestone 1a requires Contentful space setup and content model creation (Book → Chapter → Section → TextBlock)
- Ingestion pipeline imports processed text into Contentful via Management API, then syncs to Neon for search
- The Neon schema includes `contentful_id` columns for linkage — populated from Arc 1, not deferred
- A Contentful → Neon sync service is needed: batch script in Milestone 1a, webhook-driven from Milestone 1c on Vercel
- Contentful capacity sufficient for one book (~3K TextBlocks); evaluate tier needs at Milestone 3a (multi-book corpus)
- When SRF provides non-PDF digital text prior to launch, it goes directly into Contentful — no pipeline change required

---

---

## ADR-011: API-First Architecture for Platform Parity

- **Status:** Accepted
- **Date:** 2026-02-17

### Context

The SRF already has a native mobile app (iOS/Android) with an eReader. While a dedicated teaching portal mobile app is not planned, the portal's API surface will likely be consumed by native apps eventually — either a standalone portal app, integration into the existing SRF app, or both.

Next.js encourages a pattern where business logic lives inside React Server Components. This is convenient for web development but creates a platform lock: Server Components are callable only by the Next.js rendering pipeline, not by a mobile app, a third-party integration, or a PWA Service Worker.

If business logic migrates into Server Components during Arcs 1–5, extracting it later into a proper API layer is a significant refactoring effort. The cost of API-first discipline from day one is near zero; the cost of retrofitting is high.

### Decision

Adopt **API-first architecture** with a **shared service layer** from Arc 1. Every user-facing feature must have both a callable service function and a REST API endpoint.

#### 1. Shared Service Layer

All business logic lives in `/lib/services/` as plain TypeScript functions:

```
/lib/services/
 search.ts → findPassages(query, language, options)
 daily-passage.ts → getDailyPassage(date, language)
 themes.ts → getThemes(language), getThemePassages(slug, language, limit)
 books.ts → getBooks(language), getChapter(bookSlug, chapterNumber, language)
 quiet.ts → getAffirmation(language)
```

**Server Components** call service functions directly (in-process, no HTTP overhead).
**API routes** call the same service functions and return JSON.
**Mobile apps** (future) call the API routes.

This is a code organization rule, not a technology choice. The rule: **never put business logic in a Server Component or a Route Handler that doesn't delegate to a service function.**

#### 2. API Versioning

All API routes use a versioned prefix from Arc 1:

```
/api/v1/search
/api/v1/daily-passage
/api/v1/themes/[slug]/passages
/api/v1/books/[slug]/chapters/[number]
/api/v1/affirmations
/api/v1/og/[chunk-id]
/api/v1/email/subscribe
```

When the API evolves, `/api/v2/` coexists with `/api/v1/`. The web frontend always uses the latest version. Mobile apps pin to the version they were built against. Old versions are deprecated with notice, not removed without warning.

#### 3. Authentication: Public by Default

**Arcs 1–6: All API routes are public.** No authentication required. The portal's core mission is frictionless access to the teachings — adding "Sign in" contradicts this.

What auth would serve, and how it's handled without it:

| Need | Solution Without Auth |
|------|----------------------|
| Rate limiting | Vercel Firewall edge rate limiting |
| Bookmarks, reading position | `localStorage` (ADR-066) — private, no server |
| Email subscription | Token-based confirm/unsubscribe (no user accounts) |
| Admin dashboards | Retool has its own auth |
| Content protection | Not needed — the mission is free access |

**Milestone 7a+ (if needed):** When optional accounts are introduced for cross-device sync, evaluate the lightest mechanism that serves the need (magic links, passkeys, or Auth0 if SSO with other SRF properties is required). Public search and reading remain unauthenticated regardless. Auth is additive middleware on specific protected endpoints — never a gate on reading or search.

#### 4. Cursor-Based Pagination

Every endpoint returning a list uses cursor-based pagination:

```json
{
 "results": [...],
 "cursor": "eyJpZCI6MTIzfQ",
 "hasMore": true
}
```

Not page-number pagination (`page=2&limit=10`), which is fragile when data changes between requests. Cursors are stable across inserts and deletes — essential for mobile infinite scroll and pull-to-refresh patterns.

#### 5. Cache-Control Headers

Explicit HTTP caching directives on every API response:

| Endpoint | Cache Strategy |
|----------|---------------|
| `/api/v1/daily-passage` | `max-age=3600` (1 hour — passage changes daily, but not every second) |
| `/api/v1/books/[slug]/chapters/[number]` | `max-age=86400, stale-while-revalidate=604800` (book text rarely changes) |
| `/api/v1/search` | `no-store` (query-dependent, not cacheable) |
| `/api/v1/themes/[slug]/passages` | `max-age=3600` (theme curation changes infrequently) |
| `/api/v1/affirmations` | `max-age=300` (5 min — affirmation rotates but isn't time-critical) |

Mobile apps get intelligent caching for free. The web frontend benefits from the same headers.

#### 6. Deep Link Readiness

Passage URLs (`/passage/[chunk-id]`) are already designed for universal link interception. When a native app is registered:

- **iOS:** `apple-app-site-association` file at domain root maps `/passage/*` to the app
- **Android:** `assetlinks.json` at `/.well-known/` maps the same

The URL structure is decided now. The association files are added when the app launches.

### Rationale

- **Zero marginal cost.** Service layer extraction, API versioning, and cache headers are conventions, not infrastructure. They cost minutes to implement in Arc 1 and save weeks of refactoring later.
- **Multiple consumers are likely.** Even without a native app, the API may be consumed by: a PWA Service Worker (offline reading), the SRF mobile app team, a future admin dashboard, or third-party integrations (with SRF authorization).
- **SRF ecosystem alignment.** The existing SRF mobile app may want to incorporate portal search or daily passage features. A clean API makes this a simple integration rather than a rewrite.
- **Developer discipline is cheaper than developer heroics.** Establishing the pattern on day one (when the codebase is small) prevents the gradual drift that makes refactoring painful.

### Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| **Build API later when mobile is planned** | Simpler codebase initially; YAGNI argument | Extracting logic from Server Components is expensive; API shape is influenced by existing code rather than consumer needs |
| **GraphQL instead of REST** | Single flexible endpoint; mobile apps request exactly what they need | Over-engineering for this corpus size; steeper learning curve; REST is simpler for SRF's team |
| **tRPC** | Type-safe API layer shared between Next.js client and server | Couples API to TypeScript consumers; not usable by native mobile apps or external integrations |

### Consequences

- Arc 1 API routes use `/api/v1/` prefix (update DESIGN.md)
- All features implemented via `/lib/services/` functions first, then exposed via Server Components and API routes
- API routes are public (no auth) through Arc 6; auth middleware added only if/when Milestone 7a accounts are implemented
- List endpoints return cursor-based pagination
- Cache-Control headers on all API responses
- PWA readiness added to roadmap (Milestone 2b)
- Stakeholder question: does the portal get its own mobile app, or do features integrate into the existing SRF app?

---

---

## ADR-012: Progressive Web App as Mobile Intermediate Step

- **Status:** Accepted
- **Date:** 2026-02-17

### Context

Before native apps, a Progressive Web App (PWA) offers a lightweight mobile experience with offline capability, home screen installation, and (on Android) push notifications — without App Store approval, review cycles, or revenue sharing.

For the teaching portal specifically, offline reading is a natural use case: a seeker on a flight, in a rural area with poor connectivity, or simply wanting to read without internet distraction. The Quiet Corner meditation timer should work offline. These align with the Calm Technology principle — the technology fades into the background.

### Decision

Add **PWA readiness** as a distributed deliverable (offline reading, installability, Service Worker caching). This includes:

| Feature | Implementation | Benefit |
|---------|---------------|---------|
| **Web App Manifest** | `manifest.json` with SRF branding, icons, theme colors | Installable on home screen (iOS + Android) |
| **Service Worker** | Cache book chapters, daily passage, Quiet Corner affirmation | Offline reading and meditation |
| **Offline indicator** | Subtle banner when offline: "You're reading offline. Search requires a connection." | Honest, not alarming |
| **Cache strategy** | Book text: cache-first (changes rarely). Search: network-only. Daily passage: stale-while-revalidate. | Fast reads, fresh search |

### Rationale

- **Natural fit for the content.** Books are static content — the ideal PWA caching target. A seeker can download a book chapter and read it anywhere.
- **Calm Technology alignment.** Offline reading removes the constant-connectivity expectation. The portal works in airplane mode, in a forest, on a train.
- **Low incremental cost.** Next.js supports Service Workers via `next-pwa` or `serwist`. The API-first architecture (ADR-011) and Cache-Control headers make the caching strategy straightforward.
- **No App Store dependency.** A PWA is deployed with the web app. Updates are instant. No review process, no 30% fee, no "minimum iOS version" constraints.
- **Does not preclude native apps.** A PWA and a native app can coexist. The PWA serves seekers who don't want to install an app. The native app (if built) serves seekers who prefer a native experience.

### Consequences

- PWA deliverables (manifest, Service Worker, offline caching) are distributed across milestones as progressive enhancements
- Offline mode only caches previously viewed content — it does not pre-download entire books (that's a future decision)
- Push notifications deferred — Android supports Web Push, but iOS support is limited and the daily email already serves the notification use case
- The existing SRF mobile app relationship must be clarified (stakeholder question) to avoid confusing seekers with two "apps"

---

---

## ADR-013: Single-Database Architecture — No DynamoDB

**Status:** Accepted

**Date:** 2026-02-20

### Context

SRF's established technology stack includes both Neon (serverless PostgreSQL) and DynamoDB. Other SRF properties use DynamoDB for high-throughput key-value patterns such as session storage and real-time counters. The question arose whether the teachings portal should also incorporate DynamoDB for consistency with the broader SRF ecosystem.

### Decision

The teachings portal uses **Neon PostgreSQL exclusively** as its database layer. DynamoDB is not used.

### Alternatives Considered

1. **DynamoDB for search query logging** — At ~1,000 searches/day (~73 MB/year), PostgreSQL handles this trivially. DynamoDB's write throughput advantage is irrelevant at this scale.
2. **DynamoDB for session storage** — The portal has no user sessions until Milestone 7a, and Auth0 handles session management. No application-level session store is needed.
3. **DynamoDB for rate limiting counters** — Vercel Firewall handles edge-layer rate limiting. Application-layer limits use in-memory counters in Vercel Functions (acceptable for serverless, no shared state needed).
4. **DynamoDB for caching** — Vercel CDN and browser `Cache-Control` headers handle all caching needs. Adding a separate cache database adds complexity without measurable benefit.

### Rationale

- **The data model is fundamentally relational.** Books → chapters → chunks → topics with many-to-many relationships, cross-references, editorial threads, and chunk relations. This is PostgreSQL's strength. Shoehorning relational data into DynamoDB's key-value model would require denormalization and access pattern planning that adds complexity without benefit.
- **pgvector eliminates the separate vector store.** Embeddings, full-text search, and relational data coexist in a single database. Adding DynamoDB would mean splitting data across two stores with consistency challenges.
- **Single database simplifies operations.** One backup strategy (ADR-019), one connection configuration, one migration tool (dbmate), one monitoring target. Two databases means two of everything.
- **10-year architecture horizon (ADR-004).** Every dependency is a 10-year maintenance commitment. DynamoDB would add: AWS SDK dependency, IAM configuration, separate infrastructure configuration, separate monitoring, separate backup strategy, and cross-database consistency logic — all for zero functional gain.
- **Scale profile doesn't warrant it.** The portal serves spiritual seekers, not e-commerce transactions. Peak load is modest. PostgreSQL with Neon's serverless autoscaling handles the portal's read-heavy, moderate-write workload comfortably.
- **SRF ecosystem alignment is about patterns, not tools.** The portal aligns with SRF's tech stack in framework (Next.js), hosting (Vercel), database vendor (Neon), identity (Auth0), and observability (Sentry, New Relic, Amplitude). Using the same vendor (Neon/PostgreSQL) for a different access pattern (relational + vector) is good engineering, not deviation.

### Consequences

- All data lives in Neon PostgreSQL: content, embeddings, search indexes, analytics, configuration
- Single backup target, single migration tool, single connection strategy
- Infrastructure is simpler (no DynamoDB configuration, no IAM policies for cross-service access)
- If SRF's DynamoDB usage evolves to include a pattern the portal genuinely needs (e.g., real-time collaborative features in future milestones), this decision can be revisited via a new ADR
- Developers familiar with SRF's DynamoDB patterns should note: the portal's data model is relational by nature, and the single-database approach is an intentional architectural strength

---

---

## ADR-014: AWS Bedrock Claude with Model Tiering

**Status:** Accepted

**Date:** 2026-02-20

### Context

The portal uses Claude for three distinct search tasks: intent classification, query expansion, and passage ranking (ADR-001, ADR-005). At scale (projected 10,000+ searches/day), API costs become a significant operational concern for a free portal funded by a philanthropist. Additionally, SRF's established technology stack is AWS-centric — the question arose whether to use the Anthropic API directly or AWS Bedrock as the Claude provider.

### Decision

1. **Use AWS Bedrock** as the Claude API provider instead of the direct Anthropic API.
2. **Use Claude Haiku** as the default model for per-search tasks (intent classification, query expansion, passage ranking).
3. **Use Claude Opus** as the default model for all index-time/batch work — enrichment, vocabulary bridge generation, evaluation judging, passage depth classification.
4. **Benchmark Haiku vs Sonnet** during Arc 1 using a test set of ~50 curated queries. If Haiku passage ranking quality falls below acceptable thresholds, promote passage ranking to Sonnet while keeping intent classification and query expansion on Haiku.

### Model Tiering Strategy

**Per-search tasks (real-time, cost-sensitive):**

| Task | Model | Fallback | Quality Sensitivity | Volume |
|------|-------|----------|-------------------|--------|
| Intent classification | Haiku | None (skip on failure) | Low — simple categorization | Every search |
| Query expansion | Haiku | None (skip, use raw query) | Medium — vocabulary breadth | Every complex search |
| Passage ranking | Haiku (promote to Sonnet if benchmarks warrant) | Skip (use RRF scores) | High — determines result quality | Every search with candidates |

**Index-time batch tasks (run once per content, maximum quality):**

| Task | Model | Rationale | Milestone |
|------|-------|-----------|-----------|
| Unified enrichment pipeline (ADR-115) | **Opus** | Sacred text requires the deepest available reasoning for register classification, emotional quality mapping, and corpus territory tagging. The corpus is small; batch costs are negligible. | 1c+ |
| Vocabulary bridge generation (ADR-129) | **Opus** | Mapping human states of being to Yogananda's vocabulary across five layers requires deep reading comprehension, emotional intelligence, and cross-tradition fluency | 1a+ |
| Passage depth signatures | **Opus** | Classifying passages as bottomless/informational/catalytic/consoling requires contemplative judgment, not pattern matching | 1c+ |
| Theme taxonomy classification | **Opus** | Classifying chunks across multi-category spiritual taxonomy requires deep comprehension of Yogananda's teachings | 3c |
| Search quality evaluation judging (DES-058) | **Opus** | Judging whether a retrieved passage meets a seeker's emotional state requires the same depth as the enrichment itself | 1a+ |
| Ambiguous chunk classification | **Opus** | Edge cases near classification thresholds benefit from nuanced reasoning | 1a+ (ingestion) |
| Reference extraction (scriptures, persons, places) | **Opus** | Identifying cross-tradition references (Bible, Bhagavad Gita, scientific texts) across Yogananda's writing requires broad knowledge | Arc 4 |
| UI translation drafting | **Opus** | Devotional register in 8+ languages requires precise tone; human review follows (ADR-078) | 5b |
| Cross-book relationship mapping | **Opus** | Identifying thematic connections across the full library requires deep reading comprehension | 3d–Arc 4 |

**Rationale for Opus as batch default.** The portal's index-time work is its most consequential AI use — it determines what seekers find when they search, how passages are classified, whether the vocabulary bridge correctly maps "I feel empty" to teachings about spiritual longing. The corpus is small (~100K chunks at full scale). Batch enrichment of the full corpus costs ~$50-100 with Opus — a one-time investment. Haiku or Sonnet cost less but lack the reasoning depth for tasks where spiritual nuance matters: distinguishing consolation from instruction, recognizing when "death" is discussed philosophically vs. in grief, mapping cross-tradition vocabulary accurately. For a portal committed to "honoring the spirit of the teachings" (PRI-03), the AI work that shapes what seekers find deserves the most capable model available. Cost sensitivity applies to per-search tasks (recurring, scales with traffic); it does not apply to batch work (one-time, small corpus).

Batch tasks are configured via `CLAUDE_MODEL_BATCH` in `/lib/config.ts` (defaults to Opus). Cost is negligible: ~$50–100 per full corpus enrichment pass, run once per content change.

### Cost Projection

**Per-search (recurring, scales with traffic):**

| Scenario | Per-search cost | Monthly at 10K/day |
|----------|-----------------|-------------------|
| All Haiku | ~$0.001 | ~$300 |
| Tiered (Haiku + Sonnet ranking) | ~$0.005 | ~$1,500 |
| All Sonnet | ~$0.01 | ~$3,000 |
| Opus ranking (rejected) | ~$0.025 | ~$7,500 |

**Offline batch (one-time per content, negligible ongoing cost):**

| Task | Cost per book | When |
|------|--------------|------|
| Theme classification (Opus) | ~$2–5 | Once per book ingestion |
| Reference extraction (Opus) | ~$1–3 | Once per book ingestion |
| UI translation drafting (Opus) | ~$0.50 per locale | Once per locale addition |

### Alternatives Considered

1. **Direct Anthropic API** — Simpler initial setup, day-one access to new model releases. Rejected because: SRF already has AWS billing, support contracts, and IAM infrastructure. A separate Anthropic contract adds vendor management overhead for zero functional gain. New model releases are irrelevant — the portal's librarian tasks are well-defined and stable.
2. **All Sonnet** — Higher baseline quality for ranking. Rejected for per-search tasks because: 10x cost increase over Haiku at scale. The portal's ranking task is constrained (select and order passage IDs from 20 candidates) — not open-ended reasoning. Haiku is likely sufficient; benchmark first.
3. **Sonnet for batch enrichment** — Considered as middle ground between Haiku and Opus for index-time work. Rejected because: the batch workload is the portal's most consequential AI use — it determines what seekers find. The corpus is small; the cost difference between Sonnet and Opus for batch work is ~$30-50 per full corpus pass. At this scale, the cost argument for a weaker model does not hold. Sacred text deserves the deepest available reasoning for quality classification.
4. **Opus for intent classification** — Considered whether Opus's deeper reasoning would improve classification accuracy. Rejected because: intent classification is bounded enum categorization (~7 types). The input is a short user query, the output is structured JSON. Haiku reaches the quality ceiling for this task; additional model capability has nowhere to go.
5. **Opus for passage ranking** — Considered whether Opus would better understand subtle spiritual nuance when ordering passages (e.g., distinguishing "divine fulfillment" from "renunciation" for "I feel empty inside"). Rejected for per-search use because: at ~$7,500/month for ranking alone (10K searches/day), the cost is unjustifiable for a free portal. The heavy semantic lifting is done by the hybrid search layer, the vocabulary bridge (ADR-129), and well-crafted system prompts with explicit ranking criteria. **Opus is the default for offline batch work** — the one-time index-time investment that makes per-search quality achievable with Haiku.
5. **OpenAI GPT models** — Rejected because: Claude's instruction-following and constrained output format are well-suited to the librarian pattern. Embeddings use Voyage (ADR-118), not OpenAI, so there is no vendor-consolidation argument. Switching LLM providers for cost reasons alone adds migration risk. ADR-001 established Claude; no reason to revisit.

### Rationale

- **AWS alignment.** SRF's stack is AWS-native (ADR-013 notes this). Bedrock means consolidated billing, VPC endpoints (API traffic stays off the public internet), IAM-based access control, and existing AWS support contracts. No separate Anthropic API key management.
- **Committed throughput pricing.** Bedrock offers provisioned throughput for predictable costs at scale — important for a free portal with no revenue to absorb cost spikes.
- **Operational simplicity.** One cloud provider for compute (Vercel deploys to AWS), database (Neon), and AI (Bedrock). Platform manages Bedrock model access alongside other vendor resources.
- **Haiku-first is prudent.** The portal's Claude tasks are tightly constrained: classify intent (enum output), expand terms (JSON array output), rank passages (ordered ID list output). These are not open-ended generation tasks. Haiku handles structured, bounded tasks well.
- **Benchmark before promoting.** Rather than assuming Sonnet is needed for ranking, measure first. The Arc 1 test set provides empirical data. If Haiku ranks comparably, the portal saves ~$1,200/month at 10K searches/day.
- **10-year horizon (ADR-004).** AWS Bedrock is a managed service with AWS's long-term commitment. The portal's `/lib/services/claude.ts` abstracts the provider — switching from Bedrock to direct API (or vice versa) requires changing the SDK client, not the business logic.
- **Graceful degradation is provider-agnostic.** The four-level degradation cascade (DESIGN.md § Claude API Graceful Degradation) works identically regardless of whether Claude is accessed via Bedrock or direct API. Timeouts, errors, and budget caps trigger the same fallthrough.

### LLM Portability

Claude via Bedrock is the initial implementation. The long-term direction is **model portability** — the ability to swap LLM providers without touching business logic.

**Index-time enrichment is the primary LLM use case.** With pure hybrid search as the primary search mode (ADR-119), Claude's role shifts from per-query search enhancement to per-chunk enrichment at ingestion time. This is a batch workload — high-quality structured output, no latency sensitivity. The ideal workload for open-source models.

**Open-source direction:** As open-source models mature (Llama, Mistral, Qwen, and successors), evaluate for index-time enrichment. Requirements: reliable structured JSON output, broad spiritual/philosophical knowledge for terminology bridging, multilingual capability for future locales. Bedrock already hosts Llama and Mistral models — the provider swap is a config change.

**Abstraction points:**
- `/lib/services/claude.ts` abstracts the provider — switching SDK clients (Bedrock → direct API → open-source inference endpoint) requires no business logic changes
- Model IDs in `/lib/config.ts` per ADR-123 — the swap point for model selection
- Enrichment prompt design (ADR-115) is model-agnostic — structured input/output contract, no Claude-specific features

**Evaluation trigger:** At each arc boundary, benchmark the current open-source frontier against Claude for enrichment quality on 30 representative passages. If an open-source model achieves comparable enrichment quality (assessed by the same editorial review process), migrate.

### Consequences

- `/lib/services/claude.ts` uses `@anthropic-ai/bedrock-sdk` for all Claude calls, routing through Bedrock in every environment
- `.env.example` includes `AWS_REGION=us-west-2` + `AWS_ROLE_ARN` for the `portal-vercel-runtime` IAM role (Vercel OIDC → Bedrock). No `ANTHROPIC_API_KEY`, no stored access keys. See ADR-126.
- `bootstrap.sh` creates the `portal-vercel-runtime` IAM role with Bedrock inference permissions (`bedrock:InvokeModel*`, `bedrock:Converse*`) + Secrets Manager read access. Vercel functions authenticate via OIDC federation (ADR-126) — zero long-lived credentials.
- Model IDs are named constants in `/lib/config.ts` per ADR-123 (not env vars): `CLAUDE_MODEL_CLASSIFY`, `CLAUDE_MODEL_EXPAND`, `CLAUDE_MODEL_RANK` (default: Haiku), `CLAUDE_MODEL_ENRICH` (default: Opus), `CLAUDE_MODEL_EVALUATE` (default: Opus)
- Arc 1 includes a ranking benchmark task: 50 curated queries, compare Haiku vs Sonnet ranking quality, decide promotion
- New model versions (e.g., Haiku 4.0) are available on Bedrock days/weeks after direct API release — acceptable for a portal that values stability over cutting-edge
- If Bedrock pricing or availability changes unfavorably, switching to direct Anthropic API requires only SDK client changes in `/lib/services/claude.ts` — business logic and degradation cascade are unaffected

---

## ADR-016: Infrastructure as Code — Platform-Managed Infrastructure

- **Status:** Accepted (Revised 2026-03-01 — Terraform replaced by Platform MCP)
- **Date:** 2026-02-17 (original); 2026-03-01 (revised)

### Context

The SRF Tech Stack Brief mandates Infrastructure as Code as a core engineering principle:

> *"All infrastructure should be defined as Infrastructure-as-Code and deployable via a GitLab CI/CD pipeline"*
> — SRF Infrastructure Philosophy, Principle #4

The brief names Terraform as the IaC tool. ADR-016 originally adopted Terraform for all infrastructure from Milestone 1c. This served the project through M1c, producing working `.tf` files for Neon, Vercel, Sentry, and AWS resources.

**What changed:** PRI-12 (AI-Native Development and Operations) introduced the yogananda-platform as the AI operator's primary interface. The platform MCP server manages environment lifecycle, deployment orchestration, and vendor resources through `teachings.json` configuration and MCP tool calls. This created architectural redundancy — two systems (Terraform and Platform MCP) managing the same vendor resources (Neon branches, Vercel projects, Route 53 records, Contentful environments), with two state stores (S3 tfstate and platform database), two execution pipelines (terraform.yml and MCP tool calls), and two declarative specifications (.tf files and teachings.json).

The revision resolves this redundancy by recognizing that the platform MCP provides all seven IaC capabilities through an AI-native interface:

| IaC Capability | Terraform | Platform MCP |
|---------------|-----------|-------------|
| Declarative intent | `.tf` files | `teachings.json` config |
| Drift detection | `terraform plan` (batch) | `project_audit` queries actual state vs config (real-time) |
| Repeatability | `terraform apply` from scratch | `project_bootstrap` from config |
| Dependency ordering | HCL implicit DAG | Orchestration code in vendor service layer |
| Plan/review workflow | `terraform plan` → human reads HCL diff | AI explains intent in natural language → human approves |
| State tracking | `tfstate` (current snapshot) | Platform database (full history with audit trail) |
| Version control | `.tf` files in git | Config files + tool implementations in git |

### Decision

**Infrastructure as Code is preserved. The execution engine changes from Terraform to Platform MCP.**

The teachings project's infrastructure is managed by the yogananda-platform. The teachings repo contains application code; the platform repo manages infrastructure for all projects.

#### Three-Layer Infrastructure Model

| Layer | Tool | What It Manages | When |
|-------|------|----------------|------|
| **One-time security setup** | `scripts/bootstrap.sh` | AWS IAM roles, OIDC federation, KMS keys, Secrets Manager, S3 state bucket, DynamoDB locks | Once, at project creation |
| **Vendor resources** | Platform MCP (`project_bootstrap`, `project_audit`) | Vercel project, Neon project/branches, Route 53 records, Contentful environments, Sentry config | On project onboarding; drift checks as needed |
| **Operational lifecycle** | Platform MCP (environment tools) | Environment creation, deployment tracking, promotion, health verification, teardown | Every deployment cycle |

**`bootstrap.sh` is preserved for AWS security resources.** IAM policies, OIDC federation, and KMS keys are security-critical, created once, and rarely change. The bootstrap script creates them with explicit AWS CLI calls and IAM policy documents (`terraform/bootstrap/*.json`). These resources don't benefit from ongoing state management — they need creation and occasional audit, not continuous reconciliation.

**`teachings.json` replaces `.tf` files as the declarative specification.** The platform's project config describes what infrastructure the project needs: domain, repo, environment chain, gates, vendor project IDs, tier mappings. Platform MCP tools read this config to create, query, and manage resources.

**Platform database replaces `tfstate` as the state store.** Every environment creation, promotion, and destruction is recorded with full audit trail — richer than Terraform state, which captures only current snapshot.

#### Source Control and CI/CD

| Phase | SCM | CI/CD | Infrastructure State |
|-------|-----|-------|---------------------|
| **Primary (all arcs)** | GitHub | GitHub Actions | Platform database (yogananda-platform Neon) |
| **If SRF requires migration** | GitLab (SRF IDP) | GitLab CI/CD | Platform database (unchanged) |

The platform's infrastructure state is in its own Neon database, not in S3 tfstate. SCM migration affects only CI workflows, not infrastructure management — the platform MCP operates independently of the CI system.

#### GitHub Actions Authentication: OIDC Federation

OIDC federation for GitHub Actions (ADR-126) is unchanged. Created by `bootstrap.sh`, not Terraform.

```
GitHub Actions → OIDC token → AWS STS AssumeRoleWithWebIdentity → temporary credentials (1 hour)
```

The IAM Role ARN is stored as a GitHub secret (`AWS_ROLE_ARN`). No long-lived AWS credentials exist. This was created by `bootstrap.sh` and managed as a one-time security resource.

#### What the Platform Manages vs. What It Doesn't

| Managed by Platform MCP | Managed by bootstrap.sh (one-time) | Managed by Application Code |
|------------------------|-----------------------------------|-----------------------------|
| Neon branches (create, destroy, promote) | IAM OIDC provider + roles | Database schema (dbmate migrations) |
| Vercel project creation + env vars | KMS keys | `sentry.client.config.ts`, `newrelic.js` |
| Route 53 DNS records | Secrets Manager paths | Lambda handler code (`/lambda/`) |
| Contentful environments + aliases | S3 buckets (backup, state) | Application routing (`next.config.ts`) |
| Sentry configuration | DynamoDB table (legacy, for Terraform state compatibility) | CI workflows (`.github/workflows/`) |
| Deployment tracking + health verification | AWS Budget alarms | — |
| Environment promotion + gate enforcement | — | — |

The boundary: the platform manages *vendor resource lifecycle*. `bootstrap.sh` handles *one-time AWS security setup*. Application code configures *how the app uses those services*.

### SRF Tech Stack Brief Divergence

The brief prescribes Terraform for IaC. This decision preserves the IaC principle while changing the tool:

- **Declarative specification:** `teachings.json` serves the same role as `.tf` files — version-controlled, human-readable, machine-executable description of desired infrastructure state.
- **Reproducibility:** `project_bootstrap("teachings")` creates all vendor resources from the config, equivalent to `terraform apply` from scratch.
- **Audit trail:** The platform database records full operational history — richer than `tfstate`.
- **Drift detection:** `project_audit("teachings")` compares config against actual state in real-time.

**Justification:** PRI-12 (AI-Native Operations) establishes that the AI operator's tooling is the primary operational interface. Terraform was designed for human operators who need visual HCL diffs and batch plan/apply workflows. The AI operator reasons about changes directly, explains intent in natural language, and executes through MCP tools. The IaC substance (declarative, repeatable, auditable) is preserved; the Terraform-specific form is replaced by an AI-native equivalent.

### Rationale

- **Single management plane.** One system (Platform MCP) manages vendor resources. No dual-state ambiguity between Terraform and the platform.
- **AI-native interface.** MCP tools are the natural interface for the AI operator (PRI-12). No context-switching between MCP and Terraform.
- **Richer state.** Platform database records full history with audit trail. Terraform state is a current-state snapshot only.
- **Real-time drift detection.** Platform queries actual vendor state on demand, compared to Terraform's batch `plan`.
- **No state backend dependency.** Terraform's S3 + DynamoDB backend required AWS credentials (which expire). The platform database is always accessible.
- **Vendor-agnostic.** Platform service layers (~130 lines each) are replaceable independently. If Vercel is replaced by Amplify, only `vercel.ts` changes.
- **IaC preserved.** `teachings.json` is declarative, version-controlled, and machine-executable — the same properties that make `.tf` files valuable.

### Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| **Platform MCP only (chosen)** | Single management plane; AI-native; richer state; no Terraform dependency | New approach; teachings.json must be comprehensive; platform is a dependency |
| **Terraform only (original ADR-016)** | SRF-aligned; mature ecosystem; proven model | Dual management with Platform MCP; designed for human operators; state backend requires AWS creds |
| **Terraform + Platform MCP (hybrid)** | Both tools available | Dual state stores; resource ownership ambiguity; two execution pipelines |
| **Pulumi (TypeScript)** | Same language as app; type-safe | Still a second IaC tool alongside Platform MCP |

### Consequences

- The teachings repo's `/terraform/*.tf` files are archived (git history preserves them). `terraform/bootstrap/*.json` (IAM policy documents) are retained — referenced by `bootstrap.sh`.
- `.github/workflows/terraform.yml` is removed. Infrastructure changes flow through Platform MCP, not CI/CD.
- `teachings.json` in the platform repo is the declarative infrastructure specification.
- Platform MCP tools (`project_bootstrap`, `project_audit`, environment lifecycle tools) are the execution engine.
- Platform database is the state store with full audit trail.
- `bootstrap.sh` is preserved for one-time AWS security setup (IAM, OIDC, KMS, Secrets Manager, S3, DynamoDB).
- The S3 state bucket and DynamoDB locks table continue to exist (created by bootstrap.sh) but are no longer actively used by Terraform.
- SRF Tech Stack Brief divergence is explicitly justified by PRI-12.
- Provider version pinning (Neon, Vercel, Sentry Terraform providers) no longer applies — the platform uses REST APIs directly.
- `.env.example` is still maintained for local development.
- New vendor integrations (New Relic, Auth0) are added as Platform MCP service layers, not Terraform modules.

---

---

## ADR-017: Platform-Managed Lambda

**Status:** Accepted (Revised 2026-03-01 — deployment via Platform MCP, not Terraform) | **Date:** 2026-02-21

**Supersedes:** The former Lambda batch decision (AWS Lambda for Batch and Background Workloads). Title revised from "Terraform-Native Lambda" — the Lambda runtime choice is unchanged; the deployment mechanism shifts from Terraform to Platform MCP per ADR-016 revision.

### Context

The former Lambda batch decision introduced AWS Lambda + Serverless Framework v4 for batch and background workloads starting Milestone 2a. The decision was sound on the runtime choice (Lambda) but introduced three problems:

1. **Serverless Framework v4 licensing.** SF v4 moved to a paid license model in late 2024. The portal takes on a licensing dependency for a tool it barely needs (< 15 functions across all milestones). The SRF Brief specifies SF v4 because most SRF microservices have dozens of Lambda functions — the portal does not.

2. **Dual IaC tooling.** The portal uses Terraform for all infrastructure (Neon, Vercel, Sentry, S3). Adding SF v4 means two IaC tools, two deployment pipelines, two state management systems. This contradicts the 10-year simplicity principle (ADR-004).

3. **Timing.** The former Lambda batch decision placed Lambda infrastructure setup in Milestone 2a — already a dense milestone (multi-book ingestion, search expansion). Meanwhile ADR-019 (database backup) needs Lambda in Arc 1, creating a timing gap that ADR-019 acknowledged awkwardly: "Lambda function added in Arc 1 or Milestone 2a when Lambda infrastructure is first deployed."

A comparative analysis of the SRF Tech Stack Brief against the portal's architectural decisions (ADR-013, ADR-004) confirmed that the portal's batch workloads are modest, rare, and well-served by Lambda — but that the deployment tool and introduction timing should match the portal's actual complexity profile, not the SRF microservices pattern.

### Decision

1. **Keep Lambda as the batch processing runtime.** All batch, scheduled, and event-driven workloads run on AWS Lambda. This is unchanged from the former Lambda batch decision.

2. **Deploy Lambda via Platform MCP, not Serverless Framework v4.** Lambda functions, layers, IAM roles, and EventBridge schedules are managed by the platform — the same system that manages all other portal infrastructure. One management plane. One operational interface. (Originally "via Terraform" — revised per ADR-016 to Platform MCP.)

3. **Use EventBridge Scheduler (not EventBridge Rules) for cron tasks.** EventBridge Scheduler is the purpose-built service for scheduled invocations, with built-in retry with exponential backoff, dead-letter queues, and one-time scheduling. All nightly/daily cron tasks use Scheduler.

4. **Provision Lambda infrastructure when first needed (Milestone 3a), not at a fixed gate (former Milestone 2a).** Lambda *infrastructure* (IAM roles, functions, EventBridge schedules) is provisioned in Milestone 3a when the first function (backup, ADR-019) deploys. The platform MCP manages Lambda provisioning via AWS SDK. Subsequent milestones add functions to already-provisioned infrastructure.

5. **Replace `/serverless/` directory with `/lambda/`.** The directory name reflects the runtime, not a vendor tool.

### Directory Structure

```
/lambda/
 /handlers/
 backup.ts — pg_dump → S3 (Milestone 3a)
 ingest.ts — Book ingestion pipeline (Milestone 3a)
 relations.ts — Chunk relation computation (Milestone 3a)
 aggregate-themes.ts — Nightly search theme aggregation (Milestone 3d)
 send-email.ts — Daily passage email dispatch (Milestone 5a)
 generate-social.ts — Quote image generation (Milestone 5a)
 webhook-contentful.ts — Contentful sync (Milestone 1c+)
 ingest-transcript.ts — YouTube transcript ingestion (Arc 6)
 compute-graph.ts — Knowledge graph positions (Arc 6)
 process-image.ts — Image tier generation (Arc 6)
 process-audio.ts — Audio transcription (Arc 6)
 /layers/
 shared/ — Shared deps (Neon client, Claude SDK)

/terraform/modules/
 /lambda/
 main.tf — Functions, layers, IAM roles, VPC config
 variables.tf
 outputs.tf
 /eventbridge/
 main.tf — Scheduler rules, event patterns
 variables.tf
```

Each Lambda handler is a thin wrapper that imports from `/lib/services/` — the framework-agnostic service layer (ADR-011). The business logic is identical whether invoked by Lambda, CLI, or a test harness.

### Milestone-by-Milestone Introduction

| Milestone | Functions Added | Trigger |
|-----------|----------------|---------|
| **3a** | `backup` | EventBridge Scheduler (nightly) |
| **5** | `ingest`, `relations` | Manual invocation (CLI/admin portal → Lambda invoke) |
| **7** | `aggregate-themes` | EventBridge Scheduler (nightly) |
| **9** | `send-email`, `generate-social` | Scheduler (daily) / Manual |
| **10** | `webhook-contentful` | EventBridge Pipe (Contentful → Lambda) |
| **13** | `ingest-transcript` | Manual + Scheduler (batch) |
| **14** | `compute-graph`, `process-image`, `process-audio` | Scheduler (nightly) / Event-driven |

Infrastructure is provisioned once in Milestone 3a. Each subsequent milestone adds functions to already-provisioned infrastructure.

### CLI Wrappers

`/scripts/` retains CLI wrappers that call the same `/lib/services/` functions:

```
/scripts/
 ingest.ts — CLI wrapper for local development/debugging
 backup.ts — CLI wrapper
 compute-relations.ts — CLI wrapper
 ...
```

A developer can run `pnpm run ingest --book autobiography` locally. Production runs the same logic via Lambda. The runtime is irrelevant; the business logic is identical.

### Rationale

- **Lambda is SCM-agnostic.** It works identically under GitHub Actions or any future CI system. Unlike CI-based cron jobs, Lambda infrastructure doesn't change if the portal ever migrates SCM platforms. EventBridge schedules, IAM roles, and S3 buckets are untouched by an SCM migration.
- **The portal already has an AWS footprint.** S3 (backups, Milestone 3a), Bedrock (Claude API, Arc 1), CloudFront (media streaming, Arc 6), and EventBridge are all AWS services the portal uses regardless. Lambda is the natural compute layer for an AWS-invested project.
- **Terraform-native Lambda is sufficient at this scale.** The portal has < 15 Lambda functions across all milestones. SF v4's ergonomics (local invocation, plugin ecosystem, per-function configuration) serve microservice architectures with dozens of functions. For < 15 functions, `aws_lambda_function` + `aws_lambda_layer_version` in Terraform are straightforward and eliminate a tool dependency.
- **One IaC tool, one deployment pipeline.** `terraform apply` already deploys Neon, Vercel, Sentry, and S3. Adding Lambda to the same pipeline means no new deployment workflow. CI/CD gains no new steps — Lambda deploys alongside everything else.
- **Arc 1 resolves the ADR-019 timing gap.** The backup function deploys in Arc 1 where it belongs. No more "Milestone 1a or Milestone 2a" ambiguity.
- **ADR-013 precedent.** The portal already diverges from SRF's DynamoDB pattern when the portal's needs don't match. The same principle applies: SRF ecosystem alignment is about patterns (Lambda for batch compute), not tools (SF v4 as the deployment mechanism).
- **10-year horizon (ADR-004).** Terraform is Tier 1 (effectively permanent). Serverless Framework v4 is not in any durability tier — it's a deployment tool with licensing risk and competitive pressure from SST, AWS SAM, and native Terraform. Eliminating it removes a 10-year maintenance liability.

### Alternatives Considered

1. **Keep the former Lambda batch decision unchanged (Lambda + SF v4 in Milestone 2a).** Rejected: introduces dual IaC tooling, SF v4 licensing dependency, and Milestone 2a overload. The benefits of Lambda are preserved without the deployment tool overhead.

2. **Replace Lambda entirely with CI-scheduled scripts (GitHub Actions).** Rejected: CI cron is ephemeral infrastructure tied to the SCM platform. Lambda + EventBridge is durable infrastructure managed by Terraform, SCM-agnostic.

3. **AWS SAM instead of Terraform-native Lambda.** Rejected: SAM is another CLI tool alongside Terraform. For < 15 functions, native Terraform resources are simpler.

4. **SST (open-source Serverless Framework alternative).** Considered but rejected: SST is well-designed but introduces another IaC paradigm. The portal should minimize tool surface area.

5. **AWS Step Functions for ingestion orchestration.** Deferred, not rejected. Book ingestion is a multi-step workflow (extract → chunk → embed → insert → relate → verify), but it runs ~12 times total across the portal's lifetime. A sequential script with progress logging is sufficient. If Arc 6's audio/video pipeline needs multi-step orchestration with failure recovery, Step Functions earns its place via a new ADR.

### Consequences

- The former Lambda batch decision is superseded. Its runtime decision (Lambda for batch) is preserved; its deployment tool (SF v4) and timing (Milestone 2a) are replaced.
- `/serverless/` directory becomes `/lambda/`. No `serverless.yml`. No SF v4 dependency.
- Terraform gains two modules: `/terraform/modules/lambda/` and `/terraform/modules/eventbridge/`.
- Milestone 2a deliverable M2a-22 provisions Lambda infrastructure (`enable_lambda = true` → `terraform apply`) for database backup. Milestone 3a deliverable M3a-6 deploys batch functions (ingestion, relation computation) to the already-working infrastructure.
- All downstream ADRs referencing Lambda batch infrastructure now reference ADR-017. The infrastructure is the same (Lambda + EventBridge); the deployment mechanism and timing differ.
- Developers familiar with SF v4 should note: Lambda invocation, monitoring, and IAM are identical. Only the deployment tool changes (Terraform instead of `serverless deploy`).
- **Extends ADR-016** (Terraform as sole IaC tool), **ADR-004** (10-year horizon — fewer tool dependencies), **ADR-018** (CI-agnostic scripts — `/scripts/` wrappers call same logic), **ADR-019** (backup timing resolved — Milestone 2a).
- **Deferred:** Step Functions for complex orchestration (evaluate at Arc 6 if audio/video pipeline complexity warrants it).

---

---

## ADR-018: CI-Agnostic Deployment Scripts

**Status:** Accepted | **Date:** 2026-02-19

### Context

CI pipeline logic should not be embedded in CI-specific YAML syntax. If the portal ever migrates SCM platforms (e.g., GitHub → GitLab for SRF IDP alignment), CI-embedded logic requires rewriting every pipeline step. More immediately, CI-agnostic scripts enable local execution parity — a developer can run `./scripts/db-migrate.sh` locally with the same logic CI uses.

### Decision

Add a `scripts/` directory with CI-system-agnostic deployment scripts. GitHub Actions (and any future CI) calls these scripts rather than embedding logic in workflow YAML.

#### Directory structure

```
/scripts/
 db-migrate.sh — Run dbmate migrations against a given database URL
 smoke-test.sh — Run smoke tests against a deployed environment
 search-quality.sh — Run the search quality evaluation suite
 neon-branch-cleanup.sh — Delete orphaned Neon preview branches (TTL enforcement)
```

#### CI workflow pattern

```yaml
# GitHub Actions
steps:
 - run: ./scripts/db-migrate.sh $NEON_DATABASE_URL
 - run: ./scripts/smoke-test.sh $DEPLOYMENT_URL
```

The CI config is a thin orchestration layer. The scripts contain the actual logic. If SCM migration occurs, only the CI config changes — scripts are identical.

#### Multi-environment promotion pipeline

For Arc 4+ with three environments (dev/staging/prod):

```
PR → dev (auto) → staging (manual gate) → prod (manual gate)
```

Each promotion runs:
1. `db-migrate.sh {env}` — run migrations against target environment's database
2. Vercel deployment to target environment's project
3. `smoke-test.sh {env}` — verify the deployment

Migration sequencing: Platform MCP provisions infrastructure *first* (in case it creates the database), then dbmate migrations (which depend on the database existing), then Vercel deploys the new code (which depends on the new schema).

### Rationale

- **SCM portability.** Any future SCM migration becomes a CI config swap, not a logic rewrite.
- **Local reproducibility.** Developers can run `./scripts/db-migrate.sh` locally. CI parity with local execution prevents "works on my machine" issues.
- **Testability.** Scripts can be tested independently of the CI system. ShellCheck lint in CI catches script errors.

### Consequences

- `/scripts/` directory added to repo in Milestone 1a
- GitHub Actions workflows call scripts instead of inline commands
- All scripts accept environment name as parameter, defaulting to `dev`
- **Extends ADR-016** (Platform MCP) with concrete deployment orchestration

**Operational surface extension:** DES-060 adds `deploy.sh` (deployment ceremony), `release-tag.sh` (semantic tagging), `doc-validate.sh` (document integrity), and `status.sh` (AI self-orientation) to the `/scripts/` directory — following the same CI-agnostic pattern. See PRO-035, PRO-036, PRO-037.

---

---

## ADR-019: Database Backup and Recovery Strategy

**Status:** Accepted | **Date:** 2026-02-19

### Context

The portal's canonical content — book text, embeddings, theme tags, chunk relations, daily passages, calendar events — lives in Neon PostgreSQL. Neon provides three native recovery mechanisms on Scale tier (ADR-124):

1. **Point-in-time recovery (PITR)** — restore to any moment within a 30-day window
2. **Snapshots** — manual and scheduled capture of branch state with one-step restore
3. **Time Travel Queries** — read-only queries against any historical point within the PITR window (via ephemeral computes)

However, native Neon recovery doesn't protect against:
- Neon service-level incidents beyond their disaster recovery capability
- A future vendor migration (if SRF moves away from Neon for any reason)
- The need for a portable backup format (standard `pg_dump`) that any PostgreSQL host can restore

The 10-year architecture horizon (ADR-004) demands that the data survive any single vendor relationship. Neon may not exist in 10 years. The data must.

### Decision

Adopt a **three-layer recovery strategy**: Neon-native PITR + Neon Snapshots + nightly `pg_dump` to S3.

#### Layer 1: Neon PITR (30-day window)

Available immediately on Scale tier. Restore to any moment within 30 days — covers accidental data corruption, bad migrations, and operational mistakes. Uses Neon's built-in WAL-based recovery.

- **Restore scope:** Entire branch (all databases)
- **Restore method:** Timestamp or LSN (Log Sequence Number)
- **Pre-restore safety:** Neon automatically creates a backup branch (`{branch}_old_{timestamp}`)
- **Time Travel Queries:** Before committing to a restore, run read-only queries against historical state to verify the target recovery point is correct. Uses ephemeral 0.5 CU computes that auto-delete after 30s idle.

#### Layer 2: Neon Snapshots (API-managed, automated schedule)

Configure automated snapshots on the production branch via **Neon Snapshot API** during Milestone M1a-2 project setup. The Snapshot API supports full CRUD (create, list, restore, update, delete) and backup schedule configuration — no Console interaction needed. Claude configures the schedule via Neon MCP or API call during bootstrap.

- **Daily snapshot** at 03:00 UTC (before nightly pg_dump for redundancy)
- **Weekly snapshot** on Sundays
- **Monthly snapshot** on the 1st
- **Retention:** Up to 10 snapshots (Scale tier limit). Lifecycle: keep 7 daily + 2 weekly + 1 monthly.
- **Restore:** One-step restore from any snapshot via API. Faster than PITR for known-good checkpoints.
- **Pre-migration snapshots:** CI workflow creates a snapshot before applying any migration PR. This provides an instant rollback point without timestamp arithmetic. See DES-039 § CI/CD Pipeline.
- **On-demand snapshots:** Claude creates snapshots via MCP before risky operations (re-ingestion, embedding model migration, bulk data changes). Part of the Operations layer (DES-039 § Three-Layer Neon Management Model).

#### Layer 3: pg_dump to S3 (vendor-independent)

Nightly `pg_dump` to S3 provides a portable backup that can restore to any PostgreSQL host — not just Neon. This is the vendor-independence layer.

- **Lambda function** (using ADR-017 infrastructure) runs nightly via EventBridge cron
- `pg_dump --format=custom` (most flexible restore format)
- Uploaded to an encrypted S3 bucket (`aws:kms` server-side encryption)
- **Retention:** 90 days of daily backups, plus the 1st of each month retained for 1 year
- **Size estimate:** Arc 1 database (~2,000 chunks + embeddings) ≈ 50–100MB compressed. Full library (~50,000 chunks) ≈ 1–2GB compressed. S3 cost: < $1/month.

#### Platform MCP management

S3 backup bucket, Lambda function, EventBridge rule, and IAM role are provisioned and managed via Platform MCP.

#### Restore decision tree

| Scenario | Use | Why |
|----------|-----|-----|
| Bad migration noticed within minutes | PITR (timestamp) | Fastest; restore to pre-migration moment |
| Data corruption noticed within hours | Time Travel Query → PITR | Verify target point first, then restore |
| Need to inspect historical state | Time Travel Query | Read-only, no restore needed |
| Known-good checkpoint needed | Snapshot restore | One-step, no timestamp arithmetic |
| Neon is down | S3 pg_dump → any PostgreSQL host | Vendor-independent recovery |
| Vendor migration | S3 pg_dump → new provider | Portable format |

#### Restore procedure (documented in operational playbook)

**From PITR:**
1. Use Time Travel Query to verify the target recovery point
2. Restore production branch to target timestamp via Neon Console or CLI
3. Neon auto-creates a backup branch; verify the restore
4. If wrong: restore again from the backup branch

**From S3 backup:**
1. Download backup: `aws s3 cp s3://srf-portal-backups/{date}.dump ./`
2. Create a Neon branch for restore testing
3. `pg_restore --dbname=... {date}.dump`
4. Verify content integrity
5. If verified: promote restored branch to production (or merge specific tables)

### Rationale

- **Defense in depth.** Three independent recovery mechanisms. PITR for speed, snapshots for checkpoints, pg_dump for portability.
- **30-day PITR window (Scale tier).** Covers the realistic detection window for data corruption. A bad migration or ingestion error has 30 days to be noticed before recovery becomes expensive.
- **Vendor independence.** S3 backups exist outside Neon's infrastructure. The data survives a Neon outage or a future vendor migration.
- **Negligible cost.** S3 Standard-IA with lifecycle rules: < $1/month. Neon Snapshots included in Scale tier.
- **Operational confidence.** Multiple recovery options make risky operations (embedding model migration per ADR-046, major re-ingestion) safer.

### Consequences

- PITR and Time Travel Queries available from Milestone 1a (Scale tier). Time Travel accepted as development tool (PRO-008).
- Snapshot schedule configured during Milestone M1a-2 Neon project setup via Neon Snapshot API (not Console)
- Pre-migration snapshots created by CI workflow before migration PRs
- On-demand snapshots created by Claude via MCP before risky operations
- Backup infrastructure (S3 bucket, Lambda, EventBridge) provisioned in Milestone 2a via Platform MCP
- Lambda function for nightly pg_dump added when Lambda infrastructure from ADR-017 is first deployed
- S3 bucket created and managed by Platform MCP
- Restore procedure documented in operational playbook
- Quarterly restore drill: test restore from a random backup to a Neon branch, verify content integrity
- **Extends ADR-016** (Platform MCP), **ADR-004** (10-year architecture), and **ADR-124** (Neon platform governance)

---

---

## ADR-020: Multi-Environment Infrastructure Design

**Status:** Accepted
**Date:** 2026-02-19
**Deciders:** Architecture team
**Context:** ADR-017 (Lambda batch), ADR-018 (CI-agnostic scripts), ADR-019 (S3 backup), ADR-124 (Neon platform)

### Context

The portal will operate across multiple environments (dev, staging, production) as it moves toward production readiness. SRF uses AWS as their cloud provider and Platform MCP for infrastructure management. The architecture team has autonomous design authority for infrastructure decisions. Key constraint: the portal is a free, public, no-auth teaching portal — environment isolation requirements differ from SRF's member-facing or e-commerce systems that handle PII and payments.

### Decision

**Branch = environment.** Each service uses its native branching/environment primitive — one project per service, branches for separation. Environments are created and destroyed with a single script. Arcs 1–3 use `dev` only; multi-environment promotion activates at Arc 4+.

### Core Principle: One Project, Branch-Based Separation

| Service | One Instance | Environment Primitive | How Separation Works |
|---------|-------------|----------------------|---------------------|
| **Neon** | One project | Branches | `main` (prod), `staging`, `dev` — instant copy-on-write. Platform MCP declares persistent branches; operations layer manages ephemeral. |
| **Vercel** | One project | Branch deployments | Production from `main`, preview from branches. Vercel-native, zero config. |
| **Sentry** | One project | `environment` tag | Single DSN, events tagged `production`/`staging`/`development`. Standard Sentry pattern. |
| **Contentful** | One space | Environments feature | `master` (prod), `staging`, `dev` aliases. Content model changes promoted via migration CLI. |
| **S3 (legacy state)** | One bucket | Path-based | `env:/dev/terraform.tfstate`, `env:/staging/...`, `env:/prod/...` — legacy from initial Terraform setup; retained for state history. |
| **DynamoDB (locks)** | One table | Shared | Lock key includes workspace path. No duplication. |
| **Voyage AI** | One API key | N/A | Stateless embedding service. No environment separation needed. |

**Why single-project over multi-project:** Neon branching is instant and zero-cost — creating a separate project per environment is overhead without benefit. Vercel's branch deployment model already maps Git branches to environments. Sentry's environment tagging is the documented best practice. This approach makes environments disposable — create in minutes, destroy in seconds.

### AWS Account Strategy

Single AWS account with IAM role boundaries for Arcs 1–3. If SRF governance requires separate accounts for production (a stakeholder decision, not a technical one), the platform config model supports multi-account without rearchitecture — add an OIDC role per account and a provider alias per environment.

```
AWS Account: srf-teachings (dedicated account within SRF AWS Organization)
├── IAM OIDC Provider: token.actions.githubusercontent.com — GitHub Actions federation
├── IAM OIDC Provider: oidc.vercel.com/{TEAM_SLUG}       — Vercel runtime federation (ADR-126)
├── IAM Role: portal-ci              — OIDC federation for GitHub Actions
├── IAM Role: portal-ci-staging      — (Arc 4+) tighter permissions
├── IAM Role: portal-ci-prod         — (Arc 4+) production-only permissions
├── IAM Role: portal-vercel-runtime  — Vercel OIDC → Bedrock + Secrets Manager (ADR-126)
├── KMS Key: portal-secrets          — Encrypts all Secrets Manager entries (ADR-125)
├── Secrets Manager: /portal/{env}/* — All application secrets (ADR-125)
├── S3: srf-portal-terraform-state   — Legacy Terraform state (retained for history)
├── S3: srf-portal-assets-{env}      — Per-environment asset buckets
├── Lambda: {env}-*                  — Per-environment functions (Milestone 2a+)
└── DynamoDB: srf-portal-terraform-locks — Legacy state locking (retained)
```

Platform MCP + environment configuration parameterize resource names, compute sizes, and permissions per environment. Environment-specific IAM roles provide blast-radius containment within a single account.

### Bootstrap Automation

The human should never visit five consoles and copy-paste credentials. A bootstrap script automates everything the AWS CLI, Neon CLI, Vercel CLI, and GitHub CLI can handle — prompting the human only for the two credentials that require manual console creation.

**Script interface:**

```bash
# One-time infrastructure bootstrap (~5 minutes)
./scripts/bootstrap.sh

# Create a new environment (Arc 4+, ~2 minutes)
./scripts/create-env.sh staging

# Destroy an environment (Arc 4+, ~1 minute)
./scripts/destroy-env.sh staging
```

**`bootstrap.sh` flow:**

1. AWS CLI: Create S3 bucket, enable versioning + encryption + public access block
2. AWS CLI: Create DynamoDB table (`srf-portal-terraform-locks`, `LockID` partition key, on-demand)
3. AWS CLI: Create OIDC provider + IAM role from `terraform/bootstrap/trust-policy.json`
4. **Prompt:** Neon org API key (console-only — paste when prompted)
5. **Prompt:** Sentry auth token (console-only — paste when prompted)
6. Vercel CLI: Link project, get token
7. GitHub CLI: `gh secret set` for all 6 secrets in batch

The script is idempotent — safe to re-run. Each step checks for existing resources before creating.

**`create-env.sh {env}` flow (Arc 4+):**

1. Platform MCP provisions environment resources (Neon branch, S3 buckets, Lambda functions)
2. `neonctl branches create --name {env} --parent main`
3. `gh api` — configure GitHub Environment with protection rules

**`destroy-env.sh {env}` flow:**

1. Platform MCP deprovisions environment resources
2. `neonctl branches delete {env}`
3. `gh api` — remove GitHub Environment

### CI/CD Promotion Pipeline

```
PR → dev (auto) → staging (manual gate) → prod (manual gate)
```

- **CI-agnostic scripts.** All deployment logic lives in `/scripts/` (ADR-018). GitHub Actions calls these scripts; any future CI system calls the same scripts.
- **Manual production gate.** Production deployments always require manual approval. No automatic promotion from staging to production.
- **GitHub Environments.** Each environment is a GitHub Environment with its own URL and protection rules, enabling deployment tracking and required reviewers.
- **Promotion = merge.** Staging → production is a Git merge to `main`. Neon branch promotes. Vercel rebuilds. Platform promotes with `environment_promote`.

### Rationale

- **Branch = environment.** Neon invented branching for this use case. Vercel's model maps Git branches to deployments natively. Using these primitives — instead of creating separate projects per environment — reduces bootstrap overhead from "visit 5 dashboards, create 15 resources" to "run one script, paste two keys."
- **Proportionate isolation.** This portal has no PII, no authentication (until Milestone 7a+ "if ever"), no financial data. IAM role boundaries within a single AWS account provide sufficient isolation. If SRF governance requires account-level isolation for production, the architecture supports it via workspace-scoped provider aliases — a configuration change, not a rearchitecture.
- **Disposable environments.** `create-env.sh staging` takes ~2 minutes. `destroy-env.sh staging` takes ~1 minute. Environments are cheap to create and free to destroy. This enables experimentation without overhead.
- **CI portability.** Because deployment scripts are CI-agnostic (ADR-018), any future SCM migration is a configuration change, not a re-architecture.

### Consequences

- Platform configurations parameterized by environment from Arc 1
- Single AWS account with IAM role boundaries (escalate to multi-account only if SRF governance requires it)
- One Neon project with branch-based environment separation (ADR-124)
- One Vercel project with branch deployments
- One Sentry project with environment tagging
- One Contentful space with environment aliases
- `scripts/bootstrap.sh` created in Deliverable M1a-1 — automates all CLI-scriptable setup
- `scripts/create-env.sh` and `scripts/destroy-env.sh` created in Arc 4 when multi-environment activates
- `terraform/bootstrap/trust-policy.json` checked into repo — the one artifact the bootstrap script needs
- GitHub Environments configured per environment (dev, staging, prod) with protection rules
- Neon branching strategy documented in runbook (`docs/guides/manual-steps-milestone-1a.md`)

**Operational surface extension:** DES-060 specifies health endpoints, SLI/SLO targets, and design-artifact traceability. Operational dashboarding moved to the platform MCP server — the teachings app exposes data via `/api/v1/health`, the platform provides the operational surface. See PRO-035, PRO-036.

---

---

## ADR-021: Redundancy, Failover, and Regional Distribution Strategy

**Status:** Accepted
**Date:** 2026-02-19
**Deciders:** Architecture team
**Context:** ADR-017 (Lambda batch), ADR-019 (S3 backup), ADR-057 (audio), ADR-020 (multi-tenant infrastructure)

### Context

The portal serves a global audience. Seekers in India, Latin America, Africa, and Southeast Asia are as important as those in North America and Europe. The architecture must balance global availability and latency against cost and operational complexity. The key question: which layers need multi-region redundancy, and which are adequately served by edge caching in front of a single-region origin?

### Decision

Adopt a **single-region origin with global edge distribution** strategy for Arcs 1–4, expanding to **read replicas and cross-region asset replication** at Milestone 5a+ when traffic patterns justify it. No active-active multi-region. The portal is a reading and search tool, not a financial transaction system — the availability requirements are high but not extreme.

### Architecture by Layer

**Layer 1: Edge (global from day one)**

| Service | Distribution | Notes |
|---------|-------------|-------|
| Vercel Edge Network | 70+ PoPs worldwide | Static pages (ISR) cached at edge. HTML reaches seekers from the nearest PoP. |
| Vercel Firewall | Global edge | DDoS protection and rate limiting at Vercel's edge network. |
| CloudFront | Global edge | Audio files, PDFs, and static assets cached at edge. Origin is S3 in the primary region. |

Edge caching means a seeker in Mumbai requesting a book chapter gets HTML from a Vercel PoP in Mumbai, a PDF from a CloudFront PoP in Mumbai, and only the search query itself routes to the single-region origin.

**Layer 2: Compute (single-region, Arcs 1–4)**

| Service | Region | Failover |
|---------|--------|----------|
| Vercel Serverless Functions | `us-west-2` (co-located with Neon and Bedrock) | Vercel provides within-region redundancy. No cross-region failover. |
| AWS Lambda | Same region as Neon primary | Within-region redundancy (Lambda runs across multiple AZs automatically). |

**Layer 3: Database (single-region with HA, Arcs 1–4)**

| Service | Strategy | Notes |
|---------|----------|-------|
| Neon PostgreSQL | Single-region primary with automatic AZ failover | Neon manages replication and failover within the region. If the primary compute goes down, Neon promotes a replica. |
| Neon read replicas (Milestone 5a+) | Add read replicas in EU and Asia-Pacific | Search queries and reader pages route to the nearest read replica. Write operations (ingestion, editorial review) route to the primary. |

**Layer 4: Storage (single-region with CDN, expanding at Milestone 5a+)**

| Service | Strategy | Notes |
|---------|----------|-------|
| S3 (primary) | Single-region | Audio files, PDFs, backups. CloudFront sits in front for global delivery. |
| S3 Cross-Region Replication (Milestone 5a+) | Replicate to a second region | Disaster recovery for assets. If primary region S3 is unavailable, CloudFront falls back to the replica bucket. |

### Failure Scenarios and Response

| Scenario | Impact | Recovery |
|----------|--------|----------|
| Vercel outage (regional) | Pages unavailable | Vercel's global load balancing routes to other regions. ISR-cached pages still served from edge. |
| Neon outage (regional) | Search and dynamic content unavailable. Static pages still served. | Neon's automatic AZ failover. If full region down: portal degrades to static content only (ISR pages, cached PDFs). |
| S3 outage (regional) | New PDF/audio requests fail. CloudFront serves cached copies. | CloudFront continues serving cached assets. At Milestone 5a+, cross-region replica takes over. |
| Lambda outage | Batch jobs fail (ingestion, backup, email) | Lambda retries automatically. Batch jobs are idempotent — safe to re-run. Email delayed, not lost. |
| CloudFront outage | Asset delivery degraded | Extremely rare (global service). Fallback: direct S3 URLs (slower, no edge caching). |

### Regional Latency Targets

With pure hybrid search as the primary search mode (ADR-119 — no external AI services in the search hot path), search latency is dominated by database query time (~50–200ms) plus network round-trip time. This achieves competitive global latency without multi-region database infrastructure.

| Region | Network RTT to us-west-2 | DB Query | Search Total | Target |
|--------|--------------------------|----------|-------------|--------|
| US West | ~10ms | ~100ms | ~110ms | < 200ms |
| US East | ~60ms | ~100ms | ~160ms | < 300ms |
| Europe | ~140ms | ~100ms | ~240ms | < 400ms |
| South Asia | ~200ms | ~100ms | ~300ms | < 500ms |
| Southeast Asia | ~150ms | ~100ms | ~250ms | < 400ms |
| Sub-Saharan Africa | ~250ms | ~100ms | ~350ms | < 500ms |
| South America | ~150ms | ~100ms | ~250ms | < 400ms |

**Target: search p95 < 500ms from any continent.** This is competitive with general-purpose search engines and appropriate for a contemplative portal. The target is achievable today with pure hybrid search against a single-region Neon instance. No edge caching, multi-region database, or architectural changes required.

*Parameter — latency targets above, evaluate: Milestone 1c real-world traffic patterns (ADR-123).*

**What is already globally distributed (day one):**
- Book chapters and reading pages (ISR, cached at Vercel's 70+ edge PoPs)
- Search suggestions (static JSON at CDN edge, < 10ms globally — ADR-120)
- Daily Passage / Today's Wisdom (pre-rendered at every PoP)
- All static assets (Vercel CDN + CloudFront)

**What crosses the network to the origin:**
- Search queries (~200–400ms total — the only user-facing operation with origin latency)
- Contentful webhook sync (editorial, not user-facing)

### Multi-Region Neon

Neon is the portal's database provider for the long term (ADR-124). When Neon ships cross-region read replicas, activate them to reduce search latency further — particularly for South Asia and Africa where network RTT to us-west-2 is highest.

**Activation plan:**
- When available: create read replicas in `ap-south-1` (Mumbai) and `eu-central-1` (Frankfurt) via Platform MCP
- Route search API read queries to the nearest replica; writes (ingestion, editorial) to the primary
- This is a platform configuration change, not an architectural change — the application code is unaffected
- Expected search latency improvement: South Asia drops from ~300ms to ~150ms; Europe from ~240ms to ~140ms

**No exit ramp needed.** Neon's Scale tier, branching workflow, pgvector + pg_search extension ecosystem, and development velocity are the right fit for this project. Plan to grow with Neon, not away from it.

### Rationale

- **Cost-proportionate resilience.** Active-active multi-region would cost 3–5× more in infrastructure and add significant operational complexity. The portal's availability SLA does not justify this. "Search is down for 30 minutes while Neon fails over" is acceptable; "a seeker loses their reading progress" is not (but all reading state is client-side in `localStorage` anyway).
- **Pure hybrid search removes the latency bottleneck.** With no AI services in the search hot path (ADR-119), search latency is ~200–400ms globally — competitive with Google Search. The AI services (Claude, Cohere) were the latency bottleneck, not the database or network. Removing them from the hot path achieves the p95 < 500ms target without multi-region infrastructure.
- **Edge distribution covers most requests.** The majority of portal requests — page loads, PDFs, audio streams, static assets, search suggestions — are served from Vercel's edge. Only search queries reach the origin.
- **Neon multi-region read replicas are the next-level investment.** When Neon ships them, activating replicas in Mumbai and Frankfurt is a platform configuration change that further improves the experience for the largest seeker populations (India, Europe).
- **Backup is separate from failover.** ADR-019 (nightly pg_dump to S3) provides data recovery. This ADR addresses service availability. They complement each other.

### Alternatives Evaluated

- **Turso (libSQL edge database):** Evaluated 2026-02-28. Turso's embedded replicas offer genuine low-latency reads for distributed workloads. Rejected for this project because: (1) no confirmed ICU tokenization for multilingual FTS — fails PRI-06 for 10 target languages including Thai, Hindi, Bengali; (2) vector search (DiskANN) is less mature than pgvector HNSW — one known production customer; (3) hybrid search (vector + BM25 + graph in one query) is not composable in SQLite's virtual table architecture; (4) embedded replicas require persistent filesystems, incompatible with Vercel Edge Functions; (5) libsql-server is v0.x with no published SLA; (6) migration from PostgreSQL would require rewriting all SQL migrations, violating ADR-004 longevity principle. Turso is excellent for multi-tenant SaaS and local-first mobile apps — it solves a different problem than the one this portal has.

### Consequences

- Primary region: `us-west-2` — co-locates Neon, Bedrock, Lambda, and S3 in a single region
- Vercel function region co-located with Neon primary
- Lambda functions deployed to the same region as Neon primary
- CloudFront distribution configured for all static assets from Arc 1
- Search p95 < 500ms from any continent (achieved by pure hybrid search, no multi-region required)
- When Neon ships cross-region read replicas: activate via Platform MCP in `ap-south-1` and `eu-central-1`
- Health check endpoint (`/api/v1/health`) reports database connectivity, enabling uptime monitoring
- **Explicit non-goal:** No active-active multi-region. No global database write replication. No cross-region Lambda orchestration. No edge database replacement.

---

---

## ADR-022: Content-Addressable Passage Deep Links

**Status:** Accepted | **Date:** 2026-02-19

### Context

The current deep linking scheme uses `chapter + paragraph_index` to link to specific passages (e.g., `/books/autobiography/14#p7` for chapter 14, paragraph 7). This has a fragility problem: if a book is re-ingested with different chunking (corrected OCR, revised paragraph boundaries, different chunk sizes), the `paragraph_index` values may shift, breaking all previously shared links.

Shared passage links are permanent artifacts. A seeker shares a link to a Yogananda quote with a friend. That link appears in emails, WhatsApp messages, social media posts, browser bookmarks, and physical printouts (QR codes on passage PDFs). If a re-ingestion breaks the link, the seeker's friend arrives at the wrong passage — or worse, a 404. This violates the 10-year architecture principle (ADR-004).

### Decision

Add a **content hash** column to `book_chunks` that provides a stable, content-addressable identifier for each passage. Deep links use this hash as a fallback when `paragraph_index` no longer matches.

#### Schema addition

```sql
ALTER TABLE book_chunks ADD COLUMN content_hash TEXT GENERATED ALWAYS AS (
 encode(sha256(encode(left(content, 200), 'utf8')), 'hex')
) STORED;

CREATE INDEX idx_chunks_content_hash ON book_chunks(content_hash);
```

The hash is computed from the first 200 characters of the passage content. This is enough to uniquely identify a passage within a book (duplicate openings across chapters are astronomically rare in Yogananda's prose), while remaining stable across minor edits (trailing whitespace, typographic normalization).

#### Deep link resolution

```
1. Try exact match: book_slug + chapter_number + paragraph_index
2. If paragraph content doesn't match the OG-embedded content_hash:
 a. Search same chapter for matching content_hash
 b. Search same book for matching content_hash
3. If found: redirect to correct location (301)
4. If not found: show the chapter with a gentle message:
 "This passage may have moved. Here is the chapter it was in."
```

#### Share URL format

Current: `/books/autobiography/14#p7`
Enhanced: `/books/autobiography/14#p7?h=a3f2c8` (first 6 chars of content_hash)

The `h` parameter is used only for resolution fallback when the paragraph_index doesn't match. Normal navigation ignores it.

### Rationale

- **Link permanence.** Shared links survive re-ingestion, re-chunking, and content corrections. A 10-year-old shared URL still works.
- **Graceful degradation.** If the hash can't be resolved (passage genuinely removed), the seeker sees the chapter rather than an error. Content Availability Honesty principle.
- **Zero cost in the happy path.** When paragraph_index matches (99% of cases), the hash is never consulted. The resolution chain adds latency only when content has actually changed.
- **Minimal schema impact.** One generated column, one index. No migration complexity.

### Consequences

- `content_hash` column added to `book_chunks` table in the initial migration (Arc 1)
- Share URLs include the `h` parameter (short hash suffix)
- OG meta tags embed the content_hash for later verification
- Re-ingestion scripts log when paragraph_index shifts occur, enabling link audit
- **Extends ADR-004** (10-year architecture) and **ADR-068** (passage sharing)

---

---

## ADR-023: Search API Rate Limiting and Abuse Prevention

**Status:** Accepted | **Date:** 2026-02-19

### Context

The search API (`/api/v1/search`) calls the Claude API for query expansion and passage ranking. Each search costs approximately $0.01–0.02 in Claude API usage. The portal has no authentication until Milestone 7a+. All API routes are public.

A bot or bad actor could hammer the search endpoint and generate significant Claude API costs. At 100 requests/second, the portal would burn through $50–100/hour in Claude API charges. Even accidental abuse (a misbehaving scraper, a search indexer hitting the API) could spike costs.

The DESIGN.md security section mentions "Rate limiting on API routes" but doesn't specify the implementation.

### Decision

Implement rate limiting at two layers:

#### Layer 1: Vercel Firewall (edge — Arc 1)

Vercel Pro includes Firewall Rules, DDoS protection, and bot detection. Configure rate limiting via Vercel Firewall Rules or Edge Middleware:

| Rule | Limit | Scope |
|------|-------|-------|
| Global API rate limit | 60 requests/minute per IP | All `/api/v1/*` routes |
| Search rate limit | 15 requests/minute per IP | `/api/v1/search` specifically |
| Burst protection | 5 requests/second per IP | All routes |

These limits are generous for human seekers (who search a few times per session) but block automated abuse. Vercel's built-in DDoS mitigation and bot protection provide the network-layer defense. No separate CDN/WAF vendor required (PRO-017).

#### Layer 2: Application (API route — Arc 1)

A lightweight in-memory rate limiter (e.g., `rate-limiter-flexible` with Vercel's edge runtime, or a simple sliding window counter in a Vercel KV store) as a defense-in-depth measure:

- **Claude API calls gated**: If the IP exceeds the search rate limit, the API falls back to database-only search (vector + FTS without Claude query expansion or re-ranking). The seeker still gets results — just without the AI refinement layer. This is graceful degradation, not a hard block.
- **Hard block threshold**: If an IP exceeds 200 requests/hour to any API endpoint, return `429 Too Many Requests` with a `Retry-After` header and a calm message: "Please wait a moment before searching again."

#### Claude API budget cap

Set a monthly spending cap via the Anthropic API dashboard. If the cap is reached, the search API silently falls back to database-only search for all users. The portal degrades gracefully — search still works, just without query expansion. This is the last line of defense against cost runaway.

### Rationale

- **Cost protection is an Arc 1 requirement**, not an afterthought. The Claude API is the only variable-cost component in the early arcs. Unbounded cost exposure on a public, unauthenticated API is an unacceptable risk.
- **Graceful degradation over hard blocks.** A seeker who happens to search frequently (exploring themes, trying different queries) should never see an error page. They see slightly less refined results. The portal remains welcoming.
- **Two-layer defense.** Vercel Firewall catches the obvious abuse (bots, scrapers) at the edge. The application layer catches the edge cases (distributed abuse, legitimate but excessive use).

### Consequences

- Vercel Firewall Rules configured in Arc 1 (Vercel Pro tier, no separate infrastructure module needed)
- Application-level rate limiter in the search API route
- Claude API monthly budget cap set via Anthropic dashboard
- Search gracefully degrades to database-only when rate-limited or budget-exceeded
- Monitoring: Sentry alert on rate limit triggers; New Relic dashboard for Claude API usage (Milestone 3d)
- **Extends** the security section of DESIGN.md with concrete implementation

---

---

## ADR-024: Native Share API as Primary Mobile Sharing

**Status:** Accepted | **Date:** 2026-02-19

### Context

The passage sharing design (ADR-068) provides a share menu with four options: copy link, email passage, save as image, save as PDF. This serves desktop seekers well. But in the Global South — India, Brazil, Nigeria, Indonesia — WhatsApp is the primary sharing mechanism for spiritual content. A seeker in Mumbai who wants to share a Yogananda quote with a friend opens WhatsApp, not email.

The Web Share API (`navigator.share`) surfaces the device's native sharing sheet, which includes WhatsApp, Telegram, Signal, SMS, and any other installed sharing apps. It is the most natural way to share on mobile, and it removes the portal's need to know which apps the seeker uses.

### Decision

Use `navigator.share` as the **primary** share action on mobile devices that support it. The custom share menu (copy link, email, save as image, save as PDF) is the fallback for desktop and unsupported browsers.

#### Behavior

```
Mobile (navigator.share supported):
 Tap share icon → native share sheet opens immediately
 Shares: passage text (truncated) + deep link URL
 "Save as image" and "Save as PDF" remain as separate actions in a "..." overflow menu

Mobile (navigator.share NOT supported):
 Tap share icon → custom share menu (copy link, email, save as image, save as PDF)

Desktop:
 Click share icon → custom share menu (always)
```

#### Share payload

```javascript
navigator.share({
 title: 'Paramahansa Yogananda — Autobiography of a Yogi',
 text: '"The soul is ever free; it is deathless, birthless..." — Chapter 26, p. 312',
 url: 'https://teachings.yogananda.org/books/autobiography/26#p7?h=a3f2c8'
});
```

### Rationale

- **Global South alignment.** WhatsApp has 2+ billion users, concentrated in exactly the regions the portal serves. `navigator.share` reaches WhatsApp without adding a WhatsApp-specific button or SDK.
- **Privacy by design.** No third-party sharing scripts. No social media tracking pixels. The browser handles the share natively. DELTA-compliant by architecture.
- **Reduced UI complexity.** On mobile, one tap opens the native sheet. No custom menu to build, maintain, or localize.
- **Future-proof.** New sharing apps appear; old ones fade. The native share sheet automatically reflects the user's installed apps. The portal doesn't need to keep a list of sharing targets.

### Consequences

- Share icon behavior branches on `navigator.share` support (feature detection, not device detection)
- "Save as image" and "Save as PDF" are separate from the share action (they generate files, not share intents)
- Desktop always shows the custom share menu
- Mobile shows the native sheet with an overflow menu for image/PDF generation
- **Amends ADR-068** (passage sharing) with mobile-first native sharing

---

---

## ADR-025: PDF Generation Strategy — Resource-Anchored Exports

**Status:** Accepted
**Date:** 2026-02-19
**Deciders:** Architecture team
**Context:** ADR-006 (Global South delivery), ADR-083 (Study Workspace), ADR-057 (audio)

### Context

The portal generates PDFs for multiple content types: full books, individual chapters, audio transcripts, video transcripts, talk outlines, and arbitrary passage collections. A coherent PDF strategy must address three concerns: (1) where PDF routes live in the API, (2) which PDFs are pre-rendered vs. dynamic, and (3) the generation technology.

### Decision

**Principle: PDF is a format of a resource, not a separate resource type.** When a resource supports PDF export, the PDF route is a `/pdf` sub-path of that resource — not a parallel namespace. This keeps the API navigable: if you know where a resource lives, you know where its PDF lives.

### API Surface

```
# ── Pre-rendered PDFs (GET, cacheable, served from S3 via CloudFront) ──

GET /api/v1/books/{slug}/pdf → Full book PDF
GET /api/v1/books/{slug}/chapters/{n}/pdf → Chapter PDF
GET /api/v1/audio/{slug}/transcript/pdf → Audio transcript PDF
GET /api/v1/videos/{slug}/transcript/pdf → Video transcript PDF

# ── Dynamic PDFs (on-demand generation) ──

GET /api/v1/study/outlines/{id}/pdf → Study outline PDF
POST /api/v1/exports/pdf → Arbitrary content PDF
 Body: { "type": "passages", "ids": ["uuid", ...] }
 Body: { "type": "search", "query": "...", "language": "en" }
```

### Pre-rendered vs. Dynamic

| PDF Type | Strategy | Trigger | Cache |
|----------|----------|---------|-------|
| Full book | Pre-rendered, S3 + CloudFront | Generated at ingestion time. Regenerated on content update (Contentful webhook or re-ingestion). | Long-lived. CloudFront TTL: 30 days. Invalidated on content change. |
| Chapter | Pre-rendered, S3 + CloudFront | Same as book. | Same. |
| Audio transcript | Pre-rendered, S3 + CloudFront | Generated when transcript status reaches `approved`. Regenerated on transcript update. | Same. |
| Video transcript | Pre-rendered, S3 + CloudFront | Same as audio transcript. | Same. |
| Talk outline | Dynamic, Lambda | On-demand when preparer clicks "Export PDF." | Not cached (private, user-specific). |
| Passage collection | Dynamic, Lambda | On-demand when seeker clicks "Download as PDF." | Short-lived: 1 hour. Keyed by sorted passage IDs. |
| Search results | Dynamic, Lambda | On-demand. | Short-lived: 1 hour. Keyed by query + filters. |

### Transcript Sub-Resource Pattern

Audio and video transcripts are sub-resources that serve dual purpose — as JSON for the synchronized player, and as PDF for download:

```
GET /api/v1/audio/{slug}/transcript → JSON (timestamped segments for player)
GET /api/v1/audio/{slug}/transcript/pdf → PDF (formatted transcript for reading/printing)

GET /api/v1/videos/{slug}/transcript → JSON (timestamped chunks for player)
GET /api/v1/videos/{slug}/transcript/pdf → PDF (formatted transcript for reading/printing)
```

The `/transcript` endpoint is useful on its own — it's what the synchronized audio player and video player consume. The `/transcript/pdf` endpoint is a formatted view of the same data.

### Generation Technology

**`@react-pdf/renderer`** for all PDF generation. Rationale:

- Produces PDFs from React components — the PDF layout shares design tokens (Merriweather serif, SRF Gold accents, warm cream) with the web reader.
- Runs in Node.js (Lambda and Vercel Serverless Functions) without a headless browser.
- Lighter and faster than Puppeteer/Playwright approaches.
- The portal's PDFs are structurally simple (text + citations + headers) — no need for full browser rendering.

### PDF Design Treatment

All PDFs share a consistent visual language:

- **Cover page** (books only): Title, author, SRF/YSS logo, lotus watermark
- **Running header**: Content source (book title, recording title, "Search Results")
- **Running footer**: "From the SRF Online Teachings Portal — teachings.yogananda.org" + page number
- **Typography**: Merriweather serif for body, Open Sans for headers and metadata
- **Citations**: Every passage includes book/chapter/page or recording/timestamp
- **Page size**: A4 default (global standard). US Letter as `?pageSize=letter` query param.
- **File size display**: Download buttons show estimated file size (ADR-024 principle — honest about what the seeker is downloading, especially for Global South bandwidth constraints)
- **Accessibility**: PDF/UA tagged for screen reader compatibility. Language attribute set. Bookmarks for chapters/sections.

### Why Not `/api/v1/pdf/books/{slug}`

A separate `/pdf/` namespace creates a parallel hierarchy where every resource path is duplicated. This is harder to discover, harder to document, and means two places to maintain when routes change. By anchoring PDFs to their parent resource (`/books/{slug}/pdf`), the API remains navigable — a developer or seeker who knows the resource URL can append `/pdf` to get the downloadable version.

### The `POST /api/v1/exports/pdf` Exception

Pre-renderable PDFs are GET endpoints on their parent resources. But a seeker who selects 7 passages from a search wants a PDF of an *ad-hoc collection* that doesn't correspond to a single existing resource. `POST /api/v1/exports/pdf` handles this:

- POST because the request body can be complex (list of UUIDs, search query with filters)
- POST because it's a generation action, not retrieval of a pre-existing document
- The `type` field in the body disambiguates: `"passages"` (explicit IDs) vs. `"search"` (re-execute a query and format results)

### Rationale

- **Consistent pattern.** Every content type that supports PDF export does it the same way: `/{resource}/pdf`. No exceptions, no parallel namespaces.
- **Pre-rendering where possible.** Books and transcripts change rarely. Generating PDFs at ingestion time and serving from CloudFront means zero generation latency for the seeker and zero compute cost per download.
- **Dynamic where necessary.** Talk outlines and passage collections are unique per request. Lambda handles these on-demand with short-lived caching for popular search queries.
- **Shared design system.** `@react-pdf/renderer` with shared design tokens ensures every PDF — book, transcript, outline, passage collection — looks like it came from the same portal.

### Consequences

- Pre-rendered PDFs added to ingestion pipeline: book PDFs generated after book ingestion, transcript PDFs generated after transcript approval
- S3 bucket structure: `s3://srf-teachings-{env}-assets/pdf/books/{slug}.pdf`, `s3://srf-teachings-{env}-assets/pdf/books/{slug}/chapters/{n}.pdf`, `s3://srf-teachings-{env}-assets/pdf/audio/{slug}-transcript.pdf`, `s3://srf-teachings-{env}-assets/pdf/videos/{slug}-transcript.pdf`
- Lambda function for dynamic PDF generation (`/lambda/pdf-generator/`)
- `@react-pdf/renderer` added as a dependency (or in a shared package if Lambda and Vercel both generate PDFs)
- CloudFront invalidation on content update (book re-ingestion, transcript edit)
- File size stored in metadata and displayed on download buttons
- Arc 4: Book and chapter PDFs (pre-rendered)
- Arc 4: Talk outline PDFs (dynamic)
- Arc 6+: Audio and video transcript PDFs (pre-rendered)
- Future: Passage collection and search result PDFs (dynamic, Milestone 7a+ or as demand warrants)

---

---

## ADR-026: Low-Tech and Messaging Channel Strategy

**Status:** Accepted
**Date:** 2026-02-19
**Deciders:** Architecture team
**Context:** ADR-011 (API-first), ADR-006 (Global South delivery), ADR-017 (Lambda batch), ADR-024 (native share), ADR-057 (audio)

### Context

The portal's primary interface is a web application. This serves smartphone and desktop users well, but excludes seekers who access the internet primarily through:

- **Feature phones** (KaiOS, basic browsers) — ~1 billion devices globally, concentrated in India, Africa, Southeast Asia
- **Basic phones** (SMS-only, no browser) — ~3 billion people worldwide
- **Metered data** where even a 100KB page load is a considered expense
- **No personal device** — shared community phones, cybercafé access

The portal's mission is to make Yogananda's teachings freely accessible *worldwide*. "Worldwide" includes the seeker in rural Bihar who has a basic Nokia phone and intermittent SMS access. The API-first architecture (ADR-011) already enables non-web access channels — every passage, every search result is available via a JSON API. The question is: which channels should we build?

### Decision

Build a multi-channel access strategy that meets seekers where they are, using the messaging platforms they already use. Prioritize by reach and cost-effectiveness.

### Channel Assessment

| Channel | Reach | Cost Model | Richness | Implementation |
|---------|-------|-----------|----------|----------------|
| **WhatsApp Business API** | 2.7B users. Dominant in India, Brazil, Nigeria, Indonesia, Mexico | Per-conversation: $0.005–0.08 depending on region and initiation | Rich: text, images, audio clips, buttons, links | Lambda + WhatsApp Cloud API |
| **SMS (inbound + outbound)** | Universal. Every phone. No internet required. | Per-message: $0.002–0.04 depending on country and provider | 160 chars (Latin) / 70 chars (non-Latin). Multi-part available. | Lambda + Twilio or Africa's Talking |
| **Telegram Bot** | 800M users. Popular in Russia, Iran, Southeast Asia, parts of Africa | Free (no per-message cost) | Rich: text, images, audio, inline keyboards, formatting | Lambda + Telegram Bot API |
| **USSD** | Universal in Africa. Works on any phone. | Per-session: $0.01–0.05 | Menu-driven, 182 chars per screen, session-based | Requires telco partnership (Africa's Talking) |
| **IVR (Voice)** | Universal. Serves non-literate seekers. | Per-minute: $0.01–0.10 | Audio only. Could play Yogananda's voice recordings. | Lambda + Twilio Voice |

### Tier 1: WhatsApp (Highest Impact)

WhatsApp is the most impactful channel for the Global South. In India alone, WhatsApp has 500M+ users. A seeker can message the portal's WhatsApp number with a spiritual question and receive passages with full citations.

```
Seeker: "What does Yogananda say about overcoming fear?"

Portal: 📖 From *Autobiography of a Yogi*, Chapter 12, p. 98:

"Fearlessness means faith in God: faith in His
protection, His justice, His wisdom, His mercy,
His love, and His omnipresence."

— Paramahansa Yogananda

📖 1 more passage found. Reply MORE to see it.
🔗 Read the full chapter: teachings.yogananda.org/books/autobiography/12

Reply with any topic to search, or DAILY for today's wisdom.
```

**WhatsApp capabilities:**
- **Search queries.** Seeker sends a question or topic. Lambda queries the search API, formats top 1-2 results for WhatsApp's message format (1024 char limit per message, Markdown-like formatting).
- **Daily Wisdom opt-in.** Seeker sends "DAILY" to subscribe. Each morning, the same daily passage from the web portal is sent via WhatsApp. Opt-out: send "STOP."
- **Audio clips.** When a search matches an audio recording, send a brief audio clip (WhatsApp supports up to 16MB audio messages). "Listen to Yogananda speak about this topic."
- **Language selection.** Seeker sends "HINDI" or "ESPAÑOL" to switch language for UI messages. Content availability depends on translated corpus.
- **Share from portal.** On the web portal, `navigator.share` already surfaces WhatsApp as a sharing target. The shared link includes Open Graph metadata so the message renders with a passage preview.

**Implementation:**
```
Seeker (WhatsApp) → WhatsApp Cloud API webhook → API Gateway → Lambda
 │
 ├── Parse message intent (topic search, command, language switch)
 ├── Query /api/v1/search or /api/v1/daily-passage
 ├── Format response for WhatsApp (Markdown, citations, buttons)
 └── Send reply via WhatsApp Cloud API
```

### Tier 2: SMS (Widest Reach)

SMS reaches every phone on Earth. No app, no internet, no data plan. The seeker texts a topic keyword to a phone number and receives a Yogananda passage by SMS.

```
Seeker texts "FEAR" to +1-XXX-YYY-ZZZZ

Reply:
"Fearlessness means faith in God: faith in His
protection, His justice, His wisdom, His love."
— Yogananda, Autobiography of a Yogi, Ch.12, p.98
Reply FEAR2 for more. DAILY for daily wisdom.
```

**SMS constraints:**
- **160 characters** (Latin script) or **70 characters** (Unicode/non-Latin) per segment. Multi-part SMS is possible but more expensive and less reliable.
- **Short passages only.** Affirmations, aphorisms, and brief quotes from *Sayings of Paramahansa Yogananda* and *Scientific Healing Affirmations* fit well. Long narrative passages from *Autobiography* must be truncated with "..." and a citation.
- **No links** (feature phones can't open URLs). The passage must be self-contained.
- **Cost.** SMS costs vary widely: ~$0.002/message in India, ~$0.04/message in the US, ~$0.01–0.02/message in Africa. Monthly cost depends on volume. At 1,000 messages/day globally: ~$600–1,200/month.
- **Dedicated numbers.** Short codes (e.g., "text YOGANANDA to 12345") are expensive ($500–1,000/month in the US). Long codes or toll-free numbers are cheaper. Local numbers per country reduce inbound cost for seekers.

**SMS sharing from the portal:**
- `navigator.share` already includes SMS as a sharing target on smartphones
- The shared content should be the passage text + citation (not just a URL), since the recipient may be on a feature phone that can't open links
- Passage share format for SMS: `"{quote}" — Yogananda, {Book}, Ch.{N}, p.{P}`

**SMS inbound implementation:**
```
Seeker (SMS) → Twilio / Africa's Talking webhook → API Gateway → Lambda
 │
 ├── Parse keyword (topic, command)
 ├── Query /api/v1/search (limit=1, optimized for short passages)
 ├── Format for SMS (truncate to 160 chars, include citation)
 └── Send reply via SMS gateway
```

### Tier 3: Telegram Bot (Free, Rich)

Telegram is free to operate (no per-message cost) and offers rich formatting. Worth building because the marginal cost after WhatsApp is low — same Lambda function, different message formatting.

```
/search overcoming fear → Search and return passages
/daily → Subscribe to daily wisdom
/audio fear → Find audio recordings on this topic
/language hindi → Switch UI language
```

### Tier 4: USSD and IVR (Exploration)

USSD and voice are the deepest-reach channels but require telco partnerships and are operationally complex. Evaluate after WhatsApp and SMS prove demand.

**USSD concept (Africa):**
```
Dial *384*YOGA#
1. Search teachings
2. Today's wisdom
3. Listen to audio
4. Change language
```

**IVR concept:**
```
Call +1-XXX-YYY-ZZZZ
"Welcome to the teachings of Paramahansa Yogananda.
Press 1 to hear today's wisdom.
Press 2 to search by topic.
Press 3 to hear a recording of Yogananda's voice."
```

IVR is uniquely powerful because it serves non-literate seekers and allows playing Yogananda's actual voice recordings — a direct connection to the Master's teachings that no text channel can provide.

### Shared Architecture

All channels share the same backend:

```
 ┌──────────────┐
WhatsApp webhook ──→│ │
SMS webhook ───────→│ Lambda │──→ /api/v1/search
Telegram webhook ──→│ (channel │──→ /api/v1/daily-passage
USSD callback ────→│ router) │──→ /api/v1/audio
IVR webhook ──────→│ │──→ /api/v1/books
 └──────────────┘
 │
 Format response
 per channel constraints
 │
 ┌──────────────┐
 │ Send reply │
 │ via channel │
 │ API │
 └──────────────┘
```

The Lambda function:
1. Receives the webhook (channel-agnostic intent parsing)
2. Queries the same `/api/v1/` endpoints that the web portal uses
3. Formats the response for the channel's constraints (160 chars for SMS, 1024 chars for WhatsApp, Markdown for Telegram)
4. Sends the reply via the channel's API

**No new content infrastructure.** Every passage served via messaging channels is the same passage served on the web — same database, same search, same citations.

### Data Model

```sql
-- Messaging channel subscriptions (daily wisdom opt-in)
CREATE TABLE messaging_subscriptions (
 id UUID PRIMARY KEY DEFAULT uuidv7(),
 channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'sms', 'telegram')),
 channel_id TEXT NOT NULL, -- phone number or Telegram user ID
 subscription_type TEXT NOT NULL DEFAULT 'daily' CHECK (subscription_type IN ('daily')),
 language TEXT NOT NULL DEFAULT 'en',
 status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'unsubscribed')),
 subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now,
 unsubscribed_at TIMESTAMPTZ,
 UNIQUE (channel, channel_id, subscription_type)
);

-- Messaging interaction log (anonymized, for cost tracking and channel health)
-- NO personal data. NO message content. Just aggregate counts.
CREATE TABLE messaging_metrics (
 id UUID PRIMARY KEY DEFAULT uuidv7(),
 channel TEXT NOT NULL,
 interaction_type TEXT NOT NULL CHECK (interaction_type IN ('search', 'daily', 'subscribe', 'unsubscribe', 'audio')),
 country_code TEXT, -- from phone number prefix (not stored with identity)
 language TEXT NOT NULL DEFAULT 'en',
 created_at TIMESTAMPTZ NOT NULL DEFAULT now
);

CREATE INDEX idx_messaging_subs_channel ON messaging_subscriptions(channel, status);
CREATE INDEX idx_messaging_metrics_daily ON messaging_metrics(created_at, channel);
```

**DELTA compliance:** The `messaging_metrics` table stores interaction counts, not conversations. No message content is stored. No behavioral profiling. Country code is derived from phone number prefix for aggregate reporting only (e.g., "42% of SMS queries come from India"), never stored with identity.

### Cost Projection

| Channel | Monthly Cost (est. at 1,000 daily interactions) | Notes |
|---------|------------------------------------------------|-------|
| WhatsApp | $150–300 | Per-conversation pricing. User-initiated conversations are cheapest. |
| SMS | $600–1,200 | Varies wildly by country. India is cheap; US is expensive. |
| Telegram | $0 | Free API. Only Lambda compute cost. |
| USSD | Requires telco negotiation | Typically $0.01–0.05/session in Africa. |
| IVR | $300–600 | Per-minute voice pricing. Short interactions. |

### Rationale

- **The mission demands it.** "Freely accessible worldwide" cannot mean "freely accessible to people with smartphones and data plans." 3+ billion people have basic phones. If the portal only serves web browsers, it is not fulfilling its mission.
- **API-first makes it cheap.** The `/api/v1/` endpoints already exist. Each messaging channel is a Lambda function that reformats API responses. The content infrastructure cost is zero — only the delivery channel costs money.
- **WhatsApp is the highest-leverage investment.** 2.7 billion users, dominant in exactly the regions where the teachings are most sought (India, Latin America, Africa). A WhatsApp bot costs less per month than a single Contentful developer seat.
- **SMS is the deepest-reach investment.** No smartphone needed, no internet needed, no data plan needed. A seeker in a village with a basic phone can text "PEACE" and receive Yogananda's words. This is the most mission-aligned feature the portal could build.
- **Channels compose.** Each new channel is incremental — same Lambda, same API, different formatter. Adding Telegram after WhatsApp is a weekend of work, not a quarter of work.

### Consequences

- Milestone 5a: WhatsApp Business API integration (alongside daily email — shared infrastructure). Daily wisdom via WhatsApp. Search via WhatsApp.
- Milestone 5a: RSS feeds (machine syndication, complementary channel)
- Milestone 7b: SMS access gateway (requires cost evaluation per region, dedicated phone numbers)
- Milestone 7b: Telegram bot (low cost, incremental after WhatsApp)
- Future: USSD (requires telco partnership, evaluate in Milestone 7b)
- Future: IVR/Voice (evaluate after audio section exists, Arc 6+)
- `messaging_subscriptions` and `messaging_metrics` tables added to schema
- Lambda function for channel routing (`/lambda/functions/messaging/`)
- WhatsApp Business account registration (requires Meta business verification)
- SMS provider evaluation: Twilio (global), Africa's Talking (Africa-optimized), Gupshup (India-optimized)
- Passage formatting service in `/lib/services/format.ts` — formats a passage for different channel constraints (160 chars, 1024 chars, Markdown, plain text)
- **Extends** ADR-024 (native share) — SMS sharing from the portal now includes passage text, not just a URL
- **Extends** Milestone 7b (SMS access gateway) — now part of a broader multi-channel strategy, not a standalone experiment
- **Replaces** the Milestone 7b "exploration" framing with a committed delivery plan starting at Milestone 5a (WhatsApp)

---

---

## ADR-027: Language API Design — Locale Prefix on Pages, Query Parameter on API

**Status:** Accepted | **Date:** 2026-02-20

### Context

The portal serves content in multiple languages (Milestone 5b+). Two independent systems need language awareness: the frontend pages (rendered by Next.js for seekers) and the API routes (consumed by the web frontend, mobile apps, WhatsApp bots, and future integrations). The question is how language is expressed in URLs.

Three approaches were considered:

| Approach | Frontend URL | API URL | Pros | Cons |
|----------|-------------|---------|------|------|
| **Locale prefix everywhere** | `/hi/themes/peace` | `/api/v1/hi/themes/peace/passages` | Consistent URL pattern | Conflates locale and API versioning; not every API endpoint is language-scoped (`/health`, passage-by-id); awkward for mobile apps that manage locale in their own state |
| **Query parameter everywhere** | `/themes/peace?language=hi` | `/api/v1/themes/peace/passages?language=hi` | Clean API contract; single endpoint surface | Loses SEO benefits for frontend pages; no `hreflang` linking; no `lang` attribute signal from URL |
| **Hybrid: prefix on pages, parameter on API** | `/hi/themes/peace` | `/api/v1/themes/peace/passages?language=hi` | SEO-friendly pages; clean API contract; each system uses the pattern natural to its consumers | Two patterns to understand (but each is standard in its domain) |

### Decision

Adopt the **hybrid approach**: locale path prefix on frontend pages, query parameter on API routes.

**Frontend pages:** `/{locale}/path` — standard Next.js i18n routing via `next-intl`.

```
/hi/themes/peace ← Hindi theme page
/hi/books/autobiography ← Hindi book page
/hi/search?q=... ← Hindi search
/hi/quiet ← Hindi Quiet Corner
/themes/peace ← English (default, no prefix)
```

**API routes:** `/api/v1/path?language={locale}` — language as query parameter.

```
/api/v1/themes/peace/passages?language=hi ← Hindi passages for theme
/api/v1/search?q=...&language=hi ← Hindi search
/api/v1/daily-passage?language=hi ← Hindi daily passage
/api/v1/passages/[chunk-id] ← Language inherent to chunk
/api/v1/passages/[chunk-id]?language=hi ← Cross-language: find Hindi equivalent via canonical_chunk_id
/api/v1/health ← No language parameter needed
```

**Server Components** call service functions with language as a function parameter: `findPassages(query, 'hi', options)`. The locale is extracted from the URL prefix by the Next.js middleware and passed down. The service layer never reads the URL — it receives language as a plain argument.

### Rationale

- **Language is a property of content, not a namespace for operations.** "Search" is the same operation regardless of language. The `?language=` parameter modifies what content is returned, not what operation is performed. This is the fundamental insight.
- **API consumers vary.** The web frontend handles locale via URL prefix (standard i18n SEO). A mobile app manages locale in its own state. A WhatsApp bot receives locale from the user's profile. A third-party scholar tool may request multiple languages in sequence. The API should serve all with a single, clean contract.
- **Not every endpoint is language-scoped.** `/api/v1/health`, `/api/v1/passages/[chunk-id]` (the passage already *is* in a language), `/api/v1/books` (returns all books with their `language` field) — forcing a locale prefix on these creates semantic confusion.
- **CDN caching works with query parameters.** Vercel caches based on full URL including query string. `?language=hi` produces a distinct cache entry.
- **Versioning and locale are orthogonal.** `/api/v1/` is the version namespace. Locale is content filtering. Mixing them (`/api/v1/hi/`) conflates two independent axes of variation.
- **10-year horizon.** New languages are added by supporting a new `language` parameter value — no new route structure, no new endpoints. The API contract is stable across all future languages.

### Consequences

- Frontend i18n uses `next-intl` with URL-based locale prefixes from Milestone 2a (consistent with ADR-075)
- All API endpoints accept an optional `language` query parameter (default: `en`)
- The `language` parameter triggers locale-first search and English fallback at the service layer (ADR-075)
- Mobile apps and other consumers pin to the API and pass language as a parameter
- Server Components extract locale from the URL prefix and pass it to service functions — business logic never reads URLs
- `hreflang` tags on frontend pages enable cross-locale SEO linking
- The OG meta tags on passage share URLs include the language, so shared links render in the correct locale
- **Extends ADR-075** (multi-language architecture) and **ADR-011** (API-first architecture)

---

## ADR-029: Autobiography of a Yogi as Focus Book

- **Status:** Accepted
- **Date:** 2026-02-17

### Context

The SRF corpus spans dozens of books and thousands of pages. Arc 1 needs a single book to prove the search pattern.

| Book | Pages | Why Consider | Why Not |
|------|-------|-------------|---------|
| **Autobiography of a Yogi** | ~500 | Most widely read; accessible; diverse topics; narrative style | Less scriptural commentary |
| The Second Coming of Christ | ~1,600 | Rich scriptural commentary; verse-by-verse structure tests chunking | Massive; OCR quality uncertain; 2 volumes |
| God Talks With Arjuna | ~1,200 | Dense philosophical content; tests semantic search depth | Similar concerns as above |

### Decision

Start with **Autobiography of a Yogi**.

### Rationale

- Most recognizable and accessible Yogananda work
- Moderate size (~500 pages, manageable for manual QA)
- Contains diverse topics (meditation, miracles, science, daily life, relationships, death) — good for testing search breadth
- Narrative prose style tests the chunking strategy differently than verse commentary
- Available in many translations (useful for future multi-language testing)

### Consequences

- The chunking strategy optimized for narrative prose may need adjustment for verse-by-verse commentary books (Second Coming, Bhagavad Gita) later
- Arc 1 demonstrates the concept on the most popular book, which is strategically useful for stakeholder presentations

---

---

## ADR-030: Book Ingestion Priority — Life-Impact Over Scholarly Significance

- **Status:** Accepted
- **Date:** 2026-02-17

### Context

The Roadmap (Milestone 3a) originally listed post-Arc 1 books in an order roughly corresponding to scholarly depth and corpus size: The Second Coming of Christ, God Talks With Arjuna, Man's Eternal Quest, The Divine Romance, etc. However, the question of what makes the portal *essential* for seekers shifts the optimization target from scholarly completeness to life-impact — which books most directly address the reasons people seek spiritual guidance?

| Ordering Criterion | Optimizes For | Risk |
|-------------------|---------------|------|
| **Scholarly significance** | Deep students, long-term corpus completeness | Multi-volume scriptural commentaries are massive (1,200–1,600 pages each) and require complex verse-aware chunking — delaying the availability of more accessible works |
| **Life-impact potential** | Newcomers, seekers in crisis, daily visitors, SEO discoverability | Smaller, topically organized books may have less depth per passage |

### Decision

Reorder book ingestion to prioritize **life-impact potential** — books that are topically organized, highly quotable, and directly address universal human struggles (fear, grief, health, relationships, purpose).

**Revised priority:**

| Priority | Book | Rationale |
|----------|------|-----------|
| 1 | *Autobiography of a Yogi* | Arc 1 focus (already decided, ADR-029) |
| 2 | *Where There Is Light* | Organized by life topic (hope, courage, healing, success). Directly powers thematic navigation. Maps to the "Doors of Entry" feature. |
| 3 | *Sayings of Paramahansa Yogananda* | Standalone aphorisms — naturally pre-chunked. Powers the "Today's Wisdom" daily passage feature. Lowest ingestion complexity. |
| 4 | *Scientific Healing Affirmations* | Directly addresses health, abundance, and peace. Powers "The Quiet Corner." Practical and actionable. |
| 5 | *Man's Eternal Quest* | Collected talks addressing every major life challenge. Rich, practical, accessible prose. |
| 6 | *The Divine Romance* | Collected talks on love, relationships, divine longing. Deeply poetic and practical. |
| 7 | *How You Can Talk With God* | Short, accessible, foundational. Good for newcomers. |
| 8 | *Metaphysical Meditations* | Affirmations and meditations. Supplements the Quiet Corner and daily passage features. |
| 9 | *Journey to Self-Realization* | Third volume of collected talks. |
| 10 | *Wine of the Mystic* | Rubaiyat commentary — beautiful but niche audience. |
| 11–12 | *Second Coming of Christ / God Talks With Arjuna* | Massive multi-volume scriptural commentaries. Highest value for advanced students. Require verse-aware chunking (complex). Lower urgency for making the portal essential to newcomers. |
| 13 | *The Holy Science* (Swami Sri Yukteswar) | Guru tier (PRO-014). Dense, aphoristic philosophical text. Requires author-specific chunking parameters (shorter target range). Directly relevant to PRO-009 scientific-spiritual bridge themes. |
| 14 | *Only Love* / *Finding the Joy Within You* / *Enter the Quiet Heart* (Sri Daya Mata) | President tier (PRO-014). Conversational style closer to Yogananda's collected talks. Three short volumes. |
| 15 | *The Guru and the Disciple* (Sri Mrinalini Mata) | President tier (PRO-014). Editorial/biographical work about Yogananda's posthumous publications. |
| 16 | *Rajarsi Janakananda: A Great Western Yogi* | President tier (PRO-014). Biographical, SRF-published. |

### Rationale

- Books 2–4 are short, topically structured, and low-complexity for ingestion — they deliver outsized impact for minimal engineering effort
- *Where There Is Light* is literally a topical index of Yogananda's teachings — its structure maps directly to the teaching topics navigation feature
- *Sayings* requires almost no chunking strategy — each saying is a natural chunk
- The two large scriptural commentaries (1,200–1,600 pages each, verse-by-verse structure) require specialized chunking and represent significant ingestion effort for an audience that skews toward advanced students
- This ordering maximizes the portal's usefulness to the broadest audience soonest

### Consequences

- Milestone 3a scope changes: the multi-volume scriptural commentaries move from "first after Arc 1" to "after the collected talks"
- The verse-aware chunking challenge (originally a Milestone 3a concern) is deferred, allowing more time to design a robust solution
- The portal reaches "critical mass" of quotable, thematically diverse content sooner
- *Where There Is Light* + *Sayings* + *Scientific Healing Affirmations* can potentially be ingested in the same sprint as Milestone 3a begins, since they are short and structurally simple

---

---

## ADR-031: Teaching Topics — Curated Thematic Entry Points

- **Status:** Accepted
- **Date:** 2026-02-17

### Context

The current portal design centers on a search bar: the user must articulate a query to find relevant passages. But many seekers — especially those arriving in distress — cannot articulate what they need. They know they are suffering, but they may not know that Yogananda wrote specifically about their kind of suffering.

Three approaches were considered:

| Approach | Description | Pros | Cons |
|----------|-------------|------|------|
| **Search-only** | User must type a query | Simple; no editorial curation needed | Requires the user to know what to search for; fails the "2 AM crisis" test |
| **AI recommendation engine** | AI analyzes user behavior and recommends passages | Personalized; adaptive | Violates DELTA principle of Agency (algorithmic manipulation); violates Calm Technology (attention-harvesting); requires user accounts and tracking |
| **Curated thematic entry points** | Pre-defined teaching topics (Peace, Courage, Healing, Joy, Purpose, Love) with editorially tagged passages | No tracking; no algorithmic manipulation; works for anonymous users; SEO-discoverable | Requires editorial effort to tag passages; topics are subjective |

### Decision

Implement **curated thematic entry points** ("Doors of Entry") as a complement to search. The homepage presents 4–6 teaching topics alongside the search bar. Each topic links to a curated collection of passages drawn from across all ingested books.

**Initial theme taxonomy:**

| Theme | Maps to Life Challenges | Yogananda's Terms |
|-------|------------------------|-------------------|
| **Peace** | Anxiety, stress, overwhelm, insomnia | Calmness, equanimity, stillness, tranquility |
| **Courage** | Fear, self-doubt, uncertainty, worry | Fearlessness, divine protection, will power |
| **Healing** | Physical illness, depression, grief, addiction | Health, vitality, affirmation, life force |
| **Joy** | Depression, loneliness, emptiness, sorrow | Bliss, divine joy, happiness, ananda |
| **Purpose** | Existential questioning, career, direction | Dharma, duty, right activity, God's plan |
| **Love** | Relationships, family, loneliness, loss | Divine love, unconditional love, soul love, friendship |

### Rationale

- **Meets seekers where they are.** A person in crisis doesn't need a search engine — they need a door to walk through. "Peace" is easier to tap than formulating "how do I overcome anxiety according to Yogananda."
- **No algorithmic manipulation.** Themes are editorially curated, not behaviorally targeted. Every user sees the same doors. This satisfies the DELTA principle of Agency.
- **No tracking required.** Works for anonymous users with no accounts. Aligns with the portal's zero-friction access design.
- **SEO discoverability.** Theme pages (e.g., `/themes/peace`, `/themes/healing`) become landing pages. Someone Googling "spiritual guidance for grief" can land directly on a relevant page.
- **Scales with the corpus.** Each new ingested book adds passages to existing themes. The doors become richer over time without redesign.
- **Precedent in Yogananda's own works.** *Where There Is Light* is organized exactly this way — by life topic. The feature is a digital extension of an editorial structure Yogananda's publishers already established.

### Implementation

- A `teaching_topics` table in Neon with a many-to-many join to `book_chunks`
- Themes assigned during ingestion (automated via embeddings + human review) or as a lightweight editorial curation step
- Theme pages are pre-built search results, rendered as static pages with ISR
- Each theme page shows a rotating selection of passages (different on each visit, not algorithmically personalized — simple random sampling)

### Consequences

- Requires a theme taxonomy to be defined and maintained (initial set above, expandable)
- Requires tagging infrastructure: either manual tagging during ingestion QA, or semi-automated tagging using embedding similarity to theme descriptions
- Theme pages need design work (a new page template beyond search results and the book reader)
- The tagging effort is front-loaded but amortized: once the taxonomy exists, new books are tagged during their ingestion pipeline
- The themes must be validated against the actual corpus — a theme is only useful if the corpus contains sufficient passages for it
- **Extended by ADR-032:** Multi-category taxonomy (quality, situation, person, principle, scripture, practice, yoga_path), semi-automated tagging pipeline with three-state provenance, and `description_embedding` for auto-tagging

---

---

## ADR-032: Teaching Topics Multi-Category Taxonomy and Semi-Automated Tagging Pipeline

**Status:** Accepted | **Date:** 2026-02-18

### Context

The initial teaching topic design (ADR-031) defined six abstract spiritual qualities — Peace, Courage, Healing, Joy, Purpose, Love — as curated thematic entry points ("Doors of Entry") on the homepage. These serve seekers who want to cultivate a spiritual quality.

However, Yogananda wrote extensively about *life circumstances* — relationships, parenting, grief, work, aging, loneliness. These are a different kind of entry point: not "I want to cultivate this quality" but "I'm going through this and need guidance." A seeker dealing with a divorce, raising a child, or mourning a parent has a concrete situational need that the abstract quality themes don't directly address.

The portal's theme taxonomy needed to expand to serve both dimensions without compromising the calm, focused homepage design.

### Alternatives Considered

| Approach | Description | Pros | Cons |
|----------|-------------|------|------|
| **Expand the flat list** | Add situation themes alongside quality themes in a single list | Simple; no schema change | Homepage "Doors of Entry" grid becomes unwieldy at 12–15 themes; mixes two different kinds of entry point |
| **Two-tier taxonomy** | Add a `category` column ('quality' vs 'situation'); homepage shows only qualities; a "Browse all themes" page shows both | Preserves calm homepage; honest about the two different entry-point types; trivial schema change | Situation themes are one click further from the homepage |
| **Expand "Seeking..." section** | Keep six quality themes; evolve "Seeking..." entry points into full curated collections | No schema change; preserves homepage | Overloads the "Seeking..." section, which was designed as empathic search shortcuts, not browsable collections |

### Decision

Implement a **multi-category theme taxonomy** with a `category` column on `teaching_topics`:

- **`quality`** — spiritual/emotional states (Peace, Courage, Healing, Joy, Purpose, Love). Displayed as "Doors of Entry" on the homepage. Six cards, stable.
- **`situation`** — life circumstances (Relationships, Parenting, Loss & Grief, Work, Loneliness, Aging, and others as content supports). Accessible from "Explore all themes" page linked below the Doors of Entry and from Books. Not on the homepage grid.
- **`person`**, **`principle`**, **`scripture`**, **`practice`**, **`yoga_path`** — added in ADR-033. Accessible from the "Explore all themes" page. Same tagging pipeline.

All categories use the same theme page template (`/themes/[slug]`). No visual distinction — a seeker browsing "Christ" gets the same reverent, passage-focused experience as one browsing "Peace."

### Theme Tagging Pipeline

Themes are applied to passages via a **semi-automated pipeline: embeddings propose, humans approve.**

**Three-layer process:**

1. **Embedding similarity (automated proposal).** Each theme has a `description` field and a `description_embedding` (same model as book chunks). At ingestion time — or when a new theme is added retroactively — every chunk's embedding is compared against every theme's description embedding via cosine similarity. Chunks above a threshold (e.g., 0.45) receive a candidate `chunk_topics` row with `tagged_by = 'auto'`. This is pure vector math against existing embeddings — no new API calls, no re-ingestion.

2. **Claude classification (optional, for ambiguous cases).** Passages near the similarity threshold may be ambiguous — a passage about "finding peace in family conflict" could be Peace, Relationships, or Healing. Claude can be used as a classifier (same "librarian" role as in search — classifying, not generating): given a passage and theme definitions, which themes apply? This catches what pure vector similarity misses.

3. **Human review (mandatory gate).** No auto-tagged passage is served to users. Auto-tagging produces a candidate list per theme. A reviewer approves, rejects, or adjusts. Approved tags are marked `tagged_by = 'reviewed'`. Reviewers can adjust `relevance` — a passage that perfectly encapsulates the theme gets higher relevance, making it more likely to appear on the theme page.

**Three-state `tagged_by` provenance:**

| Value | Meaning | Served to users? |
|-------|---------|-----------------|
| `manual` | Human placed this tag directly | Yes |
| `auto` | Machine proposed, not yet reviewed | **No** — candidates only |
| `reviewed` | Machine proposed, human approved | Yes |

**Adding a new theme retroactively is cheap:** All chunks already have embeddings. Adding "Relationships" requires one `INSERT` into `teaching_topics`, one vector similarity scan (seconds), optional Claude refinement on borderline cases, and human review of the candidate list. No re-ingestion, no re-embedding. The front-loaded cost is the initial tagging of existing books. After that, each new theme is incremental.

**Publication decision:** A topic page goes live when an editor judges the tagged passages have sufficient depth. No fixed minimum count — five deeply relevant passages about a niche topic like Laya Yoga is worth publishing, while three tangentially tagged passages about a broader topic probably isn't. Human judgment, not mechanical thresholds. This is consistent with the portal's philosophy: AI proposes, humans approve.

### Schema Changes

```sql
-- teaching_topics: add category and description_embedding columns
ALTER TABLE teaching_topics ADD COLUMN category TEXT NOT NULL DEFAULT 'quality';
ALTER TABLE teaching_topics ADD COLUMN description_embedding VECTOR(1024);
CREATE INDEX idx_teaching_topics_category ON teaching_topics(category);

-- chunk_topics: three-state tagged_by + similarity score
-- tagged_by values: 'manual', 'auto', 'reviewed'
-- similarity: cosine similarity when auto-tagged (NULL for manual)
ALTER TABLE chunk_topics ADD COLUMN similarity FLOAT;
CREATE INDEX idx_chunk_topics_pending ON chunk_topics(tagged_by) WHERE tagged_by = 'auto';
```

### API Changes

`GET /api/v1/themes` gains a `category` query parameter:
- `category=quality` — returns only quality themes (used by homepage Doors of Entry)
- `category=situation` — returns only situation themes
- `category=person` — spiritual figures (ADR-033)
- `category=principle` — yogic principles / Yama-Niyama (ADR-033)
- `category=scripture` — sacred texts (ADR-033)
- `category=practice` — spiritual practices (ADR-033)
- `category=yoga_path` — paths of yoga (ADR-033)
- Omitted — returns all topics, ordered by category then sort_order

`GET /api/v1/themes/[slug]/passages` — unchanged. Works identically for all categories. Only serves passages with `tagged_by IN ('manual', 'reviewed')`.

### Multilingual Implications

None. The existing `topic_translations` table handles localized names for any theme regardless of category. Theme descriptions used for auto-tagging are internal (not displayed). The multilingual embedding model produces reasonable candidates for non-English chunks even from English-language theme descriptions. Per-language theme descriptions can improve accuracy in Milestone 5b but are not required.

### Consequences

- Milestone 3b scope expanded: deliverable 4.1 (theme tagging pipeline) now includes the auto-tagging infrastructure, not just manual tagging
- Situation themes are added incrementally during Milestone 3b+ as content is ingested and sufficient passages confirmed
- The homepage stays calm — six quality doors, one quiet link to explore all themes
- Editorial governance needed: who decides when a new theme has enough passages to go live?
- The `description` field on `teaching_topics` now serves double duty: internal reference *and* auto-tagging input. Descriptions should be written as rich keyword-laden paragraphs, not terse labels.
- The review queue (`tagged_by = 'auto'`) needs a workflow — Arcs 1–4 use a script or Retool dashboard; Arc 4+ uses Contentful
- **Extended by ADR-033:** Four additional exploration categories (person, principle, scripture, practice) added to the taxonomy, using the same infrastructure

---

---

## ADR-033: Exploration Theme Categories — Persons, Principles, Scriptures, Practices, Yoga Paths

**Status:** Accepted | **Date:** 2026-02-19

### Context

ADR-032 established a two-tier theme taxonomy (`quality` and `situation`) on the `teaching_topics` table. This serves seekers who approach Yogananda's teachings through emotional/spiritual needs or life circumstances. But seekers also approach through *intellectual and traditional frameworks*:

- **By person:** "What does Yogananda say about Christ?" or "Teachings about Krishna"
- **By yogic principle:** "Yogananda on ahimsa" or "What is tapas?"
- **By scripture:** "Yogananda's interpretation of the Yoga Sutras" or "Gita teachings"
- **By practice:** "How to meditate" or "Yogananda on pranayama"

These are natural entry points for scholars, yoga practitioners, interfaith seekers, and devotees with specific study interests. They require no new infrastructure — they use the same `teaching_topics` table, the same tagging pipeline, the same page template, and the same three-state provenance.

### Decision

Add five new categories to the `teaching_topics.category` column:

| Category | Description | Examples |
|----------|-------------|----------|
| **`person`** | Spiritual figures Yogananda discusses | Christ, Krishna, Lahiri Mahasaya, Sri Yukteswar, Patanjali, Kabir, Divine Mother |
| **`principle`** | Yogic ethical principles (Yama/Niyama) | Ahimsa, Satya, Asteya, Brahmacharya, Aparigraha, Saucha, Santosha, Tapas, Svadhyaya, Ishvara Pranidhana |
| **`scripture`** | Scriptural frameworks Yogananda interprets | Yoga Sutras, Bhagavad Gita, Bible, Rubaiyat of Omar Khayyam |
| **`practice`** | Spiritual practices | Meditation, Concentration, Pranayama, Affirmation, Devotion |
| **`yoga_path`** | Paths of yoga | Kriya Yoga, Raja Yoga, Bhakti Yoga, Karma Yoga, Jnana Yoga, Hatha Yoga, Mantra Yoga, Laya Yoga |

All categories use:
- The same `teaching_topics` table with its `category` column
- The same auto-tagging pipeline (embedding similarity + optional Claude classification + human review)
- The same three-state `tagged_by` provenance (`auto`, `reviewed`, `manual`)
- The same `/themes/[slug]` page template
- Publication is an editorial decision — no fixed minimum passage count

### Relationship to DES-027 (Reverse Bibliography)

The `person` and `scripture` categories overlap with the Reverse Bibliography feature (DES-027). The distinction:

- **`teaching_topics` (person/scripture):** "What does Yogananda *teach about* Christ/the Gita?" — passages where the topic is the central subject
- **`external_references`:** "Where does Yogananda *cite or quote* Christ/the Gita?" — passages with direct references, quotes, or allusions

Both are valuable; they serve different needs. A seeker browsing `/themes/christ` wants Yogananda's teachings about Christ consciousness. A seeker browsing `/references/jesus-christ` wants specific passages where Yogananda quotes or directly references Jesus.

### Navigation

The `/themes` page organizes all categories into distinct sections:

1. "Doors of Entry" (quality) — on homepage and themes page
2. "Life Circumstances" (situation)
3. "Spiritual Figures" (person)
4. "Yogic Principles" (principle)
5. "Sacred Texts" (scripture)
6. "Spiritual Practices" (practice)
7. "Paths of Yoga" (yoga_path)

Categories appear only when they contain at least one published topic. The homepage remains unchanged — six quality doors only.

### Scheduling

- `quality` and `situation` themes: Milestone 3b (existing plan)
- `practice` themes: Milestone 3b+ (practical themes like Meditation naturally emerge from the early content)
- `person`, `principle`, `scripture` themes: Milestone 3c+ (requires multi-book content for meaningful coverage; benefits from the Reverse Bibliography extraction pipeline)

### Alternatives Considered

| Approach | Why Rejected |
|----------|-------------|
| **Separate tables per category** | Unnecessary complexity; the same tagging infrastructure applies to all categories |
| **Hierarchical taxonomy** (e.g., scripture → Gita → Chapter 2) | Over-engineering for Milestone 3c; a flat per-category list is sufficient. Sub-categories can be added later if content depth warrants |
| **Merge with Reverse Bibliography** | Different user intent: "teach me about X" vs "show me where X is cited." Both valuable, different navigation paths |

### Consequences

- No schema migration needed — `category` column already accepts any text value
- The auto-tagging pipeline processes new categories identically to quality/situation themes
- Seed data for new categories should include rich, keyword-laden descriptions for effective auto-tagging
- The `/themes` page gains five new sections (appearing incrementally as content thresholds are met)
- The exploration categories create a rich navigational surface that invites study-oriented seekers to browse by framework, not just by emotional need
- **Extends ADR-032** with five additional categories on the existing taxonomy

---

---

## ADR-034: Edition-Aware Content Model

**Status:** Accepted | **Date:** 2026-02-19

### Context

Yogananda's books have been published in multiple editions over decades. Page numbers, chapter organization, and even paragraph boundaries can differ between editions. If SRF publishes a revised edition of *Where There Is Light* with corrected page numbers or reorganized content, every citation in the portal referencing the previous edition becomes inaccurate.

The current data model does not track edition. The `books` table has `publication_year` but no edition identifier. A re-ingestion of a revised edition would overwrite the previous data, potentially breaking:
- Shared passage links (if paragraph boundaries shifted — mitigated by ADR-022)
- Cached OG images with old page numbers
- External citations referencing portal page numbers
- Email archives with old citations

### Decision

Add `edition` and `edition_year` columns to the `books` table. Track which edition the portal serves.

#### Schema addition

```sql
ALTER TABLE books ADD COLUMN edition TEXT; -- e.g., "13th Edition", "Revised 2024"
ALTER TABLE books ADD COLUMN edition_year INTEGER; -- year of this specific edition
```

#### Content policy

- The portal serves **one edition per language per book** at any time. There is no multi-edition viewer.
- When a new edition is ingested, the old edition's data is archived (not deleted) in a `book_chunks_archive` table, preserving historical citations.
- Shared links to the old edition resolve via content-hash fallback (ADR-022). If the passage exists in the new edition (even at a different location), the link still works.
- The book landing page displays the served edition: *"Autobiography of a Yogi — 13th Edition (1998)"*.

#### Transition workflow

1. Ingest new edition to a Neon branch (not production)
2. Run content-hash comparison: identify passages that moved, changed, or were added/removed
3. Human review of all changes
4. Apply to production, archiving old edition data
5. Regenerate chunk relations for affected passages
6. Log all paragraph_index shifts for link audit

### Rationale

- **Citation accuracy over time.** The 10-year architecture horizon (ADR-004) means the portal will almost certainly serve updated editions. Tracking editions now costs two columns and prevents citation confusion later.
- **Transparent sourcing.** Displaying the edition on book pages tells seekers exactly which text they're reading. This is Sacred Text Fidelity in practice.
- **Archive for auditability.** If a theological question arises about a specific passage rendering, the archive preserves what was served and when.

### Consequences

- `edition` and `edition_year` columns added to `books` table in Arc 1 migration
- `book_chunks_archive` table created (can be empty until an actual re-ingestion occurs)
- Book landing pages display edition information
- Re-ingestion workflow documented in the operational playbook
- **Extends ADR-004** (10-year architecture) and **ADR-022** (content-addressable links)

---

---

## ADR-035: Image Content Type — Photographs as First-Class Content

**Status:** Accepted | **Date:** 2026-02-20

### Context

SRF possesses a photographic archive spanning nearly a century — historical photographs of Paramahansa Yogananda across decades of his life, portraits of the guru lineage (Sri Yukteswar, Lahiri Mahasaya, artistic depictions of Babaji and Krishna), photographs of SRF/YSS properties and biographical sites, event documentation from convocations and commemorations, and devotional artwork. The portal currently treats images as decorative assets: book covers on `books.cover_image_url`, About page portraits, Sacred Places property photographs. But photographs of Yogananda are sacred artifacts — equivalent in spiritual significance to his voice recordings — and the broader photographic archive is a content dimension that no other medium provides.

A seeker reading Autobiography's account of Yogananda at the Ranchi school cannot see the school in a physical book's photo section (unless they own that edition). A seeker exploring Sacred Places cannot see historical photographs alongside modern Street View links. A seeker studying Sri Yukteswar's teachings cannot see the guru's portrait alongside the passages. The portal can close these gaps by treating images as searchable, browsable, relatable content.

### Decision

Images become a primary content type with their own data model, browse/search experience, and participation in the cross-media content fabric (Related Teachings, editorial threads, theme tagging, place connections).

**Schema:**

```sql
CREATE TABLE images (
 id UUID PRIMARY KEY DEFAULT uuidv7(),
 title TEXT NOT NULL,
 slug TEXT NOT NULL UNIQUE,
 description TEXT,
 alt_text TEXT NOT NULL, -- Accessibility: mandatory, Claude-drafted, human-reviewed
 caption TEXT, -- Short display caption
 photographer TEXT,
 date_taken DATE,
 date_approximate TEXT, -- "circa 1935" when exact date unknown
 era TEXT, -- 'india_early', 'america_early', 'encinitas', 'modern'
 location TEXT,
 subject_type TEXT NOT NULL CHECK (subject_type IN (
 'portrait', 'group', 'place', 'event', 'artifact',
 'illustration', 'book_cover', 'devotional'
)),
 subjects TEXT[], -- ['yogananda', 'sri_yukteswar'] — who/what appears
 is_yogananda_subject BOOLEAN NOT NULL DEFAULT false,
 source_collection TEXT, -- '1920s_india', 'encinitas_hermitage', 'convocation'
 s3_key TEXT NOT NULL,
 cloudfront_url TEXT,
 width INTEGER NOT NULL,
 height INTEGER NOT NULL,
 format TEXT NOT NULL DEFAULT 'jpg',
 language TEXT NOT NULL DEFAULT 'en',
 status TEXT NOT NULL DEFAULT 'draft'
 CHECK (status IN ('draft', 'review', 'published', 'archived')),
 published_at TIMESTAMPTZ,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now,
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now
);

-- Image descriptions embedded for semantic search
-- Images don't have body text to chunk; the description is the searchable proxy
CREATE TABLE image_descriptions (
 id UUID PRIMARY KEY DEFAULT uuidv7(),
 image_id UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
 description_text TEXT NOT NULL, -- Rich contextual description for embedding
 embedding vector(1024),
 language TEXT NOT NULL DEFAULT 'en',
 created_at TIMESTAMPTZ NOT NULL DEFAULT now
);

-- Image ↔ Place spatial connections
CREATE TABLE image_places (
 image_id UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
 place_id UUID NOT NULL REFERENCES sacred_places(id) ON DELETE CASCADE,
 relationship TEXT NOT NULL DEFAULT 'depicts'
 CHECK (relationship IN ('depicts', 'taken_at', 'related_to')),
 PRIMARY KEY (image_id, place_id)
);
```

**Frontend:**

- `/images` — gallery browse with filters (subject type, era, collection, place)
- `/images/[slug]` — image detail page: full-resolution view, metadata, related passages, related places, related images from same era/collection

**API:**

- `GET /api/v1/images` — browse and filter (cursor-based pagination)
- `GET /api/v1/images/{slug}` — image detail with full metadata
- `GET /api/v1/images/{slug}/related` — cross-media related content (passages, other images, places, media)

**Key principles:**

- `is_yogananda_subject` triggers sacred artifact treatment — a visual provenance indicator, same pattern as `is_yogananda_voice` in ADR-057
- Alt text is mandatory on every image. Claude drafts descriptive, reverential alt text at ingestion time; human review is mandatory before publishing (ADR-005 E7 pattern)
- Image descriptions are the searchable proxy — the description text is embedded for vector search, since the image file itself is not textually searchable. One image, one embedding — no chunking needed.
- Content authority: images are supplementary to Yogananda's verbatim words. In search results and Related Teachings, a photograph never displaces a passage in ranking.
- Images cannot be machine-generated, AI-enhanced, or colorized. Photographic authenticity is paramount. The portal presents images as they are.
- Responsive image serving: five named tiers (thumb 300px, small 640px, medium 1200px, large 2400px, original) generated at upload time in WebP + JPEG dual format. User-facing download options on image detail pages. See ADR-064 for full size tier specification.

### Consequences

- `images` and `image_descriptions` tables added to Arc 1 schema (empty until content ingestion)
- Image ingestion pipeline, gallery, and player added when the image content type goes live
- S3 storage for images uses the same bucket and CloudFront distribution as audio files (ADR-057)
- Image search integration via unified content hub (ADR-060) when cross-media features arrive
- Claude drafts alt text and rich descriptions at ingestion time; human review mandatory before publishing
- Image descriptions are localized alongside other content in Milestone 5b (Multi-Language) via `image_descriptions.language`
- Sacred Places pages (ADR-069) gain a photographs section — images connected via `image_places`
- **Extends** ADR-005 E7 (Claude-generated alt text) — from About page photos to the entire image archive
- **Extends** ADR-057 (audio sacred artifacts) — same `is_yogananda_subject` pattern for visual sacred artifacts

---

---

## ADR-036: Spiritual Figures as First-Class Entities

**Status:** Accepted | **Date:** 2026-02-20

### Context

The portal currently models spiritual figures (Krishna, Christ, Sri Yukteswar, Lahiri Mahasaya, etc.) as teaching topics with `category = 'person'` in the `teaching_topics` table. This serves the question "What did Yogananda teach about Krishna?" — it's a collection of tagged passages.

But seekers who encounter a spiritual figure in the Autobiography often want something different: "Who *is* Krishna in the context of Yogananda's teachings?" This requires biographical context, lineage position, associated places, relationships to other figures, and *then* the relevant passages. The theme page answers a search question; the person page answers a reference question.

Three approaches were considered:

| Approach | Data Model | Pros | Cons |
|----------|-----------|------|------|
| **Person as theme only** | `teaching_topics` with `category = 'person'` | Simple; already built | No biographical metadata; no lineage structure; no place associations; every figure is "just a tag" |
| **Rich metadata on teaching_topics** | Add biographical columns to `teaching_topics` | Single table; reuses existing infrastructure | teaching_topics becomes overloaded (most topics don't have birth years or lineage positions); mixes concerns |
| **Separate people table linked to themes** | `people` table with FK to `teaching_topics` for tagging | Clean separation of entity metadata and passage tagging; each table does one thing | Additional table and API endpoint |

The same pattern applies to Places, which already have a dedicated `places` table with rich metadata (ADR-069). People deserve the same treatment.

### Decision

Add a **`people`** table as a primary content type, linked to the existing `teaching_topics` system for passage tagging. Create a Spiritual Figures section (`/people`) parallel to Books (`/books`) and Sacred Places (`/places`).

#### Schema

```sql
CREATE TABLE people (
 id UUID PRIMARY KEY DEFAULT uuidv7(),
 name TEXT NOT NULL,
 slug TEXT NOT NULL UNIQUE,
 title TEXT, -- e.g., "Paramguru," "Avatar," "Yogiraj"
 lineage_position TEXT, -- e.g., "Guru of Paramahansa Yogananda"
 birth_year INTEGER,
 death_year INTEGER, -- NULL for avatars (Krishna) or living figures
 biography_short TEXT NOT NULL, -- 2–3 sentences, editorial
 biography_long TEXT, -- full detail page content, editorial
 image_id UUID, -- FK to images table (Arc 6, ADR-035)
 topic_id UUID REFERENCES teaching_topics(id), -- links to theme tagging system
 language TEXT NOT NULL DEFAULT 'en',
 canonical_person_id UUID REFERENCES people(id), -- cross-language linking
 is_published BOOLEAN NOT NULL DEFAULT false,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now
);

CREATE INDEX idx_people_slug ON people(slug);
CREATE INDEX idx_people_published ON people(is_published) WHERE is_published = true;
```

#### Junction tables

```sql
-- People ↔ Places (e.g., Sri Yukteswar ↔ Serampore, Puri)
CREATE TABLE person_places (
 person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
 place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
 role TEXT, -- 'birthplace', 'ashram', 'teaching_center', 'burial'
 PRIMARY KEY (person_id, place_id)
);

-- People ↔ People (lineage and relationships)
CREATE TABLE person_relations (
 source_person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
 target_person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
 relation_type TEXT NOT NULL, -- 'guru_of', 'disciple_of', 'contemporary', 'referenced_by'
 PRIMARY KEY (source_person_id, target_person_id)
);
```

#### API

```
GET /api/v1/people → List all published people
 ?language=en → Filter by language
 ?lineage=true → Filter to guru lineage only

GET /api/v1/people/[slug] → Person detail with metadata
 Response includes: biographical info, lineage position,
 associated places, related people, link to theme page

GET /api/v1/people/[slug]/passages → Passages tagged with this person
 (Delegates to the existing theme tagging system via topic_id)
 ?language=en&limit=10&cursor=...
```

#### Frontend

| Route | Purpose |
|-------|---------|
| `/people` | Spiritual Figures — organized by category (guru lineage, avatars, saints, referenced figures) |
| `/people/[slug]` | Person detail — biography, lineage, places, passages |

The Spiritual Figures section links bidirectionally with:
- **Theme pages:** `/people/krishna` links to `/themes/krishna` (tagged passages) and vice versa
- **Sacred Places:** `/people/sri-yukteswar` links to `/places/serampore` and `/places/puri`
- **Book reader:** Inline references to a person in the text can link to their Spiritual Figures entry
- **Reverse Bibliography:** `/references/bhagavad-gita` links to `/people/krishna`

#### Relationship to existing theme system

The theme page (`/themes/krishna`) continues to serve the question "What did Yogananda teach about Krishna?" The person page (`/people/krishna`) serves "Who is Krishna?" The person page includes a prominent link to the theme page ("Read what Yogananda taught about Krishna →"). The `topic_id` FK on `people` connects the two systems.

### Rationale

- **Seekers ask two kinds of questions about spiritual figures.** "What did Yogananda say about X?" (theme page) and "Who is X?" (person page). Both are natural; each deserves its own answer.
- **Avatars are constant.** Krishna, Christ, and the guru lineage do not change. Their biographical entries are stable reference content — a different kind of value than the growing, curated passage collection on theme pages.
- **Monastics and living teachers.** As new monastics lead SRF, the Spiritual Figures section preserves their biographical context. This is a respectful, mission-aligned record.
- **Cross-referencing is the unique value.** The Spiritual Figures section connects people to places, to books, to passages, and to each other. No other digital resource provides this integrated view of the spiritual figures in Yogananda's world.
- **Parallel to Places and Books.** The portal already has Books (entities with metadata + linked passages) and Places (entities with metadata + linked passages). People is the natural third pillar.
- **Low schema cost, high editorial value.** One table, two junction tables. The biographical content is editorial — written once, updated rarely.

### Consequences

- `people` table added to Neon schema (Milestone 3c migration, when person-category themes activate)
- `person_places` and `person_relations` junction tables added alongside
- `/people` and `/people/[slug]` routes added to the frontend (Milestone 3c)
- API endpoints `GET /api/v1/people` and `GET /api/v1/people/[slug]` added (Milestone 3c)
- Spiritual Figures entries require SRF editorial review and approval before publication (`is_published` gate)
- Guru photographs on person pages follow ADR-042 sacred image guidelines
- Cross-language person entries linked via `canonical_person_id` (Milestone 5b)
- Theme pages for person-category topics gain a "Learn about [person] →" link to Spiritual Figures
- Reader inline references to named figures can link to Spiritual Figures entries (Milestone 3c+)
- **Extends ADR-031** (teaching topics), **ADR-069** (Sacred Places), **ADR-033** (exploration categories)

---

---

## ADR-037: Monastic & Presidential Lineage

**Status:** Accepted | **Date:** 2026-02-21

### Context

ADR-036 established the Spiritual Figures section as a primary content type with a `people` table, `person_relations` junction table, and five editorial categories on the `/people` index: guru lineage, avatars, saints and sages, referenced figures, and SRF/YSS leadership. The schema includes `birth_year`, `death_year`, `lineage_position`, and `person_relations` with relation types `guru_of`, `disciple_of`, `contemporary`, `referenced_by`.

This foundation handles "Who is Krishna?" and the guru lineage (Babaji → Lahiri Mahasaya → Sri Yukteswar → Yogananda) well. But three distinct monastic and organizational use cases expose gaps:

1. **Presidential succession.** The organizational lineage of SRF presidents (Yogananda → Rajarsi Janakananda → Daya Mata → Mrinalini Mata → Brother Chidananda) is distinct from the guru lineage. The current `person_relations` table has no `succeeded_by` relation type and no way to record the *period* of a relationship (e.g., "President from 1955 to 2010").

2. **Monastic roles and contributions.** SRF monastics serve in distinct roles — convocation speakers, editors of Yogananda's posthumous works, center leaders, board members. The current schema treats all people identically: a spiritual figure Yogananda wrote about and a monastic who edited his books share the same flat structure with no role or contribution metadata.

3. **In Memoriam and commemorative context.** The `birth_year` and `death_year` columns exist but are bare integers. There is no presentation pattern for commemorative display — a respectful "In Memoriam" treatment for monastics who have passed, or a visual timeline showing the succession of SRF leadership.

The Santa Rosa SRF Meditation Group displays a lineage of SRF presidents as an ordered visual display — photos, dates of service, a clear sense of succession. This is a natural fit for the portal, which can cross-reference each president with the teachings, places, and events of their era.

### Decision

Extend ADR-036's Spiritual Figures section with structured monastic and organizational metadata, temporal relationship tracking, and presentation patterns for lineage and commemoration.

#### Schema extensions to `people` table

```sql
ALTER TABLE people ADD COLUMN person_type TEXT NOT NULL DEFAULT 'spiritual_figure';
 -- 'spiritual_figure' (default): figures Yogananda wrote about (Krishna, Christ, Kabir)
 -- 'guru_lineage': Babaji, Lahiri Mahasaya, Sri Yukteswar, Yogananda
 -- 'monastic': SRF/YSS monastics (current and historical)
 -- 'historical': other historical figures referenced by Yogananda
 -- CHECK (person_type IN ('spiritual_figure', 'guru_lineage', 'monastic', 'historical'))

ALTER TABLE people ADD COLUMN honorific TEXT;
 -- SRF-specific honorific: 'Brother', 'Sister', 'Swami', 'Sri', 'Daya Ma', etc.
 -- Distinct from `title` (which holds spiritual titles like 'Paramguru', 'Avatar')

ALTER TABLE people ADD COLUMN is_living BOOLEAN;
 -- NULL = unknown or not applicable (avatars, ancient figures)
 -- true = living monastic or figure (editorial sensitivity applies)
 -- false = historical/passed

CREATE INDEX idx_people_type ON people(person_type) WHERE is_published = true;
```

#### Schema extensions to `person_relations` table

```sql
ALTER TABLE person_relations ADD COLUMN description TEXT;
 -- Freetext editorial context for the relationship
 -- e.g., "Served as SRF president during a period of global expansion"

ALTER TABLE person_relations ADD COLUMN start_year INTEGER;
ALTER TABLE person_relations ADD COLUMN end_year INTEGER;
 -- For temporal relationships: "President from 1955 to 2010"
 -- NULL start/end means open-ended or undated

ALTER TABLE person_relations ADD COLUMN display_order INTEGER;
 -- For ordered sequences like presidential succession
 -- NULL for unordered relationships
```

New `relation_type` values added to the existing set:

| Relation Type | Meaning | Example |
|--------------|---------|---------|
| `guru_of` | (existing) Spiritual teacher → student | Sri Yukteswar → Yogananda |
| `disciple_of` | (existing) Student → teacher | Yogananda → Sri Yukteswar |
| `contemporary` | (existing) Lived in same era | Yogananda ↔ Anandamayi Ma |
| `referenced_by` | (existing) Discussed in teachings | Krishna ← Yogananda |
| `succeeded_by` | (new) Organizational succession | Daya Mata → Mrinalini Mata |
| `preceded_by` | (new) Inverse of succeeded_by | Mrinalini Mata → Daya Mata |
| `mentored_by` | (new) Spiritual mentorship within SRF | Brother Anandamoy → Yogananda |
| `edited_works_of` | (new) Edited posthumous publications | Tara Mata → Yogananda |
| `collaborated_with` | (new) Worked together on SRF mission | Rajarsi Janakananda ↔ Daya Mata |

#### API extensions

```
GET /api/v1/people?person_type=monastic → Filter by person type
GET /api/v1/people?person_type=guru_lineage → Guru lineage only
GET /api/v1/people/lineage → Presidential succession
 Response: ordered array of people with service periods,
 structured for timeline rendering

GET /api/v1/people/[slug]
 Response now includes: person_type, honorific, is_living,
 relations with start_year/end_year/description
```

The `/api/v1/people/lineage` endpoint returns the presidential succession as an ordered list with service periods, suitable for rendering as a vertical timeline. It queries `person_relations` where `relation_type = 'succeeded_by'`, ordered by `display_order`.

#### Presentation patterns

**In Memoriam on person cards and detail pages:**

Person cards for figures with `death_year IS NOT NULL AND person_type IN ('monastic', 'guru_lineage')` display birth and passing years in a respectful format:

```
┌─────────────────────────────┐
│ ○ Daya Mata │
│ SRF President │
│ 1914 – 2010 │
│ │
│ "A life of selfless │
│ service to God..." │
│ │
│ Read biography → │
└─────────────────────────────┘
```

This is a *presentation pattern* — a tasteful rendering of existing data (`birth_year`, `death_year`) — not a separate feature or standalone page. The person detail page (`/people/[slug]`) renders the full biography with dates prominently but not morbidly.

**Presidential lineage as a navigable timeline on `/people`:**

The `/people` index gains a "Lineage of SRF Presidents" section rendered as a vertical timeline — a compact, ordered display showing succession with service dates and links to each president's person page. This uses the `succeeded_by` relations with `start_year`/`end_year` from `person_relations`.

```
┌──────────────────────────────────────────────┐
│ │
│ Lineage of SRF Presidents │
│ │
│ ● Paramahansa Yogananda 1920 – 1952 │
│ │ Founder and first president │
│ │ │
│ ● Rajarsi Janakananda 1952 – 1955 │
│ │ │
│ ● Sri Daya Mata 1955 – 2010 │
│ │ │
│ ● Sri Mrinalini Mata 2011 – 2017 │
│ │ │
│ ● Brother Chidananda 2017 – present │
│ │
└──────────────────────────────────────────────┘
```

**Knowledge graph lineage filter (Milestone 3d):**

The `/explore` graph gains a "Lineage" filter mode (extends ADR-062 view modes). When active, it shows only person nodes connected by `guru_of`, `disciple_of`, `succeeded_by`, and `preceded_by` edges, rendered as a directed vertical layout rather than a force-directed graph. This provides an alternate visualization of both the spiritual lineage and the presidential succession without building a one-off component.

#### Editorial governance

- All monastic biographical content requires SRF editorial review before publication (`is_published` gate, same as ADR-036).
- Living monastics (`is_living = true`) carry heightened editorial sensitivity. Biographical detail, photographs, and role descriptions must be explicitly approved by SRF. No biographical content about living monastics is auto-generated or seeded without SRF input.
- Presidential succession dates and service periods are factual public record, but the editorial framing (the `description` on each relation, the biography text) requires SRF review.
- The honorific field follows SRF's own usage — the portal does not assign or interpret monastic titles.

### Rationale

- **Three distinct lineages, one schema.** The guru lineage (spiritual transmission), presidential succession (organizational stewardship), and broader monastic community serve different seeker questions but share the same entity model. `person_type` and temporal `person_relations` handle all three without separate tables.
- **Temporal relations are essential.** "Daya Mata was SRF president" is incomplete without "from 1955 to 2010." The current `person_relations` is snapshot-oriented; adding `start_year`/`end_year` makes it timeline-capable.
- **In Memoriam is a presentation pattern, not a feature.** The data already exists (`birth_year`, `death_year`). The ADR formalizes how the portal respectfully renders it rather than building a separate commemorative system.
- **The knowledge graph is the lineage visualization.** Rather than building a standalone timeline component, the lineage filter on `/explore` reuses the graph infrastructure. The `/people` page timeline is a lightweight, text-based complement for quick reference.
- **Cross-referencing is the unique value.** SRF.org can list presidents. Wikipedia can list presidents. Only this portal can connect each president to the teachings, places, and passages of their era — "During Daya Mata's presidency, these passages about spiritual leadership were among the most shared."
- **Living monastic sensitivity.** Explicit `is_living` flag and editorial governance acknowledge that biographical content about current monastics carries different responsibilities than historical figures.

### Consequences

- `people` table gains three columns: `person_type` (with CHECK constraint), `honorific`, `is_living`
- `person_relations` table gains four columns: `description`, `start_year`, `end_year`, `display_order`
- Five new `relation_type` values: `succeeded_by`, `preceded_by`, `mentored_by`, `edited_works_of`, `collaborated_with`
- New API endpoint: `GET /api/v1/people/lineage` (presidential succession)
- Existing `GET /api/v1/people` gains `?person_type=` filter
- `/people` index gains "Lineage of SRF Presidents" timeline section (Milestone 3c)
- `/explore` gains "Lineage" graph filter mode (Milestone 3d, extends ADR-062)
- Person cards render In Memoriam presentation for applicable figures (Milestone 3c)
- Milestone 3c seed data expanded: presidential succession entries with service dates alongside existing spiritual figure seeds
- **Extends:** ADR-036, ADR-061, ADR-062
- **New stakeholder questions:** SRF editorial policy on living monastic biographical content; monastic content scope (content *by* vs. *about* monastics); preferred depth of presidential succession editorial framing

---

---

## ADR-038: Living Glossary — Spiritual Terminology as User-Facing Feature

**Status:** Accepted | **Date:** 2026-02-20

### Context

The Vocabulary Bridge (ADR-129) maps modern and cross-tradition terms to Yogananda's vocabulary for internal search expansion. It is invisible to seekers. Yet Yogananda's writings use hundreds of Sanskrit, yogic, and esoteric terms — *samadhi*, *chitta*, *prana*, *astral body*, *Christ Consciousness* — that newcomers cannot be expected to know. A seeker encountering "samadhi" for the first time has nowhere within the portal to learn what it means. They must leave the portal, which breaks the reading flow and undermines the library's self-contained nature.

### Decision

Surface the spiritual terminology bridge as a user-facing glossary with two delivery mechanisms:

**1. Glossary page (`/glossary`):**
- Browsable, searchable, organized by category (Sanskrit terms, yogic concepts, spiritual states, scriptural references)
- Each entry contains: term, brief definition (1-2 sentences, editorially written), Yogananda's own explanation (verbatim quote from the corpus where he defines the term, with full citation), and links to theme pages and reader passages where the term appears
- Search within the glossary uses trigram matching (`pg_trgm`) for partial/fuzzy lookups
- Multilingual: glossary entries carry a `language` column; Milestone 5b adds per-locale glossaries built during the human review cycle

**2. Inline term highlighting in the reader (opt-in):**
- Toggle in reader settings: "Show glossary terms" (off by default)
- When enabled, recognized glossary terms in the reader text receive a subtle dotted underline (`border-bottom: 1px dotted var(--srf-gold)` at 40% opacity)
- Hovering (desktop) or tapping (mobile) reveals a tooltip: brief definition + "Read Yogananda's explanation →" linking to the relevant passage
- No AI-generated definitions — every definition is editorially written, every "explanation" is a verbatim Yogananda quote
- Terms are matched at ingestion time (stored in `chunk_glossary_terms` junction table), not at render time — zero client-side regex

### Schema

```sql
CREATE TABLE glossary_terms (
 id UUID PRIMARY KEY DEFAULT uuidv7(),
 term TEXT NOT NULL,
 slug TEXT NOT NULL UNIQUE,
 brief_definition TEXT NOT NULL, -- 1-2 sentences, editorially written
 category TEXT NOT NULL CHECK (category IN (
 'sanskrit', 'yogic_concept', 'spiritual_state',
 'scriptural', 'cosmological', 'practice'
)),
 explanation_chunk_id UUID REFERENCES book_chunks(id), -- Yogananda's own definition
 language TEXT NOT NULL DEFAULT 'en',
 sort_order INTEGER,
 created_at TIMESTAMPTZ DEFAULT now,
 updated_at TIMESTAMPTZ DEFAULT now
);

CREATE TABLE chunk_glossary_terms (
 chunk_id UUID NOT NULL REFERENCES book_chunks(id) ON DELETE CASCADE,
 term_id UUID NOT NULL REFERENCES glossary_terms(id) ON DELETE CASCADE,
 PRIMARY KEY (chunk_id, term_id)
);
```

### Scheduling

- Data: Seeded from Vocabulary Bridge Layer 2 entries (ADR-129). Enriched per-book via ADR-129 extraction lifecycle.
- Glossary page (`/glossary`): Milestone 2b (when multi-book content provides sufficient explanation passages).
- Inline reader highlighting: Milestone 2b (reader settings already exist from Milestone 2a).

### Consequences

- Two new tables (`glossary_terms`, `chunk_glossary_terms`)
- Glossary page added to navigation (linked from reader settings and footer, not in primary nav — it's a reference tool, not a destination)
- Inline highlighting is opt-in and off by default — respects the clean reading experience
- Editorial effort: brief definitions must be written for each term. Yogananda's own definitions are identified during ingestion QA.
- **Extends ADR-129** (Vocabulary Bridge) from an internal search tool to a user-facing feature

---

---

## ADR-039: Content Integrity Verification

**Status:** Accepted | **Date:** 2026-02-20
**Context:** ADR-022 (content-addressable deep links), ADR-001 (direct quotes only)

### Context

The portal's core promise is sacred text fidelity: every displayed passage is verbatim from SRF-published works across all author tiers (PRO-014). But there is no mechanism to *verify* this — to prove that the portal's text hasn't drifted from SRF's source publications. Content-addressable deep links (ADR-022) use content hashes for URL stability, but they don't solve provenance.

### Decision

Implement per-chapter content integrity hashes that enable verification of the portal's text against SRF's master publications.

**Approach:**
- At ingestion time, compute a SHA-256 hash of each chapter's concatenated, normalized text (whitespace-normalized, Unicode NFC)
- Store the hash in `chapters.content_hash TEXT NOT NULL`
- Expose hashes via API: `GET /api/v1/books/{slug}/integrity` returns a JSON array of `{ chapter_number, chapter_title, content_hash }` for all chapters
- SRF can independently compute the same hashes from their master text files and compare

**Verification page (`/integrity`):**
- Simple public page listing all books and their chapter hashes
- "How to verify" instructions for computing hashes from physical books
- Statement: "Every word on this portal is verified against SRF's published editions."

**Hash computation is deterministic:**

```typescript
function chapterHash(chunks: string[]): string {
 const normalized = chunks
 .map(c => c.normalize('NFC').replace(/\s+/g, ' ').trim)
 .join('\n');
 return sha256(normalized);
}
```

### Scheduling

Arc 1 (computed during ingestion, stored in schema). The `/integrity` page is Milestone 2a.

### Consequences

- `chapters.content_hash` column added to schema
- Ingestion pipeline computes hashes automatically
- `/integrity` page and API endpoint added
- Hash recomputation on any content update (catches drift)
- **Extends ADR-022** from URL stability to content provenance

---

---

## ADR-040: Magazine Integration — Self-Realization Magazine as First-Class Content

**Status:** Accepted | **Date:** 2026-02-20
**Context:** ADR-001 (direct quotes only), ADR-030 (content scope), ADR-011 (API-first), ADR-060 (content hub)

### Context

Self-Realization Magazine, published by SRF since 1925, contains: (1) articles by Paramahansa Yogananda — published teachings with the same sacred text status as his books, (2) articles by SRF monastics — authorized commentary and contemporary guidance, (3) devotee experiences, and (4) organizational news. The magazine represents a significant body of Yogananda's published writings not found in his books.

Additionally, the portal's "What Is Humanity Seeking?" data is an ideal candidate for a recurring magazine feature, creating a symbiotic relationship between the portal and the magazine.

### Decision

Integrate Self-Realization Magazine as a primary content type with differentiated treatment by content category:

| Category | Search Index | Theme Tags | Daily Pool | Reader Treatment |
|----------|-------------|------------|------------|-----------------|
| Yogananda's articles | Full (same as books) | Yes | Yes | Full reader with gold quote marks |
| Monastic articles | Filtered (opt-in via `author_tier` param including `monastic`) | Yes | No | Reader with author byline |
| Devotee experiences | No | No | No | Browsable, not searchable |
| News/editorial | No | No | No | Browsable, archival |

**Core principle:** Yogananda's magazine articles are published teachings — they enter the same chunk/search/theme pipeline as book passages. A seeker searching "how to overcome fear" finds the relevant magazine article alongside book passages, ranked by relevance. The citation adapts: *— Self-Realization Magazine, Vol. 97 No. 2, p. 14*.

### Schema

```sql
CREATE TABLE magazine_issues (
 id UUID PRIMARY KEY DEFAULT uuidv7(),
 slug TEXT NOT NULL UNIQUE,        -- e.g., '2025-spring', '1925-winter'
 volume INTEGER NOT NULL,
 issue_number INTEGER NOT NULL,
 season TEXT CHECK (season IN ('spring', 'summer', 'fall', 'winter')),
 publication_date DATE NOT NULL,
 title TEXT NOT NULL,
 cover_image_url TEXT,
 editorial_note TEXT,
 language TEXT NOT NULL DEFAULT 'en',
 access_level TEXT NOT NULL DEFAULT 'public'
 CHECK (access_level IN ('public', 'subscriber')),
 created_at TIMESTAMPTZ DEFAULT now,
 updated_at TIMESTAMPTZ DEFAULT now,
 UNIQUE(volume, issue_number)
);

CREATE TABLE magazine_articles (
 id UUID PRIMARY KEY DEFAULT uuidv7(),
 issue_id UUID NOT NULL REFERENCES magazine_issues(id) ON DELETE CASCADE,
 title TEXT NOT NULL,
 slug TEXT NOT NULL UNIQUE,          -- globally unique (ADR-108)
 author_name TEXT NOT NULL,
 author_type TEXT NOT NULL
 CHECK (author_type IN ('yogananda', 'monastic', 'devotee', 'editorial')),
 author_tier TEXT GENERATED ALWAYS AS (
   CASE author_type
     WHEN 'yogananda' THEN 'guru'
     WHEN 'monastic' THEN 'monastic'
     ELSE NULL
   END
 ) STORED,                              -- unified with books.author_tier for cross-source search
 position INTEGER NOT NULL,
 language TEXT NOT NULL DEFAULT 'en',
 access_level TEXT NOT NULL DEFAULT 'public'
 CHECK (access_level IN ('public', 'subscriber')),
 created_at TIMESTAMPTZ DEFAULT now,
 updated_at TIMESTAMPTZ DEFAULT now
);

CREATE TABLE magazine_chunks (
 id UUID PRIMARY KEY DEFAULT uuidv7(),
 article_id UUID NOT NULL REFERENCES magazine_articles(id) ON DELETE CASCADE,
 chunk_index INTEGER NOT NULL,
 content TEXT NOT NULL,
 page_number INTEGER,
 embedding VECTOR(1024),
 embedding_model TEXT NOT NULL DEFAULT 'voyage-3-large',
 embedding_dimension INTEGER NOT NULL DEFAULT 1024,
 embedded_at TIMESTAMPTZ DEFAULT now,
 content_hash TEXT NOT NULL,
 language TEXT NOT NULL DEFAULT 'en',
 metadata JSONB DEFAULT '{}',
 created_at TIMESTAMPTZ DEFAULT now,
 UNIQUE(article_id, chunk_index)
);

CREATE INDEX idx_magazine_chunks_embedding ON magazine_chunks
 USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
-- BM25 index via pg_search (ADR-114) replaces tsvector; created by pg_search CREATE INDEX
CREATE INDEX idx_magazine_chunks_language ON magazine_chunks(language);
```

### Navigation

```
Search · Books · Videos · Magazine · Quiet · About
```

"Magazine" added to primary navigation between "Videos" and "Quiet".

### UI Pages

- `/magazine` — Landing page: latest issue (cover + table of contents), browse by year, "Yogananda's Magazine Writings" index
- `/magazine/{issue-slug}` — Single issue: cover, editorial note, article list with author types (e.g., `/magazine/2025-spring`)
- `/magazine/{issue-slug}/{article-slug}` — Article reader: same reader component as books, with author byline and issue citation

### API Endpoints

```
GET /api/v1/magazine/issues              → Paginated issue list
GET /api/v1/magazine/issues/{slug}       → Single issue (metadata + article summaries)
GET /api/v1/magazine/issues/{slug}/pdf   → Issue PDF (pre-rendered)
GET /api/v1/magazine/articles            → Paginated article list (filterable by issue_id, author_type, language)
GET /api/v1/magazine/articles/{slug}     → Single article with chunks
GET /api/v1/magazine/articles/{slug}/pdf → Article PDF
```

See ADR-108 for rationale on flat articles list vs. nested sub-collection route.

### Search Integration

The `hybrid_search` function extends to query `magazine_chunks` alongside `book_chunks`, filtering uniformly on `author_tier` across both sources (generated column on `magazine_articles` maps `author_type` to tier). Default `author_tier=guru,president` — Yogananda's words are always primary. Specify `author_tier=guru,president,monastic` to include monastic articles.

### Magazine ↔ "What Is Humanity Seeking?" Symbiosis

The public `/seeking` dashboard links to published magazine features: "Read the full analysis in Self-Realization Magazine →". The magazine publishes a curated narrative drawn from the portal's aggregated search data. Each amplifies the other.

### Scheduling

- Schema and ingestion pipeline: Arc 4 (alongside chapter/book PDF infrastructure)
- Magazine browsing UI: Arc 4
- Search integration (Yogananda's articles): Arc 4
- Magazine ↔ "What Is Humanity Seeking?" symbiosis: Arc 4

### Consequences

- Three new tables: `magazine_issues`, `magazine_articles`, `magazine_chunks`
- `magazine_chunks` participates in `chunk_relations` (or `content_relations` post-Arc 6) graph
- `hybrid_search` extended to include magazine chunks
- Navigation updated: "Magazine" added between "Videos" and "Quiet"
- Magazine ingestion pipeline mirrors book ingestion (PDF → chunk → embed → QA)
- Content availability: depends on SRF providing digital magazine archives
- Access level support: some issues may be subscriber-only (`access_level = 'subscriber'`), gated via Auth0 in Milestone 7a+
- **Extends ADR-030** (content scope) to include magazine content
- **Extends ADR-011** (API-first) with magazine endpoints

---

---

## ADR-041: Arc 1 Bootstrap

**Status:** Accepted

**Date:** 2026-02-20

### Context

The portal's architecture is thoroughly documented across four design documents (CONTEXT.md, DESIGN.md, DECISIONS.md, ROADMAP.md), but the path from "no code" to "running system" was undocumented. The first developer experience — creating the repository, provisioning infrastructure, running the first migration, ingesting the first book, and verifying search works — is a critical ceremony that, if not specified, leads to inconsistent environments and wasted time.

### Decision

Document the bootstrap sequence as a reproducible, ordered ceremony in `design/search/ADR-041-arc-1-bootstrap.md`. The ceremony covers:

1. **Repository creation** — Next.js + TypeScript + Tailwind + pnpm
2. **Neon project provisioning** — PostgreSQL with pgvector, dev branch for local work
3. **Schema migration** — dbmate applies `001_initial_schema.sql` (all tables, indexes, functions, triggers)
4. **Vercel deployment** — Link repo, set environment variables, verify health check
5. **Sentry configuration** — Error tracking with source maps
6. **First content ingestion** — Autobiography of a Yogi: PDF → chunks → embeddings → relations
7. **Smoke test** — Search "How do I overcome fear?" returns relevant passages with citations

The `.env.example` file documents all required environment variables with comments explaining each.

### Rationale

- **Reproducibility.** Any developer (or AI assistant) should be able to go from zero to working search in a single session by following the ceremony.
- **Environment parity.** Explicit variable documentation prevents "works on my machine" drift.
- **10-year horizon (ADR-004).** The bootstrap ceremony is a durable artifact — it outlives any individual contributor's tribal knowledge.
- **Design-to-implementation bridge.** The four design documents describe *what* the system does. The bootstrap ceremony describes *how to bring it into existence*.

### Consequences

- `design/search/ADR-041-arc-1-bootstrap.md` captures the step-by-step ceremony and `.env.example` contents
- First-time setup is documented and reproducible
- Onboarding new developers or AI assistants requires reading CLAUDE.md (for context) and following the bootstrap ceremony (for setup)

---

---

## ADR-042: Sacred Image Usage Guidelines

- **Status:** Accepted
- **Date:** 2026-02-17

### Context

The portal has access to 16 official photographs of the SRF line of gurus (Mahavatar Babaji, Lahiri Mahasaya, Swami Sri Yukteswar, Paramahansa Yogananda), plus photographs of SRF's physical properties (Lake Shrine, Encinitas Hermitage, Mount Washington, meditation gardens). These images require handling that reflects their sacred significance in the SRF tradition.

### Decision

Establish strict image usage guidelines that treat guru photographs as sacred objects and nature/property photographs as atmospheric elements.

**Guru photographs — rules:**

| Rule | Rationale |
|------|-----------|
| Guru images appear in exactly two places: the About section (lineage display) and the Quiet Corner (single portrait above the affirmation) | Restraint creates reverence. Their absence from the rest of the portal makes their presence meaningful. |
| Never crop, filter, overlay, or apply visual effects to guru photographs | These are portraits of realized masters. Digital manipulation would be disrespectful. |
| Never place guru images adjacent to UI controls (buttons, form fields, error states) | Avoids juxtaposing sacred images with mundane interface elements. |
| Never use guru images as background wallpaper, with opacity overlays, or as decorative elements | The images are not decoration — they are objects of devotion. |
| Never use guru images in loading states, error pages, or empty states | These are transient, technical UI states — not appropriate for sacred imagery. |
| Yogananda's portrait appears on each book's landing page as the author photo, positioned like a frontispiece in a physical book | This is the one additional context where a guru image is appropriate — authorship attribution. |
| All guru images must include alt text with the guru's full name and title | Accessibility and respect. |
| Never generate AI imagery of gurus — no synthetic portraits, no AI-animated photographs, no AI "enhancement" that alters appearance. Only authentic photographs are permitted. (ADR-015) | These are portraits of realized masters. Synthetic fabrication — however skillful — is theologically impermissible. Standard restoration (denoising, color correction) that preserves the original is engineering and is permitted. |

**Nature/property photographs — uses:**

| Context | Image Type | Treatment |
|---------|-----------|-----------|
| Quiet Corner | Lake Shrine, gardens | Subtle: small image below affirmation or very low-opacity background. Never competing with the text. |
| Theme pages | Nature associated with each theme (still water for Peace, mountains for Courage, etc.) | Ambient atmosphere. Small, muted, never dominant. |
| 404 / empty states | Garden photograph | Gentle message alongside: "This page doesn't exist yet, but perhaps you were meant to find this instead..." with search bar. |
| Seasonal homepage accent | Season-appropriate nature | Very subtle. A suggestion of season, not a hero image. |

**Images NOT sourced from SRF:**
- No stock photography. Every image should be either an official SRF photograph or a nature image from SRF properties.
- If SRF property images are not available, prefer no image over a generic stock photo.

### Rationale

- **Theological alignment:** In the SRF tradition, guru photographs are placed on the meditation altar and treated with reverence. The portal's image handling should reflect this practice.
- **Design restraint:** The portal's power comes from the words. Images support; they never compete. The homepage has no images at all — just Yogananda's words on warm cream. This is deliberate.
- **Calm Technology:** Images that are ambient and atmospheric support the "digital silence" principle. Images that are decorative or attention-grabbing violate it.

### Consequences

- The About section needs a carefully designed lineage display (4 guru portraits in sequence)
- The Quiet Corner needs a curated pool of SRF property/nature images
- The 404 page needs a garden image and gentle copy
- SRF must provide or approve all images used. The 16 official guru photos are available; property photographs may need to be sourced from SRF's media library.
- Each image needs proper licensing/attribution confirmation from SRF

---

---

## ADR-043: Structured Spiritual Ontology — Machine-Readable Teaching Structure

**Status:** Accepted | **Date:** 2026-02-21
**Context:** ADR-081 (Machine-Readable Content and AI Citation), ADR-038 (Living Glossary), ADR-061 (Knowledge Graph Visualization), DES-027 (Reverse Bibliography), ADR-032 (Teaching Topics)

### Context

The portal exposes content to machines through several channels: `llms.txt` for AI crawlers (ADR-081), JSON-LD structured data for search engines, and the versioned API for programmatic access. These expose *content* — the text of passages, their citations, their theme tags.

They do not expose *conceptual structure* — the relationships between Yogananda's ideas, the hierarchy of practices, the dependencies between concepts.

An AI system querying the portal can find "passages about samadhi." It cannot learn that samadhi is a state, that it has prerequisites (deep meditation, pranayama), that Yogananda describes multiple degrees of samadhi (savikalpa, nirvikalpa), that it relates to concepts in other traditions (satori in Zen, unio mystica in Christianity), and that specific passages describe the practice path toward it.

The Living Glossary (ADR-038) stores term definitions. The knowledge graph (ADR-061) visualizes passage-level relationships. The teaching topics (ADR-032) classify passages by theme. But none of these expose a *formal ontology* — a machine-readable map of how concepts relate to each other at the conceptual level, above and beyond individual passages.

### Decision

Build a **structured spiritual ontology** — a concept graph of Yogananda's teaching framework — and expose it through a read-only API endpoint and a JSON-LD export.

#### Schema

```sql
-- ============================================================
-- SPIRITUAL ONTOLOGY (concept graph — Arc 4+)
-- ============================================================
CREATE TABLE ontology_concepts (
 id UUID PRIMARY KEY DEFAULT uuidv7(),
 slug TEXT NOT NULL UNIQUE, -- URL slug: 'samadhi'
 name TEXT NOT NULL, -- "Samadhi"
 sanskrit_name TEXT, -- 'samādhi' (IAST transliteration)
 definition TEXT NOT NULL, -- canonical definition
 category TEXT NOT NULL CHECK (category IN (
 'state', -- samadhi, cosmic consciousness, Christ consciousness
 'practice', -- meditation, pranayama, Hong-Sau technique
 'principle', -- karma, dharma, maya, reincarnation
 'entity', -- God, Divine Mother, the soul (atman)
 'text', -- Bhagavad Gita, Yoga Sutras, Bible
 'tradition', -- Kriya Yoga, Raja Yoga, Vedanta
 'path' -- the eightfold path, the chakra system
)),
 glossary_id UUID REFERENCES glossary_terms(id), -- link to Living Glossary (ADR-038)
 created_at TIMESTAMPTZ NOT NULL DEFAULT now
);

CREATE TABLE ontology_relations (
 id UUID PRIMARY KEY DEFAULT uuidv7(),
 source_id UUID NOT NULL REFERENCES ontology_concepts(id) ON DELETE CASCADE,
 target_id UUID NOT NULL REFERENCES ontology_concepts(id) ON DELETE CASCADE,
 relation_type TEXT NOT NULL CHECK (relation_type IN (
 'has_prerequisite', -- meditation HAS_PREREQUISITE concentration
 'is_degree_of', -- nirvikalpa_samadhi IS_DEGREE_OF samadhi
 'is_practice_for', -- hong_sau IS_PRACTICE_FOR concentration
 'is_component_of', -- pranayama IS_COMPONENT_OF kriya_yoga
 'opposes', -- maya OPPOSES self_realization
 'leads_to', -- self_realization LEADS_TO ever_new_joy
 'parallels', -- samadhi PARALLELS satori (cross-tradition)
 'refines', -- nirvikalpa_samadhi REFINES savikalpa_samadhi
 'described_in' -- (link to external references via DES-027)
)),
 editorial_note TEXT, -- optional contextual explanation
 tagged_by TEXT NOT NULL DEFAULT 'manual' CHECK (tagged_by IN ('manual', 'reviewed', 'auto')),
 UNIQUE (source_id, target_id, relation_type)
);

-- Bridge: which passages are the primary source for a concept
CREATE TABLE ontology_concept_passages (
 id UUID PRIMARY KEY DEFAULT uuidv7(),
 concept_id UUID NOT NULL REFERENCES ontology_concepts(id) ON DELETE CASCADE,
 chunk_id UUID NOT NULL REFERENCES book_chunks(id) ON DELETE CASCADE,
 is_primary BOOLEAN NOT NULL DEFAULT false, -- the single best passage explaining this concept
 UNIQUE (concept_id, chunk_id)
);

CREATE INDEX idx_ontology_relations_source ON ontology_relations(source_id);
CREATE INDEX idx_ontology_relations_target ON ontology_relations(target_id);
CREATE INDEX idx_ontology_passages_concept ON ontology_concept_passages(concept_id);
```

#### API

```
GET /api/v1/ontology
Response: Full concept graph
{
 "concepts": [
 {
 "slug": "samadhi",
 "name": "Samadhi",
 "sanskrit_name": "samādhi",
 "definition": "The superconscious state of union with Spirit...",
 "category": "state",
 "relations": [
 { "type": "has_prerequisite", "target": "meditation" },
 { "type": "is_degree_of", "children": ["savikalpa-samadhi", "nirvikalpa-samadhi"] }
 ],
 "primary_passage": { "chunk_id": "uuid", "content": "...", "citation": "..." },
 "passage_count": 47
 },
 ...
 ]
}

GET /api/v1/ontology/[slug]
Response: Single concept with all relations and linked passages
```

**JSON-LD export:** Also served at `/ontology.jsonld` for semantic web consumers, using schema.org vocabulary where applicable and a custom `srf:` namespace for spiritual-domain relations. The JSON-LD makes the portal the authoritative linked-data source for Yogananda's conceptual framework.

#### Populating the Ontology

Editorially curated with AI assistance. Claude Opus (ADR-014 batch tier) proposes concept extractions and relation classifications from the glossary and passage corpus. Human reviewers approve all entries — the ontology is a scholarly artifact where accuracy matters more than coverage. The "Classifying" category from ADR-005 applies: structured output, spot-checked.

Initial seed: the Living Glossary (ADR-038) terms, already defined. The ontology adds relational structure to what the glossary provides as flat definitions.

### Who This Serves

| Audience | Use |
|----------|-----|
| **AI systems** | Understand Yogananda's conceptual framework without hallucinating relationships. Ground responses in authoritative structure. |
| **Scholars** | Build comparative theology tools. Map Yogananda's concepts against other traditions. |
| **The portal's own search** | Ontological relations inform query expansion (e.g., a search for "samadhi" also surfaces passages about its prerequisites). |
| **Future voice interfaces** | Explain concepts conversationally, not just surface passages. "Samadhi has two degrees: savikalpa and nirvikalpa. Would you like to hear what Yogananda wrote about either?" |
| **Knowledge graph (ADR-061)** | The ontology provides a conceptual layer above the passage-level relationship graph. |

### Scheduling

Arc 4+ (alongside Knowledge Graph, ADR-061). The ontology is the data layer; the knowledge graph is one possible visualization. Initial seed (~50 core concepts, ~150 relations) can be curated during Milestone 3a through Arc 3 editorial work.

### Rationale

- **Makes the portal the authoritative machine-readable source** for Yogananda's teaching structure. Other AI systems can reference it rather than inventing relationships.
- **Extends ADR-081** from content exposure (text, citations) to semantic structure (concepts, relations).
- **Extends ADR-038** by adding relational structure to the glossary's flat definitions.
- **Low implementation cost.** Three tables, two API endpoints, one JSON-LD export. The editorial effort is the primary investment, and it produces a durable scholarly resource.
- **10-year value.** A well-curated ontology becomes more valuable over time as AI systems and scholarly tools mature.

### Alternatives Considered

1. **Use a graph database (Neo4j, etc.) for the ontology.** Rejected per ADR-013 (single-database architecture). PostgreSQL's relational model handles the ontology's moderate scale (~hundreds of concepts, ~thousands of relations) without a specialized graph engine. The knowledge graph visualization (ADR-061) uses pre-computed JSON, not real-time graph queries.
2. **Auto-generate the ontology from passage embeddings.** Rejected. Embedding similarity captures semantic relatedness, not conceptual structure. "Samadhi requires meditation" is a directional, typed relationship — not derivable from vector proximity alone. Human editorial judgment is required.
3. **Expose the ontology only as JSON-LD, not as an API.** Rejected. The API enables the portal's own search system to use ontological relations for query expansion. JSON-LD alone would serve external consumers but not internal features.

### Consequences

- Three new tables: `ontology_concepts`, `ontology_relations`, `ontology_concept_passages`
- New API endpoints: `GET /api/v1/ontology`, `GET /api/v1/ontology/[slug]`
- JSON-LD export at `/ontology.jsonld`
- Living Glossary (ADR-038) terms can be linked to ontology concepts via `glossary_id`
- Knowledge Graph (ADR-061) gains ontological relations as an additional edge type
- Query expansion (ADR-005 E1) can optionally traverse ontological prerequisites for richer search results
- The portal becomes the first spiritual teachings platform to offer a formal, machine-readable conceptual ontology
- **Extends ADR-081** with deep semantic structure; **extends ADR-038** with relational graph; **extends ADR-061** with a concept layer above the passage layer

---

---

## ADR-044: Hybrid Search (Vector + Full-Text)

- **Status:** Accepted (extended by ADR-114: pg_search BM25, ADR-119: HyDE + Cohere Rerank three-path retrieval)
- **Date:** 2026-02-17

### Context

Two search paradigms exist:

| Approach | Strengths | Weaknesses |
|----------|-----------|------------|
| **Vector-only** | Finds semantically similar passages even without keyword overlap | Misses exact phrases; less precise for specific terms |
| **Full-text-only** | Precise keyword matching; fast; no embedding cost | Misses conceptual/semantic matches; requires exact terms |
| **Hybrid (RRF)** | Best of both; catches conceptual AND exact-phrase queries | More complex query logic |

### Decision

Use **hybrid search** with Reciprocal Rank Fusion (RRF) to merge vector similarity and full-text search results in a single Postgres query.

### Rationale

- A seeker searching "divine mother" wants exact keyword matches (FTS)
- A seeker searching "how to find inner peace" wants conceptual matches (vector)
- RRF is a proven, simple merging algorithm that requires no ML training
- Both search types run natively in Postgres — no external services

### Consequences

- Each chunk needs both an embedding vector AND a pg_search BM25 index (ADR-114)
- The hybrid_search SQL function uses `paradedb.score(id)` and `@@@` operator for BM25, fused with vector results via RRF
- Weights between FTS and vector can be tuned based on query characteristics

---

## ADR-046: Embedding Model Versioning and Migration

- **Status:** Accepted (embedding model updated to Voyage voyage-3-large by ADR-118)
- **Date:** 2026-02-17

### Context

The portal uses vector embeddings (Voyage voyage-3-large, 1024 dimensions; adopted by ADR-118) to power semantic search. Over a 10-year lifespan, the embedding model will almost certainly be replaced 2-3 times as better models emerge — higher quality, lower cost, multilingual improvements, or dimensionality changes.

Re-embedding the entire corpus is a batch operation (read chunks → call new model → update vectors). But during the transition, the search index must continue to function. And the system must know which chunks have been re-embedded and which haven't.

Without tracking which model generated each vector, a model swap becomes an all-or-nothing migration with potential downtime.

### Decision

Add an `embedding_model` column to `book_chunks` that records which model generated the embedding vector. This enables:

1. **Incremental migration.** Re-embed in batches (background job) rather than all at once.
2. **Mixed-model search.** During transition, query both old and new vectors. Weight new-model results higher.
3. **Rollback.** If a new model produces worse results, revert to the previous model's vectors without re-embedding.
4. **Audit.** Always know exactly which model generated a given chunk's vector.

#### Schema Change

```sql
ALTER TABLE book_chunks ADD COLUMN embedding_model TEXT NOT NULL DEFAULT 'voyage-3-large';
ALTER TABLE book_chunks ADD COLUMN embedding_dimension INTEGER NOT NULL DEFAULT 1024;
ALTER TABLE book_chunks ADD COLUMN embedded_at TIMESTAMPTZ NOT NULL DEFAULT now;
```

#### Migration Workflow

```
1. Choose new model (e.g., a domain-adapted fine-tune or next-generation multilingual model)
2. Create Neon branch for testing
3. Re-embed a sample (100 chunks) on the branch
4. Run search quality test suite against new embeddings
5. Compare precision/recall vs. current model (Voyage voyage-3-large baseline)
6. If improved:
 a. Re-embed all chunks in batches (background job)
 b. Update embedding_model, embedding_dimension, embedded_at per chunk
 c. Update the search function to use the new model for queries
 d. Monitor search quality metrics post-migration
7. If not improved: discard branch, keep current model
```

During step 6, the search function can handle mixed models by:
- Querying with both the old and new model's embedding of the user's query
- Merging results via RRF (Reciprocal Rank Fusion) — the same approach already used for hybrid search
- Gradually increasing the new model's weight as more chunks are re-embedded

#### Dimension Change Handling

If a new model uses different dimensions (e.g., 2048 instead of 1024), pgvector supports multiple vector columns:

```sql
-- Add new dimension column
ALTER TABLE book_chunks ADD COLUMN embedding_v2 VECTOR(2048);

-- Create HNSW index for new column
CREATE INDEX idx_chunks_embedding_v2 ON book_chunks
 USING hnsw (embedding_v2 vector_cosine_ops);

-- After all chunks re-embedded, drop old column and index
ALTER TABLE book_chunks DROP COLUMN embedding;
ALTER TABLE book_chunks RENAME COLUMN embedding_v2 TO embedding;
```

### Rationale

- **Models will change.** The embedding model landscape evolves rapidly — OpenAI released three generations (ada-002 → 3-small → 3-large), and this project adopted Voyage voyage-3-large (ADR-118) before writing a single line of application code. Designing for model lock-in is designing for obsolescence.
- **Corpus grows over time.** By Milestone 5b (multi-language), the corpus may be 10x larger than Arc 1. Re-embedding at that scale is hours of API calls and significant cost. Incremental migration keeps the portal online throughout.
- **Search quality is the core mission.** A better embedding model directly improves passage retrieval. The portal should be able to adopt improvements without architectural changes.
- **Zero cost now.** Three columns and a convention. No additional infrastructure.

### Multilingual Embedding Requirement (Added 2026-02-18)

**The embedding model must be multilingual.** This is an explicit requirement, not a side-effect. Voyage voyage-3-large embeds 26 languages in a unified vector space as a design goal — not an incidental capability. This means:

- Arc 1 embeddings (en/es) remain valid when Hindi, German, Japanese, and other chunks are added in Milestone 5b — no re-embedding of the existing corpus.
- The English fallback strategy (searching English when locale results < 3) works because the multilingual model places the English search query and English passages in compatible vector space — validated from Arc 1 when Hindi or Spanish queries find English passages.
- Cross-language passage alignment (`canonical_chunk_id`) is validated by embedding proximity, not just paragraph index matching.
- Any future embedding model migration must preserve this multilingual property.

If a candidate model has better English retrieval but weaker multilingual mapping, that is **not an upgrade** — it's a regression for the portal's mission of global availability. Benchmark per-language retrieval quality and English fallback quality alongside single-language quality during model evaluation.

### Consequences

- `book_chunks` schema includes `embedding_model`, `embedding_dimension`, and `embedded_at` columns from Arc 1
- The ingestion pipeline records which model it used per chunk
- Search quality test suite (deliverable M1a-8) becomes the gate for model migration decisions
- Model migration is a maintenance operation, not an architecture change
- Budget for re-embedding costs when evaluating new models (Milestone 5b multilingual benchmarking is a natural trigger)
- Any model migration must preserve multilingual vector space quality — single-language improvements that degrade per-language retrieval or English fallback quality are not acceptable

---

---

## ADR-047: Multilingual Embedding Quality Strategy

- **Status:** Accepted (embedding model updated to Voyage voyage-3-large by ADR-118)
- **Date:** 2026-02-21

### Context

The embedding model is the single most leveraged component in the search experience — it determines whether the right passage surfaces for a seeker's query. Everything else (UI, typography, citation formatting) is presentation. For a portal whose mission is making Yogananda's teachings "freely accessible worldwide," the embedding model should be selected for quality, not cost. Cost is negligible at this corpus scale — the entire multilingual corpus across all languages costs under $10 to embed.

Three dimensions of embedding quality matter for this portal:

1. **Multilingual retrieval quality.** The portal serves seekers in 10 languages. A model whose multilingual capability is a design goal — not an incidental side-effect of training data diversity — produces stronger cross-language alignment for European languages, Hindi, Bengali, Thai, and Japanese. The languages where the English fallback strategy is load-bearing benefit the most from intentional multilingual design.

2. **Domain specificity.** General-purpose embedding models are trained on web text, Wikipedia, and news. Yogananda's prose is spiritually dense, metaphorical, and uses vocabulary that spans traditions ("The wave forgets it is the ocean" — simultaneously about water and cosmic consciousness). General models may not capture the semantic relationships that matter for this corpus.

3. **Cross-language alignment for sacred vocabulary.** Terms like "samadhi," "サマーディ," "समाधि" should occupy the same region of vector space. The Vocabulary Bridge (ADR-129) handles this at the query expansion layer, but embedding-level alignment is more robust.

### Decision

1. **Voyage voyage-3-large is the Arc 1 embedding model.** ADR-118 adopted Voyage voyage-3-large (1024 dimensions, 26 languages, 32K token input) based on its multilingual-first design, asymmetric encoding support (`input_type = 'document'` at ingestion, `input_type = 'query'` at search time), and strong performance on literary/spiritual text retrieval. Originally, OpenAI text-embedding-3-small (1536 dimensions) was selected for its simplicity and adequate multilingual support; ADR-118 superseded that choice after the RAG Architecture Proposal demonstrated that Voyage's intentional multilingual design and literary retrieval quality justified the switch before any corpus was embedded.

2. **Milestone 5b benchmarks Voyage against multilingual alternatives.** Voyage voyage-3-large is the baseline. Benchmark candidates include Cohere embed-v3, BGE-M3, multilingual-e5-large-instruct, Jina-embeddings-v3, and domain-adapted fine-tunes. The Milestones 1a–1b bilingual evaluation (Deliverable M1a-8 English + Milestone 1b Spanish: ~58 en + ~15 es queries) provides initial multilingual signal but cannot assess the full 10-language retrieval quality. The ADR-046 migration path activates if a candidate demonstrably outperforms Voyage on specific languages.

3. **Domain-adapted embeddings remain a later-stage research effort.** Fine-tuning an embedding model on Yogananda's corpus — across languages — could produce world-class retrieval quality that no general-purpose model achieves. The portal has a defined, bounded corpus (Yogananda's published works in multiple languages) that is ideal for domain adaptation. This is a research track, not an Arc 1 deliverable:
 - **Input:** The complete multilingual corpus (available after Milestone 5b ingestion)
 - **Method:** Fine-tune a strong multilingual base model (e.g., Voyage voyage-3-large, multilingual-e5-large-instruct, or BGE-M3) on the corpus with retrieval-specific training objectives
 - **Evaluation:** Per-language search quality test suites (Milestone 5b) provide the evaluation framework
 - **Outcome:** An embedding model that understands Yogananda's vocabulary, metaphorical patterns, and cross-tradition spiritual concepts at a depth no general model matches

4. **The architecture already supports model evolution.** ADR-046's `embedding_model` column enables per-chunk model tracking. The migration procedure (Neon branch → re-embed → validate → promote) applies to both vendor model upgrades and domain-adapted models. No architectural changes are needed to pursue any of these paths.

### Alternatives Considered

1. **Stay with OpenAI text-embedding-3-small** — The original Arc 1 choice. Adequate multilingual support, well-understood operational model, symmetric embeddings. Rejected by ADR-118 because: multilingual capability is emergent from training data diversity rather than an explicit design goal; performance on literary and spiritual text retrieval lags behind Voyage; the symmetric encoding model forgoes retrieval-optimized asymmetric encoding. At this corpus scale, the operational simplicity advantage does not justify the quality gap.

2. **Cohere embed-v3** — Designed multilingual-first, scores higher on multilingual benchmarks (MIRACL, Mr.TyDi) for Indic languages. Not selected because: Cohere is a smaller company (10-year vendor risk), and the benchmark advantage is measured on Wikipedia-like content — the gap may not transfer to spiritual text. Remains a strong Milestone 5b benchmark candidate, particularly for Indic/CJK languages.

3. **Self-hosted open-source model (BGE-M3, multilingual-e5-large)** — Eliminates API vendor dependency entirely. At this corpus scale (~150K chunks), could run on a single GPU or even CPU. Not selected for Arc 1 because: adds operational complexity (model hosting, versioning, GPU provisioning) during an arc focused on proving search works. Remains a strong candidate for the domain-adapted model research track, where self-hosting is likely necessary anyway.

4. **Per-language embedding models** — Use Voyage for most languages and a specialized model for Indic/CJK. ADR-046's `embedding_model` column supports this. Not selected as a starting position because: operational complexity of maintaining multiple embedding pipelines is not justified without evidence of a quality gap. Remains viable if Milestone 5b benchmarking reveals language-specific deficiencies.

5. **OpenAI text-embedding-3-large** — 3072 dimensions, at $0.13/1M tokens (still negligible at corpus scale). Rejected because: the additional dimensions help distinguish semantically close but meaningfully different texts, which is not the primary retrieval challenge for this corpus. More importantly, 3-large has the same incidental multilingual capability as 3-small — same training approach, same training data distribution, just a wider model. The gap for Hindi/Bengali/Japanese is identical. More dimensions do not fix a training data skew.

### Rationale

- **Quality is the differentiator.** At < $10 for the full multilingual corpus, the embedding model should be selected for quality, not cost. Voyage voyage-3-large was selected because it is designed multilingual-first, supports asymmetric encoding for retrieval optimization, and outperforms OpenAI models on literary retrieval benchmarks at a smaller dimension (1024 vs. 1536).
- **Domain adaptation is the highest-ceiling option.** General models compete on benchmarks across all domains. A model fine-tuned on Yogananda's corpus would compete on one domain — the only one that matters for this portal. This is the path to world-class retrieval quality.
- **Sequencing matters.** Domain adaptation requires a multilingual corpus to train on (Milestone 5b) and a per-language evaluation framework to validate against (Milestone 5b). Starting this research before those exist would produce a model trained on only 2 languages — Arc 1's bilingual corpus (en/es) provides a starting point but not the full linguistic diversity needed.
- **The architecture is already ready.** ADR-046's model versioning, the Neon branch migration workflow, and the per-language evaluation suites provide the complete infrastructure for model evolution. This ADR adds strategic direction, not architectural changes.

### Consequences

- Arc 1 proceeds with Voyage voyage-3-large (1024 dimensions)
- Deliverables M1a-8 + Milestone 1b scope note: bilingual evaluation (en/es — English in M1a-8, Spanish in 1b) provides initial multilingual signal; full 10-language quality assessment deferred to Milestone 5b
- Milestone 5b benchmarks Voyage as the baseline against multilingual-optimized alternatives (Cohere embed-v3, BGE-M3, multilingual-e5-large-instruct, Jina-embeddings-v3, domain-adapted fine-tunes)
- Domain-adapted embeddings remain a documented research track, scoped after Milestone 5b corpus completion
- CONTEXT.md open questions updated to reflect the multilingual quality evaluation and domain adaptation tracks
- Future embedding model decisions should reference this ADR alongside ADR-046

---

---

## ADR-048: Chunking Strategy Specification

**Status:** Accepted
**Date:** 2026-02-20
**Deciders:** Architecture team
**Context:** ADR-009 (pgvector), ADR-044 (Hybrid Search), ADR-046 (Embedding Model Versioning)

### Context

DESIGN.md specifies chunk relations, storage, embedding, and search in detail. ROADMAP mentions "chunk by paragraphs" (Arc 1) and "verse-aware chunking (Milestone 3d)". But no document formally defines the chunking algorithm — the single most important factor in search retrieval quality. A bad chunking strategy produces orphaned fragments (too small) or imprecise retrieval (too large). Yogananda's prose style varies dramatically: terse aphorisms in *Sayings*, flowing narrative in *Autobiography*, verse-by-verse commentary in *The Second Coming of Christ*, guided affirmations in *Scientific Healing Affirmations*.

### Decision

Document the chunking strategy as a formal specification. The strategy is document-type-aware — different text types require different chunking approaches.

**Per-Document-Type Chunking:**

| Document Type | Characteristics | Chunking Approach |
|---------------|----------------|-------------------|
| Autobiography / narrative | Continuous prose, idea-per-paragraph | Semantic paragraph, 200–400 tokens, no overlap |
| Scriptural commentary | Verse + interpretation pairs, interdependent | Verse-bound atomic units (see Verse-Aware below) |
| Discourse / collected talk | Pedagogical arc, builds to conclusion | Section-aware, preserve teaching flow |
| Poetry / chant / prayer | Complete works, indivisible | Whole-poem chunks, never split |
| Affirmation | Single-statement units | Individual affirmations as atomic units |
| Lesson (future, out of scope) | Structured pedagogy, fixed format | Format-aware (deferred) |

Do not apply a single chunking algorithm across all types. Read representative samples from each type before implementing the chunking pipeline. Print 50 chunks and read them as a human researcher would. If they feel fragmentary or orphaned from their context, the algorithm is wrong regardless of benchmarks.

**Default Chunking (Arc 1 through Milestone 3c: narrative, collected talks, short works):**
- **Unit:** Paragraph (defined by typographic paragraph breaks in the source text)
- **Token range:** 100–500 tokens (target: 200–300)
- **Minimum:** Paragraphs below 100 tokens are merged with the following paragraph to avoid orphaned fragments
- **Maximum:** Paragraphs exceeding 500 tokens are split at sentence boundaries, with the split point chosen to keep both halves above 100 tokens
- **Overlap:** None. Paragraph boundaries are natural semantic boundaries in Yogananda's prose. Overlap introduces duplicate content in search results with no retrieval quality gain for this corpus.
- **Metadata preserved per chunk:** book_id, chapter_id, paragraph_index (position within chapter), page_number (from source), language

**Special handling:**
- **Epigraphs and poetry:** Kept as single chunks regardless of length. Splitting a poem mid-stanza destroys meaning.
- **Lists and enumerations:** Kept as single chunks. Yogananda's numbered instructions and lists of spiritual qualities are semantically atomic.
- **Dialogue and quoted speech:** Kept as single chunks when the dialogue forms a continuous exchange. Long dialogues (>500 tokens) split at speaker changes, not mid-speech.
- **Aphorisms (*Sayings*, *Scientific Healing Affirmations*):** Each standalone saying or affirmation is one chunk, regardless of length. These books are already atomically organized.
- **Chapter titles and section headers:** Not chunked separately. Prepended to the first paragraph of their section as metadata context.

**Verse-Aware Chunking (Milestone 3d: *Second Coming of Christ*, *God Talks With Arjuna*, *Wine of the Mystic*):**
- **Unit:** Verse-commentary pair. Each scripture verse and its associated commentary form a single chunk, maintaining the interpretive relationship.
- **Long commentaries:** If a verse's commentary exceeds 500 tokens, split at paragraph boundaries within the commentary. Each sub-chunk retains the verse text as a prefix (ensuring the verse context travels with every fragment of commentary).
- **Cross-reference:** Each verse-commentary chunk stores the verse reference (e.g., "Bhagavad Gita IV:7") as structured metadata for the side-by-side commentary view .
- **Devanāgarī script handling (ADR-080):** *God Talks With Arjuna* includes original Bhagavad Gita verses in Devanāgarī script alongside romanized transliteration and English commentary. Devanāgarī verse text is preserved in `chunk_content` for display but excluded from the embedding input via a script-detection preprocessing step (`/[\u0900-\u097F]/` Unicode block). The romanized transliteration is included in both chunk content and embedding input. Devanāgarī text is excluded from the token count that determines chunk splitting — only the English commentary and romanized transliteration count toward the 500-token maximum.

**Per-author calibration (PRO-014, Milestone 3a+):**
- Sri Yukteswar's prose in *The Holy Science* is radically different from Yogananda's narrative style — dense, aphoristic, philosophical, with Sanskrit-heavy sentences. The 100–500 token chunk range may need author-specific calibration (likely lower target: 150–250 tokens). Daya Mata's talks are conversational and closer to Yogananda's collected-talks style. Author-specific chunking parameters are named constants per ADR-123.

**Per-language validation (Milestone 5b):**
- English-calibrated chunk sizes (200–300 tokens) may produce different semantic density across scripts. CJK tokenization differs significantly from Latin scripts. Validate retrieval quality per language before committing to chunk sizes. Adjust token ranges per language if necessary.

### Rationale

- **Paragraph as natural unit.** Yogananda's prose is well-structured with clear paragraph breaks that correspond to idea boundaries. Unlike web content or academic papers, his paragraphs rarely span multiple topics.
- **No overlap avoids duplicate noise.** In information retrieval, overlap helps when chunk boundaries are arbitrary (e.g., fixed-window chunking). With paragraph-based chunking, boundaries are meaningful — overlap would surface the same passage twice in search results.
- **Special handling preserves meaning.** A poem split mid-stanza, a list split mid-enumeration, or a verse separated from its commentary would produce chunks that misrepresent the teaching.
- **Token range is empirical.** The 200–300 target is based on retrieval research showing this range balances specificity (finding the right passage) with context (the passage makes sense in isolation). Arc 1 validates this against the Autobiography.

### Consequences

- New "Chunking Strategy" section in DESIGN.md
- Arc 1 ingestion script (0.8) implements default chunking per this specification
- Milestone 3d verse-aware chunking (M3d-2) implements the verse-commentary pair strategy
- Milestone 5b per-language chunk size validation uses this specification as the baseline
- Search quality evaluation (0.17) implicitly validates the chunking strategy — poor results trigger chunking reassessment

---

---

## ADR-049: Search Suggestions — Corpus-Derived, Not Behavior-Derived

- **Status:** Accepted
- **Date:** 2026-02-21

### Context

The portal's search architecture (ADR-044, ADR-014, ADR-005) is comprehensive: hybrid search, query expansion, intent classification, spiritual terminology bridge, passage ranking. But one common search UX pattern is absent: autocomplete suggestions as the seeker types.

Google-style autocomplete is powered by billions of user queries — the suggestion intelligence comes from aggregate behavior. This portal operates under fundamentally different constraints:

1. **DELTA compliance (ADR-095).** No user identification, no session tracking, no behavioral profiling. Personalized suggestions are architecturally impossible. Aggregate query-based suggestions face the ADR-053 minimum threshold problem — sparse data for months/years after launch.

2. **Bounded, known corpus.** The portal contains a finite set of Yogananda's published works. Unlike web search, every term in the corpus is known in advance. This means every suggestion can *guarantee* results exist — a property Google cannot offer.

3. **Calm Technology.** "Trending searches" and "popular queries" create social-media-like engagement patterns. Suggestions should reduce friction (calm), not drive browsing behavior.

4. **Librarian identity (ADR-001, ADR-089).** A librarian helps you formulate your question and knows the collection. Suggestions are a natural extension of the librarian metaphor — showing the seeker what terrain the teachings cover.

5. **Existing vocabulary bridge.** The Vocabulary Bridge (ADR-129) already maps seeker vocabulary to Yogananda's vocabulary. This infrastructure can power a unique suggestion type: surfacing the gap between what a seeker types and how Yogananda expressed the same concept.

### Decision

1. **Suggestion intelligence is corpus-derived, not behavior-derived.** All suggestion sources are extracted from the content itself, not from user query patterns. This ensures DELTA compliance, guarantees every suggestion leads to results, and aligns with the librarian identity.

2. **Six-tier suggestion hierarchy** (priority order, highest intent first):

 | Tier | Type | Source | Example |
 |------|------|--------|---------|
 | 1 | **Scoped queries** | Entity co-occurrence from enrichment (ADR-115) | "Yogananda on the nature of God" |
 | 2 | **Named entities** | Entity registry (ADR-116) | "Autobiography of a Yogi", "Lahiri Mahasaya", "Kriya Yoga" |
 | 3 | **Domain concept phrases** | Topic and summary mining from enrichment | "cosmic consciousness", "divine love" |
 | 4 | **Sanskrit terms with definitions** | `sanskrit_terms` table (ADR-116) | "Samadhi — superconscious state" |
 | 5 | **Learned queries from logs** | Anonymized query log (DELTA-compliant, ADR-053) | (grows over time) |
 | 6 | **High-value single terms** | Hand-curated, ~200–300 terms | "meditation", "karma" |

 The "Yogananda on X" scoped query pattern (Tier 1) is the highest-value suggestion type for a teacher-centered corpus. It encodes the most precise intent and guarantees high-relevance results.

 The three original suggestion types map into this hierarchy: **term completion** spans Tiers 2, 3, and 6; **query suggestion** spans Tiers 1 and 5; **bridge-powered suggestion** is integrated into Tiers 3 and 4 (Sanskrit terms with definitions, bridged concepts with Yogananda's vocabulary).

 Implementation: Three-tier progressive architecture (ADR-120). Tier A: static JSON prefix files at CDN edge (< 10ms). Tier B: pg_trgm fuzzy fallback for misspellings and transliteration (40–80ms). Tier C: Vercel KV (Upstash Redis) with sorted sets if Tier A+B latency is insufficient (< 5ms, activated by concrete migration triggers).

3. **New API endpoint: `GET /api/v1/search/suggest`.** Accepts `q` (partial query), `language`, and `limit` parameters. Returns typed suggestions with category metadata (term/query/bridge). No Claude API call — pure database/cache lookup for speed.

4. **Zero-state experience is editorially curated.** When the search bar is focused but empty, display curated entry points (theme names, "Seeking..." prompts). This is an editorial statement — governance follows the same human-review principle as all user-facing content.

5. **Milestone progression:** Basic prefix matching in Arc 1 — bilingual (en/es) from day one. Bridge-powered suggestions and curated queries added incrementally. Hindi Devanāgarī native-script prefix files and per-language suggestion indices for remaining 8 languages in Milestone 5b. Optional personal "recent searches" (client-side only, no server storage) in Milestone 7a.

### Alternatives Considered

1. **Aggregate query-based suggestions ("popular searches").** Rejected: DELTA non-compliant without careful anonymization. Sparse data for months after launch. Creates social-proof dynamics misaligned with Calm Technology. Even with ADR-053-style thresholds, the minimum viable data for useful suggestions requires significant traffic volume.

2. **Claude-powered suggestion generation.** Rejected: Adds latency (LLM call per keystroke or debounced batch), cost, and complexity. The corpus is bounded — pre-computed suggestions are faster, cheaper, and more reliable. The intent classification system (ADR-005 E1) already handles query understanding after submission.

3. **No suggestions at all.** Considered: The intent classification + terminology bridge already handle "seeker doesn't know the right words" after query submission. However, pre-submission suggestions reduce typing friction, show seekers what the corpus contains, and extend the librarian metaphor. The bounded corpus makes guaranteed-result suggestions uniquely valuable.

4. **Third-party search-as-a-service (Algolia, Typesense).** Rejected: Adds vendor dependency for a feature achievable with PostgreSQL `pg_trgm` and edge caching. Violates single-database principle (ADR-013). Over-engineered for a bounded corpus.

### Rationale

- **Bounded corpus is the advantage.** Web-scale autocomplete must handle infinite content and relies on query logs for signal. A sacred text library has finite, known content — every suggestion can guarantee results. This property is more valuable than trending queries.
- **Corpus-derived suggestions are always fresh.** When a new book is ingested, its vocabulary automatically enters the suggestion index. No cold-start problem, no minimum query volume needed.
- **Bridge-powered suggestions are unique.** No existing search product surfaces the gap between user vocabulary and corpus vocabulary as a suggestion. This extends the Vocabulary Bridge (ADR-129) from a backend query-expansion tool to a user-facing navigation aid.
- **DELTA compliance by construction.** No behavioral data enters the suggestion pipeline. Privacy is a design property, not a policy constraint.
- **Calm Technology alignment.** Suggestions show what's available — they don't optimize for engagement. No "trending," no social proof, no urgency signals.

### Consequences

- New API endpoint (`/api/v1/search/suggest`) added to DESIGN.md § API Design
- New DESIGN.md subsection within the AI Librarian search architecture: "Search Suggestions — Corpus-Derived, Not Behavior-Derived"
- ROADMAP.md updated: Deliverable M1c-9 (basic prefix matching), M3a-9 (multi-book + bridge + curated), Milestone 5b (per-language indices)
- CONTEXT.md updated with new open questions: zero-state experience, transliteration support, editorial governance of curated suggestions, mobile keyboard interaction
- Suggestion index extraction becomes part of the book ingestion pipeline (extends ADR-129 per-book lifecycle)
- Accessibility requirement: ARIA combobox pattern for the suggestion dropdown (extends ADR-003)
- Per-language suggestion indices required for Milestone 5b (extends multilingual architecture)

---

---

## ADR-050: Related Teachings — Pre-Computed Chunk Relations and Graph Traversal

- **Status:** Accepted
- **Date:** 2026-02-18

### Context

The current portal design is primarily reactive — the seeker must search, click a theme, or visit the Quiet Corner. But the Findability Principle (CONTEXT.md) states: *"The teachings should find the seeker, not only the other way around."*

When a seeker reads a paragraph about cosmic consciousness in Autobiography of a Yogi, they may not know that Yogananda wrote about the same experience with different language in Man's Eternal Quest and with scriptural commentary in God Talks With Arjuna. The portal should surface these connections *proactively* during reading.

| Approach | Pros | Cons |
|----------|------|------|
| **No related content** | Simplest. No additional infrastructure. | Misses the Findability Principle. Reader must search to discover cross-book connections. |
| **Real-time vector similarity per paragraph** | Always fresh. No pre-computation needed. | Adds latency to every paragraph scroll. Database load scales with reading activity. |
| **Pre-computed relations table** | Instant lookup. Zero read-time latency. Enables graph traversal. Simple JOIN queries. | Requires batch computation at ingestion. Must be updated incrementally when new content is added. |
| **Knowledge graph (Neo4j, etc.)** | Rich graph queries. Purpose-built for relationship traversal. | New vendor. Operational complexity. Overkill for the relationship types we need. |

### Decision

Use **pre-computed chunk relations** stored in a `chunk_relations` table. For each paragraph (chunk), store the top 30 most semantically similar **same-language** chunks + top 10 most similar **English supplemental** chunks (for non-English chunks only) from the entire corpus, excluding adjacent paragraphs from the same chapter.

This powers three features:

1. **Related Teachings side panel** — while reading, a right-side panel shows the top 3 related passages from other books, updating as the reader scrolls. Related passages are displayed in categories based on the relationship type (see below), so the user sees not just *that* a passage is related but *why*.
2. **"Continue the Thread"** — at the end of every chapter, a section aggregates the most related cross-book passages for all paragraphs in that chapter.
3. **Graph traversal** — clicking a related passage navigates to that passage in its reader context, and the side panel updates with *that* passage's relations. The reader follows threads of meaning across the entire library.

**Relationship categorization** (Milestone 3b+, powered by ADR-117 graph intelligence and ADR-115 enrichment):

Each relation is classified into one of five categories, computed at index time by Claude (ADR-115 enrichment pipeline) and refined by graph traversal path:

| Category | Description | Source |
|----------|-------------|--------|
| **Same Concept** | Passages about the same topic from different works | Vector similarity + topic overlap |
| **Deeper in This Theme** | What this state or concept progresses toward | PROGRESSION_TO graph edges |
| **Another Teacher's Expression** | Same concept expressed by a different lineage teacher | Author-filtered similarity + Teacher graph node |
| **Parallel Tradition** | Cross-tradition equivalent (Hindu ↔ Christian ↔ other) | CROSS_TRADITION_EQUIVALENT graph edges |
| **Technique for This State** | Practice instruction toward the described experiential depth | INSTRUCTS_TECHNIQUE + DESCRIBES_STATE graph edges |

The side panel displays related passages grouped by category. The relationship type is information, not just retrieval — an educational and contemplative value beyond search. Arc 1 through Milestone 3a uses similarity-only categorization (from pre-computed relations). Milestone 4+ adds graph-derived categorization.

**Incremental update strategy:**

| Scenario | Approach |
|----------|----------|
| **New book ingested** | Compute similarity of each new chunk against all existing chunks (incremental). Update existing chunks' top-30 if new chunks displace current entries. |
| **Single chunk updated** (Contentful webhook) | Recompute that chunk's relations against all existing chunks. |
| **Embedding model migration** (ADR-046) | Full recompute of all relations. |

**Multilingual computation strategy (updated 2026-02-18):**

In a multilingual corpus, a naive "top 30 global" approach underserves non-English languages — most slots would be consumed by chunks in other languages (predominantly English, which will be the largest corpus). The computation instead stores:
- **Top 30 same-language** relations: powers the default "Related Teachings" side panel
- **Top 10 English supplemental** relations: provides fallback for non-English languages when same-language corpus is small. A Spanish reader with only 3 Spanish books can still see related English passages, clearly marked with `[EN]`. Empty for English chunks.
- Total: up to 40 rows per chunk (at 400K chunks across all languages = 16M rows — trivial for PostgreSQL)
- The `rank` column indicates rank within its group (1–30 for same-language, 1–10 for English supplemental)

In Arc 1 (en/es), English chunks have empty supplemental slots; Spanish chunks populate both same-language (up to 30) and English supplemental (up to 10) relations from the start.

**Filtering:** Relations are filtered at query time via JOINs — by book, content type, language, or life theme. Top 30 same-language relations provide ample headroom for filtered queries within a language. English supplemental relations are included when the same-language results are insufficient, following the same pattern as the search English fallback (always marked with `[EN]`). When filtering yields < 3 results, fall back to a real-time vector similarity query with the filter as a WHERE clause.

### Rationale

- **The Findability Principle demands proactive content surfacing.** Search is necessary but not sufficient. The teachings should meet the reader where they are — in the middle of a paragraph.
- **Pre-computation eliminates read-time latency.** The side panel must feel instant. A database lookup in `chunk_relations` is a simple indexed JOIN — sub-millisecond.
- **Graph traversal is emergent, not engineered.** The semantic graph is implicit in the embedding space. Pre-computing the edges makes it navigable. No special graph database needed.
- **Paragraph-level is the right granularity.** Sentence-level is too noisy (a sentence like "He smiled" has no semantic content). Section-level is too coarse (misses nuance). Paragraphs are complete thoughts — the natural unit of Yogananda's prose.
- **Per-language storage ensures full related teachings for every language.** At 400K chunks × 40 relations = 16M rows in the fully multilingual corpus. Trivial storage. Sufficient for filtered queries across most filter combinations. Non-English languages are never second-class citizens whose related teachings depend on constant real-time fallback. English supplemental relations follow the same `[EN]` marking pattern as the search fallback — consistent multilingual UX.
- **Incremental updates are efficient.** Adding a 3,000-chunk book to a 50,000-chunk corpus requires ~150M cosine similarity comparisons — minutes with vectorized computation, not hours.

### Consequences

- The ingestion pipeline gains a new Step 7: Compute Chunk Relations (after embedding, before final verification)
- A `chunk_relations` table is added to migration 001 (empty until Milestone 3c populates it with multi-book content)
- A `chunk_references` table is added for human-curated editorial cross-references (supplements automatic similarity)
- Two new API endpoints: `/api/v1/passages/[id]/related` and `/api/v1/books/[slug]/chapters/[number]/thread`
- Two new service functions: `relations.ts` and `thread.ts`
- The Book Reader component gains a Related Teachings side panel (desktop) and bottom sheet (mobile)
- A related content quality test suite (Milestone 3c+) validates that pre-computed relations are thematically relevant, cross-book diverse, and free of false friends
- The `books` table gains a `bookstore_url` column to power "Find this book" links (physical book bridge)

---

---

---

## ADR-052: Passage Resonance Signals — Content Intelligence Without Surveillance

**Status:** Accepted | **Date:** 2026-02-20
**Context:** ADR-002 (DELTA boundaries), ADR-095 (observability), ADR-053 (search intelligence)

### Context

The portal tracks search queries (anonymized) and search themes (aggregated) per ADR-053. But it has no signal for which *passages* resonate with seekers. Which quotes are shared most? Which cross-book connections are traversed most? This is content intelligence — understanding which teachings serve seekers best — not user tracking.

### Decision

Collect anonymous, aggregated, passage-level resonance signals for editorial use. Strictly content-level, never user-level.

**Signals collected:**

| Signal | Source | Storage |
|--------|--------|---------|
| Share count | Increment when share link/image/PDF generated (ADR-068) | `book_chunks.share_count` (integer) |
| Dwell count | Increment when dwell mode activated (DES-009) | `book_chunks.dwell_count` (integer) |
| Relation traversal | Increment when a chunk_relation link is followed | `chunk_relations.traversal_count` (integer) |
| "Show me another" skip | Increment when Today's Wisdom "Show me another" is clicked | `daily_passages.skip_count` (integer) |

**Constraints:**
- Counters are simple integers. No timestamps, no session correlation, no user identification.
- Counters are increment-only (no decrement, no reset). Monotonic.
- Not exposed to seekers. Never displayed publicly ("Most shared passage" would create a popularity contest — antithetical to Calm Technology).
- Accessible only in the editorial review portal (ADR-082) for curation intelligence: "Which passages are resonating?" informs Today's Wisdom selection, theme page curation, and the "What Is Humanity Seeking?" dashboard.
- Rate-limited: one increment per signal type per client IP per hour (prevents gaming without requiring user accounts).

### Scheduling

- Instrumentation: Milestone 2a (simple counter increments on existing API responses).
- Editorial dashboard: Milestone 3b (alongside the editorial review portal, Deliverable 4.5a).

### Consequences

- Four new integer columns on existing tables (no new tables)
- Rate-limiting logic added to share, dwell, and relation API handlers
- Editorial review portal gains a "Resonance" view showing top-shared, top-dwelled, and most-traversed passages
- **Extends ADR-053** from query-level intelligence to passage-level intelligence
- **Complements ADR-002** (DELTA boundaries) — content intelligence, not user intelligence

---

---

## ADR-053: "What Is Humanity Seeking?" — Anonymized Search Intelligence

**Status:** Accepted | **Date:** 2026-02-19

### Context

The portal's `search_queries` table logs every search query without any user identification (ADR-095, DELTA compliance). Over time, this data represents something unprecedented: a real-time, global window into what humanity is seeking spiritual guidance about.

- "Fear" spikes during crises. "Death" rises after public tragedies. "Love" peaks seasonally. "Purpose" trends among younger seekers.
- These patterns are aggregated and anonymous — no individual is identified, no session is tracked.
- The philanthropist's foundation funded this project to expand the global availability of Yogananda's teachings. Demonstrating *what the world is seeking* is a profound way to show impact.

### Decision

Produce a yearly **"What Is Humanity Seeking?"** report from aggregated, anonymized search query data. This is a research and mission contribution, not a product feature.

#### Data pipeline

1. **Aggregation (automated, nightly):** Group search queries by theme (using the existing theme taxonomy from ADR-032), by geography (country-level from Vercel Analytics or request headers — no finer granularity), and by time period (weekly, monthly, yearly). Store aggregates in a `search_theme_aggregates` table.
2. **Trend detection (automated):** Identify rising/falling themes, seasonal patterns, and correlations with world events. Claude can assist with narrative-quality trend descriptions — but all descriptions are reviewed by a human before publication.
3. **Report generation (annual, human-curated):** SRF staff or the philanthropist's foundation curates the data into a narrative report. The portal provides the raw aggregates and trend data; the human provides the interpretation.

#### Schema addition

```sql
CREATE TABLE search_theme_aggregates (
 id UUID PRIMARY KEY DEFAULT uuidv7(),
 period_start DATE NOT NULL,
 period_end DATE NOT NULL,
 period_type TEXT NOT NULL CHECK (period_type IN ('week', 'month', 'quarter', 'year')),
 theme_slug TEXT, -- NULL for unclassified queries
 country_code TEXT, -- ISO 3166-1 alpha-2, NULL for global
 query_count INTEGER NOT NULL DEFAULT 0,
 unique_terms INTEGER NOT NULL DEFAULT 0, -- distinct query strings
 sample_queries TEXT[], -- 5–10 representative (anonymized) queries for context
 created_at TIMESTAMPTZ NOT NULL DEFAULT now
);

CREATE INDEX idx_search_aggregates_period ON search_theme_aggregates(period_type, period_start);
CREATE INDEX idx_search_aggregates_theme ON search_theme_aggregates(theme_slug, period_type);
```

#### Visibility

- **Milestone 3d:** Search analytics dashboard in Retool (staff-only). Raw aggregate exploration.
- **Milestone 5b:** Impact dashboard at `/admin/impact` (leadership-facing). Includes "What Is Humanity Seeking?" visualization: warm-toned world map, trending themes, and temporal patterns.
- **Annual report:** Published by SRF or the philanthropist's foundation. Format TBD (PDF, web page, or both). Not automatically generated — human-curated from the aggregate data.

#### DELTA compliance

- **Dignity:** No individual is identified. No query is attributable to a person. The data is always aggregated (minimum granularity: country + week).
- **Agency:** Seekers are not aware of or affected by the aggregation. Their search experience is unchanged.
- **Embodiment:** The report encourages reflection on collective human need, not individual tracking.
- Minimum aggregation threshold: theme + country combinations with fewer than 10 queries in a period are suppressed (to prevent inference about small populations).

### Rationale

- **Mission alignment.** The philanthropist asked: "What can we do to help SRF make Paramahansa Yogananda's books available freely throughout the world?" Understanding what the world is seeking is a direct answer to that question.
- **Unique contribution.** No other spiritual organization has real-time data on what humanity seeks spiritual guidance about. This data, handled with DELTA integrity, is a gift to the world — not a surveillance product.
- **Impact reporting.** The foundation that funded the portal deserves to see its impact beyond page view counts. "Fear was the most searched theme globally in 2027, and 47 countries found guidance in Yogananda's words on courage" is infinitely more meaningful than "2.3M page views."

### Consequences

- `search_theme_aggregates` table added (Milestone 3d, alongside search analytics dashboard)
- Nightly aggregation Lambda function (Milestone 3d, uses ADR-017 Lambda infrastructure)
- Theme classification of search queries integrated into the search pipeline (lightweight Claude call or keyword matching against theme taxonomy)
- Impact dashboard in Milestone 5b gains "What Is Humanity Seeking?" section
- Annual report production becomes an SRF staff responsibility (the portal provides data, not the report itself)
- Minimum aggregation threshold (10 queries) prevents inference about small populations
- **Extends ADR-095** (DELTA-compliant analytics) and **ADR-032** (theme taxonomy)

---

---

## ADR-114: pg_search / ParadeDB BM25 for Full-Text Search

- **Status:** Accepted
- **Date:** 2026-02-23

### Context

ADR-044 establishes hybrid search (vector + full-text) as the retrieval strategy. The initial design assumed PostgreSQL's built-in `tsvector` for full-text search. While functional, `tsvector` has limitations for this corpus:

1. **Ranking quality.** `ts_rank` uses a simple frequency-based scoring model. BM25 (Best Matching 25) is the standard ranking algorithm in modern information retrieval, providing significantly better relevance ranking through term frequency saturation, document length normalization, and inverse document frequency weighting.

2. **Multilingual tokenization.** `tsvector` relies on PostgreSQL's built-in text search configurations, which handle Western European languages well but lack specialized tokenization for CJK scripts, Arabic, and other complex writing systems. The portal's multilingual-from-foundation principle (ADR-075) requires tokenization that works across all target languages.

3. **No phrase search.** `tsvector` doesn't support proximity-aware phrase matching. Seekers often remember exact phrases from Yogananda's works ("door of my heart," "ever-new joy"). BM25 with positional indexing enables phrase and proximity search.

pg_search (the ParadeDB extension) is available on Neon in AWS regions. It provides Elasticsearch-quality BM25 entirely within Postgres — no separate service, full SQL JOIN capability, ACID-compliant.

### Decision

Use pg_search / ParadeDB BM25 as the full-text search engine for the portal. This replaces `tsvector` for all full-text retrieval.

**Primary BM25 index:** ICU tokenizer, covering ~90% of target languages with a single index:

```sql
CREATE INDEX chunks_bm25_icu ON book_chunks
    USING bm25 (id, content, summary, topics)
    WITH (
        key_field = 'id',
        text_fields = '{
            "content": {"tokenizer": {"type": "icu"}, "record": "position"},
            "summary": {"tokenizer": {"type": "icu"}},
            "topics":  {"tokenizer": {"type": "icu"}}
        }'
    );
```

**Language-specific partial indexes** for scripts that require specialized segmentation:

```sql
-- Chinese: Jieba dictionary-based segmentation
CREATE INDEX chunks_bm25_zh ON book_chunks
    USING bm25 (id, content)
    WITH (
        key_field = 'id',
        text_fields = '{"content": {"tokenizer": {"type": "jieba"}}}'
    )
    WHERE script = 'cjk' AND language LIKE 'zh%';

-- Japanese: Lindera morphological analysis
CREATE INDEX chunks_bm25_ja ON book_chunks
    USING bm25 (id, content)
    WITH (
        key_field = 'id',
        text_fields = '{"content": {"tokenizer": {"type": "lindera"}}}'
    )
    WHERE script = 'cjk' AND language = 'ja';
```

**Hybrid search via Reciprocal Rank Fusion (RRF):** The BM25 results are merged with pgvector results using RRF in a single SQL query, consistent with ADR-044.

### Rationale

- **BM25 is the industry standard.** Every major search engine (Elasticsearch, Solr, Typesense) uses BM25. It handles term saturation (repeating a word doesn't inflate scores) and document length normalization (short aphorisms aren't penalized relative to long narrative passages).
- **Multilingual tokenization from day one.** ICU tokenization handles Latin, Cyrillic, Arabic, Devanagari, and most scripts. Jieba and Lindera handle the CJK scripts that require dictionary-based segmentation. No separate search service required.
- **Stays inside Postgres.** pg_search operates as a Postgres extension. All queries are standard SQL with `@@@` operator. JOINs, CTEs, and transactions work naturally. No data synchronization with an external service.
- **Phrase search enables "I remember the exact words" queries.** Positional indexing (`"record": "position"`) enables phrase and proximity queries — critical for a corpus where seekers often remember specific formulations.

### Consequences

- `tsvector` columns and indexes are not needed; pg_search BM25 indexes replace them entirely
- The `hybrid_search` SQL function uses `paradedb.score(id)` and `@@@` operator instead of `ts_rank` and `@@`
- Arc 1 BM25 indexes use ICU tokenizer for English, Hindi (Devanagari), and Spanish; CJK-specific indexes added in Milestone 5b
- DESIGN.md DES-003 (Search Architecture) updated to reflect pg_search in the search flow
- A `script` column on `book_chunks` routes queries to the appropriate partial index at Milestone 5b

---

---

## ADR-115: Unified Enrichment Pipeline — Single Index-Time Pass per Chunk

- **Status:** Accepted
- **Date:** 2026-02-23

### Context

ADR-005 defines eight permitted Claude use cases (E1–E8). Some operate at query time (E1: intent classification, E2: terminology bridge), but several operate at index time on each chunk: E3 (accessibility rating), E4 (ingestion QA), E6 (chunk relation classification), E8 (tone classification). Additionally, the RAG Architecture Proposal identifies further index-time enrichments: topics, entities, domain classification, experiential depth, voice register, emotional quality, cross-references, and relationship extraction.

Running separate Claude calls per chunk for each enrichment type is wasteful and inconsistent — a single prompt seeing the full chunk can produce more coherent, contextually informed outputs than six separate prompts each seeing the chunk in isolation.

### Decision

Consolidate all index-time Claude enrichment into a single prompt per chunk. The enrichment pipeline produces one structured JSON output containing all metadata fields:

```json
{
  "summary": "This passage describes Yogananda's experience of cosmic consciousness during meditation...",
  "topics": ["cosmic consciousness", "samadhi", "divine union"],
  "entities": {
    "teachers": ["Paramahansa Yogananda"],
    "divine_names": ["Divine Mother"],
    "techniques": ["Kriya Yoga"],
    "sanskrit_terms": ["samadhi", "nirvikalpa"],
    "works": [],
    "concepts": ["cosmic consciousness", "self-realization"],
    "places": ["Encinitas"],
    "experiential_states": ["nirvikalpa samadhi"]
  },
  "domain": "philosophy",
  "experiential_depth": 7,
  "emotional_quality": ["inspiring", "devotional"],
  "voice_register": "cosmic",
  "accessibility_level": 4,
  "semantic_density": "high",
  "cross_references": [
    {"type": "scripture", "ref": "Bhagavad Gita IV:35", "explicit": true}
  ],
  "passage_role": "culmination",
  "relationships": [
    {
      "subject": "Paramahansa Yogananda",
      "relationship": "DESCRIBES_STATE",
      "object": "nirvikalpa samadhi",
      "confidence": 0.95
    }
  ]
}
```

**Enrichment field definitions:**

| Field | Type | Description |
|-------|------|-------------|
| `summary` | TEXT | "This passage is primarily about..." — in the chunk's detected language |
| `topics` | TEXT[] | Canonical topic labels for thematic indexing |
| `entities` | JSONB | Typed entity extraction, validated against entity registry (ADR-116) |
| `domain` | TEXT | philosophy / narrative / technique / devotional / poetry |
| `experiential_depth` | INT (1–7) | Level of consciousness described: 1=ordinary waking, 2=relaxed concentration, 3=pratyahara, 4=dharana, 5=dhyana, 6=sabikalpa samadhi, 7=nirvikalpa/cosmic consciousness |
| `emotional_quality` | TEXT[] | consoling / inspiring / instructional / devotional / demanding / celebratory |
| `voice_register` | TEXT | intimate / cosmic / instructional / devotional / philosophical / humorous |
| `accessibility_level` | INT (1–5) | Language/concept accessibility (from ADR-005 E3) |
| `semantic_density` | TEXT | high / medium / low (from ADR-048) |
| `passage_role` | TEXT | Rhetorical function within chapter: opening / exposition / narrative / turning_point / deepening / illustration / culmination / resolution / transition / aside. Inferred from content + chapter title + sequential position. Seeds structural enrichment (PRO-025). |
| `cross_references` | JSONB | Explicit references to other works, teachers, scriptures |
| `relationships` | JSONB[] | Extracted entity-relationship triples for graph construction |

**Key constraints:**
- The enrichment prompt runs in the chunk's detected language
- Entity names are validated against the canonical entity registry (ADR-116)
- Confidence < 0.7 on any relationship flags it for human review queue
- Enrichment output is stored as structured Postgres columns, not raw JSON blobs
- Claude Opus is used for enrichment (batch tier, ADR-014) — accuracy matters more than speed at index time

**Query-time operations remain separate:** E1 (intent classification) and E2 (terminology bridge) operate at query time and are not part of this pipeline.

### Rationale

- **One prompt is more coherent than six.** Claude seeing the full chunk once can produce internally consistent outputs — the domain classification informs the emotional quality, the entity extraction informs the relationship extraction.
- **Cost reduction.** One Opus call per chunk instead of multiple Haiku calls. At ~50K chunks, the difference is significant.
- **The enrichment prompt is the most consequential engineering in the system.** Everything downstream — search quality, suggestion vocabulary, graph construction, related teachings categorization — depends on enrichment quality. A unified prompt with a single, carefully designed output schema is easier to test, iterate, and validate than six separate prompts.
- **Consistent with "AI proposes, humans approve."** The enrichment pipeline produces structured metadata. Confidence-flagged outputs enter the human review queue. Published content always passes through human verification.

### Consequences

- New enrichment columns added to `book_chunks`: `experiential_depth`, `voice_register`, `emotional_quality`, `cross_references`, `domain` (see DESIGN.md DES-004)
- The ingestion pipeline (DES-005) is updated to include the unified enrichment step
- An `extracted_relationships` table logs all relationship triples for graph intelligence (ADR-117)
- The enrichment prompt itself requires a dedicated design sprint — test against 20–30 actual passages spanning all document types before committing the pipeline (Milestone 1a pre-implementation checklist)
- ADR-005 E3, E4, E6, E8 are folded into this pipeline; E1, E2, E5, E7 remain as separate operations

---

---

## ADR-116: Canonical Entity Registry and Sanskrit Normalization

- **Status:** Accepted
- **Date:** 2026-02-23

### Context

The SRF corpus contains a rich but bounded set of entities: teachers, divine names, techniques, Sanskrit terms, works, concepts, places, and experiential states. The same entity frequently appears under multiple surface forms — "Master," "Guruji," "Swami Yogananda," and "Paramahansa Yogananda" all refer to the same person. "Divine Mother" must be distinguished from "mother" (a parent). Sanskrit terms appear in multiple transliterations: "samadhi," "Samaadhi," "samahdi."

Without canonical entity resolution, the enrichment pipeline (ADR-115) produces inconsistent entity tags, the suggestion system (ADR-049) surfaces duplicates, and the knowledge graph (ADR-117) creates redundant nodes.

### Decision

Two first-class tables provide canonical entity resolution for the entire system:

**Entity Registry:**

```sql
CREATE TABLE entity_registry (
    id              UUID PRIMARY KEY DEFAULT uuidv7(),
    canonical_name  TEXT NOT NULL,
    entity_type     TEXT NOT NULL,  -- Teacher|DivineName|Work|Technique|SanskritTerm|Concept|Place|ExperientialState
    aliases         TEXT[],         -- all known surface forms
    language        CHAR(5),
    definition      TEXT,
    srf_definition  TEXT,           -- Yogananda's specific definition if distinct from general usage
    centrality_score REAL,          -- PageRank from graph batch (Milestone 3b+, ADR-117)
    community_id   TEXT,            -- community detection cluster (Milestone 3b+, ADR-117)
    bridge_score   REAL,            -- betweenness centrality (Milestone 3b+, ADR-117)
    created_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE(canonical_name, entity_type)
);

CREATE INDEX entity_aliases_idx ON entity_registry USING gin(aliases);
```

**Sanskrit Normalization:**

```sql
CREATE TABLE sanskrit_terms (
    id              UUID PRIMARY KEY DEFAULT uuidv7(),
    canonical_form  TEXT NOT NULL,     -- "samadhi"
    display_form    TEXT NOT NULL,     -- "Samadhi"
    devanagari      TEXT,              -- "समाधि"
    iast_form       TEXT,              -- "samādhi"
    common_variants TEXT[],            -- ["Samaadhi", "samahdi"]
    srf_definition  TEXT,
    domain          TEXT,              -- philosophy|practice|state|quality
    depth_level     INT,               -- if an experiential state: 1-7 (per ADR-115)
    weight          INT DEFAULT 100    -- suggestion ranking weight
);
```

**Construction sequence:**
1. **Before ingestion:** Claude generates an initial entity registry seed from domain knowledge (~500 canonical entries covering teachers, major works, core Sanskrit terms, key concepts). Human review closes gaps.
2. **During ingestion:** The enrichment pipeline (ADR-115) validates all extracted entities against the registry. Unknown entities are flagged for human review and potential registry addition.
3. **Per-book update:** Each new book ingestion may surface new entities. The registry grows but never shrinks. Provenance tracked per entry.

### Rationale

- **Bounded, manageable vocabulary.** Unlike a general-purpose NER system, the SRF entity space is finite and knowable. A curated registry is more accurate than statistical extraction alone.
- **Alias resolution is critical for search quality.** A user searching "the Master" must find passages tagged with "Paramahansa Yogananda." Without canonical resolution, the search relies on embedding similarity alone — which works for close synonyms but fails for culturally specific aliases.
- **Sanskrit normalization respects seeker diversity.** Hindi speakers type Devanagari, Western students type rough transliterations, scholars type IAST. All should reach the same term.
- **The registry feeds the suggestion system.** Every entity becomes a high-value suggestion (ADR-049, Tier 2). Every Sanskrit term becomes a suggestion with inline definition (Tier 4).

### Consequences

- Entity registry populated before first book ingestion (Milestone 1a pre-implementation checklist)
- All enrichment entity extraction (ADR-115) resolves against the registry
- Suggestion dictionary (ADR-049, ADR-120) draws Tier 2 and Tier 4 entries from these tables
- Knowledge graph relationships (ADR-117) reference entity registry entries via canonical ID
- DESIGN.md DES-004 (Data Model) updated with both table schemas
- ADR-080 (Sanskrit Display, Search Normalization, and Devanāgarī Typography) extended by the `sanskrit_terms` table

---

---

## ADR-117: Postgres-Native Graph Intelligence Layer

- **Status:** Accepted
- **Date:** 2026-02-23

### Context

The portal requires graph intelligence to make Yogananda's cross-tradition intellectual project computationally navigable:

- **Related Teachings with categorized paths** (ADR-050): not just "similar" passages, but passages related by concept neighborhood, cross-tradition parallels, experiential state progression, and teacher lineage
- **Contemplative Companion:** a user describes an inner state; the system traverses the ExperientialState graph to find the closest match and surfaces Yogananda's verbatim descriptions
- **Scripture-in-Dialogue:** navigating Yogananda's Gita and Gospel commentaries as a unified cross-tradition conversation via verse-level graph edges
- **Reading Arc:** graph-guided progressive study sequences computed from concept depth and PROGRESSION_TO edges
- **Graph-augmented retrieval:** a third retrieval path that finds passages pure vector and keyword search cannot — passages that never mention the search term but are conceptually adjacent via the graph

These features are not ornamental — they are what distinguishes a world-class spiritual text platform from a search box over books.

### Decision

Implement graph intelligence **within the single-database architecture** (ADR-013). Neon PostgreSQL stores all graph structure in relational tables. Graph algorithms run as nightly batch jobs using Python + NetworkX/igraph. Graph-augmented retrieval (PATH C) uses multi-step SQL queries composed in application code.

**No separate graph database.** Neptune Analytics was evaluated and rejected (see Alternatives Considered).

**Graph data model:**
- Graph structure stored in Postgres tables: `entity_registry` (ADR-116), `extracted_relationships` (ADR-115), `concept_relations`, and entity-type-specific tables
- Relationships are first-class rows — queryable by standard SQL, indexable, joinable with content tables
- Canonical entity IDs from `entity_registry` serve as the primary key for all graph nodes

**Graph algorithms (nightly batch, Milestone 3b+):**
- Python batch job loads entities and relationships from Postgres into NetworkX/igraph (in-memory — the full graph fits easily at ~50K chunks, ~500 entities, ~500K edges)
- **PageRank:** Which concepts are most referenced? Results written as `centrality_score` column on entity rows. Feeds suggestion weights and retrieval confidence.
- **Community Detection:** Which concept clusters naturally co-occur? Results written as `community_id` column. Feeds "conceptual neighborhood" queries and theme browsing.
- **Betweenness Centrality:** Which concepts bridge otherwise separate clusters? Results written as `bridge_score` column. High betweenness = cross-tradition bridge terms.
- All algorithm results stored as columns in Postgres, refreshed nightly. No external system required.

**Graph-augmented retrieval (PATH C, Milestone 3b+):**
- Entity resolution against `entity_registry` identifies concepts in the query
- SQL traversal across `extracted_relationships` and `concept_relations` tables finds chunks within 2–3 hops
- pgvector similarity ranking applied to traversal results
- Multi-step queries composed in `/lib/services/graph.ts` — two-three SQL round-trips instead of one openCypher query
- Results merged into RRF alongside PATH A (vector) and PATH B (BM25)

**Phasing:**
- **Arc 1:** Graph ontology designed and documented in DES-054/055. Entity registry and extracted_relationships tables created.
- **Milestone 3b:** Graph algorithm batch pipeline (Python + NetworkX). PATH C activated in search pipeline. Knowledge graph foundation: all node types and edge types populated.
- **Milestone 5a:** Concept/word graph fully constructed: cross-tradition equivalences, progression chains, co-occurrence edges.

### Alternatives Considered

**Neptune Analytics (rejected):**
Neptune Analytics was the original choice (Feb 2026). It offers combined graph traversal + vector similarity in a single openCypher query — an elegant capability. Rejected for five reasons:

1. **The corpus is too small to justify a second database.** ~50K–100K chunks with ~500 entities fits in memory on commodity hardware. The full graph loads in seconds; all algorithms complete in under a minute. Neptune is designed for billion-edge graphs.
2. **Two-system data synchronization is a permanent operational tax.** Every entity must be synced between Postgres and Neptune. Every migration, debugging session, and monitoring pipeline doubles in surface area. This tax compounds over the project's 10-year horizon.
3. **The single-query unification advantage is narrow.** The combined traversal + vector query is elegant but adds only ~10-20ms latency when decomposed into multi-step SQL. In a search pipeline already at 200-400ms, this is negligible.
4. **ADR-013's single-database rationale applies to Neptune as strongly as to DynamoDB.** The original arguments — one backup strategy, one connection string, one migration tool, one monitoring target — are just as valid for a graph database as for a key-value store.
5. **The Vocabulary Bridge (ADR-129) and query expansion (Milestone 1c) already cover the primary GraphRAG use case.** Cross-tradition term mappings ("Holy Spirit" ↔ "AUM") are captured in the bridge and expanded at query time. The remaining edge cases where PATH C would uniquely contribute are vanishingly rare in a single-author corpus with consistent vocabulary.

**Apache AGE (PostgreSQL extension):** Adds openCypher support to PostgreSQL — attractive in principle, but not available on Neon (the project's database provider). Would require self-hosting Postgres, contradicting the managed-infrastructure strategy.

### Rationale

- **The bounded corpus is the key insight.** A 50K–100K chunk corpus with ~500 canonical entities is a graph problem that fits in a Python dictionary, not one that requires a graph database. NetworkX handles it trivially.
- **ADR-013 remains unqualified.** The single-database architecture is restored to its original strength: one system for all data, all queries, all operations.
- **Pre-computation absorbs the runtime cost.** Graph algorithm results are pre-computed nightly and stored as Postgres columns. Read-time queries are simple SELECTs and JOINs — no graph engine involved.
- **PATH C's value is empirically testable.** The Milestone 1a golden query set includes graph-dependent test queries. If two-path search + terminology bridge handles them adequately, PATH C can be deferred or eliminated entirely without architectural regret.
- **Operational simplicity is a 10-year feature.** A system that a single developer can debug, maintain, and operate for a decade outperforms a technically superior but operationally complex alternative.

### Consequences

- ADR-013 remains the unqualified single-database architecture — no amendment
- DES-004 (Data Model) uses standard relational columns for graph metadata (no `neptune_node_id`)
- DES-005 (Content Ingestion Pipeline) stores extracted relationships in Postgres (no graph-load step to external system)
- DES-054 (Knowledge Graph Ontology) and DES-055 (Concept/Word Graph) describe node/edge types stored in Postgres tables, computed by batch jobs
- DES-003 (Search Architecture) PATH C uses multi-step SQL queries in `/lib/services/graph.ts`
- Milestone 3b in ROADMAP.md adds graph algorithm batch pipeline (Python + NetworkX), not Neptune provisioning
- No infrastructure configuration for graph infrastructure — batch job runs as Lambda or Vercel cron
- Graph ontology designed from Arc 1 and documented in DES-054/055

---

---

## ADR-118: Voyage voyage-3-large as Primary Embedding Model

- **Status:** Accepted
- **Date:** 2026-02-23
- **Updates:** ADR-046 (Embedding Model Versioning), ADR-047 (Multilingual Embedding Quality Strategy)

### Context

ADR-046 established embedding model versioning infrastructure. ADR-047 selected OpenAI `text-embedding-3-small` (1536 dimensions) as the Arc 1 embedding model, with planned benchmarking against multilingual-optimized alternatives at Milestone 5b.

The RAG Architecture Proposal makes a compelling case for starting with a higher-quality embedding model:

1. **Literary and spiritual text quality.** `text-embedding-3-small` is optimized for breadth across all domains, not depth in any. Yogananda's prose is rich in literary allusion, Sanskrit vocabulary, figurative language, and experiential description — domains where specialized models outperform generalists.
2. **Multilingual-first design.** Voyage `voyage-3-large` embeds 26 languages in a unified space, with multilingual capability as a design goal rather than a side effect. A French query naturally retrieves French text; cross-lingual search is structural, not bolted on.
3. **Asymmetric encoding.** Voyage supports `input_type = 'document'` at index time and `input_type = 'query'` at query time — optimizing the embedding for its role in retrieval.
4. **Migration cost is real.** Even with ADR-046 infrastructure, re-embedding the entire corpus is work. Starting with the stronger model avoids a foreseeable migration.

### Decision

Use Voyage `voyage-3-large` (1024 dimensions, 26 languages, 32K token input) as the primary embedding model from Arc 1.

**Key changes from previous design:**
- Vector dimension: 1536 → 1024 (all `VECTOR()` column definitions and HNSW index parameters updated)
- Asymmetric encoding: `input_type = 'document'` at ingestion, `input_type = 'query'` at search time
- Hosting: Voyage API by default. At significant volume, evaluate AWS Marketplace SageMaker model packages for Voyage to keep inference AWS-native.

**ADR-046 infrastructure preserved:** The `embedding_model`, `embedding_dimension`, and `embedded_at` columns remain on `book_chunks`. The versioning and migration infrastructure is unchanged — it serves as insurance for future model changes.

**Benchmarking deferred, not abandoned:** Milestone 5b benchmarks Voyage against alternatives (Cohere embed-v3, BGE-M3, `voyage-multilingual-2` for CJK-heavy text) with the actual multilingual corpus. If a model demonstrably outperforms Voyage on specific languages, the ADR-046 migration path activates.

### Rationale

- **Start with the best available model for this corpus type.** The portal's core offering is semantic search over literary/spiritual text. Starting with a model optimized for that domain means higher quality from launch.
- **1024 dimensions is sufficient.** Voyage `voyage-3-large` at 1024d outperforms OpenAI at 1536d on literary retrieval benchmarks. Smaller vectors also reduce storage and improve HNSW search speed.
- **The bounded corpus makes re-embedding cheap.** Even if Voyage proves suboptimal for specific languages at Milestone 5b, re-embedding ~50K chunks takes hours. The migration friction that justifies starting with the "good enough" model doesn't exist at this corpus scale.
- **Cost is negligible at corpus scale.** Embedding the full multilingual corpus costs under $10. The embedding model should be selected for quality, not cost (per ADR-047).

### Consequences

- All `VECTOR(1536)` definitions in the schema change to `VECTOR(1024)`
- HNSW index parameters updated for 1024 dimensions
- Voyage API key added to environment configuration
- DESIGN.md tech stack table updated: Voyage `voyage-3-large` replaces OpenAI `text-embedding-3-small`
- Graph-augmented retrieval (ADR-117, PATH C) uses pgvector similarity on chunks retrieved via graph traversal
- Milestone 5b benchmarking scope updated: Voyage as baseline rather than OpenAI

---

---

## ADR-119: Advanced Search Pipeline — Pure Hybrid Primary, AI-Enhanced Optional

- **Status:** Accepted
- **Date:** 2026-02-23

### Context

The search pipeline uses a two-path hybrid search: pgvector dense vector + full-text keyword, merged via Reciprocal Rank Fusion. This pure hybrid approach — with no external AI services in the search path — is the **primary search mode** for all arcs.

The design invests in index-time enrichment (ADR-115 unified enrichment, ADR-129 Vocabulary Bridge, ADR-116 entity resolution) so that the vocabulary gap between seeker language and Yogananda's language is bridged *in the index*, not at query time. A seeker types "mindfulness" and BM25 finds chunks enriched with "concentration" because the bridge already made that connection during ingestion.

Three well-established retrieval enhancements remain available as **optional upgrades**, activated only if Milestone 1a's search quality evaluation demonstrates they are needed:

1. **HyDE (Hypothetical Document Embedding).** Instead of embedding the user's query (which lives in "query space"), an LLM generates a hypothetical passage that would answer the query, and *that passage* is embedded. The search then operates in "document space." Research shows significant lift on literary, philosophical, and domain-specific corpora where query language diverges from document language.

2. **Cross-encoder reranking.** A purpose-built cross-encoder (e.g., Cohere Rerank 3.5 or an open-source alternative like BGE-reranker-v2) sees query + passage together and produces a true relevance score. Multilingual-native, no language routing needed.

3. **Graph-augmented retrieval.** With the knowledge graph (ADR-117) active in Milestone 3b+, a third retrieval path becomes available: entity-aware graph traversal combined with vector similarity. This path finds passages that neither vector nor keyword search can find — passages that never mention the search term but are conceptually adjacent via the graph. Implemented via multi-step SQL queries against Postgres graph tables (no external graph database).

### Decision

**Pure hybrid search is the primary mode.** No external AI services in the search hot path. Search latency is dominated by database query time (~50–200ms) plus network RTT — no LLM or reranker API calls. This achieves search p95 < 500ms from any continent (see ADR-021 § Regional Latency Targets).

**Three optional enhancements, activated conditionally:**

**Milestone 2b (if warranted by 1a evaluation): HyDE**
- For complex or experiential queries (not simple keyword lookups), an LLM generates a hypothetical passage (~100–200 tokens) that would answer the query
- The hypothesis is embedded with Voyage (`input_type = 'query'`) and used as an additional vector search input alongside the original query embedding
- Both vectors contribute candidates to the RRF merge
- Bypass for simple keyword queries (detected by heuristic intent classification)

**Milestone 2b (if warranted by 1a evaluation): Cross-Encoder Reranking**
- After RRF fusion produces ~50 candidates, a cross-encoder sees query + passage pairs
- Cross-encoder scoring produces true relevance scores (not just ranking positions)
- Top 10 returned with confidence scores
- Options: Cohere Rerank 3.5 (managed API), BGE-reranker-v2 (open-source, self-hosted on Lambda), or another cross-encoder
- Multilingual-native — no language routing needed

**Milestone 3b+: Three-Path Parallel Retrieval**
- **PATH A:** Dense vector (pgvector HNSW) — semantic similarity
- **PATH B:** BM25 keyword (pg_search) — exact term and phrase matching
- **PATH C:** Graph-augmented retrieval (Postgres, ADR-117) — entity-aware graph traversal via multi-step SQL queries against `extracted_relationships` and `concept_relations` tables, combined with pgvector similarity. Traverses concept neighborhoods, lineage relationships, cross-tradition bridges, experiential state graph.
- All three paths contribute candidates to RRF fusion before any optional reranking

```
Primary mode (all arcs):     PATH A + PATH B → RRF → top 5
Enhanced mode (M2b+, if warranted): PATH A + PATH B + HyDE → RRF → cross-encoder rerank
Full mode (M4+, if warranted):      PATH A + PATH B + PATH C + HyDE → RRF → cross-encoder rerank
```

**Activation gate:** The Milestone 1a search quality evaluation (≥ 80% of test queries return at least one relevant passage in top 3) determines whether the primary mode is sufficient. If the threshold is met comfortably (≥ 90%), AI-enhanced modes are deferred. If met marginally (80–89%), evaluate HyDE and reranking. If not met, activate enhancements and re-evaluate.

### Rationale

- **Pure hybrid is fast and globally equitable.** Without AI services in the hot path, search completes in ~200–400ms from anywhere on Earth. A seeker in rural Bihar gets the same latency as one in Los Angeles. Adding Claude and Cohere to the hot path adds 700–1500ms — the AI services become the bottleneck, not the database or network.
- **Index-time enrichment bridges the vocabulary gap.** The Vocabulary Bridge (ADR-129), unified enrichment (ADR-115), and entity resolution (ADR-116) map modern vocabulary to Yogananda's language at ingestion time. "Mindfulness" is linked to "concentration" in the BM25 index. The gap that HyDE solves at query time can instead be solved at index time — with no per-query cost and no per-query latency.
- **HyDE is high-lift for spiritual text — but may be unnecessary if enrichment is thorough.** Seekers express queries as emotional states ("I feel lost") or experiential descriptions ("a light I saw in meditation"). These diverge from Yogananda's document language. HyDE bridges this gap at query time; enrichment bridges it at index time. If the enrichment pipeline captures emotional quality, experiential depth, and cross-vocabulary mappings (ADR-115), the query-time bridge may be redundant.
- **Cross-encoder reranking improves precision — at a latency and cost.** Cross-encoders detect relevance that bi-encoder similarity misses. But for a constrained corpus (one book in Arc 1, ~25 books at full corpus), RRF fusion over well-enriched chunks may achieve comparable precision without the per-query API call.
- **Graph-augmented retrieval finds what search cannot.** A passage about "the vibration of AUM" may not mention "Holy Spirit" in its text, but the knowledge graph connects them via Yogananda's explicit cross-tradition mapping. PATH C surfaces this passage — neither vector similarity nor BM25 would find it. This enhancement is not conditional; it activates when the graph is ready (Milestone 3b+).
- **No external AI in the hot path simplifies operations.** Fewer failure modes, no degradation cascade needed, trivially cacheable results, zero per-query AI cost.
- **LLM portability.** Where AI is used (index-time enrichment, optional query-time enhancements), the model is specified via `/lib/config.ts` named constants (ADR-123). Claude today; open-source models (Llama, Mistral, Qwen via Bedrock or self-hosted) as the long-term direction. See ADR-014 § LLM Portability.

### Consequences

- DES-003 (Search Architecture) updated: primary mode has no AI services in the search path
- Search latency budget: primary mode ~200ms (database query); enhanced mode ~350ms (HyDE + rerank); full mode ~400ms (graph-augmented)
- No Cohere API key required for primary mode. Added to environment configuration only if reranking is activated.
- The golden retrieval set (Milestone 1a) serves as the activation gate for AI enhancements
- Cost per query: primary mode ~$0 (database only); enhanced mode ~$0.0015 (LLM + reranker)
- The four-level degradation cascade (DES-003) simplifies: primary mode *is* the degraded mode — it's the baseline, not the fallback

---

---

## ADR-120: Three-Tier Suggestion Cache Architecture

- **Status:** Accepted
- **Date:** 2026-02-23

### Context

ADR-049 establishes corpus-derived suggestions with three types (term completion, query suggestion, bridge-powered). For a world-class search experience, suggestion latency should be invisible — ideally < 30ms perceived (network + render). The threshold for human-perceptible lag is ~50ms; above 100ms, autocomplete feels broken. Google achieves 20–40ms, Linear and Notion hit 15–35ms.

The suggestion dictionary is small — ~1,500 entries at Arc 1 (single book), ~6,300 at full corpus (25 books × 200 terms + entities + curated queries + Sanskrit + concepts). For a dictionary this size, the infrastructure choice should be the *simplest thing that achieves invisible latency*, not the most powerful.

ElastiCache Redis was initially considered but rejected: it requires VPC networking with Vercel (adding 5–15ms that erases its speed advantage), carries significant operational overhead (subnets, security groups, parameter groups, failover), has a high cost floor (~$50–80/mo minimum for production multi-AZ), and is single-region by default. For a 6K-row suggestion dictionary, this is over-engineering.

### Decision

**Three-tier progressive architecture** — each tier is a complete solution; the next tier activates only when the previous one's limits are reached.

**Six-tier suggestion hierarchy** (priority order, unchanged):

| Tier | Type | Source | Example |
|------|------|--------|---------|
| 1 | Scoped queries | Entity co-occurrence from enrichment | "Yogananda on the nature of God" |
| 2 | Named entities | Entity registry (ADR-116) | "Autobiography of a Yogi", "Lahiri Mahasaya" |
| 3 | Domain concept phrases | Topic and summary mining from enrichment | "cosmic consciousness", "divine love" |
| 4 | Sanskrit terms with definitions | `sanskrit_terms` table (ADR-116) | "Samadhi — superconscious state" |
| 5 | Learned queries from logs | Anonymized query log (DELTA-compliant) | (grows over time from ADR-053 signal) |
| 6 | High-value single terms | Hand-curated, ~200–300 terms | "meditation", "karma" |

#### Tier A: Static JSON at the CDN Edge (Milestone 1a+)

Pre-computed suggestion files partitioned by two-character prefix, served as static assets from Vercel's CDN:

```
/public/suggestions/en/_zero.json    — zero-state suggestions (theme chips, curated questions)
/public/suggestions/en/me.json       — all suggestions starting with "me"
/public/suggestions/en/yo.json       — all suggestions starting with "yo"
/public/suggestions/en/_bridge.json  — terminology bridge mappings
```

- **Latency: < 10ms globally** (CDN cache hit, no function invocation, no origin roundtrip)
- **Cost: $0** (static assets on Vercel's CDN)
- **Cold start: none**
- **Build step:** Ingestion pipeline exports `suggestion_dictionary` → partitioned JSON. Rebuilds on deploy or content change.
- **Client-side filtering:** Browser fetches the prefix file (~2–8KB) and filters/ranks locally against the full typed prefix.
- **Bridge hints:** Included in `_bridge.json`, matched client-side.
- **Global-First:** The CDN edge node is nearby for seekers in rural Bihar and Los Angeles alike (Principle #4).

**Why this works for the portal's scale:** At full corpus (~6,300 entries), each two-character prefix file is 2–8KB. The entire English suggestion set is ~150KB. This is smaller than a single hero image. The browser caches prefix files after first fetch — subsequent keystrokes with the same two-character prefix are instant (0ms network).

#### Tier B: pg_trgm Fuzzy Fallback (Milestone 1c+, always-on)

When client-side prefix filtering returns fewer than 3 results (misspelling, mid-word match, novel prefix), the frontend fires an async request to the fuzzy fallback endpoint:

```sql
SELECT suggestion, display_text, weight, suggestion_type, latin_form
FROM suggestion_dictionary
WHERE (similarity(suggestion, $partial_query) > 0.3
       OR similarity(latin_form, $partial_query) > 0.3)
  AND language = $detected_language
ORDER BY weight DESC,
         GREATEST(similarity(suggestion, $partial_query),
                  COALESCE(similarity(latin_form, $partial_query), 0)) DESC
LIMIT 10;
```

- **Latency: 40–80ms** (Neon roundtrip)
- **Purpose:** Fuzzy matching catches misspellings that prefix matching misses. Also handles transliterated input via `latin_form` matching — a Hindi seeker typing Romanized "samadhi" matches against both `suggestion` and `latin_form` columns.
- **Async merge:** Fuzzy results merge into the dropdown when they arrive. The seeker sees prefix results instantly, then fuzzy results appear if needed.
- **Edge caching:** Fuzzy responses carry `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400` — identical misspellings served from edge on repeat.

#### Tier C: Vercel KV (Milestone 2b+, if needed)

If Tier A + B latency is insufficient, Vercel KV (built on Upstash Redis) provides sub-10ms server-side prefix search with zero operational overhead:

- Language-namespaced sorted sets: `suggestions:{language}` → `(suggestion, weight)`
- Prefix lookup: `ZRANGEBYLEX suggestions:en "[Yog" "[Yog\xff"` returns in < 5ms
- Dictionary built offline from corpus enrichment pipeline
- Sanskrit variants loaded from `sanskrit_terms.common_variants` — all variant forms point to the canonical suggestion
- Nightly refresh incorporates query log signal (Tier 5)
- **Cost: ~$20/mo at 1M requests** (Upstash pay-per-use via Vercel integration)
- **Global distribution:** Upstash global replication, no VPC required
- **No infrastructure complexity:** Provisioned via Vercel dashboard or `vercel env`

**Concrete migration trigger:** Activate Tier C when any of these thresholds are sustained for 7 days:
- Suggestion p95 latency exceeds 30ms (measuring CDN miss + client filter time)
- Suggestion dictionary exceeds 50K entries per language (prefix files exceed 15KB each)
- Tier 5 learned queries update more frequently than daily (real-time freshness needed)

**Frontend debounce:** Adaptive debounce rather than fixed interval:
- **First keystroke after focus:** Fire immediately (0ms). The zero-state → first-results transition is the most important perceived-speed moment.
- **Subsequent keystrokes:** Fire after 100ms of inactivity (tunable, ADR-123). Reduces request volume ~60%.
- **On slow connections** (`navigator.connection.effectiveType === '2g'`): Extend debounce to 200ms to avoid wasting brief connectivity windows on intermediate prefixes.

#### Seeker Experience Walkthrough

The suggestion system extends the librarian metaphor — a guide who, when approached, gently surfaces what the library contains.

**Focus (zero-state).** Seeker clicks the search bar. Before typing, curated entry points appear: theme chips ("Peace", "Courage", "Grief & Loss") and question prompts ("How do I overcome fear?"). Served from `_zero.json` at the CDN edge (< 10ms). Screen reader announces: "Search. What are you seeking? 2 suggestions available."

**Typing (prefix match).** Seeker types "med" and pauses. After the debounce, the browser fetches `/suggestions/en/me.json` from the CDN (< 10ms), filters client-side to entries matching "med", ranks by weight, and renders the dropdown with category labels (theme, chapter, corpus). No database queried, no function invoked, no API call made.

**Bridge moment (the differentiator).** Seeker types "mindful". The client matches against `_bridge.json` and displays: "mindfulness (corpus)" with a bridge hint — "Yogananda's terms: concentration, one-pointed attention, interiorization." The system translates the seeker's vocabulary into the library's vocabulary *before submission*. No other search product does this.

**Curated questions.** Seeker types "How do I". Curated question suggestions appear — editorially written questions the librarian knows the library can answer well. Each is maintained in `/lib/data/curated-queries.json`, reviewed by SRF-aware editors (ADR-078).

**Fuzzy recovery.** Seeker types "meditatoin" (typo). Prefix match finds nothing. The system silently fires an async pg_trgm request. Within 40–80ms, fuzzy results merge into the dropdown — "meditation" appears. No "did you mean?" prompt. Quiet correction.

**Selection and handoff.** Seeker selects "meditation" (click or Enter). Intent classification (ADR-005 E1, a separate system) determines routing — theme page, search results, or Practice Bridge. The suggestion system's job is done: it reduced friction, taught the seeker the library's vocabulary, and delivered them to the right doorway. The URL reflects the seeker's original selection: `/search?q=meditation`. For bridge-expanded queries, the URL preserves the original term, not the expansion.

**Mobile experience.** On viewports < 768px, the suggestion dropdown shows a maximum of 5 suggestions (vs. 7 on desktop) to avoid the virtual keyboard competing with results. Touch targets are 44×44px minimum (ADR-003). Zero-state chips use horizontal scroll rather than wrapping.

### Rationale

- **Invisible latency through progressive infrastructure.** Static JSON at the CDN edge achieves < 10ms globally for the common case. pg_trgm provides fuzzy recovery. Vercel KV is available as a graduation path if scale demands it. Each tier is a complete, working solution.
- **Simplest infrastructure that works.** The suggestion dictionary is small (~6K entries at full corpus). Static files at the edge are simpler, cheaper, faster, and more globally distributed than any server-side solution. Start simple; graduate when evidence demands it.
- **ElastiCache rejected.** VPC networking with Vercel adds latency that erases ElastiCache's speed advantage. Operational overhead (subnets, security groups, monitoring, failover, patching) is disproportionate for a 6K-row dictionary. Single-region by default, expensive at minimum viable configuration. Vercel KV (Upstash Redis) provides the same sorted-set semantics with zero ops and global distribution.
- **pg_trgm remains essential.** Fuzzy matching catches misspellings that prefix matching misses. The `latin_form` column enables transliterated input for Indic languages. The two systems (prefix + fuzzy) are complementary.
- **Adaptive debounce respects global equity.** Fixed debounce penalizes seekers on slow connections. Firing immediately on first keystroke makes the zero-state → first-results transition feel instant. Extending debounce on 2G connections avoids wasting brief connectivity windows.
- **Bridge hints in search results, not just suggestions.** When a bridge-expanded query produces search results, the results page shows: "Showing results for 'concentration' and 'one-pointed attention' (Yogananda's terms for mindfulness)." The bridge hint's pedagogical work continues past the suggestion phase.

### Consequences

- New `suggestion_dictionary` table in DES-004 (Data Model): `suggestion`, `display_text`, `suggestion_type`, `language`, `script`, `latin_form`, `corpus_frequency`, `query_frequency`, `editorial_boost`, `weight`, `entity_id`, `book_id`
- Weight coefficients (`corpus_frequency * 0.3 + query_frequency * 0.5 + editorial_boost * 0.2`) implemented as named constants in `/lib/config.ts` (ADR-123), not as a generated column — allows tuning without migration
- ADR-049 updated with six-tier hierarchy
- Build step in ingestion pipeline: export `suggestion_dictionary` → partitioned static JSON files per language
- Milestone 1a: English static JSON suggestion files + client-side prefix filtering
- Milestone 1b: Spanish static JSON suggestion files (bilingual). `latin_form` populated during Spanish ingestion. Hindi Devanāgarī prefix files added in Milestone 5b.
- Milestone 1c: pg_trgm fuzzy fallback endpoint (`/api/v1/search/suggest`) — queries both `suggestion` and `latin_form` columns for transliteration
- Milestone 2b+: Vercel KV activated if migration trigger thresholds are sustained
- Milestone 5b: Per-language suggestion indices for remaining 7 languages; CJK/Thai tokenization strategies
- No ElastiCache infrastructure — Vercel KV provisioned via Vercel integration when needed
- The suggestion pipeline becomes part of the ingestion pipeline — each new book updates the dictionary and triggers a static JSON rebuild

---

---

## ADR-125: Secrets Management Strategy — Two-Tier Model with AWS Secrets Manager

- **Status:** Accepted
- **Date:** 2026-02-28

### Context

The portal manages ~12 secrets across multiple services (Neon, Voyage, Contentful, Sentry, AWS Bedrock). A secrets management strategy must address:

1. **Audit trail.** Who accessed what secret, when? CloudTrail provides this for AWS-managed secrets. Platform-native stores (GitHub Secrets, Vercel env vars) do not.
2. **Single source of truth.** Each secret should live in exactly one place, distributed to consumers by Platform MCP — not duplicated across platforms.
3. **Rotation without redeployment.** Secrets Manager supports runtime reads with caching — rotation takes effect on the next cache refresh without redeployment. Vercel env vars require a redeployment.
4. **SRF organizational alignment.** SRF's established technology stack (Tech Stack Brief § 7) designates AWS Secrets Manager for sensitive credentials and SSM Parameter Store for non-sensitive config.
5. **10-year design horizon (ADR-004).** The credential count will grow as arcs add services (Cohere, YouTube, SendGrid, New Relic, Amplitude, Auth0). A centralized foundation now avoids retrofitting later.

### Decision

Adopt a **two-tier configuration model** with AWS Secrets Manager as the single source of truth for all application secrets.

#### Tier 1 — Code + Vercel Environment Variables (non-secrets)

Values that are not sensitive. Two sub-categories:

| Sub-tier | Where | Changes via | Examples |
|----------|-------|-------------|----------|
| Named constants | `/lib/config.ts` (ADR-123) | Code PR | Model IDs, chunk sizes, rate limits, cache TTLs |
| Per-environment config | Vercel env vars (set by Platform MCP) | Platform MCP or Vercel dashboard | `AWS_REGION`, `NEON_PROJECT_ID`, `NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_*` build-time vars |

**`NEXT_PUBLIC_*` carve-out:** Variables prefixed `NEXT_PUBLIC_` are injected at build time by the Next.js build runtime. They cannot be sourced from Secrets Manager at runtime — this is a hard Vercel/Next.js constraint, not a design choice. Documented as intentional divergence from the SRF standard, which was written for Lambda (runtime-only).

#### Tier 2 — AWS Secrets Manager (all secrets)

Every credential, API key, token, and connection string lives in Secrets Manager. One secret per logical credential, organized by path convention:

```
/portal/{environment}/{service}/{key-name}
```

Examples:
- `/portal/production/neon/database-url`
- `/portal/production/voyage/api-key`
- `/portal/production/contentful/access-token`
- `/portal/production/sentry/auth-token`

**Access patterns:**

| Context | How secrets are accessed | Auth mechanism |
|---------|------------------------|----------------|
| **Vercel functions (runtime)** | `@aws-sdk/client-secrets-manager` via `/lib/config.ts` facade, cached with 5-minute TTL | Vercel OIDC role (ADR-126) |
| **Lambda functions** | IAM execution role → `GetSecretValue` | IAM role (automatic) |
| **GitHub Actions / Platform MCP** | `aws secretsmanager get-secret-value` via OIDC role, or Platform MCP reads secrets | GitHub OIDC (ADR-016) |
| **Local development** | `.env.local` (fallback — facade checks env vars before Secrets Manager) | AWS profile `srf-dev` |

**The `/lib/config.ts` facade.** Call sites import config from `/lib/config.ts` and never know whether a value came from `process.env`, Secrets Manager, or a hardcoded constant. The facade's resolution order:

1. Environment variable (if set) — enables `.env.local` override for local dev
2. Secrets Manager (if running in AWS-accessible environment) — cached with TTL
3. Default value (for non-required config) or throw (for required secrets)

This makes migrating a value between tiers invisible to all consumers. Adding SSM Parameter Store as a third tier in the future requires only facade changes — zero call-site modifications.

#### SSM Parameter Store — Deferred, Not Rejected

The SRF Tech Stack Brief designates SSM Parameter Store for non-sensitive runtime config. The portal defers SSM adoption because:

- The portal has ~8 non-sensitive config values, all well-served by `/lib/config.ts` + Vercel env vars
- SSM's primary value is for large Lambda fleets with hundreds of config values requiring runtime mutation without redeployment
- The `/lib/config.ts` facade preserves the option to add SSM with zero application code changes when a concrete need arises (feature flags, runtime log-level switching, etc.)

This is an intentional, documented divergence from the SRF standard — not an oversight. The critical SRF alignment point (Secrets Manager for sensitive credentials) is fully honored.

#### AWS Account Model

The portal operates in a **dedicated AWS account within SRF's AWS Organization**. This provides:

- Full blast-radius isolation from other SRF services
- Organizational billing consolidation
- Service Control Policies (SCPs) from the org for guardrails
- Independent IAM policies and OIDC trust relationships
- No credential sharing or cross-account access needed for portal operations

#### Platform MCP Integration

Platform MCP manages secret *resources* (names, policies, KMS encryption, rotation configuration) but not secret *values*:

- Secret resources created with path convention `/portal/{environment}/{service}/{key-name}`
- KMS customer-managed key encrypts all entries
- Secret VALUES populated manually or via bootstrap script — never in configuration files

Platform MCP reads secrets from Secrets Manager and distributes them to Vercel as environment variables:

- Reads secret values via `aws secretsmanager get-secret-value`
- Sets Vercel project environment variables via Vercel API
- Single source of truth, platform-distributed

This means Vercel env vars are *derived from* Secrets Manager via Platform MCP, not independently managed. Single source of truth, platform-distributed.

### Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| **AWS Secrets Manager (chosen)** | SRF standard; CloudTrail audit; rotation automation; single source of truth; Lambda-native | ~$5/month (12 secrets × $0.40); SDK call on cold start (mitigated by caching) |
| **GitHub Secrets + Vercel env vars only** | Zero additional cost; simpler setup; native to each platform | No audit trail; manual multi-platform rotation; credential duplication; no rotation-without-redeployment; SRF non-conformant |
| **HashiCorp Vault** | Most powerful; multi-cloud; dynamic secrets | Operational overhead (self-hosted or Cloud); not in SRF stack; overkill for portal scale |
| **SSM Parameter Store (SecureString)** | Free; AWS-native | No built-in rotation; limited audit granularity; SRF standard reserves it for non-sensitive config |

### Consequences

- All `[secret]`-tagged env vars in `.env.example` have a corresponding Secrets Manager resource managed by Platform MCP
- DES-039 § Environment Configuration updated with secrets management architecture and `/lib/config.ts` facade specification
- `docs/guides/bootstrap-credentials.md` updated: secrets created in Secrets Manager during bootstrap, distributed to Vercel by Platform MCP
- `.env.example` uses `[secrets-manager]` tag: Secrets Manager in deployed environments; env var in `.env.local` for local dev
- Rotation is single-point: update Secrets Manager, run platform redistribution, done. No multi-platform coordination.
- CloudTrail logs all `GetSecretValue` calls — audit trail for secret access from Milestone 1c
- KMS customer-managed key encrypts all portal secrets (cost: ~$1/month per key)
- **Extends:** ADR-016 (Platform MCP), ADR-020 (environment lifecycle), ADR-124 (Neon keys)
- **Enables:** ADR-126 (Vercel OIDC — secrets accessed via role, not stored keys)

---

## ADR-126: Vercel OIDC Federation — Zero Long-Lived AWS Credentials

- **Status:** Accepted
- **Date:** 2026-02-28

### Context

The portal authenticates to AWS from two contexts:

1. **GitHub Actions → AWS:** OIDC federation (ADR-016). Ephemeral tokens scoped by repo and branch. No stored credentials.
2. **Vercel functions → AWS Bedrock + Secrets Manager (ADR-125):** Needs an authentication mechanism.

The standard approach for Vercel → AWS is an IAM user with static access keys stored as Vercel env vars. But Vercel OIDC federation is GA and available on all plans:

- Uses `AssumeRoleWithWebIdentity` — the same mechanism as GitHub Actions OIDC
- Supports **team issuer mode** with environment-scoped `sub` claims (production, preview, development)
- SDK helper: `@vercel/functions/oidc` provides `awsCredentialsProvider` with automatic STS exchange and credential refresh

Using OIDC for both CI and runtime achieves **zero long-lived AWS credentials anywhere**.

### Decision

Adopt **Vercel OIDC federation** as the exclusive runtime AWS authentication mechanism. No IAM user access keys.

#### Architecture

```
Vercel Function
  → getVercelOidcToken()                    # Short-lived JWT from Vercel IdP
  → AWS STS AssumeRoleWithWebIdentity       # Exchange JWT for temporary credentials
  → Temporary IAM credentials (auto-refreshed, ~1hr TTL)
  → Bedrock / Secrets Manager calls
```

#### AWS Configuration

**1. Register Vercel as an OIDC Identity Provider:**

| Parameter | Value |
|-----------|-------|
| Provider URL | `https://oidc.vercel.com/{TEAM_SLUG}` (team issuer mode) |
| Audience | `https://vercel.com/{TEAM_SLUG}` |

**2. Create IAM role `portal-vercel-runtime`:**

Trust policy scopes by team, project, and environment:

```json
{
  "Effect": "Allow",
  "Principal": {
    "Federated": "arn:aws:iam::{ACCOUNT_ID}:oidc-provider/oidc.vercel.com/{TEAM_SLUG}"
  },
  "Action": "sts:AssumeRoleWithWebIdentity",
  "Condition": {
    "StringEquals": {
      "oidc.vercel.com/{TEAM_SLUG}:aud": "https://vercel.com/{TEAM_SLUG}"
    },
    "StringLike": {
      "oidc.vercel.com/{TEAM_SLUG}:sub": "owner:{TEAM_SLUG}:project:{PROJECT_NAME}:environment:*"
    }
  }
}
```

**3. Attach permissions:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream",
        "bedrock:Converse",
        "bedrock:ConverseStream"
      ],
      "Resource": "arn:aws:bedrock:us-west-2:*:inference-profile/*"
    },
    {
      "Effect": "Allow",
      "Action": "secretsmanager:GetSecretValue",
      "Resource": "arn:aws:secretsmanager:us-west-2:{ACCOUNT_ID}:secret:/portal/*"
    }
  ]
}
```

#### Application Code

```typescript
import { awsCredentialsProvider } from '@vercel/functions/oidc';

const credentials = awsCredentialsProvider({
  roleArn: process.env.AWS_ROLE_ARN,  // Not a secret — just a resource identifier
});

// Bedrock client
const bedrock = new BedrockRuntimeClient({ region: 'us-west-2', credentials });

// Secrets Manager client
const secrets = new SecretsManagerClient({ region: 'us-west-2', credentials });
```

The `awsCredentialsProvider` handles STS exchange and credential refresh transparently. It falls back to the standard AWS credential chain when no OIDC token is present (local dev, CI).

#### Environment Variables

| Variable | Purpose | Secret? |
|----------|---------|---------|
| `AWS_ROLE_ARN` | IAM role ARN for OIDC assumption | No — resource identifier, set by Platform MCP |
| `AWS_REGION` | Bedrock and Secrets Manager region | No — static `us-west-2` |

No `AWS_ACCESS_KEY_ID` or `AWS_SECRET_ACCESS_KEY` in any deployed environment. Dependency: `@vercel/functions` (for OIDC helper).

#### Environment-Scoped Security

The OIDC `sub` claim includes the Vercel environment: `owner:{TEAM}:project:{PROJECT}:environment:{ENV}`. This enables environment-scoped IAM roles:

| Environment | Role | Secrets Access |
|-------------|------|---------------|
| Production | `portal-vercel-runtime-prod` | `/portal/production/*` only |
| Preview | `portal-vercel-runtime-preview` | `/portal/preview/*` only |
| Development | `portal-vercel-runtime-dev` | `/portal/development/*` only |

A preview deployment cannot assume the production role — environment isolation enforced at the IAM level.

#### Local Development

OIDC tokens only exist inside Vercel's runtime. For local development:

- The `awsCredentialsProvider` falls back to the standard AWS credential chain
- Developers use `~/.aws/credentials` with an `srf-dev` profile, or `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY` in `.env.local`
- This is the same pattern Lambda-based services use when running locally
- The `/lib/config.ts` facade's env-var-first resolution order means `.env.local` secrets override Secrets Manager lookups, so local dev works without AWS Secrets Manager access

### Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| **Vercel OIDC (chosen)** | Zero stored credentials; environment-scoped; auto-refresh; no rotation needed; GA on all plans | Requires OIDC provider setup; local dev uses different auth path |
| **IAM user with static access keys** | Simple setup; works everywhere identically | Long-lived credentials; quarterly rotation; environment-agnostic (same keys work in any env); credential in state files |

### Consequences

- `bootstrap.sh` creates the Vercel OIDC identity provider alongside existing GitHub OIDC provider (ADR-016)
- `bootstrap.sh` creates `portal-vercel-runtime` IAM role(s) with Bedrock + Secrets Manager permissions, scoped per environment
- `AWS_ROLE_ARN` set as Vercel env var by Platform MCP (non-secret)
- `@vercel/functions` added as project dependency
- **Zero long-lived AWS credentials in any environment** — GitHub OIDC (CI) + Vercel OIDC (runtime)
- **Extends:** ADR-016 (OIDC pattern), ADR-125 (Secrets Manager access via role)

---

## ADR-121: DELTA-Relaxed Authenticated Experience

- **Status:** Accepted
- **Date:** 2026-02-23

### Context

DELTA (Dignity, Embodiment, Love, Transcendence, Agency) governs the portal's relationship with seekers (ADR-095). The default experience is anonymous: no user identification, no session tracking, no behavioral profiling. This is correct and foundational.

However, certain features genuinely require persistent user state: synced bookmarks across devices, reading progress that persists across sessions, personal passage collections, and persistent language preferences. Local storage provides some of this, but it is device-bound and fragile.

ADR-085 (Lessons Integration Readiness) already contemplates authenticated users for future Lessons content. ADR-066 (Lotus Bookmark) uses local storage for bookmarks. The question is: when a user *chooses* to create an account, what changes in the portal's behavior, and what doesn't?

### Decision

The portal offers two experience tiers:

**Anonymous (default, full DELTA compliance):**
- Core search, read, and browse: full access, no account required
- Bookmarks and reading position: local storage only (device-bound)
- Language preference: browser setting or session selection
- No user identification, no session tracking, no behavioral profiling
- All content freely available — no "sign up to access" gates

**Authenticated (opted-in, expanded features):**
- Everything anonymous users have, plus:
- **Bookmarks sync:** Saved passages accessible from any device
- **Reading progress:** Persistent position across sessions and devices
- **Personal collections:** Curated passage groups with private notes
- **Language preference:** Persistent across devices
- **Practice background** (optional): Tradition background and practice level, user-provided, used only for `/guide` pathway recommendations
- Auth provider: Auth0 (consistent with SRF's established stack)

**DELTA commitments that do NOT change for authenticated users:**

| Principle | Authenticated Behavior |
|-----------|----------------------|
| **Dignity** | No behavioral profiling. Account data is what the user explicitly provides — never inferred. |
| **Embodiment** | No engagement metrics. No "you've read 47 passages this week" dashboards. No retention nudges. |
| **Love** | Same compassionate, calm interface. No upsells, no "premium" tiers. |
| **Transcendence** | No gamification. No streaks, badges, or reading leaderboards. |
| **Agency** | Account deletion always available. All data exportable. User controls what's stored. |

**What authenticated users do NOT get:**
- No profile embedding or soft personalization (no algorithmic content recommendation based on reading patterns)
- No "suggested for you" based on behavioral analysis
- No reading history analytics visible to staff (aggregate, anonymized usage signals per ADR-052 apply equally to all users)
- No authenticated-only content (until Milestone 7a+ Lessons integration per ADR-085)

### Rationale

- **Persistent state genuinely serves seekers.** A practitioner studying Yogananda's works across months wants their bookmarks and reading position to follow them. This is a legitimate need, not an engagement tactic.
- **DELTA governs the relationship, not the mechanism.** An account is a container for the user's own data. DELTA prohibits using that data against the user's spiritual interests. The same principles apply — the implementation changes, the ethics don't.
- **Opt-in is the critical distinction.** The anonymous experience is complete. Nothing is withheld. The account adds convenience features, not content access. A user who never creates an account misses nothing of the teaching.
- **Aligns with SRF's established auth infrastructure.** Auth0 is already in SRF's technology stack. No new vendor required.

### Consequences

- New `user_profiles` table in DES-004: `id`, `auth0_id`, `preferred_language`, `tradition_background` (optional), `practice_level` (optional), `created_at`
- No `profile_embedding` column — soft personalization explicitly rejected
- New `user_bookmarks`, `user_collections`, `user_reading_progress` tables
- Auth0 integration added to DESIGN.md security section (DES-024)
- CONTEXT.md DELTA framework section updated with authenticated-tier documentation
- ADR-066 (Lotus Bookmark) extended: local storage for anonymous users, server-synced for authenticated users
- Milestone 7a+ Lessons integration (ADR-085) builds on this authentication layer

---

## ADR-127: Experience Quality Standard — Honoring the Spirit of the Teachings

**Status:** Accepted (Foundational)

**Context:** The portal's architectural principles effectively constrain bad decisions — no AI synthesis, no gamification, no content gating, no feature gating behind connectivity. But constraints alone do not produce excellence. Brother Chidananda described the portal as "world-class." A quality aspiration was implicit across several principles (Calm Technology's "entering a library, not a marketplace," Global-First's "full claim on the beauty and depth," Accessibility's "warmth" requirement) but had no explicit governance home. Without it, "it works" could be mistaken for "it's done."

**Decision:** Adopt PRI-03: Honoring the Spirit of the Teachings. Every interaction should amaze — and honor the spirit of the teachings it presents. The portal's execution quality should match the spiritual depth of the content it holds. Before shipping any component, ask: "Is this worthy of presenting Yogananda's words to a seeker who needs them?"

**Consequences:**
- Creates an aspiration gate alongside existing constraint gates — components must be both correct (per PRI-01, PRI-02, PRI-04–11) and excellent (per PRI-03)
- Applies to all implementation arcs from the first component
- Aligns with Calm Technology: restraint as a form of excellence, not a limitation
- Provides the AI architect/implementer with a self-referential evaluation standard: measure the portal's quality against the content's own character (warm, calm, profound, inviting)
- Does not conflict with Global-First performance budgets — a slow portal is not worthy of the teachings either

**Governs:** PRI-03 in PRINCIPLES.md

---

## ADR-128: Reachable Population — Quantitative Prioritization Framework

- **Status:** Accepted (Foundational)
- **Date:** 2026-02-28

### Context

The portal's roadmap originally ordered milestones by feature sophistication — build the experience for English users first, then expand to other languages. This optimized for depth of experience before breadth of reach. But PRI-05 (Global-First) commits to serving "all humans of Earth equally," and the portal's philanthropic mission is to make Yogananda's teachings "available freely throughout the world."

When two independent milestones compete for priority, the project lacked a quantitative framework for choosing between them. Decisions defaulted to Western software convention: polish before reach, features before languages. This resulted in non-English languages (serving ~2.6 billion reachable people) being scheduled after reader polish and study tools (serving existing English users).

A data-driven analysis of global language demographics (see [docs/reference/Prioritizing Global Language Rollout.md](docs/reference/Prioritizing%20Global%20Language%20Rollout.md) — 53 cited sources from Ethnologue, ITU, UNESCO, DataReportal, GSMA) revealed that the depth-first ordering contradicted the mission. Hindi and Spanish each individually serve reachable populations comparable to English L1 speakers.

### Decision

Adopt **reachable population** as the default prioritization metric for all scope decisions. When two milestones or features are architecturally independent, the one serving more reachable people ships first.

**Metric definition:**

```
Reachable Population = speakers × internet_penetration × content_availability
```

- **speakers:** Total speakers (L1 + L2) from Ethnologue 2025 data
- **internet_penetration:** Regional internet penetration from ITU Global Connectivity Report 2025 and DataReportal Digital 2026
- **content_availability:** Binary for now (1 = digital text exists for at least one book, 0 = no digital text). Becomes fractional when per-language book availability is cataloged.

**Language priority table:**

| Priority | Language | Speakers | Internet % | Reachable | Mission Alignment |
|----------|----------|----------|------------|-----------|-------------------|
| — | English (baseline) | 1,528M | ~95% (L1 regions) | ~390M L1 | Default. All content originates in English. |
| 1 | **Hindi** | 609M | ~70% | **~425M** | Yogananda's country. YSS homeland. Largest non-English audience. |
| 2 | **Spanish** | 558M | ~77% | **~430M** | Highest L1 ratio (86.7%). Strong SRF Latin America presence. |
| 3 | **Portuguese** | 267M | ~85% | **~225M** | Brazil digital leader. High L1 ratio (93.6%). |
| 4 | **Bengali** | 284M | ~45% | **~130M** | Yogananda's mother tongue. Deep YSS catalog. |
| 5 | **German** | 130M | ~95% | **~123M** | SRF Deutschland. Near-universal internet. |
| 6 | **Japanese** | 125M | ~95% | **~119M** | Established SRF Japan presence. |
| 7 | **French** | 312M | ~37%* | **~116M** | *Francophone Africa drags average down. France + Canada well-connected. |
| 8 | **Italian** | 68M | ~90% | **~61M** | Official translations exist. |
| 9 | **Thai** | 61M | ~80% | **~49M** | SRF/YSS Thailand. Script diversity forcing function. |

*Sources: Ethnologue 2025 (speaker counts), ITU Global Connectivity Report 2025 (internet penetration), DataReportal Digital 2026 (regional breakdowns). Full analysis with 53 citations in docs/reference/Prioritizing Global Language Rollout.md.*

Hindi and Spanish together serve **~855M reachable people** — more than double English L1. This makes them Tier 1 priorities. Spanish is activated alongside English from Arc 1. Hindi is deferred from Arc 1 — the authorized YSS ebook is only purchasable from India/Nepal/Sri Lanka (Razorpay); the Amazon Kindle edition is third-party (Fingerprint! Publishing). Hindi activates in Milestone 5b when an authorized source becomes available.

### Application Protocol

When a future scope decision arises:

1. **Identify the populations affected** by each option.
2. **Calculate reachable population** for each using the metric above.
3. **The higher-reach option is the default** unless:
   - An architectural dependency prevents it (can't ship languages before i18n infrastructure)
   - A Content Identity principle (1–4) would be violated (never compromise verbatim fidelity for reach)
   - A security or accessibility requirement is at stake (these are not optional regardless of reach)
4. **If reach is comparable** (within 20%), other factors (mission alignment, implementation effort, dependencies) break the tie.

### Worked Examples

| Decision | Option A | Option B | Resolution |
|----------|----------|----------|------------|
| Reader polish vs. Hindi Autobiography | Dwell mode serves existing English readers (~390M) | Hindi Autobiography serves ~425M new people | **Hindi ships first** — higher reach, architecturally independent. *(Note: Hindi deferred from Arc 1 due to source availability; this example illustrates the metric, not the current schedule.)* |
| PDF export vs. Portuguese activation | PDF serves engaged users across active languages | Portuguese activates ~225M new people | **Portuguese ships first** — reach delta is large |
| Dark mode vs. Italian activation | Dark mode serves all existing users across all active languages | Italian activates ~61M new people | **Depends on active user base** — if users across active languages significantly exceed 61M, dark mode has higher reach |
| Cross-book search vs. more languages | Cross-book search improves experience for ~820M (en+es users) | Next language tier adds ~780M (hi+pt+bn) | **Depends on Hindi availability** — if Hindi source acquired, languages first; otherwise cross-book search first |

### Consequences

- **Roadmap reordered:** Languages (formerly Milestone 5b) move before reader refinement (formerly Milestone 2b) and before study tools (formerly Arc 4). Spanish Autobiography ingestion moves into Arc 1. Hindi deferred from Arc 1 (authorized source unavailable outside India) — activates in Milestone 5b.
- **ADR-077 revised:** Language priority ordering replaces "no wave ordering." Languages ship as they clear a readiness gate (content + UI strings + human reviewer), ordered by reachable population.
- **Breadth-first, not depth-first:** The portal reaches 3 billion people with a good experience before reaching 390 million with a perfect experience.
- **Decision audit trail:** Future scope decisions reference this ADR with the specific reach calculation.
- **Data refresh:** At each arc boundary, verify speaker counts and internet penetration against the latest ITU and DataReportal reports. Update the priority table if any language's reachable population shifts by >10%.

### Limits

This metric does **not** override:
- **Architectural dependencies.** Can't ship languages before the i18n infrastructure exists. Can't ship cross-book search before multiple books are ingested.
- **Content Identity principles.** Never machine-translate sacred text for reach. Never compromise attribution for speed.
- **Accessibility and security.** These are not negotiable regardless of population.
- **Organizational readiness.** Human reviewers for UI translations (ADR-078) must be available. The metric determines *priority*, not *readiness*.

### Audio Equity Note

UNESCO 2024 data reports 739 million adults globally lack basic literacy, with 347 million in Central and Southern Asia — the YSS heartland. For these populations, text-only content provides **no access**, not limited access. YSS currently offers Hindi, Bengali, and other Indic-language *Autobiography of a Yogi* audiobooks.

This ADR recommends that when a language is activated, existing audio content ships alongside text where available — not deferred to a separate media arc. Audio is an **access modality**, not an enhancement. The availability of existing SRF/YSS audio recordings for each language is a stakeholder question that should be raised at language activation time. For Hindi specifically: if YSS has digital audio files of the Hindi *Autobiography*, basic audio delivery (streaming, chapter-level navigation) should activate with Hindi text — the technical cost is trivial compared to the access equity gained for 347M adults in Central/Southern Asia who lack basic literacy.

### Evaluation Candidates

ADR-077 lists Chinese, Korean, Russian, and Arabic as evaluation candidates beyond the core 10. Applying this framework:

| Language | Speakers | Internet % | Reachable | Barrier |
|----------|----------|------------|-----------|---------|
| Mandarin Chinese | 1,184M | ~78% | ~924M* | *Great Firewall: ICP license + China CDN required. Foreign services blocked/throttled. Freedom House 9/100. Translation availability unconfirmed. |
| Arabic (Standard) | 335M | ~70% (weighted) | ~235M | Zero L1 speakers (Modern Standard). Internet varies: Saudi 99%, Egypt 82%. Complex script. Translation availability unconfirmed. |
| Russian | 253M | ~92% | ~200M | Content restrictions: Freedom House 17/100. Translation availability unconfirmed. |
| Indonesian | 252M | ~75% | ~188M | Not in current evaluation list. Notable omission. Translation availability unconfirmed. |
| Korean | ~80M | ~97% | ~78M | South Korea only. Translation availability unconfirmed. |

*Internet penetration from DataReportal Digital 2025 country reports (January 2025 data). See [language-demographics-sources.md](docs/reference/language-demographics-sources.md) for per-number source traceability.*

Mandarin and Russian warrant investigation when the core 10 languages are stable. Indonesian is a notable omission from the evaluation list — 252M speakers with 75% internet penetration, higher reachable population than Bengali (Tier 2). Arabic reachable (~235M) is larger than Portuguese (Tier 2) — worth investigating if Yogananda translations exist in Arabic.

### YSS-Contributed Languages

Tamil (~85M speakers, ~60% internet, ~51M reachable), Telugu (~96M speakers, ~60% internet, ~58M reachable), and Kannada (~64M speakers, ~60% internet, ~38M reachable) may enter the platform through YSS content partnership (PRO-043), outside SRF's 10-language scope. YSS-published editions carry full lineage authority — Yogananda founded YSS in 1917. By this framework, all three are Tier 2 equivalent (~38M–58M reachable each, comparable to Thai at ~49M or Italian at ~61M). Together they serve ~147M reachable people — more than Portuguese (Tier 2, ~145M reachable).

These languages do not expand SRF's commitment. Each organization determines which languages it surfaces. The platform supports any language where either organization provides authorized content and the language readiness gate (ADR-077) is cleared. See PRO-043.

**Hindi source authorization.** The Hindi deferral (Milestone 5b) was due to ebook purchasing logistics, not content unavailability. YSS has the authorized Hindi *Autobiography*. YSS authorization of the Hindi text for the shared corpus could resolve the source barrier, potentially activating Hindi (~425M reachable) earlier than Milestone 5b. **Conversation sequencing matters:** deliver value first (English search widget for yssofindia.org), ask for content second. See PRO-043 § YSS Value Proposition.

### Consolidated Language Reference

Single sorted table for AI-assisted and human feature ordering. All languages — core, evaluation, and YSS-contributed — in one place, ranked by reachable population.

**Validation methodology:** Numbers below are drawn from two source categories. **Category A** (core 9 + English): sourced from `docs/reference/Prioritizing Global Language Rollout.md` (53 citations from Ethnologue 2025, ITU 2025, DataReportal 2026, GSMA, World Bank, UNESCO). **Category B** (evaluation candidates): freshly surveyed from DataReportal Digital 2025 country reports (January 2025 data). **Before making prioritization decisions**, verify Category B numbers against the current DataReportal reports at `datareportal.com/reports/digital-2026-{country}`. Category A numbers should be refreshed at each arc boundary per ADR-128 § Consequences.

| # | Language | Speakers (L1+L2) | Internet % | Reachable | Tier | Source Status | Activation | Access Barriers | Source |
|---|----------|-----------------|------------|-----------|------|---------------|------------|-----------------|--------|
| — | **English** | 1,528M | ~95% (L1 regions) | ~390M L1 (baseline) | Baseline | Available | M1a | — | A: Ethnologue 2025 |
| \* | **Mandarin Chinese** | 1,184M | ~78% | ~924M\* | Evaluation | Unconfirmed | Unscheduled | \*Great Firewall: ICP license + China CDN required. Foreign services blocked/throttled. Freedom House 9/100. | B: DataReportal 2025 China |
| 1 | **Spanish** | 558M | ~77% | ~430M | Tier 1 | SRF edition available | M1b | — | A |
| 2 | **Hindi** | 609M | ~70% | ~425M | Tier 1 (deferred) | YSS authorization pending | M5b (conditional: M1b) | Romanized input pipeline needed. Authorized source requires YSS conversation. | A |
| \* | **Arabic (MSA)** | 335M | ~70% (weighted) | ~235M | Evaluation | Unconfirmed | Unscheduled | Zero L1 speakers (all use dialect). Internet % varies: Saudi 99%, Egypt 82%. Complex script. | B: DataReportal 2025 Saudi Arabia, Egypt |
| 3 | **Portuguese** | 267M | ~85% | ~225M | Tier 2 | TBD | M5a | — | A |
| \* | **Russian** | 253M | ~92% | ~200M | Evaluation | Unconfirmed | Unscheduled | Content restrictions: Freedom House 17/100. Increasing censorship of foreign services. | B: DataReportal 2025 Russia |
| \* | **Indonesian** | 252M | ~75% | ~188M | Evaluation | Unconfirmed | Unscheduled | Notable omission from core list. | B: DataReportal 2025 Indonesia |
| 4 | **Bengali** | 284M | ~45% | ~130M | Tier 2 | TBD | M5a | Low internet penetration (Bangladesh ~45%, West Bengal similar). | A |
| 5 | **German** | 130M | ~95% | ~123M | Tier 2 | TBD | M5a | — | A |
| 6 | **Japanese** | 125M | ~95% | ~119M | Tier 3 | TBD | M5c | — | A |
| 7 | **French** | 312M | ~37%\*\* | ~116M | Tier 3 | TBD | M5c | \*\*Francophone Africa drags average (~25%). France + Canada >90%. | A |
| \* | **Korean** | ~80M | ~97% | ~78M | Evaluation | Unconfirmed | Unscheduled | South Korea only (North Korea isolated). | B: DataReportal 2025 South Korea |
| 8 | **Italian** | 68M | ~90% | ~61M | Tier 3 | TBD | M5c | — | A |
| † | **Telugu** | ~96M | ~60% | ~58M | Tier 2-eq | YSS (PRO-043) | YSS-contributed | — | A (estimate) |
| † | **Tamil** | ~85M | ~60% | ~51M | Tier 2-eq | YSS (PRO-043) | YSS-contributed | — | A (estimate) |
| 9 | **Thai** | 61M | ~80% | ~49M | Tier 3 | TBD | M5c | Script: no word boundaries, tone marks. | A |
| † | **Kannada** | ~64M | ~60% | ~38M | Tier 2–3-eq | YSS (PRO-043) | YSS-contributed | — | A (estimate) |

**Legend:** Numbered = Core 10 (SRF commitment). \* = Evaluation candidate (not committed). † = YSS-contributed (outside SRF scope, PRO-043). Source A = reference doc (53 citations). Source B = DataReportal 2025 (January 2025 data, freshly surveyed).

**Key observations for feature ordering:**
- Chinese has the largest reachable population but the most severe access barrier (Great Firewall). Effective reach for a Vercel-hosted service is near zero without China-specific infrastructure.
- Hindi and Spanish are near-tied (~425M vs ~430M). Hindi requires YSS authorization; Spanish source is available. Spanish ships first per ADR-128 application protocol.
- Arabic and Russian are evaluation candidates with ~200M+ reachable each — larger than any Tier 2 or 3 committed language. Worth investigating if translations exist.
- Indonesian (~188M reachable) is a notable omission from the evaluation list. Higher reachable population than Bengali (Tier 2).
- YSS-contributed languages together (~147M) exceed Thai + Italian combined (~110M).

**DataReportal verification URLs** (January 2025 data):
- China: `datareportal.com/reports/digital-2025-china` (1.11B users, 78.0%)
- Indonesia: `datareportal.com/reports/digital-2025-indonesia` (212M users, 74.6%)
- Russia: `datareportal.com/reports/digital-2025-russian-federation` (133M users, 92.2%)
- South Korea: `datareportal.com/reports/digital-2025-south-korea` (50.4M users, 97.4%)
- Saudi Arabia: `datareportal.com/reports/digital-2025-saudi-arabia` (33.9M users, 99.0%)
- Egypt: `datareportal.com/reports/digital-2025-egypt` (96.3M users, 81.9%)

**Last verified:** 2026-03-01. Refresh at arc boundaries. Full source traceability: [docs/reference/language-demographics-sources.md](docs/reference/language-demographics-sources.md).

**Extends:** PRI-05 (Global-First), ADR-077 (Core Language Set), ADR-030 (Book Ingestion Priority)
**Governs:** ROADMAP.md arc and milestone ordering. All future scope prioritization decisions.

*Full demographic analysis: docs/reference/Prioritizing Global Language Rollout.md (53 citations: Ethnologue, ITU, UNESCO, DataReportal, GSMA, World Bank). Per-number source traceability and human validation checklist: [docs/reference/language-demographics-sources.md](docs/reference/language-demographics-sources.md).*

---

## ADR-129: Vocabulary Bridge — Semantic Infrastructure for State-Aware Retrieval

**Status:** Accepted

**Date:** 2026-03-01

### Context

The original terminology bridge (ADR-005 E2) mapped modern vocabulary to Yogananda's terms via a flat JSON file (`spiritual-terms.json`). This handled one dimension: vocabulary distance ("anxiety" → "fear," "restlessness of mind"). But seekers arrive with emotional states, not vocabulary — "I can't stop crying" is not a vocabulary lookup, it's a state of being that needs to be mapped to corpus territory with register awareness, retrieval intent, and careful avoidance of passages that would miss the seeker.

The vocabulary gap has five dimensions, not one:
1. **State → corpus territory.** A human state of being mapped to primary/secondary/avoid regions of the corpus.
2. **Modern → Yogananda vocabulary.** The original bridge's domain (ADR-005 E2).
3. **Register awareness.** "Death" asked philosophically needs different passages than "death" asked in grief.
4. **Cross-tradition vocabulary.** Seekers from other traditions use their tradition's terms.
5. **Language-specific states.** Hindi expressions of grief are not translations of English expressions — they are culturally distinct.

A flat synonym map cannot represent this. The portal needs structured semantic infrastructure.

### Decision

Replace the flat `spiritual-terms.json` terminology bridge with a **five-layer Vocabulary Bridge** — a structured PostgreSQL-backed semantic model that maps human states of being to corpus territory with register awareness, retrieval intent routing, and language-specific cultural grounding.

The Bridge operates at two points:
- **Index time:** Enrichment vocabulary and corpus territory tags are written into chunk index entries during the enrichment pipeline (ADR-115). Zero query-time cost.
- **Query time:** Bridge lookup expands queries, routes retrieval intent, and boosts seed passages. The bridge is loaded into application memory at startup (~2,000 rows at full scale). Query-time overhead: 3-8ms (microsecond hash lookups + string concatenation).

The Bridge is **Opus-generated** (ADR-014) — Claude reads the full corpus and generates bridge entries grounded in what Yogananda actually wrote. Every entry cites source passages for traceability. No human editorial gate initially; the zero-result feedback loop and search quality evaluation (DES-058) provide the improvement signal. Human review activates at crisis-adjacent entries only.

### The Five Layers

**Layer 1: State Mappings** (Milestone 1a) — The atomic unit. A human state of being mapped to corpus territory with retrieval intent.

**Layer 2: Vocabulary Expansions** (Milestone 1a) — Modern/secular terms mapped to Yogananda's actual vocabulary. Replaces the original flat `spiritual-terms.json` design (ADR-005 E2).

**Layer 3: Register Bridges** (Milestone 1c) — The same concept at different emotional registers requires different passages and different retrieval intents. "Death" asked philosophically → cosmic consciousness. "Death" asked in grief → divine love, reunion, immortality. "Death" asked in crisis → soul's indestructibility + crisis resources.

**Layer 4: Cross-Tradition Vocabulary** (Milestone 3b+) — Maps terms from other spiritual traditions to Yogananda's frame without erasing the difference. Requires multi-book corpus for meaningful tradition coverage.

**Layer 5: Language-Specific State Mappings** (Milestone 1b for Spanish) — Not translated English mappings. Each language receives a **separate bridge artifact** authored fresh by Opus reading the corpus in that language's translation. Cultural context included: "In Indian context, this expression often follows family rupture or public shame." See Per-Language Bridge Artifacts below.

### Data Model

Full schema specification in DES-059. Key tables: `vocabulary_bridge` (bridge entries with layers, territories, retrieval intents), `bridge_seed_passages` (human/Opus-curated anchor passages per state), `bridge_gaps` (zero-result feedback loop).

### Generation Pipeline

```
1. Opus reads the full corpus (all extracted books)
2. For each language: derives vocabulary expansions from actual Yogananda terms
3. For each human state category: finds which corpus regions address it
4. Every entry includes: source_passages[], confidence, derivation_note
5. Bridge goes live — loaded in memory at startup
6. Zero-result log + DES-058 evaluation provides feedback signal
7. Human review at crisis-adjacent entries; empirical improvement elsewhere
```

### Retrieval Intent

Bridge entries carry a `retrieval_intent` that shapes how results are presented:
- `meet_first` — passage should acknowledge the seeker's state before pointing elsewhere
- `console` — passage should offer comfort, not instruction
- `orient` — passage should help the seeker understand their situation
- `invite` — passage should open a door without pushing through it

### Per-Book Evolution Lifecycle

Each book ingestion triggers vocabulary extraction. When a new book's chunks are processed, Opus scans the full chunk set and extracts vocabulary across three categories:

1. **Modern-to-Yogananda mappings.** Modern, clinical, or cross-tradition terms seekers might use, mapped to Yogananda's specific vocabulary (e.g., "mindfulness" → "concentration").
2. **Sanskrit inline definitions** (ADR-080). Passages where Yogananda provides his own definition of a Sanskrit term — "Samadhi, the superconscious state of union with God." Flagged as glossary source candidates (ADR-038) and added as Sanskrit-to-English Layer 2 entries.
3. **Cross-tradition and Indic variant terms** (ADR-080). Pali, Bengali, and Hindi terms Yogananda uses or that seekers from other traditions might search (e.g., Pali "nibbāna" → "final liberation"; Vedantic "viveka" → "discrimination, spiritual discernment"). Also captures alternate romanizations across editions.

Lifecycle: Extract (Opus scans new book chunks) → Diff (compare against existing bridge entries) → Review (human review at crisis-adjacent entries only; empirical improvement elsewhere) → Merge (approved entries written to `vocabulary_bridge` table with source provenance).

### Per-Author Vocabulary (PRO-014)

When non-Yogananda SRF-published authors enter the corpus (Milestone 3a+), the bridge needs per-author vocabulary awareness. Sri Yukteswar's vocabulary differs from Yogananda's:

| Concept | Yogananda's Term | Sri Yukteswar's Term |
|---|---|---|
| Cosmic cycles | "yugas" (narrative context) | "yugas" (astronomical calculation, specific durations) |
| Divine creation | "cosmic vibration," "Aum" | "the Word," "Pranava" |
| Liberation | "Self-realization," "God-union" | "kaivalya," "mukti" |
| Subtle body | "astral body," "astral world" | "fine material body," "Bhuvarloka" |

A seeker searching "what are the cosmic cycles" should find both Yogananda's accessible narrative and Sri Yukteswar's precise astronomical treatment, with the search understanding that both authors address the same concept in different registers.

### Per-Language Bridge Artifacts

Each language's Vocabulary Bridge is a **separate artifact**, not a translation of the English bridge. A language's spiritual vocabulary carries culturally distinct weight — Hindi *dhyan* (ध्यान) maps differently than English "meditation"; Spanish "noche oscura del alma" carries its own literary tradition (San Juan de la Cruz) independent of "dark night of the soul."

**Per-language bridge generation:**

| Language | Distinct Requirements |
|----------|----------------------|
| English | Baseline bridge. Modern secular → Yogananda vocabulary. American English emotional registers. |
| Spanish | Latin American vs. Peninsular registers. Catholic mystical vocabulary (San Juan de la Cruz, Santa Teresa). "Meditación" is straightforward; crisis/grief states carry distinct cultural framing. |
| Hindi | **Primary, not derivative.** Many Yogananda terms *originated* in Hindi/Sanskrit. The bridge maps colloquial Hindi states to Yogananda's formal vocabulary — the reverse direction from English. Requires YSS editorial review for cultural fidelity. (PRO-043) |
| Bengali | Yogananda's mother tongue. Some terms are Bengali originals translated *into* English in the published works. Bridge recovers the original register. |
| Portuguese | Brazilian Portuguese emotional vocabulary. Brazilian spiritual syncretism (Spiritism, Umbanda) introduces cross-tradition terms not present in European Portuguese. |
| Other Indic | Tamil, Telugu, Kannada bridges (if YSS-contributed, PRO-043) require native-speaker generation, not translation from Hindi. Each Dravidian language carries its own bhakti literary tradition. |

**Script-specific normalization.** Indic language bridges must handle Romanized input — Hindi seekers commonly type "yogananda dhyan" not "योगानन्द ध्यान". The bridge's query-time lookup must accept both Romanized and native script input. Implementation: fastText detects script mismatch → `indic-transliteration` converts Romanized input to native script → bridge lookup proceeds in native script. This adds ~2ms to Indic-language queries.

**Generation lifecycle per language:**
1. Opus reads the corpus in that language's translation
2. Derives state mappings grounded in what Yogananda *actually wrote* in that translation
3. Maps culturally distinct emotional expressions (not English translations) to corpus territory
4. Native-speaker editorial review before activation (required for Indic languages per PRO-043; recommended for all)
5. Bridge enters the same feedback loop as English: zero-result patterns, DES-058 evaluation, empirical improvement

**Bridge activation gate.** A language's Vocabulary Bridge must pass the same quality evaluation as its search (DES-058) — dedicated bridge evaluation queries per language, authored by native speakers, testing culturally distinct emotional states and spiritual vocabulary. The bridge ships with language activation, not as a later enhancement.

### Alternatives Considered

1. **Keep flat JSON.** Simpler, no database overhead. Rejected because: cannot represent register awareness, retrieval intent, avoid-territory, or seed passages. Produces search that finds relevant results but cannot meet seekers in their emotional state.
2. **Separate bridge service.** Microservice with its own API. Rejected because: adds latency, operational complexity, and a failure mode. The bridge is small enough to live in application memory — no service boundary needed.
3. **Human-authored bridge only.** Higher initial quality, no AI risk. Rejected because: no humans are available in the build phase, and the bridge needs thousands of entries across multiple languages. Opus can generate grounded entries traceable to source passages. Human review at failure points (crisis-adjacent, zero-result patterns) is more effective than upfront review of entries that work well.

### Consequences

- New tables: `vocabulary_bridge`, `bridge_seed_passages`, `bridge_gaps` (schema in DES-059)
- The flat `spiritual-terms.json` artifact is replaced by `vocabulary_bridge` Layer 2 entries in PostgreSQL
- The enrichment pipeline (ADR-115) gains additional output fields: `retrieval_intent_hints`, `emotional_register`, `corpus_territory_tags`
- Search service gains bridge-mediated query expansion (3-8ms additional latency, negligible against 500ms p95 target)
- DES-058 evaluation harness gains a "Dark Night" query category — 8-10 fragmentary, pre-linguistic distress queries evaluated for "does this passage meet the seeker?"
- Bridge is loaded into application memory at startup; refreshed on content change (webhook from Contentful or manual trigger)
- The Four Doors (PRO-018) and Multi-Lens Homepage (PRO-019) depend on the Bridge for semantic depth — without the Bridge, recognition-based entry points collapse to cosmetic labels

**Extends:** ADR-005 E2 (Terminology Bridge), ADR-115 (Unified Enrichment)
**Governs:** DES-059 (Vocabulary Bridge specification), DES-058 (evaluation harness Dark Night category)

---

## ADR-130: Recognition-First Information Architecture

**Status:** Accepted (Provisional — Arc 2a+)

**Date:** 2026-03-01

### Context

The current portal design leads with a search box: "What are you seeking?" (DES-007). This assumes the seeker arrives with language — a query they can articulate. But the seeker who most needs this portal is least able to articulate their need. A person at 2 AM who can't sleep because of anxiety doesn't know to search for "overcoming fear" or "restlessness of mind." They arrive in a state, not with a vocabulary.

The portal's homepage is the first moment of contact. Whether it asks or offers in that moment is a fundamental architectural decision — not a UI choice.

### Decision

Adopt a **recognition-first** information architecture: the portal offers something before it asks anything. The homepage leads with Today's Wisdom (the portal speaks first), followed by multiple entry lenses that serve different personas without hierarchy.

**The principle:** Recognition before query. The portal offers before it asks.

**The implementation (Arc 2a):** A multi-lens homepage with five concurrent entry modes:

1. **Today's Wisdom** (hero position) — The portal's gift before any interaction. A passage, sometimes Yogananda's voice. Full presence.
2. **"What did Yogananda say about...?"** — The primary search invitation, reframed from "What are you seeking?" to set correct expectations (verbatim retrieval, not AI generation).
3. **The Wanderer's Path** — "Take me somewhere." Opus-weighted random passage selection using depth signatures. No parameters, no category. The seeker who doesn't know what they need lets the corpus offer something.
4. **Tradition/Question entry** — "I come from..." (tradition entry) or "A question I'm holding" (great questions). Serves the philosopher, the scholar, the cross-tradition seeker.
5. **The Four Doors** — "I am searching / I am struggling / I want to understand / I want to practice." Recognition-based emotional entry. Available in secondary navigation, not the primary architecture.

**Secondary navigation:** Persistent, progressively populated: `Books | About` (1c) → `+ The Four Doors | Guide` (2a) → `+ Listen` (when audio arrives).

**The search box remains** — always visible, never primary. For the seeker who knows exactly what they're looking for.

### What This Changes from the Current Design

- **DES-007 (Opening Moment):** Shifts from search-box-primary to Today's Wisdom hero + multi-lens entry. The opening moment is an offering, not a prompt.
- **Thematic navigation:** The six curated themes (Peace, Courage, Healing, Joy, Purpose, Love) become children of the Four Doors' vocabulary bridge mappings — the tradition's vocabulary for what the Doors name in human terms. They don't disappear; they move one level deeper.
- **Homepage structure:** DES-006 (Frontend Design) gains the multi-lens entry specification. The homepage holds multiple personas without hierarchy.

### Milestone 1c Embodiment

The full multi-lens homepage is Arc 2a. At 1c, the recognition-first principle manifests minimally:
- Today's Wisdom hero (already planned)
- Search prompt: "What did Yogananda say about...?" (replaces "What are you seeking?")
- "Show me another" for Today's Wisdom rotation
- Minimal secondary nav: `Books | About`
- Practice Bridge: single quiet line linking to SRF Lessons information

### Alternatives Considered

1. **Search-primary (current design).** Familiar, proven pattern. Rejected as primary because: assumes language, excludes the pre-linguistic seeker, privileges the articulate over the struggling.
2. **Four Doors as primary architecture.** Strong for emotional arrival but undersells the corpus's intellectual depth. A scholar, a devotee, a cross-tradition seeker — none maps to "I am struggling." Rejected as primary; adopted as one lens among several.
3. **Single entry point.** One invitation only. Rejected because: the corpus serves too many personas for any single entry mode.

### Consequences

- DES-007 updated to reference this ADR and describe the recognition-first principle
- DES-015 (Self-Revealing Navigation) gains secondary nav specification with progressive population plan
- Deliverable M1c-5 search prompt changes from "What are you seeking?" to "What did Yogananda say about...?"
- The Vocabulary Bridge (ADR-129) is a prerequisite for meaningful recognition-based entry — without it, the Four Doors and emotional entry points are cosmetic
- PRO-018 (Four Doors), PRO-019 (Multi-Lens Homepage), PRO-020 (Wanderer's Path) capture the Arc 2a+ implementation details

**Governs:** DES-006, DES-007, DES-015, PRO-018, PRO-019, PRO-020
