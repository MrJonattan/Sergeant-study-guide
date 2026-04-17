#!/usr/bin/env node
/**
 * Convert build/data.js into a Flutter-friendly JSON bundle.
 *
 * Reads window.STUDY_DATA={...} from build/data.js, strips large
 * unnecessary fields (raw markdown), copies section files to
 * mobile/assets/data/chapters/, and writes mobile/assets/data/study_data.json.
 */

const fs = require('fs');
const path = require('path');

const PROJECT = path.resolve(__dirname, '..');
const BUILD_DIR = path.join(PROJECT, 'build');
const MOBILE_DIR = path.join(PROJECT, 'mobile');
const DATA_JS = path.join(BUILD_DIR, 'data.js');
const OUTPUT_JSON = path.join(MOBILE_DIR, 'assets', 'data', 'study_data.json');
const CHAPTERS_ASSETS = path.join(MOBILE_DIR, 'assets', 'data', 'chapters');

function main() {
  if (!fs.existsSync(DATA_JS)) {
    console.error('Error: build/data.js not found. Run "npm run build:web" first.');
    process.exit(1);
  }

  // Extract JSON from data.js
  const raw = fs.readFileSync(DATA_JS, 'utf8');
  const studyMatch = raw.match(/window\.STUDY_DATA\s*=\s*({.+});/s);
  const categoriesMatch = raw.match(/window\.SERGEANT_CATEGORIES\s*=\s*(\[.+\]);/s);

  if (!studyMatch) {
    console.error('Error: Could not extract STUDY_DATA from build/data.js');
    process.exit(1);
  }

  const studyData = JSON.parse(studyMatch[1]);
  const sergeantCategories = categoriesMatch ? JSON.parse(categoriesMatch[1]) : [];

  // Strip large fields not needed by Flutter
  const slimChapters = studyData.chapters.map(ch => ({
    id: ch.id,
    sectionNum: ch.sectionNum,
    title: ch.title,
    readme: ch.readme,
    keyTerms: ch.keyTerms,
    questions: ch.questions,
    sergeantFocus: ch.sergeantFocus,
    // Omit: sections (large raw content), reviewQuestions (raw markdown)
  }));

  const output = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    chapters: slimChapters,
    cheatSheet: studyData.cheatSheet,
    examQuestions: studyData.examQuestions,
    totalQuestions: studyData.totalQuestions,
    sergeantCategories,
  };

  // Write JSON
  fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true });
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(output, null, 2));
  console.log(`Written: ${OUTPUT_JSON} (${(fs.statSync(OUTPUT_JSON).size / 1024).toFixed(0)} KB)`);

  // Copy section markdown files to mobile/assets/data/chapters/
  const chaptersDir = path.join(PROJECT, 'chapters');
  let copiedSections = 0;

  for (const ch of studyData.chapters) {
    const chapterDir = path.join(chaptersDir, ch.id);
    const destDir = path.join(CHAPTERS_ASSETS, ch.id);

    if (!fs.existsSync(chapterDir)) continue;
    fs.mkdirSync(destDir, { recursive: true });

    for (const file of fs.readdirSync(chapterDir)) {
      if (file.startsWith('section-') && file.endsWith('.md')) {
        fs.copyFileSync(
          path.join(chapterDir, file),
          path.join(destDir, file)
        );
        copiedSections++;
      }
    }
  }

  console.log(`Copied: ${copiedSections} section files to ${CHAPTERS_ASSETS}`);
}

main();