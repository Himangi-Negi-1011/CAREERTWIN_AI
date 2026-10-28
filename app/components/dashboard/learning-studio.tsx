"use client";

import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  Search,
  Send,
  Sparkles,
  Terminal,
  XCircle,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import type { LessonDocument, GradedKnowledgeCheck } from "@/lib/learning/lesson-schema";

type SkillResult = { id: string; canonicalName: string; domain: string; description: string; difficulty: string; reviewStatus: string };
type Registration = { canonicalName: string; available: boolean; reason: string };
type Curriculum = {
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

type TutorMessage = {
  role: "user" | "tutor";
  text: string;
  relatedConcepts?: string[];
  suggestedAction?: string;
};

export function LearningStudio({ role }: { role: string }) {
  const [query, setQuery] = useState("");
  const [skills, setSkills] = useState<SkillResult[]>([]);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [selected, setSelected] = useState("");
  const [level, setLevel] = useState("foundation");
  const [language, setLanguage] = useState("English");
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

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

  // Completed Lessons Set
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = localStorage.getItem("careertwin-completed-lessons");
    if (saved) {
      try {
        setCompletedLessons(JSON.parse(saved) as Record<string, boolean>);
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void fetch(`/api/learning/skills?q=${encodeURIComponent(query)}&limit=18`, { signal: controller.signal })
        .then(async (response) => {
          const payload = await response.json() as { data?: { skills?: SkillResult[]; registration?: Registration | null }; error?: { message?: string } };
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

  async function prepare(event: FormEvent) {
    event.preventDefault();
    if (!selected.trim()) return;
    setLoading(true);
    setStatus("Preparing and validating the curriculum…");
    setCurriculum(null);
    setActiveLesson(null);
    setActiveLessonId(null);
    try {
      const response = await fetch("/api/learning/curricula", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillName: selected, level, preferredLanguage: language, targetRole: role, knownSkills: [], weeklyMinutes: 300 }),
      });
      const payload = await response.json() as { data?: { curriculum?: Curriculum; state?: string; reused?: boolean }; error?: { message?: string } };
      if (!response.ok || !payload.data) {
        setStatus(payload.error?.message ?? "The curriculum could not be prepared.");
        return;
      }
      if (payload.data.curriculum) setCurriculum(payload.data.curriculum);
      setStatus(
        payload.data.state === "ready"
          ? `Approved curriculum loaded${payload.data.reused ? " from the catalog" : ""}.`
          : "The curriculum passed structural checks and was saved as a draft. It is not yet labelled approved learning content."
      );
    } catch {
      setStatus("Learning Studio is temporarily unavailable. No course was published.");
    } finally {
      setLoading(false);
    }
  }

  async function openLesson(moduleIndex: number, moduleId: string, lessonTitle: string) {
    if (!curriculum) return;
    const lessonKey = `${curriculum.skillName}-${moduleId}-${lessonTitle.replace(/\s+/g, "-").toLowerCase()}`;
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
          skillName: curriculum.skillName,
          moduleId,
          lessonId: lessonKey,
          lessonTitle,
          learnerLevel: curriculum.learnerLevel,
          objectives: curriculum.objectives,
        }),
      });
      const payload = await response.json() as { data?: { lesson?: LessonDocument } };
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
    if (!activeLesson) return;
    setSubmittingQuiz(true);
    try {
      const response = await fetch("/api/learning/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: activeLesson.lessonId,
          questionSetVersion: activeLesson.contentVersion || 1,
          answers: quizAnswers,
          questions: activeLesson.knowledgeChecks,
        }),
      });
      const payload = await response.json() as { data?: { score: number; correct: number; total: number; results: GradedKnowledgeCheck[] } };
      if (response.ok && payload.data) {
        setQuizResults(payload.data);
        if (payload.data.score >= 70 && activeLessonId) {
          const updated = { ...completedLessons, [activeLessonId]: true };
          setCompletedLessons(updated);
          localStorage.setItem("careertwin-completed-lessons", JSON.stringify(updated));
        }
      }
    } catch {
      // Quiz submit error
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
      const payload = await response.json() as { data?: { answer: string; relatedConcepts: string[]; suggestedAction: string } };
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
    <div className="space-y-5">
      <section className="rounded-[28px] bg-ink p-7 text-white md:p-9">
        <p className="font-mono text-[10px] uppercase tracking-[.18em] text-mint">Learning Studio</p>
        <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-[-.04em]">
          Learn a missing skill through objectives, practice, assessment, and evidence.
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">
          Search the broad starter catalog or request a new skill. New curricula remain drafts until validation and review;
          completing a lesson never proves mastery by itself.
        </p>
      </section>

      {!activeLesson && (
        <form onSubmit={prepare} className="rounded-[26px] border border-ink/10 bg-white p-5 md:p-7">
          <div className="grid gap-4 lg:grid-cols-[1fr_180px_180px_auto] lg:items-end">
            <label className="text-xs font-bold">
              Skill or learning goal
              <div className="relative mt-2">
                <Search className="absolute left-3 top-3.5 text-slate" size={16} />
                <input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setSelected("");
                  }}
                  maxLength={120}
                  className="w-full rounded-xl border border-ink/10 bg-cream/35 py-3 pl-10 pr-3 text-sm font-normal outline-none focus:border-accent"
                  placeholder="Search Python, communication, cloud security…"
                />
              </div>
            </label>
            <label className="text-xs font-bold">
              Starting level
              <select
                value={level}
                onChange={(event) => setLevel(event.target.value)}
                className="mt-2 w-full rounded-xl border border-ink/10 bg-white px-3 py-3 text-sm font-normal"
              >
                <option value="foundation">Foundation</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </label>
            <label className="text-xs font-bold">
              Explanation language
              <input
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                maxLength={80}
                className="mt-2 w-full rounded-xl border border-ink/10 bg-white px-3 py-3 text-sm font-normal"
              />
            </label>
            <button disabled={!selected || loading} className="button-primary h-11 disabled:opacity-40">
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
          {status && <p role="status" className="mt-4 rounded-xl border border-ink/8 bg-app p-3 text-sm text-ink">{status}</p>}
        </form>
      )}

      {/* Curriculum Syllabus View */}
      {curriculum && !activeLesson && (
        <section className="rounded-[26px] border border-ink/10 bg-white p-5 md:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="label">
                {curriculum.reviewStatus} · {curriculum.generationMode}
              </p>
              <h3 className="mt-2 text-2xl font-bold">
                {curriculum.skillName} · {curriculum.learnerLevel}
              </h3>
            </div>
            <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800">Review required</span>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-[.7fr_1.3fr]">
            <div>
              <h4 className="font-bold">Learning objectives</h4>
              <ul className="mt-3 space-y-2">
                {curriculum.objectives.map((objective) => (
                  <li key={objective.id} className="flex gap-2 text-sm leading-6 text-slate">
                    <CheckCircle2 className="mt-1 shrink-0 text-accent" size={15} />
                    {objective.statement}
                  </li>
                ))}
              </ul>
              <h4 className="mt-6 font-bold">Proficiency requires evidence</h4>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate">
                {curriculum.proficiencyCriteria.map((criterion) => (
                  <li key={criterion}>{criterion}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              {curriculum.modules.map((module, index) => (
                <article key={module.id} className="rounded-2xl border border-ink/8 p-4">
                  <div className="flex items-start gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-mint/35 text-xs font-bold text-accent">
                      {index + 1}
                    </span>
                    <div className="w-full">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="font-bold">{module.title}</h4>
                        <span className="inline-flex items-center gap-1 text-xs text-slate">
                          <Clock3 size={12} />
                          {module.estimatedMinutes} min
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate">{module.summary}</p>
                      
                      {/* Clickable Interactive Lesson Cards */}
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate">Interactive Lessons:</p>
                        <div className="flex flex-wrap gap-2">
                          {module.lessonTitles.map((title) => {
                            const key = `${curriculum.skillName}-${module.id}-${title.replace(/\s+/g, "-").toLowerCase()}`;
                            const isDone = completedLessons[key];
                            return (
                              <button
                                key={title}
                                type="button"
                                onClick={() => openLesson(index, module.id, title)}
                                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                                  isDone
                                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                                    : "border-accent/25 bg-accent/5 text-ink hover:border-accent hover:bg-accent/10"
                                }`}
                              >
                                {isDone ? <Check size={13} className="text-emerald-600" /> : <BookOpen size={13} className="text-accent" />}
                                {title}
                                <span className="ml-1 text-[10px] text-slate">Start →</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <p className="mt-3 text-xs text-slate">
                        <strong>Checkpoint:</strong> {module.checkpoint}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
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
                      ? "Great job! This lesson is now marked completed in your local learning studio."
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

          {/* AI Tutor Assistant Panel / Modal */}
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
