# FTR-151: AWS SES

> **State:** Proposed
> **Domain:** operations
> **Arc:** Arc 5+
> **Governed by:** FTR-154, FTR-085, FTR-106
> **Replaces:** FTR-151

## Proposal

**Status:** Proposed
**Type:** Enhancement
**Governing Refs:** FTR-154, FTR-085, FTR-106
**Dependencies:** Milestone 5a (daily email feature). No email infrastructure needed before then.
**Scheduling Notes:** Evaluate at Milestone 5a scoping. The portal currently specifies SendGrid (aligned with SRF Tech Stack Brief § Specialized Services). This proposal evaluates AWS SES as an alternative that may better serve the portal's specific constraints.

#### Context

FTR-154 specifies the Daily Email feature (Milestone 5a): one verbatim passage from Yogananda's published works, delivered daily to subscribers. The portal's email use case is narrow — a single passage with author/book/chapter citation, one link to the portal reading experience, no marketing automation, no templates, no campaigns. SRF's standard is SendGrid (Tech Stack Brief § Specialized Services: "Transactional email delivery, email templates designed in Stripo").

The question: does the portal's minimal, DELTA-constrained email use case justify staying with SendGrid, or does AWS SES serve it better?

#### For SES (the case for divergence)

1. **Already in the AWS footprint.** The portal uses S3, Bedrock, Lambda, EventBridge — all AWS. SES adds no new vendor, no new account, no new billing relationship. Platform MCP manages it alongside everything else (FTR-106).
2. **Cost.** SES: $0.10/1,000 emails, no monthly minimum. SendGrid free tier: 100 emails/day; paid starts at $19.95/month for 50K emails. At portal scale (estimated 5K–50K daily subscribers by Arc 5), SES costs $0.50–$5/day. SendGrid costs $19.95+/month.
3. **DELTA simplicity.** SES has no built-in engagement tracking by default — open/click tracking must be explicitly enabled via configuration sets. SendGrid enables open/click tracking by default and requires active configuration to disable it (Tracking Settings API or per-message headers). For a DELTA-compliant system that must never track engagement, the "off by default" posture is safer.
4. **No feature waste.** SendGrid's value is in templates (Stripo), A/B testing, marketing campaigns, contact management, engagement analytics. The portal uses none of these. The daily email is a Lambda function that renders one HTML passage and calls an email API.
5. **AWS-native.** `aws_ses_domain_identity`, `aws_ses_configuration_set` — first-class AWS resources manageable via Platform MCP. No separate provider or third-party integration needed.
6. **OIDC authentication.** Lambda already authenticates to AWS via OIDC (FTR-106). SES requires no additional API key — the Lambda execution role gets `ses:SendEmail` permission. SendGrid requires a separate API key stored as a secret.

#### Against SES (the case for alignment)

1. **SRF standard.** SendGrid is the established email provider (Tech Stack Brief § Specialized Services). SRF's AE team has SendGrid expertise, existing accounts, established deliverability reputation, and operational procedures. Diverging adds another "why is the portal different?" conversation.
2. **Deliverability bootstrapping.** SES requires warming a new sending domain — starting at low volume and gradually increasing over weeks. SendGrid's shared IP pools and established reputation provide good deliverability immediately. A new SES domain sending 50K emails on day one risks spam classification.
3. **Bounce/complaint handling.** SendGrid has mature bounce management, suppression lists, and automatic unsubscribe handling built in. SES requires building these with SNS topics, Lambda handlers, and a suppression list in the database — more code to write and maintain.
4. **SendGrid's free tier may suffice.** 100 emails/day (free) covers development and early testing. The Essentials plan ($19.95/month for 50K) covers the portal's likely volume through Arc 5. The cost difference is real but small relative to total infrastructure spend.
5. **Operational handoff.** When the portal transitions to SRF operations (Arc 6+), SendGrid means the operations team is on familiar ground. SES means training on a different email system — even if it's simpler.
6. **Avoid Redundancy principle.** Tech Stack Brief § Guiding Principle #7: "Where a standard has already been established in SRF, utilize that rather than introducing something new which overlaps."

#### Through (the synthesis)

The portal's email use case is genuinely different from SRF's typical transactional email: no templates, no marketing, no engagement tracking, one message type. This is the same pattern as DynamoDB → PostgreSQL (FTR-104) and Serverless Framework → Platform MCP (FTR-107) — the SRF standard serves the general case well, but the portal's specific constraints favor a different choice.

However, the cost savings are modest ($15–20/month), and the deliverability bootstrapping and bounce handling costs (developer time) may exceed the savings. The strongest SES argument is DELTA purity (tracking off by default); the strongest SendGrid argument is operational alignment.

**Recommendation:** Start with SendGrid (aligned, zero bootstrapping, immediate deliverability). If Milestone 5a implementation reveals that DELTA-compliant SendGrid configuration is fragile — if tracking keeps re-enabling after updates, or if the suppression of engagement analytics requires ongoing vigilance — revisit SES as a cleaner foundation. The migration path is straightforward: swap the API call in one Lambda function.

**Re-evaluate At:** Milestone 5a scoping (daily email implementation)
**Decision Required From:** Architecture + SRF AE team input (do they prefer portal on their SendGrid account or a separate email system?)

## Notes

**Provenance:** FTR-151 → FTR-151
