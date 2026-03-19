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

### Context

The portal has extensive "human review as mandatory gate" requirements. AI proposes theme tags, tone classifications, accessibility ratings, calendar associations, external references, translation drafts, social media captions, and ingestion QA flags. All require human approval before reaching seekers.

The current design (DESIGN.md "Content Management Strategy") names two tools — Contentful for editorial content, Retool for administrative dashboards — and states: "The portal never builds custom admin UIs for either use case." This served as a reasonable starting constraint. But when we inhabit the actual staff perspectives, the two-tool model underserves the people closest to the sacred content.

**The people who will use these tools:**

| Person | Role | Typical Session | Technical Comfort |
|---|---|---|---|
| **Monastic content editor** | Review theme tags, curate daily passages, manage calendar events, create editorial threads | 2–3 hours/day between meditation and services | Variable — may range from "uses Contentful daily" to "prefers paper" |
| **Theological reviewer** | Final approval on theme associations, editorial thread accuracy, calendar appropriateness | Periodic — high-stakes, low-frequency | Low to moderate |
| **AE social media staff** | Review quote images, edit captions, download/distribute assets | Daily — 20–30 min | Moderate |
| **Translation reviewer** | Compare English source strings with AI drafts, approve/correct, flag uncertainties | Batch sessions — 40–100 strings per sprint | Moderate (but may be a volunteer, not staff) |
| **AE developer** | Pipeline monitoring, search analytics, data operations, infrastructure | As needed | High |
| **Leadership / philanthropist** | View global reach, content growth, search themes | Monthly or quarterly | Low — wants narrative, not dashboards |

The monastic content editor — the person most deeply connected to the teachings — would need to work across Retool data grids to review theme tag candidates, Contentful to create editorial threads, and potentially a separate interface for daily passage curation. Retool is an excellent data tool but is designed for developers building internal apps, not for monastics stewarding sacred text. The visual language of Retool (data grids, SQL query panels, generic form builders) is incongruent with the reverence the work demands.

The theological reviewer needs the simplest possible interface: see a passage, see its proposed association, approve or reject. Nothing else should be on screen. Retool could technically do this, but it would feel like reviewing scripture in a spreadsheet.

The translation reviewer currently has no interface at all — translations live in Git files (`messages/{locale}.json`), creating a hard developer dependency on every review cycle.

### Decision

Replace the two-layer model (Contentful + Retool) with a five-layer staff experience architecture. Each layer serves a distinct audience with appropriate tooling.

#### Layer 1: Contentful — Content Authoring

**Who:** Content editors
**What:** Creating and editing the source content that seekers read.

Contentful remains the editorial source of truth (FTR-102) for all authored content:
- Books, chapters, sections, text blocks
- Editorial thread sequencing and transition notes
- Teaching topic descriptions
- Calendar event definitions
- Sacred Places descriptions and imagery
- "Seeking..." empathic entry point text (STG-021 — cultural adaptation per locale)
- Daily passage pool membership

Contentful's native workflow (Draft → In Review → Published), role-based permissions, audit trail, and locale management serve this authoring use case well. No change from the existing design for content authoring.

#### Layer 2: Contentful Custom Apps — Contextual Bridges

**Who:** Content editors (while working in Contentful)
**What:** Seeing review status and related data without leaving Contentful.

Contentful's App Framework allows custom React panels in the entry sidebar. These provide contextual awareness without requiring editors to switch tools:

- **TextBlock sidebar:** Shows current theme tags for this passage, accessibility rating, tone classification. Links to the review queue for this passage's pending tags.
- **Editorial thread sidebar:** Live preview of the reading flow — passage sequence with transition notes rendered as the seeker would see them.
- **Calendar event sidebar:** Associated passages listed with relevance context. Link to manage associations.
- **Teaching topic sidebar:** Passage count, review status, publication readiness indicator.

These are lightweight read/link panels, not full editing interfaces. They keep editors oriented while working in their primary tool.

#### Layer 3: Editorial Review Portal — `/admin`

**Who:** Monastic editors, theological reviewers, social media staff, translation reviewers
**What:** All review, approval, and curation workflows where AI has proposed and humans must decide.

This is the primary new element. A custom-built section of the Next.js application at `/admin`, protected by Auth0, built with the portal's own calm design system (Merriweather, warm cream, generous whitespace, SRF gold accents).

