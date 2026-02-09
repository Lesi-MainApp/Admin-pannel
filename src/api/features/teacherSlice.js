import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  search: "",
};

const teacherSlice = createSlice({
  name: "teacher",
  initialState,
  reducers: {
    setSearch: (state, action) => {
      state.search = action.payload || "";
    },
    resetTeacherUi: () => initialState,
  },
});

export const { setSearch, resetTeacherUi } = teacherSlice.actions;
export default teacherSlice.reducer;
