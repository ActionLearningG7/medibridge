/**
 * Queue Table Component
 * Displays queue entries with action buttons
 */

import { useState, useEffect } from 'react';
import { formatTime, formatWaitTime, computeWaitMinutes } from '../../utils/date';
import { getStatusConfig, getPriorityConfig } from '../../features/appointment/normalize';

const QueueTable = ({ entries, onStart, onComplete, onNoShow, onSkip, avgConsultationMinutes }) => {
  // Force re-render every 30 seconds to update wait times
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick(prevTick => prevTick + 1);
    }, 30000); // Update every 30 seconds

    return () => clearInterval(timer);
  }, []); // Empty dependency array is correct - interval should only be set once

  // Debug log for first entry
  useEffect(() => {
    if (entries.length > 0) {
      console.log('🔍 Queue Table - First entry debug:', {
        raw: entries[0]._raw,
        normalized: {
          tokenNumber: entries[0].tokenNumber,
          patientId: entries[0].patientId,
          patientIdMasked: entries[0].patientIdMasked,
          priority: entries[0].priority,
          status: entries[0].status,
          joinedAt: entries[0].joinedAt,
          waitMinutes: entries[0].waitMinutes,
        },
      });
    }
  }, [entries]);

  const getStatusBadge = (status) => {
    const config = getStatusConfig(status);
    return config.color;
  };

  const getPriorityBadge = (priority) => {
    const config = getPriorityConfig(priority);
    return config.color;
  };

  // Compute live wait time (recalculates on each render)
  const getLiveWaitMinutes = (entry) => {
    // If already normalized, use that
    if (entry.waitMinutes !== null && entry.waitMinutes !== undefined) {
      // Recalculate for WAITING status only
      if (entry.status === 'WAITING' && entry.joinedAt) {
        return computeWaitMinutes(entry.joinedAt);
      }
      return entry.waitMinutes;
    }

    // Fallback - compute from joinedAt
    if (entry.joinedAt) {
      return computeWaitMinutes(entry.joinedAt);
    }

    return null;
  };

  if (entries.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-12 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No patients in queue</h3>
        <p className="mt-1 text-sm text-gray-500">
          Patients will appear here when they join the queue
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">
          Today's Queue ({entries.length} patients)
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Token
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Wait Time
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {entries.map((entry, index) => {
              const liveWaitMinutes = getLiveWaitMinutes(entry);
              const statusConfig = getStatusConfig(entry.status);
              const priorityConfig = getPriorityConfig(entry.priority);

              return (
                <tr key={entry.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-lg font-bold text-primary-600">
                          {entry.tokenNumber}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {entry.patientName || `Patient #${entry.tokenNumber}` || 'Patient'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {entry.patientIdMasked || '--'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${priorityConfig.color}`}>
                      {priorityConfig.showIcon && (
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      )}
                      {priorityConfig.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatTime(entry.joinedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="font-medium text-gray-900">
                      {formatWaitTime(liveWaitMinutes)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {entry.status === 'CALLED' && (
                        <button
                          onClick={() => onStart(entry)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          title="Start Consultation"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Start
                        </button>
                      )}

                      {(entry.status === 'SERVING' || entry.status === 'IN_PROGRESS') && (
                        <button
                          onClick={() => onComplete(entry)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                          title="Complete Consultation"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Complete
                        </button>
                      )}

                      {(entry.status === 'WAITING' || entry.status === 'CALLED') && (
                        <>
                          <button
                            onClick={() => onNoShow(entry)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            title="Mark as No-Show"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            No-Show
                          </button>

                          {entry.status === 'CALLED' && (
                            <button
                              onClick={() => onSkip(entry)}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                              title="Skip Patient"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                              </svg>
                              Skip
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
        <p className="text-sm text-gray-700">
          Average consultation time: <span className="font-medium">{avgConsultationMinutes} minutes</span>
        </p>
        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={() => console.table(entries.map(e => ({
              token: e.tokenNumber,
              patient: e.patientIdMasked,
              priority: e.priority,
              status: e.status,
              joined: e.joinedAt?.toISOString(),
              wait: e.waitMinutes,
            })))}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Debug: Log entries
          </button>
        )}
      </div>
    </div>
  );
};

export default QueueTable;
