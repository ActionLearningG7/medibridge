/**
 * Doctor Management Page
 * Admin interface for managing doctors
 * Uses AdminController and DoctorController endpoints
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetAllDoctorsAdminQuery,
  useDeleteDoctorMutation,
} from '../../features/user/adminApi';
import {
  useSearchDoctorsQuery,
  useLazySearchDoctorsQuery,
  useGetPendingVerificationsQuery,
  useGetExpiringLicensesQuery,
  useVerifyDoctorMutation,
} from '../../features/user/doctorApi';
import DoctorTable from '../../components/admin/DoctorTable';
import DoctorForm from '../../components/admin/DoctorForm';
import DoctorDetails from './DoctorDetails';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';

const DoctorManagement = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('all'); // all | pending | expiring
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Queries
  const { data: allDoctors, isLoading: isLoadingAll, refetch: refetchAll } = useGetAllDoctorsAdminQuery();
  const { data: pendingDoctors, isLoading: isLoadingPending } = useGetPendingVerificationsQuery();
  const { data: expiringLicenses, isLoading: isLoadingExpiring } = useGetExpiringLicensesQuery(30);
  const [searchDoctors, { data: searchResults, isLoading: isSearching }] = useLazySearchDoctorsQuery();

  // Mutations
  const [deleteDoctor, { isLoading: isDeleting }] = useDeleteDoctorMutation();
  const [verifyDoctor, { isLoading: isVerifying }] = useVerifyDoctorMutation();

  // Get current data based on view
  const getCurrentData = () => {
    if (searchTerm && searchResults) return searchResults;
    switch (view) {
      case 'pending':
        return pendingDoctors || [];
      case 'expiring':
        return expiringLicenses || [];
      default:
        return allDoctors || [];
    }
  };

  const isLoading = isLoadingAll || isLoadingPending || isLoadingExpiring || isSearching;
  const doctors = getCurrentData();

  // Handlers
  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term.trim()) {
      searchDoctors(term);
    }
  };

  const handleViewChange = (newView) => {
    setView(newView);
    setSearchTerm('');
  };

  const handleViewDetails = (doctor) => {
    setSelectedDoctor(doctor);
    setShowDetailsDrawer(true);
  };

  const handleCreateDoctor = () => {
    setShowCreateForm(true);
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    refetchAll();
    showToast('Doctor created successfully', 'success');
  };

  const handleVerify = async (doctorId, verificationData) => {
    try {
      await verifyDoctor({ doctorId, verificationData }).unwrap();
      showToast('Doctor verified successfully', 'success');
      refetchAll();
    } catch (error) {
      showToast(error?.data?.message || 'Failed to verify doctor', 'error');
    }
  };

  const handleDeleteClick = (doctor) => {
    setConfirmDelete(doctor);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;

    try {
      await deleteDoctor(confirmDelete.userId).unwrap();
      showToast('Doctor deleted successfully', 'success');
      setConfirmDelete(null);
      refetchAll();
      if (showDetailsDrawer) {
        setShowDetailsDrawer(false);
      }
    } catch (error) {
      showToast(error?.data?.message || 'Failed to delete doctor', 'error');
    }
  };

  const showToast = (message, type) => {
    // Simple toast implementation
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white z-50 ${
      type === 'success' ? 'bg-green-600' : 'bg-red-600'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Doctor Management</h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage doctors, verify credentials, and monitor licenses
              </p>
            </div>
            <button
              onClick={handleCreateDoctor}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Doctor
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* View Tabs */}
            <div className="flex space-x-2">
              <button
                onClick={() => handleViewChange('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  view === 'all'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Doctors ({allDoctors?.length || 0})
              </button>
              <button
                onClick={() => handleViewChange('pending')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  view === 'pending'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending Verification ({pendingDoctors?.length || 0})
              </button>
              <button
                onClick={() => handleViewChange('expiring')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  view === 'expiring'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Expiring Licenses ({expiringLicenses?.length || 0})
              </button>
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search by name or license..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Doctor Table */}
        {isLoading ? (
          <div className="bg-white shadow rounded-lg p-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : doctors.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No doctors found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search' : 'Get started by creating a new doctor'}
            </p>
          </div>
        ) : (
          <DoctorTable
            doctors={doctors}
            onViewDetails={handleViewDetails}
            onDelete={handleDeleteClick}
            onVerify={handleVerify}
            isVerifying={isVerifying}
          />
        )}

        {/* Create Doctor Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Create New Doctor</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <DoctorForm
                onSuccess={handleCreateSuccess}
                onCancel={() => setShowCreateForm(false)}
              />
            </div>
          </div>
        )}

        {/* Doctor Details Drawer */}
        {showDetailsDrawer && selectedDoctor && (
          <DoctorDetails
            doctor={selectedDoctor}
            onClose={() => setShowDetailsDrawer(false)}
            onDelete={handleDeleteClick}
            onVerify={handleVerify}
            isVerifying={isVerifying}
          />
        )}

        {/* Delete Confirmation Modal */}
        {confirmDelete && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="mt-3 text-center">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Doctor</h3>
                  <div className="mt-2 px-7 py-3">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete Dr. {confirmDelete.firstName} {confirmDelete.lastName}?
                      This action will soft delete the doctor profile.
                    </p>
                  </div>
                  <div className="flex justify-center gap-4 mt-4">
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                      disabled={isDeleting}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteConfirm}
                      disabled={isDeleting}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorManagement;
