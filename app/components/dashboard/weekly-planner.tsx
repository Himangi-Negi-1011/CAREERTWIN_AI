"use client";

import { CalendarDays, Check, ChevronRight, Clock3, Play, RotateCcw, Save, Target } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { persistTwinPatch } from "@/lib/twin/client";

type WeeklySettings = { hours: number; sessionMinutes: number; days: string[] };
type WeeklyActivity = { id: string; title: string; skill: string; objective: string; plannedDate: string; estimatedMinutes: number; actualMinutes: number; completionCriteria: string; status: "planned" | "in-progress" | "complete"; sourceTaskId?: string };
type AssessmentQuestion = { id: string; skill: string; difficulty: string; prompt: string; options: Array<{ id: string; text: string }> };
type AssessmentSession = { assessmentId: string; source: "curated"; role: string; questions: AssessmentQuestion[] };
type AssessmentResult = { assessmentId: string; completedAt: string; correct: number; total: number; score: number; revisionSkills: string[]; interpretation: string; results: Array<{ questionId: string; correct: boolean; correctOptionId: string; explanation: string }> };
type Attempt = Pick<AssessmentResult, "assessmentId" | "completedAt" | "correct" | "total" | "score" | "revisionSkills" | "interpretation">;
type WeeklyData = { settings: WeeklySettings; activities: WeeklyActivity[]; attempts: Attempt[] };

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const EMPTY: WeeklyData = { settings: { hours: 5, sessionMinutes: 45, days: ["Tue", "Thu", "Sat"] }, activities: [], attempts: [] };
const dateInput = (date: Date) => date.toISOString().slice(0, 10);
const id = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function readWeekly(key: string): WeeklyData {
  try {
    const value = JSON.parse(window.localStorage.getItem(key) ?? "null") as Partial<WeeklyData> | null;
    return value && typeof value === "object" ? { settings: { ...EMPTY.settings, ...value.settings }, activities: Array.isArray(value.activities) ? value.activities : [], attempts: Array.isArray(value.attempts) ? value.attempts : [] } : EMPTY;
  } catch { return EMPTY; }
}

function nextDates(days: string[], count: number) {
  const result: string[] = [];
  const cursor = new Date();
  cursor.setHours(12, 0, 0, 0);
  for (let offset = 0; offset < 21 && result.length < count; offset += 1) {
    const candidate = new Date(cursor); candidate.setDate(cursor.getDate() + offset);
    const label = DAYS[(candidate.getDay() + 6) % 7];
    if (days.includes(label)) result.push(dateInput(candidate));
  }
  return result;
}

