import { describe, expect, it } from "vitest";
import type { Technique } from "../src/domain/models";
import { calculateProgress } from "../src/domain/gamification";

const techniques = (done: number): Technique[] =>
  Array.from({ length: 6 }, (_, index) => ({
    id: index,
    eyebrow: "Step",
    title: `Technique ${index}`,
    description: "Description",
    duration: 10,
    medium: "practice",
    status: index < done ? "done" : "ready",
    why: "Useful",
  }));

describe("mobile gamification", () => {
  it("calculates XP, levels, and progress", () => {
    const result = calculateProgress(techniques(3));
    expect(result.percentage).toBe(50);
    expect(result.xp).toBe(360);
    expect(result.level).toBe(2);
    expect(result.unlocked.map((item) => item.id)).toEqual([
      "first",
      "momentum",
    ]);
  });

  it("awards the completion bonus", () => {
    expect(calculateProgress(techniques(6)).xp).toBe(1_020);
  });
});
