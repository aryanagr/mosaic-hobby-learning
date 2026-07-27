import { lazy, Suspense, useEffect, useState } from "react";
import type {
  LearningPlan,
  Technique,
  TechniqueStatus,
} from "../shared/learning-plan";
import { AppShell } from "./components/AppShell";
import { Hero } from "./features/dashboard/Hero";
import { ProgressSummary } from "./features/dashboard/ProgressSummary";
import { LearningPath } from "./features/learning-path/LearningPath";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import {
  replacePlan,
  restoreSeedPlan,
  updateTechniqueStatus,
} from "./store/learning-plan-slice";
import {
  selectActiveTechnique,
  selectPathMetrics,
  selectPlan,
} from "./store/selectors";
import "./App.css";
import { AuthScreen } from "./features/auth/AuthScreen";
import {
  getCurrentUser,
  logoutUser,
  type AuthUser,
} from "./features/auth/auth-api";
import { createLearningPlan } from "./services/plans-api";
import { Loader } from "./components/Loader";
import { AchievementShelf } from "./features/gamification/AchievementShelf";
import {
  calculateGamification,
  findNewAchievement,
  type Achievement,
} from "./features/gamification/gamification";

const LessonSheet = lazy(() =>
  import("./features/lesson/LessonSheet").then((module) => ({
    default: module.LessonSheet,
  })),
);
const PathStudio = lazy(() =>
  import("./features/path-studio/PathStudio").then((module) => ({
    default: module.PathStudio,
  })),
);
const Celebration = lazy(() =>
  import("./features/gamification/Celebration").then((module) => ({
    default: module.Celebration,
  })),
);

function DeferredOverlay({ label }: { label: string }) {
  return (
    <div className="backdrop deferred-loader" aria-live="polite">
      <Loader size="large" label={label} />
    </div>
  );
}

export default function App() {
  const dispatch = useAppDispatch();
  const plan = useAppSelector(selectPlan);
  const metrics = useAppSelector(selectPathMetrics);
  const activeTechnique = useAppSelector(selectActiveTechnique);
  const [selected, setSelected] = useState<Technique | null>(null);
  const [studioOpen, setStudioOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [celebration, setCelebration] = useState<Achievement | null>(null);
  const gamification = calculateGamification(plan.techniques);

  useEffect(() => {
    void getCurrentUser().then((currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
  }, []);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3_000);
  };
  const changeStatus = (status: TechniqueStatus) => {
    if (!selected) return;
    const before = calculateGamification(plan.techniques);
    const nextTechniques = plan.techniques.map((technique) =>
      technique.id === selected.id ? { ...technique, status } : technique,
    );
    const earned = findNewAchievement(
      before,
      calculateGamification(nextTechniques),
    );
    dispatch(updateTechniqueStatus({ id: selected.id, status }));
    setSelected(null);
    if (earned) setCelebration(earned);
    showNotice(
      status === "done"
        ? "Technique mastered — nice work."
        : "Removed from your path. You can restore it anytime.",
    );
  };
  const acceptPlan = (newPlan: LearningPlan) => {
    dispatch(replacePlan(newPlan));
    setStudioOpen(false);
    showNotice("Your minimum viable mastery path is ready.");
  };

  const authenticated = async (authenticatedUser: AuthUser, isNew: boolean) => {
    setUser(authenticatedUser);
    if (!isNew) return;
    const profile = authenticatedUser.onboarding;
    try {
      acceptPlan(
        await createLearningPlan({
          hobby: profile.hobby,
          moment: profile.goal,
          level: profile.experience,
          minutes: profile.weeklyMinutes,
          avoid: `Prefer ${profile.preferredFormat} content`,
        }),
      );
    } catch {
      showNotice("Account created. You can personalize your path anytime.");
    }
  };

  if (!authReady)
    return (
      <div className="auth-loading">
        <Loader size="large" label="Growing your workspace…" />
      </div>
    );
  if (!user) return <AuthScreen onAuthenticated={authenticated} />;

  return (
    <AppShell
      userName={user.name}
      onLogout={() => void logoutUser().finally(() => setUser(null))}
    >
      <Hero
        title={plan.title}
        promise={plan.promise}
        progress={metrics.progress}
        onContinue={() => activeTechnique && setSelected(activeTechnique)}
        onOpenStudio={() => setStudioOpen(true)}
      />
      <ProgressSummary
        mastered={metrics.mastered}
        total={metrics.visible.length}
      />
      <AchievementShelf progress={gamification} />
      <LearningPath
        techniques={metrics.visible}
        skipped={metrics.skipped}
        onSelect={setSelected}
        onRestore={() => dispatch(restoreSeedPlan())}
      />
      {studioOpen && (
        <Suspense fallback={<DeferredOverlay label="Opening Path Studio…" />}>
          <PathStudio
            onClose={() => setStudioOpen(false)}
            onCreated={acceptPlan}
            onError={showNotice}
          />
        </Suspense>
      )}{" "}
      {selected && (
        <Suspense fallback={<DeferredOverlay label="Opening lesson…" />}>
          <LessonSheet
            technique={selected}
            onClose={() => setSelected(null)}
            onStatusChange={changeStatus}
          />
        </Suspense>
      )}{" "}
      {notice && (
        <div className="toast" role="status">
          {notice}
        </div>
      )}
      {celebration && (
        <Suspense fallback={null}>
          <Celebration
            achievement={celebration}
            onClose={() => setCelebration(null)}
          />
        </Suspense>
      )}
    </AppShell>
  );
}
