import type { Technique, TechniqueStatus } from "../../../shared/learning-plan";

const mediumIcons = { watch: "▶", read: "Aa", practice: "♪", listen: "◉" };

interface LessonSheetProps {
  technique: Technique;
  onClose(): void;
  onStatusChange(status: TechniqueStatus): void;
}

export function LessonSheet({
  technique,
  onClose,
  onStatusChange,
}: LessonSheetProps) {
  return (
    <div className="backdrop" onMouseDown={onClose}>
      <section
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lesson-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="close" onClick={onClose} aria-label="Close lesson">
          ×
        </button>
        <div className={`visual ${technique.medium}`}>
          <span>{mediumIcons[technique.medium]}</span>
          <small>
            {technique.medium} • {technique.duration} min
          </small>
        </div>
        <p className="kicker">{technique.eyebrow}</p>
        <h2 id="lesson-title">{technique.title}</h2>
        <p className="desc">{technique.description}</p>
        <div className="why">
          <span>✦</span>
          <p>
            <b>Why this made your path</b>
            {technique.why}
          </p>
        </div>
        <div className="lesson-actions">
          <button
            className="primary"
            onClick={() =>
              onStatusChange(technique.status === "done" ? "active" : "done")
            }
          >
            {technique.status === "done"
              ? "Practise again"
              : "Mark as mastered"}
            　✓
          </button>
          <button onClick={() => onStatusChange("skipped")}>Not for me</button>
        </div>
      </section>
    </div>
  );
}
