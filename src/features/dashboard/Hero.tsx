interface HeroProps {
  title: string;
  promise: string;
  progress: number;
  onContinue(): void;
  onOpenStudio(): void;
}

export function Hero({
  title,
  promise,
  progress,
  onContinue,
  onOpenStudio,
}: HeroProps) {
  return (
    <section className="hero">
      <div>
        <p className="kicker">YOUR MINIMUM VIABLE MASTERY</p>
        <h1>
          <em>{title}</em>
        </h1>
        <p>{promise}</p>
        <div className="actions">
          <button className="primary" onClick={onContinue}>
            Continue learning　→
          </button>
          <button className="lab-button" onClick={onOpenStudio}>
            ✦ Reimagine path
          </button>
        </div>
      </div>
      <div className="orbit" aria-label={`${progress}% complete`}>
        <svg viewBox="0 0 180 180">
          <circle cx="90" cy="90" r="78" />
          <circle
            className="meter"
            cx="90"
            cy="90"
            r="78"
            style={{ strokeDashoffset: 490 - (490 * progress) / 100 }}
          />
        </svg>
        <div>
          <strong>{progress}%</strong>
          <span>complete</span>
        </div>
        <i>✦</i>
      </div>
    </section>
  );
}
