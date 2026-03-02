"use client";

/**
 * Error boundary — M2a-8.
 *
 * Warm error page. "Something went wrong" with recovery option.
 * Client component required by Next.js error boundaries.
 */

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SrfLotus } from "@/app/components/SrfLotus";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");

  return (
    <main id="main-content" className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <SrfLotus size="xl" className="mb-2 w-12 h-12 text-srf-gold" />
      <h1 className="mb-3 font-display text-xl text-srf-navy">
        {t("serverError")}
      </h1>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={reset}
          className="min-h-11 inline-flex items-center rounded-lg border border-srf-gold/30 px-4 py-2 text-sm text-srf-navy transition-colors hover:bg-(--theme-surface) hover:border-srf-gold"
        >
          {t("tryAgain")}
        </button>
        <Link
          href="/"
          className="min-h-11 inline-flex items-center rounded-lg border border-srf-navy/15 px-4 py-2 text-sm text-srf-navy/70 transition-colors hover:bg-(--theme-surface) hover:text-srf-navy"
        >
          {t("backHome")}
        </Link>
      </div>
    </main>
  );
}
