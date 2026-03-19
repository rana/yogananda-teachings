---
ftr: 60
title: "Staff Experience Architecture — Five-Layer Editorial System"
summary: "Five-layer staff tooling architecture serving monastics, theologians, translators, developers, and leadership"
state: approved-provisional
domain: editorial
governed-by: [PRI-03, PRI-08, PRI-12]
---

# FTR-060: Staff Experience Architecture

## Rationale

The portal's "human review as mandatory gate" principle creates significant staff-facing workflow requirements. AI proposes theme tags, tone classifications, accessibility ratings, calendar associations, translation drafts, social media captions, and ingestion QA flags — all requiring human approval before reaching seekers. The speed and quality of editorial review directly determines how quickly new content reaches seekers, making the staff experience a primary product concern.

A two-layer model (Contentful for authoring + Retool for dashboards) underserves the people closest to the sacred content. Contentful excels at content authoring but is not designed for AI classification review workflows. Retool is an excellent data tool for developers, but its visual language — data grids, SQL panels, generic form builders — is incongruent with reviewing sacred text. Translation reviewers have no interface at all; translations live in Git files requiring developer mediation.

Three distinct audiences need three distinct experiences. A monastic editor reviewing whether a passage about inner peace is correctly tagged should work in a warm, reverent environment — not a spreadsheet. A theological reviewer needs approve/reject/skip with full passage context, nothing else on screen. A developer needs pipeline health and bulk operations. One tool cannot serve all three well.

The solution: replace the two-layer model with a five-layer staff experience architecture. Contentful remains the content authoring tool. A purpose-built editorial review portal (`/admin`) fills the gap for non-technical staff. Technical operations tooling is evaluated separately (FTR-149). Each layer serves a distinct audience with appropriate tooling.

The calm design system already exists — building the admin portal in the same Next.js application with the same design tokens means zero incremental design cost. Auth0 (already in the SRF stack) provides role-based access. Delivery is incremental: each stage adds only the workflows demanded by its content features.

## Specification

### Guiding Principle

**Staff should think about the teachings, not the technology.** The same Calm Technology philosophy (PRI-08) that governs the seeker experience applies to the staff experience. A monastic editor's tool should fade into the background, leaving focus on the passage and the decision.

### Staff & Organizational Personas

#### Core Staff Personas

| Persona | Schedule | Technical Comfort | Primary Tool | Key Need |
|---|---|---|---|---|
| **Monastic content editor** | 2-3 hour windows between meditation and services | Variable | Admin portal + Contentful | Session resume; complete meaningful work in 30 minutes; warm UI that feels like service |
| **Theological reviewer** | Periodic, high-stakes | Low to moderate | Admin portal (review queue only) | "Preview as seeker" with full chapter context; defer decisions without blocking the queue; persistent theological notes |
| **AE social media staff** | Daily, 20-30 min | Moderate | Admin portal (asset inbox) | Weekly lookahead with batch-approve; platform-specific captions; assets ready to post |
| **Translation reviewer** | Batch sessions, 40-100 strings | Moderate (may be volunteer) | Admin portal (translation review) | Screenshot context for each string; tone guidance; suggest alternatives without rejecting |
| **AE developer** | As needed | High | Staff dashboard (FTR-149) + Neon console | Clear runbooks; separated monitoring dashboards; infrastructure-as-code |
| **Leadership (monastic)** | Monthly or quarterly | Low | Impact dashboard (read-only) | Express editorial priorities without entering the admin system; pre-formatted reports |

#### Operational Personas (Not Yet Staffed)

| Persona | Schedule | Technical Comfort | Primary Tool | Key Need |
|---|---|---|---|---|
| **Portal coordinator** | Regular | Moderate | Admin portal (pipeline dashboard) | Cross-queue visibility: content pipeline status, editorial queue health, VLD activity, upcoming calendar events |
| **Book ingestion operator** | Per-book (1-2 days per cycle) | Moderate to high | Ingestion CLI + admin portal | Guided ingestion workflow; side-by-side source PDF and extracted text; per-chapter re-run |
| **VLD coordinator** | Weekly | Moderate | Admin portal (VLD section) | Creates curation briefs, monitors submission quality, manages trusted submitter status |

#### Volunteer Personas

| Persona | Schedule | Technical Comfort | Primary Tool | Key Need |
|---|---|---|---|---|
| **VLD curation volunteer** | Flexible, service-oriented | Variable | Admin portal (VLD dashboard) + Study Workspace | Clear self-contained tasks; session save-and-resume; onboarding framing work as devotional service |
| **VLD translation volunteer** | Batch sessions | Variable | Admin portal (translation review) | Embedded glossary sidebar; "I'm not sure" flag; pairing with experienced reviewer for first batch |
| **VLD theme tag reviewer** | Short sessions | Variable | Admin portal (theme review) | Training examples; side-by-side passage + theme descriptions; escalate to monastic reviewer |
| **VLD feedback triager** | Flexible | Variable | Admin portal (feedback queue) | Pre-categorized feedback with AI reasoning; confirm/reclassify; flag items for staff |
| **VLD content QA reviewer** | Per-assignment | Moderate | Admin portal (QA review) | Compare portal text against physical book; report discrepancies |

