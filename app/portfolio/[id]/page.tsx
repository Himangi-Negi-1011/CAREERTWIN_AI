import Link from "next/link";
import {
  Briefcase,
  GraduationCap,
  Award,
  FolderGit2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Mail,
  Globe,
} from "lucide-react";
import { getPublicPortfolioBySlugOrId } from "@/lib/career/portfolio-engine";

export default async function PublicPortfolioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const portfolio = await getPublicPortfolioBySlugOrId(id);

  if (!portfolio) {
    return (
      <main className="min-h-screen bg-app flex items-center justify-center p-6 text-ink">
        <div className="max-w-md w-full bg-white rounded-3xl border border-ink/10 p-8 text-center space-y-4 shadow-sm">
          <div className="mx-auto size-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Lock size={28} />
          </div>
          <h1 className="text-xl font-bold">Private Portfolio</h1>
          <p className="text-sm text-slate">
            This student portfolio is either private, unlisted, or does not exist.
          </p>
          <div className="pt-2">
            <Link href="/" className="button-primary inline-flex items-center gap-2 text-xs">
              <ArrowLeft size={14} /> Return to CareerTwin
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f6fb] py-10 px-4 md:px-8 text-ink">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation & Trust Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate hover:text-ink transition"
          >
            <ArrowLeft size={14} /> CareerTwin Verified Portfolio
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-mint/20 border border-mint/40 px-3 py-1 text-xs font-bold text-emerald-800">
            <ShieldCheck size={14} className="text-accent" /> Verified Student Profile
          </span>
        </div>

        {/* Hero Card */}
        <div className="rounded-[32px] border border-ink/8 bg-white p-8 md:p-10 shadow-sm space-y-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-ink/8 pb-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-extrabold tracking-tight text-ink">{portfolio.name}</h1>
              <p className="text-base font-semibold text-accent">{portfolio.headline || portfolio.targetRole}</p>
              <p className="text-xs text-slate font-medium">Target Role: {portfolio.targetRole}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {portfolio.links.github && (
                <a
                  href={portfolio.links.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-ink/10 bg-app px-3.5 py-2 text-xs font-bold text-ink hover:bg-white transition"
                >
                  <FolderGit2 size={14} /> GitHub
                </a>
              )}
              {portfolio.links.website && (
                <a
                  href={portfolio.links.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-ink/10 bg-app px-3.5 py-2 text-xs font-bold text-ink hover:bg-white transition"
                >
                  <Globe size={14} /> Live Demo
                </a>
              )}
            </div>
          </div>

          <p className="text-sm text-slate leading-relaxed max-w-2xl">{portfolio.bio}</p>

          {/* Education Summary */}
          {portfolio.education && portfolio.education.length > 0 && (
            <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate">
              {portfolio.education.map((edu, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <GraduationCap size={15} className="text-accent" />
                  <span>
                    <strong className="text-ink">{edu.degree}</strong> · {edu.institution} {edu.year ? `(${edu.year})` : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Verified Skills Section */}
        {portfolio.verifiedSkills && portfolio.verifiedSkills.length > 0 && (
          <section className="rounded-3xl border border-ink/8 bg-white p-6 md:p-8 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-ink">Assessment-Verified Skills</h2>
                <p className="text-xs text-slate">Competencies proven through timed technical evaluations and practical labs.</p>
              </div>
              <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-accent">
                {portfolio.verifiedSkills.length} Verified
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              {portfolio.verifiedSkills.map((s, idx) => (
                <div key={idx} className="rounded-xl border border-ink/8 bg-app/40 p-3.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-xs font-bold text-ink">{s.name}</strong>
                    {s.score !== undefined && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {s.score}%
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate">{s.source || "CareerTwin Exam"}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Verified Projects Section */}
        {portfolio.projects && portfolio.projects.length > 0 && (
          <section className="rounded-3xl border border-ink/8 bg-white p-6 md:p-8 space-y-4 shadow-2xs">
            <div>
              <h2 className="text-lg font-bold text-ink">Applied Projects & Code Deliverables</h2>
              <p className="text-xs text-slate">Functional artifacts evaluated against industry architecture rubrics.</p>
            </div>

            <div className="grid gap-4 pt-2">
              {portfolio.projects.map((proj) => (
                <div key={proj.id} className="rounded-2xl border border-ink/10 p-5 space-y-3 hover:border-accent/30 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-ink">{proj.title}</h3>
                      <p className="mt-1 text-xs text-slate leading-relaxed">{proj.outcome}</p>
                    </div>
                    {proj.deliverableUrl && (
                      <a
                        href={proj.deliverableUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-accent hover:underline shrink-0"
                      >
                        Repository <ExternalLink size={12} />
                      </a>
                    )}
                  </div>

                  {proj.skills && proj.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {proj.skills.map((sk, sIdx) => (
                        <span key={sIdx} className="text-[10px] font-semibold bg-app px-2 py-0.5 rounded-md text-ink/75">
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certificates & Achievements */}
        {portfolio.certificates && portfolio.certificates.length > 0 && (
          <section className="rounded-3xl border border-ink/8 bg-white p-6 md:p-8 space-y-4 shadow-2xs">
            <div>
              <h2 className="text-lg font-bold text-ink">Earned Credentials</h2>
              <p className="text-xs text-slate">Click to audit credential authenticity on the CareerTwin public registry.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {portfolio.certificates.map((cert) => (
                <Link
                  key={cert.id}
                  href={cert.verificationUrl}
                  className="group rounded-2xl border border-ink/10 p-4 flex items-center justify-between hover:border-brand-forest hover:bg-brand-forest/5 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-accent group-hover:bg-brand-forest group-hover:text-white transition">
                      <Award size={18} />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-ink">{cert.title}</p>
                      <p className="text-[10px] text-slate font-mono">{cert.id}</p>
                    </div>
                  </div>
                  <ExternalLink size={14} className="text-slate group-hover:text-ink" />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

