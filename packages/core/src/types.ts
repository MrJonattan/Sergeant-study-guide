/**
 * Zod schemas for NYPD Sergeant Study Guide data models
 * These schemas provide runtime validation and TypeScript types
 */

import { z } from 'zod';

// ─────────────────────────────────────────────
// Basic Types
// ─────────────────────────────────────────────

export const ChapterIdSchema = z.string().regex(/^\d{3}-[a-z0-9-]+$/);

export const QuestionTypeSchema = z.enum(['mc', 'open']);

// ─────────────────────────────────────────────
// Question Schema
// ─────────────────────────────────────────────

export const QuestionSchema = z.object({
  number: z.number().int().positive(),
  text: z.string().min(10),
  options: z.array(z.string()).optional(),
  answer: z.string().optional(),
  answerFull: z.string().optional(),
  explanation: z.string().optional(),
  type: QuestionTypeSchema.default('mc'),
});

export type Question = z.infer<typeof QuestionSchema>;

// ─────────────────────────────────────────────
// Section Schema
// ─────────────────────────────────────────────

export const SectionSchema = z.object({
  filename: z.string().regex(/^section-\d{3}-[a-z0-9-]+\.md$/),
  content: z.string().min(50),
});

export type Section = z.infer<typeof SectionSchema>;

// ─────────────────────────────────────────────
// Sergeant Focus Callout Schema
// ─────────────────────────────────────────────

export const SergeantFocusSchema = z.object({
  filename: z.string(),
  text: z.string().min(20),
  category: z.string().optional(),
});

export type SergeantFocus = z.infer<typeof SergeantFocusSchema>;

// ─────────────────────────────────────────────
// Chapter Schema
// ─────────────────────────────────────────────

export const ChapterSchema = z.object({
  id: ChapterIdSchema,
  sectionNum: z.string().regex(/^\d{3}$/),
  title: z.string(),
  readme: z.string(),
  sections: z.array(SectionSchema),
  keyTerms: z.string(),
  reviewQuestions: z.string(),
  questions: z.array(QuestionSchema),
  sergeantFocus: z.array(SergeantFocusSchema),
});

export type Chapter = z.infer<typeof ChapterSchema>;

// ─────────────────────────────────────────────
// Exam Question Schema
// ─────────────────────────────────────────────

export const ExamQuestionSchema = z.object({
  number: z.number().int().positive(),
  text: z.string().min(10),
  options: z.array(z.string()),
  answer: z.string().length(1),
  source: z.string().optional(),
  explanation: z.string(),
});

export type ExamQuestion = z.infer<typeof ExamQuestionSchema>;

// ─────────────────────────────────────────────
// Sergeant Category Schema
// ─────────────────────────────────────────────

export const SergeantCategorySchema = z.object({
  id: z.string(),
  label: z.string(),
  chapters: z.array(ChapterIdSchema),
});

export type SergeantCategory = z.infer<typeof SergeantCategorySchema>;

// ─────────────────────────────────────────────
// Study Data Schema (main output)
// ─────────────────────────────────────────────

export const StudyDataSchema = z.object({
  chapters: z.array(ChapterSchema),
  cheatSheet: z.string(),
  examQuestions: z.array(ExamQuestionSchema),
  totalQuestions: z.number().int().nonnegative(),
  sergeantCategories: z.array(SergeantCategorySchema).optional(),
  version: z.string().optional(),
});

export type StudyData = z.infer<typeof StudyDataSchema> & {
  version?: string;
};

// ─────────────────────────────────────────────
// Flashcard Schema
// ─────────────────────────────────────────────

export const FlashcardSchema = z.object({
  id: z.string(),
  front: z.string(),
  back: z.string(),
  category: z.enum(['key-term', 'question', 'exam', 'sergeant-focus', 'note']),
  procedure: z.string(),
  chapterId: ChapterIdSchema,
});

export type Flashcard = z.infer<typeof FlashcardSchema>;

// ─────────────────────────────────────────────
// Progress Schema
// ─────────────────────────────────────────────

export const ChapterProgressSchema = z.object({
  chapterId: ChapterIdSchema,
  status: z.enum(['not_started', 'in_progress', 'review', 'completed']),
  quizScore: z.number().min(0).max(100).optional(),
  questionsAnswered: z.number().int().nonnegative(),
  timeSpentSeconds: z.number().int().nonnegative(),
  lastStudiedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
});

export type ChapterProgress = z.infer<typeof ChapterProgressSchema>;

export const ProgressSchema = z.object({
  chapters: z.array(ChapterProgressSchema),
  streak: z.number().int().nonnegative(),
  totalStudyTimeSeconds: z.number().int().nonnegative(),
  lastStudyDate: z.string().date().optional(),
});

export type Progress = z.infer<typeof ProgressSchema>;

