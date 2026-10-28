// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const { authMock } = vi.hoisted(() => ({ authMock: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@clerk/nextjs/server", () => ({ auth: authMock }));
vi.mock("@/lib/ai/provider", () => ({
  askAITutor: vi.fn(),
  getAIProviderStatus: vi.fn(() => ({ configured: false, model: null })),
}));

import { POST } from "@/app/api/learning/tutor/route";

describe("Learning AI Tutor API", () => {
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

  it("provides helpful pedagogical fallback when AI provider is unconfigured", async () => {
    const res = await POST(
      new Request("http://test/api/learning/tutor", {
        method: "POST",
        body: JSON.stringify({
          question: "How should I structure error boundaries in React?",
          skillName: "React",
          lessonTitle: "Component Resilience",
        }),
      })
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.answer).toBeDefined();
    expect(json.data.relatedConcepts.length).toBeGreaterThan(0);
    expect(json.data.suggestedAction).toBeDefined();
  });
});
