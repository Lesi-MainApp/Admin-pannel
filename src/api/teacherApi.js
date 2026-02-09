import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

export const teacherApi = createApi({
  reducerPath: "teacherApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BACKEND_URL}/api/user`,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Teachers"],
  endpoints: (builder) => ({
    getAllUsers: builder.query({
      query: () => "/",
      providesTags: (result) =>
        result?.users
          ? [
              { type: "Teachers", id: "LIST" },
              ...result.users.map((u) => ({ type: "Teachers", id: u._id })),
            ]
          : [{ type: "Teachers", id: "LIST" }],
    }),

    approveTeacher: builder.mutation({
      query: (id) => ({
        url: `/${id}/approve-teacher`,
        method: "PATCH",
      }),
      invalidatesTags: [{ type: "Teachers", id: "LIST" }],
    }),

    rejectTeacher: builder.mutation({
      query: (id) => ({
        url: `/${id}/reject-teacher`,
        method: "PATCH",
      }),
      invalidatesTags: [{ type: "Teachers", id: "LIST" }],
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useApproveTeacherMutation,
  useRejectTeacherMutation,
} = teacherApi;