#### External Personas

| Persona | Schedule | Technical Comfort | Primary Tool | Key Need |
|---|---|---|---|---|
| **Philanthropist's foundation** | Quarterly or annually | Low | Impact report (PDF/web) | Pre-formatted narrative impact report for their board; no work required |
| **Study circle leader** | Weekly preparation | Moderate | Study Workspace + community collections | Find, collect, arrange, share, present — weekly satsanga preparation is the primary use case |

**Study circle leader — expanded profile:** The portal's most demanding external seeker and the primary driver for Study Workspace (STG-023+) and Community Curation (STG-024). Weekly satsanga preparation workflow: identify theme, search for passages across books, collect into ordered sequence, add contextual notes, share via link, present using Presentation mode (FTR-006 section 5). Also serves as informal portal evangelist. In Indian and Latin American contexts, may be the primary interface between the portal and less digitally literate seekers — projecting on shared screens or reading aloud.

**Staffing open question:** Several operational personas (portal coordinator, book ingestion operator, VLD coordinator) are not yet assigned. SRF must determine whether these are monastic roles, AE team roles, or dedicated positions before STG-007 begins. See CONTEXT.md Open Questions (Stakeholder).

### Five-Layer Architecture

#### Layer 1: Contentful — Content Authoring

**Who:** Content editors. **What:** Creating and editing source content.

Contentful remains the editorial source of truth (FTR-102) for all authored content: books, chapters, sections, text blocks, editorial thread sequencing, teaching topic descriptions, calendar event definitions, sacred places, "Seeking..." empathic entry points, and daily passage pool membership. Contentful's native workflow (Draft, In Review, Published), role-based permissions, audit trail, and locale management serve this use case well.

#### Layer 2: Contentful Custom Apps — Contextual Bridges

**Who:** Content editors (while in Contentful). **What:** Seeing review status without leaving Contentful.

Lightweight React sidebar panels via Contentful's App Framework:

| Panel | Appears On | Shows |
|---|---|---|
| **Theme tags** | TextBlock entries | Current tags, pending review count, link to review queue |
| **Thread preview** | Editorial thread entries | Live reading flow — passages in sequence with transition notes |
| **Calendar passages** | Calendar event entries | Associated passages with relevance context |
| **Topic readiness** | Teaching topic entries | Passage count, review status, publication readiness |

These are read/link panels, not editing interfaces — they keep editors oriented in their primary tool.

#### Layer 3: Editorial Review Portal — `/admin`

**Who:** Monastic editors, theological reviewers, social media staff, translation reviewers. **What:** All review, approval, and curation workflows where AI has proposed and humans must decide.

A custom-built section of the Next.js application at `/admin`, protected by Auth0, built with the portal's calm design system (Merriweather, warm cream, generous whitespace, SRF gold accents).

**Auth0 Roles:**

| Role | Access |
|---|---|
| `editor` | Theme tag review, daily passage curation, calendar events, content preview, ingestion QA |
| `reviewer` | Theological review queue (final approval tier) |
| `translator:{locale}` | Translation review for a specific language only |
| `social` | Social media asset review and download |
| `updates` | Portal update note review and publication (FTR-092) |
| `admin` | All editorial functions + user management |
| `leadership` | Impact dashboard (read-only) |

**Editorial Home Screen** — personalized summary filtered by role:

```
Good morning. Here's what needs your attention:

 Theme Tags              Daily Passages        QA Flags
 23 awaiting review      Pool: 412 passages    0 pending
 o Peace (8 new)         Next 7 days: check    All clear
 o Courage (6 new)
 o Healing (9 new)

 Calendar Events         Translations (de)     Social Assets
 Next: Mahasamadhi       14 strings to review  Tomorrow's image
 (March 7) — 12                                ready for review
 passages linked
```

Only sections relevant to the staff member's role appear.

**Review Workflows:**

