#!/usr/bin/env node
/**
 * build-content-index.mjs
 *
 * Reads chapters/ directory and emits build/content-index.json plus a printed WARNINGS report.
 * Imports shared maps from scripts/lib/procedure-map.mjs; does not duplicate them.
 *
 * For each chapter directory, records:
 * - chapter id + topic
 * - question count two ways: (a) count of <summary>Answer</summary> blocks,
 *   (b) highest declared question number; flags mismatches, duplicates, non-sequential
 * - procedure inventory: every procedure with ## P.G./A.G. NNN-NN heading (label "body"),
 *   and every procedure appearing only in notice or cross-ref (label "notice-only"/"ref-only")
 * - update notices: procedure, date, flag if placeholder boilerplate, flag if multiple notices
 *
 * Builds global glossary: every acronym defined in any key-terms.md with expansion;
 * flags terms defined two different ways across files.
 *
 * Prints WARNINGS section. Does NOT edit chapters or fix anything.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { countQuestions } from './lib/procedure-map.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CHAPTERS_DIR = path.join(__dirname, '..', 'chapters');
const BUILD_DIR = path.join(__dirname, '..', 'build');

// Placeholder boilerplate patterns that indicate incomplete update text
const PLACEHOLDER_PATTERNS = [
  /Review the latest Patrol Guide/i,
  /Review the latest/i,
  /See the latest/i,
  /Refer to the latest/i,
  /Check current/i,
  /updated procedures/i,
  /latest version/i,
];

function isPlaceholder(text) {
  return PLACEHOLDER_PATTERNS.some(pattern => pattern.test(text));
}

/**
 * Extract procedure number from heading like "## P.G. 202-18" or "## A.G. 320-04"
 */
