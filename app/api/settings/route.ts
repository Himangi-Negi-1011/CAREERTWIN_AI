import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { DatabaseConfigurationError, getSupabaseAdmin } from "@/lib/supabase/admin";
import { appSettingsSchema, type AppSettings, defaultSettings } from "@/lib/settings/schema";

const DATA_DIR = path.join(process.cwd(), ".data", "settings");

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // Ignore if exists
  }
}

async function readLocalSettings(userId: string): Promise<AppSettings | null> {
  try {
    await ensureDataDir();
    const filePath = path.join(DATA_DIR, `${encodeURIComponent(userId)}.json`);
    const content = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(content);
    return appSettingsSchema.parse(parsed);
  } catch {
    return null;
  }
}

async function writeLocalSettings(userId: string, settings: AppSettings): Promise<void> {
  try {
    await ensureDataDir();
    const filePath = path.join(DATA_DIR, `${encodeURIComponent(userId)}.json`);
    await fs.writeFile(filePath, JSON.stringify(settings, null, 2), "utf-8");
  } catch (err) {
    console.error("Local settings write error:", err);
  }
}

export async function GET() {
  let userId: string | null = null;
  try {
    const authObj = await auth();
    if (authObj && authObj.userId) {
      userId = authObj.userId;
    }
  } catch {
    userId = null;
  }

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Try local data file first
  const local = await readLocalSettings(userId);
  if (local) {
    return NextResponse.json({ data: local });
  }

  // 2. Try Supabase if configured
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("interview_privacy_preferences")
      .select("allow_profile_context,allow_history_personalization,retain_transcripts")
      .eq("owner_clerk_user_id", userId)
      .maybeSingle();

    if (!error && data) {
      const merged: AppSettings = {
        ...defaultSettings,
        allowProfileContext: data.allow_profile_context ?? false,
        allowHistoryPersonalization: data.allow_history_personalization ?? false,
        retainTranscripts: data.retain_transcripts ?? true,
      };
      await writeLocalSettings(userId, merged);
      return NextResponse.json({ data: merged });
    }
  } catch {
    // Supabase not available or unconfigured
  }

  return NextResponse.json({ data: defaultSettings });
}

export async function PUT(request: Request) {
  let userId: string | null = null;
  try {
    const authObj = await auth();
    if (authObj && authObj.userId) {
      userId = authObj.userId;
    }
  } catch {
    userId = null;
  }

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = appSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_SETTINGS",
          message: "Review the highlighted settings and try again.",
          details: parsed.error.flatten().fieldErrors,
        },
      },
      { status: 400 }
    );
  }

  const settings = parsed.data;

  // Persist locally for instant resilience
  await writeLocalSettings(userId, settings);

  // Sync to Supabase if available
  try {
    await getSupabaseAdmin()
      .from("interview_privacy_preferences")
      .upsert(
        {
          owner_clerk_user_id: userId,
          allow_profile_context: settings.allowProfileContext,
          allow_history_personalization: settings.allowHistoryPersonalization,
          retain_transcripts: settings.retainTranscripts,
          retain_audio: false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "owner_clerk_user_id" }
      );
  } catch {
    // Non-blocking fallback
  }

  return NextResponse.json({ data: settings, message: "Settings saved successfully." });
}
