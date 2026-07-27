import type { Achievement } from "./gamification";

export function Celebration({
  achievement,
  onClose,
}: {
  achievement: Achievement;
  onClose(): void;
}) {
  return (
    <div
      className="celebration"
      role="dialog"
      aria-modal="true"
      aria-labelledby="celebration-title"
    >
      <div className="confetti" aria-hidden="true">
        {Array.from({ length: 18 }, (_, index) => (
          <i key={index} />
        ))}
      </div>
      <section>
        <span className="celebration-icon" aria-hidden="true">
          {achievement.icon}
        </span>
        <p className="kicker">MILESTONE UNLOCKED</p>
        <h2 id="celebration-title">{achievement.title}</h2>
        <p>
          {achievement.description}. Keep growing—your next skill is waiting.
        </p>
        <strong>+120 XP</strong>
        <button className="primary" onClick={onClose} autoFocus>
          Keep learning →
        </button>
      </section>
    </div>
  );
}
