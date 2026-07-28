import type { LearningPlan, OnboardingProfile, User } from "../domain/models";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "https://mosaic-hobby-learning.vercel.app";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "content-type": "application/json" },
    ...init,
  });
  const body = (await response.json().catch(() => null)) as
    T | { error?: { message?: string } } | null;
  if (!response.ok) {
    const error = body as { error?: { message?: string } } | null;
    throw new Error(error?.error?.message ?? "Could not complete the request.");
  }
  return body as T;
}

export async function restoreSession() {
  return (await request<{ user: User | null }>("/api/auth/me")).user;
}

export async function register(input: {
  name: string;
  email: string;
  password: string;
  onboarding: OnboardingProfile;
}) {
  return (
    await request<{ user: User }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    })
  ).user;
}

export async function login(email: string, password: string) {
  return (
    await request<{ user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  ).user;
}

export async function logout() {
  await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}

export async function generatePlan(profile: OnboardingProfile) {
  return request<LearningPlan>("/api/plans", {
    method: "POST",
    body: JSON.stringify({
      hobby: profile.hobby,
      moment: profile.goal,
      level: profile.experience,
      minutes: profile.weeklyMinutes,
      avoid: `Prefer ${profile.preferredFormat} content`,
    }),
  });
}
