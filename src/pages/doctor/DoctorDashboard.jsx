/**
 * Doctor Dashboard Page
 * Premium dashboard with real API integration
 */

import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectAccessToken, selectAuthInitialized } from '../../features/auth/authSlice';
import { useGetMyDoctorProfileQuery } from '../../features/user/doctorApi';
import { useOpenDoctorQueueMutation, useCallNextPatientMutation } from '../../features/appointment/appointmentApi';
import { PageHeader } from '../../components/layout';
import MetricCard from '../../components/dashboard/MetricCard';
import QuickActions from '../../components/dashboard/QuickActions';
import { Users, Clock, PlayCircle, PauseCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '../../components/feedback/ToastProvider';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const currentUser = useSelector(selectCurrentUser);
  const accessToken = useSelector(selectAccessToken);
  const initialized = useSelector(selectAuthInitialized);

  // Skip queries until auth is ready
  const shouldSkipQueries = !initialized || !accessToken;

  // Fetch doctor profile - skip if not ready
  const { data: profile, isLoading: profileLoading } = useGetMyDoctorProfileQuery(undefined, {
    skip: shouldSkipQueries,
  });

  // Mutations
  const [openQueue, { isLoading: openingQueue }] = useOpenDoctorQueueMutation();
  const [callNext, { isLoading: callingNext }] = useCallNextPatientMutation();

  // Mock queue data (replace with real API when available)
  const queueData = {
    status: 'CLOSED', // OPEN, PAUSED, CLOSED
    todayTotal: 0,
    waiting: 0,
    completed: 0,
    avgWaitTime: '0 min',
    nextPatients: [],
  };

  const handleOpenQueue = async () => {
    try {
      await openQueue().unwrap();
      showToast.success('Queue opened successfully');
    } catch (error) {
      showToast.error(error?.data?.message || 'Failed to open queue');
    }
  };

  const handleCallNext = async () => {
    try {
      const nextPatient = await callNext(queueData.id).unwrap();
      showToast.success(`Called patient: ${nextPatient.patientName || 'Token ' + nextPatient.tokenNumber}`);
    } catch (error) {
      showToast.error(error?.data?.message || 'Failed to call next patient');
    }
  };

  const handlePauseQueue = () => {
    showToast.info('Pause queue feature coming soon');
  };

  const handleCloseQueue = () => {
    showToast.info('Close queue feature coming soon');
  };

  // Queue status colors
  const getStatusColor = (status) => {
    const colors = {
      OPEN: 'bg-green-100 text-green-800 border-green-200',
      PAUSED: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      CLOSED: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[status] || colors.CLOSED;
  };

  // Quick actions based on queue status
  const quickActions = [
    {
      id: 'open-queue',
      label: queueData.status === 'CLOSED' ? 'Open Queue' : 'Queue Opened',
      icon: PlayCircle,
      iconColor: 'text-green-600',
      onClick: handleOpenQueue,
      disabled: queueData.status !== 'CLOSED' || openingQueue,
      variant: queueData.status === 'CLOSED' ? 'primary' : undefined,
    },
    {
      id: 'pause-queue',
      label: 'Pause Queue',
      icon: PauseCircle,
      iconColor: 'text-yellow-600',
      onClick: handlePauseQueue,
      disabled: queueData.status !== 'OPEN',
    },
    {
      id: 'call-next',
      label: 'Call Next',
      icon: Users,
      iconColor: 'text-blue-600',
      onClick: handleCallNext,
      disabled: queueData.status !== 'OPEN' || queueData.waiting === 0 || callingNext,
      badge: queueData.waiting > 0 ? `${queueData.waiting} waiting` : null,
    },
    {
      id: 'view-queue',
      label: 'View Full Queue',
      icon: Clock,
      iconColor: 'text-purple-600',
      onClick: () => navigate('/doctor/queue'),
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title={`Welcome back, Dr. ${currentUser?.lastName || 'Doctor'}!`}
        subtitle="Manage your consultations and queue"
      />

      {/* Queue Status Banner */}
      <div className={`rounded-lg p-4 mb-8 border ${getStatusColor(queueData.status)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`h-3 w-3 rounded-full ${queueData.status === 'OPEN'
                    ? 'bg-green-600 animate-pulse'
                    : queueData.status === 'PAUSED'
                      ? 'bg-yellow-600'
                      : 'bg-gray-600'
                  }`}
              />
              <span className="font-semibold">Queue Status: {queueData.status}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {queueData.status === 'CLOSED' && (
              <button
                onClick={handleOpenQueue}
                disabled={openingQueue}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {openingQueue ? 'Opening...' : 'Open Queue'}
              </button>
            )}
            {queueData.status === 'OPEN' && (
              <>
                <button
                  onClick={handlePauseQueue}
                  className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700 transition-colors"
                >
                  Pause
                </button>
                <button
                  onClick={handleCloseQueue}
                  className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Today's Total */}
        <MetricCard
          title="Today's Patients"
          value={queueData.todayTotal}
          icon={Users}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
          footer={`${queueData.completed} completed`}
          loading={false}
        />

        {/* Currently Waiting */}
        <MetricCard
          title="Currently Waiting"
          value={queueData.waiting}
          icon={Clock}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
          footer={`Avg wait: ${queueData.avgWaitTime}`}
          loading={false}
        />

        {/* Completed Today */}
        <MetricCard
          title="Completed Today"
          value={queueData.completed}
          icon={CheckCircle}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          footer={`${queueData.todayTotal - queueData.completed} remaining`}
          loading={false}
        />

        {/* Profile Status */}
        <MetricCard
          title="Profile Status"
          value={profile?.verificationStatus || 'Loading...'}
          icon={AlertCircle}
          iconColor={profile?.verificationStatus === 'VERIFIED' ? 'text-green-600' : 'text-yellow-600'}
          iconBgColor={profile?.verificationStatus === 'VERIFIED' ? 'bg-green-100' : 'bg-yellow-100'}
          footer={`${profile?.specialization || 'Specialist'}`}
          loading={profileLoading}
          onClick={() => navigate('/doctor/profile')}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Next Patients */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Next Patients in Queue</h3>
              <button
                onClick={() => navigate('/doctor/queue')}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View Full Queue →
              </button>
            </div>

            {queueData.status === 'CLOSED' ? (
              <div className="text-center py-12">
                <PlayCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Queue is Closed</h4>
                <p className="text-sm text-gray-500 mb-4">
                  Open the queue to start seeing patients today
                </p>
                <button
                  onClick={handleOpenQueue}
                  disabled={openingQueue}
                  className="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {openingQueue ? 'Opening...' : 'Open Queue Now'}
                </button>
              </div>
            ) : queueData.nextPatients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Patients Waiting</h4>
                <p className="text-sm text-gray-500">
                  Queue is open but no patients are currently waiting
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Token</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wait Time</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {queueData.nextPatients.slice(0, 5).map((patient, index) => (
                      <tr key={patient.id} className={index === 0 ? 'bg-primary-50' : ''}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          #{patient.tokenNumber}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {patient.patientName || 'Patient'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${patient.isEmergency
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                              }`}
                          >
                            {patient.isEmergency ? 'Emergency' : 'Regular'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {patient.waitTime || 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          {index === 0 && (
                            <button
                              onClick={handleCallNext}
                              disabled={callingNext}
                              className="text-sm text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
                            >
                              Call
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Queue Information */}
          {queueData.status === 'OPEN' && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-blue-900">Queue Management Tips</h3>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                    <li>Call next patient when ready for consultation</li>
                    <li>Pause queue during lunch break or emergencies</li>
                    <li>Close queue at end of day or when no longer available</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Quick Actions */}
        <div className="space-y-6">
          <QuickActions actions={quickActions} loading={false} />

          {/* Today's Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Patients:</span>
                <span className="font-medium text-gray-900">{queueData.todayTotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Completed:</span>
                <span className="font-medium text-green-600">{queueData.completed}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Waiting:</span>
                <span className="font-medium text-purple-600">{queueData.waiting}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Avg Wait Time:</span>
                <span className="font-medium text-gray-900">{queueData.avgWaitTime}</span>
              </div>
            </div>
          </div>

          {/* Profile Card */}
          {!profileLoading && profile && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Profile</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="text-sm font-medium text-gray-900">
                    Dr. {profile.firstName} {profile.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Specialization</p>
                  <p className="text-sm font-medium text-gray-900">{profile.specialization}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">License Number</p>
                  <p className="text-sm font-medium text-gray-900">{profile.licenseNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${profile.verificationStatus === 'VERIFIED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                      }`}
                  >
                    {profile.verificationStatus}
                  </span>
                </div>
                <button
                  onClick={() => navigate('/doctor/profile')}
                  className="w-full mt-4 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
                >
                  View Full Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
