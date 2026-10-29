import type { Metadata } from "next";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AuthorizedWorkspace } from "./authorized-workspace";

export const metadata: Metadata = {
  title: "Career workspace — CareerTwin",
  description: "See your career target, evidence, next action, and development journey.",
};

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/dashboard");

  return (
    <Suspense fallback={<main className="min-h-screen bg-cream" aria-busy="true" aria-label="Loading career workspace" />}>
      <AuthorizedWorkspace />
    </Suspense>
  );
}
