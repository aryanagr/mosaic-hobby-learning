import { createApp } from "./app.js";
import { config } from "./config.js";
import { createDatabasePool } from "./database/pool.js";
import { FallbackPlanGenerator } from "./providers/fallback-plan-generator.js";
import { GroqPlanGenerator } from "./providers/groq-plan-generator.js";
import { MemoryPlanRepository } from "./repositories/memory-plan-repository.js";
import { PostgresLearningDomainRepository } from "./repositories/postgres-learning-domain-repository.js";
import { PostgresPlanRepository } from "./repositories/postgres-plan-repository.js";
import { LearningPathService } from "./services/learning-path-service.js";
import { PlanService } from "./services/plan-service.js";
import { AuthService } from "./services/auth-service.js";
import { MemoryAuthRepository } from "./repositories/memory-auth-repository.js";
import { PostgresAuthRepository } from "./repositories/postgres-auth-repository.js";

export function bootstrap() {
  const databasePool = createDatabasePool(config);
  const authRepository = databasePool
    ? new PostgresAuthRepository(databasePool)
    : new MemoryAuthRepository();
  const authService = new AuthService(authRepository, config.AUTH_SECRET);
  const fallbackGenerator = new FallbackPlanGenerator();
  const primaryGenerator = config.GROQ_API_KEY
    ? new GroqPlanGenerator(config.GROQ_API_KEY, config.GROQ_MODEL)
    : fallbackGenerator;
  const planRepository = databasePool
    ? new PostgresPlanRepository(databasePool)
    : new MemoryPlanRepository();
  const planService = new PlanService(
    primaryGenerator,
    fallbackGenerator,
    planRepository,
    config.PLAN_CACHE_TTL_MS,
  );
  const learningDomainRepository = databasePool
    ? new PostgresLearningDomainRepository(databasePool)
    : null;
  const learningPathService = learningDomainRepository
    ? new LearningPathService(learningDomainRepository)
    : undefined;
  return {
    app: createApp(
      planService,
      learningPathService,
      async () => {
        if (!databasePool) return { configured: false, reachable: false };
        await databasePool.query("SELECT 1");
        return { configured: true, reachable: true };
      },
      authService,
    ),
    close: async () => {
      await Promise.all([
        planRepository.close(),
        learningDomainRepository?.close(),
        databasePool?.end(),
        authRepository.close(),
      ]);
    },
  };
}
