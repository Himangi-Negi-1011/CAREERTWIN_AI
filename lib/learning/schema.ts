import { z } from "zod";

const shortText = (max = 160) => z.string().trim().min(1).max(max);
const optionalUrl = z.string().url().max(2000);

export const skillLevelSchema = z.enum(["foundation", "beginner", "intermediate", "advanced"]);
export type SkillLevel = z.infer<typeof skillLevelSchema>;
export const contentStatusSchema = z.enum(["draft", "approved", "archived"]);

export const skillSchema = z.object({
  id: z.string().uuid(),
  canonicalName: shortText(120),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(140),
  aliases: z.array(shortText(120)).max(30),
  keywords: z.array(shortText(80)).max(40),
  domain: shortText(80),
  subdomain: shortText(100),
  description: shortText(1000),
  learningOutcomes: z.array(shortText(300)).min(1).max(20),
  difficulty: skillLevelSchema,
  prerequisites: z.array(shortText(120)).max(20),
  relatedRoles: z.array(shortText(120)).max(30),
  proficiencyCriteria: z.array(shortText(400)).min(1).max(20),
  contentVersion: z.number().int().positive(),
  lastReviewedAt: z.string().datetime().nullable(),
  reviewStatus: contentStatusSchema,
});
export type Skill = z.infer<typeof skillSchema>;

export const resourceReferenceSchema = z.object({
  title: shortText(240),
  organization: shortText(160),
  url: optionalUrl,
  retrievedAt: z.string().datetime(),
  reviewStatus: z.enum(["curated", "machine-checked", "needs-review"]),
});

export const learningObjectiveSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/).max(100),
  statement: shortText(400),
  order: z.number().int().nonnegative(),
});

export const curriculumModuleSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/).max(100),
  title: shortText(160),
  summary: shortText(700),
  order: z.number().int().nonnegative(),
  estimatedMinutes: z.number().int().min(10).max(10080),
  objectiveIds: z.array(shortText(100)).min(1).max(20),
  lessonTitles: z.array(shortText(180)).min(1).max(20),
  checkpoint: shortText(400),
});

export const curriculumSchema = z.object({
  skillId: z.string().uuid().nullable(),
  skillName: shortText(120),
  learnerLevel: skillLevelSchema,
  preferredLanguage: shortText(80).default("English"),
  objectives: z.array(learningObjectiveSchema).min(2).max(30),
  prerequisites: z.array(shortText(160)).max(20),
  modules: z.array(curriculumModuleSchema).min(1).max(20),
  practiceActivities: z.array(shortText(400)).min(1).max(30),
  assessmentCheckpoints: z.array(shortText(400)).min(1).max(20),
  projects: z.array(shortText(500)).min(1).max(12),
  proficiencyCriteria: z.array(shortText(500)).min(2).max(20),
  resources: z.array(resourceReferenceSchema).max(20),
  contentVersion: z.number().int().positive(),
  generationMode: z.enum(["curated", "ai-draft"]),
  reviewStatus: contentStatusSchema,
});
export type Curriculum = z.infer<typeof curriculumSchema>;

const answerOptionSchema = z.object({ id: shortText(40), text: shortText(500) });
export const quizQuestionSchema = z.discriminatedUnion("type", [
  z.object({ id: shortText(100), type: z.literal("single-choice"), prompt: shortText(1200), options: z.array(answerOptionSchema).min(2).max(8), correctOptionIds: z.array(shortText(40)).length(1), explanation: shortText(1200), difficulty: skillLevelSchema, objectiveIds: z.array(shortText(100)).min(1) }),
  z.object({ id: shortText(100), type: z.literal("multiple-select"), prompt: shortText(1200), options: z.array(answerOptionSchema).min(3).max(10), correctOptionIds: z.array(shortText(40)).min(2), explanation: shortText(1200), difficulty: skillLevelSchema, objectiveIds: z.array(shortText(100)).min(1) }),
  z.object({ id: shortText(100), type: z.literal("true-false"), prompt: shortText(1200), options: z.tuple([answerOptionSchema, answerOptionSchema]), correctOptionIds: z.array(shortText(40)).length(1), explanation: shortText(1200), difficulty: skillLevelSchema, objectiveIds: z.array(shortText(100)).min(1) }),
]);
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;

export const quizSubmissionSchema = z.object({
  questionSetVersion: z.number().int().positive(),
  answers: z.record(z.string().max(100), z.array(z.string().max(40)).max(10)),
});

export type GradedQuestion = { questionId: string; correct: boolean; selectedOptionIds: string[]; explanation: string; objectiveIds: string[] };
export function gradeObjectiveQuiz(questions: QuizQuestion[], input: unknown) {
  const submission = quizSubmissionSchema.parse(input);
  const results: GradedQuestion[] = questions.map((question) => {
    const selected = [...new Set(submission.answers[question.id] ?? [])].sort();
    const expected = [...question.correctOptionIds].sort();
    return { questionId: question.id, correct: selected.length === expected.length && selected.every((value, index) => value === expected[index]), selectedOptionIds: selected, explanation: question.explanation, objectiveIds: question.objectiveIds };
  });
  const correct = results.filter((result) => result.correct).length;
  return { questionSetVersion: submission.questionSetVersion, correct, total: results.length, score: results.length ? Math.round((correct / results.length) * 100) : 0, results };
}

export function assertCurriculumIntegrity(input: unknown): Curriculum {
  const curriculum = curriculumSchema.parse(input);
  const objectiveIds = new Set(curriculum.objectives.map((objective) => objective.id));
  const moduleIds = new Set<string>();
  for (const curriculumModule of curriculum.modules) {
    if (moduleIds.has(curriculumModule.id)) throw new Error(`Duplicate module id: ${curriculumModule.id}`);
    moduleIds.add(curriculumModule.id);
    for (const id of curriculumModule.objectiveIds) if (!objectiveIds.has(id)) throw new Error(`Module references unknown objective: ${id}`);
  }
  const covered = new Set(curriculum.modules.flatMap((curriculumModule) => curriculumModule.objectiveIds));
  const missing = [...objectiveIds].filter((id) => !covered.has(id));
  if (missing.length) throw new Error(`Objectives without module coverage: ${missing.join(", ")}`);
  return curriculum;
}
