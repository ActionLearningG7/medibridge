/**
 * Admin Navigation - Sidebar with all admin management options
 */
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, Truck, AlertCircle, BarChart3, Settings, LogOut, Menu, X, Stethoscope, Briefcase, TestTubes, ClipboardList, Pill } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';

export default function AdminNavigation({ children }) {
    const [sidebarOpen, setSidebarOpen] = React.useState(true);
    const location = useLocation();
    const dispatch = useDispatch();

    const adminMenuItems = [
        {
            label: 'Dashboard',
            icon: BarChart3,
            path: '/admin/dashboard',
            description: 'Overview and analytics',
        },
        {
            label: 'Doctors',
            icon: Stethoscope,
            path: '/admin/doctors',
            description: 'Manage doctors',
        },
        {
            label: 'Queue Monitoring',
            icon: ClipboardList,
            path: '/admin/queue-monitoring',
            description: 'Monitor queues',
        },
        {
            label: 'Prescriptions',
            icon: Pill,
            path: '/admin/prescriptions',
            description: 'Manage prescriptions',
        },
        {
            label: 'Lab Management',
            icon: TestTubes,
            path: '/admin/labs/dashboard',
            description: 'Lab operations',
        },
        {
            label: 'Phlebotomists',
            icon: Users,
            path: '/admin/phlebotomists',
            description: 'Manage phlebotomists',
        },
        {
            label: 'Ambulance Drivers',
            icon: Users,
            path: '/admin/drivers',
            description: 'Manage driver profiles',
        },
        {
            label: 'Ambulances',
            icon: Truck,
            path: '/admin/ambulances',
            description: 'Fleet management',
        },
        {
            label: 'SOS Incidents',
            icon: AlertCircle,
            path: '/admin/incidents',
            description: 'Monitor incidents',
        },
        {
            label: 'Settings',
            icon: Settings,
            path: '/admin/settings',
            description: 'Admin settings',
        },
    ];

    const handleLogout = () => {
        dispatch(logout());
    };

    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div
                className={`${sidebarOpen ? 'w-64' : 'w-20'
                    } bg-blue-900 text-white transition-all duration-300 ease-in-out flex flex-col`}
            >
                {/* Logo */}
                <div className="flex items-center justify-between p-4 border-b border-blue-800">
                    {sidebarOpen && (
                        <div className="flex items-center gap-2">
                            <div className="bg-blue-400 rounded-lg p-2">
                                <Truck size={24} />
                            </div>
                            <div>
                                <p className="font-bold text-white">MediBridge</p>
                                <p className="text-xs text-blue-200">Admin Panel</p>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="text-blue-200 hover:text-white p-1 hover:bg-blue-800 rounded"
                    >
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Menu Items */}
                <nav className="flex-1 overflow-y-auto py-4 space-y-2 px-2">
                    {adminMenuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${active
                                    ? 'bg-blue-700 text-white'
                                    : 'text-blue-100 hover:bg-blue-800'
                                    }`}
                                title={!sidebarOpen ? item.label : ''}
                            >
                                <Icon size={20} className="flex-shrink-0" />
                                {sidebarOpen && (
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm">{item.label}</p>
                                        <p className="text-xs text-blue-200 truncate">{item.description}</p>
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout Button */}
                <div className="border-t border-blue-800 p-4">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-blue-100 hover:bg-red-600 hover:text-white transition"
                        title={!sidebarOpen ? 'Logout' : ''}
                    >
                        <LogOut size={20} className="flex-shrink-0" />
                        {sidebarOpen && <span className="font-medium">Logout</span>}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {adminMenuItems.find((item) => isActive(item.path))?.label || 'Admin Panel'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">Admin User</p>
                            <p className="text-xs text-gray-600">{new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}
