// Step 2 : Redux Toolkit Setup for User Authentication 

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  status: false, // false means logged out
  userData: null, // will hold user object when logged in
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Action to run when login succeeds
    login: (state, action) => {
      state.status = true;
      state.userData = action.payload.userData;
    },
    // Action to run when user clicks logout
    logout: (state) => {
      state.status = false;
      state.userData = null;
    }
  }
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
