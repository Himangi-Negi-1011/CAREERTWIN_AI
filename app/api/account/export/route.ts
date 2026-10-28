import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { DatabaseConfigurationError, getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Sign in to export your data." } }, { status: 401 });
  try {
    const db = getSupabaseAdmin();
    const tables = ["career_profiles", "career_twin_states", "career_roadmap_tasks", "career_assessment_sessions", "interview_privacy_preferences", "interview_sessions", "interview_questions", "interview_assessments", "interview_roadmap_approvals"] as const;
    const results = await Promise.all(tables.map(async (table) => { const { data, error } = await db.from(table).select("*").eq("owner_clerk_user_id", userId); if (error) throw error; return [table, data ?? []] as const; }));
    const body = JSON.stringify({ format: "careertwin-user-export-v1", exportedAt: new Date().toISOString(), data: Object.fromEntries(results) }, null, 2);
    return new NextResponse(body, { headers: { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": `attachment; filename="careertwin-export-${new Date().toISOString().slice(0,10)}.json"`, "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Account export failed", error instanceof Error ? error.name : "UnknownError");
    return NextResponse.json({ error: { code: error instanceof DatabaseConfigurationError ? "DATABASE_NOT_CONFIGURED" : "EXPORT_FAILED", message: "Your data export could not be prepared securely." } }, { status: 503 });
  }
}