**Why build custom instead of using Retool:**
1. **Tone.** Reviewing Yogananda's sacred words in a warm, reverent environment versus a generic data grid. The staff tool should respect the material as much as the seeker-facing portal does.
2. **Simplicity.** A theological reviewer needs approve/reject/skip with full passage context. Retool requires building this from primitives (tables, buttons, forms) and the result is functional but not focused.
3. **Session continuity.** A monastic editor working in 2-hour windows needs to save progress mid-queue and resume the next day. Cursor-based pagination and last-position memory are native to a purpose-built UI.
4. **Non-technical access.** No Retool login, no unfamiliar tool. Same authentication (Auth0), same visual language as the portal itself.
5. **Notification integration.** Review queues can surface counts and priorities directly; email digests can link straight to specific review items.
6. **Permission scoping.** A German translation reviewer sees only their language's queue. A theme reviewer sees only theme tag candidates. Auth0 roles (`editor`, `reviewer`, `translator:{locale}`, `admin`) drive the experience.

**The Editorial Home screen:**

When a staff member logs in, they see a personalized summary based on their role:

```
Good morning. Here's what needs your attention:

 Theme Tags              Daily Passages        QA Flags
 23 awaiting review      Pool: 412 passages    0 pending
 ○ Peace (8 new)         Next 7 days: ✓        All clear ✓
 ○ Courage (6 new)
 ○ Healing (9 new)

 Calendar Events         Translations (de)     Social Assets
 Next: Mahasamadhi       14 strings to review  Tomorrow's image
 (March 7) — 12                                ready for review
 passages linked
```

Only the sections relevant to the staff member's role appear. A translation reviewer for German sees only the translations panel. A theological reviewer sees only items awaiting their specific approval tier.

**Review workflows in the portal:**

| Workflow | First Needed | Description |
|---|---|---|
| **Theme tag review** | STG-007 | Passage displayed with full citation. Theme name and description visible. Similarity score and AI confidence shown (but not as primary decision input). Approve, reject, or adjust relevance weight. Keyboard shortcuts: `a` approve, `r` reject, `→` next. |
| **Daily passage curation** | STG-007 | 7-day lookahead calendar. Each day's passage shown with tone badge. Swap from pool. Flag inappropriate timing (e.g., a "challenging" passage on a holiday). |
| **Calendar event management** | STG-007 | Event list with dates. For each event, associated passages shown. Add/remove associations. Preview how the homepage will look on that date. |
| **Social media asset review** | STG-020 | Today's quote image at actual platform dimensions (1:1, 9:16, 16:9). Caption below with inline editing. Download per platform. Mark as "posted" per platform (tracking, not automation). Weekly lookahead view. |
| **Translation review** | STG-021 | Side-by-side: English source string and AI draft. UI context note ("this appears on the search button"). Approve, edit inline, or flag `[REVIEW]`. Batch view (40–100 strings per session). Progress indicator per locale. |
| **Ingestion QA review** | STG-007+ | Flagged passages with Claude's suggestion and confidence. Accept correction, reject (keep original), or edit manually. Grouped by flag type (OCR error, formatting, truncation). |
| **Tone/accessibility spot-check** | STG-007 | Random sample of classified passages. "Does this feel `contemplative`? Is this `universal`-level accessibility?" Confirm or reclassify. |
| **Content preview** | STG-007 | "Preview as seeker" — see exactly what a theme page, daily passage, or editorial thread will look like before publication. |

#### Layer 4: Technical Operations Dashboard

**Who:** AE developers
**What:** Data-heavy dashboards, pipeline monitoring, bulk operations.
**Tooling decision:** FTR-149 evaluates Retool vs. portal `/admin` routes at STG-009. Retool is one option; lightweight charting (Recharts) within the portal admin is another.

Scoped to the technical team, not content editors:

- **Search analytics:** Anonymized query trends, top searches by period, "no results" queries, zero-result rate
- **Pipeline health:** Embedding job status, webhook sync logs, error rates
- **Content audit:** Chunk counts per book, embedding coverage, orphaned records
- **Bulk operations:** One-off data migrations, mass re-tagging, embedding model migration status
- **System metrics:** API response times, database query performance, error aggregations

Whether this is Retool or a custom dashboard is deferred (FTR-149).

#### Layer 5: Impact View — Leadership Dashboard

