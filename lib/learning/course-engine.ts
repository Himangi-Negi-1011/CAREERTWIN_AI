import {
  generateLearningCurriculum,
  generateLesson,
  getAIProviderStatus,
  AIProviderError,
} from "@/lib/ai/provider";
import { findCanonicalSkill, normalizeSkillName, validateNewSkillName } from "./catalog";
import { assertCurriculumIntegrity, type Curriculum } from "./schema";
import { assertLessonIntegrity, type LessonDocument } from "./lesson-schema";
import { buildDeterministicLesson } from "./lesson-service";
import {
  saveCurriculum,
  getCurriculumById,
  findCurriculumBySkill,
  saveLesson,
  listLessonsForCurriculum,
  saveCourseJob,
  getCourseJob,
  type CourseGenerationJob,
  type FailedLessonDetail,
} from "./repository";

export interface CourseGenerationRequest {
  userId: string;
  skillName: string;
  learnerLevel?: "foundation" | "beginner" | "intermediate" | "advanced";
  preferredLanguage?: string;
  targetRole?: string;
  knownSkills?: string[];
  weeklyMinutes?: number;
  maxLessonsToGenerate?: number; // Optional limit for chunking/testing
}

export interface PlannedLesson {
  moduleId: string;
  moduleTitle: string;
  lessonId: string;
  lessonTitle: string;
  objectiveIds: string[];
  objectiveStatements: string[];
}

export function extractPlannedLessons(curriculum: Curriculum): PlannedLesson[] {
  const objectiveMap = new Map<string, string>();
  for (const obj of curriculum.objectives) {
    objectiveMap.set(obj.id, obj.statement);
  }

  const planned: PlannedLesson[] = [];
  for (const mod of curriculum.modules) {
    mod.lessonTitles.forEach((title, index) => {
      const lessonSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
      const lessonId = `${mod.id}-l${index + 1}-${lessonSlug}`;
      const objectiveIds = mod.objectiveIds.length > 0 ? mod.objectiveIds : [curriculum.objectives[0]?.id ?? "obj-1"];
      const objectiveStatements = objectiveIds.map((id) => objectiveMap.get(id) ?? `Master ${title}`);

      planned.push({
        moduleId: mod.id,
        moduleTitle: mod.title,
        lessonId,
        lessonTitle: title,
        objectiveIds,
        objectiveStatements,
      });
    });
  }
  return planned;
}

/**
 * Builds a deterministic, validated fallback curriculum when AI is unavailable.
 */
