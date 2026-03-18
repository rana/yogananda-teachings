/**
 * Suggestion performance tests — FTR-029 + FTR-167.
 *
 * Tests the autosuggestion experience under realistic network conditions
 * for each device tier (PRI-05: Global-First). Uses Chrome DevTools Protocol
 * for network throttling — measures what the seeker actually experiences.
 *
 * Run with: npx playwright test e2e/suggestion-performance.spec.ts
 * Run specific tier: npx playwright test --grep "T2-3G"
 *
 * These tests run against the dev server. They measure:
 *   1. Zero-state render: focus → chips visible
 *   2. Prefix suggestions: keystroke → results visible
 *   3. Suggestion file sizes (never exceed CDN-friendly limits)
 *   4. ARIA compliance under all tiers (accessibility doesn't degrade)
 *
 * Network throttling uses CDP sessions, which only work in Chromium.
 * The playwright.config.ts "perf" project is Chromium-only for this reason.
 */

import { test, expect, type CDPSession, type Page } from "@playwright/test";
import {
  ALL_TIERS,
  SUGGESTION_SLOS,
  type DeviceTier,
  type NetworkProfile,
} from "./device-tiers";

// ── Helpers ───────────────────────────────────────────────────────

async function throttleNetwork(page: Page, network: NetworkProfile): Promise<CDPSession> {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Network.emulateNetworkConditions", {
    offline: network.offline,
    downloadThroughput: network.downloadThroughput,
    uploadThroughput: network.uploadThroughput,
    latency: network.latency,
  });
  return cdp;
}

async function removeThrottle(cdp: CDPSession): Promise<void> {
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    downloadThroughput: -1,
    uploadThroughput: -1,
    latency: 0,
  });
}

/**
 * Measure time from an action to an expected DOM state.
 * Returns elapsed milliseconds.
 */
async function measureAction(
  page: Page,
  action: () => Promise<void>,
  waitFor: () => Promise<void>,
): Promise<number> {
  const start = Date.now();
  await action();
  await waitFor();
  return Date.now() - start;
}

// ── Tests per Tier ────────────────────────────────────────────────

for (const tier of ALL_TIERS) {
  const slo = SUGGESTION_SLOS[tier.name];

  test.describe(`Suggestions — ${tier.name} (${tier.description})`, () => {
    // Set viewport for this tier
    test.use({
      viewport: tier.viewport,
      isMobile: tier.isMobile,
      hasTouch: tier.hasTouch,
      deviceScaleFactor: tier.deviceScaleFactor,
      ...(tier.userAgent ? { userAgent: tier.userAgent } : {}),
    });

    test("zero-state: focus → chips visible within SLO", async ({ page }) => {
      // Load page without throttle first (simulates cached HTML)
      await page.goto("/en/search");
      await page.waitForLoadState("networkidle");

      // Now throttle for the suggestion interaction
      const cdp = await throttleNetwork(page, tier.network);

      try {
        const combobox = page.getByRole("combobox");
        await expect(combobox).toBeVisible();

        const elapsed = await measureAction(
          page,
          () => combobox.focus(),
          () => expect(page.getByRole("listbox")).toBeVisible().then(() => {}),
        );

        // eslint-disable-next-line no-console
        console.log(`  ${tier.name} zero-state: ${elapsed}ms (SLO: ${slo.zeroStateRender}ms)`);
        expect(elapsed).toBeLessThanOrEqual(slo.zeroStateRender);

        // Verify chips actually rendered
        const options = page.getByRole("option");
        await expect(options.first()).toBeVisible();
      } finally {
        await removeThrottle(cdp);
      }
    });

    test("prefix: type 'med' → suggestions visible within SLO", async ({ page }) => {
      await page.goto("/en/search");
      await page.waitForLoadState("networkidle");

      const combobox = page.getByRole("combobox");
      await combobox.focus();
      // Wait for zero-state to load first
      await expect(page.getByRole("listbox")).toBeVisible();

      // Now throttle and type
      const cdp = await throttleNetwork(page, tier.network);

      try {
        const elapsed = await measureAction(
          page,
          () => combobox.fill("med"),
          () => expect(page.getByRole("option").first()).toBeVisible().then(() => {}),
        );

        // eslint-disable-next-line no-console
        console.log(`  ${tier.name} prefix 'med': ${elapsed}ms (SLO: ${slo.prefixSuggestions}ms)`);
        expect(elapsed).toBeLessThanOrEqual(slo.prefixSuggestions);
      } finally {
        await removeThrottle(cdp);
      }
    });

    test("ARIA: combobox attributes correct under throttle", async ({ page }) => {
      await page.goto("/en/search");
      await page.waitForLoadState("networkidle");

      const cdp = await throttleNetwork(page, tier.network);

      try {
        const combobox = page.getByRole("combobox");
        await expect(combobox).toHaveAttribute("role", "combobox");
        await expect(combobox).toHaveAttribute("aria-autocomplete", "list");
        await expect(combobox).toHaveAttribute("aria-expanded", "false");

        await combobox.focus();
        await expect(page.getByRole("listbox")).toBeVisible();
        await expect(combobox).toHaveAttribute("aria-expanded", "true");

        // Live region exists
        const liveRegion = page.locator("[aria-live='polite']");
        await expect(liveRegion).toBeAttached();
      } finally {
        await removeThrottle(cdp);
      }
    });

    test("keyboard: arrow navigation works under throttle", async ({ page }) => {
      await page.goto("/en/search");
      await page.waitForLoadState("networkidle");

      const cdp = await throttleNetwork(page, tier.network);

      try {
        const combobox = page.getByRole("combobox");
        await combobox.focus();
        await expect(page.getByRole("listbox")).toBeVisible();

        // ArrowDown should activate first option
        await combobox.press("ArrowDown");
        const firstOption = page.getByRole("option").first();
        await expect(firstOption).toHaveAttribute("aria-selected", "true");

        // Escape should close
        await combobox.press("Escape");
        await expect(combobox).toHaveAttribute("aria-expanded", "false");
      } finally {
        await removeThrottle(cdp);
      }
    });
  });
}

