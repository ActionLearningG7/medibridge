/**
 * StatusBanner Component
 * Contextual banner showing current order status
 */

import React from 'react';
import { AlertCircle, Clock, Navigation, MapPin, CheckCircle, Loader } from 'lucide-react';

const STATUS_CONFIGS = {
  waiting_assignment: {
    icon: <Clock className="h-5 w-5" />,
    title: 'Waiting for Assignment',
    message: 'A phlebotomist will be assigned shortly',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
  },
  en_route: {
    icon: <Navigation className="h-5 w-5" />,
    title: 'En Route',
    message: 'Phlebotomist is on the way to your location',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
  },
  arrived: {
    icon: <MapPin className="h-5 w-5" />,
    title: 'Arrived',
    message: 'Phlebotomist has arrived at your location',
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
  },
  sample_collected: {
    icon: <CheckCircle className="h-5 w-5" />,
    title: 'Sample Collected',
    message: 'Sample collected successfully',
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
  },
  in_transit: {
    icon: <Loader className="h-5 w-5" />,
    title: 'In Transit to Lab',
    message: 'Sample is on the way to the lab',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-800',
  },
  completed: {
    icon: <CheckCircle className="h-5 w-5" />,
    title: 'Completed',
    message: 'Sample processing has started',
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
  },
};

export const StatusBanner = ({ status, eta }) => {
  const config = STATUS_CONFIGS[status] || STATUS_CONFIGS.waiting_assignment;

  return (
    <div className={`${config.bg} border ${config.border} rounded-lg p-4 mb-6`}>
      <div className="flex items-center gap-3">
        <div className={config.text}>{config.icon}</div>
        <div className="flex-1">
          <p className={`font-semibold ${config.text}`}>{config.title}</p>
          <p className={`text-sm ${config.text} opacity-90`}>{config.message}</p>
        </div>
        {eta && (
          <div className="text-right">
            <p className={`text-xs font-medium ${config.text} opacity-75`}>ETA</p>
            <p className={`font-bold ${config.text}`}>{eta}</p>
          </div>
        )}
      </div>
    </div>
  );
};
