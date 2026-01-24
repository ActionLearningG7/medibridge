/**
 * Appointment Detail Modal Component
 * Shows detailed information about an appointment
 */

import LoadingSpinner from '../feedback/LoadingSpinner';
import { StatusBadge } from '../profile/ProfileFields';

const AppointmentDetailModal = ({ appointment, isLoading, onClose }) => {
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
          <div className="p-8">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return null;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isUpcoming = new Date(appointment.date) > new Date();
  const isCancelled = appointment.status === 'CANCELLED' || appointment.status === 'NO_SHOW';
  const canJoinQueue = isUpcoming &&
    (appointment.status === 'REQUESTED' ||
     appointment.status === 'SCHEDULED' ||
     appointment.status === 'CONFIRMED');

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <h3 className="text-xl font-medium text-gray-900">
            Appointment Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="mt-6 space-y-6">
          {/* Status Card */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <div className="mt-1">
                  <StatusBadge status={appointment.status} />
                  {isUpcoming && !isCancelled && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Upcoming
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Appointment ID</p>
                <p className="text-sm font-mono text-gray-900 mt-1">
                  {appointment.id?.substring(0, 8)}
                </p>
              </div>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Date</p>
              <div className="mt-1 flex items-center text-sm text-gray-900">
                <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(appointment.date)}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Time</p>
              <div className="mt-1 flex items-center text-sm text-gray-900">
                <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatTime(appointment.date)}
              </div>
            </div>
          </div>

          {/* Doctor Information */}
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">Doctor</p>
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {appointment.doctorName || 'Doctor'}
                </p>
                <p className="text-xs text-gray-500">
                  {appointment.doctorSpecialization || 'General Medicine'}
                </p>
              </div>
            </div>
          </div>

          {/* Reason for Visit */}
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">Reason for Visit</p>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-900">
                {appointment.reason || 'No reason provided'}
              </p>
            </div>
          </div>

          {/* Additional Information */}
          {(appointment.notes || appointment.diagnosis) && (
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Additional Information</p>
              <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                {appointment.notes && (
                  <div>
                    <p className="text-xs font-medium text-gray-700">Notes</p>
                    <p className="text-sm text-gray-900">{appointment.notes}</p>
                  </div>
                )}
                {appointment.diagnosis && (
                  <div>
                    <p className="text-xs font-medium text-gray-700">Diagnosis</p>
                    <p className="text-sm text-gray-900">{appointment.diagnosis}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="text-xs text-gray-500 space-y-1 pt-4 border-t">
            {appointment.createdAt && (
              <p>
                Created: {new Date(appointment.createdAt).toLocaleString()}
              </p>
            )}
            {appointment.updatedAt && appointment.updatedAt !== appointment.createdAt && (
              <p>
                Last Updated: {new Date(appointment.updatedAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end space-x-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Close
          </button>
          {canJoinQueue && (
            <button
              onClick={() => {
                // Placeholder for join queue or cancel functionality
                alert('Action buttons can be added here');
              }}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Join Queue
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailModal;
