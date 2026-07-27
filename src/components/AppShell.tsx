import type { PropsWithChildren } from "react";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="app-shell">
      <aside>
        <a className="brand" href="#top">
          <b>S</b>SkillSprout
        </a>
        <nav>
          <a className="active" href="#path">
            ⌂　My path
          </a>
          <a href="#discover">◇　Discover</a>
          <a href="#progress">↗　Progress</a>
        </nav>
        <div className="note">
          <i>✦</i>
          <strong>Keep it small</strong>
          <p>20 focused minutes beats two hours of browsing.</p>
        </div>
        <button className="profile">
          <span>AG</span>
          <span>
            <strong>Aryan</strong>
            <small>Curious beginner</small>
          </span>
          <b>•••</b>
        </button>
      </aside>
      <main id="top">
        <header>
          <a className="brand" href="#top">
            <b>S</b>SkillSprout
          </a>
          <button>AG</button>
        </header>
        {children}
      </main>
      <nav className="bottom">
        <a href="#path">
          ⌂<span>My path</span>
        </a>
        <a href="#discover">
          ◇<span>Discover</span>
        </a>
        <a href="#progress">
          ↗<span>Progress</span>
        </a>
      </nav>
    </div>
  );
}
