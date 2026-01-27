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
  Pill,
  TestTube,
  BarChart3,
  MapPin,
  CheckCircle2,
  FileText,
  Upload,
  AlertTriangle,
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
    badge: null,
  },
  {
    id: 'prescriptions',
    label: 'Prescriptions',
    href: '/patient/prescriptions',
    icon: Pill,
    description: 'View your prescriptions',
  },
  // Lab Services Section
  {
    id: 'lab-divider',
    label: 'Lab Services',
    isDivider: true,
  },
  {
    id: 'lab-catalog',
    label: 'Browse Tests',
    href: '/patient/labs/catalog',
    icon: TestTube,
    description: 'Browse available lab tests',
  },
  {
    id: 'lab-booking',
    label: 'Book Test',
    href: '/patient/labs/booking',
    icon: Calendar,
    description: 'Book a new lab test',
  },
  {
    id: 'lab-orders',
    label: 'My Orders',
    href: '/patient/labs/orders',
    icon: Clipboard,
    description: 'View your lab orders',
  },
  {
    id: 'lab-reports',
    label: 'My Reports',
    href: '/patient/labs/reports',
    icon: FileText,
    description: 'View and download lab results',
  },
  {
    id: 'queue',
    label: 'Queue',
    href: '/patient/queue',
    icon: Clock,
    description: 'Virtual queue status',
  },
  {
    id: 'sos',
    label: 'Emergency SOS',
    href: '/patient/sos',
    icon: AlertTriangle,
    description: 'Call emergency ambulance',
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
    description: 'Manage your profile',
  },
  {
    id: 'prescriptions',
    label: 'Prescriptions',
    href: '/doctor/prescriptions',
    icon: Pill,
    description: 'Manage patient prescriptions',
  },
  // Lab Services Section
  {
    id: 'lab-divider',
    label: 'Lab Services',
    isDivider: true,
  },
  {
    id: 'lab-booking',
    label: 'Prescribe Test',
    href: '/doctor/labs/booking',
    icon: TestTube,
    description: 'Prescribe lab test to patient',
  },
  {
    id: 'lab-orders',
    label: 'Lab Orders',
    href: '/doctor/labs/orders',
    icon: Clipboard,
    description: 'View prescribed lab tests',
  },
  {
    id: 'queue-console',
    label: 'Queue Console',
    href: '/doctor/queue',
    icon: Clipboard,
    description: 'Manage patient queue',
    badge: null,
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
    badge: null,
  },
  {
    id: 'profile',
    label: 'Profile',
    href: '/admin/profile',
    icon: User,
    description: 'Manage your profile',
  },
  {
    id: 'prescriptions',
    label: 'Prescriptions',
    href: '/admin/prescriptions',
    icon: Pill,
    description: 'Monitor system prescriptions',
  },
  // Lab Management Section
  {
    id: 'lab-divider',
    label: 'Lab Management',
    isDivider: true,
  },
  {
    id: 'lab-tasks',
    label: 'Lab Tasks',
    href: '/admin/labs/dashboard',
    icon: Clipboard,
    description: 'View analytics and manage lab collection tasks',
  },
  {
    id: 'doctors',
    label: 'Doctors',
    href: '/admin/doctors',
    icon: Users,
    description: 'Manage doctor accounts',
    badge: null,
  },
  {
    id: 'phlebotomists',
    label: 'Phlebotomists',
    href: '/admin/phlebotomists',
    icon: Users,
    description: 'Manage phlebotomist accounts',
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
 * Phlebotomist Navigation Menu
 * @param {boolean} isAdmin - Whether the phlebotomist has admin privileges
 */
export const getPhlebotomistNav = (isAdmin = false) => {
  console.log('🔍 getPhlebotomistNav called with isAdmin:', isAdmin);

  const baseNav = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/phlebotomist/dashboard',
      icon: LayoutDashboard,
      description: 'Overview and tasks',
    },
    {
      id: 'profile',
      label: 'Profile',
      href: '/phlebotomist/profile',
      icon: User,
      description: 'Manage your profile',
    },
    // Lab Tasks Section
    {
      id: 'lab-divider',
      label: 'Lab Tasks',
      isDivider: true,
    },
    {
      id: 'tasks',
      label: 'My Tasks',
      href: '/phlebotomist/tasks',
      icon: CheckCircle2,
      description: 'Assigned collection tasks',
    },
    {
      id: 'live-tracking',
      label: 'Live Tracking',
      href: '/phlebotomist/tracking',
      icon: MapPin,
      description: 'Track location and provide updates',
    },
  ];

  // Add Results Dashboard for admin phlebotomists
  if (isAdmin) {
    baseNav.push({
      id: 'results-dashboard',
      label: 'Results Dashboard',
      href: '/phlebotomist/results',
      icon: Upload,
      description: 'Upload and manage lab results',
      badge: 'Admin',
    });
  }

  baseNav.push({
    id: 'settings',
    label: 'Settings',
    href: '/phlebotomist/settings',
    icon: Settings,
    description: 'Account settings',
  });

  return baseNav;
};

// Keep backward compatibility
export const PHLEBOTOMIST_NAV = getPhlebotomistNav(false);

/**
 * Admin Phlebotomist Management Menu
 */
export const ADMIN_PHLEBOTOMIST_SECTION = {
  id: 'phlebotomists',
  label: 'Phlebotomists',
  href: '/admin/phlebotomists',
  icon: Users,
  description: 'Manage phlebotomist accounts',
};

/**
 * Get navigation items based on user role
 * @param {string} role - User role (PATIENT, DOCTOR, ADMIN, PHLEBOTOMIST)
 * @param {Object} user - User object with additional properties (e.g., isAdmin for phlebotomists)
 * @returns {Array} Navigation items
 */
export const getNavigation = (role, user = null) => {
  console.log('🔍 getNavigation called with:', { role, user });

  // TEMPORARY WORKAROUND: Force isAdmin to true for testing phlebotomists
  // TODO: Remove this after backend includes isAdmin in login response
  const isAdminValue = role === 'PHLEBOTOMIST' ? true : (user?.isAdmin || false);
  console.log('🔍 isAdmin value used:', isAdminValue);

  const navMap = {
    PATIENT: PATIENT_NAV,
    DOCTOR: DOCTOR_NAV,
    ADMIN: ADMIN_NAV,
    PHLEBOTOMIST: getPhlebotomistNav(isAdminValue),
  };

  return navMap[role] || PATIENT_NAV;
};

/**
 * Get default route for a user role
 * @param {string} role - User role
 * @returns {string} Default route path
 */
export const getDefaultRoute = (role) => {
  const routeMap = {
    PATIENT: '/patient/dashboard',
    DOCTOR: '/doctor/dashboard',
    ADMIN: '/admin/dashboard',
    PHLEBOTOMIST: '/phlebotomist/tasks',
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
  return navigation.some(item => !item.isDivider && path.startsWith(item.href));
};
