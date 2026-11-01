import { describe, expect, it } from "vitest";
import {
  getUserApplications,
  saveUserApplication,
  deleteUserApplication,
  exportApplicationsToCSV,
  type ApplicationRecord,
} from "@/lib/career/application-tracker";

describe("Application Tracker (Phase 3)", () => {
  const testUserId = `test-user-${Date.now()}`;

  it("saves, lists, and manages application records with user isolation", async () => {
    // 1. Create Application
    const record = await saveUserApplication(testUserId, {
      company: "Google Summer of Code",
      role: "Open Source Contributor Fellow",
      jobUrl: "https://summerofcode.withgoogle.com",
      status: "applied",
      notes: "Proposal submitted for Linux kernel telemetry project.",
      nextAction: "Check organization announcement on May 1st",
    });

    expect(record.id).toBeDefined();
    expect(record.userId).toBe(testUserId);
    expect(record.company).toBe("Google Summer of Code");
    expect(record.status).toBe("applied");

    // 2. Fetch User Applications
    const userApps = await getUserApplications(testUserId);
    expect(userApps.length).toBe(1);
    expect(userApps[0].company).toBe("Google Summer of Code");

    // 3. Export to CSV
    const csv = exportApplicationsToCSV(userApps);
    expect(csv).toContain("Company,Role,Status");
    expect(csv).toContain("Google Summer of Code");
    expect(csv).toContain("applied");

    // 4. Delete Application
    const deleted = await deleteUserApplication(testUserId, record.id);
    expect(deleted).toBe(true);

    const afterDelete = await getUserApplications(testUserId);
    expect(afterDelete.length).toBe(0);
  });
});

