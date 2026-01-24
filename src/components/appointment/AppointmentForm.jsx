/**
 * Appointment Form Component
 * Form for creating new appointments
 */

import { useState } from 'react';
import { useCreateAppointmentMutation } from '../../features/appointment/appointmentApi';

const AppointmentForm = ({ doctors, isLoadingDoctors, onSuccess, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    doctorId: '',
    date: '',
    reason: '',
  });

  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }

    // Real-time validation feedback
    const newErrors = {};

    if (name === 'reason') {
      const trimmedValue = value.trim();
      if (trimmedValue.length > 0 && trimmedValue.length < 5) {
        newErrors.reason = `Reason must be at least 5 characters (${5 - trimmedValue.length} more needed)`;
      } else if (trimmedValue.length > 500) {
        newErrors.reason = 'Reason must not exceed 500 characters';
      }
    }

    if (name === 'date' && value) {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.date = 'Appointment date must be today or in the future';
      }
    }

    // Update errors if any
    if (Object.keys(newErrors).length > 0) {
      setFormErrors((prev) => ({ ...prev, ...newErrors }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // Validate Doctor ID (required, must be valid UUID)
    if (!formData.doctorId) {
      errors.doctorId = 'Please select a doctor';
    } else if (!formData.doctorId.trim()) {
      errors.doctorId = 'Doctor ID is required';
    }

    // Validate Date (required, must be future or present)
    if (!formData.date) {
      errors.date = 'Please select date and time';
    } else {
      // Validate date is today or in the future
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset to start of day for comparison

      if (selectedDate < today) {
        errors.date = 'Appointment date must be today or in the future';
      }
    }

    // Validate Reason (required, must be 5-500 characters)
    if (!formData.reason) {
      errors.reason = 'Reason for visit is required';
    } else if (formData.reason.trim().length < 5) {
      errors.reason = 'Reason must be at least 5 characters';
    } else if (formData.reason.trim().length > 500) {
      errors.reason = 'Reason must not exceed 500 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSuccess(formData);
  };

  // Get today's date in YYYY-MM-DDTHH:MM format for min attribute
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Doctor Selection */}
      <div>
        <label htmlFor="doctorId" className="block text-sm font-medium text-gray-700 mb-1">
          Select Doctor <span className="text-red-500">*</span>
        </label>
        {isLoadingDoctors ? (
          <div className="text-sm text-gray-500">Loading doctors...</div>
        ) : (
          <select
            id="doctorId"
            name="doctorId"
            value={formData.doctorId}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
              formErrors.doctorId
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
            }`}
          >
            <option value="">Choose a doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor.id || doctor.userId} value={doctor.id || doctor.userId}>
                Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
              </option>
            ))}
          </select>
        )}
        {formErrors.doctorId && (
          <p className="mt-1 text-sm text-red-600">{formErrors.doctorId}</p>
        )}
      </div>

      {/* Date and Time */}
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
          Date & Time <span className="text-red-500">*</span>
        </label>
        <input
          type="datetime-local"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          min={getMinDateTime()}
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
            formErrors.date
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
          }`}
        />
        {formErrors.date && (
          <p className="mt-1 text-sm text-red-600">{formErrors.date}</p>
        )}
      </div>

      {/* Reason */}
      <div>
        <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
          Reason for Visit <span className="text-red-500">*</span>
        </label>
        <textarea
          id="reason"
          name="reason"
          rows={4}
          value={formData.reason}
          onChange={handleChange}
          placeholder="Please describe your symptoms or reason for consultation (minimum 5 characters)..."
          maxLength={500}
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
            formErrors.reason
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
          }`}
        />
        <div className="mt-1 flex justify-between items-center">
          <div>
            {formErrors.reason && (
              <p className="text-sm text-red-600">{formErrors.reason}</p>
            )}
          </div>
          <p className={`text-xs ${
            formData.reason.length < 5 
              ? 'text-red-500' 
              : formData.reason.length > 450 
                ? 'text-yellow-600' 
                : 'text-gray-500'
          }`}>
            {formData.reason.length}/500 characters
            {formData.reason.length < 5 && formData.reason.length > 0 &&
              ` (${5 - formData.reason.length} more needed)`
            }
          </p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Booking...
            </>
          ) : (
            'Book Appointment'
          )}
        </button>
      </div>
    </form>
  );
};

export default AppointmentForm;
