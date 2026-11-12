"use client";

import { useState, useEffect } from "react";
import {
  FolderKanban,
  CheckCircle2,
  FolderGit2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileCode,
  ShieldCheck,
  Award,
  AlertCircle,
  X,
  Upload,
  CheckSquare,
  Square,
  Sparkles,
} from "lucide-react";
import { GUIDED_PROJECTS, type GuidedProject, type ProjectTier } from "@/lib/career/projects-catalog";

interface GuidedProjectsViewProps {
  role: string;
  ownerKey?: string;
  onNavigateAchievements?: () => void;
  onNavigatePortfolio?: () => void;
}

export function GuidedProjectsView({
  role,
  ownerKey = "default",
  onNavigateAchievements,
  onNavigatePortfolio,
}: GuidedProjectsViewProps) {
  const [expandedId, setExpandedId] = useState<string>(GUIDED_PROJECTS[0]?.id || "");
  const [selectedProject, setSelectedProject] = useState<GuidedProject | null>(null);
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [publishedSuccess, setPublishedSuccess] = useState<string | null>(null);

  // Persistent milestone tracking
  const [checkedMilestones, setCheckedMilestones] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem("careertwin-project-milestones");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleMilestone = (projectId: string, milestoneNumber: number) => {
    const key = `${projectId}-m${milestoneNumber}`;
    setCheckedMilestones((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem("careertwin-project-milestones", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Submission modal state
  const [githubUrl, setGithubUrl] = useState("");
  const [liveDemoUrl, setLiveDemoUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    verified: boolean;
    score: number;
    feedback: string;
  } | null>(null);

  const isRecommendedForRole = (proj: GuidedProject) => {
    if (!role) return true;
    const r = role.toLowerCase();
    if (r.includes("front") || r.includes("back") || r.includes("full") || r.includes("software") || r.includes("engineer")) {
      return proj.category === "software_engineering";
    }
    if (r.includes("cloud") || r.includes("devops") || r.includes("infra") || r.includes("site reliability")) {
      return proj.category === "cloud_devops";
    }
    if (r.includes("security") || r.includes("soc") || r.includes("cyber")) {
      return proj.category === "cybersecurity";
    }
    if (r.includes("data") || r.includes("analytics") || r.includes("bi") || r.includes("ai")) {
      return proj.category === "data_analytics";
    }
    return true;
  };

  const filteredProjects = GUIDED_PROJECTS.filter((proj) => {
    if (tierFilter !== "all" && proj.difficulty !== tierFilter) return false;
    if (categoryFilter === "recommended") return isRecommendedForRole(proj);
    if (categoryFilter !== "all" && proj.category !== categoryFilter) return false;
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !githubUrl.trim()) return;

    setSubmitting(true);
    setSubmitResult(null);

    try {
      const res = await fetch("/api/career/projects/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProject.id,
          projectTitle: selectedProject.title,
          githubUrl: githubUrl.trim(),
          liveDemoUrl: liveDemoUrl.trim() || undefined,
          deliverableSummary: summary.trim(),
        }),
      });

      const json = await res.json();
      if (res.ok) {
        setSubmitResult({
          verified: json.data.verified,
          score: json.data.score,
          feedback: json.data.feedback,
        });
      } else {
        setSubmitResult({
          verified: false,
          score: 0,
          feedback: json.error || "Submission failed. Please check repository URL.",
        });
      }
    } catch (err: any) {
      setSubmitResult({
        verified: false,
        score: 0,
        feedback: err.message || "An unexpected error occurred.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-3xl border border-ink/8 dark:border-white/10 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-purple-500 animate-pulse" />
            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-accent dark:text-purple-400 font-bold">
              4-Tier Guided Project Engine · Verifiable Code
            </p>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-ink dark:text-white">
            Guided Industry Projects & Verifiable Proof
          </h1>
          <p className="text-xs md:text-sm text-slate dark:text-slate-400 leading-relaxed">
            Progress from Beginner utilities to Capstone cloud architectures. Every project provides explicit problem statements,
            step-by-step milestone checklists, automated test specifications, and evaluation rubrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {onNavigatePortfolio && (
            <button
              type="button"
              onClick={onNavigatePortfolio}
              className="inline-flex items-center gap-1.5 rounded-xl border border-ink/10 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-2.5 text-xs font-semibold text-ink dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer"
            >
              <FolderKanban size={14} /> My Portfolio
            </button>
          )}
          {onNavigateAchievements && (
            <button
              type="button"
              onClick={onNavigateAchievements}
              className="button-primary px-4 py-2.5 text-xs inline-flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Award size={14} /> View Verified Achievements
            </button>
          )}
        </div>
      </section>

      {publishedSuccess && (
        <div className="rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 p-4 text-xs font-semibold text-emerald-900 dark:text-emerald-300 flex items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span>{publishedSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setPublishedSuccess(null)}
            className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-white font-bold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Bar: Tier & Category */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-ink/8 dark:border-white/10 pb-4">
        {/* Tier Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: "All Tiers" },
            { id: "beginner", label: "Beginner" },
            { id: "intermediate", label: "Intermediate" },
            { id: "advanced", label: "Advanced" },
            { id: "capstone", label: "Capstone" },
          ].map((tab) => {
            const isActive = tierFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTierFilter(tab.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-purple-600 text-white shadow-xs"
                    : "bg-white dark:bg-slate-900 text-slate dark:text-slate-400 hover:text-ink dark:hover:text-white border border-ink/8 dark:border-white/10"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-ink/10 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-ink dark:text-white font-semibold focus:outline-hidden"
          >
            <option value="all">All Domains</option>
            <option value="recommended">Recommended for Your Role</option>
            <option value="software_engineering">Software Engineering</option>
            <option value="cloud_devops">Cloud & DevOps</option>
            <option value="cybersecurity">Cybersecurity</option>
            <option value="data_analytics">Data & Analytics</option>
          </select>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-5">
        {filteredProjects.map((proj) => {
          const isExpanded = expandedId === proj.id;
          const isRec = isRecommendedForRole(proj);

          // Calculate completed milestones for this project
          const totalMilestones = proj.stepByStepMilestones.length;
          const completedCount = proj.stepByStepMilestones.filter(
            (m) => checkedMilestones[`${proj.id}-m${m.milestone}`]
          ).length;
          const pct = Math.round((completedCount / totalMilestones) * 100);

          return (
            <article
              key={proj.id}
              className="rounded-3xl border border-ink/10 dark:border-white/10 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-xs transition space-y-5"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-ink/8 dark:border-white/10 pb-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {isRec && (
                      <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 size={10} /> Role Match
                      </span>
                    )}
                    <span className="rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                      Tier: {proj.difficulty}
                    </span>
                    <span className="rounded-md bg-app dark:bg-slate-800 border border-ink/10 dark:border-white/10 text-slate dark:text-slate-300 px-2 py-0.5 text-[10px] font-bold">
                      {proj.category.replace(/_/g, " ").toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-ink dark:text-white tracking-tight">{proj.title}</h2>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProject(proj);
                      setSubmitResult(null);
                    }}
                    className="button-primary px-3.5 py-2 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <FolderGit2 size={13} /> Submit Repository
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? "" : proj.id)}
                    className="p-2 text-slate dark:text-slate-400 hover:text-ink dark:hover:text-white rounded-lg border border-ink/10 dark:border-white/10 hover:bg-app dark:hover:bg-slate-800 transition cursor-pointer"
                    aria-label={isExpanded ? "Collapse project spec" : "Expand project spec"}
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Progress Bar for Milestones */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-semibold text-slate dark:text-slate-400">
                  <span>Implementation Milestones: {completedCount} of {totalMilestones} Completed</span>
                  <span className="text-purple-600 dark:text-purple-400 font-bold">{pct}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Problem Statement & Why it Matters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 space-y-1.5 border border-ink/5 dark:border-white/5">
                  <span className="text-[10px] uppercase font-bold text-slate dark:text-slate-400 block">Problem Statement</span>
                  <p className="text-ink dark:text-slate-200 leading-relaxed">{proj.problemStatement}</p>
                </div>
                <div className="rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 p-4 space-y-1.5 border border-purple-100 dark:border-purple-900/40">
                  <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 block">Why Recruiters Care</span>
                  <p className="text-ink dark:text-slate-200 leading-relaxed">{proj.whyItMatters}</p>
                </div>
              </div>

              {/* Tech Stack & Required Skills */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[11px] font-bold text-slate dark:text-slate-400">Technologies:</span>
                {proj.toolsAndTech.map((tool, idx) => (
                  <span key={idx} className="bg-app dark:bg-slate-800 text-ink dark:text-white font-mono text-[11px] px-2.5 py-0.5 rounded-md border border-ink/10 dark:border-white/10">
                    {tool}
                  </span>
                ))}
              </div>

              {/* Collapsible Deep Specs */}
              {isExpanded && (
                <div className="space-y-6 pt-2 border-t border-ink/8 dark:border-white/10 animate-fade-in text-xs">
                  {/* Milestones with Interactive Checkboxes */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-ink dark:text-white text-sm flex items-center gap-1.5">
                      <Sparkles size={14} className="text-purple-500" />
                      Step-by-Step Implementation Milestones (Click to check off):
                    </h3>
                    <div className="grid gap-3">
                      {proj.stepByStepMilestones.map((m) => {
                        const isDone = Boolean(checkedMilestones[`${proj.id}-m${m.milestone}`]);
                        return (
                          <div
                            key={m.milestone}
                            onClick={() => toggleMilestone(proj.id, m.milestone)}
                            className={`rounded-2xl border p-4 space-y-2 cursor-pointer transition ${
                              isDone
                                ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800"
                                : "bg-slate-50/50 dark:bg-slate-800/40 border-ink/8 dark:border-white/10 hover:border-purple-400"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <span className={`size-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                                  isDone ? "bg-emerald-600 text-white" : "bg-purple-600 text-white"
                                }`}>
                                  {m.milestone}
                                </span>
                                <strong className={`text-xs ${isDone ? "text-emerald-900 dark:text-emerald-300 line-through" : "text-ink dark:text-white"}`}>
                                  {m.title}
                                </strong>
                              </div>
                              <span className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1">
                                {isDone ? <CheckSquare size={16} className="text-emerald-600" /> : <Square size={16} />}
                              </span>
                            </div>
                            <p className="text-slate dark:text-slate-300 pl-8 leading-relaxed">{m.instructions}</p>
                            <p className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-400 pl-8 flex items-center gap-1">
                              <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" />
                              Deliverable: {m.deliverableCheck}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Architecture & GitHub Directory Structure */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-bold text-ink dark:text-white">Suggested GitHub Repository Structure:</h4>
                      <pre className="p-3.5 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto leading-relaxed border border-white/10">
                        {proj.suggestedGitHubStructure}
                      </pre>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-ink dark:text-white">Evaluation Rubric:</h4>
                      <div className="space-y-2">
                        {proj.evaluationRubric.map((r, rIdx) => (
                          <div key={rIdx} className="rounded-xl border border-ink/8 dark:border-white/10 bg-slate-50 dark:bg-slate-800/40 p-2.5 space-y-0.5">
                            <div className="flex justify-between font-bold text-ink dark:text-white">
                              <span>{r.criterion}</span>
                              <span className="text-purple-600 dark:text-purple-400">{r.weightPercent}%</span>
                            </div>
                            <p className="text-[11px] text-slate dark:text-slate-400">{r.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Resume & Presentation Guidance */}
                  <div className="rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 p-4 text-amber-900 dark:text-amber-300 leading-relaxed">
                    <strong className="block text-xs font-bold mb-1">Resume Presentation Guidance:</strong>
                    {proj.portfolioPresentationGuidance}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* Submission Modal */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 md:p-8 shadow-2xl space-y-4 border border-ink/10 dark:border-white/10">
            <div className="flex items-center justify-between border-b border-ink/10 dark:border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-ink dark:text-white">Submit Deliverable & Artifact</h3>
                <p className="text-xs text-slate dark:text-slate-400 truncate max-w-sm">{selectedProject.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="text-slate hover:text-ink dark:hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {submitResult ? (
              <div className="space-y-4 py-2 text-center animate-fade-in">
                {submitResult.verified ? (
                  <div className="size-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 size={24} />
                  </div>
                ) : (
                  <div className="size-12 mx-auto rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 flex items-center justify-center">
                    <AlertCircle size={24} />
                  </div>
                )}
                <h4 className="text-base font-bold text-ink dark:text-white">
                  {submitResult.verified ? "Project Artifact Verified! 🎉" : "Verification Incomplete"}
                </h4>
                <p className="text-xs text-slate dark:text-slate-300 max-w-md mx-auto leading-relaxed">{submitResult.feedback}</p>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
                  {submitResult.verified && (
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          const existingKey = `careertwin-development-v1:${ownerKey || "default"}`;
                          const raw = window.localStorage.getItem(existingKey);
                          const devData = raw ? JSON.parse(raw) : { tasks: [], projects: [], practice: [] };
                          const newProj = {
                            id: selectedProject.id,
                            title: selectedProject.title,
                            outcome: githubUrl.trim(),
                            status: "completed",
                            createdAt: new Date().toISOString(),
                          };
                          const updated = {
                            ...devData,
                            projects: [newProj, ...(devData.projects || []).filter((p: any) => p.id !== selectedProject.id)],
                          };
                          window.localStorage.setItem(existingKey, JSON.stringify(updated));
                          setPublishedSuccess(`Published "${selectedProject.title}" to your student portfolio!`);
                        } catch {
                          // ignore
                        }
                        setSelectedProject(null);
                        if (onNavigatePortfolio) {
                          onNavigatePortfolio();
                        }
                      }}
                      className="button-primary px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Award size={13} /> Publish to Portfolio
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProject(null);
                      if (onNavigateAchievements && submitResult.verified) {
                        onNavigateAchievements();
                      }
                    }}
                    className="button-secondary px-4 py-2 text-xs font-semibold cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-ink dark:text-white">Public GitHub Repository URL *</label>
                  <input
                    type="url"
                    required
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username/project-repo"
                    className="w-full rounded-xl border border-ink/15 dark:border-white/10 dark:bg-slate-800 p-2.5 text-xs text-ink dark:text-white focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate dark:text-slate-400">Must be an active, public GitHub repository.</span>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-ink dark:text-white">Live Demo / Deployment URL (Optional)</label>
                  <input
                    type="url"
                    value={liveDemoUrl}
                    onChange={(e) => setLiveDemoUrl(e.target.value)}
                    placeholder="https://my-app.vercel.app or API endpoint"
                    className="w-full rounded-xl border border-ink/15 dark:border-white/10 dark:bg-slate-800 p-2.5 text-xs text-ink dark:text-white focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-ink dark:text-white">Deliverable Summary & Architecture Notes *</label>
                  <textarea
                    rows={4}
                    required
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Explain your approach, testing choices, trade-offs made, and instructions to run your code..."
                    className="w-full rounded-xl border border-ink/15 dark:border-white/10 dark:bg-slate-800 p-2.5 text-xs text-ink dark:text-white focus:outline-hidden leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink/8 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setSelectedProject(null)}
                    className="px-4 py-2 rounded-xl text-slate dark:text-slate-400 hover:bg-app dark:hover:bg-slate-800 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="button-primary px-5 py-2 text-xs font-semibold disabled:opacity-50"
                  >
                    {submitting ? "Evaluating Rubric..." : "Submit for Verification"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
