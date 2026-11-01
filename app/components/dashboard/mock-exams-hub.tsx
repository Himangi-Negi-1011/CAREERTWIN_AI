"use client";

import { useState, useEffect } from "react";
import {
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Flag,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  BookOpen,
} from "lucide-react";

interface MockExamQuestion {
  id: string;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface MockExamDefinition {
  id: string;
  skill: string;
  title: string;
  level: "beginner" | "intermediate" | "advanced";
  durationMinutes: number;
  passingScore: number;
  questions: MockExamQuestion[];
}

export const MOCK_EXAMS: MockExamDefinition[] = [
  {
    id: "python-foundation-exam",
    skill: "Python",
    title: "Python Foundations & Execution Mechanics",
    level: "beginner",
    durationMinutes: 30,
    passingScore: 70,
    questions: [
      {
        id: "py-1",
        topic: "Execution Model",
        question: "How does CPython execute Python source code?",
        options: [
          "Compiles directly to machine assembly instructions",
          "Compiles source code into bytecode (.pyc) which is executed by the CPython virtual machine",
          "Interprets source lines on-the-fly without any intermediate bytecode step",
          "Converts Python code into C code and compiles it with GCC",
        ],
        correctIndex: 1,
        explanation:
          "CPython first compiles source code into intermediate bytecode instructions, then executes those instructions within a virtual machine stack loop.",
      },
      {
        id: "py-2",
        topic: "Data Structures",
        question: "What is the average time complexity of a key lookup in a Python dictionary?",
        options: ["O(n)", "O(log n)", "O(1)", "O(n log n)"],
        correctIndex: 2,
        explanation:
          "Python dictionaries are implemented using hash tables, offering amortized O(1) time complexity for average key lookups.",
      },
      {
        id: "py-3",
        topic: "Object Orientation",
        question: "What does the `__init__` method do in a Python class?",
        options: [
          "Allocates raw memory for the object before instantiation",
          "Initializes the attributes of an already-created instance (`self`)",
          "Acts as a destructor when garbage collection occurs",
          "Registers the class in the global module namespace",
        ],
        correctIndex: 1,
        explanation:
          "`__new__` handles object creation/allocation, while `__init__` initializes instance attributes on the newly created object.",
      },
      {
        id: "py-4",
        topic: "Scope & Mutability",
        question: "What happens when you pass a mutable list as a default argument to a function `def append_item(val, items=[])`?",
        options: [
          "A fresh list is allocated every time the function is called",
          "Python raises a `MutableDefaultArgumentError` during parsing",
          "The default list is created once at function definition time and shared across subsequent calls",
          "The argument is automatically converted to an immutable tuple",
        ],
        correctIndex: 2,
        explanation:
          "Default argument expressions in Python are evaluated once when the function definition is executed, leading to state persistence across invocations.",
      },
      {
        id: "py-5",
        topic: "Testing",
        question: "In pytest, what is the purpose of a `@pytest.fixture`?",
        options: [
          "To enforce type annotations on test function arguments",
          "To provide a baseline environment, state, or mock object for tests with reusable setup and teardown",
          "To automatically run tests in parallel across CPU cores",
          "To compile Python bytecode ahead of time",
        ],
        correctIndex: 1,
        explanation:
          "Fixtures provide a reliable, modular, and reusable way to set up preconditions and clean up resources for tests.",
      },
    ],
  },
  {
    id: "sql-relational-exam",
    skill: "SQL",
    title: "SQL Relational Architecture & Optimization",
    level: "beginner",
    durationMinutes: 30,
    passingScore: 70,
    questions: [
      {
        id: "sql-1",
        topic: "Join Mechanics",
        question: "What is the difference between an INNER JOIN and a LEFT OUTER JOIN?",
        options: [
          "INNER JOIN returns all rows from both tables; LEFT JOIN returns only matches",
          "INNER JOIN returns only rows with matching keys in both tables; LEFT JOIN returns all rows from the left table and matched rows from the right table",
          "INNER JOIN is slower because it always uses full table scans",
          "LEFT JOIN modifies the underlying table schemas during query execution",
        ],
        correctIndex: 1,
        explanation:
          "An INNER JOIN requires matches on both sides; a LEFT OUTER JOIN preserves all left-table rows, populating NULLs for right-table columns when no match exists.",
      },
      {
        id: "sql-2",
        topic: "Aggregations",
        question: "When should the `HAVING` clause be used instead of `WHERE`?",
        options: [
          "When filtering indexed primary keys",
          "When filtering aggregated results produced by `GROUP BY` functions (e.g. `COUNT`, `AVG`)",
          "When joining more than 3 tables together",
          "When ordering results in descending order",
        ],
        correctIndex: 1,
        explanation:
          "`WHERE` filters individual rows before grouping; `HAVING` filters group rows after aggregation.",
      },
      {
        id: "sql-3",
        topic: "Indexing",
        question: "What is the primary benefit of a B-Tree index on a frequently filtered column?",
        options: [
          "Reduces disk space by compressing column values",
          "Enables logarithmic O(log n) search time instead of sequential full-table scans O(n)",
          "Prevents duplicate values from being inserted into the column",
          "Ensures transactions are ACID compliant",
        ],
        correctIndex: 1,
        explanation:
          "B-Tree indexes structure values into balanced trees, allowing the database engine to locate records in O(log n) time.",
      },
      {
        id: "sql-4",
        topic: "ACID Guarantees",
        question: "What does the 'A' (Atomicity) represent in ACID transaction guarantees?",
        options: [
          "All transactions must be executed on a single CPU thread",
          "All operations in a transaction succeed completely, or the entire transaction is rolled back with no partial effects",
          "Data is automatically replicated across all availability zones",
          "Table schemas cannot be modified during active queries",
        ],
        correctIndex: 1,
        explanation:
          "Atomicity guarantees all-or-nothing execution: if any statement in a transaction fails, all changes are rolled back.",
      },
      {
        id: "sql-5",
        topic: "Subqueries",
        question: "What distinguishes a correlated subquery from an uncorrelated subquery?",
        options: [
          "Correlated subqueries reference columns from the outer query and evaluate once per outer row",
          "Uncorrelated subqueries cannot be used inside `WHERE` clauses",
          "Correlated subqueries only run inside stored procedures",
          "There is no difference; they are synonymous terms",
        ],
        correctIndex: 0,
        explanation:
          "A correlated subquery references columns from the outer query, requiring re-evaluation for each candidate row processed by the outer query.",
      },
    ],
  },
  {
    id: "cloud-security-exam",
    skill: "Cloud Computing",
    title: "Cloud Infrastructure & Least-Privilege IAM",
    level: "beginner",
    durationMinutes: 30,
    passingScore: 70,
    questions: [
      {
        id: "cld-1",
        topic: "Shared Responsibility",
        question: "Under the Cloud Shared Responsibility Model, who is responsible for patching the guest operating system on an IaaS virtual machine?",
        options: [
          "The cloud provider exclusively",
          "The customer",
          "The hardware manufacturer",
          "Neither; IaaS VMs never require security patches",
        ],
        correctIndex: 1,
        explanation:
          "In IaaS (like AWS EC2 or GCP Compute Engine), the customer is responsible for configuring, updating, and patching the guest OS and application stack.",
      },
      {
        id: "cld-2",
        topic: "IAM Best Practices",
        question: "What is the core principle of Least Privilege in cloud access management?",
        options: [
          "Granting full administrator access to all team members to prevent permission blockers",
          "Granting identities only the minimum necessary permissions required to perform their specific tasks and nothing more",
          "Disabling multi-factor authentication for automated worker roles",
          "Using long-lived access keys instead of temporary IAM roles",
        ],
        correctIndex: 1,
        explanation:
          "Least Privilege mandates giving each identity only the precise permissions required for their tasks, minimizing attack blast radius.",
      },
      {
        id: "cld-3",
        topic: "Networking",
        question: "What is the primary function of a Virtual Private Cloud (VPC) subnet route table?",
        options: [
          "To determine how network traffic from the subnet is directed (e.g. to an Internet Gateway or NAT Gateway)",
          "To automatically scale compute instances when CPU exceeds 80%",
          "To encrypt files stored in object storage at rest",
          "To manage domain name registration and DNS records",
        ],
        correctIndex: 0,
        explanation:
          "Route tables contain a set of rules (routes) that determine where network traffic from your subnet or gateway is directed.",
      },
      {
        id: "cld-4",
        topic: "Storage",
        question: "Which cloud storage type is best suited for storing static media files, backups, and log archives accessible via HTTP?",
        options: [
          "Block storage (EBS / Persistent Disk)",
          "Object storage (Amazon S3 / Google Cloud Storage)",
          "Local ephemeral scratch NVMe disks",
          "Relational OLTP tables",
        ],
        correctIndex: 1,
        explanation:
          "Object storage provides virtually unlimited scalability, high durability, and HTTP REST APIs ideal for unstructured data and media.",
      },
      {
        id: "cld-5",
        topic: "Resilience",
        question: "What is the definition of a Cloud Availability Zone (AZ)?",
        options: [
          "A geographic continent",
          "One or more discrete data centers with redundant power, networking, and connectivity within a geographic region",
          "A software virtual machine cluster running in one server rack",
          "A client browser caching layer",
        ],
        correctIndex: 1,
        explanation:
          "An Availability Zone consists of one or more physical data centers designed to be isolated from failures in other AZs.",
      },
    ],
  },
  {
    id: "cybersecurity-defense-exam",
    skill: "Cybersecurity",
    title: "Cyber Defense, Cryptography & Threat Triage",
    level: "beginner",
    durationMinutes: 30,
    passingScore: 70,
    questions: [
      {
        id: "sec-1",
        topic: "CIA Triad",
        question: "What are the three pillars of the CIA Triad in information security?",
        options: [
          "Control, Inspection, Authorization",
          "Confidentiality, Integrity, Availability",
          "Cloud, Infrastructure, Architecture",
          "Cryptography, Identification, Authentication",
        ],
        correctIndex: 1,
        explanation:
          "The CIA Triad stands for Confidentiality (privacy), Integrity (accuracy/trustworthiness), and Availability (accessibility when needed).",
      },
      {
        id: "sec-2",
        topic: "Threat Vectors",
        question: "What type of attack involves an adversary intercepting and potentially altering communications between two parties without their knowledge?",
        options: [
          "Cross-Site Scripting (XSS)",
          "Man-in-the-Middle (MITM) attack",
          "Buffer overflow attack",
          "DNS amplification DDoS",
        ],
        correctIndex: 1,
        explanation:
          "A Man-in-the-Middle attack intercepts traffic between two legitimate endpoints, often mitigated with TLS encryption and certificate validation.",
      },
      {
        id: "sec-3",
        topic: "Cryptography",
        question: "Why should passwords never be stored using standard MD5 or SHA-256 hashes?",
        options: [
          "MD5 and SHA-256 are too slow for modern CPUs",
          "They are fast cryptographic hashes vulnerable to rapid GPU brute-force attacks and rainbow tables; adaptive key-stretching functions (bcrypt, Argon2) must be used",
          "They produce variable-length output strings that cannot be indexed",
          "Modern databases cannot store binary hash outputs",
        ],
        correctIndex: 1,
        explanation:
          "General-purpose hashes are engineered for speed, making them trivial to crack with modern GPUs. Slow, memory-hard hashes like Argon2 or bcrypt protect against brute-force.",
      },
      {
        id: "sec-4",
        topic: "Application Security",
        question: "What is the most effective defense against SQL Injection (SQLi) vulnerabilities in web applications?",
        options: [
          "Blacklisting the word 'SELECT' from form input fields",
          "Using parameterized queries and prepared statements",
          "Encrypting the database disk volume at rest",
          "Limiting form inputs to fewer than 50 characters",
        ],
        correctIndex: 1,
        explanation:
          "Parameterized queries separate SQL instructions from user-supplied data, ensuring input is treated strictly as data literals rather than executable SQL code.",
      },
      {
        id: "sec-5",
        topic: "Network Defense",
        question: "What is the primary function of a Stateful Inspection Firewall?",
        options: [
          "Tracking active connections and allowing return traffic belonging to an established session",
          "Scanning source code for memory allocation bugs",
          "Generating SSL/TLS certificates on client devices",
          "Running unit tests during software build pipelines",
        ],
        correctIndex: 0,
        explanation:
          "Stateful firewalls track the state of active network connections (TCP handshakes) and dynamically permit return packets matching existing conversations.",
      },
    ],
  },
];

interface MockExamsHubProps {
  ownerKey?: string;
  onNavigateTwin?: () => void;
  onSelectCourse?: (slug: string) => void;
}

export function MockExamsHubView({
  ownerKey = "default",
  onNavigateTwin,
  onSelectCourse,
}: MockExamsHubProps) {
  const [selectedSkill, setSelectedSkill] = useState<string>("all");
  const [activeExam, setActiveExam] = useState<MockExamDefinition | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(1800);
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);
  const [scoreReport, setScoreReport] = useState<{
    total: number;
    correct: number;
    percentage: number;
    passed: boolean;
    topicBreakdown: Record<string, { total: number; correct: number }>;
  } | null>(null);
  const [pastAttempts, setPastAttempts] = useState<
    Array<{ examId: string; percentage: number; passed: boolean; timestamp: string }>
  >([]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(`careertwin-mock-exam-attempts:${ownerKey}`);
      if (stored) {
        setPastAttempts(JSON.parse(stored));
      }
    } catch {
      // storage fallback
    }
  }, [ownerKey]);

  // Exam Countdown Timer
  useEffect(() => {
    if (!activeExam || examSubmitted) return;

    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeExam, examSubmitted]);

  const startExam = (exam: MockExamDefinition) => {
    setActiveExam(exam);
    setUserAnswers({});
    setFlaggedQuestions([]);
    setCurrentQuestionIndex(0);
    setTimeLeftSeconds(exam.durationMinutes * 60);
    setExamSubmitted(false);
    setScoreReport(null);
  };

  const handleSelectAnswer = (questionId: string, optionIndex: number) => {
    if (examSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const toggleFlagQuestion = (questionId: string) => {
    setFlaggedQuestions((prev) =>
      prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId]
    );
  };

  const handleFinishExam = () => {
    if (!activeExam) return;

    let correctCount = 0;
    const topicMap: Record<string, { total: number; correct: number }> = {};

    activeExam.questions.forEach((q) => {
      if (!topicMap[q.topic]) {
        topicMap[q.topic] = { total: 0, correct: 0 };
      }
      topicMap[q.topic].total += 1;

      const userAns = userAnswers[q.id];
      if (userAns === q.correctIndex) {
        correctCount += 1;
        topicMap[q.topic].correct += 1;
      }
    });

    const totalQuestions = activeExam.questions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const passed = percentage >= activeExam.passingScore;

    const report = {
      total: totalQuestions,
      correct: correctCount,
      percentage,
      passed,
      topicBreakdown: topicMap,
    };

    setScoreReport(report);
    setExamSubmitted(true);

    // Save Attempt
    const attemptRecord = {
      examId: activeExam.id,
      percentage,
      passed,
      timestamp: new Date().toISOString(),
    };
    const updatedAttempts = [attemptRecord, ...pastAttempts];
    setPastAttempts(updatedAttempts);

    try {
      window.localStorage.setItem(
        `careertwin-mock-exam-attempts:${ownerKey}`,
        JSON.stringify(updatedAttempts)
      );
    } catch {
      // storage fallback
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const filteredExams = MOCK_EXAMS.filter((exam) => {
    if (selectedSkill !== "all" && exam.skill !== selectedSkill) return false;
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in" data-testid="mock-exams-hub-view">
      {/* If No Active Exam: Show Exams Catalogue */}
      {!activeExam && (
        <>
          {/* Header Banner */}
          <div className="rounded-2xl border border-ink/8 bg-gradient-to-r from-amber-950/10 via-brand-forest/10 to-transparent p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-600/20 bg-amber-600/10 px-3 py-1 text-xs font-semibold text-amber-800">
                  <Award className="h-3.5 w-3.5" />
                  Cisco-Inspired Technical Assessments
                </div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-ink font-serif">
                  Timed Mock Exams & Certification Checkpoints
                </h1>
                <p className="text-sm md:text-base text-ink/70">
                  Validate your skills under realistic, timed exam conditions. Instant grading,
                  comprehensive explanations, and topic-wise diagnostics that feed directly into your
                  Career Twin skill mastery matrix.
                </p>
              </div>

              <div className="rounded-xl border border-ink/10 bg-white p-4 shadow-xs md:max-w-xs w-full space-y-1">
                <span className="text-xs font-semibold text-ink">Completed Exam Sessions</span>
                <p className="text-2xl font-bold text-brand-forest">{pastAttempts.length}</p>
                <p className="text-[11px] text-ink/60">
                  Passed: {pastAttempts.filter((a) => a.passed).length}
                </p>
              </div>
            </div>
          </div>

          {/* Skill Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-ink/10 pb-4">
            {["all", "Python", "SQL", "Cloud Computing", "Cybersecurity"].map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => setSelectedSkill(skill)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition-all ${
                  selectedSkill === skill
                    ? "bg-ink text-white"
                    : "bg-surface text-ink/70 hover:bg-ink/5"
                }`}
              >
                {skill === "all" ? "All Skills" : skill}
              </button>
            ))}
          </div>

          {/* Exams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredExams.map((exam) => {
              const attempts = pastAttempts.filter((a) => a.examId === exam.id);
              const bestScore = attempts.length > 0 ? Math.max(...attempts.map((a) => a.percentage)) : null;

              return (
                <div
                  key={exam.id}
                  className="rounded-2xl border border-ink/10 bg-white p-6 shadow-xs hover:border-brand-forest/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-surface px-2.5 py-0.5 text-[11px] font-semibold text-ink/70 uppercase">
                        {exam.skill}
                      </span>
                      <span className="rounded-full bg-brand-forest/10 px-2 py-0.5 text-[10px] font-semibold text-brand-forest capitalize">
                        {exam.level}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-ink">{exam.title}</h3>

                    <div className="grid grid-cols-3 gap-2 border-t border-ink/5 pt-3 text-[11px] text-ink/65">
                      <div className="flex flex-col">
                        <span className="font-semibold text-ink">{exam.questions.length}</span>
                        <span className="text-[10px] text-ink/50">Questions</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-ink">{exam.durationMinutes} Mins</span>
                        <span className="text-[10px] text-ink/50">Time Limit</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-ink">{exam.passingScore}%</span>
                        <span className="text-[10px] text-ink/50">Passing Mark</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-ink/8 pt-4">
                    <span className="text-xs text-ink/60">
                      {bestScore !== null ? (
                        <span className="font-semibold text-brand-forest">
                          Best: {bestScore}% ({attempts.length} attempts)
                        </span>
                      ) : (
                        "Not attempted yet"
                      )}
                    </span>

                    <button
                      type="button"
                      onClick={() => startExam(exam)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-brand-forest px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-forest/90 transition-all"
                    >
                      Take Timed Exam <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Active Exam Engine View */}
      {activeExam && !examSubmitted && (
        <div className="space-y-6">
          {/* Exam Header with Live Timer and Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-ink/10 bg-white p-4 md:p-6 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-ink/60">
                <span>{activeExam.skill}</span>
                <span>•</span>
                <span className="capitalize">{activeExam.level} Level</span>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-ink">{activeExam.title}</h2>
            </div>

            <div className="flex items-center gap-4">
              <div
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-sm font-bold shadow-xs ${
                  timeLeftSeconds < 300
                    ? "bg-rose-50 text-rose-700 border border-rose-200 animate-pulse"
                    : "bg-ink/5 text-ink border border-ink/10"
                }`}
              >
                <Clock className="h-4 w-4" />
                <span>{formatTimer(timeLeftSeconds)}</span>
              </div>

              <button
                type="button"
                onClick={handleFinishExam}
                className="rounded-xl bg-brand-forest px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-forest/90"
              >
                Submit Exam
              </button>
            </div>
          </div>

          {/* Question Navigator Pills */}
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-ink/10 bg-surface p-3">
            <span className="text-xs font-semibold text-ink/50 uppercase mr-2">Questions:</span>
            {activeExam.questions.map((q, idx) => {
              const isAnswered = userAnswers[q.id] !== undefined;
              const isFlagged = flaggedQuestions.includes(q.id);
              const isCurrent = currentQuestionIndex === idx;

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all relative ${
                    isCurrent
                      ? "ring-2 ring-brand-forest bg-white text-brand-forest shadow-xs"
                      : isAnswered
                      ? "bg-brand-forest text-white"
                      : "bg-white text-ink/70 hover:bg-ink/5 border border-ink/10"
                  }`}
                >
                  {idx + 1}
                  {isFlagged && (
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-500" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Current Question Body */}
          {(() => {
            const currentQ = activeExam.questions[currentQuestionIndex];
            const isFlagged = flaggedQuestions.includes(currentQ.id);

            return (
              <div className="rounded-2xl border border-ink/10 bg-white p-6 md:p-8 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-ink/10 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-brand-forest uppercase tracking-wider">
                      Question {currentQuestionIndex + 1} of {activeExam.questions.length}
                    </span>
                    <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[10px] text-ink/60">
                      Topic: {currentQ.topic}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleFlagQuestion(currentQ.id)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                      isFlagged
                        ? "bg-amber-50 text-amber-700 border border-amber-300"
                        : "text-ink/60 hover:bg-surface"
                    }`}
                  >
                    <Flag className="h-3.5 w-3.5" />
                    {isFlagged ? "Flagged for Review" : "Flag Question"}
                  </button>
                </div>

                <p className="text-base md:text-lg font-medium text-ink leading-relaxed">
                  {currentQ.question}
                </p>

                {/* Multiple Choice Options */}
                <div className="space-y-3">
                  {currentQ.options.map((opt, optIdx) => {
                    const isSelected = userAnswers[currentQ.id] === optIdx;

                    return (
                      <label
                        key={optIdx}
                        onClick={() => handleSelectAnswer(currentQ.id, optIdx)}
                        className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-all ${
                          isSelected
                            ? "border-brand-forest bg-brand-forest/5 ring-1 ring-brand-forest/30 shadow-xs"
                            : "border-ink/10 hover:border-ink/20 hover:bg-surface"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQ.id}`}
                          checked={isSelected}
                          onChange={() => handleSelectAnswer(currentQ.id, optIdx)}
                          className="mt-1 h-4 w-4 text-brand-forest focus:ring-brand-forest"
                        />
                        <span className="text-xs md:text-sm text-ink leading-relaxed">{opt}</span>
                      </label>
                    );
                  })}
                </div>

                {/* Footer Navigation */}
                <div className="flex items-center justify-between border-t border-ink/10 pt-4">
                  <button
                    type="button"
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-ink/70 hover:text-ink disabled:opacity-30"
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </button>

                  <button
                    type="button"
                    disabled={currentQuestionIndex === activeExam.questions.length - 1}
                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-forest hover:underline disabled:opacity-30"
                  >
                    Next Question <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Post-Exam Score Report & Diagnostics */}
      {activeExam && examSubmitted && scoreReport && (
        <div className="space-y-6">
          {/* Result Card */}
          <div
            className={`rounded-2xl border p-6 md:p-8 shadow-xs ${
              scoreReport.passed
                ? "border-emerald-200 bg-emerald-500/10 text-emerald-950"
                : "border-rose-200 bg-rose-500/10 text-rose-950"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider bg-white/80">
                  {scoreReport.passed ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Exam Passed
                    </span>
                  ) : (
                    <span className="text-rose-700 flex items-center gap-1">
                      <XCircle className="h-3.5 w-3.5" /> Passing Threshold Not Reached
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold font-serif">{activeExam.title}</h2>
                <p className="text-sm opacity-80">
                  You scored {scoreReport.correct} out of {scoreReport.total} questions correctly (
                  {scoreReport.percentage}%). Required passing score: {activeExam.passingScore}%.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => startExam(activeExam)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-current px-4 py-2 text-xs font-semibold hover:bg-white/40 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Retake Exam
                </button>

                <button
                  type="button"
                  onClick={() => setActiveExam(null)}
                  className="rounded-xl bg-ink px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-ink/90 transition-all"
                >
                  Return to Exams Hub
                </button>
              </div>
            </div>
          </div>

          {/* Topic-Wise Breakdown */}
          <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-ink text-sm uppercase tracking-wider text-ink/60">
              Topic Diagnostic Breakdown
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(scoreReport.topicBreakdown).map(([topic, stats]) => {
                const pct = Math.round((stats.correct / stats.total) * 100);
                return (
                  <div key={topic} className="rounded-xl border border-ink/8 bg-surface p-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-ink">{topic}</span>
                      <span
                        className={`font-bold ${
                          pct >= 70 ? "text-emerald-700" : "text-amber-700"
                        }`}
                      >
                        {pct}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-ink/10 overflow-hidden">
                      <div
                        className={`h-full ${pct >= 70 ? "bg-emerald-600" : "bg-amber-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-ink/50">
                      {stats.correct} / {stats.total} correct
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Full Question-by-Question Review */}
          <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-xs space-y-6">
            <h3 className="font-bold text-ink text-sm uppercase tracking-wider text-ink/60">
              Detailed Question Review & Explanations
            </h3>

            <div className="space-y-6">
              {activeExam.questions.map((q, qIdx) => {
                const userAns = userAnswers[q.id];
                const isCorrect = userAns === q.correctIndex;

                return (
                  <div
                    key={q.id}
                    className={`rounded-xl border p-5 space-y-3 ${
                      isCorrect ? "border-emerald-200 bg-emerald-50/20" : "border-rose-200 bg-rose-50/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ink">Question {qIdx + 1}</span>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold ${
                          isCorrect ? "text-emerald-700" : "text-rose-700"
                        }`}
                      >
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" /> Correct
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3.5 w-3.5" /> Incorrect
                          </>
                        )}
                      </span>
                    </div>

                    <p className="text-sm font-medium text-ink">{q.question}</p>

                    <div className="space-y-1.5 text-xs">
                      {q.options.map((opt, optIdx) => {
                        const isUserChoice = userAns === optIdx;
                        const isCorrectChoice = q.correctIndex === optIdx;

                        return (
                          <div
                            key={optIdx}
                            className={`rounded-lg p-2.5 flex items-center justify-between ${
                              isCorrectChoice
                                ? "bg-emerald-100/60 font-semibold text-emerald-950 border border-emerald-300"
                                : isUserChoice
                                ? "bg-rose-100/60 font-semibold text-rose-950 border border-rose-300"
                                : "text-ink/60"
                            }`}
                          >
                            <span>{opt}</span>
                            {isCorrectChoice && (
                              <span className="text-[10px] uppercase font-bold text-emerald-800">
                                Correct Answer
                              </span>
                            )}
                            {isUserChoice && !isCorrectChoice && (
                              <span className="text-[10px] uppercase font-bold text-rose-800">
                                Your Choice
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="rounded-lg bg-white p-3 text-xs text-ink/80 border border-ink/8">
                      <span className="font-semibold text-ink">Explanation: </span>
                      {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
