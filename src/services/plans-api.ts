import type {
  CreatePlanRequest,
  LearningPlan,
} from "../../shared/learning-plan";

export class ApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function createLearningPlan(
  input: CreatePlanRequest,
  signal?: AbortSignal,
) {
  const response = await fetch("/api/plans", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
    signal,
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    throw new ApiError(
      response.status,
      body?.error?.message ?? "Could not create your path.",
    );
  }
  return response.json() as Promise<LearningPlan>;
}
