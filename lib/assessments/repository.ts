import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export class AssessmentSessionError extends Error { constructor(public code: "NOT_FOUND" | "EXPIRED" | "DUPLICATE" | "QUESTION_MISMATCH") { super(code); } }
export async function createAssessmentSession(owner: string, id: string, role: string, questionIds: string[]) {
  const expiresAt = new Date(Date.now() + 30 * 60_000).toISOString();
  const { error } = await getSupabaseAdmin().from("career_assessment_sessions").insert({ id, owner_clerk_user_id: owner, role, question_ids: questionIds, expires_at: expiresAt });
  if (error) throw error;
}
export async function validateAssessmentSession(owner: string, id: string, role: string, questionIds: string[]) {
  const { data, error } = await getSupabaseAdmin().from("career_assessment_sessions").select("role,question_ids,expires_at,submitted_at").eq("id", id).eq("owner_clerk_user_id", owner).maybeSingle();
  if (error) throw error;
  if (!data) throw new AssessmentSessionError("NOT_FOUND");
  if (data.submitted_at) throw new AssessmentSessionError("DUPLICATE");
  if (new Date(data.expires_at).getTime() < Date.now()) throw new AssessmentSessionError("EXPIRED");
  const expected = [...data.question_ids].sort(); const received = [...questionIds].sort();
  if (data.role !== role || expected.length !== received.length || expected.some((value, index) => value !== received[index])) throw new AssessmentSessionError("QUESTION_MISMATCH");
}
export async function completeAssessmentSession(owner: string, id: string, summary: unknown) {
  const { data, error } = await getSupabaseAdmin().from("career_assessment_sessions").update({ submitted_at: new Date().toISOString(), result_summary: summary }).eq("id", id).eq("owner_clerk_user_id", owner).is("submitted_at", null).select("id").maybeSingle();
  if (error) throw error;
  if (!data) throw new AssessmentSessionError("DUPLICATE");
}
