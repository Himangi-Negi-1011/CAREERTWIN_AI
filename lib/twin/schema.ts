import { z } from "zod";
import { careerProfileSchema } from "@/lib/profile/schema";

const text = (max: number) => z.string().trim().max(max);
export const evidenceStatusSchema = z.enum(["not-reviewed", "learning", "demonstrated"]);
export const skillEvidenceSchema = z.object({ status: evidenceStatusSchema, evidence: text(2000) });
export const evidenceStoreSchema = z.record(z.string().max(120), z.object({ records: z.record(z.string().max(120), skillEvidenceSchema), customSkills: z.array(text(120)).max(100) })).default({});

export const developmentSchema = z.object({
  tasks: z.array(z.object({ id: text(160), title: text(160), detail: text(4000).default(""), done: z.boolean().default(false), createdAt: z.string().default(""), status: z.enum(["planned", "in-progress", "paused", "complete"]).optional(), skill: text(120).optional(), prerequisites: text(1000).optional(), priority: z.enum(["high", "medium", "low"]).optional(), estimatedMinutes: z.number().int().min(0).max(10080).optional(), plannedDate: text(20).optional(), notes: text(2000).optional() })).max(500),
  projects: z.array(z.object({ id: text(160), title: text(160), outcome: text(2000).default(""), status: z.enum(["planned", "building", "complete"]), createdAt: z.string().default("") })).max(200),
  practice: z.array(z.object({ questionId: text(200), rating: z.number().min(0).max(5), note: text(2000), answerText: text(5000).optional(), mode: z.enum(["text", "voice-review"]).optional(), practicedAt: z.string() })).max(500),
}).default({ tasks: [], projects: [], practice: [] });

export const weeklySchema = z.object({
  settings: z.object({ hours: z.number().min(0).max(168), sessionMinutes: z.number().int().min(5).max(240), days: z.array(z.enum(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"])).max(7) }),
  activities: z.array(z.object({ id: text(160), title: text(160), skill: text(120).default(""), objective: text(1000).default(""), plannedDate: text(20), estimatedMinutes: z.number().int().min(0).max(1440), actualMinutes: z.number().int().min(0).max(1440), completionCriteria: text(1000).default(""), status: z.enum(["planned", "in-progress", "complete"]), sourceTaskId: text(160).optional() })).max(500),
  attempts: z.array(z.object({ assessmentId: z.string().uuid(), completedAt: z.string().datetime(), correct: z.number().int().nonnegative(), total: z.number().int().positive(), score: z.number().min(0).max(100), revisionSkills: z.array(text(120)).max(20), interpretation: text(1000) })).max(100),
}).default({ settings: { hours: 5, sessionMinutes: 45, days: ["Tue", "Thu", "Sat"] }, activities: [], attempts: [] });

export const assessmentEvidenceSchema = z.record(z.string().max(120), z.object({ assessmentId: z.string().uuid(), score: z.number().min(0).max(100), correct: z.number().int().nonnegative(), total: z.number().int().positive(), completedAt: z.string().datetime() })).default({});

export const learningStateSchema = z.object({
  enrollments: z.array(z.object({ id: text(160), skillId: z.string().uuid().nullable(), skillName: text(120), level: z.enum(["foundation", "beginner", "intermediate", "advanced"]), curriculumVersion: z.number().int().positive(), status: z.enum(["preparing", "active", "paused", "complete", "unavailable"]), currentModule: z.number().int().nonnegative(), currentLesson: z.number().int().nonnegative(), enrolledAt: z.string().datetime(), lastStudiedAt: z.string().datetime().nullable() })).max(100),
  lessonProgress: z.array(z.object({ enrollmentId: text(160), moduleId: text(100), lessonId: text(100), status: z.enum(["not-started", "in-progress", "complete"]), completedAt: z.string().datetime().nullable(), reflection: text(2000).default("") })).max(2000),
  quizAttempts: z.array(z.object({ id: z.string().uuid(), enrollmentId: text(160), lessonId: text(100), questionSetVersion: z.number().int().positive(), score: z.number().min(0).max(100), correct: z.number().int().nonnegative(), total: z.number().int().positive(), objectiveIds: z.array(text(100)).max(30), completedAt: z.string().datetime() })).max(1000),
  masteryEvidence: z.array(z.object({ skillName: text(120), objectiveId: text(100), evidenceType: z.enum(["diagnostic", "quiz", "exercise", "project", "review"]), referenceId: text(160), result: z.number().min(0).max(100).nullable(), recordedAt: z.string().datetime() })).max(2000),
}).default({ enrollments: [], lessonProgress: [], quizAttempts: [], masteryEvidence: [] });

export const twinSourceStateSchema = z.object({ evidence: evidenceStoreSchema, development: developmentSchema, weekly: weeklySchema, assessmentEvidence: assessmentEvidenceSchema, learning: learningStateSchema }).default({ evidence: {}, development: { tasks: [], projects: [], practice: [] }, weekly: { settings: { hours: 5, sessionMinutes: 45, days: ["Tue", "Thu", "Sat"] }, activities: [], attempts: [] }, assessmentEvidence: {}, learning: { enrollments: [], lessonProgress: [], quizAttempts: [], masteryEvidence: [] } });
export type TwinSourceState = z.infer<typeof twinSourceStateSchema>;

const skillStateSchema = z.object({ name: z.string(), status: z.enum(["demonstrated", "developing", "assessed", "unverified"]), evidence: z.string().optional(), assessmentScore: z.number().optional() });
const gapSchema = z.object({ skill: z.string(), status: z.enum(["developing", "assessed", "unverified"]), priority: z.enum(["high", "medium", "low"]), reason: z.string(), prerequisites: z.array(z.string()), estimatedMinutes: z.number().int().positive() });
export const twinOutputSchema = z.object({
  version: z.literal(1), targetRole: z.string(), profileCompleteness: z.number().int().min(0).max(100), demonstratedSkills: z.array(skillStateSchema), developingSkills: z.array(skillStateSchema), unverifiedSkills: z.array(skillStateSchema), requiredSkills: z.array(z.string()), prioritizedGaps: z.array(gapSchema), recommendedNextAction: z.object({ type: z.enum(["profile", "evidence", "roadmap", "weekly", "assessment", "review"]), title: z.string(), detail: z.string(), destination: z.string() }),
  roadmap: z.object({ total: z.number().int().nonnegative(), completed: z.number().int().nonnegative(), nextTasks: z.array(z.object({ id: z.string(), title: z.string(), skill: z.string(), status: z.string(), estimatedMinutes: z.number().int().nonnegative() })) }),
  weekly: z.object({ availableHours: z.number().nonnegative(), plannedMinutes: z.number().int().nonnegative(), recordedMinutes: z.number().int().nonnegative(), completed: z.number().int().nonnegative(), total: z.number().int().nonnegative() }),
  assessmentStatus: z.object({ attempts: z.number().int().nonnegative(), lastCompletedAt: z.string().datetime().nullable(), assessedSkills: z.array(z.string()) }),
  evidenceCoverage: z.object({ score: z.number().int().min(0).max(100).nullable(), demonstrated: z.number().int().nonnegative(), required: z.number().int().nonnegative(), meaning: z.string() }),
  limitations: z.array(z.string()), dataSources: z.array(z.string()), calculatedAt: z.string().datetime(),
});
export type TwinOutput = z.infer<typeof twinOutputSchema>;
export const twinInputSchema = z.object({ profile: careerProfileSchema, source: twinSourceStateSchema });
