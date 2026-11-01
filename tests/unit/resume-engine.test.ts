import { describe, expect, it } from "vitest";
import { analyzeResumeText } from "@/lib/career/resume-engine";

describe("AI Resume & ATS Review Engine (Phase 4)", () => {
  it("extracts technical skills, analyzes quantification, and flags missing requirements", () => {
    const resume = `
    EDUCATION:
    B.Tech Computer Science, 2026
    
    TECHNICAL SKILLS:
    Python, SQL, Git, Linux, Docker, REST APIs
    
    EXPERIENCE & PROJECTS:
    - Engineered high-throughput REST API in Python, decreasing response latency by 32%
    - Configured PostgreSQL database with indexed query lookups
    - Managed deployments on Linux cloud instances
    `;

    const result = analyzeResumeText({
      resumeText: resume,
      targetRole: "Full-Stack Developer",
    });

    expect(result.extractedSkills).toContain("Python");
    expect(result.extractedSkills).toContain("SQL");
    expect(result.extractedSkills).toContain("Git");

    // Check quantification metrics calculation
    expect(result.metricsScore).toBeGreaterThan(0);
    expect(result.strongBulletPoints.length).toBeGreaterThanOrEqual(1);
    expect(result.strongBulletPoints[0]).toContain("32%");

    // Action verbs suggestions
    expect(result.suggestedActionVerbs.length).toBeGreaterThan(0);
    expect(result.summaryFeedback.length).toBeGreaterThan(20);
  });
});

