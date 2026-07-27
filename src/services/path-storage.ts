import type { LearningPlan } from "../../shared/learning-plan";

const storageKey = "mosaic-plan-v3";

export function readPlan(fallback: LearningPlan) {
  try {
    const stored = localStorage.getItem(storageKey);
    return stored ? (JSON.parse(stored) as LearningPlan) : fallback;
  } catch {
    return fallback;
  }
}

export function writePlan(plan: LearningPlan) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(plan));
  } catch {
    /* Storage can be unavailable in private browsing. */
  }
}
