---
ftr: 114
title: Neon Auth as Auth0 Alternative
state: proposed
domain: foundation
arc: 7+
governed-by: [FTR-094]
re-evaluate-at: Milestone 7a scoping
---

# FTR-114: Neon Auth as Auth0 Alternative

## Rationale

The portal architecture uses Auth0 for optional authentication (Milestone 7a+). Neon Auth (managed Better Auth) is now GA with 60K MAU free (Scale tier), branch-aware auth state, and native Row-Level Security integration. Branch-aware auth means PR preview deployments get isolated auth environments automatically — no Auth0 tenant management needed for previews. Evaluate when Milestone 7a scoping begins.

## Notes

- **Dependencies:** Milestone 7a (accounts). No auth until then.
- **Re-evaluate at:** Milestone 7a scoping
- **Decision required from:** Architecture
