"use client";

import { useUser } from "@clerk/nextjs";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BriefcaseBusiness,
  BrainCircuit,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Download,
  Save,
  ChevronRight,
  CircleUserRound,
  FolderKanban,
  Gauge,
  GraduationCap,
  Menu,
  MessageSquareText,
  Route,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { careerProfileSchema } from "@/lib/profile/schema";
import type { TwinOutput, TwinSourceState } from "@/lib/twin/schema";
import type { TwinSyncState } from "@/lib/twin/client";
import { Brand } from "../brand";
import { Pip } from "../pip";
import { CommandPalette, type CommandItem } from "./command-palette";
import { CareerIntelligence } from "./career-intelligence";
import { DevelopmentHub } from "./development-hub";
import { LearningStudio } from "./learning-studio";
import { WeeklyPlanner } from "./weekly-planner";
import { RobotCharacter } from "../robot/robot-character";
import "./dashboard-clone.css";

function ModuleLoading() {
  return (
    <section className="space-y-4" aria-busy="true" aria-label="Loading workspace module">
      <div className="h-40 animate-pulse rounded-2xl border border-ink/8 bg-white" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-52 animate-pulse rounded-2xl border border-ink/8 bg-white" />
        <div className="h-52 animate-pulse rounded-2xl border border-ink/8 bg-white" />
      </div>
    </section>
  );
}

import { SkillEvidence } from "./skill-evidence";


type View = "overview" | "intelligence" | "skills" | "roadmap" | "learning" | "interviews" | "documents" | "progress" | "settings";

const navigation: Array<{ id: View; label: string; icon: typeof Gauge }> = [
  { id: "overview", label: "Dashboard", icon: Gauge },
  { id: "skills", label: "Skill Gap Analysis", icon: GraduationCap },
  { id: "intelligence", label: "Career Intelligence", icon: BrainCircuit },
  { id: "roadmap", label: "Career Roadmap", icon: Route },
  { id: "learning", label: "Learning Studio", icon: BookOpen },
  { id: "interviews", label: "AI Career Coach", icon: MessageSquareText },
  { id: "documents", label: "My Documents", icon: FolderKanban },
  { id: "progress", label: "Progress & Weekly Tests", icon: CalendarDays },
  { id: "settings", label: "Privacy & Settings", icon: ShieldCheck },
];

const commands: CommandItem[] = [
  { id: "overview", label: "Dashboard", description: "See your profile, target, evidence, weekly work, and recommended next action.", keywords: "home overview", icon: Gauge },
  { id: "skills", label: "Skill Gap Analysis", description: "Record skills, evidence, and target-role priorities.", keywords: "proficiency assessment", icon: GraduationCap },
  { id: "intelligence", label: "Career Intelligence", description: "Review evidence-grounded career context and next steps.", keywords: "analysis paths strengths", icon: BrainCircuit },
  { id: "roadmap", label: "Career Roadmap", description: "Plan and complete practical learning tasks.", keywords: "tasks study plan", icon: Route },
  { id: "learning", label: "Learning Studio", description: "Search skills and prepare validated, reviewable curricula.", keywords: "course lesson curriculum quiz", icon: BookOpen },
  { id: "interviews", label: "AI Career Coach", description: "Practise interviews with text, supported voice, and evidence-aware feedback.", keywords: "coach behavioral technical communication", icon: MessageSquareText },
  { id: "documents", label: "My Documents", description: "Manage resume selection, review, and document status.", keywords: "files upload cv", icon: FolderKanban },
  { id: "progress", label: "Progress & Weekly Tests", description: "Schedule roadmap work, record time, and complete curated assessments.", keywords: "week quiz assessment calendar progress", icon: CalendarDays },
  { id: "settings", label: "Privacy & Settings", description: "Review data controls, export, and AI processing information.", keywords: "security privacy account", icon: ShieldCheck },
];

type WorkspaceSnapshot = {
  reviewedSkills: number;
  demonstratedSkills: number;
  profileSkills: number;
  resumeName: string;
  profileProjects: number;
  tasksTotal: number;
  tasksDone: number;
  nextTask: string;
  projectsTotal: number;
  projectsDone: number;
  practiceCount: number;
  weeklyHours: number;
  weeklyTasks: number;
  weeklyDone: number;
  weeklyPlannedMinutes: number;
  weeklyRecordedMinutes: number;
  nextWeeklyActivity: string;
  recentActivity: string[];
};

const EMPTY_SNAPSHOT: WorkspaceSnapshot = { reviewedSkills: 0, demonstratedSkills: 0, profileSkills: 0, resumeName: "", profileProjects: 0, tasksTotal: 0, tasksDone: 0, nextTask: "", projectsTotal: 0, projectsDone: 0, practiceCount: 0, weeklyHours: 0, weeklyTasks: 0, weeklyDone: 0, weeklyPlannedMinutes: 0, weeklyRecordedMinutes: 0, nextWeeklyActivity: "", recentActivity: [] };

