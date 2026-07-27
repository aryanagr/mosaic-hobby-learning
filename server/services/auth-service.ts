import { randomUUID } from "node:crypto";
import { compare, hash } from "bcryptjs";
import { jwtVerify, SignJWT } from "jose";
import type { RegisterInput } from "../domain/auth.schema.js";
import type {
  AuthRepository,
  AuthUserRecord,
} from "../repositories/auth-repository.js";

export type PublicUser = Omit<AuthUserRecord, "passwordHash">;

export class AuthService {
  private readonly secret: Uint8Array;

  constructor(
    private readonly repository: AuthRepository,
    secret: string,
  ) {
    this.secret = new TextEncoder().encode(secret);
  }

  async register(input: RegisterInput) {
    const user: AuthUserRecord = {
      id: randomUUID(),
      name: input.name,
      email: input.email,
      passwordHash: await hash(input.password, 12),
      onboarding: input.onboarding,
    };
    try {
      await this.repository.create(user);
    } catch (error) {
      if ((error as { code?: string }).code === "23505")
        throw Object.assign(new Error("An account already uses this email."), {
          status: 409,
          code: "EMAIL_EXISTS",
        });
      throw error;
    }
    return this.createSession(user);
  }

  async login(email: string, password: string) {
    const user = await this.repository.findByEmail(email);
    if (!user || !(await compare(password, user.passwordHash)))
      throw Object.assign(new Error("Email or password is incorrect."), {
        status: 401,
        code: "INVALID_CREDENTIALS",
      });
    return this.createSession(user);
  }

  async readSession(token: string) {
    const { payload } = await jwtVerify(token, this.secret, {
      issuer: "skillsprout",
      audience: "skillsprout-web",
    });
    return payload.user as PublicUser;
  }

  private async createSession(user: AuthUserRecord) {
    const { passwordHash: _passwordHash, ...publicUser } = user;
    const token = await new SignJWT({ user: publicUser })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuer("skillsprout")
      .setAudience("skillsprout-web")
      .setSubject(user.id)
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(this.secret);
    return { token, user: publicUser };
  }
}
