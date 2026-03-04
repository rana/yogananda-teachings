# SRF Online Teachings Portal — AI Context

## What This Project Is

A free, world-class online teachings portal for Self-Realization Fellowship (SRF) to make Paramahansa Yogananda's published books freely accessible worldwide, with an AI-powered intelligent search tool. Funded by a philanthropist. Launching late 2026.

**AI-human collaboration.** The AI is architect, designer, implementer, and operator; the human principal directs strategy, stakeholder decisions, and editorial judgment (PRI-12). The documentation volume is intentional — it serves as institutional memory across AI context windows. MCP servers are the primary operational interface. See CONTEXT.md § Project Methodology for the full collaboration model.

## Read These Files

1. **PRINCIPLES.md** — The 12 immutable commitments that define the project, with rationale. Always load this.
2. **CONTEXT.md** — Project background, mission, stakeholders, theological constraints, current state, open questions
3. **DESIGN.md** — Navigation index + cross-cutting sections (architecture, API, security, observability, testing, personas, content pipeline). The index maps every DES/ADR section to its individual file in `design/`.
4. **design/search/** — Search architecture, data model, ingestion pipeline, chunking, MCP, infrastructure (10 files)
5. **design/experience/** — Frontend, pages, accessibility, responsive, video, events, places, multilingual (9 files)
6. **design/editorial/** — Staff tools, editorial workflows, content intelligence, curated features (14 files)
7. **DECISIONS.md** — Index and navigational summaries for ADRs across 11 topical groups. ADR bodies split into three files:
   - **DECISIONS-core.md** — Foundational, Infrastructure, Application Architecture, Content, Search (ADR-001–027, 029–044, 046–050, 052–053, 114–121, 125–130). Arc 1+.
   - **DECISIONS-experience.md** — Cross-Media, Seeker Experience, Internationalization (ADR-054–081, 104, 122). Arc 2+.
   - **DECISIONS-operations.md** — Staff, Brand, Operations & Governance (ADR-082–101, 105–113, 123–124, 131). Arc 1+ (governance, engineering standards); Arc 3+ (staff, brand, operations).
8. **ROADMAP.md** — 3 planned arcs (Foundation, Presence, Wisdom) with detailed milestones, plus Future Directions. Deliverables, success criteria, arc gates.
9. **PROPOSALS.md** — Proposal registry with PRO-NNN identifiers, graduation protocol, and scheduling lifecycle. Curated proposals awaiting validation, scheduling, or adoption. Also handles ADR/DES suspension lifecycle.

**Domain-gated reading.** Do not read front-to-back. Load what the task requires:
- **Always:** This file (CLAUDE.md) + PRINCIPLES.md + CONTEXT.md § Current State + ROADMAP.md § current arc/milestone + DESIGN.md (index + cross-cutting)
- **When implementing search/data/ingestion:** + `design/search/` files (or specific ones by identifier)
- **When implementing frontend/pages/UX:** + `design/experience/` files (specific ones by identifier) + DECISIONS-experience.md
- **When implementing editorial/staff/intelligence:** + `design/editorial/` files (specific ones by identifier) + DECISIONS-operations.md
- **When making decisions:** DECISIONS.md index to locate the relevant group, then load the appropriate body file
- **When evaluating proposals or at arc boundaries:** PROPOSALS.md
- **Arc 1 tasks primarily use:** `design/search/` + DECISIONS-core.md + DECISIONS-operations.md §§ ADR-110, ADR-123–124 (API conventions, governance — apply from Arc 1)
- **Arc 2 tasks primarily use:** `design/experience/` + DECISIONS-experience.md
- **Arc 3 tasks primarily use:** `design/editorial/` + `design/search/` (data platform)

## Ignore

- **scratch.md** — Personal scratchpad. Not project documentation. Do not read.

## Reference Documents (Background Research)

Located in `docs/reference/`:

- **overview-youtube.md** — Brother Chidananda's announcement of the portal (YouTube transcript)
- **SRF Teaching Portal Research & Design (Gemini 3 Pro).md** — Comprehensive theological, pedagogical, and technical analysis
- **SRF Tech Stack Brief-3.md** — SRF's established technology stack (AWS, Vercel, Contentful, Neon, Auth0, etc.). **Conformance note:** This document is prescriptive for SRF projects. When designing infrastructure, compare choices against this brief and document divergences with explicit justification. The portal adopted Secrets Manager (ADR-125) and OIDC (ADR-126) aligned with this standard; SSM Parameter Store deferred with documented rationale. See ADR-125 § "SSM Parameter Store — Deferred, Not Rejected."
- **RAG_Architecture_Proposal.md** — Comprehensive RAG architecture and feature proposal (Claude Web, Feb 2026). Merge-reviewed: ADR-114–121 and DES-054–056 adopted; Features 10–11 omitted/constrained; stack divergences annotated.
- **Prioritizing Global Language Rollout.md** — Global language demographics, device/bandwidth analysis, and content rollout strategy (53 cited sources: Ethnologue, ITU, UNESCO, DataReportal, GSMA). Used as the data foundation for ADR-128 (Reachable Population prioritization framework). Some recommendations conflict with project decisions (payment infrastructure, SRF Lessons scope, language phasing) — see ADR-128 for what was adopted and what was set aside.

## Principles (Code-Affecting)

Twelve principles define the project's identity and directly constrain code generation. Changing any of these changes what the project is — they require full deliberation to modify. When principles tension, Content Identity takes precedence over Seeker Experience, which takes precedence over Engineering Foundation. Within each tier, principles are ordered by topic adjacency, not by weight — do not assume lower-numbered principles are less relevant. PRINCIPLES.md has the expanded rationale for each. Additional theological and ethical context (Content Honesty, Lessons Scope, Human Review Gate) is in CONTEXT.md § Theological and Ethical Constraints.

**Content Identity** — what this project is:
- **PRI-01: Verbatim Fidelity.** The AI is a librarian, not an oracle. It finds and ranks the verbatim published words of Yogananda and all SRF-published authors — it NEVER generates, paraphrases, or synthesizes content in any medium: text, voice, image, or video. AI generation, synthesis, or cloning of any media representing Yogananda or the lineage gurus is prohibited. The corpus spans three author tiers by role: guru (Yogananda, Sri Yukteswar), president (Daya Mata, Mrinalini Mata, Rajarsi), monastic (monastic speakers). All tiers receive verbatim fidelity. (ADR-001, ADR-005, ADR-015, PRO-014)
- **PRI-02: Full attribution always.** Every displayed passage carries full provenance: author, book, chapter, page. No orphaned quotes — every result links to its full chapter context. Full author name always displayed. When no official translation exists, the content is unavailable in that language — honest absence over synthetic substitution. When content is absent, guide constructively — honest absence as invitation, never a dead end. (ADR-075, ADR-078, ADR-039)
- **PRI-03: Honoring the Spirit of the Teachings.** Every interaction should amaze — and honor the spirit of the teachings it presents. The portal's execution quality should match the spiritual depth of its content — in every medium: color screens, grayscale, e-ink, print, screen readers, braille. A passage on a monochrome Kindle should feel as honored as one rendered in gold on cream. Before shipping any component, ask: "Is this worthy of presenting Yogananda's words?" Not just typography that renders text, but typography that honors its rhythm. Not just search that returns results, but search that feels curated. Restraint as excellence — the technology disappears and the teachings shine. (ADR-127, DES-025 § Display Resilience)
- **PRI-04: Signpost, not destination.** The portal leads seekers toward practice — it never substitutes for it. Practice Bridge routes technique queries to SRF Lessons information. Crisis query detection provides safety interstitials. The AI never interprets meditation techniques or spiritual practices. (ADR-104, ADR-122, ADR-069)

**Seeker Experience** — who we serve and how:
- **PRI-05: Global-First.** Supports all humans of Earth equally — low-resourced and high-resourced peoples, low-resource phones with intermittent bandwidth and high-resource phones, tablets and desktops. A seeker in rural Bihar on 2G and a seeker in Los Angeles on fiber both get the complete experience. Progressive enhancement: HTML is the foundation, CSS enriches, JavaScript enhances. No feature gating behind connectivity. Core experiences degrade gracefully with intermittent or absent connectivity. Performance budgets enforce this. **Scope prioritization:** when scope must be ordered, the option serving more reachable people ships first (ADR-128). Spanish is Tier 1 activated in Arc 1; Hindi is Tier 1 deferred to Milestone 5b (authorized YSS source not yet available outside India). (ADR-006, ADR-128)
- **PRI-06: Multilingual from the foundation.** Every content table carries a `language` column from the first migration. Every content API accepts a `language` parameter. UI strings externalized, CSS uses logical properties, schema includes cross-language linking. Adding a new language should require zero schema migrations, zero API changes, and zero search rewrites. PRI-05's structural mechanism — global-first without multilingual foundations is aspiration without substance. (ADR-075, ADR-076, ADR-077, ADR-078)
- **PRI-07: Accessibility from first deployment.** WCAG 2.1 AA from the first component. Mobile-first responsive design from the first deployable page — ~70% of the Hindi/Spanish audience is mobile-first (ADR-128, ADR-006). Semantic HTML, ARIA landmarks, keyboard navigation, screen reader support, 44×44px touch targets, `prefers-reduced-motion`. Performance budgets: < 100KB JS, FCP < 1.5s. axe-core in CI — accessibility violations block merges. (ADR-003)
- **PRI-08: Calm Technology.** No push notifications, no autoplay, no engagement tracking, no gamification, no reading streaks, no time-pressure UI. The portal waits; it does not interrupt. Technology requires the smallest possible amount of attention. (ADR-065, ADR-002)
- **PRI-09: DELTA-compliant analytics.** No user identification, no session tracking, no behavioral profiling. Amplitude event allowlist only. Curation algorithms derive intelligence from the corpus, never from user behavior patterns — even anonymized. (ADR-095, ADR-099)

**Engineering Foundation** — how we build:
- **PRI-10: 10-year design horizon.** `/lib/services/` has zero framework imports — business logic survives a UI rewrite. Raw SQL migrations outlive every ORM. Standard protocols (REST, OAuth, SQL, HTTP) at every boundary. Tier 2 components (Next.js, Vercel, Contentful) are replaceable without touching Tier 1 (PostgreSQL, SQL, HTML). (ADR-004)
- **PRI-11: API-first architecture.** All business logic in `/lib/services/`. API routes use `/api/v1/` prefix. All routes public (no auth until Milestone 7a+). Cursor-based pagination. (ADR-011)
- **PRI-12: AI-Native Development and Operations.** The AI is architect, designer, implementer, and operator. The human principal directs strategy, stakeholder decisions, and editorial judgment. MCP servers are the primary operational interface — every managed service integral to routine operations requires MCP or equivalent API access. Operational surfaces are machine-parseable: structured JSON health, script-driven deployment, machine-readable manifests. Documentation is institutional memory across context windows — load-bearing infrastructure, not overhead. (ADR-131)

**Principle dependencies.** Several principles enable or enforce others — when implementing, the enabling principle constrains code even when the enabled principle is not directly relevant:
- PRI-06 enables PRI-05: multilingual schema is global-first's structural mechanism
- PRI-07 enables PRI-05: accessibility is global-first's inclusion mechanism
- PRI-02 enables PRI-01: attribution prevents orphaned quotes
- PRI-09 enforces PRI-08: DELTA analytics is calm technology's privacy layer
- PRI-12 enables PRI-10: AI-native ops is the 10-year horizon's operational mechanism

## Quick Reference

**Scope prioritization (ADR-128).** When two features or milestones are architecturally independent, the one serving more reachable people ships first. Metric: `speakers × internet_penetration × content_availability`. Apply this when facing feature-vs-feature or language-vs-feature tradeoffs. Spanish is Tier 1 (Arc 1); Hindi is Tier 1 (deferred to Milestone 5b — authorized YSS source unavailable outside India); Portuguese and Bengali are Tier 2; remaining 5 languages are Tier 3. Full demographic data and worked examples in ADR-128.

**Parameters as named constants (ADR-123).** Specific numeric values (chunk sizes, rate limits, thresholds) are tunable defaults, not architectural commitments. All parameters in `/lib/config.ts`. Each documents: value, rationale, evaluation trigger.

**Core stack:** Next.js on Vercel, Neon PostgreSQL 18 Scale tier + pgvector + pg_search/ParadeDB + pg_stat_statements (ADR-124), Contentful (Arc 1+, editorial source of truth; ADR-010), Claude via AWS Bedrock (index-time enrichment only — never in search hot path, never generates content; ADR-014, ADR-119), Voyage voyage-3-large (embeddings, ADR-118), Python + NetworkX graph batch pipeline (Milestone 3b+, ADR-117), Vercel KV/Upstash Redis (suggestions Milestone 2b+ if needed, ADR-120; Arc 1 uses static JSON at CDN edge + pg_trgm fuzzy fallback), fastText (language detection), dbmate migrations. Infrastructure managed by yogananda-platform MCP (ADR-016 revised); one-time AWS security via `bootstrap.sh`. Pure hybrid search (vector + BM25 + RRF) is the primary search mode — no AI in the search path. AI-enhanced search (HyDE, cross-encoder reranking) optional, conditional on evaluation (ADR-119). See DESIGN.md for the full tech stack.

**Code layout:**
```
/lib/services/ — Business logic (framework-agnostic TypeScript)
/lib/config.ts — Named constants per ADR-123 (model IDs, chunk sizes, search params)
/lib/mcp/ — MCP server (unscheduled; ADR-101)
/lib/logger.ts — Structured JSON logging
/app/ — Next.js Server Components + Route Handlers
/app/api/v1/ — Versioned API routes
/migrations/ — Numbered SQL migrations (dbmate)
/terraform/bootstrap/ — IAM policy documents (referenced by bootstrap.sh; .tf files archived)
/lambda/ — AWS Lambda handlers (Milestone 3a+, ADR-017)
/messages/ — Locale JSON files (next-intl)
/scripts/ — Bootstrap, CI-agnostic deployment, and environment lifecycle scripts (ADR-018, ADR-020)
/.github/workflows/ — CI/CD pipelines (ci.yml, neon-branch.yml)
/design/ — Individual design specifications (search/, experience/, editorial/)
/docs/guides/ — Human onboarding and setup (getting-started, credentials, manual steps)
/docs/operations/ — Operational runbooks and procedures (Milestone 3b+)
/docs/reference/ — Background research (not active project docs)
```

**Design tokens:** Merriweather + Lora + Open Sans (Latin); Noto Serif Devanagari (Hindi reading) + Noto Sans Devanagari (Hindi UI/verses). Hindi body text at 20px / 1.9 line height (ADR-080). SRF Gold `#dcbd23`, SRF Navy `#1a2744`, Warm Cream `#FAF8F5`. Full palette in DESIGN.md § Visual Identity.

**MCP servers (PRI-12: every managed service integral to routine operations requires MCP or equivalent API access):**
- **Neon Management** (now) — Claude's operations interface for Neon. Branch creation, SQL execution, schema diffs, connection strings, migration safety (`prepare_database_migration`/`complete_database_migration`). Used throughout development. See DES-039 § Three-Layer Neon Management Model. Config: VS Code `mcp.json` (HTTP type, Bearer auth).
- **New Relic** (Arc 2+) — Observability MCP via `newrelic-mcp` npm package. NRQL queries, APM, alerts, deployments, synthetics. Config: VS Code `mcp.json` (stdio via npx). Env: `NEW_RELIC_API_KEY`, `NEW_RELIC_REGION`.
- **Auth0** (Milestone 7a+, provisioned now) — Identity and access management via official `@auth0/auth0-mcp-server` package. Tenant management, application CRUD, user management, role/permission management, log analysis, action management. Uses OAuth 2.0 Device Authorization Flow (credentials in system keychain, not config). Config: VS Code `mcp.json` (stdio via npx). Run `npx -y @auth0/auth0-mcp-server init` to authenticate.
- **Sentry** (Arc 1) — Error tracking and monitoring. Via Claude Code plugin.
- **Contentful** (Milestone 1a+) — CMS content management.
- **SRF Corpus** (unscheduled) — AI consumer access to search, themes, graph. Three-tier architecture for external AI systems. See DES-031, ROADMAP.md § Unscheduled Features; ADR-101. Fundamentally different from Neon Management MCP — this serves AI consumers, not the AI operator.

## Identifier Conventions

**PRI-NN** (Principles) — The 12 immutable commitments in PRINCIPLES.md. Two-digit zero-padded (PRI-01 through PRI-12). PRI numbers are stable and append-only — new principles append after the current max. Tier grouping (Content Identity PRI-01–04, Seeker Experience PRI-05–09, Engineering Foundation PRI-10–12) communicates precedence, not the number. Header format in PRINCIPLES.md: `### PRI-NN: Title`.

**ADR-NNN** (Architecture Decision Records) — ADRs are current architectural directives, not historical records — git preserves the evolution. ADR numbers are stable identifiers, not sequence counters — gaps (028, 045, 051, 102–103) exist from restructuring; do not renumber to fill them. DECISIONS.md is the navigational index with group summaries; ADR bodies are in DECISIONS-core.md, DECISIONS-experience.md, and DECISIONS-operations.md. New ADRs append after the current highest in the appropriate body file (or reuse a gap if thematically adjacent to its group). Header format: `## ADR-NNN: Title`.

**ADR maturity classification.** ADRs carry a maturity marker in their Status field (see ADR-098):
- **Foundational** — Defines project identity. Change requires full deliberation. (`Accepted (Foundational)`)
- **Active** — Governing current or imminent implementation. (`Accepted`)
- **Provisional** — Thorough direction for future arcs. May be revised or suspended. (`Accepted (Provisional — Arc N+)`)
- **Suspended** — Moved to PROPOSALS.md. ADR body **deleted** from DECISIONS body file; DECISIONS.md index annotated `(Suspended → PRO-NNN)`. PRO entry is the single source of truth. (`Suspended → PRO-NNN`)
- **Implemented** — Validated through code. (`Implemented — see [code path]`)

**DES-NNN** (Design Sections) — Individual files organized by domain in `design/`: `search/` (search and data platform), `experience/` (seeker-facing pages and UX), `editorial/` (staff tools and content intelligence). Cross-cutting sections remain in DESIGN.md root. The navigation table in DESIGN.md maps every section to its file. File naming: `{IDENTIFIER}-{slug}.md` (e.g., `DES-004-data-model.md`). Subsection identifiers (DES-007–016 within DES-006, DES-045/047/048 within DES-044) are anchors within their parent file, not standalone files — glob for the parent identifier to find them. New sections: create the file in the appropriate domain directory, add a row to the DESIGN.md navigation table.

**PRO-NNN** (Proposals) — Curated proposals in PROPOSALS.md. PRO-NNN identifiers are permanent — never renamed or reassigned. When a proposal is adopted, the PRO entry gets `Status: Adopted → [ADR/DES/Milestone refs]`. When an ADR is suspended, a PRO entry is created and the ADR gets `Status: Suspended → PRO-NNN`. New PROs append after the current max. Header format: `### PRO-NNN: Title`.

**M{arc}{milestone}-{deliverable}** (Milestone Deliverables) — Deliverables in ROADMAP.md use the `M` prefix for self-identifying cross-references. Pattern: `M1a-4` (Arc 1, Milestone a, deliverable 4). The `M` prefix disambiguates deliverables from version numbers and section references. Milestones in prose use full form: "Milestone 1a"; deliverables use the M-notation: "M1a-4". Examples: M1a-1 (repository setup), M1a-8 (search quality evaluation), M1c-17 (deploy manifest).

When referencing identifiers in prose, use the prefix form: `PRI-01`, `ADR-017`, `DES-003`, `PRO-001`, `M1a-4`. Zero-pad to the standard width for each type (PRI: 2 digits, ADR/DES/PRO: 3 digits).

**Dual-homed sections.** Some ADRs have sections in both DECISIONS.md and a `design/` file (e.g., ADR-048 appears in both DECISIONS-core.md and `design/search/ADR-048-chunking-strategy-specification.md`). Rule: DECISIONS carries the decision rationale and alternatives analysis; the design file carries the implementation specification. When implementing, follow the design file; when understanding *why*, read DECISIONS. Titles must match between locations — use the full DECISIONS title in both. When editing a dual-homed ADR, update both locations and verify titles match.

**Cross-reference convention.** In prose, use bare identifiers: "See ADR-048", "per DES-003", "PRI-01 governs". No file paths in prose — identifiers are stable across restructuring. Clickable links with file paths belong only in navigation indexes (DESIGN.md nav table, DECISIONS.md index). File naming (`{IDENTIFIER}-{slug}.md`) makes identifiers discoverable via glob: `**/ADR-048*` finds the file without consulting an index.

## Project Skills

Six custom skills in `.claude/skills/`:

**Review skills** (read-only analysis, no file changes):
- **seeker-ux** — Reading and seeker experience review. Evaluates the reader's journey for accessibility, helpfulness, and spiritual uplift.
- **mission-align** — SRF mission alignment check. Assesses whether features and decisions serve the portal's spiritual purpose.
- **cultural-lens** — Cultural sensitivity review. Evaluates assumptions about language, geography, religion, and access.

**Proposal management skills** (edit project documents with approval):
- **dedup-proposals** — Consolidate raw explorations from `.elmer/proposals/` into curated PRO-NNN entries in PROPOSALS.md. Without arguments: scans all explorations, reports variant clusters. With a PRO-NNN or filename: finds related explorations and synthesizes them.
- **proposal-merge** — Graduate a PRO-NNN proposal into precise edits across DECISIONS.md, DESIGN.md, ROADMAP.md, and CONTEXT.md. Assigns ADR/DES identifiers, detects conflicts, updates PRO status, presents full plan for approval before executing.
- **theme-integrate** — Integrate a new content theme into taxonomy, terminology bridge, enrichment pipeline, knowledge graph, and worldview pathways. Generates all integration artifacts from a PRO-NNN proposal or free-text description.

**Proposal management workflow:** `/dedup-proposals` → `/proposal-merge <PRO-NNN>` or `/theme-integrate <PRO-NNN>` → run `coherence` skill to verify cross-document integrity.

**Explorations vs. proposals.** Raw files in `.elmer/proposals/` are unvetted AI explorations — not project documents. They feed into `/dedup-proposals`, which curates them into PRO-NNN entries in PROPOSALS.md. Do not reference `.elmer/` explorations in project documents; reference PRO-NNN identifiers instead.

## Document Maintenance

Root documents (CLAUDE.md, PRINCIPLES.md, CONTEXT.md, DESIGN.md, DECISIONS.md index + 3 body files, PROPOSALS.md, ROADMAP.md) plus ~33 individual design files in `design/` (search/, experience/, editorial/). Keep them accurate as you work — drift compounds across sessions. (ADR-098)

| When this happens... | ...update these documents |
|----------------------|--------------------------|
| Principle added or revised | Update PRINCIPLES.md (expanded rationale) and CLAUDE.md § Principles (compressed form) |
| New decision made | Add ADR to the appropriate DECISIONS body file (core/experience/operations) and update the DECISIONS.md index |
| Open question resolved | Add one-line entry to CONTEXT.md § Resolved Questions table (date, resolution, governing ref). If the resolution is fully captured in an ADR/PRO, the table entry is sufficient — no paragraph needed. Remove inline `[x]` item from Open Questions. |
| Open question added | Add to CONTEXT.md § Open Questions (appropriate tier). Cross-reference from relevant DESIGN.md section if applicable. |
| Arc/milestone deliverable changed | Update ROADMAP.md deliverable table/bullets and success criteria |
| Arc/milestone status changes | Update "Current State" section in CONTEXT.md |
| New technology adopted | Update DESIGN.md tech stack table |
| New content type added | DESIGN.md § Data Model + API section, ROADMAP.md arc/milestone, new ADR. Also: Knowledge Graph node/edge types, ADR-062 checklist, DES-053 media-type variations. |
| New API endpoint added | Follow DES-019 § API Conventions (ADR-110). Paginated lists: `data`/`pagination`/`meta`; complete collections: `data`/`meta`; single resources: object directly. |
| Exploration ready for curation | Run `/dedup-proposals` to consolidate `.elmer/proposals/` explorations into PRO-NNN entries in PROPOSALS.md. |
| Proposal approved for merge | Run `/proposal-merge <PRO-NNN>` or `/theme-integrate <PRO-NNN>`. Skill handles ADR/DES creation and updates PRO status to Adopted. |
| Design section fully implemented | Add `**Status: Implemented** — see [code path]` at top of the design file. Update governing ADR status if applicable. |
| New design section created | Create `design/{domain}/{IDENTIFIER}-{slug}.md`. Add row to DESIGN.md navigation table. |
| Parameter tuned (ADR-123) | Update `/lib/config.ts` with new value, rationale, and evaluation trigger. |
| Feature idea without an arc | Add PRO-NNN entry to PROPOSALS.md (Status: Proposed). Cross-reference governing ADRs if known. |
| Feature cut from an arc during development | Create PRO-NNN entry in PROPOSALS.md (Status: Suspended or Deferred) with original arc/milestone, cut reason, and re-evaluation target. Update ROADMAP.md § Unscheduled Features summary table. |
| ADR suspended (moved to unscheduled) | Create PRO-NNN in PROPOSALS.md (Status: Suspended from ADR-NNN). **Delete** ADR body from DECISIONS body file. Annotate DECISIONS.md index `(Suspended → PRO-NNN)`. Update ROADMAP.md § Unscheduled Features summary table. |
| README.md details change (ADR count, tech stack, arc structure, feature list) | Update README.md § Documentation list and § Architecture table |

At arc boundaries, reconcile all documents for consistency — personas, roles, workflows, directories, and cross-cutting concerns.

## Documentation–Code Transition

Once implementation begins, design files transition from "authoritative spec" to "architectural reference":

1. **Before code exists:** The design file is the source of truth. Follow it precisely.
2. **When a section is implemented:** Add `**Status: Implemented** — see [code path]` at the top of the file. Code becomes the source of truth for implementation details; the design file remains the architectural rationale. Stop loading the file routinely.
3. **When implementation diverges from design:** Update the design file to reflect the actual decision. Design files are living documents, not historical artifacts.

ADRs (in DECISIONS-core.md, DECISIONS-experience.md, DECISIONS-operations.md) are mutable living documents. Update them directly — add, revise, or replace content in place. Do not create superseding ADRs or use withdrawal ceremony. ADR numbers and ordering may be restructured for readability. Git history serves as the full audit trail.
