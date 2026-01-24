/**
 * Example Dashboard Page
 * Demonstrates usage of layout components
 * This is a demo/template file - customize for your needs
 */

import { PageHeader } from '../components/layout';
import { Calendar, Users, Clock, TrendingUp } from 'lucide-react';

const ExampleDashboard = () => {
  // Example stats data
  const stats = [
    {
      name: 'Total Appointments',
      value: '24',
      icon: Calendar,
      change: '+12%',
      changeType: 'positive',
    },
    {
      name: 'Patients Today',
      value: '8',
      icon: Users,
      change: '+3',
      changeType: 'positive',
    },
    {
      name: 'Avg Wait Time',
      value: '15 min',
      icon: Clock,
      change: '-5 min',
      changeType: 'positive',
    },
    {
      name: 'Satisfaction',
      value: '4.8/5',
      icon: TrendingUp,
      change: '+0.2',
      changeType: 'positive',
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Page Header with Breadcrumbs */}
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening today."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Dashboard' },
        ]}
        actions={
          <button className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
            <Calendar className="h-4 w-4 mr-2" />
            New Appointment
          </button>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Icon className="h-6 w-6 text-primary-600" />
                </div>
                <span
                  className={`text-sm font-medium ${
                    stat.changeType === 'positive'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </h3>
              <p className="text-sm text-gray-600">{stat.name}</p>
            </div>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Activity Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h2>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      JD
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      John Doe booked an appointment
                    </p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Appointments Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Upcoming Appointments
            </h2>
            <div className="text-sm text-gray-500">
              No upcoming appointments
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 p-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                <Calendar className="h-5 w-5 text-gray-400" />
                Book Appointment
              </button>
              <button className="w-full flex items-center gap-3 p-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                <Clock className="h-5 w-5 text-gray-400" />
                Join Queue
              </button>
              <button className="w-full flex items-center gap-3 p-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                <Users className="h-5 w-5 text-gray-400" />
                View Doctors
              </button>
            </div>
          </div>

          {/* Notifications Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Notifications
            </h2>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900">
                  New appointment confirmed
                </p>
                <p className="text-xs text-blue-700 mt-1">5 minutes ago</p>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-900">
                  Lab results are ready
                </p>
                <p className="text-xs text-green-700 mt-1">1 hour ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExampleDashboard;
