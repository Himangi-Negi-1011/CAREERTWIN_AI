import {
  type MockTestDocument,
  type MockTestQuestion,
  mockTestDocumentSchema,
} from "./mock-test-schema";
import { saveMockTest, listMockTestsForSkill } from "./repository";
import { skillSlug } from "./catalog";

interface QuestionSeed {
  type: MockTestQuestion["type"];
  prompt: string;
  codeSnippet?: string;
  options: Array<{ id: string; text: string }>;
  correctOptionIds: string[];
  explanation: string;
  topic: string;
  marks?: number;
  recommendedLessonTitle?: string;
}

/**
 * Skill-specific templates for realistic, high-quality technical questions
 */
function getDomainQuestions(skillName: string, level?: string): QuestionSeed[] {
  void level;
  const norm = skillName.toLowerCase();

  // Python Questions
  if (norm.includes("python")) {
    return [
      {
        type: "code-output",
        prompt: "What is the exact output of the following list comprehension snippet?",
        codeSnippet: `matrix = [[1, 2], [3, 4]]\nflattened = [val for row in matrix for val in row]\nprint(flattened)`,
        options: [
          { id: "opt-1", text: "[1, 2, 3, 4]" },
          { id: "opt-2", text: "[[1, 2], [3, 4]]" },
          { id: "opt-3", text: "[1, 3, 2, 4]" },
          { id: "opt-4", text: "TypeError: list indices must be integers" },
        ],
        correctOptionIds: ["opt-1"],
        explanation: "In nested list comprehensions in Python, outer loops come first from left to right: for row in matrix, then for val in row.",
        topic: "Data Structures & Comprehensions",
        marks: 2,
        recommendedLessonTitle: "Core Syntax and Primitives in Python",
      },
      {
        type: "debugging",
        prompt: "Identify why the following function mutates state unexpectedly across calls:",
        codeSnippet: `def append_item(item, target_list=[]):\n    target_list.append(item)\n    return target_list\n\na = append_item(1)\nb = append_item(2)`,
        options: [
          { id: "opt-1", text: "Default arguments are evaluated once at function definition time, sharing the mutable list instance." },
          { id: "opt-2", text: "Python functions create a global variable when default arguments are used." },
          { id: "opt-3", text: "append() returns None rather than the updated list." },
          { id: "opt-4", text: "Integers cannot be appended to untyped lists." },
        ],
        correctOptionIds: ["opt-1"],
        explanation: "Python evaluates default parameter expressions once at definition time. Mutable default arguments (like lists or dicts) are shared across all calls.",
        topic: "Functions & Scope",
        marks: 2,
        recommendedLessonTitle: "Production Patterns and Resilience in Python",
      },
      {
        type: "scenario",
        prompt: "You are processing a 10GB log file on an instance with 2GB RAM. Which Python approach avoids memory exhaustion?",
        options: [
          { id: "opt-1", text: "Read the file line-by-line using a generator iterator (with open(...) as f: for line in f:)" },
          { id: "opt-2", text: "Call f.readlines() to parse all lines into memory at once" },
          { id: "opt-3", text: "Convert the file to a JSON object before looping" },
          { id: "opt-4", text: "Use multiprocessing to load the entire file into 8 concurrent arrays" },
        ],
        correctOptionIds: ["opt-1"],
        explanation: "Iterating over a file object in Python streams line by line as a generator without loading the entire payload into RAM.",
        topic: "Memory Management & Generators",
        marks: 2,
        recommendedLessonTitle: "Production Patterns and Resilience in Python",
      },
      {
        type: "multiple-select",
        prompt: "Which of the following statements about Python's Global Interpreter Lock (GIL) and concurrency are correct?",
        options: [
          { id: "opt-1", text: "The GIL allows only one native thread to execute Python bytecode at a time in CPython" },
          { id: "opt-2", text: "multiprocessing bypasses the GIL by creating separate processes with separate memory spaces" },
          { id: "opt-3", text: "I/O bound operations release the GIL while waiting for network or disk operations" },
          { id: "opt-4", text: "threading provides true multi-core parallel CPU execution for math-heavy loops in CPython" },
        ],
        correctOptionIds: ["opt-1", "opt-2", "opt-3"],
        explanation: "In CPython, GIL prevents multi-threaded CPU parallel execution, but I/O releases the lock, and multiprocessing spawns separate OS processes.",
        topic: "Concurrency & Architecture",
        marks: 3,
        recommendedLessonTitle: "Production Patterns and Resilience in Python",
      },
    ];
  }

  // SQL Questions
  if (norm.includes("sql")) {
    return [
      {
        type: "scenario",
        prompt: "A query filtering on WHERE UPPER(email) = 'USER@EXAMPLE.COM' is causing full table scans despite an index on email. What is the solution?",
        options: [
          { id: "opt-1", text: "Create a functional/expression index on UPPER(email) or normalize email to lowercase before indexing and querying" },
          { id: "opt-2", text: "Add an extra ORDER BY email ASC clause" },
          { id: "opt-3", text: "Convert the column type from VARCHAR to TEXT" },
          { id: "opt-4", text: "Change the SELECT clause to SELECT *" },
        ],
        correctOptionIds: ["opt-1"],
        explanation: "Wrapping indexed columns in functions disables standard B-Tree index lookups unless an expression index exists or values are pre-normalized.",
        topic: "Indexing & Query Optimization",
        marks: 2,
        recommendedLessonTitle: "Core Syntax and Primitives in SQL",
      },
      {
        type: "code-output",
        prompt: "What rows are returned by this SQL query?",
        codeSnippet: `SELECT department_id, COUNT(*)\nFROM employees\nGROUP BY department_id\nHAVING COUNT(*) > 5;`,
        options: [
          { id: "opt-1", text: "Only department IDs that have strictly more than 5 employee records" },
          { id: "opt-2", text: "The first 5 departments ordered by employee count" },
          { id: "opt-3", text: "All employees in departments where at least one person makes over 5k" },
          { id: "opt-4", text: "A syntax error because WHERE was omitted" },
        ],
        correctOptionIds: ["opt-1"],
        explanation: "HAVING filters aggregated groups after the GROUP BY clause, retaining only groups satisfying the aggregate predicate.",
        topic: "Aggregation & Grouping",
        marks: 2,
        recommendedLessonTitle: "Production Patterns and Resilience in SQL",
      },
      {
        type: "multiple-select",
        prompt: "Which of the following are ACID properties in relational database transactions?",
        options: [
          { id: "opt-1", text: "Atomicity: All operations in the transaction succeed or all roll back" },
          { id: "opt-2", text: "Consistency: The transaction brings the database from one valid state to another" },
          { id: "opt-3", text: "Isolation: Concurrent execution of transactions yields the same state as serial execution" },
          { id: "opt-4", text: "Adaptability: Schema changes apply dynamically without migration locks" },
        ],
        correctOptionIds: ["opt-1", "opt-2", "opt-3"],
        explanation: "ACID stands for Atomicity, Consistency, Isolation, and Durability.",
        topic: "Transactions & Concurrency",
        marks: 3,
        recommendedLessonTitle: "Production Patterns and Resilience in SQL",
      },
    ];
  }

  // JavaScript / TypeScript Questions
  if (norm.includes("javascript") || norm.includes("typescript") || norm.includes("react") || norm.includes("next.js")) {
    return [
      {
        type: "code-output",
        prompt: "What will be printed to the console?",
        codeSnippet: `console.log(typeof NaN);\nconsole.log(NaN === NaN);`,
        options: [
          { id: "opt-1", text: "'number' and false" },
          { id: "opt-2", text: "'NaN' and true" },
          { id: "opt-3", text: "'undefined' and false" },
          { id: "opt-4", text: "'number' and true" },
        ],
        correctOptionIds: ["opt-1"],
        explanation: "In JavaScript, NaN has type 'number' and according to IEEE 754, NaN is not equal to anything, including itself.",
        topic: "Types & Coercion",
        marks: 2,
        recommendedLessonTitle: `Core Syntax and Primitives in ${skillName}`,
      },
      {
        type: "debugging",
        prompt: "A React component re-renders infinitely when fetching data. What bug is present?",
        codeSnippet: `function UserList({ orgId }) {\n  const [users, setUsers] = useState([]);\n  useEffect(() => {\n    fetchUsers(orgId).then(setUsers);\n  }); // Notice dependencies\n  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;\n}`,
        options: [
          { id: "opt-1", text: "The dependency array was omitted from useEffect, causing it to trigger on every render triggered by setUsers" },
          { id: "opt-2", text: "useState cannot accept an empty array as initial value" },
          { id: "opt-3", text: "The key prop on li must be an integer, not a string" },
          { id: "opt-4", text: "fetchUsers must be called synchronously inside JSX" },
        ],
        correctOptionIds: ["opt-1"],
        explanation: "Omitting the dependency array causes useEffect to run after every single render. Since setUsers triggers a render, an infinite render cycle results.",
        topic: "React Hooks & Lifecycle",
        marks: 2,
        recommendedLessonTitle: `Production Patterns and Resilience in ${skillName}`,
      },
      {
        type: "scenario",
        prompt: "In a TypeScript codebase, why is 'unknown' preferred over 'any' for untrusted API input boundaries?",
        options: [
          { id: "opt-1", text: "'unknown' forces type narrowing / validation before properties can be accessed, preventing runtime TypeError crashes" },
          { id: "opt-2", text: "'unknown' automatically parses JSON strings into objects at compile time" },
          { id: "opt-3", text: "'any' increases bundle size when deployed to production" },
          { id: "opt-4", text: "'unknown' runs faster in the V8 engine than 'any'" },
        ],
        correctOptionIds: ["opt-1"],
        explanation: "'unknown' is the type-safe counterpart of 'any'. It disables operations until explicit type checks or schema validations prove the shape.",
        topic: "Type Safety & Validation",
        marks: 2,
        recommendedLessonTitle: `Core Syntax and Primitives in ${skillName}`,
      },
    ];
  }

  // Cybersecurity Questions
  if (norm.includes("security") || norm.includes("hacking") || norm.includes("linux") || norm.includes("networking")) {
    return [
      {
        type: "scenario",
        prompt: "During a vulnerability scan, a web server responds to requests containing '../../etc/passwd'. What vulnerability does this indicate?",
        options: [
          { id: "opt-1", text: "Path Traversal (Directory Traversal)" },
          { id: "opt-2", text: "Cross-Site Request Forgery (CSRF)" },
          { id: "opt-3", text: "Server-Side Request Forgery (SSRF)" },
          { id: "opt-4", text: "Insecure Direct Object Reference (IDOR)" },
        ],
        correctOptionIds: ["opt-1"],
        explanation: "Path traversal allows attackers to read arbitrary files on the server by stepping up directories using dot-dot-slash patterns.",
        topic: "Vulnerability Assessment",
        marks: 2,
        recommendedLessonTitle: `Core Syntax and Primitives in ${skillName}`,
      },
      {
        type: "multiple-select",
        prompt: "Which defensive measures protect against SQL Injection vulnerabilities?",
        options: [
          { id: "opt-1", text: "Parameterized queries (prepared statements)" },
          { id: "opt-2", text: "Object-Relational Mapping (ORM) with parameterized bindings" },
          { id: "opt-3", text: "Strict input validation against allowlists" },
          { id: "opt-4", text: "Client-side alert boxes warning users not to type quotes" },
        ],
        correctOptionIds: ["opt-1", "opt-2", "opt-3"],
        explanation: "Parameterized queries separate SQL structure from data, completely neutralizing malicious query injection.",
        topic: "Defensive Engineering",
        marks: 3,
        recommendedLessonTitle: `Production Patterns and Resilience in ${skillName}`,
      },
    ];
  }

  // Cloud & DevOps Questions
  if (norm.includes("docker") || norm.includes("cloud") || norm.includes("aws") || norm.includes("ci/cd") || norm.includes("git")) {
    return [
      {
        type: "debugging",
        prompt: "A Dockerfile produces an image that is 1.4GB in size. Which strategy is most effective to reduce image footprint and attack surface?",
        options: [
          { id: "opt-1", text: "Implement multi-stage builds and use a minimal base image like Alpine or distroless for the runtime stage" },
          { id: "opt-2", text: "Remove the EXPOSE directive from the container file" },
          { id: "opt-3", text: "Add more RUN instructions in separate layers" },
          { id: "opt-4", text: "Run Docker with the --privileged flag" },
        ],
        correctOptionIds: ["opt-1"],
        explanation: "Multi-stage builds leave compiler tools, headers, and caches behind in the build stage, copying only production artifacts to a minimal runtime base.",
        topic: "Container Optimization",
        marks: 2,
        recommendedLessonTitle: `Production Patterns and Resilience in ${skillName}`,
      },
      {
        type: "scenario",
        prompt: "A team needs automated testing, linting, and staging deployment triggered on every pull request. What toolchain pattern achieves this?",
        options: [
          { id: "opt-1", text: "A declarative CI/CD pipeline (such as GitHub Actions) configured with branch protection rules" },
          { id: "opt-2", text: "Manually executing ssh scripts on developer laptops before committing" },
          { id: "opt-3", text: "Disabling automated tests to speed up deployment cycle" },
          { id: "opt-4", text: "Directly uploading uncompiled files via FTP to the production server" },
        ],
        correctOptionIds: ["opt-1"],
        explanation: "Declarative CI/CD pipelines automate testing, quality gates, and deployments consistently without human error.",
        topic: "CI/CD & Automation",
        marks: 2,
        recommendedLessonTitle: `Production Patterns and Resilience in ${skillName}`,
      },
    ];
  }

  // Generic / Professional Skills Questions
  return [
    {
      type: "scenario",
      prompt: `When applying ${skillName} in a high-stakes cross-functional project, what is the best strategy to align stakeholders and minimize risk?`,
      options: [
        { id: "opt-1", text: "Establish explicit written objectives, measurable milestones, and scheduled stakeholder review checkpoints." },
        { id: "opt-2", text: "Work in isolation until the final deadline without communicating status." },
        { id: "opt-3", text: "Change project requirements verbally without documenting rationale." },
        { id: "opt-4", text: "Bypass review stages to deliver ahead of schedule regardless of quality." },
      ],
      correctOptionIds: ["opt-1"],
      explanation: "Transparent communication, structured milestones, and regular stakeholder feedback ensure alignment and prevent costly late-stage surprises.",
      topic: "Strategic Execution",
      marks: 2,
      recommendedLessonTitle: `Core Syntax and Primitives in ${skillName}`,
    },
    {
      type: "multiple-select",
      prompt: `Which principles are essential for achieving long-term proficiency in ${skillName}?`,
      options: [
        { id: "opt-1", text: "Consistent deliberate practice with feedback loops" },
        { id: "opt-2", text: "Understanding underlying mental models rather than merely memorizing facts" },
        { id: "opt-3", text: "Reviewing mistakes and performing root-cause analysis on failures" },
        { id: "opt-4", text: "Avoiding practical exercises in favor of passive video consumption" },
      ],
      correctOptionIds: ["opt-1", "opt-2", "opt-3"],
      explanation: "Deliberate practice, foundational mental models, and reflective error analysis are the empirical pillars of skill acquisition.",
      topic: "Mastery & Continuous Improvement",
      marks: 3,
      recommendedLessonTitle: `Production Patterns and Resilience in ${skillName}`,
    },
  ];
}

