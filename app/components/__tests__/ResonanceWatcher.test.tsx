/**
 * Tests for ResonanceWatcher component — event-driven resonance tracking.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { ResonanceWatcher } from "../ResonanceWatcher";

const mockSendResonance = vi.fn();
vi.mock("@/lib/resonance-beacon", () => ({
  sendResonance: (...args: unknown[]) => mockSendResonance(...args),
}));

afterEach(() => {
  mockSendResonance.mockClear();
});

const chunkIds = ["chunk-a", "chunk-b", "chunk-c"];

describe("ResonanceWatcher", () => {
  it("renders nothing (no UI)", () => {
    const { container } = render(
      <ResonanceWatcher paragraphChunkIds={chunkIds} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("sends dwell resonance when srf:dwell-resonance fires", () => {
    render(<ResonanceWatcher paragraphChunkIds={chunkIds} />);

    window.dispatchEvent(
      new CustomEvent("srf:dwell-resonance", { detail: { index: 1 } }),
    );

    expect(mockSendResonance).toHaveBeenCalledWith("chunk-b", "dwell");
  });

  it("ignores events with out-of-range index", () => {
    render(<ResonanceWatcher paragraphChunkIds={chunkIds} />);

    window.dispatchEvent(
      new CustomEvent("srf:dwell-resonance", { detail: { index: 99 } }),
    );

    expect(mockSendResonance).not.toHaveBeenCalled();
  });

  it("cleans up listener on unmount", () => {
    const { unmount } = render(
      <ResonanceWatcher paragraphChunkIds={chunkIds} />,
    );
    unmount();

    window.dispatchEvent(
      new CustomEvent("srf:dwell-resonance", { detail: { index: 0 } }),
    );

    expect(mockSendResonance).not.toHaveBeenCalled();
  });
});
