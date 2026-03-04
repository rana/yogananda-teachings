/**
 * Personal Library — a quiet map of the seeker's journey.
 *
 * Aggregates reading progress, bookmarks, and last-read positions.
 * Books appear automatically when the seeker visits a chapter.
 * No time tracking. No streaks. Just where you've been.
 *
 * DELTA-compliant: all data stays on-device.
 * Server Component wraps client island.
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
    <div className="center" style={{ paddingBlock: "var(--space-spacious)" }}>
      <header style={{ marginBlockEnd: "var(--space-generous)" }}>
        <h1 className="page-title">{t("heading")}</h1>
        <p className="page-subtitle">{t("subtitle")}</p>
      </header>

      <LibraryView locale={locale} />
    </div>
  );
}
