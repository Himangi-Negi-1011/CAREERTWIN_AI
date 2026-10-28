"use client";

import { BookOpenCheck, Check, CircleDashed, Download, Plus, Save, Sparkles } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { persistTwinPatch } from "@/lib/twin/client";

type EvidenceStatus = "not-reviewed" | "learning" | "demonstrated";
type SkillRecord = { status: EvidenceStatus; evidence: string };
type StoredEvidence = Record<string, { records: Record<string, SkillRecord>; customSkills: string[] }>;

const STORAGE_KEY = "careertwin-skill-evidence-v1";

const roleSkills: Record<string, string[]> = {
  "Software Engineer": ["Programming fundamentals", "Data structures", "Testing", "Version control", "System design", "Technical communication"],
  "Frontend Developer": ["Semantic HTML", "Responsive CSS", "JavaScript and TypeScript", "React patterns", "Accessibility", "Frontend testing"],
  "Backend Developer": ["API design", "Data modelling", "Authentication and authorization", "Testing", "Performance", "Observability"],
  "Data Analyst": ["Spreadsheet analysis", "SQL", "Data cleaning", "Statistical reasoning", "Data visualization", "Stakeholder communication"],
  "AI/ML Engineer": ["Python", "Data preparation", "Model evaluation", "Machine-learning fundamentals", "Experiment tracking", "Responsible AI"],
  "Cybersecurity Analyst": ["Security fundamentals", "Threat analysis", "Network monitoring", "Incident response", "Vulnerability management", "Security reporting"],
  "Cloud Engineer": ["Cloud fundamentals", "Identity and access", "Infrastructure as code", "Networking", "Monitoring", "Cost awareness"],
  "DevOps Engineer": ["Linux and scripting", "CI/CD", "Containers", "Infrastructure as code", "Observability", "Reliability practices"],
};

const fallbackSkills = ["Domain fundamentals", "Core tools", "Problem solving", "Quality assurance", "Collaboration", "Communication"];

const statusOptions: Array<{ id: EvidenceStatus; label: string }> = [
  { id: "not-reviewed", label: "Not reviewed" },
  { id: "learning", label: "Learning" },
  { id: "demonstrated", label: "Can demonstrate" },
];

function readEvidence(storageKey: string): StoredEvidence {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed as StoredEvidence : {};
  } catch {
    return {};
  }
}

