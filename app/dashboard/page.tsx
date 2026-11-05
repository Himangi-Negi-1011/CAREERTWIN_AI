import type { Metadata } from "next";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AuthorizedWorkspace } from "./authorized-workspace";

export const metadata: Metadata = {
  title: "Career workspace — CareerTwin",
  description: "See your career target, evidence, next action, and development journey.",
};

export default async function DashboardPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const isConfigured = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
  );
  const resolvedParams = props.searchParams ? await props.searchParams : {};
  const isDemo = resolvedParams?.demo === "true";

  let userId: string | null = null;
  if (isConfigured) {
    try {
      const authObj = await auth();
      userId = authObj.userId;
    } catch {
      userId = null;
    }
  }

  if (!userId && !isDemo && isConfigured) {
    redirect("/sign-in?redirect_url=/dashboard");
  }

  return (
    <Suspense fallback={<main className="min-h-screen bg-cream" aria-busy="true" aria-label="Loading career workspace" />}>
      <AuthorizedWorkspace ownerKey={userId || "demo-student"} />
    </Suspense>
  );
}
