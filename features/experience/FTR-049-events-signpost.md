---
ftr: 49
title: Events Signpost
summary: "Lightweight signpost linking seekers to SRF events, retreats, and commemorations"
state: approved-provisional
domain: experience
governed-by: [PRI-04]
---

# FTR-049: Events Signpost

## Rationale


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
- Street View link (FTR-050) — fallback virtual visit for places without SRF tours

**The unique value:** The teaching portal is the only place that can cross-reference sacred places with the specific passages that describe them. When a seeker reads about Serampore in the Autobiography, the portal can show "Visit this place." When they browse the Sacred Places page, each entry links back to every passage that mentions it. The teachings and the places illuminate each other.

### Map Strategy

- **Milestone 5a:** No maps. Text descriptions with addresses and "Get Directions" links (opens user's native maps app).
- **Sacred Places enhancement:** No embedded map library. Add **"See This Place" Street View links** (plain Google Maps URLs, no SDK) to place cards where coverage exists. Zero map dependencies, zero tile servers, zero maintenance. See FTR-050.
- **Future:** Dynamic center locator (if SRF provides data). If a center locator requires an embedded map, evaluate Leaflet + OpenStreetMap or Google Maps at that point — separate decision for a different page with different requirements.

### Rationale

- **DELTA Embodiment.** The portal should encourage seekers to visit, practice, and connect in person. A well-designed Sacred Places section makes the teachings tangible.
- **Unique cross-referencing.** No other site connects Yogananda's physical world to his written words with deep links into a book reader. This is the portal's distinctive contribution.
- **"What Next" Bridge.** Both Events and Sacred Places serve the portal's signpost function — pointing toward the broader SRF world without tracking conversions.
- **Signpost, not duplicate.** The convocation site handles event logistics. The Online Meditation Center handles live events. The portal links to both without replicating their functionality.
- **Virtual pilgrimage tours.** SRF offers narrated virtual pilgrimage tours of Mother Center, Lake Shrine, Hollywood Temple, and Encinitas Ashram Center. These are richer than Street View and serve the same "visit this place" intent. Sacred Places entries for these properties should link to SRF's tours ("Take a Virtual Tour →") when `virtual_tour_url` is populated. SRF tour URLs take priority over Street View for the same property. Canonical tour URLs are a stakeholder question (CONTEXT.md).
- **Convocation ↔ Sacred Places cross-link.** The portal uniquely connects what makes a place sacred (book passages) with how to experience it (virtual tour, in-person visit, Convocation pilgrimage). Sacred Places entries for LA-area SRF properties should include a seasonal note: "This site is part of the annual SRF World Convocation pilgrimage." The Events section Convocation entry links back to Sacred Places ("Explore the sacred places → /places"). This three-way connection — teaching, place, gathering — is the portal's distinctive signpost contribution.
- **No embedded map — Street View links instead (FTR-050).** Zero dependencies, zero tracking, zero cost. Street View URLs give seekers a virtual visit to physical places without embedding any map SDK. "Get Directions" delegates navigation to the user's preferred maps app.

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
- A subsequent enhancement adds biographical sites and "See This Place" Street View links (FTR-050) — no embedded map library
- Sacred Places content needs SRF/YSS review — biographical descriptions must be accurate and approved
- Cross-referencing places with book passages requires a `places` table and a `chunk_places` junction table (or place tags on chunks)
- Stakeholder question: can SRF provide or approve property photographs? (Already raised.)
- Stakeholder question: does SRF have a center location database (addresses, coordinates, hours) for an eventual center locator?
- The Events section is low-maintenance — updated annually or via Contentful in production


## Specification


The portal connects seekers to SRF's gatherings without duplicating existing event properties. This is a signpost, not a destination. See FTR-049.

### Content

| Element | Content | Source | Update Frequency |
|---------|---------|--------|-----------------|
| **World Convocation** | SRF's annual gathering of seekers from around the world, offered free of charge. Held each August in Los Angeles and simultaneously online, Convocation includes classes on Yogananda's teachings, group meditations, devotional chanting (kirtan), pilgrimage tours to sacred SRF sites, and fellowship with monastics and seekers worldwide. Anyone may attend — no membership required. Hero image, next year's dates. | Static text + link to `convocation.yogananda.org` | Annual |
| **Commemorations** | Christmas meditation, Mahasamadhi (March 7), Janmashtami, Founder's Day, etc. | Static list with dates and links to SRF event pages | Annual |
| **Online events** | "Join a live meditation" — SRF's Online Meditation Center offers live group meditations, guided meditations led by SRF monastics, and devotional chanting sessions from the convenience of home. | Link to `onlinemeditation.yogananda.org` | Static |
| **Retreats** | "Experience a retreat" | Link to SRF retreat information | Static |
| **Monastic visits** | SRF monastics visit meditation centers worldwide throughout the year for classes, meditations, and fellowship. | Link to SRF events page (`yogananda.org/events`) | Static |
| **Youth & young adult programs** | SRF offers dedicated programs for young seekers. | Link to SRF youth/young adult pages (`yogananda.org/events`) | Static |

### Page Design

Located at `/events` (dedicated page — consistent with the routes table in § Frontend Design § Pages and the nav structure).

```
┌─────────────────────────────────────────────┐
│ Gatherings & Events │
│ │
│ ┌─────────────────────────────────────┐ │
│ │ 🌅 World Convocation 2027 │ │
│ │ │ │
│ │ SRF's annual gathering of seekers │ │
│ │ from around the world — free and │ │
│ │ open to all. Classes, meditations, │ │
│ │ kirtan, pilgrimage tours to sacred │ │
│ │ SRF sites, and fellowship with │ │
│ │ monastics. In Los Angeles & online. │ │
│ │ │ │
│ │ Register free → convocation.yoga.. │ │
│ │ Explore the sacred places → /places │ │
│ └─────────────────────────────────────┘ │
│ │
│ Upcoming Commemorations │
│ ───────────────────────── │
│ March 7 · Mahasamadhi of │
│ Paramahansa Yogananda │
│ August · Janmashtami │
│ December · Christmas Meditation │
│ │
│ ┌──────────────────┐ ┌──────────────────┐ │
│ │ Join a Live │ │ Experience a │ │
│ │ Meditation → │ │ Retreat → │ │
│ └──────────────────┘ └──────────────────┘ │
│ │
│ ┌──────────────────┐ ┌──────────────────┐ │
│ │ Monastic Visits │ │ Youth & Young │ │
│ │ Worldwide → │ │ Adult Programs → │ │
│ └──────────────────┘ └──────────────────┘ │
└─────────────────────────────────────────────┘
```

### Implementation

- **Milestone 5a:** Static content. MDX or hardcoded in a Next.js page. No CMS needed.
- **Production:** Contentful entry type `event` with fields: `title`, `date`, `description`, `externalUrl`, `image`. Editors update annually.
- **No dynamic event data.** The portal does not fetch from SRF's event systems. It links to them.
- **Lightweight calendar awareness (Milestone 5a):** The Convocation hero card displays the next Convocation date. Since Convocation is always in August, a simple date comparison promotes the card from "annual event" to "upcoming event" when the current date is within a configurable window (e.g., April–August). During this window, the card's description adds "Registration is open" with link. Outside the window: "Held each August." This is not the full FTR-065 calendar-aware surfacing system — it's a single date check on a static page. Commemorations can use similar lightweight date proximity when full FTR-065 ships (Milestone 3b+).

---

## Notes

Merged from FTR-049 (rationale) and FTR-049 (specification) per FTR-084.
