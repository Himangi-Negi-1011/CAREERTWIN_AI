import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { DatabaseConfigurationError } from "@/lib/supabase/admin";
import { developmentSchema, evidenceStoreSchema, learningStateSchema, weeklySchema, twinSourceStateSchema } from "@/lib/twin/schema";
import { getCareerTwin, patchCareerTwin, saveCareerProfile, saveCareerTwin, TwinRevisionConflictError } from "@/lib/twin/repository";
import { careerProfileSchema } from "@/lib/profile/schema";
import { getAIProviderStatus, generateCareerRoadmap } from "@/lib/ai/provider";
import { requirementsForRole } from "@/lib/twin/roles";

const patchSchema = z.object({
  mutationId: z.string().uuid(),
  patch: z.object({
    evidence: evidenceStoreSchema.removeDefault().optional(),
    development: developmentSchema.removeDefault().optional(),
    weekly: weeklySchema.removeDefault().optional(),
    learning: learningStateSchema.removeDefault().optional(),
  }).refine((value) => Object.keys(value).length > 0, "At least one Twin source must be provided"),
});

const postSchema = z.object({
  profile: careerProfileSchema.optional(),
  generateAiRoadmap: z.boolean().default(true),
  reviewedResumeFacts: z.array(z.string().trim().min(2).max(500)).max(30).default([]),
});

const unauthorized = () => NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Sign in to access your Career Twin." } }, { status: 401 });

