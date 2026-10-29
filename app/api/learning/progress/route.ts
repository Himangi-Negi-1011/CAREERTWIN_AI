import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getUserProgress,
  recordLessonCompletion,
  listCourseJobsForUser,
} from "@/lib/learning/repository";

const progressUpdateSchema = z.object({
  curriculumId: z.string().trim().min(1).max(120),
  lessonId: z.string().trim().min(1).max(100),
  skillName: z.string().trim().min(1).max(120),
  totalLessons: z.number().int().min(1).default(4),
});

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Sign in to view learning progress." } }, { status: 401 });
  }

  const url = new URL(request.url);
  const curriculumId = url.searchParams.get("curriculumId");

  if (curriculumId) {
    const progress = await getUserProgress(userId, curriculumId);
    return NextResponse.json({ data: progress });
  }

  // Return all course jobs for user
  const jobs = await listCourseJobsForUser(userId);
  return NextResponse.json({ data: { enrolledCourses: jobs } });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Sign in to update learning progress." } }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = progressUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "INVALID_PROGRESS_UPDATE", message: "Invalid progress update parameters.", details: parsed.error.flatten().fieldErrors } },
      { status: 400 }
    );
  }

  const { curriculumId, lessonId, skillName, totalLessons } = parsed.data;
  const updated = await recordLessonCompletion(userId, curriculumId, skillName, lessonId, totalLessons);

  return NextResponse.json({ data: updated });
}
