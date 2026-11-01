"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FolderKanban,
  FileText,
  MessageSquareText,
  ArrowRight,
  Sparkles,
  Award,
  BookOpen,
  Terminal,
  Compass,
  RefreshCw,
} from "lucide-react";
import type { CareerReadinessReport } from "@/lib/career/readiness-engine";
import type { TwinOutput, TwinSourceState } from "@/lib/twin/schema";
import type { CareerProfileData } from "@/lib/profile/schema";

interface CareerReadinessViewProps {
  role: string;
  twin: TwinOutput | null;
  source: TwinSourceState | null;
  profile?: Partial<CareerProfileData> | null;
  onNavigateView: (view: any) => void;
  onOpenLearning?: (skill: string) => void;
}

export function CareerReadinessView({
  role,
  twin,
  source,
  profile,
  onNavigateView,
  onOpenLearning,
}: CareerReadinessViewProps) {
  const [report, setReport] = useState<CareerReadinessReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      setLoading(true);
      try {
        const res = await fetch("/api/career/readiness", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetRole: role,
            twin,
            source,
            profile,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          setReport(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch readiness report:", err);
      } finally {
        setLoading(false);
      }
    }

    void loadReport();
  }, [role, twin, source, profile]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-44 rounded-3xl bg-white border border-ink/8 p-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-64 rounded-3xl bg-white border border-ink/8" />
          <div className="h-64 rounded-3xl bg-white border border-ink/8" />
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="rounded-3xl border border-ink/10 bg-white p-8 text-center space-y-3">
        <p className="text-sm text-slate">Unable to load career readiness telemetry.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="button-primary px-4 py-2 text-xs"
        >
          Refresh Data
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Overview Banner: Evidence-Grounded Readiness */}
      <section className="relative overflow-hidden rounded-[28px] border border-brand-forest/20 bg-gradient-to-br from-brand-forest/10 via-white to-mint/15 p-6 md:p-8 shadow-sm">
        <div className="max-w-3xl space-y-3">
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-brand-forest font-bold flex items-center gap-2">
            <span className="size-2 rounded-full bg-brand-forest animate-pulse" />
            Evidence-Based Career Readiness
          </p>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-ink">
            {report.targetRole} Readiness Analysis
          </h1>
          <p className="text-sm text-ink/75 leading-relaxed">
            {report.summary.readinessStatement}
          </p>

          <div className="pt-2 flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 border border-emerald-300 px-3 py-1 font-bold text-emerald-900">
              <CheckCircle2 size={13} className="text-emerald-700" />
              {report.summary.assessedVerifiedCount} Assessment-Verified Skills
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100/80 border border-violet-300 px-3 py-1 font-bold text-accent">
              <FolderKanban size={13} />
              {report.summary.projectVerifiedCount} Completed Projects
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/80 border border-amber-300 px-3 py-1 font-bold text-amber-900">
              <AlertCircle size={13} />
              {report.summary.skillsNeedingWorkCount} Priority Gaps
            </span>
          </div>
        </div>
      </section>

      {/* Grid: Demonstrated Capabilities vs Priority Needs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demonstrated Capabilities (Real Proof) */}
        <section className="rounded-3xl border border-ink/10 bg-white p-6 md:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-ink/8 pb-3">
            <div>
              <h2 className="text-base font-bold text-ink">Demonstrated Capabilities</h2>
              <p className="text-xs text-slate">Verified by test scores, projects, or labs.</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              {report.demonstratedCapabilities.length} Found
            </span>
          </div>

          {report.demonstratedCapabilities.length === 0 ? (
            <p className="text-xs text-slate py-4 italic">
              No formal evidence recorded yet. Take an assessment or complete a hands-on lab to verify your first skill.
            </p>
          ) : (
            <div className="space-y-3">
              {report.demonstratedCapabilities.map((cap, idx) => (
                <div key={idx} className="rounded-xl border border-ink/8 bg-app/50 p-3.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-xs font-bold text-ink">{cap.capability}</strong>
                    <span className="text-[10px] uppercase font-bold text-accent bg-violet-50 px-2 py-0.5 rounded-md">
                      {cap.evidenceType}
                    </span>
                  </div>
                  <p className="text-xs text-slate">{cap.details}</p>
                </div>
              ))}
            </div>
          )}

          {/* Self-reported skills disclaimer */}
          {report.selfReportedSkills.length > 0 && (
            <div className="pt-2 border-t border-ink/8">
              <p className="text-[11px] font-bold text-ink mb-1.5">Self-Reported (Pending Assessment Verification):</p>
              <div className="flex flex-wrap gap-1.5">
                {report.selfReportedSkills.map((s, idx) => (
                  <span key={idx} className="text-xs rounded-md bg-white border border-ink/10 px-2 py-1 text-slate">
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Skills Needing Development */}
        <section className="rounded-3xl border border-ink/10 bg-white p-6 md:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-ink/8 pb-3">
            <div>
              <h2 className="text-base font-bold text-ink">Skills Needing Development</h2>
              <p className="text-xs text-slate">Prioritized technical gaps for {report.targetRole}.</p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
              {report.skillsNeedingDevelopment.length} Gaps
            </span>
          </div>

          <div className="space-y-3">
            {report.skillsNeedingDevelopment.map((gap, idx) => (
              <div key={idx} className="rounded-xl border border-ink/8 p-3.5 space-y-2 hover:border-accent/30 transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <strong className="text-xs font-bold text-ink">{gap.name}</strong>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        gap.priority === "high"
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-800"
                      }`}
                    >
                      {gap.priority} priority
                    </span>
                  </div>
                  {onOpenLearning && (
                    <button
                      type="button"
                      onClick={() => onOpenLearning(gap.name)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-accent hover:underline cursor-pointer"
                    >
                      Study <ArrowRight size={11} />
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate">{gap.reason}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Suggested Milestones & Next Actions */}
      <section className="rounded-3xl border border-ink/10 bg-white p-6 md:p-8 space-y-5 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-ink">Suggested Career Launch Milestones</h2>
          <p className="text-xs text-slate">Ordered sequence from skill acquisition to external opportunity application.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {report.suggestedMilestones.map((m) => (
            <div
              key={m.step}
              className="rounded-2xl border border-ink/8 bg-app/30 p-4 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <span className="size-6 rounded-full bg-accent text-white font-mono text-xs font-bold flex items-center justify-center">
                  {m.step}
                </span>
                <p className="text-xs font-bold text-ink leading-snug">{m.title}</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateView(m.destination)}
                className="w-full button-secondary py-1.5 text-[11px] font-bold text-center"
              >
                {m.action}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Resume & Interview Preparation Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="rounded-3xl border border-ink/10 bg-white p-6 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-ink font-bold text-sm">
            <FileText size={16} className="text-accent" />
            <h3>Resume Enhancements</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate list-disc pl-4 leading-relaxed">
            {report.resumeImprovements.map((imp, idx) => (
              <li key={idx}>{imp}</li>
            ))}
          </ul>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onNavigateView("resume")}
              className="button-secondary px-3 py-1.5 text-xs inline-flex items-center gap-1.5"
            >
              Analyze Resume in Detail <ArrowRight size={12} />
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-ink/10 bg-white p-6 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-ink font-bold text-sm">
            <MessageSquareText size={16} className="text-brand-forest" />
            <h3>Interview Preparation Focus</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate list-disc pl-4 leading-relaxed">
            {report.interviewPrepRequirements.map((req, idx) => (
              <li key={idx}>{req}</li>
            ))}
          </ul>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onNavigateView("interviews")}
              className="button-secondary px-3 py-1.5 text-xs inline-flex items-center gap-1.5"
            >
              Start Practice Session <ArrowRight size={12} />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
