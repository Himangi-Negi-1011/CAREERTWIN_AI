import "server-only";
import fs from "fs/promises";
import path from "path";
import { emptyCareerProfile, careerProfileSchema, type CareerProfileData } from "@/lib/profile/schema";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { calculateCareerTwin } from "./engine";
import { twinOutputSchema, twinSourceStateSchema, type TwinSourceState } from "./schema";

export class TwinRevisionConflictError extends Error {}
export type StoredTwin = { revision: number; source: TwinSourceState; twin: ReturnType<typeof twinOutputSchema.parse>; updatedAt: string };

const PROFILES_DIR = path.join(process.cwd(), ".data", "profiles");
const TWINS_DIR = path.join(process.cwd(), ".data", "twins");

async function ensureDir(dirPath: string) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch {
    // Ignore already exists
  }
}

function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, "_");
}

async function readLocalProfile(owner: string): Promise<CareerProfileData | null> {
  try {
    const filePath = path.join(PROFILES_DIR, `${sanitizeId(owner)}.json`);
    const content = await fs.readFile(filePath, "utf8");
    const parsed = careerProfileSchema.safeParse(JSON.parse(content));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

async function writeLocalProfile(owner: string, profile: CareerProfileData): Promise<void> {
  try {
    await ensureDir(PROFILES_DIR);
    const filePath = path.join(PROFILES_DIR, `${sanitizeId(owner)}.json`);
    await fs.writeFile(filePath, JSON.stringify(profile, null, 2), "utf8");
  } catch (error) {
    console.error("Local profile fallback write error:", error);
  }
}

async function readLocalTwin(owner: string): Promise<StoredTwin | null> {
  try {
    const filePath = path.join(TWINS_DIR, `${sanitizeId(owner)}.json`);
    const content = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(content) as StoredTwin;
    const source = twinSourceStateSchema.safeParse(data.source);
    const twin = twinOutputSchema.safeParse(data.twin);
    if (source.success && twin.success) {
      return {
        revision: Number(data.revision) || 1,
        source: source.data,
        twin: twin.data,
        updatedAt: data.updatedAt || new Date().toISOString(),
      };
    }
    return null;
  } catch {
    return null;
  }
}

async function writeLocalTwin(owner: string, stored: StoredTwin): Promise<void> {
  try {
    await ensureDir(TWINS_DIR);
    const filePath = path.join(TWINS_DIR, `${sanitizeId(owner)}.json`);
    await fs.writeFile(filePath, JSON.stringify(stored, null, 2), "utf8");
  } catch (error) {
    console.error("Local twin fallback write error:", error);
  }
}

export async function getCareerProfile(owner: string): Promise<CareerProfileData> {
  try {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("career_profiles").select("profile_data").eq("owner_clerk_user_id", owner).maybeSingle();
    if (!error && data?.profile_data) {
      const parsed = careerProfileSchema.safeParse(data.profile_data);
      if (parsed.success) {
        // Cache locally for offline/fallback continuity
        void writeLocalProfile(owner, parsed.data);
        return parsed.data;
      }
    }
  } catch {
    // Supabase unavailable or table not created yet; fall back gracefully
  }

  const local = await readLocalProfile(owner);
  if (local) return local;

  return emptyCareerProfile;
}

export async function saveCareerProfile(
  owner: string,
  profile: CareerProfileData,
  complete = false
): Promise<{ profile: CareerProfileData; synced: boolean }> {
  // Always persist to reliable local storage first
  await writeLocalProfile(owner, profile);

  let synced = false;
  try {
    const db = getSupabaseAdmin();
    const completedSteps = new Set(profile.completedSteps);
    const completion = Math.round((completedSteps.size / 7) * 100);

    const { error } = await db.from("career_profiles").upsert(
      {
        owner_clerk_user_id: owner,
        display_name: profile.personal.fullName || null,
        profile_data: { ...profile, updatedAt: new Date().toISOString() },
        profile_completion: complete ? 100 : completion,
        onboarding_step: complete ? 7 : profile.currentStep,
        onboarding_completed: complete,
        preferred_job_market: profile.interests.preferredLocation || null,
      },
      { onConflict: "owner_clerk_user_id" }
    );

    if (!error) synced = true;
  } catch {
    synced = false;
  }

  return { profile, synced };
}

export async function getCareerTwin(owner: string): Promise<StoredTwin> {
  const profile = await getCareerProfile(owner);

  try {
    const db = getSupabaseAdmin();
    const stored = await db.from("career_twin_states").select("source_state,twin_output,revision,updated_at").eq("owner_clerk_user_id", owner).maybeSingle();

    if (!stored.error && stored.data) {
      const source = twinSourceStateSchema.parse(stored.data.source_state ?? {});
      const twin = calculateCareerTwin({ profile, source });
      const result: StoredTwin = {
        revision: Number(stored.data.revision) ?? 1,
        source,
        twin,
        updatedAt: stored.data.updated_at ?? twin.calculatedAt,
      };
      void writeLocalTwin(owner, result);
      return result;
    }
  } catch {
    // Supabase unavailable or table not yet created
  }

  const local = await readLocalTwin(owner);
  if (local) {
    const recalculatedTwin = calculateCareerTwin({ profile, source: local.source });
    return {
      revision: local.revision,
      source: local.source,
      twin: recalculatedTwin,
      updatedAt: local.updatedAt,
    };
  }

  // Initial calculated twin state
  const defaultSource = twinSourceStateSchema.parse({});
  const initialTwin = calculateCareerTwin({ profile, source: defaultSource });
  const fresh: StoredTwin = {
    revision: 1,
    source: defaultSource,
    twin: initialTwin,
    updatedAt: initialTwin.calculatedAt,
  };
  void writeLocalTwin(owner, fresh);
  return fresh;
}

export async function saveCareerTwin(
  owner: string,
  sourceInput: unknown,
  expectedRevision: number | null,
  mutationId: string
): Promise<StoredTwin> {
  const profile = await getCareerProfile(owner);
  const source = twinSourceStateSchema.parse(sourceInput);
  const twin = calculateCareerTwin({ profile, source });

  const currentLocal = await readLocalTwin(owner);
  const nextRevision = (currentLocal?.revision ?? 0) + 1;
  const storedTwin: StoredTwin = {
    revision: nextRevision,
    source,
    twin,
    updatedAt: new Date().toISOString(),
  };

  // Always save locally to ensure continuity
  await writeLocalTwin(owner, storedTwin);

  try {
    const db = getSupabaseAdmin();
    const { data, error } = await db.rpc("upsert_career_twin_state", {
      p_owner: owner,
      p_expected_revision: expectedRevision,
      p_mutation_id: mutationId,
      p_source_state: source,
      p_twin_output: twin,
    }).single();

    if (!error && data) {
      const row = data as { revision: number; source_state: unknown; twin_output: unknown; updated_at: string };
      storedTwin.revision = Number(row.revision);
      storedTwin.updatedAt = row.updated_at;
      await writeLocalTwin(owner, storedTwin);
    }
  } catch {
    // Remote database sync failed; local copy remains active
  }

  return storedTwin;
}

export async function patchCareerTwin(owner: string, patch: Partial<TwinSourceState>, mutationId: string): Promise<StoredTwin> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const current = await getCareerTwin(owner);
    try {
      return await saveCareerTwin(owner, { ...current.source, ...patch }, current.revision || null, mutationId);
    } catch (error) {
      if (!(error instanceof TwinRevisionConflictError) || attempt === 1) throw error;
    }
  }
  throw new TwinRevisionConflictError("Twin update could not be serialized");
}

