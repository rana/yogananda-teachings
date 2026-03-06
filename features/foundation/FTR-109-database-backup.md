# FTR-109: Database Backup and Recovery Strategy

**State:** Approved
**Domain:** foundation
**Arc:** 1+
**Governed by:** PRI-10

## Rationale

### Context

The portal's canonical content — book text, embeddings, theme tags, chunk relations, daily passages, calendar events — lives in Neon PostgreSQL. Neon provides three native recovery mechanisms on Scale tier (FTR-094):

1. **Point-in-time recovery (PITR)** — restore to any moment within a 30-day window
2. **Snapshots** — manual and scheduled capture of branch state with one-step restore
3. **Time Travel Queries** — read-only queries against any historical point within the PITR window (via ephemeral computes)

However, native Neon recovery doesn't protect against:
- Neon service-level incidents beyond their disaster recovery capability
- A future vendor migration (if SRF moves away from Neon for any reason)
- The need for a portable backup format (standard `pg_dump`) that any PostgreSQL host can restore

The 10-year architecture horizon (FTR-004) demands that the data survive any single vendor relationship. Neon may not exist in 10 years. The data must.

### Decision

Adopt a **three-layer recovery strategy**: Neon-native PITR + Neon Snapshots + nightly `pg_dump` to S3.

#### Layer 1: Neon PITR (30-day window)

Available immediately on Scale tier. Restore to any moment within 30 days — covers accidental data corruption, bad migrations, and operational mistakes. Uses Neon's built-in WAL-based recovery.

- **Restore scope:** Entire branch (all databases)
- **Restore method:** Timestamp or LSN (Log Sequence Number)
- **Pre-restore safety:** Neon automatically creates a backup branch (`{branch}_old_{timestamp}`)
- **Time Travel Queries:** Before committing to a restore, run read-only queries against historical state to verify the target recovery point is correct. Uses ephemeral 0.5 CU computes that auto-delete after 30s idle.

#### Layer 2: Neon Snapshots (API-managed, automated schedule)

Configure automated snapshots on the production branch via **Neon Snapshot API** during Milestone M1a-2 project setup. The Snapshot API supports full CRUD (create, list, restore, update, delete) and backup schedule configuration — no Console interaction needed. Claude configures the schedule via Neon MCP or API call during bootstrap.

- **Daily snapshot** at 03:00 UTC (before nightly pg_dump for redundancy)
- **Weekly snapshot** on Sundays
- **Monthly snapshot** on the 1st
- **Retention:** Up to 10 snapshots (Scale tier limit). Lifecycle: keep 7 daily + 2 weekly + 1 monthly.
- **Restore:** One-step restore from any snapshot via API. Faster than PITR for known-good checkpoints.
- **Pre-migration snapshots:** CI workflow creates a snapshot before applying any migration PR. This provides an instant rollback point without timestamp arithmetic. See FTR-095 § CI/CD Pipeline.
- **On-demand snapshots:** Claude creates snapshots via MCP before risky operations (re-ingestion, embedding model migration, bulk data changes). Part of the Operations layer (FTR-095 § Three-Layer Neon Management Model).

#### Layer 3: pg_dump to S3 (vendor-independent)

Nightly `pg_dump` to S3 provides a portable backup that can restore to any PostgreSQL host — not just Neon. This is the vendor-independence layer.

- **Lambda function** (using FTR-107 infrastructure) runs nightly via EventBridge cron
- `pg_dump --format=custom` (most flexible restore format)
- Uploaded to an encrypted S3 bucket (`aws:kms` server-side encryption)
- **Retention:** 90 days of daily backups, plus the 1st of each month retained for 1 year
- **Size estimate:** Arc 1 database (~2,000 chunks + embeddings) ≈ 50–100MB compressed. Full library (~50,000 chunks) ≈ 1–2GB compressed. S3 cost: < $1/month.

#### Platform MCP management

S3 backup bucket, Lambda function, EventBridge rule, and IAM role are provisioned and managed via Platform MCP.

#### Restore decision tree

| Scenario | Use | Why |
|----------|-----|-----|
| Bad migration noticed within minutes | PITR (timestamp) | Fastest; restore to pre-migration moment |
| Data corruption noticed within hours | Time Travel Query → PITR | Verify target point first, then restore |
| Need to inspect historical state | Time Travel Query | Read-only, no restore needed |
| Known-good checkpoint needed | Snapshot restore | One-step, no timestamp arithmetic |
| Neon is down | S3 pg_dump → any PostgreSQL host | Vendor-independent recovery |
| Vendor migration | S3 pg_dump → new provider | Portable format |

#### Restore procedure (documented in operational playbook)

**From PITR:**
1. Use Time Travel Query to verify the target recovery point
2. Restore production branch to target timestamp via Neon Console or CLI
3. Neon auto-creates a backup branch; verify the restore
4. If wrong: restore again from the backup branch

**From S3 backup:**
1. Download backup: `aws s3 cp s3://srf-portal-backups/{date}.dump ./`
2. Create a Neon branch for restore testing
3. `pg_restore --dbname=... {date}.dump`
4. Verify content integrity
5. If verified: promote restored branch to production (or merge specific tables)

### Rationale

- **Defense in depth.** Three independent recovery mechanisms. PITR for speed, snapshots for checkpoints, pg_dump for portability.
- **30-day PITR window (Scale tier).** Covers the realistic detection window for data corruption. A bad migration or ingestion error has 30 days to be noticed before recovery becomes expensive.
- **Vendor independence.** S3 backups exist outside Neon's infrastructure. The data survives a Neon outage or a future vendor migration.
- **Negligible cost.** S3 Standard-IA with lifecycle rules: < $1/month. Neon Snapshots included in Scale tier.
- **Operational confidence.** Multiple recovery options make risky operations (embedding model migration per FTR-024, major re-ingestion) safer.

### Consequences

- PITR and Time Travel Queries available from Milestone 1a (Scale tier). Time Travel accepted as development tool (FTR-094).
- Snapshot schedule configured during Milestone M1a-2 Neon project setup via Neon Snapshot API (not Console)
- Pre-migration snapshots created by CI workflow before migration PRs
- On-demand snapshots created by Claude via MCP before risky operations
- Backup infrastructure (S3 bucket, Lambda, EventBridge) provisioned in Milestone 2a via Platform MCP
- Lambda function for nightly pg_dump added when Lambda infrastructure from FTR-107 is first deployed
- S3 bucket created and managed by Platform MCP
- Restore procedure documented in operational playbook
- Quarterly restore drill: test restore from a random backup to a Neon branch, verify content integrity
- **Extends FTR-106** (Platform MCP), **FTR-004** (10-year architecture), and **FTR-094** (Neon platform governance)
