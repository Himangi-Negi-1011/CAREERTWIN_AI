import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { questionsForRole } from "@/lib/assessments/question-bank";
import { createAssessmentSession } from "@/lib/assessments/repository";

const requestSchema = z.object({ role: z.string().trim().min(1).max(120), questionCount: z.number().int().min(3).max(5).default(5) });

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Sign in to start a weekly assessment." } }, { status: 401 });
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: { code: "INVALID_ASSESSMENT_REQUEST", message: "Choose a target role before starting the assessment." } }, { status: 400 });
  const questions = questionsForRole(parsed.data.role, parsed.data.questionCount).map((question) => ({ id: question.id, skill: question.skill, difficulty: question.difficulty, prompt: question.prompt, options: question.options }));
  const assessmentId = crypto.randomUUID();
  try {
    await createAssessmentSession(userId, assessmentId, parsed.data.role, questions.map((question) => question.id));
    return NextResponse.json({ data: { assessmentId, source: "curated", role: parsed.data.role, questions } });
  } catch (error) {
    console.error("Assessment session creation failed", error instanceof Error ? error.name : "UnknownError");
    return NextResponse.json({ error: { code: "ASSESSMENT_SESSION_FAILED", message: "The assessment could not be started securely. Try again later." } }, { status: 503 });
  }
}
