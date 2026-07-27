import { describe, expect, it } from "vitest";
import type { Technique } from "../shared/learning-plan.js";
import {
  calculateGamification,
  findNewAchievement,
} from "../src/features/gamification/gamification.js";

const techniques = (done: number, total = 6): Technique[] =>
  Array.from({ length: total }, (_, index) => ({
    id: index,
    eyebrow: "Step",
    title: `Technique ${index}`,
    description: "Description",
    duration: 10,
    medium: "practice",
    status: index < done ? "done" : "ready",
    why: "Useful",
  }));

describe("gamification milestones", () => {
  it("awards XP and unlocks milestones at one and three techniques", () => {
    expect(
      calculateGamification(techniques(1)).unlocked.map((item) => item.id),
    ).toEqual(["first-sprout"]);
    const progress = calculateGamification(techniques(3));
    expect(progress.xp).toBe(360);
    expect(progress.level).toBe(2);
    expect(progress.unlocked.map((item) => item.id)).toEqual([
      "first-sprout",
      "momentum",
    ]);
  });

  it("adds a completion bonus and identifies the newly earned award", () => {
    const before = calculateGamification(techniques(5));
    const after = calculateGamification(techniques(6));
    expect(after.xp).toBe(1_020);
    expect(findNewAchievement(before, after)?.id).toBe("path-in-bloom");
  });

  it("does not count skipped techniques in the path total", () => {
    const path = techniques(5);
    path[5]!.status = "skipped";
    expect(calculateGamification(path).unlocked.at(-1)?.id).toBe(
      "path-in-bloom",
    );
  });
});
