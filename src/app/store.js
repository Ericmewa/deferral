import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "../api/authApi";
import { userApi } from "../api/userApi";
import authReducer from "../api/authSlice";
import { checklistApi } from "../api/checklistApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    //  [checklistApi.reducerPath]: checklistApi.reducer,
      [checklistApi.reducerPath]: checklistApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, userApi.middleware,checklistApi.middleware ),
});