function readWorkspaceSnapshot(ownerKey: string, role: string, canonical?: TwinSourceState | null): WorkspaceSnapshot {
  if (!ownerKey) return EMPTY_SNAPSHOT;
  const snapshot: WorkspaceSnapshot = { ...EMPTY_SNAPSHOT, recentActivity: [] };
  try {
    const rawProfile = window.localStorage.getItem(`careertwin-profile-wizard:${ownerKey}`);
    const parsedProfile = careerProfileSchema.safeParse(rawProfile ? JSON.parse(rawProfile) : null);
    if (parsedProfile.success) {
      snapshot.profileSkills = parsedProfile.data.skills.length;
      snapshot.resumeName = parsedProfile.data.resume.fileName;
      snapshot.profileProjects = parsedProfile.data.projects.length;
    }
  } catch { /* Invalid drafts are repaired in onboarding. */ }
  try {
    const rawEvidence = canonical ? null : window.localStorage.getItem(`careertwin-skill-evidence-v1:${ownerKey}`);
    const evidence = canonical?.evidence ?? (rawEvidence ? JSON.parse(rawEvidence) as Record<string, { records?: Record<string, { status?: string; evidence?: string }> }> : {});
    const records = evidence[role]?.records ?? {};
    snapshot.reviewedSkills = Object.values(records).filter((record) => record.status && record.status !== "not-reviewed").length;
    snapshot.demonstratedSkills = Object.values(records).filter((record) => record.status === "demonstrated" && record.evidence?.trim()).length;
  } catch { /* Corrupt optional evidence is ignored rather than represented as fact. */ }
  try {
    const rawDevelopment = canonical ? null : window.localStorage.getItem(`careertwin-development-v1:${ownerKey}`);
    const development = canonical?.development ?? (rawDevelopment ? JSON.parse(rawDevelopment) as { tasks?: Array<{ title?: string; done?: boolean; status?: string }>; projects?: Array<{ title?: string; status?: string }>; practice?: Array<{ practicedAt?: string }> } : {});
    const tasks = Array.isArray(development.tasks) ? development.tasks : [];
    const projects = Array.isArray(development.projects) ? development.projects : [];
    snapshot.tasksTotal = tasks.length;
    snapshot.tasksDone = tasks.filter((task) => task.done === true).length;
    snapshot.nextTask = tasks.find((task) => task.done !== true)?.title?.trim() ?? "";
    snapshot.projectsTotal = projects.length;
    snapshot.projectsDone = projects.filter((project) => project.status === "complete").length;
    snapshot.practiceCount = Array.isArray(development.practice) ? development.practice.length : 0;
    snapshot.recentActivity.push(...tasks.filter((task) => task.done === true || task.status === "complete").slice(-2).map((task) => `Completed roadmap task: ${task.title || "Untitled task"}`));
    snapshot.recentActivity.push(...projects.filter((project) => project.status === "complete").slice(-2).map((project) => `Completed project: ${project.title || "Untitled project"}`));
    if (snapshot.practiceCount) snapshot.recentActivity.push(`Saved ${snapshot.practiceCount} interview practice ${snapshot.practiceCount === 1 ? "answer" : "answers"}`);
  } catch { /* Corrupt optional progress is ignored rather than represented as fact. */ }
  try {
    const rawWeekly = canonical ? null : window.localStorage.getItem(`careertwin-weekly-v1:${ownerKey}`);
    const weekly = canonical?.weekly ?? (rawWeekly ? JSON.parse(rawWeekly) as { settings?: { hours?: number }; activities?: Array<{ title?: string; plannedDate?: string; estimatedMinutes?: number; actualMinutes?: number; status?: string }> } : {});
    const activities = Array.isArray(weekly.activities) ? weekly.activities : [];
    const now = new Date(); const monday = new Date(now); monday.setDate(now.getDate() - ((now.getDay() + 6) % 7)); monday.setHours(0, 0, 0, 0);
    const current = activities.filter((activity) => activity.plannedDate && new Date(`${activity.plannedDate}T12:00:00`) >= monday);
    snapshot.weeklyHours = typeof weekly.settings?.hours === "number" ? weekly.settings.hours : 0;
    snapshot.weeklyTasks = current.length;
    snapshot.weeklyDone = current.filter((activity) => activity.status === "complete").length;
    snapshot.weeklyPlannedMinutes = current.reduce((sum, activity) => sum + (activity.estimatedMinutes ?? 0), 0);
    snapshot.weeklyRecordedMinutes = current.filter((activity) => activity.status === "complete").reduce((sum, activity) => sum + (activity.actualMinutes ?? 0), 0);
    snapshot.nextWeeklyActivity = current.filter((activity) => activity.status !== "complete").sort((a,b)=>(a.plannedDate ?? "").localeCompare(b.plannedDate ?? ""))[0]?.title?.trim() ?? "";
    snapshot.recentActivity.push(...current.filter((activity) => activity.status === "complete").slice(-2).map((activity) => `Completed weekly activity: ${activity.title || "Untitled activity"}`));
  } catch { /* Corrupt optional weekly data is ignored rather than represented as fact. */ }
  return snapshot;
}

