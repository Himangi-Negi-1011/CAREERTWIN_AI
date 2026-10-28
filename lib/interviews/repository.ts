import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { InterviewEvaluation } from "@/lib/ai/interview";

export class InterviewNotFoundError extends Error {}
export class InterviewConflictError extends Error {}

function fail(error: { message: string } | null) { if (error) throw new Error(error.message); }

export async function createSessionRecord(owner: string, input: { interviewType: string; difficulty: string; adaptiveDifficulty: boolean; questionCount: number; playbackEnabled: boolean; targetRole: string; allowProfileContext: boolean }, first: { question: string; category: string; guidance: string }) {
  const db = getSupabaseAdmin();
  const { data: session, error } = await db.from("interview_sessions").insert({ owner_clerk_user_id: owner, interview_type: input.interviewType, difficulty: input.difficulty, current_difficulty: input.difficulty, adaptive_difficulty: input.adaptiveDifficulty, question_count: input.questionCount, playback_enabled: input.playbackEnabled, target_role: input.targetRole, allow_profile_context: input.allowProfileContext }).select().single();
  fail(error);
  const { data: question, error: questionError } = await db.from("interview_questions").insert({ session_id: session.id, owner_clerk_user_id: owner, ordinal: 1, category: first.category, prompt: first.question, guidance: first.guidance, difficulty: input.difficulty }).select().single();
  if (questionError) { await db.from("interview_sessions").delete().eq("id", session.id).eq("owner_clerk_user_id", owner); throw new Error(questionError.message); }
  return { session, question };
}

export async function getOwnedSession(owner: string, sessionId: string) {
  const db = getSupabaseAdmin();
  const { data, error } = await db.from("interview_sessions").select("*").eq("id", sessionId).eq("owner_clerk_user_id", owner).maybeSingle();
  fail(error); if (!data) throw new InterviewNotFoundError("Interview session was not found"); return data;
}

export async function getOwnedQuestion(owner: string, sessionId: string, questionId: string) {
  const db = getSupabaseAdmin();
  const { data, error } = await db.from("interview_questions").select("*").eq("id", questionId).eq("session_id", sessionId).eq("owner_clerk_user_id", owner).maybeSingle();
  fail(error); if (!data) throw new InterviewNotFoundError("Interview question was not found"); return data;
}

export async function listSessionQuestions(owner: string, sessionId: string) {
  const db = getSupabaseAdmin(); const { data, error } = await db.from("interview_questions").select("*").eq("session_id", sessionId).eq("owner_clerk_user_id", owner).order("ordinal"); fail(error); return data ?? [];
}

export async function saveAnswerAndAssessment(owner: string, sessionId: string, questionId: string, answer: string, inputMode: string, evaluation: InterviewEvaluation, summary: { coverage: number; overallScore: number | null }, next?: { question: string; category: string; guidance: string; difficulty: string; ordinal: number }) {
  const db = getSupabaseAdmin();
  const { data: privacy, error: privacyError } = await db.from("interview_privacy_preferences").select("retain_transcripts").eq("owner_clerk_user_id", owner).maybeSingle(); fail(privacyError);
  const retainedAnswer = privacy?.retain_transcripts === false ? null : answer;
  const { data: updated, error: answerError } = await db.from("interview_questions").update({ answer_text: retainedAnswer, input_mode: inputMode, answered_at: new Date().toISOString() }).eq("id", questionId).eq("session_id", sessionId).eq("owner_clerk_user_id", owner).is("answered_at", null).select("id").maybeSingle();
  fail(answerError); if (!updated) throw new InterviewConflictError("This question has already been submitted");
  const { data: assessment, error: assessmentError } = await db.from("interview_assessments").insert({ session_id: sessionId, question_id: questionId, owner_clerk_user_id: owner, version: 1, kind: "original", evaluation, coverage: summary.coverage, overall_score: summary.overallScore }).select().single(); fail(assessmentError);
  let nextQuestion = null;
  if (next) { const result = await db.from("interview_questions").insert({ session_id: sessionId, owner_clerk_user_id: owner, ordinal: next.ordinal, category: next.category, prompt: next.question, guidance: next.guidance, difficulty: next.difficulty }).select().single(); fail(result.error); nextQuestion = result.data; }
  const { error: sessionError } = await db.from("interview_sessions").update({ current_question_ordinal: next?.ordinal ?? undefined, current_difficulty: next?.difficulty ?? undefined }).eq("id", sessionId).eq("owner_clerk_user_id", owner); fail(sessionError);
  return { assessment, nextQuestion };
}

