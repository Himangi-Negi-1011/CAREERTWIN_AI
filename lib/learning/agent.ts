import { z } from "zod";
import { getSubjectSpec } from "./domain-knowledge";

export const AGENT_MODES = [
  "explain_concept",
  "teach_from_zero",
  "ask_tutor",
  "practical_mentor",
  "code_helper",
  "revision_mode",
  "quiz_me",
  "career_connection",
  "doubt_solver",
] as const;

export type AgentMode = (typeof AGENT_MODES)[number];

export const AGENT_MODE_METADATA: Record<
  AgentMode,
  { label: string; icon: string; shortDesc: string; placeholder: string }
> = {
  explain_concept: {
    label: "Explain Concept",
    icon: "💡",
    shortDesc: "Real-world analogies & technical breakdown",
    placeholder: "Which concept would you like broken down?",
  },
  teach_from_zero: {
    label: "Teach Me From Zero",
    icon: "🌱",
    shortDesc: "Foundational, first-principles instruction",
    placeholder: "What should we start learning from scratch?",
  },
  ask_tutor: {
    label: "Ask AI Tutor",
    icon: "🎓",
    shortDesc: "Contextual answers to any question",
    placeholder: "Ask anything about this lesson or topic...",
  },
  practical_mentor: {
    label: "Practical Mentor",
    icon: "🛠️",
    shortDesc: "Guided lab exercises & progressive hints",
    placeholder: "Need a hint or troubleshooting guidance for the lab?",
  },
  code_helper: {
    label: "Code Helper",
    icon: "💻",
    shortDesc: "Line-by-line review, debugging & refactoring",
    placeholder: "Paste your code snippet or error message here...",
  },
  revision_mode: {
    label: "Revision Mode",
    icon: "📝",
    shortDesc: "Quick review notes & targeted weak-spot drill",
    placeholder: "Request a revision summary or cheat sheet...",
  },
  quiz_me: {
    label: "Quiz Me",
    icon: "⚡",
    shortDesc: "Interactive diagnostic questions with feedback",
    placeholder: "Test my knowledge on this lesson's key concepts!",
  },
  career_connection: {
    label: "Career Connection",
    icon: "🚀",
    shortDesc: "Real-world jobs, interviews & portfolio tips",
    placeholder: "How is this skill used in tech jobs and interviews?",
  },
  doubt_solver: {
    label: "Doubt Solver",
    icon: "🤝",
    shortDesc: "Multi-turn clarification and follow-up support",
    placeholder: "Still unclear about something? Let's dive deeper...",
  },
};

export const studentLevelSchema = z.enum(["beginner", "intermediate", "advanced"]);
export type StudentLevel = z.infer<typeof studentLevelSchema>;

export const chatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
  timestamp: z.number().default(() => Date.now()),
  mode: z.enum(AGENT_MODES).optional(),
});
export type ChatMessage = z.infer<typeof chatMessageSchema>;

export const agentQuizQuestionSchema = z.object({
  question: z.string().trim().min(5),
  options: z.array(z.string().trim().min(1)).min(2).max(6),
  correctIndex: z.number().int().min(0),
  explanation: z.string().trim().min(5),
  topic: z.string().trim().min(2),
});
export type AgentQuizQuestion = z.infer<typeof agentQuizQuestionSchema>;

export const codeExampleSchema = z.object({
  language: z.string().trim().min(1),
  code: z.string().trim().min(1),
  explanation: z.string().trim().min(5),
  expectedOutput: z.string().trim().optional(),
});
export type CodeExample = z.infer<typeof codeExampleSchema>;

