"use client";

import { Award, CheckCircle2, Download, Printer, ShieldCheck, Sparkles, X } from "lucide-react";
import { Brand } from "../brand";

interface CertificateModalProps {
  studentName?: string;
  courseTitle?: string;
  issueDate?: string;
  certificateId?: string;
  skills?: string[];
  onClose: () => void;
}

export function CertificateModal({
  studentName = "CareerTwin Scholar",
  courseTitle = "Full-Stack Software Engineering",
  issueDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
  certificateId = `CT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
  skills = ["Python", "SQL", "Software Architecture", "Security Principles"],
  onClose,
}: CertificateModalProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4 backdrop-blur-xs animate-fade-in print:p-0 print:bg-white"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cert-title"
    >
      <div className="relative max-h-[95vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 md:p-10 shadow-2xl space-y-6 print:m-0 print:max-h-none print:shadow-none print:rounded-none">
        {/* Top Control Bar (Hidden on print) */}
        <div className="flex items-center justify-between border-b border-ink/10 pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            <span className="text-sm font-bold text-ink">Official CareerTwin Certificate of Completion</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl border border-brand-forest/30 bg-brand-forest/5 px-3.5 py-1.5 text-xs font-semibold text-brand-forest hover:bg-brand-forest hover:text-white transition-all"
            >
              <Printer className="h-4 w-4" /> Print / Save PDF
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-ink/40 hover:bg-surface hover:text-ink transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Certificate Printable Canvas */}
        <div
          id="careertwin-certificate"
          className="relative rounded-2xl border-4 border-double border-brand-forest/30 bg-gradient-to-b from-surface/50 via-white to-surface/30 p-8 md:p-12 text-center space-y-6 print:border-4 print:p-10"
        >
          {/* Decorative Corner Accents */}
          <div className="absolute top-3 left-3 h-6 w-6 border-t-2 border-l-2 border-brand-forest/40" />
          <div className="absolute top-3 right-3 h-6 w-6 border-t-2 border-r-2 border-brand-forest/40" />
          <div className="absolute bottom-3 left-3 h-6 w-6 border-b-2 border-l-2 border-brand-forest/40" />
          <div className="absolute bottom-3 right-3 h-6 w-6 border-b-2 border-r-2 border-brand-forest/40" />

          {/* Seal / Header */}
          <div className="space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-forest/10 border border-brand-forest/20 text-brand-forest">
              <Award className="h-8 w-8 text-amber-500" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-forest">
              CareerTwin Educational Academy
            </p>
            <h1 id="cert-title" className="text-2xl md:text-4xl font-serif font-bold text-ink tracking-tight">
              Certificate of Technical Mastery
            </h1>
          </div>

          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider text-ink/50">This is proudly presented to</p>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-brand-forest underline decoration-amber-400 underline-offset-8">
              {studentName}
            </h2>
          </div>

          <p className="max-w-xl mx-auto text-xs md:text-sm text-ink/75 leading-relaxed">
            for successfully completing all curriculum modules, passing comprehensive phase assessments with
            verified server-side evaluation, and demonstrating practical engineering competency in
          </p>

          <div className="inline-block rounded-xl border border-ink/10 bg-white px-6 py-2.5 shadow-xs">
            <h3 className="text-lg md:text-xl font-bold text-ink">{courseTitle}</h3>
          </div>

          {/* Verified Skills Chips */}
          <div className="space-y-2 pt-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink/50">
              Verified Competencies &amp; Lab Evidence:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {skills.map((s, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 rounded-full border border-brand-forest/20 bg-brand-forest/5 px-3 py-1 text-xs font-medium text-brand-forest"
                >
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Verification Signatures & Metadata */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-ink/10 pt-6 text-xs text-ink/65">
            <div className="text-left space-y-0.5">
              <p className="font-semibold text-ink">CareerTwin AI Verification Engine</p>
              <p className="font-mono text-[11px] text-ink/50">Credential ID: {certificateId}</p>
            </div>

            <div className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold text-xs">
              <ShieldCheck className="h-4 w-4" />
              Cryptographically Verified Record
            </div>

            <div className="text-right space-y-0.5">
              <p className="font-semibold text-ink">Date Awarded</p>
              <p className="text-[11px] text-ink/70">{issueDate}</p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-[11px] text-ink/40 print:hidden">
          This certificate verifies completion of rigorous curriculum standards within the CareerTwin LMS platform.
        </p>
      </div>
    </div>
  );
}
