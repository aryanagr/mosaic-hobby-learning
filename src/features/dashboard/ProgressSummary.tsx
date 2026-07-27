export function ProgressSummary({
  mastered,
  total,
}: {
  mastered: number;
  total: number;
}) {
  return (
    <section className="stats" id="progress">
      <div>
        <span>✓</span>
        <p>
          <b>{mastered} mastered</b>
          <small>of {total} techniques</small>
        </p>
      </div>
      <div>
        <span>◷</span>
        <p>
          <b>42 minutes</b>
          <small>practised this week</small>
        </p>
      </div>
      <div>
        <span>⚡</span>
        <p>
          <b>3 day streak</b>
          <small>your best is 5</small>
        </p>
      </div>
    </section>
  );
}
