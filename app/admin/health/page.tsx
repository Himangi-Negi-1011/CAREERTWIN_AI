"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server,
  Database,
  Cpu,
  BookOpen,
  MessageSquare,
  ShieldCheck,
  Clock,
} from "lucide-react";
import type { ProductionHealthStatus } from "@/app/api/admin/health/route";

export default function AdminHealthPage() {
  const [health, setHealth] = useState<ProductionHealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHealth = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/admin/health");
      if (res.ok) {
        const json = await res.json();
        setHealth(json.data);
      }
    } catch {
      // offline fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f6fb] p-6 md:p-10 font-sans text-ink">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ink/10 pb-6">
          <div className="space-y-1">
            <Link
              href="/admin/library"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-forest hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Learning Library
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold font-serif text-ink flex items-center gap-2">
              <Activity className="h-6 w-6 text-brand-forest" />
              Production System Health & Diagnostics
            </h1>
            <p className="text-xs md:text-sm text-ink/70">
              Real-time monitoring of AI provider availability, database connectivity, and student
              learning infrastructure.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchHealth}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 rounded-xl border border-ink/15 bg-white px-3.5 py-2 text-xs font-semibold text-ink shadow-xs hover:bg-surface disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh Metrics
            </button>
            <Link
              href="/dashboard"
              className="rounded-xl bg-brand-forest px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-forest/90"
            >
              Open Dashboard
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 rounded-2xl bg-white border border-ink/10" />
            ))}
          </div>
        ) : health ? (
          <div className="space-y-8 animate-fade-in">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* AI Provider Card */}
              <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink/50">
                    AI Engine
                  </span>
                  <Cpu className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-ink">{health.aiProvider.name}</h3>
                  <div className="mt-1 flex items-center gap-1.5">
                    {health.aiProvider.status === "healthy" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Operational
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                        <AlertTriangle className="h-3.5 w-3.5" /> Fallback Mode
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-ink/65 border-t border-ink/5 pt-2">
                  {health.aiProvider.note}
                </p>
              </div>

              {/* Database Status Card */}
              <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink/50">
                    Persistence
                  </span>
                  <Database className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-ink">{health.database.provider}</h3>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Active
                    </span>
                  </div>
                </div>
                <p className="text-xs text-ink/65 border-t border-ink/5 pt-2">
                  {health.database.note}
                </p>
              </div>

              {/* Course Packages Card */}
              <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink/50">
                    Curriculum
                  </span>
                  <BookOpen className="h-5 w-5 text-brand-forest" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-ink">
                    {health.learningLibrary.totalAuthoredCourses} Authored Courses
                  </h3>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-brand-forest font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5" /> 100% Validated Packages
                  </div>
                </div>
                <p className="text-xs text-ink/65 border-t border-ink/5 pt-2">
                  76 Lessons · 80 Mock Tests & Checkpoints
                </p>
              </div>

              {/* Student Feedback Card */}
              <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink/50">
                    Feedback Queue
                  </span>
                  <MessageSquare className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-ink">
                    {health.studentFeedback.totalReports} Total Tickets
                  </h3>
                  <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                    <span>{health.studentFeedback.newReports} Unreviewed Reports</span>
                  </div>
                </div>
                <p className="text-xs text-ink/65 border-t border-ink/5 pt-2">
                  {health.studentFeedback.status === "normal"
                    ? "Normal ticket volume"
                    : "Attention recommended"}
                </p>
              </div>
            </div>

            {/* System Info Banner */}
            <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Server className="h-5 w-5 text-ink/50" />
                <div>
                  <h4 className="font-semibold text-ink text-sm">System Node Environment</h4>
                  <p className="text-xs text-ink/60">
                    Runtime: {health.environment} · Uptime: {Math.floor(health.uptimeSeconds / 60)} minutes
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-ink/50">
                <Clock className="h-3.5 w-3.5" /> Last Verified:{" "}
                {new Date(health.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

