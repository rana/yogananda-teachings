# Front Page Overhaul — Implementation Workflow

**Proposal:** `proposals/front-page-overhaul.md`
**Estimated time:** 3 prompts + 1 verify, ~30 min total
**Prerequisites:** None. All assets already exist in the repo.

---

## Before you start

Run the dev server so you can review each step visually:

```bash
npm run dev
```

Open `http://localhost:3000` in a browser tab. Refresh after each step.

---

## Step 1: Update message strings

**What it does:** Updates en.json and es.json with new search placeholder, seeking line queries, and book presentation strings. Removes unused keys.

**Review after:** Check that `npm run build` still passes (string keys must match usage).

### Prompt

```
Read `proposals/front-page-overhaul.md` for full context.

Update message files for the front page overhaul. Both `messages/en.json` and `messages/es.json`:

1. Change `home.searchPrompt` to "What are you seeking?" (en) / "¿Qué estás buscando?" (es)

2. The `home.seeking` keys already exist. Add a `query` field next to each line for use as search hrefs:
   - comfort: query "comfort peace solace strength"
   - meaning: query "meaning purpose truth why"
   - practice: query "meditation stillness calm mind"
   - curiosity: query "soul consciousness divine experience"

   Actually — message files shouldn't contain query strings. Leave `home.seeking` as-is. The queries will be defined in page.tsx alongside the THEMATIC_DOORS pattern.

3. Add new keys under `home`:
   - `home.bookPresentation.chapters`: "{count, plural, one {# chapter} other {# chapters}}"
   - `home.bookPresentation.free`: "Freely available"
   - `home.bookPresentation.begin`: "Begin reading"
   - `home.bookPresentation.coverAlt`: "Autobiography of a Yogi by Paramahansa Yogananda"

   Spanish equivalents:
   - `home.bookPresentation.chapters`: "{count, plural, one {# capítulo} other {# capítulos}}"
   - `home.bookPresentation.free`: "Disponible gratuitamente"
   - `home.bookPresentation.begin`: "Comenzar a leer"
   - `home.bookPresentation.coverAlt`: "Autobiografía de un Yogui por Paramahansa Yogananda"

4. Remove `home.startHere` entirely (heading, curious, need, seeker) — it's replaced by the seeking lines.

5. Remove `home.todaysWisdom` — the passage speaks for itself, no heading needed.

6. Remove `home.thematicDoors.heading` ("Doors of Entry") — pills are self-evident.

Do not change any other keys. Keep all existing keys that aren't explicitly listed for removal.
```

---

## Step 2: Add CSS classes

**What it does:** Adds minimal new styles for the seeking lines section and book presentation. Everything else uses existing design system classes.

