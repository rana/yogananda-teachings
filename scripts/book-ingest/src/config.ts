/**
 * Book configurations and pipeline settings
 */

import { BookConfig, PipelineConfig, GoldenPassage } from './types.js';
import path from 'path';

/** Root data directory for all book ingestions */
const DATA_ROOT = path.resolve(import.meta.dirname, '../../..', 'data/book-ingest');

/** Golden passages for Autobiography of a Yogi (English) validation.
 *  20 passages across 10 categories to catch different error classes:
 *  - Chapter openings (4): boundary errors
 *  - Sanskrit diacritics (2): diacritical stripping
 *  - Footnotes (2): marker-text pairing
 *  - Verse/poetry (2): line break preservation
 *  - Epigraph with attribution (2): quote extraction
 *  - Dialogue with em-dashes (2): speaker attribution
 *  - Photo captions (2): caption accuracy
 *  - Dates/numbers (2): numeric preservation
 *  - Key terms (1): Kriya Yoga in Ch 26
 *  - Author name (1): backward compatibility */
const AOY_GOLDEN_PASSAGES: GoldenPassage[] = [
  // Chapter opening lines — catch boundary errors
  {
    text: 'The characteristic features of Indian culture have long been a search for ultimate verities',
    chapter: 1,
    pageNumber: 42,
    source: 'Chapter 1 opening — author introduction'
  },
  {
    text: 'These inexorable words reached my inner consciousness as I sat one morning',
    chapter: 25,
    pageNumber: 448,
    source: 'Chapter 25 opening — Brother Ananta and Sister Nalini'
  },
  {
    text: '"Sir, whither are we bound this morning?"',
    chapter: 46,
    pageNumber: 845,
    source: 'Chapter 46 opening — The Woman Yogi Who Never Eats (fixed boundary)'
  },
  {
    text: 'We have indeed learned the value of meditation',
    chapter: 49,
    pageNumber: 884,
    source: 'Chapter 49 opening — The Years 1940–1951'
  },
  // Verse/poetry — line break preservation
  {
    text: 'Thus will he think, who holds the truth of truths',
    chapter: 4,
    pageNumber: 112,
    source: 'Bhagavad Gita verse in Ch 4 — verse formatting'
  },
  {
    text: 'Unborn, undying, indestructible',
    chapter: 4,
    pageNumber: 113,
    source: 'Bhagavad Gita verse continuation — multi-line verse'
  },
  // Epigraphs
  {
    text: 'To every thing there is a season, and a time to every purpose under the heaven',
    chapter: 5,
    pageNumber: 114,
    source: 'Chapter 5 epigraph — Ecclesiastes quote'
  },
  {
    text: 'wireless inventions antedated those of Marconi',
    chapter: 8,
    pageNumber: 154,
    source: 'Chapter 8 epigraph — J.C. Bose attribution'
  },
  // Dialogue with em-dashes
  {
    text: 'Father tended first to say "No" to any new proposal',
    chapter: 1,
    pageNumber: 46,
    source: 'Ch 1 dialogue — family character description'
  },
  {
    text: 'I asked my superior officer',
    chapter: 1,
    pageNumber: 50,
    source: 'Ch 1 dialogue — embedded speaker narrative'
  },
  // Photo captions
  {
    text: 'GHOSH',
    chapter: 1,
    pageNumber: 48,
    source: 'Ch 1 caption — Gurru Ghosh photo'
  },
  {
    text: 'Mother of Yoganandaji',
    chapter: 1,
    pageNumber: 48,
    source: 'Ch 1 caption — mother description'
  },
  // Dates and numbers
  {
    text: 'I was born on January 5, 1893, in Gorakhpur',
    chapter: 1,
    pageNumber: 43,
    source: 'Ch 1 birth date and location — numeric preservation'
  },
  {
    text: '1935',
    chapter: 2,
    pageNumber: 75,
    source: 'Ch 2 caption date — Calcutta photo'
  },
  // Footnote markers (verify markers survive in paragraph text)
  {
    text: 'disciple-guru¹',
    chapter: 1,
    pageNumber: 42,
    source: 'Ch 1 — footnote marker preserved in paragraph text'
  },
  {
    text: 'What is behind the darkness of closed eyes?',
    chapter: 1,
    pageNumber: 56,
    source: 'Ch 1 — childhood mystical experience (distinct prose)'
  },
  // Sanskrit/IAST terms
  {
    text: 'disciple-guru',
    chapter: 1,
    source: 'Sanskrit compound — Chapter 1'
  },
  {
    text: 'Kriya Yoga',
    chapter: 26,
    pageNumber: 459,
    source: 'Ch 26 — The Science of Kriya Yoga'
  },
  // Key term
  {
    text: 'The science of Kriya Yoga, mentioned so often in these pages',
    chapter: 26,
    pageNumber: 459,
    source: 'Ch 26 opening paragraph — key teaching reference'
  },
  // Author name — backward compatibility
  {
    text: 'Paramahansa Yogananda',
    chapter: null,
    source: 'Author name — should appear throughout'
  }
];

