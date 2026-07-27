import { createApp } from "./app.js";
import { config } from "./config.js";
import { FallbackPlanGenerator } from "./providers/fallback-plan-generator.js";
import { GroqPlanGenerator } from "./providers/groq-plan-generator.js";
import { MemoryPlanRepository } from "./repositories/memory-plan-repository.js";
import { PostgresLearningDomainRepository } from "./repositories/postgres-learning-domain-repository.js";
import { PostgresPlanRepository } from "./repositories/postgres-plan-repository.js";
import { LearningPathService } from "./services/learning-path-service.js";
import { PlanService } from "./services/plan-service.js";

export function bootstrap() {
  const fallbackGenerator = new FallbackPlanGenerator();
  const primaryGenerator = config.GROQ_API_KEY
    ? new GroqPlanGenerator(config.GROQ_API_KEY, config.GROQ_MODEL)
    : fallbackGenerator;
  const planRepository = config.DATABASE_URL
    ? new PostgresPlanRepository(config.DATABASE_URL, config.DATABASE_POOL_MAX)
    : new MemoryPlanRepository();
  const planService = new PlanService(
    primaryGenerator,
    fallbackGenerator,
    planRepository,
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
  return {
    app: createApp(planService, learningPathService),
    close: async () => {
      await Promise.all([
        planRepository.close(),
        learningDomainRepository?.close(),
      ]);
    },
  };
}
