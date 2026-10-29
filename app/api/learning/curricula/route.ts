import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { AIConfigurationError, AIProviderError } from "@/lib/ai/provider";
import { findCanonicalSkill, validateNewSkillName } from "@/lib/learning/catalog";
import { skillLevelSchema, type SkillLevel } from "@/lib/learning/schema";
import {
  findCurriculumBySkill,
  getCurriculumById,
} from "@/lib/learning/repository";
import {
  initializeCourseJob,
  executeCourseGeneration,
} from "@/lib/learning/course-engine";

const requestSchema = z.object({
  skillName: z.string().trim().min(2).max(120),
  level: skillLevelSchema.default("foundation"),
  preferredLanguage: z.string().trim().min(2).max(80).default("English"),
  targetRole: z.string().trim().max(120).optional(),
  knownSkills: z.array(z.string().trim().min(1).max(120)).max(100).default([]),
  weeklyMinutes: z.number().int().min(30).max(10080).default(300),
  autoStartLessons: z.boolean().default(true),
});

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Sign in to access learning curricula." } }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const skill = url.searchParams.get("skill");
  const levelParam = url.searchParams.get("level");
  const level: SkillLevel = (levelParam === "foundation" || levelParam === "beginner" || levelParam === "intermediate" || levelParam === "advanced")
    ? levelParam
    : "beginner";
  const lang = url.searchParams.get("lang") || "English";

  if (id) {
    const curriculum = await getCurriculumById(id);
    if (!curriculum) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: "Curriculum not found." } }, { status: 404 });
    }
    return NextResponse.json({ data: { curriculumId: id, curriculum } });
  }

  if (skill) {
    const found = await findCurriculumBySkill(skill, level, lang);
    if (found) {
      return NextResponse.json({ data: { curriculumId: found.id, curriculum: found.curriculum } });
    }
  }

  return NextResponse.json({ error: { code: "NOT_FOUND", message: "Curriculum not found." } }, { status: 404 });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Sign in to prepare a curriculum." } }, { status: 401 });
  }

  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "INVALID_CURRICULUM_REQUEST", message: "The curriculum request is invalid.", details: parsed.error.flatten().fieldErrors } },
      { status: 400 }
    );
  }

  try {
    const { skillName, level, preferredLanguage, targetRole, knownSkills, weeklyMinutes, autoStartLessons } = parsed.data;
    const candidate = validateNewSkillName(skillName);
    const seeded = findCanonicalSkill(skillName);
    const canonicalName = seeded?.canonicalName ?? candidate.canonicalName;

    // 1. Check if curriculum already exists in persistent repository
    const existing = await findCurriculumBySkill(canonicalName, level, preferredLanguage);
    if (existing) {
      return NextResponse.json({
        data: {
          curriculumId: existing.id,
          curriculum: existing.curriculum,
          state: "ready",
          reused: true,
        },
      });
    }

    // 2. Initialize generation job in repository
    const job = await initializeCourseJob({
      userId,
      skillName: canonicalName,
      learnerLevel: level,
      preferredLanguage,
      targetRole,
      knownSkills,
      weeklyMinutes,
    });

    // 3. Execute course generation (starts planning and generates lessons)
    const completedJob = await executeCourseGeneration(job.id, {
      maxLessons: autoStartLessons ? undefined : 0,
    });

    const curriculum = completedJob.curriculumId ? await getCurriculumById(completedJob.curriculumId) : null;

    return NextResponse.json(
      {
        data: {
          jobId: completedJob.id,
          curriculumId: completedJob.curriculumId,
          curriculum,
          state: completedJob.status,
          isReadyForLearning: completedJob.isReadyForLearning,
          totalLessonsPlanned: completedJob.totalLessonsPlanned,
          lessonsSaved: completedJob.lessonsSaved,
          currentStage: completedJob.currentStage,
          reused: false,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Learning curriculum operation failed", error);
    if (error instanceof AIConfigurationError) {
      return NextResponse.json({ error: { code: "AI_NOT_CONFIGURED", message: "Curriculum generation is unavailable until a supported server-side AI provider is configured." } }, { status: 503 });
    }
    if (error instanceof AIProviderError) {
      return NextResponse.json(
        { error: { code: error.status === 429 ? "AI_RATE_LIMITED" : "AI_PROVIDER_FAILED", message: "The curriculum provider could not complete this request." } },
        { status: error.status, headers: error.retryAfter ? { "Retry-After": error.retryAfter } : undefined }
      );
    }
    return NextResponse.json({ error: { code: "CURRICULUM_FAILED", message: error instanceof Error ? error.message : "The curriculum could not be prepared." } }, { status: 500 });
  }
}
