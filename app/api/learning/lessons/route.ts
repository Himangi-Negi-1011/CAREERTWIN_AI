import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { generateLesson, getAIProviderStatus } from "@/lib/ai/provider";
import { buildDeterministicLesson } from "@/lib/learning/lesson-service";
import { lessonDocumentSchema } from "@/lib/learning/lesson-schema";

const requestSchema = z.object({
  skillName: z.string().trim().min(1).max(120),
  moduleId: z.string().trim().min(1).max(100),
  lessonId: z.string().trim().min(1).max(100),
  lessonTitle: z.string().trim().min(1).max(200),
  learnerLevel: z.enum(["foundation", "beginner", "intermediate", "advanced"]).default("beginner"),
  targetRole: z.string().trim().max(120).optional(),
  objectives: z.array(z.object({ id: z.string().trim(), statement: z.string().trim() })).default([]),
});

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Sign in to access lessons." } }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "INVALID_LESSON_REQUEST", message: "Invalid lesson request parameters.", details: parsed.error.flatten().fieldErrors } },
      { status: 400 }
    );
  }

  const { skillName, moduleId, lessonId, lessonTitle, learnerLevel, targetRole, objectives } = parsed.data;

  // Check if AI provider is available
  const aiStatus = getAIProviderStatus();
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
        return NextResponse.json({ data: { lesson: generated, source: "ai" } });
      } finally {
        clearTimeout(timeout);
      }
    } catch (err) {
      console.warn("AI lesson generation failed or timed out, using deterministic fallback:", err instanceof Error ? err.message : err);
    }
  }

  // Deterministic fallback
  const fallback = buildDeterministicLesson({
    skillName,
    moduleId,
    lessonId,
    lessonTitle,
    learnerLevel,
    objectiveIds: objectives.map((o) => o.id),
    objectiveStatements: objectives.map((o) => o.statement),
  });

  return NextResponse.json({ data: { lesson: lessonDocumentSchema.parse(fallback), source: "curated-fallback" } });
}
