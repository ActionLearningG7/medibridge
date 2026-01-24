/**
 * Route guards and authorization utilities
 * Based on role and authentication state
 */

/**
 * Check if user has required role(s)
 */
export const hasRole = (user, requiredRoles) => {
  if (!user || !user.role) return false;

  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  return roles.includes(user.role);
};

/**
 * Check if user is authenticated
 * Only checks for token presence - user data is optional
 */
export const isAuthenticated = (accessToken, user = null) => {
  return !!accessToken;
};

/**
 * Check if user must change password
 */
export const mustChangePassword = (user) => {
  return user?.mustChangePassword === true;
};

/**
 * Get default route for role after login
 */
export const getDefaultRouteForRole = (role) => {
  const roleRoutes = {
    ADMIN: '/admin/dashboard',
    DOCTOR: '/doctor/dashboard',
    PATIENT: '/patient/dashboard',
    PHLEBOTOMIST: '/phlebotomist/dashboard',
    PARAMEDIC: '/paramedic/dashboard',
  };

  return roleRoutes[role] || '/';
};

/**
 * Check if user can access a specific route
 */
export const canAccessRoute = (user, routePath) => {
  if (!user) return false;

  const role = user.role;

  // Admin can access everything
  if (role === 'ADMIN') return true;

  // Map roles to allowed route prefixes
  const roleRouteMap = {
    DOCTOR: '/doctor',
    PATIENT: '/patient',
    PHLEBOTOMIST: '/phlebotomist',
    PARAMEDIC: '/paramedic',
  };

  const allowedPrefix = roleRouteMap[role];
  return allowedPrefix ? routePath.startsWith(allowedPrefix) : false;
};

/**
 * Check if session is expired
 */
export const isSessionExpired = (sessionExpiry) => {
  if (!sessionExpiry) return false;
  return Date.now() > sessionExpiry;
};

/**
 * Calculate session expiry timestamp
 */
export const calculateSessionExpiry = (expiresIn) => {
  return Date.now() + expiresIn;
};

/**
 * Get redirect path after successful authentication
 */
export const getRedirectPath = (user, location) => {
  // Check if there's a redirect from location state
  const from = location?.state?.from?.pathname;

  // If user must change password, force that route
  if (mustChangePassword(user)) {
    return '/force-password-change';
  }

  // If there's a valid redirect path, use it
  if (from && from !== '/login' && from !== '/force-password-change') {
    return from;
  }

  // Otherwise use default route for role
  return getDefaultRouteForRole(user.role);
};

/**
 * Check if user is a patient
 */
export const isPatient = (role) => role === 'PATIENT';

/**
 * Check if user is a doctor
 */
export const isDoctor = (role) => role === 'DOCTOR';

/**
 * Check if user is an admin
 */
export const isAdmin = (role) => role === 'ADMIN';

/**
 * Get role display name
 */
export const getRoleDisplayName = (role) => {
  const displayNames = {
    PATIENT: 'Patient',
    DOCTOR: 'Doctor',
    ADMIN: 'Administrator',
    PHLEBOTOMIST: 'Phlebotomist',
    PARAMEDIC: 'Paramedic',
  };

  return displayNames[role] || role;
};

/**
 * Get role badge color (Tailwind classes)
 */
export const getRoleBadgeColor = (role) => {
  const colors = {
    PATIENT: 'bg-blue-100 text-blue-800 border-blue-200',
    DOCTOR: 'bg-green-100 text-green-800 border-green-200',
    ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
    PHLEBOTOMIST: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    PARAMEDIC: 'bg-red-100 text-red-800 border-red-200',
  };

  return colors[role] || 'bg-gray-100 text-gray-800 border-gray-200';
};

/**
 * Check if route matches current location
 */
export const isRouteActive = (href, currentPath) => {
  if (href === currentPath) return true;

  // Check if current path starts with href (for nested routes)
  if (href !== '/' && currentPath.startsWith(href)) {
    return true;
  }

  return false;
};

/**
 * Get user initials from name
 */
export const getUserInitials = (firstName = '', lastName = '') => {
  const first = firstName?.trim()?.[0] || '';
  const last = lastName?.trim()?.[0] || '';
  return (first + last).toUpperCase() || '?';
};

const guardsUtils = {
  hasRole,
  isAuthenticated,
  mustChangePassword,
  getDefaultRouteForRole,
  canAccessRoute,
  isSessionExpired,
  calculateSessionExpiry,
  getRedirectPath,
  isPatient,
  isDoctor,
  isAdmin,
  getRoleDisplayName,
  getRoleBadgeColor,
  isRouteActive,
  getUserInitials,
};

export default guardsUtils;
