---
ftr: 166
title: "Personal Reading Map — Returning-Reader Experience"
summary: "DELTA-compliant localStorage reading history surface treating re-reading as primary mode"
state: proposed
domain: experience
governed-by: [PRI-08, PRI-09, PRI-03]
depends-on: [FTR-041, FTR-047]
re-evaluate-at: M3a
---

# FTR-166: Personal Reading Map

## Rationale

### Context

Across 30 years of sacred text digital platforms — Sefaria, YouVersion, Quran.com, Vedabase, SikhiToTheMax — no existing platform designs for re-reading as the primary mode of engagement. Every major app assumes a first-time reader navigating forward through unfamiliar material: progress tracking shows percentage completed, reading plans assume linear progression, navigation assumes the reader seeks something unread. Yet devotees of every tradition report that re-reading is their actual practice (claude-deep-research-sacred-reading-experience-report.md § 6).

The portal already makes critical decisions aligned with re-reading primacy: no linear progress metrics in the reader (FTR-041 § 11.3), visited-chapter checkmarks as spatial memory aids rather than completion metrics, Zoom Paragraph for contemplative depth. But the **home experience** still assumes the arriving seeker — Today's Wisdom, search bar, book browsing. For the returning devotee who has read the Autobiography three times, the homepage asks "What would you like to find?" when what they want is to go *back*.

A "Personal Reading Map" — a private, DELTA-compliant surface showing the reader's own relationship with the texts — would make the portal the first sacred text platform where the returning reader is the default assumption.

### Decision

Implement a Personal Reading Map as a dedicated page (`/[locale]/reading`) and an optional homepage section for returning visitors. The entire surface renders from localStorage — no server state, no accounts, no tracking. DELTA-compliant by construction.

**1. Data model (localStorage only).**

All reading state stored in the existing `srf-reader-prefs` localStorage namespace, extended with:

```typescript
interface ReadingHistory {
  /** Chapters visited with timestamps and visit count */
  chapters: Record<string, {
    bookSlug: string;
    chapterNumber: number;
    chapterTitle: string;
    firstVisited: string;   // ISO date
    lastVisited: string;    // ISO date
    visitCount: number;
    lastParagraph?: number; // scroll position
  }>;
  /** Passages the reader zoomed (contemplated) */
  contemplated: Array<{
    chunkId: string;
    bookSlug: string;
    chapterNumber: number;
    paragraphIndex: number;
    snippet: string;        // first 120 chars, stored at zoom time
    timestamp: string;      // ISO date
  }>;
  /** Bookmarked chapters (already exists, reused) */
  // bookmarks already in localStorage
}
```

**Storage budget:** ~50KB for a reader who has visited every chapter of every book multiple times. Well within localStorage limits.

**2. The Reading Map page (`/[locale]/reading`).**

A warm, personal surface showing the reader's relationship with the texts. Not a dashboard — a quiet reflection of where they've been.

**Sections:**

- **Continue Reading** — the most recent chapter, with paragraph-level position restoration. Already exists as a homepage card; elevated here as the primary action.
- **Passages You Lingered With** — passages the reader zoomed/contemplated, displayed as passage cards with attribution. Ordered by recency. The contemplative equivalent of "favorites" — but derived from behavior (dwell/zoom activation), not explicit action. Limited to the 12 most recent to avoid accumulation.
- **Your Chapters** — a visual map of chapters visited, organized by book. Each chapter shows visit count as a subtle warmth indicator (more visits = warmer gold tint, not a number). This is the "reading depth visualization" — a private heat map showing where the reader spends time. No percentages, no completion metrics.
- **Books You're Reading** — books with any visited chapters, showing the book cover, title, and a warmth-based chapter map (visited chapters as warm dots, unvisited as neutral).

**What is deliberately absent:**
- No "time spent reading" metrics
- No "pages read today" counters
- No streaks, badges, or gamification
- No "you've read X% of the Autobiography"
- No comparison to other readers
- No recommendations based on reading history (DELTA)

**3. Homepage integration for returning visitors.**

