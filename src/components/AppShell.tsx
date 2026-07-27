import type { PropsWithChildren } from "react";

interface AppShellProps extends PropsWithChildren {
  userName: string;
  onLogout(): void;
}

export function AppShell({ children, userName, onLogout }: AppShellProps) {
  const initials = userName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
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
        <button className="profile" onClick={onLogout} title="Sign out">
          <span>{initials}</span>
          <span>
            <strong>{userName}</strong>
            <small>Curious beginner</small>
          </span>
          <b>↗</b>
        </button>
      </aside>
      <main id="top">
        <header>
          <a className="brand" href="#top">
            <b>S</b>SkillSprout
          </a>
          <button onClick={onLogout} aria-label="Sign out">
            {initials}
          </button>
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
