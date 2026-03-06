# FTR-067: Unified Review Queue Abstraction

**State:** Approved (Provisional)
**Domain:** editorial
**Arc:** 3b+

## Rationale

Every content workflow in the portal follows a common pattern: **Request → Draft/Propose → Review → Approve/Revise → Publish → Monitor.** The admin portal handles this for specific content types (theme tags, translations, social media, community collections, feedback) but benefits from a unifying UI pattern that presents all pending work consistently.

### Editorial Home as Unified Queue

The editorial home screen (already designed above) aggregates all review queues. This section specifies the common metadata that enables unified treatment:

| Field | Description |
|---|---|
| **Source** | Who proposed this item: AI, community member, VLD member, seeker feedback, staff |
| **Priority** | Type-based default: citation errors > QA flags > theme tags > community collections > feature suggestions |
| **Age** | How long this item has been waiting for review |
| **Assignee** | Who claimed it (or unassigned) |
| **Session state** | Partially reviewed — resume where you left off |

This is a **UI pattern, not a new data model.** Each underlying content type keeps its own schema and review logic. The editorial home screen queries across all queues and presents a unified summary:

```
┌───────────────────────────────────────────────────────────────┐
│ SRF Teaching Portal — Editorial Home                          │
│                                                               │
│ Good morning. Here's what needs your attention:               │
│                                                               │
│ ┌─────────────────────────┐ ┌─────────────────────────────┐   │
│ │ Theme Tags (23)         │ │ Daily Passages (3 gaps)     │   │
│ │ ○ Peace (8 new)         │ │ Pool: 412 passages          │   │
│ │ ○ Courage (6 new)       │ │ Next 7 days: needs review   │   │
│ └─────────────────────────┘ └─────────────────────────────┘   │
│                                                               │
│ ┌─────────────────────────┐ ┌─────────────────────────────┐   │
│ │ Corrections (3)         │ │ Community Submissions (5)   │   │
│ │ ● 1 citation error      │ │ 2 new, 3 in review         │   │
│ │   (high priority)       │ │ 1 VLD trusted               │   │
│ └─────────────────────────┘ └─────────────────────────────┘   │
│                                                               │
│ ┌─────────────────────────┐ ┌─────────────────────────────┐   │
│ │ Feedback (8)            │ │ VLD Briefs (2)              │   │
│ │ 1 citation report       │ │ 1 open, 1 submitted         │   │
│ │ 5 suggestions           │ │                             │   │
│ │ 2 uncategorized         │ │                             │   │
│ └─────────────────────────┘ └─────────────────────────────┘   │
│                                                               │
│ Queue Health:                                                 │
│ Oldest unreviewed item: 4 days (Theme Tags → Healing)         │
│ Items > 7 days: 0                                             │
└───────────────────────────────────────────────────────────────┘
```

### Queue Health Monitoring

Review queues grow with every arc. Without monitoring, backlogs can exceed a monastic editor's 2–3 hour daily window for weeks.

**Queue health indicators:**
- **Oldest unreviewed item** — displayed on editorial home screen
- **Items exceeding age threshold** — 7 days for standard items, 48 hours for citation errors
- **Queue depth trend** — growing, stable, or shrinking (rolling 14-day window)

**Escalation path:** If any queue exceeds its age threshold, the email digest (existing) highlights the overdue items. If a queue exceeds 2× the threshold, the portal coordinator receives a separate notification. This is operational awareness, not pressure — the goal is to surface backlogs before they compound.

**Service file:** `/lib/services/queue-health.ts` — cross-queue age queries, threshold checks, escalation triggers.
