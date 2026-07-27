import type {
  GenerateLearningPathInput,
  UpdateTechniqueProgressInput,
} from "../domain/learning-path.schema.js";
import type { TechniqueCandidate } from "../domain/recommendation.js";

export interface HobbySummary {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
}
export interface HobbyLevelSummary {
  id: string;
  name: string;
  levelOrder: number;
  description: string | null;
}
export interface TechniqueSummary {
  id: string;
  title: string;
  description: string | null;
  difficultyLevel: number;
  estimatedMinutes: number;
  resourceCount: number;
}
export interface RecommendationContext {
  currentLevelOrder: number;
  targetLevelOrder: number;
  candidates: TechniqueCandidate[];
}

export interface LearningDomainRepository {
  listHobbies(): Promise<HobbySummary[]>;
  getHobby(hobbyId: string): Promise<HobbySummary | null>;
  listHobbyLevels(hobbyId: string): Promise<HobbyLevelSummary[]>;
  listHobbyTechniques(hobbyId: string): Promise<TechniqueSummary[]>;
  getLearningPath(pathId: string, userId: string): Promise<unknown | null>;
  getRecommendationContext(
    hobbyId: string,
    currentLevelId: string,
    targetLevelId: string,
  ): Promise<RecommendationContext>;
  createLearningPath(
    input: GenerateLearningPathInput,
    techniques: TechniqueCandidate[],
  ): Promise<{ id: string; title: string; techniqueIds: string[] }>;
  updateTechniqueProgress(
    pathTechniqueId: string,
    input: UpdateTechniqueProgressInput,
  ): Promise<void>;
  close(): Promise<void>;
}
