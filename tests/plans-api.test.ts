import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../server/app.js";
import { FallbackPlanGenerator } from "../server/providers/fallback-plan-generator.js";
import { MemoryPlanRepository } from "../server/repositories/memory-plan-repository.js";
import { PlanService } from "../server/services/plan-service.js";

const generator = new FallbackPlanGenerator();
const app = createApp(
  new PlanService(generator, generator, new MemoryPlanRepository(), 60_000),
);

describe("POST /api/plans", () => {
  it("creates a validated learning plan", async () => {
    const response = await request(app).post("/api/plans").send({
      hobby: "chess",
      moment: "Hold my own in the office chess night",
      level: "some",
      minutes: 60,
    });
    expect(response.status).toBe(201);
    expect(response.body.techniques).toHaveLength(6);
    expect(response.body.source).toBe("crafted-fallback");
  });

  it("rejects invalid requests with a stable error contract", async () => {
    const response = await request(app).post("/api/plans").send({ hobby: "x" });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_REQUEST");
  });
});
