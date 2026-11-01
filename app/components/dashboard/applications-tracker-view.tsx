"use client";

import { useEffect, useState } from "react";
import {
  Bookmark,
  Calendar,
  Building,
  ExternalLink,
  Plus,
  Trash2,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  Briefcase,
  X,
  FileSpreadsheet,
  FileCode,
} from "lucide-react";
import type { ApplicationRecord, ApplicationStatus } from "@/lib/career/application-tracker";

interface ApplicationsTrackerViewProps {
  ownerKey?: string;
  onNavigateOpportunities?: () => void;
}

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; bg: string; text: string }> = {
  saved: { label: "Saved", bg: "bg-slate-100", text: "text-slate-800" },
  preparing: { label: "Preparing", bg: "bg-amber-100", text: "text-amber-900" },
  applied: { label: "Applied", bg: "bg-blue-100", text: "text-blue-900" },
  assessment: { label: "Assessment", bg: "bg-purple-100", text: "text-purple-900" },
  interview: { label: "Interview Scheduled", bg: "bg-emerald-100", text: "text-emerald-900" },
  offer: { label: "Offer Received", bg: "bg-emerald-200", text: "text-emerald-950 font-black" },
  rejected: { label: "Archived / Rejected", bg: "bg-red-100", text: "text-red-900" },
  withdrawn: { label: "Withdrawn", bg: "bg-gray-200", text: "text-gray-800" },
};