export async function completeAssessmentWithTwin(
  owner: string,
  assessmentId: string,
  sourceInput: unknown,
  expectedRevision: number | null,
  resultSummary: unknown
): Promise<StoredTwin> {
  const profile = await getCareerProfile(owner);
  const source = twinSourceStateSchema.parse(sourceInput);
  const twin = calculateCareerTwin({ profile, source });

  const currentLocal = await readLocalTwin(owner);
  const nextRevision = (currentLocal?.revision ?? 0) + 1;
  const storedTwin: StoredTwin = {
    revision: nextRevision,
    source,
    twin,
    updatedAt: new Date().toISOString(),
  };

  await writeLocalTwin(owner, storedTwin);

  try {
    const db = getSupabaseAdmin();
    const { data, error } = await db.rpc("complete_assessment_with_twin", {
      p_owner: owner,
      p_assessment_id: assessmentId,
      p_expected_revision: expectedRevision,
      p_source_state: source,
      p_twin_output: twin,
      p_result_summary: resultSummary,
    }).single();

    if (!error && data) {
      const row = data as { revision: number; source_state: unknown; twin_output: unknown; updated_at: string };
      storedTwin.revision = Number(row.revision);
      storedTwin.updatedAt = row.updated_at;
      await writeLocalTwin(owner, storedTwin);
    }
  } catch {
    // Fall back to stored local twin
  }

  return storedTwin;
}

export async function recalculateCareerTwin(owner: string, mutationId = crypto.randomUUID()): Promise<StoredTwin> {
  const current = await getCareerTwin(owner);
  return saveCareerTwin(owner, current.source, current.revision || null, mutationId);
}
