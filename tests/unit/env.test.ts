import { describe, expect, it } from "vitest";
import { getIntegrationStatus, serverEnvSchema } from "@/lib/env/schema";

describe("environment configuration", () => {
  it("does not require provider credentials for the foundation build", () => {
    expect(serverEnvSchema.parse({})).toEqual({});
    expect(getIntegrationStatus({})).toEqual({
      clerk: "not-configured",
      supabase: "not-configured",
      gemini: "not-configured",
      openrouter: "not-configured",
    });
  });

  it("reports partially configured providers without exposing values", () => {
    const status = getIntegrationStatus({
      NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_example",
    });
    expect(status).toEqual({ clerk: "incomplete", supabase: "incomplete", gemini: "not-configured", openrouter: "not-configured" });
    expect(JSON.stringify(status)).not.toContain("pk_test_example");
  });

  it("reports Gemini only when both server-side values are present", () => {
    expect(getIntegrationStatus({ GEMINI_API_KEY: "secret", GEMINI_MODEL: "gemini-2.5-flash" }).gemini).toBe("configured");
    expect(getIntegrationStatus({ GEMINI_API_KEY: "secret" }).gemini).toBe("incomplete");
  });

  it("rejects malformed public URLs", () => {
    expect(() => serverEnvSchema.parse({ NEXT_PUBLIC_SUPABASE_URL: "not-a-url" })).toThrow();
  });
});
