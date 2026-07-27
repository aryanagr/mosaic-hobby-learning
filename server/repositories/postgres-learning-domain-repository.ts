import { Pool, type PoolClient } from "pg";
import type {
  GenerateLearningPathInput,
  UpdateTechniqueProgressInput,
} from "../domain/learning-path.schema.js";
import type { TechniqueCandidate } from "../domain/recommendation.js";
import type {
  HobbySummary,
  LearningDomainRepository,
  RecommendationContext,
} from "./learning-domain-repository.js";

interface LevelRow {
  current_level_order: number;
  target_level_order: number;
}
interface CandidateRow {
  id: string;
  title: string;
  level_order: number;
  estimated_minutes: number;
  popularity_score: string;
  average_rating: string;
  prerequisite_ids: string[] | null;
  resource_types: string[] | null;
}

export class PostgresLearningDomainRepository implements LearningDomainRepository {
  private readonly pool: Pool;
  constructor(connectionString: string, maxConnections: number) {
    this.pool = new Pool({
      connectionString,
      max: maxConnections,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 2_000,
      maxUses: 7_500,
    });
  }

  async listHobbies() {
    const result = await this.pool.query<HobbySummary>(
      "SELECT id, name, slug, description, category FROM hobbies WHERE is_active = TRUE ORDER BY name",
    );
    return result.rows;
  }

  async getHobby(hobbyId: string) {
    const result = await this.pool.query<HobbySummary>(
      "SELECT id,name,slug,description,category FROM hobbies WHERE id=$1 AND is_active=TRUE",
      [hobbyId],
    );
    return result.rows[0] ?? null;
  }

