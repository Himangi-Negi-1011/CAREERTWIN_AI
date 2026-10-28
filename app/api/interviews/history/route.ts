import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { interviewErrorResponse, unauthorized } from "@/lib/interviews/http";
import { listHistory } from "@/lib/interviews/repository";

export async function GET() { const { userId } = await auth(); if (!userId) return unauthorized(); try { return NextResponse.json({ data: { sessions: await listHistory(userId) } }); } catch (error) { return interviewErrorResponse(error); } }
