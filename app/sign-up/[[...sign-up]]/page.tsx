import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";
import { AuthShell } from "../../components/auth/auth-shell";
import { AuthUnavailable } from "../../components/auth/auth-unavailable";

export default function SignUpPage() {
  return (
    <AuthShell
      eyebrow="Create your account"
      title="Create your CareerTwin account"
      description="Create a secure account to carry your career target, evidence, and future assessments beyond this browser."
    >
      {process.env.CLERK_SECRET_KEY ? (
        <Suspense fallback={<div className="h-[560px] w-full max-w-[400px] animate-pulse rounded-3xl border border-ink/8 bg-white/70" aria-label="Loading sign-up" />}>
          <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" fallbackRedirectUrl="/onboarding" />
        </Suspense>
      ) : <AuthUnavailable />}
    </AuthShell>
  );
}
