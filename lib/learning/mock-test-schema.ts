import { z } from "zod";

const text = (max: number) => z.string().trim().min(1).max(max);
const optText = (max: number) => z.string().trim().max(max).default("");

export const mockQuestionTypeSchema = z.enum([
  "single-choice",
  "multiple-select",
  "code-output",
  "debugging",
  "scenario",
  "practical",
]);
export type MockQuestionType = z.infer<typeof mockQuestionTypeSchema>;

export const mockAnswerOptionSchema = z.object({
  id: text(40),
  text: text(800),
});

export const mockTestQuestionSchema = z.object({
  id: text(100),
  type: mockQuestionTypeSchema,
  prompt: text(2000),
  codeSnippet: optText(4000),
  options: z.array(mockAnswerOptionSchema).min(2).max(8),
  correctOptionIds: z.array(text(40)).min(1),
  explanation: text(2000),
  difficulty: z.enum(["foundation", "beginner", "intermediate", "advanced"]),
  topic: text(120),
  marks: z.number().int().min(1).max(10).default(1),
  recommendedLessonId: optText(120),
  recommendedLessonTitle: optText(200),
});
export type MockTestQuestion = z.infer<typeof mockTestQuestionSchema>;

export const mockTestDocumentSchema = z.object({
  id: text(120),
  skillName: text(120),
  skillSlug: text(140),
  level: z.enum(["foundation", "beginner", "intermediate", "advanced"]),
  testNumber: z.number().int().min(1).max(20),
  title: text(240),
  description: text(1000),
  durationMinutes: z.number().int().min(5).max(180).default(30),
  totalMarks: z.number().int().min(1),
  passingPercentage: z.number().int().min(1).max(100).default(70),
  topicsCovered: z.array(text(120)).min(1),
  questions: z.array(mockTestQuestionSchema).min(3).max(100),
  contentVersion: z.number().int().positive().default(1),
  reviewStatus: z.enum(["draft", "approved"]).default("approved"),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type MockTestDocument = z.infer<typeof mockTestDocumentSchema>;

/**
 * Strips correct answers and explanations before sending test to learner
 */
export function sanitizeMockTestForStudent(test: MockTestDocument) {
  return {
    ...test,
    questions: test.questions.map((q) => ({
      id: q.id,
      type: q.type,
      prompt: q.prompt,
      codeSnippet: q.codeSnippet,
      options: q.options,
      difficulty: q.difficulty,
      topic: q.topic,
      marks: q.marks,
    })),
  };
}

export const mockTestSubmissionSchema = z.object({
  testId: text(120),
  answers: z.record(z.string().max(100), z.array(z.string().max(40)).max(10)),
  timeSpentSeconds: z.number().int().min(0).default(0),
});
export type MockTestSubmission = z.infer<typeof mockTestSubmissionSchema>;

export interface QuestionGradingResult {
  questionId: string;
  prompt: string;
  topic: string;
  type: MockQuestionType;
  selectedOptionIds: string[];
  correctOptionIds: string[];
  isCorrect: boolean;
  marksAwarded: number;
  maxMarks: number;
  explanation: string;
  recommendedLessonTitle?: string;
}

export interface TopicScore {
  topic: string;
  scored: number;
  total: number;
  percentage: number;
}

export interface MockTestGradedReport {
  testId: string;
  skillName: string;
  level: string;
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  passingPercentage: number;
  timeSpentSeconds: number;
  topicWiseScores: Record<string, TopicScore>;
  questions: QuestionGradingResult[];
  incorrectQuestionCount: number;
  recommendedLessons: Array<{ title: string; topic: string }>;
  completedAt: string;
}

export function gradeMockTest(
  test: MockTestDocument,
  submission: MockTestSubmission
): MockTestGradedReport {
  let scoredMarks = 0;
  const topicMap: Record<string, { scored: number; total: number }> = {};
  const questionResults: QuestionGradingResult[] = [];
  const recommendedLessonsSet = new Map<string, string>();

  for (const q of test.questions) {
    if (!topicMap[q.topic]) {
      topicMap[q.topic] = { scored: 0, total: 0 };
    }
    topicMap[q.topic].total += q.marks;

    const selected = [...new Set(submission.answers[q.id] ?? [])].sort();
    const expected = [...q.correctOptionIds].sort();

    const isCorrect =
      selected.length === expected.length &&
      selected.every((val, idx) => val === expected[idx]);

    const marksAwarded = isCorrect ? q.marks : 0;
    scoredMarks += marksAwarded;
    topicMap[q.topic].scored += marksAwarded;

    if (!isCorrect && q.recommendedLessonTitle) {
      recommendedLessonsSet.set(q.recommendedLessonTitle, q.topic);
    }

    questionResults.push({
      questionId: q.id,
      prompt: q.prompt,
      topic: q.topic,
      type: q.type,
      selectedOptionIds: selected,
      correctOptionIds: q.correctOptionIds,
      isCorrect,
      marksAwarded,
      maxMarks: q.marks,
      explanation: q.explanation,
      recommendedLessonTitle: q.recommendedLessonTitle || undefined,
    });
  }

  const percentage = test.totalMarks > 0 ? Math.round((scoredMarks / test.totalMarks) * 100) : 0;
  const passed = percentage >= test.passingPercentage;

  const topicWiseScores: Record<string, TopicScore> = {};
  for (const [topic, stats] of Object.entries(topicMap)) {
    topicWiseScores[topic] = {
      topic,
      scored: stats.scored,
      total: stats.total,
      percentage: stats.total > 0 ? Math.round((stats.scored / stats.total) * 100) : 0,
    };
  }

  const recommendedLessons = Array.from(recommendedLessonsSet.entries()).map(([title, topic]) => ({
    title,
    topic,
  }));

  return {
    testId: test.id,
    skillName: test.skillName,
    level: test.level,
    score: scoredMarks,
    totalMarks: test.totalMarks,
    percentage,
    passed,
    passingPercentage: test.passingPercentage,
    timeSpentSeconds: submission.timeSpentSeconds,
    topicWiseScores,
    questions: questionResults,
    incorrectQuestionCount: questionResults.filter((q) => !q.isCorrect).length,
    recommendedLessons,
    completedAt: new Date().toISOString(),
  };
}

