/**
 * Patient Dashboard Page
 * Premium dashboard with real API integration
 */

import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectAccessToken, selectAuthInitialized } from '../../features/auth/authSlice';
import { useGetMyPatientProfileQuery } from '../../features/user/patientApi';
import { useGetMyAppointmentsQuery } from '../../features/appointment/appointmentApi';
import { useGetMyActiveQueueQuery } from '../../features/appointment/appointmentApi';
import { PageHeader } from '../../components/layout';
import MetricCard from '../../components/dashboard/MetricCard';
import ActivityTimeline from '../../components/dashboard/ActivityTimeline';
import QuickActions from '../../components/dashboard/QuickActions';
import { Calendar, Clock, User, CheckCircle, AlertCircle } from 'lucide-react';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const accessToken = useSelector(selectAccessToken);
  const initialized = useSelector(selectAuthInitialized);

  console.log('📊 PatientDashboard render:', {
    initialized,
    hasToken: !!accessToken,
    userRole: currentUser?.role,
    userId: currentUser?.id
  });

  // Skip queries until auth is initialized and token exists
  const shouldSkipQueries = !initialized || !accessToken;

  console.log('📊 PatientDashboard shouldSkipQueries:', shouldSkipQueries);

  // Fetch patient profile - skip if not ready
  const { data: profile, isLoading: profileLoading, error: profileError } = useGetMyPatientProfileQuery(undefined, {
    skip: shouldSkipQueries,
  });

  // Fetch appointments - skip if not ready
  const { data: appointments = [], isLoading: appointmentsLoading, error: appointmentsError } = useGetMyAppointmentsQuery(undefined, {
    skip: shouldSkipQueries,
  });

  // Fetch active queue - skip if not ready
  const { data: activeQueue, isLoading: queueLoading, error: queueError } = useGetMyActiveQueueQuery(undefined, {
    skip: shouldSkipQueries,
  });

  // Log profile fetch errors for debugging
  if (profileError) {
    console.error('📊 PatientDashboard: Profile fetch error:', profileError);
  }

  if (appointmentsError) {
    console.error('📊 PatientDashboard: Appointments fetch error:', appointmentsError);
  }

  if (queueError) {
    console.error('📊 PatientDashboard: Queue fetch error:', queueError);
  }

  // Calculate profile completion
  const calculateProfileCompletion = (profile) => {
    if (!profile) return 0;

    const fields = [
      profile.firstName,
      profile.lastName,
      profile.email,
      profile.phoneNumber,
      profile.dateOfBirth,
      profile.gender,
      profile.bloodGroup,
      profile.address,
      profile.emergencyContact,
    ];

    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion(profile);

  // Filter upcoming appointments
  // Create a copy before sorting to avoid mutating immutable array
  const upcomingAppointments = [...appointments]
    .filter(apt => {
      const aptDate = new Date(apt.appointmentDate);
      return aptDate >= new Date() && apt.status !== 'CANCELLED';
    })
    .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
    .slice(0, 3);

  // Generate activity timeline from appointments and queue
  const generateActivity = () => {
    const activities = [];

    // Add recent appointments
    // Create a copy before sorting to avoid mutating immutable array
    [...appointments]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3)
      .forEach(apt => {
        activities.push({
          id: apt.id,
          type: 'appointment',
          title: `Appointment with Dr. ${apt.doctorName || 'Doctor'}`,
          description: apt.reason || `Scheduled for ${new Date(apt.appointmentDate).toLocaleDateString()}`,
          timestamp: apt.createdAt,
        });
      });

    // Add queue activity
    if (activeQueue) {
      activities.push({
        id: 'queue-active',
        type: 'queue',
        title: 'You are in the queue',
        description: `Position: ${activeQueue.position || 'Waiting'} | Token: ${activeQueue.tokenNumber}`,
        timestamp: activeQueue.joinedAt,
      });
    }

    // Add profile completion activity
    if (profileCompletion < 100) {
      activities.push({
        id: 'profile-incomplete',
        type: 'warning',
        title: 'Profile incomplete',
        description: `${profileCompletion}% complete. Update your profile for better service.`,
        timestamp: new Date().toISOString(),
      });
    }

    return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);
  };

  const activities = generateActivity();

  // Quick actions
  const quickActions = [
    {
      id: 'book-appointment',
      label: 'Book Appointment',
      icon: Calendar,
      iconColor: 'text-blue-600',
      onClick: () => navigate('/patient/appointments'),
      variant: 'primary',
    },
    {
      id: 'join-queue',
      label: 'Join Queue',
      icon: Clock,
      iconColor: 'text-purple-600',
      onClick: () => navigate('/patient/queue'),
      disabled: !!activeQueue,
      badge: activeQueue ? 'In Queue' : null,
    },
    {
      id: 'view-profile',
      label: 'View Profile',
      icon: User,
      iconColor: 'text-green-600',
      onClick: () => navigate('/patient/profile'),
    },
    {
      id: 'medical-records',
      label: 'Medical Records',
      icon: CheckCircle,
      iconColor: 'text-indigo-600',
      onClick: () => {}, // Future feature
      disabled: true,
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title={`Welcome back, ${currentUser?.firstName || 'Patient'}!`}
        subtitle="Here's your health dashboard overview"
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Profile Completion */}
        <MetricCard
          title="Profile Completion"
          value={`${profileCompletion}%`}
          icon={User}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          change={profileCompletion < 100 ? 'Incomplete' : 'Complete'}
          changeType={profileCompletion < 100 ? 'warning' : 'positive'}
          footer={profileCompletion < 100 ? 'Update your profile' : 'Profile complete'}
          loading={profileLoading}
          onClick={profileCompletion < 100 ? () => navigate('/patient/profile') : undefined}
        />

        {/* Upcoming Appointments */}
        <MetricCard
          title="Upcoming Appointments"
          value={upcomingAppointments.length}
          icon={Calendar}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
          footer={
            upcomingAppointments.length > 0
              ? `Next: ${new Date(upcomingAppointments[0].appointmentDate).toLocaleDateString()}`
              : 'No upcoming appointments'
          }
          loading={appointmentsLoading}
          onClick={() => navigate('/patient/appointments')}
        />

        {/* Queue Status */}
        <MetricCard
          title="Queue Status"
          value={activeQueue ? `#${activeQueue.tokenNumber}` : 'Not in Queue'}
          icon={Clock}
          iconColor={activeQueue ? 'text-purple-600' : 'text-gray-400'}
          iconBgColor={activeQueue ? 'bg-purple-100' : 'bg-gray-100'}
          change={activeQueue ? `Position: ${activeQueue.position}` : null}
          changeType={activeQueue ? 'neutral' : 'neutral'}
          footer={activeQueue ? `Est. wait: ${activeQueue.estimatedWaitTime || 'Calculating...'}` : 'Join the queue'}
          loading={queueLoading}
          onClick={() => navigate('/patient/queue')}
        />

        {/* Total Appointments */}
        <MetricCard
          title="Total Appointments"
          value={appointments.length}
          icon={CheckCircle}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-100"
          footer={
            appointments.length > 0
              ? `Last: ${new Date(appointments[appointments.length - 1]?.createdAt).toLocaleDateString()}`
              : 'No appointments yet'
          }
          loading={appointmentsLoading}
        />
      </div>

      {/* Profile Completion CTA */}
      {!profileLoading && profileCompletion < 100 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-900">Complete your profile</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Your profile is {profileCompletion}% complete. Add more information for better healthcare services.
              </p>
              <button
                onClick={() => navigate('/patient/profile')}
                className="mt-3 text-sm font-medium text-yellow-900 hover:text-yellow-800 underline"
              >
                Update Profile →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Upcoming Appointments */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h3>
              <button
                onClick={() => navigate('/patient/appointments')}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View All →
              </button>
            </div>

            {appointmentsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 border border-gray-200 rounded-lg animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : upcomingAppointments.length > 0 ? (
              <div className="space-y-3">
                {upcomingAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer"
                    onClick={() => navigate('/patient/appointments')}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          Dr. {apt.doctorName || 'Doctor'}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">{apt.reason || 'General consultation'}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(apt.appointmentDate).toLocaleDateString()}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium">
                            {apt.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No upcoming appointments</p>
                <button
                  onClick={() => navigate('/patient/appointments')}
                  className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Book an Appointment →
                </button>
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          <div className="mt-6">
            <ActivityTimeline
              activities={activities}
              loading={profileLoading && appointmentsLoading}
              emptyMessage="No recent activity to display"
            />
          </div>
        </div>

        {/* Right Column - Quick Actions & Active Queue */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <QuickActions actions={quickActions} loading={false} />

          {/* Active Queue Card */}
          {activeQueue && !queueLoading && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <Clock className="h-6 w-6 text-purple-600 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-purple-900">You're in the Queue</h3>
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-700">Token Number:</span>
                      <span className="font-medium text-purple-900">#{activeQueue.tokenNumber}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-700">Position:</span>
                      <span className="font-medium text-purple-900">{activeQueue.position || 'Waiting'}</span>
                    </div>
                    {activeQueue.estimatedWaitTime && (
                      <div className="flex justify-between text-sm">
                        <span className="text-purple-700">Est. Wait:</span>
                        <span className="font-medium text-purple-900">{activeQueue.estimatedWaitTime}</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => navigate('/patient/queue')}
                    className="mt-4 w-full px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors"
                  >
                    View Queue Status
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
