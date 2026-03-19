---
ftr: 43
title: Accessibility Requirements STG-004
summary: "WCAG 2.1 AA compliance requirements for vision, motor, and cognitive accessibility"
state: implemented
domain: experience
governed-by: [PRI-05, PRI-07]
depends-on: [FTR-003]
---

# FTR-043: Accessibility Requirements STG-004

## Rationale


Accessibility is not a polish step — it is a theological requirement. The DELTA Dignity principle demands that every seeker, regardless of ability, can access the teachings. Building on an inaccessible foundation creates exponentially more remediation work later.

(See FTR-003 for full rationale.)

### WCAG 2.1 AA Compliance Target

The portal targets WCAG 2.1 Level AA conformance from STG-004. Level AAA criteria are adopted where achievable without significant trade-offs (e.g., 7:1 contrast for body text is met by our existing token choices).

### Requirements by Category

#### Vision — Blindness and Screen Readers

| Requirement | Implementation |
|-------------|---------------|
| Semantic HTML | All pages use proper heading hierarchy (`h1`→`h2`→`h3`), `<nav>`, `<main>`, `<article>`, `<aside>`, `<footer>`. No heading level skips. |
| ARIA landmarks | `role="search"` on search form, `role="banner"` on header, `role="contentinfo"` on footer, `aria-label` on all navigation regions. |
| Image alt text | All guru photographs: full name and title (e.g., "Paramahansa Yogananda, founder of Self-Realization Fellowship"). All nature images: descriptive text. Decorative images: `alt=""`. |
| Search results | Each result is an `<article>` with `aria-label` describing the passage source. "Read in context" links include `aria-label="Read this passage in context in [Book Title], Chapter [N]"`. |
| Today's Wisdom | "Show me another" button has `aria-live="polite"` region so new passage is announced. |
| Quiet Corner timer | Timer state announced via `aria-live="assertive"` when chime sounds. Visual-only chime has text equivalent: "Your meditation time is complete." |
| Book reader | Chapter navigation via `<nav aria-label="Chapter navigation">`. Table of contents as ordered list. Current chapter indicated with `aria-current="page"`. |
| Quote sharing | Share button labeled `aria-label="Copy link to this passage"`. "Link copied" confirmation announced via `aria-live="polite"`. |
| Skip navigation | "Skip to main content" link as first focusable element on every page. |

#### Vision — Low Vision and Magnification

| Requirement | Implementation |
|-------------|---------------|
| Text scaling | All text uses `rem` units. Layout does not break at 200% browser zoom. |
| Minimum text size | Body text: 18px (`--text-base`). No text smaller than 12px (`--text-xs`) and that only for non-essential labels. |
| Reflow | Content reflows to single column at narrow widths. No horizontal scrolling at 320px viewport width (WCAG 1.4.10). |
| Focus indicators | All interactive elements show a visible focus ring: `outline: 2px solid var(--srf-blue); outline-offset: 2px;`. Never `outline: none` without a replacement. |
| Target size | All clickable targets minimum 44×44px (WCAG 2.5.5 Level AAA, adopted as policy). |

#### Vision — Color Blindness

| Requirement | Implementation |
|-------------|---------------|
| Color contrast | All text meets WCAG AA minimums: 4.5:1 for normal text, 3:1 for large text (≥18pt or ≥14pt bold). |
| `--portal-text-muted` | Set to `#595959` (5.3:1 on `--portal-bg`). Corrected from original `#6B6B6B` which failed at 4.1:1. |
| `--srf-gold` | `#DCBD23` must NOT be used as text on light backgrounds (2.4:1 ratio). Use only as borders, backgrounds, or decorative accents. Gold text is permitted only on `--srf-navy` backgrounds (8.2:1). |
| Information not by color alone | Search result relevance, theme distinctions, and all status indicators use shape, text, or icons in addition to color. |

#### Hearing

| Requirement | Implementation |
|-------------|---------------|
| Video captions | YouTube embeds always load with captions enabled (`&cc_load_policy=1` parameter). Rely on YouTube's auto-captions and SRF's uploaded captions. |
| Quiet Corner chime | The timer completion chime has a visual equivalent: a gentle, full-screen pulse animation (`@media (prefers-reduced-motion: no-preference)`) or a text message ("Your time is complete") for users with `prefers-reduced-motion: reduce`. |
| Audio content | Any future audio features (text-to-speech, future audio clips) must provide text transcripts. |

#### Motor and Mobility

