/**
 * Admin Ambulance Drivers Management Page - DYNAMIC VERSION
 * Create, edit, manage ambulance driver profiles and credentials
 */
import React, { useState } from 'react';
import { Plus, Edit2, RotateCcw, Search, Mail, Phone, Shield, AlertCircle, Loader } from 'lucide-react';
import {
    useGetAmbulanceDriversQuery,
    useCreateAmbulanceDriverMutation,
    useUpdateAmbulanceDriverMutation,
    useResetDriverCredentialsMutation,
} from '../../app/api/ambulanceApi';

// Sample data for fallback
const SAMPLE_DRIVERS = [
    {
        id: '1',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@medibridge.com',
        phoneNumber: '+1 (555) 123-4567',
        licenseNumber: 'DL-2023-001',
        licenseExpiry: '2025-12-31',
        isActive: true,
        createdAt: '2024-01-15'
    },
    {
        id: '2',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@medibridge.com',
        phoneNumber: '+1 (555) 234-5678',
        licenseNumber: 'DL-2023-002',
        licenseExpiry: '2025-06-30',
        isActive: true,
        createdAt: '2024-02-10'
    },
    {
        id: '3',
        firstName: 'Michael',
        lastName: 'Williams',
        email: 'michael.williams@medibridge.com',
        phoneNumber: '+1 (555) 345-6789',
        licenseNumber: 'DL-2023-003',
        licenseExpiry: '2025-09-15',
        isActive: false,
        createdAt: '2024-03-05'
    },
    {
        id: '4',
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@medibridge.com',
        phoneNumber: '+1 (555) 456-7890',
        licenseNumber: 'DL-2023-004',
        licenseExpiry: '2026-03-20',
        isActive: true,
        createdAt: '2024-04-12'
    }
];

