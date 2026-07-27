import type { OnboardingProfile } from "../domain/auth.schema.js";

export interface AuthUserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  onboarding: OnboardingProfile;
}

export interface AuthRepository {
  findByEmail(email: string): Promise<AuthUserRecord | null>;
  create(user: AuthUserRecord): Promise<void>;
  close(): Promise<void>;
}
