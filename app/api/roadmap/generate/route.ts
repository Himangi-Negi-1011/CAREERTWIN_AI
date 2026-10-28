import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { AIConfigurationError, AIProviderError, generateCareerRoadmap } from "@/lib/ai/provider";
import { DatabaseConfigurationError } from "@/lib/supabase/admin";
import { getCareerProfile } from "@/lib/twin/repository";

const requestSchema = z.object({
  reviewedResumeFacts: z.array(z.string().trim().min(3).max(500)).max(30).default([]),
  resumeFactsConfirmed: z.literal(true),
});

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Sign in to generate a personalized roadmap." } }, { status: 401 });

  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: { code: "INVALID_PROFILE_CONTEXT", message: "Review the profile and resume facts before generating tasks.", details: parsed.error.flatten().fieldErrors } }, { status: 400 });

  const { reviewedResumeFacts } = parsed.data;
  let profile;
  try { profile = await getCareerProfile(userId); }
  catch (error) { return NextResponse.json({ error: { code: error instanceof DatabaseConfigurationError ? "DATABASE_NOT_CONFIGURED" : "PROFILE_READ_FAILED", message: "Your saved profile could not be loaded for roadmap generation." } }, { status: 503 }); }
  if (!profile.interests.targetRole.trim()) return NextResponse.json({ error: { code: "TARGET_ROLE_REQUIRED", message: "Save a target role before generating tasks." } }, { status: 400 });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  try {
    const roadmap = await generateCareerRoadmap({
      targetRole: profile.interests.targetRole,
      status: profile.personal.status,
      headline: profile.personal.headline,
      education: profile.education.map(({ degree, field, course, status }) => ({ degree, field, course, status })),
      skills: profile.skills.map(({ name, proficiency, learning }) => ({ name, proficiency, learning })),
      projects: profile.projects.map(({ kind, title, description, technologies, contribution, status }) => ({ kind, title, description, technologies, contribution, status })),
      goals: profile.interests.goals,
      industry: profile.interests.industry,
      experienceLevel: profile.interests.experienceLevel,
      preferredLocation: profile.interests.preferredLocation,
      reviewedResumeFacts,
    }, controller.signal);
    return NextResponse.json({ data: roadmap });
  } catch (error) {
    if (error instanceof AIConfigurationError) return NextResponse.json({ error: { code: "AI_NOT_CONFIGURED", message: "Personalized AI tasks require a securely configured server-side provider." } }, { status: 503 });
    if (error instanceof AIProviderError) return NextResponse.json({ error: { code: "AI_PROVIDER_ERROR", message: "The AI provider could not generate tasks right now." } }, { status: error.status, headers: error.retryAfter ? { "Retry-After": error.retryAfter } : undefined });
    const timedOut = error instanceof DOMException && error.name === "AbortError";
    return NextResponse.json({ error: { code: timedOut ? "AI_TIMEOUT" : "AI_INVALID_RESPONSE", message: timedOut ? "Task generation timed out. Try again." : "The provider returned tasks that failed safety validation." } }, { status: timedOut ? 504 : 502 });
  } finally {
    clearTimeout(timeout);
  }
}
