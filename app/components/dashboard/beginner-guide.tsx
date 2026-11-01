"use client";

import { useState } from "react";
import {
  Compass,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  BookOpen,
  Award,
  Terminal,
  Target,
  ArrowRight,
  Sparkles,
  Lightbulb,
} from "lucide-react";

interface BeginnerGuideProps {
  userRole?: string;
  onNavigatePaths?: () => void;
  onNavigateCatalogue?: () => void;
  onNavigateLabs?: () => void;
  onNavigateExams?: () => void;
}

export function BeginnerGuide({
  userRole = "Software Engineer",
  onNavigatePaths,
  onNavigateCatalogue,
  onNavigateLabs,
  onNavigateExams,
}: BeginnerGuideProps) {
  const [expanded, setExpanded] = useState<boolean>(true);
  const [activeQuestion, setActiveQuestion] = useState<number | null>(0);

  const GUIDANCE_QUESTIONS = [
    {
      q: "1. What am I learning?",
      summary: "Role-aligned, practical technical competencies rather than random trivia.",
      answer: `You are studying a structured curriculum mapped directly to your chosen target role: ${userRole}. Each subject is decomposed into clear theoretical concepts, runnable code examples, interactive exercises, and verified knowledge checks.`,
      action: onNavigateCatalogue ? { label: "Browse 14 Courses", onClick: onNavigateCatalogue } : undefined,
    },
    {
      q: "2. Why am I learning it?",
      summary: "Every lesson directly backs an industry hiring standard or architecture pattern.",
      answer: "Instead of generic tutorials, each lesson states its exact rationale: why companies require this skill, what production bugs it prevents, and how it directly fits into technical interviews and portfolio projects.",
    },
    {
      q: "3. What should I study first?",
      summary: "Follow your recommended Learning Path step by step.",
      answer: "Do not guess where to start. Your Career Twin recommends an ordered Learning Path (Course 1 → Course 2 → Course 3). Always finish foundations before attempting advanced systems or framework design.",
      action: onNavigatePaths ? { label: "View Recommended Path", onClick: onNavigatePaths } : undefined,
    },
    {
      q: "4. What do I need to complete?",
      summary: "Three milestones per subject: markdown lessons, hands-on lab sandbox, and mock exam.",
      answer: "To earn verified skill status on CareerTwin: read all module lessons, run the automated hands-on practice lab, and achieve at least 70% on the comprehensive phase assessment.",
      action: onNavigateLabs ? { label: "Open Hands-on Labs", onClick: onNavigateLabs } : undefined,
    },
    {
      q: "5. How will I be tested?",
      summary: "Timed, multiple-choice exams evaluated server-side with zero artificial scores.",
      answer: "Each exam has a strict 30-minute limit and evaluates real scenario-based problems. Tests are graded instantaneously, showing whether you passed, your percentage, and a topic-by-topic diagnostic breakdown.",
      action: onNavigateExams ? { label: "Go to Mock Exams Hub", onClick: onNavigateExams } : undefined,
    },
    {
      q: "6. What does my result mean?",
      summary: "Diagnostic feedback highlights your strengths and tells you where to revise.",
      answer: "If you score >= 70%, the skill is cryptographically recorded as 'Verified' in your Career Twin. If you score < 70%, the system identifies the exact weak topics (e.g. Async Scopes, CIDR Math) and guides your review before retaking.",
    },
    {
      q: "7. What should I learn next?",
      summary: "Advance to the next course in your path or build a Capstone Portfolio Project.",
      answer: "Once a course is mastered, advance to the next course in your sequence or build the applied capstone project to demonstrate verifiable code deliverables on your resume.",
      action: onNavigatePaths ? { label: "Check Path Progression", onClick: onNavigatePaths } : undefined,
    },
  ];

  return (
    <div className="rounded-2xl border border-brand-forest/20 bg-gradient-to-r from-teal-500/5 via-brand-forest/5 to-transparent p-5 md:p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-forest/10 text-brand-forest">
            <Lightbulb className="h-4 w-4 text-amber-500" />
          </span>
          <div>
            <h3 className="font-bold text-ink text-sm md:text-base">
              New Student Orientation: 7 Key Questions Answered
            </h3>
            <p className="text-xs text-ink/65">
              Everything you need to know about navigating your curriculum, labs, and certification.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1 rounded-lg border border-ink/10 px-2.5 py-1 text-xs font-semibold text-ink/70 hover:bg-white"
        >
          {expanded ? (
            <>
              Hide Guide <ChevronUp className="h-3.5 w-3.5" />
            </>
          ) : (
            <>
              Show Guide <ChevronDown className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>

      {/* Accordion Questions */}
      {expanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 animate-fade-in">
          {GUIDANCE_QUESTIONS.map((item, idx) => {
            const isOpen = activeQuestion === idx;

            return (
              <div
                key={idx}
                className={`rounded-xl border p-4 transition-all ${
                  isOpen
                    ? "border-brand-forest/40 bg-white ring-1 ring-brand-forest/20 shadow-xs"
                    : "border-ink/8 bg-white/70 hover:bg-white hover:border-ink/20"
                }`}
              >
                <button
                  type="button"
                  className="w-full text-left flex items-start justify-between gap-3 cursor-pointer"
                  onClick={() => setActiveQuestion(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                >
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-ink">{item.q}</h4>
                    <p className="text-[11px] text-ink/70">{item.summary}</p>
                  </div>
                  <span
                    className="p-1 text-ink/40 hover:text-ink shrink-0"
                    aria-hidden="true"
                  >
                    {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </span>
                </button>

                {isOpen && (
                  <div className="mt-3 border-t border-ink/8 pt-3 space-y-3 text-xs text-ink/80 leading-relaxed animate-fade-in">
                    <p>{item.answer}</p>
                    {item.action && (
                      <button
                        type="button"
                        onClick={item.action.onClick}
                        className="inline-flex items-center gap-1 font-semibold text-brand-forest hover:underline text-xs"
                      >
                        {item.action.label} <ArrowRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
