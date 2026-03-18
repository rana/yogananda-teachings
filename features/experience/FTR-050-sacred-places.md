---
ftr: 50
title: Sacred Places
summary: "Contemplative geography pages linking SRF/YSS places to book passages with Street View"
state: approved-provisional
domain: experience
governed-by: [PRI-04, PRI-10]
depends-on: [FTR-049]
---

# FTR-050: Sacred Places

## Rationale


### Context

FTR-049 originally specified Leaflet + OpenStreetMap as the embedded map for the Sacred Places page. On re-evaluation, the embedded map adds a library dependency for a page that already communicates geography effectively through its card layout (grouped by category, each card showing city and country). The page works in Milestone 2b without any map. "Get Directions" already delegates to the user's preferred maps app for navigation. The one thing no outbound link provided was a *virtual visit* — seeing what a place looks like before traveling there.

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
- **Zero dependencies > low dependencies.** Leaflet is lightweight and stable, but zero map libraries is lighter and more stable. On a 10-year project horizon (FTR-004), every dependency is a maintenance commitment.
- **Privacy preserved.** No Google SDK loaded on the portal. The Street View link is an outbound navigation, same as "Get Directions" or the external SRF property links.
- **Future flexibility.** If a dynamic center locator (500+ locations) is built later, the map library decision can be made for that page with that page's requirements. The Sacred Places page doesn't need to carry that dependency preemptively.

### Data Model Change

```sql
ALTER TABLE places ADD COLUMN street_view_url TEXT; -- nullable, only for places with coverage
```

### Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| **Leaflet + OpenStreetMap** (original FTR-049) | Visual overview of all locations; open-source | Library dependency for ~20 pins; page works without it; less compelling than Street View for virtual visits |
| **Google Maps embed** | Familiar UX; Street View inline | Google tracking scripts on page; API costs; contradicts privacy principles |
| **No map, no Street View** | Simplest possible | Misses the virtual visit opportunity that makes the page come alive |

### Consequences

- Leaflet and OpenStreetMap are removed from the project's dependency list
- The `places` table gains a nullable `street_view_url` column
- Sacred Places work is simpler: add biographical sites + Street View links + Reader ↔ Place cross-reference cards
- The future center locator (if built) makes its own map library decision independently
- CLAUDE.md tech stack table updated to remove the Maps row

## Specification


A dedicated `/places` page presenting sites of biographical and spiritual significance, cross-referenced with book passages. See FTR-049.

### Data Model

```sql
-- Sacred places (SRF properties + biographical sites)
CREATE TABLE places (
 id UUID PRIMARY KEY DEFAULT uuidv7(),
 name TEXT NOT NULL,
 slug TEXT NOT NULL UNIQUE,
 category TEXT NOT NULL CHECK (category IN ('srf_property', 'yss_property', 'biographical')),
 description TEXT NOT NULL,
 significance TEXT, -- Spiritual/historical significance
 address TEXT,
 city TEXT NOT NULL,
 region TEXT, -- State/province
 country TEXT NOT NULL,
 latitude DECIMAL(10, 7),
 longitude DECIMAL(10, 7),
 image_url TEXT, -- Contemplative header image
 visiting_info TEXT, -- Hours, access notes
 external_url TEXT, -- Link to SRF/YSS property page
 virtual_tour_url TEXT, -- SRF virtual pilgrimage tour URL (nullable; SRF offers tours of Mother Center, Lake Shrine, Hollywood Temple, Encinitas)
 is_active BOOLEAN NOT NULL DEFAULT true,
 display_order INTEGER NOT NULL DEFAULT 0,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now
);

-- Junction: which book passages mention which places
CREATE TABLE chunk_places (
 chunk_id UUID NOT NULL REFERENCES book_chunks(id) ON DELETE CASCADE,
 place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
 context_note TEXT, -- e.g., "Yogananda describes arriving at this ashram"
 PRIMARY KEY (chunk_id, place_id)
);

CREATE INDEX idx_chunk_places_place ON chunk_places(place_id);
CREATE INDEX idx_chunk_places_chunk ON chunk_places(chunk_id);
```

### Page Design

