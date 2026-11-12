"use client";

import { useState } from "react";
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
} from "lucide-react";
import { GUIDED_PROJECTS, type GuidedProject } from "@/lib/career/projects-catalog";

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
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [publishedSuccess, setPublishedSuccess] = useState<string | null>(null);

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
      <section className="rounded-[28px] border border-ink/8 bg-white p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-accent font-bold flex items-center gap-2">
            <span className="size-2 rounded-full bg-accent" />
            Applied Engineering Proof & Portfolios
          </p>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-ink">
            Guided Industry Projects & Verifiable Proof
          </h1>
          <p className="text-sm text-slate">
            Recruiters hire code that runs. Complete step-by-step projects with automated test suites, Dockerfiles, and clear architecture documentation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onNavigatePortfolio && (
            <button
              type="button"
              onClick={onNavigatePortfolio}
              className="button-secondary px-4 py-2.5 text-xs inline-flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <FolderKanban size={14} /> My Portfolio
            </button>
          )}
          {onNavigateAchievements && (
            <button
              type="button"
              onClick={onNavigateAchievements}
              className="button-secondary px-4 py-2.5 text-xs inline-flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Award size={14} /> View Verified Achievements
            </button>
          )}
        </div>
      </section>

      {publishedSuccess && (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-semibold text-emerald-900 flex items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
            <span>{publishedSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setPublishedSuccess(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Category & Recommendation Filters */}
      <div className="flex flex-wrap items-center gap-2 border-b border-ink/8 pb-4">
        {[
          { id: "all", label: "All Projects" },
          { id: "recommended", label: `Recommended for ${role || "Your Target Role"}` },
          { id: "software_engineering", label: "Software Engineering" },
          { id: "cloud_devops", label: "Cloud & DevOps" },
          { id: "cybersecurity", label: "Cybersecurity" },
          { id: "data_analytics", label: "Data & Databases" },
        ].map((tab) => {
          const isActive = categoryFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCategoryFilter(tab.id)}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-accent text-white shadow-xs"
                  : "bg-white text-slate hover:text-ink border border-ink/8 hover:border-ink/20"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Projects List */}
      <div className="space-y-5">
        {filteredProjects.map((proj) => {
          const isExpanded = expandedId === proj.id;
          const isRec = isRecommendedForRole(proj);

          return (
            <article
              key={proj.id}
              className="rounded-[28px] border border-ink/10 bg-white p-6 md:p-8 shadow-xs transition space-y-5"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-ink/8 pb-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {isRec && (
                      <span className="rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 size={10} /> Role Match
                      </span>
                    )}
                    <span className="rounded-md bg-violet-50 text-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                      {proj.difficulty}
                    </span>
                    <span className="rounded-md bg-app border border-ink/10 text-slate px-2 py-0.5 text-[10px] font-bold">
                      {proj.category.replace(/_/g, " ").toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-ink tracking-tight">{proj.title}</h2>
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
                    className="p-2 text-slate hover:text-ink rounded-lg border border-ink/10 hover:bg-app transition cursor-pointer"
                    aria-label={isExpanded ? "Collapse project spec" : "Expand project spec"}
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Problem Statement & Why it Matters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="rounded-2xl bg-app/40 p-4 space-y-1.5 border border-ink/8">
                  <span className="text-[10px] uppercase font-bold text-slate block">Problem Statement</span>
                  <p className="text-ink/85 leading-relaxed">{proj.problemStatement}</p>
                </div>
                <div className="rounded-2xl bg-violet-50/50 p-4 space-y-1.5 border border-violet-100">
                  <span className="text-[10px] uppercase font-bold text-accent block">Why Recruiters Care</span>
                  <p className="text-ink/85 leading-relaxed">{proj.whyItMatters}</p>
                </div>
              </div>

              {/* Tech Stack & Required Skills */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[11px] font-bold text-slate">Technologies:</span>
                {proj.toolsAndTech.map((tool, idx) => (
                  <span key={idx} className="bg-app text-ink font-mono text-[11px] px-2.5 py-0.5 rounded-md border border-ink/10">
                    {tool}
                  </span>
                ))}
              </div>

              {/* Collapsible Deep Specs */}
              {isExpanded && (
                <div className="space-y-6 pt-2 border-t border-ink/8 animate-fade-in text-xs">
                  {/* Milestones */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-ink text-sm">Step-by-Step Implementation Milestones:</h3>
                    <div className="grid gap-3">
                      {proj.stepByStepMilestones.map((m) => (
                        <div key={m.milestone} className="rounded-xl border border-ink/8 p-3.5 space-y-1.5 bg-[#faf9f5]">
                          <div className="flex items-center gap-2">
                            <span className="size-5 rounded-full bg-accent text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                              {m.milestone}
                            </span>
                            <strong className="text-ink text-xs">{m.title}</strong>
                          </div>
                          <p className="text-slate pl-7">{m.instructions}</p>
                          <p className="text-[11px] font-semibold text-emerald-800 pl-7 flex items-center gap-1">
                            <CheckCircle2 size={12} className="text-emerald-600" />
                            Deliverable: {m.deliverableCheck}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Architecture & GitHub Directory Structure */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-bold text-ink">Suggested GitHub Repository Structure:</h4>
                      <pre className="p-3.5 rounded-xl bg-ink text-mint font-mono text-[11px] overflow-x-auto leading-relaxed">
                        {proj.suggestedGitHubStructure}
                      </pre>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-ink">Evaluation Rubric:</h4>
                      <div className="space-y-2">
                        {proj.evaluationRubric.map((r, rIdx) => (
                          <div key={rIdx} className="rounded-xl border border-ink/8 p-2.5 space-y-0.5">
                            <div className="flex justify-between font-bold text-ink">
                              <span>{r.criterion}</span>
                              <span className="text-accent">{r.weightPercent}%</span>
                            </div>
                            <p className="text-[11px] text-slate">{r.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Resume & Presentation Guidance */}
                  <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-3.5 text-amber-900 leading-relaxed">
                    <strong>Resume Presentation Guidance:</strong> {proj.portfolioPresentationGuidance}
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 md:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-ink/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-ink">Submit Deliverable</h3>
                <p className="text-xs text-slate truncate max-w-sm">{selectedProject.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="text-slate hover:text-ink cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {submitResult ? (
              <div className="space-y-4 py-2 text-center animate-fade-in">
                {submitResult.verified ? (
                  <div className="size-12 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 size={24} />
                  </div>
                ) : (
                  <div className="size-12 mx-auto rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
                    <AlertCircle size={24} />
                  </div>
                )}
                <h4 className="text-base font-bold text-ink">
                  {submitResult.verified ? "Project Artifact Verified! 🎉" : "Verification Incomplete"}
                </h4>
                <p className="text-xs text-slate max-w-md mx-auto leading-relaxed">{submitResult.feedback}</p>
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
                  <label className="font-bold text-ink">Public GitHub Repository URL *</label>
                  <input
                    type="url"
                    required
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username/project-repo"
                    className="w-full rounded-xl border border-ink/15 p-2.5 text-xs focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate">Must be an active, public GitHub repository.</span>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-ink">Live Demo / Deployment URL (Optional)</label>
                  <input
                    type="url"
                    value={liveDemoUrl}
                    onChange={(e) => setLiveDemoUrl(e.target.value)}
                    placeholder="https://my-app.vercel.app or API endpoint"
                    className="w-full rounded-xl border border-ink/15 p-2.5 text-xs focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-ink">Deliverable Summary & Architecture Notes *</label>
                  <textarea
                    rows={4}
                    required
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Explain your approach, testing choices, trade-offs made, and instructions to run your code..."
                    className="w-full rounded-xl border border-ink/15 p-2.5 text-xs focus:outline-hidden leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink/8">
                  <button
                    type="button"
                    onClick={() => setSelectedProject(null)}
                    className="px-4 py-2 rounded-xl text-slate hover:bg-app text-xs font-semibold"
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

