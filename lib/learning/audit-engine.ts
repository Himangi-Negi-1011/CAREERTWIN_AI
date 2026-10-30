import fs from "fs/promises";
import path from "path";
import { seededSkills, findCanonicalSkill, skillSlug } from "./catalog";
import { extractPlannedLessons } from "./course-engine";
import { validateLessonContentQuality } from "./lesson-service";
import {
  findCurriculumBySkill,
  listLessonsForCurriculum,
  listMockTestsForSkill,
  listAllCurricula,
  listAllLessons,
  listAllMockTests,
  checkDatabaseHealth,
  type DatabaseHealthStatus,
} from "./repository";
import { type Curriculum } from "./schema";
import { type LessonDocument } from "./lesson-schema";
import { type MockTestDocument } from "./mock-test-schema";

export interface SkillAuditDetail {
  skillName: string;
  slug: string;
  domain: string;
  hasCurriculum: boolean;
  expectedModuleCount: number;
  plannedLessonsCount: number;
  savedLessonsCount: number;
  validatedLessonsCount: number;
  missingLessonIds: string[];
  orphanedLessonIds: string[];
  exercisesCount: number;
  knowledgeChecksCount: number;
  phaseAssessmentsCount: number;
  expectedPhaseAssessmentsCount: number;
  mockTestsCount: number;
  totalQuestionsCount: number;
  duplicateQuestionsCount: number;
  resourcesVerifiedCount: number;
  resourcesCuratedCount: number;
  resourcesUnverifiedCount: number;
  persistenceStatus: "synced_supabase" | "local_only" | "degraded";
  contentVersion: number;
  lastValidatedAt: string;
  isFullyReady: boolean;
  issues: string[];
}

export interface LearningLibraryAuditReport {
  timestamp: string;
  totalSkillsInCatalog: number;
  skillsAudited: number;
  skillsWithCurriculum: number;
  skillsWithAllPlannedLessons: number;
  skillsWithValidatedLessons: number;
  skillsWithAllAssessments: number;
  fullyReadySkillsCount: number;
  incompleteSkillsCount: number;
  overallReadinessPercentage: number;
  totalCurricula: number;
  totalLessons: number;
  totalPhaseAssessments: number;
  totalMockTests: number;
  totalQuestions: number;
  resourceBreakdown: {
    verified: number;
    curated: number;
    unverified: number;
  };
  databaseHealth: DatabaseHealthStatus;
  skillDetails: SkillAuditDetail[];
  summaryByDomain: Record<
    string,
    {
      totalSkills: number;
      readySkills: number;
      curriculaCount: number;
      lessonsCount: number;
      assessmentsCount: number;
    }
  >;
}

/**
 * Runs a complete, read-only audit of the entire learning library across all 204 canonical skills.
 */
