import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import authReducer from "./features/authSlice";
import { authApi } from "./authApi";

import gradeSubjectReducer from "./features/gradeSubjectSlice";
import { gradeSubjectApi } from "./gradeSubjectApi";

import teacherReducer from "./features/teacherSlice";
import { teacherApi } from "./teacherApi";

import { teacherAssignmentApi } from "./teacherAssignmentApi";

import classUiReducer from "./features/classSlice";
import { classApi } from "./classApi";

import lessonUiReducer from "./features/lessonSlice";
import { lessonApi } from "./lessonApi";

import liveUiReducer from "./features/liveSlice";
import { liveApi } from "./liveApi";

import enrollUiReducer from "./features/enrollSlice";
import { enrollApi } from "./enrollApi";

import paperReducer from "./features/paperSlice";
import { paperApi } from "./paperApi";

import questionUiReducer from "./features/questionSlice";
import { questionApi } from "./questionApi";

import { uploadApi } from "./uploadApi";

// ✅ STUDENT (from src/api)
import studentReducer from "../api/features/studentSlice";
import { studentApi } from "../api/studentApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    gradeSubject: gradeSubjectReducer,
    teacher: teacherReducer,
    classUi: classUiReducer,
    lessonUi: lessonUiReducer,
    enrollUi: enrollUiReducer,
    liveUi: liveUiReducer,

    paper: paperReducer,
    questionUi: questionUiReducer,

    // ✅ student filter state
    student: studentReducer,

    [authApi.reducerPath]: authApi.reducer,
    [gradeSubjectApi.reducerPath]: gradeSubjectApi.reducer,
    [teacherApi.reducerPath]: teacherApi.reducer,
    [classApi.reducerPath]: classApi.reducer,
    [teacherAssignmentApi.reducerPath]: teacherAssignmentApi.reducer,
    [lessonApi.reducerPath]: lessonApi.reducer,
    [enrollApi.reducerPath]: enrollApi.reducer,
    [liveApi.reducerPath]: liveApi.reducer,

    [paperApi.reducerPath]: paperApi.reducer,
    [questionApi.reducerPath]: questionApi.reducer,
    [uploadApi.reducerPath]: uploadApi.reducer,

    // ✅ student api
    [studentApi.reducerPath]: studentApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      gradeSubjectApi.middleware,
      teacherApi.middleware,
      classApi.middleware,
      teacherAssignmentApi.middleware,
      lessonApi.middleware,
      enrollApi.middleware,
      liveApi.middleware,
      paperApi.middleware,
      questionApi.middleware,
      uploadApi.middleware,

      // ✅ student middleware
      studentApi.middleware
    ),
});

setupListeners(store.dispatch);