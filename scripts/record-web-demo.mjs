import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const outputDirectory = path.resolve("demo-videos/raw-web");
await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  recordVideo: { dir: outputDirectory, size: { width: 1440, height: 900 } },
});
const page = await context.newPage();
const pause = (milliseconds) => page.waitForTimeout(milliseconds);

try {
  await page.goto("https://mosaic-hobby-learning.vercel.app", {
    waitUntil: "networkidle",
  });
  await pause(1800);

  const email = `skillsprout-demo-${Date.now()}@example.com`;
  await page.getByLabel("Your name").fill("Alex Morgan");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("SkillSprout-Demo-2026");
  await page.getByLabel("What hobby do you want to grow?").fill("Photography");
  await page
    .getByLabel("What moment do you want to unlock?")
    .fill("Take memorable portraits of my family");
  await page.getByLabel("Minutes per week").fill("90");
  await pause(1000);
  await page.getByRole("button", { name: /Create my path/ }).click();
  await page.getByRole("heading", { level: 1 }).waitFor({ timeout: 30_000 });
  await pause(2200);

  await page.getByRole("button", { name: /Continue learning/ }).click();
  const lesson = page.getByRole("dialog");
  await lesson.waitFor();
  await pause(1800);
  await lesson.getByRole("button", { name: /Mark as mastered/ }).click();
  const reward = page.getByRole("dialog", { name: /First sprout/ });
  await reward.waitFor();
  await pause(2600);
  await reward.getByRole("button", { name: /Keep learning/ }).click();
  await pause(1400);

  await page.locator("#path").scrollIntoViewIfNeeded();
  await pause(2200);
} finally {
  await context.close();
  await browser.close();
}

