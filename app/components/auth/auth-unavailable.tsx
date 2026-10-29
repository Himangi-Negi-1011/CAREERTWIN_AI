import { KeyRound } from "lucide-react";
import Link from "next/link";

export function AuthUnavailable() {
  return (
    <div className="w-full max-w-[400px] rounded-[26px] border border-ink/10 bg-white p-6 shadow-[0_24px_70px_rgba(24,48,52,.09)] sm:p-8">
      <span className="grid size-11 place-items-center rounded-2xl bg-mint/55 text-accent"><KeyRound size={19} /></span>
      <p className="section-kicker mt-6">One key remaining</p>
      <h2 className="mt-3 text-2xl font-bold tracking-[-.04em]">Authentication is almost ready.</h2>
      <p className="mt-3 text-sm leading-6 text-slate">
        The Clerk interface is installed, but server authentication stays disabled until a complete development secret is configured securely.
      </p>
      <div className="mt-6 rounded-2xl border border-ink/8 bg-cream/55 p-4 text-xs leading-5 text-slate">
        No account or session has been simulated. Add the complete <code className="font-mono text-ink">CLERK_SECRET_KEY</code> to the protected environment, then restart development or rebuild the production preview.
      </div>
      <div className="mt-6 flex flex-col gap-2.5">
        <Link href="/dashboard" className="button-primary w-full text-center">
          Continue to Demo Workspace →
        </Link>
        <Link href="/" className="btn btn-outline w-full text-center text-xs">
          Return home
        </Link>
      </div>
    </div>
  );
}
