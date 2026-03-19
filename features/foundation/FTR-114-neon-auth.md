---
ftr: 114
title: Neon Auth as Auth0 Alternative
summary: "Evaluate Neon Auth (managed Better Auth, 60K MAU free) as alternative to Auth0 for optional authentication"
state: proposed
domain: foundation
governed-by: [PRI-10]
depends-on: [FTR-094]
re-evaluate-at: STG-023
---

# FTR-114: Neon Auth as Auth0 Alternative

## Rationale

The portal architecture uses Auth0 for optional authentication (STG-023+). Neon Auth (managed Better Auth) is now GA with 60K MAU free (Scale tier), branch-aware auth state, and native Row-Level Security integration. Branch-aware auth means PR preview deployments get isolated auth environments automatically — no Auth0 tenant management needed for previews. Evaluate when STG-023 scoping begins.

## Notes

- **Dependencies:** STG-023 (accounts). No auth until then.
- **Re-evaluate at:** STG-023 scoping
- **Decision required from:** Architecture
