/**
 * Phlebotomist Profile
 * View and manage phlebotomist profile information
 */

import React, { useState } from 'react';
import { Edit2, Save, X, Mail, Phone, MapPin, Award, Calendar } from 'lucide-react';
import { PageHeader, Card, CardHeader, CardTitle, CardContent, Button, Input, Toast } from '../../ui';

export default function PhlebotomistProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [toastState, setToastState] = useState({ isOpen: false, type: 'success', message: '' });

  // Mock user data - replace with actual API call
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@medibridge.com',
    phoneNumber: '+1 (555) 123-4567',
    certificationNumber: 'CERT-2024-001',
    certificationIssuingBody: 'Medical Board',
    certificationExpiryDate: '2026-12-31',
    employeeId: 'PHB-2024-001',
    joiningDate: '2024-01-15',
    shiftType: 'MORNING',
    assignedZone: 'Zone A',
    specialization: 'Venipuncture',
    status: 'ACTIVE',
  });

  const [editData, setEditData] = useState(profileData);

  const showToast = (type, message) => {
    setToastState({ isOpen: true, type, message });
    setTimeout(() => setToastState({ ...toastState, isOpen: false }), 5000);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      // TODO: Call API to update profile
      setProfileData(editData);
      setIsEditing(false);
      showToast('success', 'Profile updated successfully');
    } catch (error) {
      showToast('error', 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="My Profile"
        subtitle="Manage your professional profile and credentials"
        actions={
          !isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Edit Profile
            </Button>
          )
        }
      />

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  name="firstName"
                  value={editData.firstName}
                  onChange={handleEditChange}
                  placeholder="Enter first name"
                />
              ) : (
                <p className="text-gray-900">{profileData.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  name="lastName"
                  value={editData.lastName}
                  onChange={handleEditChange}
                  placeholder="Enter last name"
                />
              ) : (
                <p className="text-gray-900">{profileData.lastName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </label>
              <p className="text-gray-900">{profileData.email}</p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </label>
              {isEditing ? (
                <Input
                  type="tel"
                  name="phoneNumber"
                  value={editData.phoneNumber}
                  onChange={handleEditChange}
                  placeholder="Enter phone number"
                />
              ) : (
                <p className="text-gray-900">{profileData.phoneNumber}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Joining Date
              </label>
              <p className="text-gray-900">{profileData.joiningDate}</p>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  profileData.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {profileData.status}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Credentials */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Professional Credentials
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Certification Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certification Number
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  name="certificationNumber"
                  value={editData.certificationNumber}
                  onChange={handleEditChange}
                  placeholder="Enter certification number"
                />
              ) : (
                <p className="text-gray-900">{profileData.certificationNumber}</p>
              )}
            </div>

            {/* Certification Issuing Body */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certification Issuing Body
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  name="certificationIssuingBody"
                  value={editData.certificationIssuingBody}
                  onChange={handleEditChange}
                  placeholder="Enter issuing body"
                />
              ) : (
                <p className="text-gray-900">{profileData.certificationIssuingBody}</p>
              )}
            </div>

            {/* Certification Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certification Expiry Date
              </label>
              {isEditing ? (
                <Input
                  type="date"
                  name="certificationExpiryDate"
                  value={editData.certificationExpiryDate}
                  onChange={handleEditChange}
                />
              ) : (
                <p className="text-gray-900">{profileData.certificationExpiryDate}</p>
              )}
            </div>

            {/* Specialization */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialization
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  name="specialization"
                  value={editData.specialization}
                  onChange={handleEditChange}
                  placeholder="e.g., Venipuncture"
                />
              ) : (
                <p className="text-gray-900">{profileData.specialization}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Employment Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Employee ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee ID
              </label>
              <p className="text-gray-900">{profileData.employeeId}</p>
            </div>

            {/* Shift Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shift Type
              </label>
              {isEditing ? (
                <select
                  name="shiftType"
                  value={editData.shiftType}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MORNING">Morning</option>
                  <option value="EVENING">Evening</option>
                  <option value="NIGHT">Night</option>
                  <option value="ROTATIONAL">Rotational</option>
                </select>
              ) : (
                <p className="text-gray-900">{profileData.shiftType}</p>
              )}
            </div>

            {/* Assigned Zone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned Zone
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  name="assignedZone"
                  value={editData.assignedZone}
                  onChange={handleEditChange}
                  placeholder="e.g., Zone A"
                />
              ) : (
                <p className="text-gray-900">{profileData.assignedZone}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {isEditing && (
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleCancel} className="flex items-center gap-2">
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      )}

      {/* Toast */}
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
