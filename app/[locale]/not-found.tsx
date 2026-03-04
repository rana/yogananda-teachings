/**
 * 404 page — warm, helpful absence.
 * "Honest absence as invitation, never a dead end."
 * Server Component.
 */

import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Motif } from "@/app/components/design/Motif";

export default async function NotFound() {
  const t = await getTranslations("errors");
  const nav = await getTranslations("nav");

  return (
    <div className="empty-state">
      <Motif role="breath" voice="sacred" />
      <h1 className="page-title" style={{ marginBlockStart: "var(--space-generous)" }}>
        {t("notFound")}
      </h1>
      <p className="page-subtitle" style={{ maxInlineSize: "28em" }}>
        {t("notFoundGuide")}
      </p>
      <nav
        className="cluster"
        aria-label={t("helpfulLinks")}
        style={{ marginBlockStart: "var(--space-spacious)" }}
      >
        <Link href="/" className="btn-secondary">{nav("home")}</Link>
        <Link href="/search" className="btn-secondary">{nav("search")}</Link>
        <Link href="/books" className="btn-secondary">{nav("books")}</Link>
      </nav>
    </div>
  );
}
