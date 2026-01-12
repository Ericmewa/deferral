import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const checklistApi = createApi({
  reducerPath: "checklistApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Checklist", "Document", "Notification", "Customer"],

  endpoints: (builder) => ({
    /* ================= CO-CREATOR ================= */

    getAllCoCreatorChecklists: builder.query({
      query: () => "cocreatorChecklist",
      providesTags: ["Checklist"],
    }),

    // ⭐ NEW QUERY ENDPOINT: Fetch comments for a specific checklist
    getChecklistComments: builder.query({
      query: (checklistId) => `/cocreatorChecklist/${checklistId}/comments`,
      providesTags: (result, error, checklistId) => [
        { type: "Comment", id: checklistId },
      ],
    }),

    getCoCreatorChecklistById: builder.query({
      query: (id) => `cocreatorChecklist/${id}`,
      providesTags: ["Checklist"],
    }),

    getCoCreatorChecklistByDclNo: builder.query({
      query: (dclNo) => `cocreatorChecklist/dcl/${dclNo}`,
      providesTags: ["Checklist"],
    }),

    getSpecificChecklistsByCreator: builder.query({
      query: (creatorId) => `cocreatorChecklist/creator/${creatorId}`,
      providesTags: ["Checklist"],
    }),

    getCoCreatorActiveChecklists: builder.query({
      query: () => "cocreatorChecklist/cocreator/active",
      providesTags: ["Checklist"],
    }),

    createCoCreatorChecklist: builder.mutation({
      query: (data) => ({
        url: "cocreatorChecklist",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Checklist"],
    }),

    // update status

    updateChecklistStatus: builder.mutation({
      query: (payload) => ({
        url: "/cocreatorChecklist/update-status",
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["Checklist"],
    }),

    updateCheckerStatus: builder.mutation({
      query: (payload) => {
        console.log(
          "RTK Query: Sending payload to updateCheckerStatus:",
          payload
        );

        return {
          url: "checkerChecklist/update-status",
          method: "PATCH",
          body: payload, // The payload should contain { id: '...', action: '...' }
        };
      },
      invalidatesTags: ["Checklist"],
    }),

    updateCoCreatorChecklist: builder.mutation({
      query: ({ id, data }) => ({
        url: `cocreatorChecklist/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Checklist"],
    }),

    submitChecklistToRM: builder.mutation({
      query: ({ id, body }) => ({
        url: `cocreatorChecklist/${id}/submit-to-rm`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Checklist"],
    }),

    submitChecklistToCoChecker: builder.mutation({
      query: ({ id }) => ({
        url: `cocreatorChecklist/${id}/submit-to-cochecker`,
        method: "POST",
      }),
      invalidatesTags: ["Checklist"],
    }),

    addDocument: builder.mutation({
      query: ({ id, data }) => ({
        url: `cocreatorChecklist/${id}/documents`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Document"],
    }),

    updateDocument: builder.mutation({
      query: ({ id, docId, data }) => ({
        url: `cocreatorChecklist/${id}/documents/${docId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Document"],
    }),

    deleteDocument: builder.mutation({
      query: ({ id, docId }) => ({
        url: `cocreatorChecklist/${id}/documents/${docId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Document"],
    }),

    searchCustomer: builder.query({
      query: (q) => ({
        url: "cocreatorChecklist/search/customer",
        params: { q },
      }),
      providesTags: ["Customer"],
    }),

    /* ================= CHECKER ================= */

    getCheckerActiveDCLs: builder.query({
      query: () => "checkerChecklist/active-dcls",
      providesTags: ["Checklist"],
    }),

    getCheckerMyQueue: builder.query({
      query: (checkerId) => `checkerChecklist/my-queue/${checkerId}`,
      providesTags: ["Checklist"],
    }),

    getCompletedDCLsForChecker: builder.query({
      query: (checkerId) => `checkerChecklist/completed/${checkerId}`,
      providesTags: ["Checklist"],
    }),

    getCheckerDclById: builder.query({
      query: (id) => `checkerChecklist/dcl/${id}`,
      providesTags: ["Checklist"],
    }),

    updateCheckerDclStatus: builder.mutation({
      query: ({ id, data }) => ({
        url: `checkerChecklist/dcl/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Checklist"],
    }),

    approveCheckerDcl: builder.mutation({
      query: (id) => ({
        url: `checkerChecklist/approve/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Checklist"],
    }),

    rejectCheckerDcl: builder.mutation({
      query: (id) => ({
        url: `checkerChecklist/reject/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Checklist"],
    }),

    /* ================= RM ================= */

    getRMQueue: builder.query({
      query: (rmId) => `rmChecklist/${rmId}/myqueue`,
      providesTags: ["Checklist"],
    }),

    getChecklistByIdRM: builder.query({
      query: (id) => `rmChecklist/${id}`,
      providesTags: ["Checklist"],
    }),

    getCompletedDclsForRm: builder.query({
      query: (rmId) => `rmChecklist/completed/rm/${rmId}`,
      providesTags: ["Checklist"],
    }),

    rmSubmitChecklistToCoCreator: builder.mutation({
      query: (payload) => ({
        url: "rmChecklist/rm-submit-to-co-creator",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Checklist"],
    }),

    deleteDocumentFileRM: builder.mutation({
      query: ({ checklistId, documentId }) => ({
        url: `rmChecklist/${checklistId}/document/${documentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Document"],
    }),

    getRmNotifications: builder.query({
      query: (params) => ({
        url: "rmChecklist/notifications/rm",
        params,
      }),
      providesTags: ["Notification"],
    }),

    markRmNotificationAsRead: builder.mutation({
      query: ({ notificationId }) => ({
        url: `rmChecklist/notifications/rm/${notificationId}`,
        method: "PUT",
      }),
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const {
  // CO-CREATOR
  useGetAllCoCreatorChecklistsQuery,
  useGetCoCreatorChecklistByIdQuery,
  useGetCoCreatorChecklistByDclNoQuery,
  useGetSpecificChecklistsByCreatorQuery,
  useGetCoCreatorActiveChecklistsQuery,
  useCreateCoCreatorChecklistMutation,
  useUpdateCoCreatorChecklistMutation,
  useSubmitChecklistToRMMutation,
  useSubmitChecklistToCoCheckerMutation,
  useAddDocumentMutation,
  useUpdateDocumentMutation,
  useDeleteDocumentMutation,
  useSearchCustomerQuery,
  useGetChecklistCommentsQuery, // ⭐ Exported hook

  useUpdateChecklistStatusMutation,

  // CHECKER
  useGetCheckerActiveDCLsQuery,
  useGetCheckerMyQueueQuery,
  useGetCompletedDCLsForCheckerQuery,
  useGetCheckerDclByIdQuery,
  useUpdateCheckerDclStatusMutation,
  useApproveCheckerDclMutation,
  useRejectCheckerDclMutation,
  useUpdateCheckerStatusMutation,

  // RM
  useGetRMQueueQuery,
  useGetChecklistByIdRMQuery,
  useGetCompletedDclsForRmQuery,
  useRmSubmitChecklistToCoCreatorMutation,
  useDeleteDocumentFileRMMutation,
  useGetRmNotificationsQuery,
  useMarkRmNotificationAsReadMutation,
} = checklistApi;
