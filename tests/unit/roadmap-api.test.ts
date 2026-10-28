// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { emptyCareerProfile } from "@/lib/profile/schema";
const { authMock, profileMock, generateMock } = vi.hoisted(() => ({ authMock: vi.fn(), profileMock: vi.fn(), generateMock: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@clerk/nextjs/server", () => ({ auth: authMock }));
vi.mock("@/lib/twin/repository", () => ({ getCareerProfile: profileMock }));
vi.mock("@/lib/ai/provider", () => ({ AIConfigurationError: class AIConfigurationError extends Error {}, AIProviderError: class AIProviderError extends Error {}, generateCareerRoadmap: generateMock }));
import { POST } from "@/app/api/roadmap/generate/route";

describe("personalized roadmap API", () => {
  beforeEach(() => { vi.clearAllMocks(); authMock.mockResolvedValue({ userId: "user_1" }); profileMock.mockResolvedValue({ ...emptyCareerProfile, interests: { ...emptyCareerProfile.interests, targetRole: "Data Analyst" }, skills: [{ id: "sql", name: "SQL", category: "", proficiency: "beginner", learning: true }] }); generateMock.mockResolvedValue({ summary: "A saved-profile plan.", tasks: [{ title: "Practise SQL joins", detail: "Complete a documented exercise.", rationale: "SQL is saved as developing.", proof: "Queries and notes", estimatedMinutes: 60 }, { title: "Clean a dataset", detail: "Document quality checks used.", rationale: "Data cleaning is role-relevant.", proof: "Clean dataset", estimatedMinutes: 90 }, { title: "Explain findings", detail: "Write a concise findings brief.", rationale: "Communication is role-relevant.", proof: "Published brief", estimatedMinutes: 60 }] }); });
  it("uses the authenticated saved profile rather than a client-supplied profile", async () => { const response = await POST(new Request("http://test/api/roadmap/generate", { method: "POST", body: JSON.stringify({ reviewedResumeFacts: [], resumeFactsConfirmed: true, profile: { interests: { targetRole: "Fake Role" } } }) })); expect(response.status).toBe(200); expect(profileMock).toHaveBeenCalledWith("user_1"); expect(generateMock).toHaveBeenCalledWith(expect.objectContaining({ targetRole: "Data Analyst", skills: [expect.objectContaining({ name: "SQL" })] }), expect.any(AbortSignal)); });
  it("rejects unsigned generation", async () => { authMock.mockResolvedValue({ userId: null }); expect((await POST(new Request("http://test", { method: "POST", body: "{}" }))).status).toBe(401); });
});
