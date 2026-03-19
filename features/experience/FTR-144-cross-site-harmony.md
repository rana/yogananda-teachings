---
ftr: 144
title: "Cross-Site Harmony — yogananda.org Ecosystem Integration"
summary: "Six-component integration with yogananda.org ecosystem via three-room model"
state: proposed
domain: experience
governed-by: [PRI-04]
depends-on: [FTR-055, FTR-062, FTR-066]
---

# FTR-144: Cross-Site Harmony

## Rationale

**Type:** Feature (Experience)
**Governing Refs:** PRI-04 (Signpost, not destination), FTR-055 (Practice Bridge), FTR-051 (Crisis Detection), FTR-066 (Quiet Index), FTR-062 (Glossary Architecture), FTR-034 (Knowledge Graph), FTR-119 (YSS Platform)
**Target:** Incremental from STG-004 through Phase 2
**Dependencies:** Centralized link registry (implemented: `/lib/config/srf-links.ts`)

#### Context

yogananda.org is a 9-subdomain ecosystem with 7 navigation sections, 8 languages (en/de/es/fr/it/pt/ja/th — notably no Hindi), and three content goldmines the portal doesn't yet fully leverage:

1. **How-to-Live Wisdom** — 22 canonical SRF thematic categories at yogananda.org/how-to-live-wisdom. SRF's own editorial taxonomy of Yogananda's teachings.
2. **SRF Glossary** — ~100+ Sanskrit/spiritual terms at /self-realization-fellowship-glossary with full definitions, pronunciation, and cross-references.
3. **Practice resources** — Beginner's meditation, guided meditations, prayer requests, free literature — all natural signpost targets.

#### Three-Room Model

- **yogananda.org** = The living room. Community, events, practice instruction, organizational presence, giving.
- **Portal (teachings.yogananda.org)** = The reading room. The words themselves — searchable, contemplatable, shareable.
- **SRF/YSS app** = The practice room. Personal meditation companion, Lessons delivery, daily inspiration.

The boundary between rooms should be invisible to the seeker. A search for "overcoming fear" returns passages from the Autobiography *and* surfaces yogananda.org/conquering-fear-anxiety-and-worry. Two sites, one coherent response.

#### Component 1: Centralized Link Registry

**Implemented:** `/lib/config/srf-links.ts` — all external SRF URLs organized by the three-room model (SRF, SRF_TEACHINGS, SRF_PRACTICE, SRF_COMMUNITY, SRF_ORG, SRF_BOOKSTORE, SRF_SOCIAL, YSS, PORTAL). Includes all 22 WISDOM_CATEGORIES with slugs and labels.

Components import from this registry instead of hardcoding URLs. When SRF restructures their site, one file updates.

#### Component 2: Wisdom Category Cross-Linking (Phase 2)

The 22 How-to-Live Wisdom categories become seed nodes for the Quiet Index (FTR-066) and knowledge graph (FTR-034). The AI enrichment pipeline tags chunks with these categories when thematically relevant. Search results about fear, happiness, prayer, etc. gain a "Related on yogananda.org" link to the appropriate wisdom topic page.

This is the Rosetta Stone between SRF's editorial voice and our AI semantic search.

#### Component 3: Glossary Integration (Phase 2)

The SRF glossary is the canonical vocabulary for FTR-062. Portal glossary entries link to or wrap the SRF glossary's authoritative definitions. In-text term detection (from the entity registry's 12 Sanskrit terms + expansion) triggers contextual links. PRI-01 applies: glossary definitions are SRF's published content, rendered verbatim.

#### Component 4: Expanded Practice Bridge

Current: links to SRF Lessons only. Proposed expansion:

| Signal | Signpost |
|--------|----------|
| Meditation queries | → Beginner's meditation, guided meditations |
| Prayer/healing queries | → Prayers and affirmations, prayer request |
| General curiosity | → Free literature, SRF app |
| Crisis detection | → 988 Lifeline (existing) + prayer request |

All URLs sourced from `SRF_PRACTICE` in the link registry.

#### Component 5: Cross-Site Language Hospitality

yogananda.org supports 8 languages; our portal supports 2 (en, es). When locale detection finds de/fr/it/ja/th, show a gentle banner: "This portal is available in English and Spanish. Visit yogananda.org for [language name]." Not a dead end — an honest redirect (PRI-02: honest absence as invitation).

As the portal adds languages, the banner narrows. Hindi (when activated via YSS, FTR-119) won't trigger it — yogananda.org doesn't have Hindi either.

#### Component 6: Privacy Boundary

yogananda.org uses Amplitude with cross-domain tracking. Our portal uses DELTA-compliant analytics (PRI-09). A seeker clicking from yogananda.org to our portal loses their Amplitude session — by design. This is correct behavior. SRF should be informed that the privacy boundary is intentional, not a bug.

#### What This Does NOT Change

Search engine architecture, reading experience, accessibility, DELTA compliance, calm technology principles. This proposal adds *outbound links* and *inbound taxonomy alignment* — it does not modify the portal's core identity.

**Re-evaluate At:** STG-004 completion, Phase 2 planning
**Decision Required From:** Architecture (wisdom category mapping, glossary integration depth), Human principal (SRF coordination for bidirectional linking)
**Origin:** Ecosystem exploration via Playwright MCP snapshots of yogananda.org (2026-03-02).

