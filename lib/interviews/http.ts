import { NextResponse } from "next/server";
import { AIConfigurationError, AIProviderError } from "@/lib/ai/provider";
import { DatabaseConfigurationError } from "@/lib/supabase/admin";
import { InterviewConflictError, InterviewNotFoundError } from "./repository";

export function interviewErrorResponse(error: unknown) {
  if (error instanceof AIConfigurationError) return NextResponse.json({ error: { code: "AI_NOT_CONFIGURED", message: error.message } }, { status: 503 });
  if (error instanceof DatabaseConfigurationError) return NextResponse.json({ error: { code: "DATABASE_NOT_CONFIGURED", message: "Secure interview persistence is unavailable." } }, { status: 503 });
  if (error instanceof AIProviderError) return NextResponse.json({ error: { code: "AI_PROVIDER_ERROR", message: "The AI provider could not complete the request." } }, { status: error.status, headers: error.retryAfter ? { "Retry-After": error.retryAfter } : undefined });
  if (error instanceof InterviewNotFoundError) return NextResponse.json({ error: { code: "NOT_FOUND", message: error.message } }, { status: 404 });
  if (error instanceof InterviewConflictError) return NextResponse.json({ error: { code: "CONFLICT", message: error.message } }, { status: 409 });
  if (error instanceof DOMException && error.name === "AbortError") return NextResponse.json({ error: { code: "AI_TIMEOUT", message: "The AI provider timed out." } }, { status: 504 });
  console.error("Interview operation failed", error instanceof Error ? error.message : "Unknown error");
  return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "The interview operation could not be completed." } }, { status: 500 });
}

export function unauthorized() { return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Sign in to use interview sessions." } }, { status: 401 }); }
export function invalidRequest(details?: unknown) { return NextResponse.json({ error: { code: "INVALID_REQUEST", message: "The request is invalid.", details } }, { status: 400 }); }
