# FTR-086: Outbound Webhooks

> **State:** Approved
> **Domain:** operations
> **Arc:** 5a+
> **Governed by:** PRI-11
> **Replaces:** FTR-086, FTR-086

## Rationale

**Status:** Accepted
**Date:** 2026-02-22
**Deciders:** Architecture team
**Context:** FTR-015 (API-first), FTR-059 (machine readability), FTR-097 (rate limiting), FTR-134 (messaging channels), FTR-154 (daily email), FTR-154 (social media), FTR-092 (portal updates)

### Context

The portal publishes content through multiple channels: web, daily email, RSS feeds, WhatsApp, SMS, social media, and the external MCP server. Every outbound channel currently must either poll the API for changes or be hard-wired into the content lifecycle code. This creates two problems:

1. **Polling is wasteful and laggy.** SRF's existing Zapier workflows (connected to SendGrid, Constant Contact, MS Dynamics, and other systems per the SRF Tech Stack Brief) would need to poll portal API endpoints at regular intervals to detect changes. Zapier's polling triggers check every 1–15 minutes depending on plan tier. For a daily passage that changes at midnight UTC, this means up to 15 minutes of unnecessary delay — and thousands of wasted requests across all Zapier workflows per day.

2. **Tight coupling.** Without a generic event system, each new distribution channel requires modifying the content lifecycle code. Adding a WhatsApp notification when a new book is published means editing the book ingestion pipeline. This scales poorly as channels multiply.

A lightweight outbound webhook system lets the portal **push** content lifecycle events to registered consumers — SRF's Zapier, internal systems, future partner integrations, and the portal's own subsystems — without modifying content pipelines.

### Decision

Implement an outbound webhook event system that publishes content lifecycle events to registered subscribers via HTTP POST. Events follow a standardized envelope format. Webhook registration is admin-only (no self-service until Milestone 7a+).

### Event Catalog

| Event | Fires When | Payload Summary |
|-------|-----------|-----------------|
| `daily_passage.rotated` | Daily passage changes (midnight UTC) | `chunk_id`, passage text, citation, `reader_url` |
| `content.published` | New book, chapter, audio recording, or video is published | `content_type`, `content_id`, title, `language` |
| `content.updated` | Existing content corrected (text, metadata, citations) | `content_type`, `content_id`, `changed_fields[]` |
| `theme.published` | New teaching theme approved and published | `theme_slug`, theme name, `category` |
| `collection.published` | Community collection approved by staff (FTR-143) | `collection_id`, title, `passage_count` |
| `social_asset.approved` | Social media quote image approved for distribution (FTR-154) | `chunk_id`, `asset_urls{}` (by aspect ratio), caption |
| `portal_update.published` | New portal update published (FTR-092) | `update_id`, title, summary, category |
| `search_index.rebuilt` | Search index recomputed (re-embedding, migration) | `affected_books[]`, `chunk_count` |
| `email.dispatched` | Daily email sent to subscribers (FTR-154) | `chunk_id`, `subscriber_count` (no PII) |
| `journey.step` | Calendar journey advances to next day's passage (FTR-056) | `journey_slug`, `day_number`, `chunk_id` |

Events that involve content include enough data for the subscriber to act without a follow-up API call (e.g., the `daily_passage.rotated` event includes the passage text and citation, so Zapier can format an email without querying `/api/v1/daily-passage`). This reduces round-trips for automation consumers.

### Webhook Envelope

```json
{
  "event": "daily_passage.rotated",
  "event_id": "evt_01H...",
  "timestamp": "2026-03-15T00:00:12Z",
  "portal_version": "v1",
  "data": {
    "chunk_id": "uuid",
    "content": "The soul is ever free...",
    "book_title": "Autobiography of a Yogi",
    "chapter_number": 14,
    "page_number": 142,
    "reader_url": "/books/autobiography-of-a-yogi/14#chunk-uuid"
  }
}
```

Every envelope includes:
- `event` — machine-readable event type from the catalog
- `event_id` — unique UUID for idempotency (subscribers can deduplicate)
- `timestamp` — ISO 8601 UTC when the event occurred
- `portal_version` — `v1` (incremented if envelope schema changes)
- `data` — event-specific payload

### Delivery Semantics