```
┌──────────────────────────────────────────────────┐
│ Sacred Places │
│ Where the teachings come alive │
│ │
│ ── SRF & YSS Centers ────────────────────────── │
│ │
│ ┌────────────────────────────────────────────┐ │
│ │ [contemplative photo] │ │
│ │ │ │
│ │ Lake Shrine │ │
│ │ Pacific Palisades, California │ │
│ │ │ │
│ │ A ten-acre sanctuary on Sunset Boulevard, │ │
│ │ home to the Gandhi World Peace Memorial │ │
│ │ and spring-fed lake surrounded by │ │
│ │ meditation gardens. │ │
│ │ │ │
│ │ 📖 Read about Lake Shrine → │ │
│ │ Autobiography, Chapter 49 │ │
│ │ │ │
│ │ Visit → srf.org/lake-shrine │ │
│ │ Take a Virtual Tour → │ │
│ │ Get Directions → │ │
│ │ See This Place (Street View) → │ │
│ └────────────────────────────────────────────┘ │
│ │
│ ┌────────────────────────────────────────────┐ │
│ │ [contemplative photo] │ │
│ │ │ │
│ │ Encinitas Retreat │ │
│ │ Encinitas, California │ │
│ │ │ │
│ │ The ocean-facing hermitage where │ │
│ │ Yogananda wrote much of the │ │
│ │ Autobiography of a Yogi. │ │
│ │ │ │
│ │ 📖 Read in context → │ │
│ │ Autobiography, Chapter 37 │ │
│ │ │ │
│ │ Visit → srf.org/encinitas │ │
│ │ Get Directions → │ │
│ │ See This Place (Street View) → │ │
│ └────────────────────────────────────────────┘ │
│ │
│ ── In the Footsteps of Yogananda ────────────── │
│ │
│ ┌────────────────────────────────────────────┐ │
│ │ Gorakhpur, India │ │
│ │ Yogananda's birthplace │ │
│ │ │ │
│ │ "I find my earliest memories │ │
│ │ centering around the family home │ │
│ │ in Gorakhpur..." │ │
│ │ — Autobiography of a Yogi, Chapter 1 │ │
│ │ │ │
│ │ 📖 Read Chapter 1 → │ │
│ └────────────────────────────────────────────┘ │
│ │
│ ┌────────────────────────────────────────────┐ │
│ │ Ranchi, India │ │
│ │ Yogoda Satsanga Brahmacharya Vidyalaya │ │
│ │ │ │
│ │ "A school for boys where yoga was │ │
│ │ taught along with standard │ │
│ │ educational subjects." │ │
│ │ — Autobiography of a Yogi, Chapter 27 │ │
│ │ │ │
│ │ 📖 Read Chapter 27 → │ │
│ └────────────────────────────────────────────┘ │
│ │
│ ┌────────────────────────────────────────────┐ │
│ │ Serampore, India │ │
│ │ Sri Yukteswar's ashram │ │
│ │ │ │
│ │ "The hermitage... is a two-storied │ │
│ │ building with a courtyard..." │ │
│ │ — Autobiography of a Yogi, Chapter 12 │ │
│ │ │ │
│ │ 📖 Read Chapter 12 → │ │
│ └────────────────────────────────────────────┘ │
│ │
│ [Future: Street View links on place cards]   │
│ │
│ ── Find a Meditation Group Near You ─────────── │
│ External link → yogananda.org/center-locator │
└──────────────────────────────────────────────────┘
```

### The Book Cross-Reference

The unique value of Sacred Places on the teaching portal: each place links to the passages that describe it, and passages in the reader can link back to the place.

**Reader → Place:** When reading a chapter that mentions a significant location, a subtle card appears in the margin or below the passage:

```
┌──────────────────────────────┐
│ 📍 This passage describes │
│ Serampore, India │
│ View in Sacred Places → │
└──────────────────────────────┘
```

**Place → Reader:** Each Sacred Places entry lists passages with deep links:

```
Referenced in:
 • Autobiography of a Yogi, Chapter 12 — "My years with Sri Yukteswar"
 • Autobiography of a Yogi, Chapter 21 — "We visit Kashmir"
 • Autobiography of a Yogi, Chapter 42 — "Last days with my guru"
```

