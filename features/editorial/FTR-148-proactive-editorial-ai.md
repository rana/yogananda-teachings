---
ftr: 148
title: Proactive Editorial AI Agent
summary: "Push-based editorial workflow where AI generates proposals delivered via email/Slack with one-click approval"
state: proposed
domain: editorial
governed-by: [PRI-01, PRI-12]
depends-on: [FTR-060, FTR-086, FTR-107]
---

# FTR-148: Proactive Editorial AI Agent

## Rationale

**Type:** Enhancement
**Governing Refs:** FTR-060, FTR-005, FTR-086, FTR-086
**Dependencies:** Editorial portal (STG-007), outbound webhook infrastructure (FTR-086), Lambda infrastructure (FTR-107).
**Scheduling Notes:** Transforms the STG-007 editorial workflow from pull-based (editors visit queues) to push-based (AI generates proposals delivered via email/Teams/Slack with one-click approval). Claude autonomously generates theme tag suggestions, daily passage selections, editorial thread drafts, and calendar content recommendations. Each suggestion includes context and rationale. Maintains the sacred human review gate (FTR-005) — AI proposes, humans approve. Reduces editorial cognitive load while preserving fidelity controls. Requires Lambda-based agent service and multi-channel delivery infrastructure.
**Re-evaluate At:** STG-007 (when editorial portal ships)
**Decision Required From:** Architecture + editorial workflow review
**Source Explorations:** `proactive-ai-agent-further-ai-automation-of-editorial.md`
**Note:** Subsumed by FTR-099 (Internal Autonomous Agent Archetypes) as the "Editorial" trust profile. If FTR-099 is adopted, this proposal merges into it rather than graduating independently.