- **At-least-once delivery.** Failed deliveries (non-2xx response or timeout) retry with exponential backoff: 1 min, 5 min, 30 min, 2 hours, 12 hours. After 5 failures, the webhook is marked `suspended` and an alert fires in Sentry.
- **Timeout:** 10 seconds per delivery attempt. Subscribers must respond quickly (accept and process asynchronously).
- **Signature verification:** Each delivery includes an `X-Portal-Signature` header — HMAC-SHA256 of the raw body using the subscriber's secret key. Subscribers should verify to prevent spoofing.
- **Ordering:** Events are delivered in approximate chronological order but not guaranteed. Subscribers should use `timestamp` for ordering, not delivery order.
- **No fan-out queuing in Milestone 5a.** Initial implementation fires webhooks synchronously from a background job (Vercel cron or Lambda). If subscriber count grows beyond ~20, migrate to SQS fan-out (Milestone 5b+).

### Schema

```sql
CREATE TABLE webhook_subscribers (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  name TEXT NOT NULL,                      -- "SRF Zapier — Daily Email", "Internal Slack Bot"
  url TEXT NOT NULL,                       -- Delivery URL (HTTPS required)
  secret TEXT NOT NULL,                    -- HMAC signing secret
  events TEXT[] NOT NULL,                  -- Subscribed event types, e.g. '{daily_passage.rotated,content.published}'
  is_active BOOLEAN DEFAULT true,
  suspended_at TIMESTAMPTZ,               -- Set after 5 consecutive failures
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by TEXT NOT NULL                 -- Admin who registered (email or role identifier)
);

CREATE TABLE webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  subscriber_id UUID NOT NULL REFERENCES webhook_subscribers(id),
  event_id TEXT NOT NULL,                  -- From envelope
  event_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'delivered', 'failed', 'suspended')),
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  response_status INTEGER,                -- HTTP status from subscriber
  response_body TEXT,                      -- First 1KB of response (for debugging)
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_deliveries_pending ON webhook_deliveries(status, created_at)
  WHERE status IN ('pending', 'failed');
CREATE INDEX idx_deliveries_subscriber ON webhook_deliveries(subscriber_id, created_at DESC);
```

### Webhook Use Cases by Consumer

**SRF Internal (Zapier / Lambda)**
- Daily passage → SendGrid/Constant Contact email campaigns
- Daily passage → WhatsApp broadcast to subscribed seekers (FTR-134)
- New content → MS Dynamics CRM update (donor/stakeholder communications)
- Social asset approved → Buffer/Hootsuite scheduling queue
- Portal update → internal Slack/Teams notification for AE team
- Content correction → trigger CDN cache purge via Vercel API
- Search index rebuilt → trigger integration test suite

