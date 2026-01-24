/**
 * Auth header utility for API requests
 * Provides Authorization header with Bearer token
 */

/**
 * Get authorization header with Bearer token
 * @param {function} getState - Redux getState function
 * @returns {Object} Headers object with Authorization
 */
export const getAuthHeader = (getState) => {
  // Try Redux state first
  let token = getState()?.auth?.accessToken;

  // Fallback to localStorage if Redux is empty (race condition during hydration)
  if (!token && typeof window !== 'undefined') {
    token = localStorage.getItem('accessToken');
    if (token) {
      console.log('ℹ️ Using token from localStorage (Redux not yet hydrated)');
    }
  }

  if (token) {
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  return {};
};

/**
 * Get token from Redux state
 * @param {function} getState - Redux getState function
 * @returns {string|null} Access token or null
 */
export const getToken = (getState) => {
  // Try Redux state first
  let token = getState()?.auth?.accessToken;

  // Fallback to localStorage
  if (!token && typeof window !== 'undefined') {
    token = localStorage.getItem('accessToken');
  }

  return token || null;
};

/**
 * Check if token exists
 * @param {function} getState - Redux getState function
 * @returns {boolean} True if token exists
 */
export const hasToken = (getState) => {
  return !!getState()?.auth?.accessToken;
};

const authHeaderUtils = {
  getAuthHeader,
  getToken,
  hasToken,
};

export default authHeaderUtils;

