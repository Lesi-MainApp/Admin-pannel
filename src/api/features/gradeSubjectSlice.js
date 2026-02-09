import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedGradeId: null,
  selectedGradeNumber: null, // grade.grade (1..13)
  selectedStreamId: null, // for grade 12-13 flow
};

const gradeSubjectSlice = createSlice({
  name: "gradeSubject",
  initialState,
  reducers: {
    setSelectedGrade: (state, action) => {
      const { gradeId, gradeNumber } = action.payload || {};
      state.selectedGradeId = gradeId || null;
      state.selectedGradeNumber = gradeNumber ?? null;

      // whenever grade changes, reset stream selection
      state.selectedStreamId = null;
    },
    setSelectedStream: (state, action) => {
      state.selectedStreamId = action.payload?.streamId || null;
    },
    resetGradeFlow: () => initialState,
  },
});

export const { setSelectedGrade, setSelectedStream, resetGradeFlow } = gradeSubjectSlice.actions;
export default gradeSubjectSlice.reducer;