export async function runLearningLibraryAudit(options?: {
  skillsList?: string[];
  onProgress?: (current: number, total: number, skillName: string) => void;
}): Promise<LearningLibraryAuditReport> {
  const timestamp = new Date().toISOString();
  const dbHealth = await checkDatabaseHealth();

  const allCurricula = await listAllCurricula();
  const allLessons = await listAllLessons();
  const allTests = await listAllMockTests();

  const uniqueCanonical = Array.from(new Set(seededSkills.map((s) => s.canonicalName)));
  const targetNames = options?.skillsList && options.skillsList.length > 0 ? options.skillsList : uniqueCanonical;

  const skillDetails: SkillAuditDetail[] = [];
  const domainSummary: Record<string, { totalSkills: number; readySkills: number; curriculaCount: number; lessonsCount: number; assessmentsCount: number }> = {};

  let totalQuestions = 0;
  let totalVerifiedResources = 0;
  let totalCuratedResources = 0;
  let totalUnverifiedResources = 0;

  for (let i = 0; i < targetNames.length; i++) {
    const skillName = targetNames[i];
    options?.onProgress?.(i + 1, targetNames.length, skillName);

    const canonical = findCanonicalSkill(skillName);
    const slug = canonical?.slug || skillSlug(skillName);
    const domain = canonical?.domain || "General";

    if (!domainSummary[domain]) {
      domainSummary[domain] = { totalSkills: 0, readySkills: 0, curriculaCount: 0, lessonsCount: 0, assessmentsCount: 0 };
    }
    domainSummary[domain].totalSkills++;

    const issues: string[] = [];

    // 1. Check Curriculum
    const currRecord = await findCurriculumBySkill(skillName, "beginner", "English");
    const hasCurriculum = !!currRecord;
    let expectedModuleCount = 0;
    let plannedLessonsCount = 0;
    const missingLessonIds: string[] = [];
    const orphanedLessonIds: string[] = [];
    let savedLessons: LessonDocument[] = [];

    if (hasCurriculum) {
      domainSummary[domain].curriculaCount++;
      const curriculum = currRecord.curriculum;
      expectedModuleCount = curriculum.modules.length;
      const planned = extractPlannedLessons(curriculum);
      plannedLessonsCount = planned.length;

      savedLessons = await listLessonsForCurriculum(currRecord.id);
      const savedLessonIds = new Set(savedLessons.map((l) => l.lessonId));

      for (const p of planned) {
        if (!savedLessonIds.has(p.lessonId)) {
          missingLessonIds.push(p.lessonId);
          issues.push(`Missing planned lesson: '${p.lessonTitle}' (${p.lessonId})`);
        }
      }

      const plannedLessonIds = new Set(planned.map((p) => p.lessonId));
      for (const s of savedLessons) {
        if (!plannedLessonIds.has(s.lessonId)) {
          orphanedLessonIds.push(s.lessonId);
        }
      }
    } else {
      issues.push(`Curriculum not found for '${skillName}'.`);
    }

    // 2. Validate Lessons
    let validatedLessonsCount = 0;
    let exercisesCount = 0;
    let knowledgeChecksCount = 0;
    let skillVerifiedRes = 0;
    let skillCuratedRes = 0;
    let skillUnverifiedRes = 0;

    for (const lesson of savedLessons) {
      const quality = validateLessonContentQuality(lesson);
      if (quality.valid) {
        validatedLessonsCount++;
      } else {
        issues.push(`Lesson '${lesson.title}' quality warning: ${quality.issues.join("; ")}`);
      }

      exercisesCount += lesson.exercises?.length ?? 0;
      knowledgeChecksCount += lesson.knowledgeChecks?.length ?? 0;

      if (lesson.videoResources) {
        for (const res of lesson.videoResources) {
          if (res.verificationStatus === "verified") {
            skillVerifiedRes++;
            totalVerifiedResources++;
          } else if (res.verificationStatus === "curated") {
            skillCuratedRes++;
            totalCuratedResources++;
          } else {
            skillUnverifiedRes++;
            totalUnverifiedResources++;
          }
        }
      }
    }

    domainSummary[domain].lessonsCount += savedLessons.length;

    // 3. Check Assessments
    const testsForSkill = await listMockTestsForSkill(slug, "beginner");
    const phaseTests = testsForSkill.filter((t) => t.isPhaseAssessment);
    const mockTests = testsForSkill.filter((t) => !t.isPhaseAssessment);

    const phaseAssessmentsCount = phaseTests.length;
    const mockTestsCount = mockTests.length;
    const expectedPhaseAssessmentsCount = expectedModuleCount > 0 ? expectedModuleCount : 2;

    if (phaseAssessmentsCount < expectedPhaseAssessmentsCount) {
      issues.push(`Missing phase assessments: found ${phaseAssessmentsCount}, expected ${expectedPhaseAssessmentsCount}.`);
    }

    if (mockTestsCount < 3) {
      issues.push(`Insufficient mock tests: found ${mockTestsCount}, expected 3.`);
    }

    let skillQuestionsCount = 0;
    let duplicateQuestionsCount = 0;
    const promptSet = new Set<string>();

    for (const test of testsForSkill) {
      skillQuestionsCount += test.questions.length;
      totalQuestions += test.questions.length;

      for (const q of test.questions) {
        if (promptSet.has(q.prompt)) {
          duplicateQuestionsCount++;
        }
        promptSet.add(q.prompt);
      }
    }

    if (duplicateQuestionsCount > 0) {
      issues.push(`Found ${duplicateQuestionsCount} duplicate questions across assessments.`);
    }

    domainSummary[domain].assessmentsCount += testsForSkill.length;

    // 4. Persistence Status
    let persistenceStatus: "synced_supabase" | "local_only" | "degraded" = "local_only";
    if (!dbHealth.degradedMode && dbHealth.connected) {
      persistenceStatus = "synced_supabase";
    } else if (dbHealth.degradedMode) {
      persistenceStatus = "degraded";
    }

    // 5. Readiness Determination
    const isFullyReady =
      hasCurriculum &&
      missingLessonIds.length === 0 &&
      savedLessons.length >= plannedLessonsCount &&
      plannedLessonsCount > 0 &&
      validatedLessonsCount >= plannedLessonsCount &&
      phaseAssessmentsCount >= expectedPhaseAssessmentsCount &&
      mockTestsCount >= 3 &&
      duplicateQuestionsCount === 0 &&
      issues.length === 0;

    if (isFullyReady) {
      domainSummary[domain].readySkills++;
    }

    skillDetails.push({
      skillName,
      slug,
      domain,
      hasCurriculum,
      expectedModuleCount,
      plannedLessonsCount,
      savedLessonsCount: savedLessons.length,
      validatedLessonsCount,
      missingLessonIds,
      orphanedLessonIds,
      exercisesCount,
      knowledgeChecksCount,
      phaseAssessmentsCount,
      expectedPhaseAssessmentsCount,
      mockTestsCount,
      totalQuestionsCount: skillQuestionsCount,
      duplicateQuestionsCount,
      resourcesVerifiedCount: skillVerifiedRes,
      resourcesCuratedCount: skillCuratedRes,
      resourcesUnverifiedCount: skillUnverifiedRes,
      persistenceStatus,
      contentVersion: 1,
      lastValidatedAt: timestamp,
      isFullyReady,
      issues,
    });
  }

  const skillsWithCurriculum = skillDetails.filter((s) => s.hasCurriculum).length;
  const skillsWithAllPlannedLessons = skillDetails.filter(
    (s) => s.plannedLessonsCount > 0 && s.savedLessonsCount >= s.plannedLessonsCount
  ).length;
  const skillsWithValidatedLessons = skillDetails.filter(
    (s) => s.plannedLessonsCount > 0 && s.validatedLessonsCount >= s.plannedLessonsCount
  ).length;
  const skillsWithAllAssessments = skillDetails.filter(
    (s) => s.phaseAssessmentsCount >= s.expectedPhaseAssessmentsCount && s.mockTestsCount >= 3
  ).length;
  const fullyReadySkillsCount = skillDetails.filter((s) => s.isFullyReady).length;
  const incompleteSkillsCount = skillDetails.length - fullyReadySkillsCount;
  const overallReadinessPercentage =
    targetNames.length > 0 ? Math.round((fullyReadySkillsCount / targetNames.length) * 100) : 0;

  return {
    timestamp,
    totalSkillsInCatalog: seededSkills.length,
    skillsAudited: targetNames.length,
    skillsWithCurriculum,
    skillsWithAllPlannedLessons,
    skillsWithValidatedLessons,
    skillsWithAllAssessments,
    fullyReadySkillsCount,
    incompleteSkillsCount,
    overallReadinessPercentage,
    totalCurricula: allCurricula.length,
    totalLessons: allLessons.length,
    totalPhaseAssessments: allTests.filter((t) => t.isPhaseAssessment).length,
    totalMockTests: allTests.filter((t) => !t.isPhaseAssessment).length,
    totalQuestions,
    resourceBreakdown: {
      verified: totalVerifiedResources,
      curated: totalCuratedResources,
      unverified: totalUnverifiedResources,
    },
    databaseHealth: dbHealth,
    skillDetails,
    summaryByDomain: domainSummary,
  };
}

