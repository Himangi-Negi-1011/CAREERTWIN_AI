import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";
import { AuthShell } from "../components/auth/auth-shell";
import { AuthUnavailable } from "../components/auth/auth-unavailable";

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Welcome Back"
      title="Sign in to CareerTwin"
      description="Access your personalized AI career co-pilot, resume your learning courses, practice interviews, and track skill mastery."
    >
      {process.env.CLERK_SECRET_KEY ? (
        <Suspense fallback={<div className="h-[460px] w-full animate-pulse rounded-2xl bg-white/5 border border-white/10" aria-label="Loading sign-in" />}>
          <SignIn routing="path" path="/login" signUpUrl="/sign-up" fallbackRedirectUrl="/dashboard" />
        </Suspense>
      ) : (
        <AuthUnavailable />
      )}
    </AuthShell>
  );
}