**Who:** SRF leadership, philanthropist's foundation, board presentations
**What:** A read-only, narrative-quality view of the portal's global reach and content growth.

A single route in the admin portal (`/admin/impact`) or a standalone page. Auth0-protected with a read-only `leadership` role. Designed for beauty and clarity, not data density:

- **Map visualization:** Countries reached (anonymized Vercel geo data). Not a data grid — a warm-toned world map with gentle highlights.
- **Content growth:** Books published, passages available, languages served. Over time, a simple growth chart.
- **"What is humanity seeking?"** Top search themes (anonymized, aggregated). Not individual queries — themes. "This month, seekers worldwide most frequently sought teachings about *Peace*, *Fear*, and *Purpose*."
- **Global equity indicators:** Traffic from Global South regions, text-only mode usage, KaiOS/feature phone access rates. "The teachings reached seekers in 23 countries across Sub-Saharan Africa."
- **Content availability matrix:** Which books are available in which languages. Visual grid showing translation progress.

Refreshed nightly from Neon aggregates. No real-time data needed. Designed to answer one question: "Are we fulfilling the philanthropist's mission?"

### Notification Strategy

Staff should not need to remember to check dashboards. Work comes to them:

| Channel | Audience | Frequency | Content |
|---|---|---|---|
| **Email digest** | All editorial staff | Daily (configurable) | Summary: "12 new theme tag candidates, 3 QA flags, next week's passages ready for review." Links directly to relevant review queues. |
| **Admin portal badges** | Staff who visit the portal | On each login | Count badges on the editorial home screen. "23 awaiting review." |
| **No notification** | Leadership | Never — pull-based | They visit the impact view when they want to. No email, no alerts. |

Email digest is the primary channel. SRF monastics have structured schedules; a morning email with a clear summary ("here's what needs your attention today") respects their time and integrates into their existing routine. The email is generated by a scheduled serverless function querying review queue counts.

### Stage Placement

The editorial review portal is introduced incrementally, matching the content workflows that create demand for it:

| Stage | Staff Experience Deliverables |
|---|---|
| **STG-007** | Minimal editorial review portal: theme tag review queue, daily passage curation, calendar event management, content preview, tone/accessibility spot-check. Email digest for review notifications. Auth0 roles: `editor`, `reviewer`. |
| **STG-020** | Social media asset review workflow added to the admin portal. |
| **STG-007** | Contentful Custom Apps (sidebar panels). Full admin editorial workflow connecting Contentful authoring (available since STG-001) with portal review queues. |
| **STG-021** | Translation review UI added to admin portal. Auth0 role: `translator:{locale}`. Volunteer reviewer access with minimal permissions. |
| **STG-021+** | Impact dashboard for leadership. |

### Alternatives Considered

| Approach | Why rejected |
|---|---|
| **Contentful + Retool only (current design)** | Underserves monastic editors and theological reviewers. Retool's visual language is incongruent with sacred content work. Translation reviewers have no interface at all. |
| **Everything in Contentful** | Contentful is excellent for content authoring but not designed for AI classification review workflows (approve/reject per passage at scale), social media asset visual review, or translation side-by-side comparison. Forcing these workflows into Contentful's content model would require awkward workarounds. |
| **Everything in Retool** | Retool can technically build any admin UI, but the result is always "an admin tool." For the AE developer, this is fine. For a monastic editor reviewing whether a passage about inner peace is correctly tagged — the experience matters. Retool's generic form builders and data grids don't support the focused, reverent interaction these workflows demand. |
| **Third-party editorial workflow tool (Jira, Asana, Monday)** | Introduces a new vendor with its own UX, its own authentication, its own learning curve. Doesn't integrate with portal data (passages, themes, embeddings). Adds cost. The editorial review workflows are specific to this portal's data model — generic project management tools would require extensive customization to be useful. |
| **Build the admin portal from the initial stages** | Premature. The early stages have a single book with a one-time ingestion QA process. The first real demand for review workflows comes in STG-007 (theme tagging at scale across multiple books). Building the portal earlier would be over-engineering. |

### Rationale

