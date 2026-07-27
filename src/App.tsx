import { useState } from "react";
import type {
  LearningPlan,
  Technique,
  TechniqueStatus,
} from "../shared/learning-plan";
import { AppShell } from "./components/AppShell";
import { Hero } from "./features/dashboard/Hero";
import { ProgressSummary } from "./features/dashboard/ProgressSummary";
import { LearningPath } from "./features/learning-path/LearningPath";
import { LessonSheet } from "./features/lesson/LessonSheet";
import { PathStudio } from "./features/path-studio/PathStudio";
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

export default function App() {
  const dispatch = useAppDispatch();
  const plan = useAppSelector(selectPlan);
  const metrics = useAppSelector(selectPathMetrics);
  const activeTechnique = useAppSelector(selectActiveTechnique);
  const [selected, setSelected] = useState<Technique | null>(null);
  const [studioOpen, setStudioOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3_000);
  };
  const changeStatus = (status: TechniqueStatus) => {
    if (!selected) return;
    dispatch(updateTechniqueStatus({ id: selected.id, status }));
    setSelected(null);
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

  return (
    <AppShell>
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
      <LearningPath
        techniques={metrics.visible}
        skipped={metrics.skipped}
        onSelect={setSelected}
        onRestore={() => dispatch(restoreSeedPlan())}
      />
      {studioOpen && (
        <PathStudio
          onClose={() => setStudioOpen(false)}
          onCreated={acceptPlan}
          onError={showNotice}
        />
      )}{" "}
      {selected && (
        <LessonSheet
          technique={selected}
          onClose={() => setSelected(null)}
          onStatusChange={changeStatus}
        />
      )}{" "}
      {notice && (
        <div className="toast" role="status">
          {notice}
        </div>
      )}
    </AppShell>
  );
}
