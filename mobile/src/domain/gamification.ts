import type { Technique } from "./models";

export const milestones = [
  { id: "first", title: "First sprout", icon: "🌱", at: 1 },
  { id: "momentum", title: "Momentum maker", icon: "🔥", at: 3 },
  {
    id: "bloom",
    title: "Path in bloom",
    icon: "🏆",
    at: Number.POSITIVE_INFINITY,
  },
] as const;
export type Milestone = (typeof milestones)[number];

export function calculateProgress(techniques: Technique[]) {
  const visible = techniques.filter((item) => item.status !== "skipped");
  const mastered = visible.filter((item) => item.status === "done").length;
  const complete = visible.length > 0 && mastered === visible.length;
  const xp = mastered * 120 + (complete ? 300 : 0);
  const unlocked = milestones.filter((item) =>
    item.id === "bloom" ? complete : mastered >= item.at,
  );
  return {
    mastered,
    total: visible.length,
    percentage: Math.round((mastered / Math.max(visible.length, 1)) * 100),
    xp,
    level: Math.floor(xp / 300) + 1,
    levelXp: xp % 300,
    unlocked,
  };
}