/** Golden passages for Autobiografía de un yogui (Spanish) validation.
 *  20 passages matching English categories for cross-language coverage. */
const AOY_ES_GOLDEN_PASSAGES: GoldenPassage[] = [
  // Chapter openings — boundary errors
  {
    text: 'La búsqueda de las verdades supremas',
    chapter: 1,
    pageNumber: 45,
    source: 'Chapter 1 opening — Spanish equivalent of EN Ch 1'
  },
  {
    text: 'Ananta ya no puede seguir viviendo',
    chapter: 25,
    pageNumber: 393,
    source: 'Chapter 25 opening — Brother Ananta'
  },
  {
    text: '¿hacia dónde nos dirigimos esta mañana?',
    chapter: 46,
    pageNumber: 727,
    source: 'Chapter 46 opening — The Woman Yogi Who Never Eats'
  },
  {
    text: 'Hemos comprendido realmente el valor de la meditación',
    chapter: 49,
    pageNumber: 758,
    source: 'Chapter 49 opening — The Years 1940–1951'
  },
  // Verse/poetry
  {
    text: 'el proceder acostumbrado de la Naturaleza',
    chapter: 4,
    pageNumber: 110,
    source: 'Bhagavad Gita verse in Ch 4 — verse formatting'
  },
  {
    text: 'no-nacido, eterno, indestructible',
    chapter: 4,
    pageNumber: 110,
    source: 'Bhagavad Gita verse continuation'
  },
  // Epigraph
  {
    text: 'Todo tiene su momento, y cada cosa su tiempo bajo el cielo',
    chapter: 5,
    source: 'Chapter 5 epigraph — Ecclesiastes (Spanish)'
  },
  // Footnote markers / distinctive prose
  {
    text: 'discípulo y su gurú',
    chapter: 1,
    pageNumber: 45,
    source: 'Ch 1 — disciple-guru with footnote marker in paragraph'
  },
  {
    text: 'Lahiri Mahasaya',
    chapter: null,
    source: 'Guru lineage name — should appear in captions and Ch 33-35'
  },
  // Dates and numbers
  {
    text: 'Gorakhpur',
    chapter: 1,
    pageNumber: 46,
    source: 'Ch 1 birthplace — geographic preservation'
  },
  // Dialogue
  {
    text: 'El señor Wright',
    chapter: 46,
    pageNumber: 727,
    source: 'Ch 46 dialogue — Mr. Wright character reference'
  },
  // Key terms (untranslated Sanskrit)
  {
    text: 'Kriya Yoga',
    chapter: 26,
    source: 'Ch 26 — La ciencia del Kriya Yoga (untranslated term)'
  },
  {
    text: 'gurú',
    chapter: 1,
    source: 'Ch 1 — guru with Spanish accent mark'
  },
  {
    text: 'Sri Yukteswar',
    chapter: null,
    source: 'Guru name — should appear in chapters 10, 12, 42, 43'
  },
  {
    text: 'Paramahansa Yogananda',
    chapter: null,
    source: 'Author name — should appear throughout'
  },
  // Caption
  {
    text: 'Madre de Yoganandaji',
    chapter: 1,
    pageNumber: 51,
    source: 'Ch 1 caption — mother of Yogananda photo'
  },
  // Additional chapter boundary checks
  {
    text: 'discípulo',
    chapter: 1,
    source: 'Ch 1 — disciple term in Spanish'
  },
  {
    text: 'Himalaya',
    chapter: 1,
    source: 'Ch 1 — geographic term preserved'
  },
  {
    text: 'Babaji',
    chapter: 33,
    source: 'Ch 33 — Babaji, Yogi-Christ of Modern India'
  },
  {
    text: 'samadhi',
    chapter: null,
    source: 'Sanskrit term — should appear untranslated throughout'
  }
];

