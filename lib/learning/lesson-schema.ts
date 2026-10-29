import { z } from "zod";

const text = (max: number) => z.string().trim().min(1).max(max);
const optText = (max: number) => z.string().trim().max(max).default("");

// ─── Code examples ────────────────────────────────────────────────────────────
export const codeExampleSchema = z.object({
  language: optText(40),
  code: text(8000),
  explanation: optText(500),
  expectedOutput: optText(1000),
});

// ─── Exercise ─────────────────────────────────────────────────────────────────
export const exerciseSchema = z.object({
  id: text(100),
  type: z.enum(["coding", "written", "analysis", "scenario", "design"]),
  title: text(160),
  objective: text(300),
  description: text(3000),
  instructions: z.array(text(500)).min(1).max(20),
  starterCode: optText(4000),
  hints: z.array(text(400)).max(5),
  submissionRequirements: text(500),
  evaluationCriteria: z.array(text(400)).min(1).max(10),
  solutionExplanation: text(3000),
});
export type Exercise = z.infer<typeof exerciseSchema>;

// ─── Knowledge check question ─────────────────────────────────────────────────
const answerOptionSchema = z.object({ id: text(40), text: text(500) });
export const knowledgeCheckSchema = z.discriminatedUnion("type", [
  z.object({
    id: text(100), type: z.literal("single-choice"),
    prompt: text(1200),
    options: z.array(answerOptionSchema).min(2).max(6),
    correctOptionIds: z.array(text(40)).length(1),
    explanation: text(800),
    objectiveIds: z.array(text(100)).min(1),
  }),
  z.object({
    id: text(100), type: z.literal("multiple-select"),
    prompt: text(1200),
    options: z.array(answerOptionSchema).min(3).max(8),
    correctOptionIds: z.array(text(40)).min(2),
    explanation: text(800),
    objectiveIds: z.array(text(100)).min(1),
  }),
  z.object({
    id: text(100), type: z.literal("true-false"),
    prompt: text(1200),
    options: z.tuple([answerOptionSchema, answerOptionSchema]),
    correctOptionIds: z.array(text(40)).length(1),
    explanation: text(800),
    objectiveIds: z.array(text(100)).min(1),
  }),
]);
export type KnowledgeCheck = z.infer<typeof knowledgeCheckSchema>;

// ─── Lesson section ───────────────────────────────────────────────────────────
export const lessonSectionSchema = z.object({
  id: text(100),
  heading: text(200),
  content: text(8000),
  codeExamples: z.array(codeExampleSchema).max(8).default([]),
  keyPoints: z.array(text(300)).max(10).default([]),
  commonMistakes: z.array(text(400)).max(8).default([]),
});

// ─── External Video & Documentation Resources ─────────────────────────────────
export const externalResourceSchema = z.object({
  id: text(100),
  title: text(200),
  provider: z.enum(["youtube", "documentation", "tutorial", "coursera", "edx", "other"]).default("youtube"),
  channelOrAuthor: optText(160),
  url: z.string().url().max(2000),
  embedUrl: optText(2000),
  durationMinutes: z.number().int().min(1).max(600).optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  whySelected: optText(500),
  whatItTeaches: optText(500),
  learningObjectivesSupported: z.array(text(200)).default([]),
  keyTopicsCovered: z.array(text(200)).default([]),
  followUpActivity: optText(500),
  verificationStatus: z.enum(["verified", "curated", "unverified"]).default("curated"),
  lastCheckedDate: z.string().optional(),
});
export type ExternalResource = z.infer<typeof externalResourceSchema>;

// ─── Full lesson document ─────────────────────────────────────────────────────
export const lessonDocumentSchema = z.object({
  lessonId: text(100),
  skillName: text(120),
  moduleId: text(100),
  title: text(200),
  summary: text(600),
  learnerLevel: z.enum(["foundation", "beginner", "intermediate", "advanced"]),
  estimatedMinutes: z.number().int().min(5).max(480),
  learningObjectives: z.array(text(400)).min(1).max(10),
  objectiveIds: z.array(text(100)).min(1).max(10),
  prerequisiteConcepts: z.array(text(200)).max(10).default([]),
  sections: z.array(lessonSectionSchema).min(1).max(12),
  exercises: z.array(exerciseSchema).max(5).default([]),
  knowledgeChecks: z.array(knowledgeCheckSchema).min(1).max(8),
  recap: text(1000),
  videoResources: z.array(externalResourceSchema).default([]),
  furtherReading: z.array(z.object({
    title: text(200),
    url: z.string().url().max(2000),
    description: optText(300),
  })).max(8).default([]),
  realWorldApplications: z.array(text(400)).max(6).default([]),
  generationMode: z.enum(["ai-draft"]),
  reviewStatus: z.enum(["draft"]),
  contentVersion: z.number().int().positive(),
  generatedAt: z.string().datetime(),
});
export type LessonDocument = z.infer<typeof lessonDocumentSchema>;

// ─── Integrity check ──────────────────────────────────────────────────────────
export function assertLessonIntegrity(input: unknown): LessonDocument {
  const lesson = lessonDocumentSchema.parse(input);

  // All knowledge check questions must have a valid objectiveId from this lesson
  const lessonObjectiveIds = new Set(lesson.objectiveIds);
  for (const question of lesson.knowledgeChecks) {
    for (const id of question.objectiveIds) {
      if (!lessonObjectiveIds.has(id)) {
        throw new Error(`Knowledge check references unknown objective: ${id}`);
      }
    }
  }

  // Must have at least one knowledge check per declared objective
  const covered = new Set(lesson.knowledgeChecks.flatMap((q) => q.objectiveIds));
  const missing = [...lessonObjectiveIds].filter((id) => !covered.has(id));
  if (missing.length > 0) {
    throw new Error(`Objectives without knowledge check coverage: ${missing.join(", ")}`);
  }

  // Verify sections have content
  if (!lesson.sections.some((s) => s.content.length > 100)) {
    throw new Error("Lesson sections do not contain meaningful content");
  }

  return lesson;
}

// ─── Submission grading ───────────────────────────────────────────────────────
export const quizSubmissionSchema = z.object({
  lessonId: text(100),
  questionSetVersion: z.number().int().positive(),
  answers: z.record(z.string().max(100), z.array(z.string().max(40)).max(10)),
});

export type GradedKnowledgeCheck = {
  questionId: string;
  correct: boolean;
  selectedOptionIds: string[];
  correctOptionIds: string[];
  explanation: string;
  objectiveIds: string[];
};

export function gradeKnowledgeChecks(
  questions: KnowledgeCheck[],
  submission: { questionSetVersion: number; answers: Record<string, string[]> },
): { questionSetVersion: number; correct: number; total: number; score: number; results: GradedKnowledgeCheck[] } {
  const results: GradedKnowledgeCheck[] = questions.map((question) => {
    const selected = [...new Set(submission.answers[question.id] ?? [])].sort();
    const expected = [...question.correctOptionIds].sort();
    return {
      questionId: question.id,
      correct: selected.length === expected.length && selected.every((v, i) => v === expected[i]),
      selectedOptionIds: selected,
      correctOptionIds: expected,
      explanation: question.explanation,
      objectiveIds: question.objectiveIds,
    };
  });
  const correct = results.filter((r) => r.correct).length;
  return {
    questionSetVersion: submission.questionSetVersion,
    correct,
    total: results.length,
    score: results.length > 0 ? Math.round((correct / results.length) * 100) : 0,
    results,
  };
}
