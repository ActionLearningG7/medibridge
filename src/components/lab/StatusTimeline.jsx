/**
 * StatusTimeline Component
 * Visual timeline of order status progression
 */

import React from 'react';
import { Check, Circle } from 'lucide-react';
import { LAB_TRACKING_EVENT_LABELS } from '../../features/lab/constants';

export const StatusTimeline = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No events yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => {
        const isLast = index === events.length - 1;
        const label = LAB_TRACKING_EVENT_LABELS[event.eventType] || event.eventType;

        return (
          <div key={event.id || index} className="flex gap-4">
            {/* Timeline marker */}
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  event.completedAt
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {event.completedAt ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </div>
              {!isLast && (
                <div className="w-1 h-8 bg-gray-200 mt-2" />
              )}
            </div>

            {/* Timeline content */}
            <div className="pb-4">
              <p className="font-semibold text-gray-900">{label}</p>
              {event.description && (
                <p className="text-sm text-gray-600 mt-1">{event.description}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                {new Date(event.completedAt || event.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
