---
ftr: 134
title: Low-Tech and Messaging Channel Strategy
summary: "WhatsApp, SMS, Telegram, USSD, and IVR channels for feature phones and basic phones"
state: approved
domain: experience
governed-by: [PRI-05, PRI-06]
depends-on: [FTR-015]
---

# FTR-134: Low-Tech Channels

## Rationale


### Context

The portal's primary interface is a web application. This serves smartphone and desktop users well, but excludes seekers who access the internet primarily through:

- **Feature phones** (KaiOS, basic browsers) — ~1 billion devices globally, concentrated in India, Africa, Southeast Asia
- **Basic phones** (SMS-only, no browser) — ~3 billion people worldwide
- **Metered data** where even a 100KB page load is a considered expense
- **No personal device** — shared community phones, cybercafé access

The portal's mission is to make Yogananda's teachings freely accessible *worldwide*. "Worldwide" includes the seeker in rural Bihar who has a basic Nokia phone and intermittent SMS access. The API-first architecture (FTR-015) already enables non-web access channels — every passage, every search result is available via a JSON API. The question is: which channels should we build?

### Decision

Build a multi-channel access strategy that meets seekers where they are, using the messaging platforms they already use. Prioritize by reach and cost-effectiveness.

### Channel Assessment

| Channel | Reach | Cost Model | Richness | Implementation |
|---------|-------|-----------|----------|----------------|
| **WhatsApp Business API** | 2.7B users. Dominant in India, Brazil, Nigeria, Indonesia, Mexico | Per-conversation: $0.005–0.08 depending on region and initiation | Rich: text, images, audio clips, buttons, links | Lambda + WhatsApp Cloud API |
| **SMS (inbound + outbound)** | Universal. Every phone. No internet required. | Per-message: $0.002–0.04 depending on country and provider | 160 chars (Latin) / 70 chars (non-Latin). Multi-part available. | Lambda + Twilio or Africa's Talking |
| **Telegram Bot** | 800M users. Popular in Russia, Iran, Southeast Asia, parts of Africa | Free (no per-message cost) | Rich: text, images, audio, inline keyboards, formatting | Lambda + Telegram Bot API |
| **USSD** | Universal in Africa. Works on any phone. | Per-session: $0.01–0.05 | Menu-driven, 182 chars per screen, session-based | Requires telco partnership (Africa's Talking) |
| **IVR (Voice)** | Universal. Serves non-literate seekers. | Per-minute: $0.01–0.10 | Audio only. Could play Yogananda's voice recordings. | Lambda + Twilio Voice |

### Tier 1: WhatsApp (Highest Impact)

WhatsApp is the most impactful channel for the Global South. In India alone, WhatsApp has 500M+ users. A seeker can message the portal's WhatsApp number with a spiritual question and receive passages with full citations.

```
Seeker: "What does Yogananda say about overcoming fear?"

Portal: 📖 From *Autobiography of a Yogi*, Chapter 12, p. 98:

"Fearlessness means faith in God: faith in His
protection, His justice, His wisdom, His mercy,
His love, and His omnipresence."

— Paramahansa Yogananda

📖 1 more passage found. Reply MORE to see it.
🔗 Read the full chapter: teachings.yogananda.org/books/autobiography/12

Reply with any topic to search, or DAILY for today's wisdom.
```

**WhatsApp capabilities:**
- **Search queries.** Seeker sends a question or topic. Lambda queries the search API, formats top 1-2 results for WhatsApp's message format (1024 char limit per message, Markdown-like formatting).
- **Daily Wisdom opt-in.** Seeker sends "DAILY" to subscribe. Each morning, the same daily passage from the web portal is sent via WhatsApp. Opt-out: send "STOP."
- **Audio clips.** When a search matches an audio recording, send a brief audio clip (WhatsApp supports up to 16MB audio messages). "Listen to Yogananda speak about this topic."
- **Language selection.** Seeker sends "HINDI" or "ESPAÑOL" to switch language for UI messages. Content availability depends on translated corpus.
- **Share from portal.** On the web portal, `navigator.share` already surfaces WhatsApp as a sharing target. The shared link includes Open Graph metadata so the message renders with a passage preview.

**Implementation:**
```
Seeker (WhatsApp) → WhatsApp Cloud API webhook → API Gateway → Lambda
 │
 ├── Parse message intent (topic search, command, language switch)
 ├── Query /api/v1/search or /api/v1/daily-passage
 ├── Format response for WhatsApp (Markdown, citations, buttons)
 └── Send reply via WhatsApp Cloud API
```

### Tier 2: SMS (Widest Reach)

SMS reaches every phone on Earth. No app, no internet, no data plan. The seeker texts a topic keyword to a phone number and receives a Yogananda passage by SMS.

```
Seeker texts "FEAR" to +1-XXX-YYY-ZZZZ

Reply:
"Fearlessness means faith in God: faith in His
protection, His justice, His wisdom, His love."
— Yogananda, Autobiography of a Yogi, Ch.12, p.98
Reply FEAR2 for more. DAILY for daily wisdom.
```

**SMS constraints:**
- **160 characters** (Latin script) or **70 characters** (Unicode/non-Latin) per segment. Multi-part SMS is possible but more expensive and less reliable.
- **Short passages only.** Affirmations, aphorisms, and brief quotes from *Sayings of Paramahansa Yogananda* and *Scientific Healing Affirmations* fit well. Long narrative passages from *Autobiography* must be truncated with "..." and a citation.
- **No links** (feature phones can't open URLs). The passage must be self-contained.
- **Cost.** SMS costs vary widely: ~$0.002/message in India, ~$0.04/message in the US, ~$0.01–0.02/message in Africa. Monthly cost depends on volume. At 1,000 messages/day globally: ~$600–1,200/month.
- **Dedicated numbers.** Short codes (e.g., "text YOGANANDA to 12345") are expensive ($500–1,000/month in the US). Long codes or toll-free numbers are cheaper. Local numbers per country reduce inbound cost for seekers.

**SMS sharing from the portal:**
- `navigator.share` already includes SMS as a sharing target on smartphones
- The shared content should be the passage text + citation (not just a URL), since the recipient may be on a feature phone that can't open links
- Passage share format for SMS: `"{quote}" — Yogananda, {Book}, Ch.{N}, p.{P}`

**SMS inbound implementation:**
```
Seeker (SMS) → Twilio / Africa's Talking webhook → API Gateway → Lambda
 │
 ├── Parse keyword (topic, command)
 ├── Query /api/v1/search (limit=1, optimized for short passages)
 ├── Format for SMS (truncate to 160 chars, include citation)
 └── Send reply via SMS gateway
```

### Tier 3: Telegram Bot (Free, Rich)

Telegram is free to operate (no per-message cost) and offers rich formatting. Worth building because the marginal cost after WhatsApp is low — same Lambda function, different message formatting.

```
/search overcoming fear → Search and return passages
/daily → Subscribe to daily wisdom
/audio fear → Find audio recordings on this topic
/language hindi → Switch UI language
```

### Tier 4: USSD and IVR (Exploration)

USSD and voice are the deepest-reach channels but require telco partnerships and are operationally complex. Evaluate after WhatsApp and SMS prove demand.

**USSD concept (Africa):**
```
Dial *384*YOGA#
1. Search teachings
2. Today's wisdom
3. Listen to audio
4. Change language
```

**IVR concept:**
```
Call +1-XXX-YYY-ZZZZ
"Welcome to the teachings of Paramahansa Yogananda.
Press 1 to hear today's wisdom.
Press 2 to search by topic.
Press 3 to hear a recording of Yogananda's voice."
```

IVR is uniquely powerful because it serves non-literate seekers and allows playing Yogananda's actual voice recordings — a direct connection to the Master's teachings that no text channel can provide.

### Shared Architecture

All channels share the same backend:

```
 ┌──────────────┐
WhatsApp webhook ──→│ │
SMS webhook ───────→│ Lambda │──→ /api/v1/search
Telegram webhook ──→│ (channel │──→ /api/v1/daily-passage
USSD callback ────→│ router) │──→ /api/v1/audio
IVR webhook ──────→│ │──→ /api/v1/books
 └──────────────┘
 │
 Format response
 per channel constraints
 │
 ┌──────────────┐
 │ Send reply │
 │ via channel │
 │ API │
 └──────────────┘
```

The Lambda function:
1. Receives the webhook (channel-agnostic intent parsing)
2. Queries the same `/api/v1/` endpoints that the web portal uses
3. Formats the response for the channel's constraints (160 chars for SMS, 1024 chars for WhatsApp, Markdown for Telegram)
4. Sends the reply via the channel's API

**No new content infrastructure.** Every passage served via messaging channels is the same passage served on the web — same database, same search, same citations.

### Data Model

```sql
-- Messaging channel subscriptions (daily wisdom opt-in)
CREATE TABLE messaging_subscriptions (
 id UUID PRIMARY KEY DEFAULT uuidv7(),
 channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'sms', 'telegram')),
 channel_id TEXT NOT NULL, -- phone number or Telegram user ID
 subscription_type TEXT NOT NULL DEFAULT 'daily' CHECK (subscription_type IN ('daily')),
 language TEXT NOT NULL DEFAULT 'en',
 status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'unsubscribed')),
 subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now,
 unsubscribed_at TIMESTAMPTZ,
 UNIQUE (channel, channel_id, subscription_type)
);

-- Messaging interaction log (anonymized, for cost tracking and channel health)
-- NO personal data. NO message content. Just aggregate counts.
CREATE TABLE messaging_metrics (
 id UUID PRIMARY KEY DEFAULT uuidv7(),
 channel TEXT NOT NULL,
 interaction_type TEXT NOT NULL CHECK (interaction_type IN ('search', 'daily', 'subscribe', 'unsubscribe', 'audio')),
 country_code TEXT, -- from phone number prefix (not stored with identity)
 language TEXT NOT NULL DEFAULT 'en',
 created_at TIMESTAMPTZ NOT NULL DEFAULT now
);

CREATE INDEX idx_messaging_subs_channel ON messaging_subscriptions(channel, status);
CREATE INDEX idx_messaging_metrics_daily ON messaging_metrics(created_at, channel);
```

**DELTA compliance:** The `messaging_metrics` table stores interaction counts, not conversations. No message content is stored. No behavioral profiling. Country code is derived from phone number prefix for aggregate reporting only (e.g., "42% of SMS queries come from India"), never stored with identity.

### Cost Projection

| Channel | Monthly Cost (est. at 1,000 daily interactions) | Notes |
|---------|------------------------------------------------|-------|
| WhatsApp | $150–300 | Per-conversation pricing. User-initiated conversations are cheapest. |
| SMS | $600–1,200 | Varies wildly by country. India is cheap; US is expensive. |
| Telegram | $0 | Free API. Only Lambda compute cost. |
| USSD | Requires telco negotiation | Typically $0.01–0.05/session in Africa. |
| IVR | $300–600 | Per-minute voice pricing. Short interactions. |

### Rationale

- **The mission demands it.** "Freely accessible worldwide" cannot mean "freely accessible to people with smartphones and data plans." 3+ billion people have basic phones. If the portal only serves web browsers, it is not fulfilling its mission.
- **API-first makes it cheap.** The `/api/v1/` endpoints already exist. Each messaging channel is a Lambda function that reformats API responses. The content infrastructure cost is zero — only the delivery channel costs money.
- **WhatsApp is the highest-leverage investment.** 2.7 billion users, dominant in exactly the regions where the teachings are most sought (India, Latin America, Africa). A WhatsApp bot costs less per month than a single Contentful developer seat.
- **SMS is the deepest-reach investment.** No smartphone needed, no internet needed, no data plan needed. A seeker in a village with a basic phone can text "PEACE" and receive Yogananda's words. This is the most mission-aligned feature the portal could build.
- **Channels compose.** Each new channel is incremental — same Lambda, same API, different formatter. Adding Telegram after WhatsApp is a weekend of work, not a quarter of work.

### Consequences

- STG-020: WhatsApp Business API integration (alongside daily email — shared infrastructure). Daily wisdom via WhatsApp. Search via WhatsApp.
- STG-020: RSS feeds (machine syndication, complementary channel)
- STG-024: SMS access gateway (requires cost evaluation per region, dedicated phone numbers)
- STG-024: Telegram bot (low cost, incremental after WhatsApp)
- Future: USSD (requires telco partnership, evaluate in STG-024)
- Future: IVR/Voice (evaluate after audio section exists, future stages)
- `messaging_subscriptions` and `messaging_metrics` tables added to schema
- Lambda function for channel routing (`/lambda/functions/messaging/`)
- WhatsApp Business account registration (requires Meta business verification)
- SMS provider evaluation: Twilio (global), Africa's Talking (Africa-optimized), Gupshup (India-optimized)
- Passage formatting service in `/lib/services/format.ts` — formats a passage for different channel constraints (160 chars, 1024 chars, Markdown, plain text)
- **Extends** FTR-048 (native share) — SMS sharing from the portal now includes passage text, not just a URL
- **Extends** STG-024 (SMS access gateway) — now part of a broader multi-channel strategy, not a standalone experiment
- **Replaces** the STG-024 "exploration" framing with a committed delivery plan starting at STG-020 (WhatsApp)


## Notes

Migrated from FTR-134 per FTR-084.
