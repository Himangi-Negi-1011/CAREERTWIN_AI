import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { askAILearningAgent, getAIProviderStatus } from "@/lib/ai/provider";
import {
  agentRequestSchema,
  generateDeterministicAgentResponse,
} from "@/lib/learning/agent";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Sign in to chat with the AI Learning Agent." } },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = agentRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_AGENT_REQUEST",
          message: "Invalid agent request parameters.",
          details: parsed.error.flatten().fieldErrors,
        },
      },
      { status: 400 }
    );
  }

  const agentReq = parsed.data;
  const aiStatus = getAIProviderStatus();

  if (aiStatus.configured) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000);
      try {
        const response = await askAILearningAgent(agentReq, controller.signal);
        return NextResponse.json({ data: response });
      } finally {
        clearTimeout(timeout);
      }
    } catch (err) {
      console.warn("AI Learning Agent LLM call failed, using deterministic pedagogical fallback:", err instanceof Error ? err.message : err);
    }
  }

  // Deterministic pedagogical answer adhering to the requested mode & student context
  const fallback = generateDeterministicAgentResponse(agentReq);
  return NextResponse.json({ data: fallback });
}
