// @vitest-environment jsdom

/**
 * Meditative sound synthesis tests — lib/sounds.ts.
 *
 * Verifies singing bowl and temple bell create proper Web Audio
 * graph structures, respect prefers-reduced-motion, and degrade
 * silently when Web Audio is unavailable.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── AudioContext mock ─────────────────────────────────────────────

interface MockOscillator {
  type: string;
  frequency: { value: number };
  connect: ReturnType<typeof vi.fn>;
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
}

interface MockGainNode {
  gain: {
    value: number;
    setValueAtTime: ReturnType<typeof vi.fn>;
    linearRampToValueAtTime: ReturnType<typeof vi.fn>;
    setTargetAtTime: ReturnType<typeof vi.fn>;
  };
  connect: ReturnType<typeof vi.fn>;
}

let oscillators: MockOscillator[];
let gainNodes: MockGainNode[];
let mockClose: ReturnType<typeof vi.fn>;

function installAudioMock() {
  oscillators = [];
  gainNodes = [];
  mockClose = vi.fn();

  // Must use a class (not arrow function) so `new AudioContext()` works
  vi.stubGlobal(
    "AudioContext",
    class MockAudioContext {
      destination = {};
      currentTime = 0;
      close = mockClose;
      createOscillator() {
        const osc: MockOscillator = {
          type: "sine",
          frequency: { value: 0 },
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
        };
        oscillators.push(osc);
        return osc;
      }
      createGain() {
        const gain: MockGainNode = {
          gain: {
            value: 0,
            setValueAtTime: vi.fn(),
            linearRampToValueAtTime: vi.fn(),
            setTargetAtTime: vi.fn(),
          },
          connect: vi.fn(),
        };
        gainNodes.push(gain);
        return gain;
      }
    },
  );
}

// ── Import ────────────────────────────────────────────────────────

import { singingBowl, templeBell } from "../sounds";

// ── Tests ─────────────────────────────────────────────────────────

describe("sounds", () => {
  let matchMediaMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    installAudioMock();
    matchMediaMock = vi.fn().mockReturnValue({ matches: false });
    vi.stubGlobal("matchMedia", matchMediaMock);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("singingBowl", () => {
    it("creates detuned partial pairs (12 oscillators for 6 partials)", () => {
      singingBowl();

      // 6 partials × 2 detuned oscillators each = 12
      expect(oscillators).toHaveLength(12);
    });

    it("uses sine wave oscillators", () => {
      singingBowl();

      for (const osc of oscillators) {
        expect(osc.type).toBe("sine");
      }
    });

    it("sets OM frequency base (136.1 Hz) for the fundamental pair", () => {
      singingBowl();

      // First two oscillators are the fundamental pair, detuned ±0.15 Hz
      const fundamentalFreqs = oscillators
        .slice(0, 2)
        .map((o) => o.frequency.value);
      expect(fundamentalFreqs[0]).toBeCloseTo(136.1 - 0.15, 1);
      expect(fundamentalFreqs[1]).toBeCloseTo(136.1 + 0.15, 1);
    });

    it("creates gain envelope with bloom (attack → peak → decay)", () => {
      singingBowl();

      // Each oscillator has its own gain node (skip master and curtain)
      // Gain nodes: [master, curtain, partial0a, partial0b, partial1a, ...]
      const partialGain = gainNodes[2];
      expect(partialGain.gain.setValueAtTime).toHaveBeenCalled();
      expect(partialGain.gain.linearRampToValueAtTime).toHaveBeenCalledTimes(2);
      expect(partialGain.gain.setTargetAtTime).toHaveBeenCalled();
    });

    it("respects default volume of 0.15", () => {
      singingBowl();

      // Master gain node is the first one created
      expect(gainNodes[0].gain.value).toBe(0.15);
    });

    it("accepts custom volume", () => {
      singingBowl(0.1);

      expect(gainNodes[0].gain.value).toBe(0.1);
    });

    it("is silent when prefers-reduced-motion is set", () => {
      matchMediaMock.mockReturnValue({ matches: true });
      singingBowl();

      expect(oscillators).toHaveLength(0);
    });

    it("schedules AudioContext cleanup", () => {
      singingBowl();

      expect(mockClose).not.toHaveBeenCalled();
      vi.advanceTimersByTime(14500); // 14s duration + 0.5s buffer
      expect(mockClose).toHaveBeenCalled();
    });

    it("degrades silently when AudioContext is unavailable", () => {
      vi.stubGlobal(
        "AudioContext",
        class {
          constructor() {
            throw new Error("not supported");
          }
        },
      );

      expect(() => singingBowl()).not.toThrow();
    });
  });

  describe("templeBell", () => {
    it("creates detuned partial pairs (16 oscillators for 8 partials)", () => {
      templeBell();

      // 8 partials × 2 detuned oscillators each = 16
      expect(oscillators).toHaveLength(16);
    });

    it("uses 528 Hz Solfeggio as fundamental frequency", () => {
      templeBell();

      // The undertone (264 Hz) pair is first, then the 528 Hz fundamental pair
      // Fundamental pair: oscillators at indices 2 and 3, detuned ±0.2 Hz
      const fundamentalFreqs = oscillators
        .slice(2, 4)
        .map((o) => o.frequency.value);
      expect(fundamentalFreqs[0]).toBeCloseTo(528 - 0.2, 0);
      expect(fundamentalFreqs[1]).toBeCloseTo(528 + 0.2, 0);
    });

    it("includes grace note at 639 Hz (Solfeggio Connection frequency)", () => {
      templeBell();

      const freqs = oscillators.map((o) => o.frequency.value);
      // 639 Hz pair, detuned ±0.25
      const hasGraceNote = freqs.some((f) => Math.abs(f - 639) < 1);
      expect(hasGraceNote).toBe(true);
    });

    it("includes warm undertone at octave below (264 Hz)", () => {
      templeBell();

      const freqs = oscillators.map((o) => o.frequency.value);
      const hasUndertone = freqs.some((f) => Math.abs(f - 264) < 1);
      expect(hasUndertone).toBe(true);
    });

    it("is silent when prefers-reduced-motion is set", () => {
      matchMediaMock.mockReturnValue({ matches: true });
      templeBell();

      expect(oscillators).toHaveLength(0);
    });

    it("respects default volume of 0.15", () => {
      templeBell();

      expect(gainNodes[0].gain.value).toBe(0.15);
    });

    it("schedules AudioContext cleanup", () => {
      templeBell();

      expect(mockClose).not.toHaveBeenCalled();
      vi.advanceTimersByTime(12500); // 12s duration + 0.5s buffer
      expect(mockClose).toHaveBeenCalled();
    });
  });
});
