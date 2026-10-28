import "server-only";
import { emptyCareerProfile, careerProfileSchema, type CareerProfileData } from "@/lib/profile/schema";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { calculateCareerTwin } from "./engine";
import { twinOutputSchema, twinSourceStateSchema, type TwinSourceState } from "./schema";

export class TwinRevisionConflictError extends Error {}
export type StoredTwin = { revision: number; source: TwinSourceState; twin: ReturnType<typeof twinOutputSchema.parse>; updatedAt: string };

export async function getCareerProfile(owner: string): Promise<CareerProfileData> {
  const db = getSupabaseAdmin();
  const { data, error } = await db.from("career_profiles").select("profile_data").eq("owner_clerk_user_id", owner).maybeSingle();
  if (error) throw error;
  return careerProfileSchema.parse(data?.profile_data ?? emptyCareerProfile);
}

export async function getCareerTwin(owner: string): Promise<StoredTwin> {
  const db = getSupabaseAdmin();
  const [profile, stored] = await Promise.all([
    getCareerProfile(owner),
    db.from("career_twin_states").select("source_state,twin_output,revision,updated_at").eq("owner_clerk_user_id", owner).maybeSingle(),
  ]);
  if (stored.error) throw stored.error;
  const source = twinSourceStateSchema.parse(stored.data?.source_state ?? {});
  const twin = calculateCareerTwin({ profile, source });
  return { revision: stored.data?.revision ?? 0, source, twin, updatedAt: stored.data?.updated_at ?? twin.calculatedAt };
}

export async function saveCareerTwin(owner: string, sourceInput: unknown, expectedRevision: number | null, mutationId: string): Promise<StoredTwin> {
  const db = getSupabaseAdmin();
  const profile = await getCareerProfile(owner);
  const source = twinSourceStateSchema.parse(sourceInput);
  const twin = calculateCareerTwin({ profile, source });
  const { data, error } = await db.rpc("upsert_career_twin_state", { p_owner: owner, p_expected_revision: expectedRevision, p_mutation_id: mutationId, p_source_state: source, p_twin_output: twin }).single();
  if (error) {
    if (error.code === "40001" || error.message?.includes("stale_twin_revision")) throw new TwinRevisionConflictError("Twin changed in another request");
    throw error;
  }
  const row = data as { revision: number; source_state: unknown; twin_output: unknown; updated_at: string };
  return { revision: Number(row.revision), source: twinSourceStateSchema.parse(row.source_state), twin: twinOutputSchema.parse(row.twin_output), updatedAt: row.updated_at };
}

export async function patchCareerTwin(owner: string, patch: Partial<TwinSourceState>, mutationId: string): Promise<StoredTwin> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const current = await getCareerTwin(owner);
    try { return await saveCareerTwin(owner, { ...current.source, ...patch }, current.revision || null, mutationId); }
    catch (error) { if (!(error instanceof TwinRevisionConflictError) || attempt === 1) throw error; }
  }
  throw new TwinRevisionConflictError("Twin update could not be serialized");
}

export async function completeAssessmentWithTwin(owner: string, assessmentId: string, sourceInput: unknown, expectedRevision: number | null, resultSummary: unknown): Promise<StoredTwin> {
  const db = getSupabaseAdmin(); const profile = await getCareerProfile(owner); const source = twinSourceStateSchema.parse(sourceInput); const twin = calculateCareerTwin({ profile, source });
  const { data, error } = await db.rpc("complete_assessment_with_twin", { p_owner: owner, p_assessment_id: assessmentId, p_expected_revision: expectedRevision, p_source_state: source, p_twin_output: twin, p_result_summary: resultSummary }).single();
  if (error) { if (error.code === "23505" || error.message?.includes("assessment_already_submitted")) throw new Error("ASSESSMENT_DUPLICATE"); if (error.code === "40001") throw new TwinRevisionConflictError("Twin changed during assessment submission"); throw error; }
  const row = data as { revision: number; source_state: unknown; twin_output: unknown; updated_at: string };
  return { revision: Number(row.revision), source: twinSourceStateSchema.parse(row.source_state), twin: twinOutputSchema.parse(row.twin_output), updatedAt: row.updated_at };
}

export async function recalculateCareerTwin(owner: string, mutationId = crypto.randomUUID()) {
  const current = await getCareerTwin(owner);
  return saveCareerTwin(owner, current.source, current.revision || null, mutationId);
}
