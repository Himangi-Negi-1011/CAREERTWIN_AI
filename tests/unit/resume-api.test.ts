// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const { authMock, uploadMock, removeMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  uploadMock: vi.fn(),
  removeMock: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({ auth: authMock }));
vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdmin: () => ({ storage: { from: () => ({ upload: uploadMock, remove: removeMock }) } }),
}));

import { DELETE, POST } from "@/app/api/profile/resume/route";

describe("resume API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.mockResolvedValue({ userId: "user_123" });
    uploadMock.mockResolvedValue({ error: null });
    removeMock.mockResolvedValue({ error: null });
  });

  it("returns the storagePath field expected by the profile schema", async () => {
    const form = new FormData();
    form.append("resume", new File(["pdf"], "resume.pdf", { type: "application/pdf" }));
    const response = await POST(new Request("http://localhost/api/profile/resume", { method: "POST", body: form }));
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.data.storagePath).toMatch(/^user_123\//);
    expect(payload.data).not.toHaveProperty("path");
  });

  it("rejects deletion outside the signed-in user's folder", async () => {
    const response = await DELETE(new Request("http://localhost/api/profile/resume?path=other_user/resume.pdf", { method: "DELETE" }));
    expect(response.status).toBe(400);
    expect(removeMock).not.toHaveBeenCalled();
  });
});