function Overview({ role, profileCompletion, displayName, ownerKey, twin, twinSource, onOpen }: { role: string; profileCompletion: number | null; displayName: string; ownerKey: string; twin: TwinOutput | null; twinSource: TwinSourceState | null; onOpen: (view: View) => void }) {
  const router = useRouter();
  const [snapshot, setSnapshot] = useState<WorkspaceSnapshot>(EMPTY_SNAPSHOT);
  useEffect(() => {
    const refresh = () => setSnapshot(readWorkspaceSnapshot(ownerKey, role, twinSource));
    const task = window.setTimeout(refresh, 0);
    window.addEventListener("careertwin:evidence-saved", refresh);
    window.addEventListener("careertwin:development-saved", refresh);
    window.addEventListener("careertwin:weekly-saved", refresh);
    window.addEventListener("storage", refresh);
    return () => { window.clearTimeout(task); window.removeEventListener("careertwin:evidence-saved", refresh); window.removeEventListener("careertwin:development-saved", refresh); window.removeEventListener("careertwin:weekly-saved", refresh); window.removeEventListener("storage", refresh); };
  }, [ownerKey, role, twinSource]);

  const stages = [
    { label: "Choose a target role", complete: Boolean(role), target: "onboarding" as const },
    { label: "Confirm current skills", complete: snapshot.reviewedSkills > 0, target: "skills" as const },
    { label: "Create a practical roadmap", complete: snapshot.tasksTotal > 0, target: "roadmap" as const },
    { label: "Build evidence through projects", complete: snapshot.projectsTotal + snapshot.profileProjects > 0, target: "roadmap" as const },
    { label: "Practise role-specific interviews", complete: snapshot.practiceCount > 0, target: "interviews" as const },
  ];
  const nextStage = stages.find((stage) => !stage.complete);
  const focusTitle = twin?.recommendedNextAction.title ?? (!role ? "Choose the role you want to work towards." : snapshot.reviewedSkills === 0 ? "Review the first skill for your target role." : snapshot.tasksTotal === 0 ? "Create your first practical roadmap." : snapshot.nextTask ? snapshot.nextTask : snapshot.practiceCount === 0 ? "Practise one role-specific interview answer." : "Review your evidence and choose the next useful step.");
  const focusView: View | "onboarding" = !role ? "onboarding" : snapshot.reviewedSkills === 0 ? "skills" : snapshot.tasksTotal === 0 || snapshot.nextTask ? "roadmap" : snapshot.practiceCount === 0 ? "interviews" : "skills";
  const focusAction = !role ? "Choose a career" : snapshot.reviewedSkills === 0 ? "Review my skills" : snapshot.tasksTotal === 0 ? "Build my roadmap" : snapshot.nextTask ? "Continue this task" : snapshot.practiceCount === 0 ? "Start interview practice" : "Review evidence";
  return (
    <div className="space-y-5">
      {/* 3D Robot Command Header from clone */}
      <div className="command flex flex-col md:flex-row items-center justify-between gap-6 rounded-3xl border border-ink/8 bg-white p-6 md:p-8">
        <div className="command-copy max-w-xl">
          <p className="dash-eyebrow text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-2">
            <span className="live-dot size-2 rounded-full bg-accent animate-pulse" aria-hidden="true" />
            Career command centre
          </p>
          <h1 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight text-ink">Make your next move visible.</h1>
          <p className="mt-2 text-sm text-slate">A private place to turn real evidence into focused, reviewable action.</p>
        </div>
        <div className="command-visual relative w-48 h-48 md:w-56 md:h-56 shrink-0 flex items-center justify-center" style={{ minWidth: "192px", minHeight: "192px" }}>
          <div className="visual-glow absolute inset-2 rounded-full bg-accent/20 blur-xl -z-10" aria-hidden="true" />
          <RobotCharacter pose="dash" canvasId="dashRobot" />
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("careertwin:cheer"))}
            className="robot-chip absolute bottom-1 right-2 inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-white/95 backdrop-blur px-3 py-1 text-xs font-bold text-[#2c1170] shadow-sm transition hover:bg-white hover:scale-105 cursor-pointer z-10"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M7 11V7a2 2 0 1 1 4 0v3" />
              <path d="M11 10V5.5a2 2 0 1 1 4 0V10" />
              <path d="M15 10.5V8a2 2 0 1 1 4 0v6a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6v-2a2 2 0 1 1 4 0" />
            </svg>
            Say hi
          </button>
        </div>
      </div>

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-ink/8 bg-white px-5 py-4">
        <div><p className="text-xs text-slate">Welcome back{displayName ? `, ${displayName}` : ""}</p><h2 className="mt-1 text-lg font-bold">{role || "Build your Career Twin"}{snapshot.weeklyHours ? ` · ${snapshot.weeklyHours} learning hours/week` : ""}</h2></div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/onboarding" className="button-secondary px-3 py-2">Edit profile</Link>
          <button type="button" onClick={()=>onOpen("roadmap")} className="button-secondary px-3 py-2">View roadmap</button>
          <button type="button" onClick={()=>onOpen("learning")} className="button-secondary px-3 py-2">Learning Studio</button>
          <button type="button" onClick={()=>onOpen("progress")} className="button-primary px-3 py-2">Start weekly test</button>
        </div>
        {profileCompletion !== null && <div className="w-full"><div className="flex justify-between text-xs"><span className="text-slate">Profile completion</span><strong>{profileCompletion}%</strong></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-app"><div className="h-full rounded-full bg-[linear-gradient(90deg,#6547f1,#a127ec)]" style={{width:`${profileCompletion}%`}}/></div></div>}
      </section>
      <section className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <article className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(125deg,#5542e8_0%,#6d3df5_58%,#a125eb_125%)] p-6 text-white shadow-[0_22px_50px_rgba(24,48,52,.14)] md:p-8">
          <div className="relative z-10 max-w-2xl">
            <p className="font-mono text-[10px] uppercase tracking-[.18em] text-mint">Next recommended action</p>
            <h2 className="mt-4 max-w-xl text-2xl font-semibold tracking-[-.035em] md:text-3xl">{focusTitle}</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/62">
              {role ? `This recommendation uses only the profile and activity saved for your ${role} workspace. It updates as you review evidence and complete tasks.` : "A target role gives your evidence review, roadmap, and practice a clear reference point. You can change it whenever your goal changes."}
            </p>
            {focusView === "onboarding" ? (
              <Link href="/onboarding" className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#2c1170] shadow-md transition hover:-translate-y-0.5">{focusAction}<ArrowRight size={15}/></Link>
            ) : (
              <button onClick={() => onOpen(focusView)} className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#2c1170] shadow-md transition hover:-translate-y-0.5">{focusAction}<ArrowRight size={15}/></button>
            )}
          </div>
          <div className="absolute -bottom-24 -right-16 size-64 rounded-full border-[42px] border-white/[.055]" /><div className="absolute -right-8 top-0 h-px w-2/3 bg-gradient-to-l from-mint/50 to-transparent" />
        </article>

        <article className="rounded-[26px] border border-ink/10 bg-white p-6">
          <div className="flex items-start justify-between">
            <div><p className="label">Career target</p><h3 className="mt-3 text-xl font-bold tracking-[-.03em]">{role || "Not selected"}</h3></div>
            <span className="grid size-11 place-items-center rounded-2xl bg-mint/35 text-ink"><BriefcaseBusiness size={20} /></span>
          </div>
          <p className="mt-5 text-sm leading-6 text-slate">{role ? twin ? `Secure Twin updated ${new Date(twin.calculatedAt).toLocaleString()}.` : "Profile loaded; secure Twin state is unavailable." : "Complete the first onboarding step to set your direction."}</p>
          {twin && <div className="mt-4 grid grid-cols-2 gap-2"><div className="rounded-xl bg-app p-3"><span className="text-[10px] text-slate">Evidence coverage</span><strong className="mt-1 block text-sm">{twin.evidenceCoverage.score === null ? "Not available" : `${twin.evidenceCoverage.score}%`}</strong></div><div className="rounded-xl bg-app p-3"><span className="text-[10px] text-slate">Priority gap</span><strong className="mt-1 block truncate text-sm">{twin.prioritizedGaps[0]?.skill ?? "None recorded"}</strong></div></div>}
          {twin && <p className="mt-3 text-[11px] leading-5 text-slate">{twin.evidenceCoverage.meaning}</p>}
          <Link href="/onboarding" className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-accent hover:underline">{role ? "Edit target" : "Set target"}<ChevronRight size={14}/></Link>
        </article>
      </section>

      <section className="rounded-[26px] border border-ink/10 bg-white p-5 md:p-7"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="label">Weekly learning summary</p><h3 className="mt-2 text-xl font-bold tracking-[-.03em]">{snapshot.nextWeeklyActivity ? `Next: ${snapshot.nextWeeklyActivity}` : "Plan the next useful week"}</h3><p className="mt-2 text-sm text-slate">Recorded activity only—opening a page never increases progress.</p></div><button type="button" onClick={()=>onOpen("progress")} className="button-secondary">Open weekly plan<ArrowRight size={14}/></button></div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[["Weekly target",snapshot.weeklyHours?`${snapshot.weeklyHours} hours`:"Not set"],["Time recorded",`${snapshot.weeklyRecordedMinutes}/${snapshot.weeklyPlannedMinutes} min`],["Tasks complete",`${snapshot.weeklyDone}/${snapshot.weeklyTasks}`],["Upcoming test",role?"Ready to start":"Choose a target role"]].map(([label,value])=><div key={label} className="rounded-2xl bg-app p-4"><span className="text-xs text-slate">{label}</span><strong className="mt-1 block text-sm">{value}</strong></div>)}</div></section>

      <section className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
        <article className="rounded-[26px] border border-ink/10 bg-white p-6 md:p-7">
          <div className="flex items-center justify-between"><div><p className="label">Career journey</p><h3 className="mt-2 text-xl font-bold tracking-[-.03em]">From current evidence to role readiness</h3></div><span className="hidden rounded-full bg-cream px-3 py-1.5 text-xs font-semibold text-slate sm:block">No score until assessed</span></div>
          <div className="relative mt-8 space-y-1">
            <div className="absolute bottom-5 left-[15px] top-5 w-px bg-ink/12" />
            {stages.map((item, index) => {
              const isNext = nextStage === item;
              return <button type="button" onClick={() => item.target === "onboarding" ? router.push("/onboarding") : onOpen(item.target)} key={item.label} className="relative flex w-full items-center gap-4 rounded-2xl px-1 py-3 text-left transition hover:bg-app/60">
                <span className={`relative z-10 grid size-8 shrink-0 place-items-center rounded-full border ${item.complete ? "border-accent bg-accent text-white" : isNext ? "border-accent bg-white text-accent" : "border-ink/12 bg-cream text-slate"}`}>
                  {item.complete ? <CheckCircle2 size={16}/> : <span className="text-[10px] font-bold">{index + 1}</span>}
                </span>
                <div className="flex-1"><p className={`text-sm font-semibold ${!item.complete && !isNext ? "text-slate" : "text-ink"}`}>{item.label}</p><p className="mt-0.5 text-xs text-slate">{item.complete ? "Recorded in your workspace" : isNext ? "Recommended next" : "Available when useful"}</p></div>
              </button>;
            })}
          </div>
        </article>

        <article className="rounded-[26px] border border-ink/10 bg-white p-6 md:p-7">
          <p className="label">Profile evidence</p><h3 className="mt-2 text-xl font-bold tracking-[-.03em]">What CareerTwin knows</h3>
          <div className="mt-6 divide-y divide-ink/8 rounded-2xl border border-ink/8">
            {[
              ["Target role", role || "Needs input", Boolean(role)],
              ["Skills reviewed", snapshot.reviewedSkills ? `${snapshot.reviewedSkills} reviewed · ${snapshot.demonstratedSkills} with evidence` : snapshot.profileSkills ? `${snapshot.profileSkills} profile skills · evidence not reviewed` : "Not reviewed", snapshot.reviewedSkills > 0],
              ["Resume", snapshot.resumeName || "Not uploaded", Boolean(snapshot.resumeName)],
              ["Projects", snapshot.projectsTotal + snapshot.profileProjects ? `${snapshot.projectsTotal + snapshot.profileProjects} recorded · ${snapshot.projectsDone} complete` : "No evidence project added", snapshot.projectsTotal + snapshot.profileProjects > 0],
              ["Roadmap", snapshot.tasksTotal ? `${snapshot.tasksDone}/${snapshot.tasksTotal} steps complete` : "No learning steps", snapshot.tasksTotal > 0],
              ["Interview practice", snapshot.practiceCount ? `${snapshot.practiceCount} saved answer${snapshot.practiceCount === 1 ? "" : "s"}` : "No practice saved", snapshot.practiceCount > 0],
            ].map(([label, value, ready]) => <div key={String(label)} className="flex items-center justify-between gap-4 px-4 py-3.5"><span className="text-sm font-medium text-slate">{label}</span><span className={`text-right text-xs font-bold ${ready ? "text-accent" : "text-ink"}`}>{value}</span></div>)}
          </div>
          <p className="mt-4 text-xs leading-5 text-slate">CareerTwin does not treat missing information as proof that you lack a skill.</p>
        </article>
      </section>

      <section className="rounded-[26px] border border-ink/10 bg-white p-6 md:p-7"><div className="flex items-center justify-between gap-4"><div><p className="label">Recent activity</p><h3 className="mt-2 text-xl font-bold tracking-[-.03em]">Your recorded work</h3></div><button type="button" onClick={()=>onOpen("progress")} className="text-sm font-bold text-accent">View progress</button></div>{snapshot.recentActivity.length?<ul className="mt-5 divide-y divide-ink/8 rounded-2xl border border-ink/8">{snapshot.recentActivity.slice(-6).reverse().map((activity,index)=><li key={`${activity}-${index}`} className="flex items-center gap-3 px-4 py-3 text-sm"><CheckCircle2 size={16} className="shrink-0 text-accent"/><span>{activity}</span></li>)}</ul>:<div className="mt-5 rounded-2xl border border-dashed border-ink/15 p-6 text-center"><p className="text-sm text-slate">No completed lessons, tests, projects, or interview sessions are recorded yet.</p><button type="button" onClick={()=>onOpen("roadmap")} className="mt-3 text-sm font-bold text-accent">Open your roadmap</button></div>}</section>
    </div>
  );
}

type PrivacyPreferences = { allowProfileContext: boolean; allowHistoryPersonalization: boolean; retainTranscripts: boolean };
const DEFAULT_PRIVACY: PrivacyPreferences = { allowProfileContext: false, allowHistoryPersonalization: false, retainTranscripts: true };
function SettingsModule() {
  const [preferences,setPreferences]=useState(DEFAULT_PRIVACY); const [loaded,setLoaded]=useState(false); const [saving,setSaving]=useState(false); const [message,setMessage]=useState("");
  useEffect(()=>{const controller=new AbortController();void fetch("/api/settings",{signal:controller.signal}).then(async response=>{const payload=await response.json() as {data?:PrivacyPreferences;error?:{message?:string}};if(!response.ok||!payload.data){setMessage(payload.error?.message??"Privacy settings could not be loaded.");return}setPreferences(payload.data)}).catch((error)=>{if(error instanceof Error&&error.name!=="AbortError")setMessage("Privacy settings could not be loaded.")}).finally(()=>setLoaded(true));return()=>controller.abort()},[]);
  async function save(){setSaving(true);setMessage("");try{const response=await fetch("/api/settings",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(preferences)});const payload=await response.json() as {error?:{message?:string}};if(!response.ok){setMessage(payload.error?.message??"Privacy settings were not saved.");return}setMessage("Privacy settings saved securely.")}catch{setMessage("Privacy settings were not saved. Try again.")}finally{setSaving(false)}}
  async function exportData(){setMessage("");try{const response=await fetch("/api/account/export");if(!response.ok){const payload=await response.json() as {error?:{message?:string}};setMessage(payload.error?.message??"Your data export could not be prepared.");return}const url=URL.createObjectURL(await response.blob());const anchor=document.createElement("a");anchor.href=url;anchor.download=`careertwin-export-${new Date().toISOString().slice(0,10)}.json`;anchor.click();URL.revokeObjectURL(url);setMessage("Your data export was prepared.")}catch{setMessage("Your data export could not be prepared.")}}
  if(!loaded)return <section className="rounded-2xl border border-ink/8 bg-white p-7" aria-busy="true">Loading privacy settings…</section>;
  const options:Array<[keyof PrivacyPreferences,string,string]>=[
    ["retainTranscripts","Retain submitted interview transcripts","When off, new answer text is evaluated but not retained, so reassessment of that answer is unavailable. Audio is never retained by default."],
  ];
  return <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]"><section className="rounded-2xl border border-ink/8 bg-white p-7"><p className="label">Privacy & settings</p><h2 className="mt-3 text-2xl font-bold">Control how your private career data is used.</h2><div className="mt-6 space-y-3">{options.map(([key,label,description])=><label key={key} className="flex cursor-pointer items-start justify-between gap-5 rounded-2xl border border-ink/8 p-4"><span><strong className="block text-sm">{label}</strong><span className="mt-1 block text-xs leading-5 text-slate">{description}</span></span><input type="checkbox" checked={preferences[key]} onChange={(event)=>setPreferences(current=>({...current,[key]:event.target.checked}))} className="mt-1 size-4"/></label>)}</div><div className="mt-6 flex flex-wrap gap-3"><button type="button" onClick={()=>void save()} disabled={saving} className="button-primary disabled:opacity-40"><Save size={15}/>{saving?"Saving…":"Save preferences"}</button><button type="button" onClick={()=>void exportData()} className="button-secondary"><Download size={15}/>Export my data</button></div>{message&&<p role="status" className="mt-4 rounded-xl bg-app p-3 text-sm">{message}</p>}</section><aside className="rounded-2xl border border-violet-100 bg-violet-50/60 p-6"><ShieldCheck className="text-accent" size={22}/><h3 className="mt-6 font-bold">Privacy behavior</h3><p className="mt-2 text-sm leading-6 text-slate">Settings are saved against your authenticated account. AI profile/history personalization is not exposed until its authorization flow is fully implemented, and unavailable providers never receive your data.</p></aside></div>;
}

