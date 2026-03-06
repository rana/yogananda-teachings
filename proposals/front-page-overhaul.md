# Proposal: Front Page Overhaul

**Date:** 2026-03-06
**Status:** Proposed
**Governs:** app/[locale]/page.tsx, messages/en.json, messages/es.json, app/globals.css
**Principles:** PRI-01, PRI-02, PRI-03, PRI-05, PRI-07, PRI-08
**Design Language:** sacred register, publication voice, functional register, attention gradient, prāṇa spacing

---

## Problem Statement

The current front page is architecturally sound (Server Component, zero JS for content, bindu concept) but visually underperforms the design language available to it. Specific gaps:

1. **No human presence.** Yogananda's face — the most recognized image in modern yoga — is absent. The page feels like a text interface, not a threshold to a person's teachings.
2. **Search is buried.** Below a passage and lotus divider, mixed with thematic doors. Returning devotees who come to *find* something must scroll past content to reach the primary tool.
3. **Uniform rhythm.** Every section is centered text at the same width. The design language specifies prāṇa (variable breathing rhythm) but the page is metronomic.
4. **"Start Here" is generic.** Three web-app-style cards that sort visitors into personas. Doesn't leverage the design language's register system or the existing poetic "seeking" copy.
5. **The book is invisible.** The iconic *Autobiography of a Yogi* cover (already in the repo, optimized) doesn't appear on the portal's front door.

## Vision

**A front page that feels like walking into a temple library — not a homepage, a threshold.** The visitor sees a face, receives words, and finds their way. Technology disappears. The teachings shine.

## Proposed Composition

### Section I: The Bindu (above fold)

Desktop: **sidebar-layout** — book cover floats left, passage floats right.

| Element | Treatment |
|---------|-----------|
| Book cover image | `/book-images/covers/autobiography-of-a-yogi.webp` (240px wide, 15KB). Desktop: ~200px height, left column. Mobile: centered, 120px height. `alt="Autobiography of a Yogi by Paramahansa Yogananda"`. `fetchpriority="high"` (above fold). Links to `/books`. |
| Passage blockquote | Sacred register. Merriweather 400, 18px, 1.8 line-height. Gold subliminal (0.06) background on hover via existing `reader-epigraph` class. Full attribution: author, book title, chapter number. |
| "Read in chapter" | Text link, functional register. Links to chapter position. |
| "Show me another" | `btn-ghost`. Same ShowAnother client component. |

No lotus divider above. No section heading ("Today's Wisdom" removed — the passage speaks for itself). The book cover provides the visual anchor that the welcome lotus currently serves, but with immeasurably more emotional weight.

**On mobile:** Book cover centered (120px height) → passage below → action links below passage. Clean vertical stack.

**Locale handling:** Spanish locale shows the Spanish book cover (`autobiografia-de-un-yogui.webp`). Passage is already locale-aware via `getDailyPassage`.

### Section II: Search + Thematic Doors

A single search input, centered, max-width 28em (unchanged). Below it, thematic door pills (unchanged).

| Element | Change |
|---------|--------|
| Search placeholder | **"What are you seeking?"** (en) / **"¿Qué estás buscando?"** (es) — replaces "peace, courage, healing, love..." |
| Search button | Retained for accessibility. Restyled: `btn-ghost` with "Search" text (not removed). |
| Thematic door pills | Unchanged. "Doors of Entry" heading **removed** — pills are self-evident. |

**Spacing:** `--space-expansive` (48px) gap above this section (prāṇa: release after the held passage). `--space-default` (16px) between input and pills.

### Section III: The Seeking Lines

Replaces "Start Here." Uses existing copy from `messages/en.json` key `home.seeking`:

> **These teachings are here...**
>
> for when the world is too much
> for the questions that won't quiet
> for learning to be still
> for what you felt but couldn't name

**Treatment:**
- Heading ("These teachings are here...") in Lora display, `font-variant: small-caps`, `letter-spacing: 0.05em`. Secondary text color.
- Each line is a `<a>` link to a thematic search query. Merriweather (reading typeface), 16px, `line-height: 2.2` (generous vertical rhythm between lines). Default text color. Gold underline on hover (`text-decoration-color: var(--color-gold)`).
- Register: **reverential** — not the sacred register of the passage, but the librarian's warm invitation. Between sacred and instructional.
- Centered text, max-width 24em (narrower than passage — creates visual narrowing, drawing the eye inward).
- `<nav aria-label="Explore by theme">`

**Search queries for each line:**
| Line | Query |
|------|-------|
| "for when the world is too much" | `comfort peace solace strength` |
| "for the questions that won't quiet" | `meaning purpose truth why` |
| "for learning to be still" | `meditation stillness calm mind` |
| "for what you felt but couldn't name" | `soul consciousness divine experience` |

**Spacing:** `--space-vast` (64px) above (prāṇa: major breath between navigation and contemplation). `--space-spacious` (32px) below.

