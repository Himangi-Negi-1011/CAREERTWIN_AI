import Link from "next/link";
import { notFound } from "next/navigation";
import { Award, CheckCircle2, ShieldCheck, ArrowLeft, Printer, ExternalLink } from "lucide-react";
import { getAchievementById } from "@/lib/career/achievements";

export default async function CertificateVerificationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const achievement = await getAchievementById(id);

  if (!achievement) {
    return (
      <main className="min-h-screen bg-app flex items-center justify-center p-6 text-ink">
        <div className="max-w-md w-full bg-white rounded-3xl border border-ink/10 p-8 text-center space-y-4 shadow-sm">
          <div className="mx-auto size-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Award size={28} />
          </div>
          <h1 className="text-xl font-bold">Record Not Found</h1>
          <p className="text-sm text-slate">
            The verification ID <span className="font-mono font-bold text-ink">{id}</span> could not be verified in the CareerTwin registry.
          </p>
          <div className="pt-2">
            <Link href="/" className="button-primary inline-flex items-center gap-2 text-xs">
              <ArrowLeft size={14} /> Return to CareerTwin Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f6fb] py-12 px-4 md:px-6 flex flex-col items-center justify-center text-ink">
      <div className="max-w-2xl w-full space-y-6">
        {/* Navigation & Status Banner */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard?view=certificates"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate hover:text-ink transition"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
            <ShieldCheck size={14} className="text-emerald-600" /> Authenticated & Verified Record
          </span>
        </div>

        {/* Certificate Card */}
        <div className="relative rounded-[32px] border-2 border-brand-forest/20 bg-white p-8 md:p-12 shadow-xl space-y-8 overflow-hidden">
          {/* Subtle watermark background */}
          <div className="pointer-events-none absolute -right-20 -bottom-20 size-80 rounded-full border-[40px] border-brand-forest/[0.04]" />

          {/* Certificate Header */}
          <div className="text-center space-y-2 border-b border-ink/8 pb-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-forest/10 text-brand-forest">
              <Award className="h-6 w-6" />
            </div>
            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-accent font-bold">
              CareerTwin Official Verification Registry
            </p>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-ink">
              Certificate of Skill Demonstration
            </h1>
            <p className="text-xs text-slate">Verification ID: <span className="font-mono font-bold text-ink">{achievement.id}</span></p>
          </div>

          {/* Recipient Details */}
          <div className="text-center space-y-3">
            <p className="text-xs text-slate uppercase tracking-wider font-semibold">This is to certify that</p>
            <h2 className="text-2xl md:text-4xl font-black text-ink tracking-tight font-serif">
              {achievement.studentName}
            </h2>
            <p className="text-sm text-slate max-w-lg mx-auto">
              has successfully completed all required modules, code exercises, and rigorous evaluations for:
            </p>
            <div className="inline-block rounded-2xl bg-violet-50/70 border border-violet-100 px-6 py-2.5">
              <p className="text-base md:text-lg font-bold text-accent">{achievement.title}</p>
            </div>
          </div>

          {/* Competency Skills Verified */}
          {achievement.skills && achievement.skills.length > 0 && (
            <div className="rounded-2xl bg-[#faf9f5] border border-ink/8 p-5 space-y-2">
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate font-bold">
                Demonstrated Competencies Verified
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {achievement.skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-ink/10 px-2.5 py-1 text-xs font-semibold text-ink shadow-2xs"
                  >
                    <CheckCircle2 size={12} className="text-emerald-600" /> {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Footer Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-t border-ink/8 pt-6 text-xs text-slate">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate/70">Issue Date</p>
              <p className="font-semibold text-ink mt-0.5">
                {new Date(achievement.issueDate).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate/70">Issuing Entity</p>
              <p className="font-semibold text-ink mt-0.5">CareerTwin AI</p>
            </div>
            <div className="col-span-2 md:col-span-1">
              <p className="text-[10px] uppercase font-bold text-slate/70">Audit Status</p>
              <p className="font-semibold text-emerald-700 mt-0.5 flex items-center gap-1">
                <CheckCircle2 size={13} /> Verified on Ledger
              </p>
            </div>
          </div>

          {/* Mandatory Transparent Disclaimer */}
          <div className="rounded-xl bg-amber-500/8 border border-amber-500/20 p-3.5 text-[11px] text-amber-900 leading-relaxed">
            <p><strong>Registry Notice:</strong> {achievement.disclaimer}</p>
          </div>
        </div>
      </div>
    </main>
  );
}