/**
 * Saves audit report artifacts to `.audit-reports/` in JSON and CSV formats.
 */
export async function saveAuditReportFiles(report: LearningLibraryAuditReport): Promise<{ jsonPath: string; csvPath: string }> {
  const dirPath = path.join(process.cwd(), ".audit-reports");
  await fs.mkdir(dirPath, { recursive: true });

  const dateSlug = report.timestamp.replace(/[:.]/g, "-");
  const jsonFileName = `learning-audit-${dateSlug}.json`;
  const csvFileName = `learning-audit-${dateSlug}.csv`;

  const jsonPath = path.join(dirPath, jsonFileName);
  const csvPath = path.join(dirPath, csvFileName);
  const latestJsonPath = path.join(dirPath, "latest.json");
  const latestCsvPath = path.join(dirPath, "latest.csv");

  // 1. Write JSON
  const jsonContent = JSON.stringify(report, null, 2);
  await fs.writeFile(jsonPath, jsonContent, "utf-8");
  await fs.writeFile(latestJsonPath, jsonContent, "utf-8");

  // 2. Write CSV
  const csvHeaders = [
    "Domain",
    "Skill Name",
    "Slug",
    "Has Curriculum",
    "Planned Lessons",
    "Saved Lessons",
    "Validated Lessons",
    "Exercises",
    "Knowledge Checks",
    "Phase Assessments",
    "Mock Tests",
    "Total Questions",
    "Duplicate Questions",
    "Curated Resources",
    "Persistence Status",
    "Readiness Status",
    "Issues Count",
    "Issues Detail",
  ];

  const csvRows = report.skillDetails.map((s) => [
    `"${s.domain.replace(/"/g, '""')}"`,
    `"${s.skillName.replace(/"/g, '""')}"`,
    `"${s.slug}"`,
    s.hasCurriculum ? "YES" : "NO",
    s.plannedLessonsCount,
    s.savedLessonsCount,
    s.validatedLessonsCount,
    s.exercisesCount,
    s.knowledgeChecksCount,
    s.phaseAssessmentsCount,
    s.mockTestsCount,
    s.totalQuestionsCount,
    s.duplicateQuestionsCount,
    s.resourcesCuratedCount,
    `"${s.persistenceStatus}"`,
    s.isFullyReady ? "READY" : "INCOMPLETE",
    s.issues.length,
    `"${s.issues.join("; ").replace(/"/g, '""')}"`,
  ]);

  const csvContent = [csvHeaders.join(","), ...csvRows.map((r) => r.join(","))].join("\n");
  await fs.writeFile(csvPath, csvContent, "utf-8");
  await fs.writeFile(latestCsvPath, csvContent, "utf-8");

  return { jsonPath, csvPath };
}
