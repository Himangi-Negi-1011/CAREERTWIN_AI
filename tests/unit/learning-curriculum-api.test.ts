// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
const { authMock, adminMock } = vi.hoisted(() => ({ authMock: vi.fn(), adminMock: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@clerk/nextjs/server", () => ({ auth: authMock }));
vi.mock("@/lib/supabase/admin", () => ({ DatabaseConfigurationError: class DatabaseConfigurationError extends Error {}, getSupabaseAdmin: adminMock }));
vi.mock("@/lib/ai/provider", () => ({
  AIConfigurationError: class AIConfigurationError extends Error {},
  AIProviderError: class AIProviderError extends Error { status = 502; retryAfter = undefined; },
  generateLearningCurriculum: vi.fn(), getAIProviderStatus: vi.fn(() => ({ configured: false, model: null })),
}));
import { POST } from "@/app/api/learning/curricula/route";

describe("Learning curriculum API request boundary", () => {
  beforeEach(() => { vi.clearAllMocks(); authMock.mockResolvedValue({ userId: "user_a" }); });
  it("rejects unauthenticated generation before any provider or database call", async () => {
    authMock.mockResolvedValue({ userId: null });
    const response = await POST(new Request("http://test/api/learning/curricula", { method: "POST", body: JSON.stringify({ skillName: "Python" }) }));
    expect(response.status).toBe(401); expect(adminMock).not.toHaveBeenCalled();
  });
  it("rejects malformed generation input before persistence", async () => {
    const response = await POST(new Request("http://test/api/learning/curricula", { method: "POST", body: JSON.stringify({ skillName: "+", weeklyMinutes: 1 }) }));
    expect(response.status).toBe(400); expect(adminMock).not.toHaveBeenCalled();
  });
});
