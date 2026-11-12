import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit, checkSharedRateLimit, getClientIdentifier } from "@/lib/security/rate-limit";

describe("Rate Limiting Engine", () => {
  it("allows requests below the limit", () => {
    const id = `test-user-${Date.now()}`;
    const result1 = checkRateLimit(id, { limit: 3, windowMs: 10_000, prefix: "test" });
    expect(result1.allowed).toBe(true);
    expect(result1.remaining).toBe(2);

    const result2 = checkRateLimit(id, { limit: 3, windowMs: 10_000, prefix: "test" });
    expect(result2.allowed).toBe(true);
    expect(result2.remaining).toBe(1);

    const result3 = checkRateLimit(id, { limit: 3, windowMs: 10_000, prefix: "test" });
    expect(result3.allowed).toBe(true);
    expect(result3.remaining).toBe(0);
  });

  it("blocks requests exceeding the limit", () => {
    const id = `test-blocked-${Date.now()}`;
    checkRateLimit(id, { limit: 2, windowMs: 10_000, prefix: "test-block" });
    checkRateLimit(id, { limit: 2, windowMs: 10_000, prefix: "test-block" });

    const blocked = checkRateLimit(id, { limit: 2, windowMs: 10_000, prefix: "test-block" });
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("extracts client identifier from headers or fallback", () => {
    const reqWithForwarded = new Request("http://localhost:3000/api/test", {
      headers: { "x-forwarded-for": "203.0.113.195, 70.41.3.18" },
    });
    expect(getClientIdentifier(reqWithForwarded)).toBe("203.0.113.195");

    const reqWithRealIp = new Request("http://localhost:3000/api/test", {
      headers: { "x-real-ip": "198.51.100.42" },
    });
    expect(getClientIdentifier(reqWithRealIp)).toBe("198.51.100.42");

    const fallbackUser = getClientIdentifier(new Request("http://localhost:3000/api/test"), "user_123");
    expect(fallbackUser).toBe("user_123");
  });

  it("handles checkSharedRateLimit seamlessly", async () => {
    const id = `test-shared-${Date.now()}`;
    const result = await checkSharedRateLimit(id, { limit: 5, windowMs: 10_000, prefix: "test-shared" });
    expect(result.allowed).toBe(true);
    expect(result.limit).toBe(5);
  });
});
