import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { analyzeResumeText } from "@/lib/career/resume-engine";
import { VERIFIED_OPPORTUNITIES } from "@/lib/career/opportunities-data";
import { checkRateLimit, getClientIdentifier } from "@/lib/security/rate-limit";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Sign in to analyze resumes." } },
        { status: 401 }
      );
    }

    const clientId = getClientIdentifier(req, session.userId);
    const rateLimitResult = checkRateLimit(clientId, {
      limit: 15,
      windowMs: 60_000,
      prefix: "resume-analyze",
    });

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many resume analysis requests. Please wait a minute before analyzing again." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimitResult.retryAfterSeconds),
            "X-RateLimit-Limit": String(rateLimitResult.limit),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    const body = await req.json();
    const { resumeText, targetRole, opportunityId } = body;

    if (!resumeText || typeof resumeText !== "string" || resumeText.trim().length < 20) {
      return NextResponse.json(
        { error: "Please provide resume content of at least 20 characters to analyze." },
        { status: 400 }
      );
    }

    const opportunity = opportunityId
      ? VERIFIED_OPPORTUNITIES.find((o) => o.id === opportunityId)
      : undefined;

    const analysis = analyzeResumeText({
      resumeText,
      targetRole: targetRole || "Software Developer",
      opportunity,
    });

    return NextResponse.json({ success: true, data: analysis });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to analyze resume", details: err.message },
      { status: 500 }
    );
  }
}

