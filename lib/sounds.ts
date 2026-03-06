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
 * Volume capped at 15% per M2a-14 (FTR-054).
 * Progressive enhancement: silent if Web Audio unavailable (PRI-05).
 * Respects prefers-reduced-motion (PRI-07).
 *
 * Solfeggio tuning: temple bell rooted at 528 Hz ("Love Frequency"),
 * singing bowl at 136.1 Hz (OM frequency / "cosmic keynote").
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
 * 136.1 Hz fundamental (C#3): the "OM frequency" — the cosmic
 * keynote used in Indian classical tuning (sa). Deep, grounding,
 * resonant without muddiness. Lower than the previous G3 (196 Hz)
 * for a more meditative, oceanic quality.
 *
 * Higher partials decay faster than the fundamental, creating
 * a natural thinning — brightness at the strike, warmth in the tail.
 */
export function singingBowl(volume = 0.15): void {
  if (prefersQuiet()) return;

  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    const duration = 14; // Long, oceanic sustain

    const master = ctx.createGain();
    master.gain.value = volume;

    // Fade curtain — smooth ending regardless of partial decay state.
    // Holds at full volume, then fades over the final 2.5s so the
    // ringing gradually subsides rather than clipping at the boundary.
    const curtain = ctx.createGain();
    curtain.gain.setValueAtTime(1, now);
    curtain.gain.setValueAtTime(1, now + duration - 2.5);
    curtain.gain.linearRampToValueAtTime(0, now + duration);
    curtain.connect(ctx.destination);
    master.connect(curtain);

    // Himalayan bowl partials — inharmonic ratios from measured specimens.
    // [freq ratio, amplitude, decay τ (s), beat rate (Hz)]
    // Beat rate = frequency difference between the detuned pair.
    const partials: [number, number, number, number][] = [
      [1, 0.40, 4.5, 0.3], // Fundamental — deep, very slow shimmer
      [2.71, 0.18, 3.0, 0.7], // 1st overtone — warm body
      [3.56, 0.08, 2.2, 1.0], // 2nd overtone — midrange presence
      [4.78, 0.10, 1.8, 1.2], // 3rd overtone — gentle brightness
      [5.35, 0.05, 1.2, 1.5], // 4th overtone — air
      [7.12, 0.03, 0.8, 2.0], // 5th overtone — high shimmer
    ];

    const baseFreq = 136.1; // OM frequency (C#3)

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
 * Temple bell (ghanta) — luminous, resonant, with rich harmonics.
 * Used to close a meditation timer.
 *
 * Rooted at 528 Hz — the Solfeggio "Love Frequency" (Miracle Tone).
 * Associated with DNA repair, cortisol reduction, and deep inner
 * peace. The choice is both acoustically warm and spiritually aligned
 * with the portal's contemplative purpose.
 *
 * Rich harmonic structure with 8 partials (detuned pairs for shimmer)
 * modeled on real temple bell acoustics:
 * - Inharmonic partial ratios characteristic of bell metal
 * - Each partial is a detuned pair for natural beating/shimmer
 * - Grace note at 639 Hz (Solfeggio "Connection" frequency) enters
 *   slightly after the primary strike — an ascending lift
 * - Deep undertone at 264 Hz (octave below) grounds the brightness
 * - Duration: 12s for full, unhurried ring-out
 *
 * Previous version used pure sine waves at exact harmonic ratios
 * with no shimmer. This version brings the bell alive with the same
 * detuned-pair technique that makes the singing bowl organic.
 */
export function templeBell(volume = 0.15): void {
  if (prefersQuiet()) return;

  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    const duration = 12; // Full, unhurried ring-out

    const master = ctx.createGain();
    master.gain.value = volume;

    // Fade curtain — smooth ending so the bell ring subsides naturally.
    // Longer fade (2s) prevents any clipping at the tail boundary.
    const curtain = ctx.createGain();
    curtain.gain.setValueAtTime(1, now);
    curtain.gain.setValueAtTime(1, now + duration - 2.0);
    curtain.gain.linearRampToValueAtTime(0, now + duration);
    curtain.connect(ctx.destination);
    master.connect(curtain);

    // Bell partials — detuned pairs for natural shimmer.
    // [frequency (Hz), amplitude, decay τ (s), beat rate (Hz), delay (s)]
    // Based on temple bell (ghanta) measured spectra with Solfeggio tuning.
    const bellPartials: [number, number, number, number, number][] = [
      // Deep undertone — octave below, grounds the brightness
      [264, 0.10, 4.0, 0.2, 0],
      // Fundamental — 528 Hz "Love Frequency", warm and present
      [528, 0.30, 3.5, 0.4, 0],
      // Grace note — 639 Hz Solfeggio "Connection", enters a breath later
      // The ascending interval from 528→639 is the heart of the hopeful quality
      [639, 0.12, 2.5, 0.5, 0.06],
      // First overtone — warm body (inharmonic bell ratio ~2.09)
      [1103, 0.08, 2.0, 0.8, 0],
      // Second overtone — bright presence (ratio ~2.56)
      [1352, 0.05, 1.5, 1.0, 0],
      // Third overtone — shimmer (ratio ~3.0)
      [1584, 0.03, 1.0, 1.2, 0.01],
      // High sparkle — very soft, adds air
      [2112, 0.015, 0.7, 1.5, 0],
      // Highest partial — ghost of the strike
      [2640, 0.008, 0.4, 2.0, 0],
    ];

    for (const [freq, amp, decay, beat, delay] of bellPartials) {
      const startTime = now + delay;

      // Each partial is a detuned pair for natural beating/shimmer
      for (const offset of [-beat / 2, beat / 2]) {
        const osc = ctx.createOscillator();
        const env = ctx.createGain();

        osc.type = "sine";
        osc.frequency.value = freq + offset;

        // Bell envelope: silence → crisp strike → ring → exponential decay
        env.gain.setValueAtTime(0.001, startTime);
        env.gain.linearRampToValueAtTime(amp, startTime + 0.005); // crisp strike
        env.gain.linearRampToValueAtTime(amp * 0.85, startTime + 0.04); // slight dip after strike
        env.gain.setTargetAtTime(0, startTime + 0.05, decay); // ring and fade

        osc.connect(env);
        env.connect(master);
        osc.start(startTime);
        osc.stop(startTime + duration);
      }
    }

    scheduleCleanup(ctx, duration);
  } catch {
    // Web Audio not available — degrade silently
  }
}

// ── Internals ─────────────────────────────────────────────────────

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
