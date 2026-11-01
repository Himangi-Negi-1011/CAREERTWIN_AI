import type { TwinOutput, TwinSourceState } from "@/lib/twin/schema";
import type { CareerProfileData } from "@/lib/profile/schema";

export interface DemonstratedCapability {
  capability: string;
  evidenceType: "assessment" | "project" | "lab" | "self-review";
  details: string;
  source: string;
}

export interface AssessedSkillItem {
  name: string;
  score: number;
  source: string;
  verified: boolean;
}

export interface SkillNeedItem {
  name: string;
  priority: "high" | "medium" | "low";
  reason: string;
  recommendedCourseSlug?: string;
  recommendedLabTrack?: string;
}

export interface ProjectRecommendation {
  id: string;
  title: string;
  skill: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  deliverable: string;
  reason: string;
}

export interface CareerReadinessReport {
  generatedAt: string;
  targetRole: string;
  candidateName: string;
  academicBackground: {
    degrees: string[];
    institutions: string[];
    detailsSummary: string;
  };
  summary: {
    totalRequiredSkills: number;
    assessedVerifiedCount: number;
    projectVerifiedCount: number;
    selfReportedCount: number;
    skillsNeedingWorkCount: number;
    readinessStatement: string;
  };
  demonstratedCapabilities: DemonstratedCapability[];
  assessedSkills: AssessedSkillItem[];
  selfReportedSkills: Array<{ name: string; notes: string }>;
  skillsNeedingDevelopment: SkillNeedItem[];
  recommendedProjects: ProjectRecommendation[];
  resumeImprovements: string[];
  interviewPrepRequirements: string[];
  suggestedMilestones: Array<{
    step: number;
    title: string;
    action: string;
    destination: string;
  }>;
  suitableEntryOpportunities: Array<{
    title: string;
    type: "Internship" | "Junior Role" | "Graduate Trainee" | "Apprenticeship" | "Open-Source Fellow";
    rationale: string;
    focusSkills: string[];
  }>;
}

const ROLE_COURSE_MAP: Record<string, string> = {
  python: "python",
  javascript: "javascript",
  typescript: "typescript",
  sql: "sql",
  react: "javascript",
  "cloud computing": "cloud-computing",
  cybersecurity: "cybersecurity",
  "power bi": "power-bi",
  c: "c-programming",
  cpp: "cpp",
  "c++": "cpp",
  csharp: "csharp",
  "c#": "csharp",
  go: "go",
  java: "java",
  rust: "rust",
  php: "php",
};

