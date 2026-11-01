import { NextResponse } from "next/server";
import {
  VERIFIED_OPPORTUNITIES,
  matchOpportunityWithTwin,
  type CareerOpportunity,
} from "@/lib/career/opportunities-data";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const remoteType = searchParams.get("remoteType");
    const experienceLevel = searchParams.get("experienceLevel");
    const skill = searchParams.get("skill")?.toLowerCase();
    const search = searchParams.get("search")?.toLowerCase();

    let results = [...VERIFIED_OPPORTUNITIES];

    if (category && category !== "all") {
      results = results.filter((o) => o.category === category);
    }

    if (remoteType && remoteType !== "all") {
      results = results.filter((o) => o.remoteType === remoteType);
    }

    if (experienceLevel && experienceLevel !== "all") {
      results = results.filter(
        (o) => o.experienceLevel === experienceLevel || o.experienceLevel === "all_levels"
      );
    }

    if (skill) {
      results = results.filter((o) =>
        o.requiredSkills.some((s) => s.toLowerCase().includes(skill))
      );
    }

    if (search) {
      results = results.filter(
        (o) =>
          o.title.toLowerCase().includes(search) ||
          o.company.toLowerCase().includes(search) ||
          o.description.toLowerCase().includes(search) ||
          o.requiredSkills.some((s) => s.toLowerCase().includes(search))
      );
    }

    return NextResponse.json({
      success: true,
      total: results.length,
      data: results,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to load career opportunities", details: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const twin = body.twin || null;
    const opportunityId = body.opportunityId;

    if (opportunityId) {
      const opp = VERIFIED_OPPORTUNITIES.find((o) => o.id === opportunityId);
      if (!opp) {
        return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
      }
      const match = matchOpportunityWithTwin(opp, twin);
      return NextResponse.json({ success: true, data: { opportunity: opp, match } });
    }

    // Match all opportunities with twin
    const matched = VERIFIED_OPPORTUNITIES.map((opp) => ({
      ...opp,
      match: matchOpportunityWithTwin(opp, twin),
    })).sort((a, b) => b.match.relevanceScore - a.match.relevanceScore);

    return NextResponse.json({ success: true, total: matched.length, data: matched });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to calculate opportunity matches", details: err.message },
      { status: 500 }
    );
  }
}

