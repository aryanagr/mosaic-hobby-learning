import { describe, expect, it, vi } from "vitest";
import type { PlanGenerator } from "../server/domain/plan-generator.js";
import { FallbackPlanGenerator } from "../server/providers/fallback-plan-generator.js";
import { MemoryPlanRepository } from "../server/repositories/memory-plan-repository.js";
import { PlanService } from "../server/services/plan-service.js";

const request = {
  hobby: "pottery",
  moment: "Make a breakfast bowl I use every morning",
  level: "new" as const,
  minutes: 45,
  avoid: "lectures",
};

describe("PlanService", () => {
  it("chooses media based on the hobby's learning modality", async () => {
    const generator = new FallbackPlanGenerator();
    const pottery = await generator.generate(request);
    const guitar = await generator.generate({ ...request, hobby: "guitar" });
    expect(pottery.techniques[0]?.medium).toBe("watch");
    expect(guitar.techniques[0]?.medium).toBe("listen");
  });
  it("coalesces concurrent requests for the same goal", async () => {
    const fallback = new FallbackPlanGenerator();
    const generate = vi.fn(() => fallback.generate(request));
    const generator: PlanGenerator = { source: "crafted-fallback", generate };
    const service = new PlanService(
      generator,
      fallback,
      new MemoryPlanRepository(),
      60_000,
    );

    const plans = await Promise.all(
      Array.from({ length: 20 }, () => service.create(request)),
    );

    expect(generate).toHaveBeenCalledTimes(1);
    expect(new Set(plans.map((plan) => plan.id)).size).toBe(1);
  });

  it("uses the fallback when the primary provider fails", async () => {
    const primary: PlanGenerator = {
      source: "groq",
      generate: vi.fn().mockRejectedValue(new Error("provider unavailable")),
    };
    const service = new PlanService(
      primary,
      new FallbackPlanGenerator(),
      new MemoryPlanRepository(),
      60_000,
    );

    const plan = await service.create(request);

    expect(plan.source).toBe("crafted-fallback");
    expect(plan.techniques).toHaveLength(6);
    expect(plan.techniques[0]?.status).toBe("active");
  });
});
