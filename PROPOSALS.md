# SRF Online Teachings Portal — Proposals

> **Purpose.** Registry and staging area for feature proposals, theme ideas, and architectural suggestions. Each curated proposal gets a permanent PRO-NNN identifier. Proposals graduate to ADR/DES sections or milestone deliverables through the graduation protocol. PRO-NNN identifiers persist as historical markers even after adoption — they are never renamed or reassigned.

> **Loading guidance.** Load this file when evaluating proposals, at arc boundaries, or when a PRO-NNN is cross-referenced. Not needed during implementation unless a specific PRO is referenced.

> **Relationship to explorations.** Raw exploration files in `.elmer/proposals/` are unvetted AI ideation — they are not project documents. The `/dedup-proposals` skill consolidates explorations into curated PRO-NNN entries in this file. See § Intake Protocol.

## Index

| PRO | Title | Type | Status | Governing Refs | Origin |
|-----|-------|------|--------|----------------|--------|
| PRO-001 | SRF Corpus MCP — Three-Tier Architecture | Feature | Validated | ADR-101, DES-031, ADR-097, ADR-011 | ADR-101 (descheduled 2026-02-24) |
| PRO-002 | SRF Lessons Integration | Feature | Validated | ADR-085, ADR-121 | Stakeholder vision |
| PRO-003 | Spoken Teachings — Human Narration Program | Feature (Content + Portal) | Proposed | ADR-003, ADR-073, ADR-015, PRO-029, PRO-043 | Accessibility vision |
| PRO-004 | Audio-Visual Ambiance Toggle | Enhancement | Proposed | ADR-065 | Unscheduled feature |
| PRO-005 | Neon Auth as Auth0 Alternative | Enhancement | Proposed | ADR-124 | Neon platform audit 2026-02-25 |
| PRO-006 | pg_cron for In-Database Scheduling | Enhancement | Proposed | ADR-124, ADR-017 | Neon platform audit 2026-02-25 |
| PRO-007 | Logical Replication for Analytics CDC | Feature | Proposed | ADR-124, ADR-095, ADR-099 | Neon platform audit 2026-02-25 |
| PRO-008 | Time Travel Queries for Production Debugging | Enhancement | Adopted → ADR-124, ADR-019, M1a-2 | ADR-019, ADR-124 | Neon platform audit 2026-02-25 |
| PRO-009 | Scientific-Spiritual Bridge Themes | Theme | Proposed | ADR-032, ADR-129, ADR-033, DES-048, DES-054, ADR-115 | Dedup 2026-02-25 (3 explorations) |
| PRO-010 | Word-Level Graph Navigation | Feature | Proposed | DES-055, ADR-117, ADR-116, ADR-049, ADR-050 | Dedup 2026-02-25 |
| PRO-011 | Proactive Editorial AI Agent | Enhancement | Proposed (subsumed by PRO-013 if adopted) | ADR-082, ADR-005, ADR-106, DES-052 | Dedup 2026-02-25 |
| PRO-012 | Copyright and Legal Framework | Policy | Validated | ADR-081, ADR-099, ADR-003, ADR-001 | Dedup 2026-02-25 (2 explorations) |
| PRO-013 | Internal Autonomous Agent Archetypes | Feature | Proposed | ADR-101, ADR-005, ADR-082, ADR-100, DES-031, DES-035, DES-048 | Exploration 2026-02-25 |
| PRO-014 | Multi-Author Sacred Text Expansion | Policy | Adopted | ADR-001, ADR-005, ADR-007, ADR-030, ADR-034, ADR-040, ADR-048, ADR-129, ADR-078, ADR-089, ADR-091, ADR-092, ADR-111, PRI-01, PRI-02, CONTEXT.md § Mission | Exploration 2026-02-25 |
| PRO-015 | AWS SES as SendGrid Alternative for Email Delivery | Enhancement | Proposed | ADR-091, ADR-099, ADR-016 | Stack divergence analysis 2026-02-26 |
| PRO-016 | Retool vs. Portal Admin for Staff Dashboards | Enhancement | Proposed | ADR-082, ADR-053, ADR-095 | Deep review 2026-02-26 |
| PRO-017 | Cloudflare Re-evaluation for SRF Domain Routing | Enhancement | Proposed | ADR-023, ADR-016 | Vendor drift analysis 2026-02-26 |
| PRO-018 | Four Doors — Recognition-Based Emotional Entry | Feature | Proposed | ADR-129, ADR-130 | External design review 2026-03-01 |
| PRO-019 | Multi-Lens Homepage — Recognition-First Portal Surface | Feature | Proposed | ADR-130, ADR-127 | External design review 2026-03-01 |
| PRO-020 | The Wanderer's Path — Depth-Weighted Passage Discovery | Feature | Proposed | ADR-130, ADR-002 | External design review 2026-03-01 |
| PRO-021 | Yogananda's Voice — Primary Source Audio Presence | Feature | Proposed | ADR-057, ADR-015, ADR-127 | External design review 2026-03-01 |
| PRO-022 | Passage Depth Signatures — Opus-Classified Contemplative Quality | Enhancement | Proposed | ADR-014, ADR-115, ADR-129 | External design review 2026-03-01 |
| PRO-023 | Human Review Gate — Production Content Governance | Policy | Proposed | ADR-005, ADR-032, ADR-078, ADR-092, ADR-082 | Principle analysis 2026-02-28 |
| PRO-024 | Editorial Page Compositor — Data-Driven Layout Curation | Feature | Proposed | ADR-130, ADR-082, ADR-079, ADR-095, DES-028 | Exploration 2026-02-28 |
| PRO-025 | Structural Enrichment Tier — Whole-Context AI Understanding for Navigation | Enhancement | Proposed | ADR-115, ADR-117, ADR-014, ADR-129, ADR-130, PRO-020, PRO-022 | Graph navigation exploration 2026-02-28 |
| PRO-026 | Semantic Cartography — Meaningful Spatial Navigation | Feature | Proposed | ADR-061, ADR-117, ADR-130, PRO-025 | Graph navigation exploration 2026-02-28 |
| PRO-027 | Design Tooling (Figma + Storybook) | Enhancement | Suspended from ADR-096, DES-040 | ADR-096 | ADR-096 suspension 2026-02-28 |
| PRO-028 | Cross-Tradition Concordance as Primary Search Lens | Feature | Proposed | ADR-129, ADR-130, ADR-050 | Stakeholder insight 2026-03-01 |
| PRO-029 | Cross-Media Intelligence — Video, Audio, Chant, Content Hub | Feature | Suspended from ADR-055–060 | ADR-055–060 | Bulk suspension 2026-03-01 |
| PRO-030 | Sacred Image Management — Watermarking and Multi-Size Serving | Feature | Suspended from ADR-063, ADR-064 | ADR-063, ADR-064 | Bulk suspension 2026-03-01 |
| PRO-031 | Study & Community Tools — Workspace, Collections, VLD | Feature | Suspended from ADR-083, ADR-086, ADR-087 | ADR-083, ADR-086, ADR-087 | Bulk suspension 2026-03-01 |
| PRO-032 | Brand Distribution — Dashboard, Email, Social Media | Feature | Suspended from ADR-090, ADR-091, ADR-092 | ADR-090, ADR-091, ADR-092 | Bulk suspension 2026-03-01 |
| PRO-033 | YSS Locale Branding | Feature | Subsumed → PRO-043 | ADR-079 | ADR-079 suspension 2026-03-01 |
| PRO-034 | Magazine API Rationalization | Enhancement | Suspended from ADR-108 | ADR-108 | Bulk suspension 2026-03-01 |
| PRO-035 | Release Tagging and Deployment Ceremony | Enhancement | Adopted → DES-060, M1a-11, M1c-17, M1c-18 | ADR-018, ADR-020, DES-039, ADR-105, DES-051, DES-060 | Ops exploration 2026-03-01 |
| PRO-036 | Operational Health Surface and SLI/SLO Framework | Feature | Adopted → DES-060, ADR-095 §SLI/SLO, M1a-10. `/ops` page → platform MCP | ADR-095, ADR-020, DES-039, ADR-021, DES-060 | Ops exploration 2026-03-01 |
| PRO-037 | Document Integrity Validation in CI | Enhancement | Adopted → DES-060, M1a-9 | ADR-098, ADR-094, ADR-093, DES-038, DES-060 | Ops exploration 2026-03-01 |
| PRO-038 | Dream a Feature — AI-Driven Prototyping Workflow | Feature | Proposed | ADR-020, ADR-124, PRO-001, DES-039 | Ops exploration 2026-03-01 |
| PRO-039 | Design-Artifact Traceability — Spec-to-Code-to-Deploy Linkage | Enhancement | Adopted → DES-060 §Layer 4, 2a | ADR-098, ADR-094, PRO-037, PRO-035, PRO-041, DES-060 | Ops exploration 2026-03-01 |
| PRO-040 | Living Golden Set — Seeker-Fed Search Quality | Enhancement | Proposed | DES-058, ADR-095, ADR-099, ADR-053 | Ops exploration 2026-03-01 |
| PRO-041 | Documents as Executable Specifications | Enhancement | Proposed | ADR-098, ADR-094, PRO-037 | Ops exploration 2026-03-01 |
| PRO-042 | Feature Lifecycle Portal — Calm Operations for Engineering Leadership | Feature | Proposed | PRO-038, PRO-036, DES-060, ADR-095, ADR-099, ADR-098, PRI-08 | Ops exploration 2026-03-01 |
| PRO-043 | Teachings Platform — Shared Foundation for SRF and YSS | Feature (Platform) | Proposed | ADR-075, ADR-077, ADR-078, ADR-128, ADR-011, ADR-079, PRO-034 | Strategic exploration 2026-03-01 |
| PRO-044 | Cross-Site Harmony — yogananda.org Ecosystem Integration | Feature (Experience) | Proposed | PRI-04, ADR-104, ADR-122, DES-029, DES-042, DES-054 | Ecosystem exploration 2026-03-02 |
| PRO-045 | Visual Design Language System — AI-First Design Tokens | Feature (Platform) | Proposed | PRI-03, PRI-07, PRI-08, PRI-10, PRI-12, ADR-065, ADR-080, PRO-043, PRO-044 | Design exploration 2026-03-02 |
| PRO-046 | Circadian as Independent Behavior Modifier | Enhancement (Experience) | Proposed | PRI-08, DES-011, PRO-045 | Design review 2026-03-03 |
| PRO-047 | Offline-First Sacred Reading — Proactive Chapter Download | Enhancement (Experience) | Proposed | PRI-05, ADR-073 | Explore-act analysis 2026-03-03 |
| PRO-048 | Platform Operations Dashboard — Batch Job Visibility | Feature (Platform) | Proposed | PRO-036, PRO-042, DES-060, ADR-095 | Greenfield UX session 2026-03-04 |
| PRO-049 | Parting Word — Contemplative Chapter Closure | Enhancement (Experience) | Deferred | PRI-01, PRI-02, PRI-08 | Greenfield UX session 2026-03-04 |
| PRO-050 | Unified Identifier System — FTR Replaces ADR + DES + PRO | Governance | Proposed | ADR-098, PRI-12, PRI-08 | Principal-directed exploration 2026-03-05 |

---

## Proposal Bodies

### PRO-001: SRF Corpus MCP — Three-Tier Architecture

**Status:** Validated — Awaiting Scheduling (ADR-101 body suspended 2026-03-01)
**Type:** Feature
**Governing Refs:** ADR-101 (suspended), DES-031, ADR-097, ADR-011
**Dependencies:** Tier 1 requires `/lib/services/` operational. Tier 2 requires Milestone 3b editorial portal. Tier 3 requires corpus complete (Milestone 3d+).
**Scheduling Notes:** Descheduled 2026-02-24 to focus on core delivery. Three tiers: Development (Claude Code corpus search), Internal (editorial AI workflows), External (third-party AI assistants with fidelity metadata). Service layer wrapping — no new business logic. Full architecture preserved in `design/search/DES-031-mcp-server-strategy.md`.
**Re-evaluate At:** Arc 3 boundary
**Decision Required From:** Architecture (self-assessment at arc boundary)

### PRO-002: SRF Lessons Integration

**Status:** Validated — Awaiting Scheduling (ADR-085 body suspended 2026-03-01)
**Type:** Feature
**Governing Refs:** ADR-085, ADR-121
**Dependencies:** Auth0 custom claims, `access_level` content model
**Scheduling Notes:** Not scheduled. SRF's decision. Architecture ready (content-level access control, separate reading experience, technique instructions always out of scope). May never happen.
**Re-evaluate At:** Stakeholder request
**Decision Required From:** SRF leadership

### PRO-003: Spoken Teachings — Human Narration Program

**Status:** Proposed
**Type:** Feature (Content Production + Portal Delivery)
**Governing Refs:** ADR-003, ADR-073, ADR-015, PRO-029 (cross-media/audio), PRO-043 (YSS partnership)
**Dependencies:** Passage display infrastructure (Milestone 2a) for portal delivery. Recording infrastructure and organizational commitment for content production. ADR-015 (Verbatim Media Fidelity) constrains: portal-initiated audio of Yogananda's words must use human-recorded narration — synthetic TTS is not permitted for sacred text. User-controlled assistive technology (browser screen readers, OS-level TTS) always permitted and unaffected.

**Scope.** This is a content production program with a technology delivery component, not a software feature with a recording component. The program has four layers:

1. **Yogananda's own voice.** SRF possesses archival recordings of Yogananda's lectures and talks. Where these overlap with published text, surfacing the Master's own voice is the most theologically pure and highest-impact first step — requiring digitization and alignment, not new recording. Governed by ADR-057/PRO-029.
2. **Human narration of published text.** New recordings by monastics or SRF/YSS-approved readers. SRF already produces audiobooks and monastic readings — this layer extends existing capability to serve the portal. Scope ranges from daily passages to full books. Each organization determines its own recording approach, narrator selection, and production workflow.
3. **Portal Listen mode.** The technology layer: audio player, text-audio alignment, streaming, offline support, low-bandwidth delivery. Designed multilingual from the foundation (PRI-06) — adding a new language's narration should require zero code changes.
4. **Distribution beyond the portal.** The recordings are the most expensive asset. Distribution should match: podcast feeds, YouTube, SRF/YSS app integration, WhatsApp-shareable audio, smart speakers. The portal player is one channel among several.

**Why this matters.** 771 million adults lack basic literacy (UNESCO 2022). 295 million have moderate-severe vision loss. Millions more are auditory learners, commuters, children, or elderly with declining vision. Beyond accessibility, spoken teachings restore the original medium — Yogananda's teaching tradition is oral. He recorded his own voice. Monastics read aloud in services. This program extends what already happens into digital reach.

**Minimum viable proof of concept.** A daily passage recording — one monastic reads one passage each day (~2-3 minutes). Distributed as a podcast. Tests recording workflow, listener reception, and organizational fit with minimal commitment. If the daily passage works, expand to chapters, then books.

**SRF and YSS considerations.** Both organizations have existing audio production experience, but may have different capabilities, priorities, and narrator pools. SRF and YSS should each evaluate independently what recording infrastructure they have, what they would need, and what narration scope makes sense for their communities. Hindi narration by YSS monastics intersects directly with PRO-043 (YSS partnership) — the same authorization conversation that could unblock Hindi text could also enable Hindi narration.

**Narration as seva.** In many spiritual traditions, reading sacred text aloud is itself devotional practice. If SRF frames recording as seva (selfless service), it may align naturally with monastic life rather than competing with existing duties. This is a question for the organizations, not the architecture.

**Open questions for SRF:**
- What existing audiobook and recording infrastructure does SRF have? (Mother Center studio, equipment, production workflow)
- Which existing audiobook productions could serve the portal? (Commercial audiobooks, CD catalog, retreat recordings)
- Would monastics find narration recording to be a natural extension of their service, or a burden?
- What recording locations are suitable? (Mother Center, Encinitas, Hidden Valley — each has different noise environments and monastic populations)
- Would SRF consider professional narrators vetted and approved by the order?
- What is the preferred first step: daily passage podcast, key chapters, or full book?

**Open questions for YSS:**
- What audio production capability exists at YSS ashrams? (Ranchi, Dakshineswar)
- Are there YSS monastics interested in Hindi/Bengali narration?
- Does YSS have different recording needs? (Climate considerations, equipment sourcing in India, power stability)
- How does YSS's organizational structure handle content production decisions?

**Open questions for both:**
- Should narrator identity be disclosed? ("Read by Brother/Sister [Name]" or anonymous?)
- Gender-choice narration: essential from the start, or a later enhancement?
- How should narration quality be reviewed and approved?
- What is the relationship between portal narration and commercial audiobook distribution?
- Could the philanthropist's funding support recording infrastructure and/or a dedicated narrator role?

**Re-evaluate At:** Arc 2 boundary — or earlier if organizational conversations surface readiness
**Decision Required From:** SRF editorial + SRF/YSS leadership (organizational commitment) + Architecture (portal delivery)
**Related Explorations:** `book-read-to-me-mode-toggle-displayed-next-to-book-text.md` (archived)

### PRO-004: Audio-Visual Ambiance Toggle

**Status:** Proposed
**Type:** Enhancement
**Governing Refs:** ADR-065
**Dependencies:** None architectural. Content dependency: curated ambient audio assets.
**Scheduling Notes:** Listed in ROADMAP.md § Unscheduled Features. Optional temple bells or nature sounds during reading. Must respect Calm Technology principles — never autoplay, never default-on, never attention-seeking. Evaluated and deferred as non-essential to the core reading experience. Risk of trivializing the portal's contemplative register if poorly executed.
**Re-evaluate At:** Post-Arc 3 (after core experience is mature)
**Decision Required From:** Editorial + UX review

### PRO-005: Neon Auth as Auth0 Alternative

**Status:** Proposed
**Type:** Enhancement
**Governing Refs:** ADR-124
**Dependencies:** Milestone 7a (accounts). No auth until then.
**Scheduling Notes:** The portal architecture uses Auth0 for optional authentication (Milestone 7a+). Neon Auth (managed Better Auth) is now GA with 60K MAU free (Scale tier), branch-aware auth state, and native Row-Level Security integration. Branch-aware auth means PR preview deployments get isolated auth environments automatically — no Auth0 tenant management needed for previews. Evaluate when Milestone 7a scoping begins.
**Re-evaluate At:** Milestone 7a scoping
**Decision Required From:** Architecture

### PRO-006: pg_cron for In-Database Scheduling

**Status:** Proposed
**Type:** Enhancement
**Governing Refs:** ADR-124, ADR-017
**Dependencies:** Always-on production compute (production autosuspend ≥ 300s per ADR-124). `pg_cron` only fires when compute is active.
**Scheduling Notes:** Several operations could benefit from in-database scheduling: stale suggestion cache cleanup, embedding deprecation (90-day window per ADR-046), `pg_stat_statements` periodic snapshots to a metrics table, daily passage rotation. Currently these require external cron (Lambda via EventBridge or Vercel Cron Jobs). `pg_cron` runs inside Postgres — simpler, no cold starts, no infrastructure. Trade-off: couples scheduling to the database; Lambda/Vercel cron is more portable. Evaluate when production compute is always-on.
**Re-evaluate At:** Milestone 3a (when Lambda infrastructure ships, ADR-017)
**Decision Required From:** Architecture

### PRO-007: Logical Replication for Analytics CDC

**Status:** Proposed
**Type:** Feature
**Governing Refs:** ADR-124, ADR-095, ADR-099
**Dependencies:** Scale tier (already selected). Analytics destination (ClickHouse, Snowflake, or similar).
**Scheduling Notes:** Neon supports outbound logical replication to analytics platforms (ClickHouse via PeerDB, Kafka, Snowflake, Fivetran, etc.). If SRF wants analytics beyond DELTA-compliant Amplitude events — e.g., content engagement patterns, search quality trends over time, corpus health metrics — logical replication provides real-time CDC without application-layer ETL. Must remain DELTA-compliant: replicate content and aggregate metrics only, never user-identifying data.
**Re-evaluate At:** Arc 3 boundary (when editorial operations generate analytics needs)
**Decision Required From:** Architecture + DELTA compliance review

### PRO-008: Time Travel Queries for Production Debugging

**Status:** Adopted → ADR-124, ADR-019, M1a-2
**Type:** Enhancement
**Governing Refs:** ADR-019, ADR-124
**Dependencies:** Scale tier (30-day PITR window). Already available.
**Scheduling Notes:** Neon Time Travel Queries allow read-only SQL against any historical database state within the PITR window. Uses ephemeral 0.5 CU computes that auto-delete after 30s idle. Use cases: "what did this chunk's embedding look like before re-ingestion?", "when did this theme tag change?", "what was the search_queries table 2 hours ago?". No restore needed — just reads. Already available on Scale tier.
**Resolution (2026-02-26):** Accepted as a Milestone 1a development tool. Zero implementation cost — already available on Scale tier. Time Travel is available via Neon MCP `run_sql` with `AT {timestamp}` syntax, or via direct SQL connection with `neon_utils.ttq()`. Referenced in ADR-019 Layer 1 (PITR) and M1a-2. Documented in DES-039 § Three-Layer Neon Management Model as an Operations-layer capability.

### PRO-009: Scientific-Spiritual Bridge Themes

