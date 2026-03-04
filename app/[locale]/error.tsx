"use client";

/**
 * Error boundary — warmth and recovery.
 * Client component required by Next.js.
 */

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Motif } from "@/app/components/design/Motif";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");

  return (
    <div className="empty-state">
      <Motif role="breath" voice="sacred" />
      <h1 className="page-title" style={{ marginBlockStart: "var(--space-generous)" }}>
        {t("serverError")}
      </h1>
      <div className="cluster" style={{ marginBlockStart: "var(--space-spacious)" }}>
        <button onClick={reset} className="btn-secondary">
          {t("tryAgain")}
        </button>
        <Link href="/" className="btn-secondary">
          {t("backHome")}
        </Link>
      </div>
    </div>
  );
}
