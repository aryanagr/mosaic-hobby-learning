import { z } from "zod";

export const generateLearningPathSchema = z.object({
  userId: z.string().uuid(),
  hobbyId: z.string().uuid(),
  currentLevelId: z.string().uuid(),
  targetLevelId: z.string().uuid(),
  weeklyMinutes: z.number().int().min(10).max(10_080),
  preferredFormats: z
    .array(z.enum(["video", "article", "audio", "exercise", "quiz"]))
    .max(5)
    .default([]),
});

export const updateTechniqueProgressSchema = z.object({
  userId: z.string().uuid(),
  status: z.enum([
    "not_started",
    "in_progress",
    "completed",
    "skipped",
    "difficult",
  ]),
  progressPercentage: z.number().int().min(0).max(100),
  personalNotes: z.string().trim().max(2_000).optional(),
});

export type GenerateLearningPathInput = z.infer<
  typeof generateLearningPathSchema
>;
export type UpdateTechniqueProgressInput = z.infer<
  typeof updateTechniqueProgressSchema
>;
