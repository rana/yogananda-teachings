# SRF Online Teachings Portal — Principles

Twelve principles define the project's identity. They are immutable commitments — changing any of these changes what the project is. Each requires full deliberation to modify. When principles tension against each other, Content Identity principles take precedence over Seeker Experience, which takes precedence over Engineering Foundation.

**Reading guidance.** PRI-NN numbers are stable identifiers, not importance rankings — a principle's tier communicates its precedence, not its number. Within each tier, principles are ordered by topic adjacency, not by weight. Several principles have structural dependencies: PRI-06 is PRI-05's structural mechanism (multilingual schema is how global-first becomes real); PRI-07 is PRI-05's inclusion mechanism (accessibility is how global-first serves disabled seekers); PRI-02 enables PRI-01 (attribution prevents orphaned quotes); PRI-09 enforces PRI-08 (DELTA analytics is calm technology's privacy layer); PRI-12 enables PRI-10 (AI-native operations is the 10-year horizon's operational mechanism). When implementing, check all principles against the current task — do not assume lower-numbered principles are more relevant.

CLAUDE.md carries the compressed, code-affecting form of each principle. This document adds the *why*: enough rationale to prevent well-intentioned erosion across sessions. For the full alternatives-considered analysis, see the referenced FTR files in `features/`.

Specific numeric values throughout these documents (chunk sizes, rate limits, thresholds) are tunable parameters, not principles — implement them as named constants in `/lib/config.ts` per FTR-012.

---

## Content Identity

*What this project is. Violating these destroys the project's purpose.*

### PRI-01: Verbatim Fidelity

**The AI is a librarian, not an oracle.** It finds and ranks the verbatim published words of Yogananda and all SRF-published authors — it never generates, paraphrases, or synthesizes content in any medium: text, voice, image, or video. (FTR-001, FTR-005, FTR-008, FTR-001)

The corpus spans a three-tier content hierarchy (FTR-001): **guru** (Paramahansa Yogananda, Swami Sri Yukteswar — the lineage gurus with SRF-published standalone volumes), **president** (Sri Daya Mata, Sri Mrinalini Mata, Rajarsi Janakananda — direct disciples who served as SRF President and spiritual head), and **monastic** (monastic speakers such as Brother Anandamoy). The tiers describe the author's role, not a value judgment — all tiers receive verbatim fidelity. The AI never generates, paraphrases, or synthesizes any author's words. The tiers govern search inclusion, daily passage eligibility, and social media quotability, not fidelity level.

These words are considered transmitted teachings from realized masters and their direct successors. Even subtle paraphrasing can distort meaning — "God-consciousness" and "cosmic consciousness" are not interchangeable in this tradition. The librarian model eliminates hallucination risk entirely: there is nothing to hallucinate because the AI generates no content. This extends to all modalities: AI voice synthesis of sacred text imposes synthetic prosody on the teachings; AI-generated images of the gurus fabricate objects of devotion; AI-generated video of the gurus is impermissible regardless of intent. FTR-008 establishes the three-tier media integrity policy.

Every Claude interaction returns structured data (JSON arrays of IDs, terms, scores, labels), never prose. Claude reads passages to understand them for ranking and classification, but its output is always a label, a score, or an ID — never modified text. The three permitted categories are Finding (locating passages), Classifying (labeling passages), and Drafting (non-sacred text like UI strings, always with human review). FTR-005 is the single authoritative reference for what Claude may and may not do.

The consequence that matters most: chunking quality is paramount. Each chunk must be a coherent, self-contained passage suitable for display as a standalone quote, because the AI cannot fix a poorly chunked passage — it can only retrieve it.

---

### PRI-02: Full Attribution Always

**Every displayed passage carries full provenance: author, book, chapter, page.** No orphaned quotes — every search result links to its full chapter context. Full author name always displayed — "Paramahansa Yogananda", "Swami Sri Yukteswar", "Sri Daya Mata" — never shortened. When no official translation exists, the content is unavailable in that language — honest absence over synthetic substitution. (FTR-058, FTR-135, FTR-123)

When a seeker encounters a passage, they must always know who said it, where it was published, and how to read the surrounding context. This is not a citation convention — it is a commitment to the integrity of transmission. In the SRF tradition, the source of a teaching matters: the same phrase from Yogananda, from Sri Yukteswar, and from a monastic speaker carries different authority and context. Full provenance preserves this.

Content integrity verification (FTR-123) ensures that published text has not been modified, truncated, or corrupted. Every passage carries provenance: which book, which edition, which chapter, which page. The "Read in context" deep link is architecturally critical — every search result must link to the full chapter, positioned at the passage, so seekers can always verify the surrounding context.

The translation honesty commitment deserves emphasis: when an official translation doesn't exist for a language, the book is simply unavailable in that language. The portal is honest about asymmetry rather than hiding it behind machine translation. This is an "inviolable constraint, not a cost optimization" (FTR-135). The reason is theological: these are sacred texts where precision of language carries spiritual weight. A machine translation of "Self-realization" might produce a phrase that means something entirely different in the target tradition.

When content is absent — no results match a query, no translation exists, a book isn't yet available — the portal treats this as an invitation, not a wall. Honest absence becomes an opportunity to guide: suggest related themes the seeker might explore, point toward the language the content *is* available in, or connect the seeker to SRF resources that might help. The portal never fabricates content to fill the gap, but it also never abandons the seeker at a dead end. Absence handled with care is itself a form of the librarian's service.

---

### PRI-03: Honoring the Spirit of the Teachings

**Every interaction should amaze — and honor the spirit of the teachings it presents.** Brother Chidananda described the portal as "world-class." World-class is the minimum standard: the portal's execution quality — its typography, its search experience, its error handling, its silence — should match the spiritual depth of the content it holds. Before shipping any component, ask: "Is this worthy of presenting Yogananda's words to a seeker who needs them?" (FTR-010)

The other ten principles prevent bad decisions. This principle demands great ones. Where the ten say what *not* to do, this one says what to *aspire to*: every pixel, every transition, every interaction should reflect the care that SRF puts into its printed books. The teachings have been transmitted through an unbroken chain of spiritual care — the digital vessel should honor that chain.

The test is specific: the distance between adequate and amazing. Not just typography that renders the text, but typography that honors its rhythm. Not just search that returns relevant results, but search that feels curated by a wise librarian. Not just error handling that recovers, but error handling that guides gently. When a grieving seeker finds Yogananda's words on the immortality of the soul at 2 AM, the passage should feel like receiving a gift, not reading a database output.

The portal's execution quality should match the spiritual depth of the content it holds — **in every medium the seeker encounters it**: color screens, grayscale displays, e-ink readers, print, screen readers, and braille. A passage read on a monochrome Kindle should feel as honored as one rendered in gold on cream. The visual hierarchy must survive the absence of color; the emotional quality must survive the absence of vision. Display-medium resilience is not a separate concern — it is PRI-03 applied to the full range of human access (see FTR-043 § Display Resilience for requirements and grayscale palette verification).

What is amazing: considered simplicity. Typography that honors the text's rhythm. Search results that feel curated. Error messages that guide gently. Loading states that feel like stillness rather than brokenness. Restraint as a form of excellence — the portal that does fewer things with more care is better than one that does more things with less. This aligns with Calm Technology: the technology disappears and the teachings shine.

---

### PRI-04: Signpost, Not Destination

**The portal leads seekers toward practice — it never substitutes for it.** Practice Bridge routes technique queries to SRF Lessons information. Crisis query detection provides safety interstitials. The AI never interprets meditation techniques or spiritual practices. (FTR-055, FTR-051, FTR-049)

Yogananda's most consistent teaching across all his books is that reading is insufficient — practice is everything. A portal that faithfully presents his books but offers no coherent bridge from reading to practice paradoxically underserves the seeker it has already moved. The Practice Bridge is the response: editorial surfaces that gently guide seekers from reading toward understanding the path of formal practice, using Yogananda's own published descriptions.

Three distinctions separate the Practice Bridge from a sales funnel: (1) the portal provides information, never optimizes for action — no "Enroll Now" button, no conversion tracking; (2) the free practice path (SRF's free Beginner's Meditation, the portal's Quiet Corner) is foregrounded equally with the paid Lessons path; (3) Yogananda himself made this invitation publicly — surfacing it is more faithful to the source material than omitting it.

The technique boundary is absolute: the portal never teaches Kriya Yoga, Hong-Sau, AUM meditation, or the Energization Exercises. It shows what Yogananda *wrote publicly about* these practices. FTR-022 governs future Lessons content access; FTR-055 governs public descriptions.

---

## Seeker Experience

*Who we serve and how. Violating these harms seekers.*

### PRI-05: Global-First

**Supports all humans of Earth equally.** Low-resourced peoples and high-resourced peoples. Low-resource phones with limited and intermittent bandwidth, high-resource phones with high bandwidth, tablets, and desktops. A seeker in rural Bihar on 2G and a seeker in Los Angeles on fiber both get the complete experience. Progressive enhancement: HTML is the foundation, CSS enriches, JavaScript enhances. No feature gating behind connectivity. Core reading and search experiences degrade gracefully with intermittent or absent connectivity. (FTR-006)

"Throughout the world" is not metaphor — it is an engineering requirement. The world includes seekers paying per megabyte on JioPhones, elderly devotees sharing a family smartphone, practitioners in cybercafes, and monks navigating by screen reader. The portal equally serves those with the fewest resources and those with the most. Every one of them has a full claim on the beauty and depth of the portal. Neither experience is a compromised version of the other.

The commitments are specific: homepage initial payload under 50KB; text-only mode toggle (no images, no web fonts, no decorative elements — a *considered* experience, not a degraded one); aggressive caching so repeat visits cost zero data; progressive enhancement so the reading experience works with JavaScript disabled; STG-004 KaiOS emulator in CI; 44×44px touch targets baseline, 48px minimum on form inputs and navigation on pages likely accessed from feature phones (FTR-003, FTR-006); no "Welcome back" personalization that would expose one family member's reading to another on shared devices; core reading and search degrade gracefully when connectivity is intermittent or absent.

When a feature proposal seems to conflict with this principle, the response is not "we can't do that" but "and how does the base experience work?" Global-First does not constrain ambition. It demands that ambition serve everyone.

**Prioritization metric:** When scope must be ordered, the option serving more reachable people ships first. Reachable population (speakers × internet penetration × content availability) is the default tiebreaker for all scope decisions. Spanish (~430M reachable) is activated alongside English from the start. Hindi (~425M) is Tier 1 but deferred — the authorized YSS ebook is only purchasable from India/Nepal/Sri Lanka (Razorpay); the Amazon Kindle edition is third-party (Fingerprint! Publishing). Hindi activates in STG-021 when an authorized source becomes available. See FTR-011 for the full quantitative framework, application protocol, and demographic data.

---

### PRI-06: Multilingual from the Foundation

**Every content table carries a `language` column from the first migration.** Every content API accepts a `language` parameter. UI strings externalized, CSS uses logical properties, schema includes cross-language linking. Adding a new language should require zero schema migrations, zero API changes, and zero search rewrites. (FTR-058, FTR-058, FTR-058, FTR-135)

The multilingual commitment shapes technical decisions made long before all translations exist. Voyage voyage-4-large was selected as the embedding model specifically for its multilingual capability (26 languages, unified cross-lingual embedding space) — validated from STG-002 with bilingual content (en/es). pg_search uses ICU tokenization that handles Latin, Cyrillic, Arabic, Thai, and Devanagari from day one. CSS logical properties (`margin-inline-start` not `margin-left`) are required from STG-004 so RTL languages work without layout redesign.

The three-layer localization strategy: Layer 1 is UI chrome (~200-300 strings, externalized in JSON via next-intl); Layer 2 is portal-authored content (theme descriptions, entry points, editorial reading threads — authored per locale, not translated); Layer 3 is Yogananda's published text (only official SRF/YSS translations, never machine-translated). Each layer has different authoring authority and different translation workflows.

---

### PRI-07: Accessibility from First Deployment

**WCAG 2.1 AA from the first component. Mobile-first responsive design from the first deployable page.** Semantic HTML, ARIA landmarks, keyboard navigation, screen reader support, 44×44px touch targets, `prefers-reduced-motion`. Performance budgets: < 100KB JS, FCP < 1.5s. axe-core in CI — accessibility violations block merges. (FTR-003)

SRF's mission is to serve "all of humanity." "All" includes people with disabilities — and people on phones. This is a theological imperative, not a compliance exercise. SRF's existing app already invested in screen reader support — the portal must meet or exceed that standard.

Retrofitting accessibility is expensive and error-prone; building it in from day one is nearly free. Semantic HTML, keyboard navigation, and ARIA landmarks cost nothing if done from the start. They cost massive effort to retrofit after inaccessible patterns get baked into components and propagated. The same is true of mobile-first CSS: writing `px-4 md:px-8` costs nothing at STG-001; retrofitting desktop-first layouts for mobile costs real effort. When ~70% of the Hindi and Spanish audience (FTR-011 Tier 1) accesses the portal on mobile phones, mobile-first is not polish — it is access. Later stages handle audit and polish (professional WCAG audit, TTS, advanced reading mode, full responsive design strategy) — accessibility and mobile readiness are not late-stage additions.

Screen reader quality goes beyond mere compliance. FTR-053 specifies that the spoken interface should carry the same warmth as the visual one — not just "Bookmark button" but a voice that conveys the portal's devotional register. FTR-052 addresses cognitive accessibility: consistent navigation, no autoplay, clear language, predictable behavior.

---

### PRI-08: Calm Technology

**No push notifications, no autoplay, no engagement tracking, no gamification, no reading streaks, no time-pressure UI.** The portal waits; it does not interrupt. Technology requires the smallest possible amount of attention. (FTR-042, FTR-002)

Standard web patterns — aggressive CTAs, notification badges, engagement dashboards, "You've read X books this month" — are designed to maximize time-on-site. These goals directly conflict with the DELTA Embodiment principle: the portal should encourage logging off and practicing, not maximizing session length. Spiritual depth is not quantifiable. No metrics, leaderboards, or streaks.

The design system is derived from existing SRF properties (yogananda.org, the Online Meditation Center, the convocation site), enhanced with Calm Technology constraints: generous whitespace as "digital silence," warm backgrounds (never pure white), no decorative animations beyond subtle 0.3s transitions, pill-shaped buttons from SRF's established interaction patterns. The portal's visual language should feel like entering a library, not a marketplace.

Personalization features are classified into three tiers (FTR-002): build (language preference, font size, bookmarks — genuinely helpful); build with caution (search history — opt-in only, user-clearable, never inferred); never build (reading streaks, behavioral recommendations, social features, push notifications, engagement dashboards). The portal's anonymous experience through all stages must be excellent without any personalization.

---

### PRI-09: DELTA-Compliant Analytics

**No user identification, no session tracking, no behavioral profiling.** Amplitude event allowlist only. (FTR-082, FTR-085)

The DELTA framework (Dignity, Embodiment, Love, Transcendence, Agency) produces privacy protections that exceed any single regulation. The crosswalk is documented in FTR-085: DELTA Dignity maps to GDPR Art. 5(1)(a) fairness; DELTA Embodiment maps to Art. 5(1)(b) purpose limitation. Ethics came first; legal compliance follows naturally from the theological framework.

The portal collects approximately five event types: page view (anonymized), search query (anonymized, no user association), book opened, chapter read, Quiet Corner timer started. No user identification, no session stitching, no behavioral profiles, no cross-device tracking. The measurement question "Is this portal succeeding?" is answered not by engagement metrics but by "What Is Humanity Seeking?" — aggregated, anonymized search trends that reveal what the world is asking.

Curation algorithms — search ranking, theme suggestions, Related Teachings, Today's Wisdom selection — derive their intelligence from the corpus itself: textual similarity, thematic co-occurrence, author relationships, and editorial curation. They never derive from user behavior patterns, even anonymized or aggregated. No collaborative filtering, no "seekers who read this also read," no behavioral recommendations. The corpus is the teacher; seekers are not data sources for each other.

The consequence for code: never install analytics that track users. Never add session IDs. Never correlate events across visits. Every analytics call goes through the event allowlist. If an event isn't on the list, it doesn't fire.

---

## Engineering Foundation

*How we build. Violating these creates technical debt.*

### PRI-10: 10-Year Design Horizon

**Every component is designed for graceful evolution over a decade.** `/lib/services/` has zero framework imports — business logic survives a UI rewrite. Raw SQL migrations outlive every ORM. Standard protocols (REST, OAuth, SQL, HTTP) at every boundary. Every Tier 3 component is replaceable without touching Tier 1. (FTR-004)

The teaching portal serves Yogananda's published works — content that is timeless. The portal itself should be designed for an organization that thinks in decades, not quarters. SRF has existed since 1920. Component replacement is expected and planned for — it's maintenance, not failure.

Three durability tiers: Tier 1 (effectively permanent, 10+ years) — PostgreSQL, the service layer, the data model, SQL migrations, REST + JSON APIs, HTML + CSS, platform config (`teachings.json`), WCAG standards. Tier 2 (stable, 5-7 years) — Next.js, Vercel, Contentful (editorial source of truth from STG-001; FTR-102). Tier 3 (replaceable) — specific npm packages, Claude model versions, embedding model versions, Auth0, Amplitude. The five longevity guarantees: all data in PostgreSQL; business logic is framework-agnostic; raw SQL migrations; standard protocols at boundaries; decisions are documented.

The search quality test suite (bilingual golden set — FTR-037) serves as the acceptance gate for any AI model migration — you can swap embedding models or LLM providers and verify the system still works.

---

### PRI-11: API-First Architecture

**All business logic in `/lib/services/`.** API routes use `/api/v1/` prefix. All routes public (no auth until STG-023+). Cursor-based pagination. (FTR-015)

Next.js encourages embedding business logic in React Server Components. This is convenient but creates platform lock: Server Components are callable only by the Next.js rendering pipeline, not by mobile apps, third-party integrations, or PWA Service Workers. If business logic migrates into Server Components during early stages, extracting it later is a significant refactoring effort. The cost of API-first discipline from day one is near zero; the cost of retrofitting is high.

The shared service layer (`/lib/services/`) is pure TypeScript with zero framework imports. A framework migration rewrites the UI layer (~40% of code), not the business logic (~60%). This is the single most important structural rule for the project's longevity (FTR-004). Every user-facing feature has both a callable service function and a REST API endpoint. Server Components call service functions directly; external consumers call REST endpoints. Both hit the same logic.

---

### PRI-12: AI-Native Development and Operations

**The AI is architect, designer, implementer, and operator. The human principal directs strategy, stakeholder decisions, and editorial judgment.** MCP servers are the primary operational interface. Every operational surface is designed for AI operation: structured data over visual dashboards, scripts over GUIs, documentation as institutional memory across context windows. (FTR-093)

This is not a description of current staffing — it is an architectural commitment that shapes the system's infrastructure. The AI owns the system end-to-end: it authors the architecture (ADRs, DES sections), designs the specifications (data models, algorithms, pipelines), implements the code (all deliverables), and operates the running portal (deployment, monitoring, incident response). The human principal provides strategic direction, makes stakeholder decisions requiring organizational relationships, and exercises editorial judgment on sacred text — roles that require human presence and spiritual sensitivity that architecture cannot substitute.

The 120+ ADRs, the documentation architecture (FTR-084), the gated-loading protocol, the operational surface (FTR-096), and the skill system exist because the architect and operator has no persistent memory across sessions. Documentation is load-bearing infrastructure — it carries the project's full architectural state so the AI can resume with continuity. Remove this commitment and the project's entire knowledge management infrastructure becomes inexplicable overhead. The documentation volume is not a byproduct of thoroughness; it is the architectural consequence of an AI-native development model.

**The MCP requirement** follows directly: the AI operator interacts with infrastructure through programmatic interfaces. Every managed service integral to routine operations — database, CMS, monitoring, error tracking — requires MCP integration or equivalent API access. One-time configuration through service dashboards is acceptable; routine operation through dashboards is not. When evaluating a new service, "can the AI operator manage it programmatically?" is an architectural requirement, not a preference. Current MCP integrations: Neon (database management), Sentry (error monitoring), Contentful (content management). Future: SRF Corpus MCP (external AI access, FTR-098).

Architectural consequences of AI-native operations:
- Health endpoints return structured JSON, not HTML status pages (FTR-082, FTR-096)
- Deployment is script-driven with machine-readable manifests (FTR-096)
- Monitoring surfaces are machine-parseable (structured logging, Sentry MCP integration)
- Error diagnostics include structured context sufficient for AI triage
- Documentation carries the full architectural state — the operator reads it at every session start
- Operational scripts (`status.sh`, `doc-validate.sh`, `release-tag.sh`, `deploy.sh`) are first-class deliverables, not developer convenience

The dependency: PRI-12 enables PRI-10. AI-native operations is the 10-year horizon's operational mechanism — a system designed for AI operation is intrinsically more maintainable because its operational knowledge is externalized in documentation and scripts, never locked in human expertise that can depart. The same infrastructure that serves the AI operator also serves any future human team — machine-readable operations are a strict superset of human-readable operations.
