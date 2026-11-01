import { describe, expect, it } from "vitest";
import {
  VERIFIED_OPPORTUNITIES,
  matchOpportunityWithTwin,
  type CareerOpportunity,
} from "@/lib/career/opportunities-data";
import type { TwinOutput } from "@/lib/twin/schema";

describe("Career Opportunities & Matching Engine (Phase 2)", () => {
  it("contains verified authentic listings with required metadata and sources", () => {
    expect(VERIFIED_OPPORTUNITIES.length).toBeGreaterThanOrEqual(8);

    for (const opp of VERIFIED_OPPORTUNITIES) {
      expect(opp.id).toBeDefined();
      expect(opp.title.length).toBeGreaterThan(3);
      expect(opp.company.length).toBeGreaterThan(2);
      expect(opp.applicationUrl).toMatch(/^https?:\/\//);
      expect(opp.requiredSkills.length).toBeGreaterThan(0);
      expect(opp.source.length).toBeGreaterThan(3);
      expect(opp.lastVerifiedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(["active", "expired", "closing_soon"]).toContain(opp.status);
    }
  });

  it("calculates real evidence matching against Career Twin", () => {
    const opp = VERIFIED_OPPORTUNITIES[0]; // GSoC: Python, Git, C++
    const mockTwin: Partial<TwinOutput> = {
      targetRole: "Python Developer",
      demonstratedSkills: [
        { name: "Python", status: "demonstrated", assessmentScore: 88 },
        { name: "Git", status: "demonstrated" },
      ],
    };

    const match = matchOpportunityWithTwin(opp, mockTwin as TwinOutput);

    expect(match.opportunityId).toBe(opp.id);
    expect(match.matchedSkills).toContain("Python");
    expect(match.matchedSkills).toContain("Git");
    expect(match.missingSkills).toContain("C++");
    expect(match.relevanceScore).toBeGreaterThanOrEqual(50);
    expect(match.recommendedLessons.length).toBeGreaterThan(0);
    expect(match.recommendedProjectOrLab).toBeDefined();
  });
});

