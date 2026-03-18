---
ftr: 98
title: SRF Corpus MCP
summary: "Three-tier corpus access layer for AI consumers including search, editorial, and external agents"
state: deferred
domain: operations
governed-by: [PRI-12]
depends-on: [FTR-083]
re-evaluate-at: M3d boundary
---

# FTR-098: SRF Corpus MCP

## Rationale

**Status:** Validated — Awaiting Scheduling (FTR-098 body suspended 2026-03-01)
**Type:** Feature
**Governing Refs:** FTR-098 (suspended), FTR-083, FTR-083, FTR-015
**Dependencies:** Tier 1 requires `/lib/services/` operational. Tier 2 requires Milestone 3b editorial portal. Tier 3 requires corpus complete (Milestone 3d+).
**Scheduling Notes:** Descheduled 2026-02-24 to focus on core delivery. Three tiers: Development (Claude Code corpus search), Internal (editorial AI workflows), External (third-party AI assistants with fidelity metadata). Service layer wrapping — no new business logic. Full architecture preserved in `design/search/FTR-083-mcp-server-strategy.md`.
**Re-evaluate At:** M3d boundary
**Decision Required From:** Architecture (self-assessment at milestone boundary)

## Notes

**Provenance:** FTR-098 → FTR-098

Absorbs suspended FTR-098 (Three-Tier Corpus Access Layer). The ADR body was deleted from DECISIONS-operations.md on 2026-03-01; the full architecture is preserved in FTR-083.
