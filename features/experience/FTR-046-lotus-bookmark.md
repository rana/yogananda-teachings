---
ftr: 46
title: Lotus Bookmark
summary: "Client-side localStorage bookmarking for chapters and passages with lotus icon UX"
state: implemented
domain: experience
governed-by: [PRI-08, PRI-09]
---

# FTR-046: Lotus Bookmark

## Rationale


### Context

The portal's design philosophy prioritizes immediate access without registration (Milestone 7a introduces optional accounts). But readers still need a way to save their place across reading sessions. Without bookmarks, a reader must remember where they were — or re-search for a passage they found meaningful.

Browser bookmarks are too coarse (they save a URL, not a reading position). The portal needs a lightweight, private, account-free bookmarking system.

### Decision

Implement **Lotus Bookmarks** using `localStorage`:

1. **Bookmark a chapter:** A small lotus icon (SVG, `--srf-gold` at 50% opacity, 20px) appears in the reader header beside the chapter title. Clicking it fills the lotus to full opacity and stores the bookmark. Clicking again removes it. The lotus was chosen because it already exists in SRF's visual language and carries meaning: a lotus marks where light was found.

2. **Bookmark a passage:** In dwell mode (FTR-040), a small lotus icon appears alongside the share icon. Clicking it bookmarks the specific paragraph.

3. **Bookmarks page (`/bookmarks`):** A simple page listing all bookmarked chapters and passages, organized by book. Each entry shows the book title, chapter title, and (for passage bookmarks) the first line of the passage with its citation. Clicking navigates to that position in the reader.

4. **Storage:** All bookmarks stored in `localStorage` under a portal-namespaced key (`srf-portal:bookmarks`). JSON structure:
 ```json
 {
 "chapters": [{"bookSlug": "...", "chapter": 14, "title": "...", "savedAt": "ISO"}],
 "passages": [{"chunkId": "...", "bookSlug": "...", "chapter": 14, "firstLine": "...", "savedAt": "ISO"}]
 }
 ```

5. **No server interaction, no accounts, no tracking.** Bookmarks exist only in the user's browser. Clearing browser data removes them. This is stated clearly on the bookmarks page.

6. **Milestone 7a migration:** When optional accounts are introduced (Milestone 7a), bookmarks are synced to the server on login. `localStorage` bookmarks are offered for import. Until then, bookmarks are entirely client-side.

### Rationale

- Serves the 80%+ of users who will never create accounts
- The lotus icon is meaningful (not a generic bookmark/star) — it connects the interaction to SRF's visual and spiritual vocabulary
- `localStorage` is the simplest possible implementation — no database, no API, no auth
- The bookmarks page provides a personal reading dashboard without any personalization infrastructure
- Privacy: impossible to track what users bookmark (data never leaves the browser)

### Consequences

- The reader header gains a lotus bookmark icon
- The dwell mode UI (FTR-040) gains a lotus bookmark icon alongside the share icon
- A `/bookmarks` page is added to the navigation (appears only when bookmarks exist, or always in footer)
- `localStorage` has a ~5MB limit per origin — sufficient for thousands of bookmarks
- Users on different browsers/devices will have separate bookmark collections until Milestone 7a sync
- The bookmarks page is a client-only page (no SSR needed — reads directly from `localStorage` on mount)

---

## Notes

Migrated from FTR-046 per FTR-084.
