import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import {
  getUserPortfolio,
  saveUserPortfolio,
  studentPortfolioSchema,
} from "@/lib/career/portfolio-engine";

export async function GET() {
  try {
    const user = await currentUser().catch(() => null);
    if (!user?.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Sign in to access your portfolio." } },
        { status: 401 }
      );
    }

    const portfolio = await getUserPortfolio(user.id);
    return NextResponse.json({ success: true, data: portfolio });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to load student portfolio", details: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await currentUser().catch(() => null);
    if (!user?.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Sign in to save your portfolio." } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const saved = await saveUserPortfolio(user.id, body);

    return NextResponse.json({ success: true, data: saved }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to save portfolio", details: err.message },
      { status: 500 }
    );
  }
}

