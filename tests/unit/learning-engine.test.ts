import { describe, expect, it } from "vitest";
import { findCanonicalSkill, normalizeSkillName, searchSkills, seededSkills, validateNewSkillName } from "@/lib/learning/catalog";
import { assertCurriculumIntegrity, gradeObjectiveQuiz, skillSchema, type QuizQuestion } from "@/lib/learning/schema";

const baseCurriculum = {
  skillId: "00000000-0000-4000-8000-000000000001",
  skillName: "Python",
  learnerLevel: "foundation" as const,
  preferredLanguage: "English",
  objectives: [
    { id: "python-values", statement: "Explain Python values and variables", order: 0 },
    { id: "python-control-flow", statement: "Use conditions and loops", order: 1 },
  ],
  prerequisites: [],
  modules: [
    { id: "python-foundations", title: "Python foundations", summary: "Learn values, variables, conditions, and loops through small runnable examples.", order: 0, estimatedMinutes: 120, objectiveIds: ["python-values", "python-control-flow"], lessonTitles: ["Values and variables", "Conditions and loops"], checkpoint: "Create and explain a small command-line program." },
  ],
  practiceActivities: ["Predict and verify the output of five short programs."],
  assessmentCheckpoints: ["Complete a deterministic foundations quiz."],
  projects: ["Build a small command-line tracker with documented inputs and outputs."],
  proficiencyCriteria: ["Explain core syntax accurately.", "Complete a practical program and its tests."],
  resources: [],
  contentVersion: 1,
  generationMode: "ai-draft" as const,
  reviewStatus: "draft" as const,
};

describe("Learning catalog", () => {
  it("provides a broad, schema-valid starter catalog", () => {
    expect(seededSkills.length).toBeGreaterThan(150);
    expect(seededSkills.every((skill) => skillSchema.safeParse(skill).success)).toBe(true);
  });
  it("normalizes aliases and alternate punctuation without creating duplicates", () => {
    expect(normalizeSkillName("  Postgres.SQL  ")).toBe("postgres sql");
    expect(findCanonicalSkill("postgres")?.canonicalName).toBe("PostgreSQL");
    expect(findCanonicalSkill("JS")?.canonicalName).toBe("JavaScript");
  });
  it("ranks canonical exact matches before broader keyword matches", () => {
    expect(searchSkills("python")[0]?.canonicalName).toBe("Python");
  });
  it("accepts a safe unseen skill for registration and rejects meaningless input", () => {
    expect(validateNewSkillName("Quantum error correction").existing).toBeNull();
    expect(() => validateNewSkillName("+++" )).toThrow(/letter or number/i);
  });
});

describe("Curriculum validation", () => {
  it("accepts complete objective coverage", () => {
    expect(assertCurriculumIntegrity(baseCurriculum).modules).toHaveLength(1);
  });
  it("rejects references to objectives that do not exist", () => {
    const invalid = structuredClone(baseCurriculum);
    invalid.modules[0].objectiveIds.push("invented-objective");
    expect(() => assertCurriculumIntegrity(invalid)).toThrow(/unknown objective/i);
  });
  it("rejects objectives omitted from every module", () => {
    const invalid = structuredClone(baseCurriculum);
    invalid.modules[0].objectiveIds = ["python-values"];
    expect(() => assertCurriculumIntegrity(invalid)).toThrow(/without module coverage/i);
  });
});

describe("Deterministic objective grading", () => {
  const questions: QuizQuestion[] = [
    { id: "q1", type: "single-choice", prompt: "Which value is a Python boolean?", options: [{ id: "a", text: "True" }, { id: "b", text: "'True'" }], correctOptionIds: ["a"], explanation: "True is the boolean literal; the quoted value is text.", difficulty: "foundation", objectiveIds: ["python-values"] },
    { id: "q2", type: "multiple-select", prompt: "Select both loop keywords.", options: [{ id: "a", text: "for" }, { id: "b", text: "while" }, { id: "c", text: "when" }], correctOptionIds: ["a", "b"], explanation: "Python uses for and while loops.", difficulty: "foundation", objectiveIds: ["python-control-flow"] },
  ];
  it("grades exact answer sets consistently", () => {
    const result = gradeObjectiveQuiz(questions, { questionSetVersion: 1, answers: { q1: ["a"], q2: ["b", "a"] } });
    expect(result).toMatchObject({ correct: 2, total: 2, score: 100 });
  });
  it("does not accept extra selected options", () => {
    const result = gradeObjectiveQuiz(questions, { questionSetVersion: 1, answers: { q1: ["a"], q2: ["a", "b", "c"] } });
    expect(result).toMatchObject({ correct: 1, score: 50 });
  });
  it("returns explanations only as part of the post-submission result", () => {
    const result = gradeObjectiveQuiz(questions, { questionSetVersion: 1, answers: {} });
    expect(result.results[0].explanation).toContain("boolean literal");
    expect(result.score).toBe(0);
  });
});
