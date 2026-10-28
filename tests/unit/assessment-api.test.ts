// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const { authMock, assessmentMocks, twinMocks } = vi.hoisted(() => ({ authMock: vi.fn(), assessmentMocks: { create: vi.fn(), validate: vi.fn(), complete: vi.fn() }, twinMocks: { get: vi.fn(), completeAssessment: vi.fn() } }));
vi.mock("server-only", () => ({}));
vi.mock("@clerk/nextjs/server", () => ({ auth: authMock }));
vi.mock("@/lib/assessments/repository", () => ({ AssessmentSessionError: class AssessmentSessionError extends Error { constructor(public code: string) { super(code); } }, createAssessmentSession: assessmentMocks.create, validateAssessmentSession: assessmentMocks.validate, completeAssessmentSession: assessmentMocks.complete }));
vi.mock("@/lib/twin/repository", () => ({ getCareerTwin: twinMocks.get, completeAssessmentWithTwin: twinMocks.completeAssessment }));

import { POST as createAssessment } from "@/app/api/assessments/session/route";
import { POST as submitAssessment } from "@/app/api/assessments/submit/route";

describe("weekly assessment API", () => {
  beforeEach(() => {
    vi.clearAllMocks(); authMock.mockResolvedValue({ userId: "user_1" });
    assessmentMocks.create.mockResolvedValue(undefined); assessmentMocks.validate.mockResolvedValue(undefined); assessmentMocks.complete.mockResolvedValue(undefined);
    twinMocks.get.mockResolvedValue({ source: { evidence: {}, development: { tasks: [], projects: [], practice: [] }, weekly: { settings: { hours: 5, sessionMinutes: 45, days: ["Tue"] }, activities: [], attempts: [] }, assessmentEvidence: {} } });
    twinMocks.completeAssessment.mockResolvedValue({});
  });

  it("keeps answer keys and explanations out of the question response", async () => {
    const response = await createAssessment(new Request("http://test/api/assessments/session", { method: "POST", body: JSON.stringify({ role: "Data Analyst", questionCount: 3 }) }));
    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(payload.data.questions).toHaveLength(3);
    expect(payload.data.questions[0]).not.toHaveProperty("correctOptionId");
    expect(payload.data.questions[0]).not.toHaveProperty("explanation");
  });

  it("rejects unauthenticated assessment creation", async () => {
    authMock.mockResolvedValue({ userId: null });
    const response = await createAssessment(new Request("http://test/api/assessments/session", { method: "POST", body: JSON.stringify({ role: "Data Analyst", questionCount: 3 }) }));
    expect(response.status).toBe(401);
  });

  it("scores submitted answers server-side and returns explanations afterward", async () => {
    const response = await submitAssessment(new Request("http://test/api/assessments/submit", { method: "POST", body: JSON.stringify({ assessmentId: "123e4567-e89b-12d3-a456-426614174000", role: "Data Analyst", answers: [{ questionId: "sql-join-1", optionId: "c" }, { questionId: "data-quality-1", optionId: "b" }] }) }));
    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(payload.data.correct).toBe(1);
    expect(payload.data.total).toBe(2);
    expect(payload.data.score).toBe(50);
    expect(payload.data.revisionSkills).toContain("Data cleaning");
    expect(payload.data.results[0].explanation).toBeTruthy();
    expect(payload.data.interpretation).toMatch(/does not prove complete competency/i);
  });

  it("rejects duplicate question submissions", async () => {
    const body = { assessmentId: "123e4567-e89b-12d3-a456-426614174000", role: "Data Analyst", answers: [{ questionId: "sql-join-1", optionId: "c" }, { questionId: "sql-join-1", optionId: "a" }] };
    const response = await submitAssessment(new Request("http://test/api/assessments/submit", { method: "POST", body: JSON.stringify(body) }));
    expect(response.status).toBe(400);
  });
});