**Editorial / Staff**
- Content published → notify editorial staff via email/Slack (independent of admin portal)
- Collection submitted → alert review queue (staff who aren't in the admin portal all day)
- Seeker feedback spike → alert if feedback count exceeds threshold (potential issue)
- Journey step → daily operational confirmation that journey emails dispatched correctly

**Community / External (Milestone 7a+)**
- Daily passage → third-party spiritual apps that want to display "Today's Wisdom"
- Content published → meditation center websites that embed a "Latest from Yogananda" widget
- Theme published → partner sites that curate topical Yogananda content

**Portal Internal Subsystems**
- Content published → incremental sitemap regeneration (SEO)
- Content updated → RSS feed regeneration (instead of polling the database on a cron)
- Content published → pre-warm CDN cache for new pages
- Social asset approved → auto-post to RSS (machine syndication of social assets)

### Admin Interface

Webhook subscribers are managed via the editorial admin portal (established Milestone 3b; subscriber management added Milestone 5a, extending FTR-060). The interface shows:
- Registered subscribers with event subscriptions
- Delivery log (last 30 days) with success/failure status
- "Test" button to send a test event to a subscriber
- "Suspend/Resume" controls for failing subscribers

No self-service registration. All subscribers are provisioned by SRF staff. Milestone 7a+ may introduce self-service registration with API key auth for external consumers.

### Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| **Polling only (no webhooks)** | Simplest to build | Wasteful, laggy, scales poorly with consumers, tight coupling |
| **AWS EventBridge** | Managed, scalable, native AWS | Adds infrastructure dependency, overkill for <20 subscribers, harder to debug |
| **AWS SNS** | Managed pub/sub, HTTP subscriptions built-in | Subscription confirmation flow is awkward for Zapier, less control over retry logic |
| **Custom webhook system** | Full control, simple to understand, matches portal's "boring technology" ethos | Must build retry logic, monitoring, admin UI |

The custom webhook system wins because:
- The portal has <20 expected subscribers for several years
- Zapier consumes standard HTTP POST natively (no adapters needed)
- The retry logic is ~50 lines of code in a cron job
- Full observability via the existing Sentry + structured logging stack
- No new AWS service to provision, monitor, or pay for

### DELTA Compliance

Webhook payloads never contain seeker data. Events describe *content* lifecycle (a passage was published, a theme was added) — never *user* behavior (a seeker searched, a seeker read). The `email.dispatched` event includes `subscriber_count` (aggregate) but no individual subscriber data. The `seeker_feedback` system (FTR-061) does not fire webhook events — feedback is internal-only.

### Delivery Schedule

| Milestone | What Ships |
|-----------|-----------|
| **Milestone 5a** | Webhook schema, subscriber management, delivery engine. Initial events: `daily_passage.rotated`, `content.published`, `content.updated`, `social_asset.approved`, `portal_update.published`. Admin UI in editorial portal. |
| **Milestone 1c+** | Contentful webhook *inbound* (deliverable M1c-8) triggers portal webhook *outbound* events (`content.published`, `content.updated`). |
| **Milestone 5b+** | Additional events as channels mature: `journey.step`, `email.dispatched`. SQS fan-out if subscriber count exceeds ~20. |
| **Milestone 7a+** | Self-service webhook registration with API key auth for external consumers. |

### Consequences

- New `webhook_subscribers` and `webhook_deliveries` tables in Milestone 5a migration
- New background job for webhook delivery and retry (Vercel cron or Lambda)
- DESIGN.md § FTR-086 documents the webhook event system
- ROADMAP.md Milestone 5a gains webhook deliverable
- FTR-059 § RSS section updated: RSS feeds regenerate via webhook event rather than polling cron
- SRF's existing Zapier workflows can subscribe to portal events from Milestone 5a launch
- Future messaging channels (FTR-134) can subscribe to `daily_passage.rotated` instead of polling

## Specification

The portal publishes content lifecycle events to registered HTTP subscribers via a lightweight outbound webhook system (FTR-086). This decouples content pipelines from distribution channels — new consumers (Zapier workflows, internal bots, partner integrations) subscribe to events without modifying content code.

### Architecture

```
Content Lifecycle (book published, passage rotated, asset approved)
      │
      ▼
┌─────────────────────┐
│ Event Emitter        │  Fires event to webhook_deliveries table
│ (in content service) │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ Delivery Worker      │  Vercel cron (Milestone 5a) or Lambda (Milestone 5b+)
│ (background job)     │  Reads pending deliveries, POSTs to subscribers
└────────┬────────────┘
         │
    ┌────┴────┬──────────┬──────────────┐
    ▼         ▼          ▼              ▼
 Zapier    Slack Bot   RSS Regen    CDN Pre-warm
```

### Event Catalog Summary

| Event | Trigger | Key Consumers |
|-------|---------|---------------|
| `daily_passage.rotated` | Midnight UTC | Zapier → email, WhatsApp broadcast |
| `content.published` | New book/chapter/audio/video | Sitemap regen, CRM update, RSS regen |
| `content.updated` | Content correction | CDN cache purge, RSS regen |
| `social_asset.approved` | Staff approves quote image | Social scheduling tools |
| `portal_update.published` | New portal changelog entry | Internal Slack, RSS regen |

Full catalog, envelope format, delivery semantics, and schema in FTR-086.

### Admin UI (Milestone 5a, editorial portal)

- Subscriber list with event subscriptions and active/suspended status
- Delivery log (30-day rolling) with success/failure and response codes
- "Test" button per subscriber to verify connectivity
- Suspend/Resume controls for failing endpoints

### DELTA Compliance

Events describe content lifecycle only — never seeker behavior. No PII in any payload. The `email.dispatched` event reports `subscriber_count` (aggregate), not individual addresses.

## Notes

**Provenance:** FTR-086 + FTR-086 → FTR-086
