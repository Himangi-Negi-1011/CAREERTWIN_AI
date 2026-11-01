import { NextResponse } from "next/server";
import { getAchievementById } from "@/lib/career/achievements";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Certificate ID is required." }, { status: 400 });
    }

    const achievement = await getAchievementById(id);
    if (!achievement) {
      return NextResponse.json(
        { error: "Certificate verification record not found or expired." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      verified: true,
      data: achievement,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to verify certificate", details: err.message },
      { status: 500 }
    );
  }
}

