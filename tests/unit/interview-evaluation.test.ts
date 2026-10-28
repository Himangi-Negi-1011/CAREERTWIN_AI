import { describe, expect, it } from "vitest";
import { assertRubricIntegrity, createInterviewSessionSchema, interviewEvaluationRequestSchema, interviewEvaluationSchema, rubricDefinitions, summarizeEvaluation } from "@/lib/ai/interview";

const base = {
  strengths: ["Explains the action taken."],
  missingDetails: ["The result is not measurable."],
  suggestions: ["State what changed after the action."],
  improvedAnswer: "I investigated the issue, changed the process, and documented the result.",
};

describe("interview evaluation contracts", () => {
  it("rejects short or unsupported evaluation requests", () => {
    expect(interviewEvaluationRequestSchema.safeParse({ interviewType: "sales", difficulty: "beginner", targetRole: "A", question: "Short", answer: "Too short" }).success).toBe(false);
  });

  it("withholds an overall score below 75 percent assessed weight", () => {
    const evaluation = interviewEvaluationSchema.parse({ ...base, criteria: [
      { criterion: "relevance", weight: 0.7, rating: 4, assessed: true, explanation: "Relevant example.", evidence: ["I investigated the issue"] },
      { criterion: "reflection", weight: 0.3, rating: null, assessed: false, explanation: "No reflection evidence.", evidence: [] },
    ] });
    expect(summarizeEvaluation(evaluation)).toMatchObject({ coverage: 0.7, overallScore: null });
  });

  it("calculates a weighted score only with sufficient evidence coverage", () => {
    const evaluation = interviewEvaluationSchema.parse({ ...base, criteria: [
      { criterion: "relevance", weight: 0.5, rating: 4, assessed: true, explanation: "Relevant.", evidence: ["investigated"] },
      { criterion: "clarity", weight: 0.5, rating: 3, assessed: true, explanation: "Mostly clear.", evidence: ["changed the process"] },
    ] });
    expect(summarizeEvaluation(evaluation)).toMatchObject({ coverage: 1, overallScore: 3.5 });
  });

  it("accepts only supported secure-session lengths", () => {
    const input = { interviewType: "technical", difficulty: "intermediate", adaptiveDifficulty: true, questionCount: 10, playbackEnabled: true, targetRole: "Platform Engineer", allowProfileContext: false };
    expect(createInterviewSessionSchema.safeParse(input).success).toBe(true);
    expect(createInterviewSessionSchema.safeParse({ ...input, questionCount: 7 }).success).toBe(false);
  });

  it("rejects provider output that changes rubric weights", () => {
    const criteria = rubricDefinitions.behavioral.map((item) => ({ ...item, rating: 4, assessed: true, explanation: "Explicit evidence.", evidence: ["example"] }));
    const evaluation = interviewEvaluationSchema.parse({ ...base, criteria });
    expect(assertRubricIntegrity("behavioral", evaluation)).toBe(evaluation);
    expect(() => assertRubricIntegrity("behavioral", { ...evaluation, criteria: evaluation.criteria.map((item, index) => index === 0 ? { ...item, weight: 0.1 } : item) })).toThrow(/weights/i);
  });
});
