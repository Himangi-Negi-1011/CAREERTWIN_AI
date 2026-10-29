"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ArrowLeft,
  Search,
  Database,
  FileCode,
  GraduationCap,
} from "lucide-react";

interface AdminSkill {
  id: string;
  canonicalName: string;
  domain: string;
  difficulty: string;
  curriculaCount: number;
  lessonsCount: number;
  mockTestsCount: number;
  readiness: "ready" | "incomplete";
}

interface AdminData {
  totalSkills: number;
  readyCourses: number;
  incompleteCourses: number;
  totalCurricula: number;
  totalLessons: number;
  totalMockTests: number;
  databaseHealth: {
    connected: boolean;
    provider: string;
    lastCheck: string;
  };
  sampleSkills: AdminSkill[];
}

export default function AdminLibraryPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [actionMessage, setActionMessage] = useState("");
  const [busySkill, setBusySkill] = useState<string | null>(null);
  const [globalGenerating, setGlobalGenerating] = useState(false);

  async function loadStats() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/library");
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch {
      setActionMessage("Failed to load library statistics.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  async function handleGenerateAll() {
    setGlobalGenerating(true);
    setActionMessage("Precomputing and validating advance library for all skills…");
    try {
      const res = await fetch("/api/admin/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate-all" }),
      });
      const json = await res.json();
      if (res.ok) {
        setActionMessage(json.data.message);
        await loadStats();
      } else {
        setActionMessage(json.error?.message || "Generation failed.");
      }
    } catch {
      setActionMessage("Error executing generation.");
    } finally {
      setGlobalGenerating(false);
    }
  }

  async function handleGenerateSkill(skillName: string) {
    setBusySkill(skillName);
    setActionMessage(`Generating full course & mock tests for ${skillName}…`);
    try {
      const res = await fetch("/api/admin/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate-skill", skillName }),
      });
      const json = await res.json();
      if (res.ok) {
        setActionMessage(`Successfully generated and verified course for ${skillName}!`);
        await loadStats();
      } else {
        setActionMessage(json.error?.message || "Failed to generate skill.");
      }
    } catch {
      setActionMessage(`Error generating ${skillName}.`);
    } finally {
      setBusySkill(null);
    }
  }

  async function handleValidateSkill(skillName: string) {
    setBusySkill(skillName);
    try {
      const res = await fetch("/api/admin/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "validate-skill", skillName }),
      });
      const json = await res.json();
      if (json.data?.valid) {
        setActionMessage(`✅ Course for ${skillName} passed 100% of completeness & integrity checks.`);
      } else {
        setActionMessage(`⚠️ ${skillName} issues: ${json.data?.errors?.join("; ") || "Incomplete"}`);
      }
    } catch {
      setActionMessage(`Validation error for ${skillName}.`);
    } finally {
      setBusySkill(null);
    }
  }

  const domains = Array.from(new Set(data?.sampleSkills.map((s) => s.domain) || []));

  const filteredSkills = (data?.sampleSkills || []).filter((s) => {
    const matchesSearch = s.canonicalName.toLowerCase().includes(search.toLowerCase());
    const matchesDomain = selectedDomain === "all" || s.domain === selectedDomain;
    return matchesSearch && matchesDomain;
  });

  return (
    <div className="min-h-screen bg-[#08070c] text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-white/10">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors mb-2"
            >
              <ArrowLeft size={14} /> Back to CareerTwin Workspace
            </Link>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Advance Learning Library Administration
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Inspect precomputed courses, lessons, quizzes, mock tests, and persistence health.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadStats}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold transition"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
            <button
              type="button"
              onClick={handleGenerateAll}
              disabled={globalGenerating}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20 transition disabled:opacity-50"
            >
              <Sparkles size={14} />
              {globalGenerating ? "Precomputing Library…" : "Precompute Missing Content"}
            </button>
          </div>
        </div>

        {/* Message Banner */}
        {actionMessage && (
          <div className="mt-6 p-4 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-200 text-xs flex items-center justify-between">
            <span>{actionMessage}</span>
            <button
              type="button"
              onClick={() => setActionMessage("")}
              className="text-purple-400 hover:text-white ml-4 text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Skills</span>
            <strong className="text-2xl font-bold text-white mt-1 block">{data?.totalSkills ?? "…"}</strong>
            <span className="text-[10px] text-slate-500">In centralized catalog</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">Ready Courses</span>
            <strong className="text-2xl font-bold text-emerald-300 mt-1 block">{data?.readyCourses ?? "…"}</strong>
            <span className="text-[10px] text-emerald-400/70">100% prepared & verified</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Curricula</span>
            <strong className="text-2xl font-bold text-white mt-1 block">{data?.totalCurricula ?? "…"}</strong>
            <span className="text-[10px] text-slate-500">Structured modules</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Saved Lessons</span>
            <strong className="text-2xl font-bold text-purple-300 mt-1 block">{data?.totalLessons ?? "…"}</strong>
            <span className="text-[10px] text-slate-500">Full instructional text</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Mock Tests</span>
            <strong className="text-2xl font-bold text-cyan-300 mt-1 block">{data?.totalMockTests ?? "…"}</strong>
            <span className="text-[10px] text-slate-500">3 per level with review</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Persistence</span>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <strong className="text-xs font-bold text-white">Connected</strong>
            </div>
            <span className="text-[10px] text-slate-500 block truncate mt-0.5">{data?.databaseHealth.provider || "Active"}</span>
          </div>
        </div>

        {/* Filter and Search */}
        <div className="flex flex-col sm:flex-row gap-3 mt-10 mb-6">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search skill by name (e.g. Python, Docker, React)…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
          >
            <option value="all" className="bg-[#0f0e17]">All Domains</option>
            {domains.map((d) => (
              <option key={d} value={d} className="bg-[#0f0e17]">{d}</option>
            ))}
          </select>
        </div>

        {/* Skills Table */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Skill Name</th>
                  <th className="py-3 px-4">Domain</th>
                  <th className="py-3 px-4">Level</th>
                  <th className="py-3 px-4">Lessons Saved</th>
                  <th className="py-3 px-4">Mock Tests</th>
                  <th className="py-3 px-4">Readiness</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSkills.map((s) => (
                  <tr key={s.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                      <BookOpen size={14} className="text-purple-400 shrink-0" />
                      <span>{s.canonicalName}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{s.domain}</td>
                    <td className="py-3.5 px-4 capitalize text-slate-400">{s.difficulty}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-purple-300 font-bold">{s.lessonsCount}</span>
                      <span className="text-slate-500 ml-1">lessons</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-cyan-300 font-bold">{s.mockTestsCount}</span>
                      <span className="text-slate-500 ml-1">tests</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {s.readiness === "ready" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 size={11} /> READY
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <AlertTriangle size={11} /> INCOMPLETE
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleGenerateSkill(s.canonicalName)}
                          disabled={busySkill === s.canonicalName}
                          className="px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-[11px] font-medium text-purple-300 transition disabled:opacity-40"
                        >
                          {busySkill === s.canonicalName ? "Generating…" : "Generate"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleValidateSkill(s.canonicalName)}
                          disabled={busySkill === s.canonicalName}
                          className="px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-[11px] font-medium text-slate-300 transition disabled:opacity-40"
                        >
                          Validate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

