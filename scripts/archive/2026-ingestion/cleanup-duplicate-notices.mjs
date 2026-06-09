#!/usr/bin/env node
/**
 * cleanup-duplicate-notices.mjs
 *
 * Removes duplicate update notices from section files.
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const CHAPTERS_DIR = '/Users/hattan/Projects/nypd-sergeant-study-guide/chapters';

function getChapters() {
  return readdirSync(CHAPTERS_DIR).filter(f => !f.startsWith('.'));
}

function getSectionFiles(chapter) {
  const chapterPath = join(CHAPTERS_DIR, chapter);
  return readdirSync(chapterPath)
    .filter(f => f.endsWith('.md') && f.startsWith('section-'))
    .map(f => join(chapterPath, f));
}

function cleanupFile(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  const original = content;

  // Remove duplicate update notices for the same procedure
  // Pattern: Multiple > 📅 **UPDATE:** or > ⚠️ **UPDATED:** with blank lines between
  const lines = content.split('\n');
  const newLines = [];
  const seenNotices = new Set();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const noticeMatch = line.match(/> (?:📅|⚠️) \*\*(?:UPDATE|UPDATED):\*\* (.+)/);

    if (noticeMatch) {
      const noticeKey = noticeMatch[1].trim();
      if (!seenNotices.has(noticeKey)) {
        seenNotices.add(noticeKey);
        newLines.push(line);
      }
      // Skip duplicate notice line
    } else {
      newLines.push(line);
    }
  }

  content = newLines.join('\n');

  if (content !== original) {
    writeFileSync(filePath, content, 'utf-8');
    return true;
  }
  return false;
}

console.log('🧹 Cleaning up duplicate update notices...\n');

let cleaned = 0;
for (const chapter of getChapters()) {
  for (const file of getSectionFiles(chapter)) {
    if (cleanupFile(file)) {
      cleaned++;
      console.log(`✓ Cleaned: ${file.replace(CHAPTERS_DIR, 'chapters')}`);
    }
  }
}

console.log(`\n✅ Cleaned ${cleaned} files`);
