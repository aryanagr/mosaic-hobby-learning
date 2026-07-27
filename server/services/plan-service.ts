import { createHash, randomUUID } from "node:crypto";
import type { LearningPlan } from "../../shared/learning-plan.js";
import type { PlanGenerator } from "../domain/plan-generator.js";
import type { ValidCreatePlanRequest } from "../domain/plan.schema.js";
import type { PlanRepository } from "../repositories/plan-repository.js";

interface CacheEntry {
  expiresAt: number;
  plan: LearningPlan;
}

export class PlanService {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly pending = new Map<string, Promise<LearningPlan>>();

  constructor(
    private readonly primaryGenerator: PlanGenerator,
    private readonly fallbackGenerator: PlanGenerator,
    private readonly repository: PlanRepository,
    private readonly cacheTtlMs: number,
  ) {}

  async create(input: ValidCreatePlanRequest): Promise<LearningPlan> {
    const goalHash = this.hashInput(input);
    const cached = this.cache.get(goalHash);
    if (cached && cached.expiresAt > Date.now()) return cached.plan;

    const inFlight = this.pending.get(goalHash);
    if (inFlight) return inFlight;

    const operation = this.createUncached(goalHash, input).finally(() =>
      this.pending.delete(goalHash),
    );
    this.pending.set(goalHash, operation);
    return operation;
  }

  private async createUncached(
    goalHash: string,
    input: ValidCreatePlanRequest,
  ) {
    const stored = await this.repository.findByGoalHash(goalHash);
    if (stored) {
      this.cachePlan(goalHash, stored);
      return stored;
    }

    let generator = this.primaryGenerator;
    let generated;
    try {
      generated = await generator.generate(input);
    } catch {
      generator = this.fallbackGenerator;
      generated = await generator.generate(input);
    }

    const plan: LearningPlan = {
      ...generated,
      id: randomUUID(),
      hobby: input.hobby.replace(/\b\w/g, (letter) => letter.toUpperCase()),
      source: generator.source,
      techniques: generated.techniques.map((technique, index) => ({
        ...technique,
        id: index + 1,
        status: index === 0 ? "active" : "ready",
      })),
    };

    await this.repository.save(goalHash, plan);
    this.cachePlan(goalHash, plan);
    return plan;
  }

  private cachePlan(goalHash: string, plan: LearningPlan) {
    if (this.cache.size >= 1_000)
      this.cache.delete(this.cache.keys().next().value ?? "");
    this.cache.set(goalHash, { expiresAt: Date.now() + this.cacheTtlMs, plan });
  }

  private hashInput(input: ValidCreatePlanRequest) {
    const canonical = JSON.stringify({
      ...input,
      hobby: input.hobby.toLowerCase(),
      moment: input.moment.toLowerCase(),
    });
    return createHash("sha256").update(canonical).digest("hex");
  }
}
