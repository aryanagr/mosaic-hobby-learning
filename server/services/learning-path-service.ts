import type {
  GenerateLearningPathInput,
  UpdateTechniqueProgressInput,
} from "../domain/learning-path.schema.js";
import { recommendTechniques } from "../domain/recommendation.js";
import type { LearningDomainRepository } from "../repositories/learning-domain-repository.js";

export class LearningPathService {
  constructor(private readonly repository: LearningDomainRepository) {}
  listHobbies() {
    return this.repository.listHobbies();
  }
  getHobby(hobbyId: string) {
    return this.repository.getHobby(hobbyId);
  }
  listHobbyLevels(hobbyId: string) {
    return this.repository.listHobbyLevels(hobbyId);
  }
  listHobbyTechniques(hobbyId: string) {
    return this.repository.listHobbyTechniques(hobbyId);
  }
  getLearningPath(pathId: string, userId: string) {
    return this.repository.getLearningPath(pathId, userId);
  }
  async generate(input: GenerateLearningPathInput) {
    const context = await this.repository.getRecommendationContext(
      input.hobbyId,
      input.currentLevelId,
      input.targetLevelId,
    );
    const techniques = recommendTechniques(context.candidates, {
      currentLevelOrder: context.currentLevelOrder,
      targetLevelOrder: context.targetLevelOrder,
      weeklyMinutes: input.weeklyMinutes,
      preferredFormats: input.preferredFormats,
    });
    return this.repository.createLearningPath(input, techniques);
  }
  updateProgress(pathTechniqueId: string, input: UpdateTechniqueProgressInput) {
    return this.repository.updateTechniqueProgress(pathTechniqueId, input);
  }
}
