import fs from "fs/promises";
import path from "path";
import { type Curriculum, curriculumSchema } from "./schema";
import { type LessonDocument, lessonDocumentSchema } from "./lesson-schema";
import { type MockTestDocument, mockTestDocumentSchema, type MockTestGradedReport } from "./mock-test-schema";

export type CourseJobStatus =
  | "requested"
  | "planning"
  | "curriculum_ready"
  | "generating_lessons"
  | "validating_content"
  | "saving_content"
  | "completed"
  | "completed_with_errors"
  | "paused_for_quota"
  | "retrying"
  | "failed"
  | "cancelled";

export interface FailedLessonDetail {
  lessonId: string;
  lessonTitle: string;
  error: string;
  attemptCount: number;
}

export interface CourseGenerationJob {
  id: string;
  ownerId: string;
  skillName: string;
  skillSlug: string;
  learnerLevel: "foundation" | "beginner" | "intermediate" | "advanced";
  preferredLanguage: string;
  targetRole?: string;
  curriculumId: string | null;
  status: CourseJobStatus;
  totalLessonsPlanned: number;
  lessonsGenerated: number;
  lessonsValidated: number;
  lessonsSaved: number;
  lessonsRemaining: number;
  failedLessons: FailedLessonDetail[];
  retryAttempts: number;
  currentStage: string;
  lastError: string | null;
  isReadyForLearning: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserLessonProgress {
  userId: string;
  curriculumId: string;
  skillName: string;
  enrolledAt: string;
  lastActiveLessonId: string | null;
  completedLessonIds: string[];
  quizAttempts: Record<
    string,
    {
      score: number;
      passed: boolean;
      attempts: number;
      lastAttemptAt: string;
    }
  >;
  masteryScore: number;
  masteryLevel: "novice" | "competent" | "proficient" | "master";
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), ".data", "learning");

async function ensureDir(dirPath: string) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch {
    // Ignore already exists
  }
}

