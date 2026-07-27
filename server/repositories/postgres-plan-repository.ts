import type { Pool } from "pg";
import type { LearningPlan } from "../../shared/learning-plan.js";
import type { PlanRepository } from "./plan-repository.js";

interface PlanRow {
  payload: LearningPlan;
}

export class PostgresPlanRepository implements PlanRepository {
  private readonly pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async findByGoalHash(goalHash: string) {
    const result = await this.pool.query<PlanRow>(
      "SELECT payload FROM learning_plans WHERE goal_hash = $1 AND expires_at > NOW()",
      [goalHash],
    );
    return result.rows[0]?.payload ?? null;
  }

  async save(goalHash: string, plan: LearningPlan) {
    await this.pool.query(
      `INSERT INTO learning_plans (id, goal_hash, payload, expires_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '24 hours')
       ON CONFLICT (goal_hash) DO UPDATE
       SET payload = EXCLUDED.payload, expires_at = EXCLUDED.expires_at, updated_at = NOW()`,
      [plan.id, goalHash, plan],
    );
  }

  async close() {
    return Promise.resolve();
  }
}
