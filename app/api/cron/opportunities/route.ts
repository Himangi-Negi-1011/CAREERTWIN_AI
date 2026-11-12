import { NextResponse } from "next/server";
import { VERIFIED_OPPORTUNITIES, type CareerOpportunity } from "@/lib/career/opportunities-data";

export async function GET(req: Request) {
  return handleRefresh(req);
}

export async function POST(req: Request) {
  return handleRefresh(req);
}

async function handleRefresh(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // If CRON_SECRET is configured, enforce authorized bearer token
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const refreshedAt = now.toISOString();

  let activeCount = 0;
  let closingSoonCount = 0;
  let expiredCount = 0;

  const refreshedList: CareerOpportunity[] = VERIFIED_OPPORTUNITIES.map((opp) => {
    let status = opp.status;
    if (opp.applicationDeadline) {
      const deadline = new Date(opp.applicationDeadline);
      const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        status = "expired";
        expiredCount++;
      } else if (diffDays <= 14) {
        status = "closing_soon";
        closingSoonCount++;
      } else {
        status = "active";
        activeCount++;
      }
    } else {
      activeCount++;
    }

    return {
      ...opp,
      status,
      lastVerifiedDate: now.toISOString().split("T")[0],
    };
  });

  return NextResponse.json({
    ok: true,
    message: "Career opportunities daily refresh executed successfully.",
    refreshedAt,
    totalCount: refreshedList.length,
    activeCount,
    closingSoonCount,
    expiredCount,
    data: refreshedList,
  });
}
