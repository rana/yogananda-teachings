/**
 * Homepage — "The Living Library" — M2a-1, M2a-13.
 *
 * Today's Wisdom hero, search bar, thematic doors,
 * "Seeking..." empathic entry points, Start Here newcomer path,
 * Practice Bridge.
 *
 * The portal speaks first — a passage, not a product pitch.
 */

import { getTranslations, setRequestLocale } from "next-intl/server";
import NextLink from "next/link";
import pool from "@/lib/db";
import { getRandomPassage } from "@/lib/services/passages";
import { TodaysWisdom } from "@/app/components/TodaysWisdom";
import { SRF_PRACTICE } from "@/lib/config/srf-links";

export const dynamic = "force-dynamic";

const THEMATIC_DOORS = [
  { key: "peace", query: "peace" },
  { key: "courage", query: "courage" },
  { key: "healing", query: "healing" },
  { key: "joy", query: "joy" },
  { key: "purpose", query: "purpose" },
  { key: "love", query: "love" },
] as const;

const SEEKING_ENTRIES = [
  { key: "comfort", query: "comfort hope healing" },
  { key: "meaning", query: "meaning purpose life" },
  { key: "practice", query: "meditation technique practice" },
  { key: "curiosity", query: "Yogananda autobiography" },
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
    <main id="main-content" className="min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-8 md:py-16">
        {/* Today's Wisdom — hero position */}
        <TodaysWisdom passage={passage} />

        {/* Search — server-rendered form, zero JS (PRI-05, PRI-07) */}
        <section className="mt-12">
          <form
            action={`/${locale}/search`}
            method="get"
            role="search"
            aria-label={t("searchPrompt")}
          >
            <label htmlFor="home-search-input" className="sr-only">
              {t("searchPrompt")}
            </label>
            <div className="flex gap-2">
              <input
                id="home-search-input"
                name="q"
                type="search"
                placeholder={t("searchPrompt")}
                className="min-h-11 flex-1 rounded-lg border border-srf-navy/15 bg-(--theme-surface) px-4 py-2.5 text-srf-navy placeholder:text-srf-navy/35 focus:border-srf-gold/60 focus:outline-none focus:ring-1 focus:ring-srf-gold/30"
                maxLength={500}
              />
              <button
                type="submit"
                className="min-h-11 min-w-11 rounded-lg bg-srf-navy px-4 py-2.5 text-sm font-sans font-semibold text-white transition-colors hover:bg-srf-navy/90"
              >
                {t("searchButton")}
              </button>
            </div>
          </form>
        </section>

        {/* Thematic doors — M2a-1 */}
        <section className="mt-16" aria-label={t("thematicDoors.heading")}>
          <h2 className="mb-4 text-center text-xs font-sans font-semibold uppercase tracking-widest text-srf-navy/40">
            {t("thematicDoors.heading")}
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {THEMATIC_DOORS.map((door) => (
              <NextLink
                key={door.key}
                href={`/${locale}/search?q=${encodeURIComponent(door.query)}`}
                className="rounded-full border border-srf-gold/30 px-4 py-2 text-sm text-srf-navy/70 transition-all hover:border-srf-gold hover:bg-(--theme-surface) hover:text-srf-navy min-h-11 inline-flex items-center"
              >
                {t(`thematicDoors.${door.key}`)}
              </NextLink>
            ))}
          </div>
        </section>

        {/* "Seeking..." empathic entry points — M2a-1 */}
        <section className="mt-16" aria-label={t("seeking.heading")}>
          <h2 className="mb-4 text-center text-xs font-sans font-semibold uppercase tracking-widest text-srf-navy/40">
            {t("seeking.heading")}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {SEEKING_ENTRIES.map((entry) => (
              <NextLink
                key={entry.key}
                href={`/${locale}/search?q=${encodeURIComponent(entry.query)}`}
                className="rounded-lg border border-srf-navy/10 bg-(--theme-surface) px-4 py-3 text-sm text-srf-navy/70 transition-colors hover:border-srf-gold/40 hover:text-srf-navy min-h-11"
              >
                {t(`seeking.${entry.key}`)}
              </NextLink>
            ))}
          </div>
        </section>

        {/* Start Here — M2a-13: Three newcomer entry paths */}
        <section className="mt-16" aria-label={t("startHere.heading")}>
          <h2 className="mb-6 text-center text-xs font-sans font-semibold uppercase tracking-widest text-srf-navy/40">
            {t("startHere.heading")}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <NextLink
              href={`/${locale}/books`}
              className="group rounded-lg border border-srf-navy/5 bg-(--theme-surface) p-5 text-center transition-all hover:border-srf-gold/30 hover:shadow-sm"
            >
              <h3 className="mb-2 font-display text-sm font-semibold text-srf-navy group-hover:text-srf-gold transition-colors">
                {t("startHere.curious.title")}
              </h3>
              <p className="text-xs leading-relaxed text-srf-navy/60">
                {t("startHere.curious.description")}
              </p>
            </NextLink>
            <NextLink
              href={`/${locale}/search?q=${encodeURIComponent("comfort hope healing")}`}
              className="group rounded-lg border border-srf-navy/5 bg-(--theme-surface) p-5 text-center transition-all hover:border-srf-gold/30 hover:shadow-sm"
            >
              <h3 className="mb-2 font-display text-sm font-semibold text-srf-navy group-hover:text-srf-gold transition-colors">
                {t("startHere.need.title")}
              </h3>
              <p className="text-xs leading-relaxed text-srf-navy/60">
                {t("startHere.need.description")}
              </p>
            </NextLink>
            <NextLink
              href={`/${locale}/search?q=${encodeURIComponent("meditation technique practice")}`}
              className="group rounded-lg border border-srf-navy/5 bg-(--theme-surface) p-5 text-center transition-all hover:border-srf-gold/30 hover:shadow-sm"
            >
              <h3 className="mb-2 font-display text-sm font-semibold text-srf-navy group-hover:text-srf-gold transition-colors">
                {t("startHere.seeker.title")}
              </h3>
              <p className="text-xs leading-relaxed text-srf-navy/60">
                {t("startHere.seeker.description")}
              </p>
            </NextLink>
          </div>
        </section>

        {/* Practice Bridge — quiet signpost (PRI-04) */}
        <section className="mt-16 text-center">
          <p className="text-sm text-srf-navy/50">
            {t("practiceBridge")}{" "}
            <a
              href={SRF_PRACTICE.lessons}
              target="_blank"
              rel="noopener noreferrer"
              className="text-srf-navy/70 underline decoration-srf-gold/40 underline-offset-2 hover:text-srf-navy"
            >
              {t("srfLessons")}
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
