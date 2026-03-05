/**
 * Homepage — the threshold.
 *
 * The portal speaks first — a passage, not a product pitch.
 * The featured teaching is the bindu (still center). Search,
 * thematic doors, and newcomer paths orbit at increasing distance.
 *
 * Dhvani: suggestion over statement. The page whispers.
 * Bindu: the passage is the still center; everything else orbits.
 * Prāṇa: sections breathe with varying rhythm, not uniform spacing.
 *
 * Server Component. Zero JavaScript for content.
 * Governed by: PRI-01 (verbatim fidelity), PRI-02 (attribution)
 */

import { getTranslations, setRequestLocale } from "next-intl/server";
import pool from "@/lib/db";
import { getDailyPassage } from "@/lib/services/passages";
import { ContinueReading } from "@/app/components/ContinueReading";
import { ShowAnother } from "@/app/components/ShowAnother";
import { Motif } from "@/app/components/design/Motif";
import { SRF_PRACTICE } from "@/lib/config/srf-links";

export const dynamic = "force-dynamic";

const THEMATIC_DOORS = [
  { key: "innerPeace", query: "inner peace calm stillness" },
  { key: "love", query: "love divine human heart" },
  { key: "lastingHappiness", query: "happiness joy bliss lasting" },
  { key: "lifePurpose", query: "purpose life meaning why" },
  { key: "healing", query: "healing health strength" },
  { key: "overcomingFear", query: "fear anxiety worry courage overcome" },
] as const;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  const passage = await getDailyPassage(pool, locale === "es" ? "es" : "en");

  return (
    <div className="page-arrive" style={{ display: "flex", flexDirection: "column", gap: "var(--space-spacious)", paddingBlock: "var(--space-generous)" }}>

      {/* ── Welcoming threshold — lotus as first breath ── */}
      <div className="center" style={{ paddingBlock: "var(--space-tight, 0.5rem)" }}>
        <Motif role="divider" voice="sacred" glyph="lotus-03" className="welcome-lotus" />
      </div>

      {/* ── The Bindu: Today's Wisdom ── */}
      {passage ? (
        <ShowAnother initial={passage} />
      ) : (
        <section className="center" style={{ maxInlineSize: "36em" }}>
          <p className="reader-epigraph">
            {t("wisdomFallback", { defaultValue: "The teachings await you." })}
          </p>
        </section>
      )}

      <Motif role="divider" voice="sacred" glyph="lotus-05" />

      {/* ── Search + Thematic Doors (navigation zone) ── */}
      <section className="center" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-default)" }}>
        <form
          action={`/${locale}/search`}
          method="get"
          role="search"
          aria-label={t("searchPrompt")}
          style={{ maxInlineSize: "28em", inlineSize: "100%" }}
        >
          <label htmlFor="home-search" className="visually-hidden">
            {t("searchPrompt")}
          </label>
          <div className="cluster" style={{ gap: "var(--space-compact)" }}>
            <input
              id="home-search"
              type="search"
              name="q"
              placeholder={t("searchPrompt")}
              className="input"
              style={{ flex: 1 }}
              autoComplete="off"
            />
            <button type="submit" className="btn-primary">
              {t("searchButton")}
            </button>
          </div>
        </form>
        <div className="pill-cluster">
          {THEMATIC_DOORS.map((door) => (
            <a
              key={door.key}
              href={`/${locale}/search?q=${encodeURIComponent(door.query)}`}
              className="pill"
            >
              {t(`thematicDoors.${door.key}`)}
            </a>
          ))}
        </div>
      </section>

      {/* ── Start Here ── */}
      <section className="center">
        <h2 className="section-label">{t("startHere.heading")}</h2>
        <div className="grid-3">
          <a href={`/${locale}/books`} className="card stack-tight" style={{ textAlign: "center", display: "flex", flexDirection: "column" }}>
            <strong style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
              {t("startHere.curious.title")}
            </strong>
            <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
              {t("startHere.curious.description")}
            </span>
          </a>
          <a
            href={`/${locale}/search?q=${encodeURIComponent("comfort hope healing")}`}
            className="card stack-tight"
            style={{ textAlign: "center", display: "flex", flexDirection: "column" }}
          >
            <strong style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
              {t("startHere.need.title")}
            </strong>
            <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
              {t("startHere.need.description")}
            </span>
          </a>
          <a
            href={`/${locale}/search?q=${encodeURIComponent("meditation technique practice")}`}
            className="card stack-tight"
            style={{ textAlign: "center", display: "flex", flexDirection: "column" }}
          >
            <strong style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
              {t("startHere.seeker.title")}
            </strong>
            <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
              {t("startHere.seeker.description")}
            </span>
          </a>
        </div>
      </section>

      {/* ── Practice Bridge ── */}
      <div className="signpost">
        <p>
          {t("practiceBridge")}{" "}
          <a href={SRF_PRACTICE.lessons} target="_blank" rel="noopener noreferrer">
            {t("srfLessons")}
          </a>
        </p>
      </div>

      {/* ── Continue Reading (returning seekers — quiet anchor at bottom) ── */}
      <ContinueReading locale={locale} />
    </div>
  );
}
