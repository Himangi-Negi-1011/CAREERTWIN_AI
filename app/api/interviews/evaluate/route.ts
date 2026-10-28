import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { interviewEvaluationRequestSchema, summarizeEvaluation } from "@/lib/ai/interview";
import { AIConfigurationError, AIProviderError, evaluateInterviewAnswer } from "@/lib/ai/provider";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Sign in to evaluate an interview answer." } }, { status: 401 });

  const parsed = interviewEvaluationRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: { code: "INVALID_REQUEST", message: "The interview answer or setup is invalid.", details: parsed.error.flatten().fieldErrors } }, { status: 400 });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);
  try {
    const evaluation = await evaluateInterviewAnswer(parsed.data, controller.signal);
    return NextResponse.json({ data: { evaluation, summary: summarizeEvaluation(evaluation) } });
  } catch (error) {
    if (error instanceof AIConfigurationError) return NextResponse.json({ error: { code: "AI_NOT_CONFIGURED", message: "Interview evaluation requires a configured server-side AI provider." } }, { status: 503 });
    if (error instanceof AIProviderError) return NextResponse.json({ error: { code: "AI_PROVIDER_ERROR", message: "The evaluation provider could not complete this request." } }, { status: error.status, headers: error.retryAfter ? { "Retry-After": error.retryAfter } : undefined });
    const timeoutError = error instanceof DOMException && error.name === "AbortError";
    return NextResponse.json({ error: { code: timeoutError ? "AI_TIMEOUT" : "AI_INVALID_RESPONSE", message: timeoutError ? "The evaluation provider timed out. Try again later." : "The evaluation provider returned an invalid response." } }, { status: timeoutError ? 504 : 502 });
  } finally { clearTimeout(timeout); }
}
