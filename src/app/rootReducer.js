/**
 * Root Reducer
 * Combines all reducers into root reducer
 * Includes base API and service-specific APIs
 */

import { combineReducers } from '@reduxjs/toolkit';
import { baseApi, userServiceApi, appointmentServiceApi } from './api/baseApi';
import { consultationApi } from '../features/appointment/consultationApi';
import { prescriptionApi } from './api/prescriptionApi';
import { labApi } from '../features/lab/labApi';
import { adminUserApi } from './api/adminUserApi';
import { ambulanceApi } from './api/ambulanceApi';
import { phlebotomistResultsApi } from './api/phlebotomistResultsApi';
import authReducer from '../features/auth/authSlice';
import labReducer from '../features/lab/labSlice';
import trackingReducer from '../features/tracking/trackingSlice';
import sosReducer from '../features/sos/sosSlice';

const rootReducer = combineReducers({
  // API reducers
  [baseApi.reducerPath]: baseApi.reducer,
  [userServiceApi.reducerPath]: userServiceApi.reducer,
  [appointmentServiceApi.reducerPath]: appointmentServiceApi.reducer,
  [consultationApi.reducerPath]: consultationApi.reducer,
  [prescriptionApi.reducerPath]: prescriptionApi.reducer,
  [labApi.reducerPath]: labApi.reducer,
  [adminUserApi.reducerPath]: adminUserApi.reducer,
  [ambulanceApi.reducerPath]: ambulanceApi.reducer,
  [phlebotomistResultsApi.reducerPath]: phlebotomistResultsApi.reducer,

  // Feature reducers
  auth: authReducer,
  lab: labReducer,
  tracking: trackingReducer,
  sos: sosReducer,
});

export default rootReducer;
