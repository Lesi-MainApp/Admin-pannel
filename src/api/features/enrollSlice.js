import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  modalOpen: false,
  selectedClassId: null,
  studentName: "",
  studentPhone: "",
};

const enrollSlice = createSlice({
  name: "enrollUi",
  initialState,
  reducers: {
    openEnrollModal: (state, action) => {
      state.modalOpen = true;
      state.selectedClassId = action.payload?.classId || null;
      state.studentName = action.payload?.studentName || "";
      state.studentPhone = action.payload?.studentPhone || "";
    },
    closeEnrollModal: (state) => {
      state.modalOpen = false;
      state.selectedClassId = null;
      state.studentName = "";
      state.studentPhone = "";
    },
    setEnrollName: (state, action) => {
      state.studentName = String(action.payload || "");
    },
    setEnrollPhone: (state, action) => {
      state.studentPhone = String(action.payload || "");
    },
  },
});

export const { openEnrollModal, closeEnrollModal, setEnrollName, setEnrollPhone } =
  enrollSlice.actions;

export default enrollSlice.reducer;