| Workflow | First Needed | Description |
|---|---|---|
| **Theme tag review** | STG-007 | Passage with full citation. Theme name, description, similarity score, AI confidence. Approve, reject, or adjust relevance. Keyboard: `a` approve, `r` reject, arrows navigate. Session position saved. |
| **Daily passage curation** | STG-007 | 7-day lookahead calendar. Each day's passage with tone badge. Swap from pool. Flag inappropriate timing. |
| **Calendar event management** | STG-007 | Event list with dates, associated passages. Add/remove associations. Preview homepage appearance. |
| **Social media asset review** | STG-020 | Quote image at platform dimensions (1:1, 9:16, 16:9). Caption with inline editing. Download per platform. Mark as posted. Weekly lookahead. |
| **Translation review** | STG-021 | Side-by-side English source and AI draft. UI context note. Approve, edit inline, or flag. Batch view (40-100 strings). Progress per locale. |
| **Ingestion QA review** | STG-007+ | Flagged passages with AI suggestion and confidence. Accept, reject, or edit. Grouped by flag type. |
| **Tone/accessibility spot-check** | STG-007 | Random sample of classified passages. Confirm or reclassify. |
| **Content preview** | STG-007 | "Preview as seeker" for theme pages, daily passages, editorial threads. |
| **Portal update review** | STG-007 | AI-drafted update notes triggered by deploys. Title and summary with inline editing. Approve and publish, edit, or discard (FTR-092). |

#### Layer 4: Technical Operations Dashboard

**Who:** AE developers. **What:** Data-heavy dashboards, pipeline monitoring, bulk operations.

Scoped to the technical team, not content editors: search analytics (anonymized query trends, zero-result rate), pipeline health (embedding jobs, webhook sync, error rates), content audit (chunk counts, embedding coverage, orphaned records), bulk operations (mass re-tagging, migration status), system metrics (response times, query performance, error aggregations).

Tooling decision (Retool vs. portal `/admin` routes with Recharts) deferred to FTR-149.

#### Layer 5: Impact View — Leadership Dashboard

**Who:** SRF leadership, philanthropist's foundation, board presentations. **What:** Read-only, narrative-quality view of global reach and content growth.

A single route at `/admin/impact`, Auth0-protected with `leadership` role. Designed for beauty and clarity, not data density:

- **Map visualization:** Countries reached (anonymized Vercel geo data) — warm-toned world map with gentle highlights
- **Content growth:** Books published, passages available, languages served, simple growth chart
- **"What is humanity seeking?"** Top search themes (anonymized, aggregated) — themes, not queries
- **Global equity indicators:** Global South traffic, text-only mode usage, feature phone access rates
- **Content availability matrix:** Books by language, translation progress

Refreshed nightly from Neon aggregates. Answers one question: "Are we fulfilling the philanthropist's mission?"

### Notification Strategy

| Channel | Audience | Frequency | Content |
|---|---|---|---|
| **Email digest** | All editorial staff | Daily (configurable) | Summary with counts and direct links to review queues |
| **Portal badges** | Staff who visit `/admin` | On each login | Count badges on editorial home screen |
| **No notification** | Leadership | Pull-based | They visit `/admin/impact` when they choose |

Email digest is the primary channel. SRF monastics have structured schedules; a morning summary respects their time. Generated by a scheduled serverless function querying review queue counts from Neon.

### Technical Implementation

The admin portal is a route group within the existing Next.js app:

```
/app/admin/
  layout.tsx              -- Auth0 protection, admin nav, calm design shell
  page.tsx                -- Editorial home (role-filtered summary)
  themes/[slug]/page.tsx  -- Theme tag review queue
  passages/page.tsx       -- Daily passage curation
  calendar/page.tsx       -- Calendar event management
  social/page.tsx         -- Social media asset review
  translations/[locale]/page.tsx -- Translation review (per language)
  qa/page.tsx             -- Ingestion QA review
  impact/page.tsx         -- Leadership impact dashboard
  preview/
    themes/[slug]/page.tsx -- "Preview as seeker" for themes
    passages/page.tsx      -- Preview daily passage selection
```

Business logic in `/lib/services/` (per FTR-015): `review.ts`, `curation.ts`, `social.ts`, `updates.ts` (FTR-092), `translation.ts`, `impact.ts`, `collections.ts` (FTR-143), `graph.ts` (FTR-035). Admin routes are thin presentation layers. MCP server (`/lib/mcp/`, FTR-098) delegates to the same services.

### Stage Delivery

| Stage | Staff Experience Work |
|---|---|
| **STG-007** | Minimal admin portal: editorial home, theme tag review, daily passage curation, calendar events, content preview, tone/accessibility spot-check, portal update review (FTR-092). Auth0 integration. Email digest. Contentful Custom Apps (sidebar panels). |
| **STG-020** | Social media asset review added. |
| **STG-021** | Translation review UI. Volunteer reviewer access (`translator:{locale}`). |
| **STG-021+** | Impact dashboard for leadership. |
| **STG-024** | VLD dashboard, curation briefs, trusted submitter workflow. |

## Notes

- Absorbed from ADR-060 (March 2026). Original framed as revision of a two-tool constraint (Contentful + Retool). The Retool evaluation for technical operations is now governed by FTR-149.
- Extends FTR-102 (Contentful as one layer of five), FTR-154 (social media review workflow), FTR-135 (translation review UI), FTR-121 (theme tag review workflow).
- Stage delivery table uses STG-NNN notation; original used M-notation (migrated per FTR-084).
