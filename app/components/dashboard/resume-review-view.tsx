"use client";

import { useState } from "react";
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  FolderPlus,
} from "lucide-react";
import type { ResumeAnalysisResult } from "@/lib/career/resume-engine";

interface ResumeReviewViewProps {
  role: string;
  onNavigateProjects?: () => void;
}

export function ResumeReviewView({ role, onNavigateProjects }: ResumeReviewViewProps) {
  const [resumeText, setResumeText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ResumeAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resumeText.trim().length < 20) {
      setErrorMsg("Please paste at least 20 characters of your resume content.");
      return;
    }

    setAnalyzing(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/career/resume/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          targetRole: role || "Software Developer",
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Failed to analyze resume.");
      }

      const json = await res.json();
      setResult(json.data);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during analysis.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSampleResume = () => {
    const sample = `EDUCATION:
Bachelor of Computer Applications (BCA) - 2026
Relevant Coursework: Data Structures, Database Management, Python Programming

SKILLS:
Languages: Python, JavaScript, SQL, HTML, CSS
Tools & Systems: Git, Linux, Docker, PostgreSQL, REST APIs

PROJECTS:
Student Management Microservice
- Built a REST API with Python and Flask for handling student grade records
- Designed relational schema using PostgreSQL with indexed query lookups
- Reduced API query latency by 35% through query optimization and connection pooling
- Containerized application with Docker and configured automated PyTest GitHub Actions suite

Network Vulnerability Scanner
- Scripted a Python network tool that scans open subnet ports and parses banner responses
- Parsed over 10,000 firewall log lines to detect unauthorized brute-force attempts`;
    setResumeText(sample);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-[28px] border border-ink/8 bg-white p-6 md:p-8 shadow-xs space-y-2">
        <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-accent font-bold flex items-center gap-2">
          <span className="size-2 rounded-full bg-accent" />
          AI Resume Review & Keyword Alignment
        </p>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-ink">
          Role-Specific Resume Alignment
        </h1>
        <p className="text-sm text-slate max-w-2xl">
          Evaluate how effectively your resume articulates skills, quantified outcomes, and verifiable projects for <strong className="text-ink">{role || "your target career"}</strong>.
        </p>
      </section>

      {/* Input Section */}
      <section className="rounded-3xl border border-ink/10 bg-white p-6 md:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-ink">Paste Resume Content</h2>
          <button
            type="button"
            onClick={handleSampleResume}
            className="text-xs text-accent font-semibold hover:underline cursor-pointer"
          >
            Load Sample Student Resume
          </button>
        </div>

        <form onSubmit={handleAnalyze} className="space-y-3">
          <textarea
            rows={8}
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume work experience, skills, and projects sections here..."
            className="w-full rounded-2xl border border-ink/15 p-4 text-xs font-mono text-ink leading-relaxed focus:border-accent focus:outline-hidden"
          />

          {errorMsg && (
            <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
              {errorMsg}
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
            <div className="text-[11px] text-slate flex items-center gap-1.5">
              <ShieldAlert size={14} className="text-amber-600 shrink-0" />
              <span>We never fabricate degrees or jobs. All recommendations are designed for your manual review.</span>
            </div>
            <button
              type="submit"
              disabled={analyzing}
              className="button-primary px-6 py-2.5 text-xs font-bold disabled:opacity-50 shrink-0 cursor-pointer"
            >
              {analyzing ? "Analyzing Keywords..." : "Run AI Resume Review"}
            </button>
          </div>
        </form>
      </section>

      {/* Analysis Results */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary Banner */}
          <section className="rounded-3xl border border-brand-forest/20 bg-gradient-to-br from-brand-forest/5 via-white to-transparent p-6 md:p-8 space-y-4 shadow-xs">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-brand-forest font-bold">
                  Target Role: {result.targetRole}
                </p>
                <h3 className="text-xl font-bold text-ink mt-1">Analysis Summary</h3>
                <p className="text-xs text-slate mt-1 max-w-2xl">{result.summaryFeedback}</p>
              </div>

              <div className="rounded-2xl bg-white border border-ink/10 p-4 text-center shrink-0 min-w-[120px]">
                <span className="text-[10px] uppercase font-bold text-slate block">Quantification</span>
                <strong className="text-2xl font-black text-brand-forest">{result.metricsScore}%</strong>
                <span className="text-[10px] text-slate block">Measurable impact</span>
              </div>
            </div>
          </section>

          {/* Keywords Found vs Missing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-3xl border border-ink/10 bg-white p-6 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-ink/8 pb-2">
                <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  Matched Required Skills ({result.matchedSkills.length})
                </h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.matchedSkills.map((s, idx) => (
                  <span key={idx} className="bg-emerald-50 text-emerald-900 text-xs font-semibold px-2.5 py-1 rounded-md">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-ink/10 bg-white p-6 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-ink/8 pb-2">
                <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertCircle size={14} className="text-amber-600" />
                  Missing Target Skills ({result.missingSkills.length})
                </h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.missingSkills.length > 0 ? (
                  result.missingSkills.map((s, idx) => (
                    <span key={idx} className="bg-amber-50 text-amber-900 text-xs font-semibold px-2.5 py-1 rounded-md">
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-emerald-700 font-bold">Zero missing technical keywords!</span>
                )}
              </div>
            </div>
          </div>

          {/* Bullet Point Optimization Review */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-3xl border border-ink/10 bg-white p-6 space-y-3 shadow-xs">
              <h4 className="text-xs font-bold text-ink">Strong Quantified Bullets</h4>
              <ul className="space-y-2 text-xs text-slate">
                {result.strongBulletPoints.length > 0 ? (
                  result.strongBulletPoints.map((bp, idx) => (
                    <li key={idx} className="rounded-xl bg-app/50 p-2.5 border border-ink/8 text-ink/85">
                      ✓ {bp}
                    </li>
                  ))
                ) : (
                  <li className="italic text-slate">Add numbers to your statements to make them measurable.</li>
                )}
              </ul>
            </div>

            <div className="rounded-3xl border border-ink/10 bg-white p-6 space-y-3 shadow-xs">
              <h4 className="text-xs font-bold text-ink">Bullets Needing Measurable Metrics</h4>
              <div className="space-y-2.5">
                {result.weakBulletPoints.map((item, idx) => (
                  <div key={idx} className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 text-xs space-y-1">
                    <p className="text-slate italic font-mono text-[11px]">"{item.bullet}"</p>
                    <p className="text-amber-900 font-medium">{item.suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Verbs & Project Additions */}
          <section className="rounded-3xl border border-ink/10 bg-white p-6 space-y-3 shadow-xs">
            <h4 className="text-xs font-bold text-ink">Recommended Action Verbs & Project Additions</h4>
            <div className="flex flex-wrap gap-2 pt-1">
              {result.suggestedActionVerbs.map((v, idx) => (
                <span key={idx} className="rounded-lg bg-violet-50 text-accent font-mono text-xs px-2.5 py-1 font-bold">
                  {v}
                </span>
              ))}
            </div>
            <ul className="space-y-1.5 pt-2 text-xs text-slate list-disc pl-4">
              {result.recommendedProjectAdditions.map((p, idx) => (
                <li key={idx}>{p}</li>
              ))}
            </ul>

            {onNavigateProjects && (
              <div className="pt-3">
                <button
                  type="button"
                  onClick={onNavigateProjects}
                  className="button-primary px-4 py-2 text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <FolderPlus size={14} /> View Guided Applied Projects
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

