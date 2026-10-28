import { z } from "zod";

export const interviewTypeSchema = z.enum(["behavioral", "technical", "communication"]);
export const difficultySchema = z.enum(["beginner", "intermediate", "advanced"]);
export const sessionLengthSchema = z.union([z.literal(5), z.literal(10), z.literal(15)]);

export const rubricDefinitions = {
  behavioral: [
    { criterion: "relevance", weight: 0.2 },
    { criterion: "STAR structure", weight: 0.25 },
    { criterion: "reflection", weight: 0.2 },
    { criterion: "clarity", weight: 0.15 },
    { criterion: "role alignment", weight: 0.2 },
  ],
  technical: [
    { criterion: "accuracy", weight: 0.3 },
    { criterion: "reasoning", weight: 0.25 },
    { criterion: "relevance", weight: 0.15 },
    { criterion: "clarity", weight: 0.15 },
    { criterion: "edge cases and efficiency", weight: 0.15 },
  ],
  communication: [
    { criterion: "structure", weight: 0.25 },
    { criterion: "conciseness", weight: 0.2 },
    { criterion: "relevance", weight: 0.2 },
    { criterion: "expression", weight: 0.2 },
    { criterion: "responsiveness", weight: 0.15 },
  ],
} as const;

export const rubricByType = {
  behavioral: rubricDefinitions.behavioral.map((item) => item.criterion),
  technical: rubricDefinitions.technical.map((item) => item.criterion),
  communication: rubricDefinitions.communication.map((item) => item.criterion),
} as const;

export const interviewEvaluationRequestSchema = z.object({
  interviewType: interviewTypeSchema,
  difficulty: difficultySchema,
  targetRole: z.string().trim().min(2).max(120),
  question: z.string().trim().min(10).max(1000),
  answer: z.string().trim().min(20).max(8000),
});

export const createInterviewSessionSchema = z.object({
  interviewType: interviewTypeSchema,
  difficulty: difficultySchema,
  adaptiveDifficulty: z.boolean().default(false),
  questionCount: sessionLengthSchema,
  playbackEnabled: z.boolean().default(false),
  targetRole: z.string().trim().min(2).max(120),
  allowProfileContext: z.boolean().default(false),
});

export const submitInterviewAnswerSchema = z.object({
  answer: z.string().trim().min(20).max(8000),
  inputMode: z.enum(["text", "voice"]),
});

export const reassessmentSchema = z.object({ clarification: z.string().trim().min(10).max(2000) });

const criterionSchema = z.object({
  criterion: z.string().trim().min(2).max(80),
  weight: z.number().positive().max(1),
  rating: z.number().int().min(1).max(5).nullable(),
  assessed: z.boolean(),
  explanation: z.string().trim().min(1).max(1000),
  evidence: z.array(z.string().trim().min(1).max(500)).max(4),
});

export const interviewEvaluationSchema = z.object({
  strengths: z.array(z.string().trim().min(1).max(500)).max(6),
  missingDetails: z.array(z.string().trim().min(1).max(500)).max(6),
  suggestions: z.array(z.string().trim().min(1).max(500)).max(6),
  improvedAnswer: z.string().trim().min(1).max(8000),
  criteria: z.array(criterionSchema).min(1).max(8),
});

export type InterviewEvaluation = z.infer<typeof interviewEvaluationSchema>;

export function summarizeEvaluation(evaluation: InterviewEvaluation) {
  const totalWeight = evaluation.criteria.reduce((sum, item) => sum + item.weight, 0);
  const assessed = evaluation.criteria.filter((item) => item.assessed && item.rating !== null);
  const assessedWeight = assessed.reduce((sum, item) => sum + item.weight, 0);
  const coverage = totalWeight > 0 ? assessedWeight / totalWeight : 0;
  const weightedScore = assessedWeight > 0
    ? assessed.reduce((sum, item) => sum + (item.rating as number) * item.weight, 0) / assessedWeight
    : null;
  return {
    coverage,
    overallScore: coverage >= 0.75 && weightedScore !== null ? Math.round(weightedScore * 100) / 100 : null,
    explanation: coverage >= 0.75 ? "Overall score calculated from assessed rubric weight." : "Overall score withheld because less than 75% of rubric weight was assessed.",
  };
}

export function assertRubricIntegrity(type: keyof typeof rubricDefinitions, evaluation: InterviewEvaluation) {
  const expected = rubricDefinitions[type];
  if (evaluation.criteria.length !== expected.length) throw new Error("Evaluation rubric does not match the requested interview type.");
  for (const definition of expected) {
    const criterion = evaluation.criteria.find((item) => item.criterion.toLowerCase() === definition.criterion.toLowerCase());
    if (!criterion || Math.abs(criterion.weight - definition.weight) > 0.0001) throw new Error("Evaluation rubric weights are invalid.");
    if ((!criterion.assessed && criterion.rating !== null) || (criterion.assessed && criterion.rating === null)) throw new Error("Evaluation evidence status is inconsistent.");
  }
  return evaluation;
}
