ALTER TABLE users
ADD COLUMN onboarding_profile JSONB NOT NULL DEFAULT '{}'::jsonb;
