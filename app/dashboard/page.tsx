import type { Metadata } from "next";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthorizedWorkspace } from "./authorized-workspace";

export const metadata: Metadata = {
  title: "Career workspace — CareerTwin",
  description: "See your career target, evidence, next action, and development journey.",
};

export default async function DashboardPage() {
  const isConfigured = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
  );

  let userId: string | null = null;
  if (isConfigured) {
    try {
      const authObj = await auth();
      userId = authObj.userId;
    } catch {
      userId = null;
    }
    if (!userId) {
      redirect("/login?redirect_url=/dashboard");
    }
  } else {
    const cookieStore = await cookies();
    const hasDemoSession = cookieStore.get("ct_demo_session")?.value === "1";
    if (!hasDemoSession) {
      redirect("/login?redirect_url=/dashboard");
    }
    userId = "demo-student";
  }

  return (
    <Suspense fallback={<main className="min-h-screen bg-cream" aria-busy="true" aria-label="Loading career workspace" />}>
      <AuthorizedWorkspace ownerKey={userId} />
    </Suspense>
  );
}
