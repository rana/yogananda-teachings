---
ftr: 85
title: DELTA Privacy
summary: "Privacy architecture derived from DELTA ethics framework with multi-jurisdiction compliance"
state: implemented
domain: operations
governed-by: [PRI-08, PRI-09]
---

# FTR-085: DELTA Privacy

## Rationale

- **Status:** Accepted
- **Date:** 2026-02-21

### Context

The portal's privacy architecture derives from DELTA — the faith-based AI ethics framework — not from any single regulation. DELTA's principles (Dignity, Embodiment, Love, Transcendence, Agency) produced an architecture that collects almost no personal data by design. Regulatory compliance follows naturally.

The portal serves seekers worldwide. The majority by population will be in India (DPDPA), Brazil (LGPD), and other non-EU jurisdictions — not Europe. GDPR (EU/EEA), UK GDPR, CCPA/CPRA (California), APPI (Japan), and TTDSG/DSGVO (Germany) also apply. DELTA produces protections that substantively exceed all of these frameworks because the portal's minimal-data architecture was designed for human dignity, not compliance.

The remaining compliance work is primarily documentary (privacy policy, sub-processor inventory, retention policies, data subject rights documentation) rather than architectural. One architectural change is required: self-hosting Google Fonts to avoid IP transmission to Google servers (per LG München I, Case No. 3 O 17493/20).

### Decision

**1. Privacy policy and legal pages.** Add `/privacy` and `/legal` to the portal URL structure. The privacy policy must be human-readable (not legal boilerplate), written in the portal's contemplative voice, and translated alongside UI strings in Milestone 5b. Disclose: what data is collected, why, how long retained, who processes it, data subject rights, and sub-processor list. The privacy policy is a STG-004 deliverable alongside the accessibility foundation.

**2. Self-hosted fonts.** Replace Google Fonts CDN imports with self-hosted font files served from Vercel's CDN. Download Merriweather, Lora, and Open Sans WOFF2 files, bundle in the application. This eliminates IP transmission to Google servers and improves performance (no DNS lookup to `fonts.googleapis.com`). STG-004 deliverable.

**3. Cookie and localStorage disclosure.** The portal uses a language preference cookie (user-initiated) and `localStorage` for bookmarks, reader settings, study workspace, and first-visit detection. Under ePrivacy/TTDSG §25(2)(2), all serve user-initiated functionality and qualify as "strictly necessary" — no consent banner required. This determination is documented in the privacy policy. No cookie banner is added (cookie banners are antithetical to Calm Technology and unnecessary when all storage is functional).

**4. Email subscription: lawful basis, erasure, retention.**
- **Lawful basis:** Consent (GDPR Art. 6(1)(a)) via double opt-in. Documented on the subscription form and in the privacy policy.
- **Right to erasure:** The unsubscribe endpoint (`GET /api/v1/email/unsubscribe`) currently soft-deletes (sets `is_active = false`). Add a `DELETE /api/v1/email/subscriber` endpoint that performs hard deletion (removes the row entirely) to comply with GDPR Article 17. The unsubscribe confirmation page offers "Remove my data entirely" as an additional option.
- **Retention:** Unsubscribed email records (soft-deleted) are automatically purged 90 days after `unsubscribed_at`. Active subscriber data is retained for the duration of the subscription. Bounce/failure records are retained for 30 days for operational health monitoring.

**5. Seeker feedback PII mitigation.** The `/feedback` form includes a notice: "Please do not include personal information (name, email, location) in your feedback." Feedback entries are reviewed periodically for inadvertent PII, which is redacted by editorial staff. Feedback entries older than 2 years are eligible for archival aggregation (convert to anonymized statistics, delete raw text).

**6. Sub-processor inventory.** Maintain a documented inventory of all services that process data on the portal's behalf, with their roles, data touched, and geographic regions. Update when services are added or changed. Published as part of the privacy policy.

**7. `search_queries` table.** The table stores query text without user identifiers. Under GDPR recital 26, data that cannot identify a natural person is not personal data. The portal cannot match a data subject access request to their queries because no user identifiers are stored. This is documented in the privacy policy. The minimum aggregation threshold of 10 (FTR-032) prevents re-identification in the reporting layer.

**8. Rate limiting and IP processing.** Vercel processes IP addresses for Firewall/rate-limiting purposes at the edge. The portal itself does not store IP addresses. This is disclosed in the privacy policy: "Our hosting provider processes IP addresses for security purposes. We do not store IP addresses."

**9. YouTube privacy-enhanced embeds.** The facade pattern (thumbnail → click to load from `youtube-nocookie.com`) ensures no Google connection occurs until the user actively clicks play. This is compliant with strict German GDPR interpretation and documented.