export function buildDeterministicCurriculum(
  skillName: string,
  level: "foundation" | "beginner" | "intermediate" | "advanced" = "beginner",
  language: string = "English"
): Curriculum {
  const slug = skillName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const obj1Id = `${slug}-obj-1`;
  const obj2Id = `${slug}-obj-2`;
  const obj3Id = `${slug}-obj-3`;
  const obj4Id = `${slug}-obj-4`;

  const curriculum: Curriculum = {
    skillId: null,
    skillName,
    learnerLevel: level,
    preferredLanguage: language,
    objectives: [
      { id: obj1Id, statement: `Understand foundational mental models and syntax of ${skillName}`, order: 1 },
      { id: obj2Id, statement: `Implement reliable patterns and error handling in ${skillName}`, order: 2 },
      { id: obj3Id, statement: `Apply ${skillName} in production-ready real-world scenarios`, order: 3 },
      { id: obj4Id, statement: `Evaluate security, performance, and best practices for ${skillName}`, order: 4 },
    ],
    prerequisites: ["Basic digital literacy and analytical reasoning"],
    modules: [
      {
        id: `mod-1-foundations`,
        title: `Module 1: Foundations & Core Concepts of ${skillName}`,
        summary: `Explore the fundamental concepts, terminology, and development workflow.`,
        order: 1,
        estimatedMinutes: 60,
        objectiveIds: [obj1Id, obj2Id],
        lessonTitles: [
          `Introduction to ${skillName}`,
          `Core Syntax and Primitives in ${skillName}`,
        ],
        checkpoint: `Build a functional baseline demonstration verifying syntax and flow.`,
      },
      {
        id: `mod-2-application`,
        title: `Module 2: Practical Implementation & Production Patterns`,
        summary: `Deep dive into resilient design, test automation, and real-world deployment.`,
        order: 2,
        estimatedMinutes: 90,
        objectiveIds: [obj3Id, obj4Id],
        lessonTitles: [
          `Production Patterns and Resilience in ${skillName}`,
          `Capstone Lab: Verifiable ${skillName} Implementation`,
        ],
        checkpoint: `Complete a verifiable project applying defense-in-depth principles.`,
      },
    ],
    practiceActivities: [
      `Hands-on coding labs for each core topic`,
      `Interactive boundary condition exercises`,
      `Production code review simulations`,
    ],
    assessmentCheckpoints: [
      `Module 1 Knowledge Check (70% pass threshold)`,
      `Module 2 Production Readiness Evaluation`,
    ],
    projects: [
      `Production-ready ${skillName} portfolio module with automated test suite and documentation`,
    ],
    proficiencyCriteria: [
      `Demonstrate 70%+ score on all concept knowledge checks`,
      `Submit verifiable implementation satisfying acceptance criteria`,
    ],
    resources: [
      {
        title: `Official ${skillName} Reference`,
        organization: "Industry Standard Documentation",
        url: "https://developer.mozilla.org/en-US/",
        retrievedAt: new Date().toISOString(),
        reviewStatus: "curated",
      },
    ],
    contentVersion: 1,
    generationMode: "curated",
    reviewStatus: "approved",
  };

  return assertCurriculumIntegrity(curriculum);
}

/**
 * Initializes or starts course generation for a requested skill.
 */
