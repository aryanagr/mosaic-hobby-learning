export interface OnboardingProfile {
  hobby: string;
  experience: "new" | "some" | "returning";
  goal: string;
  weeklyMinutes: number;
  preferredFormat: "watch" | "read" | "practice" | "listen";
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  onboarding: OnboardingProfile;
}

async function authRequest(path: string, init?: RequestInit) {
  const response = await fetch(`/api/auth${path}`, {
    credentials: "include",
    headers: { "content-type": "application/json" },
    ...init,
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    throw new Error(body?.error?.message ?? "Authentication failed.");
  }
  return response.status === 204 ? null : response.json();
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const body = (await authRequest("/me")) as { user: AuthUser };
    return body.user;
  } catch {
    return null;
  }
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  onboarding: OnboardingProfile;
}) {
  const body = (await authRequest("/register", {
    method: "POST",
    body: JSON.stringify(input),
  })) as { user: AuthUser };
  return body.user;
}

export async function loginUser(email: string, password: string) {
  const body = (await authRequest("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })) as { user: AuthUser };
  return body.user;
}

export async function logoutUser() {
  await authRequest("/logout", { method: "POST" });
}
