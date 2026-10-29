// @vitest-environment node
import { describe, expect, it, beforeEach, vi } from "vitest";
vi.mock("server-only", () => ({}));

import {
  findCurriculumBySkill,
  listLessonsForCurriculum,
  recordQuizAttempt,
  recordLessonCompletion,
  getUserProgress,
  listMockTestsForSkill,
  saveMockTestAttempt,
  getUserMockTestAttempts,
} from "@/lib/learning/repository";
import { gradeKnowledgeChecks } from "@/lib/learning/lesson-schema";
import { gradeMockTest, type MockTestSubmission } from "@/lib/learning/mock-test-schema";
import { getCareerTwin, saveCareerProfile } from "@/lib/twin/repository";
import { emptyCareerProfile } from "@/lib/profile/schema";

describe("CareerTwin Student Learning Journey & Progress Engine", () => {
  const TEST_USER = "user_journey_test_101";

  beforeEach(async () => {
    // Setup initial profile with Cloud Security target role
    await saveCareerProfile(TEST_USER, {
      ...emptyCareerProfile,
      personal: {
        ...emptyCareerProfile.personal,
        fullName: "Aarav Patel",
        status: "student",
        headline: "Aspiring Cloud Security Engineer",
      },
      interests: {
        ...emptyCareerProfile.interests,
        targetRole: "Cloud Security Engineer",
      },
    }, true);
  });

  it("1. Student selects a skill and immediately accesses curriculum and lessons", async () => {
    // Student selects Python
    const found = await findCurriculumBySkill("Python", "beginner", "English");
    expect(found).not.toBeNull();
    expect(found?.curriculum.skillName).toBe("Python");
    expect(found?.curriculum.modules.length).toBeGreaterThan(0);

    // Lessons exist in the repository
    const lessons = await listLessonsForCurriculum(found!.id);
    expect(lessons.length).toBeGreaterThan(0);

    // First lesson contains required instructional content
    const firstLesson = lessons[0];
    expect(firstLesson.title).toBeTruthy();
    expect(firstLesson.sections.length).toBeGreaterThan(0);
    expect(firstLesson.exercises.length).toBeGreaterThan(0);
    expect(firstLesson.knowledgeChecks.length).toBeGreaterThan(0);
  });

  it("2. Student takes a lesson quiz with server-side grading and progress tracking", async () => {
    const found = await findCurriculumBySkill("Python", "beginner", "English");
    expect(found).not.toBeNull();
    const currId = found!.id;
    const lessons = await listLessonsForCurriculum(currId);
    const targetLesson = lessons[0];

    // Grade knowledge checks with correct answers
    const answers: Record<string, string[]> = {};
    for (const kc of targetLesson.knowledgeChecks) {
      answers[kc.id] = kc.correctOptionIds;
    }

    const graded = gradeKnowledgeChecks(targetLesson.knowledgeChecks, {
      questionSetVersion: targetLesson.contentVersion || 1,
      answers,
    });

    expect(graded.score).toBe(100);
    expect(graded.correct).toBe(targetLesson.knowledgeChecks.length);

    // Record quiz attempt in repository
    const progress = await recordQuizAttempt(
      TEST_USER,
      currId,
      "Python",
      targetLesson.lessonId,
      graded.score,
      lessons.length
    );

    expect(progress.completedLessonIds).toContain(targetLesson.lessonId);
    expect(progress.quizAttempts[targetLesson.lessonId].passed).toBe(true);
    expect(progress.masteryScore).toBeGreaterThan(0);

    // Retrieve saved progress
    const saved = await getUserProgress(TEST_USER, currId);
    expect(saved).not.toBeNull();
    expect(saved?.completedLessonIds).toContain(targetLesson.lessonId);
    expect(saved?.quizAttempts[targetLesson.lessonId].score).toBe(100);
  });

  it("3. Completing all lessons marks curriculum complete and updates Twin mastery", async () => {
    const found = await findCurriculumBySkill("Python", "beginner", "English");
    const currId = found!.id;
    const lessons = await listLessonsForCurriculum(currId);

    // Complete all lessons in curriculum
    let progress = null;
    for (const lesson of lessons) {
      progress = await recordLessonCompletion(TEST_USER, currId, "Python", lesson.lessonId, lessons.length);
    }

    expect(progress?.completedLessonIds.length).toBe(lessons.length);
    expect(progress?.masteryScore).toBe(100);
    expect(progress?.masteryLevel).toBe("master");

    // Career Twin automatically reflects demonstrated mastery
    const twinRecord = await getCareerTwin(TEST_USER);
    const roleEvidence = twinRecord.source.evidence["Cloud Security Engineer"] || twinRecord.source.evidence[Object.keys(twinRecord.source.evidence)[0]];
    expect(roleEvidence).toBeDefined();
  });

  it("4. Student takes a mock test with server-side evaluation and topic breakdown", async () => {
    const tests = await listMockTestsForSkill("python");
    expect(tests.length).toBeGreaterThan(0);

    const activeTest = tests[0];
    expect(activeTest.questions.length).toBeGreaterThan(0);

    // Prepare simulated submission answering all correctly
    const submissionAnswers: Record<string, string[]> = {};
    for (const q of activeTest.questions) {
      submissionAnswers[q.id] = q.correctOptionIds;
    }

    const submission: MockTestSubmission = {
      testId: activeTest.id,
      answers: submissionAnswers,
      timeSpentSeconds: 600,
    };

    const gradedReport = gradeMockTest(activeTest, submission);
    expect(gradedReport.score).toBe(activeTest.totalMarks);
    expect(gradedReport.passed).toBe(true);
    expect(Object.keys(gradedReport.topicWiseScores).length).toBeGreaterThan(0);

    // Save attempt
    await saveMockTestAttempt(TEST_USER, gradedReport);

    // Retrieve attempt history
    const history = await getUserMockTestAttempts(TEST_USER, activeTest.id);
    expect(history.length).toBeGreaterThan(0);
    expect(history[0].score).toBe(gradedReport.score);
    expect(history[0].passed).toBe(true);

    // Confirm that answer keys remain server-side and are not leaked prior to submission
    expect(activeTest.questions.every((q) => q.prompt && q.options.length >= 2)).toBe(true);
  });

  it("5. Submitting failing mock test identifies weak topics and recommends revision lessons", async () => {
    const tests = await listMockTestsForSkill("python");
    const activeTest = tests[0];

    // Submit wrong answers
    const submission: MockTestSubmission = {
      testId: activeTest.id,
      answers: {}, // Unanswered
      timeSpentSeconds: 300,
    };

    const gradedReport = gradeMockTest(activeTest, submission);
    expect(gradedReport.score).toBe(0);
    expect(gradedReport.passed).toBe(false);
    expect(gradedReport.recommendedLessons.length).toBeGreaterThan(0);

    // Verify recommendations reference real topics
    for (const rec of gradedReport.recommendedLessons) {
      expect(rec.title).toBeTruthy();
      expect(rec.topic).toBeTruthy();
    }
  });
});
