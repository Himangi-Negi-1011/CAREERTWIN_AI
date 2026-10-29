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

// ─── Curricula ────────────────────────────────────────────────────────────────

export async function saveCurriculum(curriculum: Curriculum, id?: string): Promise<{ id: string; curriculum: Curriculum }> {
  const validUuid = (curriculum.skillId && /^[0-9a-fA-F-]{36}$/.test(curriculum.skillId))
    ? curriculum.skillId
    : (id && /^[0-9a-fA-F-]{36}$/.test(id))
    ? id
    : crypto.randomUUID();
  const curriculumId = id || validUuid;
  const validated = curriculumSchema.parse({ ...curriculum, skillId: validUuid });

  const filePath = path.join(DATA_DIR, "curricula", `${curriculumId}.json`);
  await writeJsonFile(filePath, validated);

  // Also index by slug/level/language for quick lookup
  const slug = curriculum.skillName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const lookupKey = `${slug}_${curriculum.learnerLevel}_${(curriculum.preferredLanguage || "en").toLowerCase()}`;
  const lookupPath = path.join(DATA_DIR, "curricula_index", `${lookupKey}.json`);
  await writeJsonFile(lookupPath, { curriculumId });

  return { id: curriculumId, curriculum: validated };
}

export async function getCurriculumById(id: string): Promise<Curriculum | null> {
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
  const filePath = path.join(DATA_DIR, "lessons", curriculumId, `${validated.lessonId}.json`);
  await writeJsonFile(filePath, validated);
  return validated;
}

export async function getLesson(curriculumId: string, lessonId: string): Promise<LessonDocument | null> {
  const filePath = path.join(DATA_DIR, "lessons", curriculumId, `${lessonId}.json`);
  const data = await readJsonFile<LessonDocument>(filePath);
  if (!data) return null;
  return lessonDocumentSchema.parse(data);
}

export async function listLessonsForCurriculum(curriculumId: string): Promise<LessonDocument[]> {
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

  // User-to-job index
  const userJobPath = path.join(DATA_DIR, "user_jobs", job.ownerId, `${job.id}.json`);
  await writeJsonFile(userJobPath, { jobId: job.id, skillName: job.skillName, status: job.status, updatedAt: updated.updatedAt });

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
  const filePath = path.join(DATA_DIR, "progress", userId, `${curriculumId}.json`);
  return readJsonFile<UserLessonProgress>(filePath);
}

export async function saveUserProgress(progress: UserLessonProgress): Promise<UserLessonProgress> {
  const updated: UserLessonProgress = {
    ...progress,
    updatedAt: new Date().toISOString(),
  };
  const filePath = path.join(DATA_DIR, "progress", progress.userId, `${progress.curriculumId}.json`);
  await writeJsonFile(filePath, updated);
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

  return saveUserProgress(updated);
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

  // If passed, mark lesson completed
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

  return saveUserProgress(existing);
}

// ─── Mock Tests ───────────────────────────────────────────────────────────────

export async function saveMockTest(test: MockTestDocument): Promise<MockTestDocument> {
  const validated = mockTestDocumentSchema.parse(test);
  const filePath = path.join(DATA_DIR, "mock_tests", validated.skillSlug, `${validated.id}.json`);
  await writeJsonFile(filePath, validated);

  // Index by test id
  const idIndexPath = path.join(DATA_DIR, "mock_tests_index", `${validated.id}.json`);
  await writeJsonFile(idIndexPath, { skillSlug: validated.skillSlug, testId: validated.id });

  return validated;
}

export async function getMockTest(testId: string): Promise<MockTestDocument | null> {
  const idIndexPath = path.join(DATA_DIR, "mock_tests_index", `${testId}.json`);
  const index = await readJsonFile<{ skillSlug: string; testId: string }>(idIndexPath);
  if (!index) return null;

  const filePath = path.join(DATA_DIR, "mock_tests", index.skillSlug, `${testId}.json`);
  const data = await readJsonFile<MockTestDocument>(filePath);
  if (!data) return null;
  return mockTestDocumentSchema.parse(data);
}

export async function listMockTestsForSkill(skillSlug: string, level?: string): Promise<MockTestDocument[]> {
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
  const filePath = path.join(DATA_DIR, "mock_attempts", userId, `${attemptId}.json`);
  await writeJsonFile(filePath, report);
}

export async function getUserMockTestAttempts(userId: string, testId?: string): Promise<MockTestGradedReport[]> {
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

