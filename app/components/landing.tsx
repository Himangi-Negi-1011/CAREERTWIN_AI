"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BookOpen, BrainCircuit, Check, ChevronRight, FileCheck2, GraduationCap, LockKeyhole, Map, Mic2, ShieldCheck, Sparkles, Target, WandSparkles } from "lucide-react";
import Link from "next/link";
import { Header } from "./header";
import { Pip } from "./pip";

const capabilities = [
  { icon: BrainCircuit, title: "Career intelligence", copy: "Connect your approved profile, evidence, goals, and progress in one evolving view." },
  { icon: Target, title: "Skill-gap analysis", copy: "Separate demonstrated, developing, assessed, and unverified skills without inventing readiness." },
  { icon: Map, title: "Adaptive roadmap", copy: "Turn the highest-value gaps into realistic learning tasks, projects, and weekly actions." },
  { icon: GraduationCap, title: "Learning Studio", copy: "Study structured curricula, complete objective practice, and keep durable progress." },
  { icon: Mic2, title: "Interview practice", copy: "Practise role-specific questions and convert reviewed feedback into roadmap work." },
  { icon: ShieldCheck, title: "Private by design", copy: "Use owner-scoped records, explicit saves, server-side AI, and portable exports." },
] as const;

const workflow = [
  ["01", "Build an honest profile", "Add your education, skills, projects, interests, and only the resume facts you approve."],
  ["02", "Create your Career Twin", "A reliable deterministic core maps your evidence. Secure AI prepares structured guidance when available."],
  ["03", "Follow one clear next move", "Use a focused roadmap, Learning Studio, weekly planning, and interview practice without losing context."],
  ["04", "Update through evidence", "Your Twin changes when saved work, assessments, and reviewed outcomes change—not from decorative scores."],
] as const;

function ProductPreview() {
  const reduce = useReducedMotion();
  return (
    <motion.div initial={reduce ? false : { opacity: 0, y: 18, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: .8, delay: .16, ease: [0.22, 1, 0.36, 1] }} className="relative mx-auto w-full max-w-[610px]">
      <div className="absolute -inset-14 -z-10 rounded-full bg-[#4285f4]/20 blur-[70px]" />
      <div className="overflow-hidden rounded-[28px] border border-[#cbd9f5] bg-white shadow-[0_35px_90px_rgba(41,72,135,.19)]">
        <div className="flex h-12 items-center justify-between border-b border-[#e5ebf7] px-4 sm:px-5"><div className="flex gap-1.5"><span className="size-2.5 rounded-full bg-[#ff8478]"/><span className="size-2.5 rounded-full bg-[#ffd66b]"/><span className="size-2.5 rounded-full bg-[#70d6a7]"/></div><span className="font-mono text-[8px] uppercase tracking-[.17em] text-[#7b87a3]">CareerTwin workspace</span><span className="size-2 rounded-full bg-[#2f72ff] shadow-[0_0_0_4px_rgba(47,114,255,.12)]"/></div>
        <div className="p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4"><div><p className="text-[11px] font-semibold text-[#71809d]">Today</p><h2 className="mt-1 text-2xl font-semibold tracking-[-.045em] text-[#16213b] sm:text-3xl">Your next move is ready.</h2></div><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#edf4ff] text-[#2f72ff]"><WandSparkles size={18}/></span></div>
          <div className="mt-6 rounded-2xl border border-[#dfe7f5] bg-[#f8faff] p-4"><div className="flex items-center justify-between gap-3"><span className="font-mono text-[8px] font-bold uppercase tracking-[.16em] text-[#2f72ff]">Recommended next action</span><span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-semibold text-[#70809c] shadow-sm">Evidence-led</span></div><h3 className="mt-4 text-lg font-semibold tracking-[-.03em] text-[#17223c]">Build one priority skill through a reviewable project.</h3><p className="mt-2 text-xs leading-5 text-[#71809d]">Open your roadmap, complete the next task, then attach the outcome to your Twin.</p><Link href="/sign-up?redirect_url=/onboarding" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#2f72ff]">Open the plan <ChevronRight size={13}/></Link></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-[#e2e8f3] p-4"><Target size={16} className="text-[#2f72ff]"/><strong className="mt-5 block text-2xl text-[#17223c]">3</strong><span className="mt-1 block text-[9px] font-semibold uppercase tracking-[.1em] text-[#8a95ac]">Priority gaps</span></div><div className="rounded-2xl border border-[#e2e8f3] p-4"><BookOpen size={16} className="text-[#7857e8]"/><strong className="mt-5 block text-2xl text-[#17223c]">1</strong><span className="mt-1 block text-[9px] font-semibold uppercase tracking-[.1em] text-[#8a95ac]">Active path</span></div><div className="rounded-2xl bg-[#2f72ff] p-4 text-white"><Sparkles size={16}/><strong className="mt-5 block text-lg leading-5">Twin<br/>connected</strong><span className="mt-2 block text-[9px] uppercase tracking-[.1em] text-white/65">Private workspace</span></div></div>
        </div>
      </div>
      <motion.div animate={reduce ? undefined : { y: [0, -8, 0] }} transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }} className="absolute -right-3 top-[27%] hidden w-48 rounded-2xl border border-[#dbe5f7] bg-white p-3 shadow-[0_18px_45px_rgba(44,77,141,.16)] sm:block"><div className="flex items-center gap-2"><span className="grid size-7 place-items-center rounded-lg bg-[#eaf8f2] text-[#21966c]"><Check size={13}/></span><div><strong className="block text-[11px] text-[#17223c]">Evidence saved</strong><span className="block text-[9px] text-[#8a95ac]">Twin recalculated</span></div></div></motion.div>
      <motion.div animate={reduce ? undefined : { y: [0, 7, 0] }} transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: .4 }} className="absolute -bottom-6 -left-3 hidden w-52 rounded-2xl border border-[#dbe5f7] bg-white p-3 shadow-[0_18px_45px_rgba(44,77,141,.16)] sm:block"><span className="text-[9px] font-bold uppercase tracking-[.12em] text-[#8a95ac]">Provider-safe</span><div className="mt-2 flex items-center gap-2 text-[11px] font-semibold text-[#17223c]"><LockKeyhole size={14} className="text-[#2f72ff]"/>API keys stay server-side</div></motion.div>
    </motion.div>
  );
}

