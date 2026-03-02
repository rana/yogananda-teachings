# SRF Online Teachings Portal — Project Context

## Current State

**Arc 2: Presence — Milestone 2b (Refine) complete.** 13 of 13 numbered deliverables done; 3 items reclassified (HyDE/Cohere Rerank → M3a search pipeline; Vercel KV skipped — trigger conditions not met). Stretch goals shipped: 5 color themes (auto/light/sepia/dark/meditate), color theme selector in ReaderSettings, circadian color temperature (DES-011), "Breath Between Chapters" (DES-012), PWA manifest + offline fallback, cross-site URL registry, font size + line spacing selector, visual regression Playwright screenshots, DES-007 Opening Moment, reading progress persistence, keyboard help overlay (? key), haptic dwell feedback. See ROADMAP.md § M2b for details.

**What exists:** Full working portal deployed on Vercel. All pages navigable: Homepage, Books, About, Quiet Corner, Privacy, Legal, Browse, Integrity, Search, Ops, Passage, Bookmarks. Hybrid search (vector + BM25 + RRF) operational in English and Spanish. Reader experience immersive: dwell contemplation, keyboard navigation, lotus bookmarks, focus/presentation modes, parting words, contextual quiet corner, adaptive low-bandwidth. Color theme system with circadian warmth shifts. 480 Vitest tests across 43 files, 36 E2E Playwright tests (all passing). ALL React components have unit tests — zero untested components remain. Performance: all pages ≤ 130KB First Load JS. CI pipeline (build, lint, type check, test, a11y) runs on every PR.

**Corpus:** 2,681 total chunks (1,568 en + 1,113 es), all embedded via Voyage voyage-3-large. English search quality: 92% Recall@3 (12 queries, 275ms avg). Spanish: 100% eval pass (15/15). Two books ingested: *Autobiography of a Yogi* (English, 49 chapters, 164,029 words) and *Autobiografía de un yogui* (Spanish, 49 chapters, 122,602 words).

**Infrastructure:** Neon PostgreSQL 18 Scale tier (pgvector + pg_search + pg_stat_statements). Contentful space with Book → Chapter → Section → TextBlock content model (en + es locales). Sentry error tracking. CI/CD via GitHub Actions (ci.yml). Terraform configuration for Neon, Sentry, Vercel, AWS. Service Worker with network-first caching + offline fallback. Centralized cross-site URL registry (`/lib/config/srf-links.ts`) covering the yogananda.org ecosystem (80+ URLs, three-room model).

**Design documentation:** PRINCIPLES.md (12 principles), DESIGN.md (cross-cutting index) + 34 individual design files in `design/` (search/, experience/, editorial/), DECISIONS.md index + 3 body files (130+ ADRs), PROPOSALS.md (PRO-001 through PRO-044). DES-060 (Operational Surface) adopted from PRO-035/036/037/039.

**What's next:** Begin Milestone 3a (Corpus) — ingest first-wave books (*Where There Is Light*, *Sayings*, *Scientific Healing Affirmations*), expand Today's Wisdom and Quiet Corner pools, activate cross-book search. HyDE and Cohere Rerank evaluate as M3a-11/M3a-12 with larger corpus. Hindi deferred to Milestone 5b — authorized YSS ebook unavailable outside India (PRO-043 explores unblock path via YSS authorization, potentially activating ~425M reachable).

**Build methodology (PRI-12):** Claude executes all deliverables autonomously — as architect, designer, implementer, and operator. No human-in-the-loop gates in the development process. The human principal reviews at their discretion, not as a blocking step. This applies to development methodology — PRINCIPLES.md § "Human Review as Mandatory Gate" governs the production portal's content governance, not the build process.

---

## Project Methodology

This portal is designed and implemented through AI-human collaboration. The AI is architect, designer, implementer, and operator (PRI-12); the human principal directs strategy, makes stakeholder decisions, and provides editorial judgment. MCP servers are the AI operator's primary interface to infrastructure — every managed service integral to routine operations requires MCP or equivalent API access (ADR-131). The documentation volume — CLAUDE.md, PRINCIPLES.md, CONTEXT.md, DESIGN.md (+ arc files), DECISIONS.md, and ROADMAP.md — is intentional: it is load-bearing institutional memory across AI context windows where no persistent memory exists. Arc-gated reading guidance in CLAUDE.md ensures each session loads only what the task requires.

Roles the AI cannot fill: editorial judgment on sacred text, theological review, SRF stakeholder decisions, community relationship management, and the inner orientation described in the Spiritual Design Principles below. These require human presence and spiritual sensitivity that architecture cannot substitute.

---

## Open Questions

*Summary: 0 Tier 1, 17 Tier 2, 22 Tier 3, 36 Tier 4, ~35 Tier 5+ (in `docs/guides/future-questions.md`). No blockers for M3a.*

### Tier 2: Resolve During Arc 1 (not 1a-specific)

**Technical**
- [ ] Contentful record capacity: monitor record count during ingestion. Evaluate tier needs at Milestone 3a (multi-book corpus).
- [ ] fastText vs. alternative language detection for short queries containing Sanskrit terms. Evaluate during Arc 1 search quality testing.
- [ ] Abuse and misuse patterns: extraction at scale, quote weaponization, SEO parasitism. Should the portal include rate limiting tiers, `rel=canonical` enforcement, MCP usage policy, or text watermarking? (ADR-001, ADR-011, ADR-101, ADR-063, ADR-081)
- [ ] VLD editorial authentication: Milestone 3b+ VLD curation (ADR-082) references Auth0 roles, but Auth0 arrives at Milestone 7a+. What authentication mechanism serves the editorial portal before Auth0? Options: API keys, HTTP Basic, or lightweight auth (e.g., Neon Auth per PRO-005). Needs resolution before Milestone 3b scoping.

**Stakeholder**
- [ ] Which books have official translations in which languages? **Critical for Tier 1 (Spanish) in Arc 1; Hindi deferred to Milestone 5b.** Content availability matrix needed: Language × Book × Format (print/ebook/digital text/audio). Arc 1 uses Amazon-purchased Spanish edition as temporary source; full matrix needed before Tier 2 activation. (ADR-075, ADR-077, ADR-128)
- [ ] *God Talks with Arjuna* Devanāgarī content: not relevant until that book is ingested (Milestone 3a+). (ADR-080, ADR-048)
- [ ] Existing SRF editorial voice guide: does SRF already have brand voice guidelines? The portal should extend them. (ADR-074)
- [ ] SRF editorial policy on contested transliterations: does SRF confirm house style (e.g., "Babaji" vs. "Bābājī") as canonical for all portal display text? (ADR-080, ADR-034)
- [ ] Cross-property content correction coordination: shared content source of truth, or each property maintains its own? (ADR-034, ADR-039)
- [ ] Data controller identity for GDPR: SRF, the foundation, or both? Determines DPA responsibility. (ADR-099)
- [ ] Existing Data Processing Agreements with shared vendors (Auth0, Neon, Vercel, Sentry, Amplitude). (ADR-099)
- [ ] Self-hosting Google Fonts: does the convocation site already self-host? (ADR-099)
- [ ] What Sentry and New Relic configurations does SRF use across existing properties? (Operational alignment)
- [ ] Young seekers and editorial voice: should the portal explicitly welcome young seekers, or is agelessness the mode of inclusion? (DES-048, ADR-095)
- [ ] Design intent preservation across staff turnover: should a companion document explain *why the portal feels the way it feels*? (ADR-098)
- [ ] Portal updates page posture: visible evolution (`/updates` page) or timeless atmosphere? (ADR-105, ADR-074)
- [ ] Visual design language: should the portal feel timeless or contemporary? The spiritual eye symbolism (navy=infinite blue, gold=divine ring, cream=star-white) is already latent in the palette — how explicitly should it be acknowledged in design documentation and token naming? (DES-006, DES-011)

