import type { Pool } from "pg";
import type { OnboardingProfile } from "../domain/auth.schema.js";
import type { AuthRepository, AuthUserRecord } from "./auth-repository.js";

interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  onboarding_profile: OnboardingProfile;
}

export class PostgresAuthRepository implements AuthRepository {
  constructor(private readonly pool: Pool) {}

  async findByEmail(email: string) {
    const result = await this.pool.query<UserRow>(
      "SELECT id,name,email,password_hash,onboarding_profile FROM users WHERE email=$1",
      [email],
    );
    const user = result.rows[0];
    return user
      ? {
          id: user.id,
          name: user.name,
          email: user.email,
          passwordHash: user.password_hash,
          onboarding: user.onboarding_profile,
        }
      : null;
  }

  async create(user: AuthUserRecord) {
    await this.pool.query(
      "INSERT INTO users(id,name,email,password_hash,onboarding_profile) VALUES($1,$2,$3,$4,$5)",
      [user.id, user.name, user.email, user.passwordHash, user.onboarding],
    );
  }

  async close() {
    return Promise.resolve();
  }
}
