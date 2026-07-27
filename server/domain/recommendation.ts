export interface TechniqueCandidate {
  id: string;
  title: string;
  levelOrder: number;
  estimatedMinutes: number;
  popularityScore: number;
  averageRating: number;
  prerequisiteIds: string[];
  resourceTypes: string[];
}

export interface RecommendationInput {
  currentLevelOrder: number;
  targetLevelOrder: number;
  weeklyMinutes: number;
  minimum?: number;
  maximum?: number;
  preferredFormats?: string[];
}

function score(candidate: TechniqueCandidate, input: RecommendationInput) {
  const levelRange = Math.max(
    1,
    input.targetLevelOrder - input.currentLevelOrder + 1,
  );
  const levelDistance = Math.abs(
    candidate.levelOrder - input.currentLevelOrder,
  );
  const levelRelevance = Math.max(0, 1 - levelDistance / levelRange);
  const rating = candidate.averageRating / 5;
  const popularity = candidate.popularityScore / 100;
  const idealSession = Math.max(10, input.weeklyMinutes / 3);
  const timeFit = Math.max(
    0,
    1 - Math.abs(candidate.estimatedMinutes - idealSession) / idealSession,
  );
  const preferences = input.preferredFormats ?? [];
  const preferenceMatch =
    preferences.length === 0 ||
    candidate.resourceTypes.some((type) => preferences.includes(type))
      ? 1
      : 0;
  return (
    levelRelevance * 0.35 +
    rating * 0.25 +
    popularity * 0.25 +
    timeFit * 0.1 +
    preferenceMatch * 0.05
  );
}

function prerequisiteClosure(
  id: string,
  byId: Map<string, TechniqueCandidate>,
  visiting = new Set<string>(),
): string[] {
  if (visiting.has(id))
    throw new Error(`Cyclic technique prerequisite detected at ${id}`);
  const candidate = byId.get(id);
  if (!candidate) return [];
  const nextVisiting = new Set(visiting).add(id);
  return [
    ...new Set(
      candidate.prerequisiteIds.flatMap((prerequisiteId) => [
        ...prerequisiteClosure(prerequisiteId, byId, nextVisiting),
        prerequisiteId,
      ]),
    ),
  ];
}

function topologicalOrder(
  ids: Set<string>,
  byId: Map<string, TechniqueCandidate>,
) {
  const result: TechniqueCandidate[] = [];
  const visited = new Set<string>();
  const visit = (id: string, visiting: Set<string>) => {
    if (visited.has(id)) return;
    if (visiting.has(id))
      throw new Error(`Cyclic technique prerequisite detected at ${id}`);
    const candidate = byId.get(id);
    if (!candidate) return;
    const nextVisiting = new Set(visiting).add(id);
    candidate.prerequisiteIds
      .filter((prerequisiteId) => ids.has(prerequisiteId))
      .forEach((prerequisiteId) => visit(prerequisiteId, nextVisiting));
    visited.add(id);
    result.push(candidate);
  };
  ids.forEach((id) => visit(id, new Set()));
  return result;
}

export function recommendTechniques(
  candidates: TechniqueCandidate[],
  input: RecommendationInput,
) {
  const minimum = input.minimum ?? 5;
  const maximum = input.maximum ?? 8;
  if (minimum < 1 || maximum < minimum)
    throw new Error("Invalid recommendation bounds");
  const eligible = candidates.filter(
    (candidate) =>
      candidate.levelOrder >= input.currentLevelOrder &&
      candidate.levelOrder <= input.targetLevelOrder,
  );
  const byId = new Map(eligible.map((candidate) => [candidate.id, candidate]));
  const ranked = [...eligible].sort(
    (left, right) =>
      score(right, input) - score(left, input) ||
      left.id.localeCompare(right.id),
  );
  const selected = new Set<string>();
  for (const candidate of ranked) {
    const additions = [
      ...prerequisiteClosure(candidate.id, byId),
      candidate.id,
    ].filter((id) => !selected.has(id));
    if (selected.size + additions.length <= maximum)
      additions.forEach((id) => selected.add(id));
    if (selected.size === maximum) break;
  }
  if (selected.size < Math.min(minimum, eligible.length))
    throw new Error("Not enough eligible techniques to build a learning path");
  return topologicalOrder(selected, byId).slice(0, maximum);
}
