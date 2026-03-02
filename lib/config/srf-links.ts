/**
 * Centralized cross-site URL registry — yogananda.org ecosystem.
 *
 * All external SRF URLs in one place. Components import from here
 * instead of hardcoding URLs. When SRF restructures their site,
 * we update this file and everything follows.
 *
 * Organized by the three-room model:
 *   yogananda.org  = living room (community, events, practice)
 *   portal         = reading room (books, search, contemplation)
 *   app            = practice room (meditation, lessons, daily)
 *
 * @see .elmer/proposals/yogananda-org-ecosystem-exploration.md
 */

// ── yogananda.org — Main Site ───────────────────────────────────

export const SRF = {
  /** Organization home */
  home: "https://yogananda.org",

  /** Paramahansa Yogananda biography */
  yogananda: "https://yogananda.org/paramahansa-yogananda",

  /** Autobiography of a Yogi — official book page */
  autobiography: "https://yogananda.org/autobiography-of-a-yogi",

  /** Complete works listing */
  works: "https://yogananda.org/complete-works-by-yogananda",
} as const;

// ── Teachings ───────────────────────────────────────────────────

export const SRF_TEACHINGS = {
  /** Teachings hub */
  hub: "https://yogananda.org/teachings",

  /** How-to-Live Wisdom — 22 thematic categories (canonical SRF taxonomy) */
  wisdom: "https://yogananda.org/how-to-live-wisdom",

  /** Glossary & Pronunciation Guide (~100+ terms) */
  glossary: "https://yogananda.org/self-realization-fellowship-glossary",

  /** Video & Audio teachings library */
  library: "https://yogananda.org/teachings-library",

  /** Prayers and Affirmations */
  prayers: "https://yogananda.org/prayers-and-affirmations",

  /** Hidden Truths of the Scriptures */
  scriptures: "https://yogananda.org/hidden-truths-of-the-scriptures",

  /** Self-Realization Magazine */
  magazine: "https://yogananda.org/self-realization-magazine",

  /** Engage — curated monastic guidance */
  engage: "https://yogananda.org/path-engage",
} as const;

// ── How-to-Live Wisdom Categories (22) ──────────────────────────
// SRF's canonical thematic taxonomy of Yogananda's teachings.
// Seed taxonomy for Quiet Index (DES-029) and knowledge graph (DES-054).

export const WISDOM_CATEGORIES = [
  { slug: "the-purpose-of-life", label: "The Purpose of Life" },
  { slug: "secrets-of-lasting-happiness", label: "Secrets of Lasting Happiness" },
  { slug: "achieving-true-success-and-prosperity", label: "Achieving True Success and Prosperity" },
  { slug: "health-and-healing", label: "Health and Healing" },
  { slug: "overcoming-anger", label: "Overcoming Anger" },
  { slug: "utilizing-the-power-of-prayer", label: "Utilizing the Power of Prayer" },
  { slug: "introspection-how-to-realize-your-highest-potential", label: "Introspection: How to Realize Your Highest Potential" },
  { slug: "forgiveness", label: "Forgiveness" },
  { slug: "knowing-god", label: "Knowing God" },
  { slug: "love-human-and-divine", label: "Love: Human and Divine" },
  { slug: "creating-harmony-in-our-relationships-with-others", label: "Creating Harmony in Our Relationships" },
  { slug: "intuition-insight-of-the-soul", label: "Intuition: Insight of the Soul" },
  { slug: "the-role-of-a-guru-in-ones-spiritual-search", label: "The Role of a Guru in One's Spiritual Search" },
  { slug: "taking-simplicity-to-heart", label: "Taking Simplicity to Heart" },
  { slug: "beauty-and-joy-grace-and-refuge-living-in-the-presence-of-the-mother-divine", label: "Living in the Presence of the Mother Divine" },
  { slug: "how-to-use-thoughts-of-immortality-to-awaken-your-true-self", label: "How to Use Thoughts of Immortality to Awaken Your True Self" },
  { slug: "conquering-fear-anxiety-and-worry", label: "Conquering Fear, Anxiety, and Worry" },
  { slug: "inner-security-in-an-uncertain-world", label: "Inner Security in an Uncertain World" },
  { slug: "spiritual-light-for-these-challenging-times", label: "Spiritual Light for These Challenging Times" },
  { slug: "understanding-death-and-loss", label: "Understanding Death and Loss" },
  { slug: "seasonal-inspiration", label: "Seasonal Inspiration" },
  { slug: "mastering-your-moods", label: "Mastering Your Moods" },
] as const;

/** Build a full URL for a wisdom category */
export function wisdomCategoryUrl(slug: string): string {
  return `${SRF_TEACHINGS.wisdom}/${slug}`;
}

