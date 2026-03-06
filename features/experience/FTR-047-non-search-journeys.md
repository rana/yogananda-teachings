---
ftr: 47
title: Non-Search Journeys
state: approved-provisional
domain: experience
arc: "2"
---

# FTR-047: Non-Search Journeys

## Rationale


### Context

The portal's architecture centers on search — the AI librarian (FTR-001, FTR-077), embedding pipeline (FTR-101, FTR-024), query expansion (FTR-005), and passage ranking. This is justified: intelligent search is the portal's differentiator and the AI librarian is the core innovation.

But a significant population of seekers will never touch the search bar:

- **The Google arrival.** A seeker finds a chapter via search engine results, reads, and leaves. Their entry point is a chapter page, not the homepage.
- **The daily visitor.** Returns each morning for Today's Wisdom. Reads the passage, clicks "Show me another" once or twice, contemplates, leaves. Has never searched.
- **The Quiet Corner seeker.** Goes directly to `/quiet` in a moment of crisis. Sits with the affirmation. Leaves. May never visit another page.
- **The linear reader.** Opened Chapter 1, reads sequentially through the book. Uses Next Chapter. Doesn't explore cross-book connections.
- **The shared-link recipient.** Receives a `/passage/[chunk-id]` URL from a friend. Reads the passage. Their impression of the entire portal is formed by this single page.

Each of these paths should be as excellent as the search experience. "Excellent" does not mean adding features — it means ensuring that each path is complete, warm, and naturally invites deeper engagement without pressure.

### Decision

1. **The shared passage page (`/passage/[chunk-id]`) is the most important first-impression surface after the homepage.** It is mediated by *trust* — a friend sent this. The page should feel like receiving a gift, not visiting a website.

 Enhancements:
 - Above the passage: "A passage from the teachings of Paramahansa Yogananda" — framing context for seekers unfamiliar with the author.
 - Below the citation: "This passage appears in *[Book Title]*, Chapter [N]. Continue reading →" — framing the book as a world to enter, not a citation to note.
 - Below the book link: "Explore more teachings →" — linking to the homepage, not Books (the homepage's Today's Wisdom provides a second immediate encounter).
 - The warm cream background, decorative quote mark (FTR-040), and generous whitespace ensure the page is visually the most beautiful thing the recipient sees in their social feed that day.

2. **The Google-arrival chapter page has a gentle context header.** When a seeker lands on `/books/[slug]/[chapter]` without navigating through the portal (referrer is external or empty), a subtle one-line context bar appears above the chapter title: "You're reading *[Book Title]* by Paramahansa Yogananda — [Chapter N] of [Total] — Start from the beginning →". Styled in `--portal-text-muted`, `--text-sm`. Dismissed on scroll. Not shown when navigating within the portal.

3. **The Quiet Corner is self-contained.** No navigation chrome competes with the affirmation. The header collapses to just the lotus mark (home link). The footer is suppressed. The page is almost entirely empty — the affirmation, the timer, and nothing else. This is already specified in DESIGN.md but is elevated here as an explicit design constraint: the Quiet Corner page must pass the "2 AM crisis test" — a person in distress should see nothing that adds to their cognitive load.

4. **The daily visitor's path optimizes for Today's Wisdom.** The homepage's information architecture already places Today's Wisdom first. This ADR adds: the "Show me another" interaction should feel *inexhaustible* — the seeker should never feel they've "used up" the passages. When the pool is thin (Arc 1, one book), "Show me another" should cycle through all available passages before repeating any. A simple client-side exclusion list (sessionStorage) prevents repeats within a visit.

5. **Each path naturally invites one step deeper — exactly one.** The shared passage page invites: continue reading the chapter. The chapter page (external arrival) invites: start from the beginning. The Quiet Corner invites: nothing during the timer, then a parting passage (FTR-040). Today's Wisdom invites: "Show me another" or search. Never more than one invitation at a time. Never pressure.

### Alternatives Considered

1. **Optimize only for search (the differentiating feature).** Rejected: The portal's mission is to make the teachings "available freely throughout the world." Availability means every path to the teachings is excellent, not just the most technically sophisticated one.

2. **Add prompts to search from non-search pages.** Rejected: A shared passage recipient who sees "Try searching for more!" has been sold to, not served. The non-search paths should be complete in themselves, with organic connections to more content — not funnels into search.

3. **A/B test non-search page variants.** Rejected: DELTA-compliant analytics (FTR-082) exclude user-level behavioral profiling. The portal cannot A/B test. Design decisions are made through editorial judgment and qualitative feedback (FTR-061).

### Rationale

- **The shared passage page is the portal's ambassador.** More people may encounter the portal through a shared link than through the homepage. That page must represent the portal's best self.
- **The Quiet Corner is the portal's purest expression.** A page that is almost entirely empty, holding space for a single affirmation and a seeker in need — this is the portal at its most aligned with Yogananda's teaching about the power of stillness.
- **"One step deeper" respects the seeker's autonomy.** The DELTA Agency principle means the seeker controls their experience. Offering one natural invitation is service. Offering three is pressure. Offering none is neglect.
- **Daily visitors are the portal's most devoted seekers.** A person who returns every morning for Today's Wisdom has made the portal part of their spiritual practice. Their experience should reward this devotion with variety and depth, not repetition.

### Consequences

- Shared passage page (`/passage/[chunk-id]`) redesigned with framing context, book invitation, and homepage link
- Chapter page gains external-arrival context header (referrer detection, sessionStorage dismissal)
- Quiet Corner page explicitly constrained: suppressed footer, minimal header
- "Show me another" gains sessionStorage-based repeat prevention within a visit
- DESIGN.md § Passage Sharing, § The Quiet Corner, and § Book Reader updated
- New DESIGN.md subsection: "Non-Search Seeker Journeys"
- No schema changes, no new API endpoints
- QA requirement: test each of the five non-search paths end-to-end for warmth, completeness, and single-invitation principle

---

## Notes

Migrated from FTR-047 per FTR-084.
