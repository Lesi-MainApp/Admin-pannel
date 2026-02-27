import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

export const resultApi = createApi({
  reducerPath: "resultApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BACKEND_URL}/api/result-report`,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getResultReport: builder.query({
      query: (params = {}) => {
        const search = new URLSearchParams();

        if (params.paperType) search.set("paperType", params.paperType);
        if (params.subject) search.set("subject", params.subject);
        if (params.grade) search.set("grade", params.grade);

        const queryString = search.toString();

        return {
          url: queryString ? `/?${queryString}` : "/",
          method: "GET",
        };
      },
      providesTags: ["ResultReport"],
    }),
  }),
});

export const { useGetResultReportQuery } = resultApi;