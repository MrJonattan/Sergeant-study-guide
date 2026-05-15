/**
 * Zod schemas for NYPD Sergeant Study Guide data models
 * These schemas provide runtime validation and TypeScript types
 */
import { z } from 'zod';
export declare const ChapterIdSchema: z.ZodString;
export declare const QuestionTypeSchema: z.ZodEnum<["mc", "open"]>;
export declare const QuestionSchema: z.ZodObject<{
    number: z.ZodNumber;
    text: z.ZodString;
    options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    answer: z.ZodOptional<z.ZodString>;
    answerFull: z.ZodOptional<z.ZodString>;
    explanation: z.ZodOptional<z.ZodString>;
    type: z.ZodDefault<z.ZodEnum<["mc", "open"]>>;
}, "strip", z.ZodTypeAny, {
    number: number;
    text: string;
    type: "mc" | "open";
    options?: string[] | undefined;
    answer?: string | undefined;
    answerFull?: string | undefined;
    explanation?: string | undefined;
}, {
    number: number;
    text: string;
    options?: string[] | undefined;
    type?: "mc" | "open" | undefined;
    answer?: string | undefined;
    answerFull?: string | undefined;
    explanation?: string | undefined;
}>;
export type Question = z.infer<typeof QuestionSchema>;
export declare const SectionSchema: z.ZodObject<{
    filename: z.ZodString;
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    filename: string;
    content: string;
}, {
    filename: string;
    content: string;
}>;
export type Section = z.infer<typeof SectionSchema>;
export declare const SergeantFocusSchema: z.ZodObject<{
    filename: z.ZodString;
    text: z.ZodString;
    category: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    text: string;
    filename: string;
    category?: string | undefined;
}, {
    text: string;
    filename: string;
    category?: string | undefined;
}>;
export type SergeantFocus = z.infer<typeof SergeantFocusSchema>;
export declare const ChapterSchema: z.ZodObject<{
    id: z.ZodString;
    sectionNum: z.ZodString;
    title: z.ZodString;
    readme: z.ZodString;
    sections: z.ZodArray<z.ZodObject<{
        filename: z.ZodString;
        content: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        filename: string;
        content: string;
    }, {
        filename: string;
        content: string;
    }>, "many">;
    keyTerms: z.ZodString;
    reviewQuestions: z.ZodString;
    questions: z.ZodArray<z.ZodObject<{
        number: z.ZodNumber;
        text: z.ZodString;
        options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        answer: z.ZodOptional<z.ZodString>;
        answerFull: z.ZodOptional<z.ZodString>;
        explanation: z.ZodOptional<z.ZodString>;
        type: z.ZodDefault<z.ZodEnum<["mc", "open"]>>;
    }, "strip", z.ZodTypeAny, {
        number: number;
        text: string;
        type: "mc" | "open";
        options?: string[] | undefined;
        answer?: string | undefined;
        answerFull?: string | undefined;
        explanation?: string | undefined;
    }, {
        number: number;
        text: string;
        options?: string[] | undefined;
        type?: "mc" | "open" | undefined;
        answer?: string | undefined;
        answerFull?: string | undefined;
        explanation?: string | undefined;
    }>, "many">;
    sergeantFocus: z.ZodArray<z.ZodObject<{
        filename: z.ZodString;
        text: z.ZodString;
        category: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        text: string;
        filename: string;
        category?: string | undefined;
    }, {
        text: string;
        filename: string;
        category?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    id: string;
    sectionNum: string;
    title: string;
    readme: string;
    sections: {
        filename: string;
        content: string;
    }[];
    keyTerms: string;
    reviewQuestions: string;
    questions: {
        number: number;
        text: string;
        type: "mc" | "open";
        options?: string[] | undefined;
        answer?: string | undefined;
        answerFull?: string | undefined;
        explanation?: string | undefined;
    }[];
    sergeantFocus: {
        text: string;
        filename: string;
        category?: string | undefined;
    }[];
}, {
    id: string;
    sectionNum: string;
    title: string;
    readme: string;
    sections: {
        filename: string;
        content: string;
    }[];
    keyTerms: string;
    reviewQuestions: string;
    questions: {
        number: number;
        text: string;
        options?: string[] | undefined;
        type?: "mc" | "open" | undefined;
        answer?: string | undefined;
        answerFull?: string | undefined;
        explanation?: string | undefined;
    }[];
    sergeantFocus: {
        text: string;
        filename: string;
        category?: string | undefined;
    }[];
}>;
export type Chapter = z.infer<typeof ChapterSchema>;
export declare const ExamQuestionSchema: z.ZodObject<{
    number: z.ZodNumber;
    text: z.ZodString;
    options: z.ZodArray<z.ZodString, "many">;
    answer: z.ZodString;
    source: z.ZodOptional<z.ZodString>;
    explanation: z.ZodString;
}, "strip", z.ZodTypeAny, {
    number: number;
    text: string;
    options: string[];
    answer: string;
    explanation: string;
    source?: string | undefined;
}, {
    number: number;
    text: string;
    options: string[];
    answer: string;
    explanation: string;
    source?: string | undefined;
}>;
export type ExamQuestion = z.infer<typeof ExamQuestionSchema>;
export declare const SergeantCategorySchema: z.ZodObject<{
    id: z.ZodString;
    label: z.ZodString;
    chapters: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    id: string;
    label: string;
    chapters: string[];
}, {
    id: string;
    label: string;
    chapters: string[];
}>;
export type SergeantCategory = z.infer<typeof SergeantCategorySchema>;
export declare const StudyDataSchema: z.ZodObject<{
    chapters: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        sectionNum: z.ZodString;
        title: z.ZodString;
        readme: z.ZodString;
        sections: z.ZodArray<z.ZodObject<{
            filename: z.ZodString;
            content: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            filename: string;
            content: string;
        }, {
            filename: string;
            content: string;
        }>, "many">;
        keyTerms: z.ZodString;
        reviewQuestions: z.ZodString;
        questions: z.ZodArray<z.ZodObject<{
            number: z.ZodNumber;
            text: z.ZodString;
            options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            answer: z.ZodOptional<z.ZodString>;
            answerFull: z.ZodOptional<z.ZodString>;
            explanation: z.ZodOptional<z.ZodString>;
            type: z.ZodDefault<z.ZodEnum<["mc", "open"]>>;
        }, "strip", z.ZodTypeAny, {
            number: number;
            text: string;
            type: "mc" | "open";
            options?: string[] | undefined;
            answer?: string | undefined;
            answerFull?: string | undefined;
            explanation?: string | undefined;
        }, {
            number: number;
            text: string;
            options?: string[] | undefined;
            type?: "mc" | "open" | undefined;
            answer?: string | undefined;
            answerFull?: string | undefined;
            explanation?: string | undefined;
        }>, "many">;
        sergeantFocus: z.ZodArray<z.ZodObject<{
            filename: z.ZodString;
            text: z.ZodString;
            category: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            text: string;
            filename: string;
            category?: string | undefined;
        }, {
            text: string;
            filename: string;
            category?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        id: string;
        sectionNum: string;
        title: string;
        readme: string;
        sections: {
            filename: string;
            content: string;
        }[];
        keyTerms: string;
        reviewQuestions: string;
        questions: {
            number: number;
            text: string;
            type: "mc" | "open";
            options?: string[] | undefined;
            answer?: string | undefined;
            answerFull?: string | undefined;
            explanation?: string | undefined;
        }[];
        sergeantFocus: {
            text: string;
            filename: string;
            category?: string | undefined;
        }[];
    }, {
        id: string;
        sectionNum: string;
        title: string;
        readme: string;
        sections: {
            filename: string;
            content: string;
        }[];
        keyTerms: string;
        reviewQuestions: string;
        questions: {
            number: number;
            text: string;
            options?: string[] | undefined;
            type?: "mc" | "open" | undefined;
            answer?: string | undefined;
            answerFull?: string | undefined;
            explanation?: string | undefined;
        }[];
        sergeantFocus: {
            text: string;
            filename: string;
            category?: string | undefined;
        }[];
    }>, "many">;
    cheatSheet: z.ZodString;
    examQuestions: z.ZodArray<z.ZodObject<{
        number: z.ZodNumber;
        text: z.ZodString;
        options: z.ZodArray<z.ZodString, "many">;
        answer: z.ZodString;
        source: z.ZodOptional<z.ZodString>;
        explanation: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        number: number;
        text: string;
        options: string[];
        answer: string;
        explanation: string;
        source?: string | undefined;
    }, {
        number: number;
        text: string;
        options: string[];
        answer: string;
        explanation: string;
        source?: string | undefined;
    }>, "many">;
    totalQuestions: z.ZodNumber;
    sergeantCategories: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        chapters: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        id: string;
        label: string;
        chapters: string[];
    }, {
        id: string;
        label: string;
        chapters: string[];
    }>, "many">>;
    version: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    chapters: {
        id: string;
        sectionNum: string;
        title: string;
        readme: string;
        sections: {
            filename: string;
            content: string;
        }[];
        keyTerms: string;
        reviewQuestions: string;
        questions: {
            number: number;
            text: string;
            type: "mc" | "open";
            options?: string[] | undefined;
            answer?: string | undefined;
            answerFull?: string | undefined;
            explanation?: string | undefined;
        }[];
        sergeantFocus: {
            text: string;
            filename: string;
            category?: string | undefined;
        }[];
    }[];
    cheatSheet: string;
    examQuestions: {
        number: number;
        text: string;
        options: string[];
        answer: string;
        explanation: string;
        source?: string | undefined;
    }[];
    totalQuestions: number;
    sergeantCategories?: {
        id: string;
        label: string;
        chapters: string[];
    }[] | undefined;
    version?: string | undefined;
}, {
    chapters: {
        id: string;
        sectionNum: string;
        title: string;
        readme: string;
        sections: {
            filename: string;
            content: string;
        }[];
        keyTerms: string;
        reviewQuestions: string;
        questions: {
            number: number;
            text: string;
            options?: string[] | undefined;
            type?: "mc" | "open" | undefined;
            answer?: string | undefined;
            answerFull?: string | undefined;
            explanation?: string | undefined;
        }[];
        sergeantFocus: {
            text: string;
            filename: string;
            category?: string | undefined;
        }[];
    }[];
    cheatSheet: string;
    examQuestions: {
        number: number;
        text: string;
        options: string[];
        answer: string;
        explanation: string;
        source?: string | undefined;
    }[];
    totalQuestions: number;
    sergeantCategories?: {
        id: string;
        label: string;
        chapters: string[];
    }[] | undefined;
    version?: string | undefined;
}>;
export type StudyData = z.infer<typeof StudyDataSchema> & {
    version?: string;
};
export declare const FlashcardSchema: z.ZodObject<{
    id: z.ZodString;
    front: z.ZodString;
    back: z.ZodString;
    category: z.ZodEnum<["key-term", "question", "exam", "sergeant-focus", "note"]>;
    procedure: z.ZodString;
    chapterId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    category: "key-term" | "question" | "exam" | "sergeant-focus" | "note";
    id: string;
    front: string;
    back: string;
    procedure: string;
    chapterId: string;
}, {
    category: "key-term" | "question" | "exam" | "sergeant-focus" | "note";
    id: string;
    front: string;
    back: string;
    procedure: string;
    chapterId: string;
}>;
export type Flashcard = z.infer<typeof FlashcardSchema>;
export declare const ChapterProgressSchema: z.ZodObject<{
    chapterId: z.ZodString;
    status: z.ZodEnum<["not_started", "in_progress", "review", "completed"]>;
    quizScore: z.ZodOptional<z.ZodNumber>;
    questionsAnswered: z.ZodNumber;
    timeSpentSeconds: z.ZodNumber;
    lastStudiedAt: z.ZodOptional<z.ZodString>;
    completedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "not_started" | "in_progress" | "review" | "completed";
    chapterId: string;
    questionsAnswered: number;
    timeSpentSeconds: number;
    quizScore?: number | undefined;
    lastStudiedAt?: string | undefined;
    completedAt?: string | undefined;
}, {
    status: "not_started" | "in_progress" | "review" | "completed";
    chapterId: string;
    questionsAnswered: number;
    timeSpentSeconds: number;
    quizScore?: number | undefined;
    lastStudiedAt?: string | undefined;
    completedAt?: string | undefined;
}>;
export type ChapterProgress = z.infer<typeof ChapterProgressSchema>;
export declare const ProgressSchema: z.ZodObject<{
    chapters: z.ZodArray<z.ZodObject<{
        chapterId: z.ZodString;
        status: z.ZodEnum<["not_started", "in_progress", "review", "completed"]>;
        quizScore: z.ZodOptional<z.ZodNumber>;
        questionsAnswered: z.ZodNumber;
        timeSpentSeconds: z.ZodNumber;
        lastStudiedAt: z.ZodOptional<z.ZodString>;
        completedAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status: "not_started" | "in_progress" | "review" | "completed";
        chapterId: string;
        questionsAnswered: number;
        timeSpentSeconds: number;
        quizScore?: number | undefined;
        lastStudiedAt?: string | undefined;
        completedAt?: string | undefined;
    }, {
        status: "not_started" | "in_progress" | "review" | "completed";
        chapterId: string;
        questionsAnswered: number;
        timeSpentSeconds: number;
        quizScore?: number | undefined;
        lastStudiedAt?: string | undefined;
        completedAt?: string | undefined;
    }>, "many">;
    streak: z.ZodNumber;
    totalStudyTimeSeconds: z.ZodNumber;
    lastStudyDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    chapters: {
        status: "not_started" | "in_progress" | "review" | "completed";
        chapterId: string;
        questionsAnswered: number;
        timeSpentSeconds: number;
        quizScore?: number | undefined;
        lastStudiedAt?: string | undefined;
        completedAt?: string | undefined;
    }[];
    streak: number;
    totalStudyTimeSeconds: number;
    lastStudyDate?: string | undefined;
}, {
    chapters: {
        status: "not_started" | "in_progress" | "review" | "completed";
        chapterId: string;
        questionsAnswered: number;
        timeSpentSeconds: number;
        quizScore?: number | undefined;
        lastStudiedAt?: string | undefined;
        completedAt?: string | undefined;
    }[];
    streak: number;
    totalStudyTimeSeconds: number;
    lastStudyDate?: string | undefined;
}>;
export type Progress = z.infer<typeof ProgressSchema>;