### Section IV: The Book

Minimal, confident presentation of the single available book. Pure typography — no card, no border, no image (cover already shown in bindu above).

```
                Autobiography of a Yogi
                Paramahansa Yogananda

              49 chapters · Freely available

                   [Begin reading]
```

**Treatment:**
- Title in Lora display 700, `color: var(--color-crimson)` (publication voice).
- Author in Merriweather, secondary text color.
- "49 chapters · Freely available" in Open Sans, small, tertiary color. Chapter count is dynamic (from `getChapters()` service, already used on books page).
- "Begin reading" as a text link (functional register).
- Centered, max-width 28em.
- `<section aria-label="Featured book">`
- Links to `/${locale}/books` (or directly to first chapter — user's choice).

**Evolution path:** When additional books are added, this section becomes "The Library" with a horizontal scroll or 2-column grid. The structure supports growth without redesign.

### Section V: Practice Bridge + Continue Reading

Unchanged from current implementation.

- Practice Bridge: `.signpost` class, instructional register.
- Continue Reading: `ContinueReading` client component, appears only for returning visitors.

### Section VI: Closing Motif

Single lotus (`lotus-03`, sacred voice, `role="close"`) at the bottom of the page. Replaces the current two-lotus structure (welcome + divider).

## What's Removed

| Element | Reason |
|---------|--------|
| Welcome lotus (top) | Book cover provides the visual threshold |
| Lotus divider (between passage and search) | Spatial breathing replaces decoration |
| "Today's Wisdom" heading | The passage speaks for itself; labeling it reduces its power |
| "Doors of Entry" heading | Pills are self-evident navigation |
| "Start Here" section (3-card grid) | Replaced by seeking lines + book presentation — more honest, more beautiful |

## What's Added

| Element | Weight |
|---------|--------|
| Book cover image (above fold) | +15KB (already optimized WebP in repo) |
| "Seeking" lines section | 0KB (existing messages, HTML only) |
| Book presentation section | 0KB (HTML + existing service data) |
| Updated search placeholder | 0KB (string change) |

**Net page weight change:** +15KB image. Total initial payload remains well under 50KB (PRI-05).

## Wireframes

### Desktop (>640px)

```
┌──────────────────────────────────────────────────┐
│  Teachings                    Books  Search  ⚙   │
├──────────────────────────────────────────────────┤
│                                                  │
│                 48px breathing                    │
│                                                  │
│   ┌──────────┐    "The season of failure is      │
│   │          │     the best time for sowing      │
│   │   Book   │     the seeds of success."        │
│   │   Cover  │                                   │
│   │  (200px) │     — Paramahansa Yogananda       │
│   │          │       Autobiography of a Yogi     │
│   │          │       Chapter 12                  │
│   └──────────┘                                   │
│                    Read in chapter                │
│                    Show me another                │
│                                                  │
│                 48px breathing                    │
│                                                  │
│          ┌─────────────────────────┐             │
│          │ What are you seeking? 🔍│             │
│          └─────────────────────────┘             │
│                                                  │
│          Inner Peace · Love · Happiness          │
│          Purpose · Healing · Courage             │
│                                                  │
│                 64px breathing                    │
│                                                  │
│            These teachings are here…             │
│                                                  │
│        for when the world is too much            │
│        for the questions that won't quiet        │
│        for learning to be still                  │
│        for what you felt but couldn't name       │
│                                                  │
│                 32px breathing                    │
│                                                  │
│            Autobiography of a Yogi               │
│            Paramahansa Yogananda                 │
│         49 chapters · Freely available           │
│               Begin reading                      │
│                                                  │
│                 32px breathing                    │
│                                                  │
│      Interested in meditation? SRF Lessons       │
│                                                  │
│        Continue where you left off →             │
│                                                  │
│                    🪷                             │
│                                                  │
│  Teachings of Paramahansa Yogananda · SRF        │
│           Legal · Privacy · Integrity            │
└──────────────────────────────────────────────────┘
```

### Mobile (<640px)

```
┌──────────────────────┐
│ Teachings    Bks 🔍 ⚙│
├──────────────────────┤
│                      │
│     ┌──────────┐     │
│     │  Cover   │     │
│     │  120px   │     │
│     └──────────┘     │
│                      │
│  "The season of      │
│   failure is the     │
│   best time for      │
│   sowing the seeds   │
│   of success."       │
│                      │
│   — Yogananda        │
│     Chapter 12       │
│                      │
│   Read · Another     │
│                      │
│  ┌────────────────┐  │
│  │ Seeking?    🔍  │  │
│  └────────────────┘  │
│                      │
│  Inner Peace · Love  │
│  Happiness · Purpose │
│  Healing · Courage   │
│                      │
│  These teachings     │
│  are here…           │
│                      │
│  for when the world  │
│  is too much         │
│                      │
│  for the questions   │
│  that won't quiet    │
│                      │
│  for learning to     │
│  be still            │
│                      │
│  for what you felt   │
│  but couldn't name   │
│                      │
│  ─────────────────   │
│                      │
│  Autobiography of    │
│  a Yogi              │
│  Paramahansa         │
│  Yogananda           │
│  49 chapters · Free  │
│  Begin reading       │
│                      │
│  Meditation?         │
│  SRF Lessons         │
│                      │
│  Continue reading →  │
│                      │
│       🪷              │
│  Teachings · SRF     │
│  Legal · Privacy     │
└──────────────────────┘
```

## Accessibility

| Concern | Resolution |
|---------|-----------|
| Book cover `alt` text | "Autobiography of a Yogi by Paramahansa Yogananda" (en) / "Autobiografía de un Yogui por Paramahansa Yogananda" (es) |
| Search submit | Visible `btn-ghost` button retained. `aria-label` on form. |
| Seeking lines as links | Each `<a>` wraps the full line text. Touch target: full line width, minimum 44px height via `line-height: 2.2` at 16px = ~35px... **needs padding.** Add `padding-block: 4px` to reach 44px. |
| Section landmarks | `<section aria-label="Today's teaching">`, `<nav aria-label="Explore by theme">`, `<section aria-label="Featured book">` |
| Screen reader narrative | Portrait alt → passage → attribution → search → thematic links → seeking lines → book → practice bridge. Logical reading order. |
| `prefers-reduced-motion` | Arrival transition respects existing `--motion-*` tokens. No new motion added. |
| Keyboard | Tab order follows visual order. All interactive elements are standard HTML (`<a>`, `<input>`, `<button>`). |

## Implementation Notes

**Files to modify:**
- `app/[locale]/page.tsx` — Restructure sections, add book cover, add seeking lines, remove Start Here
- `messages/en.json` — Update search placeholder. Seeking lines already exist (`home.seeking`). Add book presentation strings.
- `messages/es.json` — Parallel updates.
- `app/globals.css` — Minor: seeking-line link styles, book-presentation typography. Most styling comes from existing design system classes.

**Files unchanged:**
- `app/components/ShowAnother.tsx` — Same component, same API
- `app/components/ContinueReading.tsx` — Same component
- `app/components/design/Motif.tsx` — Same component (used once now instead of twice)
- `app/[locale]/layout.tsx` — Header/footer unchanged
- `lib/services/` — No business logic changes
- `lib/db.ts`, `lib/config.ts` — No changes

**New dependencies:** None.
**New components:** None.
**New API routes:** None.
**New JavaScript:** Zero. Book cover is an `<img>` tag. Seeking lines are `<a>` tags.

**Estimated scope:** Small-medium. ~2 hours implementation. One page file, two message files, minor CSS additions.

## Questions You'd Benefit from Asking

1. **The Yogananda portrait photo.** The book cover (already in repo) includes his iconic portrait and is safe to use. But: do you want to pursue getting a standalone portrait photo from SRF? The Google Photos album is noted in MEMORY.md. A standalone portrait (without the book title overlay) would be more powerful as a hero element. The book cover works well as a sidebar element but a clean portrait would transform the threshold experience.

2. **The seeking lines — are these the right four?** The existing copy is beautiful. But is there a fifth line for devotees who already practice? Something like "for deepening what you already know"? The current four speak to newcomers and seekers; the returning devotee's entry point is the search bar and Continue Reading, but there's no poetic acknowledgment of their journey.

3. **Should search be in the sticky header?** The proposal keeps search on the page. But many world-class portals (Spotify, Apple Music, Arc) put search in the persistent header so it's always one tap away. This would change the header from `Teachings | Books | Search | Settings` to `Teachings | Books | 🔍 | Settings` with an expandable search input. This is a larger change (touches layout.tsx) but would serve the "returning devotee" use case powerfully.

4. **The circadian modifier.** The design language has a circadian temperature system. Should the front page passage selection be time-aware? A 2 AM visitor might benefit from passages about peace and comfort rather than energetic action. This is a deeper feature (touches `getDailyPassage` service logic) but the front page is where it would matter most.

5. **What you're not asking: the emotional arc.** The proposed page tells a story: *encounter* (face + words) → *search* (what are you seeking?) → *resonance* (these teachings are here for...) → *orientation* (the book) → *practice* (the bridge). This is a funnel without being a funnel — it's a spiritual journey in miniature. Is this the right arc? Or should the page be even simpler — just the passage and the search, with everything else on secondary pages?

6. **What you're not asking: the empty state.** What does this page look like before any books are ingested? During a database outage? The current fallback ("The teachings await you.") is good but the book cover and book section would need graceful absence handling.

7. **What you're not asking: social sharing previews.** When someone shares the portal URL on WhatsApp or Twitter, what image appears? Currently: none (no og:image). The book cover or Yogananda portrait would make link previews dramatically more compelling. This is a metadata change in layout.tsx, not a page redesign, but the front page overhaul is the natural moment to add it.
