# SRF Online Teachings Portal — Architecture Decision Records (Experience)

> **Scope.** This file contains ADRs from the **Cross-Media**, **Seeker Experience**, and **Internationalization** groups. These shape the portal's seeker experience from Milestone 2a onward. For the navigational index and group summaries, see [DECISIONS.md](DECISIONS.md). For other ADR files, see the links in the index.
>
> **Living documents.** ADRs are mutable. Update them directly — add, revise, or replace content in place. Git history serves as the full audit trail.

## ADR-054: YouTube Integration via Hybrid RSS + API with ISR

- **Status:** Accepted
- **Date:** 2026-02-17

### Context

SRF operates an active YouTube channel (@YoganandaSRF) with hundreds of videos: How-to-Live monastic talks, guided meditations, convocation sessions, and commemorative events. The Gemini research document emphasizes the importance of integrating this multimedia content with the book corpus.

Options for auto-updating YouTube content:

| Option | Cost | Content Available | Categorization |
|--------|------|-------------------|----------------|
| YouTube RSS feed | Free (no API key) | ~15 most recent only | None |
| YouTube Data API v3 | Free (10,000 units/day) | All videos, all playlists | Full (via playlists) |
| Manual curation | Free | Whatever is curated | Full (manual) |
| RSS + API hybrid | Free | Latest (RSS) + full library (API) | Full |

**Critical quota insight:** The `search.list` endpoint costs **100 units per call**. The `playlistItems.list` endpoint costs **1 unit per call** and returns the same data. Never use `search.list`.

### Decision

Use a **hybrid RSS + YouTube Data API** approach:

1. **RSS feed** (free, no key) for "Latest Videos" — the ~15 most recent uploads, revalidated hourly via Next.js ISR
2. **YouTube Data API v3** (10,000 units/day quota) for the full categorized library — playlists mapped to site categories, revalidated every 6 hours via ISR
3. Videos categorized by mapping YouTube playlist titles to portal categories
4. Videos embedded via `youtube-nocookie.com` for privacy-enhanced playback

### Rationale

- **Auto-updating:** ISR ensures the portal reflects new YouTube content without manual intervention
- **Minimal cost:** ~50-100 API units/day (0.5-1% of free quota)
- **No new vendor:** YouTube is already SRF's video platform (the tech stack brief specifies Vimeo for *private* video; YouTube content is public)
- **Categorization via playlists:** SRF already organizes content into playlists — we map these to portal sections
- **Privacy:** `youtube-nocookie.com` embedding avoids tracking cookies until the user plays a video

### Consequences

- Requires a YouTube Data API key (free, obtained via Google Cloud Console)
- Playlist-to-category mapping needs initial configuration and occasional maintenance
- RSS provides only ~15 recent videos — the API is needed for the full library
- A future milestone can add video transcription for cross-media search (book passages + video segments)

---

---

## ADR-061: Knowledge Graph Visualization

**Status:** Accepted | **Date:** 2026-02-20
**Context:** ADR-050 (chunk relations), ADR-032 (theme taxonomy), DES-027 (reverse bibliography), ADR-033 (exploration categories), ADR-036 (Spiritual Figures)

### Context

The portal's schema contains a complete semantic map of Yogananda's teachings: chunk relations (similarity), theme tags (quality, situation, person, principle, scripture, practice, yoga_path), reverse bibliography (external references), editorial cross-references, Spiritual Figures entities, and cross-language alignment. No such map exists for any major spiritual figure. This semantic structure is navigable through linear interfaces (search, theme pages, reader side panel) but has never been visualized as a whole.

### Decision

Build an interactive knowledge graph visualization at `/explore` that renders the portal's semantic structure as a navigable, visual map.

**Nodes:**
- Books (large, colored by book)
- Passages / chunks (small, clustered around their book)
- Themes (medium, connecting clusters)
- People (medium, from Spiritual Figures)
- Scriptures and external references

**Edges:**
- Chunk relations (similarity, with thickness proportional to similarity score)
- Theme memberships (chunk → theme)
- External references (chunk → scripture/person)
- Cross-book connections (strongest relations between books)

