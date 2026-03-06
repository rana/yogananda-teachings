/**
 * Homepage — the threshold.
 *
 * A front page that feels like walking into a temple library —
 * not a homepage, a threshold. The visitor receives words first,
 * then sees the book, and finds their way.
 *
 * Composition: passage hero (with lotus watermark) → book presentation
 * (cover + title) → continue reading.
 *
 * Server Component. Zero JavaScript for content.
 * Governed by: PRI-01 (verbatim fidelity), PRI-02 (attribution), PRI-03 (honoring the spirit)
 */

import { getTranslations, setRequestLocale } from "next-intl/server";
import pool from "@/lib/db";
import { getDailyPassage } from "@/lib/services/passages";
import { getBooks, getChapters } from "@/lib/services/books";
import { Link } from "@/i18n/navigation";

import { ContinueReading } from "@/app/components/ContinueReading";
import { ShowAnother } from "@/app/components/ShowAnother";
import { Motif } from "@/app/components/design/Motif";


export const dynamic = "force-dynamic";

const COVER_IMAGES: Record<string, string> = {
  en: "/book-images/covers/autobiography-of-a-yogi.webp",
  es: "/book-images/covers/autobiografia-de-un-yogui.webp",
};

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  const passage = await getDailyPassage(pool, locale === "es" ? "es" : "en");

  // Fetch book data for the book presentation section
  let books = await getBooks(pool, locale);
  if (books.length === 0) {
    books = await getBooks(pool);
  }
  const book = books[0] ?? null;
  const chapterCount = book ? (await getChapters(pool, book.id)).length : 0;

  const coverSrc = COVER_IMAGES[locale] ?? COVER_IMAGES.en;

  return (
    <div className="page-arrive" style={{ display: "flex", flexDirection: "column", paddingBlockEnd: "var(--space-spacious)" }}>

      {/* ── Section I: Passage Hero ── */}
      <div className="passage-hero">
        <Motif role="divider" voice="sacred" glyph="lotus-03" className="passage-hero-motif" />
        {passage ? (
          <ShowAnother initial={passage} />
        ) : (
          <section className="center" style={{ maxInlineSize: "36em" }}>
            <p className="reader-epigraph">
              {t("wisdomFallback", { defaultValue: "The teachings await you." })}
            </p>
          </section>
        )}
      </div>

      <Motif role="breath" voice="sacred" glyph="lotus-07" />

      {/* ── Section II: Book Presentation (cover + title) ── */}
      {book && (
        <section
          aria-label={t("bookPresentation.begin")}
          className="book-presentation"
        >
          <Link href={`/books/${book.slug}`}>
            <img
              src={coverSrc}
              alt={t("bookPresentation.coverAlt")}
              className="bindu-cover"
              width={240}
              height={360}
              fetchPriority="high"
              loading="eager"
              style={{ viewTransitionName: "book-cover" }}
            />
          </Link>
          <p className="book-title">{book.title}</p>
          <p className="book-author">{book.author}</p>
          <p className="book-meta">
            {t("bookPresentation.chapters", { count: chapterCount })}
            {" \u00B7 "}
            {t("bookPresentation.free")}
          </p>
          <Link
            href={`/books/${book.slug}`}
            className="btn-ghost"
            style={{ fontSize: "0.875rem" }}
          >
            {t("bookPresentation.begin")}
          </Link>
        </section>
      )}

      <Motif role="breath" voice="sacred" glyph="lotus-07" />

      {/* ── Section III: Continue Reading (returning seekers) ── */}
      <ContinueReading />

    </div>
  );
}
