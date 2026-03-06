/**
 * next-intl routing configuration — M2a-17 (FTR-058).
 *
 * Hybrid language routing:
 * - Locale path prefix on frontend pages: /{locale}/books/...
 * - Default English omits prefix: /books/... (not /en/books/...)
 * - API routes use language query parameter: /api/v1/search?language=hi
 */

import { defineRouting } from "next-intl/routing";
import { locales, defaultLocale } from "./config";

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Default locale doesn't appear in URL: /books not /en/books
  localePrefix: "as-needed",
});
