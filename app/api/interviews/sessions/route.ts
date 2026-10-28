import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createInterviewSessionSchema } from "@/lib/ai/interview";
import { generateInterviewQuestion } from "@/lib/ai/provider";
import { interviewErrorResponse, invalidRequest, unauthorized } from "@/lib/interviews/http";
import { createSessionRecord } from "@/lib/interviews/repository";

export async function POST(request: Request) {
  const { userId } = await auth(); if (!userId) return unauthorized();
  const parsed = createInterviewSessionSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return invalidRequest(parsed.error.flatten().fieldErrors);
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 25_000);
  try {
    const first = await generateInterviewQuestion({ interviewType: parsed.data.interviewType, difficulty: parsed.data.difficulty, targetRole: parsed.data.targetRole, ordinal: 1, previousQuestions: [] }, controller.signal);
    const result = await createSessionRecord(userId, parsed.data, first);
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) { return interviewErrorResponse(error); } finally { clearTimeout(timer); }
}
