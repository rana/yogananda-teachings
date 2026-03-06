---
ftr: 53
title: Screen Reader Quality
state: approved-provisional
domain: experience
arc: "2"
---

# FTR-053: Screen Reader Quality

## Rationale


### Context

The portal's aesthetic — warm cream, serif typography, generous whitespace, gold accents — creates a contemplative atmosphere for sighted seekers. This atmosphere is a core part of the experience. But for blind seekers using screen readers, the portal's "atmosphere" is entirely constructed from spoken language: ARIA labels, landmark names, live-region announcements, alt text, and heading structure.

Standard screen reader markup produces functional but emotionally flat output: "Navigation landmark. Link, Search. Link, Books. Link, Videos. Heading level 1, Today's Wisdom. Blockquote." This is correct. It is also the verbal equivalent of a fluorescent-lit institutional hallway — technically accessible but carrying no warmth.

FTR-003 establishes WCAG 2.1 AA compliance as a Milestone 2a foundation. FTR-054 establishes editorial standards for UI copy. This ADR specifically addresses the quality of language that screen readers speak — an audience of one sense that deserves the same care as the audience of five.

### Decision

1. **ARIA labels are written as human speech, not markup descriptions.** Every `aria-label`, `aria-describedby`, and `aria-live` announcement is written as if speaking to the seeker — warm, brief, and contextually meaningful.

 | Element | Standard markup | Portal standard |
 |---------|----------------|-----------------|
 | Navigation landmark | "Main navigation" | "Portal navigation" |
 | Search region | "Search" | "Search the teachings" |
 | Today's Wisdom section | "Today's Wisdom" | "Today's Wisdom — a passage from Yogananda's writings" |
 | Quiet Corner page | "Main content" | "The Quiet Corner — a space for stillness" |
 | Dwell mode enter | "Passage focused" | "Passage focused for contemplation" |
 | Dwell mode exit | "Passage unfocused" | "Returned to reading" |
 | Search results count | "5 results" | "Five passages found" |
 | Theme page | "Theme: Courage" | "Teachings on Courage — passages from across the library" |
 | Related teachings | "Related content" | "Related teachings from other books" |
 | Empty bookmarks | "No items" | "You haven't marked any passages yet" |

2. **Passage citations are spoken naturally.** Screen reader output for a passage should flow as natural speech: "*'The soul is ever free; it is deathless, birthless...'* — from Autobiography of a Yogi, Chapter 26, page 312." Not "Blockquote. The soul is ever free semicolon it is deathless comma birthless dot dot dot. End blockquote. Autobiography of a Yogi. Chapter 26. Page 312."

 Implementation: Use `aria-label` on the passage container to provide the natural reading, while the visual HTML retains its formatting. Screen readers read the label instead of parsing the visual structure.

3. **The Quiet Corner timer announces with gentleness.** Timer start: "The timer has begun. [Duration] of stillness." Timer end: "The time of stillness is complete." Not "Timer started: 5:00" or "Timer complete."

4. **Screen reader testing is part of the accessibility review.** Milestone 2a includes VoiceOver (macOS/iOS), NVDA (Windows), and TalkBack (Android) testing. The test criterion is not only "can the seeker navigate and read" but also "does the experience carry warmth and contemplative quality."

### Alternatives Considered

1. **Standard ARIA labels only.** Considered: Functional and WCAG-compliant. Rejected because: the portal's mission is to make the teachings "available freely throughout the world" — and availability includes emotional availability. A screen reader experience that is technically accessible but emotionally barren is not freely available in the fullest sense.

2. **Verbose ARIA labels with full context.** Rejected: Screen reader users value brevity. Long labels slow navigation and frustrate experienced screen reader users. The labels should be warmer than standard but not longer.

3. **Custom screen reader stylesheet or audio design.** Rejected: Screen readers have their own speech synthesis and pacing that users have customized. The portal should not override these settings. The intervention point is the text content (ARIA labels), not the speech delivery.

### Rationale

- **Equality of experience, not just equality of access.** WCAG compliance ensures blind seekers can use the portal. Emotional quality ensures they experience the same contemplative atmosphere as sighted seekers. The portal should be equitable in spirit, not just in function.
- **ARIA labels are the portal's voice for blind seekers.** The warm cream and gold accents do nothing for a screen reader user. The spoken language is their entire aesthetic.
- **Low implementation cost, high experiential impact.** Changing ARIA labels from standard to warm is a string-level change. No architecture, no new components — just better words in the same places.
- **Consistent with FTR-054.** If UI copy is ministry (FTR-054), then ARIA labels — which *are* UI copy, spoken aloud — are ministry too.

### Consequences

- All ARIA labels reviewed and rewritten to "spoken warmth" standard during Milestone 2a
- Screen reader testing added to Milestone 2a CI/CD (automated ARIA presence) and a dedicated manual audit (emotional quality)
- `/docs/editorial/ui-copy-guide.md` (FTR-054) extended with a screen reader section: ARIA label conventions, examples, and the "spoken warmth" standard
- No schema changes, no API changes
- Cross-reference: FTR-003 (accessibility foundation), FTR-054 (UI copy standards)


## Notes

Migrated from FTR-053 per FTR-084.
