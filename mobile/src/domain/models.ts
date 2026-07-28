export type Experience = "new" | "some" | "returning";
export type LearningFormat = "practice" | "watch" | "read" | "listen";
export type TechniqueStatus = "ready" | "active" | "done" | "skipped";

export interface OnboardingProfile {
  hobby: string;
  experience: Experience;
  goal: string;
  weeklyMinutes: number;
  preferredFormat: LearningFormat;
}

export interface User {
  id: string;
  name: string;
  email: string;
  onboarding: OnboardingProfile;
}

export interface Technique {
  id: number;
  eyebrow: string;
  title: string;
  description: string;
  duration: number;
  medium: LearningFormat;
  status: TechniqueStatus;
  why: string;
}

export interface LearningPlan {
  id: string;
  hobby: string;
  title: string;
  promise: string;
  source: "groq" | "crafted-fallback";
  techniques: Technique[];
}