export function generateCareerReadinessReport(params: {
  targetRole: string;
  twin: TwinOutput | null;
  source: TwinSourceState | null;
  profile?: Partial<CareerProfileData> | null;
  candidateName?: string;
}): CareerReadinessReport {
  const { targetRole, twin, source, profile, candidateName = "Student" } = params;
  const role = targetRole || twin?.targetRole || "Software Engineer";

  // 1. Academic Background
  const degrees: string[] = [];
  const institutions: string[] = [];
  if (profile?.education && Array.isArray(profile.education)) {
    for (const edu of profile.education) {
      if (edu.degree) degrees.push(edu.degree);
      if (edu.institution) institutions.push(edu.institution);
    }
  }

  // 2. Assess Capabilities & Distinguish Evidence Types
  const demonstratedCapabilities: DemonstratedCapability[] = [];
  const assessedSkills: AssessedSkillItem[] = [];
  const selfReportedSkills: Array<{ name: string; notes: string }> = [];

  // Assessment evidence from quizzes and mock tests
  if (source?.assessmentEvidence) {
    for (const [skillName, record] of Object.entries(source.assessmentEvidence)) {
      const verified = record.score >= 70;
      assessedSkills.push({
        name: skillName,
        score: record.score,
        source: `Timed Phase Exam (${record.correct}/${record.total} points)`,
        verified,
      });

      if (verified) {
        demonstratedCapabilities.push({
          capability: `${skillName} Assessment Mastery`,
          evidenceType: "assessment",
          details: `Demonstrated ${record.score}% on formal competency exam on ${new Date(record.completedAt).toLocaleDateString()}.`,
          source: "Assessment Engine",
        });
      }
    }
  }

  // Project evidence
  const completedProjects = source?.development?.projects?.filter((p) => p.status === "complete") || [];
  for (const proj of completedProjects) {
    demonstratedCapabilities.push({
      capability: proj.title,
      evidenceType: "project",
      details: proj.outcome || "Completed deliverable with verified repository artifact.",
      source: "Applied Projects",
    });
  }

  // Self reported skills from evidence store
  if (source?.evidence && source.evidence[role]?.records) {
    const records = source.evidence[role].records;
    for (const [sName, sRecord] of Object.entries(records)) {
      if (sRecord.status === "demonstrated") {
        if (!assessedSkills.some((a) => a.name.toLowerCase() === sName.toLowerCase())) {
          selfReportedSkills.push({
            name: sName,
            notes: sRecord.evidence || "Self-verified with work experience summary.",
          });
          demonstratedCapabilities.push({
            capability: `${sName} Practical Proficiency`,
            evidenceType: "self-review",
            details: sRecord.evidence || "Self-reported practical application.",
            source: "Evidence Review",
          });
        }
      }
    }
  }

  // Twin demonstrated skills
  if (twin?.demonstratedSkills) {
    for (const skill of twin.demonstratedSkills) {
      if (!demonstratedCapabilities.some((d) => d.capability.toLowerCase().includes(skill.name.toLowerCase()))) {
        demonstratedCapabilities.push({
          capability: `${skill.name} Applied Knowledge`,
          evidenceType: skill.assessmentScore ? "assessment" : "self-review",
          details: skill.evidence || "Recorded as demonstrated in Career Twin model.",
          source: "Career Twin State",
        });
      }
    }
  }

  // 3. Skills Needing Development
  const skillsNeedingDevelopment: SkillNeedItem[] = [];
  if (twin?.prioritizedGaps) {
    for (const gap of twin.prioritizedGaps) {
      const slug = ROLE_COURSE_MAP[gap.skill.toLowerCase()] || gap.skill.toLowerCase().replace(/\s+/g, "-");
      skillsNeedingDevelopment.push({
        name: gap.skill,
        priority: gap.priority,
        reason: gap.reason,
        recommendedCourseSlug: slug,
        recommendedLabTrack: gap.skill.toLowerCase().includes("net")
          ? "networking"
          : gap.skill.toLowerCase().includes("sec")
          ? "cybersecurity"
          : gap.skill.toLowerCase().includes("sql")
          ? "sql"
          : gap.skill.toLowerCase().includes("cloud")
          ? "cloud"
          : "python",
      });
    }
  }

  // If no prioritized gaps recorded yet, supply standard entry baseline for role
  if (skillsNeedingDevelopment.length === 0) {
    const defaultGaps = ["System Design Fundamentals", "Production Debugging", "Automated Testing"];
    for (const g of defaultGaps) {
      skillsNeedingDevelopment.push({
        name: g,
        priority: "medium",
        reason: `Essential foundational competency for ${role}.`,
        recommendedCourseSlug: "python",
      });
    }
  }

  // 4. Project Recommendations
  const recommendedProjects: ProjectRecommendation[] = [
    {
      id: "proj-1",
      title: `${role} Production Deliverable & Microservice`,
      skill: skillsNeedingDevelopment[0]?.name || "Core Programming",
      difficulty: "intermediate",
      deliverable: "GitHub repository with automated test suite, Dockerfile, and live README architecture diagram.",
      reason: "Bridges the transition from theory to demonstrable industry code quality.",
    },
    {
      id: "proj-2",
      title: "Automated Data Ingestion & Validation Pipeline",
      skill: "SQL & Data Engineering",
      difficulty: "beginner",
      deliverable: "Schema migration scripts, SQL indexing benchmarks, and ETL processing pipeline.",
      reason: "Provides concrete proof of relational data modeling and transactional reliability.",
    },
    {
      id: "proj-3",
      title: "Security Hardened Cloud Deployment",
      skill: "Cloud & DevSecOps",
      difficulty: "advanced",
      deliverable: "Infrastructure-as-code configuration with principle-of-least-privilege IAM policies and audit logs.",
      reason: "Demonstrates defensive engineering and modern production reliability standards.",
    },
  ];

  // 5. Resume & Interview Improvements
  const resumeImprovements = [
    `Replace generic responsibility bullet points with metrics (e.g. "Optimized API latency by 35% through indexing").`,
    `Feature the verified ${completedProjects[0]?.title || "Applied Projects"} repository directly under the Projects section.`,
    `Highlight demonstrated proficiency in ${demonstratedCapabilities.slice(0, 3).map((d) => d.capability).join(", ") || "core domain skills"}.`,
    `Ensure GitHub and live deployment URLs are clickable, public, and documented with clean README files.`,
  ];

  const interviewPrepRequirements = [
    `Prepare a 2-minute STAR-format story explaining how you diagnosed a bug or architectural challenge.`,
    `Review foundational trade-offs (e.g. memory vs execution speed, SQL normalization vs read optimization).`,
    `Practise role-specific technical questions using the AI Career Coach voice and text sandbox.`,
  ];

  // 6. Milestones
  const suggestedMilestones = [
    {
      step: 1,
      title: `Complete ${skillsNeedingDevelopment[0]?.name || "Primary Skill"} Course Module`,
      action: "Open Learning Studio",
      destination: "learning",
    },
    {
      step: 2,
      title: "Validate Competency in Hands-on Lab Sandbox",
      action: "Launch Practical Lab",
      destination: "labs",
    },
    {
      step: 3,
      title: "Score 70%+ on Timed Certification Mock Exam",
      action: "Take Mock Exam",
      destination: "mock-exams",
    },
    {
      step: 4,
      title: "Build and Submit Capstone Project",
      action: "Open Applied Projects",
      destination: "projects",
    },
    {
      step: 5,
      title: "Explore Matched Entry-Level & Internship Listings",
      action: "Browse Opportunities",
      destination: "opportunities",
    },
  ];

  // 7. Suitable Entry Opportunities
  const suitableEntryOpportunities = [
    {
      title: `Junior ${role}`,
      type: "Junior Role" as const,
      rationale: `Direct match for candidates who have demonstrated core programming and practical project deliverables.`,
      focusSkills: demonstratedCapabilities.slice(0, 3).map((d) => d.capability),
    },
    {
      title: `${role} Technical Intern`,
      type: "Internship" as const,
      rationale: `Targeted at current students and recent graduates building initial industry experience.`,
      focusSkills: ["Problem Solving", "Git Collaboration", "Core Concepts"],
    },
    {
      title: "Graduate Engineering Trainee",
      type: "Graduate Trainee" as const,
      rationale: `Structured rotation programs offering mentorship, systems training, and production ownership.`,
      focusSkills: ["Analytical Thinking", "Continuous Learning", "Team Communication"],
    },
  ];

  // Summary statement - strictly grounded, NO fake readiness % or false hiring guarantees
  const verifiedCount = assessedSkills.filter((s) => s.verified).length + completedProjects.length;
  const readinessStatement =
    verifiedCount >= 3
      ? `You have compiled verifiable evidence across ${verifiedCount} assessments and deliverables. Your focus should now be submitting external applications, tailoring your resume, and practising interview explanations.`
      : `You are in active development. Focus on converting self-reported knowledge into verified assessment scores (≥ 70%) and building demonstrable GitHub project deliverables. Completing courses builds foundational competence, while real evidence powers hiring success.`;

  return {
    generatedAt: new Date().toISOString(),
    targetRole: role,
    candidateName,
    academicBackground: {
      degrees,
      institutions,
      detailsSummary: degrees.length > 0 ? `${degrees.join(", ")} at ${institutions.join(", ")}` : "Self-directed learner",
    },
    summary: {
      totalRequiredSkills: twin?.requiredSkills?.length || 5,
      assessedVerifiedCount: assessedSkills.filter((s) => s.verified).length,
      projectVerifiedCount: completedProjects.length,
      selfReportedCount: selfReportedSkills.length,
      skillsNeedingWorkCount: skillsNeedingDevelopment.length,
      readinessStatement,
    },
    demonstratedCapabilities,
    assessedSkills,
    selfReportedSkills,
    skillsNeedingDevelopment,
    recommendedProjects,
    resumeImprovements,
    interviewPrepRequirements,
    suggestedMilestones,
    suitableEntryOpportunities,
  };
}
