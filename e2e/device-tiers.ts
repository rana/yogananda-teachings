/**
 * Device-tier profiles — FTR-167 (Performance SLOs).
 *
 * Four tiers representing the global audience reality (PRI-05: Global-First).
 * These profiles are the single source of truth for:
 *   - Playwright E2E tests (network throttling + viewport)
 *   - CI performance gates
 *   - New Relic synthetic monitors (M3d+)
 *   - SLO target tables
 *
 * Tier definitions derived from FTR-011 audience research:
 *   T1: Rural Bihar JioPhone on 2G (15% of audience)
 *   T2: Urban developing world budget Android on 3G (40%)
 *   T3: Global urban mid-range phone on LTE (35%)
 *   T4: Developed world desktop on fiber (10%)
 *
 * Network params use Chrome DevTools Protocol format (Playwright's
 * page.route() and CDP session both accept this shape).
 */

export interface NetworkProfile {
  /** Round-trip time in milliseconds */
  offline: boolean;
  downloadThroughput: number; // bytes per second
  uploadThroughput: number;   // bytes per second
  latency: number;            // ms
}

export interface DeviceTier {
  name: string;
  description: string;
  /** Estimated share of portal audience (from FTR-011 demographics) */
  audienceShare: string;
  viewport: { width: number; height: number };
  /** Device scale factor */
  deviceScaleFactor: number;
  isMobile: boolean;
  hasTouch: boolean;
  network: NetworkProfile;
  /** User-Agent hint for realistic testing */
  userAgent?: string;
}

/**
 * SLO targets per tier for the autosuggestion feature.
 * Used by performance tests to assert timing requirements.
 */
export interface SuggestionSLO {
  /** Focus → chips visible (ms) */
  zeroStateRender: number;
  /** Keystroke → filtered results visible (ms) */
  prefixSuggestions: number;
  /** Tier B fuzzy fallback complete (ms) */
  fuzzyFallback: number;
}

// ── Tier Definitions ──────────────────────────────────────────────

export const TIER_1_2G: DeviceTier = {
  name: "T1-2G-KaiOS",
  description: "Rural India — JioPhone on 2G",
  audienceShare: "~15%",
  viewport: { width: 240, height: 320 },
  deviceScaleFactor: 1,
  isMobile: true,
  hasTouch: true,
  network: {
    offline: false,
    downloadThroughput: Math.floor((50 * 1024) / 8),   // 50 Kbps
    uploadThroughput: Math.floor((20 * 1024) / 8),      // 20 Kbps
    latency: 800,
  },
  userAgent: "Mozilla/5.0 (Mobile; LYF/F300B/LYF-F300B-001-01-15-130718-i;Android;KaiOS) Gecko/41.0 Firefox/41.0 KAIOS/2.0",
};

export const TIER_2_3G: DeviceTier = {
  name: "T2-3G-Android",
  description: "Urban developing world — Budget Android on 3G",
  audienceShare: "~40%",
  viewport: { width: 360, height: 640 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  network: {
    offline: false,
    downloadThroughput: Math.floor((400 * 1024) / 8),  // 400 Kbps
    uploadThroughput: Math.floor((150 * 1024) / 8),     // 150 Kbps
    latency: 300,
  },
};

export const TIER_3_LTE: DeviceTier = {
  name: "T3-LTE-Mobile",
  description: "Global urban — Mid-range phone on LTE",
  audienceShare: "~35%",
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  network: {
    offline: false,
    downloadThroughput: Math.floor((10 * 1024 * 1024) / 8), // 10 Mbps
    uploadThroughput: Math.floor((5 * 1024 * 1024) / 8),    // 5 Mbps
    latency: 50,
  },
};

export const TIER_4_FIBER: DeviceTier = {
  name: "T4-Fiber-Desktop",
  description: "Developed world — Desktop on fiber",
  audienceShare: "~10%",
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  isMobile: false,
  hasTouch: false,
  network: {
    offline: false,
    downloadThroughput: Math.floor((50 * 1024 * 1024) / 8), // 50 Mbps
    uploadThroughput: Math.floor((20 * 1024 * 1024) / 8),   // 20 Mbps
    latency: 5,
  },
};

export const ALL_TIERS = [TIER_1_2G, TIER_2_3G, TIER_3_LTE, TIER_4_FIBER] as const;

// ── SLO Targets ───────────────────────────────────────────────────

/**
 * Suggestion SLOs per tier.
 *
 * Philosophy: T1 gets generous but still-usable budgets.
 * A 2G seeker should see suggestions within 3 seconds — longer
 * than ideal, but short enough to feel responsive. T4 should
 * feel instant.
 *
 * These targets will be refined once we have production data
 * (Vercel Web Vitals, item 2 of the performance plan).
 */
export const SUGGESTION_SLOS: Record<string, SuggestionSLO> = {
  "T1-2G-KaiOS": {
    zeroStateRender: 3000,
    prefixSuggestions: 3000,
    fuzzyFallback: 5000,
  },
  "T2-3G-Android": {
    zeroStateRender: 1500,
    prefixSuggestions: 1500,
    fuzzyFallback: 3000,
  },
  "T3-LTE-Mobile": {
    zeroStateRender: 500,
    prefixSuggestions: 500,
    fuzzyFallback: 1000,
  },
  "T4-Fiber-Desktop": {
    zeroStateRender: 200,
    prefixSuggestions: 300,
    fuzzyFallback: 500,
  },
};

// ── Page-Level SLO Targets ────────────────────────────────────────

/**
 * Core Web Vitals targets per tier.
 * These apply to all pages and will be used for both
 * Playwright assertions and New Relic synthetic alerts.
 */
export interface PageSLO {
  /** First Contentful Paint (ms) */
  fcp: number;
  /** Largest Contentful Paint (ms) */
  lcp: number;
  /** Cumulative Layout Shift (unitless) */
  cls: number;
  /** Total JS bundle size (bytes, uncompressed) */
  maxJsBytes: number;
}

export const PAGE_SLOS: Record<string, PageSLO> = {
  "T1-2G-KaiOS": {
    fcp: 5000,
    lcp: 8000,
    cls: 0.1,
    maxJsBytes: 100 * 1024,  // 100KB (PRI-07)
  },
  "T2-3G-Android": {
    fcp: 3000,
    lcp: 5000,
    cls: 0.1,
    maxJsBytes: 100 * 1024,
  },
  "T3-LTE-Mobile": {
    fcp: 1500,
    lcp: 2500,
    cls: 0.1,
    maxJsBytes: 100 * 1024,
  },
  "T4-Fiber-Desktop": {
    fcp: 800,
    lcp: 1500,
    cls: 0.1,
    maxJsBytes: 100 * 1024,
  },
};