function serviceError(error: unknown) {
  console.error("Career Twin operation failed", error instanceof Error ? error.message : "UnknownError");
  if (error instanceof DatabaseConfigurationError) return NextResponse.json({ error: { code: "DATABASE_NOT_CONFIGURED", message: "Secure Career Twin sync is not configured. Your saved browser draft was not reported as synced." } }, { status: 503 });
  if (error instanceof TwinRevisionConflictError) return NextResponse.json({ error: { code: "TWIN_CONFLICT", message: "Your Twin changed in another session. Refresh before trying again." } }, { status: 409 });
  return NextResponse.json({ error: { code: "TWIN_SERVICE_FAILED", message: "Your Career Twin could not be updated. Existing saved data was not changed." } }, { status: 503 });
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return unauthorized();
  try {
    return NextResponse.json({ data: await getCareerTwin(userId) });
  } catch (error) {
    return serviceError(error);
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return unauthorized();

  const body = await request.json().catch(() => ({}));
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({
      error: {
        code: "INVALID_TWIN_REQUEST",
        message: "Invalid profile or options for Career Twin creation.",
        details: parsed.error.flatten().fieldErrors,
      },
    }, { status: 400 });
  }

  try {
    let currentProfile = parsed.data.profile;
    if (currentProfile) {
      await saveCareerProfile(userId, currentProfile, true);
    } else {
      const existing = await getCareerTwin(userId);
      currentProfile = await import("@/lib/twin/repository").then((m) => m.getCareerProfile(userId));
      void existing;
    }

    if (!currentProfile) {
      return NextResponse.json({
        ok: false,
        error: {
          code: "PROFILE_NOT_FOUND",
          message: "No profile found for user to build Career Twin. Please complete profile first.",
        },
      }, { status: 400 });
    }

    const currentStored = await getCareerTwin(userId);
    const source = twinSourceStateSchema.parse(currentStored.source ?? {});

    const targetRole = currentProfile.interests.targetRole.trim();
    const requirements = targetRole ? requirementsForRole(targetRole) : [];

    // Initialize evidence store for the role if empty
    if (targetRole && !source.evidence[targetRole]) {
      const records: Record<string, { status: "not-reviewed" | "learning" | "demonstrated"; evidence: string }> = {};
      const profileSkills = new Map(currentProfile.skills.map((s) => [s.name.toLowerCase(), s]));

      requirements.forEach((req) => {
        const found = profileSkills.get(req.skill.toLowerCase());
        if (found) {
          records[req.skill] = {
            status: found.proficiency === "advanced" || found.proficiency === "intermediate" ? "demonstrated" : "learning",
            evidence: found.evidence || (found.proficiency === "advanced" ? "Self-reported advanced experience." : ""),
          };
        } else {
          records[req.skill] = { status: "not-reviewed", evidence: "" };
        }
      });

      source.evidence[targetRole] = { records, customSkills: [] };
    }

    // Attempt AI roadmap generation if requested and configured
    let aiSuccess = false;
    const aiStatus = getAIProviderStatus();

    if (parsed.data.generateAiRoadmap && aiStatus.configured && targetRole) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20_000);
        const aiRoadmap = await generateCareerRoadmap({
          targetRole,
          status: currentProfile.personal.status,
          headline: currentProfile.personal.headline,
          education: currentProfile.education.map(({ degree, field, course, status }) => ({ degree, field, course, status })),
          skills: currentProfile.skills.map(({ name, proficiency, learning }) => ({ name, proficiency, learning })),
          projects: currentProfile.projects.map(({ kind, title, description, technologies, contribution, status }) => ({ kind, title, description, technologies, contribution, status })),
          goals: currentProfile.interests.goals || currentProfile.interests.shortTermGoals,
          industry: currentProfile.interests.industry,
          experienceLevel: currentProfile.interests.experienceLevel,
          preferredLocation: currentProfile.interests.preferredLocation,
          reviewedResumeFacts: parsed.data.reviewedResumeFacts,
        }, controller.signal);
        clearTimeout(timeout);

        if (aiRoadmap.tasks.length > 0) {
          const newTasks = aiRoadmap.tasks.map((task, i) => ({
            id: `ai-task-${Date.now()}-${i}`,
            title: task.title,
            detail: `${task.detail}\n\nRationale: ${task.rationale}\nProof: ${task.proof}`,
            done: false,
            createdAt: new Date().toISOString(),
            status: "planned" as const,
            skill: requirements[i % Math.max(1, requirements.length)]?.skill || targetRole,
            estimatedMinutes: task.estimatedMinutes,
            priority: i < 2 ? "high" as const : "medium" as const,
          }));

          source.development.tasks = [...newTasks, ...source.development.tasks];
          aiSuccess = true;
        }
      } catch (aiError) {
        console.warn("AI roadmap generation during Twin creation skipped:", aiError instanceof Error ? aiError.message : "Unknown");
      }
    }

    // Deterministic roadmap fallback if no tasks exist
    if (source.development.tasks.length === 0 && requirements.length > 0) {
      source.development.tasks = requirements.slice(0, 5).map((req, i) => ({
        id: `role-task-${Date.now()}-${i}`,
        title: `Master ${req.skill} foundations`,
        detail: `Review core concepts and complete guided practical exercises for ${req.skill}.`,
        done: false,
        createdAt: new Date().toISOString(),
        status: "planned" as const,
        skill: req.skill,
        estimatedMinutes: req.estimatedMinutes,
        priority: i < 2 ? "high" as const : "medium" as const,
      }));
    }

    const saved = await saveCareerTwin(userId, source, null, crypto.randomUUID());

    return NextResponse.json({
      data: {
        twinId: `twin_${userId}`,
        status: "ready",
        twin: saved.twin,
        source: saved.source,
        profile: currentProfile,
        revision: saved.revision,
        targetRole: saved.twin.targetRole,
        aiGenerated: aiSuccess,
        updatedAt: saved.updatedAt,
      },
    });
  } catch (error) {
    return serviceError(error);
  }
}

export async function PATCH(request: Request) {
  const { userId } = await auth();
  if (!userId) return unauthorized();
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: { code: "INVALID_TWIN_UPDATE", message: "The Career Twin update was invalid.", details: parsed.error.flatten().fieldErrors } }, { status: 400 });
  try {
    return NextResponse.json({ data: await patchCareerTwin(userId, parsed.data.patch, parsed.data.mutationId) });
  } catch (error) {
    return serviceError(error);
  }
}
