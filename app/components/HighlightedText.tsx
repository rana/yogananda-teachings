/**
 * HighlightedText — highlight matching query terms in passage text.
 *
 * Splits text by query words and wraps matches in <mark> with gold accent.
 * Safe from regex injection — all user input is escaped.
 * Used in search results, passage pages, and anywhere search context
 * needs visual emphasis.
 */

interface HighlightedTextProps {
  /** The full text to display */
  text: string;
  /** The search query — individual words are highlighted */
  query: string;
}

export function HighlightedText({ text, query }: HighlightedTextProps) {
  if (!query.trim()) return <>{text}</>;

  const words = query
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 1);
  if (words.length === 0) return <>{text}</>;

  // Escape regex special characters
  const escaped = words.map((w) =>
    w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  const pattern = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, i) =>
        // With a single capture group, odd indices are matches
        i % 2 === 1 ? (
          <mark
            key={i}
            className="bg-srf-gold/15 text-inherit rounded-sm"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}
