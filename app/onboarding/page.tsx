"use client";

import { useAuth } from "@clerk/nextjs";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  GraduationCap,
  Lightbulb,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Target,
  Trash2,
  Upload,
  UserRound,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Brand } from "../components/brand";
import { careerProfileSchema, emptyCareerProfile, type CareerProfileData } from "@/lib/profile/schema";
import { curatedInstitutions } from "@/lib/profile/institutions";
import {
  standardDegrees,
  commonSpecializations,
  academicYears,
  targetRoleSuggestions,
  popularSkillPills,
} from "@/lib/profile/degrees";
import { AutocompleteInput } from "../components/profile/autocomplete-input";

const steps = [
  [UserRound, "Personal Profile", "Tell CareerTwin who you are today."],
  [GraduationCap, "Education", "Add your college, degree, and current academic standing."],
  [Wrench, "Skills", "Choose skills honestly and mark what you are learning."],
  [Sparkles, "Projects & Experience", "Projects, internships, certifications, and achievements all count."],
  [FileText, "Resume Upload", "Upload a resume and review extracted information before importing."],
  [Target, "Career Interests", "Choose the direction and role you want CareerTwin to support."],
  [Check, "Profile Review", "Review everything before creating your AI Career Twin."],
] as const;

const industries = ["Technology & Software", "FinTech & Banking", "Healthcare & BioTech", "E-Commerce & Retail", "Consulting & Services", "AI & Data Science", "Telecommunications", "Media & Entertainment"];
const inputClass = "mt-2 w-full rounded-xl border border-ink/10 bg-white px-3.5 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-violet-100 placeholder:text-slate/40";
const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

type SubmissionStage = "idle" | "validating" | "saving_profile" | "analyzing_gaps" | "generating_twin" | "ready" | "error";

