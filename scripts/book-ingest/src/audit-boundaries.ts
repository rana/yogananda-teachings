#!/usr/bin/env npx tsx
/**
 * Chapter Boundary Audit & Fix
 *
 * Cross-references extraction-detected chapter headings against TOC page numbers.
 * The extraction is ground truth (Claude Vision reads the actual page content).
 * The TOC comes from Kindle Cloud Reader navigation, which can be offset for
 * reflowable books (screen numbers don't always align with TOC positions).
 *
 * Usage:
 *   npx tsx src/audit-boundaries.ts --book autobiography-of-a-yogi
 *   npx tsx src/audit-boundaries.ts --book autobiography-of-a-yogi --fix
 *
 * --fix: Update capture-meta.json TOC with extraction-detected page numbers
 */

import fs from 'fs/promises';
import path from 'path';
import { getBookPaths } from './config.js';
import { PageExtraction, CaptureMeta } from './types.js';
import { readJson, writeJson, padPage, log } from './utils.js';

interface ChapterAnchor {
  chapterNumber: number;
  chapterTitle: string;
  extractionPage: number;
  tocPage: number | null;
  delta: number | null;
  firstContentText: string;
  startsLowercase: boolean;
  hasContinuation: boolean;
}

function parseArgs() {
  const args = process.argv.slice(2);
  let bookSlug = 'autobiography-of-a-yogi';
  let fix = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--book' && args[i + 1]) {
      bookSlug = args[i + 1];
      i++;
    }
    if (args[i] === '--fix') fix = true;
  }

  return { bookSlug, fix };
}

async function scanExtractionAnchors(
  extractedDir: string,
  totalPages: number,
): Promise<Map<number, ChapterAnchor>> {
  const anchors = new Map<number, ChapterAnchor>();

  for (let p = 1; p <= totalPages; p++) {
    const filePath = path.join(extractedDir, `page-${padPage(p)}.json`);
    try {
      await fs.access(filePath);
    } catch {
      continue;
    }

    const extraction = await readJson<PageExtraction>(filePath);
    if (!extraction.chapterNumber || extraction.chapterNumber < 1) continue;

    // Find the first non-structural content block
    let firstText = '';
    let startsLowercase = false;
    let hasContinuation = false;
    for (const block of extraction.content) {
      if (['chapter-label', 'heading', 'subheading', 'running-header', 'page-number', 'decorative'].includes(block.type)) continue;
      firstText = block.text.substring(0, 80);
      startsLowercase = /^[a-z]/.test(block.text);
      hasContinuation = !!block.continuedFromPreviousPage;
      break;
    }

    anchors.set(extraction.chapterNumber, {
      chapterNumber: extraction.chapterNumber,
      chapterTitle: extraction.chapterTitle || '',
      extractionPage: p,
      tocPage: null,
      delta: null,
      firstContentText: firstText,
      startsLowercase,
      hasContinuation,
    });
  }

  return anchors;
}

