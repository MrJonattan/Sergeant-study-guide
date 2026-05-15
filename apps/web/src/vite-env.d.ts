/// <reference types="vite/client" />

// Global data from build output
interface StudyData {
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
      options?: string[];
      answer?: string;
      answerFull?: string;
      explanation?: string;
      type?: 'mc' | 'open';
    }>;
    sergeantFocus: Array<{ filename: string; text: string }>;
  }>;
  cheatSheet: string;
  examQuestions: Array<{
    number: number;
    text: string;
    options: string[];
    answer: string;
    source?: string;
    explanation: string;
  }>;
  totalQuestions: number;
  sergeantCategories?: Array<{
    id: string;
    label: string;
    chapters: string[];
  }>;
  version?: string;
}

interface Window {
  STUDY_DATA: StudyData;
  SERGEANT_CATEGORIES: Array<{
    id: string;
    label: string;
    chapters: string[];
  }>;
}
