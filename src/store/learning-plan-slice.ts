import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  LearningPlan,
  TechniqueStatus,
} from "../../shared/learning-plan.js";
import { seedPlan } from "../domain/seed-plan.js";

export interface LearningPlanState {
  plan: LearningPlan;
}
const initialState: LearningPlanState = { plan: seedPlan };

const learningPlanSlice = createSlice({
  name: "learningPlan",
  initialState,
  reducers: {
    replacePlan(state, action: PayloadAction<LearningPlan>) {
      state.plan = action.payload;
    },
    updateTechniqueStatus(
      state,
      action: PayloadAction<{ id: number; status: TechniqueStatus }>,
    ) {
      const technique = state.plan.techniques.find(
        (item) => item.id === action.payload.id,
      );
      if (technique) technique.status = action.payload.status;
    },
    restoreSeedPlan(state) {
      state.plan = seedPlan;
    },
  },
});

export const { replacePlan, updateTechniqueStatus, restoreSeedPlan } =
  learningPlanSlice.actions;
export const learningPlanReducer = learningPlanSlice.reducer;
