---
ftr: 52
title: Cognitive Accessibility
summary: "Progressive disclosure, passage accessibility classification, and reduced cognitive load strategies"
state: approved-provisional
domain: experience
governed-by: [PRI-05, PRI-07, PRI-08]
depends-on: [FTR-003, FTR-040]
---

# FTR-052: Cognitive Accessibility

## Rationale


### Context

The portal's accessibility commitment (FTR-003) targets WCAG 2.1 AA compliance: vision, hearing, motor, and some cognitive requirements. This covers screen readers, keyboard navigation, color contrast, and reduced motion. But cognitive accessibility is a broader dimension:

- **Decision fatigue.** The homepage presents Today's Wisdom, a search bar, 6 thematic doors, 5 "Seeking..." links, and latest video thumbnails. For a first-time visitor in emotional distress, this quantity of choices may be overwhelming.

- **Gesture vocabulary.** The portal uses: click (navigate), long-press (Dwell), hover-wait (dwell icon reveal), keyboard shortcuts (12 keys), scroll (read), and "Show me another" (refresh). Each individually is intuitive. In aggregate, the gesture vocabulary is larger than most reading applications.

- **Reading complexity.** Yogananda's prose ranges from accessible affirmations to dense philosophical exposition. The portal treats all content equally in presentation.

These concerns apply not only to seekers with cognitive disabilities but also to non-native English speakers (before Milestone 5b adds their language), elderly seekers, seekers under acute emotional stress, and seekers unfamiliar with web conventions.

### Decision

1. **Progressive homepage disclosure for first visits.** On the first visit (sessionStorage, extending FTR-040's mechanism), the homepage after the lotus threshold shows a simplified state:
 - Today's Wisdom (full size, centered, with "Show me another")
 - The search bar ("What are you seeking?")
 - A single line: "Or explore a theme" — linking to the thematic doors section below

 The thematic doors, "Seeking..." entry points, and video section are present on the page but appear below the fold. The seeker discovers them by scrolling — at their own pace. Return visits within the session show the full homepage immediately.

 This is not "hiding content" — it's sequencing the first encounter to reduce cognitive load. The most important elements (a teaching + a search bar) appear first. Everything else is available but not competing for attention.

2. **Passage accessibility classification.** During ingestion, passages receive an editorial `accessibility_level` tag:
 - `accessible`: Short, clear, affirmation-like. Suitable for daily wisdom, newcomer paths, Quiet Corner.
 - `moderate`: Standard narrative prose. The bulk of the corpus.
 - `dense`: Philosophical, multi-clause, requires sustained attention. Commentary on scriptures, metaphysical analysis.

 This tag is used internally for pool selection (Today's Wisdom favors `accessible`; Quiet Corner uses only `accessible`; search returns all levels) — never displayed to the seeker. Not a quality judgment. Dense passages are not lesser teachings — they are teachings that reward deeper attention.

3. **Simplified reading mode.** An optional "Focus" toggle in the reader header (STG-005, alongside Dwell) that reduces the reader to: reading column + Next Chapter. The Related Teachings side panel, keyboard shortcut overlay, dwell icon, and bookmark icon are suppressed. The toggle is stored in `localStorage`. This mode serves seekers who want to read a book linearly without the browse-navigation features — and it naturally serves cognitive accessibility needs without labeling them.

4. **Consistent, minimal gesture vocabulary for core tasks.** The portal's essential experience (read, search, navigate) requires only: click, scroll, and type. All other gestures (long-press, hover-wait, keyboard shortcuts) are enhancements. The portal must be fully functional with only the three basic gestures. This is already approximately true but should be an explicit design constraint tested in QA.

### Alternatives Considered

1. **No cognitive accessibility considerations beyond WCAG 2.1 AA.** Rejected: WCAG AA covers minimum cognitive requirements (consistent navigation, error identification, reading level for labels). The portal's mission — serving seekers worldwide, including those in crisis — demands going further.

2. **A dedicated "simple mode" for the entire portal.** Rejected: Labeling creates stigma. "Focus" mode in the reader is a feature, not an accessibility accommodation. The progressive homepage disclosure applies to all first-time visitors, not a special subset.

3. **AI-powered reading level adaptation.** Rejected: Violates the "direct quotes only" principle (FTR-001). Yogananda's words cannot be simplified. The accessibility classification routes seekers to appropriate *passages*, not to modified text.

### Rationale

- **The seeker in crisis is the hardest cognitive accessibility case.** The "Seeking..." entry points target people in emotional distress. A person at 2 AM unable to sleep because of anxiety has reduced cognitive capacity. The homepage should require minimal cognitive effort to find comfort.
- **Progressive disclosure is standard UX, not accommodation.** Apple, Google, and most modern products sequence complexity. Showing everything at once is a design choice, not a necessity.
- **Focus mode serves multiple populations.** Linear readers, elderly seekers, seekers with cognitive disabilities, seekers on very small screens, and seekers who simply prefer simplicity all benefit from a reduced-chrome reading mode.
- **Accessibility classification improves Today's Wisdom quality.** The daily passage should be a standalone moment of inspiration. Dense philosophical prose — however profound — makes a poor homepage greeting for a first-time visitor.

### Consequences

- Homepage first-visit behavior extended (sessionStorage): simplified above-the-fold state
- New `accessibility_level` column on `book_chunks` (nullable enum: `accessible`, `moderate`, `dense`)
- Today's Wisdom pool favors `accessible` passages (soft bias, not hard filter)
- Quiet Corner pool restricted to `accessible` passages
- New "Focus" toggle in reader header (STG-005)
- DESIGN.md § Accessibility Requirements gains a "Cognitive Accessibility" subsection
- DESIGN.md § Homepage updated with progressive disclosure specification
- Editorial workload: passages need accessibility classification during ingestion QA
- No new API endpoints; `accessibility_level` is a query filter on existing endpoints


## Notes

Migrated from FTR-052 per FTR-084.
