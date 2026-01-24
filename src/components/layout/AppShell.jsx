/**
 * AppShell Component
 * Main application layout with sidebar, topbar, and content area
 * Responsive design with mobile drawer
 */

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectUserRole } from '../../features/auth/authSlice';
import { cn } from '../../utils/cn';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const AppShell = ({ children, className }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useSelector(selectCurrentUser);
  const role = useSelector(selectUserRole);

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
        role={role}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <Topbar
          onMenuClick={handleToggleSidebar}
          user={user}
          role={role}
        />

        {/* Page Content */}
        <main className={cn('flex-1', className)}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppShell;
