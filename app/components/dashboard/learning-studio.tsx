"use client";

import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Code2,
  Copy,
  ExternalLink,
  FileText,
  Filter,
  GraduationCap,
  HelpCircle,
  Layers,
  Lightbulb,
  MessageSquare,
  Play,
  RotateCcw,
  Search,
  Send,
  Sparkles,
  Star,
  Terminal,
  Timer,
  Video,
  XCircle,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useState, useCallback, useRef } from "react";
import { gradeKnowledgeChecks, type LessonDocument, type GradedKnowledgeCheck } from "@/lib/learning/lesson-schema";
import {
  AGENT_MODES,
  AGENT_MODE_METADATA,
  type AgentMode,
  type StudentLevel,
  type AgentResponse,
} from "@/lib/learning/agent";
import { CATALOGUE_COURSES, type CourseCatalogueItem } from "./course-catalogue";

type SkillResult = { id: string; canonicalName: string; domain: string; description: string; difficulty: string; reviewStatus: string };
type Registration = { canonicalName: string; available: boolean; reason: string };
type Curriculum = {
  skillId?: string | null;
  skillName: string;
  learnerLevel: string;
  prerequisites: string[];
  objectives: Array<{ id: string; statement: string }>;
  modules: Array<{ id: string; title: string; summary: string; estimatedMinutes: number; lessonTitles: string[]; checkpoint: string }>;
  projects: string[];
  proficiencyCriteria: string[];
  generationMode: string;
  reviewStatus: string;
};

type CourseJob = {
  id: string;
  skillName: string;
  status: string;
  totalLessonsPlanned: number;
  lessonsGenerated: number;
  lessonsValidated: number;
  lessonsSaved: number;
  lessonsRemaining: number;
  currentStage: string;
  lastError: string | null;
  isReadyForLearning: boolean;
};

type TutorMessage = {
  id?: string;
  role: "user" | "tutor";
  text: string;
  mode?: AgentMode;
  codeExamples?: Array<{ language: string; code: string; explanation: string; expectedOutput?: string }>;
  quizQuestions?: Array<{ question: string; options: string[]; correctIndex: number; explanation: string; topic: string }>;
  relatedConcepts?: string[];
  suggestedAction?: string;
  careerImpact?: string;
  keyTakeaways?: string[];
};

const POPULAR_TRACKS = [
  { name: "Python", level: "beginner", tag: "6 Lessons · 3 Tests" },
  { name: "SQL", level: "beginner", tag: "4 Lessons · 3 Tests" },
  { name: "TypeScript", level: "beginner", tag: "6 Lessons · 3 Tests" },
  { name: "JavaScript", level: "beginner", tag: "6 Lessons · 3 Tests" },
  { name: "Cloud Computing", level: "beginner", tag: "4 Lessons · 3 Tests" },
  { name: "Cybersecurity", level: "beginner", tag: "4 Lessons · 3 Tests" },
  { name: "Java", level: "beginner", tag: "6 Lessons · 3 Tests" },
  { name: "Go", level: "beginner", tag: "6 Lessons · 3 Tests" },
  { name: "Rust", level: "beginner", tag: "6 Lessons · 3 Tests" },
  { name: "C++", level: "beginner", tag: "6 Lessons · 3 Tests" },
  { name: "C#", level: "beginner", tag: "6 Lessons · 3 Tests" },
  { name: "C Programming", level: "beginner", tag: "6 Lessons · 3 Tests" },
  { name: "Power BI", level: "beginner", tag: "4 Lessons · 3 Tests" },
  { name: "PHP", level: "beginner", tag: "6 Lessons · 3 Tests" },
];

