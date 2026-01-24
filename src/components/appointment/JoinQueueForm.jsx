/**
 * Join Queue Form Component
 * Form for joining the virtual queue
 */

import { useState } from 'react';

const JoinQueueForm = ({ appointments, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    appointmentId: '',
    isEmergency: false,
  });

  const [formErrors, setFormErrors] = useState({});

  // Filter upcoming appointments only
  const upcomingAppointments = appointments?.filter(apt => {
    const aptDate = new Date(apt.date);
    const now = new Date();

    // Compare dates without time - include today's appointments
    const aptDateOnly = new Date(aptDate.getFullYear(), aptDate.getMonth(), aptDate.getDate());
    const todayDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const isTodayOrFuture = aptDateOnly >= todayDateOnly;

    // Exclude cancelled or completed appointments
    const isNotCancelled = apt.status !== 'CANCELLED' &&
                          apt.status !== 'NO_SHOW' &&
                          apt.status !== 'COMPLETED';

    console.log('🔍 Filtering appointment:', {
      id: apt.id,
      date: apt.date,
      status: apt.status,
      aptDateOnly: aptDateOnly.toISOString().split('T')[0],
      todayDateOnly: todayDateOnly.toISOString().split('T')[0],
      isTodayOrFuture,
      isNotCancelled,
      included: isTodayOrFuture && isNotCancelled
    });

    return isTodayOrFuture && isNotCancelled;
  }) || [];

  console.log('📋 Filtered upcoming appointments:', upcomingAppointments.length);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.appointmentId) {
      errors.appointmentId = 'Please select an appointment';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {upcomingAppointments.length === 0 ? (
        <div className="text-center py-4">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mt-2 text-sm text-gray-600">
            No upcoming appointments found. Please book an appointment first.
          </p>
        </div>
      ) : (
        <>
          {/* Appointment Selection */}
          <div>
            <label htmlFor="appointmentId" className="block text-sm font-medium text-gray-700 mb-2">
              Select Appointment <span className="text-red-500">*</span>
            </label>
            <select
              id="appointmentId"
              name="appointmentId"
              value={formData.appointmentId}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                formErrors.appointmentId
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
              }`}
            >
              <option value="">Choose an appointment</option>
              {upcomingAppointments.map((appointment) => (
                <option key={appointment.id} value={appointment.id}>
                  {new Date(appointment.date).toLocaleDateString()} -{' '}
                  {new Date(appointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                  Dr. {appointment.doctorName || 'Unknown'}
                </option>
              ))}
            </select>
            {formErrors.appointmentId && (
              <p className="mt-1 text-sm text-red-600">{formErrors.appointmentId}</p>
            )}
          </div>

          {/* Emergency Checkbox */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="isEmergency"
                name="isEmergency"
                type="checkbox"
                checked={formData.isEmergency}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="isEmergency" className="font-medium text-gray-700">
                Emergency Case
              </label>
              <p className="text-gray-500">
                Check this if you need urgent medical attention. Emergency cases are prioritized in the queue.
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-blue-800">What happens next?</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>You'll receive a queue token number</li>
                    <li>Your position and estimated wait time will be displayed</li>
                    <li>The queue updates automatically every 15 seconds</li>
                    <li>You'll be notified when it's your turn</li>
                  </ul>
                </div>
              </div>
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
              disabled={isSubmitting || upcomingAppointments.length === 0}
              className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Joining Queue...
                </>
              ) : (
                'Join Queue'
              )}
            </button>
          </div>
        </>
      )}
    </form>
  );
};

export default JoinQueueForm;
