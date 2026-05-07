import React from 'react';
import { Check, Circle, Clock, MapPin, FlaskConical, ClipboardCheck, Box, CheckCircle2 } from 'lucide-react';
import { LAB_TRACKING_EVENT_LABELS } from '../../features/lab/constants';

const EVENT_ICONS = {
  ORDER_PLACED: ClipboardCheck,
  PAYMENT_COMPLETED: CheckCircle2,
  PHLEBOTOMIST_ASSIGNED: FlaskConical,
  EN_ROUTE_TO_PATIENT: MapPin,
  ARRIVED_AT_PATIENT: MapPin,
  SAMPLE_COLLECTED: Box,
  EN_ROUTE_TO_LAB: MapPin,
  SAMPLES_RECEIVED_AT_LAB: FlaskConical,
  PROCESSING: Clock,
  REPORT_READY: ClipboardCheck,
  COMPLETED: CheckCircle2,
};

export const StatusTimeline = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
        <Clock className="w-10 h-10 text-gray-200 mx-auto mb-4" />
        <p className="font-black text-gray-300 uppercase tracking-widest text-[10px]">No activity logs found</p>
      </div>
    );
  }

  const sortedEvents = [...events].sort((a, b) =>
    new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt)
  );

  return (
    <div className="relative">
      {/* Central Vertical Line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-50" />

      <div className="space-y-10 relative">
        {sortedEvents.map((event, index) => {
          const Icon = EVENT_ICONS[event.eventType] || Clock;
          const isLatest = index === 0;
          const label = LAB_TRACKING_EVENT_LABELS[event.eventType] || event.eventType.replace(/_/g, ' ');

          return (
            <div key={event.id || index} className="flex gap-6 items-start group">
              {/* Timeline marker */}
              <div className="relative z-10">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm ${isLatest
                      ? 'bg-primary-600 text-white shadow-xl shadow-primary-200 scale-110'
                      : 'bg-white border-2 border-gray-50 text-gray-400 group-hover:border-primary-100 group-hover:text-primary-500'
                    }`}
                >
                  <Icon className={`${isLatest ? 'w-6 h-6 stroke-[2.5]' : 'w-5 h-5 stroke-[2]'}`} />
                </div>
              </div>

              {/* Timeline content */}
              <div className="flex-1 pt-1.5">
                <div className="flex items-center gap-3 mb-1">
                  <p className={`font-black uppercase tracking-widest text-[10px] ${isLatest ? 'text-primary-600' : 'text-gray-400'}`}>
                    {label}
                  </p>
                  {isLatest && (
                    <span className="flex h-1.5 w-1.5 rounded-full bg-primary-600 animate-ping" />
                  )}
                </div>
                <h4 className={`text-lg font-black tracking-tight leading-none mb-2 ${isLatest ? 'text-gray-900' : 'text-gray-500'}`}>
                  {event.description || 'System state update verified'}
                </h4>
                <div className="flex items-center gap-2">
                  <div className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${isLatest ? 'bg-primary-50 text-primary-700' : 'bg-gray-50 text-gray-400'}`}>
                    {new Date(event.completedAt || event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                    {new Date(event.completedAt || event.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
