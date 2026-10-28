"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bot,
  BrainCircuit,
  Check,
  ChevronRight,
  FileCheck2,
  FileText,
  GraduationCap,
  Map,
  Play,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import Link from "next/link";
import { Brand } from "./brand";
import { Header } from "./header";
import { Pip } from "./pip";

const features = [
  { icon: BrainCircuit, title: "Career intelligence", copy: "Connect your approved profile, evidence, goals, and progress without invented market claims.", tone: "dark" },
  { icon: BarChart3, title: "Skill gap analysis", copy: "Compare recorded evidence with transparent target-role expectations and useful next steps.", tone: "light" },
  { icon: Map, title: "Adaptive roadmap", copy: "Turn priorities into editable learning tasks, projects, weekly work, and completion criteria.", tone: "violet" },
  { icon: Bot, title: "Interview practice", copy: "Practise role-specific questions with evidence-aware context and clearly scoped feedback.", tone: "light" },
  { icon: FileText, title: "Profile and documents", copy: "Review resume facts before they become part of your private career profile.", tone: "light" },
  { icon: ShieldCheck, title: "Private by design", copy: "Owner-scoped records, explicit saves, honest fallback states, and portable exports.", tone: "mint" },
] as const;

const journey = [
  ["01", "Build your profile", "Add the education, skills, projects, experience, and interests that are true today."],
  ["02", "Create your Twin", "CareerTwin calculates a transparent view of evidence, gaps, progress, and limitations."],
  ["03", "Turn gaps into action", "Create a roadmap, schedule focused work, and record completion only when it happens."],
  ["04", "Practise and reassess", "Use assessments and interview practice to update evidence and choose the next useful move."],
] as const;

