/**
 * Data loader utility - loads data.js with proper error handling and retry
 */

export interface LoadDataOptions {
  maxRetries?: number;
  retryDelayMs?: number;
  onProgress?: (status: string) => void;
}

export interface StudyData {
  chapters: Array<{
    id: string;
    sectionNum: string;
    title: string;
    readme: string;
    sections: Array<{ filename: string; content: string }>;
    keyTerms: string;
    reviewQuestions: string;
    questions: Array<{
      number: number;
      text: string;
      options: string[];
      correctAnswer?: number;
    }>;
    sergeantFocus: Array<{ filename: string; text: string; category?: string }>;
  }>;
  cheatSheet: string;
  examQuestions: Array<{
    number: number;
    text: string;
    options: string[];
    correctAnswer: number;
  }>;
  totalQuestions: number;
  sergeantCategories: Array<{
    id: string;
    label: string;
    chapters: string[];
  }>;
  version: string;
}

/**
 * Load study data with retry logic and progress updates
 */
export async function loadStudyData(options: LoadDataOptions = {}): Promise<StudyData> {
  const { maxRetries = 3, retryDelayMs = 1000, onProgress } = options;

  onProgress?.('Loading study data...');

  // Try to load from global variable first (data.js script)
  if (typeof window.STUDY_DATA !== 'undefined' && window.STUDY_DATA?.chapters) {
    onProgress?.('Data loaded successfully');
    return window.STUDY_DATA as StudyData;
  }

  // Fetch with retry logic
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      onProgress?.(`Loading data (attempt ${attempt}/${maxRetries})...`);

      const response = await fetch('./data.js', {
        cache: 'force-cache',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const script = await response.text();

      // Extract JSON from "window.STUDY_DATA = {...}"
      const prefix = 'window.STUDY_DATA = ';
      const startIdx = script.indexOf(prefix);
      if (startIdx === -1) {
        throw new Error('Invalid data.js format: missing window.STUDY_DATA');
      }

      let jsonStr = script.substring(startIdx + prefix.length).trim();

      // Find matching closing brace
      let braceCount = 0;
      let inString = false;
      let escape = false;
      let endIdx = -1;

      for (let i = 0; i < jsonStr.length; i++) {
        const char = jsonStr[i];
        if (escape) {
          escape = false;
          continue;
        }
        if (char === '\\') {
          escape = true;
          continue;
        }
        if (char === '"' && !escape) {
          inString = !inString;
          continue;
        }
        if (!inString) {
          if (char === '{') braceCount++;
          if (char === '}') {
            braceCount--;
            if (braceCount === 0) {
              endIdx = i + 1;
              break;
            }
          }
        }
      }

      if (endIdx === -1) {
        throw new Error('Invalid data.js format: malformed JSON');
      }

      jsonStr = jsonStr.substring(0, endIdx);
      const data = JSON.parse(jsonStr) as StudyData;

      // Cache for next time
      window.STUDY_DATA = data;

      onProgress?.('Data loaded successfully');
      return data;
    } catch (err) {
      lastError = err as Error;
      console.warn(`Data load attempt ${attempt} failed:`, err);

      if (attempt < maxRetries) {
        await sleep(retryDelayMs);
      }
    }
  }

  throw new Error(`Failed to load study data after ${maxRetries} attempts: ${lastError?.message}`);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
