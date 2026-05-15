/**
 * Build pipeline for NYPD Sergeant Study Guide
 * Reads chapter markdown files and generates structured JSON output
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  StudyData,
  Chapter,
  Section,
  Question,
  ExamQuestion,
  SergeantFocus,
  SergeantCategory,
  StudyDataSchema,
} from './types';
import {
  parseReviewQuestions,
  parsePracticeExam,
  extractSergeantFocus,
  cleanReadme,
  parseSectionFile,
} from './parser';

// ─────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────

// Auto-generate version from git commit or use env variable
const DATA_VERSION = process.env.DATA_VERSION || new Date().toISOString().split('T')[0].replace(/-/g, '');

const CHAPTER_ORDER = [
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

const SERGEANT_CATEGORIES: SergeantCategory[] = [
  { id: 'prisoner-mgmt', label: 'Prisoner Management', chapters: ['210-prisoners'] },
  { id: 'arrest-processing', label: 'Arrest Processing', chapters: ['208-arrests'] },
  { id: 'supervisor-response', label: 'Supervisor Response', chapters: ['212-command-operations'] },
  { id: 'documentation', label: 'Documentation & Reports', chapters: ['212-command-operations'] },
  { id: 'property-evidence', label: 'Property & Evidence', chapters: ['218-property-general', '219-department-property'] },
  { id: 'court-legal', label: 'Court & Legal', chapters: ['211-court-appearances'] },
  { id: 'use-of-force', label: 'Use of Force', chapters: ['221-tactical-operations'] },
  { id: 'juvenile', label: 'Juvenile Procedures', chapters: ['215-juvenile-matters'] },
  { id: 'personnel-leave', label: 'Personnel & Leave', chapters: ['319-civilian-personnel', '324-leave-payroll-timekeeping', '329-career-development'] },
  { id: 'equipment-uniforms', label: 'Equipment & Uniforms', chapters: ['305-uniforms-equipment'] },
  { id: 'command-ops', label: 'Command Operations', chapters: ['212-command-operations', '220-citywide-incident-mgmt'] },
  { id: 'qol-enforcement', label: 'Quality of Life', chapters: ['214-quality-of-life'] },
  { id: 'mobilization', label: 'Mobilization & Emergency', chapters: ['213-mobilization-emergency'] },
  { id: 'disciplinary', label: 'Disciplinary Matters', chapters: ['318-disciplinary-matters', '332-employee-rights'] },
  { id: 'complaints', label: 'Complaints & Investigations', chapters: ['207-complaints'] },
  { id: 'medical-wellness', label: 'Medical & Wellness', chapters: ['330-medical-health-wellness'] },
  { id: 'general-regulations', label: 'General Regulations', chapters: ['304-general-regulations'] },
];

// ─────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────

function readFile(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// Chapter Builder
// ─────────────────────────────────────────────

function buildChapter(chapterId: string, chaptersDir: string): Chapter | null {
  const dir = path.join(chaptersDir, chapterId);
  if (!fs.existsSync(dir)) {
    console.warn(`Warning: Chapter directory not found: ${dir}`);
    return null;
  }

  const readme = cleanReadme(readFile(path.join(dir, 'README.md')) || '');
  const keyTerms = readFile(path.join(dir, 'key-terms.md')) || '';
  const reviewRaw = readFile(path.join(dir, 'review-questions.md')) || '';

  // Read section files
  const sectionFiles = fs
    .readdirSync(dir)
    .filter((f) => f.startsWith('section-') && f.endsWith('.md'))
    .sort();

  const sections: Section[] = sectionFiles.map((f) =>
    parseSectionFile(f, fs.readFileSync(path.join(dir, f), 'utf8'))
  );

  // Extract Sergeant Focus callouts from all sections
  const sergeantFocus: SergeantFocus[] = [];
  for (const section of sections) {
    const extracted = extractSergeantFocus(section.content, section.filename);
    sergeantFocus.push(...extracted);
  }

  // Extract title from README
  const titleMatch = readme.match(/^#\s+.*?—\s+(.*)/m);
  const sectionNum = chapterId.split('-')[0];

  const chapter: Chapter = {
    id: chapterId as `${string}-${string}`,
    sectionNum,
    title: titleMatch ? titleMatch[1].trim() : chapterId,
    readme,
    sections,
    keyTerms,
    reviewQuestions: reviewRaw,
    questions: parseReviewQuestions(reviewRaw),
    sergeantFocus,
  };

  return chapter;
}

// ─────────────────────────────────────────────
// Main Build Function
// ─────────────────────────────────────────────

export interface BuildOptions {
  projectRoot: string;
  outputDir: string;
  format?: 'json' | 'js';
}

export function build(options: BuildOptions): StudyData {
  const { projectRoot, outputDir, format = 'json' } = options;

  const chaptersDir = path.join(projectRoot, 'chapters');
  const assetsDir = path.join(projectRoot, 'assets');

  console.log('Building study guide...');
  console.log(`  Chapters directory: ${chaptersDir}`);
  console.log(`  Output directory: ${outputDir}`);

  // Build all chapters
  const chapters: Chapter[] = [];
  for (const chapterId of CHAPTER_ORDER) {
    const chapter = buildChapter(chapterId, chaptersDir);
    if (chapter) {
      chapters.push(chapter);
    }
  }

  // Load static assets
  const cheatSheet = readFile(path.join(assetsDir, 'quick-reference-cheat-sheet.md')) || '';
  const examRaw = readFile(path.join(assetsDir, 'master-practice-exam.md')) || '';
  const examQuestions = parsePracticeExam(examRaw);

  // Build study data
  const studyData: StudyData = {
    chapters,
    cheatSheet,
    examQuestions,
    totalQuestions: chapters.reduce((sum, c) => sum + c.questions.length, 0),
    sergeantCategories: SERGEANT_CATEGORIES,
    version: DATA_VERSION,
  };

  // Validate against schema
  try {
    StudyDataSchema.parse(studyData);
    console.log('  ✓ Data validation passed');
  } catch (error) {
    console.error('  ✗ Data validation failed:', error);
    throw new Error('Generated data failed schema validation');
  }

  // Create output directory if needed
  fs.mkdirSync(outputDir, { recursive: true });

  // Write output
  const outputPath = path.join(outputDir, 'data.json');
  fs.writeFileSync(outputPath, JSON.stringify(studyData, null, 2));
  console.log(`  ✓ Wrote ${outputPath}`);

  // Also write JS format for web compatibility
  if (format === 'js') {
    const jsPath = path.join(outputDir, 'data.js');
    const jsContent = `window.STUDY_DATA = ${JSON.stringify(studyData)};\nwindow.SERGEANT_CATEGORIES = ${JSON.stringify(SERGEANT_CATEGORIES)};`;
    fs.writeFileSync(jsPath, jsContent);
    console.log(`  ✓ Wrote ${jsPath}`);
  }

  // Print summary
  const totalSergeantFocus = chapters.reduce((sum, c) => sum + c.sergeantFocus.length, 0);
  console.log('\nBuild Summary:');
  console.log(`  Chapters: ${chapters.length}`);
  console.log(`  Total questions: ${studyData.totalQuestions}`);
  console.log(`  Exam questions: ${examQuestions.length}`);
  console.log(`  Sergeant Focus callouts: ${totalSergeantFocus}`);

  if (chapters.length < CHAPTER_ORDER.length) {
    const built = new Set(chapters.map((c) => c.id));
    const missing = CHAPTER_ORDER.filter((id) => !built.has(id));
    console.warn(`\n  ⚠ Warning: Expected ${CHAPTER_ORDER.length} chapters but built ${chapters.length}`);
    console.warn(`  Missing: ${missing.join(', ')}`);
  }

  return studyData;
}

// ─────────────────────────────────────────────
// CLI Entry Point
// ─────────────────────────────────────────────

if (require.main === module) {
  // __dirname is packages/core/dist, so go up 2 levels to reach packages/core, then use parent as project root
  const packageDir = path.resolve(__dirname, '../..'); // packages/core
  const projectRoot = process.argv[2] || path.resolve(packageDir, '..'); // parent of packages/core
  const outputDir = process.argv[3] || path.join(projectRoot, 'build');

  build({
    projectRoot,
    outputDir,
    format: 'js', // Default to JS for web compatibility
  });
}
