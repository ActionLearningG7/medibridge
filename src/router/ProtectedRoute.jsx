/**
 * Protected Route Component
 * Wraps routes that require authentication and role-based authorization
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  selectAccessToken,
  selectCurrentUser,
  selectUserRole,
  selectForcePasswordChange,
  selectAuthInitialized,
} from '../features/auth/authSlice';

/**
 * ProtectedRoute Component
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {string|string[]} props.allowedRoles - Roles allowed to access route
 * @param {string} props.redirectTo - Path to redirect if not authorized (default: /login)
 */
export const ProtectedRoute = ({
  children,
  allowedRoles = [],
  redirectTo = '/login'
}) => {
  const location = useLocation();
  const accessToken = useSelector(selectAccessToken);
  const user = useSelector(selectCurrentUser);
  const userRole = useSelector(selectUserRole);
  const forcePasswordChange = useSelector(selectForcePasswordChange);
  const initialized = useSelector(selectAuthInitialized);

  // LOG: Trace ProtectedRoute decision
  console.log('🛡️ ProtectedRoute check:', {
    pathname: location.pathname,
    initialized,
    hasToken: !!accessToken,
    tokenPreview: accessToken ? accessToken.substring(0, 20) + '...' : 'none',
    userRole,
    hasUser: !!user,
    allowedRoles,
    forcePasswordChange
  });

  // Show loading state while auth is being restored from localStorage
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

  // Check authentication - token is sufficient, user is optional
  const authenticated = !!accessToken;

  // Not authenticated - redirect to login
  if (!authenticated) {
    console.log('❌ ProtectedRoute: No token, redirecting to login');
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Must change password - redirect to force password change (unless already there)
  if (forcePasswordChange && location.pathname !== '/force-password-change') {
    console.log('⚠️ ProtectedRoute: Must change password');
    return <Navigate to="/force-password-change" state={{ from: location }} replace />;
  }

  // Check role authorization
  if (allowedRoles.length > 0) {
    // Use role from state (faster) or user object (fallback)
    const currentRole = userRole || user?.role;

    if (!currentRole) {
      console.warn('⚠️ ProtectedRoute: No role available, redirecting to login');
      return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(currentRole)) {
      // User doesn't have required role - redirect to unauthorized (NOT login)
      console.log(`⚠️ ProtectedRoute: Wrong role (${currentRole}), redirecting to /unauthorized`);
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // User is authenticated and authorized
  console.log('✓ ProtectedRoute: Access granted');
  return children;
};

export default ProtectedRoute;