function FeaturePreview() {
  return <div className="rounded-[30px] border border-[#d8e3f5] bg-[#f4f8ff] p-4 sm:p-6"><div className="overflow-hidden rounded-[22px] border border-[#dce5f4] bg-white shadow-[0_24px_60px_rgba(52,83,145,.1)]"><div className="flex items-center justify-between border-b border-[#e4ebf6] px-5 py-4"><strong className="text-sm tracking-[-.02em] text-[#17223c]">Skill topology</strong><span className="rounded-full bg-[#edf4ff] px-3 py-1 text-[9px] font-bold uppercase tracking-[.1em] text-[#2f72ff]">Target connected</span></div><div className="grid gap-4 p-5 sm:grid-cols-[1fr_.8fr]"><div className="rounded-2xl bg-[#17223c] p-5 text-white"><p className="font-mono text-[8px] uppercase tracking-[.16em] text-[#9fb8ff]">Highest priority</p><h3 className="mt-4 text-2xl font-semibold tracking-[-.04em]">Turn gaps into proof.</h3><p className="mt-3 text-xs leading-5 text-white/55">Every recommendation explains what is known, what is missing, and how to produce reviewable evidence.</p><div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-3/5 rounded-full bg-[#62a1ff]"/></div></div><div className="space-y-3">{[["Demonstrated", "2", "#dff7ed", "#18765a"], ["Developing", "4", "#eee9ff", "#6a4dc9"], ["Unverified", "3", "#fff1e7", "#b75924"]].map(([label, value, bg, color]) => <div key={label} className="flex items-center justify-between rounded-2xl border border-[#e3e9f3] p-4"><span className="text-xs font-semibold text-[#53617c]">{label}</span><span className="grid size-8 place-items-center rounded-full text-xs font-bold" style={{background:bg,color}}>{value}</span></div>)}</div></div></div></div>;
}

export function Landing() {
  return (
    <div className="assistant-page min-h-screen bg-[#edf4ff] text-[#17223c]">
      <Header />
      <main>
        <section id="home" className="px-4 pb-12 pt-24 sm:px-6 sm:pb-16 sm:pt-28">
          <div className="assistant-hero mx-auto max-w-[1450px] overflow-hidden rounded-[34px] border border-white/80 bg-white/85 px-6 py-14 shadow-[0_35px_90px_rgba(51,78,129,.14)] backdrop-blur-xl sm:px-10 sm:py-20 lg:px-16">
            <div className="grid gap-16 lg:grid-cols-[.92fr_1.08fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#dce6f6] bg-white px-3 py-2 font-mono text-[8px] font-bold uppercase tracking-[.15em] text-[#2f72ff] shadow-sm">
                  <Sparkles size={12}/>Personal career intelligence
                </div>
                <h1 aria-label="Your career. Your potential. Your AI Twin." className="mt-7 max-w-3xl text-[clamp(3.6rem,6.8vw,7rem)] font-medium leading-[.86] tracking-[-.075em]">
                  See your career clearly.<br/>Build real evidence.<br/><span className="assistant-highlight">Move forward.</span>
                </h1>
                <p className="mt-7 max-w-xl text-base leading-7 text-[#687691] sm:text-lg">
                  CareerTwin turns the profile you approve into transparent skill priorities, an actionable roadmap, focused learning, and one useful next move.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link href="/sign-up?redirect_url=/onboarding" aria-label="Build My Career Twin" className="assistant-primary">
                    Build My Career Twin <ArrowRight size={16}/>
                  </Link>
                  <Link href="#how-it-works" className="assistant-secondary">
                    See how it works <ChevronRight size={15}/>
                  </Link>
                </div>
                <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-[11px] font-semibold text-[#71809d]">
                  {["Evidence-led", "Private by design", "Works without AI"].map(item => (
                    <span key={item} className="flex items-center gap-2">
                      <span className="grid size-5 place-items-center rounded-full bg-[#e7f8f1] text-[#21815f]">
                        <Check size={11}/>
                      </span>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <ProductPreview/>
            </div>
          </div>
        </section>

        <section id="product" className="bg-white py-24 sm:py-32">
          <div className="mx-auto max-w-[1240px] px-6 sm:px-10">
            <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
              <div>
                <p className="assistant-kicker">One connected workspace</p>
                <h2 className="mt-5 text-[clamp(2.8rem,5vw,5rem)] font-medium leading-[.94] tracking-[-.065em]">
                  Your career context should compound—not disappear between tools.
                </h2>
              </div>
              <p className="max-w-xl pb-1 text-base leading-7 text-[#6f7b93]">
                Profile, evidence, learning, roadmaps, weekly work, assessments, and interview practice stay connected to the same canonical Twin.
              </p>
            </div>
            <div className="mt-16">
              <FeaturePreview/>
            </div>
          </div>
        </section>

        <section id="capabilities" className="bg-[#f5f8fd] py-24 sm:py-32">
          <div className="mx-auto max-w-[1240px] px-6 sm:px-10">
            <div className="max-w-3xl">
              <p className="assistant-kicker">Built for useful progress</p>
              <h2 className="mt-5 text-[clamp(3rem,5.5vw,5.5rem)] font-medium leading-[.92] tracking-[-.065em]">
                Everything you need to understand, build, and prove your next capability.
              </h2>
            </div>
            <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {capabilities.map(({icon:Icon,title,copy}, index) => (
                <article key={title} className={`group min-h-64 rounded-[24px] border p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(48,78,139,.1)] ${index === 0 ? "border-[#25416e] bg-[#17223c] text-white" : "border-[#dfe7f3] bg-white"}`}>
                  <span className={`grid size-11 place-items-center rounded-xl ${index === 0 ? "bg-white/10 text-[#8eb8ff]" : "bg-[#edf4ff] text-[#2f72ff]"}`}>
                    <Icon size={19}/>
                  </span>
                  <h3 className="mt-14 text-xl font-semibold tracking-[-.035em]">{title}</h3>
                  <p className={`mt-3 text-sm leading-6 ${index === 0 ? "text-white/55" : "text-[#72809a]"}`}>{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="bg-white py-24 sm:py-32">
          <div className="mx-auto grid max-w-[1240px] gap-16 px-6 sm:px-10 lg:grid-cols-[.78fr_1.22fr]">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="assistant-kicker">A reliable workflow</p>
              <h2 className="mt-5 text-[clamp(3rem,5.3vw,5.3rem)] font-medium leading-[.92] tracking-[-.065em]">
                AI assistance without surrendering the source of truth.
              </h2>
              <p className="mt-6 max-w-lg text-sm leading-7 text-[#72809a]">
                The deterministic Twin is created first. Secure AI can add validated guidance, while provider failure never erases your profile or core workflow.
              </p>
            </div>
            <div>
              {workflow.map(([n,title,copy]) => (
                <article key={n} className="grid gap-5 border-t border-[#dfe6f1] py-8 sm:grid-cols-[58px_1fr_auto]">
                  <span className="font-mono text-[9px] font-bold tracking-[.16em] text-[#2f72ff]">{n}</span>
                  <div>
                    <h3 className="text-xl font-semibold tracking-[-.035em]">{title}</h3>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-[#748098]">{copy}</p>
                  </div>
                  <span className="grid size-9 place-items-center rounded-full border border-[#dce5f3] text-[#2f72ff]">
                    <ChevronRight size={14}/>
                  </span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="privacy" className="bg-[#17223c] py-24 text-white sm:py-32">
          <div className="mx-auto max-w-[1240px] px-6 sm:px-10">
            <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-end">
              <div>
                <p className="assistant-kicker !text-[#8eb8ff]">Private by design</p>
                <h2 className="mt-5 text-[clamp(3rem,5.5vw,5.7rem)] font-medium leading-[.9] tracking-[-.065em]">
                  Your career data is context—not ad inventory.
                </h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[[LockKeyhole,"Keys stay on the server"],[FileCheck2,"Resume facts require review"],[ShieldCheck,"Owner-scoped records"],[BrainCircuit,"Clear AI fallback states"]].map(([IconOrTitle, label]) => {
                  const Icon = IconOrTitle as typeof LockKeyhole;
                  return (
                    <div key={label as string} className="rounded-2xl border border-white/10 bg-white/[.035] p-5">
                      <Icon size={18} className="text-[#8eb8ff]"/>
                      <strong className="mt-8 block text-sm">{label as string}</strong>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="bg-[#edf4ff] px-5 py-20 sm:px-8 sm:py-28">
          <div className="assistant-cta mx-auto max-w-[1240px] overflow-hidden rounded-[32px] border border-white/80 bg-white px-7 py-16 shadow-[0_32px_80px_rgba(51,78,129,.13)] sm:px-14 sm:py-20">
            <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="assistant-kicker">Start with what is true</p>
                <h2 className="mt-5 max-w-4xl text-[clamp(3rem,6vw,6rem)] font-medium leading-[.9] tracking-[-.07em]">
                  Build a Career Twin you can actually act on.
                </h2>
                <p className="mt-6 max-w-2xl text-base leading-7 text-[#71809b]">
                  Seven guided profile steps lead into one private workspace for skills, learning, planning, practice, documents, and evidence.
                </p>
              </div>
              <Link href="/sign-up?redirect_url=/onboarding" aria-label="Build My Career Twin" className="assistant-primary">
                Create my Twin <ArrowRight size={16}/>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-[#dce5f3] bg-white py-10">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-6 sm:flex-row sm:items-end sm:justify-between sm:px-10">
          <div>
            <strong className="text-lg font-bold tracking-[-.04em]">Career<span className="text-[#2f72ff]">Twin</span></strong>
            <p className="mt-2 max-w-md text-xs leading-5 text-[#8390a7]">
              Career guidance based on approved inputs. Employment outcomes are not guaranteed.
            </p>
          </div>
          <div className="flex flex-wrap gap-5 text-xs font-semibold text-[#65738e]">
            <Link href="#capabilities">Capabilities</Link>
            <Link href="#how-it-works">How it works</Link>
            <Link href="#privacy">Privacy</Link>
            <Link href="/sign-in">Log in</Link>
          </div>
        </div>
      </footer>
      <Pip />
    </div>
  );
}
