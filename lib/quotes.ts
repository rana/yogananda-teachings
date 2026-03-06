/**
 * Rotating verbatim Yogananda quotes for error/empty states.
 *
 * PRI-01: All quotes are verbatim from published works.
 * Rotates by day-of-year so each visit sees a different one.
 */

export const ENCOURAGEMENT_QUOTES = [
  {
    en: "A saint is a sinner who never gave up.",
    es: "Un santo es un pecador que nunca se rindió.",
    source: "Paramahansa Yogananda",
  },
  {
    en: "The season of failure is the best time for sowing the seeds of success.",
    es: "La temporada del fracaso es el mejor momento para sembrar las semillas del éxito.",
    source: "Paramahansa Yogananda",
  },
  {
    en: "Forget the past, for it is gone from your domain! Forget the future, for it is beyond your reach! Control the present! Live supremely well now!",
    es: "¡Olvida el pasado, pues ya no está en tu dominio! ¡Olvida el futuro, pues está más allá de tu alcance! ¡Controla el presente! ¡Vive supremamente bien ahora!",
    source: "Paramahansa Yogananda",
  },
  {
    en: "You must not let your life run in the ordinary way; do something that nobody else has done, something that will dazzle the world.",
    es: "No debes dejar que tu vida transcurra de manera ordinaria; haz algo que nadie más haya hecho, algo que deslumbre al mundo.",
    source: "Paramahansa Yogananda",
  },
  {
    en: "The power of unfulfilled desires is the root of all man's slavery.",
    es: "El poder de los deseos insatisfechos es la raíz de toda esclavitud del hombre.",
    source: "Paramahansa Yogananda",
  },
] as const;

export function getDailyQuote(locale: string) {
  const day = Math.floor(Date.now() / 86_400_000);
  const quote = ENCOURAGEMENT_QUOTES[day % ENCOURAGEMENT_QUOTES.length];
  return {
    text: locale === "es" ? quote.es : quote.en,
    source: quote.source,
  };
}
