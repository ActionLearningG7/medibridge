/**
 * RoleRedirect Component
 * Redirects user to their role-specific dashboard
 * Used for root route "/" to automatically send users to correct location
 */

import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  selectUserRole,
  selectIsAuthenticated,
  selectAuthInitialized
} from '../features/auth/authSlice';
import { getDefaultRouteForRole } from '../utils/guards';

const RoleRedirect = () => {
  const initialized = useSelector(selectAuthInitialized);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectUserRole);

  // Wait for auth to be initialized
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - go to login
  if (!isAuthenticated) {
    console.log('📍 RoleRedirect: Not authenticated, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  // Redirect to role-specific dashboard
  const defaultRoute = getDefaultRouteForRole(userRole);
  console.log(`📍 RoleRedirect: Authenticated as ${userRole}, redirecting to ${defaultRoute}`);
  return <Navigate to={defaultRoute} replace />;
};

export default RoleRedirect;
