import { Router } from "express";
import { createPlanSchema } from "../domain/plan.schema.js";
import type { PlanService } from "../services/plan-service.js";

export function createPlansRouter(planService: PlanService) {
  const router = Router();
  router.post("/", async (request, response) => {
    const input = createPlanSchema.parse(request.body);
    const plan = await planService.create(input);
    response.status(201).json(plan);
  });
  return router;
}