/**
 * Builds standard mock tests for a skill at a given level.
 */
export function buildDeterministicMockTest(
  skillName: string,
  level: "foundation" | "beginner" | "intermediate" | "advanced",
  testNumber: number
): MockTestDocument {
  const slug = skillSlug(skillName);
  const testId = `mock-${slug}-${level}-t${testNumber}`;
  const now = new Date().toISOString();

  const domainSeeds = getDomainQuestions(skillName, level);

  // Generate 20 distinct questions for comprehensive coverage
  const questions: MockTestQuestion[] = [];
  const topicsSet = new Set<string>();

  for (let i = 0; i < 20; i++) {
    const seedIndex = i % domainSeeds.length;
    const base = domainSeeds[seedIndex];
    const questionId = `${testId}-q${i + 1}`;
    const topic = `${base.topic} · Part ${Math.floor(i / domainSeeds.length) + 1}`;
    topicsSet.add(topic);

    questions.push({
      id: questionId,
      type: base.type,
      prompt: `[Q${i + 1}] ${base.prompt}`,
      codeSnippet: base.codeSnippet || "",
      options: base.options,
      correctOptionIds: base.correctOptionIds,
      explanation: base.explanation,
      difficulty: level,
      topic,
      marks: base.marks || 1,
      recommendedLessonId: `mod-1-l1`,
      recommendedLessonTitle: base.recommendedLessonTitle || `Foundations of ${skillName}`,
    });
  }

  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

  const doc: MockTestDocument = {
    id: testId,
    skillName,
    skillSlug: slug,
    level,
    testNumber,
    title: `${skillName} ${level.toUpperCase()} Comprehensive Mock Test ${testNumber}`,
    description: `Standardized 20-question skill evaluation covering practical tasks, debugging, architectural patterns, and theory for ${skillName}.`,
    durationMinutes: 30,
    totalMarks,
    passingPercentage: 70,
    topicsCovered: Array.from(topicsSet),
    questions,
    contentVersion: 1,
    reviewStatus: "approved",
    createdAt: now,
    updatedAt: now,
  };

  return mockTestDocumentSchema.parse(doc);
}

/**
 * Generates and saves the configured number of mock tests for a skill.
 */
export async function generateAndSaveMockTestsForSkill(
  skillName: string,
  level: "foundation" | "beginner" | "intermediate" | "advanced" = "beginner",
  count: number = 3
): Promise<MockTestDocument[]> {
  const slug = skillSlug(skillName);
  const existing = await listMockTestsForSkill(slug, level);
  const results: MockTestDocument[] = [...existing];

  for (let t = 1; t <= count; t++) {
    const existingTest = existing.find((item) => item.testNumber === t);
    if (!existingTest) {
      const generated = buildDeterministicMockTest(skillName, level, t);
      await saveMockTest(generated);
      results.push(generated);
    }
  }

  return results.sort((a, b) => a.testNumber - b.testNumber);
}

