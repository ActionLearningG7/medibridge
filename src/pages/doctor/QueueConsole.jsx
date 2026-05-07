/**
 * Doctor Queue Console
 * Main interface for doctors to manage their daily queue
 * Controls: Open, Pause, Close queue
 * Actions: Call Next, Start, Complete, No-show, Skip
 *
 * Uses all doctor appointment endpoints:
 * - useOpenDoctorQueueMutation (POST /doctors/queues/open)
 * - useCallNextPatientMutation (POST /doctors/queues/{id}/call-next)
 *
 * WebSocket: Real-time queue updates with polling fallback
 */

import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Users, Clock, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import {
  useOpenDoctorQueueMutation,
  useCallNextPatientMutation,
  useGetTodayQueueQuery,
  useGetQueueEntriesQuery,
  usePauseQueueMutation,
  useResumeQueueMutation,
  useCloseQueueMutation,
  useCompleteQueueEntryMutation,
  useMarkNoShowMutation,
  useSkipPatientMutation,
  useUpdateQueueSettingsMutation,
} from '../../features/appointment/appointmentApi';
import { useStartVideoSessionMutation } from '../../features/appointment/consultationApi';
import { useDoctorQueueSocket } from '../../hooks/useQueueSocket';
import { useToast } from '../../components/feedback/ToastProvider';
import { PageHeader } from '../../components/layout';
import QueueControls from '../../components/doctor/QueueControls';
import QueueTable from '../../components/doctor/QueueTable';
import QueueSettingsModal from '../../components/doctor/QueueSettingsModal';
import QueueEntryActions from '../../components/doctor/QueueEntryActions';
import MetricCard from '../../components/dashboard/MetricCard';

