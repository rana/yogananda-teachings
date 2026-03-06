# SRF Online Teachings Portal — AI Context

## What This Project Is

A free, world-class online teachings portal for Self-Realization Fellowship (SRF) to make Paramahansa Yogananda's published books freely accessible worldwide, with an AI-powered intelligent search tool. Funded by a philanthropist. Launching late 2026.

**AI-human collaboration.** The AI is architect, designer, implementer, and operator; the human principal directs strategy, stakeholder decisions, and editorial judgment (PRI-12). The documentation volume is intentional — it serves as institutional memory across AI context windows. MCP servers are the primary operational interface. See CONTEXT.md § Project Methodology for the full collaboration model.

## Read These Files

1. **PRINCIPLES.md** — The 12 immutable commitments that define the project, with rationale. Always load this.
2. **CONTEXT.md** — Project background, mission, stakeholders, theological constraints, current state, open questions
3. **features/FEATURES.md** — Single index of all FTR files across 5 domains. Maps every feature to its file. Includes Always-Load FTRs list.
4. **features/foundation/** — Core identity, cross-cutting constraints, infrastructure, conventions (39 files)
5. **features/search/** — Search architecture, data model, ingestion, AI pipeline, taxonomy (31 files)
6. **features/experience/** — Frontend, pages, accessibility, responsive, multilingual (37 files)
7. **features/editorial/** — Staff tools, editorial workflows, content intelligence (23 files)
8. **features/operations/** — CI/CD, observability, testing, governance, operational tooling (29 files)
9. **ROADMAP.md** — 3 planned arcs (Foundation, Presence, Wisdom) with detailed milestones, plus Future Directions. Deliverables, success criteria, arc gates.

**Domain-gated reading.** Do not read front-to-back. Load what the task requires:
- **Always:** This file (CLAUDE.md) + PRINCIPLES.md + CONTEXT.md § Current State + ROADMAP.md § current arc/milestone + FEATURES.md § Always-Load FTRs (11 FTRs)
- **When implementing search/data/ingestion:** + `features/search/` files (or specific ones by identifier)
- **When implementing frontend/pages/UX:** + `features/experience/` files (specific ones by identifier)
- **When implementing editorial/staff/intelligence:** + `features/editorial/` files (specific ones by identifier)
- **When making decisions:** FEATURES.md index to locate the relevant domain, then load the FTR file
- **When evaluating proposals or at arc boundaries:** FTR files with state `proposed` or `deferred`
- **Arc 1 tasks primarily use:** `features/search/` + `features/foundation/` + `features/operations/` §§ FTR-088, FTR-012, FTR-094 (API conventions, governance — apply from Arc 1)
- **Arc 2 tasks primarily use:** `features/experience/`
- **Arc 3 tasks primarily use:** `features/editorial/` + `features/search/` (data platform)

## Ignore

- **scratch.md** — Personal scratchpad. Not project documentation. Do not read.

## Reference Documents (Background Research)

Located in `docs/reference/`:

- **overview-youtube.md** — Brother Chidananda's announcement of the portal (YouTube transcript)
- **SRF Teaching Portal Research & Design (Gemini 3 Pro).md** — Comprehensive theological, pedagogical, and technical analysis
- **SRF Tech Stack Brief-3.md** — SRF's established technology stack (AWS, Vercel, Contentful, Neon, Auth0, etc.). **Conformance note:** This document is prescriptive for SRF projects. When designing infrastructure, compare choices against this brief and document divergences with explicit justification. The portal adopted Secrets Manager (FTR-112) and OIDC (FTR-113) aligned with this standard; SSM Parameter Store deferred with documented rationale. See FTR-112 § "SSM Parameter Store — Deferred, Not Rejected."
- **RAG_Architecture_Proposal.md** — Comprehensive RAG architecture and feature proposal (Claude Web, Feb 2026). Merge-reviewed: FTR-025–FTR-026 and FTR-034–FTR-070 adopted; Features 10–11 omitted/constrained; stack divergences annotated.
- **Prioritizing Global Language Rollout.md** — Global language demographics, device/bandwidth analysis, and content rollout strategy (53 cited sources: Ethnologue, ITU, UNESCO, DataReportal, GSMA). Used as the data foundation for FTR-011 (Reachable Population prioritization framework). Some recommendations conflict with project decisions (payment infrastructure, SRF Lessons scope, language phasing) — see FTR-011 for what was adopted and what was set aside.

## Principles (Code-Affecting)

Twelve principles define the project's identity and directly constrain code generation. Changing any of these changes what the project is — they require full deliberation to modify. When principles tension, Content Identity takes precedence over Seeker Experience, which takes precedence over Engineering Foundation. Within each tier, principles are ordered by topic adjacency, not by weight — do not assume lower-numbered principles are less relevant. PRINCIPLES.md has the expanded rationale for each. Additional theological and ethical context (Content Honesty, Lessons Scope, Human Review Gate) is in CONTEXT.md § Theological and Ethical Constraints.

**Content Identity** — what this project is:
- **PRI-01: Verbatim Fidelity.** The AI is a librarian, not an oracle. It finds and ranks the verbatim published words of Yogananda and all SRF-published authors — it NEVER generates, paraphrases, or synthesizes content in any medium: text, voice, image, or video. AI generation, synthesis, or cloning of any media representing Yogananda or the lineage gurus is prohibited. The corpus spans three author tiers by role: guru (Yogananda, Sri Yukteswar), president (Daya Mata, Mrinalini Mata, Rajarsi), monastic (monastic speakers). All tiers receive verbatim fidelity. (FTR-001, FTR-005, FTR-008)
- **PRI-02: Full attribution always.** Every displayed passage carries full provenance: author, book, chapter, page. No orphaned quotes — every result links to its full chapter context. Full author name always displayed. When no official translation exists, the content is unavailable in that language — honest absence over synthetic substitution. When content is absent, guide constructively — honest absence as invitation, never a dead end. (FTR-058, FTR-135, FTR-123)
- **PRI-03: Honoring the Spirit of the Teachings.** Every interaction should amaze — and honor the spirit of the teachings it presents. The portal's execution quality should match the spiritual depth of its content — in every medium: color screens, grayscale, e-ink, print, screen readers, braille. A passage on a monochrome Kindle should feel as honored as one rendered in gold on cream. Before shipping any component, ask: "Is this worthy of presenting Yogananda's words?" Not just typography that renders text, but typography that honors its rhythm. Not just search that returns results, but search that feels curated. Restraint as excellence — the technology disappears and the teachings shine. (FTR-010, FTR-043 § Display Resilience)
- **PRI-04: Signpost, not destination.** The portal leads seekers toward practice — it never substitutes for it. Practice Bridge routes technique queries to SRF Lessons information. Crisis query detection provides safety interstitials. The AI never interprets meditation techniques or spiritual practices. (FTR-055, FTR-051, FTR-049)

**Seeker Experience** — who we serve and how:
- **PRI-05: Global-First.** Supports all humans of Earth equally — low-resourced and high-resourced peoples, low-resource phones with intermittent bandwidth and high-resource phones, tablets and desktops. A seeker in rural Bihar on 2G and a seeker in Los Angeles on fiber both get the complete experience. Progressive enhancement: HTML is the foundation, CSS enriches, JavaScript enhances. No feature gating behind connectivity. Core experiences degrade gracefully with intermittent or absent connectivity. Performance budgets enforce this. **Scope prioritization:** when scope must be ordered, the option serving more reachable people ships first (FTR-011). Spanish is Tier 1 activated in Arc 1; Hindi is Tier 1 deferred to Milestone 5b (authorized YSS source not yet available outside India). (FTR-006, FTR-011)
- **PRI-06: Multilingual from the foundation.** Every content table carries a `language` column from the first migration. Every content API accepts a `language` parameter. UI strings externalized, CSS uses logical properties, schema includes cross-language linking. Adding a new language should require zero schema migrations, zero API changes, and zero search rewrites. PRI-05's structural mechanism — global-first without multilingual foundations is aspiration without substance. (FTR-058, FTR-135)
- **PRI-07: Accessibility from first deployment.** WCAG 2.1 AA from the first component. Mobile-first responsive design from the first deployable page — ~70% of the Hindi/Spanish audience is mobile-first (FTR-011, FTR-006). Semantic HTML, ARIA landmarks, keyboard navigation, screen reader support, 44×44px touch targets, `prefers-reduced-motion`. Performance budgets: < 100KB JS, FCP < 1.5s. axe-core in CI — accessibility violations block merges. (FTR-003)
- **PRI-08: Calm Technology.** No push notifications, no autoplay, no engagement tracking, no gamification, no reading streaks, no time-pressure UI. The portal waits; it does not interrupt. Technology requires the smallest possible amount of attention. (FTR-042, FTR-002)
- **PRI-09: DELTA-compliant analytics.** No user identification, no session tracking, no behavioral profiling. Amplitude event allowlist only. Curation algorithms derive intelligence from the corpus, never from user behavior patterns — even anonymized. (FTR-082, FTR-085)

**Engineering Foundation** — how we build:
- **PRI-10: 10-year design horizon.** `/lib/services/` has zero framework imports — business logic survives a UI rewrite. Raw SQL migrations outlive every ORM. Standard protocols (REST, OAuth, SQL, HTTP) at every boundary. Tier 2 components (Next.js, Vercel, Contentful) are replaceable without touching Tier 1 (PostgreSQL, SQL, HTML). (FTR-004)
- **PRI-11: API-first architecture.** All business logic in `/lib/services/`. API routes use `/api/v1/` prefix. All routes public (no auth until Milestone 7a+). Cursor-based pagination. (FTR-015)
- **PRI-12: AI-Native Development and Operations.** The AI is architect, designer, implementer, and operator. The human principal directs strategy, stakeholder decisions, and editorial judgment. MCP servers are the primary operational interface — every managed service integral to routine operations requires MCP or equivalent API access. Operational surfaces are machine-parseable: structured JSON health, script-driven deployment, machine-readable manifests. Documentation is institutional memory across context windows — load-bearing infrastructure, not overhead. (FTR-093)

**Principle dependencies.** Several principles enable or enforce others — when implementing, the enabling principle constrains code even when the enabled principle is not directly relevant:
- PRI-06 enables PRI-05: multilingual schema is global-first's structural mechanism
- PRI-07 enables PRI-05: accessibility is global-first's inclusion mechanism
- PRI-02 enables PRI-01: attribution prevents orphaned quotes
- PRI-09 enforces PRI-08: DELTA analytics is calm technology's privacy layer
- PRI-12 enables PRI-10: AI-native ops is the 10-year horizon's operational mechanism

## Quick Reference

**Scope prioritization (FTR-011).** When two features or milestones are architecturally independent, the one serving more reachable people ships first. Metric: `speakers × internet_penetration × content_availability`. Apply this when facing feature-vs-feature or language-vs-feature tradeoffs. Spanish is Tier 1 (Arc 1); Hindi is Tier 1 (deferred to Milestone 5b — authorized YSS source unavailable outside India); Portuguese and Bengali are Tier 2; remaining 5 languages are Tier 3. Full demographic data and worked examples in FTR-011.

**Parameters as named constants (FTR-012).** Specific numeric values (chunk sizes, rate limits, thresholds) are tunable defaults, not architectural commitments. All parameters in `/lib/config.ts`. Each documents: value, rationale, evaluation trigger.

**Core stack:** Next.js on Vercel, Neon PostgreSQL 18 Scale tier + pgvector + pg_search/ParadeDB + pg_stat_statements (FTR-094), Contentful (Arc 1+, editorial source of truth; FTR-102), Claude via AWS Bedrock (index-time enrichment only — never in search hot path, never generates content; FTR-105, FTR-027), Voyage voyage-3-large (embeddings, FTR-024), Python + NetworkX graph batch pipeline (Milestone 3b+, FTR-034), Vercel KV/Upstash Redis (suggestions Milestone 2b+ if needed, FTR-029; Arc 1 uses static JSON at CDN edge + pg_trgm fuzzy fallback), fastText (language detection), dbmate migrations. Infrastructure managed by yogananda-platform MCP (FTR-106 revised); one-time AWS security via `bootstrap.sh`. Pure hybrid search (vector + BM25 + RRF) is the primary search mode — no AI in the search path. AI-enhanced search (HyDE, cross-encoder reranking) optional, conditional on evaluation (FTR-027). See FTR-014 for the full tech stack.

**Code layout:**
```
/lib/services/ — Business logic (framework-agnostic TypeScript)
/lib/config.ts — Named constants per FTR-012 (model IDs, chunk sizes, search params)
/lib/mcp/ — MCP server (unscheduled; FTR-098)
/lib/logger.ts — Structured JSON logging
/app/ — Next.js Server Components + Route Handlers
/app/api/v1/ — Versioned API routes
/migrations/ — Numbered SQL migrations (dbmate)
/terraform/bootstrap/ — IAM policy documents (referenced by bootstrap.sh; .tf files archived)
/lambda/ — AWS Lambda handlers (Milestone 3a+, FTR-107)
/messages/ — Locale JSON files (next-intl)
/scripts/ — Bootstrap, CI-agnostic deployment, and environment lifecycle scripts (FTR-108, FTR-110)
/.github/workflows/ — CI/CD pipelines (ci.yml, neon-branch.yml)
/features/ — FTR files by domain (foundation/, search/, experience/, editorial/, operations/)
/docs/guides/ — Human onboarding and setup (getting-started, credentials, manual steps)
/docs/operations/ — Operational runbooks and procedures (Milestone 3b+)
/docs/reference/ — Background research (not active project docs)
```

**Book cover images.** Stored as optimized WebP in `public/book-images/covers/{slug}.webp` (240px wide, ~15–25KB). Database `books.cover_image_url` stores the public path (e.g., `/book-images/covers/autobiography-of-a-yogi.webp`). English source: `data/book-ingest/autobiography-of-a-yogi/assets/front-cover.png`. Spanish source: Amazon product image (no local source asset). When adding a new book: resize source to 240px wide WebP, place in covers directory, UPDATE the database row. Display uses `height: 120px; width: auto` to preserve native aspect ratio without clipping.

**Design tokens:** Merriweather + Lora + Open Sans (Latin); Noto Serif Devanagari (Hindi reading) + Noto Sans Devanagari (Hindi UI/verses). Hindi body text at 20px / 1.9 line height (FTR-131). SRF Gold `#dcbd23`, SRF Navy `#1a2744`, Warm Cream `#FAF8F5`. Full palette in FTR-014 § Visual Identity.

**MCP servers (PRI-12: every managed service integral to routine operations requires MCP or equivalent API access):**
- **Neon Management** (now) — Claude's operations interface for Neon. Branch creation, SQL execution, schema diffs, connection strings, migration safety (`prepare_database_migration`/`complete_database_migration`). Used throughout development. See FTR-095 § Three-Layer Neon Management Model. Config: VS Code `mcp.json` (HTTP type, Bearer auth).
- **New Relic** (Arc 2+) — Observability MCP via `newrelic-mcp` npm package. NRQL queries, APM, alerts, deployments, synthetics. Config: VS Code `mcp.json` (stdio via npx). Env: `NEW_RELIC_API_KEY`, `NEW_RELIC_REGION`.
- **Auth0** (Milestone 7a+, provisioned now) — Identity and access management via official `@auth0/auth0-mcp-server` package. Tenant management, application CRUD, user management, role/permission management, log analysis, action management. Uses OAuth 2.0 Device Authorization Flow (credentials in system keychain, not config). Config: VS Code `mcp.json` (stdio via npx). Run `npx -y @auth0/auth0-mcp-server init` to authenticate.
- **Sentry** (Arc 1) — Error tracking and monitoring. Via Claude Code plugin.
- **Contentful** (Milestone 1a+) — CMS content management.
- **SRF Corpus** (unscheduled) — AI consumer access to search, themes, graph. Three-tier architecture for external AI systems. See FTR-083, ROADMAP.md § Unscheduled Features; FTR-098. Fundamentally different from Neon Management MCP — this serves AI consumers, not the AI operator.

## Identifier Conventions

**PRI-NN** (Principles) — The 12 immutable commitments in PRINCIPLES.md. Two-digit zero-padded (PRI-01 through PRI-12). PRI numbers are stable and append-only. Tier grouping (Content Identity PRI-01–04, Seeker Experience PRI-05–09, Engineering Foundation PRI-10–12) communicates precedence, not the number. Header format: `### PRI-NN: Title`.

**FTR-NNN** (Features) — The single unified identifier for all architectural decisions, design specifications, and proposals. Each FTR is one file in `features/{domain}/FTR-NNN-{slug}.md`. Five domains with number ranges: foundation (001–019, overflow 100–119), search (020–039, overflow 120–130), experience (040–059, overflow 131–147), editorial (060–079, overflow 148–150), operations (080–099, overflow 151–159). FTR numbers are stable identifiers — do not renumber. Header format: `# FTR-NNN: Title`. New FTRs append after the current max in their domain's overflow range.

**FTR lifecycle states:** `proposed` → `approved` → `implemented` | `deferred` | `declined`. Each FTR file has a metadata header with State, Domain, Arc, and Governed-by fields. The `approved (foundational)` variant marks project-identity features requiring full deliberation to change.

**FTR file anatomy:** `# FTR-NNN: Title` → metadata header → `## Rationale` (the "why") → `## Specification` (the "how") → `## Notes` (history, absorbed proposals). Every feature's rationale and specification live in one file — no dual-homing.

**M{arc}{milestone}-{deliverable}** (Milestone Deliverables) — Deliverables in ROADMAP.md use the `M` prefix for self-identifying cross-references. Pattern: `M1a-4` (Arc 1, Milestone a, deliverable 4). Milestones in prose use full form: "Milestone 1a"; deliverables use M-notation: "M1a-4".

When referencing identifiers in prose, use the prefix form: `PRI-01`, `FTR-023`, `M1a-4`. Zero-pad to the standard width (PRI: 2 digits, FTR: 3 digits).

**Cross-reference convention.** In prose, use bare identifiers: "See FTR-023", "per FTR-020", "PRI-01 governs". No file paths in prose — identifiers are stable across restructuring. Clickable links with file paths belong only in FEATURES.md index. File naming (`FTR-NNN-{slug}.md`) makes identifiers discoverable via glob: `**/FTR-023*` finds the file without consulting an index.

**Migration reference.** `features/MIGRATION.md` maps every old identifier (ADR-NNN, DES-NNN, PRO-NNN) to its FTR number. Consult this when encountering old identifiers in external references or git history.

## Project Skills

Six custom skills in `.claude/skills/`:

**Review skills** (read-only analysis, no file changes):
- **seeker-ux** — Reading and seeker experience review. Evaluates the reader's journey for accessibility, helpfulness, and spiritual uplift.
- **mission-align** — SRF mission alignment check. Assesses whether features and decisions serve the portal's spiritual purpose.
- **cultural-lens** — Cultural sensitivity review. Evaluates assumptions about language, geography, religion, and access.

**Feature management skills** (edit project documents with approval):
- **dedup-proposals** — Consolidate raw explorations from `.elmer/proposals/` into curated FTR entries. Without arguments: scans all explorations, reports variant clusters. With an FTR-NNN or filename: finds related explorations and synthesizes them.
- **proposal-merge** — Graduate a proposed FTR into precise edits across FEATURES.md, ROADMAP.md, and CONTEXT.md. Detects conflicts, updates FTR state, presents full plan for approval before executing.
- **theme-integrate** — Integrate a new content theme into taxonomy, terminology bridge, enrichment pipeline, knowledge graph, and worldview pathways. Generates all integration artifacts from an FTR or free-text description.

**Feature management workflow:** `/dedup-proposals` → `/proposal-merge <FTR-NNN>` or `/theme-integrate <FTR-NNN>` → run `coherence` skill to verify cross-document integrity.

**Explorations vs. features.** Raw files in `.elmer/proposals/` are unvetted AI explorations — not project documents. They feed into `/dedup-proposals`, which curates them into FTR files. Do not reference `.elmer/` explorations in project documents; reference FTR-NNN identifiers instead.

## Document Maintenance

Root documents (CLAUDE.md, PRINCIPLES.md, CONTEXT.md, ROADMAP.md) plus `features/FEATURES.md` index and ~159 FTR files in `features/` (foundation/, search/, experience/, editorial/, operations/). Keep them accurate as you work — drift compounds across sessions. (FTR-084)

| When this happens... | ...update these documents |
|----------------------|--------------------------|
| Principle added or revised | Update PRINCIPLES.md (expanded rationale) and CLAUDE.md § Principles (compressed form) |
| New decision or design | Create FTR file in `features/{domain}/FTR-NNN-{slug}.md`. Add row to FEATURES.md index. |
| Open question resolved | Add one-line entry to CONTEXT.md § Resolved Questions table (date, resolution, governing FTR ref). Remove inline `[x]` item from Open Questions. |
| Open question added | Add to CONTEXT.md § Open Questions (appropriate tier). Cross-reference from relevant FTR if applicable. |
| Arc/milestone deliverable changed | Update ROADMAP.md deliverable table/bullets and success criteria |
| Arc/milestone status changes | Update "Current State" section in CONTEXT.md |
| New technology adopted | Update the relevant FTR file (e.g., FTR-014 Architecture Overview) |
| New content type added | Update FTR-021 (Data Model), FTR-018 (Content Pipeline), ROADMAP.md. Also: FTR-035 KG checklist. |
| New API endpoint added | Follow FTR-015 § API Conventions (FTR-088). Paginated lists: `data`/`pagination`/`meta`; complete collections: `data`/`meta`; single resources: object directly. |
| FTR fully implemented | Set state to `implemented` in the FTR file metadata. Code becomes source of truth for details; FTR remains the architectural rationale. |
| Parameter tuned (FTR-012) | Update `/lib/config.ts` with new value, rationale, and evaluation trigger. |
| Feature idea without an arc | Create FTR file with state `proposed` in the appropriate domain. Add to FEATURES.md. |
| Feature deferred during development | Set FTR state to `deferred` with reason and re-evaluation target. Update ROADMAP.md § Unscheduled Features. |
| README.md details change | Update README.md § Documentation list and § Architecture table |

At arc boundaries, reconcile all documents for consistency — personas, roles, workflows, directories, and cross-cutting concerns.

## Documentation–Code Transition

Once implementation begins, FTR files transition from "authoritative spec" to "architectural reference":

1. **Before code exists:** The FTR file is the source of truth. Follow it precisely.
2. **When implemented:** Set state to `implemented` in the FTR metadata. Code becomes the source of truth for details; the FTR remains the architectural rationale. Stop loading the file routinely.
3. **When implementation diverges from design:** Update the FTR file to reflect the actual decision. FTR files are living documents, not historical artifacts.

FTR files are mutable living documents. Update them directly — add, revise, or replace content in place. Git history serves as the full audit trail.
