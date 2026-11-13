"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  BookOpen,
  Sparkles,
  Palette,
  Bell,
  Shield,
  Save,
  Download,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  Moon,
  Sun,
  Laptop,
  Check,
  RefreshCw,
} from "lucide-react";
import { type AppSettings, defaultSettings } from "@/lib/settings/schema";

interface AccountProfileData {
  fullName: string;
  email: string;
  college: string;
  degree: string;
  specialization: string;
  academicYear: string;
  graduationYear: string;
  location: string;
}

const defaultAccountData: AccountProfileData = {
  fullName: "",
  email: "",
  college: "",
  degree: "",
  specialization: "",
  academicYear: "",
  graduationYear: "",
  location: "",
};

function applyAppearanceToDocument(opts: {
  theme: "dark" | "light" | "system";
  highContrast: boolean;
  reducedMotion: boolean;
}) {
  if (typeof document === "undefined") return;
  const effectiveTheme =
    opts.theme === "system" && typeof window !== "undefined"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : opts.theme === "system"
      ? "light"
      : opts.theme;
  document.documentElement.setAttribute("data-theme", effectiveTheme);
  document.documentElement.setAttribute("data-contrast", opts.highContrast ? "high" : "normal");
  document.documentElement.setAttribute("data-reduced-motion", opts.reducedMotion ? "true" : "false");
  try {
    localStorage.setItem("ct-theme", effectiveTheme);
    localStorage.setItem("ct-contrast", opts.highContrast ? "high" : "normal");
    localStorage.setItem("ct-reduced-motion", opts.reducedMotion ? "true" : "false");
    window.dispatchEvent(new Event("careertwin:theme"));
  } catch {
    // safe storage fallback
  }
}

