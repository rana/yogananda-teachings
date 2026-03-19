---
ftr: 126
title: Word-Level Graph Navigation
summary: "PMI-weighted word co-occurrence graph enabling linguistic traversal of Yogananda's vocabulary patterns"
state: proposed
domain: search
governed-by: [PRI-03, PRI-10]
depends-on: [FTR-034, FTR-033]
---

# FTR-126: Word-Level Graph Navigation

## Rationale

**Dependencies:** Knowledge graph infrastructure (FTR-034) and entity registry (FTR-033) operational. Concept/Word Graph (FTR-034) is the parent design section.

Enhances FTR-034 with fine-grained word-level graph enabling linguistic exploration of Yogananda's vocabulary through co-occurrence, synonymy, and contextual relationships. Word nodes with PMI-weighted co-occurrence edges let seekers traverse from "magnetism" to "attunement" to "vibration" through the corpus's actual usage patterns. Complements the entity-focused knowledge graph (FTR-034) with a linguistic lens. Builds on existing Postgres-native graph infrastructure (FTR-034) — no additional database technology needed.

**Re-evaluate At:** STG-008 (when cross-book intelligence ships)

**Decision Required From:** Architecture

**Source Explorations:** `word-graph-similar-to-knowledge-graph-graph-traversal-of.md`

