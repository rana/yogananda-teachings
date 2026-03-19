---
ftr: 99
title: Agent Archetypes
summary: "Nine modes of a single Corpus Librarian serving monastics, editors, and operational systems"
state: proposed
domain: operations
governed-by: [PRI-01, PRI-12]
depends-on: [FTR-098]
re-evaluate-at: STG-007
---

# FTR-099: Agent Archetypes

## Rationale

**Status:** Proposed
**Type:** Feature
**Governing Refs:** FTR-098, FTR-005, FTR-060, FTR-072, FTR-083, FTR-069, FTR-056
**Dependencies:** Tier 2 MCP server (FTR-098) operational. `/lib/services/` layer complete for target content types. Editorial review infrastructure (STG-007) for agent-proposed content.
**Scheduling Notes:** The MCP Corpus server can serve autonomous AI agents working on behalf of SRF's internal stakeholders: monastics, correspondence staff, magazine editors, center leaders, and operational systems. Nine agent archetypes identified: Devotee Correspondence, Magazine Editorial, Content Integrity Watchdog, Translation QA, Center Leader Support, Seeker Trend Intelligence, Social Media Calendar, Knowledge Graph Curator, and Corpus Onboarding.

**Core idea.** One Librarian, many modes. The 9 archetypes are *modes* of a single Corpus Librarian (FTR-077) with role-scoped access — not 9 separate systems. Architecturally: one service layer with role-based API scoping. Four trust profiles: Research (read-only), Editorial (proposes to review queues), Operational (integrity monitoring, alert/quarantine), Intelligence (aggregated analytics, proposes structural changes).

**Governing principle.** Every agent is a librarian — finds, verifies, and surfaces the Master's words. No agent generates, interprets, or teaches (FTR-001, FTR-005). AI proposes, humans approve for all editorial agents (FTR-072). Every agent respects the technique boundary (PRI-04, FTR-055).

**Subsumes FTR-148** (Proactive Editorial AI Agent) as the "Editorial" trust profile.

*Implementation detail (quarantine model, event taxonomy, agent persona, cross-property potential, MCP tool mappings) preserved in git history and would move to FTR specification sections on adoption.*

**Re-evaluate At:** Phase 3 boundary (when Tier 2 MCP scheduling is re-evaluated per FTR-098)
**Decision Required From:** Architecture + SRF stakeholder input on organizational needs

