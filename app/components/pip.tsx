"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BrainCircuit, MessageCircle, Minimize2, ShieldCheck, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { TwinOutput, TwinSourceState } from "@/lib/twin/schema";

const ROLE_KEY = "careertwin-role-draft";
const EVIDENCE_KEY = "careertwin-skill-evidence-v1";

type EvidenceRecord = { status?: "not-reviewed" | "learning" | "demonstrated"; evidence?: string };
type GuideContext = { role: string; reviewed: number; demonstrated: number; evidenceNotes: number };

type PipProps = {
  variant?: "floating" | "hero";
  storageNamespace?: string;
  twin?: TwinOutput | null;
  twinSource?: TwinSourceState | null;
};

function summarizeEvidence(role: string, allEvidence: Record<string, { records?: Record<string, EvidenceRecord> }>): GuideContext {
  const records = Object.values(allEvidence[role]?.records ?? {});
  return {
    role,
    reviewed: records.filter((record) => record.status && record.status !== "not-reviewed").length,
    demonstrated: records.filter((record) => record.status === "demonstrated").length,
    evidenceNotes: records.filter((record) => record.evidence?.trim()).length,
  };
}

function readContext(storageNamespace?: string, twin?: TwinOutput | null, twinSource?: TwinSourceState | null): GuideContext {
  if (twin && twinSource) return summarizeEvidence(twin.targetRole, twinSource.evidence);
  try {
    const roleKey = storageNamespace ? `${ROLE_KEY}:${storageNamespace}` : ROLE_KEY;
    const evidenceKey = storageNamespace ? `${EVIDENCE_KEY}:${storageNamespace}` : EVIDENCE_KEY;
    const role = window.localStorage.getItem(roleKey)?.trim() ?? "";
    const allEvidence = JSON.parse(window.localStorage.getItem(evidenceKey) ?? "{}") as Record<string, { records?: Record<string, EvidenceRecord> }>;
    return summarizeEvidence(role, allEvidence);
  } catch {
    return { role: "", reviewed: 0, demonstrated: 0, evidenceNotes: 0 };
  }
}

