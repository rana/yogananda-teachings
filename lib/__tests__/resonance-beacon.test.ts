/**
 * Resonance beacon client tests — M3a-7 (ADR-052).
 *
 * Tests the fire-and-forget beacon utility that UI components use
 * to report anonymous resonance events.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { sendResonance } from "../resonance-beacon";

describe("sendResonance", () => {
  const originalNavigator = global.navigator;
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    // Restore globals
    Object.defineProperty(global, "navigator", {
      value: originalNavigator,
      writable: true,
    });
    global.fetch = originalFetch;
  });

  it("uses sendBeacon when available", () => {
    const mockSendBeacon = vi.fn().mockReturnValue(true);
    Object.defineProperty(global, "navigator", {
      value: { sendBeacon: mockSendBeacon },
      writable: true,
    });

    sendResonance("chunk-abc", "share");

    expect(mockSendBeacon).toHaveBeenCalledTimes(1);
    const [url, blob] = mockSendBeacon.mock.calls[0];
    expect(url).toBe("/api/v1/passages/chunk-abc/resonance");
    expect(blob).toBeInstanceOf(Blob);
  });

  it("falls back to fetch when sendBeacon is unavailable", () => {
    Object.defineProperty(global, "navigator", {
      value: {},
      writable: true,
    });
    const mockFetch = vi.fn().mockResolvedValue(new Response());
    global.fetch = mockFetch;

    sendResonance("chunk-xyz", "dwell");

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe("/api/v1/passages/chunk-xyz/resonance");
    expect(opts.method).toBe("POST");
    expect(opts.keepalive).toBe(true);
    expect(JSON.parse(opts.body)).toEqual({ type: "dwell" });
  });

  it("does nothing for empty chunkId", () => {
    const mockSendBeacon = vi.fn();
    Object.defineProperty(global, "navigator", {
      value: { sendBeacon: mockSendBeacon },
      writable: true,
    });
    const mockFetch = vi.fn();
    global.fetch = mockFetch;

    sendResonance("", "share");

    expect(mockSendBeacon).not.toHaveBeenCalled();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("encodes chunkId in URL", () => {
    const mockSendBeacon = vi.fn().mockReturnValue(true);
    Object.defineProperty(global, "navigator", {
      value: { sendBeacon: mockSendBeacon },
      writable: true,
    });

    sendResonance("chunk/with spaces", "traverse");

    const url = mockSendBeacon.mock.calls[0][0];
    expect(url).toBe("/api/v1/passages/chunk%2Fwith%20spaces/resonance");
  });

  it("silently handles fetch errors", () => {
    Object.defineProperty(global, "navigator", {
      value: {},
      writable: true,
    });
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    // Should not throw
    expect(() => sendResonance("chunk-err", "skip")).not.toThrow();
  });
});
