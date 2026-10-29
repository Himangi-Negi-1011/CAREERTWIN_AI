import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getCourseJob } from "@/lib/learning/repository";
import { resumeCourseJob } from "@/lib/learning/course-engine";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Sign in to view course status." } }, { status: 401 });
  }

  const { jobId } = await params;
  const job = await getCourseJob(jobId);
  if (!job) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Course generation job not found." } }, { status: 404 });
  }

  if (job.ownerId !== userId) {
    return NextResponse.json({ error: { code: "FORBIDDEN", message: "Access denied to this course job." } }, { status: 403 });
  }

  return NextResponse.json({ data: job });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Sign in to manage course jobs." } }, { status: 401 });
  }

  const { jobId } = await params;
  const body = await request.json().catch(() => ({}));
  const action = body.action || "resume";

  if (action === "resume") {
    try {
      const updated = await resumeCourseJob(jobId, userId);
      return NextResponse.json({ data: updated });
    } catch (err) {
      return NextResponse.json(
        { error: { code: "RESUME_FAILED", message: err instanceof Error ? err.message : "Failed to resume course generation." } },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: { code: "BAD_REQUEST", message: `Unknown action: ${action}` } }, { status: 400 });
}
