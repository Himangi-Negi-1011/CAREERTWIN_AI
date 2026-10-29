import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { findCanonicalSkill, skillSlug } from "@/lib/learning/catalog";
import { listMockTestsForSkill } from "@/lib/learning/repository";
import { generateAndSaveMockTestsForSkill } from "@/lib/learning/mock-test-engine";
import { sanitizeMockTestForStudent } from "@/lib/learning/mock-test-schema";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const skillParam = searchParams.get("skill");
    const levelParam = (searchParams.get("level") || "beginner") as "foundation" | "beginner" | "intermediate" | "advanced";

    if (!skillParam) {
      return NextResponse.json({ error: { message: "Skill parameter is required." } }, { status: 400 });
    }

    const canonical = findCanonicalSkill(skillParam);
    const skillName = canonical?.canonicalName || skillParam;
    const slug = canonical?.slug || skillSlug(skillName);

    // Fetch existing or auto-generate if missing
    let tests = await listMockTestsForSkill(slug, levelParam);
    if (tests.length === 0) {
      tests = await generateAndSaveMockTestsForSkill(skillName, levelParam, 3);
    }

    // Return sanitized tests without answer keys
    const sanitized = tests.map(sanitizeMockTestForStudent);

    return NextResponse.json({
      data: {
        skillName,
        level: levelParam,
        tests: sanitized,
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
    const userId = session?.userId || "guest";

    const body = await request.json();
    const { skillName, level = "beginner", count = 3 } = body;

    if (!skillName) {
      return NextResponse.json({ error: { message: "skillName is required" } }, { status: 400 });
    }

    const tests = await generateAndSaveMockTestsForSkill(skillName, level, count);

    return NextResponse.json({
      data: {
        success: true,
        count: tests.length,
        tests: tests.map((t) => ({ id: t.id, title: t.title, totalMarks: t.totalMarks, questionCount: t.questions.length })),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: { message: error instanceof Error ? error.message : "Failed to generate mock tests" } },
      { status: 500 }
    );
  }
}

