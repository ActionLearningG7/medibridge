/**
 * Auth Slice
 * Manages authentication state: token, user, role, forcePasswordChange
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  accessToken: null,
  refreshToken: null,
  user: null,
  role: null,
  forcePasswordChange: false,
  isAuthenticated: false,
  sessionExpiry: null,
  initialized: false, // Flag to prevent redirect loops during hydration
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Set credentials after login/register/refresh
     */
    setCredentials: (state, action) => {
      const { accessToken, refreshToken, user, expiresIn } = action.payload;

      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.user = user;
      state.role = user?.role || null;
      state.forcePasswordChange = user?.mustChangePassword || false;
      state.isAuthenticated = true;

      if (expiresIn) {
        state.sessionExpiry = Date.now() + expiresIn;
      }

      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
      }
    },

    /**
     * Update user info
     */
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      state.role = state.user?.role || state.role;
      state.forcePasswordChange = state.user?.mustChangePassword || false;

      // Update localStorage
      if (typeof window !== 'undefined' && state.user) {
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },

    /**
     * Clear force password change flag after successful change
     */
    clearForcePasswordChange: (state) => {
      state.forcePasswordChange = false;
      if (state.user) {
        state.user.mustChangePassword = false;

        // Update localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      }
    },

    /**
     * Logout user and clear all auth state
     */
    logout: (state, action) => {
      // LOG: Trace what triggered logout
      console.error('🚨 LOGOUT TRIGGERED', {
        payload: action.payload,
        stack: new Error().stack,
        currentState: {
          hasToken: !!state.accessToken,
          role: state.role,
          isAuthenticated: state.isAuthenticated
        }
      });


      // Clear state
      Object.assign(state, initialState);

      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    },

    /**
     * Restore auth from localStorage (on app init)
     */
    restoreAuth: (state) => {
      if (typeof window !== 'undefined') {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const userStr = localStorage.getItem('user');

        if (accessToken && refreshToken && userStr) {
          try {
            const user = JSON.parse(userStr);
            state.accessToken = accessToken;
            state.refreshToken = refreshToken;
            state.user = user;
            state.role = user?.role || null;
            state.forcePasswordChange = user?.mustChangePassword || false;
            state.isAuthenticated = true;
            console.log('✓ Auth restored from localStorage:', { role: state.role });
          } catch (error) {
            console.error('✗ Failed to restore auth:', error);
            // Clear invalid data
            Object.assign(state, initialState);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
          }
        } else {
          console.log('ℹ No auth data in localStorage');
        }
      }

      // Always mark as initialized, whether we restored data or not
      state.initialized = true;
    },
  },
});

export const {
  setCredentials,
  updateUser,
  clearForcePasswordChange,
  logout,
  restoreAuth,
} = authSlice.actions;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectUser = (state) => state.auth.user; // Alias for selectCurrentUser
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectRefreshToken = (state) => state.auth.refreshToken;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUserRole = (state) => state.auth.role;
export const selectForcePasswordChange = (state) => state.auth.forcePasswordChange;
export const selectSessionExpiry = (state) => state.auth.sessionExpiry;
export const selectAuthInitialized = (state) => state.auth.initialized;

export default authSlice.reducer;
