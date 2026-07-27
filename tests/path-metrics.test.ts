import { describe, expect, it } from "vitest";
import type { Technique } from "../shared/learning-plan.js";
import { calculatePathMetrics } from "../src/features/learning-path/path-metrics.js";

const technique = (id: number, status: Technique["status"]): Technique => ({
  id,
  status,
  eyebrow: "Test",
  title: "Test technique",
  description: "A test technique description.",
  duration: 10,
  medium: "practice",
  why: "This exists to test progress calculations.",
});

describe("calculatePathMetrics", () => {
  it("removes skipped techniques from the progress denominator", () => {
    const metrics = calculatePathMetrics([
      technique(1, "done"),
      technique(2, "ready"),
      technique(3, "skipped"),
    ]);
    expect(metrics.progress).toBe(50);
    expect(metrics.skipped).toBe(1);
  });
  it("does not divide by zero when every technique is skipped", () => {
    expect(calculatePathMetrics([technique(1, "skipped")]).progress).toBe(0);
  });
});
