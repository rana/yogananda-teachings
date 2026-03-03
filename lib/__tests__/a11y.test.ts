/**
 * Accessibility tests — M2a-22 (PRI-07, ADR-003).
 *
 * Uses axe-core to validate HTML patterns against WCAG 2.1 AA.
 * Tests component HTML structures without full Next.js rendering —
 * lightweight validation that accessibility violations block merges.
 *
 * axe-core in CI — accessibility violations block merges (PRI-07).
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import axe from "axe-core";

/**
 * Run axe-core against the current document body.
 * Configured for WCAG 2.1 AA — the project standard (PRI-07).
 */
async function runAxe(html: string) {
  document.body.innerHTML = html;
  const results = await axe.run(document.body, {
    runOnly: {
      type: "tag",
      values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"],
    },
  });
  return results;
}

/** Format axe violations into a readable string for test output. */
function formatViolations(violations: axe.Result[]): string {
  return violations
    .map(
      (v) =>
        `[${v.id}] ${v.help} (${v.impact})\n` +
        v.nodes.map((n) => `  ${n.html}`).join("\n"),
    )
    .join("\n\n");
}

beforeEach(() => {
  // axe-core requires a clean document for each run
  document.body.innerHTML = "";
});

afterEach(() => {
  document.body.innerHTML = "";
});

// ---------------------------------------------------------------------------
// 1. Page structure — landmark regions
// ---------------------------------------------------------------------------

