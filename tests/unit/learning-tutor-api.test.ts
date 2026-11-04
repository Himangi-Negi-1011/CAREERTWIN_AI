// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const { authMock } = vi.hoisted(() => ({ authMock: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@clerk/nextjs/server", () => ({ auth: authMock }));
vi.mock("@/lib/ai/provider", () => ({
  askAILearningAgent: vi.fn(),
  askAITutor: vi.fn(),
  getAIProviderStatus: vi.fn(() => ({ configured: false, model: null })),
}));

import { POST } from "@/app/api/learning/tutor/route";
import { AGENT_MODES, type AgentMode } from "@/lib/learning/agent";

describe("Learning AI Agent API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.mockResolvedValue({ userId: "user_test_tutor" });
  });

  it("requires authentication", async () => {
    authMock.mockResolvedValue({ userId: null });
    const res = await POST(
      new Request("http://test/api/learning/tutor", {
        method: "POST",
        body: JSON.stringify({ question: "How does async work?", skillName: "Node.js" }),
      })
    );
    expect(res.status).toBe(401);
  });

  it("rejects invalid requests with status 400", async () => {
    const res = await POST(
      new Request("http://test/api/learning/tutor", {
        method: "POST",
        body: JSON.stringify({ question: "x", skillName: "" }),
      })
    );
    expect(res.status).toBe(400);
  });

  it("provides helpful pedagogical fallback across all 9 agent modes", async () => {
    for (const mode of AGENT_MODES) {
      const res = await POST(
        new Request("http://test/api/learning/tutor", {
          method: "POST",
          body: JSON.stringify({
            question: `How does testing work in this context? [Mode: ${mode}]`,
            skillName: "TypeScript",
            lessonTitle: "Generics & Type Safety",
            mode,
            studentLevel: "intermediate",
            weakTopics: ["Type narrowing", "Discriminated unions"],
          }),
        })
      );

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.mode).toBe(mode);
      expect(json.data.answer).toBeTruthy();
      expect(json.data.keyTakeaways.length).toBeGreaterThan(0);
      expect(json.data.relatedConcepts.length).toBeGreaterThan(0);
      expect(json.data.suggestedAction).toBeTruthy();

      if (mode === "quiz_me") {
        expect(json.data.quizQuestions).toBeDefined();
        expect(json.data.quizQuestions.length).toBeGreaterThan(0);
        expect(json.data.quizQuestions[0].options.length).toBeGreaterThanOrEqual(2);
      }

      if (mode === "career_connection") {
        expect(json.data.careerImpact).toBeDefined();
      }
    }
  });
});
