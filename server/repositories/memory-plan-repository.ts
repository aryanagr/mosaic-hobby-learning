import type { LearningPlan } from "../../shared/learning-plan.js";
import type { PlanRepository } from "./plan-repository.js";

export class MemoryPlanRepository implements PlanRepository {
  private readonly plans = new Map<string, LearningPlan>();

  async findByGoalHash(goalHash: string) {
    return this.plans.get(goalHash) ?? null;
  }

  async save(goalHash: string, plan: LearningPlan) {
    this.plans.set(goalHash, plan);
  }

  async close() {}
}
