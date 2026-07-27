import compression from "compression";
import cors from "cors";
import express from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import type { PlanService } from "./services/plan-service.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { createPlansRouter } from "./routes/plans.routes.js";
import { createLearningDomainRouter } from "./routes/learning-domain.routes.js";
import type { LearningPathService } from "./services/learning-path-service.js";
import type { AuthService } from "./services/auth-service.js";
import { createAuthRouter } from "./routes/auth.routes.js";

export function createApp(
  planService: PlanService,
  learningPathService?: LearningPathService,
  checkDatabase?: () => Promise<{
    configured: boolean;
    reachable: boolean;
  }>,
  authService?: AuthService,
) {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(compression());
  app.use(cors({ origin: /^http:\/\/(localhost|127\.0\.0\.1):\d+$/ }));
  app.use(express.json({ limit: "20kb" }));
  app.use(pinoHttp({ autoLogging: process.env.NODE_ENV !== "test" }));
  app.use(
    "/api",
    rateLimit({
      windowMs: 60_000,
      limit: 120,
      standardHeaders: "draft-8",
      legacyHeaders: false,
    }),
  );
  app.get("/api/health", async (_request, response) => {
    try {
      const database = (await checkDatabase?.()) ?? {
        configured: false,
        reachable: false,
      };
      response.json({ status: "ok", database });
    } catch {
      response.status(503).json({
        status: "degraded",
        database: { configured: true, reachable: false },
      });
    }
  });
  if (authService) app.use("/api/auth", createAuthRouter(authService));
  app.use("/api/plans", createPlansRouter(planService));
  if (learningPathService)
    app.use("/api", createLearningDomainRouter(learningPathService));
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
