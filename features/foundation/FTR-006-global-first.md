---
ftr: 6
title: "Global-First — Serving Earth's Underserved Seekers"
summary: "Data cost awareness, text-only mode, aggressive caching, and progressive enhancement for global seekers"
state: approved-foundational
domain: foundation
governed-by: [PRI-05, PRI-06, PRI-07]
depends-on: [FTR-003, FTR-103]
---

# FTR-006: Global-First

## Rationale

**Date:** 2026-02-19

### Context

The portal's mission — making Yogananda's teachings "available freely throughout the world" — is not satisfied by building a fast website in English and translating it later. "The world" includes:

- A seeker in rural Bihar with a JioPhone on 2G, paying per megabyte
- An elderly devotee in São Paulo who shares a smartphone with her family
- A yoga practitioner in Lagos accessing the portal from a cybercafé
- A Bengali-speaking YSS member who has never used a website in their own language
- A visually impaired monk in Germany who navigates entirely by screen reader

FTR-003 established accessibility as a STG-004 foundation. FTR-058 established multilingual architecture. FTR-103 established the PWA for offline reading. This ADR addresses the gaps between those decisions — the practical realities of serving seekers who are not well-served by the default assumptions of Western web development.

### Decision

Adopt the following design constraints and features as explicit commitments, not aspirational goals:

#### 1. Data Cost Awareness

In Sub-Saharan Africa, South Asia, and Southeast Asia, mobile data is not unlimited. Seekers pay per megabyte. A page that loads fast on 3G may still be too expensive if it costs 500KB per visit.

**Commitments:**
- Homepage initial payload: **< 50KB** (HTML + critical CSS + inline JS). The current 100KB JS budget (FTR-003) is an upper bound for the full app shell; the homepage must be lighter.
- **Text-only mode toggle** in the site footer and in reader settings. When enabled: no images, no decorative elements, no web fonts (system serif stack), no OG preview generation. Stored in `localStorage`. This is not a degraded experience — it is a *considered* experience for seekers who cannot afford decorative bytes.
- **Aggressive caching headers.** Book content changes rarely. Chapters served with `Cache-Control: public, max-age=31536000, immutable` (1 year) and content-hashed URLs. Repeat visits and chapter-to-chapter navigation cost zero data after first load.
- Print stylesheets load only when `@media print` matches — zero cost during normal browsing.

#### 2. Device Spectrum

Not all seekers have smartphones. KaiOS (JioPhone, Nokia feature phones) runs a basic browser with limited JavaScript support.

**Commitments:**
- **Progressive enhancement is mandatory, not optional.** The reading experience (book text, chapter navigation, search form submission) must work with JavaScript disabled. Server-rendered HTML is the baseline. JavaScript enhances: "Show me another," infinite scroll, Quiet Corner timer, dwell mode.
- **Touch targets remain 44×44px minimum** (FTR-003), but form inputs and navigation links use **48px** minimum on pages likely accessed from feature phones (homepage, search results, book index).
- Feature phone compatibility is ensured through progressive enhancement (semantic HTML, no JS-required flows), not through dedicated CI testing. The progressive enhancement commitment covers KaiOS-class browsers by construction.

#### 3. Shared Devices

In many families globally, one phone serves 3–5 people. The portal must not assume a device belongs to a single person.

