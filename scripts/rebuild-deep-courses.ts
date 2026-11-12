import Module from "module";
const originalRequire = (Module.prototype as unknown as { require: (id: string) => unknown }).require;
(Module.prototype as unknown as { require: (id: string) => unknown }).require = function (id: string) {
  if (id === "server-only") return {};
  return originalRequire.apply(this, [id]);
};

import fs from "fs/promises";
import path from "path";
import { type RichCourseBlueprint } from "./course-upgrades-data";
import { PYTHON_COURSE } from "./deep-programming-blueprints";
import { JAVASCRIPT_COURSE } from "./deep-programming-blueprints-js";
import { TYPESCRIPT_COURSE } from "./deep-programming-blueprints-ts";
import { saveCoursePackage } from "../lib/learning/course-content-store";
import { extractPlannedLessons } from "../lib/learning/course-engine";
import { buildDeterministicMockTest } from "../lib/learning/mock-test-engine";
import { type Curriculum } from "../lib/learning/schema";
import { type LessonDocument, type ExternalResource } from "../lib/learning/lesson-schema";
import { type MockTestDocument } from "../lib/learning/mock-test-schema";

function buildCourseFromBlueprint(bp: RichCourseBlueprint) {
  const now = new Date().toISOString();
  const objectives = [
    { id: `${bp.slug}-obj-1`, statement: `Understand foundational mental models and architecture of ${bp.skillName}`, order: 1 },
    { id: `${bp.slug}-obj-2`, statement: `Implement secure, reproducible solutions across real-world ${bp.skillName} tasks`, order: 2 },
    { id: `${bp.slug}-obj-3`, statement: `Diagnose common production edge cases, bottlenecks, and vulnerabilities in ${bp.skillName}`, order: 3 },
    { id: `${bp.slug}-obj-4`, statement: `Architect scalable enterprise workflows aligned with ${bp.skillName} industry best practices`, order: 4 },
  ];

  const curriculum: Curriculum = {
    skillId: bp.skillId,
    skillName: bp.skillName,
    learnerLevel: "beginner",
    preferredLanguage: "English",
    objectives,
    prerequisites: bp.prerequisites,
    modules: bp.modules.map((m, idx) => ({
      id: m.id,
      title: m.title,
      summary: m.summary,
      order: idx + 1,
      estimatedMinutes: m.estimatedMinutes,
      objectiveIds: idx === 0
        ? [`${bp.slug}-obj-1`, `${bp.slug}-obj-2`]
        : idx === 1
        ? [`${bp.slug}-obj-2`, `${bp.slug}-obj-3`]
        : [`${bp.slug}-obj-3`, `${bp.slug}-obj-4`],
      lessonTitles: m.lessons.map((l) => l.title),
      checkpoint: m.checkpoint,
    })),
    practiceActivities: bp.practiceActivities,
    assessmentCheckpoints: bp.modules.map((m) => `${m.title} Checkpoint (70% pass threshold)`),
    projects: bp.projects,
    proficiencyCriteria: bp.proficiencyCriteria,
    resources: [
      {
        title: bp.docTitle,
        organization: bp.docOrg,
        url: bp.docUrl,
        retrievedAt: now,
        reviewStatus: "curated",
      },
    ],
    contentVersion: 2,
    generationMode: "curated",
    reviewStatus: "approved",
  };

  const planned = extractPlannedLessons(curriculum);
  const lessons: LessonDocument[] = [];
  const phaseAssessments: MockTestDocument[] = [];
  const sharedVideo: ExternalResource = {
    id: `res-${bp.slug}-primary`,
    title: bp.videoTitle,
    provider: "youtube",
    channelOrAuthor: bp.videoChannel,
    url: bp.videoUrl,
    embedUrl: "",
    durationMinutes: 60,
    difficulty: "beginner",
    whySelected: `Comprehensive, technically accurate conceptual & practical walkthrough of ${bp.skillName}.`,
    whatItTeaches: `Core architecture, security boundaries, and real-world workflows for ${bp.skillName}.`,
    learningObjectivesSupported: objectives.map((o) => o.id),
    keyTopicsCovered: bp.modules.flatMap((m) => m.lessons.map((l) => l.title)),
    followUpActivity: "Complete all hands-on lab checks and knowledge checks in this module.",
    verificationStatus: "curated",
    lastCheckedDate: "2026-11-12",
  };

  for (let mIdx = 0; mIdx < bp.modules.length; mIdx++) {
    const mod = bp.modules[mIdx];
    const modObjIds = curriculum.modules[mIdx].objectiveIds;

    for (let lIdx = 0; lIdx < mod.lessons.length; lIdx++) {
      const lb = mod.lessons[lIdx];
      const matchedPlan = planned.find((p) => p.moduleId === mod.id && p.lessonTitle === lb.title);
      const lessonId =
        matchedPlan?.lessonId ??
        `${mod.id}-l${lIdx + 1}-${lb.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}`;

      lessons.push({
        lessonId,
        skillName: bp.skillName,
        moduleId: mod.id,
        title: lb.title,
        summary: lb.summary,
        learnerLevel: "beginner",
        estimatedMinutes: lb.estimatedMinutes,
        learningObjectives: lb.objectives,
        objectiveIds: modObjIds,
        prerequisiteConcepts: lb.prerequisites,
        sections: [
          {
            id: `${lessonId}-sec-1`,
            heading: lb.coreHeading,
            content: lb.coreContent,
            codeExamples: [
              {
                language: "text",
                code: lb.diagramCode,
                explanation: lb.diagramExplanation,
                expectedOutput: "System Architecture & Memory Layout Diagram",
              },
            ],
            keyPoints: lb.coreKeyPoints,
            commonMistakes: lb.coreMistakes,
          },
          {
            id: `${lessonId}-sec-2`,
            heading: lb.prodHeading,
            content: lb.prodContent,
            codeExamples: [
              {
                language: lb.codeLang,
                code: lb.codeSnippet,
                explanation: lb.codeExplanation,
                expectedOutput: lb.codeExpectedOutput,
              },
            ],
            keyPoints: lb.prodKeyPoints,
            commonMistakes: lb.prodMistakes,
          },
        ],
        exercises: [
          {
            id: `${lessonId}-ex-1`,
            type: lb.exerciseType,
            title: lb.exerciseTitle,
            objective: lb.exerciseObjective,
            description: lb.exerciseDescription,
            instructions: lb.exerciseInstructions,
            starterCode: lb.starterCode,
            hints: lb.hints,
            submissionRequirements: "Complete all checklist items, test assumptions, and document verification rationale.",
            evaluationCriteria: [
              "Addresses the root architectural/technical challenge accurately",
              "Follows defensive industry standards and edge-case validation",
            ],
            solutionExplanation: lb.solutionExplanation,
          },
        ],
        knowledgeChecks: lb.checks.map((ck, idx) => ({
          id: `${lessonId}-kc-${idx + 1}`,
          type: "single-choice",
          prompt: ck.prompt,
          options: ck.options.map((optText, oIdx) => ({ id: `opt-${oIdx + 1}`, text: optText })),
          correctOptionIds: [`opt-${ck.correctIdx + 1}`],
          explanation: ck.explanation,
          objectiveIds: [modObjIds[idx % modObjIds.length]],
        })),
        recap: lb.recap,
        videoResources: [sharedVideo],
        furtherReading: [
          {
            title: bp.docTitle,
            url: bp.docUrl,
            description: `Authoritative official technical reference for ${bp.skillName}.`,
          },
        ],
        realWorldApplications: lb.realWorldApps,
        generationMode: "curated",
        reviewStatus: "approved",
        contentVersion: 2,
        generatedAt: now,
      });
    }

    // Build clean module phase assessment referencing actual module lessons cleanly
    const phaseQuestions = mod.lessons.flatMap((lb, lIdx) => {
      const matchedPlan = planned.find((p) => p.moduleId === mod.id && p.lessonTitle === lb.title);
      const exactLessonId = matchedPlan?.lessonId ?? `${mod.id}-l${lIdx + 1}`;
      return lb.checks.map((ck, cIdx) => ({
        id: `phase-${bp.slug}-${mod.id}-q${lIdx * 3 + cIdx + 1}`,
        section: "A" as const,
        sectionTitle: `${mod.title} Checkpoint`,
        type: "single-choice" as const,
        prompt: ck.prompt,
        codeSnippet: "",
        options: ck.options.map((t, oIdx) => ({ id: `opt-${oIdx + 1}`, text: t })),
        correctOptionIds: [`opt-${ck.correctIdx + 1}`],
        explanation: ck.explanation,
        difficulty: "beginner" as const,
        topic: lb.title,
        marks: 2,
        recommendedLessonId: exactLessonId,
        recommendedLessonTitle: lb.title,
      }));
    });

    phaseAssessments.push({
      id: `phase-${bp.slug}-${mod.id}-assessment`,
      skillName: bp.skillName,
      skillSlug: bp.slug,
      level: "beginner",
      testNumber: mIdx + 1,
      isPhaseAssessment: true,
      moduleId: mod.id,
      moduleTitle: mod.title,
      title: `${bp.skillName} — ${mod.title} Assessment`,
      description: `Checkpoint evaluation verifying conceptual mastery across ${mod.lessons.map((l) => l.title).join(" and ")}.`,
      durationMinutes: 20,
      totalMarks: phaseQuestions.reduce((s, q) => s + q.marks, 0),
      passingPercentage: 70,
      topicsCovered: mod.lessons.map((l) => l.title),
      questions: phaseQuestions,
      contentVersion: 2,
      reviewStatus: "approved",
      createdAt: now,
      updatedAt: now,
    });
  }

  const mockTests: MockTestDocument[] = [
    buildDeterministicMockTest(bp.skillName, "beginner", 1),
    buildDeterministicMockTest(bp.skillName, "beginner", 2),
    buildDeterministicMockTest(bp.skillName, "beginner", 3),
  ];

  return {
    slug: bp.slug,
    skillName: bp.skillName,
    curriculum,
    lessons,
    phaseAssessments,
    mockTests,
    resources: [sharedVideo],
  };
}

async function main() {
  console.log("🚀 Rebuilding Flagship Programming Courses with Deep Study Blueprints...\n");

  const blueprints = [PYTHON_COURSE, JAVASCRIPT_COURSE, TYPESCRIPT_COURSE];
  for (const bp of blueprints) {
    const courseDir = path.join(process.cwd(), "content", "courses", bp.slug);
    await fs.rm(courseDir, { recursive: true, force: true });
    const pkg = buildCourseFromBlueprint(bp);
    await saveCoursePackage(pkg);
    console.log(`✅ Rebuilt deep 3-module/6-lesson flagship package: ${bp.slug} (${pkg.lessons.length} lessons, ${pkg.phaseAssessments.length} phase tests, 3 x 100-mark mock tests)`);
  }

  console.log("\n🎉 Flagship programming courses upgraded to deep, university-grade study successfully!");
}

main().catch((err) => {
  console.error("❌ Course upgrade failed:", err);
  process.exit(1);
});
