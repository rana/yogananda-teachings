"use client";

/**
 * Error boundary — warmth and recovery.
 * Client component required by Next.js.
 *
 * Shows a rotating verbatim Yogananda quote on persistence/courage,
 * chosen by day-of-year so each visit sees a different one.
 * Quotes are hardcoded — PRI-01 verbatim fidelity, no generation.
 */

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Motif } from "@/app/components/design/Motif";
import { getDailyQuote } from "@/lib/quotes";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");
  const locale = typeof window !== "undefined"
    ? (document.documentElement.lang || "en")
    : "en";
  const quote = getDailyQuote(locale);

  return (
    <div className="empty-state">
      <Motif role="breath" voice="sacred" />
      <h1 className="page-title">
        {t("serverError")}
      </h1>
      <div className="error-nav">
        <button onClick={reset} className="btn-secondary">
          {t("tryAgain")}
        </button>
        <Link href="/" className="btn-secondary">
          {t("backHome")}
        </Link>
      </div>
      <blockquote className="reader-epigraph" style={{ maxInlineSize: "32em" }}>
        {quote.text}
      </blockquote>
      <p className="reader-citation">{quote.source}</p>
    </div>
  );
}