### Tier 3: Resolve During Milestones 1c–2b

**Technical**
- [ ] Query expansion prompt engineering (test with diverse query types). (Milestone 1c)
- [ ] AWS Bedrock abstraction: thin `/lib/services/claude.ts` supporting both Bedrock and direct Anthropic API for 10-year optionality? (ADR-014, ADR-004)
- [ ] Content-addressable passage deep links: should resolution chain include a semantic/normalized hash tier between exact match and fuzzy search? (ADR-022, ADR-034)
- [ ] IAST diacritics rendering verification: Merriweather and Lora at all font sizes, particularly 15px. Include in Milestone 2a design QA. (ADR-080, ADR-003)
- [ ] Circadian content choreography: solar-position awareness vs. fixed clock hours? Browser timezone maps to coordinates for DELTA-compliant calculation. (DES-011, DES-028, ADR-095)
- [ ] AI citation monitoring: should the portal track whether AI systems (ChatGPT, Perplexity, Gemini, etc.) cite Yogananda correctly when quoting from portal content? Not surveillance — web mention monitoring to evaluate whether `llms.txt` and `ai.txt` citation guidance is effective. Could inform future citation guidance improvements. (ADR-081, Milestone 2b+)

**Stakeholder**
- [ ] SRF temple singing bowl recordings for Quiet Corner audio. (Milestone 2a)
- [ ] @YoganandaSRF YouTube channel ID and playlist inventory. (Milestone 2a)
- [ ] About page content: approved biography text for Yogananda and line of gurus? (Milestone 2a)
- [ ] Who reviews AI-drafted UI translations (~200–300 strings)? (ADR-078)
- [ ] Pastoral care resources: center contacts, counselors for locales where helplines are underserved? (ADR-071)
- [ ] Crisis resource policy: display locale-appropriate helpline information alongside grief content? (ADR-071)
- [ ] Philanthropist success metrics at 12 months. (Shapes analytics/reporting)
- [ ] `/guide` alignment with SRF reading recommendations. (DES-048, DES-026)
- [ ] Worldview pathways: include Muslim/Sufi, agnostic/skeptical entry points? (DES-048)
- [ ] Worldview-sensitive `/guide` pathways: Christian contemplative, Buddhist, science-of-consciousness starting points? (DES-048, ADR-033, DES-027)
- [ ] Practice Bridge: portal-hosted `/about/lessons` page or external links only? (ADR-104)
- [ ] Canonical SRF enrollment URL for all "Learn about SRF Lessons" links. (ADR-104)
- [ ] Practice Bridge editorial tone: SRF-preferred language for contextual note? (ADR-104)
- [ ] SRF newsletter/blog signpost: link to SRF newsletter, or maintain distinction from daily email? (ADR-091, DES-016)
- [ ] Youth and young adult program signposts. (DES-048, DES-022)
- [ ] "Awake" documentary as endorsed entry point / worldview pathway? (DES-048)

### Tier 4: Requires SRF Input Before Milestone 3b

**Strategic** (from Arc Sizing Analysis)
- [ ] Calendar timeline: what is the assumed team size and velocity?
- [ ] Minimum lovable product: which milestone constitutes "launched" — publicly available to seekers?
- [ ] Editorial capacity curve: at what milestone does the monastic editor's 2–3 hour daily window become insufficient? (ADR-082)

**Technical**
- [ ] Sacred Places fallback hierarchy: ranked array of external links per place rather than Google Street View only? (DES-023, ADR-070)
- [ ] Chant text chunking and embedding quality: evaluate during *Cosmic Chants* ingestion. (ADR-059, ADR-046)
- [ ] Romanized Hindi/Bengali input: Hindi seekers commonly type in Roman script ("yogananda dhyan"). Search pipeline needs a transliteration step for Indic languages — fastText detects script mismatch, `indic-transliteration` converts to Devanagari before embedding lookup. Scope this before Hindi activation. (ADR-128, PRO-043)
- [ ] DPDPA 2023 compliance: DELTA's zero-personal-data posture likely satisfies India's Digital Personal Data Protection Act. Brief legal confirmation warranted before Hindi activation and any YSS integration. (ADR-099, PRO-043)

**Stakeholder**
- [ ] Portal-app relationship: complementary or overlapping reader? Will portal search power the app?
- [ ] YSS co-equal or advisory authority over Hindi/Bengali/Thai design decisions. (ADR-077, ADR-079, PRO-043)
- [ ] YSS Hindi *Autobiography* authorization for shared corpus — confirmed in principle, formal authorization conversation needed. Could unblock Hindi activation (~425M reachable) earlier than Milestone 5b. (PRO-043, ADR-128)
- [ ] YSS content availability in Tamil, Telugu, Kannada: which editions of Yogananda's works exist as YSS publications? (PRO-043, ADR-077)
- [ ] YSS preferred integration surface: embeddable widgets in yssofindia.org, API integration for Lessons app, full portal deployment, or combination? Technical capacity unknown. (PRO-043)
- [ ] Content governance for bidirectional contribution: who triggers re-ingestion when errors are found in contributed texts? Each organization maintains editorial authority over contributed content? (PRO-043)
- [ ] What are YSS's own digital priorities for making Yogananda's teachings available online? Frame the partnership conversation around YSS's goals, not SRF's content needs. (PRO-043)
- [ ] If YSS authorizes Hindi source text, what prevents Hindi from entering Milestone 1b alongside Spanish? Concrete blockers: Romanized Hindi transliteration pipeline, Hindi golden-set queries, Hindi UI strings, human reviewer availability. (PRO-043, ADR-128)
- [ ] Does YSS have digital audio files of the Hindi *Autobiography*? If so, audio should ship with Hindi text activation — not deferred to a separate media arc. (PRO-003, PRO-043, ADR-128 § Audio Equity)
- [ ] Should YSS editorial team review the theme taxonomy and Vocabulary Bridge for Hindi cultural appropriateness before Hindi activation? Hindi spiritual vocabulary carries distinct weight — the bridge is a separate artifact, not a translation. (ADR-129, PRO-043)
- [ ] Project naming in YSS conversations: use "Yogananda Teachings Platform" or similar org-neutral framing rather than "SRF Online Teachings Portal." (PRO-043)
- [ ] Translated editions: do they preserve paragraph structure? (Critical for cross-language alignment)
- [ ] *Cosmic Chants* canonical volume or family of editions? (ADR-059)
- [ ] Monastic content scope: content *by* vs. *about* monastics. (ADR-036, ADR-037, ADR-001, PRO-014)
- [ ] Living monastic editorial sensitivity: biographical detail level for current monastics. (ADR-037)
- [ ] Presidential succession editorial framing: factual data only, or editorial narrative? (ADR-037)
- [ ] Portal coordinator role ownership: monastic, AE team, or dedicated position? Critical by Milestone 3b. (ADR-082)
- [ ] Inner orientation for editorial team: devotional service, professional positions, or both?
- [ ] Monastic content editor's current digital workflow. (ADR-082)
- [ ] Seasonal editorial calendar ownership. (DES-028, ADR-082)
- [ ] Feature request governance model over a decade. (ADR-082, ADR-098)
- [ ] Editorial intent preservation: should editorial decisions carry brief rationale notes? (ADR-032, ADR-098, ADR-007)
- [ ] Virtual pilgrimage tour URLs and availability. (ADR-069, DES-023)

