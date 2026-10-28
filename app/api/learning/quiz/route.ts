import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { knowledgeCheckSchema, gradeKnowledgeChecks } from "@/lib/learning/lesson-schema";

const quizSubmitRequestSchema = z.object({
  lessonId: z.string().trim().min(1).max(100),
  questionSetVersion: z.number().int().positive().default(1),
  answers: z.record(z.string().max(100), z.array(z.string().max(40)).max(10)),
  questions: z.array(knowledgeCheckSchema).min(1).max(20),
});

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Sign in to submit quiz answers." } }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = quizSubmitRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "INVALID_QUIZ_SUBMISSION", message: "Invalid quiz submission format.", details: parsed.error.flatten().fieldErrors } },
      { status: 400 }
    );
  }

  const { questionSetVersion, answers, questions } = parsed.data;
  const graded = gradeKnowledgeChecks(questions, { questionSetVersion, answers });

  return NextResponse.json({ data: graded });
}
