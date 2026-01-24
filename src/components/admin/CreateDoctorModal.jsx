/**
 * Create Doctor Modal Component
 * Modal with form to create new doctor and show generated credentials
 */

import { useState } from 'react';
import { X, CheckCircle, Copy, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { cn } from '../../utils/cn';

const CreateDoctorModal = ({ isOpen, onClose, onSubmit, isLoading = false }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const handleFormSubmit = async (data) => {
    const result = await onSubmit(data);
    if (result) {
      setGeneratedCredentials(result);
      setShowSuccess(true);
      reset();
    }
  };

  const handleClose = () => {
    setShowSuccess(false);
    setGeneratedCredentials(null);
    setShowPassword(false);
    setCopiedField(null);
    reset();
    onClose();
  };

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!isOpen) return null;

  // Success Screen - Show Generated Credentials
  if (showSuccess && generatedCredentials) {
    return (
      <>
        <div className="fixed inset-0 bg-black/50 z-40" onClick={handleClose} />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Success Header */}
            <div className="bg-green-50 px-6 py-4 border-b border-green-200">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-900">Doctor Created Successfully!</h3>
                  <p className="text-sm text-green-700">Save these credentials - they won't be shown again</p>
                </div>
              </div>
            </div>

            {/* Generated Credentials */}
            <div className="p-6 space-y-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedCredentials.username || generatedCredentials.email}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 font-mono text-sm"
                  />
                  <button
                    onClick={() =>
                      copyToClipboard(
                        generatedCredentials.username || generatedCredentials.email,
                        'username'
                      )
                    }
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                    title="Copy username"
                  >
                    {copiedField === 'username' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Temporary Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temporary Password
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    readOnly
                    value={generatedCredentials.tempPassword || generatedCredentials.password || '********'}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 font-mono text-sm"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        generatedCredentials.tempPassword || generatedCredentials.password || '',
                        'password'
                      )
                    }
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                    title="Copy password"
                  >
                    {copiedField === 'password' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Important Notice */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex gap-2">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Important</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Copy and save these credentials securely</li>
                      <li>The doctor must change password on first login</li>
                      <li>These credentials will not be shown again</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Doctor Info */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <strong>Doctor:</strong> Dr. {generatedCredentials.firstName}{' '}
                  {generatedCredentials.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> {generatedCredentials.email}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Specialization:</strong> {generatedCredentials.specialization}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Create Form Screen
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={handleClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Create New Doctor</h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('firstName', { required: 'First name is required' })}
                    className={cn(
                      'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500',
                      errors.firstName ? 'border-red-300' : 'border-gray-300'
                    )}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-600 mt-1">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('lastName', { required: 'Last name is required' })}
                    className={cn(
                      'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500',
                      errors.lastName ? 'border-red-300' : 'border-gray-300'
                    )}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-600 mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    className={cn(
                      'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500',
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    )}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    {...register('phoneNumber', { required: 'Phone number is required' })}
                    className={cn(
                      'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500',
                      errors.phoneNumber ? 'border-red-300' : 'border-gray-300'
                    )}
                  />
                  {errors.phoneNumber && (
                    <p className="text-sm text-red-600 mt-1">{errors.phoneNumber.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Professional Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialization <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('specialization', { required: 'Specialization is required' })}
                    className={cn(
                      'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500',
                      errors.specialization ? 'border-red-300' : 'border-gray-300'
                    )}
                  >
                    <option value="">Select specialization</option>
                    <option value="GENERAL_PHYSICIAN">General Physician</option>
                    <option value="CARDIOLOGIST">Cardiologist</option>
                    <option value="DERMATOLOGIST">Dermatologist</option>
                    <option value="PEDIATRICIAN">Pediatrician</option>
                    <option value="ORTHOPEDIST">Orthopedist</option>
                    <option value="NEUROLOGIST">Neurologist</option>
                    <option value="PSYCHIATRIST">Psychiatrist</option>
                    <option value="ENT_SPECIALIST">ENT Specialist</option>
                    <option value="GYNECOLOGIST">Gynecologist</option>
                  </select>
                  {errors.specialization && (
                    <p className="text-sm text-red-600 mt-1">{errors.specialization.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    License Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('licenseNumber', { required: 'License number is required' })}
                    className={cn(
                      'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500',
                      errors.licenseNumber ? 'border-red-300' : 'border-gray-300'
                    )}
                  />
                  {errors.licenseNumber && (
                    <p className="text-sm text-red-600 mt-1">{errors.licenseNumber.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    min="0"
                    {...register('yearsOfExperience')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <input
                    type="text"
                    {...register('department')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating...' : 'Create Doctor'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateDoctorModal;
