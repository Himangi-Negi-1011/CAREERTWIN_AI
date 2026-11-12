import { expect, test } from "@playwright/test";

test("home renders hero, login CTAs, analyzer drawer, and omits Pip assistant", async ({ page }) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => pageErrors.push(err.message));

  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { level: 1 })).toContainText(/AI Career Co-pilot/i);
  await expect(page.getByRole("link", { name: /^Login$/i }).first()).toHaveAttribute("href", "/login");
  await expect(page.getByRole("link", { name: /^Get Started$/i }).first()).toHaveAttribute("href", "/login");

  // Phase 12 requirement: floating Pip box removed from public landing page
  await expect(page.getByRole("button", { name: /open pip/i })).toHaveCount(0);
  await expect(page.getByText(/Pip · CareerTwin Guide/i)).toHaveCount(0);

  // Primary hero analyzer drawer still opens
  await page.getByRole("button", { name: /Analyze My Career/i }).click();
  await expect(page.getByRole("heading", { name: /best-fit career/i })).toBeVisible();

  const noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  expect(noOverflow).toBe(true);
  expect(pageErrors).toEqual([]);
  expect(consoleErrors.filter((e) => !e.includes("Clerk"))).toEqual([]);
});