- **Staff should think about the teachings, not the technology.** The same principle that governs the seeker experience ("Calm Technology") should govern the staff experience. A monastic editor's tool should fade into the background, leaving focus on the passage and the decision.
- **Three distinct audiences need three distinct experiences.** A monastic editor, an AE developer, and a leadership stakeholder have different mental models, different technical comfort levels, and different goals. One tool cannot serve all three well.
- **Review workflows are the bottleneck.** The portal's most distinctive constraint — human review as mandatory gate — means the speed and quality of staff review directly determines how quickly new content reaches seekers. A cumbersome review process means fewer themes published, fewer passages curated, slower translation cycles. The review experience is a primary product concern, not an afterthought.
- **The calm design system already exists.** Building the admin portal in the same Next.js application, with the same design tokens, means zero incremental design cost. The portal's warm cream, Merriweather, and gold accents serve the staff experience as naturally as the seeker experience.
- **Auth0 already exists in the SRF stack.** Role-based access for the admin portal uses SRF's established identity provider. No new authentication system.
- **Incremental delivery.** STG-007 delivers only the review workflows needed for theme tagging (the first AI-proposal workflow at scale). Each subsequent stage adds only the workflows demanded by its content features. The admin portal grows organically, never ahead of actual need.

### Consequences

- **Revises the DESIGN.md statement** "The portal never builds custom admin UIs for either use case." The portal now builds a purpose-built editorial review UI for non-technical staff. Contentful remains the content authoring tool. Retool remains the technical operations tool. The admin portal fills the gap between them.
- STG-007 gains a new deliverable: minimal editorial review portal
- STG-020 gains social media asset review in the admin portal
- STG-007 gains Contentful Custom Apps (sidebar panels)
- STG-021 gains translation review UI and volunteer reviewer access
- Auth0 role schema: `editor`, `reviewer`, `translator:{locale}`, `admin`, `leadership`
- Email digest infrastructure: scheduled serverless function for daily review summaries
- The admin portal shares the Next.js application, design system, and database — zero new infrastructure
- **Extends FTR-102** (Contentful as editorial source of truth — now one layer of five, not the whole story), **FTR-154** (social media — review workflow now specified), **FTR-135** (translation workflow — review UI now specified), and **FTR-121** (theme tagging — review workflow now specified)

## Specification

The portal's "human review as mandatory gate" principle creates significant staff-facing workflow requirements. Theme tags, tone classifications, accessibility ratings, calendar associations, translation drafts, social media assets, and ingestion QA flags all require human approval. The staff experience is a primary product concern — the speed and quality of editorial review directly determines how quickly new content reaches seekers.

### Guiding Principle

**Staff should think about the teachings, not the technology.** The same Calm Technology philosophy that governs the seeker experience applies to the staff experience. A monastic editor reviewing whether a passage about inner peace is correctly tagged should work in an environment that respects the material — not a generic data grid.

### Staff & Organizational Personas

The portal is maintained by a broader organizational ecosystem than just "staff." Each persona has different schedules, technical comfort, and workflow needs. The admin portal, editorial tools, and operational procedures must serve all of them.

#### Core Staff Personas

| Persona | Schedule | Technical Comfort | Primary Tool | Key Need |
|---|---|---|---|---|
| **Monastic content editor** | 2–3 hour windows between meditation and services | Variable | Admin portal + Contentful | Session resume; complete meaningful work in 30 minutes; warm UI that feels like service, not administration |
| **Theological reviewer** | Periodic, high-stakes | Low to moderate | Admin portal (review queue only) | "Preview as seeker" with full chapter context; ability to defer decisions without blocking the queue; persistent theological notes across sessions |
| **AE social media staff** | Daily, 20–30 min | Moderate | Admin portal (asset inbox) | Weekly lookahead with batch-approve; platform-specific captions; assets ready to post, not raw material to assemble |
| **Translation reviewer** | Batch sessions, 40–100 strings | Moderate (may be volunteer) | Admin portal (translation review) | Screenshot context for each string; tone guidance; ability to suggest alternatives without outright rejecting |
| **AE developer** | As needed | High | Staff dashboard (FTR-149) + Neon console | Clear runbooks; Sentry/New Relic dashboards separated from other SRF properties; infrastructure-as-code matching SRF Terraform patterns |
| **Leadership (monastic)** | Monthly or quarterly | Low | Impact dashboard (read-only) | Ability to express editorial priorities ("emphasize courage this quarter") without entering the admin system; pre-formatted reports for the philanthropist's foundation |

#### Operational Personas (Not Yet Staffed)

