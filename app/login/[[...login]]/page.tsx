import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";
import { CheckCircle2 } from "lucide-react";
import { AuthShell } from "../../components/auth/auth-shell";
import { AuthUnavailable } from "../../components/auth/auth-unavailable";

export default async function LoginPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const isConfigured = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
  );
  const resolvedParams = props.searchParams ? await props.searchParams : {};
  const justLoggedOut = resolvedParams?.logged_out === "true";

  return (
    <AuthShell
      eyebrow="Welcome Back"
      title="Sign in to CareerTwin"
      description="Access your personalized AI career co-pilot, resume your learning courses, practice interviews, and track skill mastery."
    >
      <div className="w-full max-w-[420px]">
        {justLoggedOut && (
          <div
            role="status"
            className="mb-4 flex items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs font-semibold text-emerald-400"
          >
            <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
            <span>You have been logged out securely. All session tokens cleared.</span>
          </div>
        )}
        {isConfigured ? (
          <Suspense fallback={<div className="h-[460px] w-full animate-pulse rounded-2xl bg-white/5 border border-white/10" aria-label="Loading sign-in" />}>
            <SignIn routing="path" path="/login" signUpUrl="/sign-up" fallbackRedirectUrl="/dashboard" />
          </Suspense>
        ) : (
          <Suspense fallback={<div className="h-[460px] w-full animate-pulse rounded-2xl bg-white/5 border border-white/10" aria-label="Loading sign-in" />}>
            <AuthUnavailable />
          </Suspense>
        )}
      </div>
    </AuthShell>
  );
}
