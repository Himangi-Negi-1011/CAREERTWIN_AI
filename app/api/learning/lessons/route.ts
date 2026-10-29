import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { generateLesson, getAIProviderStatus } from "@/lib/ai/provider";
import { buildDeterministicLesson } from "@/lib/learning/lesson-service";
import { assertLessonIntegrity } from "@/lib/learning/lesson-schema";
import { getLesson, listLessonsForCurriculum, saveLesson } from "@/lib/learning/repository";

const postRequestSchema = z.object({
  curriculumId: z.string().trim().min(1).max(120).optional(),
  skillName: z.string().trim().min(1).max(120),
  moduleId: z.string().trim().min(1).max(100),
  lessonId: z.string().trim().min(1).max(100),
  lessonTitle: z.string().trim().min(1).max(200),
  learnerLevel: z.enum(["foundation", "beginner", "intermediate", "advanced"]).default("beginner"),
  targetRole: z.string().trim().max(120).optional(),
  objectives: z.array(z.object({ id: z.string().trim(), statement: z.string().trim() })).default([]),
});

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Sign in to access lessons." } }, { status: 401 });
  }

  const url = new URL(request.url);
  const curriculumId = url.searchParams.get("curriculumId");
  const lessonId = url.searchParams.get("lessonId");

  if (!curriculumId) {
    return NextResponse.json({ error: { code: "BAD_REQUEST", message: "curriculumId parameter is required." } }, { status: 400 });
  }

  if (lessonId) {
    const lesson = await getLesson(curriculumId, lessonId);
    if (!lesson) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: "Lesson not found in repository." } }, { status: 404 });
    }
    return NextResponse.json({ data: { lesson, source: "repository" } });
  }

  const lessons = await listLessonsForCurriculum(curriculumId);
  return NextResponse.json({ data: { lessons, count: lessons.length } });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Sign in to access lessons." } }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = postRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "INVALID_LESSON_REQUEST", message: "Invalid lesson request parameters.", details: parsed.error.flatten().fieldErrors } },
      { status: 400 }
    );
  }

  const { curriculumId, skillName, moduleId, lessonId, lessonTitle, learnerLevel, targetRole, objectives } = parsed.data;

  // 1. Check if already saved in repository
  const currId = curriculumId || `curr-${skillName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${learnerLevel}`;
  const existing = await getLesson(currId, lessonId);
  const aiStatus = getAIProviderStatus();
  if (existing) {
    const source = aiStatus.configured ? "ai" : "curated-fallback";
    return NextResponse.json({ data: { lesson: existing, source } });
  }

  // 2. Generate via AI if available
  if (aiStatus.configured) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000);
      try {
        const generated = await generateLesson(
          {
            skillName,
            moduleId,
            lessonId,
            lessonTitle,
            learnerLevel,
            targetRole,
            objectives: objectives.length > 0 ? objectives : [{ id: `${lessonId}-obj-1`, statement: `Master the concepts of ${lessonTitle}` }],
          },
          controller.signal
        );
        const validated = assertLessonIntegrity(generated);
        await saveLesson(currId, validated);
        return NextResponse.json({ data: { lesson: validated, source: "ai" } });
      } finally {
        clearTimeout(timeout);
      }
    } catch (err) {
      console.warn("AI lesson generation failed or timed out, using deterministic fallback:", err instanceof Error ? err.message : err);
    }
  }

  // 3. Deterministic fallback with integrity check
  const fallback = buildDeterministicLesson({
    skillName,
    moduleId,
    lessonId,
    lessonTitle,
    learnerLevel,
    objectiveIds: objectives.map((o) => o.id),
    objectiveStatements: objectives.map((o) => o.statement),
  });

  const validated = assertLessonIntegrity(fallback);
  await saveLesson(currId, validated);

  return NextResponse.json({ data: { lesson: validated, source: "curated-fallback" } });
}
