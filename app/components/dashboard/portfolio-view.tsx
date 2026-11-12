"use client";

import { useEffect, useState } from "react";
import {
  Globe,
  Lock,
  Share2,
  Check,
  ExternalLink,
  ShieldCheck,
  Eye,
  Save,
  FolderGit2,
  GraduationCap,
  Award,
} from "lucide-react";
import type { StudentPortfolio } from "@/lib/career/portfolio-engine";
import type { TwinOutput } from "@/lib/twin/schema";
import Link from "next/link";

interface PortfolioViewProps {
  role: string;
  twin: TwinOutput | null;
  ownerKey?: string;
}

export function PortfolioView({ role, twin, ownerKey }: PortfolioViewProps) {
  const [portfolio, setPortfolio] = useState<StudentPortfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [publishedProjects, setPublishedProjects] = useState<
    Array<{
      id: string;
      title: string;
      outcome: string;
      deliverableUrl?: string;
      skills: string[];
      completedAt?: string;
      status?: string;
    }>
  >([]);

  // Form fields
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [github, setGithub] = useState("");
  const [website, setWebsite] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [showEmail, setShowEmail] = useState(false);

  useEffect(() => {
    // Load local verified/guided projects synced via Development / Twin state
    try {
      const storageKey = ownerKey ? `careertwin-development-v1:${ownerKey}` : "careertwin-development-v1";
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          projects?: Array<{
            id?: string;
            title?: string;
            description?: string;
            contribution?: string;
            technologies?: string;
            repoUrl?: string;
            status?: string;
            verifiedAt?: string;
          }>;
        };
        if (Array.isArray(parsed?.projects)) {
          const mapped = parsed.projects
            .filter((p) => Boolean(p?.title))
            .map((p, idx) => ({
              id: p.id || `proj-${idx + 1}`,
              title: p.title || "Engineering Project",
              outcome: p.contribution || p.description || "Completed guided engineering deliverable.",
              deliverableUrl: p.repoUrl || undefined,
              skills: (p.technologies || "")
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
              completedAt: p.verifiedAt,
              status: p.status || "in-progress",
            }));
          setPublishedProjects(mapped);
        }
      }
    } catch {
      // safe localStorage fallback
    }
  }, [ownerKey]);

  useEffect(() => {
    async function loadPortfolio() {
      setLoading(true);
      try {
        const res = await fetch("/api/career/portfolio");
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            const p: StudentPortfolio = json.data;
            setPortfolio(p);
            setName(p.name);
            setHeadline(p.headline);
            setBio(p.bio);
            setGithub(p.links?.github || "");
            setWebsite(p.links?.website || "");
            setIsPublic(p.privacySettings?.isPublic ?? false);
            setShowEmail(p.privacySettings?.showEmail ?? false);
            if (Array.isArray(p.projects) && p.projects.length > 0) {
              setPublishedProjects((prev) => (prev.length > 0 ? prev : p.projects));
            }
          } else {
            // Seed defaults
            setName("CareerTwin Scholar");
            setHeadline(`Aspiring ${role || "Software Developer"}`);
            setBio("Building practical engineering deliverables and completing competency evaluations.");
          }
        }
      } catch (err) {
        console.error("Failed to load portfolio:", err);
      } finally {
        setLoading(false);
      }
    }

    void loadPortfolio();
  }, [role]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/career/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          headline: headline.trim(),
          bio: bio.trim(),
          targetRole: role || "Software Developer",
          links: {
            github: github.trim(),
            website: website.trim(),
          },
          privacySettings: {
            isPublic,
            showEmail,
            showScores: true,
          },
          verifiedSkills: twin?.demonstratedSkills?.map((s) => ({
            name: s.name,
            score: s.assessmentScore,
            verifiedAt: new Date().toISOString(),
          })) || [],
          projects: publishedProjects.map((proj) => ({
            id: proj.id,
            title: proj.title,
            outcome: proj.outcome,
            deliverableUrl: proj.deliverableUrl,
            skills: proj.skills,
            completedAt: proj.completedAt,
          })),
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setPortfolio(json.data);
      }
    } catch (err) {
      console.error("Failed to save portfolio:", err);
    } finally {
      setSaving(false);
    }
  };

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const shareableUrl = portfolio && origin ? `${origin}/portfolio/${portfolio.slug || portfolio.id}` : "";

  const handleCopy = () => {
    if (!shareableUrl) return;
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <section className="rounded-[28px] border border-ink/8 bg-white p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-accent font-bold flex items-center gap-2">
            <span className="size-2 rounded-full bg-accent" />
            Public Recruiter & Employer Showcase
          </p>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-ink">
            Verified Student Portfolio
          </h1>
          <p className="text-sm text-slate">
            Present your verified skills, GitHub deliverables, and earned certificates in a clean, recruiter-friendly profile.
          </p>
        </div>

        {portfolio && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {isPublic ? (
              <>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="button-secondary px-3 py-2 text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check size={14} className="text-emerald-700" /> : <Share2 size={14} />}
                  {copied ? "Link Copied!" : "Copy Share Link"}
                </button>
                <Link
                  href={`/portfolio/${portfolio.slug || portfolio.id}`}
                  target="_blank"
                  className="button-primary px-3.5 py-2 text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye size={14} /> Open Public Page
                </Link>
              </>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate">
                <Lock size={13} /> Private (Not Visible Publicly)
              </span>
            )}
          </div>
        )}
      </section>

      {/* Settings & Customization Form */}
      <section className="rounded-3xl border border-ink/10 bg-white p-6 md:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-ink/8 pb-4">
          <h2 className="text-base font-bold text-ink">Portfolio Settings & Privacy Controls</h2>
          <span className="text-xs text-slate">Private profile information is protected by default.</span>
        </div>

        <form onSubmit={handleSave} className="space-y-5 text-xs">
          {/* Privacy Toggles */}
          <div className="rounded-2xl bg-[#faf9f5] border border-ink/8 p-4 space-y-3">
            <p className="font-bold text-ink text-xs">Visibility Settings:</p>
            <div className="flex flex-col sm:flex-row gap-6">
              <label className="flex items-center gap-2.5 cursor-pointer font-semibold text-ink">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded border-ink/20 size-4 text-brand-forest focus:ring-0"
                />
                <span>Make Portfolio Publicly Accessible via Link</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer font-semibold text-ink">
                <input
                  type="checkbox"
                  checked={showEmail}
                  onChange={(e) => setShowEmail(e.target.checked)}
                  className="rounded border-ink/20 size-4 text-brand-forest focus:ring-0"
                />
                <span>Display Contact Email to Recruiters</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-ink">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-ink/15 p-2.5 text-xs focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-ink">Professional Headline</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Junior Backend Engineer | Python & Distributed Systems"
                className="w-full rounded-xl border border-ink/15 p-2.5 text-xs focus:outline-hidden"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-ink">Summary Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell employers about your engineering approach, strengths, and what problems you love solving..."
              className="w-full rounded-xl border border-ink/15 p-2.5 text-xs focus:outline-hidden leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-ink">Public GitHub URL</label>
              <input
                type="url"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="https://github.com/yourusername"
                className="w-full rounded-xl border border-ink/15 p-2.5 text-xs focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-ink">Live Project or Website URL</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourportfolio.dev"
                className="w-full rounded-xl border border-ink/15 p-2.5 text-xs focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="button-primary px-6 py-2.5 text-xs font-bold disabled:opacity-50 cursor-pointer"
            >
              {saving ? "Saving Changes..." : "Save Portfolio Changes"}
            </button>
          </div>
        </form>
      </section>

      {/* Published Engineering Projects */}
      <section className="rounded-3xl border border-ink/10 bg-white p-6 md:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-ink/8 pb-4">
          <div className="flex items-center gap-2">
            <FolderGit2 size={18} className="text-accent" />
            <h2 className="text-base font-bold text-ink">Published Engineering Projects</h2>
          </div>
          <span className="text-xs font-semibold text-slate">{publishedProjects.length} recorded</span>
        </div>

        {loading ? (
          <p className="text-xs text-slate py-4">Loading portfolio projects...</p>
        ) : publishedProjects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink/15 p-6 text-center text-xs text-slate">
            No guided projects recorded yet. Complete or publish deliverables inside Guided Projects to showcase them here.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {publishedProjects.map((proj) => (
              <article key={proj.id} className="rounded-2xl border border-ink/10 bg-[#faf9f5] p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-ink">{proj.title}</h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      proj.status === "verified" || proj.status === "completed"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {proj.status || "Recorded"}
                  </span>
                </div>
                <p className="text-xs text-slate leading-relaxed">{proj.outcome}</p>
                {proj.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {proj.skills.map((tech) => (
                      <span key={tech} className="rounded-md border border-ink/10 bg-white px-2 py-0.5 text-[10px] font-semibold text-ink">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                {proj.deliverableUrl && (
                  <a
                    href={proj.deliverableUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-accent hover:underline"
                  >
                    <ExternalLink size={12} /> View Deliverable
                  </a>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

