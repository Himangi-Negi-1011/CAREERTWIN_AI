import { describe, expect, it, vi } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
  currentUser: vi.fn().mockResolvedValue({
    id: "admin_user_456",
    emailAddresses: [{ emailAddress: "admin@careertwin.ai" }],
  }),
}));

import { GET } from "@/app/api/admin/health/route";

describe("Health API", () => {
  it("returns comprehensive production health diagnostics", async () => {
    const res = await GET();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.aiProvider).toBeDefined();
    expect(json.data.database).toBeDefined();
    expect(json.data.learningLibrary).toBeDefined();
    expect(json.data.studentFeedback).toBeDefined();
    expect(json.data.learningLibrary.totalAuthoredCourses).toBeGreaterThanOrEqual(14);
    expect(json.data.learningLibrary.status).toBe("production_ready");
  });
});
