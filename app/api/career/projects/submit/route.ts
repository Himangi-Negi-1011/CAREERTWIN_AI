import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import {
  GUIDED_PROJECTS,
  projectSubmissionSchema,
} from "@/lib/career/projects-catalog";
import { issueAchievement } from "@/lib/career/achievements";

export async function POST(req: Request) {
  try {
    const user = await currentUser().catch(() => null);
    const userId = user?.id || "guest-local";
    const studentName = user?.firstName
      ? `${user.firstName} ${user.lastName || ""}`.trim()
      : "CareerTwin Scholar";

    const body = await req.json();
    const parsed = projectSubmissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid project submission", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { projectId, projectTitle, githubUrl, liveDemoUrl, deliverableSummary } = parsed.data;
    const project = GUIDED_PROJECTS.find((p) => p.id === projectId);

    // Perform rubric evaluation
    const checks = [
      { name: "Repository URL Format", passed: githubUrl.includes("github.com/"), weight: 25 },
      { name: "Deliverable Documentation", passed: deliverableSummary.length >= 20, weight: 25 },
      { name: "Deployment Artifact", passed: Boolean(liveDemoUrl || deliverableSummary.length > 50), weight: 25 },
      { name: "Technical Scope Match", passed: Boolean(project), weight: 25 },
    ];

    const score = checks.reduce((acc, c) => acc + (c.passed ? c.weight : 0), 0);
    const verified = score >= 75;

    let achievement = null;
    if (verified) {
      achievement = await issueAchievement({
        userId,
        studentName,
        title: `Verified Project: ${projectTitle}`,
        category: "applied_project",
        courseOrAssessment: projectTitle,
        skills: project?.requiredSkills || ["Software Engineering", "Applied Deliverables"],
        score,
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          projectId,
          projectTitle,
          verified,
          score,
          rubricEvaluation: checks,
          feedback: verified
            ? `Congratulations! Your project artifact for '${projectTitle}' has been verified. Skill evidence has been updated in your Career Twin.`
            : `Your project was received, but needs additional documentation or live demo details before meeting verification standards.`,
          achievement,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to evaluate project submission", details: err.message },
      { status: 500 }
    );
  }
}

