import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { interviewErrorResponse, unauthorized } from "@/lib/interviews/http";
import { deleteSession } from "@/lib/interviews/repository";

export async function DELETE(_: Request, context: { params: Promise<{ sessionId: string }> }) { const { userId } = await auth(); if (!userId) return unauthorized(); const { sessionId } = await context.params; try { await deleteSession(userId, sessionId); return new NextResponse(null, { status: 204 }); } catch (error) { return interviewErrorResponse(error); } }
