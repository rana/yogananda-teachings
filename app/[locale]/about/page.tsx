/**
 * About page — who Yogananda was, what SRF is, where to go deeper.
 *
 * Biography, line of gurus, SRF overview, external links.
 * Contemplative register. Server Component.
 */

import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  SRF_PRACTICE,
  SRF_COMMUNITY,
  SRF_ORG,
  SRF_BOOKSTORE,
  SRF_SOCIAL,
} from "@/lib/config/srf-links";
import { Surface } from "@/app/components/design/Surface";
import { Motif } from "@/app/components/design/Motif";

const GURUS = [
  { name: "Mahavatar Babaji", role: "The deathless guru" },
  { name: "Lahiri Mahasaya", role: "1828\u20131895" },
  { name: "Swami Sri Yukteswar", role: "1855\u20131936" },
  { name: "Paramahansa Yogananda", role: "1893\u20131952" },
];

const GO_DEEPER_LINKS = [
  { key: "lessons", url: SRF_PRACTICE.lessons },
  { key: "centers", url: SRF_COMMUNITY.locations },
  { key: "meditation", url: SRF_PRACTICE.onlineMeditation },
  { key: "app", url: SRF_ORG.app },
  { key: "bookstore", url: SRF_BOOKSTORE.home },
  { key: "youtube", url: SRF_SOCIAL.youtube },
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
    <div className="stack-spacious" style={{ paddingBlock: "var(--space-spacious)" }}>

      <Surface as="section" register="reverential" className="center">
        <h1 className="page-title">{t("heading")}</h1>
      </Surface>

      {/* Yogananda biography */}
      <Surface as="section" register="reverential" className="center prose-section">
        <h2 className="section-heading">{t("yoganandaTitle")}</h2>
        <p className="prose-text">{t("yoganandaBio")}</p>
      </Surface>

      <Motif role="breath" voice="sacred" />

      {/* Self-Realization Fellowship */}
      <Surface as="section" register="instructional" className="center prose-section">
        <h2 className="section-heading">{t("srfTitle")}</h2>
        <p className="prose-text">{t("srfDescription")}</p>
      </Surface>

      {/* Line of Gurus */}
      <Surface as="section" register="reverential" className="center">
        <h2 className="section-heading" style={{ textAlign: "center" }}>{t("lineOfGurus")}</h2>
        <div className="guru-grid">
          {GURUS.map((guru) => (
            <div key={guru.name} style={{ textAlign: "center" }}>
              <div
                className="guru-portrait-placeholder"
                aria-hidden="true"
              />
              <p style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                {guru.name}
              </p>
              <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                {guru.role}
              </p>
            </div>
          ))}
        </div>
      </Surface>

      <Motif role="breath" voice="sacred" />

      {/* Go Deeper */}
      <Surface as="section" register="instructional" className="center">
        <h2 className="section-heading">{t("goDeeper")}</h2>
        <div className="stack-tight">
          {GO_DEEPER_LINKS.map((link) => (
            <a
              key={link.key}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card"
              style={{ fontSize: "0.875rem" }}
            >
              {t(link.key)}
            </a>
          ))}
        </div>
      </Surface>
    </div>
  );
}
