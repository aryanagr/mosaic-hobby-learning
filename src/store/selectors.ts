import { createSelector } from "@reduxjs/toolkit";
import { calculatePathMetrics } from "../features/learning-path/path-metrics";
import type { RootState } from "./store";

export const selectPlan = (state: RootState) => state.learningPlan.plan;
export const selectPathMetrics = createSelector([selectPlan], (plan) =>
  calculatePathMetrics(plan.techniques),
);
export const selectActiveTechnique = createSelector(
  [selectPlan, selectPathMetrics],
  (plan, metrics) =>
    plan.techniques.find((technique) => technique.status === "active") ??
    metrics.visible[0],
);
