import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { reassessmentSchema, summarizeEvaluation } from "@/lib/ai/interview";
import { evaluateInterviewAnswer } from "@/lib/ai/provider";
import { interviewErrorResponse, invalidRequest, unauthorized } from "@/lib/interviews/http";
import { getOwnedQuestion, getOwnedSession, saveReassessment } from "@/lib/interviews/repository";

export async function POST(request: Request, context: { params: Promise<{ sessionId: string; questionId: string }> }) {
  const { userId } = await auth(); if (!userId) return unauthorized();
  const parsed = reassessmentSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return invalidRequest(parsed.error.flatten().fieldErrors);
  const { sessionId, questionId } = await context.params; const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 30_000);
  try {
    const [session, question] = await Promise.all([getOwnedSession(userId, sessionId), getOwnedQuestion(userId, sessionId, questionId)]);
    if (!question.answer_text) return NextResponse.json({ error: { code: "CONFLICT", message: "Submit an answer before requesting reassessment." } }, { status: 409 });
    const evaluation = await evaluateInterviewAnswer({ interviewType: session.interview_type, difficulty: question.difficulty, targetRole: session.target_role, question: question.prompt, answer: question.answer_text, clarification: parsed.data.clarification }, controller.signal);
    const summary = summarizeEvaluation(evaluation); const assessment = await saveReassessment(userId, sessionId, questionId, parsed.data.clarification, evaluation, summary);
    return NextResponse.json({ data: { evaluation, summary, assessment } }, { status: 201 });
  } catch (error) { return interviewErrorResponse(error); } finally { clearTimeout(timer); }
}
