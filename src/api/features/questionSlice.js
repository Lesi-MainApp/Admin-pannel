// frontend/src/features/questionSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentPaperId: null,
};

const questionSlice = createSlice({
  name: "questionUi",
  initialState,
  reducers: {
    setCurrentPaperId: (state, action) => {
      state.currentPaperId = action.payload || null;
    },
    clearCurrentPaperId: (state) => {
      state.currentPaperId = null;
    },
  },
});

export const { setCurrentPaperId, clearCurrentPaperId } = questionSlice.actions;
export default questionSlice.reducer;