| Persona | Schedule | Technical Comfort | Primary Tool | Key Need |
|---|---|---|---|---|
| **Portal coordinator** | Regular | Moderate | Admin portal (pipeline dashboard) | Cross-queue visibility: content pipeline status (books in queue/ingestion/QA/published), editorial queue health (backlog depth across all review types), VLD activity, upcoming calendar events. Not Jira — purpose-built for editorial state. |
| **Book ingestion operator** | Per-book (1–2 days per cycle) | Moderate to high | Ingestion CLI + admin portal | Guided ingestion workflow: upload source → automated processing → flagged review → human QA → approve-and-publish. Side-by-side source PDF and extracted text. Per-chapter re-run capability. |
| **VLD coordinator** | Weekly | Moderate | Admin portal (VLD section) | Creates curation briefs, monitors submission quality, manages trusted submitter status, communicates with VLD members. May be the portal coordinator or a separate role. |

#### Volunteer Personas

| Persona | Schedule | Technical Comfort | Primary Tool | Key Need |
|---|---|---|---|---|
| **VLD curation volunteer** | Flexible, service-oriented | Variable (possibly low) | Admin portal (VLD dashboard) + Study Workspace | Clear, self-contained tasks with completion criteria; session save-and-resume; warm onboarding framing work as devotional service; constructive feedback on submissions |
| **VLD translation volunteer** | Batch sessions | Variable | Admin portal (translation review) | Embedded glossary sidebar; "I'm not sure" flag without blocking progress; pairing with experienced reviewer for first batch |
| **VLD theme tag reviewer** | Short sessions | Variable | Admin portal (theme review) | Training examples for each theme; side-by-side passage + theme descriptions; "escalate to monastic reviewer" option |
| **VLD feedback triager** | Flexible | Variable | Admin portal (feedback queue) | Pre-categorized feedback with AI reasoning; confirm/reclassify; flag items for staff |
| **VLD content QA reviewer** | Per-assignment | Moderate | Admin portal (QA review) | Compare portal text against physical book; report discrepancies. Requires access to physical books (many VLD members own them). |

#### External Personas

| Persona | Schedule | Technical Comfort | Primary Tool | Key Need |
|---|---|---|---|---|
| **Philanthropist's foundation** | Quarterly or annually | Low | Impact report (PDF/web) | Pre-formatted, narrative impact report they can share with their board. Generated from Impact Dashboard data, curated into a story. No work required. |
| **Study circle leader** | Weekly preparation | Moderate | Study Workspace + community collections | Find → collect → arrange → share → present. Power seeker of community collections and shared links. Weekly satsanga preparation is the primary use case. |

**Study circle leader — expanded profile:** This is the portal's most demanding external seeker and the primary driver for Study Workspace (STG-023+) and Community Curation (STG-024) features. The weekly satsanga preparation workflow is: (1) identify a theme or topic for the week, (2) search and browse for relevant passages across multiple books, (3) collect passages into an ordered sequence that builds understanding, (4) add brief contextual notes for group discussion, (5) share the collection with group members via link, (6) present during satsanga using Presentation mode (FTR-006 §5). Until the Study Workspace stage, this seeker uses browser bookmarks, manual note-taking, and shared passage links — functional but friction-heavy. The study circle leader also serves as an informal portal evangelist, introducing the portal to group members who may become daily visitors, devoted practitioners, or Quiet Corner seekers. In Indian and Latin American contexts, the study circle leader may be the primary interface between the portal and seekers who are less digitally literate — they project the portal on a shared screen or read passages aloud. Presentation mode's early delivery (consider pulling to Stages 2b–3a per CONTEXT.md technical open question) directly serves this population.

**Staffing open question:** Several operational personas (portal coordinator, book ingestion operator, VLD coordinator) are not yet assigned. SRF must determine whether these are monastic roles, AE team roles, or dedicated positions before STG-007 begins. See CONTEXT.md § Open Questions (Stakeholder).

### The Editorial Review Portal (`/admin`)

A custom-built section of the Next.js application, protected by Auth0, built with the portal's own design system.

#### Auth0 Roles

| Role | Access |
|---|---|
| `editor` | Theme tag review, daily passage curation, calendar event management, content preview, ingestion QA |
| `reviewer` | Theological review queue (final approval tier) |
| `translator:{locale}` | Translation review for a specific language only |
| `social` | Social media asset review and download |
| `updates` | Portal update note review and publication (FTR-092) |
| `admin` | All editorial functions + user management |
| `leadership` | Impact dashboard (read-only) |

