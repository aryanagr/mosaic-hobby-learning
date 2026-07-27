import { Pool } from "pg";
import type { AppConfig } from "../config.js";

export function createDatabasePool(config: AppConfig) {
  if (!config.DATABASE_URL) return null;

  return new Pool({
    connectionString: config.DATABASE_URL,
    max: config.DATABASE_POOL_MAX,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 3_000,
    maxUses: 7_500,
    allowExitOnIdle: true,
    ssl:
      config.DATABASE_SSL === "require"
        ? { rejectUnauthorized: false }
        : undefined,
  });
}
