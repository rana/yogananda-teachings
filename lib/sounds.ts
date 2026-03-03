/**
 * Meditative sound synthesis — singing bowls and temple bells.
 *
 * Web Audio API synthesis modeled on Himalayan singing bowl and
 * temple bell (ghanta) acoustics. Produces warm, nuanced tones
 * with natural shimmer from detuned partial pairs.
 *
 * Design goals:
 * - Soothing, not startling — sounds that create space
 * - Alive (shimmer from beating), not electronic (static sine)
 * - Hopeful — consonant intervals, natural bloom and decay
 * - Worthy of presenting alongside Yogananda's words (PRI-03)
 *
 * Volume capped at 15% per M2a-14 (ADR-074).
 * Progressive enhancement: silent if Web Audio unavailable (PRI-05).
 * Respects prefers-reduced-motion (PRI-07).
 */

// ── Singing bowl ──────────────────────────────────────────────────

/**
 * Singing bowl strike — warm, grounding, with natural shimmer.
 * Used to open a meditation timer.
 *
 * Modeled on measured Himalayan singing bowl partial ratios.
 * Each partial is a slightly detuned pair that beats against
 * its partner, producing the characteristic slow amplitude
 * modulation — the "shimmer" that makes bowls sound alive.
 *
 * G3 (196 Hz) fundamental: warm and grounding without muddiness.
 * Higher partials decay faster than the fundamental, creating
 * a natural thinning — brightness at the strike, warmth in the tail.
 */
export function singingBowl(volume = 0.15): void {
  if (prefersQuiet()) return;

  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    const duration = 8; // Room for fundamental (τ=2.2s) to decay naturally

    const master = ctx.createGain();
    master.gain.value = volume;

    // Fade curtain — smooth ending regardless of partial decay state.
    // Holds at full volume, then fades over the final 1.5s so the
    // ringing gradually subsides rather than clipping at the boundary.
    const curtain = ctx.createGain();
    curtain.gain.setValueAtTime(1, now);
    curtain.gain.setValueAtTime(1, now + duration - 1.5);
    curtain.gain.linearRampToValueAtTime(0, now + duration);
    curtain.connect(ctx.destination);
    master.connect(curtain);

    // Himalayan bowl partials — inharmonic ratios from measured specimens.
    // [freq ratio, amplitude, decay τ (s), beat rate (Hz)]
    // Beat rate = frequency difference between the detuned pair.
    const partials: [number, number, number, number][] = [
      [1, 0.50, 2.2, 0.5], // Fundamental — deep, slow shimmer
      [2.71, 0.25, 1.6, 1.0], // 1st overtone — warm
      [4.78, 0.12, 1.0, 1.5], // 2nd overtone — gentle brightness
      [5.35, 0.06, 0.7, 2.0], // 3rd overtone — air
    ];

    const baseFreq = 196; // G3

    for (const [ratio, amp, decay, beat] of partials) {
      const freq = baseFreq * ratio;

      // Detuned pair — each partial splits into two oscillators
      // offset slightly in frequency. When they drift in and out
      // of phase, amplitude modulates at the beat rate.
      for (const offset of [-beat / 2, beat / 2]) {
        const osc = ctx.createOscillator();
        const env = ctx.createGain();

        osc.type = "sine";
        osc.frequency.value = freq + offset;

        // Envelope: silence → strike transient → bloom → long decay
        env.gain.setValueAtTime(0.001, now);
        env.gain.linearRampToValueAtTime(amp * 0.7, now + 0.015); // strike
        env.gain.linearRampToValueAtTime(amp, now + 0.12); // bloom
        env.gain.setTargetAtTime(0, now + 0.15, decay); // natural decay

        osc.connect(env);
        env.connect(master);
        osc.start(now);
        osc.stop(now + duration);
      }
    }

    scheduleCleanup(ctx, duration);
  } catch {
    // Web Audio not available — degrade silently
  }
}

// ── Temple bell ────────────────────────────────────────────────────

/**
 * Temple bell (ghanta) — clear, hopeful, with gentle resonance.
 * Used to close a meditation timer.
 *
 * Warmer and more consonant than a Western church bell.
 * The "hope" comes from three acoustic choices:
 * 1. A grace note at the major third above, entering slightly
 *    after the primary strike — an ascending interval that lifts.
 * 2. A soft undertone an octave below that grounds the brightness.
 * 3. Clean harmonic overtones (not inharmonic like the bowl) —
 *    the clarity reads as resolution after the bowl's complexity.
 *
 * E5 (659 Hz) primary: bright enough to signal, not harsh.
 */
export function templeBell(volume = 0.15): void {
  if (prefersQuiet()) return;

  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    const duration = 6; // Room for undertone (τ=2.0s) to decay naturally

    const master = ctx.createGain();
    master.gain.value = volume;

    // Fade curtain — smooth ending so the bell ring subsides naturally
    const curtain = ctx.createGain();
    curtain.gain.setValueAtTime(1, now);
    curtain.gain.setValueAtTime(1, now + duration - 1.0);
    curtain.gain.linearRampToValueAtTime(0, now + duration);
    curtain.connect(ctx.destination);
    master.connect(curtain);

    const primary = 659.3; // E5

    // Primary bell strike — clear and present
    bellPartial(ctx, master, now, primary, 0.40, 1.8, duration);

    // Octave shimmer — soft sparkle above
    bellPartial(ctx, master, now, primary * 2, 0.06, 0.8, duration);

    // Grace note — major third above (G#5), enters a breath later.
    // This ascending interval is the heart of the hopeful quality.
    bellPartial(ctx, master, now + 0.06, primary * 1.25, 0.15, 1.3, duration);

    // Warm undertone — octave below (E4), very soft, grounds the sound
    bellPartial(ctx, master, now, primary / 2, 0.10, 2.0, duration);

    scheduleCleanup(ctx, duration);
  } catch {
    // Web Audio not available — degrade silently
  }
}

// ── Internals ─────────────────────────────────────────────────────

/** Single bell partial with crisp-strike → ring → decay envelope. */
function bellPartial(
  ctx: AudioContext,
  destination: AudioNode,
  startTime: number,
  frequency: number,
  amplitude: number,
  decayTau: number,
  duration: number,
): void {
  const osc = ctx.createOscillator();
  const env = ctx.createGain();

  osc.type = "sine";
  osc.frequency.value = frequency;

  // Bell envelope: instant strike → ring → exponential decay
  env.gain.setValueAtTime(0.001, startTime);
  env.gain.linearRampToValueAtTime(amplitude, startTime + 0.008); // crisp strike
  env.gain.setTargetAtTime(0, startTime + 0.01, decayTau); // ring and fade

  osc.connect(env);
  env.connect(destination);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

function prefersQuiet(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function scheduleCleanup(ctx: AudioContext, duration: number): void {
  setTimeout(
    () => {
      try {
        ctx.close();
      } catch {
        /* already closed */
      }
    },
    (duration + 0.5) * 1000,
  );
}
