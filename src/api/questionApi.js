// src/api/questionApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

export const questionApi = createApi({
  reducerPath: "questionApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BACKEND_URL}/api/question`,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Question", "PaperQuestions"],
  endpoints: (builder) => ({
    getQuestionsByPaper: builder.query({
      query: (paperId) => ({ url: `/paper/${paperId}`, method: "GET" }),
      providesTags: (res, err, paperId) => [
        { type: "PaperQuestions", id: paperId },
      ],
    }),

    createQuestion: builder.mutation({
      query: (payload) => ({ url: "/", method: "POST", body: payload }),
      invalidatesTags: (res, err, arg) => [
        { type: "PaperQuestions", id: arg.paperId },
      ],
    }),

    updateQuestion: builder.mutation({
      query: ({ questionId, patch }) => ({
        url: `/${questionId}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (res, err, arg) => [{ type: "Question", id: arg.questionId }],
    }),
  }),
});

export const {
  useGetQuestionsByPaperQuery,
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
} = questionApi;
