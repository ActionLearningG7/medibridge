/**
 * Appointment Detail Drawer Component
 * Side drawer showing appointment details with Join Queue action
 */

import { X, Calendar, Clock, User, FileText, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useJoinQueueMutation } from '../../features/appointment/appointmentApi';
import { useToast } from '../feedback/ToastProvider';
import { cn } from '../../utils/cn';

const AppointmentDetailDrawer = ({ appointment, isOpen, onClose }) => {
  const [isEmergency, setIsEmergency] = useState(false);
  const [joinQueue, { isLoading: joiningQueue }] = useJoinQueueMutation();
  const { showToast } = useToast();

  if (!isOpen || !appointment) return null;

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

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
      COMPLETED: 'bg-green-100 text-green-800 border-green-200',
      CANCELLED: 'bg-red-100 text-red-800 border-red-200',
      IN_PROGRESS: 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const canJoinQueue = () => {
    // Can join if appointment is CONFIRMED or PENDING and date is today or past
    const aptDate = new Date(appointment.appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    aptDate.setHours(0, 0, 0, 0);

    return (
      (appointment.status === 'CONFIRMED' || appointment.status === 'PENDING') &&
      aptDate <= today
    );
  };

  const handleJoinQueue = async () => {
    try {
      await joinQueue({
        appointmentId: appointment.id,
        isEmergency,
      }).unwrap();

      showToast.success('Successfully joined the queue!');
      onClose();
    } catch (error) {
      showToast.error(error?.data?.message || 'Failed to join queue');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 transform transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Appointment Details</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto h-[calc(100%-80px)]">
          {/* Status Badge */}
          <div className="mb-6">
            <span
              className={cn(
                'inline-flex px-3 py-1 text-sm font-medium rounded-full border',
                getStatusColor(appointment.status)
              )}
            >
              {appointment.status}
            </span>
          </div>

          {/* Appointment Info */}
          <div className="space-y-4">
            {/* Doctor */}
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Doctor</p>
                <p className="text-sm font-medium text-gray-900">
                  Dr. {appointment.doctorName || 'Doctor'}
                </p>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(appointment.appointmentDate)}
                </p>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Time</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatTime(appointment.appointmentDate)}
                </p>
              </div>
            </div>

            {/* Reason */}
            {appointment.reason && (
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Reason for Visit</p>
                  <p className="text-sm text-gray-700">{appointment.reason}</p>
                </div>
              </div>
            )}
          </div>

          {/* Join Queue Section */}
          {canJoinQueue() && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-purple-900">Join the Queue</h3>
                    <p className="text-sm text-purple-700 mt-1">
                      Join the virtual queue to wait for your consultation. You'll receive updates on your position.
                    </p>
                  </div>
                </div>
              </div>

              {/* Emergency Checkbox */}
              <label className="flex items-start gap-3 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={isEmergency}
                  onChange={(e) => setIsEmergency(e.target.checked)}
                  className="mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Mark as Emergency</span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Emergency cases get priority in the queue
                  </p>
                </div>
              </label>

              {/* Join Button */}
              <button
                onClick={handleJoinQueue}
                disabled={joiningQueue}
                className="w-full px-4 py-3 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {joiningQueue ? 'Joining...' : 'Join Queue Now'}
              </button>
            </div>
          )}

          {/* Additional Info */}
          {appointment.createdAt && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Booked on {new Date(appointment.createdAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AppointmentDetailDrawer;
