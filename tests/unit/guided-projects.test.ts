import { describe, expect, it } from "vitest";
import { GUIDED_PROJECTS, projectSubmissionSchema } from "@/lib/career/projects-catalog";

describe("Guided Projects Engine (Phase 5)", () => {
  it("defines projects with all 12 structured fields", () => {
    expect(GUIDED_PROJECTS.length).toBeGreaterThanOrEqual(3);

    for (const proj of GUIDED_PROJECTS) {
      expect(proj.id).toBeDefined();
      expect(proj.title).toBeDefined();
      expect(proj.problemStatement.length).toBeGreaterThan(20);
      expect(proj.whyItMatters.length).toBeGreaterThan(20);
      expect(proj.requiredSkills.length).toBeGreaterThan(0);
      expect(proj.prerequisites.length).toBeGreaterThan(0);
      expect(proj.toolsAndTech.length).toBeGreaterThan(0);
      expect(proj.stepByStepMilestones.length).toBeGreaterThanOrEqual(3);
      expect(proj.expectedDeliverables.length).toBeGreaterThanOrEqual(2);
      expect(proj.testingRequirements.length).toBeGreaterThanOrEqual(1);
      expect(proj.evaluationRubric.length).toBeGreaterThanOrEqual(3);
      expect(proj.suggestedGitHubStructure).toContain("README.md");
      expect(proj.portfolioPresentationGuidance.length).toBeGreaterThan(20);
    }
  });

  it("validates GitHub repository submission URLs and deliverable summaries", () => {
    // Invalid submission (non-github URL and short summary)
    const invalid = projectSubmissionSchema.safeParse({
      projectId: "proj-rest-microservice",
      projectTitle: "Student API",
      githubUrl: "https://mysite.com/code",
      deliverableSummary: "done",
    });
    expect(invalid.success).toBe(false);

    // Valid submission
    const valid = projectSubmissionSchema.safeParse({
      projectId: "proj-rest-microservice",
      projectTitle: "Student API",
      githubUrl: "https://github.com/student/student-api-microservice",
      deliverableSummary: "Implemented FastAPI endpoints, SQLite persistence, and PyTest coverage.",
    });
    expect(valid.success).toBe(true);
  });
});

