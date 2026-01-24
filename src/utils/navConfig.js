/**
 * Navigation Configuration
 * Role-based menu items for sidebar navigation
 */

import {
  LayoutDashboard,
  User,
  Calendar,
  Clock,
  Settings,
  Clipboard,
  Users,
  Activity,
} from 'lucide-react';

/**
 * Patient Navigation Menu
 */
export const PATIENT_NAV = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/patient/dashboard',
    icon: LayoutDashboard,
    description: 'Overview and quick actions',
  },
  {
    id: 'profile',
    label: 'Profile',
    href: '/patient/profile',
    icon: User,
    description: 'Manage your personal information',
  },
  {
    id: 'appointments',
    label: 'Appointments',
    href: '/patient/appointments',
    icon: Calendar,
    description: 'Book and manage appointments',
    badge: null, // Can be used for count
  },
  {
    id: 'queue',
    label: 'Queue',
    href: '/patient/queue',
    icon: Clock,
    description: 'Virtual queue status',
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/patient/settings',
    icon: Settings,
    description: 'Account settings and preferences',
  },
];

/**
 * Doctor Navigation Menu
 */
export const DOCTOR_NAV = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/doctor/dashboard',
    icon: LayoutDashboard,
    description: 'Overview and statistics',
  },
  {
    id: 'profile',
    label: 'Profile',
    href: '/doctor/profile',
    icon: User,
    description: 'Manage your professional profile',
  },
  {
    id: 'queue-console',
    label: 'Queue Console',
    href: '/doctor/queue',
    icon: Clipboard,
    description: 'Manage patient queue',
    badge: null, // Can show waiting count
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/doctor/settings',
    icon: Settings,
    description: 'Consultation and account settings',
  },
];

/**
 * Admin Navigation Menu
 */
export const ADMIN_NAV = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    description: 'System overview and analytics',
  },
  {
    id: 'profile',
    label: 'Profile',
    href: '/admin/profile',
    icon: User,
    description: 'Manage your profile',
  },
  {
    id: 'doctors',
    label: 'Doctors',
    href: '/admin/doctors',
    icon: Users,
    description: 'Manage doctor accounts',
    badge: null, // Can show pending verification count
  },
  {
    id: 'queue-monitoring',
    label: 'Queue Monitoring',
    href: '/admin/queue-monitoring',
    icon: Activity,
    description: 'Monitor all queues',
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'System settings',
  },
];

/**
 * Get navigation items based on user role
 * @param {string} role - User role (PATIENT, DOCTOR, ADMIN)
 * @returns {Array} Navigation items
 */
export const getNavigation = (role) => {
  const navMap = {
    PATIENT: PATIENT_NAV,
    DOCTOR: DOCTOR_NAV,
    ADMIN: ADMIN_NAV,
  };

  return navMap[role] || PATIENT_NAV;
};

/**
 * Get default route based on role
 * @param {string} role - User role
 * @returns {string} Default route path
 */
export const getDefaultRoute = (role) => {
  const routeMap = {
    PATIENT: '/patient/dashboard',
    DOCTOR: '/doctor/dashboard',
    ADMIN: '/admin/dashboard',
  };

  return routeMap[role] || '/patient/dashboard';
};

/**
 * Check if a route is accessible for a role
 * @param {string} path - Route path
 * @param {string} role - User role
 * @returns {boolean} Is accessible
 */
export const isRouteAccessible = (path, role) => {
  const navigation = getNavigation(role);
  return navigation.some(item => path.startsWith(item.href));
};
