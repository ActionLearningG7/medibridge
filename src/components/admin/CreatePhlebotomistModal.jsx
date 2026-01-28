/**
 * Create Phlebotomist Modal
 * Form to create new phlebotomist account
 */

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useCreatePhlebotomistMutation } from '../../app/api/adminUserApi';
import { Modal, Button, Input, Toast } from '../../ui';

const GENDERS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
];

const SHIFT_TYPES = [
  { value: 'MORNING', label: 'Morning' },
  { value: 'EVENING', label: 'Evening' },
  { value: 'NIGHT', label: 'Night' },
  { value: 'ROTATIONAL', label: 'Rotational' },
];

export default function CreatePhlebotomistModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',

    // Credentials
    certificationNumber: '',
    certificationIssuingBody: '',
    certificationExpiryDate: '',

    // Employment
    employeeId: '',
    joiningDate: '',
    shiftType: '',
    assignedZone: '',
    specialization: '',

    // Admin privileges
    isAdmin: false,
  });

  const [errors, setErrors] = useState({});
  const [toastState, setToastState] = useState({ isOpen: false, type: 'success', message: '' });

  const [createPhlebotomist, { isLoading }] = useCreatePhlebotomistMutation();

  const showToast = (type, message) => {
    setToastState({ isOpen: true, type, message });
    setTimeout(() => setToastState({ ...toastState, isOpen: false }), 5000);
  };

  const validateForm = () => {
    const newErrors = {};

    // Personal Information
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else if (new Date(formData.dateOfBirth) >= new Date()) {
      newErrors.dateOfBirth = 'Date of birth cannot be in the future';
    }
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    // Credentials
    if (!formData.certificationNumber.trim()) {
      newErrors.certificationNumber = 'Certification number is required';
    }
    if (!formData.certificationIssuingBody.trim()) {
      newErrors.certificationIssuingBody = 'Certification issuing body is required';
    }
    if (!formData.certificationExpiryDate) {
      newErrors.certificationExpiryDate = 'Certification expiry date is required';
    } else if (new Date(formData.certificationExpiryDate) < new Date()) {
      newErrors.certificationExpiryDate = 'Certification cannot be expired';
    }

    // Employment
    if (!formData.employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required';
    }
    if (!formData.joiningDate) {
      newErrors.joiningDate = 'Joining date is required';
    }
    if (!formData.shiftType) {
      newErrors.shiftType = 'Shift type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await createPhlebotomist(formData).unwrap();
      showToast('success', 'Phlebotomist created successfully!');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        dateOfBirth: '',
        gender: '',
        certificationNumber: '',
        certificationIssuingBody: '',
        certificationExpiryDate: '',
        employeeId: '',
        joiningDate: '',
        shiftType: '',
        assignedZone: '',
        specialization: '',
      });
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (err) {
      showToast('error', err?.data?.message || 'Failed to create phlebotomist');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
            <h2 className="text-xl font-semibold text-gray-900">Add Phlebotomist</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Personal Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-600">*</span>
                  </label>
                  <Input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    error={errors.firstName}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-600">*</span>
                  </label>
                  <Input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    error={errors.lastName}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-600">*</span>
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                    error={errors.email}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-600">*</span>
                  </label>
                  <Input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    error={errors.phoneNumber}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth <span className="text-red-600">*</span>
                  </label>
                  <Input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    error={errors.dateOfBirth}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.gender ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select gender</option>
                    {GENDERS.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                  {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                </div>
              </div>
            </div>

            {/* Credentials Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Credentials</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Certification Number <span className="text-red-600">*</span>
                  </label>
                  <Input
                    type="text"
                    name="certificationNumber"
                    value={formData.certificationNumber}
                    onChange={handleChange}
                    placeholder="Enter certification number"
                    error={errors.certificationNumber}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Certification Issuing Body <span className="text-red-600">*</span>
                  </label>
                  <Input
                    type="text"
                    name="certificationIssuingBody"
                    value={formData.certificationIssuingBody}
                    onChange={handleChange}
                    placeholder="e.g., Medical Board"
                    error={errors.certificationIssuingBody}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Certification Expiry Date <span className="text-red-600">*</span>
                  </label>
                  <Input
                    type="date"
                    name="certificationExpiryDate"
                    value={formData.certificationExpiryDate}
                    onChange={handleChange}
                    error={errors.certificationExpiryDate}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialization
                  </label>
                  <Input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    placeholder="e.g., Venipuncture"
                  />
                </div>
              </div>
            </div>

            {/* Employment Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Employment</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee ID <span className="text-red-600">*</span>
                  </label>
                  <Input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    placeholder="Enter employee ID"
                    error={errors.employeeId}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Joining Date <span className="text-red-600">*</span>
                  </label>
                  <Input
                    type="date"
                    name="joiningDate"
                    value={formData.joiningDate}
                    onChange={handleChange}
                    error={errors.joiningDate}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shift Type <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="shiftType"
                    value={formData.shiftType}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.shiftType ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select shift type</option>
                    {SHIFT_TYPES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  {errors.shiftType && <p className="text-red-500 text-sm mt-1">{errors.shiftType}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assigned Zone
                  </label>
                  <Input
                    type="text"
                    name="assignedZone"
                    value={formData.assignedZone}
                    onChange={handleChange}
                    placeholder="e.g., Zone A"
                  />
                </div>
              </div>
            </div>

            {/* Admin Privileges Section */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-md font-semibold text-gray-900 mb-3">Admin Privileges</h3>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isAdmin"
                  name="isAdmin"
                  checked={formData.isAdmin}
                  onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isAdmin" className="ml-2 block text-sm text-gray-900">
                  <span className="font-medium">Phlebotomist Admin</span>
                  <span className="block text-xs text-gray-600 mt-1">
                    Grants permission to upload lab results and perform admin operations
                  </span>
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading}>
                Create Phlebotomist
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {toastState.isOpen && (
        <Toast
          variant={toastState.type}
          title={toastState.type === 'success' ? 'Success' : 'Error'}
          message={toastState.message}
          isOpen={toastState.isOpen}
          onClose={() => setToastState({ ...toastState, isOpen: false })}
        />
      )}
    </>
  );
}
