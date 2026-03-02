# yogananda.org Ecosystem Exploration — Complete Findings

**Date:** 2026-03-02
**Method:** Playwright MCP snapshots of yogananda.org (homepage, nav menus, /teachings, /how-to-live-wisdom, /self-realization-fellowship-glossary), code grep of portal cross-links, design token inventory
**Status:** Raw exploration — feeds PRO-044 (Cross-Site Harmony), design system repo, and immediate implementation tasks

---

## I. Complete yogananda.org Site Map

### Primary Navigation (7 sections)

| Nav | URL | Purpose |
|-----|-----|---------|
| Teachings | /teachings | Gateway to all teaching content |
| Meditate | /meditate | Meditation instruction + online events |
| Paramahansa Yogananda | /paramahansa-yogananda | Biography, works, documentary |
| Events | /events-and-programs | Calendar, retreats, youth programs |
| About | /self-realization-fellowship | Organization, lineage, locations |
| Blog | /blog | Wisdom articles + news/events |
| Donate | members.yogananda-srf.org/donation | Giving |

### Sub-Domains (9 properties)

| Property | Domain | Function |
|----------|--------|----------|
| Main site | yogananda.org | Content + organizational hub |
| Convocation | convocation.yogananda.org | Annual event registration |
| Online Meditation | onlinemeditation.yogananda.org | Virtual meditation events |
| Member Portal | members.yogananda-srf.org | Lessons, donations, prayers |
| Bookstore | bookstore.yogananda-srf.org | Physical + digital products |
| Volunteer | volunteer.yogananda.org | Service opportunities |
| VLD | voluntaryleague.yogananda.org | Kriya Yoga community |
| Study App | study.yogananda.org | Desktop companion app |
| Flipbooks | flipbooks.yogananda.org | Interactive content |

### Languages: 8
English, Deutsch, Español, Français, Italiano, Português, 日本語, ไทย

**Notable:** No Hindi. yogananda.org has Japanese and Thai but not Hindi. Our portal filling the Hindi gap (via YSS, PRO-043) would be genuinely additive, not duplicative.

### Teachings Section (11 content areas)

1. The True Meaning of Yoga
2. Kriya Yoga Path of Meditation
3. Lessons for Home Study
4. **How-to-Live Wisdom** (21 topical categories — see Section II)
5. Video & Audio Teachings Library
6. Hidden Truths of the Scriptures
7. Prayers and Affirmations
8. Self-Realization Magazine
9. Engage (curated guidance)
10. Unity of the Scriptures
11. **Glossary & Pronunciation Guide** (~100+ terms — see Section III)

### Meditate Section
- Instructions for Beginners (video)
- Guided Meditations (video)
- The Value of Group Meditation
- Kirtan & Devotional Chanting
- Online Meditation Center

### Paramahansa Yogananda Section
- Biography: A Beloved World Teacher
- Disciples Reminisce (video)
- Listen to the Voice of Yogananda (audio — original recordings)
- Complete Works by Yogananda
- Autobiography of a Yogi (dedicated page)
- Awake: The Life of Yogananda (documentary)

### Events Section
- Convocation (annual, August)
- Online Meditations and Events
- Activities Near You
- Worldwide Monastic Visits
- Retreats
- Programs for Youth
- Programs for Young Adults
- Calendar

### About Section
- Mission of SRF
- Aims & Ideals
- Lineage & Leadership
- Monastic Order
- Yogoda Satsanga Society of India
- Light for the Ages (future projects)
- International Headquarters
- Virtual Pilgrimage Tours
- Location Map (500+ centers worldwide)

### Blog
- Wisdom category (teachings-focused articles)
- News & Events category
- Newsletter archive

### Footer Ecosystem
- Member Portal, Volunteer Portal, Online Meditation Center, VLD, Bookstore
- Contact Us, Free Literature, FAQ, Employment
- Apply for Lessons, Request Prayers, Volunteer, Find a location, Donate, SRF/YSS app
- Social: Facebook, Instagram, YouTube, Twitter
- Newsletter signup (Constant Contact, language-specific forms)

