import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { submitInterviewAnswerSchema, summarizeEvaluation } from "@/lib/ai/interview";
import { evaluateInterviewAnswer, generateInterviewQuestion } from "@/lib/ai/provider";
import { interviewErrorResponse, invalidRequest, unauthorized } from "@/lib/interviews/http";
import { getOwnedQuestion, getOwnedSession, listSessionQuestions, saveAnswerAndAssessment } from "@/lib/interviews/repository";

const levels = ["beginner", "intermediate", "advanced"] as const;
function adapt(current: typeof levels[number], score: number | null) { if (score === null) return current; const index = levels.indexOf(current); return score >= 4 ? levels[Math.min(2, index + 1)] : score < 2.5 ? levels[Math.max(0, index - 1)] : current; }

export async function POST(request: Request, context: { params: Promise<{ sessionId: string; questionId: string }> }) {
  const { userId } = await auth(); if (!userId) return unauthorized();
  const parsed = submitInterviewAnswerSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return invalidRequest(parsed.error.flatten().fieldErrors);
  const { sessionId, questionId } = await context.params; const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 40_000);
  try {
    const [session, question, questions] = await Promise.all([getOwnedSession(userId, sessionId), getOwnedQuestion(userId, sessionId, questionId), listSessionQuestions(userId, sessionId)]);
    if (session.status !== "active") return NextResponse.json({ error: { code: "CONFLICT", message: "This session is not active." } }, { status: 409 });
    const evaluation = await evaluateInterviewAnswer({ interviewType: session.interview_type, difficulty: question.difficulty, targetRole: session.target_role, question: question.prompt, answer: parsed.data.answer }, controller.signal);
    const summary = summarizeEvaluation(evaluation); const nextOrdinal = question.ordinal + 1;
    const nextDifficulty = session.adaptive_difficulty ? adapt(session.current_difficulty, summary.overallScore) : session.current_difficulty;
    const next = nextOrdinal <= session.question_count ? { ...(await generateInterviewQuestion({ interviewType: session.interview_type, difficulty: nextDifficulty, targetRole: session.target_role, ordinal: nextOrdinal, previousQuestions: questions.map((item) => item.prompt) }, controller.signal)), difficulty: nextDifficulty, ordinal: nextOrdinal } : undefined;
    const saved = await saveAnswerAndAssessment(userId, sessionId, questionId, parsed.data.answer, parsed.data.inputMode, evaluation, summary, next);
    return NextResponse.json({ data: { evaluation, summary, assessment: saved.assessment, nextQuestion: saved.nextQuestion, readyToComplete: !next } });
  } catch (error) { return interviewErrorResponse(error); } finally { clearTimeout(timer); }
}
