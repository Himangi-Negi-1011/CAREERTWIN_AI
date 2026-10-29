"use client";

import {
  ArrowLeft,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  GraduationCap,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  Play,
  RotateCcw,
  Search,
  Send,
  Sparkles,
  Terminal,
  Timer,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useState, useCallback, useRef } from "react";
import { gradeKnowledgeChecks, type LessonDocument, type GradedKnowledgeCheck } from "@/lib/learning/lesson-schema";

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
  role: "user" | "tutor";
  text: string;
  relatedConcepts?: string[];
  suggestedAction?: string;
};

const POPULAR_TRACKS = [
  { name: "Python from Zero", level: "foundation" },
  { name: "SQL for Data Analysis", level: "beginner" },
  { name: "AWS Cloud Security", level: "intermediate" },
  { name: "React with Practical Projects", level: "beginner" },
  { name: "Digital Marketing", level: "beginner" },
  { name: "Financial Modelling", level: "intermediate" },
];

export function LearningStudio({ role }: { role: string }) {
  const [query, setQuery] = useState("");
  const [skills, setSkills] = useState<SkillResult[]>([]);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [selected, setSelected] = useState("");
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
  const [lessonTab, setLessonTab] = useState<"read" | "exercise" | "quiz">("read");

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string[]>>({});
  const [quizResults, setQuizResults] = useState<{ score: number; correct: number; total: number; results: GradedKnowledgeCheck[] } | null>(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  // Exercise State
  const [showSolution, setShowSolution] = useState(false);
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});

  // Tutor Chat State
  const [tutorOpen, setTutorOpen] = useState(false);
  const [tutorQuestion, setTutorQuestion] = useState("");
  const [tutorLoading, setTutorLoading] = useState(false);
  const [tutorMessages, setTutorMessages] = useState<TutorMessage[]>([]);

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

  async function askTutor(e: FormEvent) {
    e.preventDefault();
    if (!tutorQuestion.trim() || tutorLoading || !activeLesson) return;
    const q = tutorQuestion.trim();
    setTutorQuestion("");
    setTutorMessages((prev) => [...prev, { role: "user", text: q }]);
    setTutorLoading(true);

    try {
      const response = await fetch("/api/learning/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          skillName: activeLesson.skillName,
          lessonTitle: activeLesson.title,
          contextText: activeLesson.sections.map((s) => s.content).join(" ").slice(0, 1500),
        }),
      });
      const payload = (await response.json()) as { data?: { answer: string; relatedConcepts: string[]; suggestedAction: string } };
      if (response.ok && payload.data) {
        setTutorMessages((prev) => [
          ...prev,
          {
            role: "tutor",
            text: payload.data!.answer,
            relatedConcepts: payload.data!.relatedConcepts,
            suggestedAction: payload.data!.suggestedAction,
          },
        ]);
      }
    } catch {
      setTutorMessages((prev) => [
        ...prev,
        {
          role: "tutor",
          text: "I'm temporarily unable to connect to the reasoning service, but focus on the fundamentals outlined in the lesson sections.",
        },
      ]);
    } finally {
      setTutorLoading(false);
    }
  }

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

      {/* Popular Tracks Quick Picker */}
      {!activeLesson && !curriculum && (
        <section className="rounded-2xl border border-ink/8 bg-white p-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate">Popular Learning Tracks:</h4>
          <div className="mt-3 flex flex-wrap gap-2">
            {POPULAR_TRACKS.map((track) => (
              <button
                key={track.name}
                type="button"
                onClick={() => {
                  setSelected(track.name);
                  setQuery(track.name);
                  setLevel(track.level);
                  void startCourseGeneration(track.name, track.level);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-ink/10 bg-cream/40 px-3.5 py-2 text-xs font-semibold text-ink transition hover:border-accent hover:bg-accent/5 hover:text-accent"
              >
                <Play size={11} className="text-accent" />
                {track.name}
                <span className="text-[10px] text-slate capitalize">({track.level})</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Skill Search & Request Form */}
      {!activeLesson && (
        <form onSubmit={prepare} className="rounded-[26px] border border-ink/10 bg-white p-5 md:p-7 shadow-sm">
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
                  placeholder="e.g. Python from zero, AWS Cloud Security, SQL Data Analysis…"
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
            <button disabled={!selected.trim() || loading} aria-label="Prepare path" className="button-primary h-11 disabled:opacity-40">
              <Sparkles size={15} />
              {loading ? "Preparing…" : "Prepare path"}
            </button>
          </div>

          {(query.trim() || skills.length > 0) && (
            <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {skills.map((skill) => (
                <button
                  type="button"
                  key={skill.id}
                  onClick={() => {
                    setSelected(skill.canonicalName);
                    setQuery(skill.canonicalName);
                  }}
                  className={`rounded-xl border p-3 text-left transition ${
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
                  className={`rounded-xl border border-dashed p-3 text-left ${
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
            <p role="status" className="mt-4 rounded-xl border border-ink/8 bg-app p-3 text-sm text-ink">
              {status}
            </p>
          )}
        </form>
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

                      <p className="mt-3 text-[11px] text-slate">
                        <strong>Checkpoint:</strong> {module.checkpoint}
                      </p>
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
                className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-xs font-bold text-white transition hover:bg-ink/80"
              >
                <MessageSquare size={13} /> {tutorOpen ? "Hide AI Tutor" : "Ask AI Tutor"}
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
          <div className="flex gap-2 border-b border-ink/8 pb-2">
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

          {/* AI Tutor Assistant Panel */}
          {tutorOpen && (
            <div className="rounded-2xl border border-accent/30 bg-violet-50/40 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-accent/15 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-accent" />
                  <h4 className="text-sm font-bold text-ink">Interactive AI Tutor</h4>
                </div>
                <span className="text-[11px] font-mono text-slate">Direct pedagogical help</span>
              </div>

              {/* Messages list */}
              <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
                {tutorMessages.length === 0 && (
                  <p className="text-xs text-slate">
                    Have a question about {activeLesson.title}? Ask below and get targeted conceptual clarification, code guidance, and practice suggestions.
                  </p>
                )}
                {tutorMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`rounded-xl p-3 text-xs leading-relaxed ${
                      msg.role === "user" ? "ml-6 bg-ink text-white" : "mr-6 border border-ink/10 bg-white text-ink shadow-sm"
                    }`}
                  >
                    <p className="font-semibold">{msg.text}</p>
                    {msg.relatedConcepts && msg.relatedConcepts.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5 pt-2 border-t border-ink/5">
                        <span className="text-[10px] text-slate font-bold">Related:</span>
                        {msg.relatedConcepts.map((concept, cIdx) => (
                          <span key={cIdx} className="rounded-full bg-cream px-2 py-0.5 text-[10px] text-slate-800">
                            {concept}
                          </span>
                        ))}
                      </div>
                    )}
                    {msg.suggestedAction && (
                      <p className="mt-1.5 text-[11px] font-medium text-accent">
                        💡 Next step: {msg.suggestedAction}
                      </p>
                    )}
                  </div>
                ))}
                {tutorLoading && (
                  <div className="text-xs text-slate italic">AI Tutor is thinking…</div>
                )}
              </div>

              {/* Question input */}
              <form onSubmit={askTutor} className="flex gap-2">
                <input
                  value={tutorQuestion}
                  onChange={(e) => setTutorQuestion(e.target.value)}
                  placeholder={`Ask a question about ${activeLesson.title}…`}
                  className="flex-1 rounded-xl border border-ink/15 bg-white px-3 py-2 text-xs outline-none focus:border-accent"
                />
                <button
                  type="submit"
                  disabled={!tutorQuestion.trim() || tutorLoading}
                  className="button-primary h-9 px-3 disabled:opacity-40 text-xs"
                >
                  <Send size={13} />
                </button>
              </form>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