export function SkillEvidence({ role, ownerKey, onOpenProgress }: { role: string; ownerKey: string; onOpenProgress: () => void }) {
  const storageKey = `${STORAGE_KEY}:${ownerKey}`;
  const starterSkills = useMemo(() => roleSkills[role] ?? fallbackSkills, [role]);
  const [records, setRecords] = useState<Record<string, SkillRecord>>({});
  const [customSkills, setCustomSkills] = useState<string[]>([]);
  const [activeSkill, setActiveSkill] = useState(starterSkills[0]);
  const [newSkill, setNewSkill] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!role) return;
    let scopedEvidence = readEvidence(storageKey);
    const legacyEvidence = readEvidence(STORAGE_KEY);
    if (!Object.keys(scopedEvidence).length && Object.keys(legacyEvidence).length) {
      scopedEvidence = legacyEvidence;
      window.localStorage.setItem(storageKey, JSON.stringify(legacyEvidence));
      window.localStorage.removeItem(STORAGE_KEY);
    }
    const roleEvidence = scopedEvidence[role];
    const task = window.setTimeout(() => {
      setRecords(roleEvidence?.records ?? {});
      setCustomSkills(roleEvidence?.customSkills ?? []);
      setActiveSkill(starterSkills[0]);
      setSaved(false);
    }, 0);
    return () => window.clearTimeout(task);
  }, [role, starterSkills, storageKey]);

  if (!role) {
    return (
      <section className="grid min-h-[560px] place-items-center rounded-[28px] border border-dashed border-ink/15 bg-white/55 p-8 text-center">
        <div className="max-w-md">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-mint/35"><BookOpenCheck size={23}/></span>
          <p className="label mt-6">Skill evidence</p>
          <h2 className="mt-3 text-2xl font-bold tracking-[-.04em]">Start with a target role</h2>
          <p className="mt-3 text-sm leading-6 text-slate">CareerTwin needs a role before it can offer a focused set of skill-review prompts.</p>
          <Link href="/onboarding" className="button-primary mt-7">Choose a target role</Link>
        </div>
      </section>
    );
  }

  const skills = [...starterSkills, ...customSkills];
  const activeRecord = records[activeSkill] ?? { status: "not-reviewed" as const, evidence: "" };
  const reviewed = skills.filter((skill) => (records[skill]?.status ?? "not-reviewed") !== "not-reviewed").length;
  const demonstrated = skills.filter((skill) => records[skill]?.status === "demonstrated").length;
  const prioritySkill = skills.find((skill) => records[skill]?.status !== "demonstrated") ?? skills[0];
  const activeIndex = Math.max(0, skills.indexOf(activeSkill));
  const prerequisites = skills.slice(Math.max(0, activeIndex - 2), activeIndex);
  const activeImportance = activeIndex < 2 ? "Foundation" : activeIndex < 4 ? "Core role skill" : "Supporting skill";

  function updateActive(patch: Partial<SkillRecord>) {
    setRecords((current) => ({
      ...current,
      [activeSkill]: { status: current[activeSkill]?.status ?? "not-reviewed", evidence: current[activeSkill]?.evidence ?? "", ...patch },
    }));
    setSaved(false);
  }

  function addSkill(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = newSkill.trim();
    if (!normalized || skills.some((skill) => skill.toLowerCase() === normalized.toLowerCase())) return;
    setCustomSkills((current) => [...current, normalized]);
    setActiveSkill(normalized);
    setNewSkill("");
    setSaved(false);
  }

  async function saveEvidence() {
    const stored = readEvidence(storageKey);
    stored[role] = { records, customSkills };
    window.localStorage.setItem(storageKey, JSON.stringify(stored));
    setSaved(false);
    window.dispatchEvent(new Event("careertwin:evidence-saved"));
    const synced = await persistTwinPatch({ evidence: stored });
    setSaved(synced);
  }

  function exportEvidence() {
    const reviewedSkills = skills.filter((skill) => {
      const record = records[skill];
      return record && (record.status !== "not-reviewed" || record.evidence.trim());
    });
    const lines = [
      "CareerTwin evidence snapshot",
      `Target role: ${role}`,
      `Exported: ${new Date().toLocaleDateString()}`,
      "",
      ...reviewedSkills.flatMap((skill) => {
        const record = records[skill];
        return [`${skill} — ${record.status === "demonstrated" ? "Can demonstrate" : record.status === "learning" ? "Learning" : "Not reviewed"}`, record.evidence.trim() || "No evidence note added.", ""];
      }),
      "This snapshot contains self-recorded evidence. It is not a readiness score or an employer assessment.",
    ];
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `careertwin-${role.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-evidence.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-4 rounded-[26px] border border-ink/10 bg-ink p-6 text-white md:grid-cols-[1fr_auto] md:items-end md:p-7">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[.18em] text-mint">Evidence inventory · {role}</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-.035em]">Document what you can show—not just what you recognize.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/62">These are review prompts, not a readiness score or a claim about every employer. Mark each area honestly and attach a concrete example when you can.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3"><strong className="block text-xl">{reviewed}/{skills.length}</strong><span className="text-[10px] uppercase tracking-wider text-white/55">Reviewed</span></div>
          <div className="rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3"><strong className="block text-xl">{demonstrated}</strong><span className="text-[10px] uppercase tracking-wider text-white/55">With evidence</span></div>
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-[22px] border border-violet-200 bg-violet-50/55 p-5"><div><p className="label">Deterministic next priority</p><h3 className="mt-2 font-bold">{prioritySkill}</h3><p className="mt-1 max-w-3xl text-sm leading-6 text-slate">This is the first unresolved skill in the ordered {role} framework. Earlier framework skills are treated as prerequisites; no AI score or labour-market claim is used.</p></div><button type="button" onClick={()=>setActiveSkill(prioritySkill)} className="button-primary">Review priority skill</button></section>

      <section className="grid min-w-0 gap-5 xl:grid-cols-[.78fr_1.22fr]">
        <article className="min-w-0 rounded-[26px] border border-ink/10 bg-white p-5 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div><p className="label">Review queue</p><h3 className="mt-2 text-lg font-bold tracking-[-.025em]">Skill areas</h3></div>
            <span className="grid size-10 place-items-center rounded-2xl bg-mint/35 text-accent"><Sparkles size={18}/></span>
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            {skills.map((skill) => {
              const status = records[skill]?.status ?? "not-reviewed";
              return (
                <button key={skill} type="button" onClick={() => { setActiveSkill(skill); setSaved(false); }} className={`flex min-h-12 min-w-0 items-center justify-between gap-3 rounded-2xl border px-3.5 py-2.5 text-left transition ${activeSkill === skill ? "border-accent bg-accent/[.055]" : "border-ink/8 hover:border-ink/18 hover:bg-cream/40"}`}>
                  <span className="min-w-0 text-sm font-semibold leading-5">{skill}</span>
                  <span className={`grid size-6 shrink-0 place-items-center rounded-full ${status === "demonstrated" ? "bg-accent text-white" : status === "learning" ? "bg-gold/35 text-ink" : "bg-cream text-slate"}`}>
                    {status === "demonstrated" ? <Check size={13}/> : <CircleDashed size={13}/>} 
                  </span>
                </button>
              );
            })}
          </div>
          <form onSubmit={addSkill} className="mt-5 border-t border-ink/8 pt-5">
            <label htmlFor="new-skill" className="text-xs font-bold">Add another skill area</label>
            <div className="mt-2 flex gap-2">
              <input id="new-skill" value={newSkill} onChange={(event) => setNewSkill(event.target.value)} placeholder="e.g. Design systems" className="min-w-0 flex-1 rounded-xl border border-ink/10 bg-cream/35 px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/8" />
              <button type="submit" disabled={!newSkill.trim()} className="grid size-11 shrink-0 place-items-center rounded-xl bg-ink text-white disabled:cursor-not-allowed disabled:opacity-35" aria-label="Add skill"><Plus size={17}/></button>
            </div>
          </form>
        </article>

        <article className="min-w-0 rounded-[26px] border border-ink/10 bg-white p-5 md:p-7">
          <p className="label">Evidence editor</p>
          <h3 className="mt-2 break-words text-2xl font-bold tracking-[-.035em]">{activeSkill}</h3>
          <fieldset className="mt-6">
            <legend className="text-xs font-bold">How would you describe this today?</legend>
            <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
              {statusOptions.map((option) => (
                <button key={option.id} type="button" aria-pressed={activeRecord.status === option.id} onClick={() => updateActive({ status: option.id })} className={`min-h-11 rounded-xl border px-3 py-2 text-xs font-bold transition ${activeRecord.status === option.id ? "border-accent bg-accent text-white" : "border-ink/10 bg-white hover:border-ink/25"}`}>{option.label}</button>
              ))}
            </div>
          </fieldset>
          <div className="mt-6">
            <label htmlFor="skill-evidence-note" className="text-xs font-bold">Evidence or next proof point</label>
            <p id="evidence-hint" className="mt-1 text-xs leading-5 text-slate">Name a project, task, outcome, course exercise, or specific example. Avoid sensitive employer information.</p>
            <textarea id="skill-evidence-note" aria-describedby="evidence-hint" value={activeRecord.evidence} onChange={(event) => updateActive({ evidence: event.target.value })} rows={6} placeholder="Example: Built a responsive dashboard and tested keyboard navigation across its primary workflows." className="mt-2.5 w-full resize-y rounded-2xl border border-ink/10 bg-cream/35 px-4 py-3 text-sm leading-6 outline-none placeholder:text-slate/60 focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/8" />
          </div>
          <section className="mt-6 grid gap-3 rounded-2xl border border-ink/8 bg-app/60 p-4 sm:grid-cols-2"><div><p className="text-xs font-bold">Importance</p><p className="mt-1 text-sm text-slate">{activeImportance} for the ordered {role} review framework.</p></div><div><p className="text-xs font-bold">Prerequisites</p><p className="mt-1 text-sm text-slate">{prerequisites.length ? prerequisites.join(", ") : "No earlier framework skill."}</p></div><div><p className="text-xs font-bold">Effort assumption</p><p className="mt-1 text-sm text-slate">Start with 3–6 focused sessions of about 45 minutes, then reassess from evidence.</p></div><div><p className="text-xs font-bold">Practical exercise</p><p className="mt-1 text-sm text-slate">Create a small reviewable artifact and explain one decision, one constraint, and one improvement.</p></div></section>
          <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={()=>updateActive({status:"learning"})} className="button-secondary px-4 py-2.5"><BookOpenCheck size={15}/>Start learning</button><button type="button" onClick={onOpenProgress} className="button-secondary px-4 py-2.5">Open weekly assessment</button></div>
          <p className="mt-3 text-xs leading-5 text-slate">Completing learning activity does not establish mastery. Use an assessment and specific evidence before marking “Can demonstrate.”</p>
          <div className="mt-6 flex flex-col gap-3 border-t border-ink/8 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate" aria-live="polite">{saved ? "Evidence saved to your secure Career Twin." : "Unsaved changes remain a browser draft until secure sync succeeds."}</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button type="button" onClick={exportEvidence} disabled={reviewed === 0} className="button-secondary px-4 py-2.5 disabled:cursor-not-allowed disabled:opacity-40"><Download size={15}/>Export snapshot</button>
              <button type="button" onClick={()=>void saveEvidence()} className="button-primary"><Save size={15}/>Save evidence</button>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
