import { NextResponse } from "next/server";
import { analyzeResumeText } from "@/lib/career/resume-engine";
import { VERIFIED_OPPORTUNITIES } from "@/lib/career/opportunities-data";

export async function POST(req: Request) {
  try {
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

