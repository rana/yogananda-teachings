---
ftr: 41
title: Book Reader
summary: "Chapter reading surface with server-component core, client islands, and contemplative UX"
state: implemented
domain: experience
governed-by: [PRI-01, PRI-03, PRI-05, PRI-07, PRI-08]
depends-on: [FTR-040, FTR-043, FTR-044]
---

# FTR-041: Book Reader

## Rationale


**Phase:** 2 (Presence) — refinements from M2b analysis
**Governing:** PRI-01 (Verbatim Fidelity), PRI-03 (Honoring the Spirit), PRI-07 (Accessibility), PRI-08 (Calm Technology)
**Supersedes:** Reading-related sections scattered across FTR-040 (FTR-040, FTR-040, FTR-040, FTR-040, FTR-040), reading mode definitions in FTR-006 and FTR-052
**Related:** FTR-043 (Accessibility), FTR-044 (Responsive), FTR-034 (Knowledge Graph), FTR-022 (Book Ingestion)

---

### Design Intent

The book reader is where Yogananda's words meet the seeker. Everything else in the portal — search, themes, graph — leads here. This is the destination. The reading surface must honor the text the way a temple honors the deity within it: by disappearing.

The reader has one job: present the teachings with such care that the technology becomes invisible. A passage on a phone in rural Bihar and a passage projected in a Los Angeles satsang hall should both feel like someone handed you the book, opened to exactly the right page.

---

### 1. Architecture

**Server Component core, client islands for behavior.**

```
ChapterReader (Server Component)
  The book. HTML. Zero JavaScript. Paragraphs, verses,
  epigraphs, dialogue, footnotes, attribution, navigation.
  Renders data-paragraph, data-has-thread, content-type
  attributes. This is the foundation — it works without
  JavaScript, on e-ink, in print, everywhere.

Client Islands (hydrate independently):
  ChapterProgress    — Scroll progress, crimson bar
  ReadingImmersion   — Paragraph focus + Zoom Paragraph
  GoldenThread       — Related teachings panel
  ReadingTracker     — Silent journey recorder
  ChapterBookmark    — Toggle bookmark
  ReaderToolbar      — Immerse toggle + Print
  ReaderPreferences  — Font size, line spacing (reader-only)
```

**Zero client-side data fetching.** All content and relations are fetched server-side and rendered as HTML + data attributes. Client islands read from the DOM.

---

### 2. Reading Modes

Three modes, each with a distinct intention. Mutually exclusive.

| Mode | Intention | Trigger | What changes |
|------|-----------|---------|-------------|
| **Normal** | Full interface | Default / Escape | Everything visible |
| **Immerse** | "Just the text" | `i` key, toolbar button | Chrome disappears, text scales to viewport, reading column fills space |
| **Quiet** | "Be with the silence" | Quiet Corner page | Separate page, separate concern |

**Dwell** is orthogonal — it works within both Normal and Immerse modes. It is not a mode; it is a gesture (see section 5).

#### 2.1 Immerse Mode

Merges the former "Focus" and "Presentation" modes into a single gesture. The reader says "I want immersion" and the viewport determines the appropriate scale.

**What disappears:**
- Site header and footer
- Golden Thread panel/sheet
- Bookmark button
- Reader preferences (already set before immersing)
- Chapter progress header (the crimson bar at the top)
- All chrome except: the Immerse exit button and chapter navigation

**What remains:**
- The reading column (text, verses, figures, footnotes)
- Chapter navigation (Previous / Next)
- A single exit button (fixed, bottom-right, minimal)

**Responsive text scaling in Immerse:**

| Viewport | Base font | Use case |
|----------|-----------|----------|
| < 640px | 1.125rem (18px) | Personal reading on phone |
| 640–1024px | 1.375rem (22px) | Tablet at arm's length, small group |
| 1024–1440px | 1.75rem (28px) | Laptop/monitor projected, group reading |
| > 1440px | 2.25rem (36px) | TV via Chromecast, satsang hall |

