---
ftr: 116
title: Logical Replication for Analytics CDC
summary: "Neon outbound logical replication to analytics platforms for DELTA-compliant content and aggregate metrics"
state: proposed
domain: foundation
governed-by: [PRI-09, PRI-10]
depends-on: [FTR-094, FTR-082, FTR-085]
re-evaluate-at: STG-007
---

# FTR-116: Logical Replication for Analytics CDC

## Rationale

Neon supports outbound logical replication to analytics platforms (ClickHouse via PeerDB, Kafka, Snowflake, Fivetran, etc.). If SRF wants analytics beyond DELTA-compliant Amplitude events — e.g., content engagement patterns, search quality trends over time, corpus health metrics — logical replication provides real-time CDC without application-layer ETL. Must remain DELTA-compliant: replicate content and aggregate metrics only, never user-identifying data.

## Notes

- **Dependencies:** Scale tier (already selected). Analytics destination (ClickHouse, Snowflake, or similar).
- **Re-evaluate at:** STG-009 boundary (when editorial operations generate analytics needs)
- **Decision required from:** Architecture + DELTA compliance review
