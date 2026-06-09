#!/usr/bin/env node
/**
 * ingest-updates.mjs
 *
 * Ingests procedure updates from Update1.pdf into the study guide.
 * Parses the update timeline and marks affected procedures with update notices.
 *
 * Usage: node scripts/ingest-updates.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { UPDATES, PROCEDURE_TO_SECTION, getChapter, formatDate } from './lib/procedure-map.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const CHAPTERS_DIR = join(PROJECT_ROOT, 'chapters');

// Map procedure numbers to chapter directories (kept for fallback logic)
const PROCEDURE_TO_CHAPTER = {
  // 200-series
  '200': '200-general',
  '202': '202-duties-responsibilities',
  '203': '203-ethics-and-conduct',
  '204': '204-operations',
  '205': '205-patrol',
  '206': '206-emergency-response',
  '207': '207-complaints',
  '208': '208-arrests',
  '209': '209-summonses',
  '210': '210-prisoners',
  '211': '211-court-appearances',
  '212': '212-command-operations',
  '213': '213-mobilization-emergency',
  '214': '214-quality-of-life',
  '215': '215-juvenile-matters',
  '216': '216-aided-cases',
  '217': '217-vehicle-collisions',
  '218': '218-property-general',
  '219': '219-department-property',
  '220': '220-citywide-incident-mgmt',
  '221': '221-tactical-operations',
  // 300-series
  '303': '303-duties-responsibilities',
  '304': '304-general-regulations',
  '305': '305-uniforms-equipment',
  '318': '318-disciplinary-matters',
  '319': '319-civilian-personnel',
  '320': '320-personnel-matters',
  '324': '324-leave-payroll-timekeeping',
  '326': '326-communications',
  '328': '328-retirement',
  '329': '329-career-development',
  '330': '330-medical-health-wellness',
  '331': '331-evaluations',
  '332': '332-employee-rights',
};

// Map procedure numbers to section files
const PROCEDURE_TO_SECTION = {
  // 202 - Supervisor duties
  '202-05': 'section-202-officers.md',
  '202-06': 'section-202-officers.md',
  '202-10': 'section-202-officers.md',
  '202-18': 'section-202-supervisors.md',
  '202-19': 'section-202-supervisors.md',
  '202-20': 'section-202-supervisors.md',
  '202-27': 'section-202-supervisors.md',
  '202-29': 'section-202-supervisors.md',
  '202-32': 'section-202-supervisors.md',
  '202-38': 'section-202-supervisors.md',
  '202-39': 'section-202-supervisors.md',
  // 207 - Complaints
  '207-01': 'section-207-complaint-system.md',
  '207-06': 'section-207-notifications.md',
  '207-07': 'section-207-investigations.md',
  '207-12': 'section-207-complaint-system.md', // Lost/Stolen Property content in complaint system file
  // PROCEDURE_TO_SECTION is now imported from ./lib/procedure-map.mjs
};

/**
 * Get the section prefix (e.g., "212-12" -> "212")
 */
function getSectionPrefix(procedureNum) {
  return procedureNum.split('-')[0];
}

/**
 * Find the section file for a procedure
 */
function findSectionFile(procedureNum) {
  // Direct mapping first
  if (PROCEDURE_TO_SECTION[procedureNum]) {
    return PROCEDURE_TO_SECTION[procedureNum];
  }

  // Fallback: try to find by prefix
  const prefix = getSectionPrefix(procedureNum);
  const chapter = PROCEDURE_TO_CHAPTER[prefix];
  if (!chapter) return null;

  // Try common patterns
  const patterns = [
    `section-${procedureNum}.md`,
    `section-${prefix}-miscellaneous.md`,
    `section-${prefix}-general.md`,
  ];

  for (const pattern of patterns) {
    const testPath = join(CHAPTERS_DIR, chapter, pattern);
    if (existsSync(testPath)) {
      return pattern;
    }
  }

  return null;
}

/**
 * Add update notice to a section file
 */
