import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { DatabaseConfigurationError } from "@/lib/supabase/admin";
import { developmentSchema, evidenceStoreSchema, learningStateSchema, weeklySchema } from "@/lib/twin/schema";
import { getCareerTwin, patchCareerTwin, TwinRevisionConflictError } from "@/lib/twin/repository";

const patchSchema = z.object({ mutationId: z.string().uuid(), patch: z.object({ evidence: evidenceStoreSchema.removeDefault().optional(), development: developmentSchema.removeDefault().optional(), weekly: weeklySchema.removeDefault().optional(), learning: learningStateSchema.removeDefault().optional() }).refine((value) => Object.keys(value).length > 0, "At least one Twin source must be provided") });
const unauthorized = () => NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Sign in to access your Career Twin." } }, { status: 401 });
function serviceError(error: unknown) {
  console.error("Career Twin operation failed", error instanceof Error ? error.name : "UnknownError");
  if (error instanceof DatabaseConfigurationError) return NextResponse.json({ error: { code: "DATABASE_NOT_CONFIGURED", message: "Secure Career Twin sync is not configured. Your saved browser draft was not reported as synced." } }, { status: 503 });
  if (error instanceof TwinRevisionConflictError) return NextResponse.json({ error: { code: "TWIN_CONFLICT", message: "Your Twin changed in another session. Refresh before trying again." } }, { status: 409 });
  return NextResponse.json({ error: { code: "TWIN_SERVICE_FAILED", message: "Your Career Twin could not be updated. Existing saved data was not changed." } }, { status: 503 });
}

export async function GET() {
  const { userId } = await auth(); if (!userId) return unauthorized();
  try { return NextResponse.json({ data: await getCareerTwin(userId) }); } catch (error) { return serviceError(error); }
}
export async function PATCH(request: Request) {
  const { userId } = await auth(); if (!userId) return unauthorized();
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: { code: "INVALID_TWIN_UPDATE", message: "The Career Twin update was invalid.", details: parsed.error.flatten().fieldErrors } }, { status: 400 });
  try { return NextResponse.json({ data: await patchCareerTwin(userId, parsed.data.patch, parsed.data.mutationId) }); } catch (error) { return serviceError(error); }
}
