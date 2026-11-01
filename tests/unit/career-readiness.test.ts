import { describe, expect, it } from "vitest";
import { generateCareerReadinessReport } from "@/lib/career/readiness-engine";
import type { TwinOutput, TwinSourceState } from "@/lib/twin/schema";

describe("Career Readiness Engine (Phase 1)", () => {
  it("generates an evidence-backed readiness report without fake percentages or false guarantees", () => {
    const mockTwin: TwinOutput = {
      version: 1,
      targetRole: "Python Developer",
      profileCompleteness: 90,
      demonstratedSkills: [
        { name: "Python", status: "demonstrated", assessmentScore: 85 },
      ],
      developingSkills: [{ name: "SQL", status: "developing" }],
      unverifiedSkills: [{ name: "Docker", status: "unverified" }],
      requiredSkills: ["Python", "SQL", "Git", "REST APIs", "Docker"],
      prioritizedGaps: [
        {
          skill: "Docker",
          status: "unverified",
          priority: "high",
          reason: "Required for production deployment",
          prerequisites: ["Linux"],
          estimatedMinutes: 120,
        },
      ],
      recommendedNextAction: {
        type: "roadmap",
        title: "Study Docker",
        detail: "Start containerization lessons",
        destination: "learning",
      },
      roadmap: { total: 10, completed: 5, nextTasks: [] },
      weekly: { availableHours: 5, plannedMinutes: 120, recordedMinutes: 60, completed: 2, total: 4 },
      assessmentStatus: { attempts: 2, lastCompletedAt: new Date().toISOString(), assessedSkills: ["Python"] },
      evidenceCoverage: { score: 60, demonstrated: 3, required: 5, meaning: "Moderate evidence coverage" },
      limitations: [],
      dataSources: ["assessment", "evidence"],
      calculatedAt: new Date().toISOString(),
    };

    const mockSource: TwinSourceState = {
      evidence: {
        "Python Developer": {
          records: {
            Git: { status: "demonstrated", evidence: "Used Git in college team project" },
          },
          customSkills: [],
        },
      },
      development: {
        tasks: [],
        projects: [
          {
            id: "p1",
            title: "Student Gradebook API",
            outcome: "Built FastAPI microservice with automated test suite",
            status: "complete",
            createdAt: new Date().toISOString(),
          },
        ],
        practice: [],
      },
      weekly: {
        settings: { hours: 5, sessionMinutes: 45, days: ["Tue", "Thu"] },
        activities: [],
        attempts: [],
      },
      assessmentEvidence: {
        Python: {
          assessmentId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
          score: 85,
          correct: 17,
          total: 20,
          completedAt: new Date().toISOString(),
        },
      },
      learning: { enrollments: [], lessonProgress: [], quizAttempts: [], masteryEvidence: [] },
    };

    const report = generateCareerReadinessReport({
      targetRole: "Python Developer",
      twin: mockTwin,
      source: mockSource,
      candidateName: "Aarav Sharma",
    });

    expect(report.targetRole).toBe("Python Developer");
    expect(report.candidateName).toBe("Aarav Sharma");

    // 1. Clearly distinguishes assessed skills from self-reported skills
    expect(report.assessedSkills.length).toBeGreaterThanOrEqual(1);
    expect(report.assessedSkills[0].name).toBe("Python");
    expect(report.assessedSkills[0].verified).toBe(true);

    expect(report.selfReportedSkills.length).toBeGreaterThanOrEqual(1);
    expect(report.selfReportedSkills[0].name).toBe("Git");

    // 2. Contains demonstrated capabilities from projects and tests
    expect(report.demonstratedCapabilities.some((d) => d.evidenceType === "project")).toBe(true);
    expect(report.demonstratedCapabilities.some((d) => d.evidenceType === "assessment")).toBe(true);

    // 3. Recommends guided projects and resume improvements
    expect(report.recommendedProjects.length).toBeGreaterThanOrEqual(2);
    expect(report.resumeImprovements.length).toBeGreaterThanOrEqual(2);
    expect(report.suggestedMilestones.length).toBe(5);

    // 4. Honest summary statement with no false guarantees
    expect(report.summary.readinessStatement).not.toContain("100% ready");
    expect(report.summary.readinessStatement).not.toContain("guarantee");
  });
});

