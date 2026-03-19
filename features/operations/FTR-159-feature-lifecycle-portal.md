---
ftr: 159
title: Feature Lifecycle Portal
summary: "Calm operations surface with morning briefs, stakeholder feedback, and decision journal for features"
state: proposed
domain: operations
governed-by: [PRI-08, PRI-12]
depends-on: [FTR-156, FTR-096]
---

# FTR-159: Feature Lifecycle Portal

## Proposal

**Status:** Proposed
**Type:** Feature
**Governing Refs:** FTR-156 (Dream a Feature), FTR-096 (Operational Health), FTR-096 (Operational Surface), FTR-082 (Observability), FTR-085 (DELTA Privacy), FTR-084 (Documentation Architecture), PRI-08 (Calm Technology)
**Target:** STG-004 (lightweight: morning brief + email feedback) → STG-007 (full catalog UI + stakeholder circles + decision journal)
**Dependencies:** FTR-156 (Dream a Feature) operational — provides the autonomous development engine. FTR-096 operational surface deployed (STG-003). Vercel preview deployments working. Features exist to manage.

**The gap.** FTR-156 describes how features are autonomously developed and deployed to preview branches. FTR-096 provides health monitoring and deployment ceremony. Neither addresses what happens *between* preview deployment and production merge — the review, feedback, decision, and institutional memory lifecycle. The engineering leader currently manages this lifecycle across GitHub PRs, Vercel dashboards, email threads, and mental notes. The cognitive load compounds with every concurrent feature.

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
    AI assessment: Aligns with FTR-062. Principle-clean.
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

A page within the portal (not a separate app) at `/ops/features` — extending the `/ops` page from FTR-096. Lists all features in the lifecycle: proposed, in development, preview deployed, awaiting review, approved, declined.

```
┌──────────────────────────────────────────────────────────────────┐
│ The Garden                                                       │
│                                                                  │
│ Awaiting Your Review                                             │
│ ────────────────────                                             │
│                                                                  │
│ ◈ Sanskrit Hover Definitions                FTR-144 · FTR-038   │
│   Preview ready · Theological Review: 2/3 · Resonance: high     │
│   [Show Me]  [Review]  [Assign Circle]                           │
│                                                                  │
│ ◈ Reading Progress Indicator                FTR-145              │
│   Preview ready · No circle assigned · Resonance: moderate       │
│   AI note: performance budget consideration                      │
│   [Show Me]  [Review]  [Assign Circle]                           │
│                                                                  │
│ Growing                                                          │
│ ────────────────────                                             │
│                                                                  │
│ ○ Quiet Corner Circadian Bowls              FTR-146              │
│   Development: 60% · Est. preview: tomorrow                      │
│   [Watch]                                                        │
│                                                                  │
│ Planted for Later                                                │
│ ────────────────────                                             │
│                                                                  │
│ ◌ Cross-Book Connection Graph               FTR-128 · STG-008       │
│   Planted 2027-01 · Blooms: STG-008                         │
│                                                                  │
│ Recently Harvested                                               │
│ ────────────────────                                             │
│                                                                  │
│ ✓ Daily Passage Seasonality                 FTR-119              │
│   Approved 2027-03-12 · Merged v2a.4 · Decision: "Beautiful."   │
│                                                                  │
│                     ─── ◊ ───                                    │
│                                                                  │
│ [+ Plant a New Feature]    [The Archive]    [Decision Journal]   │
└──────────────────────────────────────────────────────────────────┘
```

**The garden metaphor.** Features are *planted*, not filed. They *grow*, not "progress through stages." They're *harvested* when merged, not "closed." Some are *planted for later* — seeded now, blooming in a future milestone. The language matters — it shapes how the engineering leader thinks about her work. Not as project management, but as cultivation.

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

**DELTA compliance (FTR-085).** Stakeholder feedback is operational data, not seeker behavioral data. Circle membership is explicit opt-in. No tracking of when they view previews or how long they spend. Comments are stored with attribution (operational record, not surveillance).

**The engineering leader's gesture:** On any feature card, she clicks "Assign Circle" → selects one or more circles → optional personal note → send. The system generates the email, creates the feedback page, and tracks responses. When all circle members have responded (or the deadline passes), the feature surfaces in the morning brief.

---

#### Layer 4: The "Show Me" Walkthrough

On any feature with a deployed preview, a guided narration of the seeker experience.

**Implementation approach.** Not a recorded video — a live, AI-narrated tour. Claude Code generates a walkthrough script from the feature's governing FTR specs and the actual deployed preview:

1. Claude reads the feature's FTR description and governing specs
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
  ftr_ref TEXT NOT NULL,                    -- FTR-NNN identifier
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

