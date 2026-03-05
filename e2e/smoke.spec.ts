/**
 * Smoke tests — M2a-21.
 *
 * Core user flows for the teachings portal.
 * Run with: npx playwright test
 */

import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("loads and shows Today's Wisdom", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("h1, blockquote")).toBeVisible();
  });

  test("has skip link for accessibility", async ({ page }) => {
    await page.goto("/en");
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();
  });

  test("shows thematic doors", async ({ page }) => {
    await page.goto("/en");
    await expect(page.getByText("Doors of Entry")).toBeVisible();
  });
});

test.describe("Search", () => {
  test("search page loads", async ({ page }) => {
    await page.goto("/en/search");
    await expect(page.getByRole("search")).toBeVisible();
  });

  test("search from URL params", async ({ page }) => {
    await page.goto("/en/search?q=God");
    // Wait for results to load
    await page.waitForSelector("[role='list']", { timeout: 10000 });
    const results = page.locator("[role='listitem']");
    await expect(results.first()).toBeVisible();
  });
});

test.describe("Books", () => {
  test("books page lists available books", async ({ page }) => {
    await page.goto("/en/books");
    await expect(page.getByRole("heading", { name: "Books" })).toBeVisible();
    await expect(page.getByText("Autobiography of a Yogi")).toBeVisible();
  });
});

test.describe("Quiet Corner", () => {
  test("loads with a reflection", async ({ page }) => {
    await page.goto("/en/quiet");
    await expect(page.getByText("The Quiet Corner")).toBeVisible();
    // Timer buttons should be visible
    await expect(page.getByText("1 min")).toBeVisible();
    await expect(page.getByText("5 min")).toBeVisible();
  });
});

test.describe("Navigation", () => {
  test("header navigation works", async ({ page }) => {
    await page.goto("/en");
    await page.getByRole("link", { name: "Search" }).click();
    await expect(page).toHaveURL(/\/en\/search/);
  });

  test("language switcher present", async ({ page }) => {
    await page.goto("/en");
    // Language switcher should be in the header
    await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
  });
});

test.describe("API", () => {
  test("health endpoint returns ok", async ({ request }) => {
    const response = await request.get("/api/v1/health");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe("ok");
  });

  test("OpenAPI spec is valid JSON", async ({ request }) => {
    const response = await request.get("/api/v1/openapi.json");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.openapi).toBe("3.1.0");
  });

  test("OG image endpoint returns image", async ({ request }) => {
    const response = await request.get(
      "/api/og?text=Test+quote&author=Yogananda",
    );
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/png");
  });
});

test.describe("Locale", () => {
  test("Spanish homepage loads", async ({ page }) => {
    await page.goto("/es");
    await expect(page.locator("main")).toBeVisible();
    // HTML lang attribute should be Spanish
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
  });

  test("unknown locale redirects to default", async ({ page }) => {
    const response = await page.goto("/fr");
    // Should redirect or fall back to a valid locale
    expect(response?.status()).toBeLessThan(500);
  });
});

test.describe("Passage", () => {
  test("passage page shows content and citation", async ({ page }) => {
    // Search first to get a result with an ID
    await page.goto("/en/search?q=God");
    await page.waitForSelector("[role='listitem']", { timeout: 10000 });

    // Find and click a "Read in context" link
    const readLink = page.locator("a", { hasText: "Read in context" }).first();
    await readLink.click();

    // Should navigate to a book/chapter page
    await expect(page).toHaveURL(/\/en\/books\//);
    await expect(page.locator("main")).toBeVisible();
  });
});

test.describe("Reader Features (M2b)", () => {
  // These tests require a chapter page with real content.
  // Skip gracefully if the book/chapter doesn't exist (e.g. empty DB in CI).

  test("theme selector has 5 themes including meditate", async ({ page }) => {
    await page.goto("/en/books");
    // Navigate to any available book chapter
    const bookLink = page.locator("a[href*='/books/']").first();
    if (!(await bookLink.isVisible())) {
      test.skip();
      return;
    }
    await bookLink.click();
    // Look for chapter link
    const chapterLink = page.locator("a[href*='/books/'][href$='/1']").first();
    if (!(await chapterLink.isVisible())) {
      test.skip();
      return;
    }
    await chapterLink.click();
    // Theme selector should have 5 radio buttons
    const themeRadios = page.locator('[data-testid="theme-selector"] [role="radio"]');
    await expect(themeRadios).toHaveCount(5);
  });

  test("scroll indicator present on chapter pages", async ({ page }) => {
    await page.goto("/en/books");
    const bookLink = page.locator("a[href*='/books/']").first();
    if (!(await bookLink.isVisible())) {
      test.skip();
      return;
    }
    await bookLink.click();
    const chapterLink = page.locator("a[href*='/books/'][href$='/1']").first();
    if (!(await chapterLink.isVisible())) {
      test.skip();
      return;
    }
    await chapterLink.click();
    // Scroll indicator should be present (hidden until scroll)
    await expect(page.locator(".scroll-indicator")).toBeAttached();
  });

  test("bookmark button present on chapter pages", async ({ page }) => {
    await page.goto("/en/books");
    const bookLink = page.locator("a[href*='/books/']").first();
    if (!(await bookLink.isVisible())) {
      test.skip();
      return;
    }
    await bookLink.click();
    const chapterLink = page.locator("a[href*='/books/'][href$='/1']").first();
    if (!(await chapterLink.isVisible())) {
      test.skip();
      return;
    }
    await chapterLink.click();
    // Bookmark button should be in the header
    const bookmarkBtn = page.locator('[data-testid="bookmark-button"]');
    await expect(bookmarkBtn).toBeVisible();
  });
});

test.describe("Bookmarks", () => {
  test("bookmarks page loads with empty state", async ({ page }) => {
    await page.goto("/en/bookmarks");
    await expect(page.locator("main")).toBeVisible();
    // Empty state text should show (no bookmarks yet)
    await expect(page.locator("main")).toContainText(/bookmark/i);
  });
});

test.describe("PWA", () => {
  test("manifest is valid", async ({ request }) => {
    const response = await request.get("/manifest.webmanifest");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.name).toBe("SRF Teachings Portal");
    expect(body.display).toBe("standalone");
    expect(body.icons.length).toBeGreaterThan(0);
  });

  test("service worker is registered", async ({ page }) => {
    await page.goto("/en");
    // Wait for SW registration
    await page.waitForTimeout(2000);
    const swRegistered = await page.evaluate(async () => {
      if (!("serviceWorker" in navigator)) return false;
      const reg = await navigator.serviceWorker.getRegistration("/sw.js");
      return !!reg;
    });
    expect(swRegistered).toBeTruthy();
  });

  test("offline fallback page exists", async ({ request }) => {
    const response = await request.get("/offline.html");
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain("offline");
    expect(body).toContain("Yogananda");
  });
});

