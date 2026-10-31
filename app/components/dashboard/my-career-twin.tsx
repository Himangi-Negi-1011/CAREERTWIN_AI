"use client";

import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Download,
  GraduationCap,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { TwinOutput, TwinSourceState } from "@/lib/twin/schema";
import type { TwinSyncState } from "@/lib/twin/client";

interface MyCareerTwinProps {
  role: string;
  displayName?: string;
  ownerKey: string;
  twin: TwinOutput | null;
  twinSource: TwinSourceState | null;
  syncState: TwinSyncState | null;
  onRefreshTwin: () => Promise<void>;
  onOpenLearning: (skill: string) => void;
  onOpenSkills: () => void;
  onOpenRoadmap: () => void;
}

export function MyCareerTwin({
  role,
  displayName,
  ownerKey,
  twin,
  twinSource,
  syncState,
  onRefreshTwin,
  onOpenLearning,
  onOpenSkills,
  onOpenRoadmap,
}: MyCareerTwinProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function handleRefresh() {
    setRefreshing(true);
    setFeedback("");
    try {
      await onRefreshTwin();
      setFeedback("Career Twin updated and verified from current database evidence.");
    } catch {
      setFeedback("Failed to refresh Career Twin. Drafts remain available locally.");
    } finally {
      setRefreshing(false);
    }
  }

  function exportTwinJson() {
    const payload = {
      ownerKey,
      role,
      displayName: displayName || "CareerTwin Learner",
      exportedAt: new Date().toISOString(),
      twin,
      twinSource,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `careertwin-${(role || "profile").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  // Derive evidence records for the current role
  const roleEvidence = twinSource?.evidence?.[role]?.records ?? {};
  const demonstratedSkills = Object.entries(roleEvidence).filter(
    ([, rec]) => rec.status === "demonstrated"
  );
  const learningSkills = Object.entries(roleEvidence).filter(
    ([, rec]) => rec.status === "learning"
  );

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-[28px] border border-ink/8 bg-gradient-to-br from-[#1a1235] via-[#2a1b4e] to-[#401f68] p-7 text-white shadow-lg md:p-9">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-[10px] uppercase tracking-[.2em] text-mint flex items-center gap-2">
              <span className="size-2 rounded-full bg-mint animate-pulse" />
              Verified AI Twin Persona
            </p>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 border border-white/15">
                <ShieldCheck size={13} className="text-mint" />
                {syncState?.status === "saved" ? "Database Synced" : "Local Verified Draft"}
              </span>
            </div>
          </div>

          <h2 className="mt-4 text-2xl md:text-4xl font-extrabold tracking-tight">
            {displayName ? `${displayName}'s Career Twin` : "Your AI Career Twin"}
          </h2>
          <p className="mt-2 text-base font-semibold text-white/80">
            Target Domain: <span className="text-mint font-bold">{role || "Role not selected yet"}</span>
          </p>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
            Your Career Twin is your continuous, verifiable representation. It reflects your demonstrated skills,
            identifies prioritized gaps for your target role, adapts your personalized curriculum, and never invents
            unverified claims.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-[#1a1235] transition hover:bg-white/90 disabled:opacity-50 cursor-pointer shadow-sm"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Re-evaluating Twin…" : "Refresh Twin Calculation"}
            </button>
            <button
              type="button"
              onClick={exportTwinJson}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/20 cursor-pointer"
            >
              <Download size={14} />
              Export Twin Snapshot
            </button>
            {role ? (
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-mint hover:underline ml-2"
              >
                Change Career Target <ArrowRight size={13} />
              </Link>
            ) : null}
          </div>

          {feedback && (
            <p className="mt-4 rounded-xl bg-white/10 p-3 text-xs font-semibold text-mint border border-white/15">
              {feedback}
            </p>
          )}
        </div>
      </section>

      {/* Primary Metrics Grid */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-2xl border border-ink/8 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate">Evidence Coverage</span>
            <span className="grid size-8 place-items-center rounded-xl bg-violet-100 text-accent">
              <Sparkles size={16} />
            </span>
          </div>
          <strong className="mt-3 block text-3xl font-extrabold text-ink">
            {twin?.evidenceCoverage.score !== null && twin?.evidenceCoverage.score !== undefined
              ? `${twin.evidenceCoverage.score}%`
              : "0%"}
          </strong>
          <p className="mt-2 text-xs leading-5 text-slate">
            {twin?.evidenceCoverage.meaning || "Percentage of target role skills supported by verified evidence."}
          </p>
        </article>

        <article className="rounded-2xl border border-ink/8 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate">Demonstrated Skills</span>
            <span className="grid size-8 place-items-center rounded-xl bg-emerald-100 text-emerald-800">
              <CheckCircle2 size={16} />
            </span>
          </div>
          <strong className="mt-3 block text-3xl font-extrabold text-ink">
            {demonstratedSkills.length}
          </strong>
          <p className="mt-2 text-xs leading-5 text-slate">
            Skills with concrete evidence notes, projects, or verified test scores.
          </p>
        </article>

        <article className="rounded-2xl border border-ink/8 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate">Learning In-Progress</span>
            <span className="grid size-8 place-items-center rounded-xl bg-amber-100 text-amber-800">
              <BookOpen size={16} />
            </span>
          </div>
          <strong className="mt-3 block text-3xl font-extrabold text-ink">
            {learningSkills.length}
          </strong>
          <p className="mt-2 text-xs leading-5 text-slate">
            Skill tracks currently being actively studied in the Learning Studio.
          </p>
        </article>

        <article className="rounded-2xl border border-ink/8 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate">Prioritized Gaps</span>
            <span className="grid size-8 place-items-center rounded-xl bg-blue-100 text-blue-800">
              <GraduationCap size={16} />
            </span>
          </div>
          <strong className="mt-3 block text-3xl font-extrabold text-ink">
            {twin?.prioritizedGaps?.length ?? 0}
          </strong>
          <p className="mt-2 text-xs leading-5 text-slate">
            Key areas required for {role || "target role"} awaiting mastery evidence.
          </p>
        </article>
      </section>

      {/* Twin Next Action Card */}
      {twin?.recommendedNextAction && (
        <section className="rounded-2xl border border-violet-200 bg-violet-50/70 p-6 shadow-xs">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                <BrainCircuit size={15} /> Twin Recommended Priority Action
              </p>
              <h3 className="mt-2 text-xl font-bold text-ink">{twin.recommendedNextAction.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate">{twin.recommendedNextAction.detail}</p>
            </div>
            <button
              type="button"
              onClick={() => onOpenRoadmap()}
              className="button-primary px-5 py-2.5 shrink-0"
            >
              Take this action <ArrowRight size={14} />
            </button>
          </div>
        </section>
      )}

      {/* Two Column Layout: Prioritized Gaps & Verified Skills */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Prioritized Gaps */}
        <article className="rounded-2xl border border-ink/8 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <p className="label">Target Role Gaps</p>
                <h3 className="mt-1 text-lg font-bold">Identified Skill Gaps for {role || "Target"}</h3>
              </div>
              <button
                type="button"
                onClick={onOpenSkills}
                className="text-xs font-bold text-accent hover:underline cursor-pointer"
              >
                Full Skill Analysis →
              </button>
            </div>

            {twin?.prioritizedGaps && twin.prioritizedGaps.length > 0 ? (
              <ul className="mt-5 divide-y divide-ink/8">
                {twin.prioritizedGaps.map((gap, idx) => (
                  <li key={gap.skill} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="grid size-5 place-items-center rounded-full bg-violet-100 text-accent text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-ink">{gap.skill}</h4>
                      </div>
                      <p className="mt-1 text-xs text-slate ml-7">{gap.reason}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenLearning(gap.skill)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-accent/20 bg-accent/5 px-3 py-1.5 text-xs font-bold text-accent hover:bg-accent/10 transition cursor-pointer self-start sm:self-center ml-7 sm:ml-0"
                    >
                      <BookOpen size={12} /> Study Course
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-6 rounded-xl border border-dashed border-ink/15 p-6 text-center">
                <CheckCircle2 size={24} className="mx-auto text-emerald-600 mb-2" />
                <p className="text-sm font-bold text-ink">No unresolved critical gaps recorded!</p>
                <p className="mt-1 text-xs text-slate">
                  Review the full skill framework to add advanced skills or take a mock assessment.
                </p>
              </div>
            )}
          </div>
        </article>

        {/* Verified Skills & Evidence */}
        <article className="rounded-2xl border border-ink/8 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <p className="label">Portfolio Evidence</p>
                <h3 className="mt-1 text-lg font-bold">Verified Skills & Knowledge</h3>
              </div>
              <button
                type="button"
                onClick={onOpenSkills}
                className="text-xs font-bold text-accent hover:underline cursor-pointer"
              >
                Record Evidence →
              </button>
            </div>

            {demonstratedSkills.length > 0 ? (
              <ul className="mt-5 divide-y divide-ink/8">
                {demonstratedSkills.map(([skillName, rec]) => (
                  <li key={skillName} className="py-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                        <h4 className="text-sm font-bold text-ink">{skillName}</h4>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                        Demonstrated
                      </span>
                    </div>
                    {rec.evidence ? (
                      <p className="mt-2 text-xs leading-5 text-slate bg-app/60 p-2.5 rounded-lg border border-ink/5">
                        {rec.evidence}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-slate">Evidence note recorded in workspace.</p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-6 rounded-xl border border-dashed border-ink/15 p-6 text-center">
                <Sparkles size={24} className="mx-auto text-accent mb-2" />
                <p className="text-sm font-bold text-ink">No skills marked "Can demonstrate" yet</p>
                <p className="mt-1 text-xs text-slate">
                  Review skills in Skill Gap Analysis and attach a project or exercise example.
                </p>
                <button
                  type="button"
                  onClick={onOpenSkills}
                  className="button-secondary mt-4 text-xs"
                >
                  Review My Skills
                </button>
              </div>
            )}
          </div>
        </article>
      </section>

      {/* Twin Integrity Notice */}
      <section className="rounded-2xl border border-ink/8 bg-white p-6 shadow-xs flex items-start gap-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-mint/35 text-ink">
          <ShieldCheck size={20} />
        </span>
        <div>
          <h4 className="text-sm font-bold text-ink">Strict Evidence-Grounded Twin Architecture</h4>
          <p className="mt-1 text-xs leading-5 text-slate">
            CareerTwin uses a deterministic, verifiable algorithm to construct your Career Twin state. It strictly
            operates on evidence you record, lessons you complete, and assessments you pass. It never invents fake
            scores, ratings, or misleading credentials.
          </p>
        </div>
      </section>
    </div>
  );
}

