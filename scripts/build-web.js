#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const PROJECT = path.resolve(__dirname, '..');
const CHAPTERS_DIR = path.join(PROJECT, 'chapters');
const OUTPUT_DIR = path.join(PROJECT, 'build');

const CHAPTER_ORDER = [
  '200-general', '202-duties-responsibilities', '207-complaints',
  '208-arrests', '209-summonses', '210-prisoners', '211-court-appearances',
  '212-command-operations', '213-mobilization-emergency', '214-quality-of-life',
  '215-juvenile-matters', '216-aided-cases', '217-vehicle-collisions',
  '218-property-general', '219-department-property', '220-citywide-incident-mgmt',
  '221-tactical-operations', '303-duties-responsibilities', '304-general-regulations',
  '305-uniforms-equipment', '318-disciplinary-matters', '319-civilian-personnel',
  '320-personnel-matters', '324-leave-payroll-timekeeping', '329-career-development',
  '330-medical-health-wellness', '331-evaluations', '332-employee-rights'
];

function readFile(fp) {
  try { return fs.readFileSync(fp, 'utf8'); }
  catch { return null; }
}

function parseReviewQuestions(md) {
  if (!md) return [];
  const questions = [];

  // Split by --- or ## Question or ### Question boundaries
  const blocks = md.split(/\n---\n|\n(?=##?#?\s+Q(?:uestion\s+)?\d)/).filter(b => b.trim());

  for (const block of blocks) {
    if (!block.includes('<details>')) continue;

    // Extract question number and text from any format:
    // A: ### Question N / ## Question N  (with or without bold text)
    // B: **N. text**
    // C: **N.** text
    const fmtA = block.match(/##?#?\s+(?:Question\s+)?(\d+)\s*\n+(?:\*\*)?([\s\S]*?)(?:\*\*)?\s*?\n([\s\S]*?)<details>/);
    const fmtB = block.match(/\*\*(\d+)\.\s+([\s\S]*?)\*\*\s*\n([\s\S]*?)<details>/);
    const fmtC = block.match(/\*\*(\d+)\.\*\*\s+([\s\S]*?)\n([\s\S]*?)<details>/);

    const fmt = fmtA || fmtB || fmtC;
    if (!fmt) continue;

    const num = parseInt(fmt[1]);
    const text = fmt[2].replace(/\*\*/g, '').trim();
    const optionsBlock = fmt[3];

    // Extract answer block
    const ansBlock = block.match(/<details>[\s\S]*?<summary>Answer<\/summary>\s*\n([\s\S]*?)<\/details>/);
    if (!ansBlock) continue;
    const answerBlock = ansBlock[1].trim();

    // Parse options from any format: "- A) text", "A) text", "A. text", "- A. text"
    const options = [];
    const optRe = /^[\s-]*([A-D])[.)]\s*(.+)/gm;
    let om;
    while ((om = optRe.exec(optionsBlock)) !== null) {
      options.push(`${om[1]}) ${om[2].trim()}`);
    }

    // Parse answer letter: **B)**, **B.**, **Correct Answer: B)**, **B) text**
    const ansM = answerBlock.match(/\*\*(?:Correct Answer:\s*)?([A-D])[.)]/);
    const answer = ansM ? ansM[1] : '';
    const explanation = answerBlock
      .replace(/\*\*(?:Correct Answer:\s*)?[A-D][.)][^*]*\*\*\s*\n?/g, '')
      .replace(/\*\*Reference:.*?\*\*/g, '')
      .trim();

    // For open-ended questions (no options), store as free-response
    const isMultipleChoice = options.length > 0;

    questions.push({
      number: num,
      text,
      options,
      answer,
      answerFull: answer ? `${answer}) ${explanation.split('\n')[0]}` : '',
      explanation,
      type: isMultipleChoice ? 'mc' : 'open'
    });
  }

  return questions;
}

function parsePracticeExam(md) {
  if (!md) return [];
  const answerMap = {};
  const keyRe = /\|\s*(\d+)\s*\|\s*([A-D])\s*\|\s*(.*?)\s*\|/g;
  let km;
  while ((km = keyRe.exec(md)) !== null) {
    answerMap[parseInt(km[1])] = { answer: km[2], source: km[3].trim() };
  }
  const questions = [];
  const qBlocks = md.split(/\n---\n/);
  for (const block of qBlocks) {
    const qm = block.match(/\*\*(\d+)\.\s+([\s\S]*?)\*\*\s*\n([\s\S]*)/);
    if (!qm) continue;
    const num = parseInt(qm[1]);
    const options = [];
    const optRe = /- ([A-D]\).+)/g;
    let om;
    while ((om = optRe.exec(qm[3])) !== null) options.push(om[1]);
    if (options.length === 0) continue;
    const info = answerMap[num] || {};
    questions.push({
      number: num,
      text: qm[2].trim(),
      options,
      answer: info.answer || '',
      source: info.source || ''
    });
  }
  return questions;
}

function cleanReadme(md) {
  // Remove "Chapter Contents" sections that list .md file links
  return md
    .replace(/## Chapter Contents\n[\s\S]*?(?=\n## |\n---|\n$)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\.md\)/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const chapters = [];
for (const id of CHAPTER_ORDER) {
  const dir = path.join(CHAPTERS_DIR, id);
  if (!fs.existsSync(dir)) continue;
  const readme = cleanReadme(readFile(path.join(dir, 'README.md')) || '');
  const keyTerms = readFile(path.join(dir, 'key-terms.md')) || '';
  const reviewRaw = readFile(path.join(dir, 'review-questions.md')) || '';
  const sectionFiles = fs.readdirSync(dir)
    .filter(f => f.startsWith('section-') && f.endsWith('.md')).sort();
  const sections = sectionFiles.map(f => ({
    filename: f,
    content: fs.readFileSync(path.join(dir, f), 'utf8')
  }));
  const titleM = readme.match(/^#\s+.*?—\s+(.*)/m);
  const sectionNum = id.split('-')[0];
  chapters.push({
    id, sectionNum,
    title: titleM ? titleM[1].trim() : id,
    readme, sections, keyTerms,
    reviewQuestions: reviewRaw,
    questions: parseReviewQuestions(reviewRaw)
  });
}

const cheatSheet = readFile(path.join(PROJECT, 'output', 'quick-reference-cheat-sheet.md')) || '';
const examRaw = readFile(path.join(PROJECT, 'output', 'master-practice-exam.md')) || '';
const examQuestions = parsePracticeExam(examRaw);

const data = {
  chapters,
  cheatSheet,
  examQuestions,
  totalQuestions: chapters.reduce((s, c) => s + c.questions.length, 0)
};

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.writeFileSync(
  path.join(OUTPUT_DIR, 'data.js'),
  `window.STUDY_DATA=${JSON.stringify(data)};`
);
console.log(`Built ${chapters.length} chapters, ${data.totalQuestions} chapter quiz questions, ${examQuestions.length} exam questions`);
