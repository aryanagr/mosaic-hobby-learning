import { expect, test } from "@playwright/test";

test("signs up with personalized answers, signs out, and signs back in", async ({
  page,
}) => {
  const email = `auth-${crypto.randomUUID()}@example.com`;
  await page.goto("/");
  await page.getByLabel("Your name").fill("Priya Sharma");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("strong-password");
  await page.getByLabel("What hobby do you want to grow?").fill("Photography");
  await page
    .getByLabel("What moment do you want to unlock?")
    .fill("Take memorable portraits of my family");
  await page.getByLabel("Minutes per week").fill("90");
  await page.getByRole("button", { name: /Create my path/ }).click();

  await expect(page.locator(".auth-page")).toBeHidden();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    /photography|portraits/i,
  );
  const compact = (page.viewportSize()?.width ?? 0) <= 900;
  if (compact) await page.getByRole("button", { name: "Sign out" }).click();
  else await page.getByTitle("Sign out").click();
  await page.getByRole("tab", { name: "Sign in" }).click();
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("strong-password");
  await page.getByRole("button", { name: /Sign in →/ }).click();
  await expect(page.locator(".auth-page")).toBeHidden();
  if (!compact) await expect(page.getByText("Priya Sharma")).toBeVisible();
});
