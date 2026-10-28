import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";
import { AuthShell } from "../../components/auth/auth-shell";
import { AuthUnavailable } from "../../components/auth/auth-unavailable";

export default function SignInPage() {
  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Welcome back"
      description="Sign in to return to your workspace and keep building evidence toward the role you want."
    >
      {process.env.CLERK_SECRET_KEY ? (
        <Suspense fallback={<div className="h-[520px] w-full max-w-[400px] animate-pulse rounded-3xl border border-ink/8 bg-white/70" aria-label="Loading sign-in" />}>
          <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" fallbackRedirectUrl="/dashboard" />
        </Suspense>
      ) : <AuthUnavailable />}
    </AuthShell>
  );
}
