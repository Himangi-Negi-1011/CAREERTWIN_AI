// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import {
  buildDeterministicCurriculum,
  extractPlannedLessons,
  initializeCourseJob,
  executeCourseGeneration,
  resumeCourseJob,
} from "@/lib/learning/course-engine";
import {
  getCurriculumById,
  getLesson,
  listLessonsForCurriculum,
  getCourseJob,
  recordQuizAttempt,
  getUserProgress,
} from "@/lib/learning/repository";

describe("Universal Course Generation Engine", () => {
  it("builds a structurally sound deterministic curriculum outline", () => {
    const curriculum = buildDeterministicCurriculum("Kubernetes Security", "intermediate");
    expect(curriculum.skillName).toBe("Kubernetes Security");
    expect(curriculum.modules.length).toBeGreaterThanOrEqual(2);
    expect(curriculum.objectives.length).toBeGreaterThanOrEqual(4);

    const planned = extractPlannedLessons(curriculum);
    expect(planned.length).toBeGreaterThanOrEqual(4);
    expect(planned[0].lessonTitle).toContain("Kubernetes Security");
  });

  it("executes full course generation lifecycle and saves every lesson", async () => {
    const initial = await initializeCourseJob({
      userId: "test_user_engine",
      skillName: "Terraform Cloud Infrastructure",
      learnerLevel: "beginner",
    });

    expect(initial.status).toBe("requested");
    expect(initial.skillName).toBe("Terraform Cloud Infrastructure");

    // Execute full generation
    const completed = await executeCourseGeneration(initial.id);
    if (completed.status !== "completed") {
      console.error("completed.lastError:", completed.lastError, completed.currentStage);
    }
    expect(completed.status).toBe("completed");
    expect(completed.isReadyForLearning).toBe(true);
    expect(completed.totalLessonsPlanned).toBeGreaterThan(0);
    expect(completed.lessonsSaved).toBe(completed.totalLessonsPlanned);
    expect(completed.curriculumId).toBeTruthy();

    // Verify curriculum saved durably
    const savedCurr = await getCurriculumById(completed.curriculumId!);
    expect(savedCurr).not.toBeNull();
    expect(savedCurr?.skillName).toBe("Terraform Cloud Infrastructure");

    // Verify all lessons saved durably
    const lessons = await listLessonsForCurriculum(completed.curriculumId!);
    expect(lessons.length).toBe(completed.totalLessonsPlanned);

    const firstLesson = await getLesson(completed.curriculumId!, lessons[0].lessonId);
    expect(firstLesson).not.toBeNull();
    expect(firstLesson?.sections.length).toBeGreaterThan(0);
    expect(firstLesson?.knowledgeChecks.length).toBeGreaterThan(0);
  });

  it("resumes an existing job without duplicating saved lessons", async () => {
    const dynamicSkill = `GraphQL Microservices Architecture ${Date.now()}`;
    const job = await initializeCourseJob({
      userId: `test_resume_user_${Date.now()}`,
      skillName: dynamicSkill,
      learnerLevel: "intermediate",
    });

    // Run first batch (e.g. 1 lesson only)
    await executeCourseGeneration(job.id, { maxLessons: 1 });
    const interim = await getCourseJob(job.id);
    expect(interim?.lessonsSaved).toBe(1);

    // Resume remaining lessons
    const resumed = await resumeCourseJob(job.id, job.ownerId);
    expect(resumed.status).toBe("completed");
    expect(resumed.lessonsSaved).toBe(resumed.totalLessonsPlanned);

    // Verify all lessons exist
    const all = await listLessonsForCurriculum(resumed.curriculumId!);
    expect(all.length).toBe(resumed.totalLessonsPlanned);
  });

  it("updates user mastery durably upon quiz success", async () => {
    const userId = `test_quiz_mastery_user_${Date.now()}`;
    const curriculumId = `curr_test_quiz_mastery_${Date.now()}`;
    const skillName = "Rust Memory Safety";

    // Attempt 1: 50% score (fail)
    const progress1 = await recordQuizAttempt(userId, curriculumId, skillName, "lesson-1", 50, 4);
    expect(progress1.quizAttempts["lesson-1"].passed).toBe(false);
    expect(progress1.completedLessonIds).not.toContain("lesson-1");

    // Attempt 2: 100% score (pass)
    const progress2 = await recordQuizAttempt(userId, curriculumId, skillName, "lesson-1", 100, 4);
    expect(progress2.quizAttempts["lesson-1"].passed).toBe(true);
    expect(progress2.completedLessonIds).toContain("lesson-1");
    expect(progress2.masteryScore).toBe(25); // 1 of 4 lessons

    // Check persistent reload
    const reloaded = await getUserProgress(userId, curriculumId);
    expect(reloaded?.completedLessonIds).toContain("lesson-1");
    expect(reloaded?.masteryScore).toBe(25);
  });
});
