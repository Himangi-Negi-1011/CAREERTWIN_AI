// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
const { authMock } = vi.hoisted(() => ({ authMock: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@clerk/nextjs/server", () => ({ auth: authMock }));
vi.mock("@/lib/supabase/admin", () => ({ DatabaseConfigurationError: class DatabaseConfigurationError extends Error {}, getSupabaseAdmin: vi.fn(() => { throw new Error("database should not be reached"); }) }));
import { GET as getSettings, PUT as putSettings } from "@/app/api/settings/route";
import { GET as exportAccount } from "@/app/api/account/export/route";

describe("privacy and export APIs", () => {
  beforeEach(() => { vi.clearAllMocks(); authMock.mockResolvedValue({ userId: null }); });
  it("rejects unsigned settings and export access", async () => { expect((await getSettings()).status).toBe(401); expect((await exportAccount()).status).toBe(401); });
  it("rejects malformed privacy preferences before database access", async () => { authMock.mockResolvedValue({ userId: "user_1" }); const response = await putSettings(new Request("http://test/api/settings", { method: "PUT", body: JSON.stringify({ retainTranscripts: "yes" }) })); expect(response.status).toBe(400); });
});
