import { useState, type FormEvent } from "react";
import type {
  CreatePlanRequest,
  LearningPlan,
} from "../../../shared/learning-plan";
import { createLearningPlan } from "../../services/plans-api";
import { Loader } from "../../components/Loader";

const initialGoal: CreatePlanRequest = {
  hobby: "Guitar",
  moment: "Play three songs confidently at our next campfire",
  level: "some",
  minutes: 60,
  avoid: "Music theory overload",
};

interface PathStudioProps {
  onClose(): void;
  onCreated(plan: LearningPlan): void;
  onError(message: string): void;
}

export function PathStudio({ onClose, onCreated, onError }: PathStudioProps) {
  const [goal, setGoal] = useState(initialGoal);
  const [status, setStatus] = useState<"idle" | "submitting">("idle");
  const update = <Key extends keyof CreatePlanRequest>(
    key: Key,
    value: CreatePlanRequest[Key],
  ) => setGoal((current) => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("submitting");
    try {
      onCreated(await createLearningPlan(goal));
    } catch (error) {
      onError(
        error instanceof Error ? error.message : "Could not create your path.",
      );
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="backdrop lab-backdrop" onMouseDown={onClose}>
      <section
        className="sheet lab"
        role="dialog"
        aria-modal="true"
        aria-labelledby="studio-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="close"
          onClick={onClose}
          aria-label="Close path studio"
        >
          ×
        </button>
        <div className="lab-heading">
          <span>✦ PATH STUDIO</span>
          <h2 id="studio-title">What moment do you want to unlock?</h2>
          <p>
            Not a course. Not everything. The smallest set of skills that gets
            you there.
          </p>
        </div>
        <form onSubmit={submit}>
          <label>
            My hobby
            <input
              value={goal.hobby}
              onChange={(event) => update("hobby", event.target.value)}
              required
              minLength={2}
            />
          </label>
          <label className="wide">
            The real-life moment I want
            <input
              value={goal.moment}
              onChange={(event) => update("moment", event.target.value)}
              required
              minLength={8}
            />
          </label>
          <label>
            Where I am
            <select
              value={goal.level}
              onChange={(event) =>
                update(
                  "level",
                  event.target.value as CreatePlanRequest["level"],
                )
              }
            >
              <option value="new">Completely new</option>
              <option value="some">Know the basics</option>
              <option value="returning">Coming back</option>
            </select>
          </label>
          <label>
            Minutes each week
            <input
              type="number"
              min="10"
              max="300"
              value={goal.minutes}
              onChange={(event) =>
                update("minutes", Number(event.target.value))
              }
            />
          </label>
          <label className="wide">
            Please spare me from
            <input
              value={goal.avoid}
              onChange={(event) => update("avoid", event.target.value)}
              placeholder="Long videos, theory, drills…"
            />
          </label>
          <button
            className="primary generate"
            disabled={status === "submitting"}
            aria-busy={status === "submitting"}
          >
            {status === "submitting" ? (
              <Loader size="small" label="Distilling your path…" />
            ) : (
              "Distill my path　✦"
            )}
          </button>
        </form>
        <small className="ai-note">
          AI proposes six high-leverage techniques. You stay in control of every
          one.
        </small>
      </section>
    </div>
  );
}