function PipRobot({ large, reduceMotion }: { large: boolean; reduceMotion: boolean | null }) {
  return (
    <motion.div animate={reduceMotion ? undefined : { y: [0, -4, 0], rotate: [0, 1, 0, -1, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }} className="relative" aria-hidden="true">
      <div className="absolute -inset-3 rounded-full bg-mint/25 blur-xl" />
      <svg viewBox="0 0 112 114" className={large ? "w-[110px]" : "w-[70px]"} fill="none">
        <path d="M48 18c1-8 15-8 16 0" stroke="#183034" strokeWidth="4" strokeLinecap="round"/><circle cx="56" cy="12" r="5" fill="#176c68"/>
        <path d="M23 47c0-18 12-27 33-27s33 9 33 27v29c0 19-14 29-33 29S23 95 23 76V47Z" fill="#fffdf8" stroke="#183034" strokeWidth="4"/>
        <path d="M32 54c0-11 8-18 24-18s24 7 24 18v12c0 11-9 18-24 18s-24-7-24-18V54Z" fill="#183034"/>
        <ellipse cx="46" cy="59" rx="4" ry="6" fill="#b9dfd4"/><ellipse cx="66" cy="59" rx="4" ry="6" fill="#b9dfd4"/>
        <path d="M49 71c4 3 10 3 14 0" stroke="#b9dfd4" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M26 79c-8 1-11 6-10 14M86 79c8 1 11 6 10 14M40 102v7M72 102v7" stroke="#183034" strokeWidth="4" strokeLinecap="round"/>
        <path d="M87 35c6 2 9 6 10 12" stroke="#176c68" strokeWidth="3" strokeLinecap="round" opacity=".55"/>
      </svg>
    </motion.div>
  );
}

function guidanceFor(context: GuideContext, twin?: TwinOutput | null) {
  if (twin) return {
    eyebrow: `Next for ${twin.targetRole}`,
    message: twin.recommendedNextAction.detail,
    action: twin.recommendedNextAction.title,
    href: twin.recommendedNextAction.destination,
  };
  if (!context.role) return {
    eyebrow: "Start with direction",
    message: "Choose one target role. I’ll use it to focus your skill review without claiming it is the only path available.",
    action: "Choose a target role",
    href: "/onboarding",
  };
  if (context.reviewed === 0) return {
    eyebrow: `Next for ${context.role}`,
    message: "Review one skill area and describe it honestly. A single concrete example is more useful than an inflated score.",
    action: "Review my skills",
    href: "/dashboard?view=skills",
  };
  if (context.evidenceNotes === 0) return {
    eyebrow: `${context.reviewed} skill areas reviewed`,
    message: "Add a project, task, or outcome to one reviewed skill. Pip only treats recorded examples as evidence.",
    action: "Add evidence",
    href: "/dashboard?view=skills",
  };
  return {
    eyebrow: `${context.evidenceNotes} evidence note${context.evidenceNotes === 1 ? "" : "s"} recorded`,
    message: `Keep building your ${context.role} profile by reviewing the next unconfirmed area or strengthening an existing example with an outcome.`,
    action: "Continue evidence review",
    href: "/dashboard?view=skills",
  };
}

export function Pip({ variant = "floating", storageNamespace, twin, twinSource }: PipProps) {
  const [open, setOpen] = useState(false);
  const [context, setContext] = useState<GuideContext>({ role: "", reviewed: 0, demonstrated: 0, evidenceNotes: 0 });
  const [answer, setAnswer] = useState("");
  const reduce = useReducedMotion();

  useEffect(() => {
    const refresh = () => setContext(readContext(storageNamespace, twin, twinSource));
    const task = window.setTimeout(refresh, 0);
    window.addEventListener("storage", refresh);
    window.addEventListener("careertwin:evidence-saved", refresh);
    return () => { window.clearTimeout(task); window.removeEventListener("storage", refresh); window.removeEventListener("careertwin:evidence-saved", refresh); };
  }, [storageNamespace, twin, twinSource]);

  const guide = useMemo(() => guidanceFor(context, twin), [context, twin]);

  if (variant === "hero") return <PipRobot large reduceMotion={reduce}/>;

  if (!open) return (
    <button onClick={() => setOpen(true)} className="group fixed bottom-5 right-5 z-40 flex items-center gap-2.5 rounded-full border border-white/15 bg-ink py-2 pl-2 pr-4 text-white shadow-[0_18px_45px_rgba(24,48,52,.24)] transition hover:-translate-y-1 hover:bg-[#23474a]" aria-label="Open Pip, your career guide">
      <span className="grid size-10 place-items-center rounded-full bg-white/10"><MessageCircle size={18}/></span>
      <span className="text-left"><strong className="block text-xs">Ask Pip</strong><span className="block text-[9px] text-white/55">Career guide</span></span>
      <span className="absolute right-1 top-0 size-3 rounded-full border-2 border-cream bg-mint" />
    </button>
  );

  const prompts = [
    ["What should I do next?", guide.message],
    ["What counts as evidence?", "Use a specific project, task, outcome, course exercise, or explanation you can show and discuss. Avoid sensitive employer information."],
    ["Is this an AI score?", twin
      ? "No. Pip is reading your deterministic Career Twin, calculated from your saved profile, evidence, roadmap, weekly work, and assessments. Generative AI advice is not enabled, and no readiness score is being invented."
      : "No. Pip is using only the role and evidence counts saved on this device. Generative AI advice is not enabled, and no readiness score is being invented."],
  ] as const;

  return (
    <aside className="fixed bottom-4 right-4 z-40 w-[min(390px,calc(100vw-24px))] overflow-hidden rounded-[26px] border border-ink/10 bg-white shadow-[0_28px_90px_rgba(24,38,42,.22)]" aria-label="Pip career guide">
      <div className="relative overflow-hidden bg-[linear-gradient(135deg,#183034,#1d4546)] px-5 pb-5 pt-4 text-white">
        <div className="absolute -right-12 -top-16 size-40 rounded-full border-[25px] border-white/[.045]" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-xl bg-mint/15 text-mint"><Sparkles size={15}/></span><div><strong className="block text-sm">Pip</strong><span className="block text-[9px] uppercase tracking-[.14em] text-white/50">Evidence-aware career guide</span></div></div>
          <div className="flex gap-1"><button className="grid size-8 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white" onClick={() => setOpen(false)} aria-label="Minimize Pip"><Minimize2 size={15}/></button><button className="grid size-8 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white" onClick={() => { setOpen(false); setAnswer(""); }} aria-label="Close Pip"><X size={15}/></button></div>
        </div>
        <div className="relative mt-5 flex items-end gap-3"><PipRobot large={false} reduceMotion={reduce}/><div className="min-w-0 flex-1 pb-1"><p className="font-mono text-[9px] uppercase tracking-[.16em] text-mint">{guide.eyebrow}</p><p className="mt-2 text-sm leading-5 text-white/75">{guide.message}</p></div></div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-cream/65 p-2.5 text-center"><strong className="block text-sm">{context.role ? "1" : "0"}</strong><span className="text-[9px] text-slate">Target</span></div>
          <div className="rounded-xl bg-cream/65 p-2.5 text-center"><strong className="block text-sm">{context.reviewed}</strong><span className="text-[9px] text-slate">Reviewed</span></div>
          <div className="rounded-xl bg-cream/65 p-2.5 text-center"><strong className="block text-sm">{context.evidenceNotes}</strong><span className="text-[9px] text-slate">Evidence</span></div>
        </div>

        <p className="mt-4 text-[10px] font-bold uppercase tracking-[.14em] text-slate">Ask about your plan</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {prompts.map(([label, response]) => <button key={label} type="button" onClick={() => setAnswer(response)} className="rounded-full border border-ink/9 bg-white px-3 py-2 text-[11px] font-semibold transition hover:border-accent/30 hover:bg-mint/15">{label}</button>)}
        </div>

        {answer && <div className="mt-3 rounded-2xl border border-accent/12 bg-mint/15 p-3 text-xs leading-5 text-slate" aria-live="polite"><div className="mb-1.5 flex items-center gap-1.5 font-bold text-ink"><BrainCircuit size={13}/>Pip’s answer</div>{answer}</div>}

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-ink/8 pt-4">
          <span className="flex items-center gap-1.5 text-[10px] text-slate"><ShieldCheck size={12}/>{twin && twinSource ? "Uses your secure Career Twin" : "Uses local saved context"}</span>
          <Link href={guide.href} className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline">{guide.action}<ArrowRight size={13}/></Link>
        </div>
      </div>
    </aside>
  );
}
