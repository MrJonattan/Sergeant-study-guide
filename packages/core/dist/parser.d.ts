/**
 * Markdown parser for study guide content
 * Handles review questions, exam questions, callouts, and section parsing
 */
import { Question, ExamQuestion, Section, SergeantFocus } from './types';
export declare function parseReviewQuestions(md: string): Question[];
export declare function parsePracticeExam(md: string): ExamQuestion[];
export declare function extractSergeantFocus(content: string, filename: string): SergeantFocus[];
export declare function cleanReadme(md: string): string;
export declare function parseSectionFile(filename: string, content: string): Section;
