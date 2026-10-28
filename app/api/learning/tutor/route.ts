import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { askAITutor, getAIProviderStatus } from "@/lib/ai/provider";

const tutorRequestSchema = z.object({
  question: z.string().trim().min(2).max(1000),
  skillName: z.string().trim().min(1).max(120),
  lessonTitle: z.string().trim().max(200).optional(),
  contextText: z.string().trim().max(4000).optional(),
});

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Sign in to chat with the AI Tutor." } }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = tutorRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "INVALID_TUTOR_REQUEST", message: "Invalid question parameters.", details: parsed.error.flatten().fieldErrors } },
      { status: 400 }
    );
  }

  const { question, skillName, lessonTitle, contextText } = parsed.data;

  const aiStatus = getAIProviderStatus();
  if (aiStatus.configured) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      try {
        const response = await askAITutor({ question, skillName, lessonTitle, contextText }, controller.signal);
        return NextResponse.json({ data: response });
      } finally {
        clearTimeout(timeout);
      }
    } catch (err) {
      console.warn("AI Tutor call failed, using guided fallback:", err instanceof Error ? err.message : err);
    }
  }

  // Deterministic pedagogical answer
  return NextResponse.json({
    data: {
      answer: `Great question regarding ${lessonTitle || skillName}. In engineering practice, "${question.slice(0, 120)}" hinges on maintaining clear state boundaries, verifying contracts at runtime, and structuring components for testability. Keep your handlers focused on a single responsibility and always validate inputs before executing side-effects.`,
      relatedConcepts: [
        "Defensive programming & schema validation",
        "Idempotency in async workflows",
        "Automated integration testing",
        "Observability & structured logging",
      ],
      suggestedAction: `Try writing a small unit test or running the practical exercise in this lesson to experiment with this concept directly in code.`,
    },
  });
}
