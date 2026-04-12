#!/usr/bin/env node
/**
 * Audit script to verify all source material is covered in the study guide
 * Compares expected Patrol Guide & Administrative Guide procedures against chapters/
 */

const fs = require('fs');
const path = require('path');

const PROJECT = path.resolve(__dirname, '..');
const CHAPTERS_DIR = path.join(PROJECT, 'chapters');

// Expected 200-series procedures from Patrol Guide
const EXPECTED_200_SERIES = [
  { num: '200', title: 'General' },
  { num: '202', title: 'Duties and Responsibilities' },
  { num: '207', title: 'Complaints' },
  { num: '208', title: 'Arrests' },
  { num: '209', title: 'Summonses' },
  { num: '210', title: 'Prisoners' },
  { num: '211', title: 'Court Appearances' },
  { num: '212', title: 'Command Operations' },
  { num: '213', title: 'Mobilization and Emergency Incidents' },
  { num: '214', title: 'Quality of Life' },
  { num: '215', title: 'Juvenile Matters' },
  { num: '216', title: 'Aided Cases' },
  { num: '217', title: 'Vehicle Collisions' },
  { num: '218', title: 'Property – General' },
  { num: '219', title: 'Department Property' },
  { num: '220', title: 'Citywide Incident Management' },
  { num: '221', title: 'Tactical Operations' },
];

// Expected 300-series procedures from Administrative Guide
const EXPECTED_300_SERIES = [
  { num: '303', title: 'Duties and Responsibilities (Borough Command)' },
  { num: '304', title: 'General Regulations' },
  { num: '305', title: 'Uniforms and Equipment' },
  { num: '318', title: 'Disciplinary Matters' },
  { num: '319', title: 'Civilian Personnel' },
  { num: '320', title: 'Personnel Matters' },
  { num: '324', title: 'Leave, Payroll and Timekeeping' },
  { num: '329', title: 'Career Development' },
  { num: '330', title: 'Medical, Health and Wellness' },
  { num: '331', title: 'Evaluations' },
  { num: '332', title: 'Employee Rights and Responsibilities' },
];

// Expected chapter directories
const EXPECTED_CHAPTERS = [
  '200-general',
  '202-duties-responsibilities',
  '207-complaints',
  '208-arrests',
  '209-summonses',
  '210-prisoners',
  '211-court-appearances',
  '212-command-operations',
  '213-mobilization-emergency',
  '214-quality-of-life',
  '215-juvenile-matters',
  '216-aided-cases',
  '217-vehicle-collisions',
  '218-property-general',
  '219-department-property',
  '220-citywide-incident-mgmt',
  '221-tactical-operations',
  '303-duties-responsibilities',
  '304-general-regulations',
  '305-uniforms-equipment',
  '318-disciplinary-matters',
  '319-civilian-personnel',
  '320-personnel-matters',
  '324-leave-payroll-timekeeping',
  '329-career-development',
  '330-medical-health-wellness',
  '331-evaluations',
  '332-employee-rights',
];

console.log('=== NYPD Study Guide Content Coverage Audit ===\n');

// Check expected chapters exist
console.log('--- Chapter Coverage ---');
const existingChapters = fs.readdirSync(CHAPTERS_DIR)
  .filter(f => fs.statSync(path.join(CHAPTERS_DIR, f)).isDirectory())
  .filter(f => !f.startsWith('.'));

const missingChapters = EXPECTED_CHAPTERS.filter(ch => !existingChapters.includes(ch));
const extraChapters = existingChapters.filter(ch => !EXPECTED_CHAPTERS.includes(ch));

if (missingChapters.length === 0) {
  console.log(`✓ All ${EXPECTED_CHAPTERS.length} expected chapters present`);
} else {
  console.log(`✗ Missing chapters: ${missingChapters.join(', ')}`);
}

if (extraChapters.length > 0) {
  console.log(`ℹ Extra chapters (not in expected list): ${extraChapters.join(', ')}`);
}

// Check each chapter's content
console.log('\n--- Section Coverage by Chapter ---');

let totalSections = 0;
let chaptersWithContent = 0;

for (const chapter of EXPECTED_CHAPTERS) {
  const chapterPath = path.join(CHAPTERS_DIR, chapter);
  if (!fs.existsSync(chapterPath)) continue;

  const sectionFiles = fs.readdirSync(chapterPath)
    .filter(f => f.startsWith('section-') && f.endsWith('.md'));

  // Check content quality
  let sectionsWithContent = 0;
  let emptySections = [];

  sectionFiles.forEach(f => {
    const content = fs.readFileSync(path.join(chapterPath, f), 'utf8');
    if (content.length > 200) {
      sectionsWithContent++;
    } else {
      emptySections.push(f);
    }
  });

  totalSections += sectionsWithContent;

  if (sectionFiles.length === 0) {
    console.log(`⚠ ${chapter}: NO section files`);
  } else if (emptySections.length > 0) {
    console.log(`⚠ ${chapter}: ${sectionFiles.length} sections (${sectionsWithContent} with content, ${emptySections.length} thin)`);
  } else {
    console.log(`✓ ${chapter}: ${sectionFiles.length} sections`);
    chaptersWithContent++;
  }
}

console.log(`\n--- Summary ---`);
console.log(`Total sections with content: ${totalSections}`);
console.log(`Chapters with sections: ${chaptersWithContent}/${EXPECTED_CHAPTERS.length}`);

// Check build output
console.log('\n--- Build Output Check ---');
const buildDataPath = path.join(PROJECT, 'build', 'data.js');
const docsDataPath = path.join(PROJECT, 'docs', 'data.js');

if (fs.existsSync(buildDataPath)) {
  const content = fs.readFileSync(buildDataPath, 'utf8');
  const match = content.match(/window\.STUDY_DATA=({.*?});/s);
  if (match) {
    const data = JSON.parse(match[1]);
    console.log(`✓ build/data.js: ${data.chapters.length} chapters, ${data.totalQuestions} questions`);
    console.log(`  - Cheat sheet: ${data.cheatSheet.length} chars`);
    console.log(`  - Exam questions: ${data.examQuestions.length}`);
    console.log(`  - Notes extracted: ${data.notes?.length || 0}`);
  }
} else {
  console.log('✗ build/data.js not found - run npm run build:web');
}

if (fs.existsSync(docsDataPath)) {
  const content = fs.readFileSync(docsDataPath, 'utf8');
  const match = content.match(/window.STUDY_DATA=({.*?});/s);
  if (match) {
    const data = JSON.parse(match[1]);
    console.log(`✓ docs/data.js: ${data.chapters.length} chapters, ${data.totalQuestions} questions`);
  }
} else {
  console.log('✗ docs/data.js not found - run npm run deploy');
}

console.log('\n--- Assets Check ---');
const assetsDir = path.join(PROJECT, 'assets');
if (fs.existsSync(assetsDir)) {
  const assets = fs.readdirSync(assetsDir).filter(f => f.endsWith('.md'));
  console.log(`✓ assets/: ${assets.length} files`);
  assets.forEach(f => {
    const stat = fs.statSync(path.join(assetsDir, f));
    const sizeKB = Math.round(stat.size / 1024);
    console.log(`  - ${f} (${sizeKB} KB)`);
  });
} else {
  console.log('✗ assets/ directory not found');
}

console.log('\n=== Audit Complete ===');
