import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { generateCareerReadinessReport } from "@/lib/career/readiness-engine";
import type { TwinOutput, TwinSourceState } from "@/lib/twin/schema";
import type { CareerProfileData } from "@/lib/profile/schema";

export async function GET(req: Request) {
  try {
    const user = await currentUser().catch(() => null);
    if (!user?.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Sign in to access your career readiness report." } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const targetRole = searchParams.get("role") || "";

    // The readiness engine takes twin, source, and profile
    const report = generateCareerReadinessReport({
      targetRole,
      twin: null,
      source: null,
      profile: null,
      candidateName: user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "Student Scholar",
    });

    return NextResponse.json({ success: true, data: report });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to generate career readiness report", details: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await currentUser().catch(() => null);
    if (!user?.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Sign in to calculate your career readiness report." } },
        { status: 401 }
      );
    }
    const body = await req.json().catch(() => ({}));

    const twin = body.twin as TwinOutput | null;
    const source = body.source as TwinSourceState | null;
    const profile = body.profile as Partial<CareerProfileData> | null;
    const targetRole = body.targetRole || twin?.targetRole || "";

    const candidateName =
      body.candidateName ||
      (user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "Student Scholar");

    const report = generateCareerReadinessReport({
      targetRole,
      twin,
      source,
      profile,
      candidateName,
    });

    return NextResponse.json({ success: true, data: report });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to calculate career readiness report", details: err.message },
      { status: 500 }
    );
  }
}
