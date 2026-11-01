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
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [remoteType, setRemoteType] = useState("all");
  const [savedSuccessMap, setSavedSuccessMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchMatchedOpportunities() {
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
    }

    void fetchMatchedOpportunities();
  }, [twin]);

  const filtered = opportunities.filter((opp) => {
    if (category !== "all" && opp.category !== category) return false;
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
      <section className="rounded-[28px] border border-ink/8 bg-white p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-accent font-bold flex items-center gap-2">
            <span className="size-2 rounded-full bg-accent" />
            Verified Opportunities & Early-Career Feeds
          </p>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-ink">
            Real Internships, Fellowships & Early-Career Roles
          </h1>
          <p className="text-sm text-slate">
            Grounded employer listings and open-source programs. Every opportunity is matched against your actual Career Twin evidence.
          </p>
        </div>

        {onNavigateApplications && (
          <button
            type="button"
            onClick={onNavigateApplications}
            className="button-primary px-4 py-2.5 text-xs inline-flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Bookmark size={14} /> View Application Tracker
          </button>
        )}
      </section>

      {/* Filter and Search Bar */}
      <section className="rounded-2xl border border-ink/8 bg-white p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search size={16} className="text-slate shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by role, company, or skill (e.g. Python, Linux, AWS)..."
            className="w-full text-xs text-ink bg-transparent focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-ink/10 bg-app px-3 py-1.5 text-xs text-ink font-semibold focus:outline-hidden"
          >
            <option value="all">All Categories</option>
            <option value="internship">Internships</option>
            <option value="entry_level">Entry-Level</option>
            <option value="graduate">Graduate Programs</option>
            <option value="apprenticeship">Apprenticeships</option>
            <option value="hackathon">Hackathons & Challenges</option>
            <option value="trainee">Trainee Programs</option>
          </select>

          <select
            value={remoteType}
            onChange={(e) => setRemoteType(e.target.value)}
            className="rounded-xl border border-ink/10 bg-app px-3 py-1.5 text-xs text-ink font-semibold focus:outline-hidden"
          >
            <option value="all">All Locations</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">On-Site</option>
          </select>
        </div>
      </section>

      {/* Opportunity Cards List */}
      {loading ? (
        <div className="grid gap-4">
          <div className="h-44 rounded-2xl bg-white border border-ink/8 animate-pulse" />
          <div className="h-44 rounded-2xl bg-white border border-ink/8 animate-pulse" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-ink/10 bg-white p-10 text-center space-y-2">
          <p className="text-base font-bold text-ink">No matching opportunities found</p>
          <p className="text-xs text-slate">Try clearing filters or searching for a different technology.</p>
        </div>
      ) : (
        <div className="grid gap-5">
          {filtered.map((opp) => {
            const match = opp.match;
            const isSaved = savedSuccessMap[opp.id];

            return (
              <article
                key={opp.id}
                className="rounded-[26px] border border-ink/10 bg-white p-6 shadow-xs hover:border-accent/30 transition space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-ink/8 pb-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-app border border-ink/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate">
                        {opp.employmentType}
                      </span>
                      <span className="rounded-md bg-violet-50 text-accent px-2 py-0.5 text-[10px] font-bold capitalize">
                        {opp.remoteType}
                      </span>
                      {match && (
                        <span className="rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-extrabold flex items-center gap-1">
                          <Sparkles size={11} className="text-accent" /> {match.relevanceScore}% Twin Match
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-ink tracking-tight">{opp.title}</h2>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate">
                      <span className="inline-flex items-center gap-1 font-semibold text-ink">
                        <Building size={13} className="text-slate" /> {opp.company}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={13} /> {opp.location}
                      </span>
                      {opp.applicationDeadline && (
                        <span className="inline-flex items-center gap-1 text-amber-900 font-semibold">
                          <Calendar size={13} /> Deadline: {opp.applicationDeadline}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleSaveToTracker(opp)}
                      className={`px-3 py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                        isSaved
                          ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                          : "bg-app border-ink/10 text-ink hover:bg-white"
                      }`}
                    >
                      {isSaved ? "Saved to Applications ✓" : "Track Application"}
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
                <p className="text-xs text-slate leading-relaxed">{opp.description}</p>

                {/* Twin Match Breakdown */}
                {match && (
                  <div className="rounded-2xl bg-[#faf9f5] border border-ink/8 p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <p className="text-xs font-bold text-ink flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-accent" />
                        Career Twin Match Evaluation:
                      </p>
                      <p className="text-[11px] text-slate italic">{match.relevanceReason}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-emerald-800 flex items-center gap-1 mb-1">
                          <CheckCircle2 size={12} className="text-emerald-600" />
                          Requirements Met ({match.matchedSkills.length})
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {match.matchedSkills.length > 0 ? (
                            match.matchedSkills.map((s, idx) => (
                              <span key={idx} className="bg-emerald-50 text-emerald-900 px-2 py-0.5 rounded text-[11px] font-semibold">
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate text-[11px] italic">None demonstrated yet</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-amber-800 flex items-center gap-1 mb-1">
                          <AlertCircle size={12} className="text-amber-600" />
                          Requirements to Bridge ({match.missingSkills.length})
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {match.missingSkills.length > 0 ? (
                            match.missingSkills.map((s, idx) => (
                              <span key={idx} className="bg-amber-50 text-amber-900 px-2 py-0.5 rounded text-[11px] font-semibold">
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-emerald-700 text-[11px] font-bold">All required skills met!</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bridge Gaps Action links */}
                    {match.missingSkills.length > 0 && onNavigateLearning && (
                      <div className="pt-2 border-t border-ink/8 flex flex-wrap items-center gap-3 text-[11px]">
                        <span className="font-bold text-slate">Recommended Action to Qualify:</span>
                        <button
                          type="button"
                          onClick={() => onNavigateLearning(match.missingSkills[0])}
                          className="font-bold text-accent hover:underline inline-flex items-center gap-1 cursor-pointer"
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
                <div className="flex items-center justify-between text-[11px] text-slate pt-1">
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