export default function AdminAmbulanceDrivers() {
    const [page, setPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingDriver, setEditingDriver] = useState(null);
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetDriver, setResetDriver] = useState(null);
    const [resetResult, setResetResult] = useState(null);

    // RTK Query hooks
    const { data: driversData, isLoading, error, isUninitialized } = useGetAmbulanceDriversQuery({ page, size: 10 });
    const [createDriver, { isLoading: isCreating }] = useCreateAmbulanceDriverMutation();
    const [updateDriver, { isLoading: isUpdating }] = useUpdateAmbulanceDriverMutation();
    const [resetCredentials, { isLoading: isResetting }] = useResetDriverCredentialsMutation();

    // Determine drivers source
    const drivers = driversData?.content || SAMPLE_DRIVERS;
    const isUsingFallback = !driversData || error;


    const handleCreateDriver = async (formData) => {
        try {
            await createDriver(formData).unwrap();
            setShowModal(false);
            alert('Driver created successfully');
        } catch (err) {
            console.error('Error creating driver:', err);
            alert('Failed to create driver');
        }
    };

    const handleUpdateDriver = async (formData) => {
        try {
            await updateDriver({ id: editingDriver.id, ...formData }).unwrap();
            setShowModal(false);
            setEditingDriver(null);
            alert('Driver updated successfully');
        } catch (err) {
            console.error('Error updating driver:', err);
            alert('Failed to update driver');
        }
    };

    const handleResetCredentials = async () => {
        try {
            const result = await resetCredentials(resetDriver.id).unwrap();
            setResetResult(result);
        } catch (err) {
            console.error('Error resetting credentials:', err);
            alert('Failed to reset credentials');
        }
    };

    const filteredDrivers = drivers.filter(
        (driver) =>
            driver.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            driver.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            driver.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            driver.phoneNumber?.includes(searchTerm)
    );

    const getLicenseStatus = (expiryDate) => {
        const now = new Date();
        const expiry = new Date(expiryDate);
        const daysLeft = Math.floor((expiry - now) / (1000 * 60 * 60 * 24));

        if (daysLeft < 0) return { status: 'EXPIRED', color: 'text-red-600', bgColor: 'bg-red-50' };
        if (daysLeft < 30) return { status: `EXPIRING (${daysLeft}d)`, color: 'text-orange-600', bgColor: 'bg-orange-50' };
        return { status: 'VALID', color: 'text-green-600', bgColor: 'bg-green-50' };
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Ambulance Drivers</h1>
                        <p className="text-gray-600 mt-1">Manage ambulance driver profiles and credentials</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingDriver(null);
                            setShowModal(true);
                        }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus size={20} /> Add Driver
                    </button>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name, email, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Error / Fallback Banner */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="text-red-600" size={20} />
                            <div>
                                <p className="font-semibold text-red-800">{error?.data?.message || 'Error loading drivers'}</p>
                                <p className="text-sm text-red-700">Please check backend connection and try again.</p>
                            </div>
                        </div>
                    </div>
                )}

                {isUsingFallback && (
                    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="text-blue-600" size={20} />
                            <div>
                                <p className="font-semibold text-blue-800">Demo Mode</p>
                                <p className="text-sm text-blue-700">Displaying sample data. Start the backend to load real data: mvn spring-boot:run</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="flex flex-col items-center gap-4">
                            <Loader className="animate-spin text-blue-600" size={40} />
                            <p className="text-gray-600 font-medium">Loading drivers...</p>
                        </div>
                    </div>
                )}

                {/* Drivers Table */}
                {!isLoading && drivers.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-100 border-b border-gray-200">
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Contact</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">License</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Certification</th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDrivers.map((driver, idx) => {
                                        const licenseStatus = getLicenseStatus(driver.licenseExpiryDate);
                                        return (
                                            <tr key={driver.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {driver.firstName} {driver.lastName}
                                                        </p>
                                                        <p className="text-sm text-gray-600">{driver.licenseNumber}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                                            <Mail size={14} />
                                                            {driver.email}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                                            <Phone size={14} />
                                                            {driver.phoneNumber}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{driver.licenseNumber}</p>
                                                        <p className="text-xs text-gray-600">
                                                            Expires: {new Date(driver.licenseExpiryDate).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${licenseStatus.bgColor}`}>
                                                        <span className={licenseStatus.color}>{licenseStatus.status}</span>
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Shield size={16} />
                                                        <span className="text-gray-700">{driver.certificationStatus || 'VERIFIED'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setEditingDriver(driver);
                                                                setShowModal(true);
                                                            }}
                                                            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                                                            title="Edit Driver"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setResetDriver(driver);
                                                                setShowResetModal(true);
                                                                setResetResult(null);
                                                            }}
                                                            className="text-orange-600 hover:text-orange-900 p-1 hover:bg-orange-50 rounded"
                                                            title="Reset Credentials"
                                                        >
                                                            <RotateCcw size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Empty State - No Data */}
                {!isLoading && drivers.length === 0 && !error && (
                    <div className="text-center py-12 bg-white rounded-lg">
                        <AlertCircle className="mx-auto text-gray-400 mb-3" size={48} />
                        <p className="text-gray-500 text-lg">No drivers found</p>
                    </div>
                )}

                {/* No Results After Search */}
                {!isLoading && drivers.length > 0 && filteredDrivers.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg">
                        <Search className="mx-auto text-gray-400 mb-3" size={48} />
                        <p className="text-gray-500 text-lg">No drivers match your search</p>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <DriverModal
                    driver={editingDriver}
                    onClose={() => {
                        setShowModal(false);
                        setEditingDriver(null);
                    }}
                    onSubmit={editingDriver ? handleUpdateDriver : handleCreateDriver}
                />
            )}

            {/* Reset Credentials Modal */}
            {showResetModal && (
                <ResetCredentialsModal
                    driver={resetDriver}
                    resetResult={resetResult}
                    onClose={() => {
                        setShowResetModal(false);
                        setResetDriver(null);
                        setResetResult(null);
                    }}
                    onConfirm={handleResetCredentials}
                />
            )}
        </div>
    );
}

function DriverModal({ driver, onClose, onSubmit }) {
    const [formData, setFormData] = React.useState(
        driver || {
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            licenseNumber: '',
            licenseExpiryDate: '',
            certificationStatus: 'VERIFIED',
        }
    );

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
                <h2 className="text-xl font-bold">{driver ? 'Edit Driver' : 'Add Driver'}</h2>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        onSubmit(formData);
                    }}
                    className="space-y-4"
                >
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                            <input
                                type="text"
                                placeholder="John"
                                value={formData.firstName}
                                onChange={(e) => handleChange('firstName', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <input
                                type="text"
                                placeholder="Doe"
                                value={formData.lastName}
                                onChange={(e) => handleChange('lastName', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                            type="tel"
                            placeholder="+91-9876543210"
                            value={formData.phoneNumber}
                            onChange={(e) => handleChange('phoneNumber', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                        <input
                            type="text"
                            placeholder="DL123456789"
                            value={formData.licenseNumber}
                            onChange={(e) => handleChange('licenseNumber', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">License Expiry Date</label>
                        <input
                            type="date"
                            value={formData.licenseExpiryDate}
                            onChange={(e) => handleChange('licenseExpiryDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Certification Status</label>
                        <select
                            value={formData.certificationStatus}
                            onChange={(e) => handleChange('certificationStatus', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="VERIFIED">Verified</option>
                            <option value="PENDING">Pending</option>
                            <option value="SUSPENDED">Suspended</option>
                        </select>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function ResetCredentialsModal({ driver, resetResult, onClose, onConfirm }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b">
                    <div className="bg-orange-100 p-3 rounded-full">
                        <RotateCcw className="text-orange-600" size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Reset Credentials</h2>
                        <p className="text-sm text-gray-600">{driver?.firstName} {driver?.lastName}</p>
                    </div>
                </div>

                {!resetResult ? (
                    <>
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <p className="text-sm text-orange-800">
                                <strong>Warning:</strong> This will generate a new temporary password and reset all authentication tokens.
                                The driver will need to update their password on next login.
                            </p>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
                            >
                                Reset
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-sm font-medium text-green-800 mb-3">Credentials reset successfully!</p>
                            <div className="bg-white rounded border border-green-200 p-3 space-y-2">
                                <div>
                                    <p className="text-xs text-gray-600">Temporary Password:</p>
                                    <p className="text-sm font-mono font-bold text-gray-900 break-all">{resetResult.temporaryPassword}</p>
                                </div>
                                {resetResult.tempEmail && (
                                    <div>
                                        <p className="text-xs text-gray-600">Email:</p>
                                        <p className="text-sm font-mono text-gray-900">{resetResult.tempEmail}</p>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-gray-600 mt-3">
                                Copy this password and share it securely with the driver. They must update it on their first login.
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                        >
                            Close
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