#### Editorial Home Screen

When a staff member logs in, they see a personalized summary filtered by their role:

```
┌─────────────────────────────────────────────────────────────┐
│ SRF Teaching Portal — Editorial Home                        │
│                                                             │
│ Good morning. Here's what needs your attention:             │
│                                                             │
│ ┌────────────────────────┐ ┌────────────────────────────┐   │
│ │ Theme Tags             │ │ Daily Passages             │   │
│ │ 23 awaiting review     │ │ Pool: 412 passages         │   │
│ │ ○ Peace (8 new)        │ │ Next 7 days: ✓             │   │
│ │ ○ Courage (6 new)      │ │                            │   │
│ │ ○ Healing (9 new)      │ │                            │   │
│ └────────────────────────┘ └────────────────────────────┘   │
│                                                             │
│ ┌────────────────────────┐ ┌────────────────────────────┐   │
│ │ QA Flags               │ │ Calendar Events            │   │
│ │ 0 pending              │ │ Next: Mahasamadhi (Mar 7)  │   │
│ │ All clear ✓            │ │ 12 passages linked         │   │
│ └────────────────────────┘ └────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

#### Review Workflows

**Theme tag review** (STG-007):
```
┌─────────────────────────────────────────────────────────────┐
│ Theme: Peace — Review Candidates (8 of 23)                  │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ "Be as simple as you can be; you will be astonished     │ │
│ │ to see how uncomplicated and happy your life can        │ │
│ │ become."                                                │ │
│ │                                                         │ │
│ │ — Autobiography of a Yogi, Ch. 12, p. 118               │ │
│ │                                                         │ │
│ │ Similarity: 0.72 │ AI confidence: High                  │ │
│ │                                                         │ │
│ │ [a] Approve  [r] Reject  [▾] Adjust relevance          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Progress: ████████░░░░░░░░ 8/23 reviewed                    │
│ Session: resumed from yesterday                             │
└─────────────────────────────────────────────────────────────┘
```

Keyboard-driven: `a` approve, `r` reject, `→` next, `←` previous. Session position saved — resume where you left off tomorrow.

**Social media asset review** (STG-020):
```
┌─────────────────────────────────────────────────────────────┐
│ Tomorrow's Passage — Review                                 │
│                                                             │
│ ┌──────────┐ ┌──────────┐ ┌────────────────────┐           │
│ │          │ │          │ │                    │           │
│ │   1:1    │ │   9:16   │ │      16:9         │           │
│ │  Square  │ │  Story   │ │   Landscape       │           │
│ │          │ │          │ │                    │           │
│ └──────────┘ └──────────┘ └────────────────────┘           │
│                                                             │
│ Caption:                                                    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ "Be as simple as you can be..."                         │ │
│ │ — Paramahansa Yogananda, Autobiography of a Yogi        │ │
│ │ Read more: teachings.yogananda.org/passage/abc123       │ │
│ │ [Edit]                                                  │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Download: [Instagram] [Facebook] [Story] [Landscape]        │
│ Mark posted: □ Instagram  □ Facebook  □ Twitter             │
└─────────────────────────────────────────────────────────────┘
```

**Translation review** (STG-021):
```
┌─────────────────────────────────────────────────────────────┐
│ German Translation Review — 14 strings remaining            │
│                                                             │
│ ┌──────────────────────┬──────────────────────────────────┐ │
│ │ English (source)     │ German (AI draft)                │ │
│ ├──────────────────────┼──────────────────────────────────┤ │
│ │ "What are you        │ "Wonach suchen Sie?"             │ │
│ │  seeking?"           │                                  │ │
│ │                      │ Context: Search bar placeholder  │ │
│ │                      │                                  │ │
│ │                      │ [✓ Approve] [Edit] [Flag]        │ │
│ └──────────────────────┴──────────────────────────────────┘ │
│                                                             │
│ Progress: ████████████░░░░ 26/40 reviewed                   │
└─────────────────────────────────────────────────────────────┘
```

**Portal update review** (STG-007):
```
┌─────────────────────────────────────────────────────────────┐
│ Portal Update — Review                     AI-drafted       │
│                                                             │
│ Season: Spring 2027                                         │
│ Triggered by: deploy v3.2.0 (2027-04-15)                   │
│                                                             │
│ Title:                                                      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ The Library has grown                        [Edit]     │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Summary:                                                    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Three new books join the collection: Man's Eternal      │ │
│ │ Quest, The Divine Romance, and Journey to               │ │
│ │ Self-Realization.                             [Edit]     │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Category: new_content                                       │
│                                                             │
│ [✓ Approve & Publish] [Edit] [Discard]                      │
└─────────────────────────────────────────────────────────────┘
```

### Contentful Custom Apps (Sidebar Panels)

Lightweight React panels that appear in Contentful's entry editor sidebar, keeping editors contextually aware:

| Panel | Appears On | Shows |
|---|---|---|
| **Theme tags** | TextBlock entries | Current tags for this passage, pending review count, link to review queue |
| **Thread preview** | Editorial thread entries | Live reading flow preview — passages in sequence with transition notes |
| **Calendar passages** | Calendar event entries | Associated passages with relevance context, link to manage associations |
| **Topic readiness** | Teaching topic entries | Passage count, review status, publication readiness indicator |

### Notification Strategy

| Channel | Audience | Frequency | Content |
|---|---|---|---|
| **Email digest** | All editorial staff | Daily (configurable) | "12 new theme tag candidates, 3 QA flags, next week's passages ready for review." Direct links to review queues. |
| **Portal badges** | Staff who visit `/admin` | On each login | Count badges on editorial home screen |
| **No notification** | Leadership | Pull-based | They visit `/admin/impact` when they choose |

Email digest is the primary channel. Generated by a scheduled serverless function querying review queue counts from Neon.

### Technical Implementation

The admin portal is **not a separate application.** It is a route group within the existing Next.js app:

```
/app/
  admin/
    layout.tsx          ← Auth0 protection, admin nav, calm design shell
    page.tsx            ← Editorial home (role-filtered summary)
    themes/
      [slug]/page.tsx   ← Theme tag review queue
    passages/
      page.tsx          ← Daily passage curation
    calendar/
      page.tsx          ← Calendar event management
    social/
      page.tsx          ← Social media asset review
    translations/
      [locale]/page.tsx ← Translation review (per language)
    qa/
      page.tsx          ← Ingestion QA review
    impact/
      page.tsx          ← Leadership impact dashboard
    preview/
      themes/[slug]/page.tsx ← "Preview as seeker" for themes
      passages/page.tsx      ← Preview daily passage selection
