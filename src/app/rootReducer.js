/**
 * Root Reducer
 * Combines all reducers into root reducer
 * Includes base API and service-specific APIs
 */

import { combineReducers } from '@reduxjs/toolkit';
import { baseApi, userServiceApi, appointmentServiceApi } from './api/baseApi';
import { consultationApi } from '../features/appointment/consultationApi';
import authReducer from '../features/auth/authSlice';

const rootReducer = combineReducers({
  // API reducers
  [baseApi.reducerPath]: baseApi.reducer,
  [userServiceApi.reducerPath]: userServiceApi.reducer,
  [appointmentServiceApi.reducerPath]: appointmentServiceApi.reducer,
  [consultationApi.reducerPath]: consultationApi.reducer,

  // Feature reducers
  auth: authReducer,
});

export default rootReducer;
