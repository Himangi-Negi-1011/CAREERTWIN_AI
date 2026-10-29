import { describe, expect, it } from "vitest";
import { careerProfileSchema, emptyCareerProfile, type CareerProfileData } from "@/lib/profile/schema";
import { calculateCareerTwin } from "@/lib/twin/engine";
import { twinOutputSchema, twinSourceStateSchema } from "@/lib/twin/schema";

describe("Career Twin End-to-End Creation and Lifecycle", () => {
  const sampleOnboardingData: CareerProfileData = {
    ...emptyCareerProfile,
    personal: {
      fullName: "Priya Sharma",
      status: "student",
      headline: "Aspiring Cloud and AI Security Engineer",
      location: "Bangalore, India",
      bio: "Passionate about cloud architecture and automated security scanning.",
      photoUrl: "",
    },
    education: [
      {
        id: "edu-1",
        institution: "National Institute of Technology",
        degree: "B.Tech",
        field: "Computer Science",
        course: "Information Security",
        startYear: "2022",
        graduationYear: "2026",
        status: "in-progress",
        grade: "8.8 CGPA",
      },
    ],
    skills: [
      { id: "sk-1", name: "Python", category: "Programming", proficiency: "intermediate", learning: false },
      { id: "sk-2", name: "Linux", category: "Cybersecurity", proficiency: "beginner", learning: true },
      { id: "sk-3", name: "Cloud Computing", category: "Cloud and DevOps", proficiency: "learning", learning: true },
    ],
    projects: [
      {
        id: "proj-1",
        kind: "project",
        title: "Cloud Vulnerability Scanner",
        description: "Built an automated scanner checking AWS S3 bucket policies and IAM least privilege.",
        technologies: "Python, Boto3, AWS CLI",
        contribution: "Lead developer",
        url: "https://github.com/example/cloud-sec-scan",
        status: "complete",
      },
    ],
    resume: {
      fileName: "Priya_Sharma_Resume.pdf",
      size: 142000,
      status: "selected",
      storagePath: "",
    },
    interests: {
      desiredCareer: "Cybersecurity & Cloud",
      targetRole: "Cybersecurity Analyst",
      industry: "Information Technology",
      experienceLevel: "Entry Level",
      workArrangement: "Hybrid",
      preferredLocation: "Bangalore",
      goals: "Secure an entry-level analyst position in cloud and offensive/defensive security.",
    },
    currentStep: 7,
    completedSteps: [1, 2, 3, 4, 5, 6, 7],
  };

  it("1. validates complete user onboarding profile without loss of required information", () => {
    const parseResult = careerProfileSchema.safeParse(sampleOnboardingData);
    expect(parseResult.success).toBe(true);
    if (!parseResult.success) return;

    expect(parseResult.data.personal.fullName).toBe("Priya Sharma");
    expect(parseResult.data.interests.targetRole).toBe("Cybersecurity Analyst");
    expect(parseResult.data.education).toHaveLength(1);
    expect(parseResult.data.skills).toHaveLength(3);
    expect(parseResult.data.projects).toHaveLength(1);
  });

  it("2. generates a deterministic, verified AI Career Twin from validated profile", () => {
    const source = twinSourceStateSchema.parse({
      evidence: {
        "Cybersecurity Analyst": {
          records: {
            "Incident response": { status: "learning", evidence: "" },
            "Vulnerability management": {
              status: "demonstrated",
              evidence: "Engineered AWS IAM and S3 security audits with verifiable GitHub repository.",
            },
          },
          customSkills: [],
        },
      },
      development: {
        tasks: [
          {
            id: "task-1",
            title: "Simulate SIEM Log Analysis",
            detail: "Analyze simulated authentication logs for brute-force attacks.",
            done: false,
            status: "in-progress",
            skill: "Incident response",
            estimatedMinutes: 60,
            createdAt: new Date().toISOString(),
          },
        ],
        projects: [],
        practice: [],
      },
      weekly: {
        settings: { hours: 10, sessionMinutes: 60, days: ["Mon", "Wed", "Fri"] },
        activities: [],
        attempts: [],
      },
      assessmentEvidence: {},
    });

    const twin = calculateCareerTwin({ profile: sampleOnboardingData, source });
    const validated = twinOutputSchema.parse(twin);

    // Target role matches onboarding
    expect(validated.targetRole).toBe("Cybersecurity Analyst");
    expect(validated.profileCompleteness).toBeGreaterThanOrEqual(80);

    // Demonstrated vs developing skills
    expect(validated.demonstratedSkills.map((s) => s.name)).toContain("Vulnerability management");
    expect(validated.developingSkills.map((s) => s.name)).toContain("Incident response");

    // Prioritized skill gaps
    expect(validated.prioritizedGaps.length).toBeGreaterThan(0);
    expect(validated.prioritizedGaps[0].priority).toBe("high");

    // Actionable recommended next action
    expect(validated.recommendedNextAction).toBeDefined();
    expect(validated.recommendedNextAction.title).toBeTruthy();
    expect(validated.recommendedNextAction.destination).toBeTruthy();

    // Roadmap derived from tasks
    expect(validated.roadmap.total).toBe(1);
    expect(validated.roadmap.nextTasks[0].title).toBe("Simulate SIEM Log Analysis");

    // Evidence coverage calculation
    expect(validated.evidenceCoverage.demonstrated).toBe(1);
    expect(validated.evidenceCoverage.required).toBeGreaterThan(1);
  });

  it("3. enforces strict user isolation preventing cross-user data leakage", () => {
    const userAProfile: CareerProfileData = {
      ...sampleOnboardingData,
      personal: { ...sampleOnboardingData.personal, fullName: "User Alpha" },
      interests: { ...sampleOnboardingData.interests, targetRole: "Backend Developer" },
    };
    const userBProfile: CareerProfileData = {
      ...sampleOnboardingData,
      personal: { ...sampleOnboardingData.personal, fullName: "User Beta" },
      interests: { ...sampleOnboardingData.interests, targetRole: "Data Analyst" },
    };

    const emptySource = twinSourceStateSchema.parse({});
    const twinA = calculateCareerTwin({ profile: userAProfile, source: emptySource });
    const twinB = calculateCareerTwin({ profile: userBProfile, source: emptySource });

    expect(twinA.targetRole).toBe("Backend Developer");
    expect(twinB.targetRole).toBe("Data Analyst");
    expect(twinA.requiredSkills).not.toEqual(twinB.requiredSkills);
  });

  it("4. handles incomplete profile gracefully with honest actionable prompts", () => {
    const unselectedRoleProfile: CareerProfileData = {
      ...sampleOnboardingData,
      interests: { ...sampleOnboardingData.interests, targetRole: "" },
    };

    const emptySource = twinSourceStateSchema.parse({});
    const twin = calculateCareerTwin({ profile: unselectedRoleProfile, source: emptySource });

    expect(twin.targetRole).toBe("");
    expect(twin.evidenceCoverage.score).toBeNull();
    expect(twin.recommendedNextAction.type).toBe("profile");
    expect(twin.recommendedNextAction.destination).toBe("/onboarding");
  });
});