**Interaction:**
- Enter from any node: click a theme, person, or book to center and expand
- Zoom: mouse wheel / pinch. Pan: drag.
- Click a passage node to see its text, citation, and "Read in context →" link
- Filter by: book, theme category, relation type
- Two views: full graph (all books, all themes) and focused view (single book's connections)

**Technology:** Client-side graph rendering via `d3-force` or `@react-three/fiber` (3D option for immersive exploration). Pre-computed graph data served as static JSON from S3 (regenerated nightly). No real-time graph queries — the visualization is a pre-baked artifact.

**Design:** Warm tones, `--portal-bg` background, `--srf-gold` edges, `--srf-navy` nodes. Not a clinical network diagram — a contemplative map of interconnected wisdom. Generous whitespace at the edges. Slow, deliberate animation (nodes drift gently, not bounce). `prefers-reduced-motion`: static layout, no animation.

### Scheduling

Milestone 3d (after chunk relations are computed across the full multi-book corpus in Milestones 3c–3d). The graph needs multi-book density to be meaningful.

### Consequences

- New page at `/explore` (linked from Books and themes pages, not primary nav)
- Pre-computed graph JSON generated nightly by Lambda (extension of chunk relation computation)
- Client-side rendering adds ~50-80KB JS (loaded only on `/explore` — not in the global bundle)
- Graph data is a static artifact — no database queries during exploration
- **Extends ADR-050** (chunk relations) from a search/reader feature to a visual discovery tool

---

---

## ADR-062: Knowledge Graph Cross-Media Evolution — All Content Types as Graph Nodes

- **Status:** Accepted
- **Date:** 2026-02-21
- **Supersedes aspects of:** ADR-061 (original Knowledge Graph visualization — now the Milestone 3d baseline, not the final form)
- **Relates to:** ADR-060 (Unified Content Hub), ADR-055 (Video Transcripts), ADR-057 (Audio), ADR-035 (Images), ADR-056 (Platform-Agnostic Video), ADR-036 (Spiritual Figures), ADR-040 (Magazine), ADR-043 (Spiritual Ontology)

### Context

ADR-061 designed the Knowledge Graph at `/explore` when the portal had only book content. It specifies nodes as "books, passages, themes, people, scriptures" and edges as `chunk_relations` — book-only. Since ADR-061 was accepted, the following content types were added to the portal architecture without updating the graph:

- **Magazine articles** (ADR-040, Arc 4) — embedded, searchable, themed
- **Video transcripts** (ADR-055/088, Arc 6) — time-synced, embedded, cross-searchable
- **Audio recordings** (ADR-057, Arc 6) — transcribed, embedded, Yogananda's own voice
- **Images/photographs** (ADR-035, Arc 6) — description-embedded, place-linked, sacred artifacts
- **Ontology concepts** (ADR-043, Arc 4+) — structural relationships between teachings
- **Sacred places** (Arc 6) — geographical entities linked to passages and images
- **Community collections** (ADR-086, Milestone 7b) — curated paths through content

The Unified Content Hub (ADR-060, Arc 6) solves the data layer — `content_items` + `content_relations` unify all media. But the visualization layer was never updated to consume this unified fabric.

This gap is systemic: ADR-061 was designed early, content types were added later, and no governance mechanism ensured graph integration was considered with each new content type.

### Decision

**1. The Knowledge Graph evolves through phases, matching the content it visualizes.**

ADR-061's Milestone 3d delivery becomes the graph's *first version*, not its final form. Each subsequent content milestone extends the graph with new node and edge types. The graph is a living visualization of the portal's entire teaching ecosystem.

**2. The pre-computed graph JSON uses an extensible schema from day one.**

Milestone 3d's nightly Lambda generates graph JSON with a `node_types` and `edge_types` registry. Adding magazine nodes in Arc 4 requires a Lambda update and JSON regeneration — zero visualization code changes.

```jsonc
{
 "generated_at": "2027-03-15T02:00:00Z",
 "schema_version": 2,
 "node_types": ["book", "passage", "theme", "person", "reference", "place"],
 "edge_types": ["similarity", "contains", "theme_tag", "references", "mentions_person"],
 "nodes": [
 {
 "id": "uuid",
 "type": "passage",
 "media_type": "book",
 "label": "Chapter 12, ¶3",
 "parent_id": "book-uuid",
 "url": "/books/autobiography/12#p3"
 }
 ],
 "edges": [
 {
 "source": "uuid-a",
 "target": "uuid-b",
 "type": "similarity",
 "weight": 0.87
 }
 ]
}
```

The visualization code reads `node.type` dynamically to determine shape, color, and click behavior. New node types render with a sensible default without code changes — explicit styling is added as a refinement.

**3. The graph supports filtering and focus modes.**

At cross-media scale (30,000–50,000 nodes), the full graph is unusable without filtering:

| Mode | Default? | What's visible |
|------|----------|----------------|
| **Book map** | Yes (Milestone 3d) | Books, passages, themes, people, references |
| **Concept map** | Arc 4+ | Ontology concepts, relations, linked passages |
| **All media** | Arc 6+ | Everything — full cross-media fabric |
| **Single book** | Any milestone | One book's passages, themes, connections |
| **Single theme** | Any milestone | One theme's passages across all media |

Plus a media type toggle: show/hide books, magazine, video, audio, images independently. Passage Constellation mode (DESIGN.md) already provides an alternative spatial view — the Knowledge Graph mode handles the relational/structural view.

**4. Editorial threads and community collections appear as highlighted paths.**

Editorial Reading Threads (DES-026) are curated journeys through the graph — golden paths connecting specific nodes. Community collections (ADR-086) appear as community-contributed paths with distinct visual treatment. Seekers can "follow the thread" through the graph.

**5. The graph is the portal's universal navigation layer.**

Every node is clickable — navigates to the corresponding page (book reader, video player, audio player, image detail, theme page, person page, place page). The graph is not just a visualization but an alternative to search: seekers who don't know what they're looking for can wander the graph and discover connections that search can't surface.

### Phased Node/Edge Evolution

| Milestone | New Node Types | New Edge Types | Approximate Scale |
|-----------|---------------|----------------|-------------------|
| **Arc 4** | book, passage, theme, person, reference | similarity, contains, theme_tag, references, mentions_person | ~5,000–10,000 nodes |
| **Milestone 5a** | magazine_issue, magazine_chunk, ontology_concept | magazine_similarity, ontology_relation, concept_source | ~12,000–18,000 nodes |
| **Milestone 7a** | video, video_chunk, place | video_similarity, cross_media_similarity (via content hub), mentions_place, depicts_place | ~20,000–35,000 nodes |
| **Milestone 7b** | audio_recording, audio_segment, image | audio_similarity, photographed_person, photographed_place | ~30,000–50,000 nodes |
| **Milestone 7b** | community_collection (optional) | collection_path, editorial_thread | Same node count, new path overlays |

### Visual Vocabulary

Each node type has a distinct visual representation for immediate recognition:

| Node Type | Shape | Color Family | Size Rule |
|-----------|-------|-------------|-----------|
| Book | Rectangle | SRF Navy | Fixed large |
| Book passage | Circle | SRF Navy (30% opacity) | Density-scaled (connection count) |
| Theme | Hexagon | SRF Gold | Passage count |
| Person | Portrait circle | Warm Cream border | Fixed medium |
| Scripture/reference | Diamond | Earth tone | Fixed medium |
| Magazine issue | Rectangle | Warm Cream with accent | Fixed medium |
| Magazine chunk | Circle | Warm accent (30% opacity) | Small |
| Ontology concept | Rounded rectangle | SRF Gold (darker) | Relation count |
| Sacred place | Map pin | Earth green | Fixed medium |
| Video | Play-button circle | Teal accent | Fixed medium |
| Video chunk | Circle | Teal (30% opacity) | Small |
| Audio recording | Waveform circle | Amber accent | Fixed medium |
| Audio segment | Circle | Amber (30% opacity) | Small |
| Image | Rounded square | Neutral | Small thumbnail |

Yogananda's own voice recordings and photographs receive the sacred artifact treatment — a subtle golden ring distinguishing them from other audio/images.

### Performance Strategy

| Scale | Strategy |
|-------|----------|
| < 10,000 nodes | d3-force with Canvas rendering. Pre-computed positions in JSON. Interactive pan/zoom/click. |
| 10,000–50,000 nodes | WebGL rendering (via deck.gl or custom Canvas). Level-of-detail: zoomed out shows clusters with labels, zoomed in reveals individual nodes. Pre-computed cluster centroids. |
| Mobile / low-bandwidth | Subset graph: show only the neighborhood of the current node (2-hop subgraph, max ~500 nodes). Progressive loading: clusters first, expand on interaction. |

The nightly Lambda pre-computes node positions using a force-directed algorithm (server-side, no runtime cost). The client renders pre-positioned nodes — no layout computation on the client.

### Graph Data API

```
GET /api/v1/graph → Full graph metadata (node/edge type counts, last generated)
GET /api/v1/graph/subgraph?node={id}&depth=2 → 2-hop neighborhood of a node
GET /api/v1/graph/cluster?theme={slug} → All nodes in a theme cluster
GET /api/v1/graph.json → Full pre-computed graph (S3-served, CDN-cached)
```

The subgraph endpoint powers embeddable mini-graphs in other pages: the reader's Related Teachings panel can show a small visual graph of the current passage's neighbors. Theme pages can embed their cluster.

### Governance: Content-Type Integration Checklist

To prevent the drift that created this ADR, every future ADR that introduces a new content type must address:

1. **Graph node type:** What shape, color, size, and click target?
2. **Graph edge types:** What relationships does this content have with existing nodes?
3. **Graph JSON schema:** What `node_type` and `edge_type` values are added?
4. **Lambda update:** What data source does the nightly graph regeneration query?
5. **Milestone timing:** When does this content type enter the graph?

This checklist is added to the CLAUDE.md maintenance table.

### Alternatives Considered

1. **Redesign the graph from scratch for cross-media from Arc 4.** Rejected. ADR-061's Milestone 3d delivery is correct for that milestone's content — books only. Designing for 5 content types that don't exist yet violates the "no premature abstraction" principle. The extensible JSON schema is the right compromise: the *format* accommodates future types; the *content* matches actual data.
2. **Separate visualizations per media type.** Rejected. The portal's power is cross-media connections — a monastic talk discussing a book passage about a place where a photograph was taken. Separate visualizations hide the very connections that make the portal valuable.
3. **Use a graph database (Neo4j, Amazon Neptune) instead of pre-computed JSON.** Rejected. The graph is read-heavy, write-rarely (nightly regeneration). PostgreSQL + pre-computed JSON is simpler, cheaper, and consistent with the single-database architecture (ADR-013). A graph database adds operational complexity for a visualization that's regenerated once per day.

### Consequences

- ADR-061 remains valid as the Milestone 3d baseline; this ADR extends it through Milestone 7b
- Nightly graph Lambda regeneration script updated with each content milestone
- Graph JSON schema is versioned (`schema_version` field); the visualization handles version differences gracefully
- Milestone 3d graph JSON accommodates future node types via extensible `type` field — no schema migration needed when new content types arrive
- CLAUDE.md maintenance table gains a "New content type added" → "update Knowledge Graph node/edge types" row
- DESIGN.md `/explore` section updated with full cross-media specification
- ROADMAP.md milestones (Milestone 5a, Milestone 7a, Milestone 7b) gain graph evolution deliverables
- The Knowledge Graph becomes a flagship portal feature — the visual answer to "how does everything connect?"
- **Extends ADR-061** (Knowledge Graph) to cross-media; **consumes ADR-060** (Content Hub) for unified relations; **visualizes ADR-043** (Ontology) as concept map; **renders ** (Multi-Media Threads) as graph paths

---

---

## ADR-065: SRF-Derived Design System with Calm Technology Principles

- **Status:** Accepted (updated with extracted design tokens)
- **Date:** 2026-02-17

### Context

Standard web design patterns (aggressive CTAs, gamification, notification badges, bright neon colors) conflict directly with SRF's theological commitment to "plain living and high thinking." Rather than inventing a new visual language, we extracted actual design tokens from live SRF properties to ensure brand consistency.

**Properties analyzed:**
- yogananda.org (Craft CMS — donate button, gold/navy palette, lotus icons)
- onlinemeditation.yogananda.org (WordPress/Astra — Merriweather + Lora fonts, form styling)
- convocation.yogananda.org (Next.js + Contentful — 7-locale setup)

### Decision

The portal adopts a **design system derived from existing SRF sites**, enhanced with Calm Technology constraints:

**Typography (from SRF Online Meditation Center):**
- **Merriweather** (300, 400, 700) — primary serif for book text and headings
- **Lora** (400) — secondary serif for chapter titles, decorative use
- **Open Sans** (400, 600) — sans-serif for UI chrome, navigation, labels

**Color palette (from yogananda.org + OMC):**
- SRF Gold `#dcbd23` — primary accent (donate button, lotus, CTAs)
- SRF Orange `#de6a10` — hover/active states
- SRF Navy `#1a2744` — headings, primary text (estimated from assets)
- Warm cream `#FAF8F5` — portal background (Calm Technology extension)
- Interactive blue `#0274be` — focus states, links

**Interaction patterns (from SRF donate button):**
- Gold border + gold text → orange fill on hover
- `transition: all 0.3s ease` for hover/focus states
- Pill-shaped CTA buttons (`border-radius: 50px`)

**Calm Technology constraints:**
- No gamification, no streaks, no badges, no leaderboards
- No aggressive notifications
- No decorative animations beyond subtle 0.3s transitions
- Generous whitespace treated as "digital silence"
- Warm backgrounds, never pure white

### Rationale

- **Brand consistency:** Same fonts and colors as existing SRF digital properties
- **Theological alignment:** Calm Technology principles match "plain living and high thinking"
- **Reusability:** These tokens can become a shared design system across all SRF properties
- **Familiarity:** Existing SRF devotees will recognize the visual language

### Consequences

- The design system should be documented as CSS custom properties (see DESIGN.md)
- WCAG contrast ratios must be validated — muted colors on warm cream backgrounds need careful checking
- The lotus icon SVG family from yogananda.org can be reused (with SRF's permission)
- A shared npm package could eventually serve these tokens to all SRF Next.js properties

---

---

## ADR-066: Lotus Bookmark — Account-Free Reading Bookmarks

- **Status:** Accepted
- **Date:** 2026-02-18

### Context

The portal's design philosophy prioritizes immediate access without registration (Milestone 7a introduces optional accounts). But readers still need a way to save their place across reading sessions. Without bookmarks, a reader must remember where they were — or re-search for a passage they found meaningful.

Browser bookmarks are too coarse (they save a URL, not a reading position). The portal needs a lightweight, private, account-free bookmarking system.

### Decision

Implement **Lotus Bookmarks** using `localStorage`:

1. **Bookmark a chapter:** A small lotus icon (SVG, `--srf-gold` at 50% opacity, 20px) appears in the reader header beside the chapter title. Clicking it fills the lotus to full opacity and stores the bookmark. Clicking again removes it. The lotus was chosen because it already exists in SRF's visual language and carries meaning: a lotus marks where light was found.

2. **Bookmark a passage:** In dwell mode (DES-009), a small lotus icon appears alongside the share icon. Clicking it bookmarks the specific paragraph.

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
- The dwell mode UI (DES-009) gains a lotus bookmark icon alongside the share icon
- A `/bookmarks` page is added to the navigation (appears only when bookmarks exist, or always in footer)
- `localStorage` has a ~5MB limit per origin — sufficient for thousands of bookmarks
- Users on different browsers/devices will have separate bookmark collections until Milestone 7a sync
- The bookmarks page is a client-only page (no SSR needed — reads directly from `localStorage` on mount)

---

---

## ADR-067: Non-Search Seeker Journeys — Equal Excellence for Every Path

- **Status:** Accepted
- **Date:** 2026-02-21

### Context

The portal's architecture centers on search — the AI librarian (ADR-001, ADR-089), embedding pipeline (ADR-009, ADR-046), query expansion (ADR-005), and passage ranking. This is justified: intelligent search is the portal's differentiator and the AI librarian is the core innovation.

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
 - The warm cream background, decorative quote mark (DES-008), and generous whitespace ensure the page is visually the most beautiful thing the recipient sees in their social feed that day.

2. **The Google-arrival chapter page has a gentle context header.** When a seeker lands on `/books/[slug]/[chapter]` without navigating through the portal (referrer is external or empty), a subtle one-line context bar appears above the chapter title: "You're reading *[Book Title]* by Paramahansa Yogananda — [Chapter N] of [Total] — Start from the beginning →". Styled in `--portal-text-muted`, `--text-sm`. Dismissed on scroll. Not shown when navigating within the portal.

3. **The Quiet Corner is self-contained.** No navigation chrome competes with the affirmation. The header collapses to just the lotus mark (home link). The footer is suppressed. The page is almost entirely empty — the affirmation, the timer, and nothing else. This is already specified in DESIGN.md but is elevated here as an explicit design constraint: the Quiet Corner page must pass the "2 AM crisis test" — a person in distress should see nothing that adds to their cognitive load.

4. **The daily visitor's path optimizes for Today's Wisdom.** The homepage's information architecture already places Today's Wisdom first. This ADR adds: the "Show me another" interaction should feel *inexhaustible* — the seeker should never feel they've "used up" the passages. When the pool is thin (Arc 1, one book), "Show me another" should cycle through all available passages before repeating any. A simple client-side exclusion list (sessionStorage) prevents repeats within a visit.

5. **Each path naturally invites one step deeper — exactly one.** The shared passage page invites: continue reading the chapter. The chapter page (external arrival) invites: start from the beginning. The Quiet Corner invites: nothing during the timer, then a parting passage (DES-014). Today's Wisdom invites: "Show me another" or search. Never more than one invitation at a time. Never pressure.

### Alternatives Considered

1. **Optimize only for search (the differentiating feature).** Rejected: The portal's mission is to make the teachings "available freely throughout the world." Availability means every path to the teachings is excellent, not just the most technically sophisticated one.

2. **Add prompts to search from non-search pages.** Rejected: A shared passage recipient who sees "Try searching for more!" has been sold to, not served. The non-search paths should be complete in themselves, with organic connections to more content — not funnels into search.

3. **A/B test non-search page variants.** Rejected: DELTA-compliant analytics (ADR-095) exclude user-level behavioral profiling. The portal cannot A/B test. Design decisions are made through editorial judgment and qualitative feedback (ADR-084).

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

---

## ADR-068: Passage Sharing as Organic Growth Mechanism

- **Status:** Accepted
- **Date:** 2026-02-17

### Context

When someone reads a passage that moves them, the most natural human response is to share it with someone they love. This is also the most organic growth mechanism for the portal — and it's perfectly aligned with SRF's mission of spreading the teachings.

| Approach | Mechanism | Alignment with Mission |
|----------|-----------|----------------------|
| **No sharing** | Portal is a closed library | Functional but misses the natural word-of-mouth vector |
| **Social media integration** | Share buttons for Twitter/Facebook/Instagram | Introduces third-party tracking; commercial platforms conflict with Calm Technology |
| **Clean link + OG card** | Generate a shareable URL with beautiful Open Graph metadata | No tracking; the shared content speaks for itself; recipient lands on the portal |
| **Image card generation** | Generate a downloadable image of the quote (Merriweather on warm cream with citation) | Shareable anywhere without platform dependency; beautiful; printable |

### Decision

Implement **clean link sharing with Open Graph cards** and **downloadable quote image generation** as a Milestone 2a feature. Every passage — in search results, in the reader, on theme pages, and in the Quiet Corner — has a quiet "Share" affordance.

**Share link behavior:**
- Generates a URL like `/passage/[chunk-id]` that resolves to the passage in context (reader view, scrolled to the passage)
- Open Graph tags render a beautiful preview card when the link is pasted into any platform: the quote in Merriweather, warm cream background, citation, and the portal URL
- No tracking parameters, no UTM codes, no referral tracking

**Quote image behavior:**
- "Save as image" option generates a PNG: the passage text in Merriweather on warm cream, citation below, subtle SRF lotus mark, portal URL at bottom
- Suitable for sharing via messaging apps, printing, or using as a phone wallpaper
- Generated server-side (or client-side via canvas) — no external service needed

### Rationale

- **Mission-aligned:** The philanthropist's goal is to make the teachings available worldwide. Sharing is the most natural distribution mechanism.
- **No tracking:** Unlike social share buttons (which embed third-party scripts and tracking pixels), a clean URL with OG metadata involves zero tracking.
- **Beautiful and respectful:** The shared card presents the teaching with the same reverence as the portal itself — serif typography, warm colors, proper citation.
- **Printable:** The downloadable image can be printed, framed, or placed on a meditation altar — bridging digital and physical, honoring the DELTA Embodiment principle.
- **Low effort, high impact:** OG tags are standard Next.js metadata. Image generation is a single API route or client-side canvas operation.

### Consequences

- Need a `/passage/[chunk-id]` route that renders a single passage in a shareable view
- OG meta tags must be set per-passage (dynamic `<meta>` in Next.js `generateMetadata`)
- Image generation requires either a server-side rendering solution (e.g., `@vercel/og` or Satori) or client-side canvas
- The share affordance must be visually quiet — a small icon, never a row of social media logos

---

---

## ADR-069: Events and Sacred Places — Signpost, Not Destination

- **Status:** Accepted
- **Date:** 2026-02-17

### Context

Seekers who discover Yogananda's words on the portal will naturally ask: "Where can I experience this in person?" Two related needs emerge:

1. **Events.** SRF holds annual World Convocation (already its own site at `convocation.yogananda.org`), commemorations (Christmas meditation, Mahasamadhi, Janmashtami), and online meditation events. The portal should connect seekers to these gatherings without duplicating the convocation site or the Online Meditation Center.

2. **Sacred Places.** Yogananda's life touched specific places that hold deep significance: his birthplace in Gorakhpur, Sri Yukteswar's ashram in Serampore, Lake Shrine in Pacific Palisades, the Encinitas hermitage where the Autobiography was written. No travel site can cross-reference these places with the specific book passages that describe them. The teaching portal can.

Both serve the DELTA Embodiment principle: *put down the device and go somewhere.* The portal bridges digital reading to physical experience.

### Decision

Add two content sections to the portal:

#### Events — Lightweight Signpost

A simple section (on the About page initially, or a dedicated `/events` page) that links to SRF's existing event properties:

| Element | Content | Source |
|---------|---------|--------|
| **World Convocation** | SRF's annual gathering — free, in Los Angeles and online. Classes, group meditations, kirtan, pilgrimage tours to sacred SRF sites, monastic fellowship. Open to all. Link to `convocation.yogananda.org`. Cross-link to Sacred Places ("/places"). | Static text + external link |
| **Commemorations** | Christmas meditation, Mahasamadhi, Janmashtami, Founder's Day, etc. | Static list with approximate dates + links to SRF event pages |
| **Online events** | Live group meditations, guided meditations, and devotional chanting via the Online Meditation Center. | External link to `onlinemeditation.yogananda.org` |
| **Monastic visits** | SRF monastics visit centers worldwide for classes, meditations, and fellowship. | Link to SRF events page |
| **Youth & young adult programs** | Dedicated programs for young seekers. | Link to SRF youth/young adult pages |

This is a signpost, not a destination. The portal does not replicate event registration, schedules, or logistics.

#### Sacred Places — Contemplative Geography

A dedicated `/places` page presenting sites of biographical and spiritual significance, cross-referenced with book passages.

**Two categories of places:**

**SRF/YSS properties (official, current):**

| Place | Location | Significance |
|-------|----------|-------------|
| Mount Washington | Los Angeles, CA | International headquarters since 1925 |
| Lake Shrine | Pacific Palisades, CA | Gandhi World Peace Memorial, meditation gardens |
| Encinitas Temple & Retreat | Encinitas, CA | Hermitage where Yogananda wrote the Autobiography |
| Hollywood Temple | Hollywood, CA | Yogananda's first SRF temple |
| Other SRF temples | Various US locations | |
| Hidden Valley Ashram Center | Escondido, CA | Monastic retreat |
| YSS Dakshineswar Ashram | Kolkata, India | Near the Dakshineswar Kali Temple |
| YSS Ranchi Ashram | Ranchi, India | Yogananda's first school for boys (1918) |
| 500+ meditation centers worldwide | Various | Community meditation groups |

**Historical/biographical sites:**

| Place | Location | Significance in Autobiography |
|-------|----------|-------------------------------|
| Gorakhpur | Uttar Pradesh, India | Yogananda's birthplace (Chapter 1) |
| Serampore | West Bengal, India | Sri Yukteswar's ashram (many chapters) |
| Puri | Odisha, India | Sri Yukteswar's seaside ashram |
| Dakshineswar | Kolkata, India | Lahiri Mahasaya's lineage connection |
| Varanasi (Benares) | Uttar Pradesh, India | Lahiri Mahasaya's home |

**Each place includes:**
- Contemplative header image (SRF property photographs where available)
- Brief description of its significance in Yogananda's life and mission
- **Cross-reference to the book** — "Read about this place in Autobiography of a Yogi, Chapter X" with deep link to the reader
- Visiting information — address, hours, link to SRF/YSS site for details
- "Take a Virtual Tour" — SRF virtual pilgrimage tour link (where available: Mother Center, Lake Shrine, Hollywood Temple, Encinitas)
- Street View link (ADR-070) — fallback virtual visit for places without SRF tours

**The unique value:** The teaching portal is the only place that can cross-reference sacred places with the specific passages that describe them. When a seeker reads about Serampore in the Autobiography, the portal can show "Visit this place." When they browse the Sacred Places page, each entry links back to every passage that mentions it. The teachings and the places illuminate each other.

### Map Strategy

- **Milestone 5a:** No maps. Text descriptions with addresses and "Get Directions" links (opens user's native maps app).
- **Sacred Places enhancement:** No embedded map library. Add **"See This Place" Street View links** (plain Google Maps URLs, no SDK) to place cards where coverage exists. Zero map dependencies, zero tile servers, zero maintenance. See ADR-070.
- **Future:** Dynamic center locator (if SRF provides data). If a center locator requires an embedded map, evaluate Leaflet + OpenStreetMap or Google Maps at that point — separate decision for a different page with different requirements.

### Rationale

- **DELTA Embodiment.** The portal should encourage seekers to visit, practice, and connect in person. A well-designed Sacred Places section makes the teachings tangible.
- **Unique cross-referencing.** No other site connects Yogananda's physical world to his written words with deep links into a book reader. This is the portal's distinctive contribution.
- **"What Next" Bridge.** Both Events and Sacred Places serve the portal's signpost function — pointing toward the broader SRF world without tracking conversions.
- **Signpost, not duplicate.** The convocation site handles event logistics. The Online Meditation Center handles live events. The portal links to both without replicating their functionality.
- **Virtual pilgrimage tours.** SRF offers narrated virtual pilgrimage tours of Mother Center, Lake Shrine, Hollywood Temple, and Encinitas Ashram Center. These are richer than Street View and serve the same "visit this place" intent. Sacred Places entries for these properties should link to SRF's tours ("Take a Virtual Tour →") when `virtual_tour_url` is populated. SRF tour URLs take priority over Street View for the same property. Canonical tour URLs are a stakeholder question (CONTEXT.md).
- **Convocation ↔ Sacred Places cross-link.** The portal uniquely connects what makes a place sacred (book passages) with how to experience it (virtual tour, in-person visit, Convocation pilgrimage). Sacred Places entries for LA-area SRF properties should include a seasonal note: "This site is part of the annual SRF World Convocation pilgrimage." The Events section Convocation entry links back to Sacred Places ("Explore the sacred places → /places"). This three-way connection — teaching, place, gathering — is the portal's distinctive signpost contribution.
- **No embedded map — Street View links instead (ADR-070).** Zero dependencies, zero tracking, zero cost. Street View URLs give seekers a virtual visit to physical places without embedding any map SDK. "Get Directions" delegates navigation to the user's preferred maps app.

### Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| **Full interactive map with all SRF centers** | Comprehensive; replaces "Find a meditation group" external link | Requires SRF center database (stakeholder dependency); high implementation complexity; duplicates functionality SRF may already have |
| **Google Maps embeds** | Familiar UX; Street View available | Google tracking scripts on page; API costs; contradicts privacy principles |
| **Leaflet + OpenStreetMap embedded map** | Open-source; no tracking; visual overview of all locations | Library dependency for ~20 pins; page works without it; "Get Directions" already opens real maps apps; not worth the maintenance on a 10-year horizon |
| **No places section — just external links** | Simplest implementation | Misses the unique cross-referencing opportunity; doesn't serve Embodiment principle |
| **Full convocation integration** | Seekers don't leave the portal | Duplicates `convocation.yogananda.org`; maintenance burden; SRF already invested in a separate convocation site |

### Consequences

- Milestone 5a adds static Events section and initial Sacred Places page (SRF properties, no maps)
- A subsequent enhancement adds biographical sites and "See This Place" Street View links (ADR-070) — no embedded map library
- Sacred Places content needs SRF/YSS review — biographical descriptions must be accurate and approved
- Cross-referencing places with book passages requires a `places` table and a `chunk_places` junction table (or place tags on chunks)
- Stakeholder question: can SRF provide or approve property photographs? (Already raised.)
- Stakeholder question: does SRF have a center location database (addresses, coordinates, hours) for an eventual center locator?
- The Events section is low-maintenance — updated annually or via Contentful in production

---

---

## ADR-070: Sacred Places — No Embedded Map, Street View Links Instead

- **Status:** Accepted
- **Date:** 2026-02-18
- **Supersedes:** Leaflet + OpenStreetMap portion of ADR-069

### Context

ADR-069 originally specified Leaflet + OpenStreetMap as the embedded map for the Sacred Places page. On re-evaluation, the embedded map adds a library dependency for a page that already communicates geography effectively through its card layout (grouped by category, each card showing city and country). The page works in Milestone 2b without any map. "Get Directions" already delegates to the user's preferred maps app for navigation. The one thing no outbound link provided was a *virtual visit* — seeing what a place looks like before traveling there.

### Decision

Drop the embedded map library entirely. Instead, add **"See This Place"** links to place cards — plain Google Maps Street View URLs that open in a new tab.

**What this means:**
- No Leaflet dependency
- No OpenStreetMap tile server dependency
- No map JavaScript on the page
- No API keys for maps
- Zero map-related maintenance

**Street View links** are plain URLs with coordinates baked in. They require no SDK, no API key, and load no scripts on the portal itself. The user's browser navigates to Google Maps in a new tab — any tracking happens there, not on the portal.

**"Get Directions"** links continue to use `geo:` URIs (or platform-specific fallbacks) to open the user's native maps app.

**Street View availability:** Not all places have Street View coverage (particularly some biographical sites in India). The "See This Place" link is only shown for places where coverage exists. The `places` table already stores latitude/longitude; a `street_view_url` column (nullable) can hold the curated Street View URL for each place.

### Rationale

- **The page isn't a map feature — it's a cross-referencing feature.** The unique value is linking places to book passages, not rendering tiles. An embedded map is the least valuable component on the page.
- **Street View delivers the emotional preview.** Virtually standing outside Lake Shrine or the Encinitas hermitage is more compelling than a pin on a Leaflet map. It's the one map capability that matters for a "Contemplative Geography" page.
- **Zero dependencies > low dependencies.** Leaflet is lightweight and stable, but zero map libraries is lighter and more stable. On a 10-year project horizon (ADR-004), every dependency is a maintenance commitment.
- **Privacy preserved.** No Google SDK loaded on the portal. The Street View link is an outbound navigation, same as "Get Directions" or the external SRF property links.
- **Future flexibility.** If a dynamic center locator (500+ locations) is built later, the map library decision can be made for that page with that page's requirements. The Sacred Places page doesn't need to carry that dependency preemptively.

### Data Model Change

```sql
ALTER TABLE places ADD COLUMN street_view_url TEXT; -- nullable, only for places with coverage
```

### Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| **Leaflet + OpenStreetMap** (original ADR-069) | Visual overview of all locations; open-source | Library dependency for ~20 pins; page works without it; less compelling than Street View for virtual visits |
| **Google Maps embed** | Familiar UX; Street View inline | Google tracking scripts on page; API costs; contradicts privacy principles |
| **No map, no Street View** | Simplest possible | Misses the virtual visit opportunity that makes the page come alive |

### Consequences

- Leaflet and OpenStreetMap are removed from the project's dependency list
- The `places` table gains a nullable `street_view_url` column
- Sacred Places work is simpler: add biographical sites + Street View links + Reader ↔ Place cross-reference cards
- The future center locator (if built) makes its own map library decision independently
- CLAUDE.md tech stack table updated to remove the Maps row

---

---

## ADR-071: Crisis Resource Presence — Gentle Safety Net on Grief and Death Content

- **Status:** Accepted
- **Date:** 2026-02-21

### Context

The portal's grief and death content strategy targets seekers searching for "what happens after death," "spiritual comfort after loss," and "soul immortality." These are among the portal's highest-impact empathic entry points — they serve people in genuine pain. The SEO strategy deliberately positions the portal to rank for grief-related Yogananda queries.

This strategy will reach people who are actively suicidal. A person searching at 2 AM for "what happens after death" may not be grieving a loss — they may be considering ending their own life. Yogananda's passages about the immortality of the soul, the freedom of death, and the continuation of consciousness are truthful and beautiful. But presented without context to a person in crisis, they could be read as endorsement of self-harm — a reading that fundamentally contradicts Yogananda's teaching that human life is a sacred opportunity for spiritual growth.

The portal's "direct quotes only" principle (ADR-001) means it cannot add interpretive framing around passages. The Calm Technology principle means it cannot use aggressive modals or interstitials. The DELTA framework means it cannot identify or track vulnerable users. The question is: within these constraints, what is the portal's moral responsibility?

### Decision

1. **Display a non-intrusive crisis resource line on grief-adjacent content.** On the grief theme page (`/themes/grief`), on search results pages when the query matches grief/death intent patterns, and on the Quiet Corner page, display a single quiet line below the content area:

 > *If you or someone you know is in crisis, help is available.* [Crisis helpline link]

 Styled in `portal-text-muted`, smaller than body text, visually consistent with footer links — present but not competing with the teachings. No modal, no pop-up, no interstitial.

2. **Locale-appropriate crisis resources.** Each supported locale provides the appropriate helpline:
 - `en`: 988 Suicide and Crisis Lifeline (US), Samaritans 116 123 (UK/EU)
 - `es`: Teléfono de la Esperanza (Spain), local equivalents (Latin America)
 - `hi`/`bn`: iCall, Vandrevala Foundation, AASRA
 - `ja`: Inochi no Denwa
 - `th`: Samaritans of Thailand (1323)
 - Other locales: IASP directory link as fallback

 Resource data stored in locale files (`messages/{locale}.json`) alongside other UI strings. Editorial review required for all crisis resource text (consistent with ADR-078).

3. **Intent detection is simple, not invasive.** The system does not analyze individual user behavior. Grief-adjacent content is identified by *content type* (grief theme page, death-related teaching topic), not by *user signals*. If a page is about death, it carries the resource line — regardless of who is reading or why.

4. **The Quiet Corner always carries the resource line.** The Quiet Corner is designed for the "2 AM unable to sleep" persona (DESIGN.md § The Quiet Corner). This is the portal's highest-vulnerability context. The crisis resource line is a permanent, subtle feature of the Quiet Corner page.

### Alternatives Considered

1. **No crisis resources at all.** Considered: The portal is a library, not a mental health service. Adding crisis resources could feel patronizing or out of place. However: the portal's SEO strategy *deliberately* targets people searching for comfort around death. Deliberately attracting vulnerable seekers while providing no safety net is a moral failure, not a design choice.

2. **Prominent crisis modal or banner.** Rejected: Violates Calm Technology. A modal on grief content would be alarming, would interrupt the contemplative experience, and would treat every seeker reading about death as a potential suicide risk — which is both inaccurate and disrespectful.

3. **AI-powered crisis detection.** Rejected: Violates DELTA (no behavioral profiling). Would require analyzing user intent beyond content classification. Architecturally incompatible with the portal's privacy commitments.

4. **Link only from the About page or FAQ.** Considered: Less intrusive but defeats the purpose. The person in crisis is not navigating to the About page. The resource must be where the vulnerability is — on the grief content itself.

### Rationale

- **Moral responsibility follows from intentional positioning.** The portal is not passively available — it actively seeks to rank for grief queries. This creates a duty of care that goes beyond what a generic library would bear.
- **The DELTA Dignity principle demands it.** "Users are seekers, not data points." Dignity includes acknowledging that some seekers are in danger and providing a path to help without surveillance or judgment.
- **Calm implementation is possible.** A single muted line below content is not an aggressive intervention. It is the digital equivalent of a crisis helpline card placed on the library counter — available to those who need it, invisible to those who don't.
- **Yogananda's teaching supports it.** Yogananda taught that human life is a precious opportunity for spiritual realization. Self-harm contradicts this teaching. Providing a crisis resource is consistent with the tradition's view of the sacredness of life.
- **Industry precedent exists.** Google displays crisis resources on suicide-related queries. YouTube shows them on self-harm content. The portal should meet this standard without adopting the surveillance mechanisms that accompany it on those platforms.

### Cultural Adaptation of Crisis Resources

The crisis model above was designed from a Western clinical perspective — individual suicidality, helpline-based intervention. This framing is culturally narrow:

- **Collective cultures (India, Latin America, Africa):** Crisis often manifests as family crisis, economic despair, or social shame rather than individual suicidality. The person in distress may not identify as individually suicidal.
- **Helpline trust and availability:** In the West, helplines are trusted and accessible. In much of the Global South, mental health helplines are sparse, stigmatized, or culturally inappropriate. Rural Indian seekers are more likely to contact a pandit, family elder, or local temple than call iCall or the Vandrevala Foundation.
- **Spiritual community as resource:** SRF/YSS centers, local meditation groups, and satsang communities are themselves crisis resources — particularly for seekers already engaged with the tradition.

**Adaptation:** Per-locale crisis resource data in `messages/{locale}.json` should support multiple resource types:

| Resource Type | Example | When Appropriate |
|---------------|---------|-----------------|
| **Helpline** | 988 (US), 116 123 (EU), iCall (India) | All locales — always included where available |
| **Community contact** | "Speak with a trusted elder or spiritual counselor" | Locales where helplines are sparse or stigmatized |
| **SRF/YSS center** | "Find a nearby SRF/YSS center: [link]" | All locales — the organization itself as pastoral resource |
| **Quiet Corner** | "The Quiet Corner offers a space for stillness" | All locales — the portal itself as immediate resource |

The per-locale resource configuration determines which types appear and in what order. The single muted line UI remains — but its content adapts to what the seeker's culture recognizes as help.

**Stakeholder question:** Does SRF/YSS have pastoral care resources (center contacts, counselors) that could complement helpline numbers? See CONTEXT.md § Open Questions (Stakeholder).

### Consequences

- New UI element: crisis resource line on grief theme page, grief-adjacent search results, and Quiet Corner
- Locale files extended with per-locale crisis resource data — supporting multiple resource types (helplines, community contacts, SRF/YSS centers), not only helplines
- CONTEXT.md § Spiritual Design Principles references this ADR
- CONTEXT.md § Open Questions (Stakeholder) includes crisis resource policy question for SRF input, and pastoral care resource question
- No schema changes, no API changes, no privacy implications
- Editorial review required for all crisis resource text before publication
- Annual review recommended: verify helpline numbers and URLs remain current
- Per-locale crisis resource configuration reviewed during Milestone 5b localization for cultural appropriateness

---

---

## ADR-072: Cognitive Accessibility — Reducing Complexity for All Seekers

- **Status:** Accepted
- **Date:** 2026-02-21

### Context

The portal's accessibility commitment (ADR-003) targets WCAG 2.1 AA compliance: vision, hearing, motor, and some cognitive requirements. This covers screen readers, keyboard navigation, color contrast, and reduced motion. But cognitive accessibility is a broader dimension:

- **Decision fatigue.** The homepage presents Today's Wisdom, a search bar, 6 thematic doors, 5 "Seeking..." links, and latest video thumbnails. For a first-time visitor in emotional distress, this quantity of choices may be overwhelming.

- **Gesture vocabulary.** The portal uses: click (navigate), long-press (Dwell), hover-wait (dwell icon reveal), keyboard shortcuts (12 keys), scroll (read), and "Show me another" (refresh). Each individually is intuitive. In aggregate, the gesture vocabulary is larger than most reading applications.

- **Reading complexity.** Yogananda's prose ranges from accessible affirmations to dense philosophical exposition. The portal treats all content equally in presentation.

These concerns apply not only to seekers with cognitive disabilities but also to non-native English speakers (before Milestone 5b adds their language), elderly seekers, seekers under acute emotional stress, and seekers unfamiliar with web conventions.

### Decision

1. **Progressive homepage disclosure for first visits.** On the first visit (sessionStorage, extending DES-007's mechanism), the homepage after the lotus threshold shows a simplified state:
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

3. **Simplified reading mode.** An optional "Focus" toggle in the reader header (Milestone 2b, alongside Dwell) that reduces the reader to: reading column + Next Chapter. The Related Teachings side panel, keyboard shortcut overlay, dwell icon, and bookmark icon are suppressed. The toggle is stored in `localStorage`. This mode serves seekers who want to read a book linearly without the browse-navigation features — and it naturally serves cognitive accessibility needs without labeling them.

4. **Consistent, minimal gesture vocabulary for core tasks.** The portal's essential experience (read, search, navigate) requires only: click, scroll, and type. All other gestures (long-press, hover-wait, keyboard shortcuts) are enhancements. The portal must be fully functional with only the three basic gestures. This is already approximately true but should be an explicit design constraint tested in QA.

### Alternatives Considered

1. **No cognitive accessibility considerations beyond WCAG 2.1 AA.** Rejected: WCAG AA covers minimum cognitive requirements (consistent navigation, error identification, reading level for labels). The portal's mission — serving seekers worldwide, including those in crisis — demands going further.

2. **A dedicated "simple mode" for the entire portal.** Rejected: Labeling creates stigma. "Focus" mode in the reader is a feature, not an accessibility accommodation. The progressive homepage disclosure applies to all first-time visitors, not a special subset.

3. **AI-powered reading level adaptation.** Rejected: Violates the "direct quotes only" principle (ADR-001). Yogananda's words cannot be simplified. The accessibility classification routes seekers to appropriate *passages*, not to modified text.

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
- New "Focus" toggle in reader header (Milestone 2b)
- DESIGN.md § Accessibility Requirements gains a "Cognitive Accessibility" subsection
- DESIGN.md § Homepage updated with progressive disclosure specification
- Editorial workload: passages need accessibility classification during ingestion QA
- No new API endpoints; `accessibility_level` is a query filter on existing endpoints

---

---

## ADR-073: Screen Reader Emotional Quality — Warmth in Spoken Interface

- **Status:** Accepted
- **Date:** 2026-02-21

### Context

The portal's aesthetic — warm cream, serif typography, generous whitespace, gold accents — creates a contemplative atmosphere for sighted seekers. This atmosphere is a core part of the experience. But for blind seekers using screen readers, the portal's "atmosphere" is entirely constructed from spoken language: ARIA labels, landmark names, live-region announcements, alt text, and heading structure.

Standard screen reader markup produces functional but emotionally flat output: "Navigation landmark. Link, Search. Link, Books. Link, Videos. Heading level 1, Today's Wisdom. Blockquote." This is correct. It is also the verbal equivalent of a fluorescent-lit institutional hallway — technically accessible but carrying no warmth.

ADR-003 establishes WCAG 2.1 AA compliance as a Milestone 2a foundation. ADR-074 establishes editorial standards for UI copy. This ADR specifically addresses the quality of language that screen readers speak — an audience of one sense that deserves the same care as the audience of five.

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
- **Consistent with ADR-074.** If UI copy is ministry (ADR-074), then ARIA labels — which *are* UI copy, spoken aloud — are ministry too.

### Consequences

- All ARIA labels reviewed and rewritten to "spoken warmth" standard during Milestone 2a
- Screen reader testing added to Milestone 2a CI/CD (automated ARIA presence) and a dedicated manual audit (emotional quality)
- `/docs/editorial/ui-copy-guide.md` (ADR-074) extended with a screen reader section: ARIA label conventions, examples, and the "spoken warmth" standard
- No schema changes, no API changes
- Cross-reference: ADR-003 (accessibility foundation), ADR-074 (UI copy standards)

---

---

## ADR-074: Micro-Copy as Ministry — Editorial Voice for UI Text

- **Status:** Accepted
- **Date:** 2026-02-21

### Context

The portal's visual design (warm cream, Merriweather serif, generous whitespace, SRF gold accents) creates a contemplative atmosphere the moment a seeker arrives. But visual design is only half of the portal's voice. The other half is *words* — not Yogananda's words (those are governed by sacred text fidelity), but the portal's own words: error messages, empty states, loading text, confirmation dialogs, ARIA announcements, placeholder text, and interstitial copy.

Over a 10-year horizon (ADR-004), dozens of developers will write UI strings. Without a shared understanding of the portal's verbal character, these strings will drift toward generic software copy ("No results found," "Error: please try again," "Loading..."). Each generic string is a missed opportunity — a moment where the portal could embody its mission but instead sounds like every other website.

The portal has a brand identity for its AI: "The Librarian" (ADR-089). But the portal itself — the non-AI UI text — has no equivalent verbal identity.

### Decision

1. **All UI copy is treated as reviewed content.** UI strings are not developer placeholder text. They are part of the seeker's experience and receive the same editorial attention as theme names and curated queries (ADR-078). This means: strings are externalized to locale files from Milestone 2a, reviewed by SRF-aware editors, and never shipped as first-draft developer copy in production.

2. **The portal's verbal character is: a warm, quiet librarian.** Consistent with ADR-089 but extended beyond the AI search persona to all UI text. The voice is:
 - **Warm, not clinical.** "We didn't find a matching passage" not "No results found."
 - **Honest, not apologetic.** "This page doesn't exist" not "Oops! Something went wrong."
 - **Inviting, not instructional.** "As you read, long-press any words that speak to you" not "Tap and hold to bookmark."
 - **Brief, not verbose.** One sentence where one sentence suffices. No filler, no exclamation marks, no emoji.
 - **Never cute, never corporate.** No "Oops," no "Uh oh," no "Great news!" The register is adult, respectful, and spiritually aware.

3. **Specific copy standards for high-impact moments:**

 | Moment | Standard copy | Portal copy |
 |--------|--------------|-------------|
 | No search results | "No results found" | "We didn't find a matching passage. Yogananda wrote on many topics — try different words, or explore a theme." |
 | Network error | "Network error. Retry." | A cached Yogananda passage about patience, with a quiet "Try again" link below. |
 | 404 page | "Page not found" | A Yogananda passage about seeking, with navigation home and a search bar. "This page doesn't exist, but perhaps what you're seeking is here." |
 | Empty bookmarks | "No bookmarks" | "You haven't marked any passages yet. As you read, long-press any words that speak to you." |
 | Loading state | Spinner + "Loading..." | Quiet skeleton screen. No text. If prolonged: the lotus threshold (DES-007) as a fallback. |
 | Timer complete (Quiet Corner) | "Time's up" | No text. Just the chime. Optionally, after a moment, a new passage about carrying stillness into the world. |

4. **ARIA labels carry warmth.** Screen reader announcements are not markup-quality copy — they are the only voice the portal has for blind seekers. "You are now in the Quiet Corner, a space for stillness" rather than "Main content region, The Quiet Corner." "Five passages found about courage" rather than "Search results: 5 items." The warmth that sighted seekers receive from visual design, screen reader users receive from language.

5. **A micro-copywriting guide is maintained in the repository.** Location: `/docs/editorial/ui-copy-guide.md`. Contents: the voice principles above, a glossary of preferred terms (e.g., "seeker" not "user," "passage" not "result," "the teachings" not "our content"), and annotated examples for each page. This guide is a living document, updated as new UI surfaces are added.

### Alternatives Considered

1. **Leave copy to developer judgment.** Rejected: Over 10 years, developer turnover ensures inconsistency. The visual design system (DESIGN.md § Design Tokens) prevents visual drift; a verbal design system prevents copy drift. Same principle.

2. **Full copywriting review for every string before merge.** Considered: Ensures quality but creates a bottleneck. Decision: Milestone 2a strings are reviewed before launch. Post-launch strings are reviewed in batches during locale translation sprints (ADR-078). Developer-authored strings ship to staging, not directly to production.

3. **AI-generated UI copy.** Rejected: The portal prohibits AI-generated user-facing content (ADR-001, ADR-078). UI copy is user-facing. Consistency requires human authorship and review.

### Rationale

- **Every word is a teaching moment.** A portal dedicated to sacred text should treat its own words with care. A 404 page that quotes Yogananda on seeking transforms an error into an encounter.
- **ARIA labels are the portal's voice for blind seekers.** The warm cream background and generous whitespace do nothing for a screen reader user. The quality of the spoken language is their entire aesthetic experience.
- **10-year consistency requires a system.** Design tokens prevent visual drift. Copy standards prevent verbal drift. Both serve the same architectural longevity goal (ADR-004).
- **Micro-copy shapes first impressions.** A seeker's first error message, first empty state, or first loading experience forms a lasting impression of the portal's character.

### Consequences

- New file: `/docs/editorial/ui-copy-guide.md` (created during Milestone 2a alongside locale file externalization)
- All ARIA labels reviewed for warmth and clarity as part of Milestone 2a accessibility foundation (ADR-003)
- DESIGN.md § Frontend Design gains a "UI Copy Standards" subsection referencing this ADR
- Locale files (`messages/*.json`) include copy-guide annotations for translators
- CONTEXT.md open question added: editorial governance of UI copy (who reviews, what process)
- **Per-locale terminology adaptation:** The term "seeker" is the English-language editorial voice. Per-locale editorial review (Milestone 5b) should determine the culturally appropriate term in each language. In Hindi, *sādhak* (साधक, practitioner) or *pāṭhak* (reader) may resonate more than a literal translation of "seeker" — *sādhak* implies active practice, not searching. In Japanese, "seeker" (*tanbōsha*) implies outsider status; "practitioner" or "reader" may feel more respectful. The preferred terms per locale are documented in `/docs/editorial/ui-copy-guide.md` and applied consistently in `messages/{locale}.json`.
- No schema changes, no API changes

---

---

## ADR-075: Multi-Language Architecture — Three-Layer Localization

- **Status:** Accepted
- **Date:** 2026-02-17

### Context

The portal's mission — making the teachings "available freely throughout the world" — requires multi-language support. The core language set (ADR-077) defines 10 languages: en, de, es, fr, it, pt, ja, th, hi, bn. However, localization for this portal has a unique challenge: not all books are translated into all languages. The content availability is asymmetric.

Three distinct layers require different localization strategies:

| Layer | What | Challenge |
|-------|------|-----------|
| **UI chrome** | Navigation, labels, buttons, error messages, search prompts | Small corpus (~200–300 strings). Standard i18n. |
| **Book content** | Yogananda's published text in official SRF/YSS translations | Not all books exist in all languages. Must never machine-translate sacred text. |
| **Search** | Full-text search (language-specific stemming), vector similarity (embedding model dependent), query expansion (LLM language) | Per-language FTS dictionaries. Embedding model must handle target languages. |

### Decision

Implement a **three-layer localization strategy** with English fallback:

**Layer 1 — UI chrome:** Next.js i18n routing with `next-intl` (or `i18next`). URL-based locale prefixes (`/es/search`, `/de/quiet`). English as default (no prefix). All UI strings externalized to locale JSON files from Milestone 2a — never hardcoded in components.

**Layer 2 — Book content:** Language-specific chunks in Neon, differentiated by the existing `language` column on `book_chunks`. No machine translation of Yogananda's words — if an official translation doesn't exist, the book is not available in that language. Contentful locales (production) provide per-locale editorial content.

**Layer 3 — Search:** Per-language pg_search BM25 indexes with ICU tokenization for full-text search (ADR-114). Multilingual embedding model (Voyage voyage-3-large, 1024 dimensions, 26 languages — ADR-118). Claude handles query expansion in all target languages.

**English fallback:** When the user's language has insufficient content (fewer than 3 search results, sparse theme pages, small daily passage pool), supplement with English passages clearly marked with a `[EN]` language tag and "Read in English" links. The fallback is transparent — never silent.

### Milestone 2a i18n Infrastructure + Bilingual UI

Milestone 2a delivers **bilingual UI chrome** (English, Spanish) alongside bilingual content (ADR-128 Tier 1). Spanish UI strings are translated via Claude draft → human review (ADR-078) in Milestone 2a — not deferred to 5b. Hindi and remaining language UI strings are a Milestone 5b deliverable. The i18n infrastructure is in place from day one for all 10 core languages:

| Requirement | Rationale |
|-------------|-----------|
| All UI strings in `messages/en.json` | Retrofitting i18n into hardcoded JSX is expensive |
| `next-intl` configured with `en`, `es` locales | Adding more locales later is a config change, not a refactor |
| CSS logical properties (`margin-inline-start`, not `margin-left`) | Free RTL support for future languages |
| `lang` attribute on `<html>` element | Screen readers and search engines depend on this |
| `language` column on all content tables | Already present in the schema |

### Rationale

- **Mission alignment:** "Freely throughout the world" means in the seeker's language.
- **Sacred text fidelity:** Machine translation of Yogananda's words is unacceptable. Only official SRF/YSS translations are used.
- **Graceful degradation:** English fallback ensures seekers always find something, with honest labeling.
- **Low Milestone 2a cost:** Externalizing strings and using CSS logical properties costs nothing when done from the start but saves a major refactor later.
- **Spiritual terminology:** Sanskrit terms (samadhi, karma, dharma, prana) appear differently across translations — some keep Sanskrit, some translate, some transliterate. Per-language search must handle both forms.

### Design Decisions (Multilingual Audit, 2026-02-18)

The following decisions were made during a comprehensive multilingual audit to ensure the architecture serves Earth's population:

1. **Locale-first search.** The `language` API parameter means "the user's locale," not "detected query language." Auto-detection on short queries is unreliable ("karma" is identical in six languages). The service layer (not the SQL function) implements the English fallback when locale results < 3. This keeps the database function clean and the fallback policy in application code.

2. **Theme slugs stay in English.** `/es/themes/peace`, not `/es/temas/paz`. English slugs provide URL stability — no breakage if the taxonomy changes. Display names are localized via a `topic_translations` table. `hreflang` tags handle the SEO signal.

3. **`reader_url` is locale-relative.** API responses return `/books/slug/chapter#chunk` without locale prefix. The client (web or mobile) prepends the locale. This keeps the API presentation-agnostic per ADR-011.

4. **Locale + English fallback is the multilingual model.** The practical need is the seeker's language plus English supplementation — not arbitrary cross-language search (e.g., Japanese query finding German results). The multilingual embedding model *enables* cross-language search at near-zero cost, but the core experience is locale-first with English fallback. Cross-language search may be activated later if usage data justifies it, but it is not a core Milestone 5b deliverable.

5. **`canonical_book_id` links translations to originals.** A new column on `books` enables "Available in 6 languages" on the Books page and "Read in English →" navigation between editions. The `canonical_chunk_id` column on `book_chunks` enables passage-level cross-language links.

6. **`chunk_relations` stores per-language relations.** Top 30 same-language + top 10 English supplemental per chunk ensures non-English languages get full related teachings without constant real-time fallback. The English supplemental relations follow the same pattern as the search fallback — supplement, clearly mark with `[EN]`, never silently substitute.

7. **Per-language search quality evaluation is a launch gate.** Each language requires a dedicated search quality test suite (15–20 queries with expected passages) that must pass before that language goes live. This mirrors Arc 1's bilingual search quality evaluation (Deliverable M1a-8: ~58 en + Milestone 1b: ~15 es queries) and prevents launching a language with degraded retrieval quality.

8. **Chunk size must be validated per language.** English-calibrated chunk sizes (200/300/500 tokens) may produce different semantic density across scripts. Per-language chunk size benchmarking is required during Milestone 5b ingestion — particularly for CJK and Indic scripts where tokenization differs significantly from Latin text.

### Consequences

- Milestone 2a includes i18n infrastructure setup (locale routing, string externalization) and **bilingual UI chrome** (en/es) via Claude draft → human review (ADR-078); Arc 1 content is bilingual (en/es) per ADR-128
- Arc 1 includes the `topic_translations` table (empty until Milestone 5b)
- Milestone 5b requires knowing which books SRF has in digital translated form (stakeholder question)
- Milestone 2a Spanish UI string translation uses the AI-assisted workflow (ADR-078): Claude generates drafts, human reviewer refines tone, spiritual terminology, and cultural nuance. Milestone 5b repeats this proven workflow for Hindi and remaining 7 languages.
- The content availability matrix creates asymmetric experiences per language — this is honest, not a bug
- The book catalog per language shows only available books, plus a "Also available in English" section
- The `hybrid_search` function accepts a `search_language` parameter and filters to the user's locale
- Per-language pg_search BM25 indexes with ICU tokenization provide language-aware full-text search (ADR-114)
- All content-serving API endpoints accept a `language` parameter with English fallback at the service layer
- Per-language search quality test suite (15–20 queries per language) is a launch gate before any language goes live in Milestone 5b
- Per-language chunk size benchmarking required during Milestone 5b ingestion for non-Latin scripts
- `books.bookstore_url` provides "Find this book" links to SRF Bookstore. Per-language bookstore routing (e.g., YSS Bookstore for Hindi/Bengali) can be added via a simple lookup table if needed at Milestone 5b.

---

---

## ADR-076: CSS Logical Properties

- **Status:** Accepted
- **Date:** 2026-02-17

### Context

The core language set (en, de, es, fr, it, pt, ja, th, hi, bn) includes only left-to-right (LTR) languages. However, Yogananda's teachings have readership in Arabic, Urdu, and Hebrew-speaking communities (evaluation candidates). Building a CSS architecture that only works for LTR requires a significant retrofit when RTL languages are added.

CSS logical properties (`margin-inline-start` instead of `margin-left`, `padding-block-end` instead of `padding-bottom`) provide directional-agnostic layout at zero additional cost when used from the start.

### Decision

Use **CSS logical properties** throughout all portal stylesheets and Tailwind utility classes from Milestone 2a.

**In practice:**

| Instead of | Use |
|-----------|-----|
| `margin-left` | `margin-inline-start` |
| `margin-right` | `margin-inline-end` |
| `padding-left` | `padding-inline-start` |
| `text-align: left` | `text-align: start` |
| `float: left` | `float: inline-start` |
| `border-left` | `border-inline-start` |

Tailwind CSS supports logical properties via the `ms-*` (margin-start), `me-*` (margin-end), `ps-*`, `pe-*` utilities.

### Rationale

- **Zero cost now, high cost later.** Writing `ms-4` instead of `ml-4` takes the same keystrokes. Retrofitting an entire codebase from physical to logical properties is a multi-day refactor.
- **Future-proofing.** Arabic and Urdu readership of Yogananda's works exists. Hindi uses Devanagari (LTR but with specific layout expectations). RTL support is not speculative — it's eventual.
- **Browser support.** Logical properties are supported in all modern browsers (97%+ global coverage as of 2025).

### Consequences

- Developers must be trained/reminded to use logical properties (Tailwind's `ms-*`/`me-*`/`ps-*`/`pe-*` instead of `ml-*`/`mr-*`/`pl-*`/`pr-*`)
- **CI enforces logical property usage.** A grep-based CI check scans all `.tsx`, `.ts`, and `.css` files for physical property patterns (`ml-`, `mr-`, `pl-`, `pr-`, `margin-left`, `margin-right`, `padding-left`, `padding-right`, `text-align: left`, `text-align: right`, `float: left`, `float: right`, `border-left`, `border-right`) and fails the build if any are found outside explicitly allowlisted exceptions (e.g., third-party overrides). This replaces the earlier aspiration of "can enforce" with a concrete gate. Implementation: shell script in CI (`scripts/lint-logical-properties.sh`) or an ESLint custom rule.
- Adding `dir="rtl"` to an RTL locale "just works" for layout — only typography and some edge cases need special attention

---

---

## ADR-077: Core Language Set and Priority Ordering

- **Status:** Accepted
- **Date:** 2026-02-17

### Context

The portal's mission — making the teachings "available freely throughout the world" — requires multi-language support. The question is not *whether* to support multiple languages, but *which* languages constitute the core commitment and how to sequence them.

Official SRF/YSS translations of Yogananda's works exist in multiple languages. The core language set should reflect the intersection of mission reach, available translations, and organizational presence. A previous revision (2026-02-24) adopted "no wave ordering" to avoid Western-before-Indian sequencing. However, analysis revealed that "all 9 simultaneously" in practice meant "none until we can resource all 9" — deferring Hindi (609M speakers, Yogananda's country) and Bengali (284M speakers, Yogananda's mother tongue) to the same timeline as Italian (68M speakers). ADR-128 established a quantitative framework to resolve this: order by reachable population.

### Decision

Define a **core language set of 10 languages** that the portal commits to supporting. Languages are **ordered by reachable population** (ADR-128) and ship as they clear a readiness gate.

**Priority ordering:**

| Priority | Language | Code | Script | Reachable | Rationale |
|----------|----------|------|--------|-----------|-----------|
| — | **English** | en | Latin | ~390M L1 | Default. All content originates in English. |
| **Tier 1** | **Hindi** | hi | Devanagari | **~425M** | Yogananda's country. YSS homeland. Largest non-English audience. |
| **Tier 1** | **Spanish** | es | Latin | **~430M** | Highest L1 ratio (86.7%). Strong SRF Latin America presence. |
| Tier 2 | **Portuguese** | pt | Latin | ~225M | Brazil digital leader. High L1 ratio (93.6%). |
| Tier 2 | **Bengali** | bn | Bengali | ~130M | Yogananda's mother tongue. Deep YSS catalog. |
| Tier 3 | **German** | de | Latin | ~123M | SRF Deutschland. Near-universal internet. |
| Tier 3 | **Japanese** | ja | CJK | ~119M | Established SRF Japan presence. |
| Tier 3 | **French** | fr | Latin | ~116M | Francophone Africa + France + Canada. |
| Tier 3 | **Italian** | it | Latin | ~61M | Official translations exist. |
| Tier 3 | **Thai** | th | Thai | ~49M | SRF/YSS Thailand. Script diversity forcing function. |

*Speaker data: Ethnologue 2025. Internet penetration: ITU/DataReportal 2025–2026. Full analysis: docs/reference/Prioritizing Global Language Rollout.md.*

**Tier 1 (Hindi, Spanish):** Both Tier 1 by reachable population. Spanish activated in Arc 1 alongside English (~820M reachable). Hindi deferred from Arc 1 — authorized YSS ebook only purchasable from India/Nepal/Sri Lanka (Razorpay); Amazon Kindle edition is third-party (Fingerprint! Publishing). Hindi activates when an authorized source becomes available (Milestone 5b or earlier).

**Tier 2 (Portuguese, Bengali):** Activated as the next priority after Tier 1 languages are live. Bengali's mission weight (Yogananda's mother tongue, YSS heartland) is significant despite lower internet penetration.

**Tier 3 (German, Japanese, French, Italian, Thai):** Activated as content and reviewer readiness permits, ordered by reachable population within resourcing constraints.

**Language readiness gate:** A language ships when: (1) *Autobiography of a Yogi* digital text is ingested, (2) UI strings (~200–300) are translated and human-reviewed per ADR-078, (3) per-language search quality evaluation passes (15–20 test queries, ≥ 80% relevant in top 3). Languages ship independently — no language waits for another.

**Evaluation candidates** (not in core set, evaluated based on demand data and translation availability): Chinese, Korean, Russian, Arabic, Indonesian. See ADR-128 § Evaluation Candidates for demographic analysis.

### Rationale

- **Mission integrity.** The core set covers the languages where official Yogananda translations exist and SRF/YSS has organizational presence. Every core language has published translations — the portal serves verbatim text, not machine-translated content.
- **Reachable population ordering.** Priority determined by `speakers × internet_penetration × content_availability` (ADR-128). Spanish matches English L1 reach. Hindi is Tier 1 by population but deferred from Arc 1 due to authorized source availability — activates when sourcing resolves.
- **Population reach.** The core set covers ~3 billion speakers across 6 scripts (Latin, CJK, Thai, Devanagari, Bengali). Hindi + Bengali alone exceed 830M speakers.
- **Script diversity drives architectural quality.** Supporting Latin, CJK, Thai, Devanagari, and Bengali from the core set forces robust i18n infrastructure — font loading, line-height adaptation, word-boundary handling (Thai has none), search tokenization.
- **Thai inclusion.** Official Thai translations exist. Thai script's lack of word boundaries makes it an excellent forcing function for search tokenization quality. SRF/YSS has presence in Thailand.

### Risks

- **Tier 1 adds scope incrementally.** Spanish ingestion in Arc 1 requires per-language search quality evaluation. Hindi (when sourced) requires the same plus full Devanāgarī typography (Noto Serif Devanagari for reading, Noto Sans Devanagari for UI — ADR-080) and conjunct rendering QA. Mitigated: same ingestion pipeline, same embedding model (Voyage multilingual), same search infrastructure. Incremental cost is modest.
- **Digital text availability.** Confirmed that official translations exist in all core languages. Digital text availability (machine-readable format) must be verified per language — a critical stakeholder question. Arc 1 uses purchased books as temporary sources (same approach as spiritmaji.com for English).
- **Human reviewer availability.** Each language needs a fluent, SRF-aware reviewer for UI strings (ADR-078). The readiness gate ensures no language ships with unreviewed translations.
- **Thai script complexity.** Thai has no word boundaries, combining characters, and tone marks. Search tokenization (pg_search ICU) handles Thai, but per-language search quality benchmarking is essential.

### Consequences

- Spanish *Autobiography* ingested in Arc 1 alongside English — bilingual from the proof-of-concept. Hindi ingested when authorized source becomes available (Milestone 5b or earlier).
- Remaining languages activate ordered by reachable population, each clearing the readiness gate independently
- Need to confirm digital text availability for all core languages (stakeholder question)
- YSS-specific UI adaptations needed for Hindi and Bengali locales (organizational branding differences between SRF and YSS per ADR-079)
- Font stacks: Noto Serif/Sans Devanagari (Hindi — eagerly preloaded on `/hi/` locale, conditionally on English pages), Noto Sans/Serif Bengali (Bengali), Noto Sans/Serif Thai (Thai), Noto Sans/Serif JP (Japanese). Non-Hindi fonts loaded conditionally per locale.
- Portal URL and branding question for Hindi/Bengali: same domain (`teachings.yogananda.org/hi/`) or YSS-branded domain?
- YSS representatives participate in Hindi/Bengali design decisions as co-equal stakeholders (see CONTEXT.md § Stakeholders)
- Thai design decisions require input from SRF/YSS Thailand community

---

---

## ADR-078: AI-Assisted Translation Workflow

- **Status:** Accepted
- **Date:** 2026-02-17

### Context

The portal requires translating ~200–300 UI strings (nav labels, button text, search prompts, error messages, footer links, accessibility labels) into 9 languages. Spanish (Tier 1) is translated in Milestone 2a alongside bilingual content — a seeker reading Spanish content deserves Spanish navigation. Hindi (Tier 1, deferred) is translated when content becomes available. Remaining 7 languages are translated in Milestone 5b. The question: who translates these, and how?

Three categories of translatable content exist in the portal, each with fundamentally different fidelity requirements:

| Category | Examples | AI Translation Acceptable? |
|----------|----------|---------------------------|
| **Yogananda's published text** | Book chapters, quoted passages, passage titles | **Never.** Only official SRF/YSS human translations. |
| **Portal UI chrome** | "Search the teachings," "Go deeper," nav labels, error messages | **As draft only.** Claude generates initial translations; mandatory human review before deployment. |
| **Portal-authored content** | About page copy, theme descriptions, "What Next" bridge text | **As draft only.** Same workflow as UI chrome. |

The distinction is absolute: Yogananda's words are sacred text transmitted through a realized master. The portal's own UI copy is functional prose written by the development team. Different fidelity standards apply.

### Decision

Use **Claude API to generate draft translations** of UI chrome and portal-authored content. Every draft must pass through **mandatory human review** by a reviewer who is:
1. Fluent in the target language
2. Familiar with SRF's devotional register and spiritual terminology
3. Able to distinguish clinical/formal tone from warm, devotional tone

**Never use AI (Claude or any other model) to translate, paraphrase, or synthesize any SRF-published author's text.** This applies to all three author tiers (PRO-014: guru, president, monastic). This is an inviolable constraint, not a cost optimization to revisit later.

### Workflow

```
messages/en.json (source of truth)
 │
 ▼
 Claude API draft
 (system prompt enforces SRF tone,
 spiritual terminology glossary,
 target locale context)
 │
 ▼
 messages/{locale}.draft.json
 │
 ▼
 Human reviewer (fluent + SRF-aware)
 — Corrects tone and nuance
 — Validates spiritual terms
 — Flags ambiguous strings
 │
 ▼
 messages/{locale}.json (production)
```

### Translation Prompt Guidelines

The Claude system prompt for UI translation should include:
- SRF's spiritual terminology glossary (e.g., "Self-realization," "Kriya Yoga," "divine consciousness" — these may remain untranslated or have specific approved translations per language)
- Instruction to preserve the warm, devotional tone — avoid clinical or corporate phrasing
- Context for each string (where it appears, what it does) so the translation fits the UI context
- Instruction to flag uncertainty rather than guess (e.g., mark `[REVIEW]` when unsure)
- ICU MessageFormat awareness — interpolated strings (`{count} results found`) require correct grammar for the target language's number/gender agreement

### Translation Automation

**Why Claude over DeepL/Google.** The bottleneck for spiritual UI text isn't vocabulary accuracy — it's *devotional register*. "Search the teachings" should feel like an invitation from a friend, not a software prompt. Claude can absorb the full glossary, tone guidance, and per-string context simultaneously. No other service processes all four inputs in a single call. DeepL produces accurate words in the wrong voice; Claude produces the right voice that needs minor corrections.

**Script:** `scripts/translate-ui.ts` — runs on-demand (not CI-integrated). Reads `messages/en.json`, diffs against existing `messages/{locale}.json`, loads `messages/glossary-{locale}.json` and `messages/en.context.json`, sends new/changed keys to Claude API (via AWS Bedrock), writes `messages/{locale}.draft.json`. Logs which strings were flagged `[REVIEW]`.

**String context file:** `messages/en.context.json` — parallel to `en.json`, maps each key to a one-line description of where it appears and what it does. Version-controlled. Example:

```json
{
  "search.placeholder": "Search input placeholder on the main search page",
  "search.noResults": "Shown when search returns zero results, below the search box",
  "nav.books": "Top navigation bar link to the Books listing page",
  "quiet.timerStart": "Button label to begin the Quiet Corner meditation timer"
}
```

**Glossary bootstrap (Milestone 2a).** `glossary-hi.json` and `glossary-es.json` seeded from: (1) existing YSS Hindi publications for approved Hindi spiritual terminology, (2) existing SRF Spanish publications for approved Spanish spiritual terminology, (3) Sanskrit proper nouns that remain untranslated (Kriya Yoga, samadhi, pranayama). The glossary is the most important artifact — it's what makes Claude's output devotionally correct rather than merely linguistically correct. Built before any translation runs.

**Reviewer recruitment.** The human review dependency is the actual bottleneck — not the technology. YSS (Yogoda Satsanga Society of India) has Hindi speakers. SRF has Spanish-speaking monastics and members across Latin America. Identifying reviewers is a stakeholder question that should be resolved early in Milestone 2a.

### Rationale

- **Cost efficiency.** Professional translation of 300 strings × 8 languages = 2,400 translation units. AI drafting reduces this to a review task rather than a from-scratch task, cutting cost and time significantly.
- **Quality floor.** Claude produces competent translations in all core languages (es, de, fr, it, pt, ja, th, hi, bn). The human reviewer elevates from competent to appropriate — catching tone, register, and spiritual terminology issues.
- **Sacred text boundary is absolute.** No amount of cost savings justifies AI-translating any SRF-published author's words (PRO-014: all author tiers). The portal serves *official SRF/YSS translations* or nothing. This is a theological constraint, not a technical one.
- **Scalable.** As new languages are added beyond the core set, the same workflow applies — Claude draft → human review. No need to find full professional translation services for each new locale.

### Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| **Professional translation only** | Highest quality from day one | Expensive for UI strings that change often; slow turnaround for iterative development |
| **AI translation with no review** | Cheapest, fastest | Unacceptable risk of clinical tone, wrong spiritual terms, or culturally inappropriate phrasing |
| **Community/volunteer translation** | Free, deeply motivated translators | Unpredictable quality and timeline; coordination overhead; IP/liability concerns |

### Spiritual Terminology Glossary

The glossary is a critical dependency for both the AI drafting step and the human review step. It defines how spiritual terms are handled per language — which terms remain in Sanskrit, which have approved translations, and which are transliterated.

**Storage:** A JSONB column in Neon, stored as a per-language glossary file at `/messages/glossary-{locale}.json`. This is a content-editor-centric artifact — maintained alongside the locale JSON files, version-controlled in Git, and eventually migrated to Contentful when Custom Apps are activated.

**Structure:**

```json
// messages/glossary-de.json
{
 "terms": [
 {
 "english": "Self-realization",
 "translated": "Selbstverwirklichung",
 "notes": "Standard German spiritual term. Always capitalized."
 },
 {
 "english": "Kriya Yoga",
 "translated": "Kriya Yoga",
 "notes": "Never translated. Proper noun."
 },
 {
 "english": "samadhi",
 "translated": "Samadhi",
 "notes": "Keep Sanskrit. German readers familiar with the term. Also found as 'Überbewusstsein' in some older translations."
 }
 ],
 "tone_guidance": "Warm, devotional, not academic. 'Sie' form (formal). Avoid clinical psychological vocabulary."
}
```

**Workflow:** The glossary is built incrementally during the first human review cycle for each language. The reviewer flags terms, provides translations, and adds notes. Subsequent review cycles and AI drafting both reference the glossary. The Claude system prompt for UI translation includes the glossary to improve first-draft quality.

**Migration path:** When Contentful Custom Apps are activated, glossaries can be modeled as a Contentful content type with per-locale entries, enabling content editors to manage terminology without touching JSON files.

### Consequences

- Milestone 2a (hi/es) and Milestone 5b (remaining 7 languages) use AI-assisted workflow: Claude draft → human review → production
- Spiritual terminology glossary stored as `/messages/glossary-{locale}.json` — built incrementally during first review cycle, referenced by both AI drafting and human review
- The `messages/{locale}.draft.json` → `messages/{locale}.json` promotion step should be tracked (Git diff review)
- Reviewer recruitment: SRF likely has multilingual monastics and volunteers who can review UI translations — this is a stakeholder question
- The same workflow applies to portal-authored content (About page, theme descriptions, "Seeking..." entry points, etc.)
- Glossary files migrate to Contentful content types when Contentful Custom Apps are activated

---

---

## ADR-080: Sanskrit Display, Search Normalization, and Devanāgarī Typography

**Status:** Accepted | **Date:** 2026-02-21

### Context

Yogananda's published works contain Sanskrit in four distinct modes: (1) transliterated terms embedded in English prose ("samadhi"), (2) scholarly transliteration with IAST diacritics ("prāṇāyāma"), (3) Devanāgarī script quotations (original Bhagavad Gita verses in *God Talks with Arjuna*), and (4) phonetic/chanted forms ("Om Tat Sat"). SRF publications use house romanizations that sometimes diverge from academic IAST — "Babaji" rather than "Bābājī," "Kriya Yoga" rather than "Kriyā Yoga," "pranayama" in some books and "prāṇāyāma" in others.

This creates three technical challenges: (a) seekers searching for a term in any variant spelling must find matching passages regardless of which form the published text uses, (b) display must faithfully preserve whatever form appears in the SRF publication, and (c) certain terms — most notably Aum vs. Om — carry theological distinctions that search normalization must not collapse.

Sanskrit is not a Milestone 5b problem. It is embedded in the Arc 1 English corpus. *God Talks with Arjuna* contains Devanāgarī verses. The *Autobiography* and *Holy Science* contain heavy IAST transliteration. The ingestion pipeline, search index, font stack, and glossary must handle Sanskrit from Arc 1.

### Decision

Establish a four-part policy governing Sanskrit text throughout the portal:

**1. Display fidelity: SRF published text is canonical.**

The portal displays exactly what appears in SRF's published edition. If the book prints "pranayama" without diacritics, the portal displays "pranayama." If *God Talks with Arjuna* uses "prāṇāyāma" with full IAST, the portal displays that. The ingestion pipeline must not "correct" SRF spellings to academic IAST, nor strip diacritics from texts that include them.

**2. Search normalization: collapse orthographic variants, preserve semantic distinctions.**

The search index collapses purely orthographic variants so that all of the following resolve to the same search results:
- `pranayama`, `prāṇāyāma`, `PRANAYAMA`, `Pranayama`, `prana-yama`

Implementation:
- **Unicode NFC normalization** is a mandatory preprocessing step in the ingestion pipeline, applied before any text comparison, deduplication, embedding, or indexing. OCR output is unpredictable about precomposed vs. decomposed Unicode forms for IAST combining characters (ā, ṇ, ś, ṣ). NFC ensures consistent representation.
- **ICU normalization in pg_search BM25** handles diacritical variant collapsing natively via the ICU tokenizer (ADR-114). The `unaccent` extension remains available for pg_trgm fuzzy matching but is not needed for the primary full-text search index.
- **Display text is never modified.** The `content` column stores the original text with diacritics preserved. Only the search index and embedding input are normalized.

**Exception — Aum/Om:** Yogananda used "Aum" (three-syllable cosmic vibration) deliberately, distinguishing it from the single-syllable "Om." This distinction is theological, not orthographic. Search normalization must not collapse "Aum" to "Om." Instead, the Vocabulary Bridge (ADR-129) maps "Om" → ["Aum", "cosmic vibration", "Holy Ghost", "Amen"] for query expansion, preserving the distinction while ensuring seekers who search "Om" find Aum passages.

**General principle:** Where Yogananda's usage intentionally diverges from common usage and the divergence itself constitutes a teaching, the search system preserves the distinction via the terminology bridge (query expansion) rather than collapsing it in the index. Other examples: "meditation" (Yogananda's technique-specific meaning), "Christ" (Christ Consciousness / Kutastha Chaitanya), "Self-realization" (capitalized, specific metaphysical attainment).

**3. Devanāgarī handling in the English corpus.**

*God Talks with Arjuna* contains original Bhagavad Gita verses in Devanāgarī alongside romanized transliteration and English commentary. *The Holy Science* by Sri Yukteswar contains Sanskrit verses in Devanāgarī. The *Autobiography* contains heavy IAST transliteration. Each *Gita* chapter typically includes: (a) Devanāgarī verse, (b) romanized transliteration, (c) word-by-word translation, (d) Yogananda's full commentary.

- **Display:** Devanāgarī verses are preserved in `chunk_content` and rendered using Noto Sans Devanagari in the font stack. The Devanāgarī font loads from Arc 1 (not Milestone 5b) because the English-language Gita and Holy Science contain Devanāgarī — and because Hindi content is ingested in Arc 1 (ADR-128).
- **Search indexing:** Devanāgarī script passages *in the English corpus* are excluded from the embedding input via a script-detection preprocessing step. The English commentary and romanized transliteration are embedded. Rationale: embedding raw Devanāgarī verses alongside English commentary would dilute retrieval quality for the English-language search context — seekers search the commentary, not the original verses. **Exception:** Hindi corpus chunks are entirely Devanāgarī and are embedded normally — the exclusion applies only to Devanāgarī verse blocks within English-language chunks.
- **Chunking (extends ADR-048):** For verse-aware chunking in the English corpus, the Devanāgarī verse text is preserved as metadata on the verse-commentary chunk but excluded from the token count that determines chunk splitting. The romanized transliteration is included in both the chunk content and the embedding input. Hindi corpus chunks use standard chunking — the entire text is Devanāgarī and is treated as primary content.

**5. Devanāgarī as primary reading script (Hindi locale — Arc 1).**

With Hindi *Autobiography of a Yogi* in Arc 1 (ADR-128), Devanāgarī transitions from supplemental verse blocks to a full-text reading experience. This requires typography treatment fundamentally different from occasional verse rendering:

- **Reading font:** Noto **Serif** Devanagari for sustained body text reading (not Noto Sans, which is used for UI chrome and verse display). Hindi readers expect serif-like letterforms with modulated stroke weight for long-form reading, analogous to Merriweather for English.
- **Font size scaling:** Devanāgarī glyphs are optically smaller than Latin at the same point size due to the shirorekha (headline) and complex conjunct forms. Hindi body text uses `--text-base-hi: 1.25rem` (20px) — approximately 11% larger than the Latin `--text-base` of 18px. This is a design token, not a hack.
- **Line height:** `--leading-relaxed-hi: 1.9` (vs. 1.8 for Latin). Devanāgarī requires slightly more vertical space due to the shirorekha connecting characters at the top and matras (vowel signs) extending below the baseline.
- **Optimal line length:** 40–50 aksharas (syllabic units) per line, vs. 65–75 characters for Latin. Hindi words tend to be longer due to conjunct clusters. `max-width` for the Hindi reader adjusted accordingly.
- **Drop capitals:** Omitted for Devanāgarī — this is a Western book convention with no equivalent in Hindi typographic tradition.
- **Font loading strategy:** On `/hi/` locale pages, Noto Serif Devanagari and Noto Sans Devanagari load **eagerly** (preload in `<head>`), not conditionally. Conditional loading remains for Devanāgarī content appearing on English-locale pages (Gita verses, Holy Science verses).
- **Conjunct rendering QA:** Hindi has hundreds of conjunct characters (jodakshar): क्ष, त्र, ज्ञ, श्र, and many more. Matras (vowel signs like ि, ी, ु, ू, े, ै, ो, ौ) must not collide with consonants at any font size. Halant/virama (्) must render correctly for consonant clusters. Verify at `--text-sm` (15px equivalent) where rendering issues are most likely.
- **Nukta characters:** Hindi borrows sounds from Persian/Arabic (फ़, ज़, ख़, ग़). Verify that the YSS Hindi *Autobiography* edition's usage is preserved faithfully.
- **Quote image generation:** `@vercel/og` (Satori) requires explicit font files — it does not fall back to system fonts. Hindi passage images use Noto Serif Devanagari. The OG image route selects font based on the passage's `language` column. This is Arc 1 scope, not Milestone 5b.
- **PDF export:** Hindi passages use Noto Serif Devanagari at 12pt (scaled from Latin 11pt). PDF generation pipeline must bundle the Devanāgarī font.
- **Print stylesheet:** `@media print` font-family for `/hi/` locale uses `'Noto Serif Devanagari'` at 12pt. Arc 1 scope.

**4. Terminology bridge extensions for Sanskrit and cross-tradition terms.**

The Vocabulary Bridge (ADR-129) includes two extraction categories particularly relevant to Sanskrit handling:

- **Sanskrit-to-English inline definitions:** Yogananda frequently defines Sanskrit terms inline — "Samadhi, the superconscious state of union with God." The ingestion QA step (ADR-005 E4) flags these as glossary source candidates. Claude identifies passages where Yogananda provides his own definition of a Sanskrit term, creating a machine-assisted but human-verified bridge built from Yogananda's own words.
- **Cross-tradition terms:** The bridge accepts Pali, Bengali, and Hindi variant spellings as keys mapping to Yogananda's vocabulary (e.g., "nibbāna" → ["final liberation", "God-union"], "dhyāna" → ["meditation"]). The vocabulary extraction step (ADR-129 per-book lifecycle) explicitly seeks non-Sanskrit Indic terms Yogananda uses or that seekers from other traditions might search.

### Glossary enrichment (extends ADR-038)

The `glossary_terms` schema gains three optional columns:

```sql
ALTER TABLE glossary_terms ADD COLUMN phonetic_guide TEXT; -- "PRAH-nah-YAH-mah"
ALTER TABLE glossary_terms ADD COLUMN pronunciation_url TEXT; -- Future: URL to audio (Milestone 5b+)
ALTER TABLE glossary_terms ADD COLUMN has_teaching_distinction BOOLEAN NOT NULL DEFAULT false;
 -- True when Yogananda's usage intentionally differs from common usage
 -- and the difference itself is part of the teaching (e.g., Aum vs. Om,
 -- meditation, Self-realization). The glossary entry for these terms
 -- should explicitly address the distinction.
```

### Rationale

- **SRF published text as canonical** follows the direct-quotes-only principle (ADR-001). The portal is a faithful librarian, not an editor.
- **Unicode NFC normalization** is standard practice for text processing pipelines that handle combining characters. Without it, identical-looking strings can fail equality checks, deduplication, and search matching.
- **ICU tokenization in pg_search BM25** (ADR-114) handles diacritics normalization natively, collapsing orthographic variants in the search index without altering stored data. The `unaccent` extension remains for pg_trgm fuzzy matching.
- **The Aum/Om exception** reflects a general principle: search normalization handles orthography; the terminology bridge handles semantics. Collapsing semantically distinct terms in the index would lose information that cannot be recovered.
- **Devanāgarī fonts in Arc 1** because the content is present in Arc 1 — both as Gita/Holy Science verses in the English corpus and as the entire Hindi *Autobiography* (ADR-128). Deferring font support to Milestone 5b would break rendering for Hindi readers. Noto Serif Devanagari for reading and Noto Sans Devanagari for UI/verses — the same serif/sans distinction as the Latin stack (Merriweather/Open Sans).
- **Pronunciation in the glossary** serves seekers who encounter Sanskrit for the first time. Phonetic guides are a minimal editorial effort with high impact for newcomers. Audio pronunciation is deferred until SRF can provide approved recordings.
- **`has_teaching_distinction`** enables the glossary UI to highlight terms where the gap between common and Yogananda-specific usage is pedagogically important — inviting seekers into the teaching through the vocabulary itself.

### Consequences

- **Ingestion pipeline:** Unicode NFC normalization added as a mandatory preprocessing step (Step 2.5 in DESIGN.md § Content Ingestion Pipeline)
- **Search index:** pg_search BM25 index with ICU tokenizer handles diacritics normalization natively (ADR-114). The `unaccent` extension remains for pg_trgm fuzzy matching.
- **Font stack:** Noto Serif Devanagari (reading) and Noto Sans Devanagari (UI/verses) added for Arc 1. Hindi locale loads eagerly; English pages with Devanāgarī content load conditionally
- **Glossary schema:** Three new nullable columns (`phonetic_guide`, `pronunciation_url`, `has_teaching_distinction`) on `glossary_terms`
- **Vocabulary Bridge:** Two extraction categories (inline Sanskrit definitions, cross-tradition terms) documented in ADR-129 § Per-Book Evolution Lifecycle
- **ADR-048:** Verse-aware chunking for *God Talks with Arjuna* extended with Devanāgarī script handling
- **Extends:** ADR-129, ADR-005 E4, ADR-038, ADR-048
- **New stakeholder questions:** SRF editorial policy on contested transliterations; pronunciation recording availability; *God Talks with Arjuna* Devanāgarī display confirmation
- **New technical questions:** IAST diacritics rendering verification in Merriweather/Lora at small sizes

- **Quote images and PDF:** Devanāgarī font bundled for `@vercel/og` and PDF generation from Arc 1 (Hindi passages must render correctly in shared images and printed output)
- **Devanāgarī typography QA:** Conjunct rendering, matra placement, halant/virama, and nukta characters verified at all font sizes as a Milestone 1b success criterion

---

---

## ADR-081: Machine-Readable Content and AI Citation Strategy

**Status:** Accepted
**Date:** 2026-02-19
**Deciders:** Architecture team
**Context:** ADR-001 (AI as librarian), ADR-011 (API-first), ADR-023 (rate limiting), ADR-006 (Global South delivery)

### Context

The portal serves three classes of machine consumer: (1) traditional search engine crawlers (Google, Bing), (2) AI agents and LLM crawlers (GPTBot, PerplexityBot, Google AI), and (3) developer/integration API clients. Each has different needs, but all serve the same mission: making Yogananda's teachings discoverable and correctly attributed. When an AI system quotes Yogananda with book, chapter, and page citation — and links to the portal as the source — that is mission success. The portal should make correct citation so easy and obvious that machines have no reason to paraphrase.

### Decision

Implement a comprehensive machine-readability strategy spanning structured data, citation guidance, syndication feeds, and API documentation. Treat machines as full consumers of the portal's content — not as an afterthought.

### 1. Structured Data (JSON-LD)

Every page emits schema.org JSON-LD appropriate to its content type:

```html
<!-- Book reader page -->
<script type="application/ld+json">
{
 "@context": "https://schema.org",
 "@type": "Book",
 "name": "Autobiography of a Yogi",
 "author": { "@type": "Person", "name": "Paramahansa Yogananda" },
 "publisher": { "@type": "Organization", "name": "Self-Realization Fellowship" },
 "isbn": "978-0-87612-083-5",
 "inLanguage": "en",
 "hasPart": [
 {
 "@type": "Chapter",
 "name": "An Experience in Cosmic Consciousness",
 "position": 14
 }
 ]
}
</script>

<!-- Passage share page -->
<script type="application/ld+json">
{
 "@context": "https://schema.org",
 "@type": "Quotation",
 "text": "The verbatim passage text...",
 "spokenByCharacter": { "@type": "Person", "name": "Paramahansa Yogananda" },
 "isPartOf": {
 "@type": "Book",
 "name": "Autobiography of a Yogi"
 },
 "citation": "Autobiography of a Yogi, Chapter 14, p. 142"
}
</script>

<!-- Audio recording page -->
<script type="application/ld+json">
{
 "@context": "https://schema.org",
 "@type": "AudioObject",
 "name": "The Nature of the Soul",
 "creator": { "@type": "Person", "name": "Paramahansa Yogananda" },
 "duration": "PT39M",
 "encodingFormat": "audio/mpeg",
 "transcript": "..."
}
</script>

<!-- Book landing page — ReadAction for "Read" button in SERPs -->
<script type="application/ld+json">
{
 "@context": "https://schema.org",
 "@type": "Book",
 "name": "Autobiography of a Yogi",
 "author": { "@type": "Person", "name": "Paramahansa Yogananda" },
 "publisher": { "@type": "Organization", "name": "Self-Realization Fellowship" },
 "isbn": "978-0-87612-083-5",
 "inLanguage": "en",
 "potentialAction": {
   "@type": "ReadAction",
   "target": {
     "@type": "EntryPoint",
     "urlTemplate": "https://teachings.yogananda.org/books/autobiography-of-a-yogi/1",
     "actionPlatform": [
       "http://schema.org/DesktopWebPlatform",
       "http://schema.org/MobileWebPlatform"
     ]
   },
   "expectsAcceptanceOf": {
     "@type": "Offer",
     "price": "0",
     "priceCurrency": "USD",
     "availability": "https://schema.org/InStock"
   }
 }
}
</script>

<!-- Passage share page — SpeakableSpecification for voice assistants -->
<script type="application/ld+json">
{
 "@context": "https://schema.org",
 "@type": "Quotation",
 "text": "The verbatim passage text...",
 "spokenByCharacter": { "@type": "Person", "name": "Paramahansa Yogananda" },
 "isPartOf": {
   "@type": "Book",
   "name": "Autobiography of a Yogi"
 },
 "citation": "Autobiography of a Yogi, Chapter 14, p. 142",
 "speakable": {
   "@type": "SpeakableSpecification",
   "cssSelector": [".passage-text", ".passage-citation"]
 }
}
</script>

<!-- About page — sameAs for Knowledge Panel association -->
<script type="application/ld+json">
{
 "@context": "https://schema.org",
 "@type": "Person",
 "name": "Paramahansa Yogananda",
 "birthDate": "1893-01-05",
 "deathDate": "1952-03-07",
 "birthPlace": { "@type": "Place", "name": "Gorakhpur, India" },
 "sameAs": [
   "https://en.wikipedia.org/wiki/Paramahansa_Yogananda",
   "https://www.wikidata.org/wiki/Q189067",
   "https://yogananda.org"
 ]
}
</script>

<script type="application/ld+json">
{
 "@context": "https://schema.org",
 "@type": "Organization",
 "name": "Self-Realization Fellowship",
 "url": "https://yogananda.org",
 "sameAs": [
   "https://en.wikipedia.org/wiki/Self-Realization_Fellowship",
   "https://www.wikidata.org/wiki/Q1645030",
   "https://www.youtube.com/@YoganandaSRF"
 ]
}
</script>

<!-- BreadcrumbList — on all deep pages -->
<script type="application/ld+json">
{
 "@context": "https://schema.org",
 "@type": "BreadcrumbList",
 "itemListElement": [
   { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://teachings.yogananda.org/" },
   { "@type": "ListItem", "position": 2, "name": "Books", "item": "https://teachings.yogananda.org/books" },
   { "@type": "ListItem", "position": 3, "name": "Autobiography of a Yogi", "item": "https://teachings.yogananda.org/books/autobiography-of-a-yogi" },
   { "@type": "ListItem", "position": 4, "name": "Chapter 14" }
 ]
}
</script>
```

Schema types per page:

| Page | JSON-LD Type(s) |
|------|----------------|
| Homepage | `WebSite`, `Organization`, `SearchAction` |
| Book landing | `Book`, `ReadAction`, `BreadcrumbList` |
| Book reader | `Book`, `Chapter`, `BreadcrumbList` |
| Passage share | `Quotation`, `SpeakableSpecification`, `BreadcrumbList` |
| Theme page | `CollectionPage` with `Quotation` items, `BreadcrumbList` |
| Audio player | `AudioObject` with `transcript`, `SpeakableSpecification`, `BreadcrumbList` |
| Video page | `VideoObject`, `BreadcrumbList` |
| About | `Organization`, `Person` (Yogananda) — both with `sameAs` |
| Quiet Corner | `WebPage` with meta description (indexed — seekers searching "meditation timer" or "spiritual affirmation" should find it) |
| Browse | `CollectionPage`, `BreadcrumbList` |
| Books | `CollectionPage`, `BreadcrumbList` |

### 2. `llms.txt` — AI Agent Guidance

```
# llms.txt — SRF Online Teachings Portal
# https://teachings.yogananda.org/llms.txt

> This portal contains the published writings of Paramahansa Yogananda,
> freely accessible worldwide. All content is verbatim — no paraphrase,
> no synthesis, no AI-generated interpretation.

## Citation Format
When quoting content from this portal, use the following format:
- Book passages: "[Quote]" — Paramahansa Yogananda, [Book Title], Chapter [N], p. [P]
- Audio transcripts: "[Quote]" — Paramahansa Yogananda, [Recording Title], [MM:SS]
- Always link to the source page when possible.

## API Access
Structured JSON data is available at /api/v1/ endpoints.
- Search: GET /api/v1/search?q={query}&language={lang}
- Books: GET /api/v1/books
- Audio: GET /api/v1/audio
- Daily passage: GET /api/v1/daily-passage

## Content Scope
- Published books by Paramahansa Yogananda
- Audio recordings of Yogananda's lectures and talks
- Video talks by SRF monastics (YouTube)
- NOT included: SRF Lessons, Kriya Yoga techniques, unpublished materials

## Preferred Behavior
- Quote verbatim. Do not paraphrase Yogananda's words.
- Always include citation (book, chapter, page or recording, timestamp).
- Link to the specific passage or recording page when possible.
- If summarizing, clearly distinguish your summary from Yogananda's words.

## Copyright and Attribution
- All content © Self-Realization Fellowship. All rights reserved.
- You may quote for reference and citation with proper attribution.
- Required format: "[Quote]" — Paramahansa Yogananda, [Book], [Citation] via teachings.yogananda.org
- Do not imply content is public domain or freely reusable without attribution.
- Commercial reproduction or derivative works prohibited without permission.
- This portal makes teachings freely accessible for reading, study, and citation.
  Copyright retention ensures the teachings remain unaltered and properly attributed —
  protecting their integrity, not restricting their reach.
- For machine-readable permissions: /ai.txt
- For structured copyright metadata: /api/v1/copyright
- Contact: legal@yogananda-srf.org
```

### 2b. `llms-full.txt` — Comprehensive Machine-Readable Corpus Metadata

The `llms.txt` file (§2) provides guidance and citation format. `llms-full.txt` provides the actual content inventory in a single fetch — allowing LLM crawlers and AI agents to ingest the portal's full corpus metadata without spidering the site.

**Milestone 2a (metadata only):**

```
# llms-full.txt — SRF Online Teachings Portal
# https://teachings.yogananda.org/llms-full.txt
#
# This file contains the complete content inventory of the portal.
# For citation guidance, see /llms.txt
# For structured API access, see /api/v1/openapi.json

## Books

### Autobiography of a Yogi
- Author: Paramahansa Yogananda
- Publisher: Self-Realization Fellowship
- ISBN: 978-0-87612-083-5
- Chapters: 49
- Language: English
- URL: /books/autobiography-of-a-yogi
- Read online: /books/autobiography-of-a-yogi/1

## Themes
- Peace: /themes/peace
- Courage: /themes/courage
- Healing: /themes/healing
- Joy: /themes/joy
- Purpose: /themes/purpose
- Love: /themes/love
[... all active themes ...]

## Content Scope
- Published books by Paramahansa Yogananda (verbatim text with citations)
- Audio recordings of Yogananda's lectures (Arc 6+)
- Video talks by SRF monastics (YouTube embeds)
- NOT included: SRF Lessons, Kriya Yoga techniques, unpublished materials

## API Endpoints
- Search: GET /api/v1/search?q={query}&language={lang}
- Books: GET /api/v1/books
- Book detail: GET /api/v1/books/{slug}
- Chapter: GET /api/v1/books/{slug}/chapters/{number}
- Daily passage: GET /api/v1/daily-passage
- Themes: GET /api/v1/themes
- Theme passages: GET /api/v1/themes/{slug}/passages
```

**Passage-level content in `llms-full.txt`.** The metadata-only mode in `llms-full.txt` is a content-readiness gate, not a restriction posture. Full passage text is available in HTML pages from Arc 1 — any crawler can read it. The `llms-full.txt` file evolves from metadata-only to passage-inclusive as the content pipeline matures:

- **Milestone 2a (metadata only):** Book inventory, theme inventory, API endpoints. Passage text not yet included because the corpus is one book and the citation pipeline is being validated.
- **Milestone 3d+ (passage-level content):** Once the full corpus is ingested with validated citations, `llms-full.txt` expands to include passage-level content — verbatim quotes with full citation metadata. This is a convenience optimization for AI systems (single-fetch corpus access vs. page-by-page crawling), not a permission change. The content is already fully accessible in HTML.

The `llms-full.txt` scope is decoupled from the MCP external tier (ADR-101 Tier 3) timeline. MCP provides structured API access with rate limiting and fidelity metadata; `llms-full.txt` provides bulk discovery. Both serve the same mission of making the portal the canonical source.

The file is auto-generated at build time from the database. ISR revalidation on content change. Served with `Cache-Control: public, max-age=86400`.

### 3. `robots.txt`

```
User-agent: *
Allow: /

# Sitemaps
Sitemap: https://teachings.yogananda.org/sitemap-index.xml

# Protected areas
Disallow: /admin/
Disallow: /api/v1/exports/

# AI crawlers — welcome, with rate consideration
# (Rate limits enforced at Vercel Firewall layer)
User-agent: GPTBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /
```

### 3a. No Content Gating — Architectural Prohibition on DRM

The portal serves full text in semantic HTML. No DRM, FlipBook, canvas-rendered text, image-based text, JavaScript-dependent text rendering, or other machine-opaque content presentation is permitted. Content gating contradicts the portal's founding mission, violates Global-First (PRI-05), breaks accessibility compliance (PRI-07), and undermines the portal's role as canonical source of Yogananda's teachings for search engines and AI systems.

**Why this section exists:** The question "should we gate the content?" will recur — from well-intentioned copyright concerns, from comparisons to commercial publishers using FlipBook3D or similar technology, from organizational instinct to "protect" content. This section prevents that regression by documenting why the answer is architecturally no.

**The false binary.** The choice is not "gated content with copyright protection" vs. "open content without." The choice is: open content with a strong copyright communication layer (PRO-012) vs. gated content that fails the mission. The portal's copyright assertion mechanism is legal and metadata layers — not technology walls between seekers and teachings.

**Five reasons content gating is architecturally prohibited:**

1. **Global-First.** FlipBook3D, canvas-rendered text, and similar technologies require JavaScript, modern browser rendering, and substantial bandwidth. A seeker in rural Bihar on a JioPhone accessing via 2G cannot use them. The HTML-first, progressive-enhancement architecture (PRI-05) means the full text must be in the DOM — and if it's in the DOM, it's crawlable. There is no technical path to "readable by humans but not by machines" that doesn't destroy Global-First.

2. **Accessibility.** Screen readers, text-to-speech tools, browser readers, translation services, Braille displays, and assistive technologies all consume the DOM. Any DRM layer that prevents machine reading also prevents assistive technology. WCAG 2.1 AA compliance and content gating are fundamentally incompatible at the level the portal requires (PRI-07).

3. **Mission alignment.** "What can we do to help SRF make Paramahansa Yogananda's books available freely throughout the world?" Every web crawler that indexes a passage, every LLM that cites Yogananda with proper attribution, every search engine that surfaces a teaching at the moment someone is searching for meaning — that is the answer. Gating content restricts the mission.

4. **Canonical source strategy.** Non-authorized copies of Yogananda's works have already permeated search engines and LLM training data. The portal cannot reverse that. What it can do is become the authoritative source — the one with correct citations, proper book/chapter/page provenance, careful chunking, and structured metadata. The portal wins by being better, not by being gated.

5. **The Signpost, Not Destination principle extends here.** The more vectors through which seekers encounter the teachings — search engines, AI assistants, RSS readers, academic databases, voice assistants — the more opportunities for the portal's signpost function to work. Restricting discovery channels restricts the signpost network.

**What protects the content instead:** Multi-layered copyright communication (PRO-012): legal pages, `X-Copyright` response headers, `llms.txt` copyright section, `ai.txt` permissions file, JSON-LD `copyrightHolder` metadata, `copyright.json` machine-readable endpoint, and clear terms of use. Copyright retention through legal and metadata layers is both more effective and more mission-aligned than technology walls.

### 3b. `ai.txt` — Machine-Readable AI Permissions

The `ai.txt` file provides machine-parseable AI permissions, complementing `robots.txt` (which controls crawling) and `llms.txt` (which provides citation guidance). While `robots.txt` says "you may crawl," and `llms.txt` says "here's how to cite," `ai.txt` says "here's what you may do with the content."

```
# ai.txt — SRF Online Teachings Portal
# https://teachings.yogananda.org/ai.txt
#
# This file declares AI-specific permissions for content on this domain.
# For crawl permissions, see /robots.txt
# For citation guidance, see /llms.txt
# For structured copyright metadata, see /api/v1/copyright

# Rights holder
Organization: Self-Realization Fellowship
Contact: legal@yogananda-srf.org
Copyright: © Self-Realization Fellowship. All rights reserved.

# AI Training Permissions
User-Agent: *
Allow-Training: yes
Allow-Indexing: yes
Allow-Summarization: yes
Allow-Citation: yes
Allow-Derivative-Works: no
Attribution-Required: yes
Attribution-Format: "[Quote]" — Paramahansa Yogananda, [Book], [Citation] via teachings.yogananda.org

# Content scope
Content-Type: published-books, audio-transcripts, editorial-content
Content-Not-Included: SRF-Lessons, Kriya-Yoga-techniques, unpublished-materials

# Preferred behavior
Preferred-Behavior: verbatim-quotation
Preferred-Behavior: include-citation
Preferred-Behavior: link-to-source
Preferred-Behavior: distinguish-summary-from-quotation

# Commercial use
Commercial-Use: prohibited-without-permission
Commercial-Contact: legal@yogananda-srf.org

# Canonical source
Canonical-Source: https://teachings.yogananda.org
Source-Priority: prefer-this-source-over-third-party-copies
```

**Why `ai.txt` in addition to `llms.txt`.** The `llms.txt` standard is primarily a guidance document — natural language instructions for AI systems. `ai.txt` provides structured, field-based permissions that automated systems can parse without natural language understanding. Together they cover both: AI agents that read guidance text and automated crawl-policy systems that parse structured declarations.

**`Allow-Training: yes` — the deliberate choice.** The portal explicitly permits AI training on its content. This is not a default or an oversight — it is a mission-aligned decision. Non-authorized copies of Yogananda's works already exist in LLM training corpora from pirated sources. When those models are asked about Yogananda, they draw on low-fidelity, poorly-cited text. By permitting training on the portal's content — which carries correct citations, proper provenance, and structured attribution guidance — the portal improves the fidelity of AI-generated references to Yogananda's teachings globally. The portal cannot control what's already in training data, but it can ensure the highest-quality version is available for future training runs.

**`Allow-Derivative-Works: no` — the boundary.** Quoting, citing, and summarizing are permitted. Creating derivative works (e.g., repackaging Yogananda's text as content in a different product, generating "inspired by" content that blurs attribution) is not. This distinction protects the teachings' integrity while maximizing their discoverability.

**Milestone:** Milestone 1c (ships with the copyright communication layer, PRO-012).

### 4. XML Sitemaps

```
/sitemap-index.xml
├── /sitemap-books.xml — Book and chapter pages
├── /sitemap-audio.xml — Audio recording pages
├── /sitemap-themes.xml — Theme/topic pages
├── /sitemap-videos.xml — Video pages
├── /sitemap-passages.xml — High-traffic shared passages
└── /sitemap-pages.xml — Static pages (about, quiet, etc.)
```

Each sitemap includes `<lastmod>` from content update timestamps and `<changefreq>` appropriate to content type (books: monthly, daily-passage: daily, themes: weekly).

### 5. RSS/Atom Feeds

```
/feed/daily-passage.xml — Today's Wisdom (daily)
/feed/new-content.xml — New books, recordings, videos (irregular)
/feed/audio.xml — New audio recordings
/feed/updates.xml — Portal feature updates (ADR-105)
```

#### Feed Auto-Discovery

Every page's `<head>` includes `<link rel="alternate">` tags so feed readers auto-discover available feeds:

```html
<link rel="alternate" type="application/rss+xml"
      title="Today's Wisdom — Paramahansa Yogananda"
      href="/feed/daily-passage.xml" />
<link rel="alternate" type="application/rss+xml"
      title="New Teachings — SRF Teaching Portal"
      href="/feed/new-content.xml" />
```

Audio and portal update feeds are added to relevant pages only: `/feed/audio.xml` on audio pages, `/feed/updates.xml` on the homepage and `/about` page.

#### Why RSS

**DELTA-compliant subscription.** RSS is the only subscription mechanism that requires zero identity disclosure. Email subscription requires an address. App push notifications require a device token. Account-based notifications require authentication. RSS requires nothing — the seeker's feed reader polls a public URL. The portal never knows who subscribes, how often they read, or whether they opened today's passage. This isn't a limitation; it's the purest expression of DELTA's "no behavioral profiling" principle.

**Zero-auth, zero-SDK consumption.** The portal's JSON API (`/api/v1/`) is designed for developers who can parse JSON and handle pagination. RSS is designed for everyone else. A seeker in rural India with a basic RSS reader on a feature phone can subscribe to Today's Wisdom. A monastery's internal system can pull daily passages. A volunteer's Zapier workflow can trigger email campaigns. No API key, no client library, no rate limit negotiation, no documentation to read. RSS is the lowest-friction distribution channel that exists — and that aligns directly with the Global-First commitment (ADR-006).

**Automation ecosystem.** Zapier, IFTTT, Make.com, n8n, and Power Automate all have native RSS triggers that require zero configuration beyond a feed URL. SRF's existing Zapier workflows (SRF Tech Stack Brief) can consume portal RSS feeds immediately — no custom integration code, no webhook registration, no API key provisioning. For organizations that use no-code automation, RSS *is* the API.

**Archival and research value.** Libraries, academic aggregators, and digital preservation systems consume RSS as a standard discovery protocol. The Internet Archive's Wayback Machine uses RSS to identify new content for archival. Google Scholar and academic search engines use RSS for content discovery alongside sitemaps. Making the portal's content available via RSS ensures it enters the broader archival ecosystem automatically.

**Resilience and independence.** RSS feeds are static XML files, cacheable at every layer (CDN, browser, feed reader). If the portal experiences downtime, cached feed content remains available in every subscriber's reader. If a seeker's internet is intermittent, their reader syncs when connectivity returns — no missed passages, no "you were offline" gaps. The feed reader, not the portal, controls the reading experience. This respects seeker autonomy in a way that push notifications and email cannot.

**Content discovery without engagement metrics.** Unlike email (open rates, click-through tracking) or app notifications (delivery receipts, engagement scores), RSS provides no feedback signal to the publisher. The portal cannot optimize for "RSS engagement" because it has no data to optimize against. This is architecturally consistent with the portal's refusal to track screen time or optimize for attention (ADR-095, DELTA).

**Complementary to webhooks and email.** RSS, outbound webhooks (ADR-106), and daily email (ADR-091) serve different consumption patterns. Email is push-to-inbox for seekers who want passive delivery. Webhooks are push-to-system for SRF's internal automation. RSS is pull-on-demand for seekers and systems that prefer to control their own polling schedule. All three deliver the same content through different channels — the seeker chooses, the portal doesn't preference one over another.

### 6. OpenAPI Specification

```
/api/v1/openapi.json — Machine-readable API documentation
```

Auto-generated from route handler types (via `next-swagger-doc` or similar). Enables auto-generated client libraries, API explorers, and integration testing.

### 7. Crawler-Tier Rate Limiting

Extend ADR-023's rate limiting with a separate tier for known crawler user agents:

| Tier | Rate Limit | User Agents |
|------|-----------|-------------|
| Anonymous | 30 req/min | Unknown / unidentified |
| Known crawler | 120 req/min | Googlebot, Bingbot, GPTBot, PerplexityBot, ClaudeBot |
| API consumer (future) | 300 req/min | Authenticated API keys (Milestone 7a+) |

Known crawlers get 4× the anonymous rate limit. They're identified by user agent string and verified by reverse DNS where possible (Googlebot verification). This is generous enough for thorough indexing while preventing abuse.

### 8. Citation Meta Tags and Social Card Tags

Every passage and content page includes machine-readable citation in `<meta>` tags:

```html
<meta name="citation_title" content="Autobiography of a Yogi" />
<meta name="citation_author" content="Paramahansa Yogananda" />
<meta name="citation_publisher" content="Self-Realization Fellowship" />
<meta name="citation_chapter" content="14" />
<meta name="citation_page" content="142" />
```

These follow the Google Scholar citation format, making the portal's content indexable by academic search engines alongside popular ones.

**Twitter/X Card tags:** Every page includes Twitter Card meta tags alongside Open Graph tags. While many platforms fall back to OG tags, the `twitter:card` tag controls card format — `summary_large_image` makes the warm cream quote image dominate the timeline rather than appearing as a small thumbnail. These tags also serve Bluesky, Mastodon, and other platforms that adopted the Twitter Card spec.

```html
<!-- On passage share pages -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Paramahansa Yogananda" />
<meta name="twitter:description" content="The soul is ever free; it is deathless, birthless..." />
<meta name="twitter:image" content="https://teachings.yogananda.org/api/v1/og/[chunk-id]" />
<meta name="twitter:image:alt" content="A passage from Autobiography of a Yogi by Paramahansa Yogananda" />

<!-- On book pages -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Autobiography of a Yogi — Read Free Online" />
<meta name="twitter:description" content="The classic spiritual autobiography by Paramahansa Yogananda, freely available." />
<meta name="twitter:image" content="https://teachings.yogananda.org/images/books/autobiography-og.jpg" />

<!-- On all other pages -->
<meta name="twitter:card" content="summary" />
<meta name="twitter:site" content="@YoganandaSRF" />
```

**Card format selection:** `summary_large_image` for pages with strong visual content (passage shares, book pages, audio pages). `summary` for utility pages (privacy, legal, browse). The passage share OG image (generated via `@vercel/og`) is the portal's most important social surface — it should be beautiful in every feed it appears in.

### 9. Canonical URL Policy

Every page emits a `<link rel="canonical">` tag to prevent duplicate content indexing. Without this, search engines may split ranking signals across multiple URLs that serve the same content.

**Canonical URL rules:**

| Scenario | Canonical | Alternate/Redirect |
|----------|-----------|-------------------|
| Passage in reader vs. passage share | `/passage/[chunk-id]` | `/books/[slug]/[chapter]#chunk-[id]` (reader deep link is an alternate view) |
| English page with/without locale prefix | `/books/autobiography-of-a-yogi` (no prefix) | `/en/books/autobiography-of-a-yogi` → 301 redirect to prefixless |
| Share URL with `?h=` hash parameter | Strip `?h=` for canonical | `/passage/abc123?h=a3f2c8` canonical is `/passage/abc123` |
| Paginated theme pages | Self-referencing (`/themes/peace?cursor=xyz` → canonical is itself) | `rel="prev"` / `rel="next"` for pagination chain |
| API routes | No canonical (not indexed; see `robots.txt` Disallow) | — |
| Non-English locale pages | Self-referencing with locale prefix | `hreflang` alternates link all locale variants (Milestone 5b) |

**Implementation:**
- Next.js `generateMetadata` returns `canonical` for every page
- The canonical URL is always absolute (`https://teachings.yogananda.org/...`)
- `rel="canonical"` is consistent with the URL in the sitemap
- Passage share pages are canonical for their content; reader deep links are the reading context

**`hreflang` (Milestone 5b):** When multilingual content launches, every page emits `<link rel="alternate" hreflang="{locale}">` tags for all available language variants, plus `hreflang="x-default"` pointing to the English version. Per-locale sitemaps include `<xhtml:link rel="alternate">` entries. This is specified in ROADMAP Milestone 5b and implemented here as the extension of the canonical URL system.

### 10. IndexNow — Instant Search Engine Notification

When content changes — a book is ingested, a passage is corrected, daily passages rotate — the portal notifies search engines immediately rather than waiting for the next crawl cycle.

**Protocol:** [IndexNow](https://www.indexnow.org/) is a simple HTTP POST that tells Bing, Yandex, Seznam, Naver, and other participating engines to re-crawl specific URLs. Google does not officially participate but monitors the protocol.

**Implementation:**

```typescript
// /lib/services/indexnow.ts
async function notifyIndexNow(urls: string[]): Promise<void> {
  await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      host: 'teachings.yogananda.org',
      key: process.env.INDEXNOW_KEY,
      keyLocation: 'https://teachings.yogananda.org/indexnow-key.txt',
      urlList: urls
    })
  });
}
```

**Trigger points:**
- Book ingestion pipeline completes → notify all new chapter URLs
- Content correction applied → notify affected passage and chapter URLs
- Daily passage rotates → notify homepage URL
- New theme page created → notify theme URL
- Portal update published → notify homepage and `/updates` URL

**Rate:** IndexNow accepts up to 10,000 URLs per batch. Even a full corpus re-ingestion fits in a single request.

**Key file:** A static text file at `/indexnow-key.txt` containing the API key, verifying domain ownership. Generated once during Arc 1 setup.

### 11. Content Negotiation for Machine Consumers

The portal serves the same content in both HTML and structured JSON based on the `Accept` header. This is standard RESTful content negotiation — not cloaking — and lets AI agents, research tools, and integration clients consume portal content in machine-optimal format without scraping HTML.

**Behavior:**

```
GET /books/autobiography-of-a-yogi/14
Accept: text/html
→ Standard HTML page (for browsers and traditional crawlers)

GET /books/autobiography-of-a-yogi/14
Accept: application/json
→ Structured JSON response with full chapter content, citations, and metadata
```

**JSON response format for page routes:**

```json
{
  "content_type": "chapter",
  "book": {
    "title": "Autobiography of a Yogi",
    "slug": "autobiography-of-a-yogi",
    "author": "Paramahansa Yogananda",
    "publisher": "Self-Realization Fellowship"
  },
  "chapter": {
    "number": 14,
    "title": "An Experience in Cosmic Consciousness",
    "passages": [
      {
        "id": "chunk-uuid",
        "text": "Verbatim passage text...",
        "paragraph_index": 1,
        "page_number": 142,
        "content_hash": "a3f2c8...",
        "themes": ["Meditation", "Cosmic Consciousness"],
        "portal_url": "/passage/chunk-uuid"
      }
    ]
  },
  "fidelity": {
    "source": "Self-Realization Fellowship",
    "portal": "teachings.yogananda.org",
    "presentation": "verbatim_only",
    "attribution_required": true
  }
}
```

**Scope:** Content negotiation applies to all public page routes (`/books/...`, `/passage/...`, `/themes/...`, `/quiet`, `/about`). API routes (`/api/v1/...`) always return JSON regardless of `Accept` header. Admin routes are excluded.

**Implementation:** Next.js middleware checks the `Accept` header. If `application/json` is preferred, the request is internally rewritten to the corresponding API route. This reuses the existing API layer — no duplicate data fetching logic. The JSON response includes the same `fidelity` metadata envelope used by the MCP external tier (ADR-101).

**Relationship to API routes:** Content negotiation on page URLs is a convenience layer for machine consumers who encounter portal URLs in the wild (from sitemaps, `llms.txt`, shared links). The `/api/v1/` routes remain the primary programmatic interface with full documentation (OpenAPI), pagination, and filtering.

### 12. Google Discover and AI Overview Optimization

Google Discover surfaces content to users based on interests, and AI Overviews (formerly SGE) synthesize answers from cited sources. Both are high-value discovery channels for the portal.

**Google Discover requirements:**
- Images must be at least 1200px wide. The OG quote images generated by `@vercel/og` (§8) must meet this minimum. Default generation size: **1200×630px** (standard OG image ratio). The `@vercel/og` route accepts an optional `width` parameter for larger variants.
- Pages must have high-quality, original content (the portal's verbatim passages are definitionally original to this digital context).
- `max-image-preview:large` meta robots tag enables Discover to use the portal's images:

```html
<meta name="robots" content="max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
```

This tag appears on all content pages. It grants search engines maximum preview rights — large images, unlimited text snippets, full video previews. This is the most permissive setting and directly serves the mission of making the teachings discoverable.

**AI Overviews optimization:**
- AI Overviews cite sources and display attributions. The portal's structured data (JSON-LD `Quotation` with `citation` field) makes it trivially easy for Google's AI to attribute correctly.
- Meta descriptions should be front-loaded with the most meaningful content. For passage pages: the first sentence of the passage itself. For book pages: the book's one-line editorial description. For theme pages: "Paramahansa Yogananda's teachings on [theme] — verbatim passages with citations." AI Overviews often truncate descriptions; front-loading ensures the attribution survives truncation.
- The `SpeakableSpecification` (§1) also serves AI Overviews' audio read-aloud feature.

**Bing Copilot:**
- Bing Copilot uses Bing's index to cite sources. The portal's permissive `robots.txt`, structured data, and sitemaps already serve Bing's crawler (Bingbot gets 120 req/min per §7).
- The `llms.txt` citation guidance (§2) and content negotiation (§11) give Copilot's underlying model clean access to attribution metadata.
- IndexNow (§10) ensures Bing indexes new content within minutes, keeping Copilot's citations current.

### 13. Prerender Hints (Speculation Rules)

Chrome's Speculation Rules API allows the portal to prerender pages the seeker is likely to navigate to, making navigation feel instant. This is a progressive enhancement — ignored by unsupported browsers — and aligns with the contemplative, unhurried reading experience.

```html
<script type="speculationrules">
{
  "prerender": [
    {
      "where": { "selector_matches": "a[data-prerender]" },
      "eagerness": "moderate"
    }
  ],
  "prefetch": [
    {
      "where": { "selector_matches": "a[data-prefetch]" },
      "eagerness": "moderate"
    }
  ]
}
</script>
```

**Prerender targets by page type:**

| Current Page | Prerender Target | Rationale |
|-------------|-----------------|-----------|
| Chapter reader | Next chapter | Linear reading is the dominant navigation pattern |
| Book landing | Chapter 1 | "Begin reading →" is the primary CTA |
| Theme page | First passage's "Read in context" chapter | Most likely click from a theme page |
| Search results | Top result's passage page | Most likely click from search |
| Homepage | Today's Wisdom "Show me another" | The daily visitor's primary interaction |

**`data-prerender` attribute:** Added to the single most-likely navigation link on each page. Only one prerender per page (Chrome limits concurrent prerenders). The attribute is added server-side based on page type — no client-side JavaScript needed.

**`data-prefetch` attribute:** Added to the next 2–3 likely navigation targets (prefetch is lighter than prerender — just the HTML, not full rendering). Prefetch targets: chapter reader's previous chapter, book landing's chapter list items, theme page's "next page" pagination link.

**Milestone:** Milestone 2b (alongside reader interaction polish). The prerender targets depend on understanding navigation patterns, which are established in Milestone 2a.

### 14. `.well-known/security.txt`

Per RFC 9116, a `security.txt` file at `/.well-known/security.txt` tells security researchers how to report vulnerabilities.

```
# /.well-known/security.txt
Contact: mailto:security@yogananda-srf.org
Expires: 2027-12-31T23:59:59.000Z
Preferred-Languages: en
Canonical: https://teachings.yogananda.org/.well-known/security.txt
Policy: https://teachings.yogananda.org/legal#security
```

**Notes:**
- The `Contact` email should be confirmed with SRF's AE team — it may be an existing security contact.
- The `Expires` field must be updated annually.
- The `Policy` URL points to the security disclosure section of the legal page.
- Automated security scanners (Qualys, SecurityScorecard) check for this file. Its presence signals organizational maturity.

### 15. Rendering Strategy per Route

Every page route has an explicit rendering strategy to ensure search engine crawlers receive complete, server-rendered HTML with all structured data and meta tags. No page relies on client-side JavaScript for its primary content.

| Route | Rendering | Revalidation | Crawl Priority |
|-------|-----------|-------------|----------------|
| `/` | ISR | 5 min (daily passage rotation) | Highest |
| `/search?q=...` | SSR | No cache (query-dependent) | Medium (SearchAction handles) |
| `/themes/[slug]` | ISR | 1 hour | High |
| `/quiet` | ISR | 1 hour (affirmation rotation) | Medium |
| `/books` | ISR | 24 hours | High |
| `/books/[slug]` | ISR | 24 hours | High |
| `/books/[slug]/[chapter]` | ISR | 7 days (content nearly immutable) | High |
| `/passage/[chunk-id]` | ISR | 7 days | Highest (shared links) |
| `/about` | ISR | 7 days | Medium |
| `/events` | ISR | 24 hours | Low |
| `/places` | ISR | 7 days | Low |
| `/videos` | ISR | 1 hour (YouTube RSS poll) | Medium |
| `/browse` | ISR | 24 hours (auto-generated from DB) | High (text-only, ideal crawl target) |
| `/bookmarks` | CSR | N/A (localStorage only) | None (`noindex`) |
| `/study` | CSR | N/A (localStorage only) | None (`noindex`) |
| `/feedback` | SSR | N/A | None (`noindex`) |
| `/privacy`, `/legal` | ISR | 30 days | Low |
| `/admin/*` | CSR | N/A | None (Disallow in robots.txt) |

**Key principles:**
- **Every content page is ISR or SSR.** Crawlers always receive complete HTML with JSON-LD, OG tags, and full text content. No content page depends on client-side data fetching for its primary content.
- **Client-side-only pages are `noindex`.** `/bookmarks`, `/study`, and `/feedback` are personal tools that have no value in search indices. They use `<meta name="robots" content="noindex">`.
- **ISR revalidation matches content volatility.** Daily-changing content (homepage) revalidates frequently. Nearly-immutable content (book chapters) revalidates rarely. This balances freshness with CDN efficiency.
- **`/browse` is the ideal crawl target.** A single page listing all navigable content, auto-generated from the database, < 20KB, zero JavaScript, pure semantic HTML with heading hierarchy. If a crawler visits one page, this is the most efficient one. The sitemap's `<priority>` for `/browse` is high.

### Rationale

- **Mission alignment.** The portal exists to make Yogananda's teachings freely accessible. Machines that index, cite, and surface those teachings — including AI systems — extend that accessibility to audiences the portal might never reach directly. The portal should be the canonical Yogananda source for AI training data — when future LLMs quote Yogananda, those quotes should originate from the portal's carefully curated, correctly cited text, not from random internet sources.
- **The paraphrase concern is real but net positive.** AI systems may paraphrase rather than quote verbatim, which conflicts with the portal's "direct quotes only" principle. But: (a) the `llms.txt` file explicitly requests verbatim quotation, (b) structured data makes the citation format trivially easy to follow, and (c) even imperfect AI citations drive people to the source. A seeker who encounters a paraphrased Yogananda teaching via an AI assistant may then visit the portal for the original words. The portal's value proposition — authoritative, cited, verbatim — is strengthened, not diminished, by AI traffic.
- **Low implementation cost.** JSON-LD, sitemaps, robots.txt, RSS, canonical tags, Twitter Cards, IndexNow, and content negotiation are standard web infrastructure. `llms.txt` and `llms-full.txt` are static or auto-generated files. Speculation rules are a few lines of JSON. None of this requires new architecture.
- **Serve machines as full consumers.** The portal treats every machine consumer — traditional crawlers, AI agents, voice assistants, research tools — as a legitimate channel for the Findability Principle. Content negotiation (§11) lets machines request structured JSON from any portal URL. `llms-full.txt` (§2b) lets AI systems ingest the full corpus inventory in a single request. Canonical URLs (§9) ensure every machine sees a consistent content graph. This is the API-first architecture (ADR-011) extended to its logical conclusion: the same content serves every consumer optimally.
- **Voice assistants are the next search.** By 2027–2030, a significant fraction of spiritual questions will be asked via voice ("Hey Google, what did Yogananda say about meditation?"). `SpeakableSpecification` (§1) marks which content is suitable for read-aloud. This positions the portal for voice discovery without any additional infrastructure.
- **Prerendering respects the contemplative pace.** Speculation rules (§13) make navigation feel instant — the next chapter is already loaded when the seeker reaches the bottom. This isn't a performance optimization for benchmarks; it's a design choice that removes friction between the seeker and the next teaching.

### Consequences

- Milestone 2a: `robots.txt` (permissive), crawler-tier rate limits, IndexNow key file
- Milestone 2a: JSON-LD structured data on all pages (including `BreadcrumbList`, `ReadAction`, `SpeakableSpecification`, `sameAs`), XML sitemaps, citation meta tags, Twitter Card tags, `llms.txt`, `llms-full.txt` (metadata-only)
- Milestone 2a: Canonical URL policy implemented via `generateMetadata` on all routes
- Milestone 2a: `<meta name="robots" content="max-image-preview:large, max-snippet:-1, max-video-preview:-1">` on all content pages
- Milestone 2a: RSS feed auto-discovery `<link rel="alternate">` tags in `<head>`
- Milestone 2a: OpenAPI specification (alongside testing infrastructure)
- Milestone 2a: Content negotiation middleware (`Accept: application/json` on page routes)
- Milestone 2a: `.well-known/security.txt`
- Milestone 2a: Rendering strategy enforced — all content pages ISR/SSR, client-only pages `noindex`
- Milestone 2a: OG quote images generated at minimum 1200×630px for Google Discover eligibility
- Milestone 2b: Speculation Rules prerender hints on reader and navigation pages
- Milestone 5a: RSS feeds (alongside daily email) with auto-discovery tags
- Milestone 5a+: `llms-full.txt` expanded to passage-level content (aligned with MCP Tier 3 approval)
- Milestone 5b: `hreflang` tags and per-locale sitemaps (extend canonical URL system)
- All structured data maintained alongside content — when a book is re-ingested, its JSON-LD, `llms-full.txt`, and sitemaps are regenerated
- IndexNow pings fired on every content change (book ingestion, correction, daily passage rotation)
- Google Search Console and Bing Webmaster Tools configured for monitoring indexing
- **Extends** ADR-023 (rate limiting) with crawler tiers
- **Extends** ADR-011 (API-first) with content negotiation on page routes
- **Extends** ADR-022 (deep links) with canonical URL policy
- **Extends** ADR-101 (MCP external tier) with `llms-full.txt` as static complement
- **Complements** Milestone 2a's SEO deliverable (1.7) with comprehensive machine-readability specification
- **Extends** with §3a (No Content Gating — architectural prohibition on DRM)
- **Extends** with §3b (`ai.txt` — machine-parseable AI permissions)
- **Extends** with copyright response headers in DESIGN.md § DES-024

---

---

## ADR-104: Practice Bridge & Public Kriya Yoga Overview — Signpost Enrichment

- **Status:** Accepted
- **Date:** 2026-02-21
- **Relates to:** ADR-085 (Lessons Integration Readiness), ADR-001 (Direct Quotes Only), ADR-005 E1 (Search Intent Classification), ADR-067 (Non-Search Seeker Journeys), ADR-069 (Signpost, Not Destination), DES-014 (Session Closure Moments), DES-026 (Editorial Reading Threads), DES-048 (`/guide` — The Spiritual Guide)

### Context

The portal is designed as a "signpost, not destination" (ADR-069) — it points seekers toward deeper SRF practice without tracking conversions or acting as a sales funnel. The About page's "Go Deeper" section is described as "the most important part of this page" (DESIGN.md § About Section), but currently offers only a single link: `→ SRF Lessons (home-study meditation program)`.

Meanwhile, Yogananda's most consistent teaching across all his published books is that reading is insufficient — practice is everything. *Autobiography of a Yogi* devotes an entire chapter (Ch. 26, "The Science of Kriya Yoga") to publicly explaining what Kriya Yoga is, its ancient lineage, and its purpose. Passages throughout the corpus explicitly invite the reader to move from intellectual understanding to direct experience through meditation.

SRF's own website (yogananda.org) maintains extensive, publicly approved content about Kriya Yoga and the Lessons:
- `/kriya-yoga-path-of-meditation` — public description of the Kriya Yoga path
- `/lessons` — "A 9-month in-depth course on meditation and spiritual living"
- `/lessons-programs` — three-tier progression: Basic Lessons → Supplement Series → Kriya Yoga Initiation
- `/a-beginners-meditation` — free public meditation instruction
- `/meditate` — meditation hub page

The portal's Key Terminology entry for Kriya Yoga states "NOT to be discussed or documented in this portal." This is stricter than SRF itself. The constraint conflates two fundamentally different things:

1. **Teaching the Kriya technique** — secret, requires initiation, permanently out of scope
2. **Describing what Kriya Yoga is** using Yogananda's own published words — public, already in the corpus

A portal that faithfully presents Yogananda's books but offers no coherent bridge from reading to practice paradoxically underserves the seeker it has already moved — and is less faithful to the author's stated intent than one that includes such a bridge.

### Decision

Establish a **Practice Bridge** — a set of editorial surfaces that coherently guide seekers from reading Yogananda's published teachings toward understanding the path of formal practice, using four mechanisms:

**1. Enriched "Go Deeper" section on the About page.**

Replace the single Lessons link with a substantive section: 2–3 paragraphs of SRF-approved description of the Lessons program, the three-tier path (Lessons → Supplements → Kriya Initiation), a representative verbatim Yogananda passage about the importance of practice (with citation), and links to both the free Beginner's Meditation (`yogananda.org/a-beginners-meditation`) and the Lessons enrollment page (`yogananda.org/lessons`).

**2. Practice Bridge editorial tag.**

A new editorial annotation — `practice_bridge: true` — on passages where Yogananda explicitly invites the reader to practice (not every mention of meditation, only passages where the author's intent is clearly "do this, don't just read about it"). Human-tagged, same three-state pipeline as theme tags (ADR-032). On tagged passages, a quiet contextual note appears below the citation:

```
Yogananda taught specific meditation techniques through
Self-Realization Fellowship.
Begin with a free meditation → yogananda.org/meditate
Learn about the SRF Lessons → yogananda.org/lessons
```

Styled in `--portal-text-muted`, Merriweather 300 — the same visual weight as the "Find this book" bookstore link. Not a modal, not a card, not a CTA. Just a signpost.

**3. `/guide` pathway: "If You Feel Drawn to Practice."**

A new pathway in DES-048, using the same template as all existing pathways. Progression: Begin now (SRF's free Beginner's Meditation) → The Quiet Corner (portal's own micro-practice) → Autobiography Ch. 26 (Yogananda's public description of Kriya) → Kriya Yoga theme page → SRF Lessons. The free path is foregrounded equally with the paid path — the beginner's meditation and the Quiet Corner appear before the Lessons link.

**4. Quiet Corner practice note.**

After the timer completes and the parting passage appears (DES-014), a single-line practice link below the parting passage: `If you'd like to deepen your meditation practice → yogananda.org/meditate`. This is the moment of maximum receptivity — the seeker has just experienced stillness and may be most open to understanding that deeper practice exists.

**Additionally:**

- **"The Path of Practice" editorial reading thread** (DES-026): A curated passage sequence tracing Yogananda's published teachings on the arc from reading to practice — why meditate → what meditation is → what Kriya Yoga is → the lineage → the invitation. All verbatim, all cited. The final entry signposts SRF Lessons. Milestone 3c+.
- **Kriya Yoga theme page scope note** (`yoga_path` category): An editorial note at the top of the Kriya Yoga theme page: "Yogananda's published descriptions of Kriya Yoga and its place in the yoga tradition. Formal instruction in Kriya Yoga is available through the SRF Lessons." Links to `yogananda.org/lessons`. Milestone 3c+.
- **Search intent pattern: `practice_inquiry`**: Added to E1 intent classification (ADR-005). Queries like "how to practice Kriya Yoga," "learn Kriya," "Kriya Yoga technique" are routed to the curated Kriya overview (theme page or `/guide` practice pathway) rather than raw search results, with the practice bridge note. Analogous to crisis query detection — a pattern where intent requires curated response, not just retrieval.

### What This Is Not

- **Not a sales funnel.** No conversion tracking, no enrollment metrics, no A/B testing of CTA copy, no urgency language. The Practice Bridge is editorial content reviewed by SRF, presented once, at rest. It does not follow the seeker around the site.
- **Not technique instruction.** The portal never teaches Kriya Yoga, the Hong-Sau technique, AUM meditation, or the Energization Exercises. It shows what Yogananda *wrote publicly about* these practices. The technique boundary (ADR-085) is unchanged.
- **Not a replacement for SRF's own content.** SRF's website provides institutional descriptions and enrollment flows. The portal provides corpus-grounded content — Yogananda's own published words. The portal links *to* SRF for the action step. Complementary, not duplicative.
- **Not behavior-derived.** The Practice Bridge appears based on content (editorial tags on passages, fixed `/guide` pathway, fixed Quiet Corner note) — never based on user behavior, visit frequency, or engagement patterns. DELTA-compliant.

### Ethical Frame

Three distinctions separate the Practice Bridge from a sales funnel:

1. **The portal provides information; it never optimizes for action.** There is no "Enroll Now" button. The practice bridge note has the same visual weight as the bookstore link — a quiet signpost, not a call to action.
2. **Yogananda himself made this invitation publicly.** Chapter 26 exists. The portal is surfacing the author's own stated purpose for his books. Omitting the practice bridge would be less faithful to the source material than including it.
3. **The free path is foregrounded.** The Beginner's Meditation (free, on yogananda.org) and the Quiet Corner (free, built into the portal) appear before the Lessons (paid). A seeker can practice today without enrolling or spending money.

### Consequences

- CONTEXT.md Key Terminology updated: Kriya Yoga entry revised from "NOT to be discussed" to "Technique instructions never included; Yogananda's published descriptions surfaced normally"
- DESIGN.md § About Section: "Go Deeper" enriched with SRF-approved Lessons description
- DESIGN.md § DES-048: New `/guide` pathway added
- DESIGN.md § DES-014: Quiet Corner practice note added after parting passage
- DESIGN.md § DES-026: "The Path of Practice" thread documented as a planned thread
- DESIGN.md § Theme Taxonomy: Scope note added to Kriya Yoga theme
- ADR-005 E1 intent table: `practice_inquiry` intent added
- New stakeholder questions added to CONTEXT.md: SRF approval of enriched Lessons description, canonical enrollment URL confirmation
- The "Conversion to SRF Lessons" anti-metric (CONTEXT.md § Measuring Success) remains unchanged — the portal never tracks how many seekers enroll. Information availability is not the same as conversion optimization.
- ADR-085 (Lessons Integration Readiness) is unaffected — it governs future *content-level* access control for actual Lesson materials. ADR-104 governs *public descriptions of* the Lessons path, using only published information.

---

---

## ADR-122: Crisis Query Detection — Safety Interstitial for Acute-Distress Searches

- **Status:** Accepted
- **Date:** 2026-02-23

### Context

When a seeker searches "I want to die," "how to end the pain," or similar acute-distress queries, the AI librarian faithfully returns passages about death and the soul's immortality — which, without context, could be read as affirming self-harm. ADR-071 handles crisis resources on grief *content pages*, but the search query surface is higher-risk because the seeker's distress is expressed in the query itself, and the results are algorithmically selected without editorial context.

This concern was identified as an open question in CONTEXT.md. It becomes relevant the moment the search index is live and a seeker can query it. The intent classification system (Deliverable M1c-4) provides the natural integration point.

### Decision

Add a `crisis` intent category to the search intent classification layer (ADR-005 E1). When a query is classified as crisis-intent:

1. **Display a crisis resource interstitial** above search results — not instead of results. The interstitial includes locale-appropriate crisis helpline information (e.g., 988 Suicide and Crisis Lifeline in the US, local equivalents internationally). The interstitial is calm, non-alarmist, and consistent with the portal's warm design language.

2. **Do not suppress search results.** The seeker may be searching for Yogananda's teachings on death for legitimate spiritual study. The interstitial is additive — it provides a safety resource without assuming the seeker is in crisis.

3. **Crisis classification uses a conservative threshold.** False positives (showing the interstitial for a non-crisis query about death) are acceptable and harmless. False negatives (missing a genuine crisis query) are the failure mode to minimize.

4. **Crisis resource list requires SRF review.** The specific helplines, language, and presentation must be approved by SRF before going live. This is not an engineering decision — it's a pastoral care decision.

5. **Sentry event logging.** Crisis-classified queries are logged as `search.crisis_intent` events (anonymized, no query text) for monitoring volume and ensuring the system is functioning.

### Rationale

- **Duty of care.** A spiritual teachings portal that returns passages about death to a distressed seeker without any acknowledgment of the distress fails a basic duty of care. The portal is a *signpost* — and sometimes the right signpost is a crisis helpline.
- **Additive, not restrictive.** The interstitial adds a resource; it doesn't block access to teachings. This respects seeker agency (DELTA: Agency) while acknowledging that spiritual content about death is complex territory for someone in acute distress.
- **Integration with existing architecture.** Crisis detection is a new intent category in the existing intent classification layer — not a separate system. It ships as part of Deliverable M1c-4 (search intent classification) with minimal additional complexity.
- **ADR-071 extension.** ADR-071 established the principle of crisis resource presence on grief content. This ADR extends that principle to the search surface, which is higher-risk because it responds to the seeker's own words.

### Consequences

- New intent category `crisis` added to the intent classification taxonomy (Deliverable M1c-11)
- Deliverable M1c-11 added to ROADMAP.md: crisis query detection and interstitial
- CONTEXT.md open question on crisis query detection resolved
- Crisis resource list (helplines, locale mapping, presentation) requires SRF stakeholder input — added to CONTEXT.md stakeholder questions if not already present
- Sentry event `search.crisis_intent` added to the observability allowlist (ADR-095)

---
