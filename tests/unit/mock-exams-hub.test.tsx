import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MockExamsHubView, SUPPORTED_EXAM_SKILLS } from "@/app/components/dashboard/mock-exams-hub";
import { buildDeterministicMockTest } from "@/lib/learning/mock-test-engine";
import { gradeMockTest, sanitizeMockTestForStudent } from "@/lib/learning/mock-test-schema";

describe("MockExamsHubView (100-Mark Server-Graded Integration)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("loads sanitized 28-question 100-mark exams from API and launches timed exam without leaking answer keys", async () => {
    const serverTest = buildDeterministicMockTest("Python", "beginner", 1);
    const sanitized = sanitizeMockTestForStudent(serverTest);

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          skillName: "Python",
          level: "beginner",
          tests: [sanitized],
          attempts: [],
        },
      }),
    }) as typeof fetch;

    render(<MockExamsHubView ownerKey="test-user" />);

    expect(screen.getByTestId("mock-exams-hub-view")).toBeInTheDocument();
    expect(SUPPORTED_EXAM_SKILLS.length).toBe(14);

    await waitFor(() => {
      expect(screen.getByText(/Python 100-Mark Professional Mock Examination/i)).toBeInTheDocument();
    });

    const startButtons = screen.getAllByRole("button", { name: /Take Timed Exam/i });
    fireEvent.click(startButtons[0]);

    expect(screen.getByRole("button", { name: /Submit Exam/i })).toBeInTheDocument();
    expect(screen.getByText(/Question 1 of 28/i)).toBeInTheDocument();
    expect(screen.getByText(/100 Marks Total/i)).toBeInTheDocument();
  });

  it("submits answers to server endpoint and displays authoritative section & topic breakdowns", async () => {
    const serverTest = buildDeterministicMockTest("Python", "beginner", 1);
    const sanitized = sanitizeMockTestForStudent(serverTest);

    const mockAnswers: Record<string, string[]> = {};
    for (const q of serverTest.questions) {
      mockAnswers[q.id] = [...q.correctOptionIds];
    }
    const graded = gradeMockTest(serverTest, {
      testId: serverTest.id,
      answers: mockAnswers,
      timeSpentSeconds: 120,
    });

    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/submit")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: { report: graded } }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          data: { skillName: "Python", level: "beginner", tests: [sanitized], attempts: [] },
        }),
      });
    }) as typeof fetch;

    render(<MockExamsHubView ownerKey="test-user" />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Take Timed Exam/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Take Timed Exam/i }));

    // Select an option on Question 1
    const firstRadio = screen.getAllByRole("radio")[0];
    fireEvent.click(firstRadio);

    // Click Submit -> triggers early confirmation dialog since 27 questions remain unanswered -> confirm
    fireEvent.click(screen.getByRole("button", { name: /Submit Exam/i }));
    const confirmBtn = await screen.findByRole("button", { name: /Confirm Submit Now/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(screen.getByText(/Section Diagnostic Breakdown \(100 Marks\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Topic Diagnostic Breakdown/i)).toBeInTheDocument();
      expect(screen.getByText(/Detailed Question Review & Explanations/i)).toBeInTheDocument();
    });
  });
});
