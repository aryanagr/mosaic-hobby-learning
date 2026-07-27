export const techniqueMedia = ["watch", "read", "practice", "listen"] as const;
export type TechniqueMedium = (typeof techniqueMedia)[number];

export const techniqueStatuses = [
  "ready",
  "active",
  "done",
  "skipped",
] as const;
export type TechniqueStatus = (typeof techniqueStatuses)[number];

export interface Technique {
  id: number;
  eyebrow: string;
  title: string;
  description: string;
  duration: number;
  medium: TechniqueMedium;
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

export interface CreatePlanRequest {
  hobby: string;
  moment: string;
  level: "new" | "some" | "returning";
  minutes: number;
  avoid?: string;
}