async function run() {
  const { bookSlug, fix } = parseArgs();
  const paths = getBookPaths(bookSlug);

  const captureMeta = await readJson<CaptureMeta>(paths.captureMeta);
  const totalPages = captureMeta.book.totalPages;

  log.info(`Auditing chapter boundaries for "${captureMeta.book.title}" (${totalPages} pages)`);

  // Step 1: Scan extraction anchors
  const anchors = await scanExtractionAnchors(paths.extracted, totalPages);
  log.info(`Found ${anchors.size} chapter headings in extractions`);

  // Step 2: Map TOC entries
  const tocChapters = captureMeta.toc.filter(e => e.type === 'chapter' && e.chapterNumber);
  for (const tocEntry of tocChapters) {
    const anchor = anchors.get(tocEntry.chapterNumber!);
    if (anchor) {
      anchor.tocPage = tocEntry.pageNumber;
      anchor.delta = (tocEntry.pageNumber ?? 0) - anchor.extractionPage;
    }
  }

  // Step 3: Report
  let mismatches = 0;
  let warnings = 0;

  console.log('\n  Ch | Extraction | TOC    | Delta | Status');
  console.log('  ---|-----------|--------|-------|-------');

  for (let ch = 1; ch <= (captureMeta.book.totalPages > 0 ? 49 : 0); ch++) {
    const anchor = anchors.get(ch);
    if (!anchor) {
      console.log(`  ${String(ch).padStart(2)} |    ???    |  ???   |   ?   | MISSING - no extraction anchor`);
      mismatches++;
      continue;
    }

    const status = anchor.delta === 0 ? 'OK' : `MISMATCH`;
    if (anchor.delta !== 0) {
      console.log(`  ${String(ch).padStart(2)} | ${String(anchor.extractionPage).padStart(9)} | ${String(anchor.tocPage).padStart(6)} | ${String(anchor.delta).padStart(5)} | ${status}`);
      mismatches++;
    }
  }

  // Step 4: Check assembled chapters for structural issues
  console.log('\n--- Structural checks on assembled chapters ---\n');

  const chapterFiles = (await fs.readdir(paths.chapters)).filter(f => f.endsWith('.json') && !f.startsWith('00'));
  for (const file of chapterFiles.sort()) {
    const chapter = await readJson<any>(path.join(paths.chapters, file));
    const firstPara = chapter.sections?.[0]?.paragraphs?.[0];
    if (!firstPara) continue;

    const issues: string[] = [];

    // Check: first paragraph starts lowercase (likely mid-sentence)
    if (/^[a-z]/.test(firstPara.text)) {
      issues.push(`starts lowercase: "${firstPara.text.substring(0, 60)}..."`);
    }

    // Check: first paragraph is a sentence fragment (no period in first 100 chars starting mid-word)
    if (firstPara.text.startsWith('"') === false && /^[a-z]/.test(firstPara.text)) {
      issues.push('likely mid-sentence fragment');
    }

    // Check: chapter has no heading (section heading is null AND no title match)
    if (!chapter.title) {
      issues.push('missing chapter title');
    }

    if (issues.length > 0) {
      console.log(`  Ch ${chapter.chapterNumber}: ${issues.join('; ')}`);
      warnings++;
    }
  }

  // Summary
  console.log(`\n--- Summary ---`);
  console.log(`  Total chapters: ${anchors.size}`);
  console.log(`  TOC mismatches: ${mismatches}`);
  console.log(`  Structural warnings: ${warnings}`);
  console.log(`  Matching: ${anchors.size - mismatches}/${anchors.size}`);

  // Step 5: Fix if requested
  if (fix && mismatches > 0) {
    log.info('\n--fix: Updating capture-meta.json TOC with extraction-detected page numbers');

    // Backup original
    const backupPath = paths.captureMeta.replace('.json', '-pre-audit.json');
    await writeJson(backupPath, captureMeta);
    log.info(`Backed up to ${backupPath}`);

    // Update TOC entries
    let fixed = 0;
    for (const tocEntry of captureMeta.toc) {
      if (tocEntry.type !== 'chapter' || !tocEntry.chapterNumber) continue;
      const anchor = anchors.get(tocEntry.chapterNumber);
      if (anchor && anchor.delta !== 0) {
        log.info(`  Ch ${tocEntry.chapterNumber}: ${tocEntry.pageNumber} → ${anchor.extractionPage} (delta: ${anchor.delta})`);
        tocEntry.pageNumber = anchor.extractionPage;
        fixed++;
      }
    }

    await writeJson(paths.captureMeta, captureMeta);
    log.info(`Updated ${fixed} TOC entries in capture-meta.json`);
    log.info('Run assemble.ts to rebuild chapter files with corrected boundaries');
  } else if (fix && mismatches === 0) {
    log.info('No mismatches found — nothing to fix');
  }

  // Write anchors file for provenance
  const anchorsPath = path.join(path.dirname(paths.captureMeta), 'chapter-anchors.json');
  const anchorsArray = Array.from(anchors.values()).sort((a, b) => a.chapterNumber - b.chapterNumber);
  await writeJson(anchorsPath, anchorsArray);
  log.info(`Chapter anchors written to ${anchorsPath}`);

  process.exit(mismatches > 0 && !fix ? 1 : 0);
}

run().catch(err => {
  log.error('Audit failed:', err);
  process.exit(1);
});
