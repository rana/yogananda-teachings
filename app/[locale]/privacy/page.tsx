/**
 * Privacy policy — M2a-20 (ADR-099).
 *
 * Human-readable privacy policy in contemplative voice.
 * What data is collected, why, retention periods,
 * sub-processors, data subject rights.
 */

import { getTranslations, setRequestLocale } from "next-intl/server";
import { SRF_ORG } from "@/lib/config/srf-links";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("privacy");

  return (
    <main id="main-content" className="min-h-screen">
      <article className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        <h1 className="mb-2 font-display text-2xl text-srf-navy md:text-3xl">
          {t("heading")}
        </h1>
        <p className="mb-8 text-sm text-srf-navy/60">{t("subtitle")}</p>

        <div className="prose prose-sm max-w-none space-y-6 text-srf-navy/80 leading-relaxed">
          <section>
            <h2 className="font-display text-lg text-srf-navy">Our Approach</h2>
            <p>
              This portal exists to share Paramahansa Yogananda&apos;s published
              teachings freely with the world. We believe technology should serve
              seekers quietly — collecting only what is needed and nothing more.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-srf-navy">What We Collect</h2>
            <p>
              <strong>Anonymous analytics only.</strong> We use privacy-respecting
              analytics to understand how many people the teachings are reaching
              and which topics resonate most. This helps us serve you better.
            </p>
            <ul className="list-inside list-disc space-y-1">
              <li>Page views (anonymous, no user identification)</li>
              <li>Search queries (anonymous, aggregated)</li>
              <li>Country-level geographic data (from Vercel Analytics)</li>
              <li>Performance metrics (page load times)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg text-srf-navy">What We Do Not Collect</h2>
            <ul className="list-inside list-disc space-y-1">
              <li>No user accounts or personal information</li>
              <li>No cookies for tracking or advertising</li>
              <li>No session tracking or behavioral profiling</li>
              <li>No email addresses or contact information</li>
              <li>No reading history or engagement tracking</li>
              <li>No data shared with advertisers or data brokers</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg text-srf-navy">Local Storage</h2>
            <p>
              Some preferences are stored locally on your device using your
              browser&apos;s localStorage. This data never leaves your device:
            </p>
            <ul className="list-inside list-disc space-y-1">
              <li>Text-only mode preference</li>
              <li>Language preference</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg text-srf-navy">Sub-Processors</h2>
            <ul className="list-inside list-disc space-y-1">
              <li><strong>Vercel</strong> — Hosting and edge delivery (San Francisco, USA)</li>
              <li><strong>Neon</strong> — Database hosting (AWS us-west-2)</li>
              <li><strong>Sentry</strong> — Error monitoring (San Francisco, USA)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg text-srf-navy">Self-Hosted Fonts</h2>
            <p>
              All fonts are served from our own servers. No requests are made to
              Google Fonts or any other external font service. Your IP address is
              never transmitted to third-party font providers.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-srf-navy">Your Rights</h2>
            <p>
              Since we don&apos;t collect personal data, there is generally no
              personal information to access, correct, or delete. If you have
              questions or concerns, contact Self-Realization Fellowship at{" "}
              <a
                href={SRF_ORG.contact}
                target="_blank"
                rel="noopener noreferrer"
                className="text-srf-navy underline decoration-srf-gold/40 underline-offset-2 hover:text-srf-gold"
              >
                yogananda.org/contact-us
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg text-srf-navy">Changes</h2>
            <p>
              This policy may be updated as the portal evolves. Changes will be
              reflected on this page.
            </p>
            <p className="text-xs text-srf-navy/40 mt-4">
              Last updated: March 2026
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
