import {
  assertLessonIntegrity,
  gradeKnowledgeChecks,
  type LessonDocument,
  type KnowledgeCheck,
  type Exercise,
  type GradedKnowledgeCheck,
} from "./lesson-schema";

export interface LessonRequest {
  skillName: string;
  moduleId: string;
  lessonId: string;
  lessonTitle: string;
  learnerLevel?: "foundation" | "beginner" | "intermediate" | "advanced";
  objectiveIds?: string[];
  objectiveStatements?: string[];
}

/**
 * Builds a comprehensive, high-quality fallback lesson document
 * when AI provider is unconfigured or in offline/local testing mode.
 */
export function buildDeterministicLesson(req: LessonRequest): LessonDocument {
  const level = req.learnerLevel || "beginner";
  const objIds = (req.objectiveIds && req.objectiveIds.length > 0)
    ? req.objectiveIds
    : [`${req.lessonId}-obj-1`, `${req.lessonId}-obj-2`];

  const objStatements = (req.objectiveStatements && req.objectiveStatements.length > 0)
    ? req.objectiveStatements
    : [
        `Understand the core mental model and architecture of ${req.lessonTitle}`,
        `Apply ${req.lessonTitle} in production scenarios with security and maintainability best practices`,
      ];

  const questions: KnowledgeCheck[] = [
    {
      id: `${req.lessonId}-kc-1`,
      type: "single-choice",
      prompt: `When implementing ${req.lessonTitle} in a modern engineering workflow, what is the primary consideration to ensure stability and correctness?`,
      options: [
        { id: "opt-a", text: "Enforce strict schema validation, deterministic error handling, and test boundaries." },
        { id: "opt-b", text: "Rely solely on runtime implicit type coercion without boundary validations." },
        { id: "opt-c", text: "Bypass boundary tests in favour of continuous manual verification in production." },
        { id: "opt-d", text: "Remove telemetry and logs to reduce compute latency." },
      ],
      correctOptionIds: ["opt-a"],
      explanation: "Production stability requires robust boundary validation, deterministic error handling, and automated test coverage before deployment.",
      objectiveIds: [objIds[0]],
    },
    {
      id: `${req.lessonId}-kc-2`,
      type: "multiple-select",
      prompt: `Which of the following represent industry best practices when working with ${req.skillName}?`,
      options: [
        { id: "opt-2a", text: "Designing modular, decoupled components with single responsibilities" },
        { id: "opt-2b", text: "Writing clear assertions and automated integration tests" },
        { id: "opt-2c", text: "Hardcoding secrets and environment configs directly into source files" },
        { id: "opt-2d", text: "Instrumenting observability and error tracking across async operations" },
      ],
      correctOptionIds: ["opt-2a", "opt-2b", "opt-2d"],
      explanation: "Modular architectures, automated verification, and observability are core best practices. Secrets must never be committed to source files.",
      objectiveIds: objIds.length > 1 ? objIds.slice(1) : [objIds[0]],
    },
  ];

  const exercises: Exercise[] = [
    {
      id: `${req.lessonId}-ex-1`,
      type: "coding",
      title: `Hands-on Lab: ${req.lessonTitle} Implementation`,
      objective: `Construct a robust implementation demonstrating mastery of ${req.lessonTitle}.`,
      description: `In this practical exercise, you will create a verifiable implementation for ${req.lessonTitle}. Ensure input parameters are validated and edge cases are handled cleanly.`,
      instructions: [
        `Define the interface or contract for the module with explicit input and return types.`,
        `Implement the core logic following defense-in-depth principles.`,
        `Add unit tests covering both the happy path and invalid inputs.`,
      ],
      starterCode: `// Exercise starter code for ${req.lessonTitle}\nexport function executeTask(input: Record<string, unknown>) {\n  // TODO: Validate input and implement domain logic\n  if (!input) throw new Error("Invalid input");\n  return { success: true, timestamp: new Date().toISOString() };\n}`,
      hints: [
        "Think about edge cases: null/undefined inputs, empty collections, and network or runtime failures.",
        "Use TypeScript schemas or assertions to guarantee type integrity at boundaries.",
      ],
      submissionRequirements: "Submit code that compiles without lint errors and satisfies the core requirements.",
      evaluationCriteria: [
        "Correctness: Satisfies all functional criteria.",
        "Code Quality: Clear naming, clean control flow, and thorough documentation.",
        "Robustness: Handles failure modes and boundary values safely.",
      ],
      solutionExplanation: "The optimal solution isolates boundary transformations from business logic, ensuring testability and auditability.",
    },
  ];

  const candidate: LessonDocument = {
    lessonId: req.lessonId,
    skillName: req.skillName,
    moduleId: req.moduleId,
    title: req.lessonTitle,
    summary: `Comprehensive masterclass on ${req.lessonTitle} for ${req.skillName}. Covering core concepts, design trade-offs, practical patterns, and verification.`,
    learnerLevel: level,
    estimatedMinutes: 25,
    learningObjectives: objStatements,
    objectiveIds: objIds,
    prerequisiteConcepts: ["Basic programming fundamentals", `${req.skillName} environment setup`],
    sections: [
      {
        id: "section-overview",
        heading: `1. Core Architecture & Mental Model of ${req.lessonTitle}`,
        content: `Mastering ${req.lessonTitle} requires building an accurate mental model of how the underlying primitives operate and interact within the larger ${req.skillName} ecosystem. When developing complex software, clarity of responsibilities is critical: every module should have a single well-defined purpose and clean interfaces with surrounding subsystems.\n\nKey architectural principles:\n- **Predictability**: Functions and components should behave deterministically with respect to their inputs.\n- **Separation of Concerns**: Keep business logic decoupled from presentation and network transport layers.\n- **Defensive Programming**: Validate assumptions at system boundaries rather than assuming callers supply well-formed data.`,
        codeExamples: [
          {
            language: "typescript",
            code: `// Example: Clean boundary abstraction for ${req.lessonTitle}\ninterface Config {\n  readonly timeoutMs: number;\n  readonly retries: number;\n}\n\nexport function initializeClient(config: Config) {\n  if (config.timeoutMs <= 0) throw new RangeError("timeoutMs must be positive");\n  return { status: "ready", config };\n}`,
            explanation: "Immutable configurations with boundary validation prevent runtime mutations and subtle state bugs.",
            expectedOutput: '{ status: "ready", config: { timeoutMs: 3000, retries: 3 } }',
          },
        ],
        keyPoints: [
          `Clear mental models prevent premature optimization and architectural drift.`,
          `Validate data at external ingress points using strict type contracts.`,
          `Avoid hidden global state that complicates testing and scaling.`,
        ],
        commonMistakes: [
          `Coupling business logic directly to UI components or specific HTTP transport libraries.`,
          `Silently swallowing errors instead of failing fast or propagating actionable diagnostic context.`,
        ],
      },
      {
        id: "section-deep-dive",
        heading: `2. Production Patterns & Real-World Implementations`,
        content: `In production environments, theoretical patterns must adapt to operational realities such as latency, partial network outages, concurrency, and schema migrations.\n\nWhen applying ${req.lessonTitle}, consider the entire lifecycle of an operation: initialization, payload transformation, execution, and graceful degradation when upstream dependencies fail. Implementing idempotent handlers and clear telemetry ensures your team can diagnose anomalies rapidly in live systems.`,
        codeExamples: [
          {
            language: "typescript",
            code: `// Resilient pattern with structured logging\nexport async function processSafely<T>(fn: () => Promise<T>, fallback: T): Promise<T> {\n  try {\n    return await fn();\n  } catch (err) {\n    console.error("[SafeExecutionFailed]", err);\n    return fallback;\n  }\n}`,
            explanation: "Graceful fallbacks ensure critical paths stay operational even during transient service disruptions.",
            expectedOutput: "Returns fallback result on error without crashing the parent execution context.",
          },
        ],
        keyPoints: [
          "Design for failure: every external dependency can and will experience timeouts or degraded throughput.",
          "Ensure operations are idempotent whenever possible so retries are safe.",
        ],
        commonMistakes: [
          "Assuming network requests always complete within acceptable latencies.",
          "Failing to log contextual identifiers that correlate requests across distributed boundaries.",
        ],
      },
    ],
    exercises,
    knowledgeChecks: questions,
    recap: `In this lesson, you established the foundations of ${req.lessonTitle}. You explored core architecture patterns, studied production resilience techniques, completed a hands-on exercise, and validated your understanding through knowledge checks.`,
    furtherReading: [
      {
        title: `Official ${req.skillName} Documentation`,
        url: "https://developer.mozilla.org/en-US/",
        description: "Authoritative reference and guides for modern web engineering.",
      },
    ],
    realWorldApplications: [
      `High-throughput enterprise APIs and real-time systems`,
      `Mission-critical user-facing applications requiring 99.9% availability`,
    ],
    generationMode: "ai-draft",
    reviewStatus: "draft",
    contentVersion: 1,
    generatedAt: new Date().toISOString(),
  };

  return assertLessonIntegrity(candidate);
}

export { gradeKnowledgeChecks, type GradedKnowledgeCheck };