export function LearningStudio({ role, initialSkill }: { role: string; initialSkill?: string }) {
  const [query, setQuery] = useState("");
  const [skills, setSkills] = useState<SkillResult[]>([]);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [selected, setSelected] = useState(initialSkill || "");
  const [level, setLevel] = useState("foundation");
  const [language, setLanguage] = useState("English");
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [curriculumId, setCurriculumId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // Real-time Course Generation Job State
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [currentJob, setCurrentJob] = useState<CourseJob | null>(null);
  const [resumingJob, setResumingJob] = useState(false);

  // Active Lesson State
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [activeLesson, setActiveLesson] = useState<LessonDocument | null>(null);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [lessonTab, setLessonTab] = useState<"read" | "video" | "exercise" | "quiz">("read");

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string[]>>({});
  const [quizResults, setQuizResults] = useState<{ score: number; correct: number; total: number; results: GradedKnowledgeCheck[] } | null>(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  // Exercise State
  const [showSolution, setShowSolution] = useState(false);
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});

  // AI Learning Agent State
  const [tutorOpen, setTutorOpen] = useState(false);
  const [tutorQuestion, setTutorQuestion] = useState("");
  const [tutorLoading, setTutorLoading] = useState(false);
  const [tutorMessages, setTutorMessages] = useState<TutorMessage[]>([]);
  const [agentMode, setAgentMode] = useState<AgentMode>("explain_concept");
  const [agentLevel, setAgentLevel] = useState<StudentLevel>("beginner");
  const [agentQuizSelections, setAgentQuizSelections] = useState<Record<string, number>>({});
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [notesExported, setNotesExported] = useState(false);

  // Persistent Progress & Mastery
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem("careertwin-completed-lessons");
      return saved ? (JSON.parse(saved) as Record<string, boolean>) : {};
    } catch {
      return {};
    }
  });
  const [masteryScore, setMasteryScore] = useState<number>(0);
  const [masteryLevel, setMasteryLevel] = useState<string>("novice");

  // Mock Test State
  const [curriculumTab, setCurriculumTab] = useState<"syllabus" | "mock-tests">("syllabus");
  const [mockTests, setMockTests] = useState<Array<{
    id: string;
    title: string;
    description: string;
    durationMinutes: number;
    totalMarks: number;
    passingPercentage: number;
    topicsCovered: string[];
    questions: Array<{
      id: string;
      type: string;
      prompt: string;
      codeSnippet?: string;
      options: Array<{ id: string; text: string }>;
      difficulty: string;
      topic: string;
      marks: number;
    }>;
  }>>([]);
  const [loadingMockTests, setLoadingMockTests] = useState(false);
  const [activeMockTest, setActiveMockTest] = useState<{
    id: string;
    title: string;
    description: string;
    durationMinutes: number;
    totalMarks: number;
    passingPercentage: number;
    questions: Array<{
      id: string;
      type: string;
      prompt: string;
      codeSnippet?: string;
      options: Array<{ id: string; text: string }>;
      difficulty: string;
      topic: string;
      marks: number;
    }>;
  } | null>(null);
  const [mockAnswers, setMockAnswers] = useState<Record<string, string[]>>({});
  const [mockReport, setMockReport] = useState<{
    testId: string;
    score: number;
    totalMarks: number;
    percentage: number;
    passed: boolean;
    timeSpentSeconds: number;
    topicWiseScores: Record<string, { topic: string; scored: number; total: number; percentage: number }>;
    questions: Array<{
      questionId: string;
      prompt: string;
      topic: string;
      selectedOptionIds: string[];
      correctOptionIds: string[];
      isCorrect: boolean;
      marksAwarded: number;
      maxMarks: number;
      explanation: string;
      recommendedLessonTitle?: string;
    }>;
    recommendedLessons: Array<{ title: string; topic: string }>;
  } | null>(null);
  const [submittingMock, setSubmittingMock] = useState(false);
  const [mockTimer, setMockTimer] = useState<number>(1800);

  // Cisco NetAcad Course Library & Interactive Catalog State
  const [catalogCategory, setCatalogCategory] = useState<"all" | "programming" | "cloud" | "data" | "security">("all");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [expandedCourseSlug, setExpandedCourseSlug] = useState<string | null>(null);
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);
  const [lastCourseName, setLastCourseName] = useState<string>("Python Programming");
  const [lastLessonName, setLastLessonName] = useState<string>("Python Syntax and Data Types");
  const [showCustomGenerator, setShowCustomGenerator] = useState(false);

  useEffect(() => {
    try {
      const c = localStorage.getItem("careertwin-last-course");
      const l = localStorage.getItem("careertwin-last-lesson-title");
      if (c) setLastCourseName(c);
      if (l) setLastLessonName(l);
    } catch {
      // safe
    }
  }, []);

  const copyCodeToClipboard = (code: string, id: string) => {
    try {
      navigator.clipboard.writeText(code);
      setCopiedSnippetId(id);
      setTimeout(() => setCopiedSnippetId(null), 2000);
    } catch {
      // safe
    }
  };

  // Fetch initial progress and restore previous state
  useEffect(() => {
    void fetch("/api/learning/progress")
      .then((res) => res.json())
      .then((payload: { data?: { enrolledCourses?: Array<{ jobId: string; skillName: string; status: string }> } }) => {
        if (payload.data?.enrolledCourses && payload.data.enrolledCourses.length > 0) {
          const latest = payload.data.enrolledCourses[0];
          if (!activeJobId && latest.jobId) {
            setActiveJobId(latest.jobId);
          }
        }
      })
      .catch(() => {
        // Offline / unauthenticated fallback
      });
  }, [activeJobId]);

  // Poll active course generation job
  useEffect(() => {
    if (!activeJobId) return;

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/learning/courses/${activeJobId}`);
        if (!res.ok) return;
        const payload = (await res.json()) as { data?: CourseJob };
        if (!isMounted || !payload.data) return;

        setCurrentJob(payload.data);

        // If completed or paused, stop polling
        if (
          payload.data.status === "completed" ||
          payload.data.status === "completed_with_errors" ||
          payload.data.status === "paused_for_quota" ||
          payload.data.status === "failed"
        ) {
          clearInterval(interval);
        }
      } catch {
        // Network error during poll
      }
    }, 1500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeJobId]);

  // Skill catalog search
  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void fetch(`/api/learning/skills?q=${encodeURIComponent(query)}&limit=18`, { signal: controller.signal })
        .then(async (response) => {
          const payload = (await response.json()) as { data?: { skills?: SkillResult[]; registration?: Registration | null }; error?: { message?: string } };
          if (!response.ok) throw new Error(payload.error?.message ?? "The learning catalog could not be loaded.");
          setSkills(payload.data?.skills ?? []);
          setRegistration(payload.data?.registration ?? null);
          setStatus("");
        })
        .catch((error) => {
          if (error instanceof Error && error.name !== "AbortError") setStatus(error.message);
        });
    }, 250);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const startCourseGeneration = useCallback(
    async (skillName: string, selectedLevel: string = level) => {
      if (!skillName.trim()) return;
      setLoading(true);
      setStatus("Initializing Course Generation Engine and building curriculum…");
      setCurriculum(null);
      setActiveLesson(null);
      setActiveLessonId(null);
      setCurrentJob(null);

      try {
        const response = await fetch("/api/learning/curricula", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            skillName,
            level: selectedLevel,
            preferredLanguage: language,
            targetRole: role,
            knownSkills: [],
            weeklyMinutes: 300,
            autoStartLessons: true,
          }),
        });

        const payload = (await response.json()) as {
          data?: {
            jobId?: string;
            curriculumId?: string;
            curriculum?: Curriculum;
            state?: string;
            isReadyForLearning?: boolean;
            totalLessonsPlanned?: number;
            lessonsSaved?: number;
            currentStage?: string;
            reused?: boolean;
          };
          error?: { message?: string };
        };

        if (!response.ok || !payload.data) {
          setStatus(payload.error?.message ?? "The curriculum could not be prepared.");
          return;
        }

        if (payload.data.curriculum) {
          setCurriculum(payload.data.curriculum);
          setCurriculumId(payload.data.curriculumId ?? payload.data.curriculum.skillId ?? `curr-${skillName}`);
          void loadMockTests(payload.data.curriculum.skillName, payload.data.curriculum.learnerLevel);
        }

        if (payload.data.jobId) {
          setActiveJobId(payload.data.jobId);
        }

        if (payload.data.state === "ready") {
          setStatus(`Approved curriculum loaded${payload.data.reused ? " from the catalog" : ""}.`);
        } else if (payload.data.state === "awaiting-review" || payload.data.curriculum?.reviewStatus === "draft") {
          setStatus("The curriculum passed structural checks and was saved as a draft. It is not yet labelled approved learning content.");
        } else if (payload.data.isReadyForLearning) {
          setStatus(`Course ready! ${payload.data.lessonsSaved ?? 0} interactive lessons are available to study.`);
        } else {
          setStatus(payload.data.currentStage || "Course generation in progress…");
        }
      } catch {
        setStatus("Learning Studio is temporarily unavailable. No course was published.");
      } finally {
        setLoading(false);
      }
    },
    [language, level, role]
  );

  useEffect(() => {
    if (initialSkill && !curriculum) {
      const timer = setTimeout(() => {
        void startCourseGeneration(initialSkill, level);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [initialSkill, startCourseGeneration, level, curriculum]);

  async function prepare(event: FormEvent) {
    event.preventDefault();
    await startCourseGeneration(selected);
  }

  async function resumeGeneration() {
    if (!activeJobId) return;
    setResumingJob(true);
    setStatus("Resuming generation of remaining lessons…");
    try {
      const res = await fetch(`/api/learning/courses/${activeJobId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resume" }),
      });
      const payload = (await res.json()) as { data?: CourseJob };
      if (res.ok && payload.data) {
        setCurrentJob(payload.data);
        setStatus(payload.data.currentStage);
      }
    } catch {
      setStatus("Failed to resume generation.");
    } finally {
      setResumingJob(false);
    }
  }

  async function loadMockTests(skillName: string, selectedLevel: string) {
    setLoadingMockTests(true);
    try {
      const res = await fetch(`/api/learning/mock-tests?skill=${encodeURIComponent(skillName)}&level=${selectedLevel}`);
      if (res.ok) {
        const json = await res.json();
        setMockTests(json.data?.tests || []);
      }
    } catch {
      //
    } finally {
      setLoadingMockTests(false);
    }
  }

  function handleSelectMockOption(questionId: string, optionId: string, isMulti: boolean) {
    setMockAnswers((prev) => {
      const current = prev[questionId] ?? [];
      if (isMulti) {
        const next = current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId];
        return { ...prev, [questionId]: next };
      }
      return { ...prev, [questionId]: [optionId] };
    });
  }

  async function handleMockSubmit() {
    if (!activeMockTest) return;
    setSubmittingMock(true);
    try {
      const spent = activeMockTest.durationMinutes * 60 - mockTimer;
      const res = await fetch(`/api/learning/mock-tests/${activeMockTest.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: mockAnswers,
          timeSpentSeconds: Math.max(0, spent),
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setMockReport(json.data?.report);
      }
    } catch {
      //
    } finally {
      setSubmittingMock(false);
    }
  }

  const handleMockSubmitRef = useRef(handleMockSubmit);
  handleMockSubmitRef.current = handleMockSubmit;

  // Timer countdown for active mock test
  useEffect(() => {
    if (!activeMockTest || mockReport) return;
    const interval = setInterval(() => {
      setMockTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          void handleMockSubmitRef.current();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeMockTest, mockReport]);

  async function openLesson(moduleIndex: number, moduleId: string, lessonTitle: string) {
    if (!curriculum) return;
    const lessonKey = `${curriculum.skillName}-${moduleId}-${lessonTitle.replace(/\s+/g, "-").toLowerCase()}`;
    const currId = curriculumId ?? curriculum.skillId ?? `curr-${curriculum.skillName}`;

    setActiveLessonId(lessonKey);
    setLoadingLesson(true);
    setLessonTab("read");
    setQuizAnswers({});
    setQuizResults(null);
    setShowSolution(false);
    setRevealedHints({});
    setTutorMessages([]);

    try {
      localStorage.setItem("careertwin-last-course", curriculum.skillName);
      localStorage.setItem("careertwin-last-course-level", curriculum.learnerLevel);
      localStorage.setItem("careertwin-last-lesson-title", lessonTitle);
      localStorage.setItem("careertwin-last-module-id", moduleId);
      localStorage.setItem("careertwin-last-module-index", String(moduleIndex));
      setLastCourseName(curriculum.skillName);
      setLastLessonName(lessonTitle);
    } catch {
      // safe
    }

    try {
      const response = await fetch("/api/learning/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          curriculumId: currId,
          skillName: curriculum.skillName,
          moduleId,
          lessonId: lessonKey,
          lessonTitle,
          learnerLevel: curriculum.learnerLevel,
          objectives: curriculum.objectives,
        }),
      });
      const payload = (await response.json()) as { data?: { lesson?: LessonDocument } };
      if (response.ok && payload.data?.lesson) {
        setActiveLesson(payload.data.lesson);
      }
    } catch {
      // Graceful fallback
    } finally {
      setLoadingLesson(false);
    }
  }

  function handleSelectOption(questionId: string, optionId: string, isMulti: boolean) {
    setQuizAnswers((prev) => {
      const current = prev[questionId] ?? [];
      if (isMulti) {
        const next = current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId];
        return { ...prev, [questionId]: next };
      }
      return { ...prev, [questionId]: [optionId] };
    });
  }

  async function submitQuiz(e: FormEvent) {
    e.preventDefault();
    if (!activeLesson || !curriculum) return;
    setSubmittingQuiz(true);

    const totalLessonsCount = curriculum.modules.reduce((acc, m) => acc + m.lessonTitles.length, 0) || 4;
    const currId = curriculumId ?? curriculum.skillId ?? `curr-${curriculum.skillName}`;

    try {
      const response = await fetch("/api/learning/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          curriculumId: currId,
          skillName: curriculum.skillName,
          lessonId: activeLesson.lessonId,
          totalLessons: totalLessonsCount,
          questionSetVersion: activeLesson.contentVersion || 1,
          answers: quizAnswers,
          questions: activeLesson.knowledgeChecks,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        data?: {
          score: number;
          correct: number;
          total: number;
          results: GradedKnowledgeCheck[];
          progress?: { completedLessonIds: string[]; masteryScore: number; masteryLevel: string };
        };
      };

      if (response.ok && payload.data) {
        setQuizResults(payload.data);
        if (payload.data.score >= 70 && activeLessonId) {
          const updated = { ...completedLessons, [activeLessonId]: true };
          setCompletedLessons(updated);
          localStorage.setItem("careertwin-completed-lessons", JSON.stringify(updated));
          if (payload.data.progress) {
            setMasteryScore(payload.data.progress.masteryScore);
            setMasteryLevel(payload.data.progress.masteryLevel);
          }
        }
      } else {
        const localGraded = gradeKnowledgeChecks(activeLesson.knowledgeChecks, {
          questionSetVersion: activeLesson.contentVersion || 1,
          answers: quizAnswers,
        });
        setQuizResults(localGraded);
        if (localGraded.score >= 70 && activeLessonId) {
          const updated = { ...completedLessons, [activeLessonId]: true };
          setCompletedLessons(updated);
          localStorage.setItem("careertwin-completed-lessons", JSON.stringify(updated));
        }
      }
    } catch {
      const localGraded = gradeKnowledgeChecks(activeLesson.knowledgeChecks, {
        questionSetVersion: activeLesson.contentVersion || 1,
        answers: quizAnswers,
      });
      setQuizResults(localGraded);
      if (localGraded.score >= 70 && activeLessonId) {
        const updated = { ...completedLessons, [activeLessonId]: true };
        setCompletedLessons(updated);
        localStorage.setItem("careertwin-completed-lessons", JSON.stringify(updated));
      }
    } finally {
      setSubmittingQuiz(false);
    }
  }

  async function askTutor(e?: FormEvent, overrideQuestion?: string, overrideMode?: AgentMode) {
    if (e) e.preventDefault();
    const activeMode = overrideMode || agentMode;
    const q = (overrideQuestion || tutorQuestion).trim();
    if (!q || tutorLoading || !activeLesson) return;
    setTutorQuestion("");
    const userMsg: TutorMessage = {
      id: Math.random().toString(36).slice(2),
      role: "user",
      text: q,
      mode: activeMode,
    };
    setTutorMessages((prev) => [...prev, userMsg]);
    setTutorLoading(true);

    try {
      const response = await fetch("/api/learning/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          mode: activeMode,
          skillName: activeLesson.skillName,
          lessonTitle: activeLesson.title,
          courseTitle: curriculum?.skillName || selected,
          studentLevel: agentLevel,
          contextText: activeLesson.sections.map((s) => s.content).join(" ").slice(0, 1500),
          history: tutorMessages.slice(-4).map((m) => ({
            role: m.role === "user" ? "user" : "assistant",
            content: m.text,
          })),
        }),
      });
      const payload = (await response.json()) as { data?: AgentResponse };
      if (response.ok && payload.data) {
        setTutorMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).slice(2),
            role: "tutor",
            text: payload.data!.answer,
            mode: payload.data!.mode,
            codeExamples: payload.data!.codeExamples,
            quizQuestions: payload.data!.quizQuestions,
            relatedConcepts: payload.data!.relatedConcepts,
            suggestedAction: payload.data!.suggestedAction,
            careerImpact: payload.data!.careerImpact,
            keyTakeaways: payload.data!.keyTakeaways,
          },
        ]);
      }
    } catch {
      setTutorMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).slice(2),
          role: "tutor",
          text: "I am temporarily operating in offline mode. Review the lesson examples and fundamental concepts outlined in this section.",
        },
      ]);
    } finally {
      setTutorLoading(false);
    }
  }

  const exportRevisionSheet = () => {
    if (!activeLesson) return;
    const notes = [
      `# CareerTwin Revision Sheet: ${activeLesson.title}`,
      `Skill: ${activeLesson.skillName} | Level: ${agentLevel}`,
      `Date: ${new Date().toLocaleDateString()}`,
      `\n## Learning Objectives:`,
      ...activeLesson.learningObjectives.map((o) => `- ${o}`),
      `\n## Agent Key Takeaways & Study Notes:`,
      ...tutorMessages
        .filter((m) => m.role === "tutor")
        .map((m) => `\n### [${m.mode ? AGENT_MODE_METADATA[m.mode].label : "Tutor"}]\n${m.text}`),
    ].join("\n");

    const blob = new Blob([notes], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `careertwin-revision-${activeLesson.lessonId}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setNotesExported(true);
    setTimeout(() => setNotesExported(false), 2500);
  };

  const allCourseLessons = curriculum?.modules.flatMap((m, mIdx) =>
    m.lessonTitles.map((t, lIdx) => ({
      moduleIndex: mIdx,
      moduleId: m.id,
      moduleTitle: m.title,
      lessonTitle: t,
      lessonIndex: lIdx,
    }))
  ) ?? [];

  const currentLessonIdx = allCourseLessons.findIndex(
    (l) =>
      Boolean(activeLesson && (
        l.lessonTitle.toLowerCase() === activeLesson.title.toLowerCase() ||
        (activeLesson.lessonId && activeLesson.lessonId.includes(l.lessonTitle.replace(/\s+/g, "-").toLowerCase()))
      ))
  );

  const prevLesson = currentLessonIdx > 0 ? allCourseLessons[currentLessonIdx - 1] : null;
  const nextLesson = currentLessonIdx >= 0 && currentLessonIdx < allCourseLessons.length - 1 ? allCourseLessons[currentLessonIdx + 1] : null;

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <section className="rounded-[28px] bg-ink p-7 text-white md:p-9 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[.18em] text-mint">Universal AI Learning Engine</p>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/library"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold text-white hover:bg-white/20 transition"
            >
              <GraduationCap size={13} className="text-mint" /> Library Admin
            </Link>
            {masteryScore > 0 && (
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 font-mono text-xs font-semibold text-emerald-300">
                Skill Mastery: {masteryScore}% ({masteryLevel})
              </span>
            )}
          </div>
        </div>
        <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-[-.04em]">
          Learn any skill from zero with structured courses, verifiable practice labs, and interactive assessments.
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">
          Request any technical, cloud, data, business, or engineering skill. The AI Twin analyzes your career goals,
          builds a complete structured curriculum, generates substantive lessons, evaluates your knowledge, and tracks mastery.
        </p>
      </section>

      {/* Cisco NetAcad-Inspired Learning Studio Homepage */}
      {!activeLesson && !curriculum && (
        <div className="space-y-8">
          {/* 1. Continue Learning Hero Card */}
          <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900 p-6 md:p-8 text-white shadow-2xl">
            <div className="absolute right-0 top-0 -mr-16 -mt-16 size-72 rounded-full bg-accent/20 blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-xl space-y-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/30 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent-light">
                    <Sparkles size={12} className="text-mint" />
                    Continue Learning
                  </span>
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-mono text-white/70">
                    Active Track
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                  {lastCourseName}
                </h3>
                <p className="text-xs md:text-sm text-slate-300">
                  Current Lesson: <strong className="text-white">{lastLessonName}</strong>
                </p>

                {/* Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-300">
                    <span>Progress: 33% Completed</span>
                    <span>2 of 6 Lessons Mastered</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-accent to-mint" style={{ width: "33%" }} />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => void startCourseGeneration(lastCourseName, "beginner")}
                    className="btn btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold shadow-lg shadow-accent/25"
                  >
                    <span>Resume Learning</span>
                    <ArrowRight size={14} />
                  </button>
                  <a
                    href="#all-courses"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition"
                  >
                    <BookOpen size={13} />
                    <span>Browse All 14 Tracks</span>
                  </a>
                </div>
              </div>

              {/* Quick Stat Pill Widget */}
              <div className="grid grid-cols-2 gap-3 sm:w-80">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Total Courses</span>
                  <strong className="mt-1 block text-2xl font-bold text-white">14 Ready</strong>
                  <span className="text-[10px] text-emerald-400">Self-paced with labs</span>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Lessons</span>
                  <strong className="mt-1 block text-2xl font-bold text-white">84 Total</strong>
                  <span className="text-[10px] text-accent-light">Runnable code & tests</span>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Mastery Level</span>
                  <strong className="mt-1 block text-2xl font-bold text-white capitalize">{masteryLevel}</strong>
                  <span className="text-[10px] text-emerald-400">{masteryScore}% verified</span>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Assessments</span>
                  <strong className="mt-1 block text-2xl font-bold text-white">42 Exams</strong>
                  <span className="text-[10px] text-mint">With instant grading</span>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Quick Enrolled Tracks Summary */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate">My Enrolled Learning Tracks</h4>
                <p className="text-xs text-slate">Resume your active curricula or jump into a new module.</p>
              </div>
              <span className="text-xs font-semibold text-accent">3 In Progress</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { name: "Python Programming", tag: "Programming", progress: 33, lessons: "2 / 6 Lessons", slug: "python" },
                { name: "Modern JavaScript (ES6+)", tag: "Web & Frontend", progress: 17, lessons: "1 / 6 Lessons", slug: "javascript" },
                { name: "Cloud Computing & AWS", tag: "Cloud Infrastructure", progress: 0, lessons: "0 / 4 Lessons", slug: "cloud-computing" },
              ].map((trk) => (
                <div key={trk.slug} className="rounded-2xl border border-ink/8 bg-white p-4 shadow-xs flex flex-col justify-between hover:border-accent/40 transition">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-accent">{trk.tag}</span>
                      <span className="text-slate font-medium">{trk.lessons}</span>
                    </div>
                    <h5 className="font-bold text-sm text-ink">{trk.name}</h5>
                    <div className="h-1.5 w-full rounded-full bg-ink/5 overflow-hidden">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${trk.progress}%` }} />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void startCourseGeneration(trk.name, "beginner")}
                    className="mt-4 inline-flex items-center justify-between rounded-xl bg-cream/70 hover:bg-violet-50 hover:text-accent px-3 py-2 text-xs font-bold text-ink transition"
                  >
                    <span>{trk.progress > 0 ? "Resume Track" : "Start Track"}</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* 3. Explore Learning Catalog (All 14 Cisco NetAcad Courses) */}
          <section id="all-courses" className="space-y-6 pt-2">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-ink/8 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                    Cisco NetAcad Inspired
                  </span>
                  <span className="text-xs font-semibold text-slate">14 Published Curricula</span>
                </div>
                <h3 className="mt-1 text-2xl font-extrabold text-ink">Explore Course Library</h3>
                <p className="mt-1 text-xs text-slate">
                  Deep technical curricula designed for genuine mastery: hands-on exercises, runnable code examples, and verified assessments.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-72">
                <Search size={15} className="absolute left-3.5 top-3 text-slate pointer-events-none" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Filter courses by name or topic…"
                  className="w-full rounded-xl border border-ink/10 bg-white py-2 pl-9 pr-3 text-xs text-ink outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {[
                { id: "all", label: "All Tracks (14)" },
                { id: "programming", label: "Programming (10)" },
                { id: "cloud", label: "Cloud & DevOps (1)" },
                { id: "data", label: "Data & AI (2)" },
                { id: "security", label: "Cybersecurity (1)" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCatalogCategory(tab.id as typeof catalogCategory)}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition ${
                    catalogCategory === tab.id
                      ? "bg-ink text-white shadow-sm"
                      : "border border-ink/10 bg-white text-slate hover:border-accent/40 hover:text-ink"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Course Cards Grid */}
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {CATALOGUE_COURSES.filter((course) => {
                const matchesCategory = catalogCategory === "all" || course.category === catalogCategory;
                const matchesSearch = !catalogSearch.trim() ||
                  course.title.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                  course.shortDescription.toLowerCase().includes(catalogSearch.toLowerCase());
                return matchesCategory && matchesSearch;
              }).map((course) => {
                const isExpanded = expandedCourseSlug === course.slug;
                return (
                  <article
                    key={course.slug}
                    className="flex flex-col justify-between rounded-2xl border border-ink/10 bg-white p-5 shadow-xs hover:border-accent/50 hover:shadow-md transition"
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="rounded-md bg-accent/10 px-2 py-0.5 font-bold uppercase tracking-wider text-accent">
                          {course.categoryLabel}
                        </span>
                        <span className="font-semibold text-slate capitalize">
                          {course.level} · {course.duration.split("·")[0]}
                        </span>
                      </div>

                      <h4 className="text-lg font-bold text-ink">{course.title}</h4>
                      <p className="text-xs leading-relaxed text-slate line-clamp-2">
                        {course.shortDescription}
                      </p>

                      {/* Course Metric Badges */}
                      <div className="flex flex-wrap gap-2 text-[10px] font-semibold text-slate">
                        <span className="inline-flex items-center gap-1 rounded-md bg-cream px-2 py-1">
                          <BookOpen size={11} className="text-accent" />
                          {course.lessonsCount} Lessons
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-cream px-2 py-1">
                          <Terminal size={11} className="text-accent" />
                          {course.practicalLabsCount} Labs
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-cream px-2 py-1">
                          <Award size={11} className="text-accent" />
                          {course.mockTestsCount} Exams
                        </span>
                      </div>

                      {/* Key Outcomes */}
                      <div className="space-y-1.5 border-t border-ink/5 pt-2 text-[11px] text-slate">
                        {course.learningOutcomes.slice(0, 2).map((outcome, idx) => (
                          <div key={idx} className="flex items-start gap-1.5">
                            <CheckCircle2 size={12} className="mt-0.5 shrink-0 text-emerald-600" />
                            <span className="line-clamp-1">{outcome}</span>
                          </div>
                        ))}
                      </div>

                      {/* Syllabus Accordion Preview */}
                      {isExpanded && (
                        <div className="mt-3 space-y-3 rounded-xl border border-ink/8 bg-cream/35 p-3 text-xs">
                          <span className="block font-bold text-[11px] uppercase tracking-wider text-slate">
                            Full Syllabus Preview:
                          </span>
                          <div className="space-y-2">
                            {course.modules.map((m, mIdx) => (
                              <div key={mIdx} className="space-y-1">
                                <strong className="block text-ink text-[11px]">{m.title}</strong>
                                <ul className="list-disc pl-4 text-[10px] text-slate space-y-0.5">
                                  {m.lessons.map((les, lIdx) => (
                                    <li key={lIdx}>{les}</li>
                                  ))}
                                </ul>
                                <span className="block text-[10px] text-accent font-semibold">
                                  Checkpoint: {m.assessment}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card Actions */}
                    <div className="mt-5 flex items-center gap-2 border-t border-ink/8 pt-4">
                      <button
                        type="button"
                        onClick={() => void startCourseGeneration(course.title, course.level)}
                        className="btn btn-primary flex-1 py-2 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Play size={12} />
                        <span>Start Course</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpandedCourseSlug(isExpanded ? null : course.slug)}
                        className="rounded-xl border border-ink/15 bg-white px-3 py-2 text-xs font-semibold text-slate hover:bg-cream hover:text-ink transition flex items-center gap-1"
                        aria-label="View course syllabus"
                      >
                        <span>Syllabus</span>
                        {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* 4. Custom Skill Search & AI Curriculum Generator */}
          <section className="rounded-2xl border border-ink/10 bg-white p-5 md:p-6 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-ink/8 pb-3">
              <div>
                <h4 className="font-bold text-sm text-ink">Generate Custom AI Curriculum</h4>
                <p className="text-xs text-slate">
                  Enter any skill or technology to generate a structured curriculum with lessons and quizzes.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent">
                <Sparkles size={12} /> Real-time Generation
              </span>
            </div>

            <form onSubmit={prepare} className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-[1fr_180px_180px_auto] lg:items-end">
                <label className="text-xs font-bold text-ink">
                  Skill or learning goal
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-3.5 text-slate" size={16} />
                    <input
                      value={query}
                      onChange={(event) => {
                        setQuery(event.target.value);
                        setSelected(event.target.value);
                      }}
                      maxLength={120}
                      className="w-full rounded-xl border border-ink/10 bg-cream/35 py-3 pl-10 pr-3 text-sm font-normal outline-none focus:border-accent"
                      placeholder="e.g. Python, Docker, Next.js, Cloud Security…"
                    />
                  </div>
                </label>
                <label className="text-xs font-bold text-ink">
                  Starting level
                  <select
                    value={level}
                    onChange={(event) => setLevel(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-ink/10 bg-white px-3 py-3 text-sm font-normal"
                  >
                    <option value="foundation">Foundation (Zero Experience)</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </label>
                <label className="text-xs font-bold text-ink">
                  Explanation language
                  <input
                    value={language}
                    onChange={(event) => setLanguage(event.target.value)}
                    maxLength={80}
                    className="mt-2 w-full rounded-xl border border-ink/10 bg-white px-3 py-3 text-sm font-normal"
                  />
                </label>
                <button disabled={!selected.trim() || loading} aria-label="Prepare path" className="button-primary h-11 disabled:opacity-40 cursor-pointer">
                  <Sparkles size={15} />
                  {loading ? "Preparing…" : "Prepare path"}
                </button>
              </div>

              {(query.trim() || skills.length > 0) && (
                <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {skills.map((skill) => (
                    <button
                      type="button"
                      key={skill.id}
                      onClick={() => {
                        setSelected(skill.canonicalName);
                        setQuery(skill.canonicalName);
                      }}
                      className={`rounded-xl border p-3 text-left transition cursor-pointer ${
                        selected === skill.canonicalName ? "border-accent bg-violet-50" : "border-ink/8 hover:border-accent/40"
                      }`}
                    >
                      <strong className="block text-sm">{skill.canonicalName}</strong>
                      <span className="mt-1 block text-xs text-slate">
                        {skill.domain} · {skill.reviewStatus}
                      </span>
                    </button>
                  ))}
                  {registration?.available && (
                    <button
                      type="button"
                      onClick={() => setSelected(registration.canonicalName)}
                      className={`rounded-xl border border-dashed p-3 text-left cursor-pointer ${
                        selected === registration.canonicalName ? "border-accent bg-violet-50" : "border-ink/20"
                      }`}
                    >
                      <strong className="block text-sm">Register “{registration.canonicalName}”</strong>
                      <span className="mt-1 block text-xs leading-5 text-slate">{registration.reason}</span>
                    </button>
                  )}
                </div>
              )}

              {status && (
                <p role="status" className="mt-3 rounded-xl border border-ink/8 bg-app p-3 text-sm text-ink">
                  {status}
                </p>
              )}
            </form>
          </section>
        </div>
      )}

      {/* Real-time Course Generation Progress Banner */}
      {currentJob && !activeLesson && (
        <section className="rounded-2xl border border-accent/25 bg-accent/5 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`size-3 rounded-full ${
                  currentJob.status === "completed"
                    ? "bg-emerald-500"
                    : currentJob.status === "paused_for_quota"
                    ? "bg-amber-500"
                    : "animate-ping bg-accent"
                }`}
              />
              <h4 className="text-sm font-bold text-ink">
                Course Engine: {currentJob.skillName} (
                <span className="capitalize">{currentJob.status.replace(/_/g, " ")}</span>)
              </h4>
            </div>
            {currentJob.status === "paused_for_quota" && (
              <button
                type="button"
                onClick={resumeGeneration}
                disabled={resumingJob}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700 disabled:opacity-50"
              >
                <RotateCcw size={12} />
                {resumingJob ? "Resuming…" : "Resume Generation"}
              </button>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-ink/8 bg-white p-3">
              <span className="block text-[11px] font-mono text-slate">Curriculum</span>
              <strong className="mt-1 block text-sm text-emerald-600">✓ Validated</strong>
            </div>
            <div className="rounded-xl border border-ink/8 bg-white p-3">
              <span className="block text-[11px] font-mono text-slate">Lessons Generated</span>
              <strong className="mt-1 block text-sm text-ink">
                {currentJob.lessonsGenerated} / {currentJob.totalLessonsPlanned || "..."}
              </strong>
            </div>
            <div className="rounded-xl border border-ink/8 bg-white p-3">
              <span className="block text-[11px] font-mono text-slate">Lessons Saved</span>
              <strong className="mt-1 block text-sm text-ink">
                {currentJob.lessonsSaved} / {currentJob.totalLessonsPlanned || "..."}
              </strong>
            </div>
            <div className="rounded-xl border border-ink/8 bg-white p-3">
              <span className="block text-[11px] font-mono text-slate">Remaining</span>
              <strong className="mt-1 block text-sm text-slate">
                {currentJob.lessonsRemaining ?? 0}
              </strong>
            </div>
          </div>

          <p className="mt-3 text-xs text-slate">
            <strong>Stage:</strong> {currentJob.currentStage}
          </p>

          {currentJob.lastError && (
            <p className="mt-2 text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
              Notice: {currentJob.lastError}
            </p>
          )}
        </section>
      )}

      {/* Curriculum Syllabus View */}
      {curriculum && !activeLesson && (
        <section className="rounded-[26px] border border-ink/10 bg-white p-5 md:p-7 shadow-sm">
          {status && (
            <p role="status" className="mb-4 rounded-xl border border-ink/8 bg-app p-3 text-sm text-ink">
              {status}
            </p>
          )}

          {/* Back to Library Navigation */}
          <div className="mb-4">
            <button
              type="button"
              onClick={() => {
                setCurriculum(null);
                setActiveLesson(null);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-ink/10 bg-cream/50 px-3.5 py-2 text-xs font-bold text-slate hover:bg-violet-50 hover:text-accent transition shadow-xs cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>Back to Course Library (14 Tracks)</span>
            </button>
          </div>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="label">
                {curriculum.reviewStatus} · {curriculum.generationMode}
              </p>
              <h3 className="mt-2 text-2xl font-bold">
                {curriculum.skillName} · <span className="capitalize">{curriculum.learnerLevel}</span>
              </h3>
            </div>
            <span
              className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                curriculum.reviewStatus === "approved"
                  ? "bg-emerald-50 text-emerald-800"
                  : "bg-amber-50 text-amber-800"
              }`}
            >
              {curriculum.reviewStatus === "approved" ? "Ready for Learning" : "Review required"}
            </span>
          </div>

          {/* Curriculum / Mock Tests Tab Navigation */}
          <div className="mt-6 flex border-b border-ink/8 gap-6">
            <button
              type="button"
              onClick={() => {
                setCurriculumTab("syllabus");
                setActiveMockTest(null);
              }}
              className={`pb-3 text-xs md:text-sm font-bold transition border-b-2 flex items-center gap-1.5 ${
                curriculumTab === "syllabus"
                  ? "border-accent text-accent"
                  : "border-transparent text-slate hover:text-ink"
              }`}
            >
              <BookOpen size={14} /> Curriculum & Interactive Lessons
            </button>
            <button
              type="button"
              onClick={() => {
                setCurriculumTab("mock-tests");
                if (mockTests.length === 0 && curriculum) {
                  void loadMockTests(curriculum.skillName, curriculum.learnerLevel);
                }
              }}
              className={`pb-3 text-xs md:text-sm font-bold transition border-b-2 flex items-center gap-1.5 ${
                curriculumTab === "mock-tests"
                  ? "border-accent text-accent"
                  : "border-transparent text-slate hover:text-ink"
              }`}
            >
              <Award size={14} /> Skill Mock Tests ({mockTests.length || 3})
            </button>
          </div>

          {curriculumTab === "syllabus" ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-[.7fr_1.3fr]">
            <div>
              <h4 className="font-bold text-sm text-ink">Core Learning Objectives</h4>
              <ul className="mt-3 space-y-2">
                {curriculum.objectives.map((objective) => (
                  <li key={objective.id} className="flex gap-2 text-xs leading-5 text-slate">
                    <CheckCircle2 className="mt-0.5 shrink-0 text-accent" size={14} />
                    {objective.statement}
                  </li>
                ))}
              </ul>

              <h4 className="mt-6 font-bold text-sm text-ink">Proficiency Evidence Criteria</h4>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-xs leading-5 text-slate">
                {curriculum.proficiencyCriteria.map((criterion) => (
                  <li key={criterion}>{criterion}</li>
                ))}
              </ul>

              {curriculum.projects && curriculum.projects.length > 0 && (
                <div className="mt-6 rounded-xl border border-ink/8 bg-cream/40 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate">Applied Capstone Project:</h4>
                  <p className="mt-2 text-xs leading-relaxed text-ink">{curriculum.projects[0]}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {curriculum.modules.map((module, index) => (
                <article key={module.id} className="rounded-2xl border border-ink/8 p-5">
                  <div className="flex items-start gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-mint/35 text-xs font-bold text-accent">
                      {index + 1}
                    </span>
                    <div className="w-full">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="font-bold text-sm text-ink">{module.title}</h4>
                        <span className="inline-flex items-center gap-1 text-xs text-slate">
                          <Clock3 size={12} />
                          {module.estimatedMinutes} min
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-slate">{module.summary}</p>

                      {/* Interactive Lesson Cards */}
                      <div className="mt-4 space-y-2">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate">Interactive Lessons:</p>
                        <div className="flex flex-wrap gap-2">
                          {module.lessonTitles.map((title) => {
                            const key = `${curriculum.skillName}-${module.id}-${title.replace(/\s+/g, "-").toLowerCase()}`;
                            const isDone = completedLessons[key];
                            return (
                              <button
                                key={title}
                                type="button"
                                onClick={() => openLesson(index, module.id, title)}
                                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                                  isDone
                                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                                    : "border-accent/25 bg-accent/5 text-ink hover:border-accent hover:bg-accent/10"
                                }`}
                              >
                                {isDone ? (
                                  <Check size={13} className="text-emerald-600" />
                                ) : (
                                  <BookOpen size={13} className="text-accent" />
                                )}
                                {title}
                                <span className="ml-1 text-[10px] text-slate">
                                  {isDone ? "Review" : "Study →"}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-ink/8 pt-3">
                        <p className="text-[11px] text-slate">
                          <strong>Checkpoint:</strong> {module.checkpoint}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setCurriculumTab("mock-tests");
                            if (mockTests.length === 0 && curriculum) {
                              void loadMockTests(curriculum.skillName, curriculum.learnerLevel);
                            }
                          }}
                          className="inline-flex items-center gap-1 rounded-md bg-accent/10 px-2.5 py-1 text-[11px] font-bold text-accent transition hover:bg-accent/20"
                        >
                          <Award size={12} /> Phase Assessment
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
          ) : (
            <div className="mt-6 space-y-6">
              {/* Mock Tests Tab Content */}
              {!activeMockTest ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-ink">Skill Mock Test Series</h4>
                      <p className="text-xs text-slate">Standardized 20-question assessments covering concepts, debugging, code analysis, and real-world scenarios.</p>
                    </div>
                    {loadingMockTests && <span className="text-xs text-slate animate-pulse">Loading tests…</span>}
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    {(mockTests.length > 0 ? mockTests : [1, 2, 3]).map((test, idx) => {
                      const testObj = typeof test === "number" ? null : test;
                      const title = testObj?.title || `${curriculum.skillName} Mock Test ${idx + 1}`;
                      const duration = testObj?.durationMinutes || 30;
                      const qCount = testObj?.questions.length || 20;

                      return (
                        <div key={idx} className="rounded-2xl border border-ink/8 p-5 bg-white shadow-sm flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between text-xs text-slate mb-2">
                              <span className="font-semibold uppercase tracking-wider text-[10px] text-accent">Test {idx + 1}</span>
                              <span className="flex items-center gap-1"><Clock3 size={12} /> {duration} min</span>
                            </div>
                            <h5 className="font-bold text-sm text-ink">{title}</h5>
                            <p className="text-xs text-slate mt-2">Comprehensive 20-question assessment testing syntax, debugging, and production readiness.</p>
                            <div className="mt-4 flex flex-wrap gap-1.5 text-[10px]">
                              <span className="px-2 py-0.5 rounded-md bg-cream/70 text-slate font-medium">{qCount} Questions</span>
                              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-medium">70% Pass Mark</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (testObj) {
                                setActiveMockTest(testObj);
                                setMockAnswers({});
                                setMockReport(null);
                                setMockTimer(testObj.durationMinutes * 60);
                              } else {
                                void loadMockTests(curriculum.skillName, curriculum.learnerLevel);
                              }
                            }}
                            className="mt-6 w-full py-2.5 rounded-xl bg-accent text-white font-bold text-xs hover:bg-accent/90 transition shadow-sm"
                          >
                            Take Mock Test →
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : !mockReport ? (
                /* Active Mock Test Taking Session */
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-ink/8 pb-4">
                    <div>
                      <button
                        type="button"
                        onClick={() => setActiveMockTest(null)}
                        className="text-xs font-semibold text-slate hover:text-ink flex items-center gap-1 mb-1"
                      >
                        <ArrowLeft size={13} /> Exit Mock Test
                      </button>
                      <h4 className="text-base font-bold text-ink">{activeMockTest.title}</h4>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-accent/20 bg-accent/5">
                      <Timer size={14} className="text-accent" />
                      <span className="font-mono text-sm font-bold text-ink">
                        {Math.floor(mockTimer / 60)}:{String(mockTimer % 60).padStart(2, "0")}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {activeMockTest.questions.map((q, qIndex) => {
                      const isMulti = q.type === "multiple-select";
                      const selected = mockAnswers[q.id] || [];

                      return (
                        <div key={q.id} className="rounded-2xl border border-ink/8 p-5 bg-white space-y-3">
                          <div className="flex items-center justify-between text-xs text-slate">
                            <span className="font-bold text-accent">Question {qIndex + 1} of {activeMockTest.questions.length}</span>
                            <span className="px-2 py-0.5 rounded bg-cream/70 text-[10px] uppercase font-semibold">{q.topic}</span>
                          </div>

                          <p className="font-medium text-sm text-ink">{q.prompt}</p>

                          {q.codeSnippet && (
                            <pre className="p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
                              <code>{q.codeSnippet}</code>
                            </pre>
                          )}

                          <div className="space-y-2 pt-2">
                            {q.options.map((opt) => {
                              const isChecked = selected.includes(opt.id);
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => handleSelectMockOption(q.id, opt.id, isMulti)}
                                  className={`w-full text-left p-3 rounded-xl border text-xs font-normal transition flex items-center justify-between ${
                                    isChecked
                                      ? "border-accent bg-accent/5 text-ink font-semibold"
                                      : "border-ink/10 bg-white hover:bg-cream/30 text-slate"
                                  }`}
                                >
                                  <span>{opt.text}</span>
                                  <span className={`size-4 rounded ${isMulti ? "rounded-md" : "rounded-full"} border flex items-center justify-center shrink-0 ml-2 ${
                                    isChecked ? "border-accent bg-accent text-white" : "border-ink/20"
                                  }`}>
                                    {isChecked && <Check size={10} />}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={handleMockSubmit}
                      disabled={submittingMock}
                      className="px-6 py-3 rounded-xl bg-accent text-white font-bold text-xs hover:bg-accent/90 transition shadow-md disabled:opacity-50"
                    >
                      {submittingMock ? "Evaluating Answers…" : "Submit Mock Test"}
                    </button>
                  </div>
                </div>
              ) : (
                /* Mock Test Graded Report */
                <div className="space-y-6">
                  <div className="rounded-2xl border border-ink/8 p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-semibold text-slate uppercase tracking-wider">Mock Test Score Report</span>
                      <h4 className="text-xl font-bold text-ink mt-1">{activeMockTest.title}</h4>
                      <p className="text-xs text-slate mt-1">
                        Time spent: {Math.floor(mockReport.timeSpentSeconds / 60)}m {mockReport.timeSpentSeconds % 60}s
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <strong className="text-2xl font-extrabold text-ink">{mockReport.score} / {mockReport.totalMarks}</strong>
                        <span className="block text-xs font-bold text-slate">{mockReport.percentage}% Score</span>
                      </div>
                      <span className={`px-4 py-2 rounded-xl text-xs font-bold ${
                        mockReport.passed
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-amber-100 text-amber-800 border border-amber-300"
                      }`}>
                        {mockReport.passed ? "PASSED" : "NEEDS REVISION"}
                      </span>
                    </div>
                  </div>

                  {/* Topic-wise Breakdown */}
                  <div className="rounded-2xl border border-ink/8 p-6 bg-white">
                    <h5 className="font-bold text-sm text-ink mb-4">Topic-wise Performance</h5>
                    <div className="grid gap-3 md:grid-cols-2">
                      {Object.values(mockReport.topicWiseScores).map((t) => (
                        <div key={t.topic} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate">{t.topic}</span>
                            <span className="text-ink">{t.percentage}% ({t.scored}/{t.total})</span>
                          </div>
                          <div className="h-2 rounded-full bg-ink/5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                t.percentage >= 70 ? "bg-emerald-500" : "bg-amber-500"
                              }`}
                              style={{ width: `${t.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Lessons */}
                  {mockReport.recommendedLessons.length > 0 && (
                    <div className="rounded-2xl border border-accent/20 bg-accent/5 p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb size={16} className="text-accent" />
                        <h5 className="font-bold text-sm text-ink">Recommended Lessons to Revisit</h5>
                      </div>
                      <p className="text-xs text-slate mb-4">Based on questions you answered incorrectly, study these specific lessons to close knowledge gaps:</p>
                      <div className="flex flex-wrap gap-2">
                        {mockReport.recommendedLessons.map((rec, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setCurriculumTab("syllabus");
                              setActiveMockTest(null);
                              // Open lesson directly
                              if (curriculum) {
                                void openLesson(0, curriculum.modules[0]?.id || "mod-1", rec.title);
                              }
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-accent/30 text-xs font-bold text-ink hover:border-accent transition shadow-sm"
                          >
                            <BookOpen size={13} className="text-accent" />
                            <span>{rec.title}</span>
                            <span className="text-[10px] text-accent">Study Now →</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Detailed Question Review */}
                  <div className="space-y-4">
                    <h5 className="font-bold text-sm text-ink">Question Review & Explanations</h5>
                    {mockReport.questions.map((q, idx) => (
                      <div key={q.questionId} className={`rounded-2xl border p-5 ${
                        q.isCorrect ? "border-emerald-200 bg-emerald-50/20" : "border-rose-200 bg-rose-50/20"
                      }`}>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="font-bold text-slate">Question {idx + 1} · {q.topic}</span>
                          <span className={`font-bold ${q.isCorrect ? "text-emerald-700" : "text-rose-700"}`}>
                            {q.isCorrect ? `+${q.marksAwarded} Marks` : "0 Marks"}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-ink">{q.prompt}</p>
                        <p className="text-xs text-slate mt-2 leading-relaxed">
                          <strong>Explanation:</strong> {q.explanation}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMockTest(null);
                        setMockReport(null);
                      }}
                      className="px-4 py-2 rounded-xl border border-ink/10 bg-white text-xs font-bold text-slate hover:text-ink transition"
                    >
                      ← Back to Test Series
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMockAnswers({});
                        setMockReport(null);
                        setMockTimer(activeMockTest.durationMinutes * 60);
                      }}
                      className="px-5 py-2 rounded-xl bg-accent text-white text-xs font-bold hover:bg-accent/90 transition shadow-sm"
                    >
                      Retake Test
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {loadingLesson && (
        <section className="flex items-center gap-3 rounded-[26px] border border-ink/10 bg-white p-6 text-sm font-semibold text-slate shadow-sm">
          <div className="size-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <span>Opening interactive lesson guide, hands-on practice lab, and assessment checks…</span>
        </section>
      )}

      {/* Interactive Active Lesson Studio */}
      {activeLesson && (
        <section className="space-y-6 rounded-[28px] border border-ink/10 bg-white p-6 shadow-sm md:p-8">
          {/* Top navigation bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/8 pb-4">
            <button
              type="button"
              onClick={() => setActiveLesson(null)}
              className="inline-flex items-center gap-2 rounded-xl border border-ink/10 px-3 py-1.5 text-xs font-bold text-slate transition hover:bg-cream hover:text-ink"
            >
              <ArrowLeft size={14} /> Back to Syllabus
            </button>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-mint/30 px-3 py-1 font-mono text-xs font-semibold text-accent">
                {activeLesson.skillName} · {activeLesson.learnerLevel}
              </span>
              <button
                type="button"
                onClick={() => setTutorOpen(!tutorOpen)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition shadow-sm ${
                  tutorOpen
                    ? "bg-accent text-white hover:bg-accent/90"
                    : "bg-ink text-white hover:bg-ink/80"
                }`}
              >
                <Sparkles size={13} className="text-mint" />
                {tutorOpen ? "Hide AI Agent" : "AI Learning Agent (9 Modes)"}
              </button>
            </div>
          </div>

          {/* Lesson Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate">
              <span>{activeLesson.moduleId}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Clock3 size={12} /> {activeLesson.estimatedMinutes} mins
              </span>
            </div>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-ink md:text-3xl">{activeLesson.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate">{activeLesson.summary}</p>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-ink/8 pb-2">
            <button
              type="button"
              onClick={() => setLessonTab("read")}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
                lessonTab === "read" ? "bg-ink text-white" : "text-slate hover:bg-cream"
              }`}
            >
              📖 Lesson Guide
            </button>
            <button
              type="button"
              onClick={() => setLessonTab("video")}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
                lessonTab === "video" ? "bg-ink text-white" : "text-slate hover:bg-cream"
              }`}
            >
              <Video size={13} /> Video Masterclass ({activeLesson.videoResources?.length ?? 0})
            </button>
            <button
              type="button"
              onClick={() => setLessonTab("exercise")}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
                lessonTab === "exercise" ? "bg-ink text-white" : "text-slate hover:bg-cream"
              }`}
            >
              🛠️ Practice Lab ({activeLesson.exercises?.length ?? 0})
            </button>
            <button
              type="button"
              onClick={() => setLessonTab("quiz")}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
                lessonTab === "quiz" ? "bg-ink text-white" : "text-slate hover:bg-cream"
              }`}
            >
              📝 Knowledge Check ({activeLesson.knowledgeChecks?.length ?? 0})
            </button>
          </div>

          {/* Tab 1: Lesson Content */}
          {lessonTab === "read" && (
            <div className="space-y-6">
              {/* Objectives */}
              <div className="rounded-2xl border border-accent/20 bg-accent/5 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-accent">Key Learning Objectives</h4>
                <ul className="mt-2 space-y-1.5">
                  {activeLesson.learningObjectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs font-medium text-ink">
                      <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-accent" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sections */}
              {activeLesson.sections.map((section) => (
                <article key={section.id} className="space-y-3 rounded-2xl border border-ink/8 bg-white p-5">
                  <h3 className="text-lg font-bold text-ink">{section.heading}</h3>
                  <div className="whitespace-pre-line text-sm leading-relaxed text-slate">{section.content}</div>

                  {section.codeExamples && section.codeExamples.length > 0 && (
                    <div className="space-y-3 pt-2">
                      {section.codeExamples.map((ex, idx) => (
                        <div key={idx} className="overflow-hidden rounded-xl border border-ink/15 bg-slate-950 text-white">
                          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-[11px] font-mono text-white/60">
                            <span className="flex items-center gap-1.5">
                              <Terminal size={12} /> {ex.language || "code"}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyCodeToClipboard(ex.code, `code-${section.id}-${idx}`)}
                              className="inline-flex items-center gap-1 rounded bg-white/10 px-2 py-0.5 text-[10px] text-white hover:bg-white/20 transition cursor-pointer"
                            >
                              {copiedSnippetId === `code-${section.id}-${idx}` ? (
                                <>
                                  <Check size={11} className="text-emerald-400" />
                                  <span className="text-emerald-400 font-bold">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={11} />
                                  <span>Copy Code</span>
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-emerald-400">
                            <code>{ex.code}</code>
                          </pre>
                          {ex.explanation && (
                            <div className="border-t border-white/10 bg-slate-900/60 p-3 text-xs text-white/70">
                              <strong>Explanation:</strong> {ex.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {section.keyPoints && section.keyPoints.length > 0 && (
                    <div className="mt-3 rounded-xl border border-mint/40 bg-mint/10 p-3.5">
                      <strong className="block text-xs font-bold text-emerald-800">Takeaway Points:</strong>
                      <ul className="mt-1.5 list-disc pl-5 text-xs text-slate-700 space-y-1">
                        {section.keyPoints.map((pt, i) => (
                          <li key={i}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {section.commonMistakes && section.commonMistakes.length > 0 && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3.5">
                      <strong className="block text-xs font-bold text-rose-800">Common Pitfalls to Avoid:</strong>
                      <ul className="mt-1.5 list-disc pl-5 text-xs text-rose-700 space-y-1">
                        {section.commonMistakes.map((cm, i) => (
                          <li key={i}>{cm}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </article>
              ))}

              {/* Lesson Recap */}
              {activeLesson.recap && (
                <div className="rounded-2xl border border-ink/10 bg-cream/40 p-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate">Lesson Summary</h4>
                  <p className="mt-2 text-sm leading-relaxed text-slate">{activeLesson.recap}</p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Video Masterclass & Curated External Resources */}
          {lessonTab === "video" && (
            <div className="space-y-6">
              {activeLesson.videoResources && activeLesson.videoResources.length > 0 ? (
                activeLesson.videoResources.map((video) => {
                  const embedSrc = video.embedUrl || (video.url.includes("watch?v=") ? video.url.replace("watch?v=", "embed/") : video.url);
                  return (
                    <article key={video.id} className="space-y-4 rounded-2xl border border-ink/10 bg-white p-5 md:p-6 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/8 pb-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 uppercase tracking-wider inline-flex items-center gap-1">
                              <CheckCircle2 size={11} className="text-emerald-600" />
                              {video.verificationStatus === "verified" ? "Verified Curriculum Resource" : "Curated Resource"}
                            </span>
                            {video.difficulty && (
                              <span className="rounded-full bg-cream px-2 py-0.5 text-[10px] font-semibold text-slate uppercase">
                                {video.difficulty}
                              </span>
                            )}
                            {video.durationMinutes && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-slate font-medium">
                                <Clock3 size={11} /> {video.durationMinutes} min
                              </span>
                            )}
                          </div>
                          <h3 className="mt-1 text-lg font-bold text-ink">{video.title}</h3>
                          {video.channelOrAuthor && (
                            <p className="text-xs text-slate">Instructor / Channel: <strong className="text-ink">{video.channelOrAuthor}</strong></p>
                          )}
                        </div>

                        <a
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-accent/30 bg-accent/5 px-3 py-1.5 text-xs font-bold text-accent transition hover:bg-accent/10"
                        >
                          Watch on YouTube <ExternalLink size={12} />
                        </a>
                      </div>

                      {/* Video Player Embed with Responsive Container */}
                      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-ink/10 bg-slate-900 shadow-sm">
                        <iframe
                          src={embedSrc}
                          title={video.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="size-full"
                          loading="lazy"
                        />
                      </div>

                      {/* Pedagogical Rationale & Objectives */}
                      <div className="grid gap-4 md:grid-cols-2 pt-2">
                        <div className="rounded-xl border border-ink/8 bg-cream/30 p-4 space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate">Why This Resource Was Selected</h4>
                          <p className="text-xs leading-relaxed text-ink">{video.whySelected}</p>
                          <h4 className="pt-2 text-xs font-bold uppercase tracking-wider text-slate">What It Teaches</h4>
                          <p className="text-xs leading-relaxed text-slate">{video.whatItTeaches}</p>
                        </div>

                        <div className="rounded-xl border border-accent/15 bg-accent/5 p-4 space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-accent">Key Learning Objectives Supported</h4>
                          <ul className="space-y-1.5">
                            {video.learningObjectivesSupported.map((obj, i) => (
                              <li key={i} className="flex items-start gap-1.5 text-xs text-ink font-medium">
                                <Check size={12} className="mt-0.5 shrink-0 text-accent" />
                                <span>{obj}</span>
                              </li>
                            ))}
                          </ul>

                          {video.keyTopicsCovered && video.keyTopicsCovered.length > 0 && (
                            <div className="pt-2">
                              <h5 className="text-[11px] font-bold text-slate mb-1.5">Concepts to Focus On:</h5>
                              <div className="flex flex-wrap gap-1.5">
                                {video.keyTopicsCovered.map((topic, i) => (
                                  <span key={i} className="rounded-md bg-white border border-accent/20 px-2 py-0.5 text-[10px] font-semibold text-accent">
                                    {topic}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Follow-up Activity */}
                      {video.followUpActivity && (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                          <strong className="block text-xs font-bold text-emerald-900">Recommended Follow-up Activity:</strong>
                          <p className="mt-1 text-xs leading-relaxed text-emerald-800">{video.followUpActivity}</p>
                        </div>
                      )}
                    </article>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-ink/10 bg-white p-8 text-center space-y-3">
                  <Video size={36} className="mx-auto text-slate/40" />
                  <h4 className="text-base font-bold text-ink">External Video Resources</h4>
                  <p className="max-w-md mx-auto text-xs text-slate leading-relaxed">
                    Study the interactive lesson guide and exercises for {activeLesson.title}, or explore official documentation and community tutorials.
                  </p>
                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                      `${activeLesson.skillName} ${activeLesson.title} tutorial`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-bold text-white transition hover:bg-accent/90"
                  >
                    Search Verified Tutorials on YouTube <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Practical Lab Exercises */}
          {lessonTab === "exercise" && (
            <div className="space-y-6">
              {activeLesson.exercises?.map((exercise) => (
                <article key={exercise.id} className="space-y-4 rounded-2xl border border-ink/10 bg-white p-5 md:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-lg font-bold text-ink">{exercise.title}</h3>
                    <span className="rounded-md border border-accent/30 bg-accent/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-accent">
                      {exercise.type}
                    </span>
                  </div>

                  <p className="text-sm text-slate">{exercise.description}</p>

                  <div className="rounded-xl border border-ink/8 bg-cream/30 p-4">
                    <strong className="block text-xs font-bold text-ink">Instructions:</strong>
                    <ol className="mt-2 list-decimal pl-5 text-xs text-slate space-y-1.5">
                      {exercise.instructions.map((inst, idx) => (
                        <li key={idx}>{inst}</li>
                      ))}
                    </ol>
                  </div>

                  {exercise.starterCode && (
                    <div>
                      <span className="text-xs font-bold text-slate">Starter Code:</span>
                      <pre className="mt-1.5 overflow-x-auto rounded-xl border border-ink/15 bg-slate-950 p-4 font-mono text-xs text-emerald-400">
                        <code>{exercise.starterCode}</code>
                      </pre>
                    </div>
                  )}

                  {exercise.hints && exercise.hints.length > 0 && (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => setRevealedHints((prev) => ({ ...prev, [exercise.id]: !prev[exercise.id] }))}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline"
                      >
                        <Lightbulb size={13} /> {revealedHints[exercise.id] ? "Hide Hints" : "Show Practical Hints"}
                      </button>
                      {revealedHints[exercise.id] && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 space-y-1">
                          {exercise.hints.map((hint, i) => (
                            <p key={i}>• {hint}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowSolution(!showSolution)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-ink/15 px-3 py-1.5 text-xs font-bold text-slate transition hover:bg-cream hover:text-ink"
                    >
                      <HelpCircle size={13} /> {showSolution ? "Hide Solution Explanation" : "Reveal Solution Guidance"}
                    </button>
                    {showSolution && (
                      <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs leading-relaxed text-emerald-950">
                        <strong className="block font-bold">Solution Reference & Architectural Rationale:</strong>
                        <p className="mt-1">{exercise.solutionExplanation}</p>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Tab 3: Knowledge Check / Quiz */}
          {lessonTab === "quiz" && (
            <form onSubmit={submitQuiz} className="space-y-6">
              {quizResults && (
                <div
                  className={`rounded-2xl border p-5 ${
                    quizResults.score >= 70 ? "border-emerald-300 bg-emerald-50 text-emerald-950" : "border-amber-300 bg-amber-50 text-amber-950"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">
                      {quizResults.score >= 70 ? "🎉 Mastery Verified!" : "💡 Keep Reviewing"}
                    </h3>
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-bold shadow-sm">
                      Score: {quizResults.score}% ({quizResults.correct}/{quizResults.total})
                    </span>
                  </div>
                  <p className="mt-1 text-xs">
                    {quizResults.score >= 70
                      ? "Great job! This lesson is now marked completed and added to your verified skill evidence."
                      : "Review the explanations below and feel free to retry the assessment."}
                  </p>
                </div>
              )}

              {activeLesson.knowledgeChecks.map((kc, idx) => {
                const isMulti = kc.type === "multiple-select";
                const selectedList = quizAnswers[kc.id] ?? [];
                const graded = quizResults?.results.find((r) => r.questionId === kc.id);

                return (
                  <article key={kc.id} className="rounded-2xl border border-ink/10 bg-white p-5 md:p-6 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-slate">
                          Question {idx + 1} · {kc.type}
                        </span>
                        <h4 className="text-sm font-bold text-ink">{kc.prompt}</h4>
                      </div>
                      {graded && (
                        <span>
                          {graded.correct ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                              <CheckCircle2 size={13} /> Correct
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-800">
                              <XCircle size={13} /> Review
                            </span>
                          )}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      {kc.options.map((opt) => {
                        const isChecked = selectedList.includes(opt.id);
                        return (
                          <button
                            type="button"
                            key={opt.id}
                            onClick={() => handleSelectOption(kc.id, opt.id, isMulti)}
                            className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
                              isChecked
                                ? "border-accent bg-accent/5 font-semibold text-ink"
                                : "border-ink/10 hover:border-accent/40 text-slate"
                            }`}
                          >
                            <span
                              className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded ${
                                isMulti ? "rounded-md" : "rounded-full"
                              } border ${isChecked ? "border-accent bg-accent text-white" : "border-ink/20"}`}
                            >
                              {isChecked && <Check size={10} />}
                            </span>
                            <span className="text-xs leading-5">{opt.text}</span>
                          </button>
                        );
                      })}
                    </div>

                    {graded && (
                      <div className="rounded-xl border border-ink/8 bg-cream/40 p-3.5 text-xs text-slate">
                        <strong className="block font-bold text-ink">Explanation:</strong>
                        <p className="mt-1">{graded.explanation}</p>
                      </div>
                    )}
                  </article>
                );
              })}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingQuiz || Object.keys(quizAnswers).length === 0}
                  className="button-primary h-11 px-6 disabled:opacity-40"
                >
                  <Sparkles size={15} />
                  {submittingQuiz ? "Evaluating Answers…" : "Submit & Grade Quiz"}
                </button>
              </div>
            </form>
          )}

          {/* AI Learning Agent Assistant Panel */}
          {tutorOpen && (
            <div className="rounded-2xl border border-accent/30 bg-gradient-to-b from-violet-50/70 via-white to-white p-5 space-y-4 shadow-md">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-accent/15 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-accent text-white shadow-sm">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-ink">AI Learning Agent</h4>
                      <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent">
                        9 Pedagogical Modes
                      </span>
                    </div>
                    <p className="text-[11px] text-slate">
                      Context: <span className="font-semibold text-ink">{activeLesson.title}</span> ({activeLesson.skillName})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Student Level Selector */}
                  <div className="flex items-center rounded-lg border border-ink/10 bg-white p-0.5 text-[11px]">
                    {(["beginner", "intermediate", "advanced"] as StudentLevel[]).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setAgentLevel(lvl)}
                        className={`rounded-md px-2 py-0.5 font-semibold capitalize transition ${
                          agentLevel === lvl ? "bg-ink text-white shadow-xs" : "text-slate hover:text-ink"
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>

                  {/* Reset conversation */}
                  <button
                    type="button"
                    onClick={() => {
                      setTutorMessages([]);
                      setAgentQuizSelections({});
                    }}
                    title="Reset conversation"
                    className="inline-flex items-center gap-1 rounded-lg border border-ink/10 bg-white px-2 py-1 text-[11px] font-semibold text-slate hover:bg-cream hover:text-ink transition"
                  >
                    <RotateCcw size={12} /> Reset
                  </button>

                  {/* Export study notes */}
                  <button
                    type="button"
                    onClick={exportRevisionSheet}
                    title="Export study notes as Markdown"
                    className="inline-flex items-center gap-1 rounded-lg border border-ink/10 bg-white px-2 py-1 text-[11px] font-semibold text-slate hover:bg-cream hover:text-ink transition"
                  >
                    <FileText size={12} /> {notesExported ? "Exported!" : "Export Notes"}
                  </button>
                </div>
              </div>

              {/* Mode Selector Ribbon */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate">Teaching Mode:</span>
                  <span className="text-[11px] font-medium text-accent">
                    {AGENT_MODE_METADATA[agentMode].shortDesc}
                  </span>
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                  {AGENT_MODES.map((mode) => {
                    const meta = AGENT_MODE_METADATA[mode];
                    const isActive = agentMode === mode;
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setAgentMode(mode)}
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
                          isActive
                            ? "bg-accent text-white shadow-sm ring-2 ring-accent/30"
                            : "border border-ink/10 bg-white text-slate hover:border-accent/40 hover:text-ink"
                        }`}
                      >
                        <span>{meta.icon}</span>
                        <span>{meta.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Action Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate">Quick Prompts:</span>
                <button
                  type="button"
                  onClick={() => {
                    setAgentMode("teach_from_zero");
                    askTutor(undefined, "Teach me this entire lesson from zero prior knowledge.", "teach_from_zero");
                  }}
                  className="rounded-full border border-accent/20 bg-violet-50 px-2.5 py-0.5 text-[10px] font-semibold text-accent hover:bg-accent hover:text-white transition"
                >
                  🌱 Teach from Zero
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAgentMode("quiz_me");
                    askTutor(undefined, "Generate 2 diagnostic quiz questions for this lesson.", "quiz_me");
                  }}
                  className="rounded-full border border-accent/20 bg-violet-50 px-2.5 py-0.5 text-[10px] font-semibold text-accent hover:bg-accent hover:text-white transition"
                >
                  ⚡ Quiz Me
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAgentMode("career_connection");
                    askTutor(undefined, "How is this skill used in real engineering jobs & interviews?", "career_connection");
                  }}
                  className="rounded-full border border-accent/20 bg-violet-50 px-2.5 py-0.5 text-[10px] font-semibold text-accent hover:bg-accent hover:text-white transition"
                >
                  🚀 Career Connection
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAgentMode("revision_mode");
                    askTutor(undefined, "Create a high-yield revision sheet with essential rules & traps.", "revision_mode");
                  }}
                  className="rounded-full border border-accent/20 bg-violet-50 px-2.5 py-0.5 text-[10px] font-semibold text-accent hover:bg-accent hover:text-white transition"
                >
                  📝 Revision Sheet
                </button>
              </div>

              {/* Messages list */}
              <div className="max-h-96 overflow-y-auto space-y-3.5 pr-1">
                {tutorMessages.length === 0 && (
                  <div className="rounded-xl border border-dashed border-accent/25 bg-white p-4 text-center">
                    <p className="text-xs font-semibold text-ink">
                      Ready to learn <span className="text-accent">{activeLesson.title}</span>!
                    </p>
                    <p className="mt-1 text-[11px] text-slate max-w-md mx-auto">
                      Select one of the 9 teaching modes above or click a Quick Prompt to get step-by-step guidance, code debugging, or a customized quiz.
                    </p>
                  </div>
                )}

                {tutorMessages.map((msg, i) => (
                  <div
                    key={msg.id || i}
                    className={`rounded-2xl p-4 text-xs leading-relaxed transition ${
                      msg.role === "user"
                        ? "ml-8 bg-ink text-white shadow-sm"
                        : "mr-4 border border-ink/10 bg-white text-ink shadow-sm space-y-3"
                    }`}
                  >
                    {/* Role / Mode Header */}
                    <div className="flex items-center justify-between text-[10px] pb-1 border-b border-ink/5">
                      <span className="font-bold flex items-center gap-1.5">
                        {msg.role === "user" ? (
                          <><span>👤</span> You</>
                        ) : (
                          <>
                            <span>{msg.mode ? AGENT_MODE_METADATA[msg.mode]?.icon : "🎓"}</span>
                            <span>{msg.mode ? AGENT_MODE_METADATA[msg.mode]?.label : "AI Agent"}</span>
                          </>
                        )}
                      </span>
                      {msg.role === "tutor" && (
                        <span className="text-slate font-mono">Pedagogical Guide</span>
                      )}
                    </div>

                    {/* Main Content */}
                    <div className="whitespace-pre-wrap font-sans text-xs space-y-2">
                      {msg.text}
                    </div>

                    {/* Key Takeaways */}
                    {msg.keyTakeaways && msg.keyTakeaways.length > 0 && (
                      <div className="rounded-xl bg-violet-50/70 p-2.5 border border-accent/15 space-y-1">
                        <span className="text-[10px] font-bold text-accent uppercase tracking-wider block">
                          Key Takeaways:
                        </span>
                        <ul className="space-y-1 text-[11px]">
                          {msg.keyTakeaways.map((point, pIdx) => (
                            <li key={pIdx} className="flex items-start gap-1.5">
                              <CheckCircle2 size={12} className="text-accent shrink-0 mt-0.5" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Code Examples */}
                    {msg.codeExamples && msg.codeExamples.length > 0 && (
                      <div className="space-y-2 pt-1">
                        {msg.codeExamples.map((ex, exIdx) => {
                          const snippetId = `snippet-${i}-${exIdx}`;
                          const isCopied = copiedSnippet === snippetId;
                          return (
                            <div key={exIdx} className="rounded-xl border border-ink/15 bg-ink text-white overflow-hidden shadow-sm">
                              <div className="flex items-center justify-between bg-white/10 px-3 py-1.5 text-[10px] font-mono">
                                <span className="uppercase text-mint font-bold">{ex.language}</span>
                                <button
                                  type="button"
                                  onClick={() => copyCodeToClipboard(ex.code, snippetId)}
                                  className="inline-flex items-center gap-1 text-slate-300 hover:text-white transition"
                                >
                                  {isCopied ? <Check size={11} className="text-mint" /> : <Copy size={11} />}
                                  <span>{isCopied ? "Copied!" : "Copy Code"}</span>
                                </button>
                              </div>
                              <pre className="p-3 font-mono text-[11px] overflow-x-auto text-emerald-300 leading-relaxed">
                                <code>{ex.code}</code>
                              </pre>
                              {ex.explanation && (
                                <div className="border-t border-white/10 bg-white/5 p-2.5 text-[10px] text-slate-300">
                                  <span className="font-bold text-white">Explanation: </span>
                                  {ex.explanation}
                                </div>
                              )}
                              {ex.expectedOutput && (
                                <div className="border-t border-white/10 bg-black/40 px-3 py-1.5 text-[10px] font-mono text-slate-400">
                                  <span className="text-slate-500">Output: </span>
                                  {ex.expectedOutput}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Interactive Quiz Questions (Quiz Me Mode) */}
                    {msg.quizQuestions && msg.quizQuestions.length > 0 && (
                      <div className="space-y-3 pt-1">
                        <span className="text-[11px] font-bold text-ink flex items-center gap-1.5">
                          <span>⚡</span> Interactive Knowledge Check:
                        </span>
                        {msg.quizQuestions.map((q, qIdx) => {
                          const qKey = `${i}-${qIdx}`;
                          const selectedAnswer = agentQuizSelections[qKey];
                          const hasAnswered = selectedAnswer !== undefined;
                          return (
                            <div key={qIdx} className="rounded-xl border border-ink/10 bg-cream/40 p-3 space-y-2">
                              <p className="font-semibold text-[11px] text-ink">{qIdx + 1}. {q.question}</p>
                              <div className="space-y-1.5">
                                {q.options.map((opt, optIdx) => {
                                  const isSelected = selectedAnswer === optIdx;
                                  const isCorrect = optIdx === q.correctIndex;
                                  let btnClass = "border border-ink/10 bg-white text-slate-800 hover:border-accent hover:bg-violet-50/50";

                                  if (hasAnswered) {
                                    if (isCorrect) {
                                      btnClass = "border border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold";
                                    } else if (isSelected && !isCorrect) {
                                      btnClass = "border border-rose-500 bg-rose-50 text-rose-900 line-through";
                                    } else {
                                      btnClass = "opacity-50 border border-ink/5 bg-white text-slate-500";
                                    }
                                  }

                                  return (
                                    <button
                                      key={optIdx}
                                      type="button"
                                      disabled={hasAnswered}
                                      onClick={() => setAgentQuizSelections((prev) => ({ ...prev, [qKey]: optIdx }))}
                                      className={`w-full text-left rounded-lg p-2 text-[11px] transition flex items-center justify-between ${btnClass}`}
                                    >
                                      <span>{opt}</span>
                                      {hasAnswered && isCorrect && (
                                        <Check size={13} className="text-emerald-600 shrink-0 ml-1" />
                                      )}
                                      {hasAnswered && isSelected && !isCorrect && (
                                        <XCircle size={13} className="text-rose-600 shrink-0 ml-1" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>

                              {hasAnswered && (
                                <div className="rounded-lg bg-emerald-50/70 border border-emerald-200/80 p-2 text-[10px] text-emerald-950 mt-1">
                                  <span className="font-bold">Explanation: </span>
                                  {q.explanation}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Career Impact Callout */}
                    {msg.careerImpact && (
                      <div className="rounded-xl border border-amber-300/60 bg-amber-50/60 p-2.5 flex items-start gap-2 text-[11px] text-amber-950">
                        <Briefcase size={14} className="text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Career & Interview Relevance: </span>
                          <span>{msg.careerImpact}</span>
                        </div>
                      </div>
                    )}

                    {/* Related Concepts */}
                    {msg.relatedConcepts && msg.relatedConcepts.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-ink/5">
                        <span className="text-[10px] text-slate font-bold">Related:</span>
                        {msg.relatedConcepts.map((concept, cIdx) => (
                          <button
                            key={cIdx}
                            type="button"
                            onClick={() => {
                              setTutorQuestion(`Explain ${concept} and how it connects to ${activeLesson.title}`);
                            }}
                            className="rounded-full bg-cream hover:bg-violet-100 hover:text-accent transition px-2 py-0.5 text-[10px] text-slate-800"
                          >
                            {concept}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Suggested Action */}
                    {msg.suggestedAction && (
                      <p className="text-[11px] font-medium text-accent flex items-center gap-1.5 pt-1">
                        <Lightbulb size={13} className="shrink-0" />
                        <span>Recommended action: {msg.suggestedAction}</span>
                      </p>
                    )}
                  </div>
                ))}

                {tutorLoading && (
                  <div className="flex items-center gap-2 rounded-xl border border-accent/20 bg-violet-50/60 p-3 text-xs text-accent">
                    <div className="size-3.5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                    <span className="font-semibold italic">
                      AI Learning Agent is thinking in &quot;{AGENT_MODE_METADATA[agentMode].label}&quot; mode…
                    </span>
                  </div>
                )}
              </div>

              {/* Question input */}
              <form onSubmit={askTutor} className="flex gap-2 pt-1">
                <input
                  value={tutorQuestion}
                  onChange={(e) => setTutorQuestion(e.target.value)}
                  placeholder={AGENT_MODE_METADATA[agentMode].placeholder}
                  className="flex-1 rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-xs outline-none focus:border-accent shadow-xs"
                />
                <button
                  type="submit"
                  disabled={!tutorQuestion.trim() || tutorLoading}
                  className="button-primary h-10 px-4 disabled:opacity-40 text-xs shrink-0 flex items-center gap-1.5"
                >
                  <Send size={13} />
                  <span>Ask Agent</span>
                </button>
              </form>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
