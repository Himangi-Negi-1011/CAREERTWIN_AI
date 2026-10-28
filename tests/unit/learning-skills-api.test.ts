// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
const { authMock } = vi.hoisted(() => ({ authMock: vi.fn() }));
vi.mock("@clerk/nextjs/server", () => ({ auth: authMock }));
import { GET } from "@/app/api/learning/skills/route";

describe("Learning skill catalog API", () => {
  beforeEach(() => authMock.mockResolvedValue({ userId: "user_a" }));
  it("requires authentication", async () => {
    authMock.mockResolvedValue({ userId: null });
    expect((await GET(new Request("http://test/api/learning/skills?q=python"))).status).toBe(401);
  });
  it("returns canonical seeded results", async () => {
    const response = await GET(new Request("http://test/api/learning/skills?q=JS"));
    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(payload.data.skills[0].canonicalName).toBe("JavaScript");
    expect(payload.data.catalogMode).toBe("seeded-and-extensible");
  });
  it("offers safe universal registration for an unseen skill", async () => {
    const response = await GET(new Request("http://test/api/learning/skills?q=Quantum%20error%20correction"));
    const payload = await response.json();
    expect(payload.data.registration).toMatchObject({ canonicalName: "Quantum error correction", available: true });
  });
  it("rejects invalid limits", async () => {
    expect((await GET(new Request("http://test/api/learning/skills?q=x&limit=500"))).status).toBe(400);
  });
});