---

## II. How-to-Live Wisdom — The Taxonomic Goldmine

yogananda.org/how-to-live-wisdom contains **22 thematically organized categories** of Yogananda's teachings. Each topic page includes verbatim quotes, affirmations, and links to related books/recordings.

This is SRF's own editorial taxonomy of the teachings:

| # | Topic | URL slug | Affirmation included |
|---|-------|----------|---------------------|
| 1 | The Purpose of Life | /the-purpose-of-life | Yes |
| 2 | Secrets of Lasting Happiness | /secrets-of-lasting-happiness | Yes |
| 3 | Achieving True Success and Prosperity | /achieving-true-success-and-prosperity | Yes |
| 4 | Health and Healing | /health-and-healing | Yes |
| 5 | Overcoming Anger | /overcoming-anger | Yes |
| 6 | Utilizing the Power of Prayer | /utilizing-the-power-of-prayer | Yes |
| 7 | Introspection: How to Realize Your Highest Potential | /introspection-how-to-realize-your-highest-potential | Yes |
| 8 | Forgiveness | /forgiveness | Yes |
| 9 | Knowing God | /knowing-god | Yes |
| 10 | Love: Human and Divine | /love-human-and-divine | Yes |
| 11 | Creating Harmony in Our Relationships | /creating-harmony-in-our-relationships-with-others | Yes |
| 12 | Intuition: Insight of the Soul | /intuition-insight-of-the-soul | Yes |
| 13 | The Role of a Guru in One's Spiritual Search | /the-role-of-a-guru-in-ones-spiritual-search | Yes |
| 14 | Taking Simplicity to Heart | /taking-simplicity-to-heart | Yes |
| 15 | Living in the Presence of the Mother Divine | /beauty-and-joy-grace-and-refuge-living-in-the-presence-of-the-mother-divine | Yes |
| 16 | How to Use Thoughts of Immortality to Awaken Your True Self | /how-to-use-thoughts-of-immortality-to-awaken-your-true-self | Yes |
| 17 | Conquering Fear, Anxiety, and Worry | /conquering-fear-anxiety-and-worry | Yes |
| 18 | Inner Security in an Uncertain World | /inner-security-in-an-uncertain-world | Yes |
| 19 | Spiritual Light for these Challenging Times | /spiritual-light-for-these-challenging-times | Yes |
| 20 | Understanding Death and Loss | /understanding-death-and-loss | Yes |
| 21 | Seasonal Inspiration | /seasonal-inspiration | Yes |
| 22 | Mastering Your Moods | flipbooks.yogananda.org/... | Flipbook |

**Significance:** These categories should be adopted as seed nodes for our Quiet Index (DES-029) and knowledge graph (DES-054). They represent canonical SRF editorial voice. Our AI enrichment pipeline should tag chunks with these categories when relevant, enabling automatic cross-linking to yogananda.org topic pages.

Each topic page also links to related books and recordings in the SRF catalog — these links inform our "Go Deeper" signpost patterns.

---

## III. SRF Glossary — Canonical Source

The glossary at /self-realization-fellowship-glossary contains ~100+ Sanskrit/spiritual terms organized A-Z with:

- Full multi-paragraph definitions with scriptural cross-references
- Internal cross-links between entries (e.g., "See Mahavatar Babaji")
- Pronunciation guide section
- Available in 6 languages (en, de, es, it, pt, th)
- Sections: A-B, C-D, E-G, H-L, M-P, R-S, T-Z

**Sample terms observed:** Arjuna, ashram, astral body, Aum (Om), avatar, avidya, Babaji, Bhagavad Gita, Bhagavan Krishna, Bhakti Yoga, Brahma-Vishnu-Shiva, Brahman, breath...