export async function initializeCourseJob(req: CourseGenerationRequest): Promise<CourseGenerationJob> {
  const candidate = validateNewSkillName(req.skillName);
  const seeded = findCanonicalSkill(req.skillName);
  const canonicalName = seeded?.canonicalName ?? candidate.canonicalName;
  const slug = candidate.slug || seeded?.slug || normalizeSkillName(canonicalName);
  const level = req.learnerLevel || "beginner";
  const language = req.preferredLanguage || "English";

  const jobId = `job_${slug}_${level}_${Date.now()}`;
  const initialJob: CourseGenerationJob = {
    id: jobId,
    ownerId: req.userId,
    skillName: canonicalName,
    skillSlug: slug,
    learnerLevel: level,
    preferredLanguage: language,
    targetRole: req.targetRole,
    curriculumId: null,
    status: "requested",
    totalLessonsPlanned: 0,
    lessonsGenerated: 0,
    lessonsValidated: 0,
    lessonsSaved: 0,
    lessonsRemaining: 0,
    failedLessons: [],
    retryAttempts: 0,
    currentStage: "Course requested",
    lastError: null,
    isReadyForLearning: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await saveCourseJob(initialJob);
  return initialJob;
}

/**
 * Runs the full end-to-end Course Generation Engine state machine.
 */
export async function executeCourseGeneration(
  jobId: string,
  options?: { signal?: AbortSignal; maxLessons?: number }
): Promise<CourseGenerationJob> {
  const job = await getCourseJob(jobId);
  if (!job) throw new Error(`Course job not found: ${jobId}`);

  // If already completed, return
  if (job.status === "completed") {
    return job;
  }

  try {
    // ─── Phase 1: Planning / Curriculum Generation ─────────────────────────────
    let curriculum: Curriculum | null = null;
    if (job.curriculumId) {
      curriculum = await getCurriculumById(job.curriculumId);
    }

    if (!curriculum) {
      job.status = "planning";
      job.currentStage = `Designing structured curriculum for ${job.skillName}`;
      await saveCourseJob(job);

      // Check if existing curriculum already in repository
      const existing = await findCurriculumBySkill(job.skillName, job.learnerLevel, job.preferredLanguage);
      if (existing) {
        curriculum = existing.curriculum;
        job.curriculumId = existing.id;
      } else {
        const aiStatus = getAIProviderStatus();
        if (aiStatus.configured) {
          try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 25000);
            try {
              const generated = await generateLearningCurriculum(
                {
                  skillId: null,
                  skillName: job.skillName,
                  learnerLevel: job.learnerLevel,
                  preferredLanguage: job.preferredLanguage,
                  targetRole: job.targetRole,
                  knownSkills: [],
                  weeklyMinutes: 300,
                  trustedResources: [],
                },
                options?.signal || controller.signal
              );
              curriculum = assertCurriculumIntegrity(generated);
            } finally {
              clearTimeout(timeout);
            }
          } catch (err) {
            console.warn(
              "AI curriculum generation timed out or failed; falling back to deterministic curriculum:",
              err instanceof Error ? err.message : err
            );
          }
        }

        // Fallback if AI not configured or failed
        if (!curriculum) {
          curriculum = buildDeterministicCurriculum(job.skillName, job.learnerLevel, job.preferredLanguage);
        }

        const saved = await saveCurriculum(curriculum);
        job.curriculumId = saved.id;
      }
    }

    // Extract planned lessons
    const plannedLessons = extractPlannedLessons(curriculum);
    job.totalLessonsPlanned = plannedLessons.length;
    job.status = "curriculum_ready";
    job.currentStage = `Curriculum validated. Total planned lessons: ${plannedLessons.length}`;
    await saveCourseJob(job);

    // ─── Phase 2: Generate Every Lesson in the Curriculum ──────────────────────
    job.status = "generating_lessons";
    await saveCourseJob(job);

    const curriculumId = job.curriculumId!;
    const existingLessons = await listLessonsForCurriculum(curriculumId);
    const existingMap = new Map<string, LessonDocument>();
    for (const l of existingLessons) {
      existingMap.set(l.lessonId, l);
    }

    let generatedCount = existingLessons.length;
    let validatedCount = existingLessons.length;
    let savedCount = existingLessons.length;

    const lessonsToProcess = options?.maxLessons
      ? plannedLessons.slice(0, options.maxLessons)
      : plannedLessons;

    const failedLessons: FailedLessonDetail[] = [...job.failedLessons];

    for (let i = 0; i < lessonsToProcess.length; i++) {
      if (options?.signal?.aborted) {
        job.status = "cancelled";
        job.currentStage = "Generation cancelled by user";
        return await saveCourseJob(job);
      }

      const planned = lessonsToProcess[i];

      // Check if already saved and valid
      if (existingMap.has(planned.lessonId)) {
        continue;
      }

      job.currentStage = `Generating lesson ${i + 1} of ${plannedLessons.length}: ${planned.lessonTitle}`;
      job.lessonsRemaining = plannedLessons.length - savedCount;
      job.lessonsGenerated = generatedCount;
      job.lessonsValidated = validatedCount;
      job.lessonsSaved = savedCount;
      await saveCourseJob(job);

      let lessonDoc: LessonDocument | null = null;
      let attempt = 0;
      const maxRetries = 2;

      while (attempt <= maxRetries && !lessonDoc) {
        attempt++;
        try {
          const aiStatus = getAIProviderStatus();
          if (aiStatus.configured) {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 25000);
            try {
              lessonDoc = await generateLesson(
                {
                  skillName: job.skillName,
                  moduleId: planned.moduleId,
                  lessonId: planned.lessonId,
                  lessonTitle: planned.lessonTitle,
                  learnerLevel: job.learnerLevel,
                  targetRole: job.targetRole,
                  objectives: planned.objectiveIds.map((id, idx) => ({
                    id,
                    statement: planned.objectiveStatements[idx] || `Master ${planned.lessonTitle}`,
                  })),
                },
                controller.signal
              );
            } finally {
              clearTimeout(timeout);
            }
          } else {
            lessonDoc = buildDeterministicLesson({
              skillName: job.skillName,
              moduleId: planned.moduleId,
              lessonId: planned.lessonId,
              lessonTitle: planned.lessonTitle,
              learnerLevel: job.learnerLevel,
              objectiveIds: planned.objectiveIds,
              objectiveStatements: planned.objectiveStatements,
            });
          }
        } catch (err) {
          if (err instanceof AIProviderError && err.status === 429) {
            // Quota reached: graceful pause preserving all saved progress
            job.status = "paused_for_quota";
            job.lastError = "AI provider rate limit / quota reached. Generation paused; saved lessons preserved.";
            job.currentStage = `Paused at lesson ${i + 1}: ${planned.lessonTitle}`;
            return await saveCourseJob(job);
          }

          if (attempt > maxRetries) {
            console.warn(`Falling back to deterministic lesson for ${planned.lessonTitle} after ${maxRetries} failed attempts.`);
            lessonDoc = buildDeterministicLesson({
              skillName: job.skillName,
              moduleId: planned.moduleId,
              lessonId: planned.lessonId,
              lessonTitle: planned.lessonTitle,
              learnerLevel: job.learnerLevel,
              objectiveIds: planned.objectiveIds,
              objectiveStatements: planned.objectiveStatements,
            });
            failedLessons.push({
              lessonId: planned.lessonId,
              lessonTitle: planned.lessonTitle,
              error: err instanceof Error ? err.message : "Generation failed",
              attemptCount: attempt,
            });
          }
        }
      }

      if (lessonDoc) {
        // Validate
        job.status = "validating_content";
        const validated = assertLessonIntegrity(lessonDoc);
        validatedCount++;
        job.lessonsValidated = validatedCount;

        // Save
        job.status = "saving_content";
        await saveLesson(curriculumId, validated);
        savedCount++;
        generatedCount++;
        existingMap.set(planned.lessonId, validated);

        job.lessonsSaved = savedCount;
        job.lessonsGenerated = generatedCount;
        job.lessonsRemaining = plannedLessons.length - savedCount;
        await saveCourseJob(job);
      }
    }

    // ─── Phase 3: Completion Evaluation ───────────────────────────────────────
    job.failedLessons = failedLessons;
    job.lessonsSaved = savedCount;
    job.lessonsGenerated = generatedCount;
    job.lessonsValidated = validatedCount;
    job.lessonsRemaining = Math.max(0, plannedLessons.length - savedCount);

    if (savedCount >= plannedLessons.length) {
      job.status = "completed";
      job.isReadyForLearning = true;
      job.currentStage = `Course ready: All ${savedCount} lessons generated and verified.`;
    } else if (savedCount > 0) {
      job.status = "completed_with_errors";
      job.isReadyForLearning = true;
      job.currentStage = `Partially ready: ${savedCount} of ${plannedLessons.length} lessons available.`;
    } else {
      job.status = "failed";
      job.isReadyForLearning = false;
      job.currentStage = "Course generation failed to produce valid lessons.";
    }

    return await saveCourseJob(job);
  } catch (error) {
    job.status = "failed";
    job.lastError = error instanceof Error ? error.message : "Unknown course generation error";
    job.currentStage = "Generation halted due to error";
    return await saveCourseJob(job);
  }
}

/**
 * Resumes generation for a paused or interrupted job.
 */
export async function resumeCourseJob(jobId: string, userId: string): Promise<CourseGenerationJob> {
  const job = await getCourseJob(jobId);
  if (!job) throw new Error(`Job not found: ${jobId}`);
  if (job.ownerId !== userId) throw new Error("Unauthorized to access this course generation job.");

  if (job.status === "completed") return job;

  job.status = "retrying";
  job.retryAttempts++;
  job.currentStage = "Resuming generation of remaining lessons...";
  await saveCourseJob(job);

  return executeCourseGeneration(jobId);
}
