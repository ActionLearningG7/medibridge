/**
 * Sidebar Component
 * Left navigation sidebar with role-based menu items
 */

import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { getNavigation } from '../../utils/navConfig';
import { isRouteActive } from '../../utils/guards';
import { selectCurrentUser } from '../../features/auth/authSlice';

const Sidebar = ({ isOpen, onClose, role, className }) => {
  const location = useLocation();
  const user = useSelector(selectCurrentUser);

  console.log('🔍 Sidebar - Role:', role, 'User:', user);
  console.log('🔍 Sidebar - isAdmin:', user?.isAdmin);

  const navigation = getNavigation(role, user);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="ml-3 text-xl font-bold text-gray-900">
              MediBridge
            </span>
          </div>

          {/* Close button (mobile only) */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            // Skip divider items
            if (item.isDivider) {
              return (
                <div key={item.id} className="py-2">
                  <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {item.label}
                  </div>
                </div>
              );
            }

            const Icon = item.icon;
            const isActive = isRouteActive(item.href, location.pathname);

            // If icon is undefined, skip rendering
            if (!Icon) {
              return null;
            }

            return (
              <Link
                key={item.id}
                to={item.href}
                onClick={onClose} // Close sidebar on mobile after navigation
                className={cn(
                  'flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group relative',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-600 rounded-r-full" />
                )}

                {/* Icon */}
                <Icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0 transition-colors',
                    isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
                  )}
                />

                {/* Label */}
                <span className="ml-3 flex-1">{item.label}</span>

                {/* Badge (if provided) */}
                {item.badge && (
                  <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-gray-200 p-4">
          <div className="text-xs text-gray-500 text-center">
            © 2026 MediBridge
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
