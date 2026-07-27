import { describe, expect, it } from "vitest";
import { seedPlan } from "../src/domain/seed-plan.js";
import {
  learningPlanReducer,
  replacePlan,
  restoreSeedPlan,
  updateTechniqueStatus,
} from "../src/store/learning-plan-slice.js";

describe("learningPlanSlice", () => {
  it("updates one technique without mutating the previous state", () => {
    const previous = { plan: seedPlan };
    const next = learningPlanReducer(
      previous,
      updateTechniqueStatus({ id: 2, status: "done" }),
    );
    expect(next.plan.techniques[1]?.status).toBe("done");
    expect(previous.plan.techniques[1]?.status).toBe("active");
  });

  it("replaces and restores the complete plan aggregate", () => {
    const replacement = {
      ...seedPlan,
      id: "replacement",
      title: "A new outcome",
    };
    const replaced = learningPlanReducer(undefined, replacePlan(replacement));
    expect(replaced.plan.id).toBe("replacement");
    expect(learningPlanReducer(replaced, restoreSeedPlan()).plan.id).toBe(
      seedPlan.id,
    );
  });
});
