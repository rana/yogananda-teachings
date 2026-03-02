/**
 * About page — M2a-4.
 *
 * Yogananda biography, line of gurus, SRF overview,
 * "Go Deeper" links to SRF Lessons, center locator,
 * Online Meditation Center, bookstore, app.
 */

import { getTranslations, setRequestLocale } from "next-intl/server";

const GURUS = [
  { name: "Mahavatar Babaji", role: "The deathless guru" },
  { name: "Lahiri Mahasaya", role: "1828–1895" },
  { name: "Swami Sri Yukteswar", role: "1855–1936" },
  { name: "Paramahansa Yogananda", role: "1893–1952" },
];

const GO_DEEPER_LINKS = [
  { key: "lessons", url: "https://yogananda.org/lessons" },
  { key: "centers", url: "https://yogananda.org/locations" },
  { key: "meditation", url: "https://onlinemeditation.yogananda.org/" },
  { key: "app", url: "https://yogananda.org/app-faq" },
  { key: "bookstore", url: "https://bookstore.yogananda-srf.org" },
  { key: "youtube", url: "https://www.youtube.com/@YoganandaSRF" },
];

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  return (
    <main id="main-content" className="min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        <h1 className="mb-8 font-display text-2xl text-srf-navy md:text-3xl">
          {t("heading")}
        </h1>

        {/* Yogananda biography */}
        <section className="mb-12">
          <h2 className="mb-4 font-display text-xl text-srf-navy">
            {t("yoganandaTitle")}
          </h2>
          <p className="leading-relaxed text-srf-navy/80">
            {t("yoganandaBio")}
          </p>
        </section>

        {/* Self-Realization Fellowship */}
        <section className="mb-12">
          <h2 className="mb-4 font-display text-xl text-srf-navy">
            {t("srfTitle")}
          </h2>
          <p className="leading-relaxed text-srf-navy/80">
            {t("srfDescription")}
          </p>
        </section>

        {/* Line of Gurus */}
        <section className="mb-12">
          <h2 className="mb-6 font-display text-xl text-srf-navy">
            {t("lineOfGurus")}
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {GURUS.map((guru) => (
              <div key={guru.name} className="text-center">
                {/* Placeholder for official portraits */}
                <div
                  className="mx-auto mb-3 h-24 w-24 rounded-full bg-srf-navy/5"
                  data-decorative
                  aria-hidden="true"
                />
                <p className="text-sm font-semibold text-srf-navy">
                  {guru.name}
                </p>
                <p className="text-xs text-srf-navy/50">{guru.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Go Deeper */}
        <section>
          <h2 className="mb-6 font-display text-xl text-srf-navy">
            {t("goDeeper")}
          </h2>
          <div className="space-y-3">
            {GO_DEEPER_LINKS.map((link) => (
              <a
                key={link.key}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border border-srf-navy/10 bg-white px-4 py-3 text-sm text-srf-navy/70 transition-colors hover:border-srf-gold/40 hover:text-srf-navy min-h-11"
              >
                {t(link.key)}
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