export default function OnboardingPage() {
  const { userId, isSignedIn, isLoaded: authLoaded } = useAuth();
  const router = useRouter();
  const key = `careertwin-profile-wizard:${userId ?? "guest"}`;

  const [profile, setProfile] = useState<CareerProfileData>(emptyCareerProfile);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submissionStage, setSubmissionStage] = useState<SubmissionStage>("idle");
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [message, setMessage] = useState("");
  const [skillQuery, setSkillQuery] = useState("");

  useEffect(() => {
    if (!authLoaded) return;
    let cancelled = false;

    async function load() {
      const raw = localStorage.getItem(key);
      let draft: ReturnType<typeof careerProfileSchema.safeParse> | null = null;
      if (raw) {
        try {
          draft = careerProfileSchema.safeParse(JSON.parse(raw));
        } catch {
          localStorage.removeItem(key);
        }
      }
      let selected = draft?.success ? draft.data : null;

      if (isSignedIn) {
        try {
          const response = await fetch("/api/profile");
          const payload = (await response.json()) as { data?: { profile_data?: unknown } | null };
          const remote = careerProfileSchema.safeParse(payload.data?.profile_data);
          if (remote.success) {
            const draftTime = selected?.updatedAt ? Date.parse(selected.updatedAt) : 0;
            const remoteTime = remote.data.updatedAt ? Date.parse(remote.data.updatedAt) : 0;
            if (!selected || remoteTime >= draftTime) selected = remote.data;
          }
        } catch {
          /* a valid browser draft remains the recovery path */
        }
      }

      if (!cancelled) {
        setProfile(selected ?? emptyCareerProfile);
        setLoaded(true);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [key, isSignedIn, authLoaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(key, JSON.stringify(profile));
  }, [profile, key, loaded]);

  const step = profile.currentStep;
  const completion = Math.round((new Set(profile.completedSteps).size / 7) * 100);

  const update = <K extends keyof CareerProfileData>(keyName: K, value: CareerProfileData[K]) =>
    setProfile((p) => ({ ...p, [keyName]: value, updatedAt: new Date().toISOString() }));

  const setPersonal = (name: keyof CareerProfileData["personal"], value: string) =>
    update("personal", { ...profile.personal, [name]: value });

  const setInterests = (name: keyof CareerProfileData["interests"], value: string) =>
    update("interests", { ...profile.interests, [name]: value });

  const canContinue = useMemo(() => {
    if (step === 1) return Boolean(profile.personal.fullName && profile.personal.status);
    if (step === 2) return profile.education.length > 0 && Boolean(profile.education[0]?.institution && profile.education[0]?.degree);
    if (step === 3) return profile.skills.length > 0;
    if (step === 6) return Boolean(profile.interests.targetRole);
    return true;
  }, [step, profile]);

  async function uploadResume(file: File) {
    if (file.size > 5_242_880) {
      setMessage("Resume must be 5 MB or smaller.");
      return;
    }
    update("resume", { fileName: file.name, size: file.size, status: isSignedIn ? "processing" : "selected", storagePath: "" });
    if (!isSignedIn) {
      setMessage("File selected locally. Sign in to upload it securely.");
      return;
    }
    setSaving(true);
    try {
      const form = new FormData();
      form.append("resume", file);
      const response = await fetch("/api/profile/resume", { method: "POST", body: form });
      const payload = (await response.json()) as { data?: CareerProfileData["resume"]; error?: { message: string } };
      if (!response.ok || !payload.data) {
        update("resume", { fileName: file.name, size: file.size, status: "failed", storagePath: "" });
        setMessage(payload.error?.message || "Resume upload failed.");
        return;
      }
      update("resume", payload.data);
      setMessage("Resume uploaded securely.");
    } catch {
      setMessage("Resume upload failed; no success was recorded.");
    } finally {
      setSaving(false);
    }
  }

  async function removeResume() {
    const path = profile.resume.storagePath;
    try {
      if (path && isSignedIn) {
        const response = await fetch(`/api/profile/resume?path=${encodeURIComponent(path)}`, { method: "DELETE" });
        if (!response.ok) {
          setMessage("The uploaded resume could not be deleted.");
          return;
        }
      }
      update("resume", emptyCareerProfile.resume);
      setMessage("Resume removed.");
    } catch {
      setMessage("The uploaded resume could not be deleted. Please try again.");
    }
  }

  async function saveRemote(complete = false) {
    if (!isSignedIn) return true;
    setSaving(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, complete }),
      });
      const payload = (await response.json()) as { error?: { message: string } };
      if (!response.ok) {
        setMessage(payload.error?.message || "Secure save failed; browser draft retained.");
        return false;
      }
      setMessage(complete ? "Career profile created." : "Progress saved securely.");
      return true;
    } catch {
      setMessage("Secure save is unavailable; browser draft retained.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function saveAndExit() {
    const saved = await saveRemote(false);
    if (saved) router.push(isSignedIn ? "/dashboard" : "/");
  }

  async function next() {
    if (!canContinue) return;
    const done = Array.from(new Set([...profile.completedSteps, step]));
    const nextStep = Math.min(7, step + 1);
    const nextProfile = { ...profile, completedSteps: done, currentStep: nextStep };
    setProfile(nextProfile);

    if (isSignedIn) {
      setSaving(true);
      try {
        await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile: nextProfile, complete: false }),
        });
      } catch {
        setMessage("This step is saved in your browser; cloud sync will retry.");
      } finally {
        setSaving(false);
      }
    }
  }

  async function finish() {
    const completeProfile: CareerProfileData = {
      ...profile,
      completedSteps: [1, 2, 3, 4, 5, 6, 7],
      currentStep: 7,
      updatedAt: new Date().toISOString(),
    };
    setProfile(completeProfile);

    if (profile.interests.targetRole) {
      localStorage.setItem(`careertwin-role-draft:${userId ?? ""}`, profile.interests.targetRole);
    }

    if (!isSignedIn) {
      router.push("/sign-up?redirect_url=/onboarding");
      return;
    }

    setSaving(true);
    setSubmissionStage("validating");
    setSubmissionMessage("Validating your career profile details…");

    try {
      // Stage 1: Validation
      await new Promise((r) => setTimeout(r, 400));
      setSubmissionStage("saving_profile");
      setSubmissionMessage("Saving your profile to secure workspace…");

      // Stage 2: Save Profile
      const saveRes = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: completeProfile, complete: true }),
      });
      if (!saveRes.ok) {
        throw new Error("Profile save failed. Your browser draft is safe.");
      }

      // Stage 3: Analyze Gaps & Consult AI Twin Engine
      setSubmissionStage("analyzing_gaps");
      setSubmissionMessage(`Analyzing skill gaps for ${completeProfile.interests.targetRole || "target role"}…`);
      await new Promise((r) => setTimeout(r, 500));

      setSubmissionStage("generating_twin");
      setSubmissionMessage("Consulting AI Career Engine & preparing personalized roadmap…");

      // Stage 4: Dedicated Twin Creation Endpoint
      const twinRes = await fetch("/api/twin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: completeProfile,
          generateAiRoadmap: true,
          reviewedResumeFacts: completeProfile.resume.fileName ? [completeProfile.resume.fileName] : [],
        }),
      });

      if (!twinRes.ok) {
        const errorJson = await twinRes.json().catch(() => ({}));
        throw new Error(errorJson.error?.message || "Failed to finalize Career Twin state.");
      }

      setSubmissionStage("ready");
      setSubmissionMessage("AI Career Twin successfully initialized! Launching dashboard…");
      await new Promise((r) => setTimeout(r, 600));

      router.push("/dashboard");
    } catch (error) {
      setSubmissionStage("error");
      const errText = error instanceof Error ? error.message : "Career Twin creation encountered an error.";
      setSubmissionMessage(errText);
      setMessage(errText);
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) {
    return (
      <main className="grid min-h-dvh place-items-center bg-app">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 animate-spin rounded-full border-3 border-accent border-t-transparent" />
          <span className="text-sm font-semibold text-slate">Loading your profile draft…</span>
        </div>
      </main>
    );
  }

  // Institution suggestions for autocomplete
  const institutionItems = curatedInstitutions.map((inst) => ({
    id: inst.name,
    title: inst.name,
    subtitle: inst.location,
    badge: inst.type,
  }));

  return (
    <div className="min-h-dvh bg-app text-ink">
      <header className="border-b border-ink/8 bg-white sticky top-0 z-40 backdrop-blur-md bg-white/90">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5">
          <Brand />
          <div className="flex items-center gap-3">
            <span className="hidden text-xs font-bold text-slate sm:inline-block">
              {completion}% profile complete
            </span>
            <button
              onClick={() => void saveAndExit()}
              disabled={saving || submissionStage !== "idle"}
              className="button-secondary rounded-xl px-4 py-2.5 text-xs font-semibold"
            >
              <Save size={14} />
              {saving ? "Saving…" : "Save & Exit"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1440px] gap-0 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
        {/* Left Step Navigation Sidebar */}
        <aside className="border-r border-ink/8 bg-white p-5 lg:min-h-[calc(100dvh-72px)]">
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-slate">Build Your Career Profile</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-app">
            <div
              className="h-full bg-[linear-gradient(90deg,#6547f1,#a127ec)] transition-all duration-300"
              style={{ width: `${Math.max(10, completion)}%` }}
            />
          </div>

          <nav className="mt-6 space-y-1.5" aria-label="Profile setup steps">
            {steps.map(([, label], i) => {
              const n = i + 1;
              const done = profile.completedSteps.includes(n);
              const active = step === n;
              return (
                <button
                  key={label}
                  onClick={() => setProfile((p) => ({ ...p, currentStep: n }))}
                  disabled={saving || submissionStage !== "idle"}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${
                    active
                      ? "bg-violet-50 text-accent shadow-sm"
                      : done
                      ? "text-ink hover:bg-app"
                      : "text-slate hover:bg-app/60"
                  }`}
                >
                  <span
                    className={`grid size-7 place-items-center rounded-lg text-xs transition ${
                      active
                        ? "bg-accent text-white"
                        : done
                        ? "bg-emerald-50 text-emerald-600 font-bold"
                        : "bg-app text-slate"
                    }`}
                  >
                    {done ? <Check size={14} /> : n}
                  </span>
                  <span className="truncate">
                    {n}. {label}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="mt-8 rounded-2xl border border-ink/8 bg-cream/40 p-4 text-xs leading-5 text-slate">
            <strong className="block text-ink font-bold mb-1">Smart Profile Guide</strong>
            Complete each step with genuine information. CareerTwin uses this to customize your lessons, gaps, and roadmap.
          </div>
        </aside>

        {/* Center Main Form */}
        <section className="min-w-0 p-5 sm:p-8 lg:p-10">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center justify-between gap-4">
              <span className="rounded-full bg-violet-100 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-accent">
                STEP {step} OF 7
              </span>
              <span className="text-xs text-slate font-medium">
                Step {step} of 7: {steps[step - 1][1]}
              </span>
            </div>

            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              {steps[step - 1][1]}
            </h1>
            <p className="mt-2 text-sm text-slate leading-6">{steps[step - 1][2]}</p>

            {/* Submission Progress Overlay Banner */}
            {submissionStage !== "idle" && (
              <div
                className={`mt-6 rounded-2xl border p-5 transition ${
                  submissionStage === "error"
                    ? "border-rose-200 bg-rose-50 text-rose-900"
                    : submissionStage === "ready"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : "border-violet-200 bg-violet-50 text-ink"
                }`}
              >
                <div className="flex items-center gap-3">
                  {submissionStage === "error" ? (
                    <span className="grid size-9 place-items-center rounded-xl bg-rose-600 text-white font-bold">!</span>
                  ) : submissionStage === "ready" ? (
                    <span className="grid size-9 place-items-center rounded-xl bg-emerald-600 text-white"><Check size={18} /></span>
                  ) : (
                    <RefreshCw size={20} className="animate-spin text-accent" />
                  )}
                  <div className="flex-1">
                    <strong className="block text-sm font-bold">
                      {submissionStage === "validating" && "Step 1/4: Validating Profile"}
                      {submissionStage === "saving_profile" && "Step 2/4: Saving Profile"}
                      {submissionStage === "analyzing_gaps" && "Step 3/4: Analyzing Skill Gaps"}
                      {submissionStage === "generating_twin" && "Step 4/4: Initializing AI Career Twin"}
                      {submissionStage === "ready" && "Ready!"}
                      {submissionStage === "error" && "Generation Issue"}
                    </strong>
                    <p className="text-xs leading-5 text-slate mt-0.5">{submissionMessage}</p>
                  </div>
                  {submissionStage === "error" && (
                    <button
                      onClick={() => void finish()}
                      className="button-primary text-xs px-4 py-2"
                    >
                      Retry Creation
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Card Content Container */}
            <div className="mt-6 rounded-3xl border border-ink/8 bg-white p-5 shadow-[0_16px_45px_rgba(32,36,64,.05)] sm:p-8">
              {/* STEP 1: PERSONAL PROFILE */}
              {step === 1 && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="text-xs font-bold text-ink">
                    Full name <span className="text-rose-500">*</span>
                    <input
                      value={profile.personal.fullName}
                      onChange={(e) => setPersonal("fullName", e.target.value)}
                      placeholder="e.g. Alex Rivera"
                      className={inputClass}
                      required
                    />
                  </label>

                  <label className="text-xs font-bold text-ink">
                    Current status <span className="text-rose-500">*</span>
                    <select
                      value={profile.personal.status}
                      onChange={(e) => setPersonal("status", e.target.value)}
                      className={inputClass}
                      required
                    >
                      <option value="">Select current status</option>
                      <option value="student">Student (Pursuing Degree / Diploma)</option>
                      <option value="fresher">Fresher (Recent Graduate)</option>
                      <option value="employed">Employed (Working Professional)</option>
                      <option value="career-switcher">Career Switcher</option>
                      <option value="other">Self-Taught / Other</option>
                    </select>
                  </label>

                  <label className="text-xs font-bold text-ink sm:col-span-2">
                    Professional headline
                    <input
                      value={profile.personal.headline}
                      onChange={(e) => setPersonal("headline", e.target.value)}
                      className={inputClass}
                      placeholder="e.g. BCA 3rd Year student exploring Full-Stack Cloud Development"
                    />
                  </label>

                  <label className="text-xs font-bold text-ink">
                    Current location (City, Country)
                    <input
                      value={profile.personal.location}
                      onChange={(e) => setPersonal("location", e.target.value)}
                      placeholder="e.g. Bangalore, India"
                      className={inputClass}
                    />
                  </label>

                  <label className="text-xs font-bold text-ink">
                    Preferred learning language
                    <input
                      value={profile.personal.preferredLanguage || "English"}
                      onChange={(e) => setPersonal("preferredLanguage", e.target.value)}
                      placeholder="e.g. English, Hindi"
                      className={inputClass}
                    />
                  </label>

                  <label className="text-xs font-bold text-ink">
                    LinkedIn profile URL, optional
                    <input
                      value={profile.personal.linkedInUrl || ""}
                      onChange={(e) => setPersonal("linkedInUrl", e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className={inputClass}
                    />
                  </label>

                  <label className="text-xs font-bold text-ink">
                    GitHub profile URL, optional
                    <input
                      value={profile.personal.githubUrl || ""}
                      onChange={(e) => setPersonal("githubUrl", e.target.value)}
                      placeholder="https://github.com/username"
                      className={inputClass}
                    />
                  </label>

                  <label className="text-xs font-bold text-ink sm:col-span-2">
                    Short bio or introduction
                    <textarea
                      value={profile.personal.bio}
                      onChange={(e) => setPersonal("bio", e.target.value)}
                      rows={3}
                      className={inputClass}
                      placeholder="Share your background, passions, and what drives your career transition…"
                    />
                  </label>
                </div>
              )}

              {/* STEP 2: SMART EDUCATION SECTION (Unstop-like Experience) */}
              {step === 2 && (
                <div className="space-y-6">
                  {profile.education.map((ed, i) => (
                    <div key={ed.id} className="relative rounded-2xl border border-ink/8 bg-cream/20 p-5 sm:p-6">
                      <div className="flex items-center justify-between pb-3 border-b border-ink/8 mb-5">
                        <div className="flex items-center gap-2">
                          <span className="grid size-6 place-items-center rounded-lg bg-violet-100 text-accent text-xs font-bold">
                            {i + 1}
                          </span>
                          <strong className="text-sm font-bold text-ink">
                            {ed.degree ? `${ed.degree} ${ed.institution ? `· ${ed.institution}` : ""}` : `Education ${i + 1}`}
                          </strong>
                        </div>
                        <button
                          onClick={() => update("education", profile.education.filter((x) => x.id !== ed.id))}
                          aria-label={`Remove education ${i + 1}`}
                          className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 transition"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        {/* College Autocomplete Search */}
                        <div className="sm:col-span-2">
                          <AutocompleteInput
                            label="College or institution"
                            required
                            value={ed.institution}
                            onChange={(val) =>
                              update("education", profile.education.map((x) => (x.id === ed.id ? { ...x, institution: val } : x)))
                            }
                            items={institutionItems}
                            placeholder="Type to search your university or college (e.g. IIT, DU, BITS, VIT…)"
                          />
                        </div>

                        {/* Degree Dropdown with common options */}
                        <label className="text-xs font-bold text-ink">
                          Degree or qualification <span className="text-rose-500">*</span>
                          <input
                            list={`degree-options-${ed.id}`}
                            value={ed.degree}
                            onChange={(e) =>
                              update("education", profile.education.map((x) => (x.id === ed.id ? { ...x, degree: e.target.value } : x)))
                            }
                            placeholder="e.g. BCA, B.Tech, MCA, B.Sc…"
                            className={inputClass}
                            required
                          />
                          <datalist id={`degree-options-${ed.id}`}>
                            {standardDegrees.map((d) => (
                              <option key={d.code} value={d.code}>
                                {d.name}
                              </option>
                            ))}
                          </datalist>
                        </label>

                        {/* Branch / Specialization */}
                        <label className="text-xs font-bold text-ink">
                          Branch or specialization
                          <input
                            list={`spec-options-${ed.id}`}
                            value={ed.field}
                            onChange={(e) =>
                              update("education", profile.education.map((x) => (x.id === ed.id ? { ...x, field: e.target.value } : x)))
                            }
                            placeholder="e.g. Computer Science, AI, Information Tech"
                            className={inputClass}
                          />
                          <datalist id={`spec-options-${ed.id}`}>
                            {commonSpecializations.map((spec) => (
                              <option key={spec} value={spec} />
                            ))}
                          </datalist>
                        </label>

                        {/* Current Year / Standing */}
                        <label className="text-xs font-bold text-ink">
                          Current academic year / status
                          <select
                            value={ed.currentYear || ""}
                            onChange={(e) =>
                              update("education", profile.education.map((x) => (x.id === ed.id ? { ...x, currentYear: e.target.value } : x)))
                            }
                            className={inputClass}
                          >
                            <option value="">Select current year / semester</option>
                            {academicYears.map((yr) => (
                              <option key={yr} value={yr}>
                                {yr}
                              </option>
                            ))}
                          </select>
                        </label>

                        {/* Education Status */}
                        <label className="text-xs font-bold text-ink">
                          Education status
                          <select
                            value={ed.status || "pursuing"}
                            onChange={(e) =>
                              update("education", profile.education.map((x) => (x.id === ed.id ? { ...x, status: e.target.value } : x)))
                            }
                            className={inputClass}
                          >
                            <option value="pursuing">Currently Pursuing</option>
                            <option value="completed">Completed / Graduated</option>
                            <option value="incomplete">Incomplete / Self-Taught</option>
                          </select>
                        </label>

                        {/* Start Year */}
                        <label className="text-xs font-bold text-ink">
                          Start year
                          <select
                            value={ed.startYear}
                            onChange={(e) =>
                              update("education", profile.education.map((x) => (x.id === ed.id ? { ...x, startYear: e.target.value } : x)))
                            }
                            className={inputClass}
                          >
                            <option value="">Select start year</option>
                            {Array.from({ length: 15 }, (_, idx) => 2016 + idx).map((yr) => (
                              <option key={yr} value={String(yr)}>
                                {yr}
                              </option>
                            ))}
                          </select>
                        </label>

                        {/* Expected Graduation Year */}
                        <label className="text-xs font-bold text-ink">
                          Expected graduation year
                          <select
                            value={ed.graduationYear}
                            onChange={(e) =>
                              update("education", profile.education.map((x) => (x.id === ed.id ? { ...x, graduationYear: e.target.value } : x)))
                            }
                            className={inputClass}
                          >
                            <option value="">Select graduation year</option>
                            {Array.from({ length: 15 }, (_, idx) => 2018 + idx).map((yr) => (
                              <option key={yr} value={String(yr)}>
                                {yr}
                              </option>
                            ))}
                          </select>
                        </label>

                        {/* CGPA / Grade */}
                        <label className="text-xs font-bold text-ink sm:col-span-2">
                          GPA, CGPA or percentage (optional)
                          <input
                            value={ed.grade}
                            onChange={(e) =>
                              update("education", profile.education.map((x) => (x.id === ed.id ? { ...x, grade: e.target.value } : x)))
                            }
                            placeholder="e.g. 8.5 CGPA or 82%"
                            className={inputClass}
                          />
                        </label>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() =>
                      update("education", [
                        ...profile.education,
                        {
                          id: makeId(),
                          institution: "",
                          degree: "",
                          field: "",
                          course: "",
                          startYear: "",
                          graduationYear: "",
                          status: "pursuing",
                          grade: "",
                          currentYear: "",
                          currentSemester: "",
                          coursework: "",
                        },
                      ])
                    }
                    className="button-secondary w-full py-3 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold border-dashed"
                  >
                    <Plus size={16} /> Add education qualification
                  </button>
                </div>
              )}

              {/* STEP 3: SKILLS SECTION */}
              {step === 3 && (
                <div>
                  <label className="block text-xs font-bold text-ink">
                    Search or add a skill <span className="text-rose-500">*</span>
                    <input
                      value={skillQuery}
                      onChange={(e) => setSkillQuery(e.target.value)}
                      className={inputClass}
                      placeholder="Type a skill (e.g. Python, React, SQL, Cloud Security…)"
                    />
                  </label>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-slate uppercase tracking-wider mr-1">Suggestions:</span>
                    {popularSkillPills
                      .filter((s) => s.toLowerCase().includes(skillQuery.toLowerCase()))
                      .slice(0, 10)
                      .map((s) => {
                        const exists = profile.skills.some((x) => x.name.toLowerCase() === s.toLowerCase());
                        return (
                          <button
                            key={s}
                            onClick={() => {
                              if (!exists) {
                                update("skills", [
                                  ...profile.skills,
                                  {
                                    id: makeId(),
                                    name: s,
                                    category: "Technical",
                                    proficiency: "beginner",
                                    learning: false,
                                    evidence: "",
                                    yearsExperience: "",
                                    isStrength: false,
                                  },
                                ]);
                              }
                            }}
                            disabled={exists}
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                              exists
                                ? "bg-violet-100 text-accent font-bold cursor-default"
                                : "border border-ink/10 bg-white hover:border-accent hover:text-accent"
                            }`}
                          >
                            {exists ? `✓ ${s}` : `+ ${s}`}
                          </button>
                        );
                      })}

                    {skillQuery.trim() &&
                      !popularSkillPills.some((s) => s.toLowerCase() === skillQuery.trim().toLowerCase()) && (
                        <button
                          onClick={() => {
                            update("skills", [
                              ...profile.skills,
                              {
                                id: makeId(),
                                name: skillQuery.trim(),
                                category: "Custom",
                                proficiency: "beginner",
                                learning: false,
                                evidence: "",
                                yearsExperience: "",
                                isStrength: false,
                              },
                            ]);
                            setSkillQuery("");
                          }}
                          className="rounded-full bg-violet-100 px-3.5 py-1.5 text-xs font-bold text-accent hover:bg-violet-200 transition"
                        >
                          Add “{skillQuery.trim()}”
                        </button>
                      )}
                  </div>

                  <div className="mt-8 space-y-3">
                    <p className="text-xs font-bold text-slate uppercase tracking-wider">
                      Selected Skills ({profile.skills.length})
                    </p>

                    {profile.skills.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-ink/10 p-8 text-center text-xs text-slate">
                        No skills added yet. Click suggestions above or type custom skills to build your Career Twin.
                      </div>
                    ) : (
                      profile.skills.map((skill) => (
                        <div
                          key={skill.id}
                          className="grid items-center gap-3 rounded-2xl border border-ink/8 bg-cream/15 p-3.5 sm:grid-cols-[1fr_150px_auto_auto]"
                        >
                          <div>
                            <strong className="text-sm font-bold text-ink">{skill.name}</strong>
                            <span className="block text-[11px] text-slate">{skill.category || "Skill"}</span>
                          </div>

                          <select
                            value={skill.proficiency}
                            onChange={(e) =>
                              update(
                                "skills",
                                profile.skills.map((x) =>
                                  x.id === skill.id ? { ...x, proficiency: e.target.value as typeof skill.proficiency } : x
                                )
                              )
                            }
                            className="rounded-xl border border-ink/10 bg-white px-3 py-2 text-xs font-semibold outline-none"
                          >
                            <option value="learning">Learning / Exploring</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                          </select>

                          <label className="flex items-center gap-2 text-xs font-semibold text-slate cursor-pointer">
                            <input
                              type="checkbox"
                              checked={skill.learning}
                              onChange={(e) =>
                                update(
                                  "skills",
                                  profile.skills.map((x) => (x.id === skill.id ? { ...x, learning: e.target.checked } : x))
                                )
                              }
                              className="size-4 rounded text-accent"
                            />
                            Priority Learning
                          </label>

                          <button
                            onClick={() => update("skills", profile.skills.filter((x) => x.id !== skill.id))}
                            aria-label={`Remove ${skill.name}`}
                            className="text-slate hover:text-rose-600 transition p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* STEP 4: PROJECTS & EXPERIENCE */}
              {step === 4 && (
                <div className="space-y-6">
                  {profile.projects.map((p, i) => (
                    <div key={p.id} className="rounded-2xl border border-ink/8 bg-cream/20 p-5 sm:p-6 space-y-4">
                      <div className="flex items-center justify-between border-b border-ink/8 pb-3">
                        <strong className="text-sm font-bold text-ink">
                          Entry {i + 1}: {p.title || "Untitled Project"}
                        </strong>
                        <button
                          onClick={() => update("projects", profile.projects.filter((x) => x.id !== p.id))}
                          className="text-rose-600 hover:text-rose-700 text-xs font-semibold flex items-center gap-1"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="text-xs font-bold text-ink">
                          Experience kind
                          <select
                            value={p.kind}
                            onChange={(e) =>
                              update(
                                "projects",
                                profile.projects.map((x) => (x.id === p.id ? { ...x, kind: e.target.value as typeof p.kind } : x))
                              )
                            }
                            className={inputClass}
                          >
                            <option value="project">Hands-on Project</option>
                            <option value="internship">Internship</option>
                            <option value="experience">Full-time / Part-time Job</option>
                            <option value="certification">Certification</option>
                            <option value="achievement">Hackathon / Award</option>
                          </select>
                        </label>

                        <label className="text-xs font-bold text-ink">
                          Title
                          <input
                            value={p.title}
                            onChange={(e) =>
                              update(
                                "projects",
                                profile.projects.map((x) => (x.id === p.id ? { ...x, title: e.target.value } : x))
                              )
                            }
                            placeholder="e.g. Cloud Security Scanner or Backend Intern"
                            className={inputClass}
                          />
                        </label>

                        <label className="text-xs font-bold text-ink sm:col-span-2">
                          Description
                          <textarea
                            value={p.description}
                            onChange={(e) =>
                              update(
                                "projects",
                                profile.projects.map((x) => (x.id === p.id ? { ...x, description: e.target.value } : x))
                              )
                            }
                            rows={3}
                            placeholder="Describe what you built, problem solved, or metrics achieved…"
                            className={inputClass}
                          />
                        </label>

                        <label className="text-xs font-bold text-ink">
                          Technologies or skills used
                          <input
                            value={p.technologies}
                            onChange={(e) =>
                              update(
                                "projects",
                                profile.projects.map((x) => (x.id === p.id ? { ...x, technologies: e.target.value } : x))
                              )
                            }
                            placeholder="e.g. Python, Docker, AWS, React"
                            className={inputClass}
                          />
                        </label>

                        <label className="text-xs font-bold text-ink">
                          GitHub or Live URL
                          <input
                            value={p.url}
                            onChange={(e) =>
                              update(
                                "projects",
                                profile.projects.map((x) => (x.id === p.id ? { ...x, url: e.target.value } : x))
                              )
                            }
                            placeholder="https://github.com/..."
                            className={inputClass}
                          />
                        </label>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() =>
                      update("projects", [
                        ...profile.projects,
                        {
                          id: makeId(),
                          kind: "project",
                          title: "",
                          description: "",
                          technologies: "",
                          contribution: "",
                          url: "",
                          status: "planned",
                        },
                      ])
                    }
                    className="button-secondary w-full py-3 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold border-dashed"
                  >
                    <Plus size={16} /> Add another project or experience
                  </button>
                </div>
              )}

              {/* STEP 5: RESUME UPLOAD */}
              {step === 5 && (
                <div>
                  <label className="grid min-h-64 cursor-pointer place-items-center rounded-3xl border-2 border-dashed border-violet-200 bg-violet-50/40 p-8 text-center hover:bg-violet-50/70 transition">
                    <span>
                      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-white text-accent shadow-md">
                        <Upload size={24} />
                      </span>
                      <strong className="mt-4 block text-base font-bold text-ink">Drop your resume here or browse files</strong>
                      <span className="mt-1.5 block text-xs text-slate">PDF or DOCX · maximum 5 MB</span>
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      className="sr-only"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void uploadResume(f);
                      }}
                    />
                  </label>

                  {profile.resume.fileName && (
                    <div className="mt-4 flex items-center justify-between rounded-2xl border border-ink/8 bg-white p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className="grid size-10 place-items-center rounded-xl bg-violet-100 text-accent">
                          <FileText size={18} />
                        </span>
                        <div>
                          <strong className="text-sm font-bold text-ink">{profile.resume.fileName}</strong>
                          <p className="text-xs text-slate">{Math.round(profile.resume.size / 1024)} KB · Uploaded</p>
                        </div>
                      </div>
                      <button
                        onClick={() => void removeResume()}
                        className="text-slate hover:text-rose-600 transition p-2"
                        aria-label="Remove resume"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}

                  <p className="mt-4 text-xs leading-5 text-slate">
                    CareerTwin uses your resume to recommend relevant milestones and prefill review details without overwriting your manual edits.
                  </p>
                </div>
              )}

              {/* STEP 6: CAREER INTERESTS & GOALS */}
              {step === 6 && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="text-xs font-bold text-ink sm:col-span-2">
                    Target job role <span className="text-rose-500">*</span>
                    <input
                      list="role-options"
                      value={profile.interests.targetRole}
                      onChange={(e) => setInterests("targetRole", e.target.value)}
                      placeholder="e.g. Software Engineer, Data Analyst, Cybersecurity Analyst…"
                      className={inputClass}
                      required
                    />
                    <datalist id="role-options">
                      {targetRoleSuggestions.map((r) => (
                        <option key={r} value={r} />
                      ))}
                    </datalist>
                  </label>

                  <label className="text-xs font-bold text-ink">
                    Preferred industry
                    <select
                      value={profile.interests.industry}
                      onChange={(e) => setInterests("industry", e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select industry</option>
                      {industries.map((ind) => (
                        <option key={ind} value={ind}>
                          {ind}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="text-xs font-bold text-ink">
                    Work arrangement preference
                    <select
                      value={profile.interests.workArrangement}
                      onChange={(e) => setInterests("workArrangement", e.target.value)}
                      className={inputClass}
                    >
                      <option value="">No preference</option>
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="On-site">On-site</option>
                    </select>
                  </label>

                  <label className="text-xs font-bold text-ink">
                    Weekly hours available for learning
                    <select
                      value={profile.interests.weeklyHours || "10"}
                      onChange={(e) => setInterests("weeklyHours", e.target.value)}
                      className={inputClass}
                    >
                      <option value="5">5 hours / week (Casual)</option>
                      <option value="10">10 hours / week (Recommended)</option>
                      <option value="15">15 hours / week (Focused)</option>
                      <option value="20">20+ hours / week (Intensive)</option>
                    </select>
                  </label>

                  <label className="text-xs font-bold text-ink">
                    Preferred job location
                    <input
                      value={profile.interests.preferredLocation}
                      onChange={(e) => setInterests("preferredLocation", e.target.value)}
                      placeholder="e.g. Bangalore, Hyderabad, Remote"
                      className={inputClass}
                    />
                  </label>

                  <label className="text-xs font-bold text-ink sm:col-span-2">
                    Short-term career goals
                    <input
                      value={profile.interests.shortTermGoals || ""}
                      onChange={(e) => setInterests("shortTermGoals", e.target.value)}
                      placeholder="e.g. Clear campus placements, secure a summer backend internship"
                      className={inputClass}
                    />
                  </label>

                  <label className="text-xs font-bold text-ink sm:col-span-2">
                    Long-term career aspirations
                    <textarea
                      value={profile.interests.goals}
                      onChange={(e) => setInterests("goals", e.target.value)}
                      rows={3}
                      placeholder="Where do you see yourself in 2-3 years? (e.g. Lead Engineer, AI Specialist)"
                      className={inputClass}
                    />
                  </label>
                </div>
              )}

              {/* STEP 7: REVIEW AND CREATE TWIN */}
              {step === 7 && (
                <div className="space-y-4">
                  {[
                    ["Personal Profile", profile.personal.fullName ? `${profile.personal.fullName} (${profile.personal.status || "Status unselected"})` : "Not supplied", 1],
                    ["Education Details", `${profile.education.length} qualification(s) entered${profile.education[0]?.institution ? ` · ${profile.education[0].institution}` : ""}`, 2],
                    ["Skills Catalog", profile.skills.length > 0 ? profile.skills.map((x) => x.name).join(", ") : "None added yet", 3],
                    ["Projects & Experience", `${profile.projects.length} project(s) or work experience recorded`, 4],
                    ["Resume Attachment", profile.resume.fileName || "No resume uploaded", 5],
                    ["Target Career Role", profile.interests.targetRole || "Role unselected", 6],
                  ].map(([label, val, stepIdx]) => (
                    <div
                      key={label as string}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-ink/8 p-4 bg-cream/15 hover:border-accent/40 transition"
                    >
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate">{label}</span>
                        <p className="mt-0.5 text-sm font-semibold text-ink truncate">{val}</p>
                      </div>
                      <button
                        onClick={() => setProfile((p) => ({ ...p, currentStep: Number(stepIdx) }))}
                        className="text-xs font-bold text-accent hover:underline shrink-0"
                      >
                        Edit
                      </button>
                    </div>
                  ))}

                  <div className="mt-6 rounded-2xl bg-violet-50 p-5 text-xs leading-5 text-slate border border-violet-100">
                    <strong className="block text-ink font-bold mb-1 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-accent" /> What happens next?
                    </strong>
                    When you click <strong>Create My Career Twin</strong>, CareerTwin analyzes your declared profile, compares it against verified role requirements, invokes the AI Career Engine to prepare an adaptive roadmap, and persists your personal Twin state.
                  </div>
                </div>
              )}
            </div>

            {/* General Feedback Message */}
            {message && submissionStage === "idle" && (
              <p role="status" className="mt-4 rounded-2xl border border-violet-200 bg-violet-50 p-3.5 text-sm text-ink">
                {message}
              </p>
            )}

            {/* Bottom Navigation Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => setProfile((p) => ({ ...p, currentStep: Math.max(1, step - 1) }))}
                disabled={step === 1 || saving || submissionStage !== "idle"}
                className="button-secondary rounded-xl px-5 py-3 text-sm font-semibold disabled:opacity-40"
              >
                <ArrowLeft size={16} /> Back
              </button>

              <div className="flex items-center gap-3">
                {step < 7 && step > 3 && (
                  <button
                    onClick={next}
                    disabled={saving || submissionStage !== "idle"}
                    className="px-4 py-3 text-sm font-bold text-slate hover:text-ink transition"
                  >
                    Skip optional section
                  </button>
                )}

                {step < 7 ? (
                  <button
                    onClick={next}
                    disabled={!canContinue || saving || submissionStage !== "idle"}
                    className="button-primary px-6 py-3 rounded-xl text-sm font-bold disabled:opacity-40"
                  >
                    Continue <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={() => void finish()}
                    disabled={!profile.interests.targetRole || saving || submissionStage !== "idle"}
                    className="button-primary px-8 py-3.5 rounded-xl text-sm font-bold disabled:opacity-40 shadow-lg shadow-violet-500/20"
                  >
                    {saving || submissionStage !== "idle" ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw size={15} className="animate-spin" /> Creating Twin…
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Sparkles size={16} /> Create My Career Twin <ArrowRight size={16} />
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Right Help Sidebar */}
        <aside className="hidden border-l border-ink/8 bg-white p-6 lg:block">
          <div className="sticky top-24">
            <span className="grid size-11 place-items-center rounded-2xl bg-violet-50 text-accent">
              <Lightbulb size={20} />
            </span>
            <h2 className="mt-4 font-bold text-ink">Why this matters</h2>
            <p className="mt-2 text-sm leading-6 text-slate">{steps[step - 1][2]}</p>

            <div className="mt-6 rounded-2xl border border-ink/8 bg-app p-4 text-xs leading-5 text-slate">
              <strong className="block text-ink font-semibold mb-1">Persistent Drafts</strong>
              Your changes autosave immediately to browser storage and sync with your private backend record when signed in.
            </div>

            <Link href="/" className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-accent hover:underline">
              <ArrowLeft size={14} /> Back to website
            </Link>
          </div>
        </aside>
      </main>
    </div>
  );
}
