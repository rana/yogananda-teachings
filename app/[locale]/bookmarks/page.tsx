/**
 * Bookmarks page — M2b-3 (ADR-066).
 *
 * Lists all saved bookmarks grouped by book.
 * localStorage-only, no server interaction (PRI-09).
 * Server component wraps a client component for interactivity.
 */

import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { BookmarksList } from "./BookmarksList";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("bookmarks");
  const prefix = locale === "en" ? "" : `/${locale}`;
  return {
    title: t("heading"),
    alternates: {
      canonical: `${prefix}/bookmarks`,
      languages: { en: "/bookmarks", es: "/es/bookmarks" },
    },
  };
}

export default async function BookmarksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("bookmarks");

  return (
    <main id="main-content" className="min-h-screen bg-warm-cream">
      <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        <header className="mb-8">
          <h1 className="font-display text-2xl text-srf-navy md:text-3xl">
            {t("heading")}
          </h1>
          <p className="mt-2 text-sm text-srf-navy/50">
            {t("subtitle")}
          </p>
        </header>

        <BookmarksList />
      </div>
    </main>
  );
}