Line height scales proportionally: `1.8` at phone, `1.9` at tablet, `2.0` at large screens. Reading column expands to `80ch` max in Immerse (vs `65ch` in Normal).

**CSS implementation:**
```css
[data-mode="immerse"] {
  /* Hide chrome */
  .app-header, .app-footer,
  .thread-panel, .thread-sheet, .thread-backdrop,
  .chapter-bookmark-btn, .chapter-progress,
  .reader-prefs-trigger { display: none !important; }

  /* Expand reading column */
  .reader-content { max-inline-size: 80ch; }

  /* Scale text by viewport */
  .chapter-body { font-size: clamp(1.125rem, 2vw + 0.5rem, 2.25rem); }
}
```

**Keyboard:** `i` to toggle. `Escape` to exit. One button in the toolbar.

**Preference persistence:** `immerse-mode: boolean` in localStorage (replaces `focus-mode`).

**Future:** `data-mode="cast"` from FTR-044 becomes unnecessary. Immerse *is* the cast mode at wider viewports.

---

### 3. Reader Toolbar

Replaces the former `ReadingModes` dual-button pill. A minimal fixed-position toolbar in the bottom-right corner.

**Buttons (left to right):**

| Button | Icon | Shortcut | Action |
|--------|------|----------|--------|
| **Immerse** | Eye (open/closed) | `i` | Toggle immerse mode |
| **Print** | Printer | `Ctrl+P` / `Cmd+P` | Enter print mode (browser print dialog) |

