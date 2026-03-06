# FTR-092: Portal Updates

> **State:** Approved
> **Domain:** operations
> **Arc:** 3b+
> **Governed by:** PRI-03, PRI-08
> **Replaces:** FTR-092, FTR-092

## Rationale

- **Status:** Accepted
- **Date:** 2026-02-22

### Context

Over a 10-year lifespan, the portal will evolve through multiple arcs — adding books, languages, features, and content types. Seekers who visited in Milestone 3a and return in Milestone 5a would not know that WhatsApp search, Sacred Places, reading journeys, or the Knowledge Graph exist unless they stumble upon them. Existing mechanisms cover content additions (deliverable M3a-8's "What's New in the Library" gold dot for new books; Milestone 5a RSS feed `/feed/new-content.xml` for new books/recordings/videos) but nothing communicates *capability* changes to seekers.

The daily email (FTR-154) explicitly excludes announcements: "The email is a passage, not a newsletter. No announcements, no feature updates." This is correct — the email channel must remain pure. But the portal itself should offer a quiet, opt-in way for seekers to learn what has changed.

| Approach | Description | Fit |
|----------|-------------|-----|
| **Homepage banner** | "New! Knowledge Graph" | Poor — violates Calm Technology; attention-grabbing |
| **Email announcements** | Feature updates in daily email | Poor — FTR-154 explicitly forbids this |
| **Push notifications** | Browser notifications for new features | Poor — aggressive; antithetical to DELTA |
| **Dedicated `/updates` page** | Quiet page linked from footer, written in portal voice | Good — opt-in, transparent, contemplative |
| **RSS feed extension** | Add portal updates to existing RSS infrastructure | Good — machine-readable, no UI overhead |

### Decision

**A `/updates` page — "The Library Notice Board" — linked from the site footer.** Portal updates are written in the portal's contemplative editorial voice (FTR-054), centered on the teachings rather than the technology. AI drafts update notes from deployment metadata and git history; human review is mandatory before publication (consistent with the "AI proposes, humans approve" principle). The page maintains a seasonal archive of all portal changes.

### Guiding Metaphor

A library notice board, not a SaaS changelog. The notice board says "The poetry wing is now open" — not "Version 2.0: Poetry Module Deployed."

### Voice Standards

| SaaS Voice (wrong) | Portal Voice (right) |
|---------------------|---------------------|
| "New Feature: Knowledge Graph!" | "The teachings are now connected — explore how Yogananda's ideas flow across books" |
| "We added WhatsApp support" | "You can now ask Yogananda's books a question from WhatsApp" |
| "Dark mode is here" | "The reader now adjusts to evening light" |
| "v3.2: Bug fixes and performance" | *(omit — seekers don't need this)* |
| "9 new languages!" | "The teachings are now available in Hindi, Bengali, Thai, and six more languages" |

### Content Categories

| Category | Include? | Rationale |
|----------|----------|-----------|
| New books added to the library | Yes | Directly serves mission — "the library has grown" |
| New languages added | Yes | "The teachings are now available in Hindi" |
| New content types (audio, video) | Yes | "You can now hear Yogananda's voice" |
| Major new pages (Sacred Places, Knowledge Graph, Quiet Corner textures) | Yes | New ways to explore the teachings |
| Seeker-noticeable UX improvements | Selectively | Only when meaningful — "The reader now remembers where you left off" |
| Bug fixes, performance | No | Developer concerns, not seeker concerns |
| Infrastructure changes (regional distribution, environment promotion) | No | Internal, invisible |
| Security patches | No | Standard maintenance |

### Automation Pipeline

```
Git tags / deploy events
    → AI reads commit history since last release
    → AI drafts seeker-facing summary in portal voice (FTR-054)
    → Draft enters editorial review queue (FTR-060, FTR-067)
    → Portal coordinator or content editor reviews and approves
    → Published to /updates page and RSS feed
```

**AI role:** Category C (drafting) per FTR-005 taxonomy — same pattern as social media captions (FTR-154) and UI string translation (FTR-135). Claude reads developer-facing deployment metadata and produces seeker-facing prose. Human review is mandatory.

### Archive Format

Updates are organized by season, not version number — consistent with the portal's calendar awareness (FTR-065) and contemplative sensibility:

```
Spring 2027
  The Library has grown — three new books join the collection
  The teachings are now connected across books

Winter 2026
  The portal opens — Autobiography of a Yogi, free to the world
```

Over a decade, this archive becomes a narrative of the portal's growth — the philanthropist's offering unfolding over time.

### DELTA Compliance

| DELTA Principle | How Updates Page Complies |
|-----------------|--------------------------|
| **Dignity** | Transparently shows what's available — never "you're missing out" |
| **Embodiment** | Never optimizes for return visits. No "come back to see what's new" |
| **Love** | Warm language centered on the teachings, not the technology |
| **Transcendence** | No gamification — no "X features added this quarter!" counts |
| **Agency** | Seekers discover updates at their own pace. No push notifications |

### Placement

- **Primary:** `/updates` page linked from site footer ("What's new in the portal")
- **RSS:** `/feed/updates.xml` alongside existing content feeds (Milestone 5a)
- **About page:** Brief "Recent additions" summary on the About page (optional, editorial judgment)
- **Not:** Homepage banners, daily email, push notifications, or nav-bar badges

### Multilingual (Milestone 5b+)

Update notes follow the same translation workflow as other editorial content (FTR-135): AI drafts translation, human reviewer approves. A Hindi-speaking seeker learns about the Hindi launch in Hindi.

### Rationale

- **Content Availability Honesty** (CONTEXT.md) already commits the portal to transparency about what it has. This extends that honesty to capabilities.
- **The philanthropist's foundation** (FTR-154) benefits from a public record of portal growth — the `/updates` archive complements the "What Is Humanity Seeking?" dashboard as evidence of stewardship.
- **Returning seekers** deserve to know what's changed. A contemplative notice board respects their attention without demanding it.
- **10-year horizon** (FTR-004): over a decade, the changelog becomes a narrative artifact — meaningful in its own right.

### Consequences

- New FTR-092 in DESIGN.md specifying the `/updates` page design, data model, and editorial workflow
- New deliverable in Milestone 3b (when the editorial portal activates — first milestone with human review capability)
- New AI workflow in FTR-069 for update note drafting
- New review queue type (`updates`) in the editorial portal (FTR-067)
- RSS feed extension in Milestone 5a
- Portal coordinator role gains update review responsibility
- `portal_updates` table added to schema

- **Relates to:** FTR-054 (editorial voice), FTR-060 (editorial portal), FTR-154 (daily email — boundary: updates stay out of email), FTR-154 (social media — parallel "AI drafts, human approves" pattern), FTR-082 (DELTA analytics), FTR-154 (philanthropist communications), FTR-067 (unified review queue), FTR-069 (AI workflows)

## Specification

A dedicated `/updates` page presenting seeker-facing release notes in the portal's contemplative editorial voice (FTR-054). Linked from the site footer. Governed by FTR-092.

### Data Model

```sql
-- Portal updates (seeker-facing changelog)
CREATE TABLE portal_updates (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  title TEXT NOT NULL,                          -- seeker-facing title (e.g., "The Library has grown")
  summary TEXT NOT NULL,                        -- 1–2 sentence summary for RSS and /updates listing
  body TEXT,                                    -- full update text (Markdown)
  category TEXT NOT NULL CHECK (category IN (
    'new_content',                              -- new books, audio, video added
    'new_language',                             -- new language activated
    'new_feature',                              -- major new page or capability
    'improvement'                               -- seeker-noticeable UX improvement
  )),
  language TEXT NOT NULL DEFAULT 'en',          -- i18n from the start
  published_at TIMESTAMPTZ,                    -- NULL = draft, non-NULL = published
  season_label TEXT NOT NULL,                   -- "Winter 2026", "Spring 2027" — editorial, not computed
  drafted_by TEXT NOT NULL DEFAULT 'auto',      -- 'auto' (AI-drafted) or 'manual' (human-written)
  reviewed_by TEXT,                             -- editor who approved for publication
  deployment_ref TEXT,                          -- git tag or deployment ID that triggered the draft
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_portal_updates_published ON portal_updates(published_at DESC) WHERE published_at IS NOT NULL;
CREATE INDEX idx_portal_updates_language ON portal_updates(language);
```

### API

```
GET /api/v1/updates
  ?language=en            -- default: en
  ?cursor=<uuid>          -- cursor-based pagination
  ?limit=20               -- default: 20

Response: {
  updates: [{ id, title, summary, body, category, season_label, published_at }],
  cursor: <next_cursor>
}
```

### Page Design

Located at `/updates` — linked from site footer as "What's new in the portal."

```
┌─────────────────────────────────────────────┐
│ What's New in the Portal                    │
│                                             │
│ Spring 2027                                 │
│ ─────────────────────────                   │
│                                             │
│ The Library has grown                       │
│ Three new books join the collection:        │
│ Man's Eternal Quest, The Divine Romance,    │
│ and Journey to Self-Realization.            │
│                                             │
│ The teachings are now connected             │
│ Explore how Yogananda's ideas flow across   │
│ books — the Related Teachings panel shows   │
│ connections as you read.                    │
│                                             │
│ Winter 2026                                 │
│ ─────────────────────────                   │
│                                             │
│ The portal opens                            │
│ Autobiography of a Yogi — free to the       │
│ world. Search Yogananda's words, read       │
│ chapter by chapter, find a quiet moment     │
│ in the Quiet Corner.                        │
│                                             │
│             ─── ◊ ───                       │
│                                             │
│ RSS: /feed/updates.xml                      │
└─────────────────────────────────────────────┘
```

### Typography and Layout

- **Heading:** "What's New in the Portal" — Merriweather 400, `--text-xl`, `--srf-navy`
- **Season headings:** Merriweather 400 italic, `--text-lg`, `--srf-navy`, with gold rule beneath
- **Update titles:** Merriweather 400, `--text-base`, `--srf-navy`
- **Update body:** Lora 400, `--text-sm`, `--text-body`
- **Max width:** `38rem` (same as reader — this is a reading page)
- **Generous whitespace** between seasons and between updates — each update breathes
- **No dates on individual updates** — seasonal grouping provides temporal context without SaaS-like timestamp precision
- **Lotus divider** between seasons (same `◊` pattern as reader chapter dividers)

### Editorial Workflow

1. **Trigger:** Deployment to production, or portal coordinator identifies a seeker-visible change
2. **AI drafts:** Claude reads deployment metadata (git tag, commit messages since last update) and drafts a seeker-facing summary following FTR-092 voice standards. Draft enters the `updates` review queue in the editorial portal (FTR-067)
3. **Human review:** Portal coordinator or content editor reviews, edits for voice consistency, and publishes. Same keyboard-driven workflow as other review queues
4. **Publication:** Update appears on `/updates` page and in `/feed/updates.xml` RSS feed

**Frequency:** Not every deployment generates an update. Only seeker-visible changes warrant a notice. The portal coordinator exercises editorial judgment about what rises to the level of a seeker-facing update. Internal infrastructure changes, bug fixes, and performance improvements are omitted.

### RSS Feed

`/feed/updates.xml` — RSS 2.0, alongside existing content feeds planned in Milestone 5a. Each item includes title, summary, category, and portal link.

### Milestone Delivery

| Milestone | What Ships |
|-----------|-----------|
| **3b** | `/updates` page, `portal_updates` table, AI draft pipeline, review queue. First entries cover Arcs 1–3 retrospectively. |
| **5a** | `/feed/updates.xml` RSS feed alongside other RSS feeds. |
| **5b+** | Multilingual update notes via FTR-135 translation workflow. |

### Accessibility

- Semantic HTML heading hierarchy: `<h1>` page title, `<h2>` season headings, `<h3>` update titles
- Clean, text-first layout — ideal for screen readers (heading-level navigation)
- RSS feed provides alternative access channel
- ARIA label: "What's new in the portal — a record of how the library has grown"

## Notes

**Provenance:** FTR-092 + FTR-092 → FTR-092