function CareerScene() {
  const reduce = useReducedMotion();
  const sceneUrl = process.env.NEXT_PUBLIC_SPLINE_SCENE_URL?.trim();

  if (sceneUrl) {
    return (
      <div className="relative h-full min-h-[500px] overflow-hidden rounded-[30px] border border-white/10 bg-[#15142b]">
        <iframe title="Interactive CareerTwin 3D scene" src={sceneUrl} className="absolute inset-0 size-full border-0" loading="eager" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#17162d] to-transparent" />
      </div>
    );
  }

  return (
    <div className="hero-scene relative min-h-[500px] overflow-hidden rounded-[30px] border border-white/10 bg-[#15142b]" aria-label="Interactive-style CareerTwin visualization">
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.055)_1px,transparent_1px)] [background-size:42px_42px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="absolute left-1/2 top-[47%] size-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/20 blur-[85px]" />
      <motion.div animate={reduce ? undefined : { rotate: 360 }} transition={{ duration: 34, repeat: Infinity, ease: "linear" }} className="absolute left-1/2 top-[46%] size-[330px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-300/20">
        <span className="absolute left-7 top-7 size-3 rounded-full bg-[#a9f3d0] shadow-[0_0_28px_#a9f3d0]" />
        <span className="absolute bottom-10 right-2 size-2 rounded-full bg-violet-300 shadow-[0_0_22px_#c4b5fd]" />
      </motion.div>
      <motion.div animate={reduce ? undefined : { rotate: -360 }} transition={{ duration: 24, repeat: Infinity, ease: "linear" }} className="absolute left-1/2 top-[46%] size-[245px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/15">
        <span className="absolute -left-2 top-1/2 grid size-9 place-items-center rounded-xl border border-white/15 bg-[#29264a] text-violet-200 shadow-xl"><Target size={16} /></span>
      </motion.div>
      <motion.div animate={reduce ? undefined : { y: [0, -10, 0], rotateY: [0, 8, 0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute left-1/2 top-[46%] grid size-[178px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[42px] border border-white/15 bg-[linear-gradient(145deg,rgba(147,116,255,.95),rgba(87,55,214,.78))] shadow-[0_35px_90px_rgba(92,63,235,.45),inset_0_1px_1px_rgba(255,255,255,.35)] [transform-style:preserve-3d]">
        <div className="absolute inset-4 rounded-[32px] border border-white/15" />
        <div className="text-center text-white"><Sparkles className="mx-auto" size={30}/><strong className="mt-3 block text-xl tracking-[-.04em]">Your Twin</strong><span className="mt-1 block text-[9px] uppercase tracking-[.2em] text-white/60">Evidence connected</span></div>
      </motion.div>
      <motion.div animate={reduce ? undefined : { y: [0, 8, 0] }} transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }} className="absolute left-[5%] top-[13%] w-44 rounded-2xl border border-white/12 bg-white/[.08] p-4 text-white shadow-2xl backdrop-blur-xl sm:left-[8%]">
        <span className="grid size-8 place-items-center rounded-xl bg-[#a9f3d0]/15 text-[#a9f3d0]"><FileCheck2 size={15}/></span><strong className="mt-5 block text-sm">Evidence coverage</strong><span className="mt-1 block text-[10px] text-white/50">Based on saved records</span>
      </motion.div>
      <motion.div animate={reduce ? undefined : { y: [0, -8, 0] }} transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut", delay: .6 }} className="absolute bottom-[14%] right-[4%] w-48 rounded-2xl border border-white/12 bg-white/[.08] p-4 text-white shadow-2xl backdrop-blur-xl sm:right-[7%]">
        <span className="text-[9px] font-bold uppercase tracking-[.16em] text-violet-200">Next best action</span><strong className="mt-3 block text-sm">Continue your roadmap</strong><span className="mt-1 block text-[10px] leading-4 text-white/50">Recommendations update with real progress.</span>
      </motion.div>
      <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-[9px] font-bold uppercase tracking-[.15em] text-white/55 backdrop-blur"><span className="size-1.5 rounded-full bg-[#a9f3d0]"/>Interactive 3D-ready scene</div>
    </div>
  );
}

function ProductStrip() {
  return (
    <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[24px] border border-ink/10 bg-white shadow-[0_28px_90px_rgba(31,27,72,.12)]">
      <div className="flex h-14 items-center justify-between border-b border-ink/8 px-5"><div className="flex items-center gap-2"><span className="grid size-7 place-items-center rounded-lg bg-accent text-white"><Sparkles size={13}/></span><strong className="text-xs">CareerTwin workspace</strong></div><span className="rounded-full bg-violet-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-accent">Canonical Twin connected</span></div>
      <div className="grid md:grid-cols-[190px_1fr]"><aside className="hidden border-r border-ink/8 bg-[#f8f8fc] p-4 md:block">{["Dashboard", "Skill gaps", "Career intelligence", "Roadmap", "Career coach"].map((item, index)=><div key={item} className={`mb-1 px-3 py-2.5 text-[10px] font-semibold ${index === 0 ? "bg-white text-accent shadow-sm" : "text-slate"}`}>{item}</div>)}</aside>
        <div className="p-5 sm:p-7"><div className="flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-accent">Career command centre</p><h3 className="mt-2 text-xl font-bold tracking-[-.035em]">Make your next move visible.</h3></div><span className="hidden text-[10px] text-slate sm:block">Updated from saved activity</span></div>
          <div className="mt-5 grid gap-3 lg:grid-cols-[1.35fr_.65fr]"><div className="rounded-2xl bg-[#24213f] p-5 text-white"><p className="text-[9px] uppercase tracking-widest text-violet-200">Recommended next action</p><h4 className="mt-4 text-lg font-bold">Strengthen one priority skill with evidence.</h4><p className="mt-2 text-xs leading-5 text-white/55">Complete a roadmap task, attach an outcome, then recalculate your Twin.</p><span className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-[#a9f3d0]">Open roadmap <ChevronRight size={13}/></span></div><div className="rounded-2xl border border-ink/8 bg-[#f7f6ff] p-5"><Target className="text-accent" size={18}/><strong className="mt-8 block text-2xl">3</strong><span className="text-[10px] text-slate">PRIORITY GAPS</span><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-violet-100"><div className="h-full w-3/5 bg-accent"/></div></div></div>
        </div>
      </div>
    </div>
  );
}

export function Landing() {
  const reduce = useReducedMotion();
  return (
    <div className="bg-[#fbfbfe] text-ink"><Header/><main>
      <section id="home" className="relative overflow-hidden bg-[#f7f6ff] px-5 pb-24 pt-12 sm:pt-16 lg:pb-32 lg:pt-20">
        <div className="pointer-events-none absolute -left-44 -top-64 size-[620px] rounded-full bg-violet-200/45 blur-[120px]" />
        <div className="mx-auto grid max-w-[1280px] gap-12 lg:grid-cols-[.92fr_1.08fr] lg:items-center">
          <motion.div initial={reduce ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65 }} className="relative z-10 pt-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-4 py-2 text-[11px] font-bold text-accent shadow-sm"><Sparkles size={13}/>One profile. One plan. One evolving Twin.</div>
            <h1 className="mt-7 max-w-3xl text-[clamp(3.3rem,6.6vw,6.5rem)] font-[760] leading-[.89] tracking-[-.07em]">Your career.<br/>Your potential.<br/><span className="text-accent">Your AI Twin.</span></h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-slate sm:text-lg">Turn the career information you approve into clear skill priorities, a practical roadmap, focused practice, and one useful next action.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/sign-up?redirect_url=/onboarding" className="button-primary px-7 py-4">Build My Career Twin<ArrowRight size={17}/></Link><Link href="#product" className="button-secondary rounded-xl px-7 py-4"><Play size={15}/>See how it works</Link></div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-slate">{["Evidence-led", "Private workspace", "AI optional"].map(item=><span key={item} className="flex items-center gap-2"><span className="grid size-5 place-items-center rounded-full bg-[#dff8ec] text-[#13795b]"><Check size={11}/></span>{item}</span>)}</div>
          </motion.div>
          <motion.div initial={reduce ? false : { opacity: 0, scale: .96, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: .8, delay: .08 }}><CareerScene/></motion.div>
        </div>
      </section>

      <section id="product" className="relative -mt-10 px-5 pb-20 lg:-mt-14 lg:pb-28"><ProductStrip/></section>

      <section id="capabilities" className="section shell"><div className="max-w-3xl"><p className="section-kicker">The connected career workspace</p><h2 className="section-title">Less guessing.<br/>More useful action.</h2><p className="mt-6 max-w-2xl text-base leading-7 text-slate">CareerTwin keeps your profile, evidence, roadmap, assessments, and progress connected—so each step can use the result of the last.</p></div>
        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{features.map(({icon:Icon,title,copy,tone})=><article key={title} className={`min-h-64 border p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl ${tone === "dark" ? "border-[#292547] bg-[#24213f] text-white" : tone === "violet" ? "border-violet-200 bg-[#eeeaff]" : tone === "mint" ? "border-emerald-100 bg-[#edfaf5]" : "border-ink/8 bg-white"}`}><span className={`grid size-11 place-items-center rounded-xl ${tone === "dark" ? "bg-white/10 text-violet-200" : "bg-white text-accent shadow-sm"}`}><Icon size={20}/></span><h3 className="mt-16 text-xl font-bold tracking-[-.03em]">{title}</h3><p className={`mt-3 text-sm leading-6 ${tone === "dark" ? "text-white/60" : "text-slate"}`}>{copy}</p></article>)}</div>
      </section>

      <section id="how-it-works" className="section bg-[#24213f] text-white"><div className="shell grid gap-14 lg:grid-cols-[.8fr_1.2fr]"><div className="lg:sticky lg:top-28 lg:self-start"><p className="section-kicker text-violet-300">A continuous loop</p><h2 className="section-title text-white">From uncertainty to a plan you can verify.</h2><p className="mt-6 max-w-lg leading-7 text-white/60">No magic score. No fabricated profile. Your Twin changes when your saved records change.</p><Link href="/sign-up?redirect_url=/onboarding" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#a9f3d0]">Start with your profile <ArrowRight size={15}/></Link></div><div>{journey.map(([number,title,copy], index)=><div key={number} className="grid gap-5 border-t border-white/12 py-8 sm:grid-cols-[64px_1fr_auto]"><span className="font-mono text-xs text-violet-300">{number}</span><div><h3 className="text-xl font-bold">{title}</h3><p className="mt-2 max-w-xl text-sm leading-6 text-white/55">{copy}</p></div><span className="hidden size-9 place-items-center rounded-full border border-white/15 text-white/50 sm:grid"><ChevronRight size={15}/></span>{index === journey.length - 1 && <div/>}</div>)}</div></div></section>

      <section className="section shell"><div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]"><div className="border border-ink/8 bg-white p-8 sm:p-12"><GraduationCap className="text-accent" size={28}/><h2 className="mt-16 max-w-2xl text-4xl font-bold tracking-[-.055em] sm:text-5xl">Built for the beginning—and every career change after it.</h2><p className="mt-5 max-w-2xl leading-7 text-slate">Projects, coursework, internships, self-directed learning, and real work can all become useful evidence. Experience is never invented when it is missing.</p></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">{["No fabricated readiness scores", "Editable, reviewable recommendations", "Owner-scoped private records", "Core workflows remain usable without AI"].map(item=><div key={item} className="flex items-center gap-4 border border-ink/8 bg-[#f7f6ff] p-5"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-accent shadow-sm"><Check size={15}/></span><strong className="text-sm">{item}</strong></div>)}</div></div></section>

      <section id="about" className="px-5 pb-20"><div className="mx-auto max-w-[1280px] overflow-hidden rounded-[32px] bg-accent px-7 py-16 text-white sm:px-14 sm:py-20"><div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-violet-200">Your next move starts with the truth</p><h2 className="mt-5 max-w-4xl text-[clamp(2.7rem,6vw,5.5rem)] font-[740] leading-[.94] tracking-[-.065em]">Build a career profile you can actually act on.</h2><p className="mt-6 max-w-2xl text-base leading-7 text-white/65">Seven guided profile steps lead into one private workspace for skills, planning, practice, documents, and progress.</p></div><Link href="/sign-up?redirect_url=/onboarding" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-4 text-sm font-bold text-accent shadow-xl">Build My Career Twin<ArrowRight size={17}/></Link></div></div></section>
    </main>
    <footer className="border-t border-ink/8 bg-white py-10"><div className="shell flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"><Brand/><p className="max-w-md text-xs leading-5 text-slate">Career guidance based on your approved inputs. No employment outcomes are guaranteed.</p><div className="flex gap-5 text-xs font-bold"><Link href="#how-it-works">How It Works</Link><Link href="#about">About</Link><Link href="/sign-in">Log In</Link></div></div></footer><Pip/></div>
  );
}
