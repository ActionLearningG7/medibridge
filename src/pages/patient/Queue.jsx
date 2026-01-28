/**
 * Patient Queue Page
 * Join queue, view position/ETA, and poll status every 15 seconds
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useJoinQueueMutation,
  useLeaveQueueMutation,
  useGetMyActiveQueueQuery,
  useGetMyAppointmentsQuery,
} from '../../features/appointment/appointmentApi';
import { useGetVerifiedDoctorsQuery } from '../../features/user/doctorApi';
import { usePatientQueueSocket } from '../../hooks/useQueueSocket';
import { useToast } from '../../components/feedback/ToastProvider';
import { SkeletonCard } from '../../components/feedback/Skeleton';
import JoinQueueForm from '../../components/appointment/JoinQueueForm';
import QueueStatus from '../../components/appointment/QueueStatus';

const PatientQueue = () => {
  const navigate = useNavigate();
  const [showJoinForm, setShowJoinForm] = useState(false);
  const { showToast } = useToast();

  // Query active queue - will poll automatically
  const {
    data: activeQueue,
    isLoading,
    error,
    refetch,
  } = useGetMyActiveQueueQuery(undefined, {
    pollingInterval: 15000, // Poll every 15 seconds
    refetchOnMountOrArgChange: true,
  });

  // WebSocket connection with fallback to polling
  const { isConnected: wsConnected, isPolling } = usePatientQueueSocket(refetch);

  // Get appointments and doctors for join form
  const { data: rawAppointments } = useGetMyAppointmentsQuery();
  const { data: doctors } = useGetVerifiedDoctorsQuery();

  // Transform appointments to include doctor details and map field names
  const appointments = useMemo(() => {
    if (!rawAppointments || !Array.isArray(rawAppointments)) {
      return [];
    }

    return rawAppointments.map(apt => {
      // Find doctor from the verified doctors list
      const doctor = doctors?.find(d => d.userId === apt.doctorId || d.id === apt.doctorId);

      return {
        ...apt,
        date: apt.appointmentDate,           // Map: appointmentDate -> date
        reason: apt.reasonForVisit,          // Map: reasonForVisit -> reason
        doctorName: doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Doctor',
        doctorSpecialization: doctor?.specialization || 'General',
        doctor: doctor || null,
      };
    });
  }, [rawAppointments, doctors]);

  // Join queue mutation
  const [joinQueue, { isLoading: isJoining }] = useJoinQueueMutation();

  const hasActiveQueue = activeQueue && !error;

  const handleJoinClick = () => {
    setShowJoinForm(true);
  };

  const handleJoinQueue = async (queueData) => {
    try {
      await joinQueue(queueData).unwrap();
      setShowJoinForm(false);
      showToast.success('Successfully joined queue');
      refetch();
    } catch (err) {
      showToast.error(err?.data?.message || 'Failed to join queue');
    }
  };

  // Leave queue mutation
  const [leaveQueue, { isLoading: isLeaving }] = useLeaveQueueMutation();

  const handleLeaveQueue = async () => {
    if (!activeQueue?.id) return;

    // Confirm before leaving
    if (!window.confirm('Are you sure you want to leave the queue? You will lose your spot.')) {
      return;
    }

    try {
      await leaveQueue(activeQueue.id).unwrap();
      showToast.success('You have left the queue');
      refetch();
    } catch (err) {
      showToast.error(err?.data?.message || 'Failed to leave queue');
    }
  };

  const handleJoinVideoConsultation = () => {
    console.log('📹 [PatientQueue] Joining video consultation for queue entry:', activeQueue);

    // Navigate to video consultation page with queue entry context
    // The video page will refetch the active session automatically
    navigate('/patient/consultation/video', {
      state: {
        queueEntryId: activeQueue?.id,
        appointmentId: activeQueue?.appointmentId,
        doctorId: activeQueue?.doctorId,
      },
      replace: false, // Allow back navigation to queue page
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Virtual Queue</h1>
          <p className="mt-2 text-sm text-gray-600">
            Join the queue and track your position in real-time
          </p>
        </div>

        {/* Polling Indicator */}
        {hasActiveQueue && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center">
            {wsConnected ? (
              <>
                <svg className="h-4 w-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-green-700 font-medium">
                  Live updates active
                </span>
              </>
            ) : isPolling ? (
              <>
                <svg className="animate-spin h-4 w-4 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-sm text-blue-700">
                  Auto-updating every 15 seconds... (WebSocket reconnecting)
                </span>
              </>
            ) : (
              <>
                <svg className="animate-spin h-4 w-4 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-sm text-blue-700">
                  Auto-updating every 15 seconds...
                </span>
              </>
            )}
          </div>
        )}

        {/* Content */}
        {isLoading && !activeQueue ? (
          <SkeletonCard />
        ) : hasActiveQueue ? (
          <>
            {/* Queue Status Display */}
            <QueueStatus
              queueEntry={activeQueue}
              onLeave={handleLeaveQueue}
              onJoinVideo={handleJoinVideoConsultation}
            />

            {/* Info Section */}
            <div className="mt-8 bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Queue Information</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start">
                  <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>Your position updates automatically every 15 seconds</p>
                </div>
                <div className="flex items-start">
                  <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>Estimated wait time is calculated based on current queue length</p>
                </div>
                <div className="flex items-start">
                  <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <p>You'll be notified when it's your turn</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* No Active Queue - Show Join Form */
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                <svg className="h-10 w-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Active Queue
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                You're not currently in any queue. Join a queue to wait for your appointment.
              </p>

              {!showJoinForm ? (
                <button
                  onClick={handleJoinClick}
                  className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Join Queue
                </button>
              ) : (
                <div className="mt-6">
                  <JoinQueueForm
                    appointments={appointments || []}
                    onSubmit={handleJoinQueue}
                    onCancel={() => setShowJoinForm(false)}
                    isSubmitting={isJoining}
                  />
                </div>
              )}
            </div>

            {/* Info Cards */}
            <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-4">How it works</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary-500 text-white font-semibold">
                      1
                    </div>
                  </div>
                  <div className="ml-3">
                    <h5 className="text-sm font-medium text-gray-900">Select Appointment</h5>
                    <p className="text-xs text-gray-500">Choose your scheduled appointment</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary-500 text-white font-semibold">
                      2
                    </div>
                  </div>
                  <div className="ml-3">
                    <h5 className="text-sm font-medium text-gray-900">Join Queue</h5>
                    <p className="text-xs text-gray-500">Get your token and position</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary-500 text-white font-semibold">
                      3
                    </div>
                  </div>
                  <div className="ml-3">
                    <h5 className="text-sm font-medium text-gray-900">Wait for Turn</h5>
                    <p className="text-xs text-gray-500">Track your position in real-time</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientQueue;
