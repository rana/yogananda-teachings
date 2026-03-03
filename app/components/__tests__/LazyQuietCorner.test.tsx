/**
 * Tests for LazyQuietCorner component — dynamic import wrapper.
 */

import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { LazyQuietCorner } from "../LazyQuietCorner";

// Mock next/dynamic to render loading state synchronously
vi.mock("next/dynamic", () => ({
  default: (
    _loader: () => Promise<unknown>,
    opts?: { loading?: () => React.ReactElement },
  ) => {
    // Return the loading component for synchronous testing
    return function MockDynamic() {
      return opts?.loading?.() ?? null;
    };
  },
}));

describe("LazyQuietCorner", () => {
  it("renders loading skeleton while component loads", () => {
    const { container } = render(<LazyQuietCorner passage={null} />);
    // The loading skeleton has animate-pulse elements
    const pulseElements = container.querySelectorAll(".animate-pulse");
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it("renders main content landmark in loading state", () => {
    const { container } = render(<LazyQuietCorner passage={null} />);
    const main = container.querySelector("main#main-content");
    expect(main).toBeTruthy();
  });
});