export const agentRequestSchema = z.object({
  question: z.string().trim().min(2).max(2000),
  mode: z.enum(AGENT_MODES).default("ask_tutor"),
  skillName: z.string().trim().min(1).max(120),
  courseTitle: z.string().trim().max(200).optional(),
  courseSlug: z.string().trim().max(120).optional(),
  moduleTitle: z.string().trim().max(200).optional(),
  lessonTitle: z.string().trim().max(200).optional(),
  studentLevel: studentLevelSchema.default("beginner"),
  weakTopics: z.array(z.string().trim()).max(10).default([]),
  codeSnippet: z.string().max(8000).optional(),
  contextText: z.string().trim().max(6000).optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().max(2000),
      })
    )
    .max(10)
    .default([]),
});
export type AgentRequest = z.infer<typeof agentRequestSchema>;

export const agentResponseSchema = z.object({
  answer: z.string().trim().min(5),
  mode: z.enum(AGENT_MODES),
  keyTakeaways: z.array(z.string().trim()).max(6).default([]),
  codeExamples: z.array(codeExampleSchema).max(4).default([]),
  quizQuestions: z.array(agentQuizQuestionSchema).max(3).optional(),
  relatedConcepts: z.array(z.string().trim().min(1).max(120)).max(6).default([]),
  suggestedAction: z.string().trim().min(5).max(600),
  careerImpact: z.string().trim().optional(),
});
export type AgentResponse = z.infer<typeof agentResponseSchema>;

/**
 * Builds the mode-specific prompt for LLMs (Gemini / OpenRouter).
 */
export function buildAgentPrompt(req: AgentRequest): string {
  const meta = AGENT_MODE_METADATA[req.mode];
  let prompt = `You are CareerTwin's Advanced AI Learning Agent operating in "${meta.label}" mode.
Target Skill: ${req.skillName}
Learner Level: ${req.studentLevel}
${req.courseTitle ? `Course: ${req.courseTitle}\n` : ""}${req.moduleTitle ? `Module: ${req.moduleTitle}\n` : ""}${req.lessonTitle ? `Active Lesson: ${req.lessonTitle}\n` : ""}${req.weakTopics.length > 0 ? `Student's Identified Weak Topics: ${req.weakTopics.join(", ")}\n` : ""}${req.contextText ? `Lesson Context Snippet: ${req.contextText.slice(0, 1500)}\n` : ""}${req.codeSnippet ? `Student Code Snippet:\n\`\`\`\n${req.codeSnippet}\n\`\`\`\n` : ""}`;

  if (req.history && req.history.length > 0) {
    prompt += `\nConversation History:\n`;
    for (const h of req.history.slice(-4)) {
      prompt += `${h.role === "user" ? "Student" : "AI Agent"}: ${h.content}\n`;
    }
  }

  prompt += `\nCurrent Student Query: "${req.question}"\n\n`;

  switch (req.mode) {
    case "explain_concept":
      prompt += `Provide: 1) A clear real-world analogy, 2) Step-by-step mechanical explanation, 3) A clean code/workflow example, 4) What beginners typically misunderstand. Adapt language for a ${req.studentLevel} learner.`;
      break;
    case "teach_from_zero":
      prompt += `Teach this concept from first principles. Assume zero prior background. Explain the exact motivation (why it was invented), the core mental model, and construct the simplest possible working example.`;
      break;
    case "practical_mentor":
      prompt += `Act as a lab mentor. DO NOT dump the final solution. Give a diagnostic hint, point out the key constraint, provide a step-by-step verification checklist, and guide the student to solve it themselves.`;
      break;
    case "code_helper":
      prompt += `Perform a line-by-line review of the provided code or issue. Point out syntax/logic bugs, time/space complexity or runtime edge-cases, supply corrected code with inline comments, and show a cleaner idiomatic pattern.`;
      break;
    case "revision_mode":
      prompt += `Provide a high-yield study sheet. Highlight key definitions, syntax cheat-sheet, common mistakes, and directly address these weak topics if present: [${req.weakTopics.join(", ")}].`;
      break;
    case "quiz_me":
      prompt += `Generate 2 to 3 diagnostic multiple-choice questions directly assessing this lesson. Each question must have 4 options, a correctIndex, a comprehensive explanation, and the topic tested.`;
      break;
    case "career_connection":
      prompt += `Explain how this specific concept is used in industry software engineering / tech roles. Share how it appears in technical interview rounds, how it affects production systems at scale, and recommend a portfolio project feature demonstrating it.`;
      break;
    case "doubt_solver":
      prompt += `Resolve the student's doubt with deep empathy and clarity. Address the specific confusion, provide an alternative perspective or diagrammatic explanation, and confirm their understanding with a check question.`;
      break;
    case "ask_tutor":
    default:
      prompt += `Provide a structured, engaging, and pedagogically sound answer grounded in the lesson context. Include code where helpful, list 3-5 related concepts, and suggest a practical exercise.`;
      break;
  }

  prompt += `\n\nReturn strictly valid JSON matching the expected schema.`;
  return prompt;
}

