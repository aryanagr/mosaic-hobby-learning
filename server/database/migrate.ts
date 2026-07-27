import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool, type PoolClient } from "pg";
import { config } from "../config.js";

if (!config.DATABASE_URL)
  throw new Error("DATABASE_URL is required to run migrations");
const migrationDirectory = dirname(fileURLToPath(import.meta.url));
const pool = new Pool({
  connectionString: config.DATABASE_URL,
  max: 1,
  ssl:
    config.DATABASE_SSL === "require"
      ? { rejectUnauthorized: false }
      : undefined,
});

async function applyMigration(client: PoolClient, filename: string) {
  const alreadyApplied = await client.query(
    "SELECT 1 FROM schema_migrations WHERE filename = $1",
    [filename],
  );
  if (alreadyApplied.rowCount) return false;
  const sql = await readFile(join(migrationDirectory, filename), "utf8");
  await client.query("BEGIN");
  try {
    await client.query(sql);
    await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [
      filename,
    ]);
    await client.query("COMMIT");
    return true;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}

const client = await pool.connect();
try {
  await client.query(
    "CREATE TABLE IF NOT EXISTS schema_migrations (filename TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())",
  );
  const files = (await readdir(migrationDirectory))
    .filter((file) => /^\d+.*\.sql$/.test(file))
    .sort();
  for (const file of files)
    if (await applyMigration(client, file))
      process.stdout.write(`Applied ${file}\n`);
} finally {
  client.release();
  await pool.end();
}