**Commitments:**
- **No user accounts until STG-023+** — the portal works fully without sign-in, which is already the design. This is correct for shared devices.
- **Bookmarks (FTR-046) use `localStorage`** — they disappear if the browser data is cleared. This is acceptable for STG-005. STG-023+ (user accounts) can optionally sync bookmarks, but the local-first design is correct for shared devices where privacy between users matters.
- **No "Welcome back" or personalization.** The portal greets every visit the same way. No reading history displayed on the homepage. No "Continue where you left off" (which would expose one family member's reading to another).

#### 4. Intermittent Connectivity as the Norm

The PWA (FTR-103) is scheduled for STG-005. STG-003 (first production deployment) establishes the baseline: cached static assets and an offline indicator. Seekers with unreliable connections get protection from the day the portal is reachable.

**Commitments:**
- **STG-003: Service Worker for app shell.** The app shell (HTML, CSS, JS, fonts) is cached by a minimal Service Worker from the first production deployment. The portal loads instantly on repeat visits. Offline indicator banner from day one.
- **STG-004: Extended caching.** Service Worker enhanced to cover all 2a pages and self-hosted fonts. Integration with text-only mode (skip font caching when text-only enabled).
- **STG-005: Last-read chapter cached.** When a seeker reads a chapter, the chapter HTML is cached in the Service Worker. If connectivity drops, they can re-read that chapter. Not full offline support — just graceful handling of the most common offline scenario (re-reading what you just read).
- **Offline indicator.** When the Service Worker detects no connectivity, a subtle banner appears: *"You're reading offline. Search requires a connection."* Not an error state — a calm acknowledgment. Matches the portal's warm cream palette, not a red warning bar.

#### 5. Community and Group Reading

In India, Latin America, and many African communities, spiritual texts are read aloud in groups — satsang, study circles, family devotions. The portal's reader is designed for individual silent reading.

**Commitments:**
- **Presentation mode (STG-005).** A "Present" button in the reader header. When activated: text enlarges to 24px+ (readable from 2–3 meters), all chrome hides (no header, no sidebar, no share icons), chapter navigation becomes swipe/arrow-key only, warm cream background fills the viewport. The device becomes a digital lectern. *(Pulled forward to STG-005 — communal reading is the primary engagement mode in Indian, African, and Latin American cultures.)*
- **This is not a separate feature — it is a CSS mode.** The same reader component, the same content, the same accessibility. `data-mode="present"` on the reader container triggers the enlarged, chrome-free layout.

#### 6. Cultural Consultation for Entry Points

The "Seeking..." empathic entry points and theme doors are currently written from an English-language, Western-spiritual perspective. "What happens after death?" is a natural question in one culture but may be phrased as "Where does the soul go?" or "What is the cycle of birth?" in another.

**Commitments:**
- **STG-021 (multilingual launch) requires cultural consultation, not just translation.** For each language, SRF engages a native-speaking devotee (not a professional translator) to review the entry points and theme door labels for cultural resonance. The consultant answers: "Would a seeker in [country] phrase this question this way? What would feel more natural?"
- **The "Seeking..." prompts are editorial content, not UI chrome.** They live in Contentful (STG-020+), not in `messages/{locale}.json`. Each locale has independently authored prompts, not translations of the English originals.
- **Query expansion (Claude API) handles the bridge.** Even if the entry point is culturally adapted, a seeker may still type their question in a culturally specific way. The Vocabulary Bridge (FTR-028) and Claude's query expansion handle the mapping from the seeker's phrasing to the passage corpus.

#### 7. Right-to-Left as a First-Class Layout

CSS logical properties (FTR-058) provide the technical foundation for RTL. But RTL is more than mirrored margins.

**Commitments:**
- **STG-021 RTL languages (Arabic, Urdu — if added later) require a native RTL reader to review every page.** Not just CSS mirroring, but visual hierarchy, reading flow, and icon directionality (e.g., a "next chapter" arrow points left in RTL).
- **The share menu, dwell icon, and reader navigation all use `inline-start`/`inline-end` positioning** — already specified in their respective ADRs. This commitment makes the RTL audit a verification exercise, not a redesign.
- **Bidirectional text.** Yogananda quotes in Arabic translation may contain Sanskrit terms (samadhi, pranayama) in Latin script. The portal must handle `dir="auto"` on passage elements to allow mixed-direction text within a single paragraph.

#### 8. Font Loading Strategy for Global Scripts

Web fonts improve typography but add data cost. The current design uses Google Fonts (Merriweather, Lora, Open Sans). Non-Latin scripts require additional font files that can be large (CJK: 2–5MB per weight).

**Commitments:**
- **`font-display: swap` on all web fonts.** Text renders immediately in the system font stack; web fonts swap in when loaded. No invisible text, no layout shift, no blank screen while fonts download.
- **Unicode-range subsetting for non-Latin scripts.** Google Fonts provides automatic subsetting. Only the glyphs needed for the current page are downloaded. A Hindi page does not download Latin glyphs; a Japanese page does not download Devanagari glyphs.
- **Text-only mode (commitment 1) uses system fonts exclusively.** No web font downloads at all. This is the maximum data-saving option.
- **Critical text (passage content, citations) uses the system serif stack as fallback** — not a sans-serif default. `font-family: Merriweather, 'Noto Serif', Georgia, 'Times New Roman', serif` ensures the reading experience is typographically appropriate even before web fonts load.

### Rationale

These commitments exist because the portal's mission is theological, not commercial. "Freely throughout the world" is not a marketing tagline — it is a directive from Yogananda himself (*Autobiography of a Yogi*, Chapter 35: "Whenever anyone, anywhere, shall utter with reverence the name of Babaji, that devotee will instantly attract the Guru's spiritual blessing"). The teachings are for everyone. "Everyone" includes people the Western web industry routinely ignores.

Every commitment above costs nothing or near-nothing at implementation time if incorporated from the start. Retrofitting any of them later is expensive. This is the same argument that justified FTR-003 (accessibility) and FTR-058 (multilingual architecture) — the cheapest time to build for the world is now.

### Consequences

- Homepage payload budget tightened from 100KB to 50KB (HTML + critical CSS + inline JS)
- Text-only mode deployed in STG-003 (footer toggle); integrated into reader settings and design system in STG-004
- Minimal Service Worker deployed in STG-003 (app shell caching), enhanced in STG-004 (all pages + fonts), expanded in STG-005 (last-read chapter)
- Low-bandwidth detection banner deployed in STG-003 (2G/slow-2G suggestion); extended adaptation in STG-005
- Presentation mode added to the reader in STG-005 *(pulled forward from later stages)*
- Cultural consultation budget required for STG-021 multilingual launch
- RTL design review by native reader required before any RTL language goes live
- `font-display: swap` and unicode-range subsetting are non-negotiable for all font loading
- **Extends FTR-003** (accessibility), **FTR-058** (multilingual), and **FTR-103** (PWA) with concrete global equity commitments
