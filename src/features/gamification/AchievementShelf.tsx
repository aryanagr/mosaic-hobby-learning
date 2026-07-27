import type { GamificationProgress } from "./gamification";
import { achievements } from "./gamification";

export function AchievementShelf({
  progress,
}: {
  progress: GamificationProgress;
}) {
  const unlockedIds = new Set(progress.unlocked.map((item) => item.id));

  return (
    <section className="rewards" aria-labelledby="rewards-title">
      <div className="reward-level">
        <div>
          <p className="kicker">YOUR GROWTH</p>
          <h2 id="rewards-title">Level {progress.level} learner</h2>
        </div>
        <strong>{progress.xp} XP</strong>
        <div
          className="xp-track"
          role="progressbar"
          aria-label="Experience toward next level"
          aria-valuemin={0}
          aria-valuemax={300}
          aria-valuenow={progress.levelProgress}
        >
          <i style={{ width: `${(progress.levelProgress / 300) * 100}%` }} />
        </div>
        <small>{300 - progress.levelProgress} XP to the next level</small>
      </div>
      <div className="badges" aria-label="Milestones">
        {achievements.map((achievement) => {
          const unlocked = unlockedIds.has(achievement.id);
          return (
            <article
              className={unlocked ? "earned" : "locked"}
              key={achievement.id}
            >
              <span aria-hidden="true">
                {unlocked ? achievement.icon : "◇"}
              </span>
              <div>
                <strong>{achievement.title}</strong>
                <small>{achievement.description}</small>
              </div>
              <b>{unlocked ? "EARNED" : "LOCKED"}</b>
            </article>
          );
        })}
      </div>
    </section>
  );
}
