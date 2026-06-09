#!/usr/bin/env node
/**
 * compare-updates.mjs
 *
 * Extracts and displays updated procedures from the source PDFs
 * to help identify what content changed.
 */

import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = '/Users/hattan/Projects/nypd-sergeant-study-guide/build/update-comparison';
const SOURCE_PDFS = {
  'public-pguide1.pdf': '/Users/hattan/Documents/NYPD PG/NYPD Patrol Guide/public-pguide1.pdf',
  'public-pguide2.pdf': '/Users/hattan/Documents/NYPD PG/NYPD Patrol Guide/public-pguide2.pdf',
  'public-pguide3.pdf': '/Users/hattan/Documents/NYPD PG/NYPD Patrol Guide/public-pguide3.pdf',
  'public-pguide4.pdf': '/Users/hattan/Documents/NYPD PG/NYPD Patrol Guide/public-pguide4.pdf',
  'Public Admin Guide1.pdf': '/Users/hattan/Documents/NYPD PG/NYPD Admin Guide/Public Admin Guide1.pdf',
  'Public Admin Guide2.pdf': '/Users/hattan/Documents/NYPD PG/NYPD Admin Guide/Public Admin Guide2.pdf',
};

// Procedures updated in June and May 2026 (most critical)
const CRITICAL_UPDATES = [
  '212-125',
  '202-18', '202-19',
  '207-07',
  '207-01',
  '304-22', '330-08', '219-12',
  '318-09', '318-17', '202-05', '202-20',
  '320-04',
  '212-57',
  '207-06', '207-33', '208-44', '214-34', '218-23', '208-14', '210-19', '213-03', '218-26', '208-69', '212-12', '212-55', '212-99',
  '202-06', '202-29', '202-39', '216-12', '216-13', '216-15', '217-01', '217-07', '217-09', '217-13', '217-14', '219-23', '221-21', '221-22',
];

if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('📋 Extracting Updated Procedures from Source PDFs\n');
console.log('=================================================\n');

// Map procedures to their source PDFs
function getPdfForProcedure(procNum) {
  const prefix = parseInt(procNum.split('-')[0]);
  if (prefix >= 200 && prefix <= 209) return 'public-pguide1.pdf';
  if (prefix >= 210 && prefix <= 213) return 'public-pguide2.pdf';
  if (prefix >= 214 && prefix <= 217) return 'public-pguide3.pdf';
  if (prefix >= 218 && prefix <= 221) return 'public-pguide4.pdf';
  if (prefix >= 303 && prefix <= 317) return 'Public Admin Guide1.pdf';
  if (prefix >= 318) return 'Public Admin Guide2.pdf';
  return null;
}

// Extract text for a specific procedure from a PDF
function extractProcedure(procNum) {
  const pdfName = getPdfForProcedure(procNum);
  if (!pdfName) return null;

  const pdfPath = SOURCE_PDFS[pdfName];

  // Use pdftotext with layout to preserve formatting
  try {
    const fullText = execSync(`pdftotext -layout "${pdfPath}" - 2>/dev/null`, {
      encoding: 'utf-8',
      maxBuffer: 50 * 1024 * 1024
    });

    // Find the procedure in the text
    const procPattern = new RegExp(`(${procNum}[^\\n]*\\n[\\s\\S]{0,5000})`, 'i');
    const match = fullText.match(procPattern);

    if (match) {
      return match[1].substring(0, 3000); // Return first 3000 chars
    }
    return null;
  } catch (error) {
    console.error(`Error extracting ${procNum}: ${error.message}`);
    return null;
  }
}

// Create a summary document
let summary = `# Updated Procedures Content Comparison
Generated: ${new Date().toISOString().split('T')[0]}

This document contains extracted text from the updated source PDFs for procedures
that were modified in June and May 2026.

## How to Use This Document

1. Compare the extracted text below with your study guide sections
2. Look for:
   - Changed dates
   - New/removed requirements
   - Modified procedures
   - Changed thresholds (times, numbers, etc.)
   - New notification requirements

---

`;

// Extract each critical procedure
for (const procNum of CRITICAL_UPDATES) {
  console.log(`📄 Extracting ${procNum}...`);

  const content = extractProcedure(procNum);

  if (content) {
    summary += `## P.G. ${procNum}\n\n`;
    summary += '```\n';
    summary += content.trim();
    summary += '\n```\n\n---\n\n';

    // Also write individual files
    const outputFile = join(OUTPUT_DIR, `${procNum}.txt`);
    writeFileSync(outputFile, content, 'utf-8');
  }
}

// Write summary
const summaryFile = join(OUTPUT_DIR, 'ALL-UPDATES.md');
writeFileSync(summaryFile, summary, 'utf-8');

console.log('\n=================================================');
console.log('✅ Extraction Complete!');
console.log('=================================================');
console.log(`\n📁 Output directory: ${OUTPUT_DIR}`);
console.log(`📄 Summary file: ${summaryFile}`);
console.log('\nTo compare:');
console.log('1. Open the summary file to see all extracted procedures');
console.log('2. Compare with your study guide sections in chapters/');
console.log('3. Update sections where content has changed');
