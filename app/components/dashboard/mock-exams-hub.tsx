"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Flag,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  RefreshCw,
} from "lucide-react";
import type { MockTestGradedReport } from "@/lib/learning/mock-test-schema";

export interface SanitizedExamQuestion {
  id: string;
  section?: "A" | "B" | "C" | "D" | "E";
  sectionTitle?: string;
  type: string;
  prompt: string;
  codeSnippet?: string;
  options: Array<{ id: string; text: string }>;
  difficulty: string;
  topic: string;
  marks: number;
}

export interface SanitizedMockExam {
  id: string;
  skillName: string;
  skillSlug: string;
  level: string;
  testNumber: number;
  title: string;
  description: string;
  durationMinutes: number;
  totalMarks: number;
  passingPercentage: number;
  topicsCovered: string[];
  questions: SanitizedExamQuestion[];
}

export const SUPPORTED_EXAM_SKILLS = [
  "Python",
  "SQL",
  "Cloud Computing",
  "Cybersecurity",
  "JavaScript",
  "TypeScript",
  "Power BI",
  "Go",
  "Rust",
  "Java",
  "C++",
  "C#",
  "C Programming",
  "PHP",
] as const;

interface MockExamsHubProps {
  ownerKey?: string;
  preferredRole?: string;
  onNavigateTwin?: () => void;
  onSelectCourse?: (slug: string) => void;
}

function resolveDefaultSkill(role?: string): string {
  if (!role) return "Python";
  const r = role.toLowerCase();
  if (r.includes("cloud") || r.includes("devops")) return "Cloud Computing";
  if (r.includes("security") || r.includes("cyber") || r.includes("soc")) return "Cybersecurity";
  if (r.includes("sql") || r.includes("database")) return "SQL";
  if (r.includes("bi") || r.includes("analytics")) return "Power BI";
  if (r.includes("frontend") || r.includes("react") || r.includes("web")) return "JavaScript";
  if (r.includes("typescript")) return "TypeScript";
  if (r.includes("go")) return "Go";
  if (r.includes("rust")) return "Rust";
  if (r.includes("java") && !r.includes("javascript")) return "Java";
  if (r.includes("c++")) return "C++";
  if (r.includes("c#") || r.includes(".net")) return "C#";
  return "Python";
}

