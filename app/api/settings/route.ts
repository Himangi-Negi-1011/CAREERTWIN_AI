import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { DatabaseConfigurationError, getSupabaseAdmin } from "@/lib/supabase/admin";

const preferencesSchema = z.object({ allowProfileContext: z.boolean(), allowHistoryPersonalization: z.boolean(), retainTranscripts: z.boolean() });
const defaults = { allowProfileContext: false, allowHistoryPersonalization: false, retainTranscripts: true };
const unauthorized = () => NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Sign in to manage privacy settings." } }, { status: 401 });
function failure(error: unknown) { console.error("Privacy settings operation failed", error instanceof Error ? error.name : "UnknownError"); return NextResponse.json({ error: { code: error instanceof DatabaseConfigurationError ? "DATABASE_NOT_CONFIGURED" : "SETTINGS_FAILED", message: "Privacy settings could not be loaded or saved securely." } }, { status: 503 }); }
export async function GET() {
  const { userId } = await auth(); if (!userId) return unauthorized();
  try { const { data, error } = await getSupabaseAdmin().from("interview_privacy_preferences").select("allow_profile_context,allow_history_personalization,retain_transcripts").eq("owner_clerk_user_id", userId).maybeSingle(); if (error) throw error; return NextResponse.json({ data: data ? { allowProfileContext: data.allow_profile_context, allowHistoryPersonalization: data.allow_history_personalization, retainTranscripts: data.retain_transcripts } : defaults }); } catch (error) { return failure(error); }
}
export async function PUT(request: Request) {
  const { userId } = await auth(); if (!userId) return unauthorized();
  const parsed = preferencesSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: { code: "INVALID_SETTINGS", message: "Review the privacy settings and try again." } }, { status: 400 });
  try { const value = parsed.data; const { error } = await getSupabaseAdmin().from("interview_privacy_preferences").upsert({ owner_clerk_user_id: userId, allow_profile_context: value.allowProfileContext, allow_history_personalization: value.allowHistoryPersonalization, retain_transcripts: value.retainTranscripts, retain_audio: false, updated_at: new Date().toISOString() }, { onConflict: "owner_clerk_user_id" }); if (error) throw error; return NextResponse.json({ data: value }); } catch (error) { return failure(error); }
}
