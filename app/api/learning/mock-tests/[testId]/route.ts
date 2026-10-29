import { NextResponse } from "next/server";
import { getMockTest } from "@/lib/learning/repository";
import { sanitizeMockTestForStudent } from "@/lib/learning/mock-test-schema";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ testId: string }> }
) {
  try {
    const { testId } = await params;
    const test = await getMockTest(testId);
    if (!test) {
      return NextResponse.json({ error: { message: "Mock test not found" } }, { status: 404 });
    }

    // Strip answers so student cannot see answer key before submitting
    const sanitized = sanitizeMockTestForStudent(test);

    return NextResponse.json({ data: { test: sanitized } });
  } catch (error) {
    return NextResponse.json(
      { error: { message: error instanceof Error ? error.message : "Failed to load test" } },
      { status: 500 }
    );
  }
}

