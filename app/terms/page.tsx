import Link from "next/link";
import { ArrowLeft, Shield, FileText, CheckCircle2, Lock, Scale, HelpCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions — CareerTwin Academy",
  description: "Terms of service, academic integrity policies, and usage guidelines for CareerTwin students and learners.",
};

export default function TermsPage() {
  const lastUpdated = "November 12, 2026";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-500/30">
      {/* Top Navigation */}
      <header className="border-b border-white/10 bg-slate-900/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 group text-white">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <Shield size={18} />
            </span>
            <span className="font-bold tracking-tight text-base sm:text-lg">
              <span className="text-purple-400">Career</span>Twin <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/70">Legal</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-white/5"
            >
              <ArrowLeft size={14} /> Back to Home
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition shadow-sm"
            >
              Student Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12">
        <div className="space-y-4 border-b border-white/10 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium">
            <FileText size={13} /> Official Student & Platform Terms
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Terms and Conditions
          </h1>
          <p className="text-sm text-slate-400">
            Effective Date: <strong className="text-slate-200">{lastUpdated}</strong> · Version 1.2
          </p>
          <p className="text-base leading-relaxed text-slate-300">
            Welcome to CareerTwin. By accessing or using our websites, course curricula, AI Career Twin guidance,
            100-mark examinations, guided projects, and career opportunities features, you agree to be bound by these
            Terms and Conditions. Please review them carefully.
          </p>
        </div>

        {/* Legal Sections */}
        <div className="mt-8 space-y-10 text-sm leading-relaxed text-slate-300">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-purple-400 font-mono text-sm">01.</span> Acceptance of Terms & Eligibility
            </h2>
            <p>
              By accessing CareerTwin, you represent that you are at least 16 years of age (or the legal age of digital consent
              in your jurisdiction) and possess the capacity to agree to these Terms. If you are accessing CareerTwin on
              behalf of a university, bootcamp, or educational institution, you warrant that you are authorized to bind that entity.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-purple-400 font-mono text-sm">02.</span> Student Accounts & Identity Security
            </h2>
            <p>
              Students may sign in using email authentication or verified third-party authentication providers. You are
              responsible for maintaining the confidentiality of your session and account credentials. CareerTwin will never
              ask for your account password via email or chat. Any activity occurring under your student account is your sole
              responsibility.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-purple-400 font-mono text-sm">03.</span> CareerTwin Academy Curricula & Content
            </h2>
            <p>
              CareerTwin provides structured technical curricula aligned with Cisco Networking Academy standards across
              14 engineering tracks (Python, JavaScript, TypeScript, Cloud Computing, Cybersecurity, SQL, Power BI, C,
              C++, C#, Go, Java, PHP, and Rust). All course content, code exercises, and assessments are intended for personal,
              non-commercial educational training. You may not republish, scrape, or resell CareerTwin course modules
              without explicit written authorization.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-purple-400 font-mono text-sm">04.</span> Deterministic AI Guidance Disclaimer
            </h2>
            <div className="rounded-xl border border-purple-500/20 bg-purple-950/20 p-4 space-y-2 text-slate-300">
              <div className="flex items-center gap-2 font-semibold text-purple-200">
                <Lock size={15} /> Transparent Evidence-Backed Recommendations
              </div>
              <p className="text-xs leading-relaxed text-slate-300">
                CareerTwin’s AI Twin engine provides deterministic career recommendations based strictly on skills,
                learning records, assessment scores, and project submissions recorded on your profile. CareerTwin does not
                manufacture fake qualifications, scorecards, or readiness metrics. While our roadmaps and interview coaches
                are built to maximize your employment readiness, CareerTwin makes no guarantee of employment, job offer,
                salary tier, or university admission.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-purple-400 font-mono text-sm">05.</span> Student Projects, Code & Academic Integrity
            </h2>
            <p>
              When submitting guided projects, code repositories, or mock examination papers:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
              <li>You represent that submitted work reflects your own intellectual effort or properly attributed open-source references.</li>
              <li>You retain ownership of any original code you create and submit to your personal portfolio.</li>
              <li>Attempting to bypass mock exam timers, reverse-engineer answer keys, or submit malicious scripts to interactive code runners is strictly prohibited and results in immediate account suspension.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-purple-400 font-mono text-sm">06.</span> Career Center & Opportunity Listings
            </h2>
            <p>
              The Career Center indexes real-world internships, graduate roles, hackathons, and certifications. While CareerTwin
              regularly validates deadline and eligibility metadata, application deadlines and requirements remain subject
              to change by the third-party hiring organization. CareerTwin is not an employer or staffing agency.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-purple-400 font-mono text-sm">07.</span> Data Privacy & Local Persistence
            </h2>
            <p>
              We prioritize data minimization. When you use guest or local workspace modes, your learning progress and
              draft reviews are persisted in encrypted browser storage on your device. We do not sell your personal resume,
              code submissions, or learning history to third-party advertisers.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-purple-400 font-mono text-sm">08.</span> Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by applicable law, CareerTwin and its maintainers shall not be liable for
              any indirect, incidental, consequential, or punitive damages arising from your access to or inability to access
              the service, including but not limited to loss of data, loss of anticipated earnings, or service interruptions.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-purple-400 font-mono text-sm">09.</span> Modifications to Terms
            </h2>
            <p>
              We reserve the right to modify these Terms to reflect platform enhancements, legal compliance updates, or new
              educational features. Significant updates will be highlighted with a revised effective date on this page.
            </p>
          </section>

          {/* Section 10 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-purple-400 font-mono text-sm">10.</span> Contact & Student Support
            </h2>
            <p>
              If you have any questions regarding these Terms, academic integrity policies, or privacy rights, please reach out
              to our student operations team at <a href="mailto:support@careertwin.ai" className="text-purple-400 underline hover:text-purple-300">support@careertwin.ai</a>.
            </p>
          </section>
        </div>

        {/* Bottom Back Button */}
        <div className="mt-12 pt-8 border-t border-white/10 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white transition"
          >
            <ArrowLeft size={14} /> Back to CareerTwin Home
          </Link>
          <Link
            href="/dashboard?view=learning"
            className="inline-flex items-center gap-2 text-xs font-semibold text-purple-400 hover:text-purple-300 transition"
          >
            Go to Learning Studio →
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-900/50 py-6 text-center text-xs text-slate-400">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} CareerTwin Academy. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <Link href="/terms" className="hover:text-white text-purple-400 font-medium">Terms</Link>
            <Link href="/login" className="hover:text-white transition">Student Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
