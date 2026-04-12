#!/usr/bin/env node
/**
 * Export study questions to Anki-compatible CSV format
 * Generates:
 *   - build/anki-chapter-questions.csv (569 chapter questions)
 *   - build/anki-master-exam.csv (140 exam questions)
 *   - build/anki-flashcards.csv (key terms + notes)
 */

const fs = require('fs');
const path = require('path');

const PROJECT = path.resolve(__dirname, '..');
const BUILD_DIR = path.join(PROJECT, 'build');
const DATA_FILE = path.join(BUILD_DIR, 'data.js');

// Ensure build directory exists
fs.mkdirSync(BUILD_DIR, { recursive: true });

// Read and parse data.js
const dataContent = fs.readFileSync(DATA_FILE, 'utf8');
const match = dataContent.match(/window\.STUDY_DATA=({.+});/);
if (!match) {
  console.error('Failed to parse data.js');
  process.exit(1);
}
const data = JSON.parse(match[1]);

// Escape CSV field (handle commas, quotes, newlines)
function csvEscape(str) {
  if (str == null) return '';
  const s = String(str).replace(/"/g, '""');
  return `"${s}"`;
}

// Convert HTML to plain text for Anki
function htmlToText(html) {
  if (!html) return '';
  return html
    .replace(/<details>[\s\S]*?<\/details>/g, '') // Remove collapsible sections
    .replace(/<[^>]+>/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/__/g, '')
    .replace(/_/g, '')
    .replace(/\\n/g, '<br>')
    .trim();
}

console.log('Exporting Anki flashcards...\n');

// === 1. Chapter Review Questions ===
let chapterQs = 0;
const chapterCSV = ['Front,Back,Chapter,Section,Tags'];

for (const chapter of data.chapters) {
  for (const q of chapter.questions || []) {
    if (q.type === 'mc' && q.options.length > 0) {
      const front = `**${q.number}.** ${htmlToText(q.text)}\n\n${q.options.map((opt, i) => `${String.fromCharCode(65 + i)}) ${htmlToText(opt)}`).join('\n')}`;
      const back = `**Answer: ${q.answer}**\n\n${htmlToText(q.explanation)}`;
      const tags = `chapter_${chapter.sectionNum} ${chapter.id.replace(/-/g, '_')}`;
      chapterCSV.push(`${csvEscape(front)},${csvEscape(back)},${csvEscape(chapter.title)},${csvEscape(chapter.sectionNum)},${tags}`);
      chapterQs++;
    }
  }
}

fs.writeFileSync(path.join(BUILD_DIR, 'anki-chapter-questions.csv'), chapterCSV.join('\n'));
console.log(`✓ Chapter questions: ${chapterQs}`);

// === 2. Master Exam Questions ===
let examQs = 0;
const examCSV = ['Front,Back,Source,Tags'];

for (const q of data.examQuestions || []) {
  const front = `**${q.number}.** ${htmlToText(q.text)}\n\n${q.options.map((opt, i) => `${String.fromCharCode(65 + i)}) ${htmlToText(opt)}`).join('\n')}`;
  const back = `**Answer: ${q.answer}**\n\nSource: ${htmlToText(q.source || '')}\n\n${htmlToText(q.explanation || '')}`;
  const tags = `master_exam question_${q.number}`;
  examCSV.push(`${csvEscape(front)},${csvEscape(back)},${csvEscape(q.source || '')},${tags}`);
  examQs++;
}

fs.writeFileSync(path.join(BUILD_DIR, 'anki-master-exam.csv'), examCSV.join('\n'));
console.log(`✓ Master exam questions: ${examQs}`);

// === 3. Key Terms Flashcards ===
let keyTerms = 0;
const keyTermsCSV = ['Front,Back,Chapter,Tags'];

for (const chapter of data.chapters) {
  if (chapter.keyTerms) {
    // Parse markdown table rows: | Term | Definition |
    const lines = chapter.keyTerms.split('\n').filter(l => l.includes('|'));
    for (const line of lines) {
      const cells = line.split('|').map(c => c.trim()).filter(c => c);
      if (cells.length >= 2 && !cells[0].includes('---') && !cells[0].includes('Term')) {
        const term = htmlToText(cells[0].replace(/^\*\*/, '').replace(/\*\*$/, ''));
        const def = htmlToText(cells[1]);
        if (term && def && term.length < 100) {
          keyTermsCSV.push(`${csvEscape(term)},${csvEscape(def)},${csvEscape(chapter.title)},key_terms ${chapter.id.replace(/-/g, '_')}`);
          keyTerms++;
        }
      }
    }
  }
}

