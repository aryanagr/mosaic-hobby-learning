CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE resource_type AS ENUM ('video', 'article', 'audio', 'exercise', 'quiz');
CREATE TYPE user_hobby_status AS ENUM ('active', 'paused', 'completed', 'abandoned');
CREATE TYPE technique_progress_status AS ENUM ('not_started', 'in_progress', 'completed', 'skipped', 'difficult');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  profile_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE hobbies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(120) UNIQUE NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  category VARCHAR(100),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE hobby_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hobby_id UUID NOT NULL REFERENCES hobbies(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  level_order INTEGER NOT NULL CHECK (level_order > 0),
  description TEXT,
  UNIQUE (hobby_id, name),
  UNIQUE (hobby_id, level_order)
);

CREATE TABLE techniques (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hobby_id UUID NOT NULL REFERENCES hobbies(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(220) NOT NULL,
  description TEXT,
  difficulty_level INTEGER NOT NULL CHECK (difficulty_level BETWEEN 1 AND 5),
  estimated_minutes INTEGER NOT NULL CHECK (estimated_minutes > 0),
  popularity_score NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (popularity_score BETWEEN 0 AND 100),
  average_rating NUMERIC(3,2) NOT NULL DEFAULT 0 CHECK (average_rating BETWEEN 0 AND 5),
  thumbnail_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (hobby_id, slug)
);

CREATE TABLE technique_levels (
  technique_id UUID NOT NULL REFERENCES techniques(id) ON DELETE CASCADE,
  level_id UUID NOT NULL REFERENCES hobby_levels(id) ON DELETE CASCADE,
  PRIMARY KEY (technique_id, level_id)
);

CREATE TABLE technique_prerequisites (
  technique_id UUID NOT NULL REFERENCES techniques(id) ON DELETE CASCADE,
  prerequisite_technique_id UUID NOT NULL REFERENCES techniques(id) ON DELETE CASCADE,
  PRIMARY KEY (technique_id, prerequisite_technique_id),
  CHECK (technique_id <> prerequisite_technique_id)
);

CREATE TABLE learning_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  technique_id UUID NOT NULL REFERENCES techniques(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  resource_type resource_type NOT NULL,
  resource_url TEXT,
  content TEXT,
  duration_minutes INTEGER CHECK (duration_minutes > 0),
  source_name VARCHAR(150),
  display_order INTEGER NOT NULL DEFAULT 1 CHECK (display_order > 0),
  is_free BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (resource_url IS NOT NULL OR content IS NOT NULL)
);

CREATE TABLE user_hobbies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hobby_id UUID NOT NULL REFERENCES hobbies(id) ON DELETE CASCADE,
  current_level_id UUID REFERENCES hobby_levels(id) ON DELETE SET NULL,
  target_level_id UUID REFERENCES hobby_levels(id) ON DELETE SET NULL,
  weekly_minutes INTEGER CHECK (weekly_minutes BETWEEN 10 AND 10080),
  preferred_resource_types resource_type[] NOT NULL DEFAULT '{}',
  status user_hobby_status NOT NULL DEFAULT 'active',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE (user_id, hobby_id)
);

CREATE TABLE learning_paths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_hobby_id UUID NOT NULL REFERENCES user_hobbies(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  is_generated BOOLEAN NOT NULL DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE learning_path_techniques (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  learning_path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
  technique_id UUID NOT NULL REFERENCES techniques(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK (position > 0),
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (learning_path_id, technique_id),
  UNIQUE (learning_path_id, position)
);

CREATE TABLE user_technique_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  learning_path_technique_id UUID NOT NULL REFERENCES learning_path_techniques(id) ON DELETE CASCADE,
  status technique_progress_status NOT NULL DEFAULT 'not_started',
  progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  personal_notes TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, learning_path_technique_id)
);

CREATE TABLE user_resource_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES learning_resources(id) ON DELETE CASCADE,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  watched_seconds INTEGER NOT NULL DEFAULT 0 CHECK (watched_seconds >= 0),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, resource_id)
);

CREATE TABLE practice_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  technique_id UUID NOT NULL REFERENCES techniques(id) ON DELETE CASCADE,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  notes TEXT,
  confidence_score INTEGER CHECK (confidence_score BETWEEN 1 AND 5),
  practised_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE technique_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  technique_id UUID NOT NULL REFERENCES techniques(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 5),
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, technique_id)
);

CREATE INDEX idx_techniques_hobby ON techniques(hobby_id) WHERE is_active = TRUE;
CREATE INDEX idx_resources_technique ON learning_resources(technique_id, display_order);
CREATE INDEX idx_user_hobbies_user ON user_hobbies(user_id);
CREATE INDEX idx_learning_paths_user_hobby ON learning_paths(user_hobby_id) WHERE is_active = TRUE;
CREATE INDEX idx_path_techniques_path_position ON learning_path_techniques(learning_path_id, position);
CREATE INDEX idx_user_progress_user ON user_technique_progress(user_id);
CREATE INDEX idx_user_progress_status ON user_technique_progress(user_id, status);
CREATE INDEX idx_practice_logs_user_date ON practice_logs(user_id, practised_at DESC);
