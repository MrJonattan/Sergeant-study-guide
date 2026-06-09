#!/usr/bin/env node
/**
 * final-may-updates.mjs
 *
 * Applies remaining May 2026 date updates and generates final summary table.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const CHAPTERS_DIR = '/Users/hattan/Projects/nypd-sergeant-study-guide/chapters';
const results = [];

function readSafe(path) {
  try {
    return existsSync(path) ? readFileSync(path, 'utf-8') : null;
  } catch {
    return null;
  }
}

// Date updates to apply
const DATE_UPDATES = [
  { proc: '207-07', file: 'chapters/207-complaints/section-207-investigations.md', date: 'May 28, 2026', rev: 'R.O. 47' },
  { proc: '207-01', file: 'chapters/207-complaints/section-207-complaint-system.md', date: 'May 27, 2026', rev: 'R.O. 45' },
  { proc: '207-06', file: 'chapters/207-complaints/section-207-notifications.md', date: 'May 13, 2026' },
  { proc: '207-33', file: 'chapters/207-complaints/section-207-investigations.md', date: 'May 13, 2026' },
  { proc: '208-44', file: 'chapters/208-arrests/section-208-special-arrests.md', date: 'May 13, 2026' },
  { proc: '208-69', file: 'chapters/208-arrests/section-208-notifications.md', date: 'May 13, 2026' },
  { proc: '213-03', file: 'chapters/213-mobilization-emergency/section-213-mobilization-readiness.md', date: 'May 13, 2026' },
  { proc: '216-12', file: 'chapters/216-aided-cases/section-216-special-aided.md', date: 'May 5, 2026' },
  { proc: '217-01', file: 'chapters/217-vehicle-collisions/section-217-collisions-general.md', date: 'May 5, 2026' },
  { proc: '320-04', file: 'chapters/320-personnel-matters/section-320-04.md', date: 'May 18, 2026', rev: 'R.O. 39' },
];

// Procedures that need new content (file doesn't contain procedure)
const MISSING_CONTENT = [
  { proc: '212-57', file: 'chapters/212-command-operations/section-212-miscellaneous.md', topic: 'Unknown - needs extraction' },
  { proc: '214-34', file: 'chapters/214-quality-of-life/section-214-enforcement-programs.md', topic: 'Quality of Life enforcement' },
  { proc: '208-14', file: 'chapters/208-arrests/section-208-law-and-processing.md', topic: 'Arrest processing' },
  { proc: '210-19', file: 'chapters/210-prisoners/section-210-general-procedure.md', topic: 'Special prisoner cases' },
  { proc: '218-26', file: 'chapters/218-property-general/section-218-evidence-processing.md', topic: 'Evidence processing' },
  { proc: '216-13', file: 'chapters/216-aided-cases/section-216-special-aided.md', topic: 'Special aided cases' },
  { proc: '216-15', file: 'chapters/216-aided-cases/section-216-special-aided.md', topic: 'Special aided cases' },
  { proc: '217-07', file: 'chapters/217-vehicle-collisions/section-217-collisions-general.md', topic: 'Collision investigation' },
  { proc: '217-09', file: 'chapters/217-vehicle-collisions/section-217-collisions-general.md', topic: 'Collision reporting' },
];

console.log('🔧 Applying May 2026 Date Updates\n');
console.log('=' .repeat(80) + '\n');

// Apply date updates
for (const update of DATE_UPDATES) {
  const filePath = join('/Users/hattan/Projects/nypd-sergeant-study-guide', update.file);
  let content = readSafe(filePath);

  if (!content) {
    results.push({ ...update, status: 'SKIPPED', reason: 'File not found' });
    continue;
  }

  const changes = [];

  // Check for existing update notice and update date
  const oldNoticePattern = />( 📅| ⚠️) \*\*(UPDATE|UPDATED):\*\* This procedure was updated on .+/;
  const match = content.match(oldNoticePattern);

  if (match) {
    const newNotice = `> ⚠️ **UPDATED:** This procedure was updated on **${update.date}**${update.rev ? ` (${update.rev})` : ''}. Review the latest Patrol Guide for current language.`;
    content = content.replace(oldNoticePattern, newNotice);
    changes.push(`Updated date to ${update.date}`);
    if (update.rev) changes.push(`Added ${update.rev}`);
  } else {
    // No existing notice - check if procedure header exists
    const procHeader = content.match(new RegExp(`## P\\.G\\. ${update.proc}[^\\n]*`));
    if (procHeader) {
      const newNotice = `\n> ⚠️ **UPDATED:** This procedure was updated on **${update.date}**${update.rev ? ` (${update.rev})` : ''}. Review the latest Patrol Guide for current language.\n`;
      content = content.replace(procHeader[0], newNotice + procHeader[0]);
      changes.push(`Added update notice for ${update.date}`);
    }
  }

  if (changes.length > 0) {
    writeFileSync(filePath, content, 'utf-8');
    results.push({ ...update, status: 'UPDATED', changes });
    console.log(`✅ P.G. ${update.proc} — ${update.file}`);
    console.log(`   ${changes.join(', ')}`);
  } else {
    results.push({ ...update, status: 'NO_CHANGE', reason: 'Already current' });
  }
  console.log('');
}

// Check missing content
console.log('=' .repeat(80));
console.log('\n📋 PROCEDURES REQUIRING CONTENT ADDITION\n');

for (const item of MISSING_CONTENT) {
  const filePath = join('/Users/hattan/Projects/nypd-sergeant-study-guide', item.file);
  const content = readSafe(filePath);
  const extractedPath = join('/Users/hattan/Projects/nypd-sergeant-study-guide/build/update-comparison', `${item.proc}.txt`);
  const extracted = readSafe(extractedPath);

  if (!content) {
    results.push({ ...item, status: 'SKIPPED', reason: 'Section file does not exist' });
    console.log(`⊘ P.G. ${item.proc} — Section file does not exist`);
  } else if (!extracted) {
    results.push({ ...item, status: 'SKIPPED', reason: 'No extracted content available' });
    console.log(`⊘ P.G. ${item.proc} — No extracted content (needs manual review)`);
  } else if (!content.includes(item.proc)) {
    results.push({ ...item, status: 'NEEDS_CONTENT', reason: 'Procedure not in section file' });
    console.log(`⚠️  P.G. ${item.proc} — Procedure not found in ${item.file}`);
    console.log(`    Topic: ${item.topic}`);
    console.log(`    Extracted content available: Yes`);
  } else {
    results.push({ ...item, status: 'FOUND', reason: 'Content exists' });
  }
  console.log('');
}

// Final summary table
console.log('=' .repeat(80));
console.log('\n📊 FINAL SUMMARY TABLE\n');
console.log('| Procedure | File Edited | What Changed | Skipped (Reason) |');
console.log('|-----------|-------------|--------------|------------------|');

for (const r of results) {
  const fileShort = r.file.replace('chapters/', '').replace('section-', '');
  const changes = r.changes ? r.changes.join('; ') : '-';
  const skipped = r.reason || '-';

  if (r.status === 'UPDATED') {
    console.log(`| ${r.proc} | ${fileShort} | ${changes} | - |`);
  } else if (r.status === 'NEEDS_CONTENT') {
    console.log(`| ${r.proc} | ${fileShort} | - | Content not in section file |`);
  } else if (r.status === 'SKIPPED') {
    console.log(`| ${r.proc} | ${fileShort} | - | ${r.reason} |`);
  } else {
    console.log(`| ${r.proc} | ${fileShort} | ${changes || 'Already current'} | - |`);
  }
}

// Write full results
writeFileSync(
  '/Users/hattan/Projects/nypd-sergeant-study-guide/build/update-comparison/MAY-2026-FINAL-RESULTS.json',
  JSON.stringify(results, null, 2)
);

console.log('\n💾 Full results: build/update-comparison/MAY-2026-FINAL-RESULTS.json');