### Place Links Strategy (Distributed Across Milestones)

No embedded map library. Each place card links out to external maps services — zero map dependencies, zero tile servers, zero maintenance. See FTR-050.

| Link | Implementation | Rationale |
|------|---------------|-----------|
| **"Get Directions"** | `geo:` URI or Apple/Google Maps link (opens native maps app) | Delegates navigation to the user's preferred app |
| **"Take a Virtual Tour"** | SRF virtual pilgrimage tour URL (opens in new tab). Available for Mother Center, Lake Shrine, Hollywood Temple, Encinitas. Uses `virtual_tour_url` column — only displayed when non-null. | SRF's narrated virtual tours are warmer and richer than Street View; preferred when available. Requires SRF to confirm canonical tour URLs (see CONTEXT.md Q110). |
| **"See This Place"** | Google Maps Street View URL (opens in new tab) | Fallback virtual visit for places without SRF tours. No tracking scripts on the portal. |
| **Visit** | SRF/YSS property page URL | e.g., "Visit → srf.org/lake-shrine" |

**Street View URL format:** `https://www.google.com/maps/@{lat},{lng},3a,75y,0h,90t/data=!3m6!1e1!3m4!1s...` — a plain link, no JavaScript, no API key. Only included for places where Street View coverage exists.

### API

```
GET /api/v1/places
Response:
{
 "places": [
 {
 "id": "uuid",
 "name": "Lake Shrine",
 "slug": "lake-shrine",
 "category": "srf_property",
 "city": "Pacific Palisades",
 "country": "US",
 "latitude": 34.0423,
 "longitude": -118.5248,
 "image_url": "...",
 "passage_count": 3
 },
 ...
 ]
}

GET /api/v1/places/[slug]
Response:
{
 "place": {
 "id": "uuid",
 "name": "Lake Shrine",
 "slug": "lake-shrine",
 "category": "srf_property",
 "description": "A ten-acre sanctuary...",
 "significance": "...",
 "address": "17190 Sunset Blvd",
 "city": "Pacific Palisades",
 "region": "California",
 "country": "US",
 "latitude": 34.0423,
 "longitude": -118.5248,
 "image_url": "...",
 "visiting_info": "Open Tuesday–Saturday, 9am–4:30pm",
 "external_url": "https://lakeshrine.org",
 "virtual_tour_url": "https://yogananda.org/...",
 "passages": [
 {
 "chunk_id": "uuid",
 "content": "The verbatim passage...",
 "book_title": "Autobiography of a Yogi",
 "chapter_title": "...",
 "chapter_number": 49,
 "page_number": 512,
 "context_note": "Yogananda describes the dedication of Lake Shrine",
 "reader_url": "/books/autobiography-of-a-yogi/49#chunk-uuid"
 }
 ]
 }
}
```

### Phasing

| Milestone | Scope |
|-----------|-------|
| **5a** | Static Sacred Places page with SRF/YSS properties. Text + images + external links + "Get Directions." "Take a Virtual Tour" links for properties with SRF virtual pilgrimage tours (Mother Center, Lake Shrine, Hollywood Temple, Encinitas). Cross-references with Autobiography passages. Convocation cross-link on LA-area SRF property cards: "This site is part of the annual SRF World Convocation pilgrimage. Learn more → convocation.yogananda.org." No maps. |
| **Distributed** | Add biographical sites (Gorakhpur, Serampore, Puri, Varanasi, Dakshineswar). "See This Place" Street View links on place cards (FTR-050). Reader ↔ Place cross-reference cards. **Indian biographical site note:** Google Street View coverage in rural India (Gorakhpur, Serampore, Ranchi) is patchy or absent. Where Street View is unavailable, commissioned photography or editorial descriptions should be the primary experience, with maps as secondary. Query YSS for photographic archives of these sites (see CONTEXT.md § Open Questions). "Get Directions" for Indian sites serves a pilgrimage context more than a driving-directions context — consider "Visit this place" framing for Indian biographical sites. |
| **Future** | Dynamic center locator (if SRF provides data). Multi-language place descriptions (Milestone 5b). |

---

## Notes

Merged from FTR-050 (rationale) and FTR-050 (specification) per FTR-084.
