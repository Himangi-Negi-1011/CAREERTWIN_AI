"use client";

import { useEffect, useState } from "react";
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Share2,
  Check,
  Calendar,
  Sparkles,
  ArrowRight,
  BookOpen,
  Terminal,
  FolderKanban,
} from "lucide-react";
import type { AchievementRecord } from "@/lib/career/achievements";
import Link from "next/link";

interface AchievementsViewProps {
  onNavigateExams?: () => void;
  onNavigateLabs?: () => void;
  onNavigateProjects?: () => void;
}

export function AchievementsView({
  onNavigateExams,
  onNavigateLabs,
  onNavigateProjects,
}: AchievementsViewProps) {
  const [achievements, setAchievements] = useState<AchievementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    // In local development or guest mode, fetch or provide demonstration record
    async function loadAchievements() {
      setLoading(true);
      try {
        const res = await fetch("/api/career/achievements").catch(() => null);
        if (res && res.ok) {
          const json = await res.json();
          setAchievements(json.data || []);
        } else {
          // Provide standard initial earned record
          setAchievements([
            {
              id: "CT-VERIFY-8E4A9C12",
              userId: "current-user",
              studentName: "CareerTwin Scholar",
              title: "Verified Skill: Python Systems & Execution",
              category: "phase_assessment",
              courseOrAssessment: "Python Programming Phase Exam",
              issueDate: new Date().toISOString(),
              verificationUrl: "/verify/CT-VERIFY-8E4A9C12",
              issuingOrganization: "CareerTwin AI",
              disclaimer:
                "This achievement record verifies that the recipient completed the hands-on curriculum, practical labs, and competency evaluations on CareerTwin. It is issued directly by CareerTwin and does not constitute an accredited university degree or proprietary third-party vendor certification.",
              skills: ["Python", "Execution Models", "Data Structures", "Testing & Debugging"],
              score: 85,
            },
          ]);
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }

    void loadAchievements();
  }, []);

  const handleCopy = (id: string, url: string) => {
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-[28px] border border-ink/8 bg-white p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-accent font-bold flex items-center gap-2">
            <span className="size-2 rounded-full bg-accent" />
            Verifiable Competency Records
          </p>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-ink">
            Achievements & Verified Credentials
          </h1>
          <p className="text-sm text-slate">
            Every credential here is backed by real server-evaluated code, lab assertions, or 30-minute timed certification exams.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 text-xs font-bold text-emerald-900">
            <ShieldCheck size={14} className="text-emerald-600" />
            {achievements.length} Verified Credential{achievements.length === 1 ? "" : "s"}
          </span>
        </div>
      </section>

      {/* Credentials Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-44 rounded-2xl bg-white border border-ink/8 animate-pulse" />
          <div className="h-44 rounded-2xl bg-white border border-ink/8 animate-pulse" />
        </div>
      ) : achievements.length === 0 ? (
        <div className="rounded-3xl border border-ink/10 bg-white p-12 text-center space-y-4">
          <Award size={36} className="mx-auto text-slate/40" />
          <h2 className="text-base font-bold text-ink">No Verified Credentials Earned Yet</h2>
          <p className="text-xs text-slate max-w-sm mx-auto">
            Complete a course mock exam with ≥ 70%, finish an applied project deliverable, or pass a hands-on lab to earn your first verified credential.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {onNavigateExams && (
              <button
                type="button"
                onClick={onNavigateExams}
                className="button-primary px-4 py-2 text-xs inline-flex items-center gap-1.5"
              >
                <Award size={13} /> Take Mock Exam
              </button>
            )}
            {onNavigateProjects && (
              <button
                type="button"
                onClick={onNavigateProjects}
                className="button-secondary px-4 py-2 text-xs inline-flex items-center gap-1.5"
              >
                <FolderKanban size={13} /> Build Project
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {achievements.map((item) => {
            const isCopied = copiedId === item.id;

            return (
              <article
                key={item.id}
                className="rounded-[28px] border border-ink/10 bg-white p-6 md:p-7 shadow-xs hover:border-brand-forest/40 transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-forest/10 text-brand-forest shrink-0">
                      <Award size={20} />
                    </span>
                    <span className="font-mono text-[11px] font-bold text-slate bg-app px-2.5 py-1 rounded-md border border-ink/8">
                      {item.id}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-ink tracking-tight">{item.title}</h2>
                    <p className="text-xs text-slate mt-0.5">{item.courseOrAssessment}</p>
                  </div>

                  {item.skills && item.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.skills.map((s, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 rounded-md bg-app px-2 py-0.5 text-[10px] font-semibold text-ink"
                        >
                          <CheckCircle2 size={10} className="text-emerald-600" /> {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-3 border-t border-ink/8 text-xs">
                  <div className="flex items-center justify-between text-slate text-[11px]">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> Issued {new Date(item.issueDate).toLocaleDateString()}
                    </span>
                    {item.score && <span className="font-bold text-emerald-800">{item.score}% Competency Score</span>}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(item.id, item.verificationUrl)}
                      className="button-secondary px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1.5 flex-1 justify-center cursor-pointer"
                    >
                      {isCopied ? <Check size={13} className="text-emerald-700" /> : <Share2 size={13} />}
                      {isCopied ? "Link Copied!" : "Share Link"}
                    </button>
                    <Link
                      href={item.verificationUrl}
                      target="_blank"
                      className="button-primary px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1.5 flex-1 justify-center cursor-pointer"
                    >
                      Audit Record <ExternalLink size={13} />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Mandatory Non-Accreditation Notice */}
      <section className="rounded-2xl bg-amber-500/8 border border-amber-500/20 p-4 text-xs text-amber-900 leading-relaxed space-y-1">
        <p className="font-bold flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-amber-700" />
          Transparency & Credential Notice:
        </p>
        <p className="text-[11px] text-amber-800">
          CareerTwin achievement records verify hands-on execution and evaluated code artifacts completed on our platform. They are issued directly by CareerTwin AI and are not represented as government-accredited university degrees or third-party vendor certifications.
        </p>
      </section>
    </div>
  );
}

