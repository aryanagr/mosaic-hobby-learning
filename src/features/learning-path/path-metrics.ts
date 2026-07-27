import type { Technique } from "../../../shared/learning-plan.js";

export function calculatePathMetrics(techniques: Technique[]) {
  const visible = techniques.filter(
    (technique) => technique.status !== "skipped",
  );
  const mastered = techniques.filter(
    (technique) => technique.status === "done",
  ).length;
  return {
    visible,
    mastered,
    skipped: techniques.length - visible.length,
    progress: Math.round((mastered / Math.max(visible.length, 1)) * 100),
  };
}
