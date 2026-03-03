/**
 * Vitest setup — M2a-21.
 *
 * Configures @testing-library/jest-dom matchers and jsdom polyfills.
 */

import "@testing-library/jest-dom/vitest";

// jsdom does not implement window.matchMedia — stub it globally.
// Components like lib/sounds.ts (prefers-reduced-motion), ThemeProvider,
// and ChapterBreath all rely on matchMedia.
// Individual test files can override this with vi.stubGlobal or
// Object.defineProperty for specific return values.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
