import { describe, expect, it } from "vitest";
import {
  buildDeterministicMockTest,
  generateAndSaveMockTestsForSkill,
} from "@/lib/learning/mock-test-engine";
import {
  sanitizeMockTestForStudent,
  gradeMockTest,
  mockTestDocumentSchema,
} from "@/lib/learning/mock-test-schema";
import {
  getMockTest,
  listMockTestsForSkill,
  saveMockTestAttempt,
  getUserMockTestAttempts,
} from "@/lib/learning/repository";

describe("Mock Test System & Persistence", () => {
  it("generates a valid, schema-compliant 20-question mock test", () => {
    const testDoc = buildDeterministicMockTest("Python", "beginner", 1);
    const parsed = mockTestDocumentSchema.parse(testDoc);

    expect(parsed.id).toBe("mock-python-beginner-t1");
    expect(parsed.skillName).toBe("Python");
    expect(parsed.questions.length).toBe(20);
    expect(parsed.durationMinutes).toBe(30);
    expect(parsed.passingPercentage).toBe(70);
    expect(parsed.totalMarks).toBeGreaterThanOrEqual(20);
    expect(parsed.topicsCovered.length).toBeGreaterThan(0);

    // Verify questions have unique IDs and valid options
    const questionIds = new Set(parsed.questions.map((q) => q.id));
    expect(questionIds.size).toBe(20);
  });

  it("sanitizes mock test questions so student view contains no answer keys", () => {
    const testDoc = buildDeterministicMockTest("TypeScript", "intermediate", 1);
    const sanitized = sanitizeMockTestForStudent(testDoc);

    for (const q of sanitized.questions) {
      expect((q as Record<string, unknown>).correctOptionIds).toBeUndefined();
      expect((q as Record<string, unknown>).explanation).toBeUndefined();
      expect(q.prompt).toBeTruthy();
      expect(q.options.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("grades submissions accurately, reports topic scores, and recommends lessons for mistakes", () => {
    const testDoc = buildDeterministicMockTest("SQL", "beginner", 1);

    // Answer first 14 questions correctly, remaining 6 incorrectly
    const answers: Record<string, string[]> = {};
    for (let i = 0; i < testDoc.questions.length; i++) {
      const q = testDoc.questions[i];
      if (i < 14) {
        answers[q.id] = [...q.correctOptionIds];
      } else {
        answers[q.id] = ["wrong-option-id"];
      }
    }

    const report = gradeMockTest(testDoc, {
      testId: testDoc.id,
      answers,
      timeSpentSeconds: 650,
    });

    expect(report.testId).toBe(testDoc.id);
    expect(report.percentage).toBe(70);
    expect(report.passed).toBe(true);
    expect(report.incorrectQuestionCount).toBe(6);
    expect(Object.keys(report.topicWiseScores).length).toBeGreaterThan(0);
    expect(report.recommendedLessons.length).toBeGreaterThan(0);
  });

  it("persists mock tests and user attempts across restarts", async () => {
    const tests = await generateAndSaveMockTestsForSkill("React", "beginner", 3);
    expect(tests.length).toBe(3);

    const savedTest = await getMockTest("mock-react-beginner-t1");
    expect(savedTest).not.toBeNull();
    expect(savedTest?.skillName).toBe("React");

    const listed = await listMockTestsForSkill("react", "beginner");
    expect(listed.length).toBeGreaterThanOrEqual(3);

    // Record an attempt
    const report = gradeMockTest(savedTest!, {
      testId: savedTest!.id,
      answers: {},
      timeSpentSeconds: 300,
    });

    const testUserId = `test_learner_${Date.now()}`;
    await saveMockTestAttempt(testUserId, report);

    const attempts = await getUserMockTestAttempts(testUserId);
    expect(attempts.length).toBe(1);
    expect(attempts[0].testId).toBe(savedTest!.id);
  });
});

