/**
 * Admin Doctors Management Page
 * Complete doctor management with create, verify, activate, deactivate, delete
 * Uses all admin/doctor endpoints from user_service
 */

import { useState } from 'react';
import { Plus, Search, Filter, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/layout';
import {
  useGetPendingVerificationsQuery,
  useCreateDoctorMutation,
  useVerifyDoctorMutation,
  useDeleteDoctorMutation,
} from '../../features/user/doctorApi';
import { useUpdateUserStatusMutation, useGetAllDoctorsAdminQuery } from '../../features/user/adminApi';
import { useToast } from '../../components/feedback/ToastProvider';
import DoctorTable from '../../components/admin/DoctorTable';
import CreateDoctorModal from '../../components/admin/CreateDoctorModal';
import MetricCard from '../../components/dashboard/MetricCard';
import { Users, UserCheck, UserX, AlertTriangle } from 'lucide-react';
import { SkeletonStats, SkeletonTable } from '../../components/feedback/Skeleton';

const Doctors = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterVerification, setFilterVerification] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);

  // Queries
  const { data: allDoctors = [], isLoading, refetch } = useGetAllDoctorsAdminQuery();
  const { data: pendingDoctors = [] } = useGetPendingVerificationsQuery();

  // Mutations
  const [createDoctor, { isLoading: creating }] = useCreateDoctorMutation();
  const [verifyDoctor, { isLoading: verifying }] = useVerifyDoctorMutation();
  const [updateUserStatus, { isLoading: updatingStatus }] = useUpdateUserStatusMutation();
  const [deleteDoctor, { isLoading: deleting }] = useDeleteDoctorMutation();

  // Statistics
  const stats = {
    total: allDoctors.length,
    verified: allDoctors.filter((d) => d.verificationStatus === 'VERIFIED').length,
    pending: pendingDoctors.length,
    active: allDoctors.filter((d) => d.status === 'ACTIVE').length,
  };

  // Filter doctors
  const filteredDoctors = allDoctors.filter((doctor) => {
    // Status filter
    if (filterStatus !== 'ALL' && doctor.status !== filterStatus) {
      return false;
    }

    // Verification filter
    if (filterVerification !== 'ALL' && doctor.verificationStatus !== filterVerification) {
      return false;
    }

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        doctor.firstName?.toLowerCase().includes(search) ||
        doctor.lastName?.toLowerCase().includes(search) ||
        doctor.email?.toLowerCase().includes(search) ||
        doctor.specialization?.toLowerCase().includes(search) ||
        doctor.licenseNumber?.toLowerCase().includes(search)
      );
    }

    return true;
  });

  // ========== Actions ==========

  const handleCreateDoctor = async (data) => {
    try {
      const result = await createDoctor(data).unwrap();
      showToast.success('Doctor created successfully!');
      refetch();
      return result; // Return for success screen
    } catch (error) {
      showToast.error(error?.data?.message || 'Failed to create doctor');
      return null;
    }
  };

  const handleVerifyDoctor = (doctor) => {
    setConfirmAction({
      title: 'Verify Doctor',
      message: `Verify credentials for Dr. ${doctor.firstName} ${doctor.lastName}? This will activate their account.`,
      type: 'success',
      confirmText: 'Verify',
      onConfirm: async () => {
        try {
          await verifyDoctor({
            doctorId: doctor.id,
            verifyData: {
              verified: true,
              verificationNotes: 'Verified by admin',
            },
          }).unwrap();
          showToast.success(`Dr. ${doctor.firstName} ${doctor.lastName} verified successfully!`);
          refetch();
        } catch (error) {
          showToast.error(error?.data?.message || 'Failed to verify doctor');
        } finally {
          setConfirmAction(null);
        }
      },
    });
  };

  const handleActivateDoctor = (doctor) => {
    setConfirmAction({
      title: 'Activate Doctor',
      message: `Activate Dr. ${doctor.firstName} ${doctor.lastName}? They will be able to manage patients.`,
      type: 'success',
      confirmText: 'Activate',
      onConfirm: async () => {
        try {
          await updateUserStatus({ userId: doctor.userId, status: 'ACTIVE' }).unwrap();
          showToast.success(`Dr. ${doctor.firstName} ${doctor.lastName} activated!`);
          refetch();
        } catch (error) {
          showToast.error(error?.data?.message || 'Failed to activate doctor');
        } finally {
          setConfirmAction(null);
        }
      },
    });
  };

  const handleDeactivateDoctor = (doctor) => {
    setConfirmAction({
      title: 'Deactivate Doctor',
      message: `Deactivate Dr. ${doctor.firstName} ${doctor.lastName}? They will not be able to access the system.`,
      type: 'warning',
      confirmText: 'Deactivate',
      onConfirm: async () => {
        try {
          await updateUserStatus({ userId: doctor.userId, status: 'INACTIVE' }).unwrap();
          showToast.warning(`Dr. ${doctor.firstName} ${doctor.lastName} deactivated.`);
          refetch();
        } catch (error) {
          showToast.error(error?.data?.message || 'Failed to deactivate doctor');
        } finally {
          setConfirmAction(null);
        }
      },
    });
  };

  const handleDeleteDoctor = (doctor) => {
    setConfirmAction({
      title: 'Delete Doctor',
      message: `Are you sure you want to delete Dr. ${doctor.firstName} ${doctor.lastName}? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          await deleteDoctor(doctor.userId).unwrap();
          showToast.success(`Dr. ${doctor.firstName} ${doctor.lastName} deleted.`);
          refetch();
        } catch (error) {
          showToast.error(error?.data?.message || 'Failed to delete doctor');
        } finally {
          setConfirmAction(null);
        }
      },
    });
  };

  const handleViewDetails = (doctor) => {
    navigate(`/admin/doctors/${doctor.id}`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Doctor Management"
        subtitle="Manage doctor accounts, verifications, and access"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Doctors' }]}
        actions={
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Doctor
          </button>
        }
      />

      {/* Statistics */}
      {isLoading ? (
        <SkeletonStats count={4} className="mb-6" />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <MetricCard
            title="Total Doctors"
            value={stats.total}
            icon={Users}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <MetricCard
            title="Verified"
            value={stats.verified}
            icon={UserCheck}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
          <MetricCard
            title="Pending Verification"
            value={stats.pending}
            icon={AlertTriangle}
            iconColor={stats.pending > 0 ? 'text-yellow-600' : 'text-gray-400'}
            iconBgColor={stats.pending > 0 ? 'bg-yellow-100' : 'bg-gray-100'}
            onClick={stats.pending > 0 ? () => setFilterVerification('PENDING') : undefined}
          />
          <MetricCard
            title="Active"
            value={stats.active}
            icon={UserX}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
          />
        </div>
      )}

      {/* Pending Verification Alert */}
      {!isLoading && stats.pending > 0 && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-900">Pending Verifications</h3>
              <p className="text-sm text-yellow-700 mt-1">
                {stats.pending} doctor{stats.pending > 1 ? 's' : ''} waiting for verification. Review and verify to activate their accounts.
              </p>
              <button
                onClick={() => setFilterVerification('PENDING')}
                className="mt-3 text-sm font-medium text-yellow-900 hover:text-yellow-800 underline"
              >
                View Pending Doctors →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>

          {/* Verification Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterVerification}
              onChange={(e) => setFilterVerification(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="ALL">All Verification</option>
              <option value="VERIFIED">Verified</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, license..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Doctors Table */}
      {isLoading ? (
        <SkeletonTable rows={5} columns={6} />
      ) : (
        <DoctorTable
          doctors={filteredDoctors}
          onViewDetails={handleViewDetails}
          onVerify={handleVerifyDoctor}
          onActivate={handleActivateDoctor}
          onDeactivate={handleDeactivateDoctor}
          onDelete={handleDeleteDoctor}
          isLoading={verifying || updatingStatus || deleting}
        />
      )}

      {/* Create Doctor Modal */}
      <CreateDoctorModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateDoctor}
        isLoading={creating}
      />

      {/* Confirmation Modal */}
      {confirmAction && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setConfirmAction(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle
                  className={`h-6 w-6 flex-shrink-0 mt-0.5 ${
                    confirmAction.type === 'danger'
                      ? 'text-red-600'
                      : confirmAction.type === 'warning'
                      ? 'text-yellow-600'
                      : confirmAction.type === 'success'
                      ? 'text-green-600'
                      : 'text-blue-600'
                  }`}
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{confirmAction.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{confirmAction.message}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction.onConfirm}
                  className={`px-4 py-2 text-white text-sm font-medium rounded-md transition-colors ${
                    confirmAction.type === 'danger'
                      ? 'bg-red-600 hover:bg-red-700'
                      : confirmAction.type === 'warning'
                      ? 'bg-yellow-600 hover:bg-yellow-700'
                      : confirmAction.type === 'success'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {confirmAction.confirmText}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Doctors;
