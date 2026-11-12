import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";
import { CheckCircle2 } from "lucide-react";
import { AuthShell } from "../../components/auth/auth-shell";
import { AuthUnavailable } from "../../components/auth/auth-unavailable";

export default async function SignInPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const isConfigured = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
  );
  const resolvedParams = props.searchParams ? await props.searchParams : {};
  const justLoggedOut = resolvedParams?.logged_out === "true";

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Welcome back"
      description="Sign in to return to your workspace and keep building evidence toward the role you want."
    >
      <div className="w-full max-w-[400px]">
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
          <Suspense fallback={<div className="h-[520px] w-full animate-pulse rounded-3xl border border-ink/8 bg-white/70" aria-label="Loading sign-in" />}>
            <SignIn
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
              fallbackRedirectUrl="/dashboard"
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
        ) : (
          <Suspense fallback={<div className="h-[520px] w-full animate-pulse rounded-3xl border border-ink/8 bg-white/70" aria-label="Loading sign-in" />}>
            <AuthUnavailable />
          </Suspense>
        )}
      </div>
    </AuthShell>
  );
}