function WorkspaceModule({ view, onOpen }: { view: "documents"; onOpen: (view: View)=>void }) {
  const content = {
    documents: { title: "My Documents", text: "Manage resume details from your profile wizard. Secure upload, reviewed extraction, replacement, and deletion appear only when their backend operations are available.", action: "Open resume profile step", target: "onboarding" },
  }[view];
  return <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]"><section className="rounded-2xl border border-ink/8 bg-white p-7"><p className="label">CareerTwin workspace</p><h2 className="mt-3 text-2xl font-bold">{content.title}</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-slate">{content.text}</p>{content.target==="onboarding"?<Link href="/onboarding" className="button-primary mt-7">{content.action}<ArrowRight size={15}/></Link>:<button onClick={()=>onOpen(content.target as View)} className="button-primary mt-7">{content.action}<ArrowRight size={15}/></button>}</section><aside className="rounded-2xl border border-violet-100 bg-violet-50/60 p-6"><ShieldCheck className="text-accent" size={22}/><h3 className="mt-6 font-bold">Honest system state</h3><p className="mt-2 text-sm leading-6 text-slate">CareerTwin does not display invented analysis, document status, profile completion, market claims, or readiness scores. Missing data is presented as a next action.</p></aside></div>;
}

export function CareerWorkspace({ ownerKey }: { ownerKey?: string }) {
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const storageOwnerKey = ownerKey ?? user?.id ?? "";
  const [view, setView] = useState<View>("overview");
  const [role, setRole] = useState("");
  const [profileCompletion, setProfileCompletion] = useState<number | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [twin, setTwin] = useState<TwinOutput | null>(null);
  const [twinSource, setTwinSource] = useState<TwinSourceState | null>(null);
  const [twinLoadState, setTwinLoadState] = useState<"loading" | "ready" | "fallback">("loading");
  const [syncState, setSyncState] = useState<TwinSyncState | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!storageOwnerKey) return;
    const scopedRoleKey = `careertwin-role-draft:${storageOwnerKey}`;
    const anonymousRole = window.localStorage.getItem("careertwin-role-draft");
    let saved = window.localStorage.getItem(scopedRoleKey);
    if (!saved && anonymousRole) {
      saved = anonymousRole;
      window.localStorage.setItem(scopedRoleKey, anonymousRole);
      window.localStorage.removeItem("careertwin-role-draft");
    }
    const task = window.setTimeout(() => setRole(saved ?? ""), 0);
    return () => window.clearTimeout(task);
  }, [storageOwnerKey]);

  useEffect(() => {
    const requestedView = searchParams.get("view");
    if (!navigation.some((item) => item.id === requestedView)) return;
    const task = window.setTimeout(() => setView(requestedView as View), 0);
    return () => window.clearTimeout(task);
  }, [searchParams]);

  useEffect(() => {
    if (!storageOwnerKey) return;
    const controller = new AbortController();
    void fetch("/api/profile", { signal: controller.signal }).then(async response => {
      if (!response.ok) return;
      const payload = await response.json() as { data?: { profile_completion?: number; profile_data?: { personal?: { fullName?: string }; interests?: { targetRole?: string } } } | null };
      const saved = payload.data;
      if (!saved) return;
      setProfileCompletion(saved.profile_completion ?? 0);
      setDisplayName(saved.profile_data?.personal?.fullName ?? "");
      const remoteRole = saved.profile_data?.interests?.targetRole?.trim();
      if (remoteRole) { setRole(remoteRole); window.localStorage.setItem(`careertwin-role-draft:${storageOwnerKey}`, remoteRole); }
    }).catch(() => undefined);
    return () => controller.abort();
  }, [storageOwnerKey]);

  useEffect(() => {
    if (!storageOwnerKey) return;
    const controller = new AbortController();
    void fetch("/api/twin", { signal: controller.signal }).then(async (response) => {
      const payload = await response.json() as { data?: { source: TwinSourceState; twin: TwinOutput }; error?: { message?: string } };
      if (!response.ok || !payload.data) { setTwinLoadState("fallback"); setSyncState({ status: "error", message: payload.error?.message ?? "Secure Career Twin sync is unavailable." }); return; }
      const { source, twin: savedTwin } = payload.data;
      window.localStorage.setItem(`careertwin-skill-evidence-v1:${storageOwnerKey}`, JSON.stringify(source.evidence));
      window.localStorage.setItem(`careertwin-development-v1:${storageOwnerKey}`, JSON.stringify(source.development));
      window.localStorage.setItem(`careertwin-weekly-v1:${storageOwnerKey}`, JSON.stringify(source.weekly));
      setTwin(savedTwin); setTwinSource(source); setTwinLoadState("ready"); setSyncState({ status: "saved", message: "Secure Career Twin loaded." });
      window.dispatchEvent(new Event("careertwin:evidence-saved")); window.dispatchEvent(new Event("careertwin:development-saved")); window.dispatchEvent(new Event("careertwin:weekly-saved"));
    }).catch((error) => { if (error instanceof Error && error.name !== "AbortError") { setTwinLoadState("fallback"); setSyncState({ status: "error", message: "Secure Career Twin sync is unavailable. Browser drafts remain available." }); } });
    const syncListener = (event: Event) => { const detail = (event as CustomEvent<TwinSyncState>).detail; setSyncState(detail); if (detail.status === "saved") void fetch("/api/twin").then((response)=>response.ok?response.json():null).then((payload)=>{ if(payload?.data?.twin){setTwin(payload.data.twin as TwinOutput);setTwinSource(payload.data.source as TwinSourceState);} }).catch(()=>undefined); };
    window.addEventListener("careertwin:sync-state", syncListener);
    return () => { controller.abort(); window.removeEventListener("careertwin:sync-state", syncListener); };
  }, [storageOwnerKey]);

  useEffect(() => {
    function openCommands(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((value) => !value);
      }
    }
    window.addEventListener("keydown", openCommands);
    return () => window.removeEventListener("keydown", openCommands);
  }, []);

  function changeView(next: View) {
    setView(next);
    setMobileOpen(false);
    setCommandOpen(false);
  }

  function preloadView(next: View) {
    if (next === "skills") void import("./skill-evidence");
  }

  const active = navigation.find((item) => item.id === view)!;

  if (!ownerKey && !isLoaded) return <main className="grid min-h-dvh place-items-center bg-app text-ink"><div className="text-center"><div className="mx-auto size-10 animate-pulse rounded-2xl bg-mint"/><p className="mt-4 text-sm font-semibold text-slate">Loading your private workspace…</p></div></main>;

  return <div className="career-dashboard min-h-screen bg-[#f5f6fb] text-ink">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[280px] flex-col overflow-hidden border-r border-ink/10 bg-[#f8f7f2] p-5 text-ink shadow-[18px_0_60px_rgba(31,46,41,.05)] lg:flex">
      <div className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full border-[44px] border-ink/[.025]" />
      <div className="relative border-b border-ink/10 px-1 pb-5 pt-2"><Brand /></div>
      <p className="relative mt-7 px-3 font-mono text-[9px] font-bold uppercase tracking-[.2em] text-slate">Workspace</p>
      <nav className="relative mt-3 space-y-1" aria-label="Career workspace">
        {navigation.map((item) => <button key={item.id} onMouseEnter={() => preloadView(item.id)} onFocus={() => preloadView(item.id)} onClick={() => changeView(item.id)} className={`relative flex w-full items-center gap-3 border px-3 py-2.5 text-sm font-semibold transition ${view === item.id ? "border-violet-200 bg-violet-50 text-accent shadow-[0_8px_20px_rgba(109,61,245,.08)] before:absolute before:inset-y-2.5 before:left-0 before:w-[3px] before:bg-accent" : "border-transparent text-slate hover:border-ink/10 hover:bg-white hover:text-ink"}`} aria-current={view === item.id ? "page" : undefined}><span className={`grid size-7 place-items-center ${view === item.id ? "bg-white text-accent" : "text-slate"}`}><item.icon size={16}/></span>{item.label}</button>)}
      </nav>
      <div className="relative mt-auto space-y-2 border-t border-ink/10 pt-4">
        <Link href="/onboarding" className="flex items-center gap-3 border border-transparent px-3 py-2.5 text-sm font-semibold text-slate transition hover:border-ink/10 hover:bg-white hover:text-ink"><CircleUserRound size={17}/>Career profile</Link>
        <div className="mt-3 border border-ink/10 bg-white/70 p-4"><div className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-accent"/><p className="text-xs font-bold text-ink">Private workspace</p></div><p className="mt-2 text-[11px] leading-[1.55] text-slate">{syncState?.status === "saved" ? "Secure database sync is connected for this workspace." : "Browser drafts remain available while secure database sync is unavailable."}</p></div>
      </div>
    </aside>

    <div className="lg:pl-[280px]">
      <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-ink/[.07] bg-[#f2f4f1]/82 px-4 backdrop-blur-2xl md:px-7 lg:px-10">
        <div className="flex items-center gap-3"><button onClick={() => setMobileOpen(true)} className="grid size-10 place-items-center rounded-xl border border-ink/10 bg-white shadow-sm lg:hidden" aria-label="Open workspace navigation"><Menu size={18}/></button><div><div className="flex items-center gap-2"><span className="hidden size-1.5 rounded-full bg-accent sm:block"/><p className="text-sm font-bold tracking-[-.015em]">{active.label}</p></div><p className="hidden text-[11px] text-slate sm:block">Private career workspace</p></div></div>
        <div className="flex items-center gap-2"><button type="button" onClick={()=>setCommandOpen(true)} className="group inline-flex min-h-10 items-center gap-2 rounded-full border border-ink/10 bg-white/75 px-3 text-xs font-bold text-slate shadow-[0_8px_24px_rgba(24,48,52,.045)] transition hover:-translate-y-0.5 hover:border-accent/20 hover:bg-white hover:text-ink" aria-label="Open quick navigation"><Search size={14}/><span className="hidden md:inline">Quick find</span><kbd className="hidden rounded-md border border-ink/10 bg-cream/60 px-1.5 py-0.5 font-mono text-[9px] text-slate lg:inline">⌘K</kbd></button><Link href="/onboarding" className="group inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/80 px-3.5 py-2 text-xs font-bold shadow-[0_8px_24px_rgba(24,48,52,.06)] transition hover:-translate-y-0.5 hover:border-accent/25 hover:bg-white"><span className="grid size-6 place-items-center rounded-full bg-mint/35 text-accent"><CircleUserRound size={13}/></span><span className="hidden max-w-36 truncate sm:inline">{role || "Complete profile"}</span></Link></div>
      </header>

      <main className="mx-auto max-w-[1320px] px-4 py-7 md:px-7 lg:px-10 lg:py-10">
        <div className="mb-8 flex items-end justify-between gap-5"><div><p className="label">{view === "overview" ? "Career command centre" : "Plan · practise · prove"}</p><h1 className="mt-3 text-[clamp(1.75rem,3vw,2.6rem)] font-[720] leading-[1.05] tracking-[-.055em]">{view === "overview" ? "Make your next move visible." : active.label}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate">{view === "overview" ? "A private place to turn real evidence into focused, reviewable action." : "Review and update only the information you record—without invented scores or claims."}</p></div>{view !== "overview" && <button onClick={() => changeView("overview")} className="hidden rounded-full border border-ink/9 bg-white/80 px-4 py-2 text-sm font-bold text-accent shadow-[0_8px_22px_rgba(24,48,52,.05)] transition hover:-translate-y-0.5 hover:border-accent/25 hover:bg-white sm:block">Back to overview</button>}</div>
        {syncState && <div role="status" className={`mb-5 rounded-xl border px-4 py-3 text-sm ${syncState.status === "error" ? "border-red-200 bg-red-50 text-red-800" : syncState.status === "saving" ? "border-amber-200 bg-amber-50 text-amber-900" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>{syncState.message}</div>}
        <AnimatePresence mode="wait">
          <motion.div key={view} initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -4 }} transition={{ duration: .2 }}>
            {twinLoadState === "loading" && view !== "overview" ? <ModuleLoading/> : view === "overview" ? <Overview role={role} profileCompletion={profileCompletion} displayName={displayName} ownerKey={storageOwnerKey} twin={twin} twinSource={twinSource} onOpen={changeView}/> : view === "skills" ? <SkillEvidence role={role} ownerKey={storageOwnerKey} onOpenProgress={()=>changeView("progress")}/> : view === "roadmap" || view === "interviews" ? <DevelopmentHub view={view} role={role} ownerKey={storageOwnerKey} onOpen={(next)=>changeView(next === "interviews" ? "interviews" : next === "progress" ? "progress" : "roadmap")}/> : view === "intelligence" ? <CareerIntelligence role={role} ownerKey={storageOwnerKey} onOpenRoadmap={()=>changeView("roadmap")}/> : view === "learning" ? <LearningStudio role={role} initialSkill={searchParams.get("skill") ?? undefined}/> : view === "progress" ? <WeeklyPlanner ownerKey={storageOwnerKey} role={role} onOpenRoadmap={()=>changeView("roadmap")}/> : view === "settings" ? <SettingsModule/> : <WorkspaceModule view="documents" onOpen={changeView}/>} 
          </motion.div>
        </AnimatePresence>
      </main>
    </div>

    <AnimatePresence>{mobileOpen && <><motion.button initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-40 bg-ink/25 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close workspace navigation overlay"/><motion.aside initial={reduceMotion ? false : {x:"-100%"}} animate={{x:0}} exit={{x:"-100%"}} transition={{duration:.22,ease:[.22,1,.36,1]}} className="fixed inset-y-0 left-0 z-50 w-[min(310px,88vw)] bg-[#f8f7f2] p-5 text-ink shadow-2xl lg:hidden"><div className="flex items-center justify-between border-b border-ink/10 px-1 pb-5 pt-2"><Brand/><button onClick={() => setMobileOpen(false)} className="grid size-9 place-items-center text-slate hover:bg-white hover:text-ink" aria-label="Close workspace navigation"><X size={18}/></button></div><p className="mt-8 px-3 font-mono text-[9px] font-bold uppercase tracking-[.2em] text-slate">Workspace</p><nav className="mt-3 space-y-1" aria-label="Mobile career workspace">{navigation.map((item)=><button key={item.id} onFocus={()=>preloadView(item.id)} onClick={()=>changeView(item.id)} className={`flex w-full items-center gap-3 border px-3 py-3 text-sm font-semibold ${view===item.id?"border-violet-200 bg-violet-50 text-accent":"border-transparent text-slate"}`}><span className={`grid size-7 place-items-center ${view===item.id?"bg-white text-accent":""}`}><item.icon size={16}/></span>{item.label}</button>)}</nav><div className="mt-6 border-t border-ink/10 pt-4"><Link href="/onboarding" className="flex items-center gap-3 px-3 py-3 text-sm font-semibold text-slate"><CircleUserRound size={17}/>Career profile</Link></div></motion.aside></>}</AnimatePresence>
    <CommandPalette open={commandOpen} items={commands} onClose={()=>setCommandOpen(false)} onSelect={(id)=>changeView(id as View)} />
    <Pip storageNamespace={storageOwnerKey} twin={twin} twinSource={twinSource} />
  </div>;
}
