import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { findCanonicalSkill, skillSlug } from "@/lib/learning/catalog";
import { listMockTestsForSkill, getUserMockTestAttempts } from "@/lib/learning/repository";
import { generateAndSaveMockTestsForSkill } from "@/lib/learning/mock-test-engine";
import { sanitizeMockTestForStudent } from "@/lib/learning/mock-test-schema";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Sign in to access mock tests." } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode");
    const skillParam = searchParams.get("skill");
    const levelParam = (searchParams.get("level") || "beginner") as
      | "foundation"
      | "beginner"
      | "intermediate"
      | "advanced";

    const userAttempts = await getUserMockTestAttempts(session.userId);
    if (mode === "history") {
      return NextResponse.json({ data: { attempts: userAttempts } });
    }

    if (!skillParam) {
      return NextResponse.json({ error: { message: "Skill parameter is required." } }, { status: 400 });
    }

    const canonical = findCanonicalSkill(skillParam);
    const skillName = canonical?.canonicalName || skillParam;
    const slug = canonical?.slug || skillSlug(skillName);

    // Fetch existing full mock tests; enforce strict 100-mark 28-question standard
    const rawTests = await listMockTestsForSkill(slug, levelParam);
    let fullTests = rawTests.filter(
      (t) => !t.isPhaseAssessment && t.totalMarks === 100 && t.questions.length === 28
    );

    if (fullTests.length === 0) {
      fullTests = await generateAndSaveMockTestsForSkill(skillName, levelParam, 3, { force: true });
    }

    // Strip all answer keys and explanations before sending to student browser
    const sanitized = fullTests.map(sanitizeMockTestForStudent);

    return NextResponse.json({
      data: {
        skillName,
        level: levelParam,
        tests: sanitized,
        attempts: userAttempts,
      },
    });
  } catch (error) {
    console.error("Failed to fetch mock tests:", error);
    return NextResponse.json(
      { error: { message: error instanceof Error ? error.message : "Failed to load mock tests" } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Sign in to generate mock tests." } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { skillName, level = "beginner", count = 3 } = body;

    if (!skillName) {
      return NextResponse.json({ error: { message: "skillName is required" } }, { status: 400 });
    }

    const tests = await generateAndSaveMockTestsForSkill(skillName, level, count, { force: true });

    return NextResponse.json({
      data: {
        success: true,
        count: tests.length,
        tests: tests.map((t) => ({
          id: t.id,
          title: t.title,
          totalMarks: t.totalMarks,
          questionCount: t.questions.length,
        })),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: { message: error instanceof Error ? error.message : "Failed to generate mock tests" } },
      { status: 500 }
    );
  }
}
