---
ftr: 118
title: Cloudflare Re-evaluation for SRF Domain Routing
summary: "Re-evaluate Cloudflare if SRF routes portal domain through org-wide DNS; Vercel covers all needs currently"
state: proposed
domain: foundation
governed-by: [PRI-10]
depends-on: [FTR-097, FTR-106]
---

# FTR-118: Cloudflare Re-evaluation

## Rationale

The portal's production architecture previously included Cloudflare (CDN, WAF, rate limiting) as a portal-managed infrastructure dependency. Analysis (2026-02-26) determined that Vercel Pro provides equivalent capabilities natively — Firewall Rules, DDoS protection, bot detection, CDN — making Cloudflare a redundant layer that adds double-CDN complexity without unique value.

**Current posture:** Cloudflare removed from portal infrastructure. Rate limiting (FTR-097) redesigned to use Vercel Firewall at the edge layer. All documents updated.

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

## Notes

- **Dependencies:** Domain assignment for the portal. SRF decision on DNS routing.
- **Re-evaluate at:** When portal domain is assigned, or if SRF indicates Cloudflare is required for organizational DNS routing
- **Decision required from:** Architecture + SRF AE team (does SRF route all properties through Cloudflare?)