**Spoken Teachings — Narration Program (PRO-003)**
- [ ] What existing audiobook productions and recording infrastructure does SRF have? (Studio, equipment, production workflow, CD catalog, commercial audiobooks) (PRO-003)
- [ ] Does an SRF-authorized audiobook of *Autobiography of a Yogi* exist on Audible or other platforms? Could it serve the portal? (PRO-003)
- [ ] What recording capability exists at YSS? Different needs, different climate, different equipment availability. (PRO-003, PRO-043)
- [ ] Would SRF/YSS frame monastic narration recording as seva (spiritual service)? How does it fit with existing monastic duties and rhythms? (PRO-003)
- [ ] Spoken teachings distribution: portal-only, or also podcast, YouTube, app, WhatsApp audio? The recordings are the expensive asset — distribution should match. (PRO-003)
- [ ] Could the philanthropist's funding support recording infrastructure and/or a dedicated narrator role at SRF and/or YSS? (PRO-003)

### Milestone 3b+ Questions

Questions about Milestone 3b+ features — multilingual scale, multimedia, MCP distribution, personalization, community curation, VLD governance, and privacy regulations — are maintained separately in [docs/guides/future-questions.md](docs/guides/future-questions.md). They remain real questions, parked until their milestone approaches. (~35 questions covering Arcs 3–7.)

### Resolved Questions

| Date | Resolution | Ref |
|------|-----------|-----|
| 2026-02-24 | Contentful from Arc 1, not Arc 6 — avoids costly migration of 15+ books at Arc 6 | ADR-010 |
| 2026-02-24 | PDF source: spiritmaji.com for Arc 1 PoC; SRF digital text before launch imported to Contentful | — |
| 2026-02-24 | SRF Corpus MCP: all three tiers unscheduled, architecture preserved in DES-031 | PRO-001 |
| 2026-02-24 | Hindi/Bengali: core languages prioritized by reachable population; Spanish is Tier 1, activated in Arc 1 alongside English. Hindi is Tier 1 but deferred from Arc 1 (authorized source unavailable outside India) | ADR-077, ADR-128 |
| 2026-02-25 | SCM: GitHub confirmed; GitLab migration path clean via CI-agnostic scripts if needed | ADR-016 |
| 2026-02-25 | Full crawlability with copyright retention — no content gating, library model | ADR-081, PRO-012 |
| 2026-02-25 | Portal as canonical Yogananda source for LLM training corpora — permissive crawling, `llms.txt` citation guidance | ADR-081 |
| 2026-02-25 | Mobile suggestions: max 5 on <768px, 44×44px targets, horizontal scroll chips | ADR-120 |
| 2026-02-25 | Curated suggestion editorial governance: same human-review gate as theme tagging | ADR-049 |
| 2026-02-25 | Multi-author three-tier hierarchy: guru (lineage gurus) / president (SRF spiritual heads) / monastic (monastic speakers) | PRO-014 |
| 2026-02-25 | Endowment scope covers all SRF-published authors | PRO-014 |
| 2026-02-25 | PRO-014 document cascade merged — multi-author scope adopted across Principles, ADRs, DESIGN, schema | PRO-014 (Adopted) |
| 2026-02-25 | PostgreSQL 18 selected for Neon project — upstream stable since Sept 2025, UUIDv7 schema convention adopted | ADR-124 |
| 2026-02-26 | Cloudflare removed from portal stack — Vercel-native (Firewall, DDoS, CDN) suffices; compatible if SRF routes domain through Cloudflare | PRO-017 |
| 2026-02-26 | Terraform Cloud replaced by S3 + DynamoDB state backend — fewer vendors, 10-year horizon (ADR-004) | ADR-016 |
| 2026-02-26 | Retool deferred to PRO-016 evaluation at Milestone 3d — removed from production architecture diagram | PRO-016 |
| 2026-02-26 | Three-layer Neon management model: Terraform (infrastructure), Neon API/MCP (operations), SQL (data). MCP is Claude's primary operations interface during development. | DES-039, ADR-124 |
| 2026-02-26 | Neon API key scoping: org key for Terraform, project-scoped keys for CI and development (least privilege) | ADR-124 |
| 2026-02-26 | Time Travel queries accepted as Milestone 1a development tool — zero implementation cost, already available on Scale tier | PRO-008 (Adopted) |
| 2026-02-26 | Neon Snapshot API for Layer 2 recovery — API-managed schedule, pre-migration snapshots in CI, on-demand via MCP | ADR-019 |
| 2026-02-26 | Terraform Neon provider (`kislerdm/neon`) is community-maintained — pin version, review plans on upgrades, never auto-upgrade in CI | ADR-124 |
| 2026-02-28 | Reachable population adopted as quantitative prioritization metric — scope ordered by `speakers × internet_penetration × content_availability`. Roadmap reordered: breadth-first (languages) before depth-first (reader polish, study tools) | ADR-128 |
| 2026-02-28 | Spanish elevated to Tier 1 language — *Autobiography* ingested in Arc 1 alongside English. "No wave ordering" replaced by demographic-priority ordering. Amazon edition as temporary PoC source (same approach as spiritmaji.com for English) | ADR-077, ADR-128 |
| 2026-02-28 | Language priority ordering: Spanish (Tier 1, Arc 1) → Hindi (Tier 1, deferred to 5b) → Portuguese/Bengali (Tier 2) → German/Japanese/French/Italian/Thai (Tier 3). Languages ship independently as they clear readiness gates | ADR-077, ADR-128 |
| 2026-02-28 | Devanāgarī scope: *The Holy Science* confirmed to contain Devanāgarī verses. Hindi *Autobiography* deferred from Arc 1 — full-text Hindi typography (ADR-080) activates in Milestone 5b | ADR-080 |
| 2026-03-01 | Hindi *Autobiography* deferred from Arc 1 — authorized YSS ebook only purchasable from India (Razorpay); Amazon Kindle edition is third-party (Fingerprint! Publishing). Hindi remains Tier 1 priority; activates when authorized source becomes available. Spanish proceeds in Arc 1 as planned. | ADR-128, ADR-077 |
| 2026-02-26 | Branch=environment principle adopted: one project per service, branches for separation. Environments disposable via `create-env.sh`/`destroy-env.sh` (Arc 4+) | ADR-020 |
| 2026-02-26 | Single AWS account with IAM role boundaries (not multi-account) — proportionate to public no-auth portal. Escalate to multi-account only if SRF governance requires it | ADR-020 |
| 2026-02-26 | Bootstrap automation via `scripts/bootstrap.sh` — human runs one script, pastes 2 credentials, script handles AWS CLI + Vercel CLI + `gh secret set` | ADR-020, DES-039 |
| 2026-03-01 | Opus as default model for all index-time/batch work — enrichment, vocabulary bridge generation, passage depth signatures, evaluation judging. Sacred text + small corpus + one-time cost = maximum model quality. Per-search tasks remain Haiku. | ADR-014 |
| 2026-03-01 | Vocabulary Bridge adopted — five-layer semantic infrastructure replacing flat `spiritual-terms.json`. Opus-generated, loaded in application memory, operates at both index time and query time. State mappings, vocabulary expansions, register bridges, tradition bridges, language-specific mappings. | ADR-129, DES-059 |
| 2026-03-01 | Recognition-first information architecture — portal offers before it asks. Today's Wisdom hero, multi-lens entry, search prompt reframed to "What did Yogananda say about...?" Four Doors as one lens among several, not primary architecture. | ADR-130 |
| 2026-03-01 | Dark Night query category added to search quality evaluation — 8 fragmentary distress queries evaluated by Opus for retrieval intent match, not just Recall@3 | DES-058, ADR-129 |
| 2026-03-01 | Terraform replaced by Platform MCP for all vendor infrastructure. ADR-016 revised: `teachings.json` as declarative spec, Platform MCP as execution engine, platform database as state store. `bootstrap.sh` preserved for one-time AWS security. PRI-12 justifies divergence from SRF Tech Stack Brief. | ADR-016, ADR-017, DES-039 |
| 2026-03-01 | Two-layer Neon management model replaces three-layer: Platform MCP + Neon MCP (infrastructure + operations) and SQL (data). Former Terraform layer absorbed by platform. | DES-039, ADR-124 |
| 2026-02-25 | Optimal chunk size evaluated empirically in M1a-8 | ADR-048 |
| 2026-02-25 | Enrichment prompt structure resolved via M1c-13 deliverable | ADR-115 |
| 2026-02-25 | Edition variance: Arc 1 uses spiritmaji.com edition; multi-edition policy Arc 3+ | ADR-001, ADR-034 |
| 2026-02-25 | M1a parameter validation governed by ADR-123 with success criteria in ROADMAP.md | ADR-123 |
| 2026-03-01 | Devanāgarī font timing: both *God Talks with Arjuna* and *The Holy Science* contain Devanāgarī. Hindi deferred; Noto Serif Devanagari needed for Sanskrit in English books (Arc 3+) | ADR-080 |
| 2026-02-26 | Cloudflare removed from portal stack — Vercel-native suffices; PRO-017 for re-evaluation | PRO-017 |

