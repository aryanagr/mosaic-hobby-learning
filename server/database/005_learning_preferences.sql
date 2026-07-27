CREATE TABLE user_learning_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_hobby_id UUID NOT NULL REFERENCES user_hobbies(id) ON DELETE CASCADE,
  prefers_video BOOLEAN NOT NULL DEFAULT FALSE,
  prefers_article BOOLEAN NOT NULL DEFAULT FALSE,
  prefers_audio BOOLEAN NOT NULL DEFAULT FALSE,
  prefers_practice BOOLEAN NOT NULL DEFAULT FALSE,
  prefers_quiz BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (user_hobby_id)
);

ALTER TABLE user_resource_progress
  ADD COLUMN progress_percentage INTEGER NOT NULL DEFAULT 0
  CHECK (progress_percentage BETWEEN 0 AND 100);
