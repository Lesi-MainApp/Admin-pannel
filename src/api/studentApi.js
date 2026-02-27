import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

export const studentApi = createApi({
  reducerPath: "studentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BACKEND_URL}/api/student`,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Students"],
  endpoints: (builder) => ({
    getStudentOptions: builder.query({
      query: () => ({
        url: "/options",
        method: "GET",
      }),
    }),

    getStudents: builder.query({
      query: (params = {}) => {
        const search = new URLSearchParams();

        if (params.status) search.set("status", params.status);
        if (params.email) search.set("email", params.email);
        if (params.district) search.set("district", params.district);
        if (params.level) search.set("level", params.level);
        if (params.grade) search.set("grade", params.grade);
        if (params.classId) search.set("classId", params.classId);
        if (params.page) search.set("page", String(params.page));
        if (params.limit) search.set("limit", String(params.limit));

        const queryString = search.toString();

        return {
          url: queryString ? `/?${queryString}` : "/",
          method: "GET",
        };
      },
      providesTags: ["Students"],
    }),

    banStudent: builder.mutation({
      query: (id) => ({
        url: `/${id}/ban`,
        method: "PATCH",
      }),
      invalidatesTags: ["Students"],
    }),

    unbanStudent: builder.mutation({
      query: (id) => ({
        url: `/${id}/unban`,
        method: "PATCH",
      }),
      invalidatesTags: ["Students"],
    }),
  }),
});

export const {
  useGetStudentOptionsQuery,
  useGetStudentsQuery,
  useBanStudentMutation,
  useUnbanStudentMutation,
} = studentApi;