const DoctorQueueConsole = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // ...existing code...
  const [currentQueueId, setCurrentQueueId] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [currentPatient, setCurrentPatient] = useState(null);

  // Fetch today's queue
  const {
    data: todayQueue,
    isLoading: isLoadingQueue,
    error: queueError,
    refetch: refetchQueue
  } = useGetTodayQueueQuery(undefined, {
    skip: false,
    pollingInterval: 30000, // Poll every 30 seconds
  });

  // Fetch queue entries only when we have a queue ID
  const {
    data: queueEntries = [],
    isLoading: isLoadingEntries,
    refetch: refetchEntries
  } = useGetQueueEntriesQuery(currentQueueId, {
    skip: !currentQueueId,
    pollingInterval: 15000, // Poll every 15 seconds for entries
  });

  // Mutations
  const [openQueue, { isLoading: isOpening }] = useOpenDoctorQueueMutation();
  const [callNext, { isLoading: isCalling }] = useCallNextPatientMutation();
  const [pauseQueue] = usePauseQueueMutation();
  const [resumeQueue] = useResumeQueueMutation();
  const [closeQueue] = useCloseQueueMutation();
  const [completeEntry] = useCompleteQueueEntryMutation();
  const [markNoShow] = useMarkNoShowMutation();
  const [skipPatient] = useSkipPatientMutation();
  const [updateSettings] = useUpdateQueueSettingsMutation();
  const [startVideo, { isLoading: isStartingVideo }] = useStartVideoSessionMutation();

  // Extract queue status and ID from fetched data
  const queueStatus = todayQueue?.status || 'CLOSED';
  const avgConsultationMinutes = todayQueue?.avgConsultationMinutes || 15;

  // Update current queue ID when today's queue changes
  useEffect(() => {
    if (todayQueue?.id) {
      setCurrentQueueId(todayQueue.id);
    }
  }, [todayQueue]);

  // Refetch callback for WebSocket updates
  const refetchQueueData = useCallback(() => {
    console.log('[QueueConsole] Queue update received via WebSocket');
    refetchQueue();
    if (currentQueueId) {
      refetchEntries();
    }
    showToast.info('Queue updated', { duration: 2000 });
  }, [refetchQueue, refetchEntries, currentQueueId, showToast]);

  // WebSocket connection with fallback to polling
  const { isConnected: wsConnected, isPolling } = useDoctorQueueSocket(
    currentQueueId,
    refetchQueueData
  );


  // Statistics - handle both backend status names
  const stats = {
    total: queueEntries.length,
    waiting: queueEntries.filter((e) => e.status === 'WAITING').length,
    serving: queueEntries.filter((e) =>
      e.status === 'IN_CONSULTATION' ||
      e.status === 'IN_PROGRESS' ||
      e.status === 'SERVING'
    ).length,
    emergency: queueEntries.filter((e) => e.priority === 'EMERGENCY').length,
    called: queueEntries.filter((e) => e.status === 'CALLED').length,
    completed: queueEntries.filter((e) => e.status === 'COMPLETED').length,
  };

  // ========== Queue Control Actions ==========

  const handleOpenQueue = async () => {
    try {
      console.log('Opening queue...');
      const result = await openQueue().unwrap();
      console.log('Queue opened, result:', result);

      // Extract queue ID from response
      const queueId = result?.id || result?.queueId;

      if (queueId) {
        setCurrentQueueId(queueId);
        console.log('Queue ID set:', queueId);
      }

      // Refetch today's queue to get updated status
      refetchQueue();

      showToast.success('Queue opened successfully!');
    } catch (error) {
      console.error('Failed to open queue:', error);

      // Handle specific error cases
      if (error?.status === 401) {
        showToast.error('Authentication failed. Please login again.');
      } else if (error?.status === 403) {
        showToast.error('You do not have permission to open queue.');
      } else if (error?.status === 404) {
        showToast.error('Queue endpoint not found. Please check if appointment service is running.');
      } else {
        showToast.error(error?.data?.message || error?.message || 'Failed to open queue');
      }
    }
  };

  const handlePauseQueue = () => {
    setConfirmAction({
      title: 'Pause Queue',
      message: 'Are you sure you want to pause the queue? Patients cannot join while paused.',
      type: 'warning',
      confirmText: 'Yes, Pause',
      onConfirm: async () => {
        try {
          await pauseQueue(currentQueueId).unwrap();
          showToast.success('Queue paused');
          setConfirmAction(null);
        } catch (error) {
          showToast.error(error?.data?.message || 'Failed to pause queue');
        }
      },
    });
  };

  const handleResumeQueue = async () => {
    try {
      await resumeQueue(currentQueueId).unwrap();
      showToast.success('Queue resumed');
    } catch (error) {
      showToast.error(error?.data?.message || 'Failed to resume queue');
    }
  };

  const handleCloseQueue = () => {
    setConfirmAction({
      title: 'Close Queue',
      message:
        'Are you sure you want to close the queue? This will end today\'s session. Waiting patients will be notified.',
      type: 'danger',
      confirmText: 'Yes, Close Queue',
      onConfirm: async () => {
        try {
          await closeQueue(currentQueueId).unwrap();
          showToast.success('Queue closed');
          setCurrentPatient(null);
          setConfirmAction(null);
        } catch (error) {
          showToast.error(error?.data?.message || 'Failed to close queue');
        }
      },
    });
  };

  // ========== Patient Actions ==========

  const handleCallNext = async () => {
    if (!currentQueueId) {
      showToast.error('No active queue. Please open the queue first.');
      return;
    }

    if (queueStatus !== 'OPEN') {
      showToast.error('Queue must be open to call patients.');
      return;
    }

    const waitingPatients = queueEntries.filter((e) => e.status === 'WAITING');
    if (waitingPatients.length === 0) {
      showToast.info('No patients waiting in queue.');
      return;
    }

    try {
      console.log('Calling next patient for queue:', currentQueueId);
      const result = await callNext(currentQueueId).unwrap();
      console.log('Call next result:', result);

      // Update current patient from result
      if (result) {
        setCurrentPatient(result);
      }

      // Refetch queue entries to get updated list
      refetchEntries();

      showToast.success(`Called patient: ${result.patientName || `Token #${result.tokenNumber}`}`);
    } catch (error) {
      console.error('Failed to call next patient:', error);

      // Handle specific error cases
      if (error?.status === 401) {
        showToast.error('Authentication failed. Please login again.');
      } else if (error?.status === 400) {
        showToast.error('Invalid queue or no patients waiting. Try reopening the queue.');
      } else if (error?.status === 404) {
        showToast.error('Queue not found. Please open the queue again.');
        refetchQueue();
      } else {
        showToast.error(error?.data?.message || error?.message || 'Failed to call next patient');
      }
    }
  };

  const handleStartConsultation = (entry) => {
    setConfirmAction({
      title: 'Start Consultation',
      message: `Start consultation with ${entry.patientName || `Token #${entry.tokenNumber}`}?`,
      type: 'primary',
      confirmText: 'Start',
      onConfirm: async () => {
        try {
          console.log('📞 [QueueConsole] Starting video consultation for entry:', entry);

          // Call start-video API
          const result = await startVideo({
            queueEntryId: entry.id,
            consultationId: entry.consultationId,
          }).unwrap();

          console.log('✅ [QueueConsole] Video session started:', result);

          // Show success toast
          showToast.success('Video consultation started');

          // Navigate to video consultation page with session context
          // The video page will refetch the active session automatically
          navigate('/doctor/consultation/video', {
            state: {
              sessionId: result.sessionId,
              roomId: result.roomId,
              patientId: entry.patientId,
              patientName: entry.patientName,
              queueEntryId: entry.id,
              appointmentId: entry.appointmentId,
            },
            replace: true, // Replace history to prevent back navigation during call
          });

          setConfirmAction(null);
        } catch (error) {
          console.error('❌ [QueueConsole] Failed to start video:', error);

          let errorMessage = 'Failed to start consultation';
          if (error?.status === 400) {
            // Try to get the actual backend error message
            errorMessage = error?.data?.message || 'Invalid consultation state. Please try again.';
          } else if (error?.status === 404) {
            errorMessage = 'Consultation not found. Please refresh and try again.';
          } else if (error?.status === 409) {
            errorMessage = 'A consultation is already in progress.';
          } else if (error?.data?.message) {
            errorMessage = error.data.message;
          }

          showToast.error(errorMessage);
          setConfirmAction(null);
        }
      },
    });
  };

  const handleCompleteConsultation = (entry) => {
    setConfirmAction({
      title: 'Complete Consultation',
      message: `Mark consultation with ${entry.patientName || `Token #${entry.tokenNumber}`} as complete?`,
      type: 'success',
      confirmText: 'Complete',
      onConfirm: async () => {
        try {
          await completeEntry(entry.id).unwrap();
          showToast.success('Consultation completed');
          if (currentPatient?.id === entry.id) setCurrentPatient(null);
          setConfirmAction(null);
        } catch (error) {
          showToast.error(error?.data?.message || 'Failed to complete consultation');
        }
      },
    });
  };

  const handleNoShow = (entry) => {
    setConfirmAction({
      title: 'Mark as No Show',
      message: `Mark ${entry.patientName || `Token #${entry.tokenNumber}`} as no show? This cannot be undone.`,
      type: 'danger',
      confirmText: 'Mark No Show',
      onConfirm: async () => {
        try {
          await markNoShow(entry.id).unwrap();
          showToast.success('Patient marked as no-show');
          if (currentPatient?.id === entry.id) setCurrentPatient(null);
          setConfirmAction(null);
        } catch (error) {
          showToast.error(error?.data?.message || 'Failed to mark no-show');
        }
      },
    });
  };

  const handleSkip = (entry) => {
    setConfirmAction({
      title: 'Skip Patient',
      message: `Skip ${entry.patientName || `Token #${entry.tokenNumber}`}? They will be moved to the end of the queue.`,
      type: 'warning',
      confirmText: 'Skip',
      onConfirm: async () => {
        try {
          await skipPatient(entry.id).unwrap();
          showToast.success('Patient skipped');
          if (currentPatient?.id === entry.id) setCurrentPatient(null);
          setConfirmAction(null);
        } catch (error) {
          showToast.error(error?.data?.message || 'Failed to skip patient');
        }
      },
    });
  };

  const handleSaveSettings = async (settings) => {
    try {
      await updateSettings({
        queueId: currentQueueId,
        settings
      }).unwrap();
      showToast.success('Queue settings updated');
      setShowSettingsModal(false);
    } catch (error) {
      showToast.error(error?.data?.message || 'Failed to update settings');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Queue Console"
        subtitle="Manage your daily consultation queue"
        breadcrumbs={[{ label: 'Doctor', href: '/doctor' }, { label: 'Queue Console' }]}
      />

      {/* Loading State */}
      {isLoadingQueue && !todayQueue && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading queue data...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {queueError && queueError.status !== 404 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Failed to load queue</h3>
              <p className="text-sm text-red-700 mt-1">
                {queueError?.data?.message || 'Unable to fetch today\'s queue. Please try again.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* No Queue Today State */}
      {!isLoadingQueue && !todayQueue && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 mb-6 text-center">
          <div className="flex flex-col items-center">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Queue for Today</h3>
            <p className="text-sm text-gray-600 mb-6 max-w-md">
              You haven't opened your consultation queue yet. Click the button below to start accepting patients.
            </p>
            <button
              onClick={handleOpenQueue}
              disabled={isOpening}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isOpening ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Opening Queue...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Open Queue for Today
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 mt-4">
              Average consultation time will be set to {avgConsultationMinutes} minutes (can be changed later)
            </p>
          </div>
        </div>
      )}

      {/* Queue Active - Show Controls and Data */}
      {todayQueue && (
        <>
          {/* WebSocket Connection Status */}
          {currentQueueId && (
            <div className="mb-4">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${wsConnected
                ? 'bg-green-50 text-green-700 border border-green-200'
                : isPolling
                  ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                  : 'bg-gray-50 text-gray-700 border border-gray-200'
                }`}>
                {wsConnected ? (
                  <>
                    <Wifi className="h-3 w-3" />
                    <span>Live updates active</span>
                  </>
                ) : isPolling ? (
                  <>
                    <WifiOff className="h-3 w-3" />
                    <span>Polling mode (WebSocket disconnected)</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3" />
                    <span>No connection</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <MetricCard
              title="Total Today"
              value={stats.total}
              icon={Users}
              iconColor="text-blue-600"
              iconBgColor="bg-blue-100"
            />
            <MetricCard
              title="Waiting"
              value={stats.waiting}
              icon={Clock}
              iconColor="text-yellow-600"
              iconBgColor="bg-yellow-100"
            />
            <MetricCard
              title="Called"
              value={stats.called}
              icon={AlertCircle}
              iconColor="text-blue-600"
              iconBgColor="bg-blue-100"
            />
            <MetricCard
              title="In Progress"
              value={stats.serving}
              icon={Users}
              iconColor="text-purple-600"
              iconBgColor="bg-purple-100"
            />
            <MetricCard
              title="Completed"
              value={stats.completed}
              icon={CheckCircle}
              iconColor="text-green-600"
              iconBgColor="bg-green-100"
            />
          </div>

          {/* Queue Controls */}
          <div className="mb-6">
            <QueueControls
              queueStatus={queueStatus}
              onOpen={handleOpenQueue}
              onPause={queueStatus === 'OPEN' ? handlePauseQueue : handleResumeQueue}
              onClose={handleCloseQueue}
              onCallNext={handleCallNext}
              onSettings={() => setShowSettingsModal(true)}
              isOpening={isOpening}
              isCalling={isCalling}
              stats={stats}
            />
          </div>

          {/* Current Patient Section */}
          {currentPatient && (
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {currentPatient.tokenNumber}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Current Patient</h3>
                      <p className="text-sm text-gray-600">
                        {currentPatient.patientName} • ID: {currentPatient.patientId}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-700">
                    <span className="inline-flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {currentPatient.appointmentTime}
                    </span>
                    {currentPatient.priority === 'EMERGENCY' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Emergency
                      </span>
                    )}
                  </div>
                </div>

                <QueueEntryActions
                  entry={currentPatient}
                  onCall={() => { }}
                  onStart={handleStartConsultation}
                  onComplete={handleCompleteConsultation}
                  onNoShow={handleNoShow}
                  onSkip={handleSkip}
                  isCurrentPatient={true}
                />
              </div>
            </div>
          )}

          {/* Call Next Button (if no current patient) */}
          {!currentPatient && queueStatus === 'OPEN' && stats.waiting > 0 && (
            <div className="mb-6">
              <button
                onClick={handleCallNext}
                disabled={isCalling}
                className="w-full py-4 bg-primary-600 text-white text-lg font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isCalling ? 'Calling...' : `Call Next Patient (${stats.waiting} waiting)`}
              </button>
            </div>
          )}

          {/* Queue Table */}
          <QueueTable
            entries={queueEntries}
            onStart={handleStartConsultation}
            onComplete={handleCompleteConsultation}
            onNoShow={handleNoShow}
            onSkip={handleSkip}
            avgConsultationMinutes={avgConsultationMinutes}
          />

          {/* Queue Closed State */}
          {queueStatus === 'CLOSED' && (
            <div className="mt-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12">
              <div className="text-center">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Queue is Closed</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Open the queue to start accepting patients for today's consultation.
                </p>
                <button
                  onClick={handleOpenQueue}
                  disabled={isOpening}
                  className="px-6 py-3 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isOpening ? 'Opening...' : 'Open Queue for Today'}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <QueueSettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          onSave={handleSaveSettings}
          currentSettings={{ avgConsultationMinutes }}
        />
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setConfirmAction(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle
                  className={`h-6 w-6 flex-shrink-0 mt-0.5 ${confirmAction.type === 'danger'
                    ? 'text-red-600'
                    : confirmAction.type === 'warning'
                      ? 'text-yellow-600'
                      : confirmAction.type === 'success'
                        ? 'text-green-600'
                        : 'text-blue-600'
                    }`}
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{confirmAction.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{confirmAction.message}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction.onConfirm}
                  className={`px-4 py-2 text-white text-sm font-medium rounded-md transition-colors ${confirmAction.type === 'danger'
                    ? 'bg-red-600 hover:bg-red-700'
                    : confirmAction.type === 'warning'
                      ? 'bg-yellow-600 hover:bg-yellow-700'
                      : confirmAction.type === 'success'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                  {confirmAction.confirmText}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DoctorQueueConsole;
