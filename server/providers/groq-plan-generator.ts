import type { AppConfig } from "../config.js";
import type { PlanGenerator } from "../domain/plan-generator.js";
import {
  generatedPlanSchema,
  type ValidCreatePlanRequest,
} from "../domain/plan.schema.js";

export class GroqPlanGenerator implements PlanGenerator {
  readonly source = "groq" as const;

  constructor(
    private readonly apiKey: string,
    private readonly model: AppConfig["GROQ_MODEL"],
  ) {}

  async generate(input: ValidCreatePlanRequest) {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${this.apiKey}`,
          "content-type": "application/json",
        },
        signal: AbortSignal.timeout(8_000),
        body: JSON.stringify({
          model: this.model,
          response_format: { type: "json_object" },
          temperature: 0.4,
          messages: [
            {
              role: "system",
              content:
                "Design a minimum viable mastery path. Return JSON with title, promise, and exactly six techniques. Each technique needs eyebrow, title, description, duration (10-35), medium (watch|read|practice|listen), and why. Choose media from first principles. No quizzes or generic advice.",
            },
            { role: "user", content: JSON.stringify(input) },
          ],
        }),
      },
    );

    if (!response.ok)
      throw new Error(`Groq request failed with ${response.status}`);
    const body = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = body.choices?.[0]?.message?.content;
    if (!content) throw new Error("Groq returned an empty response");
    return generatedPlanSchema.parse(JSON.parse(content));
  }
}
