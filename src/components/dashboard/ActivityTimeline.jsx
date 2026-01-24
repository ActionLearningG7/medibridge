/**
 * Activity Timeline Component
 * Displays a vertical timeline of recent activities/events
 */

import { Clock, Calendar, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

const ActivityTimeline = ({ activities = [], loading = false, emptyMessage = 'No recent activity' }) => {
  const getActivityIcon = (type) => {
    const icons = {
      appointment: Calendar,
      queue: Clock,
      user: Users,
      success: CheckCircle,
      error: XCircle,
      warning: AlertCircle,
    };
    return icons[type] || Clock;
  };

  const getActivityColor = (type) => {
    const colors = {
      appointment: 'text-blue-600 bg-blue-100',
      queue: 'text-purple-600 bg-purple-100',
      user: 'text-gray-600 bg-gray-100',
      success: 'text-green-600 bg-green-100',
      error: 'text-red-600 bg-red-100',
      warning: 'text-yellow-600 bg-yellow-100',
    };
    return colors[type] || 'text-gray-600 bg-gray-100';
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="h-10 w-10 bg-gray-200 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />

        {/* Activity items */}
        <div className="space-y-6">
          {activities.map((activity, index) => {
            const Icon = getActivityIcon(activity.type);
            const colorClasses = getActivityColor(activity.type);

            return (
              <div key={activity.id || index} className="relative flex gap-4">
                {/* Icon */}
                <div
                  className={cn(
                    'relative z-10 flex items-center justify-center h-10 w-10 rounded-full flex-shrink-0',
                    colorClasses
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-1">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  {activity.description && (
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">{formatTime(activity.timestamp)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ActivityTimeline;
