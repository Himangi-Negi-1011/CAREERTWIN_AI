import { describe, expect, it, vi } from "vitest";

const { authMock, redirectMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  redirectMock: vi.fn(() => { throw new Error("NEXT_REDIRECT"); }),
}));

vi.mock("@clerk/nextjs/server", () => ({ auth: authMock }));
vi.mock("next/navigation", () => ({ redirect: redirectMock }));
vi.mock("@/app/components/dashboard/workspace", () => ({ CareerWorkspace: () => null }));

import { AuthorizedWorkspace } from "@/app/dashboard/authorized-workspace";

describe("dashboard authorization", () => {
  it("redirects an unauthenticated request before rendering private content", async () => {
    authMock.mockResolvedValue({ userId: null });

    await expect(AuthorizedWorkspace()).rejects.toThrow("NEXT_REDIRECT");
    expect(redirectMock).toHaveBeenCalledWith("/sign-in?redirect_url=/dashboard");
  });

  it("scopes the workspace to the authenticated Clerk subject", async () => {
    authMock.mockResolvedValue({ userId: "user_test_123" });

    const result = await AuthorizedWorkspace();
    expect(result.props.ownerKey).toBe("user_test_123");
  });
});
