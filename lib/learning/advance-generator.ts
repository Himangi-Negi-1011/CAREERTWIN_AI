import { seededSkills, findCanonicalSkill, skillSlug } from "./catalog";
import {
  buildDeterministicCurriculum,
  extractPlannedLessons,
} from "./course-engine";
import { buildDeterministicLesson, getCuratedVideoResources, validateLessonContentQuality } from "./lesson-service";
import { assertLessonIntegrity, type LessonDocument } from "./lesson-schema";
import { assertCurriculumIntegrity, type Curriculum } from "./schema";
import {
  saveCurriculum,
  findCurriculumBySkill,
  saveLesson,
  listLessonsForCurriculum,
  listMockTestsForSkill,
  listAllCurricula,
  listAllLessons,
  listAllMockTests,
  saveMockTest,
} from "./repository";
import {
  generateAndSaveMockTestsForSkill,
  buildDeterministicPhaseAssessment,
} from "./mock-test-engine";
import { type MockTestDocument } from "./mock-test-schema";
import {
  saveCoursePackage,
  loadCoursePackage,
  hasCoursePackage,
} from "./course-content-store";

export interface SkillLibraryStatus {
  skillName: string;
  slug: string;
  domain: string;
  level: "foundation" | "beginner" | "intermediate" | "advanced";
  curriculumReady: boolean;
  totalPlannedLessons: number;
  savedLessonsCount: number;
  phaseAssessmentsCount: number;
  mockTestsCount: number;
  isComplete: boolean;
  lastValidatedAt: string | null;
  validationErrors: string[];
}

export interface LibraryOverview {
  totalSkillsInCatalog: number;
  skillsAttempted: number;
  skillsWithCurriculum: number;
  skillsWithAllPlannedLessons: number;
  skillsWithValidatedLessons: number;
  skillsWithAllAssessments: number;
  fullyReadySkills: number;
  incompleteOrFailedSkills: number;
  completedCoursesCount: number;
  incompleteCoursesCount: number;
  totalCurricula: number;
  totalLessons: number;
  totalPhaseAssessments: number;
  totalMockTests: number;
  skills: SkillLibraryStatus[];
  lastRunAt: string;
}

/**
 * Validates whether a course has complete, subject-specific lessons, phase assessments,
 * and comprehensive mock tests without placeholders or quality violations.
 */
