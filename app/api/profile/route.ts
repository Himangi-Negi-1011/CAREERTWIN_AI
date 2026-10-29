import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { careerProfileSchema } from "@/lib/profile/schema";
import { getCareerProfile, saveCareerProfile, recalculateCareerTwin } from "@/lib/twin/repository";

function unauthorized() {
  return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Sign in to manage your career profile." } }, { status: 401 });
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return unauthorized();
  try {
    const profile = await getCareerProfile(userId);
    const completedSteps = new Set(profile.completedSteps);
    const completion = Math.round((completedSteps.size / 7) * 100);
    return NextResponse.json({
      data: {
        profile_data: profile,
        profile_completion: completion,
        onboarding_completed: profile.completedSteps.length >= 7,
        onboarding_step: profile.currentStep,
      },
    });
  } catch (error) {
    console.error("Profile load failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({
      error: {
        code: "PROFILE_READ_FAILED",
        message: "Your saved profile could not be loaded.",
      },
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { userId } = await auth();
  if (!userId) return unauthorized();

  const body = await request.json().catch(() => null);
  const parsed = careerProfileSchema.safeParse(body?.profile);
  if (!parsed.success) {
    return NextResponse.json({
      error: {
        code: "INVALID_PROFILE",
        message: "Review the highlighted profile information.",
        details: parsed.error.flatten().fieldErrors,
      },
    }, { status: 400 });
  }

  const complete = body?.complete === true;
  const completedSteps = new Set(parsed.data.completedSteps);
  const completion = Math.round((completedSteps.size / 7) * 100);

  try {
    const { profile, synced } = await saveCareerProfile(userId, parsed.data, complete);
    const role = profile.interests.targetRole;

    let twinUpdated = true;
    try {
      await recalculateCareerTwin(userId);
    } catch (twinError) {
      twinUpdated = false;
      console.warn("Twin recalculation after profile save fallback:", twinError instanceof Error ? twinError.message : "UnknownError");
    }

    return NextResponse.json({
      data: {
        profile_completion: complete ? 100 : completion,
        onboarding_completed: complete,
        targetRole: role,
        twinUpdated,
        synced,
      },
      warning: synced ? undefined : "Profile saved to secure local workspace; cloud database synchronization will retry automatically.",
    });
  } catch (error) {
    console.error("Profile save failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({
      error: {
        code: "PROFILE_SAVE_FAILED",
        message: "Your profile could not be saved securely. Your browser draft is still available.",
      },
    }, { status: 500 });
  }
}
