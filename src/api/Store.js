// src/api/store.js
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

// ✅ NEW LIVE
import liveUiReducer from "./features/liveSlice";
import { liveApi } from "./liveApi";
import enrollUiReducer from "./features/enrollSlice";
import { enrollApi } from "./enrollApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    gradeSubject: gradeSubjectReducer,
    teacher: teacherReducer,
    classUi: classUiReducer,
    lessonUi: lessonUiReducer,
    enrollUi: enrollUiReducer,

    // ✅ NEW
    liveUi: liveUiReducer,

    [authApi.reducerPath]: authApi.reducer,
    [gradeSubjectApi.reducerPath]: gradeSubjectApi.reducer,
    [teacherApi.reducerPath]: teacherApi.reducer,
    [classApi.reducerPath]: classApi.reducer,
    [teacherAssignmentApi.reducerPath]: teacherAssignmentApi.reducer,
    [lessonApi.reducerPath]: lessonApi.reducer,
    [enrollApi.reducerPath]: enrollApi.reducer,
    // ✅ NEW
    [liveApi.reducerPath]: liveApi.reducer,
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
      // ✅ NEW
      liveApi.middleware
    ),
});

setupListeners(store.dispatch);