| Requirement | Implementation |
|-------------|---------------|
| Full keyboard navigation | All interactive elements reachable and operable via keyboard. Logical tab order following visual layout. |
| No keyboard traps | Modal dialogs (if any) trap focus correctly and release on close. No focus traps elsewhere. |
| Quiet Corner timer | Operable entirely by keyboard: arrow keys to select duration, Enter/Space to start, Escape to cancel. |
| No time-dependent interactions | No UI elements that require fast action. The Quiet Corner timer is opt-in and user-controlled. |
| Touch targets | Minimum 44×44px for all touch targets on mobile. Adequate spacing between adjacent targets. |

#### Cognitive and Neurological

| Requirement | Implementation |
|-------------|---------------|
| `prefers-reduced-motion` | All animations and transitions respect `@media (prefers-reduced-motion: reduce)`. When active: no hover animations, no page transitions, timer chime is text-only. |
| `prefers-color-scheme` | Support `dark` scheme when the Calm Technology design system ships. STG-004 uses light theme only but CSS architecture supports future dark mode via custom properties. |
| `prefers-contrast` | When `more`, increase border widths and ensure all text exceeds 7:1 contrast. |
| Clear language | All UI copy at 8th-grade reading level or below. Error messages are specific and actionable ("No passages found for this search. Try different words." not "Error 404"). |
| Consistent navigation | Header and footer identical on every page. No layout shifts between pages. |
| Reading mode | STG-004: clean reader with generous whitespace. Calm technology design system: adjustable font size, sepia/dark mode. |

#### FTR-052: Cognitive Accessibility — Beyond WCAG Minimums

WCAG 2.1 AA covers minimum cognitive requirements (consistent navigation, error identification, reading level for labels). The portal's mission — serving seekers worldwide, including those in crisis — demands going further.

| Requirement | Implementation |
|-------------|---------------|
| Progressive homepage disclosure | First visit (sessionStorage) shows simplified above-the-fold: Today's Wisdom + search bar + "Or explore a theme" link. Thematic doors, "Seeking..." entries, and videos are below the fold. Return visits show the full homepage. |
| Passage accessibility classification | Passages tagged during ingestion QA: `accessible` (short, clear, affirmation-like), `moderate` (standard prose), `dense` (philosophical, multi-clause). Used internally for pool selection — never displayed. Today's Wisdom favors `accessible`; Quiet Corner uses only `accessible`. |
| Simplified reading mode ("Focus") | Optional toggle in reader header (STG-005). Reduces reader to: reading column + Next Chapter. Related Teachings panel, keyboard shortcuts, dwell icon, and bookmark icon suppressed. Stored in `localStorage`. |
| Minimal gesture vocabulary for core tasks | The portal's essential experience (read, search, navigate) requires only: click, scroll, type. All other gestures (long-press, hover-wait, keyboard shortcuts) are enhancements. Explicitly tested in QA. |
| Decision fatigue reduction | Non-search pages follow the single-invitation principle (FTR-047): each endpoint invites exactly one step deeper, never more. |

#### FTR-053: Screen Reader Emotional Quality

The warm cream background and gold accents do nothing for blind seekers. The spoken language of ARIA labels is their entire aesthetic. Standard markup produces functional but emotionally flat output. The portal's screen reader voice carries the same warmth as its visual design.

| Element | Standard markup | Portal standard |
|---------|----------------|-----------------|
| Search region | "Search" | "Search the teachings" |
| Today's Wisdom section | "Today's Wisdom" | "Today's Wisdom — a passage from Yogananda's writings" |
| Quiet Corner page | "Main content" | "The Quiet Corner — a space for stillness" |
| Dwell mode enter | "Passage focused" | "Passage focused for contemplation" |
| Dwell mode exit | "Passage unfocused" | "Returned to reading" |
| Search results count | "5 results" | "Five passages found" |
| Theme page | "Theme: Courage" | "Teachings on Courage — passages from across the library" |
| Empty bookmarks | "No items" | "You haven't marked any passages yet" |
| Timer start | "Timer started: 5:00" | "The timer has begun. Five minutes of stillness." |
| Timer end | "Timer complete" | "The time of stillness is complete." |

**Passage citations read naturally.** Screen reader output flows as speech: "'The soul is ever free; it is deathless, birthless...' — from Autobiography of a Yogi, Chapter 26, page 312." Uses `aria-label` on passage containers for natural reading while visual HTML retains its formatting.

**Testing criterion:** STG-004 screen reader testing (VoiceOver, NVDA, TalkBack) evaluates not only "can the seeker navigate and read" but also "does the experience carry warmth and contemplative quality."

#### Display Resilience — Grayscale, E-Ink, Print, and Forced Colors

The portal's visual beauty should honor the teachings in every medium a seeker encounters it: color screens, grayscale displays, e-ink readers, print, and Windows High Contrast mode. PRI-03 demands this — "Is this worthy of presenting Yogananda's words?" applies to a passage printed on paper or read on a Kindle browser as much as one rendered in gold on cream.

