---
ftr: 163
title: "Sanctuary Mode — Crisis-State Environmental Adaptation"
summary: "CSS-driven environmental simplification for seekers in distress with automatic and manual activation"
state: proposed
domain: experience
governed-by: [PRI-03, PRI-05, PRI-08, PRI-09]
depends-on: [FTR-042, FTR-051]
---

# FTR-163: Sanctuary Mode

## Rationale

### Context

FTR-051 provides a crisis resource line on grief-adjacent content — a phone number for someone in danger. This is necessary but insufficient. A seeker in crisis experiences the portal's normal interface as overwhelming: navigation choices, search affordances, related content panels, visual complexity. The interface designed for exploration becomes noise when what the seeker needs is shelter.

Sanctuary Mode is a full environmental adaptation — not a phone number, but a place of rest. Inspired by design principles used in refugee camp wayfinding (simplified signage, warm colors, reduced cognitive load, clear paths to help), it transforms the portal's presentation to serve seekers in their most vulnerable moments.

### Decision

Implement a CSS-driven environmental mode that simplifies the portal's presentation for seekers in distress. Sanctuary Mode activates through two paths and transforms the reading environment.

### Activation

**Path 1: Content-triggered (automatic, subtle).** When the seeker is on grief-tagged content (FTR-051 detection triggers), the portal applies sanctuary *hints* — not the full mode. Hints include warmer background tones, slightly larger text, and the crisis resource line. The seeker is not told they're in a special mode. The environment simply becomes gentler.

**Path 2: Seeker-initiated (manual, full).** A "Gentle mode" toggle in reader preferences (alongside font size and theme). When activated, the full Sanctuary Mode engages. This is the seeker saying "I need less right now."

### Environmental Changes

| Aspect | Normal | Sanctuary Mode |
|--------|--------|---------------|
| Color temperature | Theme-dependent | Warm cream (#FAF8F5), reduced contrast |
| Typography | Standard sizes | +2px body, +4px headings, 1.9 line height |
| Navigation | Full chrome | Minimal: back arrow, home, crisis resource |
| Related content | Full panels | Hidden (reduce cognitive load) |
| Animations | Normal transitions | All transitions disabled (`prefers-reduced-motion` forced) |
| Touch targets | 44px minimum | 56px minimum |
| Content ordering | Relevance-ranked | Gentleness-first (comforting passages surfaced) |
| Sound | Theme-dependent | Silent (no ambient audio, no interaction sounds) |
| DOM presence | All elements in accessibility tree | Non-essential elements removed from DOM, not just hidden via CSS |
| Session | Persistent preference | Persists until manually toggled off |

**DOM removal, not visual hiding.** Sanctuary Mode physically removes non-essential DOM elements from the page — not `display: none` or `visibility: hidden`, but conditional rendering that excludes them from the accessibility tree entirely. Screen readers must share the exact same sensory silence as sighted users. This principle is drawn from Sefaria's discovery that the semantic HTML DOM tree *is* the actual user experience for screen readers (deep-research-gemini-sacred-reading.md § 1). In React terms: `{!sanctuary && <RelatedTeachings />}` rather than CSS hiding.

**Contemplatio decay (dwell-to-silence transition).** When a user enters Zoom Paragraph mode (FTR-041 § 5.2) and remains inactive for 45 seconds, the interface introduces a slow contemplative decay: text contrast gradually fades over 8 seconds to 40% opacity, background warms slightly, simulating the transition from reading (*lectio*) through reflection (*meditatio*) to silence (*contemplatio*). Any interaction (scroll, touch, keypress) instantly restores full contrast. This decay applies in both Normal and Sanctuary modes but uses gentler timing in Sanctuary (30 seconds to trigger, 12 seconds to fade). The decay is CSS-only (`transition: opacity 8s ease-out`) triggered by a class toggle from a passive inactivity timer. Respects `prefers-reduced-motion` — no fade, instant dim after the timeout period.

### Implementation

Pure CSS + design tokens. A `data-sanctuary="hints"` or `data-sanctuary="full"` attribute on `<html>` triggers the environmental shift through the design token system (FTR-145). No JavaScript behavior changes beyond the attribute toggle.

```css
[data-sanctuary="full"] {
  --surface-primary: var(--sanctuary-cream);
  --text-body-size: calc(var(--base-text-size) + 2px);
  --touch-target-min: 56px;
  --transition-duration: 0ms;
  /* ... sanctuary token overrides */
}
```

Content ordering ("gentleness-first") requires a `gentleness_score` enrichment tag on passages — added to the enrichment pipeline (FTR-026) prompt. This is the only backend change.

### Constraints

- **No behavioral detection** (PRI-09) — Sanctuary Mode never activates based on user behavior patterns (scrolling speed, time on page, click patterns). Only content type (grief-tagged) or explicit seeker choice.
- **No patronizing** — the mode is never described as "for people in crisis." It's "Gentle mode" — a preference like font size or theme. Available to anyone for any reason.
- **No lock-in** — easy, obvious exit. One tap returns to normal. No "Are you sure?" confirmation.
- **No data** — sanctuary mode activation is not tracked, counted, or reported. Not even as an aggregate counter. This is the one signal the portal deliberately does not collect.

### Design Token Integration

Sanctuary tokens extend FTR-145 (Visual Design Language System) as a new emotional register:

```json
{
  "sanctuary": {
    "$type": "composite",
    "$description": "Environmental adaptation for seekers in distress. Warmer, simpler, gentler.",
    "surface": { "$value": "{color.cream.50}" },
    "text-scale": { "$value": "1.125" },
    "motion": { "$value": "none" },
    "target-min": { "$value": "56px" }
  }
}
```

### Re-evaluate At

Milestone 3a boundary — after design token system (FTR-145) is operational and crisis content detection (FTR-051) is validated.

### Decision Required From

1. SRF editorial: Is a "gentle mode" consistent with SRF's approach to seekers in distress?
2. Accessibility review: Does Sanctuary Mode improve or conflict with existing a11y accommodations (FTR-043)?
3. Theological review: Is "gentleness-first" content ordering a form of interpretation that crosses the fidelity boundary (FTR-007)?

### Source Exploration

`what-is-resonating-at-the-lowest-octaves-of-expression.md`

## Notes

- **Origin:** Extracted from archived proposal during FTR novelty audit (2026-03-05)
- The original proposal referenced "refugee-camp-inspired sanctuary modes" — the humanitarian design influence is acknowledged but the implementation is portal-specific
- Sanctuary Mode is deliberately NOT tracked — this is the one exception to the "measure everything anonymously" pattern
- Related to but architecturally distinct from FTR-051 (crisis line is a UI element; sanctuary is an environmental transformation)
