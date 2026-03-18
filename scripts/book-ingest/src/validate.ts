#!/usr/bin/env npx tsx
/**
 * Validation Script
 *
 * Runs all validation layers against captured and extracted data:
 * Layer 1: Capture validation (file integrity)
 * Layer 2: Extraction validation (per-page quality)
 * Layer 3: Assembly validation (structural integrity)
 *
 * Usage:
 *   npx tsx src/validate.ts --book autobiography-of-a-yogi
 */

import path from 'path';
import { getBookPaths, getPipelineConfig } from './config.js';
import {
  PageExtraction, CaptureMeta, CaptureLogEntry, GoldenPassage, Chapter
} from './types.js';
import {
  readJson, writeJson, padPage, log, fileExists, getFileSize, ensureDir
} from './utils.js';

interface ValidationResult {
  layer: string;
  check: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
  pageNumber?: number;
}

function parseArgs() {
  const args = process.argv.slice(2);
  let bookSlug = 'autobiography-of-a-yogi';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--book' && args[i + 1]) {
      bookSlug = args[i + 1];
      i++;
    }
  }

  return { bookSlug };
}

/** Layer 1: Capture validation */
async function validateCapture(paths: ReturnType<typeof getBookPaths>, totalPages: number): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];

  // Check capture log exists
  if (!await fileExists(paths.captureLog)) {
    results.push({ layer: 'capture', check: 'capture-log', status: 'fail', message: 'No capture log found' });
    return results;
  }

  const captureLog = await readJson<CaptureLogEntry[]>(paths.captureLog);

  // Check page count
  if (captureLog.length < totalPages) {
    results.push({
      layer: 'capture', check: 'page-count', status: 'warn',
      message: `Only ${captureLog.length} of ${totalPages} pages captured`
    });
  } else {
    results.push({
      layer: 'capture', check: 'page-count', status: 'pass',
      message: `All ${totalPages} pages captured`
    });
  }

  // Check for gaps
  const capturedPages = new Set(captureLog.map(e => e.pageNumber));
  const gaps: number[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (!capturedPages.has(p)) gaps.push(p);
  }
  if (gaps.length > 0) {
    results.push({
      layer: 'capture', check: 'no-gaps', status: 'fail',
      message: `Missing pages: ${gaps.slice(0, 20).join(', ')}${gaps.length > 20 ? '...' : ''}`
    });
  } else if (capturedPages.size >= totalPages) {
    results.push({
      layer: 'capture', check: 'no-gaps', status: 'pass',
      message: 'No page gaps detected'
    });
  }

  // Check for duplicates (same hash)
  const hashCount = new Map<string, number[]>();
  for (const entry of captureLog) {
    const pages = hashCount.get(entry.imageHash) || [];
    pages.push(entry.pageNumber);
    hashCount.set(entry.imageHash, pages);
  }
  const dupes = Array.from(hashCount.entries()).filter(([, pages]) => pages.length > 1);
  if (dupes.length > 0) {
    for (const [hash, pages] of dupes) {
      results.push({
        layer: 'capture', check: 'no-duplicates', status: 'warn',
        message: `Duplicate image hash across pages: ${pages.join(', ')}`
      });
    }
  }

  // Check file sizes
  for (const entry of captureLog) {
    if (entry.fileSize < 5000) {
      results.push({
        layer: 'capture', check: 'file-size', status: 'warn',
        message: `Page ${entry.pageNumber}: suspiciously small (${entry.fileSize} bytes)`,
        pageNumber: entry.pageNumber
      });
    }
  }

  return results;
}

