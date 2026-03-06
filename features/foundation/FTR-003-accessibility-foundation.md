# FTR-003: Accessibility Foundation

**State:** Approved (Foundational)
**Domain:** foundation
**Arc:** 1+
**Governed by:** PRI-07

## Rationale

- **Date:** 2026-02-17

### Context

The original roadmap placed accessibility late in the schedule ("Calm Technology Polish & Accessibility"). This is too late. Retrofitting accessibility is expensive and error-prone; building it in from day one is nearly free if the right structural choices are made at the start.

SRF's audience includes elderly devotees, seekers in developing countries on low-end devices, and visually impaired users. The Gemini research document specifically notes visually impaired devotees who described the SRF app's screen reader support as "transformative." Accessibility is not a feature — it is a theological imperative per SRF's mission to serve "all of humanity" and the DELTA framework's Dignity principle.

| Approach | Cost | Risk |
|----------|------|------|
| **Milestone 2a (build in)** | Low — semantic HTML, ARIA, keyboard nav are free if done from the start | None — this is best practice |
| **Late retrofit** | High — requires auditing and rewriting markup, fixing tab order, adding ARIA after the fact | Significant — inaccessible patterns get baked into components and propagated |

### Decision

Make **core accessibility** a **Milestone 2a** requirement from the start. Later arcs add the audit and polish milestone (professional WCAG audit, native TTS, advanced reading mode), not the "add accessibility" milestone.

**Milestone 2a accessibility requirements:**

| Category | Requirements |
|----------|-------------|
| **Structure** | Semantic HTML (`<article>`, `<nav>`, `<main>`, `<header>`, `<footer>`). ARIA landmark regions. Strict heading hierarchy (`h1` → `h2` → `h3`). Skip-to-content link. |
| **Vision** | All text meets WCAG AA contrast ratios (4.5:1 body, 3:1 large). Alt text on all images. Text reflows at 200% zoom. Font size control (A-/A+). Respect `prefers-contrast: more`. No color-only meaning. |
| **Motor** | Full keyboard navigation. Visible focus indicators. 44×44px minimum touch targets. No hover-only interactions. No time-limited interactions (Quiet Corner timer is optional). |
| **Hearing** | Quiet Corner chime has visual equivalent (gentle brightness change + text). Request corrected YouTube captions from SRF. |
| **Cognitive** | Consistent navigation. No autoplay. No flashing. Clear UI language. Respect `prefers-reduced-motion`. Predictable behavior. |
| **Performance** | < 100KB initial load. Lazy-loaded images. `font-display: swap`. Progressive enhancement. |
| **Reading** | Basic reading mode: font size adjustment, line spacing control, dark mode toggle for evening reading. |

**Later arcs (Accessibility Audit & Polish):**
- Professional WCAG 2.1 AA audit (automated + manual + real assistive technology users)
- Native TTS "Listen" button in the reader (Web Speech API)
- Advanced reading mode (sepia, custom fonts, reading ruler)
- Testing with VoiceOver, NVDA, JAWS, TalkBack
- Testing on low-end devices and slow networks
- Remediation of any audit findings

### Critical: Color Contrast Fix

The existing design tokens have contrast failures that must be corrected before any implementation:

| Combination | Current Ratio | Required | Fix |
|-------------|--------------|----------|-----|
| `--portal-text-muted` (#6B6B6B) on `--portal-bg` (#FAF8F5) | 4.1:1 | 4.5:1 | Darken to `#595959` (5.3:1) |
| `--portal-text-muted` (#6B6B6B) on `--portal-quote-bg` (#F9F6F1) | 3.9:1 | 4.5:1 | Same fix — `#595959` |
| `--srf-gold` (#DCBD23) as text on `--portal-bg` (#FAF8F5) | 2.4:1 | 3:1 (large) | Gold is for borders/accents only, never text on light backgrounds |

### Rationale

- **Theological:** SRF's mission is to serve all of humanity. "All" includes people with disabilities.
- **DELTA Dignity:** Treating users as inherently worthy means not excluding them through inaccessible design.
- **Practical:** Semantic HTML and keyboard navigation take no extra effort when done from the start. They take massive effort to retrofit.
- **Legal:** WCAG compliance is increasingly a legal requirement in the US (ADA), EU (European Accessibility Act), and other jurisdictions.
- **SRF precedent:** The SRF app already invested in screen reader support. The portal should meet or exceed that standard.

### Consequences

- Every component built in Arc 1 and Milestone 2a must pass basic accessibility checks (Lighthouse, axe DevTools)
- The design token `--portal-text-muted` must be corrected to `#595959` before implementation begins
- `--srf-gold` must never be used as text on light backgrounds
- Later accessibility arcs handle audit and polish (not build-from-scratch), plus TTS and professional audit