When `ReadingHistory.chapters` has 3+ entries (the reader has visited at least 3 chapters), the homepage shows a "Continue Your Reading" section above Today's Wisdom, containing:
- The most recently read chapter (with position)
- Up to 2 recently contemplated passages
- A link to the full Reading Map

Detection is client-side only (localStorage check). First-time visitors see the standard homepage. No server involvement.

**4. Synchronized daily reading ("Today's Reading").**

The Daf Yomi insight: synchronized daily reading creates invisible community through synchronization, not interaction. Today's Wisdom currently selects randomly. This FTR proposes an **open question** (not a decision): should Today's Wisdom transition from random selection to a curated sequential cycle — every visitor sees the same passage on a given day — creating invisible synchronization? See CONTEXT.md open question.

If adopted, implementation is trivial: a deterministic function mapping `Date` to passage index in a curated sequence. The sequence itself is editorial (FTR-067, FTR-063). No technology change needed.

**5. Ambient co-presence (deferred, decision required).**

The research proposes ephemeral WebSocket-based reader counts: "12 devotees are reading this chapter now." This creates invisible satsang — the awareness that others are reading the same text. Implementation: WebSocket channel per chapter, increment/decrement on connect/disconnect, no logging, no persistence. DELTA question: does an ephemeral room-occupancy counter constitute session tracking? Deferred pending DELTA review.

### Constraints

- **Zero server state.** The entire Reading Map renders from localStorage. A reader who clears their browser data starts fresh — this is a feature, not a bug. No "sync your reading history" feature.
- **No behavioral inference.** The Reading Map shows what the reader did, never infers what they should do next. No "based on your reading, you might enjoy..." recommendations.
- **No guilt mechanics.** The map never shows "you haven't read in X days" or "you stopped at chapter 12." It shows where you've been, warmly. Absence is not noted.
- **Graceful emptiness.** A new visitor who navigates to `/reading` sees a warm, inviting page: "Your reading journey begins when you open your first chapter." Not an empty state — an invitation.

### Implementation Notes

- **ReadingTracker component** (FTR-041 § 11.1) already records last-read position in localStorage. Extend it to maintain the full `ReadingHistory` structure.
- **Zoom Paragraph** (FTR-041 § 5.2) already activates on contemplative dwell. Add a side-effect that appends to `contemplated[]` with snippet and timestamp.
- **The Reading Map page** is a Client Component (it reads exclusively from localStorage). Server Component wrapper provides the page shell and metadata.
- **No new API endpoints.** No server changes. Pure client-side feature.

### What This Is Not

- **Not a social feature.** No sharing of reading history, no "what my friend is reading," no reading groups.
- **Not a recommendation engine.** The map reflects; it does not suggest. Content-based recommendations remain in FTR-030 (Related Teachings) and FTR-063 (Reading Threads).
- **Not a replacement for bookmarks.** Bookmarks are explicit, intentional markers. The Reading Map is an ambient record of engagement. They complement each other.

### Design Token Integration

The Reading Map uses the `sacred` register (FTR-145) for contemplated passages and `functional` register for navigation elements. The warmth gradient for visit depth uses the existing gold attention gradient: `color-mix(in srgb, var(--color-gold) N%, transparent)` where N scales with visit count (capped at 15% to remain subtle).

### Source Research

claude-deep-research-sacred-reading-experience-report.md § 6 ("Re-reading as primary mode is the portal's signature opportunity"), § 8 ("Communal reading without social features"), § 1 (Vedabase's 42.2% returning visitors). Also informed by deep-research-report-discovery-without-surveillance-2026.md § "Reflective Agency Framework."

## Notes

- Origin: Claude deep research analysis of 30 years of sacred text platforms (March 2026)
- The "personal relationship map" concept — treating the home screen as a reflection of the reader's journey rather than a navigation hub — has no precedent in existing sacred text platforms
- Ambient co-presence (WebSocket reader counts) deferred as a separate decision; included here for completeness
- Today's Reading curation (random vs. sequential) elevated as an open question in CONTEXT.md
