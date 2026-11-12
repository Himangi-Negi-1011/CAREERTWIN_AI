"use client";

import { useEffect, useState } from "react";
import {
  Briefcase,
  Search,
  ExternalLink,
  Filter,
  CheckCircle2,
  AlertCircle,
  Bookmark,
  Building,
  MapPin,
  Calendar,
  Sparkles,
  BookOpen,
  Terminal,
  ShieldCheck,
  RefreshCw,
  Clock,
  Award,
} from "lucide-react";
import type { CareerOpportunity, OpportunityMatch } from "@/lib/career/opportunities-data";
import type { TwinOutput } from "@/lib/twin/schema";

interface CareerOpportunitiesViewProps {
  twin: TwinOutput | null;
  onNavigateLearning?: (skill: string) => void;
  onNavigateLabs?: () => void;
  onNavigateApplications?: () => void;
}

export function CareerOpportunitiesView({
  twin,
  onNavigateLearning,
  onNavigateLabs,
  onNavigateApplications,
}: CareerOpportunitiesViewProps) {
  const [opportunities, setOpportunities] = useState<
    Array<CareerOpportunity & { match?: OpportunityMatch }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [remoteType, setRemoteType] = useState("all");
  const [savedSuccessMap, setSavedSuccessMap] = useState<Record<string, boolean>>({});
  const [appliedMap, setAppliedMap] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem("careertwin-applied-opportunities");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [lastRefreshed, setLastRefreshed] = useState<string>("Today, 09:00 AM");

  const fetchMatchedOpportunities = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/career/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ twin }),
      });

      if (res.ok) {
        const json = await res.json();
        setOpportunities(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load opportunities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchMatchedOpportunities();
  }, [twin]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/cron/opportunities", { method: "POST" });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          // Re-match with current twin
          void fetchMatchedOpportunities();
        }
        setLastRefreshed("Just now");
      }
    } catch (e) {
      console.error("Manual refresh failed:", e);
    } finally {
      setRefreshing(false);
    }
  };

  const toggleApplied = (oppId: string) => {
    setAppliedMap((prev) => {
      const updated = { ...prev, [oppId]: !prev[oppId] };
      try {
        localStorage.setItem("careertwin-applied-opportunities", JSON.stringify(updated));
      } catch {
        // ignore storage errors
      }
      return updated;
    });
  };

  const filtered = opportunities.filter((opp) => {
    if (category !== "all") {
      if (category === "internship" && opp.category !== "internship") return false;
      if (category === "job" && opp.category !== "job" && opp.category !== "entry_level") return false;
      if (category === "graduate" && opp.category !== "graduate") return false;
      if (category === "hackathon" && opp.category !== "hackathon") return false;
      if (category === "competition" && opp.category !== "competition") return false;
      if (category === "scholarship" && opp.category !== "scholarship") return false;
      if (category === "fellowship" && opp.category !== "fellowship") return false;
      if (category === "training" && opp.category !== "training" && opp.category !== "apprenticeship" && opp.category !== "trainee") return false;
      if (category === "certification" && opp.category !== "certification") return false;
      if (category === "workshop" && opp.category !== "workshop") return false;
    }
    if (remoteType !== "all" && opp.remoteType !== remoteType) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchesText =
        opp.title.toLowerCase().includes(q) ||
        opp.company.toLowerCase().includes(q) ||
        opp.requiredSkills.some((s) => s.toLowerCase().includes(q));
      if (!matchesText) return false;
    }
    return true;
  });

  const handleSaveToTracker = async (opp: CareerOpportunity) => {
    try {
      const res = await fetch("/api/career/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityId: opp.id,
          company: opp.company,
          role: opp.title,
          jobUrl: opp.applicationUrl,
          status: "saved",
          notes: `Discovered on CareerTwin (${opp.source}). Required skills: ${opp.requiredSkills.join(", ")}.`,
        }),
      });

      if (res.ok) {
        setSavedSuccessMap((prev) => ({ ...prev, [opp.id]: true }));
        setTimeout(() => {
          setSavedSuccessMap((prev) => ({ ...prev, [opp.id]: false }));
        }, 3000);
      }
    } catch (err) {
      console.error("Failed to save to application tracker:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <section className="rounded-3xl border border-ink/8 dark:border-white/10 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-accent dark:text-purple-400 font-bold">
              10 Verified Opportunity Streams · Daily Refreshed
            </p>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-ink dark:text-white">
            Career Center & Industry Feeds
          </h1>
          <p className="text-xs md:text-sm text-slate dark:text-slate-400 leading-relaxed">
            Real internships, entry-level jobs, graduate programs, hackathons, and certifications.
            Each listing is evaluated against your verified Career Twin skills with zero guesswork.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-ink/10 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2 text-xs font-semibold text-ink dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            <span>{refreshing ? "Refreshing..." : "Refresh Feed"}</span>
          </button>

          {onNavigateApplications && (
            <button
              type="button"
              onClick={onNavigateApplications}
              className="button-primary px-4 py-2 text-xs inline-flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Bookmark size={14} /> View Application Tracker
            </button>
          )}
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="rounded-2xl border border-ink/8 dark:border-white/10 bg-white dark:bg-slate-900 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search size={16} className="text-slate dark:text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by role, company, or skill (e.g. Python, Linux, AWS)..."
            className="w-full text-xs text-ink dark:text-white bg-transparent focus:outline-hidden placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-ink/10 dark:border-white/10 bg-app dark:bg-slate-800 px-3 py-1.5 text-xs text-ink dark:text-white font-semibold focus:outline-hidden"
          >
            <option value="all">All 10 Categories</option>
            <option value="internship">Internships</option>
            <option value="job">Entry-Level Jobs</option>
            <option value="graduate">Graduate Programs</option>
            <option value="hackathon">Hackathons</option>
            <option value="competition">Competitions & Leagues</option>
            <option value="scholarship">Scholarships & Grants</option>
            <option value="fellowship">Fellowships</option>
            <option value="training">Training Programs</option>
            <option value="certification">Industry Certifications</option>
            <option value="workshop">Technical Workshops</option>
          </select>

          <select
            value={remoteType}
            onChange={(e) => setRemoteType(e.target.value)}
            className="rounded-xl border border-ink/10 dark:border-white/10 bg-app dark:bg-slate-800 px-3 py-1.5 text-xs text-ink dark:text-white font-semibold focus:outline-hidden"
          >
            <option value="all">All Locations</option>
            <option value="remote">Remote (Worldwide)</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">On-Site</option>
          </select>
        </div>
      </section>

      {/* Opportunity Cards List */}
      {loading ? (
        <div className="grid gap-4">
          <div className="h-44 rounded-2xl bg-white dark:bg-slate-900 border border-ink/8 dark:border-white/10 animate-pulse" />
          <div className="h-44 rounded-2xl bg-white dark:bg-slate-900 border border-ink/8 dark:border-white/10 animate-pulse" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-ink/10 dark:border-white/10 bg-white dark:bg-slate-900 p-10 text-center space-y-2">
          <p className="text-base font-bold text-ink dark:text-white">No matching opportunities found</p>
          <p className="text-xs text-slate dark:text-slate-400">Try selecting 'All 10 Categories' or clearing search filters.</p>
        </div>
      ) : (
        <div className="grid gap-5">
          {filtered.map((opp) => {
            const match = opp.match;
            const isSaved = savedSuccessMap[opp.id];
            const isApplied = Boolean(appliedMap[opp.id]);

            return (
              <article
                key={opp.id}
                className="rounded-3xl border border-ink/10 dark:border-white/10 bg-white dark:bg-slate-900 p-6 shadow-xs hover:border-accent/40 dark:hover:border-purple-500/40 transition space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-ink/8 dark:border-white/10 pb-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-app dark:bg-slate-800 border border-ink/10 dark:border-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate dark:text-slate-300">
                        {opp.employmentType}
                      </span>
                      <span className="rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-2.5 py-0.5 text-[10px] font-bold capitalize">
                        {opp.remoteType}
                      </span>
                      {opp.status === "closing_soon" && (
                        <span className="rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 px-2 py-0.5 text-[10px] font-bold">
                          Closing Soon
                        </span>
                      )}
                      {match && (
                        <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-[11px] font-extrabold flex items-center gap-1">
                          <Sparkles size={11} className="text-emerald-600 dark:text-emerald-400" /> {match.relevanceScore}% Twin Match
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-ink dark:text-white tracking-tight">{opp.title}</h2>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate dark:text-slate-400">
                      <span className="inline-flex items-center gap-1 font-semibold text-ink dark:text-white">
                        <Building size={13} className="text-slate-400" /> {opp.company}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={13} /> {opp.location}
                      </span>
                      {opp.applicationDeadline && (
                        <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300 font-semibold">
                          <Calendar size={13} /> Deadline: {opp.applicationDeadline}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleApplied(opp.id)}
                      className={`px-3 py-2 text-xs font-bold rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
                        isApplied
                          ? "bg-purple-50 dark:bg-purple-950/50 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300"
                          : "bg-app dark:bg-slate-800 border-ink/10 dark:border-white/10 text-slate dark:text-slate-300 hover:text-white"
                      }`}
                    >
                      <CheckCircle2 size={13} className={isApplied ? "text-purple-600" : "text-slate-400"} />
                      <span>{isApplied ? "Applied ✓" : "Mark as Applied"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSaveToTracker(opp)}
                      className={`px-3 py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                        isSaved
                          ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 text-emerald-800 dark:text-emerald-300"
                          : "bg-app dark:bg-slate-800 border-ink/10 dark:border-white/10 text-ink dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      {isSaved ? "Saved to Tracker ✓" : "Save / Bookmark"}
                    </button>

                    <a
                      href={opp.applicationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="button-primary px-3.5 py-2 text-xs inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      Official Page <ExternalLink size={13} />
                    </a>
                  </div>
                </div>

                {/* Description & Eligibility */}
                <p className="text-xs text-slate dark:text-slate-300 leading-relaxed">{opp.description}</p>
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-ink/5 dark:border-white/5 p-3 text-[11px] text-slate-700 dark:text-slate-300">
                  <strong className="text-ink dark:text-white font-semibold">Compensation & Support:</strong> {opp.compensationNote}
                </div>

                {/* Twin Match Breakdown */}
                {match && (
                  <div className="rounded-2xl bg-[#faf9f5] dark:bg-slate-800/40 border border-ink/8 dark:border-white/10 p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <p className="text-xs font-bold text-ink dark:text-white flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-purple-600 dark:text-purple-400" />
                        Career Twin Match Evaluation:
                      </p>
                      <p className="text-[11px] text-slate dark:text-slate-400 italic">{match.relevanceReason}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1 mb-1">
                          <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" />
                          Requirements Met ({match.matchedSkills.length})
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {match.matchedSkills.length > 0 ? (
                            match.matchedSkills.map((s, idx) => (
                              <span key={idx} className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 px-2 py-0.5 rounded text-[11px] font-semibold">
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate dark:text-slate-400 text-[11px] italic">None demonstrated yet</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1 mb-1">
                          <AlertCircle size={12} className="text-amber-600 dark:text-amber-400" />
                          Requirements to Bridge ({match.missingSkills.length})
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {match.missingSkills.length > 0 ? (
                            match.missingSkills.map((s, idx) => (
                              <span key={idx} className="bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 px-2 py-0.5 rounded text-[11px] font-semibold">
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">All required skills met!</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bridge Gaps Action links */}
                    {match.missingSkills.length > 0 && onNavigateLearning && (
                      <div className="pt-2 border-t border-ink/8 dark:border-white/10 flex flex-wrap items-center gap-3 text-[11px]">
                        <span className="font-bold text-slate dark:text-slate-400">Recommended Action to Qualify:</span>
                        <button
                          type="button"
                          onClick={() => onNavigateLearning(match.missingSkills[0])}
                          className="font-bold text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <BookOpen size={12} /> Study {match.missingSkills[0]}
                        </button>
                        {onNavigateLabs && (
                          <button
                            type="button"
                            onClick={onNavigateLabs}
                            className="font-bold text-brand-forest hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Terminal size={12} /> Practice in Lab Sandbox
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Source and Verification Timestamp */}
                <div className="flex items-center justify-between text-[11px] text-slate dark:text-slate-400 pt-1">
                  <span>Source: {opp.source}</span>
                  <span>Verified: {opp.lastVerifiedDate}</span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
