/**
 * Legal page — M2a-20 (ADR-081, ADR-099).
 *
 * Copyright, terms of use, content licensing.
 * No AI-generated content notice. Contact information.
 */

import { getTranslations, setRequestLocale } from "next-intl/server";
import { SRF } from "@/lib/config/srf-links";

export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal");

  return (
    <main id="main-content" className="min-h-screen">
      <article className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        <h1 className="mb-2 font-display text-2xl text-srf-navy md:text-3xl">
          {t("heading")}
        </h1>
        <p className="mb-8 text-sm text-srf-navy/60">{t("subtitle")}</p>

        <div className="space-y-8 text-sm leading-relaxed text-srf-navy/80">
          <section>
            <h2 className="mb-3 font-display text-lg text-srf-navy">Copyright</h2>
            <p>
              All content on this portal is the verbatim published work of
              Paramahansa Yogananda and other Self-Realization Fellowship (SRF)
              authors. Content is &copy; Self-Realization Fellowship. All rights
              reserved.
            </p>
            <p className="mt-2">
              This portal makes Yogananda&apos;s published teachings freely
              accessible for reading and personal study. Reproduction,
              redistribution, or commercial use of any content requires written
              permission from Self-Realization Fellowship.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-lg text-srf-navy">Terms of Use</h2>
            <p>
              By using this portal, you agree to use the content for personal,
              non-commercial purposes. The portal is provided as-is for the benefit
              of spiritual seekers worldwide.
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Content may be read, searched, and shared via the portal&apos;s sharing features</li>
              <li>Passages may be quoted with proper attribution to the author, book, and chapter</li>
              <li>Systematic scraping, bulk downloading, or commercial use is prohibited</li>
              <li>AI training on portal content is prohibited without written permission</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 font-display text-lg text-srf-navy">
              No AI-Generated Content
            </h2>
            <p>
              No content displayed on this portal is generated, paraphrased, or
              synthesized by artificial intelligence. The search system retrieves
              and ranks verbatim published passages — it never generates text.
              AI is used only at index time to classify and enrich metadata about
              existing passages.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-lg text-srf-navy">Content Licensing</h2>
            <p>
              The literary works of Paramahansa Yogananda are published by
              Self-Realization Fellowship. This portal presents these works with
              authorization. The portal software is separate from the content —
              the teachings remain the intellectual property of SRF.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-lg text-srf-navy">Contact</h2>
            <p>
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
                className="text-srf-navy underline decoration-srf-gold/40 underline-offset-2 hover:text-srf-gold"
              >
                yogananda.org
              </a>
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
