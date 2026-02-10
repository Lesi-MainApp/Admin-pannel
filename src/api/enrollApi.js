import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

export const enrollApi = createApi({
  reducerPath: "enrollApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BACKEND_URL}/api/enroll`,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Enroll"],
  endpoints: (builder) => ({
    // student
    requestEnroll: builder.mutation({
      query: (body) => ({
        url: "/request",
        method: "POST",
        body, // { classId, studentName, studentPhone }
      }),
      invalidatesTags: ["Enroll"],
    }),

    getMyEnrollRequests: builder.query({
      query: () => "/my",
      providesTags: ["Enroll"],
    }),

    // admin
    getPendingEnrollRequests: builder.query({
      query: () => "/pending",
      providesTags: ["Enroll"],
    }),

    approveEnroll: builder.mutation({
      query: (enrollId) => ({
        url: `/approve/${enrollId}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Enroll"],
    }),

    rejectEnroll: builder.mutation({
      query: (enrollId) => ({
        url: `/reject/${enrollId}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Enroll"],
    }),
  }),
});

export const {
  useRequestEnrollMutation,
  useGetMyEnrollRequestsQuery,
  useGetPendingEnrollRequestsQuery,
  useApproveEnrollMutation,
  useRejectEnrollMutation,
} = enrollApi;