export function WeeklyPlanner({ ownerKey, role, onOpenRoadmap }: { ownerKey: string; role: string; onOpenRoadmap: () => void }) {
  const key = `careertwin-weekly-v1:${ownerKey}`;
  const [data, setData] = useState<WeeklyData>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [title, setTitle] = useState("");
  const [skill, setSkill] = useState("");
  const [session, setSession] = useState<AssessmentSession | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [message, setMessage] = useState("");
  const [assessmentBusy, setAssessmentBusy] = useState(false);

  useEffect(() => { const timer = window.setTimeout(() => { setData(readWeekly(key)); setLoaded(true); }, 0); return () => window.clearTimeout(timer); }, [key]);
  function save(next: WeeklyData) { setData(next); window.localStorage.setItem(key, JSON.stringify(next)); window.dispatchEvent(new Event("careertwin:weekly-saved")); void persistTwinPatch({ weekly: next }); }

  const weeklyStart = useMemo(() => { const value = new Date(); const day = (value.getDay() + 6) % 7; value.setDate(value.getDate() - day); value.setHours(0, 0, 0, 0); return value; }, []);
  const thisWeek = data.activities.filter((activity) => new Date(`${activity.plannedDate}T12:00:00`) >= weeklyStart);
  const completed = thisWeek.filter((activity) => activity.status === "complete");
  const plannedMinutes = thisWeek.reduce((sum, activity) => sum + activity.estimatedMinutes, 0);
  const recordedMinutes = completed.reduce((sum, activity) => sum + activity.actualMinutes, 0);
  const nextActivity = thisWeek.filter((activity) => activity.status !== "complete").sort((a, b) => a.plannedDate.localeCompare(b.plannedDate))[0];

  function updateSettings(patch: Partial<WeeklySettings>) { save({ ...data, settings: { ...data.settings, ...patch } }); }
  function addActivity(event: FormEvent) {
    event.preventDefault(); if (!title.trim()) return;
    save({ ...data, activities: [...data.activities, { id: id("weekly"), title: title.trim(), skill: skill.trim(), objective: `Complete the recorded objective for ${title.trim()}.`, plannedDate: nextDates(data.settings.days, 1)[0] ?? dateInput(new Date()), estimatedMinutes: data.settings.sessionMinutes, actualMinutes: 0, completionCriteria: "Record what was completed and one useful takeaway.", status: "planned" }] });
    setTitle(""); setSkill("");
  }
  function buildFromRoadmap() {
    try {
      const raw = window.localStorage.getItem(`careertwin-development-v1:${ownerKey}`);
      const tasks = raw ? (JSON.parse(raw) as { tasks?: Array<{ id: string; title: string; detail?: string; done?: boolean }> }).tasks ?? [] : [];
      const candidates = tasks.filter((task) => !task.done && !data.activities.some((activity) => activity.sourceTaskId === task.id));
      if (!candidates.length) { setMessage("No unscheduled roadmap tasks are available. Add or reopen a roadmap task first."); return; }
      const maximumSessions = Math.max(1, Math.floor(data.settings.hours * 60 / data.settings.sessionMinutes));
      const selected = candidates.slice(0, maximumSessions);
      const dates = nextDates(data.settings.days, selected.length);
      const additions = selected.map((task, index) => ({ id: id("weekly"), title: task.title, skill: role, objective: task.detail?.split("\n")[0]?.trim() || "Complete the selected roadmap step.", plannedDate: dates[index] ?? dateInput(new Date()), estimatedMinutes: data.settings.sessionMinutes, actualMinutes: 0, completionCriteria: "Complete the roadmap step and record evidence or a takeaway.", status: "planned" as const, sourceTaskId: task.id }));
      save({ ...data, activities: [...data.activities, ...additions] }); setMessage(`${additions.length} roadmap task${additions.length === 1 ? "" : "s"} scheduled within your weekly time budget.`);
    } catch { setMessage("The saved roadmap could not be read. Your weekly plan was not changed."); }
  }
  function setStatus(activity: WeeklyActivity, status: WeeklyActivity["status"]) {
    const actualMinutes = status === "complete" && activity.actualMinutes === 0 ? activity.estimatedMinutes : activity.actualMinutes;
    save({ ...data, activities: data.activities.map((item) => item.id === activity.id ? { ...item, status, actualMinutes } : item) });
  }
  async function startAssessment() {
    if (!role) { setMessage("Choose a target role before starting a weekly assessment."); return; }
    setAssessmentBusy(true); setMessage(""); setResult(null);
    try { const response = await fetch("/api/assessments/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role, questionCount: 5 }) }); const payload = await response.json() as { data?: AssessmentSession; error?: { message?: string } }; if (!response.ok || !payload.data) { setMessage(payload.error?.message ?? "Assessment could not be started."); return; } setSession(payload.data); setAnswers({}); }
    catch { setMessage("Assessment service is temporarily unavailable."); }
    finally { setAssessmentBusy(false); }
  }
  async function submitAssessment() {
    if (!session || Object.keys(answers).length !== session.questions.length) { setMessage("Answer every question before submitting."); return; }
    setAssessmentBusy(true); setMessage("");
    try { const response = await fetch("/api/assessments/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ assessmentId: session.assessmentId, role: session.role, answers: session.questions.map((question) => ({ questionId: question.id, optionId: answers[question.id] })) }) }); const payload = await response.json() as { data?: AssessmentResult; error?: { message?: string } }; if (!response.ok || !payload.data) { setMessage(payload.error?.message ?? "Assessment could not be submitted."); return; } setResult(payload.data); save({ ...data, attempts: [{ assessmentId: payload.data.assessmentId, completedAt: payload.data.completedAt, correct: payload.data.correct, total: payload.data.total, score: payload.data.score, revisionSkills: payload.data.revisionSkills, interpretation: payload.data.interpretation }, ...data.attempts].slice(0, 20) }); }
    catch { setMessage("Assessment submission is temporarily unavailable."); }
    finally { setAssessmentBusy(false); }
  }

  if (!loaded) return <div className="grid min-h-[420px] place-items-center text-sm font-semibold text-slate">Loading your weekly plan…</div>;
  return <div className="space-y-5">
    <section className="grid gap-5 rounded-[26px] bg-ink p-6 text-white lg:grid-cols-[1fr_auto] lg:items-end md:p-8"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-blue-200">Progress & weekly tests</p><h2 className="mt-3 text-3xl font-semibold tracking-[-.04em]">Plan a week you can actually finish.</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">Schedule unfinished roadmap work within your available hours. Progress changes only when you record completion.</p></div><div className="grid grid-cols-2 gap-2"><div className="rounded-2xl bg-white/8 px-5 py-4 text-center"><strong className="text-2xl">{completed.length}/{thisWeek.length}</strong><span className="block text-[10px] text-white/55">TASKS</span></div><div className="rounded-2xl bg-white/8 px-5 py-4 text-center"><strong className="text-2xl">{recordedMinutes}/{plannedMinutes}</strong><span className="block text-[10px] text-white/55">MINUTES</span></div></div></section>

    <section className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]"><article className="rounded-[24px] border border-ink/10 bg-white p-5"><p className="label">Availability</p><label className="mt-4 block text-xs font-bold">Weekly learning hours<input type="number" min={1} max={40} value={data.settings.hours} onChange={(event) => updateSettings({ hours: Math.min(40, Math.max(1, Number(event.target.value) || 1)) })} className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2.5"/></label><label className="mt-4 block text-xs font-bold">Session length<select value={data.settings.sessionMinutes} onChange={(event) => updateSettings({ sessionMinutes: Number(event.target.value) })} className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2.5"><option value={25}>25 minutes</option><option value={45}>45 minutes</option><option value={60}>60 minutes</option><option value={90}>90 minutes</option></select></label><fieldset className="mt-4"><legend className="text-xs font-bold">Preferred days</legend><div className="mt-2 flex flex-wrap gap-2">{DAYS.map((day) => <button type="button" key={day} aria-pressed={data.settings.days.includes(day)} onClick={() => { const days = data.settings.days.includes(day) ? data.settings.days.filter((item) => item !== day) : [...data.settings.days, day]; if (days.length) updateSettings({ days }); }} className={`rounded-full border px-3 py-2 text-xs font-bold ${data.settings.days.includes(day) ? "border-accent bg-accent text-white" : "border-ink/10"}`}>{day}</button>)}</div></fieldset><button type="button" onClick={buildFromRoadmap} className="button-primary mt-5 w-full"><CalendarDays size={15}/>Build week from roadmap</button></article>
    <article className="rounded-[24px] border border-ink/10 bg-white p-5"><div className="flex items-center justify-between"><div><p className="label">This week</p><h3 className="mt-2 text-lg font-bold">{nextActivity ? `Next: ${nextActivity.title}` : "No activity scheduled"}</h3></div><Clock3 size={20} className="text-accent"/></div>{!thisWeek.length ? <div className="mt-6 rounded-2xl border border-dashed border-ink/15 p-6 text-center"><p className="text-sm text-slate">Schedule unfinished roadmap work or add a custom activity.</p><button type="button" onClick={onOpenRoadmap} className="mt-3 text-sm font-bold text-accent">Open career roadmap <ChevronRight className="inline" size={14}/></button></div> : <div className="mt-5 space-y-3">{thisWeek.sort((a,b)=>a.plannedDate.localeCompare(b.plannedDate)).map((activity)=><div key={activity.id} className="rounded-2xl border border-ink/8 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold text-accent">{activity.plannedDate} · {activity.estimatedMinutes} min</p><h4 className="mt-1 font-bold">{activity.title}</h4><p className="mt-1 text-xs leading-5 text-slate">{activity.completionCriteria}</p></div><span className="rounded-full bg-app px-3 py-1 text-[10px] font-bold uppercase">{activity.status}</span></div><div className="mt-3 flex flex-wrap gap-2">{activity.status === "planned" && <button type="button" onClick={()=>setStatus(activity,"in-progress")} className="button-secondary px-3 py-2"><Play size={13}/>Start</button>}{activity.status !== "complete" && <button type="button" onClick={()=>setStatus(activity,"complete")} className="button-primary px-3 py-2"><Check size={13}/>Complete</button>}{activity.status === "complete" && <button type="button" onClick={()=>setStatus(activity,"in-progress")} className="button-secondary px-3 py-2"><RotateCcw size={13}/>Reopen</button>}<input aria-label={`Recorded minutes for ${activity.title}`} type="number" min={0} max={600} value={activity.actualMinutes} onChange={(event)=>save({...data,activities:data.activities.map((item)=>item.id===activity.id?{...item,actualMinutes:Math.min(600,Math.max(0,Number(event.target.value)||0))}:item)})} className="w-28 rounded-xl border border-ink/10 px-3 py-2 text-xs"/></div></div>)}</div>}</article></section>

    <form onSubmit={addActivity} className="rounded-[24px] border border-ink/10 bg-white p-5"><p className="label">Add activity</p><div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]"><label className="text-xs font-bold">Activity title<input value={title} onChange={(event)=>setTitle(event.target.value)} maxLength={120} className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2.5"/></label><label className="text-xs font-bold">Skill, optional<input value={skill} onChange={(event)=>setSkill(event.target.value)} maxLength={80} className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2.5"/></label><button disabled={!title.trim()} className="button-primary self-end disabled:opacity-40"><Save size={14}/>Schedule</button></div></form>

    <section className="rounded-[26px] border border-blue-200 bg-blue-50/50 p-5 md:p-7"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="label">Weekly assessment</p><h3 className="mt-2 text-xl font-bold">Check understanding without pretending it proves mastery.</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-slate">Questions come from a curated server-side bank. Answers and explanations are revealed only after submission.</p></div><button type="button" onClick={()=>void startAssessment()} disabled={assessmentBusy||!role} className="button-primary disabled:opacity-40"><Target size={15}/>{assessmentBusy?"Loading…":"Start this week's test"}</button></div>
      {session && !result && <div className="mt-6 space-y-5">{session.questions.map((question,index)=><fieldset key={question.id} className="rounded-2xl border border-blue-200 bg-white p-4"><legend className="px-1 text-sm font-bold">{index+1}. {question.prompt}</legend><div className="mt-3 grid gap-2">{question.options.map((option)=><label key={option.id} className={`flex cursor-pointer gap-3 rounded-xl border p-3 text-sm ${answers[question.id]===option.id?"border-accent bg-violet-50":"border-ink/8"}`}><input type="radio" name={question.id} checked={answers[question.id]===option.id} onChange={()=>setAnswers((current)=>({...current,[question.id]:option.id}))}/><span>{option.text}</span></label>)}</div></fieldset>)}<button type="button" onClick={()=>void submitAssessment()} disabled={assessmentBusy} className="button-primary">Submit answers</button></div>}
      {result && <div className="mt-6 rounded-2xl border border-blue-200 bg-white p-5"><strong className="text-3xl">{result.correct}/{result.total}</strong><span className="ml-2 text-sm text-slate">correct · {result.score}%</span><p className="mt-3 text-sm leading-6 text-slate">{result.interpretation}</p>{result.revisionSkills.length>0&&<p className="mt-3 text-sm"><strong>Revise next:</strong> {result.revisionSkills.join(", ")}</p>}<div className="mt-4 space-y-2">{result.results.map((item,index)=><details key={item.questionId} className="rounded-xl border border-ink/8 p-3"><summary className="cursor-pointer text-sm font-bold">Question {index+1}: {item.correct?"Correct":"Review needed"}</summary><p className="mt-2 text-sm leading-6 text-slate">{item.explanation}</p></details>)}</div><button type="button" onClick={()=>{setSession(null);setResult(null);setAnswers({})}} className="button-secondary mt-4">Close result</button></div>}
      {data.attempts.length>0&&<div className="mt-6 border-t border-blue-200 pt-5"><h4 className="text-sm font-bold">Attempt history</h4><div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{data.attempts.slice(0,6).map((attempt)=><div key={attempt.assessmentId} className="rounded-xl bg-white p-3 text-sm"><strong>{attempt.correct}/{attempt.total} correct</strong><p className="mt-1 text-xs text-slate">{new Date(attempt.completedAt).toLocaleDateString()}</p></div>)}</div></div>}
      {message&&<p role="status" className="mt-4 rounded-xl bg-white p-3 text-sm">{message}</p>}
    </section>
  </div>;
}