/** Layer 2: Extraction validation */
async function validateExtraction(paths: ReturnType<typeof getBookPaths>, totalPages: number): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  let extractedCount = 0;
  let lowConfidence = 0;
  let flaggedCount = 0;

  for (let p = 1; p <= totalPages; p++) {
    const extractedPath = path.join(paths.extracted, `page-${padPage(p)}.json`);
    if (!await fileExists(extractedPath)) continue;

    extractedCount++;

    try {
      const extraction = await readJson<PageExtraction>(extractedPath);

      // Page number agreement
      if (extraction.pageNumber !== p) {
        results.push({
          layer: 'extraction', check: 'page-number', status: 'warn',
          message: `Page ${p}: extraction says page ${extraction.pageNumber}`,
          pageNumber: p
        });
      }

      // Confidence check
      if (extraction.validation.confidence <= 3) {
        lowConfidence++;
        results.push({
          layer: 'extraction', check: 'confidence', status: 'warn',
          message: `Page ${p}: low confidence (${extraction.validation.confidence})`,
          pageNumber: p
        });
      }

      // Flagged for review
      if (extraction.validation.needsHumanReview) {
        flaggedCount++;
      }

      // Non-empty content for text pages
      if (['body', 'chapter-start'].includes(extraction.pageType)) {
        const textContent = extraction.content.filter(c =>
          ['paragraph', 'heading', 'verse', 'epigraph'].includes(c.type)
        );
        if (textContent.length === 0) {
          results.push({
            layer: 'extraction', check: 'non-empty', status: 'warn',
            message: `Page ${p}: ${extraction.pageType} page has no text content`,
            pageNumber: p
          });
        }
      }

      // Check for any flags
      for (const flag of extraction.validation.flags) {
        results.push({
          layer: 'extraction', check: 'flag', status: 'warn',
          message: `Page ${p}: ${flag}`,
          pageNumber: p
        });
      }

    } catch (err) {
      results.push({
        layer: 'extraction', check: 'parse', status: 'fail',
        message: `Page ${p}: failed to parse extraction: ${err}`,
        pageNumber: p
      });
    }
  }

  results.push({
    layer: 'extraction', check: 'coverage', status: extractedCount >= totalPages ? 'pass' : 'warn',
    message: `${extractedCount} of ${totalPages} pages extracted`
  });

  results.push({
    layer: 'extraction', check: 'confidence-summary', status: lowConfidence > totalPages * 0.1 ? 'warn' : 'pass',
    message: `${lowConfidence} pages with low confidence (≤3), ${flaggedCount} flagged for review`
  });

  return results;
}

/** Layer 3: Assembly validation */
async function validateAssembly(
  paths: ReturnType<typeof getBookPaths>,
  captureMeta: CaptureMeta,
  goldenPassages: GoldenPassage[]
): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];

  // Check book manifest exists
  if (!await fileExists(paths.bookManifest)) {
    results.push({
      layer: 'assembly', check: 'manifest', status: 'fail',
      message: 'No book manifest (book.json) found'
    });
    return results;
  }

  const manifest = await readJson<any>(paths.bookManifest);

  // Chapter count
  const expectedChapters = captureMeta.toc.filter(e => e.type === 'chapter').length;
  const actualChapters = manifest.structure?.chapters?.length ?? 0;
  if (actualChapters !== expectedChapters) {
    results.push({
      layer: 'assembly', check: 'chapter-count', status: 'warn',
      message: `Expected ${expectedChapters} chapters, found ${actualChapters}`
    });
  } else {
    results.push({
      layer: 'assembly', check: 'chapter-count', status: 'pass',
      message: `All ${expectedChapters} chapters present`
    });
  }

  // Golden passage verification
  if (goldenPassages.length > 0) {
    // Load all chapter files and build full text
    let fullText = '';
    const chapterFiles = manifest.structure?.chapters ?? [];
    for (const ch of chapterFiles) {
      const chapterPath = path.join(paths.root, ch.dataFile);
      if (await fileExists(chapterPath)) {
        const chapter = await readJson<Chapter>(chapterPath);
        for (const section of chapter.sections) {
          for (const para of section.paragraphs) {
            fullText += para.text + '\n';
          }
        }
      }
    }

    let passed = 0;
    for (const gp of goldenPassages) {
      if (fullText.includes(gp.text)) {
        passed++;
        results.push({
          layer: 'assembly', check: 'golden-passage', status: 'pass',
          message: `Found: "${gp.text.substring(0, 60)}..."`
        });
      } else {
        results.push({
          layer: 'assembly', check: 'golden-passage', status: 'fail',
          message: `Missing: "${gp.text.substring(0, 60)}..." (source: ${gp.source})`
        });
      }
    }

    results.push({
      layer: 'assembly', check: 'golden-summary', status: passed === goldenPassages.length ? 'pass' : 'warn',
      message: `${passed}/${goldenPassages.length} golden passages found`
    });
  }

  return results;
}

