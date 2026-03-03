/**
 * Rotating search placeholders — human-centered prompts that model
 * the kinds of queries seekers actually carry.
 *
 * Each prompt models a different entry point:
 *   - Single words (lowest barrier): peace, love
 *   - Concepts (two words): finding courage, letting go
 *   - Questions (natural language): how to forgive, why do we suffer
 *   - Deep themes (dark is welcome): loneliness, life after death
 *
 * The sequence has an emotional arc: warmth → courage → darkness →
 * healing → existential → love → mystery → release.
 *
 * Spanish translations are natural equivalents, not literal translations.
 */
export const SEARCH_PLACEHOLDERS: Record<string, readonly string[]> = {
  en: [
    "peace",
    "finding courage",
    "loneliness",
    "how to forgive",
    "why do we suffer",
    "love",
    "life after death",
    "letting go",
  ],
  es: [
    "paz",
    "encontrar valor",
    "soledad",
    "cómo perdonar",
    "por qué sufrimos",
    "amor",
    "la vida después de la muerte",
    "soltar",
  ],
} as const;
