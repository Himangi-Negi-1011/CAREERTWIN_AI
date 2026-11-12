"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Award,
  BookOpen,
  Bookmark,
  BrainCircuit,
  Briefcase,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleUserRound,
  Compass,
  Download,
  FileText,
  FolderGit2,
  FolderKanban,
  Gauge,
  Globe,
  GraduationCap,
  Layers,
  LogOut,
  Menu,
  MessageSquareText,
  Network,
  RefreshCw,
  Route,
  Save,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  Terminal,
  TrendingUp,
  User,
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
import { SkillEvidence } from "./skill-evidence";
import { MyCareerTwin } from "./my-career-twin";
import { LearningPathsView } from "./learning-paths";
import { CourseCatalogueView } from "./course-catalogue";
import { HandsOnLabsView } from "./hands-on-labs";
import { MockExamsHubView } from "./mock-exams-hub";
import { CertificateModal } from "./certificate-modal";
import { BeginnerGuide } from "./beginner-guide";
import { FeedbackDialog } from "./feedback-dialog";
import { CareerReadinessView } from "./career-readiness-view";
import { CareerOpportunitiesView } from "./career-opportunities-view";
import { ApplicationsTrackerView } from "./applications-tracker-view";
import { ResumeReviewView } from "./resume-review-view";
import { PortfolioView } from "./portfolio-view";
import { GuidedProjectsView } from "./guided-projects-view";
import { AchievementsView } from "./achievements-view";
import { SettingsHub } from "./settings-hub";
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

type View =
  | "overview"
  | "twin"
  | "readiness"
  | "paths"
  | "catalogue"
  | "learning"
  | "labs"
  | "mock-exams"
  | "projects"
  | "opportunities"
  | "applications"
  | "resume"
  | "portfolio"
  | "certificates"
  | "skills"
  | "intelligence"
  | "roadmap"
  | "interviews"
  | "progress"
  | "settings";

export type TopSectionId = "home" | "twin" | "learning" | "practice" | "projects" | "career" | "settings";

export interface PrimaryNavItem {
  id: TopSectionId;
  defaultView: View;
  label: string;
  icon: typeof Gauge;
  subViews: View[];
}

export const primaryNavigation: PrimaryNavItem[] = [
  {
    id: "home",
    defaultView: "overview",
    label: "Home",
    icon: Gauge,
    subViews: ["overview"],
  },
  {
    id: "twin",
    defaultView: "twin",
    label: "My Career Twin",
    icon: Sparkles,
    subViews: ["twin", "skills", "intelligence", "roadmap"],
  },
  {
    id: "learning",
    defaultView: "learning",
    label: "Learning",
    icon: BookOpen,
    subViews: ["learning", "paths", "catalogue"],
  },
  {
    id: "practice",
    defaultView: "mock-exams",
    label: "Practice & Assessments",
    icon: Award,
    subViews: ["mock-exams", "progress", "labs"],
  },
  {
    id: "projects",
    defaultView: "projects",
    label: "Projects & Portfolio",
    icon: FolderKanban,
    subViews: ["projects", "portfolio"],
  },
  {
    id: "career",
    defaultView: "opportunities",
    label: "Career Center",
    icon: Briefcase,
    subViews: ["opportunities", "applications", "resume", "certificates", "readiness", "interviews"],
  },
  {
    id: "settings",
    defaultView: "settings",
    label: "Profile & Settings",
    icon: ShieldCheck,
    subViews: ["settings"],
  },
];

const navigation: Array<{ id: View; label: string; icon: typeof Gauge }> = [
  { id: "overview", label: "Home", icon: Gauge },
  { id: "twin", label: "Career Twin Overview", icon: Sparkles },
  { id: "skills", label: "Skill Gap Analysis", icon: GraduationCap },
  { id: "intelligence", label: "Career Intelligence", icon: BrainCircuit },
  { id: "roadmap", label: "Career Roadmap", icon: Route },
  { id: "learning", label: "Learning Studio", icon: BookOpen },
  { id: "paths", label: "Learning Paths", icon: Compass },
  { id: "catalogue", label: "Course Catalogue", icon: Layers },
  { id: "mock-exams", label: "Mock Exams Hub", icon: Award },
  { id: "progress", label: "Weekly Tests & Progress", icon: CalendarDays },
  { id: "labs", label: "Hands-on Labs", icon: Terminal },
  { id: "projects", label: "Applied Projects", icon: FolderKanban },
  { id: "portfolio", label: "Student Portfolio", icon: Globe },
  { id: "opportunities", label: "Opportunities", icon: Briefcase },
  { id: "applications", label: "Applications Tracker", icon: Bookmark },
  { id: "resume", label: "Resume & ATS Review", icon: FileText },
  { id: "certificates", label: "Verified Credentials", icon: Award },
  { id: "readiness", label: "Career Readiness", icon: TrendingUp },
  { id: "interviews", label: "AI Interview Coach", icon: MessageSquareText },
  { id: "settings", label: "Profile & Settings", icon: ShieldCheck },
];