export async function saveReassessment(owner: string, sessionId: string, questionId: string, clarification: string, evaluation: InterviewEvaluation, summary: { coverage: number; overallScore: number | null }) {
  const db = getSupabaseAdmin();
  const { data: prior, error } = await db.from("interview_assessments").select("version").eq("session_id", sessionId).eq("question_id", questionId).eq("owner_clerk_user_id", owner).order("version", { ascending: false }).limit(1).maybeSingle(); fail(error); if (!prior) throw new InterviewConflictError("Submit the answer before requesting reassessment");
  const { data, error: insertError } = await db.from("interview_assessments").insert({ session_id: sessionId, question_id: questionId, owner_clerk_user_id: owner, version: prior.version + 1, kind: "reassessment", clarification, evaluation, coverage: summary.coverage, overall_score: summary.overallScore }).select().single(); fail(insertError); return data;
}

export async function getSessionAssessmentHistory(owner: string, sessionId: string) { const db = getSupabaseAdmin(); const { data, error } = await db.from("interview_assessments").select("question_id,version,kind,evaluation,coverage,overall_score,created_at").eq("session_id", sessionId).eq("owner_clerk_user_id", owner).order("question_id").order("version", { ascending: false }); fail(error); return data ?? []; }

export async function completeSession(owner: string, sessionId: string, finalReport: unknown, roadmapProposal: unknown) {
  const db = getSupabaseAdmin(); const { data, error } = await db.from("interview_sessions").update({ status: "completed", final_report: finalReport, roadmap_proposal: roadmapProposal, completed_at: new Date().toISOString() }).eq("id", sessionId).eq("owner_clerk_user_id", owner).eq("status", "active").select().maybeSingle(); fail(error); if (!data) throw new InterviewConflictError("Session cannot be completed"); return data;
}

export async function getWeeklyMinutes(owner: string) { const db = getSupabaseAdmin(); const { data, error } = await db.from("career_profiles").select("weekly_minutes").eq("owner_clerk_user_id", owner).maybeSingle(); fail(error); return data?.weekly_minutes ?? 300; }

export async function listHistory(owner: string) { const db = getSupabaseAdmin(); const { data, error } = await db.from("interview_sessions").select("id,interview_type,difficulty,status,target_role,question_count,final_report,completed_at,created_at").eq("owner_clerk_user_id", owner).order("created_at", { ascending: false }).limit(100); fail(error); return data ?? []; }
export async function deleteSession(owner: string, sessionId: string) { const db = getSupabaseAdmin(); const { data, error } = await db.from("interview_sessions").delete().eq("id", sessionId).eq("owner_clerk_user_id", owner).select("id").maybeSingle(); fail(error); if (!data) throw new InterviewNotFoundError("Interview session was not found"); }

export async function approveRoadmap(owner: string, sessionId: string, proposal: { tasks: Array<{ title: string; detail: string; estimatedMinutes: number }> }) {
  const db = getSupabaseAdmin();
  const { data: approval, error } = await db.from("interview_roadmap_approvals").insert({ session_id: sessionId, owner_clerk_user_id: owner, proposal_snapshot: proposal }).select().single(); fail(error);
  const tasks = proposal.tasks.map((task) => ({ owner_clerk_user_id: owner, source: "interview", source_session_id: sessionId, title: task.title, detail: task.detail, estimated_minutes: task.estimatedMinutes }));
  const { data: created, error: taskError } = await db.from("career_roadmap_tasks").insert(tasks).select(); fail(taskError);
  const appliedAt = new Date().toISOString(); const { error: updateError } = await db.from("interview_roadmap_approvals").update({ applied_at: appliedAt }).eq("id", approval.id).eq("owner_clerk_user_id", owner); fail(updateError);
  return { ...approval, applied_at: appliedAt, tasks: created };
}
