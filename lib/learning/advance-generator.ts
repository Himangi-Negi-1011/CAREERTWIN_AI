import { seededSkills, findCanonicalSkill, skillSlug } from "./catalog";
import {
  buildDeterministicCurriculum,
  extractPlannedLessons,
} from "./course-engine";
import { buildDeterministicLesson } from "./lesson-service";
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
} from "./repository";
import { generateAndSaveMockTestsForSkill } from "./mock-test-engine";
import { type MockTestDocument } from "./mock-test-schema";

export interface SkillLibraryStatus {
  skillName: string;
  slug: string;
  domain: string;
  level: "foundation" | "beginner" | "intermediate" | "advanced";
  curriculumReady: boolean;
  totalPlannedLessons: number;
  savedLessonsCount: number;
  mockTestsCount: number;
  isComplete: boolean;
  lastValidatedAt: string | null;
  validationErrors: string[];
}

export interface LibraryOverview {
  totalSkillsInCatalog: number;
  completedCoursesCount: number;
  incompleteCoursesCount: number;
  totalCurricula: number;
  totalLessons: number;
  totalMockTests: number;
  skills: SkillLibraryStatus[];
  lastRunAt: string;
}

/**
 * Validates whether a course has complete lessons and assessments without placeholders
 */
export function validateCourseCompleteness(
  curriculum: Curriculum,
  lessons: LessonDocument[],
  mockTests: MockTestDocument[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check curriculum
  try {
    assertCurriculumIntegrity(curriculum);
  } catch (err) {
    errors.push(`Curriculum integrity failure: ${err instanceof Error ? err.message : String(err)}`);
  }

  // Check planned lessons vs saved lessons
  const planned = extractPlannedLessons(curriculum);
  const lessonMap = new Map(lessons.map((l) => [l.lessonId, l]));

  for (const p of planned) {
    const saved = lessonMap.get(p.lessonId);
    if (!saved) {
      errors.push(`Missing lesson: ${p.lessonTitle} (${p.lessonId})`);
    } else {
      try {
        assertLessonIntegrity(saved);
        if (saved.sections.length === 0 || saved.sections.every((s) => s.content.length < 50)) {
          errors.push(`Lesson ${saved.title} lacks sufficient educational content.`);
        }
        if (saved.knowledgeChecks.length === 0) {
          errors.push(`Lesson ${saved.title} has no knowledge checks.`);
        }
      } catch (err) {
        errors.push(`Lesson ${saved.title} validation failed: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }

  // Check mock tests
  if (mockTests.length === 0) {
    errors.push(`No mock tests generated for ${curriculum.skillName}.`);
  } else {
    for (const test of mockTests) {
      if (test.questions.length < 5) {
        errors.push(`Mock test ${test.id} has only ${test.questions.length} questions (expected >= 5).`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Generates and saves complete, validated course content and mock tests for a single skill.
 */
export async function precomputeSkillCourse(
  skillName: string,
  level: "foundation" | "beginner" | "intermediate" | "advanced" = "beginner",
  options?: { forceRegenerate?: boolean; onProgress?: (msg: string) => void }
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
  } else {
    curriculum = buildDeterministicCurriculum(canonicalName, level, "English");
    curriculum.reviewStatus = "approved";
    const saved = await saveCurriculum(curriculum);
    curriculum = saved.curriculum;
    options?.onProgress?.(`Curriculum saved for ${canonicalName}`);
  }

  // 2. Lessons
  const planned = extractPlannedLessons(curriculum);
  const existingLessons = await listLessonsForCurriculum(curriculum.skillId || `curr-${slug}-${level}`);
  const existingLessonMap = new Map(existingLessons.map((l) => [l.lessonId, l]));

  const savedLessons: LessonDocument[] = [];

  for (const p of planned) {
    if (existingLessonMap.has(p.lessonId) && !options?.forceRegenerate) {
      savedLessons.push(existingLessonMap.get(p.lessonId)!);
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

  // 3. Mock Tests (3 tests per skill)
  let mockTests = await listMockTestsForSkill(slug, level);
  if (mockTests.length < 3 || options?.forceRegenerate) {
    mockTests = await generateAndSaveMockTestsForSkill(canonicalName, level, 3);
    options?.onProgress?.(`Saved ${mockTests.length} mock tests for ${canonicalName}`);
  }

  // 4. Validate
  const validation = validateCourseCompleteness(curriculum, savedLessons, mockTests);

  return {
    skillName: canonicalName,
    slug,
    domain,
    level,
    curriculumReady: true,
    totalPlannedLessons: planned.length,
    savedLessonsCount: savedLessons.length,
    mockTestsCount: mockTests.length,
    isComplete: validation.valid,
    lastValidatedAt: new Date().toISOString(),
    validationErrors: validation.errors,
  };
}

/**
 * Precomputes courses for a list of priority skills or the entire catalogue.
 */
export async function precomputeAdvanceLearningLibrary(options?: {
  skillsList?: string[];
  level?: "foundation" | "beginner" | "intermediate" | "advanced";
  maxSkills?: number;
  onProgress?: (skill: string, current: number, total: number) => void;
}): Promise<LibraryOverview> {
  const level = options?.level || "beginner";

  // Target high-priority skills first if not specified
  const targetNames = options?.skillsList || [
    "Python", "JavaScript", "TypeScript", "Java", "C++", "SQL",
    "HTML", "CSS", "React", "Next.js", "APIs", "Backend Development",
    "Excel", "Power BI", "Data Analysis", "Statistics", "Machine Learning",
    "Networking", "Linux", "Ethical Hacking Fundamentals", "Vulnerability Assessment", "Defensive Security", "Cloud Security",
    "Cloud Computing", "AWS", "Azure", "Google Cloud", "Docker", "CI/CD", "Git", "Deployment",
    "AI Fundamentals", "Generative AI", "Prompt Engineering", "Applied AI Development",
    "Communication", "Problem Solving", "Teamwork", "Interview Preparation"
  ];

  const skillsToProcess = options?.maxSkills ? targetNames.slice(0, options.maxSkills) : targetNames;
  const statuses: SkillLibraryStatus[] = [];

  for (let i = 0; i < skillsToProcess.length; i++) {
    const skillName = skillsToProcess[i];
    options?.onProgress?.(skillName, i + 1, skillsToProcess.length);
    try {
      const status = await precomputeSkillCourse(skillName, level);
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

  return {
    totalSkillsInCatalog: seededSkills.length,
    completedCoursesCount: statuses.filter((s) => s.isComplete).length,
    incompleteCoursesCount: statuses.filter((s) => !s.isComplete).length,
    totalCurricula: allCurricula.length,
    totalLessons: allLessons.length,
    totalMockTests: allMockTests.length,
    skills: statuses,
    lastRunAt: new Date().toISOString(),
  };
}

