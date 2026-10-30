import fs from "fs/promises";
import path from "path";
import { type Curriculum, curriculumSchema } from "./schema";
import { type LessonDocument, type ExternalResource, lessonDocumentSchema } from "./lesson-schema";
import { type MockTestDocument, mockTestDocumentSchema } from "./mock-test-schema";
import { findCanonicalSkill, skillSlug } from "./catalog";

const CONTENT_DIR = path.join(process.cwd(), "content", "courses");

const packageCache = new Map<string, CoursePackage>();

export function clearCoursePackageCache(): void {
  packageCache.clear();
}

export interface CoursePackage {
  slug: string;
  skillName: string;
  curriculum: Curriculum;
  lessons: LessonDocument[];
  phaseAssessments: MockTestDocument[];
  mockTests: MockTestDocument[];
  resources: ExternalResource[];
}

/**
 * Ensures a directory exists.
 */
async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

/**
 * Formats module index as zero-padded string (e.g. module-01, module-02).
 */
export function formatModuleDirName(index: number): string {
  const num = String(index + 1).padStart(2, "0");
  return `module-${num}`;
}

/**
 * Formats lesson filename as zero-padded string (e.g. lesson-01.json, lesson-02.json).
 */
export function formatLessonFileName(index: number): string {
  const num = String(index + 1).padStart(2, "0");
  return `lesson-${num}.json`;
}

/**
 * Writes an entire course package into content/courses/<slug>/
 */
export async function saveCoursePackage(pkg: CoursePackage): Promise<void> {
  const courseDir = path.join(CONTENT_DIR, pkg.slug);
  await ensureDir(courseDir);

  // 1. Write course.json
  const validatedCurriculum = curriculumSchema.parse(pkg.curriculum);
  await fs.writeFile(
    path.join(courseDir, "course.json"),
    JSON.stringify(validatedCurriculum, null, 2),
    "utf-8"
  );

  // 2. Write modules, lessons, and phase assessments
  for (let mIdx = 0; mIdx < pkg.curriculum.modules.length; mIdx++) {
    const mod = pkg.curriculum.modules[mIdx];
    const modDir = path.join(courseDir, formatModuleDirName(mIdx));
    await ensureDir(modDir);

    // Lessons in this module
    const modLessons = pkg.lessons.filter((l) => l.moduleId === mod.id);
    for (let lIdx = 0; lIdx < modLessons.length; lIdx++) {
      const lesson = modLessons[lIdx];
      const validatedLesson = lessonDocumentSchema.parse(lesson);
      await fs.writeFile(
        path.join(modDir, formatLessonFileName(lIdx)),
        JSON.stringify(validatedLesson, null, 2),
        "utf-8"
      );
    }

    // Phase assessment for this module
    const assessment = pkg.phaseAssessments.find(
      (a) => a.moduleId === mod.id || a.id.includes(mod.id)
    );
    if (assessment) {
      const validatedAssessment = mockTestDocumentSchema.parse(assessment);
      await fs.writeFile(
        path.join(modDir, "assessment.json"),
        JSON.stringify(validatedAssessment, null, 2),
        "utf-8"
      );
    }
  }

  // 3. Write mock-tests/
  const mockTestsDir = path.join(courseDir, "mock-tests");
  await ensureDir(mockTestsDir);
  for (let tIdx = 0; tIdx < pkg.mockTests.length; tIdx++) {
    const test = pkg.mockTests[tIdx];
    const validatedTest = mockTestDocumentSchema.parse(test);
    const testNum = String(tIdx + 1).padStart(2, "0");
    await fs.writeFile(
      path.join(mockTestsDir, `test-${testNum}.json`),
      JSON.stringify(validatedTest, null, 2),
      "utf-8"
    );
  }

  // 4. Write resources.json
  const allResources = pkg.resources && pkg.resources.length > 0
    ? pkg.resources
    : pkg.lessons.flatMap((l) => l.videoResources || []);

  await fs.writeFile(
    path.join(courseDir, "resources.json"),
    JSON.stringify(allResources, null, 2),
    "utf-8"
  );

  // Update in-memory cache
  packageCache.set(pkg.slug, pkg);
}

/**
 * Loads a course package from content/courses/<slug>/ if it exists.
 */
export async function loadCoursePackage(slug: string): Promise<CoursePackage | null> {
  if (packageCache.has(slug)) {
    return packageCache.get(slug)!;
  }

  const courseDir = path.join(CONTENT_DIR, slug);
  try {
    const courseJsonRaw = await fs.readFile(path.join(courseDir, "course.json"), "utf-8");
    const curriculum = curriculumSchema.parse(JSON.parse(courseJsonRaw));

    const lessons: LessonDocument[] = [];
    const phaseAssessments: MockTestDocument[] = [];

    // Read modules
    for (let mIdx = 0; mIdx < curriculum.modules.length; mIdx++) {
      const mod = curriculum.modules[mIdx];
      const modDir = path.join(courseDir, formatModuleDirName(mIdx));
      try {
        const files = await fs.readdir(modDir);
        for (const file of files.sort()) {
          if (file.startsWith("lesson-") && file.endsWith(".json")) {
            const raw = await fs.readFile(path.join(modDir, file), "utf-8");
            lessons.push(lessonDocumentSchema.parse(JSON.parse(raw)));
          } else if (file === "assessment.json") {
            const raw = await fs.readFile(path.join(modDir, file), "utf-8");
            phaseAssessments.push(mockTestDocumentSchema.parse(JSON.parse(raw)));
          }
        }
      } catch {
        // Module directory not created yet
      }
    }

    // Read mock-tests
    const mockTests: MockTestDocument[] = [];
    const mockTestsDir = path.join(courseDir, "mock-tests");
    try {
      const testFiles = await fs.readdir(mockTestsDir);
      for (const file of testFiles.sort()) {
        if (file.endsWith(".json")) {
          const raw = await fs.readFile(path.join(mockTestsDir, file), "utf-8");
          mockTests.push(mockTestDocumentSchema.parse(JSON.parse(raw)));
        }
      }
    } catch {
      // Mock tests directory not created yet
    }

    // Read resources.json
    let resources: CoursePackage["resources"] = [];
    try {
      const resRaw = await fs.readFile(path.join(courseDir, "resources.json"), "utf-8");
      resources = JSON.parse(resRaw);
    } catch {
      resources = lessons.flatMap((l) => l.videoResources || []);
    }

    const pkg: CoursePackage = {
      slug,
      skillName: curriculum.skillName,
      curriculum,
      lessons,
      phaseAssessments,
      mockTests,
      resources,
    };
    packageCache.set(slug, pkg);
    return pkg;
  } catch {
    return null;
  }
}

/**
 * Checks if a course package exists in content/courses/<slug>/
 */
export async function hasCoursePackage(slug: string): Promise<boolean> {
  try {
    await fs.access(path.join(CONTENT_DIR, slug, "course.json"));
    return true;
  } catch {
    return false;
  }
}

/**
 * Lists all course slugs present in content/courses/
 */
export async function listAllCourseSlugs(): Promise<string[]> {
  try {
    const entries = await fs.readdir(CONTENT_DIR, { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    return [];
  }
}