const commands: CommandItem[] = [
  { id: "overview", label: "Dashboard", description: "See your profile, target, evidence, weekly work, and recommended next action.", keywords: "home overview", icon: Gauge },
  { id: "twin", label: "My Career Twin", description: "Inspect your calculated Career Twin, evidence coverage, verified skills, and persona.", keywords: "twin ai identity profile persona", icon: Sparkles },
  { id: "readiness", label: "Career Readiness", description: "Evidence-based analysis of demonstrated capabilities, priority gaps, and next milestones.", keywords: "readiness report gap proof capability", icon: TrendingUp },
  { id: "paths", label: "Learning Paths", description: "Explore 8 structured multi-course learning paths inspired by Cisco NetAcad.", keywords: "paths track python fullstack network cloud security", icon: Compass },
  { id: "catalogue", label: "Course Catalogue", description: "Browse 14 production courses across engineering, cloud, and data.", keywords: "courses catalog syllabus subjects lessons", icon: Layers },
  { id: "learning", label: "Learning Studio", description: "Search skills and study 14 validated production courses.", keywords: "course lesson curriculum quiz python sql", icon: BookOpen },
  { id: "labs", label: "Hands-on Labs", description: "Complete practical engineering sandboxes: Python, CIDR, SOC Logs, Cloud IAM, SQL.", keywords: "labs sandbox practical packet tracer code networking terminal", icon: Terminal },
  { id: "mock-exams", label: "Mock Exams Hub", description: "Take timed 30-minute certification mock exams with diagnostic score reports.", keywords: "exams test quiz exam certification score timed assessment", icon: Award },
  { id: "projects", label: "Applied Projects", description: "Build and document real-world evidence projects with code deliverables.", keywords: "projects portfolio github demo artifact", icon: FolderKanban },
  { id: "opportunities", label: "Career Opportunities", description: "Discover verified internships, early-career roles, fellowships, and hackathons.", keywords: "jobs internships opportunities earlycareer openings", icon: Briefcase },
  { id: "applications", label: "Applications Tracker", description: "Track application statuses, interview dates, resume versions, and next actions.", keywords: "tracker applied interview offer status follow-up", icon: Bookmark },
  { id: "resume", label: "Resume & ATS Review", description: "Analyze your resume against target roles and quantify measurable outcomes.", keywords: "resume cv ats score bullet points review", icon: FileText },
  { id: "portfolio", label: "Student Portfolio", description: "Configure your public recruiter portfolio and verified skill showcase.", keywords: "portfolio public share link showcase github", icon: Globe },
  { id: "certificates", label: "Verified Credentials", description: "View and share your authentic verifiable skill demonstration records.", keywords: "certificates credentials verification badge achievements", icon: Award },
  { id: "skills", label: "Skill Gap Analysis", description: "Record skills, evidence, and target-role priorities.", keywords: "proficiency assessment", icon: GraduationCap },
  { id: "intelligence", label: "Career Intelligence", description: "Review evidence-grounded career context and next steps.", keywords: "analysis paths strengths", icon: BrainCircuit },
  { id: "roadmap", label: "Career Roadmap", description: "Plan and complete practical learning tasks.", keywords: "tasks study plan", icon: Route },
  { id: "interviews", label: "AI Career Coach", description: "Practise interviews with text, supported voice, and evidence-aware feedback.", keywords: "coach behavioral technical communication", icon: MessageSquareText },
  { id: "progress", label: "Progress & Weekly Tests", description: "Schedule roadmap work, record time, and complete curated assessments.", keywords: "week quiz assessment calendar progress", icon: CalendarDays },
  { id: "settings", label: "Privacy & Settings", description: "Review data controls, resume document settings, and account data.", keywords: "security privacy account files documents resume upload", icon: ShieldCheck },
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

function Overview({
  role,
  profileCompletion,
  displayName,
  ownerKey,
  twin,
  twinSource,
  onOpen,
  onOpenLearning,
  onOpenCert,
}: {
  role: string;
  profileCompletion: number | null;
  displayName: string;
  ownerKey: string;
  twin: TwinOutput | null;
  twinSource: TwinSourceState | null;
  onOpen: (view: View) => void;
  onOpenLearning?: (skill: string) => void;
  onOpenCert?: () => void;
}) {
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
      {/* Command Header */}
      <div className="command flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 rounded-3xl border border-ink/8 bg-white p-6 md:p-8 shadow-sm">
        <div className="command-copy max-w-xl">
          <p className="dash-eyebrow text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-2">
            <span className="live-dot size-2 rounded-full bg-accent animate-pulse" aria-hidden="true" />
            Career command centre · v2
          </p>
          <h1 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight text-ink">Make your next move visible.</h1>
          <p className="mt-2 text-sm text-slate">A private place to turn real evidence into focused, reviewable action.</p>
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-mint/15 px-3 py-1 text-xs font-semibold text-mint-900 border border-mint/25">
              <ShieldCheck size={13} className="text-accent" /> Private & Verified
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-accent border border-violet-100">
              <Sparkles size={13} /> {snapshot.reviewedSkills > 0 ? `${snapshot.reviewedSkills} Skills Confirmed` : "Ready for Skills Review"}
            </span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 justify-center">
          <button
            type="button"
            onClick={() => onOpen("readiness")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-ink/90 cursor-pointer"
          >
            <TrendingUp size={14} /> Career Readiness Audit
          </button>
          <button
            type="button"
            onClick={() => onOpen("opportunities")}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-ink/10 bg-app px-4 py-2.5 text-xs font-bold text-ink transition hover:bg-white cursor-pointer"
          >
            <Briefcase size={14} /> View Opportunities
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

      {/* Student Beginner Orientation Guide: Answers the 7 Core Student Questions */}
      <BeginnerGuide
        userRole={role}
        onNavigatePaths={() => onOpen("paths")}
        onNavigateCatalogue={() => onOpen("catalogue")}
        onNavigateLabs={() => onOpen("labs")}
        onNavigateExams={() => onOpen("mock-exams")}
      />
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
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link href="/onboarding" className="inline-flex items-center gap-1.5 text-sm font-bold text-accent hover:underline">{role ? "Edit target" : "Set target"}<ChevronRight size={14}/></Link>
            <button type="button" onClick={() => onOpen("twin")} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate hover:text-accent">
              <Sparkles size={13} className="text-accent" /> View Twin Evidence
            </button>
          </div>
        </article>
      </section>

      {/* Continue Learning Hub Card */}
      <section className="rounded-[26px] border border-ink/10 bg-white p-5 md:p-7 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="label">Continue Learning · Universal AI Engine</p>
            <h3 className="mt-2 text-xl font-bold tracking-tight">
              {twin?.prioritizedGaps?.[0]?.skill
                ? `Active Priority: ${twin.prioritizedGaps[0].skill}`
                : "14 Production-Ready Skill Courses Available"}
            </h3>
            <p className="mt-2 text-sm text-slate max-w-2xl">
              Study structured curricula with markdown lessons, interactive quizzes, video demonstrations, and 42 comprehensive mock tests.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                const target = twin?.prioritizedGaps?.[0]?.skill || "Python";
                if (onOpenLearning) onOpenLearning(target);
                else onOpen("learning");
              }}
              className="button-primary px-4 py-2.5 cursor-pointer"
            >
              <BookOpen size={14} /> Resume Learning
            </button>
            <button
              type="button"
              onClick={() => onOpen("twin")}
              className="button-secondary px-4 py-2.5 cursor-pointer"
            >
              <Sparkles size={14} /> My Career Twin
            </button>
            <button
              type="button"
              onClick={() => onOpen("projects")}
              className="button-secondary px-4 py-2.5 cursor-pointer"
            >
              <FolderKanban size={14} /> Applied Projects
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 border-t border-ink/8 pt-5">
          <div className="rounded-2xl bg-app p-4">
            <span className="text-xs text-slate">Ready Courses</span>
            <strong className="mt-1 block text-base font-bold text-ink">14 Production Packages</strong>
            <span className="text-[11px] text-emerald-700 font-semibold mt-0.5 block">100% Validated</span>
          </div>
          <div className="rounded-2xl bg-app p-4">
            <span className="text-xs text-slate">Total Lessons</span>
            <strong className="mt-1 block text-base font-bold text-ink">76 Complete Lessons</strong>
            <span className="text-[11px] text-slate mt-0.5 block">Markdown + Code Exercises</span>
          </div>
          <div className="rounded-2xl bg-app p-4">
            <span className="text-xs text-slate">Mock Assessments</span>
            <strong className="mt-1 block text-base font-bold text-ink">42 Full Mock Tests</strong>
            <span className="text-[11px] text-slate mt-0.5 block">3 Tests per Skill Track</span>
          </div>
          <div className="rounded-2xl bg-app p-4">
            <span className="text-xs text-slate">Evidence Projects</span>
            <strong className="mt-1 block text-base font-bold text-ink">
              {snapshot.projectsTotal + snapshot.profileProjects} Tracked · {snapshot.projectsDone} Done
            </strong>
            <span className="text-[11px] text-slate mt-0.5 block">Code Deliverables</span>
          </div>
        </div>
      </section>

      {/* Cisco-Inspired Technical Academy & Hands-on Practice */}
      <section className="rounded-[26px] border border-ink/10 bg-white p-5 md:p-7 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="label">Cisco-Inspired Technical Academy</p>
            <h3 className="mt-2 text-xl font-bold tracking-tight">
              Structured Curriculum, Interactive Labs & Timed Checkpoints
            </h3>
            <p className="mt-2 text-sm text-slate max-w-2xl">
              Engineered with the educational structure of Cisco Networking Academy & Cisco U. Progress through multi-course learning paths, practice in real sandboxes, and earn verified credentials.
            </p>
          </div>
          {onOpenCert && (
            <button
              type="button"
              onClick={onOpenCert}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-900 shadow-xs hover:bg-amber-100 transition-all cursor-pointer"
            >
              <Award size={15} className="text-amber-600" /> View Verified Certificate
            </button>
          )}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div
            onClick={() => onOpen("paths")}
            className="group rounded-2xl border border-ink/8 bg-surface p-5 hover:border-brand-forest/40 hover:bg-white cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 text-brand-forest">
                <Compass size={18} />
                <span className="text-xs font-bold uppercase tracking-wider">Learning Paths</span>
              </div>
              <h4 className="mt-2 font-bold text-ink group-hover:text-brand-forest transition-colors">
                8 Role-Aligned Paths
              </h4>
              <p className="mt-1 text-xs text-slate">
                Python, Full-Stack, Cyber, Cloud, Data, AI/ML, Network, DevOps.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-forest group-hover:underline">
              Explore Paths <ArrowRight size={13} />
            </span>
          </div>

          <div
            onClick={() => onOpen("catalogue")}
            className="group rounded-2xl border border-ink/8 bg-surface p-5 hover:border-brand-forest/40 hover:bg-white cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 text-indigo-600">
                <Layers size={18} />
                <span className="text-xs font-bold uppercase tracking-wider">Course Catalogue</span>
              </div>
              <h4 className="mt-2 font-bold text-ink group-hover:text-indigo-600 transition-colors">
                14 Production Courses
              </h4>
              <p className="mt-1 text-xs text-slate">
                Complete modules, lessons, and tests with Cisco U-style syllabus previews.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:underline">
              Browse Courses <ArrowRight size={13} />
            </span>
          </div>

          <div
            onClick={() => onOpen("labs")}
            className="group rounded-2xl border border-ink/8 bg-surface p-5 hover:border-teal-600/40 hover:bg-white cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 text-teal-700">
                <Terminal size={18} />
                <span className="text-xs font-bold uppercase tracking-wider">Hands-On Labs</span>
              </div>
              <h4 className="mt-2 font-bold text-ink group-hover:text-teal-700 transition-colors">
                5 Practical Sandboxes
              </h4>
              <p className="mt-1 text-xs text-slate">
                Python validation, IPv4 Subnetting, SOC logs, Cloud IAM, SQL queries.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-teal-700 group-hover:underline">
              Launch Labs <ArrowRight size={13} />
            </span>
          </div>

          <div
            onClick={() => onOpen("mock-exams")}
            className="group rounded-2xl border border-ink/8 bg-surface p-5 hover:border-amber-600/40 hover:bg-white cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 text-amber-700">
                <Award size={18} />
                <span className="text-xs font-bold uppercase tracking-wider">Mock Exams Hub</span>
              </div>
              <h4 className="mt-2 font-bold text-ink group-hover:text-amber-700 transition-colors">
                42 Timed Assessments
              </h4>
              <p className="mt-1 text-xs text-slate">
                30-minute exam engine with topic diagnostics and question explanations.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-amber-700 group-hover:underline">
              Take Exam <ArrowRight size={13} />
            </span>
          </div>
        </div>
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



export function CareerWorkspace({ ownerKey }: { ownerKey?: string }) {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  let clerk: { signOut?: () => Promise<void> } | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    clerk = useClerk?.() ?? null;
  } catch {
    clerk = null;
  }
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
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  const handleLogout = async () => {
    try {
      await fetch("/api/account/logout", { method: "POST" });
    } catch {
      // safe
    }

    try {
      if (clerk && clerk.signOut) {
        await clerk.signOut();
      }
    } catch {
      // ignore
    }

    try {
      localStorage.removeItem("ct-demo-session");
      localStorage.removeItem("ct-user-email");
      localStorage.removeItem("ct-user-name");
      sessionStorage.clear();
    } catch {
      // safe
    }

    router.push("/login?logged_out=true");
  };

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("ct-theme");
      const savedContrast = localStorage.getItem("ct-contrast");
      const savedMotion = localStorage.getItem("ct-reduced-motion");
      if (savedTheme === "dark" || savedTheme === "light") {
        document.documentElement.setAttribute("data-theme", savedTheme);
      }
      if (savedContrast === "high" || savedContrast === "normal") {
        document.documentElement.setAttribute("data-contrast", savedContrast);
      }
      if (savedMotion === "true" || savedMotion === "false") {
        document.documentElement.setAttribute("data-reduced-motion", savedMotion);
      }
    } catch {
      // safe
    }
  }, []);

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
    const syncFromUrl = () => {
      const requestedView = searchParams.get("view");
      if (requestedView === "documents") {
        setView("settings");
        return;
      }
      if (!navigation.some((item) => item.id === requestedView)) return;
      setView(requestedView as View);
    };
    const task = window.setTimeout(syncFromUrl, 0);
    return () => window.clearTimeout(task);
  }, [searchParams]);

  useEffect(() => {
    if (!storageOwnerKey) return;
    const controller = new AbortController();
    const fetchProfile = () => {
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
    };
    fetchProfile();
    window.addEventListener("careertwin:profile-saved", fetchProfile);
    return () => {
      controller.abort();
      window.removeEventListener("careertwin:profile-saved", fetchProfile);
    };
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

  const [learningSkillParam, setLearningSkillParam] = useState<string>("");

  function openLearningWithSkill(skill: string) {
    setLearningSkillParam(skill);
    setView("learning");
    setMobileOpen(false);
    setCommandOpen(false);
    window.history.replaceState({}, "", `/dashboard?view=learning&skill=${encodeURIComponent(skill)}`);
  }

  async function refreshTwin() {
    if (!storageOwnerKey) return;
    setSyncState({ status: "saving", message: "Updating Career Twin calculation…" });
    try {
      const res = await fetch("/api/twin");
      if (!res.ok) throw new Error("Sync failed");
      const payload = (await res.json()) as { data?: { source: TwinSourceState; twin: TwinOutput } };
      if (payload.data) {
        setTwin(payload.data.twin);
        setTwinSource(payload.data.source);
        setSyncState({ status: "saved", message: "Secure Career Twin loaded." });
      }
    } catch {
      setSyncState({ status: "error", message: "Career Twin re-calculation failed. Local records remain available." });
    }
  }

  useEffect(() => {
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const requestedView = params.get("view");
      if (requestedView === "documents") {
        setView("settings");
        return;
      }
      if (requestedView && navigation.some((item) => item.id === requestedView)) {
        setView(requestedView as View);
      } else {
        setView("overview");
      }
    };
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  function changeView(next: View) {
    setView(next);
    setMobileOpen(false);
    setCommandOpen(false);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("view", next);
      window.history.pushState({ view: next }, "", url.pathname + url.search);
    }
  }

  const [certModalOpen, setCertModalOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  function preloadView(next: View) {
    if (next === "skills") void import("./skill-evidence");
    if (next === "twin") void import("./my-career-twin");
    if (next === "paths") void import("./learning-paths");
    if (next === "catalogue") void import("./course-catalogue");
    if (next === "labs") void import("./hands-on-labs");
    if (next === "mock-exams") void import("./mock-exams-hub");
    if (next === "readiness") void import("./career-readiness-view");
    if (next === "opportunities") void import("./career-opportunities-view");
    if (next === "applications") void import("./applications-tracker-view");
    if (next === "resume") void import("./resume-review-view");
    if (next === "portfolio") void import("./portfolio-view");
    if (next === "certificates") void import("./achievements-view");
    if (next === "projects") void import("./guided-projects-view");
    if (next === "roadmap") void import("./development-hub");
  }

  const activeSection = primaryNavigation.find((item) => item.subViews.includes(view)) || primaryNavigation[0];
  const active = navigation.find((item) => item.id === view) || navigation[0];

  if (!ownerKey && !isLoaded) return <main className="grid min-h-dvh place-items-center bg-app text-ink"><div className="text-center"><div className="mx-auto size-10 animate-pulse rounded-2xl bg-mint"/><p className="mt-4 text-sm font-semibold text-slate">Loading your private workspace…</p></div></main>;

  return <div className="career-dashboard min-h-screen bg-[#f5f6fb] dark:bg-[#0b1116] text-ink">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col overflow-y-auto overflow-x-hidden border-r border-ink/10 bg-[#f8f7f2] dark:bg-[#0d141a] text-ink shadow-[18px_0_60px_rgba(31,46,41,.05)] lg:flex">
      <div className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full border-[44px] border-ink/[.025]" />
      {/* Brand */}
      <div className="sticky top-0 z-10 border-b border-ink/10 bg-[#f8f7f2] dark:bg-[#0d141a] px-5 pb-4 pt-5"><Brand /></div>
      {/* Primary 7-Section Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1.5" aria-label="Career workspace">
        <p className="px-2 pb-1 font-mono text-[9px] font-bold uppercase tracking-[.18em] text-slate/70">
          Navigation
        </p>
        {primaryNavigation.map((item) => {
          const isSelected = activeSection.id === item.id;
          return (
            <button
              key={item.id}
              onMouseEnter={() => preloadView(item.defaultView)}
              onFocus={() => preloadView(item.defaultView)}
              onClick={() => changeView(item.defaultView)}
              className={`relative flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-[13px] font-semibold transition-all cursor-pointer ${
                isSelected
                  ? "border-violet-200 bg-violet-50 text-accent shadow-[0_4px_14px_rgba(109,61,245,.10)] before:absolute before:inset-y-2.5 before:left-0 before:w-[3px] before:rounded-r before:bg-accent"
                  : "border-transparent text-slate hover:border-ink/8 hover:bg-white dark:hover:bg-white/5 hover:text-ink"
              }`}
              aria-current={isSelected ? "page" : undefined}
            >
              <span className={`grid size-7 shrink-0 place-items-center rounded-lg ${isSelected ? "bg-white text-accent" : "text-slate/75"}`}>
                <item.icon size={15}/>
              </span>
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>
      {/* Footer */}
      <div className="sticky bottom-0 border-t border-ink/10 bg-[#f8f7f2] dark:bg-[#0d141a] px-3 pb-4 pt-3 space-y-1">
        <Link href="/onboarding" className="flex items-center gap-2.5 rounded-lg border border-transparent px-2.5 py-2 text-[13px] font-semibold text-slate transition hover:border-ink/8 hover:bg-white dark:hover:bg-white/5 hover:text-ink">
          <CircleUserRound size={15} className="shrink-0"/>
          <span className="truncate">Career Profile</span>
        </Link>
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="flex w-full items-center gap-2.5 rounded-lg border border-transparent px-2.5 py-2 text-[13px] font-semibold text-rose-600 transition hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-700 cursor-pointer"
        >
          <LogOut size={15} className="shrink-0"/>
          <span className="truncate">Sign Out</span>
        </button>
        <div className="mt-1 rounded-xl border border-ink/10 bg-white/70 dark:bg-white/5 px-3 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className={`size-1.5 rounded-full ${syncState?.status === "saved" ? "bg-emerald-500" : "bg-amber-400"}`}/>
            <p className="text-[11px] font-bold text-ink">Private workspace</p>
          </div>
          <p className="mt-1 text-[10px] leading-[1.5] text-slate">{syncState?.status === "saved" ? "Synced to secure database." : "Using browser drafts."}</p>
        </div>
      </div>
    </aside>

    <div className="lg:pl-[260px]">
      <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-ink/[.07] bg-[#f2f4f1]/82 dark:bg-[#0d141a]/90 px-4 backdrop-blur-2xl md:px-7 lg:px-10">
        <div className="flex items-center gap-3"><button onClick={() => setMobileOpen(true)} className="grid size-10 place-items-center rounded-xl border border-ink/10 bg-white shadow-sm lg:hidden" aria-label="Open workspace navigation"><Menu size={18}/></button><div><div className="flex items-center gap-2"><span className="hidden size-1.5 rounded-full bg-accent sm:block"/><p className="text-sm font-bold tracking-[-.015em]">{active.label}</p></div><p className="hidden text-[11px] text-slate sm:block">Private career workspace</p></div></div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFeedbackOpen(true)}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-ink/10 bg-white/75 px-3 text-xs font-bold text-slate shadow-xs transition hover:border-accent/20 hover:bg-white hover:text-ink cursor-pointer"
            aria-label="Give student feedback"
          >
            <MessageSquareText size={14} className="text-accent" />
            <span className="hidden sm:inline">Feedback</span>
          </button>
          <button type="button" onClick={()=>setCommandOpen(true)} className="group inline-flex min-h-10 items-center gap-2 rounded-full border border-ink/10 bg-white/75 px-3 text-xs font-bold text-slate shadow-[0_8px_24px_rgba(24,48,52,.045)] transition hover:-translate-y-0.5 hover:border-accent/20 hover:bg-white hover:text-ink cursor-pointer" aria-label="Open quick navigation"><Search size={14}/><span className="hidden md:inline">Quick find</span><kbd className="hidden rounded-md border border-ink/10 bg-cream/60 px-1.5 py-0.5 font-mono text-[9px] text-slate lg:inline">⌘K</kbd></button>
          
          {/* Authenticated Account Menu Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setAccountMenuOpen(!accountMenuOpen)}
              className="group inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/80 px-3.5 py-2 text-xs font-bold shadow-[0_8px_24px_rgba(24,48,52,.06)] transition hover:-translate-y-0.5 hover:border-accent/25 hover:bg-white cursor-pointer"
              aria-expanded={accountMenuOpen}
              aria-label="User account menu"
            >
              <span className="grid size-6 place-items-center rounded-full bg-mint/35 text-accent font-bold text-[11px]">
                {displayName ? displayName.charAt(0).toUpperCase() : "A"}
              </span>
              <span className="hidden max-w-36 truncate sm:inline">{displayName || role || "Student"}</span>
              <ChevronDown size={13} className={`text-slate transition-transform ${accountMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {accountMenuOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-ink/10 bg-white p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-2"
                role="menu"
              >
                <div className="border-b border-ink/8 px-3 py-2.5">
                  <p className="text-xs font-bold text-ink truncate">{displayName || "CareerTwin Student"}</p>
                  <p className="text-[10px] text-slate truncate">{user?.primaryEmailAddress?.emailAddress || "Signed-in session"}</p>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAccountMenuOpen(false);
                      router.push("/onboarding");
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate hover:bg-surface hover:text-ink cursor-pointer"
                    role="menuitem"
                  >
                    <User size={14} />
                    <span>Profile Details</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAccountMenuOpen(false);
                      changeView("settings");
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate hover:bg-surface hover:text-ink cursor-pointer"
                    role="menuitem"
                  >
                    <Settings size={14} />
                    <span>Account Settings</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAccountMenuOpen(false);
                      changeView("settings");
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate hover:bg-surface hover:text-ink cursor-pointer"
                    role="menuitem"
                  >
                    <BookOpen size={14} />
                    <span>Learning Preferences</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAccountMenuOpen(false);
                      changeView("settings");
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate hover:bg-surface hover:text-ink cursor-pointer"
                    role="menuitem"
                  >
                    <ShieldCheck size={14} />
                    <span>Privacy & Security</span>
                  </button>
                </div>

                <div className="border-t border-ink/8 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAccountMenuOpen(false);
                      void handleLogout();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
                    role="menuitem"
                  >
                    <LogOut size={14} />
                    <span>Sign Out (Logout)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1320px] px-4 py-7 md:px-7 lg:px-10 lg:py-10">
        <div className="mb-8 flex items-end justify-between gap-5"><div><p className="label">{view === "overview" ? "Career command centre" : "Plan · practise · prove"}</p><h1 className="mt-3 text-[clamp(1.75rem,3vw,2.6rem)] font-[720] leading-[1.05] tracking-[-.055em]">{view === "overview" ? "Make your next move visible." : active.label}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate">{view === "overview" ? "A private place to turn real evidence into focused, reviewable action." : "Review and update only the information you record—without invented scores or claims."}</p></div>{view !== "overview" && <button onClick={() => changeView("overview")} className="hidden rounded-full border border-ink/9 bg-white/80 px-4 py-2 text-sm font-bold text-accent shadow-[0_8px_22px_rgba(24,48,52,.05)] transition hover:-translate-y-0.5 hover:border-accent/25 hover:bg-white sm:block">Back to overview</button>}</div>
        {syncState && syncState.status === "error" && <div role="status" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{syncState.message}</div>}

        {/* Secondary Navigation Tabs for Consolidated Sections */}
        {activeSection.id === "twin" && (
          <nav className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-ink/8 bg-white p-2 shadow-xs" aria-label="Career Twin tabs">
            {[
              { id: "twin" as View, label: "Twin Overview", icon: Sparkles },
              { id: "skills" as View, label: "Skill Gap Analysis", icon: GraduationCap },
              { id: "intelligence" as View, label: "Career Intelligence", icon: BrainCircuit },
              { id: "roadmap" as View, label: "Career Roadmap", icon: Route },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => changeView(tab.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  view === tab.id
                    ? "bg-accent text-white shadow-sm"
                    : "bg-surface text-slate hover:bg-white hover:text-ink"
                }`}
              >
                <tab.icon size={13} />
                {tab.label}
              </button>
            ))}
          </nav>
        )}

        {activeSection.id === "learning" && (
          <nav className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-ink/8 bg-white p-2 shadow-xs" aria-label="Learning tabs">
            {[
              { id: "learning" as View, label: "Learning Studio", icon: BookOpen },
              { id: "paths" as View, label: "Learning Paths", icon: Compass },
              { id: "catalogue" as View, label: "Course Catalogue", icon: Layers },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => changeView(tab.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  view === tab.id
                    ? "bg-accent text-white shadow-sm"
                    : "bg-surface text-slate hover:bg-white hover:text-ink"
                }`}
              >
                <tab.icon size={13} />
                {tab.label}
              </button>
            ))}
          </nav>
        )}

        {activeSection.id === "practice" && (
          <nav className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-ink/8 bg-white p-2 shadow-xs" aria-label="Practice tabs">
            {[
              { id: "mock-exams" as View, label: "Mock Exams Hub", icon: Award },
              { id: "progress" as View, label: "Weekly Tests & Progress", icon: CalendarDays },
              { id: "labs" as View, label: "Hands-on Labs", icon: Terminal },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => changeView(tab.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  view === tab.id
                    ? "bg-accent text-white shadow-sm"
                    : "bg-surface text-slate hover:bg-white hover:text-ink"
                }`}
              >
                <tab.icon size={13} />
                {tab.label}
              </button>
            ))}
          </nav>
        )}

        {activeSection.id === "projects" && (
          <nav className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-ink/8 bg-white p-2 shadow-xs" aria-label="Projects tabs">
            {[
              { id: "projects" as View, label: "Applied Projects", icon: FolderKanban },
              { id: "portfolio" as View, label: "Student Portfolio", icon: Globe },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => changeView(tab.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  view === tab.id
                    ? "bg-accent text-white shadow-sm"
                    : "bg-surface text-slate hover:bg-white hover:text-ink"
                }`}
              >
                <tab.icon size={13} />
                {tab.label}
              </button>
            ))}
          </nav>
        )}

        {activeSection.id === "career" && (
          <nav className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-ink/8 bg-white p-2 shadow-xs" aria-label="Career Center tabs">
            {[
              { id: "opportunities" as View, label: "Opportunities", icon: Briefcase },
              { id: "applications" as View, label: "Applications Tracker", icon: Bookmark },
              { id: "resume" as View, label: "Resume & ATS Review", icon: FileText },
              { id: "certificates" as View, label: "Verified Credentials", icon: Award },
              { id: "readiness" as View, label: "Career Readiness", icon: TrendingUp },
              { id: "interviews" as View, label: "AI Mock Interviews", icon: MessageSquareText },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => changeView(tab.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  view === tab.id
                    ? "bg-accent text-white shadow-sm"
                    : "bg-surface text-slate hover:bg-white hover:text-ink"
                }`}
              >
                <tab.icon size={13} />
                {tab.label}
              </button>
            ))}
          </nav>
        )}

        <AnimatePresence mode="wait">
          <motion.div key={view} initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -4 }} transition={{ duration: .2 }}>
            {twinLoadState === "loading" && view !== "overview" ? (
              <ModuleLoading />
            ) : view === "overview" ? (
              <Overview
                role={role}
                profileCompletion={profileCompletion}
                displayName={displayName}
                ownerKey={storageOwnerKey}
                twin={twin}
                twinSource={twinSource}
                onOpen={changeView}
                onOpenLearning={openLearningWithSkill}
                onOpenCert={() => setCertModalOpen(true)}
              />
            ) : view === "twin" ? (
              <MyCareerTwin
                role={role}
                displayName={displayName}
                ownerKey={storageOwnerKey}
                twin={twin}
                twinSource={twinSource}
                syncState={syncState}
                onRefreshTwin={refreshTwin}
                onOpenLearning={openLearningWithSkill}
                onOpenSkills={() => changeView("skills")}
                onOpenRoadmap={() => changeView("roadmap")}
              />
            ) : view === "paths" ? (
              <LearningPathsView
                userRole={role}
                ownerKey={storageOwnerKey}
                onSelectCourse={openLearningWithSkill}
                onNavigateLabs={() => changeView("labs")}
                onNavigateExams={() => changeView("mock-exams")}
                onNavigateProjects={() => changeView("projects")}
              />
            ) : view === "catalogue" ? (
              <CourseCatalogueView
                onSelectCourse={openLearningWithSkill}
                onNavigatePaths={() => changeView("paths")}
                userRole={role}
              />
            ) : view === "labs" ? (
              <HandsOnLabsView
                ownerKey={storageOwnerKey}
                onNavigateTwin={() => changeView("twin")}
              />
            ) : view === "mock-exams" ? (
              <MockExamsHubView
                ownerKey={storageOwnerKey}
                preferredRole={role}
                onNavigateTwin={() => changeView("twin")}
                onSelectCourse={openLearningWithSkill}
              />
            ) : view === "skills" ? (
              <SkillEvidence
                role={role}
                ownerKey={storageOwnerKey}
                onOpenProgress={() => changeView("progress")}
                onOpenLearning={openLearningWithSkill}
              />
            ) : view === "readiness" ? (
              <CareerReadinessView
                role={role}
                twin={twin}
                source={twinSource}
                onNavigateView={changeView}
                onOpenLearning={openLearningWithSkill}
              />
            ) : view === "opportunities" ? (
              <CareerOpportunitiesView
                twin={twin}
                onNavigateLearning={openLearningWithSkill}
                onNavigateLabs={() => changeView("labs")}
                onNavigateApplications={() => changeView("applications")}
              />
            ) : view === "applications" ? (
              <ApplicationsTrackerView
                ownerKey={storageOwnerKey}
                onNavigateOpportunities={() => changeView("opportunities")}
              />
            ) : view === "resume" ? (
              <ResumeReviewView
                role={role}
                onNavigateProjects={() => changeView("projects")}
              />
            ) : view === "portfolio" ? (
              <PortfolioView
                role={role}
                twin={twin}
                ownerKey={storageOwnerKey}
              />
            ) : view === "certificates" ? (
              <AchievementsView
                onNavigateExams={() => changeView("mock-exams")}
                onNavigateLabs={() => changeView("labs")}
                onNavigateProjects={() => changeView("projects")}
              />
            ) : view === "roadmap" || view === "interviews" ? (
              <DevelopmentHub
                view={view}
                role={role}
                ownerKey={storageOwnerKey}
                onOpen={(next) => changeView(next === "interviews" ? "interviews" : next === "progress" ? "progress" : "roadmap")}
                onOpenLearning={openLearningWithSkill}
              />
            ) : view === "projects" ? (
              <GuidedProjectsView
                role={role}
                ownerKey={storageOwnerKey}
                onNavigateAchievements={() => changeView("certificates")}
                onNavigatePortfolio={() => changeView("portfolio")}
              />
            ) : view === "intelligence" ? (
              <CareerIntelligence
                role={role}
                ownerKey={storageOwnerKey}
                onOpenRoadmap={() => changeView("roadmap")}
                onOpenLearning={openLearningWithSkill}
              />
            ) : view === "learning" ? (
              <LearningStudio
                role={role}
                ownerKey={storageOwnerKey}
                initialSkill={learningSkillParam || searchParams.get("skill") || undefined}
              />
            ) : view === "progress" ? (
              <WeeklyPlanner
                ownerKey={storageOwnerKey}
                role={role}
                onOpenRoadmap={() => changeView("roadmap")}
              />
            ) : (
              <SettingsHub
                ownerKey={storageOwnerKey}
                onLogout={handleLogout}
                initialEmail={user?.primaryEmailAddress?.emailAddress ?? undefined}
                initialName={displayName || undefined}
              />
            )} 
          </motion.div>
        </AnimatePresence>
      </main>
    </div>

    <AnimatePresence>
      {mobileOpen && (
        <>
          <motion.button
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-40 bg-ink/25 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close workspace navigation overlay"
          />
          <motion.aside
            initial={reduceMotion ? false : {x:"-100%"}}
            animate={{x:0}}
            exit={{x:"-100%"}}
            transition={{duration:.22,ease:[.22,1,.36,1]}}
            className="fixed inset-y-0 left-0 z-50 flex w-[min(300px,88vw)] flex-col overflow-y-auto bg-[#f8f7f2] dark:bg-[#0d141a] text-ink shadow-2xl lg:hidden"
          >
            <div className="flex items-center justify-between border-b border-ink/10 bg-[#f8f7f2] dark:bg-[#0d141a] px-5 pb-4 pt-5">
              <Brand/>
              <button onClick={() => setMobileOpen(false)} className="grid size-9 place-items-center rounded-lg text-slate hover:bg-white dark:hover:bg-white/10 hover:text-ink" aria-label="Close workspace navigation">
                <X size={18}/>
              </button>
            </div>
            <nav className="flex-1 px-3 py-3 space-y-1" aria-label="Mobile career workspace">
              <p className="px-2 pb-1 font-mono text-[9px] font-bold uppercase tracking-[.18em] text-slate/70">Navigation</p>
              {primaryNavigation.map((item) => {
                const isSelected = activeSection.id === item.id;
                return (
                  <button
                    key={item.id}
                    onFocus={() => preloadView(item.defaultView)}
                    onClick={() => changeView(item.defaultView)}
                    className={isSelected
                      ? "flex w-full items-center gap-2.5 rounded-xl border border-violet-200 bg-violet-50 text-accent transition-all"
                      : "flex w-full items-center gap-2.5 rounded-xl border border-transparent px-3 py-2.5 text-[13px] font-semibold text-slate hover:bg-white dark:hover:bg-white/5 hover:text-ink transition-all"
                    }
                  >
                    <span className={isSelected ? "grid size-6 shrink-0 place-items-center rounded-md bg-white text-accent" : "grid size-6 shrink-0 place-items-center rounded-md text-slate/70"}>
                      <item.icon size={14}/>
                    </span>
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="border-t border-ink/10 bg-[#f8f7f2] dark:bg-[#0d141a] px-3 pb-4 pt-3 space-y-1">
              <Link href="/onboarding" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-[13px] font-semibold text-slate hover:bg-white dark:hover:bg-white/5">
                <CircleUserRound size={15} className="shrink-0"/>Career Profile
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  void handleLogout();
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-[13px] font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
              >
                <LogOut size={15} className="shrink-0"/>Sign Out
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
    <CommandPalette open={commandOpen} items={commands} onClose={()=>setCommandOpen(false)} onSelect={(id)=>changeView(id as View)} />
    {/* Pip Agent widget removed per Phase 12 & student UI specification */}
    {certModalOpen && (
      <CertificateModal
        studentName={displayName || role || "CareerTwin Scholar"}
        courseTitle={role ? `${role} Professional Curriculum` : "Software & Systems Engineering"}
        skills={twin?.demonstratedSkills?.map((s) => s.name) || ["Python", "SQL", "Cloud Infrastructure", "Cyber Defense"]}
        onClose={() => setCertModalOpen(false)}
      />
    )}
    {feedbackOpen && <FeedbackDialog onClose={() => setFeedbackOpen(false)} />}
  </div>;
}
