// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const { authMock } = vi.hoisted(() => ({ authMock: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@clerk/nextjs/server", () => ({ auth: authMock }));

import { POST } from "@/app/api/learning/quiz/route";

describe("Learning Quiz API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.mockResolvedValue({ userId: "user_test_quiz" });
  });

  it("requires authentication", async () => {
    authMock.mockResolvedValue({ userId: null });
    const res = await POST(
      new Request("http://test/api/learning/quiz", {
        method: "POST",
        body: JSON.stringify({ lessonId: "l1", answers: {}, questions: [] }),
      })
    );
    expect(res.status).toBe(401);
  });

  it("grades single-choice and multiple-select questions accurately", async () => {
    const questions = [
      {
        id: "q1",
        type: "single-choice" as const,
        prompt: "What is 2+2?",
        options: [
          { id: "opt-1", text: "3" },
          { id: "opt-2", text: "4" },
        ],
        correctOptionIds: ["opt-2"],
        explanation: "2+2=4",
        objectiveIds: ["obj-math"],
      },
      {
        id: "q2",
        type: "multiple-select" as const,
        prompt: "Select even numbers",
        options: [
          { id: "opt-a", text: "2" },
          { id: "opt-b", text: "3" },
          { id: "opt-c", text: "4" },
        ],
        correctOptionIds: ["opt-a", "opt-c"],
        explanation: "2 and 4 are even",
        objectiveIds: ["obj-math"],
      },
    ];

    const res = await POST(
      new Request("http://test/api/learning/quiz", {
        method: "POST",
        body: JSON.stringify({
          lessonId: "math-lesson",
          questionSetVersion: 1,
          answers: {
            q1: ["opt-2"],
            q2: ["opt-a", "opt-c"],
          },
          questions,
        }),
      })
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.score).toBe(100);
    expect(json.data.correct).toBe(2);
    expect(json.data.total).toBe(2);
    expect(json.data.results[0].correct).toBe(true);
    expect(json.data.results[1].correct).toBe(true);
  });
});