describe("page structure landmarks", () => {
  it("accepts a well-structured page with all landmarks", async () => {
    const html = `
      <header>
        <nav aria-label="Main navigation">
          <a href="/">Home</a>
          <a href="/search">Search</a>
          <a href="/books">Books</a>
        </nav>
      </header>
      <main>
        <h1>Teachings of Paramahansa Yogananda</h1>
        <p>Explore the published words of Yogananda.</p>
      </main>
      <footer>
        <p>&copy; 2026 Self-Realization Fellowship</p>
      </footer>
    `;
    const results = await runAxe(html);
    expect(
      results.violations,
      formatViolations(results.violations),
    ).toHaveLength(0);
  });

  it("detects missing main landmark", async () => {
    const html = `
      <div>
        <h1>Page without main</h1>
        <p>This page has no main landmark.</p>
      </div>
    `;
    const results = await runAxe(html);
    const landmarkViolation = results.violations.find(
      (v) => v.id === "landmark-one-main" || v.id === "region",
    );
    expect(landmarkViolation).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// 2. Heading hierarchy
// ---------------------------------------------------------------------------

describe("heading hierarchy", () => {
  it("accepts sequential heading levels", async () => {
    const html = `
      <main>
        <h1>Autobiography of a Yogi</h1>
        <h2>Chapter 1: My Parents and Early Life</h2>
        <p>Content of chapter 1.</p>
        <h2>Chapter 2: My Mother's Death</h2>
        <p>Content of chapter 2.</p>
      </main>
    `;
    const results = await runAxe(html);
    const headingViolations = results.violations.filter(
      (v) => v.id === "heading-order",
    );
    expect(
      headingViolations,
      formatViolations(headingViolations),
    ).toHaveLength(0);
  });

  it("detects skipped heading levels", async () => {
    const html = `
      <main>
        <h1>Books</h1>
        <h3>Skipped h2 entirely</h3>
        <p>This heading hierarchy skips a level.</p>
      </main>
    `;
    const results = await runAxe(html);
    const headingViolation = results.violations.find(
      (v) => v.id === "heading-order",
    );
    expect(headingViolation).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// 3. Images and alt text
// ---------------------------------------------------------------------------

describe("image accessibility", () => {
  it("accepts images with alt text", async () => {
    const html = `
      <main>
        <h1>Gallery</h1>
        <img src="/yogananda-portrait.jpg" alt="Paramahansa Yogananda in meditation" />
        <img src="/lotus-icon.svg" alt="" role="presentation" />
      </main>
    `;
    const results = await runAxe(html);
    const imgViolations = results.violations.filter(
      (v) => v.id === "image-alt",
    );
    expect(imgViolations, formatViolations(imgViolations)).toHaveLength(0);
  });

  it("detects images missing alt text", async () => {
    const html = `
      <main>
        <h1>Gallery</h1>
        <img src="/yogananda-portrait.jpg" />
      </main>
    `;
    const results = await runAxe(html);
    const imgViolation = results.violations.find((v) => v.id === "image-alt");
    expect(imgViolation).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// 4. Form accessibility — search bar pattern (SearchBar.tsx)
// ---------------------------------------------------------------------------

describe("form accessibility", () => {
  it("accepts a labelled search form", async () => {
    const html = `
      <main>
        <h1>Search the Teachings</h1>
        <form role="search" aria-label="Search the teachings">
          <label for="search-input" class="sr-only">
            peace, courage, healing, love...
          </label>
          <input
            id="search-input"
            type="search"
            placeholder="peace, courage, healing, love..."
            maxlength="500"
          />
          <button type="submit" aria-label="Search">Search</button>
        </form>
      </main>
    `;
    const results = await runAxe(html);
    expect(
      results.violations,
      formatViolations(results.violations),
    ).toHaveLength(0);
  });

  it("detects input without label", async () => {
    const html = `
      <main>
        <h1>Search</h1>
        <form>
          <input type="text" id="unlabelled" />
          <button type="submit">Go</button>
        </form>
      </main>
    `;
    const results = await runAxe(html);
    const labelViolation = results.violations.find(
      (v) => v.id === "label",
    );
    expect(labelViolation).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// 5. Navigation pattern (Header.tsx)
// ---------------------------------------------------------------------------

describe("navigation accessibility", () => {
  it("accepts nav with aria-label and link structure", async () => {
    const html = `
      <header>
        <nav aria-label="Main navigation">
          <a href="/" aria-label="Home">
            <span aria-hidden="true">&#10022;</span>
            <span>Teachings</span>
          </a>
          <a href="/search">Search</a>
          <a href="/books">Books</a>
          <a href="/quiet">Quiet Corner</a>
          <a href="/about">About</a>
        </nav>
      </header>
      <main><h1>Page</h1></main>
    `;
    const results = await runAxe(html);
    expect(
      results.violations,
      formatViolations(results.violations),
    ).toHaveLength(0);
  });

  it("detects links without discernible text", async () => {
    const html = `
      <main>
        <h1>Navigation</h1>
        <nav aria-label="Main">
          <a href="/"><span aria-hidden="true">&#10022;</span></a>
        </nav>
      </main>
    `;
    const results = await runAxe(html);
    const linkViolation = results.violations.find(
      (v) => v.id === "link-name",
    );
    expect(linkViolation).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// 6. Crisis interstitial — alert role (CrisisInterstitial.tsx)
// ---------------------------------------------------------------------------

describe("crisis interstitial accessibility", () => {
  it("accepts a properly structured alert", async () => {
    const html = `
      <main>
        <h1>Search Results</h1>
        <div role="alert">
          <p>If you or someone you know is struggling, help is available.</p>
          <p><strong>Call or text 988</strong> — 988 Suicide & Crisis Lifeline</p>
          <p>
            Available 24/7 &middot;
            <a href="https://988lifeline.org" target="_blank" rel="noopener noreferrer">
              https://988lifeline.org
            </a>
          </p>
        </div>
      </main>
    `;
    const results = await runAxe(html);
    expect(
      results.violations,
      formatViolations(results.violations),
    ).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 7. Footer pattern (Footer.tsx)
// ---------------------------------------------------------------------------

describe("footer accessibility", () => {
  it("accepts footer with external links using target=_blank", async () => {
    const html = `
      <main><h1>Page</h1></main>
      <footer>
        <nav aria-label="Footer navigation">
          <a href="/">Home</a>
          <a href="/books">Books</a>
          <a href="/privacy">Privacy</a>
        </nav>
        <nav aria-label="SRF ecosystem">
          <a href="https://yogananda.org" target="_blank" rel="noopener noreferrer">
            yogananda.org
          </a>
          <a href="https://bookstore.yogananda-srf.org" target="_blank" rel="noopener noreferrer">
            Bookstore
          </a>
        </nav>
        <p>&copy; 2026 Self-Realization Fellowship</p>
      </footer>
    `;
    const results = await runAxe(html);
    expect(
      results.violations,
      formatViolations(results.violations),
    ).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 8. ARIA attributes
// ---------------------------------------------------------------------------

describe("ARIA attributes", () => {
  it("detects invalid ARIA attributes", async () => {
    const html = `
      <main>
        <h1>Page</h1>
        <div aria-labelz="broken">This has a typo in ARIA attribute.</div>
      </main>
    `;
    const results = await runAxe(html);
    const ariaViolation = results.violations.find(
      (v) => v.id === "aria-valid-attr",
    );
    expect(ariaViolation).toBeDefined();
  });

  it("accepts valid ARIA attributes", async () => {
    const html = `
      <main>
        <h1>Page</h1>
        <div role="region" aria-label="Reading area">
          <p>Content here.</p>
        </div>
      </main>
    `;
    const results = await runAxe(html);
    expect(
      results.violations,
      formatViolations(results.violations),
    ).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 9. Color contrast (basic)
// ---------------------------------------------------------------------------

describe("color contrast", () => {
  it("detects insufficient color contrast", async () => {
    const html = `
      <main>
        <h1>Page</h1>
        <p style="color: #cccccc; background-color: #ffffff;">
          Low contrast text.
        </p>
      </main>
    `;
    const results = await runAxe(html);
    const contrastViolation = results.violations.find(
      (v) => v.id === "color-contrast",
    );
    // jsdom does not compute styles the same way browsers do, so
    // color-contrast may not fire. If it does, that is correct.
    // We verify it either fires or the check is incomplete.
    const contrastIncomplete = results.incomplete.find(
      (v) => v.id === "color-contrast",
    );
    expect(
      contrastViolation || contrastIncomplete,
      "Expected color-contrast to be flagged as violation or incomplete",
    ).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// 10. Document language
// ---------------------------------------------------------------------------

describe("document language", () => {
  /**
   * Run axe against the full document (not just body) to test
   * html-has-lang which targets the <html> element.
   */
  async function runAxeFullDocument() {
    return axe.run(document, {
      runOnly: {
        type: "rule",
        values: ["html-has-lang"],
      },
    });
  }

  it("detects missing lang attribute on html element", async () => {
    document.documentElement.removeAttribute("lang");
    document.body.innerHTML = `
      <main>
        <h1>Page without lang</h1>
        <p>This document has no language set.</p>
      </main>
    `;
    const results = await runAxeFullDocument();
    const langViolation = results.violations.find(
      (v) => v.id === "html-has-lang",
    );
    expect(langViolation).toBeDefined();
  });

  it("accepts html element with valid lang attribute", async () => {
    document.documentElement.setAttribute("lang", "en");
    document.body.innerHTML = `
      <main>
        <h1>Page with lang</h1>
        <p>This document declares English.</p>
      </main>
    `;
    const results = await runAxeFullDocument();
    const langViolation = results.violations.find(
      (v) => v.id === "html-has-lang",
    );
    expect(langViolation).toBeUndefined();

    // Cleanup
    document.documentElement.removeAttribute("lang");
  });
});
