/**
 * Modern Appointment List Component
 * Displays a premium list of appointments with role-based details
 */

import { Calendar, Clock, ChevronRight, User, FileText, BadgeCheck, XCircle, AlertCircle } from 'lucide-react';
import { StatusBadge } from '../profile/ProfileFields';

const AppointmentList = ({ appointments, onViewDetails }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED': return <BadgeCheck className="w-4 h-4 text-green-600" />;
      case 'CANCELLED':
      case 'NO_SHOW': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'PAYMENT_PENDING': return <AlertCircle className="w-4 h-4 text-amber-600" />;
      default: return <Clock className="w-4 h-4 text-primary-600" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-gray-900 px-2 flex items-center gap-2">
          Appointment History
          <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold">
            {appointments.length} Total
          </span>
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {appointments.map((appointment) => {
          const isUpcoming = new Date(appointment.date) > new Date();
          const isCancelled = appointment.status === 'CANCELLED' || appointment.status === 'NO_SHOW';

          return (
            <div
              key={appointment.id}
              onClick={() => onViewDetails(appointment.id)}
              className="group bg-white rounded-2xl border-2 border-transparent hover:border-primary-100 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden p-5 flex flex-col sm:flex-row items-start sm:items-center gap-6"
            >
              {/* Date Card */}
              <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${isCancelled ? 'bg-gray-100 text-gray-400' : 'bg-primary-50 text-primary-700'
                }`}>
                <span className="text-[10px] uppercase font-bold opacity-70">
                  {formatDate(appointment.date).split(' ')[0]}
                </span>
                <span className="text-xl font-black">
                  {formatDate(appointment.date).split(' ')[2]}
                </span>
                <span className="text-[10px] font-bold">
                  {formatDate(appointment.date).split(' ')[1]}
                </span>
              </div>

              {/* Info section */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h4 className="font-bold text-gray-900 truncate">
                    Dr. {appointment.doctorName || 'Doctor'}
                  </h4>
                  <StatusBadge status={appointment.status} />
                  {isUpcoming && !isCancelled && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1 uppercase">
                      <Clock className="w-3 h-3" /> Upcoming
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-x-6 gap-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                    <User className="w-3.5 h-3.5 text-primary-500" />
                    {appointment.doctorSpecialization}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-primary-500" />
                    {formatTime(appointment.date)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium truncate">
                    <FileText className="w-3.5 h-3.5 text-primary-500" />
                    {appointment.reason || 'No description'}
                  </div>
                </div>
              </div>

              {/* Action Circle */}
              <div className="hidden sm:flex self-center">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AppointmentList;
