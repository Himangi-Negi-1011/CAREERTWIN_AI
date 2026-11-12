import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import {
  getUserApplications,
  saveUserApplication,
  deleteUserApplication,
  exportApplicationsToCSV,
  applicationRecordSchema,
} from "@/lib/career/application-tracker";

export async function GET(req: Request) {
  try {
    const user = await currentUser().catch(() => null);
    if (!user?.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Sign in to view your job applications." } },
        { status: 401 }
      );
    }
    const userId = user.id;

    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format");
    const status = searchParams.get("status");

    let applications = await getUserApplications(userId);

    if (status && status !== "all") {
      applications = applications.filter((a) => a.status === status);
    }

    if (format === "csv") {
      const csv = exportApplicationsToCSV(applications);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="careertwin-applications-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    if (format === "json") {
      return new NextResponse(JSON.stringify(applications, null, 2), {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="careertwin-applications-${new Date().toISOString().slice(0, 10)}.json"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      total: applications.length,
      data: applications,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to retrieve job applications", details: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await currentUser().catch(() => null);
    if (!user?.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Sign in to save job applications." } },
        { status: 401 }
      );
    }
    const userId = user.id;

    const body = await req.json();
    if (!body.company || !body.role || !body.status) {
      return NextResponse.json(
        { error: "Company, role, and status are required fields." },
        { status: 400 }
      );
    }

    const saved = await saveUserApplication(userId, body);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to save job application", details: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await currentUser().catch(() => null);
    if (!user?.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Sign in to delete job applications." } },
        { status: 401 }
      );
    }
    const userId = user.id;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Application ID is required." }, { status: 400 });
    }

    const success = await deleteUserApplication(userId, id);
    if (!success) {
      return NextResponse.json(
        { error: "Application not found or not owned by current user." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Application deleted successfully." });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to delete application", details: err.message },
      { status: 500 }
    );
  }
}

