import { z } from "zod";

export const onboardingProfileSchema = z.object({
  hobby: z.string().trim().min(2).max(80),
  experience: z.enum(["new", "some", "returning"]),
  goal: z.string().trim().min(8).max(180),
  weeklyMinutes: z.coerce.number().int().min(10).max(300),
  preferredFormat: z.enum(["watch", "read", "practice", "listen"]),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(8).max(72),
  onboarding: onboardingProfileSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(8).max(72),
});

export type OnboardingProfile = z.infer<typeof onboardingProfileSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
