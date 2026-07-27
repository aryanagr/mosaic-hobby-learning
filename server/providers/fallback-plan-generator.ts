import type { PlanGenerator } from "../domain/plan-generator.js";
import type {
  GeneratedPlan,
  ValidCreatePlanRequest,
} from "../domain/plan.schema.js";

export class FallbackPlanGenerator implements PlanGenerator {
  readonly source = "crafted-fallback" as const;

  async generate(input: ValidCreatePlanRequest): Promise<GeneratedPlan> {
    const practiceMinutes = Math.max(
      10,
      Math.min(35, Math.round(input.minutes / 3)),
    );
    const observationMedium = this.observationMedium(input.hobby);
    const techniques: GeneratedPlan["techniques"] = [
      {
        eyebrow: "Signal",
        title: `Recognise what good ${input.hobby} feels like`,
        description:
          "Compare two short examples and name the one quality you want to reproduce.",
        duration: practiceMinutes,
        medium: observationMedium,
        why: "A clear internal target makes every practice minute more useful.",
      },
      {
        eyebrow: "Foundation",
        title: "Build the smallest reliable motion",
        description: `Isolate the physical or mental pattern that carries most beginner ${input.hobby} attempts.`,
        duration: practiceMinutes,
        medium: "watch",
        why: "Reliable basics remove friction before complexity is introduced.",
      },
      {
        eyebrow: "Control",
        title: "Repeat it under one constraint",
        description:
          "Use a tiny practice loop with immediate feedback instead of unfocused repetition.",
        duration: practiceMinutes,
        medium: "practice",
        why: "A constraint turns repetition into deliberate practice.",
      },
      {
        eyebrow: "Recovery",
        title: "Recover without restarting",
        description:
          "Practise the most common mistake and a two-step way back into flow.",
        duration: practiceMinutes,
        medium: "read",
        why: "Confidence comes from recovery, not from avoiding every mistake.",
      },
      {
        eyebrow: "Expression",
        title: "Add one personal choice",
        description:
          "Choose a variation that fits your taste and apply it to the core pattern.",
        duration: practiceMinutes,
        medium: "practice",
        why: "Personal relevance is what turns a lesson into a lasting hobby.",
      },
      {
        eyebrow: "Moment",
        title: `Rehearse: ${input.moment}`,
        description:
          "Simulate the real moment once, note one snag, then run it again.",
        duration: practiceMinutes,
        medium: "practice",
        why: "The path exists to make this real-world moment feel easy.",
      },
    ];

    return {
      title: input.moment,
      promise: `The shortest useful ${input.hobby} path for your real-life goal.`,
      techniques,
    };
  }

  private observationMedium(hobby: string): "listen" | "watch" | "read" {
    const normalized = hobby.toLowerCase();
    const auditory = ["guitar", "piano", "singing", "drums", "music", "violin"];
    const strategic = ["chess", "poker", "writing", "coding", "reading"];
    if (auditory.some((candidate) => normalized.includes(candidate)))
      return "listen";
    if (strategic.some((candidate) => normalized.includes(candidate)))
      return "read";
    return "watch";
  }
}
