/**
 * Topbar Component
 * Top navigation bar with menu toggle, role badge, and user menu
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Menu, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';
import { logout } from '../../features/auth/authSlice';
import { getRoleDisplayName, getRoleBadgeColor, getUserInitials } from '../../utils/guards';

const Topbar = ({ onMenuClick, user, role, className }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    console.log('🔴 User clicked logout button');
    dispatch(logout({ reason: 'manual_logout' }));
    navigate('/login');
  };

  const handleProfile = () => {
    const profilePath = `/${role?.toLowerCase()}/profile`;
    navigate(profilePath);
    setUserMenuOpen(false);
  };

  const handleSettings = () => {
    const settingsPath = `/${role?.toLowerCase()}/settings`;
    navigate(settingsPath);
    setUserMenuOpen(false);
  };

  const initials = getUserInitials(user?.firstName, user?.lastName);

  return (
    <header
      className={cn(
        'sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm',
        className
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left Section: Menu Button */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* App name on mobile (hidden on desktop as sidebar shows it) */}
          <span className="lg:hidden ml-3 text-lg font-semibold text-gray-900">
            MediBridge
          </span>
        </div>

        {/* Right Section: Role Badge + User Menu */}
        <div className="flex items-center gap-4">
          {/* Role Badge */}
          {role && (
            <div
              className={cn(
                'hidden sm:flex items-center px-3 py-1.5 rounded-full text-xs font-medium border',
                getRoleBadgeColor(role)
              )}
            >
              {getRoleDisplayName(role)}
            </div>
          )}

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              aria-expanded={userMenuOpen}
              aria-haspopup="true"
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-medium shadow-sm">
                {initials}
              </div>

              {/* User Name (hidden on small screens) */}
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-xs text-gray-500">{user?.email}</div>
              </div>

              {/* Dropdown Icon */}
              <ChevronDown
                className={cn(
                  'hidden md:block h-4 w-4 text-gray-400 transition-transform',
                  userMenuOpen && 'transform rotate-180'
                )}
              />
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserMenuOpen(false)}
                  aria-hidden="true"
                />

                {/* Menu */}
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  {/* User Info (mobile only) */}
                  <div className="md:hidden px-4 py-3 border-b border-gray-200">
                    <div className="text-sm font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{user?.email}</div>
                    {role && (
                      <div className={cn(
                        'inline-flex items-center mt-2 px-2 py-1 rounded-full text-xs font-medium border',
                        getRoleBadgeColor(role)
                      )}>
                        {getRoleDisplayName(role)}
                      </div>
                    )}
                  </div>

                  {/* Menu Items */}
                  <button
                    onClick={handleProfile}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <User className="h-4 w-4 text-gray-400" />
                    Profile
                  </button>

                  <button
                    onClick={handleSettings}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Settings className="h-4 w-4 text-gray-400" />
                    Settings
                  </button>

                  <div className="border-t border-gray-200 my-1" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
