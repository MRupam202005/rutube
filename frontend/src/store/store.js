// Step 3 : Redux Store Setup & configuration for managing application state across components

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    // Add other reducers here in the future
  }
});

export default store;
