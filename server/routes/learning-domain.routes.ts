import { Router } from "express";
import { z } from "zod";
import {
  generateLearningPathSchema,
  updateTechniqueProgressSchema,
} from "../domain/learning-path.schema.js";
import type { LearningPathService } from "../services/learning-path-service.js";

export function createLearningDomainRouter(service: LearningPathService) {
  const router = Router();
  router.get("/hobbies", async (_request, response) =>
    response.json({ data: await service.listHobbies() }),
  );
  router.get("/hobbies/:hobbyId", async (request, response) => {
    const hobby = await service.getHobby(
      z.string().uuid().parse(request.params.hobbyId),
    );
    if (!hobby) {
      response
        .status(404)
        .json({ error: { code: "NOT_FOUND", message: "Hobby not found." } });
      return;
    }
    response.json({ data: hobby });
  });
  router.get("/hobbies/:hobbyId/levels", async (request, response) =>
    response.json({
      data: await service.listHobbyLevels(
        z.string().uuid().parse(request.params.hobbyId),
      ),
    }),
  );
  router.get("/hobbies/:hobbyId/techniques", async (request, response) =>
    response.json({
      data: await service.listHobbyTechniques(
        z.string().uuid().parse(request.params.hobbyId),
      ),
    }),
  );
  router.get("/learning-paths/:pathId", async (request, response) => {
    const path = await service.getLearningPath(
      z.string().uuid().parse(request.params.pathId),
      z.string().uuid().parse(request.query.userId),
    );
    if (!path) {
      response.status(404).json({
        error: { code: "NOT_FOUND", message: "Learning path not found." },
      });
      return;
    }
    response.json({ data: path });
  });
  router.post("/learning-paths/generate", async (request, response) =>
    response.status(201).json({
      data: await service.generate(
        generateLearningPathSchema.parse(request.body),
      ),
    }),
  );
  router.patch(
    "/progress/techniques/:pathTechniqueId",
    async (request, response) => {
      await service.updateProgress(
        request.params.pathTechniqueId,
        updateTechniqueProgressSchema.parse(request.body),
      );
      response.status(204).send();
    },
  );
  return router;
}