// ── Static Asset Size Tests ─────────────────────────────────────

test.describe("Suggestion static assets", () => {
  test("zero-state JSON is under 2KB", async ({ request }) => {
    const res = await request.get("/data/suggestions/en/_zero.json");
    expect(res.status()).toBe(200);
    const body = await res.text();
    const bytes = new TextEncoder().encode(body).length;
    // eslint-disable-next-line no-console
    console.log(`  _zero.json: ${bytes} bytes`);
    expect(bytes).toBeLessThan(2048);
  });

  test("bridge JSON is under 5KB", async ({ request }) => {
    const res = await request.get("/data/suggestions/en/_bridge.json");
    expect(res.status()).toBe(200);
    const body = await res.text();
    const bytes = new TextEncoder().encode(body).length;
    // eslint-disable-next-line no-console
    console.log(`  _bridge.json: ${bytes} bytes`);
    expect(bytes).toBeLessThan(5120);
  });

  test("no prefix file exceeds 15KB", async ({ request }) => {
    // Spot-check the densest prefix files
    const prefixes = ["me", "co", "sp", "di", "se", "re", "in"];
    for (const prefix of prefixes) {
      const res = await request.get(`/data/suggestions/en/${prefix}.json`);
      if (res.status() !== 200) continue;
      const body = await res.text();
      const bytes = new TextEncoder().encode(body).length;
      // eslint-disable-next-line no-console
      console.log(`  ${prefix}.json: ${bytes} bytes`);
      expect(bytes).toBeLessThan(15360);
    }
  });

  test("zero-state has chips and questions", async ({ request }) => {
    const res = await request.get("/data/suggestions/en/_zero.json");
    const data = await res.json();
    expect(data.chips).toBeDefined();
    expect(data.chips.length).toBeGreaterThan(0);
    expect(data.questions).toBeDefined();
    expect(data.questions.length).toBeGreaterThan(0);
  });

  test("bridge data has valid entries", async ({ request }) => {
    const res = await request.get("/data/suggestions/en/_bridge.json");
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    // Each entry should have required fields
    for (const entry of data.slice(0, 5)) {
      expect(entry.stem).toBeDefined();
      expect(entry.expression).toBeDefined();
      expect(entry.yogananda_terms).toBeDefined();
      expect(Array.isArray(entry.yogananda_terms)).toBe(true);
    }
  });

  test("Spanish suggestions exist", async ({ request }) => {
    const res = await request.get("/data/suggestions/es/_zero.json");
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.chips.length).toBeGreaterThan(0);
  });
});

// ── Tier B API Tests ──────────────────────────────────────────────

test.describe("Suggestion API (Tier B)", () => {
  test("returns suggestions with type and weight", async ({ request }) => {
    const res = await request.get("/api/v1/search/suggest?q=med&language=en");
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.data).toBeDefined();
    if (data.data.length > 0) {
      expect(data.data[0]).toHaveProperty("text");
      expect(data.data[0]).toHaveProperty("type");
      expect(data.data[0]).toHaveProperty("weight");
    }
  });

  test("sets Cache-Control header", async ({ request }) => {
    const res = await request.get("/api/v1/search/suggest?q=yoga&language=en");
    expect(res.headers()["cache-control"]).toContain("max-age=300");
  });

  test("returns empty for short prefix", async ({ request }) => {
    const res = await request.get("/api/v1/search/suggest?q=m&language=en");
    const data = await res.json();
    expect(data.data).toEqual([]);
  });
});
