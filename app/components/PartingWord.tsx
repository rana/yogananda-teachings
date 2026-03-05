/**
 * PartingWord — contemplative chapter closure.
 *
 * A short, curated Yogananda passage displayed as a gentle farewell
 * at natural session endpoints (below chapter content, above nav).
 * Date-seeded for SSR determinism. Server Component.
 *
 * All passages are verbatim published text (PRI-01)
 * with full attribution (PRI-02).
 */

import { getTranslations } from "next-intl/server";

const PARTING_WORDS = [
  {
    text: "Live quietly in the moment and see the beauty of all before you. The future will take care of itself.",
    source: "Autobiography of a Yogi",
  },
  {
    text: "The season of failure is the best time for sowing the seeds of success.",
    source: "Autobiography of a Yogi",
  },
  {
    text: "Kindness is the light that dissolves all walls between souls, families, and nations.",
    source: "Autobiography of a Yogi",
  },
  {
    text: "There is a magnet in your heart that will attract true friends. That magnet is unselfishness, thinking of others first.",
    source: "Autobiography of a Yogi",
  },
  {
    text: "Remain calm, serene, always in command of yourself. You will then find out how easy it is to get along.",
    source: "Autobiography of a Yogi",
  },
  {
    text: "Every tomorrow is determined by every today.",
    source: "Autobiography of a Yogi",
  },
  {
    text: "Be as simple as you can be; you will be astonished to see how uncomplicated and happy your life can become.",
    source: "Autobiography of a Yogi",
  },
  {
    text: "Read a little. Meditate more. Think of God all the time.",
    source: "Autobiography of a Yogi",
  },
  {
    text: "Let my soul smile through my heart and my heart smile through my eyes, that I may scatter rich smiles in sad hearts.",
    source: "Autobiography of a Yogi",
  },
  {
    text: "The happiness of one's own heart alone cannot satisfy the soul; one must try to include, as necessary to one's own happiness, the happiness of others.",
    source: "Autobiography of a Yogi",
  },
] as const;

function getPartingWordIndex(dateString: string): number {
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = (hash * 31 + dateString.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % PARTING_WORDS.length;
}

export async function PartingWord({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "partingWord" });

  const today = new Date().toISOString().slice(0, 10);
  const index = getPartingWordIndex(today);
  const passage = PARTING_WORDS[index];

  return (
    <aside
      aria-label={t("label")}
      className="reader-scene-break"
      style={{ textAlign: "center", maxInlineSize: "32em", marginInline: "auto" }}
      data-no-print
    >
      <blockquote className="reader-epigraph" style={{ marginBlock: 0 }}>
        {passage.text}
      </blockquote>
      <p className="reader-citation" style={{ textAlign: "center" }}>
        — Paramahansa Yogananda, <cite>{passage.source}</cite>
      </p>
    </aside>
  );
}
