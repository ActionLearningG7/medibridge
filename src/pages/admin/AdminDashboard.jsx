/**
 * Admin Dashboard Page
 * Premium dashboard with real API integration
 */

import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectAccessToken, selectAuthInitialized } from '../../features/auth/authSlice';
import { useGetMyAdminProfileQuery, useGetSystemStatisticsQuery, useGetAllDoctorsAdminQuery } from '../../features/user/adminApi';
import { useGetPendingVerificationsQuery } from '../../features/user/doctorApi';
import { PageHeader } from '../../components/layout';
import MetricCard from '../../components/dashboard/MetricCard';
import ActivityTimeline from '../../components/dashboard/ActivityTimeline';
import QuickActions from '../../components/dashboard/QuickActions';
import { Users, UserCheck, UserX, Activity, AlertTriangle, TrendingUp } from 'lucide-react';
import { SkeletonStats, SkeletonTable } from '../../components/feedback/Skeleton';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const accessToken = useSelector(selectAccessToken);
  const initialized = useSelector(selectAuthInitialized);

  // Skip queries until auth is ready
  const shouldSkipQueries = !initialized || !accessToken;

  // Fetch admin profile - skip if not ready
  const { data: profile, isLoading: profileLoading } = useGetMyAdminProfileQuery(undefined, {
    skip: shouldSkipQueries,
  });

  // Fetch system statistics - skip if not ready
  const { data: stats, isLoading: statsLoading } = useGetSystemStatisticsQuery(undefined, {
    skip: shouldSkipQueries,
  });

  // Fetch all doctors - skip if not ready
  const { data: allDoctors = [], isLoading: doctorsLoading } = useGetAllDoctorsAdminQuery(undefined, {
    skip: shouldSkipQueries,
  });

  // Fetch pending verifications - skip if not ready
  const { data: pendingDoctors = [], isLoading: pendingLoading } = useGetPendingVerificationsQuery(undefined, {
    skip: shouldSkipQueries,
  });

  // Calculate doctor statistics
  const doctorStats = {
    total: allDoctors.length,
    verified: allDoctors.filter((d) => d.verificationStatus === 'VERIFIED').length,
    pending: pendingDoctors.length,
    active: allDoctors.filter((d) => d.status === 'ACTIVE').length,
  };

  // Generate recent activity from doctor verifications and registrations
  const generateActivity = () => {
    const activities = [];

    // Add pending verifications
    pendingDoctors.slice(0, 3).forEach((doctor) => {
      activities.push({
        id: `pending-${doctor.id}`,
        type: 'warning',
        title: 'Doctor pending verification',
        description: `Dr. ${doctor.firstName} ${doctor.lastName} - ${doctor.specialization}`,
        timestamp: doctor.createdAt,
      });
    });

    // Add recent doctor registrations
    // Create a copy before sorting to avoid mutating immutable array
    [...allDoctors]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3)
      .forEach((doctor) => {
        activities.push({
          id: `doctor-${doctor.id}`,
          type: doctor.verificationStatus === 'VERIFIED' ? 'success' : 'user',
          title: `New doctor registered`,
          description: `Dr. ${doctor.firstName} ${doctor.lastName} - ${doctor.specialization}`,
          timestamp: doctor.createdAt,
        });
      });

    return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);
  };

  const activities = generateActivity();

  // Quick actions for admin
  const quickActions = [
    {
      id: 'manage-doctors',
      label: 'Manage Doctors',
      icon: Users,
      iconColor: 'text-blue-600',
      onClick: () => navigate('/admin/doctors'),
      variant: 'primary',
      badge: pendingDoctors.length > 0 ? `${pendingDoctors.length} pending` : null,
    },
    {
      id: 'verify-doctors',
      label: 'Verify Doctors',
      icon: UserCheck,
      iconColor: 'text-green-600',
      onClick: () => navigate('/admin/doctors?tab=pending'),
      disabled: pendingDoctors.length === 0,
      badge: pendingDoctors.length > 0 ? pendingDoctors.length : null,
    },
    {
      id: 'queue-monitoring',
      label: 'Queue Monitoring',
      icon: Activity,
      iconColor: 'text-purple-600',
      onClick: () => navigate('/admin/queue-monitoring'),
    },
    {
      id: 'system-settings',
      label: 'System Settings',
      icon: AlertTriangle,
      iconColor: 'text-orange-600',
      onClick: () => navigate('/admin/settings'),
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title={`Welcome, ${currentUser?.firstName || 'Administrator'}!`}
        subtitle="System overview and management"
      />

      {/* Metrics Row */}
      {statsLoading || doctorsLoading ? (
        <SkeletonStats count={4} className="mb-8" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Doctors */}
          <MetricCard
            title="Total Doctors"
            value={doctorStats.total}
            icon={Users}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
            change={`${doctorStats.verified} verified`}
            changeType="positive"
            footer={`${doctorStats.active} active`}
            onClick={() => navigate('/admin/doctors')}
          />

          {/* Pending Verifications */}
          <MetricCard
            title="Pending Verifications"
            value={doctorStats.pending}
            icon={AlertTriangle}
            iconColor={doctorStats.pending > 0 ? 'text-yellow-600' : 'text-gray-400'}
            iconBgColor={doctorStats.pending > 0 ? 'bg-yellow-100' : 'bg-gray-100'}
            change={doctorStats.pending > 0 ? 'Action Required' : 'All Clear'}
            changeType={doctorStats.pending > 0 ? 'warning' : 'positive'}
            footer="Doctor verifications"
            onClick={doctorStats.pending > 0 ? () => navigate('/admin/doctors?tab=pending') : undefined}
          />

          {/* Total Users (from stats) */}
          <MetricCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            icon={UserCheck}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
            footer={`${stats?.activeUsers || 0} active`}
            change={`+${stats?.newUsersToday || 0} today`}
            changeType="positive"
          />

          {/* System Health */}
          <MetricCard
            title="System Health"
            value={stats?.systemHealth || 'Good'}
            icon={TrendingUp}
            iconColor="text-indigo-600"
            iconBgColor="bg-indigo-100"
            footer={`Uptime: ${stats?.uptime || '99.9%'}`}
            change={stats?.trend || 'Stable'}
            changeType="positive"
          />
        </div>
      )}

      {/* Pending Verifications Alert */}
      {!pendingLoading && pendingDoctors.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-900">Doctors Pending Verification</h3>
              <p className="text-sm text-yellow-700 mt-1">
                {pendingDoctors.length} doctor{pendingDoctors.length > 1 ? 's' : ''} waiting for verification.
                Review and verify credentials to activate their accounts.
              </p>
              <button
                onClick={() => navigate('/admin/doctors?tab=pending')}
                className="mt-3 text-sm font-medium text-yellow-900 hover:text-yellow-800 underline"
              >
                Review Pending Doctors →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Doctor Statistics */}
        <div className="lg:col-span-2">
          {/* Recent Doctors Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Doctors</h3>
              <button
                onClick={() => navigate('/admin/doctors')}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View All →
              </button>
            </div>

            {doctorsLoading ? (
              <SkeletonTable rows={5} columns={4} />
            ) : allDoctors.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specialization</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {allDoctors.slice(0, 5).map((doctor) => (
                      <tr key={doctor.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">
                            Dr. {doctor.firstName} {doctor.lastName}
                          </div>
                          <div className="text-xs text-gray-500">{doctor.email}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{doctor.specialization}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              doctor.verificationStatus === 'VERIFIED'
                                ? 'bg-green-100 text-green-800'
                                : doctor.verificationStatus === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {doctor.verificationStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => navigate(`/admin/doctors/${doctor.id}`)}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No doctors registered yet</p>
              </div>
            )}
          </div>

          {/* Queue Monitoring Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Queue Monitoring</h3>
              <button
                onClick={() => navigate('/admin/queue-monitoring')}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View Details →
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{stats?.totalQueues || 0}</p>
                <p className="text-xs text-blue-700 mt-1">Total Queues</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{stats?.activeQueues || 0}</p>
                <p className="text-xs text-green-700 mt-1">Active Now</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{stats?.patientsWaiting || 0}</p>
                <p className="text-xs text-purple-700 mt-1">Patients Waiting</p>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="mt-6">
            <ActivityTimeline
              activities={activities}
              loading={doctorsLoading && pendingLoading}
              emptyMessage="No recent administrative activity"
            />
          </div>
        </div>

        {/* Right Column - Quick Actions & System Info */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <QuickActions actions={quickActions} loading={false} />

          {/* System Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Doctors:</span>
                <span className="font-medium text-gray-900">{doctorStats.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Verified:</span>
                <span className="font-medium text-green-600">{doctorStats.verified}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pending:</span>
                <span className="font-medium text-yellow-600">{doctorStats.pending}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Active:</span>
                <span className="font-medium text-blue-600">{doctorStats.active}</span>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Users:</span>
                  <span className="font-medium text-gray-900">{stats?.totalUsers || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Profile Card */}
          {!profileLoading && profile && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Profile</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="text-sm font-medium text-gray-900">
                    {profile.firstName} {profile.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">{profile.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Admin Level</p>
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                    {profile.adminLevel || 'ADMIN'}
                  </span>
                </div>
                <button
                  onClick={() => navigate('/admin/profile')}
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

export default AdminDashboard;
