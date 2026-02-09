// src/api/liveApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

export const liveApi = createApi({
  reducerPath: "liveApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BACKEND_URL}/api/live`,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Live"],
  endpoints: (builder) => ({
    getAllLives: builder.query({
      query: () => ({ url: "/", method: "GET" }),
      providesTags: (res) =>
        res?.lives
          ? [
              ...res.lives.map((x) => ({ type: "Live", id: x._id })),
              { type: "Live", id: "LIST" },
            ]
          : [{ type: "Live", id: "LIST" }],
    }),

    getLiveById: builder.query({
      query: (id) => ({ url: `/${id}`, method: "GET" }),
      providesTags: (res, err, id) => [{ type: "Live", id }],
    }),

    createLive: builder.mutation({
      query: (body) => ({ url: "/", method: "POST", body }),
      invalidatesTags: [{ type: "Live", id: "LIST" }],
    }),

    updateLive: builder.mutation({
      query: ({ id, body }) => ({ url: `/${id}`, method: "PATCH", body }),
      invalidatesTags: (res, err, arg) => [
        { type: "Live", id: arg?.id },
        { type: "Live", id: "LIST" },
      ],
    }),

    deleteLive: builder.mutation({
      query: (id) => ({ url: `/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Live", id: "LIST" }],
    }),
  }),
});

export const {
  useGetAllLivesQuery,
  useGetLiveByIdQuery,
  useCreateLiveMutation,
  useUpdateLiveMutation,
  useDeleteLiveMutation,
} = liveApi;
