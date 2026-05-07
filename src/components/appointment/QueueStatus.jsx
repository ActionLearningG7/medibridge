import { motion } from 'framer-motion';
import {
  Clock,
  MapPin,
  Ticket,
  Video,
  LogOut,
  User,
  AlertCircle,
  CheckCircle2,
  PhoneCall,
  Calendar
} from 'lucide-react';

const QueueStatus = ({ queueEntry, onLeave, onJoinVideo }) => {
  const formatTime = (minutes) => {
    if (minutes <= 0) return 'Immediate';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getStatusConfig = (status) => {
    const configs = {
      WAITING: {
        label: 'Waiting in Queue',
        desc: 'The medical team will call you soon.',
        color: 'amber',
        icon: Clock,
        bg: 'bg-amber-50',
        text: 'text-amber-600',
        border: 'border-amber-100'
      },
      CALLED: {
        label: "It's Your Turn!",
        desc: 'Please join your video consultation now.',
        color: 'emerald',
        icon: PhoneCall,
        bg: 'bg-emerald-50',
        text: 'text-emerald-600',
        border: 'border-emerald-100'
      },
      SERVING: {
        label: 'In Consultation',
        desc: 'Session with clinical specialist in progress.',
        color: 'indigo',
        icon: User,
        bg: 'bg-indigo-50',
        text: 'text-indigo-600',
        border: 'border-indigo-100'
      },
      COMPLETED: {
        label: 'Checkout Completed',
        desc: 'Thank you for choosing our service.',
        color: 'purple',
        icon: CheckCircle2,
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        border: 'border-purple-100'
      },
      CANCELLED: {
        label: 'Session Stopped',
        desc: 'Queue entry was de-registered.',
        color: 'rose',
        icon: AlertCircle,
        bg: 'bg-rose-50',
        text: 'text-rose-600',
        border: 'border-rose-100'
      }
    };
    return configs[status] || configs.WAITING;
  };

  const config = getStatusConfig(queueEntry.status);
  const StatusIcon = config.icon;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white border rounded-3xl p-8 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6"
      >
        <div className="flex items-center gap-5">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${config.bg}`}>
            <StatusIcon size={28} className={config.text} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 leading-tight">{config.label}</h2>
            <p className="text-gray-500 text-sm mt-0.5">{config.desc}</p>
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          {(queueEntry.status === 'CALLED' || queueEntry.status === 'WAITING' || queueEntry.status === 'SERVING') && onJoinVideo && (
            <button
              onClick={onJoinVideo}
              className="flex-1 md:flex-none inline-flex items-center justify-center px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all gap-2 shadow-lg shadow-indigo-100"
            >
              <Video size={18} />
              Join Video Call
            </button>
          )}

          {(queueEntry.status === 'CALLED' || queueEntry.status === 'WAITING') && (
            <button
              onClick={onLeave}
              className="px-5 py-2.5 text-gray-400 font-semibold rounded-xl border hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all text-sm"
            >
              Leave Queue
            </button>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Ticket size={14} />
            <span>Token Number</span>
          </div>
          <div className="text-4xl font-bold text-gray-900">{queueEntry.tokenNumber || '--'}</div>
        </div>

        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <MapPin size={14} />
            <span>Queue Position</span>
          </div>
          <div className="text-4xl font-bold text-gray-900">
            {queueEntry.position !== undefined ? queueEntry.position : '--'}
            <span className="text-sm font-normal text-gray-400 ml-2">in line</span>
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Clock size={14} />
            <span>Estimated Wait</span>
          </div>
          <div className="text-4xl font-bold text-gray-900">
            {queueEntry.estimatedWaitTime !== undefined ? formatTime(queueEntry.estimatedWaitTime) : '--'}
          </div>
        </div>
      </div>

      {queueEntry.doctorName && (
        <div className="bg-gray-50/50 border rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 text-sm font-medium text-gray-600">
            <div className="p-2 bg-white border rounded-lg">
              <Calendar size={16} className="text-gray-400" />
            </div>
            <span>Doctor: <span className="text-gray-900 font-bold">Dr. {queueEntry.doctorName}</span></span>
            <span className="text-gray-200">|</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${queueEntry.isEmergency ? 'bg-rose-50 text-rose-600' : 'bg-gray-100 text-gray-600'
              }`}>
              {queueEntry.isEmergency ? 'Priority Intake' : 'Standard Routine'}
            </span>
          </div>
          <div className="text-xs text-gray-400 font-mono">
            ID: {queueEntry.appointmentId?.substring(0, 8).toUpperCase()}
          </div>
        </div>
      )}
    </div>
  );
};

export default QueueStatus;
