/**
 * Legal page — copyright, terms of use, content licensing.
 *
 * No AI-generated content notice. Contact information.
 * Instructional register. Server Component.
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
          <h2 className="section-heading">Copyright</h2>
          <p className="prose-text">
            All content on this portal is the verbatim published work of
            Paramahansa Yogananda and other Self-Realization Fellowship (SRF)
            authors. Content is &copy; Self-Realization Fellowship. All rights
            reserved.
          </p>
          <p className="prose-text">
            This portal makes Yogananda&apos;s published teachings freely
            accessible for reading and personal study. Reproduction,
            redistribution, or commercial use of any content requires written
            permission from Self-Realization Fellowship.
          </p>
        </section>

        <section>
          <h2 className="section-heading">Terms of Use</h2>
          <p className="prose-text">
            By using this portal, you agree to use the content for personal,
            non-commercial purposes. The portal is provided as-is for the benefit
            of spiritual seekers worldwide.
          </p>
          <ul className="prose-list">
            <li>Content may be read, searched, and shared via the portal&apos;s sharing features</li>
            <li>Passages may be quoted with proper attribution to the author, book, and chapter</li>
            <li>Systematic scraping, bulk downloading, or commercial use is prohibited</li>
            <li>AI training on portal content is prohibited without written permission</li>
          </ul>
        </section>

        <section>
          <h2 className="section-heading">No AI-Generated Content</h2>
          <p className="prose-text">
            No content displayed on this portal is generated, paraphrased, or
            synthesized by artificial intelligence. The search system retrieves
            and ranks verbatim published passages — it never generates text.
            AI is used only at index time to classify and enrich metadata about
            existing passages.
          </p>
        </section>

        <section>
          <h2 className="section-heading">Content Licensing</h2>
          <p className="prose-text">
            The literary works of Paramahansa Yogananda are published by
            Self-Realization Fellowship. This portal presents these works with
            authorization. The portal software is separate from the content —
            the teachings remain the intellectual property of SRF.
          </p>
        </section>

        <section>
          <h2 className="section-heading">Contact</h2>
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
