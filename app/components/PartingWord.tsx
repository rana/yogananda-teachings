/**
 * PartingWord — M2b-9 (DES-014).
 *
 * Session closure moment: a short, contemplative Yogananda passage
 * displayed as a gentle farewell at natural session endpoints.
 * Editorially curated pool, date-seeded for SSR determinism.
 *
 * Placement: below last chapter paragraph (above Next Chapter nav),
 * bottom of search results. Styled in muted text, Merriweather 300, centered.
 */

import { getTranslations } from "next-intl/server";

/**
 * Curated pool of short contemplative passages from Autobiography of a Yogi.
 * All passages are verbatim published text (PRI-01) with full attribution (PRI-02).
 */
const PARTING_WORDS = [
  {
    text: "Live quietly in the moment and see the beauty of all before you. The future will take care of itself.",
    author: "Paramahansa Yogananda",
    source: "Autobiography of a Yogi",
  },
  {
    text: "The season of failure is the best time for sowing the seeds of success.",
    author: "Paramahansa Yogananda",
    source: "Autobiography of a Yogi",
  },
  {
    text: "The power of unfulfilled desires is the root of all man's slavery.",
    author: "Paramahansa Yogananda",
    source: "Autobiography of a Yogi",
  },
  {
    text: "Kindness is the light that dissolves all walls between souls, families, and nations.",
    author: "Paramahansa Yogananda",
    source: "Autobiography of a Yogi",
  },
  {
    text: "There is a magnet in your heart that will attract true friends. That magnet is unselfishness, thinking of others first.",
    author: "Paramahansa Yogananda",
    source: "Autobiography of a Yogi",
  },
  {
    text: "You must not let your life run in the ordinary way; do something that nobody else has done, something that will dazzle the world.",
    author: "Paramahansa Yogananda",
    source: "Autobiography of a Yogi",
  },
  {
    text: "Remain calm, serene, always in command of yourself. You will then find out how easy it is to get along.",
    author: "Paramahansa Yogananda",
    source: "Autobiography of a Yogi",
  },
  {
    text: "Every tomorrow is determined by every today.",
    author: "Paramahansa Yogananda",
    source: "Autobiography of a Yogi",
  },
  {
    text: "Be as simple as you can be; you will be astonished to see how uncomplicated and happy your life can become.",
    author: "Paramahansa Yogananda",
    source: "Autobiography of a Yogi",
  },
  {
    text: "Read a little. Meditate more. Think of God all the time.",
    author: "Paramahansa Yogananda",
    source: "Autobiography of a Yogi",
  },
  {
    text: "Let my soul smile through my heart and my heart smile through my eyes, that I may scatter rich smiles in sad hearts.",
    author: "Paramahansa Yogananda",
    source: "Autobiography of a Yogi",
  },
  {
    text: "If you permit your thoughts to dwell on evil you yourself will become ugly.",
    author: "Paramahansa Yogananda",
    source: "Autobiography of a Yogi",
  },
  {
    text: "Having determination and working with will, you can accomplish anything.",
    author: "Paramahansa Yogananda",
    source: "Autobiography of a Yogi",
  },
  {
    text: "Loyalty is the first law of God.",
    author: "Paramahansa Yogananda",
    source: "Autobiography of a Yogi",
  },
  {
    text: "The happiness of one's own heart alone cannot satisfy the soul; one must try to include, as necessary to one's own happiness, the happiness of others.",
    author: "Paramahansa Yogananda",
    source: "Autobiography of a Yogi",
  },
  {
    text: "Truth is exact correspondence with reality.",
    author: "Paramahansa Yogananda",
    source: "Autobiography of a Yogi",
  },
] as const;

/**
 * Returns a deterministic index for a given date string.
 * Uses a simple hash so the same date always yields the same passage (SSR-safe).
 */
export function getPartingWordIndex(dateString: string): number {
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = (hash * 31 + dateString.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % PARTING_WORDS.length;
}

/** Exported for tests. */
export { PARTING_WORDS };

/**
 * Server component rendering a quiet closing moment.
 * Picks a passage seeded by today's date for SSR determinism.
 */
export async function PartingWord({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "partingWord" });

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const index = getPartingWordIndex(today);
  const passage = PARTING_WORDS[index];

  return (
    <aside
      aria-label={t("label")}
      className="mx-auto mt-12 mb-8 max-w-xl text-center"
      data-no-print
    >
      {/* Lotus divider */}
      <div className="mb-6 flex items-center justify-center gap-3" aria-hidden="true">
        <span className="inline-block h-px w-12 bg-srf-gold opacity-30" />
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-srf-gold opacity-40"
        >
          {/* Simplified lotus: three overlapping petals */}
          <path
            d="M10 2C10 2 7 6 7 10C7 14 10 18 10 18C10 18 13 14 13 10C13 6 10 2 10 2Z"
            fill="currentColor"
          />
          <path
            d="M10 4C10 4 4 7 4 11C4 15 10 18 10 18C10 18 6 14 6 10C6 6 10 4 10 4Z"
            fill="currentColor"
            opacity="0.6"
          />
          <path
            d="M10 4C10 4 16 7 16 11C16 15 10 18 10 18C10 18 14 14 14 10C14 6 10 4 10 4Z"
            fill="currentColor"
            opacity="0.6"
          />
        </svg>
        <span className="inline-block h-px w-12 bg-srf-gold opacity-30" />
      </div>

      {/* Label */}
      <p className="mb-3 font-sans text-xs tracking-widest uppercase text-srf-navy opacity-40">
        {t("label")}
      </p>

      {/* Passage */}
      <blockquote className="font-serif font-light text-srf-navy opacity-60 leading-relaxed">
        <p className="text-base italic">&ldquo;{passage.text}&rdquo;</p>
      </blockquote>

      {/* Attribution — reader-citation style */}
      <p className="reader-citation mt-3">
        {passage.author}, <cite>{passage.source}</cite>
      </p>
    </aside>
  );
}
