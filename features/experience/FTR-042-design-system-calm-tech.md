---
ftr: 42
title: Design System Calm Tech
summary: "Typography, color palette, and interaction patterns derived from SRF sites with calm constraints"
state: implemented
domain: experience
governed-by: [PRI-03, PRI-08, PRI-10]
---

# FTR-042: Design System Calm Tech

## Rationale


### Context

Standard web design patterns (aggressive CTAs, gamification, notification badges, bright neon colors) conflict directly with SRF's theological commitment to "plain living and high thinking." Rather than inventing a new visual language, we extracted actual design tokens from live SRF properties to ensure brand consistency.

**Properties analyzed:**
- yogananda.org (Craft CMS — donate button, gold/navy palette, lotus icons)
- onlinemeditation.yogananda.org (WordPress/Astra — Merriweather + Lora fonts, form styling)
- convocation.yogananda.org (Next.js + Contentful — 7-locale setup)

### Decision

The portal adopts a **design system derived from existing SRF sites**, enhanced with Calm Technology constraints:

**Typography (from SRF Online Meditation Center):**
- **Merriweather** (300, 400, 700) — primary serif for book text and headings
- **Lora** (400) — secondary serif for chapter titles, decorative use
- **Open Sans** (400, 600) — sans-serif for UI chrome, navigation, labels

**Color palette (from yogananda.org + OMC):**
- SRF Gold `#dcbd23` — primary accent (donate button, lotus, CTAs)
- SRF Orange `#de6a10` — hover/active states
- SRF Navy `#1a2744` — headings, primary text (estimated from assets)
- Warm cream `#FAF8F5` — portal background (Calm Technology extension)
- Interactive blue `#0274be` — focus states, links

**Interaction patterns (from SRF donate button):**
- Gold border + gold text → orange fill on hover
- `transition: all 0.3s ease` for hover/focus states
- Pill-shaped CTA buttons (`border-radius: 50px`)

**Calm Technology constraints:**
- No gamification, no streaks, no badges, no leaderboards
- No aggressive notifications
- No decorative animations beyond subtle 0.3s transitions
- Generous whitespace treated as "digital silence"
- Warm backgrounds, never pure white

### Rationale

- **Brand consistency:** Same fonts and colors as existing SRF digital properties
- **Theological alignment:** Calm Technology principles match "plain living and high thinking"
- **Reusability:** These tokens can become a shared design system across all SRF properties
- **Familiarity:** Existing SRF devotees will recognize the visual language

### Consequences

- The design system should be documented as CSS custom properties (see FTR-145)
- WCAG contrast ratios must be validated — muted colors on warm cream backgrounds need careful checking
- The lotus icon SVG family from yogananda.org can be reused (with SRF's permission)
- A shared npm package could eventually serve these tokens to all SRF Next.js properties

