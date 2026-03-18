---
ftr: 145
title: Visual Design Language System
summary: "Standalone design token repository with foundations, semantics, and patterns for SRF and YSS"
state: proposed
domain: experience
governed-by: [PRI-03, PRI-07, PRI-08, PRI-10, PRI-12]
depends-on: [FTR-042, FTR-131]
---

# FTR-145: Visual Design Language System

## Rationale

**Type:** Feature (Platform)
**Governing Refs:** PRI-03 (Honoring the Spirit), PRI-07 (Accessibility), PRI-08 (Calm Technology), PRI-10 (10-year horizon), PRI-12 (AI-Native Development), FTR-042 (Design System), FTR-131 (Hindi Typography), FTR-119 (YSS Platform Partnership), FTR-144 (Cross-Site Harmony)
**Target:** Immediate (independent of portal milestones)
**Dependencies:** None — standalone repository, portal is first consumer but not a dependency.
**Repository:** `rana/yogananda-design` (GitHub, created 2026-03-02)

#### Context

The portal has a complete, production-ready design token system embedded in `app/globals.css`, `lib/config.ts`, and `lib/services/preferences.ts`. Six color themes, circadian color temperature, self-hosted fonts, Hindi typography infrastructure, behavioral timings. But these are framework-coupled CSS custom properties — not extractable, not machine-queryable, not consumable by non-portal projects.

When AI (the primary builder, PRI-12) designs a component, it cross-references 6+ files and 4+ ADRs to synthesize the correct visual treatment. A structured, AI-readable design language specification makes this knowledge queryable from a single source.

#### What It Is

A standalone repository (`yogananda-design`) containing the canonical visual design language for the Yogananda digital ecosystem. Three layers:

1. **Foundations** (`*.tokens.json`) — W3C Design Tokens Community Group (DTCG) format. Quantifiable tokens: colors, typography, spacing, duration, shadows. Organization-specific files (SRF, YSS) plus shared foundations. Every token has `$description` and `$extensions` with principle reference, rationale, and evaluation trigger.

2. **Semantics** (`*.language.json`) — Custom format. Design language rules: emotional registers (sacred/reverential/instructional/functional/ambient), attention gradient (gold opacity hierarchy), calm technology constraints (forbidden + required patterns), accessibility requirements, typographic conventions per script.

3. **Patterns** (`*.pattern.json`) — Custom format. Composition recipes: pre-composed molecules (passage card, search result, chapter transition). Named combinations of Layer 1 tokens governed by Layer 2 semantics. Implementation-agnostic.

Plus: self-hosted font files, lotus SVG motif, font manifest, brand image guidelines.

**Lotus SVG as structural break.** The gold lotus motif serves a cognitive function beyond decoration — it acts as a visual threshold between major philosophical sections within chapters, functioning identically to a rest in musical notation (deep-research-sacred-reading-experience-report.md § 4). The SVG includes a `<title>` element ("Section break") for screen readers, ensuring blind readers experience the same structural pause as sighted readers. In illuminated manuscript tradition, ornamentation signals to the brain that the upcoming text requires a different posture of attention. The lotus break replaces the generic `<hr>` scene break in chapter text where editorial tagging identifies a major thematic shift (distinct from minor scene breaks, which use the three-dot ornament per FTR-041 § 7).

#### Two Organizations, Shared Foundations

SRF and YSS are distinct visual expressions of shared design foundations:
- **SRF** — "Entering a library." Navy (#1a2744), Gold (#dcbd23), Cream (#FAF8F5). Merriweather/Lora/Open Sans. Contemplative cool, scholarly warmth.
- **YSS** — "Entering an ashram." Terracotta (#bb4f27), Clay (#f2e8de). Noto Serif Devanagari/Raleway. Devotional warmth, Indian earth tones. **Scaffold** — awaiting YSS editorial input.

Shared: calm technology constraints, accessibility minimums, behavioral timings, emotional registers, content-to-treatment mappings.

#### Innovation: What No Existing Design System Has

1. **Emotional registers** — content types map to reverence levels. Guru's words get different treatment than navigation chrome.
2. **Attention gradient** — a calibrated hierarchy from interactive (gold at 1.0) to subliminal (gold at 0.06) to texture (noise at 0.03).
3. **Constraint-first architecture** — the forbidden list (calm technology rules) is as structured and machine-readable as the color palette.
4. **AI-first authorship** — designed for machine consumption. `$description` fields are the primary documentation. `$extensions` embed rationale without requiring ADR cross-reference.

#### Consumers

- **yogananda-teachings** (portal) — SRF design language. Primary consumer. CI lint validates portal CSS against design tokens.
- **yogananda-platform** — Infrastructure dashboard. Lighter brand touch.
- **Future YSS surface** (FTR-119) — YSS design language. Second consumer when activated.
- **PDF generation** (FTR-030) — Shared tokens for consistent output.
- **Style Dictionary / Tokens Studio** — Generate CSS, SCSS, Android XML, Swift from same tokens.
- **Figma** (FTR-153, when activated) — DTCG format is Figma Variables-compatible.

#### What This Does NOT Change

Portal implementation, search architecture, reading experience behavior, DELTA compliance, content pipeline. The design repo is a canonical reference that the portal validates against — not a runtime dependency. The portal continues to own its CSS; the design repo owns the design *intent*.

#### MCP Server (Future)

Not needed now — token files are small enough for any context window. Becomes valuable when the system needs computation: contrast validation, theme+circadian+locale resolution, composition guidance. Architect for it (structured data, standard format); build when 2+ active consumers exist.

**Re-evaluate At:** FTR-119 activation (YSS surface), Phase 2 planning
**Decision Required From:** Architecture (CI lint integration, direction of derivation), Human principal (YSS visual identity approval)
**Origin:** Design exploration 2026-03-02


## Notes

Migrated from FTR-145 per FTR-084.