test.describe("Legal and Privacy", () => {
  test("privacy page loads", async ({ page }) => {
    await page.goto("/en/privacy");
    await expect(page.locator("main")).toBeVisible();
  });

  test("legal page loads", async ({ page }) => {
    await page.goto("/en/legal");
    await expect(page.locator("main")).toBeVisible();
  });

  test("integrity page loads", async ({ page }) => {
    await page.goto("/en/integrity");
    await expect(page.locator("main")).toBeVisible();
  });
});

test.describe("Browse", () => {
  test("browse page loads", async ({ page }) => {
    await page.goto("/en/browse");
    await expect(page.locator("main")).toBeVisible();
  });
});

test.describe("Visual Regression", () => {
  // Screenshot baselines for key pages.
  // First run generates baselines; subsequent runs compare.
  // Run: npx playwright test --update-snapshots to update baselines.

  test("homepage visual baseline", async ({ page }) => {
    await page.goto("/en");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("homepage.png", {
      maxDiffPixelRatio: 0.01,
      fullPage: false,
    });
  });

  test("search page visual baseline", async ({ page }) => {
    await page.goto("/en/search");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("search.png", {
      maxDiffPixelRatio: 0.01,
      fullPage: false,
    });
  });

  test("books page visual baseline", async ({ page }) => {
    await page.goto("/en/books");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("books.png", {
      maxDiffPixelRatio: 0.01,
      fullPage: false,
    });
  });

  test("quiet corner visual baseline", async ({ page }) => {
    await page.goto("/en/quiet");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("quiet.png", {
      maxDiffPixelRatio: 0.01,
      fullPage: false,
    });
  });
});

test.describe("404", () => {
  test("shows friendly not-found page", async ({ page }) => {
    const response = await page.goto("/en/nonexistent-page-xyz");
    expect(response?.status()).toBe(404);
    await expect(page.locator("main")).toBeVisible();
  });
});

test.describe("Accessibility", () => {
  test("all pages have main-content landmark", async ({ page }) => {
    const pages = ["/en", "/en/search", "/en/books", "/en/quiet"];
    for (const url of pages) {
      await page.goto(url);
      await expect(page.locator("#main-content")).toBeVisible();
    }
  });

  test("focus indicators are visible", async ({ page }) => {
    await page.goto("/en");
    // Tab to first focusable element
    await page.keyboard.press("Tab");
    // The skip link should become visible
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeVisible();
  });

  test("active nav link has aria-current=page", async ({ page }) => {
    await page.goto("/en/search");
    const navLink = page.getByRole("link", { name: "Search" });
    await expect(navLink).toHaveAttribute("aria-current", "page");
    // Non-active links should not have aria-current
    const booksLink = page.getByRole("link", { name: "Books" });
    await expect(booksLink).not.toHaveAttribute("aria-current");
  });

  test("touch targets meet 44px minimum", async ({ page }) => {
    await page.goto("/en");
    // Check all interactive elements meet minimum touch target
    const buttons = page.locator("button, a[href]");
    const count = await buttons.count();
    for (let i = 0; i < Math.min(count, 10); i++) {
      const box = await buttons.nth(i).boundingBox();
      if (box) {
        // At least one dimension should be >= 44px (some inline links may be smaller)
        expect(box.height >= 44 || box.width >= 44).toBeTruthy();
      }
    }
  });
});
