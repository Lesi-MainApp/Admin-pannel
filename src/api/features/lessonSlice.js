// src/api/features/lessonSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedClassId: "",
};

const lessonSlice = createSlice({
  name: "lessonUi",
  initialState,
  reducers: {
    setSelectedClassId: (state, action) => {
      state.selectedClassId = action.payload || "";
    },
    resetLessonUi: (state) => {
      state.selectedClassId = "";
    },
  },
});

export const { setSelectedClassId, resetLessonUi } = lessonSlice.actions;
export default lessonSlice.reducer;
