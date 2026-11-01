import { describe, expect, it } from "vitest";
import { generateCareerReadinessReport } from "@/lib/career/readiness-engine";
import {
  VERIFIED_OPPORTUNITIES,
  matchOpportunityWithTwin,
} from "@/lib/career/opportunities-data";
import {
  saveUserApplication,
  getUserApplications,
  exportApplicationsToCSV,
} from "@/lib/career/application-tracker";
import {
  saveUserPortfolio,
  getPublicPortfolioBySlugOrId,
} from "@/lib/career/portfolio-engine";
import { analyzeResumeText } from "@/lib/career/resume-engine";
import { issueAchievement, getAchievementById } from "@/lib/career/achievements";
import type { TwinOutput, TwinSourceState } from "@/lib/twin/schema";

describe("Phase 11: End-to-End Career Launch Journey", () => {
  const studentId = `student-e2e-${Date.now()}`;
  const studentName = "Aarav Sharma";
  const targetRole = "Python Developer";

  const mockTwin: TwinOutput = {
    version: 1,
    targetRole,
    profileCompleteness: 85,
    demonstratedSkills: [
      { name: "Python", status: "demonstrated", assessmentScore: 84 },
      { name: "Git", status: "demonstrated" },
    ],
    developingSkills: [{ name: "SQL", status: "developing" }],
    unverifiedSkills: [{ name: "Docker", status: "unverified" }],
    requiredSkills: ["Python", "SQL", "Git", "REST APIs", "Docker"],
    prioritizedGaps: [
      {
        skill: "SQL",
        status: "developing",
        priority: "high",
        reason: "Required for data persistence",
        prerequisites: ["Relational Models"],
        estimatedMinutes: 90,
      },
    ],
    recommendedNextAction: {
      type: "roadmap",
      title: "Complete SQL Lab",
      detail: "Execute SQL queries in sandbox",
      destination: "labs",
    },
    roadmap: { total: 8, completed: 4, nextTasks: [] },
    weekly: { availableHours: 6, plannedMinutes: 180, recordedMinutes: 90, completed: 3, total: 6 },
    assessmentStatus: { attempts: 1, lastCompletedAt: new Date().toISOString(), assessedSkills: ["Python"] },
    evidenceCoverage: { score: 50, demonstrated: 2, required: 4, meaning: "Half of core skills verified" },
    limitations: [],
    dataSources: ["assessments", "projects"],
    calculatedAt: new Date().toISOString(),
  };

  it("completes the 11-step career launch student lifecycle", async () => {
    // Step 1: Generate Career Readiness Report
    const readiness = generateCareerReadinessReport({
      targetRole,
      twin: mockTwin,
      source: null,
      candidateName: studentName,
    });
    expect(readiness.summary.assessedVerifiedCount).toBeGreaterThanOrEqual(0);
    expect(readiness.suggestedMilestones.length).toBe(5);

    // Step 2: Discover Real Opportunities
    const opp = VERIFIED_OPPORTUNITIES.find((o) => o.category === "internship");
    expect(opp).toBeDefined();

    // Step 3: Match Opportunity Requirements with Career Twin
    const match = matchOpportunityWithTwin(opp!, mockTwin);
    expect(match.opportunityId).toBe(opp!.id);
    expect(match.matchedSkills).toContain("Python");
    expect(match.relevanceScore).toBeGreaterThan(0);

    // Step 4: Save Opportunity into Application Tracker
    const app = await saveUserApplication(studentId, {
      opportunityId: opp!.id,
      company: opp!.company,
      role: opp!.title,
      jobUrl: opp!.applicationUrl,
      status: "preparing",
      notes: "Reviewed requirements in Career Twin; working on C++ and testing evidence.",
      nextAction: "Build sample CLI and submit application by deadline",
    });
    expect(app.id).toBeDefined();

    // Step 5: Verify Application in User's Tracker
    const userApps = await getUserApplications(studentId);
    expect(userApps.length).toBe(1);
    expect(userApps[0].company).toBe(opp!.company);

    // Step 6: Export Application History
    const csvExport = exportApplicationsToCSV(userApps);
    expect(csvExport).toContain(opp!.company);

    // Step 7: Issue Achievement for Passing Assessment
    const achievement = await issueAchievement({
      userId: studentId,
      studentName,
      title: "Verified Skill: Python Systems & API Design",
      category: "applied_project",
      courseOrAssessment: "Production API Microservice",
      skills: ["Python", "FastAPI", "Testing & Debugging"],
      score: 90,
    });
    expect(achievement.id).toMatch(/^CT-VERIFY-/);

    // Step 8: Verify Public Certificate Record by ID
    const publicCert = await getAchievementById(achievement.id);
    expect(publicCert).not.toBeNull();
    expect(publicCert?.studentName).toBe(studentName);

    // Step 9: Configure and Publish Student Portfolio
    const portfolio = await saveUserPortfolio(studentId, {
      name: studentName,
      headline: "Junior Backend Developer | Python & APIs",
      targetRole,
      bio: "Computer applications student focused on test-driven Python backends.",
      verifiedSkills: [{ name: "Python", score: 90, verifiedAt: new Date().toISOString(), source: "CareerTwin Assessment" }],
      certificates: [
        {
          id: achievement.id,
          title: achievement.title,
          issueDate: achievement.issueDate,
          verificationUrl: achievement.verificationUrl,
        },
      ],
      privacySettings: { isPublic: true, showEmail: false, showScores: true },
    });
    expect(portfolio.privacySettings.isPublic).toBe(true);

    // Step 10: Verify Public Portfolio is Accessible
    const publicPort = await getPublicPortfolioBySlugOrId(portfolio.slug);
    expect(publicPort).not.toBeNull();
    expect(publicPort?.name).toBe(studentName);

    // Step 11: Run Resume ATS Analysis against the Target Opportunity
    const resumeAnalysis = analyzeResumeText({
      resumeText: `
      SKILLS: Python, Git, Docker, REST APIs
      EXPERIENCE: Built FastAPI student records service with 90% test coverage and SQLite database.
      `,
      targetRole,
      opportunity: opp!,
    });
    expect(resumeAnalysis.extractedSkills).toContain("Python");
    expect(resumeAnalysis.metricsScore).toBeGreaterThan(0);
  });
});

