import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Clock,
  Video,
  ArrowRight,
  Shield,
  Activity,
  Plus,
  Wifi,
  WifiOff,
} from 'lucide-react';
import {
  useJoinQueueMutation,
  useLeaveQueueMutation,
  useGetMyActiveQueueQuery,
  useGetMyAppointmentsQuery,
} from '../../features/appointment/appointmentApi';
import { useGetVerifiedDoctorsQuery } from '../../features/user/doctorApi';
import { usePatientQueueSocket } from '../../hooks/useQueueSocket';
import { useToast } from '../../components/feedback/ToastProvider';
import JoinQueueForm from '../../components/appointment/JoinQueueForm';
import QueueStatus from '../../components/appointment/QueueStatus';

const PatientQueue = () => {
  const navigate = useNavigate();
  const [showJoinForm, setShowJoinForm] = useState(false);
  const { showToast } = useToast();

  const {
    data: activeQueue,
    isLoading,
    error,
    refetch,
  } = useGetMyActiveQueueQuery(undefined, {
    pollingInterval: 15000,
    refetchOnMountOrArgChange: true,
  });

  const { isConnected: wsConnected } = usePatientQueueSocket(refetch);
  const { data: rawAppointments } = useGetMyAppointmentsQuery();
  const { data: doctors } = useGetVerifiedDoctorsQuery();

  const appointments = useMemo(() => {
    if (!rawAppointments || !Array.isArray(rawAppointments)) return [];
    return rawAppointments.map(apt => {
      const doctor = doctors?.find(d => d.userId === apt.doctorId || d.id === apt.doctorId);
      return {
        ...apt,
        date: apt.appointmentDate,
        reason: apt.reasonForVisit,
        doctorName: doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Doctor',
        doctorSpecialization: doctor?.specialization || 'General',
        doctor: doctor || null,
      };
    });
  }, [rawAppointments, doctors]);

  const [joinQueue, { isLoading: isJoining }] = useJoinQueueMutation();
  const [leaveQueue, { isLoading: isLeaving }] = useLeaveQueueMutation();

  const hasActiveQueue = activeQueue && !error;

  const handleJoinQueue = async (queueData) => {
    try {
      await joinQueue(queueData).unwrap();
      setShowJoinForm(false);
      showToast.success('Joined queue');
      refetch();
    } catch (err) {
      showToast.error(err?.data?.message || 'Failed to join');
    }
  };

  const handleLeaveQueue = async () => {
    if (!activeQueue?.id) return;
    try {
      await leaveQueue(activeQueue.id).unwrap();
      showToast.success('Left queue');
      refetch();
    } catch (err) {
      showToast.error(err?.data?.message || 'Failed to leave');
    }
  };

  const handleJoinVideoConsultation = () => {
    navigate('/patient/consultation/video', {
      state: {
        queueEntryId: activeQueue?.id,
        appointmentId: activeQueue?.appointmentId,
        doctorId: activeQueue?.doctorId,
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
      {/* Simpler, Cleaner Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm mb-2">
            <Shield size={16} />
            <span>Clinic Queue</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Consultation Waiting Room
          </h1>
          <p className="text-gray-500 max-w-lg">
            Follow your status and join your consultation when called.
          </p>
        </div>

        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors ${wsConnected ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-600 border-gray-100'
          }`}>
          {wsConnected ? <Wifi size={14} className="animate-pulse" /> : <WifiOff size={14} />}
          <span>{wsConnected ? 'Live Connection' : 'Updating...'}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isLoading && !activeQueue ? (
          <div className="space-y-6">
            <div className="h-64 bg-gray-50 rounded-2xl animate-pulse" />
            <div className="grid grid-cols-3 gap-4">
              <div className="h-24 bg-gray-50 rounded-xl animate-pulse" />
              <div className="h-24 bg-gray-50 rounded-xl animate-pulse" />
              <div className="h-24 bg-gray-50 rounded-xl animate-pulse" />
            </div>
          </div>
        ) : hasActiveQueue ? (
          <motion.div
            key="active"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <QueueStatus
              queueEntry={activeQueue}
              onLeave={handleLeaveQueue}
              onJoinVideo={handleJoinVideoConsultation}
            />

            <div className="bg-blue-50/50 border border-blue-100/50 rounded-2xl p-6 flex items-start gap-4">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Activity size={18} />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 text-sm">Real-time Synchronization</h4>
                <p className="text-blue-700/70 text-sm mt-0.5">
                  Your position is updated automatically. Please stay on this page to receive the call.
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border rounded-3xl p-12 md:p-20 text-center shadow-sm"
          >
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Users size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">You're not in the queue</h2>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              Select an appointment to enter the virtual waiting room for your consultation.
            </p>

            {!showJoinForm ? (
              <button
                onClick={() => setShowJoinForm(true)}
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all gap-2 shadow-lg shadow-indigo-100"
              >
                <Plus size={20} />
                Join Virtual Queue
              </button>
            ) : (
              <div className="mt-8 text-left max-w-2xl mx-auto border p-6 rounded-2xl bg-gray-50/50">
                <JoinQueueForm
                  appointments={appointments || []}
                  onSubmit={handleJoinQueue}
                  onCancel={() => setShowJoinForm(false)}
                  isSubmitting={isJoining}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PatientQueue;
