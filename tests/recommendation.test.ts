import { describe, expect, it } from "vitest";
import {
  recommendTechniques,
  type TechniqueCandidate,
} from "../server/domain/recommendation.js";

const candidate = (
  id: string,
  overrides: Partial<TechniqueCandidate> = {},
): TechniqueCandidate => ({
  id,
  title: id,
  levelOrder: 1,
  estimatedMinutes: 20,
  popularityScore: 80,
  averageRating: 4,
  prerequisiteIds: [],
  resourceTypes: ["article"],
  ...overrides,
});
const input = {
  currentLevelOrder: 1,
  targetLevelOrder: 2,
  weeklyMinutes: 60,
  minimum: 5,
  maximum: 8,
};

describe("recommendTechniques", () => {
  it("filters by level and ranks stronger relevant techniques", () => {
    const result = recommendTechniques(
      [
        candidate("popular", { popularityScore: 100, averageRating: 5 }),
        candidate("low"),
        candidate("b"),
        candidate("c"),
        candidate("d"),
        candidate("advanced", { levelOrder: 3, averageRating: 5 }),
      ],
      input,
    );
    expect(result.map((item) => item.id)).toContain("popular");
    expect(result.map((item) => item.id)).not.toContain("advanced");
  });

  it("places prerequisites before dependent techniques", () => {
    const result = recommendTechniques(
      [
        candidate("foundation"),
        candidate("forks", {
          averageRating: 5,
          prerequisiteIds: ["foundation"],
        }),
        candidate("b"),
        candidate("c"),
        candidate("d"),
      ],
      input,
    );
    expect(result.findIndex((item) => item.id === "foundation")).toBeLessThan(
      result.findIndex((item) => item.id === "forks"),
    );
  });

  it("uses preferred resource formats as a ranking signal", () => {
    const result = recommendTechniques(
      [
        candidate("video", { resourceTypes: ["video"] }),
        candidate("article", { resourceTypes: ["article"] }),
        candidate("b"),
        candidate("c"),
        candidate("d"),
      ],
      { ...input, preferredFormats: ["video"] },
    );
    expect(result.findIndex((item) => item.id === "video")).toBeLessThan(
      result.findIndex((item) => item.id === "article"),
    );
  });

  it("rejects cyclic prerequisites", () => {
    expect(() =>
      recommendTechniques(
        [
          candidate("a", { prerequisiteIds: ["b"] }),
          candidate("b", { prerequisiteIds: ["a"] }),
          candidate("c"),
          candidate("d"),
          candidate("e"),
        ],
        input,
      ),
    ).toThrow(/Cyclic/);
  });
});
