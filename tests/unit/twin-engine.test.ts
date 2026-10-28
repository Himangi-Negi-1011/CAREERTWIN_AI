import { describe, expect, it } from "vitest";
import { calculateCareerTwin } from "@/lib/twin/engine";
import { emptyCareerProfile } from "@/lib/profile/schema";

const source = { evidence: {}, development: { tasks: [], projects: [], practice: [] }, weekly: { settings: { hours: 5, sessionMinutes: 45, days: ["Tue"] as const }, activities: [], attempts: [] }, assessmentEvidence: {} };

describe("Career Twin engine", () => {
  it("returns a valid empty state instead of inventing a role or score", () => {
    const twin = calculateCareerTwin({ profile: emptyCareerProfile, source }, new Date("2026-10-27T10:00:00.000Z"));
    expect(twin.targetRole).toBe("");
    expect(twin.requiredSkills).toEqual([]);
    expect(twin.evidenceCoverage.score).toBeNull();
    expect(twin.recommendedNextAction.type).toBe("profile");
  });

  it("distinguishes demonstrated, developing, assessed, and unverified skills", () => {
    const profile = { ...emptyCareerProfile, personal: { ...emptyCareerProfile.personal, fullName: "Alex", status: "student" as const }, interests: { ...emptyCareerProfile.interests, targetRole: "AI/ML Engineer" }, skills: [{ id: "python", name: "Python", category: "", proficiency: "beginner" as const, learning: true }] };
    const twin = calculateCareerTwin({ profile, source: { ...source, evidence: { "AI/ML Engineer": { records: { Python: { status: "learning", evidence: "" }, "Data preparation": { status: "demonstrated", evidence: "Cleaned and documented a public dataset." } }, customSkills: [] } }, assessmentEvidence: { Python: { assessmentId: "123e4567-e89b-12d3-a456-426614174000", score: 100, correct: 1, total: 1, completedAt: "2026-10-27T09:00:00.000Z" } } } }, new Date("2026-10-27T10:00:00.000Z"));
    expect(twin.demonstratedSkills.map((item) => item.name)).toContain("Data preparation");
    expect(twin.developingSkills).toContainEqual(expect.objectContaining({ name: "Python", status: "assessed", assessmentScore: 100 }));
    expect(twin.unverifiedSkills.map((item) => item.name)).toContain("Model evaluation");
    expect(twin.evidenceCoverage.score).toBe(17);
    expect(twin.prioritizedGaps[0].reason).toMatch(/short assessment.*practical evidence/i);
  });

  it("derives roadmap and weekly progress only from recorded completion", () => {
    const profile = { ...emptyCareerProfile, interests: { ...emptyCareerProfile.interests, targetRole: "Data Analyst" } };
    const twin = calculateCareerTwin({ profile, source: { ...source, development: { tasks: [{ id: "t1", title: "Practise joins", detail: "", done: true, status: "complete", createdAt: "" }, { id: "t2", title: "Clean a dataset", detail: "", done: false, status: "planned", createdAt: "" }], projects: [], practice: [] }, weekly: { settings: { hours: 4, sessionMinutes: 60, days: ["Tue"] }, activities: [{ id: "w1", title: "Practise joins", skill: "SQL", objective: "", plannedDate: "2026-10-27", estimatedMinutes: 60, actualMinutes: 45, completionCriteria: "", status: "complete" }], attempts: [] } } });
    expect(twin.roadmap).toMatchObject({ total: 2, completed: 1 });
    expect(twin.roadmap.nextTasks[0].title).toBe("Clean a dataset");
    expect(twin.weekly).toMatchObject({ availableHours: 4, plannedMinutes: 60, recordedMinutes: 45, completed: 1, total: 1 });
  });
});
