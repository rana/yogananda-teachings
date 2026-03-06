---
ftr: 149
title: Retool vs. Portal Admin for Staff Dashboards
state: proposed
domain: editorial
arc: 3d
---

# FTR-149: Retool vs. Portal Admin for Staff Dashboards

## Rationale

**Type:** Enhancement
**Governing Refs:** FTR-060, FTR-032, FTR-082
**Dependencies:** Milestone 3b (editorial portal `/admin`), Milestone 3d (analytics dashboard)
**Scheduling Notes:** Evaluate at Milestone 3d scoping. The question is whether the analytics/reporting dashboard (Milestone 3d.4 "What Is Humanity Seeking?" admin view, standing operational metrics from FTR-082) should use Retool or be built into the portal's own `/admin` route group.

#### Context

Two staff-facing interfaces appear in the architecture:

1. **Portal `/admin`** (M3b-5a/b) — Auth0-protected Next.js route group for editorial workflows: theme tag review, daily passage curation, calendar management, queue health, ingestion QA. Built with the portal's calm design system.

2. **Retool** — Referenced in the production architecture diagram (DESIGN.md), Milestone 3d.4, and FTR-082 standing operational metrics. Implied use: analytics dashboards, search trend visualization, operational metrics.

The relationship between these is undefined. Do they coexist (editorial in `/admin`, analytics in Retool)? Does one subsume the other?

#### For Retool (separate analytics tool)

1. **Build vs. buy.** Analytics dashboards (charts, time series, geographic heatmaps) are what Retool excels at. Building equivalent visualizations in Next.js is feasible but slower.
2. **Iteration speed.** Staff can modify Retool dashboards without code deploys. Useful for evolving the "What Is Humanity Seeking?" views.
3. **SRF familiarity.** If SRF already uses Retool across other properties, operational handoff is easier.

#### Against Retool (build into portal admin)

1. **One fewer vendor.** Retool is a Tier 2 dependency. The 10-year horizon (FTR-004) favors fewer external dependencies.
2. **Design coherence.** Staff tools built in the portal's own design system maintain the calm technology aesthetic end-to-end.
3. **No additional authentication surface.** Everything in Auth0, one admin route group.
4. **Cost.** Retool has per-user pricing that may not be justified for 3–5 staff users.

#### Recommendation

Defer the decision. Build Milestone 3b editorial portal in `/admin`. At Milestone 3d scoping, evaluate whether the analytics visualization needs justify Retool or whether lightweight charting (e.g., Recharts) within `/admin` suffices. Remove Retool from the production architecture diagram until a decision is made — its presence implies an adopted choice that hasn't occurred.

**Re-evaluate At:** Milestone 3d scoping
**Decision Required From:** Architecture + SRF AE team (is Retool already in their stack?)
