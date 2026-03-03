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
    it("creates detuned partial pairs (8 oscillators for 4 partials)", () => {
      singingBowl();

      // 4 partials × 2 detuned oscillators each = 8
      expect(oscillators).toHaveLength(8);
    });

    it("uses sine wave oscillators", () => {
      singingBowl();

      for (const osc of oscillators) {
        expect(osc.type).toBe("sine");
      }
    });

    it("sets G3 base frequency (196 Hz) for the fundamental pair", () => {
      singingBowl();

      // First two oscillators are the fundamental pair, detuned ±0.25 Hz
      const fundamentalFreqs = oscillators
        .slice(0, 2)
        .map((o) => o.frequency.value);
      expect(fundamentalFreqs[0]).toBeCloseTo(196 - 0.25, 1);
      expect(fundamentalFreqs[1]).toBeCloseTo(196 + 0.25, 1);
    });

    it("creates gain envelope with bloom (attack → peak → decay)", () => {
      singingBowl();

      // Each oscillator has its own gain node (skip the master gain at index 0)
      // Gain nodes: [master, partial0a, partial0b, partial1a, ...]
      const partialGain = gainNodes[1];
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
      vi.advanceTimersByTime(6000);
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
    it("creates 4 bell partials (primary, octave, grace note, undertone)", () => {
      templeBell();

      // 4 single oscillators (no detuned pairs — clean bell ring)
      expect(oscillators).toHaveLength(4);
    });

    it("uses E5 (659 Hz) as primary frequency", () => {
      templeBell();

      expect(oscillators[0].frequency.value).toBeCloseTo(659.3, 0);
    });

    it("includes grace note at major third above (G#5)", () => {
      templeBell();

      const graceNoteFreq = 659.3 * 1.25;
      const freqs = oscillators.map((o) => o.frequency.value);
      const hasGraceNote = freqs.some((f) => Math.abs(f - graceNoteFreq) < 1);
      expect(hasGraceNote).toBe(true);
    });

    it("includes warm undertone at octave below (E4)", () => {
      templeBell();

      const undertoneFreq = 659.3 / 2;
      const freqs = oscillators.map((o) => o.frequency.value);
      const hasUndertone = freqs.some(
        (f) => Math.abs(f - undertoneFreq) < 1,
      );
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
  });
});
