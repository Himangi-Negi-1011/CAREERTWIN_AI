import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";
import { AuthShell } from "../../components/auth/auth-shell";
import { AuthUnavailable } from "../../components/auth/auth-unavailable";

export default function SignUpPage() {
  const isConfigured = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
  );

  return (
    <AuthShell
      eyebrow="Create your account"
      title="Create your CareerTwin account"
      description="Create a secure account to carry your career target, evidence, and future assessments beyond this browser."
    >
      {isConfigured ? (
        <Suspense fallback={<div className="h-[560px] w-full max-w-[400px] animate-pulse rounded-3xl border border-ink/8 bg-white/70" aria-label="Loading sign-up" />}>
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            fallbackRedirectUrl="/onboarding"
            appearance={{
              elements: {
                rootBox: "w-full",
                cardBox: "w-full shadow-none bg-transparent border-0",
                card: "w-full bg-transparent border-0 shadow-none text-white p-0",
                header: "hidden",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-white rounded-xl transition text-xs font-semibold py-2.5",
                socialButtonsBlockButtonText: "text-white font-medium text-xs",
                dividerLine: "bg-white/10",
                dividerText: "text-slate-400 text-[11px]",
                formFieldLabel: "text-slate-300 font-semibold text-xs",
                formFieldInput: "bg-slate-800/80 border border-white/15 text-white placeholder-slate-500 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-sm py-2.5",
                formButtonPrimary: "bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm rounded-xl py-3 shadow-lg shadow-purple-500/30 transition",
                footerActionText: "text-slate-400 text-xs",
                footerActionLink: "text-purple-400 hover:text-purple-300 font-bold text-xs",
                identityPreviewText: "text-white text-xs",
                identityPreviewEditButton: "text-purple-400 hover:text-purple-300",
                formFieldAction: "text-purple-400 hover:text-purple-300 text-xs",
                footer: "pt-2",
              },
              variables: {
                colorPrimary: "#8b5cf6",
                borderRadius: "0.75rem",
              },
            }}
          />
        </Suspense>
      ) : <AuthUnavailable />}
    </AuthShell>
  );
}
