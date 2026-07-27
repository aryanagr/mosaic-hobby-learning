CREATE TABLE IF NOT EXISTS learning_plans (
  id UUID PRIMARY KEY,
  goal_hash CHAR(64) NOT NULL UNIQUE,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS learning_plans_expires_at_idx
  ON learning_plans (expires_at);
