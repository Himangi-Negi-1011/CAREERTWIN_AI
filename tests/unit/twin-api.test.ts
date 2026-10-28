// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
const { authMock, getMock, patchMock } = vi.hoisted(() => ({ authMock: vi.fn(), getMock: vi.fn(), patchMock: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@clerk/nextjs/server", () => ({ auth: authMock }));
vi.mock("@/lib/twin/repository", () => ({ TwinRevisionConflictError: class TwinRevisionConflictError extends Error {}, getCareerTwin: getMock, patchCareerTwin: patchMock }));
import { GET, PATCH } from "@/app/api/twin/route";

describe("Career Twin API", () => {
  beforeEach(() => { vi.clearAllMocks(); authMock.mockResolvedValue({ userId: "user_a" }); });
  it("rejects unsigned reads", async () => { authMock.mockResolvedValue({ userId: null }); expect((await GET()).status).toBe(401); });
  it("loads only through the authenticated owner identity", async () => { getMock.mockResolvedValue({ revision: 2, source: {}, twin: { targetRole: "Data Analyst" } }); const response = await GET(); expect(response.status).toBe(200); expect(getMock).toHaveBeenCalledWith("user_a"); });
  it("validates patches before persistence", async () => { const response = await PATCH(new Request("http://test/api/twin", { method: "PATCH", body: JSON.stringify({ mutationId: "not-a-uuid", patch: {} }) })); expect(response.status).toBe(400); expect(patchMock).not.toHaveBeenCalled(); });
  it("passes a validated idempotent mutation to the owner-scoped repository", async () => { patchMock.mockResolvedValue({ revision: 3 }); const body = { mutationId: "123e4567-e89b-12d3-a456-426614174000", patch: { evidence: { "Data Analyst": { records: { SQL: { status: "learning", evidence: "" } }, customSkills: [] } } } }; const response = await PATCH(new Request("http://test/api/twin", { method: "PATCH", body: JSON.stringify(body) })); expect(response.status).toBe(200); expect(patchMock).toHaveBeenCalledWith("user_a", body.patch, body.mutationId); });
});
