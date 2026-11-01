import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

const feedbackSchema = z.object({
  category: z.enum([
    "confusing_lesson",
    "incorrect_explanation",
    "broken_video",
    "difficult_exercise",
    "incorrect_question",
    "broken_navigation",
    "ai_tutor",
    "general",
  ]),
  message: z.string().min(5).max(2000),
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

    const newFeedback: StudentFeedbackRecord = {
      id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId,
      userEmail,
      category: parsed.data.category,
      message: parsed.data.message,
      context: parsed.data.context,
      rating: parsed.data.rating,
      createdAt: new Date().toISOString(),
      status: "new",
    };

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
    const feedbackList = await readStoredFeedback();
    return NextResponse.json({
      success: true,
      total: feedbackList.length,
      data: feedbackList,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to retrieve student feedback", detail: error.message },
      { status: 500 }
    );
  }
}
