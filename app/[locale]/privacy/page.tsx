/**
 * Privacy policy — human-readable, contemplative voice.
 *
 * What data is collected, why, retention periods,
 * sub-processors, data subject rights.
 * Instructional register. Server Component.
 */

import { getTranslations, setRequestLocale } from "next-intl/server";
import { SRF_ORG } from "@/lib/config/srf-links";
import { Surface } from "@/app/components/design/Surface";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("privacy");

  return (
    <div className="stack-spacious" style={{ paddingBlock: "var(--space-spacious)" }}>

      <Surface as="header" register="instructional" className="center">
        <h1 className="page-title">{t("heading")}</h1>
        <p className="page-subtitle">{t("subtitle")}</p>
      </Surface>

      <article className="center prose-section stack-generous">
        <section>
          <h2 className="section-heading">Our Approach</h2>
          <p className="prose-text">
            This portal exists to share Paramahansa Yogananda&apos;s published
            teachings freely with the world. We believe technology should serve
            seekers quietly — collecting only what is needed and nothing more.
          </p>
        </section>

        <section>
          <h2 className="section-heading">What We Collect</h2>
          <p className="prose-text">
            <strong>Anonymous analytics only.</strong> We use privacy-respecting
            analytics to understand how many people the teachings are reaching
            and which topics resonate most. This helps us serve you better.
          </p>
          <ul className="prose-list">
            <li>Page views (anonymous, no user identification)</li>
            <li>Search queries (anonymous, aggregated)</li>
            <li>Country-level geographic data (from Vercel Analytics)</li>
            <li>Performance metrics (page load times)</li>
          </ul>
        </section>

        <section>
          <h2 className="section-heading">What We Do Not Collect</h2>
          <ul className="prose-list">
            <li>No user accounts or personal information</li>
            <li>No cookies for tracking or advertising</li>
            <li>No session tracking or behavioral profiling</li>
            <li>No email addresses or contact information</li>
            <li>No reading history or engagement tracking</li>
            <li>No data shared with advertisers or data brokers</li>
          </ul>
        </section>

        <section>
          <h2 className="section-heading">Local Storage</h2>
          <p className="prose-text">
            Some preferences are stored locally on your device using your
            browser&apos;s localStorage. This data never leaves your device:
          </p>
          <ul className="prose-list">
            <li>Text-only mode preference</li>
            <li>Language preference</li>
          </ul>
        </section>

        <section>
          <h2 className="section-heading">Sub-Processors</h2>
          <ul className="prose-list">
            <li><strong>Vercel</strong> — Hosting and edge delivery (San Francisco, USA)</li>
            <li><strong>Neon</strong> — Database hosting (AWS us-west-2)</li>
            <li><strong>Sentry</strong> — Error monitoring (San Francisco, USA)</li>
          </ul>
        </section>

        <section>
          <h2 className="section-heading">Self-Hosted Fonts</h2>
          <p className="prose-text">
            All fonts are served from our own servers. No requests are made to
            Google Fonts or any other external font service. Your IP address is
            never transmitted to third-party font providers.
          </p>
        </section>

        <section>
          <h2 className="section-heading">Your Rights</h2>
          <p className="prose-text">
            Since we don&apos;t collect personal data, there is generally no
            personal information to access, correct, or delete. If you have
            questions or concerns, contact Self-Realization Fellowship at{" "}
            <a
              href={SRF_ORG.contact}
              target="_blank"
              rel="noopener noreferrer"
            >
              yogananda.org/contact-us
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="section-heading">Changes</h2>
          <p className="prose-text">
            This policy may be updated as the portal evolves. Changes will be
            reflected on this page.
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", opacity: 0.6, marginBlockStart: "var(--space-default)" }}>
            Last updated: March 2026
          </p>
        </section>
      </article>
    </div>
  );
}
