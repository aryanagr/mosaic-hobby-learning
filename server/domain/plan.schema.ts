import { z } from "zod";
import { techniqueMedia } from "../../shared/learning-plan.js";

export const createPlanSchema = z.object({
  hobby: z.string().trim().min(2).max(40),
  moment: z.string().trim().min(8).max(160),
  level: z.enum(["new", "some", "returning"]),
  minutes: z.number().int().min(10).max(300),
  avoid: z.string().trim().max(120).optional().default(""),
});

const generatedTechniqueSchema = z.object({
  eyebrow: z.string().trim().min(2).max(30),
  title: z.string().trim().min(3).max(100),
  description: z.string().trim().min(10).max(240),
  duration: z.number().int().min(10).max(35),
  medium: z.enum(techniqueMedia),
  why: z.string().trim().min(10).max(240),
});

export const generatedPlanSchema = z.object({
  title: z.string().trim().min(8).max(160),
  promise: z.string().trim().min(10).max(240),
  techniques: z.array(generatedTechniqueSchema).length(6),
});

export type ValidCreatePlanRequest = z.infer<typeof createPlanSchema>;
export type GeneratedPlan = z.infer<typeof generatedPlanSchema>;
