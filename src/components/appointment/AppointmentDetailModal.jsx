/**
 * Appointment Detail Modal Content
 * Shows detailed information about an appointment
 */

import LoadingSpinner from '../feedback/LoadingSpinner';
import { StatusBadge } from '../profile/ProfileFields';
import { Calendar, Clock, User, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../../ui';

const AppointmentDetailModal = ({ appointment, isLoading, onClose }) => {
  if (isLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-500 font-medium">Loading details...</p>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="p-8 text-center text-gray-500">
        Appointment not found.
      </div>
    );
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
    <div className="space-y-8 py-2">
      {/* Pending Payment Alert */}
      {appointment.status === 'PAYMENT_PENDING' && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 flex items-center gap-4 animate-in fade-in zoom-in-95 duration-500">
          <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm">
            <Clock className="w-6 h-6 animate-spin" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-blue-900">Confirming Payment</p>
            <p className="text-xs text-blue-700 font-medium">We're verifying your transaction. This page will update automatically once confirmed.</p>
          </div>
        </div>
      )}

      {/* Main Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date & Time */}
        <div className="bg-white p-5 rounded-2xl border-2 border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-primary-600">
            <Calendar className="w-5 h-5" />
            <h4 className="font-bold text-gray-900">Schedule</h4>
          </div>
          <div className="space-y-1 pl-8">
            <p className="text-sm font-bold text-gray-800">{formatDate(appointment.date)}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              <Clock className="w-3.5 h-3.5" />
              {formatTime(appointment.date)}
            </div>
          </div>
        </div>

        {/* Doctor Info */}
        <div className="bg-white p-5 rounded-2xl border-2 border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-primary-600">
            <User className="w-5 h-5" />
            <h4 className="font-bold text-gray-900">Consultant</h4>
          </div>
          <div className="space-y-1 pl-8">
            <p className="text-sm font-bold text-gray-800">{appointment.doctorName || 'Expert Physician'}</p>
            <p className="text-xs text-primary-600 font-medium">{appointment.doctorSpecialization || 'Specialist'}</p>
          </div>
        </div>
      </div>

      {/* Status & ID */}
      <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between border border-gray-100">
        <div className="flex items-center gap-3">
          <StatusBadge status={appointment.status} />
          {isUpcoming && !isCancelled && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-yellow-100 text-yellow-800 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Upcoming
            </span>
          )}
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Ref ID</p>
          <p className="text-sm font-mono font-bold text-gray-600">{appointment.id?.substring(0, 8).toUpperCase()}</p>
        </div>
      </div>

      {/* Reason section */}
      <div className="bg-white p-5 rounded-2xl border-2 border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 text-primary-600 mb-4">
          <FileText className="w-5 h-5" />
          <h4 className="font-bold text-gray-900">Reason for Visit</h4>
        </div>
        <p className="text-sm text-gray-700 italic bg-gray-50 p-4 rounded-xl border border-gray-200 leading-relaxed font-medium">
          "{appointment.reason || 'No description provided'}"
        </p>
      </div>

      {/* Notes & Diagnosis */}
      {(appointment.notes || appointment.diagnosis) && (
        <div className="bg-amber-50 p-5 rounded-2xl border-2 border-amber-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-amber-600 font-bold">
            <AlertCircle className="w-5 h-5" />
            <h4>Clinical Findings</h4>
          </div>
          <div className="space-y-4 pl-8">
            {appointment.notes && (
              <div>
                <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider mb-1">Doctor's Notes</p>
                <p className="text-sm text-gray-800 font-medium">{appointment.notes}</p>
              </div>
            )}
            {appointment.diagnosis && (
              <div>
                <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider mb-1">Final Diagnosis</p>
                <p className="text-sm text-gray-800 font-medium">{appointment.diagnosis}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Timestamps */}
      <div className="text-[10px] text-gray-400 font-medium flex gap-4 pt-4 border-t">
        {appointment.createdAt && <span>Created: {new Date(appointment.createdAt).toLocaleString()}</span>}
        {appointment.updatedAt && <span>Latest Update: {new Date(appointment.updatedAt).toLocaleString()}</span>}
      </div>

      {/* Action Footer */}
      <div className="flex justify-end gap-3 pt-6">
        <Button variant="outline" onClick={onClose} className="rounded-xl font-bold px-6 h-11">
          Close View
        </Button>
        {canJoinQueue && (
          <Button className="rounded-xl font-bold px-8 h-11 bg-primary-600 shadow-lg shadow-primary-200 flex items-center gap-2">
            Join Console <CheckCircle2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default AppointmentDetailModal;
