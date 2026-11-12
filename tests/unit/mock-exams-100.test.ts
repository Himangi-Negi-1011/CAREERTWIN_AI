import { describe, expect, it } from "vitest";
import { buildDeterministicMockTest } from "@/lib/learning/mock-test-engine";
import { gradeMockTest, mockTestDocumentSchema, sanitizeMockTestForStudent } from "@/lib/learning/mock-test-schema";

describe("Stage 8 — 100-Mark Mock Examination Assertions", () => {
  const sampleSkills = [
    "Python",
    "SQL",
    "Cloud Computing",
    "Cybersecurity",
    "JavaScript",
    "TypeScript",
    "Power BI",
    "Go",
    "Rust",
    "Java",
    "C++",
    "C#",
    "C Programming",
    "PHP",
    "React",
    "Docker",
    "Linux",
    "Excel",
  ];

  it.each(sampleSkills)(
    "guarantees that full-length mock exam for %s totals EXACTLY 100 MARKS",
    (skill) => {
      const test = buildDeterministicMockTest(skill, "beginner", 1);
      const parsed = mockTestDocumentSchema.parse(test);

      // Core mark assertions
      expect(parsed.totalMarks).toBe(100);
      expect(parsed.durationMinutes).toBe(60);
      expect(parsed.passingPercentage).toBe(70);
      expect(parsed.questions.length).toBe(28);

      const calculatedSum = parsed.questions.reduce((sum, q) => sum + q.marks, 0);
      expect(calculatedSum).toBe(100);

      // Section distribution verification
      const secA = parsed.questions.filter((q) => q.section === "A");
      const secB = parsed.questions.filter((q) => q.section === "B");
      const secC = parsed.questions.filter((q) => q.section === "C");
      const secD = parsed.questions.filter((q) => q.section === "D");
      const secE = parsed.questions.filter((q) => q.section === "E");

      expect(secA.length).toBe(10);
      expect(secB.length).toBe(5);
      expect(secC.length).toBe(5);
      expect(secD.length).toBe(5);
      expect(secE.length).toBe(3);

      expect(secA.reduce((s, q) => s + q.marks, 0)).toBe(20);
      expect(secB.reduce((s, q) => s + q.marks, 0)).toBe(15);
      expect(secC.reduce((s, q) => s + q.marks, 0)).toBe(25);
      expect(secD.reduce((s, q) => s + q.marks, 0)).toBe(25);
      expect(secE.reduce((s, q) => s + q.marks, 0)).toBe(15);

      // No duplicate prompts
      const prompts = new Set(parsed.questions.map((q) => q.prompt));
      expect(prompts.size).toBe(28);
    }
  );

  it("grades a perfect submission as exactly 100/100 marks and 100%", () => {
    const test = buildDeterministicMockTest("Python", "intermediate", 1);
    const answers: Record<string, string[]> = {};
    for (const q of test.questions) {
      answers[q.id] = [...q.correctOptionIds];
    }

    const report = gradeMockTest(test, {
      testId: test.id,
      answers,
      timeSpentSeconds: 1800,
    });

    expect(report.score).toBe(100);
    expect(report.totalMarks).toBe(100);
    expect(report.percentage).toBe(100);
    expect(report.passed).toBe(true);
    expect(report.incorrectQuestionCount).toBe(0);
    expect(report.weakTopics.length).toBe(0);

    // Verify section-wise scores
    expect(report.sectionWiseScores?.A.scored).toBe(20);
    expect(report.sectionWiseScores?.B.scored).toBe(15);
    expect(report.sectionWiseScores?.C.scored).toBe(25);
    expect(report.sectionWiseScores?.D.scored).toBe(25);
    expect(report.sectionWiseScores?.E.scored).toBe(15);
  });

  it("grades an empty submission as 0/100 marks and 0%", () => {
    const test = buildDeterministicMockTest("Python", "intermediate", 1);
    const report = gradeMockTest(test, {
      testId: test.id,
      answers: {},
      timeSpentSeconds: 300,
    });

    expect(report.score).toBe(0);
    expect(report.totalMarks).toBe(100);
    expect(report.percentage).toBe(0);
    expect(report.passed).toBe(false);
    expect(report.incorrectQuestionCount).toBe(28);
  });

  it("evaluates passing boundary at exactly 70 marks", () => {
    const test = buildDeterministicMockTest("Python", "intermediate", 1);
    // Section A (20) + Section B (15) + Section C (25) + first 2 of Section D (10) = 70 marks exactly
    const answers: Record<string, string[]> = {};
    for (let i = 0; i < 22; i++) {
      const q = test.questions[i];
      answers[q.id] = [...q.correctOptionIds];
    }

    const report = gradeMockTest(test, {
      testId: test.id,
      answers,
      timeSpentSeconds: 2400,
    });

    expect(report.score).toBe(70);
    expect(report.totalMarks).toBe(100);
    expect(report.percentage).toBe(70);
    expect(report.passed).toBe(true);
    expect(report.incorrectQuestionCount).toBe(6);
  });

  it("awards partial marks deterministically for partially correct multi-select and 0 for invalid options", () => {
    const test = buildDeterministicMockTest("SQL", "beginner", 1);
    const multiQ = test.questions.find((q) => q.type === "multiple-select" && q.correctOptionIds.length >= 2);
    expect(multiQ).toBeDefined();

    if (multiQ) {
      // Select only subset of valid options -> partial credit (0 < award <= maxMarks)
      const partialAnswers = {
        [multiQ.id]: multiQ.correctOptionIds.slice(0, multiQ.correctOptionIds.length - 1),
      };
      const partialReport = gradeMockTest(test, {
        testId: test.id,
        answers: partialAnswers,
        timeSpentSeconds: 100,
      });
      const qRes = partialReport.questions.find((r) => r.questionId === multiQ.id)!;
      expect(qRes.marksAwarded).toBeGreaterThanOrEqual(1);
      expect(qRes.marksAwarded).toBeLessThan(multiQ.marks);

      // Selecting invalid option ID yields 0 marks
      const invalidReport = gradeMockTest(test, {
        testId: test.id,
        answers: { [multiQ.id]: ["nonexistent-opt-99"] },
        timeSpentSeconds: 100,
      });
      const invalidQRes = invalidReport.questions.find((r) => r.questionId === multiQ.id)!;
      expect(invalidQRes.marksAwarded).toBe(0);
    }
  });

  it("produces identical deterministic grades when re-running the same submission and strips keys on sanitize", () => {
    const test = buildDeterministicMockTest("Cybersecurity", "beginner", 1);
    const sanitized = sanitizeMockTestForStudent(test);

    for (const q of sanitized.questions) {
      expect((q as Record<string, unknown>).correctOptionIds).toBeUndefined();
      expect((q as Record<string, unknown>).explanation).toBeUndefined();
    }

    const answers: Record<string, string[]> = {};
    test.questions.forEach((q, idx) => {
      if (idx % 2 === 0) answers[q.id] = [...q.correctOptionIds];
    });

    const first = gradeMockTest(test, { testId: test.id, answers, timeSpentSeconds: 900 });
    const second = gradeMockTest(test, { testId: test.id, answers, timeSpentSeconds: 900 });

    expect(first.score).toBe(second.score);
    expect(first.percentage).toBe(second.percentage);
    expect(first.sectionWiseScores).toEqual(second.sectionWiseScores);
    expect(first.incorrectQuestionCount).toBe(second.incorrectQuestionCount);
  });
});
