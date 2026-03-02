// @vitest-environment jsdom

/**
 * ServiceWorkerRegistration tests — M1c-14.
 *
 * Verifies: SW registration on mount, renders nothing, silent fail.
 */

import { render } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── Import ───────────────────────────────────────────────────────

import { ServiceWorkerRegistration } from "../ServiceWorkerRegistration";

// ── Tests ─────────────────────────────────────────────────────────

describe("ServiceWorkerRegistration", () => {
  const mockRegister = vi.fn(() => Promise.resolve({} as ServiceWorkerRegistration));

  beforeEach(() => {
    mockRegister.mockClear();
    Object.defineProperty(navigator, "serviceWorker", {
      value: { register: mockRegister },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders nothing", () => {
    const { container } = render(<ServiceWorkerRegistration />);
    expect(container.innerHTML).toBe("");
  });

  it("registers sw.js on mount", () => {
    render(<ServiceWorkerRegistration />);
    expect(mockRegister).toHaveBeenCalledWith("/sw.js");
  });

  it("does not throw when serviceWorker is unavailable", () => {
    // Remove serviceWorker from navigator to simulate unsupported browser
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (navigator as any).serviceWorker;

    expect(() => {
      render(<ServiceWorkerRegistration />);
    }).not.toThrow();
  });
});
