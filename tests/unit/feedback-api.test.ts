import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
  currentUser: vi.fn().mockResolvedValue({
    id: "user_test_123",
    emailAddresses: [{ emailAddress: "student@careertwin.ai" }],
  }),
}));

import { POST, GET } from "@/app/api/feedback/route";

describe("Feedback API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when message is too short or missing category", async () => {
    const req = new Request("http://localhost:3000/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: "invalid_category",
        message: "hi",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid feedback payload");
  });

  it("persists valid feedback and returns 201", async () => {
    const req = new Request("http://localhost:3000/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: "confusing_lesson",
        message: "The binary search tree rotation diagram could use an extra step explanation.",
        rating: 4,
        context: {
          page: "/dashboard?view=learning",
          courseSlug: "data-structures-and-algorithms",
          lessonId: "trees-and-graphs",
        },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.category).toBe("confusing_lesson");
    expect(data.data.userId).toBe("user_test_123");
  });

  it("retrieves stored feedback via GET", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });
});