export function validateCourseCompleteness(
  curriculum: Curriculum,
  lessons: LessonDocument[],
  allTestsForSkill: MockTestDocument[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 1. Check curriculum
  try {
    assertCurriculumIntegrity(curriculum);
  } catch (err) {
    errors.push(`Curriculum integrity failure: ${err instanceof Error ? err.message : String(err)}`);
  }

  // 2. Check planned lessons vs saved lessons
  const planned = extractPlannedLessons(curriculum);
  const lessonMap = new Map(lessons.map((l) => [l.lessonId, l]));

  for (const p of planned) {
    const saved = lessonMap.get(p.lessonId);
    if (!saved) {
      errors.push(`Missing lesson: ${p.lessonTitle} (${p.lessonId})`);
    } else {
      try {
        assertLessonIntegrity(saved);
        const quality = validateLessonContentQuality(saved);
        if (!quality.valid) {
          errors.push(`Lesson '${saved.title}' quality issues: ${quality.issues.join("; ")}`);
        }
      } catch (err) {
        errors.push(`Lesson '${saved.title}' validation failed: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }

  // 3. Check Phase-End Assessments for each module
  for (const mod of curriculum.modules) {
    const hasPhaseTest = allTestsForSkill.some(
      (t) => t.isPhaseAssessment && (t.moduleId === mod.id || t.id.includes(mod.id))
    );
    if (!hasPhaseTest) {
      errors.push(`Missing phase assessment for module: '${mod.title}' (${mod.id})`);
    }
  }

  // 4. Check Skill-Level Mock Tests (non-phase assessments)
  const mockTests = allTestsForSkill.filter((t) => !t.isPhaseAssessment);
  if (mockTests.length < 3) {
    errors.push(`Only ${mockTests.length} mock tests found for ${curriculum.skillName} (minimum 3 required).`);
  } else {
    for (const test of mockTests) {
      if (test.questions.length < 4) {
        errors.push(`Mock test ${test.id} has only ${test.questions.length} questions (expected >= 4).`);
      }
      // Check for duplicate question prompts
      const promptSet = new Set<string>();
      for (const q of test.questions) {
        if (promptSet.has(q.prompt)) {
          errors.push(`Mock test ${test.id} contains duplicate question: '${q.prompt.slice(0, 40)}...'`);
          break;
        }
        promptSet.add(q.prompt);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Generates and saves complete, validated course content, phase assessments,
 * and skill mock tests for a single skill.
 */
export async function precomputeSkillCourse(
  skillName: string,
  level: "foundation" | "beginner" | "intermediate" | "advanced" = "beginner",
  options?: {
    forceRegenerate?: boolean;
    validateOnly?: boolean;
    onProgress?: (msg: string) => void;
  }
): Promise<SkillLibraryStatus> {
  const canonical = findCanonicalSkill(skillName);
  const canonicalName = canonical?.canonicalName || skillName;
  const slug = canonical?.slug || skillSlug(canonicalName);
  const domain = canonical?.domain || "General";

  options?.onProgress?.(`Processing skill: ${canonicalName} (${level})`);

  // 1. Curriculum
  let curriculum: Curriculum;
  const existing = await findCurriculumBySkill(canonicalName, level, "English");

  if (existing && !options?.forceRegenerate) {
    curriculum = existing.curriculum;
  } else if (!options?.validateOnly) {
    curriculum = buildDeterministicCurriculum(canonicalName, level, "English");
    curriculum.reviewStatus = "approved";
    const saved = await saveCurriculum(curriculum);
    curriculum = saved.curriculum;
    options?.onProgress?.(`Curriculum saved for ${canonicalName}`);
  } else {
    return {
      skillName: canonicalName,
      slug,
      domain,
      level,
      curriculumReady: false,
      totalPlannedLessons: 0,
      savedLessonsCount: 0,
      phaseAssessmentsCount: 0,
      mockTestsCount: 0,
      isComplete: false,
      lastValidatedAt: null,
      validationErrors: ["Curriculum missing in validate-only mode."],
    };
  }

  // 2. Lessons
  const planned = extractPlannedLessons(curriculum);
  const existingLessons = await listLessonsForCurriculum(curriculum.skillId || `curr-${slug}-${level}`);
  const existingLessonMap = new Map(existingLessons.map((l) => [l.lessonId, l]));

  const savedLessons: LessonDocument[] = [];

  for (const p of planned) {
    if (existingLessonMap.has(p.lessonId) && !options?.forceRegenerate) {
      const existingLesson = existingLessonMap.get(p.lessonId)!;
      // Re-verify subject quality and video resources
      const quality = validateLessonContentQuality(existingLesson);
      if (quality.valid && existingLesson.videoResources && existingLesson.videoResources.length > 0) {
        savedLessons.push(existingLesson);
        continue;
      }
      if (options?.validateOnly) {
        savedLessons.push(existingLesson);
        continue;
      }
    }

    if (options?.validateOnly) {
      continue;
    }

    const lessonDoc = buildDeterministicLesson({
      skillName: canonicalName,
      moduleId: p.moduleId,
      lessonId: p.lessonId,
      lessonTitle: p.lessonTitle,
      learnerLevel: level,
      objectiveIds: p.objectiveIds,
      objectiveStatements: p.objectiveStatements,
    });
    lessonDoc.reviewStatus = "draft";

    const validated = assertLessonIntegrity(lessonDoc);
    await saveLesson(curriculum.skillId || `curr-${slug}-${level}`, validated);
    savedLessons.push(validated);
    options?.onProgress?.(`Saved lesson: ${p.lessonTitle}`);
  }

  // 3. Phase-End Assessments (1 per module in curriculum)
  const existingTests = await listMockTestsForSkill(slug, level);

  if (!options?.validateOnly) {
    for (const mod of curriculum.modules) {
      const phaseTestId = `phase-${slug}-${mod.id}-assessment`;
      const hasPhaseTest = existingTests.some((t) => t.id === phaseTestId);
      if (!hasPhaseTest || options?.forceRegenerate) {
        const phaseTest = buildDeterministicPhaseAssessment(
          canonicalName,
          level,
          mod.id,
          mod.title,
          mod.lessonTitles
        );
        await saveMockTest(phaseTest);
        options?.onProgress?.(`Saved phase assessment for ${mod.title}`);
      }
    }

    // 4. Skill-Level Mock Tests (3 comprehensive tests per skill)
    const skillMockTests = existingTests.filter((t) => !t.isPhaseAssessment);
    const hasDuplicateQuestions = skillMockTests.some((t) => {
      const prompts = new Set<string>();
      for (const q of t.questions) {
        if (prompts.has(q.prompt)) return true;
        prompts.add(q.prompt);
      }
      return false;
    });

    if (skillMockTests.length < 3 || hasDuplicateQuestions || options?.forceRegenerate) {
      await generateAndSaveMockTestsForSkill(canonicalName, level, 3, { force: options?.forceRegenerate || hasDuplicateQuestions });
      options?.onProgress?.(`Saved 3 comprehensive mock tests for ${canonicalName}`);
    }
  }

  // Refresh tests list
  const allTests = await listMockTestsForSkill(slug, level);
  const phaseTestsCount = allTests.filter((t) => t.isPhaseAssessment).length;
  const mockTestsCount = allTests.filter((t) => !t.isPhaseAssessment).length;

  // 5. Validate Course Completeness
  const validation = validateCourseCompleteness(curriculum, savedLessons, allTests);

  // 6. Save version-controlled project course package into content/courses/<slug>/
  if (!options?.validateOnly) {
    const phaseTests = allTests.filter((t) => t.isPhaseAssessment);
    const mockTests = allTests.filter((t) => !t.isPhaseAssessment);
    await saveCoursePackage({
      slug,
      skillName: canonicalName,
      curriculum,
      lessons: savedLessons,
      phaseAssessments: phaseTests,
      mockTests,
      resources: savedLessons.flatMap((l) => l.videoResources || []),
    });
    options?.onProgress?.(`Saved project course package to content/courses/${slug}`);
  }

  return {
    skillName: canonicalName,
    slug,
    domain,
    level,
    curriculumReady: true,
    totalPlannedLessons: planned.length,
    savedLessonsCount: savedLessons.length,
    phaseAssessmentsCount: phaseTestsCount,
    mockTestsCount,
    isComplete: validation.valid,
    lastValidatedAt: new Date().toISOString(),
    validationErrors: validation.errors,
  };
}

/**
 * Precomputes courses for the entire canonical catalogue or a selected list in resumable batches.
 */
export async function precomputeAdvanceLearningLibrary(options?: {
  all?: boolean;
  skillsList?: string[];
  level?: "foundation" | "beginner" | "intermediate" | "advanced";
  resume?: boolean;
  retryFailed?: boolean;
  validateOnly?: boolean;
  forceRegenerate?: boolean;
  maxSkills?: number;
  onProgress?: (skill: string, current: number, total: number, message?: string) => void;
}): Promise<LibraryOverview> {
  const level = options?.level || "beginner";

  // De-duplicate canonical skills from the catalog
  const allCanonical = Array.from(new Set(seededSkills.map((s) => s.canonicalName)));

  let targetNames: string[];
  if (options?.skillsList && options.skillsList.length > 0) {
    targetNames = options.skillsList;
  } else {
    // Process every canonical skill by default
    targetNames = allCanonical;
  }

  if (options?.maxSkills && options.maxSkills > 0) {
    targetNames = targetNames.slice(0, options.maxSkills);
  }

  const statuses: SkillLibraryStatus[] = [];

  for (let i = 0; i < targetNames.length; i++) {
    const skillName = targetNames[i];
    options?.onProgress?.(skillName, i + 1, targetNames.length, "Validating / Precomputing...");

    try {
      // If --resume is active, check if skill is already 100% complete
      if (options?.resume && !options?.forceRegenerate && !options?.validateOnly) {
        const canonical = findCanonicalSkill(skillName);
        const slug = canonical?.slug || skillSlug(skillName);
        const curr = await findCurriculumBySkill(skillName, level, "English");
        if (curr) {
          const lessons = await listLessonsForCurriculum(curr.id);
          const tests = await listMockTestsForSkill(slug, level);
          const validation = validateCourseCompleteness(curr.curriculum, lessons, tests);
          if (validation.valid) {
            statuses.push({
              skillName,
              slug,
              domain: canonical?.domain || "General",
              level,
              curriculumReady: true,
              totalPlannedLessons: extractPlannedLessons(curr.curriculum).length,
              savedLessonsCount: lessons.length,
              phaseAssessmentsCount: tests.filter((t) => t.isPhaseAssessment).length,
              mockTestsCount: tests.filter((t) => !t.isPhaseAssessment).length,
              isComplete: true,
              lastValidatedAt: new Date().toISOString(),
              validationErrors: [],
            });
            options?.onProgress?.(skillName, i + 1, targetNames.length, "Resumed (already complete)");
            continue;
          }
        }
      }

      const status = await precomputeSkillCourse(skillName, level, {
        forceRegenerate: options?.forceRegenerate,
        validateOnly: options?.validateOnly,
        onProgress: (msg) => options?.onProgress?.(skillName, i + 1, targetNames.length, msg),
      });
      statuses.push(status);
    } catch (err) {
      console.error(`Failed to precompute ${skillName}:`, err);
      statuses.push({
        skillName,
        slug: skillSlug(skillName),
        domain: "General",
        level,
        curriculumReady: false,
        totalPlannedLessons: 0,
        savedLessonsCount: 0,
        phaseAssessmentsCount: 0,
        mockTestsCount: 0,
        isComplete: false,
        lastValidatedAt: null,
        validationErrors: [err instanceof Error ? err.message : String(err)],
      });
    }
  }

  const allCurricula = await listAllCurricula();
  const allLessons = await listAllLessons();
  const allMockTests = await listAllMockTests();

  const skillsWithCurriculumCount = statuses.filter((s) => s.curriculumReady).length;
  const skillsWithAllLessonsCount = statuses.filter(
    (s) => s.totalPlannedLessons > 0 && s.savedLessonsCount >= s.totalPlannedLessons
  ).length;
  const skillsWithAllAssessmentsCount = statuses.filter(
    (s) => s.phaseAssessmentsCount >= 2 && s.mockTestsCount >= 3
  ).length;

  return {
    totalSkillsInCatalog: seededSkills.length,
    skillsAttempted: targetNames.length,
    skillsWithCurriculum: skillsWithCurriculumCount,
    skillsWithAllPlannedLessons: skillsWithAllLessonsCount,
    skillsWithValidatedLessons: statuses.filter((s) => s.isComplete).length,
    skillsWithAllAssessments: skillsWithAllAssessmentsCount,
    fullyReadySkills: statuses.filter((s) => s.isComplete).length,
    incompleteOrFailedSkills: statuses.filter((s) => !s.isComplete).length,
    completedCoursesCount: statuses.filter((s) => s.isComplete).length,
    incompleteCoursesCount: statuses.filter((s) => !s.isComplete).length,
    totalCurricula: allCurricula.length,
    totalLessons: allLessons.length,
    totalPhaseAssessments: allMockTests.filter((t) => t.isPhaseAssessment).length,
    totalMockTests: allMockTests.filter((t) => !t.isPhaseAssessment).length,
    skills: statuses,
    lastRunAt: new Date().toISOString(),
  };
}
