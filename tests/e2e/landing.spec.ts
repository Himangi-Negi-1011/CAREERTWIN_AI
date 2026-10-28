import { expect, test } from "@playwright/test";

test("landing page presents the product and reaches sign-up", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /your career.*your potential.*your ai twin/i })).toBeVisible();
  await page.getByRole("link", { name: /build my career twin/i }).first().click();
  await expect(page).toHaveURL(/\/sign-up/);
});

test("Pip opens, answers a supported question, and minimizes", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /open pip/i }).click();
  await expect(page.getByRole("button", { name: /minimize pip/i })).toBeVisible();
  await page.getByRole("button", { name: /is this an ai score/i }).click();
  await expect(page.getByText(/generative ai advice is not enabled/i)).toBeVisible();
  await page.getByRole("button", { name: /minimize pip/i }).click();
  await expect(page.getByRole("button", { name: /open pip/i })).toBeVisible();
});