*Tech-selection decisions (embedding model, AI provider, single-database, full-text search, graph layer, language URLs) are fully captured in their governing ADRs (ADR-118, ADR-014, ADR-119, ADR-013, ADR-117, ADR-114, ADR-027) and no longer repeated here.*

---

## About This Document

This document provides essential background for anyone working on or evaluating the SRF Online Teachings Portal project. It captures the project's origin, mission, constraints, and organizational context. The "Current State" and "Open Questions" sections above are living — updated as work progresses and questions are resolved.

---

## Project Origin

During a 2026 address, Brother Chidananda (President, Self-Realization Fellowship) shared that a prominent British philanthropist and his wife — after studying Paramahansa Yogananda's works — concluded that the world's problems are symptoms of a deeper issue: the state of human consciousness. Their foundation made a "munificent offer" to endow a new project.

**The philanthropist's question:** "What can we do to help SRF make Paramahansa Yogananda's books available freely throughout the world?"

**The result:** A world-class online teachings portal, to launch later in 2026.

Source: [Brother Chidananda's address](https://www.youtube.com/live/PiywKdIdQik?t=1680s) (28:00–35:19)

---

## Mission

Vastly expand the global availability of Paramahansa Yogananda's published teachings — and all SRF/YSS-published books — using modern technology. The corpus spans three author tiers by role: guru (Yogananda, Sri Yukteswar), president (Daya Mata, Mrinalini Mata, Rajarsi Janakananda), and monastic (monastic speakers). See PRO-014 for the confirmed three-tier hierarchy.

### The Findability Principle

The philanthropist's question was: *"What can we do to help SRF make Paramahansa Yogananda's books available freely throughout the world?"*

"Available" does not merely mean accessible — it means **findable at the moment someone needs it.** A person at 2 AM, unable to sleep because of anxiety, doesn't know that Yogananda wrote specifically about overcoming fear. A person going through a divorce doesn't know there are teachings about the nature of human love and attachment. A person who just lost a parent doesn't know there are passages on the eternal life of the soul.

The world does not lack spiritual content. It lacks *findability in the moment of need.* The portal must therefore go beyond a search engine that waits for queries. It must meet seekers where they are — in their suffering — through thematic entry points, daily wisdom, and a place of immediate calm. The teachings should find the seeker, not only the other way around.

### The Global-First Principle

"Throughout the world" is not metaphor — it is an engineering requirement. A seeker in rural Bihar on a JioPhone over 2G and a seeker in Los Angeles on a laptop over fiber both have a full claim on the beauty and depth of this portal. Neither experience is a compromised version of the other.

Global-First means one product that is complete at every level: fast and dignified on the most constrained connection, spacious and contemplative on the most capable screen. Progressive enhancement is the mechanism — HTML is the foundation, CSS enriches, JavaScript enhances. Each layer is whole at its own level.

When a feature proposal seems to conflict with this principle, the response is not "we can't do that" but "and how does the base experience work?" Global-First does not constrain ambition. It demands that ambition serve everyone. (ADR-006)

### The Experience Quality Principle

Brother Chidananda described the portal as "world-class." The eleven principles that govern the portal's architecture prevent bad decisions — they constrain what the portal must never do. The twelfth principle demands great ones: every interaction should amaze, and honor the spirit of the teachings it presents. The distance between adequate and amazing is the distance between a portal that works and a portal that moves people. (ADR-127)

### The Institutional Intelligence Principle

The portal's service layer (`/lib/services/`) and corpus access infrastructure (DES-031, PRO-001) are designed as portal components, but their value extends beyond web serving. SRF's internal stakeholders — monastics preparing services, correspondence staff responding to seekers, magazine editors, center leaders worldwide — all share the same fundamental need the portal addresses for external seekers: **findability of the Master's words at the moment of need.**

The same AI librarian that helps a seeker in rural Bihar find Yogananda's words about fear can help a monastic in a remote ashram prepare a service on courage, help a correspondent find relevant passages for a grieving devotee, and help a center leader in Tokyo select readings aligned with the SRF calendar. The corpus intelligence that the portal builds is an institutional asset — it equalizes access to the Master's teachings across SRF's global operation, not only for seekers but for those who serve them.

This is a second-order consequence of the philanthropist's investment: the portal doesn't only make the teachings available to the world — it makes the teachings more accessible to the organization that stewards them. See PRO-013 for the internal agent archetypes this principle implies.

### In Scope

- **Free access** to all SRF/YSS-published books across three author tiers (PRO-014): guru (Yogananda, Sri Yukteswar), president (Daya Mata, Mrinalini Mata, Rajarsi), monastic (monastic speakers). All tiers receive verbatim fidelity.
- **Multi-language support** (English + 9 non-English core languages). Core set: en, de, es, fr, it, pt, ja, th, hi, bn. Spanish is Tier 1 activated in Arc 1 alongside English; Hindi is Tier 1 deferred to Milestone 5b (authorized source unavailable outside India); remaining 7 languages follow in Milestone 5b ordered by reachable population (ADR-128). Evaluation candidates beyond the core set: Chinese, Korean, Russian, Arabic. See ADR-075, ADR-077, ADR-128.
- **Intelligent Query Tool** — users ask questions and search across the entire library of books to find specific answers (e.g., "How do I deal with fear?")
- **Life-theme navigation** — curated thematic entry points (Peace, Courage, Healing, Joy, Purpose, Love) so seekers can explore without needing to formulate a search query
- **Today's Wisdom** — a different passage from the guru tier (Yogananda, Sri Yukteswar) on each visit, creating a living, dynamic homepage (PRO-014: only guru-tier authors in daily pool)
- **The Quiet Corner** — a micro-sanctuary page with a single affirmation and optional gentle timer, for the moment of immediate need
- **Audio/video content** — integration with SRF's YouTube repository of monastic How-to-Live talks
- **Events section** — lightweight signpost linking to World Convocation, commemorations, Online Meditation Center, and retreats (not a duplicate of existing event sites)
- **Sacred Places** — contemplative geography of SRF/YSS properties and biographical sites from Yogananda's life, cross-referenced with book passages. "See This Place" via Google Street View links; "Get Directions" via native maps. No embedded map library (ADR-070).

### Explicitly Out of Scope

- **SRF Lessons** — the progressive home-study program is reserved and private. This portal does not include Lesson content, Kriya Yoga technique instruction, or any materials requiring the Lessons Pledge. (Note: the architecture is designed to accommodate future Lessons integration for authorized students if SRF decides to pursue this — see ADR-085 and the "Future Consideration: SRF Lessons" section under Content Scope. No Lessons code ships in any current arc.)

### The "What Next" Bridge

The portal is a library, but the deepest response to Yogananda's words is to *practice*. The portal must gently bridge the gap between reading and doing:

- **"Go Deeper" section** (About page) — links to SRF Lessons, local meditation groups, Online Meditation Center, temples and retreats
- **Footer ecosystem links** (every page) — persistent, quiet signposts to the broader SRF world
- **"Find a meditation group near you"** — external link initially, in-portal locator eventually
- **The Quiet Corner** — the portal itself offers a micro-practice space, pointing toward a deeper practice

This is not a sales funnel. It is a signpost. The difference: a funnel tracks conversion; a signpost points the way and lets you walk at your own pace.

---

## Measuring Success

Standard engagement metrics (time on site, session depth, retention) optimize for screen time — which conflicts with the DELTA Embodiment principle. The portal should encourage seekers to log off and practice. Success must be measured differently.

**Appropriate metrics:**

| Metric | What It Tells Us | How Measured |
|--------|-----------------|-------------|
| Countries reached | Global availability of the teachings | Anonymized geo from Vercel Analytics |
| Languages served | Accessibility breadth | Content availability per locale |
| Anonymized search trends | "What is humanity seeking?" | Aggregated query themes from `search_queries` table (no user identification) |
| Books/passages served | Are the teachings being read? | Anonymized page view counts |
| Share link generation | Are seekers sharing the teachings? | Count of `/passage/[id]` URL generations (no tracking of recipients) |
| Center locator usage | Did digital lead to physical? | Click count on "Find a meditation group" links |
| Qualitative feedback | How do seekers experience the portal? | Optional, lightweight feedback form (not a survey) |

**Inappropriate metrics (do not track):**

| Metric | Why Not |
|--------|---------|
| Session duration | Optimizes for screen time; violates Embodiment |
| Pages per session | Same concern |
| Return visit frequency | Incentivizes retention tactics |
| User-level behavioral profiles | Violates Agency; surveillance dressed as personalization |
| Conversion to SRF Lessons | The portal is not a sales funnel for the Lessons |

---

## Stakeholders

| Stakeholder | Interest |
|-------------|----------|
| **Seekers worldwide** | Free, high-quality access to Yogananda's published teachings in their language |
| **SRF Monastic Order** | Faithful, accurate transmission of the teachings without distortion |
| **SRF AE (Audience Engagement) Team** | Technical implementation aligned with the SRF tech stack and IDP |
| **Content Editors** | Manageable editorial workflows for book text, translations, and metadata |
| **Philanthropic Foundation** | Global reach, measurable impact, responsible stewardship of the endowment |
| **YSS (Yogoda Satsanga Society of India)** | Hindi and Bengali translations of Yogananda's works. Indian subcontinent audience. Organizational branding considerations for Indian-language portal content. **Co-equal design stakeholder** for Hindi and Bengali locales — YSS representatives participate in editorial, visual design, and cultural adaptation decisions for Indian audiences, not as reviewers of completed designs but as co-creators. (See ADR-077, ADR-079) |

---

## Operational Staffing (Requires SRF Input)

The editorial review portal (ADR-082) provides tooling for content governance. But tooling without humans is empty. The following operational roles require dedicated staff time, and SRF must determine *who* fills each role before Milestone 3b launches the editorial workflows.

| Role | Responsibility | Estimated Time | Arc/Milestone Needed |
|------|---------------|----------------|----------------------|
| **Content editor** | Theme tag review, daily passage curation, calendar event management | 2–3 hours/day | Milestone 3b |
| **Theological reviewer** | Final approval on theme associations, editorial thread accuracy | Periodic (high-stakes, low-frequency) | Milestone 3b |
| **On-call engineer** | Sentry alert response, infrastructure monitoring, Neon health | As needed (shared with AE team) | Arc 1 |
| **Book ingestion operator** | Run ingestion pipeline for new books, coordinate human QA | Per-book (1–2 days per ingestion cycle) | Milestone 3a |
| **Portal coordinator** | Cross-queue editorial health, content pipeline status, VLD activity, calendar planning, feature request triage, portal update review and publication (ADR-105) | Regular (weekly minimum) | Milestone 3b |
| **Social media reviewer** | Review quote images and captions, distribute to platforms | 20–30 min/day | Milestone 5a |
| **Translation reviewer** | Compare AI-drafted translations with English source, approve/correct | Batch sessions (per language sprint) | Milestone 5b |
| **Impact report curator** | Curate "What Is Humanity Seeking?" data into narrative report | Annual | Milestone 5b+ |
| **VLD coordinator** | Create curation briefs, monitor VLD submission quality, manage trusted submitter status | Weekly | Milestone 7b |

**Key question for SRF:** Does the monastic order, the AE team, a dedicated content editor, or some combination own these responsibilities? The answer shapes Milestone 3b's editorial workflow design. The portal coordinator and VLD coordinator roles are particularly important to staff early — they are the connective tissue between editorial content, technical operations, and volunteer service. See DESIGN.md § Staff & Organizational Personas for the complete persona survey.

---

## Theological and Ethical Constraints

### Sacred Text Fidelity

Yogananda's published works are considered sacred teachings transmitted through a realized master. The portal must maintain absolute fidelity to the original text. AI features must **never** generate content that could be mistaken for Yogananda's words, paraphrase his teachings, or interpret meditation techniques.

**Multi-language fidelity:** The portal serves only official SRF/YSS translations. Machine translation of Yogananda's words is never acceptable — even slight paraphrasing can distort spiritual meaning. If an official translation does not exist for a language, the book is not available in that language. The portal is honest about content availability rather than substituting machine-generated translations. English fallback content is clearly marked. (See ADR-075.)

### DELTA Framework (Faith-Based AI Ethics)

| Principle | Portal Implication |
|-----------|-------------------|
| **Dignity** | User data never sold or used for advertising. Users are seekers, not data points. |
| **Embodiment** | The portal should encourage users to put down the device and practice — meditate, do the Energization Exercises, attend a local temple. |
| **Love** | UI copy, error messages, and AI responses must reflect compassion. |
| **Transcendence** | No gamification (leaderboards, streaks, badges). Spiritual depth is not quantifiable. |
| **Agency** | Users control their experience. No algorithmic manipulation or coercive retention tactics. |

#### DELTA ↔ Global Privacy Regulation Crosswalk (ADR-099)

The DELTA framework produces privacy protections that substantively exceed any single regulation. The portal did not add privacy as a compliance layer — it designed for human dignity first, and compliance followed.

| DELTA Principle | GDPR Alignment | Portal Implementation |
|-----------------|---------------|----------------------|
| **Dignity** — seekers are not data points | Art. 5(1)(a) fairness, Art. 5(1)(c) data minimization | No user identification, no behavioral profiling, no data monetization |
| **Embodiment** — encourage practice over screen time | Art. 5(1)(b) purpose limitation | No engagement metrics, no retention optimization, no session tracking |
| **Love** — compassion in all interactions | Art. 12 transparent, intelligible communication | Privacy policy in contemplative voice, not legal boilerplate |
| **Transcendence** — no gamification | Art. 5(1)(c) data minimization | No achievement data, no streaks, no leaderboards to store |
| **Agency** — users control their experience | Art. 7 conditions for consent, Art. 17 right to erasure | Double opt-in, one-click unsubscribe, hard deletion option, no dark patterns |

Also aligned with: CCPA/CPRA (California), LGPD (Brazil), DPDPA (India), APPI (Japan), TTDSG/DSGVO (Germany), UK GDPR. See ADR-099 for full compliance analysis, sub-processor inventory, and implementation consequences.

### Accessibility as Theological Imperative

The DELTA Dignity principle and the project's mission — making the teachings "available freely throughout the world" — demand that the portal be accessible to all seekers regardless of physical ability. A portal that excludes blind, deaf, or motor-impaired seekers contradicts its own purpose.

Accessibility is therefore not a polish phase or a nice-to-have. It is a Milestone 2a requirement:

- **WCAG 2.1 AA** conformance from the first commit
- Semantic HTML, ARIA landmarks, keyboard navigation, screen reader support
- Color contrast compliance (minimum 4.5:1 for text, 3:1 for large text)
- `prefers-reduced-motion` support for users with vestibular disorders
- Performance budgets that serve seekers on low-bandwidth mobile connections (India, Africa, Latin America)

Formal audit, advanced features (TTS, dark mode, high-contrast), and third-party testing are distributed across Arcs 2 and 5 — not for introducing accessibility after the fact. See ADR-003.

### Multilingual from the Foundation

The philanthropist's question was about making Yogananda's books "available freely throughout the world." The world speaks thousands of languages. Multilingual support is not a late-stage feature to be bolted on — it is a foundational architectural principle that shapes every design decision from Arc 1 onward.

**What this means in practice:**

- **Schema:** Every content table carries a `language` column from the first migration. Cross-language linking (`canonical_book_id`, `canonical_chunk_id`) is built into the data model, not retrofitted.
- **API:** Every content-serving endpoint accepts a `language` parameter. URL structure uses locale prefixes (`/es/search`, `/de/quiet`). Theme slugs stay in English for URL stability; display names are localized.
- **Search:** The embedding model is multilingual by explicit requirement — Arc 1 embeddings remain valid when Milestone 5b adds new languages. The hybrid search function accepts `search_language` and uses language-appropriate PostgreSQL dictionaries. English fallback is implemented at the service layer.
- **UI:** All strings are externalized to locale files (`messages/*.json`) from Milestone 2a. CSS logical properties (`margin-inline-start` not `margin-left`) are used throughout, ensuring RTL languages work without refactoring. The `lang` attribute is set on `<html>`.
- **Content fidelity:** Only official SRF/YSS human translations are served. Machine translation of Yogananda's words is never acceptable (see Sacred Text Fidelity above). If an official translation does not exist, the book is unavailable in that language — the portal is honest about content availability.

Arc 1 launches in English and Spanish (ADR-128 Tier 1). Hindi (also Tier 1) is deferred to Milestone 5b — the authorized YSS ebook is only purchasable from India/Nepal/Sri Lanka. Milestone 5b activates Hindi alongside the remaining 7 core languages ordered by reachable population. The gap between "bilingual" and "fully multilingual" should require zero schema migrations, zero API changes, and zero search function rewrites — only content ingestion and UI string translation. If a design decision today would require rework to support a new language tomorrow, the design is wrong. (See ADR-075, ADR-076, ADR-077, ADR-078, ADR-128.)

### Calm Technology Principles

The portal must embody "plain living and high thinking":
- Clean, minimal interfaces with generous whitespace ("digital silence")
- Earth tones: warm woods, sky blues, muted greens — no neon, no high-contrast commercial CTAs
- No aggressive notifications, no autoplay, no attention-harvesting
- Serif typography for book text, evoking the experience of reading a physical book
- Meditation modes should fade the technology into the background

### Human Review Gates — Available Infrastructure

The portal provides infrastructure for human review at every content workflow touchpoint. These gates are available governance tools — SRF decides which to activate for production. The architecture supports review without requiring it. See PRO-023 for the full inventory and governance framing.

Key review infrastructure:
- **`tagged_by` three-state model:** `auto` / `manual` / `reviewed` — enables filtering by review status when desired. (ADR-032)
- **`is_published` boolean:** Defaults to `false` — content can require explicit publication approval, or the default can be changed to `true` for autonomous release. (Schema)
- **Translation review:** Claude drafts UI translations; review by fluent, SRF-aware reviewers available before production. (ADR-078)
- **Social media:** The portal generates quote images and suggested captions; human review and posting available. (ADR-092)
- **Ingestion QA:** Claude flags probable OCR errors; human correction decisions available. (ADR-005 E4)

The pattern: **AI proposes; human review gates are available for SRF to activate as needed.** The infrastructure supports both autonomous release and gated workflows. For the internal demo, the portal operates with autonomous AI release. SRF can activate review gates for production if they choose. The `tagged_by` model and `is_published` boolean remain useful infrastructure regardless of the governance decision.

### Signpost, Not Destination

The portal is a library, but the deepest response to Yogananda's teachings is to *practice* — to meditate, to do the Energization Exercises, to attend a local temple, to study the SRF Lessons. The portal's architecture reflects this: it is a **signpost** to deeper SRF practice, not a destination that tries to capture the seeker's entire spiritual life.

This is not a sales funnel. It is a signpost. The difference: a funnel tracks conversion; a signpost points the way and lets you walk at your own pace.

What this means in practice:
- No "sign up to access" gates — all content is freely available
- No conversion tracking ("X% of portal visitors enrolled in Lessons")
- No aggressive CTAs — quiet footer links, "Go Deeper" sections, external links to SRF Lessons and local centers
- No engagement metrics that optimize for screen time (session duration, pages per session, return visit frequency are explicitly excluded from analytics — see DELTA Framework above)
- No gamification (reading streaks, badges, completion tracking) — see Calm Technology above
- The portal links to SRF's broader ecosystem without duplicating it: the Bookstore for physical books, the Online Meditation Center for live events, the convocation site for gatherings, the app for private Lessons reading
- **The portal complements the physical bookstore — it does not replace it.** The portal makes teachings freely accessible online; the bookstore serves seekers who want physical books. This complementary relationship should hold for at least 10 years.
- **The portal is an SRF initiative.** Partnerships with other Yogananda lineages or interfaith groups are not planned. The architecture does not depend on external organizational partnerships. This may be revisited in the future, but it is not a current consideration.

### Content Availability Honesty

The portal is transparent about what it has and what it doesn't. This honesty is a design principle, not a temporary state to be papered over.

- When search returns no results, the portal says so honestly rather than stretching to find something. (ADR-001)
- When a book is not available in a language, it is simply not listed — no machine translation substitute. (ADR-075)
- When English fallback content supplements a seeker's language, it is always clearly marked with an `[EN]` tag — never silently substituted. (ADR-075)
- The Books page shows what exists, not what's promised. "More books are being added" is truthful and forward-looking. No fixed promises, no dates.
- Content availability per language is asymmetric — some languages have more books than others. This asymmetry is visible and honest, not hidden.

### 10-Year Architecture Horizon

This portal is designed for a decade of service, not a sprint to launch. Every architectural decision is evaluated against a 10-year maintenance horizon. (ADR-004)

What this means in practice:
- **Data lives in PostgreSQL.** The relational model, the embeddings, the search index — all in a single durable database. No vendor-specific data formats that require migration when a service sunsets.
- **Business logic is framework-agnostic.** All logic in `/lib/services/`, pure TypeScript. The Next.js layer is a presentation shell. If Next.js is replaced in year 5, the services survive.
- **Migrations are raw SQL.** dbmate, not an ORM's migration generator. SQL is readable, debuggable, and will outlive any ORM.
- **Dependencies are commitments.** Every npm package, every API integration, every SaaS tool is a maintenance obligation for 10 years. Choose fewer, more durable dependencies.
- **Components are tiered by replaceability.** Tier 1 (permanent): PostgreSQL, the service layer, the data model. Tier 2 (stable): Next.js, Vercel, Contentful. Tier 3 (replaceable): specific npm packages, Claude model versions, embedding model versions.
- **Documentation is a permanent artifact.** Root governance documents (CLAUDE.md, PRINCIPLES.md, CONTEXT.md, DESIGN.md, DECISIONS.md index + 3 body files, PROPOSALS.md, ROADMAP.md) plus individual design files in `design/` are as important as the code. New maintainers in year 7 should understand every decision.

### Curation as Interpretation: The Fidelity Boundary

The verbatim constraint (ADR-001) guarantees that Yogananda's text is never altered, paraphrased, or synthesized. But fidelity has a subtler dimension: **every act of selection is an act of interpretation**, even when the selected text is verbatim.

The portal curates at multiple levels:

- **Search ranking** decides which passage answers a question *best* (ADR-005 C2)
- **Highlight boundaries** decide which sentences within a passage are *most relevant* (ADR-005 C3)
- **Theme classification** decides what a passage is *about* (ADR-032)
- **Daily passage selection** decides what a seeker encounters *today*
- **Calendar-aware surfacing** decides which teachings belong to a *moment* (DES-028)
- **Editorial reading threads** decide how passages *relate to each other* (DES-026)
- **Query expansion** decides which of Yogananda's terms map to modern vocabulary (ADR-049)
- **Community collections** decide which groupings reflect *meaningful* paths (ADR-086)

None of these alter the text. All of them shape its reception. The portal's mitigations are layered:

1. **Corpus-derived, not behavior-derived.** Curation algorithms draw from the text itself (embeddings, extracted vocabulary, editorial taxonomy), never from user behavior patterns. (ADR-095, ADR-049)
2. **Human review at every gate.** Theme tags, reading threads, daily pools, community collections, and social captions all require human approval before publication. (ADR-032, ADR-005, ADR-086)
3. **Transparent framing.** When the portal selects, the selection mechanism is visible — a theme label, a date, a search query — not hidden behind an opaque algorithm.
4. **Context always available.** Every curated passage links to its full chapter context via "Read in context," enabling the seeker to evaluate the selection against its original setting. (ADR-001)

This tension is permanent and productive. The portal cannot present all passages simultaneously with equal weight — that would be a database dump, not a library. Curation is the library's essential act. The discipline is to curate *honestly*: selecting without distorting, arranging without editorializing, surfacing without implying that the unsurfaced is less important. (ADR-007)

### Spiritual Design Principles

The constraints above are architectural and ethical. This section names something subtler: the inner orientation that shapes how those constraints are applied. Architecture can be correct and still miss the mark. These principles address the quality of attention the portal brings to the seeker's experience.

**The portal's deepest purpose is to become unnecessary.** Yogananda's tradition holds that the direct experience of God — through meditation — supersedes all scripture. The portal exists in the domain the teachings themselves say is secondary to practice. This is not a contradiction; it is a creative tension the design must hold honestly. The portal should create openings for stillness, not just deliver text. The Quiet Corner, the "Breath Between Chapters," the Dwell mode, and the practice bridges all serve this: moments where the portal gently suggests that the next step is not another passage, but silence.

**Joy is a design value alongside compassion.** The empathic entry points rightly meet seekers in suffering — grief, fear, anxiety, loss. But Yogananda's teachings are also profoundly joyful. "Ever-new Joy" is perhaps his most characteristic phrase. The portal should carry this quality: moments of unexpected beauty, delight in the teachings, warmth that is not merely calming but alive. Today's Wisdom, "Show Me Another," the opening threshold — these are opportunities for joy, not just serenity.

**Editorial stewardship is a sacred act.** The people who select the daily passage, review theme tags, curate the "Seeking..." entry points, and approve translations are performing a form of spiritual service. They stand between the source text and the seeker's screen. The operational staffing table (§ Operational Staffing) identifies the roles; this principle names what those roles carry. The architecture can provide tools and workflows, but the inner quality of the people using them matters. This is a question for SRF, not for the codebase — but the architecture should honor it by making editorial work contemplative rather than transactional.

**Crisis-adjacent content carries responsibility.** The portal will reach people in acute distress. The grief entry point targets seekers searching "what happens after death" and "spiritual comfort after loss." Some of these seekers may be in active danger. Yogananda's passages about the immortality of the soul and the freedom of death are truthful, but without context could be read in unintended ways. The portal's response is not to withhold the teachings but to quietly, non-intrusively provide crisis resources alongside content that touches on death, suffering, and despair. Not a modal, not a gate — a gentle presence. (ADR-071)

**The portal transmits Indian teachings through Western infrastructure — and holds this honestly.** The portal is designed in English, built on American technology (Vercel, AWS, Neon), funded by a British philanthropist, and serves the teachings of an Indian master to seekers worldwide. Every individual decision is defensible. The aggregate pattern — who designed it, whose aesthetic it uses, whose infrastructure it runs on — warrants honest acknowledgment and a design process that includes non-Western voices as co-creators, not only as reviewers of completed designs. The bilingual Arc 1 launch (en/es — ADR-128) is a concrete step: Spanish serves ~430M reachable people globally. Hindi (Tier 1, ~425M reachable) activates in Milestone 5b when an authorized source becomes available. Cultural consultation is not a Milestone 5b deliverable — it is a posture maintained throughout all arcs. YSS representatives, Indian designers, and Global South perspectives should participate in design decisions from Arc 1. (Relates to ADR-006, ADR-077, ADR-079, ADR-128)

**The unmeasurable encounter is the highest success.** The metrics section (§ Measuring Success) carefully avoids engagement metrics. But the portal's highest impact will be in encounters that no analytics system can capture: the person who found exactly the right words at 2 AM, the seeker in rural India who read about meditation and sat quietly for the first time, the grieving parent who felt less alone. These encounters are the mission fulfilled. The "What Is Humanity Seeking?" dashboard (ADR-090) is the portal's best answer to the measurement problem — shifting the narrative from "how many users" to "what is the world asking." That reframing is itself a teaching about what matters.

---

## SRF Existing Digital Ecosystem

| Property | URL | Current Stack | Status |
|----------|-----|---------------|--------|
| Convocation | convocation.yogananda.org | Next.js + Contentful + Vercel | **New standard** |
| Main Website | yogananda.org | Craft CMS (server-rendered) | Legacy |
| Online Meditation Center | onlinemeditation.yogananda.org | WordPress + Elementor | Legacy |
| Member Portal | members.yogananda-srf.org | Unknown | Unknown |
| Bookstore | bookstore.yogananda-srf.org | Unknown | Unknown |
| Volunteer Portal | volunteer.yogananda.org | Unknown | Unknown |
| Mobile App | SRF/YSS (iOS/Android) | Native app with eReader | Active |

**Key observation:** SRF is mid-migration. The convocation site represents the new standard (Next.js + Contentful + Vercel). Legacy properties run on Craft CMS and WordPress. The teaching portal should follow the new standard and establish reusable patterns for future migrations.

---

## SRF Technology Stack (Established Standard)

Documented in the SRF AE Tech Stack Brief. Key components relevant to this portal:

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js + Tailwind CSS on Vercel |
| CMS | Contentful (headless) |
| Backend | AWS Lambda + API Gateway (TypeScript/Node.js) |
| Database | Neon (serverless PostgreSQL) + DynamoDB |
| Identity | Auth0 |
| Admin Tools | Retool |
| Edge/CDN | Cloudflare |
| Video | Vimeo |
| DevOps | GitLab CI/CD + Serverless Framework + Terraform (portal uses Platform MCP — ADR-016 revised) |
| Monitoring | New Relic, Sentry, Amplitude |

The teaching portal should use these technologies wherever possible, introducing new tools only when the established stack cannot meet a requirement (e.g., pgvector for vector search, Claude via AWS Bedrock for AI features — ADR-014).

*Note: This table describes SRF's established organizational standard. The portal diverges where requirements demand it: GitHub instead of GitLab (Resolved Question #5, ADR-016); Platform MCP instead of Terraform (ADR-016 revised — PRI-12); single-database PostgreSQL instead of PostgreSQL + DynamoDB (ADR-013); pg_search instead of Elasticsearch; Sentry as primary monitoring (ADR-095); Vercel-native security instead of Cloudflare (PRO-017). See DESIGN.md § DES-002 for the portal's full divergence table.*

---

## Bootstrap Credentials Checklist

Extracted to [docs/guides/bootstrap-credentials.md](docs/guides/bootstrap-credentials.md) for operational reference. Covers Milestone 1a (infrastructure + content), Milestone 1c (deploy + AI enrichment), and later milestones. See ADR-016 for architecture, DES-039 for deployment spec.

---

## Content Scope

### Arc 1 Focus Book

**Autobiography of a Yogi** by Paramahansa Yogananda — the most widely read and accessible of Yogananda's works. Available in multiple editions and translations.

### Broader Corpus (Milestone 3a+)

- The Second Coming of Christ (2 volumes, ~1,600 pages)
- God Talks With Arjuna: The Bhagavad Gita (2 volumes)
- Man's Eternal Quest
- The Divine Romance
- Journey to Self-Realization
- Where There Is Light
- Sayings of Paramahansa Yogananda
- Wine of the Mystic: The Rubaiyat of Omar Khayyam
- Scientific Healing Affirmations
- How You Can Talk With God
- Metaphysical Meditations
- Self-Realization Magazine archives (Yogananda's articles as searchable teachings, monastic articles as opt-in commentary — ADR-040)
- Other SRF/YSS publications

### Audio Recordings (Arc 6+)

SRF possesses audio recordings of Paramahansa Yogananda's own voice — lectures, informal talks, guided meditations, and chanting. These are sacred artifacts and content simultaneously. Yogananda's voice recordings are among the most direct expressions of his teachings; no book passage can substitute for hearing the Master speak. The portal will treat these with reverence in presentation and with full indexing for discoverability.

SRF also produces modern audio recordings: monastics reading from published works, guided meditations, and chanting sessions. SRF has existing audiobook and recording capability — the scope of which is an open question (see § Open Questions Tier 4, PRO-003). YSS may have different audio production capabilities and needs.

Audio recordings are a primary content type in the portal architecture (ADR-057), with their own data model, transcription pipeline (Whisper → human review), and search integration alongside books and video. PRO-003 (Spoken Teachings — Human Narration Program) proposes extending existing SRF/YSS narration capability to serve the portal — human-narrated book readings as first-class content, reaching illiterate, visually impaired, and audio-preferring seekers worldwide.

### Unreleased and Forthcoming Materials

SRF has indicated that additional unreleased materials exist — books, audio, and video. The architecture accommodates new content types gracefully, with no schema migrations required for standard additions to the book or audio catalog.

### Future Consideration: SRF Lessons

The SRF Home Study Lessons are the organization's core spiritual curriculum — sequential private instruction in meditation and Kriya Yoga. They are **explicitly out of scope** for the public portal. However, SRF has indicated they might eventually be incorporated for authorized students (those enrolled in the Lessons) and Kriya Yoga initiates (kriyabans). This may never happen, or may be years away. The architecture is designed so it is not structurally impossible (ADR-085), but no Lessons-specific code ships in any current arc.

### Arc 1 Content Sources

For Arc 1 development:
- **English:** PDFs available at https://spiritmaji.com/. These are unofficial scans and would be replaced with authoritative SRF-provided digital text for production.
- **Hindi:** YSS edition purchased from Amazon (https://www.amazon.com/dp/9389432472). Temporary PoC source; replaced with authoritative YSS digital text for production.
- **Spanish:** SRF edition purchased from Amazon (https://www.amazon.com/dp/0876120982). Temporary PoC source; replaced with authoritative SRF digital text for production.

---

## Key Terminology

| Term | Meaning |
|------|---------|
| **SRF** | Self-Realization Fellowship, founded 1920 by Paramahansa Yogananda |
| **YSS** | Yogoda Satsanga Society of India (SRF's sister organization) |
| **Kriya Yoga** | Advanced meditation technique taught by Yogananda through SRF. Technique instructions are never included in the portal; Yogananda's published descriptions of Kriya Yoga are part of the corpus and surfaced normally. The portal links to SRF for formal instruction (`yogananda.org/lessons`). (ADR-104) |
| **Satsanga** | Spiritual fellowship; gathering of truth-seekers |
| **AE** | Audience Engagement (SRF's digital/technology team) |
| **IDP** | Internal Developer Platform (SRF's standardized project templates in GitLab) |
| **Convocation** | Annual SRF World Convocation — free gathering of seekers from around the world, held each August in Los Angeles and simultaneously online. Includes classes on Yogananda's teachings, group meditations, devotional chanting (kirtan), pilgrimage tours to sacred SRF sites (Mother Center, Lake Shrine, Hollywood Temple, Encinitas — available as virtual tours for online attendees), and fellowship with monastics. Open to all — no membership required. Site: `convocation.yogananda.org` |
| **How-to-Live Talks** | Inspirational talks by SRF monastics, many available on YouTube |

---
