import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  generateQuestion: vi.fn(),
  createSession: vi.fn(),
  getSession: vi.fn(),
  getQuestion: vi.fn(),
  saveReassessment: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@clerk/nextjs/server", () => ({ auth: mocks.auth }));
vi.mock("@/lib/ai/provider", async () => {
  class AIConfigurationError extends Error {}
  class AIProviderError extends Error { constructor(message: string, readonly status = 502, readonly retryAfter?: string) { super(message); } }
  return { AIConfigurationError, AIProviderError, generateInterviewQuestion: mocks.generateQuestion, evaluateInterviewAnswer: vi.fn(async () => ({ strengths: ["Relevant"], missingDetails: [], suggestions: ["Add detail"], improvedAnswer: "Improved authentic answer", criteria: [{ criterion: "relevance", weight: 0.2, rating: 4, assessed: true, explanation: "Evidence", evidence: ["example"] }, { criterion: "STAR structure", weight: 0.25, rating: 4, assessed: true, explanation: "Evidence", evidence: ["example"] }, { criterion: "reflection", weight: 0.2, rating: 4, assessed: true, explanation: "Evidence", evidence: ["example"] }, { criterion: "clarity", weight: 0.15, rating: 4, assessed: true, explanation: "Evidence", evidence: ["example"] }, { criterion: "role alignment", weight: 0.2, rating: 4, assessed: true, explanation: "Evidence", evidence: ["example"] }] })) };
});
vi.mock("@/lib/interviews/repository", () => {
  class InterviewNotFoundError extends Error {}
  class InterviewConflictError extends Error {}
  return { InterviewNotFoundError, InterviewConflictError, createSessionRecord: mocks.createSession, getOwnedSession: mocks.getSession, getOwnedQuestion: mocks.getQuestion, saveReassessment: mocks.saveReassessment };
});

import { POST as createSession } from "@/app/api/interviews/sessions/route";
import { POST as reassess } from "@/app/api/interviews/[sessionId]/questions/[questionId]/reassess/route";

const validSession = { interviewType: "behavioral", difficulty: "beginner", adaptiveDifficulty: false, questionCount: 5, playbackEnabled: true, targetRole: "Policy Analyst", allowProfileContext: false };

describe("secure interview session routes", () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.auth.mockResolvedValue({ userId: "user_1" }); mocks.generateQuestion.mockResolvedValue({ question: "Tell me about a difficult decision you made at work.", category: "Judgement", guidance: "Use explicit context and outcomes." }); mocks.createSession.mockResolvedValue({ session: { id: "session_1" }, question: { id: "question_1" } }); });

  it("rejects unauthenticated session creation", async () => { mocks.auth.mockResolvedValue({ userId: null }); const response = await createSession(new Request("http://test/api/interviews/sessions", { method: "POST", body: JSON.stringify(validSession) })); expect(response.status).toBe(401); expect(mocks.createSession).not.toHaveBeenCalled(); });

  it("validates setup before calling AI", async () => { const response = await createSession(new Request("http://test/api/interviews/sessions", { method: "POST", body: JSON.stringify({ ...validSession, questionCount: 7 }) })); expect(response.status).toBe(400); expect(mocks.generateQuestion).not.toHaveBeenCalled(); });

  it("creates a persisted session only after a real question is generated", async () => { const response = await createSession(new Request("http://test/api/interviews/sessions", { method: "POST", body: JSON.stringify(validSession) })); expect(response.status).toBe(201); expect(mocks.generateQuestion).toHaveBeenCalledOnce(); expect(mocks.createSession).toHaveBeenCalledWith("user_1", expect.objectContaining({ questionCount: 5 }), expect.objectContaining({ category: "Judgement" })); });

  it("stores reassessment as a new assessment operation", async () => { mocks.getSession.mockResolvedValue({ interview_type: "behavioral", target_role: "Policy Analyst" }); mocks.getQuestion.mockResolvedValue({ difficulty: "beginner", prompt: "Tell me about a decision.", answer_text: "I reviewed evidence, made the decision, and reflected on the result." }); mocks.saveReassessment.mockResolvedValue({ version: 2, kind: "reassessment" }); const response = await reassess(new Request("http://test/reassess", { method: "POST", body: JSON.stringify({ clarification: "The evidence quote about reflection appears in the final sentence." }) }), { params: Promise.resolve({ sessionId: "session_1", questionId: "question_1" }) }); expect(response.status).toBe(201); expect(mocks.saveReassessment).toHaveBeenCalledWith("user_1", "session_1", "question_1", expect.stringContaining("final sentence"), expect.any(Object), expect.objectContaining({ overallScore: 4 })); });
});