fs.writeFileSync(path.join(BUILD_DIR, 'anki-key-terms.csv'), keyTermsCSV.join('\n'));
console.log(`✓ Key terms: ${keyTerms}`);

// === 4. Sergeant Focus Callouts ===
let sergeantFocus = 0;
const sergeantCSV = ['Front,Back,Category,Tags'];

for (const chapter of data.chapters) {
  for (const sf of chapter.sergeantFocus || []) {
    const front = `**${chapter.sectionNum} — ${sf.filename.replace('section-', '').replace('.md', '').replace(/-/g, ' ').toUpperCase()}**`;
    const back = htmlToText(sf.text);
    sergeantCSV.push(`${csvEscape(front)},${csvEscape(back)},${csvEscape(chapter.title)},sergeant_focus`);
    sergeantFocus++;
  }
}

fs.writeFileSync(path.join(BUILD_DIR, 'anki-sergeant-focus.csv'), sergeantCSV.join('\n'));
console.log(`✓ Sergeant Focus callouts: ${sergeantFocus}`);

// === 5. Notes (Critical Details) ===
let notes = 0;
const notesCSV = ['Front,Back,Procedure,Tags'];

for (const note of data.notes || []) {
  const front = `**${note.procedure}** — ${htmlToText(note.filename.replace('section-', '').replace('.md', '').replace(/-/g, ' '))}`;
  const back = htmlToText(note.text);
  notesCSV.push(`${csvEscape(front)},${csvEscape(back)},${csvEscape(note.procedure)},note critical_detail`);
  notes++;
}

fs.writeFileSync(path.join(BUILD_DIR, 'anki-notes.csv'), notesCSV.join('\n'));
console.log(`✓ Notes: ${notes}`);

// === Summary ===
const total = chapterQs + examQs + keyTerms + sergeantFocus + notes;
console.log(`\n${'='.repeat(50)}`);
console.log(`TOTAL FLASHCARDS: ${total}`);
console.log(`${'='.repeat(50)}`);
console.log('\nOutput files:');
console.log(`  - build/anki-chapter-questions.csv (${chapterQs} cards)`);
console.log(`  - build/anki-master-exam.csv (${examQs} cards)`);
console.log(`  - build/anki-key-terms.csv (${keyTerms} cards)`);
console.log(`  - build/anki-sergeant-focus.csv (${sergeantFocus} cards)`);
console.log(`  - build/anki-notes.csv (${notes} cards)`);
// === 6. Consolidated Flashcards by PG/AG Procedure ===
console.log('\nGenerating consolidated flashcards organized by PG/AG procedure...\n');

let consolidated = 0;
const consolidatedCSV = ['Front,Back,Procedure,Guide,Chapter,Tags'];

// Helper to extract procedure number from chapter ID and filename
function getProcedureNumber(chapterId, filename) {
  const sectionNum = chapterId.split('-')[0]; // e.g., "200" from "200-general"

  // Try to extract full procedure from filename (e.g., section-200-02.md -> 200-02)
  const fileMatch = filename.match(/section-(\d+-\d+)\.md/);
  if (fileMatch) {
    return `${sectionNum}-${fileMatch[1].replace(sectionNum + '-', '')}`;
  }

  // Fallback: just use section number
  return sectionNum;
}

// Helper to determine guide type (PG vs AG)
function getGuideType(sectionNum) {
  const num = parseInt(sectionNum.split('-')[0]);
  return num >= 300 ? 'A.G.' : 'P.G.';
}