- The original FTR description
- The AI impact assessment
- Stakeholder feedback (if any)
- The engineering leader's decline reasoning
- The governing principle(s) that informed the decision

**The archive as immune system.** When someone asks "Why doesn't the portal have push notifications?" the archive answers: "FTR-NNN, proposed 2027-04, declined. PRI-08: Calm Technology — 'The portal waits; it does not interrupt.' Engineering leader's note: 'This would compromise the contemplative character of the portal.'"

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

**7:30am** — Morning brief arrives by email. The portal is healthy. One feature awaits review. The Sanskrit hover preview looks good. Brother Ananda left a thoughtful comment about IAST transliteration. She taps "Send to Theological Review" from the email link.

**10:00am** — She has an idea: "What if the Quiet Corner played different bowls for different times of day?" She types it into the feature catalog (or tells Claude via any interface). Claude creates FTR-146, runs the impact assessment — PRI-08 check: user-initiated audio, consistent. Cost: +0.2KB per audio file. Population impact: neutral. Resonance: high. She queues it for development with one click.

**12:00pm** — The Theological Review circle has responded. 2 approvals, 1 note: "Use IAST transliteration, not Harvard-Kyoto." She adds a revision note: "Use IAST." Claude re-enters development with the feedback. No context-switching needed — everything happened in the catalog.

**2:00pm** — She opens "Show Me" on a feature she approved yesterday. Watches the 30-second walkthrough. The daily passage seasonality feature shows winter passages with subtle cool undertones. She smiles. This is beautiful. She clicks Approve, adds a note: "Beautiful." Claude merges to main, deploys to production. The portal grows.

**4:30pm** — She checks the catalog. Nothing else needs her. The Quiet Corner audio feature is growing — Claude is 60% through, estimated preview tomorrow. She can click "Watch" to see Claude working if she's curious, but she doesn't need to.

**5:00pm** — The portal tells her: "The portal is well. The Sanskrit hover revision will be ready for review tomorrow morning. The teachings are being served." She closes her laptop.

---

#### Implementation Phasing

| Phase | Milestone | What Ships | Effort |
|-------|-----------|-----------|--------|
| **Lightweight** | 2a | Morning brief (email), FTR-156 dream engine, Vercel preview links, email-based circle feedback | Days |
| **Catalog** | 3b | `/ops/features` garden UI, circle management, "Show Me" walkthrough, decision journal data model | Weeks |
| **Full** | 3b+ | Resonance score, historical pattern learning, "Why Not?" archive, stakeholder digest customization | Iterative |

**Phase 1 (Lightweight)** can function with zero custom UI — the morning brief is an email, feature management uses GitHub PRs and Vercel previews, stakeholder feedback uses email reply. This validates the workflow before building the surface.

**Phase 2 (Catalog)** builds the garden UI within the existing `/ops` page structure from FTR-096. The feature catalog is a Next.js page consuming GitHub API (branches, PRs), Vercel API (previews), and the portal's own database (decisions, comments).

**Phase 3 (Full)** adds the intelligence layers — resonance scoring, pattern learning from the decision journal, and the archive as a navigable collection.

---

#### What This Is NOT

- **Not a project management tool.** No Gantt charts, no velocity tracking, no story points, no sprint boards. Features grow at their own pace. The engineering leader tends, not tracks.
- **Not a CI/CD dashboard.** FTR-096 handles deployment health. FTR-159 handles the *human* lifecycle around features — decisions, feedback, institutional memory.
- **Not required for the portal to function.** Seekers never see this. If FTR-159 is never built, the portal still serves Yogananda's teachings. This serves the *people building* the portal.
- **Not surveillance of the engineering leader.** The decision journal is hers. She controls what reasoning she captures. The resonance score reflects her patterns back to her — it doesn't report them to anyone.

#### Relationship to Other Proposals

- **FTR-156 (Dream a Feature)** is the engine — autonomous development, Neon branching, Vercel preview deployment. FTR-159 is the surface — the human experience around that engine.
- **FTR-096 (Operational Health)** provides the health monitoring that feeds the morning brief's "is everything okay?" answer. FTR-159 extends that health surface with the feature lifecycle.
- **FTR-096 (Operational Surface)** provides the infrastructure (`/ops` page, deploy manifests, health endpoint). FTR-159 adds feature-specific pages to that surface.
- **FTR-096 (Design-Artifact Traceability)** provides the `@implements`/`@validates` annotation convention that FTR-159's catalog uses to show which specs a feature implements.

**Re-evaluate At:** STG-004 (lightweight: morning brief + email circles), STG-007 (full catalog UI)
**Decision Required From:** Architecture (data model, integration points), human principal (stakeholder circle membership, feedback governance — who can comment on features?)

## Notes

**Provenance:** FTR-159 → FTR-159