function extractProcedureFromHeading(line) {
  const match = line.match(/^#{2,4}\s+(P\.G\.|A\.G\.)\s*(\d+-\d+)/i);
  if (match) {
    return `${match[1].toUpperCase()}. ${match[2]}`;
  }
  return null;
}

/**
 * Find all procedure references in content (P.G. or A.G. followed by NNN-NN)
 */
function findAllProcedureRefs(content) {
  const refs = new Set();
  const pattern = /\b(P\.G\.|A\.G\.)\s*(\d+-\d+)/gi;
  let match;
  while ((match = pattern.exec(content)) !== null) {
    refs.add(`${match[1].toUpperCase()}. ${match[2]}`);
  }
  return refs;
}

/**
 * Extract update notices from content
 * Format: > 📅 **UPDATE NNN-NN:** **Date** — Text
 */
function extractUpdateNotices(content, filename) {
  const notices = [];
  const noticePattern = />\s*📅\s*\*\*UPDATE\s+([\d-]+):\*\*\s*\*\*([^*]+)\*\*\s*—\s*(.+?)(?=\n>|\n\n|$)/gs;
  let match;
  while ((match = noticePattern.exec(content)) !== null) {
    const procNum = match[1];
    const dateStr = match[2].trim();
    const text = match[3].trim();
    notices.push({
      procedure: `P.G. ${procNum}`,
      date: dateStr,
      text: text,
      isPlaceholder: isPlaceholder(text),
      sectionFile: filename,
    });
  }
  return notices;
}

/**
 * Parse key-terms.md and extract acronym definitions
 */
function extractKeyTerms(content, chapterId) {
  const terms = [];
  // Match table rows like | **ACRONYM** | Definition text |
  const rowPattern = /^\|\s*\*\*([^*]+)\*\*\s*\|\s*([^|]+)\|/gm;
  let match;
  while ((match = rowPattern.exec(content)) !== null) {
    const term = match[1].trim();
    const definition = match[2].trim();
    // Skip if definition is too short or looks like a header
    if (definition.length < 5 || definition.startsWith('---')) continue;
    terms.push({
      term,
      definition,
      chapterId,
      isAcronym: /^[A-Z]{2,}$/.test(term) || /[A-Z]{2,}/.test(term),
    });
  }
  return terms;
}

/**
 * Analyze a single chapter directory
 */
function analyzeChapter(chapterDir, chapterId) {
  const result = {
    chapterId,
    topic: chapterId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    questionCounts: {
      fromAnswerBlocks: 0,
      maxDeclaredNumber: 0,
      declaredCount: 0,
      missingNumbers: [],
      duplicates: [],
      consistent: true,
    },
    procedures: {
      body: [],
      'notice-only': [],
      'ref-only': [],
    },
    updateNotices: [],
  };

  const reviewQuestionsPath = path.join(chapterDir, 'review-questions.md');
  const keyTermsPath = path.join(chapterDir, 'key-terms.md');

  // Count questions from review-questions.md
  if (fs.existsSync(reviewQuestionsPath)) {
    const reviewContent = fs.readFileSync(reviewQuestionsPath, 'utf-8');
    const qResult = countQuestions(reviewContent);
    result.questionCounts.fromAnswerBlocks = qResult.count;
    result.questionCounts.maxDeclaredNumber = qResult.maxNumber;
    result.questionCounts.declaredCount = qResult.declared;
    result.questionCounts.missingNumbers = qResult.missingNumbers;
    result.questionCounts.duplicates = qResult.duplicates;
    result.questionCounts.consistent = qResult.consistent;
  }

  // Extract key terms for glossary
  let keyTerms = [];
  if (fs.existsSync(keyTermsPath)) {
    const keyTermsContent = fs.readFileSync(keyTermsPath, 'utf-8');
    keyTerms = extractKeyTerms(keyTermsContent, chapterId);
  }

  // Scan all section files for procedures and notices
  const sectionFiles = fs.readdirSync(chapterDir)
    .filter(f => f.startsWith('section-') && f.endsWith('.md'));

  const allProcedureRefs = new Set();
  const proceduresWithHeadings = new Set();

  for (const sectionFile of sectionFiles) {
    const sectionPath = path.join(chapterDir, sectionFile);
    const content = fs.readFileSync(sectionPath, 'utf-8');
    const lines = content.split('\n');

    // Find procedures with actual headings (## P.G. NNN-NN)
    for (const line of lines) {
      const procNum = extractProcedureFromHeading(line);
      if (procNum) {
        proceduresWithHeadings.add(procNum);
        if (!result.procedures.body.includes(procNum)) {
          result.procedures.body.push(procNum);
        }
      }
    }

    // Extract update notices
    const notices = extractUpdateNotices(content, sectionFile);
    result.updateNotices.push(...notices);

    // Find all procedure references
    const refs = findAllProcedureRefs(content);
    refs.forEach(ref => allProcedureRefs.add(ref));
  }

  // Categorize procedures: body vs notice-only vs ref-only
  const noticeProcs = new Set(result.updateNotices.map(n => n.procedure));

  for (const ref of allProcedureRefs) {
    if (!proceduresWithHeadings.has(ref)) {
      if (noticeProcs.has(ref)) {
        if (!result.procedures['notice-only'].includes(ref)) {
          result.procedures['notice-only'].push(ref);
        }
      } else {
        if (!result.procedures['ref-only'].includes(ref)) {
          result.procedures['ref-only'].push(ref);
        }
      }
    }
  }

  return { chapterData: result, keyTerms };
}

/**
 * Main function
 */
function main() {
  const warnings = [];
  const chapterIndex = [];
  const globalGlossary = new Map(); // term -> [{definition, chapterId}]
  const allKeyTerms = [];

  // Get all chapter directories
  const chapterDirs = fs.readdirSync(CHAPTERS_DIR)
    .filter(d => {
      const dirPath = path.join(CHAPTERS_DIR, d);
      return fs.statSync(dirPath).isDirectory() && !d.startsWith('.');
    })
    .sort();

  // Analyze each chapter
  for (const chapterDirName of chapterDirs) {
    const chapterDir = path.join(CHAPTERS_DIR, chapterDirName);
    const { chapterData, keyTerms } = analyzeChapter(chapterDir, chapterDirName);
    chapterIndex.push(chapterData);
    allKeyTerms.push(...keyTerms);
  }

  // Build global glossary and find divergent definitions
  for (const kt of allKeyTerms) {
    if (!globalGlossary.has(kt.term)) {
      globalGlossary.set(kt.term, []);
    }
    globalGlossary.get(kt.term).push({
      definition: kt.definition,
      chapterId: kt.chapterId,
    });
  }

  // Find divergent glossary terms (same term, different definitions)
  const divergentTerms = [];
  for (const [term, entries] of globalGlossary.entries()) {
    if (entries.length > 1) {
      const uniqueDefs = new Set(entries.map(e => e.definition.toLowerCase().trim()));
      if (uniqueDefs.size > 1) {
        divergentTerms.push({
          term,
          definitions: entries.map(e => ({ chapterId: e.chapterId, definition: e.definition })),
        });
      }
    }
  }

  // Collect warnings
  let questionMismatches = 0;
  let noticeOnlyProcs = 0;
  let refOnlyProcs = 0;
  let placeholderNotices = 0;
  let duplicateNotices = 0;

  for (const chapter of chapterIndex) {
    // Question count mismatches
    if (!chapter.questionCounts.consistent) {
      questionMismatches++;
      if (chapter.questionCounts.missingNumbers.length > 0) {
        warnings.push(`[${chapter.chapterId}] Missing question numbers: ${chapter.questionCounts.missingNumbers.join(', ')}`);
      }
      if (chapter.questionCounts.duplicates.length > 0) {
        warnings.push(`[${chapter.chapterId}] Duplicate question numbers: ${chapter.questionCounts.duplicates.join(', ')}`);
      }
      if (chapter.questionCounts.fromAnswerBlocks !== chapter.questionCounts.declaredCount) {
        warnings.push(`[${chapter.chapterId}] Answer block count (${chapter.questionCounts.fromAnswerBlocks}) != declared count (${chapter.questionCounts.declaredCount})`);
      }
    }

    // Notice-only procedures
    if (chapter.procedures['notice-only'].length > 0) {
      noticeOnlyProcs += chapter.procedures['notice-only'].length;
      warnings.push(`[${chapter.chapterId}] Notice-only procedures (no body): ${chapter.procedures['notice-only'].join(', ')}`);
    }

    // Ref-only procedures
    if (chapter.procedures['ref-only'].length > 0) {
      refOnlyProcs += chapter.procedures['ref-only'].length;
      warnings.push(`[${chapter.chapterId}] Reference-only procedures: ${chapter.procedures['ref-only'].join(', ')}`);
    }

    // Placeholder notices
    for (const notice of chapter.updateNotices) {
      if (notice.isPlaceholder) {
        placeholderNotices++;
        warnings.push(`[${chapter.chapterId}] Placeholder notice for ${notice.procedure}: "${notice.text.substring(0, 60)}..."`);
      }
    }
  }

  // Duplicate notices (same procedure, multiple update notices)
  const procNoticeCount = new Map();
  for (const chapter of chapterIndex) {
    for (const notice of chapter.updateNotices) {
      const key = notice.procedure;
      procNoticeCount.set(key, (procNoticeCount.get(key) || 0) + 1);
    }
  }
  for (const [proc, count] of procNoticeCount.entries()) {
    if (count > 1) {
      duplicateNotices++;
      warnings.push(`[GLOBAL] Duplicate update notices for ${proc}: ${count} notices found`);
    }
  }

  // Divergent glossary terms
  for (const dt of divergentTerms) {
    warnings.push(`[GLOSSARY] Divergent definition for "${dt.term}":`);
    for (const def of dt.definitions) {
      warnings.push(`  - ${def.chapterId}: "${def.definition.substring(0, 60)}..."`);
    }
  }

  // Build output JSON
  const output = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalChapters: chapterIndex.length,
      questionMismatches,
      noticeOnlyProcedures: noticeOnlyProcs,
      refOnlyProcedures: refOnlyProcs,
      placeholderNotices,
      duplicateNotices,
      divergentGlossaryTerms: divergentTerms.length,
    },
    chapters: chapterIndex,
    glossary: {
      totalTerms: globalGlossary.size,
      divergentTerms: divergentTerms.map(dt => ({
        term: dt.term,
        definitions: dt.definitions,
      })),
    },
  };

  // Ensure build directory exists
  if (!fs.existsSync(BUILD_DIR)) {
    fs.mkdirSync(BUILD_DIR, { recursive: true });
  }

  // Write JSON
  const outputPath = path.join(BUILD_DIR, 'content-index.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  // Print warnings report
  console.log('='.repeat(60));
  console.log('WARNINGS REPORT');
  console.log('='.repeat(60));
  console.log();

  if (warnings.length === 0) {
    console.log('No warnings found.');
  } else {
    console.log(`Total warnings: ${warnings.length}`);
    console.log();
    console.log('--- Question Count Issues ---');
    const qWarnings = warnings.filter(w => w.includes('Missing') || w.includes('Duplicate') || w.includes('Answer block count'));
    if (qWarnings.length > 0) {
      qWarnings.forEach(w => console.log(w));
    } else {
      console.log('(none)');
    }
    console.log();
    console.log('--- Notice-Only Procedures ---');
    const nWarnings = warnings.filter(w => w.includes('Notice-only'));
    if (nWarnings.length > 0) {
      nWarnings.forEach(w => console.log(w));
    } else {
      console.log('(none)');
    }
    console.log();
    console.log('--- Reference-Only Procedures ---');
    const rWarnings = warnings.filter(w => w.includes('Reference-only'));
    if (rWarnings.length > 0) {
      rWarnings.forEach(w => console.log(w));
    } else {
      console.log('(none)');
    }
    console.log();
    console.log('--- Placeholder Notices ---');
    const pWarnings = warnings.filter(w => w.includes('Placeholder notice'));
    if (pWarnings.length > 0) {
      pWarnings.forEach(w => console.log(w));
    } else {
      console.log('(none)');
    }
    console.log();
    console.log('--- Duplicate Notices ---');
    const dWarnings = warnings.filter(w => w.includes('Duplicate update notices'));
    if (dWarnings.length > 0) {
      dWarnings.forEach(w => console.log(w));
    } else {
      console.log('(none)');
    }
    console.log();
    console.log('--- Divergent Glossary Terms ---');
    const gWarnings = warnings.filter(w => w.includes('[GLOSSARY]'));
    if (gWarnings.length > 0) {
      gWarnings.forEach(w => console.log(w));
    } else {
      console.log('(none)');
    }
  }

  console.log();
  console.log('='.repeat(60));
  console.log(`Output written to: ${outputPath}`);
  console.log('='.repeat(60));
}

main();