for (const chapter of data.chapters) {
  const sectionNum = chapter.sectionNum;
  const guideType = getGuideType(sectionNum);

  // Key terms organized by procedure
  if (chapter.keyTerms) {
    const lines = chapter.keyTerms.split('\n').filter(l => l.includes('|'));
    for (const line of lines) {
      const cells = line.split('|').map(c => c.trim()).filter(c => c);
      if (cells.length >= 2 && !cells[0].includes('---') && !cells[0].includes('Term')) {
        const term = htmlToText(cells[0].replace(/^\*\*/, '').replace(/\*\*$/, ''));
        const def = htmlToText(cells[1]);
        if (term && def && term.length < 100) {
          const procNum = `${guideType} ${sectionNum}`;
          consolidatedCSV.push(`${csvEscape(term)},${csvEscape(def)},${csvEscape(procNum)},${guideType.replace('.','')},key_terms ${chapter.id.replace(/-/g, '_')}`);
          consolidated++;
        }
      }
    }
  }

  // Notes organized by procedure
  for (const note of chapter.notes || []) {
    const front = `NOTE: ${htmlToText(note.text)}`;
    const back = `From ${note.filename.replace('section-', '').replace('.md', '').replace(/-/g, ' ')}`;
    const procNum = note.procedure;
    const guideTypeNote = procNum.includes('A.G.') ? 'A.G.' : 'P.G.';
    consolidatedCSV.push(`${csvEscape(front)},${csvEscape(back)},${csvEscape(procNum)},${guideTypeNote.replace('.','')},note critical_detail`);
    consolidated++;
  }

  // Sergeant Focus organized by procedure
  for (const sf of chapter.sergeantFocus || []) {
    const procNum = `${guideType} ${sectionNum}`;
    const front = `SERGEANT FOCUS: ${htmlToText(sf.text)}`;
    const back = `${sf.filename.replace('section-', '').replace('.md', '').replace(/-/g, ' ').toUpperCase()}`;
    consolidatedCSV.push(`${csvEscape(front)},${csvEscape(back)},${csvEscape(procNum)},${guideType.replace('.','')},sergeant_focus`);
    consolidated++;
  }
}

fs.writeFileSync(path.join(BUILD_DIR, 'anki-flashcards-consolidated.csv'), consolidatedCSV.join('\n'));
console.log(`✓ Consolidated flashcards: ${consolidated}`);

// === 7. Generate PG/AG Index ===
const pgAgIndex = {};
for (const chapter of data.chapters) {
  const sectionNum = chapter.sectionNum;
  const guideType = getGuideType(sectionNum);
  const key = `${guideType} ${sectionNum}`;

  if (!pgAgIndex[key]) {
    pgAgIndex[key] = {
      chapter: chapter.title,
      guide: guideType,
      keyTerms: 0,
      notes: (chapter.notes || []).length,
      sergeantFocus: (chapter.sergeantFocus || []).length
    };
  }

  // Count key terms
  if (chapter.keyTerms) {
    const lines = chapter.keyTerms.split('\n').filter(l => l.includes('|'));
    pgAgIndex[key].keyTerms = lines.filter(l => {
      const cells = l.split('|').map(c => c.trim()).filter(c => c);
      return cells.length >= 2 && !cells[0].includes('---') && !cells[0].includes('Term');
    }).length;
  }
}

// Sort and output index
const sortedIndex = Object.entries(pgAgIndex).sort(([a], [b]) => {
  const aNum = parseInt(a.split(' ')[1]);
  const bNum = parseInt(b.split(' ')[1]);
  return aNum - bNum;
});

const indexJSON = sortedIndex.map(([proc, data]) => ({
  procedure: proc,
  guide: data.guide,
  chapter: data.chapter,
  keyTerms: data.keyTerms,
  notes: data.notes,
  sergeantFocus: data.sergeantFocus,
  total: data.keyTerms + data.notes + data.sergeantFocus
}));

fs.writeFileSync(
  path.join(BUILD_DIR, 'flashcard-index.json'),
  JSON.stringify(indexJSON, null, 2)
);
console.log(`✓ PG/AG Index: ${indexJSON.length} procedures`);

// === Summary ===
const grandTotal = chapterQs + examQs + keyTerms + sergeantFocus + notes + consolidated;
console.log(`\n${'='.repeat(50)}`);
console.log(`TOTAL FLASHCARDS: ${grandTotal}`);
console.log(`${'='.repeat(50)}`);
console.log('\nOutput files:');
console.log(`  - build/anki-chapter-questions.csv (${chapterQs} cards)`);
console.log(`  - build/anki-master-exam.csv (${examQs} cards)`);
console.log(`  - build/anki-key-terms.csv (${keyTerms} cards)`);
console.log(`  - build/anki-sergeant-focus.csv (${sergeantFocus} cards)`);
console.log(`  - build/anki-notes.csv (${notes} cards)`);
console.log(`  - build/anki-flashcards-consolidated.csv (${consolidated} cards) ⭐ NEW`);
console.log(`  - build/flashcard-index.json (${indexJSON.length} procedures) ⭐ NEW`);
console.log('\nImport into Anki:');
console.log('  1. Open Anki → File → Import');
console.log('  2. Select CSV file');
console.log('  3. Map fields: Front → Front, Back → Back');
console.log('  4. Enable "Allow HTML in fields"');
console.log('  5. Import\n');
console.log('Web App:');
console.log('  Open docs/index.html → Click "Flashcards" tab to browse by PG/AG procedure\n');
