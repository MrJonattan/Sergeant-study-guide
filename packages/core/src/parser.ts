/**
 * Markdown parser for study guide content
 * Handles review questions, exam questions, callouts, and section parsing
 */

import {
  Question,
  ExamQuestion,
  Section,
  SergeantFocus,
} from './types';

// ─────────────────────────────────────────────
// Review Question Parser
// ─────────────────────────────────────────────

interface ParsedQuestion {
  number: number;
  text: string;
  optionsBlock: string;
  answerBlock: string;
}

export function parseReviewQuestions(md: string): Question[] {
  if (!md) return [];

  const questions: Question[] = [];

  // Split by --- or ## Question or ### Question boundaries
  const blocks = md.split(/\n---\n|\n(?=##?#?\s+Q(?:uestion\s+)?\d)/).filter((b) => b.trim());

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

    const num = parseInt(fmt[1], 10);
    const text = fmt[2].replace(/\*\*/g, '').trim();
    const optionsBlock = fmt[3];

    // Extract answer block
    const ansBlock = block.match(/<details>[\s\S]*?<summary>Answer<\/summary>\s*\n([\s\S]*?)<\/details>/);
    if (!ansBlock) continue;
    const answerBlock = ansBlock[1].trim();

    // Parse options from any format: "- A) text", "A) text", "A. text", "- A. text"
    const options: string[] = [];
    const optRe = /^[\s-]*([A-D])[.)]\s*(.+)/gm;
    let om: RegExpExecArray | null;
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
      type: isMultipleChoice ? 'mc' : 'open',
    });
  }

  return questions;
}

// ─────────────────────────────────────────────
// Practice Exam Parser
// ─────────────────────────────────────────────

export function parsePracticeExam(md: string): ExamQuestion[] {
  if (!md) return [];

  const answerMap = new Map<number, { answer: string; source: string; explanation: string }>();

  // Try 4-column format first: | N | A | source | explanation |
  const keyRe = /\|\s*(\d+)\s*\|\s*([A-D])\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|/g;
  let km: RegExpExecArray | null;
  while ((km = keyRe.exec(md)) !== null) {
    answerMap.set(parseInt(km[1], 10), {
      answer: km[2],
      source: km[3].trim(),
      explanation: km[4].trim(),
    });
  }

  // Fallback: 3-column table (no explanation)
  if (answerMap.size === 0) {
    const keyRe3 = /\|\s*(\d+)\s*\|\s*([A-D])\s*\|\s*(.*?)\s*\|/g;
    while ((km = keyRe3.exec(md)) !== null) {
      answerMap.set(parseInt(km[1], 10), {
        answer: km[2],
        source: km[3].trim(),
        explanation: '',
      });
    }
  }

  const questions: ExamQuestion[] = [];
  const qBlocks = md.split(/\n---\n/);

  for (const block of qBlocks) {
    const qm = block.match(/\*\*(\d+)\.\s+([\s\S]*?)\*\*\s*\n([\s\S]*)/);
    if (!qm) continue;

    const num = parseInt(qm[1], 10);
    const options: string[] = [];
    const optRe = /- ([A-D]\).+)/g;
    let om: RegExpExecArray | null;
    while ((om = optRe.exec(qm[3])) !== null) {
      options.push(om[1]);
    }

    if (options.length === 0) continue;

    const info = answerMap.get(num) || { answer: '', source: '', explanation: '' };

    questions.push({
      number: num,
      text: qm[2].trim(),
      options,
      answer: info.answer || '',
      source: info.source || '',
      explanation: info.explanation || '',
    });
  }

  return questions;
}

// ─────────────────────────────────────────────
// Sergeant Focus Callout Extractor
// ─────────────────────────────────────────────

export function extractSergeantFocus(content: string, filename: string): SergeantFocus[] {
  const callouts: SergeantFocus[] = [];

  // Match blockquote callouts: > **Sergeant Focus:** text
  const matches = content.match(/^>\s+\*\*Sergeant Focus:\*\*\s*(.+)/gm) || [];

  for (const match of matches) {
    const text = match.replace(/^>\s+\*\*Sergeant Focus:\*\*\s*/, '').trim();
    if (text.length >= 20) {
      callouts.push({
        filename,
        text,
      });
    }
  }

  return callouts;
}

// ─────────────────────────────────────────────
// README Cleaner
// ─────────────────────────────────────────────

export function cleanReadme(md: string): string {
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

// ─────────────────────────────────────────────
// Section File Parser
// ─────────────────────────────────────────────

export function parseSectionFile(filename: string, content: string): Section {
  return {
    filename,
    content,
  };
}