export function ApplicationsTrackerView({
  ownerKey,
  onNavigateOpportunities,
}: ApplicationsTrackerViewProps) {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);

  // Form state for creating/editing application
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [status, setStatus] = useState<ApplicationStatus>("applied");
  const [notes, setNotes] = useState("");
  const [appliedDate, setAppliedDate] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadApplications() {
    setLoading(true);
    try {
      const res = await fetch("/api/career/applications");
      if (res.ok) {
        const json = await res.json();
        setApplications(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load applications:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadApplications();
  }, []);

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/career/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: company.trim(),
          role: role.trim(),
          jobUrl: jobUrl.trim(),
          status,
          notes: notes.trim(),
          appliedDate: appliedDate || null,
          upcomingInterviewDate: interviewDate || null,
          nextAction: nextAction.trim() || "Review application status",
        }),
      });

      if (res.ok) {
        setModalOpen(false);
        // Reset form
        setCompany("");
        setRole("");
        setJobUrl("");
        setNotes("");
        setAppliedDate("");
        setInterviewDate("");
        setNextAction("");
        await loadApplications();
      }
    } catch (err) {
      console.error("Failed to save application:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/career/applications?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setApplications((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete application:", err);
    }
  };

  const handleExport = (format: "csv" | "json") => {
    window.open(`/api/career/applications?format=${format}`, "_blank");
  };

  const filtered = applications.filter((a) => {
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <section className="rounded-[28px] border border-ink/8 bg-white p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-accent font-bold flex items-center gap-2">
            <span className="size-2 rounded-full bg-accent" />
            Application Lifecycle Management
          </p>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-ink">
            Internship & Job Application Tracker
          </h1>
          <p className="text-sm text-slate">
            Track interview dates, resume versions, follow-up actions, and employer responses in one private repository.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => handleExport("csv")}
            className="button-secondary px-3 py-2 text-xs inline-flex items-center gap-1.5 cursor-pointer"
            title="Download CSV spreadsheet"
          >
            <FileSpreadsheet size={14} /> Export CSV
          </button>
          <button
            type="button"
            onClick={() => handleExport("json")}
            className="button-secondary px-3 py-2 text-xs inline-flex items-center gap-1.5 cursor-pointer"
            title="Download JSON backup"
          >
            <FileCode size={14} /> Export JSON
          </button>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="button-primary px-4 py-2 text-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={15} /> Add Application
          </button>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/8 bg-white p-3 shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterStatus === "all" ? "bg-ink text-white" : "bg-app text-slate hover:text-ink"
            }`}
          >
            All ({applications.length})
          </button>
          {(Object.keys(STATUS_CONFIG) as ApplicationStatus[]).map((st) => {
            const count = applications.filter((a) => a.status === st).length;
            if (count === 0 && filterStatus !== st) return null;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  filterStatus === st ? "bg-ink text-white" : "bg-app text-slate hover:text-ink"
                }`}
              >
                {STATUS_CONFIG[st].label} ({count})
              </button>
            );
          })}
        </div>

        {onNavigateOpportunities && (
          <button
            type="button"
            onClick={onNavigateOpportunities}
            className="text-xs font-bold text-accent hover:underline cursor-pointer"
          >
            + Discover More Opportunities →
          </button>
        )}
      </section>

      {/* Applications List */}
      {loading ? (
        <div className="space-y-3">
          <div className="h-28 rounded-2xl bg-white border border-ink/8 animate-pulse" />
          <div className="h-28 rounded-2xl bg-white border border-ink/8 animate-pulse" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-ink/10 bg-white p-12 text-center space-y-3">
          <Bookmark size={32} className="mx-auto text-slate/40" />
          <p className="text-base font-bold text-ink">No applications in this category</p>
          <p className="text-xs text-slate max-w-sm mx-auto">
            Save opportunities from the Career Opportunities feed or record a direct application.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="button-primary px-4 py-2 text-xs"
            >
              Add First Application
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((app) => {
            const stBadge = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied;

            return (
              <div
                key={app.id}
                className="rounded-2xl border border-ink/10 bg-white p-5 shadow-2xs hover:border-accent/30 transition space-y-3"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${stBadge.bg} ${stBadge.text}`}>
                        {stBadge.label}
                      </span>
                      {app.jobUrl && (
                        <a
                          href={app.jobUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate hover:text-accent inline-flex items-center gap-1 text-xs"
                        >
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-ink">{app.role}</h3>
                    <p className="text-xs text-slate font-medium flex items-center gap-1.5">
                      <Building size={13} /> {app.company}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDelete(app.id)}
                      className="p-1.5 text-slate/60 hover:text-red-700 transition cursor-pointer"
                      title="Delete record"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Next Action & Interview Reminder Banner */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-xl bg-app/50 p-3 text-xs text-slate">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate/70 block">Next Action</span>
                    <strong className="text-ink">{app.nextAction || "Review role requirements"}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate/70 block">Applied Date</span>
                    <span>{app.appliedDate || "Draft / Preparing"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate/70 block">Upcoming Interview</span>
                    <span className={app.upcomingInterviewDate ? "font-bold text-emerald-800" : ""}>
                      {app.upcomingInterviewDate || "None scheduled"}
                    </span>
                  </div>
                </div>

                {app.notes && (
                  <p className="text-xs text-slate/85 bg-white p-2.5 rounded-lg border border-ink/8 leading-relaxed">
                    {app.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Application Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 md:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-ink/10 pb-3">
              <h2 className="text-lg font-bold text-ink">Record New Application</h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate hover:text-ink cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateApplication} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-ink">Company / Organization *</label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Google, Red Hat, Stripe"
                    className="w-full rounded-xl border border-ink/15 p-2.5 text-xs focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-ink">Role Title *</label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Software Engineering Intern"
                    className="w-full rounded-xl border border-ink/15 p-2.5 text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-ink">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                    className="w-full rounded-xl border border-ink/15 p-2.5 text-xs bg-white focus:outline-hidden"
                  >
                    <option value="saved">Saved</option>
                    <option value="preparing">Preparing Application</option>
                    <option value="applied">Applied</option>
                    <option value="assessment">Technical Assessment</option>
                    <option value="interview">Interview Scheduled</option>
                    <option value="offer">Offer Received</option>
                    <option value="rejected">Archived / Rejected</option>
                    <option value="withdrawn">Withdrawn</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-ink">Job Posting URL</label>
                  <input
                    type="url"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    placeholder="https://company.com/careers/job"
                    className="w-full rounded-xl border border-ink/15 p-2.5 text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-ink">Applied Date</label>
                  <input
                    type="date"
                    value={appliedDate}
                    onChange={(e) => setAppliedDate(e.target.value)}
                    className="w-full rounded-xl border border-ink/15 p-2.5 text-xs focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-ink">Upcoming Interview Date</label>
                  <input
                    type="date"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="w-full rounded-xl border border-ink/15 p-2.5 text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-ink">Next Action Item</label>
                <input
                  type="text"
                  value={nextAction}
                  onChange={(e) => setNextAction(e.target.value)}
                  placeholder="e.g. Complete coding challenge, Send follow-up email"
                  className="w-full rounded-xl border border-ink/15 p-2.5 text-xs focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-ink">Personal Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes on recruiters, salary discussion, referral contact..."
                  className="w-full rounded-xl border border-ink/15 p-2.5 text-xs focus:outline-hidden leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink/8">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate hover:bg-app text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="button-primary px-5 py-2 text-xs font-semibold disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

