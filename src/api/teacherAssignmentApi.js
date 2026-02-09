// src/api/teacherAssignmentApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

export const teacherAssignmentApi = createApi({
  reducerPath: "teacherAssignmentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BACKEND_URL}/api/teacher`,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const reduxToken = getState()?.auth?.token;
      const storageToken = localStorage.getItem("token");
      const token = reduxToken || storageToken;

      if (token) headers.set("Authorization", `Bearer ${token}`);
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Teachers", "TeacherFormData", "TeacherAssign"],
  endpoints: (builder) => ({
    // GET /api/teacher?status=pending|approved|all
    getTeachers: builder.query({
      query: ({ status = "all" } = {}) => `/?status=${status}`,
      providesTags: (result) =>
        result?.teachers
          ? [
              { type: "Teachers", id: "LIST" },
              ...result.teachers.map((t) => ({ type: "Teachers", id: t._id })),
            ]
          : [{ type: "Teachers", id: "LIST" }],
    }),

    // GET /api/teacher/:teacherId/form-data
    getTeacherFormData: builder.query({
      query: (teacherId) => `/${teacherId}/form-data`,
      providesTags: (result, error, teacherId) => [
        { type: "TeacherFormData", id: teacherId },
      ],
    }),

    // POST /api/teacher/:teacherId/assign  (append+merge)
    assignTeacher: builder.mutation({
      query: ({ teacherId, body }) => ({
        url: `/${teacherId}/assign`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { teacherId }) => [
        { type: "TeacherFormData", id: teacherId },
        { type: "TeacherAssign", id: teacherId },
        { type: "Teachers", id: "LIST" },
      ],
    }),

    // ✅ PUT /api/teacher/:teacherId/assign  (replace - EDIT)
    replaceTeacherAssignments: builder.mutation({
      query: ({ teacherId, body }) => ({
        url: `/${teacherId}/assign`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { teacherId }) => [
        { type: "TeacherFormData", id: teacherId },
        { type: "TeacherAssign", id: teacherId },
        { type: "Teachers", id: "LIST" },
      ],
    }),

    // ✅ PATCH /api/teacher/:teacherId/access  (disable/enable)
    setTeacherAccess: builder.mutation({
      query: ({ teacherId, isActive }) => ({
        url: `/${teacherId}/access`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: [{ type: "Teachers", id: "LIST" }],
    }),
  }),
});

export const {
  useGetTeachersQuery,
  useGetTeacherFormDataQuery,
  useAssignTeacherMutation,
  useReplaceTeacherAssignmentsMutation,
  useSetTeacherAccessMutation,
} = teacherAssignmentApi;
