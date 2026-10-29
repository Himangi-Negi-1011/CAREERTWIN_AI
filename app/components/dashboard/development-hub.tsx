"use client";

import {
  ArrowRight, BookOpen, CalendarDays, Check, ClipboardCheck, Download, FolderKanban,
  Pause, Play, Plus, RotateCcw, Sparkles, Trash2,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { persistTwinPatch } from "@/lib/twin/client";
import { InterviewCoach } from "./interview-coach";

export type DevelopmentView = "roadmap" | "projects" | "interviews" | "progress" | "guide";

type LearningTask = { id: string; title: string; detail: string; done: boolean; createdAt: string; status?: "planned" | "in-progress" | "paused" | "complete"; skill?: string; prerequisites?: string; priority?: "high" | "medium" | "low"; estimatedMinutes?: number; plannedDate?: string; notes?: string };
type Project = { id: string; title: string; outcome: string; status: "planned" | "building" | "complete"; createdAt: string };
type Practice = { questionId: string; rating: number; note: string; answerText?: string; mode?: "text" | "voice-review"; practicedAt: string };
type DevelopmentData = { tasks: LearningTask[]; projects: Project[]; practice: Practice[] };
type GeneratedPlan = { summary: string; tasks: Array<{ title: string; detail: string; rationale: string; proof: string; estimatedMinutes: number }> };

const EMPTY: DevelopmentData = { tasks: [], projects: [], practice: [] };
const KEY = "careertwin-development-v1";

const starterTasks = (role: string) => [
  { title: `Map the core expectations for ${role || "your target role"}`, detail: "Review 3–5 real role descriptions. Record recurring skills and outcomes; do not copy requirements blindly." },
  { title: "Strengthen one foundation", detail: "Choose one high-frequency skill, study a reliable resource, and complete a small exercise that proves understanding." },
  { title: "Create one evidence artifact", detail: "Build a small, reviewable output: analysis, design, document, model, presentation, workflow, or working prototype." },
  { title: "Request specific feedback", detail: "Ask a peer or mentor to review the artifact against clear criteria, then record one improvement." },
];

function now() { return new Date().toISOString(); }
function makeId(prefix: string) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; }
function readData(key: string): DevelopmentData {
  try {
    const value = JSON.parse(window.localStorage.getItem(key) ?? "null") as Partial<DevelopmentData> | null;
    return value && typeof value === "object" ? { tasks: value.tasks ?? [], projects: value.projects ?? [], practice: value.practice ?? [] } : EMPTY;
  } catch { return EMPTY; }
}

function EmptyStart({ icon: Icon, title, text, action, onAction }: { icon: typeof BookOpen; title: string; text: string; action: string; onAction: () => void }) {
  return <div className="rounded-[24px] border border-dashed border-ink/15 bg-white/60 p-8 text-center">
    <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-mint/35 text-accent"><Icon size={21}/></span>
    <h3 className="mt-4 text-lg font-bold">{title}</h3><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate">{text}</p>
    <button type="button" onClick={onAction} className="button-primary mt-5"><Plus size={15}/>{action}</button>
  </div>;
}

