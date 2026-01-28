/**
 * Admin Lab Tasks Page
 * Manage lab collection tasks and assignments
 */

import React from 'react';

export default function AdminLabTasks() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Lab Tasks</h1>
          <p className="mt-2 text-gray-600">Manage and assign collection tasks</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="text-center py-12">
            <p className="text-gray-500">Lab Tasks Management Placeholder</p>
            <p className="text-sm text-gray-400 mt-2">Assign tasks to phlebotomists</p>
          </div>
        </div>
      </div>
    </div>
  );
}
