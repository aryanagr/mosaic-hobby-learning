import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  configureStore,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { LearningPlan, TechniqueStatus } from "../domain/models";
import { seedPlan } from "../domain/seedPlan";

const storageKey = "skillsprout.mobile.plan.v1";

const planSlice = createSlice({
  name: "learningPlan",
  initialState: { plan: seedPlan },
  reducers: {
    replacePlan(state, action: PayloadAction<LearningPlan>) {
      state.plan = action.payload;
    },
    updateStatus(
      state,
      action: PayloadAction<{ id: number; status: TechniqueStatus }>,
    ) {
      const technique = state.plan.techniques.find(
        (item) => item.id === action.payload.id,
      );
      if (technique) technique.status = action.payload.status;
    },
  },
});

export const store = configureStore({
  reducer: { learningPlan: planSlice.reducer },
});
export const { replacePlan, updateStatus } = planSlice.actions;

let persistedPlan = store.getState().learningPlan.plan;
store.subscribe(() => {
  const next = store.getState().learningPlan.plan;
  if (next !== persistedPlan) {
    persistedPlan = next;
    void AsyncStorage.setItem(storageKey, JSON.stringify(next));
  }
});

export async function restorePlan() {
  const value = await AsyncStorage.getItem(storageKey);
  if (value) store.dispatch(replacePlan(JSON.parse(value) as LearningPlan));
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