function addUpdateNotice(filePath, procedureNum, updateDate, isRecent) {
  if (!existsSync(filePath)) {
    console.log(`  ⚠️  File not found: ${filePath}`);
    return false;
  }

  const content = readFileSync(filePath, 'utf-8');
  const formattedDate = new Date(updateDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Check if update notice already exists
  const existingNoticePattern = new RegExp(`UPDATE NOTICE.*${procedureNum}`);
  if (existingNoticePattern.test(content)) {
    console.log(`  ℹ️  Update notice already exists for ${procedureNum}`);
    return false;
  }

  // Create update notice
  const updateNotice = isRecent
    ? `
> ⚠️ **UPDATED:** This procedure was updated on **${formattedDate}**. Review the latest Patrol Guide for current language.
`
    : `
> 📅 **UPDATE:** This procedure was updated on ${formattedDate}.
`;

  // Find the procedure header and insert notice after it
  const procedureHeader = `## P.G. ${procedureNum}`;
  const headerIndex = content.indexOf(procedureHeader);

  if (headerIndex === -1) {
    console.log(`  ⚠️  Procedure header not found for ${procedureNum}`);
    // Try to add at the end of the file as fallback
    const newContent = content.trimEnd() + '\n\n' + updateNotice;
    writeFileSync(filePath, newContent, 'utf-8');
    console.log(`  ✓ Added update notice at end of file`);
    return true;
  }

  // Find the end of the header line
  const headerEnd = content.indexOf('\n', headerIndex);
  const insertPosition = headerEnd + 1;

  const newContent = content.slice(0, insertPosition) + updateNotice + content.slice(insertPosition);
  writeFileSync(filePath, newContent, 'utf-8');
  console.log(`  ✓ Added update notice for ${procedureNum}`);
  return true;
}

/**
 * Create an update summary document
 */
function createUpdateSummary() {
  const summary = `# NYPD Procedure Updates — 2026

Generated: ${new Date().toISOString().split('T')[0]}
Source: Update1.pdf (downloaded 2026-06-07)

## Recent Updates (June 2026)

| Date | Procedures | Chapter |
|------|------------|---------|
| June 4, 2026 | 212-125 | Command Operations |
| June 2, 2026 | 202-18, 202-19 | Duties & Responsibilities |

## May 2026 Updates

| Date | Procedures | Chapter |
|------|------------|---------|
| May 28, 2026 | 207-07 | Complaints |
| May 27, 2026 | 207-01 | Complaints |
| May 26, 2026 | 304-22, 330-08, 219-12 | General Regulations, Medical, Dept Property |
| May 19, 2026 | 318-09, 318-17, 202-05, 202-20 | Disciplinary, Duties |
| May 18, 2026 | 320-04 | Personnel |
| May 14, 2026 | 212-57 | Command Operations |
| May 13, 2026 | 207-06, 207-07, 207-33, 208-44, 214-34, 218-23, 208-14, 210-19, 213-03, 218-26, 208-69, 212-12, 212-55, 212-99 | Multiple |
| May 5, 2026 | 202-06, 202-18, 202-29, 202-39, 216-12, 216-13, 216-15, 217-01, 217-07, 217-09, 217-13, 217-14, 219-23, 221-21, 221-22 | Multiple |

## April 2026 Updates

| Date | Procedures | Chapter |
|------|------------|---------|
| April 23, 2026 | 202-38, 202-39, 207-01, 303-14 | Duties, Complaints |

## March 2026 Updates

| Date | Procedures | Chapter |
|------|------------|---------|
| March 30, 2026 | 209-39 | Summonses |
| March 27, 2026 | 208-83, 209-02, 209-37 | Arrests, Summonses |
| March 17, 2026 | 202-32, 326-09 | Duties, Communications |
| March 3, 2026 | 329-06 | Career Development |

## Earlier 2026 Updates

See full update timeline in Update1.pdf for procedures updated in February and January 2026.

## Procedures Updated (Full List)

${UPDATES.flatMap(u => u.procedures).sort().join(', ')}

## Study Priority

Focus on the most recent updates (June and May 2026) as these are most likely to appear on the exam in their updated form.

### Critical Updates for Exam Preparation

1. **202-18** (Desk Officer) - Updated June 2 & May 5 - MOST CRITICAL
2. **202-19** (Patrol Supervisor) - Updated June 2
3. **207-01** (Complaint System) - Updated May 27 & April 23
4. **207-07** (Preliminary Investigations) - Updated May 28 & May 13
5. **212-12** (Intelligence Reporting) - Updated May 13
6. **212-99** (AMBER Alert) - Updated May 13
`;

  const summaryPath = join(PROJECT_ROOT, 'docs', 'PROCEDURE-UPDATES-2026.md');
  writeFileSync(summaryPath, summary, 'utf-8');
  console.log(`\n✓ Created update summary: ${summaryPath}`);
}

/**
 * Main ingestion function
 */
function ingestUpdates() {
  console.log('🔄 Ingesting NYPD Procedure Updates from Update1.pdf');
  console.log('====================================================\n');

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  // Process only recent updates (June and May 2026) for now
  const recentUpdates = UPDATES.filter(u =>
    u.date.startsWith('2026-06') || u.date.startsWith('2026-05')
  );

  console.log(`Processing ${recentUpdates.length} recent update dates...\n`);

  for (const update of recentUpdates) {
    console.log(`📅 ${update.date}:`);
    const isRecent = update.date.startsWith('2026-06') || update.date.startsWith('2026-05-2');

    for (const proc of update.procedures) {
      const sectionFile = findSectionFile(proc);
      if (!sectionFile) {
        console.log(`  ⚠️  No section file found for ${proc}`);
        skipped++;
        continue;
      }

      const prefix = getSectionPrefix(proc);
      const chapter = PROCEDURE_TO_CHAPTER[prefix];
      if (!chapter) {
        console.log(`  ⚠️  No chapter found for ${proc}`);
        skipped++;
        continue;
      }

      const filePath = join(CHAPTERS_DIR, chapter, sectionFile);
      const result = addUpdateNotice(filePath, proc, update.date, isRecent);
      if (result) updated++;
      else skipped++;
    }
    console.log('');
  }

  // Create summary document
  createUpdateSummary();

  console.log('====================================================');
  console.log('📊 SUMMARY');
  console.log('====================================================');
  console.log(`✓ Updated: ${updated} procedures`);
  console.log(`⊘ Skipped: ${skipped} (already noted or file not found)`);
  console.log(`✗ Errors: ${errors}`);
  console.log('');
  console.log('Next steps:');
  console.log('1. Review the updated section files');
  console.log('2. Compare with the actual Update1.pdf for content changes');
  console.log('3. Update practice questions if procedures changed significantly');
  console.log('4. Regenerate the study guide PDF');
}

// Run ingestion
ingestUpdates();
