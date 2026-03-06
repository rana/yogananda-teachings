/**
 * i18n configuration — M2a-9 (FTR-058, FTR-058, FTR-135).
 *
 * Supported locales. Adding a new language requires:
 * 1. Add locale code here
 * 2. Create messages/{locale}.json
 * 3. Zero schema migrations, zero API changes (PRI-06)
 */

export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/**
 * Locale display names in their own language.
 * Used in language selector UI.
 */
export const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Español",
};
