import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getMockTest, saveMockTestAttempt } from "@/lib/learning/repository";
import { mockTestSubmissionSchema, gradeMockTest } from "@/lib/learning/mock-test-schema";
import { checkRateLimit, getClientIdentifier } from "@/lib/security/rate-limit";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ testId: string }> }
) {
  try {
    const session = await auth();
    const userId = session?.userId;
    if (!userId) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Sign in to submit mock tests." } },
        { status: 401 }
      );
    }

    const clientId = getClientIdentifier(request, userId);
    const rateLimit = checkRateLimit(clientId, {
      limit: 20,
      windowMs: 60_000,
      prefix: "mock-test-submit",
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: { message: "Too many test submissions. Please wait a minute before submitting again." } },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
            "X-RateLimit-Limit": String(rateLimit.limit),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    const { testId } = await params;

    const test = await getMockTest(testId);
    if (!test) {
      return NextResponse.json({ error: { message: "Mock test not found" } }, { status: 404 });
    }

    const json = await request.json();
    const submission = mockTestSubmissionSchema.parse({
      ...json,
      testId,
    });

    // Grade securely on server
    const gradedReport = gradeMockTest(test, submission);

    // Save attempt for user
    await saveMockTestAttempt(userId, gradedReport);

    return NextResponse.json({
      data: {
        report: gradedReport,
      },
    });
  } catch (error) {
    console.error("Mock test submission error:", error);
    return NextResponse.json(
      { error: { message: error instanceof Error ? error.message : "Failed to grade mock test" } },
      { status: 500 }
    );
  }
}

