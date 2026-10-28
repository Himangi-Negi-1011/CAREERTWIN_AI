import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthorizedWorkspace } from "./authorized-workspace";

export const metadata: Metadata = {
  title: "Career workspace — CareerTwin",
  description: "See your career target, evidence, next action, and development journey.",
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-cream" aria-busy="true" aria-label="Loading career workspace" />}>
      <AuthorizedWorkspace />
    </Suspense>
  );
}
