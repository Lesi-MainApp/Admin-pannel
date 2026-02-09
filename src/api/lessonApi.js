// src/api/lessonApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

export const lessonApi = createApi({
  reducerPath: "lessonApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BACKEND_URL}/api/lesson`,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Lesson"],
  endpoints: (builder) => ({
    // ✅ admin only
    getAllLessons: builder.query({
      query: () => ({
        url: "/",
        method: "GET",
      }),
      providesTags: (result) =>
        result?.lessons
          ? [
              ...result.lessons.map((l) => ({ type: "Lesson", id: l._id })),
              { type: "Lesson", id: "LIST" },
            ]
          : [{ type: "Lesson", id: "LIST" }],
    }),

    // ✅ admin only
    createLesson: builder.mutation({
      query: (payload) => ({
        url: "/",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [{ type: "Lesson", id: "LIST" }],
    }),

    // ✅ admin only
    updateLessonById: builder.mutation({
      query: ({ lessonId, body }) => ({
        url: `/${lessonId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Lesson", id: arg?.lessonId },
        { type: "Lesson", id: "LIST" },
      ],
    }),

    // ✅ admin only
    deleteLessonById: builder.mutation({
      query: (lessonId) => ({
        url: `/${lessonId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Lesson", id: arg },
        { type: "Lesson", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllLessonsQuery,
  useCreateLessonMutation,
  useUpdateLessonByIdMutation,
  useDeleteLessonByIdMutation,
} = lessonApi;
