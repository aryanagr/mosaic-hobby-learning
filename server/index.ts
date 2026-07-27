import { createApp } from "./app.js";
import { config } from "./config.js";
import { FallbackPlanGenerator } from "./providers/fallback-plan-generator.js";
import { GroqPlanGenerator } from "./providers/groq-plan-generator.js";
import { MemoryPlanRepository } from "./repositories/memory-plan-repository.js";
import { PostgresPlanRepository } from "./repositories/postgres-plan-repository.js";
import { PostgresLearningDomainRepository } from "./repositories/postgres-learning-domain-repository.js";
import { PlanService } from "./services/plan-service.js";
import { LearningPathService } from "./services/learning-path-service.js";

const fallbackGenerator = new FallbackPlanGenerator();
const primaryGenerator = config.GROQ_API_KEY
  ? new GroqPlanGenerator(config.GROQ_API_KEY, config.GROQ_MODEL)
  : fallbackGenerator;
const repository = config.DATABASE_URL
  ? new PostgresPlanRepository(config.DATABASE_URL, config.DATABASE_POOL_MAX)
  : new MemoryPlanRepository();
const planService = new PlanService(
  primaryGenerator,
  fallbackGenerator,
  repository,
  config.PLAN_CACHE_TTL_MS,
);
const learningDomainRepository = config.DATABASE_URL
  ? new PostgresLearningDomainRepository(
      config.DATABASE_URL,
      config.DATABASE_POOL_MAX,
    )
  : null;
const learningPathService = learningDomainRepository
  ? new LearningPathService(learningDomainRepository)
  : undefined;
const app = createApp(planService, learningPathService);
const server = app.listen(config.PORT, "0.0.0.0");

const shutdown = () => {
  server.close(async () => {
    await repository.close();
    await learningDomainRepository?.close();
    process.exit(0);
  });
};
process.once("SIGTERM", shutdown);
process.once("SIGINT", shutdown);
