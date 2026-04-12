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
  const keyRe = /\|\s*(\d+)\s*\|\s*([A-D])\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|/g;
  const keyRe3 = /\|\s*(\d+)\s*\|\s*([A-D])\s*\|\s*(.*?)\s*\|/g;
  let km;
  while ((km = keyRe.exec(md)) !== null) {
    answerMap[parseInt(km[1])] = { answer: km[2], source: km[3].trim(), explanation: km[4].trim() };
  }
  // Fallback: 3-column table (no explanation)
  if (Object.keys(answerMap).length === 0) {
    while ((km = keyRe3.exec(md)) !== null) {
      answerMap[parseInt(km[1])] = { answer: km[2], source: km[3].trim(), explanation: '' };
    }
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
      source: info.source || '',
      explanation: info.explanation || ''
    });
  }
  return questions;
}

function cleanReadme(md) {
  // Remove internal navigation sections that list .md file links
  return md
    .replace(/## Study Files\n[\s\S]*?(?=\n## )/g, '')
    .replace(/## Study Guide Files\n[\s\S]*?(?=\n## )/g, '')
    .replace(/## Chapter Contents\n[\s\S]*?(?=\n## |\n---|\n$)/g, '')
    .replace(/## Study Tips\n[\s\S]*?(?=\n## )/g, '')
    .replace(/## Study Content\n[\s\S]*?(?=\n## )/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\.md\)/g, '$1')
    .replace(/`?section-[\w-]+\.md`?/g, '')
    .replace(/`?key-terms\.md`?/g, '')
    .replace(/`?review-questions\.md`?/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extractNotes(sections, chapterId) {
  const notes = [];

  for (const section of sections) {
    const content = section.content || section;
    const filename = section.filename || '';

    // Extract procedure number from filename (e.g., section-210-03-general.md -> 210-03)
    const procMatch = filename.match(/section-(\d+-\d+)/);
    // If no procedure number in filename, use chapter ID as fallback (e.g., "207-complaints" -> "Ch. 207")
    const procNum = procMatch ? `P.G. ${procMatch[1]}` : `Ch. ${chapterId.split('-')[0]}`;

    // Pattern 1: Blockquote NOTE - > **NOTE:** or > **Note:** or > NOTE
    const blockquoteRe = /^>\s+\*\*(?:NOTE|Note):\*\*\s*(.+)/gm;
    let match;
    while ((match = blockquoteRe.exec(content)) !== null) {
      notes.push({
        procedure: procNum,
        filename,
        text: match[1].trim()
      });
    }

    // Pattern 2: Bold inline NOTE - **NOTE:** or **Note:** not in blockquote
    const inlineRe = /(?<!^>\s+)\*\*(?:NOTE|Note):\*\*\s*([^\n]+)/g;
    while ((match = inlineRe.exec(content)) !== null) {
      // Skip if this is actually in a blockquote (check context)
      const beforeMatch = content.substring(Math.max(0, match.index - 20), match.index);
      if (!beforeMatch.trim().endsWith('>')) {
        notes.push({
          procedure: procNum,
          filename,
          text: match[1].trim()
        });
      }
    }

    // Pattern 3: NOTE header followed by content
    const headerRe = /^##+\s*NOTE\s*\n+(.+)/gm;
    while ((match = headerRe.exec(content)) !== null) {
      notes.push({
        procedure: procNum,
        filename,
        text: match[1].trim()
      });
    }

    // Pattern 4: Plain NOTE at start of line (not in bold, not blockquote)
    const plainRe = /^(?!>\s)(?:\*\*)?NOTE(?:\*\*)?:\s*(.+)/gm;
    while ((match = plainRe.exec(content)) !== null) {
      notes.push({
        procedure: procNum,
        filename,
        text: match[1].trim()
      });
    }
  }

  return notes;
}

const SERGEANT_CATEGORIES = [
  { id: 'prisoner-mgmt',      label: 'Prisoner Management',          chapters: ['210-prisoners'] },
  { id: 'arrest-processing', label: 'Arrest Processing',             chapters: ['208-arrests'] },
  { id: 'supervisor-response',label: 'Supervisor Response',           chapters: ['212-command-operations'] },
  { id: 'documentation',     label: 'Documentation & Reports',        chapters: ['212-command-operations'] },
  { id: 'property-evidence',label: 'Property & Evidence',            chapters: ['218-property-general', '219-department-property'] },
  { id: 'court-legal',        label: 'Court & Legal',                 chapters: ['211-court-appearances'] },
  { id: 'use-of-force',       label: 'Use of Force',                  chapters: ['221-tactical-operations'] },
  { id: 'juvenile',           label: 'Juvenile Procedures',            chapters: ['215-juvenile-matters'] },
  { id: 'personnel-leave',    label: 'Personnel & Leave',             chapters: ['319-civilian-personnel', '324-leave-payroll-timekeeping', '329-career-development'] },
  { id: 'equipment-uniforms',label: 'Equipment & Uniforms',          chapters: ['305-uniforms-equipment'] },
  { id: 'command-ops',        label: 'Command Operations',            chapters: ['212-command-operations', '220-citywide-incident-mgmt'] },
  { id: 'qol-enforcement',   label: 'Quality of Life',               chapters: ['214-quality-of-life'] },
  { id: 'mobilization',      label: 'Mobilization & Emergency',     chapters: ['213-mobilization-emergency'] },
  { id: 'disciplinary',       label: 'Disciplinary Matters',         chapters: ['318-disciplinary-matters', '332-employee-rights'] },
  { id: 'complaints',         label: 'Complaints & Investigations', chapters: ['207-complaints'] },
  { id: 'medical-wellness',   label: 'Medical & Wellness',           chapters: ['330-medical-health-wellness'] },
  { id: 'general-regulations',label: 'General Regulations',          chapters: ['304-general-regulations'] },
];

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

  // Extract Sergeant Focus callouts per chapter
  const sergeantFocus = [];
  sections.forEach(s => {
    const matches = s.content.match(/^>\s+\*\*Sergeant Focus:\*\*.+/gm) || [];
    matches.forEach(m => {
      const text = m.replace(/^>\s+/,'').replace(/\*\*Sergeant Focus:\*\*\s*/,'');
      sergeantFocus.push({ filename: s.filename, text });
    });
  });

  // Extract NOTE markers per chapter
  const notes = extractNotes(sections, id);

  const titleM = readme.match(/^#\s+.*?—\s+(.*)/m);
  const sectionNum = id.split('-')[0];
  chapters.push({
    id, sectionNum,
    title: titleM ? titleM[1].trim() : id,
    readme, sections, keyTerms,
    reviewQuestions: reviewRaw,
    questions: parseReviewQuestions(reviewRaw),
    sergeantFocus,
    notes
  });
}

const cheatSheet = readFile(path.join(PROJECT, 'build', 'quick-reference-cheat-sheet.md')) || '';
const examRaw = readFile(path.join(PROJECT, 'build', 'master-practice-exam.md')) || '';
const examQuestions = parsePracticeExam(examRaw);

// Flatten all notes with chapter reference
const allNotes = [];
chapters.forEach(ch => {
  (ch.notes || []).forEach(note => {
    allNotes.push({
      ...note,
      chapterId: ch.id,
      chapterTitle: ch.title
    });
  });
});

const data = {
  chapters,
  cheatSheet,
  examQuestions,
  totalQuestions: chapters.reduce((s, c) => s + c.questions.length, 0),
  notes: allNotes
};

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.writeFileSync(
  path.join(OUTPUT_DIR, 'data.js'),
  `window.STUDY_DATA=${JSON.stringify(data)};\nwindow.SERGEANT_CATEGORIES=${JSON.stringify(SERGEANT_CATEGORIES)};`
);
console.log(`Built ${chapters.length} chapters, ${data.totalQuestions} chapter quiz questions, ${examQuestions.length} exam questions`);
const totalSF = chapters.reduce((s,c) => s + (c.sergeantFocus||[]).length, 0);
console.log(`Sergeant Focus callouts: ${totalSF}`);
console.log(`NOTE markers extracted: ${allNotes.length}`);
if (chapters.length < CHAPTER_ORDER.length) {
  const built = new Set(chapters.map(c => c.id));
  const missing = CHAPTER_ORDER.filter(id => !built.has(id));
  console.warn(`WARNING: Expected ${CHAPTER_ORDER.length} chapters but only built ${chapters.length}. Missing: ${missing.join(', ')}`);
}
