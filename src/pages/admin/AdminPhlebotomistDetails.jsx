/**
 * Admin Phlebotomist Details Page
 * View and edit phlebotomist information
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Shield, RotateCcw, Check, X } from 'lucide-react';
import {
  useGetPhlebotomistDetailQuery,
  useUpdatePhlebotomistMutation,
  useUpdatePhlebotomistStatusMutation,
  useResetPhlebotomistCredentialsMutation,
} from '../../app/api/adminUserApi';
import { PageHeader, Card, Button, Input, Badge, Toast } from '../../ui';

export default function AdminPhlebotomistDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [toastState, setToastState] = useState({ isOpen: false, type: 'success', message: '' });

  // Debug logging
  console.log('🔍 AdminPhlebotomistDetails rendered with id:', id);
  console.log('   Type:', typeof id, '| Value:', JSON.stringify(id));

  // Check if id is valid (not undefined, null, or string 'undefined')
  const isValidId = id && id !== 'undefined' && id !== 'null';
  console.log('   Is Valid ID:', isValidId);

  // Queries - skip if id is invalid
  const { data: phlebotomist, isLoading, error, refetch } = useGetPhlebotomistDetailQuery(id, {
    skip: !isValidId,
  });
  const [updatePhlebotomist] = useUpdatePhlebotomistMutation();
  const [updateStatus] = useUpdatePhlebotomistStatusMutation();
  const [resetCredentials] = useResetPhlebotomistCredentialsMutation();

  const showToast = (type, message) => {
    setToastState({ isOpen: true, type, message });
    setTimeout(() => setToastState({ ...toastState, isOpen: false }), 5000);
  };

  const handleEditClick = () => {
    setEditData(phlebotomist);
    setIsEditing(true);
  };

  const handleEditChange = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveEdit = async () => {
    if (!id) {
      showToast('error', 'Invalid phlebotomist ID');
      return;
    }

    try {
      await updatePhlebotomist({ id, ...editData }).unwrap();
      showToast('success', 'Phlebotomist updated successfully!');
      setIsEditing(false);
      refetch();
    } catch (err) {
      showToast('error', err?.data?.message || 'Failed to update phlebotomist');
    }
  };

  const handleStatusToggle = async () => {
    if (!id) {
      showToast('error', 'Invalid phlebotomist ID');
      return;
    }

    try {
      const newStatus = phlebotomist.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await updateStatus({ id, status: newStatus }).unwrap();
      showToast(
        'success',
        `Phlebotomist ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully!`
      );
      refetch();
    } catch (err) {
      showToast('error', err?.data?.message || 'Failed to update status');
    }
  };

  const handleResetCredentials = async () => {
    if (!id) {
      showToast('error', 'Invalid phlebotomist ID');
      return;
    }

    if (
      !window.confirm(
        'Are you sure you want to reset credentials? A new temporary password will be generated.'
      )
    ) {
      return;
    }

    try {
      await resetCredentials(id).unwrap();
      showToast('success', 'Credentials reset. New password sent to email.');
    } catch (err) {
      showToast('error', err?.data?.message || 'Failed to reset credentials');
    }
  };

  // Early return if no ID is provided or ID is invalid
  if (!isValidId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Error" subtitle="Invalid phlebotomist ID" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-6 border-yellow-200 bg-yellow-50">
            <p className="font-semibold text-yellow-900">No phlebotomist ID provided</p>
            <p className="text-sm text-yellow-700 mt-1">Please select a phlebotomist from the list</p>
            <p className="text-xs text-gray-600 mt-2">Debug: Received ID = "{id}"</p>
            <Button
              variant="outline"
              onClick={() => navigate('/admin/phlebotomists')}
              className="mt-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Phlebotomists
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Loading..." subtitle="Fetching details..." />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto" />
            <p className="text-gray-600 mt-4">Loading phlebotomist details...</p>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !phlebotomist) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Error" subtitle="Failed to load details" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-6 border-red-200 bg-red-50">
            <p className="font-semibold text-red-900">Failed to load phlebotomist details</p>
            <p className="text-sm text-red-700 mt-1">{error?.data?.message || 'Please try again'}</p>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
              <Button variant="outline" onClick={() => navigate('/admin/phlebotomists')}>
                Back to List
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const displayData = isEditing ? editData : phlebotomist;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title={`${phlebotomist.firstName} ${phlebotomist.lastName}`}
        subtitle={phlebotomist.employeeId}
        actions={[
          {
            label: 'Back to List',
            onClick: () => navigate('/admin/phlebotomists'),
            variant: 'outline',
          },
        ]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <Card>
              <div className="p-6 flex items-center justify-between border-b border-gray-200">
                <div>
                  <h3 className="font-semibold text-gray-900">Account Status</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {phlebotomist.status === 'ACTIVE'
                      ? 'This account is active and can be assigned tasks'
                      : 'This account is inactive and cannot be assigned tasks'}
                  </p>
                </div>
                <Badge
                  variant={phlebotomist.status === 'ACTIVE' ? 'success' : 'secondary'}
                >
                  {phlebotomist.status}
                </Badge>
              </div>
              <div className="p-6 flex gap-3">
                <Button variant="outline" onClick={handleStatusToggle}>
                  {phlebotomist.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                </Button>
                <Button variant="outline" onClick={handleResetCredentials}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Credentials
                </Button>
              </div>
            </Card>

            {/* Personal Information */}
            <Card>
              <div className="p-6 flex items-center justify-between border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Personal Information</h3>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditClick}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    {isEditing ? (
                      <Input
                        type="text"
                        value={editData.firstName}
                        onChange={(e) => handleEditChange('firstName', e.target.value)}
                      />
                    ) : (
                      <p className="text-gray-900">{displayData.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    {isEditing ? (
                      <Input
                        type="text"
                        value={editData.lastName}
                        onChange={(e) => handleEditChange('lastName', e.target.value)}
                      />
                    ) : (
                      <p className="text-gray-900">{displayData.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={editData.email}
                        onChange={(e) => handleEditChange('email', e.target.value)}
                      />
                    ) : (
                      <p className="text-gray-900">{displayData.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    {isEditing ? (
                      <Input
                        type="tel"
                        value={editData.phone}
                        onChange={(e) => handleEditChange('phone', e.target.value)}
                      />
                    ) : (
                      <p className="text-gray-900">{displayData.phone}</p>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={handleSaveEdit}>
                      <Check className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Professional Information */}
            <Card>
              <div className="p-6 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Professional Information</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee ID
                    </label>
                    <p className="text-gray-900">{phlebotomist.employeeId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      License Number
                    </label>
                    <p className="text-gray-900">{phlebotomist.licenseNumber}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      License Expiry Date
                    </label>
                    <p className="text-gray-900">
                      {new Date(phlebotomist.licenseExpiryDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Specialization
                    </label>
                    <p className="text-gray-900">{phlebotomist.specialization || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Account Info */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Account Information</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <label className="text-gray-600">Created</label>
                  <p className="text-gray-900 font-medium">
                    {new Date(phlebotomist.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-gray-600">Last Updated</label>
                  <p className="text-gray-900 font-medium">
                    {new Date(phlebotomist.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">User ID: {phlebotomist.userId}</p>
                  {phlebotomist.phlebotomistProfileId && (
                    <p className="text-xs text-gray-500 mt-1">Profile ID: {phlebotomist.phlebotomistProfileId}</p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {toastState.isOpen && (
        <Toast
          variant={toastState.type}
          title={toastState.type === 'success' ? 'Success' : 'Error'}
          message={toastState.message}
          isOpen={toastState.isOpen}
          onClose={() => setToastState({ ...toastState, isOpen: false })}
        />
      )}
    </div>
  );
}
