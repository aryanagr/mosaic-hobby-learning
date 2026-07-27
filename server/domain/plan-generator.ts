import type { GeneratedPlan, ValidCreatePlanRequest } from "./plan.schema.js";

export interface PlanGenerator {
  readonly source: "groq" | "crafted-fallback";
  generate(input: ValidCreatePlanRequest): Promise<GeneratedPlan>;
}
