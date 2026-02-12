import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || "http://localhost:8080",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
  credentials: "include",
});

export const uploadApi = createApi({
  reducerPath: "uploadApi",
  baseQuery,
  tagTypes: ["Upload"],
  endpoints: (builder) => ({
    // ✅ POST /api/upload/question-image
    uploadQuestionImage: builder.mutation({
      query: (formData) => ({
        url: "/api/upload/question-image",
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

export const { useUploadQuestionImageMutation } = uploadApi;
