import { expect, test } from "@playwright/test";

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 375, height: 812 },
];

test.describe("Phase 13 Student Flow, Security & Hydration QA", () => {
  test("responsive viewports on public & auth routes render with zero hydration errors and zero horizontal overflow", async ({
    page,
  }) => {
    test.setTimeout(180000);
    const hydrationOrPageErrors: string[] = [];
    page.on("pageerror", (err) => hydrationOrPageErrors.push(`pageerror: ${err.message}`));
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text();
        if (
          text.includes("Minified React error #418") ||
          text.includes("Hydration") ||
          text.includes("hydration") ||
          text.includes("did not match")
        ) {
          hydrationOrPageErrors.push(`console: ${text}`);
        }
      }
    });

    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      for (const route of ["/", "/login", "/sign-in", "/onboarding"]) {
        await page.goto(route, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(250);
        const overflow = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
        }));
        expect(overflow.scrollWidth, `${route} at ${vp.name} horizontal overflow`).toBeLessThanOrEqual(
          overflow.innerWidth + 1
        );
      }
    }

    expect(hydrationOrPageErrors).toEqual([]);
  });

  test("unauthenticated dashboard access and demo bypass are rejected cleanly", async ({ page }) => {
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page).not.toHaveURL(/\/dashboard$/);
    await expect(page).toHaveURL(/\/(login|sign-in)/);

    // Phase 13 security fix: ?demo=true URL query must never bypass authentication
    await page.goto("/dashboard?demo=true", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/(login|sign-in)/);
  });

  test("protected learning and career APIs enforce 401 when unauthenticated", async ({ request }) => {
    const getEndpoints = [
      "/api/learning/mock-tests",
      "/api/career/portfolio",
      "/api/career/applications",
      "/api/settings",
      "/api/profile",
    ];
    for (const endpoint of getEndpoints) {
      const res = await request.get(endpoint);
      expect(res.status(), `GET ${endpoint}`).toBe(401);
    }

    const postEndpoints = [
      { url: "/api/learning/mock-tests/mock-python-1/submit", body: { answers: {}, timeSpentSeconds: 10 } },
      { url: "/api/career/projects/submit", body: { projectId: "demo" } },
      { url: "/api/career/portfolio", body: { name: "Test", headline: "Test", bio: "Test" } },
      { url: "/api/career/applications", body: { role: "Backend Engineer", company: "Test" } },
    ];
    for (const item of postEndpoints) {
      const res = await request.post(item.url, { data: item.body });
      expect(res.status(), `POST ${item.url}`).toBe(401);
    }
  });

  test("logout confirmation banner renders cleanly without hardcoded demo passwords", async ({ page }) => {
    for (const route of ["/login?logged_out=true", "/sign-in?logged_out=true"]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect(page.getByText(/You have been logged out securely/i)).toBeVisible();
      const bodyText = await page.locator("body").innerText();
      expect(bodyText).not.toContain("password123");
      expect(bodyText).not.toContain("aarav@example.com");
    }
  });
});

