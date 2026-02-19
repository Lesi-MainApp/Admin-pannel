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
  tagTypes: ["Question"],
  endpoints: (builder) => ({
    getQuestionsByPaper: builder.query({
      query: (paperId) => ({ url: `/paper/${paperId}`, method: "GET" }),
      providesTags: (res) =>
        res?.questions
          ? [
              { type: "Question", id: "LIST" },
              ...res.questions.map((q) => ({ type: "Question", id: q._id })),
            ]
          : [{ type: "Question", id: "LIST" }],
    }),

    createQuestion: builder.mutation({
      query: (payload) => ({ url: `/`, method: "POST", body: payload }),
      invalidatesTags: [{ type: "Question", id: "LIST" }],
    }),

    updateQuestion: builder.mutation({
      query: ({ questionId, patch }) => ({
        url: `/${questionId}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (res, err, arg) => [
        { type: "Question", id: arg.questionId },
        { type: "Question", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetQuestionsByPaperQuery,
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
} = questionApi;
