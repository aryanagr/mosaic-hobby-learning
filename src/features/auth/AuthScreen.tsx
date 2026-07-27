import { useState, type FormEvent } from "react";
import {
  loginUser,
  registerUser,
  type AuthUser,
  type OnboardingProfile,
} from "./auth-api";

export function AuthScreen({
  onAuthenticated,
}: {
  onAuthenticated(user: AuthUser, isNew: boolean): void;
}) {
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<OnboardingProfile>({
    hobby: "Guitar",
    experience: "some",
    goal: "Play three songs confidently at our next campfire",
    weeklyMinutes: 60,
    preferredFormat: "practice",
  });

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      const user =
        mode === "signup"
          ? await registerUser({
              name: String(data.get("name")),
              email: String(data.get("email")),
              password: String(data.get("password")),
              onboarding: profile,
            })
          : await loginUser(
              String(data.get("email")),
              String(data.get("password")),
            );
      onAuthenticated(user, mode === "signup");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-story">
        <a className="brand" href="#top">
          <b>S</b>SkillSprout
        </a>
        <p className="kicker">A PATH BUILT AROUND YOU</p>
        <h1>Grow a hobby into something you can actually do.</h1>
        <p>
          Tell us the moment you want to unlock. We’ll remove the noise and
          build the smallest useful path to get there.
        </p>
        <div className="auth-points">
          <span>✦ Personal learning path</span>
          <span>✦ Six focused techniques</span>
          <span>✦ Progress that feels achievable</span>
        </div>
      </section>
      <section className="auth-panel">
        <div className="auth-card">
          <div className="auth-tabs" role="tablist">
            <button
              className={mode === "signup" ? "active" : ""}
              onClick={() => setMode("signup")}
            >
              Create account
            </button>
            <button
              className={mode === "signin" ? "active" : ""}
              onClick={() => setMode("signin")}
            >
              Sign in
            </button>
          </div>
          <h2>
            {mode === "signup" ? "Let’s design your path." : "Welcome back."}
          </h2>
          <p>
            {mode === "signup"
              ? "A few details make every recommendation more useful."
              : "Continue where you left off."}
          </p>
          <form onSubmit={submit}>
            {mode === "signup" && (
              <label>
                Your name
                <input name="name" required minLength={2} autoComplete="name" />
              </label>
            )}
            <label>
              Email
              <input name="email" type="email" required autoComplete="email" />
            </label>
            <label>
              Password
              <input
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
              />
            </label>
            {mode === "signup" && (
              <>
                <div className="auth-divider">
                  <span>Personalize my path</span>
                </div>
                <label>
                  What hobby do you want to grow?
                  <input
                    value={profile.hobby}
                    onChange={(event) =>
                      setProfile({ ...profile, hobby: event.target.value })
                    }
                    required
                    minLength={2}
                  />
                </label>
                <label>
                  What moment do you want to unlock?
                  <textarea
                    value={profile.goal}
                    onChange={(event) =>
                      setProfile({ ...profile, goal: event.target.value })
                    }
                    required
                    minLength={8}
                  />
                </label>
                <div className="auth-row">
                  <label>
                    Your experience
                    <select
                      value={profile.experience}
                      onChange={(event) =>
                        setProfile({
                          ...profile,
                          experience: event.target
                            .value as OnboardingProfile["experience"],
                        })
                      }
                    >
                      <option value="new">Completely new</option>
                      <option value="some">Know the basics</option>
                      <option value="returning">Coming back</option>
                    </select>
                  </label>
                  <label>
                    Minutes per week
                    <input
                      type="number"
                      min={10}
                      max={300}
                      value={profile.weeklyMinutes}
                      onChange={(event) =>
                        setProfile({
                          ...profile,
                          weeklyMinutes: Number(event.target.value),
                        })
                      }
                    />
                  </label>
                </div>
                <label>
                  How do you learn best?
                  <select
                    value={profile.preferredFormat}
                    onChange={(event) =>
                      setProfile({
                        ...profile,
                        preferredFormat: event.target
                          .value as OnboardingProfile["preferredFormat"],
                      })
                    }
                  >
                    <option value="practice">Hands-on practice</option>
                    <option value="watch">Short videos</option>
                    <option value="read">Concise articles</option>
                    <option value="listen">Audio guidance</option>
                  </select>
                </label>
              </>
            )}
            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}
            <button className="primary auth-submit" disabled={busy}>
              {busy
                ? "Preparing…"
                : mode === "signup"
                  ? "Create my path ✦"
                  : "Sign in →"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