export function SettingsHub({
  ownerKey,
  initialTab = "account",
  onLogout,
  initialEmail,
  initialName,
}: {
  ownerKey?: string;
  initialTab?: "account" | "learning" | "ai" | "appearance" | "notifications" | "privacy";
  onLogout?: () => void;
  initialEmail?: string;
  initialName?: string;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [profile, setProfile] = useState<AccountProfileData>(() => ({
    ...defaultAccountData,
    fullName: initialName || "",
    email: initialEmail || "",
  }));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Load profile and settings
  useEffect(() => {
    let mounted = true;

    async function loadData() {
      // 1. Load settings from API, falling back to scoped localStorage
      let loadedSettings: AppSettings | null = null;
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const payload = await res.json();
          if (payload.data && mounted) {
            loadedSettings = payload.data as AppSettings;
          }
        }
      } catch (e) {
        console.warn("Settings fetch fallback to local", e);
      }

      if (!loadedSettings) {
        try {
          const savedLocal = localStorage.getItem(`careertwin-app-settings:${ownerKey || "demo"}`);
          if (savedLocal) loadedSettings = JSON.parse(savedLocal) as AppSettings;
        } catch {
          // ignore
        }
      }

      if (loadedSettings && mounted) {
        setSettings(loadedSettings);
        applyAppearanceToDocument({
          theme: loadedSettings.theme,
          highContrast: Boolean(loadedSettings.highContrast),
          reducedMotion: Boolean(loadedSettings.reducedMotion),
        });
      }

      // 2. Load profile from /api/profile first, then merge with localStorage wizard
      let apiProfileData: Record<string, any> | null = null;
      try {
        const profileRes = await fetch("/api/profile");
        if (profileRes.ok) {
          const profileJson = await profileRes.json();
          if (profileJson?.data?.profile_data && mounted) {
            apiProfileData = profileJson.data.profile_data as Record<string, any>;
          }
        }
      } catch {
        // safe offline fallback
      }

      try {
        const wizardKey = ownerKey ? `careertwin-profile-wizard:${ownerKey}` : "careertwin-profile-wizard";
        const raw = window.localStorage.getItem(wizardKey) || window.localStorage.getItem("careertwin-profile-wizard");
        const localParsed = raw ? (JSON.parse(raw) as Record<string, any>) : null;
        const source = apiProfileData || localParsed;
        const edu0 = source?.education?.[0];
        const savedUserEmail = window.localStorage.getItem("ct-user-email") || "";
        const savedUserName = window.localStorage.getItem("ct-user-name") || "";

        if (mounted) {
          setProfile((prev) => ({
            ...prev,
            fullName: source?.personal?.fullName || source?.personal?.name || savedUserName || initialName || prev.fullName,
            email: source?.personal?.email || savedUserEmail || initialEmail || prev.email,
            college: edu0?.institution || prev.college,
            degree: edu0?.degree || prev.degree,
            specialization: edu0?.field || edu0?.course || prev.specialization,
            academicYear: edu0?.academicYear || prev.academicYear,
            graduationYear: String(edu0?.graduationYear || edu0?.year || prev.graduationYear || ""),
            location: source?.personal?.location || source?.preferences?.preferredLocation || prev.location,
          }));
        }
      } catch {
        // Safe fallback
      }

      if (mounted) setLoading(false);
    }

    void loadData();
    return () => {
      mounted = false;
    };
  }, [ownerKey, initialEmail, initialName]);

  const showFeedbackToast = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Save Settings
  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to save settings");

      try {
        localStorage.setItem(`careertwin-app-settings:${ownerKey || "demo"}`, JSON.stringify(settings));
        window.dispatchEvent(new CustomEvent("careertwin:settings-updated", { detail: settings }));
      } catch {
        // ignore
      }

      applyAppearanceToDocument({
        theme: settings.theme,
        highContrast: Boolean(settings.highContrast),
        reducedMotion: Boolean(settings.reducedMotion),
      });

      showFeedbackToast("success", "Preferences saved successfully and applied across your workspace.");
    } catch {
      try {
        localStorage.setItem(`careertwin-app-settings:${ownerKey || "demo"}`, JSON.stringify(settings));
        window.dispatchEvent(new CustomEvent("careertwin:settings-updated", { detail: settings }));
      } catch {
        // safe
      }
      applyAppearanceToDocument({
        theme: settings.theme,
        highContrast: Boolean(settings.highContrast),
        reducedMotion: Boolean(settings.reducedMotion),
      });
      showFeedbackToast("error", "Could not save preferences to server. Saved to browser session.");
    } finally {
      setSaving(false);
    }
  };

  // Save Account Profile
  const handleSaveProfile = async () => {
    if (!profile.fullName.trim()) {
      showFeedbackToast("error", "Full name cannot be empty.");
      return;
    }
    setSaving(true);
    try {
      const wizardKey = ownerKey ? `careertwin-profile-wizard:${ownerKey}` : "careertwin-profile-wizard";
      const existingRaw = localStorage.getItem(wizardKey);
      const existing = existingRaw ? JSON.parse(existingRaw) : {};

      const updated = {
        ...existing,
        personal: {
          ...(existing.personal || {}),
          name: profile.fullName.trim(),
          email: profile.email.trim(),
          location: profile.location.trim(),
        },
        education: [
          {
            ...(existing.education?.[0] || {}),
            institution: profile.college.trim(),
            degree: profile.degree.trim(),
            field: profile.specialization.trim(),
            academicYear: profile.academicYear.trim(),
            year: profile.graduationYear.trim(),
          },
          ...(Array.isArray(existing.education) ? existing.education.slice(1) : []),
        ],
      };

      localStorage.setItem(wizardKey, JSON.stringify(updated));
      localStorage.setItem("ct-user-name", profile.fullName.trim());

      try {
        const currentProfileRes = await fetch("/api/profile");
        const currentPayload = currentProfileRes.ok
          ? ((await currentProfileRes.json()) as { data?: { profile_data?: Record<string, any>; onboarding_completed?: boolean } })
          : null;
        const existingServer = currentPayload?.data?.profile_data;
        if (existingServer) {
          const mergedServer = {
            ...existingServer,
            personal: {
              ...(existingServer.personal || {}),
              fullName: profile.fullName.trim(),
              location: profile.location.trim(),
            },
            education: [
              {
                ...(existingServer.education?.[0] || {}),
                institution: profile.college.trim(),
                degree: profile.degree.trim(),
                field: profile.specialization.trim(),
                graduationYear: Number.parseInt(profile.graduationYear, 10) || existingServer.education?.[0]?.graduationYear || undefined,
              },
              ...(Array.isArray(existingServer.education) ? existingServer.education.slice(1) : []),
            ],
          };
          await fetch("/api/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              profile: mergedServer,
              complete: Boolean(currentPayload?.data?.onboarding_completed),
            }),
          });
        }
      } catch {
        // safe offline fallback
      }

      window.dispatchEvent(new Event("careertwin:profile-saved"));
      showFeedbackToast("success", "Academic profile and personal details updated successfully.");
    } catch {
      showFeedbackToast("error", "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Theme switch
  const handleThemeChange = (newTheme: "dark" | "light" | "system") => {
    setSettings((prev) => ({ ...prev, theme: newTheme }));
    applyAppearanceToDocument({
      theme: newTheme,
      highContrast: Boolean(settings.highContrast),
      reducedMotion: Boolean(settings.reducedMotion),
    });
  };

  // Export Data
  const handleExportData = async () => {
    try {
      const response = await fetch("/api/account/export");
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `careertwin-student-data-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showFeedbackToast("success", "Full JSON archive downloaded successfully.");
    } catch {
      showFeedbackToast("error", "Unable to generate export archive. Try again.");
    }
  };

  // Clear Account & Reset
  const handleResetAccount = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      router.push("/login?logged_out=true");
    } catch {
      window.location.href = "/login";
    }
  };

  const tabs = [
    { id: "account" as const, label: "Account Profile", icon: User },
    { id: "learning" as const, label: "Learning Preferences", icon: BookOpen },
    { id: "ai" as const, label: "AI Preferences", icon: Sparkles },
    { id: "appearance" as const, label: "Appearance", icon: Palette },
    { id: "notifications" as const, label: "Notifications", icon: Bell },
    { id: "privacy" as const, label: "Privacy & Security", icon: Shield },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-3xl border border-ink/8 bg-white p-8">
        <div className="flex items-center gap-3 text-slate">
          <RefreshCw className="size-5 animate-spin text-accent" />
          <span className="text-sm font-semibold">Loading your preferences…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Feedback banner */}
      {feedback && (
        <div
          role="alert"
          className={`flex items-center gap-2.5 rounded-2xl border p-4 text-xs font-semibold animate-in fade-in slide-in-from-top-2 ${
            feedback.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800"
              : "border-rose-500/30 bg-rose-500/10 text-rose-800"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
          ) : (
            <AlertTriangle size={16} className="shrink-0 text-rose-600" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-ink/8 bg-white p-2 shadow-xs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-accent text-white shadow-sm"
                  : "bg-surface text-slate hover:bg-white hover:text-ink"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ==================== TAB 1: ACCOUNT SETTINGS ==================== */}
      {activeTab === "account" && (
        <section className="space-y-6 rounded-3xl border border-ink/8 bg-white p-6 md:p-8 shadow-xs">
          <div>
            <span className="label text-accent">Student Profile</span>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-ink">Account & Academic Details</h2>
            <p className="mt-1 text-xs text-slate">
              Update your name, degree, university, and location. These appear on verified project certificates and resume exports.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">Full Name</label>
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className="w-full rounded-xl border border-ink/10 bg-app px-3.5 py-2.5 text-xs text-ink outline-none transition focus:border-accent focus:bg-white"
                placeholder="Student Full Name"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">Email Address</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full rounded-xl border border-ink/10 bg-ink/5 px-3.5 py-2.5 text-xs text-slate cursor-not-allowed"
                title="Managed by your authenticated provider."
              />
              <span className="mt-1 block text-[10px] text-slate">Managed securely via Clerk/session provider.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">College / University</label>
              <input
                type="text"
                value={profile.college}
                onChange={(e) => setProfile({ ...profile, college: e.target.value })}
                className="w-full rounded-xl border border-ink/10 bg-app px-3.5 py-2.5 text-xs text-ink outline-none transition focus:border-accent focus:bg-white"
                placeholder="e.g. VIT, IIT, Stanford, Mumbai University"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">Degree & Major</label>
              <input
                type="text"
                value={profile.degree}
                onChange={(e) => setProfile({ ...profile, degree: e.target.value })}
                className="w-full rounded-xl border border-ink/10 bg-app px-3.5 py-2.5 text-xs text-ink outline-none transition focus:border-accent focus:bg-white"
                placeholder="e.g. B.Tech Computer Science, BCA, B.Sc"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">Specialization</label>
              <input
                type="text"
                value={profile.specialization}
                onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                className="w-full rounded-xl border border-ink/10 bg-app px-3.5 py-2.5 text-xs text-ink outline-none transition focus:border-accent focus:bg-white"
                placeholder="e.g. Software Engineering, AI/ML, Cloud"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">Graduation Year</label>
              <select
                value={profile.graduationYear}
                onChange={(e) => setProfile({ ...profile, graduationYear: e.target.value })}
                className="w-full rounded-xl border border-ink/10 bg-app px-3.5 py-2.5 text-xs text-ink outline-none transition focus:border-accent focus:bg-white"
              >
                {["2024", "2025", "2026", "2027", "2028", "2029", "Graduate"].map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-ink mb-1.5">Location</label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                className="w-full rounded-xl border border-ink/10 bg-app px-3.5 py-2.5 text-xs text-ink outline-none transition focus:border-accent focus:bg-white"
                placeholder="e.g. Bengaluru, India or San Francisco, CA"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-accent/90 disabled:opacity-50 cursor-pointer"
            >
              <Save size={14} />
              <span>{saving ? "Saving…" : "Save Profile Details"}</span>
            </button>
          </div>
        </section>
      )}

      {/* ==================== TAB 2: LEARNING PREFERENCES ==================== */}
      {activeTab === "learning" && (
        <section className="space-y-6 rounded-3xl border border-ink/8 bg-white p-6 md:p-8 shadow-xs">
          <div>
            <span className="label text-accent">Pedagogy & Curriculum</span>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-ink">Learning Preferences</h2>
            <p className="mt-1 text-xs text-slate">
              Configure your primary technical tracks, study goals, and instructional pace. CareerTwin adapts course recommendations accordingly.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">Primary Learning Field</label>
              <select
                value={settings.preferredField}
                onChange={(e) => setSettings({ ...settings, preferredField: e.target.value })}
                className="w-full rounded-xl border border-ink/10 bg-app px-3.5 py-2.5 text-xs text-ink outline-none transition focus:border-accent focus:bg-white"
              >
                <option value="Software Development">Software Engineering & Development</option>
                <option value="Cybersecurity">Cybersecurity & Defensive Engineering</option>
                <option value="Cloud Computing">Cloud & DevOps Architecture</option>
                <option value="Data & AI">Data Analytics, SQL & Machine Learning</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">Skill Difficulty Level</label>
              <select
                value={settings.learningDifficulty}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    learningDifficulty: e.target.value as AppSettings["learningDifficulty"],
                  })
                }
                className="w-full rounded-xl border border-ink/10 bg-app px-3.5 py-2.5 text-xs text-ink outline-none transition focus:border-accent focus:bg-white"
              >
                <option value="foundation">Foundational (Complete Beginner)</option>
                <option value="beginner">Beginner (Some Programming Knowledge)</option>
                <option value="intermediate">Intermediate (Building Projects)</option>
                <option value="advanced">Advanced (Production Engineering)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">Weekly Study Goal (Hours)</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={2}
                  max={40}
                  step={1}
                  value={settings.weeklyHoursGoal}
                  onChange={(e) => setSettings({ ...settings, weeklyHoursGoal: Number(e.target.value) })}
                  className="w-full accent-accent"
                />
                <span className="w-16 rounded-lg bg-surface px-2.5 py-1 text-center font-mono text-xs font-bold text-ink">
                  {settings.weeklyHoursGoal}h/wk
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">Daily Learning Target (Minutes)</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={15}
                  max={180}
                  step={15}
                  value={settings.dailyMinutesTarget}
                  onChange={(e) => setSettings({ ...settings, dailyMinutesTarget: Number(e.target.value) })}
                  className="w-full accent-accent"
                />
                <span className="w-16 rounded-lg bg-surface px-2.5 py-1 text-center font-mono text-xs font-bold text-ink">
                  {settings.dailyMinutesTarget}m/day
                </span>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-ink mb-2">Favorite Programming Languages & Stacks</label>
              <div className="flex flex-wrap gap-2">
                {[
                  "Python",
                  "JavaScript",
                  "TypeScript",
                  "C++",
                  "Java",
                  "Go",
                  "Rust",
                  "SQL",
                  "Cloud / AWS",
                  "Linux",
                  "Docker",
                ].map((lang) => {
                  const isSelected = settings.preferredLanguages.includes(lang);
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => {
                        const next = isSelected
                          ? settings.preferredLanguages.filter((l) => l !== lang)
                          : [...settings.preferredLanguages, lang];
                        setSettings({ ...settings, preferredLanguages: next });
                      }}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-accent text-white shadow-xs"
                          : "border border-ink/10 bg-app text-slate hover:bg-white hover:text-ink"
                      }`}
                    >
                      {isSelected && <Check size={12} />}
                      <span>{lang}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-accent/90 disabled:opacity-50 cursor-pointer"
            >
              <Save size={14} />
              <span>{saving ? "Saving…" : "Save Learning Preferences"}</span>
            </button>
          </div>
        </section>
      )}

      {/* ==================== TAB 3: AI PREFERENCES ==================== */}
      {activeTab === "ai" && (
        <section className="space-y-6 rounded-3xl border border-ink/8 bg-white p-6 md:p-8 shadow-xs">
          <div>
            <span className="label text-accent">AI Learning Agent</span>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-ink">AI Mentor Preferences</h2>
            <p className="mt-1 text-xs text-slate">
              Configure how the integrated AI tutor guides you during lessons, debugs code, and hints through practical exercises.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">Tutor Response Tone & Depth</label>
              <select
                value={settings.aiTutorDifficulty}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    aiTutorDifficulty: e.target.value as AppSettings["aiTutorDifficulty"],
                  })
                }
                className="w-full rounded-xl border border-ink/10 bg-app px-3.5 py-2.5 text-xs text-ink outline-none transition focus:border-accent focus:bg-white"
              >
                <option value="beginner">Beginner-friendly: Use analogies and simple terms</option>
                <option value="intermediate">Practical & Technical: Direct and industry-aligned</option>
                <option value="advanced">Deep Architectural: Rigorous edge cases and performance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">Assistance Strategy</label>
              <select
                value={settings.assistanceMode}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    assistanceMode: e.target.value as AppSettings["assistanceMode"],
                  })
                }
                className="w-full rounded-xl border border-ink/10 bg-app px-3.5 py-2.5 text-xs text-ink outline-none transition focus:border-accent focus:bg-white"
              >
                <option value="hint-first">Hint-First: Guide step-by-step before giving answers</option>
                <option value="solution-first">Solution-First: Show working solution with breakdown</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">Explanation Format</label>
              <select
                value={settings.explanationDepth}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    explanationDepth: e.target.value as AppSettings["explanationDepth"],
                  })
                }
                className="w-full rounded-xl border border-ink/10 bg-app px-3.5 py-2.5 text-xs text-ink outline-none transition focus:border-accent focus:bg-white"
              >
                <option value="detailed">Detailed: Theory + code snippets + common pitfalls</option>
                <option value="concise">Concise: TL;DR summaries and direct answers</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">Preferred Language</label>
              <input
                type="text"
                value={settings.aiLanguage}
                onChange={(e) => setSettings({ ...settings, aiLanguage: e.target.value })}
                className="w-full rounded-xl border border-ink/10 bg-app px-3.5 py-2.5 text-xs text-ink outline-none transition focus:border-accent focus:bg-white"
                placeholder="English"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-accent/90 disabled:opacity-50 cursor-pointer"
            >
              <Save size={14} />
              <span>{saving ? "Saving…" : "Save AI Preferences"}</span>
            </button>
          </div>
        </section>
      )}

      {/* ==================== TAB 4: APPEARANCE ==================== */}
      {activeTab === "appearance" && (
        <section className="space-y-6 rounded-3xl border border-ink/8 bg-white p-6 md:p-8 shadow-xs">
          <div>
            <span className="label text-accent">Interface & Visuals</span>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-ink">Theme & Accessibility</h2>
            <p className="mt-1 text-xs text-slate">
              Switch themes and accessibility modes. The hand-crafted Three.js robot dynamically re-lights to match your selection.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink mb-3">Color Theme</label>
            <div className="grid grid-cols-3 gap-3 max-w-md">
              {[
                { id: "dark" as const, label: "Dark Obsidian", icon: Moon },
                { id: "light" as const, label: "Clean White", icon: Sun },
                { id: "system" as const, label: "System Default", icon: Laptop },
              ].map((t) => {
                const isSelected = settings.theme === t.id;
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleThemeChange(t.id)}
                    className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "border-accent bg-accent/10 text-accent shadow-xs"
                        : "border-ink/10 bg-app text-slate hover:bg-white hover:text-ink"
                    }`}
                  >
                    <Icon size={20} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center justify-between rounded-2xl border border-ink/10 bg-app p-4 cursor-pointer">
              <div>
                <strong className="block text-xs font-bold text-ink">High Contrast Mode</strong>
                <span className="text-[11px] text-slate">Enhances border clarity and font readability for low-vision environments.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.highContrast}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setSettings((prev) => ({ ...prev, highContrast: checked }));
                  applyAppearanceToDocument({
                    theme: settings.theme,
                    highContrast: checked,
                    reducedMotion: Boolean(settings.reducedMotion),
                  });
                }}
                className="size-4 accent-accent"
              />
            </label>

            <label className="flex items-center justify-between rounded-2xl border border-ink/10 bg-app p-4 cursor-pointer">
              <div>
                <strong className="block text-xs font-bold text-ink">Reduced Motion Mode</strong>
                <span className="text-[11px] text-slate">Minimizes spring bouncing and ambient 3D character idle sway.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setSettings((prev) => ({ ...prev, reducedMotion: checked }));
                  applyAppearanceToDocument({
                    theme: settings.theme,
                    highContrast: Boolean(settings.highContrast),
                    reducedMotion: checked,
                  });
                }}
                className="size-4 accent-accent"
              />
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-accent/90 disabled:opacity-50 cursor-pointer"
            >
              <Save size={14} />
              <span>{saving ? "Saving…" : "Save Appearance"}</span>
            </button>
          </div>
        </section>
      )}

      {/* ==================== TAB 5: NOTIFICATIONS ==================== */}
      {activeTab === "notifications" && (
        <section className="space-y-6 rounded-3xl border border-ink/8 bg-white p-6 md:p-8 shadow-xs">
          <div>
            <span className="label text-accent">Alerts & Milestones</span>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-ink">Notification Controls</h2>
            <p className="mt-1 text-xs text-slate">
              Choose which learning reminders and assessment alerts you wish to receive inside the application.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                key: "learningReminders" as const,
                title: "Daily Study Reminders",
                desc: "Alerts you when your daily learning minutes target has not yet been logged.",
              },
              {
                key: "assessmentReminders" as const,
                title: "100-Mark Mock Exam Reminders",
                desc: "Prompts you to test your mastery upon completing all modules in a course.",
              },
              {
                key: "weeklyProgressSummaries" as const,
                title: "Weekly Learning Milestone Digest",
                desc: "Provides a summary of completed lessons, lab verifications, and exam scores.",
              },
              {
                key: "courseAnnouncements" as const,
                title: "Curriculum Updates & New Labs",
                desc: "Notifies you when new practice scenarios or industry tracks are published.",
              },
            ].map((n) => (
              <label
                key={n.key}
                className="flex items-center justify-between rounded-2xl border border-ink/10 bg-app p-4 cursor-pointer"
              >
                <div>
                  <strong className="block text-xs font-bold text-ink">{n.title}</strong>
                  <span className="text-[11px] text-slate">{n.desc}</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings[n.key]}
                  onChange={(e) => setSettings({ ...settings, [n.key]: e.target.checked })}
                  className="size-4 accent-accent"
                />
              </label>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-accent/90 disabled:opacity-50 cursor-pointer"
            >
              <Save size={14} />
              <span>{saving ? "Saving…" : "Save Notification Preferences"}</span>
            </button>
          </div>
        </section>
      )}

      {/* ==================== TAB 6: PRIVACY & SECURITY ==================== */}
      {activeTab === "privacy" && (
        <section className="space-y-6 rounded-3xl border border-ink/8 bg-white p-6 md:p-8 shadow-xs">
          <div>
            <span className="label text-accent">Security & Data Rights</span>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-ink">Privacy, Data Export & Session Termination</h2>
            <p className="mt-1 text-xs text-slate">
              Download your complete personal learning dossier, adjust transcript privacy, or log out securely.
            </p>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between rounded-2xl border border-ink/10 bg-app p-4 cursor-pointer">
              <div>
                <strong className="block text-xs font-bold text-ink">Retain Interview Transcripts</strong>
                <span className="text-[11px] text-slate">
                  Allows the AI Interview Coach to compare previous responses across sessions. Audio streams are never stored.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.retainTranscripts}
                onChange={(e) => setSettings({ ...settings, retainTranscripts: e.target.checked })}
                className="size-4 accent-accent"
              />
            </label>

            <label className="flex items-center justify-between rounded-2xl border border-ink/10 bg-app p-4 cursor-pointer">
              <div>
                <strong className="block text-xs font-bold text-ink">Allow Personalized AI Context</strong>
                <span className="text-[11px] text-slate">
                  Enables the Learning Agent to read your demonstrated skill gaps to tailor practice hints.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.allowProfileContext}
                onChange={(e) => setSettings({ ...settings, allowProfileContext: e.target.checked })}
                className="size-4 accent-accent"
              />
            </label>
          </div>

          {/* Data Export & Actions */}
          <div className="rounded-2xl border border-ink/10 bg-white p-5">
            <h3 className="text-sm font-bold text-ink">Export All Workspace Data</h3>
            <p className="mt-1 text-xs text-slate">
              Download an offline JSON bundle containing your career profile, course progress, lab code, quiz history, and portfolio projects.
            </p>
            <div className="mt-4">
              <button
                type="button"
                onClick={handleExportData}
                className="inline-flex items-center gap-2 rounded-xl border border-ink/15 bg-app px-4 py-2.5 text-xs font-bold text-ink transition hover:bg-white cursor-pointer"
              >
                <Download size={14} />
                <span>Download Full Data Export (.json)</span>
              </button>
            </div>
          </div>

          {/* Session Management & Logout */}
          <div className="rounded-2xl border border-ink/10 bg-white p-5">
            <h3 className="text-sm font-bold text-ink">Session Management</h3>
            <p className="mt-1 text-xs text-slate">
              Active authenticated session on this browser. Terminate to prevent unauthorized access.
            </p>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => {
                  if (onLogout) onLogout();
                  else router.push("/login?logged_out=true");
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-ink/90 cursor-pointer"
              >
                <LogOut size={14} />
                <span>Terminate Session (Log Out)</span>
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-5">
            <div className="flex items-center gap-2 text-rose-800">
              <AlertTriangle size={16} />
              <h3 className="text-sm font-bold">Danger Zone: Reset Workspace Data</h3>
            </div>
            <p className="mt-1 text-xs text-rose-700">
              Permanently purges local student session drafts, stored lab code, and offline quiz history.
            </p>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-300 bg-white px-4 py-2.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50 cursor-pointer"
              >
                <span>Reset Local Account Workspace</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-ink/10 bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-bold">Confirm Workspace Reset</h3>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate">
              Are you sure you want to clear your local workspace data? This will purge all uncommitted drafts, local progress, and session tokens. You will be redirected to the login screen.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-xl border border-ink/10 px-4 py-2 text-xs font-bold text-slate hover:bg-surface cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetAccount}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 cursor-pointer"
              >
                Yes, Reset Workspace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