async function writeJsonFile(filePath: string, data: unknown) {
  await ensureDir(path.dirname(filePath));
  const tempPath = `${filePath}.${Date.now()}.${Math.random().toString(36).substring(2, 8)}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(data, null, 2), "utf-8");
  await fs.rename(tempPath, filePath);
}

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function getDbClient() {
  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    return getSupabaseAdmin();
  } catch {
    return null;
  }
}

/**
 * Synchronizes verified skill evidence back into the student's Career Twin
 */
async function syncSkillEvidenceToTwin(
  userId: string,
  skillName: string,
  status: "learning" | "demonstrated",
  evidenceText: string
) {
  if (!userId || userId === "guest") return;
  try {
    const { getCareerProfile, getCareerTwin, saveCareerTwin } = await import("@/lib/twin/repository");
    const profile = await getCareerProfile(userId);
    const stored = await getCareerTwin(userId);
    const source = stored.source;
    const targetRole = profile?.interests.targetRole?.trim() || Object.keys(source.evidence)[0] || "Software Engineer";

    if (!source.evidence[targetRole]) {
      source.evidence[targetRole] = { records: {}, customSkills: [] };
    }

    const currentRecord = source.evidence[targetRole].records[skillName];
    // Keep 'demonstrated' if already proven; otherwise adopt new status
    const resolvedStatus = currentRecord?.status === "demonstrated" ? "demonstrated" : status;

    source.evidence[targetRole].records[skillName] = {
      status: resolvedStatus,
      evidence: evidenceText,
    };

    await saveCareerTwin(userId, source, stored.revision, `learning-sync-${Date.now()}`);
  } catch (err) {
    console.warn("Could not sync skill evidence to Career Twin:", err);
  }
}

// ─── Curricula ────────────────────────────────────────────────────────────────

export async function saveCurriculum(
  curriculum: Curriculum,
  id?: string
): Promise<{ id: string; curriculum: Curriculum; synced: boolean }> {
  const validUuid = curriculum.skillId && /^[0-9a-fA-F-]{36}$/.test(curriculum.skillId)
    ? curriculum.skillId
    : id && /^[0-9a-fA-F-]{36}$/.test(id)
    ? id
    : crypto.randomUUID();
  const curriculumId = id || validUuid;
  const validated = curriculumSchema.parse({ ...curriculum, skillId: validUuid });

  // 1. Local durable JSON cache
  const filePath = path.join(DATA_DIR, "curricula", `${curriculumId}.json`);
  await writeJsonFile(filePath, validated);

  const slug = curriculum.skillName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const lookupKey = `${slug}_${curriculum.learnerLevel}_${(curriculum.preferredLanguage || "en").toLowerCase()}`;
  const lookupPath = path.join(DATA_DIR, "curricula_index", `${lookupKey}.json`);
  await writeJsonFile(lookupPath, { curriculumId });

  // 2. Production Database Sync
  let synced = false;
  try {
    const db = await getDbClient();
    if (db) {
      const { error } = await db.from("curriculum_records").upsert(
        {
          id: curriculumId,
          skill_id: validUuid,
          skill_name: curriculum.skillName,
          learner_level: curriculum.learnerLevel,
          preferred_language: curriculum.preferredLanguage || "English",
          curriculum_document: validated,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
      if (!error) synced = true;
    }
  } catch {
    synced = false;
  }

  return { id: curriculumId, curriculum: validated, synced };
}

export async function getCurriculumById(id: string): Promise<Curriculum | null> {
  // 1. Try Supabase
  try {
    const db = await getDbClient();
    if (db) {
      const { data, error } = await db
        .from("curriculum_records")
        .select("curriculum_document")
        .eq("id", id)
        .maybeSingle();
      if (!error && data?.curriculum_document) {
        return curriculumSchema.parse(data.curriculum_document);
      }
    }
  } catch {
    // Fall back to local
  }

  // 2. Local fallback
  const filePath = path.join(DATA_DIR, "curricula", `${id}.json`);
  const data = await readJsonFile<Curriculum>(filePath);
  if (!data) return null;
  return curriculumSchema.parse(data);
}

export async function findCurriculumBySkill(
  skillName: string,
  level: "foundation" | "beginner" | "intermediate" | "advanced" = "beginner",
  language: string = "English"
): Promise<{ id: string; curriculum: Curriculum } | null> {
  // 1. Try Supabase
  try {
    const db = await getDbClient();
    if (db) {
      const { data, error } = await db
        .from("curriculum_records")
        .select("id, curriculum_document")
        .ilike("skill_name", skillName)
        .eq("learner_level", level)
        .maybeSingle();
      if (!error && data?.curriculum_document) {
        return {
          id: data.id,
          curriculum: curriculumSchema.parse(data.curriculum_document),
        };
      }
    }
  } catch {
    // Fall back to local
  }

  // 2. Local fallback
  const slug = skillName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const lookupKey = `${slug}_${level}_${language.toLowerCase()}`;
  const lookupPath = path.join(DATA_DIR, "curricula_index", `${lookupKey}.json`);
  const indexData = await readJsonFile<{ curriculumId: string }>(lookupPath);
  if (!indexData?.curriculumId) return null;

  const curriculum = await getCurriculumById(indexData.curriculumId);
  if (!curriculum) return null;
  return { id: indexData.curriculumId, curriculum };
}

// ─── Lessons ──────────────────────────────────────────────────────────────────

export async function saveLesson(curriculumId: string, lesson: LessonDocument): Promise<LessonDocument> {
  const validated = lessonDocumentSchema.parse(lesson);

  // 1. Local cache
  const filePath = path.join(DATA_DIR, "lessons", curriculumId, `${validated.lessonId}.json`);
  await writeJsonFile(filePath, validated);

  // 2. Supabase sync
  try {
    const db = await getDbClient();
    if (db) {
      await db.from("learning_lessons").upsert(
        {
          id: `${curriculumId}:${validated.lessonId}`,
          curriculum_id: curriculumId,
          lesson_id: validated.lessonId,
          title: validated.title,
          module_id: validated.moduleId,
          lesson_document: validated,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
    }
  } catch {
    // Local copy remains authoritative
  }

  return validated;
}

export async function getLesson(curriculumId: string, lessonId: string): Promise<LessonDocument | null> {
  // 1. Try Supabase
  try {
    const db = await getDbClient();
    if (db) {
      const { data, error } = await db
        .from("learning_lessons")
        .select("lesson_document")
        .eq("id", `${curriculumId}:${lessonId}`)
        .maybeSingle();
      if (!error && data?.lesson_document) {
        return lessonDocumentSchema.parse(data.lesson_document);
      }
    }
  } catch {
    // Fall back
  }

  // 2. Local fallback
  const filePath = path.join(DATA_DIR, "lessons", curriculumId, `${lessonId}.json`);
  const data = await readJsonFile<LessonDocument>(filePath);
  if (!data) return null;
  return lessonDocumentSchema.parse(data);
}

export async function listLessonsForCurriculum(curriculumId: string): Promise<LessonDocument[]> {
  // 1. Try Supabase
  try {
    const db = await getDbClient();
    if (db) {
      const { data, error } = await db
        .from("learning_lessons")
        .select("lesson_document")
        .eq("curriculum_id", curriculumId);
      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((row) => lessonDocumentSchema.parse(row.lesson_document));
      }
    }
  } catch {
    // Fall back
  }

  // 2. Local fallback
  const dirPath = path.join(DATA_DIR, "lessons", curriculumId);
  try {
    const files = await fs.readdir(dirPath);
    const lessons: LessonDocument[] = [];
    for (const file of files) {
      if (file.endsWith(".json")) {
        const item = await readJsonFile<LessonDocument>(path.join(dirPath, file));
        if (item) {
          try {
            lessons.push(lessonDocumentSchema.parse(item));
          } catch {
            // Ignore corrupted
          }
        }
      }
    }
    return lessons;
  } catch {
    return [];
  }
}

// ─── Course Jobs ──────────────────────────────────────────────────────────────

export async function saveCourseJob(job: CourseGenerationJob): Promise<CourseGenerationJob> {
  const updated: CourseGenerationJob = {
    ...job,
    updatedAt: new Date().toISOString(),
  };
  const filePath = path.join(DATA_DIR, "jobs", `${job.id}.json`);
  await writeJsonFile(filePath, updated);

  const userJobPath = path.join(DATA_DIR, "user_jobs", job.ownerId, `${job.id}.json`);
  await writeJsonFile(userJobPath, {
    jobId: job.id,
    skillName: job.skillName,
    status: job.status,
    updatedAt: updated.updatedAt,
  });

  return updated;
}

export async function getCourseJob(jobId: string): Promise<CourseGenerationJob | null> {
  const filePath = path.join(DATA_DIR, "jobs", `${jobId}.json`);
  return readJsonFile<CourseGenerationJob>(filePath);
}

export async function listCourseJobsForUser(userId: string): Promise<CourseGenerationJob[]> {
  const dirPath = path.join(DATA_DIR, "user_jobs", userId);
  try {
    const files = await fs.readdir(dirPath);
    const jobs: CourseGenerationJob[] = [];
    for (const file of files) {
      if (file.endsWith(".json")) {
        const indexData = await readJsonFile<{ jobId: string }>(path.join(dirPath, file));
        if (indexData?.jobId) {
          const job = await getCourseJob(indexData.jobId);
          if (job) jobs.push(job);
        }
      }
    }
    return jobs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch {
    return [];
  }
}

// ─── User Progress & Mastery ──────────────────────────────────────────────────

export async function getUserProgress(userId: string, curriculumId: string): Promise<UserLessonProgress | null> {
  // 1. Try Supabase
  try {
    const db = await getDbClient();
    if (db) {
      const { data, error } = await db
        .from("user_learning_progress")
        .select("progress_document")
        .eq("id", `${userId}:${curriculumId}`)
        .maybeSingle();
      if (!error && data?.progress_document) {
        return data.progress_document as UserLessonProgress;
      }
    }
  } catch {
    // Fall back
  }

  // 2. Local fallback
  const filePath = path.join(DATA_DIR, "progress", userId, `${curriculumId}.json`);
  return readJsonFile<UserLessonProgress>(filePath);
}

export async function saveUserProgress(progress: UserLessonProgress): Promise<UserLessonProgress> {
  const updated: UserLessonProgress = {
    ...progress,
    updatedAt: new Date().toISOString(),
  };

  // 1. Local fallback
  const filePath = path.join(DATA_DIR, "progress", progress.userId, `${progress.curriculumId}.json`);
  await writeJsonFile(filePath, updated);

  // 2. Supabase sync
  try {
    const db = await getDbClient();
    if (db) {
      await db.from("user_learning_progress").upsert(
        {
          id: `${progress.userId}:${progress.curriculumId}`,
          owner_clerk_user_id: progress.userId,
          curriculum_id: progress.curriculumId,
          skill_name: progress.skillName,
          progress_document: updated,
          mastery_score: progress.masteryScore,
          mastery_level: progress.masteryLevel,
          updated_at: updated.updatedAt,
        },
        { onConflict: "id" }
      );
    }
  } catch {
    // Local copy remains authoritative
  }

  return updated;
}

export async function recordLessonCompletion(
  userId: string,
  curriculumId: string,
  skillName: string,
  lessonId: string,
  totalLessons: number
): Promise<UserLessonProgress> {
  const existing = await getUserProgress(userId, curriculumId);
  const completed = new Set(existing?.completedLessonIds ?? []);
  completed.add(lessonId);

  const completedList = Array.from(completed);
  const fraction = totalLessons > 0 ? completedList.length / totalLessons : 0;
  const masteryScore = Math.min(100, Math.round(fraction * 100));

  let masteryLevel: "novice" | "competent" | "proficient" | "master" = "novice";
  if (masteryScore >= 90) masteryLevel = "master";
  else if (masteryScore >= 70) masteryLevel = "proficient";
  else if (masteryScore >= 40) masteryLevel = "competent";

  const updated: UserLessonProgress = {
    userId,
    curriculumId,
    skillName,
    enrolledAt: existing?.enrolledAt ?? new Date().toISOString(),
    lastActiveLessonId: lessonId,
    completedLessonIds: completedList,
    quizAttempts: existing?.quizAttempts ?? {},
    masteryScore,
    masteryLevel,
    updatedAt: new Date().toISOString(),
  };

  const saved = await saveUserProgress(updated);

  // Sync to Career Twin
  if (completedList.length === totalLessons && totalLessons > 0) {
    void syncSkillEvidenceToTwin(
      userId,
      skillName,
      "demonstrated",
      `Completed all ${totalLessons} lessons in ${skillName} curriculum with verified mastery score ${masteryScore}%.`
    );
  } else {
    void syncSkillEvidenceToTwin(
      userId,
      skillName,
      "learning",
      `Studied lesson "${lessonId}" in ${skillName}. Completed ${completedList.length}/${totalLessons} lessons.`
    );
  }

  return saved;
}

export async function recordQuizAttempt(
  userId: string,
  curriculumId: string,
  skillName: string,
  lessonId: string,
  score: number,
  totalLessons: number
): Promise<UserLessonProgress> {
  const existing = (await getUserProgress(userId, curriculumId)) ?? {
    userId,
    curriculumId,
    skillName,
    enrolledAt: new Date().toISOString(),
    lastActiveLessonId: lessonId,
    completedLessonIds: [],
    quizAttempts: {},
    masteryScore: 0,
    masteryLevel: "novice",
    updatedAt: new Date().toISOString(),
  };

  const currentAttempt = existing.quizAttempts[lessonId];
  const passed = score >= 70;
  const attemptsCount = (currentAttempt?.attempts ?? 0) + 1;

  existing.quizAttempts[lessonId] = {
    score: Math.max(currentAttempt?.score ?? 0, score),
    passed: passed || (currentAttempt?.passed ?? false),
    attempts: attemptsCount,
    lastAttemptAt: new Date().toISOString(),
  };

  if (passed) {
    const completed = new Set(existing.completedLessonIds);
    completed.add(lessonId);
    existing.completedLessonIds = Array.from(completed);
  }

  const fraction = totalLessons > 0 ? existing.completedLessonIds.length / totalLessons : 0;
  existing.masteryScore = Math.min(100, Math.round(fraction * 100));

  if (existing.masteryScore >= 90) existing.masteryLevel = "master";
  else if (existing.masteryScore >= 70) existing.masteryLevel = "proficient";
  else if (existing.masteryScore >= 40) existing.masteryLevel = "competent";
  else existing.masteryLevel = "novice";

  existing.lastActiveLessonId = lessonId;

  const saved = await saveUserProgress(existing);

  // Sync to Career Twin
  if (passed) {
    const status = existing.masteryLevel === "master" || existing.masteryLevel === "proficient" ? "demonstrated" : "learning";
    void syncSkillEvidenceToTwin(
      userId,
      skillName,
      status,
      `Passed quiz for ${lessonId} with score ${score}%. Skill mastery: ${existing.masteryLevel} (${existing.masteryScore}%).`
    );
  }

  return saved;
}

// ─── Mock Tests ───────────────────────────────────────────────────────────────

export async function saveMockTest(test: MockTestDocument): Promise<MockTestDocument> {
  const validated = mockTestDocumentSchema.parse(test);

  // 1. Local cache
  const filePath = path.join(DATA_DIR, "mock_tests", validated.skillSlug, `${validated.id}.json`);
  await writeJsonFile(filePath, validated);

  const idIndexPath = path.join(DATA_DIR, "mock_tests_index", `${validated.id}.json`);
  await writeJsonFile(idIndexPath, { skillSlug: validated.skillSlug, testId: validated.id });

  // 2. Supabase sync
  try {
    const db = await getDbClient();
    if (db) {
      await db.from("learning_mock_tests").upsert(
        {
          id: validated.id,
          skill_slug: validated.skillSlug,
          test_number: validated.testNumber,
          level: validated.level,
          title: validated.title,
          duration_minutes: validated.durationMinutes,
          test_document: validated,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
    }
  } catch {
    // Local copy remains authoritative
  }

  return validated;
}

export async function getMockTest(testId: string): Promise<MockTestDocument | null> {
  // 1. Try Supabase
  try {
    const db = await getDbClient();
    if (db) {
      const { data, error } = await db
        .from("learning_mock_tests")
        .select("test_document")
        .eq("id", testId)
        .maybeSingle();
      if (!error && data?.test_document) {
        return mockTestDocumentSchema.parse(data.test_document);
      }
    }
  } catch {
    // Fall back
  }

  // 2. Local fallback
  const idIndexPath = path.join(DATA_DIR, "mock_tests_index", `${testId}.json`);
  const index = await readJsonFile<{ skillSlug: string; testId: string }>(idIndexPath);
  if (!index) return null;

  const filePath = path.join(DATA_DIR, "mock_tests", index.skillSlug, `${testId}.json`);
  const data = await readJsonFile<MockTestDocument>(filePath);
  if (!data) return null;
  return mockTestDocumentSchema.parse(data);
}

export async function listMockTestsForSkill(skillSlug: string, level?: string): Promise<MockTestDocument[]> {
  // 1. Try Supabase
  try {
    const db = await getDbClient();
    if (db) {
      let query = db.from("learning_mock_tests").select("test_document").eq("skill_slug", skillSlug);
      if (level) query = query.eq("level", level);
      const { data, error } = await query;
      if (!error && Array.isArray(data) && data.length > 0) {
        return data
          .map((row) => mockTestDocumentSchema.parse(row.test_document))
          .sort((a, b) => a.testNumber - b.testNumber);
      }
    }
  } catch {
    // Fall back
  }

  // 2. Local fallback
  const dirPath = path.join(DATA_DIR, "mock_tests", skillSlug);
  try {
    const files = await fs.readdir(dirPath);
    const tests: MockTestDocument[] = [];
    for (const file of files) {
      if (file.endsWith(".json")) {
        const item = await readJsonFile<MockTestDocument>(path.join(dirPath, file));
        if (item) {
          try {
            const parsed = mockTestDocumentSchema.parse(item);
            if (!level || parsed.level === level) {
              tests.push(parsed);
            }
          } catch {
            // Ignore invalid
          }
        }
      }
    }
    return tests.sort((a, b) => a.testNumber - b.testNumber);
  } catch {
    return [];
  }
}

export async function listAllMockTests(): Promise<MockTestDocument[]> {
  const root = path.join(DATA_DIR, "mock_tests");
  try {
    const skillDirs = await fs.readdir(root);
    const allTests: MockTestDocument[] = [];
    for (const skillDir of skillDirs) {
      const tests = await listMockTestsForSkill(skillDir);
      allTests.push(...tests);
    }
    return allTests;
  } catch {
    return [];
  }
}

export async function saveMockTestAttempt(userId: string, report: MockTestGradedReport): Promise<void> {
  const attemptId = `att_${report.testId}_${Date.now()}`;

  // 1. Local fallback
  const filePath = path.join(DATA_DIR, "mock_attempts", userId, `${attemptId}.json`);
  await writeJsonFile(filePath, report);

  // 2. Supabase sync
  try {
    const db = await getDbClient();
    if (db) {
      const skillSlug = report.testId.split("-")[0] || "general";
      await db.from("learning_mock_test_attempts").upsert(
        {
          id: attemptId,
          owner_clerk_user_id: userId,
          test_id: report.testId,
          skill_slug: skillSlug,
          score: report.score,
          passed: report.passed,
          report_document: report,
          completed_at: report.completedAt,
        },
        { onConflict: "id" }
      );
    }
  } catch {
    // Local copy remains authoritative
  }

  // 3. Sync to Career Twin
  const skillPart = report.testId.split("-")[0] || "General";
  const skillNameCapitalized = skillPart.charAt(0).toUpperCase() + skillPart.slice(1);
  if (report.passed) {
    void syncSkillEvidenceToTwin(
      userId,
      skillNameCapitalized,
      "demonstrated",
      `Passed official CareerTwin Mock Test (${report.testId}) with score ${report.score}% (${report.percentage}%). Strengths: ${Object.keys(report.topicWiseScores).slice(0, 3).join(", ")}.`
    );
  } else {
    void syncSkillEvidenceToTwin(
      userId,
      skillNameCapitalized,
      "learning",
      `Attempted Mock Test (${report.testId}) with score ${report.score}%. Recommended revision: ${report.recommendedLessons.map((l) => l.title).join(", ")}.`
    );
  }
}

export async function getUserMockTestAttempts(userId: string, testId?: string): Promise<MockTestGradedReport[]> {
  // 1. Try Supabase
  try {
    const db = await getDbClient();
    if (db) {
      let query = db.from("learning_mock_test_attempts").select("report_document").eq("owner_clerk_user_id", userId);
      if (testId) query = query.eq("test_id", testId);
      const { data, error } = await query;
      if (!error && Array.isArray(data) && data.length > 0) {
        return data
          .map((row) => row.report_document as MockTestGradedReport)
          .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
      }
    }
  } catch {
    // Fall back
  }

  // 2. Local fallback
  const dirPath = path.join(DATA_DIR, "mock_attempts", userId);
  try {
    const files = await fs.readdir(dirPath);
    const attempts: MockTestGradedReport[] = [];
    for (const file of files) {
      if (file.endsWith(".json")) {
        const item = await readJsonFile<MockTestGradedReport>(path.join(dirPath, file));
        if (item && (!testId || item.testId === testId)) {
          attempts.push(item);
        }
      }
    }
    return attempts.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  } catch {
    return [];
  }
}

// ─── Global Library Inspection ────────────────────────────────────────────────

export async function listAllCurricula(): Promise<Curriculum[]> {
  const dirPath = path.join(DATA_DIR, "curricula");
  try {
    const files = await fs.readdir(dirPath);
    const curricula: Curriculum[] = [];
    for (const file of files) {
      if (file.endsWith(".json")) {
        const item = await readJsonFile<Curriculum>(path.join(dirPath, file));
        if (item) {
          try {
            curricula.push(curriculumSchema.parse(item));
          } catch {
            // ignore
          }
        }
      }
    }
    return curricula;
  } catch {
    return [];
  }
}

export async function listAllLessons(): Promise<LessonDocument[]> {
  const root = path.join(DATA_DIR, "lessons");
  try {
    const currDirs = await fs.readdir(root);
    const allLessons: LessonDocument[] = [];
    for (const currId of currDirs) {
      const lessons = await listLessonsForCurriculum(currId);
      allLessons.push(...lessons);
    }
    return allLessons;
  } catch {
    return [];
  }
}

export async function getLibraryStats() {
  const curricula = await listAllCurricula();
  const lessons = await listAllLessons();
  const mockTests = await listAllMockTests();

  const skillNamesWithCurriculum = new Set(curricula.map((c) => c.skillName.toLowerCase()));

  return {
    totalCurricula: curricula.length,
    totalLessons: lessons.length,
    totalMockTests: mockTests.length,
    preparedSkillsCount: skillNamesWithCurriculum.size,
    lastUpdate: new Date().toISOString(),
  };
}
