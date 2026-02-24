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
  tagTypes: ["Students", "Student", "StudentOptions"],
  endpoints: (builder) => ({
    getStudentOptions: builder.query({
      query: () => ({ url: "options", method: "GET" }),
      providesTags: ["StudentOptions"],
    }),

    // ✅ params empty => GET ALL STUDENTS
    getStudents: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== null && String(v).trim() !== "") qs.set(k, v);
        });
        const q = qs.toString();
        return { url: q ? `?${q}` : "", method: "GET" };
      },
      providesTags: (res) =>
        res?.rows
          ? [
              { type: "Students", id: "LIST" },
              ...res.rows.map((s) => ({ type: "Student", id: s._id })),
            ]
          : [{ type: "Students", id: "LIST" }],
    }),

    getStudentById: builder.query({
      query: (id) => ({ url: `${id}`, method: "GET" }),
      providesTags: (res, err, id) => [{ type: "Student", id }],
    }),

    updateStudent: builder.mutation({
      query: ({ id, body }) => ({
        url: `${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (res, err, arg) => [
        { type: "Student", id: arg?.id },
        { type: "Students", id: "LIST" },
      ],
    }),

    banStudent: builder.mutation({
      query: (id) => ({ url: `${id}/ban`, method: "PATCH" }),
      invalidatesTags: (res, err, id) => [
        { type: "Student", id },
        { type: "Students", id: "LIST" },
      ],
    }),

    unbanStudent: builder.mutation({
      query: (id) => ({ url: `${id}/unban`, method: "PATCH" }),
      invalidatesTags: (res, err, id) => [
        { type: "Student", id },
        { type: "Students", id: "LIST" },
      ],
    }),

    deleteStudent: builder.mutation({
      query: (id) => ({ url: `${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Students", id: "LIST" }],
    }),
  }),
});

export const {
  useGetStudentOptionsQuery,
  useGetStudentsQuery,
  useGetStudentByIdQuery,
  useUpdateStudentMutation,
  useBanStudentMutation,
  useUnbanStudentMutation,
  useDeleteStudentMutation,
} = studentApi;