/**
 * Book Ingestion Pipeline — Type Definitions
 *
 * These types define the data structures for the entire pipeline:
 * capture → extract → assemble → validate → QA
 */

/** Book-level configuration for ingestion */
export interface BookConfig {
  title: string;
  author: string;
  slug: string;
  asin: string;
  readerUrl: string;
  authorTier: 'guru' | 'president' | 'monastic';
  language: string;
  expectedChapters?: number;
  goldenPassages?: GoldenPassage[];
}

/** A known passage for validation */
export interface GoldenPassage {
  text: string;
  chapter: number | null;
  pageNumber?: number;
  source: string;
}

/** TOC entry from the reader */
export interface TocEntry {
  index: number;
  title: string;
  chapterNumber?: number;
  pageNumber: number | null;
  readerLocation: number;
  type: 'front-matter' | 'chapter' | 'back-matter' | 'appendix';
}

/** Page types detected during extraction */
export type PageType =
  | 'title-page'
  | 'copyright'
  | 'dedication'
  | 'toc'
  | 'illustrations-list'
  | 'foreword'
  | 'preface'
  | 'introduction'
  | 'chapter-start'
  | 'body'
  | 'photograph'
  | 'illustration'
  | 'glossary'
  | 'index'
  | 'blank'
  | 'back-matter'
  | 'other';

/** Text formatting span */
export interface FormattingSpan {
  start: number;
  end: number;
  style: 'normal' | 'italic' | 'bold' | 'bold-italic' | 'small-caps' | 'superscript';
}

/** Content block within a page */
export interface ContentBlock {
  type: 'heading' | 'subheading' | 'chapter-label' | 'paragraph' | 'epigraph'
    | 'verse' | 'footnote' | 'footnote-ref' | 'caption' | 'running-header'
    | 'page-number' | 'decorative' | 'publisher-info';
  text: string;
  formatting: FormattingSpan[];
  continuedFromPreviousPage?: boolean;
  continuesOnNextPage?: boolean;
}

/** Image detected on a page */
export interface DetectedImage {
  description: string;
  caption?: string;
  position: string;
  boundingBox?: { x: number; y: number; width: number; height: number };
  isPhotograph: boolean;
  isIllustration: boolean;
  isDecorative: boolean;
  isLogo: boolean;
}

/** Per-page extraction result */
export interface PageExtraction {
  pageNumber: number;
  readerLocation?: number;
  pageType: PageType;
  chapterNumber?: number;
  chapterTitle?: string;
  content: ContentBlock[];
  images: DetectedImage[];
  metadata: {
    hasFootnotes: boolean;
    hasSanskrit: boolean;
    sanskritTerms: string[];
    hasPoetry: boolean;
    hasItalics: boolean;
    isChapterStart: boolean;
    isChapterEnd: boolean;
    runningHeader?: string;
    continuedFromPrevious: boolean;
    continuesOnNext: boolean;
  };
  validation: PageValidation;
}

/** Validation data for a single page */
export interface PageValidation {
  confidence: 1 | 2 | 3 | 4 | 5;
  pageNumberAgreement: boolean;
  flags: string[];
  needsHumanReview: boolean;
  reviewedBy?: 'auto' | 'human';
  reviewNotes?: string;
}

/** Assembled chapter */
export interface Chapter {
  chapterNumber: number;
  title: string;
  slug: string;
  pageRange: { start: number; end: number };
  epigraph?: ContentBlock;
  /** Extracted epigraph text for database storage */
  epigraphText?: string;
  /** Extracted epigraph attribution (e.g., "— Bhagavad Gita") */
  epigraphAttribution?: string;
  sections: ChapterSection[];
  images: ChapterImage[];
  footnotes: Footnote[];
  metadata: {
    wordCount: number;
    paragraphCount: number;
    imageCount: number;
    sanskritTerms: string[];
    namedEntities: string[];
  };
}

export interface ChapterSection {
  heading: string | null;
  paragraphs: ChapterParagraph[];
}

/** Content type vocabulary — closed loop with the design system.
 *  Same word flows: extraction → assembly → database → HTML data attribute → CSS selector */
export type ContentType = 'prose' | 'verse' | 'epigraph' | 'dialogue' | 'caption';

export interface ChapterParagraph {
  text: string;
  pageNumber: number;
  formatting: FormattingSpan[];
  sequenceInChapter: number;
  /** Content type from extraction — determines visual treatment */
  contentType: ContentType;
  /** Section index within chapter — changes trigger scene breaks */
  sectionIndex: number;
}

export interface ChapterImage {
  assetPath: string;
  description: string;
  caption?: string;
  pageNumber: number;
}

export interface Footnote {
  marker: string;
  text: string;
  pageNumber: number;
}

/** Capture log entry */
export interface CaptureLogEntry {
  pageNumber: number;
  capturedAt: string;
  filePath: string;
  fileSize: number;
  footerText: string;
  imageHash: string;
}

/** Capture metadata file */
export interface CaptureMeta {
  book: {
    title: string;
    author: string;
    publisher: string;
    asin: string;
    readerUrl: string;
    totalPages: number;
    readerLocationMax: number;
    language: string;
    authorTier: string;
  };
  toc: TocEntry[];
  capture: {
    capturedAt: string;
    imageResolution: { width: number; height: number };
    captureMethod: string;
    tocCollectionMethod: string;
    notes: string;
  };
}

/** Pipeline configuration */
export interface PipelineConfig {
  book: BookConfig;
  capture: {
    navigationDelayMs: number;
    maxClicksPerPage: number;
    retryAttempts: number;
    resumeFromPage?: number;
  };
  extraction: {
    model: string;
    maxConcurrent: number;
    promptVersion: string;
    resumeFromPage?: number;
  };
  validation: {
    spotCheckInterval: number;
    confidenceThreshold: number;
    goldenPassages: GoldenPassage[];
  };
  paths: {
    dataDir: string;
    bookSlug: string;
  };
}