**Significance for DES-042:** This IS the canonical glossary. Our portal's glossary architecture should:
1. Use these definitions as authoritative source
2. Link in-text terms to the SRF glossary page (or our portal's wrapper of it)
3. Cross-reference our entity registry (20 entities, 12 Sanskrit terms already seeded) with glossary entries
4. Preserve SRF's definition text verbatim (PRI-01 applies to glossary definitions too)

---

## IV. Current Portal Cross-Links (Code Inventory)

### What we link to now (6 URLs scattered across 4 files):

| URL | Location | Context |
|-----|----------|---------|
| yogananda.org | Footer.tsx, layout.tsx | Main site link, JSON-LD Organization |
| yogananda.org/lessons | Homepage, Footer, About | Practice Bridge signpost |
| yogananda.org/locations | About page | "Find a center" |
| onlinemeditation.yogananda.org | About page | "Online meditation" |
| yogananda.org/app-faq | About page | "SRF/YSS app" |
| yogananda.org/contact-us | Privacy page | Data rights contact |
| yogananda.org/paramahansa-yogananda | layout.tsx | JSON-LD Person sameAs |
| bookstore.yogananda-srf.org | Footer, Books pages | Book purchase links |
| youtube.com/@YoganandaSRF | Footer, About, JSON-LD | Social / sameAs |

### No centralized URL registry exists
URLs are hardcoded across components. The About page has a `GO_DEEPER_LINKS` array (best current pattern). Footer has inline hrefs. JSON-LD has inline URLs.

---

## V. Cross-Link Gaps — What We're Missing

### High Priority (should exist now)

| yogananda.org Resource | Why it matters | Portal location |
|------------------------|---------------|-----------------|
| /how-to-live-wisdom + 22 topic pages | SRF's thematic taxonomy of teachings; search results about these topics should cross-link | Search results, chapter pages |
| /self-realization-fellowship-glossary | Canonical source for spiritual terms; in-text linking | Entity registry, chapter reader |
| /teachings-library | Video/audio teachings on same topics as our books | Chapter pages, search results |
| /autobiography-of-a-yogi | SRF's official page about the book we host | Book detail page |
| /a-beginners-meditation | Direct Practice Bridge target for meditation queries | Practice Bridge, crisis interstitial |
| /guided-meditations | Actionable meditation content | Practice Bridge |
| /contact-us-free-literature | Gateway for new seekers wanting physical materials | Start Here paths, About |

### Medium Priority (Arc 2+)

| Resource | Why | Location |
|----------|-----|----------|
| /the-divine-art-of-kirtan-engage | Chanting/kirtan search context | Search results |
| /virtual-pilgrimage-tours | DES-023 Sacred Places | Future /places page |
| /awake-the-life-of-yogananda | Documentary as entry point | About page, biography context |
| /calendar | Event awareness | Seasonal content |
| /self-realization-magazine | Magazine as companion resource | About page |
| /prayers-and-affirmations | Affirmation practice | Search results about prayer/healing |

### Low Priority (Arc 3+)

| Resource | Why | Location |
|----------|-----|----------|
| /blog | Fresh content cross-linking | Homepage, related content |
| /programs-for-young-adults | Youth pathways (open question) | Start Here / Guide |
| /srf-newsletter | Newsletter signpost (open question) | Footer |
| /hidden-truths-of-the-scriptures | Scripture unity theme | Thematic search results |

---

## VI. Visual Design Language — SRF Observations

### yogananda.org Design Characteristics
- **Tech:** Craft CMS, compiled JS bundle, Amplitude analytics (cross-domain tracking), Google Tag Manager, Constant Contact, OneTrust cookie consent
- **Layout:** Clean, generous whitespace, card-based content grids (image + title + description), full-page mega-menu overlays
- **Colors:** Navy/dark blue hero backgrounds, gold/yellow accents, white text on dark photographic overlays, warm photography throughout
- **Typography:** Sans-serif for headings and UI (appears custom), no obvious serif reading font — imagery carries more weight than typography
- **Brand:** Gold lotus logo, "Self-Realization Fellowship" wordmark, breadcrumbs on all subpages, announcement bar (gold/dismissible)
- **Interactions:** Share buttons (Facebook, Twitter, email, clipboard), language selector in header + footer, mega-menu with 3-column rich layouts per section
- **Photography:** Lotus flowers, meditation scenes, temple architecture, Yogananda portraits, monastic life, nature

### Our Portal Design Characteristics (Current)
- Navy `#1a2744`, Gold `#dcbd23`, Cream `#FAF8F5`, Cream-dark `#f0ece4`
- Merriweather (reading), Lora (display), Open Sans (UI) — self-hosted WOFF2
- Typographically minimal — text-forward, not image-forward
- Calm: no autoplay, no push notifications, no engagement tracking
- Zero raw hex values in components (all Tailwind tokens)
- 44px touch targets, WCAG 2.1 AA focus indicators, reduced motion support
- Print stylesheet parity

### Harmony Assessment
The portal feels like a **quieter wing of the same building**. yogananda.org is warmer, more photographic, more organizational. The portal is cooler, more typographic, more contemplative. This distinction is correct: the reading room should feel calmer than the entrance hall. But the shared DNA (navy + gold + cream) makes them recognizable as siblings.

---

## VII. Self-Answered Questions

### "Does yogananda.org know the portal exists?"
The "Light for the Ages" page discusses SRF's future projects. The portal will eventually need to be announced there. The `teachings.yogananda.org` subdomain already positions the portal as an official SRF property. **Action:** When the portal launches publicly, coordinate with SRF to add it to Light for the Ages and the footer ecosystem.

### "Will yogananda.org link back to us?"
Almost certainly yes — the portal hosts the full text of the Autobiography. yogananda.org/autobiography-of-a-yogi should eventually include a "Read online free" link to our portal. The bookstore pages could include a "Read free online" alternative. **Action:** Design our book detail pages to be the canonical "read online" URL that yogananda.org can link to.

### "How does the portal complement the SRF/YSS app?"
The app is described as "Your digital spiritual companion for study, meditation, and inspiration." It requires installation (App Store/Google Play/Desktop). The portal is open web — no download, no account, globally accessible. The app serves committed practitioners; the portal serves everyone from curious newcomers to deep students. **Action:** Our About page should mention the app as a complement for those who want a dedicated practice companion.

### "What about the flipbook format content?"
flipbooks.yogananda.org hosts interactive content (e.g., "Mastering Your Moods"). This is a content type outside our corpus scope — it's curated editorial content from the SRF magazine, not book text. **Action:** Note in DES-056 (Feature Catalog) that flipbook content exists as a potential future corpus expansion, but it requires SRF editorial authorization.

### "Amplitude session boundary?"
yogananda.org uses Amplitude with cross-domain tracking (device/session ID decoration on URLs). Our portal uses DELTA-compliant analytics (PRI-09). A seeker clicking from yogananda.org to our portal will lose their Amplitude session — by design. **Action:** This is correct behavior per PRI-09. Document in PRO-044 that the privacy boundary is intentional and SRF should be informed.

### "The 8-language gap?"
yogananda.org has German, French, Italian, Japanese, Thai — languages we don't prioritize. For cross-site harmony, we should route visitors in those languages to yogananda.org. **Action:** Add to DES-017 a "cross-site language fallback" pattern: when locale detection finds de/fr/it/ja/th, show a banner: "This portal is available in English and Spanish. Visit yogananda.org for [language name]."

### "Should we study the 'Engage' section?"
yogananda.org/path-engage is curated multimedia guidance — the closest analog to our portal's contemplative reading. But Engage is about *guidance from monastics*, while our portal is about *Yogananda's own words*. Different scope, complementary purpose. **Action:** Link to Engage from our About page as a "Continue your exploration" signpost.

---

## VIII. Opportunities Not Yet Considered

### 1. Today's Wisdom ↔ yogananda.org Quote Coordination
yogananda.org homepage displays a daily-ish quote (observed: "To commune daily with God in deep meditation..."). Our portal has Today's Wisdom. Are these independent? Could they be synchronized? A seeker seeing the same quote on both properties in one day creates a sense of coherent ecosystem. **Action:** Add as open question — should Today's Wisdom draw from the same source as yogananda.org's homepage quote?

### 2. SRF Newsletter Archive as Content Source
yogananda.org/srf-newsletter has a monthly newsletter archive. These newsletters contain curated Yogananda quotes and monastic commentary. Could newsletter content enter our corpus (with SRF authorization)? **Action:** Note in PRO-014 (monastic content scope) as potential future content source.

### 3. "Request Prayers" Integration
yogananda.org prominently features prayer request functionality (member portal). When our search surfaces passages about suffering, prayer, or healing, the Practice Bridge could include "Request prayers from SRF" alongside the Lessons link. **Action:** Add to Practice Bridge expansion (A4 in action list).

### 4. SRF YouTube Channel as Parallel Content Layer
@YoganandaSRF has extensive video content — monastic talks, guided meditations, commemorations. When our portal surfaces passages about a topic, we could link to relevant YouTube videos. DES-021 (YouTube Video Section) already plans this. **Action:** Confirm YouTube channel ID for DES-021: youtube.com/user/YoganandaSRF.

### 5. Bookstore Deep Linking per Book
We currently link to the bookstore homepage. We should deep-link to the specific book's product page. The database already has a `bookstore_url` column per book. **Action:** Verify all bookstore_url values are populated and use them on book detail pages.

### 6. Virtual Pilgrimage Tours as Immersive Companion
When reading about Ranchi or Encinitas or Dakshineswar in the Autobiography, a reader could be offered a virtual pilgrimage tour of that place. yogananda.org/virtual-pilgrimage-tours exists. **Action:** During chapter enrichment, tag chapters with Sacred Places references and link to virtual tours.

### 7. Free Literature for New Seekers
yogananda.org/contact-us-free-literature lets anyone request free physical literature. This is a powerful signpost for seekers in countries with limited internet. Our Start Here paths should include this. **Action:** Add to Start Here page links.

### 8. Photo Assets for Portal Visual Design
yogananda.org uses extensive photography — lotus flowers, temple architecture, meditation scenes, Yogananda portraits, lineage guru images. These visual assets could inform our portal's imagery (if SRF grants access). See Section X for photo collection strategy.

---

## IX. What Resonates at the Highest Octave

Three properties. One mission. Three expressions.

- **yogananda.org** = The living room. Community, events, practice instruction, organizational presence, giving.
- **Our portal** = The reading room. The words themselves — searchable, contemplatable, shareable.
- **SRF/YSS app** = The practice room. Personal meditation companion, Lessons delivery, daily inspiration.

The design system isn't just shared colors. It's shared *behavioral principles encoded as design tokens*:
- Calm technology isn't a feature — it's a CSS rule (`autoplay: never`, `push-notifications: never`)
- Verbatim fidelity isn't a policy — it's a typography specification (how sacred text is always rendered)
- Signpost-not-destination isn't a philosophy — it's a link pattern (every cross-link to yogananda.org follows the same calm visual language)

The How-to-Live Wisdom categories are the **Rosetta Stone** between SRF's editorial voice and our AI semantic search. When a seeker searches "how to overcome fear," two things happen:
1. Our search engine finds relevant passages in the Autobiography
2. The cross-link layer knows to surface yogananda.org/conquering-fear-anxiety-and-worry

Two sites, one coherent response to the seeker's question. The boundary between them should be invisible to the seeker.

The SRF glossary is the **canonical vocabulary** — not just definitions but a transmission lineage. When we link "Kriya Yoga" in our text to the SRF glossary entry, we're not adding a tooltip. We're connecting the word to its authoritative definition as maintained by the organization Yogananda founded. The link itself is an act of fidelity.

The design system repo encodes all of this: visual tokens (colors, fonts, spacing), behavioral tokens (calm technology rules, performance budgets, accessibility requirements), and semantic tokens (sacred text rendering, attribution patterns, signpost link styles). Any future property built on this foundation automatically inherits the spiritual principles. The design system is a carrier of the mission.

---

## X. Photo and Visual Asset Collection Strategy

### Available Sources

1. **yogananda.org** — Extensive photography observed: lotus flowers, temple/ashram architecture, meditation scenes, Yogananda portraits, lineage guru images, monastic life, nature, Lake Shrine. Usage rights: SRF copyright, requires authorization.

2. **Google Photos albums** (user's personal collection) — Available at https://photos.google.com/albums. Need to inventory what's there.

3. **Guru images for teachings site** — Paramahansa Yogananda, Sri Yukteswar, Lahiri Mahasaya, Mahavatar Babaji. These are sacred images with specific SRF usage guidelines.

### What the portal needs

| Image Category | Current State | Need |
|----------------|--------------|------|
| Guru portraits | None in portal | Yogananda portrait for About page, OG images, hero sections |
| Lineage gurus | None | Sri Yukteswar, Lahiri Mahasaya, Babaji for lineage context |
| Sacred places | None | Lake Shrine, Encinitas, Mt. Washington, Ranchi for DES-023 |
| Lotus/nature | SRF Lotus SVG only | Photography for visual warmth |
| Book covers | None | Autobiography cover art for book pages |
| Favicon | Default Next.js | Gold lotus favicon (see Section XI) |

### Authorization Considerations
- All SRF photographs are copyrighted
- Guru images require particular sensitivity (PRI-01 prohibits AI generation of guru likenesses)
- Usage context matters: devotional portraiture vs. casual illustration
- SRF has specific approved photographs for public use

---

## XI. Gold Lotus Favicon

**Directive:** Use gold lotus icon as favicon for both teachings and platform sites.

The SRF gold lotus is already implemented as an SVG component (`app/components/SrfLotus.tsx`). Need to:
1. Export as favicon.ico (16x16, 32x32, 48x48)
2. Export as apple-touch-icon.png (180x180)
3. Export as favicon-16x16.png and favicon-32x32.png
4. Add to `/app` directory (Next.js App Router convention)
5. Replicate to yogananda-platform repo

Color: SRF Gold `#dcbd23` on transparent background (or SRF Navy `#1a2744` background for contrast).

---

## XII. Recommended Actions

### Immediate (Next Session)

| # | Action | Where | Impact |
|---|--------|-------|--------|
| A1 | Create `/lib/config/srf-links.ts` — centralized cross-site URL registry | New file | Foundation for all cross-linking |
| A2 | Generate gold lotus favicon set from SrfLotus.tsx SVG | `/app/favicon.ico`, apple-touch-icon.png | Brand identity |
| A3 | Add bookstore deep links to book detail pages | `app/[locale]/books/[bookId]/page.tsx` | Seeker→purchase path |
| A4 | Expand Practice Bridge (beginners meditation, guided meditations, free literature, prayer request) | `app/[locale]/page.tsx`, About page | Richer signposting |

### Arc 2 Design Phase

| # | Action | Where | Impact |
|---|--------|-------|--------|
| A5 | Adopt How-to-Live Wisdom categories as Quiet Index seed taxonomy | DES-029, DES-054 | Canonical theme foundation |
| A6 | Link glossary terms to SRF canonical glossary | DES-042 | Authoritative definitions |
| A7 | Cross-site language fallback for unsupported locales | DES-017 | Global hospitality |
| A8 | Photo asset collection and authorization | Design system | Visual warmth |

### Document

| # | Action | Where | Impact |
|---|--------|-------|--------|
| A9 | Draft PRO-044: Cross-Site Harmony Architecture | PROPOSALS.md | Formal proposal |
| A10 | Add cross-site open questions to CONTEXT.md | CONTEXT.md Tier 3 | Decision tracking |
| A11 | Create yogananda-design repo skeleton | New repo | Design language reuse |
| A12 | Inventory Google Photos albums for usable assets | External | Visual content pipeline |
