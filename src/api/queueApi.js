// src/api/queueApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const queueApi = createApi({
  reducerPath: "queueApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:5000/api" }), // your backend URL
  endpoints: (builder) => ({
    getRMQueue: builder.query({
      query: (rmId) => `/queues/${rmId}`, // must match backend route
    }),
  }),
});

export const { useGetRMQueueQuery } = queueApi;