// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const { authMock } = vi.hoisted(() => ({ authMock: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@clerk/nextjs/server", () => ({ auth: authMock }));
vi.mock("@/lib/ai/provider", () => ({
  generateLesson: vi.fn(),
  getAIProviderStatus: vi.fn(() => ({ configured: false, model: null })),
}));

import { POST } from "@/app/api/learning/lessons/route";

describe("Learning Lessons API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.mockResolvedValue({ userId: "user_test_1" });
  });

  it("rejects unauthenticated requests with 401", async () => {
    authMock.mockResolvedValue({ userId: null });
    const response = await POST(
      new Request("http://test/api/learning/lessons", {
        method: "POST",
        body: JSON.stringify({ skillName: "Python", moduleId: "m1", lessonId: "l1", lessonTitle: "Syntax" }),
      })
    );
    expect(response.status).toBe(401);
  });

  it("rejects invalid request bodies with 400", async () => {
    const response = await POST(
      new Request("http://test/api/learning/lessons", {
        method: "POST",
        body: JSON.stringify({}),
      })
    );
    expect(response.status).toBe(400);
  });

  it("generates deterministic fallback lesson when AI provider is unconfigured", async () => {
    const response = await POST(
      new Request("http://test/api/learning/lessons", {
        method: "POST",
        body: JSON.stringify({
          skillName: "TypeScript",
          moduleId: "module-types",
          lessonId: "lesson-generics",
          lessonTitle: "Advanced Generics",
          learnerLevel: "intermediate",
        }),
      })
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.data.source).toBe("curated-fallback");
    expect(json.data.lesson.title).toBe("Advanced Generics");
    expect(json.data.lesson.sections.length).toBeGreaterThan(0);
    expect(json.data.lesson.knowledgeChecks.length).toBeGreaterThan(0);
  });
});
