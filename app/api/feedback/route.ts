import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

async function getSupabaseSafe() {
  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    return getSupabaseAdmin();
  } catch {
    return null;
  }
}

function scrubSensitiveData(text: string): string {
  if (!text) return "";
  return text
    .replace(/(?:api[_-]?key|secret|password|authorization|token)\s*[:=]\s*([^\s,;]+)/gi, "$1=[REDACTED]")
    .replace(/ghp_[a-zA-Z0-9]{20,}/g, "[REDACTED_TOKEN]")
    .replace(/eyJ[a-zA-Z0-9_-]{15,}\.[a-zA-Z0-9_-]{15,}\.[a-zA-Z0-9_-]{15,}/g, "[REDACTED_JWT]");
}

const feedbackSchema = z.object({
  category: z.enum([
    // Phase 15 Standardized Categories
    "login_onboarding",
    "dashboard_navigation",
    "course_quality",
    "lesson_explanations",
    "learning_studio_usability",
    "ai_tutor_quality",
    "practical_assignments",
    "mock_exams_grading",
    "project_recommendations",
    "mobile_experience",
    "technical_errors",
    "feature_suggestions",
    // Legacy Categories (Backwards Compatibility)
    "confusing_lesson",
    "incorrect_explanation",
    "broken_video",
    "difficult_exercise",
    "incorrect_question",
    "broken_navigation",
    "ai_tutor",
    "general",
  ]),
  message: z.string().min(5).max(3000),
  whatWereYouTryingToDo: z.string().max(1000).optional(),
  whatDidYouExpect: z.string().max(1000).optional(),
  whatActuallyHappened: z.string().max(1000).optional(),
  severity: z.enum(["p0_blocker", "p1_high", "p2_medium", "p3_low"]).optional(),
  screenshotUrl: z.string().url().max(1000).optional(),
  context: z
    .object({
      page: z.string().optional(),
      courseSlug: z.string().optional(),
      lessonId: z.string().optional(),
      questionId: z.string().optional(),
    })
    .optional(),
  rating: z.number().int().min(1).max(5).optional(),
});

export interface StudentFeedbackRecord {
  id: string;
  userId: string;
  userEmail?: string;
  category: string;
  message: string;
  whatWereYouTryingToDo?: string;
  whatDidYouExpect?: string;
  whatActuallyHappened?: string;
  severity?: "p0_blocker" | "p1_high" | "p2_medium" | "p3_low";
  screenshotUrl?: string;
  context?: {
    page?: string;
    courseSlug?: string;
    lessonId?: string;
    questionId?: string;
  };
  rating?: number;
  createdAt: string;
  status: "new" | "reviewed" | "resolved";
}

const FEEDBACK_FILE = path.join(process.cwd(), ".data", "student-feedback.json");

async function readStoredFeedback(): Promise<StudentFeedbackRecord[]> {
  try {
    const raw = await fs.readFile(FEEDBACK_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeStoredFeedback(records: StudentFeedbackRecord[]): Promise<void> {
  try {
    await fs.mkdir(path.dirname(FEEDBACK_FILE), { recursive: true });
    await fs.writeFile(FEEDBACK_FILE, JSON.stringify(records, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist feedback locally:", err);
  }
}

export async function POST(req: Request) {
  try {
    const user = await currentUser().catch(() => null);
    const userId = user?.id || "guest-anonymous";
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;

    const body = await req.json();
    const parsed = feedbackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid feedback payload", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const sanitizedMessage = scrubSensitiveData(parsed.data.message);
    const sanitizedTryingToDo = parsed.data.whatWereYouTryingToDo ? scrubSensitiveData(parsed.data.whatWereYouTryingToDo) : undefined;
    const sanitizedExpected = parsed.data.whatDidYouExpect ? scrubSensitiveData(parsed.data.whatDidYouExpect) : undefined;
    const sanitizedHappened = parsed.data.whatActuallyHappened ? scrubSensitiveData(parsed.data.whatActuallyHappened) : undefined;

    const newFeedback: StudentFeedbackRecord = {
      id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId,
      userEmail,
      category: parsed.data.category,
      message: sanitizedMessage,
      whatWereYouTryingToDo: sanitizedTryingToDo,
      whatDidYouExpect: sanitizedExpected,
      whatActuallyHappened: sanitizedHappened,
      severity: parsed.data.severity || "p3_low",
      screenshotUrl: parsed.data.screenshotUrl,
      context: parsed.data.context,
      rating: parsed.data.rating,
      createdAt: new Date().toISOString(),
      status: "new",
    };

    // 1. Cloud persistence in Supabase if configured
    try {
      const db = await getSupabaseSafe();
      if (db) {
        await db.from("student_feedback").insert({
          id: newFeedback.id,
          owner_clerk_user_id: userId,
          category: newFeedback.category,
          message: newFeedback.message,
          rating: newFeedback.rating ?? null,
          context: {
            ...newFeedback.context,
            whatWereYouTryingToDo: newFeedback.whatWereYouTryingToDo,
            whatDidYouExpect: newFeedback.whatDidYouExpect,
            whatActuallyHappened: newFeedback.whatActuallyHappened,
            severity: newFeedback.severity,
            screenshotUrl: newFeedback.screenshotUrl,
          },
          status: "new",
          created_at: newFeedback.createdAt,
        });
      }
    } catch (e) {
      console.warn("Supabase feedback insert skipped or failed:", e);
    }

    // 2. Durable local storage fallback
    const existing = await readStoredFeedback();
    const updated = [newFeedback, ...existing];
    await writeStoredFeedback(updated);

    return NextResponse.json(
      { success: true, message: "Feedback submitted successfully", data: newFeedback },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error while saving feedback", detail: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await currentUser().catch(() => null);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Sign in to view feedback." },
        { status: 401 }
      );
    }

    const userEmail = user.emailAddresses?.[0]?.emailAddress || "";
    const isDev = process.env.NODE_ENV !== "production";
    const isAdmin = isDev || userEmail.includes("admin") || userEmail.endsWith("@careertwin.ai");

    // 1. Try Supabase first if configured
    try {
      const db = await getSupabaseSafe();
      if (db) {
        let query = db.from("student_feedback").select("*").order("created_at", { ascending: false });
        if (!isAdmin) {
          query = query.eq("owner_clerk_user_id", user.id);
        }
        const { data, error } = await query;
        if (!error && Array.isArray(data)) {
          return NextResponse.json({
            success: true,
            total: data.length,
            data: data.map((d) => ({
              id: d.id,
              userId: d.owner_clerk_user_id,
              category: d.category,
              message: d.message,
              rating: d.rating,
              context: d.context,
              status: d.status,
              createdAt: d.created_at,
            })),
          });
        }
      }
    } catch {
      // Fallback to local file
    }

    // 2. Fallback to local storage (strictly scoped to user unless admin)
    const feedbackList = await readStoredFeedback();
    const filtered = isAdmin
      ? feedbackList
      : feedbackList.filter((f) => f.userId === user.id);

    return NextResponse.json({
      success: true,
      total: filtered.length,
      data: filtered,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to retrieve student feedback", detail: error.message },
      { status: 500 }
    );
  }
}