```

Business logic lives in `/lib/services/` (consistent with FTR-015). The admin routes are thin presentation layers over:
- `/lib/services/review.ts` — review queue queries, approval/rejection
- `/lib/services/curation.ts` — daily passage selection, calendar management
- `/lib/services/social.ts` — asset generation, caption management
- `/lib/services/updates.ts` — portal update draft generation, review, publication (FTR-092)
- `/lib/services/translation.ts` — translation review, locale progress tracking
- `/lib/services/impact.ts` — aggregated metrics for leadership dashboard
- `/lib/services/collections.ts` — community collections, visibility management, submission pipeline (FTR-143)
- `/lib/services/graph.ts` — knowledge graph queries, subgraph extraction, cluster resolution (FTR-035)
- `/lib/mcp/` — MCP server (three-tier corpus access layer, FTR-098): `server.ts` (tier routing, auth), `tools/corpus.ts`, `tools/editorial.ts`, `tools/graph.ts`, `tools/people.ts`, `tools/fidelity.ts` (external envelope wrapper). All tools delegate to `/lib/services/` — zero business logic in the MCP layer.

### Stage Delivery

| Stage | Staff Experience Work |
|---|---|
| **3b** | Minimal admin portal: editorial home, theme tag review, daily passage curation, calendar event management, content preview, tone/accessibility spot-check, portal update review (FTR-092). Auth0 integration. Email digest. |
| **5a** | Social media asset review added. |
| **3b** | Contentful Custom Apps (sidebar panels). Full editorial workflow bridging Contentful authoring and portal review queues. (Contentful available from STG-001; Custom Apps ship with editorial portal.) |
| **5b** | Translation review UI. Volunteer reviewer access with scoped permissions (`translator:{locale}`). |
| **5b+** | Impact dashboard for leadership. |
| **7b** | VLD dashboard, curation briefs, trusted submitter workflow. VLD expansion to translation, theme tag, feedback, and QA tiers (as VLD capacity and SRF governance allow). |
