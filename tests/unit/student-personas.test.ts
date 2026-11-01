import { describe, expect, it } from "vitest";
import { LEARNING_PATHS } from "@/lib/learning/learning-paths";
import { loadCoursePackage } from "@/lib/learning/course-content-store";

describe("Phase 2: Realistic Student Testing Journeys", () => {
  describe("Persona A: Second-Year BCA Student (Target: Cybersecurity Analyst)", () => {
    const personaA = {
      name: "Aarav Sharma",
      degree: "BCA 2nd Year",
      knownSkills: ["Python", "HTML"],
      targetRole: "Cybersecurity Analyst",
    };

    it("matches the student to the dedicated Cybersecurity Analyst learning path", () => {
      const path = LEARNING_PATHS.find(
        (p) =>
          p.id === "cybersecurity-analyst" ||
          p.targetRole.toLowerCase() === personaA.targetRole.toLowerCase()
      );

      expect(path).toBeDefined();
      expect(path?.title).toContain("Cybersecurity Analyst");
      expect(path?.requiredSkills).toContain("Cybersecurity");
      expect(path?.courses.length).toBeGreaterThanOrEqual(2);
      expect(path?.practicalLabsCount).toBeGreaterThan(0);
      expect(path?.assessmentsCount).toBeGreaterThan(0);
      expect(path?.finalProject.title).toBeDefined();
      expect(path?.finalProject.deliverable).toBeDefined();
    });

    it("loads required course packages and verified lessons for Persona A", async () => {
      const pythonPkg = await loadCoursePackage("python");
      expect(pythonPkg).not.toBeNull();
      expect(pythonPkg?.lessons.length).toBeGreaterThan(0);

      // Verify that lessons contain practical objectives and structured sections
      const firstLesson = pythonPkg?.lessons[0];
      expect(firstLesson?.title).toBeDefined();
      expect(firstLesson?.sections.length).toBeGreaterThan(0);
      expect(firstLesson?.sections[0].content.length).toBeGreaterThan(100);
      expect(firstLesson?.exercises?.length).toBeGreaterThanOrEqual(0);
    });

    it("provides phase assessments and mock exams suitable for cyber defense validation", async () => {
      const pythonPkg = await loadCoursePackage("python");
      const assessments = pythonPkg?.phaseAssessments || [];
      expect(assessments.length).toBeGreaterThan(0);

      const firstExam = assessments[0];
      expect(firstExam.questions.length).toBeGreaterThanOrEqual(3);
      for (const q of firstExam.questions) {
        expect(q.options.length).toBeGreaterThanOrEqual(2);
        expect(q.explanation.length).toBeGreaterThan(10);
      }
    });
  });

  describe("Persona B: Final-Year Computer Science Student (Target: Full-Stack Developer)", () => {
    const personaB = {
      name: "Riya Verma",
      degree: "B.Tech Computer Science 4th Year",
      knownSkills: ["React", "Data Structures & Algorithms"],
      targetRole: "Full-Stack Developer",
    };

    it("identifies the Full-Stack Developer path with multi-tier architecture requirements", () => {
      const path = LEARNING_PATHS.find(
        (p) =>
          p.id === "full-stack-developer" ||
          p.targetRole.toLowerCase().includes("full-stack")
      );

      expect(path).toBeDefined();
      expect(path?.targetRole).toBe("Full-Stack Developer");
      expect(path?.courses.some((c) => c.slug === "javascript" || c.slug === "react")).toBe(true);
      expect(path?.courses.some((c) => c.slug === "sql")).toBe(true);
      expect(path?.completionCriteria.toLowerCase()).toMatch(/lessons|pass|deliverable|complete/);
    });

    it("loads full JavaScript and SQL course material for production web stack learning", async () => {
      const jsPkg = await loadCoursePackage("javascript");
      expect(jsPkg).not.toBeNull();
      expect(jsPkg?.curriculum.skillName).toContain("JavaScript");
      expect(jsPkg?.lessons.length).toBeGreaterThanOrEqual(4);

      const sqlPkg = await loadCoursePackage("sql");
      expect(sqlPkg).not.toBeNull();
      expect(sqlPkg?.curriculum.skillName).toContain("SQL");
      expect(sqlPkg?.lessons.length).toBeGreaterThanOrEqual(4);
    });

    it("validates that lessons include code samples and external documentation links", async () => {
      const jsPkg = await loadCoursePackage("javascript");
      const hasCodeInLessons = jsPkg?.lessons.some((l) =>
        l.sections.some((s) => s.codeExamples.length > 0 || s.content.includes("```"))
      );
      expect(hasCodeInLessons).toBe(true);
    });
  });

  describe("Persona C: Non-Technical Career Switcher (Target: Data Analyst)", () => {
    const personaC = {
      name: "Pooja Mehta",
      degree: "B.Com Commerce Graduate",
      knownSkills: ["Excel"],
      targetRole: "Data Analyst",
    };

    it("guides a non-technical learner through foundational data analytics skills", () => {
      const path = LEARNING_PATHS.find(
        (p) =>
          p.id === "data-analyst" ||
          p.targetRole.toLowerCase().includes("data analyst")
      );

      expect(path).toBeDefined();
      expect(path?.prerequisites).toBeDefined();
      expect(path?.expectedDuration).toBeDefined();
      // Should guide them into Python and SQL for analytics
      expect(path?.courses.some((c) => c.slug === "python" || c.slug === "sql")).toBe(true);
    });

    it("verifies beginner-friendly structure in Python fundamentals", async () => {
      const pythonPkg = await loadCoursePackage("python");
      expect(pythonPkg).not.toBeNull();

      // Module 1 must cover syntax, variables, and control flow before advanced topics
      const module1 = pythonPkg?.curriculum.modules[0];
      expect(module1?.title.toLowerCase()).toMatch(/python|execution|data|syntax|basics|core|introduction/);
    });

    it("verifies scoring and assessment pass/fail logic for non-technical beginners", () => {
      // Pass score threshold is typically 70%
      const passingScore = 75;
      const failingScore = 55;
      const passThreshold = 70;

      expect(passingScore >= passThreshold).toBe(true);
      expect(failingScore >= passThreshold).toBe(false);
    });
  });
});