/** Layer 4: Structural checks (chapter boundaries, mid-sentence starts) */
async function validateStructure(
  paths: ReturnType<typeof getBookPaths>,
  manifest: any,
): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  const wordCounts: number[] = [];

  const chapterFiles = manifest.structure?.chapters ?? [];
  for (const ch of chapterFiles) {
    const chapterPath = path.join(paths.root, ch.dataFile);
    if (!await fileExists(chapterPath)) continue;

    const chapter = await readJson<Chapter>(chapterPath);
    const firstPara = chapter.sections?.[0]?.paragraphs?.[0];
    wordCounts.push(chapter.metadata.wordCount);

    if (!firstPara) {
      results.push({
        layer: 'structure', check: 'non-empty-chapter', status: 'fail',
        message: `Ch ${chapter.chapterNumber}: no paragraphs`
      });
      continue;
    }

    // Check: first paragraph starts lowercase (likely mid-sentence)
    if (/^[a-z]/.test(firstPara.text)) {
      results.push({
        layer: 'structure', check: 'chapter-opening', status: 'fail',
        message: `Ch ${chapter.chapterNumber}: starts lowercase — likely mid-sentence: "${firstPara.text.substring(0, 60)}..."`
      });
    }

    // Check: missing title
    if (!chapter.title) {
      results.push({
        layer: 'structure', check: 'chapter-title', status: 'warn',
        message: `Ch ${chapter.chapterNumber}: missing title`
      });
    }
  }

  // Check: word count outliers (>3x median)
  if (wordCounts.length > 2) {
    const sorted = [...wordCounts].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    for (let i = 0; i < chapterFiles.length; i++) {
      if (wordCounts[i] > median * 3) {
        results.push({
          layer: 'structure', check: 'word-count-outlier', status: 'warn',
          message: `Ch ${chapterFiles[i].number}: ${wordCounts[i]} words (median: ${median}, >3x)`
        });
      }
      if (wordCounts[i] < median * 0.1 && wordCounts[i] > 0) {
        results.push({
          layer: 'structure', check: 'word-count-outlier', status: 'warn',
          message: `Ch ${chapterFiles[i].number}: ${wordCounts[i]} words (median: ${median}, <10%)`
        });
      }
    }
  }

  if (results.length === 0) {
    results.push({
      layer: 'structure', check: 'all-chapters', status: 'pass',
      message: `All ${chapterFiles.length} chapters have valid structure`
    });
  }

  return results;
}

/** Main validation */
async function runValidation(bookSlug: string): Promise<void> {
  const config = getPipelineConfig(bookSlug);
  const paths = getBookPaths(bookSlug);

  const captureMeta = await readJson<CaptureMeta>(paths.captureMeta);
  const totalPages = captureMeta.book.totalPages;

  log.info(`Running validation for "${captureMeta.book.title}" (${totalPages} pages)`);

  const allResults: ValidationResult[] = [];

  // Layer 1: Capture
  log.info('Layer 1: Capture validation...');
  const captureResults = await validateCapture(paths, totalPages);
  allResults.push(...captureResults);

  // Layer 2: Extraction
  log.info('Layer 2: Extraction validation...');
  const extractionResults = await validateExtraction(paths, totalPages);
  allResults.push(...extractionResults);

  // Layer 3: Assembly
  log.info('Layer 3: Assembly validation...');
  const assemblyResults = await validateAssembly(paths, captureMeta, config.book.goldenPassages || []);
  allResults.push(...assemblyResults);

  // Layer 4: Structural checks
  log.info('Layer 4: Structural validation...');
  if (await fileExists(paths.bookManifest)) {
    const manifest = await readJson<any>(paths.bookManifest);
    const structureResults = await validateStructure(paths, manifest);
    allResults.push(...structureResults);
  }

  // Summary
  const passes = allResults.filter(r => r.status === 'pass').length;
  const warns = allResults.filter(r => r.status === 'warn').length;
  const fails = allResults.filter(r => r.status === 'fail').length;

  log.info('');
  log.info('=== Validation Summary ===');
  log.info(`✓ Pass: ${passes}`);
  log.info(`⚠ Warn: ${warns}`);
  log.info(`✗ Fail: ${fails}`);
  log.info('');

  // Print warnings and failures
  for (const r of allResults.filter(r => r.status !== 'pass')) {
    const icon = r.status === 'warn' ? '⚠' : '✗';
    log.info(`${icon} [${r.layer}/${r.check}] ${r.message}`);
  }

  // Save validation report
  await ensureDir(paths.qa);
  await writeJson(path.join(paths.qa, 'validation-report.json'), {
    timestamp: new Date().toISOString(),
    bookSlug,
    summary: { passes, warns, fails },
    results: allResults
  });

  log.info(`\nValidation report saved to ${path.join(paths.qa, 'validation-report.json')}`);
}

// Run if called directly
const { bookSlug } = parseArgs();
runValidation(bookSlug).catch(err => {
  log.error('Validation failed:', err);
  process.exit(1);
});
