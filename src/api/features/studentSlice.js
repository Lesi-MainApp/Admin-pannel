import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  filters: {
    status: "",
    email: "",
    district: "",
    level: "",
    grade: "",
    classId: "",
    completedCount: "",
    page: 1,
    limit: 20,
  },
};

const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    setStudentFilters: (state, action) => {
      state.filters = { ...state.filters, ...(action.payload || {}) };
    },
    resetStudentFilters: (state) => {
      state.filters = { ...initialState.filters };
    },
  },
});

export const { setStudentFilters, resetStudentFilters } = studentSlice.actions;
export default studentSlice.reducer;