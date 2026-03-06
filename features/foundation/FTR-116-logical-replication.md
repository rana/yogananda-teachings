# FTR-116: Logical Replication for Analytics CDC

**State:** Proposed
**Domain:** foundation
**Arc:** 3+
**Governed by:** FTR-094, FTR-082, FTR-085

## Rationale

Neon supports outbound logical replication to analytics platforms (ClickHouse via PeerDB, Kafka, Snowflake, Fivetran, etc.). If SRF wants analytics beyond DELTA-compliant Amplitude events — e.g., content engagement patterns, search quality trends over time, corpus health metrics — logical replication provides real-time CDC without application-layer ETL. Must remain DELTA-compliant: replicate content and aggregate metrics only, never user-identifying data.

## Notes

- **Dependencies:** Scale tier (already selected). Analytics destination (ClickHouse, Snowflake, or similar).
- **Re-evaluate at:** Arc 3 boundary (when editorial operations generate analytics needs)
- **Decision required from:** Architecture + DELTA compliance review
