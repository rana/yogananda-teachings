---
ftr: 79
title: "Editorial Page Compositor — Data-Driven Layout Curation"
summary: "Constrained layout engine letting editors configure which content lenses appear on public pages without code deploys"
state: proposed
domain: editorial
governed-by: [PRI-03, PRI-12]
depends-on: [FTR-060, FTR-039, FTR-065]
---

# FTR-079: Editorial Page Compositor

## Rationale

**Type:** Feature
**Governing Refs:** FTR-039 (Recognition-First IA), FTR-060 (Editorial Portal), FTR-119 (YSS Branding), FTR-082 (DELTA Framework), FTR-065 (Calendar-Aware Surfacing)
**Dependencies:** Admin portal foundation (STG-007). Component library maturity — the compositor composes from developer-built lenses, so enough lenses must exist to make composition valuable. Minimum viable: Today's Wisdom, search prompt, featured themes (3 components).
**Target:** STG-007 (foundation) or STG-020+ (full scheduling + brand variants)

**The gap.** The portal's homepage has 10+ content organization models (themes, threads, calendar, places, guide, browse, Wanderer's Path, Four Doors, daily passages, magazine) and a well-specified editorial review portal (FTR-060). Editors can curate *within* each content slot (pick today's passage, review theme tags). But no mechanism exists for editors to decide *which content lenses appear, in what order, with what emphasis* — that requires a code deployment. The compositor closes this gap.

**What it is.** A constrained layout engine where editorial judgment configures the portal's public surfaces without code changes:

- **Component library** is fixed — developers build the lenses (Today's Wisdom, Search Prompt, Wanderer's Path, Four Doors, Featured Themes, Calendar Event, etc.)
- **Composition** is editorial — which lenses appear, what order, what per-component parameters, what scheduling
- **Rendering** is standard Next.js Server Components reading config from Neon

**What it is not:**
- Not a generic page builder. Components are developer-built. Editors compose, they don't create.
- Not Contentful's responsibility. Contentful manages content (book text, theme descriptions). The compositor manages layout and prominence — which content surfaces where on which pages.
- Not low-code in the Retool/Webflow sense. A constrained editorial surface — closer to WordPress block ordering than to drag-and-drop page building.

**Three capabilities unlocked:**

1. **Editorial homepage governance.** Content editors configure which themes are featured, whether the Wanderer's Path is prominent during retreat season, whether calendar events push the hero position. Editorial judgment expressed through data, not code deployments.

2. **Brand-variant homepages (YSS and beyond).** Instead of code-level `if (locale === 'hi') { showYSSBranding() }`, each brand variant gets its own page composition. YSS homepage can lead with a different aesthetic, different featured themes, different entry mode ordering — same component library, different editorial surface. The codebase stays unified; the brand experience diverges at the data layer. Extends to any future variant (youth portal, meditation-focused entry point).

3. **Calendar/seasonal scheduling.** FTR-065 specifies calendar-aware surfacing but currently only as "homepage adjusts when today matches a calendar event." The compositor makes this explicit: editors schedule homepage configurations in advance. Mahasamadhi week gets a contemplative layout. World Convocation gets an event-forward layout. No deploys required.

**Minimum viable data model:**

```sql
-- Page compositions — an editorial arrangement of content lenses
CREATE TABLE page_compositions (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  slug TEXT NOT NULL,              -- e.g., "homepage-srf-en"
  brand TEXT NOT NULL DEFAULT 'srf', -- 'srf' | 'yss'
  locale TEXT NOT NULL DEFAULT 'en',
  active_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  active_until TIMESTAMPTZ,        -- NULL = no expiry (default composition)
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_by TEXT,                 -- editor identity (STG-023+: Auth0 sub)
  reviewed_by TEXT,                -- theological reviewer (if required)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Composition slots — ordered content lenses within a composition
CREATE TABLE composition_slots (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  composition_id UUID NOT NULL REFERENCES page_compositions(id),
  position INTEGER NOT NULL,       -- display order
  component_type TEXT NOT NULL,    -- 'todays_wisdom' | 'search_prompt' | 'wanderer' | 'four_doors' | 'featured_themes' | 'calendar_event' | ...
  config JSONB NOT NULL DEFAULT '{}', -- per-component parameters
  is_visible BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(composition_id, position)
);
```

Homepage renderer: `SELECT * FROM composition_slots WHERE composition_id = (best match for brand + locale + current date) ORDER BY position`. Server Components render each slot's `component_type` with its `config`. Cache-friendly (revalidate on composition change), preview-friendly, no client JS required.

**Relationship to FTR-039.** The Five entry modes (FTR-039) become the *default composition*, not the *only composition*. The compositor launches with FTR-039 as the initial config but makes it mutable by editorial judgment. FTR-039 governs the default; the compositor governs the ability to vary from it.

**Admin portal UI (extends FTR-060 Layer 3):**

- Table showing current homepage slots with drag-to-reorder and toggle visibility
- Per-slot config panel (e.g., "Featured Themes: select 6 from available themes")
- Preview mode ("preview as seeker" — render the composition without publishing)
- Brand/locale selector (editors with appropriate permissions see their brand's compositions)
- Scheduling view: calendar showing active and upcoming compositions
- No authentication before STG-023 — use the same lightweight auth as the editorial portal (open question, CONTEXT.md)

**Non-goal: behavioral optimization.** The compositor supports editorial rotation and seasonal scheduling, not A/B testing. Composition decisions are driven by editorial judgment and qualitative feedback, not by aggregate behavioral metrics (PRI-09, FTR-082). The portal curates from the corpus, not from user behavior.

**Pages beyond homepage.** The compositor pattern extends to any editorially curated page: `/guide`, `/browse`, `/themes`, the magazine landing. Start with homepage only; evaluate extension when the pattern proves itself.

**Phasing:**
- **STG-007 (foundation):** `page_compositions` + `composition_slots` tables. Admin UI for reorder + toggle. Single default composition per brand/locale. Preview mode.
- **STG-020+ (full):** Scheduling (active_from/active_until). Multiple compositions per brand/locale. Calendar integration (link compositions to calendar events from FTR-065). Brand-variant compositions for YSS.

**Re-evaluate At:** STG-007 scoping (when admin portal architecture is finalized)
**Decision Required From:** Architecture (data model, admin UI), SRF editorial (governance: does theological reviewer approve compositions, or just content within them?)
**Origin:** Exploration — editorial surface gap analysis (2026-02-28)
