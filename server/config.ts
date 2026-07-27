import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(8787),
  DATABASE_URL: z.string().url().optional(),
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(20).default(5),
  DATABASE_SSL: z
    .enum(["require", "disable"])
    .default(process.env.NODE_ENV === "production" ? "require" : "disable"),
  GROQ_API_KEY: z.string().min(1).optional(),
  GROQ_MODEL: z.string().default("llama-3.1-8b-instant"),
  PLAN_CACHE_TTL_MS: z.coerce.number().int().positive().default(300_000),
});

export type AppConfig = z.infer<typeof environmentSchema>;
export const config = environmentSchema.parse(process.env);
