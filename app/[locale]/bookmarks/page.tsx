/**
 * Bookmarks page — saved teachings.
 *
 * Lists all saved bookmarks grouped by book.
 * localStorage-only, no server interaction.
 * Server Component wraps client island.
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
    <div className="center" style={{ paddingBlock: "var(--space-spacious)" }}>
      <header style={{ marginBlockEnd: "var(--space-generous)" }}>
        <h1 className="page-title">{t("heading")}</h1>
        <p className="page-subtitle">{t("subtitle")}</p>
      </header>

      <BookmarksList />
    </div>
  );
}
