---
ftr: 115
title: pg_cron for In-Database Scheduling
summary: "In-database cron for cache cleanup, embedding deprecation, stat snapshots, and daily passage rotation"
state: proposed
domain: foundation
governed-by: [PRI-10]
depends-on: [FTR-094, FTR-107]
re-evaluate-at: STG-006
---

# FTR-115: pg_cron for In-Database Scheduling

## Rationale

Several operations could benefit from in-database scheduling: stale suggestion cache cleanup, embedding deprecation (90-day window per FTR-024), `pg_stat_statements` periodic snapshots to a metrics table, daily passage rotation. Currently these require external cron (Lambda via EventBridge or Vercel Cron Jobs). `pg_cron` runs inside Postgres — simpler, no cold starts, no infrastructure. Trade-off: couples scheduling to the database; Lambda/Vercel cron is more portable. Evaluate when production compute is always-on.

## Notes

- **Dependencies:** Always-on production compute (production autosuspend ≥ 300s per FTR-094). `pg_cron` only fires when compute is active.
- **Re-evaluate at:** STG-006 (when Lambda infrastructure ships, FTR-107)
- **Decision required from:** Architecture