**Status:** Proposed
**Type:** Theme
**Governing Refs:** ADR-032, ADR-129, ADR-033, DES-048, DES-054, ADR-115
**Dependencies:** Teaching topics taxonomy (ADR-032) and Vocabulary Bridge (ADR-129) operational. Enrichment pipeline (ADR-115) running.
**Scheduling Notes:** Consolidates three explorations proposing thematic entry points for currently under-served seeker populations. Three themes: (1) **Cosmic Life** — Yogananda's teachings on extraterrestrial life, astral worlds, and cosmic consciousness. Maps "extraterrestrial" → "astral beings," "alien life" → "cosmic consciousness." (2) **Self-Worth, Abundance, and Prosperity Consciousness** — teachings on divine supply, worthiness, and overcoming scarcity mentality. Serves seekers arriving from self-help, entrepreneurial, or therapeutic contexts. (3) **Vibration, AUM, and Scientific Parallels** — bridges quantum physics vocabulary to Yogananda's vibration teachings. Maps "quantum field" → "cosmic vibration," "wave-particle duality" → "maya." All three require terminology bridge entries, enrichment pipeline markers, and knowledge graph edges. Each independently reaches new seeker populations. Graduation path: `/theme-integrate` for each theme.
**Re-evaluate At:** Arc 2 boundary (when taxonomy and enrichment pipeline are validated)
**Decision Required From:** Editorial + theological review (do these themes accurately represent Yogananda's teachings?)
**Source Explorations:** `theme-for-extra-solar-life-in-the-cosmos-what-do-the-gurus-2.md`, `theme-self-worth-abundance-scientific-view.md`, `vibration-aum-holy-ghost-quantum-physics-overlap-for-2.md`

### PRO-010: Word-Level Graph Navigation

**Status:** Proposed
**Type:** Feature
**Governing Refs:** DES-055, ADR-117, ADR-116, ADR-049, ADR-050
**Dependencies:** Knowledge graph infrastructure (ADR-117) and entity registry (ADR-116) operational. Concept/Word Graph (DES-055) is the parent design section.
**Scheduling Notes:** Enhances DES-055 with fine-grained word-level graph enabling linguistic exploration of Yogananda's vocabulary through co-occurrence, synonymy, and contextual relationships. Word nodes with PMI-weighted co-occurrence edges let seekers traverse from "magnetism" to "attunement" to "vibration" through the corpus's actual usage patterns. Complements the entity-focused knowledge graph (DES-054) with a linguistic lens. Builds on existing Postgres-native graph infrastructure (ADR-117) — no additional database technology needed.
**Re-evaluate At:** Milestone 3c (when cross-book intelligence ships)
**Decision Required From:** Architecture
**Source Explorations:** `word-graph-similar-to-knowledge-graph-graph-traversal-of.md`

### PRO-011: Proactive Editorial AI Agent

**Status:** Proposed
**Type:** Enhancement
**Governing Refs:** ADR-082, ADR-005, ADR-106, DES-052
**Dependencies:** Editorial portal (Milestone 3b), outbound webhook infrastructure (DES-052), Lambda infrastructure (ADR-017).
**Scheduling Notes:** Transforms the Milestone 3b editorial workflow from pull-based (editors visit queues) to push-based (AI generates proposals delivered via email/Teams/Slack with one-click approval). Claude autonomously generates theme tag suggestions, daily passage selections, editorial thread drafts, and calendar content recommendations. Each suggestion includes context and rationale. Maintains the sacred human review gate (ADR-005) — AI proposes, humans approve. Reduces editorial cognitive load while preserving fidelity controls. Requires Lambda-based agent service and multi-channel delivery infrastructure.
**Re-evaluate At:** Milestone 3b (when editorial portal ships)
**Decision Required From:** Architecture + editorial workflow review
**Source Explorations:** `proactive-ai-agent-further-ai-automation-of-editorial.md`
**Note:** Subsumed by PRO-013 (Internal Autonomous Agent Archetypes) as the "Editorial" trust profile. If PRO-013 is adopted, this proposal merges into it rather than graduating independently.

### PRO-012: Copyright and Legal Framework

**Status:** Validated — Milestone 1c Prerequisite
**Type:** Policy
**Governing Refs:** ADR-081, ADR-099, ADR-003, ADR-001
**Dependencies:** None architectural. Requires SRF legal counsel review before implementation.
**Scheduling Notes:** Milestone 1c prerequisite — the copyright communication layer must ship before public deployment. The portal's full crawlability posture (ADR-081, CONTEXT.md Resolved Question #15) requires explicit, multi-layered copyright communication so openness is paired with clear terms. Two concerns: (1) **Copyright communication** — establish multi-layered messaging (legal pages, JSON endpoints, HTTP headers, `llms.txt` copyright section) that signals SRF retains all rights while welcoming citation, reference, and AI training. Treat "freely available" as a theological stance, not legal status. The library model: freely accessible for reading, reference, and citation while remaining under copyright. (2) **Legal liability audit** — 12 categories of risk identified: copyright authorization, content licensing, accessibility compliance, crisis resource liability, AI system transparency, volunteer agreements, international data handling, terms of service, and more. Pre-implementation legal review recommended for categories 1–4 (copyright, licensing, accessibility, crisis). Remaining categories can be addressed incrementally. Principle-check: the portal's generous accessibility posture aligns with SRF's mission of making teachings available worldwide — copyright retention and open access are not contradictory. Validated 2026-02-25: architectural review confirms alignment with ADR-081 full crawlability, Global-First (PRI-05), and accessibility (PRI-07). The No Content Gating policy (ADR-081 §3a) establishes that content gating is architecturally prohibited, making the copyright communication layer the correct mechanism for rights assertion — not technology walls.
**Re-evaluate At:** Milestone 1c (before public deployment)
**Decision Required From:** SRF legal counsel + architecture
**Source Explorations:** `clarify-copyright-stance-srf-makes-it-feel-available-to-all.md`, `what-are-the-legal-liabilities-if-any.md`

*Validated: 2026-02-25, architectural review and principle-check passed. Full crawlability confirmed as mission-aligned.*

### PRO-013: Internal Autonomous Agent Archetypes

**Status:** Proposed
**Type:** Feature
**Governing Refs:** ADR-101, ADR-005, ADR-082, ADR-100, DES-031, DES-035, DES-048
**Dependencies:** Tier 2 MCP server (PRO-001) operational. `/lib/services/` layer complete for target content types. Editorial review infrastructure (Milestone 3b) for agent-proposed content.
**Scheduling Notes:** The MCP Corpus server can serve autonomous AI agents working on behalf of SRF's internal stakeholders: monastics, correspondence staff, magazine editors, center leaders, and operational systems. Nine agent archetypes identified: Devotee Correspondence, Magazine Editorial, Content Integrity Watchdog, Translation QA, Center Leader Support, Seeker Trend Intelligence, Social Media Calendar, Knowledge Graph Curator, and Corpus Onboarding.

**Core idea.** One Librarian, many modes. The 9 archetypes are *modes* of a single Corpus Librarian (ADR-089) with role-scoped access — not 9 separate systems. Architecturally: one service layer with role-based API scoping. Four trust profiles: Research (read-only), Editorial (proposes to review queues), Operational (integrity monitoring, alert/quarantine), Intelligence (aggregated analytics, proposes structural changes).

**Governing principle.** Every agent is a librarian — finds, verifies, and surfaces the Master's words. No agent generates, interprets, or teaches (ADR-001, ADR-005). AI proposes, humans approve for all editorial agents (ADR-100). Every agent respects the technique boundary (PRI-04, ADR-104).

**Subsumes PRO-011** (Proactive Editorial AI Agent) as the "Editorial" trust profile.

*Implementation detail (quarantine model, event taxonomy, agent persona, cross-property potential, MCP tool mappings) preserved in `.elmer/proposals/archived/` and would move to DESIGN files on adoption.*

**Re-evaluate At:** Arc 3 boundary (when Tier 2 MCP scheduling is re-evaluated per PRO-001)
**Decision Required From:** Architecture + SRF stakeholder input on organizational needs

### PRO-014: Multi-Author Sacred Text Expansion

**Status:** Adopted — Document cascade merged 2026-02-25.
**Type:** Policy
**Governing Refs:** ADR-001, ADR-005, ADR-007, ADR-030, ADR-034, ADR-040, ADR-048, ADR-129, ADR-078, ADR-089, ADR-091, ADR-092, ADR-111

**Summary.** Expanded corpus scope from "Yogananda's published books" to "all SRF/YSS-published books" with a three-tier author hierarchy by role: guru (Yogananda, Sri Yukteswar), president (Daya Mata, Mrinalini Mata, Rajarsi Janakananda), monastic (monastic speakers). All tiers receive verbatim fidelity, no AI synthesis, no machine translation. Tiers govern search inclusion, daily passage pool, and social media pool. Both blocking stakeholder decisions resolved 2026-02-25: theological hierarchy confirmed, endowment scope confirmed. *Tier values renamed 2026-02-26 from sacred/authorized/commentary to guru/president/monastic — role-based naming avoids value judgments about authors' spiritual stature. Column renamed 2026-02-28 from `content_tier` to `author_tier` — the tier classifies the author's lineage role, not the content.*

**Document cascade applied to:** PRI-01, PRI-02, CLAUDE.md §1–2, CONTEXT.md §§ Mission/In Scope, ADR-001, ADR-005, ADR-007, ADR-030, ADR-039, ADR-048, ADR-129, ADR-078, ADR-089, ADR-091, ADR-092, ADR-111, DESIGN.md search/daily-passage APIs, DES-004 books schema (`author_tier` column, `author` DEFAULT removed).

**Remaining for Milestone 3a:** Non-Yogananda book catalog requires SRF confirmation. Author-specific chunking parameters (ADR-048) need empirical calibration when *The Holy Science* enters the pipeline.

*Adopted: 2026-02-25. Validated: 2026-02-25. Full exploration detail preserved in `.elmer/proposals/archived/`.*

### PRO-015: AWS SES as SendGrid Alternative for Email Delivery

**Status:** Proposed
**Type:** Enhancement
**Governing Refs:** ADR-091, ADR-099, ADR-016
**Dependencies:** Milestone 5a (daily email feature). No email infrastructure needed before then.
**Scheduling Notes:** Evaluate at Milestone 5a scoping. The portal currently specifies SendGrid (aligned with SRF Tech Stack Brief § Specialized Services). This proposal evaluates AWS SES as an alternative that may better serve the portal's specific constraints.

#### Context

ADR-091 specifies the Daily Email feature (Milestone 5a): one verbatim passage from Yogananda's published works, delivered daily to subscribers. The portal's email use case is narrow — a single passage with author/book/chapter citation, one link to the portal reading experience, no marketing automation, no templates, no campaigns. SRF's standard is SendGrid (Tech Stack Brief § Specialized Services: "Transactional email delivery, email templates designed in Stripo").

The question: does the portal's minimal, DELTA-constrained email use case justify staying with SendGrid, or does AWS SES serve it better?

#### For SES (the case for divergence)

1. **Already in the AWS footprint.** The portal uses S3, Bedrock, Lambda, EventBridge — all AWS. SES adds no new vendor, no new account, no new billing relationship. Platform MCP manages it alongside everything else (ADR-016).
2. **Cost.** SES: $0.10/1,000 emails, no monthly minimum. SendGrid free tier: 100 emails/day; paid starts at $19.95/month for 50K emails. At portal scale (estimated 5K–50K daily subscribers by Arc 5), SES costs $0.50–$5/day. SendGrid costs $19.95+/month.
3. **DELTA simplicity.** SES has no built-in engagement tracking by default — open/click tracking must be explicitly enabled via configuration sets. SendGrid enables open/click tracking by default and requires active configuration to disable it (Tracking Settings API or per-message headers). For a DELTA-compliant system that must never track engagement, the "off by default" posture is safer.
4. **No feature waste.** SendGrid's value is in templates (Stripo), A/B testing, marketing campaigns, contact management, engagement analytics. The portal uses none of these. The daily email is a Lambda function that renders one HTML passage and calls an email API.
5. **AWS-native.** `aws_ses_domain_identity`, `aws_ses_configuration_set` — first-class AWS resources manageable via Platform MCP. No separate provider or third-party integration needed.
6. **OIDC authentication.** Lambda already authenticates to AWS via OIDC (ADR-016). SES requires no additional API key — the Lambda execution role gets `ses:SendEmail` permission. SendGrid requires a separate API key stored as a secret.

#### Against SES (the case for alignment)

1. **SRF standard.** SendGrid is the established email provider (Tech Stack Brief § Specialized Services). SRF's AE team has SendGrid expertise, existing accounts, established deliverability reputation, and operational procedures. Diverging adds another "why is the portal different?" conversation.
2. **Deliverability bootstrapping.** SES requires warming a new sending domain — starting at low volume and gradually increasing over weeks. SendGrid's shared IP pools and established reputation provide good deliverability immediately. A new SES domain sending 50K emails on day one risks spam classification.
3. **Bounce/complaint handling.** SendGrid has mature bounce management, suppression lists, and automatic unsubscribe handling built in. SES requires building these with SNS topics, Lambda handlers, and a suppression list in the database — more code to write and maintain.
4. **SendGrid's free tier may suffice.** 100 emails/day (free) covers development and early testing. The Essentials plan ($19.95/month for 50K) covers the portal's likely volume through Arc 5. The cost difference is real but small relative to total infrastructure spend.
5. **Operational handoff.** When the portal transitions to SRF operations (Arc 6+), SendGrid means the operations team is on familiar ground. SES means training on a different email system — even if it's simpler.
6. **Avoid Redundancy principle.** Tech Stack Brief § Guiding Principle #7: "Where a standard has already been established in SRF, utilize that rather than introducing something new which overlaps."

#### Through (the synthesis)

The portal's email use case is genuinely different from SRF's typical transactional email: no templates, no marketing, no engagement tracking, one message type. This is the same pattern as DynamoDB → PostgreSQL (ADR-013) and Serverless Framework → Platform MCP (ADR-017) — the SRF standard serves the general case well, but the portal's specific constraints favor a different choice.

However, the cost savings are modest ($15–20/month), and the deliverability bootstrapping and bounce handling costs (developer time) may exceed the savings. The strongest SES argument is DELTA purity (tracking off by default); the strongest SendGrid argument is operational alignment.

**Recommendation:** Start with SendGrid (aligned, zero bootstrapping, immediate deliverability). If Milestone 5a implementation reveals that DELTA-compliant SendGrid configuration is fragile — if tracking keeps re-enabling after updates, or if the suppression of engagement analytics requires ongoing vigilance — revisit SES as a cleaner foundation. The migration path is straightforward: swap the API call in one Lambda function.

**Re-evaluate At:** Milestone 5a scoping (daily email implementation)
**Decision Required From:** Architecture + SRF AE team input (do they prefer portal on their SendGrid account or a separate email system?)

### PRO-016: Retool vs. Portal Admin for Staff Dashboards

**Status:** Proposed
**Type:** Enhancement
**Governing Refs:** ADR-082, ADR-053, ADR-095
**Dependencies:** Milestone 3b (editorial portal `/admin`), Milestone 3d (analytics dashboard)
**Scheduling Notes:** Evaluate at Milestone 3d scoping. The question is whether the analytics/reporting dashboard (Milestone 3d.4 "What Is Humanity Seeking?" admin view, standing operational metrics from DES-037) should use Retool or be built into the portal's own `/admin` route group.

#### Context

Two staff-facing interfaces appear in the architecture:

1. **Portal `/admin`** (M3b-5a/b) — Auth0-protected Next.js route group for editorial workflows: theme tag review, daily passage curation, calendar management, queue health, ingestion QA. Built with the portal's calm design system.

2. **Retool** — Referenced in the production architecture diagram (DESIGN.md), Milestone 3d.4, and DES-037 standing operational metrics. Implied use: analytics dashboards, search trend visualization, operational metrics.

The relationship between these is undefined. Do they coexist (editorial in `/admin`, analytics in Retool)? Does one subsume the other?

#### For Retool (separate analytics tool)

1. **Build vs. buy.** Analytics dashboards (charts, time series, geographic heatmaps) are what Retool excels at. Building equivalent visualizations in Next.js is feasible but slower.
2. **Iteration speed.** Staff can modify Retool dashboards without code deploys. Useful for evolving the "What Is Humanity Seeking?" views.
3. **SRF familiarity.** If SRF already uses Retool across other properties, operational handoff is easier.

#### Against Retool (build into portal admin)

1. **One fewer vendor.** Retool is a Tier 2 dependency. The 10-year horizon (ADR-004) favors fewer external dependencies.
2. **Design coherence.** Staff tools built in the portal's own design system maintain the calm technology aesthetic end-to-end.
3. **No additional authentication surface.** Everything in Auth0, one admin route group.
4. **Cost.** Retool has per-user pricing that may not be justified for 3–5 staff users.

#### Recommendation

Defer the decision. Build Milestone 3b editorial portal in `/admin`. At Milestone 3d scoping, evaluate whether the analytics visualization needs justify Retool or whether lightweight charting (e.g., Recharts) within `/admin` suffices. Remove Retool from the production architecture diagram until a decision is made — its presence implies an adopted choice that hasn't occurred.

**Re-evaluate At:** Milestone 3d scoping
**Decision Required From:** Architecture + SRF AE team (is Retool already in their stack?)

### PRO-017: Cloudflare Re-evaluation for SRF Domain Routing

**Status:** Proposed
**Type:** Enhancement
**Governing Refs:** ADR-023, ADR-016
**Dependencies:** Domain assignment for the portal. SRF decision on DNS routing.
**Scheduling Notes:** The portal's production architecture previously included Cloudflare (CDN, WAF, rate limiting) as a portal-managed infrastructure dependency. Analysis (2026-02-26) determined that Vercel Pro provides equivalent capabilities natively — Firewall Rules, DDoS protection, bot detection, CDN — making Cloudflare a redundant layer that adds double-CDN complexity without unique value.

**Current posture:** Cloudflare removed from portal infrastructure. Rate limiting (ADR-023) redesigned to use Vercel Firewall at the edge layer. All documents updated.

**Re-evaluate if:** SRF routes the portal's domain through Cloudflare as part of their organization-wide DNS/CDN strategy (SRF uses Cloudflare across other properties). In that case, the portal is fully compatible — Cloudflare would sit in front of Vercel transparently. The question then becomes whether to leverage Cloudflare's WAF rules *in addition to* Vercel Firewall, or let Vercel handle security alone. If Cloudflare is added, add a Cloudflare service layer to Platform MCP for DNS records and WAF rules.

**What Vercel covers without Cloudflare:**
- Firewall Rules (IP-based rate limiting, path-based rules)
- DDoS mitigation (automatic, all plans)
- Bot protection (Pro tier)
- Global CDN with edge caching
- Edge Middleware for custom security logic

**What Cloudflare would add (if present):**
- Broader IP reputation database
- More granular WAF rule language (Cloudflare Rules)
- Workers for edge compute (redundant with Vercel Edge Functions)
- Cloudflare Analytics (redundant with Vercel Analytics)

**Re-evaluate At:** When portal domain is assigned, or if SRF indicates Cloudflare is required for organizational DNS routing
**Decision Required From:** Architecture + SRF AE team (does SRF route all properties through Cloudflare?)

---

### PRO-018: Four Doors — Recognition-Based Emotional Entry

**Status:** Proposed
**Type:** Feature
**Governing Refs:** ADR-129 (Vocabulary Bridge), ADR-130 (Recognition-First IA)
**Target:** Arc 2a (requires Vocabulary Bridge Layers 1+3, visual identity system)
**Dependencies:** Vocabulary Bridge (ADR-129) for semantic depth — without the bridge, the doors are cosmetic labels over generic search. DES-006 (Frontend Design) for visual system.
**Scheduling Notes:** Four recognition-based entry points for seekers arriving with an emotional state rather than a query: "I am searching" (curiosity, wonder), "I am struggling" (fear, grief, loss), "I want to understand" (the student, the scholar), "I want to practice" (ready to move from reading to doing). Not the primary homepage architecture — one lens among several in the multi-lens homepage (PRO-019). Lives in secondary navigation.

**Why four?** Four can be held in working memory. Four covers the actual range without over-specifying. The existing six themes (Peace, Courage, Healing, Joy, Purpose, Love) are beautiful but assume the seeker already maps themselves to tradition vocabulary. "I am struggling" requires no such self-knowledge. The four doors are recognitions; the six themes become their children via the vocabulary bridge.

**Inside each door:** Not immediate retrieval. The vocabulary bridge activates. "I am struggling" opens to a gentle second level of recognition ("You might be feeling... Loss and grief / Fear and anxiety / Loneliness / Doubt and confusion"). These are not filters — they are recognitions. The bridge maps each sub-state to corpus territory with retrieval intent (meet_first, console) and avoid-territory (no discipline passages for someone grieving).

**"I want to practice" — the Practice Bridge door.** The most delicate. Explicitly not about reading. Acknowledges the seeker's readiness to move. Leads to Yogananda's own published words about meditation and the path, followed by the quiet signpost to SRF Lessons and local centers. PRI-04 (Signpost, Not Destination) becomes architecture.

**Origin:** External design review (docs/reference/Claude-Teachings-Portal-Suggestions.md, 2026-03-01)

**Current state (2026-03-04):** A lightweight "seeking paths" implementation exists on the homepage — four italic whispered links ("for when the world is too much", etc.) completing the phrase "These teachings are here..." Format and CSS are solid (italic serif, hover-reveal gold border). Copy needs human voice — three AI iterations approached but didn't land. Deferred: the copy requires the Vocabulary Bridge (ADR-129) to be genuinely recognition-based rather than cosmetic self-help language. Without the bridge, the doors are labels over generic search queries.

---

### PRO-019: Multi-Lens Homepage — Recognition-First Portal Surface

**Status:** Proposed
**Type:** Feature
**Governing Refs:** ADR-130 (Recognition-First IA), ADR-127 (Experience Quality)
**Target:** Arc 2a (full implementation). 1c embodies the principle minimally.
**Dependencies:** Vocabulary Bridge (ADR-129) for meaningful entry points. DES-006 for visual system. DES-007 (Opening Moment) updated to reference recognition-first principle.
**Scheduling Notes:** The homepage holds multiple entry lenses without hierarchy. A returning devotee and a first-time visitor and someone at 2 AM all find their natural entry.

**Homepage structure (Arc 2a):**
```
Today's Wisdom — the portal speaking first
  [passage, possibly Yogananda's voice, full presence]

──────────────────────────────────────
Four entry points, equal weight:

  What did Yogananda          Take me somewhere
  say about...?               [The Wanderer — PRO-020]
  [completes to search]

  I come from...              A question I'm holding
  [Tradition entry]           [Great Questions]

──────────────────────────────────────
[ Search — always visible, never primary ]

──────────────────────────────────────
Secondary nav: Books   Audio   The Four Doors   Guide   About
```

**1c minimal embodiment:** Today's Wisdom hero + "What did Yogananda say about...?" search prompt + "Show me another" + minimal secondary nav (Books | About) + Practice Bridge quiet line.

**Origin:** External design review (docs/reference/Claude-Teachings-Portal-Suggestions.md, 2026-03-01)

---

### PRO-020: The Wanderer's Path — Depth-Weighted Passage Discovery

**Status:** Proposed
**Type:** Feature
**Governing Refs:** ADR-130 (Recognition-First IA), ADR-002 (DELTA)
**Target:** Milestone 2b (requires passage depth signatures from enrichment pipeline)
**Dependencies:** Passage depth signatures (Opus-generated classification of each passage as bottomless/informational/catalytic/consoling). localStorage for seen-passage non-repetition.
**Scheduling Notes:** "Take me somewhere." A single quiet offering. The portal selects a passage using depth signatures — weighted toward bottomless passages, avoiding repetition — and presents it with full context. No parameters, no category, no state required.

This is a practice many devotees already have: opening a beloved book to a random page. The portal embodies it digitally. Selection feels serendipitous; it is actually weighted by depth signatures and bridge wisdom.

**The Personal Corpus:** Browser-local memory of which passages have been seen (list of chunk IDs in localStorage). The Wanderer's Path never returns to the same place twice. Today's Wisdom can optionally use the same mechanism — your Today's Wisdom, which has never shown you this passage before. The corpus has thousands of passages; a devotee could use this daily for years without repeating. DELTA-compliant: nothing stored on a server, no account, no tracking.

**Relationship to Today's Wisdom:** Today's Wisdom is the communal version (same passage for everyone on a given day). The Wanderer's Path is the personal version (each invocation goes somewhere new). They are related but distinct.

**Origin:** External design review (docs/reference/Claude-Teachings-Portal-Suggestions.md, 2026-03-01)

---

### PRO-021: Yogananda's Voice — Primary Source Audio Presence

**Status:** Proposed
**Type:** Feature
**Governing Refs:** ADR-057 (Audio Content Type), ADR-015 (Verbatim Media Fidelity), ADR-127 (Experience Quality)
**Target:** Arc 2a (when visual identity arrives — not Arc 6 media library)
**Dependencies:** SRF provides or authorizes voice recordings for portal use. Transcription pipeline (human-verified).
**Scheduling Notes:** Yogananda's own voice recordings are not "media" — they are primary source in a different modality. A recording of Yogananda speaking about fearlessness carries something a text passage of the same words does not. These deserve earlier, more prominent placement than the general media library (Arc 6).

**Three presentation points:**
1. **Homepage alongside Today's Wisdom.** Some days, Today's Wisdom is a passage. Some days, it's thirty seconds of Yogananda's voice. Same quiet presentation — no album art, no progress bar. A simple invitation: *Listen.*
2. **Within the book reader at chapter openings.** Where a corresponding recording exists: a quiet presence. Not autoplay. A single line: *Yogananda spoke on this.* One tap. His voice, then back to reading.
3. **Secondary navigation: "Listen."** Available but not competing with primary entry. The seeker who arrives wanting to hear him can find their way.

**Player design:** Nothing that resembles a music player. No waveform, no speed control. A circle that fills slowly as the recording plays. Pause. That's all. Typography beneath shows the passage being spoken, following along. When it ends, silence. A gentle offer: *Read the full passage.*

**Distinction from Arc 6 audio:** Monastic audio (talks, readings) belongs in the general media library (Arc 6). Yogananda's own voice recordings belong at Arc 2a, treated with the same reverence as Today's Wisdom.

**Origin:** External design review (docs/reference/Claude-Teachings-Portal-Suggestions.md, 2026-03-01)

---

### PRO-022: Passage Depth Signatures — Opus-Classified Contemplative Quality

**Status:** Proposed
**Type:** Enhancement
**Governing Refs:** ADR-014 (Model Tiering — Opus for batch), ADR-115 (Unified Enrichment), ADR-129 (Vocabulary Bridge)
**Target:** Milestone 1c (as part of enrichment pipeline — M1c-13)
**Dependencies:** Opus batch enrichment pipeline. Full corpus extracted.
**Scheduling Notes:** Not all passages are the same kind of thing. Some are luminous and bottomless — they reward the hundredth reading. Some are informational — they answer a question. Some are catalytic — they shift something when you're ready. Some are consoling — they meet suffering.

**Depth signature categories:**
- **Bottomless** — rewards endless return. Belongs in Today's Wisdom, Wanderer's Path.
- **Informational** — provides knowledge, answers a question. Belongs in search results, browse.
- **Catalytic** — shifts something in the reader when ready. Belongs in bridge seed passages for practice-oriented seekers.
- **Consoling** — meets suffering. Belongs in bridge seed passages for "I am struggling" entry.

**How Opus generates them:** Each passage is classified during the enrichment pipeline (ADR-115). Opus reads the passage in full chapter context and assigns one or more depth categories with confidence scores. This classification is written to the chunk's enrichment metadata.

**What depth signatures influence:**
- Today's Wisdom selection (bottomless passages preferred)
- Wanderer's Path weighting (PRO-020)
- Bridge seed passage curation — consoling passages for distress states, catalytic for practice states
- Related Teachings ordering — mix of depths, not all luminous

**Origin:** External design review (docs/reference/Claude-Teachings-Portal-Suggestions.md, 2026-03-01)

### PRO-023: Human Review Gate — Production Content Governance

**Status:** Proposed
**Type:** Policy
**Governing Refs:** ADR-005 (Claude Permitted Uses), ADR-032 (Theme Tags), ADR-078 (Translation Honesty), ADR-092 (Social Media), ADR-082 (Editorial Portal)
**Dependencies:** None architectural — infrastructure already exists (`tagged_by` three-state model, `is_published` boolean).
**Scheduling Notes:** The portal architecture provides human review gates at every content workflow touchpoint. These are governance tools SRF can activate for production — not mandatory constraints. For the internal demo, the portal operates with autonomous AI release. This proposal captures the full inventory for SRF's consideration.

**Review gate inventory (Arc 2+ unless noted):**

1. **Theme tags** — `tagged_by` model (`auto`/`manual`/`reviewed`). Gate: filter to `manual`/`reviewed` only. Without gate: serve `auto` tags. (ADR-032)
2. **UI translations** — Claude drafts, human reviews. Gate: require fluent SRF-aware reviewer sign-off. Without gate: ship Claude drafts directly. (ADR-078)
3. **Social media** — Quote images and captions generated. Gate: human reviews and posts. Without gate: auto-post with editorial templates. (ADR-092)
4. **Daily passage selection** — Enrichment pipeline selects. Gate: human curator approves each day's passage. Without gate: algorithmic selection serves directly. (Milestone 2b)
5. **Audio transcription** — Speech-to-text generates. Gate: human verifies transcript. Without gate: serve with confidence scores. (Arc 6)
6. **Practice Bridge tags** — Claude classifies technique-adjacent passages. Gate: human reviews tags before routing. Without gate: serve auto-classified routes. (ADR-104)
7. **Calendar content** — Events and observances. Gate: human verifies dates and descriptions. Without gate: serve from editorial CMS directly. (Arc 4)
8. **Ingestion QA** — Claude flags OCR errors. Gate: human makes every correction decision. Without gate: auto-correct high-confidence errors, flag low-confidence for batch review. (ADR-005 E4)
9. **`is_published` boolean** — Schema-level gate. Gate: content defaults to unpublished, requires explicit approval. Without gate: change default to `true`, content goes live on ingestion. (Schema)

**Recommendation:** The `tagged_by` model and `is_published` boolean are useful infrastructure regardless of governance decision — they enable filtering, auditing, and rollback even without mandatory gates. SRF should review this inventory and decide which gates to activate for production based on their risk tolerance and editorial capacity.

**Re-evaluate At:** Pre-production (before public launch)
**Decision Required From:** SRF leadership (editorial governance policy)
**Origin:** Principle analysis — reframing human review from mandatory constraint to available governance (2026-02-28)

---

### PRO-024: Editorial Page Compositor — Data-Driven Layout Curation

**Status:** Proposed
**Type:** Feature
**Governing Refs:** ADR-130 (Recognition-First IA), ADR-082 (Editorial Portal), ADR-079 (YSS Branding), ADR-095 (DELTA Framework), DES-028 (Calendar-Aware Surfacing)
**Dependencies:** Admin portal foundation (Milestone 3b). Component library maturity — the compositor composes from developer-built lenses, so enough lenses must exist to make composition valuable. Minimum viable: Today's Wisdom, search prompt, featured themes (3 components).
**Target:** Milestone 3b (foundation) or Arc 4 (full scheduling + brand variants)

**The gap.** The portal's homepage has 10+ content organization models (themes, threads, calendar, places, guide, browse, Wanderer's Path, Four Doors, daily passages, magazine) and a well-specified editorial review portal (ADR-082). Editors can curate *within* each content slot (pick today's passage, review theme tags). But no mechanism exists for editors to decide *which content lenses appear, in what order, with what emphasis* — that requires a code deployment. The compositor closes this gap.

**What it is.** A constrained layout engine where editorial judgment configures the portal's public surfaces without code changes:

- **Component library** is fixed — developers build the lenses (Today's Wisdom, Search Prompt, Wanderer's Path, Four Doors, Featured Themes, Calendar Event, etc.)
- **Composition** is editorial — which lenses appear, what order, what per-component parameters, what scheduling
- **Rendering** is standard Next.js Server Components reading config from Neon

**What it is not:**
- Not a generic page builder. Components are developer-built. Editors compose, they don't create.
- Not Contentful's responsibility. Contentful manages content (book text, theme descriptions). The compositor manages layout and prominence — which content surfaces where on which pages.
- Not low-code in the Retool/Webflow sense. A constrained editorial surface — closer to WordPress block ordering than to drag-and-drop page building.

**Three capabilities unlocked:**

1. **Editorial homepage governance.** Content editors configure which themes are featured, whether the Wanderer's Path is prominent during retreat season, whether calendar events push the hero position. Editorial judgment expressed through data, not code deployments.

2. **Brand-variant homepages (YSS and beyond).** Instead of code-level `if (locale === 'hi') { showYSSBranding() }`, each brand variant gets its own page composition. YSS homepage can lead with a different aesthetic, different featured themes, different entry mode ordering — same component library, different editorial surface. The codebase stays unified; the brand experience diverges at the data layer. Extends to any future variant (youth portal, meditation-focused entry point).

3. **Calendar/seasonal scheduling.** DES-028 specifies calendar-aware surfacing but currently only as "homepage adjusts when today matches a calendar event." The compositor makes this explicit: editors schedule homepage configurations in advance. Mahasamadhi week gets a contemplative layout. World Convocation gets an event-forward layout. No deploys required.

**Minimum viable data model:**

```sql
-- Page compositions — an editorial arrangement of content lenses
CREATE TABLE page_compositions (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  slug TEXT NOT NULL,              -- e.g., "homepage-srf-en"
  brand TEXT NOT NULL DEFAULT 'srf', -- 'srf' | 'yss'
  locale TEXT NOT NULL DEFAULT 'en',
  active_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  active_until TIMESTAMPTZ,        -- NULL = no expiry (default composition)
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_by TEXT,                 -- editor identity (Milestone 7a+: Auth0 sub)
  reviewed_by TEXT,                -- theological reviewer (if required)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Composition slots — ordered content lenses within a composition
CREATE TABLE composition_slots (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  composition_id UUID NOT NULL REFERENCES page_compositions(id),
  position INTEGER NOT NULL,       -- display order
  component_type TEXT NOT NULL,    -- 'todays_wisdom' | 'search_prompt' | 'wanderer' | 'four_doors' | 'featured_themes' | 'calendar_event' | ...
  config JSONB NOT NULL DEFAULT '{}', -- per-component parameters
  is_visible BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(composition_id, position)
);
```

Homepage renderer: `SELECT * FROM composition_slots WHERE composition_id = (best match for brand + locale + current date) ORDER BY position`. Server Components render each slot's `component_type` with its `config`. Cache-friendly (revalidate on composition change), preview-friendly, no client JS required.

**Relationship to ADR-130.** The Five entry modes (ADR-130) become the *default composition*, not the *only composition*. The compositor launches with ADR-130 as the initial config but makes it mutable by editorial judgment. ADR-130 governs the default; the compositor governs the ability to vary from it.

**Admin portal UI (extends ADR-082 Layer 3):**

- Table showing current homepage slots with drag-to-reorder and toggle visibility
- Per-slot config panel (e.g., "Featured Themes: select 6 from available themes")
- Preview mode ("preview as seeker" — render the composition without publishing)
- Brand/locale selector (editors with appropriate permissions see their brand's compositions)
- Scheduling view: calendar showing active and upcoming compositions
- No authentication before Milestone 7a — use the same lightweight auth as the editorial portal (open question, CONTEXT.md)

**Non-goal: behavioral optimization.** The compositor supports editorial rotation and seasonal scheduling, not A/B testing. Composition decisions are driven by editorial judgment and qualitative feedback, not by aggregate behavioral metrics (PRI-09, ADR-095). The portal curates from the corpus, not from user behavior.

**Pages beyond homepage.** The compositor pattern extends to any editorially curated page: `/guide`, `/browse`, `/themes`, the magazine landing. Start with homepage only; evaluate extension when the pattern proves itself.

**Phasing:**
- **Milestone 3b (foundation):** `page_compositions` + `composition_slots` tables. Admin UI for reorder + toggle. Single default composition per brand/locale. Preview mode.
- **Arc 4 (full):** Scheduling (active_from/active_until). Multiple compositions per brand/locale. Calendar integration (link compositions to calendar events from DES-028). Brand-variant compositions for YSS.

**Re-evaluate At:** Milestone 3b scoping (when admin portal architecture is finalized)
**Decision Required From:** Architecture (data model, admin UI), SRF editorial (governance: does theological reviewer approve compositions, or just content within them?)
**Origin:** Exploration — editorial surface gap analysis (2026-02-28)

---

### PRO-025: Structural Enrichment Tier — Whole-Context AI Understanding for Navigation

**Status:** Proposed
**Type:** Enhancement
**Governing Refs:** ADR-115 (Unified Enrichment), ADR-117 (Graph Intelligence), ADR-014 (Model Tiering — Opus for batch), ADR-129 (Vocabulary Bridge), ADR-130 (Recognition-First IA), PRO-020 (Wanderer's Path), PRO-022 (Passage Depth Signatures)
**Target:** Milestone 3b (alongside graph intelligence activation)
**Dependencies:** Assembled book text (available for AoY en/es). Opus batch access (Bedrock). Chunk enrichment pipeline operational (Milestone 1c).

**The gap.** The enrichment pipeline (ADR-115) analyzes chunks independently — each ~500-word passage is enriched in isolation. The knowledge graph (ADR-117, DES-054) builds bottom-up from these chunk-level entities and relationships. But structural understanding at chapter, book, and author scale is absent. No artifact captures what Opus sees when it reads an entire chapter as a coherent arc, an entire book as an argument structure, or an author's complete output as a distinctive voice.

This missing tier is the difference between a library that catalogs individual pages and one that understands how books work.

**Design constraint: invisible but load-bearing.** Structural enrichment artifacts are internal metadata powering navigation, presentation, and aggregation. They are never displayed as AI-authored content. Seekers experience curated organization; the curation logic is invisible. This parallels the existing chunk-level enrichment pattern — Opus assigns depth levels, topic tags, and entity labels that power search ranking without seekers seeing the classification. The librarian is invisible; the library is the experience.

This constraint resolves the PRI-01 boundary cleanly: structural readings are navigation metadata (same category as topic tags and depth levels), not generated content. No stakeholder ambiguity.

**What this enables (all invisible to seekers):**
- **Chapter resonance navigation** — "Chapters with similar arc" powered by structural similarity, not just topic overlap
- **Richer Wanderer's Path** (PRO-020) — emotional trajectory and structural type inform passage selection beyond topic and depth
- **Journey mode** — "Walk through how Yogananda builds the case for [concept]" ordered by the book's argument architecture, not chapter sequence
- **Author-informed grouping** — passages clustered by voice characteristics (metaphor patterns, emotional register), not just `WHERE author_id = ?`
- **Semantic positioning** (PRO-026) — chapter coordinates on meaningful axes for spatial navigation

**Three enrichment scales:**

1. **Chapter Perspective.** Opus reads an entire chapter in context. Produces: thematic arc (how the chapter moves), emotional trajectory (sequence of registers), turning points (pivots in the chapter's direction), metaphor patterns (recurring imagery), structural type (spiral, linear build, frame narrative, progressive revelation, etc.), and connections to other chapters in the same work. ~49 Opus calls per book.

2. **Book Perspective.** Opus reads chapter perspectives for an entire book — or the full book in a single context window for works that fit (~150K words). Produces: argument architecture (how the book builds its case), movement (the book's emotional/intellectual trajectory), structural pattern (the work's organizing principle), key chapters by role in the architecture, and the book's distinctive contribution (what this work does that no other does). ~1 Opus call per book.

3. **Author Voice Profile.** Opus reads across all works by an author. Produces: voice characteristics, metaphor preferences, emotional range, characteristic pedagogical moves, distinctive emphasis, and contrast dimensions with other authors. ~1 Opus call per author.

**Cross-structural artifact:**

4. **Chapter Resonances.** Structural parallels across chapters in different works — same arc pattern, same thematic movement, same emotional trajectory deployed for a different teaching. Generated during book perspective enrichment. These are "this chapter does the same structural work as that chapter" — a relationship invisible to passage-level similarity but load-bearing for navigation.

**Storage architecture:** Enrichment tables parallel to the knowledge graph, not graph nodes. The graph represents *what exists* (entities, passages, relationships). Structural enrichment represents *how to navigate* (arcs, trajectories, voices). Mixing them muddies both.

```sql
-- Chapter-level structural understanding
CREATE TABLE structural_chapters (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  chapter_id UUID NOT NULL REFERENCES book_chapters(id),
  work_id UUID NOT NULL REFERENCES works(id),
  language TEXT NOT NULL,
  thematic_arc TEXT NOT NULL,            -- Opus's structural reading of the chapter
  emotional_trajectory TEXT[] NOT NULL,  -- sequence of emotional registers
  turning_points JSONB NOT NULL,         -- [{chunk_id, description}]
  metaphor_patterns TEXT[],
  structural_type TEXT NOT NULL,         -- spiral, linear_build, frame_narrative, progressive_revelation, etc.
  semantic_coordinates JSONB,            -- for PRO-026 cartography
  enrichment_model TEXT NOT NULL,        -- model ID per ADR-123
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Book-level structural understanding
CREATE TABLE structural_works (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  work_id UUID NOT NULL REFERENCES works(id),
  language TEXT NOT NULL,
  architecture TEXT NOT NULL,            -- how the book builds its argument
  movement TEXT NOT NULL,                -- emotional/intellectual trajectory
  structural_pattern TEXT NOT NULL,      -- spiral, progressive_revelation, biographical_arc, etc.
  key_chapters JSONB NOT NULL,           -- [{chapter_id, role_in_architecture}]
  distinctive_contribution TEXT NOT NULL, -- what this book does that no other does
  enrichment_model TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Author voice profiles
CREATE TABLE structural_authors (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  author_id UUID NOT NULL REFERENCES persons(id),
  voice_characteristics TEXT NOT NULL,
  metaphor_preferences TEXT[],
  emotional_range TEXT NOT NULL,
  characteristic_moves TEXT[],           -- pedagogical patterns
  distinctive_emphasis TEXT NOT NULL,
  contrast_dimensions JSONB,             -- [{author_id, dimension, description}]
  enrichment_model TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cross-work structural parallels
CREATE TABLE chapter_resonances (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  source_chapter_id UUID NOT NULL REFERENCES book_chapters(id),
  target_chapter_id UUID NOT NULL REFERENCES book_chapters(id),
  resonance_type TEXT NOT NULL,          -- structural_parallel, thematic_echo, progressive_deepening
  description TEXT NOT NULL,
  confidence FLOAT NOT NULL,
  enrichment_model TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Relationship to existing proposals and architecture:**
- **PRO-022 (Passage Depth Signatures):** Chunk-level contemplative quality classification. Structural enrichment operates at chapter/book/author scale. Complementary, not overlapping. Chapter perspectives may calibrate depth signature assignment.
- **PRO-020 (Wanderer's Path):** Consumes structural enrichment to weight passage selection — emotional trajectory and book architecture make "surprise the seeker" richer than topic + depth alone.
- **PRO-010 (Word-Level Graph Navigation):** Vocabulary-level graph traversal. Structural enrichment provides the larger-scale context that vocabulary navigation operates within.
- **ADR-117 (Graph Intelligence):** Graph is bottom-up from chunks. Structural enrichment is top-down from whole works. They meet in the middle — graph edges connect entities, structural artifacts explain how those connections serve the book's architecture.
- **ADR-115 (Unified Enrichment):** The `passage_role` field (added to ADR-115) is the breadcrumb — each chunk self-reports its rhetorical function. Structural enrichment provides the chapter-level context that validates and enriches those per-chunk roles.

**Cost model:** One-time per book at ingestion. ~50 Opus calls per book (chapters + book-level). For the full corpus (~25 books): ~1,250 Opus calls total. At current Opus batch pricing, modest and comparable to the existing chunk enrichment pipeline cost.

**Validation step:** Prototype on Autobiography of a Yogi (English). Feed the full book (~164K words) to Opus in a single context window. Request all 49 chapter perspectives + 1 book perspective. Evaluate: (1) Do structural readings distinguish chapters in ways topic tags don't? (2) Can they power "chapters like this" recommendations? (3) Can they inform spatial positioning (PRO-026)? (4) When used to power navigation UX, does the result feel like "curated library" rather than "AI commentary"? Assembled text is available now — prototype can run before Milestone 3b.

**Re-evaluate At:** After prototype validation (can run anytime — assembled text available now)
**Decision Required From:** Architecture (prototype results determine scheduling)
**Origin:** Graph navigation exploration — invisible-librarian enrichment pattern at chapter/book/author scale (2026-02-28)

---

### PRO-026: Semantic Cartography — Meaningful Spatial Navigation

**Status:** Proposed
**Type:** Feature
**Governing Refs:** ADR-061 (Knowledge Graph Visualization), ADR-117 (Graph Intelligence), ADR-130 (Recognition-First IA), PRO-025 (Structural Enrichment Tier)
**Target:** Milestone 3d (alongside knowledge graph visualization) or earlier if static rendering proves viable
**Dependencies:** PRO-025 (structural enrichment provides semantic understanding for coordinate assignment). Minimal frontend: static SVG at CDN edge works on 2G mobile.

**The gap.** The Passage Constellation (ADR-061, Arc 6+) uses UMAP/t-SNE to project embeddings into 2D/3D space. This is a mathematical projection — it captures embedding similarity but the axes have no semantic meaning. A seeker navigating the constellation sees clusters but can't reason about *why* passages are near each other without reading them.

Semantic Cartography inverts this: Opus assigns coordinates on axes that carry meaning. The resulting map is a navigable territory seekers can reason about spatially — like a library's floor plan where the organization itself communicates.

**Proposed axes (require validation through prototype):**

| Axis | Low end | High end |
|------|---------|----------|
| Horizontal | Inner practice / contemplative | Outer life / applied |
| Vertical | Personal / experiential | Universal / doctrinal |
| Size | Introductory / accessible | Advanced / presupposes practice |
| Hue | Devotional — Intellectual — Experiential — Narrative |

These axes map to seeker intent: someone seeking personal comfort navigates to a different region than someone seeking philosophical understanding. The map's organization matches how seekers approach the teachings, not how embeddings cluster mathematically.

**How coordinates are assigned:**
- **Chapter-level:** During structural enrichment (PRO-025), Opus assigns semantic coordinates as part of the chapter perspective artifact. One output, no separate pipeline.
- **Passage-level:** Derived from chapter coordinates + chunk enrichment fields (`domain`, `voice_register`, `experiential_depth`, `passage_role`). Computed, not a separate Opus call — leverages existing metadata.

**Design constraint: invisible cartographer.** Same principle as PRO-025. Seekers see a beautiful map of the teachings. They explore territory. The cartographer who positioned everything is invisible — like a library's shelf organization, the arrangement *is* the experience. No "Opus positioned this chapter here because..." attribution.

**Progressive enhancement rendering:**
1. **Baseline (static SVG at CDN edge).** Pre-rendered 2D map of chapters/books. Works on 2G mobile. No JavaScript required. Navigation via standard `<a>` elements linking to chapter pages. Accessible: each point has an `<title>` element with chapter name and position description for screen readers.
2. **Enhanced (client-side JS).** Zoom, pan, hover details with passage previews, smooth transitions between book-level and chapter-level views. Loads on capable devices.
3. **Full (future, Arc 6+).** Interactive exploration with passage-level drill-down when knowledge graph visualization infrastructure exists. Integrates with the Passage Constellation — semantic cartography provides the meaningful axes, embedding projection provides the passage-level detail.

**Minimum viable version:** A single 2D scatter of 49 chapters from Autobiography of a Yogi, positioned by Opus on the practice/life and personal/universal axes, rendered as static SVG. Chapter names as labels. Tap/click navigates to the chapter reading page. Testable, shippable, mobile-friendly, accessible. Can be generated from the PRO-025 prototype output.

**Relationship to ADR-061 (Knowledge Graph Visualization):** The Passage Constellation uses mathematical projection (UMAP/t-SNE) — valuable for showing embedding clusters but semantically opaque. Semantic Cartography uses curated coordinates — semantically transparent but coarser. They complement: cartography provides the meaningful overview map; constellation provides the detail view. Both could coexist at `/explore` as different zoom levels.

**Re-evaluate At:** After PRO-025 prototype (semantic coordinates are a natural byproduct of chapter perspective generation)
**Decision Required From:** Architecture + UX review (axis selection, visual design, progressive enhancement thresholds)
**Origin:** Graph navigation exploration — spatial representation of Opus structural understanding (2026-02-28)

---

### PRO-027: Design Tooling (Figma + Storybook)

**Status:** Suspended from ADR-096, DES-040
**Type:** Enhancement
**Governing Refs:** ADR-096 (deleted), DES-040 (deleted)
**Suspended:** 2026-02-28

During AI-led development, code is the design artifact — Claude generates components directly, the browser rendering is the design. No external design tool (Figma, Storybook) serves a function when the designer and developer are the same AI. Visual design emerges through code iteration: generate CSS/components from DESIGN.md tokens, render in browser, evaluate, refine.

**Reactivation trigger:** Human designers join the project. When that happens, Figma becomes the upstream design source (Figma → tokens.json → tailwind.config.ts → components). Storybook documents the component library for the human team.

**Decision context preserved:** Figma was chosen over Penpot, Sketch, and Adobe XD for industry familiarity, design token export, and SRF team compatibility. Code-first (no tool) was the alternative considered and is the current active approach. If human designers never join, this PRO remains suspended indefinitely.

**Origin:** ADR-096 suspension 2026-02-28 — AI-led project has no design team; tools add overhead without consumers.

### PRO-028: Cross-Tradition Concordance as Primary Search Lens

**Status:** Proposed
**Type:** Feature
**Governing Refs:** ADR-129 (Vocabulary Bridge), ADR-130 (Recognition-First IA), ADR-050 (Related Teachings)
**Dependencies:** Theme taxonomy, Vocabulary Bridge cross-tradition synonym pairs, Scripture-in-Dialogue (M3c-5)

Yogananda's core vision: demonstrating the underlying unity of Christ's and Krishna's teachings. This is not a secondary feature — it is central to his literary output. *The Second Coming of Christ* and *God Talks With Arjuna* are full-length treatments of this concordance. The *Autobiography* weaves Bible↔Gita parallels throughout.

**Search lenses this enables:**
- "How did Christ and Krishna agree on...?" — surfaces passages where Yogananda himself draws the parallel
- "I don't understand Christianity/Hinduism/spirituality..." — routes to Yogananda's explanation of that tradition
- Cross-tradition vocabulary: salvation/moksha, Holy Ghost/AUM, baptism/initiation, Christ Consciousness/Kutastha Chaitanya

**Architectural touchpoints:** ADR-129 (Vocabulary Bridge) handles cross-tradition synonym pairs. ADR-130 (Recognition-First IA) includes "tradition entry" as a homepage lens. Scripture-in-Dialogue (M3c-5) handles structured verse-level Gita↔Gospel linking. Theme taxonomy should elevate "Christ-Krishna concordance" as a first-class theme.

**Constraint (PRI-01):** The portal surfaces Yogananda's own concordances — it never synthesizes new ones. Every result traces back to a specific passage where he draws the parallel.

**Re-evaluate At:** M1a-8 (search quality evaluation — test cross-tradition queries), Milestone 3c planning
**Decision Required From:** Architecture + search quality evaluation

### PRO-029: Cross-Media Intelligence — Video, Audio, Chant, Content Hub

**Status:** Suspended from ADR-055, ADR-056, ADR-057, ADR-058, ADR-059, ADR-060
**Type:** Feature
**Suspended:** 2026-03-01

Video transcript time-syncing, platform-agnostic video model, audio ingestion and cross-media search, AI audio generation policy, chant reader with deterministic cross-media linking, and unified content hub. Basic YouTube video display (RSS + API, ADR-054) remains active for Milestone 2a. These six ADRs govern the deeper cross-media intelligence layer.

**Reactivation trigger:** Arc 3 boundary, when cross-media search scope is defined.
**Re-evaluate At:** Arc 3 boundary

### PRO-030: Sacred Image Management — Watermarking and Multi-Size Serving

**Status:** Suspended from ADR-063, ADR-064
**Type:** Feature
**Suspended:** 2026-03-01

Digital watermarking (C2PA Content Credentials) for sacred images and multi-size image serving with WebP + JPEG downloads. ADR-035 (Image Content Type) and ADR-042 (Sacred Image Guidelines) remain active — they govern how images are treated, not how they're served at scale.

**Reactivation trigger:** Image content pipeline built (Arc 3+).
**Re-evaluate At:** Arc 3 boundary

### PRO-031: Study & Community Tools — Workspace, Collections, VLD

**Status:** Suspended from ADR-083, ADR-086, ADR-087
**Type:** Feature
**Suspended:** 2026-03-01

Study Workspace (personal passage collection without auth), Community Collections (four-tier visibility: private → shared → published → featured), and VLD Editorial Delegation (volunteer curation pipeline). DESIGN.md § Community Collections section also removed.

**Reactivation trigger:** Post-Arc 3 planning, when study tool scope is defined.
**Re-evaluate At:** Post-Arc 3 boundary

### PRO-032: Brand Distribution — Dashboard, Email, Social Media

**Status:** Suspended from ADR-090, ADR-091, ADR-092
**Type:** Feature
**Suspended:** 2026-03-01

"What Is Humanity Seeking?" anonymized search intelligence dashboard, daily email with verbatim passage delivery, and social media strategy with portal-generated assets. Distribution channels beyond the portal itself.

**Reactivation trigger:** Post-Arc 3 planning, when distribution scope is defined.
**Re-evaluate At:** Post-Arc 3 boundary

### PRO-033: YSS Locale Branding

**Status:** Subsumed by PRO-043
**Type:** Enhancement
**Suspended:** 2026-03-01
**Subsumed:** 2026-03-01

YSS organizational branding and locale strategy for Hindi/Bengali/Thai locales. The Yogoda Satsanga Society (YSS) is SRF's Indian counterpart — branding, logos, and organizational identity differ for these locales.

**Subsumed by PRO-043 (Teachings Platform — Shared Foundation for SRF and YSS).** Locale branding is one component of a broader platform partnership architecture. PRO-043 § Component 4 (Organization Configuration Layer) addresses all branding concerns from PRO-033 plus organizational routing, feature selection, content contribution, and surface flexibility. See PRO-043 for the full scope.

### PRO-034: Magazine API Rationalization

**Status:** Suspended from ADR-108
**Type:** Enhancement
**Suspended:** 2026-03-01

Magazine API design — flat resources, single-segment slugs. Governs how Self-Realization Magazine articles integrate into the portal's API surface.

**Reactivation trigger:** Magazine integration planning (post-Arc 3).
**Re-evaluate At:** Post-Arc 3 boundary

---

### PRO-035: Release Tagging and Deployment Ceremony

**Status:** Adopted → DES-060, ROADMAP M1a-11, M1c-17, M1c-18
**Type:** Enhancement
**Governing Refs:** ADR-018 (CI-Agnostic Scripts), ADR-020 (Multi-Environment), DES-039 (Infrastructure), ADR-105 (Portal Updates), DES-051 (Updates Page), DES-060 (Operational Surface)
**Target:** Milestone 1a (tagging) → Milestone 1c (deploy ceremony + manifests) → Arc 4 (environment promotion)
**Dependencies:** Git repository exists (Milestone 1a). CI pipeline exists (Milestone 1c). For promotion: `create-env.sh`/`destroy-env.sh` per ADR-020.

**The gap.** DES-039 specifies CI/CD, Neon branch-per-PR, and environment lifecycle scripts — but no release tagging strategy, no deployment ceremony, and no impact analysis for deployed features. DES-051 has a `deployment_ref` field but nothing populates it. When something breaks, there's no structured way to answer: what changed, what it touched, who it affected, and how to restore the previous state.

**Three phased capabilities:**

**Phase 1: Release Tags (Milestone 1a, zero cost)**

`scripts/release-tag.sh` creates annotated git tags at milestone boundaries:
- Semantic tags: `v1a.1`, `v1a.2`, `v1b.0`, `v1c.0`
- GitHub Releases with auto-generated notes from commits since last tag
- Populates DES-051 `deployment_ref` field
- Every tag is a rollback point, an audit artifact, and a provenance anchor

**Phase 2: Deploy Manifest + Ceremony (Milestone 1c)**

`scripts/deploy.sh` — an orchestrated deployment ceremony:
1. Run `scripts/smoke-test.sh` against preview URL
2. Generate `deploy-manifest.json` from git diff against last release tag
3. Create Neon pre-deploy snapshot (if migrations present)
4. Deploy via Vercel CLI (replaces git-triggered deploy for promotion scenarios)
5. Verify `/api/v1/health` on deployed URL
6. Create release tag + GitHub Release with manifest as artifact
7. If DES-051 update warranted: draft update entry for review queue

**Deploy manifest** — generated, not authored:
```json
{
  "version": "v1c.3",
  "commit": "abc123",
  "changes": {
    "migrations": ["003_add_entity_registry.sql"],
    "services_touched": ["neon", "vercel"],
    "api_routes_changed": ["/api/v1/search/suggest"],
    "config_changed": [],
    "design_refs": ["ADR-116", "ADR-120"]
  },
  "blast_radius": {
    "tier": "T3",
    "scope": "search suggestions + entity registry",
    "rollback_requires": ["vercel_rollback", "neon_snapshot_restore"],
    "population_affected": "~820M reachable"
  },
  "health_signals": {
    "success": "/api/v1/health returns 200",
    "alarm": "error rate > 1% for 5 min"
  }
}
```

**Blast radius auto-detection** — CI detects tier from the diff:

| Tier | Detection Rule | Ceremony |
|------|---------------|----------|
| T1: Cosmetic | Only CSS, copy, layout changed | Merge freely |
| T2: Feature | API routes or pages changed, no migrations | Merge freely |
| T3: Data | `/migrations/` changed | Pre-deploy snapshot required |
| T4: Infrastructure | Platform config or `bootstrap.sh` changed | Platform MCP audit review |
| T5: Cross-service | T3 + T4, or Contentful model + migrations | Explicit confirmation |

Tier shows in PR title automatically via CI. Not a gate — visibility.

**Phase 3: Environment Promotion (Arc 4+)**

`scripts/promote.sh {source} {target}`:
1. Run `smoke-test.sh` against source environment URL
2. Generate promotion manifest (diff between environments)
3. Neon: promote branch (or create target branch from source)
4. Vercel: deploy to target environment via CLI
5. Verify health on target
6. Create tagged release for the promoted version

`scripts/rollback.sh {environment}`:
1. Restore Neon from pre-deploy snapshot
2. Vercel instant rollback to previous deployment
3. Verify health
4. Create incident tag: `rollback-{env}-{timestamp}`

**Feature Impact Analysis Framework.** Every deploy manifest and every Dream-a-Feature assessment (PRO-038) uses the same multi-dimensional impact analysis. These dimensions are generated from the diff and design references — not authored manually.

| Dimension | What It Answers | Source |
|-----------|----------------|--------|
| **Population** | Who is served? How many? | ADR-128 data, language scope |
| **Cost: Development** | Hours to build? | Git diff size, files touched |
| **Cost: Infrastructure** | Monthly delta? Compute, storage, bandwidth? | Platform config diff, Neon compute changes, new API routes |
| **Cost: AI tokens** | One-time or recurring token cost? | Bedrock/Voyage calls in changed code paths |
| **Cost: Maintenance** | Tests added? Translations needed? Docs to keep current? | New test files, new i18n keys, new DES/ADR refs |
| **Risk: Failure modes** | What could go wrong? | Service dependencies in changed paths |
| **Risk: Blast radius** | Tier T1–T5, who is affected if it breaks? | Blast tier auto-detection (see above) |
| **Risk: Rollback complexity** | How hard to undo? Single-service or orchestrated? | Migration presence, Contentful changes, cross-service deps |
| **Risk: Dependency** | New vendor, library, or service dependency? | `package.json` diff, platform config additions |
| **Performance** | Latency impact? Bundle size delta? | New API routes, JS bundle analysis |
| **Accessibility** | Does this improve or risk a11y? | axe-core diff, new interactive elements |
| **Security** | Attack surface change? | New API endpoints, auth boundary changes |
| **Reversibility** | How easy to remove completely if it doesn't work? | Schema changes = low reversibility; CSS = high |
| **Principle alignment** | Does this honor all 11 principles? | Cross-reference against PRINCIPLES.md |
| **Complexity** | Does this make the portal simpler or more complex? | Net lines, new abstractions, new config |

**Example cost impact for a real feature:**

```
Feature: Spanish search (Milestone 1b)
  Population:      +430M reachable speakers
  Cost (dev):      ~8 hours (pipeline reuse from 1a)
  Cost (infra):    +$0.30 one-time (Voyage embeddings for ~120K words)
                   +~$2/mo (Neon storage for Spanish chunks)
                   +$0 recurring (no new compute — shared search API)
  Cost (tokens):   ~$0.50 one-time (enrichment via Bedrock Opus)
  Cost (maintain): +15 Spanish golden set queries, +1 locale in i18n
  Risk:            T3 (new data in book_chunks). Rollback: delete Spanish chunks.
  Reversibility:   High — language column makes surgical removal trivial.
```

This framework makes cost a first-class citizen alongside population impact. A stakeholder can see: "Spanish search reaches 430M people for $3 one-time and $2/month." Mission per dollar.

**Relationship to existing design:**
- DES-039 § Environment Lifecycle Scripts: promotion scripts extend the existing `create-env.sh`/`destroy-env.sh` pair
- ADR-018 § CI-Agnostic Scripts: all scripts live in `/scripts/`, callable from any CI system
- DES-051 § `deployment_ref`: release tags populate this field
- ADR-019 § Snapshots: pre-deploy snapshots are the rollback mechanism for T3+ deployments

**Re-evaluate At:** Milestone 1a (implement Phase 1), Milestone 1c (implement Phase 2)
**Decision Required From:** Architecture (self-implementing — scripts are CI-agnostic and self-contained)

---

### PRO-036: Operational Health Surface and SLI/SLO Framework

**Status:** Adopted → DES-060, ADR-095 §SLI/SLO, ROADMAP M1a-10, M1c-16. `/ops` page moved to platform MCP server (2026-03-01); health endpoint remains in teachings app.
**Type:** Feature
**Governing Refs:** ADR-095 (Observability), ADR-020 (Multi-Environment), DES-039 (Infrastructure), ADR-021 (Regional Distribution), ADR-003 (Accessibility), DES-060 (Operational Surface)
**Target:** Milestone 1c (health endpoint + SLI targets). Operational dashboard now provided by platform MCP server (`deploy_status`, `environment_describe`).
**Dependencies:** `/api/v1/health` (already a Milestone 1c deliverable). Sentry project (Milestone 1c). Deployed services to monitor.

**The gap.** The project has 7+ external services (Neon, Vercel, Sentry, Contentful, AWS Bedrock, Voyage, GitHub). No unified view of system state. No SLI/SLO definitions. No operational surface for stakeholders who lack vendor dashboard access. ADR-095 specifies observability tools but not health targets.

**Two audiences, two surfaces, one data source:**

| Surface | Audience | Content | When |
|---------|----------|---------|------|
| `/api/v1/health` (JSON) | Claude, CI, monitoring | Service connectivity, version, uptime, response times | Milestone 1c |
| `/ops` (internal page) | Human principal, SRF stakeholders, future developers | Links to vendor dashboards, version, last deploy, SLI/SLO status, feature inventory, docs | Milestone 2a |

**Not** a rebuilt Sentry or Vercel dashboard. Links out to vendor UIs for detail. Calls service APIs only for summary data (unresolved error count, deployment status, compute health).

**SLI/SLO definitions (define now, measure from Milestone 1c):**

| SLI | Target (SLO) | Source | Measurement Begins |
|-----|-------|--------|-------------------|
| Search p95 latency | < 500ms globally | ADR-021 | Milestone 1c (Sentry Performance) |
| Search availability | 99.5% monthly uptime | Architecture | Milestone 1c (synthetic monitoring) |
| First Contentful Paint | < 1.5s | ADR-003 | Milestone 1c (Lighthouse CI) |
| Error rate (5xx) | < 0.1% of requests | Architecture | Milestone 1c (Sentry) |
| Content freshness | Contentful → Neon sync < 5 min | DES-005 | Milestone 1c (webhook monitoring) |
| Accessibility | Zero critical axe-core violations | ADR-003 | Milestone 1a (CI) |
| Search quality | >= 80% Recall@3 on golden set | DES-058 | Milestone 1a |

No SLA defined — the portal is free, no contractual obligations. SLOs are internal quality targets.

**`/ops` page design (Milestone 2a):**
```
Portal Operations                            v1c.3 · deployed 2026-09-15
─────────────────────────────────────────────
Services
  Neon       ● healthy    Sentry     ● healthy
  Vercel     ● healthy    Contentful ● healthy
  [each links to vendor dashboard]

SLI/SLO Status (last 30 days)
  Search p95:    340ms / 500ms target    ✓
  Availability:  99.8% / 99.5% target   ✓
  FCP:           1.2s  / 1.5s target    ✓
  Error rate:    0.02% / 0.1% target    ✓
  Quality:       84%   / 80% target     ✓

Current Milestone: 2a Build
  [link to ROADMAP.md rendered section]

Recent Deploys
  v1c.3  2026-09-15  T2: search suggestion improvement
  v1c.2  2026-09-10  T1: typography refinement
  [links to GitHub Releases with deploy manifests]

Architecture Docs  →  [link to docs site or GitHub]
Feature Inventory  →  /updates?view=features
```

**`/ops` as MCP tool (also Milestone 1c).** The same health data should be queryable by Claude at session start. A `scripts/status.sh` that outputs structured status:
```bash
./scripts/status.sh
# Version: v1c.3
# Milestone: 2a Build
# Health: all services green
# Last deploy: 2026-09-15 (T2: search suggestions)
# Sentry: 0 unresolved issues
# Pending PROs: 12 proposed, 3 validated
```

Claude runs this at session start for self-orientation. The human sees the same data at `/ops`. Design for Claude first (structured), render for humans second (visual).

**`scripts/status.sh` is the highest-priority deliverable in this PRO.** It should exist from Milestone 1a — even before the health endpoint, even before deployed services. Initially it reports: git version, current branch, doc-validate results, pending PRO count, open question count. As infrastructure comes online, it adds: health check, Sentry status, deploy history. The script grows with the project. It is the AI operator's self-orientation tool.

**The philanthropist's number.** One metric deserves permanent prominence on `/ops`:

> **Reaching the world at $0.05 per million people per month.**

Computed: `monthly_infrastructure_cost / (reachable_population / 1_000_000)`. At Arc 1 (~$66/month, ~820M reachable): $0.08/M/month. At Arc 3 with all languages (~$150/month, ~3B reachable): $0.05/M/month. This single number answers the philanthropist's question: "Is my money reaching people?" It also answers SRF's question: "Is this sustainable?" Display it prominently on `/ops`, in quarterly stakeholder reports, and in the deploy manifest's summary section. The number gets better with every language activation — each language reduces cost-per-person-reached.

**The `/ops` page is NOT the seeker-facing `/updates` page.** DES-051 serves seekers with contemplative voice. `/ops` serves operators and stakeholders with structured data. Two pages, two audiences, shared data sources (deploy manifests, health checks).

**Extension: `/updates?view=features` — population impact overlay:**

DES-051 `portal_updates` table extended with two optional columns:
- `population_served TEXT` — e.g., "~430M Spanish speakers"
- `governing_refs TEXT[]` — e.g., ["ADR-128", "ADR-077"]

The seeker view (`/updates`) omits these. The feature view (`/updates?view=features`) renders them as a stakeholder-facing inventory:

| Feature | Milestone | Population Served | Status | Refs |
|---------|-----------|-------------------|--------|------|
| English search | 1a | ~390M | Deployed | ADR-044, ADR-029 |
| Spanish search | 1b | ~430M additional | Deployed | ADR-128, ADR-077 |
| Spoken Teachings (human narration) | TBD | ~771M illiterate adults + audio-preferring seekers | PRO-003 | PRO-003, ADR-015 |

Mission-aligned impact storytelling. "The teachings now speak Spanish" for seekers; "Spanish search: ~430M additional reachable" for stakeholders. Same event, two framings.

**Re-evaluate At:** Milestone 1c (health endpoint + SLI targets), Milestone 2a (ops page)
**Decision Required From:** Architecture (self-implementing for health endpoint; stakeholder access for `/ops` — who should see it?)

---

### PRO-037: Document Integrity Validation in CI

**Status:** Adopted → DES-060, ROADMAP M1a-9
**Type:** Enhancement
**Governing Refs:** ADR-098 (Documentation Architecture), ADR-094 (Testing Strategy), ADR-093 (Engineering Standards), DES-038 (Testing Strategy), DES-060 (Operational Surface)
**Target:** Milestone 1a (highest-value, lowest-cost item in the entire operational tooling exploration)
**Dependencies:** None. Runs against markdown files in the repo. Zero infrastructure.

**The gap.** The project has ~130 ADR identifiers, ~60 DES identifiers, ~39 PRO identifiers, cross-references throughout, a navigation table in DESIGN.md, an index in DECISIONS.md, and naming conventions for files. No automated validation. Document drift compounds silently across sessions — a broken cross-reference from session 5 is invisible until session 15 when someone follows it.

**`scripts/doc-validate.sh` — deterministic, fast, zero dependencies:**

1. **Identifier uniqueness.** Scan all markdown files for `ADR-NNN`, `DES-NNN`, `PRO-NNN` definitions (header format: `## ADR-NNN:` or `### PRO-NNN:`). Flag duplicates.
2. **Cross-reference resolution.** Scan all prose for identifier mentions. Verify each resolves to a definition somewhere in the corpus.
3. **DESIGN.md navigation table.** Every DES-NNN and ADR-NNN in the nav table has a corresponding file or section. Every file in `design/` appears in the nav table.
4. **DECISIONS.md index.** Every ADR-NNN in the index exists in a body file (DECISIONS-core.md, DECISIONS-experience.md, or DECISIONS-operations.md). Every ADR in a body file appears in the index.
5. **File naming convention.** Files in `design/` match `{IDENTIFIER}-{slug}.md` pattern. Identifiers in filenames match the section header inside.
6. **Dual-homed title match.** ADRs that appear in both DECISIONS-*.md and `design/` files have matching titles.
7. **PROPOSALS.md index.** Every PRO-NNN in the index has a body. Every body has an index entry.
8. **Suspension integrity.** ADRs marked `(Suspended → PRO-NNN)` in DECISIONS.md have no body in DECISIONS-*.md. The corresponding PRO-NNN exists in PROPOSALS.md.

**Output:** Zero-exit-code on success, non-zero on failure. Human-readable report listing each violation with file path and line number. CI blocks merge on failure.

**Added to `ci.yml`:**
```yaml
- name: Document integrity
  run: ./scripts/doc-validate.sh
```

**Why Milestone 1a, not later:** This script validates the existing ~40 design documents. It should run before the first line of application code is written. Document integrity is a prerequisite for confident implementation — Claude reads these specs and implements from them. If the specs are inconsistent, the implementation will be inconsistent.

**Potential Claude Code skill companion (advisory, not blocking):**

A `/verify` skill that runs post-implementation to compare code against governing design specs. "DES-003 says search returns passages with citations — does the implementation satisfy that?" This requires semantic understanding (Claude), not pattern matching (bash). Advisory PR comment, not merge-blocking.

**Relationship to existing testing:**
- DES-038 specifies test layers: unit, integration, E2E, accessibility, performance, search quality. Document validation is a missing layer — it tests the *specification* not the *implementation*.
- ADR-094 mentions "Neon branch-per-test-run isolation" — document validation needs no database. It's pure markdown parsing.

**Re-evaluate At:** Implement at Milestone 1a start (before any application code)
**Decision Required From:** None — this is a deterministic CI script with clear value

---

### PRO-038: Dream a Feature — AI-Driven Prototyping Workflow

**Status:** Proposed
**Type:** Feature
**Governing Refs:** ADR-020 (Multi-Environment — branch=environment), ADR-124 (Neon Platform — branching), PRO-001 (MCP Strategy), DES-039 (Infrastructure), PRO-042 (Feature Lifecycle Portal — the human surface that consumes this engine's output)
**Target:** Milestone 2a (skill definition) — requires working portal to prototype against
**Dependencies:** Working portal (at least Milestone 1c deployed). Neon branch-per-PR operational. Vercel preview deploys active. PRO-NNN lifecycle in PROPOSALS.md.

**The vision.** Someone — the human principal, an SRF stakeholder, a future team member — describes a feature they imagine. Claude orchestrates the full lifecycle: proposal creation, isolated environment, implementation, preview deployment, and impact assessment. If accepted, the feature merges. If not, the branch is cleaned up and the PRO entry records what was learned.

**Relationship to PRO-042:** PRO-038 is the autonomous development *engine* — it creates branches, implements features, and deploys previews. PRO-042 is the human *surface* — it presents the engineering leader with a morning brief, stakeholder feedback, decision journal, and "Show Me" walkthroughs. PRO-038 can function without PRO-042 (GitHub PRs + Vercel previews are sufficient). PRO-042 requires PRO-038 as the engine that populates the feature catalog.

This is not a platform. It is not Gemini AppSheet. It is a Claude Code skill that orchestrates tools that already exist.

**Named: "Dream a Feature."** The name invites non-technical participation. It says: you bring the vision, the system handles the engineering. This empowers everyone in the organization — a monastic editor can dream a feature just as readily as a developer.

**The `/dream` skill (`.claude/skills/dream/SKILL.md`):**

```
1. Parse the feature description (natural language)
2. /dedup-proposals — check if a related PRO already exists
3. If no existing PRO: create PRO-NNN entry in PROPOSALS.md
4. Create feature branch: git checkout -b dream/PRO-NNN-{slug}
5. Create Neon branch from dev: neonctl branches create --name dream/PRO-NNN
6. Implement the feature on the branch
7. Push branch → Vercel auto-deploys preview
8. Run smoke-test.sh against preview URL
9. Generate impact assessment (see below)
10. Present: preview URL + PRO reference + impact assessment
11. Await human decision: promote, iterate, or discard
```

**Impact assessment (generated, not authored):**

Every prototype includes an honest multi-dimensional assessment using the Feature Impact Analysis Framework (PRO-035). The human decides with full visibility — not just "does it work?" but "what does it cost, who does it serve, what could go wrong, and is it reversible?"

Example for a hypothetical "reading progress indicator" dream:

```
Dream: "Show readers how far they are in a chapter"
PRO: PRO-040 (auto-created)
Preview: https://dream-pro-040.vercel.app

Impact Assessment:
  Population:      ~820M (all seekers who read)
  Cost (dev):      ~2 hours
  Cost (infra):    $0 (localStorage only, no server)
  Cost (tokens):   $0 (no AI involvement)
  Cost (maintain): 1 new component, 1 test, 0 translations needed
  Risk (failure):  T1 cosmetic — if it breaks, reading still works
  Risk (go wrong): Could feel like a progress tracker (violates
                   Calm Technology). Mitigated: scroll position
                   indicator, not percentage or completion metric.
  Reversibility:   High — 1 component removal, no schema change
  Dependency:      None new
  Performance:     +0 KB (CSS only, no JS bundle impact)
  Accessibility:   Neutral (decorative, ARIA-hidden)
  Security:        No change
  Principles:      ✓ all 11 — no tracking, no gamification,
                   position awareness ≠ completion tracking
  Complexity:      Low — 1 CSS rule, 1 component, 0 abstractions
  Calm Technology: Visible only while reading, 2px subtle gold line,
                   disappears on pause — it waits, it does not push
  Maintenance:     Low half-life — CSS-only, unlikely to need updates
```

The assessment answers the question every stakeholder cares about: **"Is this worth it?"** — not in abstract terms, but in concrete population served, dollars spent, risk accepted, and principles honored.

**Prototype lifecycle:**

| State | TTL | Action |
|-------|-----|--------|
| Active preview | 14 days | Auto-delete Neon branch + Vercel preview after 14 days of inactivity |
| Promoted | — | Merged to main via standard PR flow; PRO status → Adopted |
| Discarded | — | Branch deleted, Neon branch deleted, PRO status updated with learnings |
| Iterated | Resets 14-day TTL | Human requests changes, Claude modifies on the same branch |

**Nightly cleanup:** `scripts/dream-cleanup.sh` deletes dream branches older than 14 days with no activity. Added to `neon-cleanup.yml` cron.

**Who can dream?** Anyone with access to Claude Code in this repository. The skill is in `.claude/skills/dream/SKILL.md` — available to all operators. The human principal retains promotion authority (only they merge PRs to main). Non-technical stakeholders can dream features; they see preview URLs, not code.

**Relationship to existing workflow:**
- This formalizes what already happens in Claude Code conversations, adding: Neon branch isolation, Vercel preview deployment, structured impact assessment, and PRO lifecycle integration.
- ADR-020 says branch=environment. Dream branches are disposable environments.
- ADR-124 Neon branching is instant and zero-cost. Each dream gets its own database state.

**What this is NOT:**
- Not a code generator that outputs unreviewed code to production
- Not a general-purpose app builder (domain-specific to this portal)
- Not autonomous — human decides promotion, not Claude
- Not expensive at scale — Neon branches are free (copy-on-write), Vercel previews are free (included in Pro tier)

**Re-evaluate At:** Milestone 1c (working portal provides a meaningful base for prototyping)
**Decision Required From:** Architecture (skill design), human principal (governance — who can dream?)

---

### PRO-039: Design-Artifact Traceability — Spec-to-Code-to-Deploy Linkage

**Status:** Adopted → DES-060 §Layer 4, ROADMAP 2a
**Type:** Enhancement
**Governing Refs:** ADR-098 (Documentation Architecture), ADR-094 (Testing Strategy), PRO-037 (Document Integrity CI), PRO-035 (Release Tagging), PRO-041 (Docs as Executable Specs), DES-060 (Operational Surface)
**Target:** Milestone 1c (conventions), Milestone 2a (CI roll-up)
**Dependencies:** Identifier conventions established (they are — ADR-NNN, DES-NNN, PRO-NNN). GitHub Actions operational (Milestone 1c). Code exists to trace (Milestone 1a+).

**The gap.** The project has ~130 ADRs, ~60 DES sections, and ~41 proposals governing what the code should do. Once code exists, there is no systematic way to answer: *Which specs are implemented? Which are tested? Which shipped in the last release?* Traceability is manual — grep the codebase, hope comments exist, check git history. This gap widens with every milestone.

**What this is.** A lightweight convention — not a tool, not a site — that links design identifiers (ADR-NNN, DES-NNN, PRO-NNN) through the code → test → deploy lifecycle. Every artifact carries its governing references. CI aggregates them into a traceability roll-up.

**Layer 1: Code references governing specs.**

Source files include a `@governs` or `@implements` comment linking to the design identifier:

```typescript
// @implements DES-004 (Data Model), ADR-048 (Chunking Strategy)
export async function chunkChapter(chapter: Chapter): Promise<Chunk[]> { ... }
```

```sql
-- @implements DES-004, ADR-075 (Multilingual Foundation)
CREATE TABLE chapters (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  language TEXT NOT NULL DEFAULT 'en',
  ...
);
```

Convention is freeform — a comment with `@implements` or `@governs` followed by identifiers. No special tooling required to add. Grep-parseable.

**Layer 2: Tests reference what they validate.**

Test files carry `@validates` comments linking to the spec they verify:

```typescript
// @validates DES-058 (Search Quality), ADR-041 (Hybrid Search)
describe('search quality golden set', () => { ... });
```

```typescript
// @validates ADR-003 (Accessibility), DES-006 §Responsive
describe('reader responsive breakpoints', () => { ... });
```

**Layer 3: Deploy manifests carry `design_refs`.**

Release tags (PRO-035) include a `design_refs` field listing all identifiers touched in the release:

```json
{
  "tag": "v1a.3",
  "design_refs": ["DES-004", "ADR-048", "DES-058", "ADR-041"],
  "blast_tier": "T3",
  "health_signals": { ... }
}
```

Generated automatically by `scripts/release-tag.sh` scanning commits since last tag for `@implements`/`@validates` annotations.

**Layer 4: CI roll-up.**

A CI step (Milestone 2a) produces a traceability report:

```
Identifier Coverage Report (v1a.3)
─────────────────────────────────
DES-004  Data Model           ██████████ implemented ✓  tested ✓  deployed v1a.1
DES-058  Search Quality       ████████░░ implemented ✓  tested ✓  deployed v1a.3
ADR-048  Chunking Strategy    ██████░░░░ implemented ✓  tested ○  not deployed
DES-017  Homepage             ░░░░░░░░░░ not started
```

This answers the stakeholder question "what's done?" without a documentation site — the report is a CI artifact, available in GitHub Actions, linked from the `/ops` page (PRO-036), and included in deploy manifests.

**What this is NOT:**
- Not a documentation rendering site (GitHub already renders markdown; stakeholders who need prettier access are served by GitHub's native UI or future consideration)
- Not a coverage enforcement gate in Arc 1 (advisory only — enforcement in Arc 2+)
- Not heavyweight tooling — grep + conventions + a shell script
- Not a replacement for reading the specs — it answers "is it done?" not "what does it say?"

**Relationship to PRO-037 (Document Integrity CI):** PRO-037 validates that *documents are internally consistent*. PRO-039 validates that *code is traceable to documents*. Complementary, not overlapping.

**Relationship to PRO-041 (Docs as Executable Specs):** PRO-041 extracts *testable assertions* from design prose. PRO-039 links *existing code and tests* back to their governing specs. PRO-041 answers "what should we test?"; PRO-039 answers "have we tested it?"

**Re-evaluate At:** Milestone 1a (establish conventions), Milestone 2a (CI roll-up automation)
**Decision Required From:** Architecture (annotation convention), human principal (enforcement timeline)

---

### PRO-040: Living Golden Set — Seeker-Fed Search Quality

**Status:** Proposed
**Type:** Enhancement
**Governing Refs:** DES-058 (Search Quality Evaluation), ADR-095 (Observability/DELTA), ADR-099 (Privacy), ADR-053 (Search Analytics)
**Target:** Milestone 2b (requires deployed search with real seekers)
**Dependencies:** Golden retrieval set operational (Milestone 1a). Search deployed (Milestone 1c). Real seekers using the portal.

**The gap.** DES-058 specifies ~58 English and ~15 Spanish test queries crafted by Claude. This captures what Claude *predicts* seekers will ask. It cannot capture what seekers *actually* ask and fail to find. The golden set is a snapshot — it improves only when a developer manually adds queries. The search quality loop is open.

**Close the loop: one bit of seeker feedback, DELTA-compliant.**

After search results, a single quiet line: *"Did this help you find what you were looking for?"* Two responses: a subtle checkmark (yes) and a subtle X mark (no). Nothing else. No text field, no rating, no user identification, no session association.

What gets recorded:
```sql
-- DELTA-compliant search feedback (no user identification)
INSERT INTO search_feedback (query_text, language, helpful, created_at)
VALUES ('how do I find inner peace', 'en', false, now());
```

No user ID. No session ID. No IP. No behavioral profile. The query is already anonymized in `search_queries` (ADR-053); this adds one bit: helpful or not.

**How it feeds the golden set:**

Queries with repeated "not helpful" signals (e.g., 3+ negative signals on the same query text within 30 days) are automatically added to the golden set as regression candidates. A weekly batch job:
1. Extracts queries with ≥ 3 negative signals
2. De-duplicates against existing golden set entries
3. Generates candidate entries (query + expected relevant passages, determined by Claude reviewing the corpus)
4. Queues for human review before golden set inclusion

Over time, the golden set converges on what seekers *actually need*, not what Claude *predicted* they'd need. The search quality metric's denominator becomes grounded in reality.

**DELTA compliance analysis:**
- **Dignity:** No user identification. The feedback is about the query, not the person.
- **Embodiment:** Minimal interaction — two buttons, one click, optional. The portal doesn't demand evaluation.
- **Love:** The signal is used solely to improve search for future seekers. Not sold, not profiled, not correlated.
- **Transcendence:** The portal learns from aggregate patterns, not individual behavior.
- **Agency:** Feedback is optional. No prompt, no reminder, no "you haven't rated" nudge. Present once, quietly.

**Design constraint (Calm Technology):** The feedback line appears below all search results, not between them. It is text, not a modal. It does not animate, pulse, or demand attention. It is present, and it waits.

**Estimated value:** If 1% of searches receive feedback and 10% of negative-signal queries reveal genuine search gaps, the golden set could grow from ~73 queries to ~200+ queries within the first year — each one grounded in a real seeker's failed search.

**Re-evaluate At:** Milestone 1c (when search quality metrics from 1a/1b are available — if the golden set already covers 95% of real query patterns, this is unnecessary)
**Decision Required From:** Architecture + DELTA review (privacy analysis)

---

### PRO-041: Documents as Executable Specifications

**Status:** Proposed
**Type:** Enhancement
**Governing Refs:** ADR-098 (Documentation Architecture), ADR-094 (Testing Strategy), PRO-037 (Document Integrity Validation)
**Target:** Milestone 2a (alongside test infrastructure buildout, M2a-21)
**Dependencies:** PRO-037 (`doc-validate.sh`) operational. Test infrastructure (Vitest, Playwright) operational. Design documents contain testable assertions.

**The gap.** ADRs and DES sections contain testable assertions in prose: "WCAG 2.1 AA" (ADR-003), "search p95 < 500ms" (ADR-021), "no horizontal scrolling at 320px" (ADR-006), "44x44px touch targets" (ADR-003), "< 100KB JS" (ADR-003), "FCP < 1.5s" (ADR-003). These assertions are manually translated into tests by the implementer. If the implementer (Claude) misses one, the assertion exists in the document but not in the test suite. The design→implement→verify loop has a manual, lossy step.

**Close the loop: `scripts/doc-to-test.sh` generates test stubs from design documents.**

The script parses design documents for patterns that map to testable assertions:

| Document Pattern | Generated Test |
|-----------------|---------------|
| "WCAG 2.1 AA" / "axe-core" | `expect(axeResults).toHaveNoViolations()` |
| "p95 < Nms" / "latency < Nms" | Performance assertion: `expect(p95).toBeLessThan(N)` |
| "< NKB JS" | Bundle size assertion: `expect(jsSize).toBeLessThan(N * 1024)` |
| "FCP < Ns" | Lighthouse assertion: `expect(fcp).toBeLessThan(N * 1000)` |
| "NxNpx touch targets" | Computed style assertion: `expect(minDimension).toBeGreaterThanOrEqual(N)` |
| "no horizontal scrolling at Npx" | Playwright viewport test at N width |
| "cursor-based pagination" | API contract test: response has `cursor` field |

**Output:** `tests/generated/spec-assertions.test.ts` — regenerated on every CI run. If a design document changes its assertion, the generated test changes. If a new document adds an assertion, a new test appears. The loop closes automatically.

**What this is NOT:**
- Not a replacement for handwritten tests. Generated tests verify *documented assertions*. Handwritten tests verify *implementation behavior*.
- Not AI-generated. The parsing is deterministic regex/pattern matching against known assertion formats. No LLM in the loop.
- Not comprehensive. Covers quantitative assertions (numbers, thresholds, standards). Does not cover qualitative assertions ("the reading experience should feel curated"). Those require `/verify` skill review.

**Estimated coverage:** ~30-40 testable assertions exist across current design documents. Each takes ~5 lines to parse and ~3 lines to generate. The script is ~200 lines of TypeScript or bash.

**The deeper value:** When a design document is the source of truth for a test, changing the document changes the test. The spec and the verification are the same artifact viewed from two angles. A stakeholder reads "search p95 < 500ms" in ADR-021; CI enforces `expect(p95).toBeLessThan(500)`. Same commitment, same number, one source.

**Re-evaluate At:** Milestone 2a (alongside test infrastructure buildout)
**Decision Required From:** Architecture (parsing patterns, test framework integration)

---

### PRO-042: Feature Lifecycle Portal — Calm Operations for Engineering Leadership

**Status:** Proposed
**Type:** Feature
**Governing Refs:** PRO-038 (Dream a Feature), PRO-036 (Operational Health), DES-060 (Operational Surface), ADR-095 (Observability), ADR-099 (DELTA Privacy), ADR-098 (Documentation Architecture), PRI-08 (Calm Technology)
**Target:** Milestone 2a (lightweight: morning brief + email feedback) → Milestone 3b (full catalog UI + stakeholder circles + decision journal)
**Dependencies:** PRO-038 (Dream a Feature) operational — provides the autonomous development engine. DES-060 operational surface deployed (Milestone 1c). Vercel preview deployments working. Features exist to manage.

**The gap.** PRO-038 describes how features are autonomously developed and deployed to preview branches. DES-060 provides health monitoring and deployment ceremony. Neither addresses what happens *between* preview deployment and production merge — the review, feedback, decision, and institutional memory lifecycle. The engineering leader currently manages this lifecycle across GitHub PRs, Vercel dashboards, email threads, and mental notes. The cognitive load compounds with every concurrent feature.

**The deeper gap.** Every operational tool the engineering leader has ever used was designed to maximize information density. More charts, more alerts, more knobs. This violates the portal's own PRI-08: "Technology requires the smallest possible amount of attention." The portal's operational experience should follow the same design principles as the seeker experience.

**Design principle: Calm Operations.** The operational surface applies the portal's 11 principles to the engineering leader's experience:

| Portal Principle | Seeker Application | Operations Application |
|------------------|--------------------|----------------------|
| Calm Technology (§6) | No push notifications, no autoplay | Morning brief, not real-time alerts. Nothing flashes. |
| Direct quotes only (§1) | Verbatim Yogananda | Verbatim metrics. No AI spin. "87% Recall@3" not "Great quality!" |
| Signpost, not destination (§4) | Guide toward practice | Guide toward decision. Present options, don't persuade. |
| Global-first (§5) | Works on 2G in Bihar | Works in email, on mobile, low-bandwidth. No heavy SPA. |
| Accessibility (§7) | Screen readers, keyboard nav | Multiple consumption modes — visual catalog, text brief, email digest |
| Full attribution (§2) | Every quote carries provenance | Every AI recommendation cites the governing principle or spec. |
| Honoring the spirit (§3) | Technology disappears, teachings shine | Technology disappears, *the work* shines. |

---

#### Layer 1: The Morning Brief

A daily digest delivered by email (or Slack, or however she consumes information). Written in the project's own contemplative voice. Not a dashboard — a letter.

```
Good morning.

The portal is well. All systems healthy.
Search quality: 87% Recall@3 (stable).
Serving 2 languages to ~820M reachable people.

Two features await your attention:

  ◈ Sanskrit Hover Definitions
    Preview: https://dream-044.portal.vercel.app
    Theological Review: 2 of 3 responded.
    AI assessment: Aligns with DES-042. Principle-clean.
    One note worth reading (Brother Ananda's comment).

  ◈ Reading Progress Indicator
    Preview: https://dream-045.portal.vercel.app
    AI assessment: Adds 12KB JS — within budget but notable.
    Two implementation options prepared for your review.

Nothing else needs you today.

Cost this month: $87 · $0.04 per million people reached.

                    ─── ◊ ───
```

**Implementation:** A scheduled job (GitHub Actions cron or Lambda) aggregates: `/api/v1/health` status, open feature branches with Vercel previews, pending stakeholder comments, cost metrics from billing APIs. Renders to email via a template that uses the portal's design tokens (Merriweather, warm cream, gold accents). Sends via AWS SES (or SendGrid per SRF stack).

**When nothing needs attention**, the brief says so explicitly: "The portal is well. No features awaiting review. No pending decisions. The teachings are being served." This is not the absence of information — it is positive information. Permission to rest.

**Frequency:** Daily on weekdays. Configurable. Can be set to "weekly digest" or "only when something needs me." Calm Technology means the engineering leader controls the cadence, not the system.

---

#### Layer 2: The Feature Catalog

A page within the portal (not a separate app) at `/ops/features` — extending the `/ops` page from DES-060. Lists all features in the lifecycle: proposed, in development, preview deployed, awaiting review, approved, declined.

```
┌──────────────────────────────────────────────────────────────────┐
│ The Garden                                                       │
│                                                                  │
│ Awaiting Your Review                                             │
│ ────────────────────                                             │
│                                                                  │
│ ◈ Sanskrit Hover Definitions                PRO-044 · DES-062   │
│   Preview ready · Theological Review: 2/3 · Resonance: high     │
│   [Show Me]  [Review]  [Assign Circle]                           │
│                                                                  │
│ ◈ Reading Progress Indicator                PRO-045              │
│   Preview ready · No circle assigned · Resonance: moderate       │
│   AI note: performance budget consideration                      │
│   [Show Me]  [Review]  [Assign Circle]                           │
│                                                                  │
│ Growing                                                          │
│ ────────────────────                                             │
│                                                                  │
│ ○ Quiet Corner Circadian Bowls              PRO-046              │
│   Development: 60% · Est. preview: tomorrow                      │
│   [Watch]                                                        │
│                                                                  │
│ Planted for Later                                                │
│ ────────────────────                                             │
│                                                                  │
│ ◌ Cross-Book Connection Graph               PRO-025 · Arc 3     │
│   Planted 2027-01 · Blooms: Milestone 3c                         │
│                                                                  │
│ Recently Harvested                                               │
│ ────────────────────                                             │
│                                                                  │
│ ✓ Daily Passage Seasonality                 PRO-043              │
│   Approved 2027-03-12 · Merged v2a.4 · Decision: "Beautiful."   │
│                                                                  │
│                     ─── ◊ ───                                    │
│                                                                  │
│ [+ Plant a New Feature]    [The Archive]    [Decision Journal]   │
└──────────────────────────────────────────────────────────────────┘
```

**The garden metaphor.** Features are *planted*, not filed. They *grow*, not "progress through stages." They're *harvested* when merged, not "closed." Some are *planted for later* — seeded now, blooming in a future arc. The language matters — it shapes how the engineering leader thinks about her work. Not as project management, but as cultivation.

**Typography and layout:** Same design language as the seeker experience. Merriweather headings, Lora body, warm cream background, gold accents. Max-width 42rem (slightly wider than the reader's 38rem — this is a working page, not a reading page). Generous whitespace. Lotus dividers.

---

#### Layer 3: Stakeholder Circles

Pre-defined groups for feedback routing. The engineering leader defines circles once; assigns features to circles with one gesture.

| Circle | Members | Cadence | Access Level |
|--------|---------|---------|-------------|
| Theological Review | SRF theological advisor(s) | Per-feature | Preview + comment |
| Seeker Experience | 2–3 SRF staff | Per-feature | Preview + comment |
| Philanthropist | Funder | Monthly digest | Digest + preview on request |
| Engineering | Future team members | Per-feature | Full access |

**How feedback works.** Circle members receive a clean email: preview link, feature description (AI-drafted, engineering leader-approved), and a reply-to-comment mechanism. No login required — responses via email reply are captured. Alternatively, a simple feedback page at `/ops/feedback/{token}` with:

- Preview iframe (live Vercel branch deployment)
- Comment box (plain text, no formatting needed)
- Three response options: "Looks good" / "I have a suggestion" / "I have a concern"
- Optional name (not required — anonymous feedback is valid)

**DELTA compliance (ADR-099).** Stakeholder feedback is operational data, not seeker behavioral data. Circle membership is explicit opt-in. No tracking of when they view previews or how long they spend. Comments are stored with attribution (operational record, not surveillance).

**The engineering leader's gesture:** On any feature card, she clicks "Assign Circle" → selects one or more circles → optional personal note → send. The system generates the email, creates the feedback page, and tracks responses. When all circle members have responded (or the deadline passes), the feature surfaces in the morning brief.

---

#### Layer 4: The "Show Me" Walkthrough

On any feature with a deployed preview, a guided narration of the seeker experience.

**Implementation approach.** Not a recorded video — a live, AI-narrated tour. Claude Code generates a walkthrough script from the feature's governing DES/ADR specs and the actual deployed preview:

1. Claude reads the feature's PRO description and governing specs
2. Claude visits the Vercel preview via Playwright
3. Claude generates a narrated walkthrough: screenshots + contextual commentary
4. The walkthrough is stored as a series of annotated screenshots with voice-over text

**What the narration covers:**
- The seeker's encounter path ("A seeker reading Chapter 26 encounters 'samadhi'...")
- The interaction mechanics ("On desktop, they hover. On mobile, they tap.")
- Accessibility behavior ("Screen readers announce: 'samadhi — a Sanskrit term meaning...'")
- Principle adherence ("The definition comes from the canonical glossary, never AI-generated. PRI-01: Verbatim Fidelity.")
- Performance impact ("This adds 3KB to the page. Within the 100KB JS budget.")

**Value:** The engineering leader sees the *experience*, not the code. She evaluates at the right level — "Is this worthy of presenting Yogananda's words?" — not "Is this a good React component?"

---

#### Layer 5: The Decision Journal

Every feature decision — approve, revise, decline — is captured with timestamp, reasoning, and context.

**Data model:**

```sql
CREATE TABLE feature_decisions (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  pro_ref TEXT NOT NULL,                    -- PRO-NNN identifier
  decision TEXT NOT NULL CHECK (decision IN (
    'approve', 'revise', 'decline', 'defer'
  )),
  reasoning TEXT,                           -- engineering leader's note (optional)
  ai_recommendation TEXT,                   -- what Claude recommended
  ai_reasoning TEXT,                        -- why Claude recommended it
  principle_refs TEXT[],                    -- principles most relevant to this decision
  stakeholder_feedback_summary TEXT,        -- aggregated circle feedback
  decided_by TEXT NOT NULL,                 -- who made the decision
  decided_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**What this enables over time:**
- **Pattern recognition.** "You've revised 60% of features for accessibility. You've declined 3 features, all for PRI-08 reasons." The engineering leader sees her own design taste emerging.
- **Institutional memory.** When she moves on, her successor inherits not just the codebase but her judgment — encoded in hundreds of decision points with reasoning.
- **AI calibration.** Claude's recommendations improve based on the journal. If she consistently revises for accessibility that Claude didn't flag, Claude learns to weight accessibility higher.
- **Stakeholder transparency.** The philanthropist or SRF leadership can see: "47 features evaluated, 32 approved, 8 revised, 5 declined, 2 deferred. Average time from proposal to production: 3 days."

**Privacy:** The journal is operational metadata about the engineering process, not seeker data. It lives in the portal's Neon database, accessible from the `/ops` surface. It does not track seekers, does not contain personal data beyond the decision-maker's name.

---

#### Layer 6: The "Why Not?" Archive

Every declined or deferred feature enters the archive with full context.

Accessible from the feature catalog as "The Archive" — a searchable collection of features the portal deliberately chose not to build, each with:

- The original PRO description
- The AI impact assessment
- Stakeholder feedback (if any)
- The engineering leader's decline reasoning
- The governing principle(s) that informed the decision

**The archive as immune system.** When someone asks "Why doesn't the portal have push notifications?" the archive answers: "PRO-NNN, proposed 2027-04, declined. PRI-08: Calm Technology — 'The portal waits; it does not interrupt.' Engineering leader's note: 'This would compromise the contemplative character of the portal.'"

**The archive as wisdom.** Over years, the archive tells a story about what the portal *is* by documenting what it deliberately *isn't*. This is rare in software projects — most teams lose track of why features were rejected. The archive preserves that reasoning permanently.

---

#### Layer 7: The Resonance Score

A composite signal — not a quality metric — predicting how well a feature fits the portal's character.

**Components:**

| Signal | Weight | Source |
|--------|--------|--------|
| Principle alignment | 30% | AI analysis against 11 principles |
| Design language consistency | 20% | Does it follow established DES patterns? |
| Accessibility score | 15% | axe-core results on preview |
| Performance budget impact | 15% | JS size, FCP delta, network requests |
| Engineering leader's historical pattern | 20% | Decision journal — what she approves vs. revises |

**Not a gate.** The resonance score is advisory, never blocking. A feature with low resonance may be exactly right — it may be breaking new ground. The score is a mirror, not a judge: "Here's how this fits with everything you've built and decided so far."

**The historical pattern component** is the most interesting. It learns from the decision journal. If the engineering leader consistently approves features with generous whitespace and declines features with dense UI, the resonance score weights whitespace higher. The system learns her taste — not to replace her judgment, but to reflect it back.

---

#### A Day in Her Life (Fully Realized)

**7:30am** — Morning brief arrives by email. The portal is healthy. One feature awaits review. She reads it with her coffee. The Sanskrit hover preview looks good. Brother Ananda left a thoughtful comment about IAST transliteration. She taps "Send to Theological Review" from the email link.

**10:00am** — She has an idea: "What if the Quiet Corner played different bowls for different times of day?" She types it into the feature catalog (or tells Claude via any interface). Claude creates PRO-046, runs the impact assessment — PRI-08 check: user-initiated audio, consistent. Cost: +0.2KB per audio file. Population impact: neutral. Resonance: high. She queues it for development with one click.

**12:00pm** — The Theological Review circle has responded. 2 approvals, 1 note: "Use IAST transliteration, not Harvard-Kyoto." She adds a revision note: "Use IAST." Claude re-enters development with the feedback. No context-switching needed — everything happened in the catalog.

**2:00pm** — She opens "Show Me" on a feature she approved yesterday. Watches the 30-second walkthrough. The daily passage seasonality feature shows winter passages with subtle cool undertones. She smiles. This is beautiful. She clicks Approve, adds a note: "Beautiful." Claude merges to main, deploys to production. The portal grows.

**4:30pm** — She checks the catalog. Nothing else needs her. The Quiet Corner audio feature is growing — Claude is 60% through, estimated preview tomorrow. She can click "Watch" to see Claude working if she's curious, but she doesn't need to.

**5:00pm** — The portal tells her: "The portal is well. The Sanskrit hover revision will be ready for review tomorrow morning. The teachings are being served." She closes her laptop.

---

#### Implementation Phasing

| Phase | Milestone | What Ships | Effort |
|-------|-----------|-----------|--------|
| **Lightweight** | 2a | Morning brief (email), PRO-038 dream engine, Vercel preview links, email-based circle feedback | Days |
| **Catalog** | 3b | `/ops/features` garden UI, circle management, "Show Me" walkthrough, decision journal data model | Weeks |
| **Full** | 3b+ | Resonance score, historical pattern learning, "Why Not?" archive, stakeholder digest customization | Iterative |

**Phase 1 (Lightweight)** can function with zero custom UI — the morning brief is an email, feature management uses GitHub PRs and Vercel previews, stakeholder feedback uses email reply. This validates the workflow before building the surface.

**Phase 2 (Catalog)** builds the garden UI within the existing `/ops` page structure from DES-060. The feature catalog is a Next.js page consuming GitHub API (branches, PRs), Vercel API (previews), and the portal's own database (decisions, comments).

**Phase 3 (Full)** adds the intelligence layers — resonance scoring, pattern learning from the decision journal, and the archive as a navigable collection.

---

#### What This Is NOT

- **Not a project management tool.** No Gantt charts, no velocity tracking, no story points, no sprint boards. Features grow at their own pace. The engineering leader tends, not tracks.
- **Not a CI/CD dashboard.** DES-060 handles deployment health. PRO-042 handles the *human* lifecycle around features — decisions, feedback, institutional memory.
- **Not required for the portal to function.** Seekers never see this. If PRO-042 is never built, the portal still serves Yogananda's teachings. This serves the *people building* the portal.
- **Not surveillance of the engineering leader.** The decision journal is hers. She controls what reasoning she captures. The resonance score reflects her patterns back to her — it doesn't report them to anyone.

#### Relationship to Other Proposals

- **PRO-038 (Dream a Feature)** is the engine — autonomous development, Neon branching, Vercel preview deployment. PRO-042 is the surface — the human experience around that engine.
- **PRO-036 (Operational Health)** provides the health monitoring that feeds the morning brief's "is everything okay?" answer. PRO-042 extends that health surface with the feature lifecycle.
- **DES-060 (Operational Surface)** provides the infrastructure (`/ops` page, deploy manifests, health endpoint). PRO-042 adds feature-specific pages to that surface.
- **PRO-039 (Design-Artifact Traceability)** provides the `@implements`/`@validates` annotation convention that PRO-042's catalog uses to show which specs a feature implements.

**Re-evaluate At:** Milestone 2a (lightweight: morning brief + email circles), Milestone 3b (full catalog UI)
**Decision Required From:** Architecture (data model, integration points), human principal (stakeholder circle membership, feedback governance — who can comment on features?)

---

## Graduation Protocol

Proposals move through tiers based on evaluation and stakeholder decisions. The AI may recommend graduation or omission; the human principal decides.

### Status Lifecycle

```
Exploration (.elmer/proposals/)
  → /dedup-proposals → PRO-NNN (this file, Status: Proposed)
    → principle-check + architectural review → Status: Validated
      → stakeholder scheduling decision → Status: Adopted → [ADR/DES/Milestone refs]
    → omission decision → Status: Omitted — [reason]

ADR-NNN (DECISIONS-*.md, Status: Provisional or Active)
  → suspension decision → PRO-NNN (this file, Status: Suspended from ADR-NNN)
    → ADR body deleted from DECISIONS-*.md; index annotated (Suspended → PRO-NNN)
    → re-evaluation at arc boundary may restore to Active (recreate ADR body from PRO)
```

### Tier Definitions

- **Proposed:** Curated from explorations by `/dedup-proposals`. Thorough thinking captured but not yet checked against principles and architecture. May be adopted, refined, or omitted.
- **Validated:** Principle-checked and architecturally reviewed. Has governing ADR/DES references. Awaiting a scheduling decision.
- **Adopted:** Graduated to ADR/DES sections or milestone deliverables. PRO entry preserved with cross-references to adopted identifiers.
- **Suspended:** Was an active or provisional ADR/DES, moved to unscheduled. Architectural reasoning preserved in the original ADR/DES body; scheduling lifecycle managed here.
- **Omitted:** Evaluated and explicitly excluded. Rationale preserved for institutional memory. Cross-reference DES-056 § Explicitly Omitted if applicable.

### Arc Boundary Review

At every arc boundary:

1. **Deferred/Suspended items first.** They were already scoped — re-evaluate before new proposals.
2. **Validated items.** Consider for the upcoming arc. Stakeholder decision required.
3. **Proposed items.** Principle-check any relevant to the next arc's narrative theme.
4. **Proposed → Validated:** Requires principle-check (does it violate any of the 11 principles?) and architectural review (does it fit the existing design, or does it need new ADRs?).
5. **Validated → Adopted:** Stakeholder decision. Add deliverables to the target arc's section in ROADMAP.md. Create ADR/DES sections as needed.
6. **Any tier → Omitted:** Record rationale in the PRO entry. Add to DES-056 § Explicitly Omitted if the feature was publicly visible.

### Proposal Types

Different types graduate through different paths:

| Type | Graduates To | Skill |
|------|-------------|-------|
| Feature | ADR + DES section + milestone deliverables | `/proposal-merge` |
| Theme | Taxonomy entries, terminology bridge, enrichment pipeline | `/theme-integrate` |
| Policy | ADR amendment or new ADR | `/proposal-merge` |
| Enhancement | Milestone deliverable (may not need new ADR) | `/proposal-merge` |

---

## Intake Protocol

### From Explorations

Raw explorations in `.elmer/proposals/` are unvetted AI ideation. They enter this registry through `/dedup-proposals`:

1. `/dedup-proposals` scans `.elmer/proposals/`, clusters by topic similarity
2. Each consolidated cluster becomes a PRO-NNN entry with `Status: Proposed`
3. Original exploration files are preserved in `.elmer/proposals/` (or archived to `.elmer/proposals/archived/`) as historical artifacts
4. PRO entries carry curated summaries and scheduling metadata, not raw exploration prose

### From ADR/DES Suspension

When an existing ADR or DES section is suspended (moved to unscheduled):

1. Create a PRO-NNN entry with `Status: Suspended from ADR-NNN` (or DES-NNN). Preserve any reasoning worth keeping in the PRO body.
2. **Delete** the ADR/DES body from its DECISIONS/DESIGN file. No stubs — clean deletion.
3. Annotate the DECISIONS.md index entry: `(Suspended → PRO-NNN)`.
4. The PRO entry is the single source of truth for suspended decisions — handles reasoning, reactivation triggers, and scheduling lifecycle.

---

### PRO-043: Teachings Platform — Shared Foundation for SRF and YSS

**Status:** Proposed
**Type:** Feature (Platform Architecture)
**Governing Refs:** PRO-033 (YSS Locale Branding — subsumed), ADR-075 (Multilingual Foundation), ADR-077 (Language Selection), ADR-078 (Translation Policy), ADR-128 (Reachable Population), ADR-011 (API-First), ADR-079 (suspended), PRO-034 (Magazine API)
**Target:** Design decisions in Arc 1; content activation incremental from Milestone 5b onward (or earlier if Hindi authorization proceeds)
**Dependencies:** Working API (Milestone 1c). Hindi authorization conversation with YSS. Content availability in Tamil, Telugu, Kannada.

#### The Reframe

PRO-033 frames YSS as a branding variant — different colors and logos for Hindi/Bengali locales. But YSS is not a locale. Yogoda Satsanga Society of India was founded by Paramahansa Yogananda in 1917. It is SRF's sister organization — independent governance, independent properties (yssofindia.org, WordPress + WPML), 9 supported Indian languages (English, Hindi, Bengali, Kannada, Tamil, Telugu, Gujarati, Marathi, Malayalam), a Lessons program in 4 languages (English, Hindi, Tamil, Telugu), physical ashrams across India, a bookstore with Indian payment rails (Razorpay), and a mobile Lessons app.

The portal's API-first architecture (ADR-011) already means we're building a platform. We just haven't named the second consumer. Same philanthropist funding covers both organizations. The question is not "how do we skin the portal for Hindi?" but:

> How does the teachings platform serve two independent organizations as equal partners — sharing what benefits both, while respecting each one's autonomy?

#### YSS Value Proposition — Conversation Sequencing

The authorization conversation is extractive if it leads with "we need your Hindi text." It becomes reciprocal when it leads with value:

1. **Deliver first.** English search widget for yssofindia.org — a Web Component that drops into any WordPress page, branded YSS, zero maintenance. YSS sees the platform working before being asked to contribute.
2. **Name the platform neutrally.** "Yogananda Teachings Platform" — not "SRF Online Teachings Portal." Language matters in organizational conversations.
3. **Ask second.** With the widget demonstrating value, the Hindi authorization conversation becomes "shall we extend this to Hindi seekers?" rather than "can we have your text?"
4. **Empower, don't extract.** Offer methodology transfer (AI-human collaboration, design documentation as institutional memory), development tooling (Claude Code skills for YSS integration), and technology choice (WordPress, React, or anything that calls REST).

The timeline also matters. If the authorization conversation happens *after* the English portal launches (late 2026), Hindi activation could be 2027+. If it happens *during* Arc 1 development, Hindi could ship months earlier — potentially alongside or shortly after Spanish.

#### Platform Architecture: Shared Engine, Independent Surfaces

```
SHARED ENGINE (one instance, both organizations benefit)
├── Corpus database (Neon, all languages, all content types)
├── Hybrid search (BM25 + vector + RRF, per-language indexes)
├── Content ingestion pipeline (source-agnostic, 12 steps)
├── AI enrichment (themes, entities, relations — deterministic)
├── Knowledge graph (cross-language, cross-author connections)
├── Embedding index (Voyage voyage-3-large, 26 languages)
└── REST API (/api/v1/*, language param, org param where needed)

ORGANIZATION CONFIG (per-org settings, not multi-tenancy)
├── Brand tokens (colors, fonts, logos)
├── Language matrix (which languages this org surfaces)
├── Bookstore routing (SRF Bookstore vs YSS Bookstore per language)
├── Practice Bridge routing (SRF Lessons vs YSS Lessons)
├── Feature flags (which platform features this org has selected)
└── Domain / URL strategy

SURFACE OPTIONS (each organization selects)
├── Full portal deployment (Next.js, org-configured)
├── Embeddable widgets (search, passage, theme — Web Components)
├── API integration (REST endpoints, documented, versioned)
└── App integration (API powering mobile Lessons app)
```

The shared engine is exactly what we are building. The organization config is a lightweight configuration layer. The surface options are natural consequences of the API-first architecture.

#### Component 1: Hindi Authorization Partnership

YSS has the authorized Hindi *Autobiography of a Yogi*. The entire Milestone 5b deferral was based on ebook purchasing logistics, not content availability. YSS authorization of the Hindi source text for the shared corpus could unblock Hindi activation — ~425M reachable people, comparable to Spanish (~430M).

If authorized, Hindi could enter the execution sequence after Spanish, potentially as a parallel workstream during Milestone 1c or as a dedicated milestone. The language readiness gate (ADR-077) still applies: text ingested + UI strings translated + human reviewer confirmed + search quality evaluation passes.

**Action needed:** Conversation with YSS about authorizing the Hindi text for shared corpus use.

**Hindi Vocabulary Bridge.** The Vocabulary Bridge (ADR-129) for Hindi is a separate artifact, not a translation of the English bridge. Hindi spiritual vocabulary carries distinct cultural weight — *dhyan* (ध्यान), *sadhana* (साधना), *kriya* (क्रिया) map differently than their English approximations. The Hindi bridge should be co-created with YSS editorial input to ensure cultural fidelity. Additionally, Hindi seekers commonly type in Roman script ("yogananda dhyan"); the search pipeline needs a Romanized-to-Devanagari transliteration step using fastText (already in stack for language detection) + `indic-transliteration`. This is genuinely new technical scope not present in any Latin-script language workstream.

#### Component 2: Bidirectional Content Contribution

YSS-published editions of Yogananda's works carry full lineage authority — Yogananda founded YSS. These are not third-party texts. Tamil, Telugu, and Kannada editions (if they exist as YSS publications) enter the corpus through the same ingestion pipeline with the same quality gates. Languages enter the platform without expanding SRF's 10-language scope commitment — each organization determines which languages it surfaces.

By ADR-128 reachable population metrics, YSS-contributed languages are significant:

| Language | Speakers | Internet % | Reachable | Equivalent Tier |
|----------|----------|------------|-----------|-----------------|
| Tamil | ~85M | ~60% | ~51M | Tier 2 |
| Telugu | ~96M | ~60% | ~58M | Tier 2 |
| Kannada | ~64M | ~60% | ~38M | Tier 2–3 |

Together ~147M reachable people — more than Portuguese (Tier 2, ~145M) or any individual Tier 3 language.

**Content provenance** is attribution metadata, not a search signal. A Tamil passage from YSS's edition is attributed to Yogananda with publication source noted. Language matching provides natural audience curation — Hindi content serves Hindi seekers regardless of which organization contributed it. No organizational relevance bias in search ranking.

#### Component 3: Magazine Content

Both SRF and YSS publish magazines with teaching-relevant articles. Magazine content enters the shared corpus through the same 12-step pipeline (DES-005) with a magazine-specific source adapter. DES-053 (Unified Content Pipeline Pattern) already handles multiple content types.

Magazine-specific considerations: `content_type` distinguishes from book chapters; `publication_date` enables temporal discovery; organizational source is attribution metadata. Search treats all content equally — Yogananda's words are Yogananda's words. See also PRO-034 (Magazine API Rationalization, currently suspended).

#### Component 4: Organization Configuration Layer

Lightweight configuration, not multi-tenancy:

```
/lib/config/organizations/srf.json   — SRF brand tokens, language matrix, routing
/lib/config/organizations/yss.json   — YSS brand tokens, language matrix, routing
```

| Config | SRF | YSS |
|--------|-----|-----|
| Primary color | Navy `#1a2744` | Rust/Terracotta `#bb4f27` |
| Accent | Gold `#dcbd23` | (TBD — from YSS design review) |
| Heading font | Merriweather | Raleway (per yssofindia.org) or TBD |
| Body font | Lora / Merriweather | TBD (review with YSS) |
| Devanagari | Noto Serif/Sans Devanagari | Same (shared typography research, ADR-080) |
| Bookstore URL | srfbookstore.org | yssofindia.org/bookstore |
| Practice Bridge | srflessons.org | yssofindia.org/lessons |
| Languages | EN, ES, HI, PT, BN, DE, JA, FR, IT, TH | HI, BN, TA, TE, KN, EN (+ others per YSS) |

API endpoints that return bookstore links or Practice Bridge routing accept an optional `org` parameter. Search, content, themes, and knowledge graph endpoints are organization-agnostic.

**Early proof-of-concept: Earth reader theme.** The "Earth" color theme (terracotta accent `#bb4f27`, clay-paper background) was implemented as a standalone reader feature — the sixth theme in the Auto → Light → Sepia → Earth → Dark → Meditate progression. It validates that the theme system supports accent-color variation per context without organizational infrastructure. When the organization configuration layer ships, Earth becomes the natural default theme for Hindi locale — cultural welcome without explicit branding. See DES-006 § Earth theme.

**Organizational provenance via source edition.** The deferred `organization` column may be unnecessary. Each book edition already carries a publisher in its metadata — "Self-Realization Fellowship" or "Yogoda Satsanga Society of India." Source edition → publisher provides organizational provenance without adding an explicit column. Language matching handles audience separation naturally. If a future use case genuinely requires an `organization` column, it can be added as a simple migration — but the burden of proof is on demonstrating that edition-based provenance is insufficient.

#### Component 5: Surface Options — Parts or Whole

YSS selects their integration level:

**Option A: Embeddable Widgets (lowest friction).** Web Components that drop into any WordPress page. Search widget, passage display, theme explorer. Configurable branding via attributes. YSS team needs no Next.js skills.

**Option B: API Integration (medium friction).** YSS developers or their mobile Lessons app call REST endpoints directly. Full control over presentation. Documented, versioned API per ADR-011.

**Option C: Full Portal Deployment (highest value).** The Next.js portal configured with YSS branding, language matrix, and routing. Separate domain (e.g., `teachings.yssofindia.org`). Shared API backend.

All three can coexist — YSS might embed a search widget in yssofindia.org (A), power their Lessons app with the API (B), and later deploy a full YSS teachings portal (C).

#### Component 6: Feature Select-In Model

Each portal capability is independently adoptable:

| Feature | SRF | YSS Priority | Notes |
|---------|-----|-------------|-------|
| Hybrid search | Core | Core | Same engine, per-language |
| Reading experience | Full | Widget or portal | Shared Devanagari typography |
| Practice Bridge | → SRF Lessons | → YSS Lessons | Same concept, different routing |
| Presentation mode (M2b-15) | Full | **High** | Communal reading primary in India |
| Passage sharing (WhatsApp) | Full | **High** | WhatsApp dominant in India |
| Knowledge graph | Full | Selectable | Cross-language connections |
| Theme browser | Full | Selectable | Theme priorities may differ |
| Quiet Corner | Full | Selectable | Contemplative micro-sanctuary |
| Bookstore integration | SRF Bookstore | YSS Bookstore | Per-org routing |
| Ashram/center finder | Not planned | **YSS-developed** | New capability, could generalize |

**Minimal Presentation Mode.** Communal reading (satsang, group study) is primary in Indian devotional culture, not secondary. A CSS toggle (~50–100 lines) that strips navigation chrome for projected/shared reading could ship in Milestone 2a — high value for YSS at minimal technical cost. This is a design decision, not a feature — "display the same content with less chrome."

YSS can also develop new capabilities — ashram finder, Dhyana Kendra schedule, India-specific entry paths — that may flow back to the shared platform if generalized.

#### Component 7: Development Empowerment

YSS's technical capacity is unknown. The platform should empower regardless of capacity level:

- **Platform documentation as AI development context.** The design docs (DESIGN.md, ADRs, design files) serve as context for AI-assisted development. A YSS developer using Claude Code loads platform docs and builds on the API with full architectural understanding.
- **Custom Claude Code skills** for YSS integration tasks: widget embedding, language addition, content contribution workflows.
- **Methodology transfer.** The AI-human collaboration model, design documentation as institutional memory, ADR-driven decisions — a practice YSS could adopt for their own properties.
- **Technology choice.** YSS may prefer WordPress integration, a separate React app, or a framework entirely of their choosing. The API-first architecture supports all.

#### Component 8: Content Governance

Each organization governs its contributed source text through the ingestion process (editorial review, authorization, quality gates). The enrichment pipeline is shared and deterministic — same AI model, same theme taxonomy, same entity resolution. Content that passes the language readiness gate (ADR-077) becomes part of the shared corpus.

Human editorial overrides (theme corrections, entity fixes) are per-content, not per-organization. Once a text enters the corpus, it is Yogananda's teaching — attributed to its publication source but not organizationally siloed.

Governance questions to resolve: Who triggers re-ingestion when errors are found? Does each organization maintain editorial authority over contributed texts? Lightweight governance that respects both organizations' authority without creating bureaucracy.

#### Component 9: The SRF/YSS App as Integration Surface

The existing SRF/YSS mobile app (iOS/Android) has an eReader for the private Lessons. The portal's API could power discovery features within that app:
- Search published teachings from the Lessons app → portal search API
- Thematic connections between Lessons content and published books → knowledge graph API
- "Read more about this topic" → portal reading experience or API-served content

This is high-value, low-friction integration — the API exists, the app exists, the connection is an API call.

#### Phased Approach

| Phase | When | What |
|-------|------|------|
| **Design** | Arc 1 | Organization config structure. API parameter design. Widget architecture decisions. Documented in this PRO and successor ADR/DES when adopted. |
| **Hindi activation** | When YSS authorizes | Hindi source text enters ingestion pipeline. Language readiness gate (ADR-077) determines activation timeline. Could be Arc 1 or early Arc 2. |
| **API + Widgets** | Milestone 2a+ | Organization-aware API parameters. Embeddable search widget with configurable branding. YSS can integrate into yssofindia.org. |
| **Content expansion** | Milestone 5b+ | Tamil, Telugu, Kannada editions enter corpus. Magazine content from both organizations. Each clears readiness gate independently. |
| **Full deployment** | When YSS is ready | YSS-branded portal deployment if desired. Same codebase, different configuration. |

#### Subsumption of PRO-033

PRO-033 (YSS Locale Branding) is one facet of this broader platform proposal. Locale-specific branding (colors, logos, organizational identity for Hindi/Bengali locales) is addressed by Component 4 (Organization Configuration Layer). PRO-033 is subsumed, not invalidated — its concerns are fully covered here.

#### What This Changes Architecturally

| Layer | Change | Cost |
|-------|--------|------|
| `/lib/config/organizations/` | Per-org JSON config files | Trivial |
| API endpoints | Optional `org` param on content responses (bookstore links, Practice Bridge routing) | Small |
| Design tokens | Exportable per-org token sets | Medium |
| Widget build target | Web Components build of search/passage/theme components | Medium |
| Content pipeline | Already source-agnostic — no change needed | Zero |
| Search engine | Already per-language — no change needed | Zero |
| Database schema | No changes now. Defer `organization` column until model is vetted. | Zero |

#### What This Does NOT Change

Search engine architecture, enrichment pipeline, knowledge graph, API conventions (ADR-110), core reading experience, accessibility infrastructure, DELTA compliance, or the 11 principles. The platform's spiritual character is unchanged — only its organizational reach expands.

**Re-evaluate At:** Arc 1 boundary (design decisions), Hindi authorization progress, Milestone 5b planning
**Decision Required From:** Human principal (YSS stakeholder conversation), Architecture (config structure, API parameters, widget architecture)
**Origin:** Strategic exploration — YSS platform partnership architecture (2026-03-01)

---

### PRO-044: Cross-Site Harmony — yogananda.org Ecosystem Integration

**Status:** Proposed
**Type:** Feature (Experience)
**Governing Refs:** PRI-04 (Signpost, not destination), ADR-104 (Practice Bridge), ADR-122 (Crisis Detection), DES-029 (Quiet Index), DES-042 (Glossary Architecture), DES-054 (Knowledge Graph), PRO-043 (YSS Platform)
**Target:** Incremental from M2a through Arc 2
**Dependencies:** Centralized link registry (implemented: `/lib/config/srf-links.ts`)

#### Context

yogananda.org is a 9-subdomain ecosystem with 7 navigation sections, 8 languages (en/de/es/fr/it/pt/ja/th — notably no Hindi), and three content goldmines the portal doesn't yet fully leverage:

1. **How-to-Live Wisdom** — 22 canonical SRF thematic categories at yogananda.org/how-to-live-wisdom. SRF's own editorial taxonomy of Yogananda's teachings.
2. **SRF Glossary** — ~100+ Sanskrit/spiritual terms at /self-realization-fellowship-glossary with full definitions, pronunciation, and cross-references.
3. **Practice resources** — Beginner's meditation, guided meditations, prayer requests, free literature — all natural signpost targets.

#### Three-Room Model

- **yogananda.org** = The living room. Community, events, practice instruction, organizational presence, giving.
- **Portal (teachings.yogananda.org)** = The reading room. The words themselves — searchable, contemplatable, shareable.
- **SRF/YSS app** = The practice room. Personal meditation companion, Lessons delivery, daily inspiration.

The boundary between rooms should be invisible to the seeker. A search for "overcoming fear" returns passages from the Autobiography *and* surfaces yogananda.org/conquering-fear-anxiety-and-worry. Two sites, one coherent response.

#### Component 1: Centralized Link Registry

**Implemented:** `/lib/config/srf-links.ts` — all external SRF URLs organized by the three-room model (SRF, SRF_TEACHINGS, SRF_PRACTICE, SRF_COMMUNITY, SRF_ORG, SRF_BOOKSTORE, SRF_SOCIAL, YSS, PORTAL). Includes all 22 WISDOM_CATEGORIES with slugs and labels.

Components import from this registry instead of hardcoding URLs. When SRF restructures their site, one file updates.

#### Component 2: Wisdom Category Cross-Linking (Arc 2)

The 22 How-to-Live Wisdom categories become seed nodes for the Quiet Index (DES-029) and knowledge graph (DES-054). The AI enrichment pipeline tags chunks with these categories when thematically relevant. Search results about fear, happiness, prayer, etc. gain a "Related on yogananda.org" link to the appropriate wisdom topic page.

This is the Rosetta Stone between SRF's editorial voice and our AI semantic search.

#### Component 3: Glossary Integration (Arc 2)

The SRF glossary is the canonical vocabulary for DES-042. Portal glossary entries link to or wrap the SRF glossary's authoritative definitions. In-text term detection (from the entity registry's 12 Sanskrit terms + expansion) triggers contextual links. PRI-01 applies: glossary definitions are SRF's published content, rendered verbatim.

#### Component 4: Expanded Practice Bridge

Current: links to SRF Lessons only. Proposed expansion:

| Signal | Signpost |
|--------|----------|
| Meditation queries | → Beginner's meditation, guided meditations |
| Prayer/healing queries | → Prayers and affirmations, prayer request |
| General curiosity | → Free literature, SRF app |
| Crisis detection | → 988 Lifeline (existing) + prayer request |

All URLs sourced from `SRF_PRACTICE` in the link registry.

#### Component 5: Cross-Site Language Hospitality

yogananda.org supports 8 languages; our portal supports 2 (en, es). When locale detection finds de/fr/it/ja/th, show a gentle banner: "This portal is available in English and Spanish. Visit yogananda.org for [language name]." Not a dead end — an honest redirect (PRI-02: honest absence as invitation).

As the portal adds languages, the banner narrows. Hindi (when activated via YSS, PRO-043) won't trigger it — yogananda.org doesn't have Hindi either.

#### Component 6: Privacy Boundary

yogananda.org uses Amplitude with cross-domain tracking. Our portal uses DELTA-compliant analytics (PRI-09). A seeker clicking from yogananda.org to our portal loses their Amplitude session — by design. This is correct behavior. SRF should be informed that the privacy boundary is intentional, not a bug.

#### What This Does NOT Change

Search engine architecture, reading experience, accessibility, DELTA compliance, calm technology principles. This proposal adds *outbound links* and *inbound taxonomy alignment* — it does not modify the portal's core identity.

**Re-evaluate At:** M2a completion, Arc 2 planning
**Decision Required From:** Architecture (wisdom category mapping, glossary integration depth), Human principal (SRF coordination for bidirectional linking)
**Origin:** Ecosystem exploration via Playwright MCP snapshots of yogananda.org (2026-03-02). Full findings: `.elmer/proposals/yogananda-org-ecosystem-exploration.md`

### PRO-045: Visual Design Language System — AI-First Design Tokens

**Status:** Proposed
**Type:** Feature (Platform)
**Governing Refs:** PRI-03 (Honoring the Spirit), PRI-07 (Accessibility), PRI-08 (Calm Technology), PRI-10 (10-year horizon), PRI-12 (AI-Native Development), ADR-065 (Design System), ADR-080 (Hindi Typography), PRO-043 (YSS Platform Partnership), PRO-044 (Cross-Site Harmony)
**Target:** Immediate (Arc 1 — independent of portal milestones)
**Dependencies:** None — standalone repository, portal is first consumer but not a dependency.
**Repository:** `rana/yogananda-design` (GitHub, created 2026-03-02)

#### Context

The portal has a complete, production-ready design token system embedded in `app/globals.css`, `lib/config.ts`, and `lib/services/preferences.ts`. Six color themes, circadian color temperature, self-hosted fonts, Hindi typography infrastructure, behavioral timings. But these are framework-coupled CSS custom properties — not extractable, not machine-queryable, not consumable by non-portal projects.

When AI (the primary builder, PRI-12) designs a component, it cross-references 6+ files and 4+ ADRs to synthesize the correct visual treatment. A structured, AI-readable design language specification makes this knowledge queryable from a single source.

#### What It Is

A standalone repository (`yogananda-design`) containing the canonical visual design language for the Yogananda digital ecosystem. Three layers:

1. **Foundations** (`*.tokens.json`) — W3C Design Tokens Community Group (DTCG) format. Quantifiable tokens: colors, typography, spacing, duration, shadows. Organization-specific files (SRF, YSS) plus shared foundations. Every token has `$description` and `$extensions` with principle reference, rationale, and evaluation trigger.

2. **Semantics** (`*.language.json`) — Custom format. Design language rules: emotional registers (sacred/reverential/instructional/functional/ambient), attention gradient (gold opacity hierarchy), calm technology constraints (forbidden + required patterns), accessibility requirements, typographic conventions per script.

3. **Patterns** (`*.pattern.json`) — Custom format. Composition recipes: pre-composed molecules (passage card, search result, chapter transition). Named combinations of Layer 1 tokens governed by Layer 2 semantics. Implementation-agnostic.

Plus: self-hosted font files, lotus SVG motif, font manifest, brand image guidelines.

#### Two Organizations, Shared Foundations

SRF and YSS are distinct visual expressions of shared design foundations:
- **SRF** — "Entering a library." Navy (#1a2744), Gold (#dcbd23), Cream (#FAF8F5). Merriweather/Lora/Open Sans. Contemplative cool, scholarly warmth.
- **YSS** — "Entering an ashram." Terracotta (#bb4f27), Clay (#f2e8de). Noto Serif Devanagari/Raleway. Devotional warmth, Indian earth tones. **Scaffold** — awaiting YSS editorial input.

Shared: calm technology constraints, accessibility minimums, behavioral timings, emotional registers, content-to-treatment mappings.

#### Innovation: What No Existing Design System Has

1. **Emotional registers** — content types map to reverence levels. Guru's words get different treatment than navigation chrome.
2. **Attention gradient** — a calibrated hierarchy from interactive (gold at 1.0) to subliminal (gold at 0.06) to texture (noise at 0.03).
3. **Constraint-first architecture** — the forbidden list (calm technology rules) is as structured and machine-readable as the color palette.
4. **AI-first authorship** — designed for machine consumption. `$description` fields are the primary documentation. `$extensions` embed rationale without requiring ADR cross-reference.

#### Consumers

- **yogananda-teachings** (portal) — SRF design language. Primary consumer. CI lint validates portal CSS against design tokens.
- **yogananda-platform** — Infrastructure dashboard. Lighter brand touch.
- **Future YSS surface** (PRO-043) — YSS design language. Second consumer when activated.
- **PDF generation** (ADR-050) — Shared tokens for consistent output.
- **Style Dictionary / Tokens Studio** — Generate CSS, SCSS, Android XML, Swift from same tokens.
- **Figma** (PRO-027, when activated) — DTCG format is Figma Variables-compatible.

#### What This Does NOT Change

Portal implementation, search architecture, reading experience behavior, DELTA compliance, content pipeline. The design repo is a canonical reference that the portal validates against — not a runtime dependency. The portal continues to own its CSS; the design repo owns the design *intent*.

#### MCP Server (Future)

Not needed now — token files are small enough for any context window. Becomes valuable when the system needs computation: contrast validation, theme+circadian+locale resolution, composition guidance. Architect for it (structured data, standard format); build when 2+ active consumers exist.

**Re-evaluate At:** PRO-043 activation (YSS surface), Arc 2 planning
**Decision Required From:** Architecture (CI lint integration, direction of derivation), Human principal (YSS visual identity approval)
**Origin:** Design exploration 2026-03-02

---

### PRO-046: Circadian as Independent Behavior Modifier

**Status:** Proposed
**Type:** Enhancement (Experience)
**Governing Refs:** PRI-08 (Calm Technology), DES-011 (Circadian Color Temperature), PRO-045 (Design Language System)
**Target:** Arc 1 — can ship with any milestone
**Dependencies:** PRO-045 (design language CSS layer provides `circadian.css`)

#### Context

DES-011 specifies circadian color temperature — subtle background warmth shifts by time of day (cooler cream in morning, warmer in evening). Currently embedded invisibly inside the "Light" theme in yogananda-teachings: when a user picks Light (or Auto resolving to light), CircadianProvider silently sets `data-time-band` on `<html>`. There is no user-visible indication this is happening, and no way to get a static light theme without circadian shifts.

This violates least-surprise. A user who picks "Light" expects a fixed, predictable surface. Circadian is a different proposition — it's calm (PRI-08) but also opinionated about subtly changing what you see.

#### What This Changes

Separate circadian from theme choice. Circadian is a **behavior modifier**, not a theme.

| Axis | What it controls | How it's set |
|------|-----------------|--------------|
| Theme | Colors, contrast, mood | `data-theme` attribute, user picks from gallery |
| Circadian | Background warmth shift by time of day | `data-time-band` attribute, independent toggle |

**Design language (yogananda-design):** Already correct. `circadian.css` is a separate file, activated by `data-time-band`, guarded to light themes only. No change needed.

**Consumer (yogananda-teachings):** Needs UI change:
- Remove automatic CircadianProvider activation from Light theme
- Add an independent circadian toggle in reader preferences, only visible when the active theme resolves to a light background
- Persist the preference alongside theme choice
- When circadian is on, CircadianProvider sets `data-time-band` based on local time
- When circadian is off, `data-time-band` is never set — static background

#### Why Not a 7th Theme?

Circadian is not a peer of dark/sepia/earth. It's a behavior layered on top of any light theme. Making it a theme card implies mutual exclusion with Light — but circadian-on-sepia and circadian-on-sandstone are equally valid. The independent toggle is more honest: circadian is DES-011 (a behavior), not DES-008 (a theme).

#### Scope

Small. The CSS guard already exists in the design language. The teachings consumer needs:
1. Remove auto-activation of CircadianProvider from Light theme
2. Add toggle to reader preferences panel
3. Persist preference in user settings
4. Guard CircadianProvider behind the preference

#### What This Does NOT Change

The circadian CSS itself, theme definitions, color values, or any other design language surface. This is purely about user control — when circadian activates, not what it does.

**Re-evaluate At:** User testing of reader preferences
**Decision Required From:** UX (toggle placement), Human principal (default state: on or off)
**Origin:** Design review 2026-03-03

---

### PRO-047: Offline-First Sacred Reading — Proactive Chapter Download

**Status:** Proposed
**Type:** Enhancement (Experience)
**Governing Refs:** PRI-05 (Global-First), PRI-03 (Honoring the Spirit), ADR-006 § 4 (Intermittent Connectivity), ADR-012 (PWA)
**Target:** Arc 2–3 (evaluation); implementation depends on corpus size and Service Worker maturity
**Dependencies:** Service Worker infrastructure (M2b — already shipped), multi-book corpus (M3a+)

#### Context

ADR-006 § 4 establishes the portal's offline posture as *offline-tolerant*: the Service Worker caches the app shell (M1c), extends to all pages and fonts (M2a), and reactively caches the last-read chapter (M2b). The offline indicator says: *"You're reading offline. Search requires a connection."*

This posture handles the common case — re-reading what you just read when connectivity drops. But it does not serve the seeker who *anticipates* being offline: the devotee heading to a retreat center without WiFi, the monk in a rural ashram, the seeker on a long bus ride in Bihar. These seekers know they will be offline. They need to prepare.

The current design treats offline as a degradation to recover from. For sacred text reading — where seekers reread passages as spiritual practice — offline could be the *primary* mode.

#### What This Proposes

A "Save for offline" capability in the book reader:

1. **Chapter download.** A download icon in the chapter reader header. Tapping it caches that chapter's full HTML + CSS in the Service Worker. A subtle lotus indicator shows which chapters are saved. No account needed — uses Cache API directly.

2. **Book download.** On the book landing page, a "Save entire book for offline" button. Downloads all chapters progressively (background fetch if supported, sequential fetch otherwise). Progress indicator. Stored in Service Worker cache with content-hashed keys.

3. **Offline library view.** The `/bookmarks` page (or a new `/library/offline` section) shows what's cached locally. Seekers can manage their offline library — remove chapters, see storage used, refresh stale content.

4. **Offline search (limited).** Over downloaded chapters only — simple text search using a client-side index (e.g., lightweight trigram matching over cached chapter text). Not the full hybrid search — just "find this phrase in what I've downloaded." Better than nothing when the seeker remembers a phrase but not which chapter.

5. **Download queue.** If the seeker requests a book download on a slow connection, queue the chapters and sync them as bandwidth allows. Resume interrupted downloads. Notify when complete (if notification permission granted — never push; PRI-08).

#### What This Does NOT Change

Search architecture (server-side hybrid search remains primary), content pipeline, API design, analytics posture, authentication model. This is purely a Service Worker and client-side enhancement.

#### Sizing

Medium. The Service Worker infrastructure exists. The main work is UI (download controls, offline library, progress indicators), background fetch logic, and client-side search index. Estimated: 3–5 days implementation, 1–2 days testing.

#### Open Questions

- Storage limits vary by device. A full book (~500KB–2MB HTML) is small, but 15 books × 10 languages = 150–300MB. Need a storage budget and graceful handling when quota is exceeded.
- Should offline content expire? Or is cached sacred text permanent until the seeker removes it?
- Background Fetch API has limited browser support (~70%). Progressive enhancement: browsers without it get sequential download. Is this sufficient, or should the feature wait for broader support?

**Re-evaluate At:** M3a completion (multi-book corpus provides realistic test), Arc 2 planning
**Decision Required From:** Architecture (storage strategy, client-side search approach), Human principal (whether offline-first aligns with the portal's identity or over-engineers for a minority use case)
**Origin:** Explore-act analysis of PRI-05 offline posture gap, 2026-03-03

---

### PRO-048: Platform Operations Dashboard — Batch Job Visibility

**Status:** Proposed
**Type:** Feature (Platform)
**Governing Refs:** PRO-036 (Operational Health Surface), PRO-042 (Feature Lifecycle Portal), DES-060 (Platform Architecture), ADR-095 (Observability)
**Origin:** Greenfield UX session, 2026-03-04 — recognized during Golden Thread enrichment that batch operations have no visibility surface.

#### Problem

The portal relies on several batch enrichment operations with no operational visibility:

1. **Embedding generation** — compute vector embeddings for all book chunks
2. **Similarity computation** (M3c-1) — cosine similarity across all chunk pairs, populate `chunk_relations`
3. **Relation labeling** (`generate-labels.ts`) — Claude Opus classifies and labels each relation
4. **Rasa classification** (DES-061) — AI-derived aesthetic flavor per chapter
5. **Future:** theme extraction, people tagging, external reference linking

These jobs run from CLI scripts with console output only. No progress tracking, no historical record, no way to know if they completed or failed without SSH access.

#### Proposal

A **Platform Operations** page (within yogananda-platform or as an admin route) that surfaces:

- **Job registry** — all known batch operations with last-run timestamp, status, duration
- **Live progress** — for running jobs: items processed / total, estimated completion, current rate
- **History** — past runs with success/failure, items affected, errors encountered
- **Trigger controls** — ability to start/restart jobs with parameters (e.g., `--incremental`, `--book-id`, `--dry-run`)
- **Dependencies** — visual indication of job ordering (embeddings before similarity, similarity before labels)

#### Architecture Sketch

- **Job metadata table** in Neon: `batch_jobs(id, job_type, status, started_at, completed_at, progress_current, progress_total, error, parameters)`
- **Progress reporting** — each script writes progress to the table at intervals (every N items or every 10s)
- **API routes** — `GET /api/v1/ops/jobs` (list), `POST /api/v1/ops/jobs/:type/run` (trigger)
- **SSE or polling** — live progress updates to the dashboard
- **Auth required** — admin-only access (ties into whatever auth solution is adopted)

#### Relationship to Existing Proposals

- **PRO-036** (Operational Health Surface) covers SLIs, uptime, error rates — this proposal covers *batch job* visibility specifically
- **PRO-042** (Feature Lifecycle Portal) is broader (spec-to-deploy traceability) — this is the narrow operational slice for data enrichment
- Could be a tab or section within the platform operations surface envisioned by PRO-036

#### Open Questions

- Should this live in yogananda-platform (separate admin surface) or as a protected route in yogananda-teachings?
- pg_cron (PRO-006) could schedule recurring enrichment — should this dashboard also manage schedules?
- How much job orchestration is needed? Simple sequential scripts vs. a lightweight job queue?

**Re-evaluate At:** When M3c-1 (similarity computation) is built, or when any batch job fails silently in production.
**Decision Required From:** Architecture (where the ops surface lives, job storage approach)

### PRO-049: Parting Word — Contemplative Chapter Closure

**Status:** Deferred
**Type:** Enhancement (Experience)
**Governing Refs:** PRI-01 (verbatim fidelity), PRI-02 (attribution), PRI-08 (calm technology)

**Concept:** A curated Yogananda quotation shown at the bottom of each chapter as a contemplative farewell — a brief moment of stillness before the reader moves on. Date-seeded for SSR determinism (same passage for all readers on a given day). Ten verbatim passages from *Autobiography of a Yogi* with full attribution.

**Why Deferred:** During greenfield UX review, the bottom-of-chapter quote was experienced as distracting — pulling attention away from the chapter's own content rather than adding closure. The reading surface should end with the author's own words, not an editorially selected quotation.

**Component:** `app/components/PartingWord.tsx` (implemented, removed from chapter page, retained for future use).

**Re-activate When:** The reading journey has a natural multi-chapter flow where a contemplative pause between chapters serves the reader's rhythm — e.g., after implementing chapter-to-chapter navigation or a "reading session" concept.

---

### PRO-050: Unified Identifier System — FTR Replaces ADR + DES + PRO

**Status:** Proposed
**Type:** Governance (Documentation Architecture)
**Governing Refs:** ADR-098 (Documentation Architecture), PRI-12 (AI-Native Development), PRI-08 (Calm Technology)
**Origin:** Principal-directed design exploration 2026-03-05
**Decision required from:** Human principal (governance change to institutional memory)

#### Problem Statement

The project uses three identifier types — ADR (Architecture Decision Records), DES (Design Sections), and PRO (Proposals) — inherited from a conventional multi-role team model where architects decide, designers specify, and developers implement. PRI-12 collapsed these roles: the AI is architect, designer, implementer, and operator. The human principal directs strategy, stakeholder decisions, and editorial judgment.

The three-type system creates measurable friction:

1. **Dual-homing.** Some ADRs have content in both DECISIONS-*.md body files AND design/ specification files (e.g., ADR-048 lives in DECISIONS-core.md AND design/search/ADR-048-chunking-strategy-specification.md). CLAUDE.md explicitly mandates "titles must match between locations" — synchronization debt by design.

2. **Cross-referencing overhead.** A single concept like chunking spans ADR-048 (decision) + DES-004 (data model it shapes) + comments in code. PRO entries reference governing ADRs and DES sections. The graph is many-to-many.

3. **Cognitive load.** CLAUDE.md devotes ~150 lines to explaining three identifier systems, dual-homing rules, body file routing, and PRO graduation protocol. This is institutional overhead, not institutional memory.

4. **File sprawl.** 4 DECISIONS files (index + 3 body) + DESIGN.md (index + cross-cutting sections) + PROPOSALS.md + 33 design files + bodies spread across body files = documentation architecture that requires a map to navigate.

5. **Role-document mismatch.** The human principal thinks in features and status: "What are we building? Why? What's the status?" They don't think in document types. The AI holds all roles simultaneously — it doesn't need role-specific containers.

**Current scale:** 127 unique ADR identifiers (ADR-001 through ADR-132, with gaps), 56 unique DES identifiers (DES-001 through DES-063, with gaps), 49 unique PRO identifiers (PRO-001 through PRO-049) = **232 total identifiers across 3 namespaces.** 87 markdown files + 73 code files in yogananda-teachings, plus 11 in yogananda-platform, 4 in yogananda-design, 9 in yogananda-skills.

#### 1. Unified Identifier: FTR-NNN

Replace ADR, DES, and PRO with a single identifier type: **FTR** (Feature).

**Why FTR:**
- Unambiguous in grep (zero false positives for `FTR-\d{3}`)
- Maps to the natural conversational word "feature" — the human says "what's the chunking feature?" not "what's the chunking decision record?"
- Inclusive scope: a "feature" is a feature of the architecture — capabilities, conventions, constraints, and policies all qualify
- 3 characters, matching PRI (visual parity between the two identifier types)
- Phonetically functional: "FTR-forty-eight" or simply "feature forty-eight"

**What survives unchanged:** PRI-NN (Principles, 01–12). Principles are immutable commitments, not features. They stay in PRINCIPLES.md.

**AI readability analysis — FTR vs ADR.** ADR is an industry-standard pattern present in AI training data (Martin Fowler, adr-tools, engineering blogs). An AI seeing "ADR" activates a pre-trained mental model: immutable decision record, alternatives considered, "superseded by" chains. This is real semantic freight the identifier carries without project documentation. However, this project's ADRs diverge significantly from the industry pattern — they're mutable (no supersession chains), carry maturity markers, split across three body files, and dual-home with design files. An AI bringing standard ADR expectations is partially *misled* and must override pre-trained conventions with CLAUDE.md's definitions. The pre-trained model creates friction as often as it helps.

FTR has zero pre-trained association. An AI seeing FTR-048 without CLAUDE.md would have nothing to work with. But CLAUDE.md is always loaded (system prompt), and the AI already successfully works with DES and PRO — two identifiers that are entirely project-specific with zero pre-trained association. Two of the three current identifiers are already learned from scratch each session.

The semantic freight doesn't disappear — it moves from the identifier prefix to the section headers. `ADR-048` encoded "this is a decision" in the prefix; `FTR-048 → ## Rationale` encodes the same meaning in a section header that every AI understands deeply. The type information becomes more explicit and more granular. Net: one clearly-defined identifier with self-describing sections, learned from a ~10-line CLAUDE.md definition, replacing three identifiers (one with misleading pre-trained associations, two with none) requiring ~150 lines of conventions. The AI reader is equally effective on individual FTRs and more effective on the system as a whole.

#### 2. FTR Lifecycle States

```
proposed ──→ approved ──→ implemented
    │            │
    ├──→ declined │
    │            │
    └──→ deferred ←┘
            │
            └──→ proposed  (reactivated)
```

Five states:
- **Proposed** — Idea documented, not yet committed to. (Absorbs PRO "Proposed"/"Validated" states)
- **Approved** — Committed to as architectural direction. (Absorbs ADR "Accepted" status)
- **Implemented** — Validated through code. (Absorbs ADR "Implemented" and DES "Status: Implemented")
- **Deferred** — Architecturally sound but not scheduled. (Absorbs PRO "Suspended"/"Deferred" and ADR "Provisional")
- **Declined** — Evaluated and rejected. (New — currently no explicit "rejected" state; decisions just don't get ADRs)

**Maturity markers (optional, from ADR-098):**
- `Approved (Foundational)` — Defines project identity, change requires full deliberation
- `Approved` — Standard active direction
- `Deferred (Arc N+)` — Thorough direction for future arcs

#### 3. FTR File Anatomy

```markdown
# FTR-NNN: Title

**State:** Approved
**Domain:** search | experience | editorial | foundation | operations
**Arc:** 1a
**Governs:** FTR-XXX, FTR-YYY (optional — for hub features)
**Governed by:** PRI-NN, FTR-ZZZ (optional)

## Rationale                           <- absorbs the ADR function
[Why this direction was chosen. Alternatives considered. Tradeoffs.]

## Specification                       <- absorbs the DES function
[How to build it. Data models, API shapes, algorithms, parameters.]

## Notes                               <- absorbs the PRO history function
[Origin, evolution, related explorations. Lightweight.]
```

**Section rules:**
- **Rationale** is always present (every feature has a "why")
- **Specification** is present when the feature has implementation detail
- **Notes** is optional — for provenance and evolution context
- A proposed FTR may have only Rationale. An implemented FTR has all sections.
- Cross-cutting conventions (like API pagination) may have only Rationale — the convention IS the specification.
- The file grows as the feature progresses through its lifecycle.

#### 4. File Structure

```
features/                              <- replaces design/ + DECISIONS body files + PROPOSALS.md bodies
├── FEATURES.md                        <- single index (replaces DECISIONS.md + DESIGN.md nav + PROPOSALS.md index)
├── foundation/                        <- cross-cutting constraints, infrastructure, conventions
│   ├── FTR-001-direct-quotes-only.md
│   ├── FTR-002-design-philosophy.md
│   └── ...
├── search/                            <- search, data model, ingestion, AI pipeline
│   ├── FTR-020-hybrid-search.md
│   ├── FTR-021-data-model.md
│   └── ...
├── experience/                        <- frontend, UX, pages, accessibility, i18n
│   ├── FTR-040-frontend-design.md
│   ├── FTR-041-accessibility.md
│   └── ...
├── editorial/                         <- staff tools, content intelligence, curation
│   ├── FTR-060-editorial-system.md
│   └── ...
└── operations/                        <- CI/CD, observability, testing, governance
    ├── FTR-080-testing-strategy.md
    └── ...
```

**Domain numbering ranges (guideline, not enforced):**
- foundation: FTR-001–019
- search: FTR-020–039
- experience: FTR-040–059
- editorial: FTR-060–079
- operations: FTR-080–099
- overflow/new: FTR-100+

This is a **starting allocation**, not a hard partition. New features append after the current max within their domain range. If a range fills, overflow into FTR-100+.

#### 5. FEATURES.md Index

Single table, replaces three separate indexes:

```markdown
# SRF Online Teachings Portal — Features

| FTR | Title | Domain | State | Arc | Notes |
|-----|-------|--------|-------|-----|-------|
| 001 | Direct Quotes Only | foundation | Approved (Foundational) | — | PRI-01 |
| 002 | Design Philosophy | foundation | Approved | — | |
| 020 | Hybrid Search | search | Implemented | 1a | |
| 040 | Frontend Design | experience | Approved | 2a | |
| 090 | SRF Corpus MCP | operations | Deferred (Arc 3+) | — | ex-PRO-001 |
```

**Always-load features** (the cross-cutting sections currently always-loaded from DESIGN.md) are marked in the index. The implementing session determines which ~10-12 features carry this marker.

#### 6. Documents Replaced

| Current Document | Disposition |
|-----------------|-------------|
| DECISIONS.md | **Deleted.** Replaced by FEATURES.md index. |
| DECISIONS-core.md | **Deleted.** ADR bodies migrate into individual FTR files. |
| DECISIONS-experience.md | **Deleted.** ADR bodies migrate into individual FTR files. |
| DECISIONS-operations.md | **Deleted.** ADR bodies migrate into individual FTR files. |
| DESIGN.md | **Deleted.** Cross-cutting sections become FTR files in features/foundation/. Nav table replaced by FEATURES.md. |
| PROPOSALS.md | **Deleted.** PRO bodies migrate into individual FTR files (state: proposed/deferred/declined). |
| design/ directory | **Deleted.** All 33 files migrate into features/{domain}/ with new FTR filenames. |

**Documents preserved unchanged:**
- PRINCIPLES.md (PRI identifiers unchanged)
- CONTEXT.md (cross-references updated)
- ROADMAP.md (cross-references updated)
- CLAUDE.md (simplified — see § 8)
- README.md (cross-references updated)

#### 7. Numbering: Clean Start

New FTR numbers are assigned from 001. No attempt to preserve old ADR/DES/PRO numbers.

**Rationale:** The old numbers carry implicit associations with document types (ADR-048 "feels like" a decision). Clean numbering breaks that association and establishes FTR as the singular identity. The migration mapping (old → new) is recorded once in the migration commit message and in a `features/MIGRATION.md` reference file, then never consulted again.

**Assignment strategy:**
1. The implementing session creates a complete mapping table: every old identifier → its new FTR number
2. Numbers are assigned by domain, using the ranges in § 4 as starting allocation
3. Within each domain, features are ordered roughly by importance/chronology
4. Subsection identifiers (e.g., DES-007 through DES-016 within DES-006) become subsections within their parent FTR — they do NOT get their own FTR numbers
5. The mapping table is reviewed by the human principal before execution

#### 8. CLAUDE.md Simplification

The ~150 lines of identifier conventions in CLAUDE.md § Identifier Conventions collapse to approximately:

```markdown
## Identifiers

**PRI-NN** — Principles (01–12). Immutable commitments. PRINCIPLES.md.

**FTR-NNN** — Features. One file per concept in `features/{domain}/`.
Five states: proposed → approved → implemented | deferred | declined.
Each FTR contains Rationale (why), Specification (how), and Notes (history)
as needed. FEATURES.md is the single index.
File naming: `FTR-NNN-{slug}.md`. Cross-reference by bare identifier: "See FTR-048."
Domain directories: foundation/, search/, experience/, editorial/, operations/.
```

The Document Maintenance table in CLAUDE.md is also simplified — rows about DECISIONS/DESIGN/PROPOSALS body files, dual-homing, and PRO graduation collapse into "Update the FTR file" and "Update FEATURES.md index."

#### 9. Merge Rules

When an old ADR and an old DES cover the same concept, they merge into one FTR:

| Pattern | Example | Result |
|---------|---------|--------|
| ADR has a dual-homed design file | ADR-048 + design/search/ADR-048-*.md | 1 FTR with Rationale + Specification |
| ADR governs a DES on the same concept | ADR-044 (hybrid search decision) + DES-003 (search architecture) | Analyze overlap. If >70% shared concept: merge. If distinct: 2 FTRs. |
| PRO adopted → became ADR | PRO-014 → ADR-001 updates | 1 FTR. PRO history in Notes section. |
| PRO not adopted (proposed/deferred) | PRO-018 (Four Doors) | 1 FTR with state: proposed. |
| ADR suspended → became PRO | ADR-096 → PRO-027 | 1 FTR with state: deferred. |
| DES subsection inside parent DES | DES-007–016 inside DES-006 | Subsections within parent FTR. No standalone numbers. |
| Cross-cutting section in DESIGN.md | DES-001, DES-019, DES-024, etc. | Individual FTR files in features/foundation/. |

**Judgment calls:** The implementing session will encounter ambiguous cases. The principle: **one concept, one FTR.** If two old identifiers are about the same architectural concept (even if one captures "why" and the other "how"), they merge. If they're genuinely different concepts that happen to be related, they stay separate and cross-reference.

#### 10. Code Comment Updates

73 code files reference ADR/DES/PRO identifiers, primarily in comments like:
```typescript
// ADR-001: Direct quotes only — no AI synthesis
// DES-003: Search architecture
// See PRO-012 for copyright framework
```

These are updated mechanically using the mapping table. A sed/awk script processes the mapping. The implementing session generates the script from the mapping table and applies it in a single commit.

#### 11. Sibling Repository Updates

Four repositories reference teachings portal identifiers:

| Repository | Files | Update Strategy |
|------------|-------|-----------------|
| yogananda-teachings | 87 markdown + 73 code = 160 files | Primary migration (this proposal) |
| yogananda-platform | 11 files | Update cross-references using mapping table |
| yogananda-design | 4 files | Update cross-references using mapping table |
| yogananda-skills | 9 files | Update skills that reference ADR/DES/PRO identifiers + update skill workflows for FTR |

**Skills impact:**
- `proposal-merge` — Graduates PRO → ADR/DES. Replaced by simpler FTR state transitions.
- `dedup-proposals` — Consolidates explorations into PROs. Adapted to consolidate into FTR (state: proposed).
- `theme-integrate` — Creates ADR/DES entries. Adapted to create FTR entries.
- `garden` — Audits identifier systems. Simplified for single-namespace FTR.
- `coherence` — Cross-document consistency. Simplified for single-index FEATURES.md.
- `verify` — Post-implementation check against DES. Adapted for FTR Specification section.

#### 12. Migration Execution Plan

The migration is a **documentation refactor**, not a code refactor. No runtime behavior changes. The implementing session follows these phases:

**Phase 1: Mapping (read-only)**
1. Read all 127 ADR bodies from DECISIONS-core/experience/operations.md
2. Read all 56 DES sections from design/ files and DESIGN.md
3. Read all 49 PRO bodies from PROPOSALS.md
4. Identify merge candidates (dual-homed ADR+DES, ADR→PRO suspensions, PRO→ADR adoptions)
5. Assign FTR numbers using domain ranges
6. Produce the complete mapping table: `{old_id} → {FTR-NNN, domain, state, merge_notes}`
7. Present mapping table to human principal for review

**Phase 2: File Creation (write)**
1. Create `features/` directory structure (5 domain subdirectories)
2. For each FTR: create the file by merging content from its source identifiers
   - Rationale section: from ADR body (alternatives, tradeoffs, context)
   - Specification section: from DES body (data models, algorithms, parameters)
   - Notes section: from PRO body (origin, evolution) if applicable
   - State: derived from current ADR/DES/PRO status
3. Create FEATURES.md index table
4. Create features/MIGRATION.md (mapping table for historical reference)

**Phase 3: Cross-Reference Update (write)**
1. Generate sed mapping: `s/ADR-048/FTR-023/g` (etc.) for all 232 old identifiers
2. Apply to all markdown files in yogananda-teachings
3. Apply to all code comments in yogananda-teachings
4. Apply to CLAUDE.md (+ manual rewrite of § Identifier Conventions, § Document Maintenance)
5. Apply to CONTEXT.md, ROADMAP.md, README.md, PRINCIPLES.md
6. Apply to yogananda-platform (11 files)
7. Apply to yogananda-design (4 files)
8. Apply to yogananda-skills (9 files + skill rewrite for proposal-merge, dedup-proposals, theme-integrate)

**Phase 4: Cleanup (delete)**
1. Delete DECISIONS.md, DECISIONS-core.md, DECISIONS-experience.md, DECISIONS-operations.md
2. Delete DESIGN.md (after extracting cross-cutting sections to FTR files)
3. Delete PROPOSALS.md
4. Delete design/ directory (all 33 files migrated to features/)
5. Update .claude/skills/ to reference FTR system

**Phase 5: Verification**
1. Grep for any remaining ADR-/DES-/PRO- references (should be zero outside MIGRATION.md)
2. Verify FEATURES.md index matches actual files in features/
3. Verify all FTR files have required fields (Title, State, Domain)
4. Run existing CI to ensure no code breakage
5. Run coherence skill to verify cross-document integrity

#### 13. Commit Strategy

The migration should be a **single atomic commit** in the teachings repo, with coordinated commits in sibling repos:

1. `yogananda-teachings`: "Unify ADR/DES/PRO into FTR identifier system (PRO-050)"
2. `yogananda-platform`: "Update cross-references for FTR identifier migration"
3. `yogananda-design`: "Update cross-references for FTR identifier migration"
4. `yogananda-skills`: "Adapt skills for FTR identifier system"

#### 14. Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Stale references missed | Phase 5 grep verification catches stragglers |
| Mapping errors (wrong FTR number) | Phase 1 human review of mapping table before execution |
| Lost content during merge | Every FTR file must account for ALL content from its source identifiers |
| Sibling repo desync | Coordinated commits, same mapping table |
| Context window pressure | Phase 2 may require multiple sessions; mapping table is the coordination artifact |
| Skill breakage | Skills updated in Phase 3; tested in Phase 5 |

#### 15. What This Enables

1. **Feature-level conversation.** "What's the status of FTR-023?" returns one file with everything — rationale, specification, state. No assembly required.

2. **State-driven views.** `grep "State: Proposed" features/` shows all proposed features. `grep "State: Implemented" features/search/` shows implemented search features. The index in FEATURES.md is the canonical view, but the files are self-describing.

3. **Simpler skills.** proposal-merge becomes "change FTR state from proposed to approved." theme-integrate creates one FTR file, not three artifacts. garden audits one namespace.

4. **Git-native lifecycle.** Each FTR file's git history IS the feature's history. No need for separate "Notes" about when things changed — `git log features/search/FTR-023-chunking.md` shows the full evolution.

5. **Calm documentation.** Two identifier types (PRI, FTR) instead of four (PRI, ADR, DES, PRO). The documentation system becomes as calm as the technology it describes.

#### Implementation Scope

- **Estimated FTR count:** 130–170 (after merges, before new features)
- **Files modified:** ~160 in teachings, ~24 across sibling repos
- **Files created:** ~140 FTR files + FEATURES.md + MIGRATION.md
- **Files deleted:** ~40 (DECISIONS*, DESIGN.md, PROPOSALS.md, design/ directory)
- **Sessions required:** 2–3 (mapping + creation, cross-references + cleanup, sibling repos + skills)
- **Code behavior change:** None. Documentation-only refactor.

---

## Omitted Proposals

*(Populated as proposals are evaluated and excluded. Each entry preserves the rationale for the omission so the reasoning is available to future sessions without archaeology.)*