// ── Practice & Meditation ───────────────────────────────────────

export const SRF_PRACTICE = {
  /** SRF Lessons — home study course */
  lessons: "https://yogananda.org/lessons",

  /** Beginner's meditation instruction */
  beginnersMeditation: "https://yogananda.org/a-beginners-meditation",

  /** Guided meditations */
  guidedMeditations: "https://yogananda.org/guided-meditations",

  /** Online Meditation Center */
  onlineMeditation: "https://onlinemeditation.yogananda.org",

  /** Kirtan & devotional chanting */
  kirtan: "https://yogananda.org/the-divine-art-of-kirtan-engage",

  /** Request prayers */
  prayerRequest: "https://members.yogananda-srf.org/SelfService/Prayers/PrayerRequest.aspx",
} as const;

// ── Community & Events ──────────────────────────────────────────

export const SRF_COMMUNITY = {
  /** Events and programs hub */
  events: "https://yogananda.org/events-and-programs",

  /** World Convocation */
  convocation: "https://convocation.yogananda.org",

  /** Activities and centers near you */
  locations: "https://yogananda.org/locations-map",

  /** Retreats */
  retreats: "https://yogananda.org/retreats",

  /** Virtual pilgrimage tours */
  virtualTours: "https://yogananda.org/virtual-pilgrimage-tours",

  /** Volunteer portal */
  volunteer: "https://volunteer.yogananda.org",

  /** Voluntary League of Disciples */
  vld: "https://voluntaryleague.yogananda.org",
} as const;

// ── Organization ────────────────────────────────────────────────

export const SRF_ORG = {
  /** About SRF */
  about: "https://yogananda.org/self-realization-fellowship",

  /** Mission and Aims & Ideals */
  mission: "https://yogananda.org/srf-aims-and-ideals",

  /** Lineage and Leadership */
  lineage: "https://yogananda.org/lineage-and-leadership",

  /** Light for the Ages — future projects */
  lightForTheAges: "https://yogananda.org/light-for-the-ages-the-future-of-paramahansa-yoganandas-work",

  /** International headquarters */
  headquarters: "https://yogananda.org/international-headquarters",

  /** Blog */
  blog: "https://yogananda.org/blog",

  /** Contact */
  contact: "https://yogananda.org/contact-us",

  /** Free literature for new seekers */
  freeLiterature: "https://yogananda.org/contact-us-free-literature",

  /** FAQ */
  faq: "https://yogananda.org/frequently-asked-questions",

  /** Donate */
  donate: "https://yogananda.org/donate",

  /** SRF/YSS app */
  app: "https://yogananda.org/app-faq",

  /** SRF newsletter */
  newsletter: "https://yogananda.org/srf-newsletter",
} as const;

// ── Commerce ────────────────────────────────────────────────────

export const SRF_BOOKSTORE = {
  /** Bookstore home */
  home: "https://bookstore.yogananda-srf.org",

  /** Member portal */
  memberPortal: "https://members.yogananda-srf.org",
} as const;

// ── Social ──────────────────────────────────────────────────────

export const SRF_SOCIAL = {
  youtube: "https://www.youtube.com/@YoganandaSRF",
  facebook: "https://www.facebook.com/selfrealizationfellowship",
  instagram: "https://www.instagram.com/selfrealizationfellowship",
  twitter: "https://twitter.com/srfyogananda",
} as const;

// ── Structured Data (JSON-LD sameAs) ────────────────────────────

export const SRF_SAME_AS = {
  orgWikidata: "https://www.wikidata.org/wiki/Q1075365",
  orgWikipedia: "https://en.wikipedia.org/wiki/Self-Realization_Fellowship",
  yoganandaWikidata: "https://www.wikidata.org/wiki/Q131814",
  yoganandaWikipedia: "https://en.wikipedia.org/wiki/Paramahansa_Yogananda",
} as const;

// ── YSS (Yogoda Satsanga Society of India) ──────────────────────

export const YSS = {
  home: "https://yssofindia.org",
  about: "https://yogananda.org/yogoda-satsanga-society-of-india",
} as const;

// ── Portal ──────────────────────────────────────────────────────

/**
 * NEXT_PUBLIC_SITE_URL controls the canonical base URL for metadata, OG images,
 * JSON-LD, sitemaps, and robots.txt. Set in Vercel env vars per environment.
 * Falls back to the pre-launch Vercel URL if unset.
 */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://teachings.yogananda.tech";

export const PORTAL = {
  /** Canonical portal domain — driven by NEXT_PUBLIC_SITE_URL env var */
  canonical: siteUrl,

  /** Final SRF production domain (post-launch, when yogananda.org is available) */
  canonicalFinal: "https://teachings.yogananda.org",
} as const;
