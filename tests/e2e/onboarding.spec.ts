import { expect, test } from "@playwright/test";

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "laptop", width: 1366, height: 768 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
];

for (const viewport of viewports) {
  test(`seven-step profile wizard is usable at ${viewport.name}`, async ({ page }) => {
    const browserErrors: string[] = [];
    page.on("console", (message) => {
      const text = message.text();
      const knownDevelopmentWarning =
        text.includes("Clerk has been loaded with development keys") ||
        text === "No available adapters." ||
        text.includes("was preloaded using link preload");
      if (message.type() === "error" || (message.type() === "warning" && !knownDevelopmentWarning)) browserErrors.push(text);
    });
    page.on("pageerror", (error) => browserErrors.push(error.message));

    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/onboarding");

    await expect(page.getByRole("heading", { name: "Personal Profile" })).toBeVisible();
    await expect(page.getByText("STEP 1 OF 7", { exact: true })).toBeVisible();
    await expect(page.getByRole("navigation", { name: /profile setup steps/i })).toBeVisible();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);

    await page.getByLabel(/full name/i).fill("Alex Rivera");
    await page.getByLabel(/current status/i).selectOption("student");
    const continueButton = page.getByRole("button", { name: /continue/i });
    await expect(continueButton).toBeEnabled();
    await continueButton.click();
    await expect(page.getByRole("heading", { name: "Education" })).toBeVisible();
    await expect(page.getByText("STEP 2 OF 7", { exact: true })).toBeVisible();
    expect(browserErrors).toEqual([]);
  });
}

test("custom target role autosaves without losing form state", async ({ page }) => {
  await page.goto("/onboarding");
  await page.getByRole("button", { name: /6\. career interests/i }).click();
  const input = page.getByLabel(/target job role/i);
  await input.fill("Product Security Engineer");
  await expect(input).toHaveValue("Product Security Engineer");
  await page.reload();
  await expect(page.getByRole("heading", { name: "Career Interests" })).toBeVisible();
  await expect(page.getByLabel(/target job role/i)).toHaveValue("Product Security Engineer");
});
