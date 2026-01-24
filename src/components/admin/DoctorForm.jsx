/**
 * Doctor Form Component
 * Form for creating new doctors
 * Uses POST /api/v1/doctors from DoctorController
 */

import { useState } from 'react';
import { useCreateDoctorMutation } from '../../features/user/doctorApi';

const DoctorForm = ({ onSuccess, onCancel }) => {
  const [createDoctor, { isLoading, error }] = useCreateDoctorMutation();

  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: 'MALE',

    // Professional Info
    specialization: 'GENERAL_MEDICINE',
    department: '',
    medicalLicenseNumber: '',
    licenseIssuedDate: '',
    licenseExpiryDate: '',
    yearsOfExperience: 0,
    consultationFee: 0,

    // Education
    medicalSchool: '',
    graduationYear: '',

    // Additional
    bio: '',
    availableForConsultation: true,
    availableForEmergency: false,
  });

  const [formErrors, setFormErrors] = useState({});

  const specializations = [
    'GENERAL_MEDICINE',
    'CARDIOLOGY',
    'DERMATOLOGY',
    'NEUROLOGY',
    'PEDIATRICS',
    'ORTHOPEDICS',
    'PSYCHIATRY',
    'RADIOLOGY',
    'SURGERY',
    'EMERGENCY_MEDICINE',
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    if (!formData.phoneNumber.trim()) errors.phoneNumber = 'Phone number is required';
    if (!formData.medicalLicenseNumber.trim()) {
      errors.medicalLicenseNumber = 'Medical license number is required';
    }
    if (!formData.licenseExpiryDate) {
      errors.licenseExpiryDate = 'License expiry date is required';
    }
    if (formData.yearsOfExperience < 0) {
      errors.yearsOfExperience = 'Years of experience cannot be negative';
    }
    if (formData.consultationFee < 0) {
      errors.consultationFee = 'Consultation fee cannot be negative';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await createDoctor(formData).unwrap();
      onSuccess();
    } catch (err) {
      console.error('Failed to create doctor:', err);
      // Error is already handled by RTK Query and displayed below
    }
  };

  const InputField = ({ label, name, type = 'text', required = false, ...props }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
          formErrors[name]
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
        }`}
        {...props}
      />
      {formErrors[name] && (
        <p className="mt-1 text-sm text-red-600">{formErrors[name]}</p>
      )}
    </div>
  );

  const SelectField = ({ label, name, options, required = false }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {formErrors[name] && (
        <p className="mt-1 text-sm text-red-600">{formErrors[name]}</p>
      )}
    </div>
  );

  const CheckboxField = ({ label, name }) => (
    <div className="flex items-center">
      <input
        type="checkbox"
        id={name}
        name={name}
        checked={formData[name]}
        onChange={handleChange}
        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
      />
      <label htmlFor={name} className="ml-2 block text-sm text-gray-700">
        {label}
      </label>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
      {/* Error Alert */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {error?.data?.message || 'Failed to create doctor'}
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* Personal Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="First Name" name="firstName" required />
          <InputField label="Last Name" name="lastName" required />
          <InputField label="Email" name="email" type="email" required />
          <InputField label="Phone Number" name="phoneNumber" required />
          <InputField label="Date of Birth" name="dateOfBirth" type="date" />
          <SelectField
            label="Gender"
            name="gender"
            options={[
              { value: 'MALE', label: 'Male' },
              { value: 'FEMALE', label: 'Female' },
              { value: 'OTHER', label: 'Other' },
            ]}
          />
        </div>
      </div>

      {/* Professional Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label="Specialization"
            name="specialization"
            required
            options={specializations.map((spec) => ({
              value: spec,
              label: spec.replace(/_/g, ' '),
            }))}
          />
          <InputField label="Department" name="department" />
          <InputField
            label="Medical License Number"
            name="medicalLicenseNumber"
            required
          />
          <InputField
            label="License Issued Date"
            name="licenseIssuedDate"
            type="date"
          />
          <InputField
            label="License Expiry Date"
            name="licenseExpiryDate"
            type="date"
            required
          />
          <InputField
            label="Years of Experience"
            name="yearsOfExperience"
            type="number"
            min="0"
          />
          <InputField
            label="Consultation Fee ($)"
            name="consultationFee"
            type="number"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      {/* Education */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Education</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Medical School" name="medicalSchool" />
          <InputField label="Graduation Year" name="graduationYear" type="number" min="1950" max={new Date().getFullYear()} />
        </div>
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          value={formData.bio}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          placeholder="Brief professional bio..."
        />
      </div>

      {/* Availability */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Availability</h3>
        <div className="space-y-2">
          <CheckboxField
            label="Available for Consultation"
            name="availableForConsultation"
          />
          <CheckboxField
            label="Available for Emergency"
            name="availableForEmergency"
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating...
            </>
          ) : (
            'Create Doctor'
          )}
        </button>
      </div>
    </form>
  );
};

export default DoctorForm;
