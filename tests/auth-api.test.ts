import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../server/app.js";
import { FallbackPlanGenerator } from "../server/providers/fallback-plan-generator.js";
import { MemoryAuthRepository } from "../server/repositories/memory-auth-repository.js";
import { MemoryPlanRepository } from "../server/repositories/memory-plan-repository.js";
import { AuthService } from "../server/services/auth-service.js";
import { PlanService } from "../server/services/plan-service.js";

const generator = new FallbackPlanGenerator();
const auth = new AuthService(
  new MemoryAuthRepository(),
  "test-auth-secret-with-more-than-32-characters",
);
const app = createApp(
  new PlanService(generator, generator, new MemoryPlanRepository(), 60_000),
  undefined,
  undefined,
  auth,
);

const registration = {
  name: "Asha Learner",
  email: "asha@example.com",
  password: "strong-password",
  onboarding: {
    hobby: "Watercolor",
    experience: "new",
    goal: "Paint a landscape for my desk",
    weeklyMinutes: 45,
    preferredFormat: "practice",
  },
};

describe("authentication API", () => {
  it("registers a personalized user and restores the cookie session", async () => {
    const agent = request.agent(app);
    const registered = await agent
      .post("/api/auth/register")
      .send(registration);
    expect(registered.status).toBe(201);
    expect(registered.body.user).not.toHaveProperty("passwordHash");
    expect(registered.body.user.onboarding.hobby).toBe("Watercolor");

    const current = await agent.get("/api/auth/me");
    expect(current.status).toBe(200);
    expect(current.body.user.email).toBe(registration.email);
  });

  it("signs in with a password and rejects invalid credentials", async () => {
    const signedIn = await request(app).post("/api/auth/login").send({
      email: registration.email,
      password: registration.password,
    });
    expect(signedIn.status).toBe(200);
    expect(signedIn.headers["set-cookie"]).toBeDefined();

    const rejected = await request(app).post("/api/auth/login").send({
      email: registration.email,
      password: "incorrect-password",
    });
    expect(rejected.status).toBe(401);
  });
});
