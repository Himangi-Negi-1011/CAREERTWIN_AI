import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { assessmentQuestionBank } from "@/lib/assessments/question-bank";
import { AssessmentSessionError, validateAssessmentSession } from "@/lib/assessments/repository";
import { completeAssessmentWithTwin, getCareerTwin } from "@/lib/twin/repository";

const submissionSchema = z.object({ assessmentId: z.string().uuid(), role: z.string().trim().min(1).max(120), answers: z.array(z.object({ questionId: z.string().min(1).max(100), optionId: z.string().min(1).max(10) })).min(1).max(5) });
function sessionFailure(error: unknown) {
  if (error instanceof AssessmentSessionError || (error instanceof Error && error.message === "ASSESSMENT_DUPLICATE")) { const code = error instanceof AssessmentSessionError ? error.code : "DUPLICATE"; return NextResponse.json({ error: { code: `ASSESSMENT_${code}`, message: code === "DUPLICATE" ? "This assessment was already submitted." : "This assessment session is invalid or expired. Start a new assessment." } }, { status: code === "DUPLICATE" ? 409 : 400 }); }
  console.error("Assessment persistence failed", error instanceof Error ? error.name : "UnknownError");
  return NextResponse.json({ error: { code: "ASSESSMENT_SAVE_FAILED", message: "The assessment result could not be saved securely. Your Twin was not reported as updated." } }, { status: 503 });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Sign in to submit an assessment." } }, { status: 401 });
  const parsed = submissionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: { code: "INVALID_SUBMISSION", message: "The assessment submission is incomplete." } }, { status: 400 });
  const uniqueIds = new Set(parsed.data.answers.map((answer) => answer.questionId));
  if (uniqueIds.size !== parsed.data.answers.length) return NextResponse.json({ error: { code: "DUPLICATE_QUESTION", message: "Each assessment question can be answered once." } }, { status: 400 });
  try { await validateAssessmentSession(userId, parsed.data.assessmentId, parsed.data.role, [...uniqueIds]); } catch (error) { return sessionFailure(error); }
  const results = parsed.data.answers.map((answer) => {
    const question = assessmentQuestionBank.find((item) => item.id === answer.questionId);
    if (!question || !question.options.some((option) => option.id === answer.optionId)) return null;
    return { questionId: question.id, skill: question.skill, correct: answer.optionId === question.correctOptionId, selectedOptionId: answer.optionId, correctOptionId: question.correctOptionId, explanation: question.explanation };
  });
  if (results.some((result) => result === null)) return NextResponse.json({ error: { code: "UNKNOWN_QUESTION", message: "One or more assessment answers are invalid." } }, { status: 400 });
  const validResults = results.filter((result): result is NonNullable<typeof result> => result !== null);
  const correct = validResults.filter((result) => result.correct).length;
  const completedAt = new Date().toISOString();
  const score = Math.round(correct / validResults.length * 100);
  const revisionSkills = Array.from(new Set(validResults.filter((result) => !result.correct).map((result) => result.skill)));
  const interpretation = "This result records performance on a short curated quiz. It does not prove complete competency or job readiness.";
  const attempt = { assessmentId: parsed.data.assessmentId, completedAt, correct, total: validResults.length, score, revisionSkills, interpretation };
  try {
    const current = await getCareerTwin(userId);
    if (current.source.weekly.attempts.some((item) => item.assessmentId === parsed.data.assessmentId)) return sessionFailure(new AssessmentSessionError("DUPLICATE"));
    const bySkill = new Map<string, { correct: number; total: number }>();
    validResults.forEach((result) => { const value = bySkill.get(result.skill) ?? { correct: 0, total: 0 }; value.total += 1; if (result.correct) value.correct += 1; bySkill.set(result.skill, value); });
    const assessmentEvidence = { ...current.source.assessmentEvidence };
    bySkill.forEach((value, skill) => { assessmentEvidence[skill] = { assessmentId: parsed.data.assessmentId, score: Math.round(value.correct / value.total * 100), correct: value.correct, total: value.total, completedAt }; });
    await completeAssessmentWithTwin(userId, parsed.data.assessmentId, { ...current.source, assessmentEvidence, weekly: { ...current.source.weekly, attempts: [attempt, ...current.source.weekly.attempts].slice(0, 100) } }, current.revision || null, attempt);
  } catch (error) { return sessionFailure(error); }
  return NextResponse.json({ data: { ...attempt, results: validResults } });
}