  async listHobbyLevels(hobbyId: string) {
    const result = await this.pool.query<{
      id: string;
      name: string;
      level_order: number;
      description: string | null;
    }>(
      "SELECT id,name,level_order,description FROM hobby_levels WHERE hobby_id=$1 ORDER BY level_order",
      [hobbyId],
    );
    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      levelOrder: row.level_order,
      description: row.description,
    }));
  }

  async listHobbyTechniques(hobbyId: string) {
    const result = await this.pool.query<{
      id: string;
      title: string;
      description: string | null;
      difficulty_level: number;
      estimated_minutes: number;
      resource_count: string;
    }>(
      `SELECT t.id,t.title,t.description,t.difficulty_level,t.estimated_minutes,COUNT(resource.id)::text AS resource_count FROM techniques t LEFT JOIN learning_resources resource ON resource.technique_id=t.id WHERE t.hobby_id=$1 AND t.is_active=TRUE GROUP BY t.id ORDER BY t.difficulty_level,t.popularity_score DESC`,
      [hobbyId],
    );
    return result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      difficultyLevel: row.difficulty_level,
      estimatedMinutes: row.estimated_minutes,
      resourceCount: Number(row.resource_count),
    }));
  }

  async getLearningPath(pathId: string, userId: string) {
    const header = await this.pool.query<{
      id: string;
      title: string;
      description: string | null;
      hobby_name: string;
      user_hobby_id: string;
    }>(
      `SELECT path.id,path.title,path.description,hobby.name AS hobby_name,user_hobby.id AS user_hobby_id FROM learning_paths path JOIN user_hobbies user_hobby ON user_hobby.id=path.user_hobby_id JOIN hobbies hobby ON hobby.id=user_hobby.hobby_id WHERE path.id=$1 AND user_hobby.user_id=$2`,
      [pathId, userId],
    );
    const path = header.rows[0];
    if (!path) return null;
    const techniques = await this.pool.query<{
      path_technique_id: string;
      id: string;
      position: number;
      is_required: boolean;
      title: string;
      description: string | null;
      difficulty_level: number;
      estimated_minutes: number;
      status: string;
      progress_percentage: number;
      personal_notes: string | null;
      resources: unknown[];
    }>(
      `SELECT path_technique.id AS path_technique_id,technique.id,path_technique.position,path_technique.is_required,technique.title,technique.description,technique.difficulty_level,technique.estimated_minutes,COALESCE(progress.status,'not_started')::text AS status,COALESCE(progress.progress_percentage,0) AS progress_percentage,progress.personal_notes,COALESCE((SELECT jsonb_agg(jsonb_build_object('id',resource.id,'title',resource.title,'description',resource.description,'type',resource.resource_type,'resourceUrl',resource.resource_url,'durationMinutes',resource.duration_minutes,'displayOrder',resource.display_order) ORDER BY resource.display_order) FROM learning_resources resource WHERE resource.technique_id=technique.id),'[]') AS resources FROM learning_path_techniques path_technique JOIN techniques technique ON technique.id=path_technique.technique_id LEFT JOIN user_technique_progress progress ON progress.learning_path_technique_id=path_technique.id AND progress.user_id=$2 WHERE path_technique.learning_path_id=$1 ORDER BY path_technique.position`,
      [pathId, userId],
    );
    const required = techniques.rows.filter((item) => item.is_required);
    const completed = required.filter(
      (item) => item.status === "completed",
    ).length;
    return {
      id: path.id,
      userHobbyId: path.user_hobby_id,
      hobbyName: path.hobby_name,
      title: path.title,
      description: path.description,
      progressPercentage: required.length
        ? Math.round((completed / required.length) * 10_000) / 100
        : 0,
      completedTechniqueCount: completed,
      totalTechniqueCount: required.length,
      techniques: techniques.rows.map((item) => ({
        pathTechniqueId: item.path_technique_id,
        id: item.id,
        position: item.position,
        title: item.title,
        description: item.description,
        difficultyLevel: item.difficulty_level,
        estimatedMinutes: item.estimated_minutes,
        status: item.status,
        progressPercentage: item.progress_percentage,
        personalNotes: item.personal_notes,
        resources: item.resources,
      })),
    };
  }

  async getRecommendationContext(
    hobbyId: string,
    currentLevelId: string,
    targetLevelId: string,
  ): Promise<RecommendationContext> {
    const levels = await this.pool.query<LevelRow>(
      `SELECT current.level_order AS current_level_order, target.level_order AS target_level_order FROM hobby_levels current JOIN hobby_levels target ON target.hobby_id = current.hobby_id WHERE current.id=$1 AND target.id=$2 AND current.hobby_id=$3`,
      [currentLevelId, targetLevelId, hobbyId],
    );
    const level = levels.rows[0];
    if (!level || level.current_level_order > level.target_level_order)
      throw Object.assign(new Error("Invalid hobby level range"), {
        status: 400,
      });
    const result = await this.pool.query<CandidateRow>(
      `SELECT t.id,t.title,MIN(hl.level_order)::int AS level_order,t.estimated_minutes,t.popularity_score::text,t.average_rating::text,COALESCE(array_agg(DISTINCT tp.prerequisite_technique_id) FILTER (WHERE tp.prerequisite_technique_id IS NOT NULL),'{}') AS prerequisite_ids,COALESCE(array_agg(DISTINCT resource.resource_type::text) FILTER (WHERE resource.resource_type IS NOT NULL),'{}') AS resource_types FROM techniques t JOIN technique_levels tl ON tl.technique_id=t.id JOIN hobby_levels hl ON hl.id=tl.level_id LEFT JOIN technique_prerequisites tp ON tp.technique_id=t.id LEFT JOIN learning_resources resource ON resource.technique_id=t.id WHERE t.hobby_id=$1 AND t.is_active=TRUE AND hl.level_order BETWEEN $2 AND $3 GROUP BY t.id,t.title,t.estimated_minutes,t.popularity_score,t.average_rating`,
      [hobbyId, level.current_level_order, level.target_level_order],
    );
    return {
      currentLevelOrder: level.current_level_order,
      targetLevelOrder: level.target_level_order,
      candidates: result.rows.map((row) => ({
        id: row.id,
        title: row.title,
        levelOrder: row.level_order,
        estimatedMinutes: row.estimated_minutes,
        popularityScore: Number(row.popularity_score),
        averageRating: Number(row.average_rating),
        prerequisiteIds: row.prerequisite_ids ?? [],
        resourceTypes: row.resource_types ?? [],
      })),
    };
  }

  async createLearningPath(
    input: GenerateLearningPathInput,
    techniques: TechniqueCandidate[],
  ) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const userHobby = await client.query<{ id: string }>(
        `INSERT INTO user_hobbies(user_id,hobby_id,current_level_id,target_level_id,weekly_minutes,preferred_resource_types) VALUES($1,$2,$3,$4,$5,$6::resource_type[]) ON CONFLICT(user_id,hobby_id) DO UPDATE SET current_level_id=EXCLUDED.current_level_id,target_level_id=EXCLUDED.target_level_id,weekly_minutes=EXCLUDED.weekly_minutes,preferred_resource_types=EXCLUDED.preferred_resource_types,status='active' RETURNING id`,
        [
          input.userId,
          input.hobbyId,
          input.currentLevelId,
          input.targetLevelId,
          input.weeklyMinutes,
          input.preferredFormats,
        ],
      );
      const userHobbyId = userHobby.rows[0]?.id;
      if (!userHobbyId) throw new Error("Could not create user hobby");
      await client.query(
        `INSERT INTO user_learning_preferences(user_hobby_id,prefers_video,prefers_article,prefers_audio,prefers_practice,prefers_quiz) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(user_hobby_id) DO UPDATE SET prefers_video=EXCLUDED.prefers_video,prefers_article=EXCLUDED.prefers_article,prefers_audio=EXCLUDED.prefers_audio,prefers_practice=EXCLUDED.prefers_practice,prefers_quiz=EXCLUDED.prefers_quiz`,
        [
          userHobbyId,
          input.preferredFormats.includes("video"),
          input.preferredFormats.includes("article"),
          input.preferredFormats.includes("audio"),
          input.preferredFormats.includes("exercise"),
          input.preferredFormats.includes("quiz"),
        ],
      );
      await client.query(
        "UPDATE learning_paths SET is_active=FALSE,updated_at=NOW() WHERE user_hobby_id=$1 AND is_active=TRUE",
        [userHobbyId],
      );
      const path = await client.query<{ id: string }>(
        `INSERT INTO learning_paths(user_hobby_id,title,description) VALUES($1,$2,$3) RETURNING id`,
        [
          userHobbyId,
          `Your focused ${techniques.length}-technique path`,
          "Generated from level relevance, prerequisites, ratings, popularity, and available time.",
        ],
      );
      const pathId = path.rows[0]?.id;
      if (!pathId) throw new Error("Could not create learning path");
      await this.insertTechniques(client, pathId, input.userId, techniques);
      await client.query("COMMIT");
      return {
        id: pathId,
        title: `Your focused ${techniques.length}-technique path`,
        techniqueIds: techniques.map((item) => item.id),
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  private async insertTechniques(
    client: PoolClient,
    pathId: string,
    userId: string,
    techniques: TechniqueCandidate[],
  ) {
    for (const [index, technique] of techniques.entries()) {
      const inserted = await client.query<{ id: string }>(
        "INSERT INTO learning_path_techniques(learning_path_id,technique_id,position) VALUES($1,$2,$3) RETURNING id",
        [pathId, technique.id, index + 1],
      );
      await client.query(
        "INSERT INTO user_technique_progress(user_id,learning_path_technique_id) VALUES($1,$2)",
        [userId, inserted.rows[0]?.id],
      );
    }
  }

  async updateTechniqueProgress(
    pathTechniqueId: string,
    input: UpdateTechniqueProgressInput,
  ) {
    await this.pool.query(
      `INSERT INTO user_technique_progress(user_id,learning_path_technique_id,status,progress_percentage,personal_notes,started_at,completed_at) VALUES($1,$2,$3,$4,$5,CASE WHEN $3<>'not_started' THEN NOW() END,CASE WHEN $3='completed' THEN NOW() END) ON CONFLICT(user_id,learning_path_technique_id) DO UPDATE SET status=EXCLUDED.status,progress_percentage=EXCLUDED.progress_percentage,personal_notes=EXCLUDED.personal_notes,started_at=COALESCE(user_technique_progress.started_at,EXCLUDED.started_at),completed_at=EXCLUDED.completed_at,updated_at=NOW()`,
      [
        input.userId,
        pathTechniqueId,
        input.status,
        input.progressPercentage,
        input.personalNotes ?? null,
      ],
    );
  }
  async close() {
    await this.pool.end();
  }
}
