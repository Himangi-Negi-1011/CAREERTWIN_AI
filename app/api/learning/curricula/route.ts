import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { AIConfigurationError, AIProviderError, generateLearningCurriculum, getAIProviderStatus } from "@/lib/ai/provider";
import { findCanonicalSkill, normalizeSkillName, validateNewSkillName } from "@/lib/learning/catalog";
import { curriculumSchema, skillLevelSchema } from "@/lib/learning/schema";
import { DatabaseConfigurationError, getSupabaseAdmin } from "@/lib/supabase/admin";

const requestSchema = z.object({
  skillName: z.string().trim().min(2).max(120),
  level: skillLevelSchema.default("foundation"),
  preferredLanguage: z.string().trim().min(2).max(80).default("English"),
  targetRole: z.string().trim().max(120).optional(),
  knownSkills: z.array(z.string().trim().min(1).max(120)).max(100).default([]),
  weeklyMinutes: z.number().int().min(30).max(10080).default(300),
});

function errorResponse(error: unknown) {
  console.error("Learning curriculum operation failed", error instanceof Error ? error.name : "UnknownError");
  if (error instanceof DatabaseConfigurationError) return NextResponse.json({ error: { code: "DATABASE_NOT_CONFIGURED", message: "Secure Learning Studio persistence is not configured." } }, { status: 503 });
  if (error instanceof AIConfigurationError) return NextResponse.json({ error: { code: "AI_NOT_CONFIGURED", message: "Curriculum generation is unavailable until a supported server-side AI provider is configured." } }, { status: 503 });
  if (error instanceof AIProviderError) return NextResponse.json({ error: { code: error.status === 429 ? "AI_RATE_LIMITED" : "AI_PROVIDER_FAILED", message: "The curriculum provider could not complete this request. No course was published." } }, { status: error.status, headers: error.retryAfter ? { "Retry-After": error.retryAfter } : undefined });
  return NextResponse.json({ error: { code: "CURRICULUM_FAILED", message: "The curriculum could not be prepared. No course was published." } }, { status: 503 });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Sign in to prepare a curriculum." } }, { status: 401 });
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: { code: "INVALID_CURRICULUM_REQUEST", message: "The curriculum request is invalid.", details: parsed.error.flatten().fieldErrors } }, { status: 400 });
  try {
    const candidate = validateNewSkillName(parsed.data.skillName);
    const seeded = findCanonicalSkill(parsed.data.skillName);
    const canonicalName = seeded?.canonicalName ?? candidate.canonicalName;
    const normalizedName = normalizeSkillName(canonicalName);
    const db = getSupabaseAdmin();
    const skillRead = await db.from("skill_catalog").select("id,canonical_name").eq("normalized_name", normalizedName).maybeSingle();
    let skill = skillRead.data;
    if (skillRead.error) throw skillRead.error;
    if (!skill) {
      const seed = seeded;
      const inserted = await db.from("skill_catalog").insert({ canonical_name: canonicalName, normalized_name: normalizedName, slug: candidate.slug || seeded?.slug, domain: seed?.domain ?? "User-requested skills", subdomain: seed?.subdomain ?? "Pending classification", description: seed?.description ?? `User-requested learning topic: ${canonicalName}.`, learning_outcomes: seed?.learningOutcomes ?? [`Explain the foundations of ${canonicalName}`, `Apply ${canonicalName} in a safe practical task`], difficulty: seed?.difficulty ?? parsed.data.level, prerequisites: seed?.prerequisites ?? [], related_roles: seed?.relatedRoles ?? [], proficiency_criteria: seed?.proficiencyCriteria ?? [`Explain core ${canonicalName} concepts`, `Complete reviewed practical evidence for ${canonicalName}`], review_status: "draft", created_by_clerk_user_id: userId }).select("id,canonical_name").single();
      if (inserted.error) throw inserted.error;
      skill = inserted.data;
    }
    const existing = await db.from("learning_curricula").select("id,curriculum_document,review_status,content_version").eq("skill_id", skill.id).eq("learner_level", parsed.data.level).eq("preferred_language", parsed.data.preferredLanguage).eq("review_status", "approved").order("content_version", { ascending: false }).limit(1).maybeSingle();
    if (existing.error) throw existing.error;
    if (existing.data) return NextResponse.json({ data: { curriculumId: existing.data.id, curriculum: curriculumSchema.parse(existing.data.curriculum_document), state: "ready", reused: true } });

    const status = getAIProviderStatus();
    if (!status.configured) throw new AIConfigurationError("AI provider is not configured");
    const deduplicationKey = `${skill.id}:${parsed.data.level}:${parsed.data.preferredLanguage.toLowerCase()}:v1`;
    const jobResult = await db.from("ai_generation_jobs").upsert({ owner_clerk_user_id: userId, job_type: "curriculum", deduplication_key: deduplicationKey, status: "generating", skill_id: skill.id, attempts: 1 }, { onConflict: "owner_clerk_user_id,deduplication_key", ignoreDuplicates: true }).select("id,status,curriculum_id").maybeSingle();
    if (jobResult.error) throw jobResult.error;
    if (!jobResult.data) {
      const current = await db.from("ai_generation_jobs").select("id,status,curriculum_id").eq("owner_clerk_user_id", userId).eq("deduplication_key", deduplicationKey).single();
      if (current.error) throw current.error;
      return NextResponse.json({ data: { jobId: current.data.id, curriculumId: current.data.curriculum_id, state: current.data.status, reused: true } }, { status: current.data.status === "ready" ? 200 : 202 });
    }

    const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 25_000);
    try {
      const curriculum = await generateLearningCurriculum({ skillId: skill.id, skillName: canonicalName, learnerLevel: parsed.data.level, preferredLanguage: parsed.data.preferredLanguage, targetRole: parsed.data.targetRole, knownSkills: parsed.data.knownSkills, weeklyMinutes: parsed.data.weeklyMinutes, trustedResources: [] }, controller.signal);
      await db.from("ai_generation_jobs").update({ status: "validating" }).eq("id", jobResult.data.id).eq("owner_clerk_user_id", userId);
      const saved = await db.from("learning_curricula").insert({ skill_id: skill.id, learner_level: parsed.data.level, preferred_language: parsed.data.preferredLanguage, content_version: 1, generation_mode: "ai-draft", review_status: "draft", curriculum_document: curriculum, prompt_version: "curriculum-v1", model_identifier: status.model, source_references: [], created_by_clerk_user_id: userId }).select("id").single();
      if (saved.error) throw saved.error;
      await db.from("ai_generation_jobs").update({ status: "ready", curriculum_id: saved.data.id }).eq("id", jobResult.data.id).eq("owner_clerk_user_id", userId);
      return NextResponse.json({ data: { jobId: jobResult.data.id, curriculumId: saved.data.id, curriculum, state: "awaiting-review", reused: false } }, { status: 202 });
    } catch (error) {
      await db.from("ai_generation_jobs").update({ status: "failed", error_code: error instanceof AIConfigurationError ? "configuration" : error instanceof z.ZodError ? "schema_validation" : "provider_or_validation" }).eq("id", jobResult.data.id).eq("owner_clerk_user_id", userId);
      throw error;
    } finally { clearTimeout(timeout); }
  } catch (error) { return errorResponse(error); }
}
