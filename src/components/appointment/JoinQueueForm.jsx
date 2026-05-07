import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  User,
  ArrowRight,
  AlertCircle,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { cn } from '../../utils/cn';

const JoinQueueForm = ({ appointments, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    appointmentId: '',
    isEmergency: false,
  });

  const [error, setError] = useState(null);

  const upcomingAppointments = appointments?.filter(apt => {
    const aptDate = new Date(apt.date);
    const now = new Date();
    const aptDateOnly = new Date(aptDate.getFullYear(), aptDate.getMonth(), aptDate.getDate());
    const todayDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return aptDateOnly >= todayDateOnly &&
      !['CANCELLED', 'NO_SHOW', 'COMPLETED', 'EXPIRED'].includes(apt.status);
  }) || [];

  const handleSelect = (id) => {
    setFormData(prev => ({ ...prev, appointmentId: id }));
    setError(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.appointmentId) {
      setError('Please select an appointment profile.');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b pb-4 mb-2">
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
          <Calendar size={20} />
        </div>
        <h4 className="text-lg font-bold text-gray-900">Select Appointment</h4>
      </div>

      {upcomingAppointments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400 font-medium">No valid appointments found for today.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-1">
            {upcomingAppointments.map((apt) => (
              <button
                key={apt.id}
                onClick={() => handleSelect(apt.id)}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border transition-all text-left",
                  formData.appointmentId === apt.id
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100"
                    : "bg-white border-gray-100 hover:border-indigo-200 text-gray-700"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    formData.appointmentId === apt.id ? "bg-white/20" : "bg-gray-50 text-gray-400"
                  )}>
                    <User size={18} />
                  </div>
                  <div>
                    <p className={cn("text-[10px] font-bold uppercase tracking-wider mb-0.5",
                      formData.appointmentId === apt.id ? "text-indigo-100" : "text-gray-400")}>
                      {new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="font-semibold">{apt.doctorName || 'Doctor'}</p>
                  </div>
                </div>
                <ChevronRight size={16} className={formData.appointmentId === apt.id ? "text-white" : "text-gray-300"} />
              </button>
            ))}
          </div>
          {error && (
            <div className="flex items-center gap-2 text-rose-600 text-xs font-semibold ml-2">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
        </div>
      )}

      {/* Simplified Priority Toggle */}
      <div className="p-4 bg-white border rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${formData.isEmergency ? 'bg-rose-50 text-rose-600' : 'bg-gray-50 text-gray-400'}`}>
            <ShieldCheck size={18} />
          </div>
          <div className="space-y-0.5">
            <span className="text-sm font-bold text-gray-900 block">Emergency Case</span>
            <span className="text-xs text-gray-500">Enable only for critical needs</span>
          </div>
        </div>
        <input
          type="checkbox"
          checked={formData.isEmergency}
          onChange={(e) => setFormData(p => ({ ...p, isEmergency: e.target.checked }))}
          className="w-10 h-5 rounded-full border-gray-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
        />
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 text-sm font-bold text-gray-500 bg-white border rounded-xl hover:bg-gray-50 transition-all"
          disabled={isSubmitting}
        >
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || upcomingAppointments.length === 0}
          className="flex-1 inline-flex items-center justify-center py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Confirm Join
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default JoinQueueForm;