**Review after:** No visual change yet (page.tsx hasn't changed). Just confirm the CSS is clean.

### Prompt

```
Read `proposals/front-page-overhaul.md` for full context.

Add new CSS classes to `app/globals.css` in the App Chrome layer (Layer 3) for the front page overhaul. Add these near the existing `.signpost` and `.card` styles:

1. `.seeking-lines` — The poetic wayfinding section:
   - text-align: center
   - max-inline-size: 24em (narrower than passage — draws eye inward)
   - margin-inline: auto

2. `.seeking-lines h2` — The heading "These teachings are here…":
   - font-family: var(--font-display)
   - font-variant: small-caps
   - letter-spacing: 0.05em
   - color: var(--color-text-secondary)
   - font-weight: 400
   - font-size: 1rem
   - margin-block-end: var(--space-generous)

3. `.seeking-lines a` — Each poetic line as a link:
   - display: block
   - font-family: var(--font-reading)
   - font-size: 1rem
   - line-height: 2.2
   - color: var(--color-text)
   - text-decoration: none
   - padding-block: 4px (reaches 44px touch target with line-height)
   - transition: color var(--motion-interaction, 150ms)

4. `.seeking-lines a:hover` — Gold reveal on hover:
   - text-decoration: underline
   - text-decoration-color: var(--color-gold)
   - text-underline-offset: 0.3em

5. `.book-presentation` — The featured book section:
   - text-align: center
   - max-inline-size: 28em
   - margin-inline: auto

6. `.book-presentation .book-title` — Title in publication voice:
   - font-family: var(--font-display)
   - font-weight: 700
   - color: var(--color-crimson)
   - font-size: 1.25rem

7. `.book-presentation .book-author` — Author name:
   - font-family: var(--font-reading)
   - color: var(--color-text-secondary)
   - font-size: 0.9375rem

8. `.book-presentation .book-meta` — Chapter count + "freely available":
   - font-family: var(--font-ui)
   - color: var(--color-text-secondary)
   - font-size: 0.8125rem
   - margin-block: var(--space-compact)

9. `.bindu-layout` — Cover + passage side-by-side on desktop:
   - display: flex
   - flex-direction: column
   - align-items: center
   - gap: var(--space-generous)
   - max-inline-size: 42em
   - margin-inline: auto
   - padding-inline: var(--space-default)

   At min-width 640px:
   - flex-direction: row
   - align-items: flex-start

10. `.bindu-layout .bindu-cover` — The book cover in the bindu:
    - flex-shrink: 0
    - height: 120px
    - width: auto
    - border-radius: var(--radius-gentle, 4px)

    At min-width 640px:
    - height: 200px

Keep it minimal. These classes layer on top of the design system — they handle only layout and typography that can't be expressed through existing utility classes.
```

---

## Step 3: Restructure page.tsx

**What it does:** The main event. Rewrites the home page to match the proposal's composition: bindu (cover + passage), search + pills, seeking lines, book presentation, practice bridge, continue reading, closing motif.

**Review after:** This is the big visual change. Check desktop and mobile. Compare against the wireframes in the proposal.

### Prompt

```
Read `proposals/front-page-overhaul.md` for the complete specification including wireframes and accessibility table.

Rewrite `app/[locale]/page.tsx` to implement the front page overhaul. The page is a Server Component (keep it that way). Here's the target composition, top to bottom:

**Section I — The Bindu (cover + passage):**
- Use the new `.bindu-layout` class for the sidebar layout
- Book cover: `<img>` tag, locale-aware (en → autobiography-of-a-yogi.webp, es → autobiografia-de-un-yogui.webp). Use `fetchpriority="high"`, `loading="eager"`. Alt text from `t("bookPresentation.coverAlt")`. Wrap in `<a href="/${locale}/books">`.
- Passage: Same `ShowAnother` component wrapping the passage. Keep existing passage display (blockquote, citation, "Read in chapter", "Show me another").
- No lotus above. No "Today's Wisdom" heading.
- Spacing: `paddingBlockStart: "var(--space-spacious)"` on the outer container.

**Section II — Search + Thematic Doors:**
- Same search form structure. Update placeholder to use `t("searchPrompt")` (which now says "What are you seeking?").
- Keep the `btn-ghost` class on the search button (change from `btn-primary`).
- Keep thematic door pills exactly as they are. Remove the heading — no `t("thematicDoors.heading")`.
- Gap above: `var(--space-expansive)` (48px)

**Section III — Seeking Lines:**
- New `<nav aria-label="Explore by theme">` section using `.seeking-lines` class
- Heading: `<h2>{t("seeking.heading")}</h2>`
- Four links, each using `t("seeking.comfort")` etc. as link text
- Define SEEKING_QUERIES as a const array (like THEMATIC_DOORS) mapping each key to a search query string:
  - comfort → "comfort peace solace strength"
  - meaning → "meaning purpose truth why"
  - practice → "meditation stillness calm mind"
  - curiosity → "soul consciousness divine experience"
- Each `<a>` links to `/${locale}/search?q=${encodeURIComponent(query)}`
- Gap above: `var(--space-vast)` (64px)

**Section IV — Book Presentation:**
- New `<section aria-label={t("bookPresentation.begin")}>` with `.book-presentation` class
- Fetch book data: use `getBooks(pool, locale)` (import from `@/lib/services/books`) to get the first book. Use `getChapters(pool, bookId)` for chapter count.
- Display: title (`.book-title`), author (`.book-author`), "{count} chapters · Freely available" (`.book-meta`), "Begin reading" link to `/${locale}/books`
- Gap above: `var(--space-spacious)` (32px)
- If no books in database, skip this section entirely (graceful absence).

**Section V — Practice Bridge + Continue Reading:**
- Keep exactly as-is from current implementation.

**Section VI — Closing Motif:**
- Single `<Motif role="close" voice="sacred" glyph="lotus-03" />` at the bottom.
- Remove the welcome lotus (top) and the divider lotus (between passage and search).

**Overall page container:**
- `page-arrive` class (existing — handles arrival transition)
- flex column, gap varies per section (use style props for the variable prāṇa rhythm rather than a single uniform gap)

**Imports needed:**
- Add: `getBooks` from `@/lib/services/books`, `getChapters` from `@/lib/services/chapters` (check actual export paths — read the service files first if unsure)
- Keep: `getTranslations`, `setRequestLocale`, `pool`, `getDailyPassage`, `ContinueReading`, `ShowAnother`, `Motif`, `SRF_PRACTICE`
- Remove: nothing (all existing imports may still be used)

Read the current `app/[locale]/page.tsx` and `app/[locale]/books/page.tsx` (to see how book/chapter services are called) before writing. Preserve the existing Server Component pattern and the `export const dynamic = "force-dynamic"` directive.
```

---

## Step 4: Verify

**What it does:** Visual review, accessibility check, build verification.

### Prompt

```
The front page overhaul from `proposals/front-page-overhaul.md` has been implemented. Please verify:

1. Run `npm run build` — confirm it passes with no errors.

2. Read the updated `app/[locale]/page.tsx` and verify against the proposal:
   - [ ] Book cover image present with correct alt text and fetchpriority
   - [ ] Locale-aware cover (en/es)
   - [ ] Passage displays with full attribution, no "Today's Wisdom" heading
   - [ ] Search placeholder is "What are you seeking?"
   - [ ] Search button is btn-ghost (not btn-primary)
   - [ ] No "Doors of Entry" heading above pills
   - [ ] Seeking lines section with 4 linked lines in <nav>
   - [ ] Book presentation section with dynamic chapter count
   - [ ] Practice bridge unchanged
   - [ ] Continue reading unchanged
   - [ ] Single closing lotus (not two lotuses)
   - [ ] All sections have correct aria-labels
   - [ ] Variable spacing (prāṇa rhythm) between sections

3. Check accessibility:
   - All `<img>` tags have meaningful alt text
   - Search form has aria-label
   - Seeking line links have sufficient touch targets (44px)
   - Tab order is logical
   - No orphaned ARIA references

4. Report any deviations from the proposal. Fix anything that doesn't match.
```

---

## After all steps

Once verified, review the page visually at:
- Desktop width (>640px) — check sidebar layout of cover + passage
- Mobile width (<640px) — check stacked layout, 120px cover
- Both `/en` and `/es` locales

If satisfied, commit:

```
/commit
```

Suggested message: "Overhaul front page: add book cover, seeking lines, variable rhythm (proposals/front-page-overhaul.md)"
