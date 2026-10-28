import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { generateFinalReport } from "@/lib/ai/provider";
import { interviewErrorResponse, unauthorized } from "@/lib/interviews/http";
import { completeSession, getOwnedSession, getSessionAssessmentHistory, getWeeklyMinutes, listSessionQuestions } from "@/lib/interviews/repository";

export async function POST(_: Request, context: { params: Promise<{ sessionId: string }> }) {
  const { userId } = await auth(); if (!userId) return unauthorized(); const { sessionId } = await context.params;
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 35_000);
  try {
    const [session, questions, history, weeklyMinutes] = await Promise.all([getOwnedSession(userId, sessionId), listSessionQuestions(userId, sessionId), getSessionAssessmentHistory(userId, sessionId), getWeeklyMinutes(userId)]);
    const answered = questions.filter((item) => item.answered_at); if (answered.length !== session.question_count) return NextResponse.json({ error: { code: "CONFLICT", message: `Complete all ${session.question_count} questions before generating the report.` } }, { status: 409 });
    const latest = new Map<string, (typeof history)[number]>(); for (const item of history) if (!latest.has(item.question_id)) latest.set(item.question_id, item);
    const summaries = [...latest.values()]; const narrative = await generateFinalReport({ interviewType: session.interview_type, targetRole: session.target_role, summaries, weeklyMinutes }, controller.signal);
    const scored = summaries.filter((item) => item.overall_score !== null); const overallScore = scored.length === summaries.length && scored.length ? Math.round(scored.reduce((sum, item) => sum + Number(item.overall_score), 0) / scored.length * 100) / 100 : null;
    const finalReport = { overallScore, scoreExplanation: overallScore === null ? "One or more answers did not meet the 75% assessed-rubric threshold." : "Average of question scores that each met the 75% threshold.", ...narrative, questionAssessments: summaries };
    const roadmapProposal = { weeklyMinutesCap: weeklyMinutes, tasks: narrative.practicePlan, requiresApproval: true };
    await completeSession(userId, sessionId, finalReport, roadmapProposal);
    return NextResponse.json({ data: { finalReport, roadmapProposal } });
  } catch (error) { return interviewErrorResponse(error); } finally { clearTimeout(timer); }
}
