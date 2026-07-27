import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByLabel("Your name").fill("E2E Learner");
  await page
    .getByLabel("Email")
    .fill(`learner-${crypto.randomUUID()}@example.com`);
  await page.getByLabel("Password").fill("strong-password");
  const personalizedPlan = page.waitForResponse(
    (response) =>
      response.url().includes("/api/plans") &&
      response.request().method() === "POST",
  );
  await page.getByRole("button", { name: /Create my path/ }).click();
  await personalizedPlan;
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("renders a responsive SkillSprout shell without horizontal overflow", async ({
  page,
}, testInfo) => {
  await expect(page).toHaveTitle(/SkillSprout/);
  await expect(
    page.getByRole("link", { name: /SkillSprout/ }).first(),
  ).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);

  if (testInfo.project.name === "desktop") {
    await expect(page.locator("aside")).toBeVisible();
    await expect(page.locator("main > header")).toBeHidden();
  } else {
    await expect(page.locator("aside")).toBeHidden();
    await expect(page.locator("main > header")).toBeVisible();
    await expect(page.locator("nav.bottom")).toBeVisible();
  }
});

test("opens a lesson and records mastery", async ({ page }) => {
  await page.getByRole("button", { name: /Continue learning/ }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading")).toBeVisible();

  await dialog.getByRole("button", { name: /Mark as mastered/ }).click();
  await expect(page.getByRole("status")).toContainText("mastered");
  const celebration = page.getByRole("dialog", {
    name: /First sprout/,
  });
  await expect(celebration).toBeVisible();
  await expect(celebration).toContainText("+120 XP");
  await celebration.getByRole("button", { name: /Keep learning/ }).click();
  await expect(celebration).toBeHidden();
  await expect(
    page.getByRole("heading", { name: /Level 1 learner/ }),
  ).toBeVisible();
  await expect(page.getByText("120 XP", { exact: true })).toBeVisible();
});

test("generates a new path through the local API", async ({ page }) => {
  await page.getByRole("button", { name: /Reimagine path/ }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("My hobby").fill("Watercolor painting");
  await dialog
    .getByLabel("The real-life moment I want")
    .fill("Paint a small landscape for my desk");
  await dialog.getByRole("button", { name: /Distill my path/ }).click();

  await expect(page.getByRole("status")).toContainText("path is ready");
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    /watercolor|landscape/i,
  );
});
