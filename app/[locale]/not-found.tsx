/**
 * 404 page — M2a-8.
 *
 * Warm, helpful not-found page with navigation options.
 * "Honest absence as invitation, never a dead end" (PRI-02).
 */

import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SrfLotus } from "@/app/components/SrfLotus";

export default async function NotFound() {
  const t = await getTranslations("errors");
  const nav = await getTranslations("nav");

  return (
    <main id="main-content" className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <SrfLotus size="xl" className="mb-2 w-12 h-12 text-srf-gold" />
      <h1 className="mb-3 font-display text-xl text-srf-navy">
        {t("notFound")}
      </h1>
      <p className="mb-8 max-w-sm text-sm leading-relaxed text-srf-navy/50">
        {t("notFoundGuide")}
      </p>
      <nav className="flex flex-wrap justify-center gap-3" aria-label={t("helpfulLinks")}>
        <Link
          href="/"
          className="min-h-11 inline-flex items-center rounded-lg border border-srf-gold/30 px-4 py-2 text-sm text-srf-navy transition-colors hover:bg-(--theme-surface) hover:border-srf-gold"
        >
          {nav("home")}
        </Link>
        <Link
          href="/search"
          className="min-h-11 inline-flex items-center rounded-lg border border-srf-navy/15 px-4 py-2 text-sm text-srf-navy/70 transition-colors hover:bg-(--theme-surface) hover:text-srf-navy"
        >
          {nav("search")}
        </Link>
        <Link
          href="/books"
          className="min-h-11 inline-flex items-center rounded-lg border border-srf-navy/15 px-4 py-2 text-sm text-srf-navy/70 transition-colors hover:bg-(--theme-surface) hover:text-srf-navy"
        >
          {nav("books")}
        </Link>
      </nav>
    </main>
  );
}
