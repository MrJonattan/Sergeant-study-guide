#!/usr/bin/env node
/**
 * audit-update-ingestion.mjs
 *
 * Comprehensive audit of the May/June 2026 update ingestion.
 * Uses shared procedure-map.mjs for UPDATES and PROCEDURE_TO_SECTION.
 *
 * Usage: node scripts/audit-update-ingestion.mjs
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import {
  UPDATES,
  EFFECTIVE_DATES,
  PROCEDURE_TO_SECTION,
  getChapter,
  formatDate,
  countQuestions,
  fileHasProcedureHeading,
} from './lib/procedure-map.mjs';

const PROJECT_ROOT = '/Users/hattan/Projects/nypd-sergeant-study-guide';
const CHAPTERS_DIR = join(PROJECT_ROOT, 'chapters');

/**
 * Read file content
 */
function readFile(chapter, file) {
  const filePath = join(CHAPTERS_DIR, chapter, file);
  try {
    return readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

/**
 * Parse README for stated question count
 */
function parseReadmeQuestionCount(content) {
  const patterns = [
    /(\d+)\s*multiple-choice questions/i,
    /(\d+)\s*questions/i,
    /(\d+)\s+multiple-choice/i,
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      return parseInt(match[1]);
    }
  }
  return null;
}

/**
 * Check for update notice in file
 */
function checkUpdateNotice(content, procNum, expectedDate) {
  const expectedFormatted = formatDate(expectedDate);
  const patterns = [
    new RegExp(`UPDATED.*${procNum}`, 'i'),
    new RegExp(`UPDATE.*${procNum}`, 'i'),
    new RegExp(`${expectedFormatted}`, 'i'),
  ];

  const hasNotice = patterns.some(p => p.test(content));

  // Check for exact date match
  const datePatterns = [
    new RegExp(`\\*\\*${expectedFormatted}\\*\\*`, 'i'),
    new RegExp(`\\*\\*${expectedDate.replace(/-/g, '/')}\\*\\*`, 'i'),
  ];
  const hasExactDate = datePatterns.some(p => p.test(content));

  // Count duplicate notices
  const noticeMatches = content.match(/> (?:📅|⚠️) \*\*(?:UPDATE|UPDATED):\*\*/g);
  const duplicateCount = noticeMatches ? noticeMatches.length : 0;

  return { hasNotice, hasExactDate, duplicateCount };
}

console.log('🔍 AUDIT: Update Ingestion Verification');
console.log('=' .repeat(80));
console.log('');

const issues = {
  fileNotFound: [],
  dateMismatch: [],
  missingNotice: [],
  duplicateNotices: [],
  readmeMismatch: [],
  missingProcedureHeading: [],
  inconsistentQuestionNumbering: [],
};

// CHECK 1: Verify PROCEDURE_TO_SECTION mappings point to existing files
console.log('CHECK 1: File Existence for PROCEDURE_TO_SECTION Mappings');
console.log('-' .repeat(80));

const checkedFiles = new Set();
for (const [procNum, file] of Object.entries(PROCEDURE_TO_SECTION)) {
  const chapter = getChapter(procNum);
  if (!chapter) {
    issues.fileNotFound.push({ proc: procNum, file, reason: 'Unknown chapter' });
    continue;
  }

  const filePath = join(CHAPTERS_DIR, chapter, file);
  const key = `${chapter}/${file}`;

  if (!checkedFiles.has(key)) {
    checkedFiles.add(key);
    if (!existsSync(filePath)) {
      issues.fileNotFound.push({ proc: procNum, file, chapter, reason: 'File does not exist' });
      console.log(`  ❌ ${chapter}/${file} — FILE NOT FOUND (referenced by ${procNum})`);
    }
  }
}

if (issues.fileNotFound.length === 0) {
  console.log('  ✅ All mapped files exist');
}
console.log('');

// CHECK 1b: Verify procedure heading exists in mapped file
console.log('CHECK 1b: Procedure Heading Presence');
console.log('-' .repeat(80));

for (const [procNum, file] of Object.entries(PROCEDURE_TO_SECTION)) {
  const chapter = getChapter(procNum);
  if (!chapter) continue;

  const content = readFile(chapter, file);
  if (!content) continue;

  if (!fileHasProcedureHeading(content, procNum)) {
    issues.missingProcedureHeading.push({ proc: procNum, file, chapter });
    console.log(`  ⚠️  ${procNum} — No "## P.G. ${procNum}" or "## A.G. ${procNum}" heading in ${chapter}/${file}`);
  }
}

if (issues.missingProcedureHeading.length === 0) {
  console.log('  ✅ All procedures have matching headings in their mapped files');
}
console.log('');

// CHECK 2: Verify update notices for June/May 2026 procedures
console.log('CHECK 2: Update Notices for June/May 2026 Procedures');
console.log('-' .repeat(80));

// Get unique procedures from May/June updates
const mayJuneProcs = new Set();
const mayJuneUpdates = UPDATES.filter(u => u.date.startsWith('2026-06') || u.date.startsWith('2026-05'));
for (const update of mayJuneUpdates) {
  for (const proc of update.procedures) {
    mayJuneProcs.add(proc);
  }
}

// Check each procedure against its EFFECTIVE date (from PDF header), not publication date
for (const procNum of mayJuneProcs) {
  const file = PROCEDURE_TO_SECTION[procNum];
  const chapter = getChapter(procNum);

  // Get effective date from EFFECTIVE_DATES map (PDF header date, not Update1.pdf publication date)
  const effectiveDate = EFFECTIVE_DATES[procNum] || null;

  if (!file || !chapter || !effectiveDate) {
    continue;
  }

  const content = readFile(chapter, file);
  if (!content) {
    continue;
  }

  const result = checkUpdateNotice(content, procNum, effectiveDate);

  if (!result.hasNotice) {
    issues.missingNotice.push({ proc: procNum, file, expectedDate: effectiveDate });
    console.log(`  ❌ ${procNum} — NO UPDATE NOTICE FOUND (expected: ${formatDate(effectiveDate)})`);
  } else if (!result.hasExactDate) {
    issues.dateMismatch.push({ proc: procNum, file, expectedDate: effectiveDate });
    console.log(`  ⚠️  ${procNum} — DATE MISMATCH (expected: ${formatDate(effectiveDate)})`);
  }

  if (result.duplicateCount > 1) {
    issues.duplicateNotices.push({ proc: procNum, file, count: result.duplicateCount });
  }
}

if (issues.missingNotice.length === 0 && issues.dateMismatch.length === 0) {
  console.log('  ✅ All update notices present with correct dates');
}
console.log('');

// CHECK 3: Check for duplicate notices in all section files
console.log('CHECK 3: Duplicate Update Notices');
console.log('-' .repeat(80));

// Already collected during CHECK 2 loop above
if (issues.duplicateNotices.length === 0) {
  console.log('  ✅ No duplicate notices detected');
} else {
  for (const dup of issues.duplicateNotices) {
    console.log(`  ⚠️  ${dup.proc} — ${dup.count} update notices in ${dup.file}`);
  }
}
console.log('');

// CHECK 4: README question counts with authoritative counter
console.log('CHECK 4: README Question Count Verification');
console.log('-' .repeat(80));

const readmeFiles = [
  '202-duties-responsibilities/README.md',
  '207-complaints/README.md',
  '208-arrests/README.md',
  '209-summonses/README.md',
  '210-prisoners/README.md',
  '211-court-appearances/README.md',
  '212-command-operations/README.md',
  '213-mobilization-emergency/README.md',
  '214-quality-of-life/README.md',
  '215-juvenile-matters/README.md',
  '216-aided-cases/README.md',
  '217-vehicle-collisions/README.md',
  '218-property-general/README.md',
  '219-department-property/README.md',
  '220-citywide-incident-mgmt/README.md',
  '221-tactical-operations/README.md',
  '303-duties-responsibilities/README.md',
  '304-general-regulations/README.md',
  '305-uniforms-equipment/README.md',
  '318-disciplinary-matters/README.md',
  '319-civilian-personnel/README.md',
  '320-personnel-matters/README.md',
  '324-leave-payroll-timekeeping/README.md',
  '326-communications/README.md',
  '329-career-development/README.md',
  '330-medical-health-wellness/README.md',
  '331-evaluations/README.md',
  '332-employee-rights/README.md',
];

for (const readmePath of readmeFiles) {
  const fullPath = join(CHAPTERS_DIR, readmePath);
  if (!existsSync(fullPath)) continue;

  const readmeContent = readFileSync(fullPath, 'utf-8');
  const statedCount = parseReadmeQuestionCount(readmeContent);

  if (statedCount === null) continue;

  // Find corresponding review-questions.md
  const chapter = readmePath.split('/')[0];
  const reviewPath = join(CHAPTERS_DIR, chapter, 'review-questions.md');

  if (!existsSync(reviewPath)) continue;

  const reviewContent = readFileSync(reviewPath, 'utf-8');
  const analysis = countQuestions(reviewContent);

  // Check for numbering inconsistencies
  if (!analysis.consistent) {
    issues.inconsistentQuestionNumbering.push({
      chapter,
      count: analysis.count,
      declared: analysis.declared,
      maxNumber: analysis.maxNumber,
      missingNumbers: analysis.missingNumbers,
      duplicates: analysis.duplicates,
    });
    console.log(`  ⚠️  ${chapter} — Question numbering inconsistent:`);
    if (analysis.missingNumbers.length > 0) {
      console.log(`      Missing numbers: ${analysis.missingNumbers.join(', ')}`);
    }
    if (analysis.duplicates.length > 0) {
      console.log(`      Duplicates: ${analysis.duplicates.join(', ')}`);
    }
  }

  // Use analysis.count (authoritative) for README comparison
  if (statedCount !== analysis.count) {
    issues.readmeMismatch.push({
      chapter,
      stated: statedCount,
      actual: analysis.count,
    });
    console.log(`  ❌ ${chapter} — README says ${statedCount} questions, actual: ${analysis.count}`);
  }
}

if (issues.readmeMismatch.length === 0 && issues.inconsistentQuestionNumbering.length === 0) {
  console.log('  ✅ All README question counts match actual counts');
}
console.log('');

// Summary
console.log('=' .repeat(80));
console.log('📊 AUDIT SUMMARY');
console.log('=' .repeat(80));
console.log('');

const totalIssues =
  issues.fileNotFound.length +
  issues.dateMismatch.length +
  issues.missingNotice.length +
  issues.duplicateNotices.length +
  issues.readmeMismatch.length +
  issues.missingProcedureHeading.length +
  issues.inconsistentQuestionNumbering.length;

if (totalIssues === 0) {
  console.log('✅ NO ISSUES FOUND — Update ingestion is correct!');
} else {
  console.log(`⚠️  TOTAL ISSUES: ${totalIssues}`);
  console.log('');
  console.log(`  File Not Found:        ${issues.fileNotFound.length}`);
  console.log(`  Date Mismatches:       ${issues.dateMismatch.length}`);
  console.log(`  Missing Notices:       ${issues.missingNotice.length}`);
  console.log(`  Duplicate Notices:     ${issues.duplicateNotices.length}`);
  console.log(`  README Mismatches:     ${issues.readmeMismatch.length}`);
  console.log(`  Missing Headings:      ${issues.missingProcedureHeading.length}`);
  console.log(`  Question Inconsistencies: ${issues.inconsistentQuestionNumbering.length}`);
}

console.log('');

// Detailed issue list
if (totalIssues > 0) {
  console.log('📋 DETAILED ISSUE LIST');
  console.log('-' .repeat(80));

  if (issues.fileNotFound.length > 0) {
    console.log('');
    console.log('FILE NOT FOUND:');
    for (const issue of issues.fileNotFound) {
      console.log(`  - ${issue.proc} → ${issue.chapter}/${issue.file} (${issue.reason})`);
    }
  }

  if (issues.missingProcedureHeading.length > 0) {
    console.log('');
    console.log('MISSING PROCEDURE HEADINGS (orphaned notice candidates):');
    for (const issue of issues.missingProcedureHeading) {
      console.log(`  - ${issue.proc} → ${issue.chapter}/${issue.file} (no "## P.G./A.G. ${issue.proc}" heading)`);
    }
  }

  if (issues.dateMismatch.length > 0) {
    console.log('');
    console.log('DATE MISMATCHES:');
    for (const issue of issues.dateMismatch) {
      console.log(`  - ${issue.proc} in ${issue.file} (expected: ${formatDate(issue.expectedDate)})`);
    }
  }

  if (issues.missingNotice.length > 0) {
    console.log('');
    console.log('MISSING UPDATE NOTICES:');
    for (const issue of issues.missingNotice) {
      console.log(`  - ${issue.proc} in ${issue.file} (expected: ${formatDate(issue.expectedDate)})`);
    }
  }

  if (issues.duplicateNotices.length > 0) {
    console.log('');
    console.log('DUPLICATE NOTICES:');
    for (const issue of issues.duplicateNotices) {
      console.log(`  - ${issue.proc} in ${issue.file} (${issue.count} notices)`);
    }
  }

  if (issues.readmeMismatch.length > 0) {
    console.log('');
    console.log('README MISMATCHES:');
    for (const issue of issues.readmeMismatch) {
      console.log(`  - ${issue.chapter}: README=${issue.stated}, Actual=${issue.actual}`);
    }
  }

  if (issues.inconsistentQuestionNumbering.length > 0) {
    console.log('');
    console.log('QUESTION NUMBERING INCONSISTENCIES:');
    for (const issue of issues.inconsistentQuestionNumbering) {
      console.log(`  - ${issue.chapter}: count=${issue.count}, declared=${issue.declared}, max=${issue.maxNumber}`);
      if (issue.missingNumbers.length > 0) {
        console.log(`      Missing: ${issue.missingNumbers.join(', ')}`);
      }
      if (issue.duplicates.length > 0) {
        console.log(`      Duplicates: ${issue.duplicates.join(', ')}`);
      }
    }
  }
}

// Write audit results
import { writeFileSync } from 'fs';
writeFileSync(
  join(PROJECT_ROOT, 'build/update-comparison/AUDIT-RESULTS.json'),
  JSON.stringify(issues, null, 2)
);

console.log('');
console.log('💾 Audit results written to: build/update-comparison/AUDIT-RESULTS.json');
