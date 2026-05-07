/**
 * Admin Ambulance Drivers Management Page
 * Create, edit, manage ambulance driver profiles and credentials
 */
import React, { useState } from 'react';
import { Plus, Edit2, RotateCcw, Search, Mail, Phone, Shield, AlertCircle, Loader, Pause, Play, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import {
    useGetAmbulanceDriversQuery,
    useCreateAmbulanceDriverMutation,
    useUpdateAmbulanceDriverMutation,
    useResetDriverCredentialsMutation,
    useUpdateDriverStatusMutation,
    usePauseDriverMutation,
    useResumeDriverMutation,
} from '../../app/api/ambulanceApi';
import DriverForm from '../../components/ambulance/DriverForm';
import CredentialsDisplayModal from '../../components/ambulance/CredentialsDisplayModal';

export default function AdminAmbulanceDrivers() {
    const [page, setPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFormModal, setShowFormModal] = useState(false);
    const [showCredentialsModal, setShowCredentialsModal] = useState(false);
    const [editingDriver, setEditingDriver] = useState(null);
    const [credentials, setCredentials] = useState(null);
    const [pauseReason, setPauseReason] = useState('');
    const [showPauseModal, setShowPauseModal] = useState(false);
    const [pausingDriver, setPausingDriver] = useState(null);

    // RTK Query hooks
    const { data: driversPage, isLoading, error, refetch } = useGetAmbulanceDriversQuery({
        page,
        size: 10,
        search: searchTerm
    });
    const [createDriver, { isLoading: isCreating }] = useCreateAmbulanceDriverMutation();
    const [updateDriver, { isLoading: isUpdating }] = useUpdateAmbulanceDriverMutation();
    const [resetCredentials, { isLoading: isResetting }] = useResetDriverCredentialsMutation();
    const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateDriverStatusMutation();
    const [pauseDriver, { isLoading: isPausing }] = usePauseDriverMutation();
    const [resumeDriver, { isLoading: isResuming }] = useResumeDriverMutation();

    const drivers = driversPage?.content || [];
    const totalPages = driversPage?.totalPages || 0;

    const handleCreateDriver = async (formData) => {
        try {
            const response = await createDriver(formData).unwrap();
            toast.success('Ambulance driver created successfully!');
            setShowFormModal(false);
            // Show credentials modal with the response
            setCredentials(response);
            setShowCredentialsModal(true);
            refetch();
        } catch (err) {
            const errorMsg = err?.data?.message || 'Failed to create driver';
            toast.error(errorMsg);
            console.error('Error creating driver:', err);
        }
    };

    const handleUpdateDriver = async (formData) => {
        try {
            await updateDriver({ id: editingDriver.userId, ...formData }).unwrap();
            toast.success('Driver updated successfully!');
            setShowFormModal(false);
            setEditingDriver(null);
            refetch();
        } catch (err) {
            const errorMsg = err?.data?.message || 'Failed to update driver';
            toast.error(errorMsg);
            console.error('Error updating driver:', err);
        }
    };

    const handleResetCredentials = async (driver) => {
        try {
            const response = await resetCredentials(driver.userId).unwrap();
            toast.success('Credentials reset successfully!');
            setCredentials(response);
            setShowCredentialsModal(true);
        } catch (err) {
            const errorMsg = err?.data?.message || 'Failed to reset credentials';
            toast.error(errorMsg);
            console.error('Error resetting credentials:', err);
        }
    };

    const handlePauseDriver = async () => {
        if (!pauseReason.trim()) {
            toast.error('Please enter a reason for pausing');
            return;
        }
        try {
            await pauseDriver({ id: pausingDriver.userId, reason: pauseReason }).unwrap();
            toast.success('Driver paused successfully!');
            setShowPauseModal(false);
            setPausingDriver(null);
            setPauseReason('');
            refetch();
        } catch (err) {
            const errorMsg = err?.data?.message || 'Failed to pause driver';
            toast.error(errorMsg);
            console.error('Error pausing driver:', err);
        }
    };

    const handleResumeDriver = async (driverId) => {
        try {
            await resumeDriver(driverId).unwrap();
            toast.success('Driver resumed successfully!');
            refetch();
        } catch (err) {
            const errorMsg = err?.data?.message || 'Failed to resume driver';
            toast.error(errorMsg);
            console.error('Error resuming driver:', err);
        }
    };

    const handleToggleStatus = async (driver) => {
        try {
            const newStatus = driver.isActive ? 'INACTIVE' : 'ACTIVE';
            await updateStatus({ id: driver.userId, status: newStatus }).unwrap();
            toast.success(`Driver ${newStatus.toLowerCase()} successfully!`);
            refetch();
        } catch (err) {
            const errorMsg = err?.data?.message || 'Failed to update driver status';
            toast.error(errorMsg);
            console.error('Error updating status:', err);
        }
    };

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
                            setShowFormModal(true);
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

                {/* Error Banner */}
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
                                    {drivers.map((driver, idx) => {
                                        const licenseStatus = getLicenseStatus(driver.licenseExpiry);
                                        return (
                                            <tr key={driver.userId} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
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
                                                            Expires: {new Date(driver.licenseExpiry).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                                        driver.isActive 
                                                            ? 'bg-green-100 text-green-700' 
                                                            : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {driver.isActive ? 'ACTIVE' : 'INACTIVE'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Shield size={16} />
                                                        <span className="text-gray-700">{driver.certificationNumber || 'N/A'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setEditingDriver(driver);
                                                                setShowFormModal(true);
                                                            }}
                                                            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                                                            title="Edit Driver"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleResetCredentials(driver)}
                                                            disabled={isResetting}
                                                            className="text-orange-600 hover:text-orange-900 p-1 hover:bg-orange-50 rounded disabled:opacity-50"
                                                            title="Reset Credentials"
                                                        >
                                                            <RotateCcw size={18} />
                                                        </button>
                                                        {driver.isActive ? (
                                                            <button
                                                                onClick={() => {
                                                                    setPausingDriver(driver);
                                                                    setShowPauseModal(true);
                                                                }}
                                                                className="text-yellow-600 hover:text-yellow-900 p-1 hover:bg-yellow-50 rounded"
                                                                title="Pause Driver"
                                                            >
                                                                <Pause size={18} />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleResumeDriver(driver.userId)}
                                                                disabled={isResuming}
                                                                className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded disabled:opacity-50"
                                                                title="Resume Driver"
                                                            >
                                                                <Play size={18} />
                                                            </button>
                                                        )}
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
                {!isLoading && drivers.length === 0 && searchTerm && !error && (
                    <div className="text-center py-12 bg-white rounded-lg">
                        <Search className="mx-auto text-gray-400 mb-3" size={48} />
                        <p className="text-gray-500 text-lg">No drivers match your search</p>
                    </div>
                )}
            </div>

            {/* Form Modal */}
            {showFormModal && (
                <DriverForm
                    driver={editingDriver}
                    onClose={() => {
                        setShowFormModal(false);
                        setEditingDriver(null);
                    }}
                    onSubmit={editingDriver ? handleUpdateDriver : handleCreateDriver}
                    isLoading={isCreating || isUpdating}
                />
            )}

            {/* Credentials Modal */}
            {showCredentialsModal && (
                <CredentialsDisplayModal
                    credentials={credentials}
                    driver={editingDriver}
                    isOpen={showCredentialsModal}
                    onClose={() => {
                        setShowCredentialsModal(false);
                        setCredentials(null);
                    }}
                />
            )}

            {/* Pause Driver Modal */}
            {showPauseModal && pausingDriver && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
                        <div className="flex items-center gap-3 pb-4 border-b">
                            <div className="bg-yellow-100 p-3 rounded-full">
                                <Pause className="text-yellow-600" size={24} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Pause Driver</h2>
                                <p className="text-sm text-gray-600">{pausingDriver.firstName} {pausingDriver.lastName}</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Reason for pausing</label>
                            <textarea
                                value={pauseReason}
                                onChange={(e) => setPauseReason(e.target.value)}
                                placeholder="e.g., Medical leave, License renewal, etc."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows="4"
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={() => {
                                    setShowPauseModal(false);
                                    setPausingDriver(null);
                                    setPauseReason('');
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePauseDriver}
                                disabled={isPausing}
                                className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium disabled:opacity-50"
                            >
                                {isPausing ? 'Pausing...' : 'Pause'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
