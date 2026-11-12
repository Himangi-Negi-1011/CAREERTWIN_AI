import { expect, test } from "@playwright/test";

test("home renders hero, login CTAs, 10-step lifecycle, FAQ, and omits Pip assistant", async ({ page }) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => pageErrors.push(err.message));

  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { level: 1 })).toContainText(/AI Career Co-pilot/i);
  await expect(page.getByRole("link", { name: /^Login$/i }).first()).toHaveAttribute("href", "/login");
  await expect(page.getByRole("link", { name: /^Start Free Learning$/i }).first()).toHaveAttribute("href", "/onboarding");

  // Pip assistant must NOT be rendered
  await expect(page.getByRole("button", { name: /open pip/i })).toHaveCount(0);
  await expect(page.getByText(/Pip · CareerTwin Guide/i)).toHaveCount(0);

  // Analyze drawer removed per specification
  await expect(page.locator("#analyzeView")).toHaveCount(0);

  // 10-step student lifecycle is visible
  await expect(page.getByText(/From Zero to Career-Ready in 10 Steps/i)).toBeVisible();
  await expect(page.getByText(/Step 01/i)).toBeVisible();
  await expect(page.getByText(/Step 10/i)).toBeVisible();

  // FAQ is rendered and expandable
  const firstFaq = page.getByRole("button", { name: /Is CareerTwin completely free to get started\?/i });
  await expect(firstFaq).toBeVisible();
  await firstFaq.click();
  await expect(page.getByText(/CareerTwin is 100% free to start/i)).toBeVisible();

  // Cookie Settings trigger exists in footer
  await expect(page.getByRole("button", { name: /Cookie Settings/i })).toBeVisible();

  const noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  expect(noOverflow).toBe(true);
  expect(pageErrors).toEqual([]);
  expect(consoleErrors.filter((e) => !e.includes("Clerk"))).toEqual([]);
});
