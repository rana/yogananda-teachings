/**
 * Personal Library — a quiet map of the seeker's journey.
 *
 * Aggregates reading progress, bookmarks, and last-read positions
 * into a single view. Books appear automatically when the seeker
 * visits a chapter — no explicit "add" action needed.
 *
 * No time tracking. No streaks. No minutes spent.
 * Just where you've been and a door back in.
 *
 * DELTA-compliant: all data stays on-device (PRI-09).
 * Calm technology: remembers without measuring (PRI-08).
 */

import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { LibraryView } from "./LibraryView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("library");
  const prefix = locale === "en" ? "" : `/${locale}`;
  return {
    title: t("heading"),
    alternates: {
      canonical: `${prefix}/library`,
      languages: { en: "/library", es: "/es/library" },
    },
  };
}

export default async function LibraryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("library");

  return (
    <main id="main-content" className="min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        <header className="mb-8">
          <h1 className="font-display text-2xl text-srf-navy md:text-3xl">
            {t("heading")}
          </h1>
          <p className="mt-2 text-sm text-srf-navy/50">
            {t("subtitle")}
          </p>
        </header>

        <LibraryView locale={locale} />
      </div>
    </main>
  );
}
