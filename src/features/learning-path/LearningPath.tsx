import type { Technique } from "../../../shared/learning-plan";

const mediumIcons = { watch: "▶", read: "Aa", practice: "♪", listen: "◉" };

interface LearningPathProps {
  techniques: Technique[];
  skipped: number;
  onSelect(technique: Technique): void;
  onRestore(): void;
}

export function LearningPath({
  techniques,
  skipped,
  onSelect,
  onRestore,
}: LearningPathProps) {
  return (
    <section className="path" id="path">
      <div className="path-head">
        <div>
          <p className="kicker">YOUR LEARNING PATH</p>
          <h2>Small steps, in the right order.</h2>
        </div>
        <button>Tune my path ↗</button>
      </div>
      <div className="list">
        {techniques.map((technique, index) => (
          <article
            className={technique.status}
            key={technique.id}
            onClick={() => onSelect(technique)}
          >
            <div className="step">
              <span>{technique.status === "done" ? "✓" : index + 1}</span>
              {index < techniques.length - 1 && <i />}
            </div>
            <div className="card">
              <div className="card-top">
                <p className="kicker">{technique.eyebrow}</p>
                <span className={`medium ${technique.medium}`}>
                  {mediumIcons[technique.medium]}　{technique.medium}
                </span>
              </div>
              <h3>{technique.title}</h3>
              <p>{technique.description}</p>
              <div className="meta">
                <span>◷ {technique.duration} min</span>
                {technique.status !== "ready" && (
                  <b>
                    {technique.status === "done" ? "MASTERED" : "IN PROGRESS"}
                  </b>
                )}
                <button aria-label={`Open ${technique.title}`}>→</button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {skipped > 0 && (
        <button className="restore" onClick={onRestore}>
          ↶ Restore {skipped} skipped technique{skipped > 1 ? "s" : ""}
        </button>
      )}
    </section>
  );
}
