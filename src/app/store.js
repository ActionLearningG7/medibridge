/**
 * Redux Store Configuration
 * Configures Redux store with RTK Query middleware and persist
 * Includes base API and service-specific APIs
 * updated: added prescriptionApi, labApi
 */

import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { baseApi, userServiceApi, appointmentServiceApi } from './api/baseApi';
import { consultationApi } from '../features/appointment/consultationApi';
import { prescriptionApi } from './api/prescriptionApi';
import { labApi } from '../features/lab/labApi';
import { adminUserApi } from './api/adminUserApi';
import { ambulanceApi } from './api/ambulanceApi';
import { phlebotomistResultsApi } from './api/phlebotomistResultsApi';
import rootReducer from './rootReducer';

// Configure store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serialization check
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
}).concat(
      baseApi.middleware,
      userServiceApi.middleware,
      appointmentServiceApi.middleware,
      consultationApi.middleware,
      prescriptionApi.middleware,
      labApi.middleware,
      adminUserApi.middleware,
      ambulanceApi.middleware,
      phlebotomistResultsApi.middleware
    ),
  devTools: process.env.NODE_ENV !== 'production',
});

// Setup listeners for refetchOnFocus and refetchOnReconnect
setupListeners(store.dispatch);

export default store;
