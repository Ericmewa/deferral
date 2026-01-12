import { createSlice } from "@reduxjs/toolkit";

const storedUser = JSON.parse(localStorage.getItem("user")) || null;

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: storedUser?.user,
    token: storedUser?.token || null,
  },
  reducers: {
    setCredentials: (state, { payload }) => {
      state.user = payload.user;
      state.token = payload.token;
      localStorage.setItem("user", JSON.stringify(payload));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("user");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
