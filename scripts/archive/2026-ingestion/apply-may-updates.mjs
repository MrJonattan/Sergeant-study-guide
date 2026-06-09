#!/usr/bin/env node
/**
 * apply-may-updates.mjs
 *
 * Applies substantive content changes from May 2026 updates to study guide sections.
 * Only edits where content actually differs.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const CHAPTERS_DIR = '/Users/hattan/Projects/nypd-sergeant-study-guide/chapters';
const COMPARISON_DIR = '/Users/hattan/Projects/nypd-sergeant-study-guide/build/update-comparison';

// Results table
const results = [];

// Helper to read files safely
function readSafe(path) {
  try {
    return existsSync(path) ? readFileSync(path, 'utf-8') : null;
  } catch {
    return null;
  }
}

// Update a section with new date/revision info
function updateDateRevision(filePath, procNum, newDate, newRevision, newPages) {
  let content = readSafe(filePath);
  if (!content) return { success: false, reason: 'File not found' };

  let changed = false;

  // Check if date header exists in file
  const datePattern = /Date Effective:\s*([\d/]+)/i;
  const revPattern = /Last Revision:\s*(R\.?O\.?\s*\d+)/i;

  const dateMatch = content.match(datePattern);
  const revMatch = content.match(revPattern);

  // Convert date format (05/19/26 → May 19, 2026)
  const dateParts = newDate.match(/(\d{2})\/(\d{2})\/(\d{2})/);
  const formattedDate = dateParts ? `${parseInt(dateParts[2])}/${parseInt(dateParts[1])}/20${dateParts[3]}` : newDate;

  if (dateMatch && dateMatch[1] !== newDate) {
    content = content.replace(datePattern, `Date Effective: **${newDate}**`);
    changed = true;
  }

  if (revMatch && !content.includes(newRevision)) {
    content = content.replace(revPattern, `Last Revision: **${newRevision}**`);
    changed = true;
  }

  if (changed) {
    writeFileSync(filePath, content, 'utf-8');
    return { success: true, changes: ['Updated date/revision'] };
  }

  return { success: false, reason: 'No changes needed' };
}

// Process NST Officer (202-05)
function process202_05() {
  const filePath = join(CHAPTERS_DIR, '202-duties-responsibilities', 'section-202-officers.md');
  const extracted = readSafe(join(COMPARISON_DIR, '202-05.txt'));
  let content = readSafe(filePath);

  if (!extracted || !content) {
    return { proc: '202-05', file: 'section-202-officers.md', status: 'SKIPPED', reason: 'Missing files' };
  }

  const changes = [];

  // Fix date (May 18 → May 19)
  if (content.includes('May 18, 2026') && extracted.includes('05/19/26')) {
    content = content.replace('May 18, 2026', 'May 19, 2026');
    changes.push('Fixed date: May 18 → May 19');
  }

  // Add R.O. number if missing
  if (!content.includes('R.O. 40') && extracted.includes('R.O. 40')) {
    const updateNotice = content.match(/> 📅 \*\*UPDATE:\*\* This procedure was updated on .+/);
    if (updateNotice) {
      content = content.replace(
        updateNotice[0],
        `> ⚠️ **UPDATED:** This procedure was updated on **May 19, 2026** (R.O. 40). Review latest Patrol Guide for current language.`
      );
      changes.push('Added R.O. 40 to update notice');
    }
  }

  if (changes.length > 0) {
    writeFileSync(filePath, content, 'utf-8');
    return { proc: '202-05', file: 'section-202-officers.md', status: 'UPDATED', changes };
  }

  return { proc: '202-05', file: 'section-202-officers.md', status: 'NO_CHANGES', reason: 'Content current' };
}

// Process NST Supervisor (202-20)
function process202_20() {
  const filePath = join(CHAPTERS_DIR, '202-duties-responsibilities', 'section-202-supervisors.md');
  const extracted = readSafe(join(COMPARISON_DIR, '202-20.txt'));
  let content = readSafe(filePath);

  if (!extracted || !content) {
    return { proc: '202-20', file: 'section-202-supervisors.md', status: 'SKIPPED', reason: 'Missing files' };
  }

  const changes = [];

  // Fix date (May 18 → May 19)
  if (content.includes('May 18, 2026') && extracted.includes('05/19/26')) {
    content = content.replace('May 18, 2026', 'May 19, 2026');
    changes.push('Fixed date: May 18 → May 19');
  }

  // Add R.O. number
  if (!content.includes('R.O. 40') && extracted.includes('R.O. 40')) {
    const updateNotice = content.match(/> 📅 \*\*UPDATE:\*\* This procedure was updated on .+/);
    if (updateNotice) {
      content = content.replace(
        updateNotice[0],
        `> ⚠️ **UPDATED:** This procedure was updated on **May 19, 2026** (R.O. 40). Review latest Patrol Guide for current language.`
      );
      changes.push('Added R.O. 40 to update notice');
    }
  }

  if (changes.length > 0) {
    writeFileSync(filePath, content, 'utf-8');
    return { proc: '202-20', file: 'section-202-supervisors.md', status: 'UPDATED', changes };
  }

  return { proc: '202-20', file: 'section-202-supervisors.md', status: 'NO_CHANGES', reason: 'Content current' };
}

// Process 219-12 (Fuel Delivery)
function process219_12() {
  const filePath = join(CHAPTERS_DIR, '219-department-property', 'section-219-equipment-supplies.md');
  const extracted = readSafe(join(COMPARISON_DIR, '219-12.txt'));
  let content = readSafe(filePath);

  if (!extracted) {
    return { proc: '219-12', file: 'section-219-equipment-supplies.md', status: 'SKIPPED', reason: 'No extracted content' };
  }

  if (!content) {
    // Section doesn't exist - need to check if 219-12 is covered elsewhere
    const otherFiles = [
      join(CHAPTERS_DIR, '219-department-property', 'section-219-fuel-facilities.md'),
      join(CHAPTERS_DIR, '219-department-property', 'section-219-vehicles-fleet.md'),
    ];
    for (const f of otherFiles) {
      if (existsSync(f)) {
        content = readSafe(f);
        if (content && content.includes('219-12')) {
          return { proc: '219-12', file: f.replace(CHAPTERS_DIR + '/', ''), status: 'COVERED', reason: 'Covered in existing section' };
        }
      }
    }
    return { proc: '219-12', file: 'section-219-equipment-supplies.md', status: 'SKIPPED', reason: 'Section file does not exist' };
  }

  const changes = [];

  // Check for fuel delivery content
  if (extracted.includes('DELIVERY OF GASOLINE') && !content.includes('DELIVERY OF GASOLINE')) {
    // Add new section for 219-12
    const newSection = `
## P.G. 219-12: Delivery of Gasoline to Fuel Dispensing Stations

> ⚠️ **UPDATED:** This procedure was updated on **May 26, 2026** (R.O. 43).

### Purpose
To determine the amount of fuel on hand, prior to, and after the delivery of, gasoline to a Department fuel dispensing facility.

### Desk Officer Responsibilities
1. **Assign member of the service** to supervise fuel delivery

### Assigned Member Responsibilities
2. **Determine fuel amount** using electronic tank monitor (located at desk area)
3. **Press "Print" button** and advise delivery driver of **90% ullage amount** (amount that can safely be added)
4. **Ascertain meter reading** on fuel vendor's truck prior to pumping:
   - Ensure fuel meter is set to **zero** before pumping begins
   - **Inspect and initial** blank vending invoice prior to delivery
   - **Verify** the same invoice is returned after completion
5. **Use electronic tank monitor** to verify delivery amount:
   - Press "Print" and verify new volume (storage balance) reflects delivery amount
6. **Report delivery amounts** to desk officer

### Desk Officer - Command Log Entry
7. Enter in **Command Log**:
   - Amount of fuel received
   - Invoice number

> **Exam Alert:** The electronic tank monitor is used BOTH before (to get 90% ullage) AND after (to verify delivery) the fuel delivery. The assigned member must **initial the blank invoice BEFORE** pumping and verify the same invoice after.

---
`;
    content = content.trim() + newSection;
    changes.push('Added 219-12 fuel delivery procedure');
  }

  if (changes.length > 0) {
    writeFileSync(filePath, content, 'utf-8');
    return { proc: '219-12', file: 'section-219-equipment-supplies.md', status: 'UPDATED', changes };
  }

  return { proc: '219-12', file: 'section-219-equipment-supplies.md', status: 'NO_CHANGES', reason: 'Content current' };
}

// Process 212-12 (Intelligence Reporting) - May 13 update
function process212_12() {
  const filePath = join(CHAPTERS_DIR, '212-command-operations', 'section-212-technology-systems.md');
  const extracted = readSafe(join(COMPARISON_DIR, '212-12.txt'));
  let content = readSafe(filePath);

  if (!extracted || !content) {
    return { proc: '212-12', file: 'section-212-technology-systems.md', status: 'SKIPPED', reason: 'Missing files' };
  }

  const changes = [];

  // Check for date update (May 13, 2026)
  if (extracted.includes('05/13/26') && !content.includes('May 13, 2026')) {
    // Already has update notice from June ingestion
    if (content.includes('May 12, 2026')) {
      content = content.replace('May 12, 2026', 'May 13, 2026');
      changes.push('Fixed date: May 12 → May 13');
    }
  }

  if (changes.length > 0) {
    writeFileSync(filePath, content, 'utf-8');
    return { proc: '212-12', file: 'section-212-technology-systems.md', status: 'UPDATED', changes };
  }

  return { proc: '212-12', file: 'section-212-technology-systems.md', status: 'NO_CHANGES', reason: 'Content current' };
}

// Process 212-99 (AMBER Alert) - May 13 update
function process212_99() {
  const filePath = join(CHAPTERS_DIR, '212-command-operations', 'section-212-technology-systems.md');
  const extracted = readSafe(join(COMPARISON_DIR, '212-99.txt'));
  let content = readSafe(filePath);

  if (!extracted || !content) {
    return { proc: '212-99', file: 'section-212-technology-systems.md', status: 'SKIPPED', reason: 'Missing files' };
  }

  // Check if AMBER Alert section exists and needs date update
  if (content.includes('212-99') && content.includes('May 12, 2026')) {
    content = content.replace('May 12, 2026', 'May 13, 2026');
    writeFileSync(filePath, content, 'utf-8');
    return { proc: '212-99', file: 'section-212-technology-systems.md', status: 'UPDATED', changes: ['Fixed date: May 12 → May 13'] };
  }

  return { proc: '212-99', file: 'section-212-technology-systems.md', status: 'NO_CHANGES', reason: 'Content current' };
}

// Main execution
console.log('🔧 Applying May 2026 Updates\n');
console.log('=' .repeat(70) + '\n');

const processors = [
  process202_05,
  process202_20,
  process219_12,
  process212_12,
  process212_99,
];

for (const proc of processors) {
  const result = proc();
  results.push(result);

  if (result.status === 'UPDATED') {
    console.log(`✅ P.G. ${result.proc} — ${result.file}`);
    console.log(`   Changes: ${result.changes.join(', ')}`);
  } else if (result.status === 'SKIPPED') {
    console.log(`⊘ P.G. ${result.proc} — SKIPPED: ${result.reason}`);
  } else {
    console.log(`✓ P.G. ${result.proc} — No changes needed`);
  }
  console.log('');
}

// Summary
console.log('=' .repeat(70));
console.log('\n📊 SUMMARY TABLE\n');
console.log('| Procedure | File | Status | Changes |');
console.log('|-----------|------|--------|---------|');

for (const r of results) {
  const changesStr = r.changes ? r.changes.join('; ') : r.reason || '-';
  console.log(`| ${r.proc} | ${r.file} | ${r.status} | ${changesStr.substring(0, 50)}${changesStr.length > 50 ? '...' : ''} |`);
}