function Roadmap({ role, data, update, onOpenProgress }: { role: string; data: DevelopmentData; update: (next: DevelopmentData) => void; onOpenProgress: () => void }) {
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [reviewedFacts, setReviewedFacts] = useState("");
  const [generated, setGenerated] = useState<GeneratedPlan | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generationMessage, setGenerationMessage] = useState("");
  const completed = data.tasks.filter((task) => task.done || task.status === "complete").length;
  const taskStatus = (task: LearningTask) => task.status ?? (task.done ? "complete" : "planned");
  const updateTask = (taskId: string, patch: Partial<LearningTask>) => update({ ...data, tasks: data.tasks.map((task) => task.id === taskId ? { ...task, ...patch } : task) });

  async function generatePersonalizedPlan() {
    setGenerating(true); setGenerationMessage(""); setGenerated(null);
    try {
      const response = await fetch("/api/roadmap/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reviewedResumeFacts: reviewedFacts.split("\n").map((fact) => fact.trim()).filter(Boolean), resumeFactsConfirmed: true }) });
      const payload = await response.json() as { data?: GeneratedPlan; error?: { message?: string } };
      if (!response.ok || !payload.data) { setGenerationMessage(payload.error?.message ?? "Personalized tasks could not be generated."); return; }
      setGenerated(payload.data);
    } catch { setGenerationMessage("Personalized task generation is temporarily unavailable."); }
    finally { setGenerating(false); }
  }

  function applyGeneratedPlan() {
    if (!generated) return;
    const tasks = generated.tasks.map((task) => ({ id: makeId("ai-task"), title: task.title, detail: `${task.detail}\n\nProof: ${task.proof}\nWhy: ${task.rationale}`, done: false, status: "planned" as const, skill: role, prerequisites: "Use only prerequisites confirmed in your profile or earlier roadmap tasks.", priority: "medium" as const, estimatedMinutes: task.estimatedMinutes, notes: "", createdAt: now() }));
    update({ ...data, tasks: [...data.tasks, ...tasks] });
    setGenerated(null); setGenerationMessage("Personalized tasks added. Review and edit them before relying on the plan.");
  }
  function add(event: FormEvent) {
    event.preventDefault(); const nextTitle = title.trim(); if (!nextTitle) return;
    update({ ...data, tasks: [...data.tasks, { id: makeId("task"), title: nextTitle, detail: detail.trim(), done: false, status: "planned", skill: role, prerequisites: "", priority: "medium", estimatedMinutes: 45, notes: "", createdAt: now() }] });
    setTitle(""); setDetail("");
  }
  function addStarter() {
    if (data.tasks.length && !window.confirm("Add the starter steps alongside your existing plan?")) return;
    const tasks = starterTasks(role).map((task, index) => ({ ...task, id: makeId("task"), done: false, status: "planned" as const, skill: role || "Target-role foundation", prerequisites: index ? starterTasks(role)[index - 1].title : "None recorded", priority: index < 2 ? "high" as const : "medium" as const, estimatedMinutes: 45, notes: "", createdAt: now() }));
    update({ ...data, tasks: [...data.tasks, ...tasks] });
  }
  return <div className="space-y-5">
    <section className="grid gap-4 rounded-[26px] border border-ink/10 bg-white p-5 md:grid-cols-[1fr_auto] md:items-center md:p-7">
      <div><p className="label">Learning plan · {role || "Any domain"}</p><h2 className="mt-2 text-2xl font-bold tracking-[-.035em]">Turn a career goal into small, verifiable steps.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate">Use suggestions as a starting point, then adapt them to your field, experience, access, and local job market.</p></div>
      <div className="rounded-2xl bg-cream px-5 py-4 text-center"><strong className="text-2xl">{completed}/{data.tasks.length}</strong><span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-slate">Steps complete</span></div>
    </section>
    <section className="rounded-[26px] border border-violet-200 bg-violet-50/45 p-5 md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="label">AI-assisted plan</p><h3 className="mt-2 text-lg font-bold">Generate tasks from your confirmed details</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-slate">CareerTwin uses your saved target, education, skills, projects, goals, and only resume facts you explicitly review below. Generated tasks are a draft and are never applied automatically.</p></div><Sparkles className="text-accent" size={22}/></div>
      <label className="mt-5 block text-xs font-bold">Reviewed resume facts, optional<textarea value={reviewedFacts} onChange={(event)=>setReviewedFacts(event.target.value)} rows={3} maxLength={4000} className="mt-2 w-full resize-y rounded-xl border border-violet-200 bg-white px-3 py-3 text-sm font-normal outline-none focus:border-accent" placeholder="One confirmed fact per line. Do not include private contact details or unreviewed extracted text."/></label>
      <div className="mt-4 flex flex-wrap items-center gap-3"><button type="button" onClick={()=>void generatePersonalizedPlan()} disabled={generating||!role} className="button-primary disabled:opacity-40"><Sparkles size={15}/>{generating?"Generating safely…":"Generate personalized tasks"}</button><span className="text-xs text-slate">Requires a configured server-side AI provider.</span></div>
      {generationMessage&&<p role="status" className="mt-4 rounded-xl border border-violet-200 bg-white p-3 text-sm text-ink">{generationMessage}</p>}
      {generated&&<div className="mt-5 rounded-2xl border border-violet-200 bg-white p-4"><p className="text-sm leading-6 text-slate">{generated.summary}</p><div className="mt-4 space-y-3">{generated.tasks.map((task)=><article key={`${task.title}-${task.estimatedMinutes}`} className="rounded-xl border border-ink/8 p-4"><div className="flex items-start justify-between gap-3"><h4 className="font-bold">{task.title}</h4><span className="shrink-0 text-xs font-semibold text-slate">{task.estimatedMinutes} min</span></div><p className="mt-2 text-sm leading-6 text-slate">{task.detail}</p><p className="mt-2 text-xs text-slate"><strong>Proof:</strong> {task.proof}</p><p className="mt-1 text-xs text-slate"><strong>Why:</strong> {task.rationale}</p></article>)}</div><div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={applyGeneratedPlan} className="button-primary"><Check size={15}/>Review and add tasks</button><button type="button" onClick={()=>setGenerated(null)} className="button-secondary">Discard draft</button></div></div>}
    </section>
    {!data.tasks.length ? <EmptyStart icon={BookOpen} title="Build your first learning plan" text="Start with a four-step role-agnostic plan, or add your own learning step below." action="Add starter plan" onAction={addStarter}/> : <section className="rounded-[26px] border border-ink/10 bg-white p-5 md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="label">Your sequence</p><h3 className="mt-2 text-lg font-bold">Learning steps</h3></div><button type="button" onClick={addStarter} className="button-secondary px-4 py-2.5"><Sparkles size={15}/>Add starter steps</button></div>
      <div className="mt-5 space-y-3">{data.tasks.map((task, index) => { const status=taskStatus(task); const complete=status==="complete"; return <article key={task.id} className={`rounded-2xl border p-4 ${complete ? "border-accent/15 bg-mint/15" : "border-ink/8"}`}>
        <div className="flex gap-3"><span className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border ${complete ? "border-accent bg-accent text-white" : "border-ink/20"}`}>{complete?<Check size={14}/>:<span className="text-[10px] font-bold">{index+1}</span>}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><div><p className={`font-bold ${complete?"text-slate line-through":""}`}>{task.title}</p><p className="mt-1 text-xs font-semibold text-accent">{task.skill||role||"General"} · {task.priority||"medium"} priority · {task.estimatedMinutes||45} min</p></div><span className="rounded-full bg-app px-3 py-1 text-[10px] font-bold uppercase">{status}</span></div>{task.detail&&<p className="mt-2 whitespace-pre-wrap text-sm leading-5 text-slate">{task.detail}</p>}</div><button type="button" onClick={()=>update({...data,tasks:data.tasks.filter((item)=>item.id!==task.id)})} className="grid size-8 shrink-0 place-items-center rounded-full text-slate hover:bg-red-50 hover:text-red-700" aria-label={`Delete ${task.title}`}><Trash2 size={14}/></button></div>
        <details className="mt-4 border-t border-ink/8 pt-3"><summary className="cursor-pointer text-xs font-bold text-accent">Task details and evidence</summary><div className="mt-3 grid gap-3 md:grid-cols-2"><label className="text-xs font-bold">Prerequisites<input value={task.prerequisites??""} onChange={(event)=>updateTask(task.id,{prerequisites:event.target.value})} className="mt-2 w-full rounded-xl border border-ink/10 bg-white px-3 py-2.5 font-normal"/></label><label className="text-xs font-bold">Planned date<input type="date" value={task.plannedDate??""} onChange={(event)=>updateTask(task.id,{plannedDate:event.target.value})} className="mt-2 w-full rounded-xl border border-ink/10 bg-white px-3 py-2.5 font-normal"/></label><label className="text-xs font-bold md:col-span-2">Notes or evidence<textarea value={task.notes??""} onChange={(event)=>updateTask(task.id,{notes:event.target.value})} rows={3} maxLength={1200} className="mt-2 w-full rounded-xl border border-ink/10 bg-white px-3 py-2.5 font-normal" placeholder="Record a link, artifact, result, or reflection. Avoid confidential information."/></label></div></details>
        <div className="mt-4 flex flex-wrap gap-2">
          {status==="planned"&&<button type="button" onClick={()=>updateTask(task.id,{status:"in-progress",done:false})} className="button-secondary px-3 py-2"><Play size={13}/>Start</button>}
          {status==="in-progress"&&<button type="button" onClick={()=>updateTask(task.id,{status:"paused",done:false})} className="button-secondary px-3 py-2"><Pause size={13}/>Pause</button>}
          {status==="paused"&&<button type="button" onClick={()=>updateTask(task.id,{status:"in-progress",done:false})} className="button-secondary px-3 py-2"><Play size={13}/>Resume</button>}
          {!complete&&<button type="button" onClick={()=>updateTask(task.id,{status:"complete",done:true})} className="button-primary px-3 py-2"><Check size={13}/>Mark complete</button>}
          {complete&&<button type="button" onClick={()=>updateTask(task.id,{status:"in-progress",done:false})} className="button-secondary px-3 py-2"><RotateCcw size={13}/>Reopen</button>}
          <button type="button" onClick={() => { const skill = task.skill || role; if (skill) { window.history.replaceState({}, "", `/dashboard?view=learning&skill=${encodeURIComponent(skill)}`); window.dispatchEvent(new PopStateEvent("popstate")); window.location.reload(); } }} className="button-secondary px-3 py-2 text-accent">
            <BookOpen size={13}/>Study course
          </button>
          <button type="button" onClick={onOpenProgress} className="button-secondary px-3 py-2"><CalendarDays size={13}/>Assessment & schedule</button>
        </div>
      </article>})}</div>
    </section>}
    <form onSubmit={add} className="rounded-[26px] border border-ink/10 bg-white p-5 md:p-7"><p className="label">Custom step</p><div className="mt-4 grid gap-3 md:grid-cols-2"><label className="text-xs font-bold">What will you learn or practise?<input value={title} onChange={(e)=>setTitle(e.target.value)} maxLength={120} className="mt-2 w-full rounded-xl border border-ink/10 bg-cream/35 px-3 py-3 text-sm font-normal outline-none focus:border-accent" placeholder="e.g. Explain a core concept without notes"/></label><label className="text-xs font-bold">Proof or completion criteria<textarea value={detail} onChange={(e)=>setDetail(e.target.value)} maxLength={300} rows={2} className="mt-2 w-full resize-y rounded-xl border border-ink/10 bg-cream/35 px-3 py-3 text-sm font-normal outline-none focus:border-accent" placeholder="What will show that this step is complete?"/></label></div><button disabled={!title.trim()} className="button-primary mt-4 disabled:opacity-40"><Plus size={15}/>Add learning step</button></form>
  </div>;
}

function Projects({ data, update }: { data: DevelopmentData; update: (next: DevelopmentData) => void }) {
  const [title, setTitle] = useState(""); const [outcome, setOutcome] = useState("");
  function add(event: FormEvent) { event.preventDefault(); if (!title.trim()) return; update({ ...data, projects: [...data.projects, { id: makeId("project"), title: title.trim(), outcome: outcome.trim(), status: "planned", createdAt: now() }] }); setTitle(""); setOutcome(""); }
  const states: Project["status"][] = ["planned", "building", "complete"];
  return <div className="space-y-5"><section className="rounded-[26px] bg-ink p-6 text-white md:p-8"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-mint">Evidence projects</p><h2 className="mt-3 text-2xl font-semibold tracking-[-.035em]">Make work that is useful, reviewable, and safe to share.</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">A project can be a case study, analysis, campaign, lesson, workflow, experiment, prototype, research summary, operational improvement, or other artifact appropriate to your domain.</p></section>
    <form onSubmit={add} className="rounded-[26px] border border-ink/10 bg-white p-5 md:p-7"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-mint/35 text-accent"><FolderKanban size={18}/></span><div><p className="label">New project</p><h3 className="mt-1 font-bold">Define the outcome before the output</h3></div></div><div className="mt-5 grid gap-3 md:grid-cols-2"><label className="text-xs font-bold">Project title<input value={title} onChange={(e)=>setTitle(e.target.value)} maxLength={120} className="mt-2 w-full rounded-xl border border-ink/10 bg-cream/35 px-3 py-3 text-sm font-normal outline-none focus:border-accent" placeholder="e.g. Customer support insights brief"/></label><label className="text-xs font-bold">Outcome and evidence<textarea value={outcome} onChange={(e)=>setOutcome(e.target.value)} maxLength={400} rows={2} className="mt-2 w-full resize-y rounded-xl border border-ink/10 bg-cream/35 px-3 py-3 text-sm font-normal outline-none focus:border-accent" placeholder="Who is it for, what problem will it address, and what can you show?"/></label></div><p className="mt-3 text-xs text-slate">Do not include confidential, proprietary, personal, or unsafe material.</p><button disabled={!title.trim()} className="button-primary mt-4 disabled:opacity-40"><Plus size={15}/>Create project</button></form>
    {!data.projects.length ? <EmptyStart icon={FolderKanban} title="No evidence projects yet" text="Create a project with an outcome you can explain. CareerTwin will not invent projects or completion claims for you." action="Focus title field" onAction={()=>document.querySelector<HTMLInputElement>('input[placeholder*="Customer support"]')?.focus()}/> : <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{data.projects.map((project)=><article key={project.id} className="rounded-[24px] border border-ink/10 bg-white p-5"><div className="flex items-start justify-between gap-3"><span className="rounded-full bg-cream px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate">{project.status}</span><button type="button" onClick={()=>update({...data,projects:data.projects.filter((item)=>item.id!==project.id)})} aria-label={`Delete ${project.title}`} className="text-slate hover:text-red-700"><Trash2 size={15}/></button></div><h3 className="mt-4 text-lg font-bold">{project.title}</h3><p className="mt-2 min-h-15 text-sm leading-5 text-slate">{project.outcome || "Add an outcome by recreating this project with clearer evidence criteria."}</p><label className="mt-5 block text-[10px] font-bold uppercase tracking-wider text-slate">Status<select value={project.status} onChange={(e)=>update({...data,projects:data.projects.map((item)=>item.id===project.id?{...item,status:e.target.value as Project["status"]}:item)})} className="mt-2 w-full rounded-xl border border-ink/10 bg-cream/35 px-3 py-2.5 text-sm font-semibold text-ink">{states.map((state)=><option key={state}>{state}</option>)}</select></label></article>)}</section>}
  </div>;
}

function Interviews({ role, data, update }: { role: string; data: DevelopmentData; update: (next: DevelopmentData) => void }) {
  return <InterviewCoach role={role} practiceCount={data.practice.length} onSave={(record) => update({ ...data, practice: [...data.practice, { ...record, practicedAt: now() }] })} />;
}

function Progress({ data }: { data: DevelopmentData }) {
  const tasksDone=data.tasks.filter((task)=>task.done).length; const projectsDone=data.projects.filter((project)=>project.status==="complete").length; const total=data.tasks.length+data.projects.length+data.practice.length; const completed=tasksDone+projectsDone+data.practice.length; const percent=total?Math.round(completed/total*100):0;
  function exportData(){const url=URL.createObjectURL(new Blob([JSON.stringify({exportedAt:now(),...data},null,2)],{type:"application/json"}));const a=document.createElement("a");a.href=url;a.download="careertwin-development-progress.json";a.click();URL.revokeObjectURL(url)}
  const metrics=[["Learning steps",`${tasksDone}/${data.tasks.length}`,BookOpen],["Projects complete",`${projectsDone}/${data.projects.length}`,FolderKanban],["Practice answers",String(data.practice.length),ClipboardCheck]] as const;
  return <div className="space-y-5"><section className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#183034,#176c68)] p-7 text-white md:p-9"><div className="relative z-10"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-mint">Recorded progress</p><div className="mt-4 flex flex-wrap items-end gap-5"><strong className="text-5xl tracking-[-.06em]">{percent}%</strong><p className="max-w-xl pb-1 text-sm leading-6 text-white/65">Completion across learning steps, finished projects, and saved interview reflections. This is an activity summary—not a job-readiness score.</p></div><div className="mt-6 h-2 overflow-hidden rounded-full bg-white/12"><div className="h-full rounded-full bg-mint transition-all" style={{width:`${percent}%`}}/></div></div><div className="absolute -right-16 -top-20 size-72 rounded-full border-[45px] border-white/[.04]"/></section><section className="grid gap-4 md:grid-cols-3">{metrics.map(([label,value,Icon])=><article key={label} className="rounded-[24px] border border-ink/10 bg-white p-5"><span className="grid size-10 place-items-center rounded-xl bg-mint/30 text-accent"><Icon size={18}/></span><strong className="mt-5 block text-2xl">{value}</strong><span className="text-sm text-slate">{label}</span></article>)}</section><section className="rounded-[26px] border border-ink/10 bg-white p-6 md:p-7"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="label">Your data</p><h3 className="mt-2 text-lg font-bold">Portable and transparent</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-slate">Export the learning, project, and practice records saved in this browser. The file contains only what you entered or marked complete.</p></div><button type="button" onClick={exportData} disabled={!total} className="button-secondary disabled:opacity-40"><Download size={15}/>Export JSON</button></div></section></div>;
}

function Guide({ open }: { open: (view: DevelopmentView)=>void }) {
 const steps=[{title:"1. Set a target",text:"Choose the closest role or type your own. A target focuses prompts without locking you into one path."},{title:"2. Review evidence",text:"In My skills, mark what you are learning or can demonstrate and add a specific, non-confidential example."},{title:"3. Plan learning",text:"Use the starter roadmap or create steps with clear proof of completion."},{title:"4. Build projects",text:"Define an outcome, create an artifact appropriate to your domain, and update its status honestly."},{title:"5. Practise interviews",text:"Answer aloud, use real examples, self-rate, and save a reflection. Guidance is structured—not AI scoring."},{title:"6. Review progress",text:"Use the activity summary to see what you recorded. Export a copy whenever you need one."}];
 return <div className="space-y-5"><section className="rounded-[28px] bg-ink p-7 text-white md:p-9"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-mint">CareerTwin guide</p><h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-[-.04em]">A practical workflow for any career domain.</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">CareerTwin helps you organize self-recorded evidence and action. It does not verify credentials, predict hiring outcomes, or replace advice from qualified educators, mentors, recruiters, or regulated professionals.</p></section><section className="grid gap-4 md:grid-cols-2">{steps.map((step)=><article key={step.title} className="rounded-[22px] border border-ink/10 bg-white p-5"><h3 className="font-bold">{step.title}</h3><p className="mt-2 text-sm leading-6 text-slate">{step.text}</p></article>)}</section><section className="rounded-[26px] border border-accent/15 bg-mint/15 p-6"><h3 className="font-bold">Privacy and safe use</h3><ul className="mt-3 grid gap-2 text-sm leading-6 text-slate md:grid-cols-2"><li>• Data in these modules is stored in this browser and scoped to your signed-in account ID.</li><li>• Avoid employer secrets, client data, health data, credentials, or personal identifiers.</li><li>• Exported files may contain your notes; review them before sharing.</li><li>• Integrations remain unavailable until secure provider OAuth is configured.</li></ul></section><div className="flex flex-wrap gap-3"><button onClick={()=>open("roadmap")} className="button-primary">Start learning plan<ArrowRight size={15}/></button><button onClick={()=>open("interviews")} className="button-secondary">Practise an interview</button></div></div>;
}

export function DevelopmentHub({ view, role, ownerKey, onOpen }: { view: DevelopmentView; role: string; ownerKey: string; onOpen: (view: DevelopmentView)=>void }) {
  const storageKey=`${KEY}:${ownerKey}`; const [data,setData]=useState<DevelopmentData>(EMPTY); const [loaded,setLoaded]=useState(false);
  useEffect(()=>{const task=window.setTimeout(()=>{setData(readData(storageKey));setLoaded(true)},0);return()=>window.clearTimeout(task)},[storageKey]);
  function update(next:DevelopmentData){setData(next);window.localStorage.setItem(storageKey,JSON.stringify(next));window.dispatchEvent(new Event("careertwin:development-saved"));void persistTwinPatch({development:next})}
  if(!loaded)return <div className="grid min-h-[420px] place-items-center text-sm font-semibold text-slate">Loading your development workspace…</div>;
  if(view==="roadmap")return <Roadmap role={role} data={data} update={update} onOpenProgress={()=>onOpen("progress")}/>;
  if(view==="projects")return <Projects data={data} update={update}/>;
  if(view==="interviews")return <Interviews role={role} data={data} update={update}/>;
  if(view==="progress")return <Progress data={data}/>;
  return <Guide open={onOpen}/>;
}