export function MockExamsHubView({
  ownerKey = "default",
  preferredRole,
  onNavigateTwin,
  onSelectCourse,
}: MockExamsHubProps) {
  const [selectedSkill, setSelectedSkill] = useState<string>(() => resolveDefaultSkill(preferredRole));
  const [selectedLevel, setSelectedLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [exams, setExams] = useState<SanitizedMockExam[]>([]);
  const [pastAttempts, setPastAttempts] = useState<MockTestGradedReport[]>([]);
  const [loadingExams, setLoadingExams] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [activeExam, setActiveExam] = useState<SanitizedMockExam | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string[]>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(3600);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [gradedReport, setGradedReport] = useState<MockTestGradedReport | null>(null);

  const fetchExamsForSkill = useCallback(
    async (skill: string, level: string) => {
      setLoadingExams(true);
      setLoadError(null);
      try {
        const res = await fetch(
          `/api/learning/mock-tests?skill=${encodeURIComponent(skill)}&level=${encodeURIComponent(level)}`
        );
        if (!res.ok) {
          const errPayload = await res.json().catch(() => ({}));
          throw new Error(
            errPayload?.error?.message || `Unable to load mock exams (HTTP ${res.status})`
          );
        }
        const json = await res.json();
        setExams(json.data?.tests || []);
        if (Array.isArray(json.data?.attempts)) {
          setPastAttempts(json.data.attempts);
        }
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Failed to load mock exams from server.");
      } finally {
        setLoadingExams(false);
      }
    },
    []
  );

  useEffect(() => {
    void fetchExamsForSkill(selectedSkill, selectedLevel);
  }, [selectedSkill, selectedLevel, fetchExamsForSkill]);

  const persistDraftAnswers = (examId: string, answers: Record<string, string[]>) => {
    try {
      window.localStorage.setItem(
        `careertwin-exam-draft:${ownerKey}:${examId}`,
        JSON.stringify(answers)
      );
    } catch {
      // safe fallback
    }
  };

  const clearDraftAnswers = (examId: string) => {
    try {
      window.localStorage.removeItem(`careertwin-exam-draft:${ownerKey}:${examId}`);
    } catch {
      // safe
    }
  };

  const startExam = (exam: SanitizedMockExam) => {
    let restoredAnswers: Record<string, string[]> = {};
    try {
      const savedDraft = window.localStorage.getItem(
        `careertwin-exam-draft:${ownerKey}:${exam.id}`
      );
      if (savedDraft) {
        restoredAnswers = JSON.parse(savedDraft);
      }
    } catch {
      restoredAnswers = {};
    }

    setActiveExam(exam);
    setUserAnswers(restoredAnswers);
    setFlaggedQuestions([]);
    setCurrentQuestionIndex(0);
    setTimeLeftSeconds((exam.durationMinutes || 60) * 60);
    setGradedReport(null);
    setSubmitError(null);
    setShowConfirmModal(false);
  };

  const handleSelectOption = (questionId: string, optionId: string, isMulti: boolean) => {
    if (gradedReport || submitting) return;
    setUserAnswers((prev) => {
      const current = prev[questionId] ?? [];
      const updated = isMulti
        ? current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId]
        : [optionId];
      const nextMap = { ...prev, [questionId]: updated };
      if (activeExam) persistDraftAnswers(activeExam.id, nextMap);
      return nextMap;
    });
  };

  const toggleFlagQuestion = (questionId: string) => {
    setFlaggedQuestions((prev) =>
      prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId]
    );
  };

  const submitExamToServer = useCallback(async () => {
    if (!activeExam || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    setShowConfirmModal(false);

    try {
      const spent = Math.max(0, (activeExam.durationMinutes || 60) * 60 - timeLeftSeconds);
      const res = await fetch(`/api/learning/mock-tests/${encodeURIComponent(activeExam.id)}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testId: activeExam.id,
          answers: userAnswers,
          timeSpentSeconds: spent,
        }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok || !payload?.data?.report) {
        throw new Error(
          payload?.error?.message || `Grading failed cleanly without saving (HTTP ${res.status}). Retry submission.`
        );
      }

      const report: MockTestGradedReport = payload.data.report;
      setGradedReport(report);
      setPastAttempts((prev) => [report, ...prev]);
      clearDraftAnswers(activeExam.id);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Could not submit exam for grading. Your answers are preserved—please retry."
      );
    } finally {
      setSubmitting(false);
    }
  }, [activeExam, submitting, timeLeftSeconds, userAnswers, ownerKey]);

  const submitRef = useRef(submitExamToServer);
  useEffect(() => {
    submitRef.current = submitExamToServer;
  });

  // Exam Countdown Timer
  useEffect(() => {
    if (!activeExam || gradedReport) return;

    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          void submitRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeExam, gradedReport]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const unansweredCount = activeExam
    ? activeExam.questions.filter((q) => !(userAnswers[q.id]?.length > 0)).length
    : 0;

  return (
    <div className="space-y-8 animate-fade-in" data-testid="mock-exams-hub-view">
      {/* Catalogue Mode */}
      {!activeExam && (
        <>
          <div className="rounded-2xl border border-ink/8 bg-gradient-to-r from-amber-950/10 via-brand-forest/10 to-transparent p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-600/20 bg-amber-600/10 px-3 py-1 text-xs font-semibold text-amber-800">
                  <Award className="h-3.5 w-3.5" />
                  Official 100-Mark Certification Examinations
                </div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-ink font-serif">
                  Timed Mock Exams & Diagnostic Checkpoints
                </h1>
                <p className="text-sm md:text-base text-ink/70">
                  Every full-length mock test comprises 28 questions totaling{" "}
                  <strong>100 marks</strong> across 5 weighted sections with strict server-side
                  deterministic grading and section-level feedback.
                </p>
              </div>

              <div className="rounded-xl border border-ink/10 bg-white p-4 shadow-xs md:max-w-xs w-full space-y-1">
                <span className="text-xs font-semibold text-ink">Completed Exam Sessions</span>
                <p className="text-2xl font-bold text-brand-forest">{pastAttempts.length}</p>
                <p className="text-[11px] text-ink/60">
                  Passed: {pastAttempts.filter((a) => a.passed).length} · Synced to Career Twin
                </p>
              </div>
            </div>
          </div>

          {/* Skill & Difficulty Filters */}
          <div className="space-y-3 border-b border-ink/10 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-ink/60">
                Select Technical Track
              </span>
              <select
                aria-label="Difficulty level"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value as "beginner" | "intermediate" | "advanced")}
                className="rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-xs font-semibold text-ink focus:outline-hidden"
              >
                <option value="beginner">Beginner Level</option>
                <option value="intermediate">Intermediate Level</option>
                <option value="advanced">Advanced Level</option>
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {SUPPORTED_EXAM_SKILLS.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => setSelectedSkill(skill)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    selectedSkill === skill
                      ? "bg-ink text-white shadow-xs"
                      : "bg-surface text-ink/70 hover:bg-ink/5 border border-ink/8"
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {loadingExams ? (
            <div className="flex h-48 items-center justify-center rounded-2xl border border-ink/10 bg-white p-8">
              <div className="flex items-center gap-3 text-ink/70 text-xs font-semibold">
                <RefreshCw className="h-4 w-4 animate-spin text-brand-forest" />
                Loading verified 100-mark examinations for {selectedSkill}…
              </div>
            </div>
          ) : loadError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-rose-700 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-rose-900">Unable to load mock examinations</h3>
                  <p className="text-xs text-rose-800 mt-1">{loadError}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => void fetchExamsForSkill(selectedSkill, selectedLevel)}
                className="rounded-xl bg-rose-700 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-800 cursor-pointer shrink-0"
              >
                Retry Loading
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((exam) => {
                const attempts = pastAttempts.filter((a) => a.testId === exam.id);
                const bestScore =
                  attempts.length > 0 ? Math.max(...attempts.map((a) => a.score)) : null;

                return (
                  <div
                    key={exam.id}
                    className="rounded-2xl border border-ink/10 bg-white p-6 shadow-xs hover:border-brand-forest/40 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-full bg-surface px-2.5 py-0.5 text-[11px] font-semibold text-ink/70 uppercase">
                          {exam.skillName}
                        </span>
                        <span className="rounded-full bg-brand-forest/10 px-2.5 py-0.5 text-[10px] font-bold text-brand-forest capitalize">
                          {exam.totalMarks} Marks · {exam.level}
                        </span>
                      </div>

                      <h3 className="text-base md:text-lg font-bold text-ink">{exam.title}</h3>
                      <p className="text-xs text-ink/65 line-clamp-2">{exam.description}</p>

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
                          <span className="font-semibold text-ink">{exam.passingPercentage}%</span>
                          <span className="text-[10px] text-ink/50">Passing Mark</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-ink/8 pt-4">
                      <span className="text-xs text-ink/60">
                        {bestScore !== null ? (
                          <span className="font-semibold text-brand-forest">
                            Best: {bestScore}/100 ({attempts.length} attempts)
                          </span>
                        ) : (
                          "Not attempted yet"
                        )}
                      </span>

                      <button
                        type="button"
                        onClick={() => startExam(exam)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-brand-forest px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-forest/90 transition-all cursor-pointer"
                      >
                        Take Timed Exam <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Active Exam Runner */}
      {activeExam && !gradedReport && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-ink/10 bg-white p-4 md:p-6 shadow-xs">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-ink/60">
                <span>{activeExam.skillName}</span>
                <span>•</span>
                <span className="capitalize">{activeExam.level} Level</span>
                <span>•</span>
                <span className="font-semibold text-brand-forest">{activeExam.totalMarks} Marks Total</span>
                <span>•</span>
                <span>Passing: {activeExam.passingPercentage}%</span>
                <span>•</span>
                <span className={unansweredCount > 0 ? "text-amber-700 font-medium" : "text-emerald-700 font-medium"}>
                  {unansweredCount} Unanswered
                </span>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-ink">{activeExam.title}</h2>
            </div>

            <div className="flex items-center gap-3">
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
                disabled={submitting}
                onClick={() => {
                  if (unansweredCount > 0) {
                    setShowConfirmModal(true);
                  } else {
                    void submitExamToServer();
                  }
                }}
                className="rounded-xl bg-brand-forest px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-forest/90 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? "Grading…" : "Submit Exam"}
              </button>
            </div>
          </div>

          {submitError && (
            <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 flex items-center justify-between gap-4 text-xs text-rose-900">
              <span>{submitError}</span>
              <button
                type="button"
                onClick={() => void submitExamToServer()}
                className="rounded-lg bg-rose-700 px-3 py-1.5 font-semibold text-white cursor-pointer"
              >
                Retry Submit
              </button>
            </div>
          )}

          {/* Submit Confirmation Warning if Unanswered */}
          {showConfirmModal && (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-amber-950">Confirm Early Submission</h3>
                <p className="text-xs text-amber-900">
                  You still have <strong>{unansweredCount}</strong> unanswered question(s) out of{" "}
                  {activeExam.questions.length}. Unanswered questions receive 0 marks.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="rounded-xl border border-amber-300 bg-white px-3.5 py-2 text-xs font-semibold text-amber-950 cursor-pointer"
                >
                  Review Questions
                </button>
                <button
                  type="button"
                  onClick={() => void submitExamToServer()}
                  className="rounded-xl bg-brand-forest px-4 py-2 text-xs font-semibold text-white cursor-pointer"
                >
                  Confirm Submit Now
                </button>
              </div>
            </div>
          )}

          {/* Section Jump Bar */}
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-ink/8 bg-white p-3 text-xs">
            <span className="font-bold text-ink/60 uppercase text-[10px] tracking-wider mr-1">
              Sections:
            </span>
            {[
              { sec: "A", label: "Sec A: Fundamentals (20M)", startIdx: 0 },
              { sec: "B", label: "Sec B: Debugging (15M)", startIdx: 10 },
              { sec: "C", label: "Sec C: Problem Solving (25M)", startIdx: 15 },
              { sec: "D", label: "Sec D: Practical (25M)", startIdx: 20 },
              { sec: "E", label: "Sec E: Architecture (15M)", startIdx: 25 },
            ].map((s) => {
              if (s.startIdx >= activeExam.questions.length) return null;
              return (
                <button
                  key={s.sec}
                  type="button"
                  onClick={() => setCurrentQuestionIndex(s.startIdx)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
                    activeExam.questions[currentQuestionIndex]?.section === s.sec
                      ? "bg-brand-forest text-white shadow-xs"
                      : "bg-surface hover:bg-ink/5 text-ink/70 border border-ink/5"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>

          {/* Question Navigator Pills */}
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-ink/10 bg-surface p-3">
            <span className="text-xs font-semibold text-ink/50 uppercase mr-2">Questions:</span>
            {activeExam.questions.map((q, idx) => {
              const isAnswered = (userAnswers[q.id]?.length ?? 0) > 0;
              const isFlagged = flaggedQuestions.includes(q.id);
              const isCurrent = currentQuestionIndex === idx;

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all relative cursor-pointer ${
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

          {/* Current Question Card */}
          {(() => {
            const currentQ = activeExam.questions[currentQuestionIndex];
            if (!currentQ) return null;
            const isFlagged = flaggedQuestions.includes(currentQ.id);
            const isMulti = currentQ.type === "multiple-select";
            const selectedIds = userAnswers[currentQ.id] ?? [];

            return (
              <div className="rounded-2xl border border-ink/10 bg-white p-6 md:p-8 shadow-xs space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 pb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-brand-forest uppercase tracking-wider">
                      Question {currentQuestionIndex + 1} of {activeExam.questions.length}
                    </span>
                    <span className="rounded-full bg-brand-forest/10 px-2.5 py-0.5 text-[11px] font-bold text-brand-forest">
                      {currentQ.sectionTitle || `Section ${currentQ.section || "A"}`} • {currentQ.marks} Marks
                    </span>
                    <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[10px] text-ink/60">
                      Topic: {currentQ.topic}
                    </span>
                    {isMulti && (
                      <span className="rounded-full bg-violet-50 border border-violet-200 px-2 py-0.5 text-[10px] font-bold text-violet-800">
                        Select Multiple
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleFlagQuestion(currentQ.id)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
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
                  {currentQ.prompt}
                </p>

                {currentQ.codeSnippet && currentQ.codeSnippet.trim() && (
                  <pre className="overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs font-mono text-slate-100 leading-relaxed">
                    <code>{currentQ.codeSnippet}</code>
                  </pre>
                )}

                <div className="space-y-3">
                  {currentQ.options.map((opt) => {
                    const isSelected = selectedIds.includes(opt.id);

                    return (
                      <label
                        key={opt.id}
                        className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-all ${
                          isSelected
                            ? "border-brand-forest bg-brand-forest/5 ring-1 ring-brand-forest/30 shadow-xs"
                            : "border-ink/10 hover:border-ink/20 hover:bg-surface"
                        }`}
                      >
                        <input
                          type={isMulti ? "checkbox" : "radio"}
                          name={`question-${currentQ.id}`}
                          checked={isSelected}
                          onChange={() => handleSelectOption(currentQ.id, opt.id, isMulti)}
                          className="mt-1 h-4 w-4 text-brand-forest focus:ring-brand-forest"
                        />
                        <span className="text-xs md:text-sm text-ink leading-relaxed">{opt.text}</span>
                      </label>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between border-t border-ink/10 pt-4">
                  <button
                    type="button"
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-ink/70 hover:text-ink disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </button>

                  <button
                    type="button"
                    disabled={currentQuestionIndex === activeExam.questions.length - 1}
                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-forest hover:underline disabled:opacity-30 cursor-pointer"
                  >
                    Next Question <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Server-Graded Post-Exam Report */}
      {activeExam && gradedReport && (
        <div className="space-y-6">
          <div
            className={`rounded-2xl border p-6 md:p-8 shadow-xs ${
              gradedReport.passed
                ? "border-emerald-200 bg-emerald-500/10 text-emerald-950"
                : "border-rose-200 bg-rose-500/10 text-rose-950"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider bg-white/80">
                  {gradedReport.passed ? (
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
                <p className="text-sm opacity-85">
                  Authoritative Server Score: <strong>{gradedReport.score} / {gradedReport.totalMarks} marks</strong> (
                  {gradedReport.percentage}%). Passing threshold: {gradedReport.passingPercentage}%.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {onNavigateTwin && (
                  <button
                    type="button"
                    onClick={onNavigateTwin}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-current px-3.5 py-2 text-xs font-semibold hover:bg-white/40 cursor-pointer"
                  >
                    View Twin Sync
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => startExam(activeExam)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-current px-4 py-2 text-xs font-semibold hover:bg-white/40 transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Retake Exam
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveExam(null);
                    setGradedReport(null);
                  }}
                  className="rounded-xl bg-ink px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-ink/90 transition-all cursor-pointer"
                >
                  Return to Exams Hub
                </button>
              </div>
            </div>
          </div>

          {/* Section Breakdown */}
          {gradedReport.sectionWiseScores && Object.keys(gradedReport.sectionWiseScores).length > 0 && (
            <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm uppercase tracking-wider text-ink/60">
                  Section Diagnostic Breakdown (100 Marks)
                </h3>
                <span className="text-xs font-semibold text-brand-forest">
                  Scored: {gradedReport.score} / {gradedReport.totalMarks} Marks
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {Object.entries(gradedReport.sectionWiseScores).map(([secKey, stats]) => (
                  <div key={secKey} className="rounded-xl border border-ink/8 bg-surface p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-ink">Sec {secKey}</span>
                      <span className={`font-bold ${stats.percentage >= 70 ? "text-emerald-700" : "text-amber-700"}`}>
                        {stats.percentage}%
                      </span>
                    </div>
                    <p className="text-[11px] text-ink/70 truncate">{stats.sectionTitle}</p>
                    <div className="h-1.5 w-full rounded-full bg-ink/10 overflow-hidden">
                      <div
                        className={`h-full ${stats.percentage >= 70 ? "bg-emerald-600" : "bg-amber-500"}`}
                        style={{ width: `${stats.percentage}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-ink/60 font-semibold block">
                      {stats.scored} / {stats.total} Marks
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Topic Breakdown */}
          <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-ink/60">
              Topic Diagnostic Breakdown
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(gradedReport.topicWiseScores).map(([topic, stats]) => (
                <div key={topic} className="rounded-xl border border-ink/8 bg-surface p-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-ink">{topic}</span>
                    <span className={`font-bold ${stats.percentage >= 70 ? "text-emerald-700" : "text-amber-700"}`}>
                      {stats.percentage}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-ink/10 overflow-hidden">
                    <div
                      className={`h-full ${stats.percentage >= 70 ? "bg-emerald-600" : "bg-amber-500"}`}
                      style={{ width: `${stats.percentage}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-ink/50">
                    {stats.scored} / {stats.total} marks
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Revision Modules */}
          {gradedReport.recommendedLessons.length > 0 && onSelectCourse && (
            <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm uppercase tracking-wider text-ink/60">
                  Recommended Revision Topics
                </h3>
                <button
                  type="button"
                  onClick={() => onSelectCourse(activeExam.skillSlug)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-forest hover:underline cursor-pointer"
                >
                  <BookOpen className="h-3.5 w-3.5" /> Open {activeExam.skillName} Course
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {gradedReport.recommendedLessons.map((rec, i) => (
                  <span key={i} className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-medium text-amber-900">
                    {rec.topic}: {rec.title}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Question-by-Question Review */}
          <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-xs space-y-6">
            <h3 className="font-bold text-sm uppercase tracking-wider text-ink/60">
              Detailed Question Review & Explanations
            </h3>

            <div className="space-y-6">
              {gradedReport.questions.map((resItem, qIdx) => {
                const origQ = activeExam.questions.find((q) => q.id === resItem.questionId);
                return (
                  <div
                    key={resItem.questionId}
                    className={`rounded-xl border p-5 space-y-3 ${
                      resItem.isCorrect
                        ? "border-emerald-200 bg-emerald-50/20"
                        : "border-rose-200 bg-rose-50/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ink">
                        Question {qIdx + 1} · {resItem.marksAwarded} / {resItem.maxMarks} Marks
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold ${
                          resItem.isCorrect ? "text-emerald-700" : "text-rose-700"
                        }`}
                      >
                        {resItem.isCorrect ? (
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

                    <p className="text-sm font-medium text-ink">{resItem.prompt}</p>

                    {origQ && (
                      <div className="space-y-1.5 text-xs">
                        {origQ.options.map((opt) => {
                          const isUserChoice = resItem.selectedOptionIds.includes(opt.id);
                          const isCorrectChoice = resItem.correctOptionIds.includes(opt.id);

                          return (
                            <div
                              key={opt.id}
                              className={`rounded-lg p-2.5 flex items-center justify-between ${
                                isCorrectChoice
                                  ? "bg-emerald-100/60 font-semibold text-emerald-950 border border-emerald-300"
                                  : isUserChoice
                                  ? "bg-rose-100/60 font-semibold text-rose-950 border border-rose-300"
                                  : "text-ink/60"
                              }`}
                            >
                              <span>{opt.text}</span>
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
                    )}

                    <div className="rounded-lg bg-white p-3 text-xs text-ink/80 border border-ink/8">
                      <span className="font-semibold text-ink">Explanation: </span>
                      {resItem.explanation}
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
