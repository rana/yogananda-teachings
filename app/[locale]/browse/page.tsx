/**
 * Browse — The Complete Index.
 *
 * High-density text page listing all navigable content.
 * Books grouped by language with chapter counts.
 * Designed text-first. Zero JavaScript. Ideal screen reader experience.
 * Server Component.
 */

import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import pool from "@/lib/db";
import { getBooks, getChapters } from "@/lib/services/books";
import { localeNames } from "@/i18n/config";
import type { Locale } from "@/i18n/config";
import { Surface } from "@/app/components/design/Surface";

export const revalidate = 86400; // 24 hours

export default async function BrowsePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("browse");

  const books = await getBooks(pool);

  // Group books by language and get chapter counts
  const booksByLanguage: Record<string, (typeof books[number] & { chapterCount: number })[]> = {};
  for (const book of books) {
    const chapters = await getChapters(pool, book.id);
    const enriched = { ...book, chapterCount: chapters.length };
    if (!booksByLanguage[book.language]) {
      booksByLanguage[book.language] = [];
    }
    booksByLanguage[book.language].push(enriched);
  }

  return (
    <div className="stack-spacious" style={{ paddingBlock: "var(--space-spacious)" }} aria-label={t("heading")}>

      <Surface as="section" register="instructional" className="center">
        <h1 className="page-title">{t("heading")}</h1>
        <p className="page-subtitle">{t("subtitle")}</p>
      </Surface>

      <section className="center">
        <h2 className="section-heading">{t("booksSection")}</h2>

        {Object.entries(booksByLanguage).map(([lang, langBooks]) => (
          <div key={lang} style={{ marginBlockEnd: "var(--space-generous)" }}>
            <h3 className="section-label" style={{ textAlign: "start" }}>
              {localeNames[lang as Locale] || lang}
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {langBooks.map((book) => (
                <li key={book.id} style={{ marginBlockStart: "var(--space-compact)" }}>
                  <Link
                    href={`/books/${book.slug}`}
                    style={{ fontSize: "0.875rem" }}
                  >
                    {book.title}
                  </Link>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                    {" "}&mdash; {book.author} ({book.chapterCount} ch.)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
