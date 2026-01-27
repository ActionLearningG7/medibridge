/**
 * Phlebotomist Dashboard
 * Overview of tasks, statistics, and quick actions
 */

import React from 'react';
import { AlertCircle, CheckCircle2, Clock, MapPin, TrendingUp } from 'lucide-react';
import { PageHeader, Card, CardHeader, CardTitle, CardContent } from '../../ui';
import { useGetPhlebotomistTasksQuery } from '../../features/lab/labApi';

export default function PhlebotomistDashboard() {
  const { data: tasks = [], isLoading, error } = useGetPhlebotomistTasksQuery();

  // Calculate statistics from tasks
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => ['COMPLETED', 'DELIVERED_TO_LAB'].includes(t.status)).length;
  const inProgressTasks = tasks.filter((t) => ['ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'SAMPLES_COLLECTED', 'IN_TRANSIT'].includes(t.status)).length;
  const pendingTasks = tasks.filter((t) => ['ASSIGNED', 'CREATED'].includes(t.status)).length;

  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here's your overview for today."
        actions={
          <div className="flex gap-2">
            {/* Optional action buttons */}
          </div>
        }
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-900">{totalTasks}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* In Progress Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">In Progress</p>
                <p className="text-3xl font-bold text-orange-600">{inProgressTasks}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{pendingTasks}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completion Rate Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
                <p className="text-3xl font-bold text-green-600">{completionRate}%</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Task Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Tasks Completed
                </span>
                <span className="text-sm text-gray-600">
                  {completedTasks} of {totalTasks}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${completionRate}%`,
                  }}
                />
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{inProgressTasks}</p>
                <p className="text-sm text-gray-600">In Progress</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{pendingTasks}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/phlebotomist/tasks"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-gray-900">My Tasks</span>
            </a>
            <a
              href="/phlebotomist/tracking"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-green-400 hover:bg-green-50 transition-colors"
            >
              <MapPin className="h-5 w-5 text-green-600" />
              <span className="font-medium text-gray-900">Live Tracking</span>
            </a>
            <a
              href="/phlebotomist/profile"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-colors"
            >
              <AlertCircle className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-gray-900">My Profile</span>
            </a>
            <a
              href="/phlebotomist/settings"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-colors"
            >
              <TrendingUp className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-900">Settings</span>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Loading/Error States */}
      {isLoading && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">Loading dashboard data...</p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">Failed to load dashboard data</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