**Grayscale palette behavior (verified):**

| Token | Hex | Grayscale luminance | Risk |
|-------|-----|---------------------|------|
| `--srf-navy` | `#1a2744` | ~15% (very dark) | None — strong contrast against all lighter tokens |
| `--srf-gold` | `#dcbd23` | ~71% (medium-light) | **Gold-on-cream: only 26% difference.** Gold borders and decorative accents on cream nearly vanish in grayscale. |
| `--portal-bg` (cream) | `#FAF8F5` | ~97% (near-white) | None as background |
| `--portal-text-muted` | `#595959` | ~35% (mid-dark) | None — 62% difference from cream |

**Key risk:** Gold (#dcbd23) renders as ~71% gray; cream (#FAF8F5) renders as ~97% gray. The 26% difference means gold borders, lotus motifs at low opacity, and decorative gold accents on cream backgrounds **may become invisible** on grayscale displays, e-ink devices, and in print. Gold-on-navy (71% vs 15%) remains strong.

| Requirement | Implementation |
|-------------|---------------|
| `@media (forced-colors: active)` | All interactive elements (buttons, links, focus rings) must remain visible in Windows High Contrast mode. Test with `Emulated CSS media feature forced-colors: active` in Chrome DevTools. Gold accents replaced by system `LinkText`/`ButtonText` colors. |
| Grayscale visual hierarchy | The portal's visual hierarchy must survive `filter: grayscale(1)`. Gold-on-cream decorative elements (lotus motif, gold borders, gold dividers) must use sufficient stroke width or supplementary contrast (e.g., a 1px navy hairline alongside gold) to remain visible at ~26% luminance difference. |
| E-ink rendering | The book reader and passage pages must render legibly on e-ink browsers (Kindle Experimental, BOOX). These devices render at ~16 levels of gray. Test: apply `filter: grayscale(1) contrast(1.2)` as an approximation. No content or navigation may depend solely on color distinction. |
| `@media print` | Book reader chapters and passage pages must render beautifully in print. Seekers print passages — this is an act of devotion, not edge-case usage. Print stylesheet: hide navigation chrome, expand reading column to full width, use system serif stack, ensure gold decorative elements either print as visible gray or are suppressed. Include `@page` margin rules. |
| Grayscale CI regression | Playwright visual regression suite includes grayscale screenshots (`page.emulateMedia()` + CSS filter) for the book reader, passage page, and homepage. Catches regressions where new gold-on-cream elements would vanish in grayscale. |

**Testing additions to the Accessibility Testing Strategy table:**

| Method | When | Tool |
|--------|------|------|
| Forced-colors audit | New components + stage gates | Chrome DevTools forced-colors emulation |
| Grayscale visual regression | Every build (CI) | Playwright with `filter: grayscale(1)` screenshot comparison |
| Print stylesheet validation | Stage gates | Chrome print preview, verify reader/passage pages |
| E-ink approximation | STG-005+ | Playwright with `filter: grayscale(1) contrast(1.2)` |

#### Performance as Accessibility (Global-First Principle)

| Requirement | Implementation |
|-------------|---------------|
| Initial page load | < 100KB JavaScript for the full app shell (compressed). Homepage stricter: < 50KB initial payload (HTML + critical CSS + inline JS) per FTR-006. Target: First Contentful Paint < 1.5s on 3G. |
| Core Web Vitals | LCP < 2.5s, FID < 100ms, CLS < 0.1. |
| Progressive enhancement | Core reading and search functionality works without JavaScript (server-rendered HTML). JS enhances: "Show me another", infinite scroll, timer. |
| Low-bandwidth support | All images lazy-loaded. Responsive images via `srcset`. No autoplay video. Homepage functional as text-only. `/browse` page (FTR-056) designed text-first as < 20KB offline-cacheable portal index — the universal fallback for 2G, feature phones, and screen readers. |
| Offline resilience | STG-004: service worker caches the Quiet Corner page and current reading position. Full PWA when progressive web app readiness ships (FTR-103). |

### Accessibility Testing Strategy

| Method | When | Tool |
|--------|------|------|
| Automated audit | Every build (CI) | axe-core via `@axe-core/react` or Lighthouse CI |
| Manual keyboard testing | Every new component | Developer checklist |
| Screen reader testing | Before each stage release | VoiceOver (macOS), NVDA (Windows) |
| Color contrast validation | Design token changes | Chrome DevTools, WebAIM Contrast Checker |
| Real-user testing | When Calm Technology design system ships | Engage accessibility testers (consider SRF community members with disabilities) |

---

## Notes

Migrated from FTR-043 per FTR-084.
