"use client";

import { useState, useEffect } from "react";
import {
  Compass,
  CheckCircle2,
  Clock,
  ArrowRight,
  BookOpen,
  Terminal,
  Award,
  Layers,
  ChevronRight,
  Sparkles,
  BookmarkCheck,
  Check,
  Target,
} from "lucide-react";
import {
  LEARNING_PATHS,
  recommendLearningPath,
  type LearningPath,
  type PathCourse,
} from "@/lib/learning/learning-paths";

interface LearningPathsProps {
  userRole?: string;
  ownerKey?: string;
  onSelectCourse?: (courseSlug: string) => void;
  onNavigateLabs?: () => void;
  onNavigateExams?: () => void;
  onNavigateProjects?: () => void;
}

export function LearningPathsView({
  userRole = "Software Engineer",
  ownerKey = "default",
  onSelectCourse,
  onNavigateLabs,
  onNavigateExams,
  onNavigateProjects,
}: LearningPathsProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [activePathId, setActivePathId] = useState<string>(LEARNING_PATHS[0].id);
  const [enrolledPathIds, setEnrolledPathIds] = useState<string[]>([]);
  const [filterEnrolledOnly, setFilterEnrolledOnly] = useState<boolean>(false);

  const recommended = recommendLearningPath(userRole);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(`careertwin-enrolled-paths:${ownerKey}`);
      if (stored) {
        setEnrolledPathIds(JSON.parse(stored));
      } else if (recommended?.id) {
        // Auto-enroll in recommended by default if none
        setEnrolledPathIds([recommended.id]);
      }
    } catch {
      // fallback
    }
  }, [ownerKey, recommended?.id]);

  const toggleEnroll = (pathId: string) => {
    setEnrolledPathIds((prev) => {
      const updated = prev.includes(pathId)
        ? prev.filter((id) => id !== pathId)
        : [...prev, pathId];
      try {
        window.localStorage.setItem(
          `careertwin-enrolled-paths:${ownerKey}`,
          JSON.stringify(updated)
        );
      } catch {
        // storage fallback
      }
      return updated;
    });
  };

  const filteredPaths = LEARNING_PATHS.filter((p) => {
    if (filterEnrolledOnly && !enrolledPathIds.includes(p.id)) return false;
    if (selectedDifficulty !== "all" && p.difficulty !== selectedDifficulty) return false;
    return true;
  });

  const activePath = LEARNING_PATHS.find((p) => p.id === activePathId) || LEARNING_PATHS[0];
  const isEnrolled = enrolledPathIds.includes(activePath.id);

  return (
    <div className="space-y-8 animate-fade-in" data-testid="learning-paths-view">
      {/* Header Banner */}
      <div className="rounded-2xl border border-ink/8 bg-gradient-to-r from-teal-900/10 via-brand-forest/10 to-transparent p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-forest/20 bg-brand-forest/10 px-3 py-1 text-xs font-semibold text-brand-forest">
              <Compass className="h-3.5 w-3.5" />
              Cisco-Inspired Technical Learning Paths
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-ink font-serif">
              Structured Career Learning Paths
            </h1>
            <p className="text-sm md:text-base text-ink/70">
              Role-aligned, multi-course curriculums combining theoretical foundations, interactive
              hands-on labs, comprehensive assessments, and verified capstone projects.
            </p>
          </div>

          {recommended && (
            <div className="rounded-xl border border-brand-forest/30 bg-white p-4 shadow-xs md:max-w-xs w-full">
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-forest uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Twin Recommendation
              </div>
              <p className="mt-1 font-semibold text-ink text-sm">{recommended.title}</p>
              <p className="text-xs text-ink/60 mt-0.5">Matched for target: {userRole}</p>
              <button
                type="button"
                onClick={() => setActivePathId(recommended.id)}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-forest hover:underline"
              >
                Inspect Path Details <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filters and Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {["all", "beginner", "intermediate", "advanced"].map((diff) => (
            <button
              key={diff}
              type="button"
              onClick={() => setSelectedDifficulty(diff)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium capitalize transition-colors ${
                selectedDifficulty === diff
                  ? "bg-ink text-white"
                  : "bg-surface text-ink/70 hover:bg-ink/5"
              }`}
            >
              {diff === "all" ? "All Levels" : `${diff} Level`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterEnrolledOnly(!filterEnrolledOnly)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              filterEnrolledOnly
                ? "border-brand-forest bg-brand-forest/10 text-brand-forest"
                : "border-ink/10 text-ink/70 hover:bg-surface"
            }`}
          >
            <BookmarkCheck className="h-3.5 w-3.5" />
            {filterEnrolledOnly ? "Showing Enrolled Paths" : "Filter Enrolled Only"}
          </button>
        </div>
      </div>

      {/* Main Grid: Path Selector & Detailed Path Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Path Cards List */}
        <div className="lg:col-span-5 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink/50">
            Available Paths ({filteredPaths.length})
          </p>

          <div className="space-y-3">
            {filteredPaths.map((path) => {
              const selected = path.id === activePathId;
              const enrolled = enrolledPathIds.includes(path.id);
              const isTwinMatch = recommended?.id === path.id;

              return (
                <div
                  key={path.id}
                  onClick={() => setActivePathId(path.id)}
                  className={`group relative rounded-xl border p-4 text-left cursor-pointer transition-all ${
                    selected
                      ? "border-brand-forest bg-brand-forest/5 ring-1 ring-brand-forest/30 shadow-xs"
                      : "border-ink/10 bg-white hover:border-ink/30 hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[10px] font-semibold text-ink/70 uppercase">
                          {path.difficulty}
                        </span>
                        <span className="text-[11px] text-ink/50">{path.expectedDuration}</span>
                        {isTwinMatch && (
                          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                            Twin Match
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-ink text-sm group-hover:text-brand-forest transition-colors">
                        {path.title}
                      </h3>
                      <p className="text-xs text-ink/65 line-clamp-2">{path.description}</p>
                    </div>
                    <ChevronRight
                      className={`h-4 w-4 shrink-0 mt-1 transition-transform ${
                        selected ? "text-brand-forest translate-x-0.5" : "text-ink/30"
                      }`}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-ink/5 pt-2 text-[11px] text-ink/60">
                    <div className="flex items-center gap-3">
                      <span>{path.courses.length} Courses</span>
                      <span>•</span>
                      <span>{path.practicalLabsCount} Labs</span>
                      <span>•</span>
                      <span>{path.assessmentsCount} Exams</span>
                    </div>
                    {enrolled && (
                      <span className="inline-flex items-center gap-1 font-semibold text-brand-forest">
                        <Check className="h-3 w-3" /> Enrolled
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Path Deep-Dive Specification */}
        <div className="lg:col-span-7 rounded-2xl border border-ink/10 bg-white p-6 shadow-xs space-y-6">
          {/* Header of Active Path */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-ink/10 pb-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-brand-forest/10 px-2.5 py-0.5 text-xs font-semibold text-brand-forest">
                  {activePath.badge}
                </span>
                <span className="rounded-full bg-ink/5 px-2.5 py-0.5 text-xs font-medium text-ink/70 capitalize">
                  {activePath.difficulty} Level
                </span>
                <span className="text-xs text-ink/50 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {activePath.expectedDuration}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-ink">{activePath.title}</h2>
              <p className="text-sm text-ink/75 leading-relaxed">{activePath.description}</p>
            </div>

            <button
              type="button"
              aria-label={isEnrolled ? "Unenroll from path" : "Enroll in path"}
              onClick={() => toggleEnroll(activePath.id)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                isEnrolled
                  ? "border border-brand-forest/40 bg-brand-forest/10 text-brand-forest hover:bg-brand-forest/20"
                  : "bg-brand-forest text-white hover:bg-brand-forest/90 shadow-xs"
              }`}
            >
              {isEnrolled ? (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Enrolled
                </>
              ) : (
                <>
                  <BookmarkCheck className="h-4 w-4" /> Enroll in Path
                </>
              )}
            </button>
          </div>

          {/* Prerequisites and Target Skills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-ink/8 bg-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink/50">
                Prerequisites
              </p>
              <ul className="mt-2 space-y-1">
                {activePath.prerequisites.map((req, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs text-ink/80">
                    <span className="h-1.5 w-1.5 rounded-full bg-ink/30" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-ink/8 bg-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink/50">
                Target Competencies
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {activePath.requiredSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="rounded-md border border-ink/10 bg-white px-2 py-0.5 text-xs font-medium text-ink/80"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Ordered Courses Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-ink/50 flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-brand-forest" />
                Ordered Curriculum ({activePath.courses.length} Courses)
              </h4>
              <span className="text-xs text-ink/50">Recommended order for mastery</span>
            </div>

            <div className="space-y-3">
              {activePath.courses.map((course: PathCourse) => (
                <div
                  key={course.slug}
                  className="rounded-xl border border-ink/10 bg-white p-4 hover:border-ink/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink/5 text-[10px] font-bold text-ink">
                        {course.order}
                      </span>
                      <h5 className="font-semibold text-ink text-sm">{course.title}</h5>
                      <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium text-ink/60 uppercase">
                        {course.level}
                      </span>
                    </div>
                    <p className="text-xs text-ink/65 pl-7">{course.whyIncluded}</p>
                    <p className="text-[11px] text-ink/50 pl-7">{course.lessonsCount} structured lessons</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectCourse && onSelectCourse(course.slug)}
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-brand-forest/30 bg-brand-forest/5 px-3 py-1.5 text-xs font-semibold text-brand-forest hover:bg-brand-forest hover:text-white transition-all"
                  >
                    Study Course <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Practical Labs and Mock Exams Callouts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-ink/10 pt-4">
            <div className="rounded-xl border border-teal-600/20 bg-teal-500/5 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-teal-800 text-xs font-semibold uppercase">
                  <Terminal className="h-4 w-4" />
                  Hands-On Labs ({activePath.practicalLabsCount})
                </div>
                <p className="mt-1 text-xs text-ink/75">
                  Interactive network, code sandbox, and log analysis labs to cement theory into
                  verifiable skill.
                </p>
              </div>
              <button
                type="button"
                onClick={onNavigateLabs}
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-teal-800 hover:underline"
              >
                Launch Practical Labs <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            <div className="rounded-xl border border-amber-600/20 bg-amber-500/5 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-amber-800 text-xs font-semibold uppercase">
                  <Award className="h-4 w-4" />
                  Phase Assessments ({activePath.assessmentsCount})
                </div>
                <p className="mt-1 text-xs text-ink/75">
                  Timed multiple-choice mock exams with instantaneous server-side grading and weak-topic
                  breakdowns.
                </p>
              </div>
              <button
                type="button"
                onClick={onNavigateExams}
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-amber-800 hover:underline"
              >
                Open Mock Exams Hub <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Capstone Project Card */}
          <div className="rounded-xl border border-ink/10 bg-surface p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-brand-forest" />
                <h4 className="font-semibold text-ink text-sm">
                  Capstone Project: {activePath.finalProject.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={onNavigateProjects}
                className="text-xs font-semibold text-brand-forest hover:underline"
              >
                Submit Project Deliverable →
              </button>
            </div>
            <p className="mt-2 text-xs text-ink/75">{activePath.finalProject.objective}</p>
            <div className="mt-3 rounded-lg border border-ink/5 bg-white p-2.5 text-xs text-ink/70">
              <span className="font-semibold text-ink">Required Deliverable: </span>
              {activePath.finalProject.deliverable}
            </div>
          </div>

          {/* Completion Criteria Footer */}
          <div className="rounded-xl bg-ink/5 p-4 text-xs text-ink/70 space-y-1">
            <p className="font-semibold text-ink">Certificate Completion Criteria:</p>
            <p>{activePath.completionCriteria}</p>
            <p className="text-brand-forest font-medium mt-1">
              Next Step: {activePath.nextRecommendedStep}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
