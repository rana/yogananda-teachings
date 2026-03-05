/**
 * Legal page — copyright, terms of use, citation, AI permissions, privacy.
 *
 * Aligned with ADR-081 (Machine-Readable Content and AI Citation Strategy):
 * the portal welcomes indexing, training, and citation with attribution.
 * Copyright protects integrity and attribution, not access.
 *
 * Fully internationalized. Instructional register. Server Component.
 */

import { getTranslations, setRequestLocale } from "next-intl/server";
import { SRF } from "@/lib/config/srf-links";
import { Surface } from "@/app/components/design/Surface";

export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal");

  return (
    <div className="stack-spacious" style={{ paddingBlock: "var(--space-spacious)" }}>

      <Surface as="header" register="instructional" className="center">
        <h1 className="page-title">{t("heading")}</h1>
        <p className="page-subtitle">{t("subtitle")}</p>
      </Surface>

      <article className="center prose-section stack-generous">
        <section>
          <h2 className="section-heading">{t("copyrightHeading")}</h2>
          <p className="prose-text">{t("copyrightBody")}</p>
          <p className="prose-text">{t("copyrightPhilosophy")}</p>
        </section>

        <section>
          <h2 className="section-heading">{t("termsHeading")}</h2>
          <p className="prose-text">{t("termsIntro")}</p>
          <ul className="prose-list">
            <li>{t("termsRead")}</li>
            <li>{t("termsQuote")}</li>
            <li>{t("termsAI")}</li>
            <li>{t("termsRepublish")}</li>
            <li>{t("termsCommercial")}</li>
            <li>{t("termsMisattribute")}</li>
          </ul>
        </section>

        <section>
          <h2 className="section-heading">{t("citationHeading")}</h2>
          <p className="prose-text">{t("citationIntro")}</p>
          <p className="prose-text" style={{ fontStyle: "italic" }}>
            {t("citationFormat")}
          </p>
          <p className="prose-text">{t("citationNote")}</p>
        </section>

        <section id="ai">
          <h2 className="section-heading">{t("aiHeading")}</h2>
          <p className="prose-text">{t("aiIntro")}</p>
          <ul className="prose-list">
            <li>{t("aiTraining")}</li>
            <li>{t("aiCitation")}</li>
            <li>{t("aiSummarize")}</li>
            <li>{t("aiDerivative")}</li>
            <li>{t("aiMedia")}</li>
          </ul>
          <p className="prose-text">
            {t.rich("aiMachineReadable", {
              llmsTxtLink: (chunks) => <a href="/llms.txt">{chunks}</a>,
            })}
          </p>
        </section>

        <section>
          <h2 className="section-heading">{t("noAIHeading")}</h2>
          <p className="prose-text">{t("noAIBody")}</p>
        </section>

        <section>
          <h2 className="section-heading">{t("licensingHeading")}</h2>
          <p className="prose-text">{t("licensingBody")}</p>
          <p className="prose-text">
            {t.rich("licensingContact", {
              email: (chunks) => (
                <a href="mailto:legal@yogananda.tech">{chunks}</a>
              ),
            })}
          </p>
        </section>

        <section>
          <h2 className="section-heading">{t("privacyHeading")}</h2>
          <p className="prose-text">{t("privacyBody")}</p>
        </section>

        <section id="security">
          <h2 className="section-heading">{t("securityHeading")}</h2>
          <p className="prose-text">
            {t.rich("securityBody", {
              email: (chunks) => (
                <a href="mailto:security@yogananda.tech">{chunks}</a>
              ),
            })}
          </p>
        </section>

        <section>
          <h2 className="section-heading">{t("contactHeading")}</h2>
          <p className="prose-text">
            Self-Realization Fellowship
            <br />
            3880 San Rafael Avenue
            <br />
            Los Angeles, California 90065
            <br />
            <a
              href={SRF.home}
              target="_blank"
              rel="noopener noreferrer"
            >
              yogananda.org
            </a>
          </p>
        </section>
      </article>
    </div>
  );
}
