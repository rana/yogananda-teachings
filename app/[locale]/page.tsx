/**
 * Homepage — the threshold.
 *
 * The portal speaks first — a passage, not a product pitch.
 * The featured teaching is the bindu (still center). Search,
 * thematic doors, and newcomer paths orbit at increasing distance.
 *
 * Server Component. Zero JavaScript for content.
 * Governed by: PRI-01 (verbatim fidelity), PRI-02 (attribution)
 */

import { getTranslations, setRequestLocale } from "next-intl/server";
import pool from "@/lib/db";
import { getRandomPassage } from "@/lib/services/passages";
import { Surface } from "@/app/components/design/Surface";
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

const SEEKING_ENTRIES = [
  { key: "comfort", query: "strength courage hope trials" },
  { key: "meaning", query: "meaning purpose life truth" },
  { key: "practice", query: "stillness peace meditation calm" },
  { key: "curiosity", query: "Yogananda spiritual truth divine" },
] as const;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  const passage = await getRandomPassage(pool, locale === "es" ? "es" : "en");

  return (
    <div className="stack-spacious" style={{ paddingBlock: "var(--space-spacious)" }}>

      {/* ── The Bindu: Today's Wisdom ── */}
      <Surface as="section" register="sacred" rasa="shanta" className="center">
        {passage ? (
          <>
            <blockquote className="passage-quote">
              &ldquo;{passage.content}&rdquo;
            </blockquote>
            <p className="passage-citation">
              — {passage.bookAuthor},{" "}
              <a href={`/${locale}/books/${passage.bookSlug}/${passage.chapterNumber}#passage-${passage.id}`}>
                <cite>{passage.bookTitle}</cite>
                {passage.chapterTitle && `, ${passage.chapterTitle}`}
              </a>
            </p>
          </>
        ) : (
          <p className="passage-quote" style={{ fontStyle: "italic" }}>
            {t("wisdomFallback", { defaultValue: "The teachings await you." })}
          </p>
        )}
      </Surface>

      <Motif role="breath" voice="sacred" />

      {/* ── Search ── */}
      <section className="center" style={{ maxInlineSize: "36em" }}>
        <form
          action={`/${locale}/search`}
          method="get"
          role="search"
          aria-label={t("searchPrompt")}
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
      </section>

      {/* ── Thematic Doors ── */}
      <Surface as="section" register="reverential" className="center">
        <h2 className="section-label">{t("thematicDoors.heading")}</h2>
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
      </Surface>

      {/* ── Seeking... ── */}
      <Surface as="section" register="instructional" className="center">
        <h2 className="section-label">{t("seeking.heading")}</h2>
        <div className="grid-2">
          {SEEKING_ENTRIES.map((entry) => (
            <a
              key={entry.key}
              href={`/${locale}/search?q=${encodeURIComponent(entry.query)}`}
              className="card"
            >
              {t(`seeking.${entry.key}`)}
            </a>
          ))}
        </div>
      </Surface>

      {/* ── Start Here ── */}
      <Surface as="section" register="instructional" className="center">
        <h2 className="section-label">{t("startHere.heading")}</h2>
        <div className="grid-3">
          <a href={`/${locale}/books`} className="card stack-tight" style={{ textAlign: "center" }}>
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
            style={{ textAlign: "center" }}
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
            style={{ textAlign: "center" }}
          >
            <strong style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
              {t("startHere.seeker.title")}
            </strong>
            <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
              {t("startHere.seeker.description")}
            </span>
          </a>
        </div>
      </Surface>

      {/* ── Practice Bridge ── */}
      <div className="signpost" style={{ paddingBlock: "var(--space-generous)" }}>
        <p>
          {t("practiceBridge")}{" "}
          <a href={SRF_PRACTICE.lessons} target="_blank" rel="noopener noreferrer">
            {t("srfLessons")}
          </a>
        </p>
      </div>
    </div>
  );
}
