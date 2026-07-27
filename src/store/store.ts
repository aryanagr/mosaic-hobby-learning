import { configureStore } from "@reduxjs/toolkit";
import { seedPlan } from "../domain/seed-plan";
import { readPlan, writePlan } from "../services/path-storage";
import { learningPlanReducer } from "./learning-plan-slice";

export const store = configureStore({
  reducer: { learningPlan: learningPlanReducer },
  preloadedState: { learningPlan: { plan: readPlan(seedPlan) } },
});

let lastPersistedPlan = store.getState().learningPlan.plan;
store.subscribe(() => {
  const nextPlan = store.getState().learningPlan.plan;
  if (nextPlan !== lastPersistedPlan) {
    lastPersistedPlan = nextPlan;
    writePlan(nextPlan);
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
