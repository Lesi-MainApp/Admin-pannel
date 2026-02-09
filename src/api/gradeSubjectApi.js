import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

export const gradeSubjectApi = createApi({
  reducerPath: "gradeSubjectApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BACKEND_URL}/api/grade`,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Grades", "Subjects", "Streams", "StreamSubjects"],
  endpoints: (builder) => ({
    // -----------------------------
    // GRADES
    // -----------------------------
    getGrades: builder.query({
      query: () => "/grades",
      providesTags: (result) =>
        result?.grades
          ? [
              { type: "Grades", id: "LIST" },
              ...result.grades.map((g) => ({ type: "Grades", id: g._id })),
            ]
          : [{ type: "Grades", id: "LIST" }],
    }),

    createGrade: builder.mutation({
      query: (payload) => ({
        url: "/grade",
        method: "POST",
        body: payload, // { grade }
      }),
      invalidatesTags: [{ type: "Grades", id: "LIST" }],
    }),

    deleteGrade: builder.mutation({
      query: ({ gradeId }) => ({
        url: `/grade/${gradeId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Grades", id: "LIST" }],
    }),

    // -----------------------------
    // SUBJECTS (Grades 1-11)
    // -----------------------------
    getSubjectsByGrade: builder.query({
      query: (gradeId) => `/subjects/${gradeId}`,
      providesTags: (result, err, gradeId) => [{ type: "Subjects", id: `LIST-${gradeId}` }],
    }),

    createSubject: builder.mutation({
      query: (payload) => ({
        url: "/subject",
        method: "POST",
        body: payload, // { gradeId, subject }
      }),
      invalidatesTags: (res, err, arg) => [{ type: "Subjects", id: `LIST-${arg.gradeId}` }],
    }),

    updateSubject: builder.mutation({
      query: ({ gradeId, subjectId, subject }) => ({
        url: `/subject/${gradeId}/${subjectId}`,
        method: "PATCH",
        body: { subject },
      }),
      invalidatesTags: (res, err, arg) => [{ type: "Subjects", id: `LIST-${arg.gradeId}` }],
    }),

    deleteSubject: builder.mutation({
      query: ({ gradeId, subjectId }) => ({
        url: `/subject/${gradeId}/${subjectId}`,
        method: "DELETE",
      }),
      invalidatesTags: (res, err, arg) => [{ type: "Subjects", id: `LIST-${arg.gradeId}` }],
    }),

    // -----------------------------
    // STREAMS (Grades 12-13)
    // -----------------------------
    getStreamsByGrade: builder.query({
      query: (gradeId) => `/streams/${gradeId}`,
      providesTags: (result, err, gradeId) => [{ type: "Streams", id: `LIST-${gradeId}` }],
    }),

    createStream: builder.mutation({
      query: (payload) => ({
        url: "/stream",
        method: "POST",
        body: payload, // { gradeId, stream }
      }),
      invalidatesTags: (res, err, arg) => [{ type: "Streams", id: `LIST-${arg.gradeId}` }],
    }),

    updateStream: builder.mutation({
      query: ({ gradeId, streamId, stream }) => ({
        url: `/stream/${gradeId}/${streamId}`,
        method: "PATCH",
        body: { stream },
      }),
      invalidatesTags: (res, err, arg) => [{ type: "Streams", id: `LIST-${arg.gradeId}` }],
    }),

    deleteStream: builder.mutation({
      query: ({ gradeId, streamId }) => ({
        url: `/stream/${gradeId}/${streamId}`,
        method: "DELETE",
      }),
      invalidatesTags: (res, err, arg) => [{ type: "Streams", id: `LIST-${arg.gradeId}` }],
    }),

    // -----------------------------
    // STREAM SUBJECTS (Grades 12-13)
    // -----------------------------
    getStreamSubjects: builder.query({
      query: ({ gradeId, streamId }) => `/stream/subjects/${gradeId}/${streamId}`,
      providesTags: (result, err, arg) => [
        { type: "StreamSubjects", id: `LIST-${arg.gradeId}-${arg.streamId}` },
      ],
    }),

    createStreamSubject: builder.mutation({
      query: (payload) => ({
        url: "/stream/subject",
        method: "POST",
        body: payload, // { gradeId, streamId, subject }
      }),
      invalidatesTags: (res, err, arg) => [
        { type: "StreamSubjects", id: `LIST-${arg.gradeId}-${arg.streamId}` },
      ],
    }),

    updateStreamSubject: builder.mutation({
      query: ({ gradeId, streamId, subjectId, subject }) => ({
        url: `/stream/subject/${gradeId}/${streamId}/${subjectId}`,
        method: "PATCH",
        body: { subject },
      }),
      invalidatesTags: (res, err, arg) => [
        { type: "StreamSubjects", id: `LIST-${arg.gradeId}-${arg.streamId}` },
      ],
    }),

    deleteStreamSubject: builder.mutation({
      query: ({ gradeId, streamId, subjectId }) => ({
        url: `/stream/subject/${gradeId}/${streamId}/${subjectId}`,
        method: "DELETE",
      }),
      invalidatesTags: (res, err, arg) => [
        { type: "StreamSubjects", id: `LIST-${arg.gradeId}-${arg.streamId}` },
      ],
    }),
  }),
});

export const {
  useGetGradesQuery,
  useCreateGradeMutation,
  useDeleteGradeMutation,

  useGetSubjectsByGradeQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,

  useGetStreamsByGradeQuery,
  useCreateStreamMutation,
  useUpdateStreamMutation,
  useDeleteStreamMutation,

  useGetStreamSubjectsQuery,
  useCreateStreamSubjectMutation,
  useUpdateStreamSubjectMutation,
  useDeleteStreamSubjectMutation,
} = gradeSubjectApi;
