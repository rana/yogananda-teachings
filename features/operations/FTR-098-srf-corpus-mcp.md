---
ftr: 98
title: SRF Corpus MCP
summary: "Three-tier corpus access layer for AI consumers including search, editorial, and external agents"
state: deferred
domain: operations
governed-by: [PRI-12]
depends-on: [FTR-083]
re-evaluate-at: STG-009
---

# FTR-098: SRF Corpus MCP

## Rationale

Three-tier AI consumer access to the SRF corpus: Development (Claude Code corpus search), Internal (editorial AI workflows), External (third-party AI assistants with fidelity metadata). Service layer wrapping over `/lib/services/` — no new business logic. Full architecture in FTR-083.

Deferred 2026-02-24 to focus on core delivery. Re-evaluate at STG-009 boundary.
