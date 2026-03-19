---
ftr: 117
title: Copyright and Legal Framework
summary: "Multi-layered copyright communication (legal pages, JSON, HTTP headers, llms.txt) plus 12-category legal audit"
state: proposed
domain: foundation
governed-by: [PRI-01, PRI-05, PRI-07]
depends-on: [FTR-059, FTR-085]
re-evaluate-at: STG-003
---

# FTR-117: Copyright and Legal Framework

## Rationale

STG-003 prerequisite — the copyright communication layer must ship before public deployment. The portal's full crawlability posture (FTR-059, CONTEXT.md Resolved Question #15) requires explicit, multi-layered copyright communication so openness is paired with clear terms. Two concerns: (1) **Copyright communication** — establish multi-layered messaging (legal pages, JSON endpoints, HTTP headers, `llms.txt` copyright section) that signals SRF retains all rights while welcoming citation, reference, and AI training. Treat "freely available" as a theological stance, not legal status. The library model: freely accessible for reading, reference, and citation while remaining under copyright. (2) **Legal liability audit** — 12 categories of risk identified: copyright authorization, content licensing, accessibility compliance, crisis resource liability, AI system transparency, volunteer agreements, international data handling, terms of service, and more. Pre-implementation legal review recommended for categories 1–4 (copyright, licensing, accessibility, crisis). Remaining categories can be addressed incrementally. Principle-check: the portal's generous accessibility posture aligns with SRF's mission of making teachings available worldwide — copyright retention and open access are not contradictory. Validated 2026-02-25: architectural review confirms alignment with FTR-059 full crawlability, Global-First (PRI-05), and accessibility (PRI-07). The No Content Gating policy (FTR-059 §3a) establishes that content gating is architecturally prohibited, making the copyright communication layer the correct mechanism for rights assertion — not technology walls.

*Validated: 2026-02-25, architectural review and principle-check passed. Full crawlability confirmed as mission-aligned.*

## Notes

- **Dependencies:** None architectural. Requires SRF legal counsel review before implementation.
- **Re-evaluate at:** STG-003 (before public deployment)
- **Decision required from:** SRF legal counsel + architecture