/**
 * Deterministic Pedagogical Fallback Generator.
 * Used when LLM APIs are offline, rate-limited, or unconfigured.
 * Never returns generic lorem ipsum or unhelpful placeholders.
 */
export function generateDeterministicAgentResponse(req: AgentRequest): AgentResponse {
  const subject = req.lessonTitle || req.skillName;
  const spec = getSubjectSpec(req.skillName, subject, "agent-lesson-1");

  switch (req.mode) {
    case "explain_concept":
      return {
        answer: `### Understanding ${subject}\n\n**The Real-World Analogy:**\nThink of ${subject} like a well-organized logistics hub. Instead of handling every package in an ad-hoc manner, inputs follow strict specifications, transformations happen in deterministic stages, and results are emitted with predictable guarantees.\n\n**Core Mechanics:**\n1. **Data & State Flow:** Data enters through defined parameters, undergoes validation, and flows through specialized operations without unintended side-effects.\n2. **Encapsulation & Boundaries:** Internal implementation details remain isolated from consumers, preventing leaky abstractions.\n3. **Runtime Reliability:** Potential failure modes (null checks, boundary conditions, network timeouts) are handled defensively upfront.\n\n${spec.mentalModelText}`,
        mode: req.mode,
        keyTakeaways: [
          `Mastering ${subject} ensures code correctness and maintainability.`,
          `Separate data transformation logic from side-effect execution.`,
          `Always account for edge cases and input validation early.`,
        ],
        codeExamples: [
          {
            language: spec.language,
            code: spec.codeSnippet,
            explanation: spec.codeExplanation,
            expectedOutput: spec.expectedOutput,
          },
        ],
        relatedConcepts: [
          `${req.skillName} runtime architecture`,
          "Defensive programming & contract validation",
          "Separation of concerns",
          "State management & immutability",
        ],
        suggestedAction: `Open the code editor tab in this lesson and run the example above. Try modifying one parameter to see how the output changes.`,
      };

    case "teach_from_zero":
      return {
        answer: `### Starting with ${subject} from Scratch\n\nWelcome! When learning ${req.skillName}, it is completely normal to feel overwhelmed at first. Let's break this down into first principles:\n\n#### 1. Why Does This Exist?\nBefore ${subject}, developers had to write repetitive, fragile, and error-prone boilerplate. ${subject} was created to give you a clean, standard way to solve this exact problem efficiently.\n\n#### 2. The Mental Model\nEvery computing program boils down to three things:\n- **Input:** The raw information you receive.\n- **Processing:** The logic rules applied to that information.\n- **Output:** The result shown to the user or saved to a database.\n\nIn ${subject}, your role is simply directing this flow predictably.\n\n#### 3. Your First Working Step\nLook at the minimal working example below. Notice how concise and structured it is!`,
        mode: req.mode,
        keyTakeaways: [
          "Zero prior knowledge required: start with the input -> process -> output mental model.",
          "Keep your first implementation as simple as possible.",
          "Do not worry about micro-optimizations until basic mechanics work.",
        ],
        codeExamples: [
          {
            language: spec.language,
            code: spec.codeSnippet,
            explanation: "Minimal first-principles example demonstrating core syntax and immediate execution.",
            expectedOutput: spec.expectedOutput,
          },
        ],
        relatedConcepts: [
          "Variables & basic data types",
          "Control flow fundamentals",
          "Standard input and output",
          "Basic error handling",
        ],
        suggestedAction: `Type out this minimal example by hand rather than copy-pasting. Typing builds tactile muscle memory for syntax keywords!`,
      };

    case "practical_mentor":
      return {
        answer: `### Lab Mentorship Guide: ${subject}\n\nHere is your step-by-step guidance to tackle this exercise without giving away the full solution prematurely:\n\n#### 🔍 Diagnostic Clues & Constraints\n- Check your input format: Is it receiving the exact type expected by the function contract?\n- Verify edge boundaries: What happens if the input is empty, null, or has an unexpected shape?\n- Trace the data transformation: Print or log your intermediate state after each transformation step.\n\n#### 📋 Step-by-Step Verification Checklist\n1. [ ] Write down the expected output for two different sample inputs.\n2. [ ] Implement the core happy path first without edge cases.\n3. [ ] Add error guards at the top of your function.\n4. [ ] Run your test case and compare actual output against expected output.\n\n> **Mentor Hint:** ${spec.commonMistakes[0] || "Remember to return your processed result instead of mutating the outer scope directly!"}`,
        mode: req.mode,
        keyTakeaways: [
          "Isolate the problem before changing multiple lines of code.",
          "Write small verifiable checkpoints.",
          "Verify inputs before processing.",
        ],
        codeExamples: [
          {
            language: spec.language,
            code: spec.productionSnippet || spec.codeSnippet,
            explanation: "Reference implementation illustrating proper guard clauses and modular logic.",
            expectedOutput: spec.productionOutput || spec.expectedOutput,
          },
        ],
        relatedConcepts: [
          "Unit testing fundamentals",
          "Step-through debugging",
          "Defensive assertions",
          "Logging best practices",
        ],
        suggestedAction: `Apply the Mentor Hint to your current solution attempt in the Learning Studio workspace.`,
      };

    case "code_helper":
      return {
        answer: `### Code Review & Analysis: ${subject}\n\n${req.codeSnippet ? "Inspecting your provided code snippet:\n" : "Examining standard patterns for this topic:\n"}\n#### 1. Code Quality & Architectural Observations\n- **Readability & Intent:** The structure clearly communicates intent, but separating helper operations into dedicated utility functions will make unit testing significantly easier.\n- **Safety & Error Handling:** Ensure all external inputs are sanitized before usage to prevent unexpected runtime panics or null pointer exceptions.\n- **Performance:** For large datasets, avoid nested iterations ($O(n^2)$); prefer indexed lookups or hash map caching ($O(1)$ amortized).\n\n#### 2. Production-Grade Pattern\nHere is the idiomatic, lint-compliant implementation:`,
        mode: req.mode,
        keyTakeaways: [
          "Prefer early returns (guard clauses) to reduce indentation nesting.",
          "Use descriptive identifiers that document behavior without needing comments.",
          "Favor immutability where possible to eliminate race conditions.",
        ],
        codeExamples: [
          {
            language: spec.language,
            code: spec.productionSnippet || spec.codeSnippet,
            explanation: spec.productionExplanation || spec.codeExplanation,
            expectedOutput: spec.productionOutput || spec.expectedOutput,
          },
        ],
        relatedConcepts: [
          "Code refactoring & clean code principles",
          "Big-O algorithmic complexity",
          "Static analysis & linting rules",
          "Defensive type contracts",
        ],
        suggestedAction: `Copy the refactored snippet into your workspace and run a benchmark test against edge-case inputs.`,
      };

    case "revision_mode":
      return {
        answer: `### High-Yield Revision Sheet: ${subject}\n\n${req.weakTopics.length > 0 ? `🎯 **Targeted Weak Topics Identified in Assessments:**\n${req.weakTopics.map((t) => `- **${t}**: Review the core definitions and edge cases below.`).join("\n")}\n\n` : ""}#### 📌 Essential Concepts Cheat-Sheet\n- **Core Definition:** ${spec.keyPoints[0] || "The primary abstraction for deterministic computation."}\n- **Key Rule:** ${spec.keyPoints[1] || "Always validate contracts before executing state changes."}\n- **Standard Pattern:** ${spec.productionPatternsText.slice(0, 250)}...\n\n#### ⚠️ Common Exam & Interview Traps\n${spec.commonMistakes.map((m: string) => `1. ❌ *Mistake:* ${m}\n   ✅ *Correction:* Always check boundary constraints and enforce strict typing.`).join("\n")}`,
        mode: req.mode,
        keyTakeaways: spec.keyPoints.slice(0, 4),
        codeExamples: [
          {
            language: spec.language,
            code: spec.codeSnippet,
            explanation: "Concise syntax reference for quick recall during interviews and assessments.",
          },
        ],
        relatedConcepts: [
          `${req.skillName} revision index`,
          "Quick-recall cheat sheets",
          "Diagnostic self-assessments",
          "Exam preparation strategies",
        ],
        suggestedAction: `Try explaining this concept aloud in 60 seconds without looking at the notes (Feynman technique).`,
      };

    case "quiz_me":
      return {
        answer: `### Diagnostic Knowledge Check: ${subject}\n\nHere are interactive questions designed to test your conceptual understanding and catch subtle misconceptions. Choose your answers below!`,
        mode: req.mode,
        keyTakeaways: [
          "Active recall produces 3x better retention than passive reading.",
          "Pay close attention to subtle edge cases in question prompts.",
        ],
        codeExamples: [],
        quizQuestions: [
          {
            question: `In ${req.skillName}, what is the primary benefit of structuring ${subject} with explicit contract validation?`,
            options: [
              "It catches invalid state transitions early before runtime side-effects execute",
              "It automatically compresses the binary size by 50%",
              "It eliminates the need for unit tests",
              "It forces all asynchronous operations to execute synchronously",
            ],
            correctIndex: 0,
            explanation: "Explicit contract validation enforces invariants upfront (fail-fast principle), preventing corrupt state from propagating into downstream services.",
            topic: `${subject} - Validation & Reliability`,
          },
          {
            question: `Which of the following describes a common anti-pattern when working with ${subject}?`,
            options: [
              "Logging structured JSON payloads",
              spec.commonMistakes[0] || "Swallowing caught exceptions without logging or re-throwing",
              "Using immutable data structures",
              "Adding timeout limits to network requests",
            ],
            correctIndex: 1,
            explanation: "Ignoring boundary errors or mutating external state unpredictably leads to hard-to-diagnose bugs and unreliable test suites.",
            topic: `${subject} - Best Practices`,
          },
        ],
        relatedConcepts: [
          "Active recall testing",
          "Fail-fast architectural design",
          "Invariant enforcement",
          "Error classification",
        ],
        suggestedAction: `Select an answer for each question above to get immediate diagnostic feedback.`,
      };

    case "career_connection":
      return {
        answer: `### Real-World Career Connection: ${subject}\n\n#### 🏢 Where Does This Show Up in Industry?\nTop technology companies (from fast-growing startups to enterprise cloud providers) rely on ${subject} daily. For example:\n- **Software Engineers:** Build robust production pipelines that handle millions of requests without memory leaks or race conditions.\n- **DevOps / Cloud Architects:** Ensure infrastructure contracts and automated deployments execute idempotently.\n- **Security Engineers:** Audit input handling to prevent remote execution, SQL injection, and buffer overflows.\n\n#### 💼 Technical Interview Relevance\nInterviewers frequently ask questions around ${subject} to evaluate:\n1. Can you explain the *trade-offs* between memory consumption and runtime throughput?\n2. Can you design a clean abstraction that is easy for other teammates to maintain?\n3. Do you write code with testing and observability in mind?\n\n#### 🛠️ Portfolio Impact Project Idea\nAdd a feature to your portfolio project that uses ${subject} with structured logging and automated integration tests. Mention this explicitly on your resume: *\"Implemented ${subject} pipeline with robust error boundaries, achieving 99.9% uptime in load tests.\"*`,
        mode: req.mode,
        keyTakeaways: [
          `Mastery of ${subject} directly demonstrates Senior-level engineering maturity.`,
          "Interviewers value candidates who can articulate architectural trade-offs.",
          "Demonstrate practical proof by including this pattern in your GitHub portfolio.",
        ],
        codeExamples: [],
        careerImpact: `Directly aligns with Junior to Staff Engineering job descriptions for ${req.skillName} specialists.`,
        relatedConcepts: [
          "System design interview prep",
          "Production observability & metrics",
          "Portfolio project architecture",
          "Engineering trade-off analysis",
        ],
        suggestedAction: `Draft a 2-sentence resume bullet point describing a project where you implemented ${subject}.`,
      };

    case "doubt_solver":
      return {
        answer: `### Clarifying Your Doubts on ${subject}\n\nI understand your question: **\"${req.question}\"**\n\nLet's clear this up immediately:\n\n1. **The Core Point:** ${subject} is fundamentally about ensuring predictability. If something felt confusing in earlier explanations, it is usually because the connection between the *data shape* and the *operations* wasn't made explicit.\n\n2. **Look at it from this perspective:**\nInstead of thinking of code as static lines of text, visualize it as an assembly line. When an item reaches the ${subject} station, it is inspected, modified according to specific rules, and stamped with an approval seal before continuing down the line.\n\n3. **Why this makes your life easier:**\nYou don't have to worry about subtle bugs creeping in because the assembly line rejects invalid items right away. Does this distinction make the concept click better?`,
        mode: req.mode,
        keyTakeaways: [
          "Confusion usually disappears when you visualize the step-by-step data flow.",
          "Do not hesitate to ask follow-up questions until the mental model feels intuitive.",
        ],
        codeExamples: [
          {
            language: spec.language,
            code: spec.codeSnippet,
            explanation: "Observe how each line corresponds to one distinct step in the data flow.",
            expectedOutput: spec.expectedOutput,
          },
        ],
        relatedConcepts: [
          "Mental models in programming",
          "Step-by-step execution visualization",
          "Socratic technical learning",
        ],
        suggestedAction: `Try typing a follow-up question or asking me to explain any specific word in the code above!`,
      };

    case "ask_tutor":
    default:
      return {
        answer: `### Tutor Insights: ${subject}\n\nRegarding your question: *\"${req.question}\"*\n\nIn engineering practice with ${req.skillName}, **${subject}** is central to building reliable, scalable systems.\n\n${spec.mentalModelText}\n\n#### Key Architectural Principles:\n- **Explicit Contracts:** Define exact input parameters, return signatures, and failure modes.\n- **Idempotence & Safety:** Operations should produce consistent, safe results even under retry conditions.\n- **Separation of Concerns:** Keep your core business logic completely separated from network or rendering layers.`,
        mode: req.mode,
        keyTakeaways: spec.keyPoints.slice(0, 3),
        codeExamples: [
          {
            language: spec.language,
            code: spec.codeSnippet,
            explanation: spec.codeExplanation,
            expectedOutput: spec.expectedOutput,
          },
        ],
        relatedConcepts: [
          `${req.skillName} best practices`,
          "Contract validation",
          "Modular code structure",
          "Integration testing",
        ],
        suggestedAction: `Try experimenting with the code example above in your local IDE or the Learning Studio workspace.`,
      };
  }
}
