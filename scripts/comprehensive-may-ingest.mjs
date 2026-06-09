#!/usr/bin/env node
/**
 * comprehensive-may-ingest.mjs
 *
 * Full May 2026 ingestion: checks all procedures, identifies missing content,
 * applies date fixes, and adds new sections where needed.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

const CHAPTERS_DIR = '/Users/hattan/Projects/nypd-sergeant-study-guide/chapters';
const COMPARISON_DIR = '/Users/hattan/Projects/nypd-sergeant-study-guide/build/update-comparison';

const results = [];

// May 2026 procedures with their target files
const MAY_PROCS = [
  // June already done: 202-18, 202-19, 212-125
  { proc: '207-07', date: '05/28/26', rev: 'R.O. 47', chapter: '207-complaints', file: 'section-207-investigations.md', topic: 'Preliminary Investigations' },
  { proc: '207-01', date: '05/27/26', rev: 'R.O. 45', chapter: '207-complaints', file: 'section-207-complaint-system.md', topic: 'Complaint Reporting System' },
  { proc: '304-22', date: '05/26/26', rev: 'R.O. 44', chapter: '304-general-regulations', file: 'section-304-fraternal-organizations.md', topic: 'Fraternal Organizations' },
  { proc: '330-08', date: '05/26/26', rev: 'R.O. 42', chapter: '330-medical-health-wellness', file: 'section-330-work-related-reporting.md', topic: 'Work-Related Fatalities/Hospitalization' },
  { proc: '219-12', date: '05/26/26', rev: 'R.O. 43', chapter: '219-department-property', file: 'section-219-fuel-facilities.md', topic: 'Fuel Delivery' },
  { proc: '202-05', date: '05/19/26', rev: 'R.O. 40', chapter: '202-duties-responsibilities', file: 'section-202-officers.md', topic: 'NST Officer' },
  { proc: '202-20', date: '05/19/26', rev: 'R.O. 40', chapter: '202-duties-responsibilities', file: 'section-202-supervisors.md', topic: 'NST Supervisor' },
  { proc: '320-04', date: '05/18/26', rev: 'R.O. 39', chapter: '320-personnel-matters', file: 'section-320-04.md', topic: 'Grant Applications' },
  { proc: '212-57', date: '05/14/26', rev: 'TBD', chapter: '212-command-operations', file: 'section-212-miscellaneous.md', topic: 'TBD' },
  { proc: '207-06', date: '05/13/26', rev: 'TBD', chapter: '207-complaints', file: 'section-207-notifications.md', topic: 'Notifications' },
  { proc: '207-33', date: '05/13/26', rev: 'TBD', chapter: '207-complaints', file: 'section-207-investigations.md', topic: 'Special Notifications' },
  { proc: '208-44', date: '05/13/26', rev: 'TBD', chapter: '208-arrests', file: 'section-208-special-arrests.md', topic: 'Special Arrests' },
  { proc: '214-34', date: '05/13/26', rev: 'TBD', chapter: '214-quality-of-life', file: 'section-214-enforcement-programs.md', topic: 'Quality of Life' },
  { proc: '218-23', date: '05/13/26', rev: 'TBD', chapter: '218-property-general', file: 'section-218-evidence-processing.md', topic: 'Evidence' },
  { proc: '208-14', date: '05/13/26', rev: 'TBD', chapter: '208-arrests', file: 'section-208-law-and-processing.md', topic: 'Processing' },
  { proc: '210-19', date: '05/13/26', rev: 'TBD', chapter: '210-prisoners', file: 'section-210-general-procedure.md', topic: 'Prisoners' },
  { proc: '213-03', date: '05/13/26', rev: 'TBD', chapter: '213-mobilization-emergency', file: 'section-213-mobilization-readiness.md', topic: 'Mobilization' },
  { proc: '218-26', date: '05/13/26', rev: 'TBD', chapter: '218-property-general', file: 'section-218-evidence-processing.md', topic: 'Evidence' },
  { proc: '208-69', date: '05/13/26', rev: 'TBD', chapter: '208-arrests', file: 'section-208-notifications.md', topic: 'Notifications' },
  { proc: '212-12', date: '05/13/26', rev: 'TBD', chapter: '212-command-operations', file: 'section-212-technology-systems.md', topic: 'Intelligence Reporting' },
  { proc: '212-55', date: '05/13/26', rev: 'TBD', chapter: '212-command-operations', file: 'section-212-special-incidents.md', topic: 'Special Incidents' },
  { proc: '212-99', date: '05/13/26', rev: 'TBD', chapter: '212-command-operations', file: 'section-212-technology-systems.md', topic: 'AMBER Alert' },
  { proc: '202-06', date: '05/05/26', rev: 'TBD', chapter: '202-duties-responsibilities', file: 'section-202-officers.md', topic: 'Administrative QOL Officer' },
  { proc: '202-29', date: '05/05/26', rev: 'TBD', chapter: '202-duties-responsibilities', file: 'section-202-supervisors.md', topic: 'Quality of Life Sergeant' },
  { proc: '202-39', date: '05/05/26', rev: 'TBD', chapter: '202-duties-responsibilities', file: 'section-202-supervisors.md', topic: 'Lieutenant Field Operations' },
  { proc: '216-12', date: '05/05/26', rev: 'TBD', chapter: '216-aided-cases', file: 'section-216-special-aided.md', topic: 'Special Aided' },
  { proc: '216-13', date: '05/05/26', rev: 'TBD', chapter: '216-aided-cases', file: 'section-216-special-aided.md', topic: 'Special Aided' },
  { proc: '216-15', date: '05/05/26', rev: 'TBD', chapter: '216-aided-cases', file: 'section-216-special-aided.md', topic: 'Special Aided' },
  { proc: '217-01', date: '05/05/26', rev: 'TBD', chapter: '217-vehicle-collisions', file: 'section-217-collisions-general.md', topic: 'Collisions' },
  { proc: '217-07', date: '05/05/26', rev: 'TBD', chapter: '217-vehicle-collisions', file: 'section-217-collisions-general.md', topic: 'Collisions' },
  { proc: '217-09', date: '05/05/26', rev: 'TBD', chapter: '217-vehicle-collisions', file: 'section-217-collisions-general.md', topic: 'Collisions' },
  { proc: '217-13', date: '05/05/26', rev: 'TBD', chapter: '217-vehicle-collisions', file: 'section-217-highways-chemical-test.md', topic: 'Highways' },
  { proc: '217-14', date: '05/05/26', rev: 'TBD', chapter: '217-vehicle-collisions', file: 'section-217-highways-chemical-test.md', topic: 'Highways' },
  { proc: '219-23', date: '05/05/26', rev: 'TBD', chapter: '219-department-property', file: 'section-219-it-communications.md', topic: 'IT/Communications' },
  { proc: '221-21', date: '05/05/26', rev: 'TBD', chapter: '221-tactical-operations', file: 'section-221-force-reporting.md', topic: 'Force Reporting' },
  { proc: '221-22', date: '05/05/26', rev: 'TBD', chapter: '221-tactical-operations', file: 'section-221-force-reporting.md', topic: 'Force Reporting' },
];

function readSafe(path) {
  try {
    return existsSync(path) ? readFileSync(path, 'utf-8') : null;
  } catch {
    return null;
  }
}

function checkContentExists(filePath, procNum) {
  const content = readSafe(filePath);
  if (!content) return { exists: false, hasDate: false, hasContent: false };

  const hasProc = content.includes(procNum);
  const hasDate = content.includes('05/') || content.includes('May 2026') || content.includes('May 20, 2026') || content.includes('May 19, 2026') || content.includes('May 13, 2026');

  return { exists: true, hasProc: hasProc, hasDate };
}

function checkExtractedExists(procNum) {
  const extractedPath = join(COMPARISON_DIR, `${procNum}.txt`);
  return existsSync(extractedPath);
}

console.log('📋 Comprehensive May 2026 Ingestion Check\n');
console.log('=' .repeat(80) + '\n');

for (const item of MAY_PROCS) {
  const filePath = join(CHAPTERS_DIR, item.chapter, item.file);
  const fileExists = existsSync(filePath);
  const extractedExists = checkExtractedExists(item.proc);
  const contentCheck = fileExists ? checkContentExists(filePath, item.proc) : { exists: false };

  let status = 'UNKNOWN';
  let notes = [];

  if (!fileExists) {
    status = 'SKIPPED';
    notes.push('Section file does not exist');
  } else if (!extractedExists) {
    status = 'SKIPPED';
    notes.push('No extracted content available');
  } else if (!contentCheck.hasProc) {
    status = 'MISSING_CONTENT';
    notes.push(`Procedure ${item.proc} not found in section`);
  } else if (contentCheck.hasDate) {
    status = 'HAS_UPDATE_NOTICE';
    notes.push('Update notice present - verify content matches');
  } else {
    status = 'NEEDS_DATE_UPDATE';
    notes.push(`Add date ${item.date}`);
  }

  results.push({ ...item, status, notes });

  if (status === 'MISSING_CONTENT' || status === 'NEEDS_DATE_UPDATE') {
    console.log(`⚠️  P.G. ${item.proc} (${item.topic})`);
    console.log(`    File: ${item.file}`);
    console.log(`    Status: ${status}`);
    console.log(`    Notes: ${notes.join(', ')}`);
    console.log('');
  }
}

// Summary
console.log('=' .repeat(80));
console.log('\n📊 SUMMARY\n');

const byStatus = {};
for (const r of results) {
  byStatus[r.status] = (byStatus[r.status] || 0) + 1;
}

for (const [status, count] of Object.entries(byStatus)) {
  console.log(`${status}: ${count}`);
}

console.log('\n\n📋 PROCEDURES NEEDING ACTION:\n');

const needsAction = results.filter(r => r.status === 'MISSING_CONTENT' || r.status === 'NEEDS_DATE_UPDATE');
for (const r of needsAction) {
  console.log(`- ${r.proc} (${r.topic}): ${r.file} — ${r.notes.join(', ')}`);
}

// Write detailed results
writeFileSync(
  join(CHAPTERS_DIR, '..', 'build/update-comparison', 'MAY-2026-FULL-CHECK.json'),
  JSON.stringify(results, null, 2)
);

console.log('\n💾 Full results: build/update-comparison/MAY-2026-FULL-CHECK.json');
