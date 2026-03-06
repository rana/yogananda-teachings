/**
 * 404 page — warm, helpful absence.
 * "Honest absence as invitation, never a dead end."
 * Server Component.
 */

import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Motif } from "@/app/components/design/Motif";
import { getDailyQuote } from "@/lib/quotes";

export default async function NotFound() {
  const t = await getTranslations("errors");
  const nav = await getTranslations("nav");
  const locale = await getLocale();
  const quote = getDailyQuote(locale);

  return (
    <div className="empty-state">
      <Motif role="breath" voice="sacred" />
      <h1 className="page-title">
        {t("notFound")}
      </h1>
      <nav aria-label={t("helpfulLinks")} className="error-nav">
        <Link href="/" className="btn-secondary">{nav("home")}</Link>
        <Link href="/search" className="btn-secondary">{nav("search")}</Link>
        <Link href="/books" className="btn-secondary">{nav("books")}</Link>
      </nav>
      <blockquote className="reader-epigraph" style={{ maxInlineSize: "32em" }}>
        {quote.text}
      </blockquote>
      <p className="reader-citation">{quote.source}</p>
    </div>
  );
}
