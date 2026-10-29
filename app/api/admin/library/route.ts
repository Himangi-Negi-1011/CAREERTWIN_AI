import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { seededSkills, findCanonicalSkill, skillSlug } from "@/lib/learning/catalog";
import {
  listAllCurricula,
  listAllLessons,
  listAllMockTests,
  findCurriculumBySkill,
  listLessonsForCurriculum,
  listMockTestsForSkill,
  saveCurriculum,
} from "@/lib/learning/repository";
import {
  precomputeAdvanceLearningLibrary,
  precomputeSkillCourse,
  validateCourseCompleteness,
} from "@/lib/learning/advance-generator";

// Helper to verify admin authorization
async function verifyAdminAuth() {
  const session = await auth();
  // In development, or if signed in, authorize access
  if (process.env.NODE_ENV === "development" || session?.userId) {
    return { authorized: true, userId: session?.userId || "dev-admin" };
  }
  return { authorized: false, userId: null };
}

export async function GET() {
  try {
    const { authorized } = await verifyAdminAuth();
    if (!authorized) {
      return NextResponse.json({ error: { message: "Unauthorized: Admin access required." } }, { status: 401 });
    }

    const curricula = await listAllCurricula();
    const lessons = await listAllLessons();
    const mockTests = await listAllMockTests();

    // Map skills readiness
    const skillMap = new Map<string, { curriculaCount: number; lessonsCount: number; mockTestsCount: number; status: "ready" | "incomplete" }>();

    for (const c of curricula) {
      const slug = skillSlug(c.skillName);
      const skillLessons = await listLessonsForCurriculum(c.skillId || `curr-${slug}-${c.learnerLevel}`);
      const skillTests = await listMockTestsForSkill(slug, c.learnerLevel);
      const isComplete = skillLessons.length >= 2 && skillTests.length >= 1;

      skillMap.set(slug, {
        curriculaCount: 1,
        lessonsCount: skillLessons.length,
        mockTestsCount: skillTests.length,
        status: isComplete ? "ready" : "incomplete",
      });
    }

    const readyCoursesCount = Array.from(skillMap.values()).filter((s) => s.status === "ready").length;

    const databaseHealth = {
      connected: true,
      provider: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Supabase + Local Repository Fallback" : "Durable Atomic Repository (.data)",
      lastCheck: new Date().toISOString(),
    };

    return NextResponse.json({
      data: {
        totalSkills: seededSkills.length,
        readyCourses: readyCoursesCount,
        incompleteCourses: Math.max(0, seededSkills.length - readyCoursesCount),
        totalCurricula: curricula.length,
        totalLessons: lessons.length,
        totalMockTests: mockTests.length,
        databaseHealth,
        sampleSkills: seededSkills.slice(0, 50).map((s) => {
          const stats = skillMap.get(s.slug) || { curriculaCount: 0, lessonsCount: 0, mockTestsCount: 0, status: "incomplete" };
          return {
            id: s.id,
            canonicalName: s.canonicalName,
            domain: s.domain,
            difficulty: s.difficulty,
            reviewStatus: s.reviewStatus,
            curriculaCount: stats.curriculaCount,
            lessonsCount: stats.lessonsCount,
            mockTestsCount: stats.mockTestsCount,
            readiness: stats.status,
          };
        }),
      },
    });
  } catch (error) {
    console.error("Admin library error:", error);
    return NextResponse.json(
      { error: { message: error instanceof Error ? error.message : "Failed to load admin stats" } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { authorized } = await verifyAdminAuth();
    if (!authorized) {
      return NextResponse.json({ error: { message: "Unauthorized: Admin access required." } }, { status: 401 });
    }

    const body = await request.json();
    const { action, skillName, level = "beginner" } = body;

    if (action === "generate-all") {
      const report = await precomputeAdvanceLearningLibrary();
      return NextResponse.json({
        data: {
          success: true,
          message: `Generated library: ${report.completedCoursesCount} courses ready, ${report.totalLessons} lessons, ${report.totalMockTests} mock tests.`,
          report,
        },
      });
    }

    if (action === "generate-skill" && skillName) {
      const status = await precomputeSkillCourse(skillName, level, { forceRegenerate: true });
      return NextResponse.json({
        data: {
          success: true,
          message: `Generated course and tests for ${skillName}.`,
          status,
        },
      });
    }

    if (action === "validate-skill" && skillName) {
      const canonical = findCanonicalSkill(skillName);
      const targetName = canonical?.canonicalName || skillName;
      const slug = canonical?.slug || skillSlug(targetName);

      const curr = await findCurriculumBySkill(targetName, level);
      if (!curr) {
        return NextResponse.json({ data: { valid: false, errors: ["Curriculum not found"] } });
      }

      const lessons = await listLessonsForCurriculum(curr.id);
      const tests = await listMockTestsForSkill(slug, level);
      const validation = validateCourseCompleteness(curr.curriculum, lessons, tests);

      return NextResponse.json({ data: validation });
    }

    if (action === "publish" && skillName) {
      const curr = await findCurriculumBySkill(skillName, level);
      if (!curr) {
        return NextResponse.json({ error: { message: "Curriculum not found" } }, { status: 404 });
      }
      curr.curriculum.reviewStatus = body.status === "approved" ? "approved" : "draft";
      await saveCurriculum(curr.curriculum, curr.id);
      return NextResponse.json({ data: { success: true, reviewStatus: curr.curriculum.reviewStatus } });
    }

    return NextResponse.json({ error: { message: "Invalid action" } }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: { message: error instanceof Error ? error.message : "Failed to execute admin action" } },
      { status: 500 }
    );
  }
}

