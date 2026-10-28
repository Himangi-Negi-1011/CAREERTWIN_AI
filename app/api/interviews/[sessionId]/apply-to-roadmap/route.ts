import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { interviewErrorResponse, unauthorized } from "@/lib/interviews/http";
import { approveRoadmap, getOwnedSession } from "@/lib/interviews/repository";
import { getCareerTwin, patchCareerTwin } from "@/lib/twin/repository";

const proposalSchema = z.object({ weeklyMinutesCap: z.number().int().min(0).max(10080), requiresApproval: z.literal(true), tasks: z.array(z.object({ title: z.string().min(2).max(120), detail: z.string().min(5).max(600), estimatedMinutes: z.number().int().min(10).max(600) })).min(1).max(6) });
export async function POST(_: Request, context: { params: Promise<{ sessionId: string }> }) {
  const { userId } = await auth(); if (!userId) return unauthorized(); const { sessionId } = await context.params;
  try {
    const session = await getOwnedSession(userId, sessionId); if (session.status !== "completed") return NextResponse.json({ error: { code: "CONFLICT", message: "Complete the interview before applying roadmap changes." } }, { status: 409 });
    const proposal = proposalSchema.parse(session.roadmap_proposal); const total = proposal.tasks.reduce((sum, task) => sum + task.estimatedMinutes, 0); if (total > proposal.weeklyMinutesCap) return NextResponse.json({ error: { code: "INVALID_PROPOSAL", message: "The proposed tasks exceed the saved weekly study-hour cap." } }, { status: 409 });
    const approval = await approveRoadmap(userId, sessionId, proposal);
    let twinUpdated = true;
    try {
      const current = await getCareerTwin(userId);
      const existingIds = new Set(current.source.development.tasks.map((task) => task.id));
      const added = (approval.tasks as Array<{ id: string; title: string; detail: string; estimated_minutes: number; created_at: string }>).filter((task) => !existingIds.has(task.id)).map((task) => ({ id: task.id, title: task.title, detail: task.detail, done: false, status: "planned" as const, skill: session.target_role, prerequisites: "Complete earlier roadmap foundations first.", priority: "medium" as const, estimatedMinutes: task.estimated_minutes, notes: "Approved from an interview practice report.", createdAt: task.created_at }));
      await patchCareerTwin(userId, { development: { ...current.source.development, tasks: [...current.source.development.tasks, ...added] } }, sessionId);
    } catch (twinError) { twinUpdated = false; console.error("Approved interview roadmap Twin sync failed", twinError instanceof Error ? twinError.name : "UnknownError"); }
    return NextResponse.json({ data: { approval, twinUpdated }, warning: twinUpdated ? undefined : "The interview tasks were approved, but the Career Twin could not be refreshed. Reload and retry synchronization." }, { status: 201 });
  } catch (error) { return interviewErrorResponse(error); }
}
