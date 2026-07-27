import { Router, type Request } from "express";
import { loginSchema, registerSchema } from "../domain/auth.schema.js";
import type { AuthService } from "../services/auth-service.js";

const cookieName = "skillsprout_session";
const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1_000,
  path: "/",
};

function readCookie(request: Request) {
  const value = request.headers.cookie
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${cookieName}=`));
  return value ? decodeURIComponent(value.slice(cookieName.length + 1)) : null;
}

export function createAuthRouter(service: AuthService) {
  const router = Router();
  router.post("/register", async (request, response) => {
    const session = await service.register(registerSchema.parse(request.body));
    response.cookie(cookieName, session.token, cookieOptions);
    response.status(201).json({ user: session.user });
  });
  router.post("/login", async (request, response) => {
    const input = loginSchema.parse(request.body);
    const session = await service.login(input.email, input.password);
    response.cookie(cookieName, session.token, cookieOptions);
    response.json({ user: session.user });
  });
  router.post("/logout", (_request, response) => {
    response.clearCookie(cookieName, { path: "/" });
    response.status(204).send();
  });
  router.get("/me", async (request, response) => {
    const token = readCookie(request);
    if (!token) {
      response.json({ user: null });
      return;
    }
    try {
      response.json({ user: await service.readSession(token) });
    } catch {
      response.clearCookie(cookieName, { path: "/" });
      response.json({ user: null });
    }
  });
  return router;
}
