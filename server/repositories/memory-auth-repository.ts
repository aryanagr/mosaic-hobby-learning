import type { AuthRepository, AuthUserRecord } from "./auth-repository.js";

export class MemoryAuthRepository implements AuthRepository {
  private readonly users = new Map<string, AuthUserRecord>();

  async findByEmail(email: string) {
    return this.users.get(email) ?? null;
  }

  async create(user: AuthUserRecord) {
    if (this.users.has(user.email))
      throw Object.assign(new Error("Email already registered"), {
        code: "23505",
      });
    this.users.set(user.email, user);
  }

  async close() {
    return Promise.resolve();
  }
}
