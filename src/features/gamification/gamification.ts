import type { Technique } from "../../../shared/learning-plan.js";

export interface Achievement {
  id: "first-sprout" | "momentum" | "path-in-bloom";
  icon: string;
  title: string;
  description: string;
  threshold: number;
}

export const achievements: Achievement[] = [
  {
    id: "first-sprout",
    icon: "🌱",
    title: "First sprout",
    description: "Master your first technique",
    threshold: 1,
  },
  {
    id: "momentum",
    icon: "🔥",
    title: "Momentum maker",
    description: "Master three techniques",
    threshold: 3,
  },
  {
    id: "path-in-bloom",
    icon: "🏆",
    title: "Path in bloom",
    description: "Complete the entire learning path",
    threshold: Number.POSITIVE_INFINITY,
  },
];

export interface GamificationProgress {
  mastered: number;
  total: number;
  xp: number;
  level: number;
  levelProgress: number;
  unlocked: Achievement[];
  next: Achievement | null;
}

export function calculateGamification(
  techniques: Technique[],
): GamificationProgress {
  const visible = techniques.filter(
    (technique) => technique.status !== "skipped",
  );
  const mastered = visible.filter(
    (technique) => technique.status === "done",
  ).length;
  const total = visible.length;
  const complete = total > 0 && mastered === total;
  const unlocked = achievements.filter((achievement) =>
    achievement.id === "path-in-bloom"
      ? complete
      : mastered >= achievement.threshold,
  );
  const xp = mastered * 120 + (complete ? 300 : 0);
  const level = Math.floor(xp / 300) + 1;

  return {
    mastered,
    total,
    xp,
    level,
    levelProgress: xp % 300,
    unlocked,
    next: achievements.find((item) => !unlocked.includes(item)) ?? null,
  };
}

export function findNewAchievement(
  before: GamificationProgress,
  after: GamificationProgress,
) {
  const previousIds = new Set(before.unlocked.map((item) => item.id));
  return after.unlocked.find((item) => !previousIds.has(item.id)) ?? null;
}
