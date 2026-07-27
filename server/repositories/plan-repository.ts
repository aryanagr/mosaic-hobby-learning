import type { LearningPlan } from "../../shared/learning-plan.js";

export interface PlanRepository {
  findByGoalHash(goalHash: string): Promise<LearningPlan | null>;
  save(goalHash: string, plan: LearningPlan): Promise<void>;
  close(): Promise<void>;
}
