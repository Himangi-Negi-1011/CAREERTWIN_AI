import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { transcribeInterviewAudio } from "@/lib/ai/provider";
import { interviewErrorResponse, invalidRequest, unauthorized } from "@/lib/interviews/http";
import { getOwnedSession } from "@/lib/interviews/repository";

const allowed = new Set(["audio/webm", "audio/mp4", "audio/mpeg", "audio/wav", "audio/ogg"]);
export async function POST(request: Request, context: { params: Promise<{ sessionId: string }> }) {
  const { userId } = await auth(); if (!userId) return unauthorized();
  const { sessionId } = await context.params;
  try {
    await getOwnedSession(userId, sessionId);
    const form = await request.formData(); const audio = form.get("audio");
    if (!(audio instanceof File) || !allowed.has(audio.type) || audio.size < 1 || audio.size > 10 * 1024 * 1024) return invalidRequest({ audio: ["Upload a supported audio file no larger than 10 MB."] });
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 45_000);
    try { const transcript = await transcribeInterviewAudio({ bytes: new Uint8Array(await audio.arrayBuffer()), mimeType: audio.type }, controller.signal); if (!transcript) return NextResponse.json({ error: { code: "NO_SPEECH", message: "No intelligible speech was detected." } }, { status: 422 }); return NextResponse.json({ data: { transcript } }); }
    finally { clearTimeout(timer); }
  } catch (error) { return interviewErrorResponse(error); }
}