/** Autobiography of a Yogi — English (SRF edition, ASIN B00JW44IAI) */
export const AUTOBIOGRAPHY_OF_A_YOGI: BookConfig = {
  title: 'Autobiography of a Yogi',
  author: 'Paramahansa Yogananda',
  slug: 'autobiography-of-a-yogi',
  asin: 'B00JW44IAI',
  readerUrl: 'https://read.amazon.com/?asin=B00JW44IAI',
  authorTier: 'guru',
  language: 'en',
  expectedChapters: 49,
  goldenPassages: AOY_GOLDEN_PASSAGES
};

/**
 * Autobiografía de un yogui — Spanish (SRF edition, ASIN B07G5KL5RL)
 *
 * Self-Realization Fellowship Kindle edition. ISBN 978-0876128213.
 * 811 Kindle pages, 49 chapters (matches English SRF edition structure).
 * This is the canonical SRF translation — same publisher as the English ebook.
 *
 * Note: ASIN B0FDKZ2FLN is a third-party "Editorial Recién Traducido, 2025"
 * translation — do NOT use. It has only 48 chapters and different translation.
 */
export const AUTOBIOGRAFIA_DE_UN_YOGUI: BookConfig = {
  title: 'Autobiografía de un yogui',
  author: 'Paramahansa Yogananda',
  slug: 'autobiografia-de-un-yogui',
  asin: 'B07G5KL5RL',
  readerUrl: 'https://read.amazon.com/?asin=B07G5KL5RL',
  authorTier: 'guru',
  language: 'es',
  expectedChapters: 49,
  goldenPassages: AOY_ES_GOLDEN_PASSAGES
};

/** Registry of all book configs */
export const BOOK_CONFIGS: Record<string, BookConfig> = {
  'autobiography-of-a-yogi': AUTOBIOGRAPHY_OF_A_YOGI,
  'autobiografia-de-un-yogui': AUTOBIOGRAFIA_DE_UN_YOGUI
};

/** Build pipeline config for a book */
export function getPipelineConfig(bookSlug: string): PipelineConfig {
  const book = BOOK_CONFIGS[bookSlug];
  if (!book) {
    throw new Error(`Unknown book: ${bookSlug}. Available: ${Object.keys(BOOK_CONFIGS).join(', ')}`);
  }

  return {
    book,
    capture: {
      navigationDelayMs: 300,
      maxClicksPerPage: 8,
      retryAttempts: 3,
      resumeFromPage: undefined
    },
    extraction: {
      model: 'claude-sonnet-4-20250514',
      maxConcurrent: 5,
      promptVersion: '1.0.0',
      resumeFromPage: undefined
    },
    validation: {
      spotCheckInterval: 50,
      confidenceThreshold: 3,
      goldenPassages: book.goldenPassages || []
    },
    paths: {
      dataDir: DATA_ROOT,
      bookSlug
    }
  };
}

/** Get the data directory for a specific book */
export function getBookDataDir(bookSlug: string): string {
  return path.join(DATA_ROOT, bookSlug);
}

/** Get standard paths for a book's data */
export function getBookPaths(bookSlug: string) {
  const bookDir = getBookDataDir(bookSlug);
  return {
    root: bookDir,
    captureMeta: path.join(bookDir, 'capture-meta.json'),
    pages: path.join(bookDir, 'pages'),
    extracted: path.join(bookDir, 'extracted'),
    chapters: path.join(bookDir, 'chapters'),
    assets: path.join(bookDir, 'assets'),
    qa: path.join(bookDir, 'qa'),
    captureLog: path.join(bookDir, 'capture-log.json'),
    bookManifest: path.join(bookDir, 'book.json')
  };
}
