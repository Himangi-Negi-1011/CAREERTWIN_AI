import type { CareerOpportunity } from "./opportunities-data";

export interface ResumeAnalysisResult {
  analyzedAt: string;
  targetRole: string;
  matchedOpportunity?: { id: string; title: string; company: string };
  extractedSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  metricsScore: number; // 0 to 100 based on presence of quantifiable outcomes
  strongBulletPoints: string[];
  weakBulletPoints: Array<{ bullet: string; suggestion: string }>;
  suggestedActionVerbs: string[];
  recommendedProjectAdditions: string[];
  summaryFeedback: string;
}

const COMMON_TECH_SKILLS = [
  "python", "javascript", "typescript", "c++", "c#", "java", "go", "rust", "php",
  "sql", "postgresql", "mysql", "mongodb", "redis",
  "react", "next.js", "node.js", "vue", "angular", "express", "django", "fastapi", "flask",
  "html", "css", "tailwind",
  "docker", "kubernetes", "aws", "gcp", "azure", "linux", "git", "ci/cd",
  "data structures", "algorithms", "rest api", "graphql", "cybersecurity", "networking"
];

const ACTION_VERBS = [
  "Architected", "Engineered", "Implemented", "Optimized", "Refactored",
  "Automated", "Deployed", "Streamlined", "Resolved", "Benchmarked"
];

export function analyzeResumeText(params: {
  resumeText: string;
  targetRole: string;
  opportunity?: CareerOpportunity;
}): ResumeAnalysisResult {
  const { resumeText, targetRole, opportunity } = params;
  const lowerText = resumeText.toLowerCase();

  // 1. Extract technical skills
  const extractedSkills: string[] = [];
  for (const skill of COMMON_TECH_SKILLS) {
    // Regex for whole-word boundary
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (regex.test(lowerText)) {
      // Capitalize for display
      if (skill === "git") {
        extractedSkills.push("Git");
      } else if (skill === "sql" || skill === "aws" || skill === "gcp" || skill === "css") {
        extractedSkills.push(skill.toUpperCase());
      } else {
        extractedSkills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
      }
    }
  }

  // 2. Identify required skills against target role or opportunity
  const requiredSkills = opportunity?.requiredSkills || [
    "Python", "SQL", "Git", "REST APIs", "Testing & Debugging"
  ];

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const req of requiredSkills) {
    const isFound = extractedSkills.some((s) => s.toLowerCase() === req.toLowerCase()) ||
      lowerText.includes(req.toLowerCase());
    if (isFound) {
      matchedSkills.push(req);
    } else {
      missingSkills.push(req);
    }
  }

  // 3. Analyze bullet points and quantification
  const rawLines = resumeText.split(/\r?\n/).map((l) => l.trim());
  const bulletLines = rawLines
    .filter((l) => l.length > 20 && !l.endsWith(":") && !l.toUpperCase().includes("EDUCATION"))
    .map((l) => l.replace(/^[-•*]\s*/, ""));

  const strongBulletPoints: string[] = [];
  const weakBulletPoints: Array<{ bullet: string; suggestion: string }> = [];

  // Exclude standalone 4-digit years (e.g., 2023, 2026) from counting as impact metrics
  const metricRegex = /(?:\b\d+(?:\.\d+)?%|\$\d+(?:\.\d+)?|\b\d+x\b|\b\d+\s*(?:ms|seconds|users|requests|percent|hrs|hours|clients|records|endpoints|tests|components)\b|\b(?:reduced|increased|improved|decreased|accelerated|grew|saved)\b[^\n.,]{1,30}\b\d+)/i;

  for (const line of bulletLines) {
    if (metricRegex.test(line)) {
      strongBulletPoints.push(line);
    } else if (line.length > 25) {
      weakBulletPoints.push({
        bullet: line,
        suggestion: `Quantify impact: add numbers (e.g., latency reduction, test coverage percentage, or throughput handled).`,
      });
    }
  }

  const metricsScore = bulletLines.length > 0 ? Math.round((strongBulletPoints.length / bulletLines.length) * 100) : 40;

  // 4. Recommendations
  const suggestedActionVerbs = ACTION_VERBS.filter(
    (verb) => !lowerText.includes(verb.toLowerCase())
  ).slice(0, 5);

  const recommendedProjectAdditions: string[] = [];
  if (missingSkills.length > 0) {
    recommendedProjectAdditions.push(
      `Build a project highlighting ${missingSkills.slice(0, 2).join(" and ")} to eliminate keyword gaps on ATS screening.`
    );
  }
  recommendedProjectAdditions.push(
    `Include live demonstration link (e.g. Vercel, Render) and public GitHub repository URL with verifiable automated test badges.`
  );

  const summaryFeedback =
    matchedSkills.length >= Math.ceil(requiredSkills.length * 0.7)
      ? `Strong role relevance for ${targetRole}. You matched ${matchedSkills.length}/${requiredSkills.length} core technical requirements. Adding measurable outcome statistics will further elevate your ATS rank.`
      : `Moderate keyword alignment for ${targetRole}. You are missing critical requirements: ${missingSkills.join(", ")}. Prioritize adding project bullet points that explicitly demonstrate these competencies.`;

  return {
    analyzedAt: new Date().toISOString(),
    targetRole,
    matchedOpportunity: opportunity
      ? { id: opportunity.id, title: opportunity.title, company: opportunity.company }
      : undefined,
    extractedSkills,
    matchedSkills,
    missingSkills,
    metricsScore,
    strongBulletPoints: strongBulletPoints.slice(0, 5),
    weakBulletPoints: weakBulletPoints.slice(0, 4),
    suggestedActionVerbs,
    recommendedProjectAdditions,
    summaryFeedback,
  };
}
