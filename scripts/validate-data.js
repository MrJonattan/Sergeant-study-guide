#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, '..', 'build', 'data.js');
const content = fs.readFileSync(dataFile, 'utf8');

console.log('=== NYPD Study Guide Data Validation ===\n');

// Parse STUDY_DATA by brace matching
const dataStart = content.indexOf('{');
let depth = 0;
let endIdx = dataStart;
for (let i = dataStart; i < content.length; i++) {
  if (content[i] === '{') depth++;
  else if (content[i] === '}') depth--;
  if (depth === 0) { endIdx = i; break; }
}

const jsonStr = content.substring(dataStart, endIdx + 1);
let data;
try {
  data = JSON.parse(jsonStr);
  console.log('✓ Valid JSON structure');
} catch (e) {
  console.error('✗ JSON parse error:', e.message);
  process.exit(1);
}

// Validate chapters
let errors = 0;
let warnings = 0;
let totalSections = 0;
let totalQuestions = 0;

console.log(`\n--- Chapter Validation (${data.chapters.length} chapters) ---`);

for (const ch of data.chapters) {
  if (!ch.id || !ch.sectionNum || !ch.title) {
    console.error(`  ✗ ${ch.id || 'UNKNOWN'}: Missing required fields`);
    errors++;
    continue;
  }

  if (!ch.readme || ch.readme.length < 50) {
    console.warn(`  ⚠ ${ch.id}: Short readme (${ch.readme?.length || 0} chars)`);
    warnings++;
  }

  if (!Array.isArray(ch.sections)) {
    console.error(`  ✗ ${ch.id}: Missing sections array`);
    errors++;
    continue;
  }

  for (const sec of ch.sections) {
    totalSections++;
    if (!sec.filename) {
      console.error(`  ✗ ${ch.id}: Section missing filename`);
      errors++;
    }
    if (!sec.content || sec.content.length < 50) {
      console.error(`  ✗ ${ch.id}/${sec.filename}: Short/missing content (${sec.content?.length || 0} chars)`);
      errors++;
    }
    // Check for .md references in content
    if (sec.content && /\[([^\]]+)\]\([^)]*\.md\)/.test(sec.content)) {
      console.error(`  ✗ ${ch.id}/${sec.filename}: Contains markdown links`);
      errors++;
    }
  }

  if (!Array.isArray(ch.questions)) {
    console.error(`  ✗ ${ch.id}: Missing questions array`);
    errors++;
  } else {
    totalQuestions += ch.questions.length;
  }

  // Check readme for .md links
  if (ch.readme && /\[([^\]]+)\]\([^)]*\.md\)/.test(ch.readme)) {
    console.error(`  ✗ ${ch.id}: README contains markdown links`);
    errors++;
  }
}

console.log(`  Total sections: ${totalSections}`);
console.log(`  Total questions: ${totalQuestions}`);

// Validate exam questions
if (data.examQuestions && Array.isArray(data.examQuestions)) {
  console.log(`\n--- Exam Questions (${data.examQuestions.length}) ---`);
  for (let i = 0; i < data.examQuestions.length; i++) {
    const q = data.examQuestions[i];
    if (!q.number || !q.text || !q.options || q.options.length === 0) {
      console.error(`  ✗ Q${i}: Invalid structure`);
      errors++;
    }
  }
} else {
  console.warn('  ⚠ No exam questions found');
}

// Check cheat sheet
if (!data.cheatSheet || data.cheatSheet.length === 0) {
  console.warn('  ⚠ Cheat sheet is empty');
} else {
  console.log(`\n--- Cheat Sheet ---`);
  console.log(`  Length: ${data.cheatSheet.length} chars`);
}

// Sample content legibility
console.log('\n--- Content Legibility ---');
const sampleChapter = data.chapters[0];
if (sampleChapter && sampleChapter.sections[0]) {
  const sample = sampleChapter.sections[0].content.substring(0, 500);
  const hasFormatting = sample.includes('**') && sample.includes('##');
  const hasProperMarkdown = sample.includes('---') || sample.includes('|');
  console.log(`  Sample has markdown formatting: ${hasFormatting}`);
  console.log(`  Sample has proper structure: ${hasProperMarkdown}`);
}

// Final summary
console.log('\n=== SUMMARY ===');
if (errors === 0 && warnings === 0) {
  console.log('✓ All validations passed!');
} else {
  console.log(`✗ Errors: ${errors}, Warnings: ${warnings}`);
}

process.exit(errors > 0 ? 1 : 0);
