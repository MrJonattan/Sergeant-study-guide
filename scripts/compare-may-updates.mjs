#!/usr/bin/env node
/**
 * compare-may-updates.mjs
 *
 * Compares May 2026 updated procedures against current study guide sections
 * and identifies substantive changes that need to be applied.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT = '/Users/hattan/Projects/nypd-sergeant-study-guide';
const COMPARISON_DIR = join(PROJECT_ROOT, 'build/update-comparison');
const CHAPTERS_DIR = join(PROJECT_ROOT, 'chapters');

// May 2026 procedures to check
const MAY_UPDATES = [
  { proc: '207-07', date: 'May 28', chapter: '207-complaints', file: 'section-207-investigations.md' },
  { proc: '207-01', date: 'May 27', chapter: '207-complaints', file: 'section-207-complaint-system.md' },
  { proc: '304-22', date: 'May 26', chapter: '304-general-regulations', file: 'section-304-prohibited-conduct.md' },
  { proc: '330-08', date: 'May 26', chapter: '330-medical-health-wellness', file: 'section-330-counseling-unit.md' },
  { proc: '219-12', date: 'May 26', chapter: '219-department-property', file: 'section-219-equipment-supplies.md' },
  { proc: '318-09', date: 'May 19', chapter: '318-disciplinary-matters', file: 'section-318-disciplinary-matters.md' },
  { proc: '318-17', date: 'May 19', chapter: '318-disciplinary-matters', file: 'section-318-disciplinary-matters.md' },
  { proc: '202-05', date: 'May 19', chapter: '202-duties-responsibilities', file: 'section-202-officers.md' },
  { proc: '202-20', date: 'May 19', chapter: '202-duties-responsibilities', file: 'section-202-supervisors.md' },
  { proc: '320-04', date: 'May 18', chapter: '320-personnel-matters', file: 'section-320-04.md' },
  { proc: '212-57', date: 'May 14', chapter: '212-command-operations', file: 'section-212-miscellaneous.md' },
  { proc: '207-06', date: 'May 13', chapter: '207-complaints', file: 'section-207-notifications.md' },
  { proc: '207-33', date: 'May 13', chapter: '207-complaints', file: 'section-207-investigations.md' },
  { proc: '208-44', date: 'May 13', chapter: '208-arrests', file: 'section-208-special-arrests.md' },
  { proc: '214-34', date: 'May 13', chapter: '214-quality-of-life', file: 'section-214-enforcement-programs.md' },
  { proc: '218-23', date: 'May 13', chapter: '218-property-general', file: 'section-218-evidence-processing.md' },
  { proc: '208-14', date: 'May 13', chapter: '208-arrests', file: 'section-208-law-and-processing.md' },
  { proc: '210-19', date: 'May 13', chapter: '210-prisoners', file: 'section-210-general-procedure.md' },
  { proc: '213-03', date: 'May 13', chapter: '213-mobilization-emergency', file: 'section-213-mobilization-readiness.md' },
  { proc: '218-26', date: 'May 13', chapter: '218-property-general', file: 'section-218-evidence-processing.md' },
  { proc: '208-69', date: 'May 13', chapter: '208-arrests', file: 'section-208-notifications.md' },
  { proc: '212-12', date: 'May 13', chapter: '212-command-operations', file: 'section-212-technology-systems.md' },
  { proc: '212-55', date: 'May 13', chapter: '212-command-operations', file: 'section-212-special-incidents.md' },
  { proc: '212-99', date: 'May 13', chapter: '212-command-operations', file: 'section-212-technology-systems.md' },
  { proc: '202-06', date: 'May 5', chapter: '202-duties-responsibilities', file: 'section-202-officers.md' },
  { proc: '202-18', date: 'May 5', chapter: '202-duties-responsibilities', file: 'section-202-supervisors.md' }, // Already done June
  { proc: '202-29', date: 'May 5', chapter: '202-duties-responsibilities', file: 'section-202-supervisors.md' },
  { proc: '202-39', date: 'May 5', chapter: '202-duties-responsibilities', file: 'section-202-supervisors.md' },
  { proc: '216-12', date: 'May 5', chapter: '216-aided-cases', file: 'section-216-special-aided.md' },
  { proc: '216-13', date: 'May 5', chapter: '216-aided-cases', file: 'section-216-special-aided.md' },
  { proc: '216-15', date: 'May 5', chapter: '216-aided-cases', file: 'section-216-special-aided.md' },
  { proc: '217-01', date: 'May 5', chapter: '217-vehicle-collisions', file: 'section-217-collisions-general.md' },
  { proc: '217-07', date: 'May 5', chapter: '217-vehicle-collisions', file: 'section-217-collisions-general.md' },
  { proc: '217-09', date: 'May 5', chapter: '217-vehicle-collisions', file: 'section-217-collisions-general.md' },
  { proc: '217-13', date: 'May 5', chapter: '217-vehicle-collisions', file: 'section-217-highways-chemical-test.md' },
  { proc: '217-14', date: 'May 5', chapter: '217-vehicle-collisions', file: 'section-217-highways-chemical-test.md' },
  { proc: '219-23', date: 'May 5', chapter: '219-department-property', file: 'section-219-it-communications.md' },
  { proc: '221-21', date: 'May 5', chapter: '221-tactical-operations', file: 'section-221-force-reporting.md' },
  { proc: '221-22', date: 'May 5', chapter: '221-tactical-operations', file: 'section-221-force-reporting.md' },
];

// Read extracted content for a procedure
function getExtractedContent(procNum) {
  const filePath = join(COMPARISON_DIR, `${procNum}.txt`);
  if (!existsSync(filePath)) return null;
  return readFileSync(filePath, 'utf-8').trim();
}

// Read current section content
function getSectionContent(chapter, file) {
  const filePath = join(CHAPTERS_DIR, chapter, file);
  if (!existsSync(filePath)) return null;
  return readFileSync(filePath, 'utf-8');
}

// Check if section file contains key phrases from extracted content
function findDifferences(procNum, extracted, sectionContent) {
  if (!extracted || !sectionContent) return null;

  const differences = [];

  // Extract key lines from the PDF text (first 1500 chars usually has the header and key changes)
  const extractedPreview = extracted.substring(0, 1500);

  // Look for date changes
  const dateMatch = extractedPreview.match(/DATE EFFECTIVE:\s*\n?\s*(\d{2}\/\d{2}\/\d{2})/);
  if (dateMatch) {
    const newDate = dateMatch[1];
    if (!sectionContent.includes(newDate)) {
      differences.push(`Date changed to ${newDate}`);
    }
  }

  // Look for LAST REVISION changes
  const revMatch = extractedPreview.match(/LAST REVISION:\s*\n?\s*(R\.?O\.?\s*\d+)/i);
  if (revMatch) {
    const newRev = revMatch[1].replace(/\s+/g, ' ');
    if (!sectionContent.includes(newRev)) {
      differences.push(`Revision changed to ${newRev}`);
    }
  }

  // Look for PAGE count changes
  const pageMatch = extractedPreview.match(/PAGE:\s*\n?\s*(\d+\s*of\s*\d+)/i);
  if (pageMatch) {
    const newPage = pageMatch[1].replace(/\s+/g, ' ');
    if (!sectionContent.includes(newPage)) {
      differences.push(`Page count changed to ${newPage}`);
    }
  }

  // Check for specific new content keywords
  const keywords = [
    'Salesforce', 'AVL', 'DAS', 'CVAP', 'MOCJ', 'Safe Horizon', 'FORMS',
    'CPR System', 'Rundown', 'ballistic vest', 'Operations Coordinator',
    'Command Log', 'Physical Inventory', 'Court Appearances'
  ];

  for (const keyword of keywords) {
    if (extractedPreview.includes(keyword) && !sectionContent.includes(keyword)) {
      differences.push(`New keyword: ${keyword}`);
    }
  }

  return differences.length > 0 ? differences : null;
}

console.log('🔍 Comparing May 2026 Updates Against Current Sections\n');
console.log('=' .repeat(70) + '\n');

const results = [];

for (const update of MAY_UPDATES) {
  const extracted = getExtractedContent(update.proc);
  const sectionContent = getSectionContent(update.chapter, update.file);

  if (!extracted) {
    results.push({
      ...update,
      status: 'SKIPPED',
      reason: 'No extracted content available'
    });
    continue;
  }

  if (!sectionContent) {
    results.push({
      ...update,
      status: 'SKIPPED',
      reason: 'Section file does not exist'
    });
    continue;
  }

  const differences = findDifferences(update.proc, extracted, sectionContent);

  if (differences) {
    results.push({
      ...update,
      status: 'CHANGES_FOUND',
      differences
    });
    console.log(`📄 P.G. ${update.proc} (${update.date}) → ${update.file}`);
    console.log(`   Changes: ${differences.join(', ')}`);
    console.log('');
  } else {
    results.push({
      ...update,
      status: 'NO_CHANGES',
      reason: 'Content appears identical or no extractable differences'
    });
  }
}

console.log('=' .repeat(70));
console.log('\n📊 SUMMARY\n');

const changesFound = results.filter(r => r.status === 'CHANGES_FOUND').length;
const noChanges = results.filter(r => r.status === 'NO_CHANGES').length;
const skipped = results.filter(r => r.status === 'SKIPPED').length;

console.log(`Changes found: ${changesFound}`);
console.log(`No changes detected: ${noChanges}`);
console.log(`Skipped: ${skipped}`);

// Write results to file
writeFileSync(
  join(PROJECT_ROOT, 'build/update-comparison/MAY-2026-COMPARISON.json'),
  JSON.stringify(results, null, 2)
);

console.log('\n💾 Results written to build/update-comparison/MAY-2026-COMPARISON.json');