**10. Record of Processing Activities (ROPA).** Maintain a ROPA (GDPR Article 30) documenting all processing activities. For the portal's minimal data profile, this is a short document. Created in STG-004, maintained as processing activities change.

**11. Milestone 7a age consideration.** When user accounts are introduced (Milestone 7a), the signup flow must include minimum age verification. GDPR: 16 in most of EU (member state variation down to 13). COPPA: 13 in US. The email subscription (Milestone 5a) should include a minimum age statement: "You must be 16 or older to subscribe."

### DELTA ↔ GDPR Crosswalk

| DELTA Principle | GDPR Alignment | Portal Implementation |
|-----------------|---------------|----------------------|
| **Dignity** — seekers are not data points | Art. 5(1)(a) — fairness; Art. 5(1)(c) — data minimization | No user identification, no behavioral profiling, no data monetization |
| **Embodiment** — encourage practice over screen time | Art. 5(1)(b) — purpose limitation | No engagement metrics, no retention optimization, no session tracking |
| **Love** — compassion in all interactions | Art. 12 — transparent, intelligible communication | Privacy policy in contemplative voice, not legal boilerplate |
| **Transcendence** — no gamification | Art. 5(1)(c) — data minimization | No achievement data, no streaks, no leaderboards to store |
| **Agency** — users control their experience | Art. 7 — conditions for consent; Art. 17 — right to erasure | Double opt-in, one-click unsubscribe, hard deletion option, no dark patterns |

### Sub-Processor Inventory

| Service | GDPR Role | Data Touched | Region | DPA Required |
|---------|-----------|-------------|--------|-------------|
| **Neon** | Processor | All server-side data (books, themes, search queries, subscribers) | US (default); EU read replica distributed | Yes |
| **Vercel** | Processor | Request logs (transient), edge headers, static assets | Global edges, US origin | Yes |
| **Vercel** (Firewall) | Processor | Request metadata, IP for rate limiting (transient) | Global (Vercel edge) | Yes |
| **Amplitude** | Processor | Anonymized events with country_code | US | Yes |
| **Sentry** | Processor | Error stack traces, request context | US | Yes |
| **New Relic** | Processor | Performance metrics, log aggregation | US | Yes (STG-009+) |
| **AWS Bedrock** | Processor | Search queries (transient, not stored by AWS) | `us-west-2` | Covered by AWS DPA |
| **Voyage AI** | Processor | Corpus text at embedding time (one-time; FTR-024) | US | Yes |
| **SendGrid** | Processor | Subscriber email addresses | US | Yes (Milestone 5a+) |
| **Auth0** | Processor | User accounts (if implemented) | US | Yes (Milestone 7a+) |
| **Contentful** | Processor | Editorial content (no personal data) | EU | Yes (STG-001+) |

EU-US data transfers rely on the EU-US Data Privacy Framework (DPF) where services are certified, with Standard Contractual Clauses (SCCs) as fallback. The sub-processor inventory is reviewed when services are added or changed, and published as part of the privacy policy.

### Rationale

- **DELTA exceeds GDPR.** The portal's ethical framework produces stronger privacy protections than any single regulation requires. Compliance is a natural consequence, not an afterthought. The strongest compliance demonstration is: "We designed for human dignity first, and compliance followed."
- **Architectural changes are minimal.** Self-hosted fonts is the only code change. Everything else is documentation.
- **No cookie banner.** All client-side storage serves user-initiated functionality (strictly necessary under ePrivacy/TTDSG). Adding a consent banner to a portal with no tracking, no profiling, and no advertising cookies would be Calm Technology theater — noise without substance.
- **Global coverage.** The portal's data minimization posture satisfies GDPR, UK GDPR, CCPA/CPRA, LGPD, DPDPA, and APPI simultaneously. Regional differences matter at the margins (minimum age for consent, cross-border transfer mechanisms), not at the architectural level.

### Consequences

- `/privacy` and `/legal` pages added to URL structure (STG-004)
- Self-hosted fonts replace Google Fonts CDN (STG-004)
- Privacy policy drafted in contemplative voice, translated alongside UI strings (Milestone 5b)
- `DELETE /api/v1/email/subscriber` endpoint for hard deletion (Milestone 5a)
- 90-day automatic purge of soft-deleted subscriber records (Milestone 5a)
- Feedback form gains PII notice (STG-007)
- ROPA document created (STG-004)
- Sub-processor inventory maintained in DESIGN.md
- Minimum age statement on email subscription form (Milestone 5a)
- Milestone 7a account signup includes age verification
- New open questions added to CONTEXT.md: data controller identity, minimum age policy, Indian DPDPA cross-border rules, Brazilian LGPD DPO requirement

## Notes

**Provenance:** FTR-085 → FTR-085