**Behavior:**
- Fixed position, bottom-right (`inset-block-end: var(--space-default); inset-inline-end: var(--space-default)`)
- Fades to 30% opacity when idle, full opacity on hover/focus-within
- 44x44px touch targets (WCAG 2.5.8)
- Hidden on screens < 640px (keyboard shortcuts are the primary interface on mobile)
- Hidden in print (`@media print`)
- Remains visible in Immerse mode (it's the exit handle)

**Print button behavior:**
- Triggers `window.print()` — the browser's native print dialog
- Print stylesheet (`@media print`) handles the rest: hides all chrome, expands reading column, uses system serif stack, includes `.print-citation` (author, book, chapter, page), suppresses decorative elements
- No custom "print mode" UI — the browser's print preview *is* the print mode

---

### 4. Chapter Progress — Crimson Bar

**Replaces the gold progress bar.** The current `ChapterProgress` component uses `var(--color-gold)` at 50% opacity. The new design uses a crimson accent that is distinct from the gold used for golden thread indicators, bookmarks, and decorative elements.

**Crimson rationale:** Gold is the language of the sacred in this design system — it marks golden thread connections, bookmarks, decorative motifs. Progress is not sacred; it is functional. Crimson (a warm, deep red) provides clear visual separation: gold means "the teachings are connected here," crimson means "you are here in the chapter." The crimson also echoes the traditional color of sacred bookmarks in Indian manuscript traditions.

**Design token:** `--color-progress: #8B2252` (deep crimson, accessible against both light and dark surfaces).

**Bar behavior:**
- 2px height, positioned at the very top of the viewport (above site header)
- Tracks scroll position through the chapter
- Appears only after the reader scrolls past the chapter header
- The sticky chapter info bar (book title / chapter number) appears below the site header; the crimson progress bar sits at the absolute top edge
- Smooth transition (`inline-size 100ms linear`)
- Hidden in Immerse mode and print

**Accessibility:** `aria-hidden="true"` — the progress bar is decorative enhancement, not information. Screen readers announce chapter structure via headings.

---

### 5. Paragraph Focus and Zoom Paragraph

Two levels of paragraph interaction. **Focus** is light; **Zoom** is deep.

#### 5.1 Paragraph Focus

When a paragraph receives the reader's attention — via hover (desktop), tap, or keyboard navigation (j/k) — it shows a subtle visual indicator.

**Visual treatment:**
- **Left bar:** A 3px rounded vertical accent on the paragraph's inline-start edge. `border-radius: 2px`. Color: `color-mix(in srgb, var(--color-gold) 25%, transparent)`. This replaces the current `box-shadow: inset 3px 0 0` approach with a cleaner pseudo-element.
- **Background:** Subtle warm tint: `color-mix(in srgb, var(--color-gold) 4%, transparent)`. Barely there. A whisper of warmth.
- **Border radius:** `border-radius: var(--radius-small)` on the paragraph container.
- **Transition:** 300ms ease for all properties. Instant if `prefers-reduced-motion`.

**Trigger:**
- **Desktop:** Hover shows background warmth. Click shows left bar + background.
- **Mobile:** Tap shows left bar + background.
- **Keyboard:** `j`/`k` navigation shows left bar + background + `outline` for keyboard users.

**Data attributes:**
- `[data-paragraph].focused` — paragraph has reader's attention
- `[data-paragraph].kb-focus` — paragraph reached via keyboard (shows outline ring too)

#### 5.2 Zoom Paragraph

**Replaces "Dwell mode."** When a reader wants to contemplate a single paragraph deeply, they can zoom it — the paragraph comes forward, everything else recedes.

This is the book reader's version of what Quiet Corner does for affirmations: a moment of stillness with a single passage. But here it lives within the reading flow, not on a separate page.

**Activation:**
- **Double-click** on a focused paragraph (desktop)
- **Long-press** on a focused paragraph (mobile, 500ms threshold)
- **Zoom icon** — a small icon appears in the top-right corner of a focused paragraph. Click/tap to zoom. Icon: a simple expand/magnify glyph, 14x14px, `color-mix(in srgb, var(--color-text) 40%, transparent)`, fades in 200ms after paragraph focus.

**Visual treatment when zoomed:**
- All other paragraphs dim to 15% opacity (600ms transition)
- Zoomed paragraph: full opacity, slight scale (`transform: scale(1.02)` — barely perceptible, more felt than seen)
- Background warms: `color-mix(in srgb, var(--color-gold) 8%, transparent)`
- Left bar intensifies: gold at 55% opacity
- If paragraph has golden thread connections (`[data-has-thread]`): the "Related teachings" indicator appears below the paragraph (existing thread-indicator behavior)

**Exit:**
- Click/tap the zoomed paragraph again
- Click/tap outside any paragraph
- `Escape` key
- Scroll (any scroll event exits zoom — the reader is moving on)

**Data attributes:**
- `[data-zoom-active]` on `<article>` — zoom mode is active
- `[data-zoom-target]` on the zoomed `<p>` — this is the focused paragraph

**Contemplatio decay:** When a paragraph is zoomed and the reader remains inactive for 45 seconds, the text contrast gradually fades — a contemplative transition from reading to internal silence. See FTR-163 § "Contemplatio decay" for full specification. This supports the *Svadhyaya* practice of returning to the same text repeatedly, where the text remains static but the reader's changing internal state interacts with it differently over time.

**Reading Map integration:** When zoom activates, the ReadingTracker records the passage snippet and timestamp in localStorage for the Personal Reading Map (FTR-166 § "Passages You Lingered With"). This is a side-effect of the existing zoom activation — no additional user gesture required.

**Interaction with Immerse mode:** Zoom works within Immerse. The text is already scaled up; zoom adds the dimming and contemplative stillness. In a satsang, someone might immerse for group reading, then zoom a particular verse for discussion.

**Interaction with Golden Thread:** When a paragraph is zoomed and has connections, the thread indicator appears. Clicking it opens the Golden Thread panel (which re-appears even in Immerse mode for this interaction, then hides again on zoom exit).

**Haptic feedback:** `navigator.vibrate(10)` on zoom activation (10ms pulse). Respects `prefers-reduced-motion`.

---

### 6. Reader Preferences

**Book reader-only settings.** Font size and line spacing are reading preferences, not global design preferences. They affect only the chapter reading surface — not search results, not the homepage, not theme pages.

#### 6.1 Preference Scope

| Preference | Scope | Stored in |
|-----------|-------|-----------|
| Color theme | Global (all pages) | `yogananda-design` localStorage |
| Font size | Book reader only | `srf-reader-prefs` localStorage |
| Line spacing | Book reader only | `srf-reader-prefs` localStorage |
| Immerse mode | Book reader only | `srf-reader-prefs` localStorage |
| Text-only mode | Global (all pages) | `srf-reader-prefs` localStorage |
| Reading language | Global (all pages) | `srf-reader-prefs` localStorage |

**Font size and line spacing CSS** apply only within `.chapter-body` (the reading column), not globally. This means:
- The reader settings gear icon appears only on chapter pages
- Font size "large" / "larger" scale chapter text, not navigation or UI
- Line spacing "relaxed" / "spacious" affect paragraph line height, not page layout

#### 6.2 Font Size Scale

| Setting | Size | Use case |
|---------|------|----------|
| Default | 1rem (base) | Standard reading distance |
| Large | 1.125rem | Slight enlargement, accessibility |
| Larger | 1.25rem | Significant enlargement, low vision |

In Immerse mode, font sizes stack with the viewport-responsive scaling (section 2.1). A reader who sets "larger" and then enters Immerse on a TV gets the maximum comfortable reading size.

#### 6.3 Line Spacing Scale

| Setting | Line height | Purpose |
|---------|-------------|---------|
| Default | 1.8 | Standard reading |
| Relaxed | 2.0 | More breathing room between lines |
| Spacious | 2.2 | Maximum openness, dyslexia-friendly |

#### 6.4 Reader Preferences UI

A gear icon positioned above the Immerse/Print toolbar (bottom-right stack). Opens a compact popover with:
- Font size: three radio buttons (Aa small, Aa medium, Aa large)
- Line spacing: three radio buttons (narrow, medium, wide — using line icons)
- No labels needed — the visual indicators are self-explanatory
- Changes apply immediately (no "save" button)
- Popover closes on outside click or Escape

**Appears only on chapter pages.** The gear icon is rendered by the chapter page layout, not the global layout.

---

### 7. Typography

The reading surface uses content-type-aware typography. The `ChapterReader` Server Component marks each block with its content type.

| Content type | Font | Weight | Style | Notes |
|-------------|------|--------|-------|-------|
| `prose` | Merriweather | 400 | normal | Body text. Drop cap on first paragraph of chapter. |
| `verse` | Lora | 400 | italic | Poems, chants. Indented. Extra block spacing. |
| `epigraph` | Lora | 400 | italic | Chapter opening quotes. Centered. Smaller. |
| `dialogue` | Merriweather | 400 | normal | Conversations. Em-dash prefix. |
| `caption` | Open Sans | 400 | normal | Figure captions. Smaller, muted. |

**Hindi reading:** Noto Serif Devanagari at 20px / 1.9 line height (FTR-131). Hindi body text is larger than Latin because Devanagari requires more vertical space for legibility at equivalent perceived size.

**Drop caps:** Implemented via `RichText` component (not CSS `::first-letter`, which has cross-browser issues). First letter extracted, wrapped in `<span class="drop-cap">`, styled with Lora at 3.2em.

**Scene breaks:** `<hr class="reader-scene-break">` between sections. Styled as a subtle centered ornament (three dots or a small lotus motif, depending on theme).

---

### 8. Golden Thread Integration

The right-side panel (desktop) / bottom sheet (mobile) displays passages from *other books* that are semantically related to the paragraph the reader is currently engaging with.

**Activation:** When a paragraph is focused (section 5.1) or zoomed (section 5.2) and has `[data-has-thread]`, the golden thread panel updates to show related passages.

**Desktop:** Panel slides in from the right, max 360px wide. Contains: related passage text, attribution (book, chapter, page), similarity indicator.

**Mobile:** Bottom sheet, max 50vh. Swipe down or tap backdrop to dismiss.

**In Immerse mode:** Hidden by default. Re-appears when a zoomed paragraph's thread indicator is clicked, then hides again on zoom exit.

**No client-side fetching.** All relation data is pre-fetched server-side and embedded as JSON in a `<script type="application/json">` block. The GoldenThread client component reads from the DOM.

---

### 9. Chapter Navigation

**Previous / Next chapter links** at the bottom of every chapter. Server-rendered. No JavaScript.

**Design:**
- Horizontal layout at > 640px: Previous (left), Next (right)
- Stacked layout at < 640px: Next on top (primary action), Previous below
- Each link shows: direction arrow, "Chapter N", chapter title
- Subtle border top separator
- Full-width touch targets on mobile

**"Breath Between Chapters" (FTR-040):** When navigating via these links (not deep links or search), a 1.2-second transitional moment shows only the chapter title (Lora 400, centered, fading in). Then the chapter text fades in over 400ms. Skipped for `prefers-reduced-motion`, deep links, and search result arrivals.

---

### 10. Bookmarks

**Chapter-level bookmarks** via the ChapterBookmark button. Toggle on/off. Stored in localStorage. Gold fill when active.

**Position:** Fixed, bottom-right, stacked above the Reader Toolbar.

**Hidden in:** Immerse mode, print.

**Bookmarks page** (`/[locale]/bookmarks`) lists all bookmarked chapters with book title, chapter number/title, and a link to resume reading.

---

### 11. Reading Progress

Two layers of progress tracking, both localStorage-only (DELTA-compliant).

**11.1 Reading Tracker** — Records the last-read position:
- Book, chapter, and topmost visible paragraph
- Scroll position (for restoration on return)
- Updated on 2-second debounced scroll events
- Powers the "Continue Reading" card on the homepage

**11.2 Chapter Progress (visual)** — The crimson bar (section 4):
- Scroll percentage through the chapter
- Appears after scrolling past the chapter header
- Pure visual indicator, no persistence

**11.3 Visited Chapters** — Per-book chapter visit tracking:
- Marks chapter as visited on page load
- Gold checkmark on the book's table of contents page
- **No linear progress metrics.** The reader never displays "54% completed," "12 minutes left," "X of Y chapters read" as progress bars, percentage indicators, or time-remaining estimates. These metrics impose a linear, completionist mindset fundamentally hostile to contemplative re-reading, which is cyclical and infinite (deep-research-gemini-sacred-reading.md § 6). Visited chapter checkmarks on the TOC page are acceptable — they show *where you've been*, not *how far you have to go*. The distinction is between spatial memory aid (checkmarks) and industrial completion metric (progress bars).

---

### 12. Print

Print is a first-class reading mode. Seekers print passages — this is an act of devotion, not edge-case usage (FTR-043).

**Print stylesheet (`@media print`):**
- Hide: site header/footer, reader toolbar, bookmark button, progress bar, golden thread panel, preferences gear, reading modes, all interactive elements
- Expand: reading column to full page width with generous margins
- Typography: system serif stack (for reliable rendering), black on white
- Include: `.print-citation` block at the bottom — author, book title, chapter, page reference, portal URL
- Ornament: scene breaks render as three centered dots (no SVG motifs)
- Figures: include with captions, constrained to page width
- Footnotes: rendered at bottom of content (already in correct position)
- `@page` margin rules for comfortable printed margins

**The Print button in the toolbar** calls `window.print()`. The browser's print preview is the print mode — no custom UI needed.

---

### 13. Keyboard Shortcuts

| Key | Action | Context |
|-----|--------|---------|
| `j` | Next paragraph (focus) | Reading |
| `k` | Previous paragraph (focus) | Reading |
| `Enter` or `Space` | Zoom focused paragraph | When paragraph is focused |
| `i` | Toggle Immerse mode | Reading |
| `Escape` | Exit zoom / Exit immerse / Close panel | Context-dependent |
| `?` | Keyboard help overlay | Global |
| `Ctrl+P` / `Cmd+P` | Print | Browser default, enhanced by print stylesheet |

**Enter/Space for zoom:** When a paragraph has keyboard focus (via j/k), pressing Enter or Space activates zoom on that paragraph. This replaces the former `d` for dwell, aligning with standard keyboard interaction patterns (Enter = activate).

**No shortcuts intercepted during text input** (input, textarea, select elements).

---

### 14. Accessibility

| Requirement | Implementation |
|-------------|---------------|
| Screen reader structure | `<article>` with `role="doc-chapter"`, `<h1>` for chapter title, `<section>` for content groups, footnotes with `role="doc-endnotes"` |
| Paragraph navigation | j/k announced via live region: "Paragraph N of M" |
| Zoom announcement | "Zoomed paragraph N" / "Exited zoom" via live region |
| Immerse announcement | "Immerse mode active" / "Normal mode" via live region |
| Touch targets | All buttons 44x44px minimum |
| Reduced motion | All transitions instant when `prefers-reduced-motion: reduce` |
| Forced colors | All interactive elements visible in Windows High Contrast |
| E-ink | Reading surface legible on Kindle Experimental / BOOX (no color dependencies) |
| Print | Full chapter printable with attribution (section 12) |
| Language | `<article lang="...">` for correct `:lang()` CSS and screen reader pronunciation |

---

### 15. Responsive Behavior

| Viewport | Layout | Notes |
|----------|--------|-------|
| < 640px | Single column, full width, touch-primary | No hover effects. Zoom via long-press. No toolbar (keyboard shortcuts only). |
| 640–1024px | Single column, generous margins | Toolbar visible. Golden thread as bottom sheet. |
| 1024–1440px | Reading column + golden thread side panel | Desktop hover effects. Full keyboard navigation. |
| > 1440px | Centered reading column, side panel | Maximum whitespace. Immerse mode for satsang projection. |

**Orientation on tablet:**
- Portrait: single column with wider margins
- Landscape: optional two-column (chapter left, golden thread right) — opt-in via reader settings

---

### 16. Component Inventory

| Component | Type | File | Purpose |
|-----------|------|------|---------|
| ChapterReader | Server | `app/components/reading/ChapterReader.tsx` | Render chapter HTML |
| ChapterNav | Server | `app/components/reading/ChapterNav.tsx` | Previous/next links |
| FootnoteList | Server | `app/components/reading/FootnoteList.tsx` | Footnotes with DPUB-ARIA |
| Attribution | Server | `app/components/reading/Attribution.tsx` | Author/book credit |
| RichText | Server | `app/components/RichText.tsx` | Formatted paragraph text |
| ChapterProgress | Client | `app/components/design/ChapterProgress.tsx` | Crimson progress bar |
| ReadingImmersion | Client | `app/components/design/ReadingImmersion.tsx` | Focus + Zoom Paragraph |
| GoldenThread | Client | `app/components/design/GoldenThread.tsx` | Related teachings panel |
| ReadingTracker | Client | `app/components/design/ReadingTracker.tsx` | Journey recorder |
| ChapterBookmark | Client | `app/components/design/ChapterBookmark.tsx` | Bookmark toggle |
| ReaderToolbar | Client | `app/components/design/ReaderToolbar.tsx` | Immerse + Print buttons |
| ReaderPreferences | Client | `app/components/design/ReaderPreferences.tsx` | Font size + line spacing |

---

### 17. Data Attributes Reference

| Attribute | Element | Meaning |
|-----------|---------|---------|
| `data-paragraph="N"` | `<p>` | Paragraph index (0-based, chapter-global) |
| `data-has-thread` | `<p>` | Paragraph has golden thread connections |
| `data-thread-active` | `<p>` | Golden thread panel is showing this paragraph's connections |
| `data-zoom-active` | `<article>` | A paragraph is currently zoomed |
| `data-zoom-target` | `<p>` | This paragraph is the zoom target |
| `data-mode="immerse"` | `<html>` | Immerse mode active |
| `data-mode="quiet"` | `<html>` | Quiet Corner active (separate page) |
| `data-register="sacred"` | `<article>` | Reading surface register (design system) |
| `.focused` | `<p>` | Paragraph has reader's attention |
| `.kb-focus` | `<p>` | Paragraph reached via keyboard navigation |

---

### 18. Migration from Current Implementation

| Current | New | Change |
|---------|-----|--------|
| `data-mode="focus"` | `data-mode="immerse"` | CSS selectors updated |
| `data-mode="present"` | `data-mode="immerse"` | Merged into immerse |
| `data-dwell-active` | `data-zoom-active` | Renamed for clarity |
| `data-dwell-target` | `data-zoom-target` | Renamed for clarity |
| `focus-mode` (localStorage) | `immerse-mode` (localStorage) | Key renamed |
| ReadingModes (2 buttons) | ReaderToolbar (immerse + print) | Component replaced |
| Gold progress bar | Crimson progress bar | Color changed |
| Click to dwell | Double-click/long-press/icon to zoom | Activation changed |
| Dwell exits on click-outside only | Zoom exits on scroll too | More natural exit |
| Font size in global prefs | Font size in reader prefs | Scope narrowed |
| Line spacing in global prefs | Line spacing in reader prefs | Scope narrowed |
| `f` / `p` keyboard shortcuts | `i` keyboard shortcut | Simplified |
| `d` for dwell | `Enter`/`Space` on focused paragraph | Standard pattern |

---

### 19. Open Design Question: Contemplative Arrival

The portal currently presents chapter text immediately on page load — standard web behavior, aligned with FCP < 1.5s performance budgets. However, research across contemplative traditions (Lectio Divina, Svadhyaya, Tadabbur) consistently finds that **reader internal state affects comprehension** and that sacred reading requires a transition from screen-scrolling mode to contemplative mode before the text can do its work (deep-research-claude-sacred-reading.md § 2).

Lectio Divina apps implement this as a "still-yourself timer" before text appears. The Lectio Divina Journal introduces a centering exercise. Pray As You Go uses musical bridges. The portal's Breath Between Chapters (section 9) provides a between-chapters transition but no *entering-the-book* transition.

**The tension:** "fastest possible rendering" vs. "create space for the reader to arrive." Both are principled positions. The research argues that contemplative reading requires arrival; web convention argues that content should never be delayed.

**Possible resolution:** An opt-in "Contemplative entry" reader preference. When enabled, chapter pages show a brief threshold moment — perhaps a verse, an invocation, or simply a breathing prompt — before the text appears. Dismissed instantly on any interaction. Disabled by default. Stored in `srf-reader-prefs` localStorage. This preserves performance-first default while offering the contemplative transition for readers who want it.

**Decision deferred** to Milestone 3a boundary. See CONTEXT.md § Open Questions.

---

### Cross-References

- **FTR-006** § 5 (Presentation mode) — absorbed into Immerse (section 2.1)
- **FTR-052** § 3 (Simplified reading mode / Focus) — absorbed into Immerse (section 2.1)
- **FTR-040** § FTR-040 (Dwell) — replaced by Zoom Paragraph (section 5.2)
- **FTR-040** § FTR-040 (Breath Between Chapters) — preserved (section 9)
- **FTR-040** § FTR-040 (Keyboard Navigation) — refined (section 13)
- **FTR-043** (Accessibility) — reader-specific requirements consolidated (section 14)
- **FTR-044** (Responsive) — reader breakpoints consolidated (section 15)
- **FTR-012** — Crimson color, font scales, timing values are named constants in `/lib/config.ts`

## Notes

Migrated from FTR-041 per FTR-084.